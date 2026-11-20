import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import {createDoorPortal,assertDoorClearance} from '../source/door-kit.mjs';
const scene=new THREE.Scene();scene.background=new THREE.Color('#0b111b');scene.fog=new THREE.FogExp2('#0b111b',.028);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.08,80);
camera.position.set(2.28,1.80,5.6);camera.lookAt(0,1.62,.04);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.48;document.body.insertBefore(renderer.domElement,document.body.firstChild);
scene.add(new THREE.HemisphereLight(0x7692ad,0x1b0c08,1.8));
const key=new THREE.SpotLight(0xffd1a0,85,13,Math.PI/4,.6,1.2);key.position.set(-2,5,5);key.target.position.set(0,1.4,0);key.castShadow=true;scene.add(key,key.target);
const fill=new THREE.PointLight(0x2fa7b4,14,8,1.3);fill.position.set(2.8,2.9,-2.0);scene.add(fill);
const brass=new THREE.MeshStandardMaterial({color:0xbd9863,roughness:.28,metalness:.81});
const tile=new THREE.MeshStandardMaterial({color:0x1d2931,roughness:.38,metalness:.18});
const marble=new THREE.MeshStandardMaterial({color:0x25343b,roughness:.31,metalness:.28});
const walnut=new THREE.MeshStandardMaterial({color:0x322025,roughness:.46,metalness:.10});
function box(w,h,d,x,y,z,mat,n='architectural.part') {
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=true;o.name=n;scene.add(o);return o;
}
box(18,.18,15,0,-.12,1,tile,'floor.solid');
box(18,.12,15,0,4.05,1,walnut,'ceiling.solid');
for(let s of [-1,1]) {
 box(2.7,4.1,.26,s*2.75,2.03,0,marble,'portal.wall');
 box(.18,4.1,.28,s*4.02,2.05,0,brass,'pilaster');
 for(let n=0;n<5;n++)box(.027,3.35,.04,s*(2.45+n*.20),2.03,.17,brass,'vertical.fluting');
 box(.25,1.32,.35,s*2.47,1.64,.22,walnut,'sconce.back');
 const bulb=new THREE.PointLight(0xffa95e,8,4);bulb.position.set(s*2.47,2.26,.55);scene.add(bulb);
 box(.14,.45,.16,s*2.47,2.26,.49,brass,'sconce.emitter');
}
for(let x=-6;x<=6;x+=.8)box(.022,.006,15,x,-.018,1,brass,'floor.grout');
for(let z=-6;z<7;z+=.8)box(17,.005,.022,0,-.014,z,brass,'floor.grout');
box(6,.18,.22,0,3.62,0,brass,'frame.top');
box(6,.04,.25,0,3.45,0,walnut,'frame.frieze');
const portal=createDoorPortal(THREE);scene.add(portal.root);
const cabinBack=box(2.5,3.1,.12,0,1.53,-3.25,walnut,'cabin.back');
for(let s of [-1,1]) {
 box(.10,3.1,3.0,s*1.35,1.54,-1.75,walnut,'cabin.side');
 for(let z=-3;z<0;z+=.5)box(.015,2.70,.025,s*1.29,1.59,z,brass,'cabin.inlay');
}
box(2.65,.14,3.40,0,3.13,-1.63,walnut,'cabin.ceiling');
const call=box(.24,.58,.12,1.63,1.34,.26,brass,'call.plate');
const callButton=new THREE.Mesh(new THREE.CylinderGeometry(.058,.058,.035,28),new THREE.MeshStandardMaterial({color:0xf6b86d,emissive:0xe19a39,emissiveIntensity:1.8,metalness:.45,roughness:.25}));
callButton.rotation.x=Math.PI/2;callButton.position.set(1.63,1.36,.35);scene.add(callButton);
const fit=assertDoorClearance(portal); if(!fit.pass)throw new Error('FIT CONTRACT FAILED');
const buttons=[...document.querySelectorAll('[data-open]')];
function set(t) {portal.setOpen(t);buttons.forEach(b=>b.classList.toggle('active',Number(b.dataset.open)===t));renderer.render(scene,camera);return portal.getFit();}
buttons.forEach(b=>b.addEventListener('click',()=>set(Number(b.dataset.open))));
window.__qa={ready:false,doorFit:fit,open:t=>set(t),render:()=>renderer.render(scene,camera),glRenderer:renderer.capabilities.isWebGL2,canvas:renderer.domElement};
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.render(scene,camera)}
addEventListener('resize',resize);set(0);window.__qa.ready=true;