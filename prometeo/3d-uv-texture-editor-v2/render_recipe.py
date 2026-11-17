"""Reproduce por código las capas UV sin mouse. No modifica el GLB.
Uso: python render_recipe.py TEXTURE_RECIPE.json --images ./imagenes --out atlas.png
"""
import argparse, hashlib, json
from pathlib import Path
from PIL import Image, ImageColor

def render(recipe, images_dir):
    if recipe.get('schema') != 'prometeo.texture-recipe/v2' or recipe.get('atlasSize') != 1024:
        raise ValueError('TEXTURE_RECIPE_INVALID')
    if not recipe.get('meshId') or not recipe.get('source',{}).get('sha256'):
        raise ValueError('MISSING_TOPOLOGY_BINDING')
    width = recipe['atlasSize']
    out=Image.new('RGBA',(width,width),ImageColor.getrgb(recipe.get('baseColor','#ffffff'))+(255,))
    for layer in recipe.get('layers',[]):
        if layer.get('kind') != 'image':
            raise ValueError('UNKNOWN_LAYER_KIND')
        source=(Path(images_dir) / layer['filename']).resolve()
        if not source.is_relative_to(Path(images_dir).resolve()) or not source.is_file():
            raise ValueError('IMAGE_MISSING_OR_UNSAFE_PATH')
        data=source.read_bytes()
        if hashlib.sha256(data).hexdigest() != layer['sha256']:
            raise ValueError('IMAGE_SHA_MISMATCH')
        image=Image.open(source).convert('RGBA')
        dw=max(1,round(width * layer['widthUV']))
        dh=max(1,round(dw * image.height / image.width))
        image=image.resize((dw,dh),Image.Resampling.BICUBIC)
        alpha=float(layer['opacity'])
        if not 0<=alpha<=1: raise ValueError('OPACITY_INVALID')
        if alpha<1:image.putalpha(image.getchannel('A').point(lambda p:round(p*alpha)))
        x=round(width*layer['cx']-dw/2);y=round(width*layer['cy']-dh/2)
        out.alpha_composite(image,(x,y)) if x>=0 and y>=0 and x+dw<=width and y+dh<=width else paste_clipped(out,image,x,y)
    return out

def paste_clipped(out,img,x,y):
    w,h=out.size;x1=max(0,x);y1=max(0,y);x2=min(w,x+img.width);y2=min(h,y+img.height)
    if x2>x1 and y2>y1:out.alpha_composite(img.crop((x1-x,y1-y,x2-x,y2-y)),(x1,y1))

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('recipe');p.add_argument('--images',default='.');p.add_argument('--out',default='texture.png');args=p.parse_args()
    obj=json.loads(Path(args.recipe).read_text(encoding='utf8'))
    render(obj,args.images).convert('RGB').save(args.out,format='PNG')
    print('PNG_REAL_WRITTEN',args.out)
