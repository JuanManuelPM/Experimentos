# LÚMINA / BRUMA 01 — campaña editorial

**Identidad:** `batchId=images-w002-20261122` · `taskNumber=1` · `taskId=images-w002-20261122-01`.

**Brief fijado:** `JuanManuelPM/Experimentos@gh-pages:prometeo/launch/20261122/next/images/LAUNCH.md` SHA `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`. QBAR-1 y DEEP-SPEC-1.

## Estado real

**DELIVERED_LOCAL / PUBLIC_RASTER_NOT_VERIFIED.** Los PNG originales y el paquete reproducible se entregaron en la conversación que lanzó WORK 01. Esta página es evidencia documental del trabajo, **no** prueba de que el binario raster se encuentre publicado en GitHub. No atribuir un PNG a un enlace de Markdown.

## Trabajo visual

**LÚMINA** es una marca ficticia de lámparas artesanales. La pieza inventada **BRUMA 01** contiene una pantalla orgánica de vidrio translúcido, collar metálico, base de cerámica con dos anillos, y emisión ámbar sobre estuco y piedra.

- `00_HERO_original.png` — visual protagonista sin texto, 1672×941.
- `01_POSTER_2400x3200.png` — afiche editorial, papel hueso, titular grande.
- `02_SQUARE_1600x1600.png` — cuadrado social, bloque oscuro y recorte fotográfico.
- `03_WEB_BANNER_2560x1152.png` — cabecera web con tipografía en espacio negativo.
- `04_STORY_1080x1920.png` — historia móvil, producto grande y panel inferior.
- `CONSISTENCY_PLATE.png` — lámina de contraste con los cuatro soportes.

Se generó un único raster original y se diseñaron cuatro composiciones editoriales distintas con Pillow. No se usaron imágenes de los referentes.

## Sistema reutilizable

**Palette:** ink `#211710`, bone `#F2E8D8`, oxide `#9A4E34`, bronze `#BE8562`. **Typography:** Noto Serif Display Light + Noto Sans, fuentes libres instaladas localmente, no redistribuidas. **Grammar:** cuatro recetas por proporción; no reutilizar un único cartel reescalado; proteger el objeto, su materialidad y luz cálida.

## Investigación externa observada

1. [Pentagram · Royal Drawing School](https://www.pentagram.com/work/royal-drawing-school) — dirección fotográfica de materiales/procesos y sistema tipográfico multisoporte.
2. [Pentagram · The Meteor](https://www.pentagram.com/work/the-meteor) — fotografía, jerarquía de tipos y color como kit modular.
3. [Flos · Luce Sferica & Cilindrica](https://professional.flos.com/en/global/stories/stories-luce-sferica-and-luce-cilindrica/) — relato material del vidrio soplado y luz como protagonista.
4. [Bocci · Shapes of Light](https://bocci.com/projects/shapes-of-light/) — **INDEXED_ONLY**, la fuente completa estaba bloqueada.

## QA y brecha

- **OBSERVED_LOCAL:** PNG válidos y no vacíos, SHA256 y dimensiones auditados; inspección de story, banner y atlas. Se reparó el recorte superior del vidrio en banner.
- **READY_FOR_FIRST_SLICE:** preproducción local DEEP-SPEC-1 comprobada con un espejo fiel del validador canónico. Este gate no acredita arte profesional.
- **NOT_RUN:** evaluación ciega por terceros, prueba física de impresión, evaluación independiente y readback del material raster en Pages.
- **LÍMITE:** la resolución fotográfica nativa 1672×941 no se convierte en información óptica de imprenta nativa por ampliar una composición a 2400×3200.
- **HUMAN_APPROVED:** NO.

**Fallas/prevención:** `stage=LAYOUT`, `cause=vertical focus cropping`, `preventive_gate=full-object-silhouette-check`, `test=visual review of portrait and banner crops`, `owner=images`, `counterexample=top of diffuser missing`. El banner se corrigió antes de exportación final.

Este trabajo no altera lanzadores, obras W001 ni otros números W002; la rama es exclusiva de 01.