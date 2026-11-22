import { AXES, AXIS_KEYS, clampAxis, normalizeAxes, cssSettings, interpolateAxes, PRESETS, createVariableEngine } from "./axis-engine.js";
import assert from "node:assert/strict";
assert.equal(AXIS_KEYS.length,5);
for (const key of AXIS_KEYS) {
  assert.equal(clampAxis(key, -100000), AXES[key].min);
  assert.equal(clampAxis(key, 100000), AXES[key].max);
  assert.equal(clampAxis(key, "nope"), AXES[key].initial);
}
assert.equal(normalizeAxes({ wght: "9999", slnt: -99, CASL:3 }).wght,1000);
assert.equal(normalizeAxes({ wght: "9999", slnt: -99, CASL:3 }).slnt,-15);
assert.equal(normalizeAxes({ wght: "9999", slnt: -99, CASL:3 }).CASL,1);
assert.equal(Object.keys(normalizeAxes({ UNK:1 })).length,5);
assert.match(cssSettings(PRESETS.brutal), /"MONO" 1/);
assert.doesNotMatch(cssSettings({ wght:"NaN", EVIL:999 }), /EVIL|NaN/);
assert.equal(interpolateAxes(PRESETS.editorial,PRESETS.brutal,0).wght,780);
assert.equal(interpolateAxes(PRESETS.editorial,PRESETS.brutal,1).wght,1000);
assert.equal(interpolateAxes(PRESETS.editorial,PRESETS.brutal,9).wght,1000);
const engine=createVariableEngine();
let observed=0; const unsub=engine.subscribe(state=>{observed++; assert.ok(state.wght>=300&&state.wght<=1000);});
engine.set("wght",9999); assert.equal(engine.get().wght,1000);
engine.replace(PRESETS.tecnico); assert.equal(engine.get().MONO,1);
unsub();engine.set("wght",500);assert.equal(observed,3);
console.log("AXIS_ENGINE: PASS (clamp, invalid, limits, five axes, CSS, interpolation, observer)");
