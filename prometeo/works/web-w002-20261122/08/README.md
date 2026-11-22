# SECUENCIA · Editor visual de experiencias exportables

**PROMETEO WEB W002 / 08**

[Editor en GitHub Pages](https://juanmanuelpm.github.io/Experimentos/prometeo/works/web-w002-20261122/08/) · [Historia de demostración autónoma](https://juanmanuelpm.github.io/Experimentos/prometeo/works/web-w002-20261122/08/sample-story.html)

Pages: rutas previstas; HTTP no comprobado en esta sesión. Los archivos están publicados en gh-pages y releídos por SHA.

## Uso

1. Agregá escenas con Portada, Imagen, Texto o Video. Reordenalas arrastrando o con los controles Subir / Bajar.
2. Editá títulos, texto, pie, animación, paleta y duración. Para imagen o video, cargá un archivo propio o autorizado (hasta 4 MB); se incrusta en la exportación.
3. Cambiá entre vista escritorio y móvil. Exportar HTML descarga una página independiente, sin editor ni CDN.
4. Para guardar o continuar la autoría usá Proyecto JSON. El editor también intenta guardar localmente en el dispositivo.

**Arquitectura:** engine.js tiene el motor y generador de HTML; editor.js maneja controles; el modelo es secuencia.story/v1. El mismo generador alimenta la vista previa y la exportación real.

**Estado de QA:** ver [QA.md](QA.md). Quince controles lógicos aprobados; navegador real, video y evaluación artística no ejecutados. Gate DEEP-SPEC-1: SPIKE_REQUIRED.
