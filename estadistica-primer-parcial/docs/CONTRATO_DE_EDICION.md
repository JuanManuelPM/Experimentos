# Contrato editorial y técnico por unidad · V3

## Archivos y límites
Repositorio `JuanManuelPM/Experimentos`, rama **`gh-pages`**, directorio `estadistica-primer-parcial/`. El chat encargado de la unidad N solo modifica `content/units/MN.json`. No tocar `ui/*`, `index.html`, `content/manifest.json` ni otras unidades.

IDs válidos: **1, 2, 3, 4, 6, 7, 8, 9, 10**. M5 no tiene fuente. P1 usa M1 a M4; P2 usa M6 a M10. No poner `status:"ready"` sin teoría y práctica suficientes, verificadas.

## Datos independientes de presentación
```json
{"schema":"psicologia-up.statistics.unit.v3","moduleId":"M2","id":"02","partial":"P1","status":"ready","title":"Tablas y frecuencias","theory":[],"practice":[],"extras":{},"cheats":[],"cheatBlocks":[],"numericOptions":{},"multiOptions":{},"trueFalse":{},"review":{}}
```

La teoría heredada acepta `{id,title,what,use,example,formula}`; la nueva acepta `{id,title,blocks:[...]}`. Bloques admitidos: `paragraph {text}`, `heading {text}`, `definition {term,text,example}`, `list {items:[{label,text}]}`, `steps {items:["..."]}`, `comparison {columns:[{label,items:["..."]},...]}`, `formula {expression,symbols:[{symbol,meaning}]}`, `decision {if,then}`, `table {headers,rows}`, `note {text}`. Expresiones de fórmula en Unicode legible. Sin HTML arbitrario.

Ejemplo de teoría:
```json
{"id":"02.fr","title":"Frecuencia relativa","blocks":[
 {"type":"paragraph","text":"Qué parte del total corresponde a la categoría."},
 {"type":"formula","expression":"FR = FA / N","symbols":[{"symbol":"FA","meaning":"casos de la categoría"},{"symbol":"N","meaning":"total pertinente"}]},
 {"type":"definition","term":"Ejemplo","text":"20 de 50 participantes equivalen a FR=0,40, es decir, 40 %."}
]}
```

**Machete continuo**: escribir `cheatBlocks:[...]` como una sola hoja lógica con headings, listas, reglas, fórmulas y comparaciones. Si está vacío, se usa `cheats` heredado. Nunca fabricar un carrusel o poner un párrafo gigante para resumir tres diferencias.

## Práctica sin texto libre
- `choice`: `options:["Nominal","Ordinal","Razón"]`, `answer:1` (índice).
- `truefalse`: `claims:[{text:"La última FAA es N.",answer:true,explanation:"..."},{...}]`, varias afirmaciones contrastivas.
- `numeric`: `answer:0.4,tolerance:0.001,options:[0.4,0.2,2.5,0.6]`. Exactamente UNA opción correcta dentro de la tolerancia; no alternativas ambiguas por redondeo.
- `multi`: `fields:[{label,answer,tolerance,options},...]`.
- `mark`: `parts:["Evaluaron ",{text:"80",value:"80"}," alumnos"],answer:"80"`.

Cada práctica lleva `id,type,title,source,hints:[...],solution:[...]`, más los campos propios. No crear inputs para redactar respuestas. Conservar ids si no cambia el ejercicio; renovarlos si cambia la clave o la interpretación, porque el navegador conserva respuestas anteriores. La pista 1 orienta, la 2 revela el método, la 3 ayuda a sustituir. La resolución muestra cómo responder en el examen.

## Concurrencia, verificación y publicación
Recuperar las fuentes privadas para ese módulo en `JuanManuelPM/pruebas` rama `candidate/estadistica-up-content-pack-20261117`; no atribuir fuentes no leídas. Verificar números y claves sin tomar solucionarios inconsistentes por autoridad. Ejecutar `node tests/validate-content.mjs MN` cuando tengas terminal; si no, validar equivalentes. Guardar SOLO el JSON de la unidad con su SHA actual usando el conector GitHub. Ante conflicto, no forzar. GitHub Pages sigue siempre en el mismo enlace.
