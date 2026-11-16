import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

/* PROMETEO STUDIO · ÚLTIMA PARADA · 3D authored meshes and authored clips
 * Hero from an existing skinned GLB, vehicle from licensed PSX pack.
 * No steering-wheel fake acting; no additive bone rotations; no rain LineSegments.
 * Everything is a deterministic function of playhead t for QA frames.
 */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v)},mod=(a,n)=>((a%n)+n)%n;
const V=(x,y,z)=>new THREE.Vector3(x,y,z),T=30;
const qs=new URLSearchParams(location.search);
const qa=window.__AFTERHOURS_QA={ready:false,frameVisible:false,renderFrames:0,assetProvenance:'CC BY 4.0 PSX Character Creator Free + PSX Vehicles Free / embedded UV atlas',mobilePhysical:'NOT_RUN',artStatus:'PENDING_HUMAN',rain:'InstancedMesh alpha quads / THREE.LineSegments forbidden',version:'2026-11-15/afterhours-r1'};
const shots=[
{a:0,b:3.7,title:'01 · LA ESTACIÓN',mode:'static',cam:[-9.0,3.65,15],look:[1.5,1.4,-7],fov:42},
{a:3.7,b:7.2,title:'02 · EL CAMINO',mode:'trackSide',offset:[-3.8,1.47,2.6],lookOffset:[.5,1.32,-1.7],fov:43,who:'VIAJERA',line:'¿Alguien sigue acá?'},
{a:7.2,b:10.1,title:'03 · ASFALTO',mode:'feet',offset:[-2.4,.38,1.5],lookOffset:[.05,.20,-.7],fov:38},
{a:10.1,b:13.3,title:'04 · TRAVELLING',mode:'track',offset:[-1.05,1.77,3.7],lookOffset:[0,1.5,0],fov:36,who:'VIAJERA',line:'Juraría que ayer estaba cerrado.'},
{a:13.3,b:16.1,title:'05 · EL CARTEL',mode:'static',cam:[-.3,2.22,-6.2],look:[6.8,3.45,-8.8],fov:33},
{a:16.1,b:19.0,title:'06 · ASIENTO VACÍO',mode:'static',cam:[-2.1,1.45,-1.1],look:[2.25,.88,-7],fov:39,who:'RADIO',line:'...último servicio...'},
{a:19.0,b:22.5,title:'07 · LA MIRADA',mode:'track',offset:[-1.38,1.63,2.8],lookOffset:[0,1.50,-.13],fov:34},
{a:22.5,b:26.1,title:'08 · FAROS',mode:'static',cam:[-3.75,1.6,-3.45],look:[2.22,.8,-7.0],fov:39,who:'VIAJERA',line:'Pero... no hay nadie adentro.'},
{a:26.1,b:30.0,title:'09 · SIN REGRESO',mode:'pullback',cam:[-5,3.25,2.8],end:[-10,4.9,10],look:[.65,1.2,-6.5],fov:45,who:'',line:'Y el motor arrancó solo.'}
];
let scene,renderer,camera,loader,world,actorAnchor,actor,gltfClips=[],mixer,carAnchor,car,
rainLayers=[],rainTexture,streetLights=[],carLamps=[],neonMaterials=[],ready=false,playing=false,muted=false,last=0,t=0,lastStep=-1,audio=null;
function texture(make,size=256){let c=document.createElement('canvas');c.width=c.height=size;let ctx=c.getContext('2d');make(ctx,size);let tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;tx.magFilter=THREE.NearestFilter;tx.minFilter=THREE.NearestMipmapNearestFilter;tx.wrapS=THREE.RepeatWrapping;tx.wrapT=THREE.RepeatWrapping;return tx;}
function random(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)}
const mat=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const M={road:mat('#25313a',.44,{metalness:.075}),pavement:mat('#47504d',.78),ink:mat('#19272b',.86),trim:mat('#4f5e61',.78),stone:mat('#586366',.94),
gold:mat('#d9a367',.34,{emissive:'#ba622b',emissiveIntensity:1.35}),mint:mat('#7db6ab',.4,{emissive:'#278d86',emissiveIntensity:1.6}),
window:mat('#8cbaa9',.32,{emissive:'#ddb17a',emissiveIntensity:1.65}),black:mat('#0c161d',.85)};
function add(g,m,x=0,y=0,z=0,parent=world,name=''){let o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;o.name=name;parent.add(o);return o;}
function box(w,h,d,x,y,z,m=M.stone,parent=world,name=''){return add(new THREE.BoxGeometry(w,h,d),m,x,y,z,parent,name);}
function plane(w,d,x,z,m,y=.01){let o=add(new THREE.PlaneGeometry(w,d),m,x,y,z);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;}
function line(a,b,r=.04,m=M.ink,parent=world){const p=V(...a),q=V(...b),d=q.clone().sub(p);let o=add(new THREE.CylinderGeometry(r,r,d.length(),6),m,...p.add(q).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return o;}
function labelTexture(main,second,fg='#f3c47c',bg='#182c32'){
return texture((c,s)=>{c.fillStyle=bg;c.fillRect(0,0,s,s);c.fillStyle='#28434c';c.fillRect(9,12,s-18,s-24);
c.strokeStyle=fg;c.lineWidth=4;c.strokeRect(10,15,s-20,s-30);
c.fillStyle=fg;c.textAlign='center';c.font='bold 34px monospace';c.fillText(main,s/2,104,s-24);
c.font='bold 26px monospace';c.fillText(second,s/2,154,s-24);
c.font='12px monospace';c.fillText('RUTA PROVINCIAL · 1998',s/2,201,s-24);
},256);}
function roadAtlas(){
 const rnd=random(145);return texture((c,s)=>{c.fillStyle='#29383c';c.fillRect(0,0,s,s);
 for(let k=0;k<1500;k++){let v=rnd();c.fillStyle=v<.52?'#1b2a2e':v<.84?'#34484b':'#46565a';c.globalAlpha=.06+rnd()*.12;c.fillRect(rnd()*s,rnd()*s,1+rnd()*11,1+rnd()*3)}
 c.globalAlpha=1;c.strokeStyle='#1c272b';c.lineWidth=1;for(let k=0;k<8;k++){c.beginPath();let x=rnd()*s,y=rnd()*s;c.moveTo(x,y);c.lineTo(x+25+rnd()*40,y-1+rnd()*12);c.stroke()}
 },256);
}
function facadeAtlas(seed=1){
 const r=random(seed);
 return texture((g,s)=>{g.fillStyle=seed%2?'#344148':'#444749';g.fillRect(0,0,s,s);
 for(let k=0;k<450;k++){g.fillStyle=r()>.4?'#ffffff':'#091419';g.globalAlpha=.045;g.fillRect(r()*s,r()*s,2+r()*15,1+r()*7)}
 g.globalAlpha=1;
 for(let row=0;row<4;row++)for(let col=0;col<3;col++){
  const x=19+col*78,y=17+row*59,lit=r()>.58;
  g.fillStyle='#17252d';g.fillRect(x-3,y-3,55,47);
  g.fillStyle=lit?'#988568':'#213644';g.fillRect(x+1,y+1,47,39);
  g.fillStyle=lit?'#d1a777':'#29404a';g.fillRect(x+3,y+4,19,32);
  g.fillStyle='#1a2832';g.fillRect(x+24,y-1,4,43);g.fillRect(x-1,y+19,52,4);
  g.fillStyle='#6a7374';g.fillRect(x-6,y+42,62,5);
 }
 },256);
}
function radialGlow(color){
return texture((c,s)=>{const d=c.createRadialGradient(128,128,1,128,128,123);d.addColorStop(0,color);d.addColorStop(.38,color);d.addColorStop(1,'#00000000');c.fillStyle=d;c.fillRect(0,0,s,s)},256)}
function createWorld(){
 scene.background=new THREE.Color('#0c1e29');scene.fog=new THREE.FogExp2('#152b35',.018);
 const asphalt=roadAtlas(),road=mat('#dce7df',.44,{map:asphalt,metalness:.12});asphalt.repeat.set(3,17);
 plane(10,100,0,-13,road,-.04);
 const sidewalkAtlas=texture((c,s)=>{c.fillStyle='#5b6460';c.fillRect(0,0,s,s);c.strokeStyle='#414e4b';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.moveTo(0,i*52);c.lineTo(s,i*52);c.stroke()}c.beginPath();c.moveTo(128,0);c.lineTo(128,s);c.stroke()},256);
 sidewalkAtlas.repeat.set(1,14);const sidewalk=mat('#b7c5bb',.8,{map:sidewalkAtlas});
 for(const side of [-1,1]){
  box(.27,.23,100,side*5.07,.08,-13,M.pavement);
  plane(6.9,100,side*8.63,-13,sidewalk,.18);
  const curb=box(.16,.3,100,side*5.06,.04,-13,mat('#89928a',.7));
 }
 const paint=mat('#b9b9a6',.65);
 for(let z=-55;z<32;z+=6.4)box(.095,.012,2.15,0,-.013,z,paint);
 // Parcel-based architecture; two atlas families, a near hero storefront and distant blocks.
 const wall1=mat('#9ca7a0',.92,{map:facadeAtlas(43)}),wall2=mat('#9ca7a0',.92,{map:facadeAtlas(84)});
 box(.45,7.5,21,8.53,3.75,-11.8,wall1,world,'DEPOT_BRICK_FACADE');
 box(.28,.55,21,8.22,7.16,-11.8,M.ink);
 box(.34,7.4,18,-8.7,3.75,-18.8,wall2);
 box(.5,6,15,9.05,3.0,-35,wall2);
 box(.5,7.2,15,-9.05,3.5,-37,wall1);
 box(.46,9,17,8.9,4.5,-52,wall1);
 box(.5,9,15,-8.7,4.5,-51,wall2);
 // Store facade faces -X, visible from street.
 const glass=mat('#465d60',.24,{transparent:true,opacity:.76,metalness:.08});
 for(let k=0;k<3;k++){
  let z=-14.4+k*4;
  box(.08,2.65,2.35,8.22,1.77,z,glass,world,'STOREFRONT_WINDOW');
  box(.11,.09,2.48,8.13,3.07,z,M.trim);
  box(.11,.09,2.48,8.13,.45,z,M.trim);
  box(.11,2.65,.08,8.13,1.77,z-1.19,M.trim);
  box(.12,2.65,.08,8.13,1.77,z+1.19,M.trim);
  let glow=new THREE.PointLight('#ffc48a',k===1?4:1.9,5,2);glow.position.set(7.8,2.2,z);scene.add(glow);
 }
 box(2.1,.18,12,7.0,3.42,-11.6,M.ink,world,'AWNING');
 // Albedo+emissive typography, not floating info arrows.
 const poster=labelTexture('ESTACIÓN','24 HORAS','#ebc086','#26363b');
 const pm=mat('#ffffff',.7,{map:poster,emissiveMap:poster,emissive:'#a67543',emissiveIntensity:1.0});
 const sign=add(new THREE.PlaneGeometry(4.3,1.6),pm,7.08,4.12,-10.2,world,'MOTIVATED_NEON_SIGN');sign.rotation.y=-Math.PI/2;neonMaterials.push(pm);
 const sGlow=new THREE.PointLight('#e4ac6c',5.9,11,2);sGlow.position.set(5.38,4.15,-10);sGlow.castShadow=true;sGlow.shadow.mapSize.set(512,512);sGlow.shadow.bias=-.002;scene.add(sGlow);
 // Roadside canopy lamp is a visible source, not an invisible lighting trick.
 line([4.55,.3,-6],[4.55,4.65,-6],.075,M.ink);
 line([4.55,4.65,-6],[3.7,4.78,-6],.055,M.trim);
 box(.62,.16,.52,3.67,4.66,-6,M.gold);
 let warm=new THREE.SpotLight('#ffc487',55,18,Math.PI/4,.55,1.65);warm.position.set(3.67,4.5,-6);warm.target.position.set(-1.3,0,-5.5);
 warm.castShadow=true;warm.shadow.mapSize.set(1024,1024);warm.shadow.bias=-.0025;scene.add(warm,warm.target);
 streetLights.push(warm);
 line([-4.52,.2,1],[-4.52,5.35,1],.077,M.ink);
 line([-4.52,5.31,1],[-3.66,5.36,1],.05,M.ink);
 box(.63,.20,.5,-3.64,5.22,1,M.gold);
 const sideLamp=new THREE.SpotLight('#f8a86d',36,14,Math.PI/4.5,.57,1.3);sideLamp.position.set(-3.64,5.12,1);sideLamp.target.position.set(-2.3,0,-.7);sideLamp.castShadow=true;sideLamp.shadow.mapSize.set(512,512);scene.add(sideLamp,sideLamp.target);
 streetLights.push(sideLamp);
 let sky=new THREE.HemisphereLight('#9bb6c8','#172027',2.05);scene.add(sky);
 const moon=new THREE.DirectionalLight('#8eafc1',1.12);moon.position.set(-5,9,8);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-15;moon.shadow.camera.right=15;moon.shadow.camera.top=17;moon.shadow.camera.bottom=-17;moon.shadow.bias=-.003;scene.add(moon);
 // Cinematic halos motivated by the two street lamps.
 const halo=radialGlow('#e7af6d76');const hm=new THREE.MeshBasicMaterial({map:halo,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 for(const [x,y,z,sc] of [[3.67,4.64,-6,2.2],[-3.64,5.2,1,1.6]]){
  const h=add(new THREE.PlaneGeometry(sc,sc),hm,x,y,z);h.userData.billboard=true;h.castShadow=false;
 }
 // Wet surface glows where bright warm lamps actually are.
 const gh=new THREE.MeshBasicMaterial({map:radialGlow('#a8794f66'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
 for(const [x,z,w,d] of [[-3.25,1,1.7,5],[3.25,-6,2.0,8],[5.0,-12,1.5,5]]){
  const q=plane(w,d,x,z,gh,.014);q.material=gh;q.castShadow=false;
 }
 // Dedicated composition pieces: shutter, curb drain, notices, bollards.
 for(const z of [-16.7,-3.5]){box(.3,.30,.37,5.45,.17,z,M.ink);box(.12,1.4,.12,5.45,.88,z,M.ink)}
 for(let z=-24;z<20;z+=11){box(.12,.01,.48,4.55,.005,z,M.trim)}
 const roadSign=labelTexture('NO','RETORNO','#f4c18b','#243b48');let sr=add(new THREE.PlaneGeometry(1.55,1.55),mat('#ffffff',.9,{map:roadSign}),-5.3,3.4,-15);sr.rotation.y=Math.PI/2;
 line([-5.28,.18,-15],[-5.28,2.7,-15],.075,M.trim);
}
function setupCar(){
 carAnchor=new THREE.Group();carAnchor.position.set(2.56,0,-6.5);carAnchor.rotation.y=-.10;world.add(carAnchor);
 const beams=new THREE.Group();carAnchor.add(beams);
 // Headlights as motivated pools; remains invisible until last reveal.
 for(const x of [-.73,.73]){
  let lamp=new THREE.SpotLight('#fff0bf',0,24,.23,.46,1.1);lamp.position.set(x,.69,1.88);lamp.target.position.set(x*1.3,.02,11);
  beams.add(lamp,lamp.target);carLamps.push(lamp);
 }
}
function rainAtlas(){
return texture((c,s)=>{const grd=c.createLinearGradient(0,0,0,s);grd.addColorStop(0,'#ffffff00');grd.addColorStop(.34,'#f0f7e377');grd.addColorStop(.51,'#e5f7f6c0');grd.addColorStop(.70,'#a0d2db66');grd.addColorStop(1,'#ffffff00');c.fillStyle=grd;c.fillRect(105,0,46,s);
 const side=c.createLinearGradient(0,0,s,0);side.addColorStop(0,'#00000000');side.addColorStop(.5,'#ffffffaa');side.addColorStop(1,'#00000000');
 c.globalCompositeOperation='destination-in';c.fillStyle=side;c.fillRect(0,0,s,s);
},256)}
function setupRain(){
 rainTexture=rainAtlas();const counts=[64,82,62],bandDepth=[4.3,11.5,23],alpha=[.22,.17,.10],sz=[.11,.18,.23];
 for(let layer=0;layer<3;layer++){
  let meshMat=new THREE.MeshBasicMaterial({map:rainTexture,transparent:true,opacity:alpha[layer],depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.NormalBlending});
  const instance=new THREE.InstancedMesh(new THREE.PlaneGeometry(.022,sz[layer]),meshMat,counts[layer]);
  instance.frustumCulled=false;instance.castShadow=false;instance.receiveShadow=false;instance.renderOrder=4;world.add(instance);
  const rnd=random(2047+layer*331);
  const positions=Array.from({length:counts[layer]},()=>({x:(rnd()-.5)*(layer===0?5.8:13),y:rnd()*9,z:(rnd()-.5)*bandDepth[layer],speed:3.9+rnd()*2.5,seed:rnd(),r:rnd()}));
  rainLayers.push({mesh:instance,positions,opacity:alpha[layer],layer});
 }
}
function updateRain(time,cam){
 const dummy=new THREE.Object3D();const q=cam.quaternion;
 for(const layer of rainLayers){
  const target=layer.mesh;
  for(let i=0;i<layer.positions.length;i++){
   const a=layer.positions[i];
   const x=cam.position.x+a.x, z=cam.position.z-a.z-Math.abs(a.z)*.6;
   const y=.25+mod(a.y-time*a.speed,8.7);
   const d1=Math.hypot(x+3.64,z-1),d2=Math.hypot(x-3.67,z+6);
   const glow=Math.max(0,1-Math.min(d1,d2)/7);
   dummy.position.set(x,y,z);dummy.quaternion.copy(q);dummy.rotation.z+=.07;dummy.scale.setScalar(1);dummy.updateMatrix();
   target.setMatrixAt(i,dummy.matrix);
   const c=new THREE.Color().setRGB(.36+glow*.42,.55+glow*.27,.61-glow*.06);target.setColorAt(i,c);
  }
  target.instanceMatrix.needsUpdate=true;if(target.instanceColor)target.instanceColor.needsUpdate=true;
 }
}
function setupCamera(){
 camera=new THREE.PerspectiveCamera(42,9/16,.075,120);camera.position.set(-8,3,13);
}
async function loadLicensedBundled(name){
 const url='./assets/'+name+'-complete.glb.gz';
 const res=await fetch(url);
 if(!res.ok)throw Error('Pack PSX '+name+' HTTP '+res.status);
 if(!('DecompressionStream' in window))throw Error('Navegador sin DecompressionStream gzip');
 const stream=res.body.pipeThrough(new DecompressionStream('gzip'));
 const buffer=await new Response(stream).arrayBuffer();
 if(new DataView(buffer).getUint32(0,true)!==0x46546c67)throw Error('GLB '+name+' corrupto');
 return await loader.parseAsync(buffer,location.href);
}
async function loadModels(){
 loader=new GLTFLoader();
 const human=await loadLicensedBundled('student');
 qa.licensedModelVariant='PSX Character Creator Free/student.glb';

 actorAnchor=new THREE.Group();world.add(actorAnchor);
 actor=human.scene;actor.name='AUTHOR_RIGGED_SOLDIER';actorAnchor.add(actor);
 actor.updateMatrixWorld(true);let bb=new THREE.Box3().setFromObject(actor),sizes=bb.getSize(new THREE.Vector3());
 const s=1.78/Math.max(sizes.y,.01);actor.scale.setScalar(s);actor.position.y=-bb.min.y*s;
 actor.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;for(let m of (Array.isArray(o.material)?o.material:[o.material])){if(m?.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapNearestFilter}if(m){m.roughness=Math.max(m.roughness||.6,.7);m.metalness=.04}}});
 const clips=human.animations;
 const idle=clips.find(c=>/^idle$/i.test(c.name)),walk=clips.find(c=>/^walk$/i.test(c.name));
 if(!idle||!walk)throw Error('El GLB no trae clips Idle+Walk; no reemplazar con rotaciones artificiales');
 mixer=new THREE.AnimationMixer(actor);qa.heroClips=clips.map(c=>c.name);qa.heroHasRig=actor.getObjectByProperty('type','SkinnedMesh')!==undefined;
 for(const clip of [idle,walk]){const action=mixer.clipAction(clip);action.setLoop(THREE.LoopRepeat,Infinity);action.play();action.enabled=true;action.setEffectiveWeight(1)}
 qa.heroSource='PSX Character Creator Free by heyheythere (CC BY 4.0)';
 const carG=await loadLicensedBundled('car');
 car=carG.scene;carAnchor.add(car);
 car.updateMatrixWorld(true);
 let carBB=new THREE.Box3().setFromObject(car),carDims=carBB.getSize(new THREE.Vector3());
 // Preserve mesh's own design/material mapping. Normalize to 4.4m.
 if(carDims.x>carDims.z*1.2)car.rotation.y=Math.PI/2;
 car.updateMatrixWorld(true);carBB=new THREE.Box3().setFromObject(car);carDims=carBB.getSize(new THREE.Vector3());
 const u=4.4/Math.max(carDims.z,.001);car.scale.setScalar(u);car.updateMatrixWorld(true);carBB=new THREE.Box3().setFromObject(car);
 carAnchor.updateMatrixWorld(true);
 const center=carBB.getCenter(new THREE.Vector3());center.y=carBB.min.y;
 const localOrigin=carAnchor.worldToLocal(center.clone());
 car.position.sub(localOrigin);car.updateMatrixWorld(true);
 let mats=[];
 car.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;
  const paintOne=src=>{
   if(!src)return src;const m=src.clone();
   const name=(src.name+' '+o.name).toLowerCase();
   // Preserve licensed PSX atlas colours; previous version rendered white because its external atlas returned HTTP 404.
   if(!m.map&&m.color&&m.color.r>.75&&m.color.g>.75&&m.color.b>.75)m.color.multiply(new THREE.Color('#62837f'));
   m.metalness=.10;m.roughness=.66;
   if(m.map){m.map.magFilter=THREE.NearestFilter;m.map.minFilter=THREE.NearestMipmapNearestFilter}
   mats.push({mesh:o.name,material:src.name,color:src.color?.getHexString()});
   return m;
  };
  o.material=Array.isArray(o.material)?o.material.map(paintOne):paintOne(o.material);
 });qa.vehicleMaterialAudit=mats.slice(0,25);qa.vehicleClips=carG.animations.map(c=>c.name);
 // Vehicle remains parked. No arbitrary reversing and no floating driver.
 qa.carStationary=true;qa.heroLoaded=true;qa.carLoaded=true;
 ready=true;qa.ready=true;qa.duration=T;qa.shotCount=shots.length;
 $('loading').textContent='Actuación riggeada y escenario cargados.';
 $('status').textContent='LISTO · 9 PLANOS / 30 SEGUNDOS';
 const tparam=Number(qs.get('frame'));if(qs.has('frame')&&Number.isFinite(tparam)){setTime(clamp(tparam,0,T));$('curtain').hidden=true}
}
function characterZ(time){return 8.7-.64*clamp(time,0,22.4)}
function updateShot(time){
 let n=shots.findIndex(x=>time>=x.a&&time<x.b);if(n<0)n=shots.length-1;
 const shot=shots[n],u=smooth((time-shot.a)/(shot.b-shot.a));
 const pos=actorAnchor.position,heroZ=pos.z;let cp,target;
 if(shot.mode==='static'){cp=V(...shot.cam);target=V(...shot.look)}
 else if(shot.mode==='pullback'){cp=V(...shot.cam).lerp(V(...shot.end),u);target=V(...shot.look)}
 else if(shot.mode==='feet'){cp=pos.clone().add(V(...shot.offset));target=pos.clone().add(V(...shot.lookOffset))}
 else if(shot.mode==='trackSide'){cp=pos.clone().add(V(...shot.offset));target=pos.clone().add(V(...shot.lookOffset))}
 else{cp=pos.clone().add(V(...shot.offset));target=pos.clone().add(V(...shot.lookOffset))}
 if(n===5)target.y=1.12;
 camera.position.copy(cp);camera.lookAt(target);camera.fov=shot.fov;camera.updateProjectionMatrix();
 $('shot').textContent=shot.title;$('who').textContent=shot.who||'';$('line').textContent=shot.line||'';
 qa.shotIndex=n;qa.shotsVisited=[...new Set([...(qa.shotsVisited||[]),n])];
 world.traverse(o=>{if(o.userData.billboard)o.quaternion.copy(camera.quaternion)});
 updateRain(time,camera);
}
function setTime(time){
 t=clamp(time,0,T);
 const walking=smooth((t-1.2)/1.4)*(1-smooth((t-21.9)/.9));
 actorAnchor.position.set(-2.28,.01,characterZ(t));
 actorAnchor.rotation.y=.03*Math.sin(t*.25);
 if(mixer){
  for(const a of mixer._actions){const name=a.getClip().name.toLowerCase();a.setEffectiveWeight(name==='walk'?walking:name==='idle'?1-walking:0)}
  mixer.setTime(t);
 }
 const headlight=smooth((t-21.3)/.45);
 for(const c of carLamps)c.intensity=75*headlight;
 for(const m of neonMaterials)m.emissiveIntensity=1.05-.11*Math.sin(t*2.1);
 updateShot(t);
 $('time').textContent='00:'+String(Math.floor(t)).padStart(2,'0')+' / 00:30';$('timeline').value=String(t);
 qa.now=+t.toFixed(2);qa.walkWeight=+walking.toFixed(3);qa.heroWorld=actorAnchor.position.toArray();qa.carWorld=carAnchor.position.toArray();
 if(t>=T&&playing){playing=false;$('play').textContent='▶ REPRODUCIR';$('curtain').hidden=false;$('start').textContent='↺ VOLVER A VER';if(audio)audio.suspend()}
}
function startAudio(){
 if(muted)return;
 try{
 const C=window.AudioContext||window.webkitAudioContext;
 if(!C)return;
 if(!audio){
  audio=new C();
  // Original environmental sound design: three filtered rain textures with different bands.
  const n=audio.sampleRate*2,b=audio.createBuffer(1,n,audio.sampleRate),a=b.getChannelData(0),rng=random(1336);
  let prev=0;for(let i=0;i<n;i++){let z=rng()*2-1;prev=prev*.35+z*.65;a[i]=prev*.27}
  let noise=audio.createBufferSource();noise.buffer=b;noise.loop=true;
  const h=audio.createBiquadFilter();h.type='highpass';h.frequency.value=230;
  const lp=audio.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2800;
  const g=audio.createGain();g.gain.value=.12;noise.connect(h).connect(lp).connect(g).connect(audio.destination);noise.start();
  let hum=audio.createOscillator();hum.type='triangle';hum.frequency.value=56;
  const hg=audio.createGain();hg.gain.value=.013;hum.connect(hg).connect(audio.destination);hum.start();
 }
 audio.resume();
 }catch(e){qa.audioError=String(e)}
}
function footstep(){
 if(!audio||muted||audio.state!=='running')return;
 try{const n=Math.round(audio.sampleRate*.045),b=audio.createBuffer(1,n,audio.sampleRate),a=b.getChannelData(0),r=random(9861+lastStep);
 for(let i=0;i<n;i++){let d=1-i/n;a[i]=(r()*2-1)*d*d*.26}
 const x=audio.createBufferSource(),lp=audio.createBiquadFilter(),g=audio.createGain();x.buffer=b;lp.type='lowpass';lp.frequency.value=450;g.gain.value=.10;
 x.connect(lp).connect(g).connect(audio.destination);x.start()}catch(e){}
}
function frame(ts){
 requestAnimationFrame(frame);
 const dt=last?Math.min(.06,(ts-last)/1000):0;last=ts;
 if(playing){setTime(t+dt);let step=Math.floor(t/.55);if(step!==lastStep&&t>1.5&&t<22){lastStep=step;footstep()}}
 if(ready){renderer.render(scene,camera);qa.frameVisible=true;qa.renderFrames++;qa.lastRendered=t;}
}
function resize(){
 if(!renderer)return;const bounds=$('screen').getBoundingClientRect();
 let h=Math.min(620,Math.max(260,Math.floor(bounds.height))),w=Math.floor(h*9/16);
 renderer.setSize(w,h,false);camera.aspect=9/16;camera.updateProjectionMatrix();
 qa.renderResolution=[w,h];
}
function play(){
 if(!ready){$('loading').textContent='Esperando GLB auténticos…';return}
 if(t>=T)setTime(0);
 $('curtain').hidden=true;playing=true;$('play').textContent='Ⅱ PAUSAR';startAudio();
}
function init(){
 const canvas=$('screen');
 const gl=canvas.getContext('webgl2',{alpha:false,antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WebGL2 no disponible. Usá Chrome actualizado con aceleración gráfica.');
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:false,preserveDrawingBuffer:true});
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setPixelRatio(1);
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();world=new THREE.Group();scene.add(world);
 setupCamera();createWorld();setupCar();setupRain();resize();
 requestAnimationFrame(frame);window.addEventListener('resize',resize);
 $('start').onclick=play;$('play').onclick=()=>{if(playing){playing=false;$('play').textContent='▶ REPRODUCIR';audio?.suspend()}else play()};
 $('replay').onclick=()=>{setTime(0);play()};
 $('mute').onclick=()=>{muted=!muted;$('mute').textContent='SONIDO: '+(muted?'NO':'SÍ');if(muted)audio?.suspend();else if(playing)startAudio()};
 $('timeline').oninput=e=>setTime(Number(e.target.value));
 if(qs.has('frame'))$('curtain').hidden=true;
 loadModels().catch(e=>{qa.error=String(e);$('status').textContent='ERROR DE CARGA: '+e.message;$('loading').textContent='Falló la importación del GLB. Revisar conexión.';console.error(e)});
}
try{init()}catch(e){qa.error=String(e);$('status').textContent=e.message;$('loading').textContent=e.message;console.error(e)}
