// Execute using: node --test test-preflight.mjs
import test from 'node:test';import assert from 'node:assert/strict';
import {evaluatePreflight} from './preflight-engine.mjs';
const evidence=kind=>[{kind,uri:'repo:tests/reference.png',producedAt:'2026-11-15',observer:'independent-QA'}];
function good(){
 const ids=['references','rights','character','vehicle','pose','environment','weather','lighting','camera','render','mobile','human'];
 const m={projectId:'test-real',scope:{components:['character','vehicle','environment','weather'],characterVehicleInteraction:true},facts:{},evidence:{}};
 for(let k of ids)m.evidence[k]=evidence(k==='rights'?'license_file':k==='references'?'source_reference':k==='pose'?'geometry_probe':k==='render'||k==='mobile'?'test_report':k==='human'?'human_approval':'observed_browser_frame');
 m.facts.references={reviewed:['character','vehicle','environment','weather','lighting','camera'].map(category=>({category,url:'https://example.com/'+category,observed:true}))};
 m.facts.rights={assets:[{id:'sedan',licenseVerified:true,sourceUrl:'https://example.com/licence'}]};
 m.facts.character={authoredMesh:true,front:true,quarter:true,profile:true,clothingDesigned:true,rigOrIntentionalStatic:true};
 m.facts.vehicle={authoredMesh:true,separateMaterials:true,forwardDot:.99,wheelGroundGapMeters:0,headlightsMotivated:true};
 m.facts.pose={seatedVerified:true,maxPenetrationMeters:.01,leftHandWheelGapMeters:.04,rightHandWheelGapMeters:.04,deterministic:true};
 m.facts.environment={architectureDesigned:true,roadBuiltAsKit:true,depthLayers:3,materialVariation:true};
 m.facts.weather={renderTechnique:'instanced_camera_sprites',depthLayers:3,lightResponse:true,occlusion:true,temporalRepeatable:true};
 m.facts.lighting={keyMotivated:true,practicalsVisible:true,contactShadows:true,nightReadable:true,threeFramesReviewed:true};
 m.facts.camera={shotCount:9,allShotFramesCaptured:true,subjectNotClipped:true,spatialContinuity:true,negativeSpaceForCaptions:true};
 m.facts.render={webgl2RealFrames:true,timelineStartEnd:true,glbRoundtrip:true};
 m.facts.mobile={androidPhysical:true,minFps:28,noCrashes:true};
 m.facts.human={approved:true,reviewerRole:'human',approvalRef:'repo:human/art-signoff.md'};
 return m;
}
test('completed fixture passes',()=>{const r=evaluatePreflight(good());assert.equal(r.decision,'ELIGIBLE_FOR_RELEASE');assert.equal(r.counts.PASS,12)});
test('missing frame evidence blocks production',()=>{let m=good();delete m.evidence.lighting;let r=evaluatePreflight(m);assert.equal(r.decision,'STOP_PREPRODUCTION');assert.equal(r.gates.find(x=>x.id==='lighting').status,'UNVERIFIED')});
test('lines rain and silhouette unsupported block',()=>{let m=good();m.facts.weather.renderTechnique='line_segments';m.facts.character.profile=false;let r=evaluatePreflight(m);assert.ok(r.blockers.some(x=>x.gate==='weather'));assert.ok(r.blockers.some(x=>x.gate==='character'))});
test('reverse car blocks, even with frames',()=>{let m=good();m.facts.vehicle.forwardDot=-1;assert.equal(evaluatePreflight(m).decision,'STOP_PREPRODUCTION')});
test('seat penetration rejects rig claim',()=>{let m=good();m.facts.pose.maxPenetrationMeters=.21;let r=evaluatePreflight(m);assert.ok(r.blockers.some(x=>x.gate==='pose'))});
test('automatic art approval is impossible',()=>{let m=good();m.facts.human.reviewerRole='agent';let r=evaluatePreflight(m);assert.equal(r.decision,'AWAIT_HUMAN_REVIEW');assert.equal(r.releaseAllowed,false)});
test('no Android physical test blocks release',()=>{let m=good();m.facts.mobile.androidPhysical=false;let r=evaluatePreflight(m);assert.equal(r.decision,'STOP_RELEASE')});
test('other scenes can omit vehicle, pose and rain',()=>{let m=good();m.scope={components:['character','environment']};m.facts.references.reviewed=m.facts.references.reviewed.filter(x=>x.category!=='vehicle'&&x.category!=='weather');let r=evaluatePreflight(m);assert.equal(r.gates.some(x=>x.id==='pose'||x.id==='vehicle'||x.id==='weather'),false);assert.equal(r.preproductionAllowed,true)});
test('empty source fails closed',()=>{let r=evaluatePreflight({});assert.equal(r.preproductionAllowed,false);assert.equal(r.approval,'PENDING_HUMAN')});
test('text-only proof is not a real observation',()=>{let m=good();m.evidence.camera=[{kind:'agent_claim',uri:'repo:report.md',producedAt:'2026-11-15',observer:'ai'}];let r=evaluatePreflight(m);assert.notEqual(r.gates.find(x=>x.id==='camera').status,'PASS')});

test('unmeasured renderer and mobile remain UNVERIFIED, not falsely FAIL',()=>{let m=good();m.facts.render.reviewState='NOT_RUN';m.facts.render.timelineStartEnd=false;m.facts.mobile.reviewState='NOT_RUN';m.facts.mobile.androidPhysical=false;let r=evaluatePreflight(m);assert.equal(r.gates.find(x=>x.id==='render').status,'UNVERIFIED');assert.equal(r.gates.find(x=>x.id==='mobile').status,'UNVERIFIED');assert.equal(r.decision,'STOP_RELEASE')});
