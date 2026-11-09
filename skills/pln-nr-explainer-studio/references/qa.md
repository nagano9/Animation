# QA Sebelum Tayang

Dua puluh butir dari PLN NR Motion Gallery. Kolom **Otomatis** menunjukkan apa yang diperiksa `validate.py`.

| Kelompok | Butir | Otomatis |
| --- | --- | --- |
| Merek | Lockup dari aset resmi, posisi dan ukuran benar | Sebagian (animatic memakai aset resmi) |
| Merek | Hanya warna ramp PLN NR; merah hanya di petir logo | Ya, untuk `colors` adegan |
| Merek | Teks gelap navy, tidak hitam | Manual |
| Merek | Satu sinyal per bingkai | Manual |
| Merek | Ident pembuka/penutup versi resmi | Ya (logo-sting di awal/akhir) |
| Konten | Setiap angka punya sumber | Ya |
| Konten | Angka ilustratif sudah diganti | Ya (peringatan `ilustratif`) |
| Konten | Nama, jabatan, lokasi dieja benar | Manual |
| Konten | Bahasa baku, desimal koma, ribuan titik | Ya (format angka, tanda seru, emoji) |
| Konten | Tidak ada klaim proyek yang belum diputuskan | Manual |
| Aksesibilitas | Caption Bahasa Indonesia (SRT) | Ya (`build.py` membuat SRT) |
| Aksesibilitas | Teks layar ≤ 3 kata/dtk | Ya |
| Aksesibilitas | Kontras teks ≥ 4,5:1 | Manual pada footage final |
| Aksesibilitas | Status tidak hanya warna (▲ ● ▼) | Manual |
| Aksesibilitas | Tanpa kedipan > 3 kali/dtk | Manual |
| Teknis | Resolusi dan rasio sesuai kanal | Ya (rasio vs format gaya) |
| Teknis | Teks di dalam title-safe 90% | Manual (overlay zona aman di galeri) |
| Teknis | Loudness −14 LUFS sosial / −23 LUFS siaran | Manual |
| Teknis | Musik berlisensi | Manual |
| Teknis | Thumbnail dan nama file sesuai konvensi | Manual |

Konvensi nama file: `PLNNR_<kebutuhan>_<judul-singkat>_<rasio>_<YYYYMMDD>_v<nn>.mp4`,
misalnya `PLNNR_C_COD-PLTS-Terapung_16x9_20261109_v01.mp4`.
