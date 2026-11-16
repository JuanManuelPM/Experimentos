(function explorer(){
'use strict';
if(window.__PROMETEO3D_EXPLORER__)return;
window.__PROMETEO3D_EXPLORER__=true;
const base=new URL('./',document.currentScript.src), home=document.body.dataset.prometeoExplorerHome==='true';
const API='https://api.github.com/repos/JuanManuelPM/Experimentos/', CACHE='prometeo_3d_explorer_v1', TTL=30*60*1000;
let projects=[],folders={},opened=false,refreshing=false;
const host=document.createElement('div');host.id='prometeo-3d-explorer-host';document.body.appendChild(host);
const shadow=host.attachShadow({mode:'open'});
shadow.innerHTML=`
<style>
:host{all:initial;font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#eef3ef}
*{box-sizing:border-box}[hidden]{display:none!important}
#launcher{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));z-index:2147483000;border:1px solid #607979;border-radius:12px;width:43px;height:43px;background:#13242be8;color:#fff;font-size:23px;box-shadow:0 3px 15px #0008;cursor:pointer}
#screen{position:fixed;inset:0;z-index:2147483001;display:none}
#screen.active{display:block}
#mask{position:absolute;inset:0;background:#01060ac4}
#sheet{position:absolute;right:0;top:0;width:min(94vw,440px);height:100vh;height:100dvh;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:calc(20px + env(safe-area-inset-top)) 14px calc(30px + env(safe-area-inset-bottom));background:#0d181d;border-left:1px solid #34474d;box-shadow:-10px 0 36px #0008;line-height:1.35;color:#f2f0eb}
#top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
#eyebrow{font:800 10px system-ui;letter-spacing:.14em;color:#d6ba97}
h1{font:650 28px system-ui;letter-spacing:-.04em;margin:6px 0 8px}
#desc{color:#a7b7b7;font:12px/1.5 system-ui;margin:2px 0 17px}
#close{border:1px solid #445a5d;border-radius:10px;background:#182c30;color:#fff;width:40px;height:40px;font-size:25px}
#list{display:grid;gap:9px}
.group{border:1px solid #344e51;border-radius:13px;overflow:hidden;background:#14262b}
.group summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:9px;padding:14px 12px;min-height:53px;color:#eef3ef}
.group summary::-webkit-details-marker{display:none}
.folder-icon{font-size:19px;color:#dec4a5}
.folder-title{font:700 14px system-ui;flex:1}.folder-count{font:12px system-ui;color:#a2b4b1}
.arrow{font-size:20px;color:#97aba7;transform:rotate(0);transition:transform .18s}
details[open] .arrow{transform:rotate(90deg)}
.items{padding:0 8px 9px;display:grid;gap:6px}
.item{display:block;color:#f2f3ef!important;text-decoration:none!important;padding:11px 11px;border:1px solid #32494d;border-radius:9px;background:#1b3035}
.item:hover,.item:active{background:#29464a}
.item-header{display:flex;align-items:baseline;gap:8px}
.item-title{font:650 13px/1.3 system-ui;flex:1;min-width:0}
.item-date{white-space:nowrap;color:#b1c6c0;font:10px/1.4 ui-monospace,Consolas,monospace}
.item-desc{font:11px/1.4 system-ui;color:#a2b4b3;margin-top:4px}
#status{font:10px/1.5 system-ui;color:#b9c5c4;margin-top:15px}
#footer{font:11px/1.6 system-ui;color:#9badac;margin-top:13px;padding-top:12px;border-top:1px solid #35484b}
#all{display:block;color:#dfc7a6!important;text-decoration:underline;font-weight:700;margin-top:8px}
button,a,summary{touch-action:manipulation}
button:focus-visible,a:focus-visible,summary:focus-visible{outline:2px solid #e9c5a0;outline-offset:3px}
#screen.home #mask{display:none}
#screen.home #sheet{left:0;right:0;margin:0 auto;width:min(100vw,650px);border:0;box-shadow:none}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<button id="launcher" title="Carpetas del Estudio 3D" aria-label="Abrir proyectos 3D">ⓘ</button>
<div id="screen" role="dialog" aria-label="Carpetas de proyectos del Estudio 3D" aria-modal="true">
  <div id="mask"></div>
  <div id="sheet">
    <div id="top"><div><div id="eyebrow">PROMETEO / ESTUDIO 3D</div><h1>Proyectos</h1></div><button id="close" aria-label="Cerrar">×</button></div>
    <div id="desc">Carpetas ordenadas por la última actualización pública.</div>
    <div id="list">Cargando proyectos…</div>
    <div id="status" aria-live="polite">Abriendo registro…</div>
    <div id="footer">Fecha = último commit público de la carpeta, no aprobación artística. No se muestran proyectos privados.<a id="all">Ver el índice completo</a></div>
  </div>
</div>`;
const el=id=>shadow.getElementById(id),screen=el('screen'),button=el('launcher'),status=el('status');
const safe=id=>typeof id==='string'&&/^[a-z0-9_/-]+$/.test(id)&&!id.includes('..');
const date=iso=>{try{return iso?new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(iso)):'sin fecha';}catch{return 'sin fecha';}};
const url=id=>new URL('../'+id+'/',base).href;
const create=(tag,cls,txt)=>{const v=document.createElement(tag);if(cls)v.className=cls;if(txt!==undefined)v.textContent=txt;return v;};
const cmp=(a,b)=>(Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)||a.title.localeCompare(b.title,'es');
function paint(){
 const target=el('list');target.replaceChildren();
 const groups=new Map();
 for(const p of projects.filter(p=>safe(p.id))){const f=folders[p.folder]?p.folder:'pruebas';if(!groups.has(f))groups.set(f,[]);groups.get(f).push(p);}
 const ordered=[...groups].map(([id,items])=>({id,items:items.sort(cmp),last:Math.max(0,...items.map(p=>Date.parse(p.updatedAt)||0))})).sort((a,b)=>b.last-a.last);
 if(!ordered.length){target.textContent='No hay proyectos públicos registrados';return;}
 ordered.forEach((g,i)=>{
 const d=create('details','group');d.open=i===0;
 const s=create('summary');s.append(create('span','folder-icon','▣'),create('span','folder-title',folders[g.id]),create('span','folder-count',String(g.items.length)),create('span','arrow','›'));d.append(s);
 const list=create('div','items');
 for(const p of g.items){const link=create('a','item');link.href=url(p.id);link.target='_self';link.setAttribute('aria-label',p.title+' · '+date(p.updatedAt));
 const line=create('div','item-header'),when=create('time','item-date',date(p.updatedAt));if(p.updatedAt)when.dateTime=p.updatedAt;
 line.append(create('span','item-title',p.title),when);link.append(line);if(p.description)link.append(create('div','item-desc',p.description));list.append(link);}
 d.append(list);target.append(d);
 });
}
function open(){opened=true;screen.classList.add('active');button.hidden=true;const old=document.getElementById('drawer');if(old)old.hidden=true;if(!projects.length)load();else refresh();}
function close(){if(home)return;opened=false;screen.classList.remove('active');if(!document.getElementById('toggle-info'))button.hidden=false;}
button.addEventListener('click',open);el('mask').addEventListener('click',close);el('close').addEventListener('click',close);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened&&!home)close();});
el('all').href=base.href;if(home){button.hidden=true;el('close').hidden=true;el('all').hidden=true;screen.classList.add('active','home');opened=true;}
const info=document.getElementById('toggle-info');
if(info&&!home){
 info.setAttribute('aria-label','Ver proyectos 3D');info.setAttribute('title','Carpetas de proyectos');
 button.hidden=true;
 document.addEventListener('click',e=>{if(e.target===info||info.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();opened?close():open();}},true);
}
function cached(){try{const c=JSON.parse(localStorage.getItem('prometeo_3d_explorer_v1')||'null');return c&&Array.isArray(c.projects)?c:null;}catch{return null;}}
function keep(){try{localStorage.setItem('prometeo_3d_explorer_v1',JSON.stringify({at:Date.now(),projects}));}catch{}}
async function api(endpoint){const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),7500);try{const r=await fetch(API+endpoint,{headers:{Accept:'application/vnd.github+json'},signal:ctrl.signal,cache:'no-store'});if(!r.ok)throw Error('GitHub '+r.status);return await r.json();}finally{clearTimeout(timer);}}
async function load(){
 try{const r=await fetch(new URL('projects.json',base),{cache:'no-cache'});if(!r.ok)throw Error('Registro no disponible');const data=await r.json();if(!Array.isArray(data.projects))throw Error('Registro inválido');folders=data.folders||{};projects=data.projects.filter(p=>safe(p.id));
 const c=cached();if(c){const map=new Map(projects.map(x=>[x.id,x]));for(const p of c.projects.filter(x=>safe(x.id))){const prev=map.get(p.id);if(!prev||(Date.parse(p.updatedAt)||0)>(Date.parse(prev.updatedAt)||0))map.set(p.id,{...(prev||{}),...p});}projects=[...map.values()];}
 paint();status.textContent='Registro público · '+projects.length+' visualizaciones';refresh();
 }catch(e){el('list').textContent='No se pudo cargar la lista';status.textContent=String(e);}
}
async function refresh(){
 if(refreshing||!projects.length)return;
 const c=cached();if(c&&Date.now()-c.at<30*60*1000){status.textContent='Registro guardado · '+projects.length+' visualizaciones';return;}
 refreshing=true;status.textContent='Consultando nuevas publicaciones en GitHub…';let ok=0;
 try{
 const tree=await api('git/trees/gh-pages?recursive=1');
 if(Array.isArray(tree.tree)){
  const all=tree.tree.filter(e=>e.type==='blob'&&/^prometeo\/.+\/index\.html$/.test(e.path)&&!e.path.includes('/project-explorer/')).map(e=>e.path.slice(9,-11)).filter(safe);
  const map=new Map(projects.map(p=>[p.id,p]));
  for(const id of all)if(!map.has(id)){const last=id.split('/').pop();map.set(id,{id,title:last.replace(/[_-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),folder:'pruebas',description:'Nueva visualización',updatedAt:null});}
  projects=[...map.values()];paint();
 }
 let cursor=0;const tasks=projects.slice();
 await Promise.all(Array.from({length:3},async()=>{while(cursor<tasks.length){const p=tasks[cursor++];try{const a=await api('commits?sha=gh-pages&path='+encodeURIComponent('prometeo/'+p.id)+'&per_page=1');if(a[0]){p.updatedAt=a[0].commit?.committer?.date||a[0].commit?.author?.date||p.updatedAt;p.commit=a[0].sha;ok++;}}catch{}}}));
 projects.sort(cmp);paint();if(ok)keep();status.textContent=ok?'GitHub consultado '+date(new Date().toISOString())+' · '+projects.length+' proyectos':'Fechas guardadas; GitHub no respondió en vivo';
 }catch{status.textContent='Mostrando las fechas verificadas guardadas';}
 refreshing=false;
}
if(home)load();
window.PROMETEO3DProjects=Object.freeze({open,close,refresh});
})();