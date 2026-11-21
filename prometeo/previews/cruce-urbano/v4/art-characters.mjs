import * as THREE from 'three';

/**
 * CRUCE URBANO V4 · PERSONAS ILUSTRADAS
 * Fuente vectorial editable (Canvas2D). Recurso original, sin modelos humanos
 * de primitivas ni recolores de un avatar común.
 * Técnica: teatro de papel 2.5D en mundo 3D, con vistas anterior/lateral/posterior,
 * proporciones, prendas y siluetas distintas. No fingir rig 3D ni captura de motion.
 */
export const CAST = [
 {id:'Mara', role:'editora',   height:1.68,build:.88,skin:'#a66d50',hair:'#33262b',top:'#a84d35',bottom:'#273a43',dress:'trench',style:'bob', object:'newspaper'},
 {id:'Dante',role:'mensajero', height:1.84,build:1.10,skin:'#bc8667',hair:'#2d2723',top:'#447d87',bottom:'#393537',dress:'courier',style:'crop',object:'satchel'},
 {id:'Sol',  role:'estudiante',height:1.59,build:.84,skin:'#d4a282',hair:'#733f30',top:'#e0b351',bottom:'#506571',dress:'jumper',style:'long',object:'books'},
 {id:'Nico', role:'mecánico',  height:1.76,build:1.16,skin:'#97684e',hair:'#302b2a',top:'#718270',bottom:'#3b4645',dress:'overall',style:'cap',object:'tool'},
 {id:'Luz',  role:'diseñadora',height:1.73,build:.90,skin:'#b88472',hair:'#262330',top:'#a56283',bottom:'#4b404d',dress:'cape',style:'bun',object:'portfolio'},
 {id:'Ivo',  role:'profesor',  height:1.87,build:1.02,skin:'#d0a18b',hair:'#77716d',top:'#638292',bottom:'#625146',dress:'blazer',style:'part',object:'coffee'},
 {id:'Uma',  role:'comerciante',height:1.65,build:1.13,skin:'#81523b',hair:'#242323',top:'#b67d40',bottom:'#3d4140',dress:'apron',style:'curly',object:'flowers'},
 {id:'Leo',  role:'fotógrafo', height:1.77,build:.92,skin:'#bc9070',hair:'#3c3029',top:'#90996b',bottom:'#3f4652',dress:'parka',style:'part',object:'camera'},
 {id:'Ana',  role:'vecina',    height:1.57,build:1.12,skin:'#c28b77',hair:'#998579',top:'#c28077',bottom:'#57565b',dress:'skirt',style:'bob',object:'basket'},
 {id:'Tomi', role:'músico',    height:1.80,build:.88,skin:'#dfad8b',hair:'#4c302c',top:'#9691bd',bottom:'#384853',dress:'hoodie',style:'long',object:'headphones'},
 {id:'Río',  role:'repartidor',height:1.69,build:1.03,skin:'#956449',hair:'#302b27',top:'#d6a657',bottom:'#344b50',dress:'courier',style:'crop',object:'parcel'},
 {id:'Eva',  role:'bibliotecaria',height:1.72,build:.95,skin:'#d6aa8b',hair:'#543a34',top:'#72958d',bottom:'#534754',dress:'pleated',style:'bun',object:'book'}
];
const INK='#30343b',PAPER='#f6e8cf';
const shade=(hex,a=.18)=>{const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;return 'rgba('+r+','+g+','+b+','+a+')';};
function path(g,color,fn,line=4){g.beginPath();fn(g);g.closePath();g.fillStyle=color;g.fill();g.lineJoin='round';g.lineCap='round';if(line){g.strokeStyle=INK;g.lineWidth=line;g.stroke();}}
function stroke(g,color,width,fn){g.beginPath();fn(g);g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.stroke();}
function oval(g,x,y,rx,ry,c,line=3){path(g,c,h=>h.ellipse(x,y,rx,ry,0,0,Math.PI*2),line);}
function line(g,color,width,x1,y1,x2,y2){stroke(g,color,width,h=>{h.moveTo(x1,y1);h.lineTo(x2,y2);});}
function drawBoot(g,x,step,shoe){
 path(g,shoe,h=>{h.moveTo(x-19,36+step);h.lineTo(x+14,35+step);h.quadraticCurveTo(x+30,20+step,x+38,14+step);h.quadraticCurveTo(x+43,6+step,x+29,5+step);h.lineTo(x-30,6+step);h.quadraticCurveTo(x-34,13+step,x-25,23+step);h.closePath();},4);
 line(g,'#efe5d5',3,x-25,10+step,x+28,10+step);
}
function drawLeg(g,x,lean,pants,alt=false){
 const shift=lean*(alt?-1:1),knee=x+shift*.65,ankle=x-shift*.47;
 path(g,pants,h=>{h.moveTo(x-26,310);h.quadraticCurveTo(x-33,210,knee-15,158);h.lineTo(ankle-17,35);h.lineTo(ankle+18,35);h.quadraticCurveTo(knee+14,164,x+25,296);h.closePath();});
 stroke(g,'#ffffff37',3,h=>{h.moveTo(x-13,270);h.quadraticCurveTo(knee-11,191,ankle-7,62);});
 drawBoot(g,ankle,0,'#3b3534');
}
function head(g,s,side,back){
 const headWidth=s.style==='crop'?53:s.style==='curly'?58:51;
 // Neck and irregular illustrated skull: no 3D sphere mesh.
 path(g,s.skin,h=>{h.moveTo(-23,514);h.lineTo(-20,556);h.lineTo(24,554);h.lineTo(20,511);h.closePath();});
 path(g,s.skin,h=>{h.moveTo(-headWidth+5,605);h.bezierCurveTo(-headWidth-8,667,-25,697,19,683);h.bezierCurveTo(68,676,69,642,58,599);h.bezierCurveTo(47,553,23,548,-10,556);h.bezierCurveTo(-40,562,-51,585,-headWidth+5,605);},5);
 // Hair mass defined with different cut shapes, not a colored helmet.
 const hair=s.hair;
 if(s.style==='long'){
  path(g,hair,h=>{h.moveTo(-57,622);h.quadraticCurveTo(-77,563,-62,505);h.quadraticCurveTo(-43,493,-37,523);h.lineTo(-35,633);h.quadraticCurveTo(6,713,49,640);h.lineTo(51,523);h.quadraticCurveTo(76,495,67,565);h.quadraticCurveTo(68,658,27,690);h.quadraticCurveTo(-35,712,-57,622);},4);
 }else if(s.style==='curly'){
  for(let j=0;j<9;j++){const a=Math.PI*(j/8),x=Math.cos(a)*50,y=640+Math.sin(a)*50;oval(g,x,y,18+(j%3)*3,20,hair,2);}
 }else if(s.style==='bun'){
  oval(g,0,697,30,28,hair,4);
  path(g,hair,h=>{h.moveTo(-52,646);h.quadraticCurveTo(-58,687,-10,694);h.quadraticCurveTo(45,704,60,644);h.quadraticCurveTo(14,663,-19,672);h.closePath();},2);
 }else if(s.style==='bob'){
  path(g,hair,h=>{h.moveTo(-54,644);h.quadraticCurveTo(-69,589,-61,545);h.lineTo(-34,539);h.lineTo(-36,640);h.quadraticCurveTo(4,696,48,650);h.lineTo(51,541);h.lineTo(65,544);h.quadraticCurveTo(72,639,49,680);h.quadraticCurveTo(6,716,-54,644);},3);
 }else{
  path(g,hair,h=>{h.moveTo(-57,645);h.quadraticCurveTo(-40,709,18,692);h.quadraticCurveTo(59,687,60,649);h.quadraticCurveTo(23,668,5,661);h.quadraticCurveTo(-27,683,-57,645);},4);
 }
 if(s.style==='part')stroke(g,'#e7d3bf',3,h=>{h.moveTo(8,693);h.quadraticCurveTo(3,668,-15,656);});
 if(!back){
  const look=side?13:0;
  // Profile and front share recognizable eyebrows, nose and mouth.
  oval(g,-21+look,620,6,8,INK,0);oval(g,22+look,621,6,8,INK,0);
  stroke(g,hair,4,h=>{h.moveTo(-36+look,640);h.quadraticCurveTo(-21+look,648,-9+look,637);h.moveTo(10+look,638);h.quadraticCurveTo(25+look,646,35+look,638);});
  stroke(g,'#805a4d',3,h=>{h.moveTo(5+look,615);h.quadraticCurveTo(14+look,596,0+look,592);});
  stroke(g,'#743f39',3,h=>{h.moveTo(-15+look,575);h.quadraticCurveTo(5+look,568,20+look,578);});
  if(s.id==='Ana'||s.id==='Sol'){for(const x of [-33,-26,23,31])oval(g,x,600,2,2,'#98624e',0);}
 }else{
  stroke(g,'#ddc5ab',4,h=>{h.moveTo(-28,625);h.quadraticCurveTo(0,635,29,622);});
 }
 if(s.style==='cap'){
  path(g,'#455a53',h=>{h.moveTo(-62,673);h.quadraticCurveTo(0,726,61,671);h.lineTo(63,651);h.lineTo(-65,651);},3);
  path(g,'#2b3936',h=>{h.moveTo(-60,654);h.quadraticCurveTo(-15,635,75,650);h.quadraticCurveTo(81,640,64,635);h.lineTo(-59,640);},2);
 }
}
function garment(g,s){
 const top=s.top,trim='#f6e9d5',kind=s.dress,b=s.build;
 g.save();g.scale(b,1);
 const hem=(kind==='trench'||kind==='parka'||kind==='cape')?274:kind==='skirt'||kind==='pleated'?267:309;
 // Individually tailored garment silhouette, with cut, panels and fastening.
 path(g,top,h=>{h.moveTo(-27,530);h.bezierCurveTo(-68,529,-86,504,-91,471);h.lineTo(-90,hem+32);
  if(kind==='cape'){h.quadraticCurveTo(-113,381,-110,299);h.quadraticCurveTo(3,235,110,300);h.lineTo(91,471);}
  else{h.quadraticCurveTo(-81,hem,-58,hem);h.quadraticCurveTo(2,hem-12,65,hem);h.quadraticCurveTo(90,hem+8,91,471);}
  h.bezierCurveTo(87,506,61,528,27,531);h.quadraticCurveTo(6,511,-27,530);},5);
 if(kind==='skirt'||kind==='pleated'){
   path(g,s.bottom,h=>{h.moveTo(-58,350);h.lineTo(61,350);h.quadraticCurveTo(102,244,103,206);h.quadraticCurveTo(0,193,-99,208);h.closePath();},5);
   for(let x=-65;x<=65;x+=23)line(g,'#f6e9d54f',2,x*.8,340,x,213);
 }
 if(kind==='overall'||kind==='apron'){
  path(g,shade('#e1c99d',.8),h=>{h.moveTo(-50,484);h.lineTo(50,484);h.lineTo(68,302);h.lineTo(-68,302);},2);
  for(const x of [-45,45]){line(g,INK,8,x,490,x*1.12,345);oval(g,x,484,5,5,'#d7ba77',1);}
 }
 if(kind==='courier'||kind==='hoodie'){
   path(g,shade(s.bottom,.48),h=>{h.moveTo(-38,529);h.quadraticCurveTo(-63,548,-65,516);h.lineTo(-36,465);h.quadraticCurveTo(0,490,40,462);h.lineTo(60,512);h.quadraticCurveTo(57,549,31,532);},2);
 }
 if(kind==='trench'||kind==='blazer'||kind==='parka'){
  stroke(g,'#f6e1c0',4,h=>{h.moveTo(-20,518);h.lineTo(1,454);h.lineTo(20,512);});
  for(let y=440;y>=290;y-=42){oval(g,-10,y,3.8,4.8,'#efd4b1',1);oval(g,15,y-8,3.4,3.8,'#efd4b1',1);}
 }
 if(kind==='jumper'){for(let y=326;y<462;y+=26)stroke(g,'#fff4cc44',2,h=>{h.moveTo(-67,y);h.quadraticCurveTo(0,y-9,65,y);});}
 if(kind==='apron'||kind==='overall')stroke(g,'#665f55',3,h=>{h.moveTo(-32,380);h.quadraticCurveTo(0,363,34,380);h.lineTo(31,342);h.quadraticCurveTo(0,334,-29,342);h.closePath();});
 if(kind==='blazer'||kind==='trench'){stroke(g,'#f0c59d',3,h=>{h.moveTo(0,510);h.lineTo(0,290);});}
 for(const x of [-1,1])stroke(g,'#fff5d542',3,h=>{h.moveTo(x*66,481);h.quadraticCurveTo(x*69,419,x*60,352);});
 g.restore();
}
function arm(g,s,side,motion,behind=false){
 const x=side*80,m=s.build,active=motion*side;
 const upperX=x+active*.25,elbowX=side*(100+active*.28),handX=side*(105+active*.65);
 const color=s.dress==='overall'?shade('#d5d1aa',.95):s.top;
 path(g,color,h=>{h.moveTo(side*50,500);h.quadraticCurveTo(upperX,536,side*94,470);h.quadraticCurveTo(elbowX,410,elbowX,367);h.lineTo(handX+side*15,318-active);h.lineTo(handX-side*14,317-active);h.quadraticCurveTo(side*70,390,side*53,464);},4);
 oval(g,handX,320-active,17,31,s.skin,4);
 if(!behind)stroke(g,'#ffe6bf80',3,h=>{h.moveTo(side*86,467);h.quadraticCurveTo(side*94,424,side*91,405);});
}
function object(g,s){
 const kind=s.object;
 if(kind==='newspaper'){
  path(g,'#eee7d7',h=>{h.moveTo(89,340);h.lineTo(158,359);h.lineTo(167,271);h.lineTo(94,260);},3);
  line(g,'#7d7771',4,103,337,152,344);for(let i=0;i<5;i++)line(g,'#b3a79a',2,104,324-i*11,150,330-i*11);
 }else if(kind==='satchel'||kind==='portfolio'){
  path(g,kind==='satchel'?'#865a43':'#463f4f',h=>{h.moveTo(-137,370);h.lineTo(-61,371);h.lineTo(-65,281);h.quadraticCurveTo(-104,254,-138,286);},4);
  stroke(g,'#e2c9ac',5,h=>{h.moveTo(55,505);h.quadraticCurveTo(-18,405,-99,360);});oval(g,-96,333,6,7,'#dbc5a8',1);
 }else if(kind==='books'||kind==='book'){
  path(g,'#526e80',h=>{h.moveTo(67,357);h.lineTo(132,347);h.lineTo(137,307);h.lineTo(75,315);},4);
  path(g,'#edd9a9',h=>{h.moveTo(75,318);h.lineTo(135,308);h.lineTo(133,297);h.lineTo(71,308);},2);
 }else if(kind==='tool'){
  stroke(g,'#c9cdd0',7,h=>{h.moveTo(90,317);h.lineTo(136,272);h.lineTo(160,283);});oval(g,155,286,11,7,'#a6b4b6',2);
 }else if(kind==='flowers'){
  for(let k=0;k<5;k++){const x=96+k*12;line(g,'#557a4e',3,103,297,x,374+k*6);oval(g,x,382+k*6,8,10,['#df9d8d','#dfb54b','#f3dbc5'][k%3],2);}
  path(g,'#baa184',h=>{h.moveTo(80,362);h.lineTo(135,354);h.lineTo(114,292);h.lineTo(100,291);},3);
 }else if(kind==='coffee'){
  path(g,'#f8eee1',h=>{h.moveTo(96,347);h.lineTo(130,343);h.lineTo(123,307);h.lineTo(101,308);},3);
  line(g,'#8d6156',4,94,347,130,343);
 }else if(kind==='camera'){
  path(g,'#333d43',h=>{h.moveTo(65,375);h.lineTo(132,374);h.lineTo(137,337);h.lineTo(65,334);},3);
  oval(g,99,351,16,15,'#566e75',2);oval(g,99,351,8,8,'#303b42',0);
  stroke(g,'#d6bda2',5,h=>{h.moveTo(-35,490);h.quadraticCurveTo(45,417,87,362);});
 }else if(kind==='basket'){
  path(g,'#b59469',h=>{h.moveTo(79,340);h.lineTo(141,338);h.lineTo(132,280);h.lineTo(92,279);},4);
  stroke(g,'#6c4f3c',5,h=>{h.moveTo(90,337);h.quadraticCurveTo(111,403,140,336);});
  for(let i=0;i<4;i++)line(g,'#73563f',2,89+i*14,332,94+i*11,286);
 }else if(kind==='parcel'){
  path(g,'#b89b72',h=>{h.moveTo(62,367);h.lineTo(147,367);h.lineTo(146,288);h.lineTo(62,288);},4);
  line(g,'#e8d7af',9,104,366,104,289);
 }else if(kind==='headphones'){
  stroke(g,'#28343b',9,h=>{h.moveTo(-61,623);h.quadraticCurveTo(0,731,63,625);});oval(g,-57,622,12,29,'#313945',3);oval(g,59,624,12,29,'#313945',3);
 }
}
function paint(canvas,s,view,frame,action){
 const g=canvas.getContext('2d');g.clearRect(0,0,canvas.width,canvas.height);
 g.save();g.translate(192,744);g.scale(1,-1);
 const moving=frame!==0;const gait=frame===1?1:frame===2?-1:0;
 const side=view==='side',back=view==='back';
 // Soft die-cut shadow, not a primitive mesh.
 oval(g,1,2,79,13,'#2623262d',0);
 drawLeg(g,-36,gait*31,s.bottom,true);
 arm(g,s,-1,gait*45,true);
 drawLeg(g,36,gait*31,s.bottom,false);
 garment(g,s);
 arm(g,s,1,gait*45,false);
 head(g,s,side,back);
 if(view==='back')stroke(g,'#ffffff4a',4,h=>{h.moveTo(-32,500);h.quadraticCurveTo(0,475,37,501);});
 object(g,s);
 if(action==='window'&&!moving){stroke(g,'#edcfa8',6,h=>{h.moveTo(-89,379);h.quadraticCurveTo(-122,421,-128,446);});}
 // Ink edge and print-grain strokes are intentionally local to the figure.
 stroke(g,'#f8efe099',2,h=>{h.moveTo(-39,552);h.quadraticCurveTo(0,541,34,555);});
 g.restore();
}
export function createCitizen(id){
 const s=CAST.find(p=>p.id===id);if(!s)throw new Error('UNKNOWN_ACTOR '+id);
 const canvas=document.createElement('canvas');canvas.width=384;canvas.height=768;
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=2;
 const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.06,depthWrite:true,side:THREE.DoubleSide});
 const root=new THREE.Group(),sheet=new THREE.Mesh(new THREE.PlaneGeometry(1.15,2.08),material);
 sheet.position.set(0,s.height/2,0);sheet.scale.set(s.build,s.height/2.08,1);
 root.add(sheet);root.userData={focusId:id,kind:'person',role:s.role,representation:'illustrated-2.5D'};
 let moving=false,phase=0,action='wait',last='';
 const state={speed:0,t:0};
 function pose(speed,dt,t,nextAction='walk'){state.speed=speed;state.t=t;moving=speed>.07;phase=moving?(Math.floor(t*Math.min(5.8,2.4+speed)*2)%2===0?1:2):0;action=nextAction;}
 function faceCamera(camera){
  const dx=camera.position.x-root.position.x,dz=camera.position.z-root.position.z;
  const camYaw=Math.atan2(dx,dz);
  sheet.rotation.y=camYaw-root.rotation.y;
  const diff=Math.atan2(Math.sin(root.rotation.y-camYaw),Math.cos(root.rotation.y-camYaw));
  const view=Math.abs(diff)>2.38?'back':Math.abs(diff)>.78?'side':'front';
  const key=view+':'+phase+':'+(action==='window'&&!moving?1:0);
  if(last!==key){paint(canvas,s,view,phase,action);tex.needsUpdate=true;last=key;}
 }
 paint(canvas,s,'front',0,'wait');tex.needsUpdate=true;
 return {root,pose,faceCamera,profile:s};
}
