# WhatsApp Studio · UX rescue · 2026-11-01

**Objetivo:** Al tocar un nombre en Studio debe abrirse la conversación real a la derecha, con lectura, escritura, multimedia y controles nativos. Conservar diseño y arrastre.

| Fase | Acción | Aceptación |
|---|---|---|
| G0 | Rama candidata y restauración | Original y Radical intactos |
| G1 | Vincular fila con control real | Clic sobre descendiente interactivo, no solo wrapper |
| G2 | Verificar apertura | No declarar éxito solo por llamar click(); comprobar cabecera/selección, o mostrar error y fallback |
| G3 | Mostrar conversación | Mantener #main y compositor nativos, no duplicar DOM React |
| G4 | Mover/redimensionar | Recalcular posición sin perder interacción |
| G5 | Regresión y control | CI PASS, no acceder a mensajes ni persistir contactos |
| G6 | Aceptación real | Firefox autenticado: contacto correcto, enviar/recibir, audio, adjuntos, Original |

**Hipótesis raíz:** el clic actual usa row.click() pero el handler de WhatsApp puede estar en un descendiente. Además, la UI no confirma la apertura efectiva.

**Criterio de publicación:** CI sobre fixtures nunca equivale a Firefox real. Sin una sesión autenticada, marcar las acciones reales como NOT_RUN, no afirmar PASS ni publicar en master automáticamente.

**Privacidad:** no leer ni almacenar mensajes, ni sincronizar contactos fuera del navegador. Trabajar con las filas ya cargadas. Ningún envío automático.
