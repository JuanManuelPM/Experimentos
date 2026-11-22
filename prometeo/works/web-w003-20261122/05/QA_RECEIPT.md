# LENTO 01 · Recibo de producción WEB W003 / 05

- **TaskId:** `web-w003-20261122-05`. **LAUNCH SHA:** `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35`. **Anterior:** `web-w002-20261122`, LAUNCH `cd88a07941ab62072f6de5ee69764308f1ec2387`.
- **Producto:** LENTO 01, radio de mesa ficticia original. No es la lámpara NÓDO 01 de W002. Producto ilustrado con un vector original y tres acabados, no presentado como fotografía de manufactura.
- **Obra:** `index.html`, `styles.css`, `app.js`, `cart-core.js`, imágenes vectoriales `radio-tiza.svg`, `radio-arcilla.svg`, `radio-noche.svg` y tests `tests.mjs`.
- **Funcionalidad escrita:** selector tiza/arcilla/noche con SKU y precio únicos; URL `?acabado=`; bolsa en diálogo nativo; incrementar/decrementar/eliminar; persistencia local (sin red ni pago); saneo de cantidades y claves; vaciar la simulación. **Es demostración explícita.**

## Lo observado, sin inflar el resultado

| Evidencia | Estado | Resultado |
|---|---|---|
| `node --check app.js` y `node --check cart-core.js` | OBSERVED_PASS | Módulos sintácticamente válidos |
| `node tests.mjs` | OBSERVED_PASS | **13/13** aserciones: sumar 3 SKU, cantidades, subtotales, eliminar, máximo 20, invalidaciones, almacenamiento corrupto y lectura/escritura |
| Primer artículo `radio-tiza.svg` rasterizado en CairoSVG | OBSERVED_RENDER | Se ve una radio con asa, frente textil, dial metálico y luz ámbar |
| Tres imágenes SVG renderizadas y comparadas en contacto | OBSERVED_RENDER | Geometría constante; tiza, arcilla y noche diferenciables |
| Chromium Playwright 320/390/768/1440 en localhost | BLOCKED / NOT_RUN | `net::ERR_BLOCKED_BY_ADMINISTRATOR` para las cuatro navegaciones |
| Recarga UI, URL, botón de bolsa, `localStorage` real | NOT_RUN | El script `browser-qa.py` está incluido, pero el navegador fue bloqueado |
| Captura real de primer frame 390/1440 | NOT_RUN | Sin capturas auténticas; **FIRST_FRAME_CAPTURE_REQUIRED** |
| URLs de Pages y prueba pública en navegador | NOT_RUN | Requiere verificar después de promoción de rama si se pretende publicar live |
| Aprobación humana/calidad profesional | NOT_RUN | HUMAN_APPROVED=NO |

## QBAR vs obra y salto de técnica

1. <https://www.bang-olufsen.com/en/int/speakers/beosound-a5> se consultó por la separación de acabados y su lenguaje de material. **Texto observado**, no captura de navegador. Se adoptó correspondencia variante/material, no identidad ajena.
2. <https://teenage.engineering/products/op-1> se consultó por claridad en la explicación de un objeto táctil; se adoptó narración por cualidades.
3. Imagen original generada de estudio: se inspeccionó como primera alternativa, pero su binario no se pudo integrar con garantías a esta publicación. Se cambió a **SVG con representación paramétrica** y se rasterizó el primer artículo con CairoSVG antes de fabricar tres acabados.
4. La auditoría W002 mostró la brecha de la versión anterior: UI sin browser E2E. Los tests aquí mejoran resistencia de cálculo, pero **esa brecha perceptual sigue abierta** por bloqueo de Chromium. No afirmar mejora visual causal, ni promoción del flujo privado de WEB.

## Libro/flujo y prevención

- **Book**: `PREPRODUCTION.deep-spec-v1.json` contiene Q-LOOP, referencias, dos técnicas, relaciones, oráculos, primer artículo, fichas y límites.
- **Flow fijado**: `QBAR-1` sha `5653704d3267`; `DEEP-SPEC-1` sha `7656a293b018`; `ART-DIRECTION/FIRST-ARTICLE-1` sha `b1a1a012e908`. Auditoría WEB W002 **candidata** sin promoción.
- **Trace**: `TRACE.json` distingue operaciones verificadas de declaradas. El validador de diseño puede dar `FIRST_FRAME_CAPTURE_REQUIRED` aun si otros campos cumplen; ni un PASS estructural ni SVG renderizado equivalen a navegador inspeccionado.
- **Causa preventiva:** `stage=S08`; `cause=browser-URLBlocklist`; `preventive_gate=obtain-actual-browser-screenshots`; `test=first-frame-390+1440 and basket-reload`; `owner=web`; `counterexample=source-and-node-PASS-as-browser-PASS`.

**Publicado en rama exclusiva** solo cuando GitHub readback lo confirme; ningún archivo histórico W002 o vecino se reemplaza.
