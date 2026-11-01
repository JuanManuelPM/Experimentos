// Genera demo/index.html: un único archivo que ejecuta el panel y el motor REALES
// contra las páginas sintéticas de test/fixtures. Es una simulación de los sitios,
// no una modificación de los sitios reales. Uso: node scripts/build-demo.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ext = (f) => readFileSync(join(root, 'extension', f), 'utf8');
const fx = (n) => readFileSync(join(root, 'test', 'fixtures', n + '.html'), 'utf8');
const scripts = ['core/status.js', 'core/themes.js', 'core/schema.js', 'core/store.js', 'core/adapter.js', 'core/engine.js',
  'adapters/chatgpt.js', 'adapters/whatsapp.js', 'adapters/wikipedia.js', 'popup/popup.js'].map(ext).join('\n');
const panel = ext('popup/popup.html').match(/<div id="uui"[\s\S]*?<p id="toast"[^>]*><\/p>\n<\/div>/)[0];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const APPS = [['chatgpt', 'chatgpt.com'], ['whatsapp', 'web.whatsapp.com'], ['wikipedia', 'es.wikipedia.org']];

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Universal UI · demo</title>
<style>
${ext('popup/popup.css')}
.demo { display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; min-height: 100vh; align-items: flex-start; }
.browser { flex: 999 1 560px; min-width: 0; border: 2px solid var(--border); border-radius: 8px; overflow: hidden; background: var(--surface); }
.chrome { display: flex; align-items: center; gap: 6px; height: 34px; padding: 0 8px; border-bottom: 1px solid var(--border); font: 12px var(--mono); }
.chrome .tabbtn { border: 1px solid var(--border); background: none; color: var(--text-muted); border-radius: 4px; padding: 2px 10px; min-height: 26px; }
.chrome .tabbtn[aria-pressed="true"] { color: var(--text); border-color: var(--focus); }
.chrome .sim { margin-left: auto; color: var(--yellow); }
.chrome .uui-btn { border: 1px solid var(--focus); background: var(--raised); color: var(--focus); border-radius: 4px; width: 28px; height: 26px; }
iframe { width: 100%; height: 620px; border: 0; background: #fff; display: block; }
.side { flex: 0 0 380px; display: flex; flex-direction: column; gap: 8px; }
.note { font: 11px/16px var(--mono); color: var(--text-muted); max-width: 380px; }
</style>
</head>
<body>
<div class="demo">
  <div class="side">
    ${panel}
    <p class="note">SIMULACIÓN · páginas sintéticas de test/fixtures, no los sitios reales. El panel, el motor y los adaptadores son los mismos archivos que usa la extensión. Los cambios se aplican en vivo a las tres pestañas.</p>
  </div>
  <div class="browser">
    <div class="chrome" role="group" aria-label="Pestañas simuladas">
      ${APPS.map(([id, host]) => `<button class="tabbtn" data-app="${id}" aria-pressed="false">${host}</button>`).join('')}
      <span class="sim">simulación</span>
    </div>
    ${APPS.map(([id]) => `<iframe title="${id} (simulación)" data-app="${id}" srcdoc="${esc(fx(id))}" hidden></iframe>`).join('\n    ')}
  </div>
</div>
<script>
${scripts}
(function (UUI) {
  'use strict';
  const area = UUI.store.memoryArea();
  const store = new UUI.store.Store(area);
  const engines = {};
  const hostOf = { ${APPS.map(([id, host]) => `${id}: '${host}'`).join(', ')} };
  let current = 'chatgpt';
  const ready = [...document.querySelectorAll('iframe')].map(f => new Promise(res => {
    const init = () => {
      if (engines[f.dataset.app]) return res();
      const id = f.dataset.app;
      engines[id] = UUI.createEngine({ adapter: UUI.adapters.get(id), document: f.contentDocument, window: f.contentWindow });
      store.load().then(s => { engines[id].apply(s); engines[id].start(); res(); });
    };
    const d = f.contentDocument;
    if (d && d.readyState === 'complete' && d.body && d.body.children.length) init();
    else f.addEventListener('load', init);
  }));
  store.watch(s => Object.values(engines).forEach(e => e.apply(s)));
  function show(id) {
    current = id;
    document.querySelectorAll('.tabbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.app === id)));
    document.querySelectorAll('iframe').forEach(f => { f.hidden = f.dataset.app !== id; });
  }
  show('chatgpt');
  let panel = null;
  const env = {
    store,
    getContext: async () => ({ host: hostOf[current], adapter: UUI.adapters.get(current), permitted: true }),
    hasPermission: async () => true,
    requestPermission: async () => true,
    getReport: async () => engines[current] ? engines[current].report() : null,
    runAction: async (id) => engines[current].runAction(id),
    download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text])); a.download = name; a.click(); },
  };
  Promise.all(ready).then(() => {
    panel = UUI.mountPanel(document.getElementById('uui'), env);
    document.querySelectorAll('.tabbtn').forEach(b => b.addEventListener('click', async () => {
      show(b.dataset.app);
      panel.state.ctx = await env.getContext();
      panel.state.component = null;
      await panel.refreshReport();
    }));
  });
})(globalThis.UUI);
</script>
</body>
</html>
`;
mkdirSync(join(root, 'demo'), { recursive: true });
writeFileSync(join(root, 'demo', 'index.html'), html);
console.log('demo/index.html', html.length, 'bytes');
