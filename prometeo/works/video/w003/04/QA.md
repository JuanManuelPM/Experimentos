# QA · UNA PALABRA CAMBIA TODO · W003-04
**Estado local:** `REAL_MP4_RENDERED_AND_PROBED`; **CI remoto:** `REAL_MP4_2_OF_2_REMOTE_READBACK_PASS`, GH Actions publicó H264/AAC y PNG auténticos con `QA_CI.json`; `HUMAN_APPROVED=NO`.

## Entregables observados localmente (22/11/2026)
| Master | Duración | Video | Audio | Tamaño | SHA-256 |
|---|---:|---|---|---:|---|
| 16:9 | 26.000s | 960×540 H264 24fps, 624 cuadros | AAC 44100 Hz, 2 canales, 1121 paquetes | 865575 bytes | `08e2b64cf967d6ff16676836e344425fd5facfc98d4a82a0f6c9219946d29369` |
| 9:16 | 26.000s | 540×960 H264 24fps, 624 cuadros | AAC 44100 Hz, 2 canales, 1121 paquetes | 805457 bytes | `03d88098b97911218701e969fcf717106c5fa9e38da43f6beafcc361d0bc96a7` |

Los hashes son de los archivos locales renderizados en esta conversación; un re-render remoto con otras fuentes/máquinas puede dar hash diferente aunque sea válido. Verificar CI y nueva lectura, no asumir igualdad binaria.

**Observación visual auténtica:** en el primer artículo, el signo «¿» invadía `TE ESPERO` en 9:16 (fotograma 282). Se corrigió el posicionamiento en coordenadas relativas y se repitieron 2×624 cuadros. Revisados locales: 1, 119, 282, 401, 542 por aspecto; los PNG no son mockups. Comprobado en fotograma vertical 282 que el signo ya no cruza letras y en 401 que el titular sigue intacto. Se conservaron ambas proporciones nativas, no cropping.

## Prueba comparativa de alcance
- W002 (recibo histórico): 23s 1280×720 y 720×1280; `NO PASA NADA` transformada por tres contextos; GitHub Actions reportado exitoso y dos MP4 en rama propia.
- W003: 26s 960×540 y 540×960; `TE ESPERO` en promesa/duda/amenaza; motor Canvas temporal reversible con slider + Web Audio, score procedural reproducible y MP4 locales comprobados. **Menor resolución que W002**, así que no afirmar aumento universal de calidad.
- Diferencia de procedimiento: primero frame representativo y test de 9:16, encontrar y corregir colisión de interrogación antes de cerrar masters. Validadores compartidos sin promoción de flujo especializado.

## Benchmarks, observado vs no observado
- Studio Dumbar/DEPT® [DEMO 2025](https://studiodumbar.com/work/demo-2025): inspeccionadas imágenes oficiales de lettering espacial y sistema de pantallas, leída la justificación de diseño y contraste sonoro. **Trailer completo NOT_RUN**. No se han copiado recursos.
- [Webby Crafted with Code / DEMO](https://www.webbyawards.com/crafted-with-code/demo/): declaraciones de autores leídas sobre letras responsive confinadas a marco. No se copió identidad.
- [Barbara Brownie, Royal College of Art](https://research.rca.ac.uk/en/publications/transforming-type-new-directions-in-kinetic-typography/): resumen leído sobre transformación tipográfica, **libro completo NOT_RUN**.

## Pruebas efectuadas
1. Decodificación/metadata FFprobe: **OBSERVED_PASS**, 2/2 MP4 H264/AAC 26s y dos stream indexes.
2. Render visual real vía Playwright Canvas `set_content` + FFmpeg: **OBSERVED_PASS**, 624+624 frames.
3. Primer artículo semántico: **OBSERVED_LOCAL**, capturas reales de muestra. Hubo defecto detectado y corregido.
4. Originalidad de fuentes/sonido: **SOURCE_OBSERVED**, partitura NumPy sin samples, fotografía ni videos ajenos.
5. Escucha perceptual independiente, legibilidad en teléfono físico, comprensión ciega de tres contextos: **NOT_RUN**.
6. Navegador con interacción de Play/Pause/seek y WebM MediaRecorder: **NOT_RUN** (motor de frames comprobado, controles no E2E).
7. URL GitHub Pages por HTTP: **NOT_VERIFIED** en este entorno.
8. Validación estructural equivalente en JavaScript, ejecutando la misma lógica de los validadores públicos contra el Book remoto: DEEP-SPEC-1 **READY_FOR_FIRST_SLICE** (0 errores) y ART-DIRECTION-1 **READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED** (0 errores). **CLI Node separado NOT_RUN**; estas etiquetas solo evalúan campos y estado declarado, no imagen/audio, licencia ni evaluación humana.
9. Binary GitHub readback: **OBSERVED_PASS** para 2/2 MP4 y frame vertical. Se cotejó SHA Git blob de los archivos; `QA_CI.json` publicado describe streams, tamaños y SHA256 remoto. El render remoto produjo hashes diferentes que los archivos locales, ambos masters fueron exportados independientemente.
10. HUMAN_APPROVED: **NO**.

**Evidencia GitHub Actions remota:** [QA_CI.json](QA_CI.json) reporta 26.000 s, H264/AAC, 624 frames 24fps por aspecto, 44.1 kHz estéreo y SHA256 propios: horizontal `dc603988740f37aae24b76888a3ffa4f6627b2367806a795ded5749783e1fd16`, vertical `20d79f732ffcff471d197cc47c3e3cc785c1a89e5e70701fed797edfdadfb85f`. Se abrió GitHub Contents de ambos binarios y se verificó el SHA de cada blob. El primer artículo se revisó localmente a 390 px y 1440 px a partir de PNG verdaderos publicados.

**Límite artístico:** calidad de la pieza no fue certificada por audiencia ni comparada en visionado integral con W002. Los hechos de codec, duración y layout no prueban el sentido emocional para un tercero.

## Licencias y reversión
Todo el material es original procedural. Se dibuja con fuentes de sistema/Inter si está instalada; no se redistribuyen tipografías. Ningún lanzamiento, archivo ni video de W001/W002 se modificó. `gh-pages` solo recibe la página nueva `prometeo/works/video/w003/04/index.html`; el trabajo pesado ocurre en rama candidata exclusiva. Rollback desindexando nueva ruta, sin tocar otras obras.
