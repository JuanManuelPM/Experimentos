import {createLumaSprite,LUMA_MANIFEST} from "./actor.mjs";

const viewport=document.getElementById("viewport");
const fallback=document.getElementById("fallback");
const fallbackSprite=document.getElementById("fallbackSprite");
const frameLabel=document.getElementById("frameLabel");
const cameraLabel=document.getElementById("cameraLabel");
const speedInput=document.getElementById("speed");
const speedValue=document.getElementById("speedValue");
const pauseButton=document.getElementById("pause");
const resetButton=document.getElementById("reset");
let currentState="idle",speed=1,paused=false,angle=0;
let actor=null,renderer=null,scene=null,camera=null,THREE=null;
let last=performance.now(),offlineFrame=0,offlineTime=0;
const clockFPS=()=>LUMA_MANIFEST.clips[currentState].fps;
function updateSelection(){
  document.querySelectorAll("[data-state]").forEach(button=>{
    const selected=button.dataset.state===currentState;
    button.classList.toggle("selected",selected);
    button.setAttribute("aria-pressed",String(selected));
  });
}
function chooseClip(name){
  if(!LUMA_MANIFEST.clips[name])return;
  currentState=name;offlineTime=0;offlineFrame=0;
  if(actor)actor.setAnimation(name);
  updateSelection();updateFrame(0);
}
function updateFrame(frame){
  frameLabel.textContent=String(frame+1).padStart(2,"0")+" / 08";
  if(fallback&&!fallback.hidden){
    const row=LUMA_MANIFEST.clips[currentState].row;
    fallbackSprite.style.backgroundPosition=(frame/7*100)+"% "+(row/3*100)+"%";
  }
}
document.querySelectorAll("[data-state]").forEach(button=>button.addEventListener("click",()=>chooseClip(button.dataset.state)));
speedInput.addEventListener("input",()=>{
  speed=Number(speedInput.value);speedValue.textContent=speed.toFixed(1)+"×";
  if(actor)actor.setSpeed(speed);
});
pauseButton.addEventListener("click",()=>{
  paused=!paused;if(actor)actor.setPaused(paused);
  pauseButton.innerHTML=paused?"REANUDAR ANIMACIÓN <span>▶</span>":"PAUSAR ANIMACIÓN <span>Ⅱ</span>";
});
function setCameraAngle(a){angle=Math.max(-1.22,Math.min(1.22,a));cameraLabel.textContent="CÁMARA "+(angle*180/Math.PI).toFixed(0).padStart(2,"0")+"°";}
resetButton.addEventListener("click",()=>setCameraAngle(0));
let drag=null;
viewport.addEventListener("pointerdown",event=>{
  if(event.button!==0&&event.pointerType==="mouse")return;
  drag={id:event.pointerId,x:event.clientX,startAngle:angle};
  try{viewport.setPointerCapture(event.pointerId);}catch{}
});
viewport.addEventListener("pointermove",event=>{
  if(!drag||event.pointerId!==drag.id)return;
  setCameraAngle(drag.startAngle-(event.clientX-drag.x)/Math.max(250,viewport.clientWidth)*2.0);
});
function endDrag(event){if(drag&&event.pointerId===drag.id)drag=null;}
viewport.addEventListener("pointerup",endDrag);
viewport.addEventListener("pointercancel",endDrag);
viewport.addEventListener("lostpointercapture",()=>{drag=null;});
document.addEventListener("keydown",event=>{
  if(["1","2","3","4"].includes(event.key)&&document.activeElement?.tagName!=="INPUT")
    chooseClip(["idle","walk","turn","react"][Number(event.key)-1]);
});
function fallbackMode(){
  if(renderer){renderer.dispose();renderer.domElement.remove();renderer=null;}
  viewport.hidden=true;
  fallback.hidden=false;
  updateFrame(offlineFrame);
}
function addFloor(THREE,scene){
  const floor=new THREE.Mesh(new THREE.CircleGeometry(4.1,96),new THREE.MeshStandardMaterial({color:0x1a3440,roughness:.91,metalness:.08,transparent:true,opacity:.77}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-.07;scene.add(floor);
  for(let i=0;i<3;i++){
    const geometry=new THREE.RingGeometry(2.05+i*.33,2.057+i*.33,120);
    const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:i===0?0xc9ad87:0x47636b,side:THREE.DoubleSide,transparent:true,opacity:i===0?.65:.24}));
    mesh.rotation.x=-Math.PI/2;mesh.position.y=-.06+i*.004;scene.add(mesh);
  }
  const c=document.createElement("canvas");c.width=c.height=128;
  const ctx=c.getContext("2d");
  const g=ctx.createRadialGradient(64,64,7,64,64,61);
  g.addColorStop(0,"rgba(0,0,0,0.58)");
  g.addColorStop(.5,"rgba(0,0,0,0.27)");
  g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.4),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-.049;scene.add(shadow);
  const mainLight=new THREE.DirectionalLight(0xffe3b7,2.2);mainLight.position.set(2,6,4);scene.add(mainLight);
  const coolLight=new THREE.PointLight(0x8ab5a6,35,12);coolLight.position.set(-3,3,-1);scene.add(coolLight);
  const ambient=new THREE.AmbientLight(0x8aadb8,.7);scene.add(ambient);
}
function resize(){
  if(!renderer||!camera)return;
  const w=Math.max(1,viewport.clientWidth),h=Math.max(1,viewport.clientHeight);
  camera.aspect=w/h;camera.fov=h<500?47:36;camera.updateProjectionMatrix();
  renderer.setSize(w,h,false);
}
async function boot3D(){
  THREE=await import("https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js");
  const canvasRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  canvasRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  canvasRenderer.setClearColor(0x000000,0);
  canvasRenderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer=canvasRenderer;viewport.appendChild(renderer.domElement);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(36,1,.05,80);
  addFloor(THREE,scene);
  actor=await createLumaSprite({THREE});
  scene.add(actor.object);
  resize();window.addEventListener("resize",resize);
}
function loop(now){
  const delta=Math.min(.08,Math.max(0,(now-last)/1000));last=now;
  if(actor&&renderer&&camera){
    camera.position.set(Math.sin(angle)*6.7,2.38,Math.cos(angle)*6.7);
    camera.lookAt(0,1.54,0);
    actor.update(delta,camera);
    updateFrame(actor.frame);
    renderer.render(scene,camera);
  } else if(!fallback.hidden){
    if(!paused){
      offlineTime+=delta*speed;
      const next=Math.floor(offlineTime*clockFPS())%8;
      if(next!==offlineFrame){offlineFrame=next;updateFrame(next);}
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
boot3D().catch(error=>{
  console.error("Three.js preview unavailable; retained editable 2D animation.",error);
  fallbackMode();
});