/* Adaptador de ejemplo: Wikipedia (skin Vector 2022).
   Demuestra la incorporación de una tercera app sin tocar el núcleo:
   este archivo + una línea en manifest.json + una línea en el registro de la ventana emergente.
   Ver docs/ADDING_AN_APP.md. */
(function (UUI) {
  'use strict';
  UUI.adapters.defineAdapter({
    id: 'wikipedia',
    name: 'Wikipedia',
    version: '0.1.0',
    calibratedAt: null,
    hosts: ['es.wikipedia.org', 'en.wikipedia.org'],
    anchors: [{ id: 'content', selectors: ['#content', '.mw-body'] }],
    essentials: ['#mw-content-text', '#firstHeading'],
    components: {
      article: { label: 'Artículo', selectors: ['#content', '.mw-body'], supports: ['fontScale', 'font', 'readingWidth', 'margin'],
                 targets: { fontScale: ['#mw-content-text'], readingWidth: ['.mw-page-container'] } },
      menus:   { label: 'Menús', selectors: ['.vector-header-container', '#mw-head'], supports: ['density'] },
    },
    capabilities: [
      { id: 'toc', label: 'Índice', component: 'article', selectors: ['#vector-toc-pinned-container', '#toc'] },
      { id: 'tools', label: 'Herramientas', component: 'article', selectors: ['#vector-page-tools-pinned-container'] },
      { id: 'notice', label: 'Avisos del sitio', component: 'menus', selectors: ['#siteNotice', '#centralNotice'] },
      { id: 'langs', label: 'Idiomas', component: 'menus', selectors: ['#p-lang-btn'] },
    ],
    modes: { minimal: ['toc', 'tools', 'notice', 'langs'], equilibrado: ['notice'], completo: [] },
    theme: {
      bridge: `
html[data-uui-theme] { color-scheme: dark; --background-color-base: var(--uui-bg) !important; --color-base: var(--uui-text) !important; }
html[data-uui-theme] body, html[data-uui-theme] .mw-page-container { background-color: var(--uui-bg) !important; color: var(--uui-text) !important; }
html[data-uui-theme] a { color: var(--uui-accent) !important; }`,
      verify: [{ selector: ['.mw-page-container', 'body'], property: 'background-color', token: 'bg' }],
      contrast: { text: ['#mw-content-text p', '#mw-content-text'] },
    },
    actions: [{ id: 'search', label: 'Buscar', selectors: ['#searchInput', 'input[name="search"]'] }],
  });
})(globalThis.UUI);
