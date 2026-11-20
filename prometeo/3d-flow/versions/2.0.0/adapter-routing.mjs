// PROMETEO · Studio 3D · adapter manifest audit. Does not connect or install tools.
export const ADAPTER_STATES=['RESEARCHED_ONLY','SOURCE_CANDIDATE','CONTRACT_DEFINED','NOT_CONNECTED','CONNECTED_UNVERIFIED','INSTALLED_TESTED'];
export function validateAdapterDefinition(adapter){
 const errors=[];
 if(typeof adapter?.id!=='string'||!adapter.id)errors.push('MISSING_ID');
 if(!Array.isArray(adapter?.methods)||adapter.methods.length<2)errors.push('METHODS_NOT_DEFINED');
 if(!adapter?.expectedOutput)errors.push('MISSING_OUTPUT_CONTRACT');
 if(!Array.isArray(adapter?.requires)||!adapter.requires.includes('evidenceLevel'))errors.push('EVIDENCE_REQUIREMENT_MISSING');
 if(adapter?.adapterImplemented===true&&adapter?.status!=='INSTALLED_TESTED')errors.push('FALSE_IMPLEMENTED_CLAIM');
 return{ok:errors.length===0,errors};
}
export function routeProductionTool(role,available,toolchain){
 const aliases={
 'CHARACTER':['blender','blockbench','existing-3d-factories'],
 'PROP':['blender','blockbench','poly-haven'],
 'ENVIRONMENT':['blender','poly-haven','existing-3d-factories'],
 'WEB_RUNTIME':['threejs'], 'MECHANICAL':['blender','threejs'],
 'ASSET_OPTIMIZE':['gltf-transform'], 'MATERIAL':['poly-haven','blender'],
 'ANIMATION':['blender','existing-3d-factories'], 'CINEMA':['blender','threejs'],
 'TEXTURE_COMPRESS':['gltf-transform','ktx2-loader']
 };
 const order=aliases[role]||[],listed=(toolchain.tools||[]).filter(x=>order.includes(x.id));
 const permitted=listed.filter(x=>Array.isArray(available)&&available.some(y=>y.id===x.id&&y.connected===true&&y.tested===true));
 permitted.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 const best=permitted[0]||null;
 return{role,status:best?'CONNECTED_TESTED':'NO_CONNECTED_TOOL',chosen:best?.id||null,alternatives:listed.map(x=>({id:x.id,source:x.source,status:x.status})),mustContinueScene:true,doNotClaimExecuted:!best};
}
export function verifyAcquiredAsset(item){
 const issues=[];
 if(!item?.assetId)issues.push('NO_ASSET_ID');
 if(item?.acquired===true&&(!/^[a-f0-9]{64}$/.test(item?.bytesSha256||'')||!item?.sourceUrl))issues.push('CLAIMED_ACQUIRED_WITHOUT_BYTES_PROOF');
 if(item?.imported===true&&(!item?.runtimeInstanceRef||item.acquired!==true))issues.push('CLAIMED_USED_BUT_NOT_VERIFIED_IMPORT');
 if(!item?.rights)issues.push('RIGHTS_UNKNOWN');
 return{ok:issues.length===0,issues,artisticQuality:'NOT_JUDGED',continuesEvenIfMissing:true};
}
