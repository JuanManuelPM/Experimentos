// PROMETEO Studio 3D · 100% original procedural WebAudio score · v0.1.0 · CC0
// Audio can be muted or absent without breaking scene playback.
export const AUDIO_ID='prometeo.synth-elevator@0.1.0';
export function createSynthSound(){
 const Context=window.AudioContext||window.webkitAudioContext;
 let ctx=null,master=null,enabled=true;const fired=new Set();
 function activate(){if(!Context)return;ctx=ctx||new Context();if(ctx.state==='suspended')ctx.resume();if(!master){master=ctx.createGain();master.gain.value=.36;master.connect(ctx.destination)}}
 function tone(freq,duration,at,shape='sine',amount=.10,endHz=null){
   if(!ctx||!master||!enabled)return;
   const o=ctx.createOscillator(),g=ctx.createGain();o.type=shape;o.frequency.setValueAtTime(freq,at);
   if(endHz)o.frequency.exponentialRampToValueAtTime(Math.max(1,endHz),at+duration);
   g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(amount,at+.015);
   g.gain.exponentialRampToValueAtTime(.0001,at+duration);
   o.connect(g).connect(master);o.start(at);o.stop(at+duration+.03);
 }
 function noise(duration,at,cut=380,level=.05){
   if(!ctx||!enabled)return;
   const sr=ctx.sampleRate,size=Math.ceil(duration*sr),b=ctx.createBuffer(1,size,sr),d=b.getChannelData(0);
   let s=557;for(let i=0;i<size;i++){s=(Math.imul(1664525,s)+1013904223)>>>0;d[i]=(s/2147483648-1)*.25;}
   const src=ctx.createBufferSource(),lo=ctx.createBiquadFilter(),g=ctx.createGain();
   src.buffer=b;lo.type='lowpass';lo.frequency.value=cut;g.gain.setValueAtTime(level,at);
   g.gain.exponentialRampToValueAtTime(.0001,at+duration);src.connect(lo).connect(g).connect(master);src.start(at);
 }
 function cue(name){if(!enabled||!ctx||fired.has(name))return;fired.add(name);const t=ctx.currentTime;
   if(name==='call'){tone(705,.36,t,'sine',.15);tone(940,.45,t+.11,'sine',.11);}
   if(name==='open'){noise(2.05,t,260,.075);tone(92,2.1,t,'sawtooth',.06,43);}
   if(name==='close'){noise(1.4,t,340,.09);tone(75,1.4,t,'triangle',.09,37);}
   if(name==='ride'){tone(44,4.6,t,'sine',.10,71);noise(4.5,t,210,.05);for(let i=0;i<7;i++)tone(110+i*19,.12,t+i*.5,'triangle',.018);}
   if(name==='stop'){tone(68,.75,t,'sine',.12,38);tone(1078,.8,t+.3,'sine',.065);}
   if(name==='reveal'){tone(130,2.6,t,'triangle',.10,154);tone(193,2.3,t+.1,'sine',.055,180);tone(375,2.8,t+.4,'sine',.035,420);}
 }
 function reset(){fired.clear()}
 function setMuted(x){enabled=!x;if(master)master.gain.value=enabled?.36:0}
 return{activate,cue,reset,setMuted,get enabled(){return enabled},get available(){return !!Context}};
}
