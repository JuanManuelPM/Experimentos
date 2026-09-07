const $=s=>document.querySelector(s);
const form=$('#joinForm'),nameInput=$('#joinName'),joinButton=$('#joinButton');
const joinScreen=$('#joinScreen'),appScreen=$('#appScreen');
const choice=$('#landingChoice'),invite=$('#inviteChoice'),ready=$('#privateReady');
const publicButton=$('#publicJoinButton'),createButton=$('#createPrivateButton'),inviteJoin=$('#inviteJoinButton');
const copyButton=$('#copyPrivateButton'),shareButton=$('#sharePrivateButton'),enterPrivate=$('#enterPrivateButton'),cancelPrivate=$('#cancelPrivateButton'),privateLink=$('#privateLink');
const status=$('#landingStatus'),mode=$('#landingMode');

const THEMES={
 'bordo-crema':['#F5DABF','#6C151E'],'verde-crema':['#F5DABF','#0F3D3A'],'lima-carbon':['#C7F464','#202124'],'cobalto-crema':['#F5DABF','#1546A0'],'menta-bosque':['#B8E0D2','#174A3A'],'rosa-ciruela':['#F4B6C2','#5B2448'],'mandarina-noche':['#F28C28','#102A43'],'hueso-tinta':['#EADFCB','#1B1B1A'],'negro-hueso':['#111111','#F2E8D5'],'azul-noche':['#0E1726','#DCE9F7'],'berenjena-humo':['#21131F','#E8C9D8'],'bosque-menta-dark':['#0D211A','#BFE7D5'],'petroleo-aqua':['#071F24','#BFE9E6'],'bordo-noche':['#260E14','#F0CDD5'],'carbon-lima-dark':['#171A17','#C7F464'],'cafe-arena':['#211713','#E9D2B6'],'indigo-lavanda':['#151329','#D9D4FF'],'medianoche-mandarina':['#111827','#FFB05A']
};
function applySavedTheme(){const t=THEMES[localStorage.getItem('casa_palette')||'verde-crema']||THEMES['verde-crema'];document.documentElement.style.setProperty('--paper',t[0]);document.documentElement.style.setProperty('--ink',t[1]);const dark=(parseInt(t[0].slice(1,3),16)*.2126+parseInt(t[0].slice(3,5),16)*.7152+parseInt(t[0].slice(5,7),16)*.0722)<105;document.documentElement.style.colorScheme=dark?'dark':'light';const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t[0]}
applySavedTheme();

function sanitizeRoom(s){return String(s||'').replace(/^#\/?/,'').replace(/[^a-z0-9_-]/gi,'').slice(0,24)}
const incomingRoom=sanitizeRoom(location.hash)||null;
const bootRoom=incomingRoom||'publico';
const cleanBootUrl=incomingRoom?'/#'+bootRoom:'/';
let createdRoom=null;

nameInput.value=localStorage.getItem('casa_name')||'';
form.addEventListener('submit',e=>e.preventDefault(),true);

function setStatus(t){if(status)status.textContent=t||''}
function validName(){const n=nameInput.value.trim().slice(0,28);if(!n){nameInput.focus();return null}localStorage.setItem('casa_name',n);return n}
function randomRoom(){const a=new Uint32Array(2);crypto.getRandomValues(a);return 'w'+((BigInt(a[0])<<32n)|BigInt(a[1])).toString(36).slice(0,7)}
function roomLink(room){const u=new URL(location.origin+'/');if(room!=='publico')u.hash=room;return u.href}
function setBusy(on){[publicButton,createButton,inviteJoin,enterPrivate].filter(Boolean).forEach(b=>b.disabled=on)}

/* Load the real chat before the user taps anything. The old version loaded it only after a tap, which made entry look dead when the realtime startup was slow. */
history.replaceState(null,'','/?r='+encodeURIComponent(bootRoom));
let coreReady=false,coreError=null;
try{
 await import('./app.js?v=6');
 await import('./preview-preload.js?v=1');
 await import('./shelf-v8.js?v=1');
 await import('./ui-v11.js?v=1');
 await import('./share-v11.js?v=1');
 await import('./dark-themes-v10.js?v=1');
 coreReady=true;
}catch(e){coreError=e;console.error('Walkie core failed',e)}finally{
 history.replaceState(null,'',cleanBootUrl);
}

async function enterLoadedRoom(){
 if(!validName())return;
 if(!coreReady||typeof form.onsubmit!=='function'){console.error(coreError||new Error('join handler missing'));setStatus('ERROR');return}
 setBusy(true);
 /* Open the chat immediately; realtime finishes connecting in the background inside app.js. */
 joinScreen.classList.add('hidden');
 appScreen.classList.remove('hidden');
 try{
  const p=form.onsubmit({preventDefault(){}});
  if(p&&typeof p.then==='function')await p;
  history.replaceState(null,'',cleanBootUrl);
 }catch(e){console.error(e);setBusy(false);joinScreen.classList.remove('hidden');appScreen.classList.add('hidden');setStatus('ERROR')}
}

publicButton.onclick=()=>enterLoadedRoom();
inviteJoin.onclick=()=>enterLoadedRoom();

createButton.onclick=()=>{
 if(!validName())return;
 createdRoom=randomRoom();
 privateLink.textContent=roomLink(createdRoom).replace(/^https?:\/\//,'');
 choice.classList.add('hidden');
 ready.classList.remove('hidden');
};
copyButton.onclick=async()=>{try{await navigator.clipboard.writeText(roomLink(createdRoom))}catch{}};
shareButton.onclick=async()=>{const url=roomLink(createdRoom);try{if(navigator.share)await navigator.share({title:'Walkie',url});else await navigator.clipboard.writeText(url)}catch{}};
enterPrivate.onclick=()=>{
 if(!createdRoom||!validName())return;
 sessionStorage.setItem('walkie_autojoin_room',createdRoom);
 location.replace('/#'+createdRoom);
};
cancelPrivate.onclick=()=>{createdRoom=null;ready.classList.add('hidden');choice.classList.remove('hidden')};

if(incomingRoom){choice.classList.add('hidden');invite.classList.remove('hidden');if(mode)mode.textContent=''}else{invite.classList.add('hidden');choice.classList.remove('hidden')}

const autoRoom=sessionStorage.getItem('walkie_autojoin_room');
if(autoRoom&&autoRoom===bootRoom){sessionStorage.removeItem('walkie_autojoin_room');queueMicrotask(()=>enterLoadedRoom())}
