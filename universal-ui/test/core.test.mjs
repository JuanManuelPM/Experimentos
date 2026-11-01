// Herencia, aislamiento, perfiles y reutilización. Funciones puras: sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { page, fixture } from './helpers.mjs';

const { UUI } = page('<!doctype html><html><body></body></html>');
const S = UUI.store;
const empty = () => UUI.schema.emptySettings();
const plain = (x) => JSON.parse(JSON.stringify(x));
const r = (s, app, comp, key) => plain(UUI.schema.resolve(s, app, comp, key, UUI.adapters.get(app)));

test('los tres adaptadores cumplen el contrato', () => {
  for (const a of UUI.adapters.all()) assert.deepEqual(plain(UUI.adapters.validateAdapter(a)), [], a.id);
  assert.equal(UUI.adapters.all().length, 3);
});

test('un adaptador mal formado se rechaza antes de tocar ninguna página', () => {
  assert.throws(() => UUI.adapters.defineAdapter({ id: 'x', name: 'X', version: '0', hosts: [], anchors: [],
    components: { a: { selectors: ['a'], supports: ['inventado'] } }, capabilities: [{ id: 'c', component: 'zzz', selectors: ['b'] }], modes: { minimal: ['nada'] } }),
    /control desconocido inventado.*componente inexistente zzz.*capacidad inexistente nada/);
});

test('herencia Global → App → Componente → Excepción', () => {
  let s = empty();
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'fontScale'), { value: 1, source: 'default' });
  s = S.setValue(s, { level: 'global', key: 'fontScale' }, 1.1);
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'fontScale'), { value: 1.1, source: 'global' });
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'fontScale' }, 1.2);
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'fontScale'), { value: 1.2, source: 'app' });
  s = S.setValue(s, { level: 'component', appId: 'chatgpt', componentId: 'messages', key: 'fontScale' }, 1.25);
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'fontScale'), { value: 1.25, source: 'component' });
  assert.deepEqual(r(s, 'chatgpt', 'sidebar', 'fontScale'), { value: 1.2, source: 'app' }, 'otro componente hereda de la app');
  s = S.setValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'messages', key: 'fontScale' }, 0.9);
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'fontScale'), { value: 0.9, source: 'exception' });
  // quitar una capa vuelve a la anterior, sin tocar las demás
  s = S.clearValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'messages', key: 'fontScale' });
  assert.equal(r(s, 'chatgpt', 'messages', 'fontScale').source, 'component');
  assert.equal(s.global.fontScale, 1.1, 'el valor global nunca se modificó');
});

test('un control rechaza niveles y valores que no admite', () => {
  assert.throws(() => S.setValue(empty(), { level: 'component', appId: 'chatgpt', componentId: 'messages', key: 'theme' }, 'cafe'), /no admite el nivel component/);
  assert.throws(() => S.setValue(empty(), { level: 'global', key: 'fontScale' }, 9), /Valor inválido/);
  assert.throws(() => S.setValue(empty(), { level: 'global', key: 'theme' }, 'inexistente'), /Valor inválido/);
});

test('aislamiento: lo particular de una app no afecta a otra ni al global', () => {
  let s = S.setValue(empty(), { level: 'global', key: 'theme' }, 'cafe');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'theme' }, 'grafito');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  assert.equal(r(s, 'chatgpt', null, 'theme').value, 'grafito');
  assert.equal(r(s, 'whatsapp', null, 'theme').value, 'cafe');
  assert.equal(r(s, 'whatsapp', null, 'mode').value, 'completo');
  assert.equal(s.global.theme, 'cafe');
});

test('el modo define la visibilidad; las excepciones sobreviven a cambios de modo', () => {
  let s = S.setValue(empty(), { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'show:feedback'), { value: false, source: 'mode' });
  s = S.setValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'messages', key: 'show:feedback' }, true);
  assert.deepEqual(r(s, 'chatgpt', 'messages', 'show:feedback'), { value: true, source: 'exception' });
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'equilibrado');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  assert.equal(r(s, 'chatgpt', 'messages', 'show:feedback').value, true, 'la excepción sigue');
  s = S.resetExceptions(s, 'chatgpt');
  assert.equal(r(s, 'chatgpt', 'messages', 'show:feedback').value, false);
});

test('restaurar una app no toca las demás; restaurar todo conserva los perfiles', () => {
  let s = S.setValue(empty(), { level: 'app', appId: 'chatgpt', key: 'theme' }, 'cafe');
  s = S.setValue(s, { level: 'app', appId: 'whatsapp', key: 'theme' }, 'aire');
  s = S.saveProfile(s, 'Noche').settings;
  const s2 = S.resetApp(s, 'chatgpt');
  assert.equal(r(s2, 'chatgpt', null, 'theme').value, 'original');
  assert.equal(r(s2, 'whatsapp', null, 'theme').value, 'aire');
  const s3 = S.resetAll(s);
  assert.equal(r(s3, 'whatsapp', null, 'theme').value, 'original');
  assert.equal(Object.keys(s3.profiles).length, 1);
});

test('perfiles: guardar, modificar, aplicar; las excepciones se conservan por defecto', () => {
  let s = S.setValue(empty(), { level: 'global', key: 'theme' }, 'cafe');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'minimal');
  const saved = S.saveProfile(s, 'Café minimal', { id: 'p1' });
  s = saved.settings;
  s = S.setValue(s, { level: 'global', key: 'theme' }, 'tide');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'mode' }, 'completo');
  s = S.setValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'header', key: 'show:share' }, false);
  s = S.applyProfile(s, 'p1');
  assert.equal(r(s, 'chatgpt', null, 'theme').value, 'cafe');
  assert.equal(r(s, 'chatgpt', null, 'mode').value, 'minimal');
  assert.equal(r(s, 'chatgpt', 'header', 'show:share').source, 'exception');
  const strict = S.applyProfile(s, 'p1', { includeExceptions: true });
  assert.equal(r(strict, 'chatgpt', 'header', 'show:share').source, 'mode');
});

test('perfiles transferibles: exportar e importar con validación', () => {
  let s = S.setValue(empty(), { level: 'global', key: 'theme' }, 'ambar');
  s = S.setValue(s, { level: 'component', appId: 'whatsapp', componentId: 'chatList', key: 'density' }, 'compacto');
  s = S.saveProfile(s, 'Ámbar', { id: 'p1' }).settings;
  const json = S.exportProfile(s, 'p1');
  const tampered = JSON.parse(json);
  tampered.profile.data.global.theme = 'ambar';
  tampered.profile.data.global.script = '<img onerror=alert(1)>';
  tampered.profile.data.apps.whatsapp.values.fontScale = 40;
  const imp = S.importProfile(empty(), JSON.stringify(tampered));
  assert.deepEqual(plain(imp.dropped).sort(), ['global.script', 'whatsapp.fontScale']);
  const s2 = S.applyProfile(imp.settings, imp.id);
  assert.equal(r(s2, 'whatsapp', 'chatList', 'density').value, 'compacto');
  assert.equal(r(s2, 'chatgpt', null, 'theme').value, 'ambar');
  assert.throws(() => S.importProfile(empty(), '{"foo":1}'), /No es un perfil/);
});

test('reutilizar configuración entre apps solo copia lo que el destino entiende', () => {
  let s = S.setValue(empty(), { level: 'app', appId: 'chatgpt', key: 'theme' }, 'cafe');
  s = S.setValue(s, { level: 'app', appId: 'chatgpt', key: 'fontScale' }, 1.15);
  s = S.setValue(s, { level: 'component', appId: 'chatgpt', componentId: 'messages', key: 'readingWidth' }, 'amplio');
  s = S.setValue(s, { level: 'exception', appId: 'chatgpt', componentId: 'header', key: 'show:share' }, false);
  const out = S.copyApp(s, 'chatgpt', 'whatsapp', UUI.adapters.get('whatsapp'));
  assert.equal(r(out, 'whatsapp', null, 'theme').value, 'cafe');
  assert.equal(r(out, 'whatsapp', 'conversation', 'fontScale').value, 1.15);
  assert.equal(out.apps.whatsapp.components.messages, undefined, 'WhatsApp no tiene componente messages');
  assert.deepEqual(plain(out.apps.whatsapp.exceptions), {}, 'share no existe en WhatsApp');
  assert.equal(r(out, 'chatgpt', null, 'theme').value, 'cafe', 'el origen no cambia');
});

test('Store notifica cambios en tiempo real entre contextos', async () => {
  const area = S.memoryArea();
  const a = new S.Store(area), b = new S.Store(area);
  const seen = [];
  b.watch(s => seen.push(s.global.theme));
  await a.update(s => S.setValue(s, { level: 'global', key: 'theme' }, 'papel'));
  assert.deepEqual(plain(seen), ['papel']);
  assert.equal((await b.load()).global.theme, 'papel');
});

test('fixture de prueba disponible', () => assert.match(fixture('chatgpt'), /FIXTURE SINTÉTICO/));
