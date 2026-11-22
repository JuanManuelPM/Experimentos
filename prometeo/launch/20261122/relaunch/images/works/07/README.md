# EL BOSQUE RESPIRA · W003 · Images 07

**taskId:** `images-w003-20261122-07` · **LAUNCH SHA:** `a97b91ca103847ea75eeb9d1d2af10b6c9c0dddd` · **W002 brief SHA:** `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`

## Obra

Se generó un raster maestro original de 1536×1024 píxeles, una panorámica de 1536×768 y dos detalles nativos de 940×610 y 646×874. Los tres derivados provienen de **una misma imagen** y se comprobaron con prueba de píxeles idénticos. No son tres cámaras independientes. Los PNG finales y el sitio HTML están disponibles en el ZIP adjunto al chat de producción; **no se subieron al repositorio** porque esta integración no permite transferir bytes locales como Git blobs.

## Primer artículo, representación y falla observada

La primera generación conservó suelo, agua, corteza húmeda y un eje luminoso desde la derecha. Dos intentos posteriores de generar detalles independientes derivaron a afiches ajenos al bosque. **Descartados.** Se cambió a recortes nativos con ventanas, hashes y canon de escenario en vez de fingir nuevas tomas. Una mejora en trazabilidad **no** certifica calidad artística superior.

## Entregables y estado

- Raster PNG original y derivados: `LOCAL_DELIVERED`, comprobados con Pillow, `REMOTE_NOT_PUBLISHED`.
- Galería HTML sin UI sobre la escena: `LOCAL_CREATED`.
- Pruebas de bytes: `PASS`. Continuidad entre *crops*: `PASS_SOURCE_ONLY`.
- Aperturas 390 y 1440: `PIL_SIMULATION_OBSERVED`; Playwright real: `NOT_RUN_BLOCKED_BY_ADMINISTRATOR`.
- QA botánica independiente, lectura HTTP Pages, evaluación artística ciega: `NOT_RUN`.
- `HUMAN_APPROVED=NO`.

[QA](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w003-20261122-07/prometeo/launch/20261122/relaunch/images/works/07/QA.md) · [Book de decisiones](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w003-20261122-07/prometeo/launch/20261122/relaunch/images/works/07/PREPRODUCTION.deep-spec-v1.json) · [Atlas de especie y atmósfera](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w003-20261122-07/prometeo/launch/20261122/relaunch/images/works/07/CANON_ATMOSFERA.md) · [Assets y estado](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w003-20261122-07/prometeo/launch/20261122/relaunch/images/works/07/ASSETS.json) · [Trace](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w003-20261122-07/prometeo/launch/20261122/relaunch/images/works/07/TRACE.json)

La rama exclusiva contiene documentación pública segura. No se sobreescribieron obras anteriores ni se promocionó flujo privado.