import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Builder,By,until} from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';

const script=readFileSync(fileURLToPath(new URL('../whatsapp-live.user.js',import.meta.url)),'utf8');
const opts=new firefox.Options().addArguments('--headless');
const driver=await new Builder().forBrowser('firefox').setFirefoxOptions(opts).build();
try {
 await driver.manage().window().setRect({width:1280,height:800});
 const html=[
 '<!doctype html><html><head><style>',
 '*,*::before,*::after{box-sizing:border-box}html,body{margin:0;height:100%}',
 '#app{display:flex;height:100vh;overflow:hidden;isolation:isolate}',
 '.nav{width:46px;flex:0 0 46px;background:#152128}',
 '#left{width:430px;flex:0 0 430px}',
 '#side{height:100%;width:430px;background:#26343d}',
 '.native-header{height:75px;background:#243746}',
 '#pane-side{height:calc(100% - 75px);overflow:auto}',
 '[role=row]{height:65px;padding:20px;background:#243744;color:white;cursor:pointer}',
 '#main{display:flex;flex-direction:column;background:#1c3646;height:100%;width:100%}',
 '#main header{height:60px;background:#294453;color:white;padding:18px}',
 '#messages{flex:1;color:white;padding:12px}',
 '#main footer{height:65px;background:#1a3340;padding:12px}',
 '[contenteditable]{background:#0a202e;color:white;padding:8px}',
 '#right{flex:1;display:flex}',
 '</style></head><body><div id="app"><aside class="nav"></aside>',
 '<div id="left"><section id="side">',
 '<div class="native-header">Navegación original</div>',
 '<div id="pane-side"><div role="row" id="chat-a">',
 '<span data-testid="cell-frame-title">Persona A</span></div>',
 '<div role="row" id="chat-b"><span data-testid="cell-frame-title">Persona B</span>',
 '</div></div></section></div><div id="right"></div></div></body></html>'
 ].join('');
 await driver.get('data:text/html;charset=utf-8,'+encodeURIComponent(html));
 await driver.executeScript(function(){
  const saved=new Map([['wml-mode-v1','canvas']]);
  window.GM_getValue=(k,d)=>saved.has(k)?saved.get(k):d;
  window.GM_setValue=(k,v)=>saved.set(k,v);
  window.GM_xmlhttpRequest=()=>{};
  window.GM_registerMenuCommand=()=>{};
  window.nativeEvents=[];
  document.getElementById('pane-side').addEventListener('click',event=>{
    const row=event.target.closest('[role="row"]');if(!row)return;
    window.nativeEvents.push({trusted:event.isTrusted,target:row.id});
    const main=document.createElement('section');main.id='main';
    const name=row.querySelector('[data-testid="cell-frame-title"]').textContent;
    main.innerHTML='<header>'+name+'</header><div id="messages">Chat nativo</div>'+
      '<footer><div contenteditable="true" role="textbox"></div></footer>';
    document.getElementById('right').replaceChildren(main);
  });
 });
 await driver.executeScript(script);
 await driver.wait(until.elementLocated(By.css('#pane-side [data-wml-n3-row]')),9000);
 const visibleNames=await driver.executeScript(function(){
   const row=document.getElementById('chat-b');const b=row.getBoundingClientRect();
   const hit=document.elementFromPoint(b.left+65,b.top+12);
   return {hit:hit===row||row.contains(hit),
     pseudo:getComputedStyle(document.body,'::before').content};
 });
 assert.equal(visibleNames.hit,true,'Firefox native contacts must be visibly clickable');
 assert.equal(visibleNames.pseudo,'none','No fullscreen black cover');
 const row=await driver.findElement(By.id('chat-b'));
 await row.click();
 await driver.wait(until.elementLocated(By.css('#main footer [contenteditable="true"]')),9000);
 const result=await driver.executeScript(function(){
   const a=document.getElementById('side').getBoundingClientRect();
   const b=document.getElementById('main').getBoundingClientRect();
   return {events:window.nativeEvents,side:{x:a.x,w:a.width},
     main:{x:b.x,w:b.width},
     title:document.querySelector('#main header')?.textContent};
 });
 assert.deepEqual(result.events,[{trusted:true,target:'chat-b'}]);
 assert.equal(result.title,'Persona B');
 const chatHit=await driver.executeScript(function(){
   const main=document.getElementById('main'),b=main.getBoundingClientRect();
   const hit=document.elementFromPoint(b.left+b.width/2,b.top+90);
   return hit===main||main.contains(hit);
 });
 assert.equal(chatHit,true,'Firefox native chat must be visibly on top');
 assert.ok(Math.abs(result.main.x-result.side.x-result.side.w)<5,
   'Firefox must place native conversation flush right of native contacts');
 const editor=await driver.findElement(By.css('#main footer [contenteditable="true"]'));
 await editor.sendKeys('Texto de prueba Firefox');
 assert.ok((await editor.getText()).includes('Texto de prueba Firefox'));
 const img=await driver.takeScreenshot();
 writeFileSync('studio-3-native-firefox.png',Buffer.from(img,'base64'));
 const sh=await (await driver.findElement(By.id('wml-native-studio-host'))).getShadowRoot();
 await (await sh.findElement(By.css('#settings'))).click();
 const menu=await (await driver.findElement(By.id('wml-live-root'))).getShadowRoot();
 await (await menu.findElement(By.css('[data-mode="original"]'))).click();
 assert.equal((await driver.findElements(By.id('wml-native-studio-host'))).length,0);
 assert.equal((await driver.findElements(By.id('chat-b'))).length,1);
 console.log('PASS FIREFOX: direct trusted native click, correct chat, composer typing, aligned native panels, Original');
}finally{
 await driver.quit();
}
