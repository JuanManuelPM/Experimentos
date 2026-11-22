# DOS MEMORIAS · W003/10 · entrega de trabajo

**Identidad fija:** `batchId=images-w003-20261122`, `taskNumber=10`, `taskId=images-w003-20261122-10`, `LAUNCH blob=a97b91ca103847ea75eeb9d1d2af10b6c9c0dddd`.
**Brief original W002:** blob `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`.
**Rama aislada:** `candidate/prometeo-images-w003-20261122-10`. **No alterar W001/W002 ni otras tareas.**

## Obra

Una misma plaza ficticia inundada, vista en fotografía editorial **sintética** y en ilustración gráfica **original de paths**, independientes como técnicas. Hombre mayor de abrigo verde y mujer con piloto ocre rescatan un **álbum rojo** de una caja mojada. Árbol izquierdo, banco azul, soga de contención naranja, edificio porticado, reloj y agua se mantienen en ambas.

Se produjeron localmente dos raster RGB **1536×1024**, un JPG de comparación A/B, un SVG fuente de ilustración, script Python/CairoSVG, HTML de comparación ciega y paquete ZIP con SHA en el manifiesto local.

**Custodia:** los PNG, SVG, script, comparador y ZIP fueron entregados en esta conversación, NO se subieron como bytes binarios a esta rama: la conexión GitHub disponible acepta texto / blobs, sin transporte binario desde el contenedor, y el puente alternativo de Drive devolvió 403. **No anunciar enlaces de imagen de GitHub o Pages inexistentes.** La rama registra el expediente y QA reales; el envío de medios remoto queda PENDING.

## Controles hechos antes de producción

1. **SEMANTIC_LOCK**: ocho anclas (plaza, arcos, árbol, banco, soga, agua, dos personajes, álbum/caja) y gesto constante, no dos mundos.
2. **TÉCNICAS DIFERENTES**: síntesis fotográfica vs dibujo con tinta plana/control de paths, nunca dos filtros cromáticos.
3. **FIRST-ARTICLE**: primero A real; después dos intentos generativos de B dieron afiches PROMETEO fuera de tema, **descartados**. Se cambió de familia a ilustración manual SVG -> raster.
4. **QA**: PIL decodificó los dos PNG nativos 1536×1024 y se inspeccionó B visualmente. Navegador bloqueó file:/// y localhost con ERR_BLOCKED_BY_ADMINISTRATOR; capturas 390/1440 **NOT_RUN**. Comparación ciega humana **NOT_RUN**.

## Diferencia observable

- **A**: detalles fotográficos, textura de barro, luz difusa, expresiones y gesto contenidos. Resultado sintético; no reclamar testimonio real.
- **B**: arcos serializados, contornos oscuros, superficies planas turquesa/ocre, álbum rojo jerarquizado, tinta y grano ligeros. Fuente vectorial propia, no transformación de A.
- **Falla restante**: B sintetiza anatomía y A no verifica sensor/cámara. Igualdad semántica observada, paridad exacta de píxeles no deseada; recepción humana sin medir.

## Hashes del arte local
- `01_fotografia_editorial_sintetica.png` SHA256 prefijo `0ee5783a29f5`, RGB 1536×1024.
- `02_ilustracion_grafica.png` SHA256 prefijo `e391b42dc40e`, RGB 1536×1024.
- Se conservaron SHA256 completos en el MANIFEST.json del paquete local.

## Referentes observados (NO reutilizados como assets)
- [World Press Photo, inundación de Brasil](https://www.worldpressphoto.org/collection/photo-contest/2025/Amanda-M-Perobelli/4): detalle material y acción humana, no efectismo.
- [Reuters, finalista Pulitzer](https://www.pulitzer.org/finalists/photography-staff-reuters): fotografías familiares como motivo de pérdida y continuidad.
- [Shaun Tan, The Arrival](https://www.shauntan.net/arrival-book): narración visual sin necesidad de texto explicativo.
- [World Press Photo, código de ética](https://www.worldpressphoto.org/contest/code-of-ethics): distinguir estrictamente registro documental de ficción sintética.

**HUMAN_APPROVED=NO.** El gate estructural no certifica calidad profesional. URL de esta carpeta solo prueba publicación documental; **media publicada públicamente=NO**.
