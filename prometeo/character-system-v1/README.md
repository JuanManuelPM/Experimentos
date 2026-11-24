# PROMETEO · CHARACTER SYSTEM V1 — candidate

Five independent GLB candidates, original derivatives of the professionally authored Quaternius Universal Base Characters (Standard male/female) CC0 meshes, not the failed SDF/primitives canary. Reuse of the same Three.js 0.181.0 runtime version as ARC CHAIR 01; GLTFLoader and AnimationMixer, no new engine.

| Work | Model | Profile | Demo |
|---|---|---|---|
| Explorador | [GLB](01-explorador/character.glb) | [Dimensions/rig/sockets](01-explorador/PROFILE.json) | [Scene](01-explorador/index.html) |
| Detective | [GLB](02-detective/character.glb) | [Dimensions/rig/sockets](02-detective/PROFILE.json) | [Scene](02-detective/index.html) |
| Mecánico | [GLB](03-mecanico/character.glb) | [Dimensions/rig/sockets](03-mecanico/PROFILE.json) | [Scene](03-mecanico/index.html) |
| Artista | [GLB](04-artista/character.glb) | [Dimensions/rig/sockets](04-artista/PROFILE.json) | [Scene](04-artista/index.html) |
| Científica | [GLB](05-cientifica/character.glb) | [Dimensions/rig/sockets](05-cientifica/PROFILE.json) | [Scene](05-cientifica/index.html) |

## Evidence and limitations
The actual binary GLBs were generated in the execution environment and committed to GitHub. The generator creates distinct anatomical profiles (overall physical proportions, face/jaw/nose morph, scalp geometry), not only palettes. All five contain 65 source joints, explicit mapped names, inverse bind matrices, four baked animation clips and a preliminary blink morph. Neutral clothes are painted onto the body using vertex colors, not separate textile meshes. Hair is a skinned shell extracted from the real scalp surface. This is an artistic candidate, not a signed-off premium character or modular garment system.

The source rest orientation is retained; the equivalent of a canonical A pose and exact retarget compatibility are NOT_TESTED. The common semantic contract includes explicit socket alias mapping in each profile, local transformations and profile-specific fit estimates. Neck/chest/hand/foot sockets have unique node names to avoid ambiguity with bones. Clearance and dimensions are initial fit proposals, not validated attachment envelopes. Nonuniform profile scaling is on the common root, so cross-body accessories must account for it. Separate garment meshes, corrective deformation, foot planting, LOD, meshopt, KTX2 and true eyelid closure remain unverified or absent. Runtime instrumentation is accessible as window.__characterMetrics, not an on-screen UI. No real Android timing or WebGL screenshot was obtained in this run.

## Source and rights
- Author: Quaternius, Universal Base Characters, CC0 1.0: https://quaternius.com/packs/universalbasecharacters.html
- Exact source mirror: https://github.com/olccamy/CanvasPro/tree/e56c521f6e2d27908ec33b7175ea04215fe3a03c/assets/characters/quaternius/universal-base
- Used: Male and Female FullBody glTF/bin; T_Eye_Brown.png. Original source geometry, authored UVs/normals, source joint hierarchy and weights. New geometry deformations, scalp mesh, colors, blink candidate, clips and profile JSON generated here. No source repo private content included.
- Three.js 0.181.0, MIT: https://github.com/mrdoob/three.js/blob/r181/LICENSE
- Reference docs: https://threejs.org/docs/pages/GLTFLoader.html ; https://threejs.org/docs/pages/module-SkeletonUtils.html ; https://dev.epicgames.com/documentation/unreal-engine/working-with-modular-characters-in-unreal-engine ; https://github.khronos.org/Vulkan-Site/tutorial/latest/Advanced_glTF/Procedural_Animation_IK/01_introduction.html
- Previous failed character receipt: pruebas@candidate/prometeo-3d-character-factory-v2-bases-20261117 (9-joint SDF canary, NOT_APPROVED). Furniture surface gate/assembly candidate recovered from owner, not represented as deforming mesh QA. No changes to previous assets.

## Reproduce
Node 22, from this directory: `node generate.mjs` (network access for pinned CC0 source); serve with static HTTP server. Individual demos are overlay-free and run a 360-degree orbit, face close-up, walk, turn, wave, idle and repeat. Browser/WebGL and Android status: NOT_RUN. See BUILD_RECEIPT.json and each PROFILE.json. No claim of visual PASS or cross-work interoperability.
