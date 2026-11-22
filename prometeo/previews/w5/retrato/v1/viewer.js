/* NARA — actor facial vectorial original. API estable: window.PROMETEO_CHARACTER.
   Recurso 2.5D, no esqueleto GLB. MIT para controlador; artwork original usuario. */
(() => {
  'use strict';
  const obj = document.querySelector('#art');
  const stage = document.querySelector('#stage');
  const shell = document.querySelector('#shell');
  const status = document.querySelector('#status');
  const buttons = [...document.querySelectorAll('[data-expression]')];
  const moods = ['serena', 'sonrisa', 'duda', 'sorpresa', 'tristeza'];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const qs = new URLSearchParams(location.search);
  const state = { expression: moods.includes(qs.get('expression')) ? qs.get('expression') : 'serena', gaze: [0,0], pose: [0,0], shot: qs.get('shot') === 'rostro' ? 'rostro' : 'busto', ready: false };
  let doc = null, currentPointer = null, start = null, timer = null, sequenceTimer = null, sequenceActive = false, sequenceIndex = 0;
  if (qs.has('embed') && qs.get('embed') !== '0') document.body.classList.add('embed');
  const $ = (id) => doc && doc.getElementById(id);
  function put(id, attr, value) { const el = $(id); if (el) el.setAttribute(attr, value); }
  function css(id, key, value) { const el = $(id); if (el) el.style[key] = value; }
  const mouths = {
    serena: { dark:'M443 692 Q504 701 567 683 Q512 714 443 692Z', line:'M443 692 Q504 702 567 683', hi:'M467 720 Q513 726 545 707', teeth:false },
    sonrisa: { dark:'M437 684 Q500 736 573 676 Q522 766 437 684Z', line:'M437 684 Q504 756 573 676', hi:'M456 728 Q518 760 565 710', teeth:true },
    duda: { dark:'M443 700 Q489 694 566 675 Q523 706 443 700Z', line:'M443 700 Q501 706 566 675', hi:'M473 724 Q515 730 547 702', teeth:false },
    sorpresa: { dark:'M479 685 C479 657 534 652 539 680 C546 715 487 730 479 685Z', line:'M481 685 C481 655 531 655 537 680 C547 721 487 726 481 685Z', hi:'M483 731 Q504 738 528 726', teeth:false },
    tristeza: { dark:'M442 717 Q499 679 565 711 Q505 696 442 717Z', line:'M442 715 Q502 677 563 711', hi:'M468 738 Q504 743 551 733', teeth:false }
  };
  const browPose = {
    serena: [[0,0,0],[0,0,0]], sonrisa:[[-4,0,-4],[4,0,-5]], duda:[[11,0,-4],[-12,0,2]], sorpresa:[[-7,0,-17],[7,0,-15]], tristeza:[[9,0,-8],[-9,0,-8]]
  };

  const microByMood = {
    serena:   [0,.10,0,0,0,0,0,0],
    sonrisa:  [.65,.63,.63,.70,0,.27,0,0],
    duda:     [.28,.25,.13,0,.60,.20,0,.32],
    sorpresa: [0,0,0,0,.15,0,0,.12],
    tristeza: [.45,.60,.12,0,.65,0,.84,.62]
  };
  const eyelids = {
    serena:['M371 496 Q417 480 467 498','M536 490 Q595 469 652 491'],
    sonrisa:['M371 510 Q413 498 467 505','M536 499 Q598 488 652 498'],
    duda:['M371 502 Q414 487 467 496','M536 489 Q595 478 652 495'],
    sorpresa:['M371 490 Q412 478 467 491','M536 483 Q594 464 652 485'],
    tristeza:['M371 507 Q413 498 467 501','M536 502 Q595 492 652 495']
  };
  function applyMicro(name) {
    const v=microByMood[name], ids=['lid-left','lid-right','under-eyes','smile-folds','laugh-lines','frown-lines','nose-wrinkle','tear-stroke','tear-glint','chin-tension'];
    const alphas=[v[0],v[0],v[1],v[2],v[3],v[4],v[5],v[6],v[6]*.82,v[7]];
    ids.forEach((id,i)=>css(id,'opacity',String(alphas[i])));
    put('lid-left','d',eyelids[name][0]);put('lid-right','d',eyelids[name][1]);
  }
  function expression(name) {
    if (!moods.includes(name)) return false;
    state.expression = name;
    const m = mouths[name];
    if (doc) {
      put('mouth-dark','d',m.dark); put('mouth-line','d',m.line); put('mouth-highlight','d',m.hi);
      css('mouth-teeth','opacity',m.teeth?'1':'0');
      css('cheek-smile','opacity',name === 'sonrisa' ? '1' : '0');
      const p = browPose[name];
      const l = $('brow-left'), r = $('brow-right');
      if(l) l.setAttribute('transform',`translate(${p[0][1]},${p[0][2]}) rotate(${p[0][0]} 417 453)`);
      if(r) r.setAttribute('transform',`translate(${p[1][1]},${p[1][2]}) rotate(${p[1][0]} 594 450)`);
      css('eyes-left','transform',name === 'sonrisa' ? 'scaleY(.82)' : 'scaleY(1)');
      css('eyes-right','transform',name === 'sonrisa' ? 'scaleY(.82)' : 'scaleY(1)');
      if(name === 'sorpresa') {css('eyes-left','transform','scaleY(1.12)');css('eyes-right','transform','scaleY(1.12)');}
      applyMicro(name);
    }
    for(const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.expression === name));
    document.dispatchEvent(new CustomEvent('prometeo:expression', {detail:{expression:name}}));
    return true;
  }
  function gaze(x, y) {
    const gx = clamp(Number(x)||0, -1, 1), gy = clamp(Number(y)||0, -1, 1);
    state.gaze = [gx,gy];
    const tr = `translate(${(gx*9).toFixed(2)} ${(gy*6).toFixed(2)})`;
    put('gaze-left','transform',tr); put('gaze-right','transform',tr);
    return [...state.gaze];
  }
  function pose(x, y) {
    state.pose = [clamp(Number(x)||0,-1,1),clamp(Number(y)||0,-1,1)];
    const [a,b] = state.pose;
    shell.style.transform = `translateX(-50%) translateY(${state.shot === 'rostro' ? '-13vh' : '0vh'}) scale(${state.shot === 'rostro' ? 1.75 : 1}) rotateY(${(a*11).toFixed(2)}deg) rotateX(${(-b*7).toFixed(2)}deg)`;
    put('silhouette','transform',`translate(${(-a*9).toFixed(2)} ${(-b*4).toFixed(2)})`);
    put('fringe','transform',`translate(${(a*5).toFixed(2)} ${(b*2).toFixed(2)})`);
    put('garment','transform',`translate(${(-a*4).toFixed(2)} 0)`);
    return [...state.pose];
  }
  function blink() {
    if(!doc) return false;
    for(const id of ['eyes-left','eyes-right']) {
      const el=$(id); if(!el) continue;
      const base = state.expression === 'sonrisa' ? .82 : (state.expression === 'sorpresa' ? 1.12 : 1);
      if (el.animate) el.animate([{transform:`scaleY(${base})`},{transform:'scaleY(.055)'},{transform:`scaleY(${base})`}],{duration:195,iterations:1,easing:'ease-in-out'});
    }
    return true;
  }

  function shot(name) {
    if(name !== 'busto' && name !== 'rostro')return false;
    state.shot=name;pose(...state.pose);
    for(const b of document.querySelectorAll('[data-shot]'))b.setAttribute('aria-pressed',String(b.dataset.shot===name));
    return true;
  }
  function stopSequence(){
    clearInterval(sequenceTimer);sequenceTimer=null;sequenceActive=false;
    const btn=document.getElementById('sequence');
    if(btn){btn.textContent='▶';btn.setAttribute('aria-pressed','false');btn.setAttribute('aria-label','Reproducir secuencia de gestos');}
    return true;
  }
  function toggleSequence(){
    if(sequenceActive)return stopSequence();
    sequenceActive=true;sequenceIndex=moods.indexOf(state.expression);
    const btn=document.getElementById('sequence');
    btn.textContent='■';btn.setAttribute('aria-pressed','true');btn.setAttribute('aria-label','Detener secuencia de gestos');
    shot('rostro');
    sequenceTimer=setInterval(()=>{
      if(document.hidden){stopSequence();return;}
      sequenceIndex=(sequenceIndex+1)%moods.length;
      expression(moods[sequenceIndex]);
      gaze([0,.35,-.5,.1,-.15][sequenceIndex],[0,-.15,.15,-.35,.4][sequenceIndex]);
      if(sequenceIndex===0)blink();
    },1900);
    return true;
  }
  function reset(){stopSequence();gaze(0,0);shot('busto');pose(0,0);expression('serena');return true;}
  function scheduleBlink(){clearTimeout(timer);timer=setTimeout(()=>{if(!document.hidden) blink();scheduleBlink();}, 3300 + Math.random()*3900);}
  function onLoaded(){
    try {
      doc=obj.contentDocument;
      if(!doc || !doc.getElementById('mouth-line')) throw new Error('No se pudo acceder al SVG');
      state.ready=true;status.hidden=true;
      expression(state.expression);gaze(...state.gaze);shot(state.shot);scheduleBlink();
      window.parent?.postMessage({channel:'prometeo.character.v1',type:'ready',name:'nara',formats:['SVG','HTML-2.5D'],expressions:moods},'*');
    } catch(e) {status.textContent='NO SE PUDO INICIALIZAR EL RETRATO';console.error('[Nara]',e);}
  }
  obj.addEventListener('load',onLoaded);
  obj.addEventListener('error',()=>{status.textContent='ARCHIVO SVG NO DISPONIBLE';});
  if(obj.contentDocument?.getElementById('mouth-line')) onLoaded();
  buttons.forEach(b=>b.addEventListener('click',()=>{stopSequence();expression(b.dataset.expression);}));
  document.querySelectorAll('[data-shot]').forEach(b=>b.addEventListener('click',()=>shot(b.dataset.shot)));
  document.getElementById('sequence').addEventListener('click',toggleSequence);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSequence();});
  document.getElementById('reset').addEventListener('click',reset);
  stage.addEventListener('pointerdown',e=>{
    if(currentPointer!==null)return;
    currentPointer=e.pointerId;start={x:e.clientX,y:e.clientY,pose:[...state.pose]};stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();
    gaze(((e.clientX-r.left)/r.width-.5)*2,((e.clientY-r.top)/r.height-.5)*2);
    if(currentPointer === e.pointerId && start) {
      pose(start.pose[0] + (e.clientX-start.x)/Math.max(200,r.width*.65),start.pose[1] + (e.clientY-start.y)/Math.max(200,r.height*.75));
    }
  });
  function done(e) {if(e.pointerId===currentPointer){currentPointer=null;start=null;if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);}}
  stage.addEventListener('pointerup',done);stage.addEventListener('pointercancel',done);
  stage.addEventListener('lostpointercapture',()=>{currentPointer=null;start=null;});
  window.addEventListener('keydown',e=>{
    if(e.target instanceof HTMLElement && ['INPUT','TEXTAREA','BUTTON'].includes(e.target.tagName))return;
    const digit=Number(e.key);
    if(digit>=1 && digit<=5){expression(moods[digit-1]);return;}
    if(e.key==='ArrowRight'){expression(moods[(moods.indexOf(state.expression)+1)%moods.length]);e.preventDefault();}
    if(e.key==='ArrowLeft'){expression(moods[(moods.indexOf(state.expression)+moods.length-1)%moods.length]);e.preventDefault();}
    if(e.key==='Escape') reset();
  });
  window.addEventListener('message',e=>{
    const m=e.data;
    if(!m || m.channel!=='prometeo.character.v1' || m.type!=='command')return;
    if(m.action==='expression') expression(m.value);
    if(m.action==='gaze' && Array.isArray(m.value)) gaze(...m.value);
    if(m.action==='pose' && Array.isArray(m.value)) pose(...m.value);
    if(m.action==='shot') shot(m.value);
    if(m.action==='blink')blink();
    if(m.action==='reset')reset();
  });
  window.PROMETEO_CHARACTER = Object.freeze({name:'nara',version:'1.1.0',format:'illustrated-2.5d-svg',expressions:[...moods],setExpression:expression,setGaze:gaze,setPose:pose,setShot:shot,blink,reset,getState:()=>({expression:state.expression,gaze:[...state.gaze],pose:[...state.pose],shot:state.shot,ready:state.ready})});
})();
