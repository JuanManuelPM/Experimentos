import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

const source=readFileSync(fileURLToPath(new URL('../whatsapp-live.user.js',import.meta.url)),'utf8');
const nativeBlock=source.slice(source.indexOf('/* WML_NATIVE_STUDIO_V3'),
  source.indexOf('function init(){',source.indexOf('/* WML_NATIVE_STUDIO_V3')));
function fixture(){
 return '<!doctype html><html><head></head><body><div id="app"><div class="app-layout">'+
   '<aside class="rail">NAVEGACION</aside>'+
   '<div class="left-wrap"><div id="side">'+
   '<div class="native-header">NAV ORIGINAL</div>'+
   '<div id="pane-side"><div class="scroll-root">'+
   '<div role="row" id="chat-a"><span data-testid="cell-frame-title">Persona A</span>'+
   '<span data-testid="cell-frame-secondary">PRIVADO_A</span></div>'+
   '<div role="row" id="chat-b"><span data-testid="cell-frame-title">Persona B</span>'+
   '<span data-testid="cell-frame-secondary">PRIVADO_B</span></div>'+
   '</div></div></div></div><div id="native-right"></div></div></body></html>';
}
async function run(mode='canvas'){
 const dom=new JSDOM(fixture(),{url:'https://web.whatsapp.com/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;
 const saved=new Map([['wml-mode-v1',mode]]);
 w.GM_getValue=(key,fallback)=>saved.has(key)?saved.get(key):fallback;
 w.GM_setValue=(key,value)=>saved.set(key,value);
 w.GM_xmlhttpRequest=()=>{};
 w.GM_registerMenuCommand=()=>{};
 w.setInterval=()=>1;
 w.eval(source);
 await new Promise(r=>setTimeout(r,300));
 return {dom,w,saved};
}
test('Studio 3 mounts native list and leaves actual chat DOM in place',async()=>{
 const {dom,w}=await run();
 try{
  const sh=w.document.getElementById('wml-native-studio-host').shadowRoot;
  assert.ok(sh.getElementById('head'));
  assert.equal(sh.querySelectorAll('.person').length,0,'no copied contact buttons');
  assert.equal(w.document.querySelectorAll('#pane-side [data-wml-n3-row]').length,2);
  assert.equal(w.document.getElementById('chat-a').isConnected,true);
  assert.equal(sh.textContent.includes('Persona A'),false,'contact names remain native');
  assert.equal(sh.textContent.includes('PRIVADO_A'),false,'no copied message previews');
  assert.ok(w.document.getElementById('wml-native-studio-css'));
 }finally{dom.window.close();}
});
test('no programmatic contact clicking or event interception in native Studio module',()=>{
 assert.ok(nativeBlock.includes('event.isTrusted'),'only physical event observers');
 assert.ok(!/\.click\s*\(/.test(nativeBlock),'no synthetic click calls');
 assert.ok(!/new MouseEvent|dispatchEvent|stopPropagation|preventDefault\(\)/.test(
   nativeBlock.slice(nativeBlock.indexOf('function n3OnNativeClick'),nativeBlock.indexOf('function n3CheckOpened'))));
});
test('native row receives native handler and opens #main without cloning messages',async()=>{
 const {dom,w}=await run();
 try{
  const row=w.document.getElementById('chat-b');
  let calls=0;
  row.addEventListener('click',()=>{
   calls++;
   const main=w.document.createElement('div');
   main.id='main';
   main.innerHTML='<header><span>Persona B</span></header>'+
     '<div id="messages">MENSAJE ORIGINAL</div>'+
     '<footer><div contenteditable="true" role="textbox"></div></footer>';
   w.document.getElementById('native-right').replaceChildren(main);
  });
  row.querySelector('[data-testid="cell-frame-title"]').click();
  await new Promise(r=>setTimeout(r,250));
  assert.equal(calls,1);
  const main=w.document.getElementById('main');
  assert.ok(main?.querySelector('[contenteditable="true"]'));
  assert.equal(w.document.getElementById('messages').textContent,'MENSAJE ORIGINAL');
  assert.equal(w.document.getElementById('wml-native-studio-host').shadowRoot
    .getElementById('frame').dataset.chat,'true');
 }finally{dom.window.close();}
});
test('hides navigation siblings but keeps the native path to chat rows',async()=>{
 const {dom,w}=await run();
 try{
  const header=w.document.querySelector('#side .native-header');
  assert.equal(header.hasAttribute('data-wml-n3-chrome'),true);
  assert.equal(w.document.getElementById('pane-side').hasAttribute('data-wml-n3-chrome'),false);
  assert.equal(w.document.getElementById('chat-a').hasAttribute('data-wml-n3-row'),true);
  assert.equal(w.document.getElementById('chat-b').hasAttribute('data-wml-n3-row'),true);
 }finally{dom.window.close();}
});
test('Original removes visual Studio, retains WhatsApp nodes and clears layout variables',async()=>{
 const {dom,w,saved}=await run();
 try{
  const panel=w.document.getElementById('wml-live-root').shadowRoot;
  panel.querySelector('[data-mode="original"]').click();
  assert.equal(saved.get('wml-mode-v1'),'original');
  assert.equal(w.document.getElementById('wml-native-studio-host'),null);
  assert.equal(w.document.documentElement.style.getPropertyValue('--n3-x'),'');
  assert.equal(w.document.getElementById('chat-b').isConnected,true);
 }finally{dom.window.close();}
});
test('Studio drag moves both native side and chat via shared variables and saves position',async()=>{
 const {dom,w,saved}=await run();
 try{
  const sh=w.document.getElementById('wml-native-studio-host').shadowRoot;
  const head=sh.getElementById('head');
  const root=w.document.documentElement;
  const x=Number.parseInt(root.style.getPropertyValue('--n3-x'),10);
  const p=(type,a,b)=>{
   const ev=new w.Event(type,{bubbles:true});
   Object.defineProperties(ev,{clientX:{value:a},clientY:{value:b},pointerId:{value:1}});
   head.dispatchEvent(ev);
  };
  p('pointerdown',100,110);p('pointermove',140,110);p('pointerup',140,110);
  assert.equal(Number.parseInt(root.style.getPropertyValue('--n3-x'),10),x+40);
  assert.equal(saved.get('wml-native-studio-v3-layout').x,x+40);
 }finally{dom.window.close();}
});
test('native Studio not mounted in Original or Radical',async()=>{
 for(const m of ['original','radical']){
  const {dom,w}=await run(m);
  try{assert.equal(w.document.getElementById('wml-native-studio-host'),null);}
  finally{dom.window.close();}
 }
});
test('missing native contacts surface triggers an honest loading state',async()=>{
 const {dom,w}=await run();
 try{
  w.document.getElementById('side').remove();
  await new Promise(r=>setTimeout(r,280));
  const sh=w.document.getElementById('wml-native-studio-host').shadowRoot;
  assert.match(sh.getElementById('alertText').textContent,/Esperando carga/);
 }finally{dom.window.close();}
});
