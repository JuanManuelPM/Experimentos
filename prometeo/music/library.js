/* PROMETEO Music · one library, one studio. Catalog entries become playable only after a real file is published. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const builtIn={id:'ceniza-m007',title:'CENIZA / Luces bajo el agua',updatedAt:'2026-11-20',project:'built-in',tracks:13};
let entries=[builtIn],selectedId=builtIn.id,previousFocus=null;
const audio=new Audio();audio.preload='metadata';audio.crossOrigin='anonymous';
let hasMaster=false;
const master={
  get active(){return hasMaster},get time(){return audio.currentTime||0},get playing(){return hasMaster&&!audio.paused},
  async play(){if(!hasMaster)throw Error('No hay máster cargado');return audio.play()},
  stop(reset=true){audio.pause();if(reset&&audio.readyState)audio.currentTime=0},
  seek(v){if(hasMaster&&Number.isFinite(v)){try{audio.currentTime=Math.max(0,Math.min(v,Number.isFinite(audio.duration)?audio.duration:v))}catch{}}},
  unload(){audio.pause();hasMaster=false;audio.removeAttribute('src');audio.load()},
  load(url){audio.src=url;audio.loop=$('loop').classList.contains('on');hasMaster=true;audio.load()}
};
window.PROMETEO_LIBRARY_AUDIO=master;
audio.addEventListener('ended',()=>{$('play').classList.remove('on');$('status').textContent='LISTO';});
audio.addEventListener('error',()=>{if(hasMaster)$('libraryFeedback').textContent='No se pudo cargar el archivo de audio. La biblioteca conserva su registro.'});
function safeUrl(value){
  if(typeof value!=='string'||!value.trim())throw Error('Ruta de archivo ausente');
  const url=new URL(value,document.baseURI);
  if(!['https:','http:','file:'].includes(url.protocol))throw Error('Ruta no permitida');
  if(location.protocol!=='file:'&&url.origin!==location.origin)throw Error('El archivo debe estar alojado junto al reproductor');
  return url.href;
}
function dateLabel(value){
  if(!/^\d{4}-\d{2}-\d{2}/.test(value||''))return 'Fecha no indicada';
  const date=new Date(value.slice(0,10)+'T12:00:00Z');
  return Number.isNaN(+date)?'Fecha no indicada':new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(date);
}
function openLibrary(){
  previousFocus=document.activeElement;$('libraryPanel').hidden=false;$('libraryToggle').setAttribute('aria-expanded','true');$('librarySearch').focus();
  render();
}
function closeLibrary(){
  $('libraryPanel').hidden=true;$('libraryToggle').setAttribute('aria-expanded','false');
  (previousFocus||$('libraryToggle')).focus();
}
function render(){
  const term=$('librarySearch').value.trim().toLocaleLowerCase('es-AR');
  const list=entries.filter(e=>e.title.toLocaleLowerCase('es-AR').includes(term)||e.id.toLocaleLowerCase('es-AR').includes(term));
  $('libraryCount').textContent=list.length+' '+(list.length===1?'canción':'canciones')+' · última actualización primero';
  const root=$('libraryEntries');root.replaceChildren();
  if(!list.length){const p=document.createElement('p');p.textContent='No hay canciones con ese nombre.';root.append(p);return;}
  for(const e of list){
    const b=document.createElement('button');b.type='button';b.className='libraryRow';b.setAttribute('aria-label','Cargar '+e.title);
    if(e.id===selectedId)b.setAttribute('aria-current','true');
    const info=document.createElement('span'),title=document.createElement('strong'),meta=document.createElement('small'),arrow=document.createElement('span');
    title.textContent=e.title;
    meta.textContent='Actualizado '+dateLabel(e.updatedAt)+(Number.isInteger(e.tracks)?' · '+e.tracks+' pistas':'')+(e.audioUrl?' · máster publicado':' · proyecto editable');
    arrow.className='arrow';arrow.textContent=e.id===selectedId?'●':'↗';
    info.append(title,meta);b.append(info,arrow);
    b.addEventListener('click',()=>selectSong(e));root.append(b);
  }
}
function fallbackProject(e){
  if(!Number.isFinite(Number(e.durationSeconds))||Number(e.durationSeconds)<=0)throw Error('Falta duración para la obra solo-audio');
  const bpm=Number(e.bpm)||120;
  return {schema:'prometeo.songproject/v2',id:e.id,title:e.title,bpm,meter:[4,4],
    bars:Math.max(1,Math.ceil(Number(e.durationSeconds)/(240/bpm))),
    sections:[],tracks:[{id:'master',name:'MÁSTER / AUDIO',type:'pad',gain:0,pan:0,events:[],fx:{reverb:0,delay:0}}]};
}
async function selectSong(e){
  const feedback=$('libraryFeedback');feedback.textContent='Cargando '+e.title+'…';
  try{
    let project;
    if(e.project==='built-in')project=structuredClone(window.PROMETEO_PROJECT);
    else if(e.projectUrl){
      const response=await fetch(safeUrl(e.projectUrl),{cache:'no-store'});
      if(!response.ok)throw Error('Proyecto no publicado (HTTP '+response.status+')');
      project=await response.json();
    }else if(e.audioUrl)project=fallbackProject(e);
    else throw Error('La canción todavía no tiene proyecto ni audio');
    if(!project||!Array.isArray(project.tracks))throw Error('SongProject incompatible');
    master.unload();
    window.PROMETEO_API.loadProject(project);
    if(e.audioUrl)master.load(safeUrl(e.audioUrl));
    selectedId=e.id;feedback.textContent='';closeLibrary();
    $('libraryToggle').textContent='Biblioteca';
  }catch(err){feedback.textContent='No se pudo abrir «'+e.title+'»: '+err.message;}
}
async function loadCatalog(){
  try{
    if(location.protocol==='file:')throw Error('Catálogo dinámico no disponible desde archivo local');
    const response=await fetch('library.json',{cache:'no-store'});
    if(!response.ok)throw Error('HTTP '+response.status);
    const data=await response.json();
    if(data.schema!=='prometeo.music.library/v1'||!Array.isArray(data.entries))throw Error('Formato de catálogo inválido');
    const unique=new Map();
    for(const e of data.entries){
      if(!e||typeof e.id!=='string'||typeof e.title!=='string'||!e.title.trim())continue;
      if(e.status&&e.status!=='PUBLISHED_VERIFIED')continue;
      if(e.project!=='built-in'&&!e.projectUrl&&!e.audioUrl)continue;
      unique.set(e.id,e);
    }
    // Ten independent release slots: no shared JSON write and no fake pending songs.
    const slots=Array.isArray(data.releaseSlots)?data.releaseSlots:[];
    const releases=await Promise.all(slots.map(async (slot)=>{
      try{
        const manifestUrl=safeUrl(slot);
        const r=await fetch(manifestUrl,{cache:'no-store'});
        if(!r.ok)return null;
        const m=await r.json();
        const slotId=slot.split('/').at(-2)?.toUpperCase();
        if(!/^W001-[0-9]{2}$/.test(slotId))return null;
        if(m.schema!=='prometeo.music.release/v1'||!['PUBLISHED_VERIFIED','PUBLISHED_PROJECT_PLAYABLE'].includes(m.status)||m.waveJob!==slotId||!m.projectUrl)return null;
        const base=new URL(manifestUrl);
        const entry={id:m.waveJob,title:m.title,updatedAt:m.updatedAt,status:m.status,
          projectUrl:safeUrl(new URL(m.projectUrl,base).href),
          tracks:m.tracks,source:m.source,durationSeconds:m.durationSeconds};
        if(m.audioUrl)entry.audioUrl=safeUrl(new URL(m.audioUrl,base).href);
        if(!Number.isFinite(Date.parse(entry.updatedAt)))return null;
        return entry;
      }catch{return null;}
    }));
    for(const release of releases)if(release)unique.set(release.id,release);
    if(!unique.has(builtIn.id))unique.set(builtIn.id,builtIn);
    entries=[...unique.values()].sort((a,b)=>Date.parse(b.updatedAt||'1970-01-01')-Date.parse(a.updatedAt||'1970-01-01')||a.title.localeCompare(b.title,'es'));
  }catch(err){
    entries=[builtIn];
    $('libraryFeedback').textContent='Se muestra la canción incorporada. La biblioteca completa requiere archivos publicados en el servidor.';
  }
  render();
}
$('libraryToggle').addEventListener('click',openLibrary);
$('libraryClose').addEventListener('click',closeLibrary);
$('librarySearch').addEventListener('input',render);
$('libraryPanel').addEventListener('keydown',ev=>{
  if(ev.key==='Escape'){ev.preventDefault();closeLibrary();}
  if(ev.key==='Tab'){
    const nodes=[...$('libraryPanel').querySelectorAll('button,input')].filter(x=>!x.disabled);
    if(ev.shiftKey&&document.activeElement===nodes[0]){ev.preventDefault();nodes[nodes.length-1].focus();}
    else if(!ev.shiftKey&&document.activeElement===nodes[nodes.length-1]){ev.preventDefault();nodes[0].focus();}
  }
});
$('editToggle').addEventListener('click',()=>{
  const on=$('app').classList.toggle('editing');
  $('editToggle').classList.toggle('on',on);$('editToggle').setAttribute('aria-expanded',String(on));
});
$('toolsToggle').addEventListener('click',()=>{
  const on=$('app').classList.toggle('tools-open');
  $('toolsToggle').setAttribute('aria-expanded',String(on));
});
document.addEventListener('click',ev=>{
  if($('app').classList.contains('tools-open')&&!$('advanced').contains(ev.target)&&ev.target!==$('toolsToggle')){
    $('app').classList.remove('tools-open');$('toolsToggle').setAttribute('aria-expanded','false');
  }
});
document.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'&&$('app').classList.contains('tools-open')){
    $('app').classList.remove('tools-open');$('toolsToggle').setAttribute('aria-expanded','false');
  }
});
$('loop').addEventListener('click',()=>{audio.loop=$('loop').classList.contains('on')});
loadCatalog();
})();
