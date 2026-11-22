// Candidate-only overlay for 2.3.0. Not authoritative until integrator promotion.
// Deterministic validation of a semantic plan prepared internally by the executor.
// It does not infer art direction from keywords, render a scene, or certify beauty.
const contracts = {
  "ART_SCALE": "artDirectionAndReferenceScale",
  "INTERIOR_CAMERA": "cameraOcclusion",
  "LOC_ORIENT": "motionForward",
  "INTERACTION_MEANING": "interactionCausality",
  "WORLD_COMPOSITION": "worldUseLogic",
  "VEHICLE_CRAFT": "vehicleScale",
  "SHELL_UI": "uiShell",
  "RHYTHM_TOUCH": "rhythmTiming",
  "CHARACTER_IDENTITY": "characterLookdev"
};
function nonempty(v,label){if(typeof v!=="string"||!v.trim())throw Error("MISSING_"+label);return v.trim()}
function unique(values){return [...new Set(values)]}
export function compilePreventiveReceipt({humanBrief,briefSha256,pinnedFlowHash,intent,route,firstArticle,evidence,gatesManifest}){
 nonempty(humanBrief,"HUMAN_BRIEF");
 if(!/^[a-f0-9]{64}$/.test(briefSha256||""))throw Error("INVALID_BRIEF_SHA");
 if(pinnedFlowHash!==gatesManifest?.basedOn?.sha256Canonical)throw Error("PINNED_FLOW_MISMATCH");
 if(gatesManifest.status!=="CANDIDATE_NOT_ACTIVE")throw Error("WRONG_GATE_STATUS");
 const t=intent||{};
 for(const name of ["experienceType","heroView","inputMode","referenceScale","artLanguage"])nonempty(t[name],name.toUpperCase());
 if(!Array.isArray(t.comparables)||t.comparables.length<2||!t.comparables.slice(0,2).every(c=>c&&nonempty(c.label,"COMPARABLE_LABEL")&&nonempty(c.source,"COMPARABLE_SOURCE")&&nonempty(c.rightsNote,"COMPARABLE_RIGHTS")))throw Error("TWO_LAWFUL_COMPARABLES_REQUIRED");
 const tags=unique(t.capabilityTags||[]);
 if(tags.some(x=>typeof x!=="string"))throw Error("INVALID_TAG");
 const accepted=new Set(gatesManifest.gates.map(g=>g.trigger));
 if(tags.some(x=>!accepted.has(x)))throw Error("UNKNOWN_TAG");
 if(!Array.isArray(t.highestRisks)||t.highestRisks.length<1||t.highestRisks.length>3||!t.highestRisks.every(x=>typeof x==="string"&&x.trim()))throw Error("ONE_TO_THREE_REAL_RISKS_REQUIRED");
 for(const key of ["chosenTechnique","fallbackTechnique","reason","switchCondition"])nonempty(route?.[key],key.toUpperCase());
 if(route.chosenTechnique.trim().toLowerCase()===route.fallbackTechnique.trim().toLowerCase())throw Error("TECHNIQUES_MUST_DIFFER");
 for(const key of ["artifact","cheapExperiment","decisionCriterion","scopeLimit"])nonempty(firstArticle?.[key],key.toUpperCase());
 const selected=gatesManifest.gates.filter(g=>g.trigger==="all_visual_worlds"||tags.includes(g.trigger));
 const e=evidence||{status:"NOT_RUN"};
 if(!gatesManifest.evidenceStatus.includes(e.status))throw Error("INVALID_EVIDENCE_STATUS");
 if(["PASS_WITH_ACTUAL_EVIDENCE","FAIL"].includes(e.status)){
  if(!e.artifactUrl||!/^https?:\/\/\S+/.test(e.artifactUrl)||!e.observed||!e.decisionConsequence)throw Error("PROOF_AND_DECISION_REQUIRED");
 }
 if(e.status==="NOT_APPLICABLE"&&selected.length)throw Error("SELECTED_GATES_CANNOT_BE_NA");
 const verdict=e.status==="FAIL"?"CHANGE_REPRESENTATION_BEFORE_MASS_AUTHORING":e.status==="PASS_WITH_ACTUAL_EVIDENCE"?"FIRST_ARTICLE_EVIDENCED_NO_ART_APPROVAL":"PREVENTIVE_PLAN_COMPILED_PROOF_NOT_RUN";
 return {
  schema:"prometeo.3d.preventive-receipt/v1",
  status:"CANDIDATE_NOT_ACTIVE",
  stage:"planning_before_mass_authoring",
  briefSha256,pinnedFlowHash,experienceType:t.experienceType,heroView:t.heroView,inputMode:t.inputMode,
  referenceScale:t.referenceScale,artLanguage:t.artLanguage,
  comparables:t.comparables.map(c=>({label:c.label,source:c.source,rightsNote:c.rightsNote})),
  highestRisks:[...t.highestRisks],
  selectedGates:selected.map(g=>({id:g.id,trigger:g.trigger,contract:contracts[g.id]||"unmapped",preflight:g.preflight,firstArticleExpectation:g.firstArticle,reject:g.reject,repair:g.repair})),
  decision:{...route},firstArticle:{...firstArticle},
  evidence:{status:e.status,artifactUrl:e.artifactUrl||null,observed:e.observed||null,decisionConsequence:e.decisionConsequence||null},
  result:verdict,
  productionRule:"COMPLETE_FULL_ORIGINAL_BRIEF; ART_FAILURE_REQUIRES_ROUTE_CHANGE_EARLY_NOT_SILENT_ABORT",
  canonRule:"NO_PROMOTION; NO_CHANGE_TO_2_3_0_OR_FLOW_INDEX; NO_AUTO_ART_APPROVAL",
  provenance:{manifestSchema:gatesManifest.schema,manifestStatus:gatesManifest.status}
 };
}
