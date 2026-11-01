// ==UserScript==
// @name         Universal Media Studio · YouTube + YouTube Music
// @namespace    https://github.com/JuanManuelPM/Experimentos
// @version      0.1.0
// @description  Un escritorio reversible con widgets para YouTube y YouTube Music. Usa video/audio nativos.
// @match        https://www.youtube.com/*
// @match        https://music.youtube.com/*
// @run-at       document-idle
// @noframes
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';
  if (window.top !== window || document.getElementById('ums-host')) return;
  const APP = location.hostname === 'music.youtube.com' ? 'music' : 'youtube';
  const STATE_KEY = 'ums-layout-v1-' + APP;
  const MODE_KEY = 'ums-enabled-v1-' + APP;
  const BLUE = '#89c7cd';
  const store = (key, fallback) => {
    try { const value = GM_getValue(key, fallback); return value === undefined ? fallback : value; }
    catch (_) { return fallback; }
  };
  const save = (key, value) => { try { GM_setValue(key, value); } catch (_) {} };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const state = {
    enabled: store(MODE_KEY, true) !== false,
    browse: false, drag: null, search: '', pane: 'queue', player: null,
    x: Math.max(12, Math.round(((innerWidth || 1440) - 1070) / 2)),
    y: Math.max(12, Math.round(((innerHeight || 900) - 722) / 2)),
    w: 1070, h: 722, lastList: '', lastMeta: '',
    lastVideo: null, lastTime: -1, messageUntil: 0, videoMoveOk: false
  };
  const initial = store(STATE_KEY, null);
  if (initial && typeof initial === 'object') {
    for (const key of ['x', 'y', 'w', 'h']) {
      if (Number.isFinite(Number(initial[key]))) state[key] = Number(initial[key]);
    }
  }
  function setGeometry() {
    const vw = innerWidth || 1280, vh = innerHeight || 800;
    state.w = clamp(state.w, Math.min(560, vw - 16), Math.max(560, vw - 16));
    state.h = clamp(state.h, Math.min(440, vh - 16), Math.max(440, vh - 16));
    state.x = clamp(state.x, 8, Math.max(8, vw - 295));
    state.y = clamp(state.y, 8, Math.max(8, vh - 95));
  }
  function persist() {
    save(STATE_KEY, { x: Math.round(state.x), y: Math.round(state.y),
      w: Math.round(state.w), h: Math.round(state.h) });
  }
  const nativeBackup = { target: null, props: null };
  const nativeProps = ['position', 'left', 'top', 'width', 'height',
    'z-index', 'margin', 'border-radius', 'overflow', 'max-width', 'max-height'];
  function restoreNative() {
    if (!nativeBackup.target) return;
    const el = nativeBackup.target;
    for (const [key, old] of nativeBackup.props) {
      if (old.value) el.style.setProperty(key, old.value, old.priority);
      else el.style.removeProperty(key);
    }
    nativeBackup.target = null;
    nativeBackup.props = null;
    state.videoMoveOk = false;
  }
  function videoElement() {
    if (APP === 'music') {
      return document.querySelector('ytmusic-player video') ||
        document.querySelector('ytmusic-player-bar video') ||
        document.querySelector('video') || document.querySelector('audio');
    }
    return document.querySelector('#movie_player video.html5-main-video') ||
      document.querySelector('ytd-watch-flexy video') ||
      document.querySelector('video.html5-main-video') || document.querySelector('audio');
  }
  function nativePlayerBox() {
    if (APP !== 'youtube') return null;
    return document.querySelector('ytd-watch-flexy #player-container-outer') ||
      document.querySelector('ytd-watch-flexy #player-container-inner') ||
      document.querySelector('ytd-watch-flexy #player');
  }
  function nowTitle() {
    if (APP === 'music') {
      const el = document.querySelector('ytmusic-player-bar .title.ytmusic-player-bar') ||
        document.querySelector('ytmusic-player-bar .title');
      return (el?.getAttribute('title') || el?.textContent || '').trim();
    }
    return (document.querySelector('ytd-watch-metadata h1 yt-formatted-string')?.textContent ||
      document.querySelector('h1.title yt-formatted-string')?.textContent ||
      document.title.replace(/\s*-\s*YouTube\s*$/, '') || '').trim();
  }
  function nowArtist() {
    if (APP === 'music') {
      const el = document.querySelector('ytmusic-player-bar .byline') ||
        document.querySelector('ytmusic-player-bar .subtitle');
      return (el?.textContent || '').trim();
    }
    return (document.querySelector('ytd-watch-metadata ytd-channel-name a')?.textContent ||
      document.querySelector('#owner ytd-channel-name a')?.textContent || '').trim();
  }
  function nowArt() {
    if (APP !== 'music') return '';
    const img = document.querySelector('ytmusic-player-bar #thumbnail img') ||
      document.querySelector('ytmusic-player-bar img');
    const src = img?.currentSrc || img?.src || '';
    return /^https:\/\//.test(src) ? src : '';
  }
  function queueItems() {
    const rows = APP === 'music'
      ? document.querySelectorAll('ytmusic-player-queue-item')
      : document.querySelectorAll('ytd-playlist-panel-video-renderer');
    const items = [];
    for (const row of Array.from(rows).slice(0, 15)) {
      const titleEl = APP === 'music'
        ? row.querySelector('yt-formatted-string.song-title, .song-title')
        : row.querySelector('#video-title, a#video-title');
      const title = (titleEl?.getAttribute('title') || titleEl?.textContent || '').trim();
      if (!title) continue;
      const rawLink = APP === 'youtube'
        ? row.querySelector('a[href*="/watch"]')?.getAttribute('href') : null;
      const href = rawLink ? new URL(rawLink, location.origin) : null;
      if (href && href.origin !== location.origin) continue;
      items.push({ title, href: href ? href.href : null });
    }
    return items;
  }
  function platformNav() {
    if (APP === 'music') return [
      ['Inicio', 'https://music.youtube.com/'],
      ['Biblioteca', 'https://music.youtube.com/library'],
      ['Explorar', 'https://music.youtube.com/explore']
    ];
    return [
      ['Inicio', 'https://www.youtube.com/'],
      ['Suscripciones', 'https://www.youtube.com/feed/subscriptions'],
      ['Historial', 'https://www.youtube.com/feed/history']
    ];
  }
  const host = document.createElement('div');
  host.id = 'ums-host';
  host.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483000!important;pointer-events:none!important';
  const sh = host.attachShadow({ mode: 'open' });
  const css = [
    ':host{all:initial;font-family:Inter,"Segoe UI",Arial,sans-serif;color:#f1f6f8}',
    '*,*::before,*::after{box-sizing:border-box}',
    '#ambient{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 10% 92%,#143d46,transparent 37%),radial-gradient(ellipse at 85% 6%,#282440,transparent 46%),#090e17}',
    '#masks{position:fixed;inset:0;pointer-events:none}',
    '.mask{position:fixed;pointer-events:auto;background:#090e17}',
    '#desk{position:fixed;display:flex;overflow:hidden;pointer-events:none;background:linear-gradient(120deg,#132e39,#171d2f 75%,#20213a);border:1px solid #ffffff34;border-radius:23px;box-shadow:0 34px 90px #000a,0 1px 20px #0006}',
    '#desk[hidden],#launcher[hidden]{display:none!important}',
    '#desk[data-browse="true"]{width:304px!important;height:430px!important;box-shadow:0 16px 45px #000b}',
    '#desk[data-browse="true"] #stage,#desk[data-browse="true"] #resize{display:none}',
    '#desk[data-browse="true"] #left{width:100%;flex:1;border:0}',
    '#desk[data-browse="true"] #panel{padding-bottom:6px}',
    '#desk[data-browse="true"] #queue{max-height:80px}',
    '#desk[data-browse="true"] #navigation{display:none}',
    '#left{width:302px;flex:0 0 302px;min-width:0;display:flex;flex-direction:column;pointer-events:auto;background:linear-gradient(170deg,#1d4248 0%,#142e38 55%,#10212d 100%);border-right:1px solid #ffffff1c}',
    '#handle{padding:21px 20px 15px;cursor:grab;touch-action:none;user-select:none}',
    '#handle:active{cursor:grabbing}',
    '.eyebrow{font-size:10px;letter-spacing:.22em;color:#a4c9cf;font-weight:700}',
    '.topline{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px}',
    '.topline h1{font-size:25px;line-height:1.15;letter-spacing:-.055em;font-weight:620;margin:0;color:#f3fcff}',
    '.actions{display:flex;align-items:center;gap:6px}',
    'button{font-family:inherit;cursor:pointer}',
    '.icon{width:30px;height:30px;background:#ffffff13;border:1px solid #ffffff20;border-radius:10px;color:#eff9f9;font-size:16px}',
    '.icon:hover,.btn:hover{background:#ffffff24}',
    '#panel{flex:1;overflow:auto;min-height:0;padding:4px 16px 12px;scrollbar-width:thin;scrollbar-color:#ffffff3b transparent}',
    '#status{min-height:18px;margin:0 4px 10px;color:#a9c5cb;font-size:11px;line-height:1.35}',
    '#song{font-size:16px;font-weight:610;letter-spacing:-.025em;line-height:1.35;white-space:normal;margin:4px 4px 3px;overflow-wrap:anywhere}',
    '#artist{font-size:12px;color:#a4bbc7;margin:0 4px 13px}',
    '#transport{display:flex;align-items:center;justify-content:space-between;gap:9px;margin:14px 0 10px}',
    '.btn{border:1px solid #ffffff20;background:#ffffff13;color:#edf8fb;border-radius:12px;height:38px;min-width:42px;padding:0 10px;font-size:14px}',
    '#play{font-size:17px;background:#b6e4dc;color:#102834;border-color:#b6e4dc;flex:1}',
    '#seek{width:100%;accent-color:#b6e4dc;cursor:pointer}',
    '#clock{display:flex;justify-content:space-between;gap:6px;color:#9ebec3;font:11px ui-monospace,monospace;margin-bottom:11px}',
    '#volumeWrap{display:flex;gap:9px;align-items:center;color:#b5d3d4;font-size:12px}',
    '#volume{flex:1;min-width:0;accent-color:#b6e4dc}',
    '#searchForm{display:flex;gap:7px;align-items:center;margin:16px 0 13px}',
    '#search{flex:1;min-width:0;height:36px;border-radius:10px;border:1px solid #ffffff29;background:#051e27d0;color:#eaf7f8;padding:0 10px;font:13px inherit;outline:0}',
    '#search::placeholder{color:#8fa9b0}',
    '#searchGo{height:36px;padding:0 10px}',
    '#navigation{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:15px}',
    '#navigation a{font-size:11px;border:1px solid #ffffff22;padding:7px 9px;border-radius:10px;text-decoration:none;color:#c7dfe2;background:#ffffff0a}',
    '.label{font-size:10px;letter-spacing:.16em;color:#9bc3c4;font-weight:700;margin:14px 3px 10px}',
    '#queue{display:flex;flex-direction:column;gap:3px}',
    '.row{padding:9px 10px;font-size:12px;line-height:1.3;border-radius:9px;color:#d9e6ea;text-align:left;text-decoration:none;overflow-wrap:anywhere}',
    'a.row:hover{background:#ffffff14}',
    '.empty{color:#92b3ba;font-size:12px;line-height:1.5;padding:5px 4px}',
    '#foot{padding:10px 19px 16px;border-top:1px solid #ffffff14;display:flex;gap:7px;align-items:center;justify-content:space-between;color:#8eb2bd;font-size:10px;letter-spacing:.07em}',
    '#foot strong{color:#b6e3df;font-weight:600}',
    '#stage{flex:1;min-width:0;position:relative;pointer-events:none;display:flex;flex-direction:column;padding:21px 22px 25px;gap:16px}',
    '#stageHead{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:28px}',
    '#stageHead h2{font-size:12px;font-weight:700;color:#b3d6dc;letter-spacing:.17em;margin:0}',
    '#stageHead span{font-size:11px;color:#a6bbc9}',
    '#videoSlot{position:relative;flex:none;width:100%;aspect-ratio:16/9;border-radius:15px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(140deg,#244858,#202642)}',
    '#videoSlot[data-mounted="true"]{background:transparent}',
    '#videoMessage{padding:24px;max-width:340px;text-align:center;font-size:15px;line-height:1.5;color:#cce1e7}',
    '#videoSlot[data-mounted="true"] #videoMessage{display:none}',
    '#stageInfo{flex:1;min-height:0;display:flex;align-items:flex-start;gap:15px}',
    '#cover{height:min(33vh,235px);aspect-ratio:1;border-radius:16px;object-fit:cover;box-shadow:0 15px 35px #050e17a6}',
    '#cover[hidden]{display:none}',
    '#vinyl{width:200px;aspect-ratio:1;border-radius:100%;background:radial-gradient(circle,#0b1e2b 0 9%,#86d0c6 10% 12%,#101c29 13% 18%,#29384c 19% 21%,#141e2d 22% 100%);box-shadow:0 22px 42px #0008}',
    '#vinyl[hidden]{display:none}',
    '#infoText{min-width:0;padding-top:5px}',
    '#bigTitle{font-size:clamp(24px,3vw,43px);font-weight:620;letter-spacing:-.055em;line-height:1.14;max-height:5em;overflow:hidden;overflow-wrap:anywhere}',
    '#bigArtist{font-size:15px;color:#9ebcc8;margin-top:12px}',
    '#tip{font-size:12px;line-height:1.6;color:#8ea8b5;margin-top:20px;max-width:410px}',
    '#resize{position:absolute;right:0;bottom:0;width:24px;height:24px;cursor:nwse-resize;pointer-events:auto;background:linear-gradient(135deg,transparent 52%,#b7d7d483 54%,transparent 60%)}',
    '#launcher{position:fixed;right:17px;bottom:18px;pointer-events:auto;width:46px;height:46px;border-radius:16px;background:#123d46;color:#dcf5f3;border:1px solid #ffffff40;box-shadow:0 7px 25px #0008;font-size:22px}',
    ':is(button,input,a):focus-visible{outline:2px solid #d2f7ec;outline-offset:3px}',
    '@media(max-width:900px){#stage{padding:18px 15px}#left{width:280px;flex-basis:280px}#videoSlot{aspect-ratio:16/10}}',
    '@media(max-width:680px){#desk{border-radius:17px}#stage{display:none}#left{width:100%;flex:1}#resize{display:none}}'
  ].join('');
  sh.innerHTML = [
    '<style>', css, '</style>',
    '<div id="ambient"></div>',
    '<div id="masks">',
    '<div class="mask" id="mTop"></div><div class="mask" id="mLeft"></div>',
    '<div class="mask" id="mRight"></div><div class="mask" id="mBottom"></div>',
    '</div>',
    '<div id="desk">',
    '<section id="left">',
    '<header id="handle"><div class="eyebrow">UNIVERSAL UI / MEDIA STUDIO</div>',
    '<div class="topline"><h1 id="appName"></h1>',
    '<div class="actions"><button class="icon" id="browse" title="Explorar página" aria-label="Explorar página">↗</button>',
    '<button class="icon" id="close" title="Vista original" aria-label="Vista original">×</button></div>',
    '</div></header>',
    '<div id="panel"><p id="status" role="status" aria-live="polite"></p>',
    '<div id="song"></div><p id="artist"></p>',
    '<div id="transport"><button type="button" class="btn" id="prev" aria-label="Anterior">❮</button>',
    '<button type="button" class="btn" id="play" aria-label="Reproducir o pausar">▶</button>',
    '<button type="button" class="btn" id="next" aria-label="Siguiente">❯</button></div>',
    '<input id="seek" type="range" min="0" max="1000" value="0" aria-label="Posición">',
    '<div id="clock"><span id="elapsed">0:00</span><span id="duration">0:00</span></div>',
    '<label id="volumeWrap">Volumen <input id="volume" type="range" min="0" max="100" value="70" aria-label="Volumen"></label>',
    '<form id="searchForm" method="get"><input id="search" type="search" placeholder="Buscar" aria-label="Buscar" autocomplete="off">',
    '<button id="searchGo" class="btn" type="submit">Buscar</button></form>',
    '<nav id="navigation" aria-label="Navegación"></nav>',
    '<div class="label" id="queueName">COLA ACTUAL</div>',
    '<div id="queue"></div></div>',
    '<footer id="foot"><span>REPRODUCCIÓN ORIGINAL</span><strong id="mode">CANVAS</strong></footer>',
    '</section>',
    '<section id="stage" aria-label="Reproductor visual">',
    '<div id="stageHead"><h2 id="stageTitle"></h2><span id="stageMark">NATIVO · SIN COPIAS</span></div>',
    '<div id="videoSlot" data-mounted="false"><p id="videoMessage">Elegí un video desde el sitio para mostrarlo acá.</p></div>',
    '<div id="stageInfo"><img id="cover" alt="Portada actual" hidden>',
    '<div id="vinyl" hidden aria-hidden="true"></div>',
    '<div id="infoText"><div id="bigTitle"></div><div id="bigArtist"></div>',
    '<div id="tip"></div></div></div></section>',
    '<div id="resize" role="separator" aria-label="Redimensionar Studio"></div>',
    '</div><button id="launcher" type="button" aria-label="Abrir Media Studio" hidden>◐</button>'
  ].join('');
  const $ = id => sh.getElementById(id);
  $('appName').textContent = APP === 'music' ? 'Music Studio' : 'YouTube Studio';
  $('stageTitle').textContent = APP === 'music' ? 'REPRODUCIENDO' : 'REPRODUCTOR';
  $('tip').textContent = APP === 'music'
    ? 'La música y la cola siguen en YouTube Music. Este escritorio no duplica el audio.'
    : 'El video original se acomoda en esta ventana cuando su estructura lo permite.';
  $('searchForm').setAttribute('action', APP === 'music'
    ? 'https://music.youtube.com/search' : 'https://www.youtube.com/results');
  $('search').name = APP === 'music' ? 'q' : 'search_query';
  const nav = $('navigation');
  for (const [label, href] of platformNav()) {
    const a = document.createElement('a'); a.href = href; a.textContent = label;
    nav.appendChild(a);
  }
  function message(txt, ms) {
    $('status').textContent = txt;
    state.messageUntil = Date.now() + (ms || 3500);
  }
  function durationText(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const n = Math.floor(sec);
    return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
  }
  function changeMode(enabled) {
    state.enabled = enabled;
    save(MODE_KEY, enabled);
    if (!enabled) restoreNative();
    paint();
  }
  $('close').addEventListener('click', () => changeMode(false));
  $('launcher').addEventListener('click', () => changeMode(true));
  $('browse').addEventListener('click', () => {
    state.browse = !state.browse;
    restoreNative();
    paint();
  });
  function mediaAction(action) {
    const media = videoElement();
    if (!media) { message('No hay reproducción cargada. Abrí un video o canción.', 5000); return; }
    if (action === 'play') {
      if (media.paused) {
        try {
          const result = media.play();
          if (result?.catch) result.catch(() => message('El navegador bloqueó Play. Usá el control original.', 6000));
        } catch (_) { message('No pude iniciar la reproducción nativa.', 5000); }
      } else media.pause();
      refresh();
      return;
    }
    const before = nowTitle() + '|' + (media.currentSrc || '');
    const selector = APP === 'music'
      ? (action === 'next' ? 'ytmusic-player-bar .next-button' : 'ytmusic-player-bar .previous-button')
      : (action === 'next' ? '#movie_player .ytp-next-button' : '#movie_player .ytp-prev-button');
    const button = document.querySelector(selector);
    if (!button || button.hasAttribute('disabled') ||
      button.getAttribute('aria-disabled') === 'true') {
      message('Control nativo no disponible; tocá «Explorar página».', 4500);
      return;
    }
    button.click();
    message('Comprobando el cambio…', 2300);
    setTimeout(() => {
      const after = nowTitle() + '|' + (videoElement()?.currentSrc || '');
      if (after === before) message('No pude confirmar el cambio. Abrí los controles originales.', 5500);
      else message('', 500);
      refresh();
    }, 1850);
  }
  $('play').addEventListener('click', () => mediaAction('play'));
  $('next').addEventListener('click', () => mediaAction('next'));
  $('prev').addEventListener('click', () => mediaAction('prev'));
  $('seek').addEventListener('input', e => {
    const media = videoElement();
    if (media && Number.isFinite(media.duration) && media.duration > 0) {
      media.currentTime = media.duration * Number(e.target.value) / 1000;
    }
  });
  $('volume').addEventListener('input', e => {
    const media = videoElement();
    if (media) {
      media.volume = Number(e.target.value) / 100;
      if (media.volume > 0) media.muted = false;
    }
  });
  function activatePointer(handle, resizing) {
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('button,input,a')) return;
      if (e.button !== undefined && e.button !== 0) return;
      state.drag = { resizing, x: e.clientX, y: e.clientY, oldX: state.x,
        oldY: state.y, oldW: state.w, oldH: state.h };
      handle.setPointerCapture?.(e.pointerId);
      e.preventDefault();
    });
    handle.addEventListener('pointermove', e => {
      if (!state.drag || state.drag.resizing !== resizing) return;
      const d = state.drag;
      if (resizing) {
        state.w = clamp(d.oldW + e.clientX - d.x, Math.min(innerWidth - 16, 560),
          Math.max(innerWidth - state.x - 8, 560));
        state.h = clamp(d.oldH + e.clientY - d.y, Math.min(innerHeight - 16, 440),
          Math.max(innerHeight - state.y - 8, 440));
      } else {
        state.x = clamp(d.oldX + e.clientX - d.x, 8, Math.max(8, innerWidth - 295));
        state.y = clamp(d.oldY + e.clientY - d.y, 8, Math.max(8, innerHeight - 95));
      }
      paint();
    });
    const done = () => {
      if (!state.drag) return;
      state.drag = null; persist(); paint();
    };
    handle.addEventListener('pointerup', done);
    handle.addEventListener('pointercancel', done);
  }
  activatePointer($('handle'), false);
  activatePointer($('resize'), true);
  function setMask(el, x, y, w, h) {
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.style.width = Math.max(0, w) + 'px'; el.style.height = Math.max(0, h) + 'px';
  }
  function attachNativeVideo() {
    if (APP !== 'youtube' || !state.enabled || state.browse ||
      innerWidth < 680 || document.fullscreenElement) { restoreNative(); return; }
    const target = nativePlayerBox(), slot = $('videoSlot');
    if (!target || !videoElement()) {
      restoreNative(); slot.dataset.mounted = 'false';
      $('videoMessage').textContent = 'Abrí un video de YouTube para mostrar su reproductor acá.';
      return;
    }
    if (nativeBackup.target && nativeBackup.target !== target) restoreNative();
    if (!nativeBackup.target) {
      nativeBackup.target = target;
      nativeBackup.props = nativeProps.map(key => [
        key, { value: target.style.getPropertyValue(key), priority: target.style.getPropertyPriority(key) }
      ]);
    }
    const box = slot.getBoundingClientRect();
    if (box.width < 100 || box.height < 80) return;
    const rules = {
      position: 'fixed', left: box.left + 'px', top: box.top + 'px',
      width: box.width + 'px', height: box.height + 'px',
      'z-index': '2147483500', margin: '0', 'border-radius': '15px',
      overflow: 'hidden', 'max-width': 'none', 'max-height': 'none'
    };
    for (const [prop, val] of Object.entries(rules)) target.style.setProperty(prop, val, 'important');
    const result = target.getBoundingClientRect();
    const aligned = Math.abs(result.left - box.left) < 12 &&
      Math.abs(result.top - box.top) < 12 && Math.abs(result.width - box.width) < 15;
    if (!aligned) {
      restoreNative();
      slot.dataset.mounted = 'false';
      $('videoMessage').textContent = 'La estructura de YouTube cambió. Usá «Explorar» para ver el reproductor original.';
      return;
    }
    // Check visibility and hit testing. A native target may be trapped inside
    // a YouTube stacking context even with a large z-index.
    const centerX = box.left + box.width / 2, centerY = box.top + box.height / 2;
    const hit = typeof document.elementFromPoint === 'function'
      ? document.elementFromPoint(centerX, centerY) : null;
    if (hit && hit !== target && !target.contains(hit)) {
      restoreNative();
      slot.dataset.mounted = 'false';
      $('videoMessage').textContent =
        'Este diseño de YouTube no permite traer el video al frente. Tocá «Explorar» para usar el original.';
      return;
    }
    state.videoMoveOk = true;
    slot.dataset.mounted = 'true';
  }
  function paint() {
    setGeometry();
    $('launcher').hidden = state.enabled;
    $('desk').hidden = !state.enabled;
    const canvas = state.enabled && !state.browse;
    $('ambient').hidden = !canvas;
    $('masks').hidden = !canvas;
    $('desk').dataset.browse = String(state.browse);
    $('browse').title = state.browse ? 'Volver a Canvas' : 'Explorar página original';
    $('browse').textContent = state.browse ? '▣' : '↗';
    $('browse').setAttribute('aria-label', state.browse ? 'Volver a Canvas' : 'Explorar página');
    $('mode').textContent = state.browse ? 'EXPLORAR' : 'CANVAS';
    if (!state.enabled) { restoreNative(); return; }
    const desk = $('desk');
    desk.style.left = state.x + 'px';
    desk.style.top = state.y + 'px';
    desk.style.width = state.w + 'px';
    desk.style.height = state.h + 'px';
    if (canvas) {
      const w = state.w, h = state.h, x = state.x, y = state.y;
      setMask($('mTop'), 0, 0, innerWidth, y);
      setMask($('mLeft'), 0, y, x, h);
      setMask($('mRight'), x + w, y, innerWidth - x - w, h);
      setMask($('mBottom'), 0, y + h, innerWidth, innerHeight - y - h);
    }
    if (APP === 'youtube') {
      attachNativeVideo();
      // Never claim that a native video is visible when hit-testing failed.
      $('ambient').hidden = !canvas || state.videoMoveOk;
    }
  }
  function redrawQueue() {
    const entries = queueItems();
    const sig = entries.map(x => x.title + (x.href || '')).join('\n');
    if (sig === state.lastList) return;
    state.lastList = sig;
    const pane = $('queue'), frag = document.createDocumentFragment();
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = APP === 'music'
        ? 'La cola aparece cuando YouTube Music la carga. Podés gestionarla en «Explorar».'
        : 'No hay una playlist activa cargada. Usá «Explorar» para elegir una.';
      frag.appendChild(empty);
    } else {
      for (const item of entries) {
        const row = document.createElement(item.href ? 'a' : 'div');
        row.className = 'row';
        row.textContent = item.title;
        if (item.href) row.href = item.href;
        frag.appendChild(row);
      }
    }
    pane.replaceChildren(frag);
    $('queueName').textContent = APP === 'music'
      ? 'PRÓXIMAS · COLA NATIVA' : 'LISTA DE REPRODUCCIÓN';
  }
  function refresh() {
    if (!state.enabled) return;
    const media = videoElement();
    const title = nowTitle() || (APP === 'music' ? 'Elegí una canción' : 'Elegí un video');
    const artist = nowArtist() || (APP === 'music' ? 'YouTube Music' : 'YouTube');
    const key = title + '|' + artist + '|' + nowArt();
    if (key !== state.lastMeta) {
      state.lastMeta = key;
      $('song').textContent = title;
      $('artist').textContent = artist;
      $('bigTitle').textContent = title;
      $('bigArtist').textContent = artist;
      if (APP === 'music') {
        const art = nowArt();
        $('cover').hidden = !art;
        $('vinyl').hidden = !!art;
        if (art) $('cover').src = art;
        $('videoSlot').hidden = true;
      } else {
        $('cover').hidden = true; $('vinyl').hidden = true;
        $('videoSlot').hidden = false;
      }
    }
    const t = Number(media?.currentTime) || 0;
    const duration = Number(media?.duration) || 0;
    if (document.activeElement !== $('seek')) {
      $('seek').value = duration > 0 && Number.isFinite(duration)
        ? String(Math.round(t / duration * 1000)) : '0';
    }
    $('seek').disabled = !(duration > 0 && Number.isFinite(duration));
    $('elapsed').textContent = durationText(t);
    $('duration').textContent = durationText(duration);
    $('play').textContent = media && !media.paused ? '❚❚' : '▶';
    $('play').setAttribute('aria-label', media && !media.paused ? 'Pausar' : 'Reproducir');
    if (media && document.activeElement !== $('volume')) {
      $('volume').value = media.muted ? '0' : String(Math.round(media.volume * 100));
    }
    if (state.messageUntil < Date.now() && $('status').textContent) {
      $('status').textContent = '';
    }
    redrawQueue();
    if (APP === 'youtube' && !state.drag) paint();
  }
  function start() {
    if (!document.body) { document.addEventListener('DOMContentLoaded', start, { once: true }); return; }
    document.body.appendChild(host);
    paint(); refresh();
    window.addEventListener('resize', () => { paint(); refresh(); });
    window.addEventListener('yt-navigate-finish', () => setTimeout(refresh, 250));
    window.addEventListener('yt-page-data-updated', () => setTimeout(refresh, 250));
    window.addEventListener('popstate', () => setTimeout(refresh, 250));
    window.addEventListener('keydown', e => {
      if (e.altKey && e.shiftKey && e.code === 'KeyM') {
        e.preventDefault(); changeMode(!state.enabled);
      }
      if (e.key === 'Escape' && state.enabled && state.browse) {
        state.browse = false; paint();
      }
    });
    document.addEventListener('fullscreenchange', () => { paint(); refresh(); });
    setInterval(refresh, 1050);
    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('Media Studio: alternar Canvas / Original',
        () => changeMode(!state.enabled));
      GM_registerMenuCommand('Media Studio: alternar Canvas / Explorar',
        () => { state.enabled = true; state.browse = !state.browse; paint(); });
    }
  }
  start();
})();
