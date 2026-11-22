/* PROMETEO sample instrument adapter V1. Reusable across SongProject projects.
   AudioBufferSourceNode sample playback with velocity layers, nearest root and note-off.
   Sample source and redistribution license are recorded in sample_manifest.json.
*/
(()=>{'use strict';
 const bank=window.PROMETEO_SAMPLE_BANK;
 const cached=new Map(),loading=new Map();let error=null;
 function fromBase64(b64){const str=atob(b64),a=new Uint8Array(str.length);for(let i=0;i<str.length;i++)a[i]=str.charCodeAt(i);return a.buffer}
 async function prepare(ctx){
   const sr=ctx.sampleRate;if(cached.has(sr))return cached.get(sr);
   if(loading.has(sr))return loading.get(sr);
   if(!bank||!Array.isArray(bank.samples)||!bank.samples.length)throw Error('Banco de muestras ausente');
   const job=Promise.all(bank.samples.map(async s=>({root:s.root,velocity:s.velocity,buffer:await ctx.decodeAudioData(fromBase64(s.b64))})))
     .then(x=>{cached.set(sr,x);error=null;return x}).catch(e=>{error=String(e);throw e}).finally(()=>loading.delete(sr));loading.set(sr,job);
   return job;
 }
 function trigger(ctx,input,e,when,collect){
   const prepared=cached.get(ctx.sampleRate);if(!prepared)return false;
   const vel=Math.max(1,Math.min(127,+e.vel||75)), note=Math.max(20,Math.min(108,+e.note||60));
   const nearestRoot=prepared.reduce((best,s)=>Math.abs(s.root-note)<Math.abs(best-note)?s.root:best,prepared[0].root);
   const layers=prepared.filter(x=>x.root===nearestRoot),s=layers.reduce((best,x)=>Math.abs(x.velocity-vel)<Math.abs(best.velocity-vel)?x:best,layers[0]);
   const ratio=Math.pow(2,(note-s.root)/12),duration=Math.max(.05,Math.min(+e.dur||.5,12));
   const voice=ctx.createBufferSource(),amp=ctx.createGain();voice.buffer=s.buffer;voice.playbackRate.value=ratio;
   const volume=Math.min(1.05,.95*Math.pow(vel/127,.90));
   amp.gain.setValueAtTime(.00001,when);amp.gain.linearRampToValueAtTime(volume,when+.006);
   amp.gain.setValueAtTime(volume,when+Math.min(duration,.08));
   amp.gain.setTargetAtTime(.00001,when+duration,.095);
   voice.connect(amp);amp.connect(input);
   voice.start(when);voice.stop(Math.min(when+s.buffer.duration/ratio,when+duration+.65));
   if(collect)collect.push(voice);
   return true;
 }
 window.PROMETEO_SAMPLER={prepare,trigger,get ready(){return cached.size>0},get state(){return {bank:bank?.id||null,samples:cached.size?cached.values().next().value.length:0,decodedRates:[...cached.keys()],error}}};
})();
