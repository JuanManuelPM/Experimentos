/* CÁMARA DE PRESIÓN | render original determinista; 126 BPM; sin muestras ajenas. */
export function phraseAutomation(bar) {
 const p={kick:1,bass:0,hats:.50,clap:0,chord:0,air:.10,ghost:0,zone:"INTRO"};
 if(bar>=8)Object.assign(p,{bass:.44,hats:.74,air:.18});
 if(bar>=16)Object.assign(p,{bass:.82,hats:.78,clap:.72,chord:.34,air:.24,zone:"MOTOR"});
 if(bar>=32)Object.assign(p,{bass:.90,hats:.94,clap:.88,chord:.15,air:.31,ghost:.6,zone:"PRESION"});
 if(bar>=40&&bar<44)Object.assign(p,{bass:.32,clap:0,chord:0,hats:.42,air:.42,zone:"VACIO"});
 if(bar>=44&&bar<48)Object.assign(p,{bass:.95,hats:.96,clap:.92,chord:.2,air:.33,ghost:.9,zone:"UMBRAL"});
 if(bar>=48)Object.assign(p,{bass:.97,hats:1,clap:.96,chord:.72,air:.33,ghost:1,zone:"CLIMAX"});
 if(bar>=64)Object.assign(p,{bass:.62,hats:.75,clap:.45,chord:0,air:.12,ghost:0,zone:"SALIDA"});
 if(bar>=72)Object.assign(p,{bass:0,clap:0,hats:.55,air:.08,zone:"DJ_OUTRO"});
 if(bar===31||bar===47||bar===63){p.hats*=.4;p.clap*=.3;}
 if(bar%8===7)p.ghost=Math.max(p.ghost,.45);
 return p;
}
export function renderTechno({startBar=0,bars=80,sampleRate=44100}={}) {
 const bpm=126,secondsPerBeat=60/bpm,barSeconds=4*secondsPerBeat,size=Math.round(bars*barSeconds*sampleRate),names=["kick","bass","percussion","chords","atmosphere"],data=names.map(()=>new Float32Array(size)),TAU=Math.PI*2;
 const seedRandom=(seed)=>{let s=(seed>>>0)||1;return ()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/4294967296;}};
 const counts={kick:0,bass:0,percussion:0,chords:0,atmosphere:0};
 const add=(track,when,duration,generator)=>{const first=Math.round((when-startBar*barSeconds)*sampleRate),n=Math.round(duration*sampleRate),out=data[track],start=Math.max(0,-first),end=Math.min(n,size-first);for(let j=start;j<end;j++){const s=generator(j/sampleRate,j);if(Number.isFinite(s))out[first+j]+=s;}};
 for(let bar=startBar;bar<startBar+bars;bar++){
  const a=phraseAutomation(bar),btime=bar*barSeconds,bar4=bar%4;
  for(let beat=0;beat<4;beat++){
   const when=btime+beat*secondsPerBeat,r=seedRandom(7003+bar*19+beat*101);
   add(0,when,.42,t=>{const phase=TAU*(52*t+127*(1-Math.exp(-38*t))/38),body=Math.sin(phase)*(1-Math.exp(-520*t))*Math.exp(-10.7*t),sub=.22*Math.sin(TAU*52*t)*(1-Math.exp(-70*t))*Math.exp(-8.3*t),click=(r()*2-1)*Math.exp(-115*t);return .69*(body+sub)+.08*click;});counts.kick++;
   const hatT=when+.5*secondsPerBeat+.0045*Math.sin((bar*4+beat)*1.7),hRand=seedRandom(30023+bar*107+beat*13);let previous=0;
   const velocity=(beat===1||beat===3?.7:.53)*a.hats*(.96+.06*Math.sin(bar+beat));
   if(velocity>.01){add(2,hatT,.081,t=>{const x=hRand()*2-1,hp=x-previous*.94;previous=x;return .22*velocity*hp*Math.exp(-44*t)*(1-Math.exp(-800*t));});counts.percussion++;}
   if(a.ghost>0&&(beat===1||beat===3)&&bar%2===1){const ghostRand=seedRandom(5123+bar*8+beat);let prev=0;add(2,when+.78*secondsPerBeat,.047,t=>{const x=ghostRand()*2-1,hp=x-prev*.9;prev=x;return a.ghost*.062*hp*Math.exp(-74*t);});counts.percussion++;}
   if((beat===1||beat===3)&&a.clap>0){const clapRand=seedRandom(91402+bar*5+beat);let prev=0;add(2,when,.175,t=>{const x=clapRand()*2-1,hp=x-prev*.56;prev=x;const burst=(t<.016?1:t<.030?.54:t<.052?.37:.18);return a.clap*.19*hp*burst*(1-Math.exp(-780*t))*Math.exp(-17*t);});counts.percussion++;}
  }
  if(a.bass>0){
   const patterns=[[.5,1.5,2.5,3.5],[.5,1.5,2.25,3.5],[.5,1.25,2.5,3.25],[.5,1.5,2.75,3.5]],pn=[73.416,73.416,87.307,65.406,73.416,98,87.307,73.416];
   patterns[bar4].forEach((beatOffset,i)=>{if((bar>=40&&bar<44&&i%2===1)||(bar>=64&&i===2))return;
    const note=pn[(bar*3+i+Math.floor(bar/8))%pn.length],time=btime+beatOffset*secondsPerBeat,vel=a.bass*(i===0?1:.81);
    add(1,time,.34,t=>{const freq=note*(1+.035*Math.exp(-40*t)),phase=TAU*freq*t,tone=Math.tanh(1.42*(Math.sin(phase)+.39*Math.sin(phase*2+.19*Math.sin(TAU*5.7*t))+.15*Math.sin(3*phase))),env=(1-Math.exp(-86*t))*Math.exp(-5.1*t)*Math.min(1,Math.max(0,(.34-t)/.08)),nextKick=(beatOffset%1===.75?.25:.5)*secondsPerBeat,gap=t>nextKick?Math.max(.32,1-.66*(1-Math.exp(-24*(t-nextKick)))):1;return .38*vel*tone*env*gap;});counts.bass++;
   });
  }
  if(a.chord>0&&(bar%2===0||bar===49||bar===57)){
   const root=bar%8<4?146.832:130.813,voicing=[root,root*1.1892,root*1.4983,root*2.2449],amp=a.chord*(bar%4===0?1:.58),time=btime+(bar%2)*.125*secondsPerBeat;
   add(3,time,1.24,t=>{let y=0;for(let k=0;k<voicing.length;k++){const f=voicing[k]*(1+(k-1.5)*.0009);y+=(Math.sin(TAU*f*t+.15*Math.sin(TAU*3*t+k))+.23*Math.sin(TAU*2.01*f*t))/(k+1);}const decay=Math.exp(-3.4*t)*(1-Math.exp(-28*t)),filterShape=.58+.32*Math.sin(TAU*.33*t+bar*.21);return .11*amp*y*decay*filterShape;});counts.chords++;
  }
  if(bar%4===0&&a.air>0){const span=barSeconds*4,pr=seedRandom(7456+bar);let slow=0;add(4,btime,span,t=>{const amp=a.air*Math.sin(Math.PI*Math.min(1,t/span))**2,harmonics=.42*Math.sin(TAU*109.999*t)+.26*Math.sin(TAU*164.997*t+.21*Math.sin(TAU*.11*t))+.12*Math.sin(TAU*220.05*t+.18*Math.sin(TAU*.08*t));slow=.996*slow+.004*(pr()*2-1);return amp*(.27*harmonics+.18*slow);});counts.atmosphere++;}
 }
 const master=new Float32Array(size),premaster=new Float32Array(size),stemGains={kick:.88,bass:.62,percussion:.76,chords:.72,atmosphere:.86};
 let pmax=0,max=0,sq=0,finite=true;
 for(let i=0;i<size;i++){const raw=.88*data[0][i]+.62*data[1][i]+.76*data[2][i]+.72*data[3][i]+.86*data[4][i];premaster[i]=raw;pmax=Math.max(pmax,Math.abs(raw));const y=Math.tanh(1.09*raw)/Math.tanh(1.09);if(!Number.isFinite(y))finite=false;master[i]=y;max=Math.max(max,Math.abs(y));sq+=y*y;}
 const finalGain=max>.94?.94/max:1;if(finalGain!==1){for(let i=0;i<size;i++)master[i]*=finalGain;max*=finalGain;}
 return {master,premaster,stems:Object.fromEntries(names.map((n,i)=>[n,data[i]])),sampleRate,bpm,bars,startBar,seconds:bars*barSeconds,counts,peak:max,premasterPeak:pmax,rms:Math.sqrt(sq/size)*finalGain,finite,stemGains};
}
export function wavBytes(samples,rate){const out=new Uint8Array(44+samples.length*2),dv=new DataView(out.buffer);const str=(offset,s)=>{for(let i=0;i<s.length;i++)out[offset+i]=s.charCodeAt(i);};str(0,"RIFF");dv.setUint32(4,out.length-8,true);str(8,"WAVE");str(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);str(36,"data");dv.setUint32(40,samples.length*2,true);for(let i=0;i<samples.length;i++){const s=Math.max(-1,Math.min(1,samples[i]));dv.setInt16(44+i*2,Math.round(s<0?s*32768:s*32767),true);}return out;}
