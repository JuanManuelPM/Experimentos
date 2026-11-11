# Proyectos · Biblioteca pública de Prometeo

**URL estable del explorador:** https://raw.githack.com/JuanManuelPM/Experimentos/prometeo-projects-library/proyectos/index.html  
**Evaluaciones:** https://raw.githack.com/JuanManuelPM/Experimentos/prometeo-projects-library/proyectos/evaluaciones.html  
**Catálogo fuente:** [catalog.json](catalog.json)

## Qué está publicado

Biblioteca visual con Videojuegos (2D, 3D, Game Engine), Herramientas web, Educación y Biblioteca. Los seis resultados de la Ronda 001 están vinculados a sus proyectos estables. Hay ocho registros: seis productos y dos fuentes/experimentos históricos sin vista certificada. **Chat sigue bloqueado para uso remoto**.

Los archivos `index.html` y `evaluaciones.html` son estáticos y leen `catalog.json` de este mismo directorio cuando se abren en HTTP(S). No hay Vercel, Supabase ni backend nuevo; el coste adicional de hosting es cero. El proveedor actual `raw.githack.com` puede mostrar advertencias o demorar su caché y **no es hosting con SLA**.

## Publicación de la próxima ronda (para el COORDINADOR, no para el humano)

1. Leer `JuanManuelPM/pruebas` → `prometeo/learning/CURRENT.json`, `BOOT.md`, cierre de ronda, recibos de los constructores, fuente y SHA.
2. Verificar licencias, privacidad, builds y funciones críticas. No publicar contenidos privados de Campus, claves, datos personales ni un backend de chat sin seguridad/HTTPS.
3. Publicar archivos **aislados por proyecto y versión**, por ejemplo `proyectos/versions/patio/round-002/index.html`. No sobrescribir la versión anterior.
4. Registrar la entrega mediante `release.json` esquema `prometeo.library-release/v1`; fusionar con el `catalog.json` acumulativo usando `scripts/actualizar_catalogo.py`, sin borrar historial.
5. Commit y readback. Abrir la URL anónima del producto. Si solo se verificó código/HTTP, registrar `PUBLIC_CANDIDATE_NOT_E2E_TESTED`, NO `VERIFIED`.
6. Cada recarga del explorador carga el catálogo nuevo, sin reconstruir `index.html`. Solo el coordinador/integrador escribe el catálogo; constructores no compiten por el mismo archivo.
7. Volcar una referencia a la versión y pruebas en el `CURRENT.json` privado del coordinador. No hacer commit automático de notas privadas al repositorio público.

## Evaluaciones y persistencia

El botón **Evaluaciones** permite decidir conservar/revisar/descartar, puntuar y escribir comentarios por proyecto. Se guarda en localStorage de ese navegador; también permite **exportar/importar JSON**. Como respaldo fuera del navegador, ofrece abrir un borrador de issue en el repositorio **privado** `JuanManuelPM/pruebas`, que exige iniciar sesión y confirmar la creación en GitHub. **No existe sincronización automática bidireccional de notas entre dispositivos.** Una página pública estática no puede llevar claves privadas de GitHub; implementar auth real requiere un flujo autorizado separado. No usar Supabase ni Vercel solo para evitar reconocer esta limitación.

Las evaluaciones de la galería de Ronda 001 del mismo origen pueden recuperarse al abrir `evaluaciones.html` por primera vez, sin publicarlas.

## Conservación y rollback

La fuente privada de cada constructor se conserva en sus ramas; las previews de Ronda 001 están en `prometeo-cycle-001-review-20261110`. Esta biblioteca está aislada en rama `prometeo-projects-library`, con URL fija dependiente del nombre de rama. Reemplazar archivos solamente con evidencia de una prueba y conservando su versión anterior.
