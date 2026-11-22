#!/usr/bin/env node
// PROMETEO · VIDEO W002-01 · continuity-kit/1
// Evalúa metadatos y stream real por separado: un plan PASS no significa película verificada.
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const str=v=>typeof v==='string'&&v.trim().length>0;
const near=(a,b,eps=.01)=>Math.abs(a-b)<=eps;
export function auditTimeline(d){
 const errors=[],warn=[];
 if(!Array.isArray(d.shots)||d.shots.length<5)return {ok:false,errors:['Se necesitan >=5 planos'],warn};
 if(!Number.isInteger(d.fps)||d.fps<24)errors.push('FPS insuficientes');
 const ids=new Set();let end=0,prev=null;const coverage=new Set();
 for(const s of d.shots){
  if(ids.has(s.id))errors.push('ID duplicado: '+s.id);ids.add(s.id);
  if(!near(s.start,end))errors.push('Hueco/solape antes de '+s.id+' '+end+' ≠ '+s.start);
  if(!(s.end>s.start))errors.push('Duración no positiva: '+s.id);
  if(s.side!==d.spatial.cameraSide)errors.push('Eje invertido en '+s.id);
  if(s.target==='door-214'&&s.gaze!=='right')errors.push('Mirada inversa a 214: '+s.id);
  if(s.gaze==='right'&&s.target==='door-214'&&d.spatial.doorScreen!=='right')errors.push('Mirada no corresponde con posición de puerta');
  if(!str(s.performance)||!str(s.action))errors.push('No hay acción/actuación '+s.id);
  if(!s.states || typeof s.states!=='object')errors.push('No hay estado '+s.id);
  if(prev&&s.states){
   for(const [prop,to] of Object.entries(s.states)){
    const from=prev.states[prop];
    if(from!==undefined&&from!==to && !(s.transitions||[]).some(t=>t.prop===prop&&t.from===from&&t.to===to))
     errors.push('Salto sin transición de '+prop+': '+prev.id+'→'+s.id);
   }
  }
  coverage.add(s.kind);end=s.end;prev=s;
 }
 if(!near(d.plannedSeconds,end))errors.push('El total no coincide con fin de planos');
 for(const required of ['master','insert','reaction','pov','action'])if(!coverage.has(required))errors.push('Falta cobertura '+required);
 const audioIds=new Set();
 for(const a of d.audio||[]){
  if(audioIds.has(a.id))errors.push('Cue duplicado '+a.id);audioIds.add(a.id);
  if(a.start<0 || a.end<=a.start || a.end>end+.01)errors.push('Cue fuera de timeline '+a.id);
  if(a.anchorShotId && !d.shots.some(s=>s.id===a.anchorShotId&&a.start>=s.start&&a.start<=s.end))errors.push('Cue desincronizado '+a.id);
  if(!str(a.source))errors.push('Cue sin fuente '+a.id);
 }
 if(!(d.audio||[]).some(x=>x.type==='story-cue'))errors.push('Falta sonido narrativo');
 if(errors.length===0)warn.push('Aprobado solo a nivel de planificación; actuación, derechos y sync real requieren metraje y observación.');
 return {ok:errors.length===0,errors,warn,duration:end,shots:d.shots.length,audioCues:(d.audio||[]).length};
}
export function probeMedia(path,d){
 const call=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',path],{encoding:'utf8'});
 if(call.status!==0)return {status:'FAILED',errors:['ffprobe no abrió archivo: '+(call.stderr||'').slice(0,250)]};
 const p=JSON.parse(call.stdout);const v=(p.streams||[]).find(s=>s.codec_type==='video'),a=(p.streams||[]).find(s=>s.codec_type==='audio');
 const errors=[];
 if(!v)errors.push('No hay stream de video');
 if(!a)errors.push('No hay stream de audio');
 if(v && (v.width<1280||v.height<720))errors.push('Resolución debajo de 1280x720');
 if(v && Number(v.avg_frame_rate.split('/')[0])/Number(v.avg_frame_rate.split('/')[1]) < d.fps-.1)errors.push('Fotogramas insuficientes');
 if(Math.abs(Number(p.format?.duration)-d.plannedSeconds)>.5)errors.push('Duración no coincide con shotlist');
 if(v && !['h264','vp9','av1','hevc'].includes(v.codec_name))errors.push('Codec no admitido');
 return {status:errors.length?'FAILED':'TECHNICAL_PASS',errors,videoCodec:v?.codec_name??null,audioCodec:a?.codec_name??null,duration:Number(p.format?.duration),notice:'TECHNICAL_PASS no verifica raccord, actuación ni derechos de fuentes'};
}
const invoked=process.argv[1]&&process.argv[1].endsWith('continuity-kit.mjs');
if(invoked){
 const [file,flag,media]=process.argv.slice(2);
 if(!file){console.error('Uso: node continuity-kit.mjs SHOTLIST.json [--media salida.mp4]');process.exit(1)}
 const d=JSON.parse(readFileSync(file,'utf8'));const plan=auditTimeline(d);
 const observation=flag==='--media'&&media?probeMedia(media,d):{status:'NOT_RUN',reason:'No se proporcionó video exportado'};
 console.log(JSON.stringify({plan,observation},null,2));
 if(!plan.ok||observation.status==='FAILED')process.exitCode=1;
}
