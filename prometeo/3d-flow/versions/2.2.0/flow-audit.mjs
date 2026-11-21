// PROMETEO 3D v2.2.0 · structural auditor of the reusable flow.
// A PASS means the method is internally consistent, NOT that its art is beautiful.
export function auditOperationalFlow(flow,stageOperations,catalog,matrix,toolchain){
 const errors=[],warnings=[],ids=new Set(),byStage=new Map();
 if(flow?.version!=='2.2.0')errors.push('UNEXPECTED_VERSION');
 for(const n of flow?.nodes||[]){
  if(ids.has(n.id))errors.push('DUPLICATE_NODE_'+n.id);ids.add(n.id);
  const match=/^STAGE_OPERATIONS\.json#\/stages\/(\d+)$/.exec(n.procedureRef||'');
  if(!match||stageOperations.stages?.[+match[1]]?.id!==n.stage)errors.push('INVALID_STAGE_PROCEDURE_'+n.id);
  byStage.set(n.stage,(byStage.get(n.stage)||0)+1);
 }
 const adjacency=new Map([...ids].map(x=>[x,[]]));
 for(const e of flow?.edges||[]){
  if(!ids.has(e.from)||!ids.has(e.to)){errors.push('BROKEN_EDGE_'+e.from+'_'+e.to);continue}
  adjacency.get(e.from).push(e.to);
 }
 const seen=new Set(['I0']),q=['I0'];
 while(q.length)for(const t of adjacency.get(q.shift())||[])if(!seen.has(t)){seen.add(t);q.push(t)}
 for(const id of ids)if(!seen.has(id))errors.push('UNREACHABLE_NODE_'+id);
 const sinks=[...ids].filter(id=>adjacency.get(id)?.length===0).sort();
 if(JSON.stringify(sinks)!==JSON.stringify(['END0','END1']))errors.push('BAD_TERMINALS_'+sinks.join(','));
 const stageIds=(stageOperations?.stages||[]).map(s=>s.id);
 if(new Set(stageIds).size!==17||(stageOperations?.stages||[]).length!==17)errors.push('STAGE_OPERATIONS_COUNT');
 const expected=(flow?.stages||[]).map(s=>s.id);
 if(expected.join('|')!==stageIds.join('|'))errors.push('STAGE_ORDER_MISMATCH');
 for(const s of stageOperations?.stages||[]){
  if(!s.goal||!Array.isArray(s.steps)||s.steps.length<3)errors.push('SHALLOW_STAGE_'+s.id);
  if(!s.outputs?.length||!s.antiPatterns?.length)errors.push('STAGE_NO_CONTRACT_'+s.id);
 }
 if(flow?.version==='2.2.0'){
  if(flow.nodes?.length!==316||flow.edges?.length!==406)errors.push('CHARACTER_PATCH_SHAPE');
  const required=['AV_ROLE','AV_BODY','AV_FACE','AV_LOOKDEV','AV_ALL_MOTION','UX_AREA','TOUCH_CORE','QA_HUD','QA_TOUCH','QA_CAST','QA_LATENT','CHAR_AUDIT','CHAR_ALLOC','CHAR_REJECT','CHAR_SELECT','CHAR_PARTS','CHAR_LOOK','CHAR_ALTERNATE','CHAR_RETARGET','CHAR_QA','CHAR_CAUSE','CHAR_PROMOTE'];
  for(const id of required)if(!ids.has(id))errors.push('MISSING_CHAR_NODE_'+id);
  if(flow?.characterSystem?.visualLibraryApprovals!==0)errors.push('UNAPPROVED_CHAR_LIBRARY_PREPOPULATED');
  if(matrix?.entries?.find(x=>x.projectId==='cruce-urbano'&&x.component==='ACTOR')?.verdict!=='USER_POOR')errors.push('OLD_CROSSING_ACTOR_VISUAL_STILL_APPROVED');
 }
 const routes=(from,to)=>flow.edges.some(e=>e.from===from&&e.to===to);
 if(!routes('PP2','B0')||!routes('PP3','B0'))errors.push('CANARY_STILL_BLOCKS_FULL_SCENE');
 for(const id of ['D39','D40','D41','D42']){
  const n=flow.nodes.find(x=>x.id===id);
  if(n?.preflightGate?.blocking!==false)errors.push('ARTISTIC_VETO_'+id);
 }
 if(!routes('S0','FULLSET0')||!routes('WEB0','BOOT2')||!routes('BR1','COMPLETE0'))errors.push('MISSING_OPERATIONAL_LINKS');
 if(flow?.executionSpec?.fullSceneRequired!==true||flow?.executionSpec?.advisoryOnlyQA!==true)errors.push('MISSING_FULL_SCENE_POLICY');
 const aliases=new Map();for(const p of catalog?.proposals||[]){
  for(const a of [p.projectId,...p.aliases||[]]){
   const name=a.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\b3d\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
   if(aliases.has(name)&&aliases.get(name)!==p.projectId)errors.push('COLLIDING_ALIAS_'+name);
   aliases.set(name,p.projectId);
  }
  if(!p.mandatoryCoverage?.length)errors.push('EMPTY_SCOPE_'+p.projectId);
 }
 if((catalog?.proposals||[]).length!==10)warnings.push('EXPECTED_TEN_BENCHMARK_PROFILES');
 for(const entry of matrix?.entries||[]){
  if(!entry.component||!entry.verdict||!entry.projectId)errors.push('BAD_REFERENCE');
  if(entry.verdict.startsWith('USER_')&&!['USER_EXCELLENT','USER_GOOD','USER_PARTIAL','USER_POOR','USER_DISLIKES_OR_INCOMPLETE','USER_NOT_IDEAL','USER_ACCEPTABLE','USER_FAILURE','USER_MIXED'].includes(entry.verdict))warnings.push('UNKNOWN_USER_VERDICT_'+entry.verdict);
 }
 if(!toolchain?.tools?.some(t=>t.id==='threejs'))errors.push('NO_RUNTIME_SOURCE');
 if(!toolchain?.policy?.some(x=>/WebGL2|WebGL 2/i.test(x)))warnings.push('NO_WEBGL2_EXPLICIT_POLICY');
 return{ok:errors.length===0,errors,warnings,counts:{nodes:flow.nodes?.length,edges:flow.edges?.length,stages:stageIds.length,reachable:seen.size,projects:catalog?.proposals?.length,componentReferences:matrix?.entries?.length},artisticValidation:'NOT_RUN',userReview:'AFTER_DELIVERY'};
}
