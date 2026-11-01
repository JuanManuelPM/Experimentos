/* Conecta el panel con Firefox: pestaña activa, permisos por sitio y mensajes al script de contenido. */
(function (UUI) {
  'use strict';
  const api = globalThis.browser || globalThis.chrome;
  const CONTENT_FILES = ['core/status.js', 'core/themes.js', 'core/schema.js', 'core/store.js', 'core/adapter.js', 'core/engine.js',
    'adapters/chatgpt.js', 'adapters/whatsapp.js', 'adapters/wikipedia.js', 'content/content.js'];
  const origins = (a) => a.hosts.map(h => `https://${h}/*`);
  let tab = null;

  const env = {
    store: new UUI.store.Store(api.storage.local),
    async getContext() {
      [tab] = await api.tabs.query({ active: true, currentWindow: true });
      let host = '';
      try { host = new URL(tab.url).hostname; } catch (e) { /* about:, etc. */ }
      const adapter = UUI.adapters.adapterForHost(host);
      const permitted = adapter ? await env.hasPermission(adapter) : false;
      return { host, adapter, permitted };
    },
    hasPermission: (a) => api.permissions.contains({ origins: origins(a) }),
    async requestPermission(a) {
      const ok = await api.permissions.request({ origins: origins(a) });
      if (ok && tab) await api.scripting.executeScript({ target: { tabId: tab.id }, files: CONTENT_FILES.map(f => '/' + f) }).catch(() => {});
      return ok;
    },
    getReport: () => api.tabs.sendMessage(tab.id, { type: 'uui:report' }),
    runAction: (id) => api.tabs.sendMessage(tab.id, { type: 'uui:action', id }),
    download(name, text) {
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
  };
  UUI.mountPanel(document.getElementById('uui'), env);
})(globalThis.UUI);
