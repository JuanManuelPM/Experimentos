import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const $=id=>document.getElementById(id);
const SRC='0128ca510d653bb04d6d1e4885bd8890b5050b4f';
const ACTOR='https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/'+SRC+'/public/glb/modular_men/Casual.glb';
const BACKUP='https://cdn.jsdelivr.net/gh/trebeljahr/quaternius-showcase@'+SRC+'/public/glb/modular_men/Casual.glb';
const KENNEY='https://raw.githubusercontent.com/Hidencod/tge-assets/3ddcc695adbba9fb918cf31b7c139b3f95b76910/packs/';
const PROPS=[
  {id:'A',file:'city-kit-commercial/building-i.glb',x:-9.6,z:-6,h:8.7,rot:Math.PI/2},
  {id:'B',file:'city-kit-commercial/building-f.glb',x:9.6,z:-5.3,h:8.3,rot:-Math.PI/2},
  {id:'L',file:'city-kit-roads/light-curved.glb',x:-5.5,z:-3,h:4.8,rot:Math.PI/2},
  {id:'S',file:'city-kit-roads/road-sign-stop.glb',x:5.6,z:2,h:2.3,rot:0}
];
const qa={schema:'prometeo.q3d001.fullscreen/v2',webgl:'NOT_RUN',actor:'PENDING',modelSource:ACTOR,meshes:0,skinMeshes:0,bones:0,clips:[],animationStatus:'NOT_CHECKED',props:{},renderedFrames:0,failures:[],viewMode:'ORBIT_TOUCH',artistApproval:'PENDING'};
window.__Q3D001_QA=()=>JSON.parse(JSON.stringify(qa));
const canvas=$('view3d'),stage=$('stage');let renderer,scene,camera,controls,hero=null,clock=new THREE.Clock(),mixer=null;
const focal=new THREE.Vector3(-2,1.08,1),initialOffset=new THREE.Vector3(3,1.6,4);
function status(msg,kind='ok'){$('status').textContent=msg;$('status').dataset.state=kind;$('diagnostics').textContent='WebGL: '+qa.webgl+' · mallas: '+qa.meshes+' · huesos: '+qa.bones+' · clips: '+qa.clips.length+' · props: '+Object.values(qa.props).filter(x=>x==='OK').length+'/'+PROPS.length+' · frames: '+qa.renderedFrames;}
function fail(msg){qa.failures.push(msg);status(msg,'error');}
function normalize(g,height){const box=new THREE.Box3().setFromObject(g),sz=new THREE.Vector3();box.getSize(sz);if(!(sz.y>0.00001))throw Error('GLB sin altura válida');const k=height/sz.y;g.scale.multiplyScalar(k);g.position.set(-((box.min.x+box.max.x)/2)*k,-box.min.y*k,-((box.min.z+box.max.z)/2)*k);}
function plane(w,h,m,x,y,z){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);}
function world(){
 scene.background=new THREE.Color('#859d9e');scene.fog=new THREE.Fog('#859d9e',26,72);
 scene.add(new THREE.HemisphereLight('#f6fbff','#4c4b41',2.4));
 const sun=new THREE.DirectionalLight('#fff0d5',3.2);sun.position.set(-8,15,6);scene.add(sun);
 const fill=new THREE.DirectionalLight('#b8d6e9',1.25);fill.position.set(6,6,-6);scene.add(fill);
 const concrete=new THREE.MeshStandardMaterial({color:'#9b9e94',roughness:1});
 const asphalt=new THREE.MeshStandardMaterial({color:'#445258',roughness:1});
 const paint=new THREE.MeshStandardMaterial({color:'#e5d9ba',roughness:.9});
 plane(90,90,concrete,0,-.04,-2);plane(8.8,65,asphalt,0,0,-2);
 plane(4.6,65,concrete,-6.7,.055,-2);plane(4.6,65,concrete,6.7,.055,-2);
 for(let z=-28;z<26;z+=4.8)plane(.14,2,paint,0,.012,z);
}
function resetView(){if(!controls)return;const t=hero?hero.position.clone().add(new THREE.Vector3(0,1.08,0)):focal.clone();controls.target.copy(t);camera.position.copy(t).add(initialOffset);camera.lookAt(t);controls.update();}
function resize(){if(!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
async function getGLB(url,backup){const l=new GLTFLoader();try{return await l.loadAsync(url)}catch(e){if(!backup)throw e;qa.failures.push('FALLBACK_CDN: '+String(e).slice(0,100));return await l.loadAsync(backup);}}
async function loadHero(){
 try{
  const r=await getGLB(ACTOR,BACKUP),g=r.scene;normalize(g,1.78);
  hero=new THREE.Group();hero.name='NPC_CASUAL_REAL_GLB';hero.position.set(-2,.03,1);hero.add(g);scene.add(hero);
  g.traverse(o=>{if(o.isMesh)qa.meshes++;if(o.isSkinnedMesh)qa.skinMeshes++;if(o.isBone)qa.bones++;});
  qa.clips=(r.animations||[]).map(x=>x.name);qa.actor='LOADED_REAL_GLB';
  const idle=(r.animations||[]).find(x=>/(^|[^a-z])idle([^a-z]|$)/i.test(x.name||''));
  if(idle){mixer=new THREE.AnimationMixer(g);mixer.clipAction(idle).play();qa.animationStatus='EMBEDDED_IDLE';}
  else qa.animationStatus=qa.clips.length?'CLIPS_PRESENT_NO_IDLE':'NO_EMBEDDED_CLIPS_STATIC';
  resetView();status(qa.clips.length?'Personaje 3D cargado · clips por revisar':'Personaje 3D cargado · movimiento pendiente');
 }catch(e){qa.actor='FAILED';fail('Personaje no cargado: '+String(e).slice(0,145));}
}
async function loadProps(){for(const a of PROPS){try{const r=await getGLB(KENNEY+a.file);normalize(r.scene,a.h);const p=new THREE.Group();p.name='KENNEY_'+a.id;p.position.set(a.x,0,a.z);p.rotation.y=a.rot;p.add(r.scene);scene.add(p);qa.props[a.id]='OK';}catch(e){qa.props[a.id]='FAILED';qa.failures.push('PROP_'+a.id+': '+String(e).slice(0,100));}}}
function loop(){requestAnimationFrame(loop);if(!renderer)return;const dt=Math.min(clock.getDelta(),.05);if(mixer)mixer.update(dt);controls.update();renderer.render(scene,camera);qa.renderedFrames++;}
function ui(){
 $('reset').addEventListener('click',resetView);
 $('toggle-info').addEventListener('click',()=>{$('drawer').hidden=!$('drawer').hidden;});
 $('close-info').addEventListener('click',()=>{$('drawer').hidden=true;});
 $('toggle-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else status('La vista ya ocupa toda la página disponible','warn');}catch(e){status('El navegador mantiene sus barras; la escena ocupa toda la página','warn');}});
 canvas.addEventListener('pointerdown',()=>{$('tip').style.opacity='0';},{once:true});
 setTimeout(()=>{$('tip').style.opacity='0';},7000);
}
async function init(){
 ui();
 try{
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  if(!gl)throw Error('WebGL2 no disponible');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.23;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(47,1,.08,140);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.09;
  controls.enablePan=true;controls.enableZoom=true;controls.enableRotate=true;
  controls.minDistance=.75;controls.maxDistance=28;
  controls.minPolarAngle=.17;controls.maxPolarAngle=Math.PI*.62;
  controls.rotateSpeed=.85;controls.zoomSpeed=.95;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  resetView();world();resize();
  window.addEventListener('resize',resize);
  if(window.ResizeObserver)new ResizeObserver(resize).observe(stage);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',resize);
  qa.webgl='WEBGL2_INITIALIZED';loop();
  await loadHero();loadProps();
 }catch(e){qa.webgl='FAILED';fail('No se pudo iniciar la escena: '+String(e).slice(0,140));}
}
init();
