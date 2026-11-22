# CASA MATERIAL · Evidencia y recibo · WEB W002/02

- `batchId=web-w002-20261122`
- `taskNumber=2`
- `taskId=web-w002-20261122-02`
- `briefSource=Experimentos@gh-pages:prometeo/launch/20261122/next/web/LAUNCH.md`
- `briefBlobSha=cd88a07941ab62072f6de5ee69764308f1ec2387`
- `branch=candidate/prometeo-web-w002-02-20261122`
- `QBAR-1`, `DEEP-SPEC-1`

## Resultado entregado
Un sitio real de marca conceptual con seis áreas de contenido, tres fichas de estudios de forma, colección con filtro `data-category`, ficha modal nativa con restablecimiento de foco, anclas funcionales, créditos, responsive y alternativa de movimiento reducido. Código vanilla, sin backend, sin carrito ficticio, sin WebGL.

**Frontera entre obra y verdad:** las fotografías Unsplash fueron observadas como recursos gratuitos individuales y se acreditan en pie. Los objetos de CASA MATERIAL son conceptos; las imágenes son referencias estilísticas, **no** mercancía propia ni fotografías producidas por el taller ficticio.

## Referentes observados antes del primer corte

| Referencia | Observación específica | Transferencia propia |
| --- | --- | --- |
| https://www.jonnymartin.blog/wendy | Caso Wendy Friedman Ceramics: identidad, sitio, fotografía de materiales y tono homogéneos; recorrido no orientado a compra ficticia. `OBSERVED_TEXT` | Dejar que la voz, el sistema de navegación, las fichas y el tono formen una marca, no solo un hero |
| https://fernandodurao.com/en/ | Proceso, singularidad de piezas, origen y material conectados al significado del objeto. `OBSERVED_TEXT` | Manifiesto y notas de taller contextualizan la forma |
| https://brand.dropbox.com/ | Identidad como conjunto de voz, tipografía, color, imágenes y motion. `OBSERVED_TEXT` desde EVIDENCE de tanda | Separar tokens y manual, continuidad portada/detalle/móvil |
| https://unsplash.com/license | Licencia de fotos gratuitas y páginas individuales con autores, consultadas. `OBSERVED_TEXT` | Imágenes de referencia acreditadas, sin asignar autoría ficticia |

La investigación fue textual/documental y la elección de fotos se basó en descripciones/miniaturas públicas, no inspección local de originales a resolución completa.

## Matriz referente → intención → artefacto → brecha

| Intención | Decisión | Artefacto | Evidencia | Brecha |
| --- | --- | --- | --- | --- |
| Marca única en todo el recorrido | Sintaxis CM, serif display/itálica, monoespaciada, trazo y cromática coherentes | `tokens.css`, `site.css`, `IDENTITY.md` | `IMPLEMENTED` | Juicio visual independiente requerido |
| Artesanía mostrada con material fotográfico real | Fotografías con licencia y créditos en footer | `index.html`, links originales en footer | `IMPLEMENTED` | Depende de CDN externo, no hay producción propia de fotos |
| Ficha navegable con contexto | `dialog` nativo, Escape, restauración de foco y tipografía | `app.js` + `index.html` | `IMPLEMENTED` | No declararlo probado hasta browser real |
| Móvil no miniaturizado | 760/480px, tipografía fluida, navegación desplegable | `site.css` | `IMPLEMENTED` | Screenshots reales por viewport requeridos |

## Pruebas ejecutadas: estructura y enlaces internos
Readback conector GitHub desde rama de trabajo: seis archivos recuperados, SHA y tamaños presentes. Tests determinísticos en la misma sesión:
1. Identidad `taskNumber=2` y SHA exacto del lanzador: PASS
2. Mínimos DEEP-SPEC e interrelación de preguntas/componentes/decisiones/riesgos: PASS, chequeo reproducido, **no ejecución CLI Node del validador canónico**
3. Anclas internas: todos los `href="#..."` tienen ID destino: PASS
4. Todos los `data-open` corresponden a claves de `studies`: PASS
5. 6 fotografías acreditadas y licencias vinculadas: PASS (estructura, no disponibilidad HTTP)
6. `main`, `dialog`, regla `prefers-reduced-motion`: presentes
7. Sin checkout ni CTA de pagos simulados: PASS

### QA visual e interactivo
**PENDIENTE** hasta ejecución con navegador real: 320/768/1440 CSS px; scroll horizontal, fotos con red, contraste perceptual, navegación táctil, tabulación, Escape, navegación filtro, diálogo y foco. Un archivo HTML o un check regex no permiten atribuir `OBSERVED_BROWSER`, `HUMAN_APPROVED` ni excelencia profesional.

## Aprendizaje candidato para WEB
- `stage=preproduction` · `cause=stock photography may imply false product ownership` · `preventive_gate=mark conceptual photos, credit authors and license` · `test=inspect captions and credits on every page` · `owner=web` · `counterexample=fictional atelier presenting real third-party object as its own stock`.
- `stage=qa` · `cause=CSS screenshotless judgment` · `preventive_gate=browser captures at 320/768/1440 and interaction` · `test=compare composition and screenshot plus keyboard` · `owner=web` · `counterexample=compiles but horizontal text overflow or broken modal`.

**Estado prepublicación:** `IMPLEMENTED` / source `OBSERVED` / remote media `NOT_RUN` / browser `NOT_RUN` / `HUMAN_APPROVED=NO`.
