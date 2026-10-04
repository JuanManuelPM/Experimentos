(function(global){
'use strict';
class DemoEngineV6 extends global.DemoEngineV5{
  constructor(root,script={},options={}){
    super(root,script,options);
    this.presets.SHOWCASE={speed:1.28,minMove:275,maxMove:760,arrival:95,down:78,resultHold:330,curve:.075,correction:2,guide:'none',observe:390};
    this.authority=new global.DemoViewportAuthority(this);
    this.audio.volume=options.audio?.volume??.055;
    this.audio.textVoice=options.audio?.textVoice!==false;
  }
  async play(from=this.index){
    if(this.playing)return;
    const authoritySession=this.authority.acquire();
    try{return await super.play(from);}
    finally{this.authority.release(authoritySession);}
  }
  stop(reason='manual'){
    const out=super.stop(reason);
    this.authority?.release();
    return out;
  }
  async narrateV5(text,opts={},token=this.runToken){
    const caption=this.ui.caption;if(!caption){await this._delay(opts.hold??240,token);return;}
    if(this.ui.kicker)this.ui.kicker.textContent=opts.kicker||this.script.title||'DEMO';
    caption.textContent='';
    await this.audio.textBlips(this.interpolate(text||''),(ch)=>caption.textContent+=ch,{minGap:9,maxGap:18,soundEvery:3});
    await this._delay(opts.hold??220,token);
  }
  async enterV5(target,text,opts={},token=this.runToken){
    const el=this.target(target);if(!el)return false;
    await this.viewport.ensureVisible(el,{},token);
    await this.type(el,text,{human:true,delay:17,clear:opts.clear!==false},token);
    if(opts.submit)await this.activateV5(opts.submit,{},token);
    return true;
  }
}
global.DemoEngineV6=DemoEngineV6;
})(typeof window!=='undefined'?window:globalThis);