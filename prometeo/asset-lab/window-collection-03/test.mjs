import * as B from '../surface-gate/constructor.mjs';
import * as G from '../surface-gate/surface-gate.mjs';
import * as api from './models.mjs';
function runTests(api,B,G){
 const rows=[];
 for(const [id] of api.designs){try{
  const m=api.build(id);let deg=0,invalid=0,open=0,triangles=0;const names=new Set();
  for(const p of m.parts){if(names.has(p.name))invalid++;names.add(p.name);const edges=new Map();triangles+=p.indices.length/3;
   if(!p.positions.every(Number.isFinite)||p.indices.some(i=>!Number.isInteger(i)||i<0||i>=p.positions.length/3))invalid++;
   for(let i=0;i<p.indices.length;i+=3){const a=p.indices[i],b=p.indices[i+1],c=p.indices[i+2];let P=j=>p.positions.slice(j*3,j*3+3),A=P(a),U=P(b).map((v,j)=>v-A[j]),V=P(c).map((v,j)=>v-A[j]);if(Math.hypot(U[1]*V[2]-U[2]*V[1],U[2]*V[0]-U[0]*V[2],U[0]*V[1]-U[1]*V[0])<1e-12)deg++;for(const [x,y] of [[a,b],[b,c],[c,a]]){let k=[x,y].sort((a,b)=>a-b).join(",");edges.set(k,(edges.get(k)||0)+1);}}
   open+=[...edges.values()].filter(n=>n!==2).length;
  }
  let asm=B.inspectAssembly(m,{gate:G.surfaceGate});
  let motion=m.motions.every(q=>q.max>0&&m.parts.some(p=>p.motion===q.id)&&q.pivot.every(Number.isFinite));
  rows.push({id,name:m.name,parts:m.parts.length,triangles,glazing:m.parts.filter(p=>p.role==="glazing").length,motions:m.motions.length,geometry:deg||invalid||open?"FAIL":"PASS",degenerate:deg,invalid,openEdges:open,assembly:asm.status,relations:m.relations.length,passingRelations:asm.relations.filter(r=>r.ok).length,issues:asm.issues,surfacePairs:asm.surfaces.length,surfaceFailures:asm.surfaces.filter(x=>x.status==="FAIL").length,motionMetadata:motion?"PASS":"FAIL",motionCollision:"NOT_RUN",render:"NOT_RUN",android:"NOT_RUN",art:"NOT_RUN"});
 }catch(e){rows.push({id,error:String(e)});}}
 return rows;
}
console.log(JSON.stringify(runTests(api,B,G),null,2));
