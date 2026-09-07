const $=s=>document.querySelector(s);
const form=$('#joinForm'),nameInput=$('#joinName'),joinButton=$('#joinButton');
const status=$('#landingStatus'),choice=$('#landingChoice'),invite=$('#inviteChoice'),ready=$('#privateReady');
const publicButton=$('#publicJoinButton'),createButton=$('#createPrivateButton'),inviteJoin=$('#inviteJoinButton'),invitePublic=$('#invitePublicButton');
const copyButton=$('#copyPrivateButton'),shareButton=$('#sharePrivateButton'),enterPrivate=$('#enterPrivateButton'),cancelPrivate=$('#cancelPrivateButton'),privateLink=$('#privateLink');
const photoButton=$('#joinAvatarButton'),photoInput=$('#joinAvatarFile'),photoPreview=$('#joinAvatarPreview');

const THEMES={
 'bordo-crema':['#F5DABF','#6C151E'],'verde-crema':['#F5DABF','#0F3D3A'],'lima-carbon':['#C7F464','#202124'],'cobalto-crema':['#F5DABF','#1546A0'],'menta-bosque':['#B8E0D2','#174A3A'],'rosa-ciruela':['#F4B6C2','#5B2448'],'mandarina-noche':['#F28C28','#102A43'],'hueso-tinta':['#EADFCB','#1B1B1A'],'negro-hueso':['#111111','#F2E8D5'],'azul-noche':['#0E1726','#DCE9F7'],'berenjena-humo':['#21131F','#E8C9D8'],'bosque-menta-dark':['#0D211A','#BFE7D5'],'petroleo-aqua':['#071F24','#BFE9E6'],'bordo-noche':['#260E14','#F0CDD5'],'carbon-lima-dark':['#171A17','#C7F464'],'cafe-arena':['#211713','#E9D2B6'],'indigo-lavanda':['#151329','#D9D4FF'],'medianoche-mandarina':['#111827','#FFB05A']
};
function applySavedTheme(){const t=THEMES[localStorage.getItem('casa_palette')||'verde-crema']||THEMES['verde-crema'];document.documentElement.style.setProperty('--paper',t[0]);document.documentElement.style.setProperty('--ink',t[1]);const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t[0]}
applySavedTheme();

const sanitizeRoom=s=>String(s||'').replace(/^#\/?/,'').replace(/^\/+|\/+$/g,'').replace(/[^a-z0-9_-]/gi,'').slice(0,24);
const pathRoom=sanitizeRoom(location.pathname.split('/').filter(Boolean)[0]);
const hashRoom=sanitizeRoom(location.hash);
const incomingRoom=pathRoom||hashRoom||null;
let createdRoom=null,loading=null;

form?.addEventListener('submit',e=>e.preventDefault(),true);
nameInput.value=localStorage.getItem('casa_name')||'';

function initials(n){return(String(n||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('')||'?').toUpperCase()}
function paintPhoto(){const a=localStorage.getItem('casa_avatar')||'';photoPreview.innerHTML=a?`<img src="${a}" alt="">`:`<b>${initials(nameInput.value||'?')}</b>`}
paintPhoto();nameInput.addEventListener('input',paintPhoto);
async function fileToAvatar(file){const img=await createImageBitmap(file),size=Math.min(img.width,img.height),sx=(img.width-size)/2,sy=(img.height-size)/2,c=document.createElement('canvas');c.width=c.height=88;const x=c.getContext('2d');x.drawImage(img,sx,sy,size,size,0,0,88,88);let out=c.toDataURL('image/webp',.68);if(out.length>24000)out=c.toDataURL('image/jpeg',.62);return out}
photoButton.onclick=()=>photoInput.click();photoInput.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{localStorage.setItem('casa_avatar',await fileToAvatar(f));paintPhoto()}catch{setStatus('NO PUDE LEER ESA FOTO')}};

function setStatus(t){status.textContent=t||''}
function validName(){const n=nameInput.value.trim().slice(0,28);if(!n){nameInput.focus();setStatus('PONÉ TU NOMBRE PARA ENTRAR');return null}localStorage.setItem('casa_name',n);return n}
function roomLink(room){return room==='publico'?location.origin+'/':location.origin+'/'+encodeURIComponent(room)}
function randomRoom(){const a=new Uint32Array(2);crypto.getRandomValues(a);return 'w'+((BigInt(a[0])<<32n)|BigInt(a[1])).toString(36).slice(0,7)}
function visiblePath(room){return room==='publico'?'/':'/'+encodeURIComponent(room)}
function setBusy(on){[publicButton,createButton,inviteJoin,invitePublic,enterPrivate].filter(Boolean).forEach(b=>b.disabled=on);if(on)setStatus('ENTRANDO…')}

async function loadCore(room){
 if(loading)return loading;
 const finalPath=visiblePath(room);
 history.replaceState(null,'','/?r='+encodeURIComponent(room));
 loading=(async()=>{
  await import('./app.js?v=6');
  await import('./preview-preload.js?v=1');
  await import('./shelf-v8.js?v=1');
  await import('./ui-v11.js?v=1');
  await import('./share-v11.js?v=1');
  await import('./dark-themes-v10.js?v=1');
  history.replaceState(null,'',finalPath);
 })();
 return loading;
}
async function enter(room){
 if(!validName())return;
 setBusy(true);
 try{await loadCore(room);await Promise.resolve();form.requestSubmit(joinButton);setTimeout(()=>{if(!$('#appScreen').classList.contains('hidden'))return;setBusy(false);setStatus('SI NO ENTRÓ, TOCÁ DE NUEVO')},9000)}catch(e){console.error(e);setBusy(false);setStatus('NO PUDE CARGAR WALKIE · PROBÁ DE NUEVO')}
}

publicButton.onclick=()=>{history.replaceState(null,'','/');enter('publico')};
inviteJoin.onclick=()=>enter(incomingRoom||'publico');
invitePublic.onclick=()=>{history.replaceState(null,'','/');enter('publico')};

createButton.onclick=()=>{
 if(!validName())return;
 createdRoom=randomRoom();history.replaceState(null,'','/'+createdRoom);
 privateLink.textContent=roomLink(createdRoom).replace(/^https?:\/\//,'');choice.classList.add('hidden');ready.classList.remove('hidden');setStatus('LINK CREADO · CUALQUIERA CON EL LINK PUEDE ENTRAR');
};
cancelPrivate.onclick=()=>{createdRoom=null;history.replaceState(null,'','/');ready.classList.add('hidden');choice.classList.remove('hidden');setStatus('PÚBLICO ABIERTO · O CREÁ UN LINK APARTE')};
copyButton.onclick=async()=>{try{await navigator.clipboard.writeText(roomLink(createdRoom));setStatus('LINK COPIADO')}catch{setStatus('MANTENÉ APRETADO EL LINK PARA COPIAR')}};
shareButton.onclick=async()=>{const url=roomLink(createdRoom);try{if(navigator.share)await navigator.share({title:'Walkie',text:'Entrá a mi Walkie',url});else{await navigator.clipboard.writeText(url);setStatus('LINK COPIADO')}}catch{}};
enterPrivate.onclick=()=>enter(createdRoom);

if(incomingRoom){choice.classList.add('hidden');invite.classList.remove('hidden');$('#landingMode').textContent='INVITACIÓN';setStatus('CHAT POR LINK · SIN CONTRASEÑA')}else{invite.classList.add('hidden');choice.classList.remove('hidden');setStatus('PÚBLICO ABIERTO · O CREÁ UN LINK APARTE')}
