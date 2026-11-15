import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const original = [
  [
    "prometeo/forja/forge.mjs",
    "40c4df881ae3481c6d8e9c22275be9a8cf5e26c3"
  ],
  [
    "prometeo/forja/forge-cinema.mjs",
    "99a48f85ed84a6e87324144a929f0a5fd5ad3d42"
  ],
  [
    "prometeo/forja/pause-regression.core.mjs",
    "85e541d8f347a1be702abcfc6768e2c8a26b60eb"
  ],
  [
    "prometeo/forja/pause-regression.test.mjs",
    "9176708fc6f43214eb459de1dddeec464a6087ec"
  ],
  [
    "prometeo/forja/WORK_PAUSE_FIX.md",
    "22b592c59620cead3f96bc42d1684e8c6519fc76"
  ],
  [
    "prometeo/forja/archivo-vivo/scene.mjs",
    "7309bcd5ba848af7ce8711fc2299807e638b68ff"
  ],
  [
    "prometeo/forja/archivo-vivo/clip-resolver.mjs",
    "d60b12276ad94d7f445aa49058c57b6293ca8a63"
  ],
  [
    "prometeo/forja/archivo-vivo/clip-resolver.test.mjs",
    "7d72eb0bfb2dbcdf76583d794ce5311eaf71b072"
  ],
  [
    "prometeo/forja/archivo-vivo/FOX_CLIP_FIX.md",
    "e4240a1047c0ceb65208450a88138303bb7d0dd2"
  ]
];
function blobSha(path) {
  const b=readFileSync(new URL('../../../'+path,import.meta.url));
  return createHash('sha1').update(Buffer.from('blob '+b.length+'\\0'.replace('\\0','\0'))).update(b).digest('hex');
}
for(const [path, expected] of original){
  test('pinned source byte identity: '+path,()=>{
    assert.equal(blobSha(path),expected);
  });
}
test('the merged product runs both interaction suites from one root',()=>{
  const shell=readFileSync(new URL('../run-regression.sh',import.meta.url),'utf8');
  for(const required of ['pause-regression.test.mjs','clip-resolver.test.mjs','loading-start-v5.test.mjs']){
    assert.ok(shell.includes(required),'missing suite '+required);
  }
});
