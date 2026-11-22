import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ArchitecturalOcclusion, slidePlayer } from './occlusion-camera.mjs';

const $ = s => document.querySelector(s);
const status = $('#status');
const stage = $('#stage');
const rooms = [
  {name:'Estar', x:-5.2, text:'Textiles minerales, madera y un estar orientado al patio.', yaw:0},
  {name:'Comedor',x:0, text:'La mesa central mira a los dos jardines.',yaw:0},
  {name:'Estudio',x:5.2,text:'Una biblioteca serena con luz filtrada por listones.',yaw:0}
];
let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
} catch (err) {
  $('#err').style.display='grid';
  $('#errtxt').textContent='No se pudo crear WebGL: '+err.message;
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.45));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.domElement.setAttribute('aria-label','Recorrido tridimensional, usá los controles de la página');
renderer.domElement.tabIndex=0;
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background=new THREE.Color('#bacbc7');
scene.fog=new THREE.Fog('#bacbc7',18,38);
const camera = new THREE.PerspectiveCamera(62,window.innerWidth/window.innerHeight,.07,100);
camera.rotation.order='YXZ';
const pmrem = new THREE.PMREMGenerator(renderer);
const env = pmrem.fromScene(new RoomEnvironment(),.035);
scene.environment=env.texture;
pmrem.dispose();
const occlusion=new ArchitecturalOcclusion({fade:.055,response:14});
const obstacles=[];
let seed=12821;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function makeTexture(type){
  const c=document.createElement('canvas');c.width=256;c.height=256;
  const g=c.getContext('2d');
  if(type==='oak'){
    g.fillStyle='#b49a74';g.fillRect(0,0,256,256);
    for(let i=0;i<360;i++){
      let x=rand()*256;const a=.035+rand()*.13;
      g.strokeStyle='rgba(65,39,22,'+a+')';g.lineWidth=.25+rand()*1.4;
      g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+5-rand()*10,80,x+5-rand()*10,175,x+rand()*6-3,256);g.stroke();
    }
  } else {
    g.fillStyle=type==='lime'?'#e8ddd0':'#c6bdaf';
    g.fillRect(0,0,256,256);
    for(let i=0;i<8500;i++){
      const k=rand()>.5?255:33;
      g.fillStyle='rgba('+k+','+k+','+k+','+(type==='lime'?.022:.04)+')';
      const r=.3+rand()*1.5;g.fillRect(rand()*256,rand()*256,r,r);
    }
    if(type==='stone'){
      g.strokeStyle='rgba(89,78,67,.17)';g.lineWidth=1;
      for(let j=0;j<3;j++){g.beginPath();g.moveTo(0,j*83+2);g.lineTo(256,j*83+2);g.stroke()}
    }
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;t.colorSpace=THREE.SRGBColorSpace;
  return t;
}
const tex={oak:makeTexture('oak'),lime:makeTexture('lime'),stone:makeTexture('stone')};
function material(color,roughness=.75,metalness=0,extra={}){return new THREE.MeshStandardMaterial({color,roughness,metalness,...extra})}
const M={
 lime:material('#ffffff',.93,0,{map:tex.lime,bumpMap:tex.lime,bumpScale:.013}),
 stone:material('#ffffff',.84,0,{map:tex.stone,bumpMap:tex.stone,bumpScale:.024}),
 oak:material('#ffffff',.53,0,{map:tex.oak,bumpMap:tex.oak,bumpScale:.018}),
 darkOak:material('#765538',.49,0,{map:tex.oak,bumpMap:tex.oak,bumpScale:.018}),
 leather:material('#8c644c',.83), linen:material('#b8ad98',.91),
 cream:material('#d4cbb9',.92), charcoal:material('#3c423c',.83),
 bronze:material('#9a7753',.29,.84), black:material('#333d38',.34,.66),
 olive:material('#637059',.92), leaf:material('#58714f',.86),
 leaf2:material('#809071',.9), water:new THREE.MeshPhysicalMaterial({color:'#688b88',roughness:.12,metalness:.33,clearcoat:1,clearcoatRoughness:.12}),
 glass:new THREE.MeshPhysicalMaterial({color:'#d5ebe6',transparent:true,opacity:.27,roughness:.16,metalness:.05,depthWrite:false,side:THREE.DoubleSide}),
 glow:new THREE.MeshStandardMaterial({color:'#f4d9a8',emissive:'#ffc878',emissiveIntensity:.3,roughness:.4})
};
const owned=[];
function put(geometry,mat,x=0,y=0,z=0,cast=true){
  const mesh=new THREE.Mesh(geometry,mat);
  mesh.position.set(x,y,z);
  mesh.castShadow=cast;mesh.receiveShadow=true;
  scene.add(mesh);owned.push(mesh);return mesh;
}
function box(w,h,d,x,y,z,mat,occ,cast=true){
  const m=put(new THREE.BoxGeometry(w,h,d),mat,x,y,z,cast);
  if(occ)occlusion.register(m,occ);
  return m;
}
function soft(w,h,d,r,x,y,z,mat){
  const m=put(new RoundedBoxGeometry(w,h,d,4,Math.min(r,w/2-.002,h/2-.002,d/2-.002)),mat,x,y,z);
  return m;
}
function rod(a,b,r,mat,segments=10){
  const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b);
  const m=put(new THREE.CylinderGeometry(r,r,A.distanceTo(B),segments),mat);
  m.position.copy(A).add(B).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.sub(A).normalize());
  return m;
}
function curve(points,r,mat){
  const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  return put(new THREE.TubeGeometry(path,32,r,6,false),mat);
}
function planter(x,z,s=1){
  put(new THREE.CylinderGeometry(.32*s,.23*s,.45*s,12),M.stone,x,.225*s,z);
  for(let i=0;i<8;i++){
    const a=i*Math.PI*2/8,rr=(.14+rand()*.3)*s;
    curve([[x,.43*s,z],[x+rr*.4,.82*s,z+rr*.3],[x+Math.sin(a)*rr,1.15*s+rand()*.3*s,z+Math.cos(a)*rr]],.012*s,M.olive);
    const leaf=put(new THREE.IcosahedronGeometry(.17*s,1),i%2?M.leaf2:M.leaf,
      x+Math.sin(a)*rr,1.06*s+rand()*.3*s,z+Math.cos(a)*rr);
    leaf.scale.set(.65,1.55,.5);
  }
}
function tree(x,z,s=1){
  const h=2.9*s;
  curve([[x,0,z],[x+.04,h*.36,z],[x-.11,h*.7,z],[x-.18,h*.9,z]],.095*s,M.darkOak);
  for(let i=0;i<12;i++){
    const a=i*2.399,r=.42+rand()*.5,hh=h*(.64+rand()*.28);
    const yy=hh+.14*Math.sin(i*2);
    curve([[x-.05,h*.55,z],[x+Math.cos(a)*r*.65,h*.68,z+Math.sin(a)*r*.65],[x+Math.cos(a)*r,yy,z+Math.sin(a)*r]],.021*s,M.darkOak);
    const b=put(new THREE.IcosahedronGeometry((.28+rand()*.18)*s,1),i%3?M.leaf:M.leaf2,x+Math.cos(a)*r,yy,z+Math.sin(a)*r);
    b.scale.set(1.15,.78,1);
  }
}
function pendant(x,z){
  rod([x,3.27,z],[x,2.58,z],.014,M.black);
  put(new THREE.CylinderGeometry(.33,.46,.11,24),M.bronze,x,2.58,z);
  put(new THREE.SphereGeometry(.11,12,8),M.glow,x,2.48,z);
}

// Losa y planta: 15,6 × 5,4 interiores, tres crujías de 5,2 m.
box(15.9,.25,5.6,0,-.125,0,M.stone,null,false);
for(let k=0;k<3;k++){
  const x=-5.2+5.2*k;
  box(5.07,.025,5.22,x,.012,0,k===1?M.stone:M.oak,null,false);
  for(let i=0;i<12;i++){
    const z=-2.47+i*.44;
    box(5.04,.008,.012,x,.03,z,k===1?M.cream:M.darkOak,null,false);
  }
  const roof=box(5.19,.18,5.63,x,3.43,0,M.darkOak,'roof');
  for(let j=0;j<5;j++){
    box(.07,.13,5.45,x-2+j*1.04,3.29,0,M.darkOak,'roof');
  }
  for(let j=0;j<2;j++)pendant(x-.9+j*1.8,.1);
}
box(.24,3.45,5.82,-7.87,1.72,0,M.lime,'wall');
box(.24,3.45,5.82, 7.87,1.72,0,M.lime,'wall');
for(const x of [-2.6,2.6]){
  for(const z of [-1.7,1.7])box(.2,3.32,1.68,x,1.67,z,M.lime,'wall');
  box(.2,.88,1.75,x,2.94,0,M.lime,'wall');
  for(const z of [-.82,.82])box(.12,2.47,.075,x,1.24,z,M.darkOak);
}
// Cerramientos acristalados al norte y al sur; carpinterías 8 cm.
for(const z of [-2.75,2.75]){
  for(const x of [-5.2,0,5.2]){
    box(4.95,.17,.2,x,3.36,z,M.lime,'wall');
    box(4.95,.3,.22,x,.16,z,M.stone,'wall');
    box(.14,3.05,.2,x-2.48,1.7,z,M.darkOak,'wall');
    box(.14,3.05,.2,x+2.48,1.7,z,M.darkOak,'wall');
    for(const dx of [-1.24,0,1.24]){
      box(.052,2.85,.064,x+dx,1.72,z,M.bronze);
    }
    box(4.94,.055,.07,x,2.05,z,M.bronze);
    box(4.86,2.75,.018,x,1.7,z,M.glass,null,false);
  }
}
// Dos patios exteriores al norte y sur del comedor.
for(const sign of [-1,1]){
  const z=sign*4.65;
  box(5.18,.16,3.65,0,-.11,z,M.stone,null,false);
  box(5.5,1.15,.18,0,.58,sign*6.43,M.lime,'wall');
  for(const x of [-2.75,2.75])box(.18,1.15,3.72,x,.58,z,M.lime,'wall');
  for(let i=0;i<9;i++)box(.09,.015,3.4,-2.1+i*.52,-.015,z,M.darkOak,null,false);
  if(sign===-1){
    box(2.22,.1,1.12,.35,.03,-4.57,M.darkOak,null,false);
    box(2.06,.02,.94,.35,.095,-4.57,M.water,null,false);
    tree(-1.65,-5.12,.7);
    planter(1.78,-5.35,.65);
  }else{
    tree(1.55,5.02,.74);
    planter(-1.75,5.5,.62);
    for(let i=0;i<3;i++){
      soft(.48,.13,.48,.05,-1.2+i*.45,.12,4.55,M.stone);
    }
  }
}
// Una envolvente exterior que no interrumpe las visuales desde el comedor.
for(const x of [-7.9,7.9]){
  for(const z of [-5.3,5.3])planter(x*.76,z,.76);
}

// ESTAR: sofá de cojines curvos, mesa baja, alfombra, lámpara de lectura.
box(3.17,.012,2.03,-5.31,.048,.85,M.cream,null,false);
soft(2.72,.3,.93,.125,-5.35,.35,1.67,M.darkOak);
for(const xx of [-6.13,-5.35,-4.57]){
  soft(.7,.24,.74,.11,xx,.56,1.6,M.linen);
  soft(.7,.65,.18,.085,xx,.86,2.0,M.linen);
}
soft(.19,.72,.93,.06,-6.75,.62,1.67,M.darkOak);
soft(.19,.72,.93,.06,-3.95,.62,1.67,M.darkOak);
soft(1.26,.13,.66,.065,-5.25,.47,-1.04,M.oak);
for(const dx of [-.48,.48])for(const dz of [-.22,.22])
  rod([-5.25+dx,.14,-1.04+dz],[-5.25+dx,.4,-1.04+dz],.035,M.bronze);
put(new THREE.CylinderGeometry(.15,.18,.07,24),M.stone,-5.25,.58,-1.04);
rod([-7.1,.1,-1.77],[-7.1,1.82,-1.77],.023,M.bronze);
put(new THREE.ConeGeometry(.34,.42,26),M.cream,-7.1,1.81,-1.77);
planter(-3.33,-1.86,.54);
obstacles.push({x1:-6.89,x2:-3.8,z1:1.03,z2:2.16});
obstacles.push({x1:-5.95,x2:-4.58,z1:-1.48,z2:-.56});

// COMEDOR: mesa con cantos suaves y seis sillas con patas arqueadas.
soft(2.38,.105,.91,.052,0,.77,-1.34,M.darkOak);
for(const x of [-.79,.79])for(const z of [-1.67,-1.02])
  rod([x,.16,z],[x,.72,z],.043,M.bronze);
function chair(x,z,a=0){
  const root=new THREE.Group();root.position.set(x,0,z);root.rotation.y=a;scene.add(root);
  const seat=new THREE.Mesh(new RoundedBoxGeometry(.53,.12,.5,4,.06),M.linen);
  seat.position.set(0,.49,0);seat.castShadow=true;root.add(seat);
  const back=new THREE.Mesh(new RoundedBoxGeometry(.53,.58,.12,4,.055),M.oak);
  back.position.set(0,.87,.22);back.rotation.x=-.13;back.castShadow=true;root.add(back);
  for(const X of [-.19,.19])for(const Z of [-.16,.16]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.018,.023,.47,8),M.bronze);
    leg.position.set(X,.235,Z);leg.castShadow=true;root.add(leg);
  }
}
chair(-.74,-2.10,Math.PI);chair(.74,-2.10,Math.PI);
chair(-.74,-.55);chair(.74,-.55);
planter(2.14,-1.93,.55);
box(1.9,.12,.35,1.1,1.0,2.36,M.oak);
for(let i=0;i<12;i++){
  const bx=.25+i*.145;
  soft(.085,.22+(i%3)*.045,.21,.012,bx,1.17+(i%3)*.02,2.24,
    i%3===0?M.olive:i%3===1?M.leather:M.cream);
}
obstacles.push({x1:-1.25,x2:1.25,z1:-1.9,z2:-.85});

// ESTUDIO: mesa de dibujo, biblioteca y banca.
soft(2.37,.12,.72,.05,5.31,.76,1.48,M.oak);
for(const x of [4.35,6.26]){
  curve([[x,.09,1.15],[x-.03,.5,1.16],[x,.72,1.52],[x+.04,.38,1.79],[x+.05,.09,1.79]],.037,M.black);
}
soft(.61,.08,.46,.045,4.71,.61,.88,M.leather);
rod([4.4,.09,.84],[4.4,.55,.84],.025,M.bronze);
rod([5.02,.09,.84],[5.02,.55,.84],.025,M.bronze);
soft(.09,.5,.37,.035,4.71,.85,1.12,M.leather);
for(const x of [3.24,6.7]){
  box(.36,2.18,.31,x,1.36,-2.25,M.darkOak);
}
for(const y of [.34,1.04,1.74,2.42]){
  box(3.1,.055,.38,5.2,y,-2.3,M.darkOak);
  for(let j=0;j<10;j++){
    if(j%3===0){
      soft(.1,.21+(j%4)*.06,.19,.007,3.79+j*.31,y+.14+(j%4)*.03,-2.27,j%2?M.leather:M.cream);
    }
  }
}
planter(7.04,-1.77,.68);
obstacles.push({x1:4.11,x2:6.58,z1:1.04,z2:1.88});

// Obra mural original de tres paneles abstractos en el extremo occidental.
for(let i=0;i<3;i++){
  const z=-1.58+i*1.48;
  box(.041,.97,.87,-7.68,1.8,z,M.darkOak);
  const center=put(new THREE.TorusGeometry(.24,.033,8,38,Math.PI*1.44),i===1?M.bronze:M.cream,-7.646,1.8,z);
  center.rotation.y=Math.PI/2;center.rotation.z=i*.42;
}
const hemi=new THREE.HemisphereLight('#d8e6ff','#807265',1.8);scene.add(hemi);
const sun=new THREE.DirectionalLight('#fff2db',3.1);
sun.position.set(-5.3,12,-3.5);sun.target.position.set(0,0,0);
scene.add(sun,sun.target);
sun.castShadow=true;sun.shadow.mapSize.set(1536,1536);
sun.shadow.camera.left=-12;sun.shadow.camera.right=12;
sun.shadow.camera.top=11;sun.shadow.camera.bottom=-11;
sun.shadow.camera.near=.4;sun.shadow.camera.far=30;
sun.shadow.normalBias=.03;sun.shadow.bias=-.00008;
const artificial=[];
for(const x of [-5.2,0,5.2]){
  const l=new THREE.PointLight('#ffce91',0,7,2);
  l.position.set(x,2.5,.1);scene.add(l);artificial.push(l);
}
const fill=new THREE.DirectionalLight('#bed9ea',.5);fill.position.set(6,7,4);scene.add(fill);
let state={mode:'cinema',room:1,night:false,yaw:0,pitch:-.04,azimuth:0,elevation:.43,distance:7.4};
let player={x:0,z:1.25},pointer=null,joy={x:0,y:0},keys=new Set();
const focus=new THREE.Vector3();
function currentRoom(){return rooms[state.room]}
function setRoom(id){
  state.room=id;
  player={x:rooms[id].x,z:1.26};
  state.yaw=0;state.pitch=-.045;
  state.azimuth=0;state.elevation=.43;state.distance=7.4;
  document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.room)===id)));
  $('#room-info').textContent=rooms[id].text;
  describe();
}
function lightMode(night){
  state.night=night;
  sun.intensity=night?.07:3.1;
  hemi.intensity=night?.43:1.8;
  fill.intensity=night?.3:.5;
  for(const l of artificial)l.intensity=night?65:0;
  scene.background.set(night?'#11191e':'#bacbc7');
  scene.fog.color.copy(scene.background);
  renderer.toneMappingExposure=night?1.22:1.05;
  $('#light').setAttribute('aria-pressed',String(night));
  $('#light').textContent=night?'Luz natural':'Luz nocturna';
  describe();
}
function describe(){
  status.textContent=(state.mode==='walk'?'Recorrido libre':'Vista cinematográfica')+' · '+(state.night?'Luz artificial':'Luz natural')+' · '+currentRoom().name;
  $('#mode').textContent=state.mode==='walk'?'Vista exterior':'Recorrer';
  $('#mode').setAttribute('aria-pressed',String(state.mode==='walk'));
  const mobile=matchMedia('(pointer:coarse)').matches;
  $('#joy').style.display=state.mode==='walk'&&mobile?'grid':'none';
  $('#lookhint').style.display=state.mode==='walk'&&mobile?'block':'none';
}
function updateCamera(){
  const room=currentRoom();
  if(state.mode==='cinema'){
    const a=state.azimuth,dist=state.distance,e=state.elevation;
    focus.set(room.x,1.43,0);
    camera.position.set(room.x+dist*Math.sin(a)*Math.cos(e),1.43+dist*Math.sin(e),dist*Math.cos(a)*Math.cos(e));
    camera.lookAt(focus);
  }else{
    camera.position.set(player.x,1.64,player.z);
    camera.rotation.set(state.pitch,state.yaw,0,'YXZ');
    // Blanco de oclusión: objetivo a dos metros por delante, incluido al pasar dinteles.
    focus.set(player.x+Math.sin(state.yaw)*3,1.55,player.z-Math.cos(state.yaw)*3);
  }
}
function toggleMode(){
  state.mode=state.mode==='walk'?'cinema':'walk';
  player={x:currentRoom().x,z:1.25};
  state.yaw=0;state.pitch=-.05;state.azimuth=0;state.elevation=.43;
  describe();
}
document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>setRoom(Number(b.dataset.room))));
$('#mode').addEventListener('click',toggleMode);
$('#light').addEventListener('click',()=>lightMode(!state.night));
function download(canvas,name){
  const a=document.createElement('a');a.download=name;a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
}
function prepareFrame(){
  updateCamera();
  for(let i=0;i<11;i++)occlusion.update(camera.position,focus,.12);
  renderer.render(scene,camera);
}
$('#tools [data-action=shot]').addEventListener('click',()=>{
  prepareFrame();
  download(renderer.domElement,'casa-entre-patios-'+currentRoom().name.toLowerCase()+'-'+(state.night?'noche':'dia')+'.png');
  status.textContent='Fotografía PNG generada desde la escena WebGL actual';
});
$('#tools [data-action=series]').addEventListener('click',()=>{
  // Capturas reales de render, no dibujos ilustrativos ni capturas de la interfaz.
  const original={...state}, pos={...player}, priorAspect=camera.aspect;
  camera.aspect=500/278;camera.updateProjectionMatrix();
  const sheet=document.createElement('canvas');sheet.width=1500;sheet.height=620;
  const ctx=sheet.getContext('2d');ctx.fillStyle='#ece5da';ctx.fillRect(0,0,1500,620);
  for(let r=0;r<2;r++)for(let c=0;c<3;c++){
    state.mode='cinema';state.room=c;state.azimuth=0;state.elevation=.37;state.distance=7.15;
    lightMode(r===1);
    prepareFrame();
    ctx.drawImage(renderer.domElement,c*500,r*310,500,278);
    ctx.fillStyle='#1b2522';ctx.font='17px Georgia';ctx.fillText(rooms[c].name+' / '+(r===0?'Día':'Noche'),c*500+17,r*310+301);
  }
  Object.assign(state,original);player=pos;lightMode(original.night);setRoom(original.room);
  Object.assign(state,original);player=pos;describe();
  camera.aspect=priorAspect;camera.updateProjectionMatrix();
  prepareFrame();
  download(sheet,'casa-entre-patios-comparativa-3x2.png');
  status.textContent='Serie exportada · 3 ambientes × 2 condiciones de luz · PNG real';
});
const canvas=renderer.domElement;
canvas.addEventListener('pointerdown',e=>{
  if(state.mode==='walk'||state.mode==='cinema'){pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);}
});
canvas.addEventListener('pointermove',e=>{
  if(!pointer||pointer.id!==e.pointerId)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.x=e.clientX;pointer.y=e.clientY;
  if(state.mode==='walk'){
    state.yaw-=dx*.0035;
    state.pitch=Math.max(-1.05,Math.min(.95,state.pitch-dy*.0028));
  }else{
    state.azimuth=Math.max(-1.6,Math.min(1.6,state.azimuth-dx*.004));
    state.elevation=Math.max(.08,Math.min(1.11,state.elevation+dy*.003));
  }
});
canvas.addEventListener('pointerup',e=>{if(pointer?.id===e.pointerId)pointer=null});
canvas.addEventListener('pointercancel',()=>pointer=null);
canvas.addEventListener('wheel',e=>{if(state.mode!=='cinema')return;state.distance=Math.max(4.5,Math.min(13,state.distance+Math.sign(e.deltaY)*.5));},{passive:true});
window.addEventListener('keydown',e=>{
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}
  if(e.code==='Space'&&!e.repeat){e.preventDefault();toggleMode()}
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();joy={x:0,y:0}});
const joyEl=$('#joy'),nub=$('#nub');let joyId=null;
function joyMove(e){
  const rect=joyEl.getBoundingClientRect(),midX=rect.left+rect.width/2,midY=rect.top+rect.height/2;
  const dx=e.clientX-midX,dy=e.clientY-midY,len=Math.hypot(dx,dy)||1;
  joy.x=Math.max(-1,Math.min(1,dx/42));joy.y=Math.max(-1,Math.min(1,dy/42));
  if(len>42){joy.x=dx/len;joy.y=dy/len}
  nub.style.setProperty('--dx',joy.x*32+'px');nub.style.setProperty('--dy',joy.y*32+'px');
}
joyEl.addEventListener('pointerdown',e=>{e.preventDefault();joyId=e.pointerId;joyEl.setPointerCapture(joyId);joyMove(e)});
joyEl.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});
function resetJoy(){joyId=null;joy={x:0,y:0};nub.style.setProperty('--dx','0px');nub.style.setProperty('--dy','0px')}
joyEl.addEventListener('pointerup',resetJoy);joyEl.addEventListener('pointercancel',resetJoy);
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}
window.addEventListener('resize',resize);
let last=performance.now();
function animate(t){
  const dt=Math.min(.05,(t-last)/1000);last=t;
  if(state.mode==='walk'){
    const forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-joy.y;
    const strafe=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+joy.x;
    const k=Math.max(1,Math.hypot(forward,strafe));
    const f=2.1*dt/k;
    const dx=(Math.sin(state.yaw)*forward+Math.cos(state.yaw)*strafe)*f;
    const dz=(-Math.cos(state.yaw)*forward+Math.sin(state.yaw)*strafe)*f;
    player=slidePlayer(player,{x:dx,z:dz},obstacles);
  }
  updateCamera();occlusion.update(camera.position,focus,dt);
  renderer.render(scene,camera);
  requestAnimationFrame(animate);
}
lightMode(false);setRoom(1);describe();updateCamera();renderer.render(scene,camera);
$('#enter').addEventListener('click',()=>{$('#veil').remove();canvas.focus({preventScroll:true})});
renderer.domElement.addEventListener('webglcontextlost',e=>{
  e.preventDefault();$('#err').style.display='grid';$('#errtxt').textContent='Se perdió el contexto WebGL. Recargá la página para reiniciar la visita.';
});
requestAnimationFrame(animate);
