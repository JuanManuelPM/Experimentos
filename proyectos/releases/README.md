# Entregas por ronda

Agregar un archivo `round-002.json`, `round-003.json`, etc. (esquema `prometeo.library-release/v1`) y ejecutar el fusionador `../scripts/actualizar_catalogo.py`. No es un feed que se combine automáticamente: **el coordinador** debe validar y actualizar `catalog.json` en el mismo commit de publicación de la ronda.

Ejemplo sin direcciones inventadas:
```json
{
  "schema": "prometeo.library-release/v1",
  "roundId": "002",
  "reviewUrl": null,
  "reportRef": null,
  "updates": [
    {
      "id": "patio",
      "revision": "Pruebas de cámara pendientes",
      "version": {
        "name": "Ronda 002",
        "state": "SOURCE_ONLY",
        "commit": null,
        "previewUrl": null
      }
    }
  ]
}
```

**No incluir enlaces de ejemplo fingidos como si fueran despliegues.** Los valores reales se completan con el código y las pruebas verificadas de la siguiente ronda.
