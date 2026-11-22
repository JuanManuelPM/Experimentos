// Synthetic fixtures: these URLs are placeholders and ARE NOT visual evidence of W6 artworks.
import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateArtDirectionGate as gate} from './art-direction-gate.mjs';
const base=()=>{
 const actor={
  discipline:'actor',intent:'A cinematic close-up performance with subtle facial acting.',
  artLanguage:'Integrated natural facial planes and coherent directional hair silhouette.',
  references:[{url:'https://threejs.org/manual/pages/animation-system.html',observedDetail:'glTF animations may combine bone and morph channels in AnimationMixer.'}],
  alternatives:[
   {id:'mesh',family:'integrated-rigged-mesh',tradeoff:'requires sculpt and rigging',availability:'AVAILABLE',provenance:'original'},
   {id:'sprite',family:'deliberate-2.5d',tradeoff:'limits orbit',availability:'AVAILABLE',provenance:'original'}
  ],selectedRoute:'mesh',humanApproved:false,
  risks:[{stage:'face',cause:'disjointed features',counterexample:'nose attached without continuous transition',owner:'3d-art'}],
  spikes:[
   {kind:'FACE_MULTIVIEW',state:'OBSERVED',evidenceRef:'https://example.org/test-fixture/face.png',observation:'synthetic fixture only',counterexample:'detached eyes'},
   {kind:'LIPSYNC_FIRST_TAKE',state:'OBSERVED',evidenceRef:'https://example.org/test-fixture/take.webm',observation:'synthetic fixture only',counterexample:'delayed lip movement'}
  ],actorViews:['front','profile','close-up'].map(view=>({view,state:'OBSERVED',screenshotUrl:'https://example.org/test-fixture/'+view+'.png',silhouetteNotes:'synthetic fixture only'}))
 };
 return actor;
};
const ck=(name,build,want)=>test(name,()=>{
 const v=gate(build()); assert.equal(v.status,want,JSON.stringify(v));
 assert.equal(v.warnings.some(x=>x.includes('does not inspect pixels')),true);
});
ck('traceability only READY never human approval',base,'READY_FOR_FIRST_SLICE');
ck('unintended detached face blocks production',()=>{const x=base();x.alternatives[0].family='detached-primitive-face';return x},'BLOCKED');
ck('unseen actor profile requires proof',()=>{const x=base();x.actorViews=x.actorViews.filter(v=>v.view!=='profile');return x},'SPIKE_REQUIRED');
ck('worker cannot approve own art',()=>{const x=base();x.humanApproved=true;return x},'INVALID');
ck('external model needs actual license record',()=>{const x=base();x.alternatives[0].provenance='external';return x},'BLOCKED');
ck('procedural mechanisms may use primitives',()=>{const x=base();x.discipline='mechanism';x.alternatives[0].family='parametric-mechanical';x.spikes=[{kind:'CONTACT_CYCLE',state:'OBSERVED',evidenceRef:'https://example.org/fixture.png',observation:'synthetic fixture only',counterexample:'roller clipping cam'}];return x},'READY_FOR_FIRST_SLICE');
ck('single-ray architecture is insufficient',()=>{const x=base();x.discipline='architecture';x.spikes=[{kind:'INTERIOR_VISIBILITY',state:'OBSERVED',evidenceRef:'https://example.org/fixture.png',observation:'synthetic fixture only',counterexample:'wall fills screen'}];return x},'SPIKE_REQUIRED');
ck('390/1440 multiroute evidence structurally passes',()=>{const x=base();x.discipline='architecture';x.spikes=[{kind:'INTERIOR_VISIBILITY',state:'OBSERVED',evidenceRef:'https://example.org/fixture.png',observation:'synthetic fixture only',counterexample:'wall fills screen'}];x.cameraViews=[390,1440].map(viewportWidth=>({viewportWidth,state:'OBSERVED',obscuredSubjectFraction:.2,screenshotUrl:'https://example.org/fixture.png',samples:['near-wall','doorway','room-overview']}));return x},'READY_FOR_FIRST_SLICE');
ck('wall covering most screen is rejected',()=>{const x=base();x.discipline='architecture';x.spikes=[{kind:'INTERIOR_VISIBILITY',state:'OBSERVED',evidenceRef:'https://example.org/fixture.png',observation:'synthetic fixture only',counterexample:'wall fills screen'}];x.cameraViews=[390,1440].map(viewportWidth=>({viewportWidth,state:'OBSERVED',obscuredSubjectFraction:.87,screenshotUrl:'https://example.org/fixture.png',samples:['near-wall','doorway','room-overview']}));return x},'SPIKE_REQUIRED');
ck('generic benchmark URL with no observation invalid',()=>{const x=base();x.references=[];return x},'INVALID');
ck('cannot self-certify professional art',()=>{const x=base();x.qualityClaim='PROFESSIONAL_APPROVED';return x},'INVALID');
ck('missing source response is not ready',()=>{const x=base();x.spikes[0].state='NOT_RUN';return x},'SPIKE_REQUIRED');
