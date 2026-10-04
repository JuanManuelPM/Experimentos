(function(global){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
class DemoViewportController{
  constructor(engine){this.engine=engine;this.stage=engine.ui.stage;}
  isScrollable(el){if(!el||el===document.body)return false;const s=getComputedStyle(el);return /(auto|scroll)/.test(s.overflowY)&&el.scrollHeight>el.clientHeight+2;}
  scrollAncestors(el){
    const out=[];let p=el?.parentElement;
    while(p&&p!==this.stage){if(this.isScrollable(p))out.push(p);p=p.parentElement;}
    const declared=this.stage.querySelector('[data-demo-page-scroll]');
    if(declared&&declared.contains(el)&&!out.includes(declared))out.push(declared);
    return out;
  }
  visibleIn(el,container,margin=46){
    const r=el.getBoundingClientRect(),c=container.getBoundingClientRect();
    return r.top>=c.top+margin&&r.bottom<=c.bottom-margin&&r.left>=c.left+Math.min(24,margin)&&r.right<=c.right-Math.min(24,margin);
  }
  async animateScroll(container,to,duration=620,token=this.engine.runToken){
    const start=container.scrollTop,max=Math.max(0,container.scrollHeight-container.clientHeight),end=clamp(to,0,max),delta=end-start;
    if(Math.abs(delta)<2)return;
    const t0=performance.now(),ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    await new Promise((resolve,reject)=>{
      const tick=now=>{
        if(token!==this.engine.runToken){reject(new DOMException('aborted','AbortError'));return;}
        const raw=clamp((now-t0)/duration,0,1),e=ease(raw);
        container.scrollTop=start+delta*e;
        if(raw<1)requestAnimationFrame(tick);else resolve();
      };
      requestAnimationFrame(tick);
    });
  }
  async ensureVisible(el,opts={},token=this.engine.runToken){
    if(!el)return false;
    const margin=opts.margin??54,anc=this.scrollAncestors(el);
    for(const scroller of anc){
      if(this.visibleIn(el,scroller,margin))continue;
      const r=el.getBoundingClientRect(),c=scroller.getBoundingClientRect();
      const desiredTop=c.top+Math.max(margin,(c.height-r.height)/2);
      const delta=r.top-desiredTop;
      this.engine._showAction?.('SCROLL TO',this.engine._targetName(el));
      this.engine.observer.emit('viewport_scroll_start',{target:this.engine._targetName(el),container:scroller.getAttribute('data-demo-id')||scroller.getAttribute('data-demo-page-scroll')!==null?'page':'scroll'});
      await this.animateScroll(scroller,scroller.scrollTop+delta,opts.duration??620,token);
      await this.engine._delay(opts.settle??180,token);
      this.engine.observer.emit('viewport_scroll_end',{target:this.engine._targetName(el),scrollTop:Math.round(scroller.scrollTop)});
      this.engine._hideAction?.();
    }
    return true;
  }
}
global.DemoViewportController=DemoViewportController;
})(typeof window!=='undefined'?window:globalThis);