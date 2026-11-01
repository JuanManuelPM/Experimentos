import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const source = readFileSync(fileURLToPath(new URL('../media-studio.user.js', import.meta.url)), 'utf8');
function native(kind) {
  if (kind === 'music') return '<ytmusic-player-bar>'+
    '<yt-formatted-string class="title ytmusic-player-bar">Canción uno</yt-formatted-string>'+
    '<yt-formatted-string class="byline">Artista uno</yt-formatted-string>'+
    '<div id="thumbnail"><img src="https://i.ytimg.com/something.jpg"></div>'+
    '<button class="previous-button"></button><button class="next-button"></button>'+
    '</ytmusic-player-bar><ytmusic-player><video></video></ytmusic-player>'+
    '<ytmusic-player-queue-item><yt-formatted-string class="song-title">Próxima canción</yt-formatted-string></ytmusic-player-queue-item>';
  return '<ytd-watch-flexy><div id="player-container-outer" style="margin:10px">'+
    '<div id="movie_player"><video class="html5-main-video"></video>'+
    '<button class="ytp-next-button"></button></div></div></ytd-watch-flexy>'+
    '<ytd-watch-metadata><h1><yt-formatted-string>Video principal</yt-formatted-string></h1>'+
    '<ytd-channel-name><a>Canal prueba</a></ytd-channel-name></ytd-watch-metadata>'+
    '<ytd-playlist-panel-video-renderer>'+
    '<a id="video-title" href="/watch?v=123&list=ABC">Video siguiente</a>'+
    '</ytd-playlist-panel-video-renderer>';
}
async function boot(kind, enabled = true) {
  const site = kind === 'music' ? 'music.youtube.com' : 'www.youtube.com';
  const dom = new JSDOM('<html><head></head><body>'+native(kind)+'</body></html>', {
    url: 'https://' + site + '/watch?v=123', runScripts: 'outside-only', pretendToBeVisual: true
  });
  const {window: w} = dom, stored = new Map(), cmds = [];
  stored.set('ums-enabled-v1-'+kind, enabled);
  w.GM_getValue = (key, fall) => stored.has(key) ? stored.get(key) : fall;
  w.GM_setValue = (key, val) => stored.set(key, val);
  w.GM_registerMenuCommand = (label, handler) => cmds.push({label, handler});
  const media = w.document.querySelector('video');
  let playing = false, plays = 0, pauses = 0;
  Object.defineProperty(media, 'paused', {get:()=>!playing, configurable:true});
  Object.defineProperty(media, 'duration', {get:()=>200, configurable:true});
  Object.defineProperty(media, 'volume', {value:.65, writable:true, configurable:true});
  media.play = () => {playing=true;plays++;return Promise.resolve()};
  media.pause = () => {playing=false;pauses++};
  w.setInterval=()=>0; // no background loops in tests
  w.eval(source);
  const host=w.document.getElementById('ums-host');
  return { dom,w,stored,cmds,host,sh:host.shadowRoot,media,stats:()=>({plays,pauses,playing})};
}
function cleanup(context){context.dom.window.close();}
const $=(ctx,id)=>ctx.sh.getElementById(id);
function pointer(win,target,event,x,y) {
  const e=new win.Event(event,{bubbles:true,cancelable:true});
  Object.defineProperties(e,{clientX:{value:x},clientY:{value:y},pointerId:{value:1},button:{value:0}});
  target.dispatchEvent(e);
}

test('single installed userscript supports both official domains',()=>{
  assert.match(source,/@match\s+https:\/\/www.youtube.com\/\*/);
  assert.match(source,/@match\s+https:\/\/music.youtube.com\/\*/);
  assert.match(source,/GM_getValue/);
  assert.doesNotMatch(source,/GM_xmlhttpRequest|fetch\(/);
});

test('YouTube canvas has an independent video stage and keeps native video attached',async()=>{
  const c=await boot('youtube');
  try{
    assert.equal($ (c,'appName').textContent,'YouTube Studio');
    assert.equal($(c,'desk').hidden,false);
    assert.ok(c.media.isConnected);
    assert.equal(c.sh.getElementById('videoMessage').textContent.includes('video'),true);
    assert.equal($(c,'searchForm').getAttribute('action'),'https://www.youtube.com/results');
    assert.equal($(c,'search').name,'search_query');
  }finally{cleanup(c)}
});

test('YouTube Music album info comes from player bar and media remains original',async()=>{
  const c=await boot('music');
  try{
    assert.equal($(c,'appName').textContent,'Music Studio');
    assert.equal($(c,'song').textContent,'Canción uno');
    assert.equal($(c,'artist').textContent,'Artista uno');
    assert.match($(c,'cover').src,/ytimg.com/);
    assert.equal($(c,'search').name,'q');
    assert.ok(c.media.isConnected);
  }finally{cleanup(c)}
});

test('play and pause operate on actual native HTMLMediaElement',async()=>{
  for(const kind of ['youtube','music']){
    const c=await boot(kind);
    try{
      $(c,'play').click();
      assert.equal(c.stats().plays,1);
      assert.equal(c.stats().playing,true);
      $(c,'play').click();
      assert.equal(c.stats().pauses,1);
      assert.equal(c.stats().playing,false);
    }finally{cleanup(c)}
  }
});

test('seek and volume write native media properties',async()=>{
  const c=await boot('music');
  try{
    const seek=$(c,'seek');seek.value='250';seek.dispatchEvent(new c.w.Event('input'));
    assert.equal(c.media.currentTime,50);
    const volume=$(c,'volume');volume.value='40';volume.dispatchEvent(new c.w.Event('input'));
    assert.equal(c.media.volume,.4);
  }finally{cleanup(c)}
});

test('youtube queue builds only local origin links, without copying message data',async()=>{
  const c=await boot('youtube');
  try{
    const entries=c.sh.querySelectorAll('#queue a.row');
    assert.equal(entries.length,1);
    assert.equal(entries[0].textContent,'Video siguiente');
    assert.equal(new URL(entries[0].href).origin,'https://www.youtube.com');
    assert.equal(c.sh.textContent.includes('Chat'),false);
  }finally{cleanup(c)}
});

test('music queue is clearly read-only and has no fake URL for next item',async()=>{
  const c=await boot('music');
  try {
    const entries=c.sh.querySelectorAll('#queue .row');
    assert.equal(entries.length,1);
    assert.equal(entries[0].textContent,'Próxima canción');
    assert.equal(entries[0].tagName,'DIV');
  }finally{cleanup(c)}
});

test('browse mode exposes original site and keeps floating controls',async()=>{
  const c=await boot('music');
  try{
    $(c,'browse').click();
    assert.equal($(c,'desk').dataset.browse,'true');
    assert.equal($(c,'ambient').hidden,true);
    assert.equal($(c,'masks').hidden,true);
    assert.ok(c.media.isConnected);
    $(c,'browse').click();
    assert.equal($(c,'desk').dataset.browse,'false');
  }finally{cleanup(c)}
});

test('Original mode is reversible, never removes native player and includes launcher',async()=>{
  const c=await boot('youtube');
  try{
    $(c,'close').click();
    assert.equal($(c,'desk').hidden,true);
    assert.equal($(c,'launcher').hidden,false);
    assert.equal(c.stored.get('ums-enabled-v1-youtube'),false);
    assert.ok(c.media.isConnected);
    $(c,'launcher').click();
    assert.equal($(c,'desk').hidden,false);
    assert.equal(c.stored.get('ums-enabled-v1-youtube'),true);
  }finally{cleanup(c)}
});

test('drag persists layout separately for YouTube and Music',async()=>{
  const c=await boot('music');
  try{
    const desk=$(c,'desk'),handle=$(c,'handle');
    const x=parseInt(desk.style.left,10),y=parseInt(desk.style.top,10);
    pointer(c.w,handle,'pointerdown',50,60);
    pointer(c.w,handle,'pointermove',85,85);
    pointer(c.w,handle,'pointerup',85,85);
    assert.equal(parseInt(desk.style.left,10),x+35);
    assert.equal(parseInt(desk.style.top,10),y+25);
    assert.equal(c.stored.get('ums-layout-v1-music').x,x+35);
    assert.equal(c.stored.has('ums-layout-v1-youtube'),false);
  }finally{cleanup(c)}
});

test('does not auto-play media and stays honest without a loaded video',async()=>{
  const c=await boot('youtube');
  try{
    assert.equal(c.stats().plays,0);
    c.media.remove();
    $(c,'play').click();
    assert.match($(c,'status').textContent,/No hay reproducción/);
    assert.equal(c.stats().plays,0);
  }finally{cleanup(c)}
});

test('native next action uses existing site control, never fabricates playback',async()=>{
  const c=await boot('music');
  try{
    let clicks=0;
    c.w.document.querySelector('ytmusic-player-bar .next-button').addEventListener('click',()=>clicks++);
    $(c,'next').click();
    assert.equal(clicks,1);
    assert.match($(c,'status').textContent,/Comprobando/);
    assert.equal(c.stats().plays,0);
  }finally{cleanup(c)}
});

test('fallback when native next button is unavailable',async()=>{
  const c=await boot('music');
  try{
    c.w.document.querySelector('ytmusic-player-bar .next-button').remove();
    $(c,'next').click();
    assert.match($(c,'status').textContent,/no disponible/);
  }finally{cleanup(c)}
});

test('native player styles restore precisely when changing to Original',async()=>{
  const c=await boot('youtube');
  try{
    const target=c.w.document.getElementById('player-container-outer');
    assert.equal(target.style.margin,'10px');
    const slot=$(c,'videoSlot');
    slot.getBoundingClientRect=()=>({left:350,top:110,width:650,height:366});
    target.getBoundingClientRect=()=>({
      left:parseFloat(target.style.left)||0,top:parseFloat(target.style.top)||0,
      width:parseFloat(target.style.width)||0,height:parseFloat(target.style.height)||0
    });
    c.w.document.elementFromPoint=()=>target;
    c.w.dispatchEvent(new c.w.Event('resize'));
    assert.equal(target.style.position,'fixed');
    assert.equal(target.style.left,'350px');
    $(c,'close').click();
    assert.equal(target.style.position,'');
    assert.equal(target.style.margin,'10px');
    assert.equal(c.media.isConnected,true);
  }finally{cleanup(c)}
});


test('native YouTube player falls back safely when it is occluded by an overlay',async()=>{
  const c=await boot('youtube');
  try{
    const target=c.w.document.getElementById('player-container-outer');
    const slot=$(c,'videoSlot');
    slot.getBoundingClientRect=()=>({left:315,top:100,width:630,height:354});
    target.getBoundingClientRect=()=>({
      left:parseFloat(target.style.left)||0,top:parseFloat(target.style.top)||0,
      width:parseFloat(target.style.width)||0,height:parseFloat(target.style.height)||0
    });
    c.w.document.elementFromPoint=()=>c.w.document.body;
    c.w.dispatchEvent(new c.w.Event('resize'));
    assert.equal(target.style.position,'');
    assert.equal(target.style.margin,'10px');
    assert.equal(slot.dataset.mounted,'false');
    assert.match($(c,'videoMessage').textContent,/Explorar/);
    assert.ok(c.media.isConnected);
  }finally{cleanup(c)}
});

test('Music media controls support a native audio element without a video tag',async()=>{
  const c=await boot('music');
  try{
    c.media.remove();
    const audio=c.w.document.createElement('audio');
    let played=0;
    audio.play=()=>{played++;return Promise.resolve()};
    c.w.document.body.appendChild(audio);
    $(c,'play').click();
    assert.equal(played,1);
  }finally{cleanup(c)}
});

test('visual backdrop masks block ghost clicks while Canvas is open',async()=>{
  const c=await boot('music');
  try{
    assert.equal($(c,'masks').hidden,false);
    assert.equal($(c,'ambient').hidden,false);
    assert.match(c.sh.querySelector('style').textContent, /\.mask\{position:fixed;pointer-events:auto/);
    $(c,'browse').click();
    assert.equal($(c,'masks').hidden,true);
  }finally{cleanup(c)}
});

test('window is centered by default rather than hard-pinned to sidebar',async()=>{
  const c=await boot('youtube');
  try{
    const x=parseInt($(c,'desk').style.left,10);
    assert.ok(x > 34,'expected centered start, not old sidebar position');
  }finally{cleanup(c)}
});
