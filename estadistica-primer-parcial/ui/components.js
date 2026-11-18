// UI only: lesson and exercise renderers. Never edit academic answers here.
export function createRenderers({EXTRAS,CHEATS,NUM,MULTI,TF,answers}){
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function niceNum(v){if(Number.isInteger(v))return String(v);let n=Number(v);return String(Math.round((n+Number.EPSILON)*10000)/10000).replace('.',',')}
function toDisplayValue(x){return typeof x==='number'?niceNum(x):escapeHTML(x)}
// Optional semantic blocks let each unit choose its own note format without UI changes.

function mathFormula(b){
  // Native typography, no network fonts or runtime dependency.
  const lines=(Array.isArray(b.lines)&&b.lines.length?b.lines:[b.expression||''])
    .flatMap(line=>typeof line==='string'?line.split(/\s+·\s+(?=[A-Za-zÁ-ÿŷμσΣPFr]+(?:[₀-₉²%]*)(?:\s|=))/u):[line]);
  const parts=lines.map(line=>{
    if(typeof line==='string')return '<div class="math-row math-plain">'+escapeHTML(line.trim())+'</div>';
    const lhs=escapeHTML(line.left||''),num=escapeHTML(line.numerator||''),den=escapeHTML(line.denominator||'');
    const fraction=(num&&den)?'<span class="math-frac"><span>'+num+'</span><span>'+den+'</span></span>':'';
    const right=escapeHTML(line.right||'');
    return '<div class="math-row"><span class="math-left">'+lhs+'</span>'+fraction+(right?'<span>'+right+'</span>':'')+'</div>';
  }).join('');
  const details=(b.symbols||[]).map(x=>'<div class="math-symbol"><b>'+escapeHTML(x.symbol||'')+'</b><span>'+escapeHTML(x.meaning||'')+'</span></div>').join('');
  return '<div class="block-formula" role="group" aria-label="Fórmula">'+parts+'</div>'+(details?'<div class="block-symbols">'+details+'</div>':'')+(b.note?'<p class="formula-note-text">'+escapeHTML(b.note)+'</p>':'');
}
function workedExample(b){
  const steps=(b.steps||[]).map(v=>'<li>'+escapeHTML(typeof v==='string'?v:v.text||'')+'</li>').join('');
  return '<div class="block-worked"><p class="worked-title">'+escapeHTML(b.title||'Ejemplo resuelto')+'</p>'+
    (b.problem?'<p>'+escapeHTML(b.problem)+'</p>':'')+
    (steps?'<ol>'+steps+'</ol>':'')+
    (b.result?'<p class="worked-result">'+escapeHTML(b.result)+'</p>':'')+
    (b.interpretation?'<p>'+escapeHTML(b.interpretation)+'</p>':'')+
  '</div>';
}

function renderBlocks(blocks){return (blocks||[]).map(b=>{
  const type=b.type;
  if(type==='heading')return `<h3 class="block-heading">${escapeHTML(b.text||'')}</h3>`;
  if(type==='paragraph')return `<p class="block-paragraph">${escapeHTML(b.text||'')}</p>`;
  if(type==='definition')return `<div class="block-definition"><strong>${escapeHTML(b.term||'')}</strong><p>${escapeHTML(b.text||'')}</p>${b.example?`<small>${escapeHTML(b.example)}</small>`:''}</div>`;
  if(type==='list')return `<ul class="block-list">${(b.items||[]).map(x=>typeof x==='string'?`<li>${escapeHTML(x)}</li>`:`<li><strong>${escapeHTML(x.label||'')}</strong>${x.text?' · '+escapeHTML(x.text):''}</li>`).join('')}</ul>`;
  if(type==='steps')return `<ol class="block-steps">${(b.items||[]).map(x=>`<li>${escapeHTML(typeof x==='string'?x:(x.text||''))}</li>`).join('')}</ol>`;
  if(type==='comparison')return `<div class="block-comparison">${(b.columns||[]).map(c=>`<section><strong>${escapeHTML(c.label||'')}</strong>${(c.items||[]).map(t=>`<p>${escapeHTML(t)}</p>`).join('')}</section>`).join('')}</div>`;
  if(type==='formula')return mathFormula(b);
  if(type==='worked')return workedExample(b);
  if(type==='decision')return `<div class="block-decision"><strong>${escapeHTML(b.if||'')}</strong><span>${escapeHTML(b.then||'')}</span></div>`;
  if(type==='table')return `<div class="tablewrap"><table class="datatab"><thead><tr>${(b.headers||[]).map(h=>`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${(b.rows||[]).map(row=>`<tr>${row.map(cell=>`<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if(type==='note')return `<p class="block-note">${escapeHTML(b.text||'')}</p>`;
  return '';
}).join('')}
function theory(u){return u.theory.map(c=>`<section class="concept" id="${escapeHTML(c.id)}"><h2>${escapeHTML(c.title)}</h2>${Array.isArray(c.blocks)&&c.blocks.length?renderBlocks(c.blocks):legacyTheoryContent(c)}</section>`).join('')}
function legacyTheoryContent(c){return `${EXTRAS[c.id]?`<div class="defs">${EXTRAS[c.id].map(([label,value])=>`<div class="def"><strong>${escapeHTML(label)}</strong><span>${escapeHTML(value)}</span></div>`).join('')}</div>`:`<p class="what">${c.what||''}</p>`}${c.formula?mathFormula({expression:c.formula}):''}<div class="label">PARA QUÉ SIRVE</div><p class="purpose">${c.use||''}</p><div class="label">EJEMPLO</div><p class="example">${c.example||''}</p>`}
function cheat(u){if(Array.isArray(u.cheatBlocks)&&u.cheatBlocks.length)return `<div class="cheats">${renderBlocks(u.cheatBlocks)}</div>`;
return `<div class="cheats">${(CHEATS[u.id]||[]).map(([title,items])=>`<section class="cheat-section"><h2>${escapeHTML(title)}</h2>${items.map(([key,val])=>`<div class="cheat-item${/[=Σ√]/.test(key)?' formula-note':''}"><b>${escapeHTML(key)}:</b> <span>${escapeHTML(val)}</span></div>`).join('')}</section>`).join('')}</div>`}
function table(q){if(q.table?.length){const [header,...rows]=q.table;return `<div class="tablewrap"><table class="datatab"><thead><tr>${header.map(v=>`<th>${escapeHTML(v)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${escapeHTML(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}return ''}
function pairs(q){if(!q.pairs?.length)return '';let rows=q.pairs;return `<div class="tablewrap"><table class="datatab"><tbody>${rows.map(row=>`<tr>${row.map(v=>`<td>${escapeHTML(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
function chart(q){if(!q.chart?.length)return '';let m=Math.max(...q.chart.map(x=>x[1]));return `<div class="bargraph">${q.chart.map(([k,v])=>`<div class="barrow"><span>${escapeHTML(k)}</span><div class="bartrack"><span style="width:${v/m*100}%"></span></div><span>${v}</span></div>`).join('')}</div>`}
function feedbackFor(){return ''}
function optionList(q,key,values,correctIndex,part='single'){return `<div class="optionlist" role="group" aria-label="Elegí una respuesta">${values.map((v,i)=>{const selected=answers[key]===i;return `<button type="button" class="choice${selected?' selected':''}" data-key="${escapeHTML(key)}" data-choice="${i}" data-q="${escapeHTML(q.id)}" data-correct="${correctIndex}" aria-pressed="${selected}">${toDisplayValue(v)}</button>`}).join('')}</div>${feedbackFor(key,correctIndex,answers[key]===correctIndex?'Correcto.': 'Revisá el cálculo o consultá la resolución.')}`}
function makeChoices(q){let raw=(Array.isArray(q.options)&&q.options.length?q.options:null)||NUM[q.id]||[q.answer,q.answer*2,q.answer/2,q.answer+1];return raw.map(Number)}
function practiceBody(q){if((q.type==='choice'||q.type==='truefalse')&&(TF[q.id]||q.claims)){const claims=TF[q.id]||(q.claims||[]).map(v=>[v.text,v.answer?1:0,v.explanation]);return `<div class="vf">${claims.map(([claim,v,why],i)=>{let key=q.id+':vf:'+i;let selected=answers[key];return `<div class="vf-item"><div class="vf-row"><div class="vf-claim">${escapeHTML(claim)}</div><div class="vf-controls">${[[1,'V'],[0,'F']].map(([chosen,label])=>`<button class="choice${selected===chosen?' selected':''}" data-key="${key}" data-choice="${chosen}" data-q="${q.id}" data-correct="${v}" aria-label="${label==='V'?'Verdadero':'Falso'}" aria-pressed="${selected===chosen}">${label}</button>`).join('')}</div></div>${feedbackFor(key,v,why)}</div>`}).join('')}</div>`}
if(q.type==='mark'){let key=q.id+':mark';let parts=q.parts.map(p=>typeof p==='string'?p:`<button class="choice${String(answers[key])===String(p.value)?' selected':''}" style="padding:4px 10px;min-height:30px" data-key="${key}" data-choice="${escapeHTML(p.value)}" data-q="${q.id}" data-correct="${q.answer}" aria-pressed="${answers[key]===p.value}">${escapeHTML(p.text)}</button>`).join('');return `<div class="statement">${parts}</div>${feedbackFor(key,q.answer,q.feedback||'Revisá los datos del enunciado.')}`}
if(q.type==='numeric'){let values=makeChoices(q),correctIndex=values.findIndex(n=>Math.abs(n-q.answer)<=Math.max(q.tolerance||0,0.005));return `<div class="sublabel">${q.label?escapeHTML(q.label):'Elegí el resultado'}</div>${optionList(q,q.id+':number',values,correctIndex<0?0:correctIndex)}`}
if(q.type==='multi'){return q.fields.map((f,i)=>{let opts=f.options||MULTI[q.id]?.[i]||[f.answer,f.answer*2,f.answer/2];let correct=opts.findIndex(n=>Math.abs(n-f.answer)<=Math.max(f.tolerance||0,0.01));return `<div class="multirow"><div class="multilabel">${escapeHTML(f.label)}</div>${optionList(q,q.id+':multi:'+i,opts,Math.max(0,correct))}</div>`}).join('')}
if(q.type==='choice')return optionList(q,q.id+':choice',q.options,q.answer);
return '<p class="quiet-note">Tipo de actividad no reconocido.</p>'}
function reviewAnswer(q){
  const claims=TF[q.id]||(q.claims||[]).map(v=>[v.text,v.answer?1:0,v.explanation]);
  let key='';
  if((q.type==='choice'||q.type==='truefalse')&&claims.length){
    key='<div class="answer-sequence">'+claims.map((c,i)=>'<span><small>'+(i+1)+'.</small> '+(Number(c[1])?'V':'F')+'</span>').join('')+'</div>';
  }else if(q.type==='multi'){
    key='<div class="answer-values">'+(q.fields||[]).map(f=>'<p><span>'+escapeHTML(f.label)+':</span> <strong>'+toDisplayValue(f.answer)+'</strong></p>').join('')+'</div>';
  }
  const paragraphs=(q.solution||[]).filter(x=>typeof x==='string'&&x.trim()).map(x=>'<p>'+x+'</p>');
  if(!paragraphs.length){
    let value='';
    if(q.type==='mark'){
      const found=(q.parts||[]).find(p=>p&&typeof p==='object'&&String(p.value)===String(q.answer));
      value=escapeHTML(found?.text||q.answer);
    }else if(q.type==='numeric')value=toDisplayValue(q.answer)+(q.label?' '+escapeHTML(q.label):'');
    else if(q.type==='choice'&&!claims.length)value=escapeHTML(q.options?.[q.answer]??q.answer);
    if(value)paragraphs.push('<p><strong>'+value+'</strong></p>');
    else if(claims.length)paragraphs.push(...claims.filter(c=>c[2]).map(c=>'<p>'+escapeHTML(c[2])+'</p>'));
  }
  return key+(paragraphs.length?'<div class="review-explanation">'+paragraphs.join('')+'</div>':'');
}
function exercisePrompt(q){
  const raw=typeof q.prompt==='string'?q.prompt.trim():'';
  if(!raw){
    const fallback=q.type==='mark'?'Señalá el fragmento que corresponde al título.':q.type==='truefalse'||q.claims?'Indicá V o F para cada afirmación.':q.type==='multi'?'Calculá los valores indicados.':'Elegí la alternativa correcta.';
    return '<p class="statement">'+fallback+'</p>';
  }
  const plain=raw.replace(/<[^>]*>/g,' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const hasTask=/[¿?]|\b(?:eleg[ií]|marc[aá]|indic[aá]|seleccion[aá]|señal[aá]|calcul[aá]|hall[aá]|identific[aá]|estim[aá]|obten[eé]|compar[aá]|evalu[aá]|decid[ií]|determin[aá]|complet[aá]|formul[aá]|interpret[aá]|juzg[aá]|verific[aá]|clasific[aá]|cu[aá]l|cu[aá]nto|qu[eé])\b/i.test(plain);
  let instruction='';
  if(!hasTask && q.type==='choice'&&!q.claims&&!TF[q.id])instruction=' Elegí la opción correcta.';
  else if(!hasTask&&q.type==='numeric')instruction=' Calculá '+escapeHTML(q.label||'el resultado')+'.';
  else if(!hasTask&&q.type==='multi')instruction=' Calculá los valores indicados.';
  return '<p class="statement">'+raw+instruction+'</p>';
}

function examArchive(cases,notice){
  if(!Array.isArray(cases)||!cases.length)return '';
  const parts=cases.map(c=>{
    const sections=(c.parts||[]).map((p,i)=>{
      const steps=(p.steps||[]).map(v=>'<li>'+escapeHTML(v)+'</li>').join('');
      return '<li class="exam-inciso"><p class="exam-question">'+escapeHTML(p.ask||'')+'</p>'+
        '<details class="exam-solution"><summary>Ver resolución</summary>'+
        (p.status==='needs_data'?'<p class="exam-data-needed">La consigna requiere una base de datos externa que no figura en este archivo.</p>':'')+
        '<ol>'+steps+'</ol></details></li>';
    }).join('');
    const source=(c.sourceUrl&&/^https:\/\/(?:docs\.google\.com|drive\.google\.com)\//.test(c.sourceUrl))
      ?'<a class="exam-source" href="'+escapeHTML(c.sourceUrl)+'" target="_blank" rel="noopener noreferrer">Consultar documento original</a>':'';
    return '<details class="exam-case"><summary>'+escapeHTML(c.label||'Caso del examen')+'</summary>'+
      '<p class="exam-context">'+escapeHTML(c.context||'')+'</p>'+table(c)+
      '<ol class="exam-incisos">'+sections+'</ol>'+source+'</details>';
  }).join('');
  return '<details class="exam-archive"><summary><span>Parciales anteriores resueltos</span><small>'+cases.length+' casos · abrir</small></summary>'+
    (notice?'<p class="exam-intro">'+escapeHTML(notice)+'</p>':'')+
    parts+'</details>';
}

function practices(u){return u.practice.map((q,i)=>{
  const grade=answers['__grade__:'+q.id];
  const state=grade==='correct'?' review-correct':grade==='incorrect'?' review-incorrect':'';
  return '<section class="exercise'+state+'" id="'+escapeHTML(q.id)+'"><h2><span class="ex-index" aria-label="Ejercicio '+(i+1)+'">'+String(i+1).padStart(2,'0')+'</span>'+escapeHTML(q.title)+'</h2>'+exercisePrompt(q)+table(q)+chart(q)+pairs(q)+practiceBody(q)+'<div class="review-controls"><button type="button" class="review-toggle" data-reveal="'+escapeHTML(q.id)+'" aria-expanded="false">Ver respuesta</button><button type="button" class="review-cheat" data-cheat="'+escapeHTML(q.id)+'">Machete</button><button type="button" class="review-next" data-next="'+escapeHTML(q.id)+'"'+(grade?'':' hidden')+'>Siguiente ›</button></div><div class="review-panel" data-review-panel="'+escapeHTML(q.id)+'" hidden></div><span class="sr-only">Fuente: '+escapeHTML(q.source||'Ejercicio adaptado')+'</span></section>'
}).join('') }

return {theory,cheat,practices,reviewAnswer,examArchive};
}

