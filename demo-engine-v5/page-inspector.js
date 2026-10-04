(function(global){
'use strict';
class DemoPageInspector{
  static inferType(el){
    const tag=(el.tagName||'').toLowerCase(),type=(el.type||'').toLowerCase();
    if(tag==='button'||el.getAttribute('role')==='button')return'button';
    if(tag==='textarea'||(tag==='input'&&['text','search','email','url','password'].includes(type||'text')))return'text-input';
    if(type==='checkbox')return'checkbox';
    if(type==='range')return'slider';
    if(tag==='select')return'select';
    if(el.scrollHeight>el.clientHeight+3)return'scroll-region';
    return el.dataset.demoType||'region';
  }
  static actions(type){
    const map={
      button:['show','activate','focus','annotate'],
      'text-input':['show','focus','enter','clear','annotate'],
      checkbox:['show','activate','focus'],
      slider:['show','set','focus'],
      select:['show','choose','focus'],
      'scroll-region':['show','scroll','focus','annotate'],
      region:['show','focus','annotate']
    };
    return map[type]||map.region;
  }
  static inspect(root){
    const items=[];
    root.querySelectorAll('[data-demo-id]').forEach(el=>{
      const id=el.dataset.demoId,type=this.inferType(el);
      let p=el.parentElement,scrollContainer=null;
      while(p&&p!==root){if(p.scrollHeight>p.clientHeight+3&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)){scrollContainer=p.dataset.demoId||'page';break;}p=p.parentElement;}
      items.push({id,type,label:(el.getAttribute('aria-label')||el.textContent||el.getAttribute('placeholder')||'').trim().replace(/\s+/g,' ').slice(0,80),actions:this.actions(type),scrollContainer});
    });
    return{schema:'demo.page-manifest/v1',generatedAt:new Date().toISOString(),targets:items};
  }
}
global.DemoPageInspector=DemoPageInspector;
})(typeof window!=='undefined'?window:globalThis);