// MAREA VARIABLE, original adaptive cue. All code and music generated for this work.
export const BPM=80, BEATS=4, BARS=16, SR=24000, OUTPUT_GAIN=3.0;
export const BAR=BEATS*60/BPM, SECONDS=BARS*BAR;
export const STATES=['calma','deriva','tormenta'];
const CHORDS=[[50,53,57,64],[46,50,57,62],[53,57,60,67],[48,53,55,62]];
export const PROJECT={id:'music-w002-20261122-08',title:'Marea variable',tempo:BPM,bars:BARS,beatsPerBar:BEATS,seconds:SECONDS,sampleRate:SR,tonality:'D minor / modal inflections',harmonicCycle:['Dm(add9)','Bbmaj7','F(add9)','Csus2'],stems:['bed',...STATES],masters:STATES.map(s=>'bed + '+s),licensing:'100% original synthesis'};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function smooth(x){x=clamp(x,0,1);return x*x*(3-2*x)}
function note(n){return 440*Math.pow(2,(n-69)/12)}
function hashNoise(i,seed){let x=Math.imul(i+seed,0x45d9f3b);x^=x>>>16;x=Math.imul(x,0x45d9f3b);x^=x>>>16;return (x/2147483648)}
// Multiple oscillators with note-dependent partials and slight detuning; no preset assets.
function oscillator(kind,p,t,f){
 if(kind==='pad')return .58*Math.sin(p)+.19*Math.sin(p*1.005+.5*Math.sin(t*.37))+.15*Math.sin(p*2.002)+.08*Math.sin(p*3.01);
 if(kind==='flute')return .82*Math.sin(p+.015*Math.sin(2*Math.PI*4.7*t))+.13*Math.sin(2*p)+.05*Math.sin(3*p);
 if(kind==='felt')return (.68*Math.sin(p)+.22*Math.sin(2*p)+.1*Math.sin(3*p)) *Math.exp(-1.55*t);
 if(kind==='glass')return (.67*Math.sin(p)+.18*Math.sin(2.01*p)+.12*Math.sin(3.96*p)+.03*Math.sin(5.03*p))*Math.exp(-.8*t);
 if(kind==='bass')return .77*Math.sin(p)+.17*Math.sin(2*p)+.08*Math.sin(3*p);
 if(kind==='tense')return .49*Math.sin(p)+.24*Math.sin(2*p)+.16*Math.sin(3*p)+.11*Math.sin(5*p);
 return Math.sin(p);
}
export function renderStem(stem,{sampleRate=SR}={}){
 if(!['bed',...STATES].includes(stem))throw new Error('Stem desconocido');
 if(sampleRate<8000||sampleRate>96000)throw new Error('sampleRate fuera de rango');
 const count=Math.round(SECONDS*sampleRate),out=new Float32Array(count);
 function play(start,duration,midi,level,kind='felt',att=.012,rel=.3){
  const freq=note(midi),first=Math.max(0,Math.floor(start*sampleRate));
  const last=Math.min(count,Math.ceil((start+duration+rel)*sampleRate));
  for(let i=first;i<last;i++){
   const t=i/sampleRate-start;if(t<0)continue;
   const env=smooth(t/att)*(t<duration?1:1-smooth((t-duration)/rel));
   if(env<=0)continue;
   const phase=2*Math.PI*freq*t;
   out[i]+=level*env*oscillator(kind,phase,t,freq);
  }
 }
 for(let bar=0;bar<BARS;bar++){
  const t=bar*BAR,ch=CHORDS[Math.floor(bar/4)],step=bar%4;
  const motion=(bar>=4&&bar<12)?1:0;
  if(stem==='bed'){
   if(step===0){
    const thick=bar>=8&&bar<12?1.1:1;
    for(let j=0;j<ch.length;j++)play(t,4*BAR-.55,ch[j],(.024+j*.003)*thick,'pad',.8,1.4);
   }
   play(t,.57,ch[0]-12,.072,'bass',.015,.55);
   if(step===2)play(t+BAR*.5,.25,ch[0],.033,'felt',.012,.2);
  }
  if(stem==='calma'){
   if(step===0||step===2)play(t+.34,1.65,ch[3]+(step===2?0:12),.125,'flute',.25,.92);
   if(step===1)play(t+1.4,.7,ch[2]+12,.072,'glass',.03,.88);
   if(step===3)play(t+1.08,.9,ch[1]+12,.075,'felt',.012,.55);
   if(bar>=8&&bar<12)play(t+2.09,.25,ch[2]+24,.035,'glass',.018,.48);
  }
  if(stem==='deriva'){
   const seq=[0,2,1,3,2,1,3,1];
   for(let k=0;k<8;k++){
    const skip=(bar%4===3&&(k===4||k===5))||(bar<4&&(k===1||k===5));
    if(skip)continue;
    const when=t+k*BAR/8+(k%2?.055:0),pitch=ch[seq[(k+bar)%8]]+12;
    play(when,.16+(k%3)*.04,pitch, (k%4===0?.106:.067)*(motion?1:.82),'felt',.009,.28);
   }
   if(step===0||step===2)play(t+.2,2.08,ch[2],.053,'pad',.58,.9);
   if(bar>=8&&bar<12)play(t+2.47,.52,ch[3]+12,.055,'glass',.02,.66);
  }
  if(stem==='tormenta'){
   for(let k=0;k<8;k++){
    if((bar<4||bar>=12)&&(k%2===1))continue;
    const at=t+k*BAR/8;play(at,.21,ch[0]-12,.113+(k%4===0?.048:0),'tense',.011,.24);
   }
   if(step===0||step===2)play(t+.06,1.1,ch[1]+12,.10,'tense',.14,1.0);
   if(bar>=4&&bar<12){play(t+1.52,.16,ch[0]-24,.115,'bass',.008,.29);play(t+2.29,.48,ch[3]+12,.046,'glass',.02,.6)}
  }
 }
 // Dry-to-wet single feedback diffusion, deterministic; tails stay in active buffers.
 const echo1=Math.round(sampleRate*.311),echo2=Math.round(sampleRate*.487);
 let prev1=0,prev2=0;
 for(let i=0;i<count;i++){
  const dry=out[i];let wet=0;
  if(i>=echo1)wet+=out[i-echo1]*.102;
  if(i>=echo2)wet+=out[i-echo2]*.056;
  const x=(dry+wet)*.86;
  out[i]=Math.tanh(x*1.05);
 }
 // A loop seam is part of the authored phrase; tapered silence at the final and initial 80ms.
 const edge=Math.floor(.08*sampleRate);
 for(let i=0;i<edge;i++){const k=smooth(i/edge);out[i]*=k;out[count-i-1]*=k;}
 return out;
}
export function combine(stems,state,bedLevel=.73,stateLevel=.82){
 const bed=stems.bed,layer=stems[state];if(!bed||!layer||bed.length!==layer.length)throw Error('Incompatibilidad de stems');
 const out=new Float32Array(bed.length);
 for(let i=0;i<out.length;i++)out[i]=(bed[i]*bedLevel+layer[i]*stateLevel)*OUTPUT_GAIN;
 return out;
}
export function wav16(samples,rate=SR){
 const bytes=new ArrayBuffer(44+samples.length*2),view=new DataView(bytes);
 function str(at,s){for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i))}
 str(0,'RIFF');view.setUint32(4,36+samples.length*2,true);str(8,'WAVE');str(12,'fmt ');
 view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
 view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
 str(36,'data');view.setUint32(40,samples.length*2,true);
 for(let i=0;i<samples.length;i++)view.setInt16(44+i*2,Math.round(clamp(samples[i],-1,1)*32767),true);
 return bytes;
}
export function metrics(samples){let power=0,peak=0,dc=0;for(const x of samples){power+=x*x;dc+=x;peak=Math.max(peak,Math.abs(x))}return {seconds:samples.length/SR,peak:+peak.toFixed(5),rms:+Math.sqrt(power/samples.length).toFixed(5),dc:+(dc/samples.length).toFixed(6),samples:samples.length}}