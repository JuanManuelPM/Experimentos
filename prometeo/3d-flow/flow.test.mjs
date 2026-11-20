import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateReceipt} from './validate-run.mjs';
import {auditOperationalFlow} from './versions/2.0.0/flow-audit.mjs';
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const sort=x=>Array.isArray(x)?x.map(sort):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sort(x[k])])):x;
const dig=o=>{const {sha256Canonical,...rest}=o;return createHash('sha256').update(JSON.stringify(sort(rest))).digest('hex')};
const f=load('./FLOW_3D_MASTER.json'),v2=load('./versions/2.0.0/flow.json'),idx=load('./FLOW_INDEX.json'),v14=load('./versions/1.4.0/flow.json');
const ops=load('./versions/2.0.0/STAGE_OPERATIONS.json'),cat=load('./versions/2.0.0/SCENE_INTENT_CATALOG.json'),q=load('./versions/2.0.0/COMPONENT_REFERENCE_MATRIX.json'),t=load('./versions/2.0.0/TOOLCHAIN_ROUTING.json');
test('current method 2.0.0 is exactly equal to immutable snapshot and hash',()=>{
 assert.equal(f.version,'2.0.0');assert.deepEqual(f,v2);assert.equal(idx.current,'2.0.0');assert.equal(idx.sha256Canonical,f.sha256Canonical);
 assert.equal(dig(f),f.sha256Canonical);assert.equal(v14.version,'1.4.0');assert.equal(dig(v14),v14.sha256Canonical);
});
test('269 nodes reference actual 17 stage procedures, no dead nodes',()=>{
 const s=auditOperationalFlow(f,ops,cat,q,t);assert.equal(s.ok,true,JSON.stringify(s));assert.equal(s.counts.reachable,269);
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
