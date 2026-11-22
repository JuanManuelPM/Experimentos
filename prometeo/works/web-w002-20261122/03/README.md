# ARCHIVO ABIERTO · WEB W002 #03

**Obra:** [Abrir archivo](https://juanmanuelpm.github.io/Experimentos/prometeo/works/web-w002-20261122/03/) · [Código fuente](https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/works/web-w002-20261122/03)

**Identidad:** `batchId=web-w002-20261122`, `taskNumber=3`, `taskId=web-w002-20261122-03`. Lanzador fijado: `cd88a07941ab62072f6de5ee69764308f1ec2387`.

## Obra entregada

Portfolio editorial en español de **Iria Sola**, artista declaradamente ficticia. Incluye ocho imágenes originales vectoriales de 3000 × 3800 px nominales, fichas y procedencia de cada obra, clasificación Materia/Papel/Luz/Sombra, búsqueda, URLs compartibles individuales, descarga SVG y visor de zoom escalonado hasta 600%, drag/pinch/wheel/teclado, controles de reinicio y Escape. Se usa HTML/CSS/JavaScript sin framework; tipografía remota con alternativas estándar. No hay pagos, backend ni formularios de datos privados.

- **`index.html`**: sitio editorial adaptable de 320 px a escritorio, catálogo, fichas y enlace directo `?obra=<slug>`.
- **`artworks.mjs`**: metadatos estructurados, procedencia y generador reproducible de ocho composiciones visuales SVG originales.
- **`viewer.mjs`**: componente independiente `ArchiveViewer(root, image, onChange)`, que admite fuentes SVG/JPEG/PNG/WebP con zoom limitado, pan y teclado.
- **`PREPRODUCTION.deep-spec-v1.json`**: preguntas de impacto, referencias, decisiones y riesgos (solo rama dueña).
- **`QA.md`**: pruebas observadas y pendientes, límites, brecha frente a referencias.

## Autoría y material

Todos los personajes, biografía implícita, años de creación y datos de inventario son **ficción editorial**. Las ocho piezas visuales son composiciones digitales generadas específicamente por el código incluido, no fotografías, pinturas físicas ni obras externas atribuidas a otra persona. Los tamaños 3000 × 3800 son el tamaño declarado del SVG, escalable; no representan una medición de píxeles fotográficos. Las páginas de Rijksmuseum, Art Institute of Chicago y OpenSeadragon se estudiaron como **referencias de capacidad**; ningún contenido visual suyo se incorpora ni se reclama su licencia.

## Ejecución y prueba

Servir la carpeta con servidor estático, por ejemplo `python -m http.server 8000`, y abrir `http://localhost:8000/` (se requieren imports ES Modules). Abrir `?obra=casi-agua` para probar la ruta directa. En el visor: pellizcar, arrastrar, usar rueda, +/-/0 y flechas cuando la imagen tiene foco. `Esc` cierra la ficha y devuelve foco al catálogo. `prefers-reduced-motion:reduce` desactiva transiciones decorativas.

**Estado de calidad:** publicado en rama y directorio Pages; ver `QA.md` para límites de inspección remota. No es aprobación humana ni se acredita igualdad con los museos de referencia.
