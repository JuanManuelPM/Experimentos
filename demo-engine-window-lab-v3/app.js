(()=>{
'use strict';

const root=document.getElementById('labRoot');
const q=s=>root.querySelector(s);
const p=window.DEMO_ENGINE_V4_POINTERS||{},g=window.DEMO_ENGINE_V4_GESTURES||{};

const pointerAssets={
  arrow:{src:p.arrow,hotspot:[9,8],size:48},
  hand:{src:p.hand,hotspot:[22,5],size:48},
  grab:{src:p.grab,hotspot:[24,21],size:48},
  grabbing:{src:p.grabbing,hotspot:[24,21],size:48},
  text:{src:p.text,hotspot:[24,24],size:48},
  'resize-ew':{src:p['resize-ew'],hotspot:[24,24],size:48},
  'resize-ns':{src:p['resize-ns'],hotspot:[24,24],size:48},
  'resize-d1':{src:p['resize-d1']||p['resize-ew'],hotspot:[24,24],size:48}
};
const gestureAssets={point:g.point,approve:g.thumb_up,wave:g.wave,ok:g.ok,snap:g.snap};

const reply=q('[data-demo-id="reply.box"]');
const sent=q('[data-demo-id="reply.sent"]');
const drag=q('[data-demo-id="task.drag"]');
const drop=q('[data-demo-id="task.drop"]');
const resizeBox=q('[data-demo-id="resize.box"]');
const runBtn=q('#runBtn');
const cancelBtn=q('#cancelBtn');

q('[data-demo-id="mail.reply"]').onclick=()=>{reply.hidden=false;sent.hidden=true};
q('[data-demo-id="reply.send"]').onclick=()=>{reply.hidden=true;sent.hidden=false};
q('[data-demo-id="settings.save"]').onclick=()=>q('[data-demo-id="settings.state"]').textContent='guardado ✓';
drop.addEventListener('drop',()=>{drag.textContent='Revisar motion ✓';drag.classList.add('muted')});

const scenes=[
  {name:'CLICK + TYPE',recipe:{demo:'01 · CLICK + TYPE',preset:'SHOWCASE',steps:[
    {say:'Click, escritura rápida y resultado.',show:'mail.reply',method:'look',hold:220},
    {activate:'mail.reply'},
    {enter:{target:'reply.input',text:'Listo. Demo rápida.'}},
    {activate:'reply.send'},
    {showResult:'reply.sent',method:'look',hold:280}
  ]}},
  {name:'SCROLL',recipe:{demo:'02 · SCROLL',preset:'SHOWCASE',steps:[
    {say:'Scroll local. Después scroll de página.',show:'mail.goal',method:'look',hold:250},
    {show:'settings.save',method:'look',hold:280}
  ]}},
  {name:'CONTROLS',recipe:{demo:'03 · CONTROLS',preset:'SHOWCASE',steps:[
    {say:'Select, slider, toggle y guardar.',show:'settings.mode',method:'look',hold:160},
    {set:{target:'settings.mode',value:'Teach'}},
    {set:{target:'settings.speed',value:78}},
    {set:{target:'settings.guides',value:true}},
    {activate:'settings.save'},
    {showResult:'settings.state',method:'look',hold:230}
  ]}},
  {name:'DRAG + RESIZE',recipe:{demo:'04 · DRAG + RESIZE',preset:'SHOWCASE',steps:[
    {say:'Drag y resize. Sin láser.',show:'task.drag',method:'look',hold:180},
    {drag:{from:'task.drag',to:'task.drop',duration:630}},
    {resize:{target:'resize.box',width:245,height:128,duration:650}}
  ]}},
  {name:'MARK',recipe:{demo:'05 · MARK',preset:'SHOWCASE',steps:[
    {say:'La marca pertenece al contenido, no al mouse.',show:'file.one',method:'look',hold:180},
    {annotate:{target:'file.one',type:'box',hold:900}},
    {annotate:{target:'file.two',type:'underline',hold:720}}
  ]}},
  {name:'FOCUS',recipe:{demo:'06 · FOCUS',preset:'SHOWCASE',steps:[
    {say:'Focus hace pan y zoom adaptativo. Sin láser.',show:'file.one',method:'focus',hold:470},
    {show:'widget.tasks',method:'focus',hold:430},
    {say:'Fin.'}
  ]}}
];

function resetFixture(full=true){
  if(full)q('[data-demo-page-scroll]').scrollTop=0;
  q('[data-demo-id="mail.list"]').scrollTop=0;
  reply.hidden=true;sent.hidden=true;q('[data-demo-id="reply.input"]').value='';
  q('[data-demo-id="settings.mode"]').value='Calm';
  q('[data-demo-id="settings.speed"]').value='32';
  q('[data-demo-id="settings.guides"]').checked=false;
  q('[data-demo-id="settings.state"]').textContent='sin cambios';
  drag.textContent='Revisar motion';
  drag.classList.remove('muted','is-dragging');
  drag.style.transform='';
  drop.classList.remove('drop-active');
  resizeBox.style.width='165px';
  resizeBox.style.height='88px';
}

function prepareScene(i){
  if(i===0){reply.hidden=true;sent.hidden=true;q('[data-demo-id="reply.input"]').value='';}
  if(i===2){
    q('[data-demo-id="settings.mode"]').value='Calm';
    q('[data-demo-id="settings.speed"]').value='32';
    q('[data-demo-id="settings.guides"]').checked=false;
    q('[data-demo-id="settings.state"]').textContent='sin cambios';
  }
  if(i===3){
    drag.textContent='Revisar motion';
    drag.classList.remove('muted','is-dragging');
    drag.style.transform='';
    drop.classList.remove('drop-active');
    resizeBox.style.width='165px';
    resizeBox.style.height='88px';
  }
}

const engine=new DemoEngineV6(root,{title:'V6',steps:[]},{
  preset:'SHOWCASE',
  pointerAssets,
  gestureAssets,
  abortOnHuman:false,
  audio:{enabled:true,profile:'RETRO_OS',textVoice:true,volume:.05,textEvery:3},
  onReset:()=>resetFixture(true)
});

let generation=0;
let current=0;
let running=false;

function setRunning(value){
  running=!!value;
  runBtn.disabled=running;
  cancelBtn.hidden=!running;
}

function paint(){
  q('#sceneTitle').textContent=running
    ? `${String(current+1).padStart(2,'0')} · ${scenes[current].name}`
    : 'FAST SHOWCASE';
}

async function runScene(i,gen){
  if(gen!==generation)return false;
  current=i;
  prepareScene(i);
  paint();
  engine.setRecipe(scenes[i].recipe);
  engine.audio.ensure();
  try{
    await engine.play(0);
    return gen===generation;
  }catch(err){
    if(err?.name!=='AbortError')console.error(err);
    return false;
  }
}

async function runAll(){
  if(running)return;
  generation++;
  const gen=generation;
  resetFixture(true);
  setRunning(true);
  for(let i=0;i<scenes.length;i++){
    if(gen!==generation)break;
    engine.stop('scene_change');
    const ok=await runScene(i,gen);
    if(!ok)break;
    if(i<scenes.length-1)await new Promise(r=>setTimeout(r,120));
  }
  if(gen===generation){
    setRunning(false);
    q('#sceneTitle').textContent='COMPLETE';
    q('[data-demo-caption]').textContent='Demo terminada.';
  }
}

function cancel(){
  if(!running)return;
  generation++;
  engine.stop('cancel');
  engine.reset();
  resetFixture(true);
  current=0;
  setRunning(false);
  paint();
  q('[data-demo-caption]').textContent='Demo cancelada.';
}

runBtn.onclick=runAll;
cancelBtn.onclick=cancel;

resetFixture(true);
setRunning(false);
paint();

window.engine=engine;
window.scenes=scenes;
})();