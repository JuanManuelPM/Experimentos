# PROMETEO · visual mobile candidate · 2026-11-23

Status: CANDIDATE / code and partial offline browser checks; NOT deployed or visually approved.

Base gh-pages snapshot: `e801283ae0b4a68c741ee4f3e16132bb31527396`. Implementation head before receipt: `f056b7353dc80e01294ac3eba2686a60448ce315`.
Scope: seven existing files under prometeo/root/. No study entry, production asset, index data, private repository or gh-pages write. Five studio entries read; left unchanged because no independently demonstrated implementation defect in those entries.

## Changes
- Existing ROOT and gallery retained; one shared result-link matcher. Exact room, batch and task number or explicit legacy message ID without conflicting batch; newest matching return. Only recognized public Pages work formats, no arbitrary GitHub/QA fallback. A return lacking a work link remains visible as such.
- W5 canonical 3D aliases now restricted to the original W5 batch, not reused for W6/W7 task numbers.
- ROOT waits for initial data before choosing its route, gives static gallery access while loading, differentiates missing indexes from empty selection, and removes the VER link that simply reopened ROOT. Fetch timeouts and gallery retry on failure.
- Existing CSS improved for mobile control heights, text, wrapping, one-column narrow layouts and warm active accent. Existing focus view and shell retained.

## Evidence
V8 module-body parse PASS for changed ROOT and gallery scripts (imports stripped for parse); shared model checks PASS for newest same-room return, wrong-batch rejection, private/QA link rejection, public HTML and image URL conversion. Real source snapshot: 15 batches, 150 tasks; 137 matched returns, 96 recognized public work links, 41 matched returns without recognized public work links, 13 unmatched tasks. These are matching counts, not URL availability or a new reconciliation of source records.

Authorized GitHub reads verified HTML source exists at base:
- prometeo/root/workspaces/music/studio-v2.html, blob b58bdfa9117880798c96965fc221a8bb457e29f2
- prometeo/works/web-w003-20261122/08/index.html, blob 2a10343d312f027fad614c49a4326473ffca8ed8
- prometeo/asset-lab/chair-01/index.html, blob 04ecec054f4a320fe22b17ff358a49bfb5bef52d
- prometeo/asset-lab/chair-02/index.html, blob 6b986801b01fbee17a0db4ba20bb26b95159f034
Read only. No claim of browser load.

Offline Chromium with touch/mobile emulation: candidate gallery three blobs matched exactly before inlining scripts and replacing network fetch/history with fixtures. Live DNS failed; localhost navigation blocked by administrator. No live navigation, physical Android, ROOT live render, WebGL or production media load. Fixtures intentionally include valid public URL strings, a QA-only return and an unmatched task. PASS at 332x738, 738x332, 390x844: min measured nav/copy/back height 44 CSS px, no horizontal overflow, 503 retry, correct links/nonlinks, studio switch with stubbed history, zero page errors. Screenshots produced offline with fixture labels, not production screenshots:
- gallery-332.png SHA256 397085332363799aa596a071b1bc54d9018e540b11dc1cacb951706c60728257
- gallery-738.png SHA256 88994f68117285806a4769cdc15e42c9b1d32e7491d8acf020a517b114ddc9a5
- gallery-error-332.png SHA256 67561733afda1aa65c4b9297a2ab8808091d71d08bf538f878e329cc3850e2c5
Candidate gallery source blobs: index.html 1046cefad84d91bff9688a06711bef58694da6b1; gallery.mjs 7528e64869c38ae6596aa7738b3f1cf0368ab881; model.mjs 98fa925e1f8e059a0fbe67eedf0d137ecdd44aa4.

## Limits
No visual approval, no live Pages/browser verification, no changes to ChatGPT UI. Candidate must not be represented as public deployment. No additional QA worker or serial process created.
