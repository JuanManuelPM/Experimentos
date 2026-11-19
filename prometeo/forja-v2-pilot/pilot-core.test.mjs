import test from 'node:test';
import assert from 'node:assert/strict';
import {DURATION,ACTOR_ID,SCRIPT,SHOTS,ownerCameraCheck,validateScript,sampleActor,sampleCamera,frontDot,yawForDirection,chooseClip,makeScene} from './pilot-core.mjs';
test('Action and camera sequences cover exactly 20 seconds',()=>{
 assert.equal(validateScript().pass,true);assert.equal(SCRIPT.at(-1).end,DURATION);assert.equal(SHOTS.at(-1).end,DURATION);
});
test('World movement matches calibrated forward for all four possible actor axes',()=>{
 for(const axis of ['+Z','-Z','+X','-X'])for(const [dx,dz] of [[0,-1],[1,0],[-.2,.9]]){
  assert.ok(frontDot(yawForDirection(dx,dz,axis),dx,dz,axis)>.999999);
 }
});
test('Both walking phases move in facing direction',()=>{
 for(const axis of ['+Z','-Z','+X','-X'])for(const t of [2.01,4,5.99,7.02,9,10.99]){
  const a=sampleActor(t,axis);assert.equal(a.mode,'walk');assert.ok(a.frontDot>.999);
 }
});
test('Walking translates, interaction phase stays in place',()=>{
 const p=sampleActor(2),q=sampleActor(5.5);assert.ok(Math.hypot(q.position[0]-p.position[0],q.position[2]-p.position[2])>2.4);
 assert.deepEqual(sampleActor(11).position,sampleActor(13.5).position);
});
test('Every shot has finite position and FOV over its exact timeline',()=>{
 for(let t=0;t<=DURATION;t+=.25){const c=sampleCamera(t,sampleActor(t));assert.ok(c.position.every(Number.isFinite));assert.ok(c.target.every(Number.isFinite));assert.ok(c.fov>=30&&c.fov<=60)}
});
test('Animation choice refuses fake walk or interaction clips',()=>{
 assert.equal(chooseClip([{name:'Idle'},{name:'Run'}],'walk').index,-1);
 assert.equal(chooseClip(['Idle','Walk'],'walk').index,1);
 assert.equal(chooseClip(['Idle','Walk'],'interact').index,-1);
});
test('Scene uses only actual indexed GLBs and stable unique identifiers',()=>{
 const known=new Set([ACTOR_ID,'furniture-kit/kitchencabinet','furniture-kit/table','furniture-kit/kitchencabinetupper']);
 const s=makeScene(known);assert.equal(s.items.length,4);assert.equal(new Set(s.items.map(i=>i.uid)).size,s.items.length);assert.ok(s.items.every(i=>known.has(i.id)));
 assert.equal(s.items.find(i=>i.id==='furniture-kit/kitchencabinetupper').p[1],1.65);
});
test('Missing external actor never creates a geometric replacement',()=>{
 assert.equal(makeScene(new Set(['furniture-kit/table'])).items.some(i=>i.id===ACTOR_ID),false);
});
test('Unknown forward calibration fails closed',()=>{
 assert.throws(()=>yawForDirection(1,0,'DIAGONAL'),/FRONT_AXIS_UNCALIBRATED/);
});

test('Reuses version-pinned original semantic camera director',()=>{
 const gate=ownerCameraCheck();assert.equal(gate.ok,true);assert.equal(gate.durationSeconds,20);
});
test('Generic waving or talking is not accepted as grasping an object',()=>{
 assert.equal(chooseClip(['Idle','Walk','Wave','Talk'],'interact').index,-1);
});
