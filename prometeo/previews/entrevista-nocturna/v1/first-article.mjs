// PROMETEO · entrevista-nocturna · V1 · FIRST_ARTICLE only.
// Reuses the existing real Quaternius CC0 GLB with rig, UVs, clothing and hands.
// This is a one-character inspection scene. No pretend seated pose or lip sync.
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const SOURCE='./assets/civil_azul.glb';
const stage=document.getElementById('stage'), error=document.getElementById('error');
const buttons=[...document.querySelectorAll('[data-shot]')];
const actorRoot=new THREE.Group(),scene=new THREE.Scene();scene.add(actorRoot);
scene.background=new THREE.Color('#0c1118');scene.fog=new THREE.FogExp2('#0c1118',.065);
const camera=new THREE.PerspectiveCamera(32,1,.01,100);
let renderer,faceBone=null,bbox=null,headBase=null,playing=false,start=0,shot='portrait',character=null;
const qa={project:'entrevista-nocturna',version:'v1',article:'actor-01',assetSha256:'8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b',assetGitBlob:'4e494c5bdce096af8c657f535cc52207d50ba6c9',loaded:false,webgl:false,uvMeshes:0,skinnedMeshes:0,animationClips:0,shot,frameRendered:false};
window.PROMETEO_QA=qa;
function mat(color,roughness=.72,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
const brass=mat('#8f7859',.41,.64),steel=mat('#a89a87',.37,.74),black=mat('#292d31',.85,.12);
function stageSurface(){
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),mat('#24212a',.93));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;floor.receiveShadow=true;scene.add(floor);
 const backdrop=new THREE.Group();scene.add(backdrop);
 for(let i=-8;i<=8;i++){
   const g=new THREE.BoxGeometry(.6,3.5,.14);
   const m=mat(i%2===0?'#25202b':'#191a25',.99);
   const v=new THREE.Mesh(g,m);v.position.set(i*.55,1.55,-2);backdrop.add(v);
 }
 const edge=new THREE.Mesh(new THREE.TorusGeometry(2.9,.025,10,64,Math.PI),brass);edge.rotation.x=-Math.PI/2;edge.position.set(0,2.6,-1.65);scene.add(edge);
}
function micBody(){
 const group=new THREE.Group();group.name='original-studio-microphone';
 const profile=[[0,.0],[.048,.0],[.063,.025],[.068,.22],[.075,.25],[.084,.27],[.088,.31],[.078,.34],[.061,.35],[.061,.43],[.066,.45],[.078,.47],[.083,.49],[.088,.53],[.091,.60],[.086,.67],[.074,.73],[.055,.76],[0,.765]];
 const lathe=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),32);
 const shell=new THREE.Mesh(lathe,steel);shell.castShadow=true;group.add(shell);
 const grille=new THREE.Mesh(new THREE.LatheGeometry([[.083,.49],[.088,.54],[.09,.60],[.085,.68],[.074,.72]].map(([r,y])=>new THREE.Vector2(r,y)),32),black);group.add(grille);
 for(let i=0;i<9;i++){
   const y=.51+i*.023,r=.088+Math.sin(i/8*Math.PI)*.003;
   const rib=new THREE.Mesh(new THREE.TorusGeometry(r,.0026,4,40),brass);rib.rotation.x=Math.PI/2;rib.position.y=y;group.add(rib);
 }
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.11,.009,8,40),brass);ring.rotation.x=Math.PI/2;ring.position.y=.30;group.add(ring);
 const stalk=new THREE.Mesh(new THREE.CylinderGeometry(.012,.019,.72,12),black);stalk.position.y=-.38;group.add(stalk);
 const foot=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.035,32),black);foot.position.y=-.75;group.add(foot);
 group.position.set(.55,.82,.43);group.rotation.z=-.16;
 scene.add(group);return group;
}
function lighting(){
 scene.add(new THREE.HemisphereLight('#8eabc1','#49312b',.85));
 const warm=new THREE.SpotLight('#ffe0b5',115,12,Math.PI/5,.7,1.8);warm.position.set(-2.4,3.9,4.4);warm.target.position.set(0,1.4,0);scene.add(warm,warm.target);
 const cool=new THREE.DirectionalLight('#759aba',2.7);cool.position.set(2.5,2.5,-3.3);scene.add(cool);
 const fill=new THREE.PointLight('#d68f65',14,3.2);fill.position.set(1.7,1.5,2.0);scene.add(fill);
}
function setShot(next){
 if(!bbox)return;
 shot=next;qa.shot=shot;
 const y0=bbox.min.y,h=bbox.max.y-y0,z0=(bbox.min.z+bbox.max.z)/2,cx=(bbox.min.x+bbox.max.x)/2;
 const targets={
 portrait:{p:[cx+.23*h,y0+.94*h,z0+.60*h],t:[cx,y0+.86*h,z0],fov:33},
 hands:{p:[cx+.48*h,y0+.60*h,z0+.88*h],t:[cx,y0+.54*h,z0],fov:37},
 full:{p:[cx+.52*h,y0+.65*h,z0+1.78*h],t:[cx,y0+.47*h,z0],fov:36}
 };
 const c=targets[next]||targets.portrait;camera.position.set(...c.p);camera.lookAt(...c.t);camera.fov=c.fov;camera.updateProjectionMatrix();
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shot===next)));
}
function resize(){if(!renderer)return;let w=Math.max(stage.clientWidth,1),h=Math.max(stage.clientHeight,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function animate(){if(!renderer)return;
 const now=performance.now();if(playing&&faceBone&&headBase){
  const t=(now-start)/1000;
  const downward=t<1.3?0:t<2.6?((t-1.3)/1.3)*.09:t<4.3?.09:t<5.7?.09*(1-(t-4.3)/1.4):0;
  faceBone.rotation.set(headBase.x+downward,headBase.y+(t>3.1&&t<5.7?-.065:0),headBase.z);
  if(t>=6){playing=false;document.getElementById('play').setAttribute('aria-pressed','false');document.getElementById('play').textContent='▶';faceBone.rotation.copy(headBase)}
 }
 renderer.render(scene,camera);qa.frameRendered=true;
}
async function main(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  qa.webgl=true;renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));renderer.setClearColor('#0c1118');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;stage.appendChild(renderer.domElement);
  stageSurface();lighting();micBody();
  const gltf=await new GLTFLoader().loadAsync(SOURCE);
  character=gltf.scene;actorRoot.add(character);qa.animationClips=gltf.animations.length;
  character.traverse(o=>{if(!o.isMesh)return;if(o.geometry?.attributes?.uv)qa.uvMeshes++;if(o.isSkinnedMesh)qa.skinnedMeshes++;o.frustumCulled=false;});
  if(!qa.uvMeshes||!qa.skinnedMeshes)throw new Error('GLB cargado sin UV o rig verificable');
  bbox=new THREE.Box3().setFromObject(character);const size=bbox.getSize(new THREE.Vector3());if(size.y<=0)throw new Error('Bounding box inválido');
  character.scale.multiplyScalar(1.8/size.y);bbox.setFromObject(character);
  const center=bbox.getCenter(new THREE.Vector3());character.position.x-=center.x;character.position.z-=center.z;character.position.y-=bbox.min.y;
  bbox.setFromObject(character);
  character.traverse(o=>{if(o.isBone&&o.name==='Head'){faceBone=o;headBase=o.rotation.clone()}});
  setShot('portrait');resize();new ResizeObserver(resize).observe(stage);
  renderer.setAnimationLoop(animate);qa.loaded=true;qa.getFrame=()=>renderer.domElement.toDataURL('image/png');
 }catch(e){console.error(e);error.textContent='No se pudo verificar el modelo 3D: '+(e?.message||String(e));qa.error=String(e);qa.loaded=false}
}
buttons.forEach(b=>b.addEventListener('click',()=>setShot(b.dataset.shot)));
document.getElementById('play').addEventListener('click',()=>{if(!qa.loaded)return;playing=!playing;if(playing)start=performance.now();const b=document.getElementById('play');b.textContent=playing?'■':'▶';b.setAttribute('aria-pressed',String(playing));if(!playing&&faceBone&&headBase)faceBone.rotation.copy(headBase)});
main();