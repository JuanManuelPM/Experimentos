// Candidate only. Run behind an HTTPS reverse proxy on a dedicated origin.
import http from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const rand=()=>randomBytes(32).toString('base64url');
const sha=x=>createHash('sha256').update(x).digest('base64url');
const safeEq=(a,b)=>typeof a==='string'&&typeof b==='string'&&/^[A-Za-z0-9_-]+$/.test(b)&&a.length===b.length&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const files=new Map([['/','index.html'],['/index.html','index.html'],['/app.js','app.js'],['/shell.js','shell.js'],['/styles.css','styles.css'],['/model-adapter.mjs','model-adapter.mjs']]);
const types={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data))};
const cookie=(name,value,maxAge)=>name+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+maxAge;
const getCookie=(req,name)=>(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';
export function cleanPath(s) {
  if(typeof s!=='string'||!s||s.length>512||s.normalize('NFC')!==s||/[%\\\u0000-\u001f?#]/.test(s)) throw Error('Invalid path');
  if(s.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('Invalid segment');
  return s;
}
export function allowRequest(path,cfg,blobs=new Set()) {
  if(typeof path!=='string'||path.length>1800)return null;
  const prefix='/repos/'+cfg.repo;
  if(path===prefix)return path;
  const b=path.match(/^\/repos\/[^/]+\/[^/]+\/git\/blobs\/([a-f0-9]{40})$/);
  if(b&&path.startsWith(prefix+'/')&&blobs.has(b[1]))return path;
  const i=path.indexOf('?');if(i<0||!path.startsWith(prefix+'/contents/'))return null;
  try {
    const p=cleanPath(path.slice((prefix+'/contents/').length,i).split('/').map(decodeURIComponent).join('/'));
    const q=new URLSearchParams(path.slice(i+1));
    if(q.size!==1||q.get('ref')!==cfg.ref||!(p===cfg.root||p.startsWith(cfg.root+'/')))return null;
    return prefix+'/contents/'+p.split('/').map(encodeURIComponent).join('/')+'?ref='+encodeURIComponent(cfg.ref);
  } catch{return null}
}
function config(env) {
  const c={origin:env.VIEWER_ORIGIN,clientId:env.GH_CLIENT_ID,secret:env.GH_CLIENT_SECRET,repo:env.FIXTURE_REPO,ref:env.FIXTURE_COMMIT,root:env.FIXTURE_ROOT,login:env.ALLOWED_LOGIN};
  if(!Object.values(c).every(Boolean))return null;
  if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/.test(c.origin)||!/^[-\w.]+\/[-\w.]+$/.test(c.repo)||c.repo.toLowerCase()==='juanmanuelpm/pruebas'||c.repo.toLowerCase()==='juanmanuelpm/experimentos'||!/^[a-f0-9]{40}$/.test(c.ref)||!/^[-\w]+$/.test(c.login))throw Error('Invalid config or broad repository denied');
  cleanPath(c.root);if(env.FIXTURE_ENTRY){c.entry=cleanPath(env.FIXTURE_ENTRY);if(!c.entry.startsWith(c.root+'/'))throw Error('Entry outside scope');}return c;
}
export function createServer(env=process.env,upstream=fetch) {
  const cfg=config(env), pending=new Map(),sessions=new Map();
  async function github(token,path) {
    const r=await upstream('https://api.github.com'+path,{headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28'},redirect:'error',signal:AbortSignal.timeout(15000)});
    if(!r.ok)throw Error('Upstream denied');
    if(Number(r.headers.get('content-length'))>36*1024*1024)throw Error('Too large');
    const reader=r.body.getReader();let count=0;const chunks=[];
    try{while(true){const {value,done}=await reader.read();if(done)break;count+=value.byteLength;if(count>36*1024*1024)throw Error('Too large');chunks.push(Buffer.from(value))}}finally{await reader.cancel().catch(()=>{})}
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }
  function safeTree(entries,cfg){const tree=new Map();for(const x of entries){if(!(x.path===cfg.root||x.path.startsWith(cfg.root+'/')))continue;if(x.type==='tree'&&x.mode==='040000'||x.type==='blob'&&['100644','100755'].includes(x.mode))tree.set(x.path,x);}if(tree.get(cfg.root)?.type!=='tree')throw Error('Fixture root absent');return tree;}
  function gc(map){for(const [k,v] of map)if(v.exp<=Date.now())map.delete(k)}
  return http.createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');
    const u=new URL(req.url,'http://local.invalid');gc(pending);gc(sessions);
    const sid=getCookie(req,'__Host-pv_session'),s=sessions.get(sid);
    try {
      if(req.method==='GET'&&files.has(u.pathname)){
        const f=files.get(u.pathname);
        const data=await readFile(new URL(f,import.meta.url));res.writeHead(200,{'Content-Type':types[f.split('.').pop()]});return res.end(data);
      }
      if(req.method==='GET'&&u.pathname.startsWith('/vendor/')){
        const name=cleanPath(u.pathname.slice('/vendor/'.length));
        if(!/^(build|examples\/jsm)\/[A-Za-z0-9_.\/-]+\.js$/.test(name))return json(res,404,{error:'Not found'});
        const data=await readFile(new URL('node_modules/three/'+name,import.meta.url));res.writeHead(200,{'Content-Type':types.js});return res.end(data);
      }
      if(!cfg)return json(res,503,{error:'Authorization not configured'});
      if(req.method==='GET'&&u.pathname==='/auth/start'){
        if(pending.size>=200)return json(res,429,{error:'Try later'});
        const state=rand(),verifier=rand(),flow=rand();
        pending.set(flow,{state,verifier,exp:Date.now()+300000});
        const a=new URL('https://github.com/login/oauth/authorize');
        a.search=new URLSearchParams({client_id:cfg.clientId,redirect_uri:cfg.origin+'/auth/callback',state,code_challenge:sha(verifier),code_challenge_method:'S256'}).toString();
        res.writeHead(302,{'Set-Cookie':cookie('__Host-pv_flow',flow,300),Location:a.href});return res.end();
      }
      if(req.method==='GET'&&u.pathname==='/auth/callback'){
        const flow=getCookie(req,'__Host-pv_flow'),p=pending.get(flow);pending.delete(flow);
        if(!p||!safeEq(p.state,u.searchParams.get('state'))||!u.searchParams.get('code'))return json(res,403,{error:'Invalid or expired authorization'});
        const r=await upstream('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:cfg.clientId,client_secret:cfg.secret,code:u.searchParams.get('code'),code_verifier:p.verifier,redirect_uri:cfg.origin+'/auth/callback'}),redirect:'error',signal:AbortSignal.timeout(15000)});
        if(!r.ok)return json(res,403,{error:'Authorization denied'});
        const t=await r.json();if(!t.access_token||t.error)return json(res,403,{error:'Authorization denied'});
        const user=await github(t.access_token,'/user');
        if(user.login?.toLowerCase()!==cfg.login.toLowerCase())return json(res,403,{error:'Account denied'});
        const meta=await github(t.access_token,'/repos/'+cfg.repo);
        if(meta.private!==true||meta.full_name.toLowerCase()!==cfg.repo.toLowerCase())return json(res,403,{error:'Private fixture required'});
        const commit=await github(t.access_token,'/repos/'+cfg.repo+'/git/commits/'+cfg.ref);
        if(!/^[a-f0-9]{40}$/.test(commit?.tree?.sha))throw Error('Invalid commit');
        const rawTree=await github(t.access_token,'/repos/'+cfg.repo+'/git/trees/'+commit.tree.sha+'?recursive=1');
        if(rawTree.truncated||!Array.isArray(rawTree.tree))throw Error('Incomplete tree');
        const tree=safeTree(rawTree.tree,cfg);if(cfg.entry&&tree.get(cfg.entry)?.type!=='blob')throw Error('Entry absent');
        if(sessions.size>=100)return json(res,429,{error:'Session limit'});
        if(sid)sessions.delete(sid);
        const id=rand(),seconds=Math.min(3600,Math.floor(Number(t.expires_in)||3600));if(seconds<=0)throw Error('Expired token');
        sessions.set(id,{token:t.access_token,exp:Date.now()+seconds*1000,blobs:new Set(),tree});
        res.writeHead(303,{Location:'/', 'Set-Cookie':[cookie('__Host-pv_session',id,seconds),cookie('__Host-pv_flow','',0)]});return res.end();
      }
      if(req.method==='POST'&&u.pathname==='/auth/logout'){
        if(req.headers.origin!==cfg.origin)return json(res,403,{error:'Origin denied'});
        sessions.delete(sid);res.setHeader('Set-Cookie',cookie('__Host-pv_session','',0));return json(res,200,{ok:true});
      }
      if(req.method!=='GET'||!s)return json(res,401,{error:'Access required'});
      if(u.pathname==='/api/session')return json(res,200,{repo:cfg.repo,ref:cfg.ref,root:cfg.root,entry:cfg.entry||null});
      if(u.pathname==='/api/github'){
        const path=allowRequest(u.searchParams.get('path'),cfg,s.blobs);if(!path)return json(res,403,{error:'Scope denied'});
        const contentPrefix='/repos/'+cfg.repo+'/contents/';
        const isContents=path.startsWith(contentPrefix);
        const logical=isContents?path.slice(contentPrefix.length,path.indexOf('?')).split('/').map(decodeURIComponent).join('/'):null;
        const entry=isContents?s.tree.get(logical):null;
        if(isContents&&!entry)return json(res,403,{error:'Tree scope denied'});
        const out=await github(s.token,path);
        if(path==='/repos/'+cfg.repo)return json(res,200,{full_name:cfg.repo,private:true});
        const minimal=x=>({name:x.name,path:x.path,type:x.type,size:x.size,sha:x.sha,content:x.content,encoding:x.encoding});
        if(isContents&&entry.type==='tree'){
          if(!Array.isArray(out))throw Error('Tree mismatch');
          return json(res,200,out.filter(x=>s.tree.get(x.path)?.sha===x.sha).map(minimal));
        }
        if(isContents){
          if(out?.type!=='file'||out.sha!==entry.sha)throw Error('File mismatch');
          if(s.blobs.size<1024)s.blobs.add(out.sha);
        }else if(out.sha!==path.split('/').pop())throw Error('Blob mismatch');
        return json(res,200,minimal(out));
      }
      return json(res,404,{error:'Not found'});
    }catch{return json(res,502,{error:'Request failed; no public fallback'})}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)createServer().listen(Number(process.env.PORT)||8080,'127.0.0.1');
