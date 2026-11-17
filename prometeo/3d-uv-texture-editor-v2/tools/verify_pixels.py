"""Compare real before/after Chromium screenshots in identical viewport."""
import sys,json
from pathlib import Path
from PIL import Image,ImageChops
folder=Path(sys.argv[1]);a=Image.open(folder/'01-before.png').convert('RGB');b=Image.open(folder/'02-after.png').convert('RGB')
if a.size!=b.size:raise SystemExit('SCREENSHOT_SIZE_MISMATCH')
# Only left viewport area, excluding overlay/UI, compared at same camera and light.
box=(18,100,int(a.width*.53),min(a.height-100,int(a.height*.8)))
diff=ImageChops.difference(a.crop(box),b.crop(box));changed=sum(1 for pix in diff.getdata() if max(pix)>35)
report={'status':'PASS' if changed>250 else 'FAIL_NO_VISIBLE_MESH_CHANGE','changedPixels':changed,'region':box,'images':[str(folder/'01-before.png'),str(folder/'02-after.png')]}
(folder/'PIXEL_DIFF.json').write_text(json.dumps(report,indent=2)+'\n');print('PIXEL_DIFF',report)
if report['status']!='PASS':sys.exit(3)
