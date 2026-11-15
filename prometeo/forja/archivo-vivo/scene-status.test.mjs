import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {sceneStatusText} from './scene-status.mjs';
import {resolveClip} from './clip-resolver.mjs';

function harness() {
  const source = readFileSync(new URL('./scene.mjs', import.meta.url), 'utf8');
  const begin = source.indexOf('function updateStatus()');
  const end = source.indexOf('async function loadFox()');
  assert.ok(begin >= 0 && end > begin, 'must test the actual scene report/setClip code');
  const state = {
    loaded: 0, total: 4, failed: [], clips: [
      {name: 'AnimalArmature|Idle'}, {name: 'AnimalArmature|Walk'}, {name: 'AnimalArmature|Gallop'}
    ], mixer: {clipAction: () => ({reset() {return this;}, fadeIn() {return this;}, play() {return this;}})},
    action: null, requested: 'Idle', clipError: null, activeClipName: null, settled: false
  };
  const status = {textContent: ''};
  const count = {textContent: ''};
  const pressed = {};
  const document = {
    body: {dataset: {}},
    querySelectorAll: () => ['Idle', 'Walk', 'Gallop'].map(anim => ({
      dataset: {anim}, setAttribute: (_k, v) => {pressed[anim] = v;}
    }))
  };
  const sandbox = {state, status, count, document, sceneStatusText, resolveClip};
  vm.runInNewContext(source.slice(begin, end) + '\nthis.__api={report,setClip,updateStatus};', sandbox);
  return {state, status, count, document, pressed, ...sandbox.__api};
}

test('FAIL asset remains visible after valid Fox Walk action', () => {
  const h = harness();
  h.report('Oak.glb', new Error('HTTP 404'));
  h.setClip('Walk');
  assert.match(h.status.textContent, /Oak\.glb HTTP 404/);
  assert.equal(h.state.activeClipName, 'AnimalArmature|Walk');
  assert.equal(h.pressed.Walk, 'true');
});
test('FAIL asset remains visible after successful later asset and Gallop', () => {
  const h = harness();
  h.report('Oak.glb', Error('missing'));
  h.report('Chair.glb');
  h.setClip('Gallop');
  assert.match(h.status.textContent, /Oak\.glb missing/);
  assert.equal(h.count.textContent, '1 / 4 originales');
});
test('missing Fox clip and asset error are both visible', () => {
  const h = harness();
  h.report('Anvil OBJ/MTL', Error('bad texture'));
  h.setClip('Teleport');
  assert.match(h.status.textContent, /Anvil OBJ\/MTL bad texture/);
  assert.match(h.status.textContent, /Clip Teleport no encontrado/);
});
test('ambiguous Fox clips preserve asset error and show ambiguity', () => {
  const h = harness();
  h.state.clips = [{name: 'A|Walk'}, {name: 'B|Walk'}];
  h.report('Oak.glb', Error('404'));
  h.setClip('Walk');
  assert.match(h.status.textContent, /Oak\.glb 404/);
  assert.match(h.status.textContent, /AMBIGUOUS_CLIP:Walk/);
});
test('recovery of clip clears clip error but does not erase asset failure', () => {
  const h = harness();
  h.report('Oak.glb', Error('404'));
  h.setClip('Missing');
  h.setClip('Idle');
  assert.equal(h.state.clipError, null);
  assert.match(h.status.textContent, /Oak\.glb 404/);
  assert.doesNotMatch(h.status.textContent, /Clip Missing/);
});
test('settled completion cannot hide a previous load failure', () => {
  const h = harness();
  h.report('Chair.glb', Error('invalid GLB'));
  h.setClip('Idle');
  h.state.settled = true;
  h.updateStatus();
  assert.match(h.status.textContent, /Chair\.glb invalid GLB/);
  assert.doesNotMatch(h.status.textContent, /modelos reales disponibles/);
});
test('all successful imports retain success label, clip and counts', () => {
  const h = harness();
  for (const s of ['Fox.glb', 'Oak.glb', 'Chair.glb', 'Anvil OBJ/MTL']) h.report(s);
  h.setClip('Gallop');
  h.state.settled = true;
  h.updateStatus();
  assert.match(h.status.textContent, /4 \/ 4 modelos reales disponibles/);
  assert.match(h.status.textContent, /AnimalArmature\|Gallop/);
  assert.equal(h.document.body.dataset.loaded, '4');
});
