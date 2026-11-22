import assert from 'node:assert/strict';
import test from 'node:test';
import {pickActive,progressFor,photographicOffset,clamp01} from './sequence-state.mjs';
const seq = [ {top:0,bottom:800,height:800},{top:800,bottom:1600,height:800},{top:1600,bottom:2400,height:800} ];
function at(scroll){return seq.map(x=>({top:x.top-scroll,bottom:x.bottom-scroll,height:x.height}));}
test('initial scene and deep link to final chapter',()=>{assert.equal(pickActive(at(0),300),0);assert.equal(pickActive(at(1780),300),2);});
test('returning backwards chooses the former chapter without relying on events',()=>{assert.equal(pickActive(at(1700),300),2);assert.equal(pickActive(at(700),300),1);assert.equal(pickActive(at(100),300),0);});
test('rapid crossing of several boundaries never yields undefined',()=>{for(const y of [0,799,800,801,1599,1600,1800,2400])assert.ok([0,1,2].includes(pickActive(at(y),300)));});
test('progress clamps both ends and is 0.5 in the middle',()=>{assert.equal(progressFor({top:600,height:800},300),0);assert.equal(progressFor({top:-100,height:800},300),0.5);assert.equal(progressFor({top:-2000,height:800},300),1);});
test('user or system reduced-motion sets photo offset zero',()=>{assert.equal(photographicOffset(0,false),19);assert.equal(photographicOffset(1,false),-19);assert.equal(photographicOffset(0,true),0);assert.equal(photographicOffset(1,true),0);});
test('input sanitization and empty sequence are deterministic',()=>{assert.equal(pickActive([],300),-1);assert.equal(clamp01(NaN),0);assert.equal(clamp01(2),1);});
