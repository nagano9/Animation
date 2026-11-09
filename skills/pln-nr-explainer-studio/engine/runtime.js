/* PLN NR Explainer Studio — runtime render deterministik.
   Setiap frame adalah fungsi murni dari waktu t: semua animasi CSS/WAAPI dan SMIL di-seek,
   bukan diputar. Dipakai bersama oleh animatic (pemutaran interaktif) dan render.mjs (MP4).
   Butuh: window.PLNNR (styles-data.js) dan payload proyek dari build.py. */
(function (root) {
  'use strict';
  const NS = {};

  /* ---------- easing: cubic-bezier numerik ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t, dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-6 || !d) break; t -= e / d; } return sy(Math.min(1, Math.max(0, t))); };
  }
  const parseBez = css => { const m = String(css || '').match(/[\d.]+/g); return m && m.length === 4 ? bezier(...m.map(Number)) : (x => x); };
  const EASE = { standard: bezier(.4, 0, .2, 1), entrance: bezier(0, 0, .2, 1), emphasis: bezier(.16, 1, .3, 1) };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  /* Gaya yang bagian bawahnya sudah terisi (lower third, judul peta, letterbox): caption pindah ke atas. */
  /* Gaya yang teksnya sudah tampil besar di dalam art: panel teks bertumpuk tidak mengulanginya. */
  const DISPLAY_TEXT = new Set(['kinetic-type', 'navy-statement', 'energy-sweep', 'vertical-reels']);
  const CAP_TOP = new Set(['lower-third', 'nusantara-map', 'travel-poster', 'wayang-silhouette', 'split-screen', 'hydro-flow', 'geothermal-section']);

  /* ---------- angka Indonesia ---------- */
  function fmtID(n, dec) {
    const s = n.toFixed(dec), [i, f] = s.split('.');
    return i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (f ? ',' + f : '');
  }

  const HEX = k => { const pts = [-90, -30, 30, 90, 150, 210].map(a => { const r = a * Math.PI / 180; return `${50 + 50 * k * Math.cos(r)}% ${50 + 50 * k * Math.sin(r) * 16 / 9}%`; }); return `polygon(${pts.join(',')})`; };

  /* ---------- mount ---------- */
  NS.mount = function (stage, P, opts = {}) {
    const square = P.aspect === '1:1', portrait = P.aspect === '9:16' || square;   // 9:16 dan 1:1 memakai tata letak bertumpuk
    const W = P.aspect === '9:16' || square ? 1080 : 1920, H = P.aspect === '9:16' ? 1920 : 1080;
    const byId = Object.fromEntries(root.PLNNR.STYLES.map(s => [s.id, s]));
    const TX = Object.fromEntries((P.transitions || []).map(t => [t.key, { ms: t.ms, ease: parseBez(t.ease) }]));
    const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    stage.innerHTML = '';
    Object.assign(stage.style, { position: 'relative', width: W + 'px', height: H + 'px', overflow: 'hidden', background: '#00324F' });
    stage.classList.add('plnnr-stage', square ? 'is-square' : portrait ? 'is-portrait' : 'is-landscape');

    const layers = P.scenes.map((sc, i) => {
      const s = byId[sc.style];
      const L = document.createElement('div'); L.className = 'sc-layer art'; L.style.display = 'none';
      const art = s.svg('s' + i + '_', sc.d || {});
      const textCovered = (s.slots || []).some(k => ['lines', 'title', 'steps', 'name'].includes(k));
      const displayText = DISPLAY_TEXT.has(sc.style);   // teks gaya ini sudah besar di dalam art
      const lines = (sc.osd && sc.osd.length ? sc.osd : (portrait && !displayText ? [sc.d.title, ...(sc.d.lines || sc.d.steps || [])].filter(Boolean) : [])).slice(0, portrait ? 2 : 3);
      if (portrait) {
        L.innerHTML = `<div class="pt-bg"></div><div class="pt-top"><img alt="" src="${P.logo}"></div><div class="pt-art">${art.replace('xMidYMid slice', 'xMidYMid meet')}</div>`
          + `<div class="pt-text">${lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>`;
      } else {
        L.innerHTML = `<div class="ls-art">${art}</div>` + (!textCovered && lines.length ? `<div class="osd">${lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>` : '');
      }
      if (sc.logo) L.insertAdjacentHTML('beforeend', `<div class="lockup"><img alt="Lockup PLN NR" src="${P.logo}"></div>`);
      stage.append(L);
      // animasi masuk overlay sebagai WAAPI agar bisa di-seek
      L.querySelectorAll('.osd span, .pt-text span').forEach((el, k) => el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 300 + k * 140, easing: 'cubic-bezier(0,0,.2,1)', fill: 'both' }));
      L.querySelectorAll('.lockup').forEach(el => el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 1200, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
      L.querySelectorAll('[data-count]').forEach(el => { el.dataset.orig = el.textContent; });
      return { el: L, sc, svgs: [...L.querySelectorAll('svg')] };
    });
    const band = document.createElement('div'); band.className = 'tx-band'; stage.append(band);
    const cap = document.createElement('div'); cap.className = 'cap'; stage.append(cap);
    let capsOn = opts.captions !== false;

    function setLocal(ly, local) {
      ly.el.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = Math.max(0, local * 1000); });
      ly.svgs.forEach(s => { try { s.pauseAnimations(); s.setCurrentTime(Math.max(0, local)); } catch (e) {} });
      ly.el.querySelectorAll('[data-count]').forEach(el => {
        const n = +el.dataset.count, dec = +el.dataset.dec || 0, k = EASE.emphasis(clamp((local - .35) / .9));
        const suf = (el.dataset.orig || '').replace(/^[\d.,\s]+/, '');
        el.textContent = fmtID(n * k, dec) + suf;
      });
    }
    function idxAt(t) { let i = 0; P.scenes.forEach((s, k) => { if (t >= s.start) i = k; }); return i; }

    function seek(t) {
      t = clamp(t, 0, P.total - 1e-3);
      const i = idxAt(t), cur = layers[i], local = t - cur.sc.start;
      const tx = cur.sc.tx && cur.sc.tx !== 'Cut' && i > 0 ? (TX[cur.sc.tx] || TX['Cross-fade 220 ms']) : null;
      const dur = tx ? tx.ms / 1000 : 0, inT = dur && local < dur;
      layers.forEach((ly, k) => { if (k !== i && !(inT && k === i - 1)) { ly.el.style.display = 'none'; } });
      Object.assign(cur.el.style, { display: 'block', opacity: 1, clipPath: 'none', zIndex: 2 });
      setLocal(cur, local);
      band.style.display = 'none';
      if (inT) {
        const prev = layers[i - 1]; Object.assign(prev.el.style, { display: 'block', opacity: 1, clipPath: 'none', zIndex: 1 });
        setLocal(prev, t - prev.sc.start);
        const p = tx.ease(clamp(local / dur));
        switch (cur.sc.tx) {
          case 'Energy Sweep': { cur.el.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`; Object.assign(band.style, { display: 'block', left: (p * 100 - 18) + '%' }); break; }
          case 'Wave Wipe': cur.el.style.clipPath = `ellipse(${p * 170}% ${p * 170}% at 100% 50%)`; break;
          case 'Lens Iris': cur.el.style.clipPath = `ellipse(${p * 160}% ${p * 180}% at 100% 0%)`; break;
          case 'Hex Bloom': cur.el.style.clipPath = HEX(p * 2.4); break;
          case 'Chevron Push': cur.el.style.clipPath = `polygon(0 0, ${p * 100}% 0, ${p * 140}% 50%, ${p * 100}% 100%, 0 100%)`; break;
          default: cur.el.style.opacity = p;
        }
      }
      const c = capsOn && (P.cues || []).find(c => t >= c.start && t < c.end);
      cap.innerHTML = c ? c.lines.map(esc).join('<br>') : '';
      cap.classList.toggle('top', !portrait && CAP_TOP.has(cur.sc.style) && !cur.el.querySelector('.osd'));
      cap.style.display = c ? 'block' : 'none';
      return i;
    }
    return { W, H, seek, idxAt, setCaptions(v) { capsOn = v; }, total: P.total };
  };

  NS.CSS = `
.plnnr-stage{font-family:"PT Sans","Myriad Pro","Segoe UI",Helvetica,Arial,sans-serif;color:#fff}
.plnnr-stage .sc-layer{position:absolute;inset:0}
.plnnr-stage .ls-art,.plnnr-stage .ls-art svg{position:absolute;inset:0;width:100%;height:100%;display:block}
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
.plnnr-stage .pt-art{position:absolute;left:0;top:400px;width:1080px;height:608px;background:#00324F}
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
.plnnr-stage .tx-band{position:absolute;top:0;bottom:0;width:22%;background:linear-gradient(90deg,#FFF100,#B9DE41,#00A2BA,#00ADEF,#005F89);transform:skewX(-14deg);z-index:4;display:none}
`;
  root.PLNNR_RT = NS;
})(typeof window !== 'undefined' ? window : globalThis);
