import {AXES,TAGS,PRESETS,createAxisEngine,fontSettings,motionAt} from "./engine.mjs";
const engine=createAxisEngine(PRESETS.pulso);
const get=id=>document.getElementById(id);
const axisInputs=Object.fromEntries(TAGS.map(tag=>[tag,get("axis-"+tag)]));
const axisOutputs=Object.fromEntries(TAGS.map(tag=>[tag,get("value-"+tag)]));
const specimens=[...document.querySelectorAll("[data-font]")];
const input=get("text-input"),preview=get("specimen-word"),kinetic=get("kinetic-word");
const status=get("live-status"),play=get("play"),playText=get("play-text"),seek=get("seek"),seekOutput=get("seek-output"),phase=get("motion-phase"),coords=get("motion-coords"),reduce=get("reduce-motion");
const systemReduced=window.matchMedia("(prefers-reduced-motion: reduce)");
let manualReduced=false,playing=false,animationFrame=0,startedAt=0,progress=0;
const duration=10000;
const announce=message=>{status.textContent=message};
function paint(state){
 const css=fontSettings(state);
 for(const element of specimens)element.style.fontVariationSettings=css;
 for(const tag of TAGS){axisInputs[tag].value=String(state[tag]);axisOutputs[tag].textContent=String(state[tag])}
 get("css-preview").textContent="font-variation-settings: "+css+";";
 coords.textContent="wght "+state.wght+" / opsz "+state.opsz+" / SOFT "+state.SOFT+" / WONK "+state.WONK;
}
engine.subscribe(paint);paint(engine.get());
function pause(){
 if(animationFrame)cancelAnimationFrame(animationFrame);animationFrame=0;playing=false;
 play.setAttribute("aria-pressed","false");playText.textContent="REPRODUCIR";
 play.querySelector(".play-icon").textContent="▶";
}
function reduceActive(){return manualReduced||systemReduced.matches}
function updateReduce(){
 if(reduceActive())pause();
 reduce.setAttribute("aria-pressed",String(manualReduced));
 reduce.textContent=reduceActive()?"SIN MOVIMIENTO: SÍ":"SIN MOVIMIENTO: NO";
 play.disabled=reduceActive();play.title=reduceActive()?"Mové la barra de posición para explorar sin animación":"Reproducir o pausar la secuencia";
}
function showPosition(position){
 progress=Math.max(0,Math.min(1,position));
 seek.value=String(Math.round(progress*1000));
 seekOutput.textContent=String(Math.round(progress*100)).padStart(2,"0")+"%";
 const frame=motionAt(progress);phase.textContent="ESTADO / "+frame.name;
 engine.setAll(frame.axes);
}
function tick(timestamp){
 if(!playing)return;
 const elapsed=timestamp-startedAt;showPosition((elapsed%duration)/duration);
 animationFrame=requestAnimationFrame(tick);
}
function start(){
 if(reduceActive()){announce("Movimiento reducido activo. Explorá los ejes o deslizá la posición.");return}
 if(playing){pause();announce("Secuencia pausada");return}
 playing=true;startedAt=performance.now()-progress*duration;
 play.setAttribute("aria-pressed","true");playText.textContent="PAUSAR";
 play.querySelector(".play-icon").textContent="Ⅱ";
 animationFrame=requestAnimationFrame(tick);announce("Secuencia reproduciéndose");
}
function clearPresets(){for(const button of document.querySelectorAll("[data-preset]"))button.setAttribute("aria-pressed","false")}
for(const tag of TAGS){
 axisInputs[tag].addEventListener("input",event=>{
   pause();clearPresets();engine.setAxis(tag,event.currentTarget.value);
 });
}
for(const button of document.querySelectorAll("[data-preset]")){
 button.addEventListener("click",()=>{
   pause();clearPresets();button.setAttribute("aria-pressed","true");
   engine.setAll(PRESETS[button.dataset.preset]);announce("Composición "+button.textContent+" aplicada");
 });
}
get("reset").addEventListener("click",()=>{
 pause();engine.setAll(PRESETS.pulso);clearPresets();
 document.querySelector('[data-preset="pulso"]').setAttribute("aria-pressed","true");
 showPosition(0);announce("Valores reiniciados");
});
input.addEventListener("input",()=>{
 const value=input.value||"Escribí";
 preview.textContent=value;kinetic.textContent=value;
});
play.addEventListener("click",start);
seek.addEventListener("input",event=>{pause();clearPresets();showPosition(Number(event.currentTarget.value)/1000)});
reduce.addEventListener("click",()=>{manualReduced=!manualReduced;updateReduce();announce(reduceActive()?"Movimiento desactivado":"Movimiento habilitado")});
systemReduced.addEventListener?.("change",updateReduce);
get("copy").addEventListener("click",async()=>{
 const css="font-variation-settings: "+fontSettings(engine.get())+";";
 try{if(!navigator.clipboard?.writeText)throw new Error("Clipboard API no disponible");
 await navigator.clipboard.writeText(css);announce("CSS copiado");get("copy").firstChild.textContent="COPIADO ";
 }catch{announce("No se pudo copiar. Seleccioná el CSS visible debajo de los botones.");}
});
input.dispatchEvent(new Event("input"));
updateReduce();
if(document.fonts?.load){
 document.fonts.load('600 32px "FrauncesLocal"').then(faces=>{
 const ok=faces.length>0&&document.fonts.check('600 32px "FrauncesLocal"');
 get("font-indicator").textContent=ok?"FRAUNCES / LOCAL ✓":"FUENTE NO DISPONIBLE / RESPALDO";
 if(!ok)announce("No cargó Fraunces. El texto sigue accesible en fuente de respaldo.");
 }).catch(()=>{get("font-indicator").textContent="FUENTE NO DISPONIBLE / RESPALDO"});
}else{get("font-indicator").textContent="FUENTE / ESTADO NO VERIFICABLE";}
window.addEventListener("pagehide",pause);
