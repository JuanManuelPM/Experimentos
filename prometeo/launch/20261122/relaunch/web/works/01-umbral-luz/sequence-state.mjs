/** Pure narrative geometry, independent from DOM and navigation events. */
export const clamp01 = n => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
export function progressFor(rect, marker) {
  return clamp01((marker - rect.top) / Math.max(1, rect.height || rect.bottom - rect.top));
}
export function pickActive(rects, marker) {
  if (!rects.length) return -1;
  let selected = 0, best = Infinity;
  rects.forEach((rect,i) => {
    const d = rect.top > marker ? rect.top - marker : rect.bottom < marker ? marker - rect.bottom : 0;
    if (d < best) { best = d; selected = i; }
  });
  return selected;
}
export function photographicOffset(progress, motionOff=false) {
  return motionOff ? 0 : Math.round((0.5 - clamp01(progress)) * 38);
}
