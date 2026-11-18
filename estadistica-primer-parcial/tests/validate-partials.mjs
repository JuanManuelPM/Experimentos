import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('content/manifest.json');
const errors=[],reports=[],types=new Set(['heading','paragraph','list','steps','comparison','definition','formula','note','decision','table']);
const all=new Map();
for(const p of manifest.partials){
  const id='P'+p.id;
  const doc=read('content/partials/'+id+'.json');
  const ids=new Set(),practice=[];
  if(doc.partial!==p.id)errors.push(id+': partial incorrecto');
  if(!Array.isArray(doc.theory)||!Array.isArray(doc.cheatBlocks)||!Array.isArray(doc.practiceRefs))errors.push(id+': faltan secciones');
  if(doc.theory.length>10)errors.push(id+': teoría no resumida');
  if(doc.practiceRefs.length<8||doc.practiceRefs.length>30)errors.push(id+': práctica no curada');
  const wordCount=JSON.stringify(doc.theory).split(/\s+/).length;
  if(wordCount>1000)errors.push(id+': teoría demasiado larga ('+wordCount+')');
  for(const c of doc.theory){if(!c.id||!c.title||!c.blocks?.length)errors.push(id+': concepto incompleto');for(const b of c.blocks||[])if(!types.has(b.type))errors.push(id+': bloque desconocido '+b.type)}
  for(const b of doc.cheatBlocks)if(!types.has(b.type))errors.push(id+': bloque de machete desconocido '+b.type);
  if(!doc.cheatBlocks.some(b=>b.type==='formula'))errors.push(id+': faltan fórmulas de referencia');
  for(const ref of doc.practiceRefs){
    if(!p.units.includes(ref.unit))errors.push(id+': unidad ajena '+ref.unit);
    if(ids.has(ref.id))errors.push(id+': pregunta duplicada '+ref.id);
    ids.add(ref.id);
    const u=read('content/units/'+ref.unit+'.json');
    const q=u.practice.find(x=>x.id===ref.id);
    if(!q)errors.push(id+': no existe '+ref.id);
    else{practice.push(q);if(!q.prompt?.trim()||!q.solution?.length||!q.source)errors.push(id+': ejercicio sin consigna, solución o fuente: '+ref.id)}
    if(all.has(ref.id))errors.push('Referencia repetida entre parciales: '+ref.id);
    all.set(ref.id,id);
  }
  reports.push({partial:id,concepts:doc.theory.length,practices:practice.length,cheatBlocks:doc.cheatBlocks.length,approxWords:wordCount});
}
console.log(JSON.stringify({ok:errors.length===0,reports,errors},null,2));
if(errors.length)process.exitCode=1;
