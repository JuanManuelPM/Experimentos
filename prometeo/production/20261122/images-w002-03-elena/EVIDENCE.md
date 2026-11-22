# EVIDENCE · ELENA · images-w002-20261122-03

## Referencias verificables, sin copiar imágenes ajenas

1. [Walt Disney Family Museum, Character Worksheet](https://www.waltdisney.org/sites/default/files/SW.worksheets.final.pdf) · los model sheets vinculan poses y expresiones.
2. [Walt Disney Animation, Look Development](https://www.disneyanimation.com/process/look-development/) · materialidad, pelo y acabados se diseñan como partes del personaje.
3. [Ainsworth Lin, Character Design](https://www.ainsworth-lin.com/character-design) · los paneles de expresiones conservan identidad.
4. [ArtStation, Noor Character Model Sheet](https://www.artstation.com/artwork/Jw9Q3R) · proporciones y vistas de construcción.

## Contraste de calidad

| Meta | Decisión ejecutada | Evidencia | Brecha restante |
| --- | --- | --- | --- |
| Un mismo personaje multivista | Fijar un compuesto con frente/3⁄4/perfil y canon | PNG maestro local + canon JSON | La postura no es ortográfica y cambia el brazo |
| Mímica fiel al rostro | Cuatro expresiones en una misma pieza | Lámina de expresiones local | Revisión ciega no ejecutada |
| Materiales reconocibles | Abrigo de lona añil, chaleco, cobre y cuero, instrumentos legibles | Estudio de detalles local | No equivale a especificación técnica industrial |
| Anatomía verificable | Marcar 7 hitos en 3 vistas | Overlay PNG local | No prueba anatomía volumétrica ni rig 3D |

## Defecto y prevención

`stage=multivista` · `cause=modelo generativo sin geometría compartida` · `preventive_gate=landmarks y rasgos invariables` · `test=comparación ciega y overlay` · `owner=images` · `counterexample=mano en bolsillo en una vista y fuera en otra`.

**Estados:** `LOCAL_RASTER_OBSERVED`; `DEEP_SPEC_LOGICAL_GATE_PASSED`; `PUBLIC_MEDIA_UPLOAD_BLOCKED`; `INDEPENDENT_ART_QA_NOT_RUN`.
