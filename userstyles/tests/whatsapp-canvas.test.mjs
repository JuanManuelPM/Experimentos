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


test('filters navigation and unread-status rows instead of presenting them as contacts',async()=>{
  const {dom,w}=await run('canvas');
  try {
    const pane=w.document.getElementById('pane-side');
    const bad=w.document.createElement('div');
    bad.setAttribute('role','row');
    bad.innerHTML='<span title="Archived">Archived</span>';
    const unread=w.document.createElement('div');
    unread.setAttribute('role','row');
    unread.innerHTML='<span title="1 unread message">1 unread message</span>';
    pane.prepend(bad,unread);
    await new Promise(r=>setTimeout(r,250));
    const labels=[...w.document.getElementById('wml-canvas-host').shadowRoot.querySelectorAll('.person')]
      .map(e=>e.textContent);
    assert.deepEqual(labels,['Persona uno','Persona dos']);
  } finally {dom.window.close();}
});

test('search filters only custom name widgets without touching native WhatsApp rows',async()=>{
  const {dom,w}=await run('canvas');
  try {
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    const input=sh.getElementById('search');
    input.value='dos';
    input.dispatchEvent(new w.Event('input',{bubbles:true}));
    assert.deepEqual([...sh.querySelectorAll('.person')].map(e=>e.textContent),['Persona dos']);
    assert.equal(w.document.querySelector('#pane-side').children.length,2);
    input.value='';
    input.dispatchEvent(new w.Event('input',{bubbles:true}));
    assert.equal(sh.querySelectorAll('.person').length,2);
  } finally {dom.window.close();}
});

test('window drag updates position and persists design position, without moving WhatsApp nodes',async()=>{
  const {dom,w,saved}=await run('canvas');
  try {
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    const head=sh.getElementById('head');
    const frame=sh.getElementById('shell');
    const initial=parseInt(frame.style.left,10);
    const mouse=(type,x,y)=>{
      const e=new w.Event(type,{bubbles:true});
      Object.defineProperty(e,'clientX',{value:x});
      Object.defineProperty(e,'clientY',{value:y});
      Object.defineProperty(e,'pointerId',{value:1});
      head.dispatchEvent(e);
    };
    mouse('pointerdown',200,100);
    mouse('pointermove',235,100);
    mouse('pointerup',235,100);
    assert.equal(parseInt(frame.style.left,10),initial+35);
    assert.equal(saved.get('wml-studio-layout-v2').x,initial+35);
    assert.ok(w.document.getElementById('chat-one').isConnected);
  } finally {dom.window.close();}
});

test('native composer is present through transparent conversation pane, never copied',async()=>{
  const {dom,w}=await run('canvas');
  try {
    const main=w.document.createElement('section');
    main.id='main';
    main.innerHTML='<footer><div contenteditable="true"></div></footer>';
    w.document.getElementById('native-right').replaceChildren(main);
    await new Promise(r=>setTimeout(r,230));
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    assert.equal(sh.getElementById('shell').dataset.chat,'true');
    assert.ok(sh.innerHTML.includes('#shell[data-chat="true"]{background:transparent'));
    assert.ok(w.document.querySelector('#main footer [contenteditable="true"]'));
    assert.equal(sh.textContent.includes('PREVIEW_PRIVADO'),false);
    assert.equal(main.isConnected,true);
  } finally {dom.window.close();}
});


test('inner native chat title opens the correct conversation when outer row has no handler',async()=>{
  const {dom,w}=await run('canvas');
  try{
    let innerClicks=0, outerClicks=0;
    const row=w.document.getElementById('chat-two');
    row.addEventListener('click',event=>{if(event.target===row)outerClicks++;});
    row.querySelector('[data-testid="cell-frame-title"]').addEventListener('click',()=>{
      innerClicks++;
      row.setAttribute('aria-selected','true');
      const main=w.document.createElement('section');
      main.id='main';
      main.innerHTML='<header><span title="Persona dos">Persona dos</span></header>'+
        '<footer><div contenteditable="true" role="textbox"></div></footer>';
      w.document.getElementById('native-right').replaceChildren(main);
    });
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    sh.querySelectorAll('.person')[1].click();
    await new Promise(r=>setTimeout(r,440));
    assert.equal(innerClicks,1,'inner title, not outer row, receives native click');
    assert.equal(outerClicks,0,'outer wrapper not used as event target');
    assert.equal(sh.getElementById('openNotice').hidden,true,'correct chat verified');
    assert.equal(sh.getElementById('shell').dataset.chat,'true');
    assert.ok(w.document.querySelector('#main footer [contenteditable="true"]'));
  }finally{dom.window.close();}
});

test('a click without native conversation confirmation shows an honest fallback',async()=>{
  const {dom,w,saved}=await run('canvas');
  try{
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    sh.querySelector('.person').click();
    assert.equal(sh.getElementById('openNotice').hidden,false,'pending state is visible');
    await new Promise(r=>setTimeout(r,2400));
    assert.equal(sh.getElementById('openNotice').hidden,false);
    assert.match(sh.getElementById('openText').textContent,/No pude confirmar/);
    const original=sh.getElementById('openOriginal');
    assert.equal(original.hidden,false);
    original.click();
    assert.equal(saved.get('wml-mode-v1'),'original');
    assert.equal(w.document.getElementById('wml-canvas-host'),null);
    assert.ok(w.document.getElementById('chat-one'));
  }finally{dom.window.close();}
});

test('existing unrelated chat does not count as confirmation',async()=>{
  const {dom,w}=await run('canvas');
  try{
    const old=w.document.createElement('section');
    old.id='main';
    old.innerHTML='<header><span title="Persona uno">Persona uno</span></header>'+
      '<footer><div contenteditable="true"></div></footer>';
    w.document.getElementById('native-right').replaceChildren(old);
    const sh=w.document.getElementById('wml-canvas-host').shadowRoot;
    sh.querySelectorAll('.person')[1].click();
    await new Promise(r=>setTimeout(r,2450));
    assert.equal(sh.getElementById('openNotice').hidden,false);
    assert.match(sh.getElementById('openText').textContent,/No pude confirmar/);
  }finally{dom.window.close();}
});
