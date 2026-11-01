// ==UserScript==
// @name         WhatsApp Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      3.0.0
// @description  Studio 3: contactos nativos clicables, ventana flotante y conversación real.
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
  const MODES = ['original', 'minimal', 'radical', 'canvas'];
  const THEMES = ['carbon', 'cafe', 'grafito'];
  const LABELS = {original:'Original', minimal:'Minimal', radical:'Radical', canvas:'Canvas', carbon:'Carbón', cafe:'Café', grafito:'Grafito'};
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
    /* Base cero de respaldo, incluso sin conexión a GitHub */
    html[data-wml-mode="radical"] #app:has(#pane-side)>div>div>div:nth-last-child(2)>div>header:not(:has(#side,#pane-side,#main)){display:none!important}
    html[data-wml-mode="radical"] #side>header,html[data-wml-mode="radical"] #side [data-wml-remove="header"],
    html[data-wml-mode="radical"] #side [data-wml-remove="search"],
    html[data-wml-mode="radical"] #side [data-wml-remove="archived"],
    html[data-wml-mode="radical"] #app [data-wml-remove="rail"]{display:none!important}
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
    attrs(); applyCss(); updateUI(); scheduleNakedList(); syncCanvas();
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
          <button data-mode="radical" aria-pressed="false">Radical</button><button data-mode="canvas" aria-pressed="false">Studio</button>
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

  /* Identificación estructural de las CINCO zonas pedidas.
     Solo lee roles/atributos/geometría, jamás nombres ni texto de chats.
     Nunca oculta #side, #pane-side, #main ni sus ancestros. */
  /* Base cero v1.2 · Usar etiquetas de interfaz muy concretas y límites
     geométricos. No inspecciona ni guarda nombres o mensajes de chats. */
  function markBareChatLayout() {
    if (mode() !== 'radical') return;
    const side = document.querySelector('#side');
    const pane = document.querySelector('#pane-side');
    const app = document.querySelector('#app');
    if (!side || !pane || !app) return;
    const s = side.getBoundingClientRect();
    const list = pane.getBoundingClientRect();
    if (s.width < 160) return;

    const protectedNode = node => !node || node === app || node === side ||
      node === pane || node.id === 'main' ||
      node.contains(side) || node.contains(pane) ||
      !!node.querySelector('#main footer [contenteditable="true"]');
    function mark(node, type) {
      if (!node || protectedNode(node)) return false;
      if (node.getAttribute('data-wml-remove') !== type)
        node.setAttribute('data-wml-remove', type);
      return true;
    }
    function textNode(label, predicate, scope = app) {
      // Exact UI labels only; skip actual message and chat text nodes.
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      let node, checked = 0;
      while ((node = walker.nextNode()) && checked++ < 7000) {
        const el = node.parentElement;
        if (!el || el.closest('#wml-live-root, script, style, #main [data-testid="msg-container"]')) continue;
        const r = el.getBoundingClientRect();
        if (!predicate(el, r)) continue;
        const value = (node.nodeValue || '').trim().replace(/\s+/g, ' ');
        if (value.toLowerCase() === label.toLowerCase()) return el;
      }
      return null;
    }
    function bestRow(start, options) {
      if (!start) return null;
      let best = null, el = start;
      for (let depth=0; el && depth<12; depth++, el=el.parentElement) {
        if (protectedNode(el)) break;
        const r=el.getBoundingClientRect();
        if (r.height > options.maxHeight || r.width > options.maxWidth) break;
        if (r.width >= options.minWidth && r.height >= options.minHeight &&
            (!options.topLimit || r.top < options.topLimit) &&
            (!options.bottomLimit || r.bottom <= options.bottomLimit)) best=el;
      }
      return best;
    }

    // 1) Encabezado WhatsApp, puntos y Nuevo chat: la misma fila completa.
    const leftUpper=(el,r)=>s.left-8<=r.left && r.right<=s.right+8 &&
      r.top>=s.top-8 && r.top<s.top+95 && !pane.contains(el);
    const title=textNode('WhatsApp',leftUpper,side) ||
      textNode('WhatsApp',leftUpper,app);
    const header=bestRow(title,{minWidth:s.width*.58,minHeight:25,
      maxHeight:105,maxWidth:s.width+18,
      topLimit:s.top+45,bottomLimit:Math.max(list.top+22,s.top+105)});
    if (header) mark(header,'header');
    // Fallback structural; only headers above the conversation list.
    for(const h of side.querySelectorAll('header, [data-testid="chatlist-header"], [data-testid="chat-list-header"]')) {
      const r=h.getBoundingClientRect();
      if(r.width>s.width*.62 && r.height>25 && r.height<105 &&
        r.top<s.top+54 && r.bottom<list.top+30) mark(h,'header');
    }

    // 2) Archivados: selecciona su fila exacta, nunca "primer chat".
    const archived=textNode('Archived',(el,r)=>r.left>=s.left-8 &&
      r.right<=s.right+8 && r.top>=s.top && r.top<s.top+205,side) ||
      textNode('Archivados',(el,r)=>r.left>=s.left-8 &&
      r.right<=s.right+8 && r.top>=s.top && r.top<s.top+205,side);
    const archivedRow=bestRow(archived,{minWidth:s.width*.57,
      minHeight:20,maxHeight:86,maxWidth:s.width+18,
      topLimit:s.top+205,bottomLimit:s.top+245});
    if(archivedRow) mark(archivedRow,'archived');
    for(const el of side.querySelectorAll(
      '[data-testid="archived-row"], [data-icon="archived"], [aria-label="Archived" i], [aria-label="Archivados" i]'
    )){
      const r=el.getBoundingClientRect();
      if(r.top<s.top+205){
        const row=bestRow(el,{minWidth:s.width*.57,minHeight:20,maxHeight:86,
          maxWidth:s.width+18,topLimit:s.top+205,bottomLimit:s.top+245});
        if(row) mark(row,'archived');
      }
    }

    // 3) Pantalla de bienvenida: solo cuando NO hay chat abierto.
    // Nunca tocar #main ni el compositor. Se eliminan las tarjetas/atajos,
    // pero se conserva la superficie vacía de la derecha.
    const activeComposer=!!document.querySelector('#main footer [contenteditable="true"], #main [data-testid="conversation-compose-box-input"]');
    if (!activeComposer) {
      const right=(el,r)=>r.left >= s.right+15 && r.width>0 &&
        !side.contains(el) && !pane.contains(el) &&
        !el.closest('#main [data-testid="msg-container"]');
      const card=textNode('Voice and video calling is now available',right,app);
      const cardBox=bestRow(card,{minWidth:180,minHeight:105,maxHeight:460,
        maxWidth:650});
      if(cardBox)mark(cardBox,'welcome');
      for(const label of ['Send document','Add contact','Invite a friend','New call','Ask Meta AI']){
        const item=textNode(label,right,app);
        const tile=bestRow(item,{minWidth:38,minHeight:30,maxHeight:145,
          maxWidth:170});
        if(tile)mark(tile,'welcome-action');
      }
      // Nearby standard default welcome copy in versions without call promo.
      const intro=textNode('Download WhatsApp for Windows',right,app);
      const introBox=bestRow(intro,{minWidth:180,minHeight:95,
        maxHeight:500,maxWidth:650});
      if(introBox)mark(introBox,'welcome');
    }
  }


  /* NAKED_LIST_V21: reduce native WhatsApp DOM to its real conversation links.
     No copied contacts, messages, network calls, or fake rows.
     Only structural labels/rectangles, preserving WhatsApp's click handlers. */
  let layoutObserver = null, layoutScheduled = 0;
  function compactNakedList() {
    if (mode() !== 'radical') return;
    const app=document.querySelector('#app');
    const side=document.querySelector('#side');
    const pane=document.querySelector('#pane-side');
    if(!app || !side || !pane) return;
    const pw=pane.getBoundingClientRect();
    if(pw.width<130 || window.innerWidth<650) return;

    // Choose the outermost narrow flex column that contains the chat pane,
    // but never the right conversation or full application.
    let column=side, candidate=side;
    for(let p=side.parentElement; p && p!==app; p=p.parentElement) {
      const r=p.getBoundingClientRect();
      if(p.contains(document.querySelector('#main')) && document.querySelector('#main')) break;
      if(r.width>180 && r.width<=Math.min(730,window.innerWidth*.62) &&
         r.height>Math.min(260,window.innerHeight*.45)) candidate=p;
      else if(r.width>window.innerWidth*.7) break;
    }
    column=candidate;
    if(column && column!==app && !column.hasAttribute('data-wml-column'))
      column.setAttribute('data-wml-column','');

    // Hide the column's extra chrome, including a lingering native header
    // outside #side. Never hide anything containing #pane-side.
    const firstRow=pane.querySelector('[role="row"],[role="listitem"]');
    const firstTop=firstRow ? firstRow.getBoundingClientRect().top : pw.top+70;
    let branch=pane;
    for(let parent=pane.parentElement; parent && parent!==app; parent=parent.parentElement) {
      for(const child of parent.children) {
        if(child===branch || child.contains(pane) || child.contains(document.querySelector('#main'))) continue;
        const r=child.getBoundingClientRect();
        if(r.width>40 && r.height>10 && r.right<=pw.right+18 &&
           r.bottom<=firstTop+10 && r.top<firstTop) {
          if(!child.hasAttribute('data-wml-extra-chrome'))
            child.setAttribute('data-wml-extra-chrome','');
        }
      }
      if(parent===column) break;
      branch=parent;
    }

    // Each native row remains clickable. Hide only sibling branches on the
    // path to the first title. Never read textContent/innerText/contact names.
    const rows=pane.querySelectorAll('[role="row"], [role="listitem"]');
    let count=0;
    for(const row of rows) {
      if(++count>250) break;
      if(row.closest('[data-wml-remove="archived"]')) continue;
      // Nested rows belong to the outer row.
      const ancestor=row.parentElement?.closest('[role="row"],[role="listitem"]');
      if(ancestor && pane.contains(ancestor)) continue;
      const box=row.getBoundingClientRect();
      if(box.width<80 || box.height<22) continue;
      const candidates=row.querySelectorAll(
        '[data-testid="cell-frame-title"], [data-testid="chatlist-title"], '+
        'span[title], span[dir="auto"]'
      );
      let name=null;
      for(const el of candidates) {
        const b=el.getBoundingClientRect();
        if(b.width>8 && b.height>7 && b.left<box.left+box.width*.75 &&
           b.top>=box.top-3 && b.top<box.top+Math.min(39,box.height*.66)) {
          name=el;break;
        }
      }
      if(!name) continue;
      if(row.getAttribute('data-wml-chat-row')!=='yes')row.setAttribute('data-wml-chat-row','yes');
      // Clear stale markers if WhatsApp's virtualizer recycled a row.
      for(const hidden of row.querySelectorAll('[data-wml-row-detail]'))
        hidden.removeAttribute('data-wml-row-detail');
      let target=name, depth=0;
      while(target && target!==row && depth++<15) {
        const parent=target.parentElement;
        if(!parent || !row.contains(parent)) break;
        for(const sibling of parent.children) {
          if(sibling!==target && !sibling.contains(name) &&
            !sibling.hasAttribute('data-wml-row-detail'))
            sibling.setAttribute('data-wml-row-detail','');
        }
        target=parent;
      }
      name.setAttribute('data-wml-chat-name','');
    }

    // When there is no selected conversation, hide the entire native
    // welcome/advertisement content without collapsing the right pane.
    // :not(:has(#main)) in CSS automatically restores it on selection.
    if(!app.querySelector('#main')) {
      let branch=column;
      for(let p=column?.parentElement; p && p!==app; p=p.parentElement) {
        for(const sibling of p.children) {
          if(sibling===branch || sibling.contains(pane))continue;
          const r=sibling.getBoundingClientRect();
          if(r.width>Math.max(220,window.innerWidth*.25) &&
             r.height>window.innerHeight*.45 &&
             r.left>=pw.right-6 &&
             !sibling.hasAttribute('data-wml-empty-right'))
            sibling.setAttribute('data-wml-empty-right','');
        }
        branch=p;
      }
    }
  }

  /* WML_WIDGET_SURFACES_V1
     Two *native* surfaces: contacts and current chat. This is not a copy of
     personal data. WhatsApp retains its DOM, scroll, handlers, and messages.
     Mark the full native left column, including hidden outer wrappers. */
  function markWidgetSurfaces() {
    if (mode() !== 'radical') return;
    const app=document.querySelector('#app');
    const side=document.querySelector('#side');
    const pane=document.querySelector('#pane-side');
    const main=document.querySelector('#main');
    if(!app || !side || !pane || window.innerWidth<650)return;
    // The original WhatsApp shell may remain 500px wide after the visible
    // list shrinks. Mark each distinct wrapper until the split containing
    // the right conversation, never touching the shared parent.
    let level=0;
    for(let el=side; el && el!==app && level++<12; el=el.parentElement){
      if(main && el.contains(main))break;
      const r=el.getBoundingClientRect();
      if(r.height<200 || r.width<120 || r.width>window.innerWidth*.78)continue;
      if(el.getAttribute('data-wml-left-shell')!=='yes')
        el.setAttribute('data-wml-left-shell','yes');
    }
    if(side.getAttribute('data-wml-widget')!=='contacts')
      side.setAttribute('data-wml-widget','contacts');
    if(main && main.getAttribute('data-wml-widget')!=='conversation')
      main.setAttribute('data-wml-widget','conversation');
  }

  function scheduleNakedList(){
    if(mode()!=='radical' || layoutScheduled)return;
    layoutScheduled=setTimeout(()=>{
      layoutScheduled=0;
      try { markBareChatLayout(); compactNakedList(); markWidgetSurfaces(); }
      catch(e) { /* never stop native WhatsApp on selector drift */ }
    },160);
  }




  /* WML_NATIVE_STUDIO_V3
   * Unlike V2, no cloned contacts, proxy clicks or simulated React events.
   * The visible, interactive list is WhatsApp's own #pane-side / #side.
   * The conversation remains WhatsApp's own #main and native composer.
   * All layout CSS is scoped to mode=canvas; Original is instantly reversible.
   */
  const n3={
    host:null,shadow:null,style:null,side:null,pane:null,main:null,
    scheduled:0,observer:null,listenerPane:null,lastRow:null,pending:0,
    layout:null,drag:null,verified:false,checkTimer:null,needOriginal:false
  };
  const N3_LAYOUT_KEY='wml-native-studio-v3-layout';
  const n3Clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function n3InitialLayout(){
    if(n3.layout)return;
    const stored=setting(N3_LAYOUT_KEY,{});
    const storedSafe=stored&&typeof stored==='object'?stored:{};
    const width=Math.max(650,Math.min(innerWidth-24,Number(storedSafe.w)||980));
    const height=Math.max(430,Math.min(innerHeight-24,Number(storedSafe.h)||innerHeight-58));
    n3.layout={
      x:n3Clamp(Number(storedSafe.x)||Math.round((innerWidth-width)/2),8,Math.max(8,innerWidth-285)),
      y:n3Clamp(Number(storedSafe.y)||28,8,Math.max(8,innerHeight-140)),
      w:width,h:height
    };
  }
  function n3Save(){
    if(n3.layout)GM_setValue(N3_LAYOUT_KEY,{...n3.layout});
  }
  function n3Vars(){
    if(!n3.layout)return;
    const d=n3.layout, sideW=innerWidth<740?236:286;
    const width=n3Clamp(d.w,sideW+260,Math.max(sideW+260,innerWidth-d.x-8));
    const height=n3Clamp(d.h,340,Math.max(340,innerHeight-d.y-8));
    const root=document.documentElement;
    for(const [key,val] of Object.entries({
      '--n3-x':d.x+'px','--n3-y':d.y+'px','--n3-w':width+'px',
      '--n3-h':height+'px','--n3-side':sideW+'px',
      '--n3-chat-x':(d.x+sideW)+'px','--n3-chat-w':Math.max(260,width-sideW)+'px'
    }))root.style.setProperty(key,val);
    if(n3.shadow){
      const shell=n3.shadow.getElementById('frame');
      if(shell){
        shell.style.left=d.x+'px';shell.style.top=d.y+'px';
        shell.style.width=(n3.main?width:sideW)+'px';shell.style.height=height+'px';
        shell.dataset.chat=String(!!n3.main);
      }
      const title=n3.shadow.getElementById('stageTitle');
      if(title)title.textContent='Mensajes';
    }
  }
  function n3Style(){
    let el=document.getElementById('wml-native-studio-css');
    if(!el){el=document.createElement('style');el.id='wml-native-studio-css';}
    el.textContent=String.raw`
      html[data-wml-mode="canvas"] body {background:#070d16!important; overflow:hidden!important;}
      html[data-wml-mode="canvas"] body::before {
        content:"";position:fixed;inset:0;z-index:2147481000;
        background:radial-gradient(ellipse at 10% 80%,#133642 0%,transparent 40%),
          radial-gradient(ellipse at 88% 12%,#282640 0%,transparent 42%),#090e19;
        pointer-events:none;
      }
      html[data-wml-mode="canvas"] #app {transform:none!important;overflow:visible!important;}
      html[data-wml-mode="canvas"] #app [data-wml-n3-unclip] {
        overflow:visible!important;transform:none!important;
        filter:none!important;contain:none!important;
      }
      html[data-wml-mode="canvas"] #side {
        position:fixed!important;left:var(--n3-x)!important;top:var(--n3-y)!important;
        width:var(--n3-side)!important;min-width:var(--n3-side)!important;
        max-width:var(--n3-side)!important;
        height:var(--n3-h)!important;max-height:var(--n3-h)!important;
        margin:0!important;padding:0!important;
        border:1px solid #ffffff24!important;border-right:0!important;
        border-radius:22px 0 0 22px!important;overflow:hidden!important;
        background:linear-gradient(155deg,#183f4a,#0d2331 70%)!important;
        z-index:2147482001!important;pointer-events:auto!important;
        box-shadow:0 24px 75px #0008!important;
      }
      html[data-wml-mode="canvas"] #side [data-wml-n3-chrome] {
        display:none!important;
      }
      html[data-wml-mode="canvas"] #pane-side {
        position:relative!important;left:0!important;top:0!important;
        display:block!important;
        width:100%!important;min-width:0!important;max-width:100%!important;
        height:calc(var(--n3-h) - 112px)!important;max-height:calc(var(--n3-h) - 112px)!important;
        margin:112px 0 0!important;padding:0 8px 16px!important;
        background:transparent!important;
        overflow-x:hidden!important;
        pointer-events:auto!important;opacity:1!important;
        scrollbar-width:thin;scrollbar-color:#66889170 transparent;
      }
      html[data-wml-mode="canvas"] #pane-side [data-wml-n3-detail] {
        display:none!important;
      }
      html[data-wml-mode="canvas"] #pane-side [data-wml-n3-row]{
        border:0!important;box-shadow:none!important;
        background:transparent!important;
        cursor:pointer!important;
      }
      html[data-wml-mode="canvas"] #pane-side [data-wml-n3-row]:hover {
        background:#e5fffa11!important;border-radius:12px!important;
      }
      html[data-wml-mode="canvas"] #pane-side [data-wml-n3-row][aria-selected="true"] {
        background:#71c6ba27!important;border-radius:12px!important;
      }
      html[data-wml-mode="canvas"] #pane-side [data-wml-n3-name] {
        font-family:system-ui,"Liberation Sans",Arial,sans-serif!important;
        font-size:14px!important;font-weight:550!important;
        line-height:1.4!important;letter-spacing:-.017em!important;
        color:#e9f5f7!important;
        white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;
      }
      html[data-wml-mode="canvas"] #main {
        position:fixed!important;
        left:var(--n3-chat-x)!important;top:var(--n3-y)!important;
        width:var(--n3-chat-w)!important;min-width:0!important;max-width:var(--n3-chat-w)!important;
        height:var(--n3-h)!important;max-height:var(--n3-h)!important;
        margin:0!important;padding:0!important;
        overflow:hidden!important;
        border:1px solid #ffffff22!important;border-left:0!important;
        border-radius:0 22px 22px 0!important;
        background:#142431!important;z-index:2147482002!important;
        pointer-events:auto!important;
        --conversation-panel-background:#142431!important;
        --conversation-header-background:#1e3543!important;
        --compose-panel-background:#1b3440!important;
        --incoming-background:#263d4c!important;
        --outgoing-background:#2f5160!important;
        --primary:#eef7fa!important;
        --secondary:#aac4c9!important;
        --WDS-text-primary:#eef7fa!important;
        box-shadow:0 24px 75px #0008!important;
      }
      html[data-wml-mode="canvas"] #main [contenteditable="true"]{
        color:#edf6fa!important;caret-color:#83e2c6!important;
      }
      html[data-wml-mode="canvas"] #main > header {
        background:#1e3543!important;border-bottom:1px solid #ffffff1a!important;
      }
      html[data-wml-mode="canvas"] #main > footer{
        background:#1b3440!important;border-top:1px solid #ffffff17!important;
      }
    `;
    if(!el.isConnected)(document.head||document.documentElement).appendChild(el);
    n3.style=el;
  }
  function n3MarkAncestors(node){
    for(let p=node?.parentElement,k=0;p&&p.id!=='app'&&k++<24;p=p.parentElement){
      if(!p.hasAttribute('data-wml-n3-unclip'))p.setAttribute('data-wml-n3-unclip','');
    }
  }
  function n3MarkNativeList(){
    const side=document.querySelector('#side'),pane=document.querySelector('#pane-side');
    if(!side||!pane||!side.contains(pane))return false;
    n3MarkAncestors(side);
    const main=document.querySelector('#main');
    if(main)n3MarkAncestors(main);
    // Preserve the complete native branch from #side to #pane-side,
    // hiding only navigation/search siblings. Never move DOM nodes.
    let child=pane;
    for(let parent=child.parentElement;parent&&side.contains(parent);parent=child.parentElement){
      for(const sibling of parent.children){
        if(sibling!==child&&!sibling.hasAttribute('data-wml-n3-chrome'))
          sibling.setAttribute('data-wml-n3-chrome','');
      }
      if(parent===side)break;
      child=parent;
    }
    const rows=pane.querySelectorAll(
      '[role="row"],[role="listitem"],[data-testid="cell-frame-container"],[data-testid="chat-list-item"]'
    );
    let marked=0;
    for(const row of rows){
      if(marked>=250)break;
      if(row.parentElement?.closest('[role="row"],[role="listitem"]'))continue;
      const t=row.querySelector('[data-testid="cell-frame-title"],'+
        '[data-testid="chatlist-title"],span[title]');
      if(!t)continue;
      if(!row.hasAttribute('data-wml-n3-row'))row.setAttribute('data-wml-n3-row','');
      if(!t.hasAttribute('data-wml-n3-name'))t.setAttribute('data-wml-n3-name','');
      // A React virtualizer can recycle a row: clear old hidden branches.
      for(const h of row.querySelectorAll('[data-wml-n3-detail]'))
        h.removeAttribute('data-wml-n3-detail');
      let node=t;
      for(let i=0;node!==row&&node?.parentElement&&i<16;i++){
        const parent=node.parentElement;
        if(!row.contains(parent))break;
        for(const sibling of parent.children){
          if(sibling!==node&&!sibling.contains(t))
            sibling.setAttribute('data-wml-n3-detail','');
        }
        node=parent;
      }
      marked++;
    }
    if(n3.listenerPane!==pane){
      if(n3.listenerPane)n3.listenerPane.removeEventListener('click',n3OnNativeClick,true);
      pane.addEventListener('click',n3OnNativeClick,true);
      n3.listenerPane=pane;
    }
    n3.side=side;n3.pane=pane;n3.main=main;
    return true;
  }
  function n3OnNativeClick(event){
    // Passive observer only. The physical click is delivered to WhatsApp.
    // This observer never cancels the native event or synthesizes a replacement.
    const row=event.target.closest?.('[data-wml-n3-row]');
    if(!row || !event.isTrusted)return;
    n3.lastRow=row;
    const nameEl=row.querySelector('[data-wml-n3-name]');
    const name=(nameEl?.getAttribute('title')||nameEl?.textContent||'').trim();
    n3.pending={
      started:Date.now(),
      requested:name,
      previousHeader:n3NativeHeader()
    };
    n3Status('Esperando que WhatsApp abra la conversación…',false);
    setTimeout(n3CheckOpened,700);
    setTimeout(n3CheckOpened,5500);
  }
  function n3NativeHeader(){
    const header=document.querySelector('#main > header, #main header');
    if(!header)return '';
    const title=header.querySelector(
      '[data-testid="conversation-info-header-chat-title"],'+
      '[data-testid="conversation-title"],span[title],[dir="auto"]'
    );
    return (title?.getAttribute('title')||title?.textContent||header.textContent||'').trim();
  }
  function n3CheckOpened(){
    if(!n3.pending||mode()!=='canvas')return;
    const main=document.querySelector('#main');
    const editable=main?.querySelector(
      'footer [contenteditable="true"],[data-testid="conversation-compose-box-input"],[role="textbox"][contenteditable="true"]'
    );
    const header=n3NativeHeader();
    const fold=value=>String(value||'').normalize('NFKC').trim().toLocaleLowerCase();
    const correct=Boolean(
      header && n3.pending.requested &&
      (fold(header)===fold(n3.pending.requested) ||
       fold(header).includes(fold(n3.pending.requested)))
    );
    // If title selectors drift, require the native header to CHANGE.
    // Never accept a pre-existing unrelated conversation as success.
    const changed=Boolean(header && header!==n3.pending.previousHeader);
    if(main && editable && (correct || (changed && !n3.pending.requested))){
      n3.pending=0;n3.verified=true;n3Status('',false);
      n3.main=main;n3Vars();return;
    }
    if(Date.now()-n3.pending.started>5000){
      n3.pending=0;
      n3Status('WhatsApp no abrió el chat. Usá Original para comprobar la conversación.',true);
    }
  }
  function n3Status(message,error){
    const sh=n3.shadow;if(!sh)return;
    const info=sh.getElementById('alert');
    if(!info)return;
    info.hidden=!message;
    sh.getElementById('alertText').textContent=message||'';
    sh.getElementById('original').hidden=!error;
  }
  function n3Create(){
    if(n3.host?.isConnected)return;
    if(!document.body)return;
    n3InitialLayout();n3Style();
    const host=document.createElement('div');
    host.id='wml-native-studio-host';
    host.style.cssText='position:fixed!important;inset:0!important;z-index:2147482010!important;pointer-events:none!important';
    const sh=host.attachShadow({mode:'open'});
    sh.innerHTML=[
      '<style>:host{all:initial;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}',
      '*,*::before,*::after{box-sizing:border-box}',
      '#frame{position:fixed;pointer-events:none;border-radius:22px;overflow:visible;',
      'box-shadow:0 18px 65px #0007;transition:width .25s ease}',
      '#head{position:absolute;left:0;top:0;width:var(--n3-side);height:110px;',
      'padding:19px 18px 10px;border-radius:22px 0 0 0;',
      'background:linear-gradient(180deg,#1b424e,#193a47);pointer-events:auto;',
      'border-bottom:1px solid #ffffff18;cursor:grab;touch-action:none;user-select:none}',
      '#head:active{cursor:grabbing}',
      '#eyebrow{color:#83bbc5;font-weight:750;font-size:10px;letter-spacing:.18em}',
      '#heading{display:flex;align-items:center;justify-content:space-between;margin-top:7px}',
      '#stageTitle{font-size:24px;letter-spacing:-.055em;font-weight:650;color:#f2fcff}',
      '#settings{font:18px system-ui;background:#ffffff0c;color:#e6f4f6;',
      'border:1px solid #ffffff29;border-radius:10px;width:30px;height:30px;cursor:pointer}',
      '#sub{font-size:11px;color:#94b4bd;margin-top:7px}',
      '#alert{position:absolute;top:114px;left:8px;width:calc(var(--n3-side) - 16px);',
      'border-radius:10px;background:#113542;border:1px solid #78c7be63;',
      'color:#e6faf5;font:11px/1.45 system-ui;padding:10px;pointer-events:auto}',
      '#original{display:block;margin-top:6px;color:#dffff7;',
      'background:#286056;border:0;border-radius:6px;padding:6px 10px;cursor:pointer}',
      '#alert[hidden],#original[hidden]{display:none!important}',
      '#resize{position:absolute;right:0;bottom:0;width:20px;height:20px;',
      'pointer-events:auto;cursor:nwse-resize;',
      'background:linear-gradient(135deg,transparent 50%,#7dc8b6 55%,transparent 62%);',
      'border-radius:0 0 18px 0}',
      '#empty{position:absolute;left:var(--n3-side);top:0;',
      'width:var(--n3-chat-w);height:100%;border-radius:0 22px 22px 0;',
      'background:radial-gradient(circle at 70% 26%,#283a55,transparent 50%),#132231;',
      'display:grid;place-items:center;pointer-events:none;',
      'box-shadow:0 18px 65px #0007}',
      '#empty strong{font-size:22px;color:#dceff3;font-weight:550;letter-spacing:-.04em}',
      '#frame[data-chat="true"] #empty{display:none}',
      '#frame[data-chat="false"] #empty{display:none}',
      '#frame[data-chat="false"] #resize{display:none}',
      '@media(max-width:740px){#stageTitle{font-size:20px}#head{padding:17px 12px}}',
      '</style>',
      '<div id="frame" data-chat="false">',
      '<header id="head"><div id="eyebrow">WHATSAPP · STUDIO</div>',
      '<div id="heading"><strong id="stageTitle">Mensajes</strong>',
      '<button id="settings" type="button" aria-label="Abrir ajustes">◐</button></div>',
      '<div id="sub">Contactos reales · clic directo</div></header>',
      '<div id="alert" role="status" aria-live="polite" hidden>',
      '<span id="alertText"></span><button id="original" type="button" hidden>',
      'Abrir WhatsApp original</button></div>',
      '<div id="empty"><strong>Elegí una conversación</strong></div>',
      '<div id="resize" aria-label="Redimensionar Studio"></div></div>'
    ].join('');
    sh.getElementById('settings').addEventListener('click',()=>toggle(true));
    sh.getElementById('original').addEventListener('click',()=>updateState(MODE_KEY,'original'));
    const handle=sh.getElementById('head');
    const resize=sh.getElementById('resize');
    for(const [el,kind] of [[handle,'move'],[resize,'size']]){
      el.addEventListener('pointerdown',e=>{
        if(e.target.closest('button'))return;
        n3.drag={kind,x:e.clientX,y:e.clientY,layout:{...n3.layout}};
        el.setPointerCapture?.(e.pointerId);
        e.preventDefault();
      });
      el.addEventListener('pointermove',e=>{
        if(!n3.drag||n3.drag.kind!==kind)return;
        const d=n3.drag,dx=e.clientX-d.x,dy=e.clientY-d.y;
        if(kind==='move'){
          n3.layout.x=n3Clamp(d.layout.x+dx,8,Math.max(8,innerWidth-295));
          n3.layout.y=n3Clamp(d.layout.y+dy,8,Math.max(8,innerHeight-130));
        }else{
          n3.layout.w=n3Clamp(d.layout.w+dx,560,Math.max(560,innerWidth-n3.layout.x-8));
          n3.layout.h=n3Clamp(d.layout.h+dy,340,Math.max(340,innerHeight-n3.layout.y-8));
        }
        n3Vars();
      });
      el.addEventListener('pointerup',()=>{
        if(n3.drag){n3.drag=null;n3Save();}
      });
      el.addEventListener('pointercancel',()=>{n3.drag=null;});
    }
    document.body.appendChild(host);
    n3.host=host;n3.shadow=sh;
    n3Vars();
  }
  function n3Refresh(){
    if(mode()!=='canvas')return;
    n3Create();
    if(n3MarkNativeList()){
      n3Vars();
      if(n3.needOriginal)n3Status('',false);
      n3.needOriginal=false;
    }else{
      n3.needOriginal=true;
      n3Status('WhatsApp todavía no mostró su lista de contactos. Esperando carga…',false);
    }
    n3CheckOpened();
  }
  function scheduleCanvas(){
    if(mode()!=='canvas'||n3.scheduled)return;
    n3.scheduled=setTimeout(()=>{
      n3.scheduled=0;
      try{n3Refresh();}catch(e){n3Status('No se pudo aplicar Studio. Usá WhatsApp Original.',true);}
    },130);
  }
  function makeCanvas(){n3Create();}
  function syncCanvas(){
    if(mode()!=='canvas'){
      if(n3.host)n3.host.remove();
      n3.host=null;n3.shadow=null;
      if(n3.listenerPane)n3.listenerPane.removeEventListener('click',n3OnNativeClick,true);
      n3.listenerPane=null;n3.pending=0;n3.main=null;n3.side=null;n3.pane=null;
      n3.layout=null;n3.verified=false;n3.needOriginal=false;
      for(const prop of ['--n3-x','--n3-y','--n3-w','--n3-h','--n3-side','--n3-chat-x','--n3-chat-w'])
        document.documentElement.style.removeProperty(prop);
      if(uiShadow)uiShadow.getElementById('trigger').style.display='';
      return;
    }
    if(uiShadow)uiShadow.getElementById('trigger').style.display='none';
    n3Create();scheduleCanvas();
  }

  function init(){
    attrs();
    applyCss();
    if(document.body){createUI();scheduleNakedList();syncCanvas();}
    else document.addEventListener('DOMContentLoaded',()=>{createUI();scheduleNakedList();syncCanvas();},{once:true});
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
      scheduleNakedList();
      if(mode()==='canvas'){makeCanvas();scheduleCanvas();}
    },3500);
    const startObserver=()=>{
      const root=document.querySelector('#app');
      if(!root || layoutObserver)return;
      layoutObserver=new MutationObserver(()=>{scheduleNakedList();scheduleCanvas();});
      layoutObserver.observe(root,{childList:true,subtree:true});
      scheduleNakedList();
    };
    if(document.body)startObserver();
    else document.addEventListener('DOMContentLoaded',startObserver,{once:true});
    setInterval(()=>{if(!layoutObserver)startObserver();},3500);
  }
  GM_registerMenuCommand('WhatsApp Minimal: abrir panel',()=>{if(!uiRoot)createUI();toggle(true);});
  GM_registerMenuCommand('WhatsApp Minimal: restaurar original',restore);
  if(document.documentElement)init();
  else document.addEventListener('readystatechange',()=>{if(document.documentElement)init();},{once:true});
})();
