(function(global){
'use strict';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

class DemoEngineV4 extends global.DemoEngineV3{
  constructor(root,script={},options={}){
    super(root,script,options);
    this.presets.CALM={...this.presets.CALM,guide:'arrow',observe:900};
    this.presets.PRODUCT={...this.presets.PRODUCT,guide:'ghost',observe:620};
    this.presets.FAST={...this.presets.FAST,guide:'none',observe:340};
    this.presets.TEACH={...this.presets.TEACH,guide:'laser',observe:900};
    this._guideTimer=null;
    this._traceTimer=null;
    this._lastActionPoint={x:this.state.pointer.x,y:this.state.pointer.y};
  }

  _bindUI(){
    const ui=super._bindUI();
    const q=s=>this.root.querySelector(s);
    return {...ui,
      motionSvg:q('[data-demo-motion-svg]'),
      trail:q('[data-demo-trail]'),
      tracePath:q('[data-demo-trace-path]'),
      wheel:q('[data-demo-wheel]'),
      measure:q('[data-demo-measure]'),
      actionHud:q('[data-demo-action-hud]')
    };
  }

  _showAction(label,detail=''){
    if(!this.ui.actionHud)return;
    this.ui.actionHud.hidden=false;
    this.ui.actionHud.innerHTML=`<b>${String(label||'').toUpperCase()}</b>${detail?`<span>${detail}</span>`:''}`;
  }
  _hideAction(){if(this.ui.actionHud)this.ui.actionHud.hidden=true;}

  pointerMode(mode='arrow',preserveHotspot=true){
    const hadState=!!this.state?.pointer;
    const old=hadState&&preserveHotspot?this._hotspotPoint(this.state.pointer.mode):null;
    super.pointerMode(mode);
    if(old&&this.ui.pointer){
      const[hx,hy]=this._pointerHotspot(mode);
      this.state.pointer.x=old.x-hx;this.state.pointer.y=old.y-hy;
      this.ui.pointer.style.transform=`translate3d(${this.state.pointer.x}px,${this.state.pointer.y}px,0)`;
    }
  }

  _targetPoint(el,opts={},mode='arrow'){
    const r=this.rect(el),strategy=opts.strategy||'auto';
    if(Number.isFinite(opts.x)&&Number.isFinite(opts.y))return{x:opts.x,y:opts.y};
    const tag=(el.tagName||'').toLowerCase(),type=(el.type||'').toLowerCase();
    let s=strategy;
    if(s==='auto'){
      if(type==='checkbox'||type==='radio')s='center';
      else if(tag==='input'&&['text','search','email','url','password'].includes(type||'text'))s='text-entry';
      else if(tag==='textarea')s='text-entry';
      else if(el.scrollHeight>el.clientHeight+8)s='scroll';
      else if(tag==='button'||el.getAttribute('role')==='button')s='button';
      else s='center';
    }
    if(s==='button')return{x:r.left+r.width*.60,y:r.top+r.height*.56};
    if(s==='text-entry')return{x:r.left+Math.min(Math.max(28,r.width*.20),72),y:r.top+r.height*.54};
    if(s==='scroll')return{x:r.right-Math.min(24,Math.max(14,r.width*.06)),y:r.top+r.height*.42};
    if(s==='left')return{x:r.left+r.width*.16,y:r.cy};
    if(s==='right')return{x:r.right-r.width*.10,y:r.cy};
    if(s==='top')return{x:r.cx,y:r.top+r.height*.12};
    if(s==='bottom')return{x:r.cx,y:r.bottom-r.height*.12};
    return{x:r.cx,y:r.cy};
  }

  _guidePathData(start,end,bend=0){
    const dx=end.x-start.x,dy=end.y-start.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
    const c1={x:start.x+dx*.32+nx*bend,y:start.y+dy*.32+ny*bend};
    const c2={x:start.x+dx*.72-nx*bend*.35,y:start.y+dy*.72-ny*bend*.35};
    return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
  }

  _prepareTrail(start,end,bend,style='laser'){
    const p=this.ui.trail;if(!p||style==='none')return null;
    clearTimeout(this._guideTimer);
    p.dataset.style=style;
    p.setAttribute('d',this._guidePathData(start,end,bend));
    p.hidden=false;p.classList.remove('fade');
    let len=1;try{len=Math.max(1,p.getTotalLength())}catch{}
    p.style.strokeDasharray=`${len}`;p.style.strokeDashoffset=`${len}`;
    return{path:p,len};
  }
  _progressTrail(g,t){if(g?.path)g.path.style.strokeDashoffset=`${g.len*(1-t)}`;}
  _finishTrail(g,hold=420){
    if(!g?.path)return;
    g.path.style.strokeDashoffset='0';
    clearTimeout(this._guideTimer);
    this._guideTimer=setTimeout(()=>{g.path.classList.add('fade');setTimeout(()=>{g.path.hidden=true;g.path.classList.remove('fade');},220);},hold);
  }

  async movePointerPoint(x2,y2,opts={},token=this.runToken){
    if(!this.ui.pointer)return false;
    const mode=opts.mode||this.state.pointer.mode||'arrow';this.pointerMode(mode,true);
    const p=this.preset(),x1=this.state.pointer.x,y1=this.state.pointer.y,dx=x2-x1,dy=y2-y1,dist=Math.hypot(dx,dy);
    const duration=clamp(opts.duration??(p.minMove+dist*.72),p.minMove,p.maxMove)/(this.speed*p.speed);
    const len=Math.max(1,dist),nx=-dy/len,ny=dx/len,bend=(opts.bend??clamp(dist*p.curve,8,74))*(this.rand.next()>.5?1:-1);
    const c1={x:x1+dx*.30+nx*bend,y:y1+dy*.30+ny*bend},c2={x:x1+dx*.72-nx*bend*.34,y:y1+dy*.72-ny*bend*.34};
    const correction=opts.correction===false?0:clamp(p.correction,0,5),tx=x2+(correction?this.rand.range(-correction,correction):0),ty=y2+(correction?this.rand.range(-correction,correction):0);
    const[hx,hy]=this._pointerHotspot(mode),startHp={x:x1+hx,y:y1+hy},endHp={x:x2+hx,y:y2+hy};
    const guideStyle=opts.guide===false?'none':(opts.guide||((dist>180)?p.guide:'none'));
    const guide=this._prepareTrail(startHp,endHp,bend,guideStyle);
    this.ui.pointer.hidden=false;
    const start=performance.now();
    await new Promise((resolve,reject)=>{
      const tick=now=>{
        if(token!==this.runToken){reject(new DOMException('aborted','AbortError'));return;}
        if(this.paused){requestAnimationFrame(tick);return;}
        const raw=clamp((now-start)/duration,0,1),t=this._ease(raw);
        const x=this._bezier(x1,c1.x,c2.x,tx,t),y=this._bezier(y1,c1.y,c2.y,ty,t);
        this.ui.pointer.style.transform=`translate3d(${x}px,${y}px,0)`;
        this._progressTrail(guide,t);
        if(typeof opts.onFrame==='function')opts.onFrame({x,y,t,raw,hotspot:{x:x+hx,y:y+hy}});
        if(raw<1)requestAnimationFrame(tick);else resolve();
      };requestAnimationFrame(tick);
    });
    if(correction){
      await this._delay(70,token);
      const dur=145/(this.speed*p.speed),st=performance.now();
      await new Promise((resolve,reject)=>{const tick=now=>{if(token!==this.runToken){reject(new DOMException('aborted','AbortError'));return;}const t=clamp((now-st)/dur,0,1),e=this._ease(t),x=tx+(x2-tx)*e,y=ty+(y2-ty)*e;this.ui.pointer.style.transform=`translate3d(${x}px,${y}px,0)`;if(typeof opts.onFrame==='function')opts.onFrame({x,y,t:1,raw:1,hotspot:{x:x+hx,y:y+hy}});if(t<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
    }
    this.ui.pointer.style.transform=`translate3d(${x2}px,${y2}px,0)`;this.state.pointer.x=x2;this.state.pointer.y=y2;
    if(typeof opts.onFrame==='function')opts.onFrame({x:x2,y:y2,t:1,raw:1,hotspot:endHp});
    this._finishTrail(guide,opts.guideHold??430);this._auditOverlayBounds('pointer',this.ui.pointer);
    this._lastActionPoint=endHp;
    return{distance:dist,duration};
  }

  async movePointerTo(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el){this._qualityIssue('missing_target',{target:String(target)});return false;}
    const mode=opts.mode||'arrow',pt=this._targetPoint(el,opts,mode),[hx,hy]=this._pointerHotspot(mode);
    const res=await this.movePointerPoint(pt.x-hx,pt.y-hy,{...opts,mode},token);
    this.observer.emit('pointer_move',{target:this._targetName(el),mode,strategy:opts.strategy||'auto',distance:Math.round(res?.distance||0),duration:Math.round(res?.duration||0)});return true;
  }

  clickFeedback(opts={}){
    const layer=this.ui.clickLayer;if(!layer)return;const p=this._hotspotPoint(),ring=document.createElement('div');ring.className='demo-click-ring';ring.style.left=`${p.x}px`;ring.style.top=`${p.y}px`;layer.appendChild(ring);this.observer.emit('click_feedback',{x:Math.round(p.x),y:Math.round(p.y)});setTimeout(()=>ring.remove(),520);
  }

  async click(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;const p=this.preset();this._showAction('CLICK',this._targetName(el));
    await this.movePointerTo(el,{mode:opts.approachMode||'arrow',strategy:opts.strategy||'auto',guide:opts.guide},token);
    await this._delay(opts.pre??p.arrival,token);
    this.ui.pointer?.classList.add('is-morphing');await this._delay(70,token);this.pointerMode(opts.hand===false?'arrow':'hand',true);this.ui.pointer?.classList.remove('is-morphing');
    await this._delay(95,token);this.ui.pointer?.classList.add('is-down');el.classList.add('demo-pressed');this._synthetic(el,'pointerdown',{button:opts.button||0});
    await this._delay(opts.down??p.down,token);this._synthetic(el,'pointerup',{button:opts.button||0});if(opts.native!==false)el.click();this.clickFeedback();
    this.ui.pointer?.classList.remove('is-down');el.classList.remove('demo-pressed');await this._delay(opts.post??p.observe??p.resultHold,token);this.pointerMode('arrow',true);this._hideAction();
    this.observer.emit('click',{target:this._targetName(el),button:opts.button||0});return true;
  }

  async look(target,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return;this._showAction('LOOK',this._targetName(el));
    await this.movePointerTo(el,{mode:opts.mode||'arrow',strategy:opts.strategy||'auto',guide:opts.guide},token);this.focus(el,true);this.observer.emit('look',{target:this._targetName(el)});await this._delay(opts.hold??1000,token);this.focus(el,false);this._hideAction();
  }

  async trace(target,opts={},token=this.runToken){
    const el=this.target(target),path=this.ui.tracePath;if(!el||!path)return;this._showAction('TRACE',this._targetName(el));
    const r=this.rect(el),pad=opts.pad??9,pts=[[r.left-pad,r.top-pad],[r.right+pad,r.top-pad],[r.right+pad,r.bottom+pad],[r.left-pad,r.bottom+pad],[r.left-pad,r.top-pad]],mode='arrow',[hx,hy]=this._pointerHotspot(mode);
    path.hidden=false;path.classList.remove('fade');path.setAttribute('d',`M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} L ${pts[3][0]} ${pts[3][1]} Z`);
    let L=1;try{L=Math.max(1,path.getTotalLength())}catch{}path.style.strokeDasharray=`${L}`;path.style.strokeDashoffset=`${L}`;
    await this.movePointerPoint(pts[0][0]-hx,pts[0][1]-hy,{mode,guide:false,correction:false},token);
    const seg=opts.segmentDuration??360;
    for(let i=1;i<pts.length;i++){
      path.style.transition=`stroke-dashoffset ${seg/(this.speed*this.preset().speed)}ms cubic-bezier(.2,.8,.2,1)`;
      requestAnimationFrame(()=>path.style.strokeDashoffset=`${L*(1-i/4)}`);
      await this.movePointerPoint(pts[i][0]-hx,pts[i][1]-hy,{mode,guide:false,duration:seg,correction:false},token);
    }
    path.style.strokeDashoffset='0';this.observer.emit('trace',{target:this._targetName(el)});await this._delay(opts.hold??650,token);path.classList.add('fade');await this._delay(220,token);path.hidden=true;path.classList.remove('fade');path.style.transition='';this._hideAction();
  }

  _showWheel(direction,pt){if(!this.ui.wheel)return;this.ui.wheel.hidden=false;this.ui.wheel.textContent=direction>0?'↓':'↑';this.ui.wheel.style.transform=`translate3d(${clamp(pt.x+18,8,this.ui.stage.clientWidth-46)}px,${clamp(pt.y-18,8,this.ui.stage.clientHeight-42)}px,0)`;}
  _hideWheel(){if(this.ui.wheel)this.ui.wheel.hidden=true;}

  async scroll(target,opts={},token=this.runToken){
    const el=this.target(target)||this.ui.stage;this._showAction('SCROLL',this._targetName(el));await this.movePointerTo(el,{mode:'arrow',strategy:'scroll',guide:false},token);await this._delay(160,token);
    let to=opts.to;if(opts.toTarget){const t=this.target(opts.toTarget);if(t)to=(t.offsetTop||0)-el.clientHeight*.40+(t.offsetHeight||0)/2;}if(to==null)to=(el.scrollTop||0)+(opts.by||180);
    const max=Math.max(0,el.scrollHeight-el.clientHeight);to=clamp(to,0,max);const start=el.scrollTop||0,delta=to-start,steps=clamp(Math.ceil(Math.abs(delta)/70),4,14),dir=Math.sign(delta)||1;this._showWheel(dir,this._hotspotPoint());
    for(let i=1;i<=steps;i++){const e=this._ease(i/steps);el.scrollTop=start+delta*e;this.ui.wheel?.classList.remove('tick');void this.ui.wheel?.offsetWidth;this.ui.wheel?.classList.add('tick');this.observer.emit('wheel_tick',{target:this._targetName(el),scrollTop:Math.round(el.scrollTop)});await this._delay(opts.tickDelay??115,token);}
    if(opts.correct!==false&&Math.abs(delta)>150){const over=clamp(delta*.025,-10,10);el.scrollTop=clamp(el.scrollTop+over,0,max);await this._delay(130,token);el.scrollTop=to;await this._delay(150,token);}await this._delay(opts.observe??550,token);this._hideWheel();this._hideAction();this.observer.emit('scroll',{target:this._targetName(el),to:Math.round(el.scrollTop)});
  }

  async drag(fromTarget,toTarget,opts={},token=this.runToken){
    const from=this.target(fromTarget),to=this.target(toTarget);if(!from||!to)return;this._showAction('DRAG',`${this._targetName(from)} → ${this._targetName(to)}`);
    await this.movePointerTo(from,{mode:'grab',strategy:'button',guide:false},token);await this._delay(opts.pre??this.preset().arrival,token);this.pointerMode('grabbing',true);this.ui.pointer?.classList.add('is-down');from.classList.add('is-dragging');to.classList.add('drop-active');this._synthetic(from,'pointerdown',{button:0});await this._delay(opts.hold??170,token);
    const startHp=this._hotspotPoint('grabbing'),toR=this.rect(to),[hx,hy]=this._pointerHotspot('grabbing'),endX=toR.cx-hx,endY=toR.cy-hy;
    await this.movePointerPoint(endX,endY,{mode:'grabbing',duration:opts.duration??900,correction:false,guide:opts.guide||'laser',onFrame:({hotspot})=>{const dx=hotspot.x-startHp.x,dy=hotspot.y-startHp.y;from.style.transform=`translate3d(${dx}px,${dy}px,0)`;}},token);
    this._synthetic(from,'pointermove');await this._delay(150,token);this._synthetic(to,'pointerup',{button:0});if(opts.callDrop!==false)this._synthetic(to,'drop');this.ui.pointer?.classList.remove('is-down');from.classList.remove('is-dragging');to.classList.remove('drop-active');this.pointerMode('grab',true);await this._delay(opts.observe??700,token);this.pointerMode('arrow',true);this._hideAction();this.observer.emit('drag',{from:this._targetName(from),to:this._targetName(to)});
  }

  _showMeasure(text,pt){if(!this.ui.measure)return;this.ui.measure.hidden=false;this.ui.measure.textContent=text;this.ui.measure.style.transform=`translate3d(${clamp(pt.x+18,8,this.ui.stage.clientWidth-110)}px,${clamp(pt.y+14,8,this.ui.stage.clientHeight-42)}px,0)`;}
  _hideMeasure(){if(this.ui.measure)this.ui.measure.hidden=true;}

  async resize(target,{width,height,duration=850,...opts}={},token=this.runToken){
    const el=this.target(target);if(!el)return;this._showAction('RESIZE',this._targetName(el));const r=this.rect(el),cs=getComputedStyle(el),fw=parseFloat(cs.width),fh=parseFloat(cs.height),tw=width??fw,th=height??fh,dw=tw-fw,dh=th-fh;
    let mode='resize-ew',sx=r.right,sy=r.cy,ex=r.right+dw,ey=r.cy;if(Math.abs(dw)>8&&Math.abs(dh)>8){mode='resize-d1';sx=r.right;sy=r.bottom;ex=r.right+dw;ey=r.bottom+dh;}else if(Math.abs(dh)>Math.abs(dw)){mode='resize-ns';sx=r.cx;sy=r.bottom;ex=r.cx;ey=r.bottom+dh;}
    const[hx,hy]=this._pointerHotspot(mode);await this.movePointerPoint(sx-hx,sy-hy,{mode,guide:false},token);await this._delay(170,token);this.ui.pointer?.classList.add('is-down');this._synthetic(el,'pointerdown',{button:0});const startHp=this._hotspotPoint(mode);
    await this.movePointerPoint(ex-hx,ey-hy,{mode,duration,correction:false,guide:opts.guide||'arrow',onFrame:({hotspot})=>{const nx=Math.max(70,fw+(hotspot.x-startHp.x)),ny=Math.max(60,fh+(hotspot.y-startHp.y));if(Math.abs(dw)>8)el.style.width=`${nx}px`;if(Math.abs(dh)>8)el.style.height=`${ny}px`;this._showMeasure(`${Math.round(nx)} × ${Math.round(ny)}`,hotspot);}},token);
    if(width)el.style.width=`${width}px`;if(height)el.style.height=`${height}px`;this._synthetic(el,'pointerup',{button:0});this.ui.pointer?.classList.remove('is-down');await this._delay(opts.observe??650,token);this._hideMeasure();this.pointerMode('arrow',true);this._hideAction();this.observer.emit('resize',{target:this._targetName(el),width,height});
  }

  async _animateCameraState(cam,from,to,duration,targetEl,token){
    const st=performance.now(),ease=t=>this._ease(t),[hx,hy]=this._pointerHotspot(this.state.pointer.mode);
    await new Promise((resolve,reject)=>{const tick=now=>{if(token!==this.runToken){reject(new DOMException('aborted','AbortError'));return;}if(this.paused){requestAnimationFrame(tick);return;}const raw=clamp((now-st)/duration,0,1),e=ease(raw),cur={x:from.x+(to.x-from.x)*e,y:from.y+(to.y-from.y)*e,scale:from.scale+(to.scale-from.scale)*e};cam.style.transform=`translate(${cur.x}px,${cur.y}px) scale(${cur.scale})`;if(targetEl&&this.ui.pointer&&!this.ui.pointer.hidden){const r=this.rect(targetEl),x=r.cx-hx,y=r.cy-hy;this.ui.pointer.style.transform=`translate3d(${x}px,${y}px,0)`;this.state.pointer.x=x;this.state.pointer.y=y;}if(raw<1)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});
  }

  async cameraFocus(target,opts={},token=this.runToken){
    const el=this.target(target),cam=this.ui.camera;if(!el||!cam)return;this._showAction('FOCUS CAMERA',this._targetName(el));await this.movePointerTo(el,{mode:'arrow',guide:false},token);
    const r=this.rect(el),W=this.ui.stage.clientWidth,H=this.ui.stage.clientHeight,scale=clamp(opts.scale??1.10,1,1.16),dx=(W/2-r.cx)*(scale-1),dy=(H/2-r.cy)*(scale-1),from=cam._demoCamera||{x:0,y:0,scale:1},to={x:dx,y:dy,scale};
    try{await this._animateCameraState(cam,from,to,(opts.duration??520)/(this.speed*this.preset().speed),el,token);cam._demoCamera=to;await this._delay(opts.hold??1000,token);if(opts.return!==false){await this._animateCameraState(cam,to,{x:0,y:0,scale:1},(opts.returnDuration??480)/(this.speed*this.preset().speed),el,token);cam.style.transform='';cam._demoCamera={x:0,y:0,scale:1};}}catch(e){this.observer.emit('camera_fallback',{target:this._targetName(el),message:e.message});cam.style.transform='';cam._demoCamera={x:0,y:0,scale:1};}
    this._hideAction();this.observer.emit('camera_focus',{target:this._targetName(el),scale});
  }

  async visualHold(ms=700,token=this.runToken){this._showAction('OBSERVE','mirá el resultado');this.observer.emit('visual_hold',{ms});await this._delay(ms,token);this._hideAction();}

  qualityAudit(){
    if(this.ui.pointer&&!this.ui.pointer.hidden)this._auditOverlayBounds('pointer',this.ui.pointer);
    if(this.ui.comment&&!this.ui.comment.hidden)this._auditOverlayBounds('comment',this.ui.comment);
    if(this.ui.gesture&&!this.ui.gesture.hidden)this._auditOverlayBounds('gesture',this.ui.gesture);
    const out=super.qualityAudit();out.motionDirector='V4';return out;
  }

  reset(){clearTimeout(this._guideTimer);clearTimeout(this._traceTimer);super.reset();if(this.ui.trail)this.ui.trail.hidden=true;if(this.ui.tracePath)this.ui.tracePath.hidden=true;this._hideWheel();this._hideMeasure();this._hideAction();}
}

global.DemoEngineV4=DemoEngineV4;
})(typeof window!=='undefined'?window:globalThis);