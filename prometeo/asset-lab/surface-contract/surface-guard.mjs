// PROMETEO: guard existing procedural Three.js mesh buffers, metres.
const E=1e-8,sub=(a,b)=>a.map((x,i)=>x-b[i]),add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,s)=>a.map(x=>x*s);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len=a=>Math.hypot(...a),unit=a=>mul(a,1/len(a));
const vec=x=>Array.isArray(x)&&x.length===3&&x.every(Number.isFinite);
function box(ps){const b={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};for(const p of ps)for(let i=0;i<3;i++){b.min[i]=Math.min(b.min[i],p[i]);b.max[i]=Math.max(b.max[i],p[i]);}return b;}
const overlap=(a,b)=>a.min.every((x,i)=>x<=b.max[i]+E&&a.max[i]>=b.min[i]-E);
const inBox=(p,b)=>p.every((x,i)=>x>=b.min[i]-E&&x<=b.max[i]+E);
const bary=(p,t)=>{const a=sub(t[1],t[0]),b=sub(t[2],t[0]),q=sub(p,t[0]),aa=dot(a,a),bb=dot(b,b),ab=dot(a,b),d=aa*bb-ab*ab,u=(bb*dot(q,a)-ab*dot(q,b))/d,v=(aa*dot(q,b)-ab*dot(q,a))/d;return [1-u-v,u,v];};
const onTri=(p,t)=>inBox(p,t.b)&&Math.abs(dot(sub(p,t[0]),t.n))<=E&&bary(p,t).every(x=>x>=-E);
function triangle(t){t.n=unit(cross(sub(t[1],t[0]),sub(t[2],t[0])));t.b=box(t);if(!vec(t.n))throw Error('DEGENERATE_TRIANGLE');return t;}
function mesh(part){
 const p=part.positions,ix=part.indices;
 if(!p?.length||p.length%3||!ix?.length||ix.length%3||!Array.from(p).every(Number.isFinite))throw Error('INVALID_BUFFER:'+part.name);
 const pts=Array.from({length:p.length/3},(_,i)=>Array.from(p.slice(i*3,i*3+3)));
 const edges=new Map(),ts=[];
 for(let i=0;i<ix.length;i+=3){const ids=Array.from(ix.slice(i,i+3));if(ids.some(k=>!Number.isInteger(k)||!pts[k]))throw Error('INVALID_INDEX:'+part.name);
  ts.push(triangle(ids.map(k=>pts[k])));for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],k=Math.min(a,b)+':'+Math.max(a,b);edges.set(k,(edges.get(k)||0)+1);}}
 if([...edges.values()].some(n=>n!==2))throw Error('OPEN_MESH:'+part.name);
 return {name:part.name,pts,ts,ix,b:box(pts)};
}
function boundary(m,p){return inBox(p,m.b)&&m.ts.some(t=>onTri(p,t));}
function inside(m,p){
 if(!inBox(p,m.b)||boundary(m,p))return false;
 const d=unit([1,.371,.197]),hits=[];
 for(const t of m.ts){const a=sub(t[1],t[0]),b=sub(t[2],t[0]),h=cross(d,b),det=dot(a,h);if(Math.abs(det)<1e-13)continue;
 const s=sub(p,t[0]),u=dot(s,h)/det,q=cross(s,a),v=dot(d,q)/det,z=dot(b,q)/det;
 if(u>=-E&&v>=-E&&u+v<=1+E&&z>E)hits.push(z);}
 hits.sort((a,b)=>a-b);return hits.filter((z,i)=>!i||z-hits[i-1]>E).length%2===1;
}
// Exact linear clipping of a slice segment against the three host triangle edges.
function clip(a,b,t){const x=bary(a,t),y=bary(b,t);let lo=0,hi=1;for(let i=0;i<3;i++){const d=y[i]-x[i];if(Math.abs(d)<1e-14){if(x[i]<-E)return null;}else{const q=(-E-x[i])/d;if(d>0)lo=Math.max(lo,q);else hi=Math.min(hi,q);}}return hi-lo>E?[add(a,mul(sub(b,a),lo)),add(a,mul(sub(b,a),hi))]:null;}
function witnesses(t,g){
 if(!overlap(t.b,g.b))return [];
 const out=[];for(const p of [...t,mul(add(add(t[0],t[1]),t[2]),1/3)])if(inside(g,p))out.push(p);
 for(const q of g.ts){if(!overlap(t.b,q.b))continue;const s=q.map(p=>dot(sub(p,t[0]),t.n));
  if(Math.min(...s)>=-E||Math.max(...s)<=E)continue;
  const ps=[];for(let i=0;i<3;i++){const j=(i+1)%3;if(Math.abs(s[i])<=E)ps.push(q[i]);if(s[i]*s[j]<-E*E)ps.push(add(q[i],mul(sub(q[j],q[i]),s[i]/(s[i]-s[j]))));}
  if(ps.length>=2){const c=clip(ps[0],ps[1],t);if(c&&len(sub(c[0],c[1]))>E)out.push(...c);}
 }
 return out;
}
const validZone=z=>z&&vec(z.center)&&Number.isFinite(z.radius)&&z.radius>E;
const inZone=(p,z)=>len(sub(p,z.center))<=z.radius+E;
function face(m,i,s,depth){
 const t=m.ts[i];let n=t.n;
 if(s.oppositeVertexOffset!==undefined){const k=s.oppositeVertexOffset;if(!Number.isInteger(k)||k<=0)throw Error('INVALID_OPPOSITE_OFFSET');
 const ids=Array.from(m.ix.slice(3*i,3*i+3)),q=ids.map(j=>m.pts[j+k]);if(q.some(p=>!p))throw Error('INVALID_OPPOSITE_VERTEX');
 const d=dot(n,sub(t[0],q[0]));if(Math.abs(d)<=E)throw Error('AMBIGUOUS_NORMAL');if(d<0)n=mul(n,-1);
 if(depth>=Math.abs(d)-E)throw Error('RESIDUAL_EXCEEDS_LOCAL_THICKNESS');
 }else{if(!vec(s.outward)||!len(s.outward)||Math.abs(dot(n,unit(s.outward)))<.01)throw Error('AMBIGUOUS_NORMAL');if(dot(n,s.outward)<0)n=mul(n,-1);}
 return triangle(t.map(p=>sub(p,mul(n,depth))));
}
export function inspectSurfaces(model,contract){
 const errors=[],hits=[],fail=(code,detail={})=>errors.push({code,...detail});
 try{
 if(model.unit&&model.unit!=='metre')throw Error('UNIT_NOT_METRE');
 if(!contract||!Array.isArray(contract.surfaces)||!contract.surfaces.length||!Array.isArray(contract.connections)||!contract.exempt)throw Error('MISSING_SURFACE_CONTRACT');
 const mm=new Map();for(const p of model.parts){if(mm.has(p.name))throw Error('DUPLICATE_PART');mm.set(p.name,mesh(p));}
 const surfaces=new Set(),coverage=new Set(),passes=new Set();
 for(const s of contract.surfaces){
  if(!mm.has(s.host)||!s.id||surfaces.has(s.id)||!Array.isArray(s.triangles)||!s.triangles.length||!Number.isFinite(s.residual)||s.residual<=E)throw Error('INVALID_SURFACE');
  surfaces.add(s.id);coverage.add(s.host);
  if(s.triangles.some(i=>!Number.isInteger(i)||!mm.get(s.host).ts[i]))throw Error('INVALID_FACE_INDEX');
 }
 for(const [name,why] of Object.entries(contract.exempt)){if(!mm.has(name)||coverage.has(name)||typeof why!=='string'||!why.trim())throw Error('INVALID_EXEMPTION');coverage.add(name);}
 for(const name of mm.keys())if(!coverage.has(name))throw Error('UNCLASSIFIED_PART:'+name);
 const cs=contract.connections;
 for(const c of cs){const h=mm.get(c.host),g=mm.get(c.guest);
  if(!h||!g||h===g||!vec(c.anchor)||!validZone(c.zone)||!inZone(c.anchor,c.zone)||!['CONTACTO','ENCASTRE_OCULTO','PASANTE_INTENCIONAL'].includes(c.mode))throw Error('INVALID_CONNECTION');
  if(c.mode==='PASANTE_INTENCIONAL'&&!contract.surfaces.some(s=>s.id===c.surface&&s.host===c.host))throw Error('INVALID_PASS_SURFACE');
  if(c.mode==='CONTACTO'){
   if(!boundary(h,c.anchor)||!boundary(g,c.anchor))fail('CONTACT_MISSING',{host:c.host,guest:c.guest});
   if(h.pts.some(p=>inside(g,p))||g.pts.some(p=>inside(h,p))||h.ts.some(t=>witnesses(t,g).length))fail('CONTACT_PENETRATION',{host:c.host,guest:c.guest});
  }else{
   if(!inside(h,c.anchor)||!inside(g,c.anchor))fail('JOINT_ANCHOR_NOT_INTERIOR',{host:c.host,guest:c.guest});
   for(const t of h.ts)if(witnesses(t,g).some(p=>!inZone(p,c.zone))){fail('JOINT_OUTSIDE_ZONE',{host:c.host,guest:c.guest});break;}
  }
 }
 for(const s of contract.surfaces){const h=mm.get(s.host);
  for(const g of mm.values()){if(g===h)continue;const rejected=new Set();for(const i of s.triangles){
   const skin=face(h,i,s,0),inner=face(h,i,s,s.residual);
   const allowed=cs.filter(c=>c.mode==='PASANTE_INTENCIONAL'&&c.host===h.name&&c.guest===g.name&&c.surface===s.id);
   for(const [kind,t] of [['surface',skin],['residual',inner]]){const ws=witnesses(t,g);if(!ws.length)continue;
    const bad=ws.find(p=>!allowed.some(c=>inZone(p,c.zone)));
    if(bad&&!rejected.has(kind)){rejected.add(kind);const hit={surface:s.id,host:h.name,guest:g.name,triangle:i,kind,point:bad};hits.push(hit);fail('PROTECTED_SURFACE_INTRUSION',hit);}
    if(kind==='surface')for(const c of allowed)if(ws.every(p=>inZone(p,c.zone)))passes.add(c);
   }
  }}
 }
 for(const c of cs)if(c.mode==='PASANTE_INTENCIONAL'&&!passes.has(c))fail('PASS_NOT_DEMONSTRATED',{host:c.host,guest:c.guest});
 }catch(e){fail('INVALID_CONTRACT_OR_MESH',{message:String(e.message||e)});}
 return {ok:errors.length===0,errors,hits};
}
// Existing producer boundary: no model returned for rendering/export on failure.
export function guardedGenerate(generate,declare,...args){
 const model=generate(...args),report=inspectSurfaces(model,declare(model));
 if(!report.ok){const e=Error('SURFACE_CONTRACT_REJECTED');e.report=report;throw e;}
 return {model,report};
}
