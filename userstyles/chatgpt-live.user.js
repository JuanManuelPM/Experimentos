// ==UserScript==
// @name         ChatGPT Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.0.0
// @description  Carga CSS de GitHub y aplica cambios sin recargar ChatGPT.
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

  // Only the CSS is downloaded. The remote file is never executed as JavaScript.
  const URL = 'https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/chatgpt-live.css';
  const SIGNATURE = 'CHATGPT_LIVE_STYLE_V1';
  const POLL_MS = 25000;
  const THEMES = [
    ['aire', 'Aire'],
    ['cafe', 'Café'],
    ['ambar', 'Ámbar'],
    ['papel', 'Papel'],
    ['grafito', 'Grafito']
  ];
  const THEME_KEY = 'cm-live-theme';
  const WIDTH_KEY = 'cm-live-wide';
  const CSS_KEY = 'cm-live-last-good-css';
  let cssElement = null;
  let lastCss = '';
  let requestInProgress = false;
  let initialized = false;
  let toastTimer = null;

  function theme() {
    const saved = GM_getValue(THEME_KEY, 'aire');
    return THEMES.some(([value]) => value === saved) ? saved : 'aire';
  }

  function width() {
    return GM_getValue(WIDTH_KEY, true) !== false;
  }

  function setAttributes() {
    const root = document.documentElement;
    if (!root) return;
    root.setAttribute('data-cm-theme', theme());
    root.setAttribute('data-cm-wide', width() ? 'yes' : 'no');
  }

  function toast(message) {
    if (!document.body) return;
    let el = document.getElementById('cm-live-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'cm-live-toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 1700);
  }

  function validCss(css) {
    return typeof css === 'string' &&
      css.length >= 200 && css.length <= 80000 &&
      css.includes(SIGNATURE) &&
      css.includes('data-cm-theme');
  }

  function applyCss(css, notify) {
    if (!validCss(css) || css === lastCss) return false;
    if (!cssElement || !cssElement.isConnected) {
      cssElement = GM_addStyle('');
    }
    cssElement.textContent = css;
    const isUpdate = lastCss.length > 0;
    lastCss = css;
    if (notify && isUpdate) toast('Estilo actualizado ✓');
    return true;
  }

  function fetchCss() {
    if (requestInProgress || document.hidden) return;
    requestInProgress = true;
    GM_xmlhttpRequest({
      method: 'GET',
      url: URL + '?t=' + Date.now(),
      responseType: 'text',
      timeout: 12000,
      headers: { 'Cache-Control': 'no-cache' },
      onload(response) {
        requestInProgress = false;
        if (response.status !== 200 || !validCss(response.responseText)) return;
        if (applyCss(response.responseText, true)) {
          GM_setValue(CSS_KEY, response.responseText);
        }
      },
      onerror() { requestInProgress = false; },
      ontimeout() { requestInProgress = false; }
    });
  }

  function setTheme(value) {
    GM_setValue(THEME_KEY, value);
    setAttributes();
    const label = THEMES.find(([key]) => key === value)?.[1] || value;
    toast('Tema: ' + label);
  }

  function nextTheme() {
    const i = THEMES.findIndex(([value]) => value === theme());
    setTheme(THEMES[(i + 1) % THEMES.length][0]);
  }

  function setupMenus() {
    for (const [value, label] of THEMES) {
      GM_registerMenuCommand('Tema · ' + label, () => setTheme(value));
    }
    GM_registerMenuCommand('Alternar ancho completo', () => {
      GM_setValue(WIDTH_KEY, !width());
      setAttributes();
      toast(width() ? 'Ancho completo' : 'Ancho de lectura');
    });
    GM_registerMenuCommand('Buscar cambios ahora', fetchCss);
  }

  function init() {
    if (initialized) return;
    if (!document.documentElement) {
      setTimeout(init, 40);
      return;
    }
    initialized = true;
    setAttributes();
    applyCss(GM_getValue(CSS_KEY, ''), false);
    setupMenus();
    fetchCss();
    setInterval(fetchCss, POLL_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) fetchCss();
    });
    window.addEventListener('focus', fetchCss);
    window.addEventListener('keydown', (event) => {
      // Accessible shortcut: Alt + Shift + T cycles the themes.
      if (event.altKey && event.shiftKey && !event.ctrlKey &&
          event.code === 'KeyT' && !event.repeat) {
        event.preventDefault();
        nextTheme();
      }
    }, true);
  }

  init();
})();
