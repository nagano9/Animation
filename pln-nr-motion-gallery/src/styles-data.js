/* PLN NR Motion Gallery — katalog gaya gerak.
   Setiap entri: metadata produksi + fungsi svg(p) yang menghasilkan pratinjau animasi.
   p = prefix id unik (agar gradient tidak bentrok saat SVG yang sama dirender dua kali).
   Seluruh pratinjau adalah ilustrasi orisinal berbasis design system PLN NR, bukan render final. */
(function (root) {
  const C = {
    navy: '#00507C', deep: '#005F89', azure: '#0087BE', sky: '#0098D3', pln: '#009EE2',
    cyan: '#00ADEF', teal: '#00A2BA', green: '#94DA63', lime: '#B9DE41', yellow: '#FFF100',
    paper: '#F1F6FA', white: '#FFFFFF', n25: '#BFD3DE', n50: '#7FA7BD', n75: '#407C9D', inkSoft: '#3A6E8C', line: '#DFDFDF'
  };

  const D = p => `<defs>
<linearGradient id="${p}E" x1="0" x2="1"><stop offset="0" stop-color="#FFF100"/><stop offset=".22" stop-color="#B9DE41"/><stop offset=".52" stop-color="#00A2BA"/><stop offset=".76" stop-color="#00ADEF"/><stop offset="1" stop-color="#005F89"/></linearGradient>
<linearGradient id="${p}V" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00BCC0"/><stop offset=".5" stop-color="#94DA63"/><stop offset="1" stop-color="#FFF100"/></linearGradient>
<linearGradient id="${p}B" x1="0" x2="1"><stop offset="0" stop-color="#00ADEF"/><stop offset=".55" stop-color="#0087BE"/><stop offset="1" stop-color="#005F89"/></linearGradient>
<linearGradient id="${p}N" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#00618F"/><stop offset=".6" stop-color="#00507C"/><stop offset="1" stop-color="#004367"/></linearGradient>
<linearGradient id="${p}C" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#009FDC"/><stop offset=".5" stop-color="#0073A3"/><stop offset="1" stop-color="#00567E"/></linearGradient>
<linearGradient id="${p}S" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#005F89"/><stop offset=".55" stop-color="#00A2BA"/><stop offset=".85" stop-color="#B9DE41"/><stop offset="1" stop-color="#FFF100"/></linearGradient>
</defs>`;

  const svg = (p, body, defs = '') =>
    `<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${D(p)}${defs}${body}</svg>`;

  const hexPts = (cx, cy, r) => [-90, -30, 30, 90, 150, 210]
    .map(a => { const t = a * Math.PI / 180; return `${(cx + r * Math.cos(t)).toFixed(1)},${(cy + r * Math.sin(t)).toFixed(1)}`; }).join(' ');

  const turbine = (x, by, h, c, w = 3, t = '5s') => {
    const hy = by - h, L = h * 0.55;
    const blades = [-90, 30, 150].map(a => {
      const r = a * Math.PI / 180;
      return `<line x1="${x}" y1="${hy}" x2="${(x + L * Math.cos(r)).toFixed(1)}" y2="${(hy + L * Math.sin(r)).toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
    }).join('');
    return `<line x1="${x}" y1="${by}" x2="${x}" y2="${hy}" stroke="${c}" stroke-width="${w * 1.5}" stroke-linecap="round"/><g class="a-spin" style="--t:${t};transform-origin:${x}px ${hy}px">${blades}</g><circle cx="${x}" cy="${hy}" r="${w * 1.3}" fill="${c}"/>`;
  };

  const panel = (x, y, w, h, fill, st) => {
    let g = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${st}" stroke-width="1.5"/>`;
    for (let i = 1; i < 4; i++) g += `<line x1="${x + w * i / 4}" y1="${y}" x2="${x + w * i / 4}" y2="${y + h}" stroke="${st}" stroke-width=".8"/>`;
    g += `<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="${st}" stroke-width=".8"/>`;
    return g;
  };

  const person = (x, y, body, helmet = C.yellow, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-46" r="11" fill="#F2C9A0"/><path d="M-12 -50 A12 12 0 0 1 12 -50 L14 -48 L-14 -48 Z" fill="${helmet}"/><rect x="-14" y="-33" width="28" height="36" rx="6" fill="${body}"/><rect x="-14" y="-20" width="28" height="4" fill="${C.yellow}"/><rect x="-11" y="3" width="9" height="22" fill="${C.navy}"/><rect x="2" y="3" width="9" height="22" fill="${C.navy}"/></g>`;

  const house = (x, y, c) => `<path d="M${x} ${y + 9} L${x + 9} ${y} L${x + 18} ${y + 9} L${x + 18} ${y + 20} L${x} ${y + 20} Z" fill="${c}"/>`;

  /* Penjaga kontras teks: navy-75 (4,2:1 di atas paper) → ink-soft; navy-50 (2,6:1) hanya untuk latar gelap → navy-25. */
  const TXT_GUARD = { '#407C9D': '#3A6E8C', '#7FA7BD': '#BFD3DE' };
  const T = (x, y, s, txt, fill, weight = 700, extra = '') =>
    (fill = TXT_GUARD[fill] || fill, `<text x="${x}" y="${y}" font-size="${s}" font-weight="${weight}" fill="${fill}" ${extra}>${txt}</text>`);

  const d = (v) => `style="--d:${v}s"`;

  // ------------------------------------------------------------------
  const S = [];
  const add = o => S.push(o);

  /* ========== RUMPUN 1 — SIGNATURE PLN NR ========== */
  add({
    id: 'energy-sweep', name: 'Energy Sweep', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Pita gradient matahari-ke-laut menyapu layar dan membuka adegan. Gerak paling khas PLN NR: transisi energi sebagai satu sapuan.',
    when: 'Pembuka dan penutup video korporat, bumper antar bab, intro tayangan resmi.',
    aud: 'Semua audiens', formats: ['16:9', '9:16', '1:1'], dur: '5–8 dtk (bumper)', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Energy Sweep', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan, C.deep],
    type: 'PT Sans Bold 700, display 64–100 px, tracking −1%',
    beats: ['Layar navy kosong 0,5 dtk', 'Pita gradient menyapu dari kiri ke kanan', 'Judul muncul di belakang sapuan', 'Lockup PLN NR mengunci di kanan atas'],
    dont: ['Jangan menaruh teks di atas gradient', 'Jangan memutar arah gradient (selalu kuning di kiri)'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'hex-bloom', name: 'Hexagon Bloom', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Enam hexagon gradient mekar berurutan membentuk siklus. Hexagon adalah perangkat ikon resmi PLN NR, jadi gaya ini aman untuk semua konten pilar.',
    when: 'Menjelaskan pilar strategi, siklus proyek, nilai AKHLAK, enam tahap pengembangan.',
    aud: 'Direksi, karyawan, mitra', formats: ['16:9', '1:1'], dur: '20–40 dtk', pace: 'Tenang',
    ease: 'emphasis', transition: 'Hex Bloom', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan],
    type: 'PT Sans SemiBold 600 UPPERCASE untuk label hexagon (2 kata)',
    beats: ['Hexagon pusat navy muncul', 'Enam hexagon mekar searah jarum jam', 'Label tiap pilar terketik', 'Garis penghubung menyala satu per satu'],
    dont: ['Jangan isi hexagon dengan ikon buatan sendiri', 'Maksimal enam hexagon per siklus'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>`;
      const cx = 320, cy = 180, R = 104;
      const labels = ['STUDI', 'IZIN', 'DANA', 'EPC', 'COD', 'O&M'];
      for (let i = 0; i < 6; i++) {
        const a = (-90 + i * 60) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
        g += `<g class="a-pop" ${d(.3 + i * .35)}><polygon points="${hexPts(x, y, 46)}" fill="url(#${p}V)"/>${T(x, y + 5, 13, labels[i], C.navy, 700, 'text-anchor="middle"')}</g>`;
      }
      g += `<g class="a-pop" ${d(0)}><polygon points="${hexPts(cx, cy, 52)}" fill="${C.navy}"/>${T(cx, cy - 4, 15, 'SIKLUS', C.white, 700, 'text-anchor="middle"')}${T(cx, cy + 16, 15, 'PROYEK', C.yellow, 700, 'text-anchor="middle"')}</g>`;
      return svg(p, g);
    }
  });

  add({
    id: 'navy-statement', name: 'Navy Statement Kinetic', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Pernyataan besar di bidang navy, muncul kata demi kata, dikunci garis gradient. Turunan langsung dari slide statement PLN NR.',
    when: 'Kutipan Direksi, pesan kunci, kicker antar bagian, penutup kampanye budaya.',
    aud: 'Karyawan, publik', formats: ['16:9', '9:16', '1:1'], dur: '6–12 dtk per pernyataan', pace: 'Tenang',
    ease: 'entrance', transition: 'Cross-fade 220 ms', palette: [C.navy, C.white, C.yellow],
    type: 'PT Sans Bold 700, 58–100 px; satu kata kuning sebagai sinyal',
    beats: ['Bidang navy', 'Kata pertama masuk, kata kunci berwarna kuning', 'Garis gradient tumbuh di bawah', 'Tahan 2 dtk lalu cross-fade'],
    dont: ['Maksimal 12 kata', 'Hanya satu kata berwarna sinyal'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'monoline-scene', name: 'Monoline Energy Scene', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Pemandangan line-art biru (matahari, menara transmisi, bendungan, turbin) yang tergambar sendiri lalu hidup. Tekstur resmi PLN NR menggantikan ikon.',
    when: 'Latar belakang narasi profil perusahaan, opening laporan tahunan, layar tunggu acara.',
    aud: 'Semua audiens', formats: ['16:9', '1:1'], dur: '10–30 dtk (loop)', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.navy, C.azure, C.sky, C.n25],
    type: 'PT Sans Regular 400 untuk keterangan; judul di luar area line-art',
    beats: ['Garis cakrawala tergambar', 'Matahari, menara, bendungan muncul berurutan', 'Turbin mulai berputar', 'Judul fade-in di ruang kosong'],
    dont: ['Garis selalu satu warna dan satu ketebalan', 'Jangan tambah warna isi (fill)'],
    svg: p => {
      const s = C.sky;
      const L = (dd, len, del) => `<path class="a-draw" style="--len:${len};--d:${del}s" d="${dd}" fill="none" stroke="${s}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
      return svg(p, `<rect width="640" height="360" fill="${C.navy}"/>
${L('M20 290 L620 290', 600, 0)}
${L('M120 150 m-34 0 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0', 214, .4)}
${L('M60 150 L80 150 M160 150 L180 150 M120 90 L120 106 M120 194 L120 210', 120, .8)}
${L('M250 290 L275 120 L300 290 M258 240 L292 240 M264 190 L286 190 M240 140 L310 140 M246 165 L304 165', 600, 1)}
${L('M350 290 L370 210 L470 210 L490 290 M350 250 L490 250 M380 210 L380 290 M410 210 L410 290 M440 210 L440 290', 700, 1.4)}
<g class="a-up" ${d(1.8)}>${turbine(560, 290, 130, s, 2.5, '6s')}</g>`);
    }
  });

  add({
    id: 'lens-mask', name: 'Curved Lens Reveal', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Foto atau ilustrasi golden-hour selalu dimasker dalam kurva lensa, tidak pernah kotak. Masker bernapas pelan dan membuka adegan.',
    when: 'Cover video, pembuka groundbreaking, highlight proyek dengan footage lapangan.',
    aud: 'Publik, media', formats: ['16:9', '9:16'], dur: '6–15 dtk', pace: 'Tenang',
    ease: 'entrance', transition: 'Lens Iris', palette: [C.navy, C.white, C.yellow, C.teal],
    type: 'PT Sans Bold 700 judul di sisi putih; italic hanya untuk subjudul bab',
    beats: ['Bidang putih dengan judul', 'Kurva lensa terbuka dari kanan atas', 'Footage bergerak pelan (push-in 4%)', 'Lockup mengunci'],
    dont: ['Jangan pakai masker kotak atau rounded-rect', 'Jangan tint atau blur foto'],
    svg: p => svg(p, `<rect width="640" height="360" fill="#fff"/>
<clipPath id="${p}lens"><ellipse class="a-breathe" style="--s:1.04" cx="620" cy="30" rx="330" ry="300"/></clipPath>
<g clip-path="url(#${p}lens)"><rect width="640" height="360" fill="url(#${p}S)"/>
<circle cx="470" cy="250" r="40" fill="${C.yellow}" opacity=".9"/>
<rect x="0" y="262" width="640" height="98" fill="${C.deep}"/>
<g class="a-slide" style="--from:-12px;--to:12px;--t:8s">${turbine(420, 262, 90, C.navy, 2.5, '7s')}${turbine(520, 262, 120, C.navy, 3, '6s')}${turbine(610, 262, 70, C.navy, 2, '8s')}</g></g>
${T(40, 150, 30, 'Water Breaking', C.navy)}${T(40, 186, 30, 'PLTS Terapung', C.navy)}
${T(40, 214, 13, 'Ilustrasi, ganti dengan', C.n75, 400)}${T(40, 232, 13, 'footage lapangan', C.n75, 400)}`)
  });

  add({
    id: 'chevron-chapter', name: 'Chevron Chapter Push', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Pembatas bab bergradient diagonal dengan chevron lime-teal yang mendorong masuk. Penanda struktur video panjang.',
    when: 'Pergantian bab pada video laporan tahunan, webinar, materi pelatihan panjang.',
    aud: 'Semua audiens', formats: ['16:9'], dur: '3–4 dtk per bab', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Chevron Push', palette: [C.cyan, C.azure, C.deep, C.lime, C.teal],
    type: 'PT Sans Bold 54 px untuk judul bab, italic untuk subjudul',
    beats: ['Gradient cover masuk', 'Chevron mendorong dari kiri', 'Nomor bab dan judul muncul', 'Cross-fade ke isi bab'],
    dont: ['Jangan dua chevron dalam satu layar', 'Nomor bab dua digit (01, 02)'],
    svg: p => svg(p, `<rect width="640" height="360" fill="url(#${p}C)"/>
<linearGradient id="${p}ch" x1="0" x2="1"><stop offset="0" stop-color="#C4E137"/><stop offset=".6" stop-color="#7BCD7B"/><stop offset="1" stop-color="#50C3A0"/></linearGradient>
<g class="a-push"><polygon points="0,40 250,180 0,320" fill="url(#${p}ch)"/></g>
<g class="a-up" ${d(.7)}>${T(300, 150, 22, 'BAB 02', C.yellow, 700, 'letter-spacing="4"')}${T(300, 200, 42, 'Portofolio', C.white)}${T(300, 244, 42, 'Pembangkit', C.white)}${T(300, 278, 18, 'Surya, angin, panas bumi, air', C.n25, 400, 'font-style="italic"')}</g>`)
  });

  add({
    id: 'wave-edge', name: 'Wave Edge Flow', cat: 'Signature PLN NR', tier: 'Signature',
    desc: 'Pita gelombang di tepi kanan dan bawah bergerak perlahan, konten tetap di area putih. Gaya paling aman untuk materi informatif panjang.',
    when: 'Video informasi internal, webinar, rekap rapat, pengumuman resmi.',
    aud: 'Karyawan, manajemen', formats: ['16:9'], dur: '30–180 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Wave Wipe', palette: [C.white, C.navy, C.teal, C.lime, C.yellow],
    type: 'PT Sans Bold 48 px judul halaman, Regular 16–22 px isi',
    beats: ['Judul kiri atas, lockup kanan atas', 'Poin isi muncul bertahap', 'Gelombang tepi bergerak terus', 'Wave wipe ke halaman berikutnya'],
    dont: ['Konten tidak boleh masuk area gelombang (78 px kanan)', 'Jangan percepat gelombang'],
    svg: p => {
      const wave = (o, c, t) => `<path class="a-wave" style="--t:${t}s" d="M${560 + o} -40 C${600 + o} 40 ${520 + o} 120 ${570 + o} 200 C${610 + o} 280 ${540 + o} 340 ${575 + o} 420 L700 420 L700 -40 Z" fill="${c}"/>`;
      return svg(p, `<rect width="640" height="360" fill="#fff"/>${wave(0, C.yellow, 7)}${wave(14, C.lime, 6)}${wave(28, C.teal, 5.4)}${wave(44, C.cyan, 4.8)}${wave(60, C.deep, 4.2)}
${T(48, 80, 30, 'Rekap Rapat Koordinasi', C.navy)}
${[0, 1, 2].map(i => `<g class="a-up" ${d(.4 + i * .5)}><rect x="48" y="${120 + i * 54}" width="26" height="26" fill="${C.cyan}"/>${T(61, 139 + i * 54, 15, String(i + 1), '#fff', 700, 'text-anchor="middle"')}${T(90, 139 + i * 54, 18, ['Progres konstruksi sesuai rencana', 'Dokumen izin lingkungan lengkap', 'Jadwal uji coba ditetapkan'][i], C.navy, 400)}</g>`).join('')}
${T(48, 330, 12, 'www.ptplnnr.com', C.n75, 400)}`);
    }
  });

  /* ========== RUMPUN 2 — DATA & EKSEKUTIF ========== */
  add({
    id: 'answer-first', name: 'Answer-First Data Story', cat: 'Data & Eksekutif', tier: 'Inti',
    desc: 'Judul aksi berupa kalimat kesimpulan, lalu satu grafik membuktikannya. Satu batang cyan sebagai sinyal, sisanya navy. Metode deck konsultan dalam gerak.',
    when: 'Video ringkasan untuk Direksi, laporan kinerja, materi RUPS, briefing pendanaan.',
    aud: 'Direksi, Dekom, pemegang saham', formats: ['16:9'], dur: '30–90 dtk', pace: 'Sedang',
    ease: 'entrance', transition: 'Cross-fade 220 ms', palette: [C.white, C.navy, C.cyan, C.n25, C.paper],
    type: 'PT Sans Bold 30 px judul aksi (sentence case), angka tabular',
    beats: ['Judul aksi terketik penuh', 'Batang konteks tumbuh (navy)', 'Batang bukti tumbuh terakhir (cyan)', 'Kotak so-what menegaskan satu angka'],
    dont: ['Tanpa gridline, tanpa legenda bila label langsung bisa', 'Wajib baris Sumber di setiap angka'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'arc-kpi', name: 'Gradient Arc KPI', cat: 'Data & Eksekutif', tier: 'Inti',
    desc: 'Busur gradient terbuka dengan cakram navy di tengah, menghitung naik ke angka akhir. Satu-satunya bentuk grafik asli template PLN NR.',
    when: 'Capaian KPI, persentase progres proyek, bauran energi, rasio kepatuhan.',
    aud: 'Manajemen, publik', formats: ['16:9', '1:1', '9:16'], dur: '8–20 dtk', pace: 'Sedang',
    ease: 'emphasis', transition: 'Count-Up', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan],
    type: 'PT Sans Bold angka tabular 40–64 px di tengah cakram',
    beats: ['Cakram navy muncul', 'Busur gradient tergambar searah jarum jam', 'Angka menghitung naik', 'Label UPPERCASE di bawah'],
    dont: ['Maksimal tiga busur per layar', 'Tahan angka final minimal 1,5 dtk'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'waterfall', name: 'Waterfall Bridge', cat: 'Data & Eksekutif', tier: 'Inti',
    desc: 'Jembatan angka yang melangkah dari nilai awal ke nilai akhir, setiap batang menjelaskan satu penyebab perubahan.',
    when: 'Menjelaskan perubahan CAPEX, LCOE, EBITDA, atau kebutuhan pendanaan.',
    aud: 'Direksi, lender, investor', formats: ['16:9'], dur: '20–45 dtk', pace: 'Sedang',
    ease: 'entrance', transition: 'Cross-fade 220 ms', palette: [C.navy, C.cyan, C.teal, C.n25],
    type: 'PT Sans Bold label nilai di ujung batang, ▲/▼ selalu menyertai warna',
    beats: ['Batang awal muncul', 'Langkah naik/turun satu per satu dengan garis penghubung', 'Batang akhir cyan', 'Callout penyebab terbesar'],
    dont: ['Jangan pakai merah untuk penurunan; pakai ▼ navy', 'Maksimal 6 langkah'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'nusantara-map', mode: 'expressive', name: 'Nusantara Portfolio Map', cat: 'Data & Eksekutif', tier: 'Signature',
    desc: 'Peta kepulauan bergaya datar dengan pin pembangkit yang berdenyut dan busur koneksi. Menunjukkan sebaran portofolio dalam satu pandangan.',
    when: 'Profil perusahaan, pitch kemitraan, laporan tahunan, pameran.',
    aud: 'Investor, mitra, publik', formats: ['16:9', '1:1'], dur: '15–40 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Lens Iris', palette: [C.navy, C.deep, C.cyan, C.yellow, C.lime],
    type: 'PT Sans Bold kode pembangkit (PLTS, PLTB, PLTP, PLTA), Regular nama lokasi',
    beats: ['Peta kepulauan tergambar', 'Kamera mendekat ke wilayah', 'Pin muncul per jenis pembangkit', 'Total kapasitas terhitung naik'],
    dont: ['Lokasi pin harus diverifikasi sebelum rilis', 'Jangan pakai peta satelit berwarna'],
    svg: p => {
      const isl = `<g fill="${C.deep}">
<path d="M40 120 C70 90 120 110 150 150 C170 180 200 200 210 230 C180 236 150 210 120 190 C90 170 60 150 40 120Z"/>
<path d="M200 248 C240 240 300 244 340 252 C330 262 260 264 210 260Z"/>
<path d="M230 120 C260 90 320 96 330 130 C336 160 300 190 270 186 C240 182 220 150 230 120Z"/>
<path d="M370 120 C390 110 400 140 420 136 C410 156 396 170 386 196 C376 176 360 150 370 120Z"/>
<path d="M360 262 C390 258 420 262 440 268 C420 274 380 272 360 262Z"/>
<path d="M480 140 C530 120 600 140 620 180 C600 210 540 200 500 190 C470 180 460 160 480 140Z"/></g>`;
      const pins = [[120, 160, 'PLTP', C.lime], [280, 140, 'PLTS', C.yellow], [300, 250, 'PLTA', C.cyan], [392, 160, 'PLTB', C.teal], [560, 170, 'PLTS', C.yellow]];
      let g = `<rect width="640" height="360" fill="${C.navy}"/>${isl}<path class="a-flow" style="--dash:4 6;--len:10;--t:1s" d="M120 160 Q200 80 280 140 Q340 180 392 160 Q480 120 560 170" fill="none" stroke="${C.n50}" stroke-width="1.5"/>`;
      pins.forEach(([x, y, l, c], i) => {
        g += `<circle class="a-ping" ${d(i * .4)} cx="${x}" cy="${y}" r="8" fill="none" stroke="${c}" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="${c}"/><g class="a-up" ${d(.3 + i * .3)}><rect x="${x + 9}" y="${y - 24}" width="40" height="16" fill="#fff"/>${T(x + 29, y - 12, 10, l, C.navy, 700, 'text-anchor="middle"')}</g>`;
      });
      g += `${T(30, 330, 20, 'Portofolio pembangkit EBT', '#fff')}${T(330, 330, 11, 'Peta dan lokasi ilustratif', C.n25, 400)}`;
      return svg(p, g);
    }
  });

  add({
    id: 'transit-roadmap', name: 'Transit Line Roadmap', cat: 'Data & Eksekutif', tier: 'Inti',
    desc: 'Rencana jangka panjang digambar sebagai jalur transit: tiap jalur adalah program, tiap stasiun adalah tonggak. Kereta cahaya bergerak sepanjang jalur.',
    when: 'RJPP, peta jalan NZE, jadwal proyek multi-tahun, roadmap digitalisasi.',
    aud: 'Direksi, Dekom, regulator', formats: ['16:9'], dur: '30–60 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.teal, C.lime],
    type: 'PT Sans Bold nama stasiun, angka tahun tabular',
    beats: ['Sumbu waktu tergambar', 'Jalur program tergambar satu per satu', 'Stasiun tonggak menyala', 'Kereta cahaya berjalan sampai tahun target'],
    dont: ['Maksimal 4 jalur', 'Setiap stasiun maksimal 2 kata'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>${T(40, 46, 20, 'Peta jalan transisi energi', C.navy)}`;
      ['2025', '2030', '2040', '2050', '2060'].forEach((y, i) => g += `${T(70 + i * 130, 330, 12, y, C.n75, 700, 'text-anchor="middle"')}<line x1="${70 + i * 130}" y1="80" x2="${70 + i * 130}" y2="312" stroke="${C.paper}" stroke-width="2"/>`);
      const lines = [[C.cyan, 'M40 110 L330 110 L380 150 L610 150', 'Surya'], [C.teal, 'M40 190 L200 190 L250 150 L330 150 L380 190 L610 190', 'Angin'], [C.lime, 'M40 260 L460 260 L510 230 L610 230', 'Penyimpanan']];
      lines.forEach(([c, dd, n], i) => {
        g += `<path class="a-draw" style="--len:700;--d:${i * .4}s;--t:7s" d="${dd}" fill="none" stroke="${c}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>${T(44, Number(dd.split(' ')[1]) - 12, 12, n.toUpperCase(), C.navy, 700, 'letter-spacing="1.5"')}`;
      });
      [[200, 110], [460, 150], [330, 150], [520, 190], [460, 260], [600, 230]].forEach(([x, y], i) => g += `<circle class="a-pop" ${d(1 + i * .25)} cx="${x}" cy="${y}" r="8" fill="#fff" stroke="${C.navy}" stroke-width="3"/>`);
      g += `<circle class="a-train" r="6" fill="${C.yellow}" stroke="${C.navy}" stroke-width="2"><animateMotion dur="6s" repeatCount="indefinite" path="M40 110 L330 110 L380 150 L610 150"/></circle>`;
      return svg(p, g);
    }
  });

  add({
    id: 'isotype', name: 'ISOTYPE Count', cat: 'Data & Eksekutif', tier: 'Inti',
    desc: 'Satu simbol mewakili satu satuan, berderet mengisi layar. Membuat angka abstrak (MWh, ton CO₂) terasa nyata bagi publik.',
    when: 'Dampak lingkungan, manfaat sosial, ESG report, kampanye publik.',
    aud: 'Publik, lender, komunitas', formats: ['16:9', '1:1', '9:16'], dur: '10–25 dtk', pace: 'Sedang',
    ease: 'emphasis', transition: 'Count-Up', palette: [C.white, C.navy, C.cyan, C.n25],
    type: 'PT Sans Bold angka kunci, Regular kalimat satuan',
    beats: ['Satu simbol dan definisi satuannya', 'Deret simbol terisi kiri ke kanan', 'Angka total terhitung', 'Kalimat dampak dengan sumber'],
    dont: ['Wajib cantumkan faktor konversi dan sumber', 'Simbol hanya bentuk geometris sederhana, satu warna'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'live-ops', name: 'Live Ops Dashboard', cat: 'Data & Eksekutif', tier: 'Spesialis',
    desc: 'Ruang kendali digital: grafik produksi berjalan, gauge, status unit dengan glyph ▲●▼. Terasa real-time tanpa harus memakai data live.',
    when: 'Laporan kinerja bulanan, demo command center, video monitoring pembangkit.',
    aud: 'Manajemen, operator, mitra teknis', formats: ['16:9'], dur: '20–60 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.navy, '#003A5C', C.cyan, C.yellow, C.teal],
    type: 'PT Sans Bold angka tabular; label UPPERCASE 11 px tracking 0,1em',
    beats: ['Panel-panel menyala bertahap', 'Grafik produksi bergulir', 'Status unit berganti dengan glyph', 'Zoom ke satu angka kunci'],
    dont: ['Status tidak boleh hanya warna; selalu ▲●▼', 'Jangan tampilkan data operasional rahasia'],
    svg: p => {
      const pts = Array.from({ length: 30 }, (_, i) => `${i * 22},${60 + Math.sin(i * .7) * 22 + Math.cos(i * 1.3) * 10}`).join(' ');
      let g = `<rect width="640" height="360" fill="#003A5C"/>
<rect x="20" y="20" width="400" height="200" fill="${C.navy}"/>${T(36, 44, 11, 'PRODUKSI HARIAN (MWh)', C.n25, 700, 'letter-spacing="1.5"')}
<svg x="36" y="60" width="370" height="150" viewBox="0 0 330 130"><g class="a-slide" style="--from:0px;--to:-154px;--t:6s"><polyline points="${pts}" fill="none" stroke="${C.cyan}" stroke-width="2.5"/></g></svg>
<rect x="436" y="20" width="184" height="200" fill="${C.navy}"/>${T(452, 44, 11, 'KETERSEDIAAN', C.n25, 700, 'letter-spacing="1.5"')}
<circle cx="528" cy="128" r="56" fill="none" stroke="#003A5C" stroke-width="12"/><circle class="a-arc" style="--len:352;--arc:32" cx="528" cy="128" r="56" fill="none" stroke="url(#${p}E)" stroke-width="12" stroke-dasharray="352" stroke-dashoffset="32" transform="rotate(-90 528 128)"/>${T(528, 138, 28, '91%', '#fff', 700, 'text-anchor="middle"')}`;
      ['UNIT 1', 'UNIT 2', 'UNIT 3', 'UNIT 4'].forEach((u, i) => {
        const st = ['▲', '●', '▲', '▼'][i];
        g += `<rect x="${20 + i * 152}" y="236" width="144" height="104" fill="${C.navy}"/>${T(36 + i * 152, 262, 11, u, C.n25, 700, 'letter-spacing="1.5"')}${T(36 + i * 152, 304, 30, ['24,1', '18,7', '22,9', '9,4'][i], '#fff')}<g class="a-pulse" ${d(i * .5)}>${T(140 + i * 152, 304, 20, st, i === 3 ? C.yellow : C.cyan, 700)}</g>${T(36 + i * 152, 326, 11, 'MW · ilustratif', C.n50, 400)}`;
      });
      return svg(p, g);
    }
  });

  /* ========== RUMPUN 3 — TEKNIK & ENGINEERING ========== */
  add({
    id: 'blueprint', name: 'Engineering Blueprint', cat: 'Teknik & Engineering', tier: 'Inti',
    desc: 'Kertas biru PLN NR dengan grid gambar teknik, garis putih tergambar, dimensi dan anotasi muncul. Kredibilitas teknis tanpa kehilangan merek.',
    when: 'Layout PLTS, desain bendungan, konsep pembangkit untuk presentasi teknis dan lender engineer.',
    aud: 'Tim teknis, lender engineer, EPC', formats: ['16:9'], dur: '30–90 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.deep, C.white, C.n25, C.yellow],
    type: 'PT Sans Bold anotasi UPPERCASE; angka dimensi tabular',
    beats: ['Grid kertas biru', 'Batas lahan tergambar', 'Blok array panel muncul berurutan', 'Garis dimensi dan label kapasitas'],
    dont: ['Dimensi ilustratif harus diberi tanda', 'Satu warna aksen (kuning) untuk sorotan'],
    svg: p => {
      let g = `<pattern id="${p}gr" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 L0 0 0 20" fill="none" stroke="#2E7FA6" stroke-width=".6"/></pattern><rect width="640" height="360" fill="${C.deep}"/><rect width="640" height="360" fill="url(#${p}gr)"/>
<path class="a-draw" style="--len:1500" d="M60 60 L520 60 L580 140 L580 300 L60 300 Z" fill="none" stroke="#fff" stroke-width="2"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) g += `<rect class="a-pop" style="--d:${(.6 + (r * 6 + c) * .06).toFixed(2)}s" x="${90 + c * 70}" y="${90 + r * 50}" width="58" height="32" fill="none" stroke="#fff" stroke-width="1.4"/>`;
      g += `<g class="a-up" ${d(2.2)}><line x1="90" y1="318" x2="508" y2="318" stroke="${C.yellow}" stroke-width="1.5"/><line x1="90" y1="312" x2="90" y2="324" stroke="${C.yellow}"/><line x1="508" y1="312" x2="508" y2="324" stroke="${C.yellow}"/>${T(299, 344, 12, '418 m (ilustratif)', C.yellow, 700, 'text-anchor="middle"')}</g>
${T(440, 40, 12, 'LAYOUT ARRAY — REV.A', '#fff', 700, 'letter-spacing="2"')}`;
      return svg(p, g);
    }
  });

  add({
    id: 'isometric-plant', name: 'Isometric Plant', cat: 'Teknik & Engineering', tier: 'Inti',
    desc: 'Pembangkit dalam sudut isometrik: deret panel, BESS, gardu induk, jalur listrik dengan partikel energi berjalan. Cara paling jelas menjelaskan cara kerja sistem.',
    when: 'Explainer cara kerja PLTS + BESS, hybrid, microgrid; materi edukasi dan pitch.',
    aud: 'Umum, mitra, mahasiswa', formats: ['16:9', '1:1'], dur: '45–120 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.paper, C.navy, C.cyan, C.azure, C.yellow],
    type: 'PT Sans Bold callout UPPERCASE dengan garis penunjuk',
    beats: ['Tanah isometrik muncul', 'Komponen tersusun satu per satu', 'Partikel energi mengalir panel → BESS → jaringan', 'Callout tiap komponen'],
    dont: ['Sudut isometrik konsisten 30°', 'Tanpa bayangan blur; kedalaman lewat warna sisi'],
    svg: p => {
      const iso = (x, y, w, dpt, h, top, left, right) => `<path d="M${x} ${y} l${w} ${-w / 2} l${dpt} ${dpt / 2} l${-w} ${w / 2}Z" fill="${top}"/><path d="M${x} ${y} l${dpt} ${dpt / 2} l0 ${h} l${-dpt} ${-dpt / 2}Z" fill="${left}"/><path d="M${x + dpt} ${y + dpt / 2} l${w} ${-w / 2} l0 ${h} l${-w} ${w / 2}Z" fill="${right}"/>`;
      let g = `<rect width="640" height="360" fill="${C.paper}"/><path d="M320 70 L620 220 L320 370 L20 220Z" fill="#E3EEF5"/>`;
      for (let i = 0; i < 4; i++) g += `<g class="a-up" ${d(i * .2)}>${iso(110 + i * 34, 220 + i * 17, 120, 22, 6, C.azure, C.navy, C.deep)}</g>`;
      g += `<g class="a-up" ${d(1)}>${iso(400, 230, 60, 40, 34, '#fff', C.n25, C.n50)}</g><g class="a-up" ${d(1.2)}>${iso(480, 150, 40, 30, 50, C.n25, C.n50, C.n75)}</g>
<path class="a-flow" style="--dash:3 9;--len:12;--t:.8s" d="M260 200 L420 270 L500 230 L560 160" fill="none" stroke="${C.yellow}" stroke-width="4" stroke-linecap="round"/>
<g class="a-up" ${d(1.6)}>${T(120, 300, 12, 'ARRAY PANEL', C.navy, 700, 'letter-spacing="1.5"')}${T(380, 320, 12, 'BESS', C.navy, 700, 'letter-spacing="1.5"')}${T(500, 120, 12, 'GARDU INDUK', C.navy, 700, 'letter-spacing="1.5"')}</g>`;
      return svg(p, g);
    }
  });

  add({
    id: 'cutaway', name: 'Mechanical Cutaway', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Potongan nacelle turbin atau turbin air memperlihatkan rotor, gearbox, generator bergerak. Untuk penjelasan yang butuh melihat ke dalam mesin.',
    when: 'Explainer cara kerja PLTB, PLTA, PLTP; pelatihan teknisi; pameran teknologi.',
    aud: 'Teknisi, mahasiswa, mitra teknis', formats: ['16:9'], dur: '45–90 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.n25, C.yellow],
    type: 'PT Sans Bold label komponen, Regular deskripsi satu baris',
    beats: ['Eksterior utuh', 'Cangkang membuka (cutaway)', 'Komponen berputar sesuai rantai daya', 'Label muncul mengikuti aliran energi'],
    dont: ['Proporsi komponen jangan diklaim akurat tanpa gambar teknik', 'Maksimal 5 label'],
    svg: p => {
      const gear = (x, y, r, t, rev) => { let teeth = ''; for (let i = 0; i < 12; i++) { const a = i * 30; teeth += `<rect x="${x - 4}" y="${y - r - 8}" width="8" height="10" fill="${C.navy}" transform="rotate(${a} ${x} ${y})"/>`; } return `<g class="a-spin" style="--t:${t}s;transform-origin:${x}px ${y}px;animation-direction:${rev ? 'reverse' : 'normal'}">${teeth}<circle cx="${x}" cy="${y}" r="${r}" fill="${C.navy}"/><circle cx="${x}" cy="${y}" r="${r * .35}" fill="#fff"/></g>`; };
      return svg(p, `<rect width="640" height="360" fill="#fff"/>
<path d="M150 120 L520 110 Q580 150 520 230 L150 220 Z" fill="${C.paper}" stroke="${C.navy}" stroke-width="2"/>
<path d="M150 120 L520 110 Q560 130 560 150 L150 150Z" fill="${C.n25}" class="a-lid"/>
<g class="a-spin" style="--t:4s;transform-origin:110px 170px"><ellipse cx="110" cy="80" rx="10" ry="78" fill="${C.azure}"/><ellipse cx="110" cy="260" rx="10" ry="78" fill="${C.azure}"/></g><circle cx="110" cy="170" r="22" fill="${C.navy}"/>
<rect x="130" y="164" width="120" height="12" fill="${C.n50}"/>
${gear(290, 170, 30, 4, false)}${gear(352, 170, 18, 2.4, true)}
<rect x="400" y="140" width="90" height="60" fill="${C.cyan}"/><rect class="a-pulse" x="410" y="150" width="70" height="40" fill="${C.yellow}" opacity=".5"/>
<rect x="330" y="230" width="20" height="120" fill="${C.n50}"/>
${T(240, 70, 12, 'GEARBOX', C.navy, 700, 'letter-spacing="1.5"')}<line x1="270" y1="76" x2="290" y2="130" stroke="${C.navy}"/>
${T(420, 70, 12, 'GENERATOR', C.navy, 700, 'letter-spacing="1.5"')}<line x1="445" y1="76" x2="445" y2="138" stroke="${C.navy}"/>
${T(60, 330, 12, 'ROTOR', C.navy, 700, 'letter-spacing="1.5"')}`);
    }
  });

  add({
    id: 'wireframe', name: 'Hidden-Line Wireframe', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Model rangka garis di atas lantai perspektif, berputar pelan. Kesan rekayasa digital, digital twin, dan teknologi masa depan.',
    when: 'Teknologi baru (digital twin, BESS, hidrogen hijau), pitch inovasi, pameran.',
    aud: 'Mitra teknologi, investor, Direksi', formats: ['16:9', '9:16'], dur: '10–30 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.navy, C.cyan, C.n50, C.yellow],
    type: 'PT Sans Bold 11 px label teknis, monospace untuk koordinat',
    beats: ['Lantai grid perspektif', 'Rangka objek tergambar', 'Objek berputar 30°', 'Satu titik sorot kuning'],
    dont: ['Jangan glow berlebihan', 'Satu objek utama per adegan'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.navy}"/>`;
      for (let i = 0; i <= 12; i++) g += `<line x1="${320 + (i - 6) * 20}" y1="230" x2="${320 + (i - 6) * 110}" y2="360" stroke="${C.n75}" stroke-width="1"/>`;
      for (let j = 0; j < 6; j++) { const y = 230 + j * j * 4.4; g += `<line x1="0" y1="${y}" x2="640" y2="${y}" stroke="${C.n75}" stroke-width="1"/>`; }
      g += `<g fill="none" stroke="${C.cyan}" stroke-width="1.6"><path class="a-draw" style="--len:400" d="M310 240 L316 90 L324 90 L330 240 Z M312 190 L328 190 M313 140 L327 140"/></g>
<g class="a-spin" style="--t:7s;transform-origin:320px 86px" fill="none" stroke="${C.cyan}" stroke-width="1.6"><path d="M320 86 L316 10 L324 10 Z"/><path d="M320 86 L386 124 L382 131 Z"/><path d="M320 86 L254 124 L258 131 Z"/></g>
<circle cx="320" cy="86" r="6" fill="none" stroke="${C.yellow}" stroke-width="2"/><circle class="a-ping" cx="320" cy="86" r="8" fill="none" stroke="${C.yellow}" stroke-width="1.5"/>
${T(400, 60, 11, 'HUB · H 120 m', C.yellow, 700, 'letter-spacing="1.5"')}<line x1="398" y1="64" x2="330" y2="84" stroke="${C.yellow}"/>
${T(30, 40, 11, 'DIGITAL TWIN — MODEL KONSEP', C.n25, 700, 'letter-spacing="2"')}`;
      return svg(p, g);
    }
  });

  add({
    id: 'energy-sankey', name: 'Energy Flow Sankey', cat: 'Teknik & Engineering', tier: 'Inti',
    desc: 'Aliran energi dari sumber ke konsumen sebagai pita yang mengalir. Lebar pita sebanding dengan nilai, partikel bergerak menunjukkan arah.',
    when: 'Bauran energi, neraca daya, jalur dekarbonisasi, alokasi pendanaan.',
    aud: 'Regulator, Direksi, publik terdidik', formats: ['16:9'], dur: '20–40 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.white, C.yellow, C.teal, C.lime, C.cyan, C.navy],
    type: 'PT Sans Bold label sumber, angka tabular di ujung pita',
    beats: ['Kolom sumber muncul', 'Pita mengalir ke tengah', 'Pita bercabang ke penggunaan', 'Sorot satu aliran terbesar'],
    dont: ['Lebar pita harus proporsional', 'Maksimal 5 sumber'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>`;
      const src = [['Surya', C.yellow, 60, 34], ['Angin', C.lime, 130, 24], ['Panas bumi', C.teal, 190, 30], ['Air', C.cyan, 256, 40]];
      src.forEach(([n, c, y, w], i) => {
        g += `<rect x="40" y="${y - w / 2}" width="12" height="${w}" fill="${c}"/>${T(60, y - w / 2 - 6, 12, n, C.navy, 700)}
<path class="a-wipe" style="--d:${.2 + i * .25}s" d="M52 ${y} C250 ${y} 330 180 560 180" fill="none" stroke="${c}" stroke-width="${w}" opacity=".55"/>
<path class="a-flow" style="--dash:2 16;--len:18;--t:1s" d="M52 ${y} C250 ${y} 330 180 560 180" fill="none" stroke="${C.navy}" stroke-width="2" opacity=".5"/>`;
      });
      g += `<rect x="560" y="116" width="40" height="128" fill="${C.navy}"/>${T(580, 106, 12, 'Jaringan', C.navy, 700, 'text-anchor="middle"')}${T(40, 340, 10, 'Proporsi ilustratif', C.n75, 400)}`;
      return svg(p, g);
    }
  });

  add({
    id: 'single-line', name: 'Single-Line Diagram Pulse', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Diagram satu garis kelistrikan dengan simbol standar; denyut arus berjalan dari generator ke busbar. Bahasa visual operator dan engineer listrik.',
    when: 'Pelatihan operator, penjelasan interkoneksi, studi sistem, investigasi gangguan.',
    aud: 'Operator, engineer, PLN UIP/UIW', formats: ['16:9'], dur: '30–90 dtk', pace: 'Sedang',
    ease: 'linear (aliran)', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.yellow],
    type: 'Monospace untuk tag peralatan, PT Sans untuk judul',
    beats: ['Busbar tergambar', 'Peralatan muncul dengan tag', 'Breaker menutup', 'Denyut arus mengalir ke jaringan'],
    dont: ['Gunakan simbol IEC yang benar', 'Tag peralatan sesuai dokumen resmi'],
    svg: p => {
      const cb = (x, y) => `<rect x="${x - 9}" y="${y - 9}" width="18" height="18" fill="#fff" stroke="${C.navy}" stroke-width="2"/>`;
      const tr = (x, y) => `<circle cx="${x}" cy="${y - 8}" r="13" fill="none" stroke="${C.navy}" stroke-width="2"/><circle cx="${x}" cy="${y + 8}" r="13" fill="none" stroke="${C.navy}" stroke-width="2"/>`;
      let g = `<rect width="640" height="360" fill="#fff"/><line x1="60" y1="70" x2="580" y2="70" stroke="${C.navy}" stroke-width="5"/>${T(590, 74, 11, '150 kV', C.navy, 700, 'font-family="ui-monospace,monospace"')}`;
      [140, 320, 500].forEach((x, i) => {
        g += `<line x1="${x}" y1="70" x2="${x}" y2="300" stroke="${C.navy}" stroke-width="2"/>${cb(x, 110)}${tr(x, 170)}${cb(x, 230)}<circle cx="${x}" cy="290" r="18" fill="#fff" stroke="${C.navy}" stroke-width="2"/>${T(x, 296, 14, 'G', C.navy, 700, 'text-anchor="middle"')}${T(x + 22, 114, 10, 'CB-0' + (i + 1), C.n75, 700, 'font-family="ui-monospace,monospace"')}
<line class="a-flow" style="--dash:10 40;--len:50;--t:1.4s;animation-direction:reverse;--d:${i * .3}s" x1="${x}" y1="300" x2="${x}" y2="70" stroke="${C.cyan}" stroke-width="5"/>`;
      });
      g += `<line class="a-flow" style="--dash:14 30;--len:44;--t:1.6s" x1="60" y1="70" x2="580" y2="70" stroke="${C.yellow}" stroke-width="3"/>${T(40, 340, 10, 'Skema ilustratif', C.n75, 400)}`;
      return svg(p, g);
    }
  });

  add({
    id: 'thermal-inspection', name: 'Thermal Drone Inspection', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Pandangan drone termal di atas array panel memakai ramp energi PLN NR sebagai skala panas. Garis pindai bergerak, hotspot berdenyut dan diberi label.',
    when: 'Video O&M, inspeksi aset, digitalisasi pemeliharaan, laporan keandalan.',
    aud: 'Tim O&M, manajemen aset', formats: ['16:9', '9:16'], dur: '15–45 dtk', pace: 'Sedang',
    ease: 'linear (pindai)', transition: 'Cross-fade 220 ms', palette: [C.navy, C.deep, C.teal, C.lime, C.yellow],
    type: 'Monospace untuk HUD (suhu, koordinat), PT Sans Bold untuk temuan',
    beats: ['Footage drone biasa', 'Beralih ke mode termal', 'Garis pindai menemukan hotspot', 'Kartu temuan dan tindak lanjut'],
    dont: ['Skala warna wajib dengan legenda suhu', 'Jangan memakai palet pelangi'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#003A5C"/>`;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
        const hot = (r === 2 && c === 5) || (r === 3 && c === 1);
        g += `<rect x="${40 + c * 62}" y="${40 + r * 52}" width="54" height="44" fill="${hot ? C.yellow : (c + r) % 3 ? C.deep : C.teal}" ${hot ? `class="a-pulse"` : ''}/>`;
      }
      g += `<g class="a-scan" style="--y:250px"><rect x="30" y="34" width="580" height="3" fill="${C.lime}"/></g>
<rect x="352" y="140" width="62" height="56" fill="none" stroke="#fff" stroke-width="2"/>${T(420, 136, 12, 'HOTSPOT 71,4 °C', '#fff', 700, 'font-family="ui-monospace,monospace"')}
<rect x="600" y="40" width="10" height="250" fill="url(#${p}S)"/>${T(596, 38, 9, 'PANAS', C.n25, 700, 'text-anchor="end"')}${T(596, 300, 9, 'DINGIN', C.n25, 700, 'text-anchor="end"')}
${T(40, 330, 11, 'ALT 40 m · REKAMAN ILUSTRATIF', C.n25, 700, 'font-family="ui-monospace,monospace"')}`;
      return svg(p, g);
    }
  });

  /* ========== RUMPUN 4 — EDUKASI & EXPLAINER ========== */
  add({
    id: 'whiteboard', name: 'Whiteboard Explainer', cat: 'Edukasi & Explainer', tier: 'Inti',
    desc: 'Spidol navy menggambar diagram di papan putih, langkah demi langkah sesuai narasi. Hangat, jujur, cepat diproduksi.',
    when: 'Onboarding, sosialisasi kebijakan, explainer proses bisnis, pelatihan internal.',
    aud: 'Karyawan, mitra baru', formats: ['16:9'], dur: '60–180 dtk', pace: 'Sedang',
    ease: 'linear (gores)', transition: 'Line Draw', palette: ['#FBFDFE', C.navy, C.cyan, C.yellow],
    type: 'Tulisan tangan hanya untuk anotasi kecil; judul tetap PT Sans Bold',
    beats: ['Papan kosong', 'Gores diagram sesuai kalimat narator', 'Sorot kuning pada kata kunci', 'Ringkasan di pojok kanan'],
    dont: ['Jangan gambar logo dengan spidol', 'Satu konsep per papan'],
    svg: p => {
      const L = (dd, len, del, c = C.navy, w = 3) => `<path class="a-draw" style="--len:${len};--d:${del}s;--t:8s" d="${dd}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      return svg(p, `<rect width="640" height="360" fill="#FBFDFE"/>
${L('M100 100 m-30 0 a30 30 0 1 0 60 0 a30 30 0 1 0 -60 0 M100 50 L100 60 M100 140 L100 150 M50 100 L60 100 M140 100 L150 100', 300, 0)}
${L('M180 170 L280 170 L300 210 L200 210 Z M230 210 L230 240', 330, .8)}
${L('M140 120 Q170 140 200 160', 90, .6, C.cyan)}
${L('M330 180 L390 180 M380 170 L392 180 L380 190', 110, 1.6)}
${L('M410 150 L470 150 L470 210 L410 210 Z M425 170 Q440 160 455 180', 300, 2)}
${L('M490 180 L540 180 M530 170 L542 180 L530 190', 110, 2.6)}
${L('M560 130 L570 230 M590 130 L580 230 M556 160 L594 160 M558 190 L592 190', 300, 3)}
<rect class="a-wipe" style="--d:3.8s;--t:8s" x="196" y="262" width="128" height="22" fill="${C.yellow}" opacity=".7"/>
${T(200, 280, 18, 'panel surya', C.navy, 700)}${T(408, 280, 18, 'inverter', C.navy, 700)}${T(548, 260, 18, 'jaringan', C.navy, 700)}`);
    }
  });

  add({
    id: 'flat-explainer', name: 'Flat Vector People', cat: 'Edukasi & Explainer', tier: 'Inti',
    desc: 'Karakter vektor datar berseragam dan berhelm PLN NR, bergerak sederhana di dunia geometris. Wajah manusia untuk cerita proses.',
    when: 'Cerita karyawan, SOP layanan, rekrutmen, TJSL, cerita komunitas sekitar pembangkit.',
    aud: 'Karyawan, publik, komunitas', formats: ['16:9', '9:16', '1:1'], dur: '45–120 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.paper, C.navy, C.cyan, C.yellow, C.teal],
    type: 'PT Sans Bold balon dialog, maksimal 8 kata',
    beats: ['Lingkungan kerja diperkenalkan', 'Karakter masuk dan menyapa', 'Aksi utama (memeriksa panel)', 'Hasil dan pesan penutup'],
    dont: ['APD selalu lengkap dan benar', 'Hindari karikatur berlebihan'],
    svg: p => svg(p, `<rect width="640" height="360" fill="${C.paper}"/><rect y="280" width="640" height="80" fill="#E3EEF5"/>
<circle cx="540" cy="80" r="36" fill="${C.yellow}"/>
<g transform="translate(330 210) skewX(-20)">${panel(0, 0, 150, 70, C.azure, '#fff')}</g><rect x="360" y="280" width="6" height="0"/><line x1="380" y1="280" x2="372" y2="250" stroke="${C.navy}" stroke-width="5"/><line x1="460" y1="280" x2="452" y2="250" stroke="${C.navy}" stroke-width="5"/>
<g class="a-float" style="--amp:-4px;--t:2.4s">${person(200, 255, C.navy, C.yellow, 1.5)}</g>
<g class="a-up" ${d(.6)}><rect x="90" y="96" width="210" height="62" fill="#fff" stroke="${C.navy}" stroke-width="2"/><path d="M180 158 L196 176 L200 158Z" fill="#fff" stroke="${C.navy}" stroke-width="2"/>${T(106, 124, 15, 'Panel bersih, produksi', C.navy, 700)}${T(106, 146, 15, 'tetap optimal.', C.navy, 700)}</g>`)
  });

  add({
    id: 'paper-layers', name: 'Cut-Paper Layers', cat: 'Edukasi & Explainer', tier: 'Inti',
    desc: 'Lapisan kertas potong (laut, bukit, matahari) dalam ramp warna PLN NR, bergerak parallax lembut. Ramah, hangat, tetap rapi.',
    when: 'Cerita lingkungan, profil lokasi, edukasi sekolah, video TJSL.',
    aud: 'Publik, pelajar, komunitas', formats: ['16:9', '1:1', '9:16'], dur: '30–90 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Wave Wipe', palette: [C.yellow, C.lime, C.green, C.teal, C.cyan, C.deep],
    type: 'PT Sans Bold judul di langit, maksimal dua baris',
    beats: ['Langit dan matahari', 'Lapisan bukit naik satu per satu', 'Turbin dan panel muncul', 'Judul turun pelan'],
    dont: ['Bayangan antarlapis tipis dan tajam, tanpa blur besar', 'Maksimal 5 lapisan'],
    svg: p => svg(p, `<rect width="640" height="360" fill="#FFFBD6"/><circle cx="460" cy="120" r="54" fill="${C.yellow}"/>
<g class="a-float" style="--amp:-6px;--t:6s"><path d="M0 220 Q120 150 240 200 T480 180 T640 200 L640 360 L0 360Z" fill="${C.lime}"/></g>
<g class="a-float" style="--amp:-4px;--t:5s">${turbine(180, 230, 80, '#fff', 2.5, '5s')}${turbine(250, 220, 60, '#fff', 2, '4s')}<path d="M0 250 Q160 200 320 240 T640 230 L640 360 L0 360Z" fill="${C.green}"/></g>
<g class="a-float" style="--amp:-3px;--t:4s"><path d="M0 290 Q200 250 400 285 T640 280 L640 360 L0 360Z" fill="${C.teal}"/></g>
<path d="M0 320 Q220 300 420 322 T640 318 L640 360 L0 360Z" fill="${C.deep}"/>
<g class="a-up" ${d(.4)}>${T(40, 80, 30, 'Energi tumbuh', C.navy)}${T(40, 116, 30, 'bersama alam', C.navy)}</g>`)
  });

  add({
    id: 'kinetic-type', mode: 'expressive', name: 'Kinetic Typography', cat: 'Edukasi & Explainer', tier: 'Inti',
    desc: 'Kata-kata bergerak, bertumpuk, dan berganti skala mengikuti ritme narasi. Paling efektif untuk pesan pendek yang harus diingat.',
    when: 'Pesan Direksi, kampanye nilai, teaser acara, ringkasan 30 detik.',
    aud: 'Karyawan, publik muda', formats: ['9:16', '1:1', '16:9'], dur: '15–45 dtk', pace: 'Cepat',
    ease: 'emphasis', transition: 'Cross-fade 220 ms', palette: [C.white, C.navy, C.cyan, C.yellow],
    type: 'PT Sans Bold 700, 3 tingkat ukuran saja (display, sedang, kecil)',
    beats: ['Kata pembuka besar', 'Kata kedua menggeser kata pertama', 'Angka kunci membesar', 'Kunci dengan lockup'],
    dont: ['Kecepatan baca maksimal 3 kata per detik', 'Tanpa efek getar, glitch, atau elastic'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'glass-tech', name: 'Glass Tech Cards', cat: 'Edukasi & Explainer', tier: 'Spesialis',
    desc: 'Kartu kaca semi-transparan di atas gradient biru, terhubung oleh garis berdenyut. Cocok untuk arsitektur sistem dan platform digital.',
    when: 'Explainer sistem informasi, SCADA, ERP, digital twin, alur data.',
    aud: 'Tim TI, mitra teknologi, manajemen', formats: ['16:9'], dur: '30–90 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.deep, C.azure, C.cyan, C.white, C.yellow],
    type: 'PT Sans Bold judul kartu, Regular 1 baris keterangan',
    beats: ['Latar gradient biru', 'Kartu muncul per lapisan arsitektur', 'Garis data berdenyut antar kartu', 'Sorot alur kritis kuning'],
    dont: ['Efek kaca hanya untuk UI, tidak untuk foto', 'Maksimal 6 kartu'],
    svg: p => {
      const card = (x, y, t1, t2, del) => `<g class="a-up" ${d(del)}><rect x="${x}" y="${y}" width="150" height="72" fill="#fff" fill-opacity=".16" stroke="#fff" stroke-opacity=".5"/>${T(x + 14, y + 30, 15, t1, '#fff')}${T(x + 14, y + 52, 11, t2, '#E6F4FB', 400)}</g>`;
      return svg(p, `<rect width="640" height="360" fill="url(#${p}C)"/>
<path class="a-flow" style="--dash:6 8;--len:14;--t:1s" d="M190 96 L245 96 M395 96 L450 96 M320 132 L320 200 M245 236 L190 236" fill="none" stroke="${C.yellow}" stroke-width="2"/>
${card(40, 60, 'Sensor', 'Data lapangan', .1)}${card(245, 60, 'SCADA', 'Kendali real-time', .4)}${card(450, 60, 'Analitik', 'Prediksi gangguan', .7)}${card(245, 200, 'Digital Twin', 'Model aset', 1)}${card(40, 200, 'Dashboard', 'Keputusan', 1.3)}`);
    }
  });

  add({
    id: 'hex-rail', name: 'Numbered Hex Rail', cat: 'Edukasi & Explainer', tier: 'Signature',
    desc: 'Hexagon kuning bernomor di atas gradient biru, terhubung rel kuning 5 px yang terisi seiring langkah. Perangkat urutan resmi PLN NR.',
    when: 'SOP, tahapan pengadaan, alur persetujuan, langkah onboarding, proses kepatuhan.',
    aud: 'Karyawan, vendor, auditor', formats: ['16:9', '9:16'], dur: '20–60 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Wave Wipe', palette: [C.cyan, C.azure, C.deep, C.yellow, C.navy],
    type: 'Angka dua digit (01–06) PT Sans Bold biru di hexagon kuning',
    beats: ['Gradient biru', 'Rel mulai terisi', 'Tiap hexagon menyala saat rel tiba', 'Label langkah muncul di bawah'],
    dont: ['Maksimal 6 langkah per layar', 'Label maksimal 3 kata'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  /* ========== RUMPUN 5 — NUSANTARA & BUDAYA ========== */
  add({
    id: 'batik-generative', name: 'Batik Kawung Generative', cat: 'Nusantara & Budaya', tier: 'Signature',
    desc: 'Pola kawung tersusun secara generatif dalam ramp warna PLN NR, berputar dan berubah menjadi matahari. Identitas Indonesia yang modern.',
    when: 'Hari besar nasional, HUT perusahaan, pameran internasional, background panggung.',
    aud: 'Publik, tamu internasional', formats: ['16:9', '1:1', '9:16'], dur: '10–60 dtk (loop)', pace: 'Tenang',
    ease: 'linear (loop)', transition: 'Hex Bloom', palette: [C.navy, C.teal, C.lime, C.yellow, C.cyan],
    type: 'PT Sans Bold judul di bidang navy polos, tidak di atas pola',
    beats: ['Satu motif kawung', 'Motif berlipat menjadi pola', 'Pola berputar dan warnanya mengalir', 'Bidang navy membuka untuk judul'],
    dont: ['Hormati pakem motif; konsultasikan untuk motif sakral', 'Teks tidak boleh di atas pola padat'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.navy}"/>`;
      const cols = [C.teal, C.lime, C.yellow, C.cyan];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) {
        const x = 40 + c * 70, y = 40 + r * 70, k = (r + c) % 4;
        g += `<g class="a-spin" style="--t:${12 + k * 2}s;transform-origin:${x}px ${y}px;animation-delay:${-(r + c)}s">${[0, 90, 180, 270].map(a => `<ellipse cx="${x}" cy="${y - 17}" rx="10" ry="17" fill="${cols[(k + a / 90) % 4]}" opacity=".85" transform="rotate(${a} ${x} ${y})"/>`).join('')}</g><circle cx="${x}" cy="${y}" r="4" fill="${C.navy}"/>`;
      }
      g += `<rect x="150" y="128" width="340" height="104" fill="${C.navy}"/>${T(320, 175, 30, 'Dirgahayu', '#fff', 700, 'text-anchor="middle"')}${T(320, 210, 16, 'Republik Indonesia', C.yellow, 700, 'text-anchor="middle"')}`;
      return svg(p, g);
    }
  });

  add({
    id: 'wayang-silhouette', name: 'Wayang Shadow Story', cat: 'Nusantara & Budaya', tier: 'Spesialis',
    desc: 'Kelir bercahaya dengan siluet bertangkai, gunungan, dan turbin. Cara bercerita tradisi untuk pesan transisi energi.',
    when: 'Sosialisasi ke masyarakat, acara budaya, cerita sejarah kelistrikan, edukasi sekolah.',
    aud: 'Komunitas, pelajar, publik umum', formats: ['16:9'], dur: '60–180 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.navy, '#FFF7B0', C.yellow, C.deep],
    type: 'PT Sans Italic untuk narasi bertutur, Bold untuk judul babak',
    beats: ['Kelir menyala dari tengah', 'Gunungan masuk membuka cerita', 'Siluet tokoh dan turbin bergerak', 'Gunungan menutup babak'],
    dont: ['Jangan memakai tokoh wayang tertentu tanpa konsultasi', 'Tidak untuk konteks formal investor'],
    svg: p => svg(p, `<radialGradient id="${p}kel" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#FFF7B0"/><stop offset=".7" stop-color="${C.yellow}"/><stop offset="1" stop-color="${C.lime}"/></radialGradient>
<rect width="640" height="360" fill="${C.navy}"/><rect x="30" y="30" width="580" height="270" fill="url(#${p}kel)" class="a-pulse" style="--t:5s"/>
<g class="a-sway" style="transform-origin:200px 300px"><path d="M200 70 C150 120 140 200 160 270 L240 270 C260 200 250 120 200 70Z" fill="${C.navy}"/><line x1="200" y1="270" x2="200" y2="340" stroke="${C.navy}" stroke-width="4"/></g>
<g class="a-slide" style="--from:-20px;--to:30px;--t:7s">${turbine(420, 280, 150, C.navy, 4, '6s')}</g>
<path d="M320 290 Q330 200 360 190 Q370 220 350 290Z" fill="${C.navy}"/>
<rect x="0" y="300" width="640" height="60" fill="${C.deep}"/>${T(320, 336, 15, 'Babak I — Cahaya dari Angin', '#fff', 400, 'text-anchor="middle" font-style="italic"')}`)
  });

  add({
    id: 'watercolor', name: 'Watercolor Nusantara', cat: 'Nusantara & Budaya', tier: 'Inti',
    desc: 'Sapuan cat air transparan untuk langit, laut, dan waduk, dengan PLTS terapung tergambar halus. Lembut untuk cerita lingkungan dan manusia.',
    when: 'Laporan keberlanjutan, cerita biodiversitas, video TJSL, ucapan hari besar.',
    aud: 'Publik, lender ESG, komunitas', formats: ['16:9', '1:1'], dur: '20–60 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: ['#FCFDF7', C.cyan, C.teal, C.lime, C.yellow],
    type: 'PT Sans Bold judul, PT Sans Italic kutipan',
    beats: ['Kertas kosong', 'Sapuan langit menyebar', 'Waduk dan panel terapung muncul', 'Judul dan kutipan'],
    dont: ['Jangan tumpuk lebih dari 3 sapuan di satu area', 'Hindari warna di luar ramp brand'],
    svg: p => svg(p, `<filter id="${p}wc"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="4"/><feDisplacementMap in="SourceGraphic" scale="22"/></filter>
<rect width="640" height="360" fill="#FCFDF7"/>
<g filter="url(#${p}wc)"><ellipse class="a-breathe" style="--s:1.05;--t:6s" cx="320" cy="90" rx="320" ry="80" fill="${C.cyan}" opacity=".35"/><circle cx="480" cy="110" r="40" fill="${C.yellow}" opacity=".6"/>
<path d="M0 200 Q160 170 320 195 T640 190 L640 260 L0 260Z" fill="${C.lime}" opacity=".45"/>
<rect class="a-breathe" style="--s:1.02;--t:7s" x="0" y="240" width="640" height="120" fill="${C.teal}" opacity=".4"/></g>
<g class="a-float" style="--amp:-3px;--t:4s">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${170 + i * 64} 268) skewX(-25)"><rect width="54" height="16" fill="${C.navy}" opacity=".75"/></g>`).join('')}</g>
${T(40, 60, 28, 'Waduk yang bekerja dua kali', C.navy)}${T(40, 86, 15, 'Air untuk irigasi, permukaan untuk energi', C.n75, 400, 'font-style="italic"')}`)
  });

  add({
    id: 'travel-poster', name: 'Nusantara Travel Poster', cat: 'Nusantara & Budaya', tier: 'Inti',
    desc: 'Poster datar gaya pertengahan abad: gunung, uap panas bumi, sinar matahari, tipografi besar. Membanggakan lokasi pembangkit.',
    when: 'Seri profil lokasi, kampanye media sosial, merchandise, pameran.',
    aud: 'Publik, karyawan, tamu', formats: ['9:16', '1:1', '16:9'], dur: '8–20 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Chevron Push', palette: [C.yellow, C.lime, C.teal, C.deep, C.navy],
    type: 'PT Sans Bold UPPERCASE besar dengan tracking lebar untuk nama lokasi',
    beats: ['Langit bergradasi', 'Sinar matahari berputar pelan', 'Uap naik dari gunung', 'Nama lokasi terkunci di bawah'],
    dont: ['Nama lokasi harus sesuai aset resmi', 'Tanpa tekstur kertas tua berlebihan'],
    svg: p => {
      let rays = ''; for (let i = 0; i < 12; i++) rays += `<rect x="318" y="-60" width="4" height="120" fill="${C.yellow}" opacity=".5" transform="rotate(${i * 30} 320 130)"/>`;
      return svg(p, `<rect width="640" height="360" fill="url(#${p}S)"/>
<g class="a-spin" style="--t:30s;transform-origin:320px 130px">${rays}</g><circle cx="320" cy="130" r="46" fill="${C.yellow}"/>
<path d="M120 300 L280 120 L330 170 L360 140 L520 300Z" fill="${C.navy}"/><path d="M280 120 L310 154 L290 150 L270 160 L252 152Z" fill="#fff" opacity=".8"/>
${[0, 1, 2].map(i => `<circle class="a-steam" style="--d:${i * 1.2}s" cx="${330 + i * 8}" cy="150" r="${10 + i * 3}" fill="#fff" opacity=".7"/>`).join('')}
<rect y="290" width="640" height="70" fill="${C.deep}"/>${T(320, 336, 32, 'PANAS BUMI NUSANTARA', '#fff', 700, 'text-anchor="middle" letter-spacing="6"')}`);
    }
  });

  add({
    id: 'tenun-weave', name: 'Tenun Weave Lines', cat: 'Nusantara & Budaya', tier: 'Spesialis',
    desc: 'Benang-benang warna energi saling menganyam membentuk pola tenun, menjadi metafora kolaborasi dan jaringan listrik.',
    when: 'Kemitraan, sinergi grup PLN, pembuka forum, transisi tematik.',
    aud: 'Mitra, karyawan, publik', formats: ['16:9', '1:1'], dur: '8–20 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan],
    type: 'PT Sans Bold di panel navy tengah',
    beats: ['Benang vertikal turun', 'Benang horizontal menganyam', 'Pola terkunci', 'Judul di jendela tengah'],
    dont: ['Maksimal 5 warna benang dari ramp', 'Hindari motif tenun daerah tertentu tanpa izin konteks'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.navy}"/>`;
      const cols = [C.yellow, C.lime, C.teal, C.cyan, C.sky];
      for (let i = 0; i < 16; i++) g += `<rect class="a-grow" style="--d:${(i * .08).toFixed(2)}s;--t:7s" x="${20 + i * 38}" y="20" width="14" height="320" fill="${cols[i % 5]}" opacity=".85"/>`;
      for (let j = 0; j < 8; j++) g += `<rect class="a-wipe" style="--d:${(1.2 + j * .12).toFixed(2)}s;--t:7s" x="20" y="${30 + j * 40}" width="600" height="14" fill="${cols[(j + 2) % 5]}" opacity=".7"/>`;
      g += `<rect x="190" y="130" width="260" height="100" fill="${C.navy}"/>${T(320, 175, 26, 'Sinergi', '#fff', 700, 'text-anchor="middle"')}${T(320, 205, 14, 'Menganyam jaringan energi', C.n25, 400, 'text-anchor="middle"')}`;
      return svg(p, g);
    }
  });

  /* ========== RUMPUN 6 — KAMPANYE & SOSIAL ========== */
  add({
    id: 'vertical-reels', name: 'Vertical Reels Hook', cat: 'Kampanye & Sosial', tier: 'Inti',
    desc: 'Format 9:16 dengan hook 2 detik pertama, caption besar, progress bar, dan potongan cepat. Disiplin platform, tetap disiplin merek.',
    when: 'Instagram Reels, TikTok, YouTube Shorts, LinkedIn video vertikal.',
    aud: 'Publik muda, calon talenta', formats: ['9:16'], dur: '15–45 dtk', pace: 'Cepat',
    ease: 'emphasis', transition: 'Cross-fade 220 ms', palette: [C.navy, C.white, C.yellow, C.cyan],
    type: 'PT Sans Bold 64–80 px caption, maksimal 2 baris di zona aman tengah',
    beats: ['Hook pertanyaan atau angka dalam 2 dtk', 'Tiga potongan bukti 3–4 dtk', 'Caption mengikuti suara', 'CTA dan lockup 3 dtk'],
    dont: ['Jauhkan teks dari zona UI platform (atas 14%, bawah 20%)', 'Tanpa emoji di grafik'],
    svg: p => svg(p, `<rect width="640" height="360" fill="${C.paper}"/>
<g transform="translate(240 12)"><rect width="160" height="336" fill="${C.navy}"/><rect width="160" height="336" fill="none" stroke="${C.navy}" stroke-width="6"/>
<rect x="10" y="10" width="140" height="3" fill="#fff" opacity=".3"/><rect class="a-wipe" style="--t:5s" x="10" y="10" width="140" height="3" fill="${C.yellow}"/>
<g class="a-kin" ${d(.2)}>${T(14, 120, 26, 'Tahukah', '#fff')}${T(14, 150, 26, 'kamu?', C.yellow)}</g>
<g class="a-up" ${d(1)}>${turbine(110, 270, 80, C.cyan, 3, '3s')}</g>
<rect x="14" y="290" width="132" height="30" fill="${C.yellow}"/>${T(80, 310, 12, 'Ikuti PLN NR', C.navy, 700, 'text-anchor="middle"')}</g>
${T(40, 60, 12, 'ZONA AMAN', C.n75, 700, 'letter-spacing="2"')}<line x1="40" y1="70" x2="230" y2="70" stroke="${C.n25}" stroke-dasharray="3 3"/>
${T(420, 300, 12, '9:16 · 1080 × 1920', C.n75, 700)}`)
  });

  add({
    id: 'hero-reveal', name: 'Hero Asset Reveal', cat: 'Kampanye & Sosial', tier: 'Inti',
    desc: 'Panggung gelap, satu aset utama (modul panel, kontainer BESS, nacelle) disapu cahaya rim, berputar pelan. Gaya peluncuran premium.',
    when: 'Peluncuran teknologi, penandatanganan kerja sama, pembukaan pameran, teaser COD.',
    aud: 'Investor, media, mitra', formats: ['16:9', '1:1'], dur: '10–30 dtk', pace: 'Tenang',
    ease: 'emphasis', transition: 'Lens Iris', palette: ['#00243A', C.navy, C.cyan, C.yellow, C.white],
    type: 'PT Sans Bold judul tunggal, angka spesifikasi tabular',
    beats: ['Gelap total', 'Sapuan cahaya memperlihatkan siluet', 'Aset berputar dan spesifikasi muncul', 'Judul dan tanggal'],
    dont: ['Spesifikasi harus dari dokumen resmi', 'Tanpa lens flare berlebihan'],
    svg: p => svg(p, `<radialGradient id="${p}spot" cx=".5" cy=".55" r=".5"><stop offset="0" stop-color="${C.deep}"/><stop offset="1" stop-color="#00243A"/></radialGradient>
<linearGradient id="${p}shine" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="${p}box"><path d="M200 200 L380 140 L460 180 L280 240Z M200 200 L280 240 L280 300 L200 260Z M280 240 L460 180 L460 240 L280 300Z"/></clipPath>
<rect width="640" height="360" fill="url(#${p}spot)"/><ellipse cx="330" cy="300" rx="200" ry="22" fill="#00243A"/>
<path d="M200 200 L380 140 L460 180 L280 240Z" fill="${C.n25}"/><path d="M200 200 L280 240 L280 300 L200 260Z" fill="${C.navy}"/><path d="M280 240 L460 180 L460 240 L280 300Z" fill="${C.azure}"/>
${[0, 1, 2, 3, 4].map(i => `<line x1="${300 + i * 32}" y1="${234 - i * 11}" x2="${300 + i * 32}" y2="${294 - i * 11}" stroke="${C.navy}" stroke-width="2"/>`).join('')}
<g clip-path="url(#${p}box)"><g class="a-slide" style="--from:-200px;--to:400px;--t:3.5s"><rect x="150" y="100" width="90" height="240" fill="url(#${p}shine)" transform="skewX(-20)"/></g></g>
<g class="a-up" ${d(1)}>${T(40, 70, 12, 'PELUNCURAN', C.yellow, 700, 'letter-spacing="3"')}${T(40, 104, 30, 'Sistem Penyimpanan', '#fff')}${T(40, 136, 30, 'Energi Baterai', '#fff')}</g>`)
  });

  add({
    id: 'night-glow', name: 'Night Grid Glow', cat: 'Kampanye & Sosial', tier: 'Inti',
    desc: 'Kota dan desa di malam hari, jendela menyala satu per satu mengikuti garis transmisi bercahaya. Emosi utama: listrik yang sampai ke rumah.',
    when: 'Hari Listrik Nasional, kampanye elektrifikasi, layar booth pameran, video penutup acara.',
    aud: 'Publik umum', formats: ['16:9', '9:16', '1:1'], dur: '15–40 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Energy Sweep', palette: ['#00243A', C.navy, C.yellow, C.cyan, C.lime],
    type: 'PT Sans Bold di langit malam, kontras tinggi',
    beats: ['Siluet gelap', 'Garis transmisi menyala dari pembangkit', 'Jendela menyala berurutan', 'Pesan dan lockup'],
    dont: ['Glow lembut, tanpa neon berlebihan', 'Kuning hanya untuk cahaya'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#00243A"/>`;
      for (let i = 0; i < 40; i++) g += `<circle cx="${(i * 97) % 640}" cy="${(i * 53) % 150}" r="1" fill="#fff" opacity=".5"/>`;
      g += `<path class="a-draw" style="--len:700;--t:6s" d="M20 220 Q120 190 220 210 T420 200 T620 215" fill="none" stroke="${C.cyan}" stroke-width="2"/>`;
      const b = [[40, 80], [90, 120], [140, 60], [200, 150], [270, 90], [330, 130], [390, 70], [440, 160], [510, 100], [570, 140]];
      b.forEach(([x, h], i) => {
        g += `<rect x="${x}" y="${330 - h}" width="50" height="${h}" fill="${C.navy}"/>`;
        for (let r = 0; r < Math.floor(h / 22); r++) for (let c = 0; c < 3; c++) g += `<rect class="a-light" style="--d:${((i * 3 + r + c) * .09).toFixed(2)}s" x="${x + 6 + c * 15}" y="${336 - h + r * 22}" width="8" height="10" fill="${C.yellow}"/>`;
      });
      g += `<rect y="330" width="640" height="30" fill="#00243A"/>${T(40, 60, 28, 'Menyalakan setiap rumah', '#fff')}`;
      return svg(p, g);
    }
  });

  add({
    id: 'low-poly', name: 'Low-Poly Landscape', cat: 'Kampanye & Sosial', tier: 'Spesialis',
    desc: 'Lanskap faset segitiga dalam ramp energi, kamera melayang pelan. Modern, ringan, cocok untuk konten rekrutmen dan teknologi.',
    when: 'Rekrutmen talenta, employer branding, intro webinar teknologi, background presentasi.',
    aud: 'Mahasiswa, profesional muda', formats: ['16:9', '9:16'], dur: '10–30 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Chevron Push', palette: [C.deep, C.teal, C.lime, C.yellow, C.cyan],
    type: 'PT Sans Bold judul besar di ruang langit',
    beats: ['Faset muncul dari bawah', 'Kamera bergeser', 'Turbin dan panel low-poly', 'Judul dan ajakan'],
    dont: ['Faset maksimal 4 warna per bidang', 'Tanpa efek glitch'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.deep}"/>`;
      const cols = [C.teal, C.sky, C.lime, C.green, C.azure, C.yellow];
      let k = 0;
      for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) {
        const x = i * 70 - 20, y = 200 + j * 55;
        g += `<polygon class="a-up" style="--d:${(k * .03).toFixed(2)}s;--t:7s" points="${x},${y + 55} ${x + 35},${y - 10 + (i % 3) * 8} ${x + 70},${y + 55}" fill="${cols[(i + j * 2) % 6]}" opacity=".9"/><polygon points="${x + 35},${y - 10 + (i % 3) * 8} ${x + 70},${y + 55} ${x + 105},${y}" fill="${cols[(i + j + 3) % 6]}" opacity=".75"/>`; k++;
      }
      g += `${turbine(470, 210, 110, '#fff', 3, '5s')}${T(40, 80, 34, 'Bangun masa depan', '#fff')}${T(40, 118, 34, 'energi bersamamu', C.yellow)}`;
      return svg(p, g);
    }
  });

  add({
    id: 'soft-clay', name: 'Soft 3D Clay', cat: 'Kampanye & Sosial', tier: 'Spesialis',
    desc: 'Objek bulat lembut seperti mainan tanah liat: matahari, turbin, rumah. Gerak memantul halus tanpa elastis berlebihan. Ramah anak.',
    when: 'Edukasi energi untuk sekolah, TJSL, konten keluarga, kampanye hemat energi.',
    aud: 'Anak, keluarga, komunitas', formats: ['1:1', '9:16', '16:9'], dur: '20–60 dtk', pace: 'Sedang',
    ease: 'entrance', transition: 'Cross-fade 220 ms', palette: ['#EAF6FB', C.cyan, C.lime, C.yellow, C.navy],
    type: 'PT Sans Bold, kalimat pendek ramah anak',
    beats: ['Ruang pastel', 'Objek jatuh pelan dan mendarat', 'Turbin berputar, matahari tersenyum', 'Pesan sederhana'],
    dont: ['Tanpa overshoot/bounce besar', 'Wajah karakter hanya pada objek non-manusia'],
    svg: p => svg(p, `<radialGradient id="${p}cl1" cx=".35" cy=".3"><stop offset="0" stop-color="#FFFDE0"/><stop offset="1" stop-color="${C.yellow}"/></radialGradient>
<radialGradient id="${p}cl2" cx=".35" cy=".3"><stop offset="0" stop-color="#D8F2FC"/><stop offset="1" stop-color="${C.cyan}"/></radialGradient>
<radialGradient id="${p}cl3" cx=".35" cy=".3"><stop offset="0" stop-color="#EAF7C9"/><stop offset="1" stop-color="${C.lime}"/></radialGradient>
<rect width="640" height="360" fill="#EAF6FB"/><ellipse cx="320" cy="320" rx="300" ry="40" fill="#D5EAF3"/>
<g class="a-float" style="--amp:-10px;--t:3s"><circle cx="150" cy="120" r="50" fill="url(#${p}cl1)"/><circle cx="135" cy="112" r="5" fill="${C.navy}"/><circle cx="165" cy="112" r="5" fill="${C.navy}"/><path d="M135 132 Q150 144 165 132" stroke="${C.navy}" stroke-width="4" fill="none" stroke-linecap="round"/></g>
<rect x="340" y="140" width="22" height="170" rx="11" fill="url(#${p}cl2)"/><g class="a-spin" style="--t:4s;transform-origin:351px 140px">${[0, 120, 240].map(a => `<ellipse cx="351" cy="92" rx="13" ry="48" fill="url(#${p}cl2)" transform="rotate(${a} 351 140)"/>`).join('')}</g><circle cx="351" cy="140" r="14" fill="#fff"/>
<g class="a-float" style="--amp:-6px;--t:2.6s"><rect x="450" y="220" width="110" height="90" rx="22" fill="url(#${p}cl3)"/><path d="M440 230 L505 170 L570 230Z" fill="${C.navy}" stroke="${C.navy}" stroke-width="10" stroke-linejoin="round"/><rect x="490" y="260" width="30" height="50" rx="10" fill="#fff"/></g>
${T(40, 300, 22, 'Ayo kenali energi bersih', C.navy)}`)
  });

  add({
    id: 'particle-field', name: 'Particle Energy Field', cat: 'Kampanye & Sosial', tier: 'Spesialis',
    desc: 'Ribuan partikel mengalir seperti angin dan arus laut, berkumpul membentuk hexagon atau angka. Generatif, cocok untuk layar besar.',
    when: 'Layar LED panggung, booth pameran, intro konferensi, background keynote Direksi.',
    aud: 'Tamu acara, publik', formats: ['16:9', 'ultra-wide'], dur: 'Loop 30–120 dtk', pace: 'Tenang',
    ease: 'linear (loop)', transition: 'Hex Bloom', palette: [C.navy, C.cyan, C.teal, C.lime, C.yellow],
    type: 'PT Sans Bold judul besar dengan jarak aman dari partikel padat',
    beats: ['Partikel mengalir acak', 'Arus membentuk pita gradient', 'Partikel berkumpul membentuk hexagon', 'Hexagon pecah kembali menjadi arus'],
    dont: ['Jangan membentuk petir (petir khusus logo)', 'Kepadatan rendah di area teks'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.navy}"/>`;
      const cols = [C.cyan, C.teal, C.lime, C.yellow, C.sky];
      for (let i = 0; i < 90; i++) {
        const y = 40 + (i * 37) % 280, x = (i * 71) % 640, r = 1.5 + (i % 3);
        g += `<circle class="a-drift" style="--t:${(4 + (i % 5)).toFixed(1)}s;--d:${(-(i % 7)).toFixed(1)}s" cx="${x}" cy="${y}" r="${r}" fill="${cols[i % 5]}" opacity=".8"/>`;
      }
      g += `<polygon class="a-breathe" style="--s:1.08;--t:4s" points="${hexPts(470, 180, 70)}" fill="none" stroke="url(#${p}E)" stroke-width="4"/>${T(40, 190, 34, 'Arus energi baru', '#fff')}`;
      return svg(p, g);
    }
  });

  /* ========== RUMPUN 7 — K3 & OPERASIONAL ========== */
  add({
    id: 'safety-pictogram', name: 'K3 Safety Pictogram', cat: 'K3 & Operasional', tier: 'Inti',
    desc: 'Rambu wajib (lingkaran biru) dan peringatan (segitiga kuning) bergaya ISO 7010 yang muncul berurutan dengan penjelasan singkat. Biru dan kuning PLN NR kebetulan sejalan dengan standar rambu.',
    when: 'Safety induction, safety briefing harian, video izin kerja, kampanye K3.',
    aud: 'Karyawan, kontraktor, tamu lokasi', formats: ['16:9', '9:16'], dur: '30–120 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.white, C.navy, C.azure, C.yellow],
    type: 'PT Sans Bold perintah singkat (Wajib Helm), Regular alasan',
    beats: ['Area kerja diperkenalkan', 'Rambu muncul satu per satu', 'Perintah + alasan tiap rambu', 'Ringkasan APD lengkap'],
    dont: ['Gunakan rambu standar resmi, jangan stilasi', 'Merah larangan hanya untuk rambu larangan resmi'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>${T(40, 52, 22, 'APD wajib di area switchyard', C.navy)}`;
      const signs = [['circle', 'WAJIB HELM'], ['circle', 'WAJIB SARUNG TANGAN'], ['tri', 'AWAS TEGANGAN'], ['circle', 'WAJIB HARNESS']];
      signs.forEach(([s, l], i) => {
        const x = 100 + i * 148, y = 170;
        g += `<g class="a-pop" style="--d:${i * .5}s;--t:7s">` + (s === 'circle'
          ? `<circle cx="${x}" cy="${y}" r="50" fill="#1F5FAD"/><circle cx="${x}" cy="${y}" r="44" fill="none" stroke="#fff" stroke-width="3"/><path d="M${x - 22} ${y + 6} A22 22 0 0 1 ${x + 22} ${y + 6} L${x + 26} ${y + 12} L${x - 26} ${y + 12}Z" fill="#fff"/>`
          : `<polygon points="${x},${y - 52} ${x + 56},${y + 44} ${x - 56},${y + 44}" fill="${C.yellow}" stroke="#111" stroke-width="5" stroke-linejoin="round"/><path d="M${x + 4} ${y - 26} L${x - 12} ${y + 6} L${x} ${y + 6} L${x - 6} ${y + 30} L${x + 14} ${y - 4} L${x + 2} ${y - 4}Z" fill="#111"/>`) +
          `${T(x, y + 86, 11, l, C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}</g>`;
      });
      return svg(p, g + T(40, 340, 10, 'Rambu mengikuti standar ISO 7010 / regulasi K3 setempat', C.n75, 400));
    }
  });

  add({
    id: 'sop-checklist', name: 'SOP Checklist Flow', cat: 'K3 & Operasional', tier: 'Inti',
    desc: 'Daftar periksa yang tercentang satu per satu, dengan cincin progres dan nomor langkah. Jelas untuk prosedur yang tidak boleh terlewat.',
    when: 'LOTO, izin kerja, prosedur start-up/shut-down, audit kepatuhan, GRC.',
    aud: 'Operator, kontraktor, auditor', formats: ['16:9', '9:16'], dur: '30–120 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.paper, C.navy, C.cyan, C.teal],
    type: 'PT Sans Bold tiap langkah, satu klausa',
    beats: ['Judul prosedur', 'Langkah muncul dan tercentang', 'Cincin progres terisi', 'Status selesai dengan glyph ●'],
    dont: ['Isi prosedur harus sama dengan SOP berlaku', 'Satu prosedur per video'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'site-walkthrough', name: 'Top-Down Site Walkthrough', cat: 'K3 & Operasional', tier: 'Spesialis',
    desc: 'Denah lokasi dari atas dengan jalur pejalan aman, zona bahaya bergaris, dan titik kumpul. Ideal untuk induksi tamu dan pembelajaran insiden.',
    when: 'Induksi lokasi, jalur evakuasi, lesson learned insiden, kampanye zero accident.',
    aud: 'Tamu, kontraktor, karyawan baru', formats: ['16:9', '9:16'], dur: '45–120 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.paper, C.navy, C.cyan, C.yellow, C.teal],
    type: 'PT Sans Bold label zona UPPERCASE',
    beats: ['Denah tergambar', 'Zona bahaya menyala bergaris', 'Ikon orang berjalan di jalur aman', 'Titik kumpul berdenyut'],
    dont: ['Denah harus sesuai layout resmi', 'Kronologi insiden tanpa menyebut nama individu'],
    svg: p => svg(p, `<pattern id="${p}haz" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="14" fill="${C.yellow}"/><rect x="7" width="7" height="14" fill="${C.navy}"/></pattern>
<rect width="640" height="360" fill="${C.paper}"/><rect x="40" y="40" width="560" height="280" fill="#fff" stroke="${C.navy}" stroke-width="2"/>
<rect x="70" y="70" width="180" height="110" fill="url(#${p}haz)" opacity=".85" class="a-pulse"/>${T(160, 200, 12, 'ZONA TEGANGAN TINGGI', C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}
<rect x="330" y="70" width="240" height="80" fill="${C.n25}"/>${T(450, 116, 12, 'RUANG KONTROL', C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}
<path d="M60 300 L300 300 L300 230 L540 230 L540 180" fill="none" stroke="${C.cyan}" stroke-width="10" stroke-dasharray="1 0" opacity=".35"/>
<path class="a-flow" style="--dash:8 10;--len:18;--t:.9s" d="M60 300 L300 300 L300 230 L540 230 L540 180" fill="none" stroke="${C.cyan}" stroke-width="3"/>
<circle r="9" fill="${C.navy}"><animateMotion dur="6s" repeatCount="indefinite" path="M60 300 L300 300 L300 230 L540 230 L540 180"/></circle>
<circle class="a-ping" cx="540" cy="280" r="14" fill="none" stroke="${C.teal}" stroke-width="3"/><circle cx="540" cy="280" r="9" fill="${C.teal}"/>${T(510, 312, 12, 'TITIK KUMPUL', C.navy, 700, 'text-anchor="middle"')}`)
  });

  /* ========== RUMPUN 8 — DOKUMENTER & SINEMATIK ========== */
  add({
    id: 'golden-hour', name: 'Golden-Hour Cinematic', cat: 'Dokumenter & Sinematik', tier: 'Signature',
    desc: 'Langit senja hangat bertemu laut teal, turbin berputar, letterbox sinematik, dorongan kamera pelan. Fotografi khas PLN NR dalam gerak.',
    when: 'Video COD, groundbreaking, company profile, video ulang tahun, pembuka RUPS.',
    aud: 'Publik, media, pemegang saham', formats: ['16:9', '2.39:1'], dur: '60–180 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.yellow, C.lime, C.teal, C.deep, C.navy],
    type: 'PT Sans Bold judul di letterbox, Regular lokasi dan tanggal',
    beats: ['Wide shot senja', 'Push-in pelan 5–8%', 'Lower third: lokasi dan kapasitas', 'Lockup di frame terakhir'],
    dont: ['Tanpa grain, duotone, atau hitam-putih', 'Warna footage hangat-dingin, jangan desaturasi'],
    svg: p => svg(p, `<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.deep}"/><stop offset=".5" stop-color="#F7B54A"/><stop offset=".72" stop-color="${C.yellow}"/></linearGradient>
<g class="a-breathe" style="--s:1.06;--t:10s"><rect width="640" height="360" fill="url(#${p}sky)"/><circle cx="420" cy="232" r="40" fill="#FFF7B0"/>
<rect y="240" width="640" height="120" fill="${C.teal}"/><rect y="240" width="640" height="120" fill="${C.deep}" opacity=".45"/>
<rect x="390" y="242" width="60" height="4" fill="#FFF7B0" opacity=".7" class="a-pulse"/>
${turbine(140, 240, 120, '#0B3550', 3.5, '7s')}${turbine(260, 240, 90, '#0B3550', 3, '6s')}${turbine(560, 240, 140, '#0B3550', 4, '8s')}</g>
<rect width="640" height="36" fill="#001A2A"/><rect y="324" width="640" height="36" fill="#001A2A"/>
<g class="a-up" ${d(1)}><rect x="40" y="262" width="4" height="44" fill="${C.yellow}"/>${T(54, 282, 18, 'PLTB Pesisir Selatan', '#fff')}${T(54, 302, 13, 'Ilustrasi · ganti dengan footage', '#E6F4FB', 400)}</g>`)
  });

  add({
    id: 'contour-topo', name: 'Contour Topography', cat: 'Dokumenter & Sinematik', tier: 'Spesialis',
    desc: 'Garis kontur tergambar berlapis seperti peta topografi, garis pindai drone menyapu dan menandai titik lokasi. Narasi lanskap dan studi lokasi.',
    when: 'Studi kelayakan PLTA/PLTP, penjelasan daerah tangkapan air, laporan safeguard.',
    aud: 'Lender, regulator, tim teknis', formats: ['16:9'], dur: '20–60 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.navy, C.n50, C.cyan, C.yellow],
    type: 'Monospace untuk elevasi, PT Sans Bold untuk nama lokasi',
    beats: ['Kontur tergambar dari puncak ke luar', 'Garis pindai menyapu', 'Titik lokasi ditandai', 'Data elevasi dan luas muncul'],
    dont: ['Peta harus bersumber resmi saat rilis', 'Tanpa warna hipsometrik pelangi'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="${C.navy}"/>`;
      for (let i = 1; i <= 9; i++) g += `<path class="a-draw" style="--len:${(i * 190).toFixed(0)};--d:${(i * .15).toFixed(2)}s;--t:8s" d="M${300 - i * 28} ${170} C${300 - i * 28} ${170 - i * 18} ${300 + i * 34} ${170 - i * 22} ${300 + i * 34} ${170} C${300 + i * 34} ${170 + i * 16} ${300 - i * 28} ${170 + i * 20} ${300 - i * 28} ${170}Z" fill="none" stroke="${i === 4 ? C.cyan : C.n50}" stroke-width="${i === 4 ? 2.5 : 1.2}"/>`;
      g += `<g class="a-scanx"><rect x="0" y="0" width="2" height="360" fill="${C.yellow}" opacity=".8"/></g>
<circle class="a-ping" cx="380" cy="150" r="10" fill="none" stroke="${C.yellow}" stroke-width="2"/><circle cx="380" cy="150" r="5" fill="${C.yellow}"/>${T(392, 140, 11, 'EL. +612 m', C.yellow, 700, 'font-family="ui-monospace,monospace"')}
${T(30, 40, 11, 'DAERAH TANGKAPAN AIR — ILUSTRATIF', C.n25, 700, 'letter-spacing="2"')}`;
      return svg(p, g);
    }
  });

  add({
    id: 'day-night', name: 'Day-to-Night Timelapse', cat: 'Dokumenter & Sinematik', tier: 'Inti',
    desc: 'Matahari melintas di busur, langit berganti siang ke malam, kurva produksi PLTS naik dan turun mengikutinya, lalu BESS mengambil alih. Satu siklus, satu cerita.',
    when: 'Menjelaskan intermitensi, peran BESS, hybrid, kampanye zero emission.',
    aud: 'Publik, regulator, investor', formats: ['16:9', '1:1'], dur: '20–40 dtk', pace: 'Sedang',
    ease: 'linear (siklus)', transition: 'Cross-fade 220 ms', palette: [C.cyan, C.yellow, C.navy, C.lime, C.teal],
    type: 'PT Sans Bold jam (06.00, 12.00, 18.00) tabular',
    beats: ['Fajar, produksi nol', 'Siang, kurva puncak', 'Senja, BESS mulai menyuplai', 'Malam, lampu kota tetap menyala'],
    dont: ['Kurva produksi harus berbentuk realistis', 'Tandai data ilustratif'],
    svg: p => svg(p, `<rect width="640" height="360" fill="${C.cyan}"><animate attributeName="fill" values="${C.navy};${C.cyan};${C.cyan};${C.deep};${C.navy}" dur="8s" repeatCount="indefinite"/></rect>
<g class="a-spin" style="--t:8s;transform-origin:320px 260px"><circle cx="120" cy="260" r="24" fill="${C.yellow}"/></g>
<rect y="260" width="640" height="100" fill="#fff"/>
<path d="M60 340 C200 340 220 280 320 280 C420 280 440 340 580 340" fill="none" stroke="${C.n25}" stroke-width="2"/>
<path class="a-draw" style="--len:600;--t:8s" d="M60 340 C200 340 220 280 320 280 C420 280 440 340 580 340" fill="none" stroke="${C.yellow}" stroke-width="4" stroke-linecap="round"/>
<rect class="a-pulse" style="--t:8s" x="470" y="296" width="70" height="30" fill="${C.teal}"/>${T(505, 316, 11, 'BESS', '#fff', 700, 'text-anchor="middle"')}
${T(60, 356, 10, '06.00', C.navy, 700)}${T(306, 356, 10, '12.00', C.navy, 700)}${T(552, 356, 10, '18.00', C.navy, 700)}
${T(40, 60, 24, 'Siang dari matahari,', '#fff')}${T(40, 92, 24, 'malam dari baterai', C.yellow)}`)
  });

  /* ========== RUMPUN 9 — TATA KELOLA & KEUANGAN ========== */
  add({
    id: 'authority-ladder', name: 'Authority Ladder Climb', cat: 'Tata Kelola & Keuangan', tier: 'Inti',
    desc: 'Tangga kewenangan naik anak tangga demi anak tangga sesuai nilai keputusan, sampai organ yang berwenang menyala. Menjawab pertanyaan "siapa yang memutuskan" tanpa tabel panjang.',
    when: 'Usulan investasi, materi persetujuan Direksi/Dekom/RUPS, sosialisasi batas kewenangan.',
    aud: 'Direksi, Dekom, SPI, unit pengusul', formats: ['16:9'], dur: '15–30 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.n25, C.paper],
    type: 'PT Sans Bold nama organ, angka ambang tabular',
    beats: ['Anak tangga kosong dengan nama organ', 'Nilai usulan muncul di kiri', 'Penanda naik sampai ambang terlewati', 'Organ berwenang menyala cyan dengan dasar aturan'],
    dont: ['Ambang nilai wajib sesuai pedoman kewenangan berlaku', 'Sebut dasar aturan di layar'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>${T(40, 48, 20, 'Usulan Rp 240 M membutuhkan persetujuan Dekom', C.navy)}${T(40, 70, 11, 'Ambang ilustratif, sesuaikan dengan pedoman kewenangan', C.n75, 400)}`;
      const st = [['Manajer Unit', '< Rp 5 M'], ['Direktur', '< Rp 50 M'], ['Direksi', '< Rp 150 M'], ['Dekom', '< Rp 500 M'], ['RUPS', '≥ Rp 500 M']];
      st.forEach(([n, v], i) => {
        const x = 70 + i * 106, y = 300 - i * 44, on = i === 3;
        g += `<rect class="a-up" ${d(.2 + i * .2)} x="${x}" y="${y}" width="100" height="${360 - y}" fill="${on ? C.cyan : i < 3 ? C.n25 : C.paper}"/>${T(x + 8, y + 22, 13, n, on ? '#fff' : C.navy, 700)}${T(x + 8, y + 40, 11, v, on ? '#fff' : C.n75, 400)}`;
      });
      g += `<circle r="9" fill="${C.yellow}" stroke="${C.navy}" stroke-width="3"><animateMotion dur="5s" repeatCount="indefinite" keyTimes="0;.8;1" keyPoints="0;1;1" calcMode="linear" path="M180 290 L286 246 L392 202 L498 158"/></circle>`;
      return svg(p, g);
    }
  });

  add({
    id: 'risk-heatmap', name: 'Risk Heatmap Shift', cat: 'Tata Kelola & Keuangan', tier: 'Inti',
    desc: 'Matriks 5×5 dengan kepadatan navy; titik risiko bergeser dari posisi inheren ke residual setelah mitigasi. Satu gerak menjelaskan efektivitas mitigasi.',
    when: 'Profil risiko proyek, laporan manajemen risiko triwulanan, materi Komite Audit dan lender.',
    aud: 'Direksi, Komite Pemantau Risiko, lender', formats: ['16:9'], dur: '20–40 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.white, C.navy, C.n50, C.n25, C.cyan],
    type: 'PT Sans Bold kode risiko (R1–R5), label sumbu UPPERCASE',
    beats: ['Matriks dan sumbu', 'Titik risiko inheren muncul', 'Panah mitigasi, titik bergeser ke residual', 'Ringkasan: berapa risiko turun level'],
    dont: ['Tanpa pita merah; kepadatan navy membawa makna', 'Maksimal 6 titik risiko per layar'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/>`;
      const den = ['#F1F6FA', '#D5E4EE', '#BFD3DE', '#7FA7BD', '#407C9D', '#00507C'];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) g += `<rect x="${120 + c * 56}" y="${40 + r * 56}" width="54" height="54" fill="${den[Math.min(5, Math.floor((c + (4 - r)) * .7))]}"/>`;
      g += `${T(100, 190, 11, 'KEMUNGKINAN', C.n75, 700, 'transform="rotate(-90 100 190)" text-anchor="middle" letter-spacing="2"')}${T(260, 336, 11, 'DAMPAK', C.n75, 700, 'text-anchor="middle" letter-spacing="2"')}`;
      [[372, 68, 204, 236, 'R1'], [316, 124, 260, 236, 'R2'], [372, 180, 316, 292, 'R3']].forEach(([x1, y1, x2, y2, l], i) => {
        g += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="4 4"/><g><circle r="14" fill="#fff" stroke="${C.cyan}" stroke-width="3"/>${T(0, 5, 12, l, C.navy, 700, 'text-anchor="middle"')}<animateTransform attributeName="transform" type="translate" values="${x1} ${y1};${x1} ${y1};${x2} ${y2};${x2} ${y2}" keyTimes="0;.25;.6;1" dur="6s" begin="${i * .3}s" repeatCount="indefinite"/></g>`;
      });
      g += `<g class="a-up" ${d(2)}><rect x="430" y="110" width="180" height="110" fill="${C.paper}"/><rect x="430" y="110" width="4" height="110" fill="${C.cyan}"/>${T(448, 160, 34, '3 → 0', C.navy)}${T(448, 186, 12, 'risiko tinggi setelah', C.navy, 400)}${T(448, 204, 12, 'mitigasi (ilustratif)', C.n75, 400)}</g>`;
      return svg(p, g);
    }
  });

  add({
    id: 'covenant-gauge', name: 'Covenant Headroom', cat: 'Tata Kelola & Keuangan', tier: 'Spesialis',
    desc: 'Garis DSCR proyeksi tergambar di atas garis kovenan, ruang di antaranya terisi sebagai headroom. Lender melihat jarak aman dalam satu gerakan.',
    when: 'Pembiayaan proyek, monitoring kovenan, materi lender meeting, stress test.',
    aud: 'Lender, Direktorat Keuangan, Dekom', formats: ['16:9'], dur: '15–30 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.n25, C.paper],
    type: 'PT Sans Bold angka rasio dua desimal dengan "x" (1,30x)',
    beats: ['Sumbu dan garis kovenan putus-putus', 'Garis DSCR tergambar per tahun', 'Area headroom terisi', 'Titik terendah ditandai dengan nilainya'],
    dont: ['Angka wajib dari model keuangan resmi', 'Titik terendah harus disebut, bukan disembunyikan'],
    svg: p => {
      const pts = [[80, 150], [150, 132], [220, 170], [290, 196], [360, 160], [430, 140], [500, 120], [570, 110]];
      const line = pts.map(q => q.join(',')).join(' ');
      let g = `<rect width="640" height="360" fill="#fff"/>${T(40, 44, 20, 'DSCR tetap di atas kovenan sepanjang tenor', C.navy)}${T(40, 66, 11, 'DSCR (x), proyeksi ilustratif', C.n75, 400)}
<path class="a-up" ${d(1.4)} d="M${line.replace(/ /g, ' L')} L570 230 L80 230Z" fill="${C.cyan}" fill-opacity=".14"/>
<line x1="70" y1="230" x2="590" y2="230" stroke="${C.navy}" stroke-width="2" stroke-dasharray="6 5"/>${T(500, 250, 12, 'Kovenan 1,30x', C.navy, 700)}
<polyline class="a-draw" style="--len:620" points="${line}" fill="none" stroke="${C.cyan}" stroke-width="4" stroke-linejoin="round"/>`;
      pts.forEach(([x], i) => g += T(x, 300, 11, 'T' + (i + 1), C.n75, 400, 'text-anchor="middle"'));
      g += `<g class="a-pop" ${d(1.8)}><circle cx="290" cy="196" r="7" fill="${C.navy}"/><line x1="290" y1="196" x2="290" y2="230" stroke="${C.navy}" stroke-width="1.5"/>${T(300, 190, 13, 'Terendah 1,48x', C.navy, 700)}${T(300, 216, 11, 'headroom 0,18x', C.n75, 400)}</g>`;
      return svg(p, g);
    }
  });

  add({
    id: 'three-lines', name: 'Three Lines Assurance', cat: 'Tata Kelola & Keuangan', tier: 'Inti',
    desc: 'Tiga kolom lini pertahanan tersusun, aliran laporan mengalir ke Direksi dan Dekom/Komite Audit. Struktur GRC menjadi mudah diingat.',
    when: 'Sosialisasi GRC, materi SPI dan Komite Audit, onboarding manajer, audit readiness.',
    aud: 'Manajer, SPI, Komite Audit', formats: ['16:9'], dur: '30–60 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Wave Wipe', palette: [C.white, C.navy, C.azure, C.cyan, C.yellow],
    type: 'PT Sans Bold judul lini, Regular peran satu baris',
    beats: ['Organ pengawas di atas', 'Lini 1 sampai 3 berdiri bergiliran', 'Aliran laporan bergerak ke atas', 'Sorot lini yang dibahas'],
    dont: ['Peran sesuai piagam SPI dan pedoman GRC', 'Satu lini disorot per beat'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/><rect x="40" y="30" width="270" height="44" fill="${C.navy}"/>${T(175, 58, 14, 'DIREKSI', '#fff', 700, 'text-anchor="middle" letter-spacing="2"')}<rect x="330" y="30" width="270" height="44" fill="${C.navy}"/>${T(465, 58, 14, 'DEKOM · KOMITE AUDIT', '#fff', 700, 'text-anchor="middle" letter-spacing="2"')}`;
      [['Lini 1', 'Pemilik risiko', C.azure], ['Lini 2', 'Risiko & kepatuhan', C.sky], ['Lini 3', 'Satuan Pengawasan Internal', C.cyan]].forEach(([a, b, c], i) => {
        const x = 40 + i * 192;
        g += `<rect class="a-grow" ${d(.3 + i * .35)} x="${x}" y="150" width="176" height="180" fill="${c}"/>${T(x + 16, 186, 22, a, '#fff')}${T(x + 16, 210, 12, b, '#fff', 400)}
<line class="a-flow" style="--dash:6 8;--len:14;--t:1s;animation-direction:reverse" x1="${x + 88}" y1="150" x2="${i < 2 ? 175 : 465}" y2="74" stroke="${C.navy}" stroke-width="2"/>`;
      });
      return svg(p, g + `<rect class="a-pulse" x="424" y="146" width="184" height="188" fill="none" stroke="${C.navy}" stroke-width="3"/>`);
    }
  });

  /* ========== RUMPUN 10 — PAKET BROADCAST ========== */
  add({
    id: 'logo-sting', mode: 'expressive', name: 'Logo Sting & Ident', cat: 'Paket Broadcast', tier: 'Signature',
    desc: 'Ident 3–4 detik: hexagon gradient berkumpul, pita energi melingkar, lalu lockup resmi PLN NR mengunci. Pembuka dan penutup semua video.',
    when: 'Awal dan akhir setiap video resmi, bumper YouTube, pembuka acara, layar tunggu.',
    aud: 'Semua audiens', formats: ['16:9', '9:16', '1:1'], dur: '3–4 dtk', pace: 'Sedang',
    ease: 'emphasis', transition: 'Hex Bloom', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan, C.white],
    type: 'Tanpa teks selain lockup resmi dan URL',
    beats: ['Navy kosong 0,3 dtk', 'Hexagon gradient berkumpul ke tengah', 'Pita energi melingkar dan memudar', 'Lockup resmi + www.ptplnnr.com, tahan 1,5 dtk'],
    dont: ['Lockup selalu dari aset resmi, jangan digambar ulang atau dianimasikan per huruf', 'Satu versi ident untuk semua video'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="url(#${p}N)"/>`;
      for (let i = 0; i < 6; i++) {
        const a = (-90 + i * 60) * Math.PI / 180;
        g += `<g class="a-pop" style="--d:${(i * .12).toFixed(2)}s;--t:4.5s"><polygon points="${hexPts(320 + 70 * Math.cos(a), 170 + 70 * Math.sin(a), 30)}" fill="url(#${p}V)" opacity=".9"/></g>`;
      }
      g += `<circle class="a-draw" style="--len:760;--t:4.5s;--d:.6s" cx="320" cy="170" r="120" fill="none" stroke="url(#${p}E)" stroke-width="5"/>
<g class="a-up" style="--d:1.4s;--t:4.5s"><rect x="236" y="148" width="168" height="44" fill="#fff"/>${T(320, 176, 13, 'LOCKUP RESMI', C.navy, 700, 'text-anchor="middle" letter-spacing="2"')}${T(320, 316, 13, 'www.ptplnnr.com', C.n25, 400, 'text-anchor="middle"')}</g>`;
      return svg(p, g);
    }
  });

  add({
    id: 'lower-third', name: 'Lower Third & Name Super', cat: 'Paket Broadcast', tier: 'Signature',
    desc: 'Bar nama narasumber masuk dengan aksen kuning dan wipe putih, tahan, lalu keluar rapi. Paket wajib untuk wawancara dan liputan.',
    when: 'Wawancara Direksi, testimoni karyawan dan mitra, liputan acara, video dokumenter.',
    aud: 'Semua audiens', formats: ['16:9', '9:16'], dur: '4–6 dtk per tampil', pace: 'Sedang',
    ease: 'entrance', transition: 'Cross-fade 220 ms', palette: [C.white, C.navy, C.yellow, C.n75],
    type: 'Nama PT Sans Bold 28–32 px, jabatan Regular 18–20 px',
    beats: ['Aksen kuning tumbuh 120 ms', 'Bar putih wipe dari kiri', 'Nama lalu jabatan muncul', 'Tahan 4 dtk lalu keluar terbalik'],
    dont: ['Nama dan jabatan diverifikasi ejaannya', 'Maksimal dua baris, tidak menutupi wajah'],
    svg: null // dirender oleh SLOT (kontrak slot data)
  });

  add({
    id: 'caption-pack', name: 'Caption & Subtitle Pack', cat: 'Paket Broadcast', tier: 'Inti',
    desc: 'Caption Bahasa Indonesia dengan sorotan kata aktif, di zona aman platform. Wajib untuk video sosial yang mayoritas ditonton tanpa suara.',
    when: 'Semua video media sosial, video internal di layar publik, aksesibilitas tunarungu.',
    aud: 'Publik, karyawan', formats: ['9:16', '1:1', '16:9'], dur: 'Mengikuti video', pace: 'Cepat',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.navy, C.white, C.yellow],
    type: 'PT Sans Bold 44–56 px (9:16), maksimal 2 baris, 32 karakter per baris',
    beats: ['Caption muncul serentak dengan suara', 'Kata aktif disorot kuning', 'Ganti baris di jeda kalimat', 'SRT terpisah untuk platform'],
    dont: ['Jangan menutupi lower third atau logo', 'Tanpa emoji dan efek pop berlebihan'],
    svg: p => {
      const ws = [['Energi', 22], ['bersih', 120], ['untuk', 210]], ws2 = [['masa', 22], ['depan', 108], ['Nusantara', 200]];
      let cap = `<rect x="14" y="214" width="76" height="34" fill="${C.yellow}"><animate attributeName="x" values="14;112;202;14;100;192;14" keyTimes="0;.16;.33;.5;.66;.83;1" calcMode="discrete" dur="4.8s" repeatCount="indefinite"/><animate attributeName="y" values="214;214;214;254;254;254;214" keyTimes="0;.16;.33;.5;.66;.83;1" calcMode="discrete" dur="4.8s" repeatCount="indefinite"/></rect>`;
      ws.forEach(([w, x]) => cap += T(x, 240, 26, w, '#fff'));
      ws2.forEach(([w, x]) => cap += T(x, 280, 26, w, '#fff'));
      return svg(p, `<rect width="640" height="360" fill="${C.paper}"/><g transform="translate(160 0)"><rect width="320" height="360" fill="${C.deep}"/>${turbine(230, 200, 120, '#7FA7BD', 3, '6s')}<rect y="200" width="320" height="100" fill="${C.navy}" opacity=".7"/>${cap}</g>${T(40, 60, 12, '9:16 · CAPTION', C.n75, 700, 'letter-spacing="2"')}`);
    }
  });

  add({
    id: 'countdown', mode: 'expressive', name: 'Event Countdown Loop', cat: 'Paket Broadcast', tier: 'Inti',
    desc: 'Hitung mundur besar di dalam cincin gradient untuk layar panggung, transisi ke pembukaan acara. Juga bekerja sebagai loop layar tunggu.',
    when: 'Pembukaan acara, peresmian COD, RUPS, town hall, webinar.',
    aud: 'Peserta acara', formats: ['16:9', 'ultra-wide'], dur: '10–60 dtk', pace: 'Sedang',
    ease: 'linear (detik)', transition: 'Energy Sweep', palette: [C.navy, C.yellow, C.lime, C.teal, C.cyan],
    type: 'PT Sans Bold angka tabular 200+ px di layar LED',
    beats: ['Judul acara dan tanggal', 'Cincin menghitung detik', 'Angka berganti tiap detik', 'Energy Sweep ke ident pembuka'],
    dont: ['Angka harus tabular agar tidak bergoyang', 'Kontras tinggi untuk LED jarak jauh'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="url(#${p}N)"/><circle cx="320" cy="170" r="100" fill="none" stroke="#00324F" stroke-width="10"/><circle class="a-draw" style="--len:629;--t:5s" cx="320" cy="170" r="100" fill="none" stroke="url(#${p}E)" stroke-width="10" transform="rotate(-90 320 170)"/>`;
      ['05', '04', '03', '02', '01'].forEach((n, i) => g += `<g class="a-tick" style="--d:${i ? i - 5 : 0}s;${i ? 'opacity:0' : ''}">${T(320, 200, 88, n, '#fff', 700, 'text-anchor="middle"')}</g>`);
      return svg(p, g + `${T(320, 318, 14, 'PERESMIAN · PEMBANGKIT EBT', C.n25, 700, 'text-anchor="middle" letter-spacing="3"')}`);
    }
  });

  add({
    id: 'split-screen', name: 'Before / After Split', cat: 'Paket Broadcast', tier: 'Inti',
    desc: 'Garis pembatas bergeser memperlihatkan kondisi sebelum dan sesudah: lahan atau waduk kosong menjadi pembangkit. Bukti perubahan paling kuat.',
    when: 'Progres konstruksi, rehabilitasi lahan, dampak TJSL, laporan tahunan.',
    aud: 'Publik, lender, Direksi', formats: ['16:9', '1:1'], dur: '6–15 dtk', pace: 'Tenang',
    ease: 'brand-standard', transition: 'Cross-fade 220 ms', palette: [C.paper, C.n25, C.navy, C.azure, C.yellow],
    type: 'PT Sans Bold label SEBELUM / SESUDAH dengan tanggal',
    beats: ['Kondisi sebelum penuh layar', 'Pembatas masuk dari kanan', 'Pembatas bergeser bolak-balik pelan', 'Label tanggal di dua sisi'],
    dont: ['Sudut kamera dan jam pengambilan harus sama', 'Tanggal kedua foto wajib'],
    svg: p => {
      let after = `<rect width="640" height="360" fill="#DCEFF7"/><circle cx="520" cy="80" r="30" fill="${C.yellow}"/><rect y="200" width="640" height="160" fill="${C.teal}" opacity=".5"/>`;
      for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) after += `<g transform="translate(${60 + c * 80 + r * 20} ${220 + r * 36}) skewX(-25)"><rect width="66" height="24" fill="${C.navy}"/><line x1="33" y1="0" x2="33" y2="24" stroke="${C.azure}"/></g>`;
      return svg(p, `<clipPath id="${p}cl"><rect x="0" y="0" width="320" height="360"><animate attributeName="width" values="320;160;480;320" dur="7s" repeatCount="indefinite"/></rect></clipPath>
${after}${T(600, 340, 14, 'SESUDAH · 2026', C.navy, 700, 'text-anchor="end" letter-spacing="1.5"')}
<g clip-path="url(#${p}cl)"><rect width="640" height="360" fill="#EDF3F6"/><rect y="200" width="640" height="160" fill="${C.n25}"/>${T(40, 340, 14, 'SEBELUM · 2024', C.navy, 700, 'letter-spacing="1.5"')}</g>
<rect x="318" y="0" width="4" height="360" fill="#fff"><animate attributeName="x" values="318;158;478;318" dur="7s" repeatCount="indefinite"/></rect>`);
    }
  });

  /* ========== TAMBAHAN TEKNIK ========== */
  add({
    id: 'hydro-flow', name: 'Hydro Water Path', cat: 'Teknik & Engineering', tier: 'Inti',
    desc: 'Potongan PLTA: air dari waduk masuk penstock, memutar turbin di powerhouse, keluar ke saluran buang. Partikel air membuat aliran energi terlihat.',
    when: 'Explainer PLTA dan PLTM, pumped storage, studi waduk, edukasi publik.',
    aud: 'Umum, regulator, mahasiswa', formats: ['16:9'], dur: '45–90 dtk', pace: 'Sedang',
    ease: 'linear (aliran)', transition: 'Line Draw', palette: [C.white, C.navy, C.cyan, C.azure, C.yellow],
    type: 'PT Sans Bold label komponen UPPERCASE',
    beats: ['Waduk dan bendungan', 'Air masuk intake dan penstock', 'Turbin berputar, generator menyala', 'Air kembali ke sungai'],
    dont: ['Arah aliran selalu dari tinggi ke rendah', 'Head dan debit hanya bila datanya resmi'],
    svg: p => svg(p, `<rect width="640" height="360" fill="#fff"/>
<path d="M0 120 L200 120 L200 330 L0 330Z" fill="${C.cyan}" opacity=".35"/><path d="M200 90 L240 90 L270 330 L200 330Z" fill="${C.n25}"/>
<path d="M200 260 C300 260 360 290 430 300" fill="none" stroke="${C.navy}" stroke-width="18" stroke-linecap="round"/>
<path class="a-flow" style="--dash:6 12;--len:18;--t:.7s" d="M200 260 C300 260 360 290 430 300" fill="none" stroke="${C.cyan}" stroke-width="6" stroke-linecap="round"/>
<rect x="420" y="230" width="110" height="100" fill="${C.paper}" stroke="${C.navy}" stroke-width="2"/>
<g class="a-spin" style="--t:1.6s;transform-origin:460px 300px">${[0, 60, 120, 180, 240, 300].map(a => `<rect x="457" y="282" width="6" height="18" fill="${C.azure}" transform="rotate(${a} 460 300)"/>`).join('')}</g><circle cx="460" cy="300" r="5" fill="${C.navy}"/>
<rect class="a-pulse" x="486" y="250" width="32" height="40" fill="${C.yellow}"/>
<path d="M530 320 L640 320" stroke="${C.cyan}" stroke-width="12" opacity=".5"/><path class="a-flow" style="--dash:6 12;--len:18;--t:.9s" d="M530 320 L640 320" stroke="${C.navy}" stroke-width="2"/>
${T(40, 110, 12, 'WADUK', C.navy, 700, 'letter-spacing="1.5"')}${T(280, 250, 12, 'PENSTOCK', C.navy, 700, 'letter-spacing="1.5"')}${T(420, 220, 12, 'POWERHOUSE', C.navy, 700, 'letter-spacing="1.5"')}${T(560, 306, 12, 'TAILRACE', C.navy, 700, 'letter-spacing="1.5"')}
${T(40, 50, 20, 'Air mengalir, turbin berputar', C.navy)}`)
  });

  add({
    id: 'geothermal-section', name: 'Geothermal Cross-Section', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Penampang bumi berlapis: uap naik dari reservoir lewat sumur produksi ke pembangkit, air kembali lewat sumur injeksi. Siklus PLTP dalam satu bingkai.',
    when: 'Explainer PLTP, sosialisasi wilayah kerja panas bumi, materi investor dan regulator.',
    aud: 'Umum, komunitas sekitar, investor', formats: ['16:9'], dur: '45–90 dtk', pace: 'Tenang',
    ease: 'linear (aliran)', transition: 'Line Draw', palette: [C.navy, C.deep, C.azure, C.lime, C.yellow, C.white],
    type: 'PT Sans Bold label lapisan, Regular satu kalimat penjelasan',
    beats: ['Permukaan dan pembangkit', 'Penampang bumi terbuka berlapis', 'Uap naik lewat sumur produksi', 'Air kembali lewat sumur injeksi'],
    dont: ['Kedalaman ilustratif harus ditandai', 'Siklus injeksi wajib ditampilkan (keberlanjutan)'],
    svg: p => svg(p, `<rect width="640" height="360" fill="#EAF6FB"/><rect y="90" width="640" height="70" fill="${C.n25}"/><rect y="160" width="640" height="80" fill="${C.n50}"/><rect y="240" width="640" height="70" fill="${C.deep}"/><rect class="a-pulse" y="310" width="640" height="50" fill="${C.lime}" opacity=".7"/>
<rect x="200" y="56" width="110" height="34" fill="${C.navy}"/>${[0, 1, 2].map(i => `<circle class="a-steam" style="--d:${i}s" cx="${230 + i * 22}" cy="54" r="10" fill="#fff"/>`).join('')}
<line x1="220" y1="90" x2="220" y2="280" stroke="${C.navy}" stroke-width="10"/><line class="a-flow" style="--dash:6 10;--len:16;--t:.8s;animation-direction:reverse" x1="220" y1="90" x2="220" y2="280" stroke="#fff" stroke-width="3"/>
<path d="M310 74 L440 74 L440 280" fill="none" stroke="${C.teal}" stroke-width="10"/><path class="a-flow" style="--dash:6 10;--len:16;--t:.8s" d="M310 74 L440 74 L440 280" fill="none" stroke="#fff" stroke-width="3"/>
${T(30, 130, 11, 'BATUAN PENUTUP', C.navy, 700, 'letter-spacing="1.5"')}${T(30, 278, 11, 'RESERVOIR', '#fff', 700, 'letter-spacing="1.5"')}${T(30, 340, 11, 'SUMBER PANAS', C.navy, 700, 'letter-spacing="1.5"')}
${T(232, 200, 11, 'SUMUR PRODUKSI', C.navy, 700)}${T(452, 200, 11, 'SUMUR INJEKSI', C.navy, 700)}${T(520, 30, 10, 'Kedalaman ilustratif', C.n75, 400)}`)
  });

  add({
    id: 'green-hydrogen', name: 'Green Hydrogen Chain', cat: 'Teknik & Engineering', tier: 'Spesialis',
    desc: 'Rantai nilai hidrogen hijau dari listrik surya, elektroliser, tangki H₂, sampai pengguna akhir. Gelembung dan aliran menjelaskan proses tanpa rumus.',
    when: 'Inisiatif hidrogen hijau, kerja sama teknologi, pameran transisi energi, pitch investor.',
    aud: 'Mitra teknologi, investor, regulator', formats: ['16:9', '1:1'], dur: '30–60 dtk', pace: 'Sedang',
    ease: 'brand-standard', transition: 'Wave Wipe', palette: [C.white, C.yellow, C.cyan, C.teal, C.navy],
    type: 'PT Sans Bold nama tahap, H₂ dengan subskrip yang benar',
    beats: ['Panel surya menghasilkan listrik', 'Elektroliser memecah air, gelembung naik', 'H₂ tersimpan di tangki', 'Hexagon pengguna: industri, transportasi, pembangkit'],
    dont: ['Jangan menyiratkan proyek sudah beroperasi bila masih kajian', 'Efisiensi hanya dari sumber teknis'],
    svg: p => {
      let g = `<rect width="640" height="360" fill="#fff"/><g transform="translate(40 150) skewX(-20)">${panel(0, 0, 100, 50, C.azure, '#fff')}</g><circle cx="90" cy="100" r="22" fill="${C.yellow}"/>
<path class="a-flow" style="--dash:6 8;--len:14;--t:.8s" d="M150 180 L210 180 M330 180 L390 180 M480 180 L520 180" fill="none" stroke="${C.yellow}" stroke-width="4"/>
<rect x="210" y="120" width="120" height="120" fill="${C.paper}" stroke="${C.navy}" stroke-width="2"/><rect x="220" y="170" width="100" height="62" fill="${C.cyan}" opacity=".45"/>
${[0, 1, 2, 3, 4].map(i => `<circle class="a-steam" style="--d:${(i * .6).toFixed(1)}s" cx="${236 + i * 18}" cy="226" r="4" fill="#fff" stroke="${C.cyan}"/>`).join('')}
<rect x="390" y="130" width="90" height="100" rx="45" fill="${C.teal}"/>${T(435, 190, 22, 'H₂', '#fff', 700, 'text-anchor="middle"')}`;
      ['INDUSTRI', 'TRANSPORT', 'PEMBANGKIT'].forEach((l, i) => g += `<g class="a-pop" ${d(1 + i * .3)}><polygon points="${hexPts(560, 100 + i * 80, 32)}" fill="url(#${p}V)"/>${T(560, 104 + i * 80, 9, l, C.navy, 700, 'text-anchor="middle"')}</g>`);
      g += `${T(90, 270, 12, 'LISTRIK SURYA', C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}${T(270, 270, 12, 'ELEKTROLISER', C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}${T(435, 270, 12, 'PENYIMPANAN', C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}${T(40, 48, 20, 'Dari matahari menjadi hidrogen hijau', C.navy)}`;
      return svg(p, g);
    }
  });

  /* ==================================================================
     KONTRAK SLOT DATA
     Gaya di bawah ini menerima data adegan: svg(p, d) dengan
       d = { title, kicker, lines[], values[{label,value,unit}], steps[], name, role, callout{value,text}, source, icons_on }
     Tanpa d, gaya menampilkan konten contoh galeri. Ukuran teks minimal pada kanvas 640×360:
     judul ≥ 22, label ≥ 14, angka kunci ≥ 32 (= 66/42/96 px pada 1920×1080).
     Angka dengan atribut data-count dihitung naik oleh runtime render (Count-Up).
     ================================================================== */
  const d0 = v => `style="--d:${v}s"`;
  const num = v => { const s = String(v ?? '').replace(/\./g, '').replace(',', '.'); const n = parseFloat(s); return isNaN(n) ? null : n; };
  const decs = v => { const m = String(v ?? '').match(/,(\d+)/); return m ? m[1].length : 0; };
  const cnt = (v, extra = '') => { const n = num(v); return n === null ? extra : `data-count="${n}" data-dec="${decs(v)}" ${extra}`; };
  const xesc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const wrap = (text, max) => { const out = []; let line = ''; String(text || '').split(/\s+/).forEach(w => { if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); if (line) out.push(line); return out; };
  const fitSize = (txt, width, max, min) => Math.max(min, Math.min(max, Math.floor(width / (0.52 * Math.max(1, String(txt).length)))));
  const X = (x, y, s, txt, fill, weight = 700, extra = '') => T(x, y, s, xesc(txt), fill, weight, extra);

  const SLOT = {
    'energy-sweep': { slots: ['lines', 'kicker'], svg: (p, d = {}) => {
      const L = (d.lines && d.lines.length ? d.lines : ['Energi untuk', 'Nusantara']).slice(0, 2);
      const s = Math.min(46, ...L.map(l => fitSize(l, 520, 46, 24)));
      return svg(p, `<rect width="640" height="360" fill="url(#${p}N)"/>
<g class="a-up" ${d0(.6)}>${L.map((l, i) => X(64, 170 + i * (s + 6), s, l, C.white)).join('')}</g>
<rect class="a-wipe" ${d0(1.1)} x="64" y="${170 + (L.length - 1) * (s + 6) + 22}" width="220" height="6" fill="url(#${p}E)"/>
<g class="a-sweepband"><rect x="-200" y="0" width="240" height="360" fill="url(#${p}E)" transform="skewX(-14)"/></g>
${X(64, 300, 14, (d.kicker || 'PT PLN NUSANTARA RENEWABLES').toUpperCase(), C.n25, 700, 'letter-spacing="3"')}`); } },

    'navy-statement': { slots: ['lines', 'kicker'], svg: (p, d = {}) => {
      const L = (d.lines && d.lines.length ? d.lines : ['Bersih.', 'Andal.', 'Berkelanjutan.']).slice(0, 3);
      const s = Math.min(52, ...L.map(l => fitSize(l, 520, 52, 24)));
      const y0 = 180 - ((L.length - 1) * (s + 8)) / 2 + s / 3;
      return svg(p, `<rect width="640" height="360" fill="url(#${p}N)"/>
${L.map((l, i) => `<g class="a-up" ${d0(.2 + i * .5)}>${X(70, y0 + i * (s + 8), s, l, i === L.length - 1 && L.length > 1 ? C.yellow : C.white)}</g>`).join('')}
<rect class="a-wipe" ${d0(.4 + L.length * .5)} x="70" y="${y0 + (L.length - 1) * (s + 8) + 22}" width="180" height="5" fill="url(#${p}E)"/>
${X(70, 70, 14, (d.kicker || '03 — BUDAYA KERJA').toUpperCase(), C.n25, 700, 'letter-spacing="3"')}`); } },

    'kinetic-type': { slots: ['lines', 'values'], svg: (p, d = {}) => {
      const L = (d.lines && d.lines.length ? d.lines : ['TERANGI', 'Nusantara dengan', 'EBT']).slice(0, 3);
      const v = d.values && d.values[0] ? d.values[0] : (d.lines ? null : { value: '23', unit: '%' });
      let y = 60, g = `<rect width="640" height="360" fill="#fff"/>`;
      L.forEach((l, i) => { const s = fitSize(l, v && i === L.length - 1 ? 380 : 560, i % 2 ? 54 : 80, 28); y += s + 8; g += `<g class="a-kin" ${d0(i * .5)}>${X(40, y, s, l, i % 2 ? C.deep : C.navy)}</g>`; if (v && i === L.length - 1) g += `<g class="a-kin" ${d0(i * .5 + .2)}><rect x="${Math.min(470, 60 + l.length * s * .55)}" y="${y - s * .8}" width="150" height="${s * .9}" fill="${C.yellow}"/>${X(Math.min(470, 60 + l.length * s * .55) + 12, y - s * .2, Math.min(40, s * .55), v.value + (v.unit === '%' ? '%' : ''), C.navy, 700, v.unit === '%' ? cnt(v.value) : '')}</g>`; });
      return svg(p, g + (d.lines ? '' : X(40, 340, 14, 'Target bauran ilustratif', C.inkSoft, 400))); } },

    'arc-kpi': { slots: ['values'], svg: (p, d = {}) => {
      const V = (d.values && d.values.length ? d.values : [{ label: 'Progres EPC', value: '82', unit: '%' }, { label: 'TKDN', value: '64', unit: '%' }, { label: 'Ketersediaan', value: '91', unit: '%' }]).slice(0, 3);
      const xs = { 1: [320], 2: [205, 435], 3: [130, 320, 510] }[V.length];
      let g = `<rect width="640" height="360" fill="#fff"/>`;
      V.forEach((v, i) => {
        const x = xs[i], r = 66, len = 2 * Math.PI * r, n = num(v.value), pct = v.unit === '%', tgt = num(v.target);
        const frac = n === null ? null : pct ? Math.max(0, Math.min(1, n / 100)) : tgt ? Math.max(0, Math.min(1, n / tgt)) : null, arc = len * (frac ?? 0);
        const big = v.value + (v.unit === '%' ? '%' : '');
        const s = fitSize(big, 86, 32, 22);
        g += `<circle cx="${x}" cy="160" r="${r}" fill="none" stroke="${C.paper}" stroke-width="14"/>
${frac === null ? '' : `<circle class="a-arc" style="--len:${len.toFixed(0)};--arc:${(len - arc).toFixed(0)};--d:${.2 + i * .4}s" cx="${x}" cy="160" r="${r}" fill="none" stroke="url(#${p}E)" stroke-width="14" stroke-linecap="round" stroke-dasharray="${len.toFixed(0)}" stroke-dashoffset="${(len - arc).toFixed(0)}" transform="rotate(-90 ${x} 160)"/>`}
<circle class="a-pop" style="--d:${.1 + i * .4}s" cx="${x}" cy="160" r="48" fill="${C.navy}"/>${X(x, 160 + s * .36, s, big, '#fff', 700, 'text-anchor="middle" ' + (pct ? cnt(v.value, '') : 'class="a-up" style="--d:' + (.3 + i * .4) + 's"'))}
${!pct && tgt ? X(x, 232, 12, 'dari target ' + v.target + ' ' + (v.unit || ''), C.inkSoft, 400, 'text-anchor="middle"') : ''}
${v.unit && v.unit !== '%' ? X(x, 250, 14, v.unit, C.inkSoft, 700, 'text-anchor="middle"') : ''}${X(x, 276, 14, String(v.label || '').toUpperCase(), C.navy, 700, 'text-anchor="middle" letter-spacing="1"')}`;
      });
      return svg(p, g + X(40, 336, 12, d.source ? 'Sumber: ' + d.source : 'Angka ilustratif', C.inkSoft, 400)); } },

    'answer-first': { slots: ['title', 'values', 'callout', 'source'], svg: (p, d = {}) => {
      const title = d.title || 'Kapasitas terpasang naik paling tajam pada tahun terakhir';
      const V = (d.values && d.values.length ? d.values : [70, 92, 110, 128, 176].map((h, i) => ({ label: 'T' + (i + 1), value: String(h * 4) }))).slice(0, 6);
      const tl = wrap(title, 40).slice(0, 2), max = Math.max(...V.map(v => num(v.value) || 0), 1);
      const unit = d.unit_line || (V[0].unit ? `${V[0].unit}` : 'MW, ilustratif');
      const callout = d.callout || (d.values ? null : { value: '+38%', text: 'pertumbuhan tahun terakhir' });
      const area = callout ? 360 : 540, bw = Math.min(56, area / V.length - 16), step = area / V.length;
      let g = `<rect width="640" height="360" fill="#fff"/>${tl.map((l, i) => X(32, 44 + i * 27, 22, l, C.navy)).join('')}<rect x="32" y="${44 + (tl.length - 1) * 27 + 12}" width="120" height="2" fill="url(#${p}E)"/><rect x="152" y="${44 + (tl.length - 1) * 27 + 12}" width="456" height="2" fill="${C.line}"/>${X(32, 44 + (tl.length - 1) * 27 + 34, 12, unit, C.inkSoft, 400)}`;
      V.forEach((v, i) => {
        const h = Math.max(4, 170 * (num(v.value) || 0) / max), x = 40 + i * step + (step - bw) / 2, c = i === V.length - 1 ? C.cyan : C.navy;
        g += `<rect class="a-grow" ${d0(.3 + i * .25)} x="${x}" y="${300 - h}" width="${bw}" height="${h}" fill="${c}"/>${X(x + bw / 2, 292 - h, 14, v.value, C.navy, 700, 'text-anchor="middle"')}${X(x + bw / 2, 320, 14, v.label, C.inkSoft, 400, 'text-anchor="middle"')}`;
      });
      if (callout) g += `<g class="a-up" ${d0(1.9)}><rect x="420" y="140" width="190" height="120" fill="${C.paper}"/><rect x="420" y="140" width="4" height="120" fill="${C.cyan}"/>${X(438, 196, 34, callout.value, C.navy)}${wrap(callout.text, 22).slice(0, 2).map((l, i) => X(438, 222 + i * 18, 14, l, C.navy, 400)).join('')}</g>`;
      return svg(p, g + X(32, 346, 11, 'Sumber: ' + (d.source || 'data ilustratif untuk contoh gaya'), C.inkSoft, 400)); } },

    'waterfall': { slots: ['title', 'values', 'source'], svg: (p, d = {}) => {
      const title = d.title || 'Interkoneksi menyumbang porsi terbesar kenaikan biaya';
      const V = (d.values && d.values.length >= 3 ? d.values : [{ label: 'Awal', value: '150' }, { label: 'Lahan', value: '20' }, { label: 'Interkoneksi', value: '46' }, { label: 'Kurs', value: '-18' }, { label: 'Efisiensi', value: '-12' }, { label: 'Akhir', value: '186' }]).slice(0, 7);
      const tl = wrap(title, 44).slice(0, 2);
      let run = num(V[0].value) || 0, top = run; V.slice(1, -1).forEach(v => { run += num(v.value) || 0; top = Math.max(top, run); }); top = Math.max(top, num(V[V.length - 1].value) || 0);
      const k = 180 / top, base = 300, step = 576 / V.length, bw = Math.min(56, step - 18);
      let g = `<rect width="640" height="360" fill="#fff"/>${tl.map((l, i) => X(32, 40 + i * 27, 22, l, C.navy)).join('')}${X(32, 40 + (tl.length - 1) * 27 + 24, 12, d.unit_line || 'USD juta, ilustratif', C.inkSoft, 400)}`;
      let cur = 0;
      V.forEach((v, i) => {
        const n = num(v.value) || 0, first = i === 0, last = i === V.length - 1, x = 32 + i * step + (step - bw) / 2;
        let y, h, c, lab;
        if (first || last) { y = base - n * k; h = n * k; c = last ? C.cyan : C.navy; lab = v.value; cur = first ? n : cur; }
        else { const a = cur, b = cur + n; y = base - Math.max(a, b) * k; h = Math.abs(n) * k; c = n >= 0 ? C.teal : C.navy; lab = (n >= 0 ? '▲ ' : '▼ ') + String(v.value).replace('-', ''); cur = b; }
        g += `<rect class="a-grow" ${d0(.2 + i * .3)} x="${x}" y="${y}" width="${bw}" height="${Math.max(2, h)}" fill="${c}"/>${X(x + bw / 2, y - 6, 14, lab, C.navy, 700, 'text-anchor="middle"')}${X(x + bw / 2, 324, 14, v.label, C.inkSoft, 400, 'text-anchor="middle"')}`;
        if (!last) g += `<line x1="${x + bw}" y1="${base - cur * k}" x2="${x + step}" y2="${base - cur * k}" stroke="${C.n25}" stroke-dasharray="3 3"/>`;
      });
      return svg(p, g + X(32, 348, 11, 'Sumber: ' + (d.source || 'ilustratif'), C.inkSoft, 400)); } },

    'isotype': { slots: ['title', 'values', 'icons_on', 'source'], svg: (p, d = {}) => {
      const title = d.title || 'Setiap simbol = 1.000 rumah tangga';
      const v = d.values && d.values[0] ? d.values[0] : { value: '58.000', label: 'rumah tangga (contoh)' };
      const on = Math.max(0, Math.min(70, d.icons_on ?? 58));
      let g = `<rect width="640" height="360" fill="#fff"/>${X(32, 46, 22, title, C.navy)}${X(32, 70, 12, 'Sumber: ' + (d.source || 'faktor konversi ilustratif'), C.inkSoft, 400)}`;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) { const i = r * 14 + c; g += `<g class="a-pop" style="--d:${(i * .03).toFixed(2)}s;--t:7s">${house(32 + c * 28, 96 + r * 34, i < on ? (i >= on - 8 ? C.cyan : C.navy) : C.paper)}</g>`; }
      const s = fitSize(v.value, 200, 40, 32);
      return svg(p, g + `<g class="a-up" ${d0(2.2)}>${X(436, 296, s, v.value, C.navy, 700, cnt(v.value))}${wrap(v.label || '', 24).slice(0, 2).map((l, i) => X(436, 320 + i * 18, 14, l, C.navy, 400)).join('')}</g>`); } },

    'hex-rail': { slots: ['title', 'steps'], svg: (p, d = {}) => {
      const st = (d.steps && d.steps.length ? d.steps : ['Usulan', 'Kajian', 'Review', 'Persetujuan', 'Eksekusi']).slice(0, 5);
      const gap = 480 / Math.max(1, st.length - 1);
      let g = `<rect width="640" height="360" fill="url(#${p}B)"/><rect x="80" y="178" width="480" height="5" fill="#fff" fill-opacity=".25"/><rect class="a-wipe" style="--t:6s" x="80" y="178" width="480" height="5" fill="${C.yellow}"/>`;
      st.forEach((l, i) => { const x = 80 + i * gap; g += `<g class="a-pop" style="--d:${(i * .55).toFixed(2)}s;--t:6s"><polygon points="${hexPts(x, 180, 30)}" fill="${C.yellow}"/>${X(x, 189, 22, String(i + 1).padStart(2, '0'), C.navy, 700, 'text-anchor="middle"')}${wrap(String(l).toUpperCase(), 13).slice(0, 2).map((w, k) => X(x, 240 + k * 18, 14, w, '#fff', 700, 'text-anchor="middle" letter-spacing="1"')).join('')}</g>`; });
      return svg(p, g + X(40, 70, 26, d.title || 'Alur persetujuan investasi', '#fff')); } },

    'sop-checklist': { slots: ['title', 'steps'], svg: (p, d = {}) => {
      const st = (d.steps && d.steps.length ? d.steps : ['Identifikasi sumber energi', 'Beri tahu pihak terdampak', 'Matikan dan isolasi', 'Pasang gembok dan tag', 'Verifikasi energi nol']).slice(0, 5);
      let g = `<rect width="640" height="360" fill="${C.paper}"/>${X(32, 50, 22, d.title || 'Prosedur Lock-Out Tag-Out', C.navy)}`;
      st.forEach((s, i) => { const y = 78 + i * 52; g += `<rect x="32" y="${y}" width="380" height="42" fill="#fff"/><rect x="44" y="${y + 11}" width="20" height="20" fill="#fff" stroke="${C.navy}" stroke-width="2"/><path class="a-draw" style="--len:30;--d:${(.4 + i * .5).toFixed(1)}s;--t:7s" d="M48 ${y + 21} L53 ${y + 26} L61 ${y + 15}" fill="none" stroke="${C.cyan}" stroke-width="3"/>${X(76, y + 27, 15, s, C.navy, 700)}`; });
      const r = 70, len = (2 * Math.PI * r).toFixed(0);
      return svg(p, g + `<circle cx="520" cy="190" r="${r}" fill="none" stroke="#fff" stroke-width="14"/><circle class="a-arc" style="--len:${len};--arc:0;--t:7s" cx="520" cy="190" r="${r}" fill="none" stroke="${C.teal}" stroke-width="14" stroke-dasharray="${len}" transform="rotate(-90 520 190)"/>${X(520, 202, 32, st.length + '/' + st.length, C.navy, 700, 'text-anchor="middle"')}${X(520, 292, 14, '● SELESAI', C.navy, 700, 'text-anchor="middle" letter-spacing="1.5"')}`); } },

    'lower-third': { slots: ['name', 'role'], svg: (p, d = {}) => {
      const name = d.name || 'Nama Narasumber', role = d.role || 'Jabatan, PT PLN Nusantara Renewables';
      const w = Math.min(560, Math.max(300, Math.max(name.length * 13, role.length * 8.2) + 40));
      return svg(p, `<linearGradient id="${p}ft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FA7BD"/><stop offset="1" stop-color="#005F89"/></linearGradient>
<rect width="640" height="360" fill="url(#${p}ft)"/><rect x="0" y="0" width="640" height="360" fill="#00324F" opacity=".25"/>
<g class="a-float" style="--amp:-3px;--t:5s"><circle cx="420" cy="130" r="46" fill="#C9DCE6"/><path d="M330 360 C330 240 510 240 510 360Z" fill="#C9DCE6"/></g>
<clipPath id="${p}ltc"><rect class="a-wipe" style="--t:6s;--d:.15s" x="46" y="246" width="${w}" height="72"/></clipPath>
<g class="lt-block"><rect class="a-grow" style="--t:6s" x="40" y="246" width="6" height="72" fill="${C.yellow}"/>
<rect class="a-wipe" style="--t:6s;--d:.15s" x="46" y="246" width="${w}" height="72" fill="#fff"/>
<g clip-path="url(#${p}ltc)"><g class="a-up" style="--t:6s;--d:.4s">${X(64, 278, 22, name, C.navy)}${X(64, 302, 14, role, C.inkSoft, 400)}</g></g></g>
${d.name ? '' : X(600, 340, 10, 'FOOTAGE PLACEHOLDER', '#E6F4FB', 700, 'text-anchor="end" letter-spacing="2"')}`); } }
  };
  /* Golden-Hour: lower third lokasi berasal dari data; tanpa data proyek, tidak menampilkan lokasi contoh. */
  const ghBase = S.find(s => s.id === 'golden-hour').svg;
  SLOT['golden-hour'] = { slots: ['location', 'sublabel', 'subject'], svg: (p, d) => {
    let v = ghBase(p);
    if (d && d.subject === 'surya') {   // ganti turbin dengan deret panel surya terapung
      v = v.replace(/<line[^>]*stroke="#0B3550"[^>]*\/>/g, '').replace(/<g class="a-spin"[^>]*>(?:<line[^>]*\/>)+<\/g>/g, '').replace(/<circle[^>]*fill="#0B3550"\/>/g, '');
      let rows = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) rows += `<g transform="translate(${30 + c * 66 + r * 22} ${252 + r * 22}) skewX(-28)"><rect width="56" height="14" fill="#0B3550"/><line x1="28" y1="0" x2="28" y2="14" stroke="${C.azure}" stroke-width="1"/></g>`;
      v = v.replace('<rect width="640" height="36" fill="#001A2A"/>', `<g class="a-float" style="--amp:-2px;--t:5s">${rows}</g><rect width="640" height="36" fill="#001A2A"/>`);
    }
    const box = /<g class="a-up"[^>]*><rect x="40" y="262"[\s\S]*?<\/g>/;
    if (!d) return v;
    if (!d.location) return v.replace(box, '');
    const s = fitSize(d.location, 520, 18, 14);
    // posisi dinaikkan agar tidak bertabrakan dengan zona caption di bawah
    return v.replace(box, `<g class="a-up" ${d0(1)}><rect x="40" y="218" width="4" height="44" fill="${C.yellow}"/>${X(54, 238, s, d.location, '#fff')}${d.sublabel ? X(54, 258, 13, d.sublabel, '#E6F4FB', 400) : ''}</g>`);
  } };
  /* Travel Poster: nama lokasi dari data (field location); tanpa itu memakai judul contoh. */
  const tpBase = S.find(s => s.id === 'travel-poster').svg;
  SLOT['travel-poster'] = { slots: ['location'], svg: (p, d) => {
    const v = tpBase(p);
    if (!d || !d.location) return v;
    const t = String(d.location).toUpperCase(), s = fitSize(t, 600, 32, 18);
    return v.replace(/<text x="320" y="336"[^>]*>PANAS BUMI NUSANTARA<\/text>/, X(320, 336, s, t, '#fff', 700, `text-anchor="middle" letter-spacing="${s > 24 ? 6 : 3}"`));
  } };
  const nmBase = S.find(s => s.id === 'nusantara-map').svg;
  SLOT['nusantara-map'] = { slots: ['kicker'], svg: (p, d) => {
    const v = nmBase(p);
    if (!d) return v;
    return v.replace(/<text x="30" y="330"[^>]*>Portofolio pembangkit EBT<\/text>/, '').replace(/<text x="330" y="330"/, '<text x="610" y="26" text-anchor="end"');
  } };
  S.forEach(s => { if (SLOT[s.id]) { s.slots = SLOT[s.id].slots; s.svg = SLOT[s.id].svg; } else s.slots = []; });

  // ------------------------------------------------------------------
  /* A–Z: kebutuhan animasi PLN NR → gaya utama & alternatif */
  const AZ = [
    ['A', 'Annual Report & RUPS', 'Pemegang saham, Dekom', ['answer-first', 'arc-kpi'], ['navy-statement', 'golden-hour'], '90–180 dtk', '16:9'],
    ['B', 'Board Briefing Direksi', 'Direksi', ['answer-first', 'waterfall'], ['authority-ladder', 'risk-heatmap'], '60–120 dtk', '16:9'],
    ['C', 'COD & Commissioning', 'Publik, PLN Induk, media', ['golden-hour', 'logo-sting'], ['lower-third', 'countdown', 'chevron-chapter'], '60–120 dtk', '16:9 · 9:16'],
    ['D', 'Dekarbonisasi & NZE 2060', 'Publik, regulator', ['energy-sankey', 'hex-bloom'], ['day-night', 'transit-roadmap'], '60–90 dtk', '16:9'],
    ['E', 'ESG & Safeguard', 'Lender, investor ESG', ['isotype', 'split-screen'], ['contour-topo', 'three-lines'], '60–120 dtk', '16:9'],
    ['F', 'Financing & Green Bond', 'Lender, investor', ['waterfall', 'covenant-gauge'], ['arc-kpi', 'nusantara-map'], '60–90 dtk', '16:9'],
    ['G', 'Groundbreaking & Water Breaking', 'Publik, media', ['lens-mask', 'golden-hour'], ['countdown', 'energy-sweep'], '30–90 dtk', '16:9 · 9:16'],
    ['H', 'HSE / K3', 'Karyawan, kontraktor', ['safety-pictogram', 'sop-checklist'], ['site-walkthrough'], '60–180 dtk', '16:9 · 9:16'],
    ['I', 'Investor & Kemitraan', 'Mitra strategis, investor', ['nusantara-map', 'hero-reveal'], ['covenant-gauge', 'answer-first'], '60–120 dtk', '16:9'],
    ['J', 'JETP & Kebijakan Transisi', 'Regulator, mitra internasional', ['energy-sankey', 'transit-roadmap'], ['whiteboard'], '60–120 dtk', '16:9'],
    ['K', 'Kinerja & KPI Bulanan', 'Manajemen', ['live-ops', 'arc-kpi'], ['answer-first'], '30–60 dtk', '16:9'],
    ['L', 'Lingkungan & Biodiversitas', 'Publik, lender', ['watercolor', 'paper-layers'], ['contour-topo'], '60–120 dtk', '16:9 · 1:1'],
    ['M', 'Masyarakat / TJSL', 'Komunitas, sekolah', ['soft-clay', 'flat-explainer'], ['wayang-silhouette', 'paper-layers'], '60–180 dtk', '16:9 · 9:16'],
    ['N', 'Nusantara Portfolio', 'Semua audiens', ['nusantara-map', 'travel-poster'], ['batik-generative', 'monoline-scene'], '30–90 dtk', '16:9 · 1:1'],
    ['O', 'Onboarding Karyawan', 'Karyawan baru', ['whiteboard', 'hex-rail'], ['flat-explainer', 'wave-edge'], '120–300 dtk', '16:9'],
    ['P', 'Pembangkit Explained (PLTS/PLTB/PLTP/PLTA)', 'Umum, mahasiswa', ['isometric-plant', 'cutaway'], ['hydro-flow', 'geothermal-section', 'blueprint'], '60–180 dtk', '16:9'],
    ['Q', 'Quality, GRC & Kepatuhan', 'SPI, Komite Audit', ['three-lines', 'risk-heatmap'], ['hex-rail', 'sop-checklist'], '60–120 dtk', '16:9'],
    ['R', 'RJPP / RKAP', 'Direksi, Dekom', ['transit-roadmap', 'waterfall'], ['hex-bloom'], '60–120 dtk', '16:9'],
    ['S', 'Sosial Media & Kampanye', 'Publik muda', ['vertical-reels', 'caption-pack'], ['kinetic-type', 'travel-poster'], '15–45 dtk', '9:16 · 1:1'],
    ['T', 'Teknologi Baru (BESS, Hidrogen, Digital Twin)', 'Mitra teknis, investor', ['green-hydrogen', 'glass-tech'], ['wireframe', 'hero-reveal'], '60–120 dtk', '16:9'],
    ['U', 'Unit O&M & Inspeksi', 'Teknisi, manajemen aset', ['thermal-inspection', 'single-line'], ['live-ops', 'cutaway'], '30–120 dtk', '16:9'],
    ['V', 'Visi, Misi & Budaya AKHLAK', 'Karyawan', ['navy-statement', 'kinetic-type'], ['hex-bloom'], '30–90 dtk', '16:9 · 9:16'],
    ['W', 'Water: PLTA & PLTS Terapung', 'Umum, regulator', ['hydro-flow', 'contour-topo'], ['watercolor', 'lens-mask'], '60–120 dtk', '16:9'],
    ['X', 'eXhibition & Booth Loop', 'Pengunjung pameran', ['night-glow', 'particle-field'], ['batik-generative', 'countdown'], 'Loop 30–120 dtk', '16:9 · ultra-wide'],
    ['Y', 'Youth & Rekrutmen Talenta', 'Mahasiswa, profesional muda', ['vertical-reels', 'low-poly'], ['flat-explainer', 'soft-clay'], '30–60 dtk', '9:16 · 16:9'],
    ['Z', 'Zero Accident & Zero Emission', 'Internal dan publik', ['site-walkthrough', 'day-night'], ['safety-pictogram', 'tenun-weave'], '30–90 dtk', '16:9 · 9:16']
  ];

  // hubungkan huruf A–Z ke tiap style
  S.forEach(s => { s.letters = AZ.filter(r => r[3].includes(s.id) || r[4].includes(s.id)).map(r => r[0]); s.no = String(S.indexOf(s) + 1).padStart(2, '0'); });

  /* Arah produksi per rumpun: musik, tempo, nada VO, tools. Dapat ditimpa per gaya lewat PROD_OVERRIDE. */
  const FAMILY_PROD = {
    'Signature PLN NR': { music: 'Orkestral-elektronik hangat, membangun perlahan', bpm: '90–100', vo: 'Tenang dan berwibawa', tools: ['After Effects', 'Lottie', 'PLN NR render engine'] },
    'Data & Eksekutif': { music: 'Ambient minimal, piano dan pulse halus', bpm: '80–90', vo: 'Jelas, faktual, tempo sedang', tools: ['PLN NR render engine', 'After Effects', 'D3/SVG'] },
    'Teknik & Engineering': { music: 'Elektronik bersih dengan tekstur mekanis halus', bpm: '95–110', vo: 'Teknis dan presisi', tools: ['Blender', 'After Effects', 'PLN NR render engine'] },
    'Edukasi & Explainer': { music: 'Akustik ringan: marimba, gitar, ukulele', bpm: '100–115', vo: 'Ramah dan bercerita', tools: ['After Effects', 'PLN NR render engine', 'Lottie'] },
    'Nusantara & Budaya': { music: 'Gamelan atau kolintang modern dengan pad', bpm: '70–90', vo: 'Bertutur dan hangat', tools: ['After Effects', 'Generative (p5/Canvas)'] },
    'Kampanye & Sosial': { music: 'Pop elektronik upbeat, hook di 2 dtk pertama', bpm: '110–125', vo: 'Energik dan muda', tools: ['After Effects', 'CapCut/Premiere', 'PLN NR render engine'] },
    'K3 & Operasional': { music: 'Minimal, perkusi lembut, tanpa ketegangan dramatis', bpm: '85–95', vo: 'Tegas dan jelas', tools: ['After Effects', 'PLN NR render engine'] },
    'Dokumenter & Sinematik': { music: 'Orkestral sinematik, strings dan piano', bpm: '70–85', vo: 'Reflektif dan bermakna', tools: ['Premiere/DaVinci', 'After Effects'] },
    'Tata Kelola & Keuangan': { music: 'Ambient korporat netral, tanpa melodi menonjol', bpm: '80–90', vo: 'Formal dan terukur', tools: ['PLN NR render engine', 'After Effects'] },
    'Paket Broadcast': { music: 'Stinger 2–4 dtk + bed loop bermerek', bpm: '100–120', vo: 'Tidak ada / mengikuti program', tools: ['After Effects (MOGRT)', 'Lottie', 'PLN NR render engine'] }
  };
  /* Tingkat usaha produksi: 1 = template ringan (≤ 2 hari), 2 = sedang (3–5 hari), 3 = berat (≥ 1 minggu, ilustrasi/3D khusus) */
  const EFFORT = {
    'energy-sweep': 1, 'hex-bloom': 1, 'navy-statement': 1, 'monoline-scene': 2, 'lens-mask': 1, 'chevron-chapter': 1, 'wave-edge': 1,
    'answer-first': 1, 'arc-kpi': 1, 'waterfall': 1, 'nusantara-map': 2, 'transit-roadmap': 2, 'isotype': 1, 'live-ops': 2,
    'blueprint': 2, 'isometric-plant': 3, 'cutaway': 3, 'wireframe': 3, 'energy-sankey': 2, 'single-line': 2, 'thermal-inspection': 2,
    'whiteboard': 2, 'flat-explainer': 2, 'paper-layers': 2, 'kinetic-type': 1, 'glass-tech': 1, 'hex-rail': 1,
    'batik-generative': 2, 'wayang-silhouette': 3, 'watercolor': 3, 'travel-poster': 2, 'tenun-weave': 1,
    'vertical-reels': 1, 'hero-reveal': 3, 'night-glow': 2, 'low-poly': 2, 'soft-clay': 3, 'particle-field': 2,
    'safety-pictogram': 1, 'sop-checklist': 1, 'site-walkthrough': 2, 'golden-hour': 2, 'contour-topo': 2, 'day-night': 2,
    'authority-ladder': 1, 'risk-heatmap': 1, 'covenant-gauge': 1, 'three-lines': 1,
    'logo-sting': 1, 'lower-third': 1, 'caption-pack': 1, 'countdown': 1, 'split-screen': 1,
    'hydro-flow': 2, 'geothermal-section': 2, 'green-hydrogen': 2
  };
  const PROD_OVERRIDE = {
    'wireframe': { tools: ['Blender', 'Cinema 4D'] }, 'hero-reveal': { tools: ['Blender', 'Cinema 4D', 'After Effects'] }, 'soft-clay': { tools: ['Blender', 'Cinema 4D'] },
    'golden-hour': { tools: ['Footage drone', 'DaVinci Resolve'] }, 'particle-field': { tools: ['TouchDesigner', 'Canvas/WebGL'] },
    'batik-generative': { tools: ['p5.js / Canvas', 'After Effects'] }, 'logo-sting': { music: 'Sonic logo 2–3 dtk (satu versi untuk semua video)' }
  };
  S.forEach(s => {
    const f = FAMILY_PROD[s.cat] || {};
    const o = PROD_OVERRIDE[s.id] || {};
    s.prod = { effort: EFFORT[s.id] || 2, music: o.music || f.music, bpm: o.bpm || f.bpm, vo: o.vo || f.vo, tools: o.tools || f.tools };
  });

  /* Resep video: rangkaian gaya menjadi satu video utuh. sec = durasi segmen (detik). */
  const RECIPES = [
    { id: 'cod-90', name: 'Video Peresmian COD', letter: 'C', aspect: '16:9', goal: 'Mengumumkan pembangkit beroperasi komersial dan dampaknya.', segs: [
      ['logo-sting', 4, 'Ident pembuka', 'Satu versi ident untuk semua video'], ['golden-hour', 26, 'Establishing', 'Footage drone senja, lower third lokasi'],
      ['nusantara-map', 12, 'Konteks portofolio', 'Zoom ke lokasi pembangkit'], ['arc-kpi', 14, 'Angka kunci', 'Kapasitas, TKDN, progres; satu angka disorot'],
      ['lower-third', 28, 'Testimoni', 'Direksi dan warga sekitar, 2 narasumber'], ['energy-sweep', 6, 'Penutup', 'Pesan satu kalimat + lockup']] },
    { id: 'board-120', name: 'Briefing Direksi 2 Menit', letter: 'B', aspect: '16:9', goal: 'Membawa Direksi ke keputusan dengan argumen answer-first.', segs: [
      ['navy-statement', 8, 'Jawaban di depan', 'Satu kalimat kesimpulan'], ['answer-first', 34, 'Bukti utama', 'Satu grafik, satu sinyal cyan'],
      ['waterfall', 30, 'Mengapa angka berubah', 'Maksimal 6 langkah'], ['risk-heatmap', 22, 'Risiko dan mitigasi', 'Inheren ke residual'],
      ['authority-ladder', 14, 'Dasar kewenangan', 'Organ berwenang dan aturan'], ['navy-statement', 12, 'Permintaan', 'Apa yang diminta dan kapan']] },
    { id: 'safety-180', name: 'Safety Induction Lokasi', letter: 'H', aspect: '16:9', goal: 'Tamu dan kontraktor memahami bahaya, APD, dan jalur aman sebelum masuk lokasi.', segs: [
      ['logo-sting', 4, 'Ident', ''], ['site-walkthrough', 50, 'Denah dan jalur aman', 'Zona bahaya, titik kumpul'],
      ['safety-pictogram', 56, 'APD wajib', 'Satu rambu per kalimat'], ['sop-checklist', 54, 'Prosedur kunci', 'Izin kerja / LOTO'],
      ['navy-statement', 10, 'Komitmen', 'Zero accident'], ['logo-sting', 6, 'Penutup', '']] },
    { id: 'reels-30', name: 'Reels Kampanye 30 Detik', letter: 'S', aspect: '9:16', goal: 'Menarik perhatian publik muda dalam 2 detik dan meninggalkan satu pesan.', segs: [
      ['vertical-reels', 3, 'Hook', 'Pertanyaan atau angka mengejutkan'], ['kinetic-type', 9, 'Pesan inti', 'Maksimal 3 kata per detik'],
      ['day-night', 10, 'Bukti visual', 'Siklus surya + baterai'], ['travel-poster', 5, 'Kebanggaan lokasi', ''], ['logo-sting', 3, 'Lockup', 'Caption tetap aktif']] },
    { id: 'onboarding-240', name: 'Onboarding Karyawan Baru', letter: 'O', aspect: '16:9', goal: 'Karyawan baru memahami bisnis, alur kerja, dan budaya PLN NR.', segs: [
      ['energy-sweep', 6, 'Pembuka', ''], ['monoline-scene', 30, 'Siapa kita', 'Profil dan portofolio'], ['whiteboard', 84, 'Cara kerja bisnis', 'Dari proyek sampai listrik mengalir'],
      ['hex-rail', 60, 'Alur kerja kunci', 'Persetujuan, pengadaan'], ['flat-explainer', 48, 'Budaya kerja', 'AKHLAK dalam keseharian'], ['navy-statement', 12, 'Selamat bergabung', '']] },
    { id: 'investor-120', name: 'Pitch Investor & Mitra', letter: 'I', aspect: '16:9', goal: 'Meyakinkan mitra tentang portofolio, kesiapan teknis, dan bankability.', segs: [
      ['logo-sting', 4, 'Ident', ''], ['nusantara-map', 24, 'Portofolio', 'Sebaran dan total kapasitas'], ['hero-reveal', 20, 'Teknologi', 'Aset unggulan'],
      ['answer-first', 30, 'Kinerja', 'Pertumbuhan dengan sumber'], ['covenant-gauge', 26, 'Bankability', 'Headroom kovenan'], ['navy-statement', 16, 'Ajakan kemitraan', '']] },
    { id: 'booth-60', name: 'Loop Booth Pameran', letter: 'X', aspect: '16:9', goal: 'Menarik pengunjung dari jarak jauh tanpa suara.', segs: [
      ['particle-field', 15, 'Atraksi', 'Tanpa teks kecil'], ['night-glow', 15, 'Emosi', 'Listrik sampai ke rumah'], ['batik-generative', 15, 'Identitas', ''], ['monoline-scene', 15, 'Profil', 'Loop mulus ke awal']] },
    { id: 'esg-90', name: 'Update ESG untuk Lender', letter: 'E', aspect: '16:9', goal: 'Menunjukkan kepatuhan safeguard dan dampak terukur kepada lender.', segs: [
      ['contour-topo', 18, 'Konteks lokasi', 'Daerah tangkapan, sensitivitas'], ['isotype', 20, 'Dampak terukur', 'Faktor konversi tertulis'], ['split-screen', 16, 'Bukti rehabilitasi', 'Sebelum/sesudah, tanggal sama'],
      ['three-lines', 22, 'Tata kelola', 'Siapa memantau apa'], ['wave-edge', 14, 'Ringkasan dan tindak lanjut', '']] }
  ];
  RECIPES.forEach(r => { r.total = r.segs.reduce((a, s) => a + s[1], 0); });

  /* Checklist QA sebelum tayang */
  const QA = [
    ['Merek', ['Lockup dari aset resmi, posisi dan ukuran benar', 'Hanya warna ramp PLN NR; merah hanya di petir logo', 'Teks gelap navy, tidak hitam', 'Satu sinyal per bingkai (cyan di putih, kuning di navy)', 'Ident pembuka/penutup memakai versi resmi']],
    ['Konten', ['Setiap angka punya baris Sumber dan sudah diverifikasi', 'Angka ilustratif sudah diganti data resmi', 'Nama, jabatan, lokasi dieja benar', 'Bahasa Indonesia baku, desimal koma, ribuan titik', 'Tidak ada klaim proyek yang belum diputuskan']],
    ['Aksesibilitas', ['Caption Bahasa Indonesia tersedia (SRT)', 'Teks layar maksimal 3 kata per detik', 'Kontras teks minimal 4,5:1', 'Status tidak hanya warna (▲ ● ▼)', 'Tanpa kedipan lebih dari 3 kali per detik']],
    ['Teknis', ['Resolusi dan rasio sesuai kanal', 'Teks di dalam title-safe 90%', 'Loudness −14 LUFS (sosial) / −23 LUFS (siaran)', 'Musik berlisensi untuk kanal yang dipakai', 'Thumbnail dan judul file sesuai konvensi']]
  ];

  /* Tata bahasa gerak: transisi resmi */
  const TRANSITIONS = [
    { key: 'Cross-fade 220 ms', ms: 220, ease: 'cubic-bezier(.4,0,.2,1)', use: 'Default antarslide dan antaradegan. Dipakai 70% waktu.', cls: 'tx-fade' },
    { key: 'Energy Sweep', ms: 800, ease: 'cubic-bezier(.4,0,.2,1)', use: 'Pembuka, penutup, bumper bab. Maksimal 2 kali per video.', cls: 'tx-sweep' },
    { key: 'Hex Bloom', ms: 700, ease: 'cubic-bezier(.16,1,.3,1)', use: 'Memperkenalkan pilar, nilai, atau siklus.', cls: 'tx-hex' },
    { key: 'Wave Wipe', ms: 650, ease: 'cubic-bezier(.4,0,.2,1)', use: 'Pergantian halaman di materi informatif panjang.', cls: 'tx-wave' },
    { key: 'Chevron Push', ms: 520, ease: 'cubic-bezier(0,0,.2,1)', use: 'Masuk ke bab baru; arah maju.', cls: 'tx-chev' },
    { key: 'Lens Iris', ms: 800, ease: 'cubic-bezier(0,0,.2,1)', use: 'Membuka footage atau peta; fokus ke satu lokasi.', cls: 'tx-lens' },
    { key: 'Line Draw', ms: 1200, ease: 'linear', use: 'Diagram teknis, line-art, peta jalan tergambar.', cls: 'tx-line' },
    { key: 'Dip Navy', ms: 420, ease: 'cubic-bezier(.4,0,.2,1)', use: 'Otomatis saat kecerahan dua adegan berbeda jauh; mencegah kilatan navy ke putih.', cls: 'tx-dip' },
    { key: 'Count-Up', ms: 900, ease: 'cubic-bezier(.16,1,.3,1)', use: 'Angka KPI; tahan angka akhir minimal 1,5 dtk.', cls: 'tx-count' }
  ];

  const EASES = {
    'brand-standard': 'cubic-bezier(.4,0,.2,1)', 'entrance': 'cubic-bezier(0,0,.2,1)', 'emphasis': 'cubic-bezier(.16,1,.3,1)', 'exit': 'cubic-bezier(.4,0,1,1)'
  };

  const CATS = ['Signature PLN NR', 'Data & Eksekutif', 'Teknik & Engineering', 'Edukasi & Explainer', 'Nusantara & Budaya', 'Kampanye & Sosial', 'K3 & Operasional', 'Dokumenter & Sinematik', 'Tata Kelola & Keuangan', 'Paket Broadcast'];

  root.PLNNR = { STYLES: S, AZ, TRANSITIONS, EASES, CATS, COLORS: C, hexPts, RECIPES, QA, FAMILY_PROD };
})(typeof window !== 'undefined' ? window : globalThis);
