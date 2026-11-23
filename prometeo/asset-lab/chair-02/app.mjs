import {generateChair,inspectChair,ASSET_ID} from './geometry.mjs';
const stage=document.querySelector('#stage'),error=document.querySelector('#error'),status=document.querySelector('#status');
const buttons=[...document.querySelectorAll('[data-view]')],turn=document.querySelector('#turn');
const model=generateChair(),inspection=inspectChair(model);
if(!inspection.ok)throw Error('Geometry failed: '+inspection.errors.join(','));
let THREE,renderer,scene,camera,root,angle=.70,elevation=.28,zoom=1,spin=true,last=0,pointers=new Map(),shown=false;
function texture(canvasSize=512){
 const canvas=document.createElement('canvas');canvas.width=canvasSize;canvas.height=canvasSize;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#ddc8a6';ctx.fillRect(0,0,canvasSize,canvasSize);
 let seed=210211;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<740;i++){
  let x=rand()*512,y=rand()*512,w=.15+rand()*.7;
  ctx.strokeStyle=`rgba(69,42,23,${.017+rand()*.17})`;ctx.lineWidth=w;
  ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-7+rand()*15,y+60,x+8-rand()*16,y+160,x+(rand()-.5)*26,y+260);ctx.stroke();
 }
 // Atlas is authored here, no borrowed photographs or external textural assets.
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function createObject(){
 const t=texture();
 const mats={
  oak:new THREE.MeshPhysicalMaterial({color:0x9a7554,roughness:.61,metalness:0,clearcoat:.14,clearcoatRoughness:.72,map:t,side:THREE.DoubleSide}),
  leather:new THREE.MeshPhysicalMaterial({color:0x6c4936,roughness:.88,metalness:0,side:THREE.DoubleSide}),
  brass:new THREE.MeshStandardMaterial({color:0xba9c67,roughness:.33,metalness:.72,side:THREE.DoubleSide})
 };
 root=new THREE.Group();root.name=ASSET_ID;
 for(const part of model.parts){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(part.positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(part.uvs,2));g.setIndex(part.indices);g.computeVertexNormals();
  const o=new THREE.Mesh(g,mats[part.material]);o.name=part.name;o.userData={role:part.role};
  o.castShadow=true;o.receiveShadow=true;root.add(o);
 }
 return root;
}
function resize(){if(!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
 const aspect=w/h,vertical=1.37/zoom;camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;
 camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
function setView(id){const presets={three:[.76,.32],front:[0,.10],profile:[Math.PI/2,.14],rear:[Math.PI,.11]};
 const target=presets[id];if(!target)return;
 [angle,elevation]=target;spin=false;turn.setAttribute('aria-pressed','false');turn.textContent='Girar';
 for(const b of buttons)b.setAttribute('aria-pressed',String(b.dataset.view===id));draw();
}
function cameraPos(){const r=2.40,phi=Math.max(-.25,Math.min(.75,elevation));
 camera.position.set(Math.sin(angle)*r*Math.cos(phi),.445+Math.sin(phi)*r,Math.cos(angle)*r*Math.cos(phi));
 camera.lookAt(0,.437,-.018);
}
function draw(){if(!renderer)return;cameraPos();renderer.render(scene,camera);
 if(!shown){shown=true;document.body.dataset.render='WEBGL_FRAME_RENDERED';status.textContent='WebGL activo · '+inspection.stats.parts+' piezas';}}
function tick(time){const dt=Math.min((time-last)/1000||0,.04);last=time;
 if(spin&&!matchMedia('(prefers-reduced-motion: reduce)').matches)angle+=dt*.14;
 draw();requestAnimationFrame(tick);
}
for(const b of buttons)b.addEventListener('click',()=>setView(b.dataset.view));
turn.addEventListener('click',()=>{spin=!spin;turn.setAttribute('aria-pressed',String(spin));
 turn.textContent=spin?'Pausar':'Girar';buttons.forEach(b=>b.setAttribute('aria-pressed','false'));});
stage.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});stage.setPointerCapture(e.pointerId);spin=false;
 turn.setAttribute('aria-pressed','false');turn.textContent='Girar';buttons.forEach(b=>b.setAttribute('aria-pressed','false'));});
stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const p=pointers.get(e.pointerId);
 angle-=(e.clientX-p.x)*.009;elevation=Math.max(-.18,Math.min(.72,elevation+(e.clientY-p.y)*.005));
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!spin)draw();});
const clear=e=>pointers.delete(e.pointerId);stage.addEventListener('pointerup',clear);stage.addEventListener('pointercancel',clear);
stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.77,Math.min(1.6,zoom+(e.deltaY<0?.06:-.06)));resize();draw();},{passive:false});
document.querySelector('#details').addEventListener('click',()=>{
 const panel=document.querySelector('#recipe');panel.hidden=!panel.hidden;
 document.querySelector('#details').setAttribute('aria-expanded',String(!panel.hidden));
});
try{
 THREE=await import('https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.js');
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.42;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 stage.append(renderer.domElement);scene=new THREE.Scene();scene.background=new THREE.Color(0xd6cbbb);
 camera=new THREE.OrthographicCamera(-1,1,1,-1,.05,30);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshStandardMaterial({color:0xd6cbbb,roughness:1}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.002;ground.receiveShadow=true;scene.add(ground);
 scene.add(new THREE.HemisphereLight(0xfff2df,0x5a4a42,2.5));
 const key=new THREE.DirectionalLight(0xfff4e3,3.2);key.position.set(-2.5,4,3.5);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-1.6;key.shadow.camera.right=1.6;
 key.shadow.camera.top=1.7;key.shadow.camera.bottom=-1.7;key.shadow.bias=-.00032;scene.add(key);
 const rim=new THREE.DirectionalLight(0xd7e1e7,1.45);rim.position.set(2.1,2.8,-2.2);scene.add(rim);
 scene.add(createObject());resize();new ResizeObserver(resize).observe(stage);
 document.body.dataset.runtime='THREE_ACTIVE';
 window.__PROMETEO_ASSET__={assetId:ASSET_ID,inspection,parts:()=>root.children.map(c=>c.name),render:()=>shown,view:setView};
 draw();requestAnimationFrame(tick);
}catch(e){document.body.dataset.runtime='WEBGL_UNAVAILABLE';document.body.dataset.render='NOT_RENDERED';
 error.hidden=false;error.textContent='No se pudo iniciar Three.js/WebGL en este navegador. El modelo sigue disponible como código, pero no se muestra una imagen falsa. '+String(e.message||e);
 status.textContent='Render no disponible';console.error('ARC CHAIR 02',e);
}
