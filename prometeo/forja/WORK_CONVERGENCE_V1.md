# FORJA · Candidato de convergencia V1 · 2026-11-15

Se partió de `candidate/forja-loading-start-lock-v5-20261115` (`941a05c98d8d5621b2e9d4cc258ccca259b2d4f0`), que incluye importación transaccional y recuperación hasta V5.

Se integraron copiando **blobs exactos** las correcciones de dos ramas hijas de la misma C102: `candidate/forja-pause-transition-work-20261114` (pausa, cambio de modo y prueba de eventos) y `candidate/forja-fox-clip-fix-20261115` (resolver de clips reales `AnimalArmature|*`, escena y tests). Las rutas modificadas son disjuntas respecto de `forge.mjs` en V5. Ninguna claim ajena se editó.

## Instrucciones de prueba

Desde un clon autorizado: `bash prometeo/forja/tests/run-regression.sh`.

**Evidencia actual:** pruebas V8 sobre código leído de SHA exacto: 22 aserciones de pausa, resolución de Idle/Walk/Gallop y ambiguo, parseo sintáctico de FORJA V5, 4 escenarios de importación (overlay falla al abrir/cerrar; storage falla; camino feliz) PASS. No se ejecutó suite completa nativa Node sobre el checkout integrado y no hay mediciones WebGL2/Android; marcar `NOT_RUN` en esos medios. No se certifica QA visual ni producción.

## Integridad y procedencia

El archivo `tests/convergence-provenance.test.mjs` compara el SHA de blob de Git de los módulos heredados/importados con el SHA de las ramas fuente. Una modificación futura intencional requerirá actualizar esa verificación bajo revisión. Se deja esta candidata y PR en borrador hasta verificación independiente real.

## Rollback

Base segura sin esta convergencia: `candidate/forja-loading-start-lock-v5-20261115`; las ramas de origen se mantienen intactas. No tocar `master`, `gh-pages` ni el C102 original.
