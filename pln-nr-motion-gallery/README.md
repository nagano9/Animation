# PLN NR Motion Gallery

Galeri gaya gerak (motion style) untuk animasi profesional **PT PLN Nusantara Renewables**.
Dikembangkan dari referensi *Motion Styles Gallery V8*, lalu disesuaikan sepenuhnya dengan
design system PLN NR: ramp gradient energi (kuning → lime → teal → cyan → biru tua), hexagon
sebagai perangkat ikon, line-art monoline, masker kurva lensa, sudut persegi, teks navy, dan
merah hanya di petir logo.

Buka `index.html` langsung di browser. Tidak perlu server. Satu-satunya sumber daya luar adalah
font PT Sans dari Google Fonts.

## Isi

| Bagian | Isi |
| --- | --- |
| **Tata bahasa gerak** | 4 token easing, 6 token durasi, 6 aturan gerak, dan 8 transisi resmi dengan demo animasi |
| **Galeri** | 56 gaya dalam 10 rumpun, semuanya dengan pratinjau SVG animasi; filter rumpun, kebutuhan A–Z, format, tingkat; mode bandingkan dua gaya; tombol gerak aktif/diam; tingkat usaha produksi per kartu |
| **Peta A–Z** | 26 kebutuhan komunikasi PLN NR (Annual Report → Zero Accident), masing-masing dengan gaya utama, alternatif, audiens, durasi, format |
| **Resep video** | 8 rangkaian gaya menjadi video utuh (COD, briefing Direksi, safety induction, reels, onboarding, investor, booth, ESG) dengan timeline, animatic yang bisa diputar, dan JSON resep |
| **QA sebelum tayang** | 20 pemeriksaan dalam 4 kelompok (merek, konten, aksesibilitas, teknis), tersimpan per reviewer |
| **Alur produksi** | 6 langkah dari brief ke render, plus brief JSON per gaya yang bisa disalin |
| **Pedoman** | Lakukan dan hindari, ikut tercetak sebagai guardrail di setiap brief |

Detail setiap gaya (klik kartu): ringkasan, storyboard 4 beat, spesifikasi (durasi, tempo,
easing, transisi, tipografi, palet), arah produksi (musik, BPM, nada VO, usaha, tools),
overlay zona aman (title-safe, action-safe, potongan 9:16 dan 1:1), dan brief JSON. Tautan langsung ke satu gaya:
`index.html#gaya-<id>`, misalnya `#gaya-nusantara-map`.

### Sepuluh rumpun

1. **Signature PLN NR** (7): Energy Sweep, Hexagon Bloom, Navy Statement Kinetic, Monoline Energy Scene, Curved Lens Reveal, Chevron Chapter Push, Wave Edge Flow
2. **Data & Eksekutif** (7): Answer-First Data Story, Gradient Arc KPI, Waterfall Bridge, Nusantara Portfolio Map, Transit Line Roadmap, ISOTYPE Count, Live Ops Dashboard
3. **Teknik & Engineering** (10): Engineering Blueprint, Isometric Plant, Mechanical Cutaway, Hidden-Line Wireframe, Energy Flow Sankey, Single-Line Diagram Pulse, Thermal Drone Inspection
4. **Edukasi & Explainer** (6): Whiteboard Explainer, Flat Vector People, Cut-Paper Layers, Kinetic Typography, Glass Tech Cards, Numbered Hex Rail
5. **Nusantara & Budaya** (5): Batik Kawung Generative, Wayang Shadow Story, Watercolor Nusantara, Nusantara Travel Poster, Tenun Weave Lines
6. **Kampanye & Sosial** (6): Vertical Reels Hook, Hero Asset Reveal, Night Grid Glow, Low-Poly Landscape, Soft 3D Clay, Particle Energy Field
7. **K3 & Operasional** (3): K3 Safety Pictogram, SOP Checklist Flow, Top-Down Site Walkthrough
8. **Dokumenter & Sinematik** (3): Golden-Hour Cinematic, Contour Topography, Day-to-Night Timelapse
9. **Tata Kelola & Keuangan** (4): Authority Ladder Climb, Risk Heatmap Shift, Covenant Headroom, Three Lines Assurance
10. **Paket Broadcast** (5): Logo Sting & Ident, Lower Third & Name Super, Caption & Subtitle Pack, Event Countdown Loop, Before / After Split

Teknik & Engineering juga bertambah tiga: Hydro Water Path (PLTA), Geothermal Cross-Section (PLTP), Green Hydrogen Chain.

Tingkat: **Signature** = turunan langsung aset merek, aman untuk kanal resmi. **Inti** = gaya
serbaguna yang sudah disesuaikan. **Spesialis** = butuh konteks tertentu dan review tambahan.

## Integrasi dengan Explainer Studio

Skill **`skills/pln-nr-explainer-studio/`** membaca katalog ini dan mengubah kebutuhan
komunikasi menjadi paket produksi:

```
find.py  →  plan.py new  →  (tulis naskah)  →  plan.py retime  →  validate.py  →  build.py
pilih gaya   kerangka        VO, teks layar,     durasi ikut VO     QA merek       animatic.html, storyboard.md,
atau resep   adegan          data + sumber                          otomatis       captions.srt, production.json
```

- `catalog/pln-nr-motion-styles.json` (skema `plnnr.motion-catalog/1`) berisi gaya, arah
  produksi, peta A–Z, resep, transisi, easing, dan QA. Build menyalinnya ke
  `skills/pln-nr-explainer-studio/assets/` bersama pratinjau SVG dan CSS animasi.
- `dist/pln-nr-explainer-studio.zip` adalah paket skill siap unggah (claude.ai → Settings → Skills).
- `examples/cod-plts-terapung/` berisi contoh keluaran lengkap dari resep `cod-90`.

## Struktur

```
pln-nr-motion-gallery/
├── index.html                  halaman mandiri hasil build (buka ini)
├── dist/pln-nr-motion-gallery.html  versi fragmen untuk publikasi Artifact
├── catalog/pln-nr-motion-styles.json  katalog untuk Explainer Studio
├── src/styles-data.js          data 44 gaya + fungsi SVG pratinjau + peta A–Z
├── src/gallery.html            markup, CSS, dan logika halaman
├── assets/                     lockup PLN NR (warna dan putih)
└── tools/build.mjs             node tools/build.mjs
```

Menambah gaya: tambahkan satu `add({...})` di `src/styles-data.js` (id, name, cat, tier, desc,
when, aud, formats, dur, pace, ease, transition, palette, type, beats, dont, svg), daftarkan di
baris A–Z yang relevan, lalu jalankan `node tools/build.mjs`.

## Catatan

- Pratinjau adalah ilustrasi gaya, bukan render final. Angka, lokasi pin, dan nama lokasi bersifat contoh dan ditandai demikian di setiap bingkai.
- Tipografi memakai PT Sans sebagai pengganti Myriad Pro (lihat design system PLN NR). Jika lisensi Myriad Pro tersedia, cukup ganti `--font`.
- Gerak menghormati `prefers-reduced-motion`; kartu di luar layar berhenti dan menampilkan bingkai akhir.
- Semua gaya adalah interpretasi orisinal berbasis genre visual, bukan salinan karya atau produk tertentu.
