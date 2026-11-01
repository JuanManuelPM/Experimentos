/* Firefox MV3: opt-in permission per active site. No scripts before consent. */
(function (UUI) {
  'use strict';
  const api = globalThis.browser || globalThis.chrome;
  const CONTENT_FILES = ['core/status.js', 'core/themes.js', 'core/schema.js', 'core/store.js', 'core/adapter.js', 'core/engine.js',
    'adapters/chatgpt.js', 'adapters/whatsapp.js', 'adapters/wikipedia.js', 'content/content.js'];
  const origin = host => 'https://' + host + '/*';
  const scriptId = host => 'uui-' + host.replace(/[^a-z0-9_-]/gi, '-');
  let tab = null, host = '';

  const hasHostPermission = name => api.permissions.contains({origins: [origin(name)]});
  async function register(name) {
    const id = scriptId(name);
    const current = await api.scripting.getRegisteredContentScripts({ids: [id]});
    if (current.some(s => s.id === id)) return;
    await api.scripting.registerContentScripts([{
      id, matches: [origin(name)], js: CONTENT_FILES,
      runAt: 'document_idle', persistAcrossSessions: true
    }]);
  }
  async function injectIfMissing() {
    if (!tab || !host || !(await hasHostPermission(host))) {
      throw new Error('Falta permiso para esta aplicación');
    }
    try {
      await api.tabs.sendMessage(tab.id, {type: 'uui:report'});
      return;
    } catch (_) {
      // A newly registered content script does not run in an already-open tab.
      await api.scripting.executeScript({target: {tabId: tab.id}, files: CONTENT_FILES});
    }
  }
  const env = {
    store: new UUI.store.Store(api.storage.local),
    async getContext() {
      [tab] = await api.tabs.query({active: true, currentWindow: true});
      host = '';
      try { host = new URL(tab.url).hostname; } catch (_) { /* non-web tab */ }
      // Settings now opens in a full tab. Pick a real application tab rather
      // than treating moz-extension:// as an unsupported website.
      if (!['chatgpt.com','chat.openai.com','web.whatsapp.com',
              'es.wikipedia.org','en.wikipedia.org'].includes(host)) {
        const openTabs = await api.tabs.query({});
        const preferred = ['chatgpt.com','web.whatsapp.com','chat.openai.com'];
        const found = openTabs.filter(t => {
          try { return preferred.includes(new URL(t.url).hostname); }
          catch (_) { return false; }
        }).sort((a,b) => preferred.indexOf(new URL(a.url).hostname) -
                          preferred.indexOf(new URL(b.url).hostname))[0];
        if(found) { tab=found; host=new URL(found.url).hostname; }
      }
      const adapter = UUI.adapters.adapterForHost(host);
      const permitted = adapter ? await hasHostPermission(host) : false;
      if (permitted) await register(host);
      return {host, adapter, permitted};
    },
    async hasPermission(adapter) {
      for (const name of adapter.hosts) {
        if (await hasHostPermission(name)) return true;
      }
      return false;
    },
    async requestPermission(adapter) {
      if (!tab || !host || !adapter.hosts.includes(host)) return false;
      const ok = await api.permissions.request({origins: [origin(host)]});
      if (!ok) return false;
      await register(host);
      await injectIfMissing();
      return true;
    },
    async getReport() {
      try { return await api.tabs.sendMessage(tab.id, {type: 'uui:report'}); }
      catch (_) {
        await injectIfMissing();
        return api.tabs.sendMessage(tab.id, {type: 'uui:report'});
      }
    },
    async openLauncher() {
      const url = api.runtime.getURL('launcher/index.html');
      const all = await api.tabs.query({});
      const existing = all.find(t => t.url === url);
      if (existing) {
        await api.windows.update(existing.windowId, {focused: true});
        await api.tabs.update(existing.id, {active: true});
        return;
      }
      await api.tabs.create({url, active: true});
    },
    runAction: id => api.tabs.sendMessage(tab.id, {type: 'uui:action', id}),
    download(name, content) {
      const url = URL.createObjectURL(new Blob([content], {type: 'application/json'}));
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  UUI.mountPanel(document.getElementById('uui'), env);
})(globalThis.UUI);
