import {DAYS,STAGES,CATEGORIES,PHOTOS,EVENTS} from "./data.mjs";
import {STORAGE_KEY,interval,findClashes,filterEvents,createAgenda,toICS,timeLabel} from "./festival-core.mjs";

const $=selector=>document.querySelector(selector);
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const DAY_NAME=Object.fromEntries(DAYS.map(d=>[d.date,d.long]));
const allIds=EVENTS.map(e=>e.id);
const fallbackStorage={getItem(){throw Error("sin almacenamiento");},setItem(){throw Error("sin almacenamiento");}};
let agenda;
try{agenda=createAgenda(window.localStorage,STORAGE_KEY,allIds);}catch(e){agenda=createAgenda(fallbackStorage,STORAGE_KEY,allIds);}
let state={day:DAYS[0].date,stage:"",category:"",time:"",query:""};
let lastTrigger=null;
const programEl=$("#program-list"),agendaEl=$("#agenda-list"),dialog=$("#event-dialog");
const i18nNumber=n=>String(n).padStart(2,"0");
const announce=(message)=>{
 const box=$("#toast");box.textContent=message;box.hidden=false;
 clearTimeout(announce.timeout);announce.timeout=setTimeout(()=>{box.hidden=true;},4600);
};
function selectedClashes(){return findClashes(agenda.get(),EVENTS);}
function getEvent(id){return EVENTS.find(e=>e.id===id);}
function isMatchingTime(e){
 const n=Number(e.time.slice(0,2))*60+Number(e.time.slice(3));
 return !state.time||(state.time==="tarde"&&n>=960&&n<1140)||(state.time==="noche"&&n>=1140&&n<1320)||(state.time==="trasnoche"&&n>=1320);
}
function eventRow(e){
 const saved=agenda.has(e.id),clashes=selectedClashes()[e.id]||[];
 const clashHTML=clashes.length?'<div class="clash-indicator">⚠ Coincide con '+escapeHTML(clashes.map(x=>getEvent(x)?.title||x).join(", "))+'</div>':"";
 return '<article class="event-row" data-event-id="'+escapeHTML(e.id)+'">'+
   '<div class="event-time"><time datetime="'+e.day+'T'+e.time+'-03:00">'+e.time+'</time><small>'+e.duration+' MIN</small></div>'+
   '<div class="event-main"><div class="event-category">'+escapeHTML(e.category)+'</div><h3 class="event-title">'+escapeHTML(e.title)+'</h3><p class="event-subtitle">'+escapeHTML(e.subtitle)+'</p>'+clashHTML+'</div>'+
   '<div class="event-stage">'+escapeHTML(e.stage)+'</div>'+
   '<div class="event-actions"><a class="event-detail" href="#evento/'+encodeURIComponent(e.id)+'" aria-label="Ver ficha de '+escapeHTML(e.title)+'" data-detail="'+escapeHTML(e.id)+'">↗</a>'+
   '<button type="button" class="save-button" data-save="'+escapeHTML(e.id)+'" aria-label="'+(saved?'Quitar de mi agenda: ':'Agregar a mi agenda: ')+escapeHTML(e.title)+'" aria-pressed="'+saved+'" title="'+(saved?'Quitar de mi agenda':'Agregar a mi agenda')+'">'+(saved?'✓':'+')+'</button></div></article>';
}
function renderProgram(){
 const filtered=filterEvents(EVENTS,{day:state.day,stage:state.stage,category:state.category,query:state.query}).filter(isMatchingTime);
 $$("#day-tabs .day-tab").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.day===state.day)));
 $("#results-count").textContent=filtered.length+" "+(filtered.length===1?"encuentro":"encuentros")+" · "+(DAY_NAME[state.day]||"Todos los días");
 programEl.innerHTML=filtered.length?filtered.map(eventRow).join(""):'<div class="empty-results"><strong>NO ENCONTRAMOS COINCIDENCIAS.</strong><p>Probá otro escenario, horario o palabra.</p></div>';
}
function $$(selector){return [...document.querySelectorAll(selector)];}
function renderAgenda(){
 const ids=agenda.get(),clashes=selectedClashes();
 const pairs=Object.values(clashes).reduce((sum,x)=>sum+x.length,0)/2;
 $("#header-count").textContent=String(ids.length);$("#mobile-count").textContent=String(ids.length);
 $("#saved-count").textContent=i18nNumber(ids.length);$("#clash-count").textContent=i18nNumber(pairs);
 $("#storage-warning").hidden=agenda.isPersistent();
 $("#export-ics").disabled=!ids.length;$("#clear-agenda").disabled=!ids.length;
 const list=filterEvents(EVENTS,{onlyIds:ids});
 if(!list.length){
  agendaEl.innerHTML='<div class="agenda-empty"><p>Todavía no elegiste ningún encuentro. Tu recorrido empieza con una curiosidad.</p><span aria-hidden="true">✳</span></div>';
  return;
 }
 agendaEl.innerHTML=DAYS.map(day=>{
  const items=list.filter(e=>e.day===day.date);
  if(!items.length)return "";
  return '<section aria-label="'+escapeHTML(day.long)+'"><h3 class="agenda-day-title">'+escapeHTML(day.long)+'</h3>'+
   items.map(e=>{
    const collisions=clashes[e.id]||[];
    return '<article class="agenda-item"><time datetime="'+e.day+'T'+e.time+'-03:00">'+e.time+'</time>'+
     '<div><h3><a href="#evento/'+encodeURIComponent(e.id)+'">'+escapeHTML(e.title)+'</a></h3><p>'+escapeHTML(e.stage)+' · '+escapeHTML(e.category)+' · '+timeLabel(e)+'</p>'+
     (collisions.length?'<p class="agenda-clash">⚠ Cruce con '+escapeHTML(collisions.map(x=>getEvent(x)?.title).join(", "))+'</p>':"")+'</div>'+
     '<button type="button" class="remove-button" data-save="'+escapeHTML(e.id)+'" aria-label="Quitar '+escapeHTML(e.title)+' de mi agenda">×</button></article>';
   }).join("")+'</section>';
 }).join("");
}
function renderAll(){renderProgram();renderAgenda();}
function toggleEvent(id){
 const e=getEvent(id);if(!e)return;
 const added=agenda.toggle(id);
 renderAll();
 const clashes=selectedClashes()[id]||[];
 announce(added?(clashes.length?'Agregado. Se superpone con '+clashes.map(x=>getEvent(x)?.title||x).join(", ")+'.':'Agregado a tu agenda: '+e.title+'.'):'Quitado de tu agenda: '+e.title+'.');
 const btn=$(".dialog-save");
 if(btn&&btn.dataset.save===id){btn.setAttribute("aria-pressed",String(agenda.has(id)));btn.textContent=agenda.has(id)?"✓ GUARDADO EN MI AGENDA":"＋ AGREGAR A MI AGENDA";}
}
function dialogContents(e){
 const img=PHOTOS[e.photo]||PHOTOS[0];
 return '<img class="dialog-photo" src="'+img.src+'" alt="'+escapeHTML(img.alt)+'" loading="lazy">'+
 '<div class="dialog-body"><div class="dialog-eyebrow">'+escapeHTML(e.category)+' / '+escapeHTML(DAY_NAME[e.day])+'</div>'+
 '<h2 id="dialog-title">'+escapeHTML(e.title)+'</h2><p class="dialog-subtitle">'+escapeHTML(e.subtitle)+'</p>'+
 '<div class="dialog-detail-grid"><div><span>HORARIO</span><strong>'+timeLabel(e)+'</strong></div><div><span>ESCENARIO</span><strong>'+escapeHTML(e.stage)+'</strong></div><div><span>DURACIÓN</span><strong>'+e.duration+' min</strong></div></div>'+
 '<p class="dialog-description">'+escapeHTML(e.description)+'</p>'+
 '<div class="dialog-buttons"><button class="dialog-save" type="button" data-save="'+escapeHTML(e.id)+'" aria-pressed="'+agenda.has(e.id)+'">'+(agenda.has(e.id)?"✓ GUARDADO EN MI AGENDA":"＋ AGREGAR A MI AGENDA")+'</button>'+
 '<button type="button" class="dialog-secondary" id="dialog-close-secondary">CERRAR FICHA ↗</button></div>'+
 '<p class="dialog-credit">Programación y artista ficticios. Fotografía de ambiente: <a href="'+img.url+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(img.credit)+'</a> / Unsplash. La foto no representa al artista imaginario.</p></div>';
}
function openFromHash(){
 const hash=window.location.hash;
 if(!hash.startsWith("#evento/")){
  if(dialog.open)dialog.close();
  return;
 }
 let id="";
 try{id=decodeURIComponent(hash.slice(8));}catch(e){return;}
 const event=getEvent(id);
 if(!event){announce("No encontramos la ficha solicitada.");return;}
 // El enlace puede llegar desde una pestaña o una agenda.
 state.day=event.day;renderProgram();
 $("#dialog-content").innerHTML=dialogContents(event);
 if(!dialog.open)dialog.showModal();
 $("#dialog-close").focus();
}
function closeDialog(){
 if(dialog.open)dialog.close();
 if(window.location.hash.startsWith("#evento/"))history.replaceState(null,"",location.pathname+location.search+"#programacion");
 if(lastTrigger&&document.contains(lastTrigger))lastTrigger.focus();
}
$("#day-tabs").addEventListener("click",e=>{
 const button=e.target.closest("[data-day]");
 if(!button)return;
 state.day=button.dataset.day;renderProgram();
});
$("#filters").addEventListener("submit",e=>e.preventDefault());
$("#stage-filter").addEventListener("change",e=>{state.stage=e.target.value;renderProgram();});
$("#category-filter").addEventListener("change",e=>{state.category=e.target.value;renderProgram();});
$("#time-filter").addEventListener("change",e=>{state.time=e.target.value;renderProgram();});
$("#search-filter").addEventListener("input",e=>{state.query=e.target.value;renderProgram();});
$("#reset-filters").addEventListener("click",()=>{
 state.stage=state.category=state.time=state.query="";
 ["stage-filter","category-filter","time-filter","search-filter"].forEach(id=>$("#"+id).value="");
 renderProgram();
});
document.addEventListener("click",e=>{
 const save=e.target.closest("[data-save]");
 if(save){toggleEvent(save.dataset.save);return;}
 const details=e.target.closest("[data-detail]");
 if(details)lastTrigger=details;
});
$("#dialog-close").addEventListener("click",closeDialog);
dialog.addEventListener("click",e=>{if(e.target===dialog)closeDialog();});
dialog.addEventListener("cancel",e=>{e.preventDefault();closeDialog();});
dialog.addEventListener("click",e=>{if(e.target.closest("#dialog-close-secondary"))closeDialog();});
window.addEventListener("hashchange",openFromHash);
$("#export-ics").addEventListener("click",()=>{
 const content=toICS(agenda.get(),EVENTS);
 const file=new Blob([content],{type:"text/calendar;charset=utf-8"});
 const url=URL.createObjectURL(file);
 const a=document.createElement("a");a.href=url;a.download="escena-abierta-mi-agenda.ics";document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
 announce("Calendario descargado. Revisá los horarios antes de importarlo.");
});
$("#clear-agenda").addEventListener("click",()=>{
 if(!window.confirm("¿Quitar todos los encuentros de tu agenda en este dispositivo?"))return;
 agenda.clear();renderAll();announce("Agenda vaciada.");
});
window.addEventListener("storage",e=>{
 if(e.key===STORAGE_KEY){try{agenda=createAgenda(window.localStorage,STORAGE_KEY,allIds);}catch(err){agenda=createAgenda(fallbackStorage,STORAGE_KEY,allIds);}renderAll();}
});
renderAll();
openFromHash();
