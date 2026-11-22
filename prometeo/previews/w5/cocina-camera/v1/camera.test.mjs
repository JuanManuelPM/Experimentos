import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const scene=readFileSync(new URL('./scene.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');

test('GLB originales y secuencia de movimiento continúan',()=>{
 for(const s of ['KENNEY_COMMIT','SOLDIER_COMMIT','kitchenfridge','kitchencabinet','GLTFLoader','loadActor()','loadProps()','mixer.update(dt)','pose(t)'])assert.ok(scene.includes(s),s);
});
test('gesture and follow controls integrated',()=>{
 assert.match(scene,/THREE\.TOUCH\.ROTATE/);
 assert.match(scene,/THREE\.TOUCH\.DOLLY_ROTATE/);
 assert.match(scene,/controls\.enablePan=false/);
 assert.match(scene,/updateCameraFollow\(\)/);
 assert.match(html,/id="follow"[^>]*aria-label="Seguir personaje"/);
});
test('camera envelope remains inside sidewalls at max zoom',()=>{
 assert.ok(-.55-13.5*Math.sin(.26)>-4.36);
 assert.ok(-.55+13.5*Math.sin(.32)<4.36);
 assert.match(scene,/camera\.fov=w\/h<\.80\?56:50/);
 assert.match(scene,/controls\.minDistance=4\.2;controls\.maxDistance=13\.5/);
});
test('HTML loads new camera, watchdog and navigation',()=>{
 assert.match(html,/scene\.mjs\?v=camera-20261121-v1/);
 assert.match(html,/El motor 3D no llegó a iniciar/);
 assert.match(html,/\.\.\/\.\.\/\.\.\/\.\.\/project-explorer\/launcher\.js/);
});
