import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/+esm';

const S='https://catnohyouxqjjtseaueb.supabase.co';
const K='sb_publishable_eqh3PngXs4UjLLWiY3pz1w_nhHtf7X-';
const AUDIO_API=`${S}/functions/v1/casa-room-audio`;
const supabase=createClient(S,K,{auth:{persistSession:false,autoRefreshToken:false}});
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const roomCode=(new URLSearchParams(location.search).get('r')||'clase').replace(/[^a-z0-9_-]/gi,'').slice(0,24)||'clase';
const ROOM=`casa-class-v6-${roomCode}`;
const clientId=sessionStorage.getItem('casa_client_id')||crypto.randomUUID();
sessionStorage.setItem('casa_client_id',clientId);

const composer=$('#composer'),input=$('#messageInput'),send=$('#sendButton'),messages=$('#messages');
const oldPreview=$('#previewPrepared'),oldStatus=$('#draftStatus');
if(oldPreview)oldPreview.classList.add('hidden');
if(oldStatus)oldStatus.classList.add('outboxOldHidden');

const prep=document.createElement('button');
prep.id='prepareButton';prep.className='prepareButton';prep.type='button';prep.textContent='PREP';
prep.title='Preparar sin enviar';prep.setAttribute('aria-label','Preparar sin enviar');
send.before(prep);

const logo=document.querySelector('.logo p');if(logo)logo.textContent='ESCRIBÍ · ENVIÁ · ESCUCHÁ';
if(input)input.placeholder='Escribí un mensaje…';
const empty=$('#emptyState');
if(empty)empty.innerHTML='<b>Silencio por ahora.</b><span>↑ envía cuando la voz esté lista · PREP la deja lista para después.</span>';

const outbox=new Map(),order=[];
let generating=false,txChannel=null,txReady=null,audioCtx=null,audioChain=Promise.resolve();
const introCache=new Map();

function nameNow(){return (localStorage.getItem('casa_name')||'').trim()||'Alguien'}
function avatarNow(){return localStorage.getItem('casa_avatar')||''}
function voiceNow(){return localStorage.getItem('casa_qwen_voice')||'sergeant'}
function introNow(){const c=(localStorage.getItem('casa_intro_custom')||'').replace(/\s+/g,' ').trim().slice(0,36);return c||`${nameNow()} dice`}
function voiceName(id){const m={sergeant:'Sargento fósil',otaku:'Otaku turbo',grandma:'Abuela furiosa',goblin:'Duende nervioso',giant:'Gigante tonto',evilkid:'Nene malvado',apocalypse:'Apocalipsis',novela:'Telenovela',witch:'Bruja seca',gamer:'Gamer 2007',barman:'Viejo de bar',fairy:'Hada tóxica'};return m[id]||'Voz'}
function initials(n){return(String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('')||'?').toUpperCase()}
function avatarMarkup(src,n){return src?`<span class="avatar"><img src="${src}" alt=""></span>`:`<span class="avatar fallback">${esc(initials(n))}</span>`}
function hashText(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function introId(text){return`intro-v2-${hashText(String(text).toLocaleLowerCase('es'))}`}

async function ensureTx(){
 if(txChannel)return txReady;
 txChannel=supabase.channel(`${ROOM}-outbox-${clientId}`,{config:{broadcast:{ack:true}}});
 txReady=new Promise((resolve,reject)=>txChannel.subscribe(s=>{if(s==='SUBSCRIBED')resolve();if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')reject(new Error(s))}));
 return txReady;
}
async function prepareIntro(text){
 const key=String(text||'').replace(/\s+/g,' ').trim().slice(0,36);
 if(!key)return null;if(introCache.has(key))return introCache.get(key);
 const p=(async()=>{const id=introId(key),r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({voice:'relay',text:key,messageId:id})});if(!r.ok)throw 0;return{blob:await r.blob(),url:r.headers.get('x-casa-audio-url')||`${AUDIO_API}?id=${encodeURIComponent(id)}`}})().catch(e=>{introCache.delete(key);throw e});
 introCache.set(key,p);return p;
}
async function playBlob(blob){
 audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
 if(audioCtx.state==='suspended')await audioCtx.resume();
 const ab=await blob.arrayBuffer(),buf=await audioCtx.decodeAudioData(ab.slice(0));
 return new Promise(resolve=>{const s=audioCtx.createBufferSource();s.buffer=buf;s.connect(audioCtx.destination);s.onended=resolve;s.start()});
}
function playPair(item){
 audioChain=audioChain.then(async()=>{try{item.row?.classList.add('speaking');if(item.introBlob)await playBlob(item.introBlob);if(item.blob)await playBlob(item.blob)}catch{}finally{item.row?.classList.remove('speaking')}});
}

function label(item){
 if(item.state==='queued')return'EN COLA';
 if(item.state==='loading')return item.autoSend?'PREPARANDO · SE ENVÍA SOLO':'PREPARANDO · QUEDA LISTO';
 if(item.state==='ready')return'LISTO PARA ENVIAR';
 if(item.state==='sending')return'ENVIANDO';
 if(item.state==='error')return'NO SE PUDO PREPARAR';
 return'';
}
function addAction(w,text,cls,fn,title=''){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=cls;b.title=title;b.onclick=fn;w.append(b)}
function draw(item){
 const row=item.row;if(!row)return;row.dataset.state=item.state;
 row.querySelector('.pendingState').textContent=label(item);
 const a=row.querySelector('.pendingActions');a.innerHTML='';
 if(item.state==='queued'||item.state==='loading')addAction(a,'×','pendingCancel',()=>cancel(item),'Cancelar');
 if(item.state==='ready'){addAction(a,'▶','pendingPreview',()=>playPair(item),'Escuchar');addAction(a,'↑','pendingSend',()=>transmit(item),'Enviar');addAction(a,'×','pendingCancel',()=>cancel(item),'Cancelar')}
 if(item.state==='error'){addAction(a,'REINTENTAR','pendingRetry',()=>retry(item));addAction(a,'×','pendingCancel',()=>cancel(item),'Cancelar')}
}
function makeRow(item){
 $('#emptyState')?.remove();
 const row=document.createElement('article');row.className='message mine pending';row.dataset.mid=item.id;row.dataset.state=item.state;
 row.innerHTML=`<div class="body"><div class="meta"><b>${esc(item.name)}</b><span class="pendingVoice">${esc(voiceName(item.voiceId))}</span></div><div class="bubble pendingBubble"><span>${esc(item.text)}</span><i class="pendingRail"></i></div><div class="pendingFoot"><span class="pendingState"></span><div class="pendingActions"></div></div></div>${avatarMarkup(item.avatar,item.name)}`;
 messages.append(row);item.row=row;draw(item);requestAnimationFrame(()=>messages.scrollTop=messages.scrollHeight);
}
function finishRow(item){
 const row=item.row;if(!row)return;row.classList.remove('pending');row.dataset.state='sent';
 const body=row.querySelector('.body');body.innerHTML=`<div class="meta"><b>${esc(item.name)}</b><button class="replay" type="button">▶ ${esc(voiceName(item.voiceId))}</button></div><div class="bubble">${esc(item.text)}</div>`;
 body.querySelector('.replay').onclick=()=>playPair(item);
}
function updateButtons(){const has=!!input.value.trim();send.disabled=!has;prep.disabled=!has}
function next(){for(const id of order){const x=outbox.get(id);if(x?.state==='queued')return x}return null}
function pump(){if(generating)return;const item=next();if(!item)return;generating=true;process(item).finally(()=>{generating=false;pump()})}

async function process(item){
 if(!outbox.has(item.id)||item.state!=='queued')return;
 item.state='loading';item.controller=new AbortController();draw(item);
 const introP=prepareIntro(item.intro).catch(()=>null);
 try{
  const r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},signal:item.controller.signal,body:JSON.stringify({voice:item.voiceId,text:item.text,messageId:item.id})});
  if(!r.ok)throw 0;const blob=await r.blob();if(!outbox.has(item.id)||item.state==='cancelled')return;
  const intro=await introP;if(!outbox.has(item.id)||item.state==='cancelled')return;
  item.blob=blob;item.audioId=r.headers.get('x-casa-audio-id')||item.id;item.audioUrl=r.headers.get('x-casa-audio-url')||`${AUDIO_API}?id=${encodeURIComponent(item.audioId)}`;item.introBlob=intro?.blob||null;item.introAudioUrl=intro?.url||'';item.controller=null;item.state='ready';draw(item);
  if(item.autoSend)await transmit(item);
 }catch(e){if(item.state==='cancelled'||e?.name==='AbortError')return;item.controller=null;item.state='error';draw(item)}
}
async function transmit(item){
 if(item.state!=='ready')return;item.state='sending';draw(item);
 try{
  await ensureTx();
  const payload={id:item.id,clientId,name:item.name,avatar:item.avatar,intro:item.intro,introAudioUrl:item.introAudioUrl,text:item.text,voiceId:item.voiceId,audioId:item.audioId,audioUrl:item.audioUrl,sentAt:Date.now()};
  await txChannel.send({type:'broadcast',event:'message',payload});
  item.state='sent';finishRow(item);playPair(item);outbox.delete(item.id);
 }catch{item.state='ready';item.autoSend=false;draw(item)}
}
function cancel(item){if(!outbox.has(item.id))return;item.state='cancelled';try{item.controller?.abort()}catch{}item.row?.remove();outbox.delete(item.id);if(!messages.children.length){const d=document.createElement('div');d.className='empty';d.id='emptyState';d.innerHTML='<b>Silencio por ahora.</b><span>↑ envía cuando la voz esté lista · PREP la deja lista para después.</span>';messages.append(d)}}
function retry(item){if(!outbox.has(item.id))return;item.state='queued';draw(item);pump()}
function commit(autoSend){
 const text=input.value.trim().slice(0,180);if(!text)return;
 const item={id:crypto.randomUUID(),name:nameNow(),avatar:avatarNow(),voiceId:voiceNow(),intro:introNow(),text,autoSend,state:'queued',controller:null,row:null,blob:null,introBlob:null,introAudioUrl:'',audioUrl:'',audioId:''};
 input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));outbox.set(item.id,item);order.push(item.id);makeRow(item);input.focus();pump();
}

composer.onsubmit=e=>{e.preventDefault();commit(true)};
prep.onclick=()=>commit(false);
input.addEventListener('input',updateButtons);
updateButtons();
