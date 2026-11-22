/* SECUENCIA / authoring v1 · datos y renderer separados de controles */
(()=>{"use strict";
const KEY="secuencia-w002-08-project-v1",MAX=4*1024*1024;
const $=id=>document.getElementById(id),copy=s=>JSON.parse(JSON.stringify(s));
const TYPES=["cover","text","image","video"],MOTIONS=["rise","fade","zoom","none"],PALETTES=["ink","cream","rust"];
const ctl={storyTitle:$("storyTitle"),type:$("type"),eyebrow:$("eyebrow"),title:$("title"),body:$("bodyText"),duration:$("duration"),motion:$("motion"),palette:$("palette"),caption:$("caption"),alt:$("alt")};
function normalize(raw){
 if(!raw||!Array.isArray(raw.blocks)||raw.blocks.length>80)throw Error("El archivo no contiene una historia válida (máximo 80 escenas).");
 const clamp=(v,n)=>String(v==null?"":v).slice(0,n);
 return {schema:"secuencia.story/v1",title:clamp(raw.title||"Mi secuencia",100),blocks:raw.blocks.map((b,i)=>{
 const type=TYPES.includes(b.type)?b.type:"text",media=typeof b.media==="string"?b.media:"";
 if(media&&(!/^data:(image\/(png|jpeg|webp|avif|gif|svg\+xml)|video\/(mp4|webm|ogg));/i.test(media)||media.length>MAX*1.5))throw Error("La escena "+(i+1)+" tiene un archivo no admitido o demasiado grande.");
 return {id:clamp(b.id||"s"+i,40),type,title:clamp(b.title,180),body:clamp(b.body,1200),eyebrow:clamp(b.eyebrow,90),caption:clamp(b.caption,130),duration:Math.max(2,Math.min(30,Number(b.duration)||6)),motion:MOTIONS.includes(b.motion)?b.motion:"fade",palette:PALETTES.includes(b.palette)?b.palette:"ink",media,alt:clamp(b.alt,200)}
 })};
}
let state=copy(window.SEQ.SEQ_SAMPLE),selected=0,device="desktop",previewTimer=0,noticeTimer=0;
try{const cached=localStorage.getItem(KEY);if(cached)state=normalize(JSON.parse(cached))}catch(e){console.warn("No pudo recuperarse el borrador",e)}
function tell(message,error=false){const el=$("status");el.textContent=message;el.classList.remove("hidden");el.classList.toggle("error",error);clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>el.classList.add("hidden"),5000)}
function save(){
 try{localStorage.setItem(KEY,JSON.stringify(state));$("saveState").textContent="● Guardado local · "+state.blocks.length+" escenas"}
 catch(e){$("saveState").textContent="● Sin guardado local (espacio insuficiente). Exportá JSON para conservar.";tell("El navegador no pudo guardar: exportá el JSON para conservar la historia.",true)}
}
function current(){return state.blocks[selected]}
function updateInspector(){const s=current();$("selectedLabel").textContent=s?"Escena "+String(selected+1).padStart(2,"0"):"Sin escenas";$("storyTitle").value=state.title;
 Object.keys(ctl).forEach(k=>{if(k==="storyTitle")return;ctl[k].value=s?(k==="body"?s.body:s[k]??""):"";ctl[k].disabled=!s});
 for(const id of ["mediaFile","clearMedia","moveUp","moveDown","duplicate","remove"]){$(id).disabled=!s}
 $("moveUp").disabled=selected<=0;$("moveDown").disabled=selected>=state.blocks.length-1;
 $("assetBox").classList.toggle("hidden",!s||s.type==="text");$("mediaInfo").textContent=s?.media?(s.media.startsWith("data:image/svg")?"Ilustración original de la demo incluida":"Archivo incrustado ("+Math.round(s.media.length/1024)+" KB)"):"No hay archivo incrustado";$("mediaFile").value="";
}
function renderList(){const root=$("sceneList");root.replaceChildren();$("count").textContent=state.blocks.length+" escenas";
 state.blocks.forEach((s,i)=>{const card=document.createElement("button");card.type="button";card.className="scene-card"+(i===selected?" selected":"");card.draggable=true;card.dataset.index=i;card.setAttribute("role","listitem");card.setAttribute("aria-current",i===selected?"true":"false");
 const num=document.createElement("span");num.className="num";num.textContent=String(i+1).padStart(2,"0");const content=document.createElement("span");const heading=document.createElement("strong");heading.textContent=s.title||"Sin título";const small=document.createElement("small");small.textContent=({cover:"Portada",text:"Texto",image:"Imagen",video:"Video"}[s.type])+" · "+s.duration+" seg";content.append(heading,small);card.append(num,content);
 card.addEventListener("click",()=>{selected=i;draw();});
 card.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",String(i));e.dataTransfer.effectAllowed="move";card.classList.add("dragging")});
 card.addEventListener("dragend",()=>card.classList.remove("dragging"));
 card.addEventListener("dragover",e=>{e.preventDefault();e.dataTransfer.dropEffect="move"});
 card.addEventListener("drop",e=>{e.preventDefault();const from=Number(e.dataTransfer.getData("text/plain"));if(Number.isInteger(from))move(from,i)});
 root.append(card)})}
function preview(){const file=window.SEQ.makeStandalone(state);$("preview").srcdoc=file}
function refreshPreview(){clearTimeout(previewTimer);previewTimer=setTimeout(preview,180)}
function draw(){renderList();updateInspector();refreshPreview();save()}
function move(from,to){if(from<0||from>=state.blocks.length||to<0||to>=state.blocks.length||from===to)return;const [s]=state.blocks.splice(from,1);state.blocks.splice(to,0,s);selected=to;draw()}
function newId(){return "s"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function addScene(type){if(state.blocks.length>=80){tell("Máximo 80 escenas.",true);return}
 const s={id:newId(),type,eyebrow:"NUEVA ESCENA / "+(state.blocks.length+1),title:({cover:"Un nuevo capítulo",text:"Lo que queremos contar",image:"La imagen permanece",video:"La escena en movimiento"}[type]),body:"Escribí acá tu historia.",caption:"",alt:"",media:"",duration:6,motion:"fade",palette:type==="text"?"cream":"ink"};state.blocks.splice(selected+1,0,s);selected++;draw();tell("Escena añadida · editá el contenido en el panel derecho.")}
function check(){if(!state.blocks.length)return"Agregá al menos una escena antes de exportar.";for(let i=0;i<state.blocks.length;i++){const s=state.blocks[i];if(!s.title.trim())return"La escena "+(i+1)+" necesita título.";if(s.type==="image"&&(!s.media||!s.media.startsWith("data:image/")))return"La escena "+(i+1)+" necesita un archivo de imagen autorizado.";if(s.type==="video"&&(!s.media||!s.media.startsWith("data:video/")))return"La escena "+(i+1)+" necesita un archivo de video autorizado.";}return null}
function download(filename,body,mime){const blob=new Blob([body],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
const slug=s=>(s||"historia").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60)||"historia";
$("exportHtml").addEventListener("click",()=>{const err=check();if(err){tell(err,true);return}
 const html=window.SEQ.makeStandalone(state);download(slug(state.title)+".html",html,"text/html;charset=utf-8");tell("HTML autónomo exportado: "+state.blocks.length+" escenas · medios incrustados.");});
$("saveJson").addEventListener("click",()=>{download(slug(state.title)+".secuencia.json",JSON.stringify(state,null,2),"application/json;charset=utf-8");tell("Proyecto JSON descargado.");});
$("loadJson").addEventListener("click",()=>$("jsonInput").click());
$("jsonInput").addEventListener("change",async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>15*1024*1024)throw Error("Archivo de proyecto demasiado grande.");const next=normalize(JSON.parse(await f.text()));state=next;selected=0;draw();tell("Proyecto JSON abierto. Se cargaron "+next.blocks.length+" escenas.")}catch(err){tell("No se pudo abrir el proyecto: "+err.message,true)}finally{e.target.value=""}});
$("reset").addEventListener("click",()=>{if(!confirm("¿Restaurar la demo original? Esto reemplazará las escenas que estás editando."))return;state=copy(window.SEQ.SEQ_SAMPLE);selected=0;draw();tell("Demo original restaurada.")});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>addScene(b.dataset.add)));
document.querySelectorAll("[data-device]").forEach(b=>b.addEventListener("click",()=>{device=b.dataset.device;$("previewShell").classList.toggle("mobile",device==="mobile");document.querySelectorAll("[data-device]").forEach(c=>{c.classList.toggle("active",c===b);c.setAttribute("aria-pressed",String(c===b))});tell("Vista "+(device==="mobile"?"móvil":"escritorio")+" activada.");}));
for(const [k,input] of Object.entries(ctl)){input.addEventListener("input",()=>{if(k==="storyTitle")state.title=input.value;else if(current())current()[k==="body"?"body":k]=k==="duration"?Math.max(2,Math.min(30,Number(input.value)||2)):input.value;renderList();refreshPreview();save()});}
$("moveUp").addEventListener("click",()=>move(selected,selected-1));$("moveDown").addEventListener("click",()=>move(selected,selected+1));
$("duplicate").addEventListener("click",()=>{if(!current())return;if(state.blocks.length>=80){tell("Máximo 80 escenas.",true);return}const s=copy(current());s.id=newId();s.title=s.title+" (copia)";state.blocks.splice(selected+1,0,s);selected++;draw();tell("Escena duplicada.")});
$("remove").addEventListener("click",()=>{if(!current())return;state.blocks.splice(selected,1);selected=Math.max(0,Math.min(selected,state.blocks.length-1));draw();tell("Escena eliminada.")});
$("clearMedia").addEventListener("click",()=>{if(current()){current().media="";draw();tell("Archivo de esta escena quitado.")}});
$("mediaFile").addEventListener("change",e=>{const file=e.target.files?.[0],s=current();if(!file||!s)return;
 const okImage=["image/png","image/jpeg","image/webp","image/avif","image/gif"],okVideo=["video/mp4","video/webm","video/ogg"];
 if(!(okImage.includes(file.type)||okVideo.includes(file.type))){tell("Formato no admitido. Usá PNG, JPG, WebP, GIF, AVIF, MP4, WebM u OGG.",true);return}
 if(file.size>MAX){tell("Archivo demasiado grande. Máximo 4 MB para export HTML portable.",true);return}
 if(s.type==="video"&&!okVideo.includes(file.type)){tell("Este bloque necesita un video. Cambiá el tipo o elegí MP4/WebM.",true);return}
 if((s.type==="image"||s.type==="cover")&&!okImage.includes(file.type)){tell("Esta escena necesita una imagen. Cambiá el tipo para usar video.",true);return}
 const id=s.id,reader=new FileReader();reader.onerror=()=>tell("No pudo leerse el archivo.",true);reader.onload=()=>{const target=state.blocks.find(b=>b.id===id);if(!target){tell("Escena ya eliminada.",true);return}target.media=String(reader.result);if(!target.alt)target.alt=file.name;draw();tell("Multimedia incrustada · "+file.name)};reader.readAsDataURL(file);
});
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key==="s"){e.preventDefault();save();tell("Cambios guardados localmente.")}});
draw();})();
