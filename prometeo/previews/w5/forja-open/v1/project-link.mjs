// FORJA W5/03: safe links, no remote writes or private token.
export function resolvePublicSceneURL(raw,baseHref){
 if(typeof raw!=='string'||!raw.trim()||raw.length>2048)throw Error('ENLACE VACÍO O DEMASIADO LARGO');
 let u;try{u=new URL(raw,baseHref)}catch{throw Error('ENLACE INVÁLIDO')}
 const p=u.pathname;
 const pages=u.origin==='https://juanmanuelpm.github.io'&&p.startsWith('/Experimentos/prometeo/');
 const rawGithub=u.origin==='https://raw.githubusercontent.com'&&p.startsWith('/JuanManuelPM/Experimentos/gh-pages/prometeo/');
 if((!pages&&!rawGithub)||u.username||u.password||u.hash||u.search||/%2f|%5c/i.test(p)||!p.endsWith('.json'))throw Error('SOLO JSON PÚBLICO AUTORIZADO DE EXPERIMENTOS');
 return u.href;
}
export async function fetchSceneJSON(url,fetcher=fetch){
 const limit=2000000, controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{
  const r=await fetcher(url,{credentials:'omit',redirect:'error',mode:'cors',cache:'no-store',signal:controller.signal});
  if(!r.ok)throw Error('HTTP '+r.status);
  if(/text\/html/i.test(r.headers.get('content-type')||''))throw Error('EL ENLACE DEVOLVIÓ HTML');
  if(Number(r.headers.get('content-length')||0)>limit)throw Error('PROYECTO MAYOR A 2 MB');
  let bytes;
  if(r.body&&typeof r.body.getReader==='function'){
   const reader=r.body.getReader(),parts=[];let size=0;
   while(true){const {done,value}=await reader.read();if(done)break;
    size+=value.byteLength;if(size>limit){await reader.cancel();throw Error('PROYECTO MAYOR A 2 MB')}
    parts.push(value);
   }
   bytes=new Uint8Array(size);let offset=0;
   for(const part of parts){bytes.set(part,offset);offset+=part.length}
  }else{
   const body=await r.arrayBuffer();if(body.byteLength>limit)throw Error('PROYECTO MAYOR A 2 MB');
   bytes=new Uint8Array(body);
  }
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 }finally{clearTimeout(timer)}
}
