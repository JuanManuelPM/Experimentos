# CONTRAPUNTO · Edición 01

**Identidad:** `room=web` · `batchId=web-w002-20261122` · `taskNumber=7` · `taskId=web-w002-20261122-07`.

Revista editorial original con seis publicaciones escritas, seis URL directas, estilos de lectura diferenciados, búsqueda acentuación-insensible, navegación temática y un especial fotográfico con pestañas accesibles. Publicación estática: no hay analítica, cuentas, pagos ni servicios propios.

## Apertura

Abrir `index.html` en un servidor estático o alojar este directorio en GitHub Pages. Las rutas de artículos son `historias/<slug>.html`. Sin JavaScript el contenido editorial sigue disponible y los filtros dejan de operar; no hay contenido oculto detrás de una API.

## Compilación y componentes reutilizables

- `tools/build.py`: contenido de la edición y compilador estático de ocho páginas; ejecutar `python tools/build.py`.
- `design-system.css`: tokens de color, jerarquía, retícula, tipografía, estados de foco, formatos por género, breakpoints y reduced motion.
- `editorial.js`: `filterArchive`, `createArchiveSearch`, `createVisualTabs`; sin framework ni dependencias.
- `issue.json`: índice estructurado exportable para futuras ediciones.
- `assets/*.webp`: serie visual **generada originalmente para el encargo**, concebida como ficción visual, no fotografía documental.

Tipografías **Instrument Serif** y **DM Sans** solicitadas a Google Fonts bajo sus licencias OFL; hay alternativas locales. No se redistribuyen los archivos de fuentes. Imagen original, sin assets ajenos. Los textos de la entrevista y crónica se identifican como ficción.

## Pruebas y límites

`tools/check.py` verifica enlaces, imágenes, semántica estática y datos. `QA.md` registra pruebas reales de navegador o indica explícitamente su ausencia. Ninguna prueba automática equivale a aprobación estética o WCAG completa.

## Fuentes de inspiración, no assets ni copias

- The Pudding, https://pudding.cool/: distinción entre ensayos visuales y lectura narrativa.
- It’s Nice That, https://www.itsnicethat.com/: archivo editorial con diversidad de temas y piezas.
- A List Apart, https://alistapart.com/: tradición de lectura accesible y estructura semántica.
- GOV.UK Design System, https://design-system.service.gov.uk/: patrones de estados y navegación, sin adoptar su estética.

Criterio de producción: identidad propia, voz editorial coherente, géneros tipográficamente distintos, interfaz no intrusiva y lectura primero. El sitio no reclama conformidad WCAG certificada, mérito premiado ni aprobación humana.