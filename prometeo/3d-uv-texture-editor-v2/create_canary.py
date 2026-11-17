from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
im=Image.new('RGBA',(280,110),(0,0,0,0));d=ImageDraw.Draw(im);d.rounded_rectangle((8,8,272,102),radius=9,fill=(21,62,78,245),outline=(229,232,163,255),width=5);d.line((35,25,245,85),fill=(241,122,90,255),width=9);d.text((60,46),'UV / P2',fill=(255,255,255,255));path=root/'canary_label.png';im.save(path)
r={'schema':'prometeo.texture-recipe/v2','source':{'sha256':'8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b','version':'0.1.3'},'meshId':'Cube.014','sourceRef':{'meshIndex':2,'primitiveIndex':0,'meshName':'Cube.014','materialName':'Skin'},'uvMode':'front-back-planar-v1','atlasSize':1024,'baseColor':'#dcc6a1','flipY':False,'colorSpace':'sRGB','roughness':.86,'metalness':0,'layers':[{'kind':'image','filename':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'widthUV':.46,'cx':.25,'cy':.5,'opacity':1,'aspect':280/110}],'status':'CANARY_FOR_CIVIL_FACE_MESH_WITH_GENERATED_UV'}
(root/'TEXTURE_RECIPE.canary.json').write_text(json.dumps(r,indent=2,ensure_ascii=False)+'\n')
from render_recipe import render
render(r,root).convert('RGB').save(root/'canary_texture.png')
print('canary',hashlib.sha256((root/'canary_texture.png').read_bytes()).hexdigest())
