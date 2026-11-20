import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectBrowserEntrypoint} from './browser-check.mjs';
const station='<canvas id="scene"></canvas><div id="error">No se pudo iniciar WebGL2.</div><script type="module">const x=new DecompressionStream("gzip");const r=await fetch("./scene.mjs.gz");const moduleURL=URL.createObjectURL(new Blob([x]));await import(moduleURL)</script>';
const arcade='<div id="stage"></div><div id="notice"></div><script>addEventListener("error",()=>{});addEventListener("unhandledrejection",()=>{});</script><script type="module" src="./app.mjs"></script>';
test('station gzip/Blob-only loader is risky before delivery',()=>{
 const r=inspectBrowserEntrypoint(station);
 for(const code of ['ONLY_COMPRESSED_BOOT_ENTRY','BLOB_DYNAMIC_MODULE_IMPORT','CONFLATED_BOOT_ERROR'])assert.ok(r.findings.some(x=>x.code===code));
 assert.equal(r.continueFullProduction,true);
});
test('arcade direct standard module entry avoids critical boot warnings',()=>assert.equal(inspectBrowserEntrypoint(arcade).ok,true));
test('WebGL2-only is flagged as risk, never proof of exact failure',()=>{
 const r=inspectBrowserEntrypoint('<canvas></canvas><div id="error"></div><script>canvas.getContext("webgl2")</script>');
 assert.ok(r.findings.some(x=>x.code==='WEBGL2_ONLY_WITHOUT_WEBGL1'));assert.equal(r.continueFullProduction,true);
});
