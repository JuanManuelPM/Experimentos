# QA · W003/10
## Casos preventivos
1. SEMANTIC_LOCK: lugar/acción/hombre/mujer/álbum/arcos/árbol/banco/cuerda/agua.
2. NO_FAKE_SECOND_STYLE: segundo arte desde paths propios, no filtro cromático.
3. NO_UPSCALE: decodificación RGB 1536×1024 original, hashes distintos.
4. FIRST_FRAME: 390 y 1440 por navegador real; no confundir tests sintéticos con screenshot.

## Evidencia de obra
- `01_fotografia_editorial_sintetica.png`, PNG RGB 1536×1024, SHA256 `0ee5783a29f5...` (SHA completo en ZIP/manifest local).
- `02_ilustracion_grafica.png`, PNG RGB 1536×1024, SHA256 `e391b42dc40e293103a129629949e1832a74f334db2a223beefb8b330ef390ef`.
- Comparación A/B local, arte final y SVG fuente/JS comparador incluidos en ZIP de conversación; falta publicación binaria remota.
- **OBSERVED** visual en sesión: A refleja escena ficticia realista, B ilustración tinta original con álbum, arcos, árbol, banco y personajes.
- **FAILED/DESCARTADO**: dos outputs generativos de B eran afiches PROMETEO fuera de tema. SWITCH_REPRESENTATION observado al pasar a dibujo SVG manual.
- **NOT_RUN**: captura browser 390/1440. Chromium `ERR_BLOCKED_BY_ADMINISTRATOR` para `file:///...` y localhost. No falsear viewport observability.
- **NOT_RUN**: recepción ciega externa, Android real, comprobación pública de bytes y licencia independiente.
- **HUMAN_APPROVED=NO**.

## Lecciones y diferencia W002
W002/10 tenía dos raster en chat pero no en GitHub; B tenía arcos parcialmente tapados y los primeros afiches fuera de tema. W003/10 predefine canon semántico y hace cambio de **familia de representación** tras un fallo observado. Se mantuvieron todos los arcos expuestos en B y arte en la ubicación original. Sin evaluación humana ciega ni contraste pixel a pixel independiente, no declarar mejora causal ni calidad profesional.

**stage:** diseño del segundo lenguaje; **cause:** generador automático devuelve otras obras PROMETEO; **preventive_gate:** semántica y anclas antes de acabado; **test:** B contiene los ocho motivos; **owner:** Images; **counterexample:** afiche elegante de PROMETEO no es plaza inundada.
