// Intentionally small synthesized feedback, created only after a player gesture.
// No third-party audio, autoplay, tracking or network.
let ctx=null;
function note(frequency,duration=.17,type="sine",volume=.045,delay=0){
  try{
    const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;
    if(!Audio)return false;
    if(!ctx)ctx=new Audio();
    if(ctx.state==="suspended")ctx.resume().catch(()=>{});
    const now=ctx.currentTime+delay;
    const osc=ctx.createOscillator(),amp=ctx.createGain();
    osc.type=type;osc.frequency.setValueAtTime(frequency,now);
    amp.gain.setValueAtTime(.0001,now);
    amp.gain.exponentialRampToValueAtTime(Math.max(.001,volume),now+.018);
    amp.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(amp);amp.connect(ctx.destination);
    osc.start(now);osc.stop(now+duration+.04);
    return true;
  }catch{return false}
}
export function playBell(tone){
  const f={amber:392,teal:493.88,coral:587.33}[tone]||392;
  note(f,.40,"sine",.075);
  note(f*2,.21,"triangle",.013,.02);
}
export function playPostal(kind){
  if(kind==="done"){[523.25,659.25,783.99,1046.5].forEach((f,i)=>note(f,.30,"triangle",.05,i*.10));return;}
  if(kind==="delivered"){note(659.25,.12,"sine",.038);note(987.77,.21,"sine",.026,.095);return;}
  note(440,.15,"triangle",.033);note(523.25,.19,"sine",.028,.09);
}
