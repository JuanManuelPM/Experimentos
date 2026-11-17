#!/usr/bin/env python3
"""Head topology/face surface probe, evidence for corrective mouth modeling."""
import json,struct,urllib.request
from pathlib import Path
from derive import URL,unpack
SIZES={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}
COMP={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def accessor(j,bin,i):
    a=j['accessors'][i];v=j['bufferViews'][a['bufferView']]
    fmt,n=SIZES[a['componentType']];c=COMP[a['type']]
    step=v.get('byteStride',n*c)
    at=v.get('byteOffset',0)+a.get('byteOffset',0)
    return [struct.unpack_from('<'+fmt*c,bin,at+k*step) for k in range(a['count'])]
def analyze():
    j,b=unpack(urllib.request.urlopen(URL,timeout=45).read())
    headnames=[(i,n) for i,n in enumerate(j['nodes']) if 'head' in n.get('name','').lower()]
    targets=[]
    for ni,n in headnames:
        if 'mesh' not in n:continue
        mesh=j['meshes'][n['mesh']]
        for pi,p in enumerate(mesh['primitives']):
            mat=j['materials'][p['material']]['name'] if 'material' in p else None
            pos=accessor(j,b,p['attributes']['POSITION'])
            xx=[v[0] for v in pos];yy=[v[1] for v in pos];zz=[v[2] for v in pos]
            item={'node':n.get('name'),'nodeIndex':ni,'meshIndex':n['mesh'],'meshName':mesh.get('name'),'primitive':pi,'material':mat,'count':len(pos),'range':{'x':[round(min(xx),4),round(max(xx),4)],'y':[round(min(yy),4),round(max(yy),4)],'z':[round(min(zz),4),round(max(zz),4)]}}
            if mat=='Skin':
                mid=(min(xx)+max(xx))/2
                ys=sorted(set(round(v[1],3) for v in pos))
                frontal=[]
                for v in pos:
                    if abs(v[0]-mid)<.17 and v[2]>max(zz)-.25:
                        frontal.append([round(a,4) for a in v])
                item['frontCandidates']=sorted(frontal,key=lambda k:-k[1])[:160]
                item['nearestYLevels']=ys[::max(1,len(ys)//70)]
            targets.append(item)
    return {'headNodes':[{'index':i,'name':n.get('name'),'mesh':n.get('mesh'),'skin':n.get('skin'),'children':n.get('children',[])} for i,n in headnames],'targets':targets,'skinHeadJoint':[(i,x) for i,x in enumerate(j['skins'][0]['joints']) if j['nodes'][x].get('name','').lower()=='head'],'scene':j.get('scene'), 'nodes':len(j['nodes'])}
if __name__=='__main__':
    out=Path('prometeo/3d-npc-civilian-v1/evidence/head_geometry.json')
    out.parent.mkdir(parents=True,exist_ok=True)
    result=analyze();out.write_text(json.dumps(result,indent=2))
    print(json.dumps({'nodes':result['headNodes'],'targets':[{'mat':x['material'],'range':x['range'],'count':x['count'],'frontCount':len(x.get('frontCandidates',[]))} for x in result['targets']]},indent=2))
