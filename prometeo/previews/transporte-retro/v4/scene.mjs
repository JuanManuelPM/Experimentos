import * as THREE from 'three';
import {makeActor,createSeated} from './cast.mjs';
import {heroAt} from './motion.mjs';
import {CAR,seatLayout,validateClearance} from './capabilities/seat-layout/v0.1.0/index.mjs';
import {populateSeats,assertCrowd} from './capabilities/seated-crowd/v0.1.0/index.mjs';
import {SHOTS,TOTAL_SECONDS,cameraAt,shotStart} from './capabilities/transit-camera/v0.1.0/index.mjs';

const seats=seatLayout(),passengers=populateSeats(seats);
if(validateClearance(seats).length||assertCrowd(passengers,seats).length)throw Error('Scene layout contract failed');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.65));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.30;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x0b1522);scene.fog=new THREE.FogExp2(0x0b1522,0.014);
const camera=new THREE.PerspectiveCamera(69,innerWidth/innerHeight,.045,85);
const world=new THREE.Group();scene.add(world);
const materials=new Map();
function mat(c,rough=.68,metal=0,emissive=0){
 const key=[c,rough,metal,emissive].join(':');
 if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:metal,emissive:emissive,emissiveIntensity:emissive?.2:0}));
 return materials.get(key);
}
const WOOD=mat(0x744229,.48,.08),WOOD2=mat(0x9b643a,.43,.07),DARK=mat(0x34251b,.74),BRASS=mat(0xc4a067,.25,.72),CREAM=mat(0xe9cf97,.62),WALL=mat(0x74644b,.65),FLOOR=mat(0x403a2e,.86),IRON=mat(0x5f6763,.32,.75),WINDOW=mat(0x18363b,.17,.2);
function add(parent,mesh,x=0,y=0,z=0){mesh.position.set(x,y,z);parent.add(mesh);return mesh}
function box(parent,x,y,z,w,h,d,m){return add(parent,new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),x,y,z)}
function orb(parent,x,y,z,sx,sy,sz,m,segments=18){const o=add(parent,new THREE.Mesh(new THREE.SphereGeometry(1,segments,12),m),x,y,z);o.scale.set(sx,sy,sz);return o}
function cyl(parent,x,y,z,r1,r2,h,m,seg=12){return add(parent,new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),m),x,y,z)}
function beam(parent,a,b,r,m,seg=9){const p=new THREE.Vector3(...a),q=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(q,p);const mesh=add(parent,new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),seg),m),...(p.clone().add(q).multiplyScalar(.5)).toArray());mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return mesh}
function torus(parent,x,y,z,r,t,m){return add(parent,new THREE.Mesh(new THREE.TorusGeometry(r,t,9,18),m),x,y,z)}
function board(parent,x,y,z,w,h,textureText,ground,ink){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=384;
 const ctx=canvas.getContext('2d');ctx.fillStyle=ground;ctx.fillRect(0,0,256,384);
 ctx.strokeStyle='rgba(20,10,3,.32)';ctx.lineWidth=5;ctx.strokeRect(10,10,236,364);
 ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='900 47px Georgia';ctx.fillText(textureText,128,144);
 ctx.fillRect(40,171,176,3);ctx.font='italic 25px Georgia';ctx.fillText('CIUDAD',128,216);ctx.font='16px Georgia';ctx.fillText('VIAJES • OTOÑO',128,258);
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
 box(parent,x,y,z,w+.075,h+.075,.03,WOOD);
 const sign=box(parent,x,y,z+.018,w,h,.005,new THREE.MeshStandardMaterial({map,roughness:.79}));
 return sign;
}
// Architectural body: continuous floor, shell, curved ceiling, roof ribs and end bulkheads.
box(world,0,-.02,0,3.16,.16,12.8,FLOOR);
for(let k=-7;k<=7;k++)box(world,0,.067,k*.79,3.0,.012,.035,IRON);
for(let x of [-1.55,1.55]){
 box(world,x,.52,0,.115,1.05,12.8,WOOD);
 box(world,x,2.36,0,.12,.55,12.8,WALL);
 box(world,x,1.08,0,.15,.11,12.8,BRASS);
 box(world,x,2.10,0,.15,.11,12.8,BRASS);
 for(let z=-5.85;z<=5.86;z+=1.5){
  box(world,x,1.60,z,.15,1.13,.12,WOOD2);
  box(world,x,2.62,z,.17,.20,.16,WOOD);
 }
 // windows: panels behind seats, kept translucent for side parallax
 const pane=new THREE.MeshPhysicalMaterial({color:0x335e5f,transparent:true,opacity:.27,roughness:.18,metalness:.2,depthWrite:false,side:THREE.DoubleSide});
 for(let z=-5.1;z<5.4;z+=1.5){
  box(world,x,1.62,z,.024,.88,1.24,pane);
  box(world,x,1.62,z,.05,.04,1.22,BRASS);
 }
}
for(let i=0;i<18;i++){const x=-1.56+i*(3.12/17);const y=2.56+.27*(1-(x/1.56)**2);box(world,x,y,0,.23,.10,12.76,i%3===0?WOOD2:CREAM)}
for(let z=-6.1;z<6.5;z+=1.58){
 for(let x=-1.45;x<=1.48;x+=.43){const y=2.59+.27*(1-(x/1.56)**2);box(world,x,y,z,.055,.085,.055,BRASS)}
}
// Back wall; front bulkhead with open doorway, frames and hinged side doors.
box(world,0,1.40,-6.40,3.16,2.82,.13,WOOD);
box(world,-1.33,1.40,6.40,.50,2.82,.14,WOOD);
box(world,1.33,1.40,6.40,.50,2.82,.14,WOOD);
box(world,0,2.57,6.40,2.17,.49,.14,WOOD);
for(let x of [-.99,.99])box(world,x,1.36,6.40,.065,2.45,.09,BRASS);
box(world,0,2.29,6.40,1.95,.06,.10,BRASS);
box(world,-1.07,.71,6.37,.65,1.36,.085,WOOD);
box(world,1.07,.71,6.37,.65,1.36,.085,WOOD);
// motion outside windows: repeating illuminated station columns
// World outside the bus: real street depth, blocks, lit windows and parallax, not a gradient.
const city=new THREE.Group();world.add(city);
function rngFactory(seed){let a=seed>>>0;return()=>((a=(Math.imul(1664525,a)+1013904223)>>>0)/4294967296);}
const rng=rngFactory(412);
const facingWindow=new THREE.BoxGeometry(.04,.20,.30),windowData=[[],[]];
const colorFacades=[0x233442,0x39424a,0x42373c,0x374b49,0x55483e];
for(let side of [-1,1]){
 box(city,side*3.5,-.53,0,3.1,.05,310,mat(0x252b31,.94));
 box(city,side*4.6,-.40,0,.22,.28,310,mat(0x65605b,.88));
 for(let z=-250;z<=250;z+=7.7){
  const h=4.2+Math.floor(rng()*5)*1.35,deep=3.0+rng()*2.5,px=side*(7.1+rng()*1.9);
  const facade=mat(colorFacades[Math.floor(rng()*colorFacades.length)],.91);
  box(city,px,h/2-.43,z,deep,h,6.4,facade);
  box(city,px,h-.35,z,deep+.12,.18,6.55,mat(0x2b3034,.86));
  const floorCount=Math.max(2,Math.floor(h/1.25));
  for(let f=0;f<floorCount;f++)for(let c=-2;c<=2;c++){
   if(rng()>.75)continue;
   const wy=.75+f*1.09,wz=z+c*.99,wx=px-side*(deep/2+.045);
   windowData[rng()>.43?0:1].push([wx,wy,wz]);
  }
  if(rng()>.6){
   box(city,px-side*(deep/2+.35),.51,z+.8,.14,.55,.95,mat(0x75564a,.7));
   box(city,px-side*(deep/2+.35),.83,z+.8,.19,.08,.98,mat(0xd2aa67,.46,.1,0x65421d));
  }
 }
 for(let z=-220;z<=220;z+=17){
  beam(city,[side*4.08,-.35,z],[side*4.08,4.2,z],.055,IRON);
  box(city,side*4.06,4.12,z,.35,.14,.38,mat(0xe4bd79,.24,0,0x9b7937));
 }
}
const paneMat=[new THREE.MeshBasicMaterial({color:0xf2cb88}),new THREE.MeshBasicMaterial({color:0x81b7cf})];
for(let k=0;k<2;k++){
 const mesh=new THREE.InstancedMesh(facingWindow,paneMat[k],windowData[k].length),obj=new THREE.Object3D();
 windowData[k].forEach((v,i)=>{obj.position.set(...v);obj.updateMatrix();mesh.setMatrixAt(i,obj.matrix)});
 mesh.instanceMatrix.needsUpdate=true;city.add(mesh);
}
// Real moving ground and a distant skyline around the vehicle.
const asphalt=mat(0x1c2530,.94),marking=mat(0xc7a36b,.75);
box(world,0,-.70,0,8.2,.18,300,asphalt);
const roadLines=new THREE.Group();world.add(roadLines);for(let z=-130;z<=130;z+=6.6)box(roadLines,0,-.595,z,.07,.006,3.4,marking);

// Ceiling hanging straps and overhead bulbs
for(let z=-4.8;z<=5.0;z+=1.42){
 for(let x of [-.68,.68]){
  beam(world,[x,2.77,z],[x,2.24,z],.014,BRASS);
  const t=torus(world,x,2.17,z,.105,.022,CREAM);t.rotation.y=Math.PI/2;
 }
}
const bulbs=[];
for(let z=-5.6;z<6.0;z+=1.8){
 cyl(world,0,2.69,z,.12,.16,.13,BRASS);
 orb(world,0,2.57,z,.21,.16,.21,mat(0xffe8b6,.18,0,0x71502c));
 const light=new THREE.PointLight(0xffd49a,3.1,4.8,2);light.position.set(0,2.43,z);scene.add(light);bulbs.push(light);
}
scene.add(new THREE.HemisphereLight(0xb3bec2,0x57402b,2.4));
const fill=new THREE.DirectionalLight(0xffd9ac,1.4);fill.position.set(1,4,2);scene.add(fill);
for(let z=-5.15;z<5.25;z+=3){
 for(let x of [-1.55,1.55]){
  beam(world,[x,0.16,z],[x,2.68,z],.036,BRASS);
  beam(world,[x,2.52,z],[Math.sign(x)*.80,2.74,z],.03,BRASS);
 }
}
// Seat bank kit: individual curved wood seats with bronze brackets, inset cushions intentionally omitted.
function makeSeat(s){
 const g=new THREE.Group();g.position.set(s.x,0,s.z);g.rotation.y=s.yaw;world.add(g);
 const plank=(x,y,z,w,h,d,m)=>box(g,x,y,z,w,h,d,m);
 // Local +Z is toward passenger's front/aisle.
 plank(0,.49,0,.83,.11,.60,WOOD2);
 for(let j=0;j<5;j++)plank(0,.56,.22-j*.115,.82,.022,.088,j%2?WOOD:WOOD2);
 for(let y=.65;y<1.16;y+=.12)plank(0,y,-.33,.84,.088,.06,y>.95?WOOD2:WOOD);
 plank(0,.86,-.37,.92,.67,.075,DARK);
 for(let x of [-.39,.39]){
  beam(g,[x,.15,-.22],[x,.49,-.2],.027,BRASS);
  beam(g,[x,.17,.18],[x,.51,.20],.027,BRASS);
  plank(x,.75,-.33,.044,.66,.07,BRASS);
 }
 for(let x of [-.36,.36])plank(x,.59,.17,.034,.027,.35,BRASS);
 return g;
}
for(const s of seats)makeSeat(s);
// Accessories: author-owned geometric outfits with deliberately different silhouettes.
const seatedActors=passengers.map(p=>({profile:p,actor:createSeated(world,p,seats.find(s=>s.id===p.seatId))}));
// Nostalgic in-world posters. Not UI overlays.
board(world,0,1.46,-6.31,.52,.85,"VIAJE","#e6bf81","#49372a");
// Tunnel platform seen through the open front threshold
// Boarding threshold, no floating station columns attached to the moving bus.
box(world,0,-.08,6.85,1.15,.12,1.0,mat(0x777362,.93));
// A complete exterior hull supports exterior wide shots, not just a floating cabin.
const BLUE=mat(0x254d5d,.47,.25),CREAM2=mat(0xe3c8a0,.67),RUBBER=mat(0x161b1d,.89),RED=mat(0xbf4139,.39,0,0x4c1010);
for(const side of [-1,1]){
 box(world,side*1.60,.50,0,.14,.97,12.85,BLUE);
 box(world,side*1.60,2.48,0,.15,.43,12.85,CREAM2);
 box(world,side*1.68,.93,0,.035,.08,12.75,BRASS);
 for(let z of [-4.60,4.55]){
  const tire=cyl(world,side*1.67,-.32,z,.48,.48,.24,RUBBER,24);tire.rotation.z=Math.PI/2;
  const hub=cyl(world,side*1.81,-.32,z,.21,.21,.25,IRON,20);hub.rotation.z=Math.PI/2;
  torus(world,side*1.82,-.32,z,.24,.019,BRASS).rotation.y=Math.PI/2;
 }
}
box(world,0,2.89,0,3.08,.17,12.83,BLUE);
// Exterior details: riveted waist band, grille, fleet badge and bumper.
for(let x of [-1.64,1.64])for(let z=-6;z<=6;z+=.34)orb(world,x,.77,z,.015,.017,.017,BRASS,8);
for(let i=0;i<13;i++)box(world,-.62+i*.10,.42,6.57,.055,.32,.045,IRON);
box(world,0,.20,6.57,2.82,.15,.16,IRON);
for(let x of [-1.24,1.24])box(world,x,.72,-6.56,.20,.12,.05,RED);
for(let x of [-.74,.74])box(world,x,2.99,0,.09,.06,12.3,BRASS);
box(world,0,1.0,-6.48,2.8,2.0,.17,BLUE);
box(world,0,2.55,-6.51,2.90,.42,.13,CREAM2);
box(world,0,2.64,6.51,2.85,.36,.16,CREAM2);
for(let x of [-1.2,1.2]){
 orb(world,x,.92,6.51,.20,.14,.06,mat(0xffe2a2,.17,0,0xb98845));
 orb(world,x,.92,-6.52,.17,.13,.06,RED);
}
const destination=board(world,0,2.61,6.56,1.35,.31,'Nº 42','#e1c992','#2c3d42');
const steering=torus(world,-.96,1.23,5.62,.30,.038,RUBBER);steering.rotation.x=.55;
beam(world,[-.96,1.2,5.59],[-.96,.8,5.93],.035,IRON);
const driverSeat={id:'DRIVER',x:-.95,z:5.0,yaw:0};
makeSeat(driverSeat);
const driver=createSeated(world,{id:'conductor',skin:0x9d7257,coat:0x2e4351,hair:0x25201e,accessory:'none'},driverSeat);
const hero=makeActor(world,{id:'viajero',skin:0xa8785d,coat:0x315362,hair:0x261e1b,accessory:'satchel'});
const modelStatus='AUTHOR_MESH';
function updateActor(t,dt){
 const p=heroAt(t);hero.root.position.set(p.x,.055,p.z);hero.root.rotation.y=p.yaw;hero.pose({t,...p});
 for(const [i,s] of seatedActors.entries()){
 const greet=s.profile.seatId==='R4'&&t>=26&&t<30?Math.sin((t-26)/4*Math.PI):0;
 s.actor.pose({t:t+i*.83,sit:1,greet});
 }
 driver.pose({t,sit:1,drive:1});
 city.position.z=-Math.max(0,t-14)*2.9;
 roadLines.position.z=-(Math.max(0,t-14)*2.9)%6.6;
}
// film controller
let playing=true,free=false,sound=false,elapsed=0,last=performance.now(),yaw=0,pitch=0,freeEye=new THREE.Vector3(0,1.55,.2),audio=null;
const ui={play:document.getElementById('play'),prev:document.getElementById('prev'),next:document.getElementById('next'),free:document.getElementById('free'),sound:document.getElementById('sound'),label:document.getElementById('label'),progress:document.getElementById('progress')};
if(new URLSearchParams(location.search).has('paused')){playing=false;elapsed=shotStart(3);}
function applyCinema(){
 if(!free){
  const s=cameraAt(elapsed);
  camera.position.set(...s.eye);camera.lookAt(...s.target);camera.fov=s.fov;camera.updateProjectionMatrix();
  ui.label.textContent=(s.index+1)+"/"+SHOTS.length+"   "+s.id.replaceAll('-',' ');
 }else{
  camera.position.copy(freeEye);
  camera.rotation.set(pitch,yaw,0,'YXZ');
  ui.label.textContent='LIBRE';
 }
 ui.play.textContent=playing?'Ⅱ':'▶';ui.free.classList.toggle('active',free);
 ui.progress.style.width=(elapsed/TOTAL_SECONDS*100).toFixed(2)+'%';
}
ui.play.onclick=()=>{if(elapsed>TOTAL_SECONDS-.2)elapsed=0;playing=!playing;free=false;applyCinema()};
ui.prev.onclick=()=>{let s=cameraAt(elapsed);elapsed=shotStart(Math.max(0,s.index-1));playing=false;free=false;applyCinema()};
ui.next.onclick=()=>{let s=cameraAt(elapsed);elapsed=shotStart(Math.min(SHOTS.length-1,s.index+1));playing=false;free=false;applyCinema()};
ui.free.onclick=()=>{free=!free;playing=false;if(free){freeEye.copy(camera.position);const v=new THREE.Vector3();camera.getWorldDirection(v);yaw=Math.atan2(-v.x,-v.z);pitch=Math.asin(v.y)}applyCinema()};
const pointers=new Map();let dragTravel=0;
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{if(!pointers.size)dragTravel=0;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});canvas.setPointerCapture(e.pointerId)});
canvas.addEventListener('pointermove',e=>{
 const old=pointers.get(e.pointerId);if(!old)return;const dx=e.clientX-old.x,dy=e.clientY-old.y;dragTravel+=Math.hypot(dx,dy);
 const other=[...pointers].find(([id])=>id!==e.pointerId)?.[1];pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(dragTravel<6&&!other)return;if(!free)ui.free.click();
 if(other){const d0=Math.hypot(old.x-other.x,old.y-other.y),d1=Math.hypot(e.clientX-other.x,e.clientY-other.y);
 if(d0>10&&d1>10){camera.fov=Math.max(35,Math.min(92,camera.fov*d0/d1));camera.updateProjectionMatrix()}
 }else{yaw-=dx*.0035;pitch=Math.max(-1.15,Math.min(1.15,pitch-dy*.0033))}
 applyCinema();
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>pointers.delete(e.pointerId));
document.addEventListener('keydown',e=>{if(e.key===' '){e.preventDefault();ui.play.click()}if(e.key==='ArrowRight')ui.next.click();if(e.key==='ArrowLeft')ui.prev.click();if(!free)return;const a=(e.key==='w'||e.key==='ArrowUp')?.23:0;const b=(e.key==='s'||e.key==='ArrowDown')?.23:0;if(a||b){freeEye.x-=(a-b)*Math.sin(yaw);freeEye.z-=(a-b)*Math.cos(yaw);freeEye.x=Math.max(-.45,Math.min(.45,freeEye.x));freeEye.z=Math.max(-5.8,Math.min(5.8,freeEye.z));applyCinema()}});
ui.sound.onclick=async()=>{
 sound=!sound;ui.sound.textContent=sound?'♪':'◌';ui.sound.classList.toggle('active',sound);
 if(!audio&&sound){const ctx=new (window.AudioContext||window.webkitAudioContext)(), buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
 const d=buffer.getChannelData(0);let v=0;for(let i=0;i<d.length;i++){v=.985*v+(Math.random()*2-1)*.015;d[i]=v*.65}
 const src=ctx.createBufferSource();src.buffer=buffer;src.loop=true;
 const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=220;
 const gain=ctx.createGain();gain.gain.value=.0;src.connect(filter).connect(gain).connect(ctx.destination);src.start();audio={ctx,gain};
 }
 if(audio){await audio.ctx.resume();audio.gain.gain.setTargetAtTime(sound?.48:0,audio.ctx.currentTime,.3)}
};
function frame(now){
 const delta=Math.min(.07,(now-last)/1000);last=now;
 if(playing&&!free){elapsed+=delta;if(elapsed>=TOTAL_SECONDS){elapsed=TOTAL_SECONDS-.001;playing=false}}
 updateActor(elapsed,delta);
 // Warm cabin sway separate from the exterior tracking; the vehicle moves by relative city parallax.
 if(!free&&playing&&elapsed>5){world.rotation.z=Math.sin(now*.00165)*.0014}else world.rotation.z=0;
 applyCinema();renderer.render(scene,camera);requestAnimationFrame(frame);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
window.__TRANSPORT_QA__={sceneId:'transporte-retro-v4-wave003',seatCount:seats.length,npcCount:passengers.length,freeSeats:seats.filter(s=>s.vacant).map(s=>s.id),shotCount:SHOTS.length,shotIds:SHOTS.map(s=>s.id),flowVersion:'2.2.1',briefSha256:'97be264a6a1e1f53eda64b93a0de18a7f4df63a2e4c90a36c1a12922ccb5b40c',actorAsset:'original-profile-loft-cast',actorStatus:()=>modelStatus,renderer:'Three.js',artApproval:'NOT_REVIEWED'};
requestAnimationFrame(frame);

// A timeline that remains usable on a phone, independent of camera cut buttons.
const scrub=document.getElementById('scrub');if(scrub){scrub.max=TOTAL_SECONDS;scrub.addEventListener('input',()=>{elapsed=Number(scrub.value);playing=false;free=false;updateActor(elapsed,0);applyCinema();});const tickScrub=()=>{if(!scrub.matches(':active'))scrub.value=elapsed;requestAnimationFrame(tickScrub)};requestAnimationFrame(tickScrub)}
