import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { AssemblyController, BOM, clamp01, validateAssembly } from './assembly.mjs';

const stageEl=document.getElementById('stage');
const motion=document.getElementById('motion');
const statusEl=document.getElementById('health');
const modeStatus=document.getElementById('modeStatus');
const finishName=document.getElementById('finishName');
const selectedInfo=document.getElementById('selectedInfo');
const toastEl=document.getElementById('toast');
const partList=document.getElementById('parts');
const WHEEL_R=.254, WHEELBASE=1.020;
const AXLE_Y=WHEEL_R, REAR_X=-.49, FRONT_X=REAR_X+WHEELBASE;
const P=new THREE.Vector3(.08,.70,0);
const axis=new THREE.Vector3(-.19,.90,.392).normalize();
let renderer,scene,camera,controls,assembly,selected=null,boxHelper,mode='fold';
let targetCamera=null,targetLook=null,animTarget=null,toastTimer=null;
let running=true,active=true;

function material(color,roughness=.47,metalness=.15){return new THREE.MeshStandardMaterial({color,metalness,roughness});}
const M={
  frame:material('#3c4d4b',.28,.62),trim:material('#b9bfb3',.24,.81),black:material('#161c1e',.68,.12),
  rubber:material('#1b2222',.95,.02),side:material('#333b3b',.81,.08),steel:material('#87918e',.28,.85),
  chrome:material('#c1c9c4',.17,.93),saddle:material('#252f2c',.88,.05),cable:material('#242b2b',.78,.09),
  accent:material('#c8c79f',.44,.32),hub:material('#717d77',.39,.72)
};
const finishes={graphite:{name:'Grafito',color:'#3c4d4b'},copper:{name:'Cobre anodizado',color:'#a96345'},chalk:{name:'Marfil cerámico',color:'#d9dacc'}};
const rootGroups={},frontPivot=new THREE.Group();frontPivot.position.copy(P);
const rearNames=new Set(['rearFrame','rearWheel','seat','drivetrain','chain','brakes','hinge']);
function vec(p){return Array.isArray(p)?new THREE.Vector3(...p):p.clone();}
function add(parent,geometry,mat,pos=null,rot=null){const mesh=new THREE.Mesh(geometry,mat);if(pos)mesh.position.copy(vec(pos));if(rot)mesh.rotation.set(...rot);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function rod(parent,a,b,r,mat=M.frame,r2=r){const va=vec(a),vb=vec(b),delta=vb.clone().sub(va);const obj=add(parent,new THREE.CylinderGeometry(r2,r,delta.length(),12),mat,va.clone().add(vb).multiplyScalar(.5));obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return obj;}
function disc(parent,pos,rad,depth,mat,segments=32){return add(parent,new THREE.CylinderGeometry(rad,rad,depth,segments),mat,pos,[Math.PI/2,0,0]);}
function ring(parent,x,y,z,r,t,mat){return add(parent,new THREE.TorusGeometry(r,t,8,64),mat,[x,y,z]);}
function curve(parent,points,r,mat){const c=new THREE.CatmullRomCurve3(points.map(vec));return add(parent,new THREE.TubeGeometry(c,Math.max(16,points.length*12),r,6,false),mat);}
function finishAccent(){M.frame.color.set(finishes[document.querySelector('.swatch[aria-pressed=true]')?.dataset.finish||'graphite'].color);}

function wheel(group,x,front){
  const z=0,y=AXLE_Y;
  // ETRTO 50-406: bead seat radius 203 mm; design outer diameter ≈ 508 mm.
  ring(group,x,y,z,.230,.024,M.rubber);
  ring(group,x,y,-.017,.208,.008,M.trim);ring(group,x,y,.017,.208,.008,M.trim);
  ring(group,x,y,-.024,.233,.0035,M.side);ring(group,x,y,.024,.233,.0035,M.side);
  for(let i=0;i<40;i++){
    const a=i*Math.PI*2/40;
    const ra=.230;
    // shallow cross-sipes, not floating knobs
    const p=[x+Math.cos(a)*ra,y+Math.sin(a)*ra,0];
    const chip=add(group,new THREE.BoxGeometry(.018,.003,.049),M.side,p);
    chip.rotation.z=a+Math.PI/2;
  }
  for(let i=0;i<20;i++){
    const a=i*Math.PI*2/20;
    const hubZ=i%2===0?-.029:.029;
    const endZ=hubZ<0?-.014:.014;
    rod(group,[x+Math.cos(a+.17)*.025,y+Math.sin(a+.17)*.025,hubZ],
      [x+Math.cos(a)*.208,y+Math.sin(a)*.208,endZ],.0018,M.chrome);
  }
  disc(group,[x,y,0],.03,.094,M.hub,24);
  disc(group,[x,y,-.053],.045,.009,M.steel,36);
  if(front){
    ring(group,x,y,.06,.067,.004,M.chrome);
    for(let j=0;j<6;j++){const a=j*Math.PI/3;rod(group,[x,y,.06],[x+.061*Math.cos(a),y+.061*Math.sin(a),.06],.003,M.steel);}
    // fixed caliper at upper-rear rotor segment
    const caliper=add(group,new THREE.BoxGeometry(.04,.028,.038),M.black,[x-.05,y+.043,.074]);caliper.rotation.z=-.25;
  } else {
    // eight-speed cassette represented by distinct nested pitch rings
    for(let i=0;i<8;i++)ring(group,x,y,-.065-i*.003,.034+i*.0017,.0024,M.chrome);
  }
}
function buildFrame(){
  const rear=rootGroups.rearFrame,front=rootGroups.frontFrame,hinge=rootGroups.hinge;
  // Rear triangle: seat tube, chainstays, seatstays and structural gussets.
  rod(rear,[-.19,.325,0],[-.315,.91,0],.024,M.frame);
  rod(rear,[-.19,.325,.047],[-.49,.254,.041],.014,M.frame);
  rod(rear,[-.19,.325,-.047],[-.49,.254,-.041],.014,M.frame);
  rod(rear,[-.29,.77,.043],[-.49,.254,.041],.011,M.frame);
  rod(rear,[-.29,.77,-.043],[-.49,.254,-.041],.011,M.frame);
  rod(rear,[-.267,.70,0],[.08,.70,0],.032,M.frame);
  rod(rear,[-.188,.36,0],[-.272,.71,0],.021,M.frame);
  disc(rear,[-.19,.325,0],.043,.118,M.trim,24);
  // Offset pin flanges support the actual pivot, not free-standing cylinders.
  disc(hinge,[.08,.70,0],.052,.097,M.steel,36);
  for(let s of [-1,1]){
    add(hinge,new THREE.BoxGeometry(.105,.091,.017),M.frame,[.08,.70,s*.057]);
    ring(hinge,.08,.70,s*.069,.039,.005,M.chrome);
  }
  rod(hinge,[.09,.68,.080],[.144,.65,.10],.010,M.chrome);
  disc(hinge,[.142,.651,.10],.013,.023,M.black);
  // Front half: primary folded backbone, headstock + fork.
  rod(front,[.08,.70,0],[.343,.718,0],.032,M.frame);
  rod(front,[.12,.68,0],[.333,.575,0],.017,M.frame);
  rod(front,[.333,.575,0],[.40,.79,0],.018,M.frame);
  rod(front,[.356,.613,0],[.424,.832,0],.035,M.trim);
  rod(front,[.424,.832,0],[.454,.925,0],.019,M.black);
  const forkTop=[.373,.71,0];
  for(const s of [-1,1]){
    rod(front,[.405,.68,s*.039],[.53,.26,s*.044],.014,M.frame);
    rod(front,[.392,.74,s*.031],[.405,.675,s*.039],.019,M.trim);
    disc(front,[.53,.254,s*.057],.017,.013,M.chrome,18);
  }
  rod(front,[.37,.70,0],[.40,.79,0],.020,M.black);
  // Small welded trim line, distinct from mechanical pin itself.
  rod(front,[.133,.717,.03],[.294,.729,.03],.003,M.accent);
}
function buildCockpit(){
  const g=rootGroups.cockpit;
  rod(g,[.447,.893,0],[.398,1.245,0],.023,M.trim);
  rod(g,[.399,1.244,-.23],[.399,1.244,.23],.014,M.chrome);
  rod(g,[.399,1.244,-.26],[.399,1.244,-.19],.021,M.rubber);
  rod(g,[.399,1.244,.19],[.399,1.244,.26],.021,M.rubber);
  const clamp=add(g,new THREE.BoxGeometry(.052,.034,.06),M.black,[.399,1.244,0]);clamp.rotation.z=.04;
  for(const z of [-.17,.17])rod(g,[.399,1.241,z],[.417,1.16,z],.007,M.black);
  rod(g,[.420,1.17,.17],[.429,1.15,.17],.015,M.steel);
}
function buildSeat(){
  const g=rootGroups.seat;
  rod(g,[-.316,.824,0],[-.34,1.044,0],.014,M.chrome);
  rod(g,[-.316,.824,0],[-.316,.903,0],.020,M.frame);
  const saddle=add(g,new THREE.SphereGeometry(1,24,12),M.saddle,[-.368,1.058,0]);
  saddle.scale.set(.168,.027,.083);
  for(let s of [-1,1])curve(g,[[-.49,1.029,.026*s],[-.36,1.027,.046*s],[-.245,1.029,.027*s]],.003,M.chrome);
  add(g,new THREE.BoxGeometry(.07,.014,.075),M.black,[-.34,1.026,0]);
}
function buildDrive(){
  const g=rootGroups.drivetrain, chain=rootGroups.chain;
  // Chainline aligned with rear cassette on negative-Z drive side.
  const cx=-.19,cy=.325,z=-.11;
  disc(g,[cx,cy,-.002],.033,.132,M.chrome);
  for(let s of [-1,1]){
    const side=s*.083;
    const a=s<0?-.48:.48;
    rod(g,[cx,cy,side],[cx+Math.cos(a)*.13,cy+Math.sin(a)*.13,side],.010,M.chrome);
    const pedal=add(g,new THREE.BoxGeometry(.09,.023,.049),M.black,[cx+Math.cos(a)*.13,cy+Math.sin(a)*.13,side+s*.034]);pedal.rotation.z=a;
  }
  ring(g,cx,cy,z,.080,.005,M.steel);
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod(g,[cx,cy,z],[cx+Math.cos(a)*.081,cy+Math.sin(a)*.081,z],.006,M.chrome);}
  const path=[];
  // two arcs linked with common chain-runs, 32 sample points per arc.
  const rearR=.046,frontR=.085;
  // Front (right-hand) semicircle, traveling from upper to lower.
  for(let i=0;i<=24;i++){const a=Math.PI/2-i*Math.PI/24;path.push([cx+frontR*Math.cos(a),cy+frontR*Math.sin(a),z]);}
  // Rear (left-hand) semicircle from lower to upper.
  for(let i=0;i<=24;i++){const a=-Math.PI/2-i*Math.PI/24;path.push([REAR_X+rearR*Math.cos(a),AXLE_Y+rearR*Math.sin(a),z]);}
  path.push(path[0]);
  curve(chain,path,.0027,M.steel);
  // Repeated plates provide visible chain construction at close range.
  for(let i=0;i<60;i++){
    const j=Math.floor(i/60*(path.length-1));
    const p=vec(path[j]);
    add(chain,new THREE.BoxGeometry(.010,.005,.007),i%2?M.chrome:M.hub,p);
  }
}
function buildBrakes(){
  const g=rootGroups.brakes;
  // Rear caliper uses the rear frame's coordinate system; front caliper belongs to front wheel assembly.
  const cal=add(g,new THREE.BoxGeometry(.049,.032,.036),M.black,[REAR_X+.05,AXLE_Y+.04,.068]);cal.rotation.z=.15;
  curve(g,[[-.315,.89,.030],[-.26,.67,.079],[-.39,.48,.087],[REAR_X+.05,AXLE_Y+.04,.07]],.004,M.cable);
  rod(g,[-.31,.83,.03],[-.295,.79,.05],.009,M.steel);
}
function setup(){
  scene=new THREE.Scene();scene.background=new THREE.Color('#dfe8e0');
  camera=new THREE.PerspectiveCamera(37,1,.01,40);camera.position.set(1.38,1.18,2.37);
  scene.add(new THREE.HemisphereLight('#f6fcff','#8b9687',2.2));
  const key=new THREE.DirectionalLight('#fff5e2',2.9);key.position.set(-1.2,4.5,3.6);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2.3;key.shadow.camera.right=2.3;
  key.shadow.camera.top=2.2;key.shadow.camera.bottom=-2.2;key.shadow.bias=-.00025;scene.add(key);
  const fill=new THREE.DirectionalLight('#c7e1ff',1.2);fill.position.set(2.5,2.1,-3);scene.add(fill);
  const floor=add(scene,new THREE.PlaneGeometry(200,200),material('#d9e4d9',1,0),[0,-.006,0],[-Math.PI/2,0,0]);floor.castShadow=false;
  const rimGroup=new THREE.Group();scene.add(rimGroup);
  const disk=add(rimGroup,new THREE.CylinderGeometry(1.1,1.1,.012,80),material('#cad7cd',.95,0),[.02,-.01,0]);disk.receiveShadow=true;disk.castShadow=false;
  scene.add(frontPivot);
  for(const part of BOM){const g=new THREE.Group();g.name=part.id;g.userData={sku:part.sku};if(rearNames.has(part.id))scene.add(g);
    else{g.position.set(-P.x,-P.y,-P.z);frontPivot.add(g);}rootGroups[part.id]=g;}
  buildFrame();wheel(rootGroups.rearWheel,REAR_X,false);wheel(rootGroups.frontWheel,FRONT_X,true);
  buildSeat();buildCockpit();buildDrive();buildBrakes();
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
  renderer.domElement.setAttribute('aria-label','Modelo tridimensional interactivo de bicicleta plegable L-20');
  stageEl.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(.02,.72,0);
  controls.enableDamping=true;controls.dampingFactor=.055;controls.minDistance=.65;controls.maxDistance=6;
  controls.maxPolarAngle=Math.PI*.81;controls.enablePan=false;
  assembly=new AssemblyController({groups:rootGroups,pivot:frontPivot,hingeAxis:axis,updateStatus:({fold,explode})=>{
    const v=Math.round((fold||explode)*100);motion.value=v;document.getElementById('progress').textContent=v+'%';
    modeStatus.textContent=explode>0?'Vista de despiece':fold>0?'En plegado':'Posición de marcha';
    document.getElementById('foldBtn').classList.toggle('active',mode==='fold'&&fold>0);
    document.getElementById('explodeBtn').classList.toggle('active',mode==='explode'&&explode>0);
  }});
  const diagnostics=validateAssembly({groups:rootGroups});
  if(!diagnostics.ok)throw new Error(diagnostics.fail.join('; '));
  const live=document.createElement('span');live.textContent=` WebGL · ${diagnostics.checks}/10 conjuntos · listo`;
  statusEl.innerHTML='<strong>●</strong>';statusEl.append(live);
  bindUI();resize();requestAnimationFrame(tick);
  new ResizeObserver(resize).observe(stageEl);
  renderer.domElement.addEventListener('webglcontextlost',(e)=>{e.preventDefault();running=false;statusEl.textContent='WebGL interrumpido';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{running=true;requestAnimationFrame(tick);statusEl.textContent='WebGL recuperado';});
}
function showToast(msg){clearTimeout(toastTimer);toastEl.textContent=msg;toastEl.classList.add('visible');toastTimer=setTimeout(()=>toastEl.classList.remove('visible'),1800);}
function animateTo(value){animTarget=clamp01(value);}
function bindUI(){
  document.querySelectorAll('.swatch').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.swatch').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
    const f=finishes[btn.dataset.finish];M.frame.color.set(f.color);finishName.textContent=f.name;
    showToast('Acabado · '+f.name);
  }));
  document.getElementById('foldBtn').addEventListener('click',()=>{mode='fold';assembly.setExplode(0);animateTo(assembly.fold>.5?0:1);});
  document.getElementById('explodeBtn').addEventListener('click',()=>{mode='explode';assembly.setFold(0);animateTo(assembly.explode>.5?0:1);});
  document.getElementById('resetBtn').addEventListener('click',()=>{animTarget=null;mode='fold';assembly.setFold(0);assembly.setExplode(0);selected=null;selectPart(null);cameraTo('hero');});
  motion.addEventListener('input',()=>{animTarget=null;const v=Number(motion.value)/100;if(mode==='explode')assembly.setExplode(v);else assembly.setFold(v);});
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b===btn));cameraTo(btn.dataset.view);
  }));
  BOM.forEach(p=>{const b=document.createElement('button');b.className='part';b.dataset.part=p.id;b.innerHTML=`<code>${p.sku}</code><strong>${p.name}</strong><span>↗</span>`;b.addEventListener('click',()=>selectPart(p));partList.append(b);});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')selectPart(null);});
  document.addEventListener('visibilitychange',()=>{active=!document.hidden;});
}
function selectPart(part){
  selected=part?.id||null;document.querySelectorAll('.part').forEach(x=>x.classList.toggle('selected',x.dataset.part===selected));
  if(boxHelper){scene.remove(boxHelper);boxHelper.geometry.dispose();boxHelper.material.dispose();boxHelper=null;}
  if(!part){selectedInfo.textContent='Seleccioná un conjunto para localizarlo en el objeto.';return;}
  selectedInfo.textContent=`${part.sku} · ${part.qty} conjunto · ${part.material}`;
  boxHelper=new THREE.BoxHelper(rootGroups[part.id],0x91a076);boxHelper.material.transparent=true;boxHelper.material.opacity=.68;scene.add(boxHelper);
  const bounds=new THREE.Box3().setFromObject(rootGroups[part.id]);const c=bounds.getCenter(new THREE.Vector3());
  targetLook=c;targetCamera=c.clone().add(new THREE.Vector3(.72,.47,1.12));
}
function cameraTo(name){
  const settings={hero:[[1.38,1.18,2.37],[.02,.70,0]],side:[[.02,.86,2.55],[.02,.71,0]],top:[[.02,2.8,.02],[.02,.65,0]],detail:[[.43,1.13,1.02],[.08,.68,0]]};
  const s=settings[name]||settings.hero;targetCamera=new THREE.Vector3(...s[0]);targetLook=new THREE.Vector3(...s[1]);
}
function resize(){if(!renderer)return;const r=stageEl.getBoundingClientRect();if(r.width<5||r.height<5)return;
  renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}
let previous=0;
function tick(now){if(!running)return;requestAnimationFrame(tick);if(!active)return;
  const dt=Math.min(.05,Math.max(0,(now-previous)/1000||.016));previous=now;
  if(animTarget!==null){let p=mode==='fold'?assembly.fold:assembly.explode;
    p+=(animTarget-p)*Math.min(1,dt*3.6);if(Math.abs(animTarget-p)<.002){p=animTarget;animTarget=null;}
    if(mode==='fold')assembly.setFold(p);else assembly.setExplode(p);
  }
  if(targetCamera){camera.position.lerp(targetCamera,Math.min(1,dt*4));controls.target.lerp(targetLook,Math.min(1,dt*4));
    if(camera.position.distanceTo(targetCamera)<.008){targetCamera=null;targetLook=null;}}
  if(boxHelper)boxHelper.update();
  controls.update();renderer.render(scene,camera);
}
try {setup();}catch(err){console.error(err);statusEl.textContent='No se pudo iniciar 3D: '+String(err.message||err);stageEl.setAttribute('data-error','true');}