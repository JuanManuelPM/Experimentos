# PULSE STATION · Sector 06

**Estudio 3D · W4 / Videojuegos 6/10 · V1**

Una experiencia jugable de ritmo de 28 segundos, enteramente autocontenida, con tres carriles (A/S/D o pantalla táctil), audio original generado con Web Audio, puntuación y fallos, y un túnel con geometría WebGL real que reacciona a las señales musicales y aciertos.

Abrir **index.html** en navegador moderno; no requiere build, paquetes, cuentas ni enlaces a CDN. Pulsar **Iniciar secuencia** para desbloquear Web Audio.

**QA preventivo:** antes de producir se compararon dos rutas (ilusión 2D versus escenario 3D WebGL) y se seleccionó geometría WebGL para respetar el brief. Los recursos son originales, sin dependencias externas. Se verificó la sintaxis JavaScript y el hash canónico del flujo, no el render ni la reproducción física en Android.

**Estado:** candidato de revisión humana, no aprobación artística. Trazabilidad en `PRODUCTION_RECEIPT.json`.

Brief SHA256: `cff5ae8b5309eff836585cc115454f44611a1dbf6bcb147772e954535ce2cde0`  
Flow 2.3.0 SHA256: `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`
