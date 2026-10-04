const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const scenes=['home','files','dialog','workspace','tool']; let current='home'; const history=[];
const names={home:'HOME',files:'FILES',dialog:'DIALOG / CHOICE',workspace:'WORKSPACE',tool:'TOOL / INSTRUMENT'};
function show(id,push=true){if(id===current)return;if(push)history.push(current);current=id;$$('.scene').forEach(s=>s.classList.toggle('on',s.id===id));$$('.dockBtn').forEach(b=>b.classList.toggle('on',b.dataset.open===id));$('#crumb').textContent=names[id];}
function back(){show(history.pop()||'home',false)}
$$('[data-open]').forEach(b=>b.onclick=()=>show(b.dataset.open));
$('[data-demo="work-back"]').onclick=back;
$('[data-demo="dialog-quit"]').onclick=back;$('[data-demo="dialog-continue"]').onclick=()=>{document.body.dataset.choice='accepted';back()};
$$('.fileItem').forEach(x=>x.onclick=()=>{$$('.fileItem').forEach(y=>y.classList.remove('sel'));x.classList.add('sel')});
$$('[data-close-win]').forEach(b=>b.onclick=()=>$('.'+b.dataset.closeWin).style.display='none');
$$('[data-toggle-win]').forEach(b=>b.onclick=()=>{const x=$('.'+b.dataset.toggleWin);x.style.display=getComputedStyle(x).display==='none'?'block':'none'});
const padGrid=$('#padGrid');for(let i=0;i<16;i++){const b=document.createElement('button');b.className='pad'+([0,3,5,10,15].includes(i)?' on':'');b.dataset.pad=i;b.onclick=()=>b.classList.toggle('on');padGrid.appendChild(b)}
$('#fullBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen({navigationUI:'hide'});else await document.exitFullscreen()}catch(_){}};
document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Backspace')back()});
// demo
const cur=$('#cursor'),cap=$('#caption'),pulse=$('#pulse'),mouse=$('#demoMouse'),ml=$('#demoMouse .left'),demo=$('#demoBtn'),hud=$('#demoHud'),pause=$('#pauseBtn'),speed=$('#speedBtn');let running=false,abort=false,paused=false,rate=1;const wait=ms=>new Promise(r=>setTimeout(r,ms/rate));async function gate(){while(paused&&!abort)await new Promise(r=>setTimeout(r,60))}
function center(el){const r=el.getBoundingClientRect();return{x:r.left+r.width*.55,y:r.top+r.height*.55}}
async function move(el,hand=true){if(!el)return;await gate();const p=center(el);cur.classList.add('on');cur.classList.toggle('hand',hand);cur.style.transform=`translate(${p.x-10}px,${p.y-8}px)`;await wait(420)}
async function clickDemo(el,text){if(!el)return;cap.textContent=text||'';cap.classList.toggle('on',!!text);await move(el,true);const p=center(el);cur.classList.add('press');ml.classList.add('down');pulse.style.left=p.x+'px';pulse.style.top=p.y+'px';pulse.classList.remove('on');void pulse.offsetWidth;pulse.classList.add('on');await wait(150);el.click();cur.classList.remove('press');ml.classList.remove('down');await wait(520)}
async function run(){if(running)return;running=true;abort=false;paused=false;document.body.classList.add('demoRun');hud.classList.add('on');demo.textContent='■';show('home',false);history.length=0;const steps=[
()=>clickDemo($('[data-demo="home-files"]'),'HOME: abro FILES desde un objeto grande y reconocible.'),
()=>clickDemo($('[data-demo="folder-images"]'),'FILES: selecciono IMAGES. Nada microscópico, nada de navbar permanente.'),
()=>clickDemo($('.dockBtn[data-open="home"]'),'Vuelvo a HOME con un control estable.'),
()=>clickDemo($('[data-demo="home-dialog"]'),'Abro DIALOG: cambia la composición completa, no se encoge el desktop.'),
()=>clickDemo($('[data-demo="dialog-continue"]'),'La decisión usa un panel dominante y stats secundarios.'),
()=>clickDemo($('[data-demo="home-work"]'),'WORKSPACE: acá sí aparecen ventanas productivas.'),
()=>clickDemo($('[data-close-win="calcWin"]'),'Cierro CALC y dejo TASK como contexto principal.'),
()=>clickDemo($('[data-toggle-win="calcWin"]'),'Vuelvo a abrir CALC desde la bandeja.'),
()=>clickDemo($('.dockBtn[data-open="home"]'),'Regreso al escritorio.'),
()=>clickDemo($('[data-demo="home-tool"]'),'TOOL: otra receta, densa y modular.'),
()=>clickDemo($('.pad[data-pad="6"]'),'Activo un pad real.'),
()=>clickDemo($('[data-demo="tool-slider"]'),'El control cambia dentro de su módulo, sin alterar toda la composición.'),
()=>clickDemo($('.dockBtn[data-open="home"]'),'Termino en HOME limpio.')
];for(const s of steps){if(abort)break;await gate();await s()}cap.classList.remove('on');cur.classList.remove('on');hud.classList.remove('on');document.body.classList.remove('demoRun');demo.textContent='▶';running=false}
demo.onclick=()=>{if(running){abort=true;demo.textContent='▶'}else run()};pause.onclick=()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ'};speed.onclick=()=>{rate=rate===1?2:1;speed.textContent=rate+'×'};
// expose deterministic state for screenshot/gate runner
window.VisualProof={show,back,scene:()=>current};

const query=new URLSearchParams(location.search);if(query.get('scene')&&scenes.includes(query.get('scene')))show(query.get('scene'),false);if(query.get('embed')==='1'){document.body.classList.add('embed')}
function rectArea(r){return Math.max(0,r.width)*Math.max(0,r.height)}
function visible(el){const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0}
function metrics(){
  const stage=$('#stage').getBoundingClientRect(), scene=$('.scene.on');
  const primary=scene.querySelector('[data-role="primary-content"]');
  const p=primary?.getBoundingClientRect();
  const chrome=$$('[data-role="chrome"]').filter(visible).reduce((a,e)=>a+rectArea(e.getBoundingClientRect()),0);
  const controls=$$('button').filter(e=>visible(e)&&e.closest('.scene.on, #dock, .shellbar'));
  const minTouch=controls.length?Math.min(...controls.map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)})):0;
  const fonts=$$('.scene.on *,.shellbar *,#dock *').filter(visible).map(e=>parseFloat(getComputedStyle(e).fontSize)).filter(Number.isFinite);
  return {
    scene:current,
    viewport:{width:innerWidth,height:innerHeight},
    primary_content_ratio:p?+(rectArea(p)/rectArea(stage)).toFixed(3):0,
    persistent_chrome_ratio:+(chrome/(innerWidth*innerHeight)).toFixed(3),
    min_touch_target_css_px:+minTouch.toFixed(1),
    min_text_css_px:fonts.length?+Math.min(...fonts).toFixed(1):0,
    visible_controls:controls.length,
    primary_role:primary?.dataset.contentRole||'UNKNOWN',
    portrait_layout_defined:matchMedia('(max-width:700px)').matches,
    landscape_layout_defined:true
  }
}
window.VisualProof.metrics=metrics;
