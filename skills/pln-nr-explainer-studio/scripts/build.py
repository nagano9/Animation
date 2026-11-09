#!/usr/bin/env python3
"""Bangun paket produksi dari proyek explainer PLN NR.

  python3 scripts/build.py work/project.json --out work/out

Menghasilkan animatic.html, storyboard.md, captions.srt, production.json.
"""
import argparse
import base64
import html
import json
import os
import re
from _common import (ASSETS, load_catalog, load_project, words, osd_text, mmss, srt_tc, timeline, VO_WPS)

cat = load_catalog()
S = cat["by_id"]
GUARD = ["Merah #E20613 hanya di petir logo", "Teks gelap navy #00507C, tidak hitam",
         "Satu sinyal per bingkai: cyan di atas putih, kuning di atas navy", "Lockup dari aset resmi, tidak digambar ulang",
         "Tanpa bounce, elastic, getar, atau glitch; default cross-fade 220 ms", "Energy Sweep maksimal dua kali per video",
         "Setiap angka membawa baris Sumber", "Teks layar maksimal 3 kata per detik"]
QA_MANUAL = ["Lisensi musik untuk kanal yang dipakai", "Loudness −14 LUFS (sosial) / −23 LUFS (siaran)",
             "Ejaan nama, jabatan, dan lokasi", "Kesesuaian footage dengan lokasi dan tanggal",
             "Angka ilustratif sudah diganti data resmi", "Kontras teks minimal 4,5:1 pada footage final",
             "Persetujuan pemilik konten sebelum tayang"]


def read(p, mode="r"):
    with open(os.path.join(ASSETS, p), mode, **({} if "b" in mode else {"encoding": "utf-8"})) as f:
        return f.read()


def esc(t):
    return html.escape(str(t or ""), quote=True)


def wrap42(text):
    out, line = [], ""
    for w in text.split():
        if len(line) + len(w) + 1 > 42 and line:
            out.append(line)
            line = w
        else:
            line = (line + " " + w).strip()
    if line:
        out.append(line)
    return out


def cues(proj):
    starts, _ = timeline(proj["scenes"])
    res = []
    for sc, st in zip(proj["scenes"], starts):
        vo = (sc.get("vo") or "").strip()
        if not vo:
            continue
        dur = float(sc["duration_s"])
        span = min(dur - 0.3, max(1.0, words(vo) / VO_WPS))
        parts = [p.strip() for p in re.split(r"(?<=[.,;:?])\s+", vo) if p.strip()]
        chunks, cur = [], ""
        for p in parts:
            cand = (cur + " " + p).strip()
            if len(cand) <= 84:
                cur = cand
            else:
                if cur:
                    chunks.append(cur)
                while len(p) > 84:
                    ws = p.split()
                    acc = ""
                    while ws and len(acc) + len(ws[0]) + 1 <= 84:
                        acc = (acc + " " + ws.pop(0)).strip()
                    chunks.append(acc)
                    p = " ".join(ws)
                cur = p
        if cur:
            chunks.append(cur)
        fixed = []
        while chunks:
            c = chunks.pop(0)
            if len(wrap42(c)) <= 2:
                fixed.append(c)
            else:
                ws = c.split()
                chunks[:0] = [" ".join(ws[:len(ws) // 2]), " ".join(ws[len(ws) // 2:])]
        chunks = fixed
        total_w = sum(words(c) for c in chunks) or 1
        t = st + 0.15
        for c in chunks:
            d = span * words(c) / total_w
            res.append({"start": round(t, 2), "end": round(t + d, 2), "lines": wrap42(c)})
            t += d
    return res


def svg_for(sc, i, aspect):
    s = read(f"previews/{sc['style']}.svg").replace("P0_", f"s{i}_")
    if aspect == "9:16":
        s = s.replace("xMidYMid slice", "xMidYMid meet")
    lt = sc.get("lower_third") or {}
    if sc["style"] == "lower-third" and lt.get("name"):
        s = s.replace("Nama Narasumber", esc(lt["name"])).replace("Jabatan, PT PLN Nusantara Renewables", esc(lt.get("title", "")))
    return s


def build_html(proj, cue_list):
    starts, total = timeline(proj["scenes"])
    scenes = []
    for i, (sc, st) in enumerate(zip(proj["scenes"], starts)):
        s = S[sc["style"]]
        scenes.append({
            "id": sc["id"], "style": s["name"], "styleId": s["id"], "cat": s["cat"], "role": sc.get("role", ""),
            "start": st, "dur": float(sc["duration_s"]), "tx": sc.get("transition_in") or "Cut",
            "vo": sc.get("vo", ""), "osd": sc.get("onscreen") or [], "data": sc.get("data") or [],
            "visual": sc.get("visual", ""), "notes": sc.get("notes", ""), "svg": svg_for(sc, i, proj.get("aspect")),
            "logo": s["id"] == "logo-sting",
        })
    data = {"title": proj["title"], "aspect": proj.get("aspect", "16:9"), "total": total, "scenes": scenes, "cues": cue_list,
            "sources": proj.get("sources", [])}
    logo = "data:image/png;base64," + base64.b64encode(read("logo-pln-nr-white.png", "rb")).decode()
    anim = read("anim.css")
    tpl = read("animatic.template.html")
    return (tpl.replace("{{TITLE}}", esc(proj["title"]))
               .replace("{{ANIM_CSS}}", anim)
               .replace("{{LOGO}}", logo)
               .replace("{{DATA}}", json.dumps(data, ensure_ascii=False).replace("</", "<\\/")))


def build_md(proj):
    starts, total = timeline(proj["scenes"])
    L = [f"# Storyboard — {proj['title']}", "",
         f"**Kebutuhan:** {proj.get('need') or '-'} · **Resep:** {proj.get('recipe') or '-'} · **Rasio:** {proj.get('aspect')} · **Durasi:** {mmss(total)}", "",
         f"**Audiens:** {proj.get('audience') or '-'}  ", f"**Tujuan:** {proj.get('objective') or '-'}  ", f"**Permintaan:** {proj.get('ask') or '-'}", ""]
    if proj.get("assumptions"):
        L += ["**Asumsi:**", *[f"- {a}" for a in proj["assumptions"]], ""]
    L += ["| TC | # | Gaya | Peran | Durasi | Transisi masuk |", "|---|---|---|---|---|---|"]
    for st, sc in zip(starts, proj["scenes"]):
        L.append(f"| {mmss(st)} | {sc['id']} | {S[sc['style']]['name']} | {sc.get('role', '')} | {float(sc['duration_s']):g} dtk | {sc.get('transition_in', '')} |")
    L.append("")
    for st, sc in zip(starts, proj["scenes"]):
        s = S[sc["style"]]
        L += [f"## {sc['id']} · {mmss(st)} · {s['name']} — {sc.get('role', '')}", ""]
        if sc.get("vo"):
            L += [f"**VO ({words(sc['vo'])} kata):** {sc['vo']}", ""]
        if sc.get("onscreen"):
            L += ["**Teks layar:** " + " / ".join(sc["onscreen"]), ""]
        if sc.get("lower_third"):
            L += [f"**Lower third:** {sc['lower_third'].get('name', '')} — {sc['lower_third'].get('title', '')}", ""]
        if sc.get("data"):
            L += ["**Data:**", *[f"- {d.get('label')}: {d.get('value')} {d.get('unit', '')} (sumber: {d.get('source')})" for d in sc["data"]], ""]
        L += [f"**Arahan visual:** {sc.get('visual') or ' → '.join(s['beats'])}", "",
              f"**Spesifikasi:** {s['pace']} · easing {s['ease']} · palet {' '.join(s['palette'])} · {s['type']}", ""]
        if sc.get("notes"):
            L += [f"**Catatan:** {sc['notes']}", ""]
    if proj.get("sources"):
        L += ["## Sumber", *[f"- **{x['id']}** {x.get('text', '')}" for x in proj["sources"]], ""]
    return "\n".join(L)


def build_srt(cue_list):
    out = []
    for n, c in enumerate(cue_list, 1):
        out += [str(n), f"{srt_tc(c['start'])} --> {srt_tc(c['end'])}", *c["lines"], ""]
    return "\n".join(out)


def build_prod(proj):
    starts, total = timeline(proj["scenes"])
    sc_out = []
    for st, sc in zip(starts, proj["scenes"]):
        s = S[sc["style"]]
        tx = cat["tx_by"].get(sc.get("transition_in"))
        sc_out.append({**{k: sc.get(k) for k in ("id", "role", "vo", "onscreen", "data", "lower_third", "notes")},
                       "start": mmss(st), "duration_s": float(sc["duration_s"]),
                       "transition_in": {"name": sc.get("transition_in"), "duration_ms": tx["ms"] if tx else 0, "css_easing": tx["ease"] if tx else None},
                       "style": {"id": s["id"], "name": s["name"], "family": s["cat"], "tier": s["tier"], "beats": s["beats"],
                                 "palette": s["palette"], "typography": s["type"], "pace": s["pace"],
                                 "easing": {"name": s["ease"], "css": cat["easing"].get(s["ease"])}, "production": s["prod"], "dont": s["dont"]}})
    return {"schema": "plnnr.production-package/1", "brand": "PT PLN Nusantara Renewables", "title": proj["title"],
            "need": proj.get("need"), "recipe": proj.get("recipe"), "aspect": proj.get("aspect"), "total": mmss(total),
            "audience": proj.get("audience"), "objective": proj.get("objective"), "ask": proj.get("ask"),
            "typography": "PT Sans (pengganti Myriad Pro), angka tabular", "guardrails": GUARD,
            "deliverables": ["MP4 H.264 25 fps (" + ("1080×1920" if proj.get("aspect") == "9:16" else "1920×1080") + ")", "captions.srt", "Thumbnail PNG"],
            "sources": proj.get("sources", []), "scenes": sc_out, "qa_manual": QA_MANUAL,
            "qa_full": cat["qa"]}


ap = argparse.ArgumentParser()
ap.add_argument("path")
ap.add_argument("--out", required=True)
a = ap.parse_args()
proj = load_project(a.path)
os.makedirs(a.out, exist_ok=True)
cl = cues(proj)
files = {"animatic.html": build_html(proj, cl), "storyboard.md": build_md(proj), "captions.srt": build_srt(cl),
         "production.json": json.dumps(build_prod(proj), ensure_ascii=False, indent=2) + "\n"}
for name, content in files.items():
    with open(os.path.join(a.out, name), "w", encoding="utf-8") as f:
        f.write(content)
print("Paket produksi:", ", ".join(os.path.join(a.out, n) for n in files))
