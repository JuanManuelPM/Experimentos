# PROMETEO · ART-DIRECTION / FIRST-ARTICLE · v1 (único núcleo)
 
**Owner:** Experimentos/gh-pages/prometeo/launch. Complementa Q-LOOP → QBAR-1 → DEEP-SPEC-1; no reemplaza el método ni reescribe W6/W002.

## Antes de construir
Registrar promesa perceptual y primera pantalla real: protagonista, composición móvil (390) y desktop (1440), interfaz mínima, 2–4 pruebas con oráculo y captura. Revisar al menos una obra profesional realmente observada (no solo link). Examinar dos **familias de representación** distintas, con recursos y licencias comprobados. Buscar primero la pieza más riesgosa: un actor frente/perfil, habitación donde la pared puede tapar sala, una frase musical con arreglo real, un plano cinematográfico representativo, una imagen raster maestra. Decidir por evidencia y no por facilidad de generarla.

Ejecutar primer artículo **antes** de multiplicarlo. Capturar/escuchar el artefacto real; si falla, cambiar familia/técnica/recurso y probar otra vez. Una transformación estética intencional simple es válida, un collage improvisado presentado como realismo no. El worker debe guardar recursos, qué se rechazó y por qué. Probar captura de primer frame real en 390 y 1440, sin overlays que invadan protagonista ni controles duplicados. La tipografía editorial que es el contenido se permite.

## Contrato de estados y evidencias
`inspectArtDirection` en [art-direction-first-article-v1.mjs](art-direction-first-article-v1.mjs) evalúa campos, referencias, dos estrategias realmente diferentes, plan de primera pantalla, primer artículo, fallback, evidencias y autocalificación. Los estados son `INVALID`, `FIRST_ARTICLE_REQUIRED`, `SWITCH_REPRESENTATION`, `BLOCKED`, `FIRST_FRAME_CAPTURE_REQUIRED`, `FIRST_FRAME_FIX_REQUIRED` o `READY_TO_BUILD_NOT_ARTISTICALLY_APPROVED`. Este último significa **sólo** que el expediente y las evidencias declaradas justifican construir; NO evalúa píxeles, sonido, calidad, seguridad de licencia ni aprobación humana. Los links, hashes y timestamps se deben cotejar remotamente, no confiar ciegamente en el JSON.

**Un solo Book**: guardar estas decisiones dentro de `PREPRODUCTION.deep-spec-v1.json` bajo clave `artDirection`, no hacer un formulario humano separado. Cargar código validador cuando sea viable. En trabajos no Node aplicar criterios equivalentes y persistir QA explícito.

## Adaptadores que comparten el núcleo
- **3D**: actor frontal/perfil/close-up y rig real; muros/oclusiones en cámara 390/1440 y sujetos dentro del frustum; máquina precisa/exploración/LOD según brief. Fallo => otro asset, retopología, cámara, técnica de representación.
- **Web**: hero de contenido real, media con derechos/autoría, tipografía, teclado, legibilidad 320/390/1440, overflow, botones funcionales. Fallo => revisar arquitectura/captura/media, no sumar tarjetas.
- **Música**: primer pasaje audible/producción real, groove, forma, cambios de sección, recursos e instrumentos legales; render y escucha de la primera frase y master. Fallo => otra instrumentación, síntesis, arreglo o grabación, no solo compresión.
- **Video**: primer plano/actuación, continuidad, soundtrack, export y decodificación reales, frames inicial/medio/final. Fallo => redefinir técnica/footage/acting, no transiciones decorativas.
- **Imágenes**: raster maestro auténtico, identidad multivista, perspectiva, nativo/resolución óptica, material, comparación semántica. Fallo => generar/renderizar/dibujar de otra forma, no hacer upscale o crops falsamente independientes.

## Surface / Book / Flow / Trace
Surface es **obra limpia**; Book es este expediente enlazado al DEEP-SPEC; Flow es el método especializado fijado por versión y SHA; Trace consigna **sólo nodos/etapas efectivamente recorridos** con decisión, alternativa, output, evidencia, estado y timestamp, SKIPPED con causa. No reconstruir 316 nodos retroactivamente. Antes de anunciar traza validada, comprobar integridad, rutas de aristas y que el validador acepte la versión activa. Un informe de flujo no sustituye STAGE_TRACE real.

## Prueba de regresión y límites
11 fixtures sintéticos ejercitados en V8: 11/11 estados esperados. No representan capturas ni audios reales. Remanente: primer slice en obra real, inspección visual/sonora independiente, navegador Android, traza v2.3.0 y aprobación humana. Reversión: remover referencias al gate en nuevos lanzadores, preservar anteriores; **no modificar** brief antiguo.
