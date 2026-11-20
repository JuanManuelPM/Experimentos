import * as THREE from 'three';
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
scene.background=new THREE.Color(0x111713);scene.fog=new THREE.FogExp2(0x111713,0.022);
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
const tunnel=new THREE.Group();world.add(tunnel);
for(let side of [-1,1]){
 box(tunnel,side*2.05,1.44,0,.16,3.10,28,mat(0x182a25,.92));
 for(let z=-13;z<14;z+=1.45){
  box(tunnel,side*2.01,1.55,z,.12,2.4,.11,z%3<1?mat(0x8c7151,.7):mat(0x435852,.73));
  box(tunnel,side*2.02,2.38,z,.13,.07,.20,mat(0xdabf86,.3,.1,0x927648));
 }
}
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
function passenger(profile,seat){
 const g=new THREE.Group();g.position.set(seat.x,.02,seat.z);g.rotation.y=seat.yaw;world.add(g);
 const skin=mat(profile.skin,.87),coat=mat(profile.coat,.8),hair=mat(profile.hair,.94),pants=mat(0x34373b,.89),shoe=mat(0x292721,.7);
 const sc=profile.shape;
 // Hips and torso are curves, not box stand-ins. Knees project forward toward aisle.
 orb(g,0,.77,.005,.29*sc,.18,.24,coat);
 const torso=orb(g,0,1.07,-.035,.31*sc,.38,.22,coat);
 torso.rotation.x=-.09;
 orb(g,0,1.41,-.025,.095,.10,.085,skin);
 orb(g,0,1.62,-.02,.205*sc,.238,.192*sc,skin,22);
 // ears, nose, eyes and brows aligned toward local +Z; readable from aisle
 for(const v of [-1,1]){
  orb(g,v*.195*sc,1.62,-.02,.040,.069,.045,skin);
  orb(g,v*.081*sc,1.645,.153,.023,.017,.011,mat(0x211c19,.85));
  const brow=box(g,v*.083*sc,1.69,.158,.085,.014,.015,hair);brow.rotation.z=v*.11;
 }
 orb(g,0,1.593,.180,.034,.040,.053,skin,12);
 // shape-specific hairstyling and an occasional brim/sideburns
 if(profile.hairStyle===0){orb(g,0,1.81,-.06,.216*sc,.085,.19,hair);for(let x of [-.17,.17])orb(g,x,1.7,-.08,.057,.13,.15,hair)}
 if(profile.hairStyle===1){orb(g,0,1.81,-.04,.224*sc,.115,.198,hair);for(let j=0;j<4;j++)orb(g,-.16+j*.1,1.81,.09,.055,.08,.06,hair)}
 if(profile.hairStyle===2){orb(g,0,1.80,-.045,.235*sc,.13,.20,hair);for(let x of [-.20,.20])orb(g,x,1.66,-.13,.10,.25,.12,hair)}
 if(profile.hairStyle===3){orb(g,0,1.81,-.07,.23*sc,.07,.20,hair);orb(g,0,1.72,-.04,.255,.18,.12,hair)}
 if(profile.hairStyle===4){orb(g,0,1.81,-.05,.23*sc,.07,.19,hair);orb(g,0,1.79,.02,.26,.035,.27,hair);orb(g,0,1.83,-.04,.17,.13,.15,coat)}
 for(const sign of [-1,1]){
  // thigh toward aisle, shin downward; grounded shoe height 0.10
  beam(g,[sign*.16,.69,.16],[sign*.18,.60,.43],.093*sc,pants);
  orb(g,sign*.18,.60,.43,.105,.105,.11,pants);
  beam(g,[sign*.18,.58,.43],[sign*.19,.18,.44],.068*sc,pants);
  orb(g,sign*.19,.12,.50,.11,.073,.20,shoe);
  orb(g,sign*.31*sc,1.29,-.01,.105,.13,.14,coat);
  const armEnd=profile.accessory==="none"?[sign*.27,.88,.17]:[sign*.16,.93,.29];
  beam(g,[sign*.29*sc,1.25,.02],[sign*.30*sc,1.02,.14],.082,coat);
  beam(g,[sign*.30*sc,1.02,.14],armEnd,.067,coat);
  orb(g,...armEnd,.064,.085,.068,skin);
 }
 // Each passenger carries a visual cue, not arbitrary random-color cloning.
 const paper=mat(0xe6d8b7,.92),ink=mat(0x414035,.92);
 if(profile.accessory==="newspaper"||profile.accessory==="paper"){
  const p=box(g,0,1.03,.34,.44,.29,.025,paper);p.rotation.x=-.26;
  for(let j=0;j<4;j++)box(g,-.09,1.10-j*.054,.36,.16,.008,.03,ink);
 }else if(profile.accessory==="book"){
  const p=box(g,0,.95,.36,.30,.18,.06,mat(0x775643,.76));p.rotation.x=-.45;
  box(g,0,.98,.387,.25,.12,.006,paper);
 }else if(profile.accessory==="satchel"||profile.accessory==="bag"){
  orb(g,.30,.81,.14,.20,.19,.12,mat(profile.accessory==="bag"?0x5e4632:0x352c28,.89));
  beam(g,[.36,1.27,-.02],[.30,.81,.12],.018,BRASS);
 }else if(profile.accessory==="cane"){
  beam(g,[.32,.97,.30],[.42,.12,.47],.025,BRASS);
 }
 return g;
}
for(const p of passengers)passenger(p,seats.find(s=>s.id===p.seatId));
// Nostalgic in-world posters. Not UI overlays.
board(world,0,1.46,-6.31,.52,.85,"VIAJE","#e6bf81","#49372a");
// Tunnel platform seen through the open front threshold
box(world,0,-.08,8,3.6,.12,3.3,mat(0x777362,.93));
for(let x of [-1.4,1.4])box(world,x,1.75,8.75,.45,3.4,.35,mat(0x484e47,.79));
// film controller
let playing=true,free=false,sound=false,elapsed=0,last=performance.now(),yaw=0,pitch=0,freeEye=new THREE.Vector3(0,1.55,.2),audio=null;
const ui={play:document.getElementById('play'),prev:document.getElementById('prev'),next:document.getElementById('next'),free:document.getElementById('free'),sound:document.getElementById('sound'),label:document.getElementById('label'),progress:document.getElementById('progress')};
if(new URLSearchParams(location.search).has('canary')){playing=false;elapsed=shotStart(3);}
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
let down=null;
renderer.domElement.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);if(!free){ui.free.click()}});
renderer.domElement.addEventListener('pointermove',e=>{if(!down||!free)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;yaw-=dx*.0035;pitch=Math.max(-1.15,Math.min(1.15,pitch-dy*.0033));down={x:e.clientX,y:e.clientY};applyCinema()});
renderer.domElement.addEventListener('pointerup',()=>down=null);
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
 // Slight warm carriage sway and moving tunnel panels; no body movement falsely represented.
 tunnel.position.z=((now*.0011)%1.45);
 if(!free&&playing&&elapsed>5){world.rotation.z=Math.sin(now*.00165)*.0014}else world.rotation.z=0;
 applyCinema();renderer.render(scene,camera);requestAnimationFrame(frame);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
window.__TRANSPORT_QA__={sceneId:'transporte-retro-001',seatCount:seats.length,npcCount:passengers.length,freeSeats:seats.filter(s=>s.vacant).map(s=>s.id),shotCount:SHOTS.length,shotIds:SHOTS.map(s=>s.id),flowVersion:'1.1.0',renderer:'Three.js',artApproval:'NOT_REVIEWED'};
requestAnimationFrame(frame);
