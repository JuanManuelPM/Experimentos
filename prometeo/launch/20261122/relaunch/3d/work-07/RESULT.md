# Resultado W7-07 · Una habitación verdadera

**Trabajo ejecutado:** `3d-w7-20261122-07`, solamente consigna 07.

**Estado:** `PARTIAL_DELIVERY`. Código funcional **implementado sin render observable**. Los gates perceptuales siguen `NOT_RUN`, el primer artículo `FIRST_ARTICLE_REQUIRED` y las comparaciones fotogramétricas métricas `BLOCKED` por ausencia de pares originales.

## Abrir
- [Escena / visor (solo cuando la ruta se publique en Pages)](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/work-07/)
- [Fuente original de captura y software](https://github.com/Ahmedn1/roomsplat) (licencia MIT en el repositorio).
- [Nueva fuente del work (rama aislada)](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-3d-w7-20261122-07/prometeo/launch/20261122/relaunch/3d/work-07)
- [Book DEEP-SPEC + ART-DIRECTION](PREPRODUCTION.deep-spec-v1.json)
- [QA / límites](QA.md)
- [Trace visitado](TRACE.json)

**Qué se ve al abrir:** carga a pantalla completa de la oficina escaneada real; dos cámaras derivadas de las poses originales y control de foto-vista oculto al inicio. Si el modelo no se descarga, la página informa el fallo, sin inventar geometría.

**Qué hace el módulo reutilizable:** aplica pose con vectores normalizados; construye una sesión de alineación 2D, mueve imagen/cambia opacidad, valida puntos normalizados y exporta una ficha JSON sin confundir diferencia 2D manual con reproyección métrica.

**Diferencia comprobable con W6:** no depende de iframe externo, trabaja con el archivo splat y cámara pose de una captura auténtica bajo un visor propio. Todavía no tenemos screenshot ni comparación fotográfica original-vs-render, por lo que no se afirma calidad superior ni reconstrucción propia recién entrenada.

**No se modificaron** obra W6, lanzadores viejos, otros 9 números ni flujo privado. **HUMAN_APPROVED=false**.
