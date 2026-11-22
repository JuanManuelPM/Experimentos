# PROMETEO · 3D W7 · 05 · Máquina de leva

**Tarea:** `3d-w7-20261122-05` · **Consigna literal:** [LAUNCH W7, nº 05](../../LAUNCH.md) · blob `58de659e2aa01c0746d59ca6f95c36bdc59f3030`. **Rama de producción:** `candidate/prometeo-3d-w7-20261122-05`.

## Abrir y manipular

- [Laboratorio principal 3D](index.html): orbitá la cámara, pausá, avanzá 15°, reiniciá, cambiá carrera/fase/RPM y descargá JSON, DXF o GLB.
- [Corte independiente del contacto](section.html): perfil exacto, rodillo, punto de tangencia, fuerza y fase; inspección SVG sin necesidad de GPU/WebGL ni CDN. `section.html` importa el mismo `mechanics.mjs` que el visor 3D.
- [Núcleo editable y reutilizable](mechanics.mjs) · [pruebas automáticas](test.mjs) · [preproducción y primer artículo](PREPRODUCTION.deep-spec-v1.json) · [evidencia y límites](QA_RECEIPT.json).

El visor Three.js 0.170 requiere acceso a jsDelivr y WebGL; abrilo servido por HTTP, por ejemplo `python -m http.server 8000`, desde el directorio de la obra. `node test.mjs` permite reproducir las comprobaciones matemáticas.

## Método y decisiones tempranas

Se recuperó el núcleo cinemático W6, que calculaba la envolvente conjugada de la leva, la trayectoria del rodillo y una ley de alzada 4-5-6-7. **No se presenta la reutilización de ese código como innovación W7.** La diferencia concreta es el nuevo **primer artículo SVG** para inspección de contacto antes de dar por válido el ensamblaje visual, una mejora del diagnóstico de muestreo, DXF con `$INSUNITS=4` (milímetros) y exportación GLB que **intenta reimportar y comparar número de mallas/cotas** antes de habilitar la descarga.

Dos familias de representación consideradas: (a) Three.js paramétrico + sección SVG independiente, elegido por verificabilidad de una máquina geométrica; (b) sólido CAD autoral exportado a GLB con encastres contrastados, alternativa si el acabado visual de la familia (a) no supera la inspección. En un mecanismo, usar cilindros para ejes y un perfil extruido no constituye por sí solo un atajo inadecuado: hay que probar sus dimensiones y relaciones.

Fuentes técnicas observadas para método, sin copiar assets: [CMU, cams](https://www.cs.cmu.edu/~rapidproto/mechanisms/chpt6.html), [RoyMech, cams](https://www.roymech.co.uk/Useful_Tables/Cams_Springs/Cams.html), [Cam Design](https://lu.ca/calc/cam/), [Three.js](https://threejs.org/docs/pages/GLTFExporter.html). Todas las mallas y el trazado son programados de forma original para PROMETEO; Three.js usa licencia MIT.

## Geometría, unidades y límites

Las medidas internas son **mm**, los ángulos **radianes** (o grados en la UI), las fuerzas ideales **N**. Leva, eje, polea y transmisión comparten una fase angular; el seguidor está restringido a la guía vertical y toca el perfil corregido por el radio del rodillo. La correa representa una transmisión cinemática plana 1:1, **no un solver con tracción, flexión, holgura o patinaje**. El modelo no certifica tolerancias industriales, fricción, tensiones Hertz, fatiga, materiales ni manufacturabilidad definitiva. El GLB contiene mallas, **no** juntas CAD dinámicas.

## Comparación honesta con W6

| Aspecto | W6 | W7 |
| --- | --- | --- |
| Ley 4-5-6-7, leva conjugada, 360° | Implementada | Núcleo matemático reutilizado; prueba V8 de 720 fases repetida |
| Vista del contacto independiente de WebGL | No | SVG interactivo original, primer artículo ejecutado localmente en 390/1440 |
| DXF unidades explícitas | No | Cabecera de unidades mm |
| GLB verificado tras exportar | No | Guard de reimportación agregado, **ejecución real NOT_RUN** |
| QA de geometría / variantes | 720 fases / 24 variantes | Repetido 720 fases / 24 variantes PASS en V8 |
| 3D GPU, Android, exportación externa | NOT_RUN | **NOT_RUN** |

**Captura de obra 3D renderizada y aprobada:** NOT_RUN. Capturas del **primer artículo de sección**, no de la escena 3D, fueron realizadas localmente en Chromium 390×844 y 1440×900; esas capturas se entregaron en el chat y no se sustituyen con URLs ficticias. GitHub readback de fuente ≠ prueba de WebGL.

**Flujo fijado:** especialidad 3D 2.3.0, SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`; QBAR-1 + DEEP-SPEC-1 + FIRST-ARTICLE-1, integrados en una sola ficha. La auditoría 3D W6 es candidata no promovida. `HUMAN_APPROVED=NO`.

## Recuperación y continuidad

Si falla el render 3D, la sección SVG permite inspeccionar el mismo mecanismo sin reemplazarlo por un render inventado. La ruta W6 `prometeo/launch/20261122/next/3d/works/05-maquina-de-leva/` permanece intacta. No se cambiaron los otros nueve trabajos ni el flujo universal.