// Candidate-only integration adapter: baseline 2.3.0 stays immutable.
import { compileSceneContract } from '../../versions/2.3.0/scene-compiler.mjs';
import { compilePreventiveReceipt } from './PREVENTIVE_COMPILER.mjs';

/**
 * Called by a future integrator after the executor has classified the human brief.
 * The same original brief and the same locked hashes feed both subcontracts.
 * No prompt changes, scene rewrites, index mutations, or silent promotion.
 */
export function compileSceneWithPrevention({
  humanBrief, briefSha256, flowSha256, projectId, projectCatalog,
  benchmarkMode=false, intent, route, firstArticle, evidence, gatesManifest
}) {
  const sceneContract = compileSceneContract({
    humanBrief, briefSha256, flowSha256, projectId, projectCatalog, benchmarkMode
  });
  const preventiveReceipt = compilePreventiveReceipt({
    humanBrief, briefSha256, pinnedFlowHash:flowSha256,
    intent, route, firstArticle, evidence, gatesManifest
  });
  if (sceneContract.brief.sha256 !== preventiveReceipt.briefSha256 ||
      sceneContract.flowSha256 !== preventiveReceipt.pinnedFlowHash) {
    throw Error('CONTRACT_PIN_DRIFT');
  }
  return {
    schema:'prometeo.3d.compiled-scene-with-prevention/v1',
    activation:'CANDIDATE_NOT_ACTIVE',
    baselineMethodVersion:'2.3.0',
    sceneContract,preventiveReceipt,
    preserveOriginalBrief:true,readiness:'INTEGRATOR_REVIEW_REQUIRED'
  };
}
