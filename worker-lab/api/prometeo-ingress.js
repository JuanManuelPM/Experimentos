const OWNER='JuanManuelPM';
const REPO='prometeo';
const BRANCH='main';
const API='https://api.github.com';
const ALLOWED_ORIGIN='https://juanmanuelpm.github.io';
const THREAD_PATH='coordination/portfolio/evidence/prometeo-autonomous-growth/CHAT_THREAD_MIRROR_CANARY_V1.json';
const PROJECT_ID='prometeo-autonomous-growth';
const MAX_TEXT=12000;

function send(res,status,body){
  res.status(status).json(body);
}
function headers(res){
  res.setHeader('Access-Control-Allow-Origin',ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Vary','Origin');
}
function clean(v,max=4096){
  const s=String(v??'').trim();
  return s ? s.slice(0,max) : '';
}
function safeRequestId(v){
  const s=clean(v,120).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
  if(!s) throw new Error('REQUEST_ID_REQUIRED');
  return s;
}
function ghHeaders(token){
  return {
    Authorization:`Bearer ${token}`,
    Accept:'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28',
    'Content-Type':'application/json',
    'User-Agent':'prometeo-primary-chat-bridge-v1'
  };
}
async function gh(token,path,options={}){
  const r=await fetch(`${API}/repos/${OWNER}/${REPO}/${path}`,{
    ...options,
    headers:{...ghHeaders(token),...(options.headers||{})}
  });
  let data=null;
  try{data=await r.json()}catch{}
  return {ok:r.ok,status:r.status,data};
}
async function createFile(token,path,content,message){
  const r=await gh(token,`contents/${path}`,{
    method:'PUT',
    body:JSON.stringify({message,content:Buffer.from(content,'utf8').toString('base64'),branch:BRANCH})
  });
  if(r.ok) return {created:true,commit:r.data?.commit?.sha||null};
  if(r.status===422){
    const existing=await gh(token,`contents/${path}?ref=${encodeURIComponent(BRANCH)}`);
    if(existing.ok) return {created:false,exists:true};
  }
  const err=new Error('GITHUB_CREATE_FAILED');
  err.detail={status:r.status,message:r.data?.message||null};
  throw err;
}
async function appendThreadMessage(token,message){
  for(let attempt=0;attempt<3;attempt++){
    const got=await gh(token,`contents/${THREAD_PATH}?ref=${encodeURIComponent(BRANCH)}`);
    if(!got.ok) throw Object.assign(new Error('THREAD_READ_FAILED'),{detail:{status:got.status}});
    const sha=got.data?.sha;
    const raw=Buffer.from(String(got.data?.content||'').replace(/\n/g,''),'base64').toString('utf8');
    const thread=JSON.parse(raw);
    thread.messages=Array.isArray(thread.messages)?thread.messages:[];
    if(thread.messages.some(m=>m?.message_id===message.message_id)) return {already:true};
    thread.messages.push(message);
    thread.updated_at=message.published_at;
    const put=await gh(token,`contents/${THREAD_PATH}`,{
      method:'PUT',
      body:JSON.stringify({
        message:`primary chat: publish ${message.message_id}`,
        content:Buffer.from(JSON.stringify(thread,null,2)+'\n','utf8').toString('base64'),
        sha,
        branch:BRANCH
      })
    });
    if(put.ok) return {updated:true,commit:put.data?.commit?.sha||null};
    if(put.status!==409 && put.status!==422){
      throw Object.assign(new Error('THREAD_UPDATE_FAILED'),{detail:{status:put.status,message:put.data?.message||null}});
    }
  }
  throw new Error('THREAD_CAS_EXHAUSTED');
}

export default async function handler(req,res){
  headers(res);
  if(req.method==='OPTIONS') return res.status(204).end();
  if(req.method==='GET'){
    return send(res,200,{
      schema:'prometeo.ingress-bridge-health/v1',
      status:process.env.PROMETEO_GITHUB_TOKEN?'READY_PUBLIC_CANARY':'BOUNDARY_SECRET_MISSING',
      secret_configured:Boolean(process.env.PROMETEO_GITHUB_TOKEN),
      privacy_mode:'PUBLIC_SANITIZED_CANARY_ONLY'
    });
  }
  if(req.method!=='POST') return send(res,405,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_METHOD',queued:false,ref:null,error:'METHOD_NOT_ALLOWED'});
  const origin=req.headers.origin;
  if(origin && origin!==ALLOWED_ORIGIN) return send(res,403,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_ORIGIN',queued:false,ref:null,error:'ORIGIN_NOT_ALLOWED'});
  const token=process.env.PROMETEO_GITHUB_TOKEN;
  if(!token) return send(res,503,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_SECRET_MISSING',queued:false,ref:null,error:'PROMETEO_GITHUB_TOKEN_MISSING'});

  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    if(body.schema!=='prometeo.primary-chat-public-canary-submit/v1' || body.public_canary!==true){
      return send(res,400,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_PRIVACY_CLASS',queued:false,ref:null,error:'PUBLIC_CANARY_EXPLICIT_OPT_IN_REQUIRED'});
    }
    const env=body.public_envelope||{};
    if(env.schema!=='prometeo.browser-ingress-request/v1') throw new Error('PUBLIC_ENVELOPE_SCHEMA_INVALID');
    if(env.kind!=='CHAT_CANARY_HUMAN_MESSAGE_V1') throw new Error('KIND_NOT_ALLOWED');
    if(clean(env?.page?.page_id,120)!=='control-v11-chat-canary') throw new Error('PAGE_NOT_ALLOWED');
    const text=String(body?.private_payload?.text??'').trim();
    if(!text) throw new Error('EMPTY_TEXT');
    if(text.length>MAX_TEXT) throw new Error('TEXT_TOO_LARGE');
    const requestId=safeRequestId(env.request_id);
    const createdAt=Number.isFinite(Date.parse(env.created_at))?new Date(env.created_at).toISOString():new Date().toISOString();
    const jobId=`portfolio-primary-chat-${requestId}`;
    const jobPath=`coordination/portfolio/derived/${PROJECT_ID}/${jobId}.json`;
    const returnRoot=`coordination/portfolio/returns/${jobId}/`;
    const messageId=`MSG-HUMAN-PRIMARY-${requestId.toUpperCase()}`;

    const job={
      schema:'prometeo.portfolio-derived-job/v1',
      job_id:jobId,
      dedupe_key:`prometeo:primary-chat:${requestId}`,
      project_id:PROJECT_ID,
      title:'Primary Chat · responder mensaje público canary',
      kind:'primary_chat_response',
      value_class:'SYSTEM_MULTIPLIER',
      priority:495,
      seed_status:'ready',
      required_capabilities:[],
      mission:text,
      definition_of_done:[
        'Responder la intención humana de este job usando sólo owners CURRENT y evidencia durable relevante.',
        'Persistir RETURN sanitizado bajo el return root canónico de este job.',
        `Publicar una respuesta PUBLIC_SANITIZED_CANARY en ${THREAD_PATH}, reply_to_message_id=${messageId}, citando result_ref/RETURN durable.`,
        'No crear scheduler, queue, CURRENT, worker family ni autoridad paralela.',
        'No inferir liveness desde etiquetas; si existe boundary real, publicarlo como tal en la respuesta.'
      ],
      evidence:[
        'current-tree/control-v11/chat-canary/',
        'coordination/portfolio/derived/prometeo-autonomous-growth/CHAT_MESSAGE_MIRROR_CANARY_V1.json',
        jobPath
      ],
      source:{
        surface:'PRIMARY_CHAT_PUBLIC_CANARY',
        request_id:requestId,
        message_id:messageId,
        chat_object_id:'chat-object-prometeo-chat-control-main',
        return_root:returnRoot,
        privacy:'PUBLIC_SANITIZED_CANARY'
      },
      created_at:createdAt,
      authority:'CURRENT_ALLOCATOR_PRIMARY_CHAT_PUBLIC_CANARY_ONLY_NO_PROMOTION'
    };

    await createFile(token,jobPath,JSON.stringify(job,null,2)+'\n',`primary chat: enqueue ${requestId}`);

    let projection='PUBLISHED';
    try{
      await appendThreadMessage(token,{
        message_id:messageId,
        chat_object_id:'chat-object-prometeo-chat-control-main',
        actor_type:'HUMAN',
        actor_ref:'HUMAN_PRIMARY',
        source_surface:'PROMETEO_PAGE',
        input_origin:'PRIMARY_CHAT_PUBLIC_CANARY',
        body_kind:'TEXT',
        body_text:text,
        created_at:createdAt,
        published_at:new Date().toISOString(),
        status:'PUBLISHED',
        privacy:'PUBLIC_SANITIZED_CANARY',
        work_unit_ref:jobPath,
        summary_text:text.length>280?text.slice(0,277)+'...':text,
        ui_blocks:[{type:'details',label:'origen',body:'Enviado desde Primary Chat en modo PUBLIC_SANITIZED_CANARY. El job durable entra al allocator CURRENT; esta proyección no otorga autoridad.'}],
        evidence_refs:[jobPath]
      });
    }catch(error){
      projection='DELAYED';
    }

    return send(res,200,{
      schema:'prometeo.ingress-transport-result/v1',
      status:projection==='PUBLISHED'?'QUEUED':'QUEUED_PROJECTION_DELAYED',
      ref:jobPath,
      queued:true,
      error:null,
      privacy:'PUBLIC_SANITIZED_CANARY',
      projection
    });
  }catch(error){
    return send(res,400,{
      schema:'prometeo.ingress-transport-result/v1',
      status:'BOUNDARY_TRANSPORT_FAILED',
      queued:false,
      ref:null,
      error:clean(error?.message||'INGRESS_FAILED',160)
    });
  }
}
