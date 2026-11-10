import * as THREE from "three";
import {createAvatar,palette} from "./avatar.js";
import {dressCharacter} from "./character-art.js";
import {dressWorld} from "./world-atelier.js";
import {advanceMelody} from "./melody.mjs";
import {advancePostal,readPostal,writePostal,postalHint,POSTAL_NAMES} from "./postal-quest.mjs";
import {addPostOffice} from "./postal-world.js";
import {playBell,playPostal} from "./sound-toys.mjs";
import {buildWorld} from "./world.js";
import {clamp,nearestInteractable,moveWithCollisions,readSave,writeSave,getProgress} from "./logic.mjs";
const $=id=>document.getElementById(id);
const storage=(()=>{try{return window.localStorage}catch{return null}})(),save=readSave(storage),scene=new THREE.Scene();
scene.background=new THREE.Color("#bcd7c9");scene.fog=new THREE.Fog("#bcd7c9",26,48);
const canvas=$("scene");
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,matchMedia("(pointer:coarse)").matches?1.25:1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;}
catch(e){$("loading").classList.add("hidden");$("fatal").classList.remove("hidden");throw e;}
const camera=new THREE.PerspectiveCamera(58,1,.1,100);
scene.add(new THREE.HemisphereLight("#fff3db","#657d69",2.1));
const sun=new THREE.DirectionalLight("#fff0ce",3.3);sun.position.set(-8,14,7);sun.castShadow=true;sun.shadow.mapSize.set(matchMedia("(pointer:coarse)").matches?512:1024,matchMedia("(pointer:coarse)").matches?512:1024);sun.shadow.camera.left=-20;sun.shadow.camera.right=20;sun.shadow.camera.top=20;sun.shadow.camera.bottom=-20;sun.shadow.normalBias=.025;scene.add(sun);
const world=dressWorld(scene,buildWorld(scene));
const postWorld=addPostOffice(scene,world);
for(const n of world.npc)dressCharacter(n.avatar,n.id);
const avatar=createAvatar({color:save.color,hat:save.hat});avatar.root.position.set(0,0,4);avatar.root.rotation.y=Math.PI;scene.add(avatar.root);dressCharacter(avatar,"traveler");
const input={keys:new Set(),joyX:0,joyY:0,pointer:null,points:new Map(),pinch:null};
const state={yaw:0,pitch:.33,distance:9.1,velocity:0,sitting:false,holding:false,danceUntil:0,waveUntil:0,target:null,menu:false,toastUntil:0,visited:new Set(save.visited),unlocked:save.unlocked,color:save.color,hat:save.hat,melodyStep:0,melodyComplete:save.visited.includes("bells"),postal:readPostal(storage)};
postWorld.setState(state.postal);
world.setMelodyState(0,state.melodyComplete);
let clock=new THREE.Clock(),npcLabels=[];
const ui={action:$("action"),bubble:$("bubble"),toast:$("toast")};
function persist(){writeSave(storage,{color:state.color,hat:state.hat,visited:[...state.visited],unlocked:state.unlocked});writePostal(storage,state.postal)}
function updatePostHint(){$("postHint").textContent=postalHint(state.postal)}
updatePostHint();
function toast(text,seconds=3){ui.toast.textContent=text;ui.toast.classList.remove("hidden");state.toastUntil=performance.now()+seconds*1000}
function showBubble(who,speech){$("speaker").textContent=who;$("speech").textContent=speech;ui.bubble.classList.remove("hidden")}
function hideBubble(){ui.bubble.classList.add("hidden")}
$("bubbleClose").addEventListener("click",hideBubble);
function buildStylePanel(){
 $("swatches").innerHTML="";palette.forEach((color,i)=>{let b=document.createElement("button");b.className="swatch"+(state.color===i?" chosen":"");b.style.background=color;b.setAttribute("aria-label","Color "+(i+1));b.onclick=()=>{state.color=i;avatar.recolor(i);persist();buildStylePanel()};$("swatches").append(b)});
 $("hatPicker").innerHTML="";["none","beret","cap","crown"].forEach((hat,i)=>{let b=document.createElement("button");b.textContent=["Sin gorro","Boina","Visera","Corona"][i];b.className=state.hat===hat?"chosen":"";b.disabled=hat==="crown"&&!state.unlocked;b.onclick=()=>{state.hat=hat;avatar.setHat(hat);persist();buildStylePanel()};$("hatPicker").append(b)});
}
function togglePanel(id){const box=$(id),was=box.classList.contains("hidden");for(const x of ["stylePanel","helpPanel","emoteTray"])$(x).classList.add("hidden");if(was){box.classList.remove("hidden");hideBubble()}state.menu=was&&id!=="emoteTray";}
$("styleToggle").onclick=()=>{buildStylePanel();togglePanel("stylePanel")};
$("helpToggle").onclick=()=>togglePanel("helpPanel");
$("styleClose").onclick=()=>{togglePanel("stylePanel")};
$("helpClose").onclick=()=>{togglePanel("helpPanel")};
$("emotes").onclick=()=>togglePanel("emoteTray");
$("wave").onclick=()=>{state.waveUntil=performance.now()+2600;state.danceUntil=0;$("emoteTray").classList.add("hidden");state.menu=false;toast("¡Hola, plaza!")};
$("dance").onclick=()=>{state.danceUntil=performance.now()+5000;state.waveUntil=0;$("emoteTray").classList.add("hidden");state.menu=false;toast("¡A bailar!")};
$("reset").onclick=()=>{avatar.root.position.set(0,0,4);state.sitting=false;hideBubble();$("helpPanel").classList.add("hidden");state.menu=false;state.yaw=0;toast("Volviste a la entrada")};
$("look").onclick=()=>{state.yaw=0;state.pitch=.33;state.distance=9.1};
function act(){const target=state.target;if(!target||state.menu)return;target.activate?.();updateAction();}
ui.action.onclick=act;
function updateAction(){
 const t=state.sitting?world.interactables.find(x=>x.id==="bench"):nearestInteractable(avatar.root.position,world.interactables);
 state.target=t??null;
 if(t&&!state.menu){ui.action.innerHTML=t.label+'<small>'+t.subtitle+'</small>';ui.action.classList.remove("hidden")}
 else ui.action.classList.add("hidden");
}
function handleAction(item){
 if(item.kind==="postbox"){
  const outcome=advancePostal(state.postal,"postbox");state.postal=outcome.postal;postWorld.setState(state.postal);
  if(outcome.status==="STARTED"){playPostal("start");toast("✉ ¡Tres cartas! Empezá por Mora.",5);}
  else if(outcome.status==="REMINDER")toast("Tu próxima carta es para "+POSTAL_NAMES[outcome.next],3);
  else toast("✉ Ya entregaste las tres cartas. ¡Gracias!",4);
 }else if(item.kind==="npc"){
  state.visited.add(item.id);
  const outcome=advancePostal(state.postal,item.id);
  state.postal=outcome.postal;postWorld.setState(state.postal);
  if(outcome.status==="DELIVERED"){playPostal("delivered");showBubble(item.name+" · NPC","¡Esta carta es para mí! Qué lindo que alguien haya pensado en escribirme.");toast("✉ Entrega "+state.postal.step+"/3 · Ahora "+POSTAL_NAMES[outcome.next],4);}
  else if(outcome.status==="COMPLETED"){playPostal("done");showBubble(item.name+" · NPC","¡Llegó la última carta! La plaza se siente un poquito más cerca. Gracias por caminarla.");toast("✴ ¡Reparto completo! Tu pajarito lleva un sello dorado.",6);state.danceUntil=performance.now()+2500;}
  else{showBubble(item.name+" · NPC",item.speech);if(outcome.status==="WRONG_RECIPIENT")toast("✉ Esta carta es para "+POSTAL_NAMES[outcome.next],3);else toast("Conociste a "+item.name,1.8);}
 }else if(item.kind==="bell"){
  playBell(item.tone);
  const result=advanceMelody(state.melodyStep,item.tone,state.melodyComplete);
  state.melodyStep=result.step;state.melodyComplete=result.completed;
  world.setMelodyState(state.melodyStep,state.melodyComplete);
  if(result.status==="MISS")toast("Secuencia: ámbar → verde → coral. Volvé a empezar.",4);
  else if(result.status==="COMPLETE"){state.visited.add("bells");state.danceUntil=performance.now()+3600;toast("♪ ¡La plaza tiene melodía! Descubriste el carillón.",5)}
  else if(result.status==="HIT")toast("♪ "+state.melodyStep+" / 3 · Seguí la melodía");
  else toast("♪ Ya descubriste esta melodía.");
 }else if(item.id==="bench"){
  state.sitting=!state.sitting;
  if(state.sitting){avatar.root.position.set(item.seatX,0,item.seatZ);avatar.root.rotation.y=item.yaw??0;toast("Un ratito de descanso");hideBubble()}
  else{avatar.root.position.z+=.95;toast("De vuelta a caminar")}
 }else if(item.id==="coffee"){state.holding=!state.holding;if(state.holding)state.visited.add("cafe");toast(state.holding?"¡Un café para recorrer la plaza!":"Guardaste la taza")}
 else if(item.id==="stage"){state.danceUntil=performance.now()+7000;state.visited.add("stage");toast("La pista se ilumina · ¡a bailar!")}
 else if(item.id==="wardrobe"){buildStylePanel();$("stylePanel").classList.remove("hidden");state.menu=true}
 const p=getProgress(state.visited);
 if(!state.unlocked&&p.unlocked){state.unlocked=true;toast("✴ ¡Descubriste tres actividades! Corona desbloqueada.",5)}
 $("progressText").textContent=state.unlocked?"✴ Corona desbloqueada":p.count+" / 3 encuentros para una sorpresa";
 updatePostHint();
 persist();
}
for(const item of world.interactables)item.activate=()=>handleAction(item);
if(new URLSearchParams(location.search).has("qa")){
 window.__PATIO_TEST__={
  approach(id){const item=world.interactables.find(x=>x.id===id);if(!item)return null;
   state.sitting=false;state.menu=false;hideBubble();
   for(const p of ["stylePanel","helpPanel","emoteTray"])$(p).classList.add("hidden");
   avatar.root.position.set(item.x,0,item.z+1.5);updateAction();return state.target?.id??null;
  },
  interact(){act();return {target:state.target?.id??null,sitting:state.sitting,holding:state.holding,dialog:!ui.bubble.classList.contains("hidden"),visited:[...state.visited],unlocked:state.unlocked}},
  probe(){return {actionVisible:!ui.action.classList.contains("hidden"),dialog:!ui.bubble.classList.contains("hidden"),htmlScroll:[document.documentElement.scrollWidth,document.documentElement.scrollHeight]}},
  postal(){return {...state.postal,hint:postalHint(state.postal)}}
 };
}

function initNPCLabels(){
 for(const p of world.npc){const el=document.createElement("div");el.className="nameplate";el.innerHTML=p.name+" <small>· NPC</small>";$("nameplates").append(el);npcLabels.push({p,el})}
}
initNPCLabels();
function updateLabels(){for(const {p,el} of npcLabels){const d=avatar.root.position.distanceTo(p.root.position);if(d>12){el.style.display="none";continue}const pos=p.root.position.clone().add(new THREE.Vector3(0,3.05,0)).project(camera);const x=(pos.x*.5+.5)*innerWidth,y=(-pos.y*.5+.5)*innerHeight;el.style.display=pos.z>1?"none":"block";el.style.left=x+"px";el.style.top=y+"px";el.classList.toggle("near",d<2.5)}}
const joystick=$("joystick"),knob=$("joyKnob");
function joy(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const dx=e.clientX-cx,dy=e.clientY-cy;const scale=Math.min(1,48/Math.max(1,Math.hypot(dx,dy)));input.joyX=dx*scale/48;input.joyY=dy*scale/48;knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`}
joystick.addEventListener("pointerdown",e=>{e.preventDefault();joystick.setPointerCapture(e.pointerId);input.pointer=e.pointerId;joy(e)});
joystick.addEventListener("pointermove",e=>{if(input.pointer===e.pointerId)joy(e)});
function joyEnd(e){if(input.pointer!==e.pointerId)return;input.pointer=null;input.joyX=0;input.joyY=0;knob.style.transform="translate(0,0)"}
joystick.addEventListener("pointerup",joyEnd);joystick.addEventListener("pointercancel",joyEnd);joystick.addEventListener("lostpointercapture",joyEnd);
canvas.addEventListener("pointerdown",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;if(e.pointerType!=="mouse"&&e.clientX<innerWidth*.33&&input.points.size===0)return;canvas.setPointerCapture(e.pointerId);input.points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(input.points.size===2){const pts=[...input.points.values()];input.pinch=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y)}else input.pinch=null});
canvas.addEventListener("pointermove",e=>{const prev=input.points.get(e.pointerId);if(!prev)return;input.points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(input.points.size>=2){const pts=[...input.points.values()];const dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(input.pinch)state.distance=clamp(state.distance*input.pinch/Math.max(10,dist),4.5,12);input.pinch=dist;return}
 state.yaw-=((e.clientX-prev.x)/innerWidth)*3.9;state.pitch=clamp(state.pitch+(e.clientY-prev.y)/innerHeight*2.5,.13,.72)});
for(const type of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(type,e=>{input.points.delete(e.pointerId);input.pinch=null});
canvas.addEventListener("wheel",e=>{e.preventDefault();state.distance=clamp(state.distance+e.deltaY*.012,4.5,12)},{passive:false});
window.addEventListener("keydown",e=>{if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","w","a","s","d","e","1","2"].includes(e.key.toLowerCase()))e.preventDefault();
 if(e.repeat&&["e","1","2"].includes(e.key.toLowerCase()))return;
 input.keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==="e")act();
 if(e.key==="1"){$("wave").click()}if(e.key==="2"){$("dance").click()}
});
window.addEventListener("keyup",e=>input.keys.delete(e.key.toLowerCase()));
window.addEventListener("blur",()=>{input.keys.clear();input.joyX=input.joyY=0;knob.style.transform="translate(0,0)"});
function resize(){const w=innerWidth,h=innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}
window.addEventListener("resize",resize);resize();
const focus=new THREE.Vector3(),desired=new THREE.Vector3();
let tick=0,firstFrame=true;
function animate(){
 requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),now=performance.now();tick+=dt;
 let x=input.joyX,z=-input.joyY;
 if(input.keys.has("w")||input.keys.has("arrowup"))z+=1;if(input.keys.has("s")||input.keys.has("arrowdown"))z-=1;
 if(input.keys.has("a")||input.keys.has("arrowleft"))x-=1;if(input.keys.has("d")||input.keys.has("arrowright"))x+=1;
 const len=Math.hypot(x,z),moving=len>.1&&!state.sitting&&!state.menu&&!(!ui.bubble.classList.contains("hidden"));
 if(moving){x/=Math.max(1,len);z/=Math.max(1,len);
  const worldX=Math.cos(state.yaw)*x-Math.sin(state.yaw)*z,worldZ=-Math.sin(state.yaw)*x-Math.cos(state.yaw)*z;
  const speed=input.keys.has("shift")?6:3.7;
  const next=moveWithCollisions(avatar.root.position,worldX*speed*dt,worldZ*speed*dt,world.obstacles,11.5,.4);
  avatar.root.position.set(next.x,0,next.z);const targetAngle=Math.atan2(worldX,worldZ);
  let diff=Math.atan2(Math.sin(targetAngle-avatar.root.rotation.y),Math.cos(targetAngle-avatar.root.rotation.y));avatar.root.rotation.y+=diff*Math.min(1,dt*11);
 }
 avatar.tick(dt,{moving,dancing:state.danceUntil>now,waving:state.waveUntil>now,sitting:state.sitting,holding:state.holding});
 world.update?.(tick,dt,state.danceUntil>now);
 postWorld.update(tick,dt,avatar.root.position,camera);
 focus.set(avatar.root.position.x,1.42+(state.sitting?-.38:0),avatar.root.position.z);
 desired.set(focus.x+Math.sin(state.yaw)*Math.cos(state.pitch)*state.distance,focus.y+Math.sin(state.pitch)*state.distance,focus.z+Math.cos(state.yaw)*Math.cos(state.pitch)*state.distance);
 // avoid camera clipping into cafe structure
 if(world.cameraObstacles)for(const b of world.cameraObstacles){const d=desired.clone().sub(focus),steps=16;for(let j=1;j<=steps;j++){const q=focus.clone().addScaledVector(d,j/steps);if(q.x>b.minX&&q.x<b.maxX&&q.z>b.minZ&&q.z<b.maxZ&&q.y<b.top){desired.copy(focus).addScaledVector(d,Math.max(.22,(j-1)/steps));break}}}
 camera.position.lerp(desired,Math.min(1,dt*9));camera.lookAt(focus);
 updateAction();updateLabels();if(state.toastUntil<now)ui.toast.classList.add("hidden");
 renderer.render(scene,camera);
 if(firstFrame){firstFrame=false;$("loading").classList.add("hidden")}
 window.__PATIO_DEBUG__={ready:true,webgl:!!renderer.getContext(),position:avatar.root.position.toArray(),camera:camera.position.toArray(),yaw:state.yaw,pitch:state.pitch,zoom:state.distance,nearest:state.target?.id??null,sitting:state.sitting,holding:state.holding,dancing:state.danceUntil>now,visited:[...state.visited],unlocked:state.unlocked,melodyStep:state.melodyStep,melodyComplete:state.melodyComplete,postal:{...state.postal},avatarScalePixels:estimateAvatarPixels()};
}
function estimateAvatarPixels(){const a=new THREE.Vector3(0,.04,0),b=new THREE.Vector3(0,2.8,0);a.add(avatar.root.position).project(camera);b.add(avatar.root.position).project(camera);return Math.abs(a.y-b.y)*innerHeight/2;}
$("progressText").textContent=state.unlocked?"✴ Corona desbloqueada":getProgress(state.visited).count+" / 3 encuentros para una sorpresa";
animate();

