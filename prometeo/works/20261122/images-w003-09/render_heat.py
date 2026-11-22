from PIL import Image,ImageDraw,ImageFont
import math, hashlib, csv, json, os
OUT='/mnt/data'
F='/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
if not os.path.exists(F):
 import glob
 F=glob.glob('/usr/share/fonts/opentype/inter/*Bold*')[0]
R='/usr/share/fonts/opentype/inter/Inter-Regular.otf'
if not os.path.exists(R):
 import glob
 R=glob.glob('/usr/share/fonts/opentype/inter/*Regular*')[0]
C={'paper':'#F5EFE1','dark':'#143C35','ink':'#19382F','green':'#47785C','mint':'#CEE3B9','sun':'#F3BD6B','rust':'#B86443','white':'#FFF9EF','muted':'#65786B','sky':'#DCE4DB'}
S=2
f_cache={}
def font(size,bold=False):
 key=(size,bold)
 if key not in f_cache: f_cache[key]=ImageFont.truetype(F if bold else R,int(size*S))
 return f_cache[key]
def create(w,h): return Image.new('RGB',(w*S,h*S),C['paper'])
def rect(draw,xy,fill,r=0):
 xy=[int(v*S) for v in xy]
 if r:draw.rounded_rectangle(xy,int(r*S),fill=fill)
 else:draw.rectangle(xy,fill=fill)
def text(draw,x,y,content,size=20,fill=None,bold=False,anchor=None):
 draw.text((int(x*S),int(y*S)),content,font=font(size,bold),fill=fill or C['ink'],anchor=anchor)
def line(draw,points,color,width): draw.line([(int(x*S),int(y*S)) for x,y in points],fill=color,width=max(1,int(width*S)),joint='curve')
def poly(draw,points,color):draw.polygon([(int(x*S),int(y*S)) for x,y in points],fill=color)
def ellipse(draw,box,fill): draw.ellipse(tuple(int(v*S) for v in box),fill=fill)
def base_scene():
 global S
 im=Image.new('RGB',(520*S,430*S),'#DCE4DB');d=ImageDraw.Draw(im)
 ellipse(d,(349,33,435,117),'#F0C679')
 poly(d,[(0,185),(77,167),(145,191),(212,170),(292,192),(380,169),(520,182),(520,430),(0,430)],'#C4C7B4')
 poly(d,[(0,48),(193,115),(193,272),(0,430)],'#B9785D')
 poly(d,[(520,53),(326,115),(326,272),(520,430)],'#B9785D')
 line(d,[(0,77),(193,143)],'#8E563F',8);line(d,[(0,156),(193,195)],'#8E563F',8)
 line(d,[(520,82),(326,143)],'#8E563F',8);line(d,[(520,162),(326,197)],'#8E563F',8)
 for pts in [[(20,115),(82,133),(82,230),(20,200)],[(115,155),(164,173),(164,245),(115,233)],[(500,114),(439,134),(439,232),(500,201)],[(410,155),(357,173),(357,246),(410,233)]]:
  poly(d,pts,'#EAD6AC');cx=sum(p[0] for p in pts)/4;cy=sum(p[1] for p in pts)/4
  sc=.81;poly(d,[(cx+(x-cx)*sc,cy+(y-cy)*sc) for x,y in pts],'#283F3B')
 for x,y in [(40,125),(135,164),(459,129),(377,166)]:line(d,[(x,y),(x,y+70)],'#B5BBA3',4)
 poly(d,[(193,272),(326,272),(520,430),(0,430)],'#9A9B86')
 poly(d,[(193,272),(217,282),(106,430),(0,430)],'#D8C9A9')
 poly(d,[(326,272),(303,282),(411,430),(520,430)],'#D8C9A9')
 poly(d,[(217,282),(303,282),(413,430),(105,430)],'#696D63')
 poly(d,[(238,316),(280,316),(297,333),(224,333)],'#D3C59C')
 poly(d,[(216,357),(307,357),(335,373),(191,373)],'#D3C59C')
 for pp in [[(0,401),(115,410)],[(0,356),(147,367)],[(520,401),(405,410)],[(520,356),(374,367)]]:line(d,pp,'#ADA488',4)
 for p in [[(60,385),(100,385),(87,420),(47,420)],[(470,385),(430,385),(442,420),(481,420)]]:line(d,p+p[:1],'#B2A88B',4)
 ellipse(d,(250,254,262,266),'#203C35');line(d,[(256,265),(255,287)],'#203C35',4);line(d,[(255,287),(242,312)],'#203C35',4);line(d,[(255,287),(269,309)],'#203C35',4)
 return im
base=base_scene()
def tree_scene():
 im=base.copy();d=ImageDraw.Draw(im,'RGB')
 poly(d,[(0,340),(180,338),(300,430),(0,430)],'#668677')
 line(d,[(35,420),(45,347),(69,293),(81,216),(92,153),(88,107),(90,69)],'#4A4330',21)
 line(d,[(75,263),(49,202),(32,162),(17,130)],'#4A4330',12)
 line(d,[(83,223),(124,182),(139,142),(157,88)],'#4A4330',12)
 for x,y,r in [(45,116,62),(100,77,69),(162,117,55),(76,161,65),(10,203,41),(168,172,44)]:ellipse(d,(x-r,y-r,x+r,y+r),'#376E50')
 for x,y,r in [(20,83,30),(87,59,27),(145,89,28),(46,178,28),(121,164,31),(192,152,18)]:ellipse(d,(x-r,y-r,x+r,y+r),'#83A975')
 for x,y,r in [(42,96,13),(126,67,16),(173,132,12),(91,196,10)]:ellipse(d,(x-r,y-r,x+r,y+r),'#BAD0A2')
 return im
shade=tree_scene()
def scene(dst,x,y,w,h,with_tree):
 src=shade if with_tree else base
 src=src.resize((int(w*S),int(h*S)),Image.Resampling.LANCZOS)
 dst.paste(src,(int(x*S),int(y*S)))
def card(d,x,y,w,h,color):rect(d,(x,y,x+w,y+h),color,8)
def poster():
 im=create(1240,1754);d=ImageDraw.Draw(im)
 rect(d,(0,0,1240,365),C['dark'])
 text(d,70,42,'MICROCLIMAS / 09',23,'#C3D6AA',True)
 text(d,952,43,'CIENCIA VISUAL',18,'#C3D6AA',True)
 text(d,64,99,'EL CALOR',125,C['white'],True)
 text(d,64,210,'OCULTO.',125,C['sun'],True)
 text(d,72,328,'Por qué la sombra de un árbol cambia la calle.',24,C['white'])
 text(d,70,391,'CON ÁRBOLES',23,C['green'],True)
 text(d,667,391,'SIN SOMBRA DE ÁRBOLES',23,C['rust'],True)
 scene(im,64,442,548,459,True);scene(im,628,442,548,459,False)
 rect(d,(65,907,1176,962),'#E6E6D1',4)
 text(d,84,917,'MISMA GEOMETRÍA EN AMBAS VISTAS.',20,C['ink'],True)
 text(d,84,941,'Escena conceptual: no representa una medición.',17,C['ink'])
 text(d,68,997,'DOS ESTUDIOS, DOS MEDIDAS DISTINTAS',29,C['ink'],True)
 for x in (65,628):card(d,x,1064,548,229,C['white'])
 text(d,95,1070,'1,6 °C',83,C['green'],True)
 text(d,95,1163,'menos, en promedio',23,C['ink'],True)
 text(d,95,1200,'Bosques urbanos vs. áreas no verdes.',18,C['ink'])
 text(d,95,1230,'Revisión de 308 estudios (EPA).',17,C['muted'])
 text(d,95,1254,'No es una lectura de estas calles.',17,C['muted'])
 text(d,654,1070,'>2×',87,C['rust'],True)
 text(d,654,1163,'proporción que declaró confort',21,C['ink'],True)
 text(d,654,1200,'Bajo árboles vs. sectores sin árboles.',18,C['ink'])
 text(d,654,1230,'Tres calles, Montevideo, 2018–19.',17,C['muted'])
 text(d,654,1254,'Confort percibido, no temperatura.',17,C['muted'])
 text(d,70,1325,'QUÉ CAMBIA FÍSICAMENTE',30,C['ink'],True)
 xs=[65,441,817]
 for i,x in enumerate(xs):card(d,x,1390,359,180,'#DCE9D7' if i==1 else '#EEE5D2')
 hdr=['01  /  SOMBRA','02  /  EVAPOTRANSPIRACIÓN','03  /  RADIACIÓN']
 body=[('Menos sol directo llega al','suelo y al cuerpo.'),('Las hojas evaporan agua:','el proceso consume calor.'),('Menos exposición directa','reduce el calor radiante.')]
 for i,x in enumerate(xs):
  text(d,x+22,1417,hdr[i],20,C['green'] if i==1 else C['rust'],True)
  text(d,x+22,1481,body[i][0],18,C['ink']);text(d,x+22,1510,body[i][1],18,C['ink'])
 line(d,[(65,1611),(1175,1611)],'#99A598',2)
 text(d,70,1622,'FUENTES · EPA, Benefits of Trees and Vegetation; estudio de Montevideo (2024).',17,C['ink'],True)
 text(d,70,1658,'No se infieren grados del aire ni causalidad numérica de la ilustración.',16,C['muted'])
 text(d,70,1709,'PROMETEO / IMAGES W003 · OBRA ORIGINAL · 22 NOV 2026',15,C['muted'],True)
 return im
def mobile():
 im=create(390,2050);d=ImageDraw.Draw(im)
 rect(d,(0,0,390,284),C['dark'])
 text(d,20,26,'MICROCLIMAS / 09',14,'#C3D6AA',True)
 text(d,18,70,'EL CALOR',58,C['white'],True)
 text(d,18,129,'OCULTO.',59,C['sun'],True)
 text(d,21,211,'Lo que cambia bajo un árbol',17,C['white'])
 text(d,21,240,'no es un solo termómetro.',17,C['white'])
 text(d,21,303,'CON ÁRBOLES',19,C['green'],True)
 scene(im,18,344,354,295,True)
 text(d,21,660,'SIN SOMBRA DE ÁRBOLES',19,C['rust'],True)
 scene(im,18,700,354,295,False)
 text(d,20,1013,'MISMA GEOMETRÍA; SOLO CAMBIA EL ÁRBOL.',12,C['ink'],True)
 text(d,20,1041,'Escena conceptual, no medición local.',13,C['muted'])
 text(d,20,1082,'DOS EVIDENCIAS REALES',23,C['ink'],True)
 card(d,18,1121,354,170,C['white'])
 text(d,33,1134,'1,6 °C',56,C['green'],True)
 text(d,34,1200,'menos de media en bosques urbanos',15,C['ink'],True)
 text(d,34,1230,'vs. áreas no verdes · revisión EPA',13,C['muted'])
 text(d,34,1256,'308 estudios · no es esta calle',12,C['muted'])
 card(d,18,1307,354,172,C['white'])
 text(d,33,1318,'>2×',57,C['rust'],True)
 text(d,34,1386,'proporción que declaró confort',15,C['ink'],True)
 text(d,34,1414,'bajo árboles · Montevideo (2024)',13,C['muted'])
 text(d,34,1440,'Confort percibido, no grados',12,C['muted'])
 text(d,20,1515,'TRES MECANISMOS',23,C['ink'],True)
 arr=[('01  SOMBRA','Menos radiación solar llega al suelo'),('02  EVAPOTRANSPIRACIÓN','Las hojas evaporan agua y enfrían'),('03  RADIACIÓN','Menor exposición directa al sol')]
 for i,(head,descr) in enumerate(arr):
  y=1560+i*105;card(d,18,y,354,92,'#DCE9D7' if i==1 else '#EEE5D2')
  text(d,31,y+15,head,17,C['green'] if i==1 else C['rust'],True)
  text(d,31,y+53,descr,13,C['ink'])
 text(d,20,1899,'FUENTES  ·  EPA / MONTEVIDEO 2024',13,C['ink'],True)
 text(d,20,1925,'Estudios distintos, magnitudes distintas.',12,C['muted'])
 text(d,20,1952,'También influyen viento, agua y hora.',12,C['muted'])
 text(d,20,2002,'PROMETEO / IMAGES W003 · 09',12,C['muted'],True)
 return im
if __name__=='__main__':
 p=poster();m=mobile()
 p.save(f'{OUT}/el_calor_oculto_W003_09_A4_300dpi.png',dpi=(300,300),optimize=True)
 m.save(f'{OUT}/el_calor_oculto_W003_09_mobile.png',optimize=True)
 print('A4',p.size,'mobile',m.size)
 for name in ['el_calor_oculto_W003_09_A4_300dpi.png','el_calor_oculto_W003_09_mobile.png']:
  data=open(f'{OUT}/{name}','rb').read();print(name,len(data),hashlib.sha256(data).hexdigest())
 # Verify matching base before overlay by programmatic single source.
 assert base.size==shade.size
 print('SCENE_BASE_SHARING_PASS',base.size)