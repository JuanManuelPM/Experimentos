import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeRequest,resolveScene,compileSceneContract,auditFullScope,selectPositiveReferences} from './scene-compiler.mjs';
import {readFileSync} from 'node:fs';
const cat=JSON.parse(readFileSync(new URL('./SCENE_INTENT_CATALOG.json',import.meta.url),'utf8'));
const ref=JSON.parse(readFileSync(new URL('./COMPONENT_REFERENCE_MATRIX.json',import.meta.url),'utf8'));
const h='a'.repeat(64),g='b'.repeat(64);
test('one word @WORK Arcade 3D resolves existing 3d only',()=>assert.equal(resolveScene('@work Arcade 3D',cat).projectId,'arcade-retro'));
test('all ten canonical IDs resolve uniquely',()=>{for(const p of cat.proposals)assert.equal(resolveScene(p.projectId,cat).projectId,p.projectId)});
test('unknown word does not guess other projects',()=>assert.equal(resolveScene('forklift',cat).status,'UNREGISTERED'));
test('ambiguity must not be resolved randomly',()=>{const c={proposals:[...cat.proposals,{projectId:'another',aliases:['arcade']}]};assert.equal(resolveScene('arcade',c).status,'AMBIGUOUS')});
test('accents and 3D annotation normalize cleanly',()=>assert.equal(normalizeRequest('Estación de servicio 3D'),'estacion de servicio'));
test('one-word arcade expands whole venue from catalog not a single cabinet',()=>{
 const x=compileSceneContract({humanBrief:'Arcade 3D',briefSha256:h,flowSha256:g,projectId:'arcade-retro',projectCatalog:cat});
 const required=x.requiredCoverage.map(y=>y.element);
 assert.ok(required.includes('full-arcade-room'));assert.ok(required.includes('multiple-distinct-cabinets'));
 assert.equal(x.scopeRules.mayEndAtFirstArticle,false);
});
test('one-word crossing includes whole street and free look',()=>{
 const x=compileSceneContract({humanBrief:'Cruce',briefSha256:h,flowSha256:g,projectId:'cruce-urbano',projectCatalog:cat});
 assert.equal(x.intent.sceneMode,'FREE_LOOK');
 assert.ok(x.requiredCoverage.some(y=>y.element==='street-network'));
});
test('generic 3D brief outside catalog compiles without hardcoded ten',()=>{
 const x=compileSceneContract({humanBrief:'Quiero un robot cinematográfico que entre en una habitación',briefSha256:h,flowSha256:g,projectId:'robot',projectCatalog:cat});
 assert.ok(x.requiredCoverage.some(y=>y.element==='complete-environment'));
 assert.ok(x.requiredCoverage.some(y=>y.element==='motivated-camera-and-timeline'));
 assert.equal(x.intent.sceneMode,'CINEMATIC_GUIDED');
});
test('cannot claim complete on missing coverage, but no veto',()=>{
 const x=compileSceneContract({humanBrief:'Arcade',briefSha256:h,flowSha256:g,projectId:'arcade-retro',projectCatalog:cat});
 const a=auditFullScope(x,[{element:'multiple-distinct-cabinets',exists:true,evidenceRef:'source.js'}]);
 assert.equal(a.scopeStatus,'DELIVERED_WITH_GAPS');
 assert.ok(a.missing.includes('full-arcade-room'));
 assert.ok(a.outputRule.includes('PUBLISH_CANDIDATE'));
});
test('only evidenced items prove coverage; declarations are not evidence',()=>{
 const p={projectId:'x',requiredCoverage:[{element:'one'}]};
 const result=auditFullScope(p,[{element:'one',exists:true}]);
 assert.deepEqual(result.unproved,['one']);
});
test('positive quality references do not import disliked Arcade environment or camera',()=>{
 const x=selectPositiveReferences(['CABINET_PROP','ENVIRONMENT','CAMERA','ACTOR','LIVE_SCREEN'],ref);
 assert.ok(x.selected.some(a=>a.component==='CABINET_PROP'&&a.referenceProject==='arcade-retro'));
 assert.ok(x.selected.some(a=>a.component==='ACTOR'&&a.referenceProject==='cruce-urbano'));
 assert.ok(x.selected.some(a=>a.component==='LIVE_SCREEN'));
 assert.ok(x.missing.includes('ENVIRONMENT')&&x.missing.includes('CAMERA'));
 assert.ok(!x.selected.some(a=>a.referenceProject==='arcade-retro'&&a.component==='ENVIRONMENT'));
});
test('invalid locks rejected without pretending work happened',()=>{
 assert.throws(()=>compileSceneContract({humanBrief:'Arcade',briefSha256:'bad',flowSha256:g}),/BRIEF_SHA/);
});
