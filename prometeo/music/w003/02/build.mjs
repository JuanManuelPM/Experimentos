// DESPLAZAMIENTO / music-w003-20261122-02. Deterministic 44.1k production.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {BPM,SR,BEAT,BARS,TRACKS,groove,compose,renderMix,stats,equalizeAB} from './engine.mjs';
const root=path.dirname(new URL(import.meta.url).pathname);
const save=(p,b)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,b);return f};
const sr=SR, len=Math.ceil((BARS*4*BEAT+6)*sr), duration=len/sr;
const events=compose(BARS,'played');
const base=renderMix(events,{sampleRate:sr,duration});
function stereoFromStems(stems){
 const stereo={};const left=new Float32Array(len),right=new Float32Array(len);
 const pos={kick:0,snare:0,hats:.38,ghost:-.43,bass:0,chords:.28,motif:-.26,air:.47};
 const echoes={chords:[.091,.12],motif:[.14,.115],air:[.19,.13]};
 for(const tr of TRACKS){
  const s=stems[tr],l=new Float32Array(len),r=new Float32Array(len);
  const pan=pos[tr];const gl=Math.cos((pan+1)*Math.PI/4),gr=Math.sin((pan+1)*Math.PI/4);
  const de=echoes[tr],tap=de?Math.round(de[0]*sr):0,tapgain=de?de[1]:0;
  for(let i=0;i<len;i++){
   const delayed=i>=tap?s[i-tap]*tapgain:0;
   l[i]=s[i]*gl+delayed*.27;r[i]=s[i]*gr+delayed;
   left[i]+=l[i];right[i]+=r[i];
  }stereo[tr]={l,r};
 }
 let peak=0;for(let i=0;i<len;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 const gain=Math.min(1,.96/Math.max(peak,.0001));
 for(let i=0;i<len;i++){left[i]*=gain;right[i]*=gain}
 for(const tr of TRACKS){const s=stereo[tr];for(let i=0;i<len;i++){s.l[i]*=gain;s.r[i]*=gain}}
 return {left,right,stereo,prePeak:peak,gain};
}
function wavStereo(l,r,sr=SR){
 const n=l.length,buf=Buffer.allocUnsafe(44+n*4);
 buf.write('RIFF',0);buf.writeUInt32LE(buf.length-8,4);buf.write('WAVEfmt ',8);
 buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(sr,24);
 buf.writeUInt32LE(sr*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);
 buf.write('data',36);buf.writeUInt32LE(n*4,40);
 for(let i=0;i<n;i++){buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(l[i]*32767))),44+i*4);buf.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(r[i]*32767))),46+i*4);}
 return buf;
}
const render=stereoFromStems(base.stems);
const master=save('master.wav',wavStereo(render.left,render.right));
for(const tr of TRACKS)save('stems/'+tr+'.wav',wavStereo(render.stereo[tr].l,render.stereo[tr].r));
// Same harmony, same section, but different per-voice velocity/timing. A/B after RMS matching.
const firstBeat=16*4*BEAT,dAB=4*4*BEAT+1;
const slice=feel=>compose(20,feel).filter(e=>e.bar>=16&&e.bar<20).map(e=>({...e,bar:e.bar-16,time:e.time-firstBeat}));
const evA=slice('played'),evB=slice('straight');
const mixA=renderMix(evA,{sampleRate:sr,duration:dAB}),mixB=renderMix(evB,{sampleRate:sr,duration:dAB});
const norm=equalizeAB(mixA.mix,mixB.mix);
const abA=save('ab/played.wav',wavStereo(norm.A,norm.A));
const abB=save('ab/straight-matched.wav',wavStereo(norm.B,norm.B));
save('EVENTS.json',JSON.stringify({schema:'prometeo.music.events/v1',taskId:'music-w003-20261122-02',bpm:BPM,bars:BARS,trackNames:TRACKS,groove,sections:[
{bars:'0-3',name:'arrival'},{bars:'4-11',name:'first-drive'},{bars:'12-15',name:'hollow'},{bars:'16-23',name:'release'},{bars:'24-27',name:'absence'},{bars:'28-31',name:'return'}],events},null,2));
// Standard MIDI type 1, editable notes with per-track microtiming baked into ticks.
const vlq=x=>{let a=[x&127];while((x>>=7)>0)a.unshift((x&127)|128);return a};
function midiTrack(events,channel){
 const sorted=events.sort((a,b)=>a.tick-b.tick||a.priority-b.priority),data=[];
 let prev=0;for(const e of sorted){data.push(...vlq(e.tick-prev),e.status|channel,e.pitch,e.vel);prev=e.tick}
 data.push(0,0xff,0x2f,0);const h=Buffer.alloc(8);h.write('MTrk',0);h.writeUInt32BE(data.length,4);
 return Buffer.concat([h,Buffer.from(data)]);
}
const tempo=Math.round(60000000/BPM),tt=Buffer.from([0x00,0xff,0x51,0x03,(tempo>>>16)&255,(tempo>>>8)&255,tempo&255,0,0xff,0x2f,0]);
const ht=Buffer.alloc(8);ht.write('MTrk',0);ht.writeUInt32BE(tt.length,4);const chunks=[Buffer.concat([ht,tt])];
TRACKS.forEach((tr,i)=>{const notes=[];for(const e of events)if(e.track===tr){
 const tick=Math.max(0,Math.round(e.time/BEAT*480)),end=tick+Math.max(1,Math.round(e.durationBeats*480)),pitch=Math.min(127,Math.max(0,e.note)),vel=Math.min(127,Math.max(1,Math.round(e.vel*118)));
 notes.push({tick,priority:1,status:0x90,pitch,vel},{tick:end,priority:0,status:0x80,pitch,vel:0});
}chunks.push(midiTrack(notes,i%16))});
const mh=Buffer.alloc(14);mh.write('MThd',0);mh.writeUInt32BE(6,4);mh.writeUInt16BE(1,8);mh.writeUInt16BE(1+TRACKS.length,10);mh.writeUInt16BE(480,12);
save('DESPLAZAMIENTO.mid',Buffer.concat([mh,...chunks]));
let parity=0,peak=0;
for(let i=0;i<len;i++){let a=0,b=0;for(const t of TRACKS){a+=render.stereo[t].l[i];b+=render.stereo[t].r[i]}parity=Math.max(parity,Math.abs(a-render.left[i]),Math.abs(b-render.right[i]));peak=Math.max(peak,Math.abs(render.left[i]),Math.abs(render.right[i]))}
const uniqueOffsets=new Set(evA.filter(e=>['kick','snare','hats','ghost','bass'].includes(e.track)).map(e=>e.track+':'+e.offsetMs));
const fn=fs.readdirSync(root),sha=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
const qa={schema:'prometeo.music.qa/v1',taskId:'music-w003-20261122-02',date:new Date().toISOString(),state:'TECHNICAL_TESTS_ONLY',
 sampleRateHz:sr,channels:2,bpm:BPM,bars:BARS,durationSec:duration,events:events.length,stems:TRACKS.length,
 masterSha256:sha('master.wav'),masterBytes:fs.statSync(master).size,
 samplePeak:peak,stemsToMasterFloatMaxError:parity,masterRmsLeft:stats(render.left).rms,masterRmsRight:stats(render.right).rms,
 abSameHarmonicNotes:evA.filter(e=>['bass','chords','motif'].includes(e.track)).map(e=>[e.track,e.note,e.bar,e.beat]).join('|')===evB.filter(e=>['bass','chords','motif'].includes(e.track)).map(e=>[e.track,e.note,e.bar,e.beat]).join('|'),
 abLevelMatchGain:norm.rmsGain,abRmsDifferenceDb:20*Math.log10(stats(norm.A).rms/stats(norm.B).rms),perTrackOffsetsObserved:[...uniqueOffsets].slice(0,32),
 audioDecode:'PENDING_FFMPEG',headphoneListen:'NOT_RUN',criticalListening:'NOT_RUN',benchmarkTrackAudio:'NOT_RUN',humanApproved:false,
 caveat:'Metrics do not prove aesthetic quality; stereo is generated procedurally from original synthesis.'};
save('QA.json',JSON.stringify(qa,null,2));
if(!qa.abSameHarmonicNotes||Math.abs(qa.abRmsDifferenceDb)>.0001||parity>1e-4||peak>1)throw Error('TECHNICAL_GATE_FAILED');
console.log(JSON.stringify(qa));
