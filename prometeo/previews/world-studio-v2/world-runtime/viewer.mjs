import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {clone as cloneSkeleton} from 'three/addons/utils/SkeletonUtils.js';
import {validate,Streamer,ModelCache,stepPlayer} from './runtime.mjs';
const cancelled=()=>Object.assign(Error('Cancelado'),{name:'AbortError'});
function disposeTemplate(v){
 const geo=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
 v.scene.traverse(o=>{if(o.geometry)geo.add(o.geometry);if(o.skeleton)skeletons.add(o.skeleton);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){materials.add(m);for(const x of Object.values(m))if(x?.isTexture)textures.add(x)}});
 for(const s of skeletons)s.dispose();for(const g of geo)g.dispose();for(const m of materials)m.dispose();for(const t of textures){t.dispose();if(t.image&&typeof t.image.close==='function')t.image.close()}
}
async function loadOriginal(asset,signal){
 const url=new URL(asset.url),prefix='https://raw.githubusercontent.com/JuanManuelPM/Experimentos/'+asset.sourceCommit+'/';
 const manager=new T.LoadingManager();
 manager.setURLModifier(raw=>{
  if(raw.startsWith('blob:')||raw.startsWith('data:'))return raw;
  const requested=new URL(raw,url);const name=decodeURIComponent(requested.pathname.split('/').pop());const mapped=asset['station:dependencies']?.[name];const u=mapped?new URL(mapped):requested;if(!u.href.startsWith(prefix)||u.search||u.hash||u.username||u.password)throw Error('Dependencia fuera de la fuente fijada');
  if(signal.aborted)throw cancelled();return u.href;
 });
 const requestSignal=AbortSignal.any&&AbortSignal.timeout?AbortSignal.any([signal,AbortSignal.timeout(20000)]):signal;
 const response=await fetch(url.href,{signal:requestSignal,credentials:'omit',redirect:'error'});
 if(!response.ok)throw Error('HTTP '+response.status+' · '+url.pathname.split('/').pop());
 if(Number(response.headers.get('content-length'))>48*1024*1024)throw Error('Modelo supera 48 MiB');
 const bytes=await response.arrayBuffer();if(signal.aborted)throw cancelled();
 if(bytes.byteLength>48*1024*1024)throw Error('Modelo supera 48 MiB');
 const model=await new GLTFLoader(manager).parseAsync(bytes,new URL('.',url).href);
 if(signal.aborted){disposeTemplate(model);throw cancelled()}
 model.scene.updateMatrixWorld(true);return model;
}
function makeAdapter(scene,world,cache){
 const matrix=new T.Matrix4(),pos=new T.Vector3(),q=new T.Quaternion(),scale=new T.Vector3(),euler=new T.Euler();
 const transform=i=>matrix.compose(pos.fromArray(i.position),q.setFromEuler(euler.set(...i.rotation,'XYZ')),scale.fromArray(i.scale));
 function destroy(v){for(const m of v.mixers){m.stopAllAction();m.uncacheRoot(m.getRoot())}v.group.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.isSkinnedMesh)o.skeleton.dispose()});v.group.clear();for(const lease of v.leases)lease.release()}
 return {async build(sector,signal){
  const v={group:new T.Group(),leases:[],mixers:[],count:sector.instances.length};v.group.name=sector.id;
  try{
   const grouped=new Map();for(const i of sector.instances){if(!grouped.has(i.assetId))grouped.set(i.assetId,[]);grouped.get(i.assetId).push(i)}
   for(const [id,items] of grouped){
    if(signal.aborted)throw cancelled();let lease;let renderItems=items;try{lease=await cache.acquire(id,world.assets.get(id),signal)}catch(e){const fallback=items[0]['station:fallback'];if(signal.aborted||!fallback||!world.assets.has(fallback)||items.some(i=>i['station:fallback']!==fallback))throw e;lease=await cache.acquire(fallback,world.assets.get(fallback),signal);renderItems=items.map(i=>{const p=[...i.position];let scale=[...i.scale];if(id==='q17:platform'){p[1]-=.0934;scale=[2,1,2]}else if(id==='q17:crate'){p[1]-=.5;scale=[.81,1.295,1.30]}return {...i,position:p,scale}});v.fallbacks=(v.fallbacks||0)+items.length}v.leases.push(lease);
    if(signal.aborted)throw cancelled();
    const model=lease.value,meshes=[];let complex=model.animations.length>0;
    model.scene.traverse(o=>{if(o.isMesh){meshes.push(o);if(o.isSkinnedMesh||o.morphTargetInfluences||o.isInstancedMesh)complex=true}});
    if(!meshes.length)throw Error('Sin geometría: '+id);
    if(!complex&&!renderItems.some(i=>i.clip)&&renderItems.length>1){
     for(const mesh of meshes){
      const batch=new T.InstancedMesh(mesh.geometry,mesh.material,renderItems.length);
      renderItems.forEach((i,n)=>batch.setMatrixAt(n,transform(i).clone().multiply(mesh.matrixWorld)));
      batch.instanceMatrix.needsUpdate=true;batch.computeBoundingBox();batch.computeBoundingSphere();v.group.add(batch);
     }
    }else for(const i of renderItems){
     const o=cloneSkeleton(model.scene),wrapper=new T.Group();wrapper.position.fromArray(i.position);wrapper.rotation.set(...i.rotation,'XYZ');wrapper.scale.fromArray(i.scale);wrapper.add(o);v.group.add(wrapper);
     if(i.clip){const clip=T.AnimationClip.findByName(model.animations,i.clip);if(!clip)throw Error('Clip inexistente: '+i.clip);const mixer=new T.AnimationMixer(o);mixer.clipAction(clip).play();v.mixers.push(mixer)}
    }
   }
   return v;
  }catch(err){destroy(v);throw err}
 },attach:v=>scene.add(v.group),detach:v=>scene.remove(v.group),destroy};
}
export function mountWorld(manifest,ui){
 const world=validate(manifest),scene=new T.Scene();scene.background=new T.Color(0x0b1720);scene.fog=new T.Fog(0x0b1720,17,46);
 const renderer=new T.WebGLRenderer({canvas:ui.canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
 const camera=new T.PerspectiveCamera(70,1,.07,72);camera.rotation.order='YXZ';
 scene.add(new T.HemisphereLight(0xe0f5ff,0x525c71,2.2));let sun=new T.DirectionalLight(0xffecd7,2.8);sun.position.set(-12,20,8);scene.add(sun);let lamp=new T.PointLight(0x8dd8f4,7,9,2);scene.add(lamp);
 const zoneLayout=manifest['station:layout'];const visitedZones=new Set();if(zoneLayout){scene.background=new T.Color(0x07151e);scene.fog=new T.Fog(0x07151e,22,55);for(const z of zoneLayout.zones){const light=new T.PointLight(z.color,z.id==='hangar'?70:48,16,2);light.position.set(z.center[0],3.6,z.center[1]);scene.add(light);const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#0a1d27';ctx.fillRect(0,0,512,128);ctx.fillStyle=z.color;ctx.fillRect(0,0,12,128);ctx.fillStyle='#e5f8f5';ctx.font='bold 35px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(z.label,260,64,475);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const label=new T.Sprite(new T.SpriteMaterial({map:t,depthWrite:false}));label.position.set(z.center[0],3.1,z.center[1]);label.scale.set(2.7,.675,1);scene.add(label)}}
 const cache=new ModelCache({load:loadOriginal,dispose:disposeTemplate,limit:Math.min(32,Math.max(12,world.assets.size)),idleMs:1500}),stream=new Streamer(world,makeAdapter(scene,world,cache),{sectorLimit:12,parallel:2});
 let p,yaw,pitch=0,raf,last=performance.now(),fps=0,frames=0,seconds=0,report=0,dead=false,drag=null;
 const keys=new Set(),held=new Map(),events=new AbortController(),listen=(t,n,f,opts={})=>t.addEventListener(n,f,{...opts,signal:events.signal});
 const clear=()=>{keys.clear();held.clear();drag=null;for(const b of ui.controls)b.classList.remove('held')};
 function reset(){const [x,y,z]=manifest.spawn.position;p={x,y,z,vy:0};yaw=manifest.spawn.yaw;pitch=0;clear();stream.update(x,z)}
 reset();
 const resize=()=>{let w=Math.max(1,ui.canvas.clientWidth),h=Math.max(1,ui.canvas.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
 listen(window,'resize',resize);resize();
 const map={ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'};
 listen(window,'keydown',e=>{let k=map[e.key]||e.key.toLowerCase();if(['w','a','s','d'].includes(k)){e.preventDefault();keys.add(k)}});
 listen(window,'keyup',e=>keys.delete(map[e.key]||e.key.toLowerCase()));listen(window,'blur',clear);listen(document,'visibilitychange',()=>{if(document.hidden)clear()});
 const look=(dx,dy)=>{yaw-=dx*.004;pitch=T.MathUtils.clamp(pitch-dy*.004,-1.35,1.35)};
 listen(ui.canvas,'pointerdown',e=>{if(drag)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};ui.canvas.setPointerCapture(e.pointerId)});
 listen(ui.canvas,'pointermove',e=>{if(drag?.id!==e.pointerId)return;look(e.clientX-drag.x,e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY});
 for(const n of ['pointerup','pointercancel','lostpointercapture'])listen(ui.canvas,n,e=>{if(drag?.id===e.pointerId)drag=null});
 for(const b of ui.controls){
  listen(b,'pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.key);b.classList.add('held')});
  for(const n of ['pointerup','pointercancel','lostpointercapture'])listen(b,n,e=>{held.delete(e.pointerId);b.classList.remove('held')});
 }
 listen(ui.reset,'click',reset);
 listen(ui.canvas,'webglcontextlost',e=>{e.preventDefault();ui.status.textContent='Contexto WebGL perdido. Recargá la página.';stop()});
 const has=k=>keys.has(k)||[...held.values()].includes(k);
 function frame(now){
  if(dead)return;raf=requestAnimationFrame(frame);
  const elapsed=Math.max(0,(now-last)/1000),dt=Math.min(.05,elapsed);last=now;
  const f=Number(has('w'))-Number(has('s')),r=Number(has('d'))-Number(has('a')),n=Math.hypot(f,r)||1;
  const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*r)*dt*4.8/n,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*r)*dt*4.8/n;
  stream.update(p.x,p.z,dx,dz);
  if(stream.ready(stream.center))p=stepPlayer(world,p,dx,dz,dt,k=>stream.ready(k));
  stream.update(p.x,p.z,dx,dz);cache.trim();
  camera.position.set(p.x,p.y+1.62,p.z);camera.rotation.set(pitch,yaw,0);lamp.position.copy(camera.position);lamp.position.y+=.5;
  for(const e of stream.live.values())if(e.status==='ready')for(const m of e.value.mixers)m.update(dt);
  renderer.render(scene,camera);frames++;seconds+=elapsed;report+=elapsed;
  if(seconds>=1){fps=Math.round(frames/seconds);frames=0;seconds=0}
  if(report>=.2){report=0;let live=[...stream.live.values()].filter(e=>e.status==='ready'),instances=live.reduce((a,e)=>a+e.value.count,0);let state=stream.ready(stream.center)?'Sector listo':'Cargando sector actual';if(stream.errors.size)state+=' · '+[...stream.errors.values()][0].message+' · reintento automático';if(zoneLayout&&ui.zone){const id=zoneLayout.cells[Math.floor(p.x/zoneLayout.cellSize)+','+Math.floor(p.z/zoneLayout.cellSize)];if(id)visitedZones.add(id);const z=zoneLayout.zones.find(x=>x.id===id);ui.zone.textContent=(z?.label||'Entre sectores')+' · '+visitedZones.size+'/'+zoneLayout.zones.length+' zonas';}const fb=live.reduce((n,e)=>n+(e.value.fallbacks||0),0);ui.status.textContent=state+(fb?' · '+fb+' instancias con fallback Q18':'');
   ui.metrics.textContent=stream.center+' · '+live.length+'/'+world.sectors.size+' sectores · '+instances+' instancias · '+(fps||'—')+' FPS';
   ui.detail.textContent='Caché '+cache.entries.size+'/'+cache.limit+' · altas '+stream.stats.attached+' · bajas '+stream.stats.detached+' · hits '+cache.stats.hits+' · descartes '+cache.stats.evictions+' · canceladas '+stream.stats.cancelled+' · GPU geometrías '+renderer.info.memory.geometries+' / texturas '+renderer.info.memory.textures+' · draw calls '+renderer.info.render.calls;
   for(const [k,cell] of ui.cells){cell.dataset.state=k===stream.center?'current':stream.ready(k)?'ready':stream.live.has(k)?'loading':stream.visited.has(k)?'visited':'idle'}
  }
 }
 function stop(){if(dead)return;dead=true;cancelAnimationFrame(raf);events.abort();stream.close();cache.close();renderer.dispose()}
 listen(window,'pagehide',e=>{if(e.persisted)clear();else stop()});listen(window,'pageshow',resize);raf=requestAnimationFrame(frame);
 return {world,stream,cache,reset,stop,get player(){return {...p}}};
}
