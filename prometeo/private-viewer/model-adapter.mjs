// Uses the same Three.js version, GLTFLoader and OrbitControls as the asset library.
// Trusted host only. No remote resource URLs or compression extensions in this pilot.
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
export function validateGLB(bytes){
  if(!(bytes instanceof Uint8Array)||bytes.byteLength<20)throw Error('GLB inválido');
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(v.getUint32(0,true)!==0x46546c67||v.getUint32(4,true)!==2||v.getUint32(8,true)!==bytes.byteLength||v.getUint32(16,true)!==0x4e4f534a||v.getUint32(12,true)>bytes.byteLength-20)throw Error('GLB inválido');
  const j=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+v.getUint32(12,true))));
  if((j.buffers||[]).some(x=>x.uri)||(j.images||[]).some(x=>x.uri)||(j.extensionsRequired||[]).length||(j.extensionsUsed||[]).some(x=>/draco|meshopt|basisu/i.test(x)))throw Error('El piloto admite GLB autocontenido sin compresión externa');
  return j;
}
export async function mountGLB(host,bytes){
  validateGLB(bytes);
  const scene=new T.Scene();scene.background=new T.Color(0x17191a);
  const camera=new T.PerspectiveCamera(40,1,0.01,1000);
  const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.domElement.style.cssText='width:100%;height:100%;display:block';host.append(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;
  scene.add(new T.HemisphereLight(0xffffff,0x444444,2));
  const light=new T.DirectionalLight(0xffffff,3);light.position.set(3,5,4);scene.add(light);
  let gltf,frame=0,observer,select;
  function dispose(){cancelAnimationFrame(frame);observer?.disconnect();controls.dispose();gltf?.scene.traverse(o=>{o.geometry?.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){for(const t of Object.values(m))if(t?.isTexture)t.dispose();m.dispose();}});renderer.dispose();renderer.domElement.remove();select?.remove();}
  try{
    const manager=new T.LoadingManager();manager.setURLModifier(url=>{if(!url.startsWith('blob:')&&!url.startsWith('data:'))throw Error('Recurso externo bloqueado');return url;});
    gltf=await new GLTFLoader(manager).parseAsync(bytes.slice().buffer,'');
    scene.add(gltf.scene);gltf.scene.updateMatrixWorld(true);
    const box=new T.Box3().setFromObject(gltf.scene),center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3()).length();
    if(!Number.isFinite(size)||size<=0)throw Error('Modelo vacío');
    camera.position.copy(center).add(new T.Vector3(1,.65,1).multiplyScalar(size));camera.near=Math.max(.001,size/1000);camera.far=Math.max(10,size*30);camera.updateProjectionMatrix();controls.target.copy(center);controls.update();
    const resize=()=>{const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(host);resize();
    const mixer=new T.AnimationMixer(gltf.scene);if(gltf.animations.length){select=document.createElement('select');select.style.cssText='position:absolute;bottom:12px;left:12px;max-width:80%;padding:8px';for(const [i,clip] of gltf.animations.entries()){const opt=document.createElement('option');opt.value=i;opt.textContent=clip.name||'Clip '+(i+1);select.append(opt);}select.addEventListener('change',()=>{mixer.stopAllAction();mixer.clipAction(gltf.animations[+select.value]).play();});host.append(select);mixer.clipAction(gltf.animations[0]).play();}
    let last=performance.now();function tick(now){mixer.update(Math.min(.1,(now-last)/1000));last=now;controls.update();renderer.render(scene,camera);frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
    return ()=>{mixer.stopAllAction();mixer.uncacheRoot(gltf.scene);dispose();};
  }catch(e){dispose();throw e;}
}
