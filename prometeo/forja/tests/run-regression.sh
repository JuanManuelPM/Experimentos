#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "FORJA convergencia V1 · Node structural and regression checks"
node --check forge.mjs
node --check forge-cinema.mjs
node --check camera-rig.mjs
node --check forge-fallback.js
node --check forge-mobile.js
node --check archivo-vivo/scene.mjs
node --check archivo-vivo/clip-resolver.mjs
node --test camera-rig.test.mjs tools/glb-inspect.test.mjs tools/asset-cache.test.mjs \
  tests/transactional-import.test.mjs tests/transactional-import-v2.test.mjs \
  tests/transactional-storage-v3.test.mjs tests/transactional-cleanup-v4.test.mjs \
  tests/loading-start-v5.test.mjs archivo-vivo/clip-resolver.test.mjs \
  tests/convergence-provenance.test.mjs
node pause-regression.test.mjs
echo "Structural QA and V8/Node mocks are NOT GPU/WebGL2 or Android acceptance."
