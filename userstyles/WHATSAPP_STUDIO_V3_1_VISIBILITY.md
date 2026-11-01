# WhatsApp Studio 3.1 · Visibilidad antes que diseño

Problema observado por la persona usuaria: ventana Studio visible, pero contactos y conversaciones totalmente negros/invisibles. No se puede utilizar el chat.

## Causa probable encontrada en el código
Studio 3.0 dibujaba body::before con fondo opaco, z-index 2147481000 y pointer-events:none. Esto no afecta eventos, pero sí tapa visualmente los paneles de WhatsApp cuando #app crea un stacking context. Por eso los fixtures sencillos pasaron, aunque el WhatsApp real permanecía negro.

## Reparación
- Se elimina el overlay pseudo-elemento body::before y se usa fondo no superpuesto.
- La lista visible sigue siendo el DOM nativo de #side/#pane-side; #main y compositor siguen siendo nativos.
- Se verifica geometría, visibilidad CSS de nodos y antecesores, y el elemento al que corresponde el punto de pantalla (hit-test).
- Si no hay filas visibles, o el chat nativo queda tapado durante varios segundos, modo Studio falla de forma abierta: vuelve automáticamente a Original.
- Se mantiene el rollback a Studio 3.0 y los otros modos intactos.

## Evidencia
- Browser fixtures con #app {isolation:isolate}: prueba directa de visibilidad de filas y chat en Chrome y Firefox.
- Clic físico confiable isTrusted, conversación derecha, campo editable, drag y Original en pruebas automatizadas.
- Captura real de Firefox con datos ficticios comprobada visualmente.

## Pendiente
Sin acceso a la sesión privada de WhatsApp del usuario: apertura real y audio quedan NOT_RUN. No declarar listo hasta ver en esa sesión los nombres recientes y un chat real correctamente alineado. El primer criterio ya no es diseño sino visibilidad real.
