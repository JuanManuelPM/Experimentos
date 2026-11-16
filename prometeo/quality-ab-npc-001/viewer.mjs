import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const $ = id => document.getElementById(id);
const ACTOR='https://raw.githubusercontent.com/trebeljahr/quaternius-showcase/0128ca510d653bb04d6d1e4885bd8890b5050b4f/public/glb/modular_men/Casual.glb';
const ACTOR_BACKUP='https://cdn.jsdelivr.net/gh/trebeljahr/quaternius-showcase@0128ca510d653bb04d6d1e4885bd8890b5050b4f/public/glb/modular_men/Casual.glb';
const KENNEY='https://raw.githubusercontent.com/Hidencod/tge-assets/3ddcc695adbba9fb918cf31b7c139b3f95b76910/packs/';
const ASSETS=[
 {id:'fachada-a',name:'city-kit-commercial/building-i',x:-9.6,z:-4.8,h:8.7,rot:Math.PI/2},
 {id:'fachada-b',name:'city-kit-commercial/building-f',x:9.2,z:-4.2,h:8.3,rot:-Math.PI/2},
 {id:'farol',name:'city-kit-roads/light-curved',x:-4.2,z:-5.7,h:4.7,rot:Math.PI/2},
 {id:'senial',name:'city-kit-roads/road-sign-stop',x:4.4,z:3.2,h:2.6,rot:0}
];
const DURATION=14, clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
const state={webgl:'NOT_RUN',actor:'PENDING',props:{},clips:[],rigBones:0,meshes:0,issues:[],artApproval:'PENDING',t:0,playing:false,mode:'general',forwardCorrection:0,rootTravelMetres:0,rootHeadingVelocityDot:null,footDrift:'NOT_MEASURED',clipCompatibility:'NOT_RUN',renderedFrames:0};
window.__Q3D001_QA=()=>JSON.parse(JSON.stringify(state));
let renderer,scene,camera,controls,clock=new THREE.Clock(),mixer,pivot,rig,actions={},target=new THREE.Vector3(),ready=false;
function status(s){$('candidate-status').textContent=s;$('qa').textContent='QA · '+state.webgl+' · actor '+state.actor+' · clip '+state.clipCompatibility+' · modelos '+Object.keys(state.props).length+'/4 · frames '+state.renderedFrames+' · foot drift '+state.footDrift;}
function fail(message){state.issues.push(message);state.actor=state.actor==='PENDING'?'FAILED':state.actor;status(message);$('fallback-text').textContent=message+'. No sustituimos el render por una ilustración.';$('fallback').hidden=false;}
function mesh(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;scene.add(o);return o}
function buildWorld(){
 scene.background=new THREE.Color('#1b2a35');scene.fog=new THREE.FogExp2('#31434d',.024);
 scene.add(new THREE.HemisphereLight('#adc5d2','#3b302b',2.0));
 const sun=new THREE.DirectionalLight('#cbd6d2',2.25);sun.position.set(-6,12,8);scene.add(sun);
 const amber=new THREE.PointLight('#ffbf83',32,12,2);amber.position.set(-4,4.5,-5.5);scene.add(amber);
 const cool=new THREE.PointLight('#81c4cd',13,9,2);cool.position.set(6,3,-2);scene.add(cool);
 const ground=new THREE.MeshStandardMaterial({color:'#3c4b4b',roughness:1});
 const walk=new THREE.MeshStandardMaterial({color:'#8c9388',roughness:.93});
 const asphalt=new THREE.MeshStandardMaterial({color:'#303c41',roughness:.93});
 const line=new THREE.MeshStandardMaterial({color:'#c8bc9f',roughness:.9});
 const g=mesh(new THREE.PlaneGeometry(45,45),ground,0,-.04,0);g.rotation.x=-Math.PI/2;
 const road=mesh(new THREE.PlaneGeometry(8,28),asphalt,0,.012,-2);road.rotation.x=-Math.PI/2;
 for(const x of [-6.45,6.45]){const s=mesh(new THREE.PlaneGeometry(4.7,28),walk,x,.04,-2);s.rotation.x=-Math.PI/2;}
 for(let z=-13;z<12;z+=4.6){const m=mesh(new THREE.PlaneGeometry(.14,2.1),line,0,.02,z);m.rotation.x=-Math.PI/2}
 // El terreno y las marcas admiten primitivas. Las fachadas y el NPC final NO.
}
function resize(){if(!renderer)return;const w=$('stage').clientWidth,h=$('stage').clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
async function loadModel(url,backup){const l=new GLTFLoader();try{return await l.loadAsync(url)}catch(e){if(!backup)throw e;state.issues.push('CDN_PRIMARY_FAILED: '+String(e).slice(0,100));return await l.loadAsync(backup)}}
function normalize(g,h){const b=new THREE.Box3().setFromObject(g),s=new THREE.Vector3(),c=new THREE.Vector3();b.getSize(s);b.getCenter(c);if(!(s.y>.0001))throw Error('INVALID_ASSET_BOUNDS');const factor=h/s.y;g.scale.setScalar(factor);g.position.set(-c.x*factor,-b.min.y*factor,-c.z*factor);return s;}
async function loadActor(){
 const data=await loadModel(ACTOR,ACTOR_BACKUP);rig=data.scene;rig.name='QUATERNIUS_CC0_CASUAL_SOURCE';normalize(rig,1.78);
 pivot=new THREE.Group();pivot.name='PEDESTRIAN_ROOT';pivot.add(rig);scene.add(pivot);
 rig.traverse(o=>{if(o.isSkinnedMesh||o.isMesh){state.meshes++;o.castShadow=true;o.receiveShadow=true;}if(o.isBone)state.rigBones++});
 state.clips=data.animations.map(c=>c.name);
 const find=(regex)=>data.animations.find(c=>regex.test(c.name));
 const idle=find(/(^|[|:._ ])idle[_ ]?neutral$/i)||find(/(^|[|:._ ])idle$/i);
 const walk=find(/(^|[|:._ ])walk$/i);
 const gesture=find(/(^|[|:._ ])wave$/i)||find(/(^|[|:._ ])interact$/i);
 if(!idle||!walk)throw Error('ACTOR_REJECTED: el GLB no incluye Idle y Walk compatible; prohibido sintetizar brazos con primitivas');
 mixer=new THREE.AnimationMixer(rig);
 for(const [n,clip] of [['idle',idle],['walk',walk],['gesture',gesture]])if(clip){actions[n]=mixer.clipAction(clip);actions[n].setLoop(THREE.LoopRepeat,Infinity);actions[n].play();}
 state.actor='LOADED_REAL_GLB';state.clipCompatibility=gesture?'IDLE_WALK_GESTURE_PRESENT':'IDLE_WALK_ONLY_GESTURE_MISSING';ready=true;setPose(state.t);setCamera(state.mode);status('GLB y clips cargados');
}
async function loadProps(){
 let i=0;const queue=ASSETS.slice();
 async function worker(){while(i<queue.length){const a=queue[i++];try{
  const g=await loadModel(KENNEY+a.name+'.glb');const object=g.scene;normalize(object,a.h);
  const parent=new THREE.Group();parent.name='KENNEY_CC0_'+a.id;parent.position.set(a.x,0,a.z);parent.rotation.y=a.rot;parent.add(object);scene.add(parent);state.props[a.id]='LOADED';
 }catch(e){state.props[a.id]='FAILED';state.issues.push('PROP_'+a.id+': '+String(e).slice(0,95));}status('Actualización de GLB')}}await Promise.all([worker(),worker()]);}
function trajectory(t){
 if(t<=2)return{x:-5,z:3,yaw:Math.PI,d:0,v:new THREE.Vector3(0,0,0)};
 if(t<=7)return{x:-5,z:3-4*(t-2)/5,yaw:Math.PI,d:4*(t-2)/5,v:new THREE.Vector3(0,0,-.8)};
 if(t<=8.4){const theta=ease((t-7)/1.4)*Math.PI/2, r=.33;return{x:-5+r*(1-Math.cos(theta)),z:-1-r*Math.sin(theta),yaw:Math.PI-theta,d:4+r*theta,v:new THREE.Vector3(Math.sin(theta),0,-Math.cos(theta))};}
 return{x:-4.67,z:-1.33,yaw:Math.PI/2,d:4+.33*Math.PI/2,v:new THREE.Vector3(0,0,0)};
}
function setPose(seconds){
 state.t=clamp(seconds,0,DURATION);const t=state.t;
 if(!ready)return;
 const p=trajectory(t);pivot.position.set(p.x,.045,p.z);pivot.rotation.y=p.yaw+state.forwardCorrection;state.rootTravelMetres=p.d;
 const localFront=new THREE.Vector3(0,0,1).applyAxisAngle(new THREE.Vector3(0,1,0),p.yaw);
 state.rootHeadingVelocityDot=p.v.lengthSq()?Number(localFront.dot(p.v.clone().normalize()).toFixed(4)):null;
 const walkWeight=t>=2&&t<7?1:t>=7&&t<8.4?.58:0;
 const gestureWeight=t>=10&&t<12&&actions.gesture?1:0;
 const weights={idle:Math.max(0,1-walkWeight-gestureWeight),walk:walkWeight,gesture:gestureWeight};
 for(const [n,a] of Object.entries(actions)){
  a.enabled=true;a.setEffectiveWeight(weights[n]||0);
  a.time=((t-(n==='walk'?2:n==='gesture'?10:0))%a.getClip().duration+a.getClip().duration)%a.getClip().duration;
 }
 mixer.update(0);
 if(state.mode!=='orbit')setCamera(state.mode);
 $('seek').value=t.toFixed(2);$('timecode').textContent=t.toFixed(1)+' / 14.0';$('progress').style.width=(t/DURATION*100)+'%';
}
function setCamera(mode){
 state.mode=mode;document.querySelectorAll('[data-camera]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.camera===mode)));
 if(!camera||!pivot)return;const pos=pivot.position;
 if(mode==='orbit'){controls.enabled=true;controls.target.set(pos.x,1.08,pos.z);controls.update();return;}
 controls.enabled=false;
 if(mode==='general'){camera.position.set(1.9,3.75,7.2);target.set(-4.35,1.3,-1.45);camera.fov=43;}
 if(mode==='side'){camera.position.set(-.35,2.3,pos.z+.7);target.set(pos.x,1.05,pos.z);camera.fov=38;}
 if(mode==='face'){camera.position.set(pos.x+1.2,1.75,pos.z-2.15);target.set(pos.x,1.43,pos.z);camera.fov=31;}
 camera.lookAt(target);camera.updateProjectionMatrix();
}
function animate(){
 requestAnimationFrame(animate);if(!renderer)return;const dt=Math.min(.06,clock.getDelta());if(state.playing&&ready){if(state.t+dt>=DURATION){state.playing=false;$('play').textContent='▶ PLAY';setPose(DURATION)}else setPose(state.t+dt);}
 if(state.mode==='orbit')controls.update();renderer.render(scene,camera);state.renderedFrames++;if(state.renderedFrames%120===1)status('WebGL');}
async function init(){
 try{
 const canvas=$('canvas'),gl=canvas.getContext('webgl2',{antialias:true,alpha:false});
 if(!gl)throw Error('WEBGL2_UNAVAILABLE');renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.23;scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(43,1,.07,140);camera.position.set(2,3,9);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=.6;controls.maxDistance=22;controls.maxPolarAngle=Math.PI*.52;controls.target.set(-5,1,0);
 buildWorld();state.webgl='WEBGL2_INITIALIZED';resize();addEventListener('resize',resize);animate();
 const result=await Promise.allSettled([loadActor(),loadProps()]);
 if(result[0].status==='rejected')fail('NO_ACTOR_GLB_OR_CLIPS: '+result[0].reason);
 if(result[1].status==='rejected')state.issues.push('PROP_LOAD: '+String(result[1].reason));
 }catch(e){state.webgl='BLOCKED_RENDER';fail(String(e));}
}
document.querySelectorAll('[data-layout-target]').forEach(b=>b.addEventListener('click',()=>{
 document.body.dataset.layout=b.dataset.layoutTarget;document.querySelectorAll('[data-layout-target]').forEach(c=>c.setAttribute('aria-pressed',String(c===b)));
 if(b.dataset.layoutTarget!=='after'&&!$('oldframe').src)$('loadbefore').click();
 setTimeout(resize,60);
}));
$('loadbefore').addEventListener('click',()=>{$('oldframe').src='../psx-after-hours/?frame=9';$('oldcover').hidden=true;});
$('play').addEventListener('click',()=>{if(!ready)return;state.playing=!state.playing;if(state.playing&&state.t>=DURATION)setPose(0);$('play').textContent=state.playing?'Ⅱ PAUSA':'▶ PLAY';});
$('seek').addEventListener('input',e=>{state.playing=false;$('play').textContent='▶ PLAY';setPose(Number(e.target.value));});
document.querySelectorAll('[data-camera]').forEach(b=>b.addEventListener('click',()=>setCamera(b.dataset.camera)));
$('flip').addEventListener('click',()=>{state.forwardCorrection=state.forwardCorrection?0:Math.PI;setPose(state.t);state.issues.push('USER_AXIS_CORRECTION: '+state.forwardCorrection.toFixed(3)+' rad; requires visual confirmation');});
init();
