#!/usr/bin/env python3
"""QA otomatis proyek explainer PLN NR terhadap katalog dan pedoman merek.

  python3 scripts/validate.py work/project.json [--json]

Keluar dengan kode 1 bila ada ERROR.
"""
import argparse
import json
import re
import sys
from _common import (load_catalog, load_project, words, osd_text, timeline, dur_range, mmss,
                     VO_WPS_MAX, OSD_WPS_MAX, BRAND_HEX, RED)

EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F2FF️]")
DOT_DECIMAL = re.compile(r"\b\d+\.\d{1,2}\s?(GW|MW|MWac|MWp|kW|kWh|MWh|GWh|%|x|ton)\b")
COMMA_THOUSANDS = re.compile(r"\b\d{1,3},\d{3}\b")
NUMBER = re.compile(r"\d")
FIRST_PERSON = re.compile(r"\b(kami|kita|saya|aku)\b", re.I)
HEX = re.compile(r"#[0-9A-Fa-f]{6}\b")
BROADCAST = {"logo-sting", "lower-third", "caption-pack", "countdown"}

cat = load_catalog()
S = cat["by_id"]
TX_MODES = {v["$extensions"]["id.ptplnnr"]["name"]: v["$extensions"]["id.ptplnnr"]["modes"]
            for k, v in cat["tokens"]["transition"].items() if not k.startswith("$")}
TX_KIND = {v["$extensions"]["id.ptplnnr"]["name"]: v["$extensions"]["id.ptplnnr"].get("kind", "scene")
           for k, v in cat["tokens"]["transition"].items() if not k.startswith("$")}
SLOT_CAP = {"arc-kpi": ("values", 3), "answer-first": ("values", 6), "waterfall": ("values", 7), "kinetic-type": ("lines", 3),
            "navy-statement": ("lines", 3), "energy-sweep": ("lines", 2), "hex-rail": ("steps", 5), "sop-checklist": ("steps", 5)}


def run(proj):
    out = []
    add = lambda lvl, where, msg: out.append({"level": lvl, "where": where, "msg": msg})
    if proj.get("schema") != "plnnr.explainer-project/1":
        add("ERROR", "proyek", "schema harus 'plnnr.explainer-project/1'")
    scenes = proj.get("scenes") or []
    if not scenes:
        add("ERROR", "proyek", "belum ada adegan")
        return out
    aspect = proj.get("aspect", "16:9")
    src_ids = {s.get("id") for s in proj.get("sources", [])}
    starts, total = timeline(scenes)

    for sc, st in zip(scenes, starts):
        w = f"{sc.get('id', '?')} @ {mmss(st)}"
        sid = sc.get("style")
        if sid not in S:
            add("ERROR", w, f"gaya '{sid}' tidak ada di katalog")
            continue
        s = S[sid]
        d = float(sc.get("duration_s") or 0)
        if d <= 0:
            add("ERROR", w, "duration_s harus > 0")
            continue
        if aspect == "16:9" and "16:9" not in s["formats"]:
            add("PERINGATAN", w, f"{s['name']} dirancang untuk {', '.join(s['formats'])}; komposisi 16:9 perlu disusun ulang")
        elif aspect in ("9:16", "1:1") and aspect not in s["formats"]:
            add("INFO", w, f"{s['name']} dirancang 16:9; render memakai tata letak bertumpuk (art di atas, teks di bawah)")
        if sc.get("transition_in") not in (None, "Cut") and sc["transition_in"] not in cat["tx_by"]:
            add("ERROR", w, f"transisi '{sc['transition_in']}' bukan transisi resmi")
        elif TX_KIND.get(sc.get("transition_in")) == "content":
            add("PERINGATAN", w, f"'{sc['transition_in']}' adalah animasi isi, bukan transisi adegan; runtime memakai cross-fade. Ganti transition_in")
        vo, osd = sc.get("vo") or "", osd_text(sc)
        if vo and words(vo) / d > VO_WPS_MAX:
            add("ERROR", w, f"VO terlalu cepat: {words(vo)} kata dalam {d:g} dtk ({words(vo) / d * 60:.0f} kpm, maks 155). Jalankan plan.py retime atau pangkas naskah")
        if osd and words(osd) / d > OSD_WPS_MAX:
            add("ERROR", w, f"teks layar {words(osd)} kata dalam {d:g} dtk melebihi 3 kata/dtk")
        lines = sc.get("onscreen") or []
        # legibilitas: panjang baris maksimal agar ukuran minimal (66 px di 16:9, 72 px di 9:16) muat di title-safe
        maxc = cat["legibility"]["1080x1920" if aspect == "9:16" else "1920x1080"]["max_chars_per_line"]["$value"]
        for ln in (lines if isinstance(lines, list) else [lines]):
            if len(ln) > maxc:
                add("ERROR", w, f"baris teks layar '{ln[:24]}…' {len(ln)} karakter; maksimal {maxc} agar terbaca di ukuran minimal ({aspect})")
        # mode gerak: transisi harus diizinkan untuk mode gaya (token motion.transition.*.modes)
        mode = s.get("mode")
        txname = sc.get("transition_in")
        tmodes = TX_MODES.get(txname)
        if txname not in (None, "Cut") and tmodes and mode not in tmodes:
            add("PERINGATAN", w, f"transisi '{txname}' adalah gerak expressive; {s['name']} bermode {mode}. Pakai Cross-fade 220 ms atau Wave Wipe")
        # kapasitas slot data
        cap_ = SLOT_CAP.get(sid)
        if cap_:
            k, n = cap_
            items = sc.get("data") if k == "values" else (sc.get("steps") or sc.get("onscreen"))
            if items and len(items) > n:
                add("ERROR", w, f"{s['name']} menampung maksimal {n} {'angka' if k == 'values' else 'langkah/baris'}; ada {len(items)}")
        if sid in ("arc-kpi", "answer-first", "waterfall", "isotype") and not sc.get("data"):
            add("PERINGATAN", w, f"{s['name']} membaca angka dari 'data'; tanpa data, visual memakai angka contoh galeri")
        if isinstance(lines, list) and len(lines) > 2 and sid not in ("sop-checklist", "wave-edge"):
            add("PERINGATAN", w, f"teks layar {len(lines)} baris; maksimal 2 baris per bingkai")
        for txt, label in ((vo, "VO"), (osd, "teks layar")):
            if EMOJI.search(txt):
                add("ERROR", w, f"emoji di {label}")
            if "!" in txt:
                add("ERROR", w, f"tanda seru di {label}; register PLN NR faktual")
            m = DOT_DECIMAL.search(txt)
            if m:
                add("PERINGATAN", w, f"'{m.group(0)}' memakai titik desimal; gunakan koma (contoh 1,2 GW)")
            m = COMMA_THOUSANDS.search(txt)
            if m:
                add("PERINGATAN", w, f"'{m.group(0)}' memakai koma ribuan; gunakan titik (100.000)")
        if FIRST_PERSON.search(osd):
            add("PERINGATAN", w, "kata ganti orang pertama di teks layar; gunakan sudut pandang institusi")
        for it in sc.get("data") or []:
            if not it.get("source"):
                add("ERROR", w, f"angka '{it.get('label')}: {it.get('value')}' tanpa sumber")
            elif it["source"] not in src_ids and it["source"] != "ilustratif":
                add("ERROR", w, f"sumber '{it['source']}' tidak ada di daftar sources")
            elif it["source"] == "ilustratif":
                add("PERINGATAN", w, f"angka '{it.get('label')}' masih ilustratif; ganti sebelum tayang")
        if NUMBER.search(osd) and not sc.get("data"):
            add("PERINGATAN", w, "ada angka di teks layar tetapi tidak tercatat di data + sumber")
        if not vo and sid not in BROADCAST and sid not in ("particle-field", "batik-generative", "night-glow"):
            add("PERINGATAN", w, "VO kosong")
        if sid == "lower-third" and not sc.get("footage"):
            add("PERINGATAN", w, "wawancara tanpa footage: visual hanya placeholder dan akan gagal QA gerak; isi 'footage' (foto atau video)")
        if sc.get("footage"):
            import os as _os
            fp = sc["footage"] if _os.path.isabs(sc["footage"]) else _os.path.join(BASE_DIR, sc["footage"])
            if not _os.path.exists(fp):
                add("ERROR", w, f"footage tidak ditemukan: {sc['footage']}")
        if sid == "lower-third" and not (sc.get("lower_third") or {}).get("name"):
            add("PERINGATAN", w, "lower third tanpa nama narasumber")
        for h in HEX.findall(json.dumps(sc.get("colors", []))):
            if h.upper() == RED:
                add("ERROR", w, "merah #E20613 hanya untuk petir logo")
            elif h.upper() not in BRAND_HEX:
                add("PERINGATAN", w, f"warna {h} di luar palet PLN NR")
        lo, hi = dur_range(s["dur"])
        if hi and d > hi * 1.5 and sid not in BROADCAST:
            add("PERINGATAN", w, f"{d:g} dtk jauh di atas rentang gaya ({s['dur']}); pertimbangkan memecah adegan")

    for x, y in zip(scenes, scenes[1:]):
        if x.get("style") in S and y.get("style") in S:
            la = .07 if x.get("tone") == "dark" else S[x["style"]].get("bg_luma", .1)
            lb = .07 if y.get("tone") == "dark" else S[y["style"]].get("bg_luma", .1)
            if abs(la - lb) > .45 and y.get("transition_in") in ("Cut", "Cross-fade 220 ms", None):
                add("PERINGATAN", y.get("id", "?"), f"lompatan kecerahan latar {la:.2f} → {lb:.2f} dengan {y.get('transition_in') or 'Cut'}; jalankan plan.py tone (varian gelap) atau pakai Dip Navy")
    ids = [sc.get("style") for sc in scenes]
    if ids.count("energy-sweep") > 2:
        add("ERROR", "proyek", "Energy Sweep dipakai lebih dari dua kali")
    content = [i for i in ids if i not in BROADCAST]
    fams = {S[i]["cat"] for i in content if i in S}
    if len(set(content)) > 4:
        add("PERINGATAN", "proyek", f"{len(set(content))} gaya isi berbeda; disarankan maksimal 3 agar terasa satu cerita")
    social = aspect == "9:16" or proj.get("need") in ("S", "Y")
    if proj.get("need") != "X" and total > 20:
        if ids[0] != "logo-sting" and not social:
            add("PERINGATAN", "proyek", "video resmi sebaiknya dibuka dengan logo-sting")
        if ids[-1] not in ("logo-sting", "energy-sweep", "navy-statement"):
            add("PERINGATAN", "proyek", "penutup sebaiknya logo-sting, energy-sweep, atau navy-statement dengan lockup")
    if aspect in ("9:16", "1:1") and not any((sc.get("vo") or "").strip() for sc in scenes):
        add("PERINGATAN", "proyek", "video sosial tanpa VO: tidak ada caption yang bisa dibakar; pastikan pesan terbaca dari teks layar saja")
    tgt = proj.get("target_s")
    if tgt and abs(total - tgt) > max(5, tgt * .15):
        add("PERINGATAN", "proyek", f"durasi total {mmss(total)} menyimpang dari target {mmss(tgt)}")
    if proj.get("ask") == "" and proj.get("need") in ("A", "B", "F", "I", "R"):
        add("PERINGATAN", "proyek", "audiens pengambil keputusan: isi 'ask' (apa yang diminta dan kapan)")
    if not proj.get("audience"):
        add("PERINGATAN", "proyek", "audiens belum diisi")
    return out


ap = argparse.ArgumentParser()
ap.add_argument("path")
ap.add_argument("--json", action="store_true")
a = ap.parse_args()
BASE_DIR = __import__("os").path.dirname(__import__("os").path.abspath(a.path))
res = run(load_project(a.path))
errs = [r for r in res if r["level"] == "ERROR"]
warns = [r for r in res if r["level"] == "PERINGATAN"]
if a.json:
    print(json.dumps({"errors": len(errs), "warnings": len(warns), "items": res}, ensure_ascii=False, indent=2))
else:
    for r in res:
        print(f"{r['level']:<10} {r['where']:<16} {r['msg']}")
    print(f"\n{len(errs)} error, {len(warns)} peringatan, {len(res) - len(errs) - len(warns)} info. " + ("LULUS" if not errs else "BELUM LULUS"))
sys.exit(1 if errs else 0)
