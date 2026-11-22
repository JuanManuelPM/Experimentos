# TIPO VIVO · W003 / 04 · QA RECEIPT

**taskId** web-w003-20261122-04 · **room** web · **recordedAt** 2026-11-22T19:11:36.853Z · HUMAN_APPROVED=NO.

## Producción

Micrositio original de la fundición ficticia MAREAS con portada editorial tipográfica, escritura editable, cuatro ejes variables, tres presets, póster cinético, play/pausa, scrub manual, respeto de movimiento reducido y espécimen editorial. Código: [index.html](index.html), [styles.css](styles.css), [site.mjs](site.mjs). Motor reutilizable aislado de DOM: [engine.mjs](engine.mjs). Pruebas Node incluidas: [engine.test.mjs](engine.test.mjs).

**Licencia verificable:** Fraunces, The Fraunces Project Authors, SIL OFL 1.1. Archivo oficial original `fonts/Fraunces-variable.ttf` (Git blob `8210f9488d3c732359a9292dd09aca3f2bae830e`), copyright y términos redistribuidos en [fonts/OFL.txt](fonts/OFL.txt). MAREAS no afirma ser autora del diseño de los glifos.

## Método y diferencia entre tandas

- NEW LAUNCH blob `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`; OLD LAUNCH blob `cd88a07941ab62072f6de5ee69764308f1ec2387`.
- W002/N04: Recursive por Google Fonts, cinco ejes, 14 pruebas lógicas y 8 DOM simuladas, interpolación real y screenshot no observados.
- W003/N04: recurso distinto (Fraunces real autohospedada); primera pieza en [FIRST_ARTICLE.html](FIRST_ARTICLE.html); cuatro ejes `wght 100–900`, `opsz 9–144`, `SOFT 0–100` y `WONK 0–1`. El texto, la coreografía y la composición son originales; el número de ejes no mide calidad.
- Book único: [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json). Trace real: [TRACE.json](TRACE.json). Flujo especializado auditoría W002: candidato no promovido.
- Referencias observadas (documentación pública): [Fraunces](https://github.com/undercasetype/Fraunces), [Dinamo Darkroom](https://dinamodarkroom.com/), [VarPlay](https://typedesign.fba.up.pt/varplay/), [OFL](https://github.com/google/fonts/blob/main/ofl/fraunces/OFL.txt).

## QA ejecutada

**28/28 PASS en V8**, evaluando el contenido completo del motor `engine.mjs` leído de GitHub: cuatro tags, ocho extremos, NaN, eje desconocido, `WONK` discreto, serializer CSS, rechazo de inyección, interpolación y frames, estado defensivo, pub/sub, sintaxis JS del sitio, cuatro sliders y outputs, referencias CSS/HTML, ausencia de autoplay, reduced-motion, `textContent`, secciones. Es una prueba de código y estructura, **no render ni calidad artística**.

## Pruebas que requieren navegador real

1. `document.fonts.load/check` y contraste de glifos en extremos de ejes;
2. capturas reales en **390 y 1440**, overflow en 320/390/1440 y accesibilidad teclado/tacto;
3. editar «Árbol & letra» y comprobar textContent en dos superficies;
4. reproducir, pausar, mover seek y activar prefers-reduced-motion;
5. comprobar HTTP de Pages y carga sin errores de binario, CSS y JS.

**Estado en este commit:** lógica OBSERVED_PASS; source IMPLEMENTED; first-article visual NOT_RUN; PUBLIC_BROWSER NOT_RUN; QUALITY_APPROVAL NO. Actualizar solo al conseguir nueva evidencia, no por el hecho de publicar.

**Defecto prevenido:** en W002 se podían mover cifras sin probar la tipografía real. En W003 se elimina dependencia CDN con un archivo variable auténtico; el gate browser sigue siendo obligatorio. La primera pantalla requiere inspección perceptual en 390/1440. No tocar obra anterior ni otros números.
