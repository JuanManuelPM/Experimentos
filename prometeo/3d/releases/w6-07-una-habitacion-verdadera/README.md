# PROMETEO · W6 / 3D / 07 · Una habitación verdadera

**Tipo:** visor documental de un interior fotogramétrico real + componente reutilizable de comparación.
**Estado:** PARTIAL_DELIVERY / VISUAL_NOT_RUN / NO HUMAN_APPROVAL.

La obra usa un mesh existente realizado por UoM Digitisation Centre a partir de fotografía real. **No es reconstrucción propia ni Gauss splatting**. No se generó ni se fingió un GLB. Se eligió deliberadamente esta vía antes que dibujar una habitación falsa.

- Web: https://juanmanuelpm.github.io/Experimentos/prometeo/3d/releases/w6-07-una-habitacion-verdadera/
- Modelo fuente: https://sketchfab.com/3d-models/draft-la-trobe-reading-room-slv-081ac34de8dd42bd80ac452607578538
- Código principal: `index.html`
- Componente reutilizable: `photo-view-aligner.js`. En otros visores basta alimentar `setPhoto`, `setCamera`, `addPoint` y exportar `toJSON()`; no depende de Sketchfab.
- Diseño y decisiones: `PREPRODUCTION.deep-spec-v1.json`
- Evidencia, límites y procedencia: `QA.md`, `CREDITS.md`

## Uso
1. Navegar la captura en el visor 3D integrado. Las vistas y controles de cámara dependen del proveedor original.
2. Seleccionar una de las fotografías reales del mismo interior, pero de distinta sesión de captura.
3. Ajustar la cámara manualmente y pulsar **Capturar vista actual** para obtener la imagen de la cámara 3D mediante la API.
4. Hacer clic en un hito de la **foto** y luego en el hito equivalente de la **captura**. Completar varios pares.
5. Exportar JSON con foto/autor/licencia, pose manual, hitos y RMSE normalizado. **No mide distancia real ni calibra la cámara automáticamente**.

## Límites no negociables
La comparación **no** prueba exactitud geométrica y el escaneo no fue procesado nuevamente por esta ejecución. La licencia **NoComercial** del activo y el hosting externo son restricciones de uso. Ante fallo del embed o API, queda el enlace a la captura fuente y la comparación se detiene, nunca se sustituye silenciosamente con CGI.
