import test from 'node:test';import assert from 'node:assert/strict';
import {inspectThreeSource} from './scene-source-lint.mjs';
test('does not claim empty scene is art approved',()=>{const x=inspectThreeSource('');assert.equal(x.blockCount,0);assert.match(x.disclaimer,/never counts/)});
test('finds line-based rain',()=>{const x=inspectThreeSource('function createRain(){ let q=1; rain=new THREE.LineSegments(geo,mat) }');assert.equal(x.warnings.some(w=>w.id==='RAIN_LINES'),true)});
test('finds unsafe offset',()=>{const x=inspectThreeSource('actor.position.set(-.56,.23-bottom*scale-.48,.28);');assert.equal(x.warnings.some(w=>w.id==='MAGIC_SEAT_OFFSET'),true)});
test('finds unchecked reverse movement',()=>{const x=inspectThreeSource('const z=18-now*1.95;');assert.equal(x.warnings.some(w=>w.id==='WORLD_MOTION_NO_AXIS_CHECK'),true)});
test('only warns on light intent without claiming it is wrong',()=>{const x=inspectThreeSource('const light=new THREE.SpotLight();');assert.equal(x.warnings.find(w=>w.id==='DIRECT_LIGHT_NOT_CASTING_SHADOW').severity,'REVIEW')});
test('recognizes accumulation on bones',()=>{const x=inspectThreeSource('head.rotation.y += Math.sin(t);');assert.equal(x.warnings.find(w=>w.id==='ADDITIVE_ROTATION').severity,'REVIEW')});
