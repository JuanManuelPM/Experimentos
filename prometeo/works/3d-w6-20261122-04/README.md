# LA DESPEDIDA · PROMETEO 3D · W6 / 04

**Identidad:** `room=3d` · `batchId=3d-w6-20261122` · `taskNumber=4` · `taskId=3d-w6-20261122-04`.

**Idea dramática:** dos figuras a la intemperie en un muelle nocturno deben decidir qué hacer con la última luz que las une. No se simula actuación realista humana. Se propone un lenguaje teatral original, con mallas de ropa de silueta tallada, rostros intencionalmente estilizados, iluminación narrativa y gestos mínimos.

## Abrir y dirigir

Abrí `index.html` con un servidor HTTP o la URL pública de GitHub Pages. No abrir por `file://`, porque la línea de tiempo se importa mediante `fetch()`.

- **Reproducir / pausa / inicio:** lectura determinista de la secuencia de 26 segundos.
- **Scrub:** mover cabezal, saltar entre cinco planos, seleccionar uno y editar la duración.
- **Cámara:** desplazamiento inicial/final en metros y campo de visión de cada plano.
- **Actuación:** extensión de mano de Vera y Noé por plano; cabeza, torso y desplazamiento ya están animados en JSON, también editables manualmente allí.
- **Luz:** modificar intensidad del farol por plano; las sombras corresponden a materiales de la escena.
- **Importar/exportar JSON:** una misma fuente de verdad para cuadro, luz, gesto, subtítulos y reproducción. Los cambios de duración desplazan los cortes posteriores sin dejar huecos.
- **Exportar video con audio:** prueba `MediaRecorder` y `HTMLCanvasElement.captureStream`, mezcla banda sonora original con `AudioContext.createMediaStreamDestination`, produce un archivo únicamente cuando el navegador devuelve bytes. Prefiere `WebM`, usa `MP4` solo si `isTypeSupported` devuelve verdadero. Nunca se ofrece MP4 por cambiar la extensión.

## Archivos fuente

| Archivo | Función |
|---|---|
| `index.html` | Visualizador, diseño responsive y panel de dirección |
| `main.js` | Escenario Three.js original, mallas/rigs, UI, cámara y grabación |
| `sound.mjs` | Paisaje sonoro sintetizado original, bus de salida y grabación |
| `sequencer.mjs` | **Componente reutilizable**, sin Three.js: cortes contiguos, evaluación de keyframes, retemporización, validación y comparación de cuadros |
| `timeline.json` | Escena editable con cinco planos, cámaras, luces, actuación y subtítulos |
| `test-sequencer.mjs` | Pruebas Node sin dependencias sobre la reproducción lógica |
| `PREPRODUCTION.deep-spec-v1.json` | Decisiones, fuentes observadas, riesgos y criterios de aceptación |
| `QA.md` | Evidencia y límites: implementación no equivale a verificación visual |

## Convenciones cinematográficas y temporales

- Sistema de coordenadas: metros; `+Y` arriba, cámara frontal en `+Z`. Alturas de personajes aproximadas 1,9 m.
- Plano: intervalo `[start,end)` salvo el último, que incluye el final. Duración inicial 26 s. Cada keyframe interpola suavemente desde la pose `from` hasta `to`.
- **Una sola función:** `evaluateTimeline(t, film)` calcula encuadre, objetivo, FOV, intensidad, actuación y texto. La usan preview, pausa, scrub y captura. No hay reloj separado para exportar ni keyframes de demostración que no afecten la escena.
- Archivo serializado en JSON simple; no depende de una suscripción, de cuentas ni de un servidor de sesión.
- La grabación audiovisual en tiempo real puede variar algunos frames según la carga del dispositivo. El estado visual a un tiempo `t` sí es idéntico; la duración física del archivo necesita auditoría con el navegador/reproductor real.

## Comprobaciones

```bash
node test-sequencer.mjs
```

Verificaciones adicionales necesarias en navegador: WebGL efectivo, perfil móvil, respuesta de cada control, exportación con sonido, duración del archivo y reproducción, orientación de miradas, articulación y legibilidad. Ver `QA.md` para estados honestos.

## Fuentes y derechos

El guion, los personajes, la composición de escena, los shaders/materiales procedurales y la banda sonora de este trabajo fueron creados para el encargo. No se redistribuyen imágenes, modelos, voz ni música de referencia. Three.js se carga desde CDN con versión fijada `0.170.0`; los referentes Blender Studio *Spring* y Theatre.js informan la dirección y el editor, no son assets incorporados.

**Límite:** no hay un archivo MP4 preexistente en el repositorio. La exportación es una función real de la aplicación, condicionada por las APIs soportadas; no se certifica la percepción cinematográfica sin observar los fotogramas y el sonido reales.

**Fijaciones de producción:** LAUNCH blob `942c3ba8b851137886e959d2790771556e2d9f5d`; QBAR-1; DEEP-SPEC-1; 3D Flow `2.3.0` SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.
