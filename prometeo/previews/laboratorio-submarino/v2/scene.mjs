import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

// NEREIDA II · PROMETEO Estudio 3D · Ola 002 / Unidad 08
// Authored environment, parametric sea fauna and live sonar screens. External
// actor: CesiumMan CC BY 4.0; inherited from the V1 Cruce Urbano asset library.
const $=id=>document.getElementById(id);
const canvas=$('view'),notice=$('notice'),noticeText=$('notice-text');
function fail(kind,detail){
  notice.hidden=false;
  noticeText.textContent=kind+' · '+String(detail||'Sin detalle');
  window.__NEREIDA_STATE__={phase:'FAILED',kind,detail:String(detail||'')};
}
let context;
try{context=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});}catch(e){fail('WEBGL_CONTEXT',e.message);}
if(!context){fail('WEBGL_CONTEXT','Este dispositivo no pudo crear WebGL2. No se muestra una escena 2D como si fuera 3D.');throw Error('WEBGL2_UNAVAILABLE');}
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,powerPreference:'high-performance'});}
catch(e){fail('RENDERER',e.message);throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.45;
renderer.shadowMap.enabled=false;
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x061923);
scene.fog=new THREE.FogExp2(0x061923,.0072);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.06,250);
camera.position.set(-17,2.05,4.3);
scene.add(new THREE.HemisphereLight(0xb4eeef,0x20313d,2.4));
const fill=new THREE.DirectionalLight(0x8edbd3,1.28);fill.position.set(-12,25,-30);scene.add(fill);
const interior=new THREE.Group(),outside=new THREE.Group(),animated=new THREE.Group();
scene.add(outside,interior,animated);
const color=(c,r=.6,m=.22)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const dark=color('#0d242c',.4,.76),bulk=color('#304750',.68,.68);
const trim=color('#78918e',.35,.88),bronze=color('#a18355',.39,.67);
const floorMat=color('#1b343c',.65,.57),panelMat=color('#28494d',.52,.53);
const warm=new THREE.MeshBasicMaterial({color:0xffd698}),mint=new THREE.MeshBasicMaterial({color:0x72f9d5});
const glass=new THREE.MeshStandardMaterial({color:0x3b9d9f,transparent:true,opacity:.10,roughness:.12,metalness:.18,depthWrite:false,side:THREE.DoubleSide});
function mesh(geo,mat,parent=interior){const a=new THREE.Mesh(geo,mat);parent.add(a);return a;}
function box(x,y,z,w,h,d,mat=bulk,parent=interior){const o=mesh(new THREE.BoxGeometry(w,h,d),mat,parent);o.position.set(x,y,z);return o;}
function cyl(x,y,z,rb,rt,h,mat,parent=interior,n=16){const o=mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat,parent);o.position.set(x,y,z);return o;}
function sphere(x,y,z,scale,mat,parent=outside,detail=1){const o=mesh(new THREE.IcosahedronGeometry(1,detail),mat,parent);o.position.set(x,y,z);o.scale.set(...scale);return o;}
function tube(points,r,mat,parent=interior,n=48){const c=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(c,n,r,8,false),mat,parent);}
function frame(x,y,z,w,h,depth,mat=trim,parent=interior,b=.12){
  box(x,y+h/2,z,w+b*2,b,depth,mat,parent);box(x,y-h/2,z,w+b*2,b,depth,mat,parent);
  box(x-w/2,y,z,b,h,depth,mat,parent);box(x+w/2,y,z,b,h,depth,mat,parent);
}
function lightBar(x,y,z,w,mat=mint){box(x,y,z,w,.045,.055,mat);}
function labelTex(title,sub){
 const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');
 g.fillStyle='#081e27';g.fillRect(0,0,512,128);g.fillStyle='#a7d2c6';g.fillRect(10,10,2,108);
 g.textAlign='left';g.fillStyle='#d8ead7';g.font='600 43px system-ui';g.fillText(title,30,66);
 g.fillStyle='#8ab4ac';g.font='19px monospace';g.fillText(sub,30,100);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function placard(x,z,title,subtitle){
 const o=mesh(new THREE.PlaneGeometry(3.5,.87),new THREE.MeshBasicMaterial({map:labelTex(title,subtitle),side:THREE.DoubleSide}));
 o.rotation.y=Math.PI;o.position.set(x,5.48,z);
}
// Non-uniform, purpose-painted utility panel, UV mapped by Three BoxGeometry.
function plateTexture(){
 const c=document.createElement('canvas');c.width=512;c.height=512;const g=c.getContext('2d');
 g.fillStyle='#30484c';g.fillRect(0,0,512,512);
 for(let y=4;y<512;y+=128){for(let x=4;x<512;x+=128){
  g.fillStyle=((x+y)%256===0)?'#344e50':'#2d4449';g.fillRect(x,y,120,120);
  g.strokeStyle='#66817d';g.lineWidth=2;g.strokeRect(x+3,y+3,114,114);
  g.fillStyle='#8a8271';for(const a of [[12,12],[108,12],[12,108],[108,108]]){g.beginPath();g.arc(x+a[0],y+a[1],2.8,0,Math.PI*2);g.fill();}
 }}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(9,3);t.anisotropy=4;return t;
}
const painted=new THREE.MeshStandardMaterial({map:plateTexture(),roughness:.75,metalness:.37});
// Main hull: 53 metres x 20.4 metres, with a working passage through three modules.
box(0,-.19,-1.7,51.5,.4,21.6,floorMat);
box(0,-.385,-1.8,51.7,.08,21.8,bronze);
box(0,7.10,-1.7,51.5,.35,21.6,bulk);
box(0,3.48,9.15,51.5,7.2,.45,painted);
box(-25.6,3.55,-1.4,.45,7.25,21.5,bulk);box(25.6,3.55,-1.4,.45,7.25,21.5,bulk);
// High and low portions of the pressure-wall, open panoramic glazing between.
box(0,.48,-12.30,51.5,1.0,.8,bulk);
box(0,6.58,-12.30,51.5,1.1,.8,bulk);
for(let i=0;i<10;i++){
 const x=-22.5+i*5;
 frame(x,3.53,-12.05,4.8,4.86,.30,bronze,interior,.12);
 box(x,1.09,-12.07,4.65,.095,.38,dark);
 const g=mesh(new THREE.PlaneGeometry(4.53,4.64),glass);g.position.set(x,3.53,-12.20);
 box(x,6.11,-11.98,4.45,.046,.25,mint);
 for(const s of [-1,1]){for(let j=0;j<5;j++){
  const bolt=cyl(x+s*2.34,1.34+j*1.1,-11.78,.055,.055,.045,bronze,interior,10);
  bolt.rotation.x=Math.PI/2;
 }}
}
// Pressure rings, structural ribs and small recurring orange safety joints.
for(let i=-6;i<=6;i++){
 const x=i*4.1;
 box(x,6.74,-2, .14,.22,20.2,trim);
 box(x,.15,-2,.1,.06,20.2,bronze);
 for(const z of [6.3,1.1,-4.6]){lightBar(x,6.65,z,2.85,warm);}
}
for(let i=-12;i<=12;i++){box(i*2.03,.027,-2.6,.033,.032,15.7,dark);}
for(let z=-9;z<=8;z+=3.4){box(0,.025,z,51.1,.02,.06,trim);}
// Segmented wall panels, screen conduits and useful handrail at the windows.
for(let i=0;i<12;i++){
 const x=-23.0+i*4.1;
 box(x,3.25,8.87,.07,5.0,.09,bronze);
 tube([[x,6.42,8.77],[x+.2,6.42,4.5],[x+.2,6.55,-7.4]],.065,bronze);
}
for(let x=-23;x<=23;x+=2.6){cyl(x,.86,-10.7,.045,.045,1.5,trim);}
box(0,1.65,-10.7,48.0,.08,.09,trim);
// Two partitions have usable openings, not solid walls masquerading as a corridor.
for(const x of [-8.4,8.4]){
 for(const [z,depth] of [[-8.0,8.6],[5.2,7.65]]){
  box(x,3.55,z,.40,7.0,depth,bulk);
 }
 box(x,6.20,.12,.40,1.7,4.05,bulk);
 for(const s of [-1,1])box(x,2.7,.15+s*2.12,.5,5.5,.22,bronze);
 box(x,5.62,.12,.47,.12,4.12,mint);
}
// Compartments and equipment are distinct rather than copies of one console.
placard(-17,8.88,'OBSERVATORIO','01 / WINDOW ARRAY');
placard(0,8.88,'BIOLOGÍA','02 / SPECIMEN LAB');
placard(17,8.88,'NÚCLEO','03 / SONAR + SYSTEMS');
function sonarScreen(x,y,z,w,h,seed,rotate=true){
 const c=document.createElement('canvas');c.width=512;c.height=320;const ctx=c.getContext('2d');
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
 const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
 const s=mesh(new THREE.PlaneGeometry(w,h),material);s.position.set(x,y,z);s.rotation.y=rotate?Math.PI:0;
 box(x,y,z+(rotate?.065:-.065),w+.13,h+.13,.12,dark);
 return{c,ctx,texture,seed};
}
const screens=[];
function consoleUnit(x,z,variant=0){
 box(x,1.08,z,2.55,.16,1.35,trim);
 box(x,1.5,z+.52,2.46,.72,.20,bulk);
 box(x,1.37,z-.47,2.44,.14,.12,bronze);
 for(const dx of [-.98,.98])box(x+dx,.6,z, .12,1.06,1.1,dark);
 screens.push(sonarScreen(x,1.79,z+.64,1.89,.72,variant,true));
 for(let j=0;j<8;j++){const btn=box(x-1+j*.28,1.19,z-.23,.12,.033,.13,j%3===0?warm:dark);btn.rotation.z=.05;}
}
for(const x of [-22,-17.5,-13.1])consoleUnit(x,5.55,2);
for(const x of [-4.7,0,4.7])consoleUnit(x,5.65,4);
for(const x of [12.3,17,21.8])consoleUnit(x,5.65,8);
function screenDraw(s,t){
 const g=s.ctx,w=512,h=320;g.fillStyle='#08252d';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(85,209,179,.18)';g.lineWidth=1;
 for(let i=0;i<w;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();}
 for(let i=0;i<h;i+=32){g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke();}
 const cx=250,cy=160;g.strokeStyle='rgba(130,234,202,.65)';g.lineWidth=2;
 for(let r=55;r<159;r+=50){g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();}
 g.save();g.translate(cx,cy);g.rotate(t*.7+s.seed);
 const grad=g.createLinearGradient(0,0,150,0);grad.addColorStop(0,'rgba(50,245,180,.42)');grad.addColorStop(1,'rgba(50,245,180,0)');
 g.fillStyle=grad;g.beginPath();g.moveTo(0,0);g.arc(0,0,155,-.22,.12);g.closePath();g.fill();g.restore();
 g.fillStyle='#a0efd2';for(let i=0;i<5;i++){
  const a=s.seed+i*2.2,x=cx+Math.cos(a)*((i*27)%142),y=cy+Math.sin(a)*((i*27)%142);
  g.fillRect(x-2,y-2,4,4);
 }
 g.font='16px monospace';g.fillStyle='#83c9b5';g.fillText('NEREIDA / '+String(s.seed).padStart(2,'0'),15,25);
 g.fillText('SONAR 00:'+String(Math.floor(t)%60).padStart(2,'0'),15,300);
 s.texture.needsUpdate=true;
}
// Glass specimen cylinders, active reactor chamber, microscope and piping.
for(const [x,z,r] of [[-3.9,1.7,.63],[0,1.7,.84],[3.8,1.7,.63]]){
 cyl(x,.28,z,r+.1,r+.1,.55,dark);cyl(x,2.84,z,r+.09,r+.09,.25,bronze);
 const v=cyl(x,1.65,z,r,r,2.65,new THREE.MeshStandardMaterial({color:0x2cd4bb,transparent:true,opacity:.21,roughness:.14,metalness:.15,depthWrite:false}));
 for(let k=0;k<5;k++){const p=sphere(x+.25*Math.sin(k*2),.72+k*.37,z+.23*Math.cos(k*3),[.09,.15,.09],mint,interior,1);p.material=new THREE.MeshBasicMaterial({color:k%2?0x6ce6c8:0x9ee3df});}
 tube([[x-r-.11,.4,z],[x-r-.11,4.85,z],[x+r+.11,4.85,z],[x+r+.11,3,z]],.065,bronze);
}
box(0,.96,-3.6,5.6,.19,2.1,trim);for(const x of [-2.5,2.5])box(x,.48,-3.6,.18,.83,1.55,dark);
cyl(-1.1,1.33,-3.7,.26,.16,.66,dark);
tube([[-1.1,1.55,-3.7],[-.75,1.95,-3.7],[-.28,1.88,-3.7]],.11,bronze);
cyl(-.25,1.82,-3.7,.22,.22,.16,mint);
for(let x=-2;x<=2;x+=1.3){const v=cyl(x,1.23,-4.2,.19,.13,.45,glass);cyl(x,1.46,-4.2,.2,.2,.035,trim);}
// Observatory's large optical telescope and hydraulic floor mount.
cyl(-19,.45,-3.3,.96,.73,.88,dark);
const pivot=new THREE.Group();interior.add(pivot);pivot.position.set(-19,1.2,-3.3);
const barrel=cyl(0,.0,-1.2,.38,.54,3.7,bulk,pivot,24);barrel.rotation.x=Math.PI/2;
for(let i=0;i<4;i++){const c=cyl(0,0,-2.9+i*1.1,.51,.51,.08,bronze,pivot,24);c.rotation.x=Math.PI/2;}
pivot.rotation.x=-.08;
box(-19,1.09,1.15,4.0,.20,1.4,trim);for(let x=-20.7;x<=-17.3;x+=.9)box(x,.57,1.15,.15,.94,1.2,dark);
// Core control: sonar array, spinning antenna and vented server chassis.
for(const x of [10.9,14.4,19.4,22.4]){
 box(x,2.1,7.65,1.75,3.85,1.30,dark);
 for(let r=0;r<8;r++){box(x,1.05+r*.35,6.965,1.42,.14,.08,bulk);lightBar(x-.41,1.04+r*.35,6.905,.23,r%3===0?warm:mint);}
}
const sonarBase=new THREE.Group();interior.add(sonarBase);sonarBase.position.set(17,1.2,-3.6);
cyl(0,-.41,0,1.4,1.1,.72,bulk,sonarBase,24);
const antenna=new THREE.Group();sonarBase.add(antenna);
const hoops=[];
for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(1.35+i*.26,.035,8,60),i===1?bronze:mint,antenna);ring.rotation.x=i*.45+.1;ring.rotation.y=i*.9;hoops.push(ring);}
sphere(0,.1,0,[.31,.31,.31],new THREE.MeshBasicMaterial({color:0xbdebdc}),antenna,2);
for(let i=0;i<18;i++){const a=i*Math.PI/9;cyl(17+2.1*Math.cos(a),.14,-3.6+2.1*Math.sin(a),.045,.045,.3,bronze);}
for(const z of [7.8,2.6]){tube([[-24,5.75,z],[-10,5.75,z],[-4,5.8,z],[8,5.75,z],[23,5.75,z]],.115,dark);}
// Ocean is a spatial scene, not a 2D background. Geometry spans 100+ metres in X/Z.
const seaFloor=new THREE.PlaneGeometry(260,240,52,48);
seaFloor.rotateX(-Math.PI/2);
const pos=seaFloor.attributes.position;
for(let i=0;i<pos.count;i++){
 const x=pos.getX(i),z=pos.getZ(i);
 pos.setY(i,-18+3.5*Math.sin(x*.076)+2.3*Math.cos(z*.067)+1.3*Math.sin(x*.13+z*.09));
}
seaFloor.computeVertexNormals();
const seabed=mesh(seaFloor,color('#19313a',1,0),outside);seabed.position.z=-75;
function pseudo(n){const a=Math.sin(n*127.129)*43758.545;return a-Math.floor(a);}
const rockMat=[color('#18343c',.93,0),color('#29434b',.96,0),color('#102a32',.91,0)];
for(let i=0;i<110;i++){
 const x=-130+pseudo(i*7+17)*260,z=-18-pseudo(i*17+32)*140;
 const sc=1.2+pseudo(i*11+3)*9;
 sphere(x,-16+pseudo(i*9)*2,z,[sc*.85,sc*(.42+.8*pseudo(i*5+7)),sc],rockMat[i%3],outside,i%8===0?2:1);
}
for(const [x,z,h] of [[-78,-46,28],[-58,-80,20],[56,-67,38],[84,-117,45],[-21,-110,26]]){
 sphere(x,-13+h*.19,z,[12,h*.85,11],rockMat[1],outside,1);
 for(let i=0;i<5;i++)sphere(x+Math.sin(i*2)*5,-9+i*1.2,z+Math.cos(i*2)*4,[3.8,5+i,3],rockMat[i%3],outside,1);
}
// Vents, 3D bubbles and sparse bioluminescent coral at three depth planes.
for(let i=0;i<22;i++){
 const x=-80+pseudo(i*23)*160,z=-22-pseudo(i*15+10)*90;
 for(let j=0;j<4;j++){
  const b=sphere(x+.18*Math.sin(j),-13+j*.65,z+.2*Math.cos(j*2),[.12+.06*j,.45,.12+.06*j],j%3?rockMat[1]:mint,outside,1);
 }
}
const bubbleCount=290,bubPos=new Float32Array(bubbleCount*3),bubSeed=[];
for(let i=0;i<bubbleCount;i++){
 const x=-65+130*pseudo(i*17+1),z=-15-100*pseudo(i*13+27),y=-12+37*pseudo(i*19+4);
 bubSeed.push([x,y,z,.3+pseudo(i*7+8)*1.1]);
 bubPos[i*3]=x;bubPos[i*3+1]=y;bubPos[i*3+2]=z;
}
const bubGeom=new THREE.BufferGeometry();
bubGeom.setAttribute('position',new THREE.BufferAttribute(bubPos,3));
const bubbleField=new THREE.Points(bubGeom,new THREE.PointsMaterial({color:0x78d1ce,size:.17,transparent:true,opacity:.58,sizeAttenuation:true,depthWrite:false}));outside.add(bubbleField);
const fishMaterial=color('#6f9c9a',.74,.05),fishLight=color('#aac7ae',.8,.04),fishDark=color('#426c79',.7,.07);
function fishBody(){
 const a=[],uv=[],indices=[],nx=18,nr=9;
 for(let i=0;i<=nx;i++){
  const t=i/nx,x=-1.05+2.05*t,r=Math.pow(Math.max(.001,Math.sin(Math.PI*t)),.7);
  for(let j=0;j<=nr;j++){const p=j/nr*Math.PI*2;
   a.push(x,r*.38*Math.sin(p),r*.21*Math.cos(p));
   uv.push(t,j/nr);
  }
 }
 for(let i=0;i<nx;i++)for(let j=0;j<nr;j++){
  const k=i*(nr+1)+j;indices.push(k,k+nr+1,k+1,k+1,k+nr+1,k+nr+2);
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(a,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function triangles(parts,mat,parent){
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(parts.flat(2),3));
 geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,mat);m.material.side=THREE.DoubleSide;parent.add(m);return m;
}
const fishGeo=fishBody(),finMat=color('#789fa1',.9,.04);
finMat.side=THREE.DoubleSide;
function makeFish(parent,skin=fishMaterial){
 const f=new THREE.Group();parent.add(f);
 mesh(fishGeo,skin,f);
 triangles([[1,0,0],[1.78,.54,0],[1.33,0,0],[1,0,0],[1.33,0,0],[1.78,-.54,0],
 [-.6,.12,0],[-.02,.69,0],[.41,.15,0],[-.38,-.15,0],[.17,-.48,0],[.35,-.15,0]],finMat,f);
 for(const s of [-1,1])sphere(-.63,.08,s*.155,[.045,.045,.04],dark,f,1);
 return f;
}
const fish=[];
for(let i=0;i<73;i++){
 const f=makeFish(animated,i%5===0?fishLight:i%3?fishMaterial:fishDark);
 const sc=.26+.40*pseudo(i*5+21);
 f.scale.setScalar(sc);
 const z=-15-76*pseudo(i*23+17);
 const x=-72+144*pseudo(i*19+8),y=-8+20*pseudo(i*3+9);
 f.position.set(x,y,z);f.rotation.y=i%2?Math.PI:0;
 fish.push({o:f,x,y,z,speed:.65+pseudo(i*13+4)*1.6,dir:i%2?1:-1,seed:i});
}
// Large authored leviathan: lofted body plus dorsal, tail, fins and visible eye.
function largeCreature(){
 const r=new THREE.Group();animated.add(r);
 const geom=new THREE.BufferGeometry(),v=[],idx=[],rings=35,segs=18;
 for(let i=0;i<=rings;i++){
  const u=i/rings,x=-10+20*u;
  const envelope=Math.pow(Math.max(.0001,Math.sin(Math.PI*u)),.58);
  const ry=envelope*(2.0+.38*Math.sin(u*5)),rz=envelope*(1.65+.15*Math.sin(u*7));
  for(let j=0;j<=segs;j++){
   const angle=j/segs*Math.PI*2;
   v.push(x,ry*Math.sin(angle),rz*Math.cos(angle));
  }
 }
 for(let i=0;i<rings;i++)for(let j=0;j<segs;j++){
  const k=i*(segs+1)+j;idx.push(k,k+segs+1,k+1,k+1,k+segs+1,k+segs+2);
 }
 geom.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geom.setIndex(idx);geom.computeVertexNormals();
 const hide=color('#355360',.88,.02);
 mesh(geom,hide,r);
 triangles([[-2,1.5,0],[1,4.8,0],[4,1.1,0],
 [6,0,0],[11.7,4.4,0],[10.1,0,0],[6,0,0],[10.1,0,0],[11.7,-4.4,0],
 [-1,-.5,1.2],[3,-2.3,4.4],[6,-.1,1.2],
 [-1,-.5,-1.2],[3,-2.3,-4.4],[6,-.1,-1.2]],hide,r);
 for(const side of [-1,1]){sphere(-7.65,.67,side*1.02,[.26,.23,.13],new THREE.MeshBasicMaterial({color:0xb3c9b7}),r,2);sphere(-7.67,.67,side*1.16,[.13,.14,.08],dark,r,2);}
 for(let i=0;i<5;i++)tube([[-5+i*.9,-.7,-1.3],[-4.8+i*.9,-.9,-1.7]],.04,trim,r,8);
 r.position.set(45,-2,-85);r.rotation.y=.14;return r;
}
const leviathan=largeCreature();
function makeManta(){
 const g=new THREE.Group();animated.add(g);
 const verts=[],idx=[],NX=22,NZ=10;
 for(let i=0;i<=NX;i++){
  const u=-1+2*i/NX;
  for(let j=0;j<=NZ;j++){
   const v=j/NZ;
   verts.push(u*8.5,.28*Math.cos(u*3)+Math.pow(Math.abs(u),1.8)*.9,
      (v-.5)*3.8*(1-.59*Math.abs(u))+.65*Math.cos(u*2));
  }
 }
 for(let i=0;i<NX;i++)for(let j=0;j<NZ;j++){
  const k=i*(NZ+1)+j;idx.push(k,k+1,k+NZ+1,k+1,k+NZ+2,k+NZ+1);
 }
 const geom=new THREE.BufferGeometry();geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geom.setIndex(idx);geom.computeVertexNormals();
 const mat=color('#486878',.72,.06);mat.side=THREE.DoubleSide;
 mesh(geom,mat,g);sphere(0,.08,-.18,[1.45,.51,2.03],mat,g,2);
 tube([[0,-.08,1.2],[0,-.21,4.5],[0,-.24,8.4]],.055,trim,g,24);
 g.position.set(-37,2.5,-41);return g;
}
const manta=makeManta();
// Three-dimensional distant particles emphasize parallax across multiple distances.
const specks=new Float32Array(500*3);
for(let i=0;i<500;i++){
 specks[3*i]=-140+280*pseudo(i*7+11);
 specks[3*i+1]=-15+53*pseudo(i*13+4);
 specks[3*i+2]=-13-170*pseudo(i*17+9);
}
const speckGeo=new THREE.BufferGeometry();speckGeo.setAttribute('position',new THREE.BufferAttribute(specks,3));
outside.add(new THREE.Points(speckGeo,new THREE.PointsMaterial({color:0x7dbfc2,size:.095,transparent:true,opacity:.44,depthWrite:false})));
// Marine accent lights illuminate interior and the first layers of ocean.
for(const [x,z,hex,strength] of [[-19,-10,0x6fddc1,1.4],[0,-8,0x73bebe,1.8],[17,-7,0xffc486,1.3],[-14,-26,0x286e82,1.1]]){
 const p=new THREE.PointLight(hex,strength,21,2);p.position.set(x,5,z);scene.add(p);
}
// Scientist comes from a physically existing rigged GLB, not a collection of spheres.
const scientist=new THREE.Group();animated.add(scientist);
let mixer=null,scientistReady=false,scientistError=null;
const assetUrl='../../cruce-urbano/v1/assets/cesium-man.glb';
new GLTFLoader().load(assetUrl,gltf=>{
 try{
  if(!gltf.scene||gltf.animations.length===0)throw Error('ANIMATION_NOT_FOUND');
  const actor=gltf.scene;actor.rotation.y=Math.PI;actor.updateMatrixWorld(true);
  const bbox=new THREE.Box3().setFromObject(actor);const sz=bbox.getSize(new THREE.Vector3());
  if(!(sz.y>.01))throw Error('INVALID_ACTOR_BOUNDS');
  actor.scale.multiplyScalar(1.83/sz.y);actor.updateMatrixWorld(true);
  bbox.setFromObject(actor);actor.position.y-=bbox.min.y;
  scientist.add(actor);
  mixer=new THREE.AnimationMixer(actor);mixer.clipAction(gltf.animations[0]).play();
  scientistReady=true;$('status').textContent='CIENTÍFICO · EN RECORRIDO';
 }catch(e){scientistError=String(e.message||e);$('status').textContent='CIENTÍFICO · FALLO DE RIG';}
},undefined,e=>{scientistError=String(e.message||e);$('status').textContent='CIENTÍFICO · NO CARGADO';});
// Walking path stays inside connected corridors and stops near the panoramic glass.
const route=new THREE.CatmullRomCurve3([
 new THREE.Vector3(-22,0,2.5),new THREE.Vector3(-17.5,0,-4.8),
 new THREE.Vector3(-12,0,.3),new THREE.Vector3(-5.4,0,.4),
 new THREE.Vector3(0,0,-3.0),new THREE.Vector3(5.5,0,.3),
 new THREE.Vector3(12,0,.3),new THREE.Vector3(19,0,-4.0),
 new THREE.Vector3(22,0,2.4),new THREE.Vector3(11,0,.3),
 new THREE.Vector3(0,0,.3),new THREE.Vector3(-12,0,.3)
],true,'catmullrom',.22);
const keys=new Set();let yaw=0,pitch=.055,sceneTime=0,last=performance.now(),tour=false,tourStart=0;
const motion={x:0,y:0},stick=$('joystick'),knob=$('knob');
function setStick(e){
 const b=stick.getBoundingClientRect(),dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2);
 const m=Math.max(1,Math.hypot(dx,dy)),lim=b.width*.34,k=Math.min(m,lim)/m;
 const x=dx*k,y=dy*k;knob.style.transform='translate('+x+'px,'+y+'px)';
 motion.x=x/lim;motion.y=-y/lim;
}
stick.addEventListener('pointerdown',e=>{stick.setPointerCapture(e.pointerId);setStick(e);e.preventDefault();});
stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))setStick(e);});
function stopStick(){motion.x=motion.y=0;knob.style.transform='';}
stick.addEventListener('pointerup',stopStick);stick.addEventListener('pointercancel',stopStick);
let looking=false,lookId=null,oldX=0,oldY=0;
canvas.addEventListener('pointerdown',e=>{if(tour)return;looking=true;lookId=e.pointerId;oldX=e.clientX;oldY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{
 if(!looking||e.pointerId!==lookId)return;
 yaw-=(e.clientX-oldX)*.0038;
 pitch=Math.max(-1.12,Math.min(1.12,pitch+(e.clientY-oldY)*.0029));
 oldX=e.clientX;oldY=e.clientY;
});
canvas.addEventListener('pointerup',()=>{looking=false;});canvas.addEventListener('pointercancel',()=>{looking=false;});
addEventListener('keydown',e=>{keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();});
addEventListener('keyup',e=>keys.delete(e.code));
const roomButtons=[...document.querySelectorAll('[data-room]')];
function goRoom(n){
 tour=false;$('tour').setAttribute('aria-pressed','false');$('tour').textContent='▶ RECORRIDO';
 const x=[-18,0,18][n];camera.position.set(x,2.05,3.5);yaw=0;pitch=.03;
 roomButtons.forEach(b=>b.setAttribute('aria-current',String(+b.dataset.room===n)));
}
roomButtons.forEach(b=>b.addEventListener('click',()=>goRoom(+b.dataset.room)));
$('tour').addEventListener('click',()=>{
 tour=!tour;tourStart=sceneTime;$('tour').setAttribute('aria-pressed',String(tour));
 $('tour').textContent=tour?'■ EXPLORAR':'▶ RECORRIDO';
});
const tourCurve=new THREE.CatmullRomCurve3([
 new THREE.Vector3(-22,2.1,5),new THREE.Vector3(-18,2.2,-7.6),
 new THREE.Vector3(-12,2.1,.3),new THREE.Vector3(-2,2.2,.3),
 new THREE.Vector3(3,2.05,-7),new THREE.Vector3(13,2.1,.3),
 new THREE.Vector3(21,2.15,-7.2),new THREE.Vector3(15,2.1,3)
],true);
$('shot').addEventListener('click',()=>{window.__NEREIDA_CAPTURE__=true;});
function moveCamera(dt){
 const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)+motion.y;
 const strafe=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+motion.x;
 if(keys.has('ArrowLeft'))yaw+=dt*1.5;if(keys.has('ArrowRight'))yaw-=dt*1.5;
 const len=Math.max(1,Math.hypot(forward,strafe));
 const speed=(keys.has('ShiftLeft')?7.8:4.15)*dt/len;
 const oldX=camera.position.x,ox=oldX,oz=camera.position.z;
 let x=ox+(Math.sin(yaw)*forward+Math.cos(yaw)*strafe)*speed;
 let z=oz+(-Math.cos(yaw)*forward+Math.sin(yaw)*strafe)*speed;
 x=THREE.MathUtils.clamp(x,-24.35,24.35);z=THREE.MathUtils.clamp(z,-10.55,7.7);
 for(const wall of [-8.4,8.4]){
  if((oldX<wall&&x>=wall-.38||oldX>wall&&x<=wall+.38)&&Math.abs(z-.1)>1.77) x=oldX;
 }
 camera.position.set(x,2.05,z);
}
function updateLocation(){
 const n=camera.position.x<-8.4?0:camera.position.x>8.4?2:1;
 roomButtons.forEach(b=>b.setAttribute('aria-current',String(+b.dataset.room===n)));
}
function update(now){
 const dt=Math.min(.045,Math.max(0,(now-last)/1000));last=now;sceneTime+=dt;
 if(tour){
  const u=((sceneTime-tourStart)/55)%1,p=tourCurve.getPointAt(u);
  camera.position.lerp(p,Math.min(1,dt*2.7));
  camera.lookAt(p.x+Math.sin((sceneTime-tourStart)*.18)*2.4,2.6,-21);
 }else{
  moveCamera(dt);
  const dir=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  camera.lookAt(camera.position.clone().add(dir));
 }
 const t=sceneTime;
 for(const f of fish){
  f.o.position.x+=f.dir*f.speed*dt;
  if(f.o.position.x>79)f.o.position.x=-79;
  if(f.o.position.x< -79)f.o.position.x=79;
  f.o.position.y=f.y+Math.sin(t*.77+f.seed*1.8)*.24;
  f.o.rotation.z=Math.sin(t*2.3+f.seed)*.05;
 }
 leviathan.position.x=-25+(t*.46%64);
 leviathan.position.y=-1.5+Math.sin(t*.17)*1.65;
 manta.position.x=-14+(t*.65%80);
 manta.position.y=1.7+Math.sin(t*.38)*2;
 manta.rotation.z=Math.sin(t*.32)*.1;
 for(let i=0;i<3;i++){hoops[i].rotation.z+=dt*(i%2?-.22:.18);}
 antenna.rotation.y+=dt*.15;
 if(scientistReady){
  const u=((t*.014)%1),p=route.getPointAt(u),d=route.getTangentAt(u);
  scientist.position.set(p.x,0,p.z);
  scientist.rotation.y=Math.atan2(d.x,d.z);
  if(mixer)mixer.update(dt*.78);
 }
 const a=bubGeom.attributes.position;
 for(let i=0;i<bubbleCount;i++){
  const b=bubSeed[i];a.setY(i,-13+((b[1]+13+t*b[3])%39));
  a.setX(i,b[0]+Math.sin(t*.55+i)*.35);
 }
 a.needsUpdate=true;
 if(Math.floor(t*8)!==Math.floor((t-dt)*8))screens.forEach(s=>screenDraw(s,t));
 renderer.render(scene,camera);
 if(window.__NEREIDA_CAPTURE__){
  window.__NEREIDA_CAPTURE__=false;
  try{const a=document.createElement('a');a.download='nereida-ii-'+Math.floor(t)+'.png';a.href=renderer.domElement.toDataURL('image/png');a.click();}
  catch(e){$('status').textContent='CAPTURA NO DISPONIBLE';}
 }
 if(!tour)updateLocation();
 requestAnimationFrame(update);
}
addEventListener('resize',()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
 renderer.setSize(innerWidth,innerHeight);
});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail('CONTEXT_LOST','La GPU perdió el contexto. Recargá esta página.');});
addEventListener('unhandledrejection',e=>{console.error('NEREIDA_RUNTIME',e.reason);});
screens.forEach(s=>screenDraw(s,0));
notice.hidden=true;
window.__NEREIDA_STATE__={phase:'RUNNING',version:'2.0.0-wave002',rooms:3,windows:10,fish:fish.length,largeCreatures:2,ocean:'SPATIAL_3D',actorAsset:assetUrl,actorStatus:'LOADING',quality:'UNREVIEWED'};
// Runtime actor state is exposed directly, without an idle polling timer.
window.__NEREIDA_GET_ACTOR_STATUS__=()=>scientistReady?'LOADED_ANIMATED':scientistError?'LOAD_FAILED':'LOADING';
requestAnimationFrame(update);
