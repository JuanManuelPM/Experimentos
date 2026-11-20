# Comparaciones y aprendizaje del Estudio 3D 2.0

## La prueba que sí vale
Para comparar el método `2.0.0` frente a `1.4.0` o `2.1.0`, conservar **el mismo BRIEF literal y su SHA-256**. Los diez del catálogo son alias/escenarios candidatos; no se debe mentir diciendo que los briefs redactados por el asistente fueron los usados en Ola 001. Cuando el usuario acepte un brief, congelarlo y usarlo por igual en cualquier nueva ronda. Si cambia el texto, separar experimentos.

## Matriz de medición
El evaluador humano califica por componente, sin que «Arcade me encanta» se traduzca a «todo Arcade es perfecto». Evaluar:
- héroes/props: silueta, arte UV, mecanicidad y superficie de interacción
- actores: rostro, manos, ropa, rig y actuación al tamaño del plano
- entorno: cerramiento, densidad, detalle, profundidad, variación
- cámara: recorrido, composición, orbit libre cuando corresponde, facilidad táctil
- materiales/luz: exposición, sombras, contraste y coherencia de look
- FX/movimiento: fenómenos espacialmente creíbles y físicamente legibles
- interactividad: el estado de inputs cambia realmente en la escena
- arranque/móvil: el enlace abre, assets cargan, WebGL funciona o fallback explícito
- cobertura: el resultado es el proyecto entero o `DELIVERED_WITH_GAPS`

La evaluación **artística** es del usuario; un test de código o la opinión previa del agente no sustituye esa nota. Los componentes pueden tener evaluación `UNREVIEWED`.

## Aprendizaje entre tandas
1. Conservar briefHash, flowHash, source SHA, commit, release y cualquier captura auténtica.
2. Leer `STAGE_TRACE.json` factual. Vincular cada observación de arte a una o varias etapas.
3. Cruce actor valorado NO justifica reutilizar calle de bloques. Arcade pantalla/prop valorados NO justifican clon de fondo/cámara. Las partes malas deben quedar como contraejemplos de elección de técnica.
4. Formular cambio abstracto de subflujo, no una frase adicional en el prompt humano.
5. Probar el cambio en dos proyectos materialmente distintos cuando sea posible antes de promoverlo a «capacidad reutilizable».
6. Lanzar otra ronda sólo cuando el usuario la solicite. Las tareas del Estudio 3D no disparan ni conectan automáticamente otros chats ni otros estudios.

## Trazabilidad y eficiencia
Cada etapa registra `action/decision/conclusion/evidenceRefs` como máximo orientativo 45 palabras; si no se hizo marcar `SKIPPED/NOT_RUN`. Primero producir obra; luego redactar informe corto. Guardar diferencias y un resumen con la razón del cambio de flujo. Evitar leer cada archivo de investigación en cada proyecto si SHA de la fuente y elección ya están validados para ese contexto.

**Límites de nuestra ronda de método actual:** tests de código pueden demostrar resoluciones y rutas, pero no demostrar que una IA generará una buena sala 3D sin ejecutar nuevas escenas. El benchmark visual queda NOT_RUN hasta el próximo lote.
