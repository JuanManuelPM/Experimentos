const OWNER='JuanManuelPM';
const REPO='prometeo';
const BRANCH='main';
const API='https://api.github.com';
const ALLOWED_ORIGIN='https://juanmanuelpm.github.io';
const PAGE_CHANGE_FRONTIER='https://catnohyouxqjjtseaueb.supabase.co/functions/v1/prometeo-change-loop-v1/worker-frontier';
const WAKE_ROOT='coordination/portfolio/evidence/prometeo-autonomous-growth/primary-chat-wakes';

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
function ghHeaders(token){return{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json','User-Agent':'prometeo-primary-chat-wake-v1'}}
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
async function verifiedCandidate(workItemId,pageId,returnPath){
  const r=await fetch(PAGE_CHANGE_FRONTIER,{cache:'no-store',headers:{Accept:'application/json'}});
  if(!r.ok)throw new Error('PAGE_CHANGE_FRONTIER_UNAVAILABLE');
  const data=await r.json();
  const item=(Array.isArray(data?.items)?data.items:[]).find(x=>
    String(x?.work_item_id||'')===workItemId &&
    String(x?.page_id||'')===pageId &&
    String(x?.kind||'')==='PAGE_CHANGE_EXECUTION' &&
    String(x?.return_path||'')===returnPath
  );
  if(!item)throw new Error('PAGE_CHANGE_WORK_NOT_READY');
  return item;
}

export default async function handler(req,res){
  headers(res);
  if(req.method==='OPTIONS')return res.status(204).end();
  const token=process.env.PROMETEO_GITHUB_TOKEN;
  if(req.method==='GET')return send(res,200,{
    schema:'prometeo.ingress-bridge-health/v2',
    status:token?'READY_SANITIZED_WAKE':'BOUNDARY_SECRET_MISSING',
    secret_configured:Boolean(token),
    privacy_mode:'PRIVATE_TEXT_PAGE_CHANGE_SANITIZED_GITHUB_WAKE',
    authority:'PAGE_CHANGE_PRIVATE_PACKET_PLUS_CURRENT_ALLOCATOR'
  });
  if(req.method!=='POST')return send(res,405,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_METHOD',queued:false,ref:null,error:'METHOD_NOT_ALLOWED'});
  const origin=req.headers.origin;
  if(origin&&origin!==ALLOWED_ORIGIN)return send(res,403,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_ORIGIN',queued:false,ref:null,error:'ORIGIN_NOT_ALLOWED'});
  if(!token)return send(res,503,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_SECRET_MISSING',queued:false,ref:null,error:'PROMETEO_GITHUB_TOKEN_MISSING'});

  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
    if(body.schema!=='prometeo.primary-chat-page-change-wake/v1')throw new Error('WAKE_SCHEMA_INVALID');
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
    return send(res,200,{schema:'prometeo.ingress-transport-result/v1',status:'QUEUED',ref:wakePath,queued:true,error:null,work_item_id:workItemId,privacy:'PRIVATE_TEXT_PAGE_CHANGE'});
  }catch(error){
    return send(res,400,{schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_TRANSPORT_FAILED',queued:false,ref:null,error:clean(error?.message||'INGRESS_FAILED',160)});
  }
}
