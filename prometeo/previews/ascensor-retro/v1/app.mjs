import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import {createDoorPortal,assertDoorClearance} from './source/door-kit.mjs';
import {sampleCamera,sampleDoors,sampleVibration,sampleFloor,validateCameraTrack,validateThresholdCrossings,clamp} from './source/camera-timeline.mjs';
import {createSynthSound} from './source/synth-audio.mjs';
const cfg=await fetch('./scene.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('SCENE_CONFIG_HTTP_'+r.status);return r.json();});
const THREE_ID='three@0.160.1';
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x090e17);scene.fog=new THREE.FogExp2(0x0c1a23,.013);
const camera=new THREE.PerspectiveCamera(cfg.film.fov,innerWidth/innerHeight,.065,110);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,cfg.film.pixelRatioMax));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=cfg.film.exposure;
renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.insertBefore(renderer.domElement,document.body.firstChild);
const mat=(color,metalness=0,roughness=.6)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
const gold=mat(cfg.lobby.brass,.83,.29),darkGold=mat(0x776142,.71,.38),wood=mat(cfg.lobby.walnut,.11,.62);
const teal=mat(cfg.corridor.blue,.35,.52),ivory=mat(0x7a8889,.14,.68),deep=mat(0x151e28,.2,.4);
const black=mat(0x080d12,.3,.38),floor=mat(0x1d292e,.25,.3);
const cabWood=mat(cfg.cabin.wood,.18,.42),cabWall=mat(0x3a2b2d,.23,.37);
const coldFloor=mat(0x1b323c,.39,.25);
const marsh=mat(0x16323b,.15,.6);
const brassLit=mat(0xb78d57,.79,.29);
function box(parent,name,w,h,d,x,y,z,material,cast=true) {
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 o.name=name;o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o;
}
function lamp(parent,x,y,z,color,range=5,intensity=8){
 const p=new THREE.PointLight(color,intensity,range,1.5);p.position.set(x,y,z);parent.add(p);
 return p;
}
function paint(kind,hex,size=256){
 const c=document.createElement('canvas');c.width=size;c.height=size;
 const g=c.getContext('2d');g.fillStyle=hex;g.fillRect(0,0,size,size);
 let seed=kind==='stone'?313:kind==='wood'?571:919;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<2500;i++){
  const x=rnd()*size,y=rnd()*size;
  g.fillStyle=rnd()>.5?'rgba(234,222,197,.025)':'rgba(8,12,21,.07)';
  g.fillRect(x,y,kind==='wood'?1:1+rnd()*4,kind==='wood'?20+rnd()*80:1+rnd()*3);
 }
 if(kind==='stone')for(let i=0;i<35;i++){g.beginPath();g.moveTo(rnd()*size,rnd()*size);g.bezierCurveTo(rnd()*size,rnd()*size,rnd()*size,rnd()*size,rnd()*size,rnd()*size);g.strokeStyle='rgba(189,191,170,.05)';g.lineWidth=.7;g.stroke();}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
const stoneTexture=paint('stone','#50616a');stoneTexture.repeat.set(2,2);
const woodTexture=paint('wood','#503231');
const stone=new THREE.MeshStandardMaterial({color:0x8d9895,map:stoneTexture,roughness:.39,metalness:.28});
const grain=new THREE.MeshStandardMaterial({color:0x8b7370,map:woodTexture,roughness:.51,metalness:.08});
const lobby=new THREE.Group();lobby.name='lobby.pre-reality';scene.add(lobby);
box(lobby,'lobby.floor.base',cfg.lobby.roomWidth,.2,cfg.lobby.roomLength,0,-.125,3.5,floor);
box(lobby,'lobby.ceiling.base',cfg.lobby.roomWidth,.18,cfg.lobby.roomLength,0,4.11,3.5,wood);
for(let x=-6;x<=6;x+=.82)box(lobby,'lobby.floor.grout.x',.018,.008,cfg.lobby.roomLength,x,-.018,3.5,darkGold,false);
for(let z=-4;z<12;z+=.82)box(lobby,'lobby.floor.grout.z',cfg.lobby.roomWidth,.008,.018,0,-.018,z,darkGold,false);
for(const s of [-1,1]){
 box(lobby,'lobby.solid.wall',2.6,4.3,.27,s*2.67,2.04,.05,stone);
 box(lobby,'lobby.metal.pier',.28,4.0,.33,s*4.05,2.03,.21,gold);
 for(let i=0;i<5;i++)box(lobby,'lobby.pier.flute',.020,3.26,.044,s*(2.49+i*.22),2.03,.25,gold);
 for(let i=0;i<2;i++)box(lobby,'lobby.wall.recess',.36,1.87,.019,s*(2.12+i*.5),2.14,.215,cabWood);
 box(lobby,'lobby.sconce.back',.20,.84,.18,s*2.28,2.45,.42,gold);
 box(lobby,'lobby.sconce.glass',.12,.46,.08,s*2.28,2.45,.54,new THREE.MeshStandardMaterial({color:0xf2c489,emissive:0xd58c40,emissiveIntensity:2,transparent:true,opacity:.87}));
 lamp(lobby,s*2.28,2.42,.85,0xffb56a,5,5);
}
box(lobby,'lobby.lintel',6.2,.15,.3,0,3.57,.05,gold);
box(lobby,'lobby.frieze',6.2,.14,.3,0,3.74,.03,wood);
for(let s of [-1,1])box(lobby,'lobby.edge_wall',.16,4.0,13,s*6.22,2.0,5.0,stone);
lamp(lobby,-2.1,3.75,5.7,0xffc78c,13,17);
lamp(lobby,1.9,3.7,1.6,0xffae66,7,12);
const portalFront=createDoorPortal(THREE,cfg.door);portalFront.root.name='door.front';scene.add(portalFront.root);
const cab=new THREE.Group();cab.name='elevator.cabin';scene.add(cab);
box(cab,'cabin.floor',3.2,.19,3.48,0,-.105,-1.71,cabWood);
box(cab,'cabin.floor.inlay',2.76,.011,3.08,0,.002,-1.73,gold);
box(cab,'cabin.floor.inner',2.57,.009,2.84,0,.011,-1.74,floor);
for(const s of [-1,1]) {
 box(cab,'cabin.side-wall',.17,3.03,3.42,s*1.56,1.54,-1.73,grain);
 box(cab,'cabin.wood-panel',.025,2.62,1.07,s*1.465,1.63,-1.72,cabWall);
 for(let i=0;i<6;i++)box(cab,'cabin.fluting',.023,2.77,.041,s*(1.42+i*.009),1.54,-3.18+i*.52,gold);
 box(cab,'cabin.rail',.092,.06,3.12,s*1.37,1.01,-1.72,gold);
 for(const z of [-2.85,-1.75,-.66])box(cab,'cabin.rail.bracket',.11,.18,.06,s*1.37,.98,z,black);
 lamp(cab,s*1.03,2.78,-1.75,0xffc995,5,2.7);
}
box(cab,'cabin.roof',3.18,.18,3.49,0,3.09,-1.73,grain);
box(cab,'cabin.ceiling.trim',2.94,.016,3.28,0,2.98,-1.73,gold);
box(cab,'cabin.ceiling.light',.89,.016,1.10,0,2.94,-1.73,new THREE.MeshStandardMaterial({color:0xf6ce96,emissive:0xe9b778,emissiveIntensity:.8}));
box(cab,'cabin.back.wall.lintel',3.12,.34,.16,0,2.84,-3.48,grain);
const portalRear=createDoorPortal(THREE,cfg.door);portalRear.root.position.z=-3.48;portalRear.root.rotation.y=Math.PI;portalRear.root.name='door.rear';scene.add(portalRear.root);
const carIndicatorBox=box(cab,'floor.indicator.brass',.78,.31,.16,0,2.91,-.30,gold);
const indicatorCanvas=document.createElement('canvas');indicatorCanvas.width=256;indicatorCanvas.height=128;
const ig=indicatorCanvas.getContext('2d'),indicatorTexture=new THREE.CanvasTexture(indicatorCanvas);
indicatorTexture.colorSpace=THREE.SRGBColorSpace;
const screenMat=new THREE.MeshStandardMaterial({map:indicatorTexture,emissive:0xffaa51,emissiveMap:indicatorTexture,emissiveIntensity:.6,roughness:.21});
const indi=box(cab,'floor.indicator.glass',.58,.21,.009,0,2.92,-.395,screenMat,false);
indi.rotation.y=Math.PI;let lastFloor=null;
function updateIndicator(label){if(label===lastFloor)return;lastFloor=label;
 ig.fillStyle='#0c1118';ig.fillRect(0,0,256,128);
 ig.strokeStyle='#6d583e';ig.lineWidth=5;ig.strokeRect(7,6,242,116);
 ig.fillStyle='#f5bf70';ig.shadowColor='#ffa345';ig.shadowBlur=22;
 ig.font='bold 74px monospace';ig.textAlign='center';ig.textBaseline='middle';ig.fillText(label,128,68);ig.shadowBlur=0;
 indicatorTexture.needsUpdate=true;
}
const callPanel=box(lobby,'call.panel.plate',.27,.69,.115,1.55,1.40,.36,gold);
box(lobby,'call.panel.recess',.18,.59,.013,1.55,1.40,.425,black);
const callMat=new THREE.MeshStandardMaterial({color:0xb68555,emissive:0x2e1805,emissiveIntensity:0,metalness:.66,roughness:.31});
const callBtn=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.035,28),callMat);
callBtn.rotation.x=Math.PI/2;callBtn.position.set(1.55,1.43,.45);lobby.add(callBtn);
const corridor=new THREE.Group();corridor.name='threshold.unquiet';scene.add(corridor);
box(corridor,'corridor.floor.base',cfg.corridor.width,.21,cfg.corridor.length,0,-.13,-10.85,coldFloor);
box(corridor,'corridor.vault.ceiling',cfg.corridor.width,.16,cfg.corridor.length,0,3.65,-10.85,marsh);
for(const s of [-1,1])box(corridor,'corridor.wall.mass',.17,3.79,cfg.corridor.length,s*2.09,1.83,-10.85,stone);
for(let n=0;n<cfg.corridor.arches;n++){
 const z=cfg.corridor.startZ-cfg.corridor.archSpacing*n;
 for(const s of [-1,1]){
  box(corridor,'corridor.arch.pier',.18,2.62,.2,s*1.72,1.30,z,stone);
  box(corridor,'corridor.arch.flute',.018,2.42,.24,s*1.65,1.30,z,teal);
  box(corridor,'corridor.doorshadow',.024,2.22,.75,s*2.002,1.14,z-.85,black);
  box(corridor,'corridor.doorframe',.048,2.43,.85,s*1.995,1.24,z-.85,teal);
 }
 const a=new THREE.Mesh(new THREE.TorusGeometry(1.72,.087,7,56,Math.PI),stone);
 a.name='corridor.arch.curve';a.rotation.y=0;a.position.set(0,2.60,z);corridor.add(a);
 box(corridor,'corridor.ceiling.beam',3.5,.16,.15,0,3.48,z,teal);
 const ribLight=box(corridor,'corridor.tube',.86,.055,.16,0,3.30,z-.15,new THREE.MeshStandardMaterial({color:0x84e2d8,emissive:0x25888e,emissiveIntensity:1.2}));
 lamp(corridor,0,3.20,z,0x52d9d4,5.4,n===0?12:6);
}
for(let z=-4.5;z>-19;z-=.75){
 box(corridor,'corridor.floor.seam',cfg.corridor.width,.006,.015,0,-.012,z,teal,false);
}
box(corridor,'corridor.distant.end',cfg.corridor.width,3.8,.15,0,1.85,-18.85,black);
for(let i=0;i<10;i++){
 const x=-1.4+i*.31;box(corridor,'end.unusual.slit',.025,1.1,.018,x,1.8,-18.74,teal);
}
const lightGroup={warm:new THREE.PointLight(0xffae70,15,10,1.1),cold:new THREE.PointLight(0x42ccd4,10,16,1.2)};
lightGroup.warm.position.set(0,2.5,1);lightGroup.cold.position.set(0,3.0,-8);scene.add(lightGroup.warm,lightGroup.cold);
scene.add(new THREE.HemisphereLight(0x9ea6b7,0x241312,1.46));
const qaFit=[assertDoorClearance(portalFront),assertDoorClearance(portalRear)];
const qaCamera=validateCameraTrack(cfg.camera.tracks,cfg.mechanical);
const qaThreshold=validateThresholdCrossings(cfg.camera.tracks,cfg.mechanical,cfg.camera.thresholds);
if(!qaFit.every(x=>x.pass)||!qaCamera.pass||!qaThreshold.pass)throw Error('MECHANICAL_OR_CAMERA_PREFLIGHT_FAILED');
const sound=createSynthSound();let playing=false,elapsed=0,previous=0,clockOrigin=0,raf=0,mute=false;
const go=document.querySelector('#go'),gate=document.querySelector('#gate'),controls=document.querySelector('#controls'),toggle=document.querySelector('#toggle'),slider=document.querySelector('#timeline'),clock=document.querySelector('#clock'),soundButton=document.querySelector('#sound');
function showFrame(t){
 elapsed=clamp(t,0,cfg.duration);
 const opens=sampleDoors(elapsed,cfg.mechanical);portalFront.setOpen(opens.front);portalRear.setOpen(opens.back);
 const c=sampleCamera(elapsed,cfg.camera.tracks);
 const sh=sampleVibration(elapsed,cfg.camera.vibration);
 camera.position.set(c.x+sh.x,c.y+sh.y,c.z+sh.z);
 camera.rotation.order='YXZ';camera.rotation.set(c.pitch,c.yaw,sh.roll);
 callMat.emissiveIntensity=elapsed>=3.7&&elapsed<6.7?1.8:.08;
 updateIndicator(sampleFloor(elapsed,cfg.floors));
 const r=clamp((elapsed-13.9)/4,0,1);
 lightGroup.cold.intensity=10+15*r;lightGroup.warm.intensity=15-7*r;
 scene.fog.color.setRGB(.047-.014*r,.09+.07*r,.13+.065*r);
 scene.fog.density=.012+.009*r;
 renderer.render(scene,camera);
 slider.value=String(elapsed);slider.style.setProperty('--progress',(elapsed/cfg.duration*100).toFixed(2)+'%');
 clock.textContent='00:'+String(Math.floor(elapsed)).padStart(2,'0');
 return{doors:opens,camera:c,floor:lastFloor};
}
function step(now){
 if(!playing)return;
 elapsed=clamp((now-clockOrigin)/1000,0,cfg.duration);
 for(const c of cfg.soundCues){if(previous<c.at&&elapsed>=c.at)sound.cue(c.name)}
 previous=elapsed;showFrame(elapsed);
 if(elapsed>=cfg.duration){playing=false;toggle.textContent='↺';return}
 raf=requestAnimationFrame(step);
}
function play(){
 if(elapsed>=cfg.duration-.02){elapsed=0;previous=0;sound.reset()}
 sound.activate();clockOrigin=performance.now()-elapsed*1000;
 gate.classList.add('hide');controls.classList.add('visible');playing=true;toggle.textContent='Ⅱ';cancelAnimationFrame(raf);raf=requestAnimationFrame(step);
}
function pause(){playing=false;cancelAnimationFrame(raf);toggle.textContent='▷'}
go.addEventListener('click',play);
toggle.addEventListener('click',()=>playing?pause():play());
soundButton.addEventListener('click',()=>{mute=!mute;sound.setMuted(mute);soundButton.textContent=mute?'×':'♪'});
slider.addEventListener('input',()=>{const was=playing;pause();previous=Number(slider.value);showFrame(previous);if(was)play()});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,cfg.film.pixelRatioMax));renderer.setSize(innerWidth,innerHeight);showFrame(elapsed)}
addEventListener('resize',resize);
showFrame(0);
window.__qa={ready:true,renderer:THREE_ID,webgl2:renderer.capabilities.isWebGL2,mechanics:qaFit,camera:qaCamera,threshold:qaThreshold,sceneIds:[portalFront.root.name,portalRear.root.name],showFrame,readFrame:()=>elapsed,meshCount:()=>scene.children.length,content:'actual WebGL meshes/CanvasTexture; not video or poster'};
