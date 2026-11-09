# Skema Proyek `plnnr.explainer-project/1`

```json
{
  "schema": "plnnr.explainer-project/1",
  "title": "Peresmian PLTS Terapung",
  "need": "C",                      // huruf kebutuhan A–Z
  "recipe": "cod-90",               // id resep, atau null
  "aspect": "16:9",                 // 16:9 | 9:16 | 1:1
  "target_s": 90,                   // durasi target (opsional)
  "audience": "Publik, media, PLN Induk",
  "objective": "Penonton tahu pembangkit sudah beroperasi dan apa manfaatnya",
  "ask": "",                        // wajib untuk A, B, F, I, R
  "assumptions": ["Footage drone tersedia"],
  "sources": [{ "id": "S1", "text": "Dokumen proyek, rev. 2026" }],
  "scenes": [
    {
      "id": "s01",
      "style": "golden-hour",       // id gaya dari katalog
      "role": "Establishing",
      "duration_s": 26,
      "transition_in": "Cross-fade 220 ms", // "Cut" atau nama transisi resmi di katalog
      "vo": "Kalimat narasi ...",
      "onscreen": ["Baris 1", "Baris 2"],   // maks 2 baris
      "data": [{ "label": "Kapasitas", "value": "100", "unit": "MWac", "source": "S1" }],
      "lower_third": { "name": "Nama", "title": "Jabatan" },  // untuk gaya lower-third
      "title": "Kalimat kesimpulan adegan",   // slot judul (answer-first, waterfall, isotype, hex-rail, sop-checklist)
      "kicker": "03 — BUDAYA KERJA",          // label kecil (energy-sweep, navy-statement)
      "steps": ["Usulan", "Kajian"],          // langkah (hex-rail, sop-checklist); default dari onscreen
      "callout": { "value": "+38%", "text": "pertumbuhan tahun ini" },  // kotak so-what (answer-first)
      "unit_line": "MW · n = 5 tahun",        // baris satuan di atas grafik
      "icons_on": 58,                          // jumlah simbol menyala (isotype, 0–70)
      "location": "Waduk Contoh, Jawa Barat", // golden-hour, travel-poster
      "sublabel": "100 MWac · COD 2026",
      "subject": "surya",                      // golden-hour: "surya" mengganti turbin dengan panel terapung
      "audio": "audio/s01.wav",                // VO adegan; plan.py retime --audio dan render --audio
      "audio_offset_s": 0.15,
      "colors": [],                 // opsional: warna khusus adegan, divalidasi ke palet
      "visual": "Arahan visual; default dari beat gaya",
      "notes": "Catatan untuk animator"
    }
  ]
}
```

`plan.py new` mengisi kerangka; `plan.py retime` menaikkan `duration_s` bila VO atau teks layar
membutuhkan waktu lebih (perkiraan 140 kata/menit). `plan.py retime --audio` menetapkan durasi
dari panjang file `audio` yang sebenarnya, naik maupun turun.

Transisi (status usulan, lihat `assets/motion.tokens.json`): Cross-fade 220 ms, Wave Wipe,
Line Draw, Count-Up (semua mode); Energy Sweep, Hex Bloom, Chevron Push, Lens Iris (hanya mode
expressive).

## Pemetaan ke slot gaya

`build.py` memetakan field adegan ke kontrak slot gaya (`svg(p, d)` di `assets/styles-data.js`):
`onscreen` → `lines`, `steps` (atau `onscreen`) → `steps`, `data` → `values`, `lower_third` →
`name`/`role`, dan sumber `data[*].source` diterjemahkan ke teks di `sources`. Gaya tanpa slot
menampilkan konten ilustratif, dan `onscreen` tampil sebagai overlay teks.
