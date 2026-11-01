(function(){
'use strict';
const api=globalThis.browser||globalThis.chrome,core=globalThis.FirefoxLauncher;
const status=document.getElementById('status');let busy=false;
const show=(msg,error=false)=>{status.textContent=msg;status.dataset.error=String(error)};
async function go(work){
 if(busy)return;busy=true;document.querySelectorAll('button').forEach(x=>x.disabled=true);
 show('Abriendo en Firefox…');
 try{show(await work());}catch(e){show('No se pudo completar: '+(e?.message||e),true)}
 finally{busy=false;document.querySelectorAll('button').forEach(x=>x.disabled=false)}
}
document.querySelectorAll('[data-cmd][data-app]').forEach(b=>{
 b.addEventListener('click',()=>go(async()=>{
  if(b.dataset.cmd==='window'){await core.newWindow(api,b.dataset.app);return 'Ventana nueva abierta.'}
  const result=await core.open(api,b.dataset.app);
  return result.reused?'Pestaña existente enfocada.':'Pestaña abierta.';
 }));
});
document.getElementById('settings').addEventListener('click',()=>go(async()=>{
 const url=api.runtime.getURL('popup/popup.html');
 const existing=(await api.tabs.query({})).find(t=>t.url===url);
 if(existing){
  await api.windows.update(existing.windowId,{focused:true});
  await api.tabs.update(existing.id,{active:true});
 } else await api.tabs.create({url,active:true});
 return 'Configuración abierta.';
}));
document.getElementById('pair').addEventListener('click',()=>go(async()=>{
 await core.pair(api,window.screen);
 return 'Dos ventanas preparadas. Ubuntu puede ajustar su ubicación.';
}));
document.getElementById('split').addEventListener('click',()=>go(async()=>{
 await core.prepareSplit(api);
 return 'Pestañas preparadas. En Firefox, Alt + clic sobre la pestaña ChatGPT.';
}));
})();
