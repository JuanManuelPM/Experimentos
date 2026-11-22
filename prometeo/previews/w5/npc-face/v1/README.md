# NPC civil · W5 · revisión facial 01

**Estado:** CANDIDATO PUBLICADO. Código leído de nuevo en `gh-pages`. Render nuevo WebGL, animación, exportación GLB e inspección artística: **NOT_RUN**. No declarar aprobación humana.

## Artefacto
- [Comparador W5 público](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/npc-face/v1/).
- [Original V1 intacto](https://juanmanuelpm.github.io/Experimentos/prometeo/3d-npc-civilian-v1/viewer/).
- Código dueño: `JuanManuelPM/Experimentos@candidate/3d-w5-npc-face-20261121:prometeo/previews/w5/npc-face/v1/index.html`.
- Publicación aislada: `JuanManuelPM/Experimentos@gh-pages:prometeo/previews/w5/npc-face/v1/index.html`.

## Recuperación y elección preventiva
- Lanzador exacto `3d-flow/w5/LAUNCH.md#06-npc-civil`; método `3d-flow/versions/2.3.0/METHOD.md`.
- Recuperados V1, README, build report, QA WebGL anterior, posiciones de la malla de cabeza, imágenes reales de rostro/cuerpo/vestuario y dos archivos GLB originales CC0.
- Alternativa A: reconstruir y volver a exportar los modelos en modelador externo (mayor control visual, ejecución y QA no disponibles aquí).
- Alternativa B adoptada: esculpir sobre copia **real** de la geometría de cabeza y ropa heredada en Three.js, con el rig y UV originales, manteniendo junto al resultado el personaje sin modificaciones. No se fabrica un humano nuevo a partir de esferas/cilindros.
- La revisión estrecha los planos de la mandíbula y ajusta nariz/mentón/pómulos; en la ropa afina ligeramente cintura, bolsillo y puños. Es un primer pase de dirección de arte, no una malla final aprobada.
- Para cada skin (`azul`, `granate`) se clona la jerarquía con `SkeletonUtils`, sólo se clona geometría donde hay cambios, y se falla si el archivo no contiene superficies objetivo. Se conserva la atribución Quaternius CC0.
- Original y revisión se muestran en dos paneles con la misma cámara y la misma selección de clips heredados, con controles rostro, frontal, lateral, tres cuartos, cuerpo, quieto y caminar. El botón GLB revisión intenta exportar la copia esculpida desde el navegador, sin sustituir los GLB originales.

## Evidencia y límites
| Prueba | Estado | Motivo |
| --- | --- | --- |
| Autoridad, fuente y licencia | VERIFIED | V1 + BUILD_REPORT.json; base Quaternius CC0 |
| Integridad de fuente W5 en GitHub | VERIFIED | Readback de rama candidata y `gh-pages`, mismo blob SHA `0ab3b41b6a9a6462e27968dd5ed6431f6583f674` |
| Presencia estática de dos skins, vistas, ediciones de vértices, mixers y exportador | VERIFIED_STATIC | Lectura y búsquedas en fuente publicada |
| Nuevo render de cara, frente y perfil | NOT_RUN | No se dispuso de navegador WebGL operativo desde este turno |
| Animación de caminata/idle de cada GLB | NOT_RUN | El código selecciona clips por nombre; no se comprobó su ejecución visual |
| Exportar e importar GLB revisado en FORJA | NOT_RUN | No declarar compatibilidad sin probar |
| Dispositivo Android físico / 320 y 390 px reales | NOT_RUN | CSS responsivo presente, no test interactivo físico |
| Aprobación artística humana | PENDING | El sistema no aprueba su propia calidad estética |

**Riesgo conocido:** los offsets de esculpido usan coordenadas observadas de `evidence/head_geometry.json` y los nombres de malla/material de `dist/BUILD_REPORT.json`; una variante futura puede alterar el contrato y abortar. Tampoco se certifica que la deformación en movimiento no produzca artefactos hasta hacer QA WebGL.

## Resultado
Una revisión geométrica no destructiva e inspeccionable, dos vestuarios de origen, comparador simultáneo y ruta de exportación opcional. El nuevo HTML se publicó sin modificar V1 ni otras rutas W5. **No reportar pantallazos inventados, GLB nuevo en GitHub ni QA artística exitosa.**
