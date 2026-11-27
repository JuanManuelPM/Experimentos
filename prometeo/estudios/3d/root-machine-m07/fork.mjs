// M08: additive terminal bifurcation. M07 geometry and identifiers are untouched.
import {build,joint,neckCenter,bounds,inspectMesh,SPEC,PORT_ID,JOINT_ID} from "./geometry.mjs";
export const VERSION="root-machine/0.2.0-candidate";
export const FORK_ID="scene.root.fork";
export const FORK_SPEC=Object.freeze({seatStart:.059,seatFace:.062,hubEnd:.36,armStart:.30,spreadMin:0,spreadMax:1});
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>mul(a,1/Math.hypot(...a));
export function terminalFrame(angle){
 const O=neckCenter(1,angle),T=unit(sub(O,neckCenter(.96,angle))),N=unit(sub([0,1,0],mul(T,T[1]))),B=cross(T,N);
 return {O,T,N,B,world:([x,y,z])=>add(O,add(mul(T,x),add(mul(N,y),mul(B,z)))),local:p=>{const d=sub(p,O);return [dot(d,T),dot(d,N),dot(d,B)];}};
}
// Cross sections lie in terminal-local planes. Every cap is closed, with explicit winding.
function solid(id,material,sections,F,sides=32,role="fork"){
 const P=[],I=[];
 for(const [x,y,z,a,b] of sections)for(let k=0;k<sides;k++){const t=k*2*Math.PI/sides;P.push(...F.world([x,y+a*Math.cos(t),z+b*Math.sin(t)]));}
 for(let i=0;i<sections.length-1;i++)for(let k=0;k<sides;k++){const a=i*sides+k,b=i*sides+(k+1)%sides,c=a+sides,d=b+sides;I.push(a,b,c,b,d,c);}
 for(const i of [0,sections.length-1]){const n=P.length/3;P.push(...F.world(sections[i].slice(0,3)));for(let k=0;k<sides;k++){const a=i*sides+k,b=i*sides+(k+1)%sides;if(i===0)I.push(n,b,a);else I.push(n,a,b);}}
 const part={id,material,positions:P,indices:I,role,dynamic:true};
 return part;
}
function armSections(sign,spread){
 return Array.from({length:31},(_,i)=>{
  const t=i/30,x=.30+.72*t,q=Math.max(0,(x-.36)/.66), bend=q*q*(3-2*q);
  const y=sign*(.112+(.13+.32*spread)*bend),z=sign*(.012+.11*q*q)+.035*Math.sin(Math.PI*q);
  const r=.058+.014*Math.sin(Math.PI*t)-.026*t+.004*Math.sin(18*Math.PI*t)*Math.sin(Math.PI*t)**2;
  return [x,y,z,r,r*.85];
 });
}
export function fork(angle=0,spread=.70,{seatShift=0,sourcePort=PORT_ID,duplicate=false}={}){
 if(!Number.isFinite(angle)||Math.abs(angle)>SPEC.angleLimit||!Number.isFinite(spread)||spread<0||spread>1)throw Error("fork parameters out of range");
 const F=terminalFrame(angle),hub=[[.059,0,0,.099,.081],[.078,0,0,.10,.082],[.105,0,0,.116,.090],[.18,0,0,.163,.114],[.26,0,0,.217,.132],[.30,0,0,.224,.140],[.345,0,0,.224,.140],[.36,0,0,.218,.136]];
 const shifted=hub.map(([x,...rest])=>[x+seatShift,...rest]);
 const parts=[solid(FORK_ID+".hub","steel",shifted,F,48,"fork-hub")],ports=[],arms=[];
 for(const [sign,label] of [[1,"a"],[-1,"b"]]){
  const S=armSections(sign,spread),id=FORK_ID+"."+label;
  const end=S.at(-1),tip=[[end[0]-.010,end[1],end[2],end[3]+.010,end[4]+.010],[end[0]+.008,end[1],end[2],end[3]+.014,end[4]+.014],[end[0]+.033,end[1],end[2],end[3]+.009,end[4]+.009],[end[0]+.047,end[1],end[2],end[3]*.70,end[4]*.70]];
  parts.push(solid(id+".arm","membrane",S,F,32,"fork-arm"),solid(id+".tip","steel",tip,F,32,"fork-tip"));
  arms.push({id,sections:S,tip});
  ports.push({id:id+".exit",node:id,position:F.world(tip.at(-1).slice(0,3)),type:"structure"});
 }
 const nodes=[FORK_ID,FORK_ID+".a",FORK_ID+".b"];
 const edges=[{id:"scene.j-fork",kind:"STRUCTURE",from:JOINT_ID,to:FORK_ID,sourcePort},{id:"scene.fork-a",kind:"STRUCTURE",from:FORK_ID,to:nodes[1]},{id:duplicate?"scene.fork-a":"scene.fork-b",kind:"STRUCTURE",from:FORK_ID,to:nodes[2]}];
 return {parts,ports,nodes,edges,arms,hub:shifted,angle,spread,sourcePort};
}
export function extendedBuild(angle=0,spread=.70,opts={}){
 const base=build(angle),f=fork(angle,spread,opts);
 return {...base,id:VERSION,parts:[...base.parts,...f.parts],ports:[...base.ports,...f.ports],graph:{nodes:[...base.graph.nodes,...f.nodes],edges:[...base.graph.edges,...f.edges]},fork:f};
}
export function extendedJoint(angle,spread){return {parts:[...joint(angle).parts,...fork(angle,spread).parts]};}
export function sweptBounds(forkOnly=false){
 const all=forkOnly?[]:build().parts.filter(p=>!p.dynamic);
 for(let i=0;i<=8;i++){const a=-SPEC.angleLimit+i*SPEC.angleLimit/4;if(!forkOnly)all.push(...joint(a).parts);all.push(...fork(a,0).parts,...fork(a,1).parts);}
 const b=bounds(all);return {min:b.min.map(x=>x-.025),max:b.max.map(x=>x+.025)};
}
export function protectPose(P,forkBox){
 const position=[...P.position];let distance=P.distance;
 const inside=p=>p.every((x,i)=>x>=forkBox.min[i]-.10&&x<=forkBox.max[i]+.10);
 for(let i=0;i<100&&inside(position);i++){distance+=.06;for(let j=0;j<3;j++)position[j]=P.target[j]+P.basis.dir[j]*distance;}
 return {...P,position,distance,safe:P.safe&&!inside(position)};
}
export function inspectFork(model){
 const f=model.fork,F=terminalFrame(f.angle),errs=[],base=model.parts.filter(p=>!p.id.startsWith(FORK_ID+".")),original=build(f.angle);
 if(JSON.stringify(base)!==JSON.stringify(original.parts))errs.push("BASE_CHANGED");
 if(new Set(model.parts.map(p=>p.id)).size!==model.parts.length||new Set(model.graph.edges.map(e=>e.id)).size!==model.graph.edges.length||new Set(model.graph.nodes).size!==model.graph.nodes.length||new Set(model.ports.map(p=>p.id)).size!==model.ports.length)errs.push("DUPLICATE_ID");
 const nodes=new Set(model.graph.nodes);
 if(model.graph.nodes.length!==5||model.graph.edges.length!==4||model.ports.length!==4||JSON.stringify(model.graph.nodes.slice(0,2))!==JSON.stringify(original.graph.nodes)||JSON.stringify(model.graph.edges.slice(0,1))!==JSON.stringify(original.graph.edges)||JSON.stringify(model.ports.slice(0,2))!==JSON.stringify(original.ports)||f.nodes.some(n=>!nodes.has(n))||f.edges.some(e=>!model.graph.edges.some(m=>JSON.stringify(m)===JSON.stringify(e)))||f.ports.some(p=>!model.ports.some(m=>JSON.stringify(m)===JSON.stringify(p))))errs.push("GRAPH_INCOMPLETE");
 if(model.graph.edges.some(e=>!nodes.has(e.from)||!nodes.has(e.to))||f.edges[0].sourcePort!==PORT_ID||!model.ports.some(p=>p.id===PORT_ID&&p.node===JOINT_ID)||f.edges[0].from!==JOINT_ID||f.edges[0].to!==FORK_ID||f.edges.slice(1).some((e,i)=>e.from!==FORK_ID||e.to!==f.nodes[i+1]))errs.push("WRONG_PORT");
 let maxBaseAxial=-Infinity,minForkAxial=Infinity,seatVertices=0,seatViolation=0;
 for(const part of base)for(let i=0;i<part.positions.length;i+=3)maxBaseAxial=Math.max(maxBaseAxial,F.local(part.positions.slice(i,i+3))[0]);
 for(const part of f.parts)for(let i=0;i<part.positions.length;i+=3){
  const [x,y,z]=F.local(part.positions.slice(i,i+3));minForkAxial=Math.min(minForkAxial,x);
  if(x<.062-1e-8){seatVertices++;if(part.role!=="fork-hub"||x<.059-1e-8||(y/.103)**2+(z/.085)**2>1+1e-7)seatViolation++;}
 }
 if(maxBaseAxial>.062+1e-7||seatViolation)errs.push("TERMINAL_INTRUSION");
 if(minForkAxial>.062+1e-8||!seatVertices)errs.push("TERMINAL_GAP");
 const hubRadius=x=>{for(let i=1;i<f.hub.length;i++){const a=f.hub[i-1],b=f.hub[i];if(x>=a[0]-1e-8&&x<=b[0]+1e-8){const t=(x-a[0])/(b[0]-a[0]);return [a[3]+t*(b[3]-a[3]),a[4]+t*(b[4]-a[4])];}}return null;};
 let hidden=0,armViolation=0,minPairGap=Infinity;
 for(const part of f.parts.filter(p=>p.role==="fork-arm"))for(let i=0;i<part.positions.length;i+=3){const [x,y,z]=F.local(part.positions.slice(i,i+3));if(x<=.36+1e-8){hidden++;const r=hubRadius(x);if(!r||(y/r[0])**2+(z/r[1])**2>1+1e-7)armViolation++;}}
 for(let i=0;i<f.arms[0].sections.length;i++){const a=f.arms[0].sections[i],b=f.arms[1].sections[i];minPairGap=Math.min(minPairGap,Math.abs(a[1]-b[1])-a[3]-b[3]);}
 if(!hidden||armViolation||minPairGap<=0)errs.push("FORK_SURFACE");
 for(const arm of f.arms){const end=arm.sections.at(-1),tip=arm.tip[0];if(!(tip[0]<end[0]&&end[0]-tip[0]<=.011&&tip[1]===end[1]&&tip[2]===end[2]&&tip[3]>end[3]&&tip[4]>end[4]))errs.push("TIP_SEAT");}
 if(f.parts.some(p=>!inspectMesh(p).ok))errs.push("MESH");
 if(model.data.mode!=="UNKNOWN"||model.data.live)errs.push("DATA_MODE");
 return {ok:!errs.length,errors:errs,maxBaseAxial,minForkAxial,seatVertices,seatViolation,hidden,armViolation,minPairGap,scope:"axial seat + sampled elliptical cross sections; no general collision certification"};
}
