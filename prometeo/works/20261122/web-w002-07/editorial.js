/* CONTRAPUNTO · Biblioteca editorial: búsqueda y pestañas accesibles. Sin dependencias. */
'use strict';
function normalizeEditorialText(value){return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
function filterArchive(root, query, category){
  const entries=[...root.querySelectorAll('[data-article]')];
  const needle=normalizeEditorialText(query.trim());let visible=0;
  for(const entry of entries){
    const haystack=normalizeEditorialText(entry.dataset.search||entry.textContent);
    const matchText=haystack.includes(needle);
    const matchCategory=category==='Todos'||entry.dataset.topic===category;
    entry.hidden=!(matchText&&matchCategory);
    if(!entry.hidden)visible++;
  }
  const count=root.querySelector('#filter-count');
  if(count)count.textContent=visible+' '+(visible===1?'publicación':'publicaciones');
  const empty=root.querySelector('#no-results');if(empty)empty.hidden=visible!==0;
  return visible;
}
function createArchiveSearch(root){
  const input=root.querySelector('#search-articles');if(!input)return;
  const buttons=[...root.querySelectorAll('[data-filter]')];
  const url=new URL(location.href);
  let category=['Todos','Ideas','Oficios','Visual','Ciudad'].includes(url.searchParams.get('tema'))?url.searchParams.get('tema'):'Todos';
  input.value=url.searchParams.get('q')||'';
  function apply(updateHistory=true){
    buttons.forEach(btn=>{const active=btn.dataset.filter===category;btn.setAttribute('aria-pressed',String(active));btn.classList.toggle('is-active',active)});
    filterArchive(root,input.value,category);
    if(updateHistory){const current=new URL(location.href);if(input.value.trim())current.searchParams.set('q',input.value.trim());else current.searchParams.delete('q');if(category!=='Todos')current.searchParams.set('tema',category);else current.searchParams.delete('tema');history.replaceState(null,'',current.pathname+current.search+current.hash)}
  }
  input.addEventListener('input',()=>apply());
  buttons.forEach(btn=>btn.addEventListener('click',()=>{category=btn.dataset.filter;apply()}));
  const clear=root.querySelector('#clear-search');if(clear)clear.addEventListener('click',()=>{input.value='';category='Todos';apply();input.focus()});
  apply(false);
}
function createVisualTabs(root){
  const tabs=[...root.querySelectorAll('[role="tab"][data-frame]')];if(tabs.length===0)return;
  const frames=[
    {image:'../assets/fruta.webp',alt:'Naranjas sobre papel, iluminadas por una ventana',title:'La luz insiste',caption:'Un objeto cotidiano no cambia: cambia el mundo que lo ilumina.'},
    {image:'../assets/tren.webp',alt:'Interior de un vagón vacío al atardecer',title:'El trayecto intermedio',caption:'El vagón guarda el movimiento incluso cuando sus asientos están vacíos.'},
    {image:'../assets/escritura.webp',alt:'Máquina de escribir con hoja en blanco sobre un escritorio',title:'Lo que todavía no se dijo',caption:'La página espera sin exigir que cada silencio se convierta en una frase.'}
  ];
  const image=root.querySelector('#visual-image');const title=root.querySelector('#visual-title');const caption=root.querySelector('#visual-caption');const progress=root.querySelector('#visual-progress');const panel=root.querySelector('#view-panel');
  function select(index,focus=false){if(index<0||index>=frames.length)return;
    const f=frames[index];image.src=f.image;image.alt=f.alt;title.textContent=f.title;caption.textContent=f.caption;
    progress.textContent=`Escena ${index+1} de ${frames.length}`;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1});
    panel.setAttribute('aria-labelledby',tabs[index].id);
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{
    const key=e.key;let next=i;if(key==='ArrowRight')next=(i+1)%tabs.length;else if(key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;else if(key==='Home')next=0;else if(key==='End')next=tabs.length-1;else return;e.preventDefault();select(next,true);
  })});select(0);
}
if(typeof document!=='undefined'){document.addEventListener('DOMContentLoaded',()=>{
  createArchiveSearch(document);createVisualTabs(document);
})}
if(typeof module!=='undefined')module.exports={normalizeEditorialText,filterArchive,createArchiveSearch,createVisualTabs};
