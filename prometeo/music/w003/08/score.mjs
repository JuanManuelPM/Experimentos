// MAREA VARIABLE W003/08. Original procedural score; no third-party samples.
// Deterministic mono PCM stems, identical timing/length/sample-rate and seamless loop.
const SR=32000, BPM=96, BEATS=4, BARS=48;
const BAR=BEATS*60/BPM, DURATION=BARS*BAR, STEMS=['horizon','calma','deriva','tormenta'];
const CHORDS=[[50,57,60,65,69],[46,53,57,62,65],[53,60,64,69,72],[48,55,60,62,67]]; // Dm9 / Bbmaj9 / Fmaj7 / Csus2
const SECTIONS=['Umbral','Corriente','Apertura','Regreso'];
const TAU=2*Math.PI;
const hz=m=>440*Math.pow(2,(m-69)/12);
const smooth=x=>x*x*(3-2*x);
const clip=x=>Math.tanh(x);
function put(out,start,duration,note,amp,kind,panSeed=0){
  const first=Math.max(0,Math.round(start*SR)),count=Math.round(duration*SR), f=hz(note),attack=kind==='air'?.18:kind==='bow'?.1:kind==='bass'?.013:.004;
  for(let j=0;j<count&&first+j<out.length;j++){
    const t=j/SR,p=t/duration,fade=Math.min(1,t/attack)*Math.min(1,(duration-t)/(kind==='air'?.7:kind==='bow'?.35:.13)),env=Math.max(0,fade);
    const env2=kind==='pluck'?Math.exp(-t*3.8):kind==='bell'?Math.exp(-t*2):kind==='bass'?Math.exp(-t*1.25):1;
    const fm=Math.sin(TAU*(f*1.996*t+Math.sin(t*.31)*.015));
    let v;
    if(kind==='air')v=.57*Math.sin(TAU*f*t+0.7*Math.sin(TAU*.13*t+panSeed))+.21*Math.sin(TAU*f*2.003*t)+.08*Math.sin(TAU*f*3.002*t);
    else if(kind==='bow')v=.48*Math.sin(TAU*f*t+1.8*fm*Math.exp(-t*2))+.24*Math.sin(TAU*f*2.01*t)+.1*Math.sin(TAU*f*3*t);
    else if(kind==='pluck')v=.62*Math.sin(TAU*f*t+1.5*fm*Math.exp(-t*8))+.19*Math.sin(TAU*f*2*t)+.09*Math.sin(TAU*f*3*t);
    else if(kind==='bell')v=.44*Math.sin(TAU*f*t+2.0*Math.sin(TAU*f*2.58*t)*Math.exp(-t*7))+.2*Math.sin(TAU*f*2.003*t);
    else v=Math.sin(TAU*f*t+.7*Math.sin(TAU*f*2*t)*Math.exp(-t*8))+.13*Math.sin(TAU*f*2*t);
    out[first+j]+=v*env*env2*amp;
  }
}
function noise(out,start,duration,amp,kind,seed){
 let x=seed|0;const from=Math.floor(start*SR), n=Math.round(duration*SR);let low=0,band=0;
 for(let i=0;i<n&&from+i<out.length;i++){
  x=(Math.imul(x,1664525)+1013904223)|0;
  const w=(x/2147483648),t=i/SR,p=t/duration;
  low+=.012*(w-low);band+=.13*(w-band);
  const env=kind==='roll'?Math.exp(-t*5):Math.exp(-t*24);
  const signal=kind==='roll'?low*.9+band*.2:(w-band)*.3+band*.25;
  out[from+i]+=signal*amp*env*(p<.03?smooth(p/.03):1);
 }
}
function echo(out,sec,feedback,wet){const d=Math.floor(sec*SR);for(let i=d;i<out.length;i++)out[i]+=out[i-d]*feedback*wet;}
function reduce(out){for(let i=0;i<out.length;i++)out[i]=clip(out[i]*.8)*.91;return out;}
function section(b){return Math.min(3,Math.floor(b/12));}
function chordAt(b){return CHORDS[Math.floor(b/3)%4]}
function barsTone(out,b,note,amp,kind,beat=0,len=1){put(out,b*BAR+beat*BAR/4,len*BAR/4,note,amp,kind,b%7)}
function renderStem(name){if(!STEMS.includes(name))throw Error('Unknown stem '+name);
 const out=new Float32Array(Math.round(DURATION*SR));
 for(let b=0;b<BARS;b++){
  const c=chordAt(b),s=section(b),phrase=b%12,up=b%3;
  if(name==='horizon'){
   if(up===0){barsTone(out,b,c[0]-12,.22,'air',0,12);barsTone(out,b,c[2],.085,'air',0,12);barsTone(out,b,c[3],.05,'air',0,12)}
   const motif=[0,2,4,3,2,1,2,0],q=motif[(b+Math.floor(b/12))%8];
   if(b%2===0)barsTone(out,b,c[q%5]+(s===2?12:0),.10,'bell',1.75,1.25);
   if(phrase===11)barsTone(out,b,c[1]+12,.08,'bow',3.25,1.8);
  }
  if(name==='calma'){
   const contour=[0,2,1,3,2,4,1,2];
   for(const beat of [0,2.5]){const n=c[contour[(b*2+Math.floor(beat))%8]]+(s===2?12:0);barsTone(out,b,n,.15,'pluck',beat,.8)}
   if(phrase%3===2)barsTone(out,b,c[3]+12,.065,'bow',3,2.6);
   if(b%4===0)barsTone(out,b,c[0]-24,.16,'bass',0,2.9);
   if(phrase===9)barsTone(out,b,c[4],.07,'bell',2,2);
  }
  if(name==='deriva'){
   const figure=[0,2,4,3,1,2,0,3],busy=s===1||s===2;
   for(let k=0;k<4;k++){
    if(k===3&&!busy)continue;
    const off=(k*1.0)+(k%2?.19:0),pitch=c[figure[(b*3+k)%8]%5]+(k===2?12:0);
    barsTone(out,b,pitch,.085+(busy?.025:0),'pluck',off,.44);
   }
   barsTone(out,b,c[0]-24,.19,'bass',0,1.6);
   if(b%2===0)barsTone(out,b,c[0]-12,.08,'bass',2.25,.8);
   if(b%2===1)noise(out,b*BAR+1.5*BAR/4,.22,.12,'snap',b*157+23);
   if(phrase===11)barsTone(out,b,c[4]+12,.12,'bell',3,1.1);
  }
  if(name==='tormenta'){
    for(let k=0;k<8;k++){
      if(s===0&&k%2===1)continue;
      const beat=k*.5, n=c[(k+Math.floor(b/2))%5]+(k%4===0?-12:12);
      barsTone(out,b,n,k%4===0?.12:.064,'bow',beat,.38);
    }
    for(const beat of [0,1.5,2.5])barsTone(out,b,c[0]-24,.29,'bass',beat,.39);
    for(const beat of [1,3])noise(out,b*BAR+beat*BAR/4,.2,.2,'snap',b*811+beat*47);
    if(b%2===0)noise(out,b*BAR,.56,.16,'roll',b*591+99);
    if(phrase===10)barsTone(out,b,c[4]+12,.2,'bell',2.5,1.5);
  }
 }
 if(name==='horizon')echo(out,.46,.22,.45);
 if(name==='calma')echo(out,.75,.15,.27);
 if(name==='deriva')echo(out,.3125,.23,.4);
 if(name==='tormenta')echo(out,.1875,.18,.35);
 return reduce(out);
}
function mix(stems,emotion){const a=stems.horizon,b=stems[emotion];if(!b)throw Error('Invalid mood');const out=new Float32Array(a.length);for(let i=0;i<out.length;i++)out[i]=clip(a[i]*.74+b[i]*.79)*.84;return out;}
function wav16(data){const buffer=new ArrayBuffer(44+data.length*2),v=new DataView(buffer);function str(o,s){for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,36+data.length*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);v.setUint32(28,SR*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,data.length*2,true);for(let i=0;i<data.length;i++)v.setInt16(44+i*2,Math.max(-32768,Math.min(32767,Math.round(data[i]*32767))),true);return new Uint8Array(buffer);}
const PROJECT={schema:'marea-variable/score-2',taskId:'music-w003-20261122-08',title:'Marea Variable',bpm:BPM,bars:BARS,sampleRate:SR,sections:SECTIONS,chords:CHORDS,stems:STEMS,rights:'All waveforms generated from original JS; no samples or sound recordings from others.'};
export {SR,BPM,BEATS,BARS,BAR,DURATION,STEMS,CHORDS,SECTIONS,renderStem,mix,wav16,PROJECT};
