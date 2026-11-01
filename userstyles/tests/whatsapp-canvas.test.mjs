import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {JSDOM} from 'jsdom';

const source=readFileSync(fileURLToPath(new URL('../whatsapp-live.user.js',import.meta.url)),'utf8');
const fixture=()=>'<html><head></head><body><div id="app"><div class="layout">'+
  '<div id="left"><div id="side"><div id="pane-side">'+
  '<div role="row" id="chat-one"><span data-testid="cell-frame-title">Persona uno</span>'+
  '<span data-testid="cell-frame-secondary">PREVIEW_PRIVADO_1</span></div>'+
  '<div role="row" id="chat-two"><span data-testid="cell-frame-title">Persona dos</span>'+
  '<span data-testid="cell-frame-secondary">PREVIEW_PRIVADO_2</span></div>'+
  '</div></div></div><div id="native-right"></div></div></div></body></html>';

async function run(mode='canvas'){
  const dom=new JSDOM(fixture(),{url:'https://web.whatsapp.com/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  const saved=new Map([['wml-mode-v1',mode]]);
  const menus=new Map();
  w.GM_getValue=(k,f)=>saved.has(k)?saved.get(k):f;
  w.GM_setValue=(k,v)=>saved.set(k,v);
  w.GM_registerMenuCommand=(name,fn)=>menus.set(name,fn);
  w.GM_xmlhttpRequest=()=>{}; // no external networks
  w.setInterval=()=>1; // no hanging polling jobs in tests
  w.eval(source);
  await new Promise(r=>setTimeout(r,300));
  return {dom,w,saved,menus};
}

test('Canvas displays native chat names only; never copies previews',async()=>{
  const {dom,w}=await run('canvas');
  try{
    const root=w.document.getElementById('wml-canvas-host');
    assert.ok(root,'Canvas overlay was inserted');
    const items=[...root.shadowRoot.querySelectorAll('.person')].map(e=>e.textContent);
    assert.deepEqual(items,['Persona uno','Persona dos']);
    assert.equal(root.shadowRoot.textContent.includes('PREVIEW_PRIVADO'),false);
    assert.equal(w.document.querySelector('#pane-side').children.length,2,'native chat rows remain');
    assert.equal(root.shadowRoot.getElementById('right').dataset.chat,'false');
  }finally{dom.window.close();}
});

test('Click opens native WhatsApp row and reveals right conversation',async()=>{
  const {dom,w}=await run('canvas');
  try{
    let clicks=0;
    w.document.getElementById('chat-one').addEventListener('click',()=>{
      clicks++;
      const main=w.document.createElement('section');
      main.id='main';
      main.innerHTML='<footer><div contenteditable="true"></div></footer>';
      w.document.getElementById('native-right').replaceChildren(main);
    });
    const btn=w.document.getElementById('wml-canvas-host').shadowRoot.querySelector('.person');
    btn.click();
    await new Promise(r=>setTimeout(r,260));
    assert.equal(clicks,1,'native row receives the click');
    assert.equal(w.document.getElementById('wml-canvas-host').shadowRoot.getElementById('right').dataset.chat,'true');
  }finally{dom.window.close();}
});

test('Original removes Canvas entirely and leaves native chats untouched',async()=>{
  const {dom,w,saved}=await run('canvas');
  try{
    w.document.getElementById('wml-live-root').shadowRoot.querySelector('[data-mode="original"]').click();
    assert.equal(saved.get('wml-mode-v1'),'original');
    assert.equal(w.document.documentElement.dataset.wmlMode,'original');
    assert.equal(w.document.getElementById('wml-canvas-host'),null);
    assert.ok(w.document.getElementById('chat-one'));
    assert.ok(w.document.getElementById('chat-two'));
    assert.equal(w.document.documentElement.style.getPropertyValue('--wml-canvas-shift'),'');
  }finally{dom.window.close();}
});

test('Canvas is opt-in; Radical and Original modes do not mount it',async()=>{
  for(const m of ['radical','original']){
    const {dom,w}=await run(m);
    try{assert.equal(w.document.getElementById('wml-canvas-host'),null,'unexpected canvas in '+m);}
    finally{dom.window.close();}
  }
});
