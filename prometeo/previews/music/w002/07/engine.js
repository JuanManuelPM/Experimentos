import {articulation,inspectRecording} from './articulation-map.js';
const AudioCtor=window.AudioContext||window.webkitAudioContext;
const OfflineCtor=window.OfflineAudioContext||window.webkitOfflineAudioContext;
const hz=n=>{const m=/^([A-G])(#?)(\d)$/.exec(n);if(!m)throw Error('Nota desconocida '+n);const sem={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[m[1]]+(m[2]?1:0);return 440*Math.pow(2,((+m[3]+1)*12+sem-69)/12)};
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let projectPromise=null,loaded=null;
export async function readProject(){if(!projectPromise)projectPromise=fetch('./SONGPROJECT.json').then(r=>{if(!r.ok)throw Error('Falta SONGPROJECT.json: HTTP '+r.status);return r.json()});return projectPromise}
async function getSources(ctx,onProgress=()=>{}){
 if(loaded)return loaded;
 const project=await readProject();const entries=Object.entries(project.source);const buffers={};const features={};let done=0;
 for(let i=0;i<entries.length;i+=4){
  await Promise.all(entries.slice(i,i+4).map(async ([key,meta])=>{
   const r=await fetch('./'+meta.file);if(!r.ok)throw Error('No se pudo cargar '+key+' (HTTP '+r.status+')');
   const bytes=await r.arrayBuffer();const header=new Uint8Array(bytes.slice(0,4));
   if(header[0]!==79||header[1]!==103||header[2]!==103||header[3]!==83)throw Error('Origen no OGG: '+key);
   const b=await ctx.decodeAudioData(bytes.slice(0));buffers[key]=b;features[key]=inspectRecording(b);
   onProgress(++done,entries.length);
  }));
 }
 loaded={buffers,features};return loaded;
}
function buses(ctx,project,mode){
 const output=ctx.createGain();output.gain.value=project.mixer.output;
 const a=ctx.createGain(),e=ctx.createGain(),x=ctx.createGain();
 a.gain.value=(mode==='master'||mode==='dry'||mode==='acoustic')?project.mixer.acoustic:0;
 e.gain.value=(mode==='master'||mode==='electronic')?project.mixer.electronic:0;
 x.gain.value=(mode==='master'||mode==='echo')?project.mixer.echo:0;
 a.connect(output);e.connect(output);x.connect(output);output.connect(ctx.destination);
 return {a,e,x,output,project};
}
function sample(ctx,buffer,when,duration,volume,pan,target,cutoff=0){
 if(!buffer||duration<=.02)return;
 const src=ctx.createBufferSource();src.buffer=buffer;
 const env=ctx.createGain();const start=Math.max(ctx.currentTime,when),stop=start+Math.min(Math.max(.15,duration),Math.max(.16,buffer.duration-.02));
 env.gain.setValueAtTime(.00001,start);
 env.gain.linearRampToValueAtTime(Math.max(.0001,volume),start+.021);
 env.gain.setValueAtTime(Math.max(.0001,volume),Math.max(start+.022,stop-.19));
 env.gain.exponentialRampToValueAtTime(.0001,stop);
 src.connect(env);
 let node=env;
 if(cutoff){const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=cutoff;node.connect(lp);node=lp}
 if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=clamp(pan,-.8,.8);node.connect(p);node=p}
 node.connect(target);src.start(start);src.stop(stop+.01);
}
function voice(ctx,when,note,gesture,target,scale=1){
 const f=hz(note)*scale, dur=gesture.responseSeconds;
 const carrier=ctx.createOscillator(),mod=ctx.createOscillator(),fm=ctx.createGain();
 carrier.type='triangle';mod.type='sine';carrier.frequency.value=f;
 mod.frequency.value=f*1.47;fm.gain.value=f*(.10+.12*gesture.pressure);
 mod.connect(fm);fm.connect(carrier.frequency);
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=1.8;lp.frequency.setValueAtTime(gesture.resonanceHz,when);
 lp.frequency.exponentialRampToValueAtTime(Math.max(330,gesture.resonanceHz*.53),when+dur);
 const env=ctx.createGain();env.gain.setValueAtTime(.00001,when);env.gain.linearRampToValueAtTime(gesture.responseGain*.42,when+.052);
 env.gain.exponentialRampToValueAtTime(.0001,when+dur);
 carrier.connect(lp);lp.connect(env);env.connect(target);
 mod.start(when);carrier.start(when);carrier.stop(when+dur+.02);mod.stop(when+dur+.02);
}
function ambient(ctx,when,root,target,seconds,level){
 const f=hz(root)*.5;
 const o1=ctx.createOscillator(),o2=ctx.createOscillator(),lp=ctx.createBiquadFilter(),gain=ctx.createGain();
 o1.type='sine';o2.type='triangle';o1.frequency.value=f;o2.frequency.value=f*1.501;
 lp.type='lowpass';lp.frequency.value=450;
 gain.gain.setValueAtTime(.00001,when);gain.gain.linearRampToValueAtTime(level,when+.7);
 gain.gain.setValueAtTime(level*.75,when+Math.max(.8,seconds-1.1));gain.gain.exponentialRampToValueAtTime(.0001,when+seconds);
 o1.connect(lp);o2.connect(lp);lp.connect(gain);gain.connect(target);
 o1.start(when);o2.start(when);o1.stop(when+seconds+.03);o2.stop(when+seconds+.03);
}
function schedule(ctx,project,bank,parts,startTime,fromBar=0){
 const beatSec=60/project.bpm,fromBeat=fromBar*4;let last=null;
 for(let i=0;i<project.events.length;i++){
  const ev=project.events[i];if(ev.beat<fromBeat-.001){last=ev;continue}
  const t=startTime+(ev.beat-fromBeat)*beatSec;
  const key=ev.note+'_'+ev.layer;
  const buffer=bank.buffers[key]||bank.buffers[ev.note+'_f'];if(!buffer)throw Error('Sin nota '+key);
  const g=articulation(ev,last,bank.features[key]||{});
  const length=ev.duration*beatSec+.13;
  const sec=ev.phrase;const dynamic=ev.velocity*(sec===2?.88:1);
  sample(ctx,buffer,t,length,dynamic*.59,((ev.bar%4)-1.5)*.12,parts.a);
  if(sec>0&&sec<4){
   const density=sec===2?.45:1;
   const echoCount=(ev.layer==='p'||i%4===0)?3:2;
   for(let k=0;k<echoCount;k++){
    sample(ctx,buffer,t+g.echoSeconds*(k+1),Math.min(length*.81,1.25),dynamic*g.echoGain*Math.pow(.53,k+1)*density,(k%2?-.36:.36),parts.x,Math.max(400,g.resonanceHz*(.84-.13*k)));
   }
   if(i%3===1||ev.layer==='p')voice(ctx,t+.16+g.attackMs/1000,ev.note,g,parts.e,ev.note.endsWith('4')?.5:1);
  }
  if(sec===4&&i%7===0){sample(ctx,buffer,t+.39,Math.min(length,1.4),.11*dynamic,-.2,parts.x,1240)}
  last=ev;
 }
 const roots=['A2','F3','C3','G2'];
 for(let b=Math.max(8,fromBar);b<40;b+=2){
  if(b>=20&&b<28&&b%4!==0)continue;
  const s=b<20?1:b<28?2:3;
  const gain=s===2?.026:.041;
  ambient(ctx,startTime+(b*4-fromBeat)*beatSec,roots[(b+Math.floor(b/16))%4],parts.e,Math.min(4.8,8*beatSec),gain);
 }
}
export class AudioWork{
 constructor(status=()=>{}){this.status=status;this.ctx=null;this.parts=null;this.startAt=0;this.fromBar=0;this.dry=false;this.project=null;this.started=false;}
 async load(){
  if(!AudioCtor)throw Error('Este navegador no admite WebAudio.');
  if(!this.ctx||this.ctx.state==='closed')this.ctx=new AudioCtor();
  await this.ctx.resume();
  this.project=await readProject();
  this.bank=await getSources(this.ctx,(n,total)=>this.status('Cargando tomas reales '+n+'/'+total));
  return this.project;
 }
 async start(bar=0){
  this.stop();this.ctx=new AudioCtor();
  await this.load();
  this.fromBar=bar;this.startAt=this.ctx.currentTime+.12;this.parts=buses(this.ctx,this.project,'master');
  schedule(this.ctx,this.project,this.bank,this.parts,this.startAt,bar);
  this.started=true;
  if(this.dry)this.setDry(true);
  this.status('Reproduciendo: '+this.project.sections.find(s=>bar>=s.start&&bar<s.end)?.name);
 }
 setDry(on){
  this.dry=Boolean(on);
  if(this.parts&&this.ctx&&this.ctx.state!=='closed'){
   const t=this.ctx.currentTime;
   this.parts.e.gain.setTargetAtTime(this.dry?0:this.project.mixer.electronic,t,.065);
   this.parts.x.gain.setTargetAtTime(this.dry?0:this.project.mixer.echo,t,.065);
  }
 }
 position(){
  if(!this.started||!this.ctx||this.ctx.state==='closed')return this.fromBar*4*60/88;
  return Math.max(0,this.fromBar*4*60/this.project.bpm+this.ctx.currentTime-this.startAt);
 }
 stop(){if(this.ctx&&this.ctx.state!=='closed')this.ctx.close().catch(()=>{});this.ctx=null;this.started=false;this.parts=null;}
 async exportWav(kind='master'){
  if(!OfflineCtor)throw Error('OfflineAudioContext no está disponible en este navegador.');
  if(!this.bank){await this.load()}
  const p=this.project,rate=32000;
  const offline=new OfflineCtor(2,Math.ceil(p.durationSeconds*rate),rate);
  const parts=buses(offline,p,kind);
  schedule(offline,p,this.bank,parts,.12,0);
  this.status('Renderizando '+kind+' · PCM estéreo');
  const audio=await offline.startRendering();
  const result=encodeWav(audio);
  this.status(kind+' listo · '+result.duration.toFixed(1)+'s · pico '+result.peak.toFixed(3)+' · RMS '+result.rms.toFixed(4));
  return result;
 }
}
function encodeWav(buffer){
 const rate=buffer.sampleRate,length=buffer.length,ch=2,arr=new ArrayBuffer(44+length*ch*2),view=new DataView(arr);
 const put=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i))};
 put(0,'RIFF');view.setUint32(4,36+length*ch*2,true);put(8,'WAVE');put(12,'fmt ');view.setUint32(16,16,true);
 view.setUint16(20,1,true);view.setUint16(22,ch,true);view.setUint32(24,rate,true);view.setUint32(28,rate*ch*2,true);view.setUint16(32,ch*2,true);view.setUint16(34,16,true);put(36,'data');view.setUint32(40,length*ch*2,true);
 const data0=buffer.getChannelData(0),data1=buffer.numberOfChannels>1?buffer.getChannelData(1):data0;
 let peak=0,sum=0,pos=44;
 for(let i=0;i<length;i++)for(const v of [data0[i],data1[i]]){
  peak=Math.max(peak,Math.abs(v));sum+=v*v;const x=clamp(v,-1,1);
  view.setInt16(pos,x<0?Math.round(x*32768):Math.round(x*32767),true);pos+=2;
 }
 return {blob:new Blob([arr],{type:'audio/wav'}),peak,rms:Math.sqrt(sum/(length*2)),duration:length/rate,clipping:peak>1,rate,bytes:arr.byteLength};
}
export function saveFile(blob,name){const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000)}
