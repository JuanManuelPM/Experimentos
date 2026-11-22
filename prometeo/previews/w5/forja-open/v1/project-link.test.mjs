import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolvePublicSceneURL,fetchSceneJSON} from './project-link.mjs';
const b='https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/forja-open/v1/';
test('ruta relativa',()=>assert.equal(resolvePublicSceneURL('./demo-project.json',b),b+'demo-project.json'));
test('raw Github autorizado',()=>assert.match(resolvePublicSceneURL('https://raw.githubusercontent.com/JuanManuelPM/Experimentos/gh-pages/prometeo/a.json',b),/gh-pages\/prometeo\/a.json/));
for(const u of ['https://other.example/a.json','javascript:alert(1)','/Experimentos/secret.json','a.json?x=1','a.html','https://raw.githubusercontent.com/JuanManuelPM/pruebas/main/a.json','file%2fsecret.json']){
 test('rechazo '+u,()=>assert.throws(()=>resolvePublicSceneURL(u,b)));
}
test('lectura JSON',async()=>{
 const data=new TextEncoder().encode('{"schema":"prometeo.forja.scene/v1","items":[]}');
 const json=await fetchSceneJSON(b+'a.json',async()=>({ok:true,headers:{get:()=>null},body:null,arrayBuffer:async()=>data.buffer}));
 assert.equal(json.schema,'prometeo.forja.scene/v1');
});
test('rechazo >2 MB',async()=>{
 const data=new TextEncoder().encode('{}');
 await assert.rejects(()=>fetchSceneJSON(b+'a.json',async()=>({ok:true,headers:{get:k=>k==='content-length'?'2000001':null},body:null,arrayBuffer:async()=>data.buffer})));
});
