# FORJA · Reentrada móvil UX · Candidata 2026-11-13

## Autoridad, alcance y base
- Dueño: **PROMETEO / Estudio 3D**. Este trabajo continúa el handoff `JuanManuelPM/pruebas/sistemas/metodo/one-shotting/HANDOFF_ESTUDIO_3D.md`, blob `a9a0c1fc37d72356d7e1143f24c41634eeac6bf4`, commit `2875cf25a2937b754ac06fdb54c1c8d48ad4abc1`.
- Fuente de FORJA: `JuanManuelPM/Experimentos`, `master` en `b8f68fe6eedd06729496c3b4efcc3166cf4bf56e`, y registro privado `forja-scene-composer-001.json` commit `4f3a7e9cfdee9bad303b530394ee2aa0dc7c69c6`.
- Rama exclusiva de reparación: `candidate/prometeo-forja-mobile-ux-reentry-20261113`.
- **No se tocaron `master`, `gh-pages`, el catálogo global, ATLAS ni los modelos de terceros.** Esta candidata no está desplegada en la URL pública.
- Referencias: `CASO_FORJA.md`, `WEB_INTERACTIVO.md`, `REENTRADA_DE_SUPERFICIES.md` de ONE-SHOTTING V1.2. La captura humana original sigue fuera del repo público.

## Problema observado
La captura del teléfono del usuario (863 × 1536 px físicos) mostró biblioteca, canvas estrecho e inspector simultáneos con letra y botones diminutos. El CSS original usaba `.workspace{grid-template-columns:300px minmax(0,1fr) 273px}` y dependía de `@media(max-width:800px)`. La causa exacta del viewport virtual sigue sin medición física. **Estado base: FAIL_USER_SCREENSHOT**. La versión antigua anunciada por HTTP 200 no demuestra UX.

## Decisiones y por qué
- **Alternativas consideradas:** solo elevar el breakpoint, cambiar a biblioteca-primero, o separar escena-primero de edición contextual. Elegida la tercera: corrige jerarquía y conserva capacidades.
- **Vista principal:** escena 3D ocupa el espacio disponible; biblioteca como drawer, inspector como sheet, tres acciones inferiores MODELOS/EDITAR/OBJETOS. Los paneles no aparecen simultáneamente.
- **Responsive reforzado:** clase `forja-compact` combinando ancho de viewport con pantalla táctil pequeña, para no confiar únicamente en un media query de CSS. Esto es heurístico, no prueba del modo "sitio de escritorio" del usuario.
- **Pantalla inicial:** primera visita sin proyecto persistido carga preset existente "Barrio nocturno". Escenas vacías guardadas siguen vacías a propósito. No se crea geometría sustituta.
- **Cámara:** encuadre por `Box3` del mundo existente con FOV/aspect ratio; en vista se ocultan grilla y transform gizmo; en edición vuelven.
- **Táctil/legibilidad:** botones de ~44-50 CSS px, inputs de 16 px, dos tarjetas por fila, overlays contextuales, cierre/Escape, `inert` y `aria-expanded`.
- **Fallback:** en entorno sin WebGL2 no se finge que se renderiza. Se informa la limitación y se ofrece la biblioteca.
- **Compatibilidad:** se mantiene `forge.mjs`, Three.js, 1.883 recursos lazy/pinned, JSON `prometeo.forja.scene/v1`, exportación GLB y atajos.

## Archivos modificados
- `index.html`: preflight de viewport compacto antes del CSS, stylesheet y script móviles.
- `forge-mobile.css`: canvas primero; sheet/drawer; responsive, contenido legible y targets.
- `forge-mobile.js`: control contextual y accesible, modo ver/editar, fallback GPU y diagnóstico `window.__FORJA_MOBILE__.diagnostic()`.
- `forge.mjs`: selección contextual, restauración de escena vacía, preset de entrada, cámara por bounds y modo vista.
- `README.md`: declaración de la candidata y sus límites.

## Pruebas realmente ejecutadas
| Capa | Resultado | Evidencia |
| --- | --- | --- |
| Fetch real GitHub y blobs | **PASS** | 5 fuentes recuperadas en rama candidata y SHAs anotados durante ejecución |
| Parse V8 de mobile, módulo existente sin imports y script inline | **PASS** | 3 análisis sintácticos en V8 |
| IDs únicos, imports/orden, CSS, asset preservation y reglas de interacción | **PASS** | 12 checks estructurales; total 15/15 |
| DOM simulado de navegación móvil | **PASS** | 8/8: orden de tabs, inert, drawer, sheet, exclusión, modo edit/view, retorno desktop |
| Chrome/Firefox real con viewport pequeño y screenshot de candidata | **NOT_RUN** | servicio de navegador remoto se quedó sin créditos; herramientas locales sin acceso de red a los archivos del repo |
| Android físico, vertical y horizontal + modo escritorio | **NOT_RUN** | no se posee sesión de navegador de ese dispositivo |
| WebGL2 render de Barrio, carga total y rendimiento | **NOT_RUN** | no se ejecutó una captura GPU de la nueva rama |
| Guardar/abrir JSON y exportar GLB end-to-end | **NOT_RUN** | funciones originales conservadas, pero no reensayadas en navegador |
| Aprobación estética humana | **NOT_RUN** | no confundir estructural PASS con revisión visual |

## Puerta de publicación y próximos controles
1. Ejecutar la candidata con navegador real a 320/360/390/480px, 800px y escritorio ancho; tomar capturas visuales y dimensiones `__FORJA_MOBILE__.diagnostic()` junto con `__FORJA__.diagnostic()`.
2. Reproducir el caso especial "sitio de escritorio" del teléfono; verificar tamaño de fuentes físico y acceso a los tres botones. Si falla, corregir clase/escala antes de publicar.
3. Cargar Barrio, seleccionar objeto por canvas, abrir/cerrar biblioteca, inspeccionar transformaciones, guardar y exportar. Revisar GLB y frame visual con GPU.
4. Evaluar si encuadre automático y escena por defecto funcionan en hardware limitado; si es costoso, usar un preset de entrada más ligero que conserve calidad.
5. Tras pruebas reales y autorización de release, integrar a `master` / `gh-pages` con rollback a `b8f68fe...`. **Hasta entonces el sitio público sigue siendo el anterior.**

## METHOD_DELTA · Candidato
Una obra web con motor 3D tiene dos superficies independientes: **presentación/UX** y **escena/render**. Una prueba de código de motor no reemplaza legibilidad móvil. En reparación, conservar activos y serialización, reemplazar solamente la composición y probarla sobre el dispositivo. Estado `METHOD_CANDIDATE_NOT_PROMOTED`, pendiente comparación visual real.