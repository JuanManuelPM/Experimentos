import assert from 'node:assert/strict';
import {BOM,DESIGN,foldPose,foldedFrontAxle,axleSeparation,validateDesign} from './mechanics.mjs';
const a=validateDesign(); assert.equal(a.ok,true,JSON.stringify(a));
assert.equal(BOM.length,14); assert.equal(new Set(BOM.map(p=>p.id)).size,BOM.length);
assert.ok(Math.abs(foldedFrontAxle(0)[0]-DESIGN.frontAxle[0])<1e-10);
assert.ok(Math.abs(foldedFrontAxle(0)[2])<1e-10);
assert.ok(Math.abs(foldPose(0).mainYaw)<1e-10);
assert.ok(Math.abs(foldPose(1).mainYaw-Math.PI)<1e-10);
for(let i=0;i<=100;i++){const p=i/100; const f=foldPose(p); assert.ok(f.seatDrop>=0&&f.seatDrop<=.25); assert.ok(f.mainYaw>=0&&f.mainYaw<=Math.PI);assert.ok(Number.isFinite(axleSeparation(p).spatial))}
assert.ok(axleSeparation(1).lateral>DESIGN.tyreWidth*2+.02);
assert.ok(axleSeparation(1).along<.15);
console.log('PASS · 110+ fold and geometry assertions · approximate geometric checks only');
