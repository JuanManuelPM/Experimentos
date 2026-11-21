
(function(){
'use strict';
const $ = id => document.getElementById(id);
const cfgUrl='./SOURCES.json';
const appBase=new URL('../../../',location.href);
const TYPES=['integradores','personajes','videojuegos'];
const TYPE_NAMES={integradores:'Integradores',personajes:'Personajes',videojuegos:'Videojuegos'};
const titles={
 'respawn-desk':'Descenso al escritorio',
 'transporte-retro':'Transporte retro',
 'ventilador-explicado':'Ventilador explicado',
 'estacion-servicio-tormenta':'Estación bajo la tormenta',
 'ascensor-retro':'Ascensor entre realidades',
 'entrevista-nocturna':'Entrevista nocturna',
 'reloj-mecanico':'Reloj mecánico',
 'laboratorio-submarino':'Laboratorio submarino',
 'arcade-retro':'Salón arcade retro',
 'cruce-urbano':'Cruce urbano'
};
const state={tasks:[],past:new Map(),results:new Map(),filter:'todos',query:'',scanning:false,lastChecked:null,active:null};
let lastFocus=null,renderTimer=0;
function escapeHTML(x){return String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function nameOf(t){return titles[t.projectId]||t.title||t.projectId.replace(/-/g,' ');}
function release(path){if(typeof path!=='string'||!/^prometeo\/previews\/[a-z0-9_/.-]+\/$/i.test(path)||path.includes('..'))return null;return new URL(path+'index.html',appBase).href;}
function previousPath(t){const old=state.past.get(t.projectId);if(!old||t.series!=='integradores')return null;return 'prometeo/previews/'+t.projectId+'/'+old.toLowerCase()+'/';}
function labelOf(t){return TYPE_NAMES[t.series]||t.series;}
function stateOf(t){return state.results.get(t.series+'/'+t.projectId)||{current:'checking',previous:'checking'};}
function stats(){
const total=state.tasks.length;
let ready=0,pending=0,unknown=0;
state.tasks.forEach(t=>{const s=stateOf(t);if(s.current==='ready')ready++;else if(s.current==='missing')pending++;else unknown++;});
$('total-count').textContent=String(total);$('ready-count').textContent=String(ready);$('pending-count').textContent=String(pending)+(unknown?' +':'');
TYPES.forEach(type=>{$('count-'+type).textContent=String(state.tasks.filter(t=>t.series===type).length);});
$('count-todos').textContent=String(total);
}
function card(t){
const s=stateOf(t);
const isReady=s.current==='ready',isOld=!isReady&&s.previous==='ready';
const status=s.current==='checking'?'Buscando…':isReady?'Publicada':isOld?'Anterior disponible':s.current==='unknown'?'Sin confirmar':'Pendiente';
const currentUrl=release(t.publicPath);
const oldPath=previousPath(t),oldUrl=oldPath&&release(oldPath);
const mainUrl=isReady?currentUrl:isOld?oldUrl:null;
const version=isReady?t.targetVersion:isOld?state.past.get(t.projectId):t.targetVersion;
const action=mainUrl?'<button type="button" class="open-view'+(isOld?' old':'')+'" data-view="'+escapeHTML(t.series+'/'+t.projectId)+'">'+(isOld?'Ver anterior '+escapeHTML(version):'Ver producción')+' <span aria-hidden="true">↗</span></button>':'<button type="button" class="open-view" disabled>'+(s.current==='checking'?'Comprobando…':'Sin publicar')+'</button>';
const extra=isReady?'<a class="outlink" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(currentUrl)+'">Abrir aparte ↗</a>':'<a class="outlink" target="_blank" rel="noopener noreferrer" href="'+escapeHTML(t.publicUrl)+'">Ver encargo ↗</a>';
return '<article class="card" data-series="'+escapeHTML(t.series)+'" data-status="'+(isReady||isOld?'ready':s.current==='checking'?'checking':'pending')+'">'+
'<div class="card-head"><span class="card-number">Nº '+String(t.number).padStart(2,'0')+'</span><span class="card-status"><i class="dot" aria-hidden="true"></i>'+escapeHTML(status)+'</span></div>'+
'<div class="card-body"><h4>'+escapeHTML(nameOf(t))+'</h4><div class="card-meta">'+escapeHTML(t.targetVersion)+' · '+escapeHTML(t.series.toUpperCase())+(isOld?' · HISTÓRICO':'')+'</div></div>'+
'<div class="card-actions">'+action+extra+'</div></article>';
}
function render(){
stats();
const q=state.query.trim().toLocaleLowerCase('es');
const tasks=state.tasks.filter(t=>(state.filter==='todos'||state.filter===t.series)&&(!q||(nameOf(t)+' '+t.projectId+' '+t.series+' '+String(t.number)).toLocaleLowerCase('es').includes(q)));
const parts=[];
TYPES.forEach(type=>{
const items=tasks.filter(t=>t.series===type).sort((a,b)=>a.number-b.number);
if(!items.length)return;
parts.push('<section class="group" aria-label="'+TYPE_NAMES[type]+'"><div class="group-heading"><h3>'+TYPE_NAMES[type]+'</h3><small>'+items.length+' proyectos</small></div><div class="cards">'+items.map(card).join('')+'</div></section>');
});
$('catalog').innerHTML=parts.join('')||'<div class="empty">No hay proyectos que coincidan con esta búsqueda.</div>';
if(state.lastChecked){$('last-check').textContent='Consultado '+new Date(state.lastChecked).toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});}
}
function soonRender(){if(renderTimer)return;renderTimer=setTimeout(()=>{renderTimer=0;render();},200);}
async function loadJSON(src){
const res=await fetch(src,{cache:'no-store'});
if(!res.ok)throw new Error('HTTP '+res.status+': '+src);
return res.json();
}
async function initialize(){
try{
let config;
try{config=await loadJSON(cfgUrl);}catch(e){config={waves:[{manifest:'../w4/MANIFEST.json'}],previous:'../w3/MANIFEST.json'};}
const waves=Array.isArray(config.waves)&&config.waves.length?config.waves:[{manifest:'../w4/MANIFEST.json'}];
const manifests=await Promise.all(waves.map(async w=>({source:w,body:await loadJSON(new URL(w.manifest,new URL(cfgUrl,location.href)).href)})));
const taskMap=new Map();
manifests.forEach(({source,body})=>(body.tasks||[]).forEach(t=>{
if(!TYPES.includes(t.series)||!t.publicPath)return;
const key=t.series+'/'+t.projectId;
if(!taskMap.has(key))taskMap.set(key,Object.assign({},t,{wave:body.wave||source.wave||'?'}));
}));
state.tasks=Array.from(taskMap.values());
try{const previous=await loadJSON(new URL(config.previous||'../w3/MANIFEST.json',new URL(cfgUrl,location.href)).href);(previous.tasks||[]).forEach(t=>state.past.set(t.projectId,t.targetVersion));}catch(e){}
$('wave-tag').textContent='OLA '+(manifests[0].body.wave||'004');
render();
await scan();
}catch(e){$('catalog').innerHTML='<div class="empty">No se pudo cargar el manifiesto desde GitHub Pages. <a href="../w4/MANIFEST.json">Abrir el manifiesto directamente ↗</a></div>';$('last-check').textContent='Error de lectura';console.error('PROMETEO gallery manifest',e);}
}
async function check(url){
if(!url)return 'missing';
const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8500);
try{
const res=await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal});
if(res.ok)return 'ready';
if(res.status===404||res.status===410)return 'missing';
return 'unknown';
}catch(e){return 'unknown';}
finally{clearTimeout(timer);}
}
async function scan(){
if(state.scanning||!state.tasks.length)return;
state.scanning=true;$('refresh').disabled=true;$('last-check').textContent='Buscando publicaciones…';
const items=state.tasks.slice();let i=0;
async function worker(){
while(i<items.length){
const t=items[i++],key=t.series+'/'+t.projectId;
const current=await check(release(t.publicPath));
let previous='missing';
if(current!=='ready'&&t.series==='integradores'){previous=await check(release(previousPath(t)));}
state.results.set(key,{current,previous});
soonRender();
}}
await Promise.all(Array.from({length:Math.min(7,items.length)},worker));
state.scanning=false;state.lastChecked=Date.now();$('refresh').disabled=false;render();
}
function openViewer(key){
const t=state.tasks.find(x=>x.series+'/'+x.projectId===key);if(!t)return;
const status=stateOf(t);
let url=status.current==='ready'?release(t.publicPath):status.previous==='ready'?release(previousPath(t)):null;
if(!url)return;
lastFocus=document.activeElement;state.active=key;
$('viewer-title').textContent=nameOf(t);
$('viewer-kicker').textContent=TYPE_NAMES[t.series].toUpperCase()+' · '+(status.current==='ready'?t.targetVersion:state.past.get(t.projectId)+' (ANTERIOR)');
$('viewer-external').href=url;
$('viewer-frame').src=url;
$('viewer').hidden=false;
document.body.classList.add('viewer-open');$('viewer-close').focus();
}
function closeViewer(){
$('viewer').hidden=true;document.body.classList.remove('viewer-open');$('viewer-frame').src='about:blank';state.active=null;if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{
state.filter=b.dataset.filter;
document.querySelectorAll('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});
render();
}));
$('search').addEventListener('input',e=>{state.query=e.target.value;render();});
$('refresh').addEventListener('click',scan);
$('viewer-close').addEventListener('click',closeViewer);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('viewer').hidden)closeViewer();});
$('catalog').addEventListener('click',e=>{const trigger=e.target.closest('[data-view]');if(trigger)openViewer(trigger.dataset.view);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.lastChecked&&Date.now()-state.lastChecked>120000)scan();});
setInterval(()=>{if(!document.hidden)scan();},120000);
initialize();
})();
