import fs from 'node:fs';import path from 'node:path';import{STEMS,renderStem,mix,wav16,PROJECT,BAR,BARS,SR}from './score.mjs';
import{newTransport,request,advance,equalPower}from './transition-engine.mjs';
const dir=process.argv[2]||'dist';fs.mkdirSync(path.join(dir,'stems'),{recursive:true});fs.mkdirSync(path.join(dir,'masters'),{recursive:true});
const buffers={};for(const stem of STEMS){buffers[stem]=renderStem(stem);fs.writeFileSync(path.join(dir,'stems',stem+'.wav'),wav16(buffers[stem]));}
for(const state of STEMS.slice(1))fs.writeFileSync(path.join(dir,'masters',state+'.wav'),wav16(mix(buffers,state)));
const events=[{bar:2,state:'deriva'},{bar:4,state:'tormenta'},{bar:5,state:'calma'},{bar:8,state:'deriva'},{bar:8,state:'tormenta'},{bar:12,state:'calma'},{bar:18,state:'deriva'},{bar:27,state:'tormenta'},{bar:38,state:'calma'}];
const t=newTransport(BAR,0,'calma'),windows=[];for(let bar=0;bar<BARS;bar++){for(const e of events.filter(x=>x.bar===bar))request(t,e.state,bar*BAR+.2);advance(t,(bar+1)*BAR-.01,e=>windows.push(e));}
const lane=new Float32Array(buffers.horizon.length),base=buffers.horizon;for(let i=0;i<lane.length;i++){const time=i/SR;let from='calma',to='calma',p=1;for(const w of windows){if(time>=w.at){from=w.from;to=w.to;p=Math.min(1,(time-w.at)/BAR);}else break;}const [a,b]=equalPower(p);lane[i]=Math.tanh((base[i]*.74+buffers[from][i]*a*.79+buffers[to][i]*b*.79))*.84;}
fs.writeFileSync(path.join(dir,'masters','recorrido-interactivo.wav'),wav16(lane));fs.writeFileSync(path.join(dir,'PROJECT.json'),JSON.stringify({...PROJECT,events,transitions:windows},null,2));console.log(JSON.stringify({duration:lane.length/SR,stems:STEMS,transitions:windows},null,2));
