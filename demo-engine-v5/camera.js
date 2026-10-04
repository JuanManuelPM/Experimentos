(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class DemoCameraController{
  constructor(engine){this.engine=engine;this.camera=engine.ui.camera;}
  adaptiveScale(el,opts={}){
    const r=this.engine.rect(el),W=this.engine.ui.stage.clientWidth,H=this.engine.ui.stage.clientHeight;
    const max=opts.max??1.42,min=opts.min??1.14;
    const sx=(W*(opts.targetWidthFraction??.48))/Math.max(1,r.width);
    const sy=(H*(opts.targetHeightFraction??.38))/Math.max(1,r.height);
    return clamp(Math.min(sx,sy),min,max);
  }
  async animate(from,to,duration,targetEl,token){
    const cam=this.camera,st=performance.now(),eng=this.engine;
    const [hx,hy]=eng._pointerHotspot(eng.state.pointer.mode);
    await new Promise((resolve,reject)=>{
      const tick=now=>{
        if(token!==eng.runToken){reject(new DOMException('aborted','AbortError'));return;}
        const raw=clamp((now-st)/duration,0,1),e=raw<.5?4*raw*raw*raw:1-Math.pow(-2*raw+2,3)/2;
        const x=from.x+(to.x-from.x)*e,y=from.y+(to.y-from.y)*e,s=from.scale+(to.scale-from.scale)*e;
        cam.style.transform=`translate3d(${x}px,${y}px,0) scale(${s})`;
        if(targetEl&&!eng.ui.pointer.hidden){
          const r=eng.rect(targetEl),px=r.cx-hx,py=r.cy-hy;
          eng.ui.pointer.style.transform=`translate3d(${px}px,${py}px,0)`;
          eng.state.pointer.x=px;eng.state.pointer.y=py;
        }
        if(raw<1)requestAnimationFrame(tick);else resolve();
      };requestAnimationFrame(tick);
    });
  }
  async focus(target,opts={},token=this.engine.runToken){
    const el=this.engine.target(target);if(!el||!this.camera)return false;
    await this.engine.viewport.ensureVisible(el,{},token);
    await this.engine.movePointerTo(el,{guide:false,ensureVisible:false},token);
    const r=this.engine.rect(el),W=this.engine.ui.stage.clientWidth,H=this.engine.ui.stage.clientHeight,scale=opts.scale||this.adaptiveScale(el,opts);
    const tx=W/2-r.cx*scale,ty=H/2-r.cy*scale;
    const from={x:0,y:0,scale:1},to={x:tx,y:ty,scale};
    this.engine._showAction?.('FOCUS',`×${scale.toFixed(2)}`);
    await this.animate(from,to,(opts.duration??520)/(this.engine.speed*this.engine.preset().speed),el,token);
    await this.engine._delay(opts.hold??1050,token);
    if(opts.return!==false)await this.animate(to,from,(opts.returnDuration??470)/(this.engine.speed*this.engine.preset().speed),el,token);
    this.camera.style.transform='';this.engine._hideAction?.();
    this.engine.observer.emit('camera_focus_v5',{target:this.engine._targetName(el),scale});
    return true;
  }
}
global.DemoCameraController=DemoCameraController;
})(typeof window!=='undefined'?window:globalThis);