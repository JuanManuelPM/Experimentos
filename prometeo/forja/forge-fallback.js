/* FORJA C102. WebGL2 unavailable? Show the independently tested 2D city, not a blank canvas.
   The preview is a DEMO, never an editable GLB scene or a proof of GPU rendering. */
(() => {
  'use strict';
  const status=document.getElementById('render-status');
  const frame=document.getElementById('forja-preview');
  const label=document.getElementById('forja-fallback-label');
  if(!status||!frame||!label)return;
  let activated=false;
  function sync(){
    const noGpu=/NO DISPONIBLE|CONTEXTO WEBGL PERDIDO/.test(status.textContent);
    frame.hidden=!noGpu;label.hidden=!noGpu;
    document.documentElement.classList.toggle('forja-no-gpu',noGpu);
    if(noGpu&&!activated){
      frame.src='./ciudad-viva/index.html';
      activated=true;
    }
  }
  new MutationObserver(sync).observe(status,{childList:true,characterData:true,subtree:true});
  sync();
})();
