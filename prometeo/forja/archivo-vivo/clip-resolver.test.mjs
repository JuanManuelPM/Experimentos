import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveClip} from './clip-resolver.mjs';
const names=['AnimalArmature|Attack','AnimalArmature|Death','AnimalArmature|Eating',
  'AnimalArmature|Gallop','AnimalArmature|Gallop_Jump','AnimalArmature|Idle',
  'AnimalArmature|Idle_2','AnimalArmature|Idle_2_HeadLow',
  'AnimalArmature|Idle_HitReact_Left','AnimalArmature|Idle_HitReact_Right',
  'AnimalArmature|Jump_ToIdle','AnimalArmature|Walk'];
const clips=names.map(name=>({name}));
test('exact controls fail on original Fox names before repair',()=>{for(const s of ['Idle','Walk','Gallop'])assert.equal(clips.find(x=>x.name===s),undefined);});
test('real Fox Idle Walk Gallop resolve by namespace suffix',()=>{for(const s of ['Idle','Walk','Gallop'])assert.equal(resolveClip(clips,s).name,'AnimalArmature|'+s);});
test('no mistaken partial match for Idle_2',()=>assert.equal(resolveClip(clips,'Idle_2').name,'AnimalArmature|Idle_2'));
test('exact match takes priority over namespaced clips',()=>assert.equal(resolveClip([{name:'A|Walk'},{name:'Walk'},{name:'B|Walk'}],'Walk').name,'Walk'));
test('ambiguous names fail closed',()=>assert.throws(()=>resolveClip([{name:'A|Walk'},{name:'B|Walk'}],'Walk'),/AMBIGUOUS_CLIP:Walk/));
test('unknown missing clips return null, invalid arguments reject',()=>{assert.equal(resolveClip(clips,'Teleport'),null);assert.throws(()=>resolveClip(null,'Idle'),/INVALID_CLIP_ARGUMENTS/);});
test('namespace-free assets still work',()=>assert.equal(resolveClip([{name:'Walk'}],'Walk').name,'Walk'));
