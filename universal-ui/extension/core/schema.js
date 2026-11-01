/* Universal UI · controles universales y herencia.
   Orden de herencia: Global → Aplicación → Componente → Excepción del usuario.
   Una capa más específica sobrescribe a la anterior sin modificarla.

   Las excepciones son "pines" del usuario: sobreviven a cambios de modo y a la
   aplicación de perfiles (salvo que se pida explícitamente incluirlas). */
(function (UUI) {
  'use strict';
  const LEVELS = ['global', 'app', 'component', 'exception'];
  const ALL = LEVELS;

  const CONTROLS = {
    theme:        { label: 'Tema', kind: 'enum', default: 'original', levels: ['global', 'app'],
                    options: () => ['original'].concat(Object.keys(UUI.THEMES)) },
    mode:         { label: 'Modo', kind: 'enum', default: 'completo', levels: ['global', 'app'],
                    options: () => ['minimal', 'equilibrado', 'completo'] },
    fontScale:    { label: 'Tamaño de texto', kind: 'range', default: 1, min: 0.85, max: 1.3, step: 0.05, levels: ALL },
    font:         { label: 'Tipografía', kind: 'enum', default: 'original', levels: ['global', 'app', 'component'],
                    options: () => ['original', 'sans', 'serif', 'mono'] },
    density:      { label: 'Espaciado', kind: 'enum', default: 'normal', levels: ALL,
                    options: () => ['compacto', 'normal', 'amplio'] },
    readingWidth: { label: 'Ancho de lectura', kind: 'enum', default: 'original', levels: ALL,
                    options: () => ['original', 'lectura', 'amplio', 'completo'] },
    margin:       { label: 'Márgenes', kind: 'enum', default: 'original', levels: ALL,
                    options: () => ['original', 'estrecho', 'amplio'] },
  };

  // Valores CSS universales. Los adaptadores los consumen vía var(--uui-*).
  const CSS_VALUES = {
    font: { sans: 'system-ui, "Segoe UI", Cantarell, "Noto Sans", sans-serif',
            serif: 'Charter, "Iowan Old Style", Georgia, serif',
            mono: '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace' },
    density: { compacto: 0.75, normal: 1, amplio: 1.3 },
    // px y no rem: el valor computado debe poder compararse literalmente al verificar.
    readingWidth: { lectura: '704px', amplio: '1024px', completo: 'none' },
    margin: { estrecho: '8px', amplio: '48px' },
  };

  const isVisibilityKey = (key) => typeof key === 'string' && key.startsWith('show:');

  function controlFor(key) {
    if (isVisibilityKey(key)) return { label: 'Visible', kind: 'bool', default: true, levels: ['exception'] };
    return CONTROLS[key] || null;
  }

  function validValue(key, value) {
    const c = controlFor(key);
    if (!c) return false;
    if (c.kind === 'bool') return typeof value === 'boolean';
    if (c.kind === 'range') return typeof value === 'number' && value >= c.min - 1e-9 && value <= c.max + 1e-9;
    if (c.kind === 'enum') return c.options().includes(value);
    return false;
  }

  function emptySettings() {
    return { version: 1, enabled: true, global: {}, apps: {}, profiles: {} };
  }
  function appLayer(settings, appId) {
    return (settings.apps && settings.apps[appId]) || { values: {}, components: {}, exceptions: {} };
  }
  const exKey = (componentId, key) => (componentId || '*') + '/' + key;

  /* Devuelve { value, source } — source ∈ default|global|app|component|exception|mode.
     `adapter` es opcional; solo se usa para la visibilidad derivada del modo. */
  function resolve(settings, appId, componentId, key, adapter) {
    const s = settings || emptySettings();
    const app = appLayer(s, appId);
    if (isVisibilityKey(key)) {
      const ex = app.exceptions && app.exceptions[exKey(componentId, key)];
      if (ex !== undefined) return { value: ex, source: 'exception' };
      const mode = resolve(s, appId, null, 'mode').value;
      const hidden = adapter && adapter.modes && adapter.modes[mode];
      const id = key.slice(5);
      return { value: !(hidden && hidden.includes(id)), source: 'mode' };
    }
    const c = CONTROLS[key];
    if (!c) throw new Error('Control desconocido: ' + key);
    const allow = (lvl) => c.levels.includes(lvl);
    if (componentId && allow('exception') && app.exceptions && app.exceptions[exKey(componentId, key)] !== undefined)
      return { value: app.exceptions[exKey(componentId, key)], source: 'exception' };
    const comp = componentId && app.components && app.components[componentId];
    if (comp && allow('component') && comp[key] !== undefined) return { value: comp[key], source: 'component' };
    if (allow('app') && app.values && app.values[key] !== undefined) return { value: app.values[key], source: 'app' };
    if (allow('global') && s.global && s.global[key] !== undefined) return { value: s.global[key], source: 'global' };
    return { value: c.default, source: 'default' };
  }

  UUI.LEVELS = LEVELS;
  UUI.CONTROLS = CONTROLS;
  UUI.CSS_VALUES = CSS_VALUES;
  UUI.schema = { controlFor, validValue, emptySettings, appLayer, exKey, isVisibilityKey, resolve };
})(globalThis.UUI = globalThis.UUI || {});
