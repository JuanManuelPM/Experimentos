/* PROMETEO ROOT · universal shell, real project library and typed batch results. */
import './shared/v1/shell.js';
import {findResult,bestLink,bestImage} from './galeria/model.mjs?v=20261123-mobile2';
import {createFocusMap} from './focus-map.mjs?v=20261123-visual1';
import './shared/v1/response.js';
import './shared/v1/batch.js?v=20261122-emojiworker1';
import './shared/v1/launch-hub.js';
const $=id=>document.getElementById(id);
const FALLBACK=[{id:'direccion',label:'Dirección'},{id:'root',label:'ROOT'},{id:'3d',label:'3D'},{id:'music',label:'Música'},{id:'web',label:'Web'},{id:'video',label:'Video'},{id:'images',label:'Imágenes'}];
const ROOT_REF='https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-portal-unico-base-20261121/PROMETEO/system/PORTAL_BASE_HANDOFF.md#';
const PUBLIC='https://juanmanuelpm.github.io/Experimentos/prometeo/';
const state={universalFilter:'all',universalView:'recent',universalOpen:undefined,rooms:FALLBACK,room:'direccion',screen:'messages',itemId:'',public:[],legacy:[],batches:[],projects:[],w4:[],catalog:null,chair:null,cocina:null,nodeId:'mobiliario',older:false,items:[],workspaces:[],ready:false,batchId:''};
const shell=$('shell');
const focusMap=createFocusMap({copy,toast,go});
let timer;
function toast(text){const n=$('toast');n.textContent=text;n.hidden=false;clearTimeout(timer);timer=setTimeout(()=>n.hidden=true,1800);}
async function get(path){const r=await fetch(path+(path.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function cacheKey(path){return 'prometeo:root:cache:'+path;}
function cache(path,data){try{localStorage.setItem(cacheKey(path),JSON.stringify(data));}catch{}}
function readCache(path){try{return JSON.parse(localStorage.getItem(cacheKey(path))||'null');}catch{return null;}}
const FEEDBACK_ROUTER='https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/root/FEEDBACK_ROUTER.md';
function promptFor(room,resource=''){return 'CONTINUAR · PROMETEO · '+FEEDBACK_ROUTER+' · '+PUBLIC+'root/#'+String(room||'root')+(resource?'/'+resource:'');}
function currentReference(){
 if(state.room==='root'&&location.hash.startsWith('#root/plano/'))return promptFor('root','plano/'+encodeURIComponent(state.nodeId));
 if(state.screen==='stage'&&state.itemId)return promptFor(state.room,'obra/'+encodeURIComponent(state.itemId));
 if(state.screen==='messages'){
  const id=state.batchId||messages()[0]?.id;
  if(id){const batch=state.batches.some(b=>b.id===id);return promptFor(state.room,(batch?'tanda/':'mensaje/')+encodeURIComponent(id));}
 }
 return promptFor(state.room);
}
async function copy(text){try{await navigator.clipboard.writeText(text);return true;}catch{const n=document.createElement('textarea');n.value=text;n.style.position='fixed';n.style.top='-3000px';document.body.append(n);n.select();let ok=false;try{ok=document.execCommand('copy');}catch{}n.remove();return ok;}}
function option(text,fn,active=false,minor=false){const b=document.createElement('button');b.type='button';b.textContent=text;if(active)b.setAttribute('aria-current','page');if(minor)b.className='p-context-small';b.addEventListener('click',fn);return b;}
function safePreview(url){if(typeof url!=='string')return '';try{const u=new URL(url,location.href);const prefix=new URL(PUBLIC);return u.origin===prefix.origin&&u.pathname.startsWith(prefix.pathname)&&!u.pathname.includes('..')?u.href:'';}catch{return '';}}
function newTab(url){const href=safePreview(url);if(href)window.open(href,'_blank','noopener,noreferrer');}
function batchEntries(room){
 return state.batches.filter(b=>b.room===room&&Array.isArray(b.tasks)&&b.launchUrl).map(b=>{
  const tasks=b.tasks.map(t=>{
   const n=Number(t.number);
   const result=state.public.find(e=>e&&e.room===room&&Array.isArray(t.messageIds)&&t.messageIds.includes(e.id))||
    state.public.find(e=>e&&e.room===room&&e.batchId===b.id&&Number(e.taskNumber)===n);
   const embed=(t.embedResult&&result&&Array.isArray(result.blocks))?result.blocks.find(x=>x?.type==='file'&&safePreview(x.url)&&x.url.includes('/previews/w5/')):null;
   return {id:t.id,number:n,label:t.label,sourceUrl:b.launchUrl,result:result||null,embedUrl:embed?.url||'',evidence:t.evidence||{}};
  });
  const dates=tasks.filter(t=>t.result).map(t=>Date.parse(t.result.publishedAt)||0);
  return {id:b.id,room,title:b.title||'Tanda',publishedAt:new Date(Math.max(Date.parse(b.createdAt)||0,...dates,Date.parse('2026-11-21T00:00:00Z'))).toISOString(),
   blocks:[{type:'batch',id:b.id,room,title:b.title,launchUrl:b.launchUrl,items:tasks}]};
 });
}
function ownedMessages(){return state.public.filter(e=>e&&e.room===state.room);}
function groupedIds(){return new Set(state.batches.filter(b=>b.room===state.room).flatMap(b=>(b.tasks||[]).flatMap(t=>t.messageIds||[])));}
function sortedEntries(a){return a.sort((x,y)=>(Date.parse(y.publishedAt)||0)-(Date.parse(x.publishedAt)||0)||String(y.id).localeCompare(String(x.id)));}
function messages(){
 const own=ownedMessages(),covered=groupedIds();
 const legacy=state.room==='root'?state.legacy.map(e=>({...e,room:'root'})):[];
 return sortedEntries([...batchEntries(state.room),...own.filter(e=>!covered.has(e.id)),...legacy]);
}
function renderMessages(){
 $('space').textContent=state.rooms.find(x=>x.id===state.room)?.label||'PROMETEO';
 const list=messages(),last=list.find(e=>e.id===state.batchId)||list[0],view=$('response');
 const fallback=$('startup-fallback');if(fallback){fallback.hidden=!!last||!state.indexUnavailable;if(!fallback.hidden)fallback.querySelector('p').textContent='No se pudieron recuperar los índices. Podés abrir la galería o recargar.';}
 view.hidden=!last;
 view.setData(last||{},last?.blocks?.some(b=>b.type==='batch')?[]:[{kind:'copy',label:'Copiar referencia',value:promptFor(state.room,last?.id?'mensaje/'+encodeURIComponent(last.id):'')}]);
 const raw=list.filter(e=>e.id!==last?.id);
 const toggle=$('older');toggle.hidden=raw.length===0;toggle.setAttribute('aria-expanded',String(state.older));toggle.setAttribute('aria-label','Mensajes · '+list.length);toggle.title='Mensajes ('+list.length+')';
 const hist=$('history');hist.hidden=!state.older;hist.replaceChildren();
 if(state.older){
  for(const e of list){
   const item=element('button','p-message-option');item.type='button';
   if(e.id===last?.id)item.setAttribute('aria-current','true');
   item.append(element('span','p-message-option-title',e.title||'Mensaje'),element('time','p-message-option-date',Number.isFinite(Date.parse(e.publishedAt))?new Date(e.publishedAt).toLocaleDateString('es-AR',{day:'2-digit',month:'short'}):''));
   item.addEventListener('click',()=>{state.older=false;go('#'+state.room+'/mensaje/'+encodeURIComponent(e.id));});
   hist.append(item);
  }
 }
}
function addItem(map,candidate,rank){
 const url=safePreview(candidate.url);if(!url||!candidate.id)return;
 const item={...candidate,url,rank,versions:[]};
 const prior=map.get(item.id);
 if(!prior){map.set(item.id,item);return;}
 const next=rank>prior.rank?item:prior,other=rank>prior.rank?prior:item;
 const versions=[...prior.versions,...(item.versions||[]),{label:other.version||'Original',url:other.url}].filter(x=>x.url&&x.url!==next.url);
 const seen=new Set;next.versions=versions.filter(v=>{if(seen.has(v.url))return false;seen.add(v.url);return true;});
 map.set(item.id,next);
}
function titleCase(s){return String(s||'').replace(/[-_]/g,' ').replace(/\b\p{L}/gu,c=>c.toLocaleUpperCase('es-AR'));}
function buildLibrary(){
 const map=new Map;
 for(const p of state.projects){
  if(!p||p.folder==='herramientas'||!p.url||p.id==='3d-flow')continue;
  const kind=p.folder==='personajes'?'Personaje':p.folder==='videos'?'Animación':p.folder==='escenarios'?'Escena':'Obra';
  addItem(map,{id:p.id,title:p.title||titleCase(p.id),kind,url:p.url,version:'Original',source:'Catálogo',description:p.description||''},10);
 }
 if(state.catalog?.candidate?.url){const p=state.catalog.candidate;addItem(map,{id:p.id,title:p.title||'Cocina Umbría 002',kind:'Escena',url:p.url,version:'V2',source:'Catálogo',description:p.description||''},15);}
 for(const w of state.w4){
  if(!w?.projectId||w.preview?.status!=='PUBLIC_HTML_PATH'||!w.preview.url)continue;
  const kind=w.series==='personajes'?'Personaje':w.series==='videojuegos'?'Juego':'Escena';
  addItem(map,{id:w.projectId,title:titleCase(w.projectId),kind,url:w.preview.url,version:w.version||'W4',source:'W4',description:''},20);
 }
 if(state.chair?.publicUrl)addItem(map,{id:'arc-chair-01',title:'ARC CHAIR 01',kind:'Mobiliario',url:state.chair.publicUrl,version:state.chair.version||'0.1.0',source:'prometeo/asset-lab/chair-01/ASSET.json',description:state.chair.status||'Prototipo sin aprobación'},30);
 const canonical={1:'cocina-umbria-001',2:'cocina-umbria-002',6:'3d-npc-civilian-v1',7:'respawn-desk',8:'retrato-expresivo',9:'investigacion-noir',10:'arcade-objetivos'};
 for(const b of state.batches.filter(b=>b.room==='3d'&&b.id==='3d-w5-20261121'))for(const t of b.tasks||[]){
  const id=canonical[Number(t.number)];if(!id)continue;
  const result=findResult(b,t,state.public);
  if(!result)continue;
  const link=bestLink(result);
  if(!link)continue;
  const kind=[6,8].includes(Number(t.number))?'Personaje':[9,10].includes(Number(t.number))?'Juego':'Escena';
  addItem(map,{id,title:result.title||t.label,kind,url:link,version:'W5/'+String(t.number).padStart(2,'0'),source:b.id,description:result.body||''},40);
 }
 state.items=[...map.values()].sort((a,b)=>b.rank-a.rank||a.title.localeCompare(b.title,'es'));
}
function studioItems(room){
 if(room==='3d')return state.items;
 const map=new Map();
 for(const w of state.workspaces.filter(x=>x?.room===room&&x.id&&x.url))
  addItem(map,{...w,version:w.version||'Original',description:w.notes||''},50);
 for(const e of state.public.filter(x=>x?.room===room&&x.batchId&&Number.isInteger(Number(x.taskNumber)))){
  const url=bestLink(e);if(!url)continue;
  const type=/\.(png|jpe?g|webp|svg|gif|avif)(?:[?#]|$)/i.test(url)?'image':/\.(mp4|webm)(?:[?#]|$)/i.test(url)?'video':/\.(mp3|wav|ogg|m4a|flac)(?:[?#]|$)/i.test(url)?'audio':'html';
  addItem(map,{id:e.batchId+'-'+e.taskNumber,title:e.title||String(e.taskNumber),kind:type==='html'?'Obra':type,media:type,url,version:e.batchId+'/'+String(e.taskNumber).padStart(2,'0'),source:e.id,description:e.body||''},80);
 }
 return [...map.values()].sort((a,b)=>(room==='music'?Number(a.folder!=='Canciones')-Number(b.folder!=='Canciones'):0)||b.rank-a.rank||a.title.localeCompare(b.title,'es'));
}
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}

function renderUniversalLibrary(){
 const host=$('works');host.replaceChildren();
 const batchBtn=$('batch-link');batchBtn.hidden=true;
 const title=document.querySelector('.p-library-top h1');if(title)title.textContent='Obras';
 const emoji={'3d':'🧊',web:'🌐',music:'🎵',video:'🎬',images:'🎨'};
 const rooms=['3d','web','music','video','images'];
 const toolbar=element('div','p-univ-toolbar');
 const filters=element('div','p-univ-filters');
 for(const [id,label] of [['all','Todos'],['3d','3D'],['web','Web'],['music','Música'],['video','Video'],['images','Imágenes']]){
  const b=option(label,()=>{state.universalFilter=id;renderUniversalLibrary()},state.universalFilter===id);
  b.setAttribute('aria-pressed',String(state.universalFilter===id));filters.append(b);
 }
 const modes=element('div','p-univ-modes');
 for(const [id,label] of [['batches','Tandas'],['recent','Recientes']]){
  const b=option(label,()=>{state.universalView=id;renderUniversalLibrary()},state.universalView===id);
  b.setAttribute('aria-pressed',String(state.universalView===id));modes.append(b);
 }
 toolbar.append(filters,modes);host.append(toolbar);
 const resultFor=(b,t)=>findResult(b,t,state.public);
 const validDate=e=>{const ms=Date.parse(e?.publishedAt||'');return Number.isFinite(ms)&&ms>0?ms:0};
 const formatted=ms=>ms?new Date(ms).toLocaleDateString('es-AR',{day:'2-digit',month:'short',year:'numeric'}):'sin fecha registrada';
 const groups=state.batches.filter(b=>rooms.includes(b.room)&&Array.isArray(b.tasks)&&b.launchUrl)
   .filter(b=>state.universalFilter==='all'||b.room===state.universalFilter)
   .map(b=>{
     const tasks=b.tasks.map(t=>({task:t,result:resultFor(b,t)}));
     const delivered=tasks.filter(x=>x.result);
     const last=Math.max(0,...delivered.map(x=>validDate(x.result)));
     return{batch:b,tasks,delivered,last};
   }).sort((a,b)=>b.last-a.last||String(b.batch.id).localeCompare(String(a.batch.id)));
 const card=(group,x)=>{
  const e=x.result,href=bestLink(e),image=bestImage(e);
  const visual=image?{type:'image',url:image}:(/\.(mp4|webm)(?:[?#]|$)/i.test(href)?{type:'video',url:href}:null);
  const a=element(href?'a':'article','p-univ-card');
  if(href){a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Abrir '+(e?.title||x.task.label));}
  const frame=element('div','p-univ-frame');
  if(visual?.type==='image'||visual?.type==='file'&&/\.(png|jpe?g|webp)/i.test(visual.url)){
   const img=document.createElement('img');img.src=visual.url;img.loading='lazy';img.alt='Vista real publicada de '+(e?.title||x.task.label);img.addEventListener('error',()=>{img.remove();frame.classList.add('p-univ-placeholder');frame.append(element('small','','Sin miniatura disponible'));},{once:true});frame.append(img);
  }else if(visual&&(visual.type==='video'||/\.(mp4|webm)/i.test(visual.url))){
   const video=document.createElement('video');video.src=visual.url;video.preload='metadata';video.muted=true;video.playsInline=true;video.setAttribute('aria-label','Video publicado');frame.append(video);
  }else{
   frame.classList.add('p-univ-placeholder');frame.append(element('span','p-univ-icon',emoji[group.batch.room]||'◻'),element('small','',e?'Sin miniatura verificada':'Aún sin entrega'));
  }
  const info=element('div','p-univ-info');
  info.append(element('span','p-univ-meta',(emoji[group.batch.room]||'')+' '+group.batch.id+' · '+String(x.task.number).padStart(2,'0')));
  info.append(element('strong','p-univ-title',e?.title||x.task.label||String(x.task.number)));
  info.append(element('span','p-univ-meta',e?(href?formatted(validDate(e)):'Resultado sin enlace público'): 'Encargo preparado'));
  a.append(frame,info);return a;
 };
 const flat=groups.flatMap(g=>g.delivered.map(x=>({group:g,x})));
 flat.sort((a,b)=>validDate(b.x.result)-validDate(a.x.result)||String(a.group.batch.id).localeCompare(String(b.group.batch.id))||Number(a.x.task.number)-Number(b.x.task.number));
 if(state.universalView==='recent'){
  const grid=element('section','p-univ-grid');grid.setAttribute('aria-label','Obras ordenadas por publicación real');
  if(!flat.length)grid.append(element('p','p-univ-empty',state.indexUnavailable?'No se pudieron recuperar los índices. Recargá cuando vuelva la conexión.':'Todavía no hay entregas registradas para esta selección.'));
  else for(const item of flat)grid.append(card(item.group,item.x));
  host.append(grid);return;
 }
 const defaultOpen=groups.find(x=>x.delivered.length>0)?.batch.id||groups[0]?.batch.id;
 if(state.universalOpen===undefined){try{const stored=localStorage.getItem('prometeo:root:open-batch');if(groups.some(x=>x.batch.id===stored))state.universalOpen=stored;}catch{}}
 for(const group of groups){
  const d=document.createElement('details');d.className='p-univ-batch';d.open=state.universalOpen===undefined?group.batch.id===defaultOpen:state.universalOpen===group.batch.id;
  const summary=document.createElement('summary');summary.append(
   element('strong','', (emoji[group.batch.room]||'')+' '+(group.batch.title||group.batch.id)),
   element('span','',group.delivered.length+' / '+group.tasks.length+' entregas · '+(group.last?formatted(group.last):'sin publicaciones'))
  );
  d.append(summary);
  d.addEventListener('toggle',()=>{if(d.open){state.universalOpen=group.batch.id;try{localStorage.setItem('prometeo:root:open-batch',group.batch.id);}catch{}}else if(state.universalOpen===group.batch.id){state.universalOpen='';try{localStorage.removeItem('prometeo:root:open-batch');}catch{}}});
  const intro=element('div','p-univ-batch-tools');
  const launch=document.createElement('a');launch.href=group.batch.launchUrl;launch.target='_blank';launch.rel='noopener noreferrer';launch.textContent='Consignas '+group.tasks.length;
  const copyBtn=option('Copiar WORK',async()=>toast(await copy('👷 '+emoji[group.batch.room]+' WORK · '+group.batch.launchUrl+' · ')?'Copiado':'No se pudo copiar'));
  intro.append(launch,copyBtn);d.append(intro);
  if(!group.delivered.length)d.append(element('p','p-univ-empty','Sin obras publicadas en esta tanda. No se muestran miniaturas ficticias.'));
  else{const grid=element('div','p-univ-grid');const items=[...group.delivered].sort((a,b)=>validDate(b.result)-validDate(a.result)||Number(a.task.number)-Number(b.task.number));for(const x of items)grid.append(card(group,x));d.append(grid);}
  host.append(d);
 }
}

function renderLibrary(){
 if(state.room==='root'){renderUniversalLibrary();return;}
 const host=$('works');host.replaceChildren();
 if(!studioItems(state.room).length)host.append(element('p','p-univ-empty','No se encontraron obras en los datos disponibles. Si falló la conexión, volvé a intentar.'));
 const batch=state.batches.find(b=>b.room===state.room);
 const batchButton=$('batch-link');batchButton.hidden=!batch;
 if(batch){const count=state.public.filter(e=>batch.tasks?.some(t=>t.messageIds?.includes(e.id)||e.batchId===batch.id)).length;batchButton.textContent=count+' / '+batch.tasks.length+' · Entregas';}
 let folder='';
 for(const item of studioItems(state.room)){
  if(item.folder&&item.folder!==folder){folder=item.folder;const h=element('h2','p-work-group',folder);host.append(h);}
  const card=element('article','p-work-card'),open=element('button','p-work-open');open.type='button';
  open.setAttribute('aria-label','Abrir '+item.title);
  const meta=element('span','p-work-meta');meta.append(element('span','',item.kind),element('span','',item.version||''));
  open.append(meta,element('span','p-work-name',item.title));
  open.addEventListener('click',()=>go('#'+state.room+'/obra/'+encodeURIComponent(item.id)));card.append(open);
  if(item.versions.length){
   const detail=element('div','p-work-detail');
   detail.append(element('span','',String(item.versions.length+1)+' versiones'));
   const old=item.versions[0],link=element('a','',old.label);link.href=old.url;link.target='_blank';link.rel='noopener noreferrer';detail.append(link);card.append(detail);
  }
  host.append(card);
 }
}
function parseRoute(){
 let raw='';try{raw=decodeURIComponent(location.hash.slice(1));}catch{}
 if(['capturas','ronda','calibrar','ajustes'].includes(raw)){location.replace('./archivo-20261121.html#'+raw);return null;}
 if(raw==='mensajes')return {room:'root',screen:'messages'};
  if(!raw||raw==='root')return {room:'root',screen:'library',nodeId:'mobiliario',focus:true};
 const parts=raw.split('/'),room=!raw?'root':state.rooms.some(r=>r.id===parts[0])?parts[0]:'root';
 if(room==='root'&&parts[1]==='plano')return {room,screen:'library',nodeId:parts[2]||'mobiliario',focus:true};
 if(room==='root'&&(parts.length===1||['obras','biblioteca','recientes'].includes(parts[1]))){if(parts[1]==='recientes')state.universalView='recent';return {room,screen:'library'};}
 if(!['3d','music','web','video','images'].includes(room))return {room,screen:'messages',batchId:(parts[1]==='mensaje'||parts[1]==='tanda')?(parts[2]||''):''};
 if(parts[1]==='tanda')return {room,screen:'messages',batchId:parts[2]||''};
 if(parts[1]==='mensaje')return {room,screen:'messages',batchId:parts[2]||''};
 if(parts[1]==='mensajes'||parts[1]==='respuestas')return {room,screen:'messages'};
 if(parts[1]==='obra')return {room,screen:'stage',itemId:parts[2]||''};
 if(parts[1]==='biblioteca'||parts[1]==='obras')return {room,screen:'library'};
 if(parts.length===1){let id='';try{id=localStorage.getItem('prometeo:studio:last:'+room)||(room==='3d'?localStorage.getItem('prometeo:studio:last'):'')||'';}catch{}if(!id)id=state.workspaces.find(w=>w.room===room)?.id||'';return {room,screen:id?'stage':'library',itemId:id};}
 return {room,screen:'library'};
}
function go(hash){if(location.hash!==hash)location.hash=hash;else selectRoute(parseRoute());shell.closeMenu();}
function updateContext(){
 const c=$('app-context');c.replaceChildren();
 const studio=['3d','music','web','video','images'].includes(state.room);
 const closeCopy=async value=>{shell.closeMenu();toast(await copy(value)?'Copiado':'No se pudo copiar')};
 const command=kind=>{const host=$('stage-visual'),iframe=host?.querySelector('iframe');try{iframe?.contentWindow?.PROMETEO_WORKSPACE?.[kind]?.()}catch{toast('Herramienta no disponible')}shell.closeMenu()};
 if(studio){
  c.append(option('Estudio',()=>{const first=state.workspaces.find(w=>w.room===state.room),id=state.screen==='stage'?state.itemId:first?.id;if(id)go('#'+state.room+'/obra/'+encodeURIComponent(id));else go('#'+state.room+'/biblioteca')},state.screen==='stage'));
  c.append(option('Proyectos',()=>go('#'+state.room+'/biblioteca'),state.screen==='library'));
  const bubble=option('',()=>go('#'+state.room+'/mensajes'),state.screen==='messages');
  bubble.setAttribute('aria-label','Mensajes');bubble.title='Mensajes';bubble.classList.add('p-context-icon');
  const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.setAttribute('fill','none');icon.setAttribute('stroke','currentColor');icon.setAttribute('stroke-width','1.8');icon.setAttribute('stroke-linecap','round');icon.setAttribute('stroke-linejoin','round');
  const shape=document.createElementNS('http://www.w3.org/2000/svg','path');shape.setAttribute('d','M20 11.5a8 8 0 0 1-8 8 8.5 8.5 0 0 1-3.3-.66L4 20l1.16-4.7A8.5 8.5 0 0 1 4.5 12a8 8 0 0 1 8-8A7.5 7.5 0 0 1 20 11.5Z');icon.append(shape);bubble.append(icon);c.append(bubble);
  const batch=state.batches.find(b=>b.room===state.room);
  if(batch)c.append(option('Tanda · '+batch.tasks.length,()=>go('#'+state.room+'/tanda/'+batch.id),false,true));
  if(state.room==='3d')c.append(option('FORJA · Editor',()=>{shell.closeMenu();newTab(PUBLIC+'forja/');},false,true));
  if(state.screen==='stage'){
   const item=studioItems(state.room).find(x=>x.id===state.itemId);
   if(item){
    const editable=String(item.url).includes('/workspaces/creative.html');
    if(editable){
     c.append(option('Abrir archivo local',()=>command('open'),false,true));
     c.append(option('Herramientas',()=>command('tools'),false,true));
     if(state.room==='web')c.append(option('Editar HTML',()=>command('edit'),false,true));
     if(state.room==='images')c.append(option('Comparar original',()=>command('compare'),false,true));
     c.append(option('Exportar',()=>command('save'),false,true));
    }
    c.append(option('Abrir fuente',()=>{shell.closeMenu();newTab(item.url)},false,true));
    for(const ver of item.versions||[])c.append(option('Versión · '+ver.label,()=>{shell.closeMenu();newTab(ver.url)},false,true));
   }
  }
  c.append(option('Comentar esta pantalla',()=>closeCopy(currentReference()),false,true));
 }else{
  if(state.room==='root'||state.room==='direccion'){
   c.append(option('Obras',()=>go('#root/obras'),state.room==='root'&&state.screen==='library'&&!location.hash.startsWith('#root/plano')&&location.hash!==''&&location.hash!=='#root'));
    c.append(option('Mensajes',()=>go('#root/mensajes'),state.room==='root'&&state.screen==='messages'));
   c.append(option('Revisar sin audio',()=>closeCopy('WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/root/AUTOCRITICA_WHISPLASH.md · ESTE_CHAT'),false,true));
   c.append(option('Actualizar flujos',()=>closeCopy('WORK · https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/FLOW_REVIEW.md'),false,true));
   const a=document.createElement('a');a.href='./archivo-20261121.html#mensajes';a.textContent='Archivo';a.className='p-context-small';c.append(a);
  }
  c.append(option('Comentar ROOT',()=>closeCopy(currentReference()),false,true));
 }
 if(state.room!=='root'||!['','#root'].includes(location.hash)&&!location.hash.startsWith('#root/plano/'))c.append(option('SEGUIR',()=>go('#root/plano/'+(state.nodeId||'mobiliario')),false,true));
 c.append(option('IDEA',()=>closeCopy(focusMap.ideaPrompt(state.nodeId)),false,true));
 c.append(option('TRABAJAR',()=>closeCopy(focusMap.workPrompt(state.nodeId)),false,true));
 // Las obras se abren desde Obras/Proyectos o la acción contextual; no repetir ROOT como VER.
}
function renderStage(){
 const item=studioItems(state.room).find(x=>x.id===state.itemId);
 if(!item){state.screen='library';renderLibrary();$('library').hidden=false;$('stage').hidden=true;return;}
 try{localStorage.setItem('prometeo:studio:last:'+state.room,item.id);if(state.room==='3d')localStorage.setItem('prometeo:studio:last',item.id);}catch{}
 const host=$('stage-visual');
 if(host.dataset.url!==item.url){
  host.replaceChildren();
  let media;
  if(item.media==='image'){media=document.createElement('img');media.alt=item.title;}
  else if(item.media==='video'||item.media==='audio'){media=document.createElement(item.media);media.controls=true;media.preload='metadata';}
  else{media=document.createElement('iframe');media.title=item.title;media.allowFullscreen=true;media.referrerPolicy='strict-origin-when-cross-origin';}
  media.src=item.url;host.append(media);host.dataset.url=item.url;
 }
 $('stage-open').href=item.url;
}
function selectRoute(next){
 if(!next||!state.ready)return;
 state.room=next.room;state.screen=next.screen;state.itemId=next.itemId||'';state.batchId=next.batchId||'';if(next.nodeId)state.nodeId=focusMap.ids.has(next.nodeId)?next.nodeId:'mobiliario';
 shell.setRoom(state.room);shell.setAttribute('app-label',state.rooms.find(r=>r.id===state.room)?.label||'PROMETEO');
 const studio=['3d','music','web','video','images'].includes(state.room);
 if(studio&&state.screen==='stage'&&!studioItems(state.room).some(x=>x.id===state.itemId))state.screen='library';
 shell.toggleAttribute('stage-mode',studio&&state.screen==='stage');
  const focusActive=state.room==='root'&&state.screen==='library'&&next.focus===true;
  $('library').classList.toggle('p-library--focus',focusActive);
 $('messages').hidden=(studio||state.room==='root')&&state.screen!=='messages';
 $('library').hidden=!(studio||state.room==='root')||state.screen!=='library';
 $('stage').hidden=!studio||state.screen!=='stage';
 if((studio||state.room==='root')&&state.screen==='library'&&!focusActive)renderLibrary();
 if(studio&&state.screen==='stage')renderStage();
 else{const host=$('stage-visual');if(host.dataset.url){host.replaceChildren();delete host.dataset.url;}}
 if(state.screen==='messages')renderMessages();
 focusMap.render({active:focusActive,room:state.room,nodeId:state.nodeId,chair:state.chair,cocina:state.cocina,items:state.items});
 updateContext();document.title=(state.rooms.find(r=>r.id===state.room)?.label||'PROMETEO')+' · PROMETEO';
}
async function refresh(){
 const files={
  rooms:'./ROOMS.json',messages:'./ROOM_MESSAGES.json',legacy:'./REPLIES.json',batches:'./BATCHES.json',
  works:'./WORKS.json',chair:'../asset-lab/chair-01/ASSET.json',cocina:'../cocina-umbria-001/RESULT.json',projects:'../project-explorer/projects.json',w4:'../previews/w5/library/v1/REGISTRY.json',catalog:'../estudios/3d/catalog.json'
 };
 const keys=Object.keys(files),values=await Promise.all(keys.map(async k=>{const p=files[k];try{const d=await get(p);cache(p,d);return d;}catch{return readCache(p);}}));
 const d=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
 if(Array.isArray(d.rooms?.rooms)&&d.rooms.rooms.length){state.rooms=d.rooms.rooms.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id)&&typeof x.label==='string');shell.setRooms(state.rooms);}
 state.indexUnavailable=!Array.isArray(d.messages?.entries)||!Array.isArray(d.batches?.batches);
 if(Array.isArray(d.messages?.entries))state.public=d.messages.entries;
 if(Array.isArray(d.legacy?.entries))state.legacy=d.legacy.entries;
 if(Array.isArray(d.batches?.batches))state.batches=d.batches.batches.filter(b=>b&&/^[a-z0-9-]+$/.test(b.id)&&Array.isArray(b.tasks));
 if(Array.isArray(d.works?.items))state.workspaces=d.works.items.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id)&&['music','web','video','images'].includes(x.room)&&safePreview(x.url));
 window.PROMETEO_PUBLIC_BATCHES=state.batches;window.PROMETEO_PUBLIC_MESSAGES=state.public;
 if(Array.isArray(d.projects?.projects))state.projects=d.projects.projects;
 if(Array.isArray(d.w4?.records))state.w4=d.w4.records;
 if(d.catalog?.schema)state.catalog=d.catalog;
 if(d.chair?.schema==='prometeo.asset.prototype/v1')state.chair=d.chair;
 if(d.cocina?.schema)state.cocina=d.cocina;
 buildLibrary();state.ready=true;$('startup-fallback').hidden=true;selectRoute(parseRoute());
}
$('older').addEventListener('click',()=>{state.older=!state.older;renderMessages();});
$('batch-link').addEventListener('click',()=>{const batch=state.batches.find(b=>b.room===state.room);go(batch?'#'+state.room+'/tanda/'+encodeURIComponent(batch.id):'#'+state.room+'/mensajes');});
$('stage-back').addEventListener('click',()=>go('#'+state.room+'/biblioteca'));
shell.setRooms(FALLBACK);
shell.addEventListener('prometeo:navigate',e=>go('#'+e.detail.room));
window.addEventListener('hashchange',()=>{state.older=false;selectRoute(parseRoute());window.scrollTo(0,0);});
document.addEventListener('prometeo:action',e=>{if(e.detail?.kind==='copy')toast(e.detail.success?'Copiado':'No se pudo copiar');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
refresh();setInterval(()=>{if(!document.hidden)refresh();},45000);
