import assert from "node:assert/strict";
import {ASSET_ID,generateChair,validateChair,serializeOBJ} from "./geometry.mjs";
assert.equal(ASSET_ID,"prometeo/prop/arc-chair@0.1.0");
for(const parameters of [{},{width:.59,seatHeight:.46,backHeight:.88},{width:.48,seatHeight:.42,backHeight:.79}]){
 const g=generateChair(parameters),v=validateChair(g);
 assert.ok(v.pass,v.errors.join(","));assert.equal(v.stats.partCount,11);
 assert.ok(v.stats.vertices>2000);assert.ok(v.stats.triangles>3000);assert.equal(v.stats.degenerate,0);
 assert.ok(v.stats.bounds.min[1]>=-.001);assert.ok(v.stats.bounds.max[1]>.7);
 assert.ok(serializeOBJ(g).includes("o backrest-sculpted"));
}
for(const bad of [{width:.1},{backHeight:2},{seatHeight:.19}])assert.throws(()=>generateChair(bad));
assert.equal(serializeOBJ(generateChair()),serializeOBJ(generateChair()));
console.log(JSON.stringify({pass:true,detail:"three dimension variants, triangle integrity, grounding, named parts, deterministic OBJ, invalid inputs",stats:validateChair(generateChair()).stats},null,2));