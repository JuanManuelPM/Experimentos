# WhatsApp Studio · Reparación UX v2.1

Fecha: 2026-11-01 · Rama principal: master · Código: userstyles/whatsapp-live.user.js

## Objetivo
Contactos del widget propio deben abrir una conversación real de WhatsApp a su derecha, sin perder lectura, escritura, multimedia, desplazamiento ni restauración.

| Puerta | Criterio | Estado real |
|---|---|---|
| G0 Base | Studio previo y Original conservados | PASS en fixture |
| G1 Contactos | Clic en título real, no wrapper externo | PASS en fixture |
| G2 Apertura | Confirmar cabecera y compositor del contacto correcto | PASS en fixture, pendiente WhatsApp real |
| G3 Conversación | #main original en superficie derecha; no copiar React | No modificado; PASS estructural en fixture, pendiente Firefox |
| G4 Movimiento | Ventana arrastrable; sin destruir chat | PASS en fixture, pendiente chat real en movimiento |
| G5 Restauración | Error visible y botón a WhatsApp Original | PASS en fixture |
| G6 Publicación | CI de 12 pruebas y sintaxis | PASS candidata; confirmar CI master |

## Causa y reparación
- Antes: se llamaba a row.click() sobre un wrapper y se suponía que la conversación se había abierto.
- Ahora: se conserva el nodo DOM del título por cada chat, se hace clic en él para alcanzar el handler nativo de WhatsApp.
- Se comprueba presencia del compositor y que la cabecera nombre el contacto correcto; sin confirmación tras ~2 segundos, aparece una advertencia y acceso a Original.
- El código **nunca manda mensajes** ni duplica ni guarda contactos en una base externa. Solo guarda posición de la ventana y preferencias visuales.
- Queda pendiente la prueba con sesión autenticada (no accesible por GitHub Actions): elegir contacto A y B, revisar cabecera, escribir/enviar manualmente, recibir, audio, adjuntos, mover ventana y restaurar.

**Importante:** que CI pase no significa que la operación en WhatsApp real esté verificada. Si falla en Firefox, recoger captura del resultado y del estado de error; no añadir otro rediseño ni anunciar una reparación confirmada sin prueba real.
