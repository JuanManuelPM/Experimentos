# FORJA · aislamiento de rechazos asincrónicos de escenas antiguas

Fallo descubierto por revisión independiente del PR #10: si `modelTemplate()` rechaza tras comenzar `replaceScene`, `addAsset()` ejecutaba un `catch` sin fencing que incrementaba `state.failed` y mostraba error de la escena descartada. Test adversarial (Node) falló con 1 != 0.

Corrección candidata: en `catch`, salir sin efectos si es una inserción viva obsoleta (`state.busy || state.request !== requestBeforeLoad`), manteniendo errores legítimos actuales y los de `staging`. Se preserva íntegra la ruta de commit exitosa.

Pruebas: `node --test prometeo/forja/tests/pending-insert-stale-errors-v2.test.mjs`. En Node 22.16.0, 10/10 PASS con fragmento `addAsset()` exacto; con código original 7/10 PASS, 3/10 FAIL. Son tests de lógica/mocks; WebGL GPU y Android no ejecutados. No toca PR #10 ni `main`.
