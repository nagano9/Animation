/* PLN NR Explainer Studio — runtime render deterministik dengan mesin beat.
   Setiap frame adalah fungsi murni dari waktu t: animasi CSS/WAAPI dan SMIL di-seek, bukan diputar.
   Dipakai bersama oleh animatic (pemutaran interaktif) dan render.mjs (MP4).

   Mesin beat:
   - Animasi masuk dari gaya dikelompokkan berdasarkan urutan aslinya, lalu setiap kelompok
     dipindah ke waktu beat (frasa VO). Visual muncul saat narasi menyebutnya, bukan di 2 detik pertama.
   - Teks layar muncul baris per baris mengikuti beat dan keluar sebelum adegan berakhir.
   - Kamera bergerak pelan per beat (push-in + reframe). Celah tanpa beat diisi agar tidak ada
     jeda diam lebih dari 6 detik (token motion.duration.beat-max).
   - Angka dihitung naik saat frasa yang menyebut angka itu diucapkan.
   Butuh: window.PLNNR (styles-data.js) dan payload proyek dari build.py. */
(function (root) {
  'use strict';
  const NS = {};

  /* ---------- easing ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || !d) break; t -= e / d; } return sy(Math.min(1, Math.max(0, t))); };
  }
  const parseBez = css => { const m = String(css || '').match(/[\d.]+/g); return m && m.length === 4 ? bezier(...m.map(Number)) : (x => x); };
  const EASE = { standard: bezier(.4, 0, .2, 1), entrance: bezier(0, 0, .2, 1), exit: bezier(.4, 0, 1, 1), emphasis: bezier(.16, 1, .3, 1) };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* Animasi masuk → titik tahan (fraksi durasi) tempat elemen sudah tampil penuh. Animasi kontinu tidak ditahan. */
  const ENTRANCE = { aUp: .85, aPop: .85, aDraw: .85, aGrow: .85, aWipe: .85, aKin: .8, aArc: .95, aPush: .85, aLight: .85, aSweep: .95, aLid: .6 };
  /* Hanya ini perpindahan adegan. Count-Up dan Line Draw adalah animasi isi; bila dipakai sebagai transisi → cross-fade. */
  const SCENE_TX = new Set(['Cross-fade 220 ms', 'Energy Sweep', 'Hex Bloom', 'Wave Wipe', 'Chevron Push', 'Lens Iris', 'Dip Navy']);
  /* Gaya yang teksnya sudah besar di dalam art: panel teks bertumpuk tidak mengulanginya. */
  const DISPLAY_TEXT = new Set(['kinetic-type', 'navy-statement', 'energy-sweep', 'vertical-reels']);
  /* Gaya yang bagian bawahnya terisi: caption pindah ke atas bila tidak ada teks layar di kiri atas. */
  const CAP_TOP = new Set(['lower-third', 'travel-poster', 'wayang-silhouette', 'split-screen', 'hydro-flow', 'geothermal-section']);
  /* Amplitudo kamera per mode gerak: productive tenang, expressive lebih terasa. Ident dan pernyataan tanpa kamera. */
  /* Kamera: dorongan kontinu sepanjang adegan + aksen per beat. Zoom maks 8% menjaga teks di tepi tetap di dalam frame. */
  const CAM = { productive: { zoom: .05, accent: .012, pan: 0 }, expressive: { zoom: .08, accent: .02, pan: .018 } };
  /* Varian gelap: gaya berlatar putih yang diapit adegan navy ditukar warnanya agar tidak terjadi kilatan.
     Navy ↔ putih ditukar dua arah; sinyal cyan menjadi kuning (aturan sinyal di atas navy). */
  const DARK = { '#FFFFFF': '#00507C', '#00507C': '#FFFFFF', '#F1F6FA': '#0A3551', '#3A6E8C': '#BFD3DE', '#DFDFDF': '#1D4E6C',
    '#00ADEF': '#FFF100', '#E3EEF5': '#0F4262', '#BFD3DE': '#407C9D', '#FBFDFE': '#00507C', '#EAF6FB': '#0A3551', '#D5EAF3': '#0F4262' };
  const toDark = svg => svg.replace(/#[0-9a-fA-F]{6}\b|#[fF]{3}\b/g, m => { const k = (m.length === 4 ? '#FFFFFF' : m).toUpperCase(); return DARK[k] || m; });
  const NO_CAM = new Set(['logo-sting', 'countdown', 'navy-statement', 'kinetic-type', 'energy-sweep', 'caption-pack']);
  const BEAT_MAX = 6;

  function fmtID(n, dec) { const s = n.toFixed(dec), [i, f] = s.split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : ''); }
  const HEX = k => { const pts = [-90, -30, 30, 90, 150, 210].map(a => { const r = a * Math.PI / 180; return `${50 + 50 * k * Math.cos(r)}% ${50 + 50 * k * Math.sin(r) * 16 / 9}%`; }); return `polygon(${pts.join(',')})`; };

  /* Titik kamera: satu per beat, ditambah titik pengisi bila jarak antarbeat > BEAT_MAX. */
  function cameraKeys(beats, dur) {
    const ks = [...new Set([0, ...beats.filter(b => b > .3 && b < dur - 1)])].sort((a, b) => a - b);
    const out = [];
    ks.concat([dur]).forEach((b, i, arr) => { if (i < arr.length - 1) { out.push(b); const gap = arr[i + 1] - b; const n = Math.floor(gap / BEAT_MAX); for (let k = 1; k <= n; k++) out.push(b + gap * k / (n + 1)); } });
    return out;
  }

  NS.mount = function (stage, P, opts = {}) {
    const square = P.aspect === '1:1', portrait = P.aspect === '9:16' || square;
    const W = P.aspect === '9:16' || square ? 1080 : 1920, H = P.aspect === '9:16' ? 1920 : 1080;
    const byId = Object.fromEntries(root.PLNNR.STYLES.map(s => [s.id, s]));
    const TX = Object.fromEntries((P.transitions || []).map(t => [t.key, { ms: t.ms, ease: parseBez(t.ease) }]));
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    stage.innerHTML = '<svg width="0" height="0" style="position:absolute"><filter id="plnnr-mb" x="-50%" y="0" width="200%" height="100%"><feGaussianBlur id="plnnr-mbg" stdDeviation="0 0"/></filter></svg>';
    Object.assign(stage.style, { position: 'relative', width: W + 'px', height: H + 'px', overflow: 'hidden', background: '#00324F' });
    stage.classList.add('plnnr-stage', square ? 'is-square' : portrait ? 'is-portrait' : 'is-landscape');
    const mbg = stage.querySelector('#plnnr-mbg');

    /* Footage nyata (foto atau video) di belakang art; ikut gerak kamera (Ken Burns untuk foto). */
    const footage = sc => { const f = sc.footage; if (!f) return '';
      const pos = `object-position:${esc(f.focus || '50% 50%')}`;
      // scrim navy di bawah: diizinkan merek untuk teks di atas foto; menjaga lower third dan caption terbaca
      return (f.kind === 'video' ? `<video class="foot" muted playsinline preload="auto" src="${esc(f.src)}" style="${pos}"></video>` : `<img class="foot" alt="" src="${f.src}" style="${pos}">`) + '<div class="scrim"></div>'; };
    const layers = P.scenes.map((sc, i) => {
      const s = byId[sc.style];
      const L = document.createElement('div'); L.className = 'sc-layer art'; L.style.display = 'none';
      const art0 = s.svg('s' + i + '_', sc.d || {}), art = sc.tone === 'dark' ? toDark(art0) : art0;
      const textCovered = (s.slots || []).some(k => ['lines', 'title', 'steps', 'name'].includes(k));
      const lines = (sc.osd && sc.osd.length ? sc.osd : (portrait && !DISPLAY_TEXT.has(sc.style) ? [sc.d.title, ...(sc.d.lines || sc.d.steps || [])].filter(Boolean) : [])).slice(0, portrait ? 2 : 3);
      if (portrait) {
        L.innerHTML = `<div class="pt-bg"></div><div class="pt-top"><img alt="" src="${P.logo}"></div><div class="pt-art cam">${footage(sc)}${art.replace('xMidYMid slice', 'xMidYMid meet')}</div>`
          + `<div class="pt-text">${lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>`;
      } else {
        L.innerHTML = `<div class="ls-art cam">${footage(sc)}${art}</div>` + (!textCovered && lines.length ? `<div class="osd">${lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>` : '');
      }
      // masuk lewat Energy Sweep: pita internal gaya dimatikan agar tidak ada sapuan ganda
      if (sc.tx === 'Energy Sweep') L.querySelectorAll('.a-sweepband').forEach(e => e.remove());
      if (sc.logo) L.insertAdjacentHTML('beforeend', `<div class="lockup"><img alt="Lockup PLN NR" src="${P.logo}"></div>`);
      stage.append(L);

      const dur = sc.dur, beats = (sc.beats && sc.beats.length ? sc.beats : [0]).filter(b => b < dur - .5);
      // teks layar: satu baris per beat, keluar 0,45 dtk sebelum adegan berakhir
      L.querySelectorAll('.osd span, .pt-text span').forEach((el, k) => {
        const at = (beats[Math.min(k, beats.length - 1)] || 0) + .25 + (k >= beats.length ? (k - beats.length + 1) * .14 : 0);
        el.animate([{ opacity: 0, transform: 'translateY(28px)', clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 480, delay: at * 1000, easing: 'cubic-bezier(0,0,.2,1)', fill: 'backwards' });
        el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-16px)' }], { duration: 320, delay: Math.max(at + .8, dur - .45) * 1000, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      });
      // lower third: tampil, tahan, keluar (praktik siaran 4–6 dtk; default sampai 0,6 dtk sebelum akhir, maks 8 dtk)
      L.querySelectorAll('.lt-block').forEach(el => {
        const out = clamp(sc.d.hold || Math.min(8, dur - .6), 3, dur - .4);
        el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-24px)' }], { duration: 350, delay: out * 1000, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      });
      // lockup: reveal bermasker kiri ke kanan setelah cincin hexagon tertutup
      L.querySelectorAll('.lockup').forEach(el => el.animate([{ clipPath: 'inset(0 100% 0 0)', transform: 'translate(-50%,-50%) scale(.96)' }, { clipPath: 'inset(0 0 0 0)', transform: 'translate(-50%,-50%) scale(1)' }], { duration: 650, delay: 1150, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }));
      L.querySelectorAll('[data-count]').forEach(el => { el.dataset.orig = el.textContent; });
      return { el: L, sc, s, beats, cam: L.querySelector('.cam'), camKeys: cameraKeys(beats, dur), svgs: [...L.querySelectorAll('svg')], vids: [...L.querySelectorAll('video.foot')], idx: i, plan: null };
    });
    const band = document.createElement('div'); band.className = 'tx-band'; stage.append(band);
    const dip = document.createElement('div'); dip.className = 'tx-dip'; stage.append(dip);
    const cap = document.createElement('div'); cap.className = 'cap'; stage.append(cap);
    let capsOn = opts.captions !== false;

    /* Rencana beat per layer: dibuat sekali saat layer pertama kali tampil (animasi CSS baru ada setelah display). */
    function planFor(ly) {
      const anims = ly.el.getAnimations({ subtree: true }).filter(a => a.animationName && ENTRANCE[a.animationName]);
      const q = a => Math.round((a.effect.getTiming().delay || 0) / 50) * 50;
      const delays = [...new Set(anims.map(q))].sort((a, b) => a - b);
      // klaster: delay yang berjarak < 350 ms adalah satu komponen (stagger internal) dan tidak dipecah ke beat berbeda
      const clusters = [];
      delays.forEach(d => { const c = clusters[clusters.length - 1]; if (c && d - c[c.length - 1] < 350) c.push(d); else clusters.push([d]); });
      const groups = Math.max(1, Math.min(ly.beats.length, clusters.length));
      const groupOf = new Map();
      clusters.forEach((c, i) => { const g = Math.min(groups - 1, Math.floor(i * groups / clusters.length)); c.forEach(d => groupOf.set(d, g)); });
      const first = [];
      delays.forEach(d => { const g = groupOf.get(d); if (first[g] === undefined) first[g] = d; });
      const shift = new Map();
      anims.forEach(a => { const d = q(a), g = groupOf.get(d); shift.set(a, ly.beats[g] * 1000 - first[g] + (g === 0 ? 150 : 0)); });
      return { shift };
    }

    function setLocal(ly, local) {
      if (!ly.plan) ly.plan = planFor(ly);
      ly.el.getAnimations({ subtree: true }).forEach(a => {
        a.pause();
        let ms = local * 1000;
        const hold = a.animationName && ENTRANCE[a.animationName];
        if (hold) {
          ms -= ly.plan.shift.get(a) || 0;
          const tm = a.effect.getTiming(), dur = typeof tm.duration === 'number' ? tm.duration : 0;
          ms = Math.min(ms, (tm.delay || 0) + dur * hold);
        }
        a.currentTime = Math.max(0, ms);
      });
      ly.svgs.forEach(s => { try { s.pauseAnimations(); s.setCurrentTime(Math.max(0, local)); } catch (e) {} });
      ly.vids.forEach(v => { const want = Math.max(0, (ly.sc.footage.in || 0) + local); if (!v.paused) v.pause(); if (Math.abs(v.currentTime - want) > .02) v.currentTime = want; });
      ly.el.querySelectorAll('[data-count]').forEach(el => {
        const n = +el.dataset.count, dec = +el.dataset.dec || 0;
        const start = (ly.sc.countAt && ly.sc.countAt[el.dataset.count] !== undefined ? ly.sc.countAt[el.dataset.count] : (ly.beats[1] ?? ly.beats[0] ?? 0)) + .35;
        const k = EASE.emphasis(clamp((local - start) / .9));
        el.textContent = fmtID(n * k, dec) + (el.dataset.orig || '').replace(/^[\d.,\s]+/, '');
      });
      // kamera: push-in bertahap per beat + reframe kiri/kanan (mode expressive)
      if (ly.cam) {
        if (NO_CAM.has(ly.sc.style)) { ly.cam.style.transform = 'none'; return; }
        const d = ly.sc.dur, ks = ly.camKeys;
        if (ly.sc.footage) {
          // Ken Burns untuk footage: zoom kontinu 1,04 → 1,16 + geser horizontal 3% (arah bergantian per adegan),
          // ditambah aksen zoom bertahap 1,5% di setiap beat. Footage tanpa teks di tepi, jadi aman di-crop.
          const u = clamp(local / d), dir = ly.idx % 2 ? -1 : 1;
          let z = 1.04 + .12 * u;   // mulai 1,04 agar geser 1,5% tidak pernah memperlihatkan tepi kosong
          ks.forEach((k0, i) => { if (i) z += .015 * EASE.standard(clamp((local - k0) / 1.2)); });
          ly.cam.style.transform = `translateX(${(dir * 3 * (u - .5)).toFixed(3)}%) scale(${z.toFixed(4)})`;
          return;
        }
        const c = CAM[ly.sc.mode] || CAM.productive;
        // dorongan kontinu (ease masuk/keluar hanya 1 dtk di tepi) agar tidak pernah benar-benar diam
        const u = clamp(local / d), edge = Math.min(1, local / 1, (d - local) / 1);
        let z = 1 + c.zoom * u, x = 0;
        // aksen per beat: dorongan kecil 1,2 dtk lalu reda, arah pan bergantian
        ks.forEach((k0, i) => { if (!i) return; const q = clamp((local - k0) / 1.2); const a = Math.sin(Math.PI * Math.min(1, q)) * (q < 1 ? 1 : 0); z += c.accent * a; x += (i % 2 ? -1 : 1) * c.pan * EASE.standard(q); });
        z = 1 + (z - 1) * (.6 + .4 * clamp(edge));
        ly.cam.style.transform = `translateX(${(x * 100).toFixed(3)}%) scale(${z.toFixed(4)})`;
      }
    }
    function idxAt(t) { let i = 0; P.scenes.forEach((s, k) => { if (t >= s.start) i = k; }); return i; }

    function seek(t) {
      t = clamp(t, 0, P.total - 1e-3);
      const i = idxAt(t), cur = layers[i], local = t - cur.sc.start;
      const name = cur.sc.tx && cur.sc.tx !== 'Cut' && i > 0 ? (SCENE_TX.has(cur.sc.tx) ? cur.sc.tx : 'Cross-fade 220 ms') : null;
      const tx0 = name ? (TX[name] || { ms: 220, ease: EASE.standard }) : null;
      const tx = tx0 && cur.sc.txMs ? { ...tx0, ms: cur.sc.txMs } : tx0;   // durasi transisi per adegan (mis. cross-fade panjang ke footage)
      const dur = tx ? tx.ms / 1000 : 0, inT = dur && local < dur;
      layers.forEach((ly, k) => { if (k !== i && !(inT && k === i - 1)) ly.el.style.display = 'none'; });
      Object.assign(cur.el.style, { display: 'block', opacity: 1, clipPath: 'none', zIndex: 2 });
      setLocal(cur, local);
      band.style.display = 'none'; dip.style.opacity = 0;
      if (inT) {
        const prev = layers[i - 1]; Object.assign(prev.el.style, { display: 'block', opacity: 1, clipPath: 'none', zIndex: 1 });
        setLocal(prev, t - prev.sc.start);
        const raw = clamp(local / dur), p = tx.ease(raw);
        switch (name) {
          case 'Energy Sweep': {
            cur.el.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
            // motion blur horizontal sebanding kecepatan pita (px per frame pada 25 fps)
            const v = Math.abs(tx.ease(clamp(raw + .02)) - tx.ease(clamp(raw - .02))) / .04 * (W * 1.2) * (1 / 25) / dur;
            mbg.setAttribute('stdDeviation', `${Math.min(60, v * .35).toFixed(1)} 0`);
            Object.assign(band.style, { display: 'block', left: (p * 118 - 18) + '%' }); break;
          }
          case 'Wave Wipe': cur.el.style.clipPath = `ellipse(${p * 170}% ${p * 170}% at 100% 50%)`; break;
          case 'Lens Iris': cur.el.style.clipPath = `ellipse(${p * 160}% ${p * 180}% at 100% 0%)`; break;
          case 'Hex Bloom': cur.el.style.clipPath = HEX(p * 2.4); break;
          case 'Chevron Push': cur.el.style.clipPath = `polygon(0 0, ${p * 100}% 0, ${p * 140}% 50%, ${p * 100}% 100%, 0 100%)`; break;
          case 'Dip Navy': { const half = raw < .5; cur.el.style.opacity = half ? 0 : 1; dip.style.opacity = half ? EASE.standard(raw * 2) : 1 - EASE.standard((raw - .5) * 2); break; }
          default: cur.el.style.opacity = p;
        }
      }
      const c = capsOn && (P.cues || []).find(c => t >= c.start && t < c.end);
      cap.innerHTML = c ? c.lines.map(esc).join('<br>') : '';
      cap.classList.toggle('top', !portrait && CAP_TOP.has(cur.sc.style) && !cur.el.querySelector('.osd'));
      cap.style.display = c ? 'block' : 'none';
      return i;
    }
    /* Untuk render: tunggu semua video selesai seek sebelum frame diambil. */
    function settle() {
      const vs = [...stage.querySelectorAll('video.foot')].filter(v => v.closest('.sc-layer').style.display !== 'none');
      return Promise.all(vs.map(v => (v.seeking || v.readyState < 2) ? new Promise(r => { const done = () => r(); v.addEventListener('seeked', done, { once: true }); v.addEventListener('loadeddata', done, { once: true }); setTimeout(done, 3000); }) : null));
    }
    return { W, H, seek, settle, idxAt, setCaptions(v) { capsOn = v; }, total: P.total };
  };

  NS.CSS = `
.plnnr-stage{font-family:"PT Sans","Myriad Pro","Segoe UI",Helvetica,Arial,sans-serif;color:#fff}
.plnnr-stage .sc-layer{position:absolute;inset:0;overflow:hidden}
.plnnr-stage .ls-art{position:absolute;inset:0;transform-origin:50% 50%}
.plnnr-stage .ls-art svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.plnnr-stage .foot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.plnnr-stage .scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,80,124,.18) 0%,rgba(0,80,124,.12) 40%,rgba(0,67,103,.7) 100%)}
.plnnr-stage .osd{position:absolute;left:96px;top:72px;max-width:1150px;display:grid;gap:12px;justify-items:start}
.plnnr-stage .osd span{background:rgba(255,255,255,.96);color:#00507C;font-weight:700;font-size:66px;line-height:1.08;padding:10px 22px}
.plnnr-stage .lockup{position:absolute;left:50%;top:47.2%;transform:translate(-50%,-50%);width:30%;background:#00507C;padding:1.2% 1.6%}
.plnnr-stage.is-portrait .lockup{top:36.2%;width:30%}
.plnnr-stage.is-square .lockup{top:26.6%;width:30%}
.plnnr-stage .lockup img{width:100%;display:block}
.plnnr-stage .pt-bg{position:absolute;inset:0;background:linear-gradient(160deg,#00618F 0%,#00507C 60%,#004367 100%)}
.plnnr-stage .pt-top{position:absolute;left:80px;top:290px}
.plnnr-stage.is-square .pt-top{display:none}
.plnnr-stage .pt-top img{height:72px;display:block}
.plnnr-stage .pt-art{position:absolute;left:0;top:400px;width:1080px;height:608px;background:#00324F;overflow:hidden}
.plnnr-stage.is-square .pt-art{top:0}
.plnnr-stage .pt-art svg{width:100%;height:100%;display:block}
.plnnr-stage .pt-text{position:absolute;left:80px;right:80px;top:1070px;display:grid;gap:18px}
.plnnr-stage.is-square .pt-text{top:660px;left:64px;right:64px}
.plnnr-stage.is-square .pt-text span{font-size:60px}
.plnnr-stage .pt-text span{font-weight:700;font-size:72px;line-height:1.08;color:#fff}
.plnnr-stage .pt-text span:first-child{color:#FFF100}
.plnnr-stage .cap{position:absolute;left:50%;transform:translateX(-50%);bottom:64px;max-width:86%;width:max-content;background:rgba(0,36,58,.88);color:#fff;font-weight:700;font-size:42px;line-height:1.25;text-align:center;padding:10px 22px;z-index:5}
.plnnr-stage .cap.top{bottom:auto;top:64px}
.plnnr-stage.is-portrait .cap{bottom:420px;font-size:48px}
.plnnr-stage.is-square .cap{bottom:48px;font-size:40px}
.plnnr-stage .tx-band{position:absolute;top:-5%;bottom:-5%;width:22%;background:linear-gradient(90deg,#FFF100,#B9DE41,#00A2BA,#00ADEF,#005F89);transform:skewX(-14deg);z-index:4;display:none;filter:url(#plnnr-mb)}
.plnnr-stage .tx-dip{position:absolute;inset:0;background:#00243A;opacity:0;z-index:4;pointer-events:none}
`;
  root.PLNNR_RT = NS;
})(typeof window !== 'undefined' ? window : globalThis);
