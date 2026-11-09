# Panduan Naskah dan Teks Layar PLN NR

## Register

- Bahasa Indonesia baku, kalimat aktif, sudut pandang institusi. Narasi boleh menyebut
  "PLN Nusantara Renewables" atau "perusahaan"; teks layar tidak memakai "kami/kita/saya".
- Faktual dan tenang. Tidak ada tanda seru, pertanyaan retoris (kecuali hook 9:16), emoji, atau
  superlatif tanpa bukti ("terbesar", "pertama") kecuali bersumber.
- Istilah teknis dalam bentuk baku: PLTS, PLTB, PLTP, PLTA, PLTM, BESS, COD, MWac, MWp, TKDN, DSCR.
  Jelaskan sekali untuk audiens umum: "PLTS, pembangkit listrik tenaga surya".
- Angka: desimal koma, ribuan titik (1,2 GW; 100.000 kWh; 1,30x). Satuan setelah angka dengan spasi.
- Tanggal: 12 Februari 2026. Waktu: 14.30 WIB.

## Tempo

| Unsur | Batas |
| --- | --- |
| VO | 130–150 kata per menit (acuan 140); `validate.py` menolak > 155 |
| Teks layar | ≤ 3 kata per detik durasi adegan, ≤ 2 baris, ≤ 8 kata per baris |
| Caption | ≤ 2 baris × 42 karakter, ganti di jeda kalimat |
| Angka final | tahan minimal 1,5 dtk setelah selesai menghitung |
| Hook 9:16 | pesan utama di 2 dtk pertama |

Rumus cepat: kata VO = durasi (dtk) × 2,3. Adegan 10 dtk ≈ 23 kata.

## Struktur per audiens

**Pengambil keputusan (Direksi, Dekom, RUPS, lender)** — answer-first.
1. Jawaban/kesimpulan dalam satu kalimat (setelah ident).
2. Dua sampai tiga bukti, satu adegan per bukti, satu angka kunci per adegan.
3. Risiko dan mitigasi.
4. Dasar kewenangan (bila ada keputusan).
5. Permintaan: apa, oleh siapa, kapan.

**Publik dan media** — cerita.
1. Konteks manusia atau tempat. 2. Apa yang dibangun. 3. Dampak terukur. 4. Pesan penutup satu kalimat.

**Karyawan dan kontraktor (onboarding, K3)** — instruksi.
1. Mengapa penting. 2. Langkah berurutan, satu langkah per kalimat. 3. Apa yang dilarang. 4. Ringkasan.

**Media sosial** — hook, satu pesan, bukti visual, lockup. Maksimal 30–45 dtk.

## Judul dan teks layar

- Judul adegan data adalah kalimat kesimpulan, bukan label.
  Buruk: "Analisis Kapasitas". Baik: "Kapasitas terpasang naik paling tajam tahun ini".
- Paksa kata kerja: naik, turun, menembus, menjaga, menggantikan, mengurangi.
- Teks layar menguatkan VO, tidak mengulangnya kata demi kata.

## Contoh

VO baik (10 dtk, 22 kata):
> Di atas waduk seluas ratusan hektare, panel surya terapung kini mengalirkan listrik bersih ke jaringan, tanpa mengurangi fungsi irigasi.

Teks layar baik: `Listrik bersih dari permukaan waduk`

VO buruk:
> Luar biasa! Kita berhasil membangun PLTS terapung terbesar!!

Masalah: tanda seru, "kita", superlatif tanpa sumber.

## Data dan sumber

Setiap angka di VO atau teks layar dicatat di `data` adegan dengan `source` yang merujuk ke
`sources` proyek (misal laporan tahunan, RKAP, dokumen proyek). Angka tanpa dokumen ditandai
`"source": "ilustratif"` dan wajib diganti sebelum tayang.
