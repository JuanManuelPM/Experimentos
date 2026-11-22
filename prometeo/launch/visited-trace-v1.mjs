// PROMETEO visited-flow trace validator v1: no retroactive alteration of flow 2.3.0.
// Structure/graph evidence only; artifact bytes need separate inspection.
export const validateVisitedTrace = function validateVisitedTrace(trace, flow){
 const errors=[],warnings=[],str=x=>typeof x==="string"&&x.trim().length>0,arr=x=>Array.isArray(x)?x:[];
 if(trace?.schema!=="prometeo.flow.visited-trace/v1")errors.push("SCHEMA");
 if(!str(trace?.taskId)||!str(trace?.flow?.version)||!str(trace?.flow?.sha256Canonical))errors.push("LOCK_MISSING");
 if(trace?.flow?.version!==flow?.version||trace?.flow?.sha256Canonical!==flow?.sha256Canonical)errors.push("FLOW_VERSION_OR_SHA_MISMATCH");
 if(trace?.humanApproved===true)errors.push("UNJUSTIFIED_HUMAN_APPROVAL");
 const stages=new Set(arr(flow?.stages).map(x=>x.id)),nodes=new Set(arr(flow?.nodes).map(x=>x.id)),edges=new Set(arr(flow?.edges).map(x=>x.from+"\x1f"+x.to));
 if(!Array.isArray(trace?.events)||trace.events.length===0)errors.push("NO_VISITED_EVENTS");
 let lastAt=0,previousNode=null;
 for(const [i,event] of arr(trace?.events).entries()){
  const k="EVENT_"+i+"_";
  if(!stages.has(event?.stage))errors.push(k+"UNKNOWN_STAGE");
  if(!["EXECUTED","SKIPPED","NOT_RUN"].includes(event?.status))errors.push(k+"STATUS");
  const at=Date.parse(event?.timestamp||"");if(!Number.isFinite(at)||at<lastAt)errors.push(k+"TIME_ORDER");else lastAt=at;
  if(event?.status==="EXECUTED"){
   if(!str(event?.decision)||!str(event?.outputRef)||!arr(event?.alternativesConsidered).length)errors.push(k+"DECISION_OUTPUT_ALTERNATIVE");
   if(!arr(event?.evidenceRefs).length)errors.push(k+"EVIDENCE_MISSING");
   if(event?.nodeId){if(!nodes.has(event.nodeId))errors.push(k+"UNKNOWN_NODE");if(previousNode&&nodes.has(event.nodeId)&&!edges.has(previousNode+"\x1f"+event.nodeId))errors.push(k+"GRAPH_EDGE_NOT_FOUND");previousNode=event.nodeId;}
   else {warnings.push(k+"NODE_TRACE_NOT_OBSERVED");previousNode=null;}
   if(event.testStatus==="OBSERVED"&&!arr(event.evidenceRefs).length)errors.push(k+"OBSERVED_NO_PROOF");
   if(event.testStatus==="NOT_RUN")warnings.push(k+"TEST_NOT_RUN");
  }else{
   if(!str(event?.reason))errors.push(k+"SKIP_REASON_MISSING");
   if(event?.status==="NOT_RUN")warnings.push(k+"STAGE_NOT_RUN");
   previousNode=null;
  }
 }
 if(errors.length)return{status:"INVALID",errors,warnings};
 return{status:"STRUCTURE_PASS_MEDIA_NOT_VERIFIED",errors,warnings};
};
