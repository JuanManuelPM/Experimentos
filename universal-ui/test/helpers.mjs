import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const EXT = join(here, '..', 'extension');
export const CORE = ['core/status.js', 'core/themes.js', 'core/schema.js', 'core/store.js', 'core/adapter.js', 'core/engine.js'];
export const ADAPTERS = ['adapters/chatgpt.js', 'adapters/whatsapp.js', 'adapters/wikipedia.js'];

export function fixture(name) {
  return readFileSync(join(here, 'fixtures', name + '.html'), 'utf8');
}

// Carga el núcleo y los adaptadores reales (los mismos archivos que usa la extensión) dentro de una página.
export function page(html, { adapters = ADAPTERS, url = 'https://example.test/' } = {}) {
  const dom = new JSDOM(html, { runScripts: 'outside-only', url, pretendToBeVisual: true });
  const w = dom.window;
  for (const f of CORE.concat(adapters)) w.eval(readFileSync(join(EXT, f), 'utf8'));
  return { dom, w, doc: w.document, UUI: w.UUI };
}

export function engineFor(p, id, extra = {}) {
  const adapter = p.UUI.adapters.get(id);
  return p.UUI.createEngine({ adapter, document: p.doc, window: p.w, debounceMs: 0, ...extra });
}

export const visible = (p, sel) => p.w.getComputedStyle(p.doc.querySelector(sel)).display !== 'none';
export const tick = (ms = 5) => new Promise(r => setTimeout(r, ms));
