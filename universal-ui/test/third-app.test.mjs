// Incorporar una tercera app no requiere cambios en el núcleo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { page, fixture, engineFor, visible, EXT, ADAPTERS } from './helpers.mjs';

test('Wikipedia funciona con el mismo motor, sin código específico en el núcleo', () => {
  const p = page(fixture('wikipedia'));
  const before = p.doc.documentElement.outerHTML;
  const e = engineFor(p, 'wikipedia');
  let s = p.UUI.store.setValue(p.UUI.schema.emptySettings(), { level: 'global', key: 'theme' }, 'cafe');
  s = p.UUI.store.setValue(s, { level: 'app', appId: 'wikipedia', key: 'mode' }, 'equilibrado');
  s = p.UUI.store.setValue(s, { level: 'component', appId: 'wikipedia', componentId: 'article', key: 'readingWidth' }, 'lectura');
  const rep = e.apply(s);
  assert.equal(rep.statuses.theme.status, 'applied');
  assert.equal(rep.statuses.notice.status, 'applied');
  assert.equal(visible(p, '#siteNotice'), false);
  assert.equal(rep.statuses['article.readingWidth'].status, 'applied');
  e.revertAll();
  assert.equal(p.doc.documentElement.outerHTML, before);
});

test('el núcleo no menciona ninguna app concreta', () => {
  for (const f of ['core/engine.js', 'core/schema.js', 'core/store.js', 'core/adapter.js', 'core/themes.js']) {
    const src = readFileSync(join(EXT, f), 'utf8');
    assert.doesNotMatch(src, /chatgpt|whatsapp|wikipedia/i, f);
  }
});

test('un adaptador nuevo definido en 20 líneas se aplica y se verifica', () => {
  const p = page('<!doctype html><html><body><div id="notes"><nav id="nb">[menú]</nav><div class="ed" style="font-size:15px">[nota]</div><aside class="promo">[promo]</aside></div></body></html>', { adapters: [] });
  p.UUI.adapters.defineAdapter({
    id: 'notas', name: 'Notas', version: '0.0.1', hosts: ['notas.test'],
    anchors: [{ id: 'root', selectors: ['#notes'] }],
    essentials: ['.ed'],
    components: { editor: { label: 'Editor', selectors: ['.ed'], supports: ['fontScale'] }, nav: { label: 'Menú', selectors: ['#nb'], supports: [] } },
    capabilities: [{ id: 'promo', label: 'Promoción', component: 'nav', selectors: ['.promo'] }],
    modes: { minimal: ['promo'], equilibrado: ['promo'], completo: [] },
  });
  const e = engineFor(p, 'notas');
  let s = p.UUI.store.setValue(p.UUI.schema.emptySettings(), { level: 'global', key: 'mode' }, 'minimal');
  s = p.UUI.store.setValue(s, { level: 'global', key: 'fontScale' }, 1.2);
  const rep = e.apply(s);
  assert.equal(rep.statuses.promo.status, 'applied');
  assert.equal(rep.statuses['editor.fontScale'].status, 'applied');
  assert.equal(rep.statuses.theme.status, 'incompatible', 'sin puente de tema: se dice, no se simula');
});

test('el manifiesto y el panel cargan los mismos archivos de adaptador', () => {
  const manifest = JSON.parse(readFileSync(join(EXT, 'manifest.json'), 'utf8'));
  const js = manifest.content_scripts[0].js;
  for (const a of ADAPTERS) assert.ok(js.includes(a), a);
  const popup = readFileSync(join(EXT, 'popup/popup.html'), 'utf8');
  for (const a of ADAPTERS) assert.ok(popup.includes('../' + a), a);
  const envExt = readFileSync(join(EXT, 'popup/env-extension.js'), 'utf8');
  for (const f of js) assert.ok(envExt.includes(`'${f}'`), 'env-extension CONTENT_FILES: ' + f);
  const p = page('<!doctype html><html></html>');
  const hosts = p.UUI.adapters.all().flatMap(a => a.hosts.map(h => `https://${h}/*`));
  assert.deepEqual([...manifest.host_permissions].sort(), [...hosts].sort());
});
