'use strict';
/* Presentation only. The repository reader and preview bridge live in app.js. */
(() => {
  const $ = id => document.getElementById(id);
  const show = (id,on) => { $(id).hidden = !on; };
  const body = $('viewer-body');
  let authConfig = null;
  let oauthPopup = null;
  let oauthState = '';
  let configured = false;
  const authMessage = message => { $('oauth-message').textContent = message; $('oauth-message').hidden = false; };
  function openAuth() {
    $('manual-access').open = false;
    $('oauth-message').hidden = true;
    show('auth-overlay', true);
    $('close-auth').focus();
    document.body.style.overflow = 'hidden';
  }
  function closeAuth() {
    show('auth-overlay', false);
    document.body.style.overflow = '';
  }
  function nav(open) { body.classList.toggle('nav-open', open); }
  function workspace() { show('entry', false); show('workspace', true); nav(false); }
  function home() { show('entry', true); show('workspace', false); nav(false); }
  function updateRepoLabel() {
    $('viewer-repo-label').textContent = $('repository').value.trim() || 'Repositorio';
    $('viewer-project-label').textContent = $('branch').value.trim() || 'Proyectos';
  }
  const reconnect = new MutationObserver(() => {
    const ready = $('auth-state').classList.contains('active');
    $('account-avatar').textContent = ready ? '✓' : 'G';
    $('disconnect').hidden = !ready;
    if (ready) {
      closeAuth();
      workspace();
      updateRepoLabel();
      if (!$('files').children.length) $('browse').click();
    }
  });
  reconnect.observe($('auth-state'), {attributes: true, childList: true, subtree: true});
  $('sign-in').addEventListener('click',openAuth);
  $('account-button').addEventListener('click', openAuth);
  $('close-auth').addEventListener('click', closeAuth);
  $('auth-backdrop').addEventListener('click', closeAuth);
  window.addEventListener('keydown', e => { if (e.key==='Escape') {closeAuth();nav(false);} });
  $('toggle-sidebar').addEventListener('click',()=>nav(!body.classList.contains('nav-open')));
  $('close-sidebar').addEventListener('click',()=>nav(false));
  $('return-home').addEventListener('click',home);
  $('browse').addEventListener('click',()=>{ updateRepoLabel();nav(false);});
  $('demo').addEventListener('click',()=>{updateRepoLabel();nav(false);});
  $('go-demo').addEventListener('click',async()=>{
    workspace();
    $('repository').value='JuanManuelPM/Experimentos';
    $('branch').value='candidate/cocina-umbria-002-production-20261119';
    updateRepoLabel();
    await window.PrometeoViewer.browse('prometeo/cocina-umbria-002');
    const path='prometeo/cocina-umbria-002/index.html';
    if (window.PrometeoViewer.hasVisibleFile('index.html')) await window.PrometeoViewer.openFile(path);
  });
  async function loadConfig() {
    try {
      const response = await fetch('./auth.json',{cache:'no-store'});
      if (!response.ok) return;
      const json = await response.json();
      const url = new URL(json.callbackUrl || '',location.origin);
      if (/^[a-zA-Z0-9_]+$/.test(json.clientId||'') && url.protocol==='https:' &&
        Array.isArray(json.allowedOrigins) && json.allowedOrigins.includes(location.origin)) {
        authConfig={clientId:json.clientId,callbackUrl:url.href};
        configured=true;
      }
    } catch (e) { /* auth setup optional; public demo remains available */ }
  }
  const readiness = loadConfig();
  function randomState() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
  }
  $('oauth-start').addEventListener('click', async () => {
    await readiness;
    if (!configured) {
      authMessage('La conexión automática todavía no está activada. Es necesario registrar una GitHub App de solo lectura una única vez. La demostración funciona sin iniciar sesión.');
      return;
    }
    oauthState=randomState();
    const url=new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id',authConfig.clientId);
    url.searchParams.set('redirect_uri',authConfig.callbackUrl);
    url.searchParams.set('state',oauthState);
    oauthPopup=window.open(url.href,'prometeo_auth','width=490,height=700');
    if (!oauthPopup) { authMessage('El navegador bloqueó la ventana. Permití ventanas emergentes para esta página.'); return; }
    authMessage('Autorizá el acceso en la ventana de GitHub.');
  });
  window.addEventListener('message', e=>{
    if (!configured || e.origin!==new URL(authConfig.callbackUrl).origin || e.source!==oauthPopup) return;
    const data=e.data;
    if (!data || data.type!=='prometeo:github-auth' || data.state!==oauthState) return;
    oauthState='';
    if (data.error) {authMessage(data.error);return;}
    if (typeof data.token!=='string' || !/^[\w-]{15,600}$/.test(data.token)) {authMessage('La autorización no entregó una credencial válida.');return;}
    $('token').value=data.token;
    $('connect').click();
    oauthPopup=null;
  });
  $('disconnect').addEventListener('click',()=>{
    $('account-avatar').textContent='G';
    closeAuth();
    home();
  });
  updateRepoLabel();
})();