# PROMETEO 3D · Flujo de producción 1.2.0

**Estado:** CURRENT_CANDIDATE, adoptado como versión de entrada para nuevos trabajos. Efectividad artística con futuras rondas aún NO_VERIFIED.
[Diagrama](https://juanmanuelpm.github.io/Experimentos/prometeo/3d-flow/) · [FLOW_INDEX](FLOW_INDEX.json) · [PREVENCIÓN](versions/1.2.0/PREVENTION_CONTRACT.md).

## Una obra nueva
1. Recuperar fuente oficial `FLOW_INDEX.json`, fijar versión/hash y leer `versions/1.2.0/PREVENTION_CONTRACT.md`.
2. Antes de crear geometría, generar `PREVENTIVE_BLUEPRINT.json` con [schema](versions/1.2.0/PREVENTIVE_BLUEPRINT.schema.json) y ejecutar `validatePreflightPlan` de `preflight.mjs`. Incluye aceptación positiva, alternativas, riesgos, protagonistas y toma crítica.
3. Favorecer assets reales con licencia, modelos editables texturados y 2.5D cuando corresponda; paramétricos sólo si la función mecánica lo amerita. No presentar NPCs de primitivas ni mobiliario de bloques como arte final.
4. Antes de duplicar, probar UN elemento principal en plano crítico. `validateFirstArticle` sólo permite multiplicar cuando hay fuente/bytes/licencia y render real. Sin GPU, canario SOURCE_ONLY reducido, no producción artística declarada.
5. Cámara MOVING con continuidad/cortes intencionales, sin pausas predeterminadas entre trayectorias.
6. `validate-run.mjs` exige los gates tempranos en `buildScope=SCALED`. QA final D29-D38 permanece.
7. Versionar por proyecto, rama y ronda; conservar V1/V2/V3; publicar preview técnico distinto de final aprobado, sin modificar otras fábricas.

## Alcance y límites
Misma infraestructura del Estudio 3D, no motor nuevo. 17 etapas, 257 nodos, 346 enlaces. Versiones 1.0 (224/288) y 1.1 (244/328) son inmutables. Tests de fuente no equivalen a pruebas de escena WebGL/Android, artes o éxito en los próximos diez trabajos. Catálogo `shared` no activado automáticamente.
