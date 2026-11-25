/* V10: navigation and settings are separate; themes only change appearance. */
(()=>{'use strict';
const B=document.body,is3d=B.dataset.library==='3d',rail=document.querySelector('#u-rail'),main=document.querySelector('main');
if(!rail||!main)return;
const current=new URL(location.href);
const themes=[{"id":"original","name":"Original"},{"id":"industrial","name":"Industrial"},{"id":"brutal","name":"Digital Brutalism"},{"id":"shibui","name":"Shibui"},{"id":"rams","name":"Dieter Rams"},{"id":"noir","name":"Tech Noir"},{"id":"monastic","name":"Monastic"},{"id":"swiss","name":"Swiss Editorial"},{"id":"void","name":"Voidcore"},{"id":"mono","name":"Monochrome Rice"}];
const icon={nav:'<circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.4 5.2-5.2 2.4 2.4-5.2z"/>',palette:'<path d="M12 3a9 9 0 1 0 0 18h1.4a1.8 1.8 0 0 0 1.3-3.1 1.7 1.7 0 0 1 1.2-2.9H18a3 3 0 0 0 3-3c0-5-4-9-9-9Z"/><circle cx="7.5" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="11" cy="6.8" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8" r="1" fill="currentColor" stroke="none"/>',back:'<path d="m14 6-6 6 6 6"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',menu:'<path d="M5 9h14M5 15h14"/>',more:'<circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/>',rotate:'<path d="M9 6.5h9.5v8.5M15 17.5H5.5V9" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/><path d="m14.5 13.5 4 4 4-4zM1.5 10.5l4-4 4 4z" fill="currentColor" stroke="none"/>'};
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
settings.append(palette,rotate);
const themePane=document.createElement('div');themePane.className='u-theme-pane';
const heading=document.createElement('div');heading.className='u-pane-heading';
const back=btn('back','Volver a opciones',()=>showFly('settings'));const title=document.createElement('h2');title.textContent='Temas';heading.append(back,title);
const themeList=document.createElement('div');themeList.className='u-theme-list';
for(const t of themes){const b=document.createElement('button');b.type='button';b.className='u-theme-choice';b.dataset.themeChoice=t.id;const label=document.createElement('span');label.textContent=t.name;const tick=document.createElement('span');tick.className='u-theme-tick';tick.setAttribute('aria-hidden','true');b.append(label,tick);b.onclick=()=>applyTheme(t.id);themeList.append(b)}
themePane.append(heading,themeList);
const destinations=document.createElement('div');destinations.className='u-destinations';
const base=new URL('../../',current);
const activeStudio=is3d?'3d':(current.searchParams.get('studio')||'3d');
const studies=[['3d','3D'],['web','Web'],['music','Música'],['video','Video'],['images','Imágenes']];
for(const [id,label] of studies){const a=document.createElement('a');a.className='u-destination';a.textContent=label;const url=new URL(id==='3d'?'estudios/3d/universal.html':'root/galeria/universal.html',base);url.searchParams.set('v','10');if(id!=='3d')url.searchParams.set('studio',id);a.href=url.href;if(id===activeStudio&&(id!=='3d'||is3d)){a.setAttribute('aria-current','page');a.addEventListener('click',e=>{e.preventDefault();hideFly()})}destinations.append(a)}
fly.append(settings,themePane,destinations);fly.setAttribute('role','region');
let flyMode=null;
function applyTheme(id){if(!themes.some(t=>t.id===id))id='original';B.dataset.uTheme=id;document.documentElement.dataset.uTheme=id;const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(B).getPropertyValue('--u-bg').trim();save('theme',id);for(const b of themeList.children)b.setAttribute('aria-pressed',String(b.dataset.themeChoice===id))}
function showFly(mode){flyMode=mode;fly.dataset.mode=mode;settings.hidden=mode!=='settings';themePane.hidden=mode!=='themes';destinations.hidden=mode!=='navigation';fly.setAttribute('aria-label',mode==='navigation'?'Navegación':mode==='themes'?'Temas':'Opciones');fly.hidden=false;more.setAttribute('aria-expanded',String(mode!=='navigation'));nav.setAttribute('aria-expanded',String(mode==='navigation'));if(mode==='themes')themeList.querySelector('[aria-pressed=true]')?.scrollIntoView({block:'nearest',inline:'nearest'})}
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
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!fly.hidden){const target=flyMode==='navigation'?nav:more;hideFly();target.focus();return}if(e.key==='Escape'&&!B.classList.contains('u-collapsed')&&(!is3d||document.querySelector('#overlay')?.hidden))setCollapsed(true)});
main.addEventListener('click',e=>{if(fly.hidden)return;hideFly();e.preventDefault();e.stopImmediatePropagation()},true);


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
applyTheme(load('theme')||'original');panel.style.transition='none';mask.style.transition='none';setCollapsed(load('collapsed')!=='0',false);setCorner(load('corner')||'bl');layout();if(current.searchParams.get('themes')==='1'){setCollapsed(false,false);showFly('themes')}window.addEventListener('resize',layout);
})();
