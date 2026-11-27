import * as THREE from "./vendor/three.module.min.js";
import {joint,FRONT,SPEC} from "./geometry.mjs";
import {extendedBuild,fork,sweptBounds,protectPose,VERSION} from "./fork.mjs";
import {CAMERA,initialView,drag,zoom,toggleMacro,pose} from "./camera.mjs";
const stage=document.querySelector("#stage"),status=document.querySelector("#status"),error=document.querySelector("#error");
let renderer,scene,camera,model,box,forkBox,view=initialView(),angle=0,aim=0,spread=.70,spreadAim=.70,forkFocus=false,animation=0,lastTap=null,statusTimer=0,tapTimer=0,pinchBase=0;
const spreadButton=document.querySelector("#spread"),focusButton=document.querySelector("#focusFork"),flexButton=document.querySelector("#flex");
const meshes=new Map(),pointers=new Map();let press=null;
const mats={
 ceramic:new THREE.MeshPhysicalMaterial({color:0x363a3c,roughness:.53,metalness:.22,clearcoat:.15,clearcoatRoughness:.52}),
 ceramicB:new THREE.MeshPhysicalMaterial({color:0x414443,roughness:.59,metalness:.16,clearcoat:.13}),
 steel:new THREE.MeshStandardMaterial({color:0x6a6255,roughness:.36,metalness:.82}),
 membrane:new THREE.MeshStandardMaterial({color:0x39312b,roughness:.64,metalness:.22}),
 inner:new THREE.MeshStandardMaterial({color:0x242729,roughness:.78,metalness:.15})
};
function meshGeometry(part){
 const g=new THREE.BufferGeometry();
 g.setAttribute("position",new THREE.Float32BufferAttribute(part.positions,3));g.setIndex(part.indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
 return g;
}
function createMesh(part,group){
 const mesh=new THREE.Mesh(meshGeometry(part),mats[part.material]);mesh.name=part.id;mesh.userData={role:part.role,partId:part.id,dynamic:part.dynamic};
 mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);meshes.set(part.id,mesh);
}
function updateParts(parts){
 for(const part of parts){const mesh=meshes.get(part.id);if(!mesh)throw Error("missing part "+part.id);const old=mesh.geometry;mesh.geometry=meshGeometry(part);old.dispose();}
}
function tell(message){status.textContent=message;status.hidden=false;clearTimeout(statusTimer);statusTimer=setTimeout(()=>{status.hidden=true;},2100);}
function setPose(nextAngle,nextSpread){
 aim=nextAngle;spreadAim=nextSpread;cancelAnimationFrame(animation);
 const start=angle,initialSpread=spread,now=performance.now(),reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
 function tick(t){
  const x=reduced?1:Math.min(1,(t-now)/620),e=x*x*(3-2*x),a=start+(aim-start)*e,s=initialSpread+(spreadAim-initialSpread)*e;
  if(Math.abs(a-angle)>1e-10)updateParts(joint(a).parts);
  if(Math.abs(a-angle)>1e-10||Math.abs(s-spread)>1e-10)updateParts(fork(a,s).parts);
  angle=a;spread=s;document.body.dataset.spread=spread.toFixed(3);draw();if(x<1)animation=requestAnimationFrame(tick);
 }
 animation=requestAnimationFrame(tick);
}
function flex(){if(!renderer||!model)return;setPose(aim>0?-.30:.30,spreadAim);tell("Articulación compartida · UNKNOWN");}
function spreadFork(){if(!renderer||!model)return;const next=spreadAim>.5?0:1;spreadButton.setAttribute("aria-pressed",String(next===1));spreadButton.textContent=next===1?"Cerrar":"Abrir";setPose(aim,next);tell("Bifurcación mecánica · inspección, no telemetría");}
function clearFocus(){forkFocus=false;focusButton.setAttribute("aria-pressed","false");focusButton.textContent="Ver bifurcación";}
function focusOnFork(){if(!renderer||!model)return;if(forkFocus){clearFocus();view=initialView();}else{forkFocus=true;focusButton.setAttribute("aria-pressed","true");focusButton.textContent="Vista general";view={...initialView(),y:(forkBox.min[1]+forkBox.max[1])/2};}draw();}
spreadButton.addEventListener("click",spreadFork);focusButton.addEventListener("click",focusOnFork);flexButton.addEventListener("click",flex);
function resize(){if(!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();draw();}
function draw(){
 if(!renderer)return;const P=protectPose(pose(forkFocus?{...view,macro:false}:view,camera.aspect,forkFocus?forkBox:box,FRONT),forkBox);
 camera.position.set(...P.position);camera.lookAt(...P.target);
 renderer.render(scene,camera);document.body.dataset.render="FRAME_RETURNED";
}
function inspect(){clearFocus();view=toggleMacro(view);draw();tell(view.macro?"Inspección de la unión · tocá para articular":"Vista general · estado UNKNOWN");}
function point(e){return {x:e.clientX,y:e.clientY};}
function gap(){const a=[...pointers.values()];return a.length===2?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0;}
stage.addEventListener("pointerdown",e=>{if(e.button>0&&e.pointerType==="mouse")return;stage.focus({preventScroll:true});stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,point(e));if(pointers.size===1)press={...point(e),at:performance.now(),moved:false};else{press=null;pinchBase=gap();clearTimeout(tapTimer);lastTap=null;}});
stage.addEventListener("pointermove",e=>{
 if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId),P=point(e);pointers.set(e.pointerId,P);
 if(pointers.size===2){const d=gap();if(pinchBase>2&&d>2)view=zoom(view,d/pinchBase);pinchBase=d;draw();return;}
 if(pointers.size!==1)return;
 if(press&&Math.hypot(P.x-press.x,P.y-press.y)>6)press.moved=true;
 if(!press||press.moved){view=drag(view,P.x-old.x,P.y-old.y,stage.clientHeight);draw();}
});
function release(e,cancel=false){
 if(!pointers.has(e.pointerId))return;const was=pointers.size,p=press; pointers.delete(e.pointerId);pinchBase=gap();press=null;
 if(cancel||was!==1||!p||p.moved||performance.now()-p.at>420)return;
 const t=performance.now(),pt=point(e);
 if(lastTap&&t-lastTap.t<330&&Math.hypot(pt.x-lastTap.x,pt.y-lastTap.y)<35){clearTimeout(tapTimer);lastTap=null;inspect();}
 else{lastTap={...pt,t};tapTimer=setTimeout(()=>{lastTap=null;if(forkFocus)spreadFork();else if(view.macro)flex();else tell("UNKNOWN · sin fuente de datos en vivo. Doble toque: inspeccionar unión.");},340);}
}
stage.addEventListener("pointerup",e=>release(e));stage.addEventListener("pointercancel",e=>release(e,true));stage.addEventListener("lostpointercapture",e=>release(e,true));
stage.addEventListener("wheel",e=>{e.preventDefault();view=zoom(view,Math.exp(-e.deltaY*.0015));draw();},{passive:false});
stage.addEventListener("keydown",e=>{
 const k=e.key;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","-"," ","Enter","Escape","Home","i"].includes(k))e.preventDefault();else return;
 if(k==="ArrowLeft"||k==="ArrowRight")view=drag(view,k==="ArrowLeft"?26:-26,0,stage.clientHeight);
 if(k==="ArrowUp"||k==="ArrowDown")view=drag(view,0,k==="ArrowUp"?-25:25,stage.clientHeight);
 if(k==="+")view=zoom(view,1.15);if(k==="-")view=zoom(view,1/1.15);if(k==="Enter")inspect();if(k===" ")flex();if(k==="Home"||k==="Escape"){clearFocus();view=initialView();}if(k==="i")tell("UNKNOWN · sin datos en vivo. Flechas, +/−, Enter, espacio, Home.");draw();
});
function lights(){
 const hemi=new THREE.HemisphereLight(0xb5c5d5,0x352c25,2.25);scene.add(hemi);
 const key=new THREE.DirectionalLight(0xf8e0be,3.4);key.position.set(2.8,5.3,3.8);scene.add(key);
 const edge=new THREE.DirectionalLight(0xb1c9e4,2.8);edge.position.set(-2,2.8,-4.5);scene.add(edge);
 const fill=new THREE.DirectionalLight(0xd8b28c,1.0);fill.position.set(0,-2.0,3);scene.add(fill);
 // Authored softbox environment, not a borrowed image; no emissive telemetry.
 const env=new THREE.Scene();env.background=new THREE.Color(0x2e3036);
 const panel=(x,y,z,w,h,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);env.add(m);};
 panel(3,5,2,4,3,0xffe9c7);panel(-2,2,-4,3,5,0x91aac5);panel(-4,0,4,2,4,0x888888);
 const pmrem=new THREE.PMREMGenerator(renderer);const target=pmrem.fromScene(env,.10,.1,40);scene.environment=target.texture;scene.environmentIntensity=.62;pmrem.dispose();
 env.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(1.65,window.devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
 renderer.domElement.setAttribute("aria-label","The Root Machine M08, editable chamber and articulated terminal bifurcation, unknown data status");stage.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0x080a0c);camera=new THREE.PerspectiveCamera(CAMERA.fov,1,CAMERA.near,CAMERA.far);
 model=extendedBuild();box=sweptBounds();forkBox=sweptBounds(true);document.body.dataset.spread=spread.toFixed(3);
 const group=new THREE.Group();group.name=VERSION;scene.add(group);for(const part of model.parts)createMesh(part,group);
 lights();new ResizeObserver(resize).observe(stage);window.addEventListener("resize",resize);resize();
 renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();document.body.dataset.render="CONTEXT_LOST";error.hidden=false;error.textContent="WebGL perdió el contexto. Recargá el archivo para intentar recuperar la escena.";});
 document.body.dataset.dataMode=model.data.mode;
}catch(e){document.body.dataset.render="ERROR";error.hidden=false;error.textContent="No se pudo iniciar la escena 3D: "+String(e.message||e);console.error(e);}
