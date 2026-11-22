/* CONTRAPUNTO — progressive editorial navigation & archive engine, v2 */
(() => {
  'use strict';
  const doc = document;
  const front = doc.getElementById('front');
  const stories = [...doc.querySelectorAll('[data-story]')];
  const entries = [...doc.querySelectorAll('[data-entry]')];
  const search = doc.getElementById('archive-search');
  const count = doc.getElementById('result-count');
  const empty = doc.getElementById('empty-results');
  const filters = [...doc.querySelectorAll('[data-filter]')];
  const normalize = str => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  let topic = 'todos';
  let firstRoute = true;

  function updateArchive() {
    const q = normalize(search.value);
    let visible = 0;
    for (const entry of entries) {
      const matchTopic = topic === 'todos' || entry.dataset.topic === topic;
      const source = doc.getElementById(entry.dataset.target)?.textContent || '';
      const matchSearch = !q || normalize(entry.dataset.search + ' ' + source).includes(q);
      entry.hidden = !(matchTopic && matchSearch);
      if (!entry.hidden) visible++;
    }
    count.textContent = visible === 1 ? '1 publicación encontrada' : visible + ' publicaciones encontradas';
    empty.hidden = visible !== 0;
    return visible;
  }

  function selectTopic(next) {
    topic = filters.some(b => b.dataset.filter === next) ? next : 'todos';
    filters.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === topic)));
    updateArchive();
  }

  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    const active = stories.find(s => s.id === hash) || null;
    front.hidden = Boolean(active);
    stories.forEach(s => { s.hidden = s !== active; });
    doc.body.classList.toggle('reading', Boolean(active));
    doc.title = active
      ? active.querySelector('h1').textContent.trim() + ' · CONTRAPUNTO'
      : 'CONTRAPUNTO · Revista de ideas que no encajan del todo';
    if (!firstRoute) {
      if (hash === 'archivo') doc.getElementById('archivo').scrollIntoView({block:'start'});
      else { window.scrollTo({top:0,behavior:'instant'}); if(active) active.querySelector('h1').focus({preventScroll:true}); }
    } else if (hash === 'archivo') requestAnimationFrame(() => doc.getElementById('archivo').scrollIntoView());
    firstRoute = false;
  }

  filters.forEach(button => button.addEventListener('click', () => selectTopic(button.dataset.filter)));
  doc.querySelectorAll('[data-topic-link]').forEach(link => link.addEventListener('click', () => {
    selectTopic(link.dataset.topicLink);
    if (location.hash === '#archivo') doc.getElementById('archivo').scrollIntoView({block:'start'});
  }));
  search.addEventListener('input', updateArchive);
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') { search.value = ''; updateArchive(); }
  });
  doc.getElementById('clear-search').addEventListener('click', () => {
    search.value = '';
    selectTopic('todos');
    search.focus();
  });
  doc.getElementById('search-form').addEventListener('submit', event => {
    event.preventDefault();
    updateArchive();
  });

  const tabs = [...doc.querySelectorAll('[role="tab"]')];
  const panels = [...doc.querySelectorAll('[role="tabpanel"]')];
  function activateTab(target, focus = false) {
    tabs.forEach(t => {
      const selected = t.id === target;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(p => { p.hidden = p.getAttribute('aria-labelledby') !== target; });
    if (focus) doc.getElementById(target)?.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.id));
    tab.addEventListener('keydown', event => {
      let next = null;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== null) { event.preventDefault(); activateTab(tabs[next].id, true); }
    });
  });
  if(tabs.length) activateTab(tabs[0].id);

  doc.querySelectorAll('.photo-frame img, .story-media img').forEach(img => {
    img.addEventListener('error', () => img.closest('.photo-frame,.story-media')?.classList.add('media-error'));
    if (img.complete && img.naturalWidth === 0) img.closest('.photo-frame,.story-media')?.classList.add('media-error');
  });
  doc.documentElement.classList.add('js-ready');
  selectTopic('todos');
  addEventListener('hashchange', route);
  route();
})();
