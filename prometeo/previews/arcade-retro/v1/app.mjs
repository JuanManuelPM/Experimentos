import * as THREE from "three";
import {makeCabinet} from "./cabinet.mjs";

const root=document.getElementById("stage"),notice=document.getElementById("notice");
const q={status:"BOOT",frames:0,inputs:0,pulseCount:0,model:"",webgl:false,cameraSeconds:0};
window.__ARCADE_QA__=q;
function fail(message){q.status="ERROR";notice.textContent=message;notice.classList.add("show");}
let renderer;
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.32;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 root.appendChild(renderer.domElement);q.webgl=true;
}catch(e){fail("WEBGL NO DISPONIBLE: "+e.message);throw e;}
const scene=new THREE.Scene();scene.background=new THREE.Color(0x100e19);scene.fog=new THREE.FogExp2(0x100e19,.095);
const camera=new THREE.PerspectiveCamera(51,1,.08,80);
const cab=makeCabinet();scene.add(cab.group);q.model=cab.modelId;
const hemi=new THREE.HemisphereLight(0x859fae,0x382137,1.2);scene.add(hemi);
const key=new THREE.SpotLight(0xf6d4a8,54,10,Math.PI/5,.7,1.3);key.position.set(2.4,3.8,3.7);key.target.position.set(0,1.2,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key,key.target);
const rim=new THREE.PointLight(0x5ddcd6,16,5,1.4);rim.position.set(-1.8,1.9,-1.1);scene.add(rim);
const violet=new THREE.PointLight(0xe43f8a,12,5,1.2);violet.position.set(1.9,2.0,-.8);scene.add(violet);
// Local rough tile atlas, no proprietary photos.
const tc=document.createElement("canvas");tc.width=512;tc.height=512;const ctx=tc.getContext("2d");
ctx.fillStyle="#181922";ctx.fillRect(0,0,512,512);
for(let y=0;y<8;y++)for(let x=0;x<8;x++){
 let v=(x*19+y*31)%4;ctx.fillStyle=["#25232c","#23232c","#292631","#20262b"][v];
 ctx.fillRect(x*64+2,y*64+2,60,60);
 ctx.fillStyle="rgba(180,153,148,.12)";ctx.fillRect(x*64+3,y*64+3,58,1);
}
for(let i=0;i<1100;i++){let x=(i*113)%512,y=(i*277)%512;ctx.fillStyle=i%3?"rgba(226,201,162,.04)":"rgba(0,0,0,.08)";ctx.fillRect(x,y,1,2);}
const floorTex=new THREE.CanvasTexture(tc);floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(7,7);floorTex.colorSpace=THREE.SRGBColorSpace;
const floor=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshStandardMaterial({map:floorTex,roughness:.37,metalness:.12}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
const back=new THREE.Mesh(new THREE.PlaneGeometry(16,8),new THREE.MeshStandardMaterial({color:0x1b1c28,roughness:.84}));back.position.set(0,3.0,-2.4);back.receiveShadow=true;scene.add(back);
for(let i=-6;i<=6;i++){
 let slat=new THREE.Mesh(new THREE.BoxGeometry(.036,4.5,.034),new THREE.MeshStandardMaterial({color:i%3===0?0x67435a:0x2f353e,metalness:.5,roughness:.5}));
 slat.position.set(i*.58,2.25,-2.32);scene.add(slat);
}
const linear=new THREE.Mesh(new THREE.BoxGeometry(9,.045,.04),new THREE.MeshBasicMaterial({color:0x794768}));linear.position.set(0,2.52,-2.26);scene.add(linear);
const pathStart=new THREE.Vector3(2.05,1.82,5.75),pathEnd=new THREE.Vector3(1.18,1.63,2.55);
const v=new THREE.Vector3(),look=new THREE.Vector3(0,1.46,.18);
const timer=new THREE.Clock();let t=0,drag=false,lastX=0,orbit=0,score=0;
function resize(){
 const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
window.addEventListener("resize",resize);resize();
function sound(action){
 try {
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)return;
 if(!sound.ctx)sound.ctx=new AudioContextClass();
 const a=sound.ctx;if(a.state==="suspended")a.resume();
 const now=a.currentTime,osc=a.createOscillator(),gain=a.createGain();
 osc.type=action==="fire"?"triangle":"sine";
 osc.frequency.setValueAtTime(action==="fire"?480:205,now);
 osc.frequency.exponentialRampToValueAtTime(action==="fire"?215:175,now+.11);
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.06,now+.012);
 gain.gain.exponentialRampToValueAtTime(.0001,now+.15);
 osc.connect(gain);gain.connect(a.destination);osc.start(now);osc.stop(now+.17);
 }catch(e){console.warn("sound unavailable",e);}
}
function press(action){
 cab.input(action);sound(action);q.inputs++;q.pulseCount=cab.screen.state.pulseCount;
 document.getElementById("pulse").classList.remove("flash");void document.getElementById("pulse").offsetWidth;document.getElementById("pulse").classList.add("flash");
}
window.addEventListener("keydown",e=>{
 const action=e.key==="ArrowLeft"?"left":e.key==="ArrowRight"?"right":e.key===" "||e.key==="Enter"?"fire":null;
 if(action){e.preventDefault();press(action);}
});
document.querySelectorAll("[data-control]").forEach(b=>{
 b.addEventListener("pointerdown",e=>{e.preventDefault();press(b.dataset.control);});
});
const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
renderer.domElement.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId);});
renderer.domElement.addEventListener("pointermove",e=>{if(drag){orbit=Math.max(-.48,Math.min(.55,orbit+(e.clientX-lastX)*.0035));lastX=e.clientX;}});
renderer.domElement.addEventListener("pointerup",e=>{
 const wasDrag=Math.abs(e.clientX-lastX)>8;drag=false;if(wasDrag)return;
 const rect=renderer.domElement.getBoundingClientRect();
 mouse.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
 ray.setFromCamera(mouse,camera);
 const hits=ray.intersectObjects(cab.interactive,false);
 if(hits.length)press(hits[0].object.name==="live-joystick"?"right":"fire");
});
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(timer.getDelta(),.05);t+=dt;
 cab.update(dt);
 const s=Math.min(t/6.4,1);
 // No default pause between the two shot beats; continuous approach and slight orbit after arrival.
 v.copy(pathStart).lerp(pathEnd,s);
 v.x+=Math.sin(Math.min(t,6.4)*.29)*.13+orbit;
 if(t>6.4){v.x+=Math.sin((t-6.4)*.15)*.15;v.z+=Math.sin((t-6.4)*.10)*.07;}
 camera.position.copy(v);camera.lookAt(look);
 renderer.render(scene,camera);q.frames++;q.cameraSeconds=+t.toFixed(2);q.status="RENDERING";
 if(t>1)document.getElementById("boot").style.opacity="0";
}
animate();