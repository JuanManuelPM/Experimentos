import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {IDENTITIES,actorRecipe,faceRecipe,pigments,anchorPosition,DEFAULT_ACTION,sampleAction,CAFE,sampleScene,gate} from "./contract.mjs";
const head=JSON.parse(readFileSync(new URL("../iris/v11-3/head.json",import.meta.url),"utf8"));
const anchors=pigments(head);assert.equal(anchors.length,10);for(const a of anchors){assert.ok(Math.abs(a.weights.reduce((s,w)=>s+w,0)-1)<1e-7);assert.ok(anchorPosition(a,head.positions).every(Number.isFinite))}
for(const i of IDENTITIES)assert.deepEqual(actorRecipe(i),actorRecipe(JSON.parse(JSON.stringify(actorRecipe(i)))));
for(const t of [8,10,13,15])assert.ok(Math.hypot(...sampleAction({},t-1e-6).cup.map((x,i)=>x-sampleAction({},t+1e-6).cup[i]))<1e-5);
for(const t of [7.99,8,12,14.99,15,19]){let a=sampleAction({},t);assert.equal(a.held,a.owner!==null);assert.equal(a.support,a.held?"hand":"table")}
assert.equal(sampleAction({cup:[3,.84,4]},19).result,"OUT_OF_REACH");assert.deepEqual(sampleScene(CAFE,24),sampleScene(JSON.parse(JSON.stringify(CAFE)),24));
assert.equal(gate(["a","b"],[{id:"a",version:"v",status:"PASS",evidence:"real"}],"v"),"CANDIDATE");assert.equal(gate(["a"],[{id:"a",version:"v",status:"PASS",evidence:""}],"v"),"CANDIDATE");assert.equal(gate(["a"],[{id:"a",version:"old",status:"PASS",evidence:"real"}],"v"),"CANDIDATE");assert.equal(gate(["a"],[{id:"a",version:"v",status:"PASS",evidence:"real"}],"v"),"READY");
console.log("7 contract checks passed (not rendering)");
