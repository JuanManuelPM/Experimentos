// DESPLAZAMIENTO W003-02: original procedural UK garage score + per-track groove.
// ES module. No third-party audio or samples. Run in Node >=20; browser Web Audio preview uses same events.
export const BPM=133, SR=44100, BEAT=60/BPM, BARS=32;
export const TRACKS=['kick','snare','hats','ghost','bass','chords','motif','air'];
export const groove={
 kick:{ms:[0,-2,1,0,-2,1,0,1],vel:[1,.98,1,1,.96,1,1,1]},
 snare:{ms:[0,8,-2,5,0,11,-4,7],vel:[1,.92,1.05,.96,1,1.06,.96,1.02]},
 hats:{ms:[-5,25,-7,19,-3,32,-11,21],vel:[.93,.62,.80,.72,.96,.58,.82,.76]},
 ghost:{ms:[-10,14,-17,19,-12,22,-7,16],vel:[.51,.43,.36,.56,.49,.38,.64,.42]},
 bass:{ms:[-3,10,-8,18,-7,9,-6,24],vel:[.96,.8,.85,.77,.94,.75,.89,.83]},
 chords:{ms:[1,0,3,-2,0,4,-3,2],vel:[.83,.74,.90,.78,.84,.72,.88,.75]},
 motif:{ms:[5,-10,15,-3,9,-13,11,-7],vel:[.76,.92,.68,.83,.90,.72,.86,.70]},
 air:{ms:[0,0,0,0,0,0,0,0],vel:[1,1,1,1,1,1,1,1]}
};
const PROGRESSION=[{root:38,quality:[0,3,7,10,14]},{root:43,quality:[0,3,7,10,14]},{root:46,quality:[0,4,7,11,14]},{root:45,quality:[0,3,7,10,14]}];
const HZ=n=>440*Math.pow(2,(n-69)/12);
export function compose(bars=BARS,feel='played'){
 const ev=[], add=(track,bar,beat,note,vel=.8,dur=.25)=>{
  const step=((Math.round(beat*2)%8)+8)%8;
  const p=groove[track];
  const offs=feel==='played'?p.ms[step]:0;
  const amp=(feel==='played'?p.vel[step]:.83);
  ev.push({track,bar,beat,note,vel:+(vel*amp).toFixed(4),durationBeats:dur,
   offsetMs:offs,time:Math.max(0,(bar*4+beat)*BEAT+offs/1000)});
 };
 for(let b=0;b<bars;b++){
  const phase=b<4?'arrival':b<12?'first-drive':b<16?'hollow':b<24?'release':b<28?'absence':'return';
  const root=PROGRESSION[b%4].root;
  const active=phase!=='arrival'&&phase!=='absence';
  // Each section has a distinct functional arrangement. Kick omission makes response space.
  const kicks=phase==='arrival'?[0,2.5]:phase==='hollow'?[0,2.75]:phase==='absence'?[0,2.5]:[0,1.75,2.5,3.5];
  for(const beat of kicks) if(!(b%8===7&&beat===3.5))add('kick',b,beat,36,beat===0?1:.72,.24);
  for(const beat of [1,3]) if(phase!=='arrival'||beat===3) add('snare',b,beat,38,.78,.19);
  if(phase!=='absence')for(let i=0;i<8;i++){
    if(phase==='arrival'&&i%2===0)continue;
    if(phase==='hollow'&&[1,4,5].includes(i))continue;
    add('hats',b,i/2,42,i%2?.52:.82,.09);
  }
  if(active&&phase!=='hollow'){
    const ghosts=(b%4===3)?[.75,2.75,3.75]:[.75,2.75];
    for(const beat of ghosts)add('ghost',b,beat,37,.5,.12);
    if(b%4===2)add('ghost',b,3.25,39,.36,.12);
  }
  if(phase==='arrival'){if(b>=2)add('bass',b,0,root,.48,1.5);}
  else if(phase==='absence'){if(b%2===0)add('bass',b,.5,root,.53,1.1);}
  else{
    const contour=b%4===0?[[0,0,.75],[.75,7,.45],[2.25,3,.65],[3.5,-2,.37]]:
      b%4===1?[[0,0,.58],[1.5,12,.47],[2.5,7,.6],[3.25,3,.44]]:
      b%4===2?[[0,0,.82],[.75,5,.39],[2,7,.59],[3.25,3,.41]]:
                [[0,0,.75],[1.25,-2,.54],[2.75,3,.62],[3.5,7,.35]];
    for(const [beat,delta,dur] of contour)if(!(phase==='hollow'&&beat>2.5))add('bass',b,beat,root+delta,.72,dur);
  }
  if(phase!=='absence'){
    for(const beat of (phase==='arrival'?[2.5]:phase==='hollow'?[.5]:[.5,2.5]))
     for(const n of PROGRESSION[b%4].quality.slice(1,5))
      add('chords',b,beat,root+n+12,.33,phase==='hollow'?.8:.53);
  }
  if((phase==='release'||phase==='return')&&b%2===0){
    for(const [beat,int] of [[1.75,19],[2.75,22],[3.25,17]])add('motif',b,beat,root+int,.4,.28);
  }else if(phase==='first-drive'&&b%4===3){
    for(const [beat,int] of [[1.75,17],[3.25,14]])add('motif',b,beat,root+int,.27,.28);
  }
  if(b%4===0)add('air',b,0,root+12,phase==='absence'?.36:.24,15.3);
 }
 return ev.sort((a,b)=>a.time-b.time);
}
function noise(i,seed=7){let x=Math.imul((i+1)^seed,0x45d9f3b);x=(x^(x>>>16));x=Math.imul(x,0x45d9f3b);return ((x^(x>>>16))>>>0)/2147483648-1;}
function soft(x){return x/(1+Math.abs(x)*.55);}
export function renderTrack(events,track,{sampleRate=SR,duration=null}={}){
 const dur=duration??(events.length?Math.max(...events.map(e=>e.time+e.durationBeats*BEAT+1)):0);
 const out=new Float32Array(Math.ceil(dur*sampleRate));
 for(const e of events){if(e.track!==track)continue;
  const start=Math.floor(e.time*sampleRate), f=HZ(e.note);
  const isAir=track==='air', life=track==='kick'?.48:track==='snare'?.26:
    track==='hats'?.16:track==='ghost'?.17:track==='bass'?Math.max(.25,e.durationBeats*BEAT+.15):
    track==='chords'?Math.max(.3,e.durationBeats*BEAT+.5):
    track==='motif'?Math.max(.32,e.durationBeats*BEAT+.36):Math.max(2,e.durationBeats*BEAT);
  const count=Math.min(Math.ceil(life*sampleRate),out.length-start);
  const seed=Math.round(e.bar*79+e.beat*53+e.note*17);
  for(let j=0;j<count;j++){
    const t=j/sampleRate, x=t/life; let v=0;
    if(track==='kick'){
      const ph=2*Math.PI*(55*t+82*.028*(1-Math.exp(-t/.028)));
      v=(Math.sin(ph)+.14*Math.sin(2*ph)) * Math.exp(-t*13)
        +.09*noise(j,seed)*Math.exp(-t*115);
      v*=1.7;
    } else if(track==='snare'){
      const n=noise(j,seed), body=Math.sin(2*Math.PI*187*t)*Math.exp(-t*28);
      v=.58*n*Math.exp(-t*19)*(1+.22*Math.sin(t*1900))+.34*body;
    } else if(track==='hats'){
      const n=noise(j,seed), n2=noise(j-2,seed);
      v=(n-n2)*.42*Math.exp(-t*(e.beat%1===.5?47:35));
    } else if(track==='ghost'){
      const n=noise(j,seed), r=Math.sin(2*Math.PI*420*t);
      v=(n*.34+r*.32)*Math.exp(-t*39);
    } else if(track==='bass'){
      const shape=Math.max(0,1-Math.pow(x,2));
      const env=(1-Math.exp(-t*95))*Math.exp(-t*2.3)*shape;
      const phase=2*Math.PI*f*t;
      v=soft((Math.sin(phase)+.36*Math.sin(2*phase+.45)+.13*Math.sin(3*phase))*1.4)*env;
    } else if(track==='chords'){
      const a=(1-Math.exp(-t*65))*Math.exp(-t*4.5);
      const pitch=f, det=.005*(seed%4+1);
      const phase=2*Math.PI*pitch*t;
      const vibr=.003*Math.sin(t*4.1);
      v=(Math.sin(phase*(1+vibr))*.37+Math.sin(phase*2*(1-det))*.20+
       Math.sin(phase*(1+det))*.22)*a;
      v+=.10*Math.sin(phase*.5)*Math.exp(-t*2.8);
    } else if(track==='motif'){
      const a=(1-Math.exp(-t*50))*Math.exp(-t*5.8);
      const pitch=f*(1+.009*Math.exp(-t*21));
      v=(.55*Math.sin(2*Math.PI*pitch*t)+.24*Math.sin(2*Math.PI*pitch*2.01*t)) * a;
    } else if(isAir){
      const env=Math.sin(Math.PI*Math.min(x,1))**2;
      const drift=1+.002*Math.sin(t*.66);
      const low=Math.sin(2*Math.PI*f*.5*drift*t), over=Math.sin(2*Math.PI*f*1.003*t);
      v=(low*.42+over*.23+noise(Math.floor(j/18),seed)*.035)*env;
    }
    out[start+j]+=v*e.vel;
  }
 }
 return out;
}
export function renderMix(events,{sampleRate=SR,duration=null}={}){
 const len=Math.ceil((duration??(events.length?Math.max(...events.map(e=>e.time+e.durationBeats*BEAT+1)):0))*sampleRate);
 const stems={};let mix=new Float32Array(len);
 const gain={kick:.35,snare:.57,hats:.34,ghost:.37,bass:.55,chords:.42,motif:.32,air:.15};
 for(const t of TRACKS){const a=renderTrack(events,t,{sampleRate,duration:len/sampleRate}),v=gain[t];
   const st=new Float32Array(len);for(let i=0;i<len;i++){st[i]=a[i]*v;mix[i]+=st[i]}stems[t]=st;
 }
 let peak=0;for(const x of mix)peak=Math.max(peak,Math.abs(x));
 const masterGain=peak>.93?.93/peak:1;
 for(const t of TRACKS)for(let i=0;i<len;i++)stems[t][i]*=masterGain;
 for(let i=0;i<len;i++)mix[i]*=masterGain;
 return {mix,stems,peak,masterGain};
}
export function stats(a){let sq=0,peak=0;for(let i=0;i<a.length;i++){sq+=a[i]*a[i];peak=Math.max(peak,Math.abs(a[i]));}return {samples:a.length,rms:Math.sqrt(sq/Math.max(1,a.length)),samplePeak:peak};}
export function wav16(a,sr=SR){const out=new Uint8Array(44+a.length*2),v=new DataView(out.buffer),str=(p,s)=>{for(let i=0;i<s.length;i++)out[p+i]=s.charCodeAt(i)};
 str(0,'RIFF');v.setUint32(4,out.length-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,a.length*2,true);
 for(let i=0;i<a.length;i++)v.setInt16(44+2*i,Math.max(-32768,Math.min(32767,Math.round(a[i]*32767))),true);
 return out;
}
export function b64(a){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';let s='';for(let i=0;i<a.length;i+=3){
 const x=(a[i]<<16)|((a[i+1]||0)<<8)|(a[i+2]||0);s+=chars[(x>>>18)&63]+chars[(x>>>12)&63]+(i+1<a.length?chars[(x>>>6)&63]:'=')+(i+2<a.length?chars[x&63]:'=');
 }return s;}
export function equalizeAB(a,b){const ra=stats(a).rms,rb=stats(b).rms,k=rb?ra/rb:1;return {A:a,B:b.map(x=>x*k),rmsGain:k};}
