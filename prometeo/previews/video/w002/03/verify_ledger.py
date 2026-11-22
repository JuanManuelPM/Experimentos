#!/usr/bin/env python3
"""Reusable audiovisual provenance checker.
The ledger is per half-open frame range and claim ID, not a list of decorative credits.
Usage: python3 verify_ledger.py PROVENANCE.json
Exit non-zero for incomplete, overlapping, unsupported or date-mislabeled ranges.
"""
import json, pathlib, re, sys
def validate(d):
    errors=[]; assets=d.get("media",{}); claims=d.get("claims",{})
    fps=d.get("fps"); total=d.get("frameCount"); duration=d.get("durationSeconds")
    if fps!=24 or total!=1152 or duration!=48: errors.append("Unexpected fps/frame count/duration")
    current=0; seen=set()
    for item in d.get("segments",[]):
        name=item.get("id")
        if not name or name in seen: errors.append("Missing or duplicate segment id")
        seen.add(name)
        start,end=item.get("startFrame"),item.get("endFrame")
        if not isinstance(start,int) or not isinstance(end,int) or start!=current or end<=start:
            errors.append(f"Gap/overlap/empty range in {name}: {current} -> {start}:{end}")
            continue
        if item.get("startSeconds")!=start/fps or item.get("endSeconds")!=end/fps:
            errors.append(f"Second/frame mismatch: {name}")
        current=end
        aid=item.get("assetId")
        if aid:
            a=assets.get(aid)
            if not a: errors.append(f"Unknown asset {aid}");continue
            if item.get("dateCaptured")!=a.get("date") or item.get("author")!=a.get("creator") or item.get("publishedAt")!=a.get("publishedAt"):
                errors.append(f"Wrong provenance for {name}")
            if item.get("mediaSha256")!=a.get("downloadedSha256") or not re.fullmatch("[0-9a-f]{64}",a.get("downloadedSha256","")):
                errors.append(f"No verified binary hash for {name}")
            if item.get("license")!=a.get("license") or not (a.get("commons","").startswith("https://commons.wikimedia.org/wiki/File:") or a.get("commons","").startswith("https://www.pexels.com/video/") or a.get("commons","").startswith("https://www.nesdis.noaa.gov/news/")):
                errors.append(f"Missing legal credit: {name}")
            label=item.get("label","")
            if aid=="VENICE_CONTEXT" and ("CONTEXTO" not in label or item.get("kind")!="CONTEXT_VIDEO"):
                errors.append(f"Context footage mislabeled: {name}")
            if aid=="SATELLITE_2019_14" and "2019" not in label and "187" not in label:
                errors.append(f"Nov 14 satellite unlabeled: {name}")
            if aid=="FLOOD_CONTEXT" and ("CONTEXTO" not in label or item.get("kind")!="CONTEXT_VIDEO"):
                errors.append(f"Undated flood B-roll mislabeled: {name}")
        else:
            if item.get("kind") not in ("ORIGINAL_DATA_GRAPHIC","ORIGINAL_CREDITS"):
                errors.append(f"Graphic incorrectly presented as evidence: {name}")
        for c in item.get("claimIds",[]):
            claim=claims.get(c)
            if not claim or not claim.get("primarySource","").startswith("https://"):
                errors.append(f"No original evidence for claim {c} in {name}")
    if current!=total: errors.append(f"Timeline coverage {current} != {total} frames")
    for item in claims.values():
        if not item.get("datum") or not item.get("unit"):
            errors.append("Numerical claim lacks unit/datum")
    if d.get("taskId")!="video-w002-20261122-03": errors.append("Wrong task")
    if d.get("audio",{}).get("voice","").lower().find("synthetic")<0:
        errors.append("Voice provenance omitted")
    if errors: return {"status":"FAIL","errors":errors}
    return {"status":"PASS","segments":len(seen),"frames":current,"claims":len(claims)}
if __name__=="__main__":
    if len(sys.argv)!=2: raise SystemExit("Usage: verify_ledger.py PROVENANCE.json")
    verdict=validate(json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf8")))
    print(json.dumps(verdict,indent=2,ensure_ascii=False))
    sys.exit(0 if verdict["status"]=="PASS" else 1)
