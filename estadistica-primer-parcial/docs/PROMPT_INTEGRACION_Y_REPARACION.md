# PROMETEO · ESTADÍSTICA UP · INTEGRACIÓN FINAL Y REPARACIÓN REAL

## Objetivo
Comprobar y corregir la entrega de TODAS las unidades disponibles, sin confundir un commit o el estado `ready` con calidad académica comprobada. No pedir al usuario nuevos permisos para ejecutar acciones con herramientas que ya estén conectadas. No terminar con un mero informe si podés corregir.

## Recuperación verificable
1. Inspeccionar `JuanManuelPM/Experimentos`, rama **`gh-pages`**, ruta `estadistica-primer-parcial/`, incluyendo `content/manifest.json`, los 9 JSON, `docs/MANUAL_DE_PRODUCCION_V2.md`, `docs/CONTRATO_DE_EDICION.md`, `docs/PROMPT_UNIDAD.md`, `tests/` y la implementación actual de `ui/`.
2. Inspeccionar `JuanManuelPM/pruebas`, rama `candidate/estadistica-up-content-pack-20261117`, paquete fuente `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/pilots/academic-statistics-001-20261111/content-pack-v2/`. Contrastá MANIFEST, FUENTES, unidades e índice de incisos con los materiales académicos efectivamente accesibles. No inventar tablas, imágenes, datos ni claves si no están allí.
3. Unidades reales conocidas: M1, M2, M3, M4, M6, M7, M8, M9, M10. **M5 no existe en el paquete fuente**: consignar ausencia de fuente; no crear una unidad ficticia.
4. Consultar commit, SHA, estado, counts y fecha de cada unidad; otra conversación puede haberla actualizado. Nunca usar capturas o resúmenes antiguos como verdad actual.

## Auditoría de extremo a extremo
Por cada unidad, construir una matriz interna (no sustituir correcciones con una tabla decorativa) con:
- Cobertura de todos los patrones/incisos relevantes y referencia trazable.
- Teoría: definición exacta, para qué sirve, matices, distinciones, ejemplo útil, dificultad real, orden de lectura, ausencia de relleno.
- Machete: notas continuas, fórmulas correctas, procedimiento, reglas de elección, excepciones, comparaciones y accesibilidad desde práctica. El diseño es responsabilidad del componente común, no del JSON.
- Práctica: razonamiento no trivial, formatos móviles sin escritura, distractores plausibles y no duplicados, respuesta y retroalimentación verificables, cálculo independiente, unidades y tolerancias correctas, consistencia V/F individuales y en conjunto, resolución única fundamentada. No validar solo que el JSON parsea. Agregar `cheatSection` por ejercicio cuando exista correspondencia inequívoca con un título de `cheatBlocks` de esa unidad; confirmar cada enlace. El botón «Machete» reutiliza esas referencias para abrir en la sección correcta.
- Estado: `draft` para incompleto; `ready` solo para unidades utilizables con todo lo exigible validado. Distinguir públicamente `verified`, `adapted`, `blocked` cuando proceda y documentarlo en `review`.
- Validación técnica: `node tests/validate-content.mjs Mx` para todas las unidades, tests de claves, navegación, representación, opciones, corrección y acceso web público tras despliegue.

## Corregir, no excusarse
1. Ordenar fallos por gravedad (claves incorrectas, datos inventados, cobertura, contradicciones, calidad del aprendizaje, estética).
2. Para cada unidad que falla, mejorar y reparar el JSON correspondiente sin tocar `ui/*`. Si encontrás un fallo real de UI común, reportarlo en lista independiente para el chat responsable de la interfaz; NO tocar CSS o componentes.
3. Para cada archivo, leer su SHA actual y usar una actualización atómica basada en el SHA. Concurrencia: si cambió durante tu trabajo, releer, integrar y revalidar. **No forzar la rama, no sobrescribir mejoras ajenas, no publicar estados viejos.**
4. Realizar varias pasadas de crítica y reparación; repetir hasta corregir todos los fallos que tengan evidencia y fuente disponibles. No abrir preguntas por detalles que el repositorio responde.
5. Comprobar la publicación pública tras actualizar `gh-pages`. Si GitHub Pages aún despliega, cotejar la nueva ejecución; no atribuir resultados de una compilación anterior.
6. Entregar informe específico: **unidades y archivos realmente auditados**, problemas detectados y corregidos, commits por unidad, recuentos, resultados de tests, bloqueos que requieren fuentes, tareas restantes y URL pública. Separar verificación técnica de corrección académica. No declarar verificado lo que solo se leyó o se ejecutó sin corroborar.

## Estilo de trabajo
Actuá sobre el repositorio directamente, sin herramientas decorativas, sin pedir pasos manuales intermedios ni generar páginas distintas. Buscá evidencia, no justificaciones. Terminá todo lo que permitan fuentes y herramientas realmente disponibles en esta ejecución.

**Punto de partida:** revisar TODAS las unidades del manifiesto, incluso las marcadas ready.
