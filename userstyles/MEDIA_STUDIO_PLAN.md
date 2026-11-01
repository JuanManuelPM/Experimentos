# Universal Media Studio · Plan maestro y evidencia

Fecha: 2026-11-01. Repositorio: JuanManuelPM/Experimentos.
Programa: **dos aplicaciones, un motor de ventanas**, adapters para youtube.com y music.youtube.com.
Archivo instalable: `userstyles/media-studio.user.js`. WhatsApp Studio no se toca.

## Índice y compuertas

| Cap. | Entregable | Evidencia necesaria | Estado |
| --- | --- | --- | --- |
| 00 | Objetivo, reversibilidad, conservación del reproductor nativo | Alcance explícito | OK |
| 01 | Investigación DOM, rutas SPA y controles HTMLMediaElement | Referencias públicas + inspección de fuente | OK exploratorio |
| 02 | **Planificación**: superficie común + adaptadores, privacidad, riesgos y fallback | Este archivo, criterios y rollback | OK |
| 03 | Reproductor de video/audio real | Pruebas sobre media HTML5, nunca autoplay | Implementado, fixture |
| 04 | Canvas flotante, fondo y retorno a navegación | Capturas visuales + interacción | Implementado, fixture; real NOT_RUN |
| 05 | Widgets de búsqueda, cola, metadatos | Enlaces nativos + cola solo si sitio la publica | Implementado, fixture |
| 06 | Arrastrar, tamaño, posiciones por aplicación | Guardado independiente y restauración | Implementado, fixture |
| 07 | Tipografía y diseño unificado | Verificación visual por sitio | Pendiente Firefox real |
| 08 | Regresiones, compatibilidad, multimedia | CI, comprobación Firefox autenticado | CI pendiente, Firefox NOT_RUN |
| 09 | Publicar instalador, documentar funciones confirmadas | SHA verificado y URL raw | Pendiente |

## Decisiones técnicas

1. **Un solo userscript** compatible con ambas aplicaciones. Mismo motor Shadow DOM, dos adaptadores nativos en función del dominio.
2. Los controles Play/Pausa, tiempo y volumen operan directamente sobre `HTMLMediaElement`. No crean otro reproductor ni copian pistas, historial, sesiones o claves.
3. Buscar usa formularios GET a rutas nativas: `/results?search_query=` en YouTube y `/search?q=` en Music.
4. Cola: en YouTube se muestran enlaces reales de playlist si el DOM los tiene; en Music son nombres leídos de la cola y **solo lectura**. No afirmar cola completa si el DOM no la expone.
5. **Video YouTube:** reubicar visualmente un contenedor nativo mediante estilo *temporal*; verificar rectángulo y hit-testing. Si no funciona, restaurar estilos inmediatamente y ofrecer «Explorar» para usar la interfaz original.
6. El Canvas tapa la página detrás para evitar clics fantasma. «Explorar» desactiva la máscara y restaura el reproductor nativo; «Original» deja un pequeño lanzador reversible.
7. Próxima/anterior usan botones del sitio; son candidatos a romperse por cambios de selectores. El panel muestra si no se pudo confirmar cambio y permite usar controles originales.
8. Preferencias guardadas: posición, tamaño, modo de visualización por dominio. **No** almacenar canciones, videos, contactos, cookies o tokens; sin servidores externos del script.

## Riesgos conocidos

- YouTube cambia estructura de `#player-container-outer` y `#movie_player`; CSS o stacking context puede impedir reposicionar el video. **No** forzar interfaz oculta: fallback visual y «Explorar».
- YouTube Music puede mostrar cola solo cuando la pestaña nativa está abierta. Mostrar vacío auténtico, no una lista inventada.
- Un `.click()` para siguiente/anterior no es equivalente a la interacción de una persona en todas las versiones. No llamar éxito sin observar cambio y mantener el botón nativo.
- Chromium CI con fixtures verifica lógica, no la sesión de Google ni visual real en Firefox. La aceptación real debe conservar el estado **NOT_RUN** si no hay prueba.

## Pruebas manuales de aceptación (Firefox)

YouTube: abrir video, activar Studio; comprobar video dentro de ventana, Play/Pausa, avance, volumen, reproducción a pantalla completa, playlist y cambio de video; mover/redimensionar; Explorar; Original.
YouTube Music: reproducir canción, abrir Studio; carátula y título reales, Play/Pausa, volumen, anterior/siguiente, cola cuando esté expuesta; arrastrar, Explorar, Original.

Un fallo **bloqueante** se devuelve a la fase correspondiente. No declarar «terminado» solamente por tests DOM.

## Instalación

Una instalación en Violentmonkey del archivo raw. En ambas páginas: el botón ◐ para reabrir, × para Original, ↗ para Explorar, `Alt+Shift+M` para alternar.
