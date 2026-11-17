"""Original rigged and UV editable facial lip sculpt for one measured source face.
Facial detail only; the actual human, hair, clothing and skeleton are the CC0 model.
"""
import copy
import struct

FACE_PROFILE="Quaternius_Casual_Hoodie_bdae92bf"
# Measured on original Head mesh via source/analyze_head.py.
# Nose tip: (0,1.6449,0.1751); lower-center face (0,1.5829,0.1525).
# Cheeks: (+/-0.0377,1.5885,0.1443); upper cheek (+/-0.0447,1.6172,0.1424).
# v0.1.3: raised lip from y=1.588 to y=1.615 after reviewing real face screenshot;
ANCHORS=[
    (-.0275,1.6200,.1500),
    (-.0140,1.6170,.1540),
    (0.,1.6150,.1580),
    (.0140,1.6170,.1540),
    (.0275,1.6200,.1500),
]
def add_mouth(doc,bin):
    """Add 8-triangle lip silhouette to original rigged face, with real UV+weights."""
    j=copy.deepcopy(doc)
    matches=[(si,ji) for si,skin in enumerate(j.get("skins",[]))
        for ji,ni in enumerate(skin.get("joints",[]))
        if j["nodes"][ni].get("name")=="Head"]
    if len(matches)!=1:raise ValueError("MOUTH_HEAD_JOINT_MISSING")
    if not any(m.get("name")=="Skin" for m in j.get("materials",[])):raise ValueError("NO_SKIN_MATERIAL")
    skinIndex,headJoint=matches[0]
    pos=[];normals=[];uv=[];joints=[];weights=[]
    for i,(x,y,z) in enumerate(ANCHORS):
        for row,shift in enumerate((.0018,-.0018)):
            pos.extend([x,y+shift,z])
            normals.extend([0.,0.,1.])
            uv.extend([i/(len(ANCHORS)-1),1.-row])
            joints.extend([headJoint,0,0,0])
            weights.extend([1.,0.,0.,0.])
    indices=[]
    for i in range(len(ANCHORS)-1):
        a=2*i
        indices.extend([a,a+1,a+2,a+2,a+1,a+3])
    data=bytearray(bin)
    j.setdefault("bufferViews",[]);j.setdefault("accessors",[])
    def append(values,fmt,kind,ct,buffer_target,add_minmax=False):
        raw=struct.pack("<"+fmt*len(values),*values)
        offset=len(data)
        data.extend(raw)
        while len(data)%4:data.append(0)
        view=len(j["bufferViews"])
        j["bufferViews"].append({"buffer":0,"byteOffset":offset,"byteLength":len(raw),"target":buffer_target})
        n={"SCALAR":1,"VEC2":2,"VEC3":3,"VEC4":4}[kind]
        ac={"bufferView":view,"componentType":ct,"count":len(values)//n,"type":kind}
        if add_minmax:
            rows=list(zip(*(iter(values),)*n))
            ac["min"]=[min(row[k] for row in rows) for k in range(n)]
            ac["max"]=[max(row[k] for row in rows) for k in range(n)]
        ai=len(j["accessors"]);j["accessors"].append(ac)
        return ai
    pp=append(pos,"f","VEC3",5126,34962,True)
    nn=append(normals,"f","VEC3",5126,34962)
    tt=append(uv,"f","VEC2",5126,34962)
    jj=append(joints,"H","VEC4",5123,34962)
    ww=append(weights,"f","VEC4",5126,34962)
    ii=append(indices,"H","SCALAR",5123,34963)
    mat=len(j["materials"])
    j["materials"].append({"name":"FaceMouthLip_Shadow","pbrMetallicRoughness":{"baseColorFactor":[.24,.115,.09,1.],"metallicFactor":0.,"roughnessFactor":1.},"doubleSided":True})
    mesh=len(j["meshes"])
    j["meshes"].append({"name":"PROMETEO_FaceMouth_Original_UV","primitives":[{"attributes":{"POSITION":pp,"NORMAL":nn,"TEXCOORD_0":tt,"JOINTS_0":jj,"WEIGHTS_0":ww},"indices":ii,"material":mat,"mode":4}]})
    node=len(j["nodes"])
    j["nodes"].append({"name":"PROMETEO_FaceMouth_skinned","mesh":mesh,"skin":skinIndex,"extras":{"face_detail":"mouth","author":"PROMETEO Estudio 3D","face_profile":FACE_PROFILE}})
    j["scenes"][j.get("scene",0)].setdefault("nodes",[]).append(node)
    j["buffers"][0]["byteLength"]=len(data)
    return j,bytes(data)
