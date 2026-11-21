import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const canvas = $('stage');
const status = $('status');
const error = $('error');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const lerp = (a,b,t) => a+(b-a)*t;
const ease = t => {t=clamp(t,0,1);return t*t*(3-2*t);};
const pulse = (t,a,b,c,d) => ease((t-a)/(b-a))*(1-ease((t-c)/(d-c)));
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.45;
} catch(e) {
  console.error('WEBGL_UNAVAILABLE',e);
  error.classList.add('visible');
  throw e;
}
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b171a');
scene.fog = new THREE.FogExp2('#0b171a',0.032);
const camera = new THREE.PerspectiveCamera(40,1,.08,80);
const target = new THREE.Vector3(.18,1.35,0);
const orbit={yaw:.15,elev:.08,radius:5.6,userRadius:null};
function setCamera(){
  const r=orbit.userRadius ?? (window.innerWidth/window.innerHeight <.75 ? 6.55 : 5.45);
  camera.position.set(target.x + Math.sin(orbit.yaw)*Math.cos(orbit.elev)*r,target.y+Math.sin(orbit.elev)*r,target.z+Math.cos(orbit.yaw)*Math.cos(orbit.elev)*r);
  camera.lookAt(target);
}
function resize(){
  const w=innerWidth,h=innerHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
  setCamera();
}
window.addEventListener('resize',resize,{passive:true});
scene.add(new THREE.HemisphereLight('#b2cfce','#564c3f',2.1));
const key = new THREE.DirectionalLight('#ffe2b5',3.6);
key.position.set(-2.8,6,5);key.castShadow=true;
key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;
key.shadow.camera.top=6;key.shadow.camera.bottom=-4;
key.shadow.normalBias=.025;scene.add(key);
const rim=new THREE.DirectionalLight('#77bcb0',2.2);rim.position.set(2.4,4,-3.2);scene.add(rim);
const eyeLight=new THREE.PointLight('#edbb73',1.2,3);eyeLight.position.set(-.5,2.85,1);scene.add(eyeLight);

const MAT = {
 brass:new THREE.MeshStandardMaterial({color:'#be975d',metalness:.77,roughness:.30}),
 edge:new THREE.MeshStandardMaterial({color:'#e3c18a',metalness:.82,roughness:.24}),
 dark:new THREE.MeshStandardMaterial({color:'#17252a',metalness:.60,roughness:.35}),
 enamel:new THREE.MeshStandardMaterial({color:'#254249',metalness:.55,roughness:.36}),
 bone:new THREE.MeshStandardMaterial({color:'#ded5be',metalness:.24,roughness:.46}),
 oxide:new THREE.MeshStandardMaterial({color:'#46685f',metalness:.48,roughness:.57}),
 recess:new THREE.MeshStandardMaterial({color:'#0b171d',metalness:.24,roughness:.65}),
 glow:new THREE.MeshStandardMaterial({color:'#ffd28a',emissive:'#d98934',emissiveIntensity:2.1,metalness:.1,roughness:.25}),
 floor:new THREE.MeshStandardMaterial({color:'#18292b',metalness:.45,roughness:.68}),
 stone:new THREE.MeshStandardMaterial({color:'#304348',metalness:.35,roughness:.68})
};
function mesh(g,m,parent,x=0,y=0,z=0,name=''){
  const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;
  if(name)o.name=name;parent.add(o);return o;
}
function silhouette(points,depth=.12,bevel=.027){
  const sh=new THREE.Shape();sh.moveTo(points[0][0],points[0][1]);
  for(let i=1;i<points.length;i++)sh.lineTo(points[i][0],points[i][1]);
  sh.closePath();
  const geom=new THREE.ExtrudeGeometry(sh,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:5});
  geom.translate(0,0,-depth/2);
  geom.computeVertexNormals();return geom;
}
function plate(points,m,parent,z,depth=.12,name=''){
  return mesh(silhouette(points,depth),m,parent,0,0,z,name);
}
function ring(parent,x,y,z,r,material=MAT.edge,tube=.018){
  return mesh(new THREE.TorusGeometry(r,tube,8,32),material,parent,x,y,z);
}
function rivet(parent,x,y,z,r=.037){
  const disc=mesh(new THREE.SphereGeometry(r,12,8),MAT.edge,parent,x,y,z);
  disc.scale.z=.35;return disc;
}
function strand(parent,pts,mat=MAT.oxide,r=.013){
  const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));
  return mesh(new THREE.TubeGeometry(c,32,r,5,false),mat,parent);
}
function gear(parent,x,y,z,r=0.2){
  const grp=new THREE.Group();grp.position.set(x,y,z);grp.name='Gear';
  parent.add(grp);
  const pts=[];
  for(let i=0;i<24;i++){let a=i*TAU/24,rr=r*(i%3===0?1.06:.89);pts.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  plate(pts,MAT.brass,grp,0,.055);
  ring(grp,0,0,.07,r*.59,MAT.dark,.021);
  ring(grp,0,0,.085,r*.28,MAT.edge,.018);
  return grp;
}
function stage(){
  const floor=mesh(new THREE.CircleGeometry(8,84),MAT.floor,scene,0,-.11,0);
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.castShadow=false;
  const disk=mesh(new THREE.CylinderGeometry(2.1,2.23,.10,80),MAT.dark,scene,.12,-.05,0);
  disk.receiveShadow=true;
  const rim1=mesh(new THREE.TorusGeometry(2.09,.017,8,96),MAT.brass,scene,.12,.013,0);
  rim1.rotation.x=Math.PI/2;
  const circle=new THREE.Group();scene.add(circle);
  for(let i=0;i<36;i++){
    let a=i*TAU/36;
    const mark=mesh(new THREE.BoxGeometry(i%3===0?.11:.05,.005,.014),MAT.oxide,circle,Math.cos(a)*1.93,.019,Math.sin(a)*1.93);
    mark.rotation.y=-a;mark.castShadow=false;
  }
  const back=new THREE.Mesh(new THREE.PlaneGeometry(30,14),new THREE.MeshBasicMaterial({color:'#0e1c1f'}));
  back.position.set(0,4,-6);scene.add(back);
}
stage();

const actor = new THREE.Group();
actor.name='NEBULO_ROOT';actor.position.set(-.53,0,.11);
actor.userData={assetId:'nebulo-010',creator:'PROMETEO Estudio 3D',type:'articulated_automaton',orientation:'+Z',unit:'meter',license:'original-source'};
scene.add(actor);
// The figure's readable silhouette is drawn as authored irregular extruded contours,
// never a finished assembly of boxes or capsule body parts.
plate([[-.35,.87],[-.42,1.27],[-.49,1.60],[-.46,1.80],[-.30,1.95],[.30,1.95],[.47,1.78],[.48,1.59],[.39,1.24],[.30,.87],[0,.79]],MAT.brass,actor,0,.27,'Torso_cast_shell');
plate([[-.28,.98],[-.37,1.30],[-.39,1.60],[-.32,1.78],[-.12,1.88],[.12,1.88],[.32,1.78],[.39,1.60],[.32,1.30],[.26,.98],[0,.88]],MAT.enamel,actor,.165,.09,'Torso_enamel');
plate([[-.27,1.72],[-.08,1.81],[.08,1.81],[.27,1.72],[.19,1.49],[0,1.41],[-.19,1.49]],MAT.dark,actor,.245,.04,'Torso_chest_inlay');
plate([[-.08,1.47],[0,1.54],[.08,1.47],[.08,1.31],[0,1.23],[-.08,1.31]],MAT.brass,actor,.282,.05);
for(const x of [-.34,.34])for(const y of [1.30,1.70])rivet(actor,x,y,.265,.030);
strand(actor,[[-.28,1.26,.27],[-.12,1.17,.28],[.10,1.16,.28],[.28,1.26,.27]],MAT.edge,.012);
for(let i=0;i<3;i++){
 const y=.89+i*.064;
 plate([[-.31,y],[-.12,y+.025],[.13,y+.025],[.31,y]],i===1?MAT.oxide:MAT.brass,actor,.12,.043);
}
// Working escapement: nested counter-rotating gear outlines, bridge and heart aperture.
const escapement=new THREE.Group();escapement.name='Escapement';escapement.position.set(0,1.57,.285);actor.add(escapement);
ring(escapement,0,0,0,.15,MAT.edge,.021);
const heart=mesh(new THREE.IcosahedronGeometry(.087,1),MAT.glow,escapement,0,0,.035,'Heart_lamp');
heart.scale.z=.55;
const wheelL=gear(actor,-.19,1.14,.284,.091),wheelR=gear(actor,.20,1.12,.284,.07);
plate([[-.19,1.03],[.20,1.03],[.28,.94],[.18,.83],[-.17,.83],[-.29,.94]],MAT.dark,actor,.16,.07,'Waist_escutcheon');
for(let i=0;i<2;i++){
 const sign=i===0?-1:1,x=sign*.205;
 const leg=new THREE.Group();leg.name=sign<0?'LEFT_LEG':'RIGHT_LEG';actor.add(leg);
 plate([[x-.14,.86],[x+.11,.86],[x+.12,.59],[x+.08,.42],[x+.09,.24],[x-.15,.24],[x-.11,.50]],MAT.brass,leg,.005,.18,'Shin_cast');
 plate([[x-.075,.75],[x+.065,.73],[x+.07,.55],[x+.025,.35],[x-.08,.35]],MAT.dark,leg,.125,.035);
 ring(leg,x-.012,.60,.175,.075,MAT.edge,.016);
 plate([[x-.19,.26],[x+.10,.26],[x+.23,.09],[x+.19,.047],[x-.23,.047],[x-.26,.11]],MAT.dark,leg,.13,.22,'Heel_foot_cast');
 plate([[x-.19,.10],[x+.18,.10],[x+.16,.06],[x-.20,.06]],MAT.brass,leg,.248,.025);
 for(let s of [-1,1])rivet(leg,x+s*.06,.50,.172,.020);
}
const neck=new THREE.Group();neck.name='NECK_SERVO';neck.position.set(0,2.02,.015);actor.add(neck);
for(let i=0;i<4;i++){
 const y=.018+i*.054;
 const obj=mesh(new THREE.CylinderGeometry(.18-i*.008,.17-i*.005,.04,14),i%2===0?MAT.brass:MAT.dark,neck,0,y,.015);
 obj.rotation.z=.12;
}
// Sculpted faceplate with engraved slits, independent servo gaze and brows.
const head=new THREE.Group();head.name='HEAD_GAZE';head.position.set(0,2.12,.13);neck.add(head);
plate([[-.29,.01],[-.42,.16],[-.43,.48],[-.33,.73],[-.12,.85],[.13,.83],[.34,.69],[.43,.46],[.38,.17],[.19,-.02],[0,-.085]],MAT.brass,head,0,.225,'Mask_outer_cast');
plate([[-.28,.075],[-.36,.22],[-.34,.52],[-.24,.67],[-.08,.75],[.15,.73],[.29,.59],[.35,.41],[.29,.20],[.15,.045],[.01,-.014]],MAT.bone,head,.14,.058,'Mask_porcelain');
plate([[-.29,.46],[-.15,.53],[.13,.55],[.29,.47],[.29,.40],[-.29,.40]],MAT.dark,head,.18,.045,'Eye_arch');
const eyes=[];
for(let i=0;i<2;i++){
 const x=i===0?-.16:.16;
 const g=new THREE.Group();g.position.set(x,.45,.227);g.name=i===0?'EYE_LEFT':'EYE_RIGHT';head.add(g);
 plate([[-.115,.01],[-.055,.061],[.045,.067],[.119,.018],[.078,-.051],[-.066,-.046]],MAT.glow,g,0,.018);
 const pupil=plate([[-.028,.035],[.01,.041],[.039,.001],[.015,-.037],[-.022,-.031]],MAT.recess,g,.029,.019,'Iris_mechanical');
 ring(g,0,.005,.051,.044,MAT.edge,.008);
 const brow=new THREE.Group();brow.name='Brow_servo';brow.position.set(0,.115,.008);g.add(brow);
 plate([[-.13,-.012],[-.016,.013],[.13,0],[.12,.027],[-.012,.040],[-.13,.018]],MAT.brass,brow,0,.019);
 eyes.push({g,pupil,brow});
}
plate([[-.23,.14],[-.13,.20],[.13,.20],[.24,.14],[.17,.11],[-.15,.11]],MAT.dark,head,.185,.024,'Mouth_grille');
for(let i=-2;i<=2;i++)mesh(new THREE.BoxGeometry(.013,.042,.013),MAT.edge,head,i*.06,.156,.225);
for(const sign of [-1,1]){
 const x=sign*.385;
 ring(head,x,.35,.14,.085,MAT.edge,.022);
 rivet(head,x,.35,.185,.032);
}
strand(head,[[-.06,.82,.04],[0,1.02,.05],[.06,1.055,.07]],MAT.brass,.012);
const crown=mesh(new THREE.IcosahedronGeometry(.052,0),MAT.glow,head,.06,1.075,.06,'Antenna_beacon');

// Arms are hierarchical revolute joints, using custom extruded hard-surface parts.
// Angles come from 2-bone IK. These named pivots survive GLB export.
function createArm(side){
 const right=side===1,L1=.80,L2=.80;
 const shoulder=new THREE.Group();shoulder.name=right?'RIGHT_SHOULDER':'LEFT_SHOULDER';
 shoulder.position.set(side*.49,1.81,.16);actor.add(shoulder);
 const jointOuter=mesh(new THREE.CylinderGeometry(.155,.155,.105,28),MAT.dark,shoulder,0,0,0);
 jointOuter.rotation.x=Math.PI/2;
 ring(shoulder,0,0,.08,.125,MAT.edge,.026);rivet(shoulder,0,0,.119,.038);
 const upper=[[.045,-.115],[.17,-.175],[.40,-.14],[L1-.07,-.075],[L1-.025,-.015],[L1-.09,.09],[.43,.153],[.17,.164],[.045,.09]];
 plate(upper,MAT.brass,shoulder,0,.135,right?'RIGHT_UPPER_ARM':'LEFT_UPPER_ARM');
 plate([[.19,-.093],[.41,-.078],[.58,-.042],[.54,.055],[.39,.076],[.19,.057]],MAT.enamel,shoulder,.093,.026);
 strand(shoulder,[[.09,-.105,.095],[.30,-.14,.11],[.53,-.11,.1],[.72,-.035,.08]],MAT.edge,.009);
 const elbow=new THREE.Group();elbow.name=right?'RIGHT_ELBOW':'LEFT_ELBOW';elbow.position.set(L1,0,0);shoulder.add(elbow);
 mesh(new THREE.CylinderGeometry(.115,.115,.11,24),MAT.dark,elbow,0,0,0).rotation.x=Math.PI/2;
 ring(elbow,0,0,.085,.099,MAT.edge,.019);
 const lower=[[.05,-.077],[.17,-.12],[.43,-.109],[L2-.07,-.095],[L2-.015,-.011],[L2-.075,.087],[.42,.117],[.18,.097],[.05,.065]];
 plate(lower,MAT.oxide,elbow,.0,.124,right?'RIGHT_FOREARM':'LEFT_FOREARM');
 plate([[.15,-.06],[.42,-.055],[.62,-.038],[.63,.025],[.43,.057],[.16,.049]],MAT.brass,elbow,.087,.019);
 const wrist=new THREE.Group();wrist.name=right?'RIGHT_WRIST':'LEFT_WRIST';wrist.position.set(L2,0,.01);elbow.add(wrist);
 ring(wrist,0,0,.065,.065,MAT.edge,.017);
 plate([[.024,-.090],[.115,-.104],[.17,-.062],[.18,.067],[.115,.10],[.024,.09]],MAT.dark,wrist,.035,.08,'Palm');
 const fingers=[];
 for(let s of [-1,1]){
   const finger=new THREE.Group();finger.position.set(.15,s*.087,.07);wrist.add(finger);
   finger.name=s<0?'LOWER_PINCER':'UPPER_PINCER';
   plate([[0,-.021],[.07,-.04],[.16,-.032],[.21,.004],[.13,.036],[.054,.026]],MAT.edge,finger,0,.035);
   fingers.push({finger,s});
 }
 return {shoulder,elbow,wrist,fingers,L1,L2,side,rest:{x:right?.38:-.93,y:right?1.20:1.20}};
}
const rightArm=createArm(1),leftArm=createArm(-1);
const rootPos=actor.position;
// World-space 2-bone IK with outward elbow preference, no invented walking clips.
function solveIK(arm,wx,wy,relax=.2){
 const x=wx-rootPos.x, y=wy-rootPos.y;
 const sx=arm.shoulder.position.x,sy=arm.shoulder.position.y;
 let dx=x-sx,dy=y-sy;
 const d=clamp(Math.hypot(dx,dy),.05,arm.L1+arm.L2-.006);
 const bearing=Math.atan2(dy,dx);
 const alpha=Math.acos(clamp((arm.L1*arm.L1+d*d-arm.L2*arm.L2)/(2*arm.L1*d),-1,1));
 const shoulderAngle=bearing+arm.side*alpha;
 const ex=sx+Math.cos(shoulderAngle)*arm.L1,ey=sy+Math.sin(shoulderAngle)*arm.L1;
 const foreAngle=Math.atan2(y-ey,x-ex)-shoulderAngle;
 arm.shoulder.rotation.z=shoulderAngle;arm.elbow.rotation.z=foreAngle;
 arm.wrist.rotation.z=clamp(-foreAngle*.23,-.32,.32);
}
function updateGripper(arm,closed){
 for(const {finger,s} of arm.fingers)finger.rotation.z=s*(closed?-.18:.22);
}
// Separate artifact: the lantern seed and its receiving dock.
const dock=new THREE.Group();dock.name='DISPLAY_PEDESTAL';dock.position.set(1.13,0,-.09);scene.add(dock);
plate([[-.31,.08],[-.24,.20],[-.18,.61],[-.26,.70],[.25,.70],[.17,.60],[.23,.20],[.30,.08]],MAT.stone,dock,0,.36,'Dock_cast_stone');
plate([[-.29,.70],[.31,.70],[.31,.75],[-.29,.75]],MAT.brass,dock,.19,.12,'Cradle_lip');
plate([[-.11,.32],[.11,.32],[.15,.43],[-.15,.43]],MAT.dark,dock,.218,.038);
ring(dock,0,.41,.259,.067,MAT.edge,.014);
const orb=new THREE.Group();orb.name='MEMORY_SEED';orb.position.set(1.13,.94,.23);scene.add(orb);
const gem=mesh(new THREE.LatheGeometry([
 new THREE.Vector2(0,-.205),new THREE.Vector2(.067,-.17),new THREE.Vector2(.12,-.09),
 new THREE.Vector2(.143,.015),new THREE.Vector2(.100,.137),new THREE.Vector2(.027,.214),
 new THREE.Vector2(0,.24)],12,0,TAU),MAT.glow,orb,0,0,0,'Seed_faceted_surface');
for(let i=0;i<6;i++){
 const a=i*TAU/6,wire=new THREE.Group();wire.rotation.y=a;orb.add(wire);
 strand(wire,[[0,-.195,.03],[.11,-.075,.018],[.123,.025,.01],[.085,.14,.009],[0,.228,.01]],MAT.edge,.007);
}
const light= new THREE.PointLight('#eeb36e',.8,1.6);orb.add(light);
const baseSeed=new THREE.Vector3(1.13,.94,.23);
const tmp=new THREE.Vector3();const aim=new THREE.Vector3();
const state={kind:'idle',t:0,last:0,eyes:0,lastStatement:''};
function announce(message){status.textContent=message;}
function perform(kind){
 state.kind=kind;state.t=0;
 document.querySelectorAll('.dock button').forEach(b=>b.setAttribute('aria-pressed','false'));
 const b=$(kind);if(b)b.setAttribute('aria-pressed','true');
 const messages={observe:'Nébulo te observa con curiosidad',react:'Nébulo se sorprende',offer:'Nébulo ofrece su recuerdo'};
 announce(messages[kind]||'Nébulo descansa');
}
$('observe').addEventListener('click',()=>perform('observe'));
$('react').addEventListener('click',()=>perform('react'));
$('offer').addEventListener('click',()=>perform('offer'));
$('reset').addEventListener('click',()=>{
 state.kind='idle';state.t=0;orbit.yaw=.15;orbit.elev=.08;orbit.userRadius=null;setCamera();
 announce('Nébulo descansa · arrastrá para examinar');closeMore();
});
const more=$('more');
const menu=$('menu');
function closeMore(){more.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const yes=more.classList.toggle('open');menu.setAttribute('aria-expanded',String(yes));});
$('front').addEventListener('click',()=>{orbit.yaw=0;orbit.elev=.02;setCamera();closeMore();});
$('side').addEventListener('click',()=>{orbit.yaw=Math.PI*.49;orbit.elev=.04;setCamera();closeMore();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMore();});
function animateCharacter(time,dt){
 const t=(state.t+=dt),idle=reducedMotion?0:Math.sin(time*1.5);
 let wx=.34,wy=1.18,close=0,seedHeld=false,lookX=.02,tilt=.02;
 if(state.kind==='offer'){
   const reach=ease(t/1.55),lift=ease((t-2.1)/1.2),returnSeed=ease((t-5.65)/1.35),withdraw=ease((t-7.3)/1.05);
   const rest={x:.34,y:1.18},cradle={x:1.13,y:.94},present={x:.75,y:1.56};
   const gripped=lerp(rest.x,cradle.x,reach),grippedY=lerp(rest.y,cradle.y,reach);
   wx=lerp(gripped,present.x,lift);wy=lerp(grippedY,present.y,lift);
   wx=lerp(wx,cradle.x,returnSeed);wy=lerp(wy,cradle.y,returnSeed);
   wx=lerp(wx,rest.x,withdraw);wy=lerp(wy,rest.y,withdraw);
   close=pulse(t,1.55,1.9,7.02,7.34);
   seedHeld=t>1.86&&t<7.15;
   lookX=clamp((wx+.3)*.18,-.1,.24);
   tilt=seedHeld?.075:.015;
   if(t>8.7){state.kind='idle';state.t=0;announce('El tesoro volvió a su base');}
 }else if(state.kind==='react'){
   const shock=pulse(t,.08,.28,2.3,2.75);
   wx=.34+.22*shock;wy=1.18+.48*shock;
   lookX=-.13*shock;tilt=-.20*shock;
   if(t>3){state.kind='idle';state.t=0;announce('Nébulo vuelve a observar');}
 }else if(state.kind==='observe'){
   wx=.34+.14*ease(t/1.2);wy=1.18+.24*ease(t/1.2);
   lookX=clamp(-orbit.yaw*.32,-.27,.27);
   tilt=.055;
   if(t>5.2){state.kind='idle';state.t=0;announce('Arrastrá para mirar desde otro ángulo');}
 }
 solveIK(rightArm,wx,wy);
 solveIK(leftArm,-1.10+.025*idle,1.17+.023*idle);
 updateGripper(rightArm,close>.55);updateGripper(leftArm,true);
 rightArm.wrist.updateWorldMatrix(true,false);
 rightArm.wrist.getWorldPosition(tmp);
 if(seedHeld){
   orb.position.copy(tmp);orb.position.z+=.10;
   orb.position.y+=.035;
 }else orb.position.copy(baseSeed);
 orb.rotation.y +=dt*(seedHeld?.35:.12);
 head.rotation.y=lerp(head.rotation.y,lookX+.035*idle,clamp(dt*5,0,1));
 head.rotation.z=lerp(head.rotation.z,tilt+.014*idle,clamp(dt*5,0,1));
 head.rotation.x=.025+Math.sin(time*.76)*.016;
 const startled=state.kind==='react'?pulse(t,.08,.26,2.2,2.6):0;
 const blink=(Math.sin(time*1.8+1.2)>.991)? .15:1;
 for(let i=0;i<eyes.length;i++){
   const eye=eyes[i];
   eye.g.scale.y=lerp(eye.g.scale.y,startled?1.5:blink,clamp(dt*9,0,1));
   eye.pupil.position.x=Math.sin(time*.4+i*.2)*.013 + lookX*.064;
   eye.brow.rotation.z=(i===0?1:-1)*(.055+startled*.27);
 }
 wheelL.rotation.z+=dt*.37;wheelR.rotation.z-=dt*.45;
 escapement.rotation.z=Math.sin(time*2.2)*.08;
 heart.scale.setScalar(1+Math.sin(time*3.1)*.055);
 light.intensity=.75+.2*Math.sin(time*2.8);
 crown.material.emissiveIntensity=1.5+.25*Math.sin(time);
}
const pointers=new Map();let gesture=null;
function pinchDist(){const a=[...pointers.values()];return Math.hypot(a[1].x-a[0].x,a[1].y-a[0].y)}
canvas.addEventListener('pointerdown',e=>{
 if(e.pointerType==='mouse'&&e.button!==0)return;
 canvas.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2)gesture={dist:pinchDist(),radius:orbit.userRadius??(innerWidth/innerHeight<.75?6.55:5.45)};
},{passive:true});
canvas.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;
 const prev=pointers.get(e.pointerId);
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2){
   const d=pinchDist();
   if(gesture&&d>12){orbit.userRadius=clamp(gesture.radius*gesture.dist/d,3.6,9.6);setCamera();}
 }else if(pointers.size===1){
   const dx=e.clientX-prev.x,dy=e.clientY-prev.y;
   orbit.yaw-=dx*.0065;orbit.elev=clamp(orbit.elev+dy*.006,-.23,.52);
   setCamera();
 }
},{passive:true});
function removePointer(e){
 pointers.delete(e.pointerId);
 if(pointers.size<2)gesture=null;
 if(pointers.size===1) {
   const one=[...pointers.entries()][0];
   pointers.set(one[0],{...one[1]});
 }
}
canvas.addEventListener('pointerup',removePointer);
canvas.addEventListener('pointercancel',removePointer);
canvas.addEventListener('lostpointercapture',removePointer);
canvas.addEventListener('wheel',e=>{
 e.preventDefault();orbit.userRadius=clamp((orbit.userRadius??5.6)*Math.exp(e.deltaY*.001),3.6,9.6);setCamera();
},{passive:false});
// Export the actually authored hierarchy as binary glTF, not a placeholder link.
$('export').addEventListener('click',async()=>{
 closeMore();announce('Preparando el modelo 3D…');
 try{
  const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');
  const asset=new THREE.Group();asset.name='NEBULO_CHARACTER_EXPORT';
  asset.add(actor.clone(true));asset.add(orb.clone(true));
  asset.userData={author:'PROMETEO',rights:'Original, no imported third-party model',unit:'meter',version:'1.0.0',front:'+Z',note:'Pivot names: RIGHT_SHOULDER, RIGHT_ELBOW, RIGHT_WRIST, HEAD_GAZE, LEFT_SHOULDER, LEFT_ELBOW'};
  const binary=await new Promise((resolve,reject)=>new GLTFExporter().parse(asset,resolve,reject,{binary:true,onlyVisible:true,trs:true}));
  const url=URL.createObjectURL(new Blob([binary],{type:'model/gltf-binary'}));
  const a=document.createElement('a');a.href=url;a.download='NEBULO-automata-v1.glb';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
  announce('Modelo GLB exportado · jerarquía de pivotes incluida');
 }catch(e){console.error('GLB_EXPORT_FAILED',e);announce('No se pudo exportar el GLB en este navegador');}
});
resize();
let lastTime=performance.now();
function loop(ms){
 const dt=clamp((ms-lastTime)/1000,0,.045);lastTime=ms;
 animateCharacter(ms/1000,dt);
 renderer.render(scene,camera);
 requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.addEventListener('pagehide',()=>{renderer.dispose();},{once:true});
