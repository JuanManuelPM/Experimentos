/* FORJA · UI móvil progresiva. No duplica el motor ni altera el esquema de escenas. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const header = document.querySelector('.header-tools');
  const footer = document.querySelector('.footer');
  const library = $('library-panel');
  const inspector = $('inspector-panel');
  const libraryButton = $('toggle-library');
  const inspectorButton = $('toggle-inspector');
  const closeLibrary = $('close-library');
  const closeInspector = $('close-inspector');
  const libraryList = $('asset-list');
  const renderStatus = $('render-status');
  if (!header || !footer || !library || !inspector || !libraryButton || !inspectorButton) return;

  const modeButton = document.createElement('button');
  modeButton.id = 'mode-toggle';
  modeButton.type = 'button';
  modeButton.textContent = 'EDITAR';
  modeButton.setAttribute('aria-pressed', 'false');
  modeButton.setAttribute('aria-label', 'Activar herramientas de edición');

  const backdrop = document.createElement('button');
  backdrop.id = 'forja-backdrop';
  backdrop.type = 'button';
  backdrop.hidden = true;
  backdrop.setAttribute('aria-label', 'Cerrar panel abierto');
  document.body.append(backdrop);

  const fallback = document.createElement('div');
  fallback.className = 'gpu-fallback';
  fallback.hidden = true;
  fallback.setAttribute('role', 'status');
  const fallbackTitle = document.createElement('strong');
  fallbackTitle.textContent = 'Este navegador no puede mostrar el mundo 3D';
  const fallbackText = document.createElement('p');
  fallbackText.textContent = 'La biblioteca sigue disponible. Para editar escenas necesitás un navegador con WebGL2.';
  const fallbackAction = document.createElement('button');
  fallbackAction.type = 'button';
  fallbackAction.textContent = 'EXPLORAR MODELOS';
  fallback.append(fallbackTitle, fallbackText, fallbackAction);
  $('stage').append(fallback);

  root.dataset.forjaMode = 'view';
  root.classList.add('forja-enhanced');
  libraryButton.textContent = 'MODELOS';
  libraryButton.setAttribute('aria-controls', 'library-panel');
  libraryButton.setAttribute('aria-expanded', 'false');
  inspectorButton.textContent = 'OBJETOS';
  inspectorButton.setAttribute('aria-controls', 'inspector-panel');
  inspectorButton.setAttribute('aria-expanded', 'false');

  footer.insertBefore(modeButton, inspectorButton);

  const compact = () => root.classList.contains('forja-compact');
  const isOpen = (el) => compact() && el.classList.contains('open');

  function setPresentationMode(mode) {
    root.dataset.forjaMode = mode === 'edit' ? 'edit' : 'view';
    const editing = root.dataset.forjaMode === 'edit';
    modeButton.textContent = editing ? 'VER ESCENA' : 'EDITAR';
    modeButton.setAttribute('aria-pressed', String(editing));
    modeButton.setAttribute('aria-label', editing ? 'Ocultar herramientas y contemplar la escena' : 'Mostrar herramientas de edición');
    if (!editing) showPanel(null);
    document.dispatchEvent(new CustomEvent('forja:mode-change', { detail: { mode: root.dataset.forjaMode } }));
  }

  function refreshAccessibility() {
    const on = compact(), libOpen = isOpen(library), inspectorOpen = isOpen(inspector);
    libraryButton.setAttribute('aria-expanded', String(libOpen));
    inspectorButton.setAttribute('aria-expanded', String(inspectorOpen));
    library.inert = on && !libOpen;
    inspector.inert = on && !inspectorOpen;
    library.setAttribute('aria-hidden', String(on && !libOpen));
    inspector.setAttribute('aria-hidden', String(on && !inspectorOpen));
    backdrop.hidden = !(on && (libOpen || inspectorOpen));
    if (inspectorOpen && root.dataset.forjaMode !== 'edit') setPresentationMode('edit');
  }

  function showPanel(name) {
    if (!compact()) return;
    library.classList.toggle('open', name === 'library');
    inspector.classList.toggle('open', name === 'inspector');
    refreshAccessibility();
  }

  function syncLayout() {
    if (compact()) {
      if (libraryButton.parentElement !== footer) footer.insertBefore(libraryButton, modeButton);
    } else {
      if (libraryButton.parentElement !== header) header.prepend(libraryButton);
      library.classList.remove('open');
      inspector.classList.remove('open');
    }
    refreshAccessibility();
  }

  function handleCapture(target, handler) {
    target.addEventListener('click', (event) => {
      if (!compact()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      handler();
    }, true);
  }

  handleCapture(libraryButton, () => showPanel(isOpen(library) ? null : 'library'));
  handleCapture(inspectorButton, () => showPanel(isOpen(inspector) ? null : 'inspector'));
  handleCapture(closeLibrary, () => { showPanel(null); libraryButton.focus(); });
  handleCapture(closeInspector, () => { showPanel(null); inspectorButton.focus(); });
  backdrop.addEventListener('click', () => showPanel(null));
  fallbackAction.addEventListener('click', () => showPanel('library'));
  modeButton.addEventListener('click', () => {
    setPresentationMode(root.dataset.forjaMode === 'edit' ? 'view' : 'edit');
  });

  /* La biblioteca usa delegación: los 1.883 botones se vuelven a crear al buscar. */
  libraryList.addEventListener('click', (event) => {
    if (!compact() || !event.target.closest('.asset')) return;
    showPanel(null);
    setPresentationMode('edit');
  });
  document.querySelectorAll('[data-preset]').forEach((button) =>
    button.addEventListener('click', () => {
      if (compact()) { showPanel(null); setPresentationMode('view'); }
    })
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && compact() && (isOpen(library) || isOpen(inspector))) {
      event.preventDefault();
      event.stopImmediatePropagation();
      showPanel(null);
    }
  }, true);

  const panelObserver = new MutationObserver(() => {
    if (compact() && library.classList.contains('open') && inspector.classList.contains('open')) {
      library.classList.remove('open');
    }
    refreshAccessibility();
  });
  panelObserver.observe(library, { attributes: true, attributeFilter: ['class'] });
  panelObserver.observe(inspector, { attributes: true, attributeFilter: ['class'] });

  function checkWebGLStatus() {
    const missingGPU = /NO DISPONIBLE/.test(renderStatus.textContent);
    root.classList.toggle('forja-no-gpu', missingGPU);
    fallback.hidden = !missingGPU || !compact();
  }
  new MutationObserver(checkWebGLStatus).observe(renderStatus, { childList: true, characterData: true, subtree: true });
  window.addEventListener('resize', () => { syncLayout(); checkWebGLStatus(); });
  window.addEventListener('orientationchange', () => { syncLayout(); checkWebGLStatus(); });
  syncLayout();
  checkWebGLStatus();

  window.__FORJA_MOBILE__ = {
    diagnostic: () => ({
      compact: compact(),
      mode: root.dataset.forjaMode,
      libraryOpen: isOpen(library),
      inspectorOpen: isOpen(inspector),
      width: window.innerWidth,
      visualWidth: window.visualViewport?.width ?? null,
      screenWidth: screen.width,
      screenHeight: screen.height,
      coarsePointer: matchMedia('(pointer:coarse)').matches,
      canvasWidth: $('canvas').getBoundingClientRect().width,
      noGPU: root.classList.contains('forja-no-gpu')
    })
  };
})();