"""Utilitas bersama Explainer Studio PLN NR (Python 3 standar)."""
import json
import math
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, "assets")

VO_WPS = 140 / 60          # kecepatan VO acuan: 140 kata per menit
VO_WPS_MAX = 155 / 60      # batas atas sebelum dianggap terlalu cepat
OSD_WPS_MAX = 3.0          # teks layar maksimal 3 kata per detik
PAD_S = 0.8                # napas di akhir adegan

BRAND_HEX = {"#00507C", "#005F89", "#0087BE", "#0098D3", "#009EE2", "#00ADEF", "#00A2BA", "#0095B3",
             "#94DA63", "#B9DE41", "#FFEC00", "#FFF100", "#FFFFFF", "#F1F6FA", "#DFDFDF", "#BFD3DE",
             "#7FA7BD", "#407C9D", "#3A6E8C", "#004367", "#00618F", "#00243A", "#003A5C"}
RED = "#E20613"


def load_catalog():
    with open(os.path.join(ASSETS, "catalog.json"), encoding="utf-8") as f:
        cat = json.load(f)
    cat["by_id"] = {s["id"]: s for s in cat["styles"]}
    cat["az_by"] = {r["letter"]: r for r in cat["a_to_z"]}
    cat["recipe_by"] = {r["id"]: r for r in cat["recipes"]}
    cat["tx_by"] = {t["key"]: t for t in cat["transitions"]}
    return cat


def load_project(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_project(proj, path):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(proj, f, ensure_ascii=False, indent=2)
        f.write("\n")


def words(text):
    return len(re.findall(r"[\wÀ-ɏ'’-]+", text or ""))


def osd_text(scene):
    o = scene.get("onscreen") or []
    return " ".join(o) if isinstance(o, list) else str(o)


def mmss(t):
    t = max(0, int(round(t)))
    return f"{t // 60:02d}:{t % 60:02d}"


def srt_tc(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def dur_range(text):
    """'20–40 dtk' -> (20, 40); '3–4 dtk' -> (3, 4); 'Mengikuti video' -> (None, None)."""
    nums = [int(n) for n in re.findall(r"\d+", text or "")]
    if not nums:
        return None, None
    return (nums[0], nums[1]) if len(nums) > 1 else (nums[0], nums[0])


def default_scene_s(style):
    lo, hi = dur_range(style.get("dur"))
    if lo is None:
        return 6
    return max(3, round((lo + hi) / 2 if hi <= 30 else lo))


def timeline(scenes):
    t, out = 0.0, []
    for sc in scenes:
        out.append(t)
        t += float(sc.get("duration_s") or 0)
    return out, t


def die(msg):
    print("ERROR: " + msg, file=sys.stderr)
    sys.exit(2)


def ceil(x):
    return int(math.ceil(x))
