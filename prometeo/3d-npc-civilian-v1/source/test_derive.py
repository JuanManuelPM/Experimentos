import unittest,copy
from derive import unpack,pack,modify,inspect
class TestCapsule(unittest.TestCase):
 def setUp(self):
  self.j={'asset':{'version':'2.0'},'scenes':[{'nodes':[0]}],'scene':0,'nodes':[{'name':'Rig:Head'},{'name':'Rig:Wrist.L'},{'name':'Rig:Wrist.R'}],'skins':[{'joints':[0,1,2]}],'meshes':[{'primitives':[{'attributes':{'TEXCOORD_0':2,'JOINTS_0':3,'WEIGHTS_0':4}}]}],'materials':[{'name':'Skin'},{'name':'Purple'},{'name':'LightBlue'},{'name':'Eye'},{'name':'Hair'}]}
 def test_roundtrip(self):
  j,b=unpack(pack(self.j,b'ABCD'));self.assertEqual(b,b'ABCD');self.assertEqual(inspect(j)['uv'],1)
 def test_reject_empty(self):
  with self.assertRaises(ValueError):unpack(b'bad')
 def test_reject_corrupt_length(self):
  with self.assertRaises(ValueError):unpack(pack(self.j,b'1234')[:-1])
 def test_two_colorways_share_geometry_and_rig(self):
  a,sa=modify(self.j,'azul');b,sb=modify(self.j,'granate')
  self.assertNotEqual(a['materials'],b['materials']);self.assertEqual(a['meshes'],b['meshes']);self.assertEqual(a['skins'],b['skins'])
  self.assertEqual(set(sa),set(sb));self.assertIn('socket_face',[n['name'] for n in a['nodes']]);self.assertTrue(all(sa.get(k) for k in ('root','face','hand_left','hand_right')))
 def test_keep_skin_eye_hair_exactly_intact(self):
  a,_=modify(self.j,'azul');b,_=modify(self.j,'granate')
  for original,ma,mb in zip(self.j['materials'],a['materials'],b['materials']):
   if original['name'] in ('Skin','Eye','Hair'):
    self.assertEqual(original,ma);self.assertEqual(ma,mb)
   else:self.assertNotEqual(ma['pbrMetallicRoughness'],mb['pbrMetallicRoughness'])
 def test_no_materials(self):
  with self.assertRaisesRegex(ValueError,'NO_MATERIALS'):modify({'nodes':[]},'azul')
if __name__=="__main__":unittest.main()
