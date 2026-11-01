# YouTube Studio · nativo primero · noviembre 2026

## Objetivo
Reemplazar el experimento Media Studio por un **solo** personalizador de YouTube Web. No ejecutar ningún script en music.youtube.com. Conservar video, eventos, navegación y listas originales de YouTube. El cliente usa Firefox + Violentmonkey.

## Investigación de código abierto (ideas, no código copiado)

- [ImprovedTube](https://github.com/samyk/ImprovedTube-for-YouTube): ajustar experiencia del player nativo, temas, ocultar distracciones y atajos.
- [TubeMod](https://github.com/Pedro-Gregorio/TubeMod): ocultar/restaurar secciones DOM, sin replicar el sitio.
- [CustomTube-Forever](https://github.com/dp-zini/CustomTube-Forever): gran personalización visual mediante CSS y DOM; mantener React/YouTube nativos.
- [YouTube Immersive](https://github.com/aste2d/youtube-immersive): userscript liviano y modo de concentración.
- [Minimal YouTube](https://github.com/ephraimduncan/minimal-youtube): reducir recomendaciones y distracciones.

## Índice de trabajo y puertas de aceptación

| Puerta | Implementación | Evidencia |
| --- | --- | --- |
| 00 Planificación | Depurar activación, aislar Music, mantener native-first | Código y metadatos |
| 01 Visibilidad | Un botón ◐ fijo en html; panel visible por defecto, opción cerrada persiste | jsdom + screenshot real |
| 02 Player | Play/Pausa, +10/-10, seek y volumen sobre video.html5-main-video | Simulación y YouTube real |
| 03 Diseño | Foco, Shorts, comentarios, recomendaciones por toggles CSS reversible | Atributos y selectores |
| 04 Biblioteca | Guardados locales etiquetados como videos o canciones, con enlaces reales a YouTube | Guardar, filtrar, eliminar |
| 05 Playlists | Mostrar enlaces a playlists nativas solo cuando YouTube las expone | No inventar contenidos |
| 06 Arrastre | Posición y tamaño guardados para ventana flotante | Regresión |
| 07 Recuperación | Botón siempre visible, atajo Alt+Shift+Y, ajustes restaurables | Regresión |
| 08 Cierre | CI en candidata y master, Firefox real | PASS o NOT_RUN explícito |

## Decisiones de robustez

El botón siempre visible está montado como un nodo propio de html con Shadow DOM, no depende de los selectores de YouTube. El video **no se reparenta ni se coloca sobre una capa falsa**. CSS se limita a esconder secciones opcionales, se puede restaurar al instante. No usar el método anterior de superponer un Canvas sobre todo YouTube. No hay servicio remoto, API ni copia del historial. Biblioteca de canciones = marcadores locales a videos de YouTube; **no** se sincroniza con la cuenta de Google.

## Riesgos

- Si no aparece el ◐, comprobar que Violentmonkey esté habilitado en youtube.com y que el script esté instalado, sin otra versión previa duplicada. Un script que no se ejecuta no puede dibujar su propio botón de diagnóstico.
- Las filas de navegación y playlists de YouTube son parciales/dinámicas; no son una API completa de biblioteca.
- Video autoplay/políticas de Firefox pueden impedir Play. Los controles originales permanecen accesibles.
- Las pruebas DOM automatizadas no prueban que Firefox real cargue el userscript. Esa etapa sigue NOT_RUN hasta una captura/prueba del usuario.

## Enlace único

`https://raw.githubusercontent.com/JuanManuelPM/Experimentos/master/userstyles/media-studio.user.js`

**Actualización:** mismo archivo y nombre de userscript base que la versión 0.1 para favorecer la actualización. El texto en español y la interfaz muestran YouTube Studio; las reglas @match excluyen YouTube Music. Revisar scripts duplicados en Violentmonkey si se instaló desde una URL diferente.
