const OWNER='JuanManuelPM';
const REPO='prometeo';
const BRANCH='main';
const API='https://api.github.com';
const ALLOWED_ORIGIN='https://juanmanuelpm.github.io';
const PAGE_CHANGE_FRONTIER='https://catnohyouxqjjtseaueb.supabase.co/functions/v1/prometeo-change-loop-v1/worker-frontier';
const WAKE_ROOT='coordination/portfolio/evidence/prometeo-autonomous-growth/primary-chat-wakes';
const THREAD_PATH='coordination/portfolio/evidence/prometeo-autonomous-growth/CHAT_THREAD_MIRROR_CANARY_V1.json';
const PROJECT_ID='prometeo-autonomous-growth';
const PUBLIC_CANARY_MAX_TEXT=1200;

function send(res,status,body){res.status(status).json(body)}
function headers(res){
  res.setHeader('Access-Control-Allow-Origin',ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Vary','Origin');
}
function clean(v,max=4096){const s=String(v??'').trim();return s?s.slice(0,max):''}
function safeId(v,code){const s=clean(v,160);if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$/.test(s))throw new Error(code);return s}
function safePath(v,code){const s=clean(v,360);if(!/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._\/-]{1,360}$/.test(s))throw new Error(code);return s}
function safeRequestId(v){const s=clean(v,120).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');if(!s)throw new Error('REQUEST_ID_REQUIRED');return s}
function ghHeaders(token){return{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'prometeo-primary-chat-bridge-v2'}}
async function gh(token,path,options={}){
  const r=await fetch(`${API}/repos/${OWNER}/${REPO}/${path}`,{...options,headers:{...ghHeaders(token),...(options.headers||{})}});
  let data=null;try{data=await r.json()}catch{}
  return{ok:r.ok,status:r.status,data};
}
async function createFile(token,path,content,message){
  const r=await gh(token,`contents/${path}`,{method:'PUT',body:JSON.stringify({message,content:Buffer.from(content,'utf8').toString('base64'),branch:BRANCH})});
  if(r.ok)return{created:true,commit:r.data?.commit?.sha||null};
  if(r.status===422){const ex=await gh(token,`contents/${path}?ref=${encodeURIComponent(BRANCH)}`);if(ex.ok)return{created:false,exists:true}}
  const e=new Error('GITHUB_CREATE_FAILED');e.detail={status:r.status,message:r.data?.message||null};throw e;
}
async function appendThreadMessage(token,message){
  for(let attempt=0;attempt<3;attempt++){
    const got=await gh(token,`contents/${THREAD_PATH}?ref=${encodeURIComponent(BRANCH)}`);
    if(!got.ok)throw new Error('THREAD_READ_FAILED');
    const sha=got.data?.sha;
    const raw=Buffer.from(String(got.data?.content||'').replace(/\n/g,''),'base64').toString('utf8');
    const thread=JSON.parse(raw);
    thread.messages=Array.isArray(thread.messages)?thread.messages:[];
    if(thread.messages.some(m=>m?.message_id===message.message_id))return{already:true};
    thread.messages.push(message);
    thread.updated_at=message.published_at;
    const put=await gh(token,`contents/${THREAD_PATH}`,{
      method:'PUT',
      body:JSON.stringify({message:`primary chat: publish ${message.message_id}`,content:Buffer.from(JSON.stringify(thread,null,2)+'\n','utf8').toString('base64'),sha,branch:BRANCH})
    });
    if(put.ok)return{updated:true,commit:put.data?.commit?.sha||null};
    if(put.status!==409&&put.status!==422)throw new Error('THREAD_UPDATE_FAILED');
  }
  throw new Error('THREAD_CAS_EXHAUSTED');
}
async function verifiedCandidate(workItemId,pageId,returnPath){
  const r=await fetch(PAGE_CHANGE_FRONTIER,{cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('PAGE_CHANGE_FRONTIER_UNAVAILABLE');
  const data=await r.json();
  const item=(Array.isArray(data?.items)?data.items:[]).find(x=>
    String(x?.work_item_id||'')===workItemId&&
    String(x?.page_id||'')===pageId&&
    String(x?.kind||'')==='PAGE_CHANGE_EXECUTION'&&
    String(x?.return_path||'')===returnPath
  );
  if(!item)throw new Error('PAGE_CHANGE_WORK_NOT_READY');
  return item;
}
async function handlePrivateWake(token,body){
  const workItemId=safeId(body.work_item_id,'WORK_ITEM_ID_INVALID');
  const pageId=safeId(body.page_id,'PAGE_ID_INVALID');
  const returnPath=safePath(body.return_path,'RETURN_PATH_INVALID');
  const candidate=await verifiedCandidate(workItemId,pageId,returnPath);
  const wakePath=`${WAKE_ROOT}/${workItemId}.json`;
  const receipt={
    schema:'prometeo.primary-chat-page-change-wake/v1',
    status:'VERIFIED_SANITIZED_WAKE',
    work_item_id:workItemId,
    page_id:pageId,
    project_id:String(candidate.project_id||'prometeo-page-change'),
    opportunity_id:String(candidate.opportunity_id||''),
    claim_path:String(candidate.claim_path||''),
    return_path:returnPath,
    expires_at:candidate.expires_at||null,
    created_at:new Date().toISOString(),
    source:{private_owner:'prometeo-change-loop-v1',worker_frontier:PAGE_CHANGE_FRONTIER},
    privacy:{raw_text_received_by_this_bridge:false,raw_text_published:false,credentials_published:false,private_packet_published:false},
    purpose:'Durable sanitized GitHub write that wakes the existing live-feed/claim-frontier compiler after an authenticated private Page Change packet already exists.',
    authority:'WAKE_ONLY_NO_SCHEDULER_NO_CURRENT_NO_EXECUTION_AUTHORITY'
  };
  await createFile(token,wakePath,JSON.stringify(receipt,null,2)+'\n',`primary chat: wake ${workItemId}`);
  return{schema:'prometeo.ingress-transport-result/v1',status:'QUEUED',ref:wakePath,queued:true,error:null,work_item_id:workItemId,privacy:'PRIVATE_TEXT_PAGE_CHANGE'};
}
async function handlePublicCanary(token,body){
  if(body.public_canary!==true)throw new Error('PUBLIC_CANARY_EXPLICIT_OPT_IN_REQUIRED');
  const env=body.public_envelope||{};
  if(env.schema!=='prometeo.browser-ingress-request/v1')throw new Error('PUBLIC_ENVELOPE_SCHEMA_INVALID');
  if(env.kind!=='CHAT_CANARY_HUMAN_MESSAGE_V1')throw new Error('KIND_NOT_ALLOWED');
  if(clean(env?.page?.page_id,120)!=='control-v11-chat-canary')throw new Error('PAGE_NOT_ALLOWED');
  const text=String(body?.private_payload?.text??'').trim();
  if(!/^CANARY:\s*/i.test(text))throw new Error('CANARY_PREFIX_REQUIRED');
  if(!text||text.length>PUBLIC_CANARY_MAX_TEXT)throw new Error('CANARY_TEXT_INVALID');
  const requestId=safeRequestId(env.request_id);
  const createdAt=Number.isFinite(Date.parse(env.created_at))?new Date(env.created_at).toISOString():new Date().toISOString();
  const jobId=`portfolio-primary-chat-canary-${requestId}`;
  const jobPath=`coordination/portfolio/derived/${PROJECT_ID}/${jobId}.json`;
  const returnRoot=`coordination/portfolio/returns/${jobId}/`;
  const messageId=`MSG-HUMAN-CANARY-${requestId.toUpperCase()}`;
  const job={
    schema:'prometeo.portfolio-derived-job/v1',
    job_id:jobId,
    dedupe_key:`prometeo:primary-chat-canary:${requestId}`,
    project_id:PROJECT_ID,
    title:'Primary Chat · canary público de respuesta',
    kind:'primary_chat_canary_response',
    value_class:'SYSTEM_MULTIPLIER',
    priority:499,
    seed_status:'ready',
    required_capabilities:[],
    mission:`CANARY DE RESPUESTA, SIN CAMBIOS DE PRODUCTO. Respondé la intención humana y persistí RETURN sanitizado. Texto humano: ${text}`,
    definition_of_done:[
      'No realizar cambios de producto ni mutaciones fuera de receipts/RETURN/proyección de chat requeridos por CURRENT.',
      'Responder la intención del texto canary.',
      'Persistir RETURN sanitizado bajo el return root canónico de este job.',
      `Publicar respuesta PUBLIC_SANITIZED_CANARY en ${THREAD_PATH}, reply_to_message_id=${messageId}, citando result_ref/RETURN durable.`,
      'No crear scheduler, queue, CURRENT, worker family ni autoridad paralela.'
    ],
    evidence:['current-tree/control-v11/chat-canary/',jobPath],
    source:{surface:'PRIMARY_CHAT_PUBLIC_CANARY_FALLBACK',request_id:requestId,message_id:messageId,chat_object_id:'chat-object-prometeo-chat-control-main',return_root:returnRoot,privacy:'PUBLIC_SANITIZED_CANARY'},
    created_at:createdAt,
    authority:'CURRENT_ALLOCATOR_PRIMARY_CHAT_PUBLIC_CANARY_ONLY_NO_PROMOTION'
  };
  await createFile(token,jobPath,JSON.stringify(job,null,2)+'\n',`primary chat canary: enqueue ${requestId}`);
  let projection='PUBLISHED';
  try{
    await appendThreadMessage(token,{
      message_id:messageId,
      chat_object_id:'chat-object-prometeo-chat-control-main',
      actor_type:'HUMAN',
      actor_ref:'HUMAN_PRIMARY',
      source_surface:'PROMETEO_PAGE',
      input_origin:'PRIMARY_CHAT_PUBLIC_CANARY_FALLBACK',
      body_kind:'TEXT',
      body_text:text,
      created_at:createdAt,
      published_at:new Date().toISOString(),
      status:'PUBLISHED',
      privacy:'PUBLIC_SANITIZED_CANARY',
      work_unit_ref:jobPath,
      summary_text:text.length>280?text.slice(0,277)+'...':text,
      ui_blocks:[{type:'details',label:'origen',body:'Fallback público explícito CANARY: usado porque el owner privado estaba degradado. No otorga autoridad paralela.'}],
      evidence_refs:[jobPath]
    });
  }catch{projection='DELAYED'}
  return{schema:'prometeo.ingress-transport-result/v1',status:'QUEUED_PUBLIC_CANARY_FALLBACK',ref:jobPath,queued:true,error:null,privacy:'PUBLIC_SANITIZED_CANARY',projection};
}

export default async function handler(req,res){
  headers(res);
  if(req.method==='OPTIONS')return res.status(204).end();
  const token=process.env.PROMETEO_GITHUB_TOKEN;
  if(req.method==='GET')return send(res,200,{
    schema:'prometeo.ingress-bridge-health/v3',
    status:token?'READY_PRIVATE_WAKE_PLUS_CANARY_FALLBACK':'BOUNDARY_SECRET_MISSING',
    secret_configured:Boolean(token),
    privacy_mode:'PRIVATE_BY_DEFAULT_EXPLICIT_CANARY_PUBLIC_FALLBACK',
    authority:'EXISTING_CURRENT_ALLOCATOR_ONLY'
  });
  if(req.method!=='POST')return send(res,405,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_METHOD',queued:false,ref:null,error:'METHOD_NOT_ALLOWED'});
  const origin=req.headers.origin;
  if(origin&&origin!==ALLOWED_ORIGIN)return send(res,403,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_ORIGIN',queued:false,ref:null,error:'ORIGIN_NOT_ALLOWED'});
  if(!token)return send(res,503,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_SECRET_MISSING',queued:false,ref:null,error:'PROMETEO_GITHUB_TOKEN_MISSING'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    if(body.schema==='prometeo.primary-chat-page-change-wake/v1')return send(res,200,await handlePrivateWake(token,body));
    if(body.schema==='prometeo.primary-chat-public-canary-submit/v1')return send(res,200,await handlePublicCanary(token,body));
    throw new Error('INGRESS_SCHEMA_INVALID');
  }catch(error){
    return send(res,400,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_TRANSPORT_FAILED',queued:false,ref:null,error:clean(error?.message||'INGRESS_FAILED',160)});
  }
}
