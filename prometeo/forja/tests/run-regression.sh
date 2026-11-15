#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "FORJA WORK C102 · Node structural and regression checks"
node --check forge.mjs
node --check forge-cinema.mjs
node --check camera-rig.mjs
node --check forge-fallback.js
node --check forge-mobile.js
node --test camera-rig.test.mjs tools/glb-inspect.test.mjs tools/asset-cache.test.mjs
echo "Structural QA is NOT GPU/WebGL2 or Android release acceptance"
