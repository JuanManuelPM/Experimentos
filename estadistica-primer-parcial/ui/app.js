import {loadStudyContent} from './data.js?v=exam-archive-v1-20261118';
import {createRenderers} from './components.js?v=final-calibracion-20261118a';
import {TAB_ORDER,buildRouteURL,routeFromLocation,bindGestures} from './navigation.js?v=speedrun-20261117a';
// UI orchestration, no course content or exercise keys in this file.
(async function(){'use strict';
try{
const {PARTIALS,EXTRAS,CHEATS,NUM,MULTI,TF,storageKey}=await loadStudyContent();
const MAIN=document.getElementById('main'),HEAD=document.getElementById('header'),TABS=document.getElementById('tabs'),UNIT_TRIGGER=document.getElementById('unit-trigger'),PERCENT=document.getElementById('percent');
const STORAGE=storageKey;
let unit=0,tab='theory',view='units',partial=0,answers={};
const previousScroll=new Map();
try{answers=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{answers={}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(answers))}catch{}}
const {theory,cheat,practices,reviewAnswer,examArchive}=createRenderers({EXTRAS,CHEATS,NUM,MULTI,TF,answers});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function textSafe(s){return escapeHTML(s)}
function store(k,v){answers[k]=v;save()}
function niceNum(v){if(Number.isInteger(v))return String(v);let n=Number(v);return String(Math.round((n+Number.EPSILON)*10000)/10000).replace('.',',')}
function itemLink(n){return escapeHTML(n)}
function toDisplayValue(x){return typeof x==='number'?niceNum(x):escapeHTML(x)}
function readProgress(){const doc=document.documentElement;const max=Math.max(1,doc.scrollHeight-window.innerHeight);const percent=Math.min(100,Math.max(0,window.scrollY/max*100));PERCENT.style.width=percent+'%';PERCENT.parentNode.setAttribute('aria-valuenow',String(Math.round(percent)))}
window.addEventListener('scroll',readProgress,{passive:true});window.addEventListener('resize',readProgress);
function updateControls(){let active=view==='unit'||view==='partial';HEAD.hidden=!active;if(active){UNIT_TRIGGER.textContent=view==='partial'?'P'+PARTIALS[partial].id:PARTIALS[partial].units[unit].id;UNIT_TRIGGER.setAttribute('aria-label','Ver unidades');for(const b of TABS.querySelectorAll('[data-tab]')){const yes=b.dataset.tab===tab;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1}}}
function homePage(){navigate({view:'units',partial},true)}
function openUnit(i,t='theory'){navigate({view:'unit',partial,unit:Number(i),tab:t},true)}
function changeTab(t){if((view==='unit'||view==='partial')&&t!==tab)navigate({view,partial,unit,tab:t},true)}
function getRoute(){return {view,partial,unit,tab}}
function keyOf(r){return [r.view,r.partial,r.unit,r.tab].join(':')}
function savePosition(){previousScroll.set(keyOf(getRoute()),window.scrollY)}
function navigate(next,push=true){const activeDialog=MAIN.querySelector('#practice-dialog');if(activeDialog?.open)activeDialog.close();if(view==='unit'||view==='partial'||view==='units'||view==='partials')savePosition();const r={...getRoute(),...next};if(!PARTIALS[r.partial])r.partial=0;if(r.view==='unit'&&!PARTIALS[r.partial].units[r.unit])r.view='units';if(r.view==='partial'&&!PARTIALS[r.partial].ready)r.view='units';if(!TAB_ORDER.includes(r.tab))r.tab='theory';({view,partial,unit,tab}=r);if(push)history.pushState(getRoute(),' ',getURL(getRoute()));render();const prior=previousScroll.get(keyOf(getRoute()))||0;requestAnimationFrame(()=>{window.scrollTo({top:prior,behavior:'instant'});readProgress()})}
function render(){updateControls();document.title=(view==='unit'?PARTIALS[partial].units[unit].title+' · ':view==='units'||view==='partial'?PARTIALS[partial].title+' · ':'')+'Estadística';if(view==='partials'){MAIN.innerHTML=`<div class="indexhead"><h1>Estadística</h1></div><div class="index-list">${PARTIALS.map((p,i)=>`<button type="button" class="index-unit" data-partial="${i}" ${p.ready===false?'disabled aria-disabled="true"':''}><span class="inum">${String(i+1).padStart(2,'0')}</span><span><strong>${escapeHTML(p.title)}</strong>${p.ready===false?'<small>Próximamente</small>':''}</span><span class="arr">›</span></button>`).join('')}</div>`;readProgress();return}
if(view==='units'){const p=PARTIALS[partial];MAIN.innerHTML=`<div class="indexhead"><div class="indexline"><button class="levelback" data-view="partials" aria-label="Volver a parciales">‹</button><h1>${escapeHTML(p.title)}</h1></div></div><div class="index-list"><button type="button" class="index-unit index-all" data-all="1"><span class="inum">∞</span><span><strong>Resumen del parcial</strong><small>Teoría · Práctica · Machete</small></span><span class="arr">›</span></button>${p.units.map((u,i)=>`<button class="index-unit" data-unit="${i}"><span class="inum">${escapeHTML(u.id)}</span><span><strong>${escapeHTML(u.title)}</strong><small>${u.practice.length} ejercicios · ${u.theory.length} conceptos</small></span><span class="arr">›</span></button>`).join('')}</div>`;readProgress();return}
if(view==='partial'){
  const p=PARTIALS[partial],s=p.summary;
  const head='<div class="partial-summary-head"><h1>'+escapeHTML(p.title)+'</h1>'+(tab==='practice'?'<span>'+s.practice.length+' ejercicios seleccionados</span>':'')+'</div>';
  MAIN.innerHTML=head+(tab==='theory'?theory(s):tab==='practice'?practices(s)+examArchive(s.examCases,s.examNotice):cheat(s));
  if(tab==='theory')decorateTheory(s);
  finalizePractice();readProgress();return;
}
const u=PARTIALS[partial].units[unit];MAIN.innerHTML=tab==='theory'?theory(u):tab==='practice'?practices(u):cheat(u);finalizePractice();readProgress();}

function decorateTheory(summary){
  // Une bloques del libro con ejercicios curados sin duplicar respuestas ni teoría.
  for(const group of summary.practiceGroups||[]){
    const section=MAIN.querySelector('[id="'+CSS.escape(group.theoryId)+'"]');
    if(!section)continue;
    const ids=(group.ids||[]).filter(id=>summary.practice.some(q=>q.id===id));
    if(!ids.length)continue;
    const action=document.createElement('div');
    action.className='lesson-practice';
    action.innerHTML='<button type="button" class="lesson-practice-button" data-practice-group="'+escapeHTML(group.theoryId)+'"><span>Practicar</span><span class="lesson-practice-meta">'+ids.length+' ejercicios <span aria-hidden="true">›</span></span></button>';
    section.append(action);
  }
  const d=document.createElement('dialog');
  d.id='practice-dialog';d.className='practice-dialog';
  d.setAttribute('aria-labelledby','practice-dialog-title');
  d.innerHTML='<div class="practice-toolbar"><div class="practice-toolbar-title"><strong id="practice-dialog-title"></strong></div><button type="button" data-practice-close="1" aria-label="Cerrar ejercicios">Cerrar ×</button></div><div class="practice-dialog-content"></div>';
  d.addEventListener('click',e=>{if(e.target===d)d.close()});
  MAIN.append(d);
}
function openPracticeGroup(id){
  if(view!=='partial'||tab!=='theory')return;
  const s=PARTIALS[partial].summary;
  const group=(s.practiceGroups||[]).find(g=>g.theoryId===id);
  const concept=s.theory.find(c=>c.id===id);
  const dialog=MAIN.querySelector('#practice-dialog');
  if(!group||!concept||!dialog)return;
  const bank=new Map(s.practice.map(q=>[q.id,q]));
  const items=(group.ids||[]).map(qid=>bank.get(qid)).filter(Boolean);
  if(!items.length)return;
  dialog.querySelector('#practice-dialog-title').textContent=concept.title;
  const body=dialog.querySelector('.practice-dialog-content');
  body.innerHTML=practices({practice:items});
  const questions=[...body.querySelectorAll('.exercise')];
  questions.forEach((card,i)=>{if(i===questions.length-1){const next=card.querySelector('[data-next]');if(next)next.hidden=true}});
  dialog.showModal();
  body.scrollTop=0;
}
function finalizePractice(){
  if(tab!=='practice')return;
  const exercises=[...MAIN.querySelectorAll('.exercise')];
  exercises.forEach((card,i)=>{const next=card.querySelector('[data-next]');if(next&&!exercises[i+1])next.hidden=true});
}
function findExercise(id){
  for(const u of PARTIALS[partial].units){const q=u.practice.find(q=>q.id===id);if(q)return {q,u}}
  const q=PARTIALS[partial].summary?.extraPractice?.find(x=>x.id===id);
  if(q)return {q,u:PARTIALS[partial].units.find(u=>u.moduleId===q.unit)||PARTIALS[partial].units[0]};
  return null
}
function gradeCard(card){
  const id=card.id,expected=new Map();
  for(const opt of card.querySelectorAll('[data-key][data-correct]')){
    if(!expected.has(opt.dataset.key))expected.set(opt.dataset.key,String(opt.dataset.correct))
  }
  const correct=expected.size>0&&[...expected].every(([key,right])=>answers[key]!==undefined&&String(answers[key])===right);
  store('__grade__:'+id,correct?'correct':'incorrect');
  card.classList.toggle('review-correct',correct);
  card.classList.toggle('review-incorrect',!correct);
  const next=card.querySelector('[data-next]');
  if(next&&card.nextElementSibling?.classList.contains('exercise'))next.hidden=false;
  if(next&&MAIN.querySelectorAll('.exercise').length>1&&[...MAIN.querySelectorAll('.exercise')].at(-1)!==card)next.hidden=false;
  return correct;
}
function patchCard(key,chosen){
  const buttons=MAIN.querySelectorAll('[data-key="'+CSS.escape(key)+'"]');
  if(!buttons.length)return;
  const card=buttons[0].closest('.exercise');
  if(!card)return;
  store(key,key.endsWith(':mark')?String(chosen):Number(chosen));
  buttons.forEach(b=>{
    const yes=String(b.dataset.choice)===String(chosen);
    b.classList.toggle('selected',yes);
    b.classList.remove('correct','wrong');
    b.setAttribute('aria-pressed',String(yes));
  });
  // Después de ver la solución, las respuestas pueden cambiar y la nota se actualiza.
  if(answers['__grade__:'+card.id])gradeCard(card);
}
function toggleReview(id){
  const found=findExercise(id);if(!found)return;
  const card=MAIN.querySelector('.exercise[id="'+CSS.escape(id)+'"]');if(!card)return;
  const panel=card.querySelector('[data-review-panel]'),button=card.querySelector('[data-reveal]');
  if(!panel||!button)return;
  if(!panel.hidden){
    panel.hidden=true;button.textContent='Ver respuesta';button.setAttribute('aria-expanded','false');return;
  }
  gradeCard(card);
  panel.innerHTML=reviewAnswer(found.q);
  panel.hidden=false;button.textContent='Ocultar respuesta';button.setAttribute('aria-expanded','true');
}
function goNext(id){
  const list=[...MAIN.querySelectorAll('.exercise')];
  const i=list.findIndex(x=>x.id===id);
  const next=list[i+1];if(!next)return;
  next.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
const cheatDialog=document.getElementById('cheat-dialog');
const cheatContent=document.getElementById('cheat-content');
const cheatCaption=document.getElementById('cheat-caption');
document.getElementById('cheat-close').addEventListener('click',()=>cheatDialog.close());
cheatDialog.addEventListener('click',e=>{if(e.target===cheatDialog)cheatDialog.close()});
function keywords(s){
  const skip=new Set(['para','como','cual','cuanto','cuando','sobre','entre','hasta','donde','porque','esta','este','estos','estas','solo','tambien','todos','todas','datos','cada','mismo','tiene','puede','debe','caso','toda','todo','respuesta','resultado','ejercicio','tabla','grupo','grupos','punto','problema','calcula','calcular','segun','afirmacion','elige','elegi','correcta','correcto','cuantos','cuales','valor','valores','numero','ejemplo']);
  return [...new Set(String(s||'').replace(/<[^>]*>/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z]{4,}/g)||[])].filter(x=>!skip.has(x)).map(x=>x.slice(0,6));
}
function showCheat(id){
  const found=findExercise(id);if(!found)return;
  const summaryMode=view==='partial'&&PARTIALS[partial].summary;
  const sheet=summaryMode?PARTIALS[partial].summary:found.u;
  cheatCaption.textContent='Machete · '+(summaryMode?'P'+PARTIALS[partial].id:found.u.id);
  cheatContent.innerHTML=cheat(sheet);
  cheatDialog.showModal();
  const heads=[...cheatContent.querySelectorAll('.block-heading,.cheat-section h2')];
  if(!heads.length)return;
  const q=found.q,query=keywords([q.title,q.prompt,...(q.solution||[])].join(' '));
  // Enlace editorial exacto cuando la unidad ya declaró su sección pertinente.
  const section=summaryMode?sheet.cheatByUnit?.[found.u.moduleId||('M'+String(found.u.id).replace(/^0/,''))]:q.cheatSection;
  if(typeof section==='string'&&section.trim()){
    const exact=heads.find(h=>h.textContent.trim().toLocaleLowerCase('es')===section.trim().toLocaleLowerCase('es'));
    if(exact){requestAnimationFrame(()=>{cheatContent.scrollTop=Math.max(0,exact.offsetTop-cheatContent.offsetTop-12)});return}
  }
  // Prioriza la sección del machete que comparte conceptos con el enunciado y su solución.
  let best=null,score=0;
  for(const h of heads){
    let parts=[],node=h;
    while(node&&(!parts.length||node===h||!node.matches?.('.block-heading,.cheat-section'))){
      if(node!==h&&node.matches?.('.block-heading,.cheat-section'))break;
      parts.push(node.textContent||'');
      node=node.nextElementSibling;
    }
    const heading=keywords(h.textContent),all=keywords(parts.join(' '));
    const n=query.reduce((s,word)=>s+(heading.includes(word)?3:all.includes(word)?1:0),0);
    if(n>score){score=n;best=h}
  }
  if(best&&score>0)requestAnimationFrame(()=>{cheatContent.scrollTop=Math.max(0,best.offsetTop-cheatContent.offsetTop-12)});
}
MAIN.addEventListener('click',e=>{const btn=e.target.closest('[data-view],[data-partial],[data-unit],[data-all],[data-key],[data-reveal],[data-next],[data-cheat],[data-practice-group],[data-practice-close]');if(!btn)return;if(btn.dataset.practiceClose!==undefined){MAIN.querySelector('#practice-dialog')?.close();return}if(btn.dataset.practiceGroup){openPracticeGroup(btn.dataset.practiceGroup);return}if(btn.dataset.view==='partials'){navigate({view:'partials'},true);return}if(btn.dataset.partial!==undefined){const p=Number(btn.dataset.partial);if(PARTIALS[p]?.ready===false)return;navigate({view:'units',partial:p,unit:0,tab:'theory'},true);return}if(btn.dataset.all!==undefined){navigate({view:'partial',tab:'theory'},true);return}if(btn.dataset.unit!==undefined){openUnit(btn.dataset.unit);return}if(btn.dataset.key){patchCard(btn.dataset.key,btn.dataset.choice);return}if(btn.dataset.reveal){toggleReview(btn.dataset.reveal);return}if(btn.dataset.next){goNext(btn.dataset.next);return}if(btn.dataset.cheat){showCheat(btn.dataset.cheat);return}});
function getURL(r){return buildRouteURL(r,PARTIALS)}
bindGestures(MAIN,direction=>{if(view==='unit'||view==='partial'){const next=TAB_ORDER.indexOf(tab)+(direction==='left'?1:-1);if(next<0)navigate({view:'units'},true);else if(next<TAB_ORDER.length)changeTab(TAB_ORDER[next]);}else if(view==='units'){if(direction==='right')navigate({view:'partials'},true);else if(PARTIALS[partial].units.length)openUnit(unit)}else if(view==='partials'&&direction==='left')navigate({view:'units'},true)});
UNIT_TRIGGER.addEventListener('click',()=>navigate({view:'units'},true));
TABS.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)changeTab(b.dataset.tab)});
window.addEventListener('popstate',()=>navigate(routeFromLocation(PARTIALS),false));
({view,partial,unit,tab}=routeFromLocation(PARTIALS));render();
}catch(error){console.error(error);const m=document.getElementById('main');m.innerHTML='<p class="quiet-note" role="alert">No se pudo cargar el contenido. Recargá la página.</p>';}
})();