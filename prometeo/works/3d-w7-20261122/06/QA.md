# W7 3D 06 · Bosque de cuatro estaciones · QA

**Estado al 2026-11-22T18:57:26.156Z:** código candidato escrito / pruebas lógicas 8 PASS / primer artículo SVG de geometría real revisado como proyección CPU / WebGL2 visual **NOT_RUN** / Android **NOT_RUN** / HUMAN_APPROVED=NO. Aprobación artística no inferida.

## Recuperación

Brief W7 blob `58de659e2aa01c0746d59ca6f95c36bdc59f3030`; W6 blob `942c3ba8b851137886e959d2790771556e2d9f5d`. Conservada W6 sin sobrescribir. Método compartido fijado en `FLOW_LOCK.json`. W6 declaró 245 árboles, 29.581 instancias EQUILIBRADA y ~5 FPS SwiftShader escritorio; esta ronda **NO** ha medido FPS WebGL2 ni Android. El benchmark [Tsushima](https://blog.playstation.com/2020/07/09/crafting-the-world-of-tsushima/) demuestra técnicas ambientales aspiracionales, no equivalencia de calidad. [VFX y viento](https://blog.playstation.com/2021/01/12/how-stunning-visual-effects-bring-ghost-of-tsushima-to-life/).

## Prueba preventiva (antes de generalizar)

La primera proyección CPU de un roble, abedul y sauce mostró follaje insuficiente; se cambió a racimos vinculados a horquillas y segundo espécimen de misma cámara. [Artículo geométrico cuatro estaciones](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-3d-w7-20261122-06/prometeo/works/3d-w7-20261122/06/first-article.svg) es **SVG de geometría original**, no screenshot del renderer WebGL2. Test de 390 y 1440 del producto WebGL bloqueado por entorno: `getContext('webgl2')=null` en Chromium incluso con SwiftShader. El archivo es auditable y la falta de captura real queda explícita.

## Ocho aserciones ejecutadas contra bytes del repositorio en V8

1. 245 árboles, 5 especies, 0 flotantes y 0 dentro del cauce — PASS.
2. Arquitectura botánica determinista — PASS.
3. Hábitos diferenciados y sauce colgante — PASS.
4. Coordenadas 3D finitas — PASS.
5. Cobertura caducifolia invierno inferior a verano, coníferas persistentes — PASS.
6. Fixture de 1000 instancias: ECO=187, ALTA=591 realmente seleccionadas en CPU — PASS. **No son FPS**.
7. Buffer entregado tiene stride 7 y fuente íntegra — PASS.
8. Fuente JS W7 válida y dibujo usa instancias compactadas — PASS.

## Qué se creó

- `index.html`: recorrido 3D WebGL2, terreno y río, estaciones 0–3, lluvia, viento, calidad y joystick.
- `app.mjs`: WebGL2 real del motor W6, actualizado para construir copas dependientes de especies y ejecutar `gl.bufferSubData` con `p.visible`.
- `botany.mjs`: componente reutilizable original para ramas, racimos y LOD en CPU.
- `forest-core.mjs`: topografía, cinco especies, estaciones y presets.
- `first-article.svg`: representación de geometría CPU, **no captura WebGL**.

## Gates pendientes y calidad

**VISUAL_WEBGL2=NOT_RUN; MOBILE_INTERACTION=NOT_RUN; GPU_MOBILE_FPS=NOT_RUN; SHADOW_PHYSICAL_VALIDATION=NOT_RUN; WATER_REFLECTION_PHYSICAL_VALIDATION=NOT_RUN; 390/1440 WEBGL_FIRST_FRAME=NOT_RUN; HUMAN_APPROVED=NO**. La primera vista sigue siendo una hipótesis visual, no producto artísticamente verificado. Nuevas copas aún usan geometría de hojas simplificada y agua con aproximación de Fresnel, sin trazado de reflejos físicos. Ante defecto de cuadro inicial, cambiar representación (atlas procedurales originales o asset glTF con licencia verificada), no añadir UI.

## Test de cierre pendiente

En dispositivo real: misma cámara verano/invierno, lluvia ON/OFF, paseo con joystick, suelo/sombras/reflejos, consola sin errores, preset ECO/BALANCED/HIGH y FPS medidos por al menos 10 s con misma trayectoria. No inferir mejora causal respecto de W6 antes de ese ensayo.
