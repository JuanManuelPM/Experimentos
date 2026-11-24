import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.js';
import {generate,inspect} from './geometry.mjs';
import {generateChair as generateHelix} from '../chair-02/geometry.mjs';
function viewer(THREE, generate, inspect, generateHelix){
 const $=id=>document.getElementById(id), stage=$("stage"), renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0xe8e5df);
 const camera=new THREE.OrthographicCamera(-1,1,1,-1,.01,20);
 const hemi=new THREE.HemisphereLight(0xffffff,0x77706a,2.0);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xfff2df,3.0);key.position.set(2.2,3.8,3.0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-1.5,right:1.5,top:1.5,bottom:-1.5,near:.1,far:10});key.shadow.normalBias=.008;scene.add(key);
 const rim=new THREE.DirectionalLight(0xdce8ff,1.8);rim.position.set(-2,2,-2);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:0xd9d5ce,roughness:.94}));floor.rotation.x=-Math.PI/2;floor.position.y=-.004;floor.receiveShadow=true;scene.add(floor);
 // Authored fine-grain atlas, no photographic or third-party assets.
 const canvas=document.createElement("canvas");canvas.width=256;canvas.height=512;const c=canvas.getContext("2d");c.fillStyle="#cbb08c";c.fillRect(0,0,256,512);let seed=135;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let j=0;j<220;j++){const x=rand()*256;c.lineWidth=.3+rand()*.8;c.strokeStyle="rgba(80,48,22,"+(.018+rand()*.10)+")";c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+3,160,x-3,350,x+1,512);c.stroke();}
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const mats={oak:new THREE.MeshPhysicalMaterial({color:0xc3a27c,map:tex,roughness:.64,clearcoat:.12,clearcoatRoughness:.6}),rail:new THREE.MeshStandardMaterial({color:0x363b3b,roughness:.46,metalness:.44}),clay:new THREE.MeshPhysicalMaterial({color:0xa6614c,roughness:.54,clearcoat:.12}),leather:new THREE.MeshStandardMaterial({color:0x735242,roughness:.8}),brass:new THREE.MeshStandardMaterial({color:0xb49a6e,roughness:.4,metalness:.65})};
 const neutral=new THREE.MeshStandardMaterial({color:0xb8b5ad,roughness:.67}),models={},groups={};
 const old=generateHelix();models.helix={...old,name:"HÉLICE 02",notes:"Referencia original · cuatro patas, montantes y respaldo separado"};
 for(const id of ["rail","petal"])models[id]=generate(id);
 for(const [id,m] of Object.entries(models)){const group=new THREE.Group();group.name=id;for(const p of m.parts){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(p.positions,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(p.uvs,2));g.setIndex(p.indices);g.computeVertexNormals();const mat=mats[p.material]||neutral;const mesh=new THREE.Mesh(g,id==="helix"?mat.clone():mat);if(id==="helix")mesh.material.side=THREE.DoubleSide;mesh.name=p.name;mesh.userData.original=mesh.material;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}scene.add(group);groups[id]=group;}
 let selected=new URLSearchParams(location.search).get("model")||"rail";if(!models[selected])selected="rail";let angle=.75,elevation=.24,zoom=1,drag=null,plain=false;
 const buttons=[...document.querySelectorAll("[data-model]")],views=[...document.querySelectorAll("[data-view]")];
 function draw(){const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),aspect=w/h,span=Math.max(1.12,.80/aspect)/zoom;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);const r=3;camera.position.set(r*Math.sin(angle)*Math.cos(elevation),.43+r*Math.sin(elevation),r*Math.cos(angle)*Math.cos(elevation));camera.lookAt(0,.43,-.02);renderer.render(scene,camera);}
 function select(id){selected=id;for(const [k,g] of Object.entries(groups))g.visible=k===id;for(const b of buttons)b.setAttribute("aria-pressed",String(b.dataset.model===id));$("name").textContent=models[id].name;$("description").textContent={rail:"Patines continuos · respaldo abierto · madera y acero",petal:"Carcasa continua · pedestal radial · compuesto moldeado",helix:"Referencia anterior · cuatro patas y respaldo independiente"}[id];$("status").textContent=id==="helix"?"Referencia original":(inspect(models[id]).ok?"Geometría comprobada · arte pendiente":"Geometría con errores");const url=new URL(location.href);url.searchParams.set("model",id);history.replaceState(null,"",url);draw();}
 for(const b of buttons)b.onclick=()=>select(b.dataset.model);
 const preset={front:[0,0],profile:[Math.PI/2,0],three:[.75,.24],rear:[Math.PI,0]};
 for(const b of views)b.onclick=()=>{[angle,elevation]=preset[b.dataset.view];zoom=1;for(const x of views)x.setAttribute("aria-pressed",String(x===b));draw();};
 $("neutral").onclick=()=>{plain=!plain;$("neutral").setAttribute("aria-pressed",String(plain));for(const g of Object.values(groups))for(const m of g.children)m.material=plain?neutral:m.userData.original;draw();};
 $("capture").onclick=()=>{draw();const a=document.createElement("a");a.href=renderer.domElement.toDataURL("image/png");a.download=selected+"-threejs.png";a.click();};
 const el=renderer.domElement;el.addEventListener("pointerdown",e=>{drag=[e.clientX,e.clientY];el.setPointerCapture(e.pointerId);});el.addEventListener("pointermove",e=>{if(!drag)return;angle-=(e.clientX-drag[0])*.008;elevation=Math.max(-.15,Math.min(.75,elevation+(e.clientY-drag[1])*.007));drag=[e.clientX,e.clientY];views.forEach(b=>b.setAttribute("aria-pressed","false"));draw();});for(const ev of ["pointerup","pointercancel","lostpointercapture"])el.addEventListener(ev,()=>drag=null);
 el.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.7,Math.min(1.8,zoom*Math.exp(-e.deltaY*.001)));draw();},{passive:false});new ResizeObserver(draw).observe(stage);
 select(selected);$("error").hidden=true;window.prometeo={models,select,draw};
}
viewer(THREE,generate,inspect,generateHelix);
