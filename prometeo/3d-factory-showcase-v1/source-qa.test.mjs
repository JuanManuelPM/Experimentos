import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=async name=>readFile(new URL(name,import.meta.url),'utf8');
const [app,html,scene,film]=await Promise.all([
 read('./app.mjs'),read('./index.html'),
 read('./scene-manifest.json').then(JSON.parse),
 read('./shotlist.json').then(JSON.parse)
]);
test('15 source assets with pinned CC0 repository',()=>{
 assert.equal(scene.assetCount,15);
 assert.equal(scene.instances.length,15);
 assert.equal(scene.sourceCommit,'3ddcc695adbba9fb918cf31b7c139b3f95b76910');
 assert.equal(scene.copyright,'Kenney CC0 1.0');
});
test('Stable scene IDs and valid scale/position',()=>{
 assert.equal(new Set(scene.instances.map(x=>x.id)).size,15);
 scene.instances.forEach(x=>{
  assert.ok(x.file.includes('/'));
  for(const k of ['h','x','z','rotation'])assert.ok(Number.isFinite(x[k]));
  assert.ok(x.h>0);
 });
});
test('6 different buildings and 2 cars',()=>{
 const buildings=scene.instances.filter(x=>x.file.includes('building'));
 const cars=scene.instances.filter(x=>x.file.startsWith('car-kit/'));
 assert.equal(buildings.length,6);assert.equal(cars.length,2);
 assert.equal(new Set(buildings.map(x=>x.file)).size,6);
});
test('9 shots, exact frame clock, 24 FPS, 432 total',()=>{
 assert.equal(film.shotCount,9);
 assert.deepEqual(film.fps,{numerator:24,denominator:1});
 assert.equal(film.totalFrames,432);
 for(const [i,s] of film.shots.entries()){
  assert.equal(s.startFrame,i*48);assert.equal(s.endFrame,(i+1)*48);
  assert.ok(s.name&&s.label&&s.fov>=30&&s.fov<=55);
  for(const k of ['p0','p1','a0','a1']){
   assert.equal(s[k].length,3);assert.ok(s[k].every(Number.isFinite));
  }
 }
});
test('Camera is a pure time-based pose track',()=>{
 assert.ok(app.includes('function cameraAt(frame)'));
 assert.ok(app.includes('function renderCamera()'));
 assert.ok(app.includes('camera.position.copy(s.position)'));
 assert.ok(app.includes('controls.enabled=orbit'));
});
test('A/B materials use photographic CC0 and authored atlas',()=>{
 assert.ok(app.includes('polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_01'));
 assert.ok(app.includes('function paintedTexture()'));
 assert.ok(app.includes('PHOTO_UNAVAILABLE_PBR_FALLBACK'));
});
test('Tabs and key controls exist',()=>{
 for(const x of ['materials','environment','cameras'])assert.ok(html.includes('data-mode="'+x+'"'));
 for(const x of ['viewport','seek','play','next','prev','inspect','asset-count'])assert.ok(html.includes('id="'+x+'"'));
 assert.ok(html.includes('@media(max-width:700px)'));
 assert.ok(app.includes('__PROMETEO_QA__'));
});
test('No fake WebGL fallback passed as a render',()=>{
 assert.ok(app.includes("getContext('webgl2'"));
 assert.ok(app.includes('WEBGL2 NO DISPONIBLE'));
 assert.ok(app.includes('Miniaturas del catálogo original'));
});
