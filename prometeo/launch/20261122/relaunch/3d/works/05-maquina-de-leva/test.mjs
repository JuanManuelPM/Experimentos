// PROMETEO 3D W7 / 05 · reproducible Node tests; no WebGL or human approval.
import assert from 'node:assert/strict';
import {TAU,DEFAULTS,motion,profile,state,diagnose,buildDXF} from './mechanics.mjs';
let analytical=0;
for(let i=0;i<720;i++){
 const t=i*TAU/720,s=state(t),q=s.contact;
 const x=q.x*Math.cos(t)-q.y*Math.sin(t),y=q.x*Math.sin(t)+q.y*Math.cos(t);
 analytical=Math.max(analytical,Math.abs(Math.hypot(x,s.rollerY-y)-DEFAULTS.roller));
}
assert.ok(analytical<1e-8,'contact tangent');
assert.ok(Math.abs(motion(TAU).s)<1e-7,'periodic endpoint');
const baseline=diagnose({},180,720);
assert.equal(baseline.continuousContact,true);
assert.equal(baseline.pressureOK,true);
let variants=0;
for(const lift of [6,12,19,25])for(const rise of [105,130,150])for(const topDwell of [35,70]){
 const diagnostic=diagnose({lift,rise,topDwell},48,360);
 assert.equal(diagnostic.continuousContact,true,JSON.stringify({lift,rise,topDwell}));variants++;
}
const dx=buildDXF();assert.ok(dx.includes('$INSUNITS\n70\n4'),'DXF declares mm');assert.ok(dx.includes('LWPOLYLINE')&&dx.includes('CIRCLE'));
const a=profile({lift:6},90),b=profile({lift:25},90);assert.ok(a.some((p,i)=>Math.hypot(p.x-b[i].x,p.y-b[i].y)>5));
console.log(JSON.stringify({status:'PASS',analyticContactMaxMm:analytical,polygonalMinGapMm:baseline.minGap,polygonalMaxGapMm:baseline.maxGap,maxPressureDeg:baseline.maxPressure,variants,dxUnits:'mm',humanApproved:false},null,2));
