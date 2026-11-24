import {build,catalog,interfaceProfile,audit} from './models.mjs';
export function check(){
const reports=[];
for(const [id] of catalog){
 const m=build(id),invalid=[],bounds={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};let triangles=0,degenerate=0,open=0;
 for(const p of m.parts){let edges=new Map();triangles+=p.indices.length/3;for(let i=0;i<p.positions.length;i++){let x=p.positions[i],k=i%3;if(!Number.isFinite(x))invalid.push(p.name);bounds.min[k]=Math.min(bounds.min[k],x);bounds.max[k]=Math.max(bounds.max[k],x);}
 for(let i=0;i<p.indices.length;i+=3){let [a,b,c]=p.indices.slice(i,i+3);if([a,b,c].some(x=>!Number.isInteger(x)||x<0||x>=p.positions.length/3)){invalid.push(p.name);continue}const A=p.positions.slice(a*3,a*3+3),B=p.positions.slice(b*3,b*3+3),C=p.positions.slice(c*3,c*3+3),u=B.map((x,j)=>x-A[j]),v=C.map((x,j)=>x-A[j]);if(Math.hypot(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])<1e-11)degenerate++;for(const [x,y] of [[a,b],[b,c],[c,a]]){let k=Math.min(x,y)+':'+Math.max(x,y);edges.set(k,(edges.get(k)||0)+1)}}for(const n of edges.values())if(n!==2)open++}
 const r=audit(m);const seam=(z)=>{let values=new Map();for(const p of m.parts)if(['carriageway','curb','drainage-channel','sidewalk'].includes(p.role))for(let i=0;i<p.positions.length;i+=3)if(Math.abs(p.positions[i+2]-z)<1e-8){let k=p.positions[i].toFixed(5);values.set(k,Math.max(values.get(k)??-Infinity,p.positions[i+1]))}return [...values].sort((a,b)=>Number(a[0])-Number(b[0]))};
 reports.push({id,parts:m.parts.length,triangles,geometry:invalid.length||degenerate||open?'FAIL':'PASS',degenerate,open,invalid:invalid.slice(0,10),bounds,assembly:r.status,relations:r.relations.length,passedRelations:r.relations.filter(x=>x.ok).length,issues:r.issues.slice(0,24),issueCount:r.issues.length,features:m.features,seams:[seam(0),seam(18)]});
}
return reports;
}
if(typeof process!=='undefined'&&process.argv[1]?.endsWith('test.mjs'))console.log(JSON.stringify(check(),null,2));
