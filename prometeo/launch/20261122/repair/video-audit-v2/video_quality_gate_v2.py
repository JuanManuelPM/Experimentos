#!/usr/bin/env python3
"""PROMETEO Video QA candidate. Technical evidence gate, never aesthetic certification."""
import argparse, json, pathlib, shutil, subprocess, sys

VALID_INTENTS = {"fiction", "product", "documentary", "typography", "oner", "music_video", "silent_story", "data", "atmosphere", "editor"}


def evaluate(manifest, *, root=pathlib.Path("."), probe=True):
    errors, warnings = [], []
    identity = manifest.get("identity", {})
    design = manifest.get("design", {})
    media = manifest.get("media", {})
    review = manifest.get("review", {})
    task = identity.get("taskNumber")
    if identity.get("batchId") != "video-w002-20261122" or type(task) is not int or not 1 <= task <= 10:
        errors.append("IDENTITY_MISMATCH")
    if design.get("intent") not in VALID_INTENTS or not design.get("audienceEffect"):
        errors.append("INTENT_MISSING")
    if not design.get("representation") or not design.get("referenceCapability"):
        errors.append("ART_DIRECTION_CHOICE_UNJUSTIFIED")
    if not design.get("rejectedShortcut") or not design.get("alternativeTechnique"):
        errors.append("NO_REJECTED_SHORTCUT_OR_ALTERNATIVE")
    first = design.get("firstSlice", {})
    if first.get("status") != "OBSERVED" or not first.get("evidence") or not first.get("critique"):
        errors.append("FIRST_SLICE_NOT_OBSERVED")
    if design.get("intent") in {"fiction", "silent_story", "oner"} and not design.get("causalActionTest"):
        errors.append("CAUSAL_ACTION_UNTESTED")
    if design.get("intent") in {"documentary", "data"} and not design.get("sourceLedger"):
        errors.append("PROVENANCE_LEDGER_MISSING")
    if review.get("humanApproved") is True or review.get("professionalGrade") is True:
        errors.append("SELF_APPROVAL_FORBIDDEN")
    if media.get("status") not in {"PUBLIC", "LOCAL", "NOT_EXPORTED"}:
        errors.append("MEDIA_STATUS_UNKNOWN")
    if media.get("status") == "NOT_EXPORTED":
        warnings.append("NO_VIDEO_EXPORT")
    else:
        path = media.get("file")
        if not path or pathlib.Path(path).is_absolute() or ".." in pathlib.Path(path).parts:
            errors.append("MEDIA_PATH_UNSAFE_OR_MISSING")
        else:
            full = root / path
            if not full.is_file():
                errors.append("MEDIA_BINARY_UNAVAILABLE")
            elif probe:
                if not shutil.which("ffprobe"):
                    warnings.append("FFPROBE_NOT_RUN")
                else:
                    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height", "-of", "json", str(full)], capture_output=True, text=True, timeout=15)
                    if p.returncode:
                        errors.append("FFPROBE_FAILED")
                    else:
                        data = json.loads(p.stdout)
                        streams = data.get("streams", [])
                        videos = [s for s in streams if s.get("codec_type") == "video"]
                        audios = [s for s in streams if s.get("codec_type") == "audio"]
                        if not videos or float(data.get("format", {}).get("duration", 0)) <= 0:
                            errors.append("INVALID_VIDEO_STREAM_OR_DURATION")
                        if not audios:
                            errors.append("AUDIO_TRACK_MISSING")
            if not media.get("frameSamples") or len(media.get("frameSamples")) < 3:
                errors.append("START_MIDDLE_END_NOT_REVIEWED")
            if media.get("audioReview") != "OBSERVED":
                warnings.append("CRITICAL_LISTENING_NOT_RUN")
            if media.get("status") == "PUBLIC" and not media.get("publicUrl"):
                errors.append("PUBLIC_URL_MISSING")
    status = "BLOCKED" if errors else ("INCOMPLETE_NO_FILM" if media.get("status") == "NOT_EXPORTED" else "TECHNICAL_EVIDENCE_READY_ART_NOT_CERTIFIED")
    return {"status": status, "errors": errors, "warnings": warnings,
            "qualityClaimAllowed": False, "humanApproved": False,
            "scope": "Checks traceability and binary presence. Perceptual notes are declarations, not independent proof."}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("manifest", type=pathlib.Path)
    ap.add_argument("--root", type=pathlib.Path, default=pathlib.Path("."))
    ap.add_argument("--no-probe", action="store_true", help="Only for structural fixture tests; does not certify media")
    args = ap.parse_args()
    result = evaluate(json.loads(args.manifest.read_text(encoding="utf-8")), root=args.root, probe=not args.no_probe)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["status"] == "TECHNICAL_EVIDENCE_READY_ART_NOT_CERTIFIED" else 1


if __name__ == "__main__":
    sys.exit(main())
