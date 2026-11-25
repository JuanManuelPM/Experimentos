/* V10: navigation and settings are separate; themes only change appearance. */
(()=>{'use strict';
const B=document.body,is3d=B.dataset.library==='3d',rail=document.querySelector('#u-rail'),main=document.querySelector('main');
if(!rail||!main)return;
const current=new URL(location.href);
const themes=[{"id":"original","name":"Original"},{"id":"industrial","name":"Industrial"},{"id":"brutal","name":"Digital Brutalism"},{"id":"shibui","name":"Shibui"},{"id":"rams","name":"Dieter Rams"},{"id":"noir","name":"Tech Noir"},{"id":"monastic","name":"Monastic"},{"id":"swiss","name":"Swiss Editorial"},{"id":"void","name":"Voidcore"},{"id":"mono","name":"Monochrome Rice"}];
const icon={copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',check:'<path d="m5 12 4 4L19 6"/>',nav:'<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2z"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18h1.4a1.8 1.8 0 0 0 1.3-3.1 1.7 1.7 0 0 1 1.2-2.9H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="6.8" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8" r="1" fill="currentColor" stroke="none"/>',back:'<path d="m14 6-6 6 6 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',menu:'<path d="M5 9h14M5 15h14"/>',more:'<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',rotate:'<path d="M9 6.5h9.5v8.5M15 17.5H5.5V9" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/><path d="m14.5 13.5 4 4 4-4zM1.5 10.5l4-4 4 4z" fill="currentColor" stroke="none"/>'};
function btn(key,label,fn){const e=document.createElement('button');e.type='button';e.className='u-icon';e.title=label;e.setAttribute('aria-label',label);e.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+icon[key]+'</svg>';e.onclick=fn;return e}
main.classList.add('u-scroll');
const close=btn('close','Cerrar menú',()=>setCollapsed(true));close.classList.add('u-close');
const open=btn('menu','Abrir menú',()=>setCollapsed(false));open.classList.add('u-open');
const rotate=btn('rotate','Cambiar orientación',()=>{const effective=B.classList.contains('u-portrait')?'portrait':'landscape';desired=effective==='portrait'?'landscape':'portrait';save('orientation',desired);hideFly();layout()});rotate.classList.add('u-rotate');rotate.querySelector('svg').setAttribute('viewBox','0 0 24 24');
close.classList.add('u-anchor');open.classList.add('u-anchor');
const mask=document.createElement('div');mask.className='u-mask';
const panel=document.createElement('div');panel.className='u-panel';panel.id='u-panel';
const track=document.createElement('div');track.className='u-track';
const fly=document.createElement('div');fly.className='u-flyout';fly.id='u-flyout';fly.hidden=true;


const more=btn('more','Opciones',()=>toggleFly('settings'));
const nav=btn('nav','Navegar',()=>toggleFly('navigation'));
more.classList.add('u-more');nav.classList.add('u-navigation');
for(const b of [more,nav]){b.setAttribute('aria-controls','u-flyout');b.setAttribute('aria-expanded','false')}
const settings=document.createElement('div');settings.className='u-settings';
const palette=btn('palette','Temas',()=>showFly('themes'));palette.classList.add('u-palette');
const copy=btn('copy','Copiar contexto de trabajo',()=>copyContext());settings.append(palette,rotate,copy);
const themePane=document.createElement('div');themePane.className='u-theme-pane';
const heading=document.createElement('div');heading.className='u-pane-heading';
const back=btn('back','Volver a opciones',()=>showFly('settings'));const title=document.createElement('h2');title.textContent='Temas';heading.append(back,title);
const themeList=document.createElement('div');themeList.className='u-theme-list';
for(const t of themes){const b=document.createElement('button');b.type='button';b.className='u-theme-choice';b.dataset.themeChoice=t.id;const label=document.createElement('span');label.textContent=t.name;const tick=document.createElement('span');tick.className='u-theme-tick';tick.setAttribute('aria-hidden','true');b.append(label,tick);b.onclick=()=>applyTheme(t.id);themeList.append(b)}
themePane.append(heading,themeList);
const destinations=document.createElement('div');destinations.className='u-destinations';
const base=new URL('../../',current);
const activeStudio=is3d?'3d':(current.searchParams.get('studio')||'3d');
const studies=[['3d','3D'],['web','WebDev'],['music','Música'],['video','Video'],['images','Imágenes']];
for(const [id,label] of studies){const a=document.createElement('a');a.className='u-destination';a.textContent=label;const url=new URL(id==='3d'?'estudios/3d/universal.html':'root/galeria/universal.html',base);url.searchParams.set('v','13');if(id!=='3d')url.searchParams.set('studio',id);a.href=url.href;if(id===activeStudio&&(id!=='3d'||is3d)){a.setAttribute('aria-current','page');a.addEventListener('click',e=>{e.preventDefault();if(workOpen())closeWork();else if(folder)leaveFolder();hideFly()})}destinations.append(a)}
const up=document.createElement('button');up.type='button';up.className='u-destination u-return';up.textContent='Volver a biblioteca';up.onclick=()=>{if(workOpen())closeWork();else if(curatedContext){location.href=folderURL(curatedContext.folder);return}else leaveFolder();hideFly()};destinations.prepend(up);const copyPane=document.createElement('div');copyPane.className='u-copy-pane';const copyText=document.createElement('textarea');copyText.readOnly=true;copyText.setAttribute('aria-label','Contexto para copiar manualmente');copyPane.append(copyText);fly.append(settings,themePane,destinations,copyPane);fly.setAttribute('role','region');
let flyMode=null;
function applyTheme(id){if(!themes.some(t=>t.id===id))id='original';B.dataset.uTheme=id;document.documentElement.dataset.uTheme=id;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(B).getPropertyValue('--u-bg').trim();save('theme',id);for(const b of themeList.children)b.setAttribute('aria-pressed',String(b.dataset.themeChoice===id))}
function showFly(mode){flyMode=mode;fly.dataset.mode=mode;settings.hidden=mode!=='settings';themePane.hidden=mode!=='themes';destinations.hidden=mode!=='navigation';copyPane.hidden=mode!=='copy';up.hidden=!workOpen()&&!folder&&!curatedContext;up.textContent=(workOpen()&&folder)||curatedContext?'Volver a carpeta':'Volver a biblioteca';fly.setAttribute('aria-label',mode==='navigation'?'Navegación':mode==='themes'?'Temas':mode==='copy'?'Copiar contexto':'Opciones');fly.hidden=false;more.setAttribute('aria-expanded',String(mode!=='navigation'));nav.setAttribute('aria-expanded',String(mode==='navigation'));if(mode==='themes')themeList.querySelector('[aria-pressed=true]')?.scrollIntoView({block:'nearest',inline:'nearest'})}
function toggleFly(mode){if(!fly.hidden&&flyMode===mode)hideFly();else showFly(mode)}
function hideFly(){flyMode=null;fly.hidden=true;more.setAttribute('aria-expanded','false');nav.setAttribute('aria-expanded','false')}
panel.append(nav,more);track.append(panel);mask.append(track);rail.append(mask,close,open,fly);
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!fly.hidden){e.stopImmediatePropagation();const target=flyMode==='navigation'?nav:more;hideFly();target.focus();return}if(e.key==='Escape'&&galleryWork){e.preventDefault();closeWork();return}if(e.key==='Escape'&&!B.classList.contains('u-collapsed')&&(!is3d||document.querySelector('#overlay')?.hidden))setCollapsed(true)},true);
main.addEventListener('click',e=>{if(fly.hidden)return;hideFly();e.preventDefault();e.stopImmediatePropagation()},true);



/* Context is derived from registered routes and selected cards, never from guessed titles. */
const ownerByStudio={'3d':'studio-3d',web:'web-design',music:'music-studio',video:'video-studio',images:'image-studio'};
const studioLabel=studies.find(s=>s[0]===activeStudio)?.[1]||activeStudio;
const protocol='https://github.com/JuanManuelPM/pruebas/blob/prometeo/control/PROMETEO/START_HERE.md';
const folderRegistry=new URL('root/shared/v1/library-folders.json',base);
let folder=null, galleryWork=null, galleryShell=null, curatedContext=null; const folderTiles=document.createElement('section');folderTiles.className='u-folder-tiles';folderTiles.hidden=true;main.prepend(folderTiles);
const originalOverlay=document.querySelector('#overlay');
function safeWorkURL(value){if(!value)return null;try{const u=new URL(value,location.href);return u.protocol==='https:'&&!u.username&&!u.password?u:null}catch{return null}}
function embeddable(u){return u.origin===location.origin&&u.pathname.startsWith(base.pathname)&&!/(?:^|\/)universal\.html$/.test(u.pathname)}
function workOpen(){return !!galleryWork||!!(originalOverlay&&!originalOverlay.hidden)}
function closeWork(){if(galleryWork){galleryWork=null;galleryShell.hidden=true;galleryShell.querySelector('iframe')?.remove();const u=new URL(location.href);u.searchParams.delete('resultado');history.replaceState(null,'',u);return}if(originalOverlay&&!originalOverlay.hidden)document.querySelector('#close')?.click()}
function scope(){
 const u=new URL(location.href);if(workOpen())u.searchParams.delete('context');u.searchParams.delete('themes');u.searchParams.delete('refresh');u.searchParams.set('v','13');
 if(!folder)u.searchParams.delete('folder');const c={type:'study',id:activeStudio,title:studioLabel,owner:ownerByStudio[activeStudio],route:u.href};
 if(folder){c.type='folder';c.id=folder.id;c.title=folder.label;c.folder=folder.id;c.owner=folder.owner||c.owner;c.registry=folderRegistry.href;c.memory=folder.memory}if(curatedContext&&!workOpen()){const {folder:f,work:w}=curatedContext;c.type='work';c.id=w.id;c.title=w.title;c.owner=w.owner;c.folder=f.id;c.work=new URL(w.path,base).href;c.source=w.source;c.route=u.href;c.memory=f.memory}
 if(galleryWork){c.type='work';c.id=galleryWork.id;c.title=galleryWork.title;c.work=galleryWork.url;c.folder=folder?.id;c.route=u.href}
 else if(originalOverlay&&!originalOverlay.hidden){c.type='work';c.id=u.searchParams.get('obra')||originalOverlay.dataset.uWorkId||'';c.title=document.querySelector('#detail-title')?.textContent||'Obra 3D';c.work=safeWorkURL(originalOverlay.dataset.uWorkUrl||document.querySelector('#detail-visit')?.href||'')?.href;c.source=safeWorkURL(originalOverlay.dataset.uWorkSource||'')?.href;c.folder=folder?.id}
 const frame=galleryWork?galleryShell?.querySelector('iframe'):originalOverlay?.querySelector('iframe');if(c.type==='work'&&frame){try{const visible=safeWorkURL(frame.contentWindow.location.href);if(visible&&embeddable(visible)&&visible.href!==c.work)c.visible=visible.href}catch{}}return c
}
function buildPrompt(c){const memory=c.memory;return ['PROMETEO · TRABAJAR EN '+({study:'ESTUDIO',folder:'CARPETA',work:'OBRA'}[c.type]),'Recuperá el protocolo vigente: '+protocol,'Ámbito: '+c.title,'Propietario: '+c.owner,'Identidad: '+c.id,'Vista exacta: '+c.route,c.work?'Obra publicada: '+c.work:'',c.source?'Fuente registrada: '+c.source:'',c.visible?'Vista actual dentro de la obra: '+c.visible:'',c.folder?'Carpeta: '+c.folder+' · registro: '+folderRegistry.href:'',memory?'Continuidad de trabajo ('+memory.key+'): '+memory.entry:'',memory?'Antes de actuar, recuperá el historial privado y los pedidos anteriores siguiendo ese contrato. Registrá el nuevo pedido en el inbox exclusivo con la misma clave y vinculá su resultado al cierre; si no tenés acceso, declaralo.':'','Recuperá las fuentes y capacidades del ámbito indicado. Respetá ACTIVE, propiedad, infraestructura privada y PRODUCCIÓN PRIMERO. No modifiques otros ámbitos.','Mi pedido:'].filter(Boolean).join('\n')}
const live=document.createElement('div');live.className='u-copy-feedback';live.setAttribute('role','status');rail.append(live);
let toastTimer;
function notice(msg){live.textContent=msg;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{live.textContent=''},1600)}
async function copyContext(){const q=new URL(location.href).searchParams;if((q.has('folder')&&!folder)||(q.has('context')&&!curatedContext&&!workOpen())){notice('Contexto todavía no disponible');return}const text=buildPrompt(scope());try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);notice('Copiado');hideFly();return}}catch{}copyText.value=text;showFly('copy');copyText.focus();copyText.select();try{if(document.execCommand('copy')){notice('Copiado');hideFly();return}}catch{}notice('Copiá el texto seleccionado')}
function showGalleryWork(card,historyMode=true){
 const u=safeWorkURL(card.href);if(!u)return;
 const id=card.dataset.uWorkId||u.href,title=card.querySelector('b')?.textContent||'Obra';
 galleryWork={id,title,url:u.href};
 if(!galleryShell){galleryShell=document.createElement('section');galleryShell.className='u-work-shell';galleryShell.setAttribute('aria-label','Visor de obra');B.append(galleryShell)}
 galleryShell.replaceChildren();galleryShell.hidden=false;
 if(embeddable(u)){const frame=document.createElement('iframe');frame.src=u.href;frame.title=title;frame.setAttribute('allow',"autoplay; gamepad; fullscreen 'none'");galleryShell.append(frame)}
 else{const fallback=document.createElement('div');fallback.className='u-work-external';const label=document.createElement('p');label.textContent=title;const a=document.createElement('a');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir obra externa ↗';fallback.append(label,a);galleryShell.append(fallback)}
 if(historyMode){const route=new URL(location.href);route.searchParams.set('resultado',id);history.pushState(null,'',route)}hideFly()
}
function restoreGallery(){if(is3d)return;const id=new URL(location.href).searchParams.get('resultado');if(!id){if(galleryWork){galleryWork=null;galleryShell.hidden=true;galleryShell.replaceChildren()}return}if(galleryWork?.id===id)return;const card=Array.from(main.querySelectorAll('a.item[href]')).find(a=>(a.dataset.uWorkId||a.href)===id);if(card)showGalleryWork(card,false)}
if(!is3d){main.addEventListener('click',e=>{const a=e.target.closest('a.item[href]');if(performance.now()<blockClickUntil)return;if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();showGalleryWork(a)},true);window.addEventListener('popstate',restoreGallery);new MutationObserver(restoreGallery).observe(main,{childList:true,subtree:true});restoreGallery()}
if(originalOverlay){document.querySelector('#detail')?.setAttribute('aria-modal','false');new MutationObserver(()=>{if(!originalOverlay.hidden){hideFly();originalOverlay.querySelector('iframe')?.setAttribute('allow',"autoplay; gamepad; fullscreen 'none'")}}).observe(originalOverlay,{attributes:true,attributeFilter:['hidden']});const direct=document.querySelector('#detail-visit');if(direct){direct.target='_blank';direct.rel='noopener noreferrer'}}
// Empty-by-design folder registry. Stable identities from engines, not titles.
function applyFolder(){if(!folder)return;const members=new Set(folder.members);for(const card of main.querySelectorAll('.grid > .card,.grid > .item')){if(card.closest('.u-folder-tiles'))continue;card.classList.toggle('u-outside-folder',!members.has(card.dataset.uWorkId))}}
function leaveFolder(){if(curatedContext){location.href=folderURL(curatedContext.folder);return}folder=null;B.classList.remove('u-folder-view');renderFolderTiles();for(const a of destinations.querySelectorAll('.u-folder-link'))a.removeAttribute('aria-current');const u=new URL(location.href);u.searchParams.delete('folder');history.replaceState(null,'',u);for(const c of main.querySelectorAll('.u-outside-folder'))c.classList.remove('u-outside-folder')}

let registeredFolders=[];
function folderURL(f){const u=new URL(f.studio==='3d'?'estudios/3d/universal.html':'root/galeria/universal.html',base);u.searchParams.set('v','13');if(f.studio!=='3d')u.searchParams.set('studio',f.studio);u.searchParams.set('folder',f.id);return u.href}
function workURL(f,w){const u=new URL(w.path,base);u.searchParams.set('v','13');u.searchParams.set('context',f.studio+'/'+f.id+'/'+w.id);return u.href}
function tile(label,href,id,kind){const a=document.createElement('a');a.className='card u-registry-tile';a.href=href;a.dataset.uWorkId=id;a.dataset.uTileKind=kind;if(kind==='folder'){const mark=document.createElement('span');mark.className='u-folder-mark';mark.setAttribute('aria-hidden','true');mark.innerHTML='<svg viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9V6a3 3 0 0 1 3-3h12l5 5h19a3 3 0 0 1 3 3v3M3 9v25a3 3 0 0 0 3 3h36a3 3 0 0 0 3-3V14a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';a.append(mark);a.setAttribute('aria-label','Carpeta: '+label)}const span=document.createElement('span');span.className='u-tile-label';span.textContent=label;a.append(span);return a}
function renderFolderTiles(){folderTiles.replaceChildren();const grid=document.createElement('div');grid.className='grid';if(folder){for(const w of folder.works||[])grid.append(tile(w.title,workURL(folder,w),w.id,'work'))}else{for(const f of registeredFolders.filter(x=>x.studio===activeStudio))grid.append(tile(f.label,folderURL(f),'folder:'+f.id,'folder'))}folderTiles.append(grid);folderTiles.hidden=!grid.children.length;B.classList.toggle('u-folder-view',!!folder)}
function validFolder(x){return x&&/^[a-z0-9][a-z0-9_-]*$/.test(x.id)&&studies.some(s=>s[0]===x.studio)&&typeof x.label==='string'&&Array.isArray(x.members)&&x.members.every(v=>typeof v==='string')&&(!x.works||Array.isArray(x.works)&&x.works.every(w=>w&&typeof w.id==='string'&&x.members.includes(w.id)&&typeof w.title==='string'&&typeof w.owner==='string'&&typeof w.path==='string'&&w.mode==='direct'&&new URL(w.path,base).origin===location.origin&&new URL(w.path,base).pathname.startsWith(base.pathname)))}
async function loadFolder(){const params=new URL(location.href).searchParams,id=params.get('folder'),context=params.get('context');try{const res=await fetch(folderRegistry.href,{cache:'no-cache'});if(!res.ok)throw Error('registry');const reg=await res.json();registeredFolders=(Array.isArray(reg.folders)?reg.folders:[]).filter(validFolder);for(const f of registeredFolders.filter(x=>x.studio===activeStudio)){const link=document.createElement('a');link.className='u-destination u-folder-link';link.textContent=f.label;link.href=folderURL(f);if(id===f.id)link.setAttribute('aria-current','page');destinations.append(link)}if(context){for(const f of registeredFolders){const w=f.works?.find(w=>context===f.studio+'/'+f.id+'/'+w.id&&new URL(w.path,base).pathname===location.pathname);if(w){curatedContext={folder:f,work:w};break}}}if(id){folder=registeredFolders.find(x=>x.id===id&&x.studio===activeStudio)||null;if(!folder)notice('Carpeta no registrada')}renderFolderTiles();applyFolder()}catch{if(id||context)notice('No se pudo cargar el contexto')}} 
new MutationObserver(applyFolder).observe(main,{childList:true,subtree:true});
// Transformed scroll: map physical finger movement to the rotated content axis.
let pan=null,blockClickUntil=0;
main.addEventListener('pointerdown',e=>{if(!B.classList.contains('u-rotated')||e.pointerType!=='touch'||e.target.closest('input,textarea,select'))return;pan={id:e.pointerId,x:e.clientX,y:e.clientY,start:main.scrollTop,moved:false}});
main.addEventListener('pointermove',e=>{if(!pan||pan.id!==e.pointerId)return;const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(!pan.moved&&Math.hypot(dx,dy)<7)return;if(!pan.moved){pan.moved=true;pan.axis=Math.abs(dx)>=Math.abs(dy)?'x':'y';main.setPointerCapture(e.pointerId)}main.scrollTop=pan.start+(pan.axis==='x'?dx:-dy);e.preventDefault()},{passive:false});
function endPan(e){if(!pan||pan.id!==e.pointerId)return;if(pan.moved)blockClickUntil=performance.now()+350;pan=null}
main.addEventListener('pointerup',endPan);main.addEventListener('pointercancel',endPan);main.addEventListener('lostpointercapture',endPan);
main.addEventListener('click',e=>{if(performance.now()<blockClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
main.addEventListener('wheel',e=>{if(!B.classList.contains('u-rotated'))return;main.scrollTop+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?-e.deltaX:e.deltaY;e.preventDefault()},{passive:false});

/* Real image or one quiet, legible catalog title. No symbols, patterns or overlays. */
function decorateCovers(){
 for(const card of main.querySelectorAll('.grid > .card,.grid > .item')){
  const cover=card.querySelector('.cover,.art');if(!cover)continue;
  const image=cover.querySelector('img'),hasImage=!!image&&!(image.complete&&image.naturalWidth===0);
  if(image&&!image.dataset.u9Watch){image.dataset.u9Watch='1';image.addEventListener('load',queueCovers,{once:true});image.addEventListener('error',queueCovers,{once:true})}
  card.classList.toggle('u-has-image',hasImage);card.classList.toggle('u-no-image',!hasImage);
  const existing=cover.querySelector('.u-catalog-cover');
  if(hasImage){existing?.remove();continue}
  if(existing)continue;
  const title=(card.querySelector('.card-title')?.textContent||card.querySelector('b')?.textContent||card.getAttribute('aria-label')?.replace(/^Abrir\s+/,'')||'Obra').trim();
  const label=document.createElement('div');label.className='u-catalog-cover';label.setAttribute('aria-hidden','true');const text=document.createElement('div');text.className='u-catalog-name';text.textContent=title;label.append(text);cover.append(label);
  card.title=title+' · sin captura registrada';
 }
}
let pending=0;function queueCovers(){if(pending)return;pending=requestAnimationFrame(()=>{pending=0;decorateCovers()})}
new MutationObserver(queueCovers).observe(main,{childList:true,subtree:true});queueCovers();
loadFolder();
applyTheme(load('theme')||'original');panel.style.transition='none';mask.style.transition='none';setCollapsed(load('collapsed')!=='0',false);setCorner(load('corner')||'bl');layout();if(current.searchParams.get('themes')==='1'){setCollapsed(false,false);showFly('themes')}window.addEventListener('resize',layout);
})();
