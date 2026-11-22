# QA · EL BOSQUE RESPIRA · task 07

**Observación local real:** el máster se inspeccionó en esta ejecución; primer artículo PNG 1536x1024, genId `4614a488-0130-4add-baf8-1975b48f86eb`.

**Pruebas locales reproducidas:** 4/4 PNG decodifican; 3/3 derivados son recortes nativos `pixel-perfect` del máster, sin upscale. Ventanas exactas y SHA en el ZIP local `ASSETS.json`. El sitio HTML muestra primero el paisaje sin overlays; Chrome/Playwright impidió navegación `file://` y `127.0.0.1` con `ERR_BLOCKED_BY_ADMINISTRATOR`. Las vistas 390/1440 fueron simulaciones Pillow; no son screenshots de navegador.

**Defecto real de producción:** dos generaciones posteriores fueron afiches del propio proyecto, no bosque. Se rechazaron. Cambio técnico: recortes de la misma fuente original en lugar de afirmar cámaras nuevas.

**Tres límites materiales:** (1) no hay revisión taxonómica de las plantas visibles; (2) las nuevas vistas no son cámaras independientes; (3) el conector de GitHub no admite la carga de los binarios locales, de modo que **GitHub es solamente fuente + informe** y el arte se entrega por el ZIP del chat, no mediante Pages.

**Comparación W002 → W003:** W002 07 declaró máster y 3 crops locales y continuidad de píxel; auditoría W002 indicó que eso no demuestra calidad botánica/lumínica. W003 incluye un nuevo primer artículo inspeccionado, dos crop estudios, decisión de descarte documentada y canon ecológico. Sigue faltando valoración externa; calidad profesional relativa = `NOT_VERIFIED`.

**Gates:** `FIRST_ARTICLE_LOCAL_OBSERVED`, `FIRST_FRAME_CAPTURE_REQUIRED`, `PUBLIC_MEDIA_NOT_PUBLISHED`, `HUMAN_APPROVED=NO`. El verificador de flujo propietario especializado no fue ejecutado.

**Referencias observadas y usadas como inspiración, sin copiar imágenes:** [TNC](https://www.nature.org/es-us/que-hacemos/nuestras-prioridades/hacer-frente-al-cambio-climatico/carbono-forestal-chile-reserva-costera-valdiviana/), [Chile Travel](https://www.chile.travel/blog/bano-bosques/), [ecosistema oficial Chile](https://simbio.mma.gob.cl/Ecosistemas/Details/86).

La validación de una ficha o la existencia de un enlace no constituye verificación artística, ambiental ni aprobación humana.
## Validación canónica ejecutada (2026-11-22)

Se ejecutó el código oficial recuperado de `gh-pages` y fijado a sus blob SHA, sobre el `PREPRODUCTION.deep-spec-v1.json` publicado en esta rama:

- `deep-spec-v1.mjs` blob `0536af26982d50dfc3c3689aca2677751bdee1fe`: **`READY_FOR_FIRST_SLICE`**, 0 errores estructurales.
- `art-direction-first-article-v1.mjs` blob `dac224b390fc86982ce76eeb0135d4be59eb52ad`: **`FIRST_FRAME_CAPTURE_REQUIRED`**, 0 errores estructurales.
- Book publicado blob `ab2cbdb86364bc5057e26e681571e3622340c14f`.

El estado del arte sigue siendo **PARCIAL**: no hay captura Chromium real, ni entrega de los binarios en GitHub, ni QA ecológica independiente. La validación estructural no corrige esas carencias.
