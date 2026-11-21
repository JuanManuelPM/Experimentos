import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import RAPIER from 'https://esm.sh/@dimforge/rapier3d-compat@0.20.0';

const $ = id => document.getElementById(id);
const wrap = $('world');
const loading = $('loading');
const timeText = $('timeText');
const statusText = $('status');
const mission = $('mission');
const phase = $('phase');
const end = $('end');
const FIXED = 1 / 60;
const START = 100;
const PAD = {x:2.15,z:0};
const HALF = .43;
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const vecLen = v => Math.hypot(v.x,v.y,v.z);
let scene, camera, renderer, orbit, physics, doorBody, door, plateGlow, plateRing;
let crates = [], selected = -1, target = null, keys = new Set(), dragId = null;
let elapsed = 0, accumulator = 0, lastTime = 0, stableTime = 0, doorLift = 0, played = false;
let mode = 'READY', seconds = START;
let ray, pointer;
const art = [];
const paper = 0xdedcca, dark = 0x192522, brass = 0xd4ac70, jade = 0x8adac2;

function material(color, metalness=.25, roughness=.56, emissive=0x000000, emissiveIntensity=0) {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness, emissive, emissiveIntensity });
}
const mats = {
  floor:material(0x40514d,.18,.84),
  floorTile:material(0x52645d,.14,.81),
  brass:material(brass,.76,.29),
  dark:material(0x263430,.52,.44),
  black:material(0x111c1a,.5,.58),
  edge:material(0x879b91,.53,.37),
  light:material(jade,.08,.24,0x4ee7bc,.9),
  danger:material(0xd88169,.2,.45,0xf05a43,.45),
  paper:material(paper,.05,.87),
  gate:material(0x62736a,.8,.31)
};
const geoBox = (w,h,d) => new THREE.BoxGeometry(w,h,d);
function box(w,h,d,x,y,z,mat,parent=scene,shadow=true) {
  const obj = new THREE.Mesh(geoBox(w,h,d),mat);
  obj.position.set(x,y,z);obj.castShadow=shadow;obj.receiveShadow=true;parent.add(obj);return obj;
}
function cyl(rt,rb,height,x,y,z,mat,parent=scene,segments=48) {
  const obj=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,height,segments),mat);
  obj.position.set(x,y,z);obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
function ring(radius,tube,x,y,z,mat,parent=scene){
  const obj=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,64),mat);
  obj.rotation.x=-Math.PI/2;obj.position.set(x,y,z);parent.add(obj);return obj;
}
function labelTexture(title,sub,ink='#e8dcc4') {
  const cv=document.createElement('canvas');cv.width=256;cv.height=256;
  const c=cv.getContext('2d');c.clearRect(0,0,256,256);
  c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(24,24,208,208);
  c.lineWidth=1.2;c.strokeRect(35,35,186,186);
  for(let k=0;k<4;k++){c.fillStyle=ink;c.fillRect(30+k*58,15,18,3);c.fillRect(30+k*58,239,18,3);}
  c.fillStyle=ink;c.textAlign='center';c.font='700 100px system-ui';c.fillText(title,128,154);
  c.font='600 20px system-ui';c.letterSpacing='4px';c.fillText(sub,128,187);
  const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=4;return texture;
}
function addTopDecal(parent,title,sub) {
  const mat=new THREE.MeshBasicMaterial({map:labelTexture(title,sub),transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.70,.70),mat);
  mesh.rotation.x=-Math.PI/2;mesh.position.y=HALF+.012;parent.add(mesh);
}
function addPanelText(text,x,y,z,size=.26){
  const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');
  c.clearRect(0,0,512,128);c.fillStyle='#d3dbce';c.font='600 46px system-ui';c.textAlign='center';
  c.fillText(text,256,79);
  const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*4,size),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false}));
  mesh.position.set(x,y,z);scene.add(mesh);return mesh;
}
function staticCollider(w,h,d,x,y,z,friction=.9) {
  const rb=physics.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));
  const co=physics.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setFriction(friction),rb);
  return {rb,co};
}
function createCrate(index,x,z,shade,title){
  const group=new THREE.Group();
  const shell=material(shade,.52,.4);
  const core=box(HALF*2,HALF*2,HALF*2,0,0,0,shell,group);
  core.material.flatShading=false;
  for (const d of [-1,1]) {
    for (const s of [-1,1]) {
      box(.075,.86,.072,d*(HALF-.027),0,s*(HALF-.029),mats.brass,group);
      box(.072,.075,.86,d*(HALF-.03),s*(HALF-.04),0,mats.edge,group);
      box(.86,.075,.072,0,s*(HALF-.04),d*(HALF-.03),mats.edge,group);
    }
  }
  for (const side of [-1,1]) {
    box(.61,.22,.014,0,-.085,side*(HALF+.011),mats.dark,group,false);
    box(.24,.025,.016,0,-.085,side*(HALF+.024),mats.brass,group,false);
  }
  for (const xSide of [-1,1]) {
    box(.015,.27,.56,xSide*(HALF+.009),-.05,0,mats.dark,group,false);
  }
  addTopDecal(group,title,'MÓDULO');
  const anchor=cyl(.08,.08,.025,0,HALF+.025,0,mats.brass,group,20);
  anchor.castShadow=false;
  const rb=physics.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(x,.72,z).setLinearDamping(.47).setAngularDamping(1.65).setCcdEnabled(true));
  const co=physics.createCollider(RAPIER.ColliderDesc.cuboid(HALF,HALF,HALF).setFriction(1.15).setRestitution(.02).setDensity(1.4),rb);
  group.traverse(o=>{if(o.isMesh)o.userData.crateIndex=index;});
  scene.add(group);art.push(group);
  const crate={group,rb,co,start:{x,y:.72,z},index};
  crates.push(crate);return crate;
}
function buildScene(){
  scene=new THREE.Scene();scene.background=new THREE.Color(0x172321);
  scene.fog=new THREE.FogExp2(0x172321,.035);
  camera=new THREE.PerspectiveCamera(43,innerWidth/innerHeight,.1,80);
  camera.position.set(7.4,7.3,10.1);
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.22;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  wrap.appendChild(renderer.domElement);
  orbit=new OrbitControls(camera,renderer.domElement);
  orbit.target.set(0,.7,0);orbit.enableDamping=true;orbit.dampingFactor=.08;
  orbit.enablePan=false;orbit.minDistance=8;orbit.maxDistance=17;
  orbit.minPolarAngle=.65;orbit.maxPolarAngle=1.42;
  orbit.update();
  scene.add(new THREE.HemisphereLight(0xb6cec9,0x1e2b27,2.25));
  const key=new THREE.DirectionalLight(0xffddad,3.4);
  key.position.set(-4,9,5);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-10;
  key.shadow.camera.right=10;key.shadow.camera.top=10;key.shadow.camera.bottom=-10;
  key.shadow.normalBias=.035;scene.add(key);
  const fill=new THREE.PointLight(0x57d5b2,36,15,2);
  fill.position.set(3,4,-1);scene.add(fill);
  const warm=new THREE.PointLight(0xe7a86b,20,14,2);
  warm.position.set(-4,2,2);scene.add(warm);
  const platform=box(10.2,.48,7.2,0,-.24,0,mats.floor);
  box(10.52,.16,7.52,0,-.47,0,mats.dark);
  staticCollider(10.2,.48,7.2,0,-.24,0);
  for(let ix=-4;ix<=4;ix++)for(let iz=-3;iz<=3;iz++){
    if((ix+iz)%2===0)box(.97,.008,.97,ix*1.07,.008,iz*1.03,mats.floorTile,scene,false);
  }
  for(let i=0;i<2;i++){
    const z=i===0?-3.65:3.65;
    box(10.4,.12,.08,0,.03,z,i===0?mats.brass:mats.edge);
  }
  for(let i=0;i<2;i++){
    const x=i===0?-5.1:5.1;
    box(.10,.22,7.1,x,.09,0,mats.brass);
    staticCollider(.10,.22,7.1,x,.09,0);
  }
  // Pressure plate. The collider is real; the decorative rings are visual-only.
  cyl(.83,.92,.09,PAD.x,.065,PAD.z,mats.dark);
  cyl(.64,.70,.065,PAD.x,.121,PAD.z,mats.gate);
  plateRing=ring(.60,.036,PAD.x,.166,PAD.z,mats.light);
  plateGlow=cyl(.25,.25,.012,PAD.x,.164,PAD.z,mats.light);
  for(let a=0;a<8;a++){
    let ang=a*Math.PI/4;box(.13,.04,.04,PAD.x+Math.sin(ang)*.77,.18,PAD.z+Math.cos(ang)*.77,mats.brass);
  }
  staticCollider(1.26,.19,1.26,PAD.x,.075,PAD.z);
  // Bridge, moving grating and retracting door.
  const gateX=PAD.x,gateZ=-3.13;
  box(2.15,.16,.56,gateX,0,gateZ,mats.dark);
  staticCollider(2.15,.16,.56,gateX,0,gateZ);
  box(.30,3.9,.75,gateX-1.23,1.84,gateZ,mats.brass);
  box(.30,3.9,.75,gateX+1.23,1.84,gateZ,mats.brass);
  box(2.75,.40,.8,gateX,3.75,gateZ,mats.brass);
  for(let i=0;i<2;i++){
    box(.13,3.2,.80,gateX+(i===0?-1.47:1.47),1.8,gateZ,mats.dark);
  }
  door=new THREE.Group();
  box(1.91,3.1,.25,0,0,0,mats.gate,door);
  for(let k=-4;k<=4;k++) box(.045,3.04,.28,k*.19,0,.016,mats.dark,door);
  for(let k=-2;k<=2;k++) box(1.94,.045,.285,0,k*.49,.016,mats.brass,door);
  const portalCyl=cyl(.19,.19,.08,0,0,.17,mats.brass,door);
  portalCyl.rotation.x=Math.PI/2;
  door.position.set(gateX,1.7,gateZ);scene.add(door);
  doorBody=physics.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(gateX,1.7,gateZ));
  physics.createCollider(RAPIER.ColliderDesc.cuboid(.955,1.55,.125),doorBody);
  addPanelText('02 · CARGA',gateX,4.12,gateZ+.28,.22);
  // Engine and etched paths, not an arbitrary forest of cubes.
  for(let i=0;i<3;i++){
    const x=-4.25+i*.34;
    cyl(.1,.12,1.07,x,.54,-2.72,i===1?mats.brass:mats.edge);
    ring(.12,.017,x,1.09,-2.72,mats.brass);
  }
  for(let i=0;i<4;i++){
    box(.025,.015,5.4,-.5+i*.23,.02,0,mats.edge,scene,false);
  }
  addPanelText('ESTACIÓN DE CARGA',-2.65,.07,-3.11,.18);
  createCrate(0,-2.7,-1.16,0xc19b71,'I');
  createCrate(1,-2.7,1.11,0x7caea4,'II');
  ray=new THREE.Raycaster();pointer=new THREE.Vector2();
}
function setSelected(i){
  if(mode==='WIN'||mode==='FAIL')return;
  selected=i;
  const pos=crates[i].rb.translation();
  target={x:pos.x,y:Math.max(.63,pos.y),z:pos.z};
  played=true;if(mode==='READY')mode='PLAYING';
  statusText.textContent='Arrastrá o usá flechas / WASD. Espacio alza. Soltar deja caer.';
  document.querySelectorAll('.ctrl.disabled').forEach(el=>el.classList.remove('disabled'));
}
function release(){
  if(selected<0)return;
  selected=-1;target=null;dragId=null;orbit.enabled=true;
  statusText.textContent='Soltado. Esperá a que el peso se estabilice.';
}
function reset(){
  selected=-1;target=null;dragId=null;orbit.enabled=true;
  keys.clear();stableTime=0;doorLift=0;mode='READY';seconds=START;played=false;
  crates.forEach(c=>{
    c.rb.setTranslation(c.start,true);
    c.rb.setRotation({x:0,y:0,z:0,w:1},true);
    c.rb.setLinvel({x:0,y:0,z:0},true);c.rb.setAngvel({x:0,y:0,z:0},true);
    c.rb.wakeUp();
  });
  door.position.y=1.7;
  doorBody.setNextKinematicTranslation({x:PAD.x,y:1.7,z:-3.13});
  end.classList.remove('visible');
  statusText.textContent='Tocá una caja para seleccionarla.';
  mission.textContent='Apilá los dos módulos sobre la plataforma iluminada.';
  phase.textContent='OBJETIVO · 00 / 02';
  timeText.textContent='01:40';
}
function finish(kind){
  if(mode==='WIN'||mode==='FAIL')return;
  mode=kind;release();
  $('endTitle').textContent=kind==='WIN'?'Mecanismo abierto.':'Intento terminado.';
  $('endDesc').textContent=kind==='WIN'?'Dos cuerpos, un solo peso. El sensor reconoció la pila estable y abrió la compuerta.':'El tiempo se agotó o un módulo cayó fuera. Volvé a intentarlo desde el comienzo.';
  if(kind==='FAIL'){end.classList.add('visible');}
  else{setTimeout(()=>end.classList.add('visible'),1500);}
}
function pickPointer(e){
  const rect=renderer.domElement.getBoundingClientRect();
  pointer.x=((e.clientX-rect.left)/rect.width)*2-1;
  pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
  ray.setFromCamera(pointer,camera);
}
function onPointerDown(e){
  if(e.button!==0||mode==='WIN'||mode==='FAIL')return;
  pickPointer(e);
  const hits=ray.intersectObjects(crates.map(c=>c.group),true);
  if(!hits.length)return;
  const index=hits[0].object.userData.crateIndex;
  if(typeof index!=='number')return;
  e.preventDefault();e.stopPropagation();
  setSelected(index);dragId=e.pointerId;orbit.enabled=false;
  renderer.domElement.setPointerCapture(e.pointerId);
}
function onPointerMove(e){
  if(e.pointerId!==dragId||selected<0||!target)return;
  pickPointer(e);
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-target.y);
  const dest=new THREE.Vector3();
  if(ray.ray.intersectPlane(plane,dest)){
    target.x=clamp(dest.x,-4.53,4.53);
    target.z=clamp(dest.z,-2.83,2.89);
  }
}
function onPointerUp(e){
  if(e.pointerId!==dragId)return;
  dragId=null;orbit.enabled=true;
  if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);
}
function bindInputs(){
  renderer.domElement.addEventListener('pointerdown',onPointerDown,{capture:true});
  renderer.domElement.addEventListener('pointermove',onPointerMove);
  renderer.domElement.addEventListener('pointerup',onPointerUp);
  renderer.domElement.addEventListener('pointercancel',onPointerUp);
  renderer.domElement.addEventListener('lostpointercapture',()=>{dragId=null;orbit.enabled=true;});
  window.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if(['arrowleft','arrowright','arrowup','arrowdown',' ','shift','w','a','s','d','r','escape'].includes(key))e.preventDefault();
    if(key==='r')reset();
    else if(key==='escape')release();
    else keys.add(key);
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));});
  document.querySelectorAll('[data-control]').forEach(btn=>{
    const k=btn.dataset.control;
    btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);keys.add('btn-'+k);btn.classList.add('pressed');});
    const up=()=>{keys.delete('btn-'+k);btn.classList.remove('pressed');};
    btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);
    btn.addEventListener('lostpointercapture',up);
  });
  $('release').addEventListener('click',release);
  $('reset').addEventListener('click',reset);
  $('replay').addEventListener('click',reset);
  $('hudToggle').addEventListener('click',()=>document.body.classList.toggle('hide-hud'));
  window.addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
  });
}
function inputTick(dt){
  if(selected<0||!target||mode!=='PLAYING')return;
  const v=2.25*dt;
  if(keys.has('a')||keys.has('arrowleft')||keys.has('btn-left'))target.x-=v;
  if(keys.has('d')||keys.has('arrowright')||keys.has('btn-right'))target.x+=v;
  if(keys.has('w')||keys.has('arrowup')||keys.has('btn-up'))target.z-=v;
  if(keys.has('s')||keys.has('arrowdown')||keys.has('btn-down'))target.z+=v;
  if(keys.has(' ')||keys.has('btn-lift'))target.y+=v*1.3;
  if(keys.has('shift')||keys.has('btn-lower'))target.y-=v*1.3;
  target.x=clamp(target.x,-4.5,4.5);
  target.z=clamp(target.z,-2.8,2.8);
  target.y=clamp(target.y,.58,3.5);
}
function heldImpulse(){
  if(selected<0||!target)return;
  const b=crates[selected].rb,p=b.translation(),v=b.linvel(),m=b.mass();
  const delta={x:target.x-p.x,y:target.y-p.y,z:target.z-p.z};
  const impulse={
    x:clamp((delta.x*26-v.x*8)*m*FIXED,-.65,.65),
    y:clamp(((delta.y*33-v.y*9)+12)*m*FIXED,-.75,.9),
    z:clamp((delta.z*26-v.z*8)*m*FIXED,-.65,.65)
  };
  b.applyImpulse(impulse,true);
  const q=b.rotation(),w=b.angvel(),sgn=q.w>=0?1:-1;
  b.applyTorqueImpulse({x:-sgn*q.x*.20-w.x*.045,y:-w.y*.07,z:-sgn*q.z*.20-w.z*.045},true);
}
function isStack(){
  if(selected!==-1)return false;
  const a=crates[0].rb,b=crates[1].rb,pa=a.translation(),pb=b.translation();
  const bottom=pa.y<pb.y?{rb:a,p:pa}:{rb:b,p:pb};
  const top=pa.y<pb.y?{rb:b,p:pb}:{rb:a,p:pa};
  const q1=bottom.rb.rotation(),q2=top.rb.rotation();
  const centered=Math.abs(bottom.p.x-PAD.x)<.31&&Math.abs(bottom.p.z-PAD.z)<.31;
  const height=bottom.p.y>.53&&bottom.p.y<.77&&top.p.y-bottom.p.y>.75&&top.p.y-bottom.p.y<.99;
  const aligned=Math.abs(top.p.x-bottom.p.x)<.23&&Math.abs(top.p.z-bottom.p.z)<.23;
  const settled=vecLen(a.linvel())<.18&&vecLen(b.linvel())<.18&&vecLen(a.angvel())<.2&&vecLen(b.angvel())<.2;
  const upright=[q1,q2].every(q=>Math.abs(q.x)<.14&&Math.abs(q.z)<.14);
  return centered&&height&&aligned&&settled&&upright;
}
function updateHUD(dt){
  if(mode==='PLAYING')seconds=Math.max(0,seconds-dt);
  const whole=Math.ceil(seconds);
  timeText.textContent=String(Math.floor(whole/60)).padStart(2,'0')+':'+String(whole%60).padStart(2,'0');
  if(mode!=='PLAYING')return;
  const near=crates.filter(c=>{
    const p=c.rb.translation();return Math.abs(p.x-PAD.x)<.52&&Math.abs(p.z-PAD.z)<.52;
  }).length;
  phase.textContent='OBJETIVO · 0'+near+' / 02';
  if(selected!==-1){
    mission.textContent='Módulo '+(selected+1)+' sujeto. Ubicalo arriba del sensor y soltalo.';
  }else if(near===2){
    mission.textContent='Casi. Dejá que la pila se estabilice.';
  }else{
    mission.textContent='Dos módulos, uno encima del otro. El sensor exige estabilidad.';
  }
  if(seconds<=0)finish('FAIL');
  for(const c of crates)if(c.rb.translation().y<-3.5){finish('FAIL');break;}
}
function physicsTick(dt){
  inputTick(dt);
  if(mode==='PLAYING')heldImpulse();
  physics.step();
  if(mode==='PLAYING'&&isStack())stableTime+=dt;else stableTime=0;
  if(stableTime>1.15&&mode==='PLAYING')finish('WIN');
  if(mode==='WIN')doorLift=Math.min(1,doorLift+dt*.48);
  if(mode==='READY'||mode==='PLAYING'||mode==='WIN'){
    const lift=doorLift*3.5;
    doorBody.setNextKinematicTranslation({x:PAD.x,y:1.7+lift,z:-3.13});
  }
  crates.forEach(c=>{
    const p=c.rb.translation(),q=c.rb.rotation();
    c.group.position.set(p.x,p.y,p.z);
    c.group.quaternion.set(q.x,q.y,q.z,q.w);
  });
}
function render(now){
  requestAnimationFrame(render);
  const dt=Math.min(.05,lastTime?(now-lastTime)/1000:FIXED);lastTime=now;
  if(document.hidden){accumulator=0;return;}
  accumulator+=dt;
  let steps=0;
  while(accumulator>=FIXED&&steps<4){
    physicsTick(FIXED);
    if(mode==='PLAYING')updateHUD(FIXED);
    accumulator-=FIXED;steps++;
  }
  if(steps===4)accumulator=0;
  if(mode==='WIN'){door.position.y=1.7+doorLift*3.5;}
  plateRing.material.emissiveIntensity=.8+.35*Math.sin(now*.004);
  plateGlow.material.emissiveIntensity=1.0+.5*Math.sin(now*.003);
  if(selected>=0) {
    const g=crates[selected].group;
    g.children.forEach(obj=>{if(obj.isMesh&&obj.material===mats.brass)obj.material.emissive.setHex(0x33210e);});
  }else mats.brass.emissive.setHex(0x000000);
  orbit.update();renderer.render(scene,camera);
}
async function main(){
  try{
    await RAPIER.init();
    physics=new RAPIER.World({x:0,y:-12,z:0});
    physics.timestep=FIXED;
    buildScene();bindInputs();reset();loading.classList.add('hidden');
    requestAnimationFrame(render);
  }catch(error){
    console.error('ARCHIVO 05 / error al iniciar',error);
    loading.textContent='No se pudo iniciar el motor físico 3D. Revisá la conexión y que WebGL esté habilitado.';
    loading.style.color='#f7b7a5';
  }
}
main();
