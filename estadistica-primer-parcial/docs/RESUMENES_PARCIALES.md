# Estadística UP · Recorrido de estudio para los parciales

**Enlace estable:** https://juanmanuelpm.github.io/Experimentos/estadistica-primer-parcial/

## Dos recorridos independientes

- Primer parcial: `?all=1`. 6 temas breves; 13 ejercicios de alto rendimiento, de los cuales 4 son casos integradores adaptados de consignas de examen o ejemplos creados y rotulados.
- Segundo parcial: `?partial=2&all=1`. 6 temas breves; 14 ejercicios, de los cuales 3 son casos integradores adaptados de consignas verificadas.
- En ambos: **Teoría → Practicar (ventana por tema) → seguir leyendo**. Las pestañas **Práctica** y **Machete** muestran el recorrido completo resumido.
- Se conservan todas las unidades completas en el índice; no son el recorrido recomendado para el repaso de examen contrarreloj.

## Estructura del contrato

`content/partials/P1.json` y `content/partials/P2.json` contienen:

- `theory`: 6 conceptos con bloques semánticos compartidos (párrafos, listas, fórmulas y comparaciones).
- `cheatBlocks`: hoja de notas breve, visible como pestaña y en ventana contextual dentro de la práctica.
- `practiceRefs`: IDs estables de ejercicios existentes en `content/units/Mn.json`.
- `extraPractice`: nuevos casos integradores con consignas completas, claves, soluciones y atribución exacta.
- `practiceGroups`: correspondencias de cada sección teórica con **IDs** de ejercicios de ese tema. Un solo ejercicio debe aparecer en un solo grupo del parcial para no repetirlo.
- `cheatByUnit`: sección de machete pertinente a cada unidad.

La UI reside exclusivamente en `ui/`. La práctica no duplica ejercicios de las unidades salvo casos integradores propios del resumen. Las nueve unidades conservan su edición independiente.

## Criterio editorial

Incluir ejercicios que comprueben una **habilidad de parcial**: interpretar un caso, decidir variable y diseño con justificación, elegir denominador y calcular tablas, traducir percentiles, calcular CV, r y recta, comparar proporciones, identificar prueba adecuada, formular H₁ y concluir con p.

No incluir preguntas que se resuelvan por contraste entre una opción lógica y distractores absurdos, ni series repetitivas con la misma habilidad mínima. Un parcial real puede usar un caso con varios incisos; el repaso debe reflejar esa integración. Donde los enunciados de 2026 requieran una base externa no suministrada, no inventar resultados.

**Las fuentes no garantizan qué temas entrarán en una evaluación futura**. Las consignas del presencial 2026 y los integradores orientan la selección, mientras que los casos añadidos se distinguen de los exámenes literales.

## Mantenimiento y pruebas

- Conservá IDs, claves y almacenamiento de progreso al modificar JSON.
- Si un chat cambia un ejercicio usado por un resumen, verificá las referencias y la resolución.
- Ejecutá `node tests/validate-content.mjs` y `node tests/validate-partials.mjs`.
- Comprobá que `?all=1` y `?partial=2&all=1` abren la teoría; sus pestañas Práctica/Machete mantienen el mismo parcial; cada botón Practicar abre un conjunto no vacío; al responder/revelar, se actualiza la corrección y el color de fondo.
- GitHub Pages exitoso solo confirma despliegue, no prueba todas las interacciones; documentar por separado las pruebas efectivamente realizadas.

## Revisión pedagógica y tipográfica · 18-11-2026

- En `content/partials/P1.json` y `P2.json`, teoría y machete usan fracciones estructuradas `{type:"formula",lines:[{left,numerator,denominator}]}` y ejemplos resueltos `{type:"worked",title,problem,steps,result,interpretation}`. Nunca concatenar cuatro ecuaciones con puntos en una sola línea gigante. Los componentes se reutilizan también para unidades individuales.
- La teoría enseña a identificar datos, escoger procedimiento, sustituir valores, calcular e interpretar. El machete conserva las reglas en formato de recordatorio, no reemplaza la explicación.
- Además de 13/14 ejercicios rápidos, la práctica contiene un archivo PLEGADO con exámenes de fuentes accesibles: `content/partials/exams/P1.json` (7 casos, 2026 e integrador) y `content/partials/exams/P2.json` (24 casos, 2025, 2026 e integrador). Las respuestas se revelan por inciso.
- Los casos de exámenes reales están parafraseados y enlazan el documento de origen. Algunas tablas descriptivas del primer parcial 2026 y del integrador requieren bases externas no encontradas en los archivos accesibles. No declarar esas cifras resueltas ni inventarlas.
- Verificación: sintaxis de JS, recuperación de datos del manifiesto, referencias de los ejercicios, renderización de fórmulas y respuestas, y resultado de GitHub Pages. Un build correcto no prueba automáticamente la experiencia táctil en todos los Android.
