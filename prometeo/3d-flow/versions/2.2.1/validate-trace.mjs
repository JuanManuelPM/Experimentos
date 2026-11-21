// PROMETEO Studio-3D · stage trace validator 2.2.1
// This is a LEARNING DIAGNOSTIC, not a license to abort an ugly or unfinished scene.
export const STAGES=['scope','recovery','planning','acquisition','classification','humanoid','props','environment','fx','assembly','orientation','acting','cinema','qa','repair','persistence','publish'];
export function sha256Utf8(input){
 const rot=(v,n)=>(v>>>n)|(v<<(32-n)),mw=2**32,buf=[],hash=[],k=[],comp={};
 for(let p=2;k.length<64;p++)if(!comp[p]){for(let i=0;i<313;i+=p)comp[i]=p;if(hash.length<8)hash.push((Math.sqrt(p)%1)*mw|0);k.push((Math.pow(p,1/3)%1)*mw|0)}
 let s=unescape(encodeURIComponent(input)),len=s.length;s+='\x80';while(s.length%64!==56)s+='\x00';for(let i=0;i<s.length;i++)buf[i>>2]|=s.charCodeAt(i)<<((3-i)%4*8);
 buf.push((len/mw)|0,(len*8)|0);
 for(let j=0;j<buf.length;){const w=buf.slice(j,j+=16),old=hash.slice();
 for(let i=0;i<64;i++){
  w[i]=i<16?w[i]|0:(w[i-16]+(rot(w[i-15],7)^rot(w[i-15],18)^(w[i-15]>>>3))+w[i-7]+(rot(w[i-2],17)^rot(w[i-2],19)^(w[i-2]>>>10)))|0;
  const [a,b,c,d,e,f,g,h]=hash,t1=h+(rot(e,6)^rot(e,11)^rot(e,25))+((e&f)^(~e&g))+k[i]+w[i]|0;
  const t2=(rot(a,2)^rot(a,13)^rot(a,22))+((a&b)^(a&c)^(b&c))|0;
  hash[0]=t1+t2|0;hash[1]=a;hash[2]=b;hash[3]=c;hash[4]=d+t1|0;hash[5]=e;hash[6]=f;hash[7]=g;
 }
 for(let i=0;i<8;i++)hash[i]=hash[i]+old[i]|0;
 }return hash.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
}
const sha64=x=>typeof x==='string'&&/^[0-9a-f]{64}$/.test(x);
const str=x=>typeof x==='string'&&x.trim().length>0;
export function validateStageTrace(trace,expectedFlowHash){
 const errors=[],warn=[];
 if(trace?.schema!=='prometeo.3d.stage-trace/v1')errors.push('TRACE_SCHEMA');
 if(!str(trace?.projectId)||!str(trace?.version))errors.push('WORK_ID');
 if(trace?.flow?.version!=='2.2.1'||!sha64(trace?.flow?.sha256Canonical))errors.push('FLOW_LOCK');
 if(expectedFlowHash&&trace?.flow?.sha256Canonical!==expectedFlowHash)errors.push('FLOW_HASH_MISMATCH');
 if(!str(trace?.briefLock?.rawText)||!sha64(trace?.briefLock?.sha256)||!str(trace?.briefLock?.briefId))errors.push('HUMAN_BRIEF_NOT_LOCKED');
 else if(sha256Utf8(trace.briefLock.rawText)!==trace.briefLock.sha256)errors.push('HUMAN_BRIEF_HASH_CHANGED');
 if(!str(trace?.product?.sourceRef)||!str(trace?.product?.scopeDelivered))errors.push('PRODUCT_NOT_REFERENCED');
 if(!['PUBLIC_PREVIEW','SOURCE_ONLY_TECHNICAL_BLOCKER','NOT_PUBLISHED_WITH_REASON'].includes(trace?.product?.previewStatus))errors.push('PREVIEW_STATUS');
 if(!Array.isArray(trace?.stages))errors.push('STAGES_MISSING');
 const seen=new Set();
 for(const row of trace?.stages||[]){
   const id=row?.stage;
   if(!STAGES.includes(id))errors.push('UNKNOWN_STAGE_'+id);
   if(seen.has(id))errors.push('DUPLICATE_STAGE_'+id);
   seen.add(id);
   if(!['EXECUTED','SKIPPED','NOT_RUN'].includes(row?.status))errors.push('STATUS_'+id);
   if(!str(row?.conclusion))errors.push('CONCLUSION_'+id);
   if(row?.status==='EXECUTED'&&(!str(row?.action)||!str(row?.decision)))errors.push('ACTUAL_WORK_MISSING_'+id);
   if(row?.status!=='EXECUTED'&&!str(row?.action))errors.push('SKIP_REASON_'+id);
   if(!Array.isArray(row?.evidenceRefs))errors.push('EVIDENCE_REFS_'+id);
   if(row?.status==='EXECUTED'&&(!Array.isArray(row?.evidenceRefs)||row.evidenceRefs.length===0))warn.push('UNSUPPORTED_WORK_CLAIM_'+id);
   if(row?.evidenceLevel==='GPU_RENDER'&&!(row.evidenceRefs||[]).some(x=>/\.png$|\.jpe?g$|\.webp$|\.mp4$|\.webm$|browser-capture|screenshot/i.test(x)))warn.push('GPU_RENDER_WITHOUT_IMAGE_PROOF_'+id);
 }
 for(const id of STAGES)if(!seen.has(id))errors.push('MISSING_STAGE_'+id);
 if(Array.isArray(trace?.stages)&&trace.stages.length!==17)errors.push('STAGE_COUNT');
 return{ok:errors.length===0,errors,warnings:warn,mustContinueProduction:true,neverSelfRejectArt:true};
}
