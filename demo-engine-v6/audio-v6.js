(function(global){
'use strict';
class DemoAudioDirectorV6 extends global.DemoAudioDirector{
  constructor(engine,opts={}){super(engine,{...opts,volume:opts.volume??.05});this.textEvery=opts.textEvery??3;}
  async textBlips(text,emitChar,{minGap=9,maxGap=18,soundEvery=this.textEvery}={}){
    let i=0,voiced=0;
    for(const ch of String(text)){
      emitChar(ch,i++);
      if(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(ch)){
        if(this.textVoice&&(voiced++%Math.max(1,soundEvery)===0)){
          const base=285+(ch.charCodeAt(0)%6)*16;
          this.tone(base,.018,'square',.085);
        }
      }
      const rnd=this.engine.rand?.next?.()??Math.random();
      const gap=/[.!?]/.test(ch)?65:/[,;:]/.test(ch)?42:(minGap+rnd*(maxGap-minGap));
      await new Promise(r=>setTimeout(r,gap));
    }
  }
}
global.DemoAudioDirectorV6=DemoAudioDirectorV6;
})(typeof window!=='undefined'?window:globalThis);