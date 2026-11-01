import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const launcher=require('../extension/launcher/launcher-core.js');
function mock(){
 let nextTab=10,nextWindow=5;
 const calls=[], tabs=[], windows=[];
 const saved={};
 const api={
  tabs:{
   async query(q={}){return tabs.filter(t=>q.windowId===undefined||t.windowId===q.windowId)},
   async create(d){calls.push(['tab.create',d]);const t={id:nextTab++,windowId:d.windowId??1,url:d.url,active:d.active};tabs.push(t);return t},
   async update(id,d){calls.push(['tab.update',id,d]);return {id,...d}}
  },
  windows:{
   async create(d){calls.push(['window.create',d]);const w={id:nextWindow++,type:d.type||'normal',state:'normal'};windows.push(w);
    if(d.url)tabs.push({id:nextTab++,windowId:w.id,url:d.url});
    return w},
   async get(id){const w=windows.find(x=>x.id===id);if(!w)throw Error('Not found');return w},
   async getCurrent(){return {id:1}},
   async update(id,d){calls.push(['window.update',id,d]);return {id,...d}}
  },
  storage:{local:{
   async get(k){return {[k]:saved[k]}},
   async set(o){Object.assign(saved,o)}
  }}
 };
 return {api,tabs,windows,calls,saved};
}
test('URL matching is exact host and https (no lookalike phishing host)',()=>{
 assert.equal(launcher.matches('https://web.whatsapp.com/?a=1','whatsapp'),true);
 assert.equal(launcher.matches('https://chatgpt.com/c/test','chatgpt'),true);
 assert.equal(launcher.matches('https://chat.openai.com/','chatgpt'),true);
 for(const url of ['https://web.whatsapp.com.bad.site/','http://web.whatsapp.com/','https://evil-chatgpt.com/']){
  assert.equal(launcher.matches(url,'whatsapp'),false);
  assert.equal(launcher.matches(url,'chatgpt'),false);
 }
 assert.equal(launcher.matches('https://chatgpt.com/','evil'),false);
});
test('Abrir uses existing WhatsApp tab and focuses it, never duplicates',async()=>{
 const m=mock();m.tabs.push({id:9,windowId:4,url:'https://web.whatsapp.com/',active:false});
 const r=await launcher.open(m.api,'whatsapp');
 assert.equal(r.reused,true);
 assert.deepEqual(m.calls,[['window.update',4,{focused:true}],['tab.update',9,{active:true}]]);
});
test('Abrir creates a tab if app is not open',async()=>{
 const m=mock(),r=await launcher.open(m.api,'chatgpt');
 assert.equal(r.reused,false);
 assert.equal(m.tabs[0].url,'https://chatgpt.com/');
 assert.equal(m.calls.length,1);
});
test('Nueva ventana creates Firefox normal window, never an iframe',async()=>{
 const m=mock();const r=await launcher.newWindow(m.api,'whatsapp');
 assert.equal(m.windows.length,1);assert.equal(m.windows[0].id,r.windowId);
 assert.equal(m.calls[0][1].url,'https://web.whatsapp.com/');
});
test('Paralelo makes two independent adjacent Firefox windows',async()=>{
 const m=mock();const r=await launcher.pair(m.api,{availWidth:1440,availHeight:900,availLeft:80,availTop:30});
 assert.equal(r.kind,'two-windows');
 const created=m.calls.filter(c=>c[0]==='window.create');
 assert.equal(created.length,2);
 assert.deepEqual([created[0][1].left,created[0][1].width,created[1][1].left,created[1][1].width],[80,720,800,720]);
 assert.equal(m.saved[launcher.PAIR_KEY].whatsapp,r.windows[0].id);
 assert.equal(m.saved[launcher.PAIR_KEY].chatgpt,r.windows[1].id);
});
test('Reopening parallel layout reuses only its previous dedicated single-tab windows',async()=>{
 const m=mock();
 await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 assert.equal(m.calls.filter(c=>c[0]==='window.create').length,2);
 assert.equal(m.calls.filter(c=>c[0]==='window.update'&&c[2]?.width).length,2);
});
test('If a pair window has another tab, do not reposition that unrelated window',async()=>{
 const m=mock();
 const first=await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 m.tabs.push({id:99,windowId:first.windows[0].id,url:'https://example.org/'});
 await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 assert.equal(m.calls.filter(c=>c[0]==='window.create').length,3);
 assert.equal(m.calls.filter(c=>c[0]==='window.update'&&c[1]===first.windows[0].id&&c[2]?.width).length,0);
});
test('Window closed before a pair run gets recreated without closing any other window',async()=>{
 const m=mock();
 const r=await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 m.windows.splice(m.windows.findIndex(w=>w.id===r.windows[1].id),1);
 await launcher.pair(m.api,{availWidth:1200,availHeight:700});
 assert.equal(m.calls.filter(c=>c[0]==='window.create').length,3);
 assert.equal(m.calls.some(c=>c[0]==='window.remove'),false);
});
test('Native Split View is never claimed automated, only tabs are prepared',async()=>{
 const m=mock();const r=await launcher.prepareSplit(m.api);
 assert.equal(r.manual,true);assert.equal(r.tabs.length,2);
 assert.equal(m.calls.filter(c=>c[0]==='tab.create').length,2);
 assert.equal(m.calls.filter(c=>c[0].includes('split')).length,0);
});
