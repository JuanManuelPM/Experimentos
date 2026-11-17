import hashlib, json, sys, tempfile, unittest
from pathlib import Path
from PIL import Image
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from render_recipe import render
class RecipeTests(unittest.TestCase):
 def test_real_png_overlay(self):
  with tempfile.TemporaryDirectory() as d:
   file=Path(d)/'layer.png';Image.new('RGBA',(64,32),(255,0,0,255)).save(file)
   obj={'schema':'prometeo.texture-recipe/v2','atlasSize':1024,'source':{'sha256':'test-fixture-only'},'meshId':'Fixture','baseColor':'#ffffff','layers':[{'kind':'image','filename':'layer.png','sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'widthUV':.25,'cx':.5,'cy':.5,'opacity':1}]}
   result=render(obj,d);self.assertEqual(result.size,(1024,1024));self.assertEqual(result.getpixel((512,512)),(255,0,0,255));self.assertEqual(result.getpixel((50,50)),(255,255,255,255));
 def test_sha_and_traversal_rejected(self):
  with tempfile.TemporaryDirectory() as d:
   file=Path(d)/'layer.png';Image.new('RGBA',(8,8)).save(file)
   obj={'schema':'prometeo.texture-recipe/v2','atlasSize':1024,'source':{'sha256':'test-fixture-only'},'meshId':'Fixture','layers':[{'kind':'image','filename':'layer.png','sha256':'bad','widthUV':.1,'cx':.5,'cy':.5,'opacity':1}]}
   with self.assertRaisesRegex(ValueError,'IMAGE_SHA_MISMATCH'):render(obj,d)
   obj['layers'][0]['filename']='../elsewhere.png'
   with self.assertRaisesRegex(ValueError,'IMAGE_MISSING_OR_UNSAFE_PATH'):render(obj,d)
if __name__=='__main__':unittest.main()
