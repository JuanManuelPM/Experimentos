/* Firefox MV3 event page. One click = one normal browser tab.
   No external pages are embedded and no contact/message data is read. */
(function(api){
 'use strict';
 async function openLauncher(){
  const url=api.runtime.getURL('launcher/index.html');
  const tabs=await api.tabs.query({});
  const existing=tabs.find(t=>t.url===url);
  if(existing){
   await api.windows.update(existing.windowId,{focused:true});
   await api.tabs.update(existing.id,{active:true});
   return {reused:true,tabId:existing.id};
  }
  const created=await api.tabs.create({url,active:true});
  return {reused:false,tabId:created.id};
 }
 api.action.onClicked.addListener(()=>{
  openLauncher().catch(err=>console.error('Universal UI: no se pudo abrir el escritorio',err));
 });
 globalThis.UUI_openLauncher=openLauncher; // test seam; never exposed to web pages
})(globalThis.browser||globalThis.chrome);
