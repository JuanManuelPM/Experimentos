import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compilePreventiveReceipt} from './PREVENTIVE_COMPILER.mjs';
const gates=JSON.parse(readFileSync(new URL('./PREVENTIVE_GATES.json', import.meta.url),'utf8'));
const sha=gates.basedOn.sha256Canonical;
const baseline={
  "humanBrief": "Producir una escena interactiva interior completa con techo y cámara usable",
  "briefSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "pinnedFlowHash": sha,
  "intent": {
    "experienceType": "interior_explorable",
    "heroView": "third_person",
    "inputMode": "touch",
    "referenceScale": "adult reference 1.7m",
    "artLanguage": "stylized grounded",
    "comparables": [
      {
        "label": "Arquitectura de referencia A",
        "source": "registro-interno-A",
        "rightsNote": "solo comparación, no copiar"
      },
      {
        "label": "Arquitectura de referencia B",
        "source": "registro-interno-B",
        "rightsNote": "solo comparación, no copiar"
      }
    ],
    "capabilityTags": [
      "walkable_interior",
      "moving_actors",
      "3d_studio_or_game_ui"
    ],
    "highestRisks": [
      "occlusion hides actor",
      "camera crosses roof"
    ]
  },
  "route": {
    "chosenTechnique": "dynamic occluder fade with collision",
    "fallbackTechnique": "interior orbit camera",
    "reason": "keeps building closed but actors visible",
    "switchCondition": "switch if sightline fails at roof/corner"
  },
  "firstArticle": {
    "artifact": "single closed room with door, furniture, one actor",
    "cheapExperiment": "circle roof and doorway, two heights, portrait/landscape",
    "decisionCriterion": "actor/objective visible without passing wall",
    "scopeLimit": "one room before duplication"
  },
  "evidence": {
    "status": "NOT_RUN"
  }
};
baseline.gatesManifest=gates;
test('interior: camera/scale selected before replication, rhythm omitted',()=>{
 const out=compilePreventiveReceipt(baseline);
 assert.ok(out.selectedGates.some(g=>g.id==='INTERIOR_CAMERA'));
 assert.ok(out.selectedGates.some(g=>g.id==='LOC_ORIENT'));
 assert.ok(!out.selectedGates.some(g=>g.id==='RHYTHM_TOUCH'));
 assert.equal(out.result,'PREVENTIVE_PLAN_COMPILED_PROOF_NOT_RUN');
 assert.match(out.firstArticle.cheapExperiment,/roof|doorway/i);
});
test('rhythm: audio/tap/hold/slide required without unrelated camera gate',()=>{
 const out=compilePreventiveReceipt({...baseline,intent:{...baseline.intent,experienceType:'rhythm',capabilityTags:['brief_requests_rhythm_game','3d_studio_or_game_ui']},firstArticle:{artifact:'licensed original loop',cheapExperiment:'tap hold slide and focus recovery',decisionCriterion:'no drift or missed release',scopeLimit:'8 seconds'}});
 assert.ok(out.selectedGates.some(g=>g.id==='RHYTHM_TOUCH'));
 assert.ok(!out.selectedGates.some(g=>g.id==='INTERIOR_CAMERA'));
 assert.equal(out.evidence.status,'NOT_RUN');
});
test('reject evidence-free PASS',()=>assert.throws(()=>compilePreventiveReceipt({...baseline,evidence:{status:'PASS_WITH_ACTUAL_EVIDENCE'}}),/PROOF_AND_DECISION_REQUIRED/));
test('reject same route disguised as alternative',()=>assert.throws(()=>compilePreventiveReceipt({...baseline,route:{...baseline.route,fallbackTechnique:baseline.route.chosenTechnique}}),/TECHNIQUES_MUST_DIFFER/));
test('reject hash drift and silent method activation',()=>{
 assert.throws(()=>compilePreventiveReceipt({...baseline,pinnedFlowHash:'f'.repeat(64)}),/PINNED_FLOW_MISMATCH/);
 assert.throws(()=>compilePreventiveReceipt({...baseline,gatesManifest:{...gates,status:'ACTIVE'}}),/WRONG_GATE_STATUS/);
});
