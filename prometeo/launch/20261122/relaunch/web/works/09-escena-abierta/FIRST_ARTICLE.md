# ESCENA ABIERTA · primer artículo preventivo

Estado: **OBSERVED_LOCAL_PROTOTYPE**, no prueba E2E del producto final.

Antes de escalar se escribió un HTML pequeño de la portada y una sola actividad con botón guardar. Chromium local `page.set_content` generó capturas reales en **390×844** y **1440×900** con altura completa. Observación manual: la composición azul/lima, título y tarjeta resultaron legibles. `document.documentElement.scrollWidth>innerWidth`: `false` en ambos. Clic en `+ Mi agenda`: cambió a `✓ En agenda` y actualizó `role=status` con `Agenda actualizada` en ambos viewports.

Capturas raster generadas **solo en el entorno de ejecución local** (`escena-first-article-390.png`, `escena-first-article-1440.png`), no incorporadas a GitHub; por ello el estado remoto sigue **FIRST_FRAME_CAPTURE_REQUIRED**, no se afirma screenshot de URL pública. La primera pieza tampoco decodificó fotos externas; empleó gradiente de composición para explorar jerarquía y contraste. El HTML final usa una foto real acreditada distinta de esa textura. La continuación requiere screenshot y prueba funcional del sitio final, no basta el prototipo.

La dirección cambió respecto a W002: identidad tipográfica protagonista, foto explícitamente ambiental (no retrato atribuido a actos), grilla de 21 actividades y esquema de datos nuevo. No confundir mayor volumen de componentes con calidad demostrada.
