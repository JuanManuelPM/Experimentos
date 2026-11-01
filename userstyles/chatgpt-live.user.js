// ==UserScript==
// @name         ChatGPT Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.1.0
// @description  Estilo remoto con modo seguro y restauración de contraste.
// @author       JuanManuelPM
// @match        https://chatgpt.com/*
// @noframes
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/chatgpt-live.user.js
// @downloadURL  https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/chatgpt-live.user.js
// ==/UserScript==

(function () {
  'use strict';
  const CSS_URL = 'https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/chatgpt-live.css';
  const POLL_MS = 25000;
  const THEMES = [
    ['aire', 'Aire'],
    ['cafe', 'Café'],
    ['ambar', 'Ámbar'],
    ['papel', 'Papel'],
    ['grafito', 'Grafito'],
  ];
  const THEME_KEY = 'cm-live-theme';
  const WIDTH_KEY = 'cm-live-wide';
  const PAUSE_KEY = 'cm-live-paused';

  let styleElement = null;
  let activeCss = '';
  let rejectedCss = '';
  let requestInProgress = false;
  let initialized = false;
  let timer = null;

  function setting(name, fallback) {
    return GM_getValue(name, fallback);
  }

  function currentTheme() {
    const chosen = setting(THEME_KEY, 'aire');
    return THEMES.some(([id]) => id === chosen) ? chosen : 'aire';
  }

  function isWide() { return setting(WIDTH_KEY, true) !== false; }
  function isPaused() { return setting(PAUSE_KEY, false) === true; }

  function updateAttributes() {
    if (!document.documentElement) return;
    document.documentElement.setAttribute('data-cm-theme', currentTheme());
    document.documentElement.setAttribute('data-cm-wide', isWide() ? 'yes' : 'no');
  }

  function notify(message) {
    if (!document.body) return;
    let toast = document.getElementById('cm-live-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cm-live-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    clearTimeout(timer);
    timer = setTimeout(() => { if (toast.isConnected) toast.remove(); }, 2000);
  }

  /* Never load an unverified cached CSS from a previous session.
     If GitHub is unreachable, leave ChatGPT's native colors untouched. */
  function validCss(css) {
    return typeof css === 'string' &&
      css.length > 1000 && css.length < 80000 &&
      css.includes('CHATGPT_LIVE_STYLE_V1') &&
      css.includes('SAFE_TEXT_CONTRAST_V2') &&
      css.includes('--text-primary: var(--cm-text) !important;') &&
      css.includes('[data-message-author-role="assistant"]');
  }

  function clearCss() {
    if (styleElement) styleElement.textContent = '';
    activeCss = '';
  }

  function colorRgb(value) {
    const match = /^rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)/i.exec(value || '');
    if (!match) return null;
    return match.slice(1, 4).map(v => Number(v) / 255);
  }

  function luminance(rgb) {
    const linear = rgb.map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  function validateVisibleContrast() {
    const sample = document.querySelector('[data-message-author-role="assistant"] .markdown p') ||
                   document.querySelector('[data-message-author-role="assistant"] .markdown');
    if (!sample || typeof getComputedStyle !== 'function') return true;
    const fg = colorRgb(getComputedStyle(sample).color);
    if (!fg) return true; // No measurable text yet; static checks still apply.

    let node = sample;
    let bg = null;
    while (node && node.nodeType === 1) {
      const style = getComputedStyle(node);
      const color = style.backgroundColor;
      if (color && !color.endsWith(', 0)') && color !== 'transparent') {
        bg = colorRgb(color);
        if (bg) break;
      }
      node = node.parentElement;
    }
    if (!bg) return true;
    const a = luminance(fg);
    const b = luminance(bg);
    const contrast = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    return contrast >= 4.5;
  }

  function checkSafety() {
    if (!activeCss || isPaused()) return;
    if (!validateVisibleContrast()) {
      rejectedCss = activeCss;
      clearCss();
      notify('Estilo pausado: contraste insuficiente');
    }
  }

  function applyCss(css) {
    if (!validCss(css) || isPaused() || css === rejectedCss || css === activeCss) return false;
    if (!styleElement || !styleElement.isConnected) styleElement = GM_addStyle('');
    const changed = activeCss.length > 0;
    styleElement.textContent = css;
    activeCss = css;
    setTimeout(checkSafety, 600);
    if (changed) notify('Estilo actualizado ✓');
    return true;
  }

  function fetchCss() {
    if (requestInProgress || isPaused() || document.hidden) return;
    requestInProgress = true;
    GM_xmlhttpRequest({
      method: 'GET',
      url: CSS_URL + '?v=' + Date.now(),
      responseType: 'text',
      timeout: 12000,
      headers: { 'Cache-Control': 'no-cache' },
      onload(response) {
        requestInProgress = false;
        if (response.status !== 200 || !validCss(response.responseText)) {
          if (!activeCss) clearCss();
          return;
        }
        applyCss(response.responseText);
      },
      onerror() { requestInProgress = false; if (!activeCss) clearCss(); },
      ontimeout() { requestInProgress = false; if (!activeCss) clearCss(); },
    });
  }

  function selectTheme(id) {
    GM_setValue(THEME_KEY, id);
    updateAttributes();
    setTimeout(checkSafety, 50);
    notify('Tema: ' + (THEMES.find(([v]) => v === id)?.[1] || id));
  }

  function setupMenu() {
    for (const [id, label] of THEMES) {
      GM_registerMenuCommand('Tema · ' + label, () => selectTheme(id));
    }
    GM_registerMenuCommand('Alternar ancho completo', () => {
      GM_setValue(WIDTH_KEY, !isWide());
      updateAttributes();
      notify(isWide() ? 'Ancho completo' : 'Ancho de lectura');
    });
    GM_registerMenuCommand('Pausar / reanudar diseño', () => {
      const next = !isPaused();
      GM_setValue(PAUSE_KEY, next);
      if (next) clearCss();
      else fetchCss();
      notify(next ? 'Diseño pausado: ChatGPT original' : 'Diseño reanudado');
    });
    GM_registerMenuCommand('Buscar actualización ahora', fetchCss);
  }

  function nextTheme() {
    const i = THEMES.findIndex(([id]) => id === currentTheme());
    selectTheme(THEMES[(i + 1) % THEMES.length][0]);
  }

  function init() {
    if (initialized) return;
    if (!document.documentElement) { setTimeout(init, 40); return; }
    initialized = true;
    updateAttributes();
    setupMenu();
    // No more cached CSS: the browser remains readable if an update fails.
    fetchCss();
    setInterval(fetchCss, POLL_MS);
    window.addEventListener('focus', fetchCss);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) fetchCss();
    });
    window.addEventListener('keydown', (event) => {
      if (event.altKey && event.shiftKey && !event.ctrlKey &&
          event.code === 'KeyT' && !event.repeat) {
        event.preventDefault();
        nextTheme();
      }
    }, true);
  }
  init();
})();
