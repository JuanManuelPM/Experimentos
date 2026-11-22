# FORM / 01 · OBJETO EN ESCENA (VIDEO W003 / 02)

**taskId:** `video-w003-20261122-02` · **branch:** `candidate/prometeo-video-w003-20261122-02`  
**brief:** [VIDEO W003, section 02](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/relaunch/video/LAUNCH.md#02--objeto-en-escena--anuncio-de-producto-cinematográfico)  
**LAUNCH SHA:** `0cc574528594731a3d1cf0c15a0d0e5a37e775b7`. Previous W002 source SHA: `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`.

## Film

**FORM / 01**, an original 16-second CGI product film for a fictional foldable lamp. Camera moves from hinge detail to folded form, reveals two linked arms continuously through a physical unfolding, switches to emitter macro, then ends on a hero packshot. Original synthesized tactile audio. 960×540 · 24 fps · H.264/AAC 48kHz stereo.

**Media truth:** the actual MP4 was rendered and probed **locally in the execution chat** (SHA256 `c144e87124968354e8be200a66e794dbf6ce6f375aba05097d5f83a47f5d1fb0`); **the MP4 has NOT been uploaded to GitHub or Pages.** Do not invent a playable public URL. The user received a sandbox download and rendered contact sheet in that conversation. This repository branch contains the documented work, parametric shot system, quality receipt and method record.

## Reusable system

- [PRODUCT_SHOTS.json](PRODUCT_SHOTS.json): locked design dimensions, joint geometry, five shot definitions, cinematic cues and audio event timings.
- [SHOT_SYSTEM.mjs](SHOT_SYSTEM.mjs): reusable and deterministic product kinematics, camera time map and joint continuity tests.
- [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json): Q-LOOP/QBAR/DEEP-SPEC-1 and FIRST-ARTICLE reasoning.
- [QA.json](QA.json): real technical tests, limits, and comparison to W002.
- [TRACE.json](TRACE.json): actual stages, source hashes, and evidence.

**Local production recipe:** Python 3 with `vtk`, `numpy`, `Pillow`, `scipy`; FFmpeg on PATH. The complete execution-specific `render.py` (11kB) and rendered MP4 are supplied as local artifacts of the same chat, not falsely claimed here as hosted source. The geometry is always a single model, not a series of incompatible product images.

## Evaluation / comparison

Benchmark observations: [Artemide Tolomeo](https://www.artemide.com/en/subfamily/1849546/tolomeo-tavolo) (articulation and construction) and [Dyson Solarcycle Morph](https://www.dyson.com/lighting/solarcycle-morph) (multi-use light source). Neither brand's photography, footage, design CAD or sound is copied or used as source asset.

W002 / 02 reported a 16 s 640×360 film only in a chat, and retained source in a previous candidate branch. W003 / 02 produces a separate higher-resolution 16 s local film, more shot-specific hinge/light continuity evidence, actual decoder probes, and records the black-render failure followed by a renderer-family repair. **This is not proof of superior product-ad aesthetics**: stylized metal lighting, simplified shadows and lack of true environment reflections remain important deficits.

**Delivery statuses:** LOCAL_MOVIE_VERIFIED · SOURCE_DOCS_REMOTE_PUBLISHED · PUBLIC_MOVIE_MISSING · HUMAN_APPROVED=NO. No W001/W002 works or launchers modified.
