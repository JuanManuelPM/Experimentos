'use strict';
/* Campus personal 04. Funciona sin cuentas, servicios externos ni telemetría. */
const $ = id => document.getElementById(id);
const course = {
  title: 'Modelos y Teorías II',
  subtitle: 'Psicología Genética y Cognitiva',
  program: 'Psicología · Segundo año',
  source: 'Demo local sin material privado',
  // El enlace requiere los permisos normales de Drive; no se solicita token ni se consulta desde la app.
  drive: '#'
};
const STORE = 'campus-reader-04-v1:';
let allDocs = []; let activeDoc = null; let currentView = 'home'; let db = null;
let voiceTask = null; let lastSpokenBlock = -1; let notesOpen = false; let toastTimer;
const storage = {
  get(key, fallback) { try { const v = localStorage.getItem(STORE + key); return v == null ? fallback : JSON.parse(v); } catch (_) { return fallback; } },
  set(key, data) { try { localStorage.setItem(STORE + key, JSON.stringify(data)); return true; } catch (_) { inform('No se pudo guardar. Revisá el espacio o permisos del navegador.'); return false; } }
};
function text(tag, content, cls = '') { const el = document.createElement(tag); el.textContent = content; if (cls) el.className = cls; return el; }
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) { if (k === 'className') node.className = v; else if(k === 'textContent') node.textContent = v; else node.setAttribute(k, String(v)); }
  for (const child of children) node.append(child);
  return node;
}
function action(label, fn, cls = '', attrs = {}) { const b = el('button', {type:'button', className:cls,...attrs}, [document.createTextNode(label)]); b.addEventListener('click',fn); return b; }
function clear(node) { node.replaceChildren(); return node; }
function inform(msg) { const box = $('toast'); box.textContent = msg; box.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>box.classList.remove('show'),3800); }
function hash(str) { let n=2166136261; for(let i=0;i<str.length;i++){n^=str.charCodeAt(i);n=Math.imul(n,16777619)}return (n>>>0).toString(36); }
function safeSections(src){
  let parts=String(src).replace(/\r\n?/g,'\n').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean), out=[];
  for(let part of parts) {
    if (part.length<110 && /^#{1,5}\s/.test(part)) {out.push({type:'heading',text:part.replace(/^#{1,5}\s*/, '')});continue;}
    if(part.length<90 && part.indexOf('\n')===-1 && /^(?:unidad|m[oó]dulo|cap[ií]tulo|tema)\s*[0-9ivx]+\b/i.test(part)){out.push({type:'heading',text:part});continue;}
    const lines=part.split('\n'); for(let i=0;i<lines.length;i++)lines[i]=lines[i].replace(/^#{1,5}\s+/, '');
    // Textos gigantes se dividen sin alterar palabras, para reanudar y generar voz estable.
    const combined=lines.join(' ').replace(/\s+/g,' ').trim();
    let remaining=combined;
    while(remaining.length>1400){let stop=remaining.lastIndexOf('. ',1300);if(stop<500)stop=remaining.lastIndexOf(' ',1300);if(stop<500)stop=1300;out.push({type:'paragraph',text:remaining.slice(0,stop+1).trim()});remaining=remaining.slice(stop+1).trim();}
    if(remaining)out.push({type:'paragraph',text:remaining});
  }
  return out;
}
async function openDB() { return new Promise(resolve=>{ if(!('indexedDB' in window)){resolve(null);return;}let req;try{req=indexedDB.open('campus-reader-04',1);}catch(_){resolve(null);return;}req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('documents'))req.result.createObjectStore('documents',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);});}
async function getDocs(){if(!db)return [];return new Promise(resolve=>{try{const tx=db.transaction('documents','readonly');const req=tx.objectStore('documents').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>resolve([]);}catch(_){resolve([]);}});}
async function putDoc(doc){if(!db)throw Error('Este navegador no ofrece almacenamiento local para documentos.');return new Promise((resolve,reject)=>{try{const tx=db.transaction('documents','readwrite');tx.objectStore('documents').put(doc);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||Error('Error al guardar'));tx.onabort=()=>reject(tx.error||Error('Guardado interrumpido'));}catch(e){reject(e);}});}
function availableDocs(){return [...allDocs].sort((a,b)=>(a.order??99)-(b.order??99)||a.title.localeCompare(b.title));}
function getProgress(id){return storage.get('progress:'+id,{block:0,ratio:0,percent:0});}
function getBookmarks(id){return storage.get('marks:'+id,[]);}
function getNotes(id){return storage.get('notes:'+id,[]);}
function closeMobile(){ $('sidebar').classList.remove('open'); }
function setHash(view,id){const value=view==='reader'&&id?'#read='+encodeURIComponent(id):view==='shelf'?'#materia':'#inicio';if(location.hash!==value)history.pushState({view,id},'',value);}
function route(view,id,fromHistory=false){
  stopVoice();currentView=view;activeDoc=view==='reader'?allDocs.find(d=>d.id===id)||null:null;closeMobile();
  if(view==='reader'&&!activeDoc){view='shelf';currentView='shelf';}
  if(!fromHistory)setHash(view,id);
  $('main').replaceChildren();
  if(view==='home') renderHome(); else if(view==='shelf') renderShelf(); else renderReader();
  renderSidebar();
  if(view!=='reader')window.scrollTo(0,0);
  $('main').focus({preventScroll:true});
}
function routeFromHash(){const raw=location.hash;if(raw.startsWith('#read=')) route('reader',decodeURIComponent(raw.slice(6)),true);else if(raw==='#materia')route('shelf',null,true);else route('home',null,true);}
function renderSidebar(){
  const list=clear($('docList'));$('docCount').textContent=allDocs.length;
  for(const doc of availableDocs()){const b=action(doc.title,()=>route('reader',doc.id),'doc-item'+(activeDoc?.id===doc.id?' active':''));b.prepend(text('span','', 'doc-dot'));list.append(b);}
  if(!allDocs.length)list.append(text('p','Sin textos incorporados.','helper'));
}
function renderHome(){
 const main=$('main'), wrap=el('section',{className:'landing'}), head=el('div',{className:'intro'});
 const left=el('div');left.append(text('div','ARCHIVO DE APRENDIZAJE','kicker'),text('h1','Volvé a lo que estabas leyendo.'));
 head.append(left,text('p','Una materia real, tus documentos y un lugar tranquilo para concentrarte. Nada se envía a un servidor.','intro-note'));
 const row=el('div',{className:'course-row'});row.append(text('span','01','course-index'));
 const info=el('div',{className:'course-info'});info.append(text('h2',course.title),text('p',course.subtitle+' · '+course.program),text('p',allDocs.length+' documentos disponibles · Continuidad en este dispositivo'));
 row.append(info,action('→',()=>route('shelf'), 'round-go',{'aria-label':'Entrar en Modelos y Teorías II'}));
 const notice=el('div',{className:'note-band'});notice.append(text('strong','PRIVACIDAD'),text('span','Este archivo personal no representa un campus oficial. El material de estudio permanece en Drive o dentro de tu navegador.'));
 wrap.append(head,row,notice);main.append(wrap);
}
function renderShelf(){
 const main=$('main'), wrap=el('section',{className:'shelf'});wrap.append(action('← Volver a materias',()=>route('home'),'back-link'));
 const head=el('div',{className:'shelf-head'}), intro=el('div');intro.append(text('div','SEGUNDO AÑO / PSICOLOGÍA','kicker'),text('h1',course.title),text('p',course.subtitle));head.append(intro,text('span',allDocs.length+' TEXTOS','shelf-count'));wrap.append(head);
 if(!allDocs.length){const empty=el('div',{className:'reader-empty'});empty.append(text('h2','Todavía no hay lecturas en este dispositivo.'),text('p','Abrí la carpeta privada de la materia o incorporá un archivo de texto. No se publica ni se sincroniza automáticamente.'));wrap.append(empty);}
 for(let i=0;i<availableDocs().length;i++){
  const doc=availableDocs()[i], row=el('div',{className:'reading-item'});row.append(text('span',String(i+1).padStart(2,'0'),'reading-num'));
  const body=el('div',{className:'reading-title'}),p=getProgress(doc.id);body.append(text('h2',doc.title),text('small',doc.source==='local'?'Archivo personal en este dispositivo':'Material autorizado incluido solo en esta copia'),text('small',' · '+(p.percent||0)+'% leído'));row.append(body,action(p.percent?'Continuar →':'Leer →',()=>route('reader',doc.id),'reading-action'));wrap.append(row);
 }
 const tools=el('div',{className:'shelf-tools'});tools.append(action('＋ Incorporar .txt o .md',()=>$('fileInput').click(),'button-dark'));
 const link=el('a',{href:course.drive,target:'_blank',rel:'noopener noreferrer',className:'button-quiet',textContent:'Abrir carpeta privada ↗'});tools.append(link);wrap.append(tools,text('p','Importá un .txt o .md exportado desde tus archivos. La app no accede a Drive ni pide credenciales. No se admiten PDF directamente en esta versión.','small-foot'));main.append(wrap);
}
function getCurrentBlock(){
 const blocks=[...document.querySelectorAll('.reader-block[data-block]')];if(!blocks.length)return 0;
 const threshold=window.innerHeight*.28+100;let n=0;
 for(let i=0;i<blocks.length;i++){if(blocks[i].getBoundingClientRect().top<=threshold)n=i;else break;}
 return n;
}
function savePosition(){
 if(currentView!=='reader'||!activeDoc)return;
 const blocks=[...document.querySelectorAll('.reader-block[data-block]')];if(!blocks.length)return;
 const i=getCurrentBlock(), box=blocks[i].getBoundingClientRect();const line=Math.min(1,Math.max(0,(window.innerHeight*.28+100-box.top)/Math.max(box.height,1)));
 const last=blocks[blocks.length-1].getBoundingClientRect(), total=document.documentElement.scrollHeight-window.innerHeight;
 const percent=last.bottom<window.innerHeight*.85?100:Math.min(99,Math.max(0,Math.round((window.scrollY/Math.max(total,1))*100)));
 storage.set('progress:'+activeDoc.id,{block:i,ratio:line,percent});const b=$('progressFill');if(b)b.style.width=percent+'%';const n=$('progressNum');if(n)n.textContent=percent+'%';
}
let scrollTimer=0;window.addEventListener('scroll',()=>{if(currentView==='reader'){clearTimeout(scrollTimer);scrollTimer=setTimeout(savePosition,140);}}, {passive:true});
function restorePosition(){const doc=activeDoc;if(!doc)return;const p=getProgress(doc.id);if(!p.percent && !p.block && !p.ratio){window.scrollTo(0,0);return;}requestAnimationFrame(()=>requestAnimationFrame(()=>{if(activeDoc?.id!==doc.id)return;const target=document.querySelector('.reader-block[data-block="'+Math.min(p.block,doc.sections.length-1)+'"]');if(!target)return;const top=target.getBoundingClientRect().top+window.scrollY-window.innerHeight*.28-100+target.offsetHeight*(p.ratio||0);window.scrollTo({top:Math.max(0,top),behavior:'instant'});}));}
function renderReader(){
 const doc=activeDoc,wrap=el('article',{className:'reader'}),nav=el('div',{className:'reader-tools'});
 nav.append(action('← Materia',()=>route('shelf')));
 const current=()=>getCurrentBlock();
 nav.append(action('☆ Marcar',()=>toggleMark(current()),'',{id:'markButton',title:'Marcar el párrafo actual'}));
 const citeButton=action('Citar selección',()=>captureSelection(),'',{title:'Seleccioná texto y guardá una nota'});citeButton.addEventListener('pointerdown',e=>e.preventDefault());nav.append(citeButton);
 nav.append(action('Notas',()=>{notesOpen=!notesOpen;renderNotes();if(notesOpen)$('notesSection')?.scrollIntoView({block:'nearest'});},'',{id:'notesToggle'}));
 nav.append(el('span',{className:'spacer'}));
 nav.append(action('−',()=>changeFont(-1),'',{'aria-label':'Reducir tamaño de texto'}));
 nav.append(action('A+',()=>changeFont(1),'',{'aria-label':'Aumentar tamaño de texto'}));
 nav.append(action('▶ Escuchar',()=>toggleVoice(),' ',{id:'voiceButton'}));
 const voice=el('select',{id:'voiceChoice',className:'voice-choice','aria-label':'Elegir voz de lectura'});nav.append(voice);
 const rate=el('select',{id:'rateChoice','aria-label':'Velocidad de lectura'});for(let i of [0.8,1,1.15,1.35])rate.append(el('option',{value:i,textContent:i+'×'}));rate.value=String(storage.get('rate',1));rate.addEventListener('change',()=>{storage.set('rate',Number(rate.value));if(voiceTask)startVoice(lastSpokenBlock>=0?lastSpokenBlock:current());});nav.append(rate);
 wrap.append(nav,el('div',{className:'reader-progress'},[el('span',{id:'progressFill'})]));
 const page=el('div',{className:'reading-page'});page.append(text('div','CAMPUS / '+course.title.toUpperCase(),'reader-eyebrow'),text('h1',doc.title),text('div',doc.source==='local'?'Archivo importado · Solo en este navegador':'Texto de estudio incluido solo en tu copia privada','byline'));
 for(let i=0;i<doc.sections.length;i++){let section=doc.sections[i];const p=text(section.type==='heading'?'h2':'p',section.text,'reader-block'+(section.type==='heading'?' heading':''));p.dataset.block=String(i);if(getBookmarks(doc.id).includes(i))p.dataset.marked='true';p.addEventListener('dblclick',()=>toggleMark(i));page.append(p);}
 const end=el('div',{className:'end-note'});end.append(text('strong','FIN DEL DOCUMENTO'),text('p','Tu posición y marcadores se guardan automáticamente en este dispositivo. El porcentaje indica recorrido visual, no comprensión.'));
 end.append(el('div',{className:'footer-reader'},[action('← Volver a documentos',()=>route('shelf'),'button-quiet'),action('Volver al principio ↑',()=>{window.scrollTo({top:0,behavior:'smooth'});},'button-quiet')]));
 page.append(end);const notes=el('section',{id:'notesSection',className:'notes-drawer'});page.append(notes);wrap.append(page);$('main').append(wrap);
 const size=storage.get('font',21);document.documentElement.style.setProperty('--reading',size+'px');fillVoices();renderNotes();restorePosition();
}
function changeFont(delta){const v=Math.min(30,Math.max(16,storage.get('font',21)+delta));storage.set('font',v);document.documentElement.style.setProperty('--reading',v+'px');inform('Texto: '+v+' px');savePosition();}
function toggleMark(index){if(!activeDoc)return;let marks=getBookmarks(activeDoc.id);marks=marks.includes(index)?marks.filter(x=>x!==index):[...marks,index].sort((a,b)=>a-b);storage.set('marks:'+activeDoc.id,marks);for(let block of document.querySelectorAll('.reader-block[data-block]')){if(marks.includes(+block.dataset.block))block.dataset.marked='true';else delete block.dataset.marked;}inform(marks.includes(index)?'Pasaje marcado':'Marcador quitado');}
let selectedQuote=null;
function captureSelection(){if(!activeDoc)return;const s=window.getSelection();const raw=s?.toString().trim();if(!raw){inform('Seleccioná una frase dentro del texto para citarla.');return;}if(raw.length>2200){inform('Elegí una selección más breve (máximo 2200 caracteres).');return;}
 const asElement=n=>n?.nodeType===1?n:n?.parentElement;const anchor=asElement(s.anchorNode)?.closest?.('.reader-block[data-block]');const focus=asElement(s.focusNode)?.closest?.('.reader-block[data-block]');if(!anchor||!focus){inform('La cita debe pertenecer al documento.');return;}
 selectedQuote={text:raw,block:+anchor.dataset.block};$('quotePreview').textContent=raw;$('noteText').value='';$('noteDialog').showModal();}
function renderNotes(){const target=$('notesSection');if(!target||!activeDoc)return;clear(target);if(!notesOpen){target.hidden=true;return;}target.hidden=false;
 target.append(text('h2','Mis notas y marcadores'));
 const marks=getBookmarks(activeDoc.id);if(marks.length){target.append(text('div',marks.length+' marcadores','helper'));for(const m of marks){const b=action('★ '+(activeDoc.sections[m]?.text||'Pasaje').slice(0,90),()=>jump(m),'button-simple');b.style.margin='6px 0';target.append(b);}}
 const notes=getNotes(activeDoc.id);if(!notes.length&&!marks.length)target.append(text('p','Seleccioná una frase y elegí “Citar selección”, o marcá un pasaje.','helper'));
 for(const item of notes){const c=el('div',{className:'note-card'});c.append(text('small',new Date(item.ts).toLocaleDateString('es-AR')),text('blockquote',item.quote),text('p',item.note||''));c.append(action('Ir al pasaje',()=>jump(item.block),'button-quiet'),document.createTextNode('  '),action('Eliminar nota',()=>{storage.set('notes:'+activeDoc.id,notes.filter(x=>x.id!==item.id));renderNotes();}));target.append(c);}
 target.append(action('Exportar mis notas .json',exportNotes,'button-quiet'));}
function jump(block){const target=document.querySelector('.reader-block[data-block="'+block+'"]');if(target){window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-210,behavior:'smooth'});savePosition();}}
function exportNotes(){if(!activeDoc)return;const out={schema:'campus-notes-v1',document_title:activeDoc.title,document_id:activeDoc.id,notes:getNotes(activeDoc.id),marks:getBookmarks(activeDoc.id),progress:getProgress(activeDoc.id)};downloadText('notas-'+activeDoc.id+'.json',JSON.stringify(out,null,2),'application/json');}
function downloadText(name,content,type){const url=URL.createObjectURL(new Blob([content],{type:type+';charset=utf-8'}));const a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function splitSpeech(textValue){const str=textValue.trim(), out=[];let rest=str;while(rest.length>235){let end=Math.max(rest.lastIndexOf('. ',220),rest.lastIndexOf('; ',220),rest.lastIndexOf(' ',220));if(end<80)end=220;out.push(rest.slice(0,end+1).trim());rest=rest.slice(end+1).trim();}if(rest)out.push(rest);return out;}
function speechChunks(doc,from){const chunks=[];for(let i=Math.max(0,from);i<doc.sections.length;i++){const section=doc.sections[i];for(const value of splitSpeech(section.text))chunks.push({block:i,text:value});}return chunks;}
function fillVoices(){const select=$('voiceChoice');if(!select)return;clear(select);if(!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){select.append(el('option',{textContent:'Sin voz'}));return;}
 const voices=speechSynthesis.getVoices().filter(v=>v.lang?.toLowerCase().startsWith('es'));if(!voices.length){select.append(el('option',{textContent:'Voz automática',value:''}));return;}
 for(const v of voices){select.append(el('option',{value:v.voiceURI,textContent:v.name+' · '+v.lang}));}const saved=storage.get('voice','');if(voices.some(v=>v.voiceURI===saved))select.value=saved;else select.value=voices.find(v=>v.lang?.toLowerCase()==='es-ar')?.voiceURI||voices[0].voiceURI;
 select.addEventListener('change',()=>{storage.set('voice',select.value);if(voiceTask)startVoice(lastSpokenBlock>=0?lastSpokenBlock:getCurrentBlock());},{once:true});
}
if('speechSynthesis' in window)speechSynthesis.addEventListener('voiceschanged',fillVoices);
function updateVoiceLabel(label){const button=$('voiceButton');if(button)button.textContent=label;}
function stopVoice(){if(voiceTask){voiceTask.stopped=true;voiceTask=null;}try{window.speechSynthesis?.cancel();}catch(_){}document.querySelectorAll('.active-voice').forEach(x=>x.classList.remove('active-voice'));updateVoiceLabel('▶ Escuchar');}
function startVoice(block){stopVoice();if(!activeDoc||!('speechSynthesis' in window)||!('SpeechSynthesisUtterance' in window)){inform('Este navegador no ofrece lectura por voz.');return;}
 const doc=activeDoc,chunks=speechChunks(doc,block);if(!chunks.length){inform('Este texto no tiene más tramos para leer.');return;}
 const task={stopped:false,paused:false,started:false,chunks,index:0,docId:doc.id};voiceTask=task;
 function next(){if(task.stopped||voiceTask!==task||currentView!=='reader'||activeDoc?.id!==task.docId)return;const part=task.chunks[task.index];if(!part){stopVoice();inform('Lectura completada.');return;}
  const utterance=new SpeechSynthesisUtterance(part.text);utterance.lang='es-AR';utterance.rate=Number($('rateChoice')?.value||1);
  const voiceURI=$('voiceChoice')?.value;const chosen=speechSynthesis.getVoices().find(v=>v.voiceURI===voiceURI);if(chosen)utterance.voice=chosen;
  utterance.onstart=()=>{if(task.stopped)return;task.started=true;lastSpokenBlock=part.block;updateVoiceLabel('Ⅱ Pausar');for(let el of document.querySelectorAll('.active-voice'))el.classList.remove('active-voice');const target=document.querySelector('.reader-block[data-block="'+part.block+'"]');target?.classList.add('active-voice');};
  utterance.onend=()=>{if(task.stopped)return;task.index++;next();};
  utterance.onerror=e=>{if(task.stopped)return;stopVoice();inform('La voz falló ('+(e.error||'error desconocido')+'). Podés seguir leyendo en pantalla.');};
  try{speechSynthesis.speak(utterance);}catch(_){stopVoice();inform('La lectura por voz no pudo iniciarse.');}
 }
 next();updateVoiceLabel('◌ Iniciando…');
}
function toggleVoice(){if(!voiceTask){startVoice(getCurrentBlock());return;}if(voiceTask.paused){try{speechSynthesis.resume();voiceTask.paused=false;updateVoiceLabel('Ⅱ Pausar');}catch(_){stopVoice();}}else{try{speechSynthesis.pause();voiceTask.paused=true;updateVoiceLabel('▶ Seguir');}catch(_){stopVoice();}}}
async function importFile(file){if(!file)return;if(file.size>2*1024*1024){inform('Archivo demasiado grande. Máximo 2 MB en formato .txt o .md.');return;}if(!/\.(txt|md)$/i.test(file.name)){inform('Solo se admiten archivos de texto .txt o .md.');return;}
 const content=await file.text();if(!content.trim()){inform('El archivo está vacío.');return;}const sections=safeSections(content);if(!sections.length){inform('No se encontró texto legible.');return;}
 const title=file.name.replace(/\.(txt|md)$/i,'').slice(0,130),id='import-'+hash(content);
 const doc={id,title,source:'local',order:100,sections};
 try{await putDoc(doc);allDocs=availableDocs().filter(d=>d.id!==id).concat(doc);renderSidebar();route('reader',id);inform('Texto incorporado. Solo se guarda en este navegador.');}catch(e){inform('No se pudo conservar el archivo: '+e.message);}
}
$('fileInput').addEventListener('change',async e=>{try{await importFile(e.target.files?.[0]);}finally{e.target.value='';}});
$('goCampus').addEventListener('click',()=>route('home'));
$('goShelf').addEventListener('click',()=>{if(window.innerWidth<=760)$('sidebar').classList.toggle('open');else route('shelf');});
$('sidebarCampus').addEventListener('click',()=>route('home'));
$('closeSidebar').addEventListener('click',closeMobile);
$('importSidebar').addEventListener('click',()=>$('fileInput').click());
$('noteForm').addEventListener('submit',e=>{if(e.submitter?.value!=='save'||!activeDoc||!selectedQuote)return;const notes=getNotes(activeDoc.id);notes.push({id:'note-'+Date.now()+'-'+hash(selectedQuote.text),ts:new Date().toISOString(),quote:selectedQuote.text.slice(0,2200),block:selectedQuote.block,note:$('noteText').value});storage.set('notes:'+activeDoc.id,notes);selectedQuote=null;inform('Nota guardada');renderNotes();});
window.addEventListener('popstate',routeFromHash);
window.addEventListener('hashchange',routeFromHash);
window.addEventListener('pagehide',()=>{savePosition();stopVoice();});
window.addEventListener('visibilitychange',()=>{if(document.hidden&&voiceTask){try{speechSynthesis.pause();voiceTask.paused=true;updateVoiceLabel('▶ Seguir');}catch(_){}}});
(async()=>{db=await openDB();const fromDB=await getDocs();const provided=Array.isArray(window.CAMPUS_LOCAL_MATERIAL)?window.CAMPUS_LOCAL_MATERIAL:[];
 const trustworthy=provided.filter(d=>typeof d.title==='string'&&Array.isArray(d.sections)).map(d=>({id:String(d.id),title:d.title,source:'private-bundle',order:0,sections:d.sections.filter(s=>s&&typeof s.text==='string'&&['paragraph','heading'].includes(s.type))}));
 allDocs=trustworthy.concat(fromDB.filter(d=>!trustworthy.some(x=>x.id===d.id)));routeFromHash();})();
