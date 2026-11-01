// ==UserScript==
// @name         WhatsApp Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.0.0
// @description  WhatsApp real: carbón, minimal y radical desde un solo botón ◐, reversible.
// @author       JuanManuelPM
// @match        https://web.whatsapp.com/*
// @noframes
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/whatsapp-live.user.js
// @downloadURL  https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/whatsapp-live.user.js
// ==/UserScript==

(() => {
  'use strict';
  if (window.top !== window.self) return;
  const CSS_URL = 'https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/whatsapp-live.css';
  const MODE_KEY = 'wml-mode-v1';
  const THEME_KEY = 'wml-theme-v1';
  const CLEAN_KEY = 'wml-clean-v1';
  const AVATAR_KEY = 'wml-avatars-v1';
  const NARROW_KEY = 'wml-narrow-v1';
  const MODES = ['original', 'minimal', 'radical'];
  const THEMES = ['carbon', 'cafe', 'grafito'];
  const LABELS = {original:'Original', minimal:'Minimal', radical:'Radical', carbon:'Carbón', cafe:'Café', grafito:'Grafito'};
  // Network outage does not leave the initial demo entirely unchanged.
  const FALLBACK_CSS = `
    html[data-wml-mode]:not([data-wml-mode="original"]) {
      --wml-bg:#090c0e; --wml-side:#111619; --wml-text:#f0ede8; --wml-muted:#aaaeb0; --wml-in:#1d262a; --wml-out:#2b3d39;
      --panel-background:var(--wml-side)!important; --conversation-panel-background:var(--wml-bg)!important;
      --incoming-background:var(--wml-in)!important; --outgoing-background:var(--wml-out)!important;
      --WDS-background-default:var(--wml-bg)!important; --WDS-surface-default:var(--wml-side)!important;
      --primary:var(--wml-text)!important; --secondary:var(--wml-muted)!important;
    }
    html[data-wml-mode]:not([data-wml-mode="original"]) :is(#side,#pane-side){background:var(--wml-side)!important;color:var(--wml-text)!important}
    html[data-wml-mode]:not([data-wml-mode="original"]) #main{background:var(--wml-bg)!important;color:var(--wml-text)!important}
    html[data-wml-theme="cafe"][data-wml-mode]:not([data-wml-mode="original"]){--wml-bg:#14110f;--wml-side:#201c19;--wml-in:#2c251f;--wml-out:#423329;--wml-text:#f0e7d8;--wml-muted:#b9aa9a}
    html[data-wml-theme="grafito"][data-wml-mode]:not([data-wml-mode="original"]){--wml-bg:#101114;--wml-side:#191b20;--wml-in:#2a2e34;--wml-out:#383e4a;--wml-text:#f1f1f0;--wml-muted:#b7b9c0}
    html[data-wml-mode="radical"] #main [data-asset-chat-background-dark],html[data-wml-mode="radical"] #main [data-asset-chat-background-light]{opacity:0!important;background-image:none!important}
  `;
  let styleNode;
  let remoteCss = null;
  let checking = false;
  let uiRoot = null;
  let uiShadow = null;
  let isOpen = false;
  let lastCheckAt = 0;
  let refreshTimer = null;

  const setting = (key, def) => GM_getValue(key, def);
  const mode = () => MODES.includes(setting(MODE_KEY, 'radical')) ? setting(MODE_KEY, 'radical') : 'radical';
  const theme = () => THEMES.includes(setting(THEME_KEY, 'carbon')) ? setting(THEME_KEY, 'carbon') : 'carbon';
  const clean = () => setting(CLEAN_KEY, true) !== false;
  const avatars = () => setting(AVATAR_KEY, true) !== false;
  const narrow = () => setting(NARROW_KEY, false) === true;

  function attrs() {
    const root = document.documentElement;
    if (!root) return;
    root.dataset.wmlMode = mode();
    root.dataset.wmlTheme = theme();
    root.dataset.wmlClean = clean() ? 'yes' : 'no';
    root.dataset.wmlAvatars = avatars() ? 'yes' : 'no';
    root.dataset.wmlNarrow = narrow() ? 'yes' : 'no';
  }
  function applyCss(css) {
    const head = document.head || document.documentElement;
    if (!head) return;
    if (!styleNode || !styleNode.isConnected) {
      styleNode = document.createElement('style');
      styleNode.id = 'wml-live-css';
      styleNode.setAttribute('data-owner','whatsapp-minimal-live');
      head.appendChild(styleNode);
    }
    const next = css || remoteCss || FALLBACK_CSS;
    if (styleNode.textContent !== next) styleNode.textContent = next;
  }
  function validCss(s) {
    return typeof s === 'string' && s.length > 3500 && s.length < 40000 &&
      s.includes('WHATSAPP_MINIMAL_LIVE_V1') &&
      s.includes('--WDS-background-default') &&
      s.includes('data-wml-mode="radical"') &&
      s.includes('data-wml-mode="original"');
  }
  function fetchCss(force) {
    if (checking) return;
    if (!force && Date.now()-lastCheckAt < 30000) return;
    checking = true; lastCheckAt = Date.now();
    GM_xmlhttpRequest({
      method:'GET', url:CSS_URL+'?t='+lastCheckAt,
      timeout:10000,
      onload(r) {
        checking=false;
        if (r.status === 200 && validCss(r.responseText)) {
          remoteCss = r.responseText;
          applyCss(remoteCss);
          updateUI();
        }
      },
      onerror() {checking=false;updateUI();},
      ontimeout() {checking=false;updateUI();}
    });
  }
  function updateState(key,val) {
    GM_setValue(key,val);
    attrs(); applyCss(); updateUI();
  }
  function restore() {
    updateState(MODE_KEY,'original');
  }
  function evaluate() {
    const exists = {
      sidebar:!!document.querySelector('#side'),
      list:!!document.querySelector('#pane-side'),
      conversation:!!document.querySelector('#main'),
      composer:!!document.querySelector('#main footer [contenteditable="true"]')
    };
    const all = Object.values(exists).filter(Boolean).length;
    const main = document.querySelector('#main');
    const rootStyle = getComputedStyle(document.documentElement);
    const token = rootStyle.getPropertyValue('--wml-bg').trim();
    const background = main ? getComputedStyle(main).backgroundColor : '';
    const injected = !!(styleNode && styleNode.isConnected);
    // Do not mistake a CSS injection for verified per-feature effects.
    return {all,exists,token,background,injected,remote:!!remoteCss};
  }

  function renderPanel() {
    if (!uiShadow) return;
    const panel = uiShadow.getElementById('panel');
    if (!panel) return;
    panel.hidden = !isOpen;
    uiShadow.getElementById('trigger').setAttribute('aria-expanded',String(isOpen));
    const m=mode(),t=theme();
    for (const button of uiShadow.querySelectorAll('[data-mode]')) {
      const selected=button.dataset.mode===m;
      button.setAttribute('aria-pressed',String(selected));button.dataset.selected=String(selected);
    }
    for (const button of uiShadow.querySelectorAll('[data-theme]')) {
      const selected=button.dataset.theme===t;
      button.setAttribute('aria-pressed',String(selected));button.dataset.selected=String(selected);
      button.disabled = m==='original';
    }
    for (const key of ['clean','avatars','narrow']) {
      const val=key==='clean'?clean():key==='avatars'?avatars():narrow();
      const btn=uiShadow.querySelector('[data-switch="'+key+'"]');
      btn.setAttribute('aria-checked',String(val));
      btn.textContent=val?'Sí':'No';
      btn.disabled=m!=='radical';
    }
    if(isOpen) updateDiagnostics();
  }
  function updateDiagnostics() {
    if (!uiShadow) return;
    const diag=uiShadow.getElementById('diagnostics');
    if(!diag) return;
    const e=evaluate();
    if(mode()==='original') diag.textContent='Página original · sin modificaciones visuales.';
    else if(!e.exists.conversation) diag.textContent='Esperando que cargue una conversación. CSS aplicado, estructura sin verificar.';
    else diag.textContent='Detectado: '+e.all+'/4 zonas · CSS '+(e.remote?'actualizado':'de respaldo')+' · fondo '+e.background+'.';
  }
  function updateUI() { if (uiShadow) renderPanel(); }
  function toggle(force) {
    isOpen=typeof force==='boolean'?force:!isOpen;
    renderPanel();
  }
  function createUI() {
    if (uiRoot || !document.body) return;
    uiRoot = document.createElement('div');
    uiRoot.id = 'wml-live-root';
    uiRoot.style.cssText='position:fixed!important;inset:0 auto auto 0!important;width:0!important;height:0!important;z-index:2147483600!important;pointer-events:none!important;';
    uiShadow=uiRoot.attachShadow({mode:'open'});
    uiShadow.innerHTML=`
      <style>
        :host{all:initial;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
        *,*::before,*::after{box-sizing:border-box}
        button{font:inherit;cursor:pointer}
        #trigger{position:fixed;left:4px;top:46%;width:30px;height:36px;padding:0;border:1px solid #6e777c66;border-radius:0 10px 10px 0;background:#1b2025ee;color:#f4e9d8;opacity:.42;pointer-events:auto;font-size:18px;z-index:2;transition:opacity .14s ease,transform .14s ease}
        #trigger:hover,#trigger:focus-visible,#trigger[aria-expanded="true"]{opacity:1;transform:translateX(2px);outline-color:#d9b879}
        #panel{position:fixed;left:41px;top:calc(46% - 178px);width:275px;max-height:calc(100vh - 36px);overflow:auto;pointer-events:auto;border:1px solid #4c5559;border-radius:12px;background:#15191dee;color:#f2ece3;box-shadow:0 14px 42px #0009;padding:16px;z-index:1;font-size:12px;line-height:1.4}
        #panel[hidden]{display:none!important}
        #top{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #3e464a}
        #top strong{font:700 14px/1.2 system-ui;letter-spacing:-.02em}
        #top span{font-size:10px;color:#a2a8ad}
        #close{font-size:18px;color:#c0c6c6;border:0;background:transparent;padding:0 5px}
        .label{font-size:10px;letter-spacing:.1em;color:#a7b0b3;text-transform:uppercase;margin:13px 0 7px}
        .segments,.swatches{display:flex;gap:5px}
        .segments button{flex:1;padding:9px 4px;border:1px solid #3b4449;border-radius:6px;background:#20282c;color:#c9cdcf;font-weight:600;font-size:11px}
        .segments button[data-selected="true"]{background:#e2d0ae;color:#151a1c;border-color:#e2d0ae}
        .swatches button{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:9px 3px;border:1px solid #3b4449;border-radius:7px;background:#1d2428;color:#c9cdcf;font-size:10px}
        .swatches button[data-selected="true"]{border-color:#e2d0ae;background:#292b2c;color:#fff}
        .swatches button:disabled{opacity:.4;cursor:default}
        .swatches i{width:28px;height:22px;border-radius:3px;border:1px solid #ffffff44;display:block}
        .row{display:flex;align-items:center;justify-content:space-between;gap:8px;border-bottom:1px solid #31393d;padding:9px 0;font-size:12px}
        .row button{padding:5px 8px;background:#252e32;border:1px solid #4b595e;color:#ece6db;border-radius:5px;min-width:43px}
        .row button:disabled{opacity:.3;cursor:default}
        #diagnostics{font-size:10px;line-height:1.5;color:#b3b8b9;margin:12px 0 5px;min-height:27px}
        #reset{width:100%;padding:9px;background:transparent;border:1px solid #596164;border-radius:5px;color:#e8ded1;font-weight:600;margin-top:10px}
        button:focus-visible{outline:2px solid #e5bc7e;outline-offset:2px}
        @media(max-width:420px){#panel{left:36px;top:22px;width:calc(100vw - 48px)}}
      </style>
      <button type="button" id="trigger" aria-label="Personalizar WhatsApp" aria-expanded="false" aria-controls="panel">◐</button>
      <section id="panel" role="dialog" aria-label="Personalizar WhatsApp" hidden>
        <div id="top"><div><strong>WhatsApp Minimal</strong><br><span>En esta página · Local</span></div><button id="close" aria-label="Cerrar">×</button></div>
        <div class="label">Intensidad</div>
        <div class="segments" aria-label="Modo visual">
          <button data-mode="original" aria-pressed="false">Original</button>
          <button data-mode="minimal" aria-pressed="false">Minimal</button>
          <button data-mode="radical" aria-pressed="false">Radical</button>
        </div>
        <div class="label">Paleta</div>
        <div class="swatches" aria-label="Temas">
          <button data-theme="carbon" aria-pressed="false"><i style="background:linear-gradient(140deg,#0b0d0f 52%,#293e3c 52%)"></i>Carbón</button>
          <button data-theme="cafe" aria-pressed="false"><i style="background:linear-gradient(140deg,#1b1614 52%,#4b3629 52%)"></i>Café</button>
          <button data-theme="grafito" aria-pressed="false"><i style="background:linear-gradient(140deg,#15171c 52%,#3e475b 52%)"></i>Grafito</button>
        </div>
        <div class="label">Radical · detalles</div>
        <div class="row"><span>Ocultar accesos secundarios</span><button data-switch="clean" role="switch" aria-checked="true">Sí</button></div>
        <div class="row"><span>Mostrar fotos de chats</span><button data-switch="avatars" role="switch" aria-checked="true">Sí</button></div>
        <div class="row"><span>Columna más estrecha</span><button data-switch="narrow" role="switch" aria-checked="false">No</button></div>
        <p id="diagnostics" aria-live="polite"></p>
        <button id="reset">↺ Restaurar WhatsApp original</button>
      </section>`;
    uiShadow.getElementById('trigger').addEventListener('click',()=>toggle());
    uiShadow.getElementById('close').addEventListener('click',()=>toggle(false));
    uiShadow.getElementById('reset').addEventListener('click',restore);
    for(const button of uiShadow.querySelectorAll('[data-mode]')) button.addEventListener('click',()=>updateState(MODE_KEY,button.dataset.mode));
    for(const button of uiShadow.querySelectorAll('[data-theme]')) button.addEventListener('click',()=>updateState(THEME_KEY,button.dataset.theme));
    for(const button of uiShadow.querySelectorAll('[data-switch]')) button.addEventListener('click',()=>{
      const key=button.dataset.switch;
      if(key==='clean') updateState(CLEAN_KEY,!clean());
      if(key==='avatars') updateState(AVATAR_KEY,!avatars());
      if(key==='narrow') updateState(NARROW_KEY,!narrow());
    });
    document.body.appendChild(uiRoot);
    renderPanel();
  }
  function init(){
    attrs();
    applyCss();
    if(document.body)createUI();
    else document.addEventListener('DOMContentLoaded',createUI,{once:true});
    fetchCss(true);
    setInterval(()=>fetchCss(false),60000);
    window.addEventListener('focus',()=>fetchCss(true));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)fetchCss(true)});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape' && isOpen)toggle(false);
      if(e.altKey&&e.shiftKey&&e.code==='KeyW'){e.preventDefault();toggle();}
    });
    // React can replace the app body; reinstall just our controls, never touch chats.
    refreshTimer=setInterval(()=>{
      if(!uiRoot || !uiRoot.isConnected) {uiRoot=null;uiShadow=null;createUI();}
      if(styleNode && !styleNode.isConnected)applyCss();
    },4000);
  }
  GM_registerMenuCommand('WhatsApp Minimal: abrir panel',()=>{if(!uiRoot)createUI();toggle(true);});
  GM_registerMenuCommand('WhatsApp Minimal: restaurar original',restore);
  if(document.documentElement)init();
  else document.addEventListener('readystatechange',()=>{if(document.documentElement)init();},{once:true});
})();
