// ==UserScript==
// @name         ChatGPT Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.2.0
// @description  Temas y modos desde un botón compacto dentro de ChatGPT.
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
  const MODE_KEY = 'cm-live-mode';
  const MODES = [['minimal', 'Minimal'], ['equilibrado', 'Equilibrado'], ['completo', 'Completo']];

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

  function currentMode() {
    const saved = setting(MODE_KEY, 'equilibrado');
    return MODES.some(([id]) => id === saved) ? saved : 'equilibrado';
  }
  function isWide() { return setting(WIDTH_KEY, true) !== false; }
  function isPaused() { return setting(PAUSE_KEY, false) === true; }

  function updateAttributes() {
    if (!document.documentElement) return;
    document.documentElement.setAttribute('data-cm-theme', currentTheme());
    document.documentElement.setAttribute('data-cm-wide', isWide() ? 'yes' : 'no');
    document.documentElement.setAttribute('data-cm-mode', currentMode());
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
    updatePanelControls();
    setTimeout(checkSafety, 50);
    notify('Tema: ' + (THEMES.find(([v]) => v === id)?.[1] || id));
  }

  function setupMenu() {
    for (const [id, label] of MODES) {
      GM_registerMenuCommand('Modo · ' + label, () => selectMode(id));
    }
    for (const [id, label] of THEMES) {
      GM_registerMenuCommand('Tema · ' + label, () => selectTheme(id));
    }
    GM_registerMenuCommand('Alternar ancho completo', () => {
      GM_setValue(WIDTH_KEY, !isWide());
      updateAttributes();
      updatePanelControls();
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


  // A single, isolated control. Shadow DOM prevents ChatGPT's evolving CSS
  // from turning its text invisible or changing its button layout.
  let configRoot = null;
  function updatePanelControls() {
    if (!configRoot) return;
    for (const button of configRoot.querySelectorAll('[data-cm-choice-theme]')) {
      const active = button.dataset.cmChoiceTheme === currentTheme();
      button.setAttribute('aria-pressed', String(active));
    }
    for (const button of configRoot.querySelectorAll('[data-cm-choice-mode]')) {
      const active = button.dataset.cmChoiceMode === currentMode();
      button.setAttribute('aria-pressed', String(active));
    }
    const toggle = configRoot.getElementById('cm-mode-wide');
    if (toggle) {
      toggle.setAttribute('aria-checked', String(isWide()));
      const state = toggle.querySelector('[data-cm-width-state]');
      if (state) state.textContent = isWide() ? 'Sí' : 'No';
    }
    const status = configRoot.getElementById('cm-menu-status');
    if (status) {
      status.textContent = 'Tema: ' + (THEMES.find(([id]) => id === currentTheme())?.[1] || 'Aire') +
        ' · Modo: ' + (MODES.find(([id]) => id === currentMode())?.[1] || 'Equilibrado');
    }
  }

  function selectMode(id) {
    if (!MODES.some(([value]) => value === id)) return;
    GM_setValue(MODE_KEY, id);
    updateAttributes();
    updatePanelControls();
    notify('Modo: ' + MODES.find(([value]) => value === id)[1]);
  }

  function setPanelOpen(open) {
    if (!configRoot) return;
    const panel = configRoot.getElementById('cm-mode-panel');
    const trigger = configRoot.getElementById('cm-mode-button');
    if (!panel || !trigger) return;
    panel.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
    if (open) {
      updatePanelControls();
      const first = panel.querySelector('button');
      if (first) first.focus();
    } else {
      trigger.focus();
    }
  }

  function buildUI() {
    if (!document.body) return;
    if (document.getElementById('cm-live-controls')) return;
    const host = document.createElement('div');
    host.id = 'cm-live-controls';
    const root = host.attachShadow({ mode: 'open' });
    // Every piece of user-visible UI is bundled locally, not fetched as HTML.
    root.innerHTML = `
      <style>
        :host { all: initial; position: fixed !important; top: 70px !important; right: 14px !important;
          z-index: 2147483600 !important; font-family: system-ui, -apple-system, sans-serif !important;
          color: #e3e6f3 !important; color-scheme: dark; }
        *, *::before, *::after { box-sizing: border-box; }
        button { cursor: pointer; font-family: inherit; }
        button:focus-visible { outline: 2px solid #94e2d5; outline-offset: 3px; }
        #cm-mode-button { width: 38px; height: 38px; border-radius: 12px;
          display: grid; place-items: center; border: 1px solid #657081;
          background: #25283b; color: #ecf1f6; box-shadow: 0 2px 10px #0007;
          font-size: 23px; line-height: 1; }
        #cm-mode-button:hover, #cm-mode-button[aria-expanded="true"] {
          border-color: #94e2d5; background: #31354c; }
        [hidden] { display: none !important; }
        #cm-mode-panel { position: absolute; right: 0; top: 46px;
          width: min(310px, calc(100vw - 28px)); padding: 16px; border-radius: 15px;
          border: 1px solid #585c79; background: #1c2030; color: #e3e6f3;
          box-shadow: 0 16px 40px #0009; font: 14px/1.35 system-ui, sans-serif; }
        .heading { display: flex; justify-content: space-between; align-items: center;
          font-weight: 700; font-size: 16px; margin-bottom: 14px; }
        .section-label { font-weight: 650; margin: 11px 0 7px; color: #bac2de; }
        .choices { display: flex; gap: 6px; flex-wrap: wrap; }
        .choices button { border: 1px solid #495068; border-radius: 9px;
          background: #2a3043; color: #e3e6f3; font-size: 13px; min-height: 34px;
          padding: 6px 10px; }
        .choices button:hover { background: #374057; }
        .choices button[aria-pressed="true"] { border-color: #94e2d5;
          background: #334842; color: #e6fffa; }
        #cm-mode-wide { display: flex; justify-content: space-between; width: 100%;
          align-items: center; margin-top: 13px; padding: 10px 12px;
          background: #2a3043; color: #e3e6f3; border: 1px solid #495068;
          border-radius: 9px; font-size: 13px; }
        #cm-mode-wide[aria-checked="true"] { border-color: #94e2d5; }
        #cm-menu-status { margin: 12px 0 0; font-size: 11px; color: #b5bdd3; }
        .theme-swatch { display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          margin-right: 4px; vertical-align: 1px; }
        @media(max-width: 480px) {
          :host { top: 60px !important; right: 8px !important; }
          #cm-mode-panel { width: min(300px, calc(100vw - 16px)); }
        }
      </style>
      <button id="cm-mode-button" type="button" aria-label="Personalizar ChatGPT"
        title="Cambiar tema y modo" aria-expanded="false" aria-controls="cm-mode-panel">◐</button>
      <section id="cm-mode-panel" role="dialog" aria-label="Personalizar ChatGPT" hidden>
        <div class="heading"><span>Personalizar</span><span aria-hidden="true">◐</span></div>
        <div class="section-label">Tema</div>
        <div class="choices" role="group" aria-label="Elegir tema">
          <button type="button" data-cm-choice-theme="aire"><i class="theme-swatch" style="background:#94e2d5"></i>Aire</button>
          <button type="button" data-cm-choice-theme="cafe"><i class="theme-swatch" style="background:#f5cba7"></i>Café</button>
          <button type="button" data-cm-choice-theme="ambar"><i class="theme-swatch" style="background:#f9e2af"></i>Ámbar</button>
          <button type="button" data-cm-choice-theme="papel"><i class="theme-swatch" style="background:#bac2de"></i>Papel</button>
          <button type="button" data-cm-choice-theme="grafito"><i class="theme-swatch" style="background:#cba6f7"></i>Grafito</button>
        </div>
        <div class="section-label">Interfaz</div>
        <div class="choices" role="group" aria-label="Elegir modo">
          <button type="button" data-cm-choice-mode="minimal">Minimal</button>
          <button type="button" data-cm-choice-mode="equilibrado">Equilibrado</button>
          <button type="button" data-cm-choice-mode="completo">Completo</button>
        </div>
        <button type="button" id="cm-mode-wide" role="switch" aria-checked="true">
          Ancho completo <strong data-cm-width-state>Sí</strong>
        </button>
        <p id="cm-menu-status" role="status"></p>
      </section>`;
    configRoot = root;
    root.getElementById('cm-mode-button').addEventListener('click', () => {
      const panel = root.getElementById('cm-mode-panel');
      setPanelOpen(panel.hidden);
    });
    root.getElementById('cm-mode-panel').addEventListener('click', (event) => {
      const themeChoice = event.target.closest('[data-cm-choice-theme]');
      if (themeChoice) { selectTheme(themeChoice.dataset.cmChoiceTheme); return; }
      const modeChoice = event.target.closest('[data-cm-choice-mode]');
      if (modeChoice) { selectMode(modeChoice.dataset.cmChoiceMode); return; }
      if (event.target.closest('#cm-mode-wide')) {
        GM_setValue(WIDTH_KEY, !isWide());
        updateAttributes();
        updatePanelControls();
      }
    });
    document.body.appendChild(host);
    updatePanelControls();
    document.addEventListener('pointerdown', (event) => {
      if (!configRoot || event.composedPath().includes(host)) return;
      const panel = configRoot.getElementById('cm-mode-panel');
      if (panel && !panel.hidden) setPanelOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && configRoot &&
        !configRoot.getElementById('cm-mode-panel').hidden) {
        setPanelOpen(false);
      }
      if (event.altKey && event.shiftKey && !event.ctrlKey &&
        event.code === 'KeyM' && !event.repeat) {
        event.preventDefault();
        setPanelOpen(configRoot.getElementById('cm-mode-panel').hidden);
      }
    });
  }

  function init() {
    if (initialized) return;
    if (!document.documentElement) { setTimeout(init, 40); return; }
    initialized = true;
    updateAttributes();
    setupMenu();
    if (document.body) buildUI();
    else document.addEventListener('DOMContentLoaded', buildUI, { once: true });
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
