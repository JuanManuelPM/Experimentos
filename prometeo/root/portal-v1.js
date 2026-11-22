/* ROOT PORTAL v1.0.0 · datos anteriores intactos, prueba 3D desacoplada del shell */
import './shared/v1/shell.js';
const $ = id => document.getElementById(id);
const FALLBACK = [
  {id:'direccion',label:'Dirección'},{id:'root',label:'ROOT'},
  {id:'3d',label:'3D'},{id:'music',label:'Música'},
  {id:'web',label:'Web'},{id:'video',label:'Video'},
  {id:'images',label:'Imágenes'}
];
const state={rooms:FALLBACK,room:'direccion',screen:'messages',public:[],legacy:[],older:false};
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
function route(){const raw=decodeURIComponent(location.hash.slice(1));if(['capturas','ronda','calibrar','ajustes'].includes(raw)){location.replace('./archivo-20261121.html#'+raw);return null;}if(raw==='mensajes')return {room:'root',screen:'messages'};const parts=raw.split('/');const room=state.rooms.some(x=>x.id===parts[0])?parts[0]:'direccion';return {room,screen:room==='3d'&&parts[1]!=='mensajes'?'scene':'messages'};}
function selectRoute(next){if(!next)return;state.room=next.room;state.screen=next.screen;state.older=false;shell.setRoom(state.room);shell.setAttribute('app-label',state.rooms.find(x=>x.id===state.room)?.label||'PROMETEO');render();window.scrollTo(0,0);}
function target(room,screen){const h=room==='3d'&&screen==='messages'?'3d/mensajes':room;if(location.hash.slice(1)!==h)location.hash=h;selectRoute({room,screen});shell.closeMenu();}
function option(name,action,minor=false,active=false){const b=document.createElement('button');b.type='button';b.textContent=name;if(minor)b.classList.add('p-context-small');if(active)b.setAttribute('aria-current','page');b.addEventListener('click',action);return b;}
function updateContext(){const el=$('app-context');el.replaceChildren();if(state.room==='3d'){
    el.append(option('Escena',()=>target('3d','scene'),false,state.screen==='scene'));
    el.append(option('Mensajes',()=>target('3d','messages'),false,state.screen==='messages'));
  }else{el.append(option('Mensajes',()=>{shell.closeMenu();},false,true));}
  el.append(option('Copiar',copyCurrent,true));
  if(state.room==='root'||state.room==='direccion'){
    const a=document.createElement('a');a.href='./archivo-20261121.html#mensajes';a.textContent='Archivo';a.className='p-context-small';el.append(a);
  }
}
function messages(){const own=state.public.filter(e=>e&&e.room===state.room);const legacy=state.room==='root'?state.legacy.map(e=>({...e,room:'root'})):[];return [...own,...legacy].sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')));}
function renderMessages(){const room=state.rooms.find(x=>x.id===state.room)||FALLBACK[0];$('space').textContent=room.label;const m=messages();const latest=m[0];$('date').textContent=latest?.publishedAt?new Date(latest.publishedAt).toLocaleDateString('es-AR',{day:'2-digit',month:'short'}):'';$('title').textContent=latest?.title||'';$('text').textContent=latest?.body||'';const key=state.room+'|'+(latest?.id||'base');const btn=$('copy');const isCopied=copied(key);btn.dataset.copied=isCopied?'true':'false';btn.textContent=isCopied?'Copiado':'Copiar';btn.onclick=copyCurrent;$('older').hidden=m.length<2;$('older').textContent=state.older?'Ocultar':'Anterior';const h=$('history');h.hidden=!state.older;h.replaceChildren();if(state.older)for(const entry of m.slice(1)){const a=document.createElement('article');a.className='item';const date=document.createElement('time');date.textContent=entry.publishedAt?new Date(entry.publishedAt).toLocaleDateString('es-AR',{day:'2-digit',month:'short'}):'';const title=document.createElement('h2');title.textContent=entry.title||'';const body=document.createElement('p');body.textContent=entry.body||'';a.append(date,title,body);h.append(a);}}
function render(){const scene=state.room==='3d'&&state.screen==='scene';$('scene').hidden=!scene;$('main').hidden=scene;document.title=(state.rooms.find(x=>x.id===state.room)?.label||'PROMETEO')+' · PROMETEO';renderMessages();updateContext();if(scene)drawScene();}
let gl=null,ctx2d=null;
function drawScene(){const canvas=$('scene-canvas');if(!$('scene').hidden){const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(innerWidth*ratio));canvas.height=Math.max(1,Math.round(innerHeight*ratio));if(!gl&&!ctx2d){gl=canvas.getContext('webgl2',{alpha:false,antialias:false})||canvas.getContext('webgl',{alpha:false,antialias:false});if(!gl)ctx2d=canvas.getContext('2d');}const hex=getComputedStyle(document.documentElement).getPropertyValue('--p-stage').trim();const color=/^#[0-9a-f]{6}$/i.test(hex)?[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255):[0.91,0.91,0.89];if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(...color,1);gl.clear(gl.COLOR_BUFFER_BIT);}else if(ctx2d){ctx2d.fillStyle=hex||'#e8e8e5';ctx2d.fillRect(0,0,canvas.width,canvas.height);}}}
$('older').addEventListener('click',()=>{state.older=!state.older;renderMessages();});shell.setRooms(FALLBACK);shell.addEventListener('prometeo:navigate',e=>{const id=e.detail.room;target(id,id==='3d'?'scene':'messages');});window.addEventListener('hashchange',()=>selectRoute(route()));window.addEventListener('resize',drawScene);if(window.matchMedia){matchMedia('(prefers-color-scheme: dark)').addEventListener('change',drawScene);}
async function refresh(){const names=['ROOMS.json','ROOM_MESSAGES.json','REPLIES.json'];const results=await Promise.allSettled(names.map(get));for(let i=0;i<names.length;i++){const data=results[i].status==='fulfilled'?results[i].value:cached(names[i]);if(!data)continue;if(i===0&&Array.isArray(data.rooms)&&data.rooms.length){const rooms=data.rooms.filter(x=>x&&/^[a-z0-9-]+$/.test(x.id)&&typeof x.label==='string').slice(0,80);if(rooms.length){state.rooms=rooms;shell.setRooms(rooms);store(names[i],data);}}if(i===1&&Array.isArray(data.entries)){state.public=data.entries;store(names[i],data);}if(i===2&&Array.isArray(data.entries)){state.legacy=data.entries;store(names[i],data);}}selectRoute(route());}
selectRoute(route());refresh();document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});setInterval(()=>{if(!document.hidden)refresh();},45000);
