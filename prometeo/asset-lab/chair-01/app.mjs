import {createChair,VARIANTS} from "./chair.mjs";
import {ASSET_ID} from "./geometry.mjs";
const stage=document.querySelector("#stage"),state=document.querySelector("#state"),
 overlay=document.querySelector("#overlay"),hint=document.querySelector("#hint"),
 heart=document.querySelector("#heart"),toggle=document.querySelector("#toggle");
let renderer,camera,scene,chair,raf=0,angle=.6,tilt=.12,last=performance.now(),pause=false,
 variant=0,manualUntil=0,drag=null,lastTap=0,hideTimer=0;
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const favoriteKey="prometeo-like:"+ASSET_ID;
const liked=()=>localStorage.getItem(favoriteKey)==="true";
heart.setAttribute("aria-pressed",String(liked()));heart.textContent=liked()?"♥":"♡";
function toast(msg){hint.textContent=msg;hint.classList.add("show");setTimeout(()=>hint.classList.remove("show"),1900);}
function controls(){overlay.classList.add("show");overlay.setAttribute("aria-hidden","false");
 clearTimeout(hideTimer);hideTimer=setTimeout(()=>{if(!drag){overlay.classList.remove("show");overlay.setAttribute("aria-hidden","true")}},4100);}
function like(){const now=!liked();localStorage.setItem(favoriteKey,String(now));heart.textContent=now?"♥":"♡";
 heart.setAttribute("aria-pressed",String(now));toast(now?"Favorito local guardado":"Favorito local retirado");}
function change(automatic=false){variant=(variant+1)%VARIANTS.length;chair?.variant(variant);if(!automatic){toast(VARIANTS[variant].title);controls();}}
function resize(){if(!renderer)return;const w=stage.clientWidth,h=stage.clientHeight;
 camera.aspect=w/h;camera.fov=w/h>1.5?34:42;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
function position(){const r=1.78;camera.position.set(Math.sin(angle)*r,.91+Math.sin(tilt)*.32,Math.cos(angle)*r);
 camera.lookAt(0,.42,-.03);}
function frame(time){const dt=Math.min((time-last)/1000,.05);last=time;
 if(!pause&&!reduce&&time>manualUntil){angle+=dt*.18;if(time-lastVariant>11000){lastVariant=time;change(true);}}
 position();renderer.render(scene,camera);raf=requestAnimationFrame(frame);}
let lastVariant=performance.now();
toggle.onclick=()=>{pause=!pause;toggle.textContent=pause?"▶":"Ⅱ";toast(pause?"Pausado":"Demo automática");controls();};
document.querySelector("#variant").onclick=()=>change(false);heart.onclick=like;
document.querySelector("#obj").onclick=()=>{chair?.downloadOBJ();toast("OBJ geométrico descargado");controls();};
document.querySelector("#copy").onclick=async()=>{const note="PROMETEO · Objeto a revisar/guardar\nID: "+ASSET_ID+
 "\nVersión: 0.1.0\nURL: "+location.href.split("?")[0]+
 "\nSolicito: aprobar / mejorar (indicar en el chat)\nNota: mi favorito local no es aprobación GitHub.";
 try{await navigator.clipboard.writeText(note);toast("Referencia copiada para el chat");}catch(e){toast("No se pudo copiar la referencia")}controls();};
stage.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false};
 stage.setPointerCapture?.(e.pointerId);manualUntil=performance.now()+4600;});
stage.addEventListener("pointermove",e=>{if(!drag||e.pointerId!==drag.id)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;
 angle-=dx*.009;tilt=Math.max(-.75,Math.min(.75,tilt+dy*.004));drag.x=e.clientX;drag.y=e.clientY;});
stage.addEventListener("pointerup",e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;
 const now=performance.now();if(!moved&&now-lastTap<330){like();lastTap=0;}else if(!moved){lastTap=now;controls();}});
stage.addEventListener("pointercancel",()=>drag=null);
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(k===" "){e.preventDefault();toggle.click();}
 if(k==="l")like();if(k==="v")change();if(k==="h")controls();});
try{
 const THREE=await import("https://cdn.jsdelivr.net/npm/three@0.181.0/build/three.module.js");
 renderer=new THREE.WebGLRenderer({alpha:false,antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.48;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.setAttribute("aria-hidden","true");stage.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0xddd1c2);
 camera=new THREE.PerspectiveCamera(40,1,.04,30);
 const ambient=new THREE.HemisphereLight(0xf9eee1,0x776e66,2.4);scene.add(ambient);
 const key=new THREE.DirectionalLight(0xffe8cb,3.5);key.position.set(-2.5,4.2,3);
 key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-2;
 key.shadow.camera.right=2;key.shadow.camera.top=2;key.shadow.camera.bottom=-2;key.shadow.bias=-.0003;scene.add(key);
 const rim=new THREE.DirectionalLight(0xe5efff,1.7);rim.position.set(2.5,2.6,-2.1);scene.add(rim);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.MeshStandardMaterial({color:0xddd1c2,roughness:.97}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.003;floor.receiveShadow=true;scene.add(floor);
 chair=createChair(THREE);scene.add(chair.root);position();resize();
 new ResizeObserver(resize).observe(stage);state.hidden=true;document.querySelector("#technical-preview").hidden=true;
 window.__PROMETEO_ASSET_QA__={assetId:ASSET_ID,geometry:()=>chair.qa,
  renderCalls:()=>renderer.info.render.calls,variant:()=>variant,hasCanvas:()=>!!renderer.domElement};
 raf=requestAnimationFrame(frame);
}catch(e){state.hidden=false;state.textContent="Vista técnica disponible · No se pudo iniciar WebGL";toast("WebGL no disponible: vista técnica");console.warn("PROMETEO 3D unavailable",e);
 document.body.dataset.runtime="ERROR";}
