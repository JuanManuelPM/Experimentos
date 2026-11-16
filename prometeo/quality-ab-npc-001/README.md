# Q3D-001 · Prueba A/B de calidad NPC

Publicación **aislada** del Estudio 3D de PROMETEO. El usuario autorizó agregar esta carpeta a gh-pages, sin sustituir las películas ni otros experimentos.

- Baseline real: \`../psx-after-hours/\` (ÚLTIMA PARADA), 15/11. **Proxy histórico**. No corresponde a las capturas exactas del NPC rechazado.
- Candidato: Quaternius **Casual.glb** CC0 con armature y clips (a confirmar en runtime), edificios y señales reales Kenney CC0, 14s, 4m + giro 90° + gesto. 3 cámaras y órbita 360.
- La malla humana y fachadas **no** están construidas con primitivos. Los planos de piso y marcas viales sí usan geometría básica justificada.
- GLB/URLs fijados a commits exactos. El runtime muestra conteos y errores, sin hacer pasar fallo de descarga por captura.
- **No está aprobado artísticamente**. WEBGL/GPU/ANDROID/REVISOR INDEPENDIENTE **NOT_RUN** desde el agente. No hay captura fabricada.
- El control "CORREGIR EJE" permite calibrar manualmente facing si el GLB muestra moonwalk. Ese control por sí solo no prueba corrección.
- Rama privada de evidencia y decisiones: \`JuanManuelPM/pruebas@candidate/prometeo-3d-q3d001-pilot-20261116\`.

Fuentes en \`asset-manifest.json\`, \`references.json\`, \`RESULT.json\`. No existe reproducción MP4, sólo animación WebGL determinista.