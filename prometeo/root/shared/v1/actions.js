/* Contextual actions: copy is local, never starts a job. */
const custom=new Map();
export function registerAction(id,handler){
 if(!/^[a-z0-9-]+$/.test(id)||typeof handler!=='function'||['copy','open'].includes(id))throw Error('Invalid action');
 custom.set(id,handler);return ()=>custom.delete(id);
}
export function safeURL(value){
 if(typeof value!=='string'||!value.trim())return null;
 try{const url=new URL(value,location.href);
 if(!['https:','http:'].includes(url.protocol)||(url.protocol==='http:'&&url.origin!==location.origin)||value.trim().startsWith('//'))return null;
 return url.href;}catch{return null;}
}
export async function copyValue(value){
 if(typeof value!=='string'||!value)return false;
 try{await navigator.clipboard.writeText(value);return true;}catch{
 const box=document.createElement('textarea');box.value=value;box.style.cssText='position:fixed;top:-2000px';document.body.append(box);box.select();
 let ok=false;try{ok=document.execCommand('copy');}catch{}box.remove();return ok;
 }}
export function wasCopied(key){try{return localStorage.getItem('prometeo:copied:work:'+key)==='1';}catch{return false;}}
export function recordCopied(key){try{localStorage.setItem('prometeo:copied:work:'+key,'1');}catch{}}
export async function runAction(action){
 if(!action||typeof action!=='object')return false;
 if(action.kind==='copy')return copyValue(action.value);
 if(action.kind==='open'){const url=safeURL(action.url);if(!url)return false;window.open(url,'_blank','noopener,noreferrer');return true;}
 if(custom.has(action.kind))return Boolean(await custom.get(action.kind)(action));return false;
}
