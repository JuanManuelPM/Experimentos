# PROMETEO · 3D · Contrato de entrega web portátil

La estación de servicio de la Ola 001 falla en el navegador del usuario, mientras otras escenas cargan. No se dispone de logs del dispositivo, así que **la causa exacta sigue sin confirmarse**. En su `index.html` sí existe un riesgo verificable: única ruta de arranque mediante `DecompressionStream('gzip')` → `fetch('./scene.mjs.gz')` → `Blob URL` → `import(moduleURL)`. El mensaje de error genérico atribuye cualquier excepción a WebGL2, aunque el fallo también podría ser de `fetch`, descompresión o importación.

## Reglas universales de arquitectura (WEB0)
1. Publicar `index.html` + módulos `.mjs` normales en árbol reproducible; comprimir para transporte/caché con HTTP/CDN si corresponde, pero nunca depender de `DecompressionStream` como **único camino** para boot. Evitar convertir fuente ES en módulos `Blob` por defecto, especialmente si necesita rutas relativas.
2. En el propio navegador detectar soporte con `canvas.getContext('webgl2')`, `webgl` cuando la escena pueda adaptarse, y consultar capacidades requeridas antes de inicializar shaders. WebGL2 y WebGL1 tienen requisitos de shader distintos: fallback honesto, no promesa de compatibilidad falsa.
3. Distinguir fases y errores: `NETWORK_FETCH`, `DECOMPRESSION`, `MODULE_IMPORT`, `WEBGL_CONTEXT`, `SHADER_COMPILE`, `ASSET_LOAD`, `RUNTIME`. Registrar etapa, error y si cargaron assets sin exponer información privada. No poner siempre «tu navegador no soporta WebGL».
4. En `webglcontextlost`, detener el render y recuperar recursos o presentar diagnóstico contextualizado. En su ausencia, una imagen estática/video genuinos del mismo proyecto o Canvas2D declarado **fallback 2D**, como hizo Arcade. Nunca afirmar que una imagen 2D es un render 3D.
5. La obra **siempre se produce completa** aunque WebGL no esté disponible en el entorno de trabajo. Falta de QA física = `NOT_RUN` en prueba, NO permiso de producir un canario.
6. `browser-check.mjs` detecta vulnerabilidades estáticas y sugiere cambios arquitectónicos *antes* de producir. No ejecuta GPU ni identifica por sí solo cuál fue el error del teléfono. `WEB0` es no bloqueante; QA de navegador real se hace cuando haya dispositivo accesible.

Referencia técnica: MDN `HTMLCanvasElement.getContext`, `webglcontextcreationerror`, especificación Khronos WebGL sobre pérdida de contexto.
