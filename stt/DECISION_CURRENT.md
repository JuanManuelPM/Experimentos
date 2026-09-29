# STT · DECISION CURRENT

Updated: 2026-09-28

## Practical choice for class transcription

**Primary engine:** Parakeet TDT 0.6B v3 INT8 via parakeet.js.

Reason: on session `mass-mulwmyw9-ehxp51`, Parakeet full produced:

- 8/8 successful benchmark texts.
- Macro raw WER: **7.1849%**.
- Macro semantic-normalized WER: **4.2087%**.
- Mean inference time: **3661.6 ms** for clips of roughly 7–10 seconds.
- 0% WER on the confusions, technical, and commands tests.
- Clean preprocessing did not improve aggregate accuracy and was effectively redundant in this sample.

The current analysis found an approximate word-availability oracle WER of **3.8217%**, so further gains are more likely to come from better selection/consensus and targeted review than from multiplying near-identical Vosk passes.

## Production candidate

Public stable page:

https://juanmanuelpm.github.io/Experimentos/stt/transcribe/

Behavior:
- downloads Parakeet once and caches model files through the browser stack;
- runs transcription locally in the browser;
- uses WebGPU when available, otherwise WASM;
- short audio uses direct transcription;
- long WAV uses streaming chunks to avoid decoding the entire class into RAM;
- other browser-decodable audio formats use Web Audio and Parakeet long-audio sentence-aware chunking;
- shows timing, realtime factor, confidence when available, timestamped segments, copy and TXT export.

## Experiment conclusions kept separate from production

- Vosk 0.3 remains useful as a lightweight fallback / command recognizer, but is not the current class-dictation choice.
- Vosk 0.42 browser load failed in V2; external Python and corrected browser paths remain experimental.
- Browser Whisper Q8 failed due to ONNX/quantization path; V4 tries FP32, but it is not on the critical path for tomorrow.
- Moonshine MediumStreaming timed out; Base remains experimental.
- External GitHub Actions matrix remains useful for comparison, not required for using the production candidate.

## Next optimization after the class is no longer urgent

Use the persisted V4 audio corpus to:
1. test repeatability under idle vs load;
2. compare local vs GitHub runner results on identical audio;
3. add low-confidence targeted second-pass review;
4. improve semantic normalization and consensus.
