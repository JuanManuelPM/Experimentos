# Cocina Umbría 001 · W5-01 · Cámara y uso

**Origen:** `Experimentos@gh-pages:prometeo/cocina-umbria-001/`, fuente del 16/11. **Aislamiento:** `candidate/3d-w5-cocina-camera-20261121`, directorio `prometeo/previews/w5/cocina-camera/v1/`. Original intacto.

## Prevención y elección
- Riesgo observado en código: cámara inicial en `x=5.35`, muro derecho opaco en `x=4.36`, susceptible de bloquear la composición. No hay una captura WebGL de aquel resultado que permita declararlo como fallo visual confirmado.
- Alternativa descartada: borrar u ocultar el muro o sustituir modelos. Solución elegida: acercamiento desde abertura frontal, órbita restringida y focalización opcional de actor.
- Persona y mobiliario reales: `Soldier.glb` con Idle/Walk y mobiliario Kenney CC0, mismos commits/CDN; los recursos y las animaciones no fueron alterados, empaquetados ni reemplazados.

## Funcionalidad producida
- Cámara general frontal, encuadre adaptado en portrait (56°) y horizontal (50°). En teléfono prioriza actor y área de trabajo, no fingir que cabe el mundo completo.
- Órbita un dedo; pinch y rotación con dos dedos (`DOLLY_ROTATE`); pan desactivado para evitar perder la escena; zoom de 4.2 a 13.5 m; azimut limitado a [-0.26,0.32] y elevación polar [0.72,1.48].
- Botón ◎ alterna seguimiento del personaje; ◉ devuelve vista general; ⌖ recentra. Objetivo y cámara se trasladan juntos al seguir el actor real.
- `__PROMETEO_QA__()` registra `camera.viewport`, `camera.gestureStarts`, `camera.pinchStarts`, `camera.changes`, `camera.lastDistance` y `camera.mode`. Los contadores solo registran eventos, no prueban que un gesto sea agradable ni visible.

## Comprobaciones y límites
- **PASS:** parseo V8 del módulo con las declaraciones `import` excluidas, con el resto de código fuente intacto; comprobación de restricciones horizontales contra paredes a radio máximo; presencia de GLB y secuencia de animación original; HTML y módulo en rama candidata re-leídos.
- **NOT_RUN:** ejecutar `node --test camera.test.mjs` sobre contenido publicado, navegador real con WebGL, captura, dispositivos Android, pinch físico, evaluación artística humana.
- Captura remota intentada, pero servicio conectado sin créditos. No se inventa imagen ni aprobación artística.

## Continuidad
- Publicación aislada: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/cocina-camera/v1/
- Fuente original: https://juanmanuelpm.github.io/Experimentos/prometeo/cocina-umbria-001/
- Los cambios se limitan a cámara, gestos y un control contextual. Ni FORJA ni el motor común fueron modificados.
