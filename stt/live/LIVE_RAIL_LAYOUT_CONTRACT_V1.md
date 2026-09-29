# STT Live Rail Layout Contract V1

Status: CURRENT for `stt/live/`

## Topology

- LIVE is strictly one-dimensional. It never wraps and never creates a second visual row.
- HISTORY is two-dimensional. It may wrap and scroll vertically.
- LIVE shows only the latest turn. Older turns may continue processing but are rendered only in HISTORY.

## Coordinate ownership

- Audio owns the horizontal time axis.
- Every audio bar gets an immutable slot/x when created.
- Draft text never moves, deletes, inserts, hides, or repositions an audio bar.
- Quality text never moves, deletes, inserts, hides, or repositions an audio bar.
- Camera owns viewport movement. Objects do not move each other.

## Monotonic frontiers

- `audioFrontierX` only increases.
- `draftFrontierX` must remain behind audio by at least `MIN_LEAD_PX` during capture.
- `qualityFrontier` never moves backward and never turns a confirmed token gray.
- While recording, quality remains visibly behind draft.

## Capture independence

- START may only create a new turn and start PCM capture.
- STOP may only close PCM capture for that turn.
- START/STOP do not cancel draft timers, quality timers, or prior turns.
- Starting turn N+1 must not stop turn N from resolving.

## Rendering

- Audio bars are an immutable background rail.
- Text is a separate nowrap rail above the bars.
- LIVE uses one shared camera transform for both rails.
- No `flex-wrap`, no geometric masking, no `visibility:hidden` placeholders, no word-to-bar consumption mapping.
- HISTORY uses ordinary paragraph layout and is the authoritative readable transcript view.

## Performance

- LIVE keeps only a bounded recent set of bar DOM nodes; old bars may be virtualized after leaving the viewport.
- Transcript state is never discarded when LIVE visual nodes are virtualized.

## Regression checks

1. 5 s, 30 s, and 2 min dictation: LIVE remains exactly one row.
2. Draft cannot catch the audio head during normal speech.
3. Quality never turns white text gray again.
4. Stop recording: prior animations continue.
5. Start a second recording while the first resolves: both continue independently.
6. Resize viewport: camera changes, state/frontiers do not.
7. Click LIVE: HISTORY opens with full wrapped transcript; LIVE state does not change.
8. No audio bar changes x after creation.
