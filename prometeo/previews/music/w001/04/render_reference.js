/* PROMETEO W001-04 original deterministic reference renderer. Node 18+; no external samples. */
function compose(){
 const sr=11025,bpm=122,bars=64,beat=60/bpm,duration=bars*4*beat,N=Math.round(sr*duration),names=["DRUMS","BASS","HARMONY","ATMOS"],s={};names.forEach(k=>s[k]=new Float32Array(N));let seed=420403;
 const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1};
 const tracks=[["kick","Pulso / kick","kick",.7,-.01,"DRUMS"],["clap","Palmas secas","snare",.28,.05,"DRUMS"],["hat","Charles swing","velsilkhat",.32,.08,"DRUMS"],["wood","Toques madera","velwood",.21,-.12,"DRUMS"],["bass","Bajo redondo","sub",.65,0,"BASS"],["rhodes","Teclas de madrugada","keys",.33,-.15,"HARMONY"],["pad","Luz difusa","pad",.20,.15,"ATMOS"],["air","Ruido de cinta","velhush",.17,0,"ATMOS"]].map(([id,name,type,gain,pan,group])=>({id,name,type,gain,pan,group,fx:{reverb:type==="pad"?.22:type==="keys"?.12:0,delay:type==="keys"?.08:0},events:[]}));
 const tx=Object.fromEntries(tracks.map(t=>[t.id,t]));const sections=[["LUZ DISTANTE",0,8],["PULSO",8,16],["CIUDAD DORMIDA",16,32],["AIRE",32,40],["VENTANA ABIERTA",40,56],["AMANECER",56,64]].map(([name,start_bar,end_bar])=>({name,start_bar,end_bar}));
 const voicings=[[57,60,64,67],[53,57,60,64],[52,55,59,62],[55,57,62,64]],roots=[33,29,36,31];function ev(id,b,q,d,n,v){let time=(b*4+q)*beat;if(time>=0&&time<duration)tx[id].events.push({time:+time.toFixed(5),dur:+d.toFixed(4),note:n,vel:v})}
 for(let b=0;b<bars;b++){
  const main=(b>=8&&b<32)||(b>=40&&b<62),intro=b>=4&&b<8,bridge=b>=32&&b<34||b>=38&&b<40,tail=b>=62;
  if(main||intro||bridge||tail)for(let i=0;i<4;i++)if(!(intro||tail)||i%2===0)ev("kick",b,i,.46,36,b>=56?101:114);
  if(main)for(const j of [1,3])ev("clap",b,j,.15,51,72+(b%4===3?10:0));
  if(main||intro)for(let j=0;j<4;j++){ev("hat",b,j+.5+(j%2?.039:.014),.12,81,b%4===0?43:54);if(main&&j%2)ev("hat",b,j+.79,.07,78,32)}
  if(main&&b%2===0){ev("wood",b,1.73,.15,59,45);ev("wood",b,3.74,.15,62,40)}
  if(main&&b>=16&&b<56)ev("hat",b,3.23,.2,75,37);
  const chord=voicings[Math.floor(b/4)%4],root=roots[Math.floor(b/4)%4];
  if(main){for(const [j,q] of [0,.75,1.5,2.75,3.5].entries())if(!((b===31||b===55)&&j>=3))ev("bass",b,q,j===0?.45:.26,j===3?root+12:j===4?root+7:root,j===0?96:73+(j%2)*9);
   if(b%2===0||b>=48)for(const q of [.5,2.5])for(let j=0;j<chord.length;j++)if(j<3||b>=16)ev("rhodes",b,q,.5,chord[j],q===.5?64:52);
   if(b>=16&&b<56&&b%4===3)for(const j of [1,2])ev("rhodes",b,3.28,.3,chord[j]+12,39);
  }
  if((b<8||b>=24&&b<40||b>=48)&&b%4===0)for(let j=0;j<chord.length;j++)if(j>0||b<48)ev("pad",b,.03,Math.min(8.3,(bars-b)*4*beat-1),chord[j]-12,b>=32?46:39);
  if([0,7,15,23,31,32,39,47,55,63].includes(b))ev("air",b,0,Math.min(2.6,(bars-b)*4*beat),68,41);
 }
 tracks.forEach(t=>t.events.sort((a,b)=>a.time-b.time));
 const f=m=>440*Math.pow(2,(m-69)/12);function put(k,time,len,fn){const out=s[k],at=Math.floor(time*sr),M=Math.min(N-at,Math.floor(len*sr));for(let i=0;i<M;i++)out[at+i]+=fn(i/sr,i)}
 for(const tr of tracks)for(const e of tr.events){const v=e.vel/127,t=e.time;
  if(tr.id==="kick")put("DRUMS",t,.53,u=>Math.sin(2*Math.PI*(45*u+2.9*(1-Math.exp(-40*u))))*(1-Math.exp(-u*360))*Math.exp(-u*11)*.69*v+rnd()*.010*Math.exp(-u*110)*v);
  if(tr.id==="clap"){let lp=0;put("DRUMS",t,.20,u=>{let w=rnd();lp+=(w-lp)*.21;return((w-lp)*.185+Math.sin(2*Math.PI*163*u)*.07)*Math.exp(-u*23)*(1+.40*Math.sin(180*u))*v})}
  if(tr.id==="hat"){let lp=0;put("DRUMS",t,.20,u=>{let w=rnd();lp+=(w-lp)*.075;return(w-lp)*(1-Math.exp(-u*980))*Math.exp(-u*(e.dur>.15?19:53))*.064*v})}
  if(tr.id==="wood")put("DRUMS",t,.17,u=>(Math.sin(2*Math.PI*(190*u+1.8*(1-Math.exp(-30*u))))*.11+rnd()*.024)*Math.exp(-u*35)*v);
  if(tr.id==="bass"){const hz=f(e.note);put("BASS",t,e.dur+.19,u=>{const p=2*Math.PI*hz*u,en=(1-Math.exp(-u*200))*Math.exp(-u*2.6)*(u>e.dur?Math.exp(-(u-e.dur)*22):1);return(.83*Math.sin(p)+.15*Math.sin(2*p)+.035*Math.sin(3*p))*en*.285*v})}
  if(tr.id==="rhodes"){const hz=f(e.note);put("HARMONY",t,e.dur+.40,u=>{const p=2*Math.PI*hz*u,en=(1-Math.exp(-u*100))*Math.exp(-u*2.8)*(u>e.dur?Math.exp(-(u-e.dur)*7):1);return(.77*Math.sin(p+2*Math.exp(-u*7)*Math.sin(2*p))+.14*Math.sin(2*p)+.04*Math.sin(3*p))*en*.091*v})}
  if(tr.id==="pad"){const hz=f(e.note);put("ATMOS",t,Math.min(duration-t,e.dur+1.1),u=>{const p=2*Math.PI*hz*u,en=Math.min(1,u/.75)*(u>e.dur?Math.exp(-(u-e.dur)*2.5):1);return(.75*Math.sin(p)+.14*Math.sin(p*2.002)+.06*Math.sin(3*p))*en*(.85+.15*Math.sin(u*.83))*.055*v})}
  if(tr.id==="air"){let lp=0;put("ATMOS",t,Math.min(duration-t,e.dur),u=>{const w=rnd();lp+=(w-lp)*.018;return lp*Math.sin(Math.PI*u/e.dur)**2*.045*v})}
 }
 const master=new Float32Array(N);let peak=0;for(let i=0;i<N;i++){const fade=Math.max(0,Math.min(1,i/(sr*.35),(N-i)/(sr*1.4)));let q=0;for(const k of names){s[k][i]*=fade;q+=s[k][i]}master[i]=q;peak=Math.max(peak,Math.abs(q))}
 const scale=Math.min(1,.9/Math.max(peak,.001));let sum=0,p=0;for(let i=0;i<N;i++){master[i]*=scale;sum+=master[i]*master[i];p=Math.max(p,Math.abs(master[i]));for(const k of names)s[k][i]*=scale}
 const song={schema:"prometeo.songproject/v2",id:"music-w001-04-ventana-3-am",title:"VENTANA 3 AM",author:"PROMETEO · instrumental original",bpm,bars,meter:[4,4],duration_seconds:+duration.toFixed(6),render_sample_rate:48000,master_gain:.78,sections,tracks:tracks.map(({group,...t})=>({...t,role:group}))};
 return{song,master,stems:s,stats:{durationSeconds:duration,sampleRate:sr,channels:1,bits:16,bpm,bars,tracks:tracks.length,noteEvents:tracks.reduce((n,t)=>n+t.events.length,0),peak:p,rms:Math.sqrt(sum/N),masterScale:scale}};
}
function wav(arr,sr){const b=new Uint8Array(44+arr.length*2),v=new DataView(b.buffer),w=(i,s)=>{for(let j=0;j<s.length;j++)v.setUint8(i+j,s.charCodeAt(j))};w(0,"RIFF");v.setUint32(4,b.length-8,true);w(8,"WAVE");w(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,"data");v.setUint32(40,b.length-44,true);for(let i=0;i<arr.length;i++)v.setInt16(44+2*i,Math.round(Math.max(-1,Math.min(1,arr[i]))*32767),true);return b}
const fs=require('fs'),path=require('path');const dst=process.argv[2]||'.';const d=compose();fs.mkdirSync(path.join(dst,'STEMS'),{recursive:true});fs.writeFileSync(path.join(dst,'MASTER.wav'),Buffer.from(wav(d.master,d.stats.sampleRate)));for(const [k,a] of Object.entries(d.stems))fs.writeFileSync(path.join(dst,'STEMS',k+'.wav'),Buffer.from(wav(a,d.stats.sampleRate)));fs.writeFileSync(path.join(dst,'SONGPROJECT.json'),JSON.stringify(d.song,null,2)+'\n');console.log(JSON.stringify(d.stats,null,2));
