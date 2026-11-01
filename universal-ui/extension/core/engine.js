/* Universal UI · motor de aplicación y verificación.
   Un único motor para todas las apps. Recibe un adaptador (descripción) y una
   configuración; localiza los elementos reales, aplica cambios reversibles y
   comprueba su efecto en el DOM. Nunca lee texto, mensajes ni valores de campos:
   solo selectores estructurales y estilos computados. */
(function (UUI) {
  'use strict';
  const S = UUI.STATUS;
  const { resolve, appLayer } = UUI.schema;
  const { parseColor, sameColor, contrast } = UUI.color;

  const STYLE_ID = 'uui-style';
  const HIDE_ATTR = 'data-uui-hide';
  const COMP_ATTR = 'data-uui-c'; // reservado; se limpia por compatibilidad
  // Un acceso a funciones nativas nunca puede apuntar a un control de envío.
  const FORBIDDEN_ACTION = '[type="submit"], [data-testid*="send" i], [aria-label*="send" i], [aria-label*="enviar" i], [data-icon="send"]';

  // Propiedades CSS que el motor escribe por control universal.
  const LAYOUT = {
    fontScale:    { props: ['font-size'], neutral: 1 },
    font:         { props: ['font-family'], neutral: 'original' },
    density:      { props: ['row-gap', 'padding-top', 'padding-bottom'], neutral: 'normal' },
    readingWidth: { props: ['max-width'], neutral: 'original' },
    margin:       { props: ['padding-left', 'padding-right'], neutral: 'original' },
  };

  function createEngine(opts) {
    const adapter = opts.adapter;
    const doc = opts.document;
    const win = opts.window || doc.defaultView;
    const onReport = opts.onReport || (() => {});
    const now = opts.now || (() => new Date().toISOString());
    const css = (el) => win.getComputedStyle(el);

    let settings = null;
    let statuses = {};       // id → { status, detail, selector, count }
    let lastSeen = {};       // id → índice del selector que coincidió la última vez
    const drift = [];        // eventos de invalidación de reglas
    const inlineLog = new Map(); // el → { prop: [valor previo, prioridad previa] }
    const original = new WeakMap(); // el → estilos computados antes de tocar nada
    let observer = null, timer = null, applying = false;

    // ---------- localización ----------
    function find(selectors) {
      for (let i = 0; i < selectors.length; i++) {
        let list;
        try { list = doc.querySelectorAll(selectors[i]); } catch (e) { continue; }
        if (list.length) return { elements: [...list], index: i, selector: selectors[i] };
      }
      return { elements: [], index: -1, selector: null };
    }
    function noteSeen(id, found) {
      const prev = lastSeen[id];
      if (prev !== undefined && prev >= 0 && found.index !== prev) {
        drift.push({ id, at: now(), from: prev, to: found.index,
          kind: found.index < 0 ? 'desaparecido' : 'selector alternativo' });
        if (drift.length > 50) drift.shift();
      }
      lastSeen[id] = found.index;
    }
    function isEssential(el) {
      return (adapter.essentials || []).some(sel => {
        try { return el.matches(sel) || !!el.querySelector(sel); } catch (e) { return false; }
      });
    }

    // ---------- estilo inyectado (tema + ocultación) ----------
    function styleEl() {
      let el = doc.getElementById(STYLE_ID);
      if (!el) {
        el = doc.createElement('style');
        el.id = STYLE_ID;
        (doc.head || doc.documentElement).appendChild(el);
      }
      return el;
    }
    function themeCss(theme) {
      if (!theme) return '';
      const vars = UUI.THEME_TOKENS.map(t => `--uui-${t}: ${theme[t]};`).join(' ');
      return `html[data-uui-theme] { ${vars} }\n${adapter.theme.bridge}`;
    }
    function writeStyle(theme) {
      styleEl().textContent = `/* Universal UI · ${adapter.id} ${adapter.version} */\n` +
        `[${HIDE_ATTR}] { display: none !important; }\n` + themeCss(theme);
    }

    // ---------- estilos en línea reversibles ----------
    function setInline(el, prop, value) {
      if (!inlineLog.has(el)) inlineLog.set(el, {});
      const log = inlineLog.get(el);
      if (!(prop in log)) log[prop] = [el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)];
      el.style.setProperty(prop, value, 'important');
    }
    function restoreInline(el, prop) {
      const log = inlineLog.get(el);
      if (!log || !(prop in log)) return;
      const [v, p] = log[prop];
      if (v) el.style.setProperty(prop, v, p); else el.style.removeProperty(prop);
      if (el.getAttribute('style') === '') el.removeAttribute('style');
      delete log[prop];
      if (!Object.keys(log).length) inlineLog.delete(el);
    }
    function snapshot(el) {
      if (!original.has(el)) {
        const c = css(el);
        original.set(el, { fontSize: parseFloat(c.fontSize) || 16, paddingTop: parseFloat(c.paddingTop) || 0,
          paddingBottom: parseFloat(c.paddingBottom) || 0, rowGap: parseFloat(c.rowGap) || 0 });
      }
      return original.get(el);
    }

    // Resuelve var(--x) cuando el entorno no lo hace (los navegadores ya lo hacen).
    function computed(el, prop) {
      let v = css(el).getPropertyValue(prop).trim();
      for (let guard = 0; guard < 8 && /^var\(/.test(v); guard++) {
        const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/.exec(v);
        if (!m) break;
        let found = '';
        for (let n = el; n && n.nodeType === 1 && !found; n = n.parentElement) found = css(n).getPropertyValue(m[1]).trim();
        v = found || (m[2] || '').trim();
      }
      return v;
    }

    // ---------- capacidades de visibilidad ----------
    function applyVisibility() {
      for (const cap of adapter.capabilities) {
        const found = find(cap.selectors);
        noteSeen(cap.id, found);
        const shown = resolve(settings, adapter.id, cap.component, 'show:' + cap.id, adapter);
        // limpiar marcas previas de esta capacidad (puede haber cambiado el selector)
        doc.querySelectorAll(`[${HIDE_ATTR}~="${cap.id}"]`).forEach(el => untag(el, cap.id));
        const base = { selector: found.selector, count: found.elements.length, fallback: found.index > 0, source: shown.source };
        if (!found.elements.length) { statuses[cap.id] = { ...base, status: S.NOT_FOUND, detail: 'Ningún selector coincide' }; continue; }
        if (found.elements.some(isEssential)) { statuses[cap.id] = { ...base, status: S.INCOMPATIBLE, detail: 'Contiene un elemento esencial' }; continue; }
        if (shown.value) { statuses[cap.id] = { ...base, status: S.AVAILABLE }; continue; }
        found.elements.forEach(el => tag(el, cap.id));
        const ok = found.elements.every(el => css(el).display === 'none');
        if (ok) statuses[cap.id] = { ...base, status: S.APPLIED };
        else {
          found.elements.forEach(el => untag(el, cap.id));
          statuses[cap.id] = { ...base, status: S.ERROR, detail: 'El elemento sigue visible: la regla fue anulada' };
        }
      }
    }
    function tag(el, id) {
      const cur = (el.getAttribute(HIDE_ATTR) || '').split(' ').filter(Boolean);
      if (!cur.includes(id)) el.setAttribute(HIDE_ATTR, cur.concat(id).join(' '));
    }
    function untag(el, id) {
      const rest = (el.getAttribute(HIDE_ATTR) || '').split(' ').filter(x => x && x !== id);
      if (rest.length) el.setAttribute(HIDE_ATTR, rest.join(' ')); else el.removeAttribute(HIDE_ATTR);
    }

    // ---------- controles de diseño por componente ----------
    function expected(key, value, el) {
      const V = UUI.CSS_VALUES;
      const o = snapshot(el);
      if (key === 'fontScale') return { 'font-size': (o.fontSize * value).toFixed(2) + 'px' };
      if (key === 'font') return { 'font-family': V.font[value] };
      if (key === 'density') { const k = V.density[value];
        return { 'row-gap': (o.rowGap * k).toFixed(2) + 'px', 'padding-top': (o.paddingTop * k).toFixed(2) + 'px', 'padding-bottom': (o.paddingBottom * k).toFixed(2) + 'px' }; }
      if (key === 'readingWidth') return { 'max-width': V.readingWidth[value] };
      if (key === 'margin') return { 'padding-left': V.margin[value], 'padding-right': V.margin[value] };
      return {};
    }
    function matchesComputed(el, prop, want) {
      const got = css(el).getPropertyValue(prop).trim();
      if (prop === 'font-family') return got.replace(/["']/g, '').split(',')[0].trim() === want.replace(/["']/g, '').split(',')[0].trim();
      if (want === 'none') return got === 'none';
      if (/px$/.test(want)) return Math.abs(parseFloat(got) - parseFloat(want)) < 0.6 || (/rem$/.test(got) && Math.abs(parseFloat(got) * 16 - parseFloat(want)) < 0.6);
      return got === want;
    }
    function applyLayout() {
      for (const [cid, comp] of Object.entries(adapter.components)) {
        const root = find(comp.selectors);
        noteSeen('c:' + cid, root);
        for (const key of comp.supports || []) {
          const id = cid + '.' + key;
          const sel = (comp.targets && comp.targets[key]) || comp.selectors;
          const found = sel === comp.selectors ? root : find(sel);
          const r = resolve(settings, adapter.id, cid, key);
          const base = { selector: found.selector, count: found.elements.length, fallback: found.index > 0, source: r.source, value: r.value };
          // revertir primero lo escrito antes (idempotente)
          for (const el of [...inlineLog.keys()]) if (el.__uuiOwner && el.__uuiOwner[id]) { LAYOUT[key].props.forEach(p => restoreInline(el, p)); delete el.__uuiOwner[id]; }
          if (!found.elements.length) { statuses[id] = { ...base, status: S.NOT_FOUND, detail: 'Ningún selector coincide' }; continue; }
          if (r.value === LAYOUT[key].neutral) { statuses[id] = { ...base, status: S.AVAILABLE }; continue; }
          let ok = true;
          for (const el of found.elements) {
            const want = expected(key, r.value, el);
            el.__uuiOwner = el.__uuiOwner || {};
            el.__uuiOwner[id] = true;
            for (const [p, v] of Object.entries(want)) setInline(el, p, v);
            for (const [p, v] of Object.entries(want)) if (!matchesComputed(el, p, v)) ok = false;
          }
          if (ok) statuses[id] = { ...base, status: S.APPLIED };
          else {
            found.elements.forEach(el => { LAYOUT[key].props.forEach(p => restoreInline(el, p)); if (el.__uuiOwner) delete el.__uuiOwner[id]; });
            statuses[id] = { ...base, status: S.ERROR, detail: 'El sitio anula el valor; revertido' };
          }
        }
      }
    }

    // ---------- tema ----------
    function applyTheme() {
      const html = doc.documentElement;
      const r = resolve(settings, adapter.id, null, 'theme');
      const theme = r.value !== 'original' ? UUI.THEMES[r.value] : null;
      const base = { source: r.source, value: r.value };
      html.removeAttribute('data-uui-theme');
      writeStyle(null);
      if (!adapter.theme) { statuses.theme = { ...base, status: S.INCOMPATIBLE, detail: 'Esta app no declara puente de tema' }; return; }
      const reason = adapter.theme.requires ? adapter.theme.requires(doc, win) : null;
      if (reason) { statuses.theme = { ...base, status: S.INCOMPATIBLE, detail: reason }; return; }
      const probes = (adapter.theme.verify || []).map(v => ({ v, found: find([].concat(v.selector)) }));
      if (!probes.some(p => p.found.elements.length)) { statuses.theme = { ...base, status: S.NOT_FOUND, detail: 'No hay superficies verificables' }; return; }
      if (!theme) { statuses.theme = { ...base, status: S.AVAILABLE }; return; }
      writeStyle(theme);
      html.setAttribute('data-uui-theme', r.value);
      const failed = [];
      let checked = 0;
      for (const { v, found } of probes) {
        if (!found.elements.length) continue;
        checked++;
        if (!sameColor(computed(found.elements[0], v.property), theme[v.token])) failed.push(v.selector + ' ' + v.property);
      }
      let low = null;
      if (!failed.length && adapter.theme.contrast) {
        const t = find([].concat(adapter.theme.contrast.text)).elements[0];
        if (t) {
          let bg = null;
          for (let n = t; n && n.nodeType === 1 && !bg; n = n.parentElement) bg = parseColor(computed(n, 'background-color')) ? computed(n, 'background-color') : null;
          const ratio = bg ? contrast(computed(t, 'color'), bg) : null;
          if (ratio !== null && ratio < 4.5) low = ratio;
        }
      }
      if (failed.length || low !== null) {
        html.removeAttribute('data-uui-theme');
        writeStyle(null);
        statuses.theme = { ...base, status: S.ERROR, detail: failed.length ? 'Sin efecto en: ' + failed.join(', ') : `Contraste insuficiente (${low.toFixed(2)}:1); revertido` };
      } else statuses.theme = { ...base, status: S.APPLIED, count: checked };
    }

    // ---------- acciones nativas ----------
    function probeActions() {
      for (const a of adapter.actions || []) {
        const found = find(a.selectors);
        noteSeen('a:' + a.id, found);
        const el = found.elements[0];
        const status = !el ? S.NOT_FOUND : (el.matches(FORBIDDEN_ACTION) ? S.INCOMPATIBLE : S.AVAILABLE);
        statuses['a:' + a.id] = { status, selector: found.selector, count: found.elements.length, fallback: found.index > 0,
          detail: status === S.INCOMPATIBLE ? 'Apunta a un control de envío' : undefined };
      }
    }
    function runAction(id) {
      const a = (adapter.actions || []).find(x => x.id === id);
      if (!a) return { ok: false, detail: 'Acción desconocida' };
      const el = find(a.selectors).elements[0];
      if (!el) return { ok: false, detail: 'No encontrado' };
      if (el.matches(FORBIDDEN_ACTION)) return { ok: false, detail: 'Bloqueado: control de envío' };
      el.click();
      return { ok: true };
    }

    // ---------- ciclo ----------
    function health() {
      const missing = adapter.anchors.filter(a => !find(a.selectors).elements.length).map(a => a.id);
      return missing.length ? { ok: false, missing } : { ok: true, missing: [] };
    }
    function enabled() {
      return settings && settings.enabled !== false && appLayer(settings, adapter.id).enabled !== false;
    }
    function apply(next) {
      if (next) settings = next;
      if (!settings) return report();
      applying = true;
      try {
        statuses = {};
        const h = health();
        if (!enabled() || !h.ok) {
          revertAll();
          const st = !h.ok ? S.INCOMPATIBLE : S.AVAILABLE;
          const detail = !h.ok ? 'Estructura no reconocida: falta ' + h.missing.join(', ') : 'Desactivado';
          for (const cap of adapter.capabilities) statuses[cap.id] = { status: st, detail };
          statuses.theme = { status: st, detail };
          return report(h);
        }
        writeStyle(null);
        applyTheme();
        applyVisibility();
        applyLayout();
        probeActions();
        return report(h);
      } catch (e) {
        statuses.engine = { status: S.ERROR, detail: String(e && e.message || e) };
        return report();
      } finally { applying = false; }
    }

    // Restauración total: elimina todo rastro del motor en la página.
    function revertAll() {
      const st = doc.getElementById(STYLE_ID);
      if (st) st.remove();
      doc.documentElement.removeAttribute('data-uui-theme');
      doc.querySelectorAll(`[${HIDE_ATTR}]`).forEach(el => el.removeAttribute(HIDE_ATTR));
      doc.querySelectorAll(`[${COMP_ATTR}]`).forEach(el => el.removeAttribute(COMP_ATTR));
      for (const [el, log] of [...inlineLog.entries()]) { Object.keys(log).forEach(p => restoreInline(el, p)); delete el.__uuiOwner; }
    }

    function report(h) {
      const r = { app: adapter.id, name: adapter.name, version: adapter.version, calibratedAt: adapter.calibratedAt || null,
        health: h || health(), enabled: !!enabled(), statuses: JSON.parse(JSON.stringify(statuses)), drift: drift.slice(), at: now() };
      onReport(r);
      return r;
    }

    // Tiempo real: el sitio cambia su DOM (SPA) → se vuelve a localizar y aplicar.
    function start() {
      if (observer || !win.MutationObserver) return;
      // The engine itself creates/updates #uui-style. Observing that element
      // (or its insertion into <head>) caused an infinite reapply loop after
      // any external DOM change: each apply rewrote its own stylesheet.
      // Ignore only our own injected style; still observe real SPA changes.
      function ownStyleNode(n) {
        return !!n && ((n.nodeType === 1 && n.id === STYLE_ID) ||
          (n.parentNode && n.parentNode.nodeType === 1 && n.parentNode.id === STYLE_ID));
      }
      function relevant(m) {
        if (ownStyleNode(m.target)) return false;
        if (m.type === 'attributes') return true;
        if (m.type !== 'childList') return false;
        const changed = [...m.addedNodes, ...m.removedNodes];
        return changed.some(n => !ownStyleNode(n));
      }
      observer = new win.MutationObserver(records => {
        if (applying || !records.some(relevant)) return;
        clearTimeout(timer);
        timer = setTimeout(() => apply(), opts.debounceMs ?? 250);
      });
      observer.observe(doc.documentElement, {
        childList: true, subtree: true, attributes: true,
        // Capture selector drift (React often mutates attributes without
        // inserting a node), but never our own data-uui-* or inline styles.
        attributeFilter: [
          'class', 'id', 'role', 'aria-label', 'data-testid',
          'data-theme', 'href', 'hidden', 'data-app-navigation-rail',
          'data-app-shell-left-panel-appearance', 'data-content-search-unit-key',
        ],
      });
    }
    function stop() { if (observer) observer.disconnect(); observer = null; clearTimeout(timer); }

    return { apply, revertAll, report: () => report(), runAction, start, stop, get drift() { return drift.slice(); } };
  }

  UUI.createEngine = createEngine;
})(globalThis.UUI = globalThis.UUI || {});
