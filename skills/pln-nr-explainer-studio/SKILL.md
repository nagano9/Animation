---
name: pln-nr-explainer-studio
description: Studio produksi video explainer dan animasi PT PLN Nusantara Renewables (PLN NR). Gunakan saat pengguna ingin membuat, merencanakan, atau mereview video, animasi, motion graphic, reels, animatic, storyboard, naskah VO, atau brief produksi untuk PLN NR (COD, groundbreaking, RUPS, briefing Direksi, K3/safety induction, ESG, investor, onboarding, kampanye sosial, booth pameran, dan kebutuhan A–Z lainnya). Membaca katalog 56 gaya gerak PLN NR (PLN NR Motion Gallery), memilih gaya atau resep video, menyusun naskah dan storyboard, menjalankan QA merek otomatis, lalu menghasilkan animatic HTML yang bisa diputar, storyboard, caption SRT, dan paket produksi JSON.
---

# Explainer Studio PLN NR

Skill ini mengubah kebutuhan komunikasi PLN NR menjadi paket produksi video yang patuh merek.
Sumber kebenarannya adalah katalog `assets/catalog.json` (skema `plnnr.motion-catalog/1`), hasil
build dari PLN NR Motion Gallery: 56 gaya dalam 10 rumpun, 26 kebutuhan A–Z, 8 resep video,
8 transisi resmi, token easing, arah produksi per gaya, dan 20 butir QA.

Skrip perencanaan memakai Python 3 standar (tanpa dependensi); render memakai Node + Playwright + ffmpeg. Jalankan dari folder skill ini.

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
otomatis mencakup: gaya ada di katalog, rasio, kecepatan VO dan teks layar, panjang baris teks
layar (maks 32 karakter di 16:9, 24 di 9:16, agar terbaca di ukuran minimal 66/72 px), emoji dan
tanda seru, sumber angka, format desimal, warna merah, transisi terhadap mode gerak gaya,
kapasitas slot data, pemakaian Energy Sweep, ident pembuka/penutup, durasi total terhadap target,
dan kata ganti orang pertama di teks layar.

### 6. Hasilkan paket produksi

```bash
python3 scripts/build.py work/project.json --out work/out
```

Menghasilkan:
- `animatic.html` — pemutar interaktif. Setiap frame dihitung oleh runtime render yang sama
  dengan MP4, jadi yang terlihat di animatic adalah frame final. Lockup resmi, teks layar,
  caption, timeline, kecepatan 1×/2×.
- `storyboard.md` — tabel adegan: timecode, gaya, peran, transisi, VO, teks layar, data dan sumber, arahan visual.
- `captions.srt` — caption Bahasa Indonesia dari VO, maks 2 baris × 42 karakter.
- `production.json` — paket untuk animator: spesifikasi gaya per adegan plus checklist QA manual.

### 7. Render video

```bash
node engine/render.mjs work/out/animatic.html --stills work/out/stills    # still per adegan + contact-sheet.png
node engine/render.mjs work/out/animatic.html --out work/out/video.mp4 --audio work/project.json [--music bed.mp3]
```

Setelah render, jalankan QA gerak dan perbaiki sampai lulus:

```bash
python3 scripts/motion_report.py work/out/video.mp4 --project work/project.json
```

Laporan ini mengukur detik diam, jeda diam terpanjang (maks 6 dtk, token beat-max), dan kilatan
kecerahan. Bila gagal, tambah beat di adegan yang paling diam (field `beats`), pecah adegan
panjang, atau ganti transisi ke Dip Navy pada lompatan navy ↔ putih.

Selalu periksa contact sheet sebelum render penuh; lihat still dengan tool baca gambar dan
perbaiki adegan yang teksnya bertabrakan atau datanya salah. Render menghasilkan H.264
1920×1080 (16:9), 1080×1920 (9:16), atau 1080×1080 (1:1) pada 25 fps; 9:16 dan 1:1 memakai
tata letak bertumpuk (art di atas, teks besar di bawah, di luar zona UI platform). Caption
dibakar ke video kecuali `--no-captions`. Bila ada audio, VO dicampur dan loudness dinormalkan
ke −14 LUFS. Kecepatan render sekitar 10–12 frame/detik (video 90 detik ≈ 3–4 menit).

Kebutuhan: Node 18+, Playwright dengan Chromium, ffmpeg. Bila tidak tersedia, serahkan
animatic dan production.json; animator dapat merender ulang di mesin yang lengkap.

**Mesin beat.** Runtime tidak memutar animasi gaya apa adanya. Animasi masuk dikelompokkan
dan dijadwalkan ulang ke beat adegan, yaitu waktu setiap frasa VO (dipisah koma dan titik). Hasilnya:
- teks layar muncul baris per baris dan keluar 0,45 dtk sebelum adegan berakhir;
- lower third keluar setelah maksimal 8 dtk (`hold` untuk mengatur);
- angka dihitung naik saat frasa yang menyebutnya diucapkan;
- kamera bergerak pelan per beat (productive tenang, expressive lebih terasa), dan celah tanpa beat
  diisi sehingga tidak ada jeda diam lebih dari 6 dtk.

Tulis VO dalam frasa pendek berkoma agar beat terasa. Untuk sinkron per kata, isi `words`
(timestamp kata hasil transkripsi, format Whisper `[{w, start, end}]`) atau `beats` (detik)
secara manual.

**Transisi.** Hanya Cross-fade, Wave Wipe, Dip Navy, Energy Sweep, Hex Bloom, Chevron Push, dan
Lens Iris yang berfungsi sebagai perpindahan adegan. Count-Up dan Line Draw adalah animasi isi.
`plan.py new` otomatis memakai Dip Navy saat kecerahan latar dua adegan berbeda jauh.

**Timing dari audio.** Bila rekaman VO per adegan tersedia (field `audio`), jalankan
`python3 scripts/plan.py retime work/project.json --audio`: durasi adegan mengikuti panjang
audio nyata (ffprobe), bukan perkiraan kata per menit.

### 8. Serahkan

Sampaikan ke pengguna: ringkasan alur (judul, durasi, gaya terpilih dan alasannya), hasil
validasi, daftar asumsi dan angka ilustratif yang masih harus diganti, lalu berkas video,
contact sheet, animatic, storyboard, SRT, dan paket produksi. Bila tool Artifact tersedia,
publikasikan `animatic.html` agar bisa ditonton tim. Tutup dengan butir QA manual yang tidak bisa
dicek otomatis (lisensi musik, ejaan nama, kesesuaian footage, persetujuan pemilik konten).

## Gaya dengan slot data

Gaya berikut membaca data proyek langsung ke visual; gaya lain menampilkan konten ilustratif
dan teks layar ditempel sebagai overlay. Pilih gaya berslot untuk adegan yang membawa angka.

| Gaya | Field adegan yang dibaca |
| --- | --- |
| energy-sweep, navy-statement, kinetic-type | `onscreen` (baris), `kicker`; kinetic-type juga `data[0]` |
| arc-kpi | `data` (maks 3; unit `%` menggambar busur sesuai nilai) |
| answer-first | `title`, `data` (maks 6, terakhir disorot), `callout`, `unit_line`, sumber |
| waterfall | `title`, `data` (awal, perubahan bertanda, akhir; maks 7) |
| isotype | `title`, `data[0]`, `icons_on` (0–70) |
| hex-rail, sop-checklist | `title`, `steps` atau `onscreen` (maks 5) |
| lower-third | `lower_third.name`, `lower_third.title` |
| golden-hour, travel-poster | `location`, `sublabel` |

Angka di slot dihitung naik (Count-Up) dengan format Indonesia. Mode gerak tiap gaya
(productive/expressive) dan transisi yang diizinkan ada di `assets/motion.tokens.json`;
`validate.py` memberi peringatan bila transisi expressive dipakai di gaya productive.

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
