import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Fuente CC0 verificada: https://tevy.dev/models/hiker
// Archivo versionado (no URL "latest"): v1 / 2026-10-26.
const MODEL_URL='https://tevy.dev/models/hiker/v1/lod0.glb';
const $=(id)=>document.getElementById(id);
const target=$('viewport'),status=$('loading'),contactLabel=$('contactLabel'),motionLabel=$('motionLabel'),angleLabel=$('angleLabel');
let renderer,scene,camera,orbit,mixer,walkAction,actor,model,clips,root,feet={left:null,right:null};
let stance={name:null,anchor:null},mode='idle',turn=null,walkSpeed=.75,routeDir=1,viewTween=null;
let lastT=performance.now(),clock=new THREE.Clock(),loaded=false;
const pointer=new THREE.Vector3(),priorCam=new THREE.Vector3();
const viewNames={front:'FRENTE',quarter:'TRES CUARTOS',side:'PERFIL',back:'ESPALDA'};

function setError(msg){
 $('errorText').textContent=msg;
 $('error').hidden=false;
 status.textContent='MODELO NO DISPONIBLE';
 $('poster').classList.remove('gone');
 if(renderer)renderer.domElement.style.opacity='0';
}
function init(){
 // WebGLRenderer evalúa compatibilidad real; no se usa un helper global inexistente.
 scene=new THREE.Scene();
 scene.fog=new THREE.Fog(0xeae5d9,10,24);
 camera=new THREE.PerspectiveCamera(35,1,.03,50);
 camera.position.set(2.7,2.15,4.0);
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
 renderer.setClearColor(0xeae5d9,0);
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.12;
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute('aria-label','Arrastrar para orbitar alrededor de la caminante');
 target.appendChild(renderer.domElement);
 orbit=new OrbitControls(camera,renderer.domElement);
 orbit.target.set(0,.9,0);
 orbit.enablePan=false;orbit.enableDamping=true;orbit.dampingFactor=.08;
 orbit.minDistance=2.4;orbit.maxDistance=7.5;
 orbit.maxPolarAngle=Math.PI/2.03;
 orbit.update();
 orbit.addEventListener('start',()=>{viewTween=null;angleLabel.textContent='LIBRE'});
 const ambient=new THREE.HemisphereLight(0xfef9e8,0xb1aea2,2.0);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xffe7c9,2.8);key.position.set(-2.9,5.2,4.4);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;
 key.shadow.normalBias=.02;key.shadow.bias=-.0005;scene.add(key);
 const rim=new THREE.DirectionalLight(0xd5e8e9,2.2);rim.position.set(3.6,3.3,-4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xe5dfd2,roughness:.94}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.022;floor.receiveShadow=true;scene.add(floor);
 const pathMat=new THREE.MeshBasicMaterial({color:0x7e897e,transparent:true,opacity:.27,side:THREE.DoubleSide});
 for(const x of [-.72,.72]){
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(.009,3.4),pathMat);
 strip.rotation.x=-Math.PI/2;strip.position.set(x,-.013,0);scene.add(strip);
 }
 for(const z of [-1.55,1.55]){
 const strip=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.008),pathMat);
 strip.rotation.x=-Math.PI/2;strip.position.set(0,-.012,z);scene.add(strip);
 }
 const stageCircle=new THREE.Mesh(new THREE.RingGeometry(1.84,1.847,96),new THREE.MeshBasicMaterial({color:0x756d5f,side:THREE.DoubleSide,transparent:true,opacity:.25}));
 stageCircle.rotation.x=-Math.PI/2;stageCircle.position.y=-.01;scene.add(stageCircle);
 root=new THREE.Group();scene.add(root);
 onResize();window.addEventListener('resize',onResize,{passive:true});
 renderer.domElement.style.opacity='1';
 animate();
}
function onResize(){
 if(!renderer)return;
 const w=target.clientWidth,h=target.clientHeight;
 if(w<1||h<1)return;
 renderer.setSize(w,h,false);camera.aspect=w/h;
 camera.fov=w<650?46:35;camera.updateProjectionMatrix();
}
function chooseFootBones(gltfScene){
 const bones=[];gltfScene.traverse((o)=>{if(o.isBone)bones.push(o)});
 // Primero tobillos/pies. Los dedos solos no son un pivote fiable.
 const possible=bones.filter(o=>/foot|ankle/i.test(o.name)&&!/toeend/i.test(o.name));
 const choose=(side)=>possible.find(o=>new RegExp(side,'i').test(o.name))||null;
 let l=choose('left'),r=choose('right');
 if(!l||!r){
 const tail=possible.slice(0,2);
 if(tail.length===2){tail.forEach(b=>b.updateWorldMatrix(true,false));const p1=tail[0].getWorldPosition(new THREE.Vector3());const p2=tail[1].getWorldPosition(new THREE.Vector3());l=p1.x<p2.x?tail[0]:tail[1];r=p1.x<p2.x?tail[1]:tail[0]}
 }
 return {left:l,right:r};
}
function play(name){
 if(!mixer||!clips)return;
 const selected=clips[name]||clips.idle||Object.values(clips)[0];
 if(!selected)return;
 const next=mixer.clipAction(selected);
 next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
 if(walkAction&&walkAction!==next)walkAction.crossFadeTo(next,.22,false);
 walkAction=next;
}
function selectMode(m){
 mode=m;
 const names={walk:'MARCHA',idle:'REPOSO',look:'OBSERVACIÓN',turn:'GIRO'};
 motionLabel.textContent=names[m]||'REPOSO';
 $('walkBtn').classList.toggle('selected',m==='walk');
 $('stopBtn').classList.toggle('selected',m==='idle');
 $('lookBtn').classList.toggle('selected',m==='look');
 $('turnBtn').classList.toggle('selected',m==='turn');
 for(const [btn,act] of [['walkBtn','walk'],['stopBtn','idle'],['lookBtn','look'],['turnBtn','turn']])$(btn).setAttribute('aria-pressed',String(m===act));
}
function startWalk(){
 if(!loaded)return;
 turn=null;routeDir=1;
 root.position.set(0,0,-.65);root.rotation.y=0;
 stance={name:null,anchor:null};
 selectMode('walk');play('walk');
}
function stop(){
 if(!loaded)return;
 turn=null;stance={name:null,anchor:null};selectMode('idle');play('idle');
 contactLabel.textContent='EN REPOSO';
}
function look(){
 if(!loaded)return;
 turn=null;stance={name:null,anchor:null};selectMode('look');play('look_around');
 contactLabel.textContent='EN REPOSO';
}
function startTurn(amount=Math.PI/2,auto=false){
 if(!loaded||turn)return;
 const desired=THREE.MathUtils.euclideanModulo(root.rotation.y+amount,Math.PI*2);
 const foot=stance.name&&feet[stance.name]?feet[stance.name]:feet.left||feet.right;
 const anchor=foot?foot.getWorldPosition(new THREE.Vector3()).clone():null;
 turn={from:root.rotation.y,to:root.rotation.y+amount,t:0,duration:amount===Math.PI?.85:.69,auto,foot,anchor};
 if(!auto){stance={name:null,anchor:null};selectMode('turn');play('walk')}
 contactLabel.textContent=foot?'APOYO FIJO':'GIRO CENTRAL';
}
function footPositions(){
 const found={};for(const k of ['left','right']){if(feet[k])found[k]=feet[k].getWorldPosition(new THREE.Vector3())}
 return found;
}
function correctContact(dt){
 if(mode!=='walk'||turn||!feet.left||!feet.right)return;
 root.updateMatrixWorld(true);
 const positions=footPositions();
 const active=positions.left.y<=positions.right.y?'left':'right';
 if(stance.name!==active){stance.name=active;stance.anchor=positions[active].clone()}
 else if(stance.anchor){
 const d=stance.anchor.clone().sub(positions[active]);d.y=0;
 // El anclaje usa un límite de salto para evitar teletransporte entre poses.
 d.clampLength(0,Math.max(.008,dt*.95));
 root.position.add(d);
 }
 contactLabel.textContent=active==='left'?'PIE IZQUIERDO':'PIE DERECHO';
}
function updateTurn(dt){
 if(!turn)return;
 const t=turn;t.t=Math.min(1,t.t+dt/t.duration);
 const eased=t.t*t.t*(3-2*t.t);
 root.rotation.y=t.from+(t.to-t.from)*eased;
 root.updateMatrixWorld(true);
 if(t.foot&&t.anchor){
 const current=t.foot.getWorldPosition(new THREE.Vector3());
 root.position.x+=t.anchor.x-current.x;
 root.position.z+=t.anchor.z-current.z;
 }
 if(t.t>=1){
 const isAuto=t.auto;turn=null;stance={name:null,anchor:null};
 if(isAuto){routeDir*=-1;selectMode('walk');play('walk')}
 else{selectMode('idle');play('idle');contactLabel.textContent='EN REPOSO'}
 }
}
function updateMotion(dt){
 if(!loaded)return;
 if(mixer)mixer.update(dt);
 if(turn){updateTurn(dt);return}
 if(mode==='walk'){
 root.position.z+=routeDir*walkSpeed*dt;
 if(Math.abs(root.position.z)>=.88){root.position.z=Math.sign(root.position.z)*.88;startTurn(Math.PI,true);return}
 correctContact(dt);
 }
}
function camPreset(which){
 if(!loaded)return;
 const base={front:[0,1.68,3.8],quarter:[2.5,1.95,3.5],side:[3.95,1.62,0],back:[0,1.68,-3.8]}[which]||[2.5,1.95,3.5];
 const a=root.rotation.y,cos=Math.cos(a),sin=Math.sin(a);
 const off=new THREE.Vector3(base[0]*cos+base[2]*sin,base[1],base[2]*cos-base[0]*sin);
 const dest=new THREE.Vector3(root.position.x,0,root.position.z).add(off);
 viewTween={from:camera.position.clone(),to:dest,t:0,target:orbit.target.clone()};
 angleLabel.textContent=viewNames[which]||'LIBRE';
 $('viewsPanel').hidden=true;$('viewsBtn').setAttribute('aria-expanded','false');
}
function animate(){
 requestAnimationFrame(animate);
 const now=performance.now(),dt=Math.min((now-lastT)/1000,.045);lastT=now;
 updateMotion(dt);
 const follow=new THREE.Vector3(root.position.x,.91,root.position.z);
 if(viewTween){
 const v=viewTween;v.t=Math.min(1,v.t+dt*2.5);const k=v.t*v.t*(3-2*v.t);
 camera.position.copy(v.from).lerp(v.to,k);
 orbit.target.copy(v.target).lerp(follow,k);
 if(v.t>=1)viewTween=null;
 }else{
 // Solo el seguimiento amortiguado; el usuario conserva el ángulo de su órbita.
 const shift=follow.sub(orbit.target).multiplyScalar(1-Math.exp(-dt*1.2));
 orbit.target.add(shift);camera.position.add(shift);
 }
 orbit.update();renderer.render(scene,camera);
}
async function loadModel(){
 const gltf=await new GLTFLoader().loadAsync(MODEL_URL);
 model=gltf.scene;
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false}});
 root.add(model);
 model.updateMatrixWorld(true);
 feet=chooseFootBones(model);
 mixer=new THREE.AnimationMixer(model);
 clips={};
 for(const clip of gltf.animations){const n=clip.name.toLowerCase();if(n.includes('walk'))clips.walk=clip;else if(n.includes('look'))clips.look_around=clip;else if(n.includes('idle'))clips.idle=clip}
 if(!clips.walk)throw Error('El modelo recibido no contiene clip de caminar');
 if(!clips.idle)clips.idle=clips.walk;
 loaded=true;
 play('idle');
 contactLabel.textContent=feet.left&&feet.right?'DISPONIBLE':'SIN HUESOS';
 $('poster').classList.add('gone');
 status.textContent='GLB · RIG Y TEXTURAS CARGADOS';
 $('error').hidden=true;
}
function wire(){
 for(const id of ['walkBtn','stopBtn','turnBtn','lookBtn'])$(id).disabled=true;
 $('walkBtn').onclick=startWalk;
 $('stopBtn').onclick=stop;
 $('turnBtn').onclick=()=>startTurn();
 $('lookBtn').onclick=look;
 $('viewsBtn').onclick=()=>{const e=$('viewsPanel');e.hidden=!e.hidden;$('viewsBtn').setAttribute('aria-expanded',String(!e.hidden))};
 $('viewsPanel').querySelectorAll('[data-view]').forEach(el=>el.onclick=()=>camPreset(el.dataset.view));
 $('retryBtn').onclick=()=>location.reload();
 document.addEventListener('keydown',(event)=>{if(event.key==='Escape'){$('viewsPanel').hidden=true;$('viewsBtn').setAttribute('aria-expanded','false')}});
}
wire();
try{
 init();
 await loadModel();
 for(const id of ['walkBtn','stopBtn','turnBtn','lookBtn'])$(id).disabled=false;
 // La cámara de producto distingue claramente rostro, chaqueta, botas y mochila.
 camPreset('quarter');
}catch(err){console.error('[CAMINANTE]',err);setError('El visor no pudo iniciar el WebGL o descargar el GLB. El recurso original sigue disponible.')}
