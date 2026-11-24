
/* Small DOM-only adapter, no catalog or result selection logic. */
(()=>{'use strict';
const B=document.body, is3d=B.dataset.library==='3d', rail=document.querySelector('#u-rail'), main=document.querySelector('main');
if(!rail||!main)return;
const current=new URL(location.href), base=new URL(is3d?'../../':'../../',current);
const from3d=new URL('estudios/3d/universal.html',base).href, fromGallery=new URL('root/galeria/universal.html',base).href;
const icon={
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
})();
