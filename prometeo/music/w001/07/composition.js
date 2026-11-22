/* CORTOCIRCUITO · W001-07 · síntesis original determinística.
   Sin samples externos. Proyecto editado en formato PROMETEO SongProject v2.
   Audio: PCM16 mono, 22050 Hz; export idéntico a lo que reproduce el HTML. */
(function(global){
"use strict";
const bpm=136,bars=72,beat=60/bpm,bar=beat*4,seconds=bars*bar;
const sections=[["CARGA",0,8],["CIRCUITO",8,24],["FALSA CALMA",24,40],["CORTE",40,48],["SOBRECARGA",48,64],["DESCARGA",64,72]];
const project={schema:"prometeo.songproject/v2",id:"music-w001-07-cortocircuito",title:"CORTOCIRCUITO",author:"PROMETEO · composición original",bpm,meter:[4,4],bars,duration_seconds:+seconds.toFixed(5),master_gain:.78,sections:sections.map(([name,start_bar,end_bar])=>({name,start_bar,end_bar})),tracks:[
{id:"kick",name:"Bombo / ruptura",type:"kick",gain:.78,pan:0,fx:{reverb:0,delay:0},mute:false,solo:false,events:[]},
{id:"snare",name:"Caja / fantasmas",type:"snare",gain:.58,pan:0,fx:{reverb:.02,delay:0},mute:false,solo:false,events:[]},
{id:"hat",name:"Metal seco / aire",type:"hat",gain:.31,pan:.1,fx:{reverb:0,delay:0},mute:false,solo:false,events:[]},
{id:"bass",name:"Bajo percusivo / Fa menor",type:"reese",gain:.58,pan:0,fx:{reverb:0,delay:0},mute:false,solo:false,events:[]},
{id:"fx",name:"Descargas / silencios",type:"fx",gain:.24,pan:-.13,fx:{reverb:.05,delay:0},mute:false,solo:false,events:[]}
]};
const add=(id,b,s,n,v,steps=1)=>project.tracks[id].events.push({time:+((b*16+s)*beat/4).toFixed(5),dur:+(steps*beat/4).toFixed(5),note:n,vel:v});
for(let b=0;b<bars;b++){
 let cut=b>=40&&b<48,intro=b<8,out=b>=64,fin=b===71;
 let kicks=cut?[0]:intro?[0,10]:out?[0,10]:[0,7,10,14];
 if(b%4===3&&!cut&&!intro&&!out)kicks=[0,7,10,13];
 if(b===47||b===63||fin)kicks=[0];
 for(let s of kicks)add(0,b,s,36,s===0?112:s===10?100:82,1);
 let sn=cut?(b%2===0?[12]:[]):intro?[12]:out?[4,12]:[4,12];
 for(let s of sn)add(1,b,s,38,s===12?105:94,1);
 if(!cut&&!intro&&!out)for(let s of (b%2===0?[3,11,15]:[2,11,13]))add(1,b,s,38,38+(b+s)%14,.4);
 if(!cut){
  for(let s of (intro?[6,14]:out?[2,10,14]:[2,6,9,14]))add(2,b,s,42,48+((b*7+s*3)%17),.4);
  if(!intro&&!out&&b%4!==0)add(2,b,15,46,58,.85);
 }
 if(!intro&&!cut&&!fin){
  const riff=b%4===3?[3,6,11]:[3,6,11,14],notes=[29,36,32,27];
  for(let i=0;i<riff.length;i++)add(3,b,riff[i],notes[(i+b%4)%4],97-i*6,i===2?2:1.65);
 }else if(cut&&b%2===0)add(3,b,11,29,58,2.2);
 if([7,23,39,47,63,71].includes(b)){add(4,b,12,49,80,3.25);if(b===47)add(4,b,1,41,54,2)}
 if(b>=48&&b<64&&b%4===1)add(4,b,6,46,56,1.4);
}
for(const tr of project.tracks)tr.events.sort((a,b)=>a.time-b.time);
function renderWav(solo=-1,sampleRate=22050){
 if(!Number.isInteger(solo)||solo<-1||solo>=project.tracks.length)throw Error("Stem inválido");
 const sr=sampleRate,N=Math.round(seconds*sr),pcm=new Float32Array(N);
 let seed=0x83b4af22;
 const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/2147483648-1);
 const hz=n=>440*Math.pow(2,(n-69)/12),TAU=2*Math.PI;
 for(let j=0;j<project.tracks.length;j++){
  if(solo!==-1&&j!==solo)continue;
  let tr=project.tracks[j];
  for(const e of tr.events){
   const k0=Math.round(e.time*sr),v=e.vel/127;
   const kind=tr.id;
   const len=kind==="kick"?.39:kind==="snare"?(e.vel<60?.095:.235):kind==="hat"?(e.note===46?.22:.092):kind==="bass"?Math.max(.12,Math.min(.46,e.dur*.96)):Math.min(.72,e.dur+.12);
   const until=Math.min(N-k0,Math.round(len*sr));
   let ph=0,lp=0;
   for(let i=0;i<until;i++){
    const t=i/sr,attack=1-Math.exp(-t*410);
    let y=0;
    if(kind==="kick"){
      ph+=TAU*(47+115*Math.exp(-t*29))/sr;
      y=(Math.sin(ph)+.14*Math.sin(ph*2))*Math.exp(-t*15)*.86+rnd()*.029*Math.exp(-t*85);
    }else if(kind==="snare"){
      let n=rnd();lp+=.16*(n-lp);
      y=((n-lp)*.30+Math.sin(TAU*187*t)*.23)*Math.exp(-t*(e.vel<60?35:18));
    }else if(kind==="hat"){
      let n=rnd();lp+=.10*(n-lp);
      y=(n-lp)*.12*Math.exp(-t*(e.note===46?13:48));
    }else if(kind==="bass"){
      ph+=TAU*hz(e.note)*(1+.14*Math.exp(-t*21))/sr;
      y=Math.tanh(1.6*(Math.sin(ph)+.26*Math.sin(2*ph+.3*Math.sin(ph))))*.32*Math.exp(-t*4.1);
    }else{
      let n=rnd();lp+=.06*(n-lp);
      ph+=TAU*(hz(e.note)+10*Math.exp(-t*18))/sr;
      y=(Math.sin(ph)*.17+(n-lp)*.04)*Math.exp(-t*7);
    }
    let fade=len-t<.012?Math.max(0,(len-t)/.012):1;
    pcm[k0+i]+=y*v*tr.gain*attack*fade;
   }
  }
 }
 let peak=0,sum=0;
 for(let i=0;i<N;i++){
  let t=i/sr,gain=Math.min(1,t/1.4)*Math.min(1,Math.max(0,(seconds-t)/2.8));
  let y=pcm[i]*1.1*gain; /* bus lineal: suma de stems ~= master; margen verificado */
  if(!Number.isFinite(y))throw Error("Sample no finito");
  pcm[i]=y;peak=Math.max(peak,Math.abs(y));sum+=y*y;
 }
 const bytes=new Uint8Array(44+N*2),dv=new DataView(bytes.buffer);
 const ascii=(i,s)=>{for(let j=0;j<s.length;j++)bytes[i+j]=s.charCodeAt(j)};
 ascii(0,"RIFF");dv.setUint32(4,36+N*2,true);ascii(8,"WAVE");ascii(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);ascii(36,"data");dv.setUint32(40,N*2,true);
 for(let i=0;i<N;i++)dv.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,pcm[i]))*32767),true);
 return {bytes,qa:{seconds:+seconds.toFixed(3),sampleRate:sr,channels:1,bitDepth:16,peak:+peak.toFixed(6),rms:+Math.sqrt(sum/N).toFixed(6),events:project.tracks.map(t=>({track:t.id,count:t.events.length})),stem:solo}};
}
global.PROMETEO_W001_07={project,renderWav,sections};
})(typeof window!=="undefined"?window:globalThis);
