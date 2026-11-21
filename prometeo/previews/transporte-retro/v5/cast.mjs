import * as THREE from 'three';
// TRANSPORTE 05: original authored 2.5D hand-illustrated paper actors.
// Every figure has independent hair/head geometry, coat cut, expression and accessory.
const ACTORS={
 ines:['bob','trench',.94,'paper'],raul:['cap','vest',1.19,'satchel'],
 flora:['curls','dress',.86,'book'],dario:['slick','suit',1.04,'tie'],
 elena:['bun','cardigan',.95,'glasses'],tomas:['messy','sweater',1.02,'stripe'],
 mila:['braids','pinafore',.84,'scarf'],oscar:['part','overcoat',1.21,'cane'],
 luz:['afro','raincoat',.96,'book'],conductor:['visor','uniform',1.12,'badge'],
 viajero:['quiff','peacoat',1.03,'satchel']
};
const ink='#19212a',gold='#e6c793',ivory='#eed9b9';
function rgb(n){return '#'+(n>>>0).toString(16).padStart(6,'0')}
function p(c,s,col,line=ink,w=5){
 const path=new Path2D(s);if(col){c.fillStyle=col;c.fill(path)}
 if(line){c.strokeStyle=line;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke(path)}
}
function e(c,x,y,rx,ry,col,line=null,w=3){
 c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=col;c.fill();
 if(line){c.lineWidth=w;c.strokeStyle=line;c.stroke()}
}
function l(c,a,b,col=ink,w=3){
 c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);
 c.lineCap='round';c.strokeStyle=col;c.lineWidth=w;c.stroke()
}
function inkFigure(c,id,person,mode){
 let [hair,clothes,jaw,item]=ACTORS[id]||ACTORS.viajero;
 let skin=rgb(person.skin||0xba8466),cloth=rgb(person.coat||0x3c6071),hairColor=rgb(person.hair||0x29232a);
 let sitting=mode==='sit',wave=mode==='greet',stepping=mode==='step';
 let y=sitting?64:0,cy=140+y,top=293+y,low=578+(sitting?15:0),wide=clothes==='overcoat'||clothes==='vest'?18:0;
 c.clearRect(0,0,440,850);
 c.save();c.translate(4,8);
 // Offset lithographic print, silhouette boots and separately posed knees.
 c.globalAlpha=.18;e(c,211,795,108,18,'#06080d');c.globalAlpha=1;
 if(sitting){
  p(c,'M 166 560 Q 131 573 142 645 L 170 701 Q 195 707 207 674 L 198 636 L 252 628 L 318 652 Q 355 658 354 622 L 278 576 L 239 558 Z','#333a46');
  p(c,'M 204 562 Q 219 598 274 611 L 333 649 Q 347 652 357 627 L 310 593 Q 260 550 231 552 Z','#2b3440');
  p(c,'M 145 683 Q 175 672 198 686 L 213 718 Q 192 737 130 721 Q 123 709 145 683 Z','#382f30');
  p(c,'M 326 630 Q 351 624 366 653 L 374 674 Q 346 693 312 666 Z','#382d31');
 }else{
  let kick=stepping?24:0;
  p(c,'M 165 553 L 206 553 L 218 626 L '+(188-kick)+' 755 L '+(144-kick)+' 746 L 157 634 Z','#37404d');
  p(c,'M 207 552 L 261 551 L 260 633 L '+(266+kick)+' 744 L '+(224+kick)+' 754 L 212 644 Z','#29313c');
  p(c,'M '+(140-kick)+' 733 Q '+(170-kick)+' 716 '+(196-kick)+' 737 L '+(218-kick)+' 764 Q '+(187-kick)+' 782 '+(121-kick)+' 765 Z','#382f31');
  p(c,'M '+(223+kick)+' 733 Q '+(251+kick)+' 718 '+(276+kick)+' 740 L '+(285+kick)+' 764 Q '+(255+kick)+' 777 '+(212+kick)+' 762 Z','#382d31');
 }
 p(c,'M 188 '+(229+y)+' Q 209 '+(211+y)+' 230 '+(230+y)+' L 235 '+(303+y)+' L 184 '+(306+y)+' Z',skin);
 // Coat blocks: custom-cut silhouettes, never composed of 3D primitives.
 let hem=clothes==='dress'||clothes==='pinafore'?620:low+20;
 let left=145-wide,right=275+wide;
 let outline;
 if(['dress','pinafore'].includes(clothes)){
  outline='M 175 '+top+' Q 116 '+(top+18)+' 127 '+(top+133)+' L 111 '+hem+' Q 214 '+(hem+52)+' 317 '+hem+' L 301 '+(top+140)+' Q 313 '+(top+22)+' 245 '+top+' Q 210 '+(top-13)+' 175 '+top+' Z';
 }else if(['trench','overcoat','raincoat'].includes(clothes)){
  outline='M '+left+' '+top+' Q '+(left-23)+' '+(top+48)+' '+(left-7)+' '+(low+63)+' Q 207 '+(low+85)+' '+(right+15)+' '+(low+65)+' L '+(right+25)+' '+(top+54)+' Q '+right+' '+(top-17)+' 245 '+top+' Q 206 '+(top-16)+' '+left+' '+top+' Z';
 }else{
  outline='M '+left+' '+top+' Q '+(left-21)+' '+(top+38)+' '+(left+1)+' '+low+' Q 214 '+(low+22)+' '+(right-1)+' '+low+' L '+(right+24)+' '+(top+41)+' Q '+right+' '+(top-13)+' 242 '+top+' Q 207 '+(top-12)+' '+left+' '+top+' Z';
 }
 let grad=c.createLinearGradient(115,0,320,0);grad.addColorStop(0,'#202530');grad.addColorStop(.23,cloth);grad.addColorStop(.73,cloth);grad.addColorStop(1,'#1d2630');
 p(c,outline,grad,ink,6);
 // Tailoring, folds, collars and clothing identity.
 if(['trench','overcoat','raincoat','peacoat','uniform'].includes(clothes)){
  p(c,'M 175 '+top+' L 220 '+(top+82)+' L 196 '+(top+151)+' L 159 '+(top+21)+' Z','#bca582',ink,3);
  p(c,'M 241 '+top+' L 216 '+(top+81)+' L 234 '+(top+148)+' L 257 '+(top+18)+' Z','#e5cba5',ink,3);
  l(c,[214,top+92],[216,low],ink,3);
  for(let i=0;i<4;i++){e(c,185,top+145+i*42,5,4,gold);e(c,237,top+145+i*42,5,4,gold)}
 }else if(clothes==='suit'||clothes==='vest'){
  p(c,'M 186 '+top+' L 215 '+(top+93)+' L 189 '+(top+177)+' L 162 '+(top+15)+' Z',ivory,ink,3);
  p(c,'M 235 '+top+' L 215 '+(top+93)+' L 235 '+(top+177)+' L 259 '+(top+15)+' Z',ivory,ink,3);
  p(c,'M 206 '+(top+67)+' L 218 '+(top+67)+' L 224 '+(top+137)+' L 213 '+(top+151)+' L 199 '+(top+135)+' Z','#934d41',ink,3);
 }else if(clothes==='sweater'){
  for(let i=0;i<4;i++)l(c,[161,top+153+i*16],[266,top+153+i*16],i%2?'#e3bf81':'#586d58',8);
  l(c,[175,top+7],[210,top+50],ivory,10);l(c,[210,top+50],[250,top+8],ivory,10);
 }else if(clothes==='cardigan'){
  l(c,[211,top+10],[211,low],ivory,8);
  for(let i=0;i<5;i++)e(c,215,top+135+i*40,4,4,'#564b42');
 }else if(clothes==='dress'){
  p(c,'M 175 '+(top+26)+' Q 212 '+(top+85)+' 249 '+(top+26)+' L 240 '+(top+164)+' L 182 '+(top+165)+' Z','#a96e52',ink,3);
  l(c,[173,top+200],[256,top+200],gold,9);
 }else if(clothes==='pinafore'){
  l(c,[181,top+20],[184,hem-45],'#9c5b49',19);
  l(c,[243,top+20],[241,hem-45],'#9c5b49',19);
  e(c,212,top+162,23,19,'#bd8254',ink);
 }
 // Arm silhouettes with sleeves, cuffs, hands and opening fingers in greeting.
 p(c,'M '+(left+8)+' '+(top+15)+' Q '+(left-20)+' '+(top+15)+' '+(left-29)+' '+(top+82)+' L '+(left-14)+' '+(top+186)+' Q '+(left+7)+' '+(top+204)+' '+(left+21)+' '+(top+169)+' L '+(left+35)+' '+(top+75)+' Z',cloth);
 p(c,'M '+(left-23)+' '+(top+174)+' Q '+(left-2)+' '+(top+167)+' '+(left+6)+' '+(top+198)+' L '+(left-3)+' '+(top+232)+' Q '+(left-22)+' '+(top+243)+' '+(left-28)+' '+(top+218)+' Z',skin,ink,3);
 if(wave){
  p(c,'M '+(right-14)+' '+(top+22)+' Q '+(right+42)+' '+(top+19)+' '+(right+62)+' '+(top-41)+' L '+(right+73)+' '+(top-93)+' Q '+(right+104)+' '+(top-100)+' '+(right+105)+' '+(top-70)+' Q '+(right+109)+' '+(top-2)+' '+(right+65)+' '+(top+66)+' Q '+(right+30)+' '+(top+113)+' '+(right-12)+' '+(top+91)+' Z',cloth);
  p(c,'M '+(right+71)+' '+(top-103)+' Q '+(right+66)+' '+(top-144)+' '+(right+79)+' '+(top-155)+' Q '+(right+91)+' '+(top-162)+' '+(right+94)+' '+(top-131)+' L '+(right+103)+' '+(top-169)+' Q '+(right+118)+' '+(top-174)+' '+(right+118)+' '+(top-144)+' L '+(right+120)+' '+(top-94)+' Z',skin,ink,4);
 }else{
  p(c,'M '+(right-15)+' '+(top+15)+' Q '+(right+22)+' '+(top+12)+' '+(right+31)+' '+(top+83)+' L '+(right+12)+' '+(top+184)+' Q '+(right-8)+' '+(top+205)+' '+(right-19)+' '+(top+174)+' L '+(right-38)+' '+(top+73)+' Z',cloth);
  p(c,'M '+(right+9)+' '+(top+176)+' Q '+(right+33)+' '+(top+173)+' '+(right+28)+' '+(top+207)+' L '+(right+15)+' '+(top+230)+' Q '+(right-5)+' '+(top+238)+' '+(right-10)+' '+(top+210)+' Z',skin,ink,3);
 }
 // Face uses an asymmetric cranium and independent chin proportions.
 let fx=213,headTop=cy-36;
 p(c,'M '+(177-(jaw-1)*18)+' '+(cy+2)+' Q '+(156-(jaw-1)*14)+' '+(cy+50)+' 170 '+(cy+116)+' Q 181 '+(cy+156)+' '+fx+' '+(cy+162)+' Q '+(248+(jaw-1)*12)+' '+(cy+139)+' 251 '+(cy+88)+' Q 268 '+(cy+23)+' 241 '+(cy-5)+' Q 208 '+headTop+' '+(177-(jaw-1)*18)+' '+(cy+2)+' Z',skin,ink,6);
 e(c,162,cy+85,10,23,skin,ink);e(c,253,cy+84,10,23,skin,ink);
 e(c,181,cy+108,16,9,'#b56f6266');e(c,236,cy+107,17,9,'#b56f6250');
 for(let s of [-1,1]){
  let x=211+s*26;
  p(c,'M '+(x-12)+' '+(cy+62)+' Q '+x+' '+(cy+47)+' '+(x+13)+' '+(cy+61)+' Q '+x+' '+(cy+72)+' '+(x-12)+' '+(cy+62)+' Z','#f5e4c9',ink,2);
  e(c,x+s*2,cy+61,5,6,'#263d42');e(c,x+s*2-1,cy+59,1.6,1.8,'#fff2d8');
  l(c,[x-12,cy+45],[x+10,cy+40],hairColor,4.5);
 }
 p(c,'M 213 '+(cy+76)+' Q 224 '+(cy+98)+' 210 '+(cy+105),null,ink,2.3);
 p(c,'M 190 '+(cy+122)+' Q 211 '+(cy+134)+' 232 '+(cy+120),null,ink,2.7);
 if(id==='raul'||id==='oscar'||id==='conductor')p(c,'M 211 '+(cy+116)+' Q 199 '+(cy+105)+' 185 '+(cy+118)+' Q 200 '+(cy+127)+' 211 '+(cy+120)+' Q 224 '+(cy+129)+' 237 '+(cy+117)+' Q 220 '+(cy+108)+' 211 '+(cy+116)+' Z',hairColor,ink,1);
 // Eleven distinctive hand-drawn hairstyles (not body recolors).
 const hy=cy-16;
 switch(hair){
 case 'bob':
  p(c,'M 163 '+(hy+36)+' Q 144 '+(hy+76)+' 152 '+(hy+163)+' L 180 '+(hy+179)+' L 180 '+(hy+98)+' Q 193 '+(hy+47)+' 225 '+(hy+48)+' L 249 '+(hy+171)+' L 267 '+(hy+158)+' Q 273 '+(hy+13)+' 232 '+(hy-15)+' Q 187 '+(hy-36)+' 163 '+(hy+36)+' Z',hairColor);break;
 case 'cap':
  p(c,'M 166 '+(hy+26)+' Q 174 '+(hy-29)+' 243 '+(hy-22)+' L 260 '+(hy+34)+' Z','#5d513e');
  p(c,'M 147 '+(hy+32)+' Q 213 '+(hy+13)+' 279 '+(hy+35)+' Q 241 '+(hy+56)+' 152 '+(hy+45)+' Z','#746042');break;
 case 'curls':
  for(let i=0;i<12;i++){let a=(i/11)*Math.PI;e(c,210+70*Math.cos(a),hy+33-75*Math.sin(a),25,24,hairColor,ink,3)}
  for(let i=0;i<4;i++)e(c,158+i*31,hy+20+(i%2)*11,24,23,hairColor,ink,3);break;
 case 'slick':
  p(c,'M 161 '+(hy+51)+' Q 149 '+(hy-36)+' 231 '+(hy-27)+' Q 273 '+(hy-29)+' 262 '+(hy+37)+' Q 245 '+(hy+18)+' 231 '+(hy+15)+' Q 199 '+(hy+41)+' 161 '+(hy+51)+' Z',hairColor);
  l(c,[188,hy+7],[250,hy+13],'#60575a',3);break;
 case 'bun':
  e(c,249,hy-19,34,36,hairColor,ink,4);
  p(c,'M 162 '+(hy+36)+' Q 175 '+(hy-39)+' 230 '+(hy-20)+' Q 265 '+(hy-6)+' 257 '+(hy+37)+' Q 224 '+(hy+5)+' 217 '+(hy+18)+' Z',hairColor);break;
 case 'messy':
  p(c,'M 162 '+(hy+46)+' L 158 '+(hy-4)+' L 177 '+(hy+4)+' L 188 '+(hy-31)+' L 207 '+(hy-11)+' L 234 '+(hy-37)+' L 239 '+(hy-13)+' L 265 '+(hy+8)+' L 253 '+(hy+52)+' L 232 '+(hy+18)+' L 211 '+(hy+35)+' L 190 '+(hy+20)+' Z',hairColor);break;
 case 'braids':
  p(c,'M 160 '+(hy+48)+' Q 160 '+(hy-40)+' 224 '+(hy-23)+' Q 269 '+(hy-5)+' 253 '+(hy+46)+' Q 226 '+(hy+12)+' 209 '+(hy+34)+' Z',hairColor);
  for(let s of [-1,1])for(let i=0;i<6;i++)e(c,210+s*61+s*(i%2)*4,hy+87+i*23,11,14,hairColor,ink,2);break;
 case 'part':
  p(c,'M 160 '+(hy+48)+' Q 166 '+(hy-33)+' 210 '+(hy-26)+' Q 257 '+(hy-30)+' 260 '+(hy+42)+' Q 231 '+(hy+9)+' 215 '+(hy+14)+' Q 188 '+(hy+9)+' 160 '+(hy+48)+' Z',hairColor);
  l(c,[216,hy-22],[213,hy+21],'#c9ae8d',4);break;
 case 'afro':
  for(let i=0;i<18;i++){let a=i/18*Math.PI*2;e(c,211+65*Math.cos(a),hy+35+65*Math.sin(a),24,25,hairColor,ink,2)}
  p(c,'M 172 '+(hy+57)+' Q 177 '+(hy+15)+' 211 '+(hy+36)+' Q 239 '+(hy+14)+' 248 '+(hy+57)+' Z',hairColor);break;
 case 'visor':
  p(c,'M 161 '+(hy+29)+' Q 168 '+(hy-31)+' 250 '+(hy-19)+' L 263 '+(hy+33)+' Z','#284757');
  p(c,'M 144 '+(hy+32)+' Q 222 '+(hy+5)+' 281 '+(hy+35)+' Q 247 '+(hy+55)+' 150 '+(hy+45)+' Z','#385e70');e(c,210,hy+1,7,7,gold);break;
 case 'quiff':
  p(c,'M 160 '+(hy+48)+' Q 151 '+(hy+10)+' 173 '+(hy-11)+' Q 174 '+(hy-38)+' 211 '+(hy-18)+' Q 228 '+(hy-49)+' 249 '+(hy-14)+' Q 282 '+(hy+10)+' 254 '+(hy+47)+' Q 237 '+(hy+19)+' 215 '+(hy+29)+' Q 180 '+(hy+16)+' 160 '+(hy+48)+' Z',hairColor);break;
 }
 if(item==='glasses'){for(let s of [-1,1]){c.beginPath();c.roundRect(211+s*26-18,cy+52,36,27,7);c.strokeStyle='#382f34';c.lineWidth=4;c.stroke()}l(c,[203,cy+62],[218,cy+62],'#382f34',4)}
 if(item==='badge'){e(c,240,top+146,9,10,gold,ink);l(c,[220,top+150],[259,top+150],gold,3)}
 if(item==='stripe')for(let i=0;i<3;i++)l(c,[161,top+153+i*20],[254,top+153+i*20],i%2?gold:'#849378',4);
 if(item==='scarf'){
  p(c,'M 171 '+(top+6)+' Q 214 '+(top+49)+' 246 '+(top+3)+' L 254 '+(top+45)+' Q 218 '+(top+73)+' 176 '+(top+39)+' Z',gold);
  p(c,'M 225 '+(top+45)+' L 242 '+(top+45)+' L 239 '+(top+174)+' L 218 '+(top+161)+' Z',gold);
 }
 if(item==='cane'){l(c,[right+20,top+207],[right+32,top+342],gold,9);l(c,[right+32,top+342],[right+9,top+362],gold,9)}
 if(item==='satchel'){
  p(c,'M 265 '+(top+186)+' Q 292 '+(top+173)+' 301 '+(top+206)+' L 301 '+(top+285)+' Q 272 '+(top+303)+' 243 '+(top+283)+' L 245 '+(top+211)+' Z','#70503e');
  l(c,[169,top+4],[290,top+239],'#be956c',11);
 }
 if(item==='paper'||item==='book'){
  p(c,'M 118 '+(top+223)+' L 194 '+(top+204)+' L 239 '+(top+272)+' L 153 '+(top+308)+' Z',item==='book'?'#996b4d':'#dfd7bf',ink,3);
  for(let i=0;i<5;i++)l(c,[144,top+244+i*8],[204,top+230+i*8],'#99917a',2);
 }
 // Paper grain ink line work, subtle rather than procedural noise overload.
 c.globalAlpha=.15;
 for(let i=0;i<12;i++)l(c,[168+i*7,top+248+(i%3)*11],[177+i*7,top+253+(i%3)*11],ivory,2);
 c.restore();
}
const textures=new Map();
function getArt(id,person,kind){
 let key=id+'-'+kind+'-'+person.skin+'-'+person.coat+'-'+person.hair;
 if(textures.has(key))return textures.get(key);
 let canvas=document.createElement('canvas');canvas.width=440;canvas.height=850;
 inkFigure(canvas.getContext('2d'),id,person,kind);
 let tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
 textures.set(key,tex);return tex;
}
export function makeActor(parent,profile){
 let id=profile.id,root=new THREE.Group();parent.add(root);
 let material=new THREE.SpriteMaterial({map:getArt(id,profile,'stand'),transparent:true,alphaTest:.065,depthWrite:false,toneMapped:false});
 let paper=new THREE.Sprite(material);root.add(paper);let state='stand';
 let head=new THREE.Group();root.add(head);
 function pose({t=0,sit=0,walk=0,distance=0,greet=0,drive=0}={}){
  let next=sit>.6?'sit':greet>.28?'greet':walk>.3&&Math.sin(distance*12)>0?'step':'stand';
  if(next!==state){material.map=getArt(id,profile,next);material.needsUpdate=true;state=next}
  paper.scale.set(sit>.6?1.06:1.05,sit>.6?1.63:1.96,1);
  paper.position.set(0,(sit>.6?.84:1.01)+(walk?.011*Math.sin(distance*11):0),0);
  material.rotation=walk?.008*Math.sin(distance*13):0;
 }
 pose();
 return {id,root,pose,head,params:ACTORS[id],artFamily:'original-handdrawn-2p5d'};
}
export function createSeated(parent,profile,seat){
 let a=makeActor(parent,profile);a.root.position.set(seat.x,.055,seat.z);a.root.rotation.y=seat.yaw;a.pose({sit:1});return a;
}
export const ORIGINAL_ART_ACTOR_IDS=Object.freeze(Object.keys(ACTORS));
