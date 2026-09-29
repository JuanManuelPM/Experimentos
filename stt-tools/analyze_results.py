#!/usr/bin/env python3
import json, math, pathlib, re, unicodedata, itertools, collections

ROOT = pathlib.Path("stt-results")
SESSIONS = ROOT / "sessions"
ANALYSIS = ROOT / "analysis"
ANALYSIS.mkdir(parents=True, exist_ok=True)

REFS = {
    "natural": "Hoy quiero probar qué tan bien funciona esta transcripción cuando hablo a una velocidad normal y sin exagerar la pronunciación.",
    "rioplatense": "Che, fijate si podés entenderme aunque hable rápido, junte algunas palabras y no marque demasiado cada sílaba.",
    "prometeo": "Prometeo debería escuchar una frase, comparar varias hipótesis y conservar las palabras que aparecen con mayor consistencia.",
    "confusiones": "Quiero comprobar si distingue entre esto, efecto, Héctor y texto cuando las palabras aparecen dentro de una frase completa.",
    "numeros": "El martes catorce de octubre a las siete y media tengo que revisar treinta y dos archivos antes de las nueve.",
    "tecnico": "Después voy a abrir GitHub, ejecutar el proceso y revisar si el build de Firefox coincide con el resultado publicado.",
    "contexto": "Si una palabra sale mal al principio, no me importa que se corrija un segundo después, siempre que la frase final quede mejor y no pierda el contexto.",
    "comandos": "Che Prometeo, poné pausa, bajá el volumen y después seguí escuchando cuando yo diga continuar.",
}

def norm(s):
    s = unicodedata.normalize("NFD", str(s or "").lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9ñ\s]", " ", s, flags=re.I)
    return re.sub(r"\s+", " ", s).strip()

def toks(s):
    n = norm(s)
    return n.split() if n else []

def raw_toks(s):
    return str(s or "").strip().split()

def lev(a, b):
    d = list(range(len(b) + 1))
    for i, av in enumerate(a, 1):
        prev = d[0]
        d[0] = i
        for j, bv in enumerate(b, 1):
            old = d[j]
            d[j] = min(d[j] + 1, d[j-1] + 1, prev + (0 if av == bv else 1))
            prev = old
    return d[-1]

def wer(ref, hyp):
    a, b = toks(ref), toks(hyp)
    return 100.0 * lev(a, b) / max(1, len(a))

def family(model):
    model = str(model or "")
    for x in ("Vosk", "Whisper", "Moonshine", "Parakeet", "Ensemble"):
        if model.startswith(x):
            return x
    return model.split(" ")[0] if model else "Otro"

def source(r):
    return f"{r.get('model','?')} · {r.get('config','?')}"

def align(ref, hyp):
    A, B, raw = toks(ref), toks(hyp), raw_toks(hyp)
    n, m = len(A), len(B)
    dp = [[0]*(m+1) for _ in range(n+1)]
    for i in range(n+1): dp[i][0] = i
    for j in range(m+1): dp[0][j] = j
    for i in range(1, n+1):
        for j in range(1, m+1):
            dp[i][j] = min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1] + (A[i-1] != B[j-1]))
    out = [None]*n
    i, j = n, m
    while i or j:
        if i and j and dp[i][j] == dp[i-1][j-1] + (A[i-1] != B[j-1]):
            out[i-1] = raw[j-1] if j-1 < len(raw) else B[j-1]
            i -= 1; j -= 1
        elif i and dp[i][j] == dp[i-1][j] + 1:
            i -= 1
        else:
            j -= 1
    return out

def avg(xs):
    return sum(xs)/len(xs) if xs else None

def analyze_session(doc):
    results = doc.get("results", [])
    normalized = []
    for r in results:
        x = dict(r)
        test = x.get("test") or x.get("test_id")
        x["test"] = test
        x["reference"] = x.get("reference") or REFS.get(test, "")
        normalized.append(x)

    groups = {}
    failures = collections.Counter()
    by_test = collections.defaultdict(list)
    for r in normalized:
        by_test[r["test"]].append(r)
        key = source(r)
        g = groups.setdefault(key, {"ok":0,"fail":0,"wers":[],"cers":[],"infer":[],"load":[],"family":family(r.get("model"))})
        if r.get("status") == "ok" and isinstance(r.get("wer"), (int,float)):
            g["ok"] += 1
            g["wers"].append(float(r["wer"]))
            if isinstance(r.get("cer"), (int,float)): g["cers"].append(float(r["cer"]))
            if isinstance(r.get("infer_ms"), (int,float)): g["infer"].append(float(r["infer_ms"]))
            if isinstance(r.get("load_ms"), (int,float)): g["load"].append(float(r["load_ms"]))
        else:
            g["fail"] += 1
            failures[f"{key} :: {r.get('error') or 'unknown'}"] += 1

    ranking = []
    for name, g in groups.items():
        ranking.append({
            "name": name, "family": g["family"], "ok": g["ok"], "fail": g["fail"],
            "wer": avg(g["wers"]), "cer": avg(g["cers"]),
            "infer_ms": avg(g["infer"]), "load_ms": avg(g["load"])
        })
    ranking.sort(key=lambda x: (999 if x["wer"] is None else x["wer"], 1e12 if x["infer_ms"] is None else x["infer_ms"]))

    total_words = oracle_misses = conflict_words = wrong_agreement = 0
    confusions = collections.Counter()
    unique_correct = collections.Counter()
    test_details = {}
    pair = collections.defaultdict(lambda: [0,0])

    for test, rows in by_test.items():
        ok = [r for r in rows if r.get("status") == "ok" and r.get("text") and r.get("reference") and family(r.get("model")) != "Ensemble"]
        ref = (ok[0]["reference"] if ok else (rows[0].get("reference") or REFS.get(test,""))) if rows else ""
        ref_words, ref_norm = raw_toks(ref), toks(ref)
        aligned = {source(r): align(ref, r["text"]) for r in ok}
        src_to_row = {source(r): r for r in ok}

        words = []
        for i, word in enumerate(ref_words):
            rn = ref_norm[i] if i < len(ref_norm) else norm(word)
            variants = {}
            fams = set()
            for src, arr in aligned.items():
                if i >= len(arr) or not arr[i]:
                    continue
                form = arr[i]; k = norm(form)
                if not k: continue
                v = variants.setdefault(k, {"form":form,"sources":[],"families":set()})
                v["sources"].append(src)
                v["families"].add(family(src_to_row[src].get("model")))
                fams.add(family(src_to_row[src].get("model")))
            chosen = None
            for k,v in variants.items():
                score = len(v["families"])*100 + len(v["sources"])
                if chosen is None or score > chosen["score"]:
                    chosen = {"key":k,"score":score,"form":v["form"],"families":len(v["families"]),"sources":len(v["sources"])}
            correct = variants.get(rn)
            total_words += 1
            if not correct: oracle_misses += 1
            if len(variants) > 1: conflict_words += 1
            wrong = bool(chosen and chosen["key"] != rn and chosen["families"] >= 2)
            if wrong: wrong_agreement += 1
            if correct and len(correct["sources"]) == 1:
                unique_correct[correct["sources"][0]] += 1
            for k,v in variants.items():
                if k != rn:
                    confusions[f"{k} → {rn}"] += len(v["sources"])
            words.append({
                "reference": word,
                "variant_count": len(variants),
                "correct_available": bool(correct),
                "chosen": chosen,
                "wrong_agreement": wrong,
                "variants": [
                    {"text":v["form"],"families":sorted(v["families"]),"sources":v["sources"]}
                    for _,v in sorted(variants.items(), key=lambda kv:(-len(kv[1]["families"]),-len(kv[1]["sources"]),kv[0]))
                ]
            })

        srcs = list(aligned)
        for a,b in itertools.combinations(srcs,2):
            aa, bb = aligned[a], aligned[b]
            same = both = 0
            for x,y in zip(aa,bb):
                if x and y:
                    both += 1
                    same += norm(x) == norm(y)
            if both:
                key = tuple(sorted((a,b)))
                pair[key][0] += same; pair[key][1] += both

        best = []
        for r in rows:
            if r.get("status") == "ok" and isinstance(r.get("wer"), (int,float)):
                best.append({"name":source(r),"wer":r["wer"],"infer_ms":r.get("infer_ms"),"text":r.get("text","")})
        best.sort(key=lambda x:(x["wer"], x["infer_ms"] or 1e12))
        test_details[test] = {"reference":ref,"best":best[:8],"words":words}

    redundancy = []
    for (a,b),(same,both) in pair.items():
        redundancy.append({"a":a,"b":b,"agreement":100.0*same/both,"n":both})
    redundancy.sort(key=lambda x:(-x["agreement"],-x["n"]))

    return {
        "session": doc.get("session"),
        "build": doc.get("build"),
        "result_count": len(results),
        "failure_count": sum(1 for r in results if r.get("status") != "ok"),
        "complete": bool(doc.get("complete")),
        "expected": doc.get("expected"),
        "ranking": ranking,
        "best_individual": next((x for x in ranking if x["family"] != "Ensemble" and x["wer"] is not None), None),
        "oracle_approx_wer": (100.0*oracle_misses/total_words if total_words else None),
        "total_reference_words": total_words,
        "conflict_words": conflict_words,
        "wrong_agreement_words": wrong_agreement,
        "unique_correct_contribution": [{"source":k,"count":v} for k,v in unique_correct.most_common(30)],
        "redundancy": redundancy[:30],
        "confusions": [{"pair":k,"count":v} for k,v in confusions.most_common(50)],
        "failure_causes": [{"cause":k,"count":v} for k,v in failures.most_common()],
        "tests": test_details,
    }

for path in sorted(SESSIONS.glob("*.json")):
    try:
        doc = json.loads(path.read_text())
        out = analyze_session(doc)
        (ANALYSIS / path.name).write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
    except Exception as e:
        print(f"analysis failed for {path}: {e}")
