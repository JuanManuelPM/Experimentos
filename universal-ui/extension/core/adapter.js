/* Universal UI · contrato de adaptador y registro.
   Un adaptador describe una aplicación: no contiene lógica de aplicación de cambios.
   Todo lo que modifica la página vive en engine.js, compartido por todas las apps.

   Contrato (ver docs/ADDING_AN_APP.md):
   {
     id, name, version, calibratedAt,            // calibratedAt: fecha de la última verificación en el sitio real o null
     hosts: ['app.example'],                     // coincidencia exacta de hostname
     anchors: [{ id, selectors[] }],             // si falta uno, la app se declara incompatible y no se toca nada
     essentials: [selector],                     // nunca se ocultan (ni ellos ni un contenedor que los incluya)
     components: { [cid]: { label, selectors[], supports: [controlKey], targets?: { [controlKey]: selectors[] } } },
     capabilities: [{ id, label, component, selectors[] }],   // elementos que se pueden mostrar/ocultar
     modes: { minimal: [capId], equilibrado: [capId], completo: [] },
     theme: { requires?(doc) -> null | motivo, bridge: css, verify: [{ selector, property, token }], contrast?: { text } },
     actions: [{ id, label, selectors[] }],      // accesos a funciones nativas: solo click() sobre el control real
   }
   Los selectores son listas de candidatos en orden de preferencia. El motor informa cuál coincidió. */
(function (UUI) {
  'use strict';
  const adapters = new Map();
  const REQUIRED = ['id', 'name', 'version', 'hosts', 'anchors', 'components', 'capabilities', 'modes'];

  function validateAdapter(a) {
    const problems = [];
    for (const k of REQUIRED) if (a[k] === undefined) problems.push('falta ' + k);
    if (a.id && !/^[a-z0-9-]{1,40}$/.test(a.id)) problems.push('id inválido');
    const comps = a.components || {};
    for (const [cid, c] of Object.entries(comps)) {
      if (!Array.isArray(c.selectors) || !c.selectors.length) problems.push(`componente ${cid} sin selectores`);
      for (const k of c.supports || []) if (!UUI.CONTROLS[k]) problems.push(`componente ${cid}: control desconocido ${k}`);
    }
    const ids = new Set();
    for (const cap of a.capabilities || []) {
      if (ids.has(cap.id)) problems.push('capacidad duplicada ' + cap.id);
      ids.add(cap.id);
      if (!comps[cap.component]) problems.push(`capacidad ${cap.id}: componente inexistente ${cap.component}`);
      if (!Array.isArray(cap.selectors) || !cap.selectors.length) problems.push(`capacidad ${cap.id} sin selectores`);
    }
    for (const [mode, hidden] of Object.entries(a.modes || {})) {
      for (const id of hidden) if (!ids.has(id)) problems.push(`modo ${mode}: capacidad inexistente ${id}`);
    }
    if (a.theme) for (const v of a.theme.verify || []) if (!UUI.THEME_TOKENS.includes(v.token)) problems.push('token desconocido ' + v.token);
    return problems;
  }

  function defineAdapter(a) {
    const problems = validateAdapter(a);
    if (problems.length) throw new Error(`Adaptador ${a.id || '?'} inválido: ` + problems.join('; '));
    adapters.set(a.id, Object.freeze(a));
    return a;
  }
  function adapterForHost(hostname) {
    for (const a of adapters.values()) if (a.hosts.includes(hostname)) return a;
    return null;
  }

  UUI.adapters = { defineAdapter, validateAdapter, adapterForHost, get: (id) => adapters.get(id), all: () => [...adapters.values()] };
})(globalThis.UUI = globalThis.UUI || {});
