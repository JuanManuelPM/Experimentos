import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

const source=readFileSync(fileURLToPath(new URL('../media-studio.user.js',import.meta.url)),'utf8');
const VIDEO_ID='aBcDeFg1234';
const fixture=()=>'<html><head></head><body>'+
  '<ytd-watch-flexy><div id="movie_player"><video class="html5-main-video"></video></div></ytd-watch-flexy>'+
  '<ytd-watch-metadata><h1><yt-formatted-string>Probando una canción</yt-formatted-string></h1>'+
  '<ytd-channel-name><a>Canal verificable</a></ytd-channel-name></ytd-watch-metadata>'+
  '<ytd-guide-entry-renderer><a title="Mi playlist" href="/playlist?list=PLabc">Mi playlist</a></ytd-guide-entry-renderer></body></html>';
const wait=n=>new Promise(r=>setTimeout(r,n));
async function boot(overrides={}){
  const url=overrides.url||'https://www.youtube.com/watch?v='+VIDEO_ID;
  const dom=new JSDOM(fixture(),{url,runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  Object.defineProperty(w,'innerWidth',{configurable:true,value:1366});
  Object.defineProperty(w,'innerHeight',{configurable:true,value:820});
  const state=new Map(Object.entries(overrides.saved||{}));
  const cmds=[];
  w.GM_getValue=(k,f)=>state.has(k)?state.get(k):f;
  w.GM_setValue=(k,v)=>state.set(k,v);
  w.GM_registerMenuCommand=(name,fn)=>cmds.push({name,fn});
  w.setInterval=()=>1; // no background jobs in test runner
  const media=w.document.querySelector('video');
  let playing=false,played=0,paused=0;
  Object.defineProperties(media,{
    paused:{configurable:true,get:()=>!playing},
    duration:{configurable:true,get:()=>220},
    volume:{configurable:true,value:.7,writable:true}
  });
  media.play=()=>{playing=true;played++;return Promise.resolve()};
  media.pause=()=>{playing=false;paused++};
  w.eval(source);
  await wait(25);
  const host=w.document.querySelector('#ums-youtube-studio-host');
  return {dom,w,media,state,cmds,host,sh:host?.shadowRoot,stats:()=>({played,paused,playing})};
}
function close(c){c.dom.window.close()}
const $=(c,id)=>c.sh.getElementById(id);
function pointer(w,el,type,x,y){
 const e=new w.Event(type,{bubbles:true,cancelable:true});
 for(const [key,value] of Object.entries({clientX:x,clientY:y,pointerId:1,button:0}))
 Object.defineProperty(e,key,{value});
 el.dispatchEvent(e);
}
test('only YouTube is targeted, never YouTube Music',()=>{
  assert.match(source,/@match\s+https:\/\/www.youtube.com\/\*/);
  assert.doesNotMatch(source,/@match\s+https:\/\/music.youtube.com\/\*/);
  assert.match(source,/@updateURL\s+https:\/\/raw.githubusercontent.com/);
  assert.doesNotMatch(source,/GM_xmlhttpRequest|document\.cookie/);
});
test('launcher and real panel are visible after initial injection',async()=>{
 const c=await boot();try{
  assert.ok(c.host?.isConnected);
  assert.ok($(c,'launcher'));
  assert.equal($(c,'panel').hidden,false);
  assert.equal($(c,'panel').style.position,''); // position comes from shadow stylesheet
  assert.equal(c.sh.querySelector('#launcher').textContent.includes('STUDIO'),true);
  assert.equal(c.media.isConnected,true);
 }finally{close(c)}
});
test('closed state preserves launcher on reload and can reopen',async()=>{
 const c=await boot({saved:{'ums-youtube-v1':{open:false}}});try{
  assert.equal($(c,'panel').hidden,true);
  assert.ok($(c,'launcher').isConnected);
  $(c,'launcher').click();
  assert.equal($(c,'panel').hidden,false);
  assert.equal(c.state.get('ums-youtube-v1').open,true);
 }finally{close(c)}
});
test('native playback/pause operate on original media element',async()=>{
 const c=await boot();try{
  assert.equal(c.stats().played,0);
  $(c,'play').click();assert.equal(c.stats().played,1);
  $(c,'play').click();assert.equal(c.stats().paused,1);
  assert.ok(c.media.isConnected);
 }finally{close(c)}
});
test('seek/volume and skip time modify native media properties',async()=>{
 const c=await boot();try{
  c.media.currentTime=30;
  $(c,'back').click();assert.equal(c.media.currentTime,20);
  $(c,'ahead').click();assert.equal(c.media.currentTime,30);
  const seek=$(c,'seek');seek.value='500';seek.dispatchEvent(new c.w.Event('input'));
  assert.equal(c.media.currentTime,110);
  const v=$(c,'volume');v.value='35';v.dispatchEvent(new c.w.Event('input'));
  assert.equal(c.media.volume,.35);
 }finally{close(c)}
});
test('save music as a YouTube link with title and category, not fake YouTube Music sync',async()=>{
 const c=await boot();try{
  $(c,'saveMusic').click();
  const items=c.state.get('ums-saved-youtube-v1');
  assert.equal(items.length,1);
  assert.equal(items[0].type,'music');
  assert.equal(items[0].id,VIDEO_ID);
  assert.equal(items[0].title,'Probando una canción');
  c.sh.querySelector('[data-tab="library"]').click();
  const links=c.sh.querySelectorAll('#favorites a.link');
  assert.equal(links.length,1);
  assert.equal(new URL(links[0].href).searchParams.get('v'),VIDEO_ID);
 }finally{close(c)}
});
test('library deduplicates and category filters; removing a favorite persists',async()=>{
 const c=await boot();try{
  $(c,'saveMusic').click();$(c,'saveVideo').click();
  assert.equal(c.state.get('ums-saved-youtube-v1').length,1);
  assert.equal(c.state.get('ums-saved-youtube-v1')[0].type,'video');
  c.sh.querySelector('[data-tab="library"]').click();
  c.sh.querySelector('[data-filter="music"]').click();
  assert.equal(c.sh.querySelectorAll('#favorites .saved').length,0);
  c.sh.querySelector('[data-filter="video"]').click();
  assert.equal(c.sh.querySelectorAll('#favorites .saved').length,1);
  c.sh.querySelector('#favorites .remove').click();
  assert.equal(c.state.get('ums-saved-youtube-v1').length,0);
 }finally{close(c)}
});
test('native playlists are links, with no invented account data',async()=>{
 const c=await boot();try{
  c.sh.querySelector('[data-tab="library"]').click();
  const links=[...c.sh.querySelectorAll('#playlists a.link')];
  assert.equal(links[0].textContent,'Mi playlist');
  assert.equal(new URL(links[0].href).searchParams.get('list'),'PLabc');
  assert.ok(links.some(x=>x.textContent.includes('biblioteca original')));
 }finally{close(c)}
});
test('appearance preferences toggle independently and restore without removing YouTube nodes',async()=>{
 const c=await boot();try{
  c.sh.querySelector('[data-tab="design"]').click();
  const focus=$(c,'focus');focus.checked=true;focus.dispatchEvent(new c.w.Event('change'));
  assert.equal(c.w.document.documentElement.dataset.umsFocus,'true');
  assert.equal(c.w.document.documentElement.dataset.umsComments,'true');
  $(c,'reset').click();
  assert.equal(c.w.document.documentElement.dataset.umsFocus,'false');
  assert.equal(c.w.document.documentElement.dataset.umsRelated,'false');
  assert.equal(c.media.isConnected,true);
 }finally{close(c)}
});
test('dragging moves and persists window position',async()=>{
 const c=await boot();try{
  const handle=$(c,'handle'),left=parseInt($(c,'panel').style.left,10);
  pointer(c.w,handle,'pointerdown',40,40);
  pointer(c.w,handle,'pointermove',-10,72);
  pointer(c.w,handle,'pointerup',-10,72);
  assert.equal(parseInt($(c,'panel').style.left,10),left-50);
  assert.equal(c.state.get('ums-youtube-v1').x,left-50);
 }finally{close(c)}
});
test('keyboard Alt+Shift+Y toggles panel without disabling dock',async()=>{
 const c=await boot();try{
  const e=new c.w.KeyboardEvent('keydown',{key:'Y',code:'KeyY',altKey:true,shiftKey:true,bubbles:true});
  c.w.dispatchEvent(e);
  assert.equal($(c,'panel').hidden,true);
  assert.ok($(c,'launcher').isConnected);
 }finally{close(c)}
});
test('on a YouTube home page there is no fake playback or saved video',async()=>{
 const c=await boot({url:'https://www.youtube.com/'});try{
  $(c,'saveVideo').click();
  assert.equal(c.state.has('ums-saved-youtube-v1'),false);
  assert.match($(c,'status').textContent,/Abrí un video/);
 }finally{close(c)}
});
