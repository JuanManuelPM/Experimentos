// Course data loading, independent from all UI renderers and the router.
export async function loadStudyContent(){
  const m=await fetch('./content/manifest.json',{cache:'no-store'}).then(getJSON);
  if(!Array.isArray(m.partials))throw Error('El índice de parciales no está disponible');
  const ids=[...new Set(m.partials.flatMap(p=>p.units))];
  const units=Object.fromEntries(await Promise.all(ids.map(async id=>{
    try{return [id,await fetch('./content/units/'+id+'.json',{cache:'no-store'}).then(getJSON)]}
    catch(error){console.warn('No se pudo leer',id,error);return [id,null]}
  })));
  const EXTRAS={},CHEATS={},NUM={},MULTI={},TF={};
  const PARTIALS=m.partials.map(p=>{
    const available=p.units.map(id=>units[id]).filter(u=>u&&u.status==='ready'&&u.theory?.length&&u.practice?.length);
    available.forEach(u=>{Object.assign(EXTRAS,u.extras||{});CHEATS[u.id]=u.cheats||[];Object.assign(NUM,u.numericOptions||{});Object.assign(MULTI,u.multiOptions||{});Object.assign(TF,u.trueFalse||{})});
    return {id:p.id,title:p.title,units:available,ready:available.length>0};
  });
  return {PARTIALS,EXTRAS,CHEATS,NUM,MULTI,TF,storageKey:m.legacyStorageKey};
}
async function getJSON(r){if(!r.ok)throw Error(r.url+': '+r.status);return r.json()}
