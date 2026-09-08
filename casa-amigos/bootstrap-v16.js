const $=s=>document.querySelector(s);
const form=$('#joinForm'), nameInput=$('#joinName'), roomInput=$('#joinRoomInput');
const joinScreen=$('#joinScreen'), appScreen=$('#appScreen');
const choice=$('#landingChoice'), invite=$('#inviteChoice'), ready=$('#privateReady');
const publicButton=$('#publicJoinButton'), inviteButton=$('#inviteJoinButton'), createButton=$('#createPrivateButton');
const enterPrivateButton=$('#enterPrivateButton'), copyButton=$('#copyPrivateButton'), privateLink=$('#privateLink');
const knob=$('#themeKnobButton'), lockup=$('.radioLockup');

const THEMES=[
 ['bordo-crema','#F5DABF','#6C151E'],['verde-crema','#F5DABF','#0F3D3A'],
 ['lima-carbon','#C7F464','#202124'],['cobalto-crema','#F5DABF','#1546A0'],
 ['menta-bosque','#B8E0D2','#174A3A'],['rosa-ciruela','#F4B6C2','#5B2448'],
 ['mandarina-noche','#F28C28','#102A43'],['hueso-tinta','#EADFCB','#1B1B1A'],
 ['negro-hueso','#111111','#F2E8D5'],['azul-noche','#0E1726','#DCE9F7'],
 ['berenjena-humo','#21131F','#E8C9D8'],['bosque-menta-dark','#0D211A','#BFE7D5'],
 ['petroleo-aqua','#071F24','#BFE9E6'],['bordo-noche','#260E14','#F0CDD5'],
 ['carbon-lima-dark','#171A17','#C7F464'],['cafe-arena','#211713','#E9D2B6'],
 ['indigo-lavanda','#151329','#D9D4FF'],['medianoche-mandarina','#111827','#FFB05A']
];

function sanitizeRoom(s){return String(s||'').replace(/^#\/?/,'').replace(/[^a-z0-9_-]/gi,'').slice(0,24)}
function isDark(hex){const h=hex.slice(1),r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return .2126*r+.7152*g+.0722*b<105}
function applyTheme(i){
 i=(i+THEMES.length)%THEMES.length;
 const t=THEMES[i];
 document.documentElement.style.setProperty('--paper',t[1]);
 document.documentElement.style.setProperty('--ink',t[2]);
 document.documentElement.style.colorScheme=isDark(t[1])?'dark':'light';
 localStorage.setItem('casa_palette',t[0]);
 const meta=document.querySelector('meta[name="theme-color"]'); if(meta)meta.content=t[1];
 return i;
}
let themeIndex=Math.max(0,THEMES.findIndex(t=>t[0]===(localStorage.getItem('casa_palette')||'verde-crema')));
themeIndex=applyTheme(themeIndex);
knob?.addEventListener('click',()=>{
 themeIndex=applyTheme(themeIndex+1);
 lockup?.classList.remove('themeTick'); void lockup?.offsetWidth; lockup?.classList.add('themeTick');
});

const qs=new URLSearchParams(location.search);
const incomingHash=sanitizeRoom(location.hash);
const incomingQuery=sanitizeRoom(qs.get('r'));
const shouldAutoJoin=qs.get('go')==='1';
const queryName=String(qs.get('n')||'').trim().slice(0,28);
const initialRoom=incomingHash||incomingQuery||'publico';
let createdRoom=null;
let booting=false;
let coreLoaded=false;
let activeRoom=null;

if(queryName){localStorage.setItem('casa_name',queryName);nameInput.value=queryName}
else nameInput.value=localStorage.getItem('casa_name')||'';
roomInput.value=initialRoom;

if(incomingHash&&!shouldAutoJoin){choice?.classList.add('hidden');invite?.classList.remove('hidden')}
else{invite?.classList.add('hidden');choice?.classList.remove('hidden')}

function validName(){
 const n=nameInput.value.trim().slice(0,28);
 if(!n){nameInput.focus();return null}
 localStorage.setItem('casa_name',n);
 return n;
}
function randomRoom(){
 const a=new Uint32Array(2);crypto.getRandomValues(a);
 return 'w'+((BigInt(a[0])<<32n)|BigInt(a[1])).toString(36).slice(0,7);
}
function roomLink(room){return `${location.origin}/#${room}`}
function cleanUrl(room){return room==='publico'?'/' : `/#${room}`}
function setBusy(on){[publicButton,inviteButton,createButton,enterPrivateButton].filter(Boolean).forEach(b=>b.disabled=on)}
function showApp(){joinScreen?.classList.add('hidden');appScreen?.classList.remove('hidden')}
function showLanding(){appScreen?.classList.add('hidden');joinScreen?.classList.remove('hidden')}
function toast(text){const t=$('#toast');if(!t)return;t.textContent=text;t.classList.remove('hidden');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.add('hidden'),1800)}

async function loadCoreFor(room){
 if(coreLoaded){
  if(activeRoom!==room) throw new Error('room already locked');
  return;
 }
 activeRoom=room;
 /* app.js reads the room synchronously when it is imported. Keep that internal query only during boot. */
 history.replaceState(null,'',`/?r=${encodeURIComponent(room)}`);
 await import('./app.js?v=6');
 coreLoaded=true;
}

async function enterRoom(room){
 if(booting)return;
 const n=validName(); if(!n)return;
 room=sanitizeRoom(room)||'publico';
 roomInput.value=room;
 booting=true;setBusy(true);showApp();
 try{
  await loadCoreFor(room);
  if(typeof form.onsubmit!=='function')throw new Error('join handler missing');
  const p=form.onsubmit({preventDefault(){}});
  if(p&&typeof p.then==='function')await p;
  requestAnimationFrame(()=>$('#messageInput')?.focus());
  /* Keep ?r=room until room-aware enhancement modules have evaluated; then clean the visible URL. */
  Promise.allSettled([
   import('./dark-themes-v10.js?v=1'),
   import('./preview-preload.js?v=1'),
   import('./shelf-v8.js?v=1').then(()=>import('./ui-v11.js?v=1')),
   import('./share-v11.js?v=1')
  ]).finally(()=>history.replaceState(null,'',cleanUrl(room)));
 }catch(e){
  console.error('Walkie entry failed',e);
  showLanding();setBusy(false);booting=false;
  history.replaceState(null,'',cleanUrl(room));
  toast('NO PUDE CONECTAR');
 }
}

/* Intercept every landing submit so <base> from the CDN can never navigate the browser away from Vercel. */
form?.addEventListener('submit',e=>{
 e.preventDefault();
 const room=ready&&!ready.classList.contains('hidden')&&createdRoom ? createdRoom : (incomingHash||'publico');
 enterRoom(room);
},true);
publicButton?.addEventListener('click',e=>{e.preventDefault();enterRoom('publico')});
inviteButton?.addEventListener('click',e=>{e.preventDefault();enterRoom(incomingHash||'publico')});

createButton?.addEventListener('click',()=>{
 const n=validName();if(!n)return;
 createdRoom=randomRoom();roomInput.value=createdRoom;
 privateLink.textContent=roomLink(createdRoom).replace(/^https?:\/\//,'');
 choice?.classList.add('hidden');ready?.classList.remove('hidden');
});
enterPrivateButton?.addEventListener('click',e=>{e.preventDefault();if(createdRoom)enterRoom(createdRoom)});
copyButton?.addEventListener('click',async()=>{
 if(!createdRoom)return;
 try{
  await navigator.clipboard.writeText(roomLink(createdRoom));
  const old=copyButton.textContent;copyButton.textContent='COPIADO';
  setTimeout(()=>copyButton.textContent=old,1000);
 }catch{toast('NO PUDE COPIAR')}
});

/* Native fallback, if this module somehow fails before wiring: always point to the real public origin, never the CDN base URL. */
if(form)form.action=`${location.origin}/`;

if(shouldAutoJoin)queueMicrotask(()=>enterRoom(initialRoom));
window.__walkieLanding={get themeIndex(){return themeIndex},room:initialRoom,enterRoom};
