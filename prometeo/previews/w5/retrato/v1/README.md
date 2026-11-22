# NARA · W5 · Revisión expresiva y primeros planos

**Fuente intacta:** [W4 V1](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/personajes/retrato-expresivo/v1/) · método `2.3.0` · hash de flujo `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f` · hash brief `db0d4f80e9662571265c98d0969604691bf08db45a703677ec74e49ebb504ee2`.

La versión conserva silueta, ojos, pelo, ropa y cara original de Nara. Añade diez rasgos dibujados al SVG que se activan según expresión: párpados, pliegues perioculares, sonrisa, ceño, nariz, mentón y lágrimas. Mantiene cinco expresiones y agrega un primer plano enmarcado (Rostro), botón de actuación secuencial y una hoja comparativa `sheet.html`. Compatible con el canal iframe `prometeo.character.v1`; API v1.1.0 añade `setShot('rostro'|'busto')`, y `shot` por `postMessage`. Ningún archivo W4 V1 se modifica.

**QA preventivo:** se comparó la ruta volumétrica con malla y blendshapes frente a profundizar la ilustración 2.5D original. La primera no aseguraba identidad y topología de primer plano sin asset 3D legal y verificado; se seleccionó la segunda sin simular un rig 3D. La actuación se distribuye entre mirada, párpados, boca, cejas y mejillas. Referencia de principio general: https://www.thinkinganimation.com/12-rules-for-facial-expression (no se incorporaron sus imágenes ni recursos).

**Pruebas:** compilación sintáctica JS, estructura SVG e identificadores PASS en generación. **NOT_RUN:** captura en navegador, Android físico, render comparativo probado, aprobación humana. La hoja HTML contiene vistas ejecutables, **no** fotogramas verificados. Material 100% SVG/HTML/JS original y derivado de V1; no hay assets o fuentes de terceros.

**Límites:** 2.5D, sin modelado volumétrico/GLB, ni perfil real; el giro es paralaje moderado.

**Salida:** https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/retrato/v1/ · [Cinco gestos](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/w5/retrato/v1/sheet.html).
