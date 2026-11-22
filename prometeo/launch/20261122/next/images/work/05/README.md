# PROMETEO · IMAGES W002-05 · MAREA DE VIDRIO

**Identidad:** `images-w002-20261122-05` · batch `images-w002-20261122` · task 5 · encargo [LAUNCH.md](../../LAUNCH.md), blob `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`.

**Estado de obra:** `LOCAL_DELIVERED` · `PUBLIC_IMAGE_BINARIES_NOT_PUBLISHED` · `PRINT_READY=false` · `HUMAN_APPROVED=NOT_RUN`.

## Material entregado en la conversación

Se produjo un sistema original para el álbum electrónico **ficticio** MAREA DE VIDRIO, del artista ficticio **SILTE**, con raster auténtico y texto compuesto fuera del generador:

1. Tapa cuadrada 3900 × 3900 (JPG RGB).
2. Contratapa cuadrada 3900 × 3900 con seis canciones ficticias.
3. Funda interior cuadrada 3900 × 3900, cara plana.
4. Afiche vertical 2400 × 3600.
5. Banner horizontal 3840 × 2160.
6. Contact sheet, prueba a 96 px y 320 px, vista conceptual de vinilo y tres TIFF CMYK de prueba.

Los cinco JPEG de producción se verificaron por Pillow, con dimensiones, modos y SHA256 en el ZIP de la conversación. **No existen enlaces públicos de GitHub confirmados para esos JPG, PNG, TIFF o ZIP**: su publicación binaria está pendiente. No confundir este README con archivos multimedia publicados. La vista del vinilo es una composición conceptual, no fotografía de un objeto producido.

## Criterio artístico y sistema

El motivo central es una ola de vidrio ahumado detenida antes de romper: azul petróleo profundo, superficie reflejante y una corriente ámbar atrapada dentro. La misma fuente raster se reencuadra para portada, contratapa, funda, afiche y banner, con cambios auténticos de jerarquía. El principio no es un logo repetido, textura de ruido o glitch indiscriminado. Leer [GRAMATICA_VISUAL.json](GRAMATICA_VISUAL.json).

**Fuentes:** imagen principal original generada específicamente para esta obra (1254 × 1254 px); composición original con Pillow; tipografía Inter Display, Lato y DejaVu Sans Mono instaladas en el entorno y **no redistribuidas como binarios**. No se incorporaron fotografías ni diseños de las referencias investigadas.

## Preproducción y QA

- [Ficha profunda en la rama exclusiva](https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-images-w002-05-20261122/prometeo/works/images/images-w002-20261122/05/PREPRODUCTION.deep-spec-v1.json).
- [QA_REPORT.md](QA_REPORT.md) separa pruebas reales, límites y pruebas pendientes.
- La validación estructural DEEP-SPEC-1 resultó READY_FOR_FIRST_SLICE (mismas reglas lógicas del validador, ejecutadas sobre el JSON en runtime JS). Esto **no** es aprobación artística y la CLI Node no se ejecutó.
- El código fuente `build.py`, `mockup.py`, el raster fuente y manifiesto SHA256 están dentro del ZIP de la conversación. Para reproducción exacta, mantener juntos esos archivos. No se subieron aquí los binarios.

## Benchmarks observados

- [Bedow / More Than Human](https://www.bedow.se/work/more-than-human/) · sistema material y editorial reconocible entre discos.
- [Monotype / Hugh Miller](https://www.monotype.com/resources/expertise/hugh-miller-istd) · relación entre tipografía, material y música.
- [DAG album / Maimon](https://maimon.fr/en/case-studies/dag-album-art-direction/) · técnica expresiva que atraviesa funda, libro y detalle.
- [Press On Vinyl](https://pressonvinyl.com/artwork/) · condiciones de preprensa que no equivalen a un visto bueno de fábrica.

**Brecha principal:** los 3900 px son un upscale del master original de 1254 px. A 12.375 pulgadas, el máster nativo equivale aproximadamente a 101 ppi. El TIFF CMYK no incluye perfil ICC de taller, ni se calibró con plantilla/dieline o prueba física. Por eso `PRINT_READY=false`.

**Aprendizaje para el Estudio de Imágenes:** `stage=print-preflight; cause=native_art_resolution_below_print_target; preventive_gate=record_native_render_dimensions_and_effective_ppi; test=inspect_source_pixels_vs_trim_size; owner=images; counterexample=3900px_file_from_1254px_master_is_not_native_300ppi`.

No se alteraron las obras W001, los otros nueve números de W002 ni el flujo especializado activo.
