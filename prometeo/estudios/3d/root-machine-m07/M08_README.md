# THE ROOT MACHINE · 0.2.0 candidate

One additive branch on the existing chamber. M07's geometry, camera, source app and original tests remain untouched. M08 adds an editable five-part terminal manifold and two articulated roots. The original port scene.root.exit is retained, with a structural edge to scene.root.fork and two outlet edges. The branch follows the original neck's flex; spread is local and independent of live data.

Open **preview-m08.html** locally (standalone, embedded MIT Three.js r181). In a served directory use index-m08.html. Ver bifurcación / Vista general switches camera framing; Abrir / Cerrar animates both outlets; Articular moves the original neck and the attached fork. Drag, pinch, wheel and old keyboard controls remain. UNKNOWN is permanent: this is manual inspection, not telemetry.

Source: fork.mjs and app-m08.mjs; unchanged geometry.mjs and camera.mjs. Run node m08.test.mjs for CPU regression. M08_CPU.json records tests; BUILD_RECEIPT_M08.json binds exact source blobs. CPU checks passed, including original geometry/camera, equivalent Three r181 CPU cases and new positive/negative fixtures. Actual browser WebGL, physical Android and visual approval NOT_RUN. No deployment or claim of artistic approval. Candidate only.
