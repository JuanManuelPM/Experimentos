# LEVA / 05 · Laboratorio de máquinas

**Obra:** 3D W6 · `3d-w6-20261122-05`. Contrato humano `LAUNCH.md` blob `942c3ba8b851137886e959d2790771556e2d9f5d`. Flujo `2.3.0`, SHA-256 fijado `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.

## Lo que entrega
- **Experiencia 3D real** con leva extruida, agujero de eje, rodillo, vástago, guía, resorte, doble polea, volante, transmisión plana y bancada.
- **Interactividad:** carrera, velocidad RPM, ángulo de subida y meseta, pausa, paso de 15°, reinicio, cámaras y guía visible/oculta. Gráfico de alzada y lecturas de fuerza/velocidad.
- **Núcleo reutilizable:** `mechanics.mjs`, sin dependencia de Three.js, construye curva de paso invertida, perfil de contacto de rodillo, ley de alzada 4-5-6-7, fuerzas ideales, diagnóstico de contacto/ángulo de presión y export DXF.
- **Fuente editables:** `index.html`, `mechanics.mjs`, `PREPRODUCTION.deep-spec-v1.json`, `test.mjs`. Exportaciones propuestas GLB (mallas estáticas sin juntas), DXF (contorno nominal no certificado), JSON y PNG.

## Modelo de ingeniería

Unidades internas mm, ángulos en radianes; usuario ve grados. La polea del motor y la de la leva tienen igual radio (26 mm): relación ideal 1:1. El radio del círculo base de la leva es 48 mm y el rodillo 9 mm; carrera predefinida 16 mm. El seguidor obedece la ley polinómica de séptimo grado `35u^4−84u^5+70u^6−20u^7`, con subida, dwell alto, retorno y dwell bajo. El centro del rodillo traza la curva de paso invertida a la leva; el contorno se obtiene restando el radio del rodillo a lo largo de la normal exterior local. El perfil 3D y el control usan **el mismo** estado `theta`.

El contacto es una **restricción cinemática determinista**, no una simulación de fricción o un cuerpo rígido resolviendo colisiones en un motor físico. Se presenta una estimación ilustrativa de normal y carga lateral usando precarga, resorte lineal, masa y aceleración, sin rigidez de ejes, elasticidad, transmisión de par real, tensión de correa ni Hertz. El diagnóstico recorre puntos del contorno discretizado, no certifica montaje industrial ni vida útil. La vista de piezas usa mm y la exportación GLB es malla, no CAD paramétrico. **No fabricar** con el DXF sin evaluación técnica.

## Pruebas y ejecución
- `node test.mjs`: 9 aserciones agrupadas con barrido geométrico, continuidad de derivadas, contacto y formato DXF.
- `node ../ruta/deep-spec-v1.mjs PREPRODUCTION.deep-spec-v1.json` desde un checkout con el validador publicado; si sólo está este directorio, descargar el validador del lanzador.
- `python3 -m http.server 8000` y abrir `http://localhost:8000/` dentro de este directorio. La biblioteca Three.js se carga por CDN, requiere conexión la primera vez.
- Tacto: arrastrar en visor para orbitar, pellizcar para acercar; controles debajo en pantallas pequeñas.

## Evidencia y brechas
- **OBSERVED:** documentación de geometría consultada; spike matemático independiente con 720 fases, error de tangencia radial ~1.78×10⁻¹⁴ mm y presión máxima 13.43° en la configuración base. Esto no es ejecución del módulo entregado.
- **IMPLEMENTED:** código fuente del visor y de exports, sistema de diagnóstico, piezas y controles.
- **OBSERVED en runtime V8:** se ejecutó el código matemático recuperado desde el módulo publicado (sin marcadores ES export), con 8 grupos de pruebas PASS: 720 fases de tangencia, presión y curvatura, DXF multilínea y 24 variantes.
- **NOT_RUN en esta entrega:** render GPU, pruebas móviles reales, importación externa GLB, DXF en software CAD, ejecución del archivo test.mjs con Node y análisis perceptual humano. No declarar `HUMAN_APPROVED`.
- **Riesgos remanentes:** condiciones extremas pueden sobrepasar recomendaciones de presión; geometría puede exigir radio de herramienta específico y tolerancias no modeladas. La correa no considera deslizamiento; el modelo prescinde de deformación, fuerza real de motor y certificación.

## Referentes examinados
- [CMU, capítulo Cams](https://www.cs.cmu.edu/~rapidproto/mechanisms/chpt6.html) - inversión, roller pitch curve y envolvente normal.
- [RoyMech, Cam and Follower Mechanisms](https://www.roymech.co.uk/Useful_Tables/Cams_Springs/Cams.html) - cinemática, derivadas, presión y cargas.
- [lu.ca Cam Design Calculator](https://lu.ca/calc/cam/) - leyes y verificaciones comparativas.
- [Rapier, Joints](https://rapier.rs/docs/user_guides/javascript/joints/) - evidencia de límites de juntas estándar vs. leva.
- [Three.js GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html) - contrato de exportación.

No se incorporaron imágenes ni mallas de terceros. Las referencias se estudian, no se redistribuyen.

## Aprendizaje dirigido a Estudio 3D y ROOT
- `stage=mechanism design`; `cause=decorative follower without conjugate surface`; `preventive_gate=roller-envelope geometric spike before scene`; `test=360° roller clearance, pressure and phase sync`; `owner=3d studio`; `counterexample=elliptical disc with independently eased follower`.
- `stage=claims/QA`; `cause=equating kinematic constraint with industrial dynamic simulation`; `preventive_gate=label source of force values and unsupported physical phenomena`; `test=compare exported GLB/DXF and visible readings vs. same parameter set`; `owner=3d studio`; `counterexample=claiming realistic stress or manufacturability from an attractive render`.
