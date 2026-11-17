# METHOD_DELTA · Character Factory V2 · Editor UV

**Hipótesis inicial falsada con GLB auténtico:** no basta con encontrar `TEXCOORD_0`. En `civil_azul.glb` v0.1.3 hay once primitivas con UV declaradas, **diez con todos los vértices en (0,1)**. Antes de pintar, incluir el gate `UV_USABLE` con área UV no nula y test negativo de coordenadas degeneradas. La boca original tiene UV propio; rostro y prendas no.

## Alternativas y elección

1. **Pintar UV original sin revisar:** rechazado, produciría recolor plano, no ubicación de imagen.
2. **Blender / MPFB unwrap:** alternativa artística superior para seam marking, atlas profesional y texturas semánticas. No instalado aquí (comprobado `blender`, `bpy`), no afirmar ejecución.
3. **Proyección front/back derivada desde malla real:** elegida como canario sin modificar origen. Utiliza POSITION, NORMAL y accesor UV existentes. Front `u=.02..48`, back `u=.52..98`, v por altura. No se crean vértices ni se altera topología, joints, weights, huesos, nodos ni clips. Es reproducible por JS y Python, con etiqueta UV **DERIVADA**, no atlas artístico verificado. Riesgos: costuras, estiramiento, overlaps y normales con borde duro.

## Calibración independiente

- GitHub Actions inicial falló por ausencia de `evidence/`; corrección `mkdir -p`.
- Segundo run falló porque Ubuntu 26 no soportó Playwright 1.56.1; cambio explícito a runner `ubuntu-24.04`.
- Primer WebGL real probó que un PNG sólido sobre UV degenerada solo recoloreaba las manos. Detectó 3.876 píxeles modificados, pero **NO** una imagen localizada en cara/ropa. No promover ese resultado.
- El exportador web Three GLTFExporter validado solo por firmas de mallas parecía pasar, pero el binario reimportado pasó de 1 skin en origen a **11**. Se endureció el gate para comparar cantidad total de skins/animaciones y cancelar esa exportación, dejando PNG+receta.
- El bake Python de glTF2 reescribe UV y añade una imagen PNG a **copia derivada** sin tocar ningún atributo no UV, ni nodes, skins o clips. Compara bytes/valores y conserva **1 skin, 24 animaciones, 5 meshes, 11 primitivas**. SHA derivado: `db185749e17a7612ac12b3b6ccddf63dee8c5201c449ec27d83f6ce4086d6ac1`.
- Canario FINAL GitHub Actions `44150178247`: WebGL2 real, captura antes/después misma cámara, **21.660 píxeles distintos** con imagen localizada en el rostro, reimport del GLB bakeado con PNG visible, interfaz móvil 320px sin negro/scroll horizontal. `node --check`, 9 tests JS, 6 Python PASS. Android físico y playback visual de los 24 clips **NOT_RUN**.

## Aprendizaje reutilizable propuesto (sin promover)

`VALIDATE_UV_SPREAD -> AUTO_UV_DERIVATION_WITH_PROVENANCE -> IMPORT_LOCAL_IMAGE -> BAKE_ORIGINAL_BINARY -> COMPARE_SKIN_NODE_ANIMATION -> WEBGL_SCREENSHOT_SAME_CAMERA -> ART_QA`. Incorporar estos gates a futuras fábricas character/material solo mediante propuesta revisada; **no** editar índice global ni el NPC original.

**Rollback:** eliminar solo los derivados y volver a la fuente con SHA fijo. Las fotos locales nunca se suben automáticamente; el atlas/receta JSON es el flujo portátil.
