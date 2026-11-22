/* PROMETEO Race Engine V1: original rendered drum one-shots + harmonic sub-drive bass.
   Built as a standalone reusable audio module; the shared M008 studio remains the host.
   Kick-aware bass ducking is deterministic note-event volume automation, NOT a compressor.
*/
(()=>{'use strict';
const pack=window.PROMETEO_RACE_BANK;
const names=new Set(Object.keys(pack?.assets||{}));
const decoded=new Map(),loading=new Map();let events=[],errors=[];
function fromBase64(s){const str=atob(s);const a=new Uint8Array(str.length);for(let i=0;i<str.length;i++)a[i]=str.charCodeAt(i);return a.buffer;}
function setProject(p){events=(p?.tracks||[]).filter(t=>t.type==='racekick'||t.type==='kick').flatMap(t=>t.events.map(e=>+e.time)).filter(Number.isFinite).sort((a,b)=>a-b);}
async function prepare(ctx){const rate=ctx.sampleRate;if(decoded.has(rate))return decoded.get(rate);if(loading.has(rate))return loading.get(rate);
 if(!pack?.assets)throw Error('Race samples missing');
 const job=Promise.all(Object.entries(pack.assets).map(async([key,item])=>[key,await ctx.decodeAudioData(fromBase64(item.b64))]))
 .then(items=>{const ready=Object.fromEntries(items);decoded.set(rate,ready);errors=[];return ready;}).catch(e=>{errors=[String(e)];throw e}).finally(()=>loading.delete(rate));loading.set(rate,job);return job;}
function clipCurve(){const n=4096,a=new Float32Array(n),drive=2.6;for(let i=0;i<n;i++){let x=(i*2/(n-1)-1);a[i]=Math.tanh(x*drive)/Math.tanh(drive)}return a;}
function drum(ctx,input,type,e,when,collect){const prepared=decoded.get(ctx.sampleRate);if(!prepared?.[type])return false;
 const src=ctx.createBufferSource(),amp=ctx.createGain(),vel=Math.min(1,Math.max(.1,(+e.vel||90)/116));
 src.buffer=prepared[type];amp.gain.setValueAtTime(vel,when);src.connect(amp);amp.connect(input);src.start(when);
 if(collect)collect.push(src);return true;
}
function bass(ctx,input,e,when,collect){const vel=Math.min(1,Math.max(.20,(+e.vel||86)/112));
 const note=Math.max(22,Math.min(90,+e.note||40));const f=440*Math.pow(2,(note-69)/12),dur=Math.max(.075,Math.min(3,+e.dur||.3));
 const amps=ctx.createGain(),ducker=ctx.createGain(),HP=ctx.createBiquadFilter();HP.type='highpass';HP.frequency.value=27;
 amps.connect(ducker);ducker.connect(HP);HP.connect(input);
 const sub=ctx.createOscillator(),sub2=ctx.createOscillator(),subMix=ctx.createGain();sub.type='sine';sub2.type='triangle';
 sub.frequency.value=f*.5;sub2.frequency.value=f*.5;sub2.detune.value=3;
 subMix.gain.value=.80;const sub2Mix=ctx.createGain();sub2Mix.gain.value=.10;
 sub.connect(subMix);sub2.connect(sub2Mix);subMix.connect(amps);sub2Mix.connect(amps);
 const saw1=ctx.createOscillator(),saw2=ctx.createOscillator(),sawMix=ctx.createGain();saw1.type='sawtooth';saw2.type='sawtooth';
 saw1.frequency.value=f;saw2.frequency.value=f;saw1.detune.value=-6;saw2.detune.value=7;
 const balance=ctx.createGain();balance.gain.value=.24;
 saw1.connect(sawMix);saw2.connect(sawMix);sawMix.gain.value=.43;
 const saturate=ctx.createWaveShaper();saturate.curve=clipCurve();saturate.oversample='4x';
 const removeSub=ctx.createBiquadFilter();removeSub.type='highpass';removeSub.frequency.value=82;removeSub.Q.value=.62;
 const cutoff=ctx.createBiquadFilter();cutoff.type='lowpass';cutoff.Q.value=1.1;
 cutoff.frequency.setValueAtTime(1900,when);cutoff.frequency.exponentialRampToValueAtTime(610,when+.10);cutoff.frequency.setValueAtTime(560,when+Math.min(dur,.20));
 sawMix.connect(saturate);saturate.connect(removeSub);removeSub.connect(cutoff);cutoff.connect(balance);balance.connect(amps);
 // A tiny initial pitch fall adds attack without detuning the sustaining tone.
 for(const o of [saw1,saw2]){o.frequency.setValueAtTime(f*1.025,when);o.frequency.exponentialRampToValueAtTime(f,when+.04)}
 amps.gain.setValueAtTime(.0001,when);amps.gain.linearRampToValueAtTime(.44*vel,when+.008);
 amps.gain.exponentialRampToValueAtTime(.33*vel,when+Math.min(.080,dur*.4));amps.gain.setValueAtTime(.33*vel,when+dur);
 amps.gain.exponentialRampToValueAtTime(.0001,when+dur+.15);
 ducker.gain.setValueAtTime(1,when);
 for(const at of events){const distance=at-e.time;if(distance<-.001||distance>dur+.16)continue;
 const k=when+Math.max(0,distance);ducker.gain.setValueAtTime(1,Math.max(when,k-.002));
 ducker.gain.linearRampToValueAtTime(.33,k+.004);ducker.gain.setValueAtTime(.33,k+.024);
 ducker.gain.linearRampToValueAtTime(1,k+.145);}
 const until=when+dur+.18;
 for(const o of [sub,sub2,saw1,saw2]){o.start(when);o.stop(until);if(collect)collect.push(o)}
 return true;
}
function trigger(ctx,input,type,e,when,collect){return type==='racebass'?bass(ctx,input,e,when,collect):names.has(type)?drum(ctx,input,type,e,when,collect):false;}
window.PROMETEO_RACE={prepare,trigger,setProject,get ready(){return decoded.size>0},get state(){return{pack:pack?.id||null,samples:decoded.size?Object.keys(decoded.values().next().value).length:0,decodedRates:[...decoded.keys()],kickEvents:events.length,errors}}};
})();
