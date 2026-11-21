import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const canvas=document.getElementById('stage');
const wrap=document.getElementById('stage-wrap');
const loading=document.getElementById('loading');
const loadText=document.getElementById('load-text');
const state=document.getElementById('status');
const spinLabel=document.getElementById('spin-state');
let renderer,scene,camera,controls,mixer,character,clock,animations=[],active=null,autoSpin=false;
const palettes={
 mar:{name:'Mareas',Jacket:'#194353',Sleeve:'#246a71',Cape:'#15293d',CapeLining:'#3c7b82',Accent:'#75e5cd'},
 ocre:{name:'Cobre',Jacket:'#76443d',Sleeve:'#9b5b43',Cape:'#48323c',CapeLining:'#b57e5d',Accent:'#f3c9a5'},
 noche:{name:'Noche',Jacket:'#302f4b',Sleeve:'#42405d',Cape:'#171b37',CapeLining:'#7771a1',Accent:'#beb2e8'}
};
const setStatus=(t)=>{state.textContent=t;};
function fail(message){
 loading.classList.remove('is-hidden');
 loading.querySelector('.loading-icon').style.display='none';
 loadText.textContent=message+' Descargá el glTF en el panel lateral.';
 setStatus('NO VERIFICADO · VISOR NO DISPONIBLE');
}
function resize(){
 if(!renderer)return;
 const w=wrap.clientWidth,h=wrap.clientHeight;
 if(w<1||h<1)return;
 renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function chooseAnimation(i){
 if(!mixer||!animations.length)return;
 const next=mixer.clipAction(animations[i]||animations[0]);
 if(active!==next){next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(.4).play();if(active)active.fadeOut(.4);active=next;}
 document.querySelectorAll('[data-clip]').forEach(button=>{const on=Number(button.dataset.clip)===i;button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on));});
}
function choosePalette(name){
 if(!character)return;
 const colors=palettes[name]||palettes.mar;
 character.traverse(item=>{
  if(!item.isMesh)return;
  const m=item.material;
  if(Array.isArray(m)){for(const a of m){if(colors[a.name])a.color.set(colors[a.name]);}}
  else if(m&&colors[m.name])m.color.set(colors[m.name]);
 });
 document.getElementById('palette-name').textContent=colors.name;
 document.querySelectorAll('[data-theme]').forEach(b=>{const on=b.dataset.theme===name;b.classList.toggle('current',on);b.setAttribute('aria-pressed',String(on));});
}
try{
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
 renderer.setClearColor(0x10151d,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.38;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(35,1,.05,100);
 camera.position.set(3.0,2.25,4.3);
 controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.dampingFactor=.065;
 controls.target.set(0,1.13,0);
 controls.minDistance=2.0;controls.maxDistance=7.8;
 controls.maxPolarAngle=Math.PI*.77;
 controls.update();
 clock=new THREE.Clock();
 scene.add(new THREE.HemisphereLight(0xd1edff,0x46382f,2.8));
 const key=new THREE.DirectionalLight(0xffddb9,3.5);key.position.set(-3,5,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0x93e5df,3.6);rim.position.set(3,3,-4);scene.add(rim);
 const back=new THREE.DirectionalLight(0x7084bd,1.3);back.position.set(-4,2,-2);scene.add(back);
 // The cylindrical elements below are a display pedestal, never a humanoid.
 const base=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.25,.13,72),new THREE.MeshStandardMaterial({color:0x293743,roughness:.67,metalness:.36}));
 base.position.y=-.13;scene.add(base);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(1.116,.009,7,96),new THREE.MeshBasicMaterial({color:0x97d1c5,transparent:true,opacity:.55}));
 edge.rotation.x=Math.PI/2;edge.position.y=-.054;scene.add(edge);
 const ground=new THREE.Mesh(new THREE.CircleGeometry(4.9,80),new THREE.MeshBasicMaterial({color:0x192630,transparent:true,opacity:.25}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.215;scene.add(ground);
 window.addEventListener('resize',resize,{passive:true});
 new ResizeObserver(resize).observe(wrap);
 resize();
 canvas.addEventListener('pointerdown',()=>{autoSpin=false;spinLabel.textContent='ACTIVAR';},{passive:true});
 const loader=new GLTFLoader();
 loader.load('./LUMA_character.gltf',function(g){
  character=g.scene;animations=g.animations||[];
  scene.add(character);
  character.traverse(node=>{if(node.isMesh){node.frustumCulled=false;}});
  mixer=new THREE.AnimationMixer(character);
  chooseAnimation(0);choosePalette('mar');
  loading.classList.add('is-hidden');
  setStatus('GLTF CARGADO · CANDIDATO SIN APROBACIÓN ARTÍSTICA');
 },undefined,function(err){console.error('Error loading LUMA glTF',err);fail('No se pudo importar la malla 3D.');});
 renderer.setAnimationLoop(()=>{
  const delta=Math.min(clock.getDelta(),.05);
  if(mixer)mixer.update(delta);
  if(autoSpin&&character)character.rotation.y+=delta*.24;
  controls.update();
  renderer.render(scene,camera);
 });
}catch(error){console.error(error);fail('Este navegador no pudo iniciar WebGL.');}
document.querySelectorAll('[data-clip]').forEach(button=>button.addEventListener('click',()=>chooseAnimation(Number(button.dataset.clip))));
document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>choosePalette(button.dataset.theme)));
document.getElementById('reset').addEventListener('click',()=>{
 if(!controls)return;
 autoSpin=false;spinLabel.textContent='ACTIVAR';
 camera.position.set(3,2.25,4.3);controls.target.set(0,1.13,0);controls.update();
 if(character)character.rotation.y=0;
 chooseAnimation(0);choosePalette('mar');
});
document.getElementById('spin').addEventListener('click',()=>{autoSpin=!autoSpin;spinLabel.textContent=autoSpin?'PAUSAR':'ACTIVAR';});
