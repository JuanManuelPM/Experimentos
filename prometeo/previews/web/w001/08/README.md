# LAS HORAS QUIETAS · WEB W001/08

Obra de relato visual ficticio sobre un faro nocturno. Cinco capítulos evolucionan desde la última luz de la tarde hasta el alba. El paisaje se dibuja con SVG/CSS original sin depender de bibliotecas, fotos o recursos privados.

## Recorrido y controles
- Anterior / siguiente; selección directa por cinco marcadores.
- Teclado: izquierda/derecha. Pantalla táctil: deslizar horizontalmente fuera de botones.
- Reproducir / Pausar: avance real de 10,5 segundos por escena; se detiene al llegar al final o al cambiar de pestaña y reanuda al volver si estaba activado.
- Luz encendida / apagada: modifica el haz, halo y foco dibujados.
- Enlace profundo: `#escena-N`, N de 1 a 5; conserva la escena actual en la URL.
- `prefers-reduced-motion`: elimina movimiento y transiciones innecesarias.

## Dirección de arte
**Marina editorial nocturna.** Faro dibujado en SVG y situado en un extremo del paisaje. Tipografía serif de gran tamaño y pequeños rótulos de bitácora; cinco estados de luz, niebla, tormenta, respuesta distante y amanecer. Sin fotografías externas.

## Alcance y QA
HTML autocontenido en `index.html`, válido para GitHub Pages. Se comprobaron 15 contratos estáticos, incluido parseo JavaScript y consistencia de los blobs public/candidate. **No se realizó screenshot de navegador ni evaluación visual en móvil físico.** El navegador remoto consultado no pudo cargar la página; una petición externa devolvió 503, que no demuestra por sí sola caída del alojamiento. No etiquetar este resultado BROWSER_VERIFIED ni HUMAN_APPROVED.

Recibo legible por máquinas: [RECEIPT.json](RECEIPT.json).
