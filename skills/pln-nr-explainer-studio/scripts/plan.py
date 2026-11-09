#!/usr/bin/env python3
"""Kerangka dan penjadwalan proyek explainer PLN NR.

  python3 scripts/plan.py new --recipe cod-90 --title "..." --out work/project.json
  python3 scripts/plan.py new --need S --aspect 9:16 --title "..." --out work/project.json
  python3 scripts/plan.py new --styles logo-sting,hydro-flow,logo-sting --title "..." --out work/project.json
  python3 scripts/plan.py retime work/project.json   # durasi mengikuti panjang VO
  python3 scripts/plan.py show work/project.json
"""
import argparse
from _common import (load_catalog, load_project, save_project, words, osd_text, mmss, timeline,
                     default_scene_s, die, ceil, VO_WPS, OSD_WPS_MAX, PAD_S)

cat = load_catalog()
S = cat["by_id"]


def scene(i, sid, dur, role="", note="", tx=None):
    s = S[sid]
    return {
        "id": f"s{i:02d}", "style": sid, "role": role or s["name"], "duration_s": dur,
        "transition_in": tx or ("Cut" if i == 1 else s["transition"]),
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
    proj = {
        "schema": "plnnr.explainer-project/1", "title": a.title or "Tanpa judul",
        "need": need, "recipe": a.recipe, "aspect": aspect,
        "target_s": a.target or target, "audience": "", "objective": "", "ask": "",
        "assumptions": [], "sources": [], "scenes": scenes,
    }
    save_project(proj, a.out)
    print(f"Kerangka {len(scenes)} adegan disimpan ke {a.out}")
    show(proj)


def cmd_retime(a):
    proj = load_project(a.path)
    for sc in proj["scenes"]:
        cur = float(sc.get("duration_s") or 0)
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
s = sub.add_parser("show")
s.add_argument("path")
a = ap.parse_args()
{"new": cmd_new, "retime": cmd_retime, "show": lambda a: show(load_project(a.path))}[a.cmd](a)
