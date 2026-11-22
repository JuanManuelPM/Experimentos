# PATIO DE INVIERNO · W002/02

**Identidad:** images-w002-20261122-02 · **BRIEF SHA:** `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1` · **Contrato:** QBAR-1 / DEEP-SPEC-1.

## Producción concreta

Se generó una obra visual original fotorrealista, compuesta de tres vistas desde **ingreso / diagonal / detalle**. Se extrajeron tres PNG sin interpolación y se generaron fuera de GitHub una planta acotada original, atlas, ZIP, especificación profunda y QA. **Los PNG originales están entregados en el chat generador, no publicados en este commit.** No reemplazar esa limitación por imágenes falsas o enlaces inexistentes.

Se definió un recinto de **7,20 × 6,00 × 3,40 m** con jardín vidriado **2,75 × 2,85 m**, roble y travertino, árbol multitrónco, roca de referencia y banco lateral. Ver `SCENE_CANON.json` para coordenadas y cámaras.

## Evidencia y límites

- Tres raster entregados: 01_INGRESO.png (1027×506); 02_DIAGONAL.png (758×510); 03_DETALLE.png (771×510).
- Ver `PREPRODUCTION.deep-spec-v1.json`: cuatro decisiones implementables; gate local `READY_FOR_FIRST_SLICE`; **no es certificado artístico**.
- Leer `QA.json` para SHA y observaciones.
- Comparten rasgos visuales, pero **no hay prueba de que los píxeles deriven de una sola malla 3D con cámaras coherentes**: `GEOMETRIC_CONTINUITY_NOT_VERIFIED`.
- Tampoco hay simulación solar trazada ni aprobación humana, y los recortes nativos tienen resolución insuficiente para afirmar calidad de imprenta.

## Referencias

[Photographer's Loft, Desai Chia](https://www.desaichia.com/photographers-loft); [Newcastle Courtyard House, RIBA](https://www.riba.org/explore/awards/uk-awards/regional-awards/2026/north-east-awards-2026/newcastle-courtyard-house/); [Archviz Interior Rendering, Epic](https://dev.epicgames.com/documentation/en-us/unreal-engine/archviz-interior-rendering?application_version=4.27). Material de terceros **no incorporado** a las fotografías.

## Aprendizaje

STAGE=QA · CAUSE=El renderizador generativo no recibió geometría real · PREVENTIVE_GATE=No declarar continuidad física sin cámaras que rendericen un mismo SCENE_CANON · TEST=Reproyectar puntos ancla y sombras · OWNER=Estudio de Imágenes · COUNTEREXAMPLE=Tres fotos similares que rotan la roca o cambian el tamaño del banco.
