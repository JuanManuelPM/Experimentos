#!/usr/bin/env python3
"""EL CALOR OCULTO · composición editorial raster original.
Imagen central: ilustración original generada para esta obra (sin datos térmicos simulados).
Requisitos: Pillow, fuentes Inter instaladas. Ejecutar: python render_heat.py --art PATH --out DIR
"""
import argparse, os, math, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path

PAPER='#F6F0E4'; INK='#202A27'; GREEN='#235548'; MUTED='#596C60'; ORANGE='#C75B35'; WARM='#F2D6BC'; COOL='#DDE9DD'; WHITE='#FFFFFF'; DARK='#1B2925'; HAIR='#D6D3C8'
FONTDIR='/usr/share/fonts/opentype/inter'
FONT_REG=FONTDIR+'/Inter-Regular.otf'
FONT_MED=FONTDIR+'/Inter-Medium.otf'
FONT_SEMI=FONTDIR+'/Inter-SemiBold.otf'
FONT_BOLD=FONTDIR+'/Inter-Bold.otf'
FONT_BLACK=FONTDIR+'/InterDisplay-Black.otf'
FONT_SANS='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

def font(size, weight='reg'):
    path=dict(reg=FONT_REG,med=FONT_MED,semi=FONT_SEMI,bold=FONT_BOLD,black=FONT_BLACK).get(weight,FONT_REG)
    if not os.path.exists(path): path=FONT_SANS
    return ImageFont.truetype(path,int(size))

def text(d, xy, s, size, color=INK, weight='reg', anchor=None, spacing=5):
    d.multiline_text(xy,s,font=font(size,weight),fill=color,anchor=anchor,spacing=spacing)

def bbox_width(d,s,size,weight='reg'):
    x=d.textbbox((0,0),s,font=font(size,weight))
    return x[2]-x[0]

def wrap(d, sentence, max_width, size, weight='reg'):
    lines=[]; line=''
    for word in sentence.split():
        trial=f'{line} {word}'.strip()
        if bbox_width(d,trial,size,weight)>max_width and line:
            lines.append(line);line=word
        else:line=trial
    if line:lines.append(line)
    return lines

def paragraph(d, x,y, s, maxw, size=36, color=INK, weight='reg', leading=1.34):
    for line in wrap(d,s,maxw,size,weight):
        text(d,(x,y),line,size,color,weight); y+=int(size*leading)
    return y

def round_rect(d, box, fill, r=30, outline=None, width=3):
    d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=width)

def capsule(d,box,fill,label,fg,size):
    round_rect(d,box,fill,(box[3]-box[1])//2)
    cx=(box[0]+box[2])//2; cy=(box[1]+box[3])//2
    text(d,(cx,cy),label,size,fg,'bold',anchor='mm')

def load_art(path):
    art=Image.open(path).convert('RGB')
    w,h=art.size
    # The source has empty upper / lower cream borders. Use the aligned scenes only.
    return art.crop((0,int(h*.12),w,int(h*.87)))

def image_cover(im,w,h):
    ratio=max(w/im.width,h/im.height)
    new=(round(im.width*ratio),round(im.height*ratio))
    z=im.resize(new,Image.Resampling.LANCZOS)
    px=(z.width-w)//2;py=(z.height-h)//2
    return z.crop((px,py,px+w,py+h))

def hero(im, d,art,rect):
    x,y,w,h=rect
    im.paste(image_cover(art,w,h),(x,y))
    d.line([(x+w//2,y),(x+w//2,y+h)],fill=PAPER,width=5)
    capsule(d,(x+35,y+28,x+385,y+95),GREEN,'CALLE ARBOLADA',WHITE,26)
    capsule(d,(x+w//2+35,y+28,x+w//2+380,y+95),ORANGE,'SIN SOMBRA',WHITE,26)

def small_header(d,x,y,label,num=None):
    if num:text(d,(x,y),num,25,ORANGE,'bold')
    text(d,(x+(80 if num else 0),y),label,25,GREEN,'bold')

def bars_icon(d,x,y,typ,color):
    if typ=='shade':
        d.ellipse((x+27,y+3,x+105,y+82),outline=color,width=8)
        d.line([(x+70,y+83),(x+70,y+119)],fill=color,width=8)
        for delta in (-45,0,45): d.line([(x+70+delta,y+129),(x+60+delta,y+157)],fill=color,width=6)
        d.arc((x+5,y+90,x+135,y+145),5,165,fill=color,width=7)
    elif typ=='ground':
        for yy in (y+85,y+104,y+123):d.line([(x+12,yy),(x+132,yy)],fill=color,width=8)
        for xx in (x+45,x+86,x+122):d.arc((xx-30,y,xx+30,y+75),200,340,fill=color,width=6)
    else:
        d.line([(x+45,y+155),(x+45,y+90)],fill=color,width=8)
        d.ellipse((x+3,y+28,x+90,y+104),outline=color,width=7)
        for xx in (x+105,x+138):
            d.arc((xx-9,y+5,xx+23,y+57),160,330,fill=color,width=7)

def make_print(art,out):
    W,H=2000,3000; m=115
    im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im)
    text(d,(m,60),'CIUDAD / CLIMA / 09',28,GREEN,'bold')
    text(d,(W-m,60),'ENSAYO VISUAL · 2026',24,MUTED,'med',anchor='ra')
    d.line([(m,111),(W-m,111)],fill=GREEN,width=4)
    text(d,(m,142),'EL CALOR',144,INK,'black')
    text(d,(m,286),'OCULTO',144,INK,'black')
    paragraph(d,m,460,'Dos calles bajo el mismo sol. La sombra cambia la energía que reciben las personas y las superficies.', W-2*m,39,INK,leading=1.22)
    hero(im,d,art,(m,587,W-2*m,664))
    text(d,(m,1276),'ESCENA ILUSTRADA · no es una medición ni una simulación térmica',22,MUTED,'med')
    # Evidence band: independent findings, no false comparability.
    y=1346
    round_rect(d,(m,y,1162,y+435),GREEN,30)
    text(d,(m+49,y+37),'SUPERFICIES · CONDICIONES DE PICO',24,'#DFE9D9','bold')
    text(d,(m+46,y+91),'11–25 °C',124,WHITE,'black')
    paragraph(d,m+51,y+251,'menos en superficies sombreadas frente a materiales expuestos al sol.',940,35,WHITE,'med',1.3)
    text(d,(m+51,y+386),'EPA [1] · RANGO REPORTADO, NO PROMEDIO',22,'#DDE9DD','bold')
    round_rect(d,(1192,y,W-m,y+435),WARM,30)
    text(d,(1232,y+37),'CONFORT HUMANO · MONTEVIDEO',24,INK,'bold')
    text(d,(1230,y+98),'> 2×',113,ORANGE,'black')
    paragraph(d,1235,y+245,'en la proporción que reportó confort bajo árboles frente a sectores sin sombra.',600,32,INK,'med',1.27)
    text(d,(1235,y+385),'ESTUDIO DE CAMPO [2] · 2024',22,GREEN,'bold')
    # 3 mechanisms
    small_header(d,m,1854,'TRES MECANISMOS, UNA MISMA CALLE')
    mech=[('01','MENOS RADIACIÓN','La copa intercepta parte del sol directo y proyecta sombra.','shade',GREEN),('02','PISO MENOS CALIENTE','Menos energía solar absorbida reduce la temperatura de los materiales.','ground',ORANGE),('03','EVAPOTRANSPIRACIÓN','La evaporación del agua de hojas y suelo consume energía.','leaf',GREEN)]
    cardw=564;gap=38
    for i,(num,title,desc,typ,col) in enumerate(mech):
        x=m+i*(cardw+gap)
        round_rect(d,(x,1927,x+cardw,2290),WHITE,20,HAIR,2)
        bars_icon(d,x+25,1960,typ,col)
        text(d,(x+195,1971),num,26,ORANGE,'black')
        text(d,(x+195,2024),title,28,INK,'bold')
        paragraph(d,x+33,2140,desc,cardw-66,28,MUTED,'reg',1.28)
    # distinction panel
    round_rect(d,(m,2353,W-m,2760),DARK,24)
    text(d,(m+42,2391),'NO CONFUNDAS TRES MAGNITUDES',32,WHITE,'black')
    defs=[('SUPERFICIE','Qué tan caliente está el pavimento.'),('AIRE','Qué indica un termómetro protegido del sol.'),('RADIANTE','Radiación que recibe una persona del entorno.')]
    for i,(t,desc) in enumerate(defs):
        x=m+46+i*588
        if i:d.line([(x-22,2485),(x-22,2690)],fill='#567167',width=2)
        text(d,(x,2481),t,28,'#C3DDC9','bold')
        paragraph(d,x,2540,desc,535,30,WHITE,'reg',1.3)
    # footer
    paragraph(d,m,2800,'La magnitud del enfriamiento depende de hora, especie, humedad, viento, materiales y geometría urbana. Las cifras citadas proceden de estudios distintos y NO son pronósticos para esta calle.',W-2*m,25,INK,leading=1.31)
    text(d,(m,2940),'FUENTES [1] U.S. EPA · Environmental Benefits of Green Infrastructure  [2] Cruz y col. · Montevideo, 2024  [3] NASA · Land Surface Temperature',24,MUTED,'med')
    printpath=out/'el_calor_oculto_A4_300dpi.png'
    # A4 at 300ppi uses 2480x3508. Resample exactly; no misleading DPI claim.
    target=im.resize((2480,3508),Image.Resampling.LANCZOS)
    target.save(printpath,dpi=(300,300),optimize=True)
    im.save(out/'el_calor_oculto_master.png',optimize=True)
    return printpath

def common_mobile():
    im=Image.new('RGB',(1080,1920),PAPER)
    return im,ImageDraw.Draw(im)

def mobile_title(d,n,title):
    text(d,(62,50),f'EL CALOR OCULTO  /  {n} DE 3',26,GREEN,'bold')
    d.line([(62,106),(1018,106)],fill=GREEN,width=3)
    text(d,(62,143),title,92,INK,'black')

def mobile_footer(d,n,desc):
    d.line([(62,1836),(1018,1836)],fill=HAIR,width=2)
    text(d,(62,1861),desc,20,MUTED,'med')
    text(d,(1005,1861),f'{n}/3',22,GREEN,'bold',anchor='ra')

def make_mobile(art,out):
    # 1/3 physical scene
    im,d=common_mobile();mobile_title(d,1,'DOS VEREDAS')
    paragraph(d,62,286,'La sombra modifica la energía que llega a personas y superficies.',950,36,INK,leading=1.33)
    hero(im,d,art,(62,431,956,540))
    text(d,(62,1001),'ILUSTRACIÓN · MISMO ESCENARIO CONCEPTUAL',20,MUTED,'med')
    round_rect(d,(62,1066,1018,1640),GREEN,28)
    text(d,(104,1117),'EN SUPERFICIES SOMBREADAS',30,'#D4E7D9','bold')
    text(d,(100,1195),'11–25 °C',116,WHITE,'black')
    paragraph(d,105,1376,'menos que las temperaturas máximas de materiales sin sombra, en condiciones descritas por la EPA.',865,39,WHITE,'med',1.37)
    text(d,(105,1586),'EPA [1] · NO ES TEMPERATURA DEL AIRE',22,'#D4E7D9','bold')
    paragraph(d,62,1703,'Rango ilustrativo publicado. No predice cuántos grados bajará tu calle.',950,27,MUTED,leading=1.2)
    mobile_footer(d,1,'Fuente: EPA [1] · datos exactos en PROCEDENCIA.csv')
    im.save(out/'el_calor_oculto_movil_01.png',optimize=True)
    # 2/3 mechanisms and legend
    im,d=common_mobile();mobile_title(d,2,'¿QUÉ CAMBIA?')
    data=[('01','LA COPA INTERCEPTA SOL','Menos radiación directa llega al pavimento y a la piel.',GREEN,'shade'),('02','EL PISO ABSORBE MENOS','A la sombra, los materiales suelen calentarse menos.',ORANGE,'ground'),('03','EL AGUA SE EVAPORA','Hojas y suelo pueden disipar energía por evapotranspiración.',GREEN,'leaf')]
    for i,(num,tit,body,c,typ) in enumerate(data):
        yy=302+i*337
        round_rect(d,(62,yy,1018,yy+301),WHITE,25,HAIR,2)
        bars_icon(d,95,yy+50,typ,c)
        text(d,(274,yy+48),num,29,c,'black')
        text(d,(274,yy+96),tit,37,INK,'bold')
        paragraph(d,274,yy+161,body,705,31,MUTED,'reg',1.28)
    round_rect(d,(62,1375,1018,1799),DARK,22)
    text(d,(98,1411),'NO ES LO MISMO:',35,WHITE,'black')
    paragraph(d,98,1482,'SUPERFICIE: calor del pavimento.  AIRE: medición meteorológica.  RADIANTE: energía térmica que recibe el cuerpo.',850,35,WHITE,leading=1.34)
    mobile_footer(d,2,'Mecanismos: EPA [1] · Distinción térmica: NASA [3]')
    im.save(out/'el_calor_oculto_movil_02.png',optimize=True)
    # 3/3 field evidence + limitations
    im,d=common_mobile();mobile_title(d,3,'¿Y LAS PERSONAS?')
    text(d,(62,313),'MONTEVIDEO · ESTUDIO DE CAMPO',29,GREEN,'bold')
    round_rect(d,(62,383,1018,919),WARM,30)
    text(d,(97,437),'> 2×',164,ORANGE,'black')
    paragraph(d,100,664,'la proporción de personas que reportó confort térmico bajo los árboles, comparado con sectores sin sombra.',854,35,INK,'med',1.33)
    text(d,(101,864),'TRES CALLES · VERANO 2018–2019 · [2]',25,GREEN,'bold')
    text(d,(62,1004),'¿ES IGUAL EN TODAS PARTES?',42,INK,'black')
    paragraph(d,62,1080,'No. Importan la especie y el tamaño del árbol, la humedad del suelo, el viento, la orientación, los materiales y la hora.',930,37,INK,leading=1.31)
    round_rect(d,(62,1390,1018,1788),DARK,24)
    text(d,(100,1431),'TRES FUENTES, TRES FUNCIONES',30,'#BCE1CA','bold')
    paragraph(d,100,1496,'[1] EPA: rango de temperatura superficial y mecanismos. [2] Cruz y col. (2024): percepción de confort en Montevideo. [3] NASA: suelo ≠ aire.',864,32,WHITE,leading=1.28)
    mobile_footer(d,3,'Referencias completas: PROCEDENCIA.csv')
    im.save(out/'el_calor_oculto_movil_03.png',optimize=True)

def main():
    p=argparse.ArgumentParser();p.add_argument('--art',required=True);p.add_argument('--out',default='.')
    a=p.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
    art=load_art(a.art)
    printpath=make_print(art,out);make_mobile(art,out)
    print(json.dumps({f.name: {'size':Image.open(f).size,'bytes':f.stat().st_size} for f in out.glob('*.png')},indent=2))
if __name__=='__main__':main()