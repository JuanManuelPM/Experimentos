# PROMETEO 3D · Método candidato ART-DIRECTION / FIRST ARTICLE V2
**Estado:** \`CANDIDATE_NOT_PROMOTED\`. Propietario: estudio 3D. Padre histórico: [2.3.0](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/3d-flow/versions/2.3.0/METHOD.md) (\`FLOW_INDEX.current=2.3.0\`). No se cambia dicho índice, 17 etapas existentes, lanzador, obras W6 ni fuentes privadas. Esta capa es una propuesta de delta, **no un workflow automáticamente promovido**.

## Cambio causal (no ritual)
En 01, un veto textual a caras de primitivas permitió terminar otra cara hecha de primitivas. En 02, un raycast central de oclusión no impidió una pared sobre el fotograma completo. En casi todas las tareas se declaró \`SOURCE_PUBLISHED\` y se dejó \`GPU_NOT_RUN\`. La causa no es que falten normas: falta una **decisión irreversible de técnica condicionada por un primer componente realmente observado**.

**Antes de fabricar el resto de la obra (preproducción QBAR/DEEP-SPEC):**
1. Identificar la promesa perceptual principal (actor de primer plano, interior explorable, máquina, mapa, editor, bosque). No forzar humano digital en trabajos que no lo necesitan.
2. Estudiar al menos una referencia real pertinente y extraer qué anatomía/encuadre/escala/material/interacción hace visible el salto. Referencia no observada se anota \`REFERENCE_NOT_RUN\`; página de documentación no es render.
3. Comparar **dos familias de representación realmente diferentes**, con disponibilidad, licencias, incompatibilidades y coste. Ejemplo 01: malla orgánica integrada y rig/shape keys/glTF autorizado; alternativa válida: actor ilustrado 2.5D con acting y dirección consistente. **No** tratar \`SphereGeometry + más objetos pegados\` como una alternativa distinta.
4. Construir **primer artículo vertical** de alto riesgo, guardar imágenes reales de frente/perfil/close-up en personajes, o cámara cerca de pared/vano/sala en 390 y 1440 para arquitectura. La prueba debe poder **obligar a cambiar técnica**. Si falla, volver al punto 3: no repintar ni escalar defectos.
5. Sólo entonces crear la escena completa, conservar las pruebas normales de colisiones, mecánica y autoría. Queda prohibido confundir test matemático, prueba de JSX/HTML, HTTP 200, o archivo publicado con observación de calidad.
6. Repetir examen perceptual de primer componente al integrar luces/materiales/acting; registrar los estados por separado \`SOURCE_VERIFIED\`, \`BROWSER_OBSERVED\`, \`ART_REVIEWED\`, \`EXPORT_PLAYBACK_VERIFIED\`, \`HUMAN_APPROVED\`. Ninguna autorización humana implícita.

## Primer artículo por tipo de obra
| Disciplina | Prueba que cambia de técnica ANTES del producto | Contraejemplo que obliga a volver a elección |
| --- | --- | --- |
| Actor | busto de 3 planos, ojos/nariz/piel/pelo/fabric unidos por lenguaje, rig y audio corto | nariz/mejillas como piezas pegadas, gestos discontinuos |
| Arquitectura | mismo recorrido pared-vano-interior en 390 y 1440; porcentaje de protagonista oculto medido en frame | raycast al centro sin visibilidad real |
| Mundo | locomoción, contacto y NPC con una misión breve completa | se desliza, atraviesa, final no observable |
| Cine | dos planos con continuidad, actuación legible, export de tres segundos verificable | timeline correcto, archivo ausente |
| Mecanismo | leva-seguidor/engranaje con contacto barrido en 360° y sección | piezas decorativas sin conexión |
| Bosque | una especie a tres distancias, dos condiciones estacionales, presupuesto GPU | miles de instancias con copa incoherente |
| Captura | dataset real, permiso compatible, ejemplo alineado contra foto original | foto ajena del mismo sitio presentada como calibración |
| Atlas | respuesta HTTP real de DEM+capas y tres hitos alineados | un servicio remoto declarado pero no disponible |
| Editor | importar GLB legal con jerarquía, mover, guardar, recargar y comparar | 11 unit tests de proyecto con cero assets |
| Producto | bisagra funcional, interferencia, lista BOM y escala, un ciclo de plegado | piezas que intersecan, cotas inventadas |

## Implementación candidata verificada por lógica
- [art-direction-gate.mjs](./art-direction-gate.mjs): validador puro sin dependencias de Node para preproducción. Exige alternativas de técnica, referente realmente observado **según lo reportado**, procedencia y licencias, primer artículo por especialidad, capturas multivista y evidencia móvil/desktop para cámara. Veto contextual a rostro cinematográfico collage no intencional; no prohíbe un cilindro en un mecanismo, ni low-poly coherente intencional.
- [art-direction-gate.test.mjs](./art-direction-gate.test.mjs): fixtures **SINTÉTICOS**, con contraejemplos de cara, pared, licencia, autocalificación, y control positivo de mecanismo. URLs \`example.org\` sirven sólo para demostrar VALIDACIÓN DE CAMPOS, nunca para probar capturas; un worker debe reemplazarlas por evidencia real.
- [browser-audit.mjs](./browser-audit.mjs) y [GitHub Actions](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-3d-autocritica-v2-20261122/.github/workflows/prometeo-3d-audit-v2.yml): runner sin cron, captura los nueve URLs declarados en ROOT con Chromium 390/1440, 01 vistas, 02 ambientes, 06 estaciones. Produce \`QA/screens/NN\` + manifiesto con HTTP, canvas/contexto, errores, bytes y variación de color; si navegador/CDN falla, lo deja explícito. **Variación cromática no es medida de belleza** y el script no verifica pantalla móvil física.
- [AUDIT_10.md](./AUDIT_10.md): la evidencia real disponible y las diez posiciones, con límite de observación diferenciado.

## Prueba, alcance y rollback
El validador se ejecutó **in-memory sobre 10 fixtures** en el mismo motor JavaScript que construyó el archivo: 10/10 estados esperados. Este resultado prueba consistencia lógica, **no** QA artístico. El archivo de pruebas Node se agrega para CI de la rama; el veredicto de CI se toma únicamente de su log real, no de que el archivo exista. Los runners 3D publican screenshots como artifact de Actions sólo si fueron ejecutados con éxito; no escribir PNG inventado en repo. La calidad de 01/02 es una observación humana real **transcrita** en el protocolo y no una captura creada por esta rama.

Promoción futura: ROOT revisa evidencia real 9/10 + N10 cuando exista, discute las diferencias, integra sólo el delta útil en propietario 3D y conserva la opción de revertir al método 2.3.0. No lanzar nueva tanda desde este flujo. Rollback inmediato: no integrar esta rama.
