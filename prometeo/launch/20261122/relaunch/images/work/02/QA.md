# QA · Patio de Invierno · W003/02

**RESULTADO: PARTIAL** · primera imagen fotográfica existente, continuidad geométrica demostrada en tres cámaras, fotorrealismo multivista **NO ALCANZADO**.

| Oráculo anticipado | Evidencia | Estado |
|---|---|---|
| Primera imagen significativa, sin UI decorativa | Foto original 1536×1024 (ZIP adjunto del chat) | OBSERVED |
| Segunda imagen conserva el mismo tema | Generación #2 devolvió póster del Coliseo de PROMETEO | FAILED; descartada |
| Mismo mundo para cámaras A/B/C | Modelo único VTK 9.6 y planta, tres renders de 1440×960 en ZIP | OBSERVED |
| Tres vistas finales fotorrealistas del mismo modelo | Renderer VTK todavía CAD-like, no foto-grade | NOT_RUN / BLOCKED |
| Luz física realista, sombra de contacto, materiales ópticos | Luz direccional no calibrada, render PBR básico | NOT_RUN |
| Fotos originales disponibles desde GitHub | Binarios no publicados en esta rama | NOT_RUN |
| Captura real 390 y 1440 en navegador | No se capturó sitio remoto | NOT_RUN |
| Aprobación artística independiente | No hubo aprobación humana | NO |

## Dimensiones e invariantes

Interior 7,20 × 6,00 × 3,40m. Plantación central 2,68 × 1,41m, olivo (3.64,3.02), lucernario 3,25 × 2,55m, banco de roble en oeste, vidrio este y revestimiento de listones en norte. No se mueve ni regenera ningún elemento entre renders de modelo. Tres cámaras independientes: ingreso (1.25,0.58,1.63), diagonal (6.24,1.18,1.61) y detalle (5.11,3.12,1.13). Ver `SCENE_CANON.json`.

## Referencias profesionales realmente revisadas

- [Beyond the Courtyard House / RCAB Studio](https://www.archdaily.com/1043006/beyond-the-courtyard-house-rcab-studio): patio como motor de luz natural, ventilación y circulación. Traducción: abertura medida, no patio como simple escenografía.
- [Canterbury Road Residence / B.E Architecture](https://www.archdaily.com/804630/canterbury-road-residence-be-architecture): continuidad de piedra/travertino, madera y luz natural. Traducción: mismos materiales con posición fija.
- [Casa Helios / Estudio DSB](https://www.behance.net/gallery/149558945/Casa-Helios-Estudio-DSB-Arquitectura): fotografía de patio con cantero, vidrio y luz rasante sobre pavimento. Traducción: protagonista vivo con anclajes estables.

**No se incorporó ni copió ninguna foto de referencia como final.**

## Diferencia contra W002/02

W002/02: tres *crops* de plancha única, sin cámaras geométricas verificables. W003/02: tres renders de cámaras geométricamente distintas sobre una escena fija y planta de escala. Es una mejora **en verificabilidad geométrica**, no una prueba de mejora fotorrealista. El primer método de foto independiente falló semánticamente, se activó representación 3D, y esta tampoco alcanzó acabado de fotografía. No se declaró éxito por cambiar de técnica.

## Análisis preventivo

`stage=FIRST_ARTICLE` · `cause=generación de fotos sin anclaje a cámara/modelo; segundo resultado fuera de tema` · `preventive_gate=probar segunda vista real del mismo mundo antes de producir serie` · `test=proyección y conservación de hitos a 390/1440 e inspección de materiales/luz` · `owner=images/02` · `counterexample=póster PROMETEO en lugar del patio`.

No tocar W002, no compartir ramas ni autopromover flujos. El siguiente intento debe usar una representación capaz de entregar **las tres imágenes finales** del mismo modelo (por ejemplo, escena profesional con materiales PBR, vegetación de calidad y GI), además de publicar raster originales con lectura remota.
