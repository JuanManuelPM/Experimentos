// Run with: node m08.test.mjs . M07 geometry and camera original suites are called unchanged.
import {readFileSync} from "node:fs";
import * as THREE from "./vendor/three.core.min.js";
import {build,bounds,inspectMesh,SPEC,FRONT,PORT_ID} from "./geometry.mjs";
import {initialView,toggleMacro,pose,corners,fits,CAMERA} from "./camera.mjs";
import {run as runGeometry} from "./test.mjs";
import {runCamera} from "./camera.test.mjs";
import {extendedBuild,extendedJoint,fork,sweptBounds,inspectFork,terminalFrame,protectPose,FORK_ID} from "./fork.mjs";
export function runM08(appSource,originalApp){
 const originalGeometry=runGeometry(),originalCamera=runCamera(),baseThree=[],checks=[];
 const add=(list,name,pass,detail)=>list.push({name,pass:!!pass,...(detail===undefined?{}:{detail})});
 const ok=(n,v,d)=>add(checks,n,v,d), b=(n,v,d)=>add(baseThree,n,v,d);
 function actualBuffer(part){
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(part.positions,3));g.setIndex(part.indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
  const pass=g.attributes.position.count===part.positions.length/3&&g.index.count===part.indices.length&&g.attributes.normal.array.every(Number.isFinite)&&Number.isFinite(g.boundingSphere.radius)&&g.boundingSphere.radius>0&&[...g.boundingBox.min.toArray(),...g.boundingBox.max.toArray()].every(Number.isFinite);g.dispose();return pass;
 }
 function actualProjection(points,P,aspect){
  const camera=new THREE.PerspectiveCamera(CAMERA.fov,aspect,CAMERA.near,CAMERA.far);camera.position.set(...P.position);camera.lookAt(...P.target);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  return points.every(p=>{const v=new THREE.Vector3(...p).project(camera);return [v.x,v.y,v.z].every(t=>Number.isFinite(t)&&Math.abs(t)<=1+1e-7);});
 }
 function syntax(s){try{new Function(s.replace(/^import .*;\n/gm,""));return true;}catch{return false;}}
 b("actual Three.js revision",THREE.REVISION==="181");
 for(const a of [-.32,0,.32])for(const part of build(a).parts)b("Three buffer "+a+" "+part.id,actualBuffer(part));
 const baseBox=bounds(build(.32).parts);
 for(const aspect of [.5,390/844,844/390,1.6])for(const macro of [false,true]){
  const v=macro?toggleMacro(initialView()):initialView(),P=pose(v,aspect,baseBox,FRONT),region=macro?{min:[FRONT-.38,-.48,-.48],max:[FRONT+.70,.48,.48]}:baseBox;
  b("Three camera clip "+aspect+" "+macro,actualProjection(corners(region),P,aspect));
 }
 b("viewer syntax",syntax(originalApp));
 const whole=sweptBounds(),forkBox=sweptBounds(true),within=(p,B)=>p.every((x,i)=>x>=B.min[i]-1e-8&&x<=B.max[i]+1e-8);
 let maxTriangles=0,minPairGap=Infinity,maxSeatViolation=0;
 for(let i=0;i<=8;i++)for(const spread of [0,.25,.5,.75,1]){
  const a=-SPEC.angleLimit+i*SPEC.angleLimit/4,m=extendedBuild(a,spread),r=inspectFork(m);
  maxTriangles=Math.max(maxTriangles,m.parts.reduce((n,p)=>n+p.indices.length/3,0));minPairGap=Math.min(minPairGap,r.minPairGap);maxSeatViolation=Math.max(maxSeatViolation,r.seatViolation);
  ok("geometry & identity "+a+" / "+spread,r.ok,r.ok?undefined:r);
  ok("swept bounds "+a+" / "+spread,m.parts.every(part=>{for(let k=0;k<part.positions.length;k+=3){const q=part.positions.slice(k,k+3);if(!within(q,whole)||(part.id.startsWith(FORK_ID+".")&&!within(q,forkBox)))return false;}return true;}));
 }
 for(const a of [-.32,0,.32])for(const s of [0,1]){
  const m=extendedBuild(a,s);
  for(const part of m.fork.parts)ok("Three buffer "+a+" / "+s+" "+part.id,actualBuffer(part));
  ok("animation updates same dynamic parts "+a+"/"+s,JSON.stringify(extendedJoint(a,s).parts)===JSON.stringify(m.parts.filter(p=>p.dynamic)));
 }
 const m0=extendedBuild(0,0),m1=extendedBuild(0,1),mFlex=extendedBuild(.32,1);
 ok("spread preserves original and hub",JSON.stringify(m0.parts.slice(0,20))===JSON.stringify(m1.parts.slice(0,20)));
 ok("both physical endpoints move on spread",m0.fork.ports.every((p,i)=>Math.hypot(...p.position.map((x,j)=>x-m1.fork.ports[i].position[j]))>.25));
 ok("both endpoints follow original articulation",m1.fork.ports.every((p,i)=>Math.hypot(...p.position.map((x,j)=>x-mFlex.fork.ports[i].position[j]))>.1));
 ok("same 24 part IDs at every gesture",m0.parts.length===24&&JSON.stringify(m0.parts.map(p=>p.id))===JSON.stringify(mFlex.parts.map(p=>p.id)));
 ok("original M07 port and edge preserved",m0.ports[1].id===PORT_ID&&m0.graph.edges[0].id==="scene.n-j"&&m0.graph.nodes.length===5&&m0.graph.edges.length===4);
 for(const [n,opts,code] of [["deep seat",{seatShift:-.025},"TERMINAL_INTRUSION"],["unseated gap",{seatShift:.025},"TERMINAL_GAP"],["wrong port",{sourcePort:"scene.n.port"},"WRONG_PORT"],["duplicate edge",{duplicate:true},"DUPLICATE_ID"]]){
  const r=inspectFork(extendedBuild(0,.7,opts));ok("negative "+n,!r.ok&&r.errors.includes(code),r.errors);
 }
 const badSurface=extendedBuild();const q=terminalFrame(0).world([.30,.40,0]);badSurface.fork.parts[1].positions.splice(0,3,...q);let r=inspectFork(badSurface);ok("negative arm breaches protected manifold",!r.ok&&r.errors.includes("FORK_SURFACE"),r.errors);
 const missing=extendedBuild();missing.graph.edges.pop();r=inspectFork(missing);ok("negative missing dependency",!r.ok&&r.errors.includes("GRAPH_INCOMPLETE"),r.errors);
 const baseMutation=extendedBuild();baseMutation.parts[0].positions[0]+=.02;r=inspectFork(baseMutation);ok("negative original altered",!r.ok&&r.errors.includes("BASE_CHANGED"),r.errors);
 const live=extendedBuild();live.data.mode="LIVE";r=inspectFork(live);ok("negative unauthorised live data",!r.ok&&r.errors.includes("DATA_MODE"),r.errors);
 for(const [a,s] of [[.33,.5],[0,-.1],[0,1.1],[NaN,.5]]){let rejected=false;try{fork(a,s);}catch{rejected=true;}ok("negative invalid motion "+a+"/"+s,rejected);}
 for(const aspect of [.5,390/844,844/390,1.6]){
  for(const focus of [false,true]){
   const B=focus?forkBox:whole,v=focus?{...initialView(),y:(B.min[1]+B.max[1])/2}:initialView();
   for(let i=0;i<24;i++){
    const yaw=i*Math.PI/12,P=protectPose(pose({...v,yaw},aspect,B,FRONT),forkBox);
    ok("camera fit "+aspect+"/"+focus+"/"+i,P.safe&&fits(corners(B),P,aspect));
    const close=protectPose(pose({...v,yaw,zoom:2.15},aspect,B,FRONT),forkBox),p=close.position;
    ok("camera safe zoom "+aspect+"/"+focus+"/"+i,close.safe&&Math.hypot(...p)>=1.22&&!(p[0]>.96&&p[0]<2.90&&Math.hypot(p[1],p[2])<.55));
   }
   const P=protectPose(pose(v,aspect,B,FRONT),forkBox);ok("Three projection "+aspect+"/"+focus,actualProjection(corners(B),P,aspect));
  }
 }
 const oldP=pose(initialView(),.5,baseBox,FRONT);ok("negative old camera box does not fit extension",!fits(corners(whole),oldP,.5));
 ok("M08 viewer syntax",syntax(appSource));
 const counts=list=>({pass:list.filter(c=>c.pass).length,total:list.length,failed:list.filter(c=>!c.pass)});
 return {version:"root-machine/0.2.0-candidate",original:{geometry:counts(originalGeometry.checks),camera:counts(originalCamera.checks),threeEquivalent:counts(baseThree)},increment:counts(checks),metrics:{parts:24,baseParts:19,maxTriangles,minPairGap,maxSeatViolation,bounds:whole,forkBounds:forkBox},checks,baseThree,scope:"Original geometry/camera scripts unchanged; Three equivalent regression reconstructed from receipt cases, actual r181 CPU buffers/projection; not WebGL, not real touch or artistic review."};
}
if(typeof process!=="undefined"&&process.argv[1]?.endsWith("m08.test.mjs")){
 const r=runM08(readFileSync(new URL("./app-m08.mjs",import.meta.url),"utf8"),readFileSync(new URL("./app.mjs",import.meta.url),"utf8"));console.log(JSON.stringify(r,null,2));if(r.increment.failed.length||Object.values(r.original).some(x=>x.failed.length))process.exitCode=1;
}
