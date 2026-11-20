import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePreflightPlan,validateAcquiredAssets,validateFirstArticle} from './preflight.mjs';
const entity=()=>({
 id:'passenger-hero',kind:'npc',visibility:'CLOSEUP',technique:'LICENSED_TEXTURED_ASSET',
 intent:'Persona texturada legible en primer plano',rejectionRisk:'Collage de esferas/plastilina',
 closeupAcceptance:'Rostro ropa manos y silueta coherentes',firstArticleShot:'1 pasajero sentado visto desde pasillo',
 alternatives:[{option:'asset GLB libre',reason:'UV real y rig comprobable'},{option:'malla editable',reason:'silueta diseñada y UV atlas'}],
 asset:{origin:'model pack rights',rights:'CC0',editableOrGlb:'actor.glb'},
 proof:{sourceGitBlob:'a'.repeat(40),license:'CC0',artifactPath:'actor.glb',instanceRef:'train/passenger01 -> actor.glb',usedTechnique:'LICENSED_TEXTURED_ASSET',renderRef:'evidence/first-article.png',renderStatus:'PASS',acceptance:true}
});
const good=()=>({
 schema:'prometeo.3d.preventive-blueprint/v1',sceneId:'transporte-retro-002',
 flowVersion:'1.2.0',status:'FIRST_ARTICLE_ACCEPTED',entities:[entity()],
 camera:{mode:'MOVING',motionPolicy:'CONTINUITY_OR_INTENTIONAL_CUT',beats:[
 {kind:'TRAVEL',start:0,end:3,startVelocity:.1,endVelocity:.4},
 {kind:'TRAVEL',start:3,end:6,startVelocity:.4,endVelocity:.2}]},
 earlyRender:{targetPlatform:'Android WebGL',shot:'passenger visible',minimumVisible:'face+seat in one frame',renderRef:'evidence/first-article.png',renderStatus:'PASS'}
});
test('valid source-based NPC plan passes before first model',()=>assert.deepEqual(validatePreflightPlan(good()).errors,[]));
test('former train primitive NPCs blocked before mass modeling',()=>{
 const x=good();x.entities[0].technique='RUNTIME_PRIMITIVE_COMPOSITE';
 assert.ok(validatePreflightPlan(x).errors.includes('HIGH_SALIENCE_PROCEDURAL_FALLBACK_passenger-hero'));
});
test('a chair as HERO cannot default to blocks',()=>{
 const x=good();x.entities[0]={...entity(),id:'seat',kind:'furniture',visibility:'HERO',technique:'BLOCKOUT_ONLY'};
 assert.ok(validatePreflightPlan(x).errors.includes('HIGH_SALIENCE_PROCEDURAL_FALLBACK_seat'));
});
test('two serious alternatives are required for hero entity',()=>{
 const x=good();x.entities[0].alternatives=[x.entities[0].alternatives[0]];
 assert.ok(validatePreflightPlan(x).errors.includes('ALTERNATIVES_passenger-hero'));
});
test('not inventing provenance is a condition before scaling',()=>{
 const x=good();x.entities[0].proof.sourceGitBlob='';
 assert.ok(validateFirstArticle(x).errors.includes('ASSET_BYTES_AND_RIGHTS_UNPROVEN_passenger-hero'));
});
test('no first article screenshot means cannot multiply',()=>{
 const x=good();x.entities[0].proof.renderStatus='NOT_RUN';
 assert.equal(validateFirstArticle(x).mayScale,false);
});
test('black respawn / no early actual render cannot scale',()=>{
 const x=good();x.earlyRender.renderStatus='NOT_RUN';
 assert.ok(validateFirstArticle(x).errors.includes('SCENE_VISIBILITY_NOT_VERIFIED'));
});
test('existing good mechanical ventilator path remains allowed',()=>{
 const x=good();x.entities=[{...entity(),id:'fan',kind:'mechanism',technique:'MECHANICAL_PARAMETRIC',clearanceContract:'swept blades vs case',assemblyContract:'joints+parts+support'}];
 assert.equal(validatePreflightPlan(x).ok,true);
});
test('fan casing fit must be planned before assembly',()=>{
 const x=good();x.entities=[{...entity(),id:'fan',kind:'mechanism',technique:'MECHANICAL_PARAMETRIC',assemblyContract:'parts'}];
 assert.ok(validatePreflightPlan(x).errors.includes('MECHANISM_FIT_REQUIRED_fan'));
});
test('intentional pause is fine, automatic stutter is rejected',()=>{
 const a=good();a.camera.beats[0].endVelocity=0;a.camera.beats[1].startVelocity=0;
 assert.ok(validatePreflightPlan(a).errors.includes('UNINTENTIONAL_FULL_STOP_1'));
 a.camera.beats[1].motivation='actor hears strange sound';
 assert.ok(!validatePreflightPlan(a).errors.includes('UNINTENTIONAL_FULL_STOP_1'));
});
test('a 2.5D cutout is permitted with disclosed supported angles',()=>{
 const x=good();x.entities[0].technique='TEXTURED_IMPOSTOR';x.entities[0].asset={textureOrigin:'original cutout',anglesSupported:'frontal only'};
 assert.equal(validatePreflightPlan(x).ok,true);
});
test('approval before bulk requires BOTH source and real render evidence',()=>{
 const x=good();assert.equal(validateFirstArticle(x).mayScale,true);
 x.earlyRender.minimumVisible='';assert.equal(validateFirstArticle(x).mayScale,false);
});

test('acquisition checks actual instance, not merely a perfect promise',()=>{
 const x=good();x.entities[0].proof.instanceRef='';
 assert.ok(validatePreflightPlan(x).ok);
 assert.ok(validateAcquiredAssets(x).errors.includes('ACTUAL_INSTANCE_NOT_LINKED_passenger-hero'));
});
test('a textured model declared but primitive build used is rejected',()=>{
 const x=good();x.entities[0].proof.usedTechnique='RUNTIME_PRIMITIVE_COMPOSITE';
 assert.ok(validateAcquiredAssets(x).errors.includes('DECLARED_TECHNIQUE_NOT_ACTUALLY_USED_passenger-hero'));
});
test('license pending is not a license',()=>{
 const x=good();x.entities[0].asset.rights='Pendiente de verificar';
 assert.ok(validateAcquiredAssets(x).errors.includes('RIGHTS_STILL_PENDING_passenger-hero'));
});
test('acquisition gate does not demand a finished render, but scaling does',()=>{
 const x=good();x.entities[0].proof.renderRef='';x.earlyRender.renderRef='';
 assert.equal(validateAcquiredAssets(x).ok,true);
 assert.equal(validateFirstArticle(x).mayScale,false);
});
