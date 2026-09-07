const $=s=>document.querySelector(s);
const form=$('#joinForm'),nameInput=$('#joinName'),joinButton=$('#joinButton');
const choice=$('#landingChoice'),invite=$('#inviteChoice'),ready=$('#privateReady');
const publicButton=$('#publicJoinButton'),createButton=$('#createPrivateButton'),inviteJoin=$('#inviteJoinButton');
const copyButton=$('#copyPrivateButton'),shareButton=$('#sharePrivateButton'),enterPrivate=$('#enterPrivateButton'),cancelPrivate=$('#cancelPrivateButton'),privateLink=$('#privateLink');
const hiddenAvatar=$('#joinAvatarButton'),hiddenAvatarInput=$('#joinAvatarFile'),hiddenAvatarPreview=$('#joinAvatarPreview');
const status=$('#landingStatus'),mode=$('#landingMode');

const THEMES={
 'bordo-crema':['#F5DABF','#6C151E'],'verde-crema':['#F5DABF','#0F3D3A'],'lima-carbon':['#C7F464','#202124'],'cobalto-crema':['#F5DABF','#1546A0'],'menta-bosque':['#B8E0D2','#174A3A'],'rosa-ciruela':['#F4B6C2','#5B2448'],'mandarina-noche':['#F28C28','#102A43'],'hueso-tinta':['#EADFCB','#1B1B1A'],'negro-hueso':['#111111','#F2E8D5'],'azul-noche':['#0E1726','#DCE9F7'],'berenjena-humo':['#21131F','#E8C9D8'],'bosque-menta-dark':['#0D211A','#BFE7D5'],'petroleo-aqua':['#071F24','#BFE9E6'],'bordo-noche':['#260E14','#F0CDD5'],'carbon-lima-dark':['#171A17','#C7F464'],'cafe-arena':['#211713','#E9D2B6'],'indigo-lavanda':['#151329','#D9D4FF'],'medianoche-mandarina':['#111827','#FFB05A']
};
function applySavedTheme(){const t=THEMES[localStorage.getItem('casa_palette')||'verde-crema']||THEMES['verde-crema'];document.documentElement.style.setProperty('--paper',t[0]);document.documentElement.style.setProperty('--ink',t[1]);document.documentElement.style.colorScheme=((parseInt(t[0].slice(1,3),16)+parseInt(t[0].slice(3,5),16)+parseInt(t[0].slice(5,7),16))<300)?'dark':'light';const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t[0]}
applySavedTheme();

function sanitizeRoom(s){return String(s||'').replace(/^#\/?/,'').replace(/[^a-z0-9_-]/gi,'').slice(0,24)}
const incomingRoom=sanitizeRoom(location.hash)||null;
let createdRoom=null,loadedRoom=null,loading=null;
nameInput.value=localStorage.getItem('casa_name')||'';
form.addEventListener('submit',e=>e.preventDefault());

function setStatus(t){if(status)status.textContent=t||''}
function validName(){const n=nameInput.value.trim().slice(0,28);if(!n){nameInput.focus();return null}localStorage.setItem('casa_name',n);return n}
function randomRoom(){const a=new Uint32Array(2);crypto.getRandomValues(a);return 'w'+((BigInt(a[0])<<32n)|BigInt(a[1])).toString(36).slice(0,7)}
function roomLink(room){const u=new URL(location.origin+'/');if(room!=='publico')u.hash=room;return u.href}
function cleanPath(room){return room==='publico'?'/':'/#'+room}
function internalPath(room){return '/?r='+encodeURIComponent(room)}
function setBusy(on){[publicButton,createButton,inviteJoin,enterPrivate].filter(Boolean).forEach(b=>b.disabled=on)}

async function loadCore(room){
 if(loading){if(loadedRoom!==room)throw new Error('room already loaded');return loading}
 loadedRoom=room;
 history.replaceState(null,'',internalPath(room));
 loading=(async()=>{
  await import('./app.js?v=6');
  await import('./preview-preload.js?v=1');
  await import('./shelf-v8.js?v=1');
  await import('./ui-v11.js?v=1');
  await import('./share-v11.js?v=1');
  await import('./dark-themes-v10.js?v=1');
 })();
 return loading;
}
async function enter(room){
 if(!validName())return;
 setBusy(true);
 try{
  await loadCore(room);
  if(typeof form.onsubmit!=='function')throw new Error('join handler missing');
  await form.onsubmit({preventDefault(){}});
  if($('#appScreen')?.classList.contains('hidden'))throw new Error('join did not open app');
  history.replaceState(null,'',cleanPath(room));
 }catch(e){
  console.error(e);setBusy(false);setStatus('ERROR');
 }
}

publicButton.onclick=()=>enter('publico');
createButton.onclick=()=>{
 if(!validName())return;
 createdRoom=randomRoom();
 privateLink.textContent=roomLink(createdRoom).replace(/^https?:\/\//,'');
 choice.classList.add('hidden');ready.classList.remove('hidden');
};
copyButton.onclick=async()=>{try{await navigator.clipboard.writeText(roomLink(createdRoom))}catch{}};
shareButton.onclick=async()=>{const url=roomLink(createdRoom);try{if(navigator.share)await navigator.share({title:'Walkie',url});else await navigator.clipboard.writeText(url)}catch{}};
enterPrivate.onclick=()=>enter(createdRoom);
cancelPrivate.onclick=()=>{createdRoom=null;ready.classList.add('hidden');choice.classList.remove('hidden')};
inviteJoin.onclick=()=>enter(incomingRoom||'publico');

if(incomingRoom){choice.classList.add('hidden');invite.classList.remove('hidden');if(mode)mode.textContent='INVITACIÓN'}else{invite.classList.add('hidden');choice.classList.remove('hidden')}

/* Keep the old core's required avatar nodes alive, but never show them on the landing. */
if(hiddenAvatar&&hiddenAvatarInput&&hiddenAvatarPreview){hiddenAvatar.tabIndex=-1;hiddenAvatar.setAttribute('aria-hidden','true')}
