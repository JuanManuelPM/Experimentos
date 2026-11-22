/* PROMETEO techno one-shot module v1. Decode once per Web Audio sample rate. */
(()=>{'use strict';const pack=window.PROMETEO_TECHNO_BANK;const cache=new Map(),loading=new Map();function base64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a.buffer}
async function prepare(ctx){let sr=ctx.sampleRate;if(cache.has(sr))return cache.get(sr);if(loading.has(sr))return loading.get(sr);let job=Promise.all(Object.entries(pack.assets).map(async([name,v])=>[name,await ctx.decodeAudioData(base64(v.b64))])).then(x=>{let b=Object.fromEntries(x);cache.set(sr,b);return b}).finally(()=>loading.delete(sr));loading.set(sr,job);return job}
function trigger(ctx,input,type,e,when,collect){if(!pack.assets[type])return false;const b=cache.get(ctx.sampleRate)?.[type];if(!b)return false;let source=ctx.createBufferSource(),amp=ctx.createGain();source.buffer=b;source.playbackRate.value=1;let velocity=Math.max(.1,Math.min(1.05,(e.vel||90)/110));if(type==='techmetal'||type==='techtick'){
 const attack=type==='techmetal'?.004:.003;
 const fade=.011;const hold=Math.max(attack,b.duration-fade);
 amp.gain.setValueAtTime(0,when);
 amp.gain.linearRampToValueAtTime(velocity,when+attack);
 amp.gain.setValueAtTime(velocity,when+hold);
 amp.gain.linearRampToValueAtTime(0,when+b.duration);
 }else amp.gain.setValueAtTime(velocity,when);source.connect(amp);amp.connect(input);source.start(when);if(collect)collect.push(source);return true}
window.PROMETEO_TECHNO={prepare,trigger,get state(){return{ready_rates:[...cache.keys()],kit:pack.id}}};})();