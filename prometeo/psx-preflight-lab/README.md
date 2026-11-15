# PROMETEO PSX · PREFLIGHT LAB v1
Production QA engine, independent route in the public Experimentos repository. **Not a movie, not an editor and not an art approval.**

Public viewer: https://juanmanuelpm.github.io/Experimentos/prometeo/psx-preflight-lab/

Files:
- \`preflight-engine.mjs\`: pure JS, deterministic evaluation, fail-closed.
- \`preflight-cli.mjs\`: executable Node CLI; returns exit code **2 when gates block**.
- \`test-preflight.mjs\`: regression fixtures (valid, missing evidence, reverse car, seat intersection, line-rain, spoofed approval, Android missing).
- \`night-drive.audit.json\`: evaluated baseline extracted from **No hay vuelta** code and Android screenshot observations.
- \`night-drive.receipt.json\`: frozen machine result for comparison.
- \`index.html\`: interactive review of any JSON manifest, no backend calls for user content.

Run with Node 22+:
\`\`\`sh
node --test test-preflight.mjs
node preflight-cli.mjs night-drive.audit.json night-drive.checked.json
\`\`\`
Exit code 2 is expected on the rejected baseline. \`PASS\` is not a claim of exhaustive verification; checks rely on evidence with provenance. Higher-assurance gates require independent video inspection and geometry probes; never fabricate results. The screengrabs from Android are user-supplied and reveal a seat penetration, disconnected hands, washed-out car, very dark street and line-like rain. A control must distinguish camera framing improvement from a completed scene.

**Reference sources investigated:**
- Three.js GLTFLoader: https://threejs.org/docs/pages/GLTFLoader.html
- Three.js skinning and IK: https://threejs.org/examples/webgl_animation_skinning_ik.html
- Three.js animation mixer: https://threejs.org/docs/pages/AnimationMixer
- Three-nebula, MIT particles and deterministic visual regression: https://github.com/creativelifeform/three-nebula
- Three.js fog: https://threejs.org/manual/pages/fog.html
- Three.js postprocessing: https://threejs.org/manual/pages/post-processing.html
- Three.js InstancedMesh: https://threejs.org/docs/pages/InstancedMesh.html

**Method promise:** Research each requested component, obtain correct licensed assets, create three/four keyframes, run preproduction checks, rework failures, and only after gates pass shoot. A static checklist cannot replace rendered screenshots or human critique. No automated ART_APPROVED.
