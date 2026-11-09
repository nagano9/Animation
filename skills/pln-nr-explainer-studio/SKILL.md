---
name: pln-nr-explainer-studio
description: Studio produksi video explainer dan animasi PT PLN Nusantara Renewables (PLN NR). Gunakan saat pengguna ingin membuat, merencanakan, atau mereview video, animasi, motion graphic, reels, animatic, storyboard, naskah VO, atau brief produksi untuk PLN NR (COD, groundbreaking, RUPS, briefing Direksi, K3/safety induction, ESG, investor, onboarding, kampanye sosial, booth pameran, dan kebutuhan A–Z lainnya). Membaca katalog 56 gaya gerak PLN NR (PLN NR Motion Gallery), memilih gaya atau resep video, menyusun naskah dan storyboard, menjalankan QA merek otomatis, lalu menghasilkan animatic HTML yang bisa diputar, storyboard, caption SRT, dan paket produksi JSON.
---

# Explainer Studio PLN NR

Skill ini mengubah kebutuhan komunikasi PLN NR menjadi paket produksi video yang patuh merek.
Sumber kebenarannya adalah katalog `assets/catalog.json` (skema `plnnr.motion-catalog/1`), hasil
build dari PLN NR Motion Gallery: 56 gaya dalam 10 rumpun, 26 kebutuhan A–Z, 8 resep video,
8 transisi resmi, token easing, arah produksi per gaya, dan 20 butir QA.

Semua skrip memakai Python 3 standar (tanpa dependensi). Jalankan dari folder skill ini.

## Alur kerja

Ikuti urutan ini. Jangan lompat ke animatic sebelum validasi lulus.

### 1. Pahami brief

Kumpulkan dari percakapan atau dokumen pengguna. Bila ada yang kosong, ambil asumsi yang wajar,
tulis asumsinya, dan lanjutkan; tanyakan hanya hal yang benar-benar mengubah hasil (biasanya
audiens dan kanal tayang).

- **Tujuan**: apa yang harus diketahui, dirasakan, atau diputuskan penonton setelah menonton.
- **Audiens**: Direksi, Dekom, lender, publik, karyawan, kontraktor, komunitas, mahasiswa.
- **Kanal dan rasio**: YouTube/layar acara 16:9, Reels/TikTok 9:16, feed 1:1, LED panggung.
- **Durasi target**.
- **Data dan sumbernya**: setiap angka wajib punya sumber. Tanpa sumber, tandai sebagai ilustratif.
- **Permintaan (ask)**: untuk audiens pengambil keputusan, apa yang diminta dan kapan.

### 2. Pilih gaya atau resep

```bash
python3 scripts/find.py --need H              # kebutuhan A–Z: gaya utama, alternatif, resep
python3 scripts/find.py --q "hidrogen BESS"   # cari kata kunci di semua gaya
python3 scripts/find.py --recipe              # daftar resep video
python3 scripts/find.py --style risk-heatmap  # detail satu gaya (palet, beat, larangan, produksi)
```

Aturan memilih:
- Mulai dari **huruf kebutuhan A–Z**. Jika ada resep untuk huruf itu, pakai resepnya sebagai kerangka.
- Satu video memakai **maksimal tiga gaya isi** plus Paket Broadcast (logo-sting, lower-third,
  caption-pack). Lebih dari itu terasa seperti katalog, bukan cerita.
- Gaya **Signature** aman untuk kanal resmi. Gaya **Spesialis** butuh alasan konteks; sebutkan alasannya.
- Video media sosial selalu memakai `caption-pack`. Video wawancara selalu memakai `lower-third`.
- Video resmi dibuka dan ditutup dengan `logo-sting`, kecuali loop booth.

### 3. Buat kerangka proyek

```bash
python3 scripts/plan.py new --recipe cod-90 --title "Peresmian PLTS Terapung" --out work/project.json
python3 scripts/plan.py new --need S --title "Kampanye Hari Listrik" --aspect 9:16 --out work/project.json
python3 scripts/plan.py new --styles logo-sting,hydro-flow,arc-kpi,logo-sting --title "PLTA Explained" --out work/project.json
```

Hasilnya `plnnr.explainer-project/1` (lihat `references/schema.md`): daftar adegan dengan gaya,
peran, durasi awal, transisi masuk, dan kolom kosong untuk VO, teks layar, data, dan catatan.

### 4. Tulis naskah dan isi adegan

Baca `references/naskah.md` sebelum menulis. Ringkasnya:
- Bahasa Indonesia baku, kalimat aktif, sudut pandang institusi. Tanpa emoji dan tanda seru.
- VO 130–150 kata per menit. Satu ide per adegan.
- Teks layar (`onscreen`) maksimal 3 kata per detik durasi adegan, maksimal 2 baris.
- Angka memakai desimal koma dan ribuan titik (1,2 GW; 100.000 kWh). Setiap angka masuk ke
  `data` dengan `source` yang merujuk ke daftar `sources`.
- Untuk audiens pengambil keputusan: jawaban di adegan pertama setelah ident, permintaan di akhir.
- Ikuti empat beat gaya (`find.py --style <id>`) sebagai panduan isi visual adegan.

Isi `work/project.json` langsung (edit JSON), lalu sesuaikan durasi dengan panjang VO:

```bash
python3 scripts/plan.py retime work/project.json     # durasi mengikuti jumlah kata VO
python3 scripts/plan.py show work/project.json       # tabel ringkas dengan timecode
```

### 5. Validasi merek dan konten

```bash
python3 scripts/validate.py work/project.json
```

Perbaiki semua **ERROR** dan tinjau setiap **PERINGATAN** sampai validasi lulus. Pemeriksaan
otomatis mencakup: gaya ada di katalog, rasio cocok, kecepatan VO dan teks layar, emoji dan tanda
seru, sumber angka, format desimal, warna merah, pemakaian Energy Sweep, ident pembuka/penutup,
caption untuk 9:16, durasi total terhadap target, dan kata ganti orang pertama di teks layar.

### 6. Hasilkan paket produksi

```bash
python3 scripts/build.py work/project.json --out work/out
```

Menghasilkan:
- `animatic.html` — animatic mandiri yang bisa diputar: pratinjau gaya bergerak per adegan,
  teks layar, caption VO, timeline, timecode, kecepatan 1×/2×. Lockup resmi tampil di adegan
  `logo-sting`. Bisa dibuka langsung di browser atau dipublikasikan sebagai Artifact.
- `storyboard.md` — tabel adegan: timecode, gaya, peran, transisi, VO, teks layar, data dan sumber, arahan visual dari beat gaya.
- `captions.srt` — caption Bahasa Indonesia dari VO, maks 2 baris × 42 karakter.
- `production.json` — paket untuk animator: spesifikasi gaya per adegan (palet, tipografi,
  easing, transisi, musik, BPM, nada VO, tools, larangan) plus checklist QA manual.

### 7. Serahkan

Sampaikan ke pengguna: ringkasan alur (judul, durasi, gaya terpilih dan alasannya), hasil
validasi, daftar asumsi dan angka ilustratif yang masih harus diganti, lalu tautan/berkas
animatic, storyboard, SRT, dan paket produksi. Bila tool Artifact tersedia, publikasikan
`animatic.html` agar bisa ditonton tim. Tutup dengan butir QA manual yang tidak bisa dicek
otomatis (lisensi musik, loudness, ejaan nama, kesesuaian footage).

## Aturan merek yang tidak boleh dilanggar

- Merah `#E20613` hanya di petir logo; tidak pernah di grafik, teks, atau latar.
- Tidak ada hitam; teks gelap selalu navy `#00507C`.
- Satu sinyal per bingkai: cyan di atas putih, kuning di atas navy.
- Lockup selalu dari aset resmi (`assets/logo-pln-nr-*.png`), tidak digambar ulang.
- Tanpa bounce, elastic, getar, atau glitch. Default antar adegan: cross-fade 220 ms.
- Energy Sweep maksimal dua kali per video.
- Tipografi PT Sans (pengganti Myriad Pro); angka tabular.

## Rujukan

- `references/naskah.md` — panduan menulis naskah dan teks layar, pola per audiens, contoh.
- `references/schema.md` — skema proyek dan adegan.
- `references/qa.md` — butir QA, mana yang otomatis dan mana yang manual.
- `assets/catalog.json` — katalog lengkap. Untuk memperbarui, jalankan build di PLN NR Motion Gallery.
- `examples/cod-plts-terapung.project.json` — contoh proyek lengkap (angka ilustratif).
