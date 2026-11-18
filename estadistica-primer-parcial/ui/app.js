import {loadStudyContent} from './data.js';
import {createRenderers} from './components.js';
import {TAB_ORDER,buildRouteURL,routeFromLocation,bindGestures} from './navigation.js';
// UI orchestration, no course content or exercise keys in this file.
(async function(){'use strict';
try{
const {PARTIALS,EXTRAS,CHEATS,NUM,MULTI,TF,storageKey}=await loadStudyContent();
const MAIN=document.getElementById('main'),HEAD=document.getElementById('header'),TABS=document.getElementById('tabs'),UNIT_TRIGGER=document.getElementById('unit-trigger'),PERCENT=document.getElementById('percent');
const STORAGE=storageKey;
let unit=0,tab='theory',view='units',partial=0,answers={};
const previousScroll=new Map(),helpState=new Map();
try{answers=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch{answers={}}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(answers))}catch{}}
const {theory,cheat,practices}=createRenderers({EXTRAS,CHEATS,NUM,MULTI,TF,answers});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function textSafe(s){return escapeHTML(s)}
function store(k,v){answers[k]=v;save()}
function niceNum(v){if(Number.isInteger(v))return String(v);let n=Number(v);return String(Math.round((n+Number.EPSILON)*10000)/10000).replace('.',',')}
function itemLink(n){return escapeHTML(n)}
function toDisplayValue(x){return typeof x==='number'?niceNum(x):escapeHTML(x)}
function readProgress(){const doc=document.documentElement;const max=Math.max(1,doc.scrollHeight-window.innerHeight);const percent=Math.min(100,Math.max(0,window.scrollY/max*100));PERCENT.style.width=percent+'%';PERCENT.parentNode.setAttribute('aria-valuenow',String(Math.round(percent)))}
window.addEventListener('scroll',readProgress,{passive:true});window.addEventListener('resize',readProgress);
function updateControls(){let active=view==='unit';HEAD.hidden=!active;if(active){UNIT_TRIGGER.textContent=PARTIALS[partial].units[unit].id;for(const b of TABS.querySelectorAll('[data-tab]')){const yes=b.dataset.tab===tab;b.classList.toggle('active',yes);b.setAttribute('aria-selected',String(yes));b.tabIndex=yes?0:-1}}}
function homePage(){navigate({view:'units',partial},true)}
function openUnit(i,t='theory'){navigate({view:'unit',partial,unit:Number(i),tab:t},true)}
function changeTab(t){if(view==='unit'&&t!==tab)navigate({view:'unit',partial,unit,tab:t},true)}
function getRoute(){return {view,partial,unit,tab}}
function keyOf(r){return [r.view,r.partial,r.unit,r.tab].join(':')}
function savePosition(){previousScroll.set(keyOf(getRoute()),window.scrollY)}
function navigate(next,push=true){if(view==='unit'||view==='units'||view==='partials')savePosition();const r={...getRoute(),...next};if(!PARTIALS[r.partial])r.partial=0;if(r.view==='unit'&&!PARTIALS[r.partial].units[r.unit])r.view='units';if(!TAB_ORDER.includes(r.tab))r.tab='theory';({view,partial,unit,tab}=r);if(push)history.pushState(getRoute(),' ',getURL(getRoute()));render();const prior=previousScroll.get(keyOf(getRoute()))||0;requestAnimationFrame(()=>{window.scrollTo({top:prior,behavior:'instant'});readProgress()})}
function render(){updateControls();document.title=(view==='unit'?PARTIALS[partial].units[unit].title+' · ':view==='units'?PARTIALS[partial].title+' · ':'')+'Estadística';if(view==='partials'){MAIN.innerHTML=`<div class="indexhead"><h1>Estadística</h1></div><div class="index-list">${PARTIALS.map((p,i)=>`<button type="button" class="index-unit" data-partial="${i}" ${p.ready===false?'disabled aria-disabled="true"':''}><span class="inum">${String(i+1).padStart(2,'0')}</span><span><strong>${escapeHTML(p.title)}</strong>${p.ready===false?'<small>Próximamente</small>':''}</span><span class="arr">›</span></button>`).join('')}</div>`;readProgress();return}
if(view==='units'){const p=PARTIALS[partial];MAIN.innerHTML=`<div class="indexhead"><div class="indexline"><button class="levelback" data-view="partials" aria-label="Volver a parciales">‹</button><h1>${escapeHTML(p.title)}</h1></div></div><div class="index-list">${p.units.map((u,i)=>`<button class="index-unit" data-unit="${i}"><span class="inum">${escapeHTML(u.id)}</span><span><strong>${escapeHTML(u.title)}</strong><small>${u.practice.length} ejercicios · ${u.theory.length} conceptos</small></span><span class="arr">›</span></button>`).join('')}</div>`;readProgress();return}
const u=PARTIALS[partial].units[unit];MAIN.innerHTML=tab==='theory'?theory(u):tab==='practice'?practices(u):cheat(u);readProgress();}
function patchCard(key,chosen){const selector='[data-key="'+CSS.escape(key)+'"]';const buttons=MAIN.querySelectorAll(selector);if(!buttons.length)return;const correct=String(buttons[0].dataset.correct);store(key,key.endsWith(':mark')?String(chosen):Number(chosen));buttons.forEach(b=>{let yes=String(b.dataset.choice)===String(chosen);b.classList.toggle('selected',yes);b.classList.toggle('correct',yes&&String(chosen)===correct);b.classList.toggle('wrong',yes&&String(chosen)!==correct);b.setAttribute('aria-pressed',String(yes))});const group=buttons[0].closest('.vf-item')||buttons[0].closest('.multirow')||buttons[0].closest('.exercise');if(!group)return;const feed=group.querySelector('.feedback');if(!feed)return;const right=String(chosen)===correct;feed.className='feedback '+(right?'good':'bad');if(key.includes(':vf:')){let [id,idx]=key.split(':vf:');let why=TF[id]?.[Number(idx)]?.[2]||PARTIALS[partial].units[unit].practice.find(q=>q.id===id)?.claims?.[Number(idx)]?.explanation||'';feed.textContent=(right?'✓ ':'✕ ')+why;}else{feed.textContent=right?'✓ Correcto':'✕ Revisá la respuesta';}}
function toggleHelp(id,mode){const q=PARTIALS[partial].units[unit].practice.find(x=>x.id===id);if(!q)return;const item=MAIN.querySelector('[data-assist="'+CSS.escape(id)+'"]');if(!item)return;const box=item.querySelector('[data-help-body]');const prev=helpState.get(id);let next;if(prev?.mode===mode){if(mode==='hint'&&prev.step+1<(q.hints||[]).length){next={mode,step:prev.step+1}}else next=null}else next={mode,step:0};if(!next)helpState.delete(id);else helpState.set(id,next);box.hidden=!next;box.innerHTML=!next?'':next.mode==='hint'?`<p>${escapeHTML((q.hints||[])[next.step]||'')}</p>`:(q.solution||[]).map(s=>`<p>${s}</p>`).join('');item.querySelectorAll('[data-help]').forEach(b=>{const active=next?.mode===b.dataset.helpMode;b.classList.toggle('active',!!active);b.setAttribute('aria-pressed',String(!!active));b.textContent=b.dataset.helpMode==='hint'&&active&&next.step+1<(q.hints||[]).length?'Otra pista':b.dataset.helpMode==='hint'?'Pista':'Resolución'})}
MAIN.addEventListener('click',e=>{const btn=e.target.closest('[data-view],[data-partial],[data-unit],[data-key],[data-help]');if(!btn)return;if(btn.dataset.view==='partials'){navigate({view:'partials'},true);return}if(btn.dataset.partial!==undefined){const p=Number(btn.dataset.partial);if(PARTIALS[p]?.ready===false)return;navigate({view:'units',partial:p,unit:0,tab:'theory'},true);return}if(btn.dataset.unit!==undefined){openUnit(btn.dataset.unit);return}if(btn.dataset.key){patchCard(btn.dataset.key,btn.dataset.choice);return}if(btn.dataset.help){toggleHelp(btn.dataset.help,btn.dataset.helpMode);return}});
function getURL(r){return buildRouteURL(r,PARTIALS)}
bindGestures(MAIN,direction=>{if(view==='unit'){const next=TAB_ORDER.indexOf(tab)+(direction==='left'?1:-1);if(next<0)navigate({view:'units'},true);else if(next<TAB_ORDER.length)changeTab(TAB_ORDER[next]);}else if(view==='units'){if(direction==='right')navigate({view:'partials'},true);else if(PARTIALS[partial].units.length)openUnit(unit)}else if(view==='partials'&&direction==='left')navigate({view:'units'},true)});
UNIT_TRIGGER.addEventListener('click',()=>navigate({view:'units'},true));
TABS.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)changeTab(b.dataset.tab)});
window.addEventListener('popstate',()=>navigate(routeFromLocation(PARTIALS),false));
({view,partial,unit,tab}=routeFromLocation(PARTIALS));render();
}catch(error){console.error(error);const m=document.getElementById('main');m.innerHTML='<p class="quiet-note" role="alert">No se pudo cargar el contenido. Recargá la página.</p>';}
})();