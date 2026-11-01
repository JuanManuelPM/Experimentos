// ==UserScript==
// @name         Universal Media Studio · YouTube + YouTube Music
// @name:es      YouTube Studio · Universal UI
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.0.0
// @description  YouTube únicamente. Studio flotante, player nativo y biblioteca personal.
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/media-studio.user.js
// @downloadURL  https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/media-studio.user.js
// ==/UserScript==
(function(){
'use strict';
if(window.top!==window||window.__youtubeStudioV1)return;
window.__youtubeStudioV1=true;
const CSS="\n:host{all:initial;color:#eff9f7;font-family:system-ui,-apple-system,\"Segoe UI\",Arial,sans-serif}\n*,*:before,*:after{box-sizing:border-box}\nbutton,a,input{font-family:inherit}\n#launcher{position:fixed;right:18px;bottom:18px;z-index:2147483646;pointer-events:auto;display:flex;align-items:center;gap:8px;padding:7px 14px 7px 7px;border-radius:17px;border:1px solid #a9dacf85;background:#113a43;color:#f1fffb;box-shadow:0 14px 36px #0009;cursor:pointer;font-size:12px;font-weight:700}\n#launcher i{display:grid;place-items:center;font-style:normal;font-size:23px;width:32px;height:32px;background:#a8e9d7;color:#12313b;border-radius:11px}\n#panel{position:fixed;z-index:2147483645;pointer-events:auto;display:flex;flex-direction:column;width:348px;height:616px;min-width:280px;min-height:350px;border:1px solid #ffffff34;border-radius:21px;overflow:hidden;background:linear-gradient(165deg,#1d4851 0%,#12323e 40%,#101c2d 100%);box-shadow:0 24px 85px #000b;color:#ecf7f6}\n#panel[hidden]{display:none!important}\n#handle{user-select:none;touch-action:none;cursor:grab;padding:19px 19px 12px}\n#handle:active{cursor:grabbing}\n.eyebrow{font-size:10px;letter-spacing:.18em;font-weight:700;color:#9cc9cb}\n.headline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}\n.headline b{font-size:25px;letter-spacing:-.055em;font-weight:680;line-height:1.1}\n#dismiss{width:32px;height:32px;font-size:20px}\n.button{border-radius:10px;border:1px solid #ffffff24;background:#ffffff11;color:#e8faf5;cursor:pointer;padding:9px 12px;font-size:12px}\n.button:hover{background:#ffffff25}\n.button:focus-visible,input:focus-visible,a:focus-visible{outline:2px solid #a5efdf;outline-offset:2px}\n#tabs{display:flex;gap:7px;padding:0 13px 13px}\n.tab{flex:1;border:0;border-radius:10px;padding:10px 8px;color:#b4d1d4;background:transparent;cursor:pointer;font-size:12px}\n.tab[aria-selected=true]{color:#fff;background:#ffffff24}\n#scroll{padding:3px 17px 20px;overflow-y:auto;overscroll-behavior:contain;flex:1;min-height:0;scrollbar-width:thin;scrollbar-color:#ffffff44 transparent}\n.page[hidden]{display:none!important}\n#videoTitle{font-size:18px;line-height:1.32;font-weight:640;letter-spacing:-.025em;margin:4px 0 5px;overflow-wrap:anywhere}\n#channel{color:#9ebec8;font-size:12px;margin-bottom:17px}\n.transport{display:flex;align-items:center;gap:9px;margin:13px 0 11px}\n.transport button{flex:1;min-width:0}\n#play{font-size:17px;color:#112a35;background:#a8e6d7;border-color:#a8e6d7;flex:1.4}\ninput[type=range]{accent-color:#a6e5d6;cursor:pointer;width:100%}\n#clock{display:flex;justify-content:space-between;color:#b1cbd2;font-size:11px;font-family:monospace;margin:4px 0 12px}\n#volumeBox{display:flex;gap:11px;align-items:center;font-size:12px;color:#b4c9cf;margin:12px 0 16px}\n#volumeBox input{flex:1}\n#saveBox{display:flex;gap:8px;margin:14px 0}\n#saveBox button{flex:1;padding:12px 6px}\n.note{font-size:11px;line-height:1.6;color:#a5c2c8}\n#status{font-size:11px;line-height:1.5;color:#d0e7df;min-height:14px;margin:10px 0}\n.search{display:flex;gap:7px;margin:20px 0 9px}\n.search input{flex:1;min-width:0;background:#09232f;border:1px solid #ffffff30;padding:10px;color:#fff;border-radius:10px;font-size:13px}\n.section{color:#a4d2d3;letter-spacing:.13em;font-size:10px;font-weight:750;margin:20px 0 9px}\n.link{display:block;text-decoration:none;color:#e7f6f5;font-size:12px;line-height:1.35;border-radius:11px;background:#ffffff0d;border:1px solid #ffffff1c;padding:11px 12px;margin:5px 0;overflow-wrap:anywhere}\n.link:hover{background:#ffffff20}\n.saved{display:flex;gap:6px;align-items:stretch}\n.saved .link{flex:1;min-width:0}\n.saved .remove{width:33px;margin:5px 0;flex:none}\n.filters{display:flex;gap:6px;margin:16px 0}\n.filters button{flex:1;padding:9px 5px;font-size:11px}\n.filters button[aria-pressed=true]{background:#b9eada2e;color:#fff}\n.option{display:flex;gap:10px;align-items:center;border-bottom:1px solid #ffffff16;padding:13px 2px;font-size:13px;cursor:pointer}\n.option input{width:17px;height:17px;accent-color:#b7eadb}\n#foot{border-top:1px solid #ffffff1c;display:flex;justify-content:space-between;padding:12px 17px;color:#97bbc2;font-size:10px}\n#resize{position:absolute;right:0;bottom:0;width:24px;height:24px;cursor:nwse-resize;touch-action:none;background:linear-gradient(135deg,transparent 51%,#b3ded587 54%,transparent 58%)}\n@media(max-width:600px){#launcher{right:9px;bottom:9px}#panel{border-radius:15px}}\n";
const VERSION='1.0.0',PREF='ums-youtube-v1',LIBRARY='ums-saved-youtube-v1';
const read=(k,f)=>{try{return GM_getValue(k,f)}catch(_){return f}};
const save=(k,v)=>{try{GM_setValue(k,v)}catch(_){}};
const p=read(PREF,{});
const state={open:p.open!==false,tab:'player',type:'all',focus:!!p.focus,shorts:p.shorts!==false,
comments:!!p.comments,related:!!p.related,x:Number.isFinite(p.x)?p.x:null,
y:Number.isFinite(p.y)?p.y:74,w:Number.isFinite(p.w)?p.w:348,
h:Number.isFinite(p.h)?p.h:616,drag:null,signature:''};
let favorites=read(LIBRARY,[]);
if(!Array.isArray(favorites))favorites=[];
favorites=favorites.filter(x=>x&&/^[\w-]{11}$/.test(x.id)&&['music','video'].includes(x.type)).slice(0,400);
let host=null,shadow=null;
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const $=id=>shadow?.getElementById(id);
const nativeVideo=()=>document.querySelector('#movie_player video.html5-main-video')||
document.querySelector('video.html5-main-video')||null;
const currentId=()=>{try{return new URL(location.href).searchParams.get('v')||''}catch(_){return ''}};
const watching=()=>location.pathname==='/watch'&&/^[\w-]{11}$/.test(currentId());
const currentTitle=()=>{
const el=document.querySelector('ytd-watch-metadata h1 yt-formatted-string')||
document.querySelector('#title h1 yt-formatted-string');
return (el?.textContent||document.title.replace(/\s*-\s*YouTube\s*$/,'')).trim().slice(0,200)};
const currentChannel=()=>(
document.querySelector('ytd-watch-metadata ytd-channel-name a')?.textContent||
document.querySelector('#owner ytd-channel-name a')?.textContent||'').trim().slice(0,100);
const timestamp=n=>{if(!Number.isFinite(n)||n<0)return '0:00';
n=Math.floor(n);const h=Math.floor(n/3600),m=Math.floor(n/60)%60,s=n%60;
return (h?h+':'+String(m).padStart(2,'0'):''+m)+':'+String(s).padStart(2,'0')};
function persist(){save(PREF,{open:state.open,focus:state.focus,shorts:state.shorts,
comments:state.comments,related:state.related,x:state.x,y:state.y,w:state.w,h:state.h})}
function nativeStyle(){
const id='ums-youtube-focus-css';let el=document.getElementById(id);
if(!el){el=document.createElement('style');el.id=id;
(document.head||document.documentElement).appendChild(el)}
el.textContent=[
'html[data-ums-shorts=true] :is(ytd-reel-shelf-renderer,ytd-reel-item-renderer,ytd-shorts,ytd-rich-shelf-renderer[is-shorts]){display:none!important}',
'html[data-ums-comments=true] :is(#comments,ytd-comments){display:none!important}',
'html[data-ums-related=true] ytd-watch-flexy :is(#secondary,#related){display:none!important}',
'html[data-ums-focus=true] ytd-watch-flexy #primary{max-width:min(1200px,calc(100vw - 48px))!important;width:100%!important}',
'html[data-ums-focus=true] ytd-watch-flexy #columns{justify-content:center!important}'
].join('');
const root=document.documentElement;
root.dataset.umsShorts=String(state.shorts);
root.dataset.umsComments=String(state.comments||state.focus);
root.dataset.umsRelated=String(state.related||state.focus);
root.dataset.umsFocus=String(state.focus)}
function place(){
if(!shadow)return;
const w=innerWidth||1366,h=innerHeight||768;
state.w=clamp(state.w,Math.min(w-12,280),Math.max(280,w-12));
state.h=clamp(state.h,Math.min(h-12,350),Math.max(350,h-12));
if(state.x===null)state.x=w-state.w-20;
state.x=clamp(state.x,8,Math.max(8,w-state.w-8));
state.y=clamp(state.y,8,Math.max(8,h-110));
const box=$('panel');box.hidden=!state.open;
box.style.left=state.x+'px';box.style.top=state.y+'px';
box.style.width=state.w+'px';box.style.height=state.h+'px';
$('launcher').setAttribute('aria-expanded',String(state.open))}
function showTab(tab){
state.tab=tab;state.open=true;place();
for(const el of shadow.querySelectorAll('[data-tab]')){
el.setAttribute('aria-selected',String(el.dataset.tab===tab))}
for(const n of ['player','library','design'])$(n+'Page').hidden=n!==tab;
if(tab==='library'){drawFavorites();drawPlaylists()}
if(tab==='design')drawOptions()}
function notify(message){$('status').textContent=message}
function drawOptions(){
for(const [el,key] of [['focus','focus'],['shorts','shorts'],
['comments','comments'],['related','related']])$(el).checked=state[key];
$('health').textContent='v'+VERSION+' · '+location.hostname+' · '+(nativeVideo()?'video nativo detectado':'sin video abierto')+
' · Violentmonkey ejecutando Studio'}
function currentVideo(){
const id=currentId();return watching()?{id,title:currentTitle()||'Sin título',
channel:currentChannel()}:null}
function addFavorite(type){
const item=currentVideo();
if(!item){notify('Abrí un video de YouTube para guardarlo.');return}
favorites=favorites.filter(x=>x.id!==item.id);
favorites.unshift({...item,type});favorites=favorites.slice(0,400);
save(LIBRARY,favorites);notify(type==='music'?'Canción guardada en Studio.':'Video guardado en Studio.');drawFavorites()}
function drawFavorites(){
if(!shadow)return;
const list=$('favorites');list.replaceChildren();
for(const b of shadow.querySelectorAll('[data-filter]'))
b.setAttribute('aria-pressed',String(b.dataset.filter===state.type));
const subset=favorites.filter(x=>state.type==='all'||x.type===state.type);
if(!subset.length){const p=document.createElement('p');p.className='note';
p.textContent='No hay elementos guardados en esta categoría.';list.appendChild(p);return}
for(const item of subset){
const group=document.createElement('div');group.className='saved';
const a=document.createElement('a');a.className='link';
a.href='https://www.youtube.com/watch?v='+encodeURIComponent(item.id);
a.textContent=(item.type==='music'?'♫ ':'▶ ')+item.title;
const b=document.createElement('button');b.className='button remove';b.textContent='×';
b.title='Quitar de guardados';b.setAttribute('aria-label','Quitar '+item.title);
b.addEventListener('click',()=>{favorites=favorites.filter(x=>x.id!==item.id);
save(LIBRARY,favorites);drawFavorites()});
group.append(a,b);list.appendChild(group)}}
function drawPlaylists(){
const dest=$('playlists');dest.replaceChildren();let count=0;const seen=new Set();
for(const node of document.querySelectorAll('ytd-guide-entry-renderer a[href*="playlist?"], ytd-mini-guide-entry-renderer a[href*="playlist?"]')){
let u;try{u=new URL(node.getAttribute('href'),location.origin)}catch(_){continue}
if(u.origin!==location.origin||u.pathname!=='/playlist'||!u.searchParams.has('list'))continue;
const id=u.searchParams.get('list');if(seen.has(id))continue;seen.add(id);
const a=document.createElement('a');a.className='link';a.href=u.href;
a.textContent=(node.getAttribute('title')||node.textContent||'Playlist').trim().slice(0,100);
dest.appendChild(a);if(++count>=20)break}
if(!count){const p=document.createElement('p');p.className='note';
p.textContent='YouTube no cargó tus playlists en esta página. Abrí tu biblioteca original.';
dest.appendChild(p)}
const a=document.createElement('a');a.className='link';a.textContent='Abrir biblioteca original ↗';
a.href='https://www.youtube.com/feed/you';dest.appendChild(a)}
function transport(action){
const v=nativeVideo();
if(!v){notify('No hay un video abierto. Usá el buscador de YouTube.');return}
try{
if(action==='play'){if(v.paused){const promise=v.play();promise?.catch?.(()=>notify('Play bloqueado. Usá el reproductor original.'))}else v.pause()}
if(action==='back')v.currentTime=Math.max(0,v.currentTime-10);
if(action==='ahead')v.currentTime=Math.min(Number.isFinite(v.duration)?v.duration:Infinity,v.currentTime+10);
tick()
}catch(_){notify('Control no disponible. Usá el reproductor original.')}}
function tick(){
if(!shadow)return;
const key=location.href+'|'+currentTitle()+'|'+currentChannel();
if(key!==state.signature){state.signature=key;
$('title').textContent=watching()?currentTitle():'Elegí un video';
$('channel').textContent=watching()?(currentChannel()||'YouTube'):'Seguís navegando en el YouTube original.'}
const v=nativeVideo(),d=Number(v?.duration)||0,t=Number(v?.currentTime)||0;
$('play').textContent=v&&!v.paused?'❚❚':'▶';
$('play').setAttribute('aria-label',v&&!v.paused?'Pausar':'Reproducir');
const seeking=shadow.activeElement===$('seek');
if(!seeking)$('seek').value=d>0&&Number.isFinite(d)?String(Math.round(t/d*1000)):'0';
$('seek').disabled=!(d>0&&Number.isFinite(d));
$('elapsed').textContent=timestamp(t);$('duration').textContent=timestamp(d);
if(v&&shadow.activeElement!==$('volume'))$('volume').value=v.muted?'0':String(Math.round(v.volume*100));
if(state.tab==='design')drawOptions()}
function connectPointer(node,resizing){
node.addEventListener('pointerdown',e=>{
if(e.button!==undefined&&e.button!==0)return;
if(e.target.closest('button,input,a'))return;
state.drag={resizing,startX:e.clientX,startY:e.clientY,x:state.x,y:state.y,w:state.w,h:state.h};
try{node.setPointerCapture(e.pointerId)}catch(_){}
e.preventDefault()});
node.addEventListener('pointermove',e=>{
const d=state.drag;if(!d||d.resizing!==resizing)return;
if(resizing){state.w=clamp(d.w+e.clientX-d.startX,280,Math.max(280,innerWidth-state.x-8));
state.h=clamp(d.h+e.clientY-d.startY,350,Math.max(350,innerHeight-state.y-8))}
else{state.x=clamp(d.x+e.clientX-d.startX,8,Math.max(8,innerWidth-state.w-8));
state.y=clamp(d.y+e.clientY-d.startY,8,Math.max(8,innerHeight-110))}
place()});
const done=()=>{if(state.drag){state.drag=null;persist()}};
node.addEventListener('pointerup',done);node.addEventListener('pointercancel',done)}
function bind(){
$('launcher').addEventListener('click',()=>{state.open=!state.open;place();persist()});
$('dismiss').addEventListener('click',()=>{state.open=false;place();persist()});
for(const b of shadow.querySelectorAll('[data-tab]'))
b.addEventListener('click',()=>showTab(b.dataset.tab));
for(const b of shadow.querySelectorAll('[data-filter]'))
b.addEventListener('click',()=>{state.type=b.dataset.filter;drawFavorites()});
$('play').addEventListener('click',()=>transport('play'));
$('back').addEventListener('click',()=>transport('back'));
$('ahead').addEventListener('click',()=>transport('ahead'));
$('saveVideo').addEventListener('click',()=>addFavorite('video'));
$('saveMusic').addEventListener('click',()=>addFavorite('music'));
$('seek').addEventListener('input',e=>{const v=nativeVideo();if(v&&Number.isFinite(v.duration)&&v.duration>0)
v.currentTime=v.duration*Number(e.target.value)/1000});
$('volume').addEventListener('input',e=>{const v=nativeVideo();if(v){v.volume=Number(e.target.value)/100;if(v.volume>0)v.muted=false}});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();const q=$('query').value.trim();
if(q)location.assign('https://www.youtube.com/results?search_query='+encodeURIComponent(q))});
for(const [el,key] of [['focus','focus'],['shorts','shorts'],
['comments','comments'],['related','related']]){
$(el).addEventListener('change',e=>{state[key]=e.target.checked;nativeStyle();persist();drawOptions()})}
$('reset').addEventListener('click',()=>{state.focus=false;state.shorts=false;
state.comments=false;state.related=false;nativeStyle();persist();drawOptions()});
connectPointer($('handle'),false);connectPointer($('resize'),true);
window.addEventListener('resize',place);
window.addEventListener('keydown',e=>{
if(e.altKey&&e.shiftKey&&e.code==='KeyY'){e.preventDefault();state.open=!state.open;place();persist()}
if(e.key==='Escape'&&state.open&&shadow.activeElement?.tagName!=='INPUT'){
state.open=false;place();persist()}});
for(const name of ['yt-navigate-finish','yt-page-data-updated','popstate'])
window.addEventListener(name,()=>setTimeout(()=>{tick();if(state.tab==='library')drawPlaylists()},180));
}
function mount(){
if(host?.isConnected)return;
if(!document.documentElement)return;
host=document.createElement('div');host.id='ums-youtube-studio-host';
host.style.cssText='position:fixed!important;inset:0!important;z-index:2147483645!important;pointer-events:none!important';
shadow=host.attachShadow({mode:'open'});
shadow.innerHTML='<style>'+CSS+'</style>'+
'<button id="launcher" type="button" aria-label="Abrir o cerrar YouTube Studio"><i>◐</i><span>STUDIO</span></button>'+
'<section id="panel" role="region" aria-label="YouTube Studio">'+
'<header id="handle"><div class="eyebrow">UNIVERSAL UI / YOUTUBE</div>'+
'<div class="headline"><b>YouTube Studio</b><button class="button" id="dismiss" type="button" aria-label="Cerrar">×</button></div></header>'+
'<nav id="tabs"><button class="tab" data-tab="player" type="button">Video</button>'+
'<button class="tab" data-tab="library" type="button">Guardados</button>'+
'<button class="tab" data-tab="design" type="button">Diseño</button></nav>'+
'<div id="scroll">'+
'<div class="page" id="playerPage"><div id="videoTitle">Elegí un video</div><div id="channel"></div>'+
'<div class="transport"><button class="button" id="back" type="button">−10</button>'+
'<button class="button" id="play" type="button" aria-label="Reproducir">▶</button>'+
'<button class="button" id="ahead" type="button">+10</button></div>'+
'<input type="range" min="0" max="1000" value="0" id="seek" aria-label="Posición del video">'+
'<div id="clock"><span id="elapsed">0:00</span><span id="duration">0:00</span></div>'+
'<label id="volumeBox">Volumen <input type="range" id="volume" min="0" max="100" value="70"></label>'+
'<div id="saveBox"><button id="saveVideo" type="button" class="button">+ Video</button>'+
'<button id="saveMusic" type="button" class="button">♫ Canción</button></div>'+
'<p class="note">Se guardan accesos locales. Tus playlists de Google no se modifican.</p>'+
'<p id="status" aria-live="polite"></p>'+
'<form class="search" id="searchForm"><input id="query" type="search" placeholder="Buscar en YouTube" aria-label="Buscar">'+
'<button type="submit" class="button">Ir</button></form>'+
'<div class="section">ACCESOS RÁPIDOS</div><div id="quick"></div></div>'+
'<div class="page" id="libraryPage" hidden><p class="note">Canciones y videos guardados en este navegador.</p>'+
'<div class="filters"><button type="button" class="button" data-filter="all">Todo</button>'+
'<button type="button" class="button" data-filter="music">Canciones</button>'+
'<button type="button" class="button" data-filter="video">Videos</button></div>'+
'<div id="favorites"></div><div class="section">PLAYLISTS DE YOUTUBE</div><div id="playlists"></div></div>'+
'<div class="page" id="designPage" hidden>'+
'<label class="option"><input id="focus" type="checkbox"> Modo concentrado</label>'+
'<label class="option"><input id="shorts" type="checkbox"> Ocultar Shorts</label>'+
'<label class="option"><input id="comments" type="checkbox"> Ocultar comentarios</label>'+
'<label class="option"><input id="related" type="checkbox"> Ocultar recomendaciones</label>'+
'<p class="note" id="health"></p>'+
'<button id="reset" class="button" type="button">Restaurar apariencia original</button></div>'+
'</div><footer id="foot"><span>YOUTUBE NATIVO</span><b>v'+VERSION+'</b></footer>'+
'<div id="resize" aria-label="Cambiar tamaño" role="separator"></div></section>';
document.documentElement.appendChild(host);bind();nativeStyle();place();
const wasOpen=state.open;showTab('player');state.open=wasOpen;place();
const links=[['Inicio','/'],['Suscripciones','/feed/subscriptions'],
['Mi biblioteca','/feed/you'],['Historial','/feed/history'],['Ver más tarde','/playlist?list=WL']];
const q=$('quick');for(const [name,href] of links){const a=document.createElement('a');
a.className='link';a.href=new URL(href,location.origin).href;a.textContent=name;q.appendChild(a)}
tick()}
function start(){
if(!document.documentElement){setTimeout(start,30);return}
try{mount()}catch(e){console.warn('[YouTube Studio]',e);return}
setInterval(()=>{if(!host?.isConnected)mount();tick()},1100);
if(typeof GM_registerMenuCommand==='function'){
GM_registerMenuCommand('YouTube Studio: mostrar/ocultar',()=>{state.open=!state.open;place();persist()});
GM_registerMenuCommand('YouTube Studio: restaurar apariencia',()=>{state.focus=false;
state.shorts=false;state.comments=false;state.related=false;nativeStyle();persist()})}}
start();
})();