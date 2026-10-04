(()=>{
'use strict';
const root=document.getElementById('labRoot'),q=s=>root.querySelector(s);
const p=window.DEMO_ENGINE_V4_POINTERS||{},g=window.DEMO_ENGINE_V4_GESTURES||{};
const pointerAssets={arrow:{src:p.arrow,hotspot:[9,8],size:52},hand:{src:p.hand,hotspot:[24,5],size:52},grab:{src:p.grab,hotspot:[26,22],size:52},grabbing:{src:p.grabbing,hotspot:[26,22],size:52},text:{src:p.text,hotspot:[26,26],size:52},'resize-ew':{src:p['resize-ew'],hotspot:[26,26],size:52},'resize-ns':{src:p['resize-ns'],hotspot:[26,26],size:52},'resize-d1':{src:p['resize-d1']||p['resize-ew'],hotspot:[26,26],size:52}};
const gestureAssets={point:g.point,approve:g.thumb_up,wave:g.wave,ok:g.ok,snap:g.snap};

const reply=q('[data-demo-id="reply.box"]'),sent=q('[data-demo-id="reply.sent"]');
q('[data-demo-id="mail.reply"]').onclick=()=>{reply.hidden=false;sent.hidden=true};
q('[data-demo-id="reply.send"]').onclick=()=>{reply.hidden=true;sent.hidden=false};
q('[data-demo-id="settings.save"]').onclick=()=>q('[data-demo-id="settings.state"]').textContent='guardado ✓';
q('[data-demo-id="task.drop"]').addEventListener('drop',()=>{q('[data-demo-id="task.drag"]').textContent='Revisar motion ✓';q('[data-demo-id="task.drag"]').classList.add('done')});

const recipe={
 demo:'WINDOW LAB V2',
 preset:'TEACH',
 steps:[
  {say:'El autor pide mostrar y activar. El motor decide el resto.',show:'mail.reply'},
  {activate:'mail.reply'},
  {enter:{target:'reply.input',text:'Esto ya se produce desde una receta semántica.'}},
  {activate:'reply.send'},
  {showResult:'reply.sent'},

  {say:'Ahora el target está dentro de una lista scrolleable.',show:'mail.goal',method:'focus'},

  {say:'El siguiente target está debajo del fold. Primero scrolleo la página y recién después actúo.',show:'settings.save',method:'focus'},
  {set:{target:'settings.mode',value:'Teach'}},
  {set:{target:'settings.speed',value:72}},
  {set:{target:'settings.guides',value:true}},
  {activate:'settings.save'},
  {showResult:'settings.state'},

  {say:'Drag y resize ya no usan láser. La acción misma tiene que explicar lo que pasa.'},
  {drag:{from:'task.drag',to:'task.drop',duration:1000}},
  {resize:{target:'resize.box',width:250,height:135,duration:1000}},

  {say:'El láser queda reservado para marcar. Acá el pointer y la tinta comparten exactamente el mismo timeline.'},
  {annotate:{target:'file.one',type:'box',hold:850}},
  {show:'file.one',method:'focus',hold:1000},
  {say:'Fin. Si muteás el audio, la demo sigue siendo comprensible.'}
 ]};

function resetWorld(){
 q('[data-demo-page-scroll]').scrollTop=0;q('[data-demo-id="mail.list"]').scrollTop=0;
 reply.hidden=true;sent.hidden=true;q('[data-demo-id="reply.input"]').value='';
 q('[data-demo-id="settings.mode"]').value='Calm';q('[data-demo-id="settings.speed"]').value='38';q('[data-demo-id="settings.guides"]').checked=false;q('[data-demo-id="settings.state"]').textContent='sin cambios';
 const d=q('[data-demo-id="task.drag"]');d.textContent='Revisar motion';d.classList.remove('done','is-dragging');d.style.transform='';
 const r=q('[data-demo-id="resize.box"]');r.style.width='170px';r.style.height='90px';
}
const engine=new DemoEngineV5(root,{title:'WINDOW LAB V2',steps:[]},{preset:'TEACH',pointerAssets,gestureAssets,abortOnHuman:false,audio:{enabled:true,profile:'RETRO_OS',textVoice:true},onReset:resetWorld});
engine.setRecipe(recipe);engine.reset();

q('#runBtn').onclick=()=>{engine.audio.ensure();engine.setRecipe({...recipe,preset:q('#preset').value});engine.reset();engine.play(0)};
q('#resetBtn').onclick=()=>engine.reset();
q('#audioBtn').onclick=e=>{engine.audio.setEnabled(!engine.audio.enabled);e.currentTarget.textContent=engine.audio.enabled?'AUDIO ✓':'AUDIO ×'};
q('#manifestBtn').onclick=()=>{const el=q('#manifest');el.hidden=!el.hidden;if(!el.hidden)el.textContent=JSON.stringify(engine.inspectPage(),null,2)};
window.engine=engine;window.recipe=recipe;
})();