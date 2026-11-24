export function safePath(p){return typeof p==="string"&&p.split("/").every(x=>x&&x!=="."&&x!==".."&&!/[\\\u0000-\u001f]/.test(x))}

export function encodePath(p){if(!safePath(p))throw Error("Ruta inválida");return p.split("/").map(encodeURIComponent).join("/")}

export function norm(s){return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[_-]+/g," ")}

export function extension(p){return p.split(".").pop().toLowerCase()}

export function variantKey(p){return p.split("/").filter(s=>!/^(?:glb|gltf(?:\s*\([^)]*\))?|fbx|obj|blend)$/i.test(s)).join("/").replace(/\.[^.]+$/,"")}

export function anim(f){return Array.isArray(f.animations)?(f.animations.length?"yes":"no"):Number.isInteger(f.animations)?(f.animations>0?"yes":"no"):"unknown"}

export function supported(f){return ["glb","gltf","fbx"].includes(f.format)}

export function normalizeQ(data,root){
 if(!Array.isArray(data.results))throw Error("Catálogo Quaternius inválido");
 const items=[],packs=[];let skipped=0;
 for(const p of data.results){
  const pack={id:String(p.id),name:p.name,category:p.category||"Sin categoría",status:p.status==="IMPORTED"?"imported":p.status==="PARTIAL"?"partial":"missing",official:p.official,license:p.license,coverage:p.coverage||p.error||"",source:p.source};
  packs.push(pack);const groups=new Map();
  if(pack.status!=="missing"&&safePath(p.folder))for(const f of p.files||[]){
   if(!safePath(f.path)){skipped++;continue}const format=extension(f.path);if(!["glb","gltf","fbx","obj","blend","dae","stl"].includes(format)){skipped++;continue}
   const v={format,path:f.path,url:root+encodePath(p.folder+"/"+f.path),bytes:f.bytes,hash:f.sha256,animation:anim(f),sourceFile:f.sourcePath||f.path};
   const key=variantKey(f.path),bucket=groups.get(key)||[];let group=bucket.find(g=>!g.variants.some(v=>v.format===format));
   if(!group){group={id:"q:"+pack.id+":"+key+":"+bucket.length,name:key.split("/").pop(),pack,variants:[],source:"quaternius"};bucket.push(group);groups.set(key,bucket)}
   group.variants.push(v);
  }
  for(const bucket of groups.values())for(const g of bucket){g.variants.sort((a,b)=>["glb","gltf","fbx","obj","blend"].indexOf(a.format)-["glb","gltf","fbx","obj","blend"].indexOf(b.format));items.push(g)}
  if(!items.some(i=>i.pack===pack))items.push({id:"q:"+pack.id+":missing",name:pack.name,pack,variants:[],source:"quaternius"});
 }
 return {items,packs,skipped};
}

export function normalizeAtlas(data,root){
 if(!Array.isArray(data.packs))throw Error("Atlas inválido");const items=[],packs=[];
 for(const p of data.packs){const pack={id:String(p.id),name:p.name,category:p.name,status:"atlas",license:"CC0 (según atlas original)"};packs.push(pack);
 for(const m of p.models||[]){if(!safePath(m.file))continue;items.push({id:"a:"+m.id,name:m.name,pack,source:"atlas",thumb:safePath(m.thumb)?root+encodePath(m.thumb):null,variants:[{format:extension(m.file),url:root+encodePath(m.file),path:m.file,bytes:m.size,animation:"unknown"}]})}}
 return {items,packs};
}

export function statusOf(i){return !i.variants.length?"missing":!i.variants.some(supported)?"unsupported":i.pack.status}

export function matches(i,f){const hay=norm([i.name,i.pack.name,i.pack.category,...i.variants.map(v=>v.path)].join(" "));return norm(f.q).trim().split(/\s+/).every(t=>hay.includes(t))&&(!f.pack||i.pack.id===f.pack)&&(!f.category||i.pack.category===f.category)&&(!f.status||statusOf(i)===f.status)&&(!f.format||i.variants.some(v=>v.format===f.format))&&(!f.animation||i.variants.some(v=>(!f.format||v.format===f.format)&&v.animation===f.animation))}

export function pageOf(items,page,size=24){const pages=Math.max(1,Math.ceil(items.length/size));page=Math.max(1,Math.min(pages,page));return {pages,page,items:items.slice((page-1)*size,page*size)}}

export function makeGate(){let generation=0;return {next:()=>++generation,current:n=>n===generation,cancel:()=>++generation}}