# ROOT · ÚNICA URL PERMANENTE

https://juanmanuelpm.github.io/Experimentos/prometeo/root/

**Nueva entrada ROOT:** [DEEP-SPEC-1 · preproducción profunda universal](DEEP_SPEC_V1.md) · [pruebas lógicas y pendientes](../launch/20261122/DEEP_SPEC_TESTS.md). El método compartido está versionado y no modifica los 10 briefs ni inicia trabajos.

1. `PROGRAM.json` mantiene `stages` (etapas hasta la consolidación) y `active` (fase/ola/método y brief inmutables, 10 launchers y rutas públicas).
2. HTML único y fijo: muestra 10 prompts «Copiar»; detecta preview automáticamente por HTTP HEAD cada 35 segundos y al volver al navegador. Rojo=no copiado en ESTE navegador. Amarillo=copiado local, NO significa enviado. Verde=existe index.html público, NO significa QA o chat completado.
3. Seleccionar `Ver` permite abrir vista; escribir una observación por número y marcar candidato (persisten localmente en el dispositivo). `Copiar CALIBRAR` genera texto con críticas, refs, etapa, ola, hashes, URLs para pegar en un chat Ideas. No descarga nada ni envía comentarios a la nube.
4. Cuando diez intentos estén revisados, Ideas analiza trazas y propone una sola versión mejorada del método, NO diez prompts nuevos. Repetir exactamente el mismo brief en diez destinos nuevos para comparar. Puede repetirse en la misma etapa indefinidamente de forma controlada.
5. Tras aprobación del usuario, un agente autorizado genera la siguiente ola o fase, actualiza sólo `active` de `PROGRAM.json` (y sus lanzadores/versiones) con CAS/readback. No cambia esta URL ni necesita reconstruir la página. Próxima fase sigue el programa.
6. Cualquier artefacto experimental es descartable previa aprobación; conservar los hashes, briefs, trazas, observaciones y candidato elegido. Git history puede retener bytes antiguos. NO garantizar borrado físico ni automatismo de recolección.
7. Sin backend ni autenticación: notas/estado amarillo no se comparten entre dispositivos; verde sí por publicación pública. No hay forma de detectar automáticamente que un chat recibió un prompt, sólo que se copió y apareció un HTML seguro.
8. Proteger fuentes privadas y credenciales; no dar a la página acceso de escritura a GitHub. No tocar método 3D 2.3.0 ni otros estudios.

Estado: base de portal implementada y fuente/JS verificada. QA navegador Android y ejecución de las diez producciones NOT_RUN.
