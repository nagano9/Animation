#!/usr/bin/env python3
"""Kerangka dan penjadwalan proyek explainer PLN NR.

  python3 scripts/plan.py new --recipe cod-90 --title "..." --out work/project.json
  python3 scripts/plan.py new --need S --aspect 9:16 --title "..." --out work/project.json
  python3 scripts/plan.py new --styles logo-sting,hydro-flow,logo-sting --title "..." --out work/project.json
  python3 scripts/plan.py retime work/project.json   # durasi mengikuti panjang VO
  python3 scripts/plan.py show work/project.json
"""
import argparse
import math
import os
from _common import (load_catalog, load_project, save_project, words, osd_text, mmss, timeline,
                     default_scene_s, die, ceil, VO_WPS, OSD_WPS_MAX, PAD_S)

cat = load_catalog()
S = cat["by_id"]


SCENE_TX = {v["$extensions"]["id.ptplnnr"]["name"] for k, v in cat["tokens"]["transition"].items()
            if not k.startswith("$") and v["$extensions"]["id.ptplnnr"].get("kind") == "scene"}


def scene_tx(s):
    """Transisi khas gaya hanya dipakai bila itu perpindahan adegan dan sesuai mode gaya; selain itu cross-fade."""
    t = cat["tx_by"].get(s["transition"])
    modes = cat["tokens"]["transition"]
    ok = s["transition"] in SCENE_TX and any(v.get("$extensions", {}).get("id.ptplnnr", {}).get("name") == s["transition"]
                                              and s.get("mode") in v["$extensions"]["id.ptplnnr"]["modes"] for v in modes.values() if isinstance(v, dict))
    return s["transition"] if t and ok else "Cross-fade 220 ms"


def soften_luma(scenes):
    """Lompatan kecerahan latar besar (mis. navy → putih) dengan cut/cross-fade diganti Dip Navy."""
    for a, b in zip(scenes, scenes[1:]):
        la, lb = S[a["style"]].get("bg_luma", .1), S[b["style"]].get("bg_luma", .1)
        if abs(la - lb) > .45 and b["transition_in"] in ("Cut", "Cross-fade 220 ms"):
            b["transition_in"] = "Dip Navy"


def scene(i, sid, dur, role="", note="", tx=None):
    s = S[sid]
    return {
        "id": f"s{i:02d}", "style": sid, "role": role or s["name"], "duration_s": dur,
        "transition_in": tx or ("Cut" if i == 1 else scene_tx(s)),
        "vo": "", "onscreen": [], "data": [], "lower_third": None,
        "visual": " → ".join(s["beats"]), "notes": note,
    }


def cmd_new(a):
    if a.recipe:
        r = cat["recipe_by"].get(a.recipe) or die(f"resep '{a.recipe}' tidak ada (lihat find.py --recipe)")
        segs = [(sg["style"], sg["duration_s"], sg["role"], sg["note"]) for sg in r["segments"]]
        need, aspect, target = r["letter"], a.aspect or r["aspect"], r["total_s"]
    elif a.need:
        L = a.need.upper()
        rs = [x for x in cat["recipes"] if x["letter"] == L]
        if rs:
            a.recipe = rs[0]["id"]
            return cmd_new(a)
        az = cat["az_by"].get(L) or die("huruf kebutuhan tidak dikenal")
        ids = ["logo-sting"] + az["primary"] + ["logo-sting"]
        segs = [(i, default_scene_s(S[i]), "", "") for i in ids]
        need, aspect, target = L, a.aspect or az["formats"].split(" · ")[0], None
    elif a.styles:
        ids = [x.strip() for x in a.styles.split(",") if x.strip()]
        for i in ids:
            if i not in S:
                die(f"gaya '{i}' tidak ada")
        segs = [(i, default_scene_s(S[i]), "", "") for i in ids]
        need, aspect, target = a.need_letter, a.aspect or "16:9", None
    else:
        die("pilih salah satu: --recipe, --need, atau --styles")
    scenes = [scene(n, sid, dur, role, note) for n, (sid, dur, role, note) in enumerate(segs, 1)]
    soften_luma(scenes)
    proj = {
        "schema": "plnnr.explainer-project/1", "title": a.title or "Tanpa judul",
        "need": need, "recipe": a.recipe, "aspect": aspect,
        "target_s": a.target or target, "audience": "", "objective": "", "ask": "",
        "assumptions": [], "sources": [], "scenes": scenes,
    }
    save_project(proj, a.out)
    print(f"Kerangka {len(scenes)} adegan disimpan ke {a.out}")
    show(proj)


def audio_len(path):
    import subprocess
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    return float(r.stdout.strip()) if r.returncode == 0 and r.stdout.strip() else None


def cmd_retime(a):
    proj = load_project(a.path)
    base = os.path.dirname(os.path.abspath(a.path))
    for sc in proj["scenes"]:
        cur = float(sc.get("duration_s") or 0)
        if a.audio and sc.get("audio"):
            ap = sc["audio"] if os.path.isabs(sc["audio"]) else os.path.join(base, sc["audio"])
            ln = audio_len(ap)
            if ln is None:
                print(f"  {sc['id']}: audio tidak terbaca ({ap})")
            else:
                # durasi mengikuti audio nyata: offset 0,15 dtk + VO + napas 0,6 dtk, dibulatkan ke 0,5 dtk
                new = math.ceil((ln + .75) * 2) / 2
                print(f"  {sc['id']}: {cur:g} → {new:g} dtk (audio {ln:.2f} dtk)")
                sc["duration_s"] = new
                continue
        need_vo = words(sc.get("vo")) / VO_WPS + PAD_S if sc.get("vo") else 0
        need_osd = words(osd_text(sc)) / OSD_WPS_MAX if sc.get("onscreen") else 0
        need = max(need_vo, need_osd)
        if need > cur:
            sc["duration_s"] = ceil(need)
            print(f"  {sc['id']}: {cur:g} → {sc['duration_s']} dtk (VO {words(sc.get('vo'))} kata)")
    save_project(proj, a.path)
    show(proj)


def show(proj):
    starts, total = timeline(proj["scenes"])
    print(f"\n{proj['title']} · {proj.get('aspect')} · total {mmss(total)}" + (f" (target {mmss(proj['target_s'])})" if proj.get("target_s") else ""))
    for st, sc in zip(starts, proj["scenes"]):
        vo = words(sc.get("vo"))
        print(f"  {mmss(st)}  {sc['id']}  {float(sc['duration_s']):>5g} dtk  {S[sc['style']]['name']:<28} {sc['role']:<26} VO {vo:>3} kata")


ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = ap.add_subparsers(dest="cmd", required=True)
n = sub.add_parser("new")
n.add_argument("--recipe")
n.add_argument("--need")
n.add_argument("--styles")
n.add_argument("--need-letter", dest="need_letter", default=None)
n.add_argument("--title")
n.add_argument("--aspect")
n.add_argument("--target", type=int)
n.add_argument("--out", required=True)
r = sub.add_parser("retime")
r.add_argument("path")
r.add_argument("--audio", action="store_true", help="pakai durasi file audio VO (field audio) via ffprobe")
s = sub.add_parser("show")
s.add_argument("path")
a = ap.parse_args()
{"new": cmd_new, "retime": cmd_retime, "show": lambda a: show(load_project(a.path))}[a.cmd](a)
