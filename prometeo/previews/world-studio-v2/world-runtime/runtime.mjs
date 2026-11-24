export const SCHEMA="prometeo.world.scene/v1";
export const key=(x,z)=>x+","+z;
export const coord=(x,z,s)=>[Math.floor(x/s),Math.floor(z/s)];
const vector=(v,n=3)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);
const id=v=>typeof v==="string"&&/^[a-zA-Z0-9_.:-]{1,120}$/.test(v);
const check=(v,e)=>{if(!v)throw Error(e)};
const canceled=()=>Object.assign(Error("Cancelled"),{name:"AbortError"});
export function validate(m){
 check(m?.schema===SCHEMA&&id(m.id)&&Number.isFinite(m.sectorSize)&&m.sectorSize>=2&&m.sectorSize<=1024,"SCHEMA");
 check(vector(m.spawn?.position)&&Number.isFinite(m.spawn.yaw),"SPAWN");
 check(m.assets&&typeof m.assets==="object"&&!Array.isArray(m.assets)&&Array.isArray(m.sectors)&&m.sectors.length>0&&m.sectors.length<=10000,"COLLECTIONS");
 const assets=new Map(Object.entries(m.assets)),sectors=new Map(),ids=new Set(),boxes=new Map(),spatial=new Map();
 check(assets.size<=4096,"ASSET_BUDGET");
 for(const [k,a] of assets){
  check(id(k)&&a&&["glb","gltf"].includes(a.format)&&/^[a-f0-9]{40}$/.test(a.sourceCommit)&&typeof a.license==="string"&&a.license.trim(),"ASSET:"+k);
  const prefix="https://raw.githubusercontent.com/JuanManuelPM/Experimentos/"+a.sourceCommit+"/";
  check(typeof a.url==="string"&&a.url.startsWith(prefix)&&!/[\\?#]/.test(a.url),"URL:"+k);
  let path=decodeURIComponent(a.url.slice(prefix.length));
  check(!/[\\?#%\x00-\x1f]/.test(path)&&path.split("/").every(p=>p&&p!==".."&&p!==".")&&path.toLowerCase().endsWith("."+a.format),"PATH:"+k);
 }
 for(const s of m.sectors){
  check(s&&id(s.id)&&!ids.has(s.id)&&vector(s.coord,2)&&s.coord.every(n=>Number.isInteger(n)&&Math.abs(n)<=100000),"SECTOR");
  ids.add(s.id);let k=key(...s.coord);check(!sectors.has(k),"DUP_COORD");sectors.set(k,s);
  check(Array.isArray(s.instances)&&Array.isArray(s.colliders)&&s.instances.length<=2048&&s.colliders.length<=2048,"SECTOR_BUDGET");
  for(const i of s.instances){
   check(i&&id(i.id)&&!ids.has(i.id)&&assets.has(i.assetId)&&vector(i.position)&&vector(i.rotation)&&vector(i.scale)&&i.scale.every(n=>n>0&&n<=1000)&&(i.clip===undefined||typeof i.clip==="string"),"INSTANCE:"+i?.id);
   check(key(...coord(i.position[0],i.position[2],m.sectorSize))===k,"INSTANCE_OWNER");ids.add(i.id);
  }
  for(const b of s.colliders){
   check(b&&id(b.id)&&vector(b.min)&&vector(b.max)&&b.min.every((v,i)=>v<b.max[i]),"COLLIDER");
   const old=boxes.get(b.id);check(!old||JSON.stringify(old.min)===JSON.stringify(b.min)&&JSON.stringify(old.max)===JSON.stringify(b.max),"COLLIDER_CONFLICT");boxes.set(b.id,b);
  }
 }
 for(const b of boxes.values()){
  const [a,z]=coord(b.min[0],b.min[2],m.sectorSize),[c,d]=coord(b.max[0]-1e-8,b.max[2]-1e-8,m.sectorSize);
  check((c-a+1)*(d-z+1)<=256,"COLLIDER_SPAN");
  for(let x=a;x<=c;x++)for(let j=z;j<=d;j++){let k=key(x,j);if(!spatial.has(k))spatial.set(k,[]);spatial.get(k).push(b)}
 }
 check(sectors.has(key(...coord(m.spawn.position[0],m.spawn.position[2],m.sectorSize))),"SPAWN_OUTSIDE");
 return {manifest:m,assets,sectors,spatial};
}
export function nearby(w,x,z,r=.32){
 const s=w.manifest.sectorSize,found=new Map(),[a,b]=coord(x-r,z-r,s),[c,d]=coord(x+r,z+r,s);
 for(let i=a;i<=c;i++)for(let j=b;j<=d;j++)for(const box of w.spatial.get(key(i,j))||[])found.set(box.id,box);
 return [...found.values()];
}
export function stepPlayer(w,p,dx,dz,dt,ready=()=>true){
 const r=.32,h=1.72,s=w.manifest.sectorSize,eps=1e-5;
 const overlaps=(b,x,z)=>x+r>b.min[0]+eps&&x-r<b.max[0]-eps&&z+r>b.min[2]+eps&&z-r<b.max[2]-eps;
 const allowed=(x,z,y)=>{
  for(const a of [-r,r])for(const b of [-r,r]){const k=key(...coord(x+a,z+b,s));if(!w.sectors.has(k)||!ready(k))return false}
  return !nearby(w,x,z,r).some(b=>overlaps(b,x,z)&&y+h>b.min[1]+eps&&y<b.max[1]-eps);
 };
 dt=Math.max(0,Math.min(dt,.1));const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz),dt*12)/(.5*r)));
 let {x,y,z}=p,vy=p.vy||0;
 for(let i=0;i<steps;i++){
  if(allowed(x+dx/steps,z,y))x+=dx/steps;
  if(allowed(x,z+dz/steps,y))z+=dz/steps;
  vy-=9.81*dt/steps;let ny=y+vy*dt/steps;
  for(const b of nearby(w,x,z,r))if(overlaps(b,x,z)){
   if(vy<=0&&y>=b.max[1]-eps&&ny<=b.max[1]){ny=b.max[1];vy=0}
   else if(vy>0&&y+h<=b.min[1]+eps&&ny+h>=b.min[1]){ny=b.min[1]-h;vy=0}
  }
  y=ny;
 }
 if(y<w.manifest.spawn.position[1]-25){[x,y,z]=w.manifest.spawn.position;vy=0}
 return {x,y,z,vy};
}
export class ModelCache{
 constructor({load,dispose,limit=12,idleMs=1500,clock=()=>Date.now(),controller=()=>new AbortController()}){
  check(Number.isInteger(limit)&&limit>0,"MODEL_BUDGET");Object.assign(this,{load,dispose,limit,idleMs,clock,controller});this.entries=new Map();this.stats={loads:0,hits:0,evictions:0,cancelled:0,lateDisposals:0};
 }
 trim(force=false){
  for(const e of [...this.entries.values()].filter(e=>!e.refs&&e.value).sort((a,b)=>a.last-b.last))if((force&&this.entries.size>=this.limit)||this.clock()-e.last>=this.idleMs){this.entries.delete(e.id);this.dispose(e.value);this.stats.evictions++}
 }
 acquire(id,asset,signal){
  if(signal?.aborted)return Promise.reject(canceled());
  let e=this.entries.get(id);
  if(!e){
   this.trim(true);if(this.entries.size>=this.limit)return Promise.reject(Error("MODEL_BUDGET"));
   e={id,refs:0,ctrl:this.controller(),last:this.clock(),value:null};this.entries.set(id,e);this.stats.loads++;
   e.promise=Promise.resolve().then(()=>this.load(asset,e.ctrl.signal)).then(v=>{if(this.entries.get(id)!==e){this.dispose(v);this.stats.lateDisposals++;throw canceled()}e.value=v;return v},err=>{if(this.entries.get(id)===e)this.entries.delete(id);throw err});e.promise.catch(()=>{});
  }else this.stats.hits++;
  e.refs++;
  return new Promise((resolve,reject)=>{
   let released=false,settled=false;
   const release=()=>{if(released)return;released=true;signal?.removeEventListener("abort",cancel);e.refs--;e.last=this.clock();if(!e.refs&&!e.value&&this.entries.get(id)===e){this.entries.delete(id);e.ctrl.abort();this.stats.cancelled++}};
   const cancel=()=>{release();if(!settled){settled=true;reject(canceled())}};
   signal?.addEventListener("abort",cancel,{once:true});
   e.promise.then(value=>{if(!settled){settled=true;resolve({value,release})}},err=>{if(!settled){settled=true;release();reject(err)}});
  });
 }
 close(){for(const e of this.entries.values()){if(e.value)this.dispose(e.value);else e.ctrl.abort()}this.entries.clear()}
}
export class Streamer{
 constructor(world,adapter,{radius=1,retain=2,sectorLimit=12,parallel=2,holdMs=750,retryMs=1500,clock=()=>Date.now(),controller=()=>new AbortController()}={}){
  check(Number.isInteger(radius)&&radius>=1&&Number.isInteger(retain)&&retain>=radius&&Number.isInteger(sectorLimit)&&sectorLimit>=(2*radius+1)**2&&Number.isInteger(parallel)&&parallel>=1,"STREAM_BUDGET");
  Object.assign(this,{world,adapter,radius,retain,sectorLimit,parallel,holdMs,retryMs,clock,controller});
  this.live=new Map();this.errors=new Map();this.pending=new Set();this.center=null;this.desired=new Set();this.visited=new Set();this.stats={attached:0,detached:0,cancelled:0,peak:0};this.closed=false;
 }
 ready(k){return this.live.get(k)?.status==="ready"}
 update(x,z,dx=0,dz=0){
  if(this.closed)return;const [cx,cz]=coord(x,z,this.world.manifest.sectorSize),now=this.clock();this.center=key(cx,cz);this.visited.add(this.center);
  const near=[],extra=[];
  for(let a=-this.retain;a<=this.retain;a++)for(let b=-this.retain;b<=this.retain;b++){
   const k=key(cx+a,cz+b);if(!this.world.sectors.has(k))continue;const distance=Math.max(Math.abs(a),Math.abs(b)),p=Math.abs(a)+Math.abs(b)-.25*(a*Math.sign(dx)+b*Math.sign(dz));
   if(distance<=this.radius)near.push({k,p});else if((this.live.has(k)&&now-this.live.get(k).wantedAt<=this.holdMs)||(a*Math.sign(dx)+b*Math.sign(dz)>1))extra.push({k,p});
  }
  near.sort((a,b)=>a.p-b.p);extra.sort((a,b)=>a.p-b.p);const ordered=[...near,...extra].slice(0,this.sectorLimit);this.desired=new Set(ordered.map(a=>a.k));
  for(const [k,e] of this.live){if(!this.desired.has(k))this.drop(k,e);else if(near.some(a=>a.k===k))e.wantedAt=now}
  for(const {k} of ordered){if(this.pending.size>=this.parallel||this.live.size>=this.sectorLimit)break;if(this.live.has(k)||(this.errors.get(k)?.retryAt||0)>now)continue;this.start(k,now)}
 }
 start(k,now){
  const e={ctrl:this.controller(),status:"loading",wantedAt:now,value:null};this.live.set(k,e);this.pending.add(e);this.stats.peak=Math.max(this.stats.peak,this.live.size);
  Promise.resolve().then(()=>this.adapter.build(this.world.sectors.get(k),e.ctrl.signal)).then(value=>{
   if(this.closed||this.live.get(k)!==e||e.ctrl.signal.aborted){this.adapter.destroy(value);return}
   e.value=value;this.adapter.attach(value);e.status="ready";this.errors.delete(k);this.stats.attached++;
  }).catch(err=>{if(this.live.get(k)===e){this.live.delete(k);if(e.value)this.adapter.destroy(e.value);if(!e.ctrl.signal.aborted)this.errors.set(k,{message:String(err.message||err),retryAt:this.clock()+this.retryMs})}}).finally(()=>this.pending.delete(e));
 }
 drop(k,e){this.live.delete(k);if(e.status==="ready"){this.adapter.detach(e.value);this.adapter.destroy(e.value);this.stats.detached++}else{e.ctrl.abort();this.stats.cancelled++}}
 close(){this.closed=true;for(const [k,e] of this.live)this.drop(k,e)}
}
