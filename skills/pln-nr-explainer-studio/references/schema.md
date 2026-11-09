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
      "colors": [],                 // opsional: warna khusus adegan, divalidasi ke palet
      "visual": "Arahan visual; default dari beat gaya",
      "notes": "Catatan untuk animator"
    }
  ]
}
```

`plan.py new` mengisi kerangka; `plan.py retime` menaikkan `duration_s` bila VO atau teks layar
membutuhkan waktu lebih. Durasi tidak pernah diturunkan otomatis.

Transisi resmi: Cross-fade 220 ms, Energy Sweep, Hex Bloom, Wave Wipe, Chevron Push, Lens Iris,
Line Draw, Count-Up.
