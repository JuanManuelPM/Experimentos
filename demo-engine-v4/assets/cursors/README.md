# Cursor assets — Demo Engine V4

## Source

The current cursor family is derived from **Bibata Cursor**. The original project is licensed under **GPL-3.0-or-later**. See `../../NOTICE.md` and `../../LICENSE-BIBATA-GPL-3.txt`.

## Runtime representation

For the public experiment the cursor SVGs are embedded as data URIs in `../../pointer-assets.js`. Hotspots and intended sizes are declared separately in `../../pointer-manifest.json`.

## Rules

- Never position a cursor by its image box. Position its **hotspot**.
- Mode changes must preserve the visible hotspot unless the action explicitly calls for a cut.
- Do not invent replacement cursor drawings in CSS when a registered asset exists.
- Preserve high contrast on light and dark backgrounds.
- Adding a new pointer mode requires: asset, hotspot, size, semantic use and quality-gate coverage.
- If upstream geometry is modified, keep provenance and licensing explicit.

## Current semantic modes

`arrow`, `hand`, `grab`, `grabbing`, `text`, `resize-ew`, `resize-ns`, `resize-d1`, `forbidden`.
