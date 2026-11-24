import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {step,validate} from './navigation.mjs';
const $=id=>document.getElementById(id);
const keys=new Set(),visited=new Set(),templates=new Map(),loadErrors=new Map(),warnings=[];
let manifest,renderer,world,camera,layout,active=false,ready=false,yaw=0,pitch=0,px=0,pz=0,last=0,drag=null,frameCount=0,lastHud=0,fps=0;
const touch=matchMedia('(pointer:coarse)').matches;
const fail=e=>{$('status').textContent='No se pudo preparar la estación.';$('details').textContent=String(e);$('enter').disabled=true;$('overlay').hidden=false;};
function timeout(p,ms,label){let t;return Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(new Error('Tiempo agotado: '+label)),ms)})]).finally(()=>clearTimeout(t))}
async function getTemplate(id,a){
 const manager=new THREE.LoadingManager(),errors=[];
 const deps=a['station:dependencies']||{};
 manager.setURLModifier(input=>{let n;try{n=decodeURIComponent(new URL(input).pathname.split('/').pop())}catch{return input}return deps[n]||input});
 manager.onError=u=>errors.push(u);
 const loader=new GLTFLoader(manager);
 const g=await timeout(loader.loadAsync(a.url),30000,id);
 if(errors.length)throw new Error('Dependencias: '+errors.map(u=>u.split('/').pop()).join(', '));
 g.scene.updateMatrixWorld(true);
 const meshes=[];g.scene.traverse(m=>{if(m.isMesh){if(m.isSkinnedMesh)throw new Error('Rig no compatible con este adaptador estático');meshes.push({geometry:m.geometry,material:m.material,matrix:m.matrixWorld.clone()})}});
 if(!meshes.length)throw new Error('Modelo sin mallas');
 return {meshes,scene:g.scene};
}
async function loadAll(){
 const entries=Object.entries(manifest.assets);let done=0,next=0;
 $('progress').max=entries.length;
 async function worker(){while(next<entries.length){let [id,a]=entries[next++];try{templates.set(id,await getTemplate(id,a))}catch(e){loadErrors.set(id,String(e))}finally{$('progress').value=++done;$('status').textContent='Modelos preparados: '+done+' / '+entries.length;$('details').textContent=[...loadErrors].map(([k,v])=>k+': '+v).join('\n')}}}
 await Promise.all(Array.from({length:4},worker));
}
function addInstances(){
 const by=new Map();const all=manifest.sectors.flatMap(s=>s.instances);
 for(const i of all){let id=i.assetId,position=[...i.position],scale=[...i.scale];
 if(!templates.has(id)){
 if(id==='q17:platform'&&templates.has('q18:floor')){id='q18:floor';scale=[2,1,2];position[1]-=.0934;}
 else if(id==='q17:crate'&&templates.has('q18:crate')){id='q18:crate';scale=[.81,1.295,1.30];position[1]-=.5;}
 else throw new Error('Modelo requerido no disponible: '+i.assetId+' · '+loadErrors.get(i.assetId));
 }
 if(!by.has(id))by.set(id,[]);by.get(id).push({...i,position,scale});
 }
 for(const [id,instances] of by){const {meshes}=templates.get(id);
 for(const part of meshes){const mesh=new THREE.InstancedMesh(part.geometry,part.material,instances.length);mesh.name=id;let k=0;for(const i of instances){const o=new THREE.Object3D();o.position.fromArray(i.position);o.rotation.set(...i.rotation);o.scale.fromArray(i.scale);o.updateMatrix();mesh.setMatrixAt(k++,o.matrix.clone().multiply(part.matrix))}mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();world.add(mesh)}
 }
 for(const [id,error] of loadErrors)warnings.push(id+' → sustitución geométrica real Q18 ('+error.split(':')[0]+')');
}
function label(text,color,x,y,z){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#0a1d27';ctx.fillRect(0,0,512,128);ctx.fillStyle=color;ctx.fillRect(0,0,12,128);ctx.fillStyle='#e5f8f5';ctx.font='bold 35px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,260,64,475);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.SpriteMaterial({map:tex,depthTest:true,depthWrite:false});const s=new THREE.Sprite(m);s.position.set(x,y,z);s.scale.set(2.7,.675,1);world.add(s)}
function lighting(){
 world.add(new THREE.HemisphereLight(0xcde7ff,0x38434d,1.25));
 world.add(new THREE.AmbientLight(0xc4d4e0,.35));
 for(const z of layout.zones){const l=new THREE.PointLight(z.color,z.id==='hangar'?80:55,20,2);l.position.set(z.center[0],3.6,z.center[1]);world.add(l);label(z.label,z.color,z.center[0],3.1,z.center[1]);}
 for(const [x,z] of [[3,3],[9,9],[14,6],[22,6],[26,6],[30,14]]){let l=new THREE.PointLight(0xd7f7ff,38,11,2);l.position.set(x,3.7,z);world.add(l)}
 const vertices=[];let seed=21;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};for(let i=0;i<1400;i++){let a=rnd()*Math.PI*2,b=Math.acos(2*rnd()-1),r=100;vertices.push(18+r*Math.sin(b)*Math.cos(a),r*Math.cos(b),6+r*Math.sin(b)*Math.sin(a));}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));world.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0x9abacb,size:.10,sizeAttenuation:true})));
}
function resize(){if(!renderer)return;let w=window.innerWidth,h=window.innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function reset(){if(!manifest)return;px=manifest.spawn.position[0];pz=manifest.spawn.position[2];yaw=manifest.spawn.yaw;pitch=0;keys.clear();drag=null;updateHud()}
function updateHud(){if(!layout)return;const id=layout.cells[Math.floor(px/layout.cellSize)+','+Math.floor(pz/layout.cellSize)],zone=layout.zones.find(z=>z.id===id);if(zone){visited.add(id);$('zone').textContent=zone.label;$('description').textContent=zone.detail}$('visited').textContent=visited.size+'/6';$('diag').textContent=warnings.length?'MODO PARCIAL · '+warnings.length+' asset(s) Q17 con fallback Q18':'';drawMap()}
function drawMap(){const c=$('map'),g=c.getContext('2d'),w=c.width,h=c.height,scale=20,ox=20,oz=37;g.clearRect(0,0,w,h);g.fillStyle='#0a161e';g.fillRect(0,0,w,h);for(const [k,id] of Object.entries(layout.cells)){let [x,z]=k.split(',').map(Number),zone=layout.zones.find(q=>q.id===id);g.fillStyle=zone.color;g.globalAlpha=visited.has(id)?.58:.24;g.fillRect(ox+x*scale,oz+z*scale,scale-1,scale-1)}g.globalAlpha=1;for(const z of layout.zones){g.fillStyle='#dcebef';g.font='bold 10px system-ui';g.fillText(z.label.slice(0,2),ox+z.center[0]/4*scale-5,oz+z.center[1]/4*scale+4)}let x=ox+px/layout.cellSize*scale,z=oz+pz/layout.cellSize*scale;g.fillStyle='#fff';g.beginPath();g.arc(x,z,3.5,0,Math.PI*2);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.moveTo(x,z);g.lineTo(x-Math.sin(yaw)*10,z-Math.cos(yaw)*10);g.stroke()}
function look(dx,dy){yaw-=dx*.003;pitch=Math.max(-1.35,Math.min(1.35,pitch-dy*.003))}
function animate(t){requestAnimationFrame(animate);if(!ready)return;const dt=Math.min(.05,(t-(last||t))/1000);last=t;if(active){let forward=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0),side=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);let norm=Math.max(1,Math.hypot(forward,side));const speed=keys.has('ShiftLeft')?5.8:3.2;[px,pz]=step(manifest,px,pz,(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed*dt/norm,(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed*dt/norm);if(!Number.isFinite(px)||!Number.isFinite(pz))reset()}
 camera.position.set(px,layout.eyeHeight,pz);camera.rotation.set(pitch,yaw,0,'YXZ');renderer.render(world,camera);frameCount++;if(t-lastHud>200){updateHud();lastHud=t}}
function controls(){
 const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Escena 3D. WASD y arrastre para mover y mirar.');
 window.addEventListener('keydown',e=>{if(!active)return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','ShiftLeft'].includes(e.code)){keys.add(e.code);e.preventDefault()}if(e.code==='KeyR')reset()});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();drag=null});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();drag=null}});
 canvas.addEventListener('pointerdown',e=>{if(!active)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!active)return;if(document.pointerLockElement===canvas){look(e.movementX,e.movementY);return}if(drag?.id===e.pointerId){let dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.moved=drag.moved||Math.abs(dx)+Math.abs(dy)>2;look(dx,dy);drag.x=e.clientX;drag.y=e.clientY}});
 canvas.addEventListener('pointerup',e=>{if(drag?.id!==e.pointerId)return;let click=!drag.moved;drag=null;if(click&&!touch&&canvas.requestPointerLock&&document.pointerLockElement!==canvas){try{const p=canvas.requestPointerLock();if(p?.catch)p.catch(()=>{})}catch{}}});
 canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('lostpointercapture',()=>drag=null);
 for(const b of document.querySelectorAll('[data-move]')){const k=b.dataset.move;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(k)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(k))}
 $('reset').onclick=()=>{reset();if(active)canvas.focus()};
 $('mapToggle').onclick=()=>{let p=$('mapPanel');p.hidden=!p.hidden;$('mapToggle').setAttribute('aria-expanded',String(!p.hidden))};
 $('help').onclick=()=>{active=false;keys.clear();if(document.pointerLockElement)document.exitPointerLock();$('overlay').hidden=false;$('status').textContent='PC: WASD / flechas para caminar, clic o arrastre para mirar. Móvil: botones y arrastre en la escena. Reinicio vuelve al hangar.';$('enter').textContent='Continuar'};
 $('enter').onclick=()=>{$('overlay').hidden=true;active=true;keys.clear();canvas.focus()};
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;ready=false;fail('WebGL perdió el contexto. Recargá la página.')});
 window.addEventListener('resize',resize);
}
async function main(){
 const response=await timeout(fetch('./scene.json'),15000,'manifest');if(!response.ok)throw new Error('Manifest HTTP '+response.status);
 manifest=await response.json();const errors=validate(manifest);if(errors.length)throw new Error('Manifest inválido: '+errors.join(', '));layout=manifest['station:layout'];
 renderer=new THREE.WebGLRenderer({antialias:!touch,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,touch?1.35:1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;$('stage').append(renderer.domElement);
 world=new THREE.Scene();world.background=new THREE.Color(0x02060c);camera=new THREE.PerspectiveCamera(70,1,.05,150);resize();
 await loadAll();addInstances();lighting();controls();reset();ready=true;requestAnimationFrame(animate);
 $('status').textContent=warnings.length?'Escena preparada con sustituciones Q18. Detalle abajo.':'Estación preparada. Seis zonas conectadas; recorré el mapa.';$('details').textContent=warnings.join('\n');$('enter').disabled=false;
 window.station001={manifest,renderer,world,get position(){return[px,pz]},get visited(){return [...visited]},get warnings(){return [...warnings]},reset};
}
main().catch(fail);
