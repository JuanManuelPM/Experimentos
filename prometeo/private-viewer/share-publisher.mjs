// Local publisher candidate for a single non-sensitive, immutable GLB publication.
import { randomBytes } from 'node:crypto';
import { mkdir, mkdtemp, writeFile, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { seal, open } from './delivery-core.mjs';
export async function publishSingle(directory,bytes,{workId,revision,mime='model/gltf-binary',authorized=false}={}){
  if(authorized!==true)throw Error('Explicit sharing authorization required');
  if(mime!=='model/gltf-binary')throw Error('Single GLB only');
  const shareId=randomBytes(24).toString('hex');
  const sealed=await seal(bytes,{shareId,workId,revision,mime});
  const check=await open(sealed.descriptor,sealed.ciphertext,sealed.key,shareId);
  if(!check.every((x,i)=>x===bytes[i])||check.length!==bytes.length)throw Error('Readback mismatch');
  await mkdir(directory,{recursive:true,mode:0o700});
  const tmp=await mkdtemp(join(directory,'.staging-'));
  try{
    await writeFile(join(tmp,'descriptor.json'),JSON.stringify(sealed.descriptor),{flag:'wx',mode:0o600});
    await writeFile(join(tmp,'payload.bin'),sealed.ciphertext,{flag:'wx',mode:0o600});
    await rename(tmp,join(directory,shareId));
  }catch(e){await rm(tmp,{recursive:true,force:true});throw e;}
  return {shareId,fragment:'#share='+shareId+'&k='+sealed.key}; // never persist or print this value
}
