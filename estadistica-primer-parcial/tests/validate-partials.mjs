import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('content/manifest.json');
const errors=[],reports=[];
const blocks=new Set(['heading','paragraph','list','steps','comparison','definition','formula','worked','note','decision','table']);
const types=new Set(['choice','truefalse','numeric','multi','mark']);
const allIDs=new Set();

function numericOptions(answer,options,tol,label){
  if(!Array.isArray(options))return; // Legacy options may be inherited from unit JSON.
  const matches=options.filter(v=>typeof v==='number'&&Math.abs(v-answer)<=Math.max(tol||0,.005));
  if(matches.length!==1)errors.push(label+': la clave es ambigua o falta');
}
function inspectQuestion(q,ref){
  if(!q||!q.id||!q.title||!q.prompt?.trim()||!q.solution?.length||!q.source)errors.push(ref+': pregunta incompleta');
  if(!q||!types.has(q.type))errors.push(ref+': tipo no soportado');
  if(q?.type==='truefalse'&&q.claims?.length){
    if(q.claims.some(c=>typeof c.answer!=='boolean'||!c.text?.trim()))errors.push(ref+': V/F inválidos');
  }
  if(q?.type==='choice'&&!(Number.isInteger(q.answer)&&q.options?.[q.answer]!==undefined)&&!q.claims)errors.push(ref+': opción correcta inexistente');
  if(q?.type==='numeric')numericOptions(q.answer,q.options,q.tolerance,ref);
  if(q?.type==='multi'){
    if(!q.fields?.length)errors.push(ref+': sin campos');
    for(const [i,f] of (q.fields||[]).entries())numericOptions(f.answer,f.options,f.tolerance,ref+'/'+i);
  }
}
for(const p of manifest.partials){
  const id='P'+p.id;
  const doc=read('content/partials/'+id+'.json');
  if(doc.partial!==p.id)errors.push(id+': parcial incorrecto');
  if(!Array.isArray(doc.theory)||!Array.isArray(doc.cheatBlocks)||!Array.isArray(doc.practiceRefs)||!Array.isArray(doc.extraPractice)||!Array.isArray(doc.practiceGroups))errors.push(id+': faltan arrays del contrato');
  const size=doc.theory.length;
  if(size<4||size>10)errors.push(id+': teoría insuficiente o no resumida');
  if(JSON.stringify(doc.theory).split(/\s+/).length>3600)errors.push(id+': teoría demasiado extensa');
  const headingIds=new Set();
  for(const c of doc.theory||[]){
    if(!c.id||!c.title||!c.blocks?.length||headingIds.has(c.id))errors.push(id+': concepto ausente o repetido');
    headingIds.add(c.id);
    for(const b of c.blocks||[])if(!blocks.has(b.type))errors.push(id+': bloque inválido '+b.type);
  }
  const cheatHeaders=new Set((doc.cheatBlocks||[]).filter(b=>b.type==='heading').map(b=>b.text));
  for(const b of doc.cheatBlocks||[])if(!blocks.has(b.type))errors.push(id+': machete inválido '+b.type);
  for(const section of Object.values(doc.cheatByUnit||{}))if(!cheatHeaders.has(section))errors.push(id+': machete sin apartado '+section);
  const bank=new Map();
  for(const ref of doc.practiceRefs||[]){
    if(!p.units.includes(ref.unit))errors.push(id+': unidad ajena '+ref.unit);
    const u=read('content/units/'+ref.unit+'.json');
    const q=u.practice.find(x=>x.id===ref.id);
    if(!q)errors.push(id+': no existe '+ref.id);
    else bank.set(q.id,q);
  }
  for(const q of doc.extraPractice||[]){
    if(!p.units.includes(q.unit))errors.push(id+': caso nuevo sin unidad válida '+q.id);
    if(bank.has(q.id))errors.push(id+': caso duplicado '+q.id);
    bank.set(q.id,q);
    inspectQuestion(q,id+'/'+q.id);
  }
  const groupedIds=(doc.practiceGroups||[]).flatMap(g=>{
    if(!headingIds.has(g.theoryId))errors.push(id+': sección de teoría inexistente '+g.theoryId);
    if(!Array.isArray(g.ids)||!g.ids.length)errors.push(id+': sin práctica junto a '+g.theoryId);
    return g.ids||[];
  });
  if((doc.practiceGroups||[]).length!==size)errors.push(id+': no hay un grupo por cada tema');
  if(groupedIds.length<8||groupedIds.length>25)errors.push(id+': práctica demasiado corta o interminable');
  if(groupedIds.length!==bank.size||new Set(groupedIds).size!==bank.size)errors.push(id+': grupos duplicados o ejercicios sin tema');
  for(const qid of groupedIds){
    if(!bank.has(qid))errors.push(id+': ejercicio enlazado inexistente '+qid);
    if(allIDs.has(qid))errors.push('Ejercicio repetido entre parciales: '+qid);
    allIDs.add(qid);
  }
  reports.push({partial:id,theory:doc.theory.length,practice:groupedIds.length,sourceQuestions:doc.practiceRefs.length,newCases:doc.extraPractice.length,groups:doc.practiceGroups.map(g=>g.ids.length)});
}
console.log(JSON.stringify({ok:errors.length===0,reports,errors},null,2));
if(errors.length)process.exitCode=1;
