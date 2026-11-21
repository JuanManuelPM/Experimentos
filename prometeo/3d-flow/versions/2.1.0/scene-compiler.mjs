// PROMETEO Studio 3D v2.1.0 · deterministic inputs for a one-shot AI producer.
// This module does NOT model assets or pretend an LLM's artistic choices can be scripted.
export const METHOD_VERSION='2.1.0';
export const SCENE_MODES=['CINEMATIC_GUIDED','FREE_LOOK','HYBRID','STATIC_INSPECTION'];
export function normalizeRequest(s){
 if(typeof s!=='string')return '';
 return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^\s*@work\s+/,'').replace(/\b3d\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
export function resolveScene(query,catalog){
 const raw=normalizeRequest(query),r=(catalog?.proposals||[]);
 if(!raw)return{status:'EMPTY',matches:[]};
 const candidates=r.filter(p=>[p.projectId,...p.aliases].some(x=>normalizeRequest(x)===raw));
 if(candidates.length===1)return{status:'MATCH',projectId:candidates[0].projectId,profile:candidates[0],source:'REGISTERED_3D_ALIAS'};
 if(candidates.length>1)return{status:'AMBIGUOUS',matches:candidates.map(x=>x.projectId)};
 return{status:'UNREGISTERED',input:query,matches:[],requiresFullHumanBrief:true};
}
function uniq(x){return [...new Set(x)]}
function inferGenericCoverage(text){
 const x=normalizeRequest(text),out=['identifiable-3d-subject','camera-and-spatial-context'];
 if(/\b(salon|sala|escenario|escena|ambiente|entorno|interior|cuarto|laboratorio|ciudad|calle|esquina|edificio|habitacion)\b/.test(x))out.push('complete-environment','foreground-mid-background');
 if(/\b(humano|persona|personaje|pasajero|peaton|entrevista|actor|animal)\b/.test(x))out.push('role-appropriate-actor');
 if(/\b(interactivo|interactuar|jugar|juego|control|pantalla|usar)\b/.test(x))out.push('interaction-with-real-state');
 if(/\b(camara|cine|cinematografico|animacion|secuencia|video|pelicula)\b/.test(x))out.push('motivated-camera-and-timeline');
 if(/\b(desarmar|despiece|mecanismo|mecanico|ensamblar|funciona)\b/.test(x))out.push('mechanical-parts-and-assembly');
 if(/\b(lluvia|niebla|submarino|luz|tormenta|atmosfera)\b/.test(x))out.push('depth-and-atmosphere');
 return uniq(out);
}
function navigationMode(text,defaultMode){
 const x=normalizeRequest(text);
 const free=/\b(explorar|girar|rotar|controlar la camara|orbitar|moverme|mirar alrededor)\b/.test(x);
 const guided=/\b(cinema|cinematografico|pelicula|secuencia|recorrido guiado)\b/.test(x);
 if(free&&guided)return'HYBRID';
 if(free)return'FREE_LOOK';
 if(guided)return'CINEMATIC_GUIDED';
 return SCENE_MODES.includes(defaultMode)?defaultMode:'HYBRID';
}
export function compileSceneContract({humanBrief,briefSha256,flowSha256,projectId,projectCatalog,benchmarkMode=false}){
 if(!humanBrief||typeof humanBrief!=='string'||!humanBrief.trim())throw Error('HUMAN_BRIEF_REQUIRED');
 if(typeof briefSha256!=='string'||!/^[a-f0-9]{64}$/.test(briefSha256))throw Error('BRIEF_SHA_REQUIRED');
 if(typeof flowSha256!=='string'||!/^[a-f0-9]{64}$/.test(flowSha256))throw Error('FLOW_SHA_REQUIRED');
 const registered=(projectCatalog?.proposals||[]).find(x=>x.projectId===projectId)||null;
 const coverage=uniq([...(registered?.mandatoryCoverage||[]),...inferGenericCoverage(humanBrief)]);
 const dimensions=uniq(registered?.qualityDimensions||['PROP','ENVIRONMENT','CAMERA']);
 if(/actor|personaje|pasajero|humano|entrevista|peaton/i.test(humanBrief)&&!dimensions.includes('ACTOR'))dimensions.push('ACTOR');
 const plan={
  schema:'prometeo.3d.compiled-scene-contract/v2',
  method:'prometeo-3d-production',methodVersion:METHOD_VERSION,flowSha256,
  projectId:projectId||'custom-3d',
  brief:{rawText:humanBrief,sha256:briefSha256,benchmarkMode,briefStatus:benchmarkMode?'REQUIRES_LOCK_CHECK':'USER_LITERAL'},
  intent:{form:registered?.form||'user-specified-3d',sceneMode:navigationMode(humanBrief,registered?.cameraPreference),scopePolicy:'FULL_FIRST_ATTEMPT'},
  requiredCoverage:coverage.map(element=>({element,status:'REQUIRED',role:'WORLD_OR_ENTITY',evidenceRef:null})),
  qualityTargets:dimensions.map(dimension=>({dimension,qualitySource:'COMPONENT_REFERENCE_MATRIX',mustSelectTechnique:true,notAutomaticArtApproval:true})),
  assetPolicy:{hero:'SELECT_ROLE_APPROPRIATE_REAL_MESH_OR_AUTHORED_SILHOUETTE',faces:'NO_COMPOSITE_SPHERE_HUMANS',mechanical:'PARAMETRIC_WHEN_FITTING',support:'PRIMITIVES_ALLOWED_WHEN_ART_DIRECTED',rights:'VERIFIED_PER_ASSET',sourceOnlyMeansNotAcquired:true},
  scopeRules:{mayEndAtFirstArticle:false,neverAbortForArtFail:true,fullAttemptMandatory:true,preflightAdvisoryOnly:true,showImperfectResult:true,noArtisticSelfReviewAfterProduction:true},
  runtimePolicy:{threeModernRequires:'WEBGL2',recovery:'ERROR_CLASSIFICATION_AND_HONEST_FALLBACK',defaultBoot:'STATIC_ES_MODULES'},
  outputs:['SCENE_SOURCE','SCENE_PREVIEW_CANDIDATE','SCENE_RELEASE','STAGE_TRACE','COMPONENT_REVIEW','ASSET_MANIFEST'],
  decisionsToMake:['actual_tools_available','assets_licensed_and_downloaded','camera_shotlist','lighting/material_plan','whole_environment','mobile_runtime'],
  claims:{real3dNotYetBuilt:true,artisticAcceptance:'NOT_RUN',physicalAndroidQA:'NOT_RUN'}
 };
 return plan;
}
export function auditFullScope(plan,delivered=[]){
 const done=new Map(delivered.filter(x=>x&&typeof x.element==='string').map(x=>[x.element,x]));
 const elements=(plan.requiredCoverage||[]).map(x=>{
   const d=done.get(x.element);
   return{element:x.element,status:d?.evidenceRef&&d?.exists?'EVIDENCED':d?.exists?'DECLARED_ONLY':'MISSING',evidenceRef:d?.evidenceRef||null};
 });
 const missing=elements.filter(x=>x.status==='MISSING').map(x=>x.element);
 const unproved=elements.filter(x=>x.status==='DECLARED_ONLY').map(x=>x.element);
 return{projectId:plan.projectId,scopeStatus:missing.length||unproved.length?'DELIVERED_WITH_GAPS':'COVERAGE_EVIDENCED',missing,unproved,elements,outputRule:'PUBLISH_CANDIDATE_AND_SHOW_GAPS; NEVER_CENSOR_OR_AUTO_CANCEL'};
}
export function selectPositiveReferences(needed,matrix){
 const selected=[],missing=[];
 for(const key of uniq(needed)){
   const matches=(matrix.entries||[]).filter(x=>x.component===key&&['USER_EXCELLENT','USER_GOOD'].includes(x.verdict));
   if(!matches.length){missing.push(key);continue}
   for(const row of matches)selected.push({component:key,referenceProject:row.projectId,source:row.source,transferInstruction:row.transferInstruction,notVisualProof:row.externalVisualValidation!=='VERIFIED'});
 }
 return{selected,missing,neverCopyWholeScene:true,doNotCopyUserDislikedComponents:true};
}
