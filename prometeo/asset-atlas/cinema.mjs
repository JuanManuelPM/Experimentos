import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

// A film with real, author-made glTF meshes, not proxy boxes.
// Every file in CAST exists in the pinned private GitHub repository.
const $=id=>document.getElementById(id),DURATION=52;
const CAST=[
 {id:'sofa',file:'furniture-kit/loungesofa.glb',pos:[-2.1,0,-2.55],height:1.00,rot:0},
 {id:'secondsofa',file:'furniture-kit/loungedesignsofa.glb',pos:[-4.4,0,-.25],height:1.0,rot:Math.PI/2},
 {id:'tv',file:'furniture-kit/televisionvintage.glb',pos:[2.1,.66,-2.9],height:.70,rot:0},
 {id:'cabinet',file:'furniture-kit/sidetable.glb',pos:[2.1,0,-2.9],height:.70,rot:0},
 {id:'table',file:'furniture-kit/tablecoffee.glb',pos:[0,0,-.28],height:.56,rot:0},
 {id:'rug',file:'furniture-kit/rugrectangle.glb',pos:[-.05,0,-.08],height:.018,rot:0},
 {id:'lamp',file:'furniture-kit/lamproundfloor.glb',pos:[-4.08,0,-2.86],height:1.76,rot:0},
 {id:'tinyLamp',file:'furniture-kit/lamproundtable.glb',pos:[-.45,.55,-.25],height:.43,rot:0},
 {id:'bookshelf',file:'furniture-kit/bookcaseopen.glb',pos:[-4.4,0,-4.37],height:2.46,rot:0},
 {id:'books',file:'furniture-kit/books.glb',pos:[-4.4,.85,-4.11],height:.32,rot:0},
 {id:'plant',file:'furniture-kit/pottedplant.glb',pos:[4.15,0,-4],height:1.06,rot:0},
 {id:'smallplant',file:'furniture-kit/plantsmall1.glb',pos:[3.45,0,-.95],height:.56,rot:0},
 {id:'radio',file:'furniture-kit/radio.glb',pos:[.34,.55,-.30],height:.25,rot:-.22},
 {id:'antenna',file:'furniture-kit/televisionantenna.glb',pos:[2.1,1.30,-2.9],height:.24,rot:0},
 {id:'door',file:'furniture-kit/doorway.glb',pos:[4.60,0,-4.80],height:2.37,rot:0},
 {id:'window',file:'furniture-kit/wallwindow.glb',pos:[-.05,.65,-4.76],height:1.86,rot:0},
 {id:'catReal',file:'cat-attributed/cat.glb',pos:[-1.05,0,1.10],height:.65,rot:Math.PI*.7,actor:true},
 {id:'catOther',file:'cube-pets/animal-cat.glb',pos:[2.7,0,.68],height:.70,rot:-Math.PI*.6,actor:true},
 {id:'dogOther',file:'cube-pets/animal-dog.glb',pos:[3.65,0,2.5],height:.70,rot:Math.PI,actor:true},
 {id:'fox',file:'quaternius-animals/Fox.glb',pos:[4.7,0,3.2],height:.82,rot:-1.3,actor:true},
 {id:'shiba',file:'quaternius-animals/ShibaInu.glb',pos:[-4.2,0,3.2],height:.85,rot:1.2,actor:true},
 {id:'wolf',file:'quaternius-animals/Wolf.glb',pos:[-5.65,0,-6.5],height:1.25,rot:1,actor:true},
 {id:'oak1',file:'nature-kit/tree-oak.glb',pos:[-3.9,0,-9.6],height:4.8,rot:0},
 {id:'oak2',file:'nature-kit/tree-oak.glb',pos:[3.7,0,-10.2],height:5.4,rot:1.1},
 {id:'bush1',file:'nature-kit/plant-bushdetailed.glb',pos:[-.95,0,-7.8],height:.95,rot:0}
];
const shots=[
 {start:0,end:6,chapter:'CAPÍTULO 01 / LLEGADA',title:'LA CASA VACÍA',sub:'La casa parecía abandonada. Pero alguien había encendido las luces.',p0:[7,4.1,7.4],p1:[4.8,2.2,4.9],t0:[0,1.2,-2.2],t1:[0,1.2,-2]},
 {start:6,end:12,chapter:'CAPÍTULO 02 / EL TELEVISOR',title:'03:17',sub:'A esa hora, el televisor se encendía solo.',p0:[2.7,1.9,2.9],p1:[2.3,1.85,-.35],t0:[2,1,-2.8],t1:[2,1.06,-2.95]},
 {start:12,end:19,chapter:'CAPÍTULO 03 / EL GATO',title:'ALGUIEN ESCUCHA',sub:'El gato no miraba la televisión. Miraba detrás de ella.',p0:[-2.4,1.35,3.4],p1:[-.85,1.1,2.1],t0:[-1.05,.48,1],t1:[-.68,.46,.9]},
 {start:19,end:27,chapter:'CAPÍTULO 04 / LA VENTANA',title:'NO ESTAMOS SOLOS',sub:'Algo había cruzado el patio sin hacer ruido.',p0:[-4,1.6,3.9],p1:[-.95,1.95,3.3],t0:[1,.72,.8],t1:[3.3,.65,2.2]},
 {start:27,end:35,chapter:'CAPÍTULO 05 / PASOS',title:'INVITADOS',sub:'La puerta estaba abierta. Nadie recordaba haberla abierto.',p0:[5.7,2.4,3.2],p1:[4.6,2.15,-.9],t0:[4,1,-3.8],t1:[4.5,1.1,-4.9]},
 {start:35,end:44,chapter:'CAPÍTULO 06 / REVELACIÓN',title:'LA MISMA HABITACIÓN',sub:'En la radio sonaba exactamente lo que acabábamos de escuchar.',p0:[-1.8,3.6,4.1],p1:[1.7,3.1,3.0],t0:[0,1,-.6],t1:[0,1,-1.7]},
 {start:44,end:52,chapter:'CAPÍTULO 07 / REPETICIÓN',title:'VOLVÉ A EMPEZAR',sub:'La próxima vez, mirá lo que hace el gato.',p0:[1.2,1.5,-.5],p1:[7,4,8],t0:[2.2,1,-2.5],t1:[0,.9,-2.0]}
];
const state={webgl:'NOT_RUN',playing:false,explore:false,sound:false,time:0,loaded:0,failed:0,clips:0,rendered:0,files:[],errors:[],cameraShot:0};
let renderer=null,scene,camera,controls,clock=new THREE.Clock(),last=0,playback=0,actives=new Map(),soundContext=null,soundNodes=[];
const vec=a=>new THREE.Vector3(...a),ease=t=>t*t*(3-2*t),lerp=(a,b,t)=>a.clone().lerp(b,t);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0});
function room(){
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(15.5,14),mat(0x7b6b54));
 floor.rotation.x=-Math.PI/2;floor.position.set(0,-.03,-2);scene.add(floor);
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(15.5,14),mat(0x555344));
 strip.rotation.x=-Math.PI/2;strip.position.set(0,-.02,-2);scene.add(strip);
 const lines=new THREE.Group();const wood=mat(0x907758);
 for(let i=-8;i<10;i++){
  const s=new THREE.Mesh(new THREE.PlaneGeometry(.025,13),wood);
  s.rotation.x=-Math.PI/2;s.position.set(i*.85,.005,-2);lines.add(s)
 }scene.add(lines);
 const wallpaper=mat(0x394940);
 const wall=new THREE.Mesh(new THREE.PlaneGeometry(14.8,6.1),wallpaper);
 wall.position.set(0,3,-4.89);scene.add(wall);
 const left=new THREE.Mesh(new THREE.PlaneGeometry(12,6.1),mat(0x465348));
 left.rotation.y=Math.PI/2;left.position.set(-6.5,3,-1);scene.add(left);
 const ceilingTrim=mat(0x987e62);
 for(const y of [.3,2.25,5.6]){
  const s=new THREE.Mesh(new THREE.BoxGeometry(14.8,.08,.13),ceilingTrim);s.position.set(0,y,-4.81);scene.add(s);
 }
 const curtain=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),new THREE.MeshStandardMaterial({color:0x22352e,transparent:true,opacity:.30,roughness:1}));
 curtain.position.set(0,2.08,-4.77);scene.add(curtain);
 const red=mat(0x542d2c);
 const paving=new THREE.Mesh(new THREE.PlaneGeometry(15,12),red);paving.rotation.x=-Math.PI/2;paving.position.set(0,-.04,-9);scene.add(paving);
}
function lighting(){
 const hemi=new THREE.HemisphereLight(0xffe4c2,0x384939,2.0);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xc7ba9c,2.0);sun.position.set(2,7,5);scene.add(sun);
 const cool=new THREE.PointLight(0x4a9bb6,15,6,2);cool.position.set(2.1,1.7,-2.5);scene.add(cool);state.tvLight=cool;
 const warm=new THREE.PointLight(0xffb374,16,7,2);warm.position.set(-3.9,2,-2.5);scene.add(warm);
 const under=new THREE.PointLight(0xe6da96,4,7,2);under.position.set(1.5,1.7,1);scene.add(under);
 const moon=new THREE.DirectionalLight(0x7daab4,1.6);moon.position.set(0,3,-9);scene.add(moon);
 scene.fog=new THREE.FogExp2(0x1b2928,.028);
}
async function loadModel(c){
 const path=c.file.startsWith('quaternius-animals/')?
  'https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/0128ca510d653bb04d6d1e4885bd8890b5050b4f/public/glb/animals_pack/'+c.file.split('/')[1]:
  c.file.startsWith('cat-attributed/')?
  'https://raw.githubusercontent.com/druboni/find-the-cat/0ee6eb153807ebff3c50cdff5778830b74e36b5a/assets/characters/cat.glb':
  'https://raw.githubusercontent.com/Hidencod/tge-assets/3ddcc695adbba9fb918cf31b7c139b3f95b76910/packs/'+c.file;
 try{
  const gltf=await new GLTFLoader().loadAsync(path);
  const root=new THREE.Group();root.name='ASSET_'+c.id;
  const mesh=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(mesh),size=new THREE.Vector3(),center=new THREE.Vector3();
  bounds.getSize(size);bounds.getCenter(center);
  if(size.y<0.00001||!Number.isFinite(size.y))throw Error('INVALID_BOUNDS '+c.id);
  mesh.position.set(-center.x,-bounds.min.y,-center.z);
  root.add(mesh);root.scale.setScalar(c.height/size.y);
  root.position.set(...c.pos);root.rotation.y=c.rot||0;
  root.userData.asset={id:c.id,file:c.file,source:'authored CC0 / attributed cat',animations:gltf.animations.length,sourceGeometry:true};
  mesh.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(m?.map)m.map.colorSpace=THREE.SRGBColorSpace;}}});
  scene.add(root);
  const entry={root,initial:vec(c.pos),rot:c.rot||0,mixer:null,clips:gltf.animations,id:c.id};
  if(gltf.animations.length){
   entry.mixer=new THREE.AnimationMixer(mesh);const prefer=gltf.animations.find(x=>/idle|walk|run/i.test(x.name))||gltf.animations[0];
   entry.mixer.clipAction(prefer).play();state.clips+=gltf.animations.length;
  }
  actives.set(c.id,entry);state.loaded++;state.files.push({id:c.id,file:c.file,clips:gltf.animations.length,status:'PASS'});
  $('load-state').textContent='RECURSOS REALES '+state.loaded+'/'+CAST.length;
 }catch(e){
  state.failed++;state.errors.push(c.id+': '+e.message);state.files.push({id:c.id,file:c.file,status:'FAIL',error:String(e)});
  $('load-state').textContent='CARGADOS '+state.loaded+' · ERRORES '+state.failed;
 }
}
function updateActors(t){
 // Camera and locations are evaluated at absolute t (scrubbable and deterministic).
 for(const [id,v] of actives){v.root.position.copy(v.initial);v.root.rotation.y=v.rot;
  if(v.mixer)v.mixer.setTime(t);
 }
 const c=actives.get('catReal');
 if(c){const u=clamp((t-11)/27,0,1);c.root.position.x+=u*1.55;c.root.position.z+=.2*Math.sin(t*.65);c.root.rotation.y=c.rot+.32*Math.sin(t*.5);}
 const cat=actives.get('catOther');if(cat){cat.root.position.z+=.13*Math.cos(t*.35);cat.root.rotation.y=cat.rot+.12*Math.sin(t*.22)}
 const fox=actives.get('fox');if(fox){const u=ease(clamp((t-16)/23,0,1));fox.root.position.x-=u*5.5;fox.root.position.z-=u*1.4;fox.root.rotation.y=-1.3+.24*Math.sin(t*.25);}
 const shiba=actives.get('shiba');if(shiba){const u=ease(clamp((t-22)/14,0,1));shiba.root.position.x+=u*3.0;shiba.root.position.z-=u*.65;shiba.root.rotation.y=1.2+.15*Math.sin(t*.35);}
 const wolf=actives.get('wolf');if(wolf){wolf.root.position.x+=.28*Math.sin(t*.4);wolf.root.rotation.y=1+.1*Math.cos(t*.3)}
 state.tvLight.intensity=t<5?3:(14+9*Math.max(0,Math.sin(t*3.1)));
}
function shotAt(t){const at=shots.findIndex(s=>t<s.end);const idx=at<0?shots.length-1:at;return {s:shots[idx],idx}}
function updateCamera(t){
 const {s,idx}=shotAt(t);
 if(!state.explore){
  const u=ease(clamp((t-s.start)/(s.end-s.start),0,1));
  camera.position.copy(lerp(vec(s.p0),vec(s.p1),u));
  camera.lookAt(lerp(vec(s.t0),vec(s.t1),u));
 }
 if(state.cameraShot!==idx||!$('title').textContent){
  state.cameraShot=idx;$('chapter').textContent=s.chapter;
  $('title').textContent=s.title;$('subtitle').textContent=s.sub;
 }
}
function timeText(t){return '00:'+String(Math.floor(t)).padStart(2,'0')}
function setTime(t){
 state.time=clamp(t,0,DURATION);$('seek').value=String(state.time);$('time').textContent=timeText(state.time)+' / 00:52';
 updateActors(state.time);updateCamera(state.time);
}
function pause(){
 state.playing=false;$('play').textContent='▶ REPRODUCIR';$('play').setAttribute('aria-pressed','false');
}
function play(){
 if(state.webgl!=='RENDERED')return;
 if(state.time>=DURATION) setTime(0);
 if(state.explore)toggleExplore(false);
 state.playing=true;$('play').textContent='Ⅱ PAUSAR';$('play').setAttribute('aria-pressed','true');
}
function toggleExplore(force){
 const enable=typeof force==='boolean'?force:!state.explore;
 state.explore=enable;pause();controls.enabled=enable;
 $('explore').setAttribute('aria-pressed',String(enable));$('explore').textContent=enable?'VOLVER A FILM':'EXPLORAR';
 if(enable){controls.target.set(0,1.2,-1);camera.position.set(7,4,7);controls.update()}
 else updateCamera(state.time);
}
function audio(){
 if(!state.sound){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  soundContext=new AC();soundContext.resume();
  const g=soundContext.createGain();g.gain.value=.032;g.connect(soundContext.destination);
  for(const f of [53,59.4,79.7]){const osc=soundContext.createOscillator();osc.type=f===53?'sine':'triangle';osc.frequency.value=f;osc.connect(g);osc.start();soundNodes.push(osc)}
  state.sound=true;
 }else{
  for(const o of soundNodes){try{o.stop();o.disconnect()}catch{}}
  soundNodes=[];soundContext?.close();soundContext=null;state.sound=false;
 }
 $('audio').textContent=state.sound?'SONIDO ON':'SONIDO OFF';
 $('audio').setAttribute('aria-pressed',String(state.sound));
}
function initialize(){
 try{
  const canvas=$('canvas'),gl=canvas.getContext('webgl2',{alpha:false,antialias:false,powerPreference:'default'});
  if(!gl)throw Error('WEBGL2_UNAVAILABLE');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:false});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.38;
  scene=new THREE.Scene();scene.background=new THREE.Color(0x20322c);
  camera=new THREE.PerspectiveCamera(56,1,.03,150);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.enabled=false;controls.minDistance=1.3;controls.maxDistance=24;controls.maxPolarAngle=Math.PI*.48;
  lighting();room();updateCamera(0);state.webgl='CREATED';
  window.addEventListener('resize',resize);resize();
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();state.webgl='CONTEXT_LOST';pause();$('load-state').textContent='SE PERDIÓ EL CONTEXTO WEBGL';$('loading').classList.remove('hide')});
 }catch(e){state.webgl='UNAVAILABLE';state.errors.push(e.message);$('load-state').textContent='WEBGL2 NO DISPONIBLE. ABRÍ LA BIBLIOTECA O PROBÁ EN CHROME.';$('diag').textContent='SIN WEBGL';}
}
function resize(){
 if(!renderer)return;
 const el=$('screen'),w=Math.max(240,el.clientWidth),h=Math.max(240,el.clientHeight);
 let f=Math.min(devicePixelRatio||1,1.4);renderer.setPixelRatio(f);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
async function start(){
 initialize();
 if(state.webgl==='UNAVAILABLE')return;
 await Promise.all(CAST.map(loadModel));
 setTime(0);
 $('loading').classList.add('hide');
 const minimum=state.loaded>=18;
 $('diag').textContent=state.loaded+' / '+CAST.length+' GLB · '+state.clips+' CLIPS · '+(state.failed?'VER LOG':'LISTO');
 if(!minimum){$('diag').textContent='ESCENA INCOMPLETA · '+state.loaded+'/'+CAST.length;state.errors.push('MINIMUM_SCENE_CONTENT_NOT_MET')}
}
$('play').addEventListener('click',()=>state.playing?pause():play());
$('explore').addEventListener('click',()=>toggleExplore());
$('audio').addEventListener('click',audio);
$('seek').addEventListener('input',()=>{pause();setTime(+$('seek').value)});
$('fullscreen').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else $('screen').requestFullscreen?.()});
document.addEventListener('keydown',e=>{
 if(e.code==='Space'){e.preventDefault();state.playing?pause():play()}
 if(e.key==='e')toggleExplore();
 if(e.key==='d'){const a=document.createElement('a'),blob=new Blob([JSON.stringify(window.__ATLAS_CINEMA__(),null,2)],{type:'application/json'});a.href=URL.createObjectURL(blob);a.download='atlas-cinema-diagnostic.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
});
function render(now){
 requestAnimationFrame(render);const dt=Math.min(.05,clock.getDelta());
 if(state.webgl==='UNAVAILABLE'||!renderer)return;
 if(state.playing){setTime(state.time+dt);if(state.time>=DURATION)pause()}
 if(state.explore)controls.update();
 renderer.render(scene,camera);state.rendered++;
 if(state.rendered===1){state.webgl='RENDERED';$('notice').textContent='MODELOS GLB REALES · '+state.loaded+' RECURSOS · '+state.clips+' ANIMACIONES'}
}
window.__ATLAS_CINEMA__=()=>({webgl:state.webgl,loaded:state.loaded,failed:state.failed,clips:state.clips,renderedFrames:state.rendered,seconds:state.time,shots:shots.length,sourceAssets:state.files,errors:state.errors,artApproval:'NOT_RUN'});
start();requestAnimationFrame(render);
