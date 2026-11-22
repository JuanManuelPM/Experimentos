# PULSO / Ciudad Vela

**Obra:** PROMETEO Web W001 · 06 · `web-w001-20261122-06`  
**Vista pública prevista:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/web/w001/06/

Tablero original de movilidad urbana con datos **totalmente sintéticos**. Ciudad Vela no es una ciudad real. Las cifras se calculan mediante una fórmula local determinista para 19 franjas horarias (05:00–23:00), según transporte, tipo de jornada y zona; no hay GPS, API, cookies, seguimiento ni solicitudes externas.

## Uso

Abrir `index.html`. Cambiar *medio de transporte* (todos, colectivo, metro, bicicleta), *tipo de jornada* y *sector*. Las métricas, la curva, el esquema, los corredores, el valor horario y la tabla se actualizan con los filtros. El botón **Descargar CSV** exporta las 19 filas del estado actual (UTF-8 con BOM). **Restablecer** vuelve a la configuración inicial. La tabla de datos de la curva está disponible en un panel desplegable accesible.

## Dirección artística y derechos

Se consideraron tres rutas conceptuales: (A) mapa geográfico, descartado por insinuar precisión geográfica falsa; (B) consola técnica densa, descartada por baja legibilidad móvil; (C) atlas editorial y diagrama topológico explícitamente inventado, elegida. Tipografía de sistema y Georgia, ilustraciones originales SVG creadas por código; no se incorporan imágenes, servicios ni librerías de terceros. Código y diseño creados específicamente para esta obra.

## Alcance de pruebas

Chromium headless, cargando el HTML con `page.set_content` (no visita HTTP): capturas de 1440, 768, 390 y 320 CSS px; sin overflow horizontal, errores de consola ni excepciones. Los tres filtros actualizan valores; slider horario y reseteo funcionan; CSV descargado tiene encabezado + 19 filas y conserva filtros; tabla con 19 filas; interacciones móviles verificadas en emulación. **No hay aprobación visual humana ni prueba en teléfono físico**. Ver `RECEIPT.json`.

## Fuentes de continuidad

- Lanzador: https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/web/LAUNCH.md
- Contrato universal: https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/UNIVERSAL.md
- Flujo Web V2, especificación (blob SHA `02f7b6161b50cd5bc6b342b84c969aaa36bac90a`): `JuanManuelPM/pruebas@candidate/prometeo-web-factory-engine-v2-20261117`, `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/web-design-studio/workflows/WEB_FACTORY_V2/FLOW.json`.

Esta entrega es una obra de prueba; no promueve un flujo compartido, ni altera otras obras, ROOT o el canon.
