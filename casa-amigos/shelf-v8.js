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
const STORE=`room-prepared-v8-${roomCode}`;
const TTL=36*3600*1000;

const VOICE_NAMES={sergeant:'Sargento fósil',otaku:'Otaku turbo',grandma:'Abuela furiosa',goblin:'Duende nervioso',giant:'Gigante tonto',evilkid:'Nene malvado',apocalypse:'Apocalipsis',novela:'Telenovela',witch:'Bruja seca',gamer:'Gamer 2007',barman:'Viejo de bar',fairy:'Hada tóxica'};
const composer=$('#composer'),input=$('#messageInput'),send=$('#sendButton'),messages=$('#messages');
if(!composer||!input||!send||!messages)throw new Error('composer missing');
$('#previewPrepared')?.classList.add('hidden');
$('#draftStatus')?.classList.add('outboxOldHidden');

send.textContent='ENVIAR';
send.title='Enviar mensaje';
send.setAttribute('aria-label','Enviar mensaje');
const prepare=document.createElement('button');
prepare.type='button';prepare.id='prepareButton';prepare.className='prepareButton';prepare.textContent='PREPARAR PARA DESPUÉS';
prepare.title='Preparar y guardar este mensaje sin enviarlo';
send.before(prepare);

const drawer=document.createElement('aside');
drawer.id='preparedShelf';drawer.className='preparedShelf';drawer.setAttribute('aria-label','Mensajes preparados');
drawer.innerHTML=`<div class="shelfHead"><div><b>MENSAJES PREPARADOS</b><span>Se generan una vez. Podés enviarlos todas las veces que quieras.</span></div><button class="shelfClose" type="button">CERRAR</button></div><div class="shelfList" id="shelfList"></div>`;
document.body.append(drawer);
const shelfToggle=document.createElement('button');
shelfToggle.type='button';shelfToggle.id='shelfToggle';shelfToggle.className='shelfToggle';shelfToggle.innerHTML='PREPARADOS <b>0</b>';
shelfToggle.title='Abrir mensajes preparados';
$('#appScreen')?.append(shelfToggle);
drawer.querySelector('.shelfClose').onclick=()=>drawer.classList.remove('open');
shelfToggle.onclick=()=>drawer.classList.toggle('open');

const outbox=new Map();
const generationQueue=[];
const prepared=new Map();
let generating=false,txChannel=null,txReady=null,audioCtx=null,audioChain=Promise.resolve();
const introCache=new Map(),audioCache=new Map();

function nowName(){return(localStorage.getItem('casa_name')||'').trim()||'Alguien'}
function nowAvatar(){return localStorage.getItem('casa_avatar')||''}
function nowVoice(){return localStorage.getItem('casa_qwen_voice')||'sergeant'}
function nowIntro(){const c=(localStorage.getItem('casa_intro_custom')||'').replace(/\s+/g,' ').trim().slice(0,36);return c||`${nowName()} dice`}
function voiceName(id){return VOICE_NAMES[id]||'Voz'}
function initials(n){return(String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('')||'?').toUpperCase()}
function avatarMarkup(src,n){return src?`<span class="avatar"><img src="${src}" alt=""></span>`:`<span class="avatar fallback">${esc(initials(n))}</span>`}
function hashText(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function introId(text){return`intro-v2-${hashText(String(text).toLocaleLowerCase('es'))}`}
function audioUrl(id){return`${AUDIO_API}?id=${encodeURIComponent(id)}`}

async function ensureTx(){
 if(txChannel)return txReady;
 txChannel=supabase.channel(ROOM,{config:{broadcast:{ack:true,self:false}}});
 txReady=new Promise((resolve,reject)=>txChannel.subscribe(s=>{if(s==='SUBSCRIBED')resolve();if(s==='CHANNEL_ERROR'||s==='TIMED_OUT')reject(new Error(s))}));
 return txReady;
}
async function fetchBlob(url){
 if(!url)throw 0;
 if(!audioCache.has(url))audioCache.set(url,fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.blob()}).catch(e=>{audioCache.delete(url);throw e}));
 return audioCache.get(url);
}
async function prepareIntro(text=nowIntro()){
 const key=String(text||'').replace(/\s+/g,' ').trim().slice(0,36);if(!key)return null;
 if(introCache.has(key))return introCache.get(key);
 const p=(async()=>{const id=introId(key),r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({voice:'relay',text:key,messageId:id})});if(!r.ok)throw 0;const blob=await r.blob(),url=r.headers.get('x-casa-audio-url')||audioUrl(id);audioCache.set(url,Promise.resolve(blob));return{blob,url}})().catch(e=>{introCache.delete(key);throw e});
 introCache.set(key,p);return p;
}
async function playBlob(blob){
 audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')await audioCtx.resume();
 const ab=await blob.arrayBuffer(),buf=await audioCtx.decodeAudioData(ab.slice(0));
 return new Promise(resolve=>{const s=audioCtx.createBufferSource();s.buffer=buf;s.connect(audioCtx.destination);s.onended=resolve;s.start()});
}
function playClip(item){
 audioChain=audioChain.then(async()=>{try{const intro=await prepareIntro(nowIntro()).catch(()=>null);if(intro?.blob)await playBlob(intro.blob);const blob=item.blob||await fetchBlob(item.audioUrl);await playBlob(blob)}catch{markExpired(item)}});
}

function updateComposer(){const has=!!input.value.trim();send.disabled=!has;prepare.disabled=!has;send.textContent='ENVIAR'}
input.placeholder='Escribí un mensaje…';
input.addEventListener('input',updateComposer);
updateComposer();
const empty=$('#emptyState');if(empty)empty.innerHTML='<b>Silencio por ahora.</b><span>ENVIAR manda normalmente · PREPARAR guarda una voz para reutilizarla.</span>';

function makePendingRow(item){
 $('#emptyState')?.remove();const row=document.createElement('article');row.className='message mine pendingV8';row.dataset.mid=item.id;
 row.innerHTML=`<div class="body"><div class="meta"><b>${esc(item.name)}</b><span>${esc(voiceName(item.voiceId))}</span></div><div class="bubble"><span>${esc(item.text)}</span><i class="pendingRailV8"></i></div><div class="pendingStatusV8">ESPERANDO TURNO…</div></div>${avatarMarkup(item.avatar,item.name)}`;
 messages.append(row);item.row=row;messages.scrollTop=messages.scrollHeight;
 return row;
}
function setPending(item,text,state='loading'){
 if(!item.row)return;item.row.dataset.state=state;item.row.querySelector('.pendingStatusV8').textContent=text;
}
function finalizePending(item){
 if(!item.row)return;const row=item.row;row.classList.remove('pendingV8');row.dataset.state='sent';
 const body=row.querySelector('.body');body.innerHTML=`<div class="meta"><b>${esc(item.name)}</b><button class="replay" type="button">▶ ${esc(voiceName(item.voiceId))}</button></div><div class="bubble">${esc(item.text)}</div>`;
 body.querySelector('.replay').onclick=()=>playClip(item);
}
function failPending(item){
 if(!item.row)return;item.row.dataset.state='error';
 const s=item.row.querySelector('.pendingStatusV8');s.innerHTML='NO SE PUDO ENVIAR';
 const actions=document.createElement('div');actions.className='pendingErrorActions';
 const retry=document.createElement('button');retry.type='button';retry.textContent='REINTENTAR ENVÍO';retry.onclick=()=>{actions.remove();queueGeneration(item)};
 const discard=document.createElement('button');discard.type='button';discard.textContent='DESCARTAR';discard.onclick=()=>{item.row?.remove();outbox.delete(item.id)};
 actions.append(retry,discard);item.row.querySelector('.body').append(actions);
}

function savePrepared(){
 const data=[...prepared.values()].filter(x=>x.state==='ready'&&x.audioUrl&&Date.now()-x.createdAt<TTL).slice(-16).map(x=>({id:x.id,text:x.text,voiceId:x.voiceId,audioId:x.audioId,audioUrl:x.audioUrl,createdAt:x.createdAt,sentCount:x.sentCount||0}));
 try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}
}
function loadPrepared(){
 let a=[];try{a=JSON.parse(localStorage.getItem(STORE)||'[]')}catch{}
 for(const x of Array.isArray(a)?a:[]){if(!x?.audioUrl||Date.now()-Number(x.createdAt||0)>TTL)continue;prepared.set(x.id,{...x,state:'ready',blob:null,sentCount:Number(x.sentCount)||0})}
 drawShelf();
}
function markExpired(item){item.state='expired';item.blob=null;drawShelf();savePrepared()}
function drawShelf(){
 const list=$('#shelfList');if(!list)return;list.innerHTML='';
 const items=[...prepared.values()].sort((a,b)=>b.createdAt-a.createdAt);
 shelfToggle.querySelector('b').textContent=String(items.length);
 if(!items.length){list.innerHTML='<div class="shelfEmpty"><b>Todavía no guardaste ninguno.</b><span>Escribí algo y tocá “PREPARAR PARA DESPUÉS”.</span></div>';return}
 for(const item of items){
  const card=document.createElement('article');card.className='preparedCard';card.dataset.state=item.state;
  const state=item.state==='loading'?'PREPARANDO…':item.state==='queued'?'EN COLA':item.state==='expired'?'NECESITA REGENERARSE':'LISTO';
  card.innerHTML=`<div class="preparedTop"><span>${esc(voiceName(item.voiceId))}</span><b>${state}</b></div><div class="preparedText">${esc(item.text)}</div><div class="preparedMeta">${item.sentCount?`ENVIADO ${item.sentCount} ${item.sentCount===1?'VEZ':'VECES'}`:'TODAVÍA NO ENVIADO'}</div><div class="preparedActions"></div><i class="preparedRail"></i>`;
  const a=card.querySelector('.preparedActions');
  if(item.state==='ready'){
   addButton(a,'ESCUCHAR','secondary',()=>playClip(item));
   addButton(a,'ENVIAR','primarySend',()=>sendPrepared(item));
   addButton(a,'BORRAR','quietDelete',()=>removePrepared(item));
  }else if(item.state==='expired'){
   addButton(a,'REGENERAR','primarySend',()=>regeneratePrepared(item));
   addButton(a,'BORRAR','quietDelete',()=>removePrepared(item));
  }else{
   addButton(a,'CANCELAR','quietDelete',()=>removePrepared(item));
  }
  list.append(card);
 }
}
function addButton(w,text,cls,fn){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.onclick=fn;w.append(b)}
function removePrepared(item){prepared.delete(item.id);item.cancelled=true;try{item.controller?.abort()}catch{}drawShelf();savePrepared()}
function regeneratePrepared(item){item.state='queued';item.cancelled=false;item.id=crypto.randomUUID();item.createdAt=Date.now();item.audioUrl='';item.audioId='';prepared.set(item.id,item);drawShelf();queueGeneration(item)}

function queueGeneration(item){
 item.state='queued';item.cancelled=false;generationQueue.push(item);
 if(item.kind==='send')setPending(item,'ESPERANDO TURNO…','queued');
 drawShelf();pump();
}
function pump(){if(generating)return;const item=generationQueue.shift();if(!item)return;generating=true;generate(item).finally(()=>{generating=false;pump()})}
async function generate(item){
 if(item.cancelled)return;item.state='loading';item.controller=new AbortController();
 if(item.kind==='send')setPending(item,'CREANDO LA VOZ…','loading');else drawShelf();
 try{
  const r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},signal:item.controller.signal,body:JSON.stringify({voice:item.voiceId,text:item.text,messageId:item.id})});
  if(!r.ok)throw 0;if(item.cancelled)return;
  item.blob=await r.blob();item.audioId=r.headers.get('x-casa-audio-id')||item.id;item.audioUrl=r.headers.get('x-casa-audio-url')||audioUrl(item.audioId);item.state='ready';item.controller=null;audioCache.set(item.audioUrl,Promise.resolve(item.blob));
  if(item.kind==='send')await transmitAuto(item);else{prepared.set(item.id,item);savePrepared();drawShelf();shelfToggle.classList.add('pulse');setTimeout(()=>shelfToggle.classList.remove('pulse'),900)}
 }catch(e){if(item.cancelled||e?.name==='AbortError')return;item.controller=null;item.state='error';if(item.kind==='send')failPending(item);else{item.state='expired';drawShelf()}}
}

async function transmitPayload(item,payloadId){
 const introText=nowIntro(),intro=await prepareIntro(introText).catch(()=>null);await ensureTx();
 const payload={id:payloadId,clientId,name:nowName(),avatar:nowAvatar(),intro:introText,introAudioUrl:intro?.url||'',text:item.text,voiceId:item.voiceId,audioId:item.audioId,audioUrl:item.audioUrl,sentAt:Date.now()};
 await txChannel.send({type:'broadcast',event:'message',payload});
 return intro;
}
async function transmitAuto(item){
 setPending(item,'ENVIANDO…','sending');
 try{const intro=await transmitPayload(item,item.id);item.introBlob=intro?.blob||null;item.name=nowName();item.avatar=nowAvatar();finalizePending(item);outbox.delete(item.id);playClip(item)}catch{failPending(item)}
}
async function sendPrepared(item){
 if(item.state!=='ready')return;
 const sendId=crypto.randomUUID(),copy={...item,id:sendId,name:nowName(),avatar:nowAvatar(),kind:'reuse'};makePendingRow(copy);setPending(copy,'ENVIANDO VOZ GUARDADA…','sending');
 try{await transmitPayload(item,sendId);finalizePending(copy);playClip(item);item.sentCount=(item.sentCount||0)+1;savePrepared();drawShelf()}catch{copy.row?.remove();markExpired(item)}
}

function commitNormal(){
 const text=input.value.trim().slice(0,180);if(!text)return;
 const item={id:crypto.randomUUID(),kind:'send',text,voiceId:nowVoice(),name:nowName(),avatar:nowAvatar(),createdAt:Date.now(),state:'queued',blob:null,audioId:'',audioUrl:'',row:null,cancelled:false};
 input.value='';updateComposer();outbox.set(item.id,item);makePendingRow(item);queueGeneration(item);input.focus();
}
function commitPrepared(){
 const text=input.value.trim().slice(0,180);if(!text)return;
 const item={id:crypto.randomUUID(),kind:'prepared',text,voiceId:nowVoice(),createdAt:Date.now(),sentCount:0,state:'queued',blob:null,audioId:'',audioUrl:'',cancelled:false};
 input.value='';updateComposer();prepared.set(item.id,item);drawShelf();drawer.classList.add('open');queueGeneration(item);input.focus();
}

composer.onsubmit=e=>{e.preventDefault();commitNormal()};
prepare.onclick=commitPrepared;
loadPrepared();
setTimeout(()=>prepareIntro(nowIntro()).catch(()=>{}),600);
