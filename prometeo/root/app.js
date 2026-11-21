
(()=>{'use strict';
const $=id=>document.getElementById(id),ROOT=new URL('../../',location.href),manifestCache=[];
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const ctx={sources:null,studios:[],tracks:[],status:new Map(),tab:'launch',viewFilter:'all',reviewTrack:'',shots:new Map(),db:null,dbUnavailable:false};
const titles={'respawn-desk':'Descenso al escritorio','transporte-retro':'Transporte retro','ventilador-explicado':'Ventilador explicado','estacion-servicio-tormenta':'Estación bajo la tormenta','ascensor-retro':'Ascensor entre realidades','entrevista-nocturna':'Entrevista nocturna','reloj-mecanico':'Reloj mecánico','laboratorio-submarino':'Laboratorio submarino','arcade-retro':'Salón arcade retro','cruce-urbano':'Cruce urbano'};
const STAGES=['Sin clasificar','Alcance','Recuperación','Planificación','Recursos','Clasificación','Personajes','Objetos','Escenario','Materiales / FX','Montaje','Orientación','Animación','Cámara','QA preventivo','CALIBRAR','Persistencia','Publicación'];
let previewURLs=new Map();
function safePath(path){return typeof path==='string'&&/^prometeo\/[a-z0-9/_\-.]+\/$/i.test(path)&&!path.includes('..')?new URL(path+'index.html',ROOT).href:null;}
function key(t){return t.wave+'/'+t.series+'/'+t.projectId;}
function studioTitle(series){return({integradores:'Integradores',personajes:'Personajes',videojuegos:'Videojuegos'})[series]||series;}
function title(t){return titles[t.projectId]||t.title||t.projectId;}
function allRows(){return ctx.tracks.flatMap(g=>g.tasks);}
function trackOf(id){return ctx.tracks.find(g=>g.id===id);}
function urlOf(t){return safePath(t.publicPath);}
function launchOf(t){return /^https:\/\/github\.com\/JuanManuelPM\/Experimentos\/blob\/gh-pages\/prometeo\/[a-z0-9/_\-.]+\/\d+$/i.test(t.publicUrl||'')?t.publicUrl:null;}
function prompt(t){const link=launchOf(t);return link?'WORK · Estudio 3D · '+link:null;}
function getStatus(t){return ctx.status.get(key(t))||'checking';}
function humanBatch(g){return g.label+' · '+g.tasks.length+' semillas';}
function statusLabel(s){return s==='ready'?'Publicada':s==='missing'?'Pendiente':s==='unknown'?'Sin confirmar':'Comprobando';}
function createTrackFromManifest(meta,manifest){
 const groups=new Map(),wave=String(manifest.wave||'unknown');
 for(const t of manifest.tasks||[]){if(!t.series||!Number.isInteger(t.number)||t.number<1||t.number>100||!safePath(t.publicPath))continue;
 const grpId=meta.id+'/'+t.series;if(!groups.has(grpId))groups.set(grpId,{id:grpId,label:studioTitle(t.series),wave,family:meta.family,method:manifest.flow?.id||'',flowVersion:manifest.flow?.version||'',flowHash:manifest.flow?.sha256Canonical||'',tasks:[]});
 groups.get(grpId).tasks.push({...t,wave,series:t.series});}
 for(const g of groups.values()){g.tasks.sort((a,b)=>a.number-b.number);ctx.tracks.push(g);}
}
async function getJSON(url){const res=await fetch(url,{cache:'no-store'});if(!res.ok)throw Error('HTTP '+res.status);return res.json();}
async function boot(){
 try{ctx.sources=await getJSON('./SOURCES.json');const jobs=(ctx.sources.registries||[]).filter(x=>x.enabled);
 const rs=await Promise.allSettled(jobs.map(async m=>[m,await getJSON(m.url)]));
 rs.forEach(x=>{if(x.status==='fulfilled')createTrackFromManifest(...x.value);});
 try{const p=await getJSON(ctx.sources.studios);ctx.studios=Array.isArray(p.studios)?p.studios:[];}catch(e){}
 $('summary').textContent=ctx.tracks.reduce((s,g)=>s+g.tasks.length,0)+' producciones catalogadas · '+ctx.tracks.length+' tandas · mismo método por tanda · concurrencia sin cupo artificial';
 renderLaunch();renderView();renderReviewSelector();renderSystem();setTab((new URLSearchParams(location.search).get('vista')||'launch'));scan();
 }catch(e){$('summary').textContent='Sin acceso al registro público en este momento';$('launchers').textContent='No se pudo leer el manifiesto.';console.error(e);}
}
function setTab(s){
 if(!['launch','view','review','system'].includes(s))s='launch';ctx.tab=s;
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===s)));
 for(const k of ['launch','view','review','system'])$('panel-'+k).hidden=k!==s;
 try{history.replaceState({},'',location.pathname+'?vista='+s);}catch(e){}
}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
async function copy(text){
 try{await navigator.clipboard.writeText(text);return true;}catch(e){
 const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();
 let okay=false;try{okay=document.execCommand('copy');}catch(err){}
 area.remove();if(!okay)window.prompt('Copiá este texto:',text);return okay;
}}
function alertCopy(button){const old=button.textContent;button.textContent='Copiado ✓';setTimeout(()=>button.textContent=old,1600);}
function renderLaunch(){
 const root=$('launchers');root.textContent='';
 for(const g of ctx.tracks){
 const panel=document.createElement('section');panel.className='panel';
 const header=document.createElement('div');header.className='track-head';
 const h=document.createElement('h3');h.textContent=studioTitle(g.tasks[0]?.series)+' · '+g.wave;
 const sm=document.createElement('small');sm.textContent=g.method+' · '+g.flowVersion;
 header.append(h,sm);panel.append(header);
 const info=document.createElement('p');info.className='track-note';info.textContent='Diez encargos diferentes. El método se fija al iniciar cada chat; lanzar uno no depende de terminar los otros.';panel.append(info);
 const grid=document.createElement('div');grid.className='launch-grid';
 for(const t of g.tasks){
 const box=document.createElement('div');box.className='launchitem';
 const n=document.createElement('span');n.textContent=String(t.number).padStart(2,'0');
 const titleEl=document.createElement('strong');titleEl.textContent=title(t);
 const b=document.createElement('button');b.type='button';b.textContent='Copiar prompt';b.disabled=!prompt(t);
 b.addEventListener('click',async()=>{if(await copy(prompt(t)))alertCopy(b);});
 box.append(n,titleEl,b);grid.append(box);
 }panel.append(grid);
 const all=document.createElement('button');all.type='button';all.className='copyall';all.textContent='Copiar los '+g.tasks.length+' prompts';all.addEventListener('click',async()=>{if(await copy(g.tasks.map(prompt).filter(Boolean).join('\n\n')))alertCopy(all);});panel.append(all);
 root.append(panel);
 }
 if(!ctx.tracks.length)root.innerHTML='<div class="empty">No hay tandas públicas registradas todavía.</div>';
}
function renderView(){
 const host=$('view-filters');host.innerHTML='';
 const filters=[['all','Todas'],...ctx.tracks.map(g=>[g.id,g.label+' · '+g.wave])];
 for(const [id,label] of filters){const b=document.createElement('button');b.type='button';b.textContent=label;b.className=ctx.viewFilter===id?'active':'';
 b.addEventListener('click',()=>{ctx.viewFilter=id;renderView();});host.append(b);}
 const list=$('results');list.innerHTML='';
 for(const g of ctx.tracks){if(ctx.viewFilter!=='all'&&ctx.viewFilter!==g.id)continue;
 const section=document.createElement('section');section.className='result-group';section.innerHTML='<h3>'+E(g.label)+' · '+E(g.wave)+'</h3>';
 const grid=document.createElement('div');grid.className='result-grid';
 for(const t of g.tasks){
 const s=getStatus(t),url=urlOf(t),item=document.createElement('article');item.className='result';
 item.innerHTML='<div class="result-top"><span class="num">'+String(t.number).padStart(2,'0')+'</span><span class="status '+(s==='ready'?'ready':'')+'">'+statusLabel(s)+'</span></div><strong>'+E(title(t))+'</strong><small>'+E(g.flowVersion)+' · '+E(t.targetVersion||'')+'</small>';
 const actions=document.createElement('div');actions.className='result-actions';
 const b=document.createElement('button');b.type='button';b.className='main';b.textContent='Ver obra';b.disabled=s!=='ready';b.addEventListener('click',()=>openDialog(title(t),url));actions.append(b);
 const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Abrir aparte ↗';actions.append(a);
 const tr=document.createElement('a');tr.href=url.replace(/index\.html$/,'STAGE_TRACE.json');tr.target='_blank';tr.rel='noopener noreferrer';tr.textContent='Traza (si existe) ↗';actions.append(tr);
 item.append(actions);grid.append(item);
 }section.append(grid);list.append(section);}
 if(!list.children.length)list.innerHTML='<div class="empty">No hay resultados registrados con ese filtro.</div>';
}
async function probe(url){if(!url)return'unknown';const c=new AbortController(),timer=setTimeout(()=>c.abort(),8500);try{const r=await fetch(url,{method:'HEAD',cache:'no-store',signal:c.signal});return r.ok?'ready':r.status===404?'missing':'unknown';}catch(e){return'unknown';}finally{clearTimeout(timer);}}
let scanning=false;
async function scan(){
 if(scanning||!ctx.tracks.length)return;scanning=true;$('refresh').disabled=true;
 const tasks=allRows();let cursor=0;
 await Promise.all(Array.from({length:Math.min(6,tasks.length)},async()=>{while(cursor<tasks.length){const t=tasks[cursor++];ctx.status.set(key(t),await probe(urlOf(t)));renderView();}}));
 scanning=false;$('refresh').disabled=false;
}
$('refresh').addEventListener('click',scan);setInterval(()=>{if(!document.hidden)scan();},180000);
function openDialog(name,url){if(!url)return;$('dialog-title').textContent=name;$('dialog-link').href=url;$('dialog-frame').src=url;$('dialog').hidden=false;$('dialog-close').focus();}
function closeDialog(){$('dialog').hidden=true;$('dialog-frame').src='about:blank';}
$('dialog-close').addEventListener('click',closeDialog);document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('dialog').hidden)closeDialog();});
function renderReviewSelector(){
 const sel=$('review-track');sel.textContent='';
 for(const g of ctx.tracks){const option=document.createElement('option');option.value=g.id;option.textContent=g.label+' · ola '+g.wave;sel.append(option);}
 if(ctx.tracks.length){ctx.reviewTrack=ctx.reviewTrack||ctx.tracks[0].id;sel.value=ctx.reviewTrack;renderReview();}
}
$('review-track').addEventListener('change',e=>{ctx.reviewTrack=e.target.value;renderReview();});
function noteKey(t){return 'prometeo-root-rev-v1/'+key(t);}
function readNote(t){try{return JSON.parse(localStorage.getItem(noteKey(t))||'{}');}catch(e){return {};}}
function saveNote(t,field,value){try{const n=readNote(t);n[field]=value;localStorage.setItem(noteKey(t),JSON.stringify(n));}catch(e){console.warn('Local storage disabled');}}
function openDB(){return new Promise((ok,bad)=>{if(!indexedDB)return bad(Error('No indexedDB'));const r=indexedDB.open('prometeo-root-reviews-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos');r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);});}
async function photoGet(k){if(ctx.shots.has(k))return ctx.shots.get(k);try{
 if(!ctx.db&&!ctx.dbUnavailable)ctx.db=await openDB();if(!ctx.db)return null;
 const blob=await new Promise((ok,bad)=>{const req=ctx.db.transaction('photos','readonly').objectStore('photos').get(k);req.onsuccess=()=>ok(req.result||null);req.onerror=()=>bad(req.error);});
 if(blob)ctx.shots.set(k,blob);return blob;
 }catch(e){ctx.dbUnavailable=true;return null;}}
async function photoSet(k,file){
 if(file)ctx.shots.set(k,file);else ctx.shots.delete(k);
 try{if(!ctx.db&&!ctx.dbUnavailable)ctx.db=await openDB();if(!ctx.db)return;await new Promise((ok,bad)=>{const tx=ctx.db.transaction('photos','readwrite');const s=tx.objectStore('photos');file?s.put(file,k):s.delete(k);tx.oncomplete=()=>ok();tx.onerror=()=>bad(tx.error);});}catch(e){ctx.dbUnavailable=true;}
}
async function updatePhotoDisplay(k,img,remove){
 const file=await photoGet(k);if(!img.isConnected)return;
 const old=previewURLs.get(k);if(old)URL.revokeObjectURL(old);
 if(file){const url=URL.createObjectURL(file);previewURLs.set(k,url);img.src=url;img.style.display='inline-block';remove.hidden=false;remove.textContent='Quitar captura';}
 else{img.removeAttribute('src');img.style.display='none';remove.hidden=true;}
}
function renderReview(){
 const g=trackOf(ctx.reviewTrack);const host=$('review-items');host.textContent='';if(!g)return;
 for(const t of g.tasks){
 const item=document.createElement('article');item.className='review-row';
 const head=document.createElement('div');head.className='review-header';head.innerHTML='<strong>'+E(title(t))+'</strong><small>#'+String(t.number).padStart(2,'0')+'</small>';item.append(head);
 const note=readNote(t),area=document.createElement('textarea');area.placeholder='¿Qué no te gustó? ¿Qué esperabas que hiciera mejor el método?';area.setAttribute('aria-label','Crítica de '+title(t));area.value=note.comment||'';area.addEventListener('input',()=>saveNote(t,'comment',area.value));item.append(area);
 const meta=document.createElement('div');meta.className='review-meta';
 const stageLabel=document.createElement('label');stageLabel.textContent='Etapa relacionada: ';
 const stage=document.createElement('select');STAGES.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;stage.append(o);});
 stage.value=STAGES.includes(note.stage)?note.stage:STAGES[0];stage.addEventListener('change',()=>saveNote(t,'stage',stage.value));stageLabel.append(stage);meta.append(stageLabel);
 const lab=document.createElement('label');lab.textContent='Captura: ';const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='image/png,image/jpeg,image/webp';fileInput.setAttribute('aria-label','Captura de '+title(t));lab.append(fileInput);meta.append(lab);
 const img=document.createElement('img');img.className='shot-preview';img.alt='Captura adjunta a '+title(t);meta.append(img);
 const remove=document.createElement('button');remove.type='button';remove.className='remove-shot';remove.hidden=true;meta.append(remove);
 const k=key(t);fileInput.addEventListener('change',async()=>{const f=fileInput.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>20*1024*1024){alert('Usá PNG, JPG o WebP de hasta 20 MB');fileInput.value='';return;}await photoSet(k,f);updatePhotoDisplay(k,img,remove);});
 remove.addEventListener('click',async()=>{await photoSet(k,null);fileInput.value='';updatePhotoDisplay(k,img,remove);});item.append(meta);host.append(item);updatePhotoDisplay(k,img,remove);
 }
}
function crcTable(){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;}
const CRCT=crcTable();
function crc32(a){let c=0xffffffff;for(const b of a)c=CRCT[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
const enc=new TextEncoder();
function w16(view,off,x){view.setUint16(off,x,true);}function w32(view,off,x){view.setUint32(off,x>>>0,true);}
function zipBlob(entries){
 let bytes=[],central=[],offset=0;
 for(const [name,data] of entries){
 const n=enc.encode(name),crc=crc32(data),local=new Uint8Array(30+n.length),h=new DataView(local.buffer);
 w32(h,0,0x04034b50);w16(h,4,20);w16(h,6,0x800);w16(h,8,0);w32(h,14,crc);w32(h,18,data.length);w32(h,22,data.length);w16(h,26,n.length);local.set(n,30);
 const cd=new Uint8Array(46+n.length),ch=new DataView(cd.buffer);
 w32(ch,0,0x02014b50);w16(ch,4,20);w16(ch,6,20);w16(ch,8,0x800);w16(ch,10,0);w32(ch,16,crc);w32(ch,20,data.length);w32(ch,24,data.length);w16(ch,28,n.length);w32(ch,42,offset);cd.set(n,46);
 bytes.push(local,data);central.push(cd);offset+=local.length+data.length;
 }
 const size=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);
 w32(v,0,0x06054b50);w16(v,8,entries.length);w16(v,10,entries.length);w32(v,12,size);w32(v,16,offset);
 return new Blob([...bytes,...central,end],{type:'application/zip'});
}
$('export-review').addEventListener('click',async()=>{
 const g=trackOf(ctx.reviewTrack);if(!g)return;
 const data={schema:'prometeo.root.review/v1',exportedAt:new Date().toISOString(),study:g.family,series:g.label,wave:g.wave,flow:{id:g.method,version:g.flowVersion,sha256Canonical:g.flowHash},feedback:[]},files=[],md=['# Revisión de tanda '+g.label+' · ola '+g.wave,'','Este archivo registra revisión humana para CALIBRAR las reglas del método de las futuras tandas, no para modificar los briefs de producciones existentes.',''];
 for(const t of g.tasks){
 const n=readNote(t),f=await photoGet(key(t)),label=String(t.number).padStart(2,'0');let shot=null;
 if(f){const ext=f.type==='image/png'?'png':f.type==='image/webp'?'webp':'jpg';shot='capturas/'+label+'-'+t.projectId+'.'+ext;files.push([shot,new Uint8Array(await f.arrayBuffer())]);}
 data.feedback.push({number:t.number,projectId:t.projectId,title:title(t),briefSha256:t.briefSha256,previewUrl:urlOf(t),comment:n.comment||'',suggestedStage:n.stage||'Sin clasificar',screenshot:shot});
 md.push('## '+label+' · '+title(t),'',n.comment||'(Sin comentario)','', 'Etapa sugerida: '+(n.stage||'Sin clasificar'),'Captura: '+(shot||'no adjunta'),'');
 }
 files.unshift(['revision.json',enc.encode(JSON.stringify(data,null,2)+'\n')],['RESUMEN.md',enc.encode(md.join('\n'))]);
 const zip=zipBlob(files),url=URL.createObjectURL(zip),a=document.createElement('a');a.href=url;a.download='PROMETEO_ROOT_REVISION_'+g.wave+'_'+g.tasks[0].series+'.zip';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
});
function renderSystem(){
 const root=$('studios');root.textContent='';
 for(const s of ctx.studios){
 const id=String(s.id||'');if(!/^[a-z0-9_-]+$/.test(id))continue;
 const a=document.createElement('a');a.href=new URL('../estudios/'+id+'/',location.href);a.target='_blank';a.rel='noopener noreferrer';
 a.append(document.createTextNode(s.name||id));const span=document.createElement('span');span.textContent='Abrir página ↗';a.append(span);root.append(a);
 }
 if(!root.children.length)root.textContent='No se pudo consultar el catálogo de estudios.';
}
boot();
})();
