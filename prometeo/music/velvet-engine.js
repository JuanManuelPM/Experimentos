/* PROMETEO · Velvet Perception Kit V1 · six original non-pitched materials.
   Safe shared-module addition: the historic techno kick and rumble are untouched.
   Every sample fades in/out in PCM; extra WebAudio envelopes guard against clicks.
*/
(()=>{'use strict';
const kit=window.PROMETEO_VELVET_BANK;
const cache=new Map(),pending=new Map();
const types=new Set(Object.keys(kit.assets));
function raw64(s){const str=atob(s),arr=new Uint8Array(str.length);for(let i=0;i<str.length;i++)arr[i]=str.charCodeAt(i);return arr.buffer;}
async function prepare(ctx){const sr=ctx.sampleRate;if(cache.has(sr))return cache.get(sr);if(pending.has(sr))return pending.get(sr);
 const job=Promise.all(Object.entries(kit.assets).map(async([k,v])=>[k,await ctx.decodeAudioData(raw64(v.b64))]))
 .then(xs=>{const obj=Object.fromEntries(xs);cache.set(sr,obj);return obj;}).finally(()=>pending.delete(sr));pending.set(sr,job);return job;}
function trigger(ctx,input,type,e,when,collect){if(!types.has(type))return false;let buffer=cache.get(ctx.sampleRate)?.[type];if(!buffer)return false;
 const src=ctx.createBufferSource(),amp=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=buffer;
 // Noise-based recordings have no pitch to transpose; slight playback-rate shifts alter grain only.
 const note=Math.max(40,Math.min(90,Number(e.note??60)));
 src.playbackRate.value=Math.max(.89,Math.min(1.08,1+(note-60)*.003));
 const velocity=Math.max(.03,Math.min(1.05,Number(e.vel??65)/110));
 filter.type='lowpass';const base=type==='velsilkhat'?6500:type==='velsilkopen'?5400:type==='velbrush'?3400:type==='velwood'?1800:1800;
 filter.frequency.value=Math.min(9500,Math.max(950,base*(.86+.22*velocity)));
 filter.Q.value=.45;src.connect(filter);filter.connect(amp);amp.connect(input);
 const duration=buffer.duration/src.playbackRate.value;
 const attack=type==='velhush'||type==='velsweep'?.070:type==='velsilkopen'?.010:.007;
 const fade=type==='velhush'||type==='velsweep'?.170:type==='velsilkopen'?.055:.025;
 const end=when+duration;
 amp.gain.setValueAtTime(0,when);
 amp.gain.linearRampToValueAtTime(velocity,when+attack);
 amp.gain.setValueAtTime(velocity,Math.max(when+attack,end-fade));
 amp.gain.linearRampToValueAtTime(0,end);
 src.start(when);src.stop(end+0.002);
 if(collect)collect.push(src);return true;
}
window.PROMETEO_VELVET={prepare,trigger,get state(){return{kit:kit.id,rates:[...cache.keys()],sample_count:types.size}}};
})();
