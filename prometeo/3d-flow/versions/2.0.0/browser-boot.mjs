// PROMETEO 3D 2.0 · generic source boot helper for future previews.
// No scene is rendered by merely importing this module.
export const BOOT_PHASES=['BOOT','CAPABILITIES','MODULES','ASSETS','SCENE','RENDER','RUNNING'];
export const ERROR_CODES=['NETWORK_FETCH','DECOMPRESSION','MODULE_IMPORT','WEBGL_CONTEXT','SHADER_COMPILE','ASSET_LOAD','RUNTIME','CONTEXT_LOST'];
export function classifyBootError(error,phase){
 const m=String(error?.message||error||'').toLowerCase(),p=String(phase||'').toUpperCase();
 if(/decomp|gzip|inflate|zlib/.test(m))return'DECOMPRESSION';
 if(/network|fetch|http [45]|404|failed to load resource/.test(m)||p==='FETCH')return'NETWORK_FETCH';
 if(/import|module|mime type|dynamic import|cors/.test(m)||p==='MODULES')return'MODULE_IMPORT';
 if(/webgl|context.*unavailable|unsupported gpu/.test(m)||p==='CAPABILITIES')return'WEBGL_CONTEXT';
 if(/shader|glsl|compile/.test(m))return'SHADER_COMPILE';
 if(/gltf|glb|asset|texture|model/.test(m)||p==='ASSETS')return'ASSET_LOAD';
 return'RUNTIME';
}
export function detectWebGL2(canvas){
 if(!canvas||typeof canvas.getContext!=='function')return{ok:false,backend:'NONE',errorCode:'WEBGL_CONTEXT',reason:'NO_CANVAS'};
 try{
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});
  return gl?{ok:true,backend:'WEBGL2',context:gl}:{ok:false,backend:'NONE',errorCode:'WEBGL_CONTEXT',reason:'CONTEXT_CREATION_RETURNED_NULL'};
 }catch(e){return{ok:false,backend:'NONE',errorCode:'WEBGL_CONTEXT',reason:String(e?.message||e)}}
}
export function installContextListeners(canvas,callbacks={}){
 if(!canvas||typeof canvas.addEventListener!=='function')return()=>{};
 const lost=e=>{if(e&&typeof e.preventDefault==='function')e.preventDefault();callbacks.onLost?.('CONTEXT_LOST')};
 const restored=()=>callbacks.onRestored?.();
 canvas.addEventListener('webglcontextlost',lost,false);canvas.addEventListener('webglcontextrestored',restored,false);
 return()=>{canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restored)};
}
export async function bootScene({
 canvas,loadAssets,buildScene,startPlayback,showDiagnostic=()=>{},showFallback=()=>{},clock=()=>Date.now()
}={}){
 let phase='BOOT',timestamps=[],context=null;
 const mark=next=>{phase=next;timestamps.push({phase:next,at:clock()})};
 const error=(e)=>({status:'FAILED',phase,errorCode:classifyBootError(e,phase),reason:String(e?.message||e),timestamps,artisticVerdict:'NOT_EVALUATED',sourceStillDeliverable:true});
 try{
  mark('CAPABILITIES');
  const caps=detectWebGL2(canvas);
  if(!caps.ok){const result={status:'FALLBACK_REQUIRED',phase,errorCode:caps.errorCode,reason:caps.reason,timestamps,artisticVerdict:'NOT_EVALUATED',sourceStillDeliverable:true};showFallback(result);return result}
  context=caps.context;
  mark('ASSETS');const assets=await loadAssets?.();
  mark('SCENE');const scene=await buildScene?.({gl:context,assets});
  mark('RENDER');const result=await startPlayback?.({gl:context,scene,assets});
  mark('RUNNING');
  return{status:'RUNNING',phase,timestamps,backend:'WEBGL2',result,artisticVerdict:'NOT_EVALUATED'};
 }catch(e){
  const result=error(e);showDiagnostic(result);return result;
 }
}
