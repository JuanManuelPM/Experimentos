# L—20 · Bicicleta plegable conceptual · PROMETEO 3D W6-10

**Tarea:** `3d-w6-20261122-10`. Fuente: `prometeo/launch/20261122/next/3d/LAUNCH.md` blob `942c3ba8b851137886e959d2790771556e2d9f5d`. Flujo 3D `2.3.0` canon `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. Barras de calidad `QBAR-1`, `DEEP-SPEC-1`.

## Entrega

Configurador interactivo 3D original en WebGL: bicicleta urbana hipotética **L—20**, con rueda ETRTO 50-406, distancia entre ejes 1020 mm, montaje 1x8 de transmisión, dos módulos estructurales con bisagra central, mando de plegado, modo de despiece, cámara en cuatro vistas, tres acabados del cuadro y BOM de diez conjuntos vinculados a la geometría. No usa imágenes ni modelos externos; construye la geometría y la jerarquía en Three.js. Usa luz ambiental y direccional, materiales metalness/roughness, sombras y control orbital. `assembly.mjs` exporta el controlador genérico de plegado/despiece, BOM y `validateAssembly` reutilizable sin dependencia de Three.js.

**Entrada:** abrir `index.html` vía servidor HTTP (necesita acceso a `cdn.jsdelivr.net` para Three.js 0.180.0). En GitHub Pages basta con la ruta del directorio. En local: `python -m http.server 8000`, después abrir `/`. **No hay claves ni servicios privados.** No se incrustan assets ajenos. Licencia del motor: MIT; referencia de ingeniería propia, no licencia del diseño de Tern/Brompton.

## Arquitectura y trazabilidad

| Conjunto | Grupo del motor | SKU | Parte |
|---|---|---|---|
| Cuadro trasero | rearFrame | F-101 | tubo de sillín, main tube, vainas y refuerzos |
| Cuadro delantero | frontFrame | F-102 | backbone, tubo de dirección, horquilla |
| Bisagra | hinge | J-110 | pin, placas y palanca de cierre |
| Rueda trasera | rearWheel | R-201 | aro, neumático, radios, cassette |
| Rueda delantera | frontWheel | R-202 | aro, neumático, radios, disco delantero |
| Dirección | cockpit | C-301 | potencia, manillar, puños |
| Asiento | seat | C-302 | tija, raíles y sillín |
| Transmisión | drivetrain | T-401 | bielas, plato, pedales |
| Cadena | chain | T-402 | recorrido de eslabones y cassette en R-201 |
| Frenos | brakes | S-501 | conjunto de pinza y cable traseros; freno delantero integrado en R-202 |

La jerarquía de **nombres** corresponde 1:1 a las diez entradas de BOM y sus IDs. Cada módulo está lleno de geometría. El inventario es a **nivel de conjunto**, no por tornillo. Subpiezas de freno se muestran en los módulos de las ruedas por sus dependencias cinemáticas. Ese detalle se declara en vez de vender una correspondencia perno a perno inexistente.

### Cinemática

La posición **0** es de marcha, con ejes x = −0,49 m y x = +0,53 m, radio 0,254 m y separación 1,020 m. El plegado inicia desabrochando la palanca, baja tija y potencia y rota el subconjunto delantero alrededor de un eje de bisagra oblicua `(-0.19,0.90,0.392)` normalizado, en un recorrido de ~167,4°; la secuencia es **ilustrativa**. El despiece es otro modo, con offsets por subconjunto aplicados desde coordenadas neutras. No se permite simultaneidad de modos.

**Precaución:** las juntas, interferencias, holguras, tensión real de la cadena, recorrido del cableado, fuerzas, resistencia de soldaduras, frenado, estabilidad plegada y tolerancias no se han resuelto ni simulado físicamente. Por tanto el objeto no es un producto fabricable ni un diseño CAD/CAE validado. No se ofrece exportación GLB, modificación de pivotes ni archivos paramétricos CAD. Los parámetros editables reales son acabado, vista y progreso de los dos movimientos.

## Referencias observadas y traducción creativa

1. [Tern Link D8, fabricante](https://www.ternbicycles.com/en/bikes/476/link-d8): ficha con neumáticos 50-406, cuadro plegable y 1×8. Se adopta ETRTO 406 y arquitectura mecánica general, no una silueta o modelo industrial identificable.
2. [Brompton, buyer guide](https://www.brompton.com/stories/guides/folding-bike-buyers-guide): plegar requiere secuencia, liberación de cierre y estudio de dimensiones. Influye en la secuenciación, no se copia la cinemática patentada.
3. [Three.js, instalación](https://threejs.org/manual/pages/installation.html): import map y módulos estáticos como método de publicación sin backend. Usa Three.js 0.180.0 fijado.

### Calidad y comprobaciones

| Prueba | Estado | Resultado / oráculo |
|---|---|---|
| `node --check app.js` / `node --check assembly.mjs` | OBSERVED | Sintaxis ES modules válida |
| `node test-assembly.mjs` | OBSERVED | BOM, falta simulada, exclusión de modos, pliegue 0→1→0 y retorno exacto: PASS |
| `node deep-spec-v1.mjs PREPRODUCTION.deep-spec-v1.json` | Por ejecutar | Validador común de estructura DEEP-SPEC-1 |
| Captura render del navegador real | NOT_RUN | No sustituir por HTML válido |
| Experiencia Android táctil y WebGL | NOT_RUN | Falta dispositivo de prueba directo |
| Interferencias con CAD y cargas mecánicas | NOT_RUN | Modelo sólo conceptual |
| Referencia visual profesional y aprobación humana | NOT_RUN | Decisión reservada a revisión humana |

**Brecha conocida:** la intención de alta fidelidad industrial está parcialmente abordada en estructura, relaciones, materiales, acabados y visualizador, pero no hay geometría CAD con uniones manufacturables ni perno/tolerancia dimensionados; no se lo declara ingeniería final. La autoevaluación estructural es limitada. No existe obra original previa modificada.

## Aprendizaje preventivo transferible al estudio

`stage=preproduction` · `cause=representar un mecanismo como animación ornamental` · `preventive_gate=exigir inventario-vínculos-invariantes antes del modelado` · `test=controlador reversible y BOM con IDs únicos + revisión posterior de interferencias` · `owner=3d-flow` · `counterexample=pernos y cables que permanecen flotando al plegar`. Este hallazgo es candidato de revisión del estudio, **no** promoción automática a ROOT.