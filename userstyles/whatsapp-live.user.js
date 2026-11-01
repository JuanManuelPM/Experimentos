// ==UserScript==
// @name         WhatsApp Minimal · Live
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      1.4.0
// @description  Superficies de chats propias: tipografía, sin separadores, ancho real ajustado.
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
    attrs(); applyCss(); updateUI(); scheduleNakedList();
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

  function init(){
    attrs();
    applyCss();
    if(document.body){createUI();scheduleNakedList();}
    else document.addEventListener('DOMContentLoaded',()=>{createUI();scheduleNakedList();},{once:true});
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
    },3500);
    const startObserver=()=>{
      const root=document.querySelector('#app');
      if(!root || layoutObserver)return;
      layoutObserver=new MutationObserver(()=>scheduleNakedList());
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
