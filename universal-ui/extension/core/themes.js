/* Universal UI · sistema visual.
   Un tema es un conjunto de tokens universales. Ningún tema conoce una app:
   cada adaptador traduce estos tokens a las variables propias del sitio (su "bridge").
   Las cinco primeras paletas provienen del personalizador anterior (userstyles/, v1.3.0) sin cambios. */
(function (UUI) {
  'use strict';
  const TOKENS = ['bg', 'side', 'card', 'text', 'muted', 'border', 'accent'];

  const THEMES = {
    aire:    { name: 'Aire',    scheme: 'dark',  bg: '#182728', side: '#142122', card: '#2a3e3b', text: '#e5f0ea', muted: '#b8cfca', border: '#506661', accent: '#94e2d5' },
    cafe:    { name: 'Café',    scheme: 'dark',  bg: '#2a211d', side: '#211a17', card: '#3a2b26', text: '#f4e8de', muted: '#cfb9aa', border: '#6d5347', accent: '#f5cba7' },
    ambar:   { name: 'Ámbar',   scheme: 'dark',  bg: '#282419', side: '#201d16', card: '#3c3527', text: '#f5ead2', muted: '#d3c3a1', border: '#716448', accent: '#f9e2af' },
    papel:   { name: 'Papel',   scheme: 'dark',  bg: '#262b2a', side: '#1e2423', card: '#353d39', text: '#eff1e9', muted: '#cad1c8', border: '#617168', accent: '#bac2de' },
    grafito: { name: 'Grafito', scheme: 'dark',  bg: '#191925', side: '#151520', card: '#262638', text: '#e3e6f3', muted: '#b5bdd3', border: '#44465e', accent: '#cba6f7' },
    tide:    { name: 'Tide',    scheme: 'dark',  bg: '#0a0c11', side: '#05070b', card: '#11141b', text: '#c3cde0', muted: '#8a96ad', border: '#222b3b', accent: '#8cb8f2' },
  };

  // ---- color utilities (shared by engine verification and tests) ----
  function parseColor(value) {
    if (!value) return null;
    const v = String(value).trim().toLowerCase();
    let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
    if (m) {
      let h = m[1];
      if (h.length === 3) h = h.split('').map(c => c + c).join('');
      return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
    }
    m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/.exec(v);
    if (m) {
      if (m[4] !== undefined && parseFloat(m[4]) === 0) return null; // transparent
      return [m[1], m[2], m[3]].map(Number);
    }
    return null;
  }
  function sameColor(a, b) {
    const x = parseColor(a), y = parseColor(b);
    return !!(x && y) && x.every((c, i) => Math.abs(c - y[i]) <= 1);
  }
  function luminance(rgb) {
    const l = rgb.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
  }
  function contrast(fg, bg) {
    const a = parseColor(fg), b = parseColor(bg);
    if (!a || !b) return null;
    const la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  UUI.THEME_TOKENS = TOKENS;
  UUI.THEMES = THEMES;
  UUI.color = { parseColor, sameColor, contrast };
})(globalThis.UUI = globalThis.UUI || {});
