# ROOT · PROMETEO · Entrada pública unificada v0.1
Una URL permanente para **lanzar, ver y revisar** producciones por tandas de diez: `https://juanmanuelpm.github.io/Experimentos/prometeo/root/`.

## Frontera de responsabilidades
**Raíz productiva** = método versionado, fijo durante cada ejecución y mejorado sólo entre tandas por CALIBRAR. Semillas = briefs que no cambian durante un experimento. Árbol = obra producida. Traza = elecciones reales de ejecución. **Raíz de presentación** = catálogo público y vistas reproducibles, no un segundo método de producción.

Este sitio sirve como punto de entrada único. Lee registros autorizados de producciones en `SOURCES.json`. Actualmente `3d-wave004`, que expone 3 series de 10. No importa código ni informes del repo privado; los otros estudios están vinculados a sus páginas públicas existentes y se incorporarán mediante nuevos manifiestos, no creando sitios nuevos.

## Circuito humano
1. Copiar prompt numerado y lanzarlo en un chat; puede ejecutar en paralelo.
2. Ver la producción publicada, si existe. Existencia de index.html no prueba calidad, arte, WebGL ni aprobación.
3. Elegir tanda en CALIBRAR, escribir diez observaciones y agregar capturas locales.
4. Descargar ZIP con `revision.json`, `RESUMEN.md`, capturas. Presentarlo al chat de gobierno Ideas para revisar la traza y proponer cambios al método compartido. **No hay escritura automática en GitHub privado desde esta página**.

## Privacidad
El portal es público. Nunca publicar ramas privadas, tokens, notas o archivos restringidos. Los comentarios se guardan por navegador usando localStorage y las imágenes por IndexedDB, si están disponibles; no se envían por red, pero podrían perderse al borrar datos locales. Exportar ZIP como copia. Las capturas pueden contener datos privados: no introducirlas en GitHub Pages.

## Mantenimiento y próximos estudios
La entrada `SOURCES.json` es el único índice de manifiestos públicos permitidos. Otros estudios publicarán su serie de 10 como registro compatible (wave, flow, tasks[número, series, title, projectId, briefSha256, publicPath, publicUrl]). Cada UI distinta reutiliza este índice, sin duplicar raíces ni versiones.

Este sitio **NO implementa aún un ejecutor universal recursivo** ni un planificador multiestudio. No sustituye el 3D Flow 2.3.0 ni las skills instaladas. En el futuro diez variantes visuales deben consumir EXACTAMENTE estos mismos datos, y ninguna escribir en otras ramas sin permiso.
