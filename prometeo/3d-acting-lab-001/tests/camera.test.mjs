import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validateShotlist,sampleFrame,projectPoint} from '../vendor/director.mjs';
import {poseAt} from '../logic.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../ACTION_TIMELINE.json',import.meta.url),'utf8'));
const anchors=f=>{const p=poseAt(f),xyz=p.position;return {root:xyz,face:[xyz[0],1.64,xyz[2]+.11],hands:[xyz[0]+.25,1.05,xyz[2]+.15],object:[1.69,.93,-1.19],interaction:[1.69,.93,-1.19],paws:[xyz[0]+.25,1.05,xyz[2]+.15]};};
test('real vendor director import validates 6-shot cinematography',()=>{const r=validateShotlist(data);assert.deepEqual(r.errors,[]);assert.equal(r.durationSeconds,20)});
test('all camera samples yield finite positions and fov',()=>{for(let f=0;f<480;f++){const shot=sampleFrame(data,f,anchors(f),'civil');assert.ok(shot.position.every(Number.isFinite));assert.ok(shot.target.every(Number.isFinite));assert.ok(shot.fov>20&&shot.fov<80);}});
test('face projection at key shot midpoints is in view for NOMINAL ONLY anchors',()=>{for(const f of [80,206,265,330,460]){const a=anchors(f),shot=sampleFrame(data,f,a);const p=projectPoint(shot,a.face,16/9);assert.equal(p.visible,true,`frame ${f}: ${JSON.stringify(p)}`);}});
test('shot transitions contain expected labels',()=>{assert.equal(sampleFrame(data,0,anchors(0)).label,'01 / ESTUDIO');assert.equal(sampleFrame(data,380,anchors(380)).label,'05 / MANOS');assert.equal(sampleFrame(data,479,anchors(479)).label,'06 / GENERAL')});
