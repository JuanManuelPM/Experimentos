"""Pure stdlib GLB 2.0 UV inspector. Does not modify the source model."""
import hashlib,json,struct,sys
from pathlib import Path
COMPONENT={5120:('b',1),5121:('B',1),5122:('h',2),5123:('H',2),5125:('I',4),5126:('f',4)}
N_COMPONENTS={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}
def read_glb(filename):
 blob=Path(filename).read_bytes()
 if len(blob)<20:raise ValueError('GLB_HEADER_SHORT')
 magic,version,total=struct.unpack_from('<III',blob)
 if magic!=0x46546C67 or version!=2 or total!=len(blob):raise ValueError('GLB_HEADER_INVALID')
 offset=12;chunks={}
 while offset<len(blob):
  length,kind=struct.unpack_from('<II',blob,offset);offset+=8
  if offset+length>len(blob):raise ValueError('GLB_CHUNK_INVALID')
  chunks[kind]=blob[offset:offset+length];offset+=length
 if 0x4E4F534A not in chunks or 0x004E4942 not in chunks:raise ValueError('GLB_JSON_OR_BIN_MISSING')
 data=json.loads(chunks[0x4E4F534A]);return blob,data,chunks[0x004E4942]
def accessor(data,binary,index):
 a=data['accessors'][index];v=data['bufferViews'][a['bufferView']]
 if v.get('buffer',0)!=0:raise ValueError('EXTERNAL_BUFFER_UNSUPPORTED')
 fmt,n=COMPONENT[a['componentType']];width=N_COMPONENTS[a['type']];stride=v.get('byteStride',fmt if False else n*width)
 off=v.get('byteOffset',0)+a.get('byteOffset',0)
 if off+(a['count']-1)*stride+n*width>len(binary):raise ValueError('ACCESSOR_OUT_OF_RANGE')
 if a.get('sparse'):raise ValueError('SPARSE_UV_NOT_SUPPORTED')
 return [struct.unpack_from('<'+fmt*width,binary,off+i*stride) for i in range(a['count'])]
def inspect(path):
 raw,data,binary=read_glb(path);rows=[]
 for mesh_index,m in enumerate(data.get('meshes',[])):
  for i,p in enumerate(m.get('primitives',[])):
   attrs=p.get('attributes',{})
   row={'meshId':m.get('name') or f'mesh_{mesh_index}','meshIndex':mesh_index,'primitiveIndex':i,'uvAttribute':'TEXCOORD_0','materialIndex':p.get('material'),'topology':{},'rigged':all(x in attrs for x in ['JOINTS_0','WEIGHTS_0'])}
   for key,name in [('POSITION','positions'),('TEXCOORD_0','uvVertices'),('JOINTS_0','joints'),('WEIGHTS_0','weights')]:
    row['topology'][name]=data['accessors'][attrs[key]]['count'] if key in attrs else 0
   row['topology']['indices']=data['accessors'][p['indices']]['count'] if 'indices' in p else None
   if 'TEXCOORD_0' in attrs:
    uv=accessor(data,binary,attrs['TEXCOORD_0']);row['uvSha256']=hashlib.sha256(b''.join(struct.pack('<ff',float(x),float(y)) for x,y in uv)).hexdigest()
    row['bounds']={'minU':min(v[0] for v in uv),'minV':min(v[1] for v in uv),'maxU':max(v[0] for v in uv),'maxV':max(v[1] for v in uv)}
    bounds=row['bounds'];row['uvUsable']=bounds['maxU']-bounds['minU']>1e-5 and bounds['maxV']-bounds['minV']>1e-5
    if not row['uvUsable']:row['warning']='UV_DEGENERATE_COLLAPSED_TO_POINT'
    if row['topology']['indices'] and row['topology']['indices']%3:row['warning']='INDEX_COUNT_NOT_TRIANGLES'
    row['topology']['triangles']=(row['topology']['indices'] or len(uv))//3
   else:row['error']='UV_MISSING'
   rows.append(row)
 return {'schema':'prometeo.uv-profile/v2','source':{'name':Path(path).name,'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'version':'0.1.3' if hashlib.sha256(raw).hexdigest()=='8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b' else 'unknown'},'summary':{'meshes':len(data.get('meshes',[])),'primitives':len(rows),'skins':len(data.get('skins',[])),'animations':len(data.get('animations',[])),'withUV':sum('uvSha256' in row for row in rows),'usableUVPrimitives':sum(row.get('uvUsable',False) for row in rows)},'profiles':rows,'status':'STRUCTURE_INSPECTED_NOT_WEBGL'}
if __name__=='__main__':
 profile=inspect(sys.argv[1]);destination=sys.argv[2] if len(sys.argv)>2 else 'UV_PROFILE.real.json';Path(destination).parent.mkdir(parents=True,exist_ok=True);Path(destination).write_text(json.dumps(profile,indent=2,ensure_ascii=False)+'\n');print('INSPECT_GLTF',json.dumps(profile['summary']),profile['source']['sha256']);
 if not profile['summary']['withUV'] or not profile['summary']['skins']:sys.exit(2)
 if '--allow-derived' in sys.argv:
  if profile['summary']['usableUVPrimitives'] != profile['summary']['primitives']:sys.exit(3)
 elif profile['source']['version']!='0.1.3':sys.exit(2)
