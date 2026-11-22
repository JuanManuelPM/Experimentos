// Asteroide Jardín W7 · deterministic tests. Run: node test-logic.mjs
import assert from 'node:assert/strict';
import {freshQuest,restoreQuest,questAction} from './quest-state.mjs';
import {unit,cross,arcDistance,advanceOnSphere,moveWithObstacles,radialPhysics,patrolOnSphere,slerp} from './planet-motion.mjs';
const checks=[];
function run(name,test){try{test();checks.push({name,result:'PASS'});process.stdout.write('PASS '+name+'\n');}catch(e){checks.push({name,result:'FAIL',error:e.message});process.stderr.write('FAIL '+name+' '+e.message+'\n');process.exitCode=1;}}
run('Pre-Nima drops blocked',()=>assert.equal(questAction(freshQuest(),'drop:0').state.drops.length,0));
run('Nima opens the quest',()=>assert.equal(questAction(freshQuest(),'nima').state.stage,1));
run('Duplicate pickups blocked',()=>{let s=questAction(freshQuest(),'nima').state;s=questAction(s,'drop:0').state;s=questAction(s,'drop:0').state;assert.equal(s.drops.length,1)});
run('Altar requires Boro',()=>{let s=questAction(freshQuest(),'nima').state;for(const i of [0,1,2])s=questAction(s,'drop:'+i).state;assert.equal(questAction(s,'altar').state.completed,false)});
run('Quest reaches finale',()=>{let s=questAction(freshQuest(),'nima').state;for(const i of [0,1,2])s=questAction(s,'drop:'+i).state;s=questAction(s,'boro').state;s=questAction(s,'altar').state;assert.equal(s.completed,true);assert.equal(s.stage,3)});
run('Save reload consistent',()=>{let s=questAction(freshQuest(),'nima').state;for(const i of [0,1,2])s=questAction(s,'drop:'+i).state;s=questAction(s,'boro').state;s=questAction(s,'altar').state;assert.equal(restoreQuest(JSON.parse(JSON.stringify(s))).completed,true)});
run('Invalid saves sanitized',()=>assert.equal(restoreQuest({version:2,dir:[0,1,'x'],drops:[9]}).completed,false));
run('Quarter-circle motion',()=>{let p=advanceOnSphere([0,1,0],[1,0,0],Math.PI/2,1);assert.ok(Math.abs(p[0]-1)<1e-7)});
run('Swept obstacle blocks tunneling',()=>{let p=moveWithObstacles(unit([-.3,1,0]),[1,0,0],.65,1,[{normal:[0,1,0],radius:.15}],.1);assert.ok(arcDistance(p.normal,[0,1,0],1)>.24)});
run('Radial jump lands',()=>{let r={height:0,velocity:0};for(let i=0;i<130;i++)r=radialPhysics(r.height,r.velocity,1/60,{jump:i===0});assert.equal(r.height,0);assert.equal(r.grounded,true)});
run('NPC follows great circle',()=>{let p=patrolOnSphere([[0,1,0],[1,0,0],[0,-1,0]],.5);assert.ok(Math.abs(arcDistance(p.normal,[0,1,0],1)-Math.PI/4)<1e-7)});
run('Antipodal slerp stays unit',()=>assert.ok(Math.abs(Math.hypot(...slerp([0,1,0],[0,-1,0],.5))-1)<1e-7));
run('Full revolution returns near origin',()=>{let n=[0,1,0];for(let i=0;i<360;i++)n=advanceOnSphere(n,cross([0,0,-1],n),2*Math.PI/360,1);assert.ok(arcDistance(n,[0,1,0],1)<1e-3)});
process.stdout.write(JSON.stringify({total:checks.length,pass:checks.filter(c=>c.result==='PASS').length,fail:checks.filter(c=>c.result==='FAIL').length})+'\n');
