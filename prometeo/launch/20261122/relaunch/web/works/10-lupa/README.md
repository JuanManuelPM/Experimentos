# LUPA · Comparador visual · WEB w003 / worker 10

**Objeto real:** una aplicación offline-first de comparación de dos screenshots locales y un pipeline para producir evidencias con Chromium autorizado. No se captura ni atraviesa CORS desde JavaScript. No se fingen pantallas, métricas Lighthouse ni permisos.

## Usar

1. Publicá/serví estos archivos con `python -m http.server 8000` y abrí `http://localhost:8000/`. También se puede ejecutar sin servidor, pero la API `crypto.subtle` para SHA puede no estar disponible en todos los contextos `file://`; usar localhost para evidencia reproducible.
2. Subí dos PNG/JPEG/WebP de **igual raster** en A y B. Deslizá con mouse/touch o flechas sobre la imagen; alterná mezcla, diferencias y paralelo. El mapa colorea píxeles con `max(|ΔR|, |ΔG|, |ΔB|) > 32`. Esto **no** es un índice de calidad visual ni una compensación de antialiasing.
3. Guardá el par en IndexedDB, recargá y abrilo desde Historial. Exportá un JSON de medición y un PNG del mapa de diferencias.
4. Para capturas de URL con provenance, corré `capture.py` sobre páginas propias o con autorización explícita. Instalá `pip install -r requirements.txt` y `python -m playwright install chromium`. Ejemplo:

```sh
python -m http.server 8000
# segunda terminal:
python capture.py --a http://127.0.0.1:8000/fixtures/a.html \
  --b http://127.0.0.1:8000/fixtures/b.html --widths 390,1440 \
  --height 900 --out evidence
```

Si el entorno bloquea la navegación del navegador, el mismo pipeline admite `--a-html fixtures/a.html --b-html fixtures/b.html` sobre HTML **autocontenido**, con `sourceType=self-contained-html` y hashes SHA-256 del HTML fuente. Esta ruta usa `page.set_content` seguido de `page.screenshot`, que sigue siendo una captura genuina de Chromium, pero **no verifica ninguna URL servida**. Los recursos relativos de esas páginas no se cargan automáticamente; este modo es para HTML autocontenido.

El runner por defecto solo acepta `127.0.0.1` y `localhost` como hosts. Si tenés autorización para capturar otro host, declará explícitamente `--allow-host dominio.example`. No introduce bypass de CORS ni interfiere en sitios ajenos. La captura espera carga de red inactiva, usa DPR 1, reducido movimiento, altura fija y viewport exacto. Cualquier fallo HTTP se trata como fallo, no como evidencia de un screenshot.

5. En la app elegí los dos PNG del **mismo viewport** y el archivo `lupa-capture.json`. Una coincidencia de SHA-256 y dimensiones cambia la etiqueta de `SIN VERIFICAR` a `HASHES CORRESPONDEN AL RUNNER`. La coincidencia de hashes no certifica por sí sola que la URL declarada era legítima.

## Estructura

- `index.html` + `app.js`: interfaz autónoma, responsiva, accesible con teclado, persistencia real en IndexedDB.
- `capture.py`: motor de captura real, SHA-256, condiciones de reproducción, conteo de diferencias reproducible por viewport.
- `fixtures/a.html` y `fixtures/b.html`: páginas originales sintéticas, **no screenshots**. Solo el Chromium del runner produce screenshots de estas fuentes.
- `PREPRODUCTION.deep-spec-v1.json`: Book y artDirection con límites. `QA.md`: pruebas observadas. `TRACE.json`: pasos reales, no flujo entero inventado.

**Privacidad:** las imágenes quedan en el navegador; `save` persiste Blob en IndexedDB local. No se hace `fetch()` de fuentes de imagen externas. Cualquier `file://` subido es un archivo suministrado por el usuario y se declara tal cual. **Limitación:** el pipeline mide diferencia exacta de RGB, no antialiasing, tipografía o aprobación humana. Las imágenes muy grandes se rechazan por seguridad (24 MB/archivo, 14 MP máximo). `crypto.subtle` se necesita para verificar hashes.

**Publicación:** rama de candidato separada `candidate/prometeo-web-w003-20261122-10`. Este árbol no reemplaza ningún trabajo anterior, y GitHub Pages público **no está certificado** por este commit de rama.