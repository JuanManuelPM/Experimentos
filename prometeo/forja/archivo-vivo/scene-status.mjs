/** Presentation only: asset/clip errors always outrank animation success. */
export function sceneStatusText(state) {
  const problems = [...(state.failed || [])];
  if (state.clipError) problems.push(state.clipError);
  if (problems.length) return 'Falló: ' + problems.join(' | ');
  if (state.settled) {
    return state.loaded + ' / ' + state.total + ' modelos reales disponibles. Clips Fox: ' + (state.clips?.length || 0) +
      (state.activeClipName ? ' · ' + state.activeClipName : '');
  }
  if (state.activeClipName) return 'Zorro con animación GLB: ' + state.activeClipName;
  return 'Modelos importados correctamente.';
}
