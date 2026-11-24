// Exact non-coplanar triangle crossing on CPU-deformed mesh positions.
// Counts are diagnostic; allowed seams and overlays must be classified separately.
const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function segTri(a,b,t){let d=sub(b,a),e=sub(t[1],t[0]),f=sub(t[2],t[0]),h=cross(d,f),det=dot(e,h);if(Math.abs(det)<1e-12)return false;let s=sub(a,t[0]),u=dot(s,h)/det;if(u<1e-7||u>1-1e-7)return false;let q=cross(s,e),v=dot(d,q)/det;if(v<1e-7||u+v>1-1e-7)return false;let k=dot(f,q)/det;return k>1e-7&&k<1-1e-7}
function intersect(a,b){for(let i=0;i<3;i++)if(segTri(a[i],a[(i+1)%3],b)||segTri(b[i],b[(i+1)%3],a))return true;return false}
export function crossings(ma,pa,mb,pb){let cell=.065,grid=new Map(),tris=(m,p)=>Array.from({length:m.indices.length/3},(_,i)=>m.indices.slice(i*3,i*3+3).map(j=>p[j])),A=tris(ma,pa),B=tris(mb,pb);
 const keys=t=>{let min=[0,1,2].map(i=>Math.floor(Math.min(...t.map(p=>p[i]))/cell)),max=[0,1,2].map(i=>Math.floor(Math.max(...t.map(p=>p[i]))/cell)),ks=[];for(let x=min[0];x<=max[0];x++)for(let y=min[1];y<=max[1];y++)for(let z=min[2];z<=max[2];z++)ks.push(x+','+y+','+z);return ks};
 for(let i=0;i<B.length;i++)for(let k of keys(B[i])){if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i)}
 let count=0;for(let t of A){let seen=new Set();for(let k of keys(t))for(let j of grid.get(k)||[]){if(seen.has(j))continue;seen.add(j);if(intersect(t,B[j]))count++}}return count}
export function pairs(model){let id=model.outfit;return [[id+'-shell',id+'-trousers','hem'],[id+'-shell',id+'-sleeve-L','shoulder-L'],[id+'-shell',id+'-sleeve-R','shoulder-R'],[model.meshes.some(q=>q.name==='hood-v2')?'hood-v2':'open-hood','identity-head','hood-head']].filter(([a,b])=>model.meshes.some(q=>q.name===a)&&model.meshes.some(q=>q.name===b))}
export function inspectCrossings(model,deformed){return Object.fromEntries(pairs(model).map(([a,b,label])=>[label,crossings(model.meshes.find(q=>q.name===a),deformed.get(a),model.meshes.find(q=>q.name===b),deformed.get(b))]))}
