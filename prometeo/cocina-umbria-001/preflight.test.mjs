import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, mkdtempSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const sceneFile=fileURLToPath(new URL('./scene.mjs',import.meta.url));
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const scene=readFileSync(sceneFile,'utf8');
function checkModule(file){
  const p=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});
  return {code:p.status,stderr:p.stderr};
}
test('BOOT-SYNTAX-001: el módulo real publicado pasa node --check',()=>{
 const result=checkModule(sceneFile);
 assert.equal(result.code,0,result.stderr);
});
test('BOOT-SYNTAX-002: el defecto de lluvia original genera FAIL',()=>{
 assert.match(scene,/a\.array\[4\]=y-\.19;\s*a\.needsUpdate=true;/);
 const root=mkdtempSync(join(tmpdir(),'prometeo-syntax-reg-'));
 try {
  const broken=scene.replace('a.array[4]=y-.19; a.needsUpdate=true;','a.array[4]=y-.19a.needsUpdate=true');
  const file=join(root,'broken-scene.mjs');
  writeFileSync(file,broken,'utf8');
  const result=checkModule(file);
  assert.notEqual(result.code,0,'La versión rota no debe pasar el parser');
  assert.match(result.stderr,/SyntaxError|Invalid|Unexpected|missing/i);
 }finally{rmSync(root,{recursive:true,force:true})}
});
test('BOOT-SYNTAX-003: el HTML muestra error si no se carga el motor',()=>{
 assert.match(html,/window\.addEventListener\('error'/);
 assert.match(html,/El motor 3D no llegó a iniciar/);
 assert.match(html,/id="error"/);
 assert.match(html,/scene\.mjs\?v=syntax-fix-/);
});
test('BOOT-SYNTAX-004: no ocultar toda la escena por un asset fallido',()=>{
 assert.match(scene,/Promise\.allSettled\(\[loadProps\(\),loadActor\(\)/);
 assert.match(scene,/render\(scene,camera\)/);
 assert.match(scene,/telemetry\.drawn\+\+/);
});
