# Diagnóstico del personalizador actual (userstyles/, v1.3.0)

Revisado: `chatgpt-live.user.js` (478 líneas) y `chatgpt-live.css` (270 líneas), commit `016f256`.

## Lo que funciona y se conserva

- **Interfaz aislada en Shadow DOM**: los estilos de ChatGPT no rompen el panel.
- **Verificación de contraste** (≥ 4.5:1) que pausa el estilo si el texto queda ilegible. Se generaliza en el motor.
- **Cinco paletas completas** (Aire, Café, Ámbar, Papel, Grafito): fondo y texto emparejados. Se copian sin cambios a `core/themes.js`.
- **Tema solo en modo oscuro**: decisión correcta (el modo claro tiene texto fijo oscuro). Se mantiene, pero ahora se informa como *Incompatible*.
- **Reglas de visibilidad acotadas** (sin reglas genéricas sobre `button`), preservando Copiar y Editar.
- **Atajos de teclado** y **restauración**.

## Por qué los interruptores no producían cambios

1. **El estado viene del interruptor, no de la página.** `setItemVisible()` guarda `cm-live-show-<id>` y escribe `data-cm-show-<id>="no"` en `<html>`. Nada comprueba que exista un elemento que coincida. El panel muestra *No* aunque no haya pasado nada.
2. **Selectores supuestos.** Ejemplos: `[data-testid="brand-name"]`, `[data-testid="logo-text"]`, `[data-testid="manage-plan-button"]`, `[data-testid="thread-disclaimer"]`. Si ChatGPT no usa esos atributos, la regla no coincide nunca. En la versión nueva, *Marca* aparece como **No encontrado** con esos mismos selectores.
3. **El CSS se descarga aparte y cada 25 s** desde `master`. La lógica (script) y las reglas (CSS) pueden quedar desfasadas: el script ofrece un interruptor cuya regla CSS cambió o desapareció. Si la descarga falla o no pasa `validCss()`, no hay estilo, pero el panel sigue mostrando todo como activo.
4. **El tema depende de `html.dark`.** En modo claro, cambiar de tema no hace nada y no se informa.
5. **El ancho completo depende de dos condiciones ocultas**: modo oscuro y viewport ≥ 900 px.
6. **El modo es destructivo.** `selectMode()` sobrescribe los ocho valores de visibilidad: elegir un modo borra los ajustes particulares. No hay capas.
7. **“Restaurar todos los elementos” no restaura el original**: fija el modo *Completo*; no vuelve al estado previo.
8. **Botón flotante dentro de la página** (◐, `position: fixed`), que se pidió evitar.
9. **Solo una app.** Claves `cm-live-*`, CSS y selectores son específicos de ChatGPT; una segunda app exigiría duplicar todo.

## Consecuencias para la arquitectura nueva

| Problema | Respuesta |
|---|---|
| Estado sin verificar | El motor localiza, aplica y lee el estilo computado. El panel muestra el estado que devuelve el motor. |
| Selectores supuestos | Listas de candidatos por elemento; el informe dice cuál coincidió. *No encontrado* deshabilita el control. |
| CSS remoto desfasado | Reglas y lógica en el mismo paquete versionado. Sin descargas en tiempo de ejecución. |
| Condiciones ocultas | `theme.requires()` devuelve un motivo legible → *Incompatible*. |
| Modo destructivo | Modo = capa de app. Los ajustes particulares son excepciones que sobreviven al modo. |
| Restaurar ≠ original | `revertAll()` deja el DOM idéntico al original (probado comparando `outerHTML`). |
| Botón en la página | Botón de la barra del navegador (`action`) + `Alt+Shift+U`. |
| Una sola app | Núcleo sin referencias a apps + adaptadores declarativos. |

## Migración propuesta (no ejecutada)

La versión de `userstyles/` sigue intacta y en uso. Cuando la extensión esté calibrada en los sitios reales:

1. Exportar los valores actuales (`cm-live-theme`, `cm-live-mode`, `cm-live-show-*`) → un perfil `uui.profile/1` (tema → capa app de chatgpt, `show-*` distintos del modo → excepciones).
2. Usar la extensión en paralelo con el userscript desactivado en Tampermonkey/Violentmonkey.
3. Retirar el userscript solo después de confirmar paridad.
