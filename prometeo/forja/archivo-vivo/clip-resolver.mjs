/** Resolve GLTF animation controls without confusing short names and namespaced clips.
 * Exact name wins. Fallback only if the suffix after the last | uniquely matches.
 */
export function resolveClip(clips, requested) {
  if (!Array.isArray(clips) || typeof requested !== 'string' || !requested) {
    throw new TypeError('INVALID_CLIP_ARGUMENTS');
  }
  const exact = clips.find(c => c?.name === requested);
  if (exact) return exact;
  const suffixMatches = clips.filter(c => typeof c?.name === 'string' &&
    c.name.slice(c.name.lastIndexOf('|') + 1) === requested);
  if (suffixMatches.length > 1) throw new Error('AMBIGUOUS_CLIP:' + requested);
  return suffixMatches[0] || null;
}
