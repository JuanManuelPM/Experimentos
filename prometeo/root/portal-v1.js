/* ROOT PORTAL · puente 3D a las obras existentes; shell y visor universal conservados */
import './shared/v1/shell.js';
import './shared/v1/response.js';
const $ = id => document.getElementById(id);
const FALLBACK = [
  {id:'direccion',label:'Dirección'},{id:'root',label:'ROOT'},
  {id:'3d',label:'3D'},{id:'music',label:'Música'},
  {id:'web',label:'Web'},{id:'video',label:'Video'},
  {id:'images',label:'Imágenes'}
];
const STUDIO_VIEWS=Object.freeze({
  cocina:{label:'Cocina Umbría',path:'../cocina-umbria-001/'},
  obras:{label:'Biblioteca 3D',path:'../estudios/3d/'},
  forja:{label:'FORJA',path:'../forja/'},
  tandas:{label:'Producciones W4',path:'../3d-flow/galeria/'}
});
const state={rooms:FALLBACK,room:'direccion',screen:'messages',view:'cocina',public:[],legacy:[],older:false};
const shell=$('shell');
let toastTimer;
function toast(message){ const n=$('toast');n.textContent=message;n.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{n.hidden=true},1800); }
async function get(file){const r=await fetch('./'+file+'?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return r.json();}
function store(key,data){try{localStorage.setItem('prometeo:public:'+key,JSON.stringify(data))}catch{}}
function cached(key){try{return JSON.parse(localStorage.getItem('prometeo:public:'+key)||'null')}catch{return null}}
function copied(key){try{return localStorage.getItem('prometeo:copied:'+key)==='1'}catch{return false}}
function markCopied(key){try{localStorage.setItem('prometeo:copied:'+key,'1')}catch{}}
function promptFor(room){const id=room?.id||'direccion';return 'CONTINUAR · PROMETEO · '+id.toUpperCase()+' · https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-portal-unico-base-20261121/PROMETEO/system/PORTAL_BASE_HANDOFF.md#'+id;}
async function clipboard(text){try{await navigator.clipboard.writeText(text);return true}catch{const a=document.createElement('textarea');a.value=text;a.style.cssText='position:fixed;top:-1000px';document.body.append(a);a.select();let ok=false;try{ok=document.execCommand('copy')}catch{}a.remove();return ok;}}
async function copyCurrent(){const room=state.rooms.find(x=>x.id===state.room)||FALLBACK[0];const msg=messages()[0];const key=state.room+'|'+(msg?.id||'base');const ok=await clipboard(promptFor(room));if(ok)markCopied(key);toast(ok?'Copiado':'No se pudo copiar');renderMessages();updateContext();}
function route(){const raw=decodeURIComponent(location.hash.slice(1));if(['capturas','ronda','calibrar','ajustes'].includes(raw)){location.replace('./archivo-20261121.html#'+raw);return null;}if(raw==='mensajes')return {room:'root',screen:'messages'};const parts=raw.split('/');const room=state.rooms.some(x=>x.id===parts[0])?parts[0]:'direccion';return {room,screen:room==='3d'&&parts[1]!=='mensajes'?'scene':'messages',view:STUDIO_VIEWS[parts[1]]?parts[1]:'cocina'};}
function selectRoute(next){if(!next)return;state.room=next.room;state.screen=next.screen;state.view=next.view||'cocina';state.older=false;shell.setRoom(state.room);shell.setAttribute('app-label',state.rooms.find(x=>x.id===state.room)?.label||'PROMETEO');render();window.scrollTo(0,0);}
function target(room,screen,view='cocina'){const h=room==='3d'?(screen==='messages'?'3d/mensajes':view==='cocina'?'3d':'3d/'+view):room;if(location.hash.slice(1)!==h)location.hash=h;selectRoute({room,screen});shell.closeMenu();}
function option(name,action,minor=false,active=false){const b=document.createElement('button');b.type='button';b.textContent=name;if(minor)b.classList.add('p-context-small');if(active)b.setAttribute('aria-current','page');b.addEventListener('click',action);return b;}
function updateContext(){
 const el=$('app-context');el.replaceChildren();
 if(state.room==='3d'){
  for(const [id,view] of Object.entries(STUDIO_VIEWS)){
   el.append(option(view.label,()=>target('3d','scene',id),false,state.screen==='scene'&&state.view===id));
  }
  el.append(option('Mensajes',()=>target('3d','messages'),false,state.screen==='messages'));
 }else el.append(option('Mensajes',()=>{shell.closeMenu()},false,true));
 el.append(option('Copiar',copyCurrent,true));
 if(state.room==='root'||state.room==='direccion'){
  const a=document.createElement('a');a.href='./archivo-20261121.html#mensajes';a.textContent='Archivo';a.className='p-context-small';el.append(a);
 }
}
function messages(){const own=state.public.filter(e=>e&&e.room===state.room);const legacy=state.room==='root'?state.legacy.map(e=>({...e,room:'root'})):[];return [...own,...legacy].sort((a,b)=>(Date.parse(b.publishedAt)||0)-(Date.parse(a.publishedAt)||0)||String(b.id||'').localeCompare(String(a.id||'')));}
function renderMessages(){
  const room=state.rooms.find(x=>x.id===state.room)||FALLBACK[0],m=messages(),latest=m[0];
  $('space').textContent=room.label;
  const view=$('response');view.setData(latest||{},[{kind:'copy',label:'Copiar',value:promptFor(room)}]);
  $('older').hidden=m.length<2;$('older').textContent=state.older?'Ocultar':'Anterior';
  const history=$('history');history.hidden=!state.older;history.replaceChildren();
  if(state.older)for(const entry of m.slice(1)){
    const item=document.createElement('prometeo-response');
    item.className='item';
    item.setData(entry,[{kind:'copy',label:'Copiar',value:promptFor(room)}]);
    history.append(item);
  }
}
function render(){const scene=state.room==='3d'&&state.screen==='scene';$('scene').hidden=!scene;$('main').hidden=scene;document.title=(state.rooms.find(x=>x.id===state.room)?.label||'PROMETEO')+' · PROMETEO';renderMessages();updateContext();if(scene)renderStudio();else{const f=$('scene-frame');if(f.dataset.view){f.removeAttribute('src');delete f.dataset.view;}}}
function renderStudio(){
 const view=STUDIO_VIEWS[state.view]||STUDIO_VIEWS.cocina;
 const frame=$('scene-frame'),external=$('scene-external');
 const url=new URL(view.path,location.href);
 frame.title=view.label+' · PROMETEO';external.href=url.href;
 external.setAttribute('aria-label','Abrir '+view.label+' fuera de ROOT');
 if(frame.dataset.view!==state.view){frame.dataset.view=state.view;frame.src=url.href;}
}
$('older').addEventListener('click',()=>{state.older=!state.older;renderMessages();});shell.setRooms(FALLBACK);shell.addEventListener('prometeo:navigate',e=>{const id=e.detail.room;target(id,id==='3d'?'scene':'messages');});window.addEventListener('hashchange',()=>selectRoute(route()));
async function refresh(){const names=['ROOMS.json','ROOM_MESSAGES.json','REPLIES.json'];const results=await Promise.allSettled(names.map(get));for(let i=0;i<names.length;i++){const data=results[i].status==='fulfilled'?results[i].value:cached(names[i]);if(!data)continue;if(i===0&&Array.isArray(data.rooms)&&data.rooms.length){const rooms=data.rooms.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id)&&typeof x.label==='string').slice(0,80);if(rooms.length){state.rooms=rooms;shell.setRooms(rooms);store(names[i],data);}}if(i===1&&Array.isArray(data.entries)){state.public=data.entries;store(names[i],data);}if(i===2&&Array.isArray(data.entries)){state.legacy=data.entries;store(names[i],data);}}const fixture=new URLSearchParams(location.search).get('fixture');
 if(fixture==='text'||fixture==='jobs'){
   try{const sample=await get('fixtures/response-'+(fixture==='jobs'?'ten':'text')+'.json');state.public=[sample];state.legacy=[];}
   catch(error){console.warn('Fixture unavailable',error);}
 }
 selectRoute(route());}
selectRoute(route());refresh();document.addEventListener('prometeo:action',e=>{if(e.detail?.kind==='copy')toast(e.detail.success?'Copiado':'No se pudo copiar');});document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden)refresh();},45000);
