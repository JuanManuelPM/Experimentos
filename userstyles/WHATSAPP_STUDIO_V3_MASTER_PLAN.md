# WhatsApp Studio 3.0 · Índice, planificación y aceptación

Fecha: 2026-11-01. Meta: ventana diseñada y movible, contactos **nativos** al lado izquierdo y conversación **nativa** a la derecha, sin enviar eventos sintéticos y sin reemplazar el motor de WhatsApp.

## Índice de trabajo y estado
| Capítulo | Objetivo y decisión | Evidencia |
|---|---|---|
| 00 · Experiencia | Una ventana unificada, con columna de contactos y chat al seleccionar | Prototipo visual en Chrome de fixture |
| 01 · Investigación | IDs estables #side, #pane-side, #main; no depender de clases obfuscadas; `.click()` no es clic real | MDN isTrusted y extensión de WhatsApp con panel nativo |
| **02 · PLANIFICACIÓN** | Diseño por capas, límites de React, fallback, métricas, criterio de éxito | Seis decisiones abajo |
| 03 · Causa raíz | La copia de contactos v2 impedía el clic físico en los nodos nativos y verificaba apertura con heurísticas | Auditoría de v2.1 |
| 04 · Prueba decisiva | El contacto visible es la fila original y el clic no se intercepta | Chromium WebDriver real `isTrusted=true` / Firefox a verificar |
| 05 · Contactos | #side y #pane-side reales, sin modificar el DOM de React ni extraer mensajes | DOM fixture + navegador |
| 06 · Conversación | #main original al lado derecho, editor conservado | Chromium navegador con editor escribible |
| 07 · Funciones | Escritura en editor real; audios, adjuntos, envío/recepción no simulados | Escritura PASS en fixture; resto NOT_RUN en WhatsApp autenticado |
| 08 · Ventanas | Drag y resize CSS, layout guardado con GM_setValue | Chromium drag + restauración |
| 09 · Diseño | Azul petróleo, tipografía propia y columnas redondeadas | Captura de prueba de Chrome |
| 10 · Personalización | Botón ◐ y Original/Radical preservados | Original PASS en fixture |
| 11 · Regresión | DOM + navegador real Chrome y Firefox | CI y capturas por versión |
| 12 · Entrega | Publicación separada hasta pruebas, vuelta a Original segura | Se publicará con matriz de estados |

## 02 · Planificación detallada (resuelta)

### 2.1 Arquitectura
CSS fija #side y #main en el viewport y les asigna coordenadas compartidas. La lista real sigue siendo interactiva con su propio DOM, eventos y virtualizador. Se evita reparentar nodos React, copiar conversaciones y usar `.click()`.

### 2.2 Enlace de acciones
La acción no se transmite desde un botón propio: el usuario hace clic directamente sobre una fila real. Un listener de captura observa si el evento fue confiable, sin cancelar su propagación.

### 2.3 Layout
Variables CSS --n3-x, --n3-y, --n3-side, --n3-chat-x, --n3-chat-w y --n3-h. El encabezado dibujado es propio, pero la lista y los mensajes son nativos. Ventana arrastrable y redimensionable.

### 2.4 Riesgos y degradación
El HTML de WhatsApp cambia con frecuencia; si desaparecen #side o #pane-side el modo Studio muestra espera. Si un clic físico no resulta en #main + composer y cabecera compatible, se muestra error + Original. Nunca se borra ni mueve un mensaje. Otros modos están aislados por el atributo de modo.

### 2.5 Alternativas descartadas
Copiar nombres en botones y usar `element.click()` como puente: falló en sesión real. Reparentar paneles React: riesgoso para handlers y estado. API no oficial de WhatsApp para abrir chats: no necesaria, riesgo de mantenimiento.

### 2.6 Evidencia requerida
CI con clic físico en Chrome y Firefox sobre la fila original, verificación `isTrusted`, cabecera correcta, composer, drag, restore; y una prueba final no automatizable sin credenciales: seleccionar y conversar desde Firefox del usuario.

## Privacidad y reversión
Se conservan contactos y mensajes solo en el DOM que WhatsApp ya tiene abierto. No se guarda un índice de nombres ni mensajes. Los únicos valores propios persistidos son preferencias y geometría de ventana. Original retira Studio y desactiva sus CSS.

## Gate de aceptación final (incompleto hasta prueba real)
- [x] Aislar modo Studio y conservar Original.
- [x] Eliminar listas clonadas y llamadas sintéticas a `.click()` del modo Studio.
- [x] Prueba de clic físico con evento trusted en Chrome sobre una fila real de fixture.
- [x] Probar editor real y arrastre en Chrome con fixture.
- [ ] Obtener PASS de Firefox real automatizado en CI (en ejecución).
- [ ] Probar en Firefox autenticado del usuario: contacto A, contacto B, conversación correcta, escribir manualmente, archivos/audio, restaurar.

**Regla de reporte:** nunca presentar tests de fixtures como validación de la cuenta real. Si la versión se instala y falla en WhatsApp real, recuperar Original y revisar estructura actual, sin añadir otro rediseño.
