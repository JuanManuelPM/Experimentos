// Original synthesis, No sample libraries or proprietary plugins.
const renderSong=function renderSong(opts={}) {
 const cfg=opts.project||{},sr=opts.sampleRate||cfg.sampleRate||24000,bpm=cfg.bpm||116,bars=opts.bars||cfg.bars||48,beat=60/bpm;
 const length=Math.ceil(sr*(4*bars*beat+1)),seed=cfg.seed||2026112206;
 const patch=Object.assign({kick:{f:45,sweep:105,d:0.29},snare:{f:184,d:0.19},bass:{f:560,d:0.29,drive:1.54,pwm:.39},seq:{f:1700,d:0.18,pwm:.56},pad:{f:950,d:1.12,pwm:.32}},cfg.patches||{});
 const names=["kick","percussion","bass","sequence","atmosphere"];
 const stems=Object.fromEntries(names.map(n=>[n,[new Float32Array(length),new Float32Array(length)]])),events=Object.fromEntries(names.map(n=>[n,0]));
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),frac=x=>x-Math.floor(x),hz=m=>440*Math.pow(2,(m-69)/12);
 const blep=(t,d)=>{if(t<d){t/=d;return t+t-t*t-1;}if(t>1-d){t=(t-1)/d;return t*t+t+t+1;}return 0;};
 const rand=initial=>{let x=initial>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/2147483648-1;};};
 function modulation(target,time,bar,step) {
   let sum=0;
   for(const route of (cfg.modulation||[])){if(route.target!==target)continue;
     const src=route.source||{},phase=(src.phase||0)+time*(src.hz||1),ph=frac(phase);
     const value=src.type==="sine"?Math.sin(2*Math.PI*phase):src.type==="triangle"?(1-4*Math.abs(ph-.5)):src.type==="phrase"?(bar%8/3.5-1):src.type==="step"?(src.values||[0])[Math.floor(phase)%(src.values||[0]).length]:0;
     sum+=value*route.depth;
   }return sum;
 }
 function hit(track,kind,when,duration,note,vel,pan,bar,step,serial){
  const start=Math.floor(when*sr),n=Math.min(Math.floor(duration*sr),length-start);if(n<=0)return;
  const [L,R]=stems[track],lp=Math.sqrt((1-pan)*.5),rp=Math.sqrt((1+pan)*.5),rng=rand(seed^Math.imul(serial+1,2246822519));
  let phase=0,phase2=0,filt=0,filt2=0,noiselp=0;
  const z=patch[kind]||{};
  for(let i=0;i<n;i++){
   const t=i/sr,T=when+t,attack=Math.min(1,t*550),rel=clamp((duration-t)*36,0,1);
   let v=0;
   if(kind==="kick"){
    const freq=z.f+z.sweep*Math.exp(-t*29);phase+=freq/sr;
    v=Math.tanh(1.31*Math.sin(2*Math.PI*phase))*Math.exp(-t/z.d)*attack+0.08*rng()*Math.exp(-t*200);
   } else if(kind==="snare"||kind==="clap"){
    const noise=rng();noiselp+=.08*(noise-noiselp);
    const hiss=noise-noiselp;
    phase+=(z.f||190)/sr;
    if(kind==="snare")v=(.38*Math.sin(2*Math.PI*phase)+.71*hiss)*Math.exp(-t/(z.d||.20))*attack;
    else {let bursts=0;for(const delta of [0,.024,.048])if(t>delta)bursts+=Math.exp(-(t-delta)*132);v=hiss*(Math.min(1,bursts)*.68+.23*Math.exp(-t*14))*attack;}
   } else if(kind==="hat"||kind==="openhat"){
    const noise=rng();noiselp+=.11*(noise-noiselp);
    let metal=0;for(const fm of [391,539,703,863,1157,1399])metal+=Math.sin(2*Math.PI*fm*t)/6;
    v=((noise-noiselp)*.7+metal*.3)*Math.exp(-t/(kind==="hat"?.072:.24))*attack;
   } else if(kind==="tom"){
    phase+=(72+145*Math.exp(-t*23))/sr;v=Math.sin(2*Math.PI*phase)*Math.exp(-t*13);
   } else if(kind==="sweep"){
    const noise=rng();noiselp+=.02*(noise-noiselp);v=(noise-noiselp)*Math.sin(Math.PI*t/duration)*.19;
   } else {
    const freq=hz(note)*(1+0.0022*Math.sin(2*Math.PI*.31*T)),d=freq/sr;
    phase=frac(phase+d);phase2=frac(phase2+d*1.005);
    const pw=clamp((z.pwm||.40)+.14*Math.sin(2*Math.PI*.27*T)+modulation("pwm",T,bar,step),.12,.85);
    const pulse=(phase<pw?1:-1)+blep(phase,d)-blep(frac(phase-pw),d);
    const saw=2*phase2-1-blep(phase2,d);
    const sub=Math.sin(2*Math.PI*phase);
    const wave=kind==="bass"?.43*pulse+.25*saw+.60*sub:kind==="seq"?.7*pulse+.31*saw+.13*Math.sin(2*Math.PI*phase2*3):.37*pulse+.34*saw+.28*sub;
    const cutoff=clamp(z.f*(1+modulation("cutoff",T,bar,step))+(opts.cutoffOffset||0),95,Math.min(sr*.40,9000));
    const k=1-Math.exp(-2*Math.PI*cutoff/sr);
    filt+=k*(Math.tanh((z.drive||1.1)*wave)-filt);filt2+=k*(filt-filt2);
    v=filt2*Math.exp(-t/z.d)*attack*rel;
   }
   if(!Number.isFinite(v))throw Error("nonfinite "+kind);
   const value=v*vel*(1+.07*modulation("accent",T,bar,step));
   L[start+i]+=value*lp;R[start+i]+=value*rp;
  }
  events[track]++;
 }
 const bassScale=[40,43,40,47,45,43,38,40,47,43,40,38,40,43,47,40];
 const arps=[64,67,71,76,74,71,67,62,64,67,71,74,76,71,67,64],roots=[40,38,36,35],chords=[[52,55,59],[50,54,57],[48,52,55],[47,51,54]];
 for(let bar=0;bar<bars;bar++){
  const section=Math.floor(bar/8),root=roots[Math.floor(bar/4)%4],base=bar*4*beat;
  const intro=section===0,breakdown=section===3,peak=section===4,outro=section===5;
  for(let step=0;step<16;step++){
    const time=base+step*beat/4, serial=bar*16+step, sync=step%4===3?.010:0;
    if((!breakdown||bar>=30)&&[0,7,10,14].includes(step)&&(step!==14||bar%2||peak))
      hit("kick","kick",time,.48,0,step===0?.61:.41,0,bar,step,serial);
    if((!breakdown||bar===24)&&[4,12].includes(step)){
      hit("percussion","snare",time,.30,0,peak?.39:.32,0,bar,step,serial+70);
      if(peak||section===2)hit("percussion","clap",time+.012,.19,0,.105,.09,bar,step,serial+81);
    }
    if((!intro||bar>=6)&&([2,6,10,14].includes(step)||((section===2||peak)&&[3,11,15].includes(step))))
      hit("percussion","hat",time+sync,.14,0,step%4===2?.21:.11,step%2===0?-.28:.24,bar,step,serial+91);
    if(peak&&step===15&&bar%2===0)hit("percussion","openhat",time,.33,0,.16,.18,bar,step,serial+100);
    if((!intro||bar>=4)&&[0,3,6,9,12,14].includes(step)&&!(breakdown&&step!==0)){
      const n=bassScale[step]+root-40,velocity=step===0?.50:step===9?.39:.31;
      hit("bass","bass",time+(step%2?.006:0),beat/4*(step===0?2.8:1.6),n,velocity,0,bar,step,serial+200);
    }
    if([1,2,4,5].includes(section)&&[1,5,8,11,15].includes(step)&&!(outro&&bar>=44&&step!==1)){
      const n=arps[step]+root-40+(bar%4===3?12:0);
      hit("sequence","seq",time+(step%2?.007:0),beat*.38,n,peak?.29:.23,step%2?.28:-.28,bar,step,serial+300);
    }
  }
  if(bar%2===0&&!outro)for(let j=0;j<3;j++)hit("atmosphere","pad",base,beat*2.3,chords[Math.floor(bar/4)%4][j],breakdown?.145:.105,(j-1)*.36,bar,0,bar*3+j+500);
  if([7,15,23,31,39].includes(bar))hit("atmosphere","sweep",base+beat*3.2,beat*.78,0,.14,.15,bar,13,bar*17);
  if(peak&&bar%2===1)hit("percussion","tom",base+beat*3.5,.25,0,.22,.17,bar,14,bar*23);
 }
 const pre=[new Float32Array(length),new Float32Array(length)];
 for(const val of Object.values(stems))for(let c=0;c<2;c++)for(let i=0;i<length;i++)pre[c][i]+=val[c][i];
 const getMetrics=A=>{let peak=0,sum=0,dc=0;const n=A[0].length;for(let i=0;i<n;i++)for(let c=0;c<2;c++){const x=A[c][i];peak=Math.max(peak,Math.abs(x));sum+=x*x;dc+=x;}return {peak,rms:Math.sqrt(sum/(2*n)),dc:dc/(2*n)};};
 const pregain=Math.min(1,.79/Math.max(getMetrics(pre).peak,1e-12));
 for(const value of Object.values(stems))for(let c=0;c<2;c++)for(let i=0;i<length;i++)value[c][i]*=pregain;
 for(let c=0;c<2;c++)for(let i=0;i<length;i++)pre[c][i]*=pregain;
 const master=[new Float32Array(length),new Float32Array(length)];
 for(let c=0;c<2;c++)for(let i=0;i<length;i++)master[c][i]=Math.tanh(pre[c][i]*1.25)/Math.tanh(1.25);
 const masterGain=Math.min(1,.89/Math.max(getMetrics(master).peak,1e-12));
 for(let c=0;c<2;c++)for(let i=0;i<length;i++)master[c][i]*=masterGain;
 const summary={bpm,bars,sampleRate:sr,durationSeconds:length/sr,seed,events,stems:Object.fromEntries(Object.entries(stems).map(([key,value])=>[key,getMetrics(value)])),premaster:getMetrics(pre),master:getMetrics(master),pregain,masterGain};
 function wav(arr){
  const channels=arr.length,n=arr[0].length,b=new Uint8Array(44+n*channels*2),v=new DataView(b.buffer);
  const str=(p,t)=>{for(let i=0;i<t.length;i++)b[p+i]=t.charCodeAt(i);};
  str(0,"RIFF");v.setUint32(4,b.length-8,true);str(8,"WAVE");str(12,"fmt ");v.setUint32(16,16,true);
  v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sr,true);v.setUint32(28,sr*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);
  str(36,"data");v.setUint32(40,n*channels*2,true);let k=44;
  for(let i=0;i<n;i++)for(let c=0;c<channels;c++){const x=clamp(arr[c][i],-1,1);v.setInt16(k,Math.round(x<0?x*32768:x*32767),true);k+=2;}return b;
 }
 function base64(b){const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";let chunks=[];for(let offset=0;offset<b.length;offset+=36000){let s="";const end=Math.min(b.length,offset+36000);for(let i=offset;i<end;i+=3){const a=b[i],bb=i+1<end?b[i+1]:0,c=i+2<end?b[i+2]:0;s+=chars[a>>2]+chars[((a&3)<<4)|(bb>>4)]+(i+1<end?chars[((bb&15)<<2)|(c>>6)]:"=")+(i+2<end?chars[c&63]:"=");}chunks.push(s);}return chunks.join("");}
 return {master,premaster:pre,stems,summary,wav,base64};
};
module.exports={renderSong};
if(require.main===module){const fs=require("fs"),path=require("path");const root=__dirname;const project=JSON.parse(fs.readFileSync(path.join(root,"SONG_PROJECT.json"),"utf8"));const song=renderSong({project,sampleRate:Number(process.argv[2]||project.sampleRate)});const out=path.join(root,"audio");fs.mkdirSync(out,{recursive:true});for(const [name,a] of Object.entries({MASTER:song.master,PREMASTER:song.premaster,...song.stems}))fs.writeFileSync(path.join(out,name+".wav"),song.wav(a));fs.writeFileSync(path.join(root,"QA_RENDER.json"),JSON.stringify(song.summary,null,2)+"\n");console.log(JSON.stringify(song.summary,null,2));}
