/** FORM / 01 reusable product-shot planner: no render or external dependencies.
 * Original model; all shots refer to the same joint positions in world space. */
export const design=Object.freeze({p0:[-.38,0,.215],link1:.93,link2:.76,headLength:.98});
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const v=clamp(x);return v*v*(3-2*v)};
export function pose(t){
  const e=smooth((t-5)/5), a=(16+57*e)*Math.PI/180, b=(167-164*e)*Math.PI/180;
  const p0=design.p0, p1=[p0[0]+design.link1*Math.cos(a),0,p0[2]+design.link1*Math.sin(a)];
  const p2=[p1[0]+design.link2*Math.cos(b),0,p1[2]+design.link2*Math.sin(b)];
  return {t,foldFraction:e,p0,p1,p2,primaryAngle:a,secondaryAngle:b,headCenter:[p2[0]+.44,0,p2[2]-.04],headPitch:0,light:smooth((t-10.3)/1.7)};
}
export const shots=Object.freeze([
{id:"S01",start:0,end:2.1,type:"hinge-macro",azimuth:[25,43],scale:.56},
{id:"S02",start:2.1,end:5,type:"folded-wide",azimuth:[25,41],scale:1.22},
{id:"S03",start:5,end:10.2,type:"unfold-tracking",azimuth:[40,31],scale:1.24},
{id:"S04",start:10.2,end:12.6,type:"emitter-macro",azimuth:[123,108],scale:.68},
{id:"S05",start:12.6,end:16,type:"hero-packshot",azimuth:[22,33],scale:1.38}
]);
export function activeShot(t){return shots.find(s=>t>=s.start&&t<s.end)??shots.at(-1)}
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
export function continuityCheck(t,tol=1e-9){
  const p=pose(t);
  return Math.abs(length(p.p0,p.p1)-design.link1)<tol && Math.abs(length(p.p1,p.p2)-design.link2)<tol
    && p.headPitch===0 && p.p2.every(v=>Number.isFinite(v));
}
export function timelineQA(){
  const problems=[];
  for(let frame=0;frame<384;frame++){
    const t=frame/24;
    if(!continuityCheck(t))problems.push({frame,error:"joint distance or head pitch violated"});
    if(!activeShot(t))problems.push({frame,error:"shot coverage gap"});
  }
  if(shots[0].start!==0 || shots.at(-1).end!==16) problems.push({error:"no 16-second coverage"});
  for(let i=1;i<shots.length;i++)if(shots[i].start!==shots[i-1].end)problems.push({error:"shot gap/overlap",i});
  return {pass:problems.length===0,checkedFrames:384,problems};
}
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("SHOT_SYSTEM.mjs")){
 console.log(JSON.stringify(timelineQA(),null,2));if(!timelineQA().pass)process.exitCode=1;
}
