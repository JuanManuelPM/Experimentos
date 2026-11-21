# ARCHIVO DE LLUVIA · Caso 09

Vertical slice 3D original para **Estudio 3D · videojuegos 9**, ola 004. Una única sala de archivos bajo la lluvia, cinco pruebas inspeccionables, cuaderno persistente durante la partida, deducción con tres hipótesis y resolución espacial: la rejilla 04 se abre y la cinta debe recuperarse manualmente.

**Abrir:** `index.html` desde un servidor estático HTTPS. En GitHub Pages funciona en la ruta aislada. La librería Three.js se carga como ES module desde un CDN fijado en `0.161.0`; se necesita conexión la primera vez. La interfaz y todas las texturas, carteles, geometrías, escenas, texto y señales son obra original creada en este proyecto; no se usan modelos, fotos ni personajes ajenos.

**Controles:** arrastrar para girar la vista; scroll o gesto de pinza para zoom; tocar marcadores numerados y agregar las cinco pistas al cuaderno; seleccionar DEDUCIR; tras la solución correcta tocar la cinta dentro del armario. Los errores de hipótesis ofrecen contradicciones sin cerrar la partida. Atajos de teclado: flechas para cámara y Escape para cerrar paneles.

**QA preventivo de representación, antes de construir:**
- Ruta A: diorama WebGL 3D de geometrías originales + etiquetas procedurales + inspección por raycast (seleccionada por profundidad, causalidad mecánica y espacio realmente navegable).
- Ruta B: collage 2.5D multicapas de la misma estancia y hotspots con parallax (descartada porque una falsa profundidad dificultaría demostrar apertura real del escondite y exploración del espacio).
- Actor humano: NO_APLICA al brief. Evitamos un figurante final de primitivas. No se descargaron assets sin verificar sus licencias.

**Límites honestos:** test sintáctico de JavaScript y comprobaciones de enlaces de UI, sí; render real, visita táctil Android, auditoría estética y verificación CDN en un navegador conectado, NOT_RUN en esta ejecución. Una URL publicada es candidata, no una aprobación artística humana.

**Procedencia:** Three.js `0.161.0` (MIT; https://github.com/mrdoob/three.js/blob/master/LICENSE), módulos públicos CDN jsDelivr; fuentes web DM Sans y Space Grotesk (cargadas de Google Fonts, con alternativas locales del sistema). Código y assets de escena autoría original.

**Versión fijada:** método 2.3.0 SHA-256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`, validado contra `flow.json` descartando `sha256Canonical` antes de serialización ordenada. Brief literal SHA-256 `d0c61d671e12ae417da821a4280d6a63f2a033be0021bf75b3829ba7dc644704`.