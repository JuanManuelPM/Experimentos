/**
 * TIPO VIVO / VARIABLE ENGINE v1
 * Pure, dependency-free axis state for any OpenType variable typeface.
 * The caller owns the DOM and render clock. Never trust raw input values.
 */
export const AXES = Object.freeze({
  wght: Object.freeze({ min:300, max:1000, step:1, initial:780, label:"Peso" }),
  CASL: Object.freeze({ min:0, max:1, step:0.01, initial:0.23, label:"Carácter" }),
  MONO: Object.freeze({ min:0, max:1, step:0.01, initial:0, label:"Ancho / mono" }),
  slnt: Object.freeze({ min:-15, max:0, step:0.1, initial:0, label:"Inclinación" }),
  CRSV: Object.freeze({ min:0, max:1, step:0.01, initial:0, label:"Cursiva" })
});
export const AXIS_KEYS = Object.freeze(Object.keys(AXES));
export const PRESETS = Object.freeze({
  editorial: Object.freeze({ wght:780, CASL:0.23, MONO:0, slnt:0, CRSV:0 }),
  brutal: Object.freeze({ wght:1000, CASL:0, MONO:1, slnt:0, CRSV:0 }),
  caligrafico: Object.freeze({ wght:600, CASL:1, MONO:0, slnt:-15, CRSV:1 }),
  tecnico: Object.freeze({ wght:360, CASL:0, MONO:1, slnt:0, CRSV:0 })
});
export function clampAxis(key, raw, definitions = AXES) {
  const d = definitions[key];
  if (!d) throw new RangeError("Eje desconocido: " + key);
  const numeric = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(numeric)) return d.initial;
  return Math.max(d.min, Math.min(d.max, numeric));
}
export function normalizeAxes(values = {}, definitions = AXES) {
  const result = {};
  for (const key of Object.keys(definitions)) {
    result[key] = clampAxis(key, Object.prototype.hasOwnProperty.call(values, key) ? values[key] : definitions[key].initial, definitions);
  }
  return result;
}
export function cssSettings(values, definitions = AXES) {
  const safe = normalizeAxes(values, definitions);
  return Object.keys(definitions).map(key => '"' + key + '" ' + safe[key]).join(", ");
}
export function interpolateAxes(from, to, amount, definitions = AXES) {
  const a = normalizeAxes(from, definitions), b = normalizeAxes(to, definitions);
  const t = Math.max(0, Math.min(1, Number.isFinite(Number(amount)) ? Number(amount) : 0));
  const out = {};
  for (const key of Object.keys(definitions)) out[key] = clampAxis(key, a[key] + (b[key] - a[key]) * t, definitions);
  return out;
}
export function axisPairDescription(values) {
  const safe = normalizeAxes(values);
  return AXIS_KEYS.map(key => key + " " + (Number.isInteger(safe[key]) ? safe[key] : safe[key].toFixed(2))).join(" · ");
}
/** Controller reusable across specimen pages; observers receive defensive copies. */
export function createVariableEngine(initial = PRESETS.editorial) {
  let state = normalizeAxes(initial);
  const observers = new Set();
  const notify = () => { for (const observe of observers) observe({ ...state }); };
  return Object.freeze({
    get: () => ({ ...state }),
    set: (key, value) => {
      if (!Object.prototype.hasOwnProperty.call(AXES,key)) throw new RangeError("Eje desconocido: "+key);
      state = { ...state, [key]: clampAxis(key,value) };
      notify(); return { ...state };
    },
    replace: values => { state=normalizeAxes(values); notify(); return { ...state }; },
    subscribe: fn => { if(typeof fn !== "function") throw new TypeError("observer"); observers.add(fn); fn({ ...state }); return () => observers.delete(fn); },
    css: () => cssSettings(state)
  });
}
