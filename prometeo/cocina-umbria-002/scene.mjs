import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {validateShotlist,sampleFrame,semanticAnchors,safeSubject} from './forja/vendor/semantic-director.mjs';

// Cocina Umbria 002 · isolated candidate. Real CC0 GLBs only. No proxy actor or fake grip.
const $=id=>document.getElementById(id);
const KENNEY_COMMIT='3ddcc695adbba9fb918cf31b7c139b3f95b76910';
const PUBLIC_COMMIT='01e585a57e19c56443c63eaea69bd498236b703b';
const KENNEY='https://raw.githubusercontent.com/Hidencod/tge-assets/'+KENNEY_COMMIT+'/packs/furniture-kit/';
const CIVIL='https://raw.githubusercontent.com/JuanManuelPM/Experimentos/'+PUBLIC_COMMIT+'/prometeo/3d-npc-civilian-v1/dist/civil_azul.glb';
const gltf=new GLTFLoader(),clock=new THREE.Clock(),raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const telemetry={schema:'prometeo.cocina-umbria-002/live-qa/1',flowVersionUsed:'1.1.0',
 flowSha256:'ca3b18c0fd745676a8100950549ec6c6b81271fb2552f83dc5c3358b72cd1b16',
 webgl:'NOT_RUN',frames:0,sourceIntegrity:{},loadedAssets:{},chairProfiles:[],actorOrientation:{status:'NOT_RUN'},
 actor:{loaded:false,clips:[],idle:null,walk:null,interaction:null,bones:0},motion:{samples:[],footSlipSamples:[],frontDotMin:null},
 roof:{physical:false,cutaway:false},collisions:[],shots:{},errors:[],artApproval:'NOT_REVIEWED'};
window.__UMBRIA_QA__=()=>JSON.parse(JSON.stringify(telemetry));
let scene,renderer,camera,controls,config,shotlist,rootActor,mixer,animIdle,animWalk,animInteract,activeAction,actor,front=null;
let roof,film=true,playing=false,t=0,prev=0,lastFrame=performance.now(),selected=null,propModels=[],roomModels=[],lastFeet=null;
const mat={
 wall:new THREE.MeshStandardMaterial({color:0x4a5b50,roughness:1,side:THREE.DoubleSide}),
 ceiling:new THREE.MeshStandardMaterial({color:0x393f37,roughness:.96,side:THREE.DoubleSide}),
 trim:new THREE.MeshStandardMaterial({color:0x232e28,roughness:.82}),
 wood:new THREE.MeshStandardMaterial({color:0x493c30,roughness:.83}),
 metal:new THREE.MeshStandardMaterial({color:0x777d70,roughness:.55,metalness:.3}),
 black:new THREE.MeshBasicMaterial({color:0x0a1216}),
 glass:new THREE.MeshPhysicalMaterial({color:0x8aa0ae,transparent:true,opacity:.19,roughness:.08,side:THREE.DoubleSide,depthWrite:false})
};
const addBox=(id,w,h,d,x,y,z,m,parent=scene)=>{
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
 mesh.name=id;mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
 roomModels.push(mesh);return mesh;
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const vec=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
const formatTime=s=>('0'+Math.floor(s/60)).slice(-2)+':'+('0'+Math.floor(s%60)).slice(-2);
const log=(m)=>{telemetry.errors.push(String(m));console.warn('[UMBRIA 002]',m);};
const status=m=>{$('status').textContent=m;};
function fatal(e){log(e);$('error').hidden=false;$('error-text').textContent=String(e);status('NO VERIFICADO · error de carga');}
function roofVisibility(){if(roof)roof.visible=film;telemetry.roof.cutaway=!film;$('mode').textContent=film?'MODO CINE':'MODO EDICIÓN';}
function architecture(){
 scene.background=new THREE.Color('#0d171c');
 scene.fog=new THREE.FogExp2('#101b1d',.016);
 addBox('Suelo estructural',8.75,.2,8.55,0,-.13,0,new THREE.MeshStandardMaterial({color:0x535d55,roughness:1}));
 // Four genuine closing walls, with physical window and door voids.
 addBox('Norte izquierda',3.17,3.55,.19,-2.79,1.775,-4.1,mat.wall);
 addBox('Norte derecha',2.6,3.55,.19,3.06,1.775,-4.1,mat.wall);
 addBox('Norte bajo ventana',2.94,1.25,.19,.27,.625,-4.1,mat.wall);
 addBox('Norte sobre ventana',2.94,.72,.19,.27,3.19,-4.1,mat.wall);
 addBox('Oeste',.2,3.55,8.54,-4.36,1.775,0,mat.wall);
 addBox('Este',.2,3.55,8.54,4.36,1.775,0,mat.wall);
 addBox('Sur izquierda',1.06,3.55,.2,-3.82,1.775,4.18,mat.wall);
 addBox('Sur derecha',6.49,3.55,.2,1.11,1.775,4.18,mat.wall);
 addBox('Sur dintel',1.32,.69,.2,-2.64,3.2,4.18,mat.wall);
 addBox('Puerta hoja física',1.12,2.7,.08,-2.63,1.35,4.04,mat.wood);
 addBox('Puerta marco sup',1.35,.12,.27,-2.64,2.77,4.01,mat.trim);
 addBox('Ventana vidrio',2.73,1.53,.03,.27,2.02,-4.04,mat.glass).castShadow=false;
 for(let i=0;i<3;i++)addBox('Marco ventana '+i,i===0?.09:2.8,i===0?1.48:.10,.14,
 i===0?.27:.27,i===0?2.02:1.25+i*.7,-3.93,mat.trim);
 addBox('Antepecho ventana',3,.15,.35,.27,1.20,-3.86,mat.wood);
 addBox('Zócalo norte',8.5,.13,.13,0,.08,-3.93,mat.trim);
 for(const sign of [-1,1])addBox('Zócalo lateral',.12,.15,8.3,sign*4.2,.075,0,mat.trim);
 roof=addBox('TECHO FÍSICO',8.76,.24,8.58,0,3.67,0,mat.ceiling);
 telemetry.roof.physical=true;roofVisibility();
 // Outside matte only visible through real openings; not an architectural substitute.
 const night=new THREE.Mesh(new THREE.PlaneGeometry(14,8),new THREE.MeshBasicMaterial({color:0x26394b,side:THREE.DoubleSide}));
 night.position.set(.3,2.3,-7);scene.add(night);
 const ambient=new THREE.HemisphereLight(0x778d98,0x302a22,1.38);scene.add(ambient);
 const moon=new THREE.DirectionalLight(0x9ba8c0,.7);moon.position.set(0,4,2);scene.add(moon);
 const warm=new THREE.PointLight(0xe8ad76,26,7,1.8);warm.position.set(2,2.84,.1);scene.add(warm);
 const cold=new THREE.PointLight(0x65bc9d,24,7,1.9);cold.position.set(-2,2.7,-1);scene.add(cold);
 const outside=new THREE.PointLight(0xac5383,5,8,2);outside.position.set(.3,2.4,-5.6);scene.add(outside);
}
async function download(url,sha){
 const res=await fetch(url,{mode:'cors',cache:'force-cache'});
 if(!res.ok)throw Error('GLB HTTP '+res.status+': '+url);
 const bytes=await res.arrayBuffer(),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))
 .map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==sha)throw Error('ASSET_HASH_MISMATCH: '+url+' actual='+hash+' expected='+sha);
 telemetry.sourceIntegrity[url]={sha256:hash,bytes:bytes.byteLength,status:'PASS'};
 return gltf.parseAsync(bytes,'');
}
const cache=new Map();
function loadAsset(name,sha,isActor=false){
 const url=isActor?CIVIL:KENNEY+name+'.glb';
 if(!cache.has(url))cache.set(url,download(url,sha).catch(e=>{cache.delete(url);throw e}));
 return cache.get(url);
}
function geometryCenter(g){
 g.updateMatrixWorld(true);return new THREE.Box3().setFromObject(g);
}
function normalizeModel(model,height){
 const b=geometryCenter(model),sz=b.getSize(new THREE.Vector3());
 if(sz.y<.01||!Number.isFinite(sz.y))throw Error('BAD_GLB_BOUNDS');
 model.scale.multiplyScalar(height/sz.y);
 const b2=geometryCenter(model);
 model.position.sub(new THREE.Vector3((b2.min.x+b2.max.x)/2,b2.min.y,(b2.min.z+b2.max.z)/2));
 model.updateMatrixWorld(true);
}
function sampleVertices(model,cap=2200){
 const points=[],bb=geometryCenter(model);
 model.traverse(o=>{if(!(o.isMesh||o.isSkinnedMesh)||!o.geometry?.attributes?.position)return;
  const arr=o.geometry.attributes.position;const step=Math.max(1,Math.ceil(arr.count/cap));
  for(let i=0;i<arr.count;i+=step)points.push(new THREE.Vector3().fromBufferAttribute(arr,i).applyMatrix4(o.matrixWorld));
 });
 return{points,bounds:bb};
}
// Chair functional direction, derived from upper backrest vertices relative to seat center, not a guessed yaw.
function measureChair(model){
 const {points,bounds}=sampleVertices(model);const min=bounds.min,max=bounds.max,h=max.y-min.y;
 const high=points.filter(v=>v.y>min.y+.76*h);
 const center=bounds.getCenter(new THREE.Vector3());const back=new THREE.Vector3();
 if(high.length<4)return{status:'UNRESOLVED',reason:'NO_BACKREST_POINTS'};
 for(const v of high)back.add(v);back.divideScalar(high.length);
 const direction=new THREE.Vector3(center.x-back.x,0,center.z-back.z),distance=direction.length();
 if(distance<Math.max(max.x-min.x,max.z-min.z)*.05)return{status:'UNRESOLVED',reason:'BACKREST_SYMMETRY'};
 direction.normalize();
 return{status:'GEOMETRY_INFERRED_NOT_VISUALLY_CERTIFIED',local:[direction.x,0,direction.z],backrest:[back.x,back.y,back.z],sampleCount:high.length,confidenceDistance:+distance.toFixed(4)};
}
function facingYaw(dx,dz,frontLocal){
 if(!frontLocal||Math.hypot(dx,dz)<.0001)throw Error('FRONT_OR_VELOCITY_MISSING');
 return Math.atan2(dx,dz)-Math.atan2(frontLocal[0],frontLocal[2]);
}
function worldForward(yaw,local){
 const v=new THREE.Vector3(local[0],0,local[2]).applyAxisAngle(new THREE.Vector3(0,1,0),yaw);return v.normalize();
}
function placeProp(def,g){
 const model=g.scene.clone(true);normalizeModel(model,def.h);
 const group=new THREE.Group();group.name=def.id;group.position.set(...def.p);group.userData.asset=def.asset;
 group.add(model);scene.add(group);
 if(def.asset==='chair'){
  const profile=measureChair(model),tar=vec(config.tableCenter);const dx=tar.x-def.p[0],dz=tar.z-def.p[2];
  if(profile.local){group.rotation.y=facingYaw(dx,dz,profile.local);
   const dot=worldForward(group.rotation.y,profile.local).dot(new THREE.Vector3(dx,0,dz).normalize());
   profile.frontDot=+dot.toFixed(5);
  }else{log('CHAIR_ORIENTATION_UNRESOLVED:'+def.id);group.rotation.y=0;}
  profile.asset=def.asset;profile.id=def.id;profile.sourceSha256=config.assetSha[def.asset];
  telemetry.chairProfiles.push(profile);
 }else group.rotation.y=def.r||0;
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 propModels.push(group);telemetry.loadedAssets[def.id]='SHA_VERIFIED';
 return group;
}
function findBone(model,re){
 let found=null;model.traverse(o=>{if(o.isBone&&re.test(o.name))found=o});return found;
}
function measureActorFront(model){
 model.updateMatrixWorld(true);
 // Native toe-to-ankle offsets on the real skeleton, with two independent foot samples.
 const directions=[];for(const side of ['L','R']){
  const ankle=findBone(model,new RegExp('^Foot[.]'+side+'$','i'));
  const toe=findBone(model,new RegExp('^(PT|Toe)[.]'+side+'$','i'));
  if(ankle&&toe){let a=new THREE.Vector3(),b=new THREE.Vector3();ankle.getWorldPosition(a);toe.getWorldPosition(b);
   const d=b.sub(a);d.y=0;if(d.length()>.005)directions.push(d.normalize());}
 }
 let v=new THREE.Vector3(),method='';
 if(directions.length===2&&directions[0].dot(directions[1])>.85){
  v.add(directions[0]).add(directions[1]).normalize();method='BILATERAL_TOE_TO_ANKLE_BONE';
 }else{
  // If eye materials are separate primitives, their surface is in front of the head shell.
  const eyes=[],headBoxes=[];
  model.traverse(o=>{if(!o.isMesh&&!o.isSkinnedMesh)return;
   const names=(Array.isArray(o.material)?o.material:[o.material]).map(m=>m?.name||'');
   const box=new THREE.Box3().setFromObject(o);
   if(names.some(n=>/eye|pupil/i.test(n)))eyes.push(box.getCenter(new THREE.Vector3()));
   if(/head/i.test(o.name))headBoxes.push(box);
  });
  if(eyes.length&&headBoxes.length){const eye=new THREE.Vector3();for(const e of eyes)eye.add(e);eye.divideScalar(eyes.length);
   const head=new THREE.Box3();for(const b of headBoxes)head.union(b);
   const d=eye.sub(head.getCenter(new THREE.Vector3()));d.y=0;if(d.length()>.01){v=d.normalize();method='EYE_SURFACE_TO_HEAD_VOLUME';}}
 }
 if(v.length()<.9)return{status:'UNRESOLVED',method:'NO_RELIABLE_NATIVE_FACE_AXIS',toeSamples:directions.length};
 return{status:'GEOMETRY_INFERRED_NOT_VISUALLY_CERTIFIED',method,local:[+v.x.toFixed(6),0,+v.z.toFixed(6)],toeSamples:directions.length};
}
function chooseClip(clips,kind){
 const re=kind==='walk'?[/^walk(?:ing)?$/i,/walk/i]:kind==='interact'?[/pick|grab|interact|reach/i]:[/^idle$/i,/idle|stand|breath/i];
 for(const r of re){const hit=clips.find(c=>r.test(c.name));if(hit)return hit}
 return null;
}
async function loadActor(){
 const gl=await loadAsset('civil_azul',config.actor.sha256,true);
 actor=gl.scene;normalizeModel(actor,1.74);
 const profile=measureActorFront(actor);telemetry.actorOrientation={...profile,asset:'civil_azul.glb',sha256:config.actor.sha256};
 if(profile.local)front=profile.local;
 rootActor=new THREE.Group();rootActor.name='PERSONAJE_CIVIL_REAL';rootActor.add(actor);scene.add(rootActor);
 actor.traverse(o=>{if(o.isBone)telemetry.actor.bones++;if(o.isMesh||o.isSkinnedMesh){o.castShadow=true;o.receiveShadow=true;}});
 const clips=gl.animations||[];
 telemetry.actor.clips=clips.map(c=>({name:c.name,duration:+c.duration.toFixed(3),tracks:c.tracks.length}));
 const idle=chooseClip(clips,'idle'),walk=chooseClip(clips,'walk'),interact=chooseClip(clips,'interact');
 telemetry.actor.idle=idle?.name||null;telemetry.actor.walk=walk?.name||null;telemetry.actor.interaction=interact?.name||null;
 telemetry.actor.loaded=true;
 if(!idle||!walk||!telemetry.actor.bones){log('ACTOR_RIG_CLIP_REQUIRED');return;}
 mixer=new THREE.AnimationMixer(actor);animIdle=mixer.clipAction(idle);animWalk=mixer.clipAction(walk);
 if(interact)animInteract=mixer.clipAction(interact);
 activeAction=animIdle;animIdle.play();status('Modelos reales cargados · perfil frontal: '+(front?'inferido':'sin resolver'));
}
function changeClip(mode){
 if(!mixer)return;
 const next=mode==='walk'?animWalk:mode==='interact'&&animInteract?animInteract:animIdle;
 if(next===activeAction)return;
 activeAction?.fadeOut(.2);next.reset().fadeIn(.2).play();activeAction=next;
}
function samplePath(time){
 const k=config.actor.route;
 const seg=k.find((s,i)=>time>=s.from&&time<s.to)||k[k.length-1];
 const u=clamp((time-seg.from)/(seg.to-seg.from),0,1);
 const x=seg.a[0]+(seg.b[0]-seg.a[0])*u,z=seg.a[1]+(seg.b[1]-seg.a[1])*u;
 return{segment:seg,u,x,z};
}
function pose(time){
 if(!rootActor)return;
 const seg=samplePath(time),way=config.actor.route,first=way.find(x=>x.mode==='walk'),second=way.filter(x=>x.mode==='walk')[1];
 const h1=front?facingYaw(first.b[0]-first.a[0],first.b[1]-first.a[1],front):null;
 const h2=front?facingYaw(second.b[0]-second.a[0],second.b[1]-second.a[1],front):null;
 let yaw=h1;
 if(seg.segment.mode==='turn'&&front){
  const d=Math.atan2(Math.sin(h2-h1),Math.cos(h2-h1));yaw=h1+d*seg.u;
 }else if(time>=second.from)yaw=h2;
 rootActor.position.set(seg.x,0,seg.z);
 if(front&&yaw!==null)rootActor.rotation.y=yaw;
 const mode=seg.segment.mode==='walk'?'walk':seg.segment.mode==='interact'?'interact':'idle';
 if(mode==='walk'&&!front){changeClip('idle');status('EJE FRONTAL SIN MEDIR · caminata no aprobada');return;}
 if(mode==='walk'&&!animWalk){changeClip('idle');log('WALK_CLIP_MISSING');return;}
 changeClip(mode);
 if(mode==='walk'&&front){
  const dx=seg.segment.b[0]-seg.segment.a[0],dz=seg.segment.b[1]-seg.segment.a[1],d=new THREE.Vector3(dx,0,dz).normalize();
  const dot=worldForward(rootActor.rotation.y,front).dot(d);
  const m=telemetry.motion; m.frontDotMin=m.frontDotMin===null?dot:Math.min(m.frontDotMin,dot);
  if(m.samples.length<120)m.samples.push({t:+time.toFixed(3),dot:+dot.toFixed(5),position:[+seg.x.toFixed(3),+seg.z.toFixed(3)]});
 }
 telemetry.motion.phase=seg.segment.id;
}
function footContactSample(time){
 if(!rootActor||!mixer||!front)return;
 const l=findBone(actor,/^Foot[.]L$/i),r=findBone(actor,/^Foot[.]R$/i);
 if(!l||!r)return;
 const feet=[l,r].map(b=>b.getWorldPosition(new THREE.Vector3()));
 const cur=feet.map(f=>({x:f.x,y:f.y,z:f.z}));
 if(lastFeet&&telemetry.motion.footSlipSamples.length<300){
  cur.forEach((p,i)=>{if(p.y<.11&&lastFeet[i].y<.11){
   telemetry.motion.footSlipSamples.push({t:+time.toFixed(3),foot:i,dx:+Math.hypot(p.x-lastFeet[i].x,p.z-lastFeet[i].z).toFixed(5)});
  }});
 }
 lastFeet=cur;
}
function measureCollisions(){
 telemetry.collisions=[];
 const table=propModels.find(x=>x.name==='table');
 const chairs=propModels.filter(x=>x.name.startsWith('chair'));
 if(!table||chairs.length<2)return;
 const tb=new THREE.Box3().setFromObject(table);
 for(const ch of chairs){
  const box=new THREE.Box3().setFromObject(ch);
  if(box.intersectsBox(tb))telemetry.collisions.push('CHAIR_TABLE_AABB:'+ch.name);
 }
 if(new THREE.Box3().setFromObject(chairs[0]).intersectsBox(new THREE.Box3().setFromObject(chairs[1])))
  telemetry.collisions.push('CHAIR_CHAIR_AABB');
}
function applyCamera(time){
 if(!film||!camera||!rootActor)return;
 const p=rootActor.position.toArray(),anchors=semanticAnchors({height:1.74,origin:p,object:[0,1.3,0]});
 anchors.interaction=[-1.85,.97,-1.8];
 const f=sampleFrame(shotlist,Math.floor(time*24),anchors,'civil');
 camera.position.fromArray(f.position);controls.target.fromArray(f.target);
 camera.fov=f.fov;camera.updateProjectionMatrix();controls.update();
 telemetry.shots[f.shotId]={seen:true,frame:f.frame,faceSafe:safeSubject(f,anchors,'face',camera.aspect,.08).safe};
 $('shot').textContent=f.label||f.shotId;
}
function resize(){if(!camera)return;const w=window.innerWidth,h=window.innerHeight;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setSize(w,h,false);
 camera.aspect=w/h;camera.updateProjectionMatrix();
}
function seek(v){t=clamp(Number(v)||0,0,20);lastFeet=null;pose(t);applyCamera(t);$('seek').value=String(t);$('time').textContent=formatTime(t)+' / 00:20';}
function loop(){
 requestAnimationFrame(loop);
 const now=performance.now(),dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(playing&&rootActor){t=Math.min(20,t+dt);if(t>=20)playing=false;}
 if(mixer&&playing)mixer.update(dt);
 if(rootActor){pose(t);if(playing)footContactSample(t)}
 if(film&&rootActor)applyCamera(t);
 if(renderer){controls.update();renderer.render(scene,camera);telemetry.frames++;}
 $('seek').value=String(t);$('time').textContent=formatTime(t)+' / 00:20';
 $('play').textContent=playing?'Ⅱ PAUSAR':'▶ REPRODUCIR';
}
function inspect(event){
 if(!renderer||!camera)return;
 pointer.x=event.clientX/window.innerWidth*2-1;pointer.y=-(event.clientY/window.innerHeight)*2+1;
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(propModels,true)[0];
 if(!hit)return;
 let o=hit.object;while(o.parent&&!propModels.includes(o))o=o.parent;
 if(!propModels.includes(o))return;
 selected=o;
 $('inspector').hidden=false;$('object-name').textContent=o.name;
 $('object-info').textContent='GLB auténtico: '+o.userData.asset+' · Posición '+o.position.toArray().map(n=>n.toFixed(2)).join(', ')+' · giro '+o.rotation.y.toFixed(3);
}
async function loadScene(){
 config=await(await fetch('./SCENE.json',{cache:'no-store'})).json();
 shotlist=await(await fetch('./SHOTS.json',{cache:'no-store'})).json();
 const validity=validateShotlist(shotlist);if(!validity.ok)throw Error('INVALID_CAMERA_DIRECTOR:'+validity.errors.join(','));
 scene=new THREE.Scene();architecture();
 const canvas=$('canvas'),gl=canvas.getContext('webgl2',{alpha:false,antialias:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WEBGL2_UNAVAILABLE');
 renderer=new THREE.WebGLRenderer({canvas,context:gl,antialias:true,powerPreference:'high-performance'});
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 camera=new THREE.PerspectiveCamera(51,1,.05,80);camera.position.set(3,2.2,3.4);
 controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;controls.minDistance=1;controls.maxDistance=14;
 controls.maxPolarAngle=Math.PI*.68;controls.target.set(0,1.45,0);
 telemetry.webgl='WEBGL2_STARTED';resize();window.addEventListener('resize',resize);
 const defs=config.props;let next=0;const count=defs.length;
 const jobs=Array.from({length:Math.min(4,count)},async()=>{while(next<count){
  const def=defs[next++];try{const gltfAsset=await loadAsset(def.asset,config.assetSha[def.asset]);placeProp(def,gltfAsset);}
  catch(e){telemetry.loadedAssets[def.id]='FAILED';log(e)}
  $('assets').textContent=Object.values(telemetry.loadedAssets).filter(x=>x==='SHA_VERIFIED').length+' / '+count+' muebles';
 }});
 await Promise.all([...jobs,loadActor().catch(e=>{log(e);telemetry.actor.loadError=String(e);})]);
 measureCollisions();telemetry.roof.physical=!!roof;
 if(Object.values(telemetry.loadedAssets).some(v=>v==='FAILED')||!telemetry.actor.loaded)
  status('CANDIDATO INCOMPLETO · recursos faltantes');
 else status('ESCENA CARGADA · sin aprobación artística');
 seek(0);playing=true;
 $('play').onclick=()=>{playing=!playing;lastFrame=performance.now();};
 $('seek').oninput=e=>{playing=false;seek(e.target.value);};
 $('mode').onclick=()=>{film=!film;roofVisibility();if(film)applyCamera(t);};
 $('reset').onclick=()=>{controls.target.set(0,1.4,0);camera.position.set(3.1,2.4,3.3);controls.update();};
 $('canvas').addEventListener('click',inspect);
 $('close-inspector').onclick=()=>{$('inspector').hidden=true;};
 loop();
}
loadScene().catch(fatal);
