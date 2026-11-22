import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {evaluateTimeline,validateTimeline,retimeShot,cloneValidated,clamp} from './sequencer.mjs';
import {createSoundTrack} from './sound.mjs';
import {firstArticleCut, inspectEyelineAxis} from './continuity.mjs';
const $=id=>document.getElementById(id);
const firstArticleMode=new URLSearchParams(location.search).has('first');
const canvas=$('stage'),frame=canvas.parentElement;
let film,selection=0,clock=0,mode='paused',timeOrigin=0,transport=null,recorder=null,recordStream=null,recordParts=[],downloadURL=null;
const scene=new THREE.Scene();
scene.background=new THREE.Color('#0a202b');scene.fog=new THREE.FogExp2(0x0b2630,.032);
const camera=new THREE.PerspectiveCamera(42,1,.04,160);
let renderer;
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.25;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 $('render-status').textContent='WEBGL · EN VIVO';
}catch(error){
 $('render-status').textContent='WEBGL · NO DISPONIBLE';$('status').textContent='No se pudo iniciar WebGL: '+error.message;throw error;
}
const MAT=(color,roughness=.88,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const clothA=MAT('#a9655d',.97),clothB=MAT('#57726b',.95),skinA=MAT('#d1a28c',.96),skinB=MAT('#a98272',.96);
const weathered=MAT('#4d5651',.94),wetWood=MAT('#44433f',.76),metal=MAT('#8c785e',.47,.48);
const mesh=(geo,mat,pos=[0,0,0],parent=scene)=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);parent.add(m);return m};
const box=(w,h,d,mat,pos,parent=scene)=>mesh(new THREE.BoxGeometry(w,h,d),mat,pos,parent);
const sphere=(r,mat,pos,parent=scene,seg=20)=>mesh(new THREE.SphereGeometry(r,seg,14),mat,pos,parent);
const cyl=(top,bottom,height,mat,pos,parent=scene,seg=14)=>mesh(new THREE.CylinderGeometry(top,bottom,height,seg),mat,pos,parent);
const lineTube=(p,thick,mat,parent=scene)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(q=>new THREE.Vector3(...q))),Math.max(12,p.length*8),thick,6,false),mat,[0,0,0],parent);
const hemi=new THREE.HemisphereLight(0xbad7dd,0x26302b,1.05);scene.add(hemi);
const moon=new THREE.DirectionalLight(0xa1c5d2,2.05);moon.position.set(-6,9,4);moon.castShadow=true;
moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-13;moon.shadow.camera.right=13;moon.shadow.camera.top=13;moon.shadow.camera.bottom=-13;moon.shadow.bias=-.00015;scene.add(moon);
const lanternLight=new THREE.PointLight(0xffb472,3.1,7,1.4);lanternLight.position.set(0,1.31,.26);scene.add(lanternLight);
const lanternGlow=MAT('#ffcb7c',.3,.1);lanternGlow.emissive=new THREE.Color('#ec954c');lanternGlow.emissiveIntensity=2.5;

// The pier: 8.6 m across, 7.2 m long. Measurements shared with actors.
box(8.8,.22,7.1,MAT('#2b3433',.9),[0,-.21,.4]);
for(let i=0;i<31;i++){
 const z=-3.0+i*.226;
 const m=box(8.65,.06,.196,wetWood,[0,-.064,z]);
 if(i%3===0){m.material=MAT(i%2?'#58534b':'#5b5146',.87)}
 for(const x of [-3.95,3.96])sphere(.016,metal,[x,-.025,z-.065],m);
}
for(const x of [-4.18,4.18])for(const z of [-2.65,-.6,1.55,3.48]){
 const post=box(.2,1.25,.2,weathered,[x,.51,z]);post.castShadow=true;post.receiveShadow=true;
 const head=sphere(.12,metal,[x,1.16,z]);head.scale.set(1.2,.45,1.2);
}
for(const x of [-4.18,4.18])for(const h of [.56,.97]){
 lineTube([ [x,h,-2.65],[x,h-.06,-.6],[x,h-.03,1.55],[x,h,3.48] ],.025,MAT('#85745f',.97));
}
// A low stand grounds the diegetic light before the characters lift it.
cyl(.13,.21,.83,weathered,[0,.41,.16],scene);
cyl(.3,.26,.08,wetWood,[0,.85,.16],scene);
const lantern=new THREE.Group();lantern.position.set(0,1.13,.16);scene.add(lantern);
const halo=sphere(.205,lanternGlow,[0,0,0],lantern,24);halo.scale.set(.78,1.08,.75);
for(const x of [-.15,.15])for(const z of [-.15,.15])box(.035,.47,.035,metal,[x,0,z],lantern);
box(.42,.05,.42,metal,[0,.25,0],lantern);box(.42,.045,.42,metal,[0,-.25,0],lantern);
lineTube([[-.09,.26,0],[0,.38,0],[.09,.26,0]],.025,metal,lantern);
const pool=mesh(new THREE.CircleGeometry(1.85,48),new THREE.MeshBasicMaterial({color:0xc17b49,transparent:true,opacity:.12,depthWrite:false}),[0,-.01,.15]);
pool.rotation.x=-Math.PI/2;

// Dark sea, low-cost deterministic ripple based on absolute seconds.
const seaGeometry=new THREE.PlaneGeometry(105,105,44,44);
const sea=mesh(seaGeometry,MAT('#1a4b58',.39,.12),[0,-.38,-15]);
sea.rotation.x=-Math.PI/2;sea.receiveShadow=true;
const seaAttr=sea.geometry.attributes.position;
function animateSea(t){
 for(let i=0;i<seaAttr.count;i++){
  const x=seaAttr.getX(i),y=seaAttr.getY(i);
  seaAttr.setZ(i,.095*Math.sin(x*.42+t*.44+y*.1)+.04*Math.sin(y*.8-t*.65+x*.5));
 }
 seaAttr.needsUpdate=true;
 if(Math.floor(t*8)%3===0)sea.geometry.computeVertexNormals();
}
// Horizon: authored silhouettes, layered depth and physical distance.
function silhouette(points,z,y,col){
 const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);
 shape.lineTo(points[points.length-1][0],-1.1);shape.lineTo(points[0][0],-1.1);
 const m=mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:col,side:THREE.DoubleSide}),[0,y,z]);return m;
}
silhouette([[-40,.1],[-30,.16],[-24,.36],[-18,.1],[-10,.31],[-4,.16],[2,.18],[9,.5],[18,.31],[28,.12],[42,.09]],-25,-.32,'#112b34');
silhouette([[-40,-.03],[-27,.05],[-19,.14],[-12,0],[-5,.12],[5,.04],[11,.18],[23,.02],[40,-.03]],-15,-.38,'#10232d');
for(let i=0;i<14;i++){
 const x=-19+i*2.8;
 const pier=cyl(.052,.06,1.25,MAT('#283d43',.96),[x,-.17,-12],scene,6);pier.visible=i%3!==0;
}
const farLight=new THREE.PointLight(0xf2a76e,.6,8);farLight.position.set(10,1.15,-16);scene.add(farLight);
cyl(.19,.43,2.4,MAT('#374d50',.87),[10,.2,-16]);sphere(.18,lanternGlow,[10,1.44,-16]).scale.set(1.2,.72,1.2);
// Lighthouse / sky pinpricks are original geometries, not borrowed assets.
let seed=3721;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const starGeo=new THREE.BufferGeometry(),st=[];
for(let i=0;i<90;i++){const x=(rand()-.5)*85,y=4+rand()*27,z=-28-rand()*30;st.push(x,y,z)}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(st,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb2c5c8,size:.085,transparent:true,opacity:.59,depthWrite:false})));

// A tailored body mesh, rings of hand-defined silhouette instead of a stack of primitives.
function coatGeometry(isVera){
 const rings=isVera?[
  [.15,.40,.27],[.22,.48,.30],[.42,.44,.26],[.77,.34,.245],[1.05,.28,.22],[1.29,.33,.25],[1.41,.21,.19]
 ]:[
  [.14,.34,.28],[.27,.39,.29],[.5,.40,.27],[.77,.37,.26],[1.1,.345,.25],[1.34,.345,.24],[1.44,.19,.18]
 ];
 const N=40,vertices=[],indices=[];
 for(let j=0;j<rings.length;j++){
  const [y,rx,rz]=rings[j];
  for(let i=0;i<N;i++){
   const a=i/N*2*Math.PI;
   const fold=1+.025*Math.sin(a*7+j*.55)+.015*Math.sin(a*11+j*1.17);
   vertices.push(Math.cos(a)*rx*fold,y+(Math.cos(a*5)*.012),Math.sin(a)*rz*fold);
  }
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<N;i++){
  const a=j*N+i,b=j*N+(i+1)%N,c=(j+1)*N+i,d=(j+1)*N+(i+1)%N;
  indices.push(a,c,b,b,c,d);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
// Head geometry with cheekbone/temple and narrowed chin; physically distinct from a generic sphere.
function faceGeometry(){
 const g=new THREE.SphereGeometry(.25,32,24),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  let x=p.getX(i),y=p.getY(i),z=p.getZ(i),u=y/.25;
  const cheek=1-.19*Math.max(0,-u)+.07*Math.exp(-Math.pow((u+.09)*3,2));
  p.setXYZ(i,x*cheek,y*.95,z*(.84+.07*Math.cos(u*3)) + Math.max(0,z)*(.06*Math.exp(-Math.pow((u+.23)*4,2))));
 }
 g.computeVertexNormals();return g;
}
function createActor({name,x,coat,skin,hair,side}){
 const root=new THREE.Group();root.position.x=x;scene.add(root);
 const body=new THREE.Group();root.add(body);
 const torso=mesh(coatGeometry(name==='Vera'),coat,[0,0,0],body);torso.castShadow=true;torso.receiveShadow=true;
 const lining=MAT(name==='Vera'?'#e7a58a':'#a4aca0',.99);
 // Coat seams are topological and follow body curvature.
 lineTube([[-.02,1.35,.2],[-.11,1.07,.24],[-.17,.76,.255],[-.22,.34,.27]],.007,lining,body);
 lineTube([[.03,1.35,.2],[.11,1.07,.24],[.14,.76,.255],[.19,.34,.27]],.007,lining,body);
 for(let y of [.98,.79,.6]){const button=sphere(.022,metal,[.04,y,.275],body,10);button.scale.set(1,.9,.45)}
 const collar=cyl(.17,.22,.13,MAT(name==='Vera'?'#503e42':'#273a38',.99),[0,1.44,0],body,26);collar.scale.z=.84;
 const neck=cyl(.09,.11,.17,skin,[0,1.53,0],body,20);
 const headPivot=new THREE.Group();headPivot.position.set(0,1.62,0);body.add(headPivot);
 const head=mesh(faceGeometry(),skin,[0,.105,.015],headPivot);head.castShadow=true;
 // Eyes use linework, eyelids and brows cut close to the surface.
 const iris=MAT(name==='Vera'?'#293c39':'#302b2b',.36);
 for(const sideEye of [-1,1]){
  const ex=sideEye*.09,ey=.13;
  // Fine inlaid gaze, not a pasted-on spherical eyeball.
  const eye=sphere(.018,iris,[ex,ey,.234],headPivot,16);eye.scale.set(1.25,.55,.15);
  lineTube([[ex-.042,ey+.022,.233],[ex,ey+.032,.249],[ex+.042,ey+.019,.233]],.006,iris,headPivot);
  lineTube([[ex-.046,ey+.1,.223],[ex,ey+.107,.23],[ex+.046,ey+.09,.225]],.009,MAT(name==='Vera'?'#5c3e39':'#4a3434',.96),headPivot);
 }
 // Porcelain-mask acting: an uninterrupted sculpted surface. Deliberately NO add-on cone nose.
 // Emotional acting is read in the neck, turn, shoulders, stillness and silhouette.
 lineTube([[-.049,-.034,.208],[0,-.048,.221],[.049,-.031,.208]],.006,MAT('#714e49'),headPivot);
 const hairMat=MAT(hair,.96);
 const cap=sphere(.24,hairMat,[0,.232,-.02],headPivot,28);cap.scale.set(1.05,.53,1.04);
 for(const h of [-.15,-.08,0,.08,.15]){
  lineTube([[h,.23,.198],[h*.9,.29,.17],[h*.8,.32,.09]],.024,hairMat,headPivot);
 }
 if(name==='Vera'){
  const bun=sphere(.15,hairMat,[0,.22,-.27],headPivot,18);bun.scale.set(1.2,.86,.7);
  for(let j=0;j<4;j++)lineTube([[0,.17+j*.025,-.34],[.07*Math.sin(j),.23+j*.02,-.34]],.012,MAT('#9d7570'),headPivot);
 }else{
  const hat=mesh(new THREE.CylinderGeometry(.26,.30,.17,32),MAT('#39443c'),[0,.39,-.005],headPivot);hat.castShadow=true;
  const brim=cyl(.38,.38,.035,MAT('#303a37'),[0,.315,.025],headPivot,40);brim.scale.z=.75;
  const band=cyl(.3,.3,.035,metal,[0,.315,-.005],headPivot,40);band.scale.z=.76;
 }
 // Custom swept tapered sleeves pivot at the shoulder; the inner hand reaches the lantern.
 const makeArm=(sgn)=>{
  const pivot=new THREE.Group();pivot.position.set(sgn*.31,1.29,0);body.add(pivot);
  const g=new THREE.BufferGeometry(),verts=[],indices=[],rings=[[0,.14,.16],[-.24,.155,.15],[-.49,.12,.13],[-.68,.075,.09]];
  for(let j=0;j<rings.length;j++)for(let i=0;i<18;i++){
   const a=i/18*Math.PI*2,[y,rX,rZ]=rings[j];verts.push(Math.cos(a)*rX,y,Math.sin(a)*rZ);
  }
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<18;i++){const a=j*18+i,b=j*18+(i+1)%18,c=(j+1)*18+i,d=(j+1)*18+(i+1)%18;indices.push(a,b,c,b,d,c)}
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();
  const arm=mesh(g,coat,[0,0,0],pivot);arm.castShadow=true;
  const cuff=cyl(.086,.077,.075,lining,[0,-.67,0],pivot,18);cuff.scale.z=1.11;
  const hand=sphere(.077,skin,[0,-.765,.015],pivot,14);hand.scale.set(.87,1.28,.78);
  for(const j of [-1,0,1])sphere(.016,skin,[j*.035,-.842,.045],pivot,9).scale.set(.8,1.3,.85);
  return pivot;
 };
 const innerArm=makeArm(side),outerArm=makeArm(-side);
 outerArm.rotation.z=-side*.10;
 // Boots are intentionally grounded at y ~=0 (actor height 1.95 m).
 const boot=MAT(name==='Vera'?'#403b39':'#353d39',.94);
 for(const sgn of [-1,1]){
  const leg=mesh(new THREE.CapsuleGeometry(.115,.29,6,12),boot,[sgn*.17,.23,0],root);leg.castShadow=true;
  const shoe=sphere(.14,boot,[sgn*.17,.08,.1],root,18);shoe.scale.set(1.03,.45,1.7);shoe.castShadow=true;
 }
 return {name,root,body,headPivot,innerArm,outerArm,baseX:x,side};
}
const characters={
 vera:createActor({name:'Vera',x:-.94,coat:clothA,skin:skinA,hair:'#3a3236',side:1}),
 noe:createActor({name:'Noé',x:.94,coat:clothB,skin:skinB,hair:'#323b3b',side:-1})
};
function actorAt(actor,s,t){
 actor.root.position.x=actor.baseX+s.walk*actor.side*-1; // Noé moves toward the far end of the frame.
 if(actor.name==='Noé')actor.root.position.x=actor.baseX+s.walk;
 actor.body.rotation.z=-actor.side*s.lean*.12;
 actor.body.rotation.x=s.lean*.08;
 actor.headPivot.rotation.y=s.head;
 actor.headPivot.rotation.z=-actor.side*s.lean*.08;
 actor.innerArm.rotation.z=actor.side*s.reach*1.32;
 actor.innerArm.rotation.x=-s.reach*.18;
 actor.outerArm.rotation.z=-actor.side*(.09+.09*s.lean);
 actor.root.rotation.y=actor.name==='Noé'?-.06*s.walk:0;
}
const shotButtons=new Map();
function renderShots(){
 const host=$('shots');host.textContent='';shotButtons.clear();
 film.shots.forEach((s,i)=>{
  const b=document.createElement('button');b.className='shot';b.style.flexGrow=String((s.end-s.start)*100);
  b.innerHTML='<span class="num">'+String(i+1).padStart(2,'0')+'</span><span class="name"></span><span class="dur"></span>';
  b.querySelector('.name').textContent=s.name.replace(/^.+?· /,'');
  b.querySelector('.dur').textContent=(s.end-s.start).toFixed(1)+' s';
  b.title='Editar '+s.name;b.setAttribute('aria-label','Seleccionar '+s.name);
  b.addEventListener('click',()=>{pause();selection=i;clock=s.start;setInspector();applyAt(clock)});
  host.append(b);shotButtons.set(s.id,b);
 });updateShotButtons();
}
function updateShotButtons(){
 if(!film)return;
 const current=evaluateTimeline(clock,film).shotId;
 for(const [id,b] of shotButtons){b.classList.toggle('active',id===current);b.classList.toggle('selected',id===film.shots[selection].id)}
}
function mmss(t){return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0')}
function applyAt(t){
 if(!film)return;
 const v=evaluateTimeline(t,film);
 camera.position.fromArray(v.eye);camera.lookAt(new THREE.Vector3(...v.target));camera.fov=v.fov;camera.updateProjectionMatrix();
 lanternLight.intensity=v.light*(1+.018*Math.sin(t*7+.3));
 lanternGlow.emissiveIntensity=1.8+v.light*.17;
 for(const name of ['vera','noe'])actorAt(characters[name],v.actors[name],t);
 animateSea(t);
 lantern.rotation.y=Math.sin(t*.35)*.02;lantern.position.y=1.13+.012*Math.sin(t*1.1);
 $('subtitle').textContent=v.subtitle;
 $('filmTitle').style.opacity=t<2.6?String(1-clamp((t-1.35)/1.25,0,1)):0;
 $('shotNumber').textContent='PLANO '+String(v.shotIndex+1).padStart(2,'0')+' / '+String(film.shots.length).padStart(2,'0');
 $('clock').textContent=mmss(t)+' / '+mmss(film.duration);$('seek').value=String(t);
 $('cutInfo').textContent='PLANO '+String(v.shotIndex+1)+' · '+(v.progress*100).toFixed(0)+' %';
 updateShotButtons();renderer.render(scene,camera);
}
function resize(){
 const r=frame.getBoundingClientRect(),w=Math.max(50,r.width),h=Math.max(50,r.height);
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 if(film)applyAt(clock);
}
new ResizeObserver(resize).observe(frame);
function setStatus(message){$('status').textContent=message}
async function stopSound(){const old=transport;transport=null;if(old)await old.stop()}
async function pause(){
 if(mode==='record')return;
 if(mode==='playing')clock=clamp((performance.now()-timeOrigin)/1000,0,film.duration);
 mode='paused';$('play').textContent='▶ REPRODUCIR';$('bigPlay').hidden=false;await stopSound();
 if(film)applyAt(clock);
}
async function play(){
 if(!film||mode==='record')return;
 if(mode==='playing'){await pause();return}
 if(clock>=film.duration-.015)clock=0;
 try{transport=await createSoundTrack({duration:film.duration,offset:clock,audible:true})}
 catch(err){setStatus('Sin audio: '+err.message)}
 timeOrigin=performance.now()-clock*1000;mode='playing';
 $('play').textContent='Ⅱ PAUSAR';$('bigPlay').hidden=true;setStatus('Reproduciendo película y banda sonora original');
}
function update(){
 if(film){
  if(mode==='playing'||mode==='record'){
   clock=clamp((performance.now()-timeOrigin)/1000,0,film.duration);
   if(clock>=film.duration){
    clock=film.duration;
    if(mode==='record')finishRecord();else pause();
   }
  }
  applyAt(clock);
 }
 requestAnimationFrame(update);
}
function inspectorValue(id,v){$(id).value=String(v)}
function setInspector(){
 const s=film.shots[selection];$('selectedId').textContent=s.id.toUpperCase();
 inspectorValue('shotDuration',(s.end-s.start).toFixed(2));inspectorValue('fov',s.camera.fov);
 $('fovValue').textContent=s.camera.fov+'°';
 [['cx',0],['cy',1],['cz',2]].forEach(([id,i])=>inspectorValue(id,s.camera.from[i]));
 [['ex',0],['ey',1],['ez',2]].forEach(([id,i])=>inspectorValue(id,s.camera.to[i]));
 inspectorValue('light',s.light.to);$('lightValue').textContent=s.light.to.toFixed(2);
 inspectorValue('veraLook',Math.abs(s.actors.vera.head[1]));$('veraLookValue').textContent=Math.round(Math.abs(s.actors.vera.head[1])*100)+' %';
 inspectorValue('noeLook',Math.abs(s.actors.noe.head[1]));$('noeLookValue').textContent=Math.round(Math.abs(s.actors.noe.head[1])*100)+' %';
 inspectorValue('vera',s.actors.vera.reach[1]);$('veraValue').textContent=Math.round(s.actors.vera.reach[1]*100)+' %';
 inspectorValue('noe',s.actors.noe.reach[1]);$('noeValue').textContent=Math.round(s.actors.noe.reach[1]*100)+' %';
 $('subtitleEdit').value=s.subtitle||'';updateShotButtons();
}
function editFilm(mutator){
 if(mode==='record')return;
 const before=film;const copy=JSON.parse(JSON.stringify(film));
 try{mutator(copy);const e=validateTimeline(copy);if(e.length)throw new Error(e.join('; '));film=copy;setInspector();applyAt(clock);setStatus('Edición aplicada al timeline');}
 catch(e){film=before;setStatus('Cambio rechazado: '+e.message)}
}
function bindInspector(){
 $('shotDuration').addEventListener('change',()=>{
  if(mode==='record')return;
  try{film=retimeShot(film,film.shots[selection].id,Number($('shotDuration').value));clock=Math.min(clock,film.duration);$('seek').max=String(film.duration);renderShots();setInspector();applyAt(clock)}
  catch(e){setStatus(e.message);setInspector()}
 });
 const connect=(id,fn)=>$(id).addEventListener('input',()=>editFilm(s=>fn(s.shots[selection],$(id).value)));
 connect('fov',(s,v)=>s.camera.fov=Number(v));
 for(const [id,index] of [['cx',0],['cy',1],['cz',2]])$(id).addEventListener('change',()=>editFilm(s=>s.shots[selection].camera.from[index]=Number($(id).value)));
 for(const [id,index] of [['ex',0],['ey',1],['ez',2]])$(id).addEventListener('change',()=>editFilm(s=>s.shots[selection].camera.to[index]=Number($(id).value)));
 connect('light',(s,v)=>s.light.to=Number(v));
 connect('veraLook',(s,v)=>s.actors.vera.head[1]=Number(v)*.65);
 connect('noeLook',(s,v)=>s.actors.noe.head[1]=-Number(v)*.65);
 connect('vera',(s,v)=>s.actors.vera.reach[1]=Number(v));
 connect('noe',(s,v)=>s.actors.noe.reach[1]=Number(v));
 $('subtitleEdit').addEventListener('change',()=>editFilm(s=>s.shots[selection].subtitle=$('subtitleEdit').value));
}
function saveBlob(blob,name){
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function saveJSON(){
 const json=JSON.stringify(cloneValidated(film),null,2)+'\n';
 saveBlob(new Blob([json],{type:'application/json'}),'La-despedida.timeline.json');
}
async function importJSON(file){
 if(!file)return;
 try{
  const data=cloneValidated(JSON.parse(await file.text()));
  await pause();film=data;clock=0;selection=0;$('seek').max=film.duration;renderShots();setInspector();applyAt(0);setStatus('Timeline importada y validada');
 }catch(e){setStatus('Importación rechazada: '+e.message)}
}
const chooseMime=()=>{
 if(!window.MediaRecorder)return null;
 for(const mime of ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4']){
  if(MediaRecorder.isTypeSupported(mime))return mime;
 }return null;
};
async function record(){
 if(mode==='record')return;
 await pause();clock=0;applyAt(0);
 const mime=chooseMime();
 if(!mime||!canvas.captureStream){setStatus('Exportación bloqueada: MediaRecorder/captureStream no disponible');$('exportStatus').textContent='NOT_RUN · El navegador no permite captura de video con audio';return}
 $('record').disabled=true;$('download').hidden=true;
 $('exportStatus').textContent='Preparando contenedor '+mime+'…';
 try{
  transport=await createSoundTrack({duration:film.duration,offset:0,audible:false});
  const video=canvas.captureStream(30);
  if(!video.getVideoTracks().length)throw new Error('Canvas sin pista de vídeo');
  const audio=transport.stream.getAudioTracks();
  if(!audio.length)throw new Error('No se pudo obtener pista de audio');
  recordStream=new MediaStream([...video.getVideoTracks(),...audio]);
  recordParts=[];recorder=new MediaRecorder(recordStream,{mimeType:mime,videoBitsPerSecond:3500000});
  recorder.addEventListener('dataavailable',e=>{if(e.data&&e.data.size)recordParts.push(e.data)});
  recorder.addEventListener('error',e=>{$('exportStatus').textContent='ERROR MediaRecorder: '+(e.error?.message||'desconocido')});
  recorder.addEventListener('stop',async()=>{
   const blob=new Blob(recordParts,{type:recorder.mimeType||mime});
   recordStream?.getTracks().forEach(t=>t.stop());recordStream=null;
   await stopSound();$('record').disabled=false;
   if(blob.size<1000){$('exportStatus').textContent='FAILED · No se obtuvo un archivo de video reproducible';return}
   if(downloadURL)URL.revokeObjectURL(downloadURL);
   downloadURL=URL.createObjectURL(blob);
   const a=$('download'),ext=blob.type.includes('mp4')?'mp4':'webm';
   a.href=downloadURL;a.download='La-despedida-W7-04.'+ext;a.hidden=false;
   $('exportStatus').textContent='Archivo producido: '+ext.toUpperCase()+' · '+(blob.size/1024/1024).toFixed(2)+' MiB. Reproducibilidad y sincronía requieren revisión en reproductor.';
   setStatus('Exportación finalizada; archivo disponible para guardar');
  },{once:true});
  recorder.start(200);mode='record';timeOrigin=performance.now();$('bigPlay').hidden=true;
  $('exportStatus').textContent='● GRABANDO '+mime+' · '+mmss(film.duration);
  setStatus('Grabando exactamente la secuencia activa con su audio original');
 }catch(err){
  mode='paused';recordStream?.getTracks().forEach(t=>t.stop());await stopSound();
  $('record').disabled=false;$('exportStatus').textContent='BLOCKED · '+err.message;
  setStatus('No se pudo exportar el video. Se conserva la escena y su timeline.');
 }
}
function finishRecord(){
 if(mode!=='record')return;
 mode='paused';clock=film.duration;
 if(recorder?.state==='recording')recorder.stop();
 $('bigPlay').hidden=false;$('play').textContent='▶ REPRODUCIR';
}
$('play').addEventListener('click',play);$('bigPlay').addEventListener('click',play);
$('rewind').addEventListener('click',async()=>{await pause();clock=0;applyAt(0)});
$('firstArticle').addEventListener('click',()=>{location.href=firstArticleMode?'./':'./?first=1'});
$('firstArticle').textContent=firstArticleMode?'VOLVER AL MONTAJE':'DOS MIRADAS · 3,2 S';
$('seek').addEventListener('input',async()=>{if(mode==='record')return;await pause();clock=Number($('seek').value);applyAt(clock)});
$('saveJson').addEventListener('click',saveJSON);
$('loadJson').addEventListener('click',()=>$('file').click());
$('file').addEventListener('change',async e=>{await importJSON(e.target.files[0]);e.target.value=''});
$('record').addEventListener('click',record);
$('filmMode').addEventListener('click',()=>{
 document.body.classList.toggle('film-mode');
 $('filmMode').textContent=document.body.classList.contains('film-mode')?'SALIR DEL CORTO':'VER CORTO';resize();
});
window.addEventListener('keydown',e=>{
 if(e.code==='Space'&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){e.preventDefault();play()}
 if(e.code==='Escape'&&document.body.classList.contains('film-mode')){$('filmMode').click()}
});
window.addEventListener('beforeunload',()=>{if(downloadURL)URL.revokeObjectURL(downloadURL)});
(async()=>{
 try{
  const response=await fetch('./timeline.json',{cache:'no-store'});if(!response.ok)throw new Error('HTTP '+response.status);
  film=cloneValidated(await response.json());
  if(firstArticleMode){film=firstArticleCut(film);document.querySelector('.identity small').textContent='W7 / PRIMER ARTÍCULO · 2 PLANOS';}
  const axis=inspectEyelineAxis(film);if(!axis.ok)console.warn('Continuidad de miradas: ',axis.errors);
  $('seek').max=String(film.duration);
  renderShots();setInspector();bindInspector();resize();applyAt(0);
  $('render-status').textContent='WEBGL · LISTO';setStatus('Dos personajes · plano secuencia editable · audio original');
  requestAnimationFrame(update);
 }catch(error){$('render-status').textContent='ERROR · SECUENCIA';setStatus('No se pudo abrir timeline.json: '+error.message)}
})();
