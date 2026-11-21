# NÉBULO · Autómata expresivo / personaje 10

Estudio de personaje original para **PROMETEO · Estudio 3D · W4**, objetivo: mirar, reaccionar y manipular una semilla articulando hombros, codos, muñecas, pinzas, cabeza, ojos y cejas. Su forma nace de siluetas 2D originales convertidas en piezas 3D biseladas, no de cuerpos humanos armados con cajas.

## Uso
Abrir \`index.html\` desde la URL pública (GitHub Pages) o con servidor HTTP local. Controles: **Observar**, **Sorprender**, **Ofrecer tesoro**; arrastrar para orbitar, pellizcar para zoom. Menú ···: frontal, perfil, reiniciar, **exportar modelo GLB**. El GLB contiene la jerarquía y las mallas. La animación interactiva vive en \`actor.mjs\` y **no** se exporta como clips glTF.

## Decisión de arte PREVIA a producción
- **Ruta A, ilustración articulada 2.5D:** dibujo vectorial con piezas y bisagras. Viable, legible y económico, pero sin geometría volumétrica exportable.
- **Ruta B, modelado paramétrico editable:** contornos originales extruidos, piezas encastradas, ojos y máscara, rodamientos ornamentales, pivotes nombrados e IK de dos segmentos; admite GLB. **Elegida** por adecuación al autómata inspeccionable y reutilizable.

No se descargaron modelos, texturas ni personajes ajenos. Three.js se consume en versión fija **0.160.1** desde CDN, bajo licencia MIT; por tanto **se requiere red** para arrancar y exportar. Biblioteca: https://threejs.org/license/ . El exportador es \`three/addons/exporters/GLTFExporter.js\`.

## Contrato y límites
- Rama privada dueña: \`JuanManuelPM/pruebas@candidate/3d-personajes-automata-actor-wave004-20261121\`.
- Fuente pública: \`JuanManuelPM/Experimentos@gh-pages/prometeo/previews/wave004/personajes/automata-actor/v1/\`.
- Flujo fijado: \`2.3.0\`, SHA256 canónico \`53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f\`.
- Brief SHA256: \`b58589798f592f6799665a9e8690233b7d312e9b0f65288e78e70a97bfec7f31\`.
- Fuente editable: \`actor.mjs\`, jerarquía descriptiva \`CHARACTER_COMPONENT.json\`, brief \`BRIEF_LOCK.json\`.
- No se afirma medición de GPU, prueba Android, aprobación estética ni exportación GLB descargada en un navegador. Los estados de QA preservan **NOT_RUN** si no hay ejecución real.
- Modelo estático exportable con pivotes transformables; no incluye esqueleto skinned, dinámica física, IK de profundidad ni facial morph targets.

No se modifica el flujo universal, los briefs, catálogos, ramas de otros chats ni otros productos.
