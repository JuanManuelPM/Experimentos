# MAPA DEL CALOR · reproducibilidad W003 06

Identidad: `web-w003-20261122-06` · brief inmutable `bef87bf57c789d2b0605ca9ff81a5d3bbaab5e35` · comparación histórica con `web-w002-20261122-06`.

## Fuente y su procedencia

Datos anuales: `data.json`, **copia byte por byte** del blob `b7ab02af9855453b101f0c48ff600156bc2ccaab` de la entrega W002. Open-Meteo Historical Weather API, modelo ECMWF **ERA5-Land**, licencia atribuida **CC BY 4.0**. Las tres direcciones de consulta completas están en `cities[i].sourceUrl`, con coordenadas de consulta/grilla, fecha de 2001-01-01 a 2025-12-31, variables `temperature_2m_max` y `temperature_2m_min`, zona `America/Argentina/Buenos_Aires`, modelo fijado `era5_land`. No se presentan como descarga nueva ni como observación instrumental independiente.

Cada localidad contiene 9.131 días en origen (25 años, 6 bisiestos) y 25 registros anuales, para un total de **75 filas** y 27.393 días en el cálculo original W002. El archivo publicado es la tabla anual, **no** los 27.393 datos diarios. La producción W002 reportó reconciliación remota 75/75; **ese control independiente no se repitió aún para W003**. La ruta original y el proceso están documentados en [W002/REPRODUCE.md](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/works/web-w002-06/REPRODUCE.md).

## Definición de cada columna

- `meanMax` = `round(sum(maxima_diaria_2m)/dias_del_año, 2)`, expresada en **°C**. Es la media de máximas diarias, no la temperatura media anual.
- `hotDays` = conteo de `temperatura_2m_max >= 35 °C`, en **días/año**.
- `warmNights` = conteo de `temperatura_2m_min >= 24 °C`, en **días/año**. La mínima diaria es un **proxy** de noche cálida, no el registro de temperatura horaria nocturna.
- La diferencia de décadas para cada ciudad y métrica es `average(valor_anual[2016..2025]) - average(valor_anual[2001..2010])`. Los años 2011–2015 no intervienen en esta comparación puntual.

Revisión de las medias de máximas, calculada a partir de las 75 filas locales:

| Ciudad | 2001–2010 (°C) | 2016–2025 (°C) | Diferencia (°C) |
|---|---:|---:|---:|
| Buenos Aires | 20,453 | 21,053 | +0,600 |
| Rosario | 22,995 | 23,706 | +0,711 |
| Córdoba | 22,867 | 23,438 | +0,571 |

Sin ajuste por incertidumbre ni prueba de significación. No son estimaciones de tendencias paramétricas ni una atribución causal.

## Reproducción local

Requiere Node.js 18+ y un servidor estático para módulos ES:

```bash
cd prometeo/works/web-w003-20261122/06
node verify.mjs
python3 -m http.server 8000
# http://localhost:8000/
```

Para **descargar nuevamente las series diarias originales** y recalcular 75 agregados, donde el entorno tenga red:

```bash
node verify.mjs --remote
```

La prueba remota no se considera realizada por estar disponible el comando. `verify.mjs` imprime estados separados. Los tests lógicos validan la estructura, no la fidelidad del reanálisis a microclimas.

## Decisiones y limitaciones

La figura de apertura no interpola temperaturas entre ciudades. Se reemplazó la propuesta de "mapa de isla urbana" por un **archivo temporal de 75 marcas** reproducidas desde filas auténticas. Cada color corresponde a una media anual de máximas; la leyenda explicita la unidad. La línea es una serie anual consultable. El SVG `first-article.svg` contiene 75 rectángulos geométricos **que son un gráfico de datos**, no una imagen de superficie térmica o una fotografía. Ningún lugar de la pieza dice medir las calles.

ERA5-Land es un **reanálisis** aproximadamente 0,1° (~11 km, valor nominal de modelo). Las temperaturas de una ciudad pueden variar con topografía, uso del suelo, edificios y vegetación. Sin puntos urbanos y rurales comparables no se infiere intensidad de isla de calor. Open-Meteo señala que para comparación multidecenal hay que fijar modelo ERA5/ERA5-Land para no mezclar actualizaciones de distintos modelos.

Referencias observadas documentalmente durante esta sesión: [Open-Meteo](https://open-meteo.com/en/docs/historical-weather-api), [EPA](https://www.epa.gov/heatislands/measuring-heat-islands), [The Pudding](https://pudding.cool/process/how-to-make-dope-shit-part-3/) y [Copernicus/Reuters](https://climate.copernicus.eu/reuters-launches-climate-monitor-tool-powered-copernicus-climate-change-service-data). Se extrajeron capacidades narrativas y exigencias científicas; no se copiaron diseños.

**Estado:** MEDIA_DATA_PUBLISHED / BROWSER_QA_PENDING / HUMAN_APPROVED=NO. La prueba de acceso HTTP Pages y la lectura de capturas tienen evidencia independiente en `QA.md`.
