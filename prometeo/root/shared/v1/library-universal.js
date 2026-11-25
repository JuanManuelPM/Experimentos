
/* Small DOM-only adapter, no catalog or result selection logic. */
(()=>{'use strict';
const B=document.body, is3d=B.dataset.library==='3d', rail=document.querySelector('#u-rail'), main=document.querySelector('main');
if(!rail||!main)return;
const current=new URL(location.href), base=new URL(is3d?'../../':'../../',current);
const from3d=new URL('estudios/3d/universal.html',base).href, fromGallery=new URL('root/galeria/universal.html',base).href;
const themes=[{"id":"original","name":"Original","desc":"Cálido, redondeado, aireado"},{"id":"industrial","name":"Industrial","desc":"Acero, hormigón, módulos precisos"},{"id":"brutal","name":"Digital Brutalism","desc":"Negro, blancos y cortes duros"},{"id":"shibui","name":"Shibui","desc":"Papel, madera, silencio visual"},{"id":"rams","name":"Dieter Rams","desc":"Instrumental, marcos y precisión"},{"id":"noir","name":"Tech Noir","desc":"Oscuridad cinematográfica"},{"id":"monastic","name":"Monastic","desc":"Galería austera, piezas aisladas"},{"id":"swiss","name":"Swiss Editorial","desc":"Grilla asimétrica y señal roja"},{"id":"void","name":"Voidcore","desc":"Obras flotantes sobre negro absoluto"},{"id":"mono","name":"Monochrome Rice","desc":"Grilla de precisión, tinta y píxeles"}];
const icon={theme:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17.5h7m-3.5-3.5v7"/>',more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
close:'<path d="m5 5 14 14M19 5 5 19"/>',
menu:'<path d="M5 9h14M5 15h14"/>',
rotate:'<path d="M9 7.5h9v7M15 16.5H6v-7" stroke-width="2.2" stroke-linecap="square" stroke-linejoin="miter"/><path d="m14.6 13.8 3.4 3.5 3.4-3.5zM2.6 10.2 6 6.7l3.4 3.5z" fill="currentColor" stroke="none"/>',
home:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
'3d':'<path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8"/>',
video:'<path d="M7 4.8v14.4L19 12z"/>',music:'<path d="M4 10v4m4-7v10m4-14v18m4-14v10m4-7v4"/>',
images:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 6-6 4 4 3-3 5 5"/>',
web:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M6 6.5h.1m3 0h.1"/>',
filter:'<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--u-bg)"/><circle cx="16" cy="12" r="2" fill="var(--u-bg)"/><circle cx="10" cy="18" r="2" fill="var(--u-bg)"/>',
history:'<path d="M3 12a9 9 0 1 1 3 6.7M3 5v7h7M12 7v5l4 2"/>',
copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
assets:'<path d="M3 6h7l2 2h9v12H3z"/>',tools:'<path d="m14 6 4 4 3-3a6 6 0 0 1-7 7l-7 7-4-4 7-7a6 6 0 0 1 7-7z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',arrow:'<path d="M5 19 19 5M7 5h12v12"/>',batch:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16M10 10v10"/>',refresh:'<path d="M20 7a9 9 0 1 0 1 8M20 3v5h-5"/>'};
function decorate(el,key,label){el.classList.add('u-icon');el.title=label;el.setAttribute('aria-label',label);el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icon[key]+'</svg>';return el}
function link(key,label,href){const el=document.createElement('a');el.href=href;return decorate(el,key,label)}
function btn(key,label,fn){const el=document.createElement('button');el.type='button';decorate(el,key,label);el.onclick=fn;return el}
function sep(){const e=document.createElement('div');e.className='u-sep';return e}
function spacer(){const e=document.createElement('div');e.className='u-spacer';return e}
function toggle(el,cls){const on=B.classList.toggle(cls);el.setAttribute('aria-pressed',String(on));return on}
const studies=[['3d','3D'],['video','Video'],['music','Música'],['images','Imágenes'],['web','Web']];
main.classList.add('u-scroll');
rail.append(link('home','ROOT',new URL('root/#root/obras',base).href),sep());
const nav=document.createElement('nav');nav.setAttribute('aria-label','Estudios');rail.append(nav);
for(const [key,label] of studies){const a=link(key,label,key==='3d'?from3d:fromGallery+'?studio='+key);if(is3d&&key==='3d')a.setAttribute('aria-current','page');nav.append(a)}
rail.append(sep());
const info=btn('info','Mostrar títulos, estados y detalles',()=>toggle(info,'u-info'));info.setAttribute('aria-pressed','false');
if(is3d){
 const old=document.querySelector('.top');const filter=document.querySelector('#filter-toggle');if(filter){decorate(filter,'filter','Buscar y filtrar');rail.append(filter)}if(old)old.hidden=true;
 rail.append(link('assets','Biblioteca de assets',new URL('assets-library/',base).href),link('tools','FORJA',new URL('forja/',base).href),link('batch','Tandas 3D',fromGallery+'?studio=3d'),link('history','Ola 001',new URL('estudios/3d/ola001/',base).href));
 // Retain original latest panel / status for on-demand info and partial catalog notices.
 const review=btn('arrow','Abrir obra en revisión',()=>document.querySelector('#latest-open')?.click());review.hidden=true;rail.append(review);
 const latest=document.querySelector('#latest');if(latest){new MutationObserver(()=>{review.hidden=latest.hidden}).observe(latest,{attributes:true,attributeFilter:['hidden']});review.hidden=latest.hidden}
 const note=document.querySelector('#updated');if(note){new MutationObserver(()=>{info.title='Mostrar detalles · '+note.textContent}).observe(note,{childList:true,subtree:true,characterData:true})}
}else{
 const studioNav=document.querySelector('#studios'), content=document.querySelector('#content');
 const batch3d=link('batch','Tandas 3D',fromGallery+'?studio=3d');rail.append(batch3d);
 const historyButton=btn('history','Tandas anteriores',()=>toggle(historyButton,'u-history'));historyButton.setAttribute('aria-pressed','false');
 const copy=btn('copy','Copiar WORK de la última tanda',()=>document.querySelector('#content .copy')?.click());
 rail.append(historyButton,copy);
 function sync(){const active=studioNav?.querySelector('[aria-current=true]');const name=active?.textContent||'';for(const a of nav.children){if(a.getAttribute('aria-label')===name&&name!=='3D')a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}if(name==='3D')batch3d.setAttribute('aria-current','page');else batch3d.removeAttribute('aria-current');B.classList.toggle('u-loaded',!!content?.querySelector('.grid'));copy.disabled=!content?.querySelector('.copy');}
 if(studioNav)new MutationObserver(sync).observe(studioNav,{childList:true});if(content)new MutationObserver(sync).observe(content,{childList:true});
 // Use links in the visible rail. Original navigation still exists for its render state.
 sync();
}
rail.append(spacer(),info);
const controls=document.createElement('div');controls.className='u-controls';
while(rail.firstChild)controls.append(rail.firstChild);
const close=btn('close','Cerrar menú',()=>setCollapsed(true));close.classList.add('u-close');
const open=btn('menu','Abrir menú',()=>setCollapsed(false));open.classList.add('u-open');
const rotate=btn('rotate','Cambiar orientación',()=>{const effective=B.classList.contains('u-portrait')?'portrait':'landscape';desired=effective==='portrait'?'landscape':'portrait';save('orientation',desired);hideFly();layout()});rotate.classList.add('u-rotate');rotate.querySelector('svg').setAttribute('viewBox','2 2 20 20');
close.classList.add('u-anchor');open.classList.add('u-anchor');
const mask=document.createElement('div');mask.className='u-mask';
const panel=document.createElement('div');panel.className='u-panel';panel.id='u-panel';
const track=document.createElement('div');track.className='u-track';
const fly=document.createElement('div');fly.className='u-flyout';fly.id='u-flyout';fly.hidden=true;
const activeStudio=is3d?'3d':(current.searchParams.get('studio')||'3d');
const studiesButton=btn(studies.some(s=>s[0]===activeStudio)?activeStudio:'home','Cambiar de estudio',()=>toggleFly('studies'));
const moreButton=btn('more','Más funciones',()=>toggleFly('more'));
const groups=document.createElement('div');groups.append(nav,controls);fly.append(groups);
const themeEntry=document.createElement('button');themeEntry.type='button';themeEntry.className='u-theme-entry';themeEntry.dataset.uThemeAction='1';themeEntry.textContent='Temas · 10 estilos';themeEntry.onclick=()=>toggleFly('themes');fly.append(themeEntry);
const themeList=document.createElement('section');themeList.className='u-theme-list';themeList.hidden=true;themeList.setAttribute('aria-label','Elegir estilo visual');
const themeBack=document.createElement('button');themeBack.type='button';themeBack.className='u-theme-back';themeBack.dataset.uThemeAction='1';themeBack.textContent='‹ Opciones';themeBack.onclick=()=>toggleFly('more');themeList.append(themeBack);
const themeGrid=document.createElement('div');themeGrid.className='u-theme-grid';themeList.append(themeGrid);
for(const t of themes){const b=document.createElement('button');b.type='button';b.className='u-theme-choice';b.dataset.uThemeAction='1';b.dataset.themeChoice=t.id;b.setAttribute('aria-label',t.name+' · '+t.desc);b.title=t.desc;const preview=document.createElement('span');preview.className='u-theme-preview';preview.dataset.preview=t.id;preview.setAttribute('aria-hidden','true');for(let i=0;i<6;i++)preview.append(document.createElement('i'));const bar=document.createElement('em');preview.append(bar);const label=document.createElement('span');label.textContent=t.name;b.append(preview,label);b.onclick=()=>applyTheme(t.id);themeGrid.append(b)}
fly.append(themeList);
function applyTheme(id){if(!themes.some(t=>t.id===id))id='original';B.dataset.uTheme=id;save('theme',id);for(const b of themeGrid.children)b.setAttribute('aria-pressed',String(b.dataset.themeChoice===id))}

for(const b of [studiesButton,moreButton]){b.setAttribute('aria-controls','u-flyout');b.setAttribute('aria-expanded','false')}
let flyMode=null;
function toggleFly(mode){if(flyMode===mode){hideFly();return}flyMode=mode;nav.hidden=mode!=='studies';controls.hidden=mode!=='more';groups.hidden=mode==='themes';themeEntry.hidden=mode!=='more';themeList.hidden=mode!=='themes';fly.classList.toggle('u-theme-open',mode==='themes');fly.hidden=false;studiesButton.setAttribute('aria-expanded',String(mode==='studies'));moreButton.setAttribute('aria-expanded',String(mode==='more'||mode==='themes'))}
function hideFly(){flyMode=null;fly.hidden=true;studiesButton.setAttribute('aria-expanded','false');moreButton.setAttribute('aria-expanded','false')}
fly.addEventListener('click',e=>{if(e.target.closest('button,a')&&!e.target.closest('[data-u-theme-action]'))hideFly()});
panel.append(studiesButton,moreButton,rotate);track.append(panel);mask.append(track);rail.append(mask,close,open,fly);
open.setAttribute('aria-controls','u-panel');close.setAttribute('aria-controls','u-panel');
function load(k){try{return localStorage.getItem('prometeo:library:'+k)}catch{return null}}
function save(k,v){try{localStorage.setItem('prometeo:library:'+k,v)}catch{}}
function setCollapsed(on,focus=true){open.setAttribute('aria-expanded',String(!on));close.setAttribute('aria-expanded',String(!on));panel.inert=on;panel.setAttribute('aria-hidden',String(on));B.classList.toggle('u-collapsed',on);save('collapsed',on?'1':'0');if(on){hideFly();const panel=document.querySelector('#filters-panel');if(panel&&!panel.hidden)document.querySelector('#filter-toggle')?.click()}if(focus)(on?open:close).focus()}
let desired=load('orientation');
function layout(){const w=window.innerWidth,h=window.innerHeight,native=w>=h?'landscape':'portrait',effective=desired||native,rotated=effective!==native;const vw=rotated?h:w,vh=rotated?w:h;B.classList.toggle('u-portrait',effective==='portrait');B.classList.toggle('u-compact',vh<520);B.classList.toggle('u-rotated',rotated);B.style.setProperty('--u-w',vw+'px');B.style.setProperty('--u-h',vh+'px');rotate.setAttribute('aria-label',effective==='portrait'?'Ver en horizontal':'Ver en vertical');rotate.title=rotate.getAttribute('aria-label');}

const corners=['tl','tr','bl','br'];
function setCorner(c){if(!corners.includes(c))c='bl';panel.style.transition='none';mask.style.transition='none';B.dataset.corner=c;save('corner',c);void panel.offsetWidth;panel.style.removeProperty('transition');mask.style.removeProperty('transition')}
function nearest(x,y,w,h){return (y<h/2?'t':'b')+(x<w/2?'l':'r')}
function point(e){return B.classList.contains('u-rotated')?{x:e.clientY,y:window.innerWidth-e.clientX}:{x:e.clientX,y:e.clientY}}
let drag=null,ignoreClick=false;
open.setAttribute('aria-label','Abrir menú; arrastrar a otra esquina o usar las flechas');
open.title='Abrir o mover menú';
open.onclick=()=>{if(!ignoreClick)setCollapsed(false)};
open.addEventListener('pointerdown',e=>{if(!B.classList.contains('u-collapsed')||e.button!==0||drag)return;const p=point(e);drag={id:e.pointerId,x:p.x,y:p.y,moved:false};ignoreClick=false;open.setPointerCapture(e.pointerId)});
open.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const p=point(e);if(!drag.moved&&Math.hypot(p.x-drag.x,p.y-drag.y)<7)return;drag.moved=true;B.classList.add('u-dragging');const size=open.offsetWidth,w=B.clientWidth,h=B.clientHeight;B.style.setProperty('--u-drag-x',Math.max(0,Math.min(w-size,p.x-size/2))+'px');B.style.setProperty('--u-drag-y',Math.max(0,Math.min(h-size,p.y-size/2))+'px')});
function finish(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;const p=point(e),moved=drag.moved;drag=null;B.classList.remove('u-dragging');if(moved){ignoreClick=true;if(!cancel)setCorner(nearest(p.x,p.y,B.clientWidth,B.clientHeight));setTimeout(()=>{ignoreClick=false},350)}if(open.hasPointerCapture(e.pointerId))open.releasePointerCapture(e.pointerId)}
open.addEventListener('pointerup',e=>finish(e));open.addEventListener('pointercancel',e=>finish(e,true));open.addEventListener('lostpointercapture',e=>finish(e,true));
open.addEventListener('keydown',e=>{const c=B.dataset.corner;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();setCorner(e.key==='ArrowLeft'?c[0]+'l':e.key==='ArrowRight'?c[0]+'r':e.key==='ArrowUp'?'t'+c[1]:'b'+c[1])});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!B.classList.contains('u-collapsed')&&(!is3d||document.querySelector('#overlay')?.hidden))setCollapsed(true)});
main.addEventListener('click',e=>{if(B.classList.contains('u-collapsed')||e.target.closest('#filters-panel'))return;setCollapsed(true,false);e.preventDefault();e.stopImmediatePropagation()},true);
applyTheme(load('theme')||'original');panel.style.transition='none';mask.style.transition='none';setCollapsed(load('collapsed')!=='0',false);setCorner(load('corner')||'bl');layout();if(current.searchParams.get('themes')==='1'){setCollapsed(false,false);toggleFly('themes')}window.addEventListener('resize',layout);


})();
