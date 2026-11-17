import sys,unittest,tempfile,struct,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from tools.inspect_glb import inspect
class GLBInspectorTests(unittest.TestCase):
 def test_inspects_actual_binary_fixture_and_bounds(self):
  with tempfile.TemporaryDirectory() as folder:
   raw_uv=struct.pack('<ffffff',0.,0.,1.,0.,0.,1.)
   obj={'asset':{'version':'2.0'},'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':len(raw_uv)}],'accessors':[{'bufferView':0,'componentType':5126,'count':3,'type':'VEC2'}],'meshes':[{'name':'Mock','primitives':[{'attributes':{'TEXCOORD_0':0}}]}]}
   j=json.dumps(obj).encode();j+=b' '*(-len(j)%4);binary=raw_uv+b'\x00'*(-len(raw_uv)%4);content=struct.pack('<III',0x46546C67,2,12+8+len(j)+8+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary
   p=Path(folder)/'mock.glb';p.write_bytes(content)
   result=inspect(p);self.assertEqual(result['summary']['withUV'],1);self.assertEqual(result['profiles'][0]['bounds']['maxU'],1);self.assertEqual(result['profiles'][0]['topology']['triangles'],1);self.assertEqual(result['summary']['usableUVPrimitives'],1);self.assertEqual(result['profiles'][0]['uvUsable'],True)
if __name__=='__main__':unittest.main()
