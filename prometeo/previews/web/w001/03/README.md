# INTERVALO · Estudio Web W001 / Trabajo 03

**Encargo inmutable:** lección web interactiva sobre escalas musicales, ejemplos propios, progreso y acceso táctil, sin audio simulado.

**Producto:** `index.html`, aplicación estática original en español, sin dependencias ni activos ajenos. Incluye escalas de Do mayor y Do menor natural (patrones `2-2-1-2-2-2-1` y `2-1-2-2-1-2-2`), notas y teclado cromático táctiles, reproducción real Web Audio con osciladores y envolvente, controles para detener, comparación de patrones, tres preguntas con corrección explicada, progreso `localStorage` y reinicio. El audio requiere gesto explícito y navegador compatible; no se simula ni se afirma que suene si Web Audio falla.

**Dirección visual:** editorial tipográfica + superficie de lección compacta con notas y distancias como objeto central; serif grande, color papel, índigo y terracota. No se copian diseños ni contenidos de terceros.

**Archivos y propiedad:**
- Fuente privada: `JuanManuelPM/pruebas@candidate/prometeo-web-w001-03-20261122:prometeo/previews/web/w001/03/index.html`.
- Preview pública autorizada de obra ficticia/original: `JuanManuelPM/Experimentos@gh-pages:prometeo/previews/web/w001/03/index.html`.
- Ruta prevista: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/web/w001/03/
- Contrato de tarea: `web-w001-20261122-03`, sala `web`, lote `web-w001-20261122`.

**Flujo de origen:** `WEB_FACTORY_V2/FLOW.json` versión 2.0.0, blob `02f7b6161b50cd5bc6b342b84c969aaa36bac90a`, estado `SPEC_ONLY`. Recuperado en `JuanManuelPM/pruebas@candidate/prometeo-web-factory-engine-v2-20261117`. Este trabajo implementa una obra y NO afirma que la fábrica general haya sido construida ni cambia ese flujo.

**Verificación registrada:** readback de ambas copias y hash idéntico; parseo del JavaScript mediante `new Function` satisfactorio; revisión estática de capítulos, patrón, controles, progreso y ausencia de dependencias. La URL Pages respondió HTTP 503 durante la revisión, mientras ROOT sí respondía, con despliegues del sitio pendientes y cancelaciones por escrituras concurrentes. Por eso `BROWSER_VERIFIED`, `AUDIO_HEARD`, `TOUCH_DEVICE_TESTED` y `PUBLIC_VERIFIED` quedan pendientes. No se adjuntan capturas ficticias.

**QA manual cuando el despliegue se estabilice:** entrar por HTTPS; probar en 320/390/768/1440 CSS px y Android real; cambiar de capítulo, tocar teclas, reproducir y detener ambas escalas, practicar con errores y aciertos, recargar y comprobar progreso, navegar solo con teclado, modo de movimiento reducido y audio sin permiso.