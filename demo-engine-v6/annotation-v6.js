(function(global){
'use strict';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

class DemoAnnotationControllerV6{
  constructor(engine){
    this.engine=engine;
    this.surface=engine.root.querySelector('[data-demo-annotation-surface]');
    this.active=new Set();
    this.timers=new Set();
  }

  clear(){
    for(const t of this.timers)clearTimeout(t);
    this.timers.clear();
    for(const p of this.active)p.remove();
    this.active.clear();
  }

  pointFromClient(x,y){
    const svg=this.surface;
    if(!svg)return{x,y};
    const m=svg.getScreenCTM?.();
    if(m&&global.DOMPoint){
      const p=new DOMPoint(x,y).matrixTransform(m.inverse());
      return{x:p.x,y:p.y};
    }
    const r=svg.getBoundingClientRect();
    return{x:x-r.left,y:y-r.top};
  }

  pointToStage(x,y){
    const svg=this.surface,stage=this.engine.ui.stage;
    const m=svg?.getScreenCTM?.();
    if(m&&global.DOMPoint){
      const p=new DOMPoint(x,y).matrixTransform(m);
      const s=stage.getBoundingClientRect();
      return{x:p.x-s.left,y:p.y-s.top};
    }
    const r=svg.getBoundingClientRect(),s=stage.getBoundingClientRect();
    return{x:r.left-s.left+x,y:r.top-s.top+y};
  }

  geometry(type,el,opts={}){
    const r=el.getBoundingClientRect(),pad=opts.pad??8;
    const tl=this.pointFromClient(r.left-pad,r.top-pad);
    const tr=this.pointFromClient(r.right+pad,r.top-pad);
    const br=this.pointFromClient(r.right+pad,r.bottom+pad);
    const bl=this.pointFromClient(r.left-pad,r.bottom+pad);

    if(type==='underline'){
      const a=this.pointFromClient(r.left,r.bottom+pad);
      const b=this.pointFromClient(r.right,r.bottom+pad);
      return{d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,start:a};
    }

    if(type==='circle'){
      const c=this.pointFromClient(r.left+r.width/2,r.top+r.height/2);
      const rx=Math.max(1,(tr.x-tl.x)/2),ry=Math.max(1,(bl.y-tl.y)/2);
      return{
        d:`M ${c.x-rx} ${c.y} A ${rx} ${ry} 0 1 0 ${c.x+rx} ${c.y} A ${rx} ${ry} 0 1 0 ${c.x-rx} ${c.y}`,
        start:{x:c.x-rx,y:c.y}
      };
    }

    if(type==='arrow'){
      const a=opts.from?this.pointFromClient(opts.from.x,opts.from.y):this.pointFromClient(r.left-pad*2,r.top+r.height/2);
      const b=opts.to?this.pointFromClient(opts.to.x,opts.to.y):this.pointFromClient(r.right+pad,r.top+r.height/2);
      return{d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,start:a};
    }

    return{
      d:`M ${tl.x} ${tl.y} L ${tr.x} ${tr.y} L ${br.x} ${br.y} L ${bl.x} ${bl.y} Z`,
      start:tl
    };
  }

  makePath(type,d){
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',d);
    p.setAttribute('class','annotation-stroke');
    p.dataset.annotation=type;
    this.surface.appendChild(p);
    this.active.add(p);
    return p;
  }

  scheduleRetire(path,hold=850){
    const timer=setTimeout(()=>{
      this.timers.delete(timer);
      if(!path.isConnected)return;
      path.classList.add('fade');
      const removeTimer=setTimeout(()=>{
        this.timers.delete(removeTimer);
        path.remove();
        this.active.delete(path);
      },260);
      this.timers.add(removeTimer);
    },hold);
    this.timers.add(timer);
  }

  async draw(type,target,opts={},token=this.engine.runToken){
    const el=this.engine.target(target);
    if(!el||!this.surface)return false;

    await this.engine.viewport.ensureVisible(el,{},token);

    const g=this.geometry(type,el,opts);
    const path=this.makePath(type,g.d);
    let len=1;
    try{len=Math.max(1,path.getTotalLength())}catch{}

    path.style.strokeDasharray=String(len);
    path.style.strokeDashoffset=String(len);

    const mode='arrow',[hx,hy]=this.engine._pointerHotspot(mode);
    this.engine.pointerMode(mode,true);

    const startStage=this.pointToStage(g.start.x,g.start.y);
    await this.engine.movePointerPoint(startStage.x-hx,startStage.y-hy,{mode,guide:false,correction:false},token);

    const duration=(opts.duration??clamp(len*2.05,520,1450))/(this.engine.speed*this.engine.preset().speed);
    const started=performance.now();

    await new Promise((resolve,reject)=>{
      const tick=now=>{
        if(token!==this.engine.runToken){
          path.remove();this.active.delete(path);
          reject(new DOMException('aborted','AbortError'));return;
        }
        const raw=clamp((now-started)/duration,0,1);
        const e=raw<.5?4*raw*raw*raw:1-Math.pow(-2*raw+2,3)/2;
        const at=len*e;
        let pt;
        try{pt=path.getPointAtLength(at)}catch{pt=g.start}

        const stagePt=this.pointToStage(pt.x,pt.y);
        this.engine.ui.pointer.hidden=false;
        this.engine.ui.pointer.style.transform=`translate3d(${stagePt.x-hx}px,${stagePt.y-hy}px,0)`;
        this.engine.state.pointer.x=stagePt.x-hx;
        this.engine.state.pointer.y=stagePt.y-hy;
        path.style.strokeDashoffset=String(len-at);

        if(raw<1)requestAnimationFrame(tick);else resolve();
      };
      requestAnimationFrame(tick);
    });

    path.style.strokeDashoffset='0';
    this.engine.observer.emit('annotation_draw',{
      type,
      target:this.engine._targetName(el),
      duration:Math.round(duration),
      coordinateSpace:'world',
      detachedFromPointer:true
    });

    this.scheduleRetire(path,opts.hold??850);
    await this.engine._delay(opts.settleAfterDraw??70,token);
    return true;
  }
}

global.DemoAnnotationControllerV6=DemoAnnotationControllerV6;
})(typeof window!=='undefined'?window:globalThis);