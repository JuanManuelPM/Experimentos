import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// PROMETEO · FM01+FE01+FC01. Read-only CC0 GLB reuse from a pinned source.
const SRC='https://raw.githubusercontent.com/Hidencod/tge-assets/3ddcc695adbba9fb918cf31b7c139b3f95b76910/';
const PHOTO='https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01/asphalt_01_diff_1k.jpg';
const $=id=>document.getElementById(id), vec=a=>new THREE.Vector3(...a);
const CLIPS=9, FPS=24, SHOT=48, TOTAL=CLIPS*SHOT;
const SHOTS=[
 {name:'UNA CIUDAD TODAVÍA DESPIERTA',label:'01 · ESTABLECIMIENTO',p0:[13,6,18],p1:[11.5,5,14.6],a0:[0,2,-2],a1:[0,2,-3],fov:42},
 {name:'LA CALLE VACÍA',label:'02 · EJE DE CALLE',p0:[-2.5,1.7,13],p1:[-2.2,1.7,8.5],a0:[0,1.5,-9],a1:[0,1.6,-10],fov:43},
 {name:'LA FACHADA',label:'03 · EL EDIFICIO',p0:[3.2,3.5,7],p1:[1.2,3,2.4],a0:[7,3,-7],a1:[7,4,-7],fov:38},
 {name:'UN AUTO QUE NO SE MUEVE',label:'04 · EL TAXI',p0:[5,2.1,3],p1:[3.2,1.65,-.4],a0:[1.7,1,-3],a1:[1.7,.9,-3],fov:40},
 {name:'AL OTRO LADO',label:'05 · CONTRAPLANO',p0:[-3.1,2.3,-4],p1:[-1.8,2,-1.3],a0:[-7,3,-6],a1:[-7,3,-6],fov:40},
 {name:'UNA LUZ EN EL CRUCE',label:'06 · FAROL',p0:[-.9,1.65,-12],p1:[-.9,1.65,-7],a0:[-5,3.9,-7],a1:[-5,4.1,-7],fov:36},
 {name:'EL BARRIO, DESDE ARRIBA',label:'07 · GEOGRAFÍA',p0:[5,16,7],p1:[-3,13,3],a0:[0,0,-1],a1:[0,0,-1],fov:48},
 {name:'DOBLAR LA ESQUINA',label:'08 · ACERCAMIENTO',p0:[8,2.3,-11],p1:[5.5,2.1,-6],a0:[-2,2,-5],a1:[-2,2,-5],fov:41},
 {name:'EL ÚLTIMO PLANO',label:'09 · SALIDA',p0:[-1.6,4,-20],p1:[-11,6,-17],a0:[0,2,-3],a1:[0,2,-3],fov:46}
];
const ITEMS=[
 {id:'hotel',file:'city-kit-commercial/building-i',x:-7.8,z:-7.2,h:8.7,rotation:1.57},
 {id:'shop',file:'city-kit-commercial/building-f',x:8,z:-7.1,h:8.1,rotation:-1.57},
 {id:'cinema',file:'city-kit-commercial/building-j',x:-7.8,z:8,h:10.2,rotation:1.57},
 {id:'corner',file:'city-kit-commercial/building-e',x:8,z:8,h:8.2,rotation:-1.57},
 {id:'backA',file:'city-kit-commercial/low-detail-building-h',x:-8.4,z:-22,h:9.7,rotation:1.57},
 {id:'backB',file:'city-kit-commercial/low-detail-building-wide-b',x:8.8,z:-22,h:9.1,rotation:-1.57},
 {id:'taxi',file:'car-kit/taxi',x:1.65,z:-3.1,h:1.52,rotation:Math.PI},
 {id:'parked',file:'car-kit/sedan',x:-2.35,z:8,h:1.47,rotation:0},
 {id:'lamppostL',file:'city-kit-roads/light-curved',x:-5.25,z:-8,h:5.1,rotation:1.57},
 {id:'lamppostR',file:'city-kit-roads/light-curved',x:5.25,z:8,h:5.1,rotation:-1.57},
 {id:'stop',file:'city-kit-roads/road-sign-stop',x:-4.92,z:6,h:2.6,rotation:0},
 {id:'traffic',file:'city-kit-roads/traffic-light',x:5.05,z:-9.2,h:4.6,rotation:3.14},
 {id:'trash',file:'city-kit-roads/dumpster',x:6.3,z:3.2,h:1.5,rotation:1.1},
 {id:'tree',file:'city-kit-suburban/tree-large',x:-9.6,z:3.3,h:5.2,rotation:.3},
 {id:'tree2',file:'city-kit-suburban/tree-small',x:9,z:17,h:4.8,rotation:1.4}
];
const state={mode:'environment',webgl:'NOT_RUN',loaded:0,failed:0,assets:ITEMS.length,
 photo:'PENDING',frame:0,playing:false,shot:0,errors:[],capturedFrames:0};
const report=()=>({schema:'prometeo.3d.fm01-fe01-fc01.demo/v1',version:'20261116-studio-1',...state,
 source:'Hidencod/tge-assets@3ddcc695adbba9fb918cf31b7c139b3f95b76910',
 exactAssetIds:ITEMS.map(x=>x.file),shotCount:SHOTS.length,fps:FPS,durationFrames:TOTAL,
 renderer:renderer?.info?.render?.calls||null});
window.__PROMETEO_QA__=report;
const C={sky:'#111d22',fog:'#243139',road:'#303d41',concrete:'#6a7370',cream:'#d4b695',orange:'#e8a769'};
let renderer=null,scene,camera,controls,clock=new THREE.Clock(),roadA,roadB,photoMaterial,paintedMaterial,mixer=null,models={};
const texCanvas=(painter,w=512,h=512)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');painter(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=4;return t};
function paintedTexture(){
 // Designed asphalt atlas: large authored patches, cracks and worn traffic traces, not random grain.
 const tx=texCanvas((g,w,h)=>{
  g.fillStyle='#384248';g.fillRect(0,0,w,h);
  const patches=[[50,18,125,178,'#465056'],[303,85,151,223,'#343d41'],[83,314,265,116,'#414c4d']];
  for(const [x,y,a,b,color] of patches){g.fillStyle=color;g.fillRect(x,y,a,b);g.strokeStyle='#283134';g.lineWidth=3;g.strokeRect(x+2,y+2,a-4,b-4);}
  g.strokeStyle='#252e33';g.lineWidth=4;g.beginPath();g.moveTo(18,29);g.lineTo(116,100);g.lineTo(94,189);g.lineTo(172,242);g.lineTo(149,331);g.stroke();
  g.strokeStyle='#67706b';g.globalAlpha=.26;g.lineWidth=2;for(const x of [203,215,365,379]){g.beginPath();g.moveTo(x,3);g.bezierCurveTo(x+9,120,x-12,330,x+4,512);g.stroke()}g.globalAlpha=1;
  for(const [x,y] of [[35,454],[420,232],[300,50]]){g.strokeStyle='#56605c';g.lineWidth=2;g.beginPath();g.moveTo(x,y);g.lineTo(x+40,y+6);g.lineTo(x+63,y-14);g.stroke();}
 },512,512);
 tx.repeat.set(1.6,8);return tx;
}
function buildWorld(){
 scene.background=new THREE.Color(C.sky);scene.fog=new THREE.FogExp2(C.fog,.018);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(110,110),new THREE.MeshStandardMaterial({color:'#28362f',roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.065;scene.add(ground);
 paintedMaterial=new THREE.MeshStandardMaterial({map:paintedTexture(),roughness:.98,metalness:.02});
 photoMaterial=new THREE.MeshStandardMaterial({color:'#929995',roughness:.95,metalness:0});
 const roadGeom=new THREE.PlaneGeometry(4.92,48);
 roadA=new THREE.Mesh(roadGeom,photoMaterial);roadB=new THREE.Mesh(roadGeom,paintedMaterial);
 for(const [o,x] of [[roadA,-2.5],[roadB,2.5]]){o.rotation.x=-Math.PI/2;o.position.set(x,.002,-3);o.receiveShadow=true;scene.add(o);}
 const pave=new THREE.MeshStandardMaterial({color:'#626c68',roughness:1});
 const curb=new THREE.MeshStandardMaterial({color:'#b2a69a',roughness:1});
 for(const side of [-1,1]){
  const sidewalk=new THREE.Mesh(new THREE.PlaneGeometry(4.9,48),pave);sidewalk.rotation.x=-Math.PI/2;sidewalk.position.set(side*7.58,.095,-3);sidewalk.receiveShadow=true;scene.add(sidewalk);
  const kerb=new THREE.Mesh(new THREE.BoxGeometry(.20,.21,48),curb);kerb.position.set(side*5.10,.045,-3);kerb.receiveShadow=true;scene.add(kerb);
  const seams=new THREE.MeshStandardMaterial({color:'#465350',roughness:1});
  for(let z=-25;z<21;z+=4.6){const s=new THREE.Mesh(new THREE.BoxGeometry(4.7,.004,.025),seams);s.position.set(side*7.58,.103,z);scene.add(s);}
 }
 const lines=new THREE.MeshStandardMaterial({color:'#d5c3a4',roughness:.85});
 for(let z=-24;z<22;z+=5.1){const q=new THREE.Mesh(new THREE.PlaneGeometry(.11,2.3),lines);q.rotation.x=-Math.PI/2;q.position.set(0,.012,z);scene.add(q);}
 // Pedestrian crossing: authored visual road markings, never substitute for collision/nav graph.
 for(let x=-4;x<=4;x+=.8){const m=new THREE.Mesh(new THREE.PlaneGeometry(.48,2.4),lines);m.rotation.x=-Math.PI/2;m.position.set(x,.016,6.8);scene.add(m);}
 // Original shop sign is a design element attached to the environment; existing meshes stay untouched.
 const signCanvas=texCanvas((g,w,h)=>{
  g.fillStyle='#172b32';g.fillRect(0,0,w,h);g.strokeStyle='#cba97c';g.lineWidth=17;g.strokeRect(18,18,w-36,h-36);
  g.fillStyle='#e2cba8';g.font='bold 67px Arial';g.textAlign='center';g.fillText('HOTEL 09',w/2,230);
  g.font='28px Arial';g.fillText('HABITACIONES · 24 HORAS',w/2,307);
 },512,384);signCanvas.wrapS=signCanvas.wrapT=THREE.ClampToEdgeWrapping;signCanvas.repeat.set(1,1);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.9,1.35),new THREE.MeshStandardMaterial({map:signCanvas,emissive:'#d99d58',emissiveMap:signCanvas,emissiveIntensity:.17,side:THREE.DoubleSide}));
 sign.position.set(-5.72,4.25,-7.1);sign.rotation.y=Math.PI/2;scene.add(sign);
 const light=(color,intensity,p,range)=>{const s=new THREE.PointLight(color,intensity,range,2);s.position.set(...p);scene.add(s)};
 scene.add(new THREE.HemisphereLight('#bfc9d1','#534e42',1.6));
 const moon=new THREE.DirectionalLight('#acc8d0',1.65);moon.position.set(-6,14,7);scene.add(moon);
 light('#ffad68',55,[-4.6,4.5,-7.7],13);light('#ffc98c',44,[4.7,4.6,7.8],14);
 light('#7caeb8',21,[7.3,3,-6],7);
 const glow=new THREE.MeshBasicMaterial({color:'#efb171',transparent:true,opacity:.15,depthWrite:false,blending:THREE.AdditiveBlending});
 for(const [x,z] of [[-4.7,-7.6],[4.6,7.3]]){const q=new THREE.Mesh(new THREE.CircleGeometry(2.1,36),glow);q.rotation.x=-Math.PI/2;q.position.set(x,.035,z);scene.add(q);}
 }
function status(s){$('status').textContent=s}
function showError(text){const el=$('fallback');el.hidden=false;el.textContent=text;}
function init(){
 const canvas=$('viewport');
 try{
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'default'});
  if(!gl)throw Error('WEBGL2_UNAVAILABLE');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(42,1,.08,130);
  camera.position.set(14,6,18);controls=new OrbitControls(camera,canvas);controls.enableDamping=true;
  controls.target.set(0,1.8,-3);controls.minDistance=2;controls.maxDistance=50;controls.maxPolarAngle=Math.PI*.49;
  buildWorld();state.webgl='WEBGL2_RUNNING';status('WEBGL2 · CARGANDO ASSETS');
  resize();window.addEventListener('resize',resize);loadAssets();loadPhoto();setMode(new URLSearchParams(location.search).get('mode')||'environment');
  const p=new URLSearchParams(location.search);if(p.has('frame')){state.frame=Math.max(0,Math.min(TOTAL-1,Number(p.get('frame'))||0));$('seek').value=state.frame;state.playing=false}
  animate();
 }catch(e){state.webgl='NOT_AVAILABLE';state.errors.push(String(e));status('WEBGL2 NO DISPONIBLE');showError('Este dispositivo no pudo iniciar WebGL2. La demo requiere render 3D real: no sustituimos la escena por un dibujo.');}
}
function resize(){if(!renderer)return;const el=$('stage');const w=Math.max(200,el.clientWidth),h=Math.max(210,el.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
async function loadPhoto(){
 try{
  const t=await new THREE.TextureLoader().loadAsync(PHOTO);
  t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.6,8);t.anisotropy=4;
  photoMaterial.map=t;photoMaterial.color.set('#b9b5ad');photoMaterial.needsUpdate=true;state.photo='PHOTO_CC0_LOADED';
 }catch(e){state.photo='PHOTO_UNAVAILABLE_PBR_FALLBACK';state.errors.push('POLYHAVEN_TEXTURE: '+e.message);}
 $('photo-state').textContent=state.photo==='PHOTO_CC0_LOADED'?'A: FOTO CC0':'A: PBR SIN FOTO';
}
async function loadAssets(){
 const loader=new GLTFLoader();let counter=0;const tasks=[...ITEMS];
 async function worker(){
  while(counter<tasks.length){
   const spec=tasks[counter++],url=SRC+'packs/'+spec.file+'.glb';
   try{
    const result=await loader.loadAsync(url);const item=result.scene;
    const b=new THREE.Box3().setFromObject(item),sz=new THREE.Vector3(),ct=new THREE.Vector3();b.getSize(sz);b.getCenter(ct);
    if(!Number.isFinite(sz.y)||sz.y<=.00001)throw Error('INVALID_BOUNDS');
    item.position.set(-ct.x,-b.min.y,-ct.z);
    const parent=new THREE.Group();parent.name='ASSET_'+spec.id;parent.position.set(spec.x,.095,spec.z);parent.rotation.y=spec.rotation||0;parent.scale.setScalar(spec.h/sz.y);parent.userData.source=url;
    item.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
    parent.add(item);scene.add(parent);models[spec.id]=parent;state.loaded++;
   }catch(e){state.failed++;state.errors.push(spec.id+': '+String(e).slice(0,130));}
   $('asset-count').textContent=state.loaded+'/'+ITEMS.length+' GLB reales';
  }
 }
 await Promise.all([worker(),worker(),worker()]);
 status(state.failed?('RECURSOS '+state.loaded+'/'+ITEMS.length+' · '+state.failed+' FALLAS'):('RECURSOS '+state.loaded+'/'+ITEMS.length+' · LISTOS'));
 window.__PROMETEO_READY__=true;
}
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function cameraAt(frame){
 const index=Math.max(0,Math.min(SHOTS.length-1,Math.floor(frame/SHOT))),s=SHOTS[index],u=smooth((frame-index*SHOT)/(SHOT-1));
 return {index,position:vec(s.p0).lerp(vec(s.p1),u),target:vec(s.a0).lerp(vec(s.a1),u),fov:s.fov};
}
function renderCamera(){
 const s=cameraAt(state.frame);state.shot=s.index;camera.position.copy(s.position);camera.lookAt(s.target);camera.fov=s.fov;camera.updateProjectionMatrix();
 $('shot-label').textContent=SHOTS[s.index].label;$('shot-name').textContent=SHOTS[s.index].name;
 $('shot-index').textContent=(s.index+1)+' / 09';$('seek').value=state.frame;
 $('timecode').textContent=(state.frame/FPS).toFixed(2)+' s';$('segment').style.width=((state.frame+1)/TOTAL*100)+'%';
}
function setMode(mode){
 if(!['materials','environment','cameras'].includes(mode))mode='environment';state.mode=mode;
 document.querySelectorAll('[data-mode]').forEach(b=>{const active=b.dataset.mode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
 const orbit=mode!=='cameras';controls.enabled=orbit;
 if(mode==='materials'){
  roadA.material=photoMaterial;roadB.material=paintedMaterial;
  camera.position.set(5.5,7.3,12.7);controls.target.set(0,.2,-2);controls.update();
  $('mode-caption').textContent='MISMA GEOMETRÍA · MISMA LUZ · IZQUIERDA FOTO / DERECHA ATLAS';
 }else{
  roadA.material=paintedMaterial;roadB.material=paintedMaterial;
  if(mode==='environment'){camera.position.set(13,5.8,17);controls.target.set(0,2,-3);controls.update();$('mode-caption').textContent='15 GLB CC0 REALES · ESQUINA CON IDENTIDAD';}
  else {$('mode-caption').textContent='9 PLANOS · CORTES EN FOTOGRAMAS EXACTOS';renderCamera();}
 }
 $('control-cameras').hidden=mode!=='cameras';$('material-explain').hidden=mode!=='materials';$('env-explain').hidden=mode!=='environment';
}
function animate(){
 requestAnimationFrame(animate);
 if(!renderer)return;
 const dt=Math.min(.08,clock.getDelta());
 if(state.mode==='cameras'){
  if(state.playing){state.frame=(state.frame+dt*FPS)%TOTAL;}
  renderCamera();
 }else{controls.update();}
 renderer.render(scene,camera);state.capturedFrames++;
}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
$('play').addEventListener('click',()=>{state.playing=!state.playing;$('play').textContent=state.playing?'Ⅱ PAUSA':'▶ REPRODUCIR'});
$('prev').addEventListener('click',()=>{state.playing=false;$('play').textContent='▶ REPRODUCIR';state.frame=(Math.max(0,Math.floor(state.frame/SHOT)-1))*SHOT;renderCamera()});
$('next').addEventListener('click',()=>{state.playing=false;$('play').textContent='▶ REPRODUCIR';state.frame=(Math.min(8,Math.floor(state.frame/SHOT)+1))*SHOT;renderCamera()});
$('seek').addEventListener('input',e=>{state.frame=Number(e.target.value);state.playing=false;$('play').textContent='▶ REPRODUCIR';renderCamera()});
$('reset-camera').addEventListener('click',()=>setMode(state.mode));
$('inspect').addEventListener('click',()=>{const info=report();$('debug').hidden=!$('debug').hidden;$('debug').textContent=JSON.stringify(info,null,2)});
init();
