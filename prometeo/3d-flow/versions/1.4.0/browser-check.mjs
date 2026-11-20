// Static early-warning for mobile web preview boot. NOT a renderer and NEVER grounds a cancellation.
export function inspectBrowserEntrypoint(html){
 const findings=[];
 const has=(pattern)=>pattern.test(html||'');
 const compressed=has(/DecompressionStream\s*\(/)&&has(/\.mjs\.gz|\.js\.gz/);
 const directModule=has(/<script\b[^>]*\btype\s*=\s*['"]module['"][^>]*\bsrc\s*=/i)||has(/<script\b[^>]*\bsrc\s*=[^>]*\btype\s*=\s*['"]module['"]/i);
 const blobImport=has(/URL\.createObjectURL\s*\(/)&&has(/\bimport\s*\(\s*moduleURL|\bimport\s*\(\s*blob/i);
 const globalErrors=has(/unhandledrejection/)&&has(/addEventListener\s*\(\s*['"]error/);
 const errorTag=has(/id=['"](?:error|notice)['"]/);
 const webgl2Only=has(/getContext\s*\(\s*['"]webgl2['"]/)&&!has(/getContext\s*\(\s*['"]webgl['"]/);
 const genericGzipError=compressed&&has(/No se pudo iniciar WebGL2|WebGL no disponible/);
 if(compressed&&!directModule)findings.push({code:'ONLY_COMPRESSED_BOOT_ENTRY',severity:'HIGH',remedy:'Prefer direct normal .mjs plus same-origin assets; compressed variant optional, not sole source.'});
 if(blobImport)findings.push({code:'BLOB_DYNAMIC_MODULE_IMPORT',severity:'HIGH',remedy:'Use static ES modules with normal relative imports; blob URLs can break module asset resolution and CSP.'});
 if(genericGzipError)findings.push({code:'CONFLATED_BOOT_ERROR',severity:'HIGH',remedy:'Classify FETCH, DECOMPRESSION, MODULE, SHADER and WEBGL failures separately and expose actual class.'});
 if(webgl2Only)findings.push({code:'WEBGL2_ONLY_WITHOUT_WEBGL1',severity:'MEDIUM',remedy:'Feature-test and provide WebGL1 adapter, or honest low-tech poster/2D preview if appropriate.'});
 if(!errorTag)findings.push({code:'NO_VISIBLE_ERROR_TARGET',severity:'MEDIUM',remedy:'Accessible diagnostic overlay with errors, never blank.'});
 if(!globalErrors)findings.push({code:'NO_GLOBAL_BOOT_TELEMETRY',severity:'LOW',remedy:'Capture script, promise and context creation errors, with public status.'});
 return{ok:findings.filter(x=>x.severity==='HIGH').length===0,findings,continueFullProduction:true,whatThisProves:'Static risk classification only: cannot prove physical browser failure or identify the exact cause on Android.'};
}
