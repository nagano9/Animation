#!/usr/bin/env python3
"""QA gerak pada video hasil render: apakah video benar-benar bergerak dan nyaman ditonton.

  python3 scripts/motion_report.py work/out/video.mp4 [--project work/project.json] [--json]

Mengukur dari piksel (ffmpeg, tanpa dependensi lain):
- detik nyaris diam (beda rata-rata antara frame t dan t+1 dtk < ambang; menangkap gerak kamera lambat)
  dan jeda diam terpanjang
  → token beat-max: tidak boleh ada jeda diam > 6 dtk
- kilatan: kecerahan berubah > 90 (dari 255) di seluruh layar serentak dalam 0,3 dtk;
  wipe bergerak tidak dihitung
Keluar dengan kode 1 bila ada jeda diam > 6 dtk atau kilatan.
"""
import argparse
import json
import subprocess
import sys

W, H = 64, 36
STILL = 1.0       # beda rata-rata antara frame t dan t+1 dtk (0–255) di bawah ini dianggap diam
BEAT_MAX = 6.0
FLASH = 90


def frames(path):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
                       capture_output=True, check=True)
    n = W * H
    data = p.stdout
    return [data[i:i + n] for i in range(0, len(data) - n + 1, n)]


def fps_of(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout.strip()
    a, b = r.split("/") if "/" in r else (r, 1)
    return float(a) / float(b)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--project")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    fps = fps_of(a.video)
    fr = frames(a.video)
    step = max(1, int(round(fps)))
    luma = [sum(f) / len(f) for f in fr]
    secs = len(fr) // step - 1
    per_sec = [sum(abs(x - y) for x, y in zip(fr[i * step + step], fr[i * step])) / len(fr[0]) for i in range(secs)]
    still = [v < STILL for v in per_sec]
    gaps, run, start = [], 0, 0
    for i, s in enumerate(still + [False]):
        if s:
            if run == 0:
                start = i
            run += 1
        elif run:
            gaps.append((start, run))
            run = 0
    longest = max(gaps, key=lambda g: g[1], default=(0, 0))
    # kilatan: perubahan kecerahan besar di SELURUH layar serentak dalam 0,3 dtk (≥ 6 dari 8 lajur vertikal).
    # Wipe yang bergerak (Energy Sweep, Wave Wipe) mengubah lajur bergantian, jadi tidak dihitung kilatan.
    strips = 8
    def strip_luma(f):
        out = []
        for k in range(strips):
            x0, x1 = k * W // strips, (k + 1) * W // strips
            vals = [f[y * W + x] for y in range(H) for x in range(x0, x1)]
            out.append(sum(vals) / len(vals))
        return out
    sl = [strip_luma(f) for f in fr]
    win = max(1, int(.3 * fps))
    flashes, last = [], -10
    for k in range(len(fr) - win):
        hit = sum(abs(a2 - a1) > FLASH for a1, a2 in zip(sl[k], sl[k + win]))
        if hit >= 6 and k / fps - last > 1:
            last = k / fps
            flashes.append((round(k / fps, 1), round(luma[k]), round(luma[k + win])))
    scenes = []
    if a.project:
        proj = json.load(open(a.project, encoding="utf-8"))
        t = 0
        for sc in proj["scenes"]:
            d = float(sc["duration_s"])
            seg = per_sec[int(t):int(t + d)]
            scenes.append({"id": sc["id"], "style": sc["style"], "still_ratio": round(sum(v < STILL for v in seg) / max(1, len(seg)), 2)})
            t += d
    res = {"duration_s": secs, "still_seconds": sum(still), "still_ratio": round(sum(still) / max(1, secs), 2),
           "longest_still": {"start_s": longest[0], "length_s": longest[1]}, "flashes": flashes, "scenes": scenes,
           "pass": longest[1] <= BEAT_MAX and not flashes}
    if a.json:
        print(json.dumps(res, ensure_ascii=False, indent=2))
    else:
        print(f"Durasi {secs} dtk · diam {res['still_seconds']} dtk ({res['still_ratio'] * 100:.0f}%) · jeda diam terpanjang {longest[1]} dtk mulai detik {longest[0]}")
        for f in flashes:
            print(f"  KILATAN di detik {f[0]}: luminans {f[1]} → {f[2]}")
        for s in scenes:
            print(f"  {s['id']:<4} {s['style']:<22} diam {s['still_ratio'] * 100:.0f}%")
        print("LULUS" if res["pass"] else f"BELUM LULUS (jeda diam maks {BEAT_MAX:g} dtk, tanpa kilatan)")
    sys.exit(0 if res["pass"] else 1)


if __name__ == "__main__":
    main()
