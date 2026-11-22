/**
 * LA DESPEDIDA / original generative sound score.
 * Only oscillator synthesis and deterministic noise. No third-party music.
 * The SAME stream can be played through speakers and recorded by MediaRecorder.
 */
export async function createSoundTrack({duration=26,offset=0,audible=true}={}){
 const Context=window.AudioContext||window.webkitAudioContext;
 if(!Context)throw new Error('WebAudio no disponible');
 const ctx=new Context({latencyHint:'interactive',sampleRate:44100});
 await ctx.resume();
 const destination=ctx.createMediaStreamDestination();
 const master=ctx.createGain();master.gain.value=.7;master.connect(destination);
 if(audible)master.connect(ctx.destination);
 const now=ctx.currentTime+.045, remaining=Math.max(.2,duration-offset);
 const nodes=[];
 const register=node=>{nodes.push(node);return node};
 const envelope=(node,when,len,volume)=>{
   const gain=ctx.createGain();
   gain.gain.setValueAtTime(.0001,when);
   gain.gain.linearRampToValueAtTime(volume,when+Math.min(.7,len*.2));
   gain.gain.setValueAtTime(volume,when+Math.max(.8,len-1.7));
   gain.gain.exponentialRampToValueAtTime(.0001,when+len);
   node.connect(gain).connect(master);return gain;
 };
 // Textured coast: seeded pink-ish filtered noise with long, gentle tides.
 let seed=27451;
 const buffer=ctx.createBuffer(1,Math.round(ctx.sampleRate*4),ctx.sampleRate);
 const data=buffer.getChannelData(0);
 for(let i=0;i<data.length;i++){seed=(Math.imul(1664525,seed)+1013904223)>>>0;data[i]=(seed/4294967296*2-1)*.32}
 const sea=register(ctx.createBufferSource());sea.buffer=buffer;sea.loop=true;
 const seaFilter=ctx.createBiquadFilter();seaFilter.type='lowpass';seaFilter.frequency.value=410;seaFilter.Q.value=.3;
 const seaGain=ctx.createGain();seaGain.gain.value=.2;
 sea.connect(seaFilter).connect(seaGain).connect(master);sea.start(now);sea.stop(now+remaining+.1);
 // Hollow horizon: two low oscillators with slow beating.
 for(const [f,vol,phase] of [[73.42,.08,0],[110,.045,.9],[146.83,.024,1.7]]){
   const osc=register(ctx.createOscillator());osc.type='sine';osc.frequency.value=f;
   const g=ctx.createGain();g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(vol,now+.65+phase);
   g.gain.setValueAtTime(vol,now+Math.max(1,remaining-1.4));g.gain.exponentialRampToValueAtTime(.0001,now+remaining);
   osc.connect(g).connect(master);osc.start(now);osc.stop(now+remaining+.06);
 }
 // The bell is also a story beat. Bell times are absolute in the timeline.
 for(const beat of [1.0,7.5,13.2,18.1,23.6]){
   if(beat<offset||beat>=duration)continue;
   const when=now+(beat-offset);
   for(const [freq,vol,decay] of [[587.33,.22,2.1],[880,.09,1.6],[1174.66,.035,.9]]){
     const osc=register(ctx.createOscillator());osc.type='sine';osc.frequency.value=freq;
     const g=ctx.createGain();g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(vol,when+.014);g.gain.exponentialRampToValueAtTime(.0001,when+decay);
     osc.connect(g).connect(master);osc.start(when);osc.stop(when+decay+.02);
   }
 }
 // Small story-specific tonal movement; no prerecorded or copyrighted samples.
 for(const [at,f,vol] of [[0,220,.012],[4.8,196,.015],[9.8,164.81,.02],[15,146.83,.024],[20.3,130.81,.012]]){
   if(at<offset||at>=duration)continue;
   const when=now+(at-offset),len=Math.min(3.1,duration-at);
   const osc=register(ctx.createOscillator());osc.type='triangle';osc.frequency.value=f;
   envelope(osc,when,len,vol);osc.start(when);osc.stop(when+len+.015);
 }
 let done=false;
 return {stream:destination.stream,ctx,stop:async()=>{
    if(done)return;done=true;
    for(const n of nodes){try{n.stop()}catch{}}
    try{await ctx.close()}catch{}
  }};
}
