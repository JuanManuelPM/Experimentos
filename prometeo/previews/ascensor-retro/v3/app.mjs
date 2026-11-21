import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createTraveler} from './source/traveler.mjs';
import {createDoorPortal,assertDoorClearance} from './source/door-kit.mjs';
import {createSynthSound} from './source/synth-audio.mjs';

// Ascensor Retro V3. Units: metres. The car genuinely moves along the 3D shaft.
// Worlds are full spatial sets, not backgrounds swapped inside the cabin.
const $=s=>document.querySelector(s);
const duration=58, levels=[0,7,14,21], ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const blend=(a,b,t)=>a+(b-a)*ease(t), clamp=(a,min,max)=>Math.max(min,Math.min(max,a));
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0b1119);
scene.fog=new THREE.FogExp2(0x111823,.009);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.08,130);
const probe=document.createElement('canvas').getContext('webgl2',{antialias:true});
if(!probe)throw Error('WEBGL_CONTEXT: este dispositivo no permite WebGL2');
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
$('#stage').append(renderer.domElement);
const orbit=new OrbitControls(camera,renderer.domElement);
orbit.enableDamping=true;orbit.dampingFactor=.08;orbit.enablePan=true;
orbit.maxDistance=78;orbit.minDistance=.9;orbit.maxPolarAngle=Math.PI*.92;
orbit.enabled=false;
let time=0,playing=false,mode='cine',lastFrame=performance.now(),prevTime=0,actorLoaded=false;
const m=(c,metalness=0,roughness=.65,extra={})=>new THREE.MeshStandardMaterial({color:c,metalness,roughness,...extra});
const ivory=m(0x8d9090,.08,.77),slate=m(0x19232a,.4,.48),black=m(0x0b0e12,.35,.41);
const steel=m(0x425a65,.65,.32),gold=m(0xc3a06a,.82,.24),darkGold=m(0x65513c,.65,.41);
const wine=m(0x462e32,.16,.47),wood=m(0x553b32,.13,.49),tile=m(0x283f46,.36,.29);
const brassGlow=m(0xe2b56e,.5,.29,{emissive:0xc17b37,emissiveIntensity:.35});
const emerald=m(0x234e3a,.05,.8),leaf=m(0x47855f,.02,.91),leafBright=m(0x85a966,.02,.9);
const porcelain=m(0xc9c7a9,.1,.7),midnight=m(0x1b203a,.15,.64);
const blue=m(0x1b697c,.38,.29),sea=m(0x0d394b,.14,.57),bioglow=m(0x55bdc6,.14,.37,{emissive:0x1b778b,emissiveIntensity:.85});
const box=(parent,n,w,h,d,x,y,z,material)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.name=n;o.position.set(x,y,z);o.receiveShadow=true;parent.add(o);return o};
const cyl=(parent,n,r,depth,x,y,z,material,axis='y',segments=24)=>{
 const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,depth,segments),material);o.name=n;
 if(axis==='z')o.rotation.x=Math.PI/2;if(axis==='x')o.rotation.z=Math.PI/2;
 o.position.set(x,y,z);parent.add(o);return o};
const sphere=(parent,n,r,x,y,z,mat,segments=16)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,segments,12),mat);o.name=n;o.position.set(x,y,z);parent.add(o);return o};
const lamp=(parent,color,intensity,range,x,y,z)=>{const l=new THREE.PointLight(color,intensity,range,1.8);l.position.set(x,y,z);parent.add(l);return l};
const arch=(parent,r,x,y,z,mat)=>{const o=new THREE.Mesh(new THREE.TorusGeometry(r,.09,7,44,Math.PI),mat);o.name='structural.arch';o.position.set(x,y,z);parent.add(o);return o};
scene.add(new THREE.HemisphereLight(0xb7c9db,0x261d23,1.35));
const sun=new THREE.DirectionalLight(0xf2dec0,2.1);sun.position.set(-8,28,9);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-25;sun.shadow.camera.right=25;
sun.shadow.camera.top=32;sun.shadow.camera.bottom=-15;sun.shadow.camera.near=2;sun.shadow.camera.far=80;scene.add(sun);

// THE WHOLE BUILDING: four inhabited levels, side bays, crown, exposed traction system.
const building=new THREE.Group();building.name='complete.building.cutaway';scene.add(building);
box(building,'foundation',16,.5,15,0,-.43,-1,slate);
for(const s of [-1,1]){
 for(const x of [s*2.22,s*7.65]){
  box(building,'loadbearing.pier',.30,27.0,.50,x,13.3,1.9,ivory);
  box(building,'rear.loadbearing.pier',.3,27,.42,x,13.3,-5.15,ivory);
 }
 box(building,'side.wing.wall',.34,26.2,7.4,s*7.70,13.1,-1.5,slate);
 for(let j=0;j<4;j++){
  const y=j*7;
  box(building,'wing.floor.slab',5.38,.22,8.6,s*4.92,y-.2,-1.4,ivory);
  box(building,'wing.ceiling.cornice',5.35,.20,8.3,s*4.93,y+4.88,-1.5,gold);
  box(building,'wing.window.frame',3.1,3.6,.21,s*4.95,y+2.43,2.26,darkGold);
  box(building,'wing.window.recess',2.65,3.18,.18,s*4.95,y+2.43,2.39,midnight);
  for(let k=-1;k<=1;k++)box(building,'window.mullion',.07,3.3,.19,s*4.95+k*.86,y+2.43,2.51,gold);
  box(building,'window.crossbar',2.72,.07,.18,s*4.95,y+2.46,2.51,gold);
  for(let k=0;k<4;k++)cyl(building,'baluster',.04,1.05,s*(3.15+k*1.19),y+.52,3.1,gold);
  box(building,'balcony.rail',4.85,.085,.10,s*4.96,y+1.07,3.1,gold);
  box(building,'balcony.deck',5.2,.14,1.14,s*4.94,y-.1,2.66,ivory);
  // Real stairs are visible through the cutaway side bay, not a facade painting.
  for(let step=0;step<12;step++)box(building,'stair.tread',2.2,.13,.57,s*5.12,y+.12+step*.38,-4.45+step*.39,wood);
 }
}
for(const x of [-2.05,2.05]){
 box(building,'vertical.rail',.085,25.8,.13,x,12.9,-.15,steel);
 box(building,'shaft.truss',.12,25.9,.12,x,12.9,-2.12,darkGold);
}
for(let i=0;i<4;i++){
 const y=i*7;
 box(building,'shaft.threshold',4.6,.18,1.85,0,y-.14,-2.76,tile);
 box(building,'floor.level.girder',15.9,.23,.33,0,y+5.04,2.03,gold);
 for(const s of [-1,1])box(building,'floor.rivet.pier',.20,5.1,.20,s*2.45,y+2.52,1.89,ivory);
}
box(building,'roof.slab',16.3,.38,10.0,0,26.1,-1.0,ivory);
box(building,'roof.crown',16.9,.21,10.7,0,26.48,-1.0,gold);
for(const x of [-1.9,1.9]){cyl(building,'traction.drum',.56,.45,x,25.2,-1.3,darkGold,'z',40);
 cyl(building,'traction.hub',.21,.52,x,25.2,-1.04,gold,'z');}
box(building,'machine.carriage',4.5,1.15,2.2,0,24.48,-1.45,slate);
for(let k=0;k<14;k++){
 const a=k*Math.PI*2/14;
 box(building,'winch.gear.tooth',.15,.30,.19,1.9+Math.cos(a)*.59,25.2+Math.sin(a)*.59,-.99,gold);
}
const drums=building.children.filter(o=>o.name==='traction.drum'||o.name==='traction.hub');
 const winchTeeth=building.children.filter(o=>o.name==='winch.gear.tooth');
 for(const x of [-1.9,1.9])for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=box(building,'winch.spoke',.065,.45,.035,x+Math.sin(a)*.23,25.2+Math.cos(a)*.23,-.78,darkGold);spoke.rotation.z=-a;spoke.userData.winch={x,a};}
 const cables=[];
for(const x of [-.83,.83]){
 const c=cyl(building,'load.cable',.024,1,x,15,-1.34,steel);cables.push(c);
}
const counterweight=box(building,'counterweight',.54,1.8,.55,2.9,11,-1.55,steel);
for(let k=0;k<16;k++)box(building,'shaft.cross.brace',4.42,.065,.09,0,k*1.45+1.0,-2.3,darkGold);

// CAB: 3D detailed original V1 doors embedded as movable structural components.
const cab=new THREE.Group();cab.name='lift.car.actual.vertical.motion';scene.add(cab);
box(cab,'floor.deck',3.56,.19,3.84,0,-.1,0,wood);
box(cab,'floor.marquetry',3.22,.018,3.49,0,.01,0,porcelain);
box(cab,'floor.runner',2.75,.024,2.72,0,.028,0,wine);
for(const s of [-1,1]){
 box(cab,'side.panel',.18,3.07,3.86,s*1.71,1.56,0,wood);
 box(cab,'side.inset',.025,2.45,2.82,s*1.60,1.62,0,wine);
 for(const z of [-1.18,-.39,.39,1.18])box(cab,'wood.framing',.05,2.65,.11,s*1.58,1.54,z,gold);
 box(cab,'safety.handrail',.12,.075,3.3,s*1.51,1.03,0,gold);
 for(const z of [-1.23,0,1.23])box(cab,'rail.mount',.11,.16,.10,s*1.51,1,z,black);
 box(cab,'top.corner',.17,3.40,.19,s*1.68,1.7,-1.76,gold);
}
box(cab,'cabin.roof',3.65,.20,3.85,0,3.25,0,wood);
box(cab,'coffered.ceiling',3.1,.08,3.2,0,3.09,0,darkGold);
box(cab,'luminous.fixture',1.14,.025,1.47,0,3.02,0,brassGlow);
lamp(cab,0xffcfa0,7,7.2,0,2.95,0);
const front=createDoorPortal(THREE);front.root.position.z=1.95;front.root.name='front.portal.reused.v1';cab.add(front.root);
const rear=createDoorPortal(THREE);rear.root.position.z=-1.95;rear.root.rotation.y=Math.PI;rear.root.name='rear.portal.reused.v1';cab.add(rear.root);
const fit=[assertDoorClearance(front),assertDoorClearance(rear)];
if(!fit.every(f=>f.pass))throw Error('MECHANICAL: door kit clearance failed');
// Art Deco decorative craft: bevelled brass rosettes and a continuous ceiling light.
 for(const s of [-1,1])for(const z of [-1.08,0,1.08]){
  const disk=new THREE.Mesh(new THREE.TorusGeometry(.31,.021,8,48),gold);disk.position.set(s*1.565,1.75,z);disk.rotation.y=Math.PI/2;cab.add(disk);
  for(let j=0;j<8;j++){const a=j*Math.PI/4;const o=new THREE.Mesh(new THREE.CapsuleGeometry(.013,.20,3,8),gold);o.position.set(s*1.55,1.75+Math.cos(a)*.14,z+Math.sin(a)*.14);o.rotation.x=a;cab.add(o);}
 }
 const displayCanvas=document.createElement('canvas');displayCanvas.width=256;displayCanvas.height=128;
const displayTex=new THREE.CanvasTexture(displayCanvas);displayTex.colorSpace=THREE.SRGBColorSpace;
const displayMat=m(0xffffff,.1,.35,{map:displayTex,emissive:0xdba45c,emissiveMap:displayTex,emissiveIntensity:1.5});
box(cab,'indicator.backplate',.80,.42,.13,0,2.72,1.67,gold);
box(cab,'indicator.screen',.57,.26,.016,0,2.73,1.76,displayMat);
let floorLabel='';
function showNumber(label){
 if(floorLabel===label)return;floorLabel=label;
 const g=displayCanvas.getContext('2d');
 g.fillStyle='#11191b';g.fillRect(0,0,256,128);
 g.fillStyle='#f0c486';g.font='bold 75px Georgia';g.textAlign='center';g.textBaseline='middle';g.fillText(label,128,65);
 displayTex.needsUpdate=true;
}
const call=box(building,'lobby.call.plate',.28,.68,.12,1.8,1.48,2.1,gold);
sphere(building,'lobby.call.button',.072,1.8,1.49,2.22,brassGlow);

// The same physical shaft opens onto three DIFFERENT full spatial worlds.
// WORLD I: glass-and-iron conservatory, warm sunlight, arched trusses and plants.
const worlds=[];
function makeWorld(id,height){
 const g=new THREE.Group();g.name='destination.'+id;g.position.y=height;scene.add(g);worlds.push(g);
 return g;
}
const garden=makeWorld('01.conservatory',7);
box(garden,'glasshouse.stone.walkway',5.6,.22,14.8,0,-.18,-10.15,porcelain);
for(const s of [-1,1]){
 box(garden,'glasshouse.bed',1.14,.42,12.5,s*2.30,.09,-10.28,wood);
 box(garden,'glasshouse.rail',.10,.89,13.1,s*1.65,.46,-10.35,darkGold);
 for(let n=0;n<7;n++){
  box(garden,'glasshouse.post',.12,4.2,.16,s*2.64,2.0,-4.7-n*1.85,steel);
  box(garden,'greenhouse.glass.pane',.03,2.35,1.73,s*2.75,2.30,-4.7-n*1.85,m(0x87b3a9,.25,.14,{transparent:true,opacity:.28,depthWrite:false}));
 }
}
for(let n=0;n<7;n++){const z=-4.55-n*1.89;
 arch(garden,2.68,0,2.05,z,steel);
 box(garden,'roof.transverse.rib',5.42,.12,.15,0,4.77,z,steel);}
box(garden,'greenhouse.back',5.5,4.75,.13,0,2.28,-17.48,emerald);
// Curved botanical blades: authored doubly curved surface, not cone foliage.
 const plantGeo=new THREE.BufferGeometry(),pv=[],pi=[];
 for(let j=0;j<=12;j++){const u=j/12,w=Math.sin(Math.PI*u)**.8*.15;for(let k=0;k<3;k++){const v=k-1;pv.push(v*w,.61*u,.15*u*u+.045*(1-v*v)*Math.sin(Math.PI*u));}}
 for(let j=0;j<12;j++)for(let k=0;k<2;k++){const a=j*3+k;pi.push(a,a+3,a+1,a+1,a+3,a+4)}plantGeo.setAttribute('position',new THREE.Float32BufferAttribute(pv,3));plantGeo.setIndex(pi);plantGeo.computeVertexNormals();leaf.side=leafBright.side=THREE.DoubleSide;
let rs=38571;const rand=()=>{rs=(Math.imul(1664525,rs)+1013904223)>>>0;return rs/4294967296};
for(let n=0;n<110;n++){
 const side=n%2?-1:1,x=side*(1.85+rand()*.72),z=-4.55-rand()*12.15;
 const y=.27,h=.23+rand()*.52;
 const stem=cyl(garden,'botanical.stalk',.018,h*1.6,x,y+h*.75,z,emerald);
 for(let j=0;j<4;j++){
  const l=new THREE.Mesh(plantGeo,j%3?leaf:leafBright);
  l.scale.set(.72+rand()*.7,.66+rand()*.9,.5+rand());
  l.position.set(x+Math.cos(j*1.57)*.15,y+h*(.5+j*.23),z+Math.sin(j*1.57)*.15);
  l.rotation.y=j*1.57+n*.41;l.rotation.z=Math.cos(j*1.57)*.73;l.rotation.x=Math.sin(j*1.57)*.65;garden.add(l);
 }
}
for(let n=0;n<3;n++)lamp(garden,0xffdb9b,7,10,(n%2?1:-1)*2.0,3.3,-5.8-n*4.1);

// WORLD II: stacked library, tall double-height vault, mechanical planetary orrery.
const library=makeWorld('02.astral.library',14);
box(library,'library.parquet',6.35,.24,15.6,0,-.18,-10.1,wood);
box(library,'library.ceiling',6.4,.19,15.5,0,5.10,-10.1,midnight);
for(const s of [-1,1]){
 box(library,'library.wall',.23,5.1,15.5,s*3.11,2.38,-10.1,midnight);
 for(let b=0;b<5;b++){
  const z=-5.0-b*2.62;
  box(library,'library.shelf.back',.15,4.75,2.48,s*2.87,2.36,z,wood);
  for(let j=0;j<6;j++){
   box(library,'shelf.horizontal',.69,.085,2.44,s*2.63,.45+j*.73,z,darkGold);
  }
  box(library,'shelf.arch',.12,4.8,.20,s*2.42,2.43,z-1.25,gold);
 }
 for(let z=-5;z>-18;z-=2.64){
  box(library,'gallery.footing',.88,.15,2.55,s*2.35,3.5,z,gold);
 }
}
const bookGeo=new THREE.BoxGeometry(.26,.43,.115);
const colors=[0x9c4b48,0x526b79,0x826544,0x52536f,0x6d7353].map(c=>m(c,.05,.71));
for(let k=0;k<5;k++){
 const im=new THREE.InstancedMesh(bookGeo,colors[k],220);im.name='instanced.authored.books';let ix=0;
 const dummy=new THREE.Object3D();
 for(let side of [-1,1])for(let b=0;b<5;b++)for(let sh=0;sh<5;sh++)for(let n=0;n<22;n++){
  if((b*3+sh*5+n+side*11+150)%5!==k)continue;
  dummy.position.set(side*(2.55+.014*((n%3)-1)),.77+sh*.73,-6.2+b*(-2.62)+n*.103);
  dummy.rotation.set(0,side*Math.PI/2,0);dummy.scale.set(.78+((n+sh)%4)*.07,.72+((n+b)%3)*.10,.81);
  dummy.updateMatrix();im.setMatrixAt(ix++,dummy.matrix);
 }
 im.count=ix;library.add(im);
}
for(let n=0;n<6;n++){const z=-5.2-n*2.35;
 arch(library,2.65,0,2.2,z,gold);
 box(library,'vault.beam',5.8,.10,.16,0,4.96,z,darkGold);
}
const orrery=new THREE.Group();orrery.name='actual.rotating.orrery';orrery.position.set(0,2.25,-10.6);library.add(orrery);
sphere(orrery,'sun',.47,0,0,0,brassGlow,32);
const planets=[];
for(const [idx,r] of [1.1,1.75,2.43].entries()){
 const loop=new THREE.Mesh(new THREE.TorusGeometry(r,.023,5,72),gold);
 loop.rotation.x=Math.PI/2+(idx-1)*.28;orrery.add(loop);
 const moon=sphere(orrery,'orbiting.planet',.12+idx*.06,r,0,0,idx===0?porcelain:idx===1?steel:wine,22);
 planets.push({moon,r,idx});
}
lamp(library,0xc9a7ff,8,9,0,4,-11);
lamp(library,0xffb978,6,7,-2.4,3.5,-6);
lamp(library,0xffb978,6,7,2.4,3.5,-14);

// WORLD III: pressure-hull tunnel, layered 3D abyss, actual windows and fauna.
const abyss=makeWorld('03.abyss.observatory',21);
box(abyss,'tunnel.floor',5.2,.22,16.3,0,-.17,-10.7,slate);
box(abyss,'tunnel.ceiling',5.2,.24,16.3,0,4.52,-10.7,steel);
for(const s of [-1,1]){
 // True apertures in the pressure wall, cut into the mesh before extrusion.
 const sh=new THREE.Shape();sh.moveTo(-8.15,0);sh.lineTo(8.15,0);sh.lineTo(8.15,4.6);sh.lineTo(-8.15,4.6);sh.closePath();
 for(let n=0;n<5;n++){const hole=new THREE.Path();hole.absarc(-(-5-n*2.82+10.7),2.34,.98,0,Math.PI*2,true);sh.holes.push(hole)}
 const wall=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.21,bevelEnabled:false,curveSegments:32}),sea);wall.name='pressure.wall.with.real.apertures';wall.position.set(s*2.62-.105,0,-10.7);wall.rotation.y=Math.PI/2;abyss.add(wall);
 for(let n=0;n<5;n++){
  const z=-5.0-n*2.82;
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.045,.12,16,48),steel);rim.position.set(s*2.57,2.34,z);rim.rotation.y=Math.PI/2;abyss.add(rim);
  // The former opaque water disc blocked all views. Removed; fauna is beyond a transparent pane.
  const seal=cyl(abyss,'outer.glass.glow',.88,.011,s*2.575,2.34,z,bioglow,'x',40);
  seal.material=m(0x54b0c2,.38,.10,{transparent:true,opacity:.13,depthWrite:false});
  for(let i=0;i<12;i++){const a=Math.PI*2*i/12;
   sphere(abyss,'window.bolt',.036,s*2.47,2.34+1.1*Math.sin(a),z+1.1*Math.cos(a),gold,8);}
 }
}
for(let n=0;n<9;n++){
 const z=-4.2-n*1.65;
 arch(abyss,2.48,0,2.12,z,steel);
 box(abyss,'hull.rib',5.15,.08,.19,0,4.35,z,steel);
 box(abyss,'light.track',2.4,.04,.13,0,4.24,z,bioglow);
}
box(abyss,'abyss.bulkhead',5.2,4.55,.14,0,2.22,-18.75,sea);
lamp(abyss,0x4adce7,7,9,0,3.7,-8);
lamp(abyss,0x50bbdc,6,9,0,3.7,-15);
const aquatic=[];
for(let i=0;i<28;i++){
 const x=(i%2?-1:1)*(3.6+(i%4)*.78),y=.7+(i%5)*.7,z=-5-(i%12)*1.03;
 const f=new THREE.Group();f.name='spatial.fish.mesh';
 const body=sphere(f,'fish.body',.15,0,0,0,i%2?blue:bioglow);
 body.scale.set(1.42,.54,.55);
 const tri=new THREE.BufferGeometry();
 tri.setAttribute('position',new THREE.Float32BufferAttribute([-.10,0,0,-.36,.17,0,-.36,-.17,0],3));
 tri.computeVertexNormals();const tail=new THREE.Mesh(tri,new THREE.MeshStandardMaterial({color:i%2?0x399fb8:0x6ae4c9,side:THREE.DoubleSide}));
 f.add(tail);f.position.set(x,y,z);abyss.add(f);f.userData.swim={x,y,z,phase:i*.73};aquatic.push(f);
}
for(let n=0;n<36;n++){
 const s=n%2?-1:1,z=-4.5-(n%15)*.93;
 const kelp=cyl(abyss,'kelp.stem',.018,.7+(n%4)*.32,s*(3.2+(n%3)*.54),.8,z,leaf);
 kelp.rotation.z=Math.sin(n)*.27;
}
const glowGlass=m(0x51dfeb,.1,.2,{emissive:0x317fa1,emissiveIntensity:.4});
for(let i=0;i<8;i++){
 const j=new THREE.Group();j.name='abyss.jellyfish';j.position.set((i%2?-1:1)*(3.5+i*.31),1.3+(i%4)*.7,-6-i*1.45);abyss.add(j);
 const bell=new THREE.Mesh(new THREE.SphereGeometry(.29,16,10,0,Math.PI*2,0,Math.PI/2),glowGlass);j.add(bell);
 for(let k=0;k<5;k++)cyl(j,'jellyfish.tentacle',.012,.4+(.1*k),Math.cos(k*1.26)*.12,-.28,Math.sin(k*1.26)*.12,bioglow);
 aquatic.push(j);
}
// Warm lobby, physically accessible at level zero.
const lobby=new THREE.Group();lobby.name='lobby.level.zero';scene.add(lobby);
box(lobby,'marble.floor',7.75,.20,11.3,0,-.14,6.22,tile);
for(let i=-4;i<=4;i++){
 box(lobby,'floor.inlay',.022,.011,10.8,i*.87,.0,6.15,darkGold);
}
for(let i=1;i<=10;i++)box(lobby,'floor.seams',7.6,.01,.02,0,0,i*1.02,gold);
for(const s of [-1,1]){
 box(lobby,'lobby.wall',.18,5.2,11.5,s*3.9,2.5,6.18,wine);
 for(let z=2.6;z<11;z+=2.1){
  box(lobby,'lobby.pier',.24,4.5,.37,s*3.73,2.22,z,gold);
  box(lobby,'panel.recess',.038,2.9,1.24,s*3.79,2.27,z+.72,wood);
 }
 lamp(lobby,0xffc07b,6,8,s*3.3,3.14,4.5);
}
box(lobby,'lobby.ceiling',7.65,.26,11.15,0,5.04,6.22,wood);
box(lobby,'lobby.arch.lintel',8,.21,.42,0,4.66,1.65,gold);
for(let i=0;i<4;i++)box(lobby,'chandelier.cross',.12,.07,1.65,(i-1.5)*.55,4.65,6.8,gold);
lamp(lobby,0xffbe7d,9,11,0,4.5,7);

// Original traveler, no remote GLB load. All geometry and gait are authored source.
const traveler=createTraveler(THREE),actorRoot=traveler.root;scene.add(actorRoot);actorLoaded=true;
const sound=createSynthSound();
let soundMuted=false;const cues=[[2.7,'call'],[3.2,'open'],[8.2,'close'],[10.2,'ride'],[14,'stop'],[14.2,'reveal'],[22.1,'close'],[23.2,'ride'],[27.1,'reveal'],[35.1,'close'],[36.1,'ride'],[40.1,'reveal']];
function opening(t,start,end,closeStart,closeEnd){
 if(t<start)return 0;if(t<end)return ease((t-start)/(end-start));
 if(t<closeStart)return 1;if(t<closeEnd)return 1-ease((t-closeStart)/(closeEnd-closeStart));
 return 0;
}
function cabinHeight(t){
 if(t<10)return 0;
 if(t<14)return blend(0,7,(t-10)/4);
 if(t<23)return 7;
 if(t<27)return blend(7,14,(t-23)/4);
 if(t<36)return 14;
 if(t<40)return blend(14,21,(t-36)/4);
 return 21;
}
function currentFloor(t){return t<10?0:t<23?1:t<36?2:3}
const V=(v)=>new THREE.Vector3(...v);
function poseCamera(t){
 let p,a,fov=60;
 if(t<3){p=[15,13.8,23];a=[0,12,0];fov=49;}
 else if(t<5){const k=ease((t-3)/2);p=[blend(1.45,.95,k),1.59,blend(2.6,3.0,k)];a=[-.36,1.40,4.20];fov=49;}
 else if(t<8.2){const k=ease((t-5)/3.2);p=[blend(1.45,1.18,k),1.60,blend(5.65,3.50,k)];a=[-.32,1.30,4.20-3.76*ease((t-5)/3)];fov=58;}
 else if(t<14){const y=cabinHeight(t);p=[.52,1.69+y,.65];a=[0,1.6+y,-5];fov=62;}
 else if(t<23){const y=7;const u=t<16?0:t<20?ease((t-16)/4):t<22?1-ease((t-20)/2):0;
 p=[blend(.44,-.38,u),1.68+y,blend(.56,-2.36,u)];a=[0,1.72+y,-11];fov=blend(60,73,u);}
 else if(t<27){const y=cabinHeight(t);p=[.35,1.68+y,.6];a=[0,1.65+y,-10];}
 else if(t<36){const y=14;const u=t<29?0:t<33?ease((t-29)/4):t<35?1-ease((t-33)/2):0;
 p=[blend(.35,.68,u),1.69+y,blend(.6,-2.65,u)];a=[0,2.2+y,-11];fov=blend(62,70,u);}
 else if(t<40){const y=cabinHeight(t);p=[.4,1.68+y,.6];a=[0,1.7+y,-11];}
 else if(t<56){const y=21;const u=t<42?0:ease((t-42)/4);
 p=[blend(.36,-.4,u),1.74+y,blend(.59,-3.65,u)];a=[0,1.7+y,-13];fov=blend(60,68,u);}
 else {p=[14,14.5,24];a=[0,12,0];fov=49;}
 camera.fov=fov;camera.updateProjectionMatrix();camera.position.copy(V(p));
 camera.lookAt(V(a));
}
const selectedFloorButton=i=>document.querySelector('[data-floor="'+i+'"]');
function update(t,delta=0){
 time=clamp(t,0,duration);
 const y=cabinHeight(time);cab.position.y=y;
 const frontOp=opening(time,3.2,4.9,8.2,10.0);
 const rearOp=Math.max(opening(time,14,16,22,23),opening(time,27,29,35,36),opening(time,40,42,57,58));
 front.setOpen(frontOp);rear.setOpen(rearOp);
 const top=24.30,carTop=y+3.45,span=Math.max(.2,top-carTop);
 cables.forEach(c=>{c.scale.y=span;c.position.y=carTop+span/2});
 counterweight.position.y=clamp(23-y,2,23);
 const ang=y/.56;winchTeeth.forEach((o,i)=>{const a=i*Math.PI*2/14+ang;o.position.set(1.9+Math.cos(a)*.59,25.2+Math.sin(a)*.59,-.99);o.rotation.z=a-Math.PI/2;});
 for(const o of building.children)if(o.userData.winch){const {x,a}=o.userData.winch,b=a+ang;o.position.set(x+Math.sin(b)*.23,25.2+Math.cos(b)*.23,-.78);o.rotation.z=-b;}
 showNumber(currentFloor(time)===0?'G':String(currentFloor(time)).padStart(2,'0'));
 for(const [i,el] of [...document.querySelectorAll('[data-floor]')].entries())
  el.classList.toggle('active',i===Math.max(0,currentFloor(time)-1));
 const distance=3.76*ease((time-5)/3),inside=time>=8;
 if(inside&&actorRoot.parent!==cab)cab.attach(actorRoot);
 if(!inside&&actorRoot.parent!==scene)scene.attach(actorRoot);
 actorRoot.position.set(-.36,0,4.20-distance);actorRoot.rotation.y=Math.PI;
 traveler.pose(time,distance,time>5&&time<8, inside?Math.sin(time*.8)*.8:0);
 orrery.rotation.y=time*.17;
 planets.forEach(({moon,r,idx})=>{const a=time*(.30/(idx+1))+idx*2;
 moon.position.set(Math.cos(a)*r,Math.sin(a)*.26,Math.sin(a)*r)});
 aquatic.forEach((o,i)=>{const q=o.userData.swim;if(q){const a=time*.22+q.phase;o.position.set(q.x+Math.sin(a)*.36,q.y+Math.sin(a*.5)*.11,q.z+Math.cos(a)*.77);const vx=Math.cos(a)*.36,vz=-Math.sin(a)*.77;o.rotation.y=Math.atan2(-vz,vx);o.children[1].rotation.y=Math.sin(time*7+i)*.28;}else{if(o.userData.baseY===undefined)o.userData.baseY=o.position.y;o.position.y=o.userData.baseY+Math.sin(time*.58+i)*.085;}});
 // Cinema and free inspection share the same physical scene.
 if(mode==='cine')poseCamera(time);
 if(mode!=='cine'){orbit.target.y=mode==='edificio'?12:y+1.9;}
 $('#timeline').value=String(time);$('#timeline').style.setProperty('--progress',(time/duration*100)+'%');
 $('#clock').textContent=Math.floor(time/60).toString().padStart(2,'0')+':'+Math.floor(time%60).toString().padStart(2,'0');
 $('#phase').textContent=time<10?'VESTÍBULO':time<23?'I · INVERNADERO':time<36?'II · BIBLIOTECA':'III · ABISMO';
}
function setMode(next){
 mode=next;orbit.enabled=next!=='cine';$('#mode').textContent=next==='cine'?'EXPLORAR':'CINE';
 $('#building').classList.toggle('active',next==='edificio');
 if(next==='cine'){orbit.enabled=false;poseCamera(time);}
 else if(next==='edificio'){camera.position.set(16,14,25);orbit.target.set(0,12,-1);orbit.update();}
 else {const y=cabinHeight(time);orbit.target.set(0,y+1.65,currentFloor(time)===0?1:-9);orbit.update();}
}
function play(){
 sound.activate();
 if(time>=duration-.05){time=0;sound.reset();}
 playing=true;$('#play').textContent='Ⅱ';$('#gate').classList.add('hide');
 if(mode==='edificio')setMode('cine');
}
function pause(){playing=false;$('#play').textContent='▷'}
$('#start').addEventListener('click',()=>{setMode('cine');play()});
$('#play').addEventListener('click',()=>playing?pause():play());
$('#mode').addEventListener('click',()=>{pause();setMode(mode==='cine'?'libre':'cine');$('#tools').removeAttribute('open')});
$('#building').addEventListener('click',()=>{pause();setMode(mode==='edificio'?'cine':'edificio');$('#tools').removeAttribute('open')});
$('#sound').addEventListener('click',()=>{soundMuted=!soundMuted;sound.setMuted(soundMuted);$('#sound').textContent=soundMuted?'×':'♫'});
$('#timeline').addEventListener('input',e=>{pause();prevTime=Number(e.target.value);update(prevTime)});
document.querySelectorAll('[data-floor]').forEach(button=>button.addEventListener('click',()=>{
 pause();time=[18,31,45][Number(button.dataset.floor)];prevTime=time;update(time);
 setMode('libre');$('#tools').removeAttribute('open');
}));
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(innerWidth,innerHeight)});
window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();playing?pause():play()}});
window.__qa={ready:true,version:'V3',project:'ascensor-retro',actualShaft:true,levels:levels.length,worlds:worlds.map(o=>o.name),reusedDoorKit:true,doorFit:fit,actor:{authored:true,variant:traveler.variant,front:traveler.front,externalAsset:false},get time(){return time},setTime:t=>{pause();update(t)},get mode(){return mode},meshCount:()=>{let n=0;scene.traverse(x=>{if(x.isMesh)n++});return n}};
update(0);let last=performance.now();
function frame(now){
 const dt=Math.min(.08,(now-last)/1000);last=now;
 if(playing){const next=Math.min(duration,time+dt);for(const [at,cue] of cues)if(time<at&&next>=at)sound.cue(cue);if(next===duration)pause();update(next,dt);}
 else if(mode!=='cine')traveler.pose(time,3.76*ease((time-5)/3),time>5&&time<8,Math.sin(time*.8)*.8);
 if(orbit.enabled)orbit.update();
 renderer.render(scene,camera);requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
