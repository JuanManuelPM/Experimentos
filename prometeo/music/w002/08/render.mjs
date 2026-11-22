import {mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {renderStem,combine,wav16,metrics,SR,PROJECT,STATES} from './score.mjs';
import {transitionSequence,weights} from './transition-engine.mjs';
const out=process.argv[2]||'./dist';
mkdirSync(out,{recursive:true});mkdirSync(path.join(out,'stems'),{recursive:true});mkdirSync(path.join(out,'masters'),{recursive:true});
let stems={};for(const k of PROJECT.stems){stems[k]=renderStem(k);writeFileSync(path.join(out,'stems',k+'.wav'),Buffer.from(wav16(stems[k])))}
let masters={};for(const state of STATES){masters[state]=combine(stems,state);writeFileSync(path.join(out,'masters',state+'.wav'),Buffer.from(wav16(masters[state])))}
const events=[{at:.4,state:'deriva'},{at:1.1,state:'tormenta'},{at:2.7,state:'deriva'},{at:3.2,state:'calma'},{at:4.2,state:'tormenta'},{at:6.1,state:'deriva'},{at:8.9,state:'calma'},{at:11.4,state:'tormenta'},{at:13.1,state:'calma'},{at:17.2,state:'deriva'},{at:20.4,state:'tormenta'},{at:32.5,state:'calma'}];
const transitions=transitionSequence(events),dynamic=new Float32Array(stems.bed.length);
for(let i=0;i<dynamic.length;i++){
 const time=i/SR;let mix={calma:0,deriva:0,tormenta:0};mix.calma=1;
 for(const tr of transitions){if(time<tr.at)break;mix={calma:0,deriva:0,tormenta:0};const [a,b]=weights(tr,time);mix[tr.from]=a;mix[tr.to]=b;}
 dynamic[i]=3*(.73*stems.bed[i]+.82*STATES.reduce((sum,s)=>sum+(mix[s]||0)*stems[s][i],0));
}
writeFileSync(path.join(out,'masters','recorrido-interactivo.wav'),Buffer.from(wav16(dynamic)));
const m={...PROJECT,source:'score.mjs',policy:'last desired state wins at next bar; one-bar phase-aligned transition',audio:{stems:Object.fromEntries(Object.entries(stems).map(([k,v])=>[k,metrics(v)])),masters:Object.fromEntries(Object.entries(masters).map(([k,v])=>[k,metrics(v)])),replay:metrics(dynamic)},events,transitions,qa:{transitions:transitions.length,nonClipping:[...Object.values(masters),dynamic].every(a=>a.every(x=>Math.abs(x)<1)),browserPlayback:'NOT_RUN',humanListening:'NOT_RUN'}};
writeFileSync(path.join(out,'MANIFEST.json'),JSON.stringify(m,null,2));console.log('rendered '+PROJECT.seconds+' s, '+transitions.length+' transitions');
