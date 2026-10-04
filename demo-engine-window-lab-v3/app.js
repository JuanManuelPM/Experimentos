(()=>{
'use strict';
const root=document.getElementById('labRoot'),q=s=>root.querySelector(s),qa=s=>[...root.querySelectorAll(s)];
const p=window.DEMO_ENGINE_V4_POINTERS||{},g=window.DEMO_ENGINE_V4_GESTURES||{};
const pointerAssets={arrow:{src:p.arrow,hotspot:[9,8],size:48},hand:{src:p.hand,hotspot:[22,5],size:48},grab:{src:p.grab,hotspot:[24,21],size:48},grabbing:{src:p.grabbing,hotspot:[24,21],size:48},text:{src:p.text,hotspot:[24,24],size:48},'resize-ew':{src:p['resize-ew'],hotspot:[24,24],size:48},'resize-ns':{src:p['resize-ns'],hotspot:[24,24],size:48},'resize-d1':{src:p['resize-d1']||p['resize-ew'],hotspot:[24,24],size:48}};
const gestureAssets={point:g.point,approve:g.thumb_up,wave:g.wave,ok:g.ok,snap:g.snap};

const reply=q('[data-demo-id="reply.box"]'),sent=q('[data-demo-id="reply.sent"]'),drag=q('[data-demo-id="task.drag"]'),drop=q('[data-demo-id="task.drop"]'),resizeBox=q('[data-demo-id="resize.box"]');
q('[data-demo-id="mail.reply"]').onclick=()=>{reply.hidden=false;sent.hidden=true};
q('[data-demo-id="reply.send"]').onclick=()=>{reply.hidden=true;sent.hidden=false};
q('[data-demo-id="settings.save"]').onclick=()=>q('[data-demo-id="settings.state"]').textContent='guardado ✓';
drop.addEventListener('drop',()=>{drag.textContent='Revisar motion ✓';drag.classList.add('muted')});

const scenes=[
 {name:'CLICK + TYPE',recipe:{demo:'01 · CLICK + TYPE',preset:'SHOWCASE',steps:[
   {say:'Click, escritura rápida y resultado.',show:'mail.reply',method:'look',hold:240},
   {activate:'mail.reply'},
   {enter:{target:'reply.input',text:'Listo. Demo rápida.'}},
   {activate:'reply.send'},
   {showResult:'reply.sent',method:'look',hold:300}
 ]}},
 {name:'SCROLL',recipe:{demo:'02 · SCROLL',preset:'SHOWCASE',steps:[
   {say:'Scroll local. Después scroll de página.',show:'mail.goal',method:'look',hold:280},
   {show:'settings.save',method:'look',hold:300}
 ]}},
 {name:'CONTROLS',recipe:{demo:'03 · CONTROLS',preset:'SHOWCASE',steps:[
   {say:'Select, slider, toggle y guardar.',show:'settings.mode',method:'look',hold:180},
   {set:{target:'settings.mode',value:'Teach'}},
   {set:{target:'settings.speed',value:78}},
   {set:{target:'settings.guides',value:true}},
   {activate:'settings.save'},
   {showResult:'settings.state',method:'look',hold:260}
 ]}},
 {name:'DRAG + RESIZE',recipe:{demo:'04 · DRAG + RESIZE',preset:'SHOWCASE',steps:[
   {say:'Drag y resize. Sin láser.',show:'task.drag',method:'look',hold:200},
   {drag:{from:'task.drag',to:'task.drop',duration:660}},
   {resize:{target:'resize.box',width:245,height:128,duration:680}}
 ]}},
 {name:'MARK',recipe:{demo:'05 · MARK',preset:'SHOWCASE',steps:[
   {say:'El láser aparece sólo cuando estoy dibujando.',show:'file.one',method:'look',hold:200},
   {annotate:{target:'file.one',type:'box',hold:360}},
   {annotate:{target:'file.two',type:'underline',hold:360}}
 ]}},
 {name:'FOCUS',recipe:{demo:'06 · FOCUS',preset:'SHOWCASE',steps:[
   {say:'Focus hace pan y zoom adaptativo. Sin láser.',show:'file.one',method:'focus',hold:520},
   {show:'widget.tasks',method:'focus',hold:480},
   {say:'Fin. El mouse físico vuelve a quedar libre.'}
 ]}}
];

function resetFixture(full=true){
 if(full)q('[data-demo-page-scroll]').scrollTop=0;
 q('[data-demo-id="mail.list"]').scrollTop=0;reply.hidden=true;sent.hidden=true;q('[data-demo-id="reply.input"]').value='';
 q('[data-demo-id="settings.mode"]').value='Calm';q('[data-demo-id="settings.speed"]').value='32';q('[data-demo-id="settings.guides"]').checked=false;q('[data-demo-id="settings.state"]').textContent='sin cambios';
 drag.textContent='Revisar motion';drag.classList.remove('muted','is-dragging');drag.style.transform='';drop.classList.remove('drop-active');
 resizeBox.style.width='165px';resizeBox.style.height='88px';
}
function prepareScene(i){
 if(i===0){reply.hidden=true;sent.hidden=true;q('[data-demo-id="reply.input"]').value='';}
 if(i===2){q('[data-demo-id="settings.mode"]').value='Calm';q('[data-demo-id="settings.speed"]').value='32';q('[data-demo-id="settings.guides"]').checked=false;q('[data-demo-id="settings.state"]').textContent='sin cambios';}
 if(i===3){drag.textContent='Revisar motion';drag.classList.remove('muted','is-dragging');drag.style.transform='';drop.classList.remove('drop-active');resizeBox.style.width='165px';resizeBox.style.height='88px';}
}

const engine=new DemoEngineV6(root,{title:'V6',steps:[]},{preset:'SHOWCASE',pointerAssets,gestureAssets,abortOnHuman:false,audio:{enabled:true,profile:'RETRO_OS',textVoice:true,volume:.05,textEvery:3},onReset:()=>resetFixture(true)});
let current=0,generation=0,auto=false;
function paint(){
 qa('#sceneRail button').forEach((b,i)=>{b.classList.toggle('active',i===current);b.classList.toggle('done',i<current)});
 q('#sceneTitle').textContent=`${String(current+1).padStart(2,'0')} · ${scenes[current].name}`;
}
async function startScene(i,{autoplay=false,reset=false}={}){
 generation++;const gen=generation;engine.stop('scene_change');
 current=(i+scenes.length)%scenes.length;auto=autoplay;
 if(reset)resetFixture(true);prepareScene(current);paint();
 engine.setRecipe(scenes[current].recipe);
 engine.audio.ensure();
 await engine.play(0);
 if(gen!==generation)return;
 if(auto&&current<scenes.length-1){
   await new Promise(r=>setTimeout(r,180));
   if(gen===generation)startScene(current+1,{autoplay:true});
 }
}
function next(){startScene((current+1)%scenes.length,{autoplay:auto});}

q('#runBtn').onclick=()=>startScene(0,{autoplay:true,reset:true});
q('#nextBtn').onclick=()=>next();
q('#restartBtn').onclick=()=>{generation++;auto=false;engine.reset();current=0;paint()};
q('#audioBtn').onclick=e=>{engine.audio.setEnabled(!engine.audio.enabled);e.currentTarget.textContent=engine.audio.enabled?'SOUND ✓':'SOUND ×'};
qa('#sceneRail button').forEach(b=>b.onclick=()=>startScene(Number(b.dataset.scene),{autoplay:false}));

engine.observer.on(e=>{
 if(e.type==='viewport_authority'){
   const locked=e.owner==='ENGINE';q('#authority').textContent=locked?'ENGINE LOCKED':e.owner;q('#authority').classList.toggle('locked',locked);
 }
});
resetFixture(true);paint();window.engine=engine;window.scenes=scenes;
})();