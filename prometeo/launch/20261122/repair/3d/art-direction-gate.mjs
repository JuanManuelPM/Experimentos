/* PROMETEO 3D Art Direction Gate v2 candidate: non-perceptual, preproduction only.
 * Does NOT score beauty or authenticate screenshots. Use alongside real first-article render.
 */
export function evaluateArtDirectionGate(spec) {
  const errors=[],blocked=[],spikes=[],warnings=[];
  const rule=(cond,msg)=>{if(!cond)errors.push(msg);};
  if(!spec||typeof spec!=="object")return {status:"INVALID",errors:["missing spec"],blocked,spikes,warnings};
  const requirement={
    actor:["FACE_MULTIVIEW","LIPSYNC_FIRST_TAKE"],
    architecture:["INTERIOR_VISIBILITY"],
    world:["PLAYABLE_CYCLE"],
    cinema:["SHOT_CONTINUITY","EXPORT_SAMPLE"],
    mechanism:["CONTACT_CYCLE"],
    forest:["SPECIES_SILHOUETTE","PERF_BUDGET"],
    capture:["SOURCE_RIGHTS","ALIGNMENT_SAMPLE"],
    atlas:["LIVE_DATA_SAMPLE","GEO_ALIGNMENT"],
    editor:["REAL_GLB_ROUNDTRIP"],
    product:["JOINT_INTERFERENCE","BOM_ALIGNMENT"]
  };
  rule(Object.hasOwn(requirement,spec.discipline),"discipline unknown");
  rule(typeof spec.intent==="string"&&spec.intent.trim().length>12,"intent must be concrete");
  rule(typeof spec.artLanguage==="string"&&spec.artLanguage.trim().length>12,"artLanguage must describe intended silhouette/material/acting");
  rule(Array.isArray(spec.references)&&spec.references.some(r=>/^https:\/\//.test(r.url||"")&&(r.observedDetail||"").length>=24),"at least one actually examined benchmark with concrete visual/technical observation required");
  const routes=Array.isArray(spec.alternatives)?spec.alternatives:[];
  rule(routes.length>=2&&new Set(routes.map(x=>x.family)).size>=2,"two genuinely different technical representation families required");
  rule(routes.some(x=>x.id===spec.selectedRoute),"selectedRoute must match a documented alternative");
  for(const alt of routes)rule(Boolean(alt.id&&alt.family&&alt.tradeoff&&alt.availability),"all alternatives need id, family, tradeoff and verified availability status");
  const chosen=routes.find(x=>x.id===spec.selectedRoute);
  if(chosen&&chosen.availability==="UNAVAILABLE")blocked.push("selected method unavailable; switch representation");
  if(spec.discipline==="actor" && chosen?.family==="detached-primitive-face" &&
     !spec.intentionalPrimitiveStyle?.observedLookdevRef)blocked.push("cinematic actor built as unintentional detached primitive collage; choose viable sculpt/rig/2.5D route before full build");
  if(chosen?.provenance==="external" && !(chosen.sourceUrl&&chosen.license&&chosen.licenseCompatibility==="CHECKED"))
    blocked.push("external asset without recorded source, license and compatibility");
  if(spec.humanApproved===true)errors.push("the worker cannot set HUMAN_APPROVED=true");
  const proofs=Array.isArray(spec.spikes)?spec.spikes:[];
  for(const kind of (requirement[spec.discipline]||[])){
    const p=proofs.find(x=>x.kind===kind);
    if(!p || p.state!=="OBSERVED" || !p.evidenceRef || !p.counterexample || !p.observation)
      spikes.push(`${kind}: real first-article observation and counterexample missing`);
  }
  if(spec.discipline==="architecture"){
    const views=spec.cameraViews||[];
    for(const w of [390,1440]){
      const valid=views.some(v=>v.viewportWidth===w && v.state==="OBSERVED" &&
        typeof v.obscuredSubjectFraction==="number"&&v.obscuredSubjectFraction<=0.25&&
        /^https?:\/\//.test(v.screenshotUrl||"") &&
        ["near-wall","doorway","room-overview"].every(t=>(v.samples||[]).includes(t)));
      if(!valid)spikes.push(`INTERIOR_VISIBILITY: ${w}px near-wall, doorway, overview and visible subject unsupported`);
    }
  }
  if(spec.discipline==="actor"){
    const views=spec.actorViews||[];
    for(const view of ["front","profile","close-up"]){
      if(!views.some(v=>v.view===view&&v.state==="OBSERVED"&&v.screenshotUrl&&v.silhouetteNotes))
        spikes.push(`FACE_MULTIVIEW: observed ${view} with screenshot and silhouette commentary missing`);
    }
  }
  if(!Array.isArray(spec.risks)||!spec.risks.some(r=>r.stage&&r.cause&&r.counterexample&&r.owner))
    errors.push("at least one causal risk with owner and counterexample required");
  if(spec.qualityClaim==="PROFESSIONAL_APPROVED")errors.push("self-certified artistic quality forbidden");
  const status=errors.length?"INVALID":blocked.length?"BLOCKED":spikes.length?"SPIKE_REQUIRED":"READY_FOR_FIRST_SLICE";
  warnings.push("This evaluator checks traceability and explicit first-article evidence claims; it does not inspect pixels, sound, meshes or permissions by itself.");
  warnings.push("READY_FOR_FIRST_SLICE never means finished artwork, mobile tested, or human approved.");
  return {status,errors,blocked,spikes,warnings,requiredFirstArticles:requirement[spec.discipline]||[]};
}
