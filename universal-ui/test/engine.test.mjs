// Motor contra páginas: aplicación verificada, estados honestos, restauración, cambios del sitio.
import test from 'node:test';
import assert from 'node:assert/strict';
import { page, fixture, engineFor, visible, tick } from './helpers.mjs';

const set = (p, s, t, v) => p.UUI.store.setValue(s, t, v);
const empty = (p) => p.UUI.schema.emptySettings();
const st = (rep, id) => rep.statuses[id] && rep.statuses[id].status;

test('ChatGPT · modo Minimal oculta lo que existe e informa lo que no', () => {
  const p = page(fixture('chatgpt'));
  const e = engineFor(p, 'chatgpt');
  const rep = e.apply(set(p, empty(p), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal'));
  assert.ok(rep.health.ok);
  assert.equal(st(rep, 'share'), 'applied');
  assert.equal(visible(p, '[data-testid="share-chat-button"]'), false);
  assert.equal(st(rep, 'feedback'), 'applied');
  assert.equal(st(rep, 'notices'), 'applied');
  assert.equal(st(rep, 'upgrade'), 'applied');
  assert.equal(st(rep, 'brand'), 'not_found', 'la regla anterior apuntaba a data-testid que no existen');
  assert.equal(st(rep, 'sidebar'), 'available', 'Minimal no oculta la barra lateral');
  assert.equal(visible(p, '#prompt-textarea'), true);
});

test('un control sin efecto real se informa como error y se revierte', () => {
  // el sitio fija el botón con un estilo en línea !important (p. ej. un re-render de React)
  const p = page(fixture('chatgpt').replace('data-testid="share-chat-button"', 'data-testid="share-chat-button" style="display: inline-flex !important"'));
  const e = engineFor(p, 'chatgpt');
  const rep = e.apply(set(p, empty(p), { level: 'exception', appId: 'chatgpt', componentId: 'header', key: 'show:share' }, false));
  assert.equal(st(rep, 'share'), 'error');
  assert.match(rep.statuses.share.detail, /sigue visible/);
  assert.equal(p.doc.querySelector('[data-uui-hide]'), null, 'no quedan marcas');
});

test('nunca se oculta un elemento esencial ni su contenedor', () => {
  const p = page(fixture('chatgpt'));
  p.UUI.adapters.defineAdapter({ ...p.UUI.adapters.get('chatgpt'), id: 'chatgpt-bad',
    capabilities: [{ id: 'all', label: 'Todo', component: 'messages', selectors: ['[data-app-shell-main-content-layout]'] }],
    modes: { minimal: ['all'], equilibrado: [], completo: [] } });
  const e = engineFor(p, 'chatgpt-bad');
  const rep = e.apply(set(p, empty(p), { level: 'app', appId: 'chatgpt-bad', key: 'mode' }, 'minimal'));
  assert.equal(st(rep, 'all'), 'incompatible');
  assert.equal(visible(p, 'main'), true);
});

test('tema global Café: aplicado y verificado en superficies reales', () => {
  const p = page(fixture('chatgpt'));
  const e = engineFor(p, 'chatgpt');
  const rep = e.apply(set(p, empty(p), { level: 'global', key: 'theme' }, 'cafe'));
  assert.equal(st(rep, 'theme'), 'applied');
  assert.equal(rep.statuses.theme.source, 'global');
  assert.equal(p.doc.documentElement.getAttribute('data-uui-theme'), 'cafe');
});

test('tema en modo claro de ChatGPT: incompatible, no se aplica nada', () => {
  const p = page(fixture('chatgpt').replace('class="dark" data-theme="dark"', 'data-theme="light"'));
  const rep = engineFor(p, 'chatgpt').apply(set(p, empty(p), { level: 'global', key: 'theme' }, 'cafe'));
  assert.equal(st(rep, 'theme'), 'incompatible');
  assert.equal(p.doc.documentElement.hasAttribute('data-uui-theme'), false);
});

test('tema con contraste insuficiente se revierte solo', () => {
  const p = page(fixture('chatgpt'));
  p.UUI.THEMES.roto = { name: 'Roto', scheme: 'dark', bg: '#222222', side: '#222222', card: '#222222', text: '#2a2a2a', muted: '#333333', border: '#444444', accent: '#555555' };
  const rep = engineFor(p, 'chatgpt').apply(set(p, empty(p), { level: 'global', key: 'theme' }, 'roto'));
  assert.equal(st(rep, 'theme'), 'error');
  assert.match(rep.statuses.theme.detail, /Contraste insuficiente/);
  assert.equal(p.doc.documentElement.hasAttribute('data-uui-theme'), false);
});

test('texto y ancho de lectura por componente, verificados', () => {
  const p = page(fixture('chatgpt'));
  let s = set(p, empty(p), { level: 'component', appId: 'chatgpt', componentId: 'messages', key: 'fontScale' }, 1.25);
  s = set(p, s, { level: 'component', appId: 'chatgpt', componentId: 'messages', key: 'readingWidth' }, 'amplio');
  const rep = engineFor(p, 'chatgpt').apply(s);
  assert.equal(st(rep, 'messages.fontScale'), 'applied');
  assert.equal(parseFloat(p.w.getComputedStyle(p.doc.querySelector('.markdown')).fontSize), 20);
  assert.equal(st(rep, 'messages.readingWidth'), 'applied');
  assert.equal(st(rep, 'sidebar.fontScale'), 'available', 'otro componente no cambia');
});

test('restauración total: la página vuelve a ser idéntica a la original', () => {
  const p = page(fixture('chatgpt'));
  const before = p.doc.documentElement.outerHTML;
  const e = engineFor(p, 'chatgpt');
  let s = set(p, empty(p), { level: 'global', key: 'theme' }, 'cafe');
  s = set(p, s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  s = set(p, s, { level: 'app', appId: 'chatgpt', key: 'fontScale' }, 1.2);
  s = set(p, s, { level: 'app', appId: 'chatgpt', key: 'margin' }, 'amplio');
  e.apply(s);
  assert.notEqual(p.doc.documentElement.outerHTML, before);
  e.revertAll();
  assert.equal(p.doc.documentElement.outerHTML, before);
  // y también vía configuración: restaurar todo = sitio original
  e.apply(s);
  e.apply(p.UUI.store.resetAll(s));
  assert.equal(p.doc.documentElement.outerHTML.replace(/<style id="uui-style">[\s\S]*?<\/style>/, ''), before);
  assert.equal(p.doc.querySelectorAll('[data-uui-hide], [data-uui-c]').length, 0);
});

test('pausar una app devuelve el sitio original sin perder la configuración', () => {
  const p = page(fixture('chatgpt'));
  const before = p.doc.documentElement.outerHTML;
  const e = engineFor(p, 'chatgpt');
  let s = set(p, empty(p), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  e.apply(s);
  s = p.UUI.store.setEnabled(s, 'chatgpt', false);
  e.apply(s);
  assert.equal(p.doc.documentElement.outerHTML, before);
  assert.equal(s.apps.chatgpt.values.mode, 'minimal');
});

test('cambios en tiempo real desde el almacenamiento', async () => {
  const p = page(fixture('chatgpt'));
  const store = new p.UUI.store.Store(p.UUI.store.memoryArea());
  const e = engineFor(p, 'chatgpt');
  e.apply(await store.load());
  store.watch(s => e.apply(s));
  assert.equal(visible(p, '[data-testid="share-chat-button"]'), true);
  await store.update(s => set(p, s, { level: 'exception', appId: 'chatgpt', componentId: 'header', key: 'show:share' }, false));
  assert.equal(visible(p, '[data-testid="share-chat-button"]'), false);
  await store.update(s => p.UUI.store.clearValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'header', key: 'show:share' }));
  assert.equal(visible(p, '[data-testid="share-chat-button"]'), true);
});

test('elementos que aparecen después (SPA) se procesan solos', async () => {
  const p = page(fixture('chatgpt'));
  const e = engineFor(p, 'chatgpt');
  e.apply(set(p, empty(p), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal'));
  e.start();
  const art = p.doc.querySelector('article[data-testid="conversation-turn-2"]').cloneNode(true);
  p.doc.querySelector('main').insertBefore(art, p.doc.querySelector('form'));
  await tick(20);
  const btns = [...p.doc.querySelectorAll('[data-testid="good-response-turn-action-button"]')];
  assert.equal(btns.length, 2);
  assert.ok(btns.every(b => p.w.getComputedStyle(b).display === 'none'));
  e.stop();
});

test('una actualización del sitio que invalida una regla se detecta', async () => {
  const p = page(fixture('chatgpt'));
  const e = engineFor(p, 'chatgpt');
  e.apply(set(p, empty(p), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal'));
  e.start();
  // el sitio renombra su botón de compartir
  p.doc.querySelector('[data-testid="share-chat-button"]').setAttribute('data-testid', 'share-v2');
  p.doc.body.append(p.doc.createElement('div'));
  await tick(20);
  const rep = e.report();
  e.stop();
  // el botón conserva aria-label="Share" dentro de #page-header → selector alternativo
  assert.equal(st(rep, 'share'), 'applied');
  assert.equal(rep.statuses.share.fallback, true);
  assert.ok(rep.drift.some(d => d.id === 'share' && d.kind === 'selector alternativo'));
  p.doc.querySelector('#page-header button').remove();
  const rep2 = e.apply();
  assert.equal(st(rep2, 'share'), 'not_found');
  assert.ok(rep2.drift.some(d => d.id === 'share' && d.kind === 'desaparecido'));
});

test('si cambia la estructura básica, la app entera queda incompatible y sin tocar', () => {
  const p = page(fixture('chatgpt').replace('<textarea id="prompt-textarea"></textarea>', '<div contenteditable></div>'));
  const before = p.doc.documentElement.outerHTML;
  const rep = engineFor(p, 'chatgpt').apply(set(p, empty(p), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal'));
  assert.equal(rep.health.ok, false);
  assert.deepEqual([...rep.health.missing], ['composer']);
  assert.equal(st(rep, 'share'), 'incompatible');
  assert.equal(p.doc.documentElement.outerHTML, before);
});

test('acciones nativas: sí a controles reales, nunca a envío', () => {
  const p = page(fixture('chatgpt'));
  const e = engineFor(p, 'chatgpt');
  const rep = e.apply(empty(p));
  assert.equal(st(rep, 'a:new-chat'), 'available');
  assert.equal(st(rep, 'a:search'), 'not_found');
  let clicked = 0;
  p.doc.querySelector('[data-testid="create-new-chat-button"]').addEventListener('click', ev => { ev.preventDefault(); clicked++; });
  assert.deepEqual({ ...e.runAction('new-chat') }, { ok: true });
  assert.equal(clicked, 1);
  p.UUI.adapters.defineAdapter({ ...p.UUI.adapters.get('chatgpt'), id: 'chatgpt-send', actions: [{ id: 'send', label: 'Enviar', selectors: ['[data-testid="send-button"]'] }] });
  const e2 = engineFor(p, 'chatgpt-send');
  assert.equal(st(e2.apply(empty(p)), 'a:send'), 'incompatible');
  assert.equal(e2.runAction('send').ok, false);
});

test('privacidad: el motor no lee texto ni valores de la página', () => {
  const p = page(fixture('chatgpt'));
  const reads = [];
  const trap = (proto, prop) => {
    const d = Object.getOwnPropertyDescriptor(proto, prop);
    if (!d || !d.get) return;
    Object.defineProperty(proto, prop, { configurable: true, set: d.set, get() { if (this.id !== 'uui-style') reads.push(prop); return d.get.call(this); } });
  };
  trap(p.w.Node.prototype, 'textContent');
  trap(p.w.HTMLElement.prototype, 'innerText');
  trap(p.w.Element.prototype, 'innerHTML');
  trap(p.w.HTMLTextAreaElement.prototype, 'value');
  const e = engineFor(p, 'chatgpt');
  let s = set(p, empty(p), { level: 'global', key: 'theme' }, 'cafe');
  s = set(p, s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  e.apply(s); e.report(); e.revertAll();
  assert.deepEqual(reads, []);
});

test('WhatsApp Web · distribución de la lista y modo, aislado de ChatGPT', () => {
  const p = page(fixture('whatsapp'));
  const e = engineFor(p, 'whatsapp');
  let s = set(p, empty(p), { level: 'global', key: 'theme' }, 'cafe');
  s = set(p, s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');            // no debe afectar a WhatsApp
  s = set(p, s, { level: 'component', appId: 'whatsapp', componentId: 'chatList', key: 'density' }, 'compacto');
  let rep = e.apply(s);
  assert.ok(rep.health.ok);
  assert.equal(st(rep, 'theme'), 'applied');
  assert.equal(st(rep, 'status'), 'available', 'el modo minimal de ChatGPT no se filtra');
  assert.equal(st(rep, 'chatList.density'), 'applied');
  assert.equal(parseFloat(p.w.getComputedStyle(p.doc.querySelector('#pane-side [role="listitem"]')).paddingTop), 7.5);
  assert.equal(st(rep, 'banner'), 'not_found');
  s = set(p, s, { level: 'app', appId: 'whatsapp', key: 'mode' }, 'minimal');
  rep = e.apply(s);
  assert.equal(st(rep, 'status'), 'applied');
  assert.equal(visible(p, '[aria-label="Status"]'), false);
  assert.equal(visible(p, '#main footer [contenteditable]'), true);
  assert.equal(st(rep, 'a:new-chat'), 'available');
});
