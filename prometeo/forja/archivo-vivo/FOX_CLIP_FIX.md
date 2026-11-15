# FORJA · Fox GLB clip fix (WORK ONE-SHOT 2026-11-15)

**Fuente del fallo:** auditoría independiente C113 del repositorio privado `JuanManuelPM/pruebas` detectó que 3/3 controles Idle, Walk y Gallop no encontraban clips al usar coincidencia exacta: los nombres reales del Fox GLB están prefijados `AnimalArmature|`.

**Corrección:** nuevo `clip-resolver.mjs` (coincidencia exacta primero, fallback de sufijo después del último | solo si es único, error ante ambigüedad). En `scene.mjs` se usa el resolver y los errores de clip quedan visibles aunque termine la carga del resto de la escena.

**Tests:** `node --test clip-resolver.test.mjs` cubre nombres Fox reales, controles, nombre sin prefijo, ambigüedad y clip ausente. No se alteran los GLB, licencias ni el claim original C101.

**Límite:** verificación de resolución de nombres y sintaxis ≠ reproducción observada en navegador GPU/Android. Este entorno carece de WebGL2; la transición real de pose y el render de los 4 assets quedan pendientes. No merge a producción ni declaración SUCCESS del C101 original.
