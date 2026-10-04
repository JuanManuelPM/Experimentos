(function(global){
'use strict';
class DemoAudioDirector{
  constructor(engine,opts={}){
    this.engine=engine;this.enabled=opts.enabled!==false;this.profile=opts.profile||'RETRO_OS';this.volume=opts.volume??.18;this.textVoice=opts.textVoice!==false;this.ctx=null;this.last={};
    this.off=engine.observer.on(e=>this.onEvent(e));
  }
  ensure(){if(!this.enabled)return null;if(!this.ctx){const A=global.AudioContext||global.webkitAudioContext;if(!A)return null;this.ctx=new A();}if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});return this.ctx;}
  tone(freq=440,dur=.045,type='square',gain=.12,delay=0){
    const c=this.ensure();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(this.volume*gain,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.02);
  }
  click(){this.tone(230,.035,'square',.75);this.tone(170,.028,'square',.45,.028);}
  success(){this.tone(430,.07,'sine',.55);this.tone(640,.10,'sine',.5,.07);}
  warning(){this.tone(145,.11,'triangle',.55);}
  drop(){this.tone(110,.055,'square',.7);this.tone(82,.07,'triangle',.4,.04);}
  tick(){const now=performance.now();if(now-(this.last.tick||0)<70)return;this.last.tick=now;this.tone(320,.022,'square',.22);}
  onEvent(e){
    if(!this.enabled)return;
    if(e.type==='click_feedback')this.click();
    else if(e.type==='wheel_tick')this.tick();
    else if(e.type==='drag')this.drop();
    else if(e.type==='resize')this.tone(180,.045,'triangle',.35);
    else if(e.type==='wait_for_timeout'||(e.type==='assert'&&!e.ok))this.warning();
    else if(e.type==='run_complete')this.success();
    else if(e.type==='annotation_draw')this.tone(520,.04,'sine',.25);
  }
  async textBlips(text,emitChar,{minGap=42,maxGap=78}={}){
    let i=0;
    for(const ch of String(text)){
      emitChar(ch,i++);
      if(this.textVoice&&/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]/.test(ch)){
        const base=330+(ch.charCodeAt(0)%7)*18;
        this.tone(base,.026,'square',.18);
      }
      const gap=/[.!?]/.test(ch)?190:/[,;:]/.test(ch)?120:(minGap+Math.random()*(maxGap-minGap));
      await new Promise(r=>setTimeout(r,gap));
    }
  }
  setEnabled(v){this.enabled=!!v;if(this.enabled)this.ensure();}
}
global.DemoAudioDirector=DemoAudioDirector;
})(typeof window!=='undefined'?window:globalThis);