// ==UserScript==
// @name         WhatsApp Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      2.0.0
// @description  Studio: ventana flotante de contactos y conversación nativa; arrastre y búsqueda.
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
          <button data-mode="radical" aria-pressed="false">Radical</button><button data-mode="canvas" aria-pressed="false">Canvas</button>
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



  /* WML_STUDIO_V2
     Own visual interface. Native React conversation remains mounted;
     names are volatile DOM references, not a copied contacts database. */
  const canvas={
    host:null,shadow:null,entries:[],pane:null,shift:0,timer:0,selected:'',
    x:0,y:24,w:0,h:0,loaded:false,drag:null,search:''
  };
  const canvasWidth=282;
  const layoutKey='wml-studio-layout-v2';
  function stageBounds(){
    if(canvas.loaded)return;
    canvas.loaded=true;
    const p=setting(layoutKey,null)||{};
    canvas.w=Math.min(innerWidth-28,Math.max(720,Number(p.w)||1060));
    canvas.h=Math.min(innerHeight-24,Math.max(420,Number(p.h)||innerHeight-48));
    canvas.x=Math.max(8,Math.min(innerWidth-canvasWidth-8,
      Number.isFinite(Number(p.x))?Number(p.x):Math.round((innerWidth-canvas.w)/2)));
    canvas.y=Math.max(8,Math.min(innerHeight-110,
      Number.isFinite(Number(p.y))?Number(p.y):24));
  }
  function saveStage(){
    GM_setValue(layoutKey,{x:Math.round(canvas.x),y:Math.round(canvas.y),
      w:Math.round(canvas.w),h:Math.round(canvas.h)});
  }
  function canvasSourceStyle(){
    let st=document.getElementById('wml-canvas-source-css');
    if(!st){st=document.createElement('style');st.id='wml-canvas-source-css';}
    st.textContent=[
      'html[data-wml-mode="canvas"] body{background:#090d16!important;overflow:hidden!important}',
      'html[data-wml-mode="canvas"] #app{',
        'transform:translateX(calc(-1 * var(--wml-canvas-shift,0px)))!important;',
        'width:calc(100% + var(--wml-canvas-shift,0px))!important;max-width:none!important}',
      'html[data-wml-mode="canvas"] :is(#side,#pane-side){opacity:0!important;pointer-events:none!important}',
      'html[data-wml-mode="canvas"] #main{',
        'width:var(--wml-chat-w,750px)!important;max-width:none!important;min-width:0!important;',
        'height:var(--wml-chat-h,740px)!important;max-height:var(--wml-chat-h,740px)!important;',
        'transform:translateY(var(--wml-chat-top,24px))!important;',
        'border-radius:0 22px 22px 0!important;box-shadow:none!important;overflow:hidden!important;',
        'background:linear-gradient(125deg,#133045,#171e39)!important;',
        '--conversation-panel-background:#122b3b!important;',
        '--conversation-header-background:#1a3747!important;',
        '--compose-panel-background:#193343!important;',
        '--incoming-background:#234352!important;',
        '--outgoing-background:#315168!important;',
        '--primary:#f0f8ff!important;--secondary:#b1cad4!important;',
        '--WDS-text-primary:#f0f8ff!important}',
      'html[data-wml-mode="canvas"] #main>header{background:#183847ee!important;',
        'border-bottom:1px solid #ffffff16!important}',
      'html[data-wml-mode="canvas"] #main>footer{background:#193442ed!important;',
        'border-top:1px solid #ffffff14!important}',
      'html[data-wml-mode="canvas"] #main [contenteditable="true"]{',
        'color:#f2f9fb!important;caret-color:#83eac3!important}'
    ].join('');
    if(!st.isConnected)(document.head||document.documentElement).appendChild(st);
  }
  function makeCanvas(){
    if(canvas.host?.isConnected)return;
    if(!document.body)return;
    stageBounds();canvasSourceStyle();
    const host=document.createElement('div');host.id='wml-canvas-host';
    host.style.cssText='position:fixed!important;inset:0!important;z-index:2147482000!important;pointer-events:none!important';
    const sh=host.attachShadow({mode:'open'});
    sh.innerHTML=[
      '<style>',
      ':host{all:initial;font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif}',
      '*,*::before,*::after{box-sizing:border-box}',
      '#backdrop{position:fixed;inset:0;background:radial-gradient(ellipse at 8% 92%,#113b44 0%,transparent 37%),',
        'radial-gradient(ellipse at 86% 8%,#24213d 0%,transparent 44%),#080d16;pointer-events:none}',
      '#backdrop[data-chat="true"]{background:transparent}',
      '#masks{position:fixed;inset:0;pointer-events:none;display:none}',
      '#masks[data-chat="true"]{display:block}',
      '.mask{position:fixed;background:#080d16;pointer-events:none}',
      '#shell{position:fixed;display:flex;overflow:hidden;pointer-events:none;',
        'border:1px solid #ffffff30;border-radius:24px;',
        'background:linear-gradient(130deg,#133547,#192039 70%,#27213a);',
        'box-shadow:0 24px 75px #0009,0 1px 12px #07152180;',
        'transition:width .28s ease}',
      '#shell[data-chat="false"]{width:282px!important}',
      '#contacts{width:282px;flex:0 0 282px;min-width:0;display:flex;flex-direction:column;',
        'background:linear-gradient(180deg,#17404b 0%,#132f3d 48%,#10232f 100%);',
        'border-right:1px solid #ffffff18;pointer-events:auto}',
      '#head{padding:22px 19px 14px;cursor:grab;touch-action:none;user-select:none}',
      '#head:active{cursor:grabbing}',
      '.kicker{color:#82c1c9;font:700 10px/1 system-ui;letter-spacing:.20em}',
      '.heading{margin-top:9px;display:flex;align-items:center;justify-content:space-between}',
      '.heading strong{font-size:26px;font-weight:650;letter-spacing:-.065em;color:#f0fbff}',
      '#settings{width:32px;height:32px;border:1px solid #ffffff28;border-radius:11px;',
        'background:#ffffff12;color:#e0f4f4;font-size:18px;cursor:pointer}',
      '#searchbar{margin:0 14px 12px;height:40px;border:1px solid #ffffff23;border-radius:12px;',
        'background:#061b26c4;display:flex;align-items:center;padding:0 11px;gap:9px}',
      '#searchbar span{font-size:20px;color:#96c6c8}',
      '#search{flex:1;min-width:0;background:transparent;border:0;outline:0;',
        'color:#ecfaff;font:13px system-ui}',
      '#search::placeholder{color:#8aabb2}',
      '#list{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;',
        'scrollbar-width:thin;scrollbar-color:#ffffff36 transparent;padding:0 9px}',
      '.person{display:block;width:100%;height:48px;padding:0 13px;text-align:left;',
        'border:0;border-radius:11px;background:transparent;cursor:pointer;',
        'color:#dcebef;letter-spacing:-.018em;',
        'font:500 14px/48px system-ui,-apple-system,"Segoe UI",sans-serif;',
        'white-space:nowrap;text-overflow:ellipsis;overflow:hidden}',
      '.person:hover{background:#ffffff14}',
      '.person[data-selected="true"]{background:#7ac5d129;color:#fff}',
      'button:focus-visible,#search:focus-visible{outline:2px solid #95f2ce;outline-offset:2px}',
      '#message{color:#acc3ca;font:12px/1.5 system-ui;padding:16px}',
      '#foot{padding:12px 20px 17px;color:#8fb4bd;font:10px/1.5 system-ui;',
        'letter-spacing:.06em}',
      '#right{flex:1;min-width:0;pointer-events:none;display:grid;place-items:center}',
      '#right[data-chat="false"]{background:radial-gradient(circle at 65% 27%,#41558c65,transparent 46%),',
        'linear-gradient(135deg,#173e55,#25213f)}',
      '#right[data-chat="true"]{background:transparent}',
      '#placeholder{text-align:center;color:#c8e2e9;max-width:300px}',
      '#placeholder strong{display:block;font-size:25px;font-weight:500;',
        'letter-spacing:-.045em;margin-bottom:10px}',
      '#placeholder span{font-size:13px;color:#9bb7c3;line-height:1.6}',
      '#right[data-chat="true"] #placeholder{display:none}',
      '#resize{position:absolute;right:0;bottom:0;width:18px;height:18px;',
        'cursor:nwse-resize;pointer-events:auto;display:none;',
        'background:linear-gradient(135deg,transparent 45%,#85bdc88a 48%,transparent 54%)}',
      '#shell[data-chat="true"] #resize{display:block}',
      '@media(max-width:760px){#contacts{width:220px;flex-basis:220px}',
        '#shell[data-chat="false"]{width:220px!important}',
        '.heading strong{font-size:22px}#head{padding:15px 13px 12px}}',
      '</style>',
      '<div id="backdrop"></div>',
      '<div id="masks"><div class="mask" id="topmask"></div><div class="mask" id="leftmask"></div>',
        '<div class="mask" id="rightmask"></div><div class="mask" id="bottommask"></div></div>',
      '<div id="shell" data-chat="false">',
      '<section id="contacts" role="region" aria-label="Contactos">',
      '<header id="head"><div class="kicker">WHATSAPP · STUDIO</div>',
      '<div class="heading"><strong>Mensajes</strong>',
      '<button id="settings" type="button" aria-label="Personalización">◐</button></div></header>',
      '<label id="searchbar"><span aria-hidden="true">⌕</span>',
      '<input id="search" type="search" aria-label="Filtrar contactos cargados"',
        ' placeholder="Buscar conversaciones" autocomplete="off"></label>',
      '<div id="list" role="listbox" aria-label="Conversaciones"></div>',
      '<p id="message" hidden></p>',
      '<footer id="foot">VISTA PERSONAL · SINCRONIZADA</footer></section>',
      '<section id="right" data-chat="false" aria-label="Conversación">',
      '<div id="placeholder"><strong>Tu espacio.</strong>',
      '<span>Elegí un contacto y la conversación se abrirá acá.</span></div></section>',
      '<div id="resize" aria-label="Redimensionar" role="separator"></div></div>'
    ].join('');
    sh.getElementById('settings').addEventListener('click',()=>toggle(true));
    sh.getElementById('search').addEventListener('input',e=>{
      canvas.search=e.target.value.toLocaleLowerCase();drawNames();
    });
    sh.getElementById('list').addEventListener('click',e=>{
      const btn=e.target.closest('[data-index]');if(!btn)return;
      const item=canvas.entries[Number(btn.dataset.index)];
      if(!item?.row?.isConnected){scheduleCanvas();return;}
      canvas.selected=item.row;
      item.row.click();scheduleCanvas();
    });
    sh.getElementById('list').addEventListener('wheel',e=>{
      if(!canvas.pane)return;
      let node=canvas.pane,scroller=null;
      for(let i=0;node&&i<5;node=node.parentElement,i++){
        if(node.scrollHeight>node.clientHeight+30 &&
          /auto|scroll/.test(getComputedStyle(node).overflowY)){scroller=node;break;}
      }
      if(scroller && (e.deltaY>0?scroller.scrollTop+scroller.clientHeight<
        scroller.scrollHeight-2:scroller.scrollTop>2)){
        e.preventDefault();scroller.scrollTop+=e.deltaY;scheduleCanvas();
      }
    },{passive:false});
    function dragHandle(el,type){
      el.addEventListener('pointerdown',e=>{
        if(e.target.closest('button,input'))return;
        canvas.drag={type,cx:e.clientX,cy:e.clientY,
          x:canvas.x,y:canvas.y,w:canvas.w,h:canvas.h};
        el.setPointerCapture?.(e.pointerId);e.preventDefault();
      });
      el.addEventListener('pointermove',e=>{
        if(!canvas.drag||canvas.drag.type!==type)return;
        const d=canvas.drag;
        if(type==='move'){
          canvas.x=Math.max(8,Math.min(innerWidth-canvasWidth-10,d.x+e.clientX-d.cx));
          canvas.y=Math.max(8,Math.min(innerHeight-110,d.y+e.clientY-d.cy));
        }else{
          canvas.w=Math.max(720,Math.min(innerWidth-canvas.x-8,d.w+e.clientX-d.cx));
          canvas.h=Math.max(420,Math.min(innerHeight-canvas.y-8,d.h+e.clientY-d.cy));
        }
        positionCanvas();
      });
      el.addEventListener('pointerup',()=>{
        if(canvas.drag){canvas.drag=null;saveStage();}
      });
      el.addEventListener('pointercancel',()=>{canvas.drag=null;});
    }
    dragHandle(sh.getElementById('head'),'move');
    dragHandle(sh.getElementById('resize'),'size');
    document.body.appendChild(host);
    canvas.host=host;canvas.shadow=sh;
    positionCanvas();
  }
  function validName(n){
    if(!n || n.length>110)return false;
    if(/^(archived|archivados|whatsapp|today|yesterday|ayer|hoy|search|buscar)$/i.test(n))return false;
    if(/^\d+\s+unread messages?/i.test(n)||/^\d+\s+mensajes?\s+sin\s+leer/i.test(n))return false;
    if(/^(message|mensaje|no messages|new chat|nuevo chat)$/i.test(n))return false;
    return true;
  }
  function canvasEntries(pane){
    if(!pane)return [];
    const rows=pane.querySelectorAll(
      '[role="row"],[role="listitem"],[data-testid="cell-frame-container"],[data-testid="chat-list-item"]'
    );
    const result=[];let scanned=0;
    for(const row of rows){
      if(++scanned>400)break;
      if(row.parentElement?.closest('[role="row"],[role="listitem"]'))continue;
      if(row.matches('[data-testid*="archived" i]')||row.querySelector('[data-icon="archived"]'))continue;
      const candidates=row.querySelectorAll(
        '[data-testid="cell-frame-title"],[data-testid="chatlist-title"],span[title],span[dir="auto"]'
      );
      let chosen=null,high=-100;
      const rect=row.getBoundingClientRect();
      for(const el of candidates){
        const name=(el.getAttribute('title')||el.textContent||'').trim();
        if(!validName(name))continue;
        const box=el.getBoundingClientRect();
        if(rect.height&&box.height && box.top>rect.top+rect.height*.67)continue;
        const testId=el.getAttribute('data-testid')||'';
        const score=(testId.includes('title')?100:0)+
          (el.hasAttribute('title')?60:0)+(el.getAttribute('dir')==='auto'?20:0)+
          (rect.height&&box.height?Math.max(0,28-(box.top-rect.top)):0);
        if(score>high){high=score;chosen=name;}
      }
      if(!chosen)continue;
      result.push({row,name:chosen,selected:row.getAttribute('aria-selected')==='true'||
        !!row.querySelector('[aria-selected="true"]')});
    }
    return result;
  }
  function drawNames(){
    const sh=canvas.shadow;if(!sh)return;
    const list=sh.getElementById('list');
    const frag=document.createDocumentFragment();
    let count=0;
    canvas.entries.forEach((item,i)=>{
      if(canvas.search&&!item.name.toLocaleLowerCase().includes(canvas.search))return;
      count++;
      const button=document.createElement('button');
      button.type='button';button.className='person';
      button.dataset.index=String(i);
      button.dataset.selected=String(item.selected||canvas.selected===item.row);
      button.setAttribute('role','option');
      button.setAttribute('aria-selected',button.dataset.selected);
      button.textContent=item.name;
      frag.appendChild(button);
    });
    const oldScroll=list.scrollTop;list.replaceChildren(frag);list.scrollTop=oldScroll;
    const msg=sh.getElementById('message');
    msg.hidden=count!==0;
    if(!count)msg.textContent=canvas.entries.length?
      'No hay coincidencias entre los chats cargados.':'Esperando conversaciones de WhatsApp.';
    sh.getElementById('foot').textContent=count+' CHATS CARGADOS · VISTA LOCAL';
  }
  function positionCanvas(){
    const sh=canvas.shadow;if(!sh)return;
    const main=document.querySelector('#main'),hasChat=!!main;
    const cW=innerWidth<760?220:canvasWidth;
    const w=Math.max(cW+320,Math.min(canvas.w,innerWidth-canvas.x-8));
    const h=Math.max(400,Math.min(canvas.h,innerHeight-canvas.y-8));
    const width=hasChat?w:cW;
    const shell=sh.getElementById('shell');
    shell.style.left=canvas.x+'px';shell.style.top=canvas.y+'px';
    shell.style.width=width+'px';shell.style.height=h+'px';
    shell.dataset.chat=String(hasChat);
    sh.getElementById('right').dataset.chat=String(hasChat);
    sh.getElementById('backdrop').dataset.chat=String(hasChat);
    const masks=sh.getElementById('masks');masks.dataset.chat=String(hasChat);
    if(hasChat){
      const rects={topmask:[0,0,innerWidth,canvas.y],
        leftmask:[0,canvas.y,canvas.x,h],
        rightmask:[canvas.x+width,canvas.y,Math.max(0,innerWidth-canvas.x-width),h],
        bottommask:[0,canvas.y+h,innerWidth,Math.max(0,innerHeight-canvas.y-h)]};
      for(const [id,v] of Object.entries(rects)){
        const el=sh.getElementById(id);
        Object.assign(el.style,{left:v[0]+'px',top:v[1]+'px',width:v[2]+'px',height:v[3]+'px'});
      }
      const left=main.getBoundingClientRect().left+canvas.shift;
      const next=Math.max(-950,Math.min(1500,Math.round(left-canvas.x-cW)));
      if(Number.isFinite(next)&&Math.abs(next-canvas.shift)>2){
        canvas.shift=next;
        document.documentElement.style.setProperty('--wml-canvas-shift',next+'px');
      }
      document.documentElement.style.setProperty('--wml-chat-top',canvas.y+'px');
      document.documentElement.style.setProperty('--wml-chat-w',Math.max(320,w-cW)+'px');
      document.documentElement.style.setProperty('--wml-chat-h',h+'px');
    }
  }
  function renderCanvas(){
    if(mode()!=='canvas')return;
    makeCanvas();
    if(!canvas.shadow)return;
    const pane=document.querySelector('#pane-side');
    canvas.pane=pane;
    const entries=canvasEntries(pane);
    const changed=entries.length!==canvas.entries.length ||
      entries.some((e,i)=>canvas.entries[i]?.name!==e.name ||
        canvas.entries[i]?.row!==e.row||canvas.entries[i]?.selected!==e.selected);
    if(changed){canvas.entries=entries;drawNames();}
    positionCanvas();
  }
  function scheduleCanvas(){
    if(mode()!=='canvas'||canvas.timer)return;
    canvas.timer=setTimeout(()=>{
      canvas.timer=0;
      try{renderCanvas();}catch(_){}  // Always leave native WhatsApp intact.
    },140);
  }
  function syncCanvas(){
    if(mode()!=='canvas'){
      if(canvas.host)canvas.host.remove();
      canvas.host=null;canvas.shadow=null;canvas.pane=null;
      canvas.entries=[];canvas.selected='';canvas.shift=0;canvas.loaded=false;
      for(const prop of ['--wml-canvas-shift','--wml-chat-top','--wml-chat-w','--wml-chat-h'])
        document.documentElement.style.removeProperty(prop);
      if(uiShadow)uiShadow.getElementById('trigger').style.display='';
      return;
    }
    if(uiShadow)uiShadow.getElementById('trigger').style.display='none';
    makeCanvas();scheduleCanvas();
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
