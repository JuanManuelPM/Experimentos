/* Universal UI · script de contenido.
   Solo se ejecuta en los sitios para los que el usuario otorgó permiso (host_permissions opcionales).
   No envía nada fuera del navegador: el informe solo viaja a la ventana emergente de la extensión. */
(function () {
  'use strict';
  const UUI = globalThis.UUI;
  if (!UUI || globalThis.__uuiStarted) return;
  const adapter = UUI.adapters.adapterForHost(location.hostname);
  if (!adapter) return;
  globalThis.__uuiStarted = true;

  const api = globalThis.browser || globalThis.chrome;
  const store = new UUI.store.Store(api.storage.local);
  const engine = UUI.createEngine({ adapter, document, window });

  store.load().then(s => { engine.apply(s); engine.start(); });
  store.watch(s => engine.apply(s)); // tiempo real: cualquier cambio guardado se aplica al instante

  api.runtime.onMessage.addListener((msg) => {
    if (!msg || typeof msg.type !== 'string') return;
    if (msg.type === 'uui:report') return Promise.resolve(engine.report());
    if (msg.type === 'uui:action') return Promise.resolve(engine.runAction(msg.id));
    if (msg.type === 'uui:revert') { engine.revertAll(); return Promise.resolve(engine.report()); }
  });
})();
