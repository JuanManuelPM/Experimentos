# W5 · Biblioteca · Obras verificables
Fecha: 2026-11-21. Trabajo 05, sobre el Estudio 3D existente, sin duplicar la galería W4.

## Qué hace
- Conserva los componentes HTML/CSS/JS de la biblioteca original, con rutas correctas para el preview aislado.
- Agrega las 30 entradas W4 según el manifiesto original y el árbol de archivos `gh-pages`.
- Estado de cada entrada: **HTML en Git**, **enlace de preview** y **render observado**, deliberadamente separados.
- Carga el registro público `REGISTRY.json`; no simula miniaturas ni aprobación. Las tarjetas sin captura tienen una cubierta neutral.
- 29/30 rutas de W4 con `index.html` constatado; falta `personajes/artesana-manos/v1/index.html`. 0 renders observados en este análisis.
- No se edita la biblioteca principal, la galería W4 ni el canon.

## Prueba y límites
La evidencia es el árbol Git de `gh-pages`, no una sesión visual real con Chromium/Android. La presencia de `index.html` no prueba interacción, render ni assets externos. Las URL públicas enlazadas se derivan de la ubicación en GitHub Pages, sin garantía de su estado al acceder. Sin screenshots válidas en los subárboles W4, no hay thumbnails.
El HTML del preview utiliza los estilos y comportamiento existentes, con cambios de rutas y enriquecimiento de los registros.
