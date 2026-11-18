import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('content/manifest.json');
const ids=manifest.partials.flatMap(p=>p.units);const target=process.argv[2];
if(target&&!ids.includes(target))throw Error('Unidad no registrada: '+target);
const blocks=new Set(['heading','paragraph','definition','list','steps','comparison','formula','decision','table','note']);
const errors=[];const report=[];const allIDs=new Set();
for(const moduleId of ids){const u=read('content/units/'+moduleId+'.json');if(u.schema!=='psicologia-up.statistics.unit.v3'||u.moduleId!==moduleId)errors.push(moduleId+': schema/ID');
if(!['ready','draft'].includes(u.status))errors.push(moduleId+': status');
if(!Array.isArray(u.theory)||!Array.isArray(u.practice)||!Array.isArray(u.cheats)||!Array.isArray(u.cheatBlocks))errors.push(moduleId+': arrays');
if(u.status==='ready'&&(!u.theory.length||!u.practice.length))errors.push(moduleId+': ready incompleto');
if(target&&target!==moduleId)continue;
const checkBlocks=(arr,where)=>{for(const b of arr||[]){if(!blocks.has(b.type))errors.push(where+': bloque desconocido');if(b.type==='formula'&&!b.expression)errors.push(where+': fórmula vacía');}};
checkBlocks(u.cheatBlocks,moduleId);
for(const c of u.theory){if(!c.id||!c.title)errors.push(moduleId+': teoría incompleta');checkBlocks(c.blocks,moduleId+'/'+c.id)}
for(const q of u.practice){
 if(!q.id||allIDs.has(q.id))errors.push(moduleId+': ID duplicado o vacío '+q.id);allIDs.add(q.id);
 if(!['choice','truefalse','numeric','multi','mark'].includes(q.type))errors.push(q.id+': tipo');
 if(!q.source||!q.hints?.length||!q.solution?.length)errors.push(q.id+': fuente/pistas/resolución');
 if(q.type==='choice'&&!u.trueFalse?.[q.id]&&(!Array.isArray(q.options)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length))errors.push(q.id+': índice incorrecto');
 if(q.type==='truefalse'&&!(q.claims?.length||u.trueFalse?.[q.id]?.length))errors.push(q.id+': V/F incompleto');
 if(q.type==='mark'&&!q.parts?.some(p=>typeof p==='object'&&String(p.value)===String(q.answer)))errors.push(q.id+': valor no marcable');
 const numeric=(key,ans,options,tol)=>{if(!Array.isArray(options)||options.filter(v=>typeof v==='number'&&Math.abs(v-ans)<=Math.max(tol||0,.005)).length!==1)errors.push(key+': opciones ambiguas o sin respuesta')};
 if(q.type==='numeric')numeric(q.id,q.answer,q.options||u.numericOptions?.[q.id],q.tolerance);
 if(q.type==='multi')for(const [i,f] of (q.fields||[]).entries())numeric(q.id+'/'+i,f.answer,f.options||u.multiOptions?.[q.id]?.[i],f.tolerance);
}
report.push({unit:moduleId,status:u.status,concepts:u.theory.length,exercises:u.practice.length})}
console.log(JSON.stringify({ok:errors.length===0,report,errors},null,2));if(errors.length)process.exitCode=1;
