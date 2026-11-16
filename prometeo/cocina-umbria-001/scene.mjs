import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
// PROMETEO · Primer piloto V3 · escena 3D REAL. NO hay personaje sustituto geométrico.
// Los archivos GLB se cargan de repos públicos anclados y se rechaza T-pose sin clips.
const THREE_VERSION='0.181.0';
const KENNEY_COMMIT='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const SOLDIER_COMMIT='ab6386854db0dcebd9800b95a9a5effde6071b19';
const KENNEY='https://raw.githubusercontent.com/Hidencod/tge-assets/'+KENNEY_COMMIT+'/packs/furniture-kit/';
const KENNEY_BACKUP='https://cdn.jsdelivr.net/gh/Hidencod/tge-assets@'+KENNEY_COMMIT+'/packs/furniture-kit/';
const SOLDIER='https://raw.githubusercontent.com/mrdoob/three.js/'+SOLDIER_COMMIT+'/examples/models/gltf/Soldier.glb';
const SOLDIER_BACKUP='https://cdn.jsdelivr.net/gh/mrdoob/three.js@'+SOLDIER_COMMIT+'/examples/models/gltf/Soldier.glb';
const $=id=>document.getElementById(id);
const canvas=$('c'),status=$('state'),hint=$('hint');
const alternate=new URLSearchParams(location.search).get('look')==='b';
const telemetry={schema:'prometeo.cocina-umbria-001/qa-v1',version:'20261116.1',webgl:'NOT_RUN',drawn:0,source:{kenney:KENNEY_COMMIT,actor:SOLDIER_COMMIT},assets:{},actor:{state:'PENDING',clips:[],skeletonBones:0,meshes:0,hasIdle:false,hasWalk:false,animationState:'NONE'},motion:{phase:'NOT_STARTED',position:null,heading:null,forwardDotAssumingLocalPlusZ:null,footSlip:'NOT_MEASURED'},errors:[],look:alternate?'B':'A'};
window.__PROMETEO_QA__=()=>JSON.parse(JSON.stringify(telemetry));
let renderer,scene,camera,controls,clock=new THREE.Clock(),actor,actorRoot,mixer,idleAction,walkAction,activeAction,loopStart=performance.now(),lastPhase='',treeGroup,skyM,raindrops=[];
const mats={wall:new THREE.MeshStandardMaterial({color:'#4c6055',roughness:1}),trim:new THREE.MeshStandardMaterial({color:'#293c34',roughness:.93}),wood:new THREE.MeshStandardMaterial({color:'#493b32',roughness:.82}),frame:new THREE.MeshStandardMaterial({color:'#2b3530',roughness:.75}),metal:new THREE.MeshStandardMaterial({color:'#7a857b',metalness:.54,roughness:.42}),black:new THREE.MeshBasicMaterial({color:'#091213'}),glass:new THREE.MeshPhysicalMaterial({color:'#7ca69b',transparent:true,opacity:.18,roughness:.18,metalness:.15,depthWrite:false,side:THREE.DoubleSide})};
function qaError(msg){telemetry.errors.push(String(msg)); console.warn('[PROMETEO]',msg)}
function fail(msg){qaError(msg);$('err-text').textContent=msg+' · Comprobá la conexión y la compatibilidad WebGL del dispositivo.';$('error').hidden=false;status.textContent='Error de carga · ver detalles';}
function assetStatus(name,ok,error){telemetry.assets[name]=ok?'LOADED':'FAILED';if(error)qaError(name+': '+String(error).slice(0,150));}
function mesh(w,h,d,material,x,y,z,parent=scene){const a=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a}
function tex(draw,size=512){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d');draw(g,size);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t}
function floorTex(){const t=tex((g,s)=>{g.fillStyle='#5e6156';g.fillRect(0,0,s,s);let rand=17;const rr=()=>{rand=(rand*1664525+1013904223)>>>0;return rand/4294967296};for(let y=0;y<8;y++)for(let x=0;x<8;x++){let v=Math.floor(rr()*16-8),c=100+v;g.fillStyle='rgb('+Math.floor(c*.83)+','+c+','+Math.floor(c*.91)+')';g.fillRect(x*64+2,y*64+2,60,60);g.strokeStyle='rgba(20,26,21,.22)';for(let i=0;i<3;i++){let xx=x*64+rr()*58,yy=y*64+rr()*58;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+rr()*15,yy+rr()*14);g.stroke()}}g.fillStyle='#2a362d';for(let i=0;i<180;i++)g.fillRect(rr()*s,rr()*s,rr()*5,rr()*2)});t.repeat.set(1.9,1.8);return t}
function backsplashTex(){const t=tex((g,s)=>{g.fillStyle='#929784';g.fillRect(0,0,s,s);let rand=13;const rr=()=>{rand=(rand*1103515245+12345)>>>0;return rand/4294967296};for(let y=0;y<6;y++)for(let x=0;x<8;x++){const v=Math.round(rr()*26);g.fillStyle='rgb('+(128+v)+','+(135+v)+','+(118+v)+')';g.fillRect(x*64+2,y*85+2,60,81);g.fillStyle='rgba(17,28,23,.07)';g.fillRect(x*64+3,y*85+78,59,3)} });t.repeat.set(1.5,.55);return t}
function world(){
 scene.background=new THREE.Color('#0c1619');scene.fog=new THREE.FogExp2('#15231f',.019);
 const floorMat=new THREE.MeshStandardMaterial({map:floorTex(),roughness:.92,metalness:.04});
 const floor=mesh(8.7,.13,8.55,floorMat,0,-.11,0);floor.castShadow=false;
 // Arquitectura deliberada con hueco real de ventana, no mural plano que simule una cocina.
 mesh(3.21,3.5,.19,mats.wall,-2.75,1.75,-4.08);mesh(2.56,3.5,.19,mats.wall,3.04,1.75,-4.08);
 mesh(2.93,1.19,.19,mats.wall,.25,.595,-4.08);mesh(2.93,.67,.19,mats.wall,.25,3.165,-4.08);
 mesh(.18,3.54,8.5,mats.wall,-4.36,1.77,.01);
 mesh(.18,3.54,8.5,mats.wall,4.36,1.77,.01);
 // Molduras, zócalos, parches del revoque y azulejos intencionales.
 mesh(8.5,.13,.19,mats.trim,0,.07,-3.94);
 for(const side of [-1,1])mesh(.13,.17,8.5,mats.trim,side*4.26,.10,.01);
 const tile=new THREE.MeshStandardMaterial({map:backsplashTex(),roughness:.85});
 mesh(5.62,.62,.028,tile,-1.46,1.30,-3.95);
 mesh(2.9,.16,.14,mats.frame,.25,1.25,-3.91);
 mesh(2.9,.16,.14,mats.frame,.25,2.76,-3.91);
 mesh(.16,1.62,.14,mats.frame,-1.19,2.00,-3.91);
 mesh(.16,1.62,.14,mats.frame,1.70,2.00,-3.91);
 mesh(.072,1.42,.12,mats.frame,.255,2.00,-3.87);
 mesh(2.73,.065,.12,mats.frame,.255,2.01,-3.86);
 mesh(2.9,.10,.38,mats.wood,.25,1.18,-3.75);
 for(const side of [-1,1])mesh(.12,.12,8.4,mats.wood,side*4.18,3.42,0);
 mesh(8.5,.12,.12,mats.wood,0,3.43,-3.94);
 // Fondo exterior pintado de forma original como matte del cielo, nunca sustituto del mobiliario 3D.
 skyM=new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uAlt:{value:alternate?1:0}},side:THREE.DoubleSide,depthWrite:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float uTime;uniform float uAlt;void main(){float h=clamp(vUv.y,0.,1.);vec3 top=mix(vec3(.17,.09,.28),vec3(.12,.08,.29),uAlt);vec3 mid=mix(vec3(.67,.21,.26),vec3(.50,.14,.45),uAlt);vec3 low=vec3(.07,.13,.16);vec3 c=mix(mid,top,smoothstep(.24,.94,h));c=mix(low,c,smoothstep(.02,.35,h));float haze=.08*sin(vUv.x*14.+uTime*.1)*sin(vUv.y*8.);c+=haze*vec3(.4,.07,.15);gl_FragColor=vec4(c,1.);}'}); const sky=new THREE.Mesh(new THREE.PlaneGeometry(22,11),skyM);sky.position.set(0,2.6,-8.9);scene.add(sky);
 const branches=new THREE.Group();branches.position.set(-1.95,-.3,-6.15);scene.add(branches);treeGroup=branches;
 function twig(x1,y1,x2,y2,depth,r){const a=new THREE.Vector3(x1,y1,0),b=new THREE.Vector3(x2,y2,0);const d=new THREE.Vector3().subVectors(b,a);const cyl=new THREE.Mesh(new THREE.CylinderGeometry(Math.max(.007,r*.59),r,d.length(),5),mats.black);cyl.position.copy(a).add(b).multiplyScalar(.5);cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());branches.add(cyl);if(depth<1)return;let dx=x2-x1,dy=y2-y1;for(const sg of [-1,1]){const ang=sg*(.39+.16*(depth%3)),len=.67-(5-depth)*.07;twig(x2,y2,x2+(dx*Math.cos(ang)-dy*Math.sin(ang))*len,y2+(dx*Math.sin(ang)+dy*Math.cos(ang))*len,depth-1,r*.64)}}
 twig(-.4,-.2,.0,2.3,5,.18);twig(.0,2.2,1.2,3.4,3,.08);
 // Vidrio real y lluvia como partículas 3D delante del cielo.
 mesh(2.65,1.39,.015,mats.glass,.25,2.00,-4.03).castShadow=false;
 const rng=(()=>{let x=918273;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}})();
 const rainMat=new THREE.LineBasicMaterial({color:'#b7a6c9',transparent:true,opacity:.39,depthWrite:false});
 for(let i=0;i<96;i++){const g=new THREE.BufferGeometry();const x=-1.5+rng()*4.0,y=.4+rng()*3.9,z=-4.25-rng()*1.5;g.setAttribute('position',new THREE.Float32BufferAttribute([x,y,z,x-.035,y-.19,z],3));const obj=new THREE.Line(g,rainMat);scene.add(obj);raindrops.push({obj,speed:1.3+rng()*.9,originalY:y});}
 scene.add(new THREE.HemisphereLight('#779486','#29241d',1.15));
 const cold=new THREE.DirectionalLight('#a69ac1',.92);cold.position.set(-3.1,5,2);scene.add(cold);
 const sick=new THREE.PointLight(alternate?'#8ac4ad':'#78c7a0',alternate?26:35,9,1.9);sick.position.set(-2.0,2.65,-1.4);sick.castShadow=true;sick.shadow.mapSize.set(1024,1024);sick.shadow.bias=-.0003;scene.add(sick);
 const outside=new THREE.PointLight('#b13f61',24,9,2);outside.position.set(.45,2.6,-5.5);scene.add(outside);
 const lamp=new THREE.PointLight('#f5b477',16,5,2);lamp.position.set(2.4,2.5,.25);scene.add(lamp);
 const glow=new THREE.MeshBasicMaterial({color:'#b4f5c9',transparent:true,opacity:.85});
 mesh(2.2,.055,.08,glow,-2.55,2.76,-3.64).castShadow=false;
 // Aire y escala: el mobiliario se importa como GLB CC0 auténtico en loadProps().
}
const PROPS=[
 ['kitchencabinet',-3.20,0,-3.41,.91,0],['kitchenstove',-2.31,0,-3.41,.91,0],
 ['kitchencabinetdrawer',-1.43,0,-3.41,.91,0],['kitchensink',-.55,0,-3.41,.91,0],
 ['kitchencabinet',.35,0,-3.41,.91,0],['kitchencabinetupper',-3.2,1.65,-3.52,.73,0],
 ['kitchencabinetupperdouble',-2.07,1.65,-3.52,.73,0],['kitchencabinetupperdouble',-.83,1.65,-3.52,.73,0],
 ['kitchenfridge',3.28,0,-3.35,1.84,0],['kitchenmicrowave',-1.37,.93,-3.35,.34,0],
 ['kitchencoffeemachine',.38,.91,-3.29,.31,0],['toaster',-3.12,.91,-3.30,.23,0],
 ['table',2.76,0,.82,.74,.10],['chair',2.89,0,1.67,.85,.12],['chair',3.66,0,.21,.85,-1.4],
 ['lampsquareceiling',2.46,2.62,.32,.37,0],['radio',-3.78,.92,-1.84,.32,Math.PI/2]
];
const loader=new GLTFLoader();
function loadURL(url){return new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject))}
async function loadFrom(primary,backup){try{return await loadURL(primary)}catch(e){qaError('PRIMARY_LOAD '+String(e).slice(0,100));return loadURL(backup)}}
function placeModel(g,name,x,y,z,height,rot){
 const m=g.scene; m.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(m);const sz=new THREE.Vector3();box.getSize(sz);
 if(!isFinite(sz.y)||sz.y<.00001)throw Error('BAD_BOUNDS '+name);
 m.scale.multiplyScalar(height/sz.y);m.updateMatrixWorld(true);box.setFromObject(m);
 m.position.y-=box.min.y;m.position.x-=(box.min.x+box.max.x)*.5;m.position.z-=(box.min.z+box.max.z)*.5;
 const root=new THREE.Group();root.position.set(x,y,z);root.rotation.y=rot;root.name='KENNEY_CC0_'+name;root.add(m);
 m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true; if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(mat=>{if(mat.isMeshStandardMaterial){mat.roughness=Math.max(.72,mat.roughness);mat.metalness=Math.min(.3,mat.metalness)}})}}});
 scene.add(root);assetStatus(name,true);
}
async function loadProps(){
 const unique=[...new Set(PROPS.map(p=>p[0]))];
 const downloaded=await Promise.all(unique.map(async n=>{try{return [n,await loadFrom(KENNEY+n+'.glb',KENNEY_BACKUP+n+'.glb')]}catch(e){assetStatus(n,false,e);return [n,null]}}));
 const map=new Map(downloaded);for(const [n,x,y,z,h,r] of PROPS){const gl=map.get(n);if(!gl)continue;try{placeModel(gl.clone?gl.clone():{scene:gl.scene.clone(true)},n,x,y,z,h,r)}catch(e){assetStatus(n,false,e)}}
 status.textContent='Cocina cargada · esperando al personaje…';
}
function action(name){if(!mixer)return;const next=name==='WALK'?walkAction:idleAction;if(activeAction===next)return;if(activeAction)activeAction.fadeOut(.27);next.reset().fadeIn(.27).play();activeAction=next}
async function loadActor(){
 const gl=await loadFrom(SOLDIER,SOLDIER_BACKUP);
 telemetry.actor.clips=(gl.animations||[]).map(a=>({name:a.name,duration:+a.duration.toFixed(2),tracks:a.tracks.length}));
 const idle=gl.animations.find(a=>/^idle$/i.test(a.name)),walk=gl.animations.find(a=>/^walk$/i.test(a.name));
 telemetry.actor.hasIdle=!!idle;telemetry.actor.hasWalk=!!walk;
 let bones=0,meshes=0;gl.scene.traverse(o=>{if(o.isBone)bones++;if(o.isMesh||o.isSkinnedMesh){meshes++;o.castShadow=true;o.receiveShadow=true}});
 telemetry.actor.skeletonBones=bones;telemetry.actor.meshes=meshes;
 if(!idle||!walk||bones===0||meshes===0){telemetry.actor.state='BLOCKED_ANIMATION';throw Error('ACTOR_REJECTED: archivo GLB sin Idle, Walk, skeleton o mesh. Nunca se muestra T-pose como animada.');}
 actorRoot=new THREE.Group();actorRoot.name='ACTOR_ANIMATED_SOLDIER';scene.add(actorRoot);
 actor=gl.scene;actor.updateMatrixWorld(true);let b=new THREE.Box3().setFromObject(actor),sz=new THREE.Vector3();b.getSize(sz);if(sz.y<.1)throw Error('ACTOR_BAD_BOUNDS');
 actor.scale.multiplyScalar(1.73/sz.y);actor.updateMatrixWorld(true);b.setFromObject(actor);actor.position.y-=b.min.y;
 actor.position.x-=(b.min.x+b.max.x)*.5;actor.position.z-=(b.min.z+b.max.z)*.5;
 actor.traverse(o=>{if(o.isMesh&&o.material){let a=Array.isArray(o.material)?o.material:[o.material];a.forEach(mat=>{if(mat.isMeshStandardMaterial){mat.roughness=.91;mat.metalness=.08;}})}});
 actorRoot.add(actor);mixer=new THREE.AnimationMixer(actor);idleAction=mixer.clipAction(idle);walkAction=mixer.clipAction(walk);action('IDLE');
 telemetry.actor.state='RUNTIME_CLIPS_VERIFIED';telemetry.actor.animationState='IDLE';status.textContent='Escena 3D · NPC animado · girá con un dedo';
}
function pose(t){
 if(!actorRoot)return;
 const p=actorRoot.position,r=actorRoot.rotation;let phase,walking=false,dirX=0,dirZ=-1;
 if(t<1.2){phase='IDLE_START';p.set(.65,0,2.25);r.y=Math.PI}
 else if(t<6.4){let a=(t-1.2)/5.2;phase='WALK_FORWARD';walking=true;p.set(.65,0,2.25-3.43*a);r.y=Math.PI}
 else if(t<7.7){let a=(t-6.4)/1.3;phase='TURN_90';walking=true;p.set(.65-.12*a,0,-1.18);r.y=Math.PI+(Math.PI/2)*a;dirX=-Math.sin(Math.PI*a/2);dirZ=-Math.cos(Math.PI*a/2)}
 else if(t<9.8){let a=(t-7.7)/2.1;phase='WALK_LEFT';walking=true;p.set(.53-1.28*a,0,-1.18);r.y=1.5*Math.PI;dirX=-1;dirZ=0}
 else {phase='IDLE_WINDOW';p.set(-.75,0,-1.18);r.y=1.5*Math.PI;}
 action(walking?'WALK':'IDLE');
 if(phase!==lastPhase){lastPhase=phase;telemetry.actor.animationState=walking?'WALK':'IDLE'}
 telemetry.motion.phase=phase;telemetry.motion.position=[+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)];telemetry.motion.heading=+r.y.toFixed(3);
 if(walking&&phase!=='TURN_90'){const dot=Math.sin(r.y)*dirX+Math.cos(r.y)*dirZ;telemetry.motion.forwardDotAssumingLocalPlusZ=+dot.toFixed(3)}else telemetry.motion.forwardDotAssumingLocalPlusZ=null;
}
function resize(){if(!renderer)return;const w=Math.max(1,window.innerWidth),h=Math.max(1,window.innerHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function recenter(){if(!controls)return;controls.target.set(0,1.55,-1.42);camera.position.set(5.35,2.72,6.65);controls.update()}
function animate(){
 requestAnimationFrame(animate);if(!renderer)return;
 const dt=Math.min(clock.getDelta(),.05),t=((performance.now()-loopStart)/1000)%14;
 if(mixer)mixer.update(dt);pose(t);
 if(treeGroup)treeGroup.rotation.z=Math.sin(t*1.55)*.014;
 if(skyM)skyM.uniforms.uTime.value=t;
 for(const d of raindrops){const a=d.obj.geometry.attributes.position;let y=a.array[1]-dt*d.speed;if(y<.25)y+=4.25;a.array[1]=y;a.array[4]=y-.19a.needsUpdate=true}
 controls.update();renderer.render(scene,camera);telemetry.drawn++;
}
async function init(){
 try{
  const gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});
  if(!gl)throw Error('WebGL2 no está disponible');
  renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,powerPreference:'high-performance'});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(50,1,.06,100);
  controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=2.2;controls.maxDistance=16;controls.minPolarAngle=.25;controls.maxPolarAngle=Math.PI*.59;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  recenter();world();resize();window.addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',resize);
  $('reset').onclick=recenter;
  $('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(e){qaError('FULLSCREEN_UNAVAILABLE '+String(e))}};
  canvas.addEventListener('pointerdown',()=>hint.style.opacity='0',{once:true});
  telemetry.webgl='WEBGL2_INITIALIZED';animate();
  await Promise.allSettled([loadProps(),loadActor().catch(e=>{telemetry.actor.state='BLOCKED_ANIMATION';fail('No se pudo validar un NPC animado: '+String(e))})]);
  if(telemetry.actor.state==='RUNTIME_CLIPS_VERIFIED')status.textContent='Microescena 3D · NPC en movimiento';
 }catch(e){telemetry.webgl='FAILED';fail(String(e))}
}
init();