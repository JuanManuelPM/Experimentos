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
      // connectSession opens the authorized root; do not race it with a root browse.
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
  // Same-origin backend: browser never obtains the GitHub credential.
  $('oauth-start').addEventListener('click',()=>location.assign('/auth/start'));
  if(location.hash.startsWith('#share=')){const fragment=location.hash;history.replaceState(null,'',location.pathname+location.search);workspace();$('toggle-sidebar').hidden=true;window.PrometeoViewer.openShared(fragment).catch(()=>{});}else window.PrometeoViewer.connectSession().catch(()=>{});
  $('disconnect').addEventListener('click',()=>{
    $('account-avatar').textContent='G';
    closeAuth();
    home();
  });
  updateRepoLabel();
})();