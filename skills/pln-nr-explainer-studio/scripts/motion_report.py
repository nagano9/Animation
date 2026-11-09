#!/usr/bin/env python3
"""QA gerak pada video hasil render: apakah video benar-benar bergerak dan nyaman ditonton.

  python3 scripts/motion_report.py work/out/video.mp4 [--project work/project.json] [--json]

Mengukur dari piksel (ffmpeg, tanpa dependensi lain):
- detik nyaris diam (rata-rata beda antar-frame < ambang) dan jeda diam terpanjang
  → token beat-max: tidak boleh ada jeda diam > 6 dtk
- lompatan kecerahan antar-detik (kilatan) → peringatan bila Δ luminans > 90 dari 255
Keluar dengan kode 1 bila ada jeda diam > 6 dtk atau kilatan.
"""
import argparse
import json
import subprocess
import sys

W, H = 64, 36
STILL = 0.15      # beda rata-rata per frame (0–255) di bawah ini dianggap diam
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
    diff = [sum(abs(x - y) for x, y in zip(f1, f0)) / len(f0) for f0, f1 in zip(fr, fr[1:])]
    luma = [sum(f) / len(f) for f in fr]
    secs = len(diff) // step
    per_sec = [sum(diff[i * step:(i + 1) * step]) / step for i in range(secs)]
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
    flashes = []
    for i in range(1, secs):
        d = luma[i * step] - luma[(i - 1) * step]
        if abs(d) > FLASH:
            # kilatan hanya bila perubahan terjadi dalam < 0,3 dtk (bukan transisi bertahap)
            j0 = (i - 1) * step
            fast = max(abs(luma[k + max(1, int(.3 * fps))] - luma[k]) for k in range(j0, min(len(luma) - int(.3 * fps) - 1, i * step)))
            if fast > FLASH:
                flashes.append((i, round(luma[(i - 1) * step]), round(luma[i * step])))
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
