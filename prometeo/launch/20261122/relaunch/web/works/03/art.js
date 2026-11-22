// ARCHIVO ABIERTO: originales digitales generados a resolución nativa en canvas.
// No imágenes de terceros, no upscale. La artista y su archivo son ficticios.
export const WORKS=[
{id:"01",title:"La noche en las hojas",year:2026,series:"Botánica",medium:"Cianotipo digital",dimensions:"64 × 82 cm (escala conceptual)",seed:137,kind:"cyan",desc:"Un herbario imaginario, suspendido entre la luz y la superficie.",provenance:"Obra digital original generada para esta ficción. No existe una pieza física ni propietarios externos."},
{id:"02",title:"Corte de terreno",year:2025,series:"Estratos",medium:"Monotipo digital",dimensions:"74 × 92 cm (escala conceptual)",seed:82,kind:"earth",desc:"Capas de pigmento y desgaste registran un paisaje que no fue fotografiado.",provenance:"Proceso digital original. Los estratos son dibujo generativo, no un estudio geológico real."},
{id:"03",title:"Habitación para el aire",year:2026,series:"Arquitecturas",medium:"Dibujo de arquitectura digital",dimensions:"70 × 90 cm (escala conceptual)",seed:202,kind:"architecture",desc:"La planta de un lugar que sólo puede visitarse con la mirada.",provenance:"Dibujo original. No se basa en un edificio ni plano de terceros."},
{id:"04",title:"Rastro de incendio",year:2024,series:"Gestos",medium:"Pintura digital",dimensions:"80 × 102 cm (escala conceptual)",seed:343,kind:"gesture",desc:"La memoria del movimiento se conserva en una superficie erosionada.",provenance:"Pintura digital generativa original. No es fotografía de una pintura física."},
{id:"05",title:"Marea de sal",year:2025,series:"Estratos",medium:"Monotipo digital",dimensions:"60 × 78 cm (escala conceptual)",seed:411,kind:"earth",desc:"En el blanco del terreno quedan las huellas de lo que ya no está.",provenance:"Composición original con semilla propia y tratamiento cromático independiente."},
{id:"06",title:"Jardín negativo",year:2026,series:"Botánica",medium:"Cianotipo digital",dimensions:"58 × 76 cm (escala conceptual)",seed:995,kind:"cyan",desc:"Un inventario imposible de formas vegetales, construido desde la sombra.",provenance:"Composición digital original; no es registro de espécimen botánico auténtico."}
];
function random(seed){let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296)}
const rgba=(a,b,c,d)=>"rgba("+a+","+b+","+c+","+d+")";
function line(ctx,pts,width,color){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
function dots(c,r,n,w,h,ink){for(let i=0;i<n;i++){c.globalAlpha=.015+r()*.2;c.fillStyle=ink;let s=.2+r()*1.7;c.fillRect(r()*w,r()*h,s,s)}c.globalAlpha=1}
function cyan(c,r,w,h,seed){
let g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,seed===995?"#02151d":"#051529");g.addColorStop(.58,"#16435c");g.addColorStop(1,"#07172a");c.fillStyle=g;c.fillRect(0,0,w,h);
for(let i=0;i<60;i++){let x=r()*w,y=r()*h,rad=w*(.05+r()*.12),g=c.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,"rgba(192,240,222,.09)");g.addColorStop(1,"rgba(192,240,222,0)");c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2)}
function branch(x,y,len,ang,depth,alpha){if(!depth)return;let ex=x+Math.cos(ang)*len,ey=y+Math.sin(ang)*len;line(c,[[x,y],[ex,ey]],Math.max(.45,depth*1.1),rgba(204,235,217,alpha));for(let i=1;i<=3;i++){let t=i/4,bx=x+(ex-x)*t,by=y+(ey-y)*t;for(let d of [-1,1]){let a=ang+d*(.65+r()*.55),l=len*(.3+r()*.19),px=bx+Math.cos(a)*l,py=by+Math.sin(a)*l;c.fillStyle=rgba(192,237,214,alpha*.37);c.beginPath();c.ellipse((bx+px)/2,(by+py)/2,l*.54,l*.09,a,0,Math.PI*2);c.fill();line(c,[[bx,by],[px,py]],.45,rgba(235,255,224,alpha*.65))}}if(depth>1)branch(ex,ey,len*(.6+r()*.16),ang+(r()-.5)*.4,depth-1,alpha*.91)}
for(let i=0;i<(seed===995?15:10);i++)branch(w*(.02+r()*.94),h*(.85+r()*.19),h*(.14+r()*.14),-Math.PI/2+(r()-.5)*1.3,4,.43+r()*.39);
for(let i=0;i<900;i++){c.fillStyle=rgba(208,239,215,r()*.12);c.beginPath();c.arc(r()*w,r()*h,.2+r()*2.3,0,Math.PI*2);c.fill()}dots(c,r,15000,w,h,"#e2f8e2")
}
function earth(c,r,w,h,seed){
let cool=seed===411,g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,cool?"#d5d9cc":"#d8bf9f");g.addColorStop(1,cool?"#8d9a8b":"#c69c7e");c.fillStyle=g;c.fillRect(0,0,w,h);
c.save();c.translate(-w*.12,h*.04);c.rotate(cool?-.28:.18);
const cols=cool?[[25,53,59],[128,145,130],[228,221,200],[81,107,111]]:[[98,50,41],[207,94,56],[60,66,62],[234,184,141]];
for(let b=0;b<31;b++){let y=h*(b/27-.08)+(r()-.5)*h*.03,amp=h*(.014+r()*.045),k=cols[b%4];
c.beginPath();c.moveTo(-w*.5,y);for(let x=-w*.5;x<=w*1.6;x+=w/45)c.lineTo(x,y+Math.sin(x/w*7+b*.8)*amp+Math.cos(x/w*21+b)*amp*.2);for(let x=w*1.6;x>=-w*.5;x-=w/45)c.lineTo(x,y+h*(.015+r()*.035)+Math.sin(x/w*7+b)*amp*.35);c.closePath();c.fillStyle=rgba(...k,.22+r()*.48);c.fill();
for(let i=0;i<35;i++){let x=(r()*1.6-.3)*w,yy=y+(r()-.5)*amp;line(c,[[x,yy],[x+w*(.02+r()*.13),yy+(r()-.5)*amp]],.4+r()*2,rgba(...k,.06+r()*.2))}
}c.restore();
for(let j=0;j<7;j++){c.beginPath();c.ellipse(r()*w,r()*h,w*(.04+r()*.15),h*(.015+r()*.032),r()*3,0,Math.PI*2);c.lineWidth=1+r()*8;c.strokeStyle=rgba(40,44,43,.08+r()*.2);c.stroke()}dots(c,r,26000,w,h,cool?"#18373a":"#6d3429")
}
function architecture(c,r,w,h){
c.fillStyle="#e6e0d5";c.fillRect(0,0,w,h);let grad=c.createLinearGradient(0,0,w,h);grad.addColorStop(0,"rgba(90,75,62,.18)");grad.addColorStop(1,"rgba(255,255,255,.05)");c.fillStyle=grad;c.fillRect(0,0,w,h);
let poly=[[130,1110],[405,180],[790,470],[785,1075],[540,1230]];c.fillStyle="#b9b9ae";c.beginPath();poly.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fill();line(c,[...poly,poly[0]],2,"#353b3b");
for(let j=0;j<130;j++){let t=j/130,x=130+(405-130)*t,y=1110+(180-1110)*t;line(c,[[x,y],[920+(x-405)*.27,395+(y-180)*.27]],.3,rgba(44,46,49,.08+r()*.19))}
for(let j=0;j<36;j++){let t=j/36,x=405+(790-405)*t,y=180+(470-180)*t;line(c,[[x,y],[x+10,y+605]],.7,rgba(43,49,50,.08+j*.006))}
c.fillStyle="#424949";c.fillRect(351,470,320,537);c.fillStyle="#c1c6c0";c.fillRect(368,484,288,514);c.fillStyle="#252e31";c.fillRect(430,535,175,455);c.fillStyle="#aaaead";c.fillRect(445,554,140,425);
for(let j=0;j<3200;j++){let x=r()*w,y=r()*h;line(c,[[x,y],[x+r()*17,y-r()*7]],.25,rgba(30,38,38,r()*.18))}line(c,[[50,1150],[950,1150]],1.4,"#3f4544");dots(c,r,24000,w,h,"#26343a")
}
function gesture(c,r,w,h){
c.fillStyle="#282021";c.fillRect(0,0,w,h);let g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,"#583b37");g.addColorStop(.5,"#211b20");g.addColorStop(1,"#6b483d");c.globalAlpha=.65;c.fillStyle=g;c.fillRect(0,0,w,h);c.globalAlpha=1;
const colors=["#c8755e","#e2bb9c","#a18f79","#30262a","#9b4134","#e6cdb7","#77716b"];
for(let i=0;i<150;i++){c.save();c.translate(w*(.06+r()*.86),h*(.04+r()*.9));c.rotate(-.8+r()*1.55);c.globalAlpha=.12+r()*.55;c.fillStyle=colors[Math.floor(r()*colors.length)];let size=h*(.03+r()*.22);for(let z=0;z<5;z++)c.fillRect((z-2)*4,-size*.5,w*(.018+r()*.055),size*(.3+r()*.9));c.restore()}c.globalAlpha=1;
for(let i=0;i<240;i++){let x=r()*w,y=r()*h;line(c,[[x,y],[x+w*(r()-.5)*.3,y-h*(.03+r()*.12)]],.5+r()*6,rgba(236,198,161,.02+r()*.14))}dots(c,r,24000,w,h,"#dfc6b0")
}
export function renderArtwork(canvas,work,pixelWidth=600){
let w=Math.min(3000,Math.max(280,Math.round(pixelWidth))),h=Math.round(w*1.29);canvas.width=w;canvas.height=h;
const c=canvas.getContext("2d",{alpha:false}),r=random(work.seed);c.save();c.scale(w/1000,h/1290);
if(work.kind==="cyan")cyan(c,r,1000,1290,work.seed);if(work.kind==="earth")earth(c,r,1000,1290,work.seed);if(work.kind==="architecture")architecture(c,r,1000,1290);if(work.kind==="gesture")gesture(c,r,1000,1290);c.restore();return {width:w,height:h}
}