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
    const document=await fetch('./content/partials/'+id+'.json',{cache:'no-store'}).then(getJSON);
    if(document.partial!==p.id||!Array.isArray(document.practiceRefs)||!Array.isArray(document.theory)||!Array.isArray(document.cheatBlocks))throw Error('Resumen inválido: '+id);
    return [id,document];
  })));
  const EXTRAS={},CHEATS={},NUM={},MULTI={},TF={};
  const PARTIALS=m.partials.map(p=>{
    const available=p.units.map(id=>units[id]).filter(u=>u&&u.status==='ready'&&u.theory?.length&&u.practice?.length);
    const summaryDoc=summaries['P'+p.id],included=[];
    for(const ref of summaryDoc.practiceRefs){
      const unit=available.find(u=>u.moduleId===ref.unit||u.id===ref.unit||('M'+String(u.id).replace(/^0/,''))===ref.unit);
      const q=unit?.practice.find(q=>q.id===ref.id);
      if(!q)throw Error('Falta ejercicio del resumen: '+ref.unit+' / '+ref.id);
      included.push(q);
    }
    available.forEach(u=>{Object.assign(EXTRAS,u.extras||{});CHEATS[u.id]=u.cheats||[];Object.assign(NUM,u.numericOptions||{});Object.assign(MULTI,u.multiOptions||{});Object.assign(TF,u.trueFalse||{})});
    return {id:p.id,title:p.title,units:available,summary:{...summaryDoc,practice:included},ready:available.length>0};
  });
  return {PARTIALS,EXTRAS,CHEATS,NUM,MULTI,TF,storageKey:m.legacyStorageKey};
}
async function getJSON(r){if(!r.ok)throw Error(r.url+': '+r.status);return r.json()}
