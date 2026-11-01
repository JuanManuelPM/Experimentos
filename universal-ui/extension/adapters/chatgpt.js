/* Adaptador ChatGPT.
   Migrado desde userstyles/chatgpt-live.css v1.3.0 (V07 paletas, V08 visibilidad).
   Diferencias con la versión anterior:
   - Cada elemento declara candidatos; el motor informa cuál coincide y verifica el efecto.
   - El tema traduce tokens universales (--uui-*) en lugar de paletas propias del sitio.
   - El tema sigue limitado al modo oscuro: en el claro el sitio fija texto oscuro (decisión heredada).
   calibratedAt: null → los selectores no se volvieron a comprobar en vivo desde este entorno. */
(function (UUI) {
  'use strict';
  const DARK = ':is(html[data-theme="dark"], html.dark)[data-uui-theme]';
  const SIDEBAR = ['#app-shell-sidebar', 'aside[data-app-shell-left-panel-appearance]', '[data-app-navigation-rail="true"]', '#stage-slideover-sidebar', 'nav[aria-label="Chat history" i]'];
  const HEADER = ['#page-header', '[data-testid="conversation-header"]', '[data-app-shell-top-bar]', 'main header'];

  UUI.adapters.defineAdapter({
    id: 'chatgpt',
    name: 'ChatGPT',
    version: '0.1.0',
    calibratedAt: null,
    hosts: ['chatgpt.com', 'chat.openai.com'],
    anchors: [
      { id: 'composer', selectors: ['#prompt-textarea', '[data-testid="composer"] textarea', 'form textarea'] },
      { id: 'main', selectors: ['main'] },
    ],
    essentials: ['#prompt-textarea', '[data-testid="composer"]', '[data-message-author-role]', 'main'],

    components: {
      sidebar:  { label: 'Barra lateral', selectors: SIDEBAR, supports: ['fontScale', 'font', 'density'] },
      header:   { label: 'Encabezado', selectors: HEADER, supports: ['density'] },
      messages: { label: 'Conversación', selectors: ['[data-app-shell-main-content-layout]', 'main'],
                  supports: ['fontScale', 'font', 'readingWidth', 'margin'],
                  targets: {
                    fontScale: ['[data-message-author-role] .markdown', '[data-message-author-role] .whitespace-pre-wrap'],
                    font: ['[data-message-author-role]'],
                    readingWidth: ['main [class*="thread-content-max-width"]', 'main article > div > div'],
                    margin: ['main article', 'main [data-testid^="conversation-turn"]'],
                  } },
      composer: { label: 'Cuadro de texto', selectors: ['[data-testid="composer"]', '[data-testid="composer-root"]', 'form:has(#prompt-textarea)'],
                  supports: ['fontScale', 'font', 'readingWidth'],
                  targets: { fontScale: ['#prompt-textarea'], font: ['#prompt-textarea'] } },
    },

    capabilities: [
      { id: 'upgrade', label: 'Promociones', component: 'sidebar', selectors: [
        '#app-shell-sidebar :is(a[href*="/upgrade" i], a[href*="/pricing" i], [data-testid*="upgrade" i])',
        ':is(#page-header, header) :is(a[href*="/upgrade" i], button[aria-label*="upgrade" i], [data-testid*="upgrade" i])',
        'aside:has(button[aria-label="Dismiss ChatGPT beacon banner" i])'] },
      { id: 'share', label: 'Compartir', component: 'header', selectors: [
        'button[data-testid="share-chat-button"]', ':is(#page-header, header) button[aria-label="Share" i]', ':is(#page-header, header) button[aria-label="Compartir" i]'] },
      { id: 'notices', label: 'Avisos', component: 'composer', selectors: [
        '[data-testid="thread-disclaimer"]', '[data-testid="composer-disclaimer"]'] },
      { id: 'feedback', label: 'Valoraciones', component: 'messages', selectors: [
        '[data-message-author-role="assistant"] :is(button[data-testid="good-response-turn-action-button"], button[data-testid="bad-response-turn-action-button"])',
        'article :is(button[data-testid="good-response-turn-action-button"], button[data-testid="bad-response-turn-action-button"])',
        ':is(button[aria-label="Good response" i], button[aria-label="Bad response" i], button[aria-label="Buena respuesta" i], button[aria-label="Mala respuesta" i])'] },
      { id: 'header', label: 'Encabezado', component: 'header', selectors: HEADER },
      { id: 'sidebar', label: 'Barra lateral', component: 'sidebar', selectors: SIDEBAR },
      { id: 'brand', label: 'Marca', component: 'header', selectors: [
        ':is(#page-header, #app-shell-sidebar, header) :is([data-testid="brand-name"], [data-testid="brand-title"], [data-testid="logo-text"])'] },
      { id: 'manage', label: 'Administrar', component: 'sidebar', selectors: [
        ':is(#app-shell-sidebar, #page-header, header) :is(a[href*="/manage" i], button[aria-label="Manage" i], [data-testid="manage-plan-button"])'] },
    ],

    // Qué oculta cada modo. Las excepciones del usuario prevalecen sobre el modo.
    modes: {
      minimal: ['upgrade', 'share', 'notices', 'feedback', 'header', 'brand', 'manage'],
      equilibrado: ['upgrade', 'share', 'notices'],
      completo: [],
    },

    theme: {
      requires(doc) {
        const h = doc.documentElement;
        return (h.classList.contains('dark') || h.getAttribute('data-theme') === 'dark') ? null
          : 'Requiere el modo oscuro de ChatGPT: en el claro el sitio fija colores de texto';
      },
      bridge: `
${DARK} {
  color-scheme: dark !important;
  --text-primary: var(--uui-text) !important; --text-secondary: var(--uui-muted) !important; --text-tertiary: var(--uui-muted) !important;
  --icon-primary: var(--uui-text) !important; --icon-secondary: var(--uui-muted) !important;
  --bg-primary: var(--uui-bg) !important; --bg-secondary: var(--uui-card) !important; --bg-tertiary: var(--uui-card) !important;
  --main-surface-primary: var(--uui-bg) !important; --main-surface-secondary: var(--uui-card) !important;
  --sidebar-surface-primary: var(--uui-side) !important; --sidebar-surface-secondary: var(--uui-side) !important;
  --color-surface: var(--uui-bg) !important; --color-surface-secondary: var(--uui-card) !important;
  --color-background-panel: var(--uui-side) !important; --color-background-composer-surface: var(--uui-card) !important;
  --color-text: var(--uui-text) !important; --color-text-primary: var(--uui-text) !important; --color-text-prose: var(--uui-text) !important;
  --color-text-secondary: var(--uui-muted) !important; --color-text-tertiary: var(--uui-muted) !important;
  --color-border-button-outline: var(--uui-border) !important;
}
${DARK} :is([data-app-shell-main-content-layout], main) { background-color: var(--uui-bg) !important; }
${DARK} :is(${SIDEBAR.join(', ')}) { background-color: var(--uui-side) !important; border-right: 1px solid var(--uui-border) !important; }
${DARK} [data-user-message-bubble="true"] { background-color: var(--uui-card) !important; color: var(--uui-text) !important; border: 1px solid var(--uui-border) !important; }
${DARK} [data-message-author-role="assistant"] { color: var(--uui-text) !important; }
${DARK} :is([data-testid="composer"], [data-testid="composer-root"]) { background-color: var(--uui-card) !important; border: 1px solid var(--uui-border) !important; }
${DARK} :is(.markdown, .prose) a { color: var(--uui-accent) !important; }
${DARK} #prompt-textarea { caret-color: var(--uui-text) !important; }`,
      verify: [
        { selector: ['[data-app-shell-main-content-layout]', 'main'], property: 'background-color', token: 'bg' },
        { selector: SIDEBAR, property: 'background-color', token: 'side' },
      ],
      contrast: { text: ['[data-message-author-role="assistant"] .markdown p', '[data-message-author-role="assistant"]'] },
    },

    actions: [
      { id: 'new-chat', label: 'Nuevo chat', selectors: ['[data-testid="create-new-chat-button"]', 'nav a[href="/"]'] },
      { id: 'toggle-sidebar', label: 'Alternar barra lateral', selectors: ['[data-testid="close-sidebar-button"]', '[data-testid="open-sidebar-button"]', 'button[aria-controls="stage-slideover-sidebar"]'] },
      { id: 'search', label: 'Buscar chats', selectors: ['[data-testid="search-conversations"]', 'button[aria-label="Search chats" i]', 'button[aria-label="Buscar chats" i]'] },
    ],
  });
})(globalThis.UUI);
