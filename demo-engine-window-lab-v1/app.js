(()=>{
'use strict';
const root=document.getElementById('labRoot');
const q=s=>root.querySelector(s);
const pointerRaw=window.DEMO_ENGINE_V4_POINTERS||{};
const pointerAssets={
 arrow:{src:pointerRaw.arrow,hotspot:[9,8],size:52},
 hand:{src:pointerRaw.hand,hotspot:[24,5],size:52},
 grab:{src:pointerRaw.grab,hotspot:[26,22],size:52},
 grabbing:{src:pointerRaw.grabbing,hotspot:[26,22],size:52},
 text:{src:pointerRaw.text,hotspot:[26,26],size:52},
 'resize-ew':{src:pointerRaw['resize-ew'],hotspot:[26,26],size:52},
 'resize-ns':{src:pointerRaw['resize-ns'],hotspot:[26,26],size:52},
 'resize-d1':{src:pointerRaw['resize-d1']||pointerRaw['resize-ew'],hotspot:[26,26],size:52}
};
const g=window.DEMO_ENGINE_V4_GESTURES||{};
const gestureAssets={wave:g.wave,point:g.point,approve:g.thumb_up,reject:g.thumb_down,ok:g.ok,snap:g.snap};

const replyBox=q('[data-demo-id="reply.box"]');
q('[data-demo-id="mail.reply"]').addEventListener('click',()=>replyBox.hidden=false);
q('[data-demo-id="reply.send"]').addEventListener('click',()=>{
  const v=q('[data-demo-id="reply.input"]').value.trim();
  replyBox.hidden=true;
  q('[data-demo-id="reply.input"]').value='';
  q('[data-demo-caption]').textContent=v?'Respuesta enviada: '+v:'Respuesta enviada.';
});
q('[data-demo-id="mail.archive"]').addEventListener('click',()=>q('[data-demo-caption]').textContent='Mensaje archivado.');
q('[data-demo-id="settings.save"]').addEventListener('click',()=>q('[data-demo-id="settings.state"]').textContent='guardado ✓');

const drop=q('[data-demo-id="task.drop"]'),drag=q('[data-demo-id="task.drag"]');
drop.addEventListener('drop',()=>{
  drag.textContent='Revisar motion ✓';
  drag.classList.add('done');
});

q('[data-demo-id="mail.fullscreen"]').addEventListener('click',()=>{
  const w=q('[data-demo-id="widget.mail"]');
  w.classList.toggle('fullscreen-demo');
});

const script={
 title:'WINDOW LAB · FULL DEMO',
 seed:17,
 steps:[
  {action:'narrate',say:'Esta es una copia de la shell. Todo lo que ves existe para probar el motor.',hold:900},
  {action:'look',target:'widget.mail',hold:700},
  {action:'trace',target:'widget.mail',segmentDuration:300,hold:450},

  {action:'narrate',say:'Primero hago scroll dentro de una app, no sobre toda la página.',hold:700},
  {action:'scroll',target:'mail.list',toTarget:'mail.goal',observe:650},

  {action:'narrate',say:'Después abro una respuesta y escribo como humano.',hold:700},
  {action:'click',target:'mail.reply',guide:'ghost'},
  {action:'waitFor',condition:{target:'reply.box',visible:true,timeout:1500}},
  {action:'type',target:'reply.input',text:'Esto sirve para probar typing, targeting y espera.',human:true},
  {action:'click',target:'reply.send'},
  {action:'visualHold',ms:650},

  {action:'narrate',say:'Ahora pruebo controles comunes.',hold:650},
  {action:'click',target:'settings.mode'},
  {action:'select',target:'settings.mode',value:'Teach'},
  {action:'slider',target:'settings.speed',value:72},
  {action:'toggle',target:'settings.guides',value:true},
  {action:'click',target:'settings.save'},
  {action:'comment',target:'settings.state',text:'El motor puede actuar y después esperar el resultado.',tone:'good',hold:900},

  {action:'narrate',say:'Drag: la tarjeta queda pegada al cursor durante todo el trayecto.',hold:700},
  {action:'drag',from:'task.drag',to:'task.drop',duration:1000,guide:'laser'},
  {action:'visualHold',ms:750},

  {action:'narrate',say:'Resize: el borde y el cursor se mueven juntos.',hold:650},
  {action:'resize',target:'resize.box',width:255,height:135,duration:1050,guide:'arrow'},
  {action:'visualHold',ms:700},

  {action:'narrate',say:'También puedo señalar sin tocar: look, trace, comentario y cámara.',hold:700},
  {action:'look',target:'file.one',hold:700},
  {action:'trace',target:'file.one',segmentDuration:280,hold:450},
  {action:'comment',target:'file.one',text:'Comentario anclado sin tapar el objetivo.',hold:900},
  {action:'cameraFocus',target:'file.one',scale:1.08,hold:800},

  {action:'narrate',say:'Y los gestos quedan como narración, no como cursor permanente.',hold:700},
  {action:'gesture',name:'point',target:'file.one',hold:700},
  {action:'gesture',name:'approve',target:'settings.save',hold:850},
  {action:'narrate',say:'Fin. Esta página existe para romper y mejorar el motor sin tocar Prometeo.',hold:1100}
 ]};

function resetWorld(){
  q('[data-demo-id="mail.list"]').scrollTop=0;
  replyBox.hidden=true;
  q('[data-demo-id="reply.input"]').value='';
  q('[data-demo-id="settings.mode"]').value='Calm';
  q('[data-demo-id="settings.speed"]').value='38';
  q('[data-demo-id="settings.guides"]').checked=false;
  q('[data-demo-id="settings.state"]').textContent='sin cambios';
  drag.textContent='Revisar motion';
  drag.classList.remove('done','is-dragging');
  drag.style.transform='';
  drop.classList.remove('drop-active');
  const rb=q('[data-demo-id="resize.box"]');
  rb.style.width='170px';rb.style.height='90px';
}
const engine=new DemoEngineV4(root,script,{preset:'TEACH',pointerAssets,gestureAssets,abortOnHuman:false,onReset:resetWorld});
q('#runBtn').addEventListener('click',()=>{engine.reset();engine.play(0)});
q('#pauseBtn').addEventListener('click',()=>engine.pause());
q('#resumeBtn').addEventListener('click',()=>engine.resume());
q('#resetBtn').addEventListener('click',()=>engine.reset());
engine.reset();
window.engine=engine;
})();