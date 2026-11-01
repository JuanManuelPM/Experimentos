/* Universal UI launcher: tabs and windows only, no page data or messages. */
(function(root,factory){const lib=factory();root.FirefoxLauncher=lib;if(typeof module==='object'&&module.exports)module.exports=lib;})(globalThis,function(){
'use strict';
const APPS=Object.freeze({whatsapp:{url:'https://web.whatsapp.com/',host:'web.whatsapp.com'},chatgpt:{url:'https://chatgpt.com/',host:'chatgpt.com'}});
const PAIR_KEY='uui-launcher-pair-v1';
function get(id){if(!Object.prototype.hasOwnProperty.call(APPS,id))throw Error('Aplicación desconocida');return APPS[id]}
function matches(url,id){try{const u=new URL(url);return u.protocol==='https:'&&(u.hostname===get(id).host||(id==='chatgpt'&&u.hostname==='chat.openai.com'));}catch(_){return false}}
async function open(api,id){
 const tabs=await api.tabs.query({});
 const t=tabs.find(x=>matches(x.url,id));
 if(t){await api.windows.update(t.windowId,{focused:true});await api.tabs.update(t.id,{active:true});return {reused:true,tabId:t.id};}
 const created=await api.tabs.create({url:get(id).url,active:true});
 return {reused:false,tabId:created.id};
}
async function newWindow(api,id){
 const w=await api.windows.create({url:get(id).url,type:'normal',focused:true});
 if(w?.id==null)throw Error('Firefox no creó la ventana');return {windowId:w.id};
}
function geometry(screen){
 const left=Number(screen?.availLeft)||0,top=Number(screen?.availTop)||0;
 const width=Math.max(800,Math.floor(Number(screen?.availWidth)||1280));
 const height=Math.max(540,Math.floor(Number(screen?.availHeight)||800));
 const half=Math.floor(width/2);
 return [{left,top,width:half,height},{left:left+half,top,width:width-half,height}];
}
async function oldWindow(api,id,wid){
 if(!Number.isInteger(wid))return null;
 try{
  const w=await api.windows.get(wid);
  if(!w||w.type!=='normal')return null;
  const tabs=await api.tabs.query({windowId:wid});
  return tabs.length===1&&matches(tabs[0].url,id)?w:null;
 }catch(_){return null}
}
async function pair(api,screen){
 const positions=geometry(screen);
 const state=(await api.storage.local.get(PAIR_KEY))[PAIR_KEY]||{};
 const ids=['whatsapp','chatgpt'],done=[];
 for(let i=0;i<ids.length;i++){
  const id=ids[i],pos=positions[i];
  let win=await oldWindow(api,id,state[id]);
  if(win){
   if(win.state!=='normal')await api.windows.update(win.id,{state:'normal'});
   await api.windows.update(win.id,pos);
  }else win=await api.windows.create({url:get(id).url,type:'normal',focused:false,...pos});
  if(win?.id==null)throw Error('No se pudo colocar '+id+'; hay '+done.length+' ventana(s) abierta(s)');
  done.push({app:id,id:win.id});
  // Checkpoint after each successful window. A partial failure must not create
  // duplicate Windows every time the user retries.
  state[id]=win.id;
  await api.storage.local.set({[PAIR_KEY]:state});
 }
 await api.windows.update(done[0].id,{focused:true});
 return {kind:'two-windows',windows:done};
}
async function prepareSplit(api){
 const window=await api.windows.getCurrent();
 const a=await api.tabs.create({url:get('whatsapp').url,windowId:window.id,active:true});
 const b=await api.tabs.create({url:get('chatgpt').url,windowId:window.id,active:false});
 return {tabs:[a.id,b.id],manual:true};
}
return {APPS,PAIR_KEY,matches,geometry,open,newWindow,pair,prepareSplit};
});
