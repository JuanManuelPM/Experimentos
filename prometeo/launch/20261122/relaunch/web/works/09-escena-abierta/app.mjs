import {DAYS,STAGES,TYPES,PHOTOS,EVENTS} from "./data.mjs";
import {filterEvents,conflicts,createAgenda,timeEnd,exportICS} from "./festival-core.mjs";
const $=id=>document.getElementById(id),byId=new Map(EVENTS.map(e=>[e.id,e]));
let localStore;try{localStore=globalThis.localStorage}catch{localStore={getItem(){throw Error("unavailable")},setItem(){throw Error("unavailable")}}}
const agenda=createAgenda(localStore,undefined,EVENTS.map(e=>e.id));
let day="",activeEvent=null,toastTimeout;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const chosen=()=>agenda.get();
const eventLabel=e=>e.day.slice(-2)+"/04 · "+e.time+"–"+timeEnd(e);
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("visible");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove("visible"),2300)}
function card(e){
 const saved=agenda.has(e.id);
 const label=escapeHTML(e.title),kicker=escapeHTML(e.kicker),stage=escapeHTML(e.stage);
 return '<article class="event" id="card-'+escapeHTML(e.id)+'" data-id="'+escapeHTML(e.id)+'">'+
 '<div class="event-time"><span class="time">'+escapeHTML(e.time)+'</span><span class="end-time">— '+escapeHTML(timeEnd(e))+'</span><div class="event-stage">'+stage+' · '+e.day.slice(-2)+'/04</div></div>'+
 '<div class="event-main"><a class="event-title" href="#evento/'+encodeURIComponent(e.id)+'">'+label+'</a><div class="event-sub">'+kicker+'</div></div>'+
 '<span class="type-tag">'+escapeHTML(e.type)+'</span>'+
 '<button type="button" class="save-button" data-save="'+escapeHTML(e.id)+'" aria-pressed="'+saved+'" aria-label="'+(saved?'Quitar de mi agenda: ':'Guardar en mi agenda: ')+label+'">'+(saved?'✓ Guardado':'+ Guardar')+'</button></article>';
}
function renderEvents(){
 const selected=filterEvents(EVENTS,{day,stage:$("stage").value,type:$("genre").value,query:$("search").value,onlyIds:$("onlyAgenda").checked?chosen():null});
 $("eventList").innerHTML=selected.map(card).join("");
 $("resultCount").textContent=selected.length+" "+(selected.length===1?"actividad":"actividades");
 $("empty").hidden=selected.length!==0;
 document.querySelectorAll("[data-day]").forEach(b=>{const on=b.dataset.day===day;b.classList.toggle("chosen",on);b.setAttribute("aria-pressed",String(on))});
}
function renderAgenda(){
 const ids=chosen(),rows=filterEvents(EVENTS,{onlyIds:ids});
 $("topCount").textContent=ids.length;$("agendaCount").textContent=ids.length+" GUARDADOS";
 $("agendaItems").innerHTML=rows.length?rows.map(e=>'<div class="agenda-entry"><span>'+escapeHTML(e.day.slice(-2)+'/04')+'<br>'+escapeHTML(e.time)+'</span><div><strong>'+escapeHTML(e.title)+'</strong><br><span>'+escapeHTML(e.stage)+'</span></div><button type="button" data-remove="'+escapeHTML(e.id)+'" aria-label="Quitar '+escapeHTML(e.title)+'">✕</button></div>').join(""):'<p class="muted">Tu agenda está vacía. Tocá “+ Guardar” en cualquier actividad.</p>';
 const pairs=conflicts(ids,EVENTS),panel=$("conflictPanel");
 panel.hidden=pairs.length===0;
 panel.innerHTML=pairs.length?'<strong>ATENCIÓN · '+pairs.length+' '+(pairs.length===1?'CRUCE':'CRUCES')+' DE HORARIOS</strong><ul>'+pairs.map(([a,b])=>'<li>'+escapeHTML(byId.get(a).title)+' ↔ '+escapeHTML(byId.get(b).title)+'</li>').join("")+'</ul>':"";
 $("storageStatus").textContent=agenda.persistent()?"Guardado localmente en este navegador. Podés exportarlo; no se envían datos.":"El navegador bloqueó el almacenamiento. La agenda funciona solo hasta cerrar esta página.";
 $("exportAgenda").disabled=!ids.length;$("clearAgenda").disabled=!ids.length;
}
function renderAll(){renderAgenda();renderEvents();if(activeEvent)renderDetail(activeEvent)}
function toggle(id){try{const saved=agenda.toggle(id);renderAll();toast(saved?"Agregado a tu agenda":"Quitado de tu agenda")}catch(e){toast("No se pudo guardar")}}
function renderDetail(id){
 const e=byId.get(id);if(!e)return;
 activeEvent=id;const img=PHOTOS[e.photo];$("detailTitle").textContent=e.title;
 $("detailKicker").textContent=e.kicker;
 $("detailDesc").textContent=e.description;
 $("detailMeta").textContent=eventLabel(e)+" · "+e.stage+" · "+e.type;
 $("detailPhoto").src=img.src;$("detailPhoto").alt=img.alt;
 $("detailCredit").textContent="Fotografía de ambiente: "+img.by+" / Unsplash";
 const saved=agenda.has(id);$("detailSave").textContent=saved?"✓ Quitar de mi agenda":"+ Guardar en mi agenda";
 $("detailSave").setAttribute("aria-pressed",String(saved));
}
function fromHash(){
 let match;try{match=decodeURIComponent(location.hash).match(/^#evento\/([a-z0-9-]+)$/)}catch{match=null}
 if(match&&byId.has(match[1])){
  renderDetail(match[1]);if(!$("detail").open)$("detail").showModal();
 }else if($("detail").open){$("detail").close()}
}
function closeDetail(){
 if($("detail").open)$("detail").close();
 activeEvent=null;
 if(location.hash.startsWith("#evento/"))history.replaceState(null,"",location.pathname+location.search+"#programa");
}
$("dayButtons").addEventListener("click",ev=>{const b=ev.target.closest("[data-day]");if(!b)return;day=b.dataset.day;renderEvents()});
["stage","genre","search","onlyAgenda"].forEach(id=>$(id).addEventListener(id==="search"?"input":"change",renderEvents));
function reset(){day="";$("stage").value="";$("genre").value="";$("search").value="";$("onlyAgenda").checked=false;renderEvents()}
$("resetFilters").addEventListener("click",reset);$("clearEmpty").addEventListener("click",reset);
$("eventList").addEventListener("click",ev=>{const b=ev.target.closest("[data-save]");if(b)toggle(b.dataset.save)});
$("agendaItems").addEventListener("click",ev=>{const b=ev.target.closest("[data-remove]");if(b)toggle(b.dataset.remove)});
$("detailSave").addEventListener("click",()=>{if(activeEvent)toggle(activeEvent)});
$("closeDetail").addEventListener("click",closeDetail);
$("detail").addEventListener("close",()=>{activeEvent=null;if(location.hash.startsWith("#evento/"))history.replaceState(null,"",location.pathname+location.search+"#programa")});
$("detail").addEventListener("click",ev=>{if(ev.target===$("detail"))closeDetail()});
$("goAgenda").addEventListener("click",closeDetail);
$("clearAgenda").addEventListener("click",()=>{agenda.clear();renderAll();toast("Agenda vaciada")});
$("exportAgenda").addEventListener("click",()=>{
 const blob=new Blob([exportICS(chosen(),EVENTS)],{type:"text/calendar;charset=utf-8"});
 const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="escena-abierta-2027.ics";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
});
addEventListener("hashchange",fromHash);
renderAll();fromHash();
