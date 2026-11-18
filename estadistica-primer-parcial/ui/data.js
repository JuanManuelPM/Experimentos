// Course data loading, independent from all UI renderers and the router.
export async function loadStudyContent(){
  const m=await fetch('./content/manifest.json',{cache:'no-store'}).then(getJSON);
  if(!Array.isArray(m.partials))throw Error('El índice de parciales no está disponible');
  const ids=[...new Set(m.partials.flatMap(p=>p.units))];
  const units=Object.fromEntries(await Promise.all(ids.map(async id=>{
    try{return [id,await fetch('./content/units/'+id+'.json',{cache:'no-store'}).then(getJSON)]}
    catch(error){console.warn('No se pudo leer',id,error);return [id,null]}
  })));
  const summaries=Object.fromEntries(await Promise.all(m.partials.map(async p=>{
    const id='P'+p.id;
    try{
      const document=await fetch('./content/partials/'+id+'.json',{cache:'no-store'}).then(getJSON);
      if(document.partial!==p.id||!Array.isArray(document.practiceRefs)||!Array.isArray(document.theory)||!Array.isArray(document.cheatBlocks))throw Error('Estructura de resumen inválida: '+id);
      return [id,document];
    }catch(error){
      console.error('No se pudo leer el resumen '+id,error);
      return [id,null];
    }
  })));
  const archives=Object.fromEntries(await Promise.all(m.partials.map(async p=>{
    const id='P'+p.id;
    try{
      const doc=await fetch('./content/partials/exams/'+id+'.json',{cache:'no-store'}).then(getJSON);
      if(doc.partial!==p.id||!Array.isArray(doc.cases))throw Error('Archivo de exámenes inválido');
      return [id,doc];
    }catch(error){console.warn('No se cargaron los parciales anteriores '+id,error);return [id,{cases:[],notice:''}]}
  })));
  const EXTRAS={},CHEATS={},NUM={},MULTI={},TF={};
  const PARTIALS=m.partials.map(p=>{
    const available=p.units.map(id=>units[id]).filter(u=>u&&u.status==='ready'&&u.theory?.length&&u.practice?.length);
    const summaryDoc=summaries['P'+p.id]||{partial:p.id,title:p.title,theory:[],cheatBlocks:[],practiceRefs:[]},included=[];
    for(const ref of summaryDoc.practiceRefs){
      const unit=available.find(u=>u.moduleId===ref.unit||u.id===ref.unit||('M'+String(u.id).replace(/^0/,''))===ref.unit);
      const q=unit?.practice.find(q=>q.id===ref.id);
      if(!q){console.warn('Referencia pendiente del resumen:',p.id,ref.unit,ref.id);continue}
      included.push(q);
    }
    available.forEach(u=>{Object.assign(EXTRAS,u.extras||{});CHEATS[u.id]=u.cheats||[];Object.assign(NUM,u.numericOptions||{});Object.assign(MULTI,u.multiOptions||{});Object.assign(TF,u.trueFalse||{})});
    const fullBank=new Map([...included,...(Array.isArray(summaryDoc.extraPractice)?summaryDoc.extraPractice:[])].map(q=>[q.id,q]));
    const shortPractice=Array.isArray(summaryDoc.practiceGroups)&&summaryDoc.practiceGroups.length
      ?summaryDoc.practiceGroups.flatMap(g=>(g.ids||[]).map(id=>{
        const q=fullBank.get(id);if(!q)console.warn('Ejercicio sin referencia:',p.id,g.theoryId,id);return q;
      }).filter(Boolean))
      :[...fullBank.values()];
    return {id:p.id,title:p.title,units:available,summary:{...summaryDoc,practice:shortPractice,examCases:archives['P'+p.id].cases,examNotice:archives['P'+p.id].notice},ready:available.length>0};
  });
  return {PARTIALS,EXTRAS,CHEATS,NUM,MULTI,TF,storageKey:m.legacyStorageKey};
}
async function getJSON(r){if(!r.ok)throw Error(r.url+': '+r.status);return r.json()}
