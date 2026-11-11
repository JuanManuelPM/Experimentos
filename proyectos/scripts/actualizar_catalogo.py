#!/usr/bin/env python3
"""Fusiona versiones de un release validado, preservando IDs e historial.

Uso: python scripts/actualizar_catalogo.py catalog.json releases/round-002.json
No publica ni prueba páginas: el coordinador debe realizar QA independiente.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ALLOWED_STATES = {"PUBLIC_CANDIDATE_NOT_E2E_TESTED", "VERIFIED", "BLOCKED_BACKEND", "SOURCE_ONLY"}
ALLOWED_CAT = {"games", "tools", "education"}
ALLOWED_KIND = {"2D", "3D", "Experimento", "Web", "Educación"}
SHA = re.compile(r"^[0-9a-f]{40}$")
ID = re.compile(r"^[a-z0-9][a-z0-9-]{0,79}$")


def apply(catalog, release):
    if catalog.get("schema") != "prometeo.library-catalog/v1" or not isinstance(catalog.get("items"), list):
        raise ValueError("Catálogo inválido")
    if release.get("schema") != "prometeo.library-release/v1" or not isinstance(release.get("updates"), list):
        raise ValueError("Entrega inválida")
    if len(release["updates"]) > 100:
        raise ValueError("Demasiadas actualizaciones")
    ids = [item["id"] for item in catalog["items"]]
    if len(ids) != len(set(ids)):
        raise ValueError("IDs duplicados en el catálogo")
    items = {item["id"]: item for item in catalog["items"]}
    seen = set()
    for update in release["updates"]:
        pid = update.get("id")
        version = update.get("version")
        if not isinstance(pid, str) or not ID.fullmatch(pid) or pid in seen:
            raise ValueError("ID inválido o duplicado")
        seen.add(pid)
        if not isinstance(version, dict) or version.get("state") not in ALLOWED_STATES:
            raise ValueError("Estado de versión inválido")
        name = version.get("name")
        if not isinstance(name, str) or not re.fullmatch(r"[\w .-]{1,55}", name):
            raise ValueError("Nombre de versión inválido")
        if pid not in items:
            if update.get("category") not in ALLOWED_CAT or update.get("kind") not in ALLOWED_KIND:
                raise ValueError("Categoría/tipo necesarios para un proyecto nuevo")
            item = {"id": pid, "name": str(update.get("name") or pid)[:90],
                    "category": update["category"], "kind": update["kind"],
                    "summary": str(update.get("summary") or "")[:160],
                    "parts": [], "versions": []}
            catalog["items"].append(item)
            items[pid] = item
        item = items[pid]
        if any(v.get("name") == name for v in item.get("versions", [])):
            raise ValueError("La versión ya existe: " + pid + "/" + name)
        url = version.get("previewUrl")
        if url is not None:
            parsed = urlsplit(url)
            if parsed.scheme != "https" or not parsed.netloc or parsed.username or parsed.password:
                raise ValueError("URL no segura")
        commit = version.get("commit")
        if commit is not None and not SHA.fullmatch(commit):
            raise ValueError("Commit inválido")
        if version["state"] == "VERIFIED" and not (
                url and version.get("runtimeProof") and version.get("publicProof")
        ):
            raise ValueError("VERIFIED necesita URL y pruebas reales")
        state = version["state"]
        item["versions"] = [dict(version,
                                 publicVerified=state == "VERIFIED",
                                 runtimeVerified=state == "VERIFIED"),
                            *item.get("versions", [])]
        item["version"] = name
        item["previewUrl"] = url
        item["previewVerified"] = state == "VERIFIED"
        item["publicCandidate"] = state == "PUBLIC_CANDIDATE_NOT_E2E_TESTED"
        item["status"] = ("verified" if state == "VERIFIED" else
                          "blocked" if state == "BLOCKED_BACKEND" else
                          "source" if state == "SOURCE_ONLY" else "candidate")
        item["revision"] = str(update.get("revision") or "Pruebas pendientes")[:140]
        item["verification"] = {
            "runtimePass": state == "VERIFIED",
            "publicPass": state == "VERIFIED",
            "evidenceRef": version.get("publicProof") or "",
        }
        if update.get("reviewUrl"):
            item["reviewUrl"] = update["reviewUrl"]
    rid = release.get("roundId")
    if rid:
        if any(x.get("id") == rid for x in catalog.get("rounds", [])):
            raise ValueError("Ronda duplicada")
        catalog.setdefault("rounds", []).append({
            "id": rid,
            "reviewUrl": release.get("reviewUrl"),
            "reportRef": release.get("reportRef"),
            "products": list(seen),
        })
    return catalog


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Uso: python actualizar_catalogo.py catalog.json releases/round-002.json")
    dest = Path(sys.argv[1])
    catalog = json.loads(dest.read_text(encoding="utf-8"))
    release = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
    result = apply(catalog, release)
    output = dest.with_suffix(".next.json")
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    output.replace(dest)
    print("Catálogo actualizado:", len(release["updates"]), "versiones")


if __name__ == "__main__":
    main()
