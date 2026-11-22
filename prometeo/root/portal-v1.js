/* PROMETEO ROOT · universal shell, real project library and typed batch results. */
import './shared/v1/shell.js';
import './shared/v1/response.js';
import './shared/v1/batch.js';
const $=id=>document.getElementById(id);
const FALLBACK=[{id:'direccion',label:'Dirección'},{id:'root',label:'ROOT'},{id:'3d',label:'3D'},{id:'music',label:'Música'},{id:'web',label:'Web'},{id:'video',label:'Video'},{id:'images',label:'Imágenes'}];
const ROOT_REF='https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-portal-unico-base-20261121/PROMETEO/system/PORTAL_BASE_HANDOFF.md#';
const PUBLIC='https://juanmanuelpm.github.io/Experimentos/prometeo/';
const state={rooms:FALLBACK,room:'direccion',screen:'messages',itemId:'',public:[],legacy:[],batches:[],projects:[],w4:[],catalog:null,older:false,items:[],ready:false};
const shell=$('shell');
let timer;
function toast(text){const n=$('toast');n.textContent=text;n.hidden=false;clearTimeout(timer);timer=setTimeout(()=>n.hidden=true,1800);}
async function get(path){const r=await fetch(path+(path.includes('?')?'&':'?')+'t='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
function cacheKey(path){return 'prometeo:root:cache:'+path;}
function cache(path,data){try{localStorage.setItem(cacheKey(path),JSON.stringify(data));}catch{}}
function readCache(path){try{return JSON.parse(localStorage.getItem(cacheKey(path))||'null');}catch{return null;}}
function promptFor(room){return 'CONTINUAR · PROMETEO · '+String(room||'direccion').toUpperCase()+' · '+ROOT_REF+room;}
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
   return {id:t.id,number:n,label:t.label,sourceUrl:b.launchUrl,result:result||null,evidence:t.evidence||{}};
  });
  const dates=tasks.filter(t=>t.result).map(t=>Date.parse(t.result.publishedAt)||0);
  return {id:b.id,room,title:b.title||'Tanda',publishedAt:new Date(Math.max(Date.parse(b.createdAt)||0,...dates,Date.parse('2026-11-21T00:00:00Z'))).toISOString(),
   blocks:[{type:'batch',id:b.id,title:b.title,launchUrl:b.launchUrl,items:tasks}]};
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
 const list=messages(),last=list[0],view=$('response');
 view.setData(last||{},last?.blocks?.some(b=>b.type==='batch')?[]:[{kind:'copy',label:'Copiar',value:promptFor(state.room)}]);
 const raw=sortedEntries([...ownedMessages().filter(e=>groupedIds().has(e.id)),...list.slice(1)]);
 $('older').hidden=raw.length===0;$('older').textContent=state.older?'Ocultar historial':'Historial';
 const hist=$('history');hist.hidden=!state.older;hist.replaceChildren();
 if(state.older)for(const e of raw){const n=document.createElement('prometeo-response');n.setData(e,[]);hist.append(n);}
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
 const canonical={1:'cocina-umbria-001',2:'cocina-umbria-002',6:'3d-npc-civilian-v1',7:'respawn-desk',8:'retrato-expresivo',9:'investigacion-noir',10:'arcade-objetivos'};
 for(const b of state.batches.filter(b=>b.room==='3d'))for(const t of b.tasks||[]){
  const id=canonical[Number(t.number)];if(!id)continue;
  const result=state.public.find(e=>e&&Array.isArray(t.messageIds)&&t.messageIds.includes(e.id)&&e.room==='3d')||
   state.public.find(e=>e&&e.batchId===b.id&&Number(e.taskNumber)===Number(t.number));
  if(!result)continue;
  const blocks=Array.isArray(result.blocks)?result.blocks:[];
  const link=blocks.find(x=>x&&typeof x.url==='string'&&safePreview(x.url)&&!x.url.includes('/QA.')&&!x.url.includes('/sheet.'));
  if(!link)continue;
  const kind=[6,8].includes(Number(t.number))?'Personaje':[9,10].includes(Number(t.number))?'Juego':'Escena';
  addItem(map,{id,title:result.title||t.label,kind,url:link.url,version:'W5/'+String(t.number).padStart(2,'0'),source:b.id,description:result.body||''},40);
 }
 state.items=[...map.values()].sort((a,b)=>b.rank-a.rank||a.title.localeCompare(b.title,'es'));
}
function element(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function renderLibrary(){
 const host=$('works');host.replaceChildren();
 const batch=state.batches.find(b=>b.room==='3d');
 const batchButton=$('batch-link');batchButton.hidden=!batch;
 if(batch){const count=state.public.filter(e=>batch.tasks?.some(t=>t.messageIds?.includes(e.id)||e.batchId===batch.id)).length;batchButton.textContent=count+' / '+batch.tasks.length+' · Entregas';}
 for(const item of state.items){
  const card=element('article','p-work-card'),open=element('button','p-work-open');open.type='button';
  open.setAttribute('aria-label','Abrir '+item.title);
  const meta=element('span','p-work-meta');meta.append(element('span','',item.kind),element('span','',item.version||''));
  open.append(meta,element('span','p-work-name',item.title));
  open.addEventListener('click',()=>go('#3d/obra/'+encodeURIComponent(item.id)));card.append(open);
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
 const parts=raw.split('/'),room=state.rooms.some(r=>r.id===parts[0])?parts[0]:'direccion';
 if(room!=='3d')return {room,screen:'messages'};
 if(parts[1]==='mensajes'||parts[1]==='respuestas'||parts[1]==='tanda')return {room,screen:'messages'};
 if(parts[1]==='obra')return {room,screen:'stage',itemId:parts[2]||''};
 if(parts[1]==='biblioteca'||parts[1]==='obras')return {room,screen:'library'};
 if(parts.length===1){let id='';try{id=localStorage.getItem('prometeo:studio:last')||'';}catch{}return {room,screen:id?'stage':'library',itemId:id};}
 return {room,screen:'library'};
}
function go(hash){if(location.hash!==hash)location.hash=hash;else selectRoute(parseRoute());shell.closeMenu();}
function updateContext(){
 const c=$('app-context');c.replaceChildren();
 if(state.room==='3d'){
  c.append(option('Obras',()=>go('#3d/biblioteca'),state.screen==='library'));
  c.append(option('Respuestas',()=>go('#3d/mensajes'),state.screen==='messages'));
  c.append(option('Editar · FORJA',()=>{shell.closeMenu();newTab(PUBLIC+'forja/');}));
  if(state.screen==='stage'){
   const item=state.items.find(x=>x.id===state.itemId);
   for(const ver of item?.versions||[])c.append(option('Abrir '+ver.label,()=>{shell.closeMenu();newTab(ver.url);},false,true));
  }
 }else{
  c.append(option('Copiar',async()=>toast(await copy(promptFor(state.room))?'Copiado':'No se pudo copiar'),false,true));
  if(state.room==='root'||state.room==='direccion'){
   const a=document.createElement('a');a.href='./archivo-20261121.html#mensajes';a.textContent='Archivo';a.className='p-context-small';c.append(a);
  }
 }
}
function renderStage(){
 const item=state.items.find(x=>x.id===state.itemId);
 if(!item){state.screen='library';renderLibrary();$('library').hidden=false;$('stage').hidden=true;return;}
 try{localStorage.setItem('prometeo:studio:last',item.id);}catch{}
 const f=$('stage-frame');if(f.dataset.url!==item.url){f.src=item.url;f.dataset.url=item.url;}f.title=item.title;
 $('stage-open').href=item.url;
}
function selectRoute(next){
 if(!next)return;
 state.room=next.room;state.screen=next.screen;state.itemId=next.itemId||'';
 shell.setRoom(state.room);shell.setAttribute('app-label',state.rooms.find(r=>r.id===state.room)?.label||'PROMETEO');
 if(state.room==='3d'&&state.screen==='stage'&&!state.items.some(x=>x.id===state.itemId))state.screen='library';
 $('messages').hidden=state.room==='3d'&&state.screen!=='messages';
 $('library').hidden=state.room!=='3d'||state.screen!=='library';
 $('stage').hidden=state.room!=='3d'||state.screen!=='stage';
 if(state.room==='3d'&&state.screen==='library')renderLibrary();
 if(state.room==='3d'&&state.screen==='stage')renderStage();
 else{const f=$('stage-frame');if(f.dataset.url){f.removeAttribute('src');delete f.dataset.url;}}
 if(state.screen==='messages')renderMessages();
 updateContext();document.title=(state.rooms.find(r=>r.id===state.room)?.label||'PROMETEO')+' · PROMETEO';
}
async function refresh(){
 const files={
  rooms:'./ROOMS.json',messages:'./ROOM_MESSAGES.json',legacy:'./REPLIES.json',batches:'./BATCHES.json',
  projects:'../project-explorer/projects.json',w4:'../previews/w5/library/v1/REGISTRY.json',catalog:'../estudios/3d/catalog.json'
 };
 const keys=Object.keys(files),values=await Promise.all(keys.map(async k=>{const p=files[k];try{const d=await get(p);cache(p,d);return d;}catch{return readCache(p);}}));
 const d=Object.fromEntries(keys.map((k,i)=>[k,values[i]]));
 if(Array.isArray(d.rooms?.rooms)&&d.rooms.rooms.length){state.rooms=d.rooms.rooms.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id)&&typeof x.label==='string');shell.setRooms(state.rooms);}
 if(Array.isArray(d.messages?.entries))state.public=d.messages.entries;
 if(Array.isArray(d.legacy?.entries))state.legacy=d.legacy.entries;
 if(Array.isArray(d.batches?.batches))state.batches=d.batches.batches.filter(b=>b&&/^[a-z0-9-]+$/.test(b.id)&&Array.isArray(b.tasks));
 if(Array.isArray(d.projects?.projects))state.projects=d.projects.projects;
 if(Array.isArray(d.w4?.records))state.w4=d.w4.records;
 if(d.catalog?.schema)state.catalog=d.catalog;
 buildLibrary();state.ready=true;selectRoute(parseRoute());
}
$('older').addEventListener('click',()=>{state.older=!state.older;renderMessages();});
$('batch-link').addEventListener('click',()=>go('#3d/mensajes'));
$('stage-back').addEventListener('click',()=>go('#3d/biblioteca'));
shell.setRooms(FALLBACK);
shell.addEventListener('prometeo:navigate',e=>go('#'+e.detail.room));
window.addEventListener('hashchange',()=>{state.older=false;selectRoute(parseRoute());window.scrollTo(0,0);});
document.addEventListener('prometeo:action',e=>{if(e.detail?.kind==='copy')toast(e.detail.success?'Copiado':'No se pudo copiar');});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
selectRoute(parseRoute());refresh();setInterval(()=>{if(!document.hidden)refresh();},45000);
