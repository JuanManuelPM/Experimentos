// PROMETEO ART-DIRECTION / FIRST-ARTICLE v1
// Structural and evidence-state validator: an URL alone NEVER proves rendered quality.
export const inspectArtDirection = (d)=>{
 const errors=[],note=s=>errors.push(s),filled=s=>typeof s==="string"&&s.trim().length>=8,arr=x=>Array.isArray(x)?x:[],source=e=>e&&filled(e.url)&&/^https:\/\//.test(e.url)&&filled(e.description);
 if(d?.schema!=="prometeo.art-direction.first-article/v1")note("SCHEMA");
 if(!["3d","web","music","video","images"].includes(d?.medium))note("MEDIUM");
 if(!filled(d?.taskId)||!filled(d?.briefSha))note("BRIEF_LOCK");
 if(!filled(d?.flowRef))note("FLOW_REF");
 if(!filled(d?.promise?.subject)||!filled(d?.promise?.intent))note("PERCEPTUAL_PROMISE");
 if(!source(d?.benchmark)||d.benchmark.status!=="OBSERVED")note("BENCHMARK_NOT_OBSERVED");
 const t=arr(d?.techniques);
 if(t.length<2||new Set(t.map(x=>String(x.family||"").trim().toLowerCase())).size<2||t.some(x=>!filled(x.family)||!filled(x.viability)||!filled(x.license)))note("DISTINCT_TECHNIQUES_NOT_VERIFIED");
 if(!t.some(x=>x.family===d?.selectedTechnique))note("TECHNIQUE_NOT_SELECTED");
 const ff=d?.firstFrame;
 if(!filled(ff?.openingDescription)||!filled(ff?.focalSubject)||!filled(ff?.minimalUI)||arr(ff?.checks).length<2)note("FIRST_FRAME_PLAN_MISSING");
 else for(const c of ff.checks)if(!filled(c.criterion)||!filled(c.oracle)||!["390","1440","both","n/a"].includes(c.viewport))note("FIRST_FRAME_TEST_UNCLEAR");
 const fa=d?.firstArticle;
 if(!filled(fa?.target)||!filled(fa?.rejectWhen)||!filled(fa?.switchTo))note("FIRST_ARTICLE_PLAN_MISSING");
 if(!t.some(x=>x.family===fa?.switchTo)||fa?.switchTo===d?.selectedTechnique)note("NO_GENUINELY_DIFFERENT_FALLBACK");
 if(!filled(fa?.oracle)||!filled(fa?.resourceProof))note("FIRST_ARTICLE_ORACLE_OR_RESOURCE_MISSING");
 if(d?.humanApproved===true)note("HUMAN_APPROVAL_MUST_NOT_BE_ASSUMED");
 if(errors.length)return{gate:"INVALID",errors};
 if(fa.status==="NOT_RUN"||fa.status==null)return{gate:"FIRST_ARTICLE_REQUIRED",errors:[]};
 if(fa.status==="FAILED")return{gate:"SWITCH_REPRESENTATION",errors:[],nextTechnique:fa.switchTo};
 if(fa.status==="BLOCKED")return{gate:"BLOCKED",errors:[]};
 if(fa.status!=="OBSERVED_PASS"||!source(fa.evidence))return{gate:"INVALID",errors:["FIRST_ARTICLE_PROOF_MISSING"]};
 if(!arr(ff.observations).some(x=>x.viewport==="390"&&source(x.evidence))||!arr(ff.observations).some(x=>x.viewport==="1440"&&source(x.evidence)))
  return{gate:"FIRST_FRAME_CAPTURE_REQUIRED",errors:[]};
 if(ff.observations.some(x=>x.status!=="OBSERVED_PASS"))return{gate:"FIRST_FRAME_FIX_REQUIRED",errors:[]};
 return{gate:"READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED",errors:[]};
};
