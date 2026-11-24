/* Extracted reusable primitives from chair-03-04/geometry.mjs; originals untouched. */
// Original parametric geometry; adapted closed shells and continuous variable-radius sweep from ARC/HÉLICE. metres, Y up, +Z front.
function library(){
 const v=(a,b)=>a.map((x,i)=>x-b[i]), add=(a,b)=>a.map((x,i)=>x+b[i]), mul=(a,t)=>a.map(x=>x*t), dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]], norm=a=>mul(a,1/Math.hypot(...a));
 function solid(name,material,role,p,uv,i){
  let volume=0;for(let k=0;k<i.length;k+=3){const q=j=>p.slice(i[k+j]*3,i[k+j]*3+3);volume+=dot(q(0),cross(q(1),q(2)))/6;}
  if(volume<0)for(let k=0;k<i.length;k+=3)[i[k+1],i[k+2]]=[i[k+2],i[k+1]];
  return {name,material,role,positions:p,uvs:uv,indices:i};
 }
 function shell(name,mat,role,nu,nv,point,thickness){
  const p=[],uv=[],ix=[],n=(nu+1)*(nv+1);
  for(let f=0;f<2;f++)for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv;const a=point(u,v);p.push(...add(a.p,mul(a.n,-f*thickness)));uv.push(u,v);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;ix.push(a,b,c,b,d,c,a+n,c+n,b+n,b+n,c+n,d+n);}
  const wall=(a,b)=>ix.push(b,a,a+n,b,a+n,b+n);
  for(let i=0;i<nu;i++){wall(i,i+1);const k=nv*(nu+1)+i;wall(k+1,k);}
  for(let j=0;j<nv;j++){const a=j*(nu+1);wall(a+nu,a+2*nu+1);wall(a+nu+1,a);}
  return solid(name,mat,role,p,uv,ix);
 }
 function bez(a,b,c,d,t){const s=1-t;return a.map((x,i)=>s*s*s*x+3*s*s*t*b[i]+3*s*t*t*c[i]+t*t*t*d[i]);}
 function path(segments,steps=12){const p=[];for(const s of segments)for(let i=0;i<=steps;i++)if(i||!p.length)p.push(bez(...s,i/steps));return p;}
 function sweep(name,mat,role,points,radii,sides=24){
  const p=[],uv=[],ix=[];let last=null;
  for(let j=0;j<points.length;j++){const tangent=norm(v(points[Math.min(j+1,points.length-1)],points[Math.max(j-1,0)]));let n=last?norm(v(last,mul(tangent,dot(last,tangent)))):norm(cross(tangent,Math.abs(tangent[2])>.92?[0,1,0]:[0,0,1]));last=n;const b=cross(tangent,n);const [ra,rb]=radii(j/(points.length-1),j);
   for(let k=0;k<sides;k++){const a=2*Math.PI*k/sides;p.push(...add(points[j],add(mul(n,ra*Math.cos(a)),mul(b,rb*Math.sin(a)))));uv.push(k/sides,j/(points.length-1));}}
  for(let j=0;j<points.length-1;j++)for(let k=0;k<sides;k++){const a=j*sides+k,b=j*sides+(k+1)%sides,c=a+sides,d=b+sides;ix.push(a,b,c,b,d,c);}
  for(const end of [0,points.length-1]){const center=p.length/3;p.push(...points[end]);uv.push(.5,end?1:0);for(let k=0;k<sides;k++){const a=end*sides+k,b=end*sides+(k+1)%sides;ix.push(...(end?[center,a,b]:[center,b,a]));}}
  return solid(name,mat,role,p,uv,ix);
 }
 const joint=(from,to,point,type)=>({from,to,point,type});

 return {shell,sweep,path,bez,joint};
}
const {shell,sweep,path,bez,joint}=library();
export {shell,sweep,path,bez,joint};


/* Relational assembly extension, metres, shared coordinate system. Existing primitives unchanged.
 * Ray probes operate on actual mesh triangles, not AABBs. Local evidence only:
 * not a global collision solver, mechanical simulation or aesthetic approval. */
const av=(a,b)=>a.map((x,i)=>x-b[i]), aa=(a,b)=>a.map((x,i)=>x+b[i]), am=(a,s)=>a.map(x=>x*s),
 ad=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0), ac=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit=a=>{const n=Math.hypot(...a);if(!(n>1e-12))throw Error('zero axis');return am(a,1/n);};
const finite3=a=>Array.isArray(a)&&a.length===3&&a.every(Number.isFinite);
export function meshAnchor(mesh,seed,axis,side='entry',reach=.15){
 if(!finite3(seed)||!finite3(axis)||!(reach>0)||!['entry','exit'].includes(side))throw Error('invalid probe');
 const d=unit(axis),hits=[],eps=1e-9;
 for(let i=0;i<mesh.indices.length;i+=3){
  const [a,b,c]=Array.from(mesh.indices.slice(i,i+3),j=>Array.from(mesh.positions.slice(j*3,j*3+3)));
  const e=av(b,a),f=av(c,a),h=ac(d,f),det=ad(e,h);if(Math.abs(det)<eps)continue;
  const s=av(seed,a),u=ad(s,h)/det;if(u<-eps||u>1+eps)continue;
  const q=ac(s,e),v=ad(d,q)/det;if(v<-eps||u+v>1+eps)continue;
  const t=ad(f,q)/det;hits.push({t,normal:unit(ac(e,f)),triangle:i/3});
 }
 hits.sort((a,b)=>a.t-b.t);
 const distinct=[];for(const h of hits){if(!distinct.length||Math.abs(h.t-distinct.at(-1).t)>1e-7)distinct.push(h);}
 // The closest correctly facing surface within the local search window.
 const candidates=distinct.filter(h=>Math.abs(h.t)<=reach&& (side==='entry'?ad(h.normal,d)<-1e-7:ad(h.normal,d)>1e-7));
 candidates.sort((a,b)=>Math.abs(a.t)-Math.abs(b.t));
 const h=candidates[0];return h?{...h,point:aa(seed,am(d,h.t)),axis:d,mesh:mesh.name}:null;
}
export const RELATION_TYPES=Object.freeze(['CONTACTO','ENCASTRE','PASANTE','JUNTA_VISIBLE','HOLGURA','ARTICULACION','SEPARACION_INTENCIONAL']);
const connectedTypes=new Set(['CONTACTO','ENCASTRE','PASANTE','JUNTA_VISIBLE','ARTICULACION']);
export function inspectAssembly(model,{gate}={}){
 const parts=new Map(),issues=[],relations=[],edges=new Map(),surfaces=[];
 const validMesh=p=>p&&typeof p.name==='string'&&p.positions?.length>=9&&p.positions.length%3===0&&p.indices?.length>=3&&p.indices.length%3===0&&Array.from(p.positions).every(Number.isFinite)&&Array.from(p.indices).every(i=>Number.isInteger(i)&&i>=0&&i<p.positions.length/3);
 for(const p of model.parts||[]){if(!validMesh(p)||parts.has(p.name)){issues.push({code:'INVALID_PART',part:p?.name});continue;}parts.set(p.name,p);edges.set(p.name,new Set());}
 const independent=new Set(model.independent||[]),roots=model.roots||[];
 for(const n of [...roots,...independent])if(!parts.has(n))issues.push({code:'UNKNOWN_ROOT_OR_INDEPENDENT',part:n});
 const seen=new Set();
 for(const r of model.relations||[]){
  const row={id:r.id,guest:r.guest,host:r.host,type:r.type,probes:[],ok:false};relations.push(row);
  const bad=code=>{issues.push({code,relation:r.id});row.code=code;};
  if(!r.id||seen.has(r.id)||r.host===r.guest||!parts.has(r.host)||!parts.has(r.guest)||!RELATION_TYPES.includes(r.type)||!Number.isFinite(r.min)||!Number.isFinite(r.max)||r.min>r.max||!r.probes?.length){bad('INVALID_RELATION');continue;}seen.add(r.id);
  if(['PASANTE','HOLGURA','ARTICULACION','SEPARACION_INTENCIONAL','JUNTA_VISIBLE'].includes(r.type)&&!r.reason){bad('MISSING_INTENT');continue;}
  if((r.type==='ENCASTRE'&&r.max>=0)||(r.type==='CONTACTO'&&(r.min<-.002||r.max>.002))||(['HOLGURA','SEPARACION_INTENCIONAL','ARTICULACION'].includes(r.type)&&r.min<0)){bad('INVALID_RANGE_FOR_TYPE');continue;}
  if(r.type==='PASANTE'&&(!r.windows?.length||!r.windows.every(w=>finite3(w.min)&&finite3(w.max)&&w.min.every((v,i)=>v<w.max[i])))){bad('MISSING_LOCAL_WINDOW');continue;}
  try{
   for(const p of r.probes){
    const host=meshAnchor(parts.get(r.host),p.seed,p.axis,'entry',p.reach||.15),guest=meshAnchor(parts.get(r.guest),p.seed,p.axis,'exit',p.reach||.15);
    const gap=host&&guest?host.t-guest.t:null;
    row.probes.push({host,guest,gap,ok:gap!==null&&gap>=r.min-1e-7&&gap<=r.max+1e-7});
   }
  }catch(e){bad('PROBE_ERROR');row.error=e.message;continue;}
  if(!row.probes.every(p=>p.ok)){bad(row.probes.some(p=>p.gap===null)?'ANCHOR_MISSING':'GAP_OR_OVERLAP');continue;}
  row.ok=true;if(connectedTypes.has(r.type)){edges.get(r.host).add(r.guest);edges.get(r.guest).add(r.host);}
 }
 const visited=new Set(),todo=roots.filter(n=>parts.has(n));while(todo.length){const n=todo.pop();if(visited.has(n))continue;visited.add(n);todo.push(...edges.get(n));}
 if(!roots.length)issues.push({code:'MISSING_ROOT'});
 for(const n of parts.keys())if(!visited.has(n)&&!independent.has(n))issues.push({code:'DISCONNECTED_OR_UNDECLARED',part:n});
 // Only declared paired shell faces are covered; through windows are pair-local.
 const boxes=new Map([...parts].map(([n,p])=>{const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];for(let i=0;i<p.positions.length;i++){const k=i%3;lo[k]=Math.min(lo[k],p.positions[i]);hi[k]=Math.max(hi[k],p.positions[i]);}return [n,{lo,hi}];}));
 for(const f of model.protectedFaces||[]){
  const h=parts.get(f.name);if(!h){issues.push({code:'UNKNOWN_PROTECTED_FACE',part:f.name});continue;}
  for(const [n,g] of parts){if(n===f.name)continue;const a=boxes.get(f.name),b=boxes.get(n);if(!a.lo.every((v,i)=>v<=b.hi[i]+.004&&a.hi[i]>=b.lo[i]-.004))continue;
   const windows=(model.relations||[]).filter(r=>r.host===f.name&&r.guest===n&&r.type==='PASANTE'&&relations.some(x=>x.id===r.id&&x.ok)).flatMap(r=>r.windows||[]);
   if(!gate){surfaces.push({host:f.name,guest:n,status:'NOT_RUN'});continue;}
   try{const q=gate(h,g,{faceVertices:f.faceVertices,normalOffset:f.residual??.001,windows});surfaces.push({host:f.name,guest:n,status:q.ok?'PASS_PARTIAL':'FAIL',hits:q.hits});if(!q.ok)issues.push({code:'PROTECTED_SURFACE_INTRUSION',host:f.name,guest:n});}
   catch(e){surfaces.push({host:f.name,guest:n,status:'ERROR',error:e.message});issues.push({code:'SURFACE_ERROR',host:f.name,guest:n});}
  }
 }
 return {name:model.name,status:issues.length?'FAIL':surfaces.some(x=>x.status==='NOT_RUN')?'PARTIAL':'PASS_LOCAL',issues,relations,surfaces,uncovered:'Undeclared faces, collisions away from probes, mechanics, render and aesthetics are not certified'};
}
// Generate the terminal from the actual host face. Positive depth embeds along approach.
export function anchoredSweep({name,material,role='structure',start,host,seed,axis,depth=0,radius,sides=32}){
 if(!Number.isFinite(depth)||!(radius>0))throw Error('invalid terminal');
 const a=meshAnchor(host,seed,axis,'entry');if(!a)throw Error('missing anchor '+host.name);
 const end=aa(a.point,am(a.axis,depth));return {part:sweep(name,material,role,[start,end],()=>[radius,radius],sides),anchor:a,end};
}
// Material-specific geometry recipes, built with the original shell/sweep primitives.
export const formByMaterial={
 metalTube:(name,mat,points,radius)=>sweep(name,mat,'structure',points,()=>[radius,radius],32),
 woodPanel:(name,mat,{width,depth,y,thickness,round=.018})=>{if(!(width>2*round&&depth>2*round&&thickness>0&&round>=0))throw Error('wood dimensions');return shell(name,mat,'panel',24,20,(u,v)=>{const x=2*u-1,z=2*v-1;return {p:[x*(width/2-round*Math.abs(z)**8),y,z*(depth/2-round*Math.abs(x)**8)],n:[0,1,0]};},thickness);},
 fabricPanel:(name,mat,{width,depth,y,sag,thickness})=>shell(name,mat,'fabric',24,24,(u,v)=>{const x=2*u-1,z=2*v-1,dyx=2*sag*x*(1-z*z)/(width/2),dyz=2*sag*z*(1-x*x)/(depth/2);return {p:[x*width/2,y-sag*(1-x*x)*(1-z*z),z*depth/2],n:unit([-dyx,1,-dyz])};},thickness),
 piping:(name,mat,points,radius=.003)=>sweep(name,mat,'seam',points,()=>[radius,radius],12)
};
