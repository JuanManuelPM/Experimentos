# PROMETEO 3D · Separación definitiva de apariencia y flujo

**Interfaz:** 2.1.0. **Flujo:** 1.1.0. **Estado:** candidato de ejecución del Estudio 3D, no aprobación artística.

| Si querés cambiar… | Editás solamente… |
| --- | --- |
| Colores, tipografía, tamaño, densidad, conectores o aspecto | `style.css` |
| Nombres cortos, secuencia visual, agrupación en paralelo y medidas del mapa | `PRESENTATION.json` |
| Qué tiene que hacer una IA, criterios de aprobación y vínculos de decisiones | Una NUEVA versión de `versions/<semver>/flow.json` y actualizás `FLOW_INDEX.json` |
| Una obra y su resultado real | `CREATIONS.json` + `FLOW_RUN_RECEIPT.json` del dueño |
| Reglas explicativas | `FLOW_3D_MASTER.md` por identificador (p.ej. D33, QA22) |

`app.js` contiene solamente el algoritmo genérico de interpretación de esquemas y SVG. No contiene el nombre de ninguna etapa, posicionamientos particulares del capítulo, cantidad de nodos ni rutas de proceso. El mapa completo se construye de la lista de nodos/aristas del JSON. No copies 244 cajas manualmente a HTML.

**Historial:** `versions/1.0.0/flow.json` continúa intacto; `1.1.0` suma diez decisiones de calidad. Una nueva UI no cambia el flujo. Un flujo nuevo no requiere rediseñar la UI.

**Cocina Umbría V2:** registro `cocina-umbria-002` tiene `NOT_STARTED` y ningún URL. El proyecto aún no se produjo ni publicó. El contrato detallado y el prompt están en `JuanManuelPM/pruebas@candidate/prometeo-3d-flow-kitchen-v2-ready-20261119:PROMETEO/spaces/studio-3d/works/cocina-umbria-002/`.

**QA:** el esquema `FLOW_RUN_SCHEMA.json` y `validate-run.mjs` impiden afirmar `VERIFIED` sin todos los controles con pruebas y aprobación humana. Ejecutar `node --test flow.test.mjs` después de editar el proceso. Pruebas de interfaz Chromium 390 y 1440 realizadas sobre datos reales mediante fetch inline, no equivalen a Android físico.

**Autoridad:** el control `prometeo/control`, las fábricas, el Atlas y FORJA no son alterados aquí.
