import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateReceipt} from './validate-run.mjs';
import {auditOperationalFlow} from './versions/2.1.0/flow-audit.mjs';
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;
const dig=o=>{const {sha256Canonical,...rest}=o;return createHash('sha256').update(JSON.stringify(sort(rest))).digest('hex')};
const f=load('./FLOW_3D_MASTER.json'),v21=load('./versions/2.1.0/flow.json'),idx=load('./FLOW_INDEX.json'),v20=load('./versions/2.0.0/flow.json');
const ops=load('./versions/2.1.0/STAGE_OPERATIONS.json'),cat=load('./versions/2.1.0/SCENE_INTENT_CATALOG.json'),q=load('./versions/2.1.0/COMPONENT_REFERENCE_MATRIX.json'),t=load('./versions/2.1.0/TOOLCHAIN_ROUTING.json');
test('current method 2.1.0 is exactly equal to immutable snapshot and hash',()=>{
 assert.equal(f.version,'2.1.0');assert.deepEqual(f,v21);assert.equal(idx.current,'2.1.0');assert.equal(idx.sha256Canonical,f.sha256Canonical);
 assert.equal(dig(f),f.sha256Canonical);assert.equal(v20.version,'2.0.0');assert.equal(dig(v20),v20.sha256Canonical);
});
test('280 nodes reference actual 17 stage procedures, no dead nodes',()=>{
 const s=auditOperationalFlow(f,ops,cat,q,t);assert.equal(s.ok,true,JSON.stringify(s));assert.equal(s.counts.reachable,280);
});
test('artistic failure or lack of evidence does not forbid human review of the attempt',()=>{
 const receipt={schema:'prometeo.3d.flow-run/v1',creationId:'bad-but-visible',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},status:'READY_FOR_ART_REVIEW',buildScope:'FULL_ATTEMPT',cameraMode:'MOVING',
 nodeResults:[{nodeId:'D40',status:'FAIL'}],provenance:{sourceRepo:'test',sourceRef:'candidate',sourceCommit:'a'.repeat(40)},scopeAudit:{scopeStatus:'DELIVERED_WITH_GAPS',missing:['city']},artApproval:'NOT_REVIEWED'};
 const r=validateReceipt(receipt,f);assert.equal(r.ok,true);assert.ok(r.warnings.includes('SCOPE_GAPS_VISIBLE__DO_NOT_CENSOR'));
 assert.equal(validateReceipt({...receipt,status:'VERIFIED'},f).ok,false);
});
test('a single first article may be shown, but must be honestly labeled incomplete',()=>{
 const receipt={schema:'prometeo.3d.flow-run/v1',creationId:'canary-only',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},status:'CANDIDATE',buildScope:'FIRST_ARTICLE',nodeResults:[],provenance:{sourceRepo:'test',sourceRef:'candidate',sourceCommit:'a'.repeat(40)}};
 const r=validateReceipt(receipt,f);assert.equal(r.ok,true);assert.ok(r.warnings.includes('FIRST_ARTICLE_NOT_FULL_SCENE__PUBLISH_AS_PARTIAL_NOT_COMPLETE'));
});
test('real source proof and user art approval required before VERIFIED',()=>{
 const receipt={schema:'prometeo.3d.flow-run/v1',creationId:'unknown',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},status:'VERIFIED',nodeResults:[],provenance:{sourceRepo:'r',sourceRef:'x',sourceCommit:'a'.repeat(40)}};
 const r=validateReceipt(receipt,f);assert.equal(r.ok,false);assert.ok(r.errors.includes('ART_APPROVAL_REQUIRED'));
});

test('character strategy is mandatory evidence for VERIFIED human actor, not a pre-release veto',()=>{
 const base={schema:'prometeo.3d.flow-run/v1',creationId:'char-review',flow:{id:f.id,version:f.version,sha256Canonical:f.sha256Canonical},status:'CANDIDATE',nodeResults:[],provenance:{sourceCommit:'a'.repeat(40)},characterCoverage:{hasVisibleHumans:true},characterDecision:{strategyId:'SCULPTED_REALISTIC_PBR',visualSourceId:'new-human',alternativeSources:['sculpt','mpfb'],separateMotionPackId:'walk-01',artisticStatus:'NOT_RUN'}};
 const r=validateReceipt(base,f);assert.equal(r.ok,true);
 assert.ok(r.warnings.includes('CHARACTER_VISUAL_NOT_USER_APPROVED'));
 assert.ok(validateReceipt({...base,status:'VERIFIED'},f).errors.includes('CHARACTER_VISUAL_ART_APPROVAL_REQUIRED'));
});

test('eight non-character stage procedures unchanged from flow 2.0',()=>{
 const oldOps=load('./versions/2.0.0/STAGE_OPERATIONS.json');
 const changed=new Set(['recovery','planning','acquisition','classification','humanoid','acting','qa','repair','persistence']);
 const before=oldOps.stages.filter(x=>!changed.has(x.id)),after=ops.stages.filter(x=>!changed.has(x.id));
 assert.equal(before.length,8);
 assert.deepEqual(after,before);
});
