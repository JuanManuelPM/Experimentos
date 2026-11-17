import json,struct,tempfile,unittest,hashlib,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from build_uv_glb import project_uv,build_glb,make_gltf_binary,validate_source_output
from inspect_glb import read_glb,accessor

class UVBakeTests(unittest.TestCase):
 def test_front_and_back_uv_use_distinct_halves(self):
  vertices=[(-2,0,1),(2,2,1),(-2,2,-1),(2,0,-1)]
  normals=[(0,0,1),(0,0,1),(0,0,-1),(0,0,-1)]
  got=project_uv(vertices,normals)
  self.assertTrue(all(.01<=uv[0]<=.49 for uv in got[:2]));self.assertTrue(all(.51<=uv[0]<=.99 for uv in got[2:]))
  self.assertGreater(abs(got[0][0]-got[1][0]),.4)
  self.assertTrue(all(0<=v<=1 for row in got for v in row))
 def test_preserve_unmodified_glb_semantics_and_embed_real_png(self):
  # Hand-made GLB with 1 skin, 1 animation, basic triangles and degenerate UV.
  positions=b''.join(struct.pack('<fff',*p) for p in [(-1,-1,1),(1,-1,1),(0,1,1)])
  normals=b''.join(struct.pack('<fff',0,0,1) for _ in range(3))
  uv=b''.join(struct.pack('<ff',0,1) for _ in range(3))
  buffer=positions+normals+uv
  data={'asset':{'version':'2.0'},'buffers':[{'byteLength':len(buffer)}],
  'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':len(positions)}, {'buffer':0,'byteOffset':len(positions),'byteLength':len(normals)}, {'buffer':0,'byteOffset':len(positions)+len(normals),'byteLength':len(uv)}],
  'accessors':[{'bufferView':0,'componentType':5126,'type':'VEC3','count':3},{'bufferView':1,'componentType':5126,'type':'VEC3','count':3},{'bufferView':2,'componentType':5126,'type':'VEC2','count':3,'min':[0,1],'max':[0,1]}],
  'materials':[{'name':'Skin','pbrMetallicRoughness':{'baseColorFactor':[.85,.7,.5,1]}}],
  'meshes':[{'name':'Face','primitives':[{'attributes':{'POSITION':0,'NORMAL':1,'TEXCOORD_0':2},'material':0}]}],
  'skins':[{'joints':[0]}],'animations':[{'name':'Motion','channels':[],'samplers':[]}], 'nodes':[{}]}
  png=b'\x89PNG\r\n\x1a\n'+b'personal-canary-data'
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp); src=p/'input.glb';dst=p/'out.glb';atlas=p/'test.png';src.write_bytes(make_gltf_binary(data,buffer));atlas.write_bytes(png)
   source_sha=hashlib.sha256(src.read_bytes()).hexdigest()
   report=build_glb(src,atlas,dst,0,0,source_sha)
   _,before,_=read_glb(src);_,after,b=read_glb(dst)
   self.assertEqual(before['skins'],after['skins']);self.assertEqual(before['animations'],after['animations']);self.assertEqual(before['nodes'],after['nodes']);self.assertEqual(before['meshes'][0]['primitives'][0]['attributes'],after['meshes'][0]['primitives'][0]['attributes'])
   self.assertEqual(before['meshes'][0]['primitives'][0]['material'],0)
   self.assertEqual(after['meshes'][0]['primitives'][0]['material'],1)
   self.assertEqual(len(after['images']),1)
   self.assertEqual(after['skins'],before['skins']);self.assertEqual(report['status'],'PASS_SOURCE_RIG_ANIM_PRESERVED')
   uv_out=accessor(after,b,2);self.assertGreater(max(x for x,y in uv_out)-min(x for x,y in uv_out),.2)
   self.assertTrue(validate_source_output(src,dst,0,0)['ok'])
 def test_no_image_or_unknown_sha_is_rejected(self):
  with self.assertRaisesRegex(ValueError,'PNG_REQUIRED'):
   build_glb(Path('missing.glb'),Path('missing.png'),Path('out.glb'),0,0,'x')

if __name__=='__main__':unittest.main()
