import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {repairAuthored} from './authored-repair.mjs';
const stage=document.querySelector('main');
const q=new URLSearchParams(location.search),ids=["01-explorador","02-detective","03-mecanico","04-artista","05-cientifica"],heights=[1.84,1.79,1.73,1.56,1.70],n=Math.max(0,ids.indexOf(q.get('id'))),id=ids[n],H=heights[n],before=q.get('version')==='1';
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color('#d9d5cf');
scene.fog=new THREE.Fog('#d9d5cf',8,22);
const camera=new THREE.PerspectiveCamera(35,1,.03,50);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#c6c0b7',roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.004;floor.receiveShadow=true;scene.add(floor);
scene.add(new THREE.HemisphereLight('#fff8e7','#8e909d',2.0));
const key=new THREE.DirectionalLight('#fff1dd',3.1);key.position.set(3.0,5,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2;key.shadow.camera.right=2;key.shadow.camera.top=3;key.shadow.camera.bottom=-2;key.shadow.normalBias=.018;key.shadow.bias=-.0002;scene.add(key);
const fill=new THREE.DirectionalLight('#e9f0ff',1.55);fill.position.set(-4,2,3);scene.add(fill);
const rim=new THREE.DirectionalLight('#ffffff',2.1);rim.position.set(1,3,-4);scene.add(rim);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stats={id,ready:false,modelTriangles:0,expectedJoints:65,frames:0,frameMs:[],fps:null,drawCalls:null,renderTriangles:null,devicePixelRatio:renderer.getPixelRatio(),webgl:renderer.capabilities.isWebGL2===true?'WebGL2':'WebGL',errors:[]};
window.__characterMetrics=stats;
const smooth=(a,b,t)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
function size(){const w=stage.clientWidth||window.innerWidth,h=stage.clientHeight||window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',size);size();
let model,mixer,actions,current=null,repair=null;
try{
 const asset=await new GLTFLoader().loadAsync('./authored/'+id+'/character.glb');
 model=asset.scene;scene.add(model);if(!before){repair=repairAuthored(model,H);stats.repair=repair.receipt;}
 model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;stats.modelTriangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
 mixer=new THREE.AnimationMixer(model);actions=Object.fromEntries(asset.animations.map(c=>[c.name,mixer.clipAction(c)]));
 if(!['idle','walk','turn','wave'].every(n=>actions[n]))throw Error('Required clip absent');
 for(const name of ['turn','wave']){actions[name].setLoop(THREE.LoopOnce,1);actions[name].clampWhenFinished=true}
 stats.ready=true;stats.clips=asset.animations.map(c=>({name:c.name,duration:c.duration}));stats.bones=[];model.traverse(o=>{if(o.isBone)stats.bones.push(o.name)});
}catch(e){stats.errors.push(String(e));console.error(e);renderer.render(scene,camera);throw e;}
function play(name){if(name===current)return;const next=actions[name];next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();if(current)actions[current].crossFadeTo(next,.35,false);current=name;}
play('idle');
const clock=new THREE.Clock(),samples=[];let elapsed=0,raf,last=performance.now();
function frame(now){
 const actual=(now-last)/1000;last=now;const dt=Math.min(Math.max(actual,0),.075);elapsed+=dt;
 const t=reduce?32:elapsed%42;
 let mode=t<24?'idle':t<30?'walk':t<36?'wave':'turn';play(mode);mixer.update(dt);
 let angle=t<10?2*Math.PI*smooth(0,10,t):.25,target=new THREE.Vector3(0,H*.49,0),r=Math.max(H*1.85,H*1.34/Math.min(1,camera.aspect));let key=t<10?null:t<14?'hand_L':t<18?'hand_R':t<21?'foot_L':t<24?'foot_R':t>=30&&t<33?'upperArm_L':t>=33&&t<36?'head':null;model.updateMatrixWorld(true);if(key){const bone=model.getObjectByName(key);if(bone){bone.getWorldPosition(target);r=(key.startsWith('hand')?.52:key.startsWith('foot')?.66:.9)/Math.min(1,camera.aspect);angle=key.endsWith('R')?-.55:.55;if(key.startsWith('foot'))target.z+=.06;}}camera.position.set(target.x+Math.sin(angle)*r,target.y+.08,target.z+Math.cos(angle)*r);camera.lookAt(target);if(repair&&stats.frames%30===0){let a=repair.receipt.samples;a.push({mode,time:elapsed,maxCoincidentWristGapM:repair.sample()});if(a.length>120)a.shift()}
 renderer.render(scene,camera);
 if(actual>0&&actual<.3){samples.push(actual*1000);if(samples.length>240)samples.shift();if(samples.length>=30&&stats.frames%30===0){const sorted=[...samples].sort((a,b)=>a-b);stats.fps=1000/(samples.reduce((a,b)=>a+b,0)/samples.length);stats.frameMs={p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)]};stats.drawCalls=renderer.info.render.calls;stats.renderTriangles=renderer.info.render.triangles}}
 stats.frames++;stats.mode=mode;raf=requestAnimationFrame(frame);
}
raf=requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf)}else{last=performance.now();raf=requestAnimationFrame(frame)}});
