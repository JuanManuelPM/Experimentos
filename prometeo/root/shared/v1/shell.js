/* PROMETEO UI shell v1.0.0 · agnóstico de la aplicación; navegación por eventos. */
const stylesheet = new URL('./shell.css', import.meta.url).href;

class PrometeoShell extends HTMLElement {
  static get observedAttributes() { return ['app-label']; }
  constructor() {
    super();
    this._rooms = [];
    this._room = '';
    this._onKeyDown = e => {
      if (!this.hasAttribute('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); this.closeMenu(true); return; }
      if (e.key !== 'Tab') return;
      const focusables = [this._mode, this._toggle, ...this.shadowRoot.querySelectorAll('#rooms button:not([hidden])')].filter(el => !el.hidden && el.getClientRects().length > 0);
      if (this.getAttribute('view') !== 'global') focusables.splice(2);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && this.shadowRoot.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && this.shadowRoot.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    this.attachShadow({mode:'open'}).innerHTML = `
      <link rel="stylesheet" href="${stylesheet}">
      <nav id="overlay" aria-label="Menú PROMETEO" aria-hidden="true" inert>
        <div id="panel">
          <div id="global" hidden><div id="rooms" role="navigation" aria-label="Aplicaciones"></div></div>
          <div id="application"><slot name="context"></slot></div>
        </div>
      </nav>
      <button type="button" class="control" id="mode" aria-label="Navegación general" title="Navegación general" hidden>
        <svg class="grid" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        <svg class="back" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
      </button>
      <button type="button" class="control" id="toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="overlay" title="Abrir menú"><span class="bars" aria-hidden="true"><i></i><i></i></span></button>`;
  }
  connectedCallback() {
    this._toggle = this.shadowRoot.getElementById('toggle');
    this._mode = this.shadowRoot.getElementById('mode');
    this._overlay = this.shadowRoot.getElementById('overlay');
    this._global = this.shadowRoot.getElementById('global');
    this._application = this.shadowRoot.getElementById('application');
    this._toggle.addEventListener('click', () => this.hasAttribute('open') ? this.closeMenu() : this.openMenu());
    this._mode.addEventListener('click', () => this.setView(this.getAttribute('view') === 'global' ? 'app' : 'global'));
    this.shadowRoot.getElementById('rooms').addEventListener('click', e => {
      const target = e.target.closest('button[data-room]');
      if (!target) return;
      this.dispatchEvent(new CustomEvent('prometeo:navigate', {detail:{room:target.dataset.room},bubbles:true,composed:true}));
      this.closeMenu();
    });
    document.addEventListener('keydown', this._onKeyDown);
    this.setView('app');
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeyDown);
    if (this.hasAttribute('open')) document.body.classList.remove('p-menu-locked');
  }
  attributeChangedCallback() { if (this._mode) this._updateLabels(); }
  setRooms(rooms) {
    this._rooms = Array.isArray(rooms) ? rooms.filter(x => x && /^[a-z0-9-]+$/.test(x.id) && typeof x.label === 'string') : [];
    const root = this.shadowRoot.getElementById('rooms');
    root.replaceChildren();
    for (const room of this._rooms) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.room = room.id;
      const label = document.createElement('span'); label.textContent = room.label;
      const dot = document.createElement('span'); dot.className = 'dot'; dot.textContent = '●'; dot.setAttribute('aria-hidden','true');
      button.append(label,dot); root.append(button);
    }
    this.setRoom(this._room);
  }
  setRoom(id) {
    this._room = id || '';
    for (const button of this.shadowRoot.querySelectorAll('#rooms button')) {
      const active = button.dataset.room === this._room;
      button.setAttribute('aria-current', active ? 'page' : 'false');
      button.lastElementChild.hidden = !active;
    }
    this._updateLabels();
  }
  _updateLabels() {
    if (!this._mode) return;
    const isGlobal = this.getAttribute('view') === 'global';
    const app = this.getAttribute('app-label') || 'aplicación';
    const label = isGlobal ? `Volver al menú de ${app}` : 'Navegación general';
    this._mode.setAttribute('aria-label',label); this._mode.title = label;
  }
  setView(view) {
    const global = view === 'global';
    this.setAttribute('view',global ? 'global' : 'app');
    this._global.hidden = !global;
    this._application.hidden = global;
    this._updateLabels();
    if (this.hasAttribute('open')) {
      this.shadowRoot.getElementById('panel').scrollTop = 0;
      if (global) this.shadowRoot.querySelector('#rooms button[aria-current="page"]')?.focus();
      else this._mode.focus();
    }
  }
  openMenu(view = 'app') {
    this.setView(view);
    this.setAttribute('open','');
    this._mode.hidden = false;
    this._overlay.inert = false;
    this._overlay.setAttribute('aria-hidden','false');
    this._toggle.setAttribute('aria-expanded','true');
    this._toggle.setAttribute('aria-label','Cerrar menú'); this._toggle.title = 'Cerrar menú';
    document.body.classList.add('p-menu-locked');
    this._mode.focus();
    this.dispatchEvent(new CustomEvent('prometeo:menu', {detail:{open:true},bubbles:true,composed:true}));
  }
  closeMenu(focusToggle = false) {
    this.removeAttribute('open');
    this._mode.hidden = true;
    this._overlay.inert = true;
    this._overlay.setAttribute('aria-hidden','true');
    this._toggle.setAttribute('aria-expanded','false');
    this._toggle.setAttribute('aria-label','Abrir menú'); this._toggle.title = 'Abrir menú';
    document.body.classList.remove('p-menu-locked');
    this._toggle.focus();
    this.dispatchEvent(new CustomEvent('prometeo:menu', {detail:{open:false},bubbles:true,composed:true}));
  }
}
customElements.define('prometeo-shell', PrometeoShell);
export { PrometeoShell };
