/* Universal UI · persistencia, perfiles y operaciones sobre la configuración.
   Todas las operaciones son puras: reciben una configuración y devuelven otra nueva.
   `Store` envuelve un área tipo browser.storage.local y notifica cambios en tiempo real. */
(function (UUI) {
  'use strict';
  const { validValue, controlFor, emptySettings, exKey, isVisibilityKey } = UUI.schema;
  const KEY = 'uui.settings';
  const PROFILE_SCHEMA = 'uui.profile/1';

  const clone = (o) => JSON.parse(JSON.stringify(o));
  function ensureApp(s, appId) {
    s.apps[appId] = s.apps[appId] || { values: {}, components: {}, exceptions: {} };
    return s.apps[appId];
  }

  /* target = { level, appId?, componentId?, key } */
  function setValue(settings, target, value) {
    const { level, appId, componentId, key } = target;
    const c = controlFor(key);
    if (!c) throw new Error('Control desconocido: ' + key);
    if (!c.levels.includes(level)) throw new Error(`"${key}" no admite el nivel ${level}`);
    if (!validValue(key, value)) throw new Error(`Valor inválido para ${key}: ${JSON.stringify(value)}`);
    if (level !== 'global' && !appId) throw new Error('Falta appId');
    if ((level === 'component') && !componentId) throw new Error('Falta componentId');
    const s = clone(settings);
    if (level === 'global') s.global[key] = value;
    else {
      const app = ensureApp(s, appId);
      if (level === 'app') app.values[key] = value;
      if (level === 'component') (app.components[componentId] = app.components[componentId] || {})[key] = value;
      if (level === 'exception') app.exceptions[exKey(componentId, key)] = value;
    }
    return s;
  }

  // Quita un valor de una capa: vuelve a heredar de la capa anterior.
  function clearValue(settings, target) {
    const { level, appId, componentId, key } = target;
    const s = clone(settings);
    if (level === 'global') delete s.global[key];
    const app = s.apps[appId];
    if (app) {
      if (level === 'app') delete app.values[key];
      if (level === 'component' && app.components[componentId]) {
        delete app.components[componentId][key];
        if (!Object.keys(app.components[componentId]).length) delete app.components[componentId];
      }
      if (level === 'exception') delete app.exceptions[exKey(componentId, key)];
    }
    return s;
  }

  function resetApp(settings, appId) {
    const s = clone(settings);
    delete s.apps[appId];
    return s;
  }
  function resetExceptions(settings, appId) {
    const s = clone(settings);
    if (s.apps[appId]) s.apps[appId].exceptions = {};
    return s;
  }
  // Restaura todo a los valores originales de cada sitio. Los perfiles guardados se conservan.
  function resetAll(settings) {
    const s = emptySettings();
    s.profiles = clone(settings.profiles || {});
    return s;
  }
  function setEnabled(settings, appId, enabled) {
    const s = clone(settings);
    if (!appId) s.enabled = !!enabled;
    else ensureApp(s, appId).enabled = !!enabled;
    return s;
  }

  // ---- perfiles ----
  function snapshot(settings, scope) {
    if (scope && scope !== 'all') {
      return { global: {}, apps: { [scope]: clone(settings.apps[scope] || { values: {}, components: {}, exceptions: {} }) } };
    }
    return { global: clone(settings.global), apps: clone(settings.apps) };
  }
  function saveProfile(settings, name, opts) {
    const scope = (opts && opts.scope) || 'all';
    const id = (opts && opts.id) || 'p' + Date.now().toString(36);
    const s = clone(settings);
    s.profiles[id] = { name: String(name).slice(0, 60), scope, createdAt: new Date().toISOString(), data: snapshot(settings, scope) };
    return { settings: s, id };
  }
  function applyProfile(settings, profileId, opts) {
    const p = settings.profiles[profileId];
    if (!p) throw new Error('Perfil inexistente');
    const keepExceptions = !(opts && opts.includeExceptions);
    const s = clone(settings);
    if (p.scope === 'all') s.global = clone(p.data.global);
    for (const [appId, layer] of Object.entries(p.data.apps)) {
      const prev = s.apps[appId];
      s.apps[appId] = clone(layer);
      if (keepExceptions) s.apps[appId].exceptions = prev ? clone(prev.exceptions || {}) : {};
    }
    if (p.scope === 'all') {
      // apps ausentes del perfil vuelven a heredar del global del perfil
      for (const appId of Object.keys(s.apps)) {
        if (!p.data.apps[appId]) s.apps[appId] = { values: {}, components: {}, exceptions: keepExceptions ? s.apps[appId].exceptions : {} };
      }
    }
    return s;
  }
  function deleteProfile(settings, profileId) {
    const s = clone(settings);
    delete s.profiles[profileId];
    return s;
  }

  /* Reutiliza la configuración de una app en otra. Solo copia lo que la app destino
     entiende: controles universales siempre; componentes y visibilidad solo si el
     adaptador destino declara ese componente/elemento. */
  function copyApp(settings, fromId, toId, toAdapter) {
    const s = clone(settings);
    const from = s.apps[fromId];
    if (!from) return s;
    const to = ensureApp(s, toId);
    Object.assign(to.values, clone(from.values));
    const comps = new Set(Object.keys((toAdapter && toAdapter.components) || {}));
    const elems = new Set(((toAdapter && toAdapter.capabilities) || []).map(c => c.id));
    for (const [cid, vals] of Object.entries(from.components || {})) {
      if (comps.has(cid)) to.components[cid] = Object.assign(to.components[cid] || {}, clone(vals));
    }
    for (const [k, v] of Object.entries(from.exceptions || {})) {
      const [cid, key] = [k.slice(0, k.indexOf('/')), k.slice(k.indexOf('/') + 1)];
      if (isVisibilityKey(key) ? elems.has(key.slice(5)) : (cid === '*' || comps.has(cid))) to.exceptions[k] = v;
    }
    return s;
  }

  function exportProfile(settings, profileId) {
    const p = settings.profiles[profileId];
    if (!p) throw new Error('Perfil inexistente');
    return JSON.stringify({ schema: PROFILE_SCHEMA, profile: p }, null, 2);
  }
  // Importación defensiva: se valida cada valor; lo desconocido se descarta y se informa.
  function importProfile(settings, json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (!parsed || parsed.schema !== PROFILE_SCHEMA || !parsed.profile || !parsed.profile.data)
      throw new Error('No es un perfil de Universal UI');
    const dropped = [];
    const p = parsed.profile;
    const data = { global: {}, apps: {} };
    for (const [k, v] of Object.entries(p.data.global || {})) {
      if (UUI.CONTROLS[k] && validValue(k, v)) data.global[k] = v; else dropped.push('global.' + k);
    }
    for (const [appId, layer] of Object.entries(p.data.apps || {})) {
      if (!/^[a-z0-9-]{1,40}$/.test(appId)) { dropped.push(appId); continue; }
      const out = { values: {}, components: {}, exceptions: {} };
      for (const [k, v] of Object.entries(layer.values || {})) (UUI.CONTROLS[k] && validValue(k, v)) ? out.values[k] = v : dropped.push(appId + '.' + k);
      for (const [cid, vals] of Object.entries(layer.components || {})) {
        for (const [k, v] of Object.entries(vals || {})) {
          if (UUI.CONTROLS[k] && validValue(k, v)) (out.components[cid] = out.components[cid] || {})[k] = v; else dropped.push(appId + '.' + cid + '.' + k);
        }
      }
      for (const [k, v] of Object.entries(layer.exceptions || {})) {
        const key = k.slice(k.indexOf('/') + 1);
        if (k.includes('/') && validValue(key, v)) out.exceptions[k] = v; else dropped.push(appId + '.' + k);
      }
      data.apps[appId] = out;
    }
    const s = clone(settings);
    const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    s.profiles[id] = { name: String(p.name || 'Importado').slice(0, 60), scope: p.scope === 'all' ? 'all' : (Object.keys(data.apps)[0] || 'all'), createdAt: new Date().toISOString(), data };
    return { settings: s, id, dropped };
  }

  // ---- almacenamiento ----
  class Store {
    constructor(area) { this.area = area; this.listeners = new Set(); }
    async load() {
      const got = await this.area.get(KEY);
      const s = got && got[KEY];
      return s && s.version === 1 ? s : emptySettings();
    }
    async save(settings) { await this.area.set({ [KEY]: settings }); return settings; }
    async update(fn) { const next = fn(await this.load()); await this.save(next); return next; }
    // Notifica cambios hechos desde cualquier contexto (popup, otra pestaña).
    watch(cb) {
      const h = (changes, areaName) => { if ((!areaName || areaName === 'local') && changes[KEY]) cb(changes[KEY].newValue || emptySettings()); };
      if (this.area.onChanged) this.area.onChanged.addListener(h);
      return () => this.area.onChanged && this.area.onChanged.removeListener(h);
    }
  }

  // Área en memoria con la misma forma que browser.storage.local (pruebas y demo).
  function memoryArea() {
    let data = {};
    const ls = new Set();
    return {
      async get(k) { return k in data ? { [k]: clone(data[k]) } : {}; },
      async set(obj) {
        const changes = {};
        for (const [k, v] of Object.entries(obj)) { changes[k] = { oldValue: data[k], newValue: clone(v) }; data[k] = clone(v); }
        ls.forEach(l => l(changes, 'local'));
      },
      onChanged: { addListener: (l) => ls.add(l), removeListener: (l) => ls.delete(l) },
    };
  }

  UUI.store = { KEY, PROFILE_SCHEMA, setValue, clearValue, resetApp, resetExceptions, resetAll, setEnabled,
    saveProfile, applyProfile, deleteProfile, copyApp, exportProfile, importProfile, Store, memoryArea };
})(globalThis.UUI = globalThis.UUI || {});
