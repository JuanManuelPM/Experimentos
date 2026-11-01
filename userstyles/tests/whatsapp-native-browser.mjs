import assert from 'node:assert/strict';
import {existsSync,readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright-core';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const script=readFileSync(fileURLToPath(new URL('../whatsapp-live.user.js',import.meta.url)),'utf8');
const paths=[
 process.env.CHROME_BIN,
 '/usr/bin/google-chrome',
 '/usr/bin/google-chrome-stable',
 '/usr/bin/chromium',
 '/opt/google/chrome/chrome'
].filter(Boolean);
const executablePath=paths.find(p=>existsSync(p));
assert.ok(executablePath,'A Chromium/Chrome real is required. Browser test cannot be skipped.');

const browser=await chromium.launch({headless:true,executablePath,
 args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
try{
 await page.setContent(\`<!doctype html><html><head><style>
 *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;}
 body{background:#252b30;font-family:Arial}
 #app{display:flex;height:100vh;overflow:hidden;}
 .nav{width:56px;flex:0 0 56px;background:#182128;}
 #left-container{width:460px;overflow:hidden;display:flex}
 #side{width:460px;height:100%;background:#27333a;display:flex;flex-direction:column}
 .native-header{height:78px;background:#39515b;}
 #pane-side{height:calc(100% - 78px);overflow-y:auto;}
 .row{width:100%;height:60px;display:flex;align-items:center;padding:9px 14px;cursor:pointer;color:white}
 .row:hover{background:#41505e}
 .avatar{width:36px;height:36px;border-radius:50%;background:#7991a4;margin-right:16px}
 .meta{display:flex;flex-direction:column;gap:4px}.preview{font-size:11px;color:#9aa}
 #native-right{flex:1;min-width:0;background:#293943}
 #main{display:flex;flex-direction:column;height:100%;width:100%;background:#203749}
 #main header{padding:16px;color:#fff;background:#284253}
 #messages{flex:1;padding:20px;color:#d5e6f3}
 #main footer{padding:16px;background:#284253}
 #main footer [contenteditable]{background:#152b38;color:white;padding:9px;outline:1px solid #91a}
 </style></head><body><div id="app"><aside class="nav">NAV</aside>
 <div id="left-container"><section id="side"><div class="native-header">WHATSAPP SEARCH/NAV</div>
 <div id="pane-side">
 <div class="row" role="row" id="chat-a"><div class="avatar"></div><div class="meta"><span data-testid="cell-frame-title">Persona A</span><span class="preview">PRIVADO A</span></div></div>
 <div class="row" role="row" id="chat-b"><div class="avatar"></div><div class="meta"><span data-testid="cell-frame-title">Persona B</span><span class="preview">PRIVADO B</span></div></div>
 </div></section></div><div id="native-right"></div></div></body></html>\`);
 await page.evaluate(()=>{
  const store=new Map([['wml-mode-v1','canvas']]);
  window.GM_getValue=(k,d)=>store.has(k)?store.get(k):d;
  window.GM_setValue=(k,v)=>{store.set(k,v);};
  window.GM_xmlhttpRequest=()=>{};
  window.GM_registerMenuCommand=()=>{};
  window.nativeEvents=[];
  document.getElementById('pane-side').addEventListener('click',event=>{
   const row=event.target.closest('[role="row"]');
   if(!row)return;
   window.nativeEvents.push({trusted:event.isTrusted,target:row.id,type:event.type});
   const main=document.createElement('section');
   main.id='main';
   main.innerHTML='<header>'+row.querySelector('[data-testid="cell-frame-title"]').textContent+
     '</header><div id="messages">Mensaje del chat seleccionado</div>'+
     '<footer><div contenteditable="true" role="textbox"></div></footer>';
   document.getElementById('native-right').replaceChildren(main);
  });
 });
 await page.addScriptTag({content:script});
 await page.waitForSelector('#wml-native-studio-host');
 await page.waitForSelector('#pane-side [data-wml-n3-row]');
 const before=await page.locator('#side').boundingBox();
 assert.ok(before && Math.abs(before.width-286)<5,'Native side should be 286px wide, not old WhatsApp width');
 const nativeRows=page.locator('#pane-side [data-wml-n3-row]');
 assert.equal(await nativeRows.count(),2);
 // This is an actual Chromium pointer action. The native row's listener
 // must receive isTrusted=true; proxy .click() would not.
 await page.locator('#chat-b').click();
 await page.waitForSelector('#main footer [contenteditable="true"]',{state:'visible'});
 const events=await page.evaluate(()=>window.nativeEvents);
 assert.deepEqual(events,[{trusted:true,target:'chat-b',type:'click'}]);
 const main=await page.locator('#main').boundingBox();
 const side=await page.locator('#side').boundingBox();
 assert.ok(main&&side);
 assert.ok(Math.abs(main.x-(side.x+side.width))<4,
   'Native conversation must be visually aligned to the right of contacts');
 await page.locator('#main footer [contenteditable="true"]').fill('Texto de prueba, sin enviar');
 assert.equal(await page.locator('#main footer [contenteditable="true"]').innerText(),
   'Texto de prueba, sin enviar');
 const head=page.locator('#wml-native-studio-host').locator('#head');
 const headBox=await head.boundingBox();
 assert.ok(headBox);
 await page.mouse.move(headBox.x+50,headBox.y+55);
 await page.mouse.down();
 await page.mouse.move(headBox.x+95,headBox.y+75,{steps:5});
 await page.mouse.up();
 const moved=await page.locator('#side').boundingBox();
 const movedChat=await page.locator('#main').boundingBox();
 assert.ok(moved && moved.x>side.x+25,'drag changes real side position');
 assert.ok(movedChat && Math.abs(movedChat.x-(moved.x+moved.width))<4,
   'drag keeps real chat attached');
 const screenshot=resolve(process.cwd(),'studio-3-native-browser.png');
 await page.screenshot({path:screenshot});
 await page.locator('#wml-native-studio-host').locator('#settings').click();
 await page.locator('#wml-live-root').locator('[data-mode="original"]').click();
 assert.equal(await page.locator('#wml-native-studio-host').count(),0);
 assert.equal(await page.locator('#chat-b').count(),1);
 console.log('PASS: trusted physical native click, exact chat target, native composer, visual alignment, drag, Original. Screenshot: '+screenshot);
}finally{
 await browser.close();
}
