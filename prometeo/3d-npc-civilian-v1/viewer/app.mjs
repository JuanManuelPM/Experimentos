import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const source = {azul:'../dist/civil_azul.glb',granate:'../dist/civil_granate.glb'};
const el = (s)=>document.querySelector(s);
const stage = el('#viewport'), readout=el('#status'), stats=el('#stats');
const skinButtons = [...document.querySelectorAll('[data-skin]')];
const viewButtons = [...document.querySelectorAll('[data-view]')];
let renderer, camera, controls, avatar, bbox, center, scale=1, variants={}, selected='azul', orbit=true;
function setStatus(msg,ok=false){readout.textContent=msg;readout.dataset.ok=ok?'true':'false';}
function placeCamera(view){
 if(!bbox)return;
 const h=bbox.max.y-bbox.min.y, span=Math.max(h,1);
 const centerX=center.x, centerZ=center.z, y=bbox.min.y;
 const positions={
 full:[centerX+span*.73,center.y+span*.20,centerZ+span*1.75,center.y],
 face:[centerX+span*.23,y+span*.94,centerZ+span*.49,y+span*.88],
 hands:[centerX+span*.53,y+span*.56,centerZ+span*.86,y+span*.54],
 outfit:[centerX+span*.47,y+span*.62,centerZ+span*1.08,y+span*.55],
 back:[centerX-span*.7,center.y+span*.06,centerZ-span*1.45,center.y]
 };
 const p=positions[view]||positions.full;
 controls.autoRotate=false;orbit=false;
 camera.position.set(p[0],p[1],p[2]);controls.target.set(centerX,p[3],centerZ);
 camera.near=Math.max(.001,span/800); camera.far=Math.max(50,span*100);
 camera.updateProjectionMatrix();controls.update();
 viewButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
 el('#spin').setAttribute('aria-pressed','false');
}
function recolor(){
 if(!variants[selected])return;
 for(const [id,object] of Object.entries(variants))object.visible=id===selected;
 avatar=variants[selected];stats.dataset.variant=selected;
 el('#look').textContent=selected==='azul'?'AZUL PETRÓLEO / CHAQUETA':'GRANATE / CHAQUETA';
 skinButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.skin===selected)));
 const download=el('#download');if(download){download.href=source[selected];download.download='civil_'+selected+'.glb'}
}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setClearColor(0x182329,1);renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 stage.appendChild(renderer.domElement);
 const scene=new THREE.Scene();
 scene.background=new THREE.Color('#192329');scene.fog=new THREE.Fog('#192329',12,65);
 camera=new THREE.PerspectiveCamera(34,1,.01,200);
 controls=new OrbitControls(camera,renderer.domElement);
 controls.enableDamping=true;controls.autoRotate=true;controls.autoRotateSpeed=.65;
 const hemi=new THREE.HemisphereLight(0xc4dbed,0x534032,2.2);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xffebd3,3.5);key.position.set(-3,7,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0x76d3e5,2.5);rim.position.set(3,3,-4);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,64),new THREE.MeshStandardMaterial({color:0x26383a,roughness:.9}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
 const loader=new GLTFLoader();
 setStatus('Descargando malla original CC0 (GLB real, sin geometría de sustitución)');
 const [gltf,second]=await Promise.all([loader.loadAsync(source.azul),loader.loadAsync(source.granate)]);
 avatar=gltf.scene;
 variants={azul:avatar,granate:second.scene};
 scene.add(avatar);scene.add(second.scene);second.scene.visible=false;
 let count=0, uv=0, skinned=0, faces=0;
 avatar.traverse(o=>{
  if(!o.isMesh)return;
  count++;if(o.isSkinnedMesh)skinned++;
  if(o.geometry?.attributes?.uv)uv++;
  faces+=o.geometry?.index?o.geometry.index.count/3:(o.geometry?.attributes?.position?.count||0)/3;
 });
 if(!uv||!skinned)throw new Error('El GLB cargó pero falló la prueba de UV/rig');
 bbox=new THREE.Box3().setFromObject(avatar);
 center=bbox.getCenter(new THREE.Vector3());
 const size=bbox.getSize(new THREE.Vector3());
 if(!Number.isFinite(size.y)||size.y<=0)throw new Error('Límites de malla inválidos');
 scale=1.8/size.y;avatar.scale.setScalar(scale);second.scene.scale.setScalar(scale);
 bbox.setFromObject(avatar);bbox.getCenter(center);
 floor.position.y=bbox.min.y-.03;
 floor.scale.setScalar(Math.max(1,(bbox.max.x-bbox.min.x)*.8));
 stats.textContent='GLB recibido · '+count+' mallas · '+Math.floor(faces).toLocaleString('es-AR')+' triángulos · '+uv+' UV · '+skinned+' skinned · '+gltf.animations.length+' clips';
 placeCamera('full');controls.autoRotate=true;orbit=true;el('#spin').setAttribute('aria-pressed','true');
 recolor();
 setStatus('Dos GLB reales cargados. Comprobá rostro, manos, ropa y color. Calidad artística pendiente de revisión.',true);
 const resize=()=>{
  const w=stage.clientWidth,h=Math.max(stage.clientHeight,250);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 };
 new ResizeObserver(resize).observe(stage);resize();
 renderer.setAnimationLoop(()=>{
  controls.update(); renderer.render(scene,camera);
 });
 skinButtons.forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.skin;recolor()}));
 viewButtons.forEach(b=>b.addEventListener('click',()=>placeCamera(b.dataset.view)));
 el('#spin').addEventListener('click',()=>{
  orbit=!orbit;controls.autoRotate=orbit;el('#spin').setAttribute('aria-pressed',String(orbit));
 });
 el('#snapshot').addEventListener('click',()=>{
  renderer.render(scene,camera);
  const a=document.createElement('a');a.href=renderer.domElement.toDataURL('image/png');a.download='npc-'+selected+'-captura.png';a.click();
 });
 window.PROMETEO_QA={source,variantsLoaded:2,faces:Math.floor(faces),meshes:count,uvMeshes:uv,skinnedMeshes:skinned,glbLoaded:true,get skin(){return selected},get frame(){return renderer.domElement.toDataURL('image/png')}};
}catch(error){
 console.error('[character capsule] Failed to load/render genuine GLB',error);
 setStatus('ERROR REAL: '+(error?.message||String(error)));
 window.PROMETEO_QA={glbLoaded:false,error:String(error)};
}
