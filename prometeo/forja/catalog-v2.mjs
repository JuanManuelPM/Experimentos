export const ATLAS="https://raw.githubusercontent.com/Hidencod/tge-assets/3ddcc695adbba9fb918cf31b7c139b3f95b76910/", QUAT="https://raw.githubusercontent.com/JuanManuelPM/Experimentos/4529f6f58e3a08a907e7766c958705a0c1d9830f/prometeo-assets/";
function safePath(path){return typeof path==="string"&&path.split("/").every(x=>x&&x!=="."&&x!==".."&&!/[\u0000-\u001f\\]/.test(x))}
function encodePath(path){if(!safePath(path))throw Error("Ruta inválida");return path.split("/").map(encodeURIComponent).join("/")}
export function reconcile(atlas,quat){
 const models=[],aliases=new Map(),hashes=new Map(),stats={legacy:0,quaternius:0,duplicates:0,unsupported:0,partial:0,rejected:0},seen=new Set();
 for(const p of atlas?.packs||[])for(const m of p.models||[]){
  if(typeof m.id!=="string"||seen.has(m.id)||!safePath(m.file)){stats.rejected++;continue}
  seen.add(m.id);models.push({...m,pack:p.id,packName:p.name,format:"glb",source:"atlas",sourceCommit:ATLAS.split("/")[5],url:ATLAS+encodePath(m.file),thumbUrl:safePath(m.thumb)?ATLAS+encodePath(m.thumb):null,availability:"imported",license:"CC0"});stats.legacy++;
 }
 for(const p of quat?.results||[]){
  if(!["IMPORTED","PARTIAL"].includes(p.status)||!/^CC0(?:-1\.0)?$/i.test(p.license||"")||!safePath(p.folder)||!Number.isInteger(p.id))continue;
  for(const f of [...(p.files||[])].sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0)){
   if(!safePath(f.path)||!/^[a-f0-9]{64}$/i.test(f.sha256||"")){stats.rejected++;continue}
   const format=f.path.split(".").at(-1).toLowerCase();
   if(!["glb","gltf"].includes(format)){stats.unsupported++;continue}
   const id="q:"+p.id+":"+f.path,key=p.id+":"+format+":"+f.sha256;
   if(seen.has(id)){stats.rejected++;continue}seen.add(id);
   if(format==="glb"&&hashes.has(key)){aliases.set(id,hashes.get(key));stats.duplicates++;continue}
   if(format==="glb")hashes.set(key,id);
   models.push({id,name:f.path.split("/").at(-1).replace(/\.[^.]+$/,"").replace(/_/g," "),pack:"q-"+p.id,packName:p.name,format,source:"quaternius",sourceCommit:QUAT.split("/")[5],url:QUAT+encodePath(p.folder+"/"+f.path),thumbUrl:null,availability:p.status.toLowerCase(),license:p.license,sha256:f.sha256,bytes:f.bytes,originalPath:f.path});stats.quaternius++;if(p.status==="PARTIAL")stats.partial++;
  }
 }return {models,aliases:[...aliases],stats};
}
export function normalizeTransform(v){const finite=(n,d)=>Number.isFinite(Number(n))?Number(n):d;const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));const vec=(a,d,lo,hi)=>[0,1,2].map(i=>clamp(finite(Array.isArray(a)?a[i]:a,d),lo,hi));return {r3:Array.isArray(v.r3)?vec(v.r3,0,-Math.PI*8,Math.PI*8):[0,clamp(finite(v.r,0),-Math.PI*8,Math.PI*8),0],s:vec(v.s,1,.05,20)}}
export async function loadCatalog(fetcher=fetch,storage=globalThis.localStorage){
 const load=async(root,key,check)=>{try{const res=await fetcher(root+"catalog.json",{cache:"default"});if(!res.ok)throw Error("HTTP "+res.status);const data=await res.json();if(!check(data))throw Error("esquema inválido");try{storage?.setItem(key,JSON.stringify(data))}catch{}return {data,state:"PINNED_NETWORK"}}catch(e){try{const data=JSON.parse(storage?.getItem(key)||"null");if(check(data))return {data,state:"PINNED_CACHE",error:String(e)}}catch{}return {data:null,state:"UNAVAILABLE",error:String(e)}}};
 const [a,q]=await Promise.all([load(ATLAS,"forja-atlas-"+ATLAS,d=>Array.isArray(d?.packs)),load(QUAT,"forja-quat-"+QUAT,d=>Array.isArray(d?.results))]);return {...reconcile(a.data,q.data),sources:{atlas:a.state,quaternius:q.state}};
}
