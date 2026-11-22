# Recibo final · WEB W002 / 06 · MAPA DEL CALOR

**Identidad:** `batchId=web-w002-20261122` · `taskNumber=6` · `taskId=web-w002-20261122-06` · fuente LAUNCH blob `cd88a07941ab62072f6de5ee69764308f1ec2387` · propietario `JuanManuelPM/Experimentos`.

**Entrega:** ensayo editorial web de calor en Buenos Aires, Rosario y Córdoba (2001–2025), con navegación por capítulos, gráfico anual consultable por año, contraste de décadas, gráfico cartográfico de coordenadas, 3 indicadores, anotaciones, tabla y CSV. Código autónomo sin framework (fuente y componentes gráficos en `index.html` y `components.js`). Sin datos climáticos simulados.

**Fuente:** Open-Meteo Historical / ERA5-Land (ECMWF), datos CC BY 4.0. 27.393 jornadas consultadas en total; 9.131 por ciudad; 75 agregados anuales. Comparación independiente de datos originales con los 75 agregados: **PASS 75/75**, sin años incompletos. Documentación, fuentes, fórmula y script de reproducción en `REPRODUCE.md`, `data.json` y `verify.mjs`.

**QA observada:** `DEEP-SPEC-1 = READY_FOR_FIRST_SLICE` (gate lógico, no estético); sintaxis del módulo y script en HTML PASS; integridad 6/6 archivos publicada en gh-pages y confirmada con readback SHA idénticos a la rama propietaria. No se realizaron capturas reales de navegador, test táctil, teclado o escala 320/768/1440, ni aprobación humana.

**Estado de Pages HTTP:** tras la publicación, comprobación remota del URL público: `503` para la portada y módulo, `404` para `data.json`. Por tanto **LIVE_VERIFIED = NO** en el momento de comprobar. La fuente sí está publicada en la rama de Pages. No atribuir este despliegue a un navegador funcional hasta verificar HTTP y uso real.

**Resultado:** `IMPLEMENTED` · `DATA_RECONCILED` · `CODE_SYNTAX_OBSERVED` · `GH_PAGES_SOURCE_READBACK_VERIFIED` · `LIVE_HTTP_NOT_VERIFIED` · `BROWSER_QA_NOT_RUN` · `HUMAN_APPROVED_NOT_RUN`.

- Código fuente público: https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/launch/20261122/works/web-w002-06/
- Rama fuente exclusiva: https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-web-w002-06-20261122/prometeo/launch/20261122/works/web-w002-06/
- Enlace GitHub Pages esperado (no verificado como disponible): https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/works/web-w002-06/
- Contraste frente a referentes, metodologías y aprendizaje específico: `REPRODUCE.md`

**Brecha:** La consistencia editorial y visual en navegador y el despliegue HTTP siguen pendientes. Ninguno de esos dos estados se puede reemplazar por HTML válido o por datos correctos.
