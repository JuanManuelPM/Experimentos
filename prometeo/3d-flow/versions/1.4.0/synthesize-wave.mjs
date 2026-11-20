// Analyze separately collected stage-trace / user feedback after a production wave.
// No automatic edits to current production; flow changes happen as a new version.
export function synthesizeWave(issues,stageToSubflow={}){
 if(!Array.isArray(issues))throw Error('ISSUES_ARRAY_REQUIRED');
 const by=new Map();
 for(const i of issues){
   if(!i?.projectId||!i?.pattern||!Array.isArray(i?.stages))continue;
   for(const stage of i.stages){
     const key=stage+'::'+i.pattern;
     if(!by.has(key))by.set(key,{stage,subflow:stageToSubflow[stage]||null,pattern:i.pattern,projects:new Set(),observations:[],evidenceLevels:new Set()});
     const row=by.get(key);row.projects.add(i.projectId);
     row.observations.push({projectId:i.projectId,version:i.version,userObservation:i.userObservation||null});
     row.evidenceLevels.add(i.evidence||'UNKNOWN');
   }
 }
 const proposals=[...by.values()].map(v=>({stage:v.stage,subflow:v.subflow,pattern:v.pattern,projectCount:v.projects.size,projectIds:[...v.projects].sort(),status:v.projects.size>=2?'CROSS_PROJECT_REVIEW':'SINGLE_CASE_HYPOTHESIS',evidenceLevels:[...v.evidenceLevels],observations:v.observations}));
 proposals.sort((a,b)=>b.projectCount-a.projectCount||a.stage.localeCompare(b.stage)||a.pattern.localeCompare(b.pattern));
 return{schema:'prometeo.3d.wave-synthesis/v1',proposals,doesNotEditFlow:true,requiresHumanFeedback:true,needsNewVersionForFixes:true};
}
