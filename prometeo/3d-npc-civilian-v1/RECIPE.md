# NPC civil v0.1.0 · pipeline inicial

Base: Quaternius Ultimate Modular Men, Casual_Hoodie.glb, CC0 1.0. Conversión de LuanDucate/Ducz.CharacterCreator, commit fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08, blob bdae92bff1aef0bf58b6bee99a3ea22a53cfd1c1.

## Reproducción

`python -m unittest -v source/test_derive.py` desde source. Luego `python source/derive.py --output dist` desde esta carpeta. Requiere Internet al construir, no requiere Blender ni pagos. Produce civil_azul.glb y civil_granate.glb, preservando la geometría/UV/rig y guardando report. Si el origen no tiene UV, pesos o cabeza: FAIL. Los sockets solo se crean donde se encontraron nodos de huesos, no se suponen.

## Límites estéticos

Esta primera versión usa tinte de materiales: es un candidato técnico y podría teñir la piel si el asset solo tiene un atlas. No confundir con dos diseños artísticos independientes. Antes de aprobar, inspeccionar cara y manos reales en varios acercamientos, validar el atlas y corregir tintes por zonas. El servidor de GitHub Actions descarga y verifica el SHA, no se simula un modelo inexistente.

## Alternativas investigadas

1. Quaternius: CC0, modular y con mallas/UV/rig en GLB. Elegida para canario porque no exige Blender local.
2. MakeHuman/MPFB: assets base CC0 y control facial superior, código AGPL/GPL; requiere ejecución de editor externo y creación de ropa. No disponible en este contenedor.
3. Kenney Animated Characters Retro: CC0 con skins y rig, pero tipología más caricaturesca y formatos originales FBX, menos adecuado para rostro PS2.

## v0.1.1 (corrección antes de publicación)
El primer build produjo dos GLB reales, pero el análisis de materiales encontró el defecto de tintar `Skin` y ausencia de sockets de muñecas (nombres originales `Wrist.L`/`Wrist.R`). Se preservan los primeros hashes como rechazo de prueba. La nueva receta cambia SÓLO materiales `Purple` y `LightBlue`; conserva `Skin`, `Hair`, `Eye`, `Eyebrows`, `White` y agrega anclas root/head/wrists. Test negativo obligatorio: si el build cambia piel/ojos/pelo o falta cualquiera de los 4 sockets, REJECT.
