/* Universal UI · panel (ventana emergente del botón de la barra).
   Independiente del entorno: `env` abstrae navegador/pestaña. env-extension.js lo conecta
   a las APIs de Firefox; demo/ lo conecta a una página de prueba con el motor real. */
(function (UUI) {
  'use strict';
  const { resolve, appLayer } = UUI.schema;
  const ST = UUI.store;
  const LBL = UUI.STATUS_LABEL;
  const OPT_LABEL = {
    minimal: 'Minimal', equilibrado: 'Equilibrado', completo: 'Completo',
    original: 'Original', sans: 'Sans', serif: 'Serif', mono: 'Mono',
    compacto: 'Compacto', normal: 'Normal', amplio: 'Amplio', lectura: 'Lectura', estrecho: 'Estrecho',
  };
  const UNIVERSAL = ['fontScale', 'font', 'density', 'readingWidth', 'margin'];

  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
    return el;
  }

  function mountPanel(root, env) {
    const $ = (id) => root.querySelector('#' + id);
    const state = { tab: 'custom', scope: 'app', component: null, settings: null, ctx: null, report: null };
    let toastTimer = null;

    function toast(msg) {
      const t = $('toast');
      t.textContent = msg; t.dataset.on = 'true';
      clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.dataset.on = 'false'; }, 1800);
    }
    async function commit(fn, msg) {
      try {
        state.settings = await env.store.update(fn);
        if (msg) toast(msg);
        await refreshReport();
      } catch (e) { toast(e.message); }
    }
    async function refreshReport() {
      state.report = state.ctx && state.ctx.adapter && state.ctx.permitted ? await env.getReport().catch(() => null) : null;
      render();
    }

    // ---------- estado agregado ----------
    function statusOf(id) { return state.report && state.report.statuses[id]; }
    function aggregate(key) {
      const a = state.ctx.adapter;
      const ids = Object.entries(a.components).filter(([, c]) => (c.supports || []).includes(key)).map(([cid]) => cid + '.' + key);
      if (key === 'theme' || key === 'mode') return statusOf(key) || null;
      const list = ids.map(statusOf).filter(Boolean);
      if (!ids.length) return { status: 'incompatible', detail: 'Ningún componente lo admite' };
      if (!list.length) return null;
      for (const s of ['error', 'applied', 'available', 'incompatible']) {
        const hit = list.find(x => x.status === s);
        if (hit) return { ...hit, status: s, detail: hit.detail || `${list.filter(x => x.status === s).length}/${ids.length} componentes` };
      }
      return { status: 'not_found', detail: 'Ningún componente encontrado' };
    }
    const pill = (st) => st ? h('span', { class: 'pill', 'data-s': st.status, title: st.detail || '', text: LBL[st.status] }) : null;

    // ---------- encabezado ----------
    function renderHead() {
      const a = state.ctx && state.ctx.adapter;
      const r = state.report;
      $('ctx').dataset.on = String(!!(r && r.enabled && r.health.ok));
      $('ctx-name').textContent = a ? `${a.name} · ${state.ctx.host}` : (state.ctx && state.ctx.host) || 'sin pestaña';
      const hEl = $('ctx-health');
      if (!a) { hEl.textContent = 'sin adaptador'; hEl.dataset.state = ''; }
      else if (!state.ctx.permitted) { hEl.textContent = 'sin permiso'; hEl.dataset.state = 'incompatible'; }
      else if (!r) { hEl.textContent = 'sin respuesta'; hEl.dataset.state = 'incompatible'; }
      else if (!r.health.ok) { hEl.textContent = 'estructura cambiada'; hEl.dataset.state = 'incompatible'; }
      else { hEl.textContent = a.calibratedAt ? 'calibrado ' + a.calibratedAt : 'sin calibrar'; hEl.dataset.state = ''; }
    }

    // ---------- Personalización ----------
    function target(key, componentId) {
      if (state.scope === 'global') return { level: 'global', key };
      if (state.component) return { level: 'component', appId: state.ctx.adapter.id, componentId: state.component, key };
      return { level: 'app', appId: state.ctx.adapter.id, key };
    }
    function current(key) {
      const appId = state.scope === 'global' ? '__none__' : state.ctx.adapter.id;
      return resolve(state.settings, appId, state.component, key);
    }
    const LEVEL_NAME = { global: 'común', app: 'esta app', component: 'componente', exception: 'excepción', default: 'original', mode: 'modo' };
    function sourceTag(key) {
      const r = current(key);
      const lvl = target(key).level;
      const own = r.source === lvl;
      return h('button', { class: 'src', 'data-own': String(own), title: own ? 'Volver a heredar' : 'Valor heredado',
        disabled: !own, 'aria-label': own ? `Quitar valor propio de ${UUI.CONTROLS[key].label}` : undefined,
        onclick: () => commit(s => ST.clearValue(s, target(key)), 'Hereda de nuevo') },
        own ? '● propio ↺' : '○ ' + LEVEL_NAME[r.source]);
    }
    function seg(key, options, disabled) {
      const cur = current(key).value;
      return h('div', { class: 'seg', role: 'group', 'aria-label': UUI.CONTROLS[key].label },
        options.map(o => h('button', { type: 'button', 'aria-pressed': String(cur === o), disabled,
          onclick: () => commit(s => ST.setValue(s, target(key), o)) }, OPT_LABEL[o] || o)));
    }
    function controlRow(key, extra) {
      const c = UUI.CONTROLS[key];
      const st = state.scope === 'global' ? null : (state.component ? statusOf(state.component + '.' + key) : aggregate(key));
      const blocked = st && !UUI.isOperable(st.status) && st.status !== 'error';
      let input;
      if (c.kind === 'range') {
        const v = current(key).value;
        const step = (d) => commit(s => ST.setValue(s, target(key), Math.round(Math.min(c.max, Math.max(c.min, v + d)) * 100) / 100));
        input = h('div', { class: 'seg', role: 'group', 'aria-label': c.label },
          h('button', { type: 'button', 'aria-label': 'Reducir', disabled: blocked || v <= c.min, onclick: () => step(-c.step) }, '−'),
          h('button', { type: 'button', 'aria-pressed': 'false', disabled: true }, Math.round(v * 100) + '%'),
          h('button', { type: 'button', 'aria-label': 'Aumentar', disabled: blocked || v >= c.max, onclick: () => step(c.step) }, '+'));
      } else input = seg(key, c.options(), blocked);
      return h('div', { class: 'row' },
        h('span', { class: 'name' }, c.label, sourceTag(key), pill(st)), input, extra);
    }

    function themeGroup() {
      const cur = current('theme').value;
      const st = state.scope === 'global' ? null : statusOf('theme');
      const blocked = st && st.status === 'incompatible';
      const list = ['original'].concat(Object.keys(UUI.THEMES));
      return h('div', { class: 'group' },
        h('p', { class: 'caps' }, h('span', {}, 'Tema'), h('small', {}, sourceTag('theme'), ' ', pill(st))),
        h('div', { class: 'swatches', role: 'group', 'aria-label': 'Tema' },
          list.map(id => {
            const t = UUI.THEMES[id];
            const b = h('button', { type: 'button', class: 'sw' + (t ? '' : ' orig'), 'aria-pressed': String(cur === id),
              title: t ? t.name : 'Original', 'aria-label': t ? t.name : 'Original del sitio', disabled: blocked && id !== 'original',
              onclick: () => commit(s => ST.setValue(s, target('theme'), id), 'Tema: ' + (t ? t.name : 'original')) },
              t ? [h('span', { style: `background:${t.bg}` }), h('span', { style: `background:${t.accent}` })] : 'orig');
            return b;
          })),
        h('div', { class: 'sw-label' }, st && st.detail ? st.detail : (UUI.THEMES[cur] ? UUI.THEMES[cur].name : 'Colores del sitio')));
    }

    function visibilityGroup() {
      const a = state.ctx.adapter;
      const caps = a.capabilities.filter(c => !state.component || c.component === state.component);
      return h('div', { class: 'group' },
        h('p', { class: 'caps' }, h('span', {}, 'Elementos'), h('small', {}, 'excepciones sobre el modo')),
        caps.map(cap => {
          const r = resolve(state.settings, a.id, cap.component, 'show:' + cap.id, a);
          const st = statusOf(cap.id);
          const operable = st && (UUI.isOperable(st.status) || st.status === 'error');
          const t = { level: 'exception', appId: a.id, componentId: cap.component, key: 'show:' + cap.id };
          return h('div', { class: 'vis' },
            h('button', { type: 'button', role: 'switch', class: 'sw-toggle', 'aria-checked': String(r.value),
              'aria-label': `${cap.label}: ${r.value ? 'visible' : 'oculto'}`, disabled: !operable,
              onclick: () => commit(s => ST.setValue(s, t, !r.value), `${cap.label}: ${r.value ? 'oculto' : 'visible'}`) }),
            h('span', { class: 'name' }, cap.label,
              r.source === 'exception'
                ? h('button', { class: 'src', 'data-own': 'true', title: 'Volver al modo', onclick: () => commit(s => ST.clearValue(s, t)) }, '● propio ↺')
                : h('span', { class: 'src' }, '○ modo')),
            pill(st),
            st && st.status !== 'applied' && st.status !== 'available' ? h('span', { class: 'why' }, st.detail || '') : null,
            st && st.fallback ? h('span', { class: 'why' }, 'selector alternativo: ' + st.selector) : null);
        }));
    }

    function actionsGroup() {
      const a = state.ctx.adapter;
      if (!a.actions || !a.actions.length) return null;
      return h('div', { class: 'group' },
        h('p', { class: 'caps' }, h('span', {}, 'Acciones'), h('small', {}, 'controles nativos del sitio')),
        h('div', { class: 'actions' }, a.actions.map(ac => {
          const st = statusOf('a:' + ac.id);
          return h('button', { type: 'button', class: 'btn', disabled: !st || st.status !== 'available', title: st ? LBL[st.status] : '',
            onclick: async () => { const r = await env.runAction(ac.id); toast(r.ok ? ac.label : r.detail); } }, ac.label);
        })));
    }

    function renderCustom() {
      const v = $('view-custom');
      v.replaceChildren();
      const a = state.ctx && state.ctx.adapter;
      if (!a && state.scope !== 'global') state.scope = 'global';
      v.append(h('div', { class: 'scope', role: 'group', 'aria-label': 'Ámbito' },
        h('button', { type: 'button', 'aria-pressed': String(state.scope === 'global'), onclick: () => { state.scope = 'global'; state.component = null; render(); } }, 'Común · todas'),
        h('button', { type: 'button', 'aria-pressed': String(state.scope === 'app'), disabled: !a, onclick: () => { state.scope = 'app'; render(); } }, a ? 'Solo ' + a.name : 'Sin app')));

      if (a && !state.ctx.permitted && state.scope === 'app') {
        v.append(h('div', { class: 'empty' }, `Universal UI no tiene permiso en ${state.ctx.host}. `,
          h('button', { class: 'btn primary', onclick: async () => { if (await env.requestPermission(a)) { state.ctx.permitted = true; await refreshReport(); } } }, 'Permitir en este sitio')));
        return;
      }
      if (state.scope === 'app') {
        // One obvious, reversible action: demonstrate visible changes in the
        // active site without modifying global preferences or other apps.
        v.append(h('div', { class: 'quick-start' },
          h('div', { class: 'quick-label' }, h('strong', {}, 'PROBAR EN ESTA APP'),
            h('small', {}, 'Café + Minimal · sin afectar otras páginas')),
          h('div', { class: 'quick-actions' },
            h('button', { type: 'button', class: 'btn primary',
              onclick: () => commit(s => {
                const themed = ST.setValue(s, { level: 'app', appId: a.id, key: 'theme' }, 'cafe');
                return ST.setValue(themed, { level: 'app', appId: a.id, key: 'mode' }, 'minimal');
              }, 'Vista aplicada en ' + a.name) }, 'Aplicar ahora'),
            h('button', { type: 'button', class: 'btn',
              onclick: () => commit(s => ST.resetApp(s, a.id), 'Vista original restaurada') },
              '↺ Original'))));
        v.append(h('div', { class: 'comps', role: 'group', 'aria-label': 'Componente' },
          h('button', { type: 'button', 'aria-pressed': String(!state.component), onclick: () => { state.component = null; render(); } }, 'Toda la app'),
          Object.entries(a.components).map(([cid, c]) => h('button', { type: 'button', 'aria-pressed': String(state.component === cid),
            onclick: () => { state.component = cid; render(); } }, c.label))));
      }
      if (!state.component) {
        v.append(themeGroup());
        v.append(h('div', { class: 'group' }, h('p', { class: 'caps' }, h('span', {}, 'Modo'), h('small', {}, sourceTag('mode'))), seg('mode', UUI.CONTROLS.mode.options())));
      }
      const keys = state.component ? (a.components[state.component].supports || []) : UNIVERSAL;
      if (keys.length) v.append(h('div', { class: 'group' }, h('p', { class: 'caps' }, h('span', {}, 'Texto y distribución')), keys.map(k => controlRow(k))));
      if (state.scope === 'app') {
        v.append(visibilityGroup());
        if (!state.component) v.append(actionsGroup());
        if (state.report && state.report.drift.length) {
          v.append(h('p', { class: 'drift' }, `${state.report.drift.length} reglas cambiaron desde que se abrió la página: ` +
            state.report.drift.slice(-3).map(d => `${d.id} (${d.kind})`).join(', ')));
        }
      }
      const appId = a && a.id;
      v.append(h('div', { class: 'foot' },
        state.scope === 'app'
          ? h('button', { class: 'btn', onclick: () => commit(s => ST.resetApp(s, appId), `${a.name} restaurado`) }, 'Restaurar ' + a.name)
          : h('button', { class: 'btn', onclick: () => commit(s => Object.assign(ST.resetAll(s), { apps: s.apps }), 'Común restaurado') }, 'Restaurar común'),
        state.scope === 'app'
          ? h('button', { class: 'btn quiet', onclick: () => commit(s => ST.setEnabled(s, appId, appLayer(s, appId).enabled === false), appLayer(state.settings, appId).enabled === false ? 'Reanudado' : 'Pausado: sitio original') },
              appLayer(state.settings, appId).enabled === false ? 'Reanudar' : 'Pausar')
          : null,
        h('button', { class: 'btn quiet', onclick: () => commit(s => ST.resetAll(s), 'Todo restaurado') }, 'Restaurar todo')));
    }

    // ---------- Aplicaciones ----------
    async function renderApps() {
      const v = $('view-apps');
      v.replaceChildren();
      for (const a of UUI.adapters.all()) {
        const layer = state.settings.apps[a.id];
        const custom = !!layer && (Object.keys(layer.values || {}).length + Object.keys(layer.components || {}).length + Object.keys(layer.exceptions || {}).length) > 0;
        const isCur = state.ctx && state.ctx.adapter && state.ctx.adapter.id === a.id;
        const perm = await env.hasPermission(a);
        const meta = [perm ? 'permitido' : 'sin permiso', custom ? 'personalizado' : 'hereda común', layer && layer.enabled === false ? 'pausado' : null].filter(Boolean).join(' · ');
        v.append(h('div', { class: 'app', 'data-current': String(!!isCur), 'data-custom': String(custom) },
          h('span', { class: 'mark', 'aria-hidden': 'true' }, a.name.slice(0, 2)),
          h('span', {}, h('div', {}, a.name), h('div', { class: 'meta' }, meta + ' · v' + a.version + (a.calibratedAt ? '' : ' · sin calibrar'))),
          custom ? h('button', { class: 'btn quiet', onclick: () => commit(s => ST.resetApp(s, a.id), a.name + ' restaurado') }, '↺') : null));
      }
      if (env.openLauncher) {
        v.prepend(h('div', { class: 'group' },
          h('button', { type: 'button', class: 'btn primary',
            onclick: async () => {
              try { await env.openLauncher(); } catch (e) { toast('No se pudo abrir: ' + e.message); }
            } }, 'Abrir escritorio Firefox')));
      }
      v.append(h('p', { class: 'empty' }, 'Nuevas apps: un adaptador en adapters/. Ver docs/ADDING_AN_APP.md'));
    }

    // ---------- Perfiles ----------
    function renderProfiles() {
      const v = $('view-profiles');
      v.replaceChildren();
      const a = state.ctx && state.ctx.adapter;
      const name = h('input', { type: 'text', placeholder: 'Nombre del perfil', 'aria-label': 'Nombre del perfil', maxlength: '60' });
      v.append(h('div', { class: 'group' },
        h('p', { class: 'caps' }, h('span', {}, 'Guardar')),
        name,
        h('div', { class: 'actions', style: 'margin-top:6px' },
          h('button', { class: 'btn primary', onclick: () => commit(s => ST.saveProfile(s, name.value || 'Perfil', { scope: 'all' }).settings, 'Perfil guardado') }, 'Todo'),
          a ? h('button', { class: 'btn', onclick: () => commit(s => ST.saveProfile(s, name.value || a.name, { scope: a.id }).settings, 'Perfil guardado') }, 'Solo ' + a.name) : null,
          h('label', { class: 'btn file' }, 'Importar…', h('input', { type: 'file', accept: 'application/json', onchange: async (e) => {
            const f = e.target.files[0]; if (!f) return;
            const text = await f.text();
            let dropped = [];
            await commit(s => { const r = ST.importProfile(s, text); dropped = r.dropped; return r.settings; });
            toast(dropped.length ? `Importado; ${dropped.length} valores descartados` : 'Perfil importado');
          } })))));
      const list = Object.entries(state.settings.profiles);
      v.append(h('div', { class: 'group' }, h('p', { class: 'caps' }, h('span', {}, 'Guardados'), h('small', {}, String(list.length))),
        list.length ? list.map(([id, p]) => h('div', { class: 'row' },
          h('span', {}, p.name, ' ', h('span', { class: 'src' }, p.scope === 'all' ? 'todas' : p.scope)),
          h('div', { class: 'actions' },
            h('button', { class: 'btn', onclick: () => commit(s => ST.applyProfile(s, id), 'Perfil aplicado') }, 'Aplicar'),
            h('button', { class: 'btn quiet', 'aria-label': 'Exportar ' + p.name, onclick: () => env.download(p.name + '.uui.json', ST.exportProfile(state.settings, id)) }, '⇩'),
            h('button', { class: 'btn quiet', 'aria-label': 'Borrar ' + p.name, onclick: () => commit(s => ST.deleteProfile(s, id), 'Perfil borrado') }, '×')))) :
          h('p', { class: 'sw-label' }, 'Sin perfiles')));
      if (a) {
        const others = UUI.adapters.all().filter(o => o.id !== a.id && state.settings.apps[o.id]);
        v.append(h('div', { class: 'group' }, h('p', { class: 'caps' }, h('span', {}, 'Reutilizar en ' + a.name)),
          others.length ? h('div', { class: 'actions' }, others.map(o => h('button', { class: 'btn',
            onclick: () => commit(s => ST.copyApp(s, o.id, a.id, a), `Copiado de ${o.name}`) }, 'Copiar de ' + o.name)))
            : h('p', { class: 'sw-label' }, 'Ninguna otra app personalizada')));
      }
    }

    function render() {
      if (!state.settings) return;
      renderHead();
      for (const [tab, fn] of [['apps', renderApps], ['custom', renderCustom], ['profiles', renderProfiles]]) {
        $('tab-' + tab).setAttribute('aria-selected', String(state.tab === tab));
        $('view-' + tab).hidden = state.tab !== tab;
        if (state.tab === tab) fn();
      }
    }

    for (const tab of ['apps', 'custom', 'profiles']) {
      $('tab-' + tab).addEventListener('click', () => { state.tab = tab; render(); });
    }
    root.addEventListener('keydown', (e) => {
      if (e.target.getAttribute('role') !== 'tab') return;
      const order = ['apps', 'custom', 'profiles'];
      const i = order.indexOf(state.tab);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        state.tab = order[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3];
        render(); $('tab-' + state.tab).focus();
      }
    });

    (async () => {
      state.ctx = await env.getContext();
      state.settings = await env.store.load();
      if (!state.ctx.adapter) state.scope = 'global';
      env.store.watch(s => { state.settings = s; setTimeout(refreshReport, 60); });
      await refreshReport();
    })();
    return { state, render, refreshReport };
  }

  UUI.mountPanel = mountPanel;
})(globalThis.UUI);
