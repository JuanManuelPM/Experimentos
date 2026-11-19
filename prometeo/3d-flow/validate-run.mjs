import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export function validateReceipt(receipt,flow){
 const errors=[],gates=flow.nodes.filter(n=>n.stage==='qa'&&n.type==='decision'&&n.gate&&/^D(29|3[0-8])$/.test(n.id));
 if(receipt?.schema!=='prometeo.3d.flow-run/v1')errors.push('SCHEMA');
 if(!receipt?.creationId)errors.push('CREATION_ID');
 if(receipt?.flow?.version!==flow.version||receipt?.flow?.sha256Canonical!==flow.sha256Canonical||receipt?.flow?.id!==flow.id)errors.push('FLOW_LOCK_MISMATCH');
 if(!Array.isArray(receipt?.nodeResults))errors.push('RESULTS_MISSING');
 const byId=new Map(),ids=new Set(flow.nodes.map(x=>x.id));
 for(const r of receipt.nodeResults||[]){if(!ids.has(r.nodeId))errors.push('UNKNOWN_NODE_'+r.nodeId);if(byId.has(r.nodeId))errors.push('DUPLICATE_NODE_'+r.nodeId);byId.set(r.nodeId,r);if(!['PASS','FAIL','NOT_RUN'].includes(r.status))errors.push('INVALID_STATUS_'+r.nodeId);if(r.status==='PASS'&&(!Array.isArray(r.evidenceRefs)||!r.evidenceRefs.length))errors.push('PASS_MISSING_EVIDENCE_'+r.nodeId)}
 if(['READY_FOR_ART_REVIEW','VERIFIED'].includes(receipt.status)){
  for(const gate of gates){const r=byId.get(gate.id);if(r?.status!=='PASS')errors.push('REQUIRED_GATE_UNPROVEN_'+gate.id);if(r?.status==='PASS'&&!r.sourceSha&&!r.assetSha)errors.push('REQUIRED_GATE_NO_HASH_'+gate.id)}
  for(const id of ['QA2','D19','D20','D21','D22','D23','D24','D28'])if(byId.get(id)?.status!=='PASS')errors.push('REQUIRED_QA_UNPROVEN_'+id);
  if(!receipt.provenance?.sourceCommit||receipt.provenance.sourceCommit==='PENDING_RUN')errors.push('SOURCE_COMMIT_UNRESOLVED');
 }
 if(receipt.status==='VERIFIED'){
  if(receipt.artApproval!=='APPROVED')errors.push('ART_APPROVAL_REQUIRED');
  if(!/^https:\/\//.test(receipt.url||''))errors.push('PUBLIC_URL_REQUIRED');
  if(receipt.publicHTTPVerified!==true)errors.push('PUBLIC_HTTP_NOT_VERIFIED');
 }
 return{ok:errors.length===0,errors,requiredGateIds:gates.map(x=>x.id)};
}
if(process.argv[1]===fileURLToPath(import.meta.url)&&process.argv[2]){
 const receipt=JSON.parse(readFileSync(process.argv[2],'utf8')),flow=JSON.parse(readFileSync(new URL('./FLOW_3D_MASTER.json',import.meta.url),'utf8'));const report=validateReceipt(receipt,flow);console.log(JSON.stringify(report,null,2));if(!report.ok)process.exitCode=1;
}
