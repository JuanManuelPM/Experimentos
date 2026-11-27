import {build,joint,inspectJoint,inspectMesh,bounds,PORT_X,FRONT,SPEC,VERSION} from "./geometry.mjs";
export function run(){
 const checks=[],assert=(name,pass,detail)=>{checks.push({name,pass:!!pass,detail});};
 const poses=[-.32,-.24,-.16,-.08,0,.08,.16,.24,.32];let triangles=0;
 for(const pose of poses){
  const model=build(pose),g=inspectJoint(model.joint),m=model.parts.map(inspectMesh);
  triangles=Math.max(triangles,m.reduce((s,x)=>s+x.triangles,0));
  assert("joint "+pose,g.ok,g);assert("closed winding finite "+pose,m.every(x=>x.ok),m.filter(x=>!x.ok));assert("IDs "+pose,new Set(model.parts.map(p=>p.id)).size===model.parts.length);
 }
 const bad=[["oversize spigot",{spigot:.18},"BORE_INTRUSION"],["unseated gap",{offset:.03},"INSERTION_GAP"],["deep offset",{offset:-.32},"CORE_INTRUSION"]];
 for(const [name,opts,expected] of bad){const r=inspectJoint(joint(0,opts));assert(name,!r.ok&&r.errors.includes(expected),r);}
 const original=build(0);assert("source mode is UNKNOWN",original.data.mode==="UNKNOWN"&&!original.data.live);assert("same base geometry and IDs",JSON.stringify(original.parts.filter(p=>!p.dynamic))===JSON.stringify(build(.32).parts.filter(p=>!p.dynamic)));assert("terminal port moves with root",JSON.stringify(original.ports[1].position)!==JSON.stringify(build(.32).ports[1].position));assert("single graph edge; M08 not prebuilt",original.graph.edges.length===1);
 return {version:VERSION,checks,triangles,parts:original.parts.length,bounds:bounds(original.parts),failed:checks.filter(x=>!x.pass),scope:"CPU geometry; no GPU/visual/physical Android; specific axial and sampled curvature tests, not general BVH collision certification."};
}
if(typeof process!=="undefined"&&process.argv[1]?.endsWith("test.mjs")){const r=run();console.log(JSON.stringify(r,null,2));if(r.failed.length)process.exitCode=1;}
