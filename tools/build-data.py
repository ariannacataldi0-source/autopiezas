#!/usr/bin/env python3
"""Genera js/data.js a partir de data/retenes.json (única fuente de datos).

Uso: python3 tools/build-data.py
No requiere dependencias. Volver a ejecutarlo cada vez que se edite data/retenes.json.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "retenes.json"
OUT = ROOT / "js" / "data.js"


def slug(s):
    s = s.lower()
    for a, b in (("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"), ("ë", "e"), ("ñ", "n")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    makes = {m["key"]: m["label"] for m in data["makes"]}
    ids = set()
    for p in data["products"]:
        if p["id"] in ids:
            sys.exit(f"Producto duplicado: {p['id']}")
        ids.add(p["id"])

    models, fitments = {}, []
    for f in data["fitments"]:
        if f["productId"] not in ids:
            sys.exit(f"Compatibilidad sin producto: {f['productId']}")
        if f["make"] not in makes:
            sys.exit(f"Marca desconocida: {f['make']}")
        keys = []
        for label in f["models"]:
            k = slug(label)
            models[f["make"] + "/" + k] = {"make": f["make"], "key": k, "label": label}
            keys.append(k)
        fitments.append({**f, "models": keys})
    for p in data["products"]:
        if not any(f["productId"] == p["id"] for f in fitments):
            sys.exit(f"Producto sin compatibilidades: {p['id']}")

    out = {
        "products": data["products"],
        "fitments": fitments,
        "makes": [{"key": k, "label": v} for k, v in makes.items()],
        "models": sorted(models.values(), key=lambda m: (m["make"], m["label"])),
    }
    header = (
        "/* ARCHIVO GENERADO: no editar a mano. Fuente: data/retenes.json\n"
        "   Regenerar con: python3 tools/build-data.py\n"
        "   null = dato no disponible. Precios de referencia: validar antes de publicar. */\n"
    )
    OUT.write_text(header + "window.AW = window.AW || {};\nwindow.AW.data = "
                   + json.dumps(out, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"{len(out['products'])} productos, {len(fitments)} compatibilidades, {len(out['models'])} modelos")


if __name__ == "__main__":
    main()
