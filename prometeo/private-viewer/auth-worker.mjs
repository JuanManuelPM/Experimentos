/**
 * PROMETEO VIEWER · GitHub App OAuth callback (Cloudflare Workers)
 * Prototype deployment adapter, NOT deployed. Public source contains no secrets.
 *
 * Required Worker secrets:
 *   GH_CLIENT_ID: public client id from GitHub App
 *   GH_CLIENT_SECRET: secret generated for GitHub App (never commit)
 *   VIEWER_ORIGIN: "https://juanmanuelpm.github.io"
 *
 * Configure GitHub App callback to https://YOUR-WORKER.workers.dev/callback
 */
const json = x => JSON.stringify(x).replace(/</g, '\\u003c');
function htmlPage(content,nonce) {
  return new Response(content,{status:200,headers:{
    'Content-Type':'text/html; charset=utf-8',
    'Cache-Control':'no-store, max-age=0',
    'Referrer-Policy':'no-referrer',
    'X-Content-Type-Options':'nosniff',
    'Cross-Origin-Resource-Policy':'cross-origin',
    'Content-Security-Policy':"default-src 'none'; script-src 'nonce-"+nonce+"'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
  }});
}
function randomNonce() {
  const a=crypto.getRandomValues(new Uint8Array(18));
  return btoa(String.fromCharCode(...a));
}
function popupResponse(payload, origin) {
  const nonce=randomNonce();
  const script='if(window.opener)window.opener.postMessage('+json(payload)+','+json(origin)+');window.close();';
  return htmlPage('<!doctype html><html lang="es"><meta charset="utf-8"><title>PROMETEO</title><body style="font:16px system-ui;background:#f4f4ef;color:#222;text-align:center;padding:15vh 2rem"><p>Volvé al visor.</p><script nonce="'+nonce+'">'+script+'</script></body></html>',nonce);
}
export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    if (request.method!=='GET' || url.pathname!=='/callback') return new Response('Not found',{status:404});
    const origin = String(env.VIEWER_ORIGIN||'');
    if (origin!=='https://juanmanuelpm.github.io' ||
        !env.GH_CLIENT_ID || !env.GH_CLIENT_SECRET) return new Response('Not configured',{status:503});
    const state=url.searchParams.get('state')||'';
    if (!/^[a-f0-9]{48}$/.test(state)) return new Response('Invalid state',{status:400});
    if (url.searchParams.has('error')) return popupResponse({type:'prometeo:github-auth',state,error:'Autorización cancelada.'},origin);
    const code=url.searchParams.get('code')||'';
    if (!/^[A-Za-z0-9_-]{8,512}$/.test(code)) return new Response('Invalid code',{status:400});
    try {
      const response=await fetch('https://github.com/login/oauth/access_token',{
        method:'POST',
        headers:{'Accept':'application/json','Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({
          client_id:env.GH_CLIENT_ID,
          client_secret:env.GH_CLIENT_SECRET,
          code,
          redirect_uri:url.origin+'/callback'
        }),
        redirect:'error'
      });
      if (!response.ok) throw new Error('GitHub token endpoint failed');
      const result=await response.json();
      const token=String(result.access_token||'');
      if(!/^[A-Za-z0-9_-]{15,600}$/.test(token)) throw new Error('GitHub no autorizó el acceso');
      return popupResponse({type:'prometeo:github-auth',state,token},origin);
    } catch (e) {
      return popupResponse({type:'prometeo:github-auth',state,error:'No fue posible completar la conexión.'},origin);
    }
  }
};