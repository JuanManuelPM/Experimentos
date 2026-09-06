import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/+esm';

const S='https://catnohyouxqjjtseaueb.supabase.co';
const K='sb_publishable_eqh3PngXs4UjLLWiY3pz1w_nhHtf7X-';
const AUDIO_API=`${S}/functions/v1/casa-room-audio`;
const supabase=createClient(S,K,{auth:{persistSession:false,autoRefreshToken:false}});
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const initials=n=>(String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('')||'?').toUpperCase();
const roomCode=(new URLSearchParams(location.search).get('r')||'clase').replace(/[^a-z0-9_-]/gi,'').slice(0,24)||'clase';
const ROOM=`casa-class-v4-${roomCode}`;
const clientId=sessionStorage.getItem('casa_client_id')||crypto.randomUUID();sessionStorage.setItem('casa_client_id',clientId);

const VOICES=[
['sergeant','Sargento fósil','90+ · militar · destruido'],
['otaku','Otaku turbo','agudísima · anime · caos'],
['grandma','Abuela furiosa','anciana · ronca · indignada'],
['goblin','Duende nervioso','nasal · mini · rapidísimo'],
['giant','Gigante tonto','gravísimo · lento · feliz'],
['evilkid','Nene malvado','agudo · dulce · siniestro'],
['apocalypse','Apocalipsis','épico · enorme · absurdo'],
['novela','Telenovela','melodrama · traición total'],
['witch','Bruja seca','vieja · chillona · torcida'],
['gamer','Gamer 2007','nasal · gritón · cafeína'],
['barman','Viejo de bar','cascado · lento · risitas'],
['fairy','Hada tóxica','ultra aguda · dulce · venenosa']
];
const PALETTES=[
['bordo-crema','Bordó / Crema','#F5DABF','#6C151E'],
['verde-crema','Verde / Crema','#F5DABF','#0F3D3A'],
['lima-carbon','Lima / Carbón','#C7F464','#202124'],
['cobalto-crema','Cobalto / Crema','#F5DABF','#1546A0'],
['menta-bosque','Menta / Bosque','#B8E0D2','#174A3A'],
['rosa-ciruela','Rosa / Ciruela','#F4B6C2','#5B2448'],
['mandarina-noche','Mandarina / Noche','#F28C28','#102A43'],
['hueso-tinta','Hueso / Tinta','#EADFCB','#1B1B1A']
];

let name=localStorage.getItem('casa_name')||'';
let avatar=localStorage.getItem('casa_avatar')||'';
let voiceId=localStorage.getItem('casa_qwen_voice')||'';
let voiceClaimAt=Number(localStorage.getItem('casa_voice_claim_at'))||0;
let channel=null,presences=[];
let audioCtx=null,audioChain=Promise.resolve();
let prepared=null,prepController=null,draftVersion=0;
let paletteIndex=Math.max(0,PALETTES.findIndex(p=>p[0]===(localStorage.getItem('casa_palette')||'verde-crema')));

function applyPalette(i=paletteIndex){
 paletteIndex=(i+PALETTES.length)%PALETTES.length;const p=PALETTES[paletteIndex];
 document.documentElement.style.setProperty('--paper',p[2]);document.documentElement.style.setProperty('--ink',p[3]);
 localStorage.setItem('casa_palette',p[0]);$('#themeName').textContent=p[1];$('#swatchA').style.background=p[2];$('#swatchB').style.background=p[3];
 const meta=document.querySelector('meta[name=theme-color]');if(meta)meta.content=p[2];
}
applyPalette();

function avatarMarkup(src,n,cls='avatar'){return src?`<span class="${cls}"><img src="${src}" alt=""></span>`:`<span class="${cls} fallback">${esc(initials(n))}</span>`}
function setProfilePreview(){
 const el=$('#joinAvatarPreview');el.innerHTML=avatar?`<img src="${avatar}" alt="">`:`<b>${esc(initials($('#joinName').value||name||'?'))}</b>`;
 const mini=$('#meButton');if(mini)mini.innerHTML=avatar?`<img src="${avatar}" alt="">`:`<b>${esc(initials(name))}</b>`;
 const p=$('#profileAvatarPreview');if(p)p.innerHTML=avatar?`<img src="${avatar}" alt="">`:`<b>${esc(initials(name))}</b>`;
}
$('#joinName').value=name;setProfilePreview();
$('#joinName').addEventListener('input',setProfilePreview);

async function imageToAvatar(file){
 const img=await createImageBitmap(file);const size=Math.min(img.width,img.height),sx=(img.width-size)/2,sy=(img.height-size)/2;
 const c=document.createElement('canvas');c.width=c.height=88;const x=c.getContext('2d');x.drawImage(img,sx,sy,size,size,0,0,88,88);
 let out=c.toDataURL('image/webp',.68);if(out.length>24000)out=c.toDataURL('image/jpeg',.62);return out;
}
async function pickAvatar(file){if(!file)return;try{avatar=await imageToAvatar(file);localStorage.setItem('casa_avatar',avatar);setProfilePreview();if(channel)await trackPresence()}catch{toast('No pude leer esa foto')};}
$('#joinAvatarFile').onchange=e=>pickAvatar(e.target.files?.[0]);
$('#profileAvatarFile').onchange=e=>pickAvatar(e.target.files?.[0]);
$('#joinAvatarButton').onclick=()=>$('#joinAvatarFile').click();
$('#profileAvatarButton').onclick=()=>$('#profileAvatarFile').click();

function toast(t){const x=$('#toast');x.textContent=t;x.classList.remove('hidden');clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.add('hidden'),1800)}
async function unlockAudio(){try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')await audioCtx.resume()}catch{}}
async function playBlob(blob){
 await unlockAudio();const ab=await blob.arrayBuffer();const buffer=await audioCtx.decodeAudioData(ab.slice(0));
 return new Promise(resolve=>{const src=audioCtx.createBufferSource();src.buffer=buffer;src.connect(audioCtx.destination);src.onended=resolve;src.start()});
}
function enqueueUrl(url,row){
 if(!url)return;audioChain=audioChain.then(async()=>{try{row?.classList.add('speaking');const r=await fetch(url);if(!r.ok)throw 0;await playBlob(await r.blob())}catch{}finally{row?.classList.remove('speaking')}});
}

function presenceFlat(){return Object.values(channel?.presenceState?.()||{}).flat().filter(Boolean)}
function voiceOwner(id){
 const a=presences.filter(p=>p.voiceId===id).sort((x,y)=>(Number(x.voiceClaimAt)||9e15)-(Number(y.voiceClaimAt)||9e15)||String(x.clientId).localeCompare(String(y.clientId)));
 return a[0]||null;
}
function firstFreeVoice(){return VOICES.find(v=>!voiceOwner(v[0])||voiceOwner(v[0])?.clientId===clientId)?.[0]||VOICES[Math.floor(Math.random()*VOICES.length)][0]}
async function ensureVoice(){
 if(voiceId){const own=voiceOwner(voiceId);if(!own||own.clientId===clientId)return voiceId}
 voiceId=firstFreeVoice();voiceClaimAt=Date.now();localStorage.setItem('casa_qwen_voice',voiceId);localStorage.setItem('casa_voice_claim_at',String(voiceClaimAt));await trackPresence();updateVoiceUI();return voiceId;
}
async function resolveVoiceCollision(){
 if(!voiceId)return ensureVoice();const own=voiceOwner(voiceId);if(own&&own.clientId!==clientId){voiceId='';voiceClaimAt=0;await ensureVoice();toast('Te asigné otra voz libre')}
}
function voiceName(id){return VOICES.find(v=>v[0]===id)?.[1]||'Voz'}
function updateVoiceUI(){const b=$('#voiceButton');b.textContent=voiceId?voiceName(voiceId):'Voz';renderVoiceList()}
async function trackPresence(){if(!channel||!name)return;await channel.track({clientId,name,avatar,voiceId,voiceClaimAt,joinedAt:Date.now()})}
function syncPresence(){
 presences=presenceFlat();const unique=new Map();presences.forEach(p=>unique.set(p.clientId,p));presences=[...unique.values()];
 $('#onlineCount').textContent=String(presences.length||1);renderPeople();renderVoiceList();resolveVoiceCollision();
}

function renderVoiceList(){
 const list=$('#voiceList');if(!list)return;list.innerHTML='';
 VOICES.forEach(([id,label,desc],i)=>{const owner=voiceOwner(id),mine=id===voiceId,taken=owner&&owner.clientId!==clientId;const row=document.createElement('div');row.className='voiceRow'+(mine?' selected':'')+(taken?' taken':'');row.innerHTML=`<span class="voiceNum">${String(i+1).padStart(2,'0')}</span><div class="voiceInfo"><b>${esc(label)}</b><span>${esc(desc)}${taken?` · ${esc(owner.name)}`:''}</span></div><button class="previewVoice" type="button">▶</button><button class="claimVoice" type="button" ${taken?'disabled':''}>${mine?'TUYA':taken?'OCUPADA':'ELEGIR'}</button>`;
 row.querySelector('.previewVoice').onclick=()=>previewVoice(id,label,row.querySelector('.previewVoice'));
 row.querySelector('.claimVoice').onclick=async()=>{if(taken||mine)return;voiceId=id;voiceClaimAt=Date.now();localStorage.setItem('casa_qwen_voice',id);localStorage.setItem('casa_voice_claim_at',String(voiceClaimAt));await trackPresence();updateVoiceUI();$('#voiceSheet').close()};list.append(row)});
}
async function previewVoice(id,label,btn){
 if(btn.dataset.busy)return;btn.dataset.busy='1';btn.textContent='…';try{const mid=crypto.randomUUID();const r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({voice:id,text:`Soy ${name||'CASA'}. Esta es mi voz.`,messageId:mid})});if(!r.ok)throw 0;await playBlob(await r.blob())}catch{toast('Esa voz no respondió')}finally{btn.dataset.busy='';btn.textContent='▶'}
}

function renderPeople(){const list=$('#peopleList');if(!list)return;list.innerHTML=presences.map(p=>`<div class="personRow">${avatarMarkup(p.avatar,p.name,'personAvatar')}<div><b>${esc(p.name)}</b><small>${esc(voiceName(p.voiceId))}</small></div><span>●</span></div>`).join('')||'<div class="quiet">Sólo vos por ahora.</div>'}
function renderMessage(m){
 if(!m?.id||document.querySelector(`[data-mid="${CSS.escape(m.id)}"]`))return;$('#emptyState')?.remove();const mine=m.clientId===clientId,row=document.createElement('article');row.className='message'+(mine?' mine':'');row.dataset.mid=m.id;
 const av=avatarMarkup(m.avatar,m.name);const body=`<div class="body"><div class="meta"><b>${esc(m.name)}</b><button class="replay" type="button">▶ ${esc(voiceName(m.voiceId))}</button></div><div class="bubble">${esc(m.text)}</div></div>`;
 row.innerHTML=mine?body+av:av+body;row.querySelector('.replay').onclick=()=>enqueueUrl(m.audioUrl,row);$('#messages').append(row);$('#messages').scrollTop=$('#messages').scrollHeight;if(!mine)enqueueUrl(m.audioUrl,row);
}

async function connect(){
 if(channel)return;channel=supabase.channel(ROOM,{config:{broadcast:{self:true,ack:true},presence:{key:clientId}}});
 channel.on('broadcast',{event:'message'},({payload})=>renderMessage(payload));
 channel.on('presence',{event:'sync'},syncPresence);
 await new Promise((resolve,reject)=>channel.subscribe(status=>{if(status==='SUBSCRIBED')resolve();if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')reject(new Error(status))}));
 await trackPresence();setTimeout(ensureVoice,250);
}

$('#joinForm').onsubmit=async e=>{e.preventDefault();const n=$('#joinName').value.trim().slice(0,28);if(!n){$('#joinName').focus();return}name=n;localStorage.setItem('casa_name',name);await unlockAudio();$('#joinButton').disabled=true;$('#joinButton').textContent='ENTRANDO…';try{await connect();$('#joinScreen').classList.add('hidden');$('#appScreen').classList.remove('hidden');$('#roomLabel').textContent=roomCode.toUpperCase();setProfilePreview();updateVoiceUI();$('#messageInput').focus()}catch{$('#joinButton').disabled=false;$('#joinButton').textContent='ENTRAR';toast('No pude conectar. Probá de nuevo')}};

function setDraftStatus(text,mode=''){const s=$('#draftStatus');s.textContent=text;s.dataset.mode=mode}
function resetPrepared(reason='ESCRIBÍ Y TOCÁ ↑ PARA PREPARAR'){
 draftVersion++;if(prepController){prepController.abort();prepController=null}prepared=null;$('#previewPrepared').classList.add('hidden');$('#sendButton').className='sendButton';$('#sendButton').textContent='↑';$('#sendButton').disabled=!$('#messageInput').value.trim();setDraftStatus(reason,'idle');
}
$('#messageInput').addEventListener('input',()=>resetPrepared());

async function prepareAudio(){
 const text=$('#messageInput').value.trim().slice(0,180);if(!text)return;await ensureVoice();const version=++draftVersion,mid=crypto.randomUUID();prepController=new AbortController();prepared={state:'loading',text,voiceId,messageId:mid,sendWhenReady:false};
 $('#sendButton').className='sendButton loading';$('#sendButton').textContent='…';setDraftStatus('PREPARANDO VOZ · TOCÁ ↑ OTRA VEZ PARA ENVIAR APENAS TERMINE','loading');
 try{
  const spoken=`Habla ${name}. ${text}`;const r=await fetch(AUDIO_API,{method:'POST',headers:{'content-type':'application/json'},signal:prepController.signal,body:JSON.stringify({voice:voiceId,text:spoken,messageId:mid})});if(version!==draftVersion)return;if(!r.ok){let j={};try{j=await r.json()}catch{}throw new Error(j.error||'audio')}
  const blob=await r.blob();if(version!==draftVersion)return;const audioId=r.headers.get('x-casa-audio-id')||mid;const audioUrl=r.headers.get('x-casa-audio-url')||`${AUDIO_API}?id=${encodeURIComponent(audioId)}`;prepared={...prepared,state:'ready',blob,audioId,audioUrl};prepController=null;$('#previewPrepared').classList.remove('hidden');$('#sendButton').className='sendButton ready';$('#sendButton').textContent='↑';
  if(prepared.sendWhenReady){setDraftStatus('LISTO · ENVIANDO…','ready');await transmitPrepared()}else setDraftStatus('LISTO · ▶ ESCUCHÁ O ↑ ENVIÁ','ready');
 }catch(err){if(err.name==='AbortError')return;prepared=null;prepController=null;$('#sendButton').className='sendButton errorPulse';$('#sendButton').textContent='!';setDraftStatus('NO SE PUDO PREPARAR · TOCÁ ! PARA REINTENTAR','error')}
}
async function transmitPrepared(){
 if(!prepared||prepared.state!=='ready')return;const p=prepared;$('#sendButton').disabled=true;setDraftStatus('ENVIANDO…','ready');const payload={id:p.messageId,clientId,name,avatar,text:p.text,voiceId:p.voiceId,audioId:p.audioId,audioUrl:p.audioUrl,sentAt:Date.now()};
 try{await channel.send({type:'broadcast',event:'message',payload});$('#messageInput').value='';prepared=null;draftVersion++;$('#previewPrepared').classList.add('hidden');$('#sendButton').className='sendButton';$('#sendButton').textContent='↑';$('#sendButton').disabled=true;setDraftStatus('ESCRIBÍ Y TOCÁ ↑ PARA PREPARAR','idle')}catch{$('#sendButton').disabled=false;setDraftStatus('NO SE ENVIÓ · TOCÁ ↑','error')}
}
$('#composer').onsubmit=async e=>{e.preventDefault();const t=$('#messageInput').value.trim();if(!t)return;if(!prepared){await prepareAudio();return}if(prepared.state==='loading'){prepared.sendWhenReady=!prepared.sendWhenReady;$('#sendButton').className='sendButton loading'+(prepared.sendWhenReady?' armed':'');$('#sendButton').textContent=prepared.sendWhenReady?'↑':'…';setDraftStatus(prepared.sendWhenReady?'EN COLA · SE ENVÍA APENAS TERMINE':'PREPARANDO · NO SE ENVIARÁ SOLO','loading');return}if(prepared.state==='ready')await transmitPrepared();};
$('#previewPrepared').onclick=async()=>{if(prepared?.blob)await playBlob(prepared.blob)};

$('#voiceButton').onclick=()=>{$('#voiceSheet').showModal();renderVoiceList()};
$('#voiceClose').onclick=()=>$('#voiceSheet').close();
$('#peopleButton').onclick=()=>{$('#peopleSheet').showModal();renderPeople()};
$('#peopleClose').onclick=()=>$('#peopleSheet').close();
$('#meButton').onclick=()=>{$('#profileName').value=name;setProfilePreview();$('#profileSheet').showModal()};
$('#profileClose').onclick=()=>$('#profileSheet').close();
$('#profileForm').onsubmit=async e=>{e.preventDefault();const n=$('#profileName').value.trim().slice(0,28);if(!n)return;name=n;localStorage.setItem('casa_name',name);await trackPresence();setProfilePreview();$('#profileSheet').close();toast('Perfil guardado')};

$('#themeButton').onclick=e=>{e.stopPropagation();$('#themePopover').classList.toggle('hidden')};
$('#themePrev').onclick=()=>applyPalette(paletteIndex-1);$('#themeNext').onclick=()=>applyPalette(paletteIndex+1);
document.addEventListener('click',e=>{if(!$('#themePopover').contains(e.target)&&e.target!==$('#themeButton'))$('#themePopover').classList.add('hidden')});
$('#shareButton').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('r',roomCode);try{if(navigator.share)await navigator.share({title:'CASA',text:'Entrá a CASA',url:url.href});else{await navigator.clipboard.writeText(url.href);toast('LINK COPIADO')}}catch{}};

window.addEventListener('beforeunload',()=>channel?.untrack());
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
resetPrepared();