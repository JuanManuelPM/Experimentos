(function installPrometeoGitHubIngressTransportV1(global){
  'use strict';
  const SCHEMA='prometeo.github-ingress-browser-transport/v1';
  const ENDPOINT='https://worker-lab.vercel.app/api/prometeo-ingress';

  async function submit(input={}){
    const public_envelope=input.public_envelope;
    const private_payload=input.private_payload;
    if(!public_envelope || !private_payload || typeof private_payload.text!=='string'){
      return {schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_INVALID_INPUT',ref:null,queued:false,error:'TRANSPORT_INPUT_INVALID'};
    }
    try{
      const response=await fetch(ENDPOINT,{
        method:'POST',
        mode:'cors',
        cache:'no-store',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          schema:'prometeo.primary-chat-public-canary-submit/v1',
          public_canary:true,
          public_envelope,
          private_payload
        })
      });
      let result=null;
      try{result=await response.json()}catch{}
      if(!response.ok || !result || result.schema!=='prometeo.ingress-transport-result/v1'){
        return {schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_TRANSPORT_FAILED',ref:null,queued:false,error:(result&&result.error)||('HTTP_'+response.status)};
      }
      return result;
    }catch(error){
      return {schema:'prometeo.ingress-transport-result/v1',status:'BOUNDARY_TRANSPORT_FAILED',ref:null,queued:false,error:String(error&&error.name||'FETCH_FAILED')};
    }
  }

  global.PROMETEO_GITHUB_INGRESS_TRANSPORT_V1=Object.freeze({
    schema:SCHEMA,
    mode:'PUBLIC_SANITIZED_CANARY',
    endpoint:ENDPOINT,
    submit
  });

  if(global.document){
    const showBanner=()=>{
      if(document.querySelector('[data-prometeo-public-canary-warning]')) return;
      const host=document.querySelector('[data-prometeo-chat-composer-v1]') || document.querySelector('.composer-shell');
      if(!host) return;
      const note=document.createElement('div');
      note.setAttribute('data-prometeo-public-canary-warning','');
      note.textContent='MODO PÚBLICO CANARY · lo que envíes se publica sanitizado en el repo público. No pegues secretos ni datos sensibles.';
      note.style.cssText='margin:4px 8px 7px;color:#d9b45f;font:9px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;';
      host.parentNode.insertBefore(note,host);
    };
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',showBanner,{once:true}); else showBanner();
  }
})(typeof globalThis!=='undefined'?globalThis:window);
