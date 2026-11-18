# PROMETEO · PSICOLOGÍA UP · UNIDAD AUTÓNOMA · PRODUCCIÓN Y PUBLICACIÓN

Misión: corregir y enriquecer completamente UNA unidad de Estadística Aplicada a la Psicología, utilizando las fuentes reales, sin tocar el diseño ni el resto de las unidades. Ejecutar todas las fases en este mismo chat, sin hacerme intervenir para continuar.

**Destino GitHub público:** `JuanManuelPM/Experimentos`, rama **`gh-pages`**, carpeta `estadistica-primer-parcial/`. **GitHub privado fuente:** `JuanManuelPM/pruebas`, rama `candidate/estadistica-up-content-pack-20261117`, carpeta `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/pilots/academic-statistics-001-20261111/content-pack-v2/`.

**Recuperación obligatoria en este orden:** leer completos `docs/MANUAL_DE_PRODUCCION_V2.md` (vigente, sustituye manual V1 del proyecto ChatGPT), `docs/CONTRATO_DE_EDICION.md`, `content/manifest.json`, y SOLO `content/units/M{UNIDAD}.json` del sitio público. Leer `unidades/M{UNIDAD}.json`, `FUENTES.json`, `MANIFEST.json`, `auditoria/INDICE_282.json` y guías/parciales/solucionarios relevantes del paquete privado. Los IDs reales son 1,2,3,4,6,7,8,9,10. M5 no tiene guía original disponible; no inventarla.

**Ejecución, en una sola secuencia autónoma:**
1. Inventariar todos los patrones e incisos de la unidad, dificultades, fuente, datos, fórmulas, claves, gráficos/bases ausentes y cobertura existente.
2. Auditar críticamente el JSON actual y detectar teoría genérica, distinciones confusas, ejemplos obvios, machete poco útil, ejercicios triviales, claves incorrectas o prácticas faltantes.
3. Reescribir **teoría** desde cero: qué significa exactamente cada concepto para alguien que empieza, para qué lo necesita al resolver ejercicios de esta unidad y ejemplo concreto que haga notar la diferencia. Usar bloques semánticos con bullets, comparaciones, fórmulas, pasos y tablas según la información, no forzar párrafos ni introducir relleno.
4. Construir **machete** como UNA sola hoja vertical de notas visualmente ordenadas con definiciones, reglas, procedimientos, fórmulas, comparaciones y excepciones. Cada elemento debe facilitar un inciso de examen; no tablas repetitivas de «si dice X respondé Y», flechas decorativas o frases introductorias.
5. Mejorar **toda la práctica**: cubrir patrones genuinos, con V/F multiproposición, elección razonada, identificar datos o alternativas numéricas con distractores comprobados. NO respuestas escritas ni preguntas tan obvias que no prueben habilidad. No reducir los cálculos a adivinar datos. Incluir práctica guiada y variantes de transferencia cuando agreguen cobertura.
6. Pistas graduadas orientación → método → sustitución, y resolución modelo con cuenta y conclusión precisa. La UI ya hace que solo se vea Pista O Resolución; no implementar controles ni CSS.
7. Recalcular independientemente las claves y alternativas, cotejar fuentes, marcar `BLOCKED` o `CONFLICT` cuando falten datos o difieran los solucionarios; nunca atribuir un ejemplo nuevo a una guía original.
8. Editar **exclusivamente** `content/units/M{UNIDAD}.json` en `gh-pages`. Mantener `schema`, `moduleId`, `id`, `partial`, fuente y revisión. Para P2 cambiar `status` de `draft` a `ready` únicamente cuando la unidad completa sea utilizable y las soluciones verificadas. Los chats de UI cambian `ui/*` por separado. Ninguna IA de unidad puede tocar `ui/*`, `index.html`, `manifest.json`, `docs/*` o JSON ajenos.
9. Validar JSON, estructura, unicidad de IDs, ausencia de opciones correctas duplicadas y cobertura; si podés ejecutar Node, correr `node tests/validate-content.mjs M{UNIDAD}`. Usar `update_file` atómico con SHA de la versión actual; si otro chat publicó a la vez, releer el archivo y conciliar, nunca forzar el ref.
10. Comprobar publicación y entregar solo resultados verificables: archivo actualizado, commit, número de conceptos/ejercicios/patrones, problemas corregidos, bloqueos y enlace público **existente**, no una web nueva.

**Prohibiciones:** MagicPath, otros hosting, servicios pagos, trabajo manual repetitivo, promesas de pruebas no efectuadas, modificaciones visuales, reiniciar el proyecto, borrar contenidos de otros chats, inventar datos del parcial, pedir escritura libre al estudiante.

Trabajá de manera autónoma y autocriticá el resultado. Si falta una base o figura, seguí mejorando los demás patrones y dejá el bloqueo explícito en `review`. No terminés con un plan o preguntas para que yo te habilite la siguiente fase; entregá la unidad en GitHub.

UNIDAD:
