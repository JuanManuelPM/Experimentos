#!/usr/bin/env python3
"""PROMETEO: derive two civilian style variants from real CC0 rigged GLB, preserve UV/rig."""
import argparse, copy, hashlib, json, re, struct, urllib.request
from pathlib import Path
REV="fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08"
URL="https://raw.githubusercontent.com/LuanDucate/Ducz.CharacterCreator/"+REV+"/public/models/Male/Casual_Hoodie.glb"
BLOB="bdae92bff1aef0bf58b6bee99a3ea22a53cfd1c1"
def unpack(b):
    if len(b)<20 or b[:4]!=b'glTF': raise ValueError("INVALID_HEADER")
    _,v,n=struct.unpack_from("<4sII",b)
    if v!=2 or n!=len(b):raise ValueError("INVALID_LENGTH_VERSION")
    at=12; js=bn=None
    while at<len(b):
        n,t=struct.unpack_from("<I4s",b,at);at+=8
        value=b[at:at+n];at+=n
        if t==b'JSON':js=json.loads(value)
        if t==b'BIN\x00':bn=value
    if js is None or bn is None:raise ValueError("MISSING_CHUNKS")
    return js,bn
def pack(js,bn):
    j=json.dumps(js,separators=(',',':'),ensure_ascii=False).encode()
    j+=b' '*(-len(j)%4);bn+=b'\0'*(-len(bn)%4)
    return struct.pack("<4sII",b'glTF',2,28+len(j)+len(bn))+struct.pack("<I4s",len(j),b'JSON')+j+struct.pack("<I4s",len(bn),b'BIN\x00')+bn
def inspect(j):
    pp=[p for m in j.get('meshes',[]) for p in m.get('primitives',[])]
    nn=[n.get("name","") for n in j.get("nodes",[])]
    return dict(meshes=len(j.get("meshes",[])),primitives=len(pp),uv=sum("TEXCOORD_0" in p.get("attributes",{}) for p in pp),weighted=sum("JOINTS_0" in p.get("attributes",{}) and "WEIGHTS_0" in p.get("attributes",{}) for p in pp),skins=len(j.get("skins",[])),materials=[m.get("name","") for m in j.get("materials",[])],node_names=nn,images=len(j.get("images",[])),animations=len(j.get("animations",[])))
def modify(j,name):
    if name not in ('azul','granate'):raise ValueError('INVALID_VARIANT')
    o=copy.deepcopy(j)
    palette={'azul':{'purple':(.10,.32,.48),'lightblue':(.38,.46,.58)},'granate':{'purple':(.46,.12,.22),'lightblue':(.50,.36,.29)}}[name]
    mm=o.get("materials",[])
    if not mm:raise ValueError("NO_MATERIALS")
    changed=0
    for m in mm:
        key=m.get("name","").lower().replace("_","")
        if key not in palette:continue
        p=m.setdefault("pbrMetallicRoughness",{})
        old=p.get("baseColorFactor",[1,1,1,1])
        p["baseColorFactor"]=[*palette[key],old[3]]
        m.setdefault("extras",{})["prometeo_variant"]=name
        changed+=1
    if changed<2:raise ValueError("CLOTHING_MATERIALS_NOT_FOUND")
    o.setdefault("asset",{}).setdefault("extras",{})["prometeo_variant"]=name
    o.setdefault("scenes",[{"nodes":[]}]);nodes=o.setdefault("nodes",[])
    scene=o.get("scene",0)
    nodes.append({"name":"socket_root","extras":{"prometeo_socket":"root"}})
    o["scenes"][scene].setdefault("nodes",[]).append(len(nodes)-1)
    found={"root":True}
    for k,pattern in [("face",r"(?:head|neck)"),("hand_left",r"(?:left.?hand|hand[._]?l|wrist[._]?l)"),("hand_right",r"(?:right.?hand|hand[._]?r|wrist[._]?r)")]:
        matches=[i for i,n in enumerate(nodes) if re.search(pattern,n.get("name",""),re.I)]
        if matches:
            nodes.append({"name":"socket_"+k,"extras":{"prometeo_socket":k}})
            nodes[matches[0]].setdefault("children",[]).append(len(nodes)-1)
            found[k]=True
    return o,found
def build(source,output):
    output.mkdir(parents=True,exist_ok=True)
    b=source.read_bytes() if source else urllib.request.urlopen(URL,timeout=40).read()
    actual=hashlib.sha1(b"blob "+str(len(b)).encode()+b"\x00"+b).hexdigest()
    if actual!=BLOB:raise ValueError("VENDOR_BLOB_SHA_CHANGED "+actual)
    j,bin=unpack(b); info=inspect(j)
    if not info["uv"]:raise ValueError("NO_UV")
    if not info["skins"] or not info["weighted"]:raise ValueError("NOT_RIGGED")
    if not any('head' in n.lower() for n in info['node_names']):raise ValueError("MISSING_HEAD")
    result=[]
    for name in ("azul","granate"):
        new,sockets=modify(j,name)
        if not all(sockets.get(k) for k in ('root','face','hand_left','hand_right')):raise ValueError("MISSING_SOCKET_ANCHOR")
        path=output/("civil_"+name+".glb")
        data=pack(new,bin);path.write_bytes(data)
        reread,_=unpack(data);a=inspect(reread)
        if (a["uv"],a["skins"],a["weighted"],a["meshes"])!=(info["uv"],info["skins"],info["weighted"],info["meshes"]):raise ValueError("GEOMETRY_RIG_REGRESSION")
        result.append({"skin":name,"filename":path.name,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest(),"sockets":sockets,"rig_skins":a["skins"],"uv_primitives":a["uv"]})
    report={"status":"SOURCE_GLB_STRUCTURAL_PASS","source":{"url":URL,"commit":REV,"git_blob":actual,"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),"license":"CC0-1.0"},"source_inspection":info,"variants":result,"rig_and_uv_preserved":True,"webgl_capture":"NOT_RUN","art_approval":"NOT_RUN","movement_controller":"OUT_OF_SCOPE"}
    (output/"BUILD_REPORT.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
    return report
if __name__=="__main__":
    p=argparse.ArgumentParser();p.add_argument("--source",type=Path);p.add_argument("--output",type=Path,default=Path("dist"));a=p.parse_args()
    print(json.dumps(build(a.source,a.output),indent=2,ensure_ascii=False))
