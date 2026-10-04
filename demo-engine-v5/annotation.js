(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class DemoAnnotationController{
  constructor(engine){this.engine=engine;this.path=engine.ui.annotationPath||engine.ui.tracePath;}
  geometry(type,el,opts={}){
    const r=this.engine.rect(el),pad=opts.pad??8;
    if(type==='underline'){
      const y=r.bottom+pad;return{d:`M ${r.left} ${y} L ${r.right} ${y}`,start:{x:r.left,y},end:{x:r.right,y}};
    }
    if(type==='circle'){
      const cx=r.cx,cy=r.cy,rx=r.width/2+pad,ry=r.height/2+pad;
      return{d:`M ${cx-rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx+rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx-rx} ${cy}`,start:{x:cx-rx,y:cy},end:{x:cx-rx,y:cy}};
    }
    if(type==='arrow'){
      const from=opts.from||{x:r.left-pad*2,y:r.cy},to=opts.to||{x:r.right+pad,y:r.cy};
      return{d:`M ${from.x} ${from.y} L ${to.x} ${to.y}`,start:from,end:to};
    }
    const left=r.left-pad,top=r.top-pad,right=r.right+pad,bottom=r.bottom+pad;
    return{d:`M ${left} ${top} L ${right} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`,start:{x:left,y:top},end:{x:left,y:top}};
  }
  async draw(type,target,opts={},token=this.engine.runToken){
    const el=this.engine.target(target);if(!el||!this.path)return false;
    await this.engine.viewport.ensureVisible(el,{},token);
    const g=this.geometry(type,el,opts),path=this.path;
    path.setAttribute('d',g.d);path.hidden=false;path.classList.remove('fade');path.dataset.annotation=type;
    let len=1;try{len=Math.max(1,path.getTotalLength())}catch{}
    path.style.transition='none';path.style.strokeDasharray=`${len}`;path.style.strokeDashoffset=`${len}`;
    const mode='arrow',[hx,hy]=this.engine._pointerHotspot(mode);
    this.engine.pointerMode(mode,true);
    await this.engine.movePointerPoint(g.start.x-hx,g.start.y-hy,{mode,guide:false,correction:false},token);
    const duration=(opts.duration??clamp(len*2.2,650,1800))/(this.engine.speed*this.engine.preset().speed);
    const t0=performance.now();
    await new Promise((resolve,reject)=>{
      const tick=now=>{
        if(token!==this.engine.runToken){reject(new DOMException('aborted','AbortError'));return;}
        const raw=clamp((now-t0)/duration,0,1),e=raw<.5?4*raw*raw*raw:1-Math.pow(-2*raw+2,3)/2;
        const at=len*e;
        let pt;try{pt=path.getPointAtLength(at)}catch{pt={x:g.start.x,y:g.start.y}}
        this.engine.ui.pointer.hidden=false;
        this.engine.ui.pointer.style.transform=`translate3d(${pt.x-hx}px,${pt.y-hy}px,0)`;
        this.engine.state.pointer.x=pt.x-hx;this.engine.state.pointer.y=pt.y-hy;
        path.style.strokeDashoffset=`${len-at}`;
        if(raw<1)requestAnimationFrame(tick);else resolve();
      };requestAnimationFrame(tick);
    });
    path.style.strokeDashoffset='0';
    this.engine.observer.emit('annotation_draw',{type,target:this.engine._targetName(el),duration:Math.round(duration)});
    await this.engine._delay(opts.hold??700,token);
    path.classList.add('fade');await this.engine._delay(220,token);path.hidden=true;path.classList.remove('fade');
    return true;
  }
}
global.DemoAnnotationController=DemoAnnotationController;
})(typeof window!=='undefined'?window:globalThis);