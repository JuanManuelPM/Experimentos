# TIPO VIVO · Web W002 / 04 · Recibo de producción

**ID:** `web-w002-20261122-04` · **room:** `web` · **método:** `QBAR-1 + DEEP-SPEC-1` · **fecha:** 2026-11-22.

**Estado preciso:** `IMPLEMENTED_SOURCE_VERIFIED`, `LOGIC_PASS`, `DOM_STUB_PASS`, `LIVE_BROWSER_NOT_RUN`, `VISUAL_QA_NOT_RUN`, `HUMAN_APPROVED_NO`.

## Obra producida

- [index.html](index.html): micrositio original *TIPO VIVO* de una fundición ficticia; portada editorial, laboratorio con escritura libre y cinco ejes reales, presets, póster cinético pausables, anatomía comparativa y crédito de licencia.
- [styles.css](styles.css): dirección editorial tinta azul/marfil/coral, retícula y breakpoints 720/360 px; estilos para `prefers-reduced-motion: reduce`.
- [site.js](site.js): integración de inputs, preset, clipboard, estado de fuente y reloj de cinética sin autoplay.
- [axis-engine.js](axis-engine.js): módulo ESM reusable con normalización, límites, serialización de `font-variation-settings`, interpolación, pub/sub.
- [axis-engine.test.mjs](axis-engine.test.mjs) y [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json) con trazabilidad preventiva.
- La tipografía base utilizada es **Recursive**, autoría de **The Recursive Project Authors / ArrowType / Stephen Nixon**, [SIL OFL 1.1](https://github.com/arrowtype/recursive/blob/main/OFL.txt). La fundición de la narrativa es ficticia: **no afirma haber creado esa fuente**. Se carga con Google Fonts CSS2 y requiere conectividad para usar el binario; fallback a system-ui.

## Referente → intención → decisión → evidencia → brecha

| Referente realmente examinado | Intención | Decisión | Evidencia de trabajo | Brecha |
|---|---|---|---|---|
| [Recursive](https://www.recursive.design/) (texto HTML/documentación) | Ejes auténticos expresivos | 5 ejes OFL con límites explícitos | `axis-engine.js` y 5 inputs conectados; 14 checks PASS | No se inspeccionó en navegador el binario/font interpolado |
| [Dinamo Darkroom](https://dinamodarkroom.com/) (texto público sobre Font Gauntlet) | Herramienta de exploración | Presets y póster de ejes interpolados | Interacción DOM simulada: play/pause/scrub PASS | Sin observación en píxeles |
| [Studio Size / Exat](https://studio-size.com/work/exat/) (descripción textual) | Dirección editorial, no demo genérica | Tres composiciones propias de escala y retícula | HTML/CSS persistidos y leídos en GitHub | Comparación visual profesional NOT_RUN, no se copió Exat |
| [MDN font-variation-settings](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-variation-settings) | Control OpenType correcto | `fontVariationSettings` desde datos validados | Comprobación de serialización PASS | Computed style en Chrome NOT_RUN |

## Comprobaciones ejecutadas

1. **Integridad de publicación GitHub:** `index.html`, `styles.css`, `site.js`, `axis-engine.js`, tests y ficha creados en rama exclusiva y fusionados por PR [#22](https://github.com/JuanManuelPM/Experimentos/pull/22), commit de integración `5b2dc965608f54453084fa391710bf73e5acdfd0`. Readback de `index.html` en `gh-pages` PASS.
2. **Validador DEEP-SPEC-1:** función canónica ejecutada sobre JSON real recuperado de GitHub; `READY_FOR_FIRST_SLICE` sin errores. Solo gate estructural.
3. **Motor de ejes:** 14 aserciones ejecutadas en el V8 del conector contra el código completo recuperado de GitHub, límites y NaN, cinco ejes, CSS, observadores: PASS.
4. **Integración DOM simulada:** se cargó el código `site.js` real con DOM de prueba aislado; edición segura, actualización de peso, readback numérico, preset, play, pausa, seek y activación de reduced-motion: **8/8 PASS**.
5. **Sanidad estática:** referencias locales, presencia de los cinco controles, reduced-motion, atribución, balance de etiquetas `section` y sintaxis JS: PASS.
6. **GitHub Pages HTTPS:** URL esperada `https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/next/web/results/04/`. Fetch externo durante la ejecución: **HTTP 404** (deploy de Pages todavía no accesible en ese instante); no se declara URL viva verificada.
7. **Prueba remota de navegador:** `NOT_RUN` por falta de créditos del navegador conectado. No se generaron capturas reales. Chromium local existe pero el container carece de salida a Internet y no dispone de los archivos de GitHub como filesystem local. Quedan `NOT_RUN`: viewport 320/768/1440, teclado real, touch real, computed style, carga de Google Fonts, screenshots y evaluación perceptual.

## Riesgos vivos y corrección del método

- **P0 · disponibilidad del producto público:** verificar deploy efectivo de Pages y apertura HTTP 200 antes de declarar `LIVE_VERIFIED`. Causa: despliegues concurrentes y verificación ejecutada antes de disponibilidad. *Gate preventivo:* lectura web externa de la URL final y estado Pages, no solo leer `gh-pages`. *Contraejemplo:* archivo fuente presente, sitio aún 404.
- **P1 · tipografía realmente visible:** `font-variation-settings` y rangos correctos a nivel de código, pero falta comprobar que CSS2 entregó el archivo variable con todos los ejes en el navegador final. *Gate:* `document.fonts.check` + screenshot A/B extremos + estilo computado. *Contraejemplo:* fallback system-ui aparenta cambios numéricos sin alterar glifos.
- **P1 · responsive/perceptual:** faltan observaciones reales 320, 768 y 1440 px. *Gate:* screenshots fullPage, inspección de `scrollWidth`, contraste y teclado/tacto. *Contraejemplo:* fuente enorme que clipea en 320 px aunque CSS `clamp` compile.

**Autoría, seguridad y conservación:** nueva ruta aislada `results/04/`; no se alteran briefs, flujos canónicos, obras anteriores ni otros nueve resultados. Sin compra, tracking, formularios enviados al servidor ni binarios sin licencia. **NO HUMAN_APPROVAL**, calidad profesional **NO CERTIFICADA**.
