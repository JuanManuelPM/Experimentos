(()=>{'use strict';
const $=s=>document.querySelector(s),root=new URL('../../',location.href);
const path=(s)=>new URL(s,root).href;
const state={all:[],records:new Map(),selected:null,filter:'creations',query:'',tab:'summary',previousFocus:null,meta:{}};
const create=(name,cls,txt)=>{const el=document.createElement(name);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const kindName={world:'Mundo 3D',animation:'Animación',character:'Personaje',object:'Objetos',tool:'Herramienta'};
const kindFromFolder={personajes:'character',escenarios:'world',videos:'animation',herramientas:'tool',pruebas:'animation'};
const safeURL=url=>{try{const u=new URL(url,location.href);return u.protocol==='https:'&&(['juanmanuelpm.github.io','github.com'].includes(u.hostname))?u.href:null}catch{return null}};
function setEmpty(message){const grid=$('#grid');grid.replaceChildren(create('p','empty',message))}
function sort(a,b){return (Date.parse(b.updatedAt)||0)-(Date.parse(a.updatedAt)||0)||a.title.localeCompare(b.title,'es')}
async function read(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
function mergeCollections(existing,collections){
 const out=[...existing],ids=new Set();
 for(const e of Array.isArray(collections)?collections:[]){
  if(!e||typeof e.id!=='string'||!/^([a-z0-9][a-z0-9_-]*\/)*[a-z0-9][a-z0-9_-]*$/.test(e.id)||ids.has(e.id))continue;
  const p=e.publication;if(!p||p.repo!=='JuanManuelPM/Experimentos'||p.ref!=='gh-pages'||p.path!=='prometeo/'+e.id+'/index.html'||p.receiptPath!=='prometeo/'+e.id+'/BUILD_RECEIPT.json'||!(/^[a-f0-9]{40}$/).test(p.pageBlob)||!(/^[a-f0-9]{40}$/).test(p.receiptBlob)||typeof e.title!=='string'||!e.collection||!Array.isArray(e.collection.items)||!(/^[a-f0-9]{40}$/).test(e.snapshotCommit))continue;
  const url=path(e.id+'/'),sourceUrl='https://github.com/'+p.repo+'/blob/'+e.snapshotCommit+'/'+p.receiptPath;
  if(!safeURL(url)||!safeURL(sourceUrl))continue;
  const same=out.findIndex(x=>x.id===e.id);
  if(same>=0&&out[same].url&&out[same].url!==url)continue;
  const row={...e,url,sourceUrl,creation:state.records.get(e.id)||null,thumbnail:null};
  ids.add(e.id);
  if(same>=0)out[same]={...out[same],...row};else if(!out.some(x=>x.url===url))out.push(row);
 }
 return out.sort(sort);
}
async function boot(){
 try{
  const sources=await Promise.allSettled([read(path('project-explorer/projects.json')),read(path('3d-flow/CREATIONS.json')),read('./catalog.json')]);
  const [p,c,m]=sources.map((x,i)=>x.status==='fulfilled'?x.value:(i===0?{projects:[]}:i===1?{records:[]}:{}));
  if(!Array.isArray(p.projects)||!Array.isArray(c.records))throw Error('Registro de proyectos no válido');
  if(sources.every(x=>x.status==='rejected'))throw Error('Fuentes no disponibles');
  state.records=new Map(c.records.map(r=>[r.id,r]));state.meta=m;
  const overrides=m.overrides||{};
  state.all=p.projects.filter(r=>/^[a-z0-9_/-]+$/.test(r.id)&&!r.id.includes('..')&&safeURL(r.url)).map(r=>{
   const extra=overrides[r.id]||{};
   return {...r,kind:extra.kind||kindFromFolder[r.folder]||'animation',status:extra.status||'PUBLICADO · QA VARIABLE',glyph:extra.glyph||'◇',thumbnail:extra.thumbnail||null,creation:state.records.get(r.id)||null};
  }).sort(sort);
  state.all=mergeCollections(state.all,m.collections);
  if(m.candidate&&m.candidate.id){const item=m.candidate;
   if(!state.all.some(x=>x.id===item.id)){state.all.push({...item,glyph:'⌂',creation:state.records.get(item.id)||null});state.all.sort(sort);const latest=$('#latest');latest.hidden=false;$('#latest-title').textContent=item.title;$('#latest-desc').textContent=item.description;$('#latest-open').onclick=()=>open(item);}
  }
  render();if(sources.some(x=>x.status==='rejected'))$('#updated').textContent='Catálogo parcial: una o más fuentes no respondieron. No equivale a ausencia de obras.';discoverReleases();const id=new URL(location.href).searchParams.get('obra');if(id){const candidate=m.candidate?.id===id?m.candidate:null;const p=state.all.find(x=>x.id===id)||candidate;if(p)open(p,false)}
 }catch(err){setEmpty('No se pudo recuperar el catálogo. Abrí la biblioteca clásica mientras se restablece el registro.');$('#updated').replaceChildren(create('a',null,'Biblioteca clásica ↗'));$('#updated').firstChild.href=path('project-explorer/');console.warn('PROMETEO: catálogo no disponible',err)}
}
async function discoverReleases(){
 // Read-only GitHub page discovery; publishing another scene does not require editing UI code.
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6500);
  let response;
  try{response=await fetch('https://api.github.com/repos/JuanManuelPM/Experimentos/git/trees/gh-pages?recursive=1',{signal:controller.signal,cache:'no-store',headers:{Accept:'application/vnd.github+json'}})}
  finally{clearTimeout(timeout)}
  if(!response.ok)return;
  const listing=await response.json();if(!Array.isArray(listing.tree)||listing.truncated)return;
  const known=new Set(state.all.map(p=>p.id));const fresh=[];let promoted=false;
  for(const item of listing.tree){
   if(item.type!=='blob')continue;
   const match=/^prometeo\/([a-z0-9-]+)\/index\.html$/.exec(item.path);
   if(!match)continue;
   const id=match[1];if(['project-explorer','3d-flow','forja','asset-atlas'].includes(id))continue;
   if(known.has(id)){const existing=state.all.find(x=>x.id===id);if(existing&&!existing.url){existing.url=path(id+'/');existing.status='PUBLICADO · QA POR REVISAR';existing.thumbnail=null;$('#latest').hidden=true;promoted=true}continue;}
   known.add(id);
   fresh.push({id,title:id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),description:'Nueva página pública. Revisión artística sin registrar.',kind:'animation',status:'PUBLICADO · SIN QA REGISTRADA',glyph:'▤',url:path(id+'/'),updatedAt:null,creation:state.records.get(id)||null});
  }
  if(!fresh.length&&!promoted)return;
  state.all.push(...fresh);state.all.sort(sort);render();
  $('#updated').textContent='Proyectos nuevos detectados desde GitHub Pages. La falta de QA no es aprobación.';
  if(fresh.some(x=>x.id===state.meta.candidate?.id)||promoted)$('#latest').hidden=true;
 }catch(e){console.info('Detección de nuevas publicaciones no disponible',e)}
}
function render(){
 const filtered=state.all.filter(p=>(state.filter==='all'||state.filter==='creations'&&p.kind!=='tool'||p.kind===state.filter)&&((p.title+' '+(p.description||'')).toLocaleLowerCase('es').includes(state.query)));
 $('#count').textContent=filtered.length+' proyectos';
 const grid=$('#grid');grid.replaceChildren();
 if(!filtered.length){setEmpty('No hay proyectos para ese filtro.');return}
 for(const p of filtered){
  const btn=create('button','card');btn.type='button';btn.dataset.uWorkId=p.id;btn.setAttribute('aria-label','Abrir '+p.title);
  const cover=create('div','cover cover-'+p.kind);
  if(p.thumbnail){const img=create('img');img.src=new URL(p.thumbnail,location.href).href;img.alt='Captura real de '+p.title;img.loading='lazy';img.onerror=()=>{img.remove();cover.append(create('span','cover-note','Sin captura disponible'))};cover.append(img)}
  else{cover.append(create('span','cover-symbol',p.glyph),create('span','cover-note','Abrir proyecto para ver'))}
  cover.append(create('span','cover-index',kindName[p.kind]||'Proyecto'));
  const body=create('div','card-body');body.append(create('div','card-kicker',p.status),create('div','card-title',p.title),create('p','card-desc',p.description||'Proyecto 3D registrado.'));
  const bottom=create('div','card-bottom');bottom.append(create('span',null,'Ver detalles'),create('span','arrow','↗'));body.append(bottom);btn.append(cover,body);btn.onclick=()=>open(p);grid.append(btn)
 }
}
function changeTab(tab){state.tab=tab;document.querySelectorAll('.detail-tabs button').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});renderDetailTab()}
function para(parent,s){parent.append(create('p',null,s))}
function renderDetailTab(){
 const p=state.selected;if(!p)return;const dest=$('#detail-content');dest.replaceChildren();const r=p.creation;
 if(state.tab==='summary'){
  para(dest,p.description||'Proyecto de estudio 3D.');
  if(p.qa)para(dest,p.qa);
  if(p.collection){const ul=create('ul');for(const item of p.collection.items)ul.append(create('li',null,item.title+' · '+item.status));dest.append(ul);const link=create('a',null,'Recibo de esta colección ↗');link.href=safeURL(p.sourceUrl)||'#';link.rel='noopener';dest.append(link);}
  if(p.snapshotCommit)para(dest,'Estado registrado en commit '+p.snapshotCommit.slice(0,9)+'. Los avances pueden ser posteriores.');
  if(p.url)para(dest,p.id==='cocina-umbria-002'?'Vista previa interactiva. La obra final todavía no fue aprobada.':'Visor público. La publicación no implica aprobación artística.');
  else para(dest,'Obra todavía no publicada como resultado final.');
 } else if(state.tab==='issues'){
  const issues=[...(r?.issues||[]),...(r?.pendingDetailed||[])];if(issues.length){const ul=create('ul');issues.forEach(s=>ul.append(create('li',null,s)));dest.append(ul)}
  else if(p.id==='cocina-umbria-002'){para(dest,'Pendientes conocidos: encuadre móvil, continuidad de pies, contacto real con objetos y guardado completo desde FORJA. El recibo de QA sigue siendo candidato.')}
  else para(dest,'No hay errores asociados en el registro del flujo. Esto no certifica que la obra esté libre de problemas.');
 } else{
  if(r?.flowVersionUsed){para(dest,'Producido con el flujo universal v'+r.flowVersionUsed+'.')}
  else if(r?.flowVersionPlanned){para(dest,'Flujo previsto v'+r.flowVersionPlanned+'. No consta una ejecución histórica completa.')}
  else if(p.flowVersion){para(dest,'Flujo anclado v'+p.flowVersion+' en recibo candidato.')}
  else para(dest,'No existe una versión histórica del flujo asignada a esta creación. Conservamos el origen sin inventar una versión.');
  if(r?.attribution)para(dest,'Registro: '+r.attribution.replaceAll('_',' '));
  if(r?.source?.sourceBlob)para(dest,'Blob de fuente: '+r.source.sourceBlob);
 }
}
function setViewer(p){
 const holder=$('#viewer');holder.replaceChildren();
 const url=safeURL(p.url);
 if(url){
  const frame=create('iframe');frame.src=url;frame.title='Obra 3D · '+p.title;
  frame.loading='eager';frame.allow='fullscreen';holder.append(frame);return;
 }
 const empty=create('div','viewer-idle');
 empty.append(create('div','viewer-mark','◇'),create('p',null,'Sin visor publicado'));
 if(p.sourceUrl){const link=create('a',null,'Ver fuente ↗');link.href=safeURL(p.sourceUrl)||'#';link.target='_blank';link.rel='noopener';empty.append(link)}
 holder.append(empty);
}
function open(p,historyEntry=true){
 state.previousFocus=document.activeElement;state.selected=p;state.tab='summary';const context=$('#overlay');context.dataset.uWorkId=p.id;context.dataset.uWorkUrl=p.url||'';context.dataset.uWorkSource=p.sourceUrl||'';
 $('#detail-title').textContent=p.title;$('#compact-title').textContent=p.title;$('#detail-desc').textContent=p.description||'';
 $('#detail-extras').hidden=true;$('#details-toggle').setAttribute('aria-expanded','false');
 $('#detail-meta').textContent=(kindName[p.kind]||'Proyecto')+' · '+(p.status||'REGISTRADO');
 const url=safeURL(p.url);$('#detail-visit').hidden=!url;if(url)$('#detail-visit').href=url;
 const flow=path('3d-flow/?project='+encodeURIComponent(p.id));$('#detail-flow').href=flow;
 setViewer(p);changeTab('summary');$('#overlay').hidden=false;document.body.style.overflow='hidden';
 if(historyEntry){const u=new URL(location.href);u.searchParams.set('obra',p.id);history.pushState({obra:p.id},'',u)}
 $('#close').focus();
}
function close(fromHistory=false){$('#overlay').hidden=true;$('#viewer').replaceChildren();state.selected=null;document.body.style.overflow='';if(!fromHistory){const u=new URL(location.href);u.searchParams.delete('obra');history.replaceState(null,'',u)}state.previousFocus?.focus?.()}
$('#close').onclick=()=>close();$('#detail-close').onclick=()=>close();$('#shade').onclick=()=>close();
$('#details-toggle').onclick=()=>{const p=$('#detail-extras');p.hidden=!p.hidden;$('#details-toggle').setAttribute('aria-expanded',String(!p.hidden))};
$('#filter-toggle').onclick=()=>{const p=$('#filters-panel');p.hidden=!p.hidden;$('#filter-toggle').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)$('#search').focus()};
document.querySelectorAll('.detail-tabs button').forEach(b=>b.addEventListener('click',()=>changeTab(b.dataset.tab)));
document.querySelectorAll('#filters button').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.kind;document.querySelectorAll('#filters button').forEach(x=>{const on=x===b;x.classList.toggle('selected',on);x.setAttribute('aria-pressed',String(on))});render()}));
$('#search').addEventListener('input',e=>{state.query=e.target.value.trim().toLocaleLowerCase('es');render()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#overlay').hidden){e.preventDefault();close()}});
window.addEventListener('popstate',()=>{const id=new URL(location.href).searchParams.get('obra');if(!id){if(!$('#overlay').hidden)close(true)}else{const p=state.all.find(x=>x.id===id)||((state.meta.candidate?.id===id)?state.meta.candidate:null);if(p)open(p,false)}});
boot();
})();