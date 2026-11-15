/*
PROMETEO PSX · QUALITY PREFLIGHT v1
Pure JavaScript: works in Node and browser. Reads evidence; never generates or self-approves it.
License: MIT for this authored checker. No external libraries, no Blender required.
*/
export const PREFLIGHT_VERSION='1.0.0';
export const CATEGORIES=['character','vehicle','environment','weather','lighting','camera'];
export const PASSES=['pass','fail','unverified'];
const bool=x=>x===true;
const unique=a=>[...new Set(a)];
const present=x=>x!==null&&x!==undefined&&x!=='';
const record=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
function evidenceValid(e){
 if(!e||typeof e!=='object')return false;
 return ['observed_browser_frame','user_screenshot','geometry_probe','material_probe','license_file','source_reference','video_playback','test_report','human_approval'].includes(e.kind)
 &&typeof e.uri==='string' && (/^https:\/\/|^repo:|^artifact:/.test(e.uri))
 &&typeof e.producedAt==='string' && /^\d{4}-\d\d-\d\d/.test(e.producedAt)
 && typeof e.observer==='string'&&e.observer.length>0;
}
function evidenceHas(m,kinds,group){
 return (record(m.evidence)[group]||[]).some(e=>evidenceValid(e)&&kinds.includes(e.kind));
}
const GATES=[
 ['references','Preproducción visual','PREPRODUCTION',['source_reference']],
 ['rights','Derechos y procedencia','PREPRODUCTION',['license_file']],
 ['character','Topología, rostro, vestuario','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['vehicle','Auto y materiales','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['pose','Contacto y actuación','PREPRODUCTION',['geometry_probe','user_screenshot','observed_browser_frame']],
 ['environment','Calle y arquitectura','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['weather','Clima, lluvia y profundidad','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['lighting','Iluminación motivada','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['camera','Encuadre y continuidad','PREPRODUCTION',['observed_browser_frame','user_screenshot']],
 ['render','Render reproducible','RELEASE',['test_report','observed_browser_frame']],
 ['mobile','Android y rendimiento','RELEASE',['test_report']],
 ['human','Aprobación artística humana','APPROVAL',['human_approval']]
];
function hasComponent(m,name){
 const c=record(m.scope).components||[];
 if(name==='character'||name==='vehicle'||name==='environment'||name==='weather')return c.includes(name);
 if(name==='pose')return c.includes('character') && c.includes('vehicle') && bool(record(m.scope).characterVehicleInteraction);
 return true;
}
function validateGateFacts(m,id){
 const facts=record(m.facts);
 const d=record(facts[id]);
 const fail=(condition,msg)=>!condition?msg:null;
 switch(id){
 case 'references':{
  const a=Array.isArray(d.reviewed)?d.reviewed:[];
  const targets=['character','vehicle','environment','weather','lighting','camera'].filter(x=>hasComponent(m,x)||['lighting','camera'].includes(x));
  const covered=unique(a.filter(x=>x&&typeof x.url==='string'&&x.url.startsWith('https://')&&x.observed===true).map(x=>x.category));
  return {issues:[fail(covered.length>=Math.min(6,targets.length),'Faltan referencias visuales inspeccionadas y clasificadas'),...targets.filter(x=>!covered.includes(x)).map(x=>'Sin referencia verificada: '+x)].filter(Boolean)};
 }
 case 'rights':{
  const assets=Array.isArray(d.assets)?d.assets:[];
  return {issues:[fail(assets.length>0,'No hay recursos declarados'),...assets.filter(x=>!(x.licenseVerified===true&&x.sourceUrl?.startsWith('https://'))).map(x=>'Sin licencia verificada: '+(x?.id||'recurso'))].filter(Boolean)};
 }
 case 'character':return {issues:[fail(d.authoredMesh===true,'Cuerpo final no acreditado como malla diseñada'),fail(d.front===true,'Falta frontal real'),fail(d.quarter===true,'Falta 3/4 real'),fail(d.profile===true,'Falta perfil real'),fail(d.clothingDesigned===true,'Ropa sin diseño aprobado'),fail(d.rigOrIntentionalStatic===true,'Rig/pose no acreditados')].filter(Boolean)};
 case 'vehicle':return {issues:[fail(d.authoredMesh===true,'Modelo de auto no verificado'),fail(d.separateMaterials===true,'No se verificaron pintura/vidrio/goma/faros'),fail(d.forwardDot!==undefined&&d.forwardDot>=0.8,'Auto se desplaza hacia atrás o dirección desconocida'),fail(d.wheelGroundGapMeters!==undefined&&Math.abs(d.wheelGroundGapMeters)<=.05,'Ruedas sin contacto con piso medido'),fail(d.headlightsMotivated===true,'Faros sin emisión/proyección motivada')].filter(Boolean)};
 case 'pose':return {issues:[fail(d.seatedVerified===true,'Pose sentada no comprobada'),fail(d.maxPenetrationMeters!==undefined&&d.maxPenetrationMeters<=.025,'Cuerpo atraviesa asiento o penetración desconocida'),fail(d.leftHandWheelGapMeters!==undefined&&d.leftHandWheelGapMeters<=.12,'Mano izquierda no llega al volante'),fail(d.rightHandWheelGapMeters!==undefined&&d.rightHandWheelGapMeters<=.12,'Mano derecha no llega al volante'),fail(d.deterministic===true,'Pose dependiente de historia de fotogramas')].filter(Boolean)};
 case 'environment':return {issues:[fail(d.architectureDesigned===true,'Fachadas no justificadas ni diseñadas'),fail(d.roadBuiltAsKit===true,'Calzada/vereda/señales sin kit coherente'),fail(d.depthLayers>=3,'Insuficiente separación de primer/medio/fondo'),fail(d.materialVariation===true,'Materiales de calle sin variación')].filter(Boolean)};
 case 'weather':return {issues:[fail(d.renderTechnique!=='line_segments'&&present(d.renderTechnique),'Lluvia LineSegments o desconocida'),fail(d.depthLayers>=3,'Lluvia sin capas espaciales'),fail(d.lightResponse===true,'La lluvia no responde a las luces'),fail(d.occlusion===true,'Lluvia atraviesa geometría'),fail(d.temporalRepeatable===true,'Lluvia no reproducible por fotograma')].filter(Boolean)};
 case 'lighting':return {issues:[fail(d.keyMotivated===true,'Fuente principal sin justificación física'),fail(d.practicalsVisible===true,'Faroles/tablero no motivan luces'),fail(d.contactShadows===true,'Sin contacto visual entre auto/piso/personaje/asiento'),fail(d.nightReadable===true,'Luminancia nocturna insuficiente para leer protagonistas'),fail(d.threeFramesReviewed===true,'Faltan tres fotogramas de lookdev revisados')].filter(Boolean)};
 case 'camera':return {issues:[fail(d.shotCount>=3,'Insuficiente variedad de planos'),fail(d.allShotFramesCaptured===true,'No hay captura renderizada de TODOS los planos'),fail(d.subjectNotClipped===true,'Algún encuadre corta el sujeto'),fail(d.spatialContinuity===true,'Dirección visual de ejes no comprobada'),fail(d.negativeSpaceForCaptions===true,'Subtítulos/rotulaciones pisan elementos')].filter(Boolean)};
 case 'render':return {issues:[fail(d.webgl2RealFrames===true,'WebGL2 no reprodujo fotogramas reales'),fail(d.timelineStartEnd===true,'Inicio→fin no reproducido'),fail(d.glbRoundtrip===true,'GLB no reimportado/testeado')].filter(Boolean)};
 case 'mobile':return {issues:[fail(d.androidPhysical===true,'Sin ensayo real Android'),fail(d.minFps!==undefined&&d.minFps>=24,'FPS Android por debajo de 24 o no medidos'),fail(d.noCrashes===true,'Crash/stutter sin verificar')].filter(Boolean)};
 case 'human':return {issues:[fail(d.approved===true&&d.reviewerRole==='human'&&present(d.approvalRef),'Falta aprobación expresa de una persona')].filter(Boolean)};
 default:return {issues:['Puerta desconocida']};
 }
}
export function evaluatePreflight(source){
 const m=record(source),out=[];
 for(const [id,label,phase,kinds] of GATES){
  if(!hasComponent(m,id))continue;
  const check=validateGateFacts(m,id);
  const evidence=evidenceHas(m,kinds,id);
  const issues=check.issues||[];
  const status=(issues.length===0&&evidence)?'PASS':issues.length?'FAIL':'UNVERIFIED';
  out.push({id,label,phase,status,issues:evidence?issues:[...issues,'Sin evidencia primaria verificable de tipo '+kinds.join('/')],evidenceCount:(record(m.evidence)[id]||[]).filter(evidenceValid).length});
 }
 const blockers=out.filter(g=>g.phase==='PREPRODUCTION'&&g.status!=='PASS');
 const deliverables=out.filter(g=>g.phase==='RELEASE'&&g.status!=='PASS');
 const approved=out.find(g=>g.id==='human')?.status==='PASS';
 const counts={PASS:out.filter(x=>x.status==='PASS').length,FAIL:out.filter(x=>x.status==='FAIL').length,UNVERIFIED:out.filter(x=>x.status==='UNVERIFIED').length};
 return {schema:'prometeo.psx.preflight.receipt/v1',checker:PREFLIGHT_VERSION,projectId:String(m.projectId||'UNNAMED'),counts,gates:out,
 preproductionAllowed:blockers.length===0,
 releaseAllowed:blockers.length===0&&deliverables.length===0&&approved,
 approval:approved?'HUMAN_APPROVED':'PENDING_HUMAN',
 decision:blockers.length?'STOP_PREPRODUCTION':deliverables.length?'STOP_RELEASE':approved?'ELIGIBLE_FOR_RELEASE':'AWAIT_HUMAN_REVIEW',
 blockers:blockers.map(x=>({gate:x.id,issues:x.issues})),releaseBlockers:deliverables.map(x=>x.id),
 semantics:'A website/GLB/JS_PASS alone NEVER implies visual or artistic approval.'};
}
