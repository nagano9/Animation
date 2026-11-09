#!/usr/bin/env python3
"""Cari gaya, kebutuhan A–Z, atau resep di katalog PLN NR Motion Gallery.

  python3 scripts/find.py --need H
  python3 scripts/find.py --q "hidrogen BESS"
  python3 scripts/find.py --recipe [ID]
  python3 scripts/find.py --style risk-heatmap
  python3 scripts/find.py --list
"""
import argparse
from _common import load_catalog, mmss

cat = load_catalog()
S = cat["by_id"]


def line(s):
    p = s["prod"]
    return f"  {s['id']:<20} {s['name']:<30} {s['tier']:<9} {s['cat']:<24} {'/'.join(s['formats']):<14} usaha {p['effort']}/3"


def show_style(sid):
    s = S.get(sid)
    if not s:
        print(f"Gaya '{sid}' tidak ada. Pakai --list untuk melihat semua id.")
        return
    p = s["prod"]
    print(f"{s['no']} {s['name']}  [{s['tier']} · {s['cat']}]\n")
    print(s["desc"])
    print(f"\nKapan dipakai : {s['when']}")
    print(f"Audiens       : {s['aud']}")
    print(f"Format        : {', '.join(s['formats'])}   Durasi: {s['dur']}   Tempo: {s['pace']}")
    print(f"Easing        : {s['ease']} {cat['easing'].get(s['ease'], '')}")
    print(f"Transisi khas : {s['transition']}")
    print(f"Tipografi     : {s['type']}")
    print(f"Palet         : {' '.join(s['palette'])}")
    print(f"Produksi      : usaha {p['effort']}/3 · {p['music']} · {p['bpm']} BPM · VO {p['vo']} · {', '.join(p['tools'])}")
    print("Beat:")
    for i, b in enumerate(s["beats"], 1):
        print(f"  {i}. {b}")
    print("Hindari:")
    for d in s["dont"]:
        print(f"  - {d}")
    print("Melayani: " + ", ".join(f"{u['letter']} {u['need']}" for u in s["use_cases"]))


def show_need(L):
    r = cat["az_by"].get(L.upper())
    if not r:
        print("Huruf tidak dikenal. Gunakan A–Z.")
        return
    print(f"{r['letter']} — {r['need']}\nAudiens: {r['audience']} · Durasi: {r['duration']} · Format: {r['formats']}\n")
    print("Gaya utama:")
    for i in r["primary"]:
        print(line(S[i]))
    print("Alternatif:")
    for i in r["alternative"]:
        print(line(S[i]))
    rs = [x for x in cat["recipes"] if x["letter"] == r["letter"]]
    if rs:
        print("Resep tersedia:")
        for x in rs:
            print(f"  {x['id']:<16} {x['name']} ({mmss(x['total_s'])}, {x['aspect']})")
    else:
        print("Belum ada resep untuk huruf ini; susun dari gaya utama + logo-sting di awal dan akhir.")


def show_recipe(rid):
    if not rid:
        for x in cat["recipes"]:
            print(f"  {x['id']:<16} {x['letter']}  {x['name']:<32} {mmss(x['total_s'])}  {x['aspect']}")
        return
    x = cat["recipe_by"].get(rid)
    if not x:
        print("Resep tidak ada.")
        return
    print(f"{x['name']} — {x['letter']} · {x['aspect']} · {mmss(x['total_s'])}\n{x['goal']}\n")
    t = 0
    for i, sg in enumerate(x["segments"], 1):
        print(f"  {mmss(t)}  {sg['duration_s']:>3} dtk  {S[sg['style']]['name']:<28} {sg['role']}" + (f" — {sg['note']}" if sg['note'] else ""))
        t += sg["duration_s"]


ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--need")
ap.add_argument("--q")
ap.add_argument("--recipe", nargs="?", const="")
ap.add_argument("--style")
ap.add_argument("--list", action="store_true")
a = ap.parse_args()

if a.style:
    show_style(a.style)
elif a.need:
    show_need(a.need)
elif a.recipe is not None:
    show_recipe(a.recipe)
elif a.q:
    terms = a.q.lower().split()
    hits = []
    for s in cat["styles"]:
        hay = " ".join([s["id"], s["name"], s["cat"], s["desc"], s["when"], s["aud"], " ".join(u["need"] for u in s["use_cases"]), " ".join(s["prod"]["tools"])]).lower()
        score = sum(hay.count(t) for t in terms)
        if score:
            hits.append((score, s))
    hits.sort(key=lambda x: -x[0])
    print(f"{len(hits)} gaya cocok untuk '{a.q}':")
    for _, s in hits[:12]:
        print(line(s))
else:
    for c in cat["families"]:
        print(c)
        for s in cat["styles"]:
            if s["cat"] == c:
                print(line(s))
