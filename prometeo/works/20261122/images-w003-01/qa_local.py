from pathlib import Path
from PIL import Image, ImageStat
import json, hashlib
BASE=Path(__file__).parent
f=['00_hero_original.jpg','01_editorial_3000x2000.jpg','02_poster_1500x2250.jpg','03_social_1080x1350.jpg','04_comparacion_2400x1060.jpg']
res=[]
for name in f:
 p=BASE/name;assert p.exists() and p.stat().st_size>50000
 im=Image.open(p);im.verify();im=Image.open(p)
 assert im.mode=='RGB'
 assert min(ImageStat.Stat(im.resize((128,128))).stddev)>15
 res.append({'file':name,'px':im.size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':'PASS','entropy':'PASS'})
assert Image.open(BASE/f[0]).size==(1536,1024)
assert Image.open(BASE/f[1]).size==(3000,2000)
assert Image.open(BASE/f[2]).size==(1500,2250)
assert Image.open(BASE/f[3]).size==(1080,1350)
print(json.dumps({'tests':len(res)+4,'result':'PASS','files':res},indent=2))
(BASE/'QA.json').write_text(json.dumps({'tests':len(res)+4,'result':'PASS','files':res,'printPPI': 'NOT_VERIFIED','iccProof':'NOT_RUN','humanApproved':False,'browserCaptures':'SEE screenshots below'},indent=2))
