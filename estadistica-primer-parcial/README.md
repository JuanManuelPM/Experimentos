# Estadística UP · Web de estudio modular V3

**Sitio público estable:** https://juanmanuelpm.github.io/Experimentos/estadistica-primer-parcial/

Este proyecto deja separado el contenido académico (nueve JSON individuales) del sistema de visualización (UI global). Los datos ya estaban mezclados en un HTML grande; ahora los cambios visuales no necesitan editar respuestas y los chats de unidad editan solo el JSON de su módulo.

- Comenzar por `docs/MANUAL_DE_PRODUCCION_V2.md`, **versión normativa**.
- Copiar exactamente `docs/PROMPT_UNIDAD.md` y completar el número después de `UNIDAD:`.
- Leer `docs/CONTRATO_DE_EDICION.md` para el esquema y reglas de concurrencia.
- `content/manifest.json` registra P1: M1–M4 y P2: M6–M10. P2 es borrador y se habilita automáticamente cuando una unidad está completa.
- Cambios visuales: `ui/styles.css`, `ui/components.js`, `ui/navigation.js`. No modificar JSON de unidades desde el chat de UI.
- Cambios editoriales: solo `content/units/Mn.json`.
- Verificar antes de publicar: `node tests/validate-content.mjs` o `node tests/validate-content.mjs M2`.
- Mantener los IDs de preguntas y el almacenamiento de progreso cuando no cambie la clave; ejercicios académicos originales con datos faltantes quedan sin verificarse hasta recuperar fuentes.

## Repaso para ambos parciales

La ruta principal de mañana usa los archivos `content/partials/P1.json` y `content/partials/P2.json`: seis temas por parcial, botón «Practicar» junto a cada tema y 13/14 ejercicios seleccionados con sus casos integradores. Ver `docs/RESUMENES_PARCIALES.md`; validar con `node tests/validate-partials.mjs`. El banco completo se mantiene en `content/units/`.
