/* Adaptador WhatsApp Web.
   Primera versión: selectores candidatos basados en la estructura pública conocida
   (#app, #side, #pane-side, #main, footer). calibratedAt: null → sin verificar en vivo.
   El motor mostrará "No encontrado" en lo que no coincida: no se simula nada.
   Límites deliberados: no lee mensajes ni contactos, no escribe en el cuadro de texto,
   no ofrece acciones de envío. */
(function (UUI) {
  'use strict';
  const DARK = ':is(body.dark, html.dark, html[data-theme="dark"])';
  const ON = `html[data-uui-theme] ${DARK}`;
  const ON_ROOT = `html[data-uui-theme]:is(.dark, [data-theme="dark"])`;

  UUI.adapters.defineAdapter({
    id: 'whatsapp',
    name: 'WhatsApp Web',
    version: '0.1.0',
    calibratedAt: null,
    hosts: ['web.whatsapp.com'],
    anchors: [
      { id: 'app', selectors: ['#app'] },
      { id: 'side', selectors: ['#side'] },
    ],
    essentials: ['footer [contenteditable="true"]', '#main', '#pane-side', '#side [contenteditable="true"]'],

    components: {
      nav:          { label: 'Navegación', selectors: ['#app header[data-tab]', '#app div[role="navigation"]', '#app header'], supports: [] },
      chatList:     { label: 'Lista de chats', selectors: ['#pane-side'], supports: ['fontScale', 'font', 'density'],
                      targets: { density: ['#pane-side [role="listitem"]', '#pane-side [role="row"]'] } },
      conversation: { label: 'Conversación', selectors: ['#main'], supports: ['fontScale', 'font', 'readingWidth', 'margin'],
                      targets: {
                        fontScale: ['#main .copyable-text', '#main [data-pre-plain-text]'],
                        readingWidth: ['#main [role="application"]', '#main .copyable-area > div:nth-child(2)'],
                        margin: ['#main [role="application"]'],
                      } },
      composer:     { label: 'Cuadro de texto', selectors: ['#main footer'], supports: ['fontScale', 'font'],
                      targets: { fontScale: ['#main footer [contenteditable="true"]'], font: ['#main footer [contenteditable="true"]'] } },
    },

    capabilities: [
      { id: 'status', label: 'Estados', component: 'nav', selectors: ['[aria-label="Status" i]', '[aria-label="Estados" i]', 'button:has(> span[data-icon="status-outline"])'] },
      { id: 'channels', label: 'Canales', component: 'nav', selectors: ['[aria-label="Channels" i]', '[aria-label="Canales" i]', 'button:has(> span[data-icon="newsletter-outline"])'] },
      { id: 'communities', label: 'Comunidades', component: 'nav', selectors: ['[aria-label="Communities" i]', '[aria-label="Comunidades" i]', 'button:has(> span[data-icon="community-outline"])'] },
      { id: 'meta-ai', label: 'Meta AI', component: 'nav', selectors: ['[aria-label="Meta AI" i]', 'button:has(> span[data-icon="meta-ai"])'] },
      { id: 'filters', label: 'Filtros de chats', component: 'chatList', selectors: ['#side [role="tablist"]', '#side [aria-label*="filters" i]', '#side [aria-label*="filtros" i]'] },
      { id: 'archived', label: 'Archivados', component: 'chatList', selectors: ['#pane-side button[aria-label*="Archived" i]', '#pane-side button[aria-label*="Archivados" i]'] },
      { id: 'banner', label: 'Avisos', component: 'chatList', selectors: ['#side [role="button"]:has(span[data-icon="alert-notification"])', '#side span[data-icon="alert-notification"]'] },
      { id: 'avatars', label: 'Fotos de perfil', component: 'chatList', selectors: ['#pane-side img'] },
    ],

    modes: {
      minimal: ['status', 'channels', 'communities', 'meta-ai', 'filters', 'banner'],
      equilibrado: ['meta-ai', 'banner'],
      completo: [],
    },

    theme: {
      requires(doc) {
        const dark = doc.body && doc.body.classList.contains('dark') ||
          doc.documentElement.classList.contains('dark') || doc.documentElement.getAttribute('data-theme') === 'dark';
        return dark ? null : 'Requiere el tema oscuro de WhatsApp Web';
      },
      bridge: `
${ON}, ${ON_ROOT} {
  --panel-background: var(--uui-side) !important; --panel-header-background: var(--uui-card) !important;
  --conversation-panel-background: var(--uui-bg) !important; --conversation-header-background: var(--uui-card) !important;
  --compose-input-background: var(--uui-card) !important; --search-container-background: var(--uui-side) !important;
  --primary: var(--uui-text) !important; --primary-strong: var(--uui-text) !important; --secondary: var(--uui-muted) !important;
  --border-list: var(--uui-border) !important; --incoming-background: var(--uui-card) !important;
}
html[data-uui-theme] :is(#side, #pane-side) { background-color: var(--uui-side) !important; }
html[data-uui-theme] :is(#main header, #main footer) { background-color: var(--uui-card) !important; }
html[data-uui-theme] #main [role="application"] { background-color: var(--uui-bg) !important; }`,
      verify: [
        { selector: ['#pane-side', '#side'], property: 'background-color', token: 'side' },
        { selector: ['#main header'], property: 'background-color', token: 'card' },
      ],
      contrast: null,
    },

    actions: [
      { id: 'new-chat', label: 'Nuevo chat', selectors: ['[aria-label="New chat" i]', '[aria-label="Nuevo chat" i]', 'button:has(> span[data-icon="new-chat-outline"])'] },
      { id: 'archived', label: 'Abrir archivados', selectors: ['#pane-side button[aria-label*="Archived" i]', '#pane-side button[aria-label*="Archivados" i]'] },
    ],
  });
})(globalThis.UUI);
