(function(global){
'use strict';
class DemoViewportAuthority{
  constructor(engine){
    this.engine=engine;this.stage=engine.ui.stage;this.owner='FREE';this.session=0;
    this.scrollKeys=new Set(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Spacebar']);
    this.block=this.block.bind(this);this.key=this.key.bind(this);
    this.stage.addEventListener('wheel',this.block,{capture:true,passive:false});
    this.stage.addEventListener('touchmove',this.block,{capture:true,passive:false});
    document.addEventListener('keydown',this.key,true);
  }
  block(e){if(this.owner!=='ENGINE')return;if(e.target?.closest?.('[data-demo-controls]'))return;e.preventDefault();e.stopImmediatePropagation();}
  key(e){if(this.owner!=='ENGINE'||!this.scrollKeys.has(e.key))return;if(e.target?.closest?.('[data-demo-controls]'))return;e.preventDefault();e.stopImmediatePropagation();}
  acquire(){
    this.owner='ENGINE';const id=++this.session;
    this.stage.classList.add('demo-engine-owned');
    this.stage.dataset.viewportOwner='ENGINE';
    this.engine.observer.emit('viewport_authority',{owner:'ENGINE',session:id});
    return id;
  }
  release(id=this.session){
    if(id!==this.session)return false;
    this.owner='FREE';this.stage.classList.remove('demo-engine-owned');this.stage.dataset.viewportOwner='FREE';
    this.engine.observer.emit('viewport_authority',{owner:'FREE',session:id});return true;
  }
  userTurn(){
    this.owner='USER';this.stage.classList.remove('demo-engine-owned');this.stage.dataset.viewportOwner='USER';
    this.engine.observer.emit('viewport_authority',{owner:'USER',session:this.session});
  }
  destroy(){this.stage.removeEventListener('wheel',this.block,true);this.stage.removeEventListener('touchmove',this.block,true);document.removeEventListener('keydown',this.key,true);}
}
global.DemoViewportAuthority=DemoViewportAuthority;
})(typeof window!=='undefined'?window:globalThis);