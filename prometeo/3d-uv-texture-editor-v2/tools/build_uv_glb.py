#!/usr/bin/env python3
"""Deterministic, source-preserving UV + PNG patch on CC0 civil GLB.

No Blender, no topology changes, no skin, animation or node edits. Only
TEXCOORD_0 accessor values and exactly one new material/texture/image.
"""
import argparse,copy,hashlib,json,math,struct
from pathlib import Path
from inspect_glb import read_glb,accessor,COMPONENT,N_COMPONENTS

SOURCE_SHA256='8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b'
PROJECTION='front-back-planar-v1'

def project_uv(positions,normals):
 if len(positions)!=len(normals) or not positions:raise ValueError('INVALID_PROJECTION_GEOMETRY')
 xs=[p[0] for p in positions];ys=[p[1] for p in positions]
 xmin,xmax,ymin,ymax=min(xs),max(xs),min(ys),max(ys)
 if not all(map(math.isfinite,[xmin,xmax,ymin,ymax])):raise ValueError('POSITION_NOT_FINITE')
 xspan=max(xmax-xmin,1e-8);yspan=max(ymax-ymin,1e-8)
 out=[]
 for p,n in zip(positions,normals):
  if not all(map(math.isfinite,(*p,*n))):raise ValueError('NONFINITE_VERTEX')
  offset=.02 if n[2]>=0 else .52
  u=offset+.46*(p[0]-xmin)/xspan
  v=.02+.96*(ymax-p[1])/yspan
  out.append((max(0,min(1,u)),max(0,min(1,v))))
 return out

def make_gltf_binary(data,buffer):
 obj=copy.deepcopy(data)
 raw=json.dumps(obj,separators=(',',':'),ensure_ascii=False).encode('utf-8')
 raw+=b' '*((-len(raw))%4)
 buffer+=b'\0'*((-len(buffer))%4)
 return struct.pack('<III',0x46546c67,2,12+8+len(raw)+8+len(buffer))+struct.pack('<II',len(raw),0x4e4f534a)+raw+struct.pack('<II',len(buffer),0x004e4942)+buffer

def _write_accessor(data,raw,index,values):
 a=data['accessors'][index]
 if a['componentType']!=5126 or a['type']!='VEC2' or a.get('sparse') or len(values)!=a['count']:
  raise ValueError('UV_ACCESSOR_NOT_WRITABLE')
 bv=data['bufferViews'][a['bufferView']]
 if bv.get('buffer',0)!=0:raise ValueError('UV_EXTERNAL_BUFFER')
 stride=bv.get('byteStride',8);start=bv.get('byteOffset',0)+a.get('byteOffset',0)
 if stride<8 or start+(len(values)-1)*stride+8>len(raw):raise ValueError('UV_OUT_OF_BOUNDS')
 for i,p in enumerate(values):struct.pack_into('<ff',raw,start+i*stride,*p)
 a['min']=[min(v[j] for v in values) for j in range(2)]
 a['max']=[max(v[j] for v in values) for j in range(2)]

def validate_source_output(source,out,mesh_idx,primitive_idx):
 a_raw,a,a_bin=read_glb(source);b_raw,b,b_bin=read_glb(out)
 for key in ['skins','animations','nodes','scenes','scene','extensionsUsed','extensionsRequired']:
  if a.get(key)!=b.get(key):return {'ok':False,'error':'GLB_METADATA_CHANGED_'+key}
 if len(a.get('meshes',[]))!=len(b.get('meshes',[])):return {'ok':False,'error':'MESH_COUNT_CHANGED'}
 if len(a.get('skins',[]))!=len(b.get('skins',[])):return {'ok':False,'error':'SKIN_COUNT_CHANGED'}
 for mi,(ma,mb) in enumerate(zip(a['meshes'],b['meshes'])):
  if len(ma['primitives'])!=len(mb['primitives']):return {'ok':False,'error':'PRIMITIVE_COUNT_CHANGED'}
  for pi,(pa,pb) in enumerate(zip(ma['primitives'],mb['primitives'])):
   if pa['attributes']!=pb['attributes'] or pa.get('indices')!=pb.get('indices') or pa.get('targets')!=pb.get('targets'):
    return {'ok':False,'error':'TOPOLOGY_ATTRIBUTES_CHANGED'}
   if (mi,pi)!=(mesh_idx,primitive_idx) and pa.get('material')!=pb.get('material'):
    return {'ok':False,'error':'UNTARGETED_MATERIAL_CHANGED'}
 for i,(aa,ab) in enumerate(zip(a['accessors'],b['accessors'])):
  if aa['count']!=ab['count'] or aa['componentType']!=ab['componentType'] or aa['type']!=ab['type']:
   return {'ok':False,'error':'ACCESSOR_METADATA_CHANGED'}
  # Every attribute other than TEXCOORD_0 must remain exactly the same.
  uv_indices={p['attributes']['TEXCOORD_0'] for m in a['meshes'] for p in m['primitives'] if 'TEXCOORD_0' in p['attributes']}
  if i not in uv_indices and accessor(a,a_bin,i)!=accessor(b,b_bin,i):return {'ok':False,'error':'NON_UV_ACCESSOR_CHANGED'}
 return {'ok':True,'sourcesha256':hashlib.sha256(a_raw).hexdigest(),'outputsha256':hashlib.sha256(b_raw).hexdigest(), 'originalSkinCount':len(a.get('skins',[])), 'outputSkinCount':len(b.get('skins',[])), 'animations':len(b.get('animations',[]))}

def build_glb(source,texture,out,mesh_idx,primitive_idx,expected_sha=SOURCE_SHA256):
 source,texture,out=Path(source),Path(texture),Path(out)
 if not texture.is_file() or not texture.read_bytes().startswith(b'\x89PNG\r\n\x1a\n'):raise ValueError('PNG_REQUIRED')
 before,data,buffer=read_glb(source)
 source_sha=hashlib.sha256(before).hexdigest()
 if expected_sha and source_sha!=expected_sha:raise ValueError('GLB_SHA_MISMATCH')
 if mesh_idx<0 or mesh_idx>=len(data.get('meshes',[])):raise ValueError('MESH_INDEX_INVALID')
 if primitive_idx<0 or primitive_idx>=len(data['meshes'][mesh_idx]['primitives']):raise ValueError('PRIMITIVE_INDEX_INVALID')
 data=copy.deepcopy(data);raw=bytearray(buffer)
 processed={};regions=[]
 for mi,mesh in enumerate(data['meshes']):
  for pi,p in enumerate(mesh.get('primitives',[])):
   attrs=p.get('attributes',{})
   if not {'TEXCOORD_0','POSITION','NORMAL'}.issubset(attrs):continue
   idx=attrs['TEXCOORD_0'];positions=accessor(data,raw,attrs['POSITION']);normals=accessor(data,raw,attrs['NORMAL'])
   if idx in processed:
    if processed[idx]!=[positions,normals]:raise ValueError('SHARED_UV_ACCESSOR_INCOMPATIBLE')
    continue
   coords=project_uv(positions,normals)
   _write_accessor(data,raw,idx,coords)
   processed[idx]=[positions,normals]
   regions.append({'meshIndex':mi,'primitiveIndex':pi,'uvAccessor':idx,'vertexCount':len(coords),'uvBounds':[min(x for x,y in coords),min(y for x,y in coords),max(x for x,y in coords),max(y for x,y in coords)]})
 target=data['meshes'][mesh_idx]['primitives'][primitive_idx]
 if 'TEXCOORD_0' not in target['attributes']:raise ValueError('TARGET_UV_MISSING')
 image=texture.read_bytes()
 raw+=b'\0'*((-len(raw))%4)
 image_start=len(raw);raw+=image
 data.setdefault('bufferViews',[]).append({'buffer':0,'byteOffset':image_start,'byteLength':len(image)})
 imgidx=len(data.setdefault('images',[]));data['images'].append({'bufferView':len(data['bufferViews'])-1,'mimeType':'image/png','name':texture.name})
 sampleridx=len(data.setdefault('samplers',[]));data['samplers'].append({'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071})
 texidx=len(data.setdefault('textures',[]));data['textures'].append({'sampler':sampleridx,'source':imgidx})
 old_material=target.get('material',0)
 mat=copy.deepcopy(data['materials'][old_material]);mat['name']=(mat.get('name') or 'Material')+'_UV_CANARY'
 mat.setdefault('pbrMetallicRoughness',{})['baseColorFactor']=[1,1,1,1]
 mat['pbrMetallicRoughness']['baseColorTexture']={'index':texidx,'texCoord':0}
 mat_idx=len(data['materials']);data['materials'].append(mat);target['material']=mat_idx
 data['buffers'][0]['byteLength']=len(raw)
 out.parent.mkdir(parents=True,exist_ok=True)
 out.write_bytes(make_gltf_binary(data,bytes(raw)))
 verify=validate_source_output(source,out,mesh_idx,primitive_idx)
 if not verify['ok']:
  out.unlink(missing_ok=True);raise ValueError(verify['error'])
 return {'status':'PASS_SOURCE_RIG_ANIM_PRESERVED','schema':'prometeo.uv-bake-receipt/v1','source':source_sha,'derived':verify['outputsha256'],'meshIndex':mesh_idx,'primitiveIndex':primitive_idx,'textureSha256':hashlib.sha256(image).hexdigest(),'algorithm':PROJECTION,'UVAccessorsWritten':len(processed),'regions':regions,'rights':'Source CC0 Quaternius, texture input local'}

if __name__=='__main__':
 p=argparse.ArgumentParser(description='Generate actual UV with source-preserving GLB material patch')
 p.add_argument('--source',required=True);p.add_argument('--texture',required=True);p.add_argument('--out',required=True);p.add_argument('--mesh-index',type=int,required=True);p.add_argument('--primitive-index',type=int,default=0);p.add_argument('--source-sha256',default=SOURCE_SHA256);p.add_argument('--report')
 args=p.parse_args();result=build_glb(args.source,args.texture,args.out,args.mesh_index,args.primitive_index,args.source_sha256)
 if args.report:Path(args.report).write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k!='regions'},ensure_ascii=False))
