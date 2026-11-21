// PROMETEO 2.2.1 · comparison integrity; not an artistic judge.
export function auditQualityDelta(report,expectedComponents=[]){
 const issues=[],statusSet=new Set(['MEJORADO_OBSERVABLE','REGRESION','SIN_CAMBIO','NO_COMPARABLE','NOT_RUN','N/A']);
 const revision=report?.isRevision===true;
 if(!report||!Array.isArray(report.components))return{status:'NOT_RUN',issues:['REPORT_MISSING'],artApproved:false,continueFullScene:true};
 if(revision&&!/^[a-f0-9]{40}$/.test(report.baselineCommit||''))issues.push('BASELINE_COMMIT_MISSING');
 const by=new Map();
 for(const c of report.components){
  if(!c.component||by.has(c.component)){issues.push('COMPONENT_ID_INVALID_OR_DUPLICATE');continue}by.set(c.component,c);
  if(!statusSet.has(c.status))issues.push('BAD_STATUS:'+c.component);
  if(c.status==='N/A'&&!c.reason)issues.push('NA_WITHOUT_REASON:'+c.component);
  if(c.status==='MEJORADO_OBSERVABLE'){
   if(!c.changeRef||!c.afterEvidence||!c.beforeEvidence||!c.comparisonConditions)issues.push('COMPARATIVE_PROOF_MISSING:'+c.component);
   if(!['GPU_RENDER','OFFLINE_RENDER','RUNTIME_OBSERVATION','PHYSICAL_DEVICE'].includes(c.evidenceKind))issues.push('SOURCE_ONLY_IS_NOT_OBSERVED_IMPROVEMENT:'+c.component);
   if(c.beforeEvidence===c.afterEvidence)issues.push('SAME_EVIDENCE:'+c.component);
  }
  if(['NOT_RUN','NO_COMPARABLE'].includes(c.status)&&!c.reason)issues.push('MISSING_LIMIT:'+c.component);
 }
 for(const id of expectedComponents)if(!by.has(id))issues.push('COMPONENT_NOT_COVERED:'+id);
 if(report.finishPass?.status==='EXECUTED'&&(!report.finishPass.changeRefs?.length||!report.finishPass.recheckRefs?.length))issues.push('FINISH_PASS_UNPROVEN');
 if(!['EXECUTED','NOT_RUN'].includes(report.finishPass?.status))issues.push('FINISH_PASS_MISSING');
 if(report.finishPass?.status==='NOT_RUN'&&!report.finishPass.reason)issues.push('FINISH_LIMIT_MISSING');
 return{status:issues.length?'INCOMPLETE':'DOCUMENTED_CANDIDATE',issues,artApproved:false,continueFullScene:true,regressions:[...by.values()].filter(c=>c.status==='REGRESION').map(c=>c.component)};
}
