# STT REVIEW / EVIDENCE CONTRACT V1

Purpose: preserve uncertainty instead of flattening it into one transcript, and make human review fast enough to improve the system.

## Unit of evidence

Every hypothesis is timestamped and attributable:

```json
{
  "audio_fingerprint": "optional-sha256",
  "source": "parakeet-local|groq-whisper-large-v3|gemini|youtube-asr|human|...",
  "model": "optional",
  "config": {},
  "start": 915.0,
  "end": 975.0,
  "text": "hypothesis text",
  "confidence": 0.91,
  "speaker": null,
  "created_at": "ISO-8601"
}
```

A source hypothesis is immutable evidence. Human edits are separate review decisions and never overwrite source evidence.

## Conflict classes

1. formatting-only: punctuation, casing, written-number formatting
2. boundary: different chunk/window boundaries
3. lexical: one or more words differ
4. named-entity/domain-term: likely author/concept/name disagreement
5. acoustic: low-quality/overlap/noise/inaudible
6. speaker-change: likely diarization or speaker transition
7. omission/insertion: one source misses/adds a phrase
8. hallucination/silence: text generated where audio evidence is weak

Conflict severity must not be a raw majority vote. Weight at least:
- pairwise semantic/word disagreement
- source diversity (correlated variants count less)
- calibrated source reliability from reviewed/gold segments
- acoustic quality / speech presence
- named-entity/domain-term risk
- whether disagreement changes meaning

## Human review decision

```json
{
  "start": 915.0,
  "end": 975.0,
  "decision": "accepted|edited|inaudible|speaker_note|defer",
  "text": "reviewed text or marker",
  "speaker": null,
  "review_ms": 8300,
  "reviewed_at": "ISO-8601",
  "based_on_sources": ["source-a","source-b"]
}
```

## Review UI

Sort by expected value, not chronology:
1. high semantic conflict
2. named entities/domain terms
3. speaker changes
4. omissions/insertions
5. low-confidence acoustic spans
6. formatting-only last or auto-resolved

For each conflict show:
- exact timestamp
- consensus text with disputed words yellow + underlined
- every source hypothesis and provenance
- exact audio playback
- context playback ±5 seconds
- edit box
- Accept / Inaudible / Speaker change / Skip / Next
- persistent review decision

## Metrics

### Compute pipeline
- file read ms
- decode/resample ms
- segmentation/VAD ms
- model load + warm-up ms
- queue wait ms
- PCM copy/transfer ms
- inference ms
- merge/alignment ms
- persistence ms
- UI/render ms
- worker idle ms
- event-loop lag p50/p95/max
- throughput audio-seconds / wall-second
- speedup by worker count
- parallel efficiency = speedup / workers
- duplicated audio due to overlap
- error/retry rate

### Quality / conflict
- conflicts per audio minute
- weighted conflict severity
- agreement by source pair
- source-specific correction rate
- human correction rate
- inaudible rate
- speaker-change rate
- formatting-only conflict rate
- named-entity conflict rate
- unresolved rate

### Human review economics
- seconds per reviewed conflict
- conflicts reviewed per minute
- percent auto-accepted
- percent manually edited
- false-alarm rate of conflict detector
- projected human minutes to clean one hour of audio

## Gold-set loop

Human-reviewed segments become a small gold set. Use them to:
- estimate WER/CER per source
- calibrate source weights
- tune conflict thresholds
- measure whether a new model/config actually adds information
- identify model-specific domain/name errors

Do not generalize metrics from tiny benchmark phrases to long-class audio without labeling that limitation.

## Final export

Export both:
1. clean transcript for study / downstream cleanup
2. evidence JSON with hypotheses, conflicts, decisions, unresolved spans and metrics

A downstream LLM may polish structure and punctuation, but must receive uncertainty markers and must not silently invent content for unresolved/inaudible audio.
