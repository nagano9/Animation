#!/usr/bin/env node
/* Render MP4 dari animatic.html (hasil scripts/build.py).
   Setiap frame = seek(t) deterministik → screenshot JPEG → ffmpeg (H.264).

   node engine/render.mjs work/out/animatic.html --out work/out/video.mp4
   node engine/render.mjs work/out/animatic.html --stills work/out/stills      # still per adegan + contact sheet
   Opsi: --fps 25  --from 0 --to 12  --no-captions  --audio project.json  --music bed.mp3  --crf 18

   Butuh: Node 18+, Playwright (require('playwright') dengan Chromium), ffmpeg di PATH. */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, isAbsolute } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const html = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : d; };
if (!html || !existsSync(html)) { console.error('Pakai: node engine/render.mjs <animatic.html> --out video.mp4 | --stills dir'); process.exit(2); }

let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright tidak ditemukan. Pasang: npm i playwright && npx playwright install chromium'); process.exit(2);
}
if (spawnSync('ffmpeg', ['-version']).status !== 0 && !opt('stills')) { console.error('ffmpeg tidak ditemukan di PATH.'); process.exit(2); }

const fps = +opt('fps', 25), crf = String(opt('crf', 18));
const url = pathToFileURL(resolve(html)).href + '?render=1' + (opt('no-captions') ? '&captions=0' : '');
const launch = process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {};
const browser = await chromium.launch(launch);
const probe = await browser.newPage();
await probe.goto(url);
await probe.waitForFunction(() => window.__ready, null, { timeout: 30000 });
const meta = await probe.evaluate(() => window.__meta);
await probe.close();
const page = await browser.newPage({ viewport: { width: meta.W, height: meta.H }, deviceScaleFactor: 1 });
await page.goto(url);
await page.waitForFunction(() => window.__ready, null, { timeout: 30000 });
const seek = t => page.evaluate(t => window.__seek(t), t);
const shot = (o = {}) => page.screenshot({ clip: { x: 0, y: 0, width: meta.W, height: meta.H }, ...o });

if (opt('stills')) {
  const dir = resolve(opt('stills')); mkdirSync(dir, { recursive: true });
  const files = [];
  for (const s of meta.scenes) {
    const t = s.start + Math.min(s.dur * .6, Math.max(.5, s.dur - .4));
    await seek(t); const f = join(dir, `${s.id}.png`); await shot({ path: f, type: 'png' }); files.push({ f, s, t });
  }
  // contact sheet: grid 3 kolom
  const cols = 3, tw = meta.W > meta.H ? 640 : 300, th = Math.round(tw * meta.H / meta.W);
  const sheet = await browser.newPage({ viewport: { width: cols * (tw + 16) + 16, height: 200 } });
  const cells = files.map(({ f, s, t }) => `<figure><img src="data:image/png;base64,${readFileSync(f).toString('base64')}" width="${tw}" height="${th}"><figcaption>${s.id} · ${t.toFixed(1)} dtk</figcaption></figure>`).join('');
  await sheet.setContent(`<style>body{margin:0;padding:16px;background:#05263B;font:700 14px sans-serif;color:#EAF4FA;display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:16px}figure{margin:0}img{display:block}figcaption{margin-top:6px}</style>${cells}`);
  await sheet.waitForLoadState('load');
  await sheet.screenshot({ path: join(dir, 'contact-sheet.png'), fullPage: true });
  console.log(`Stills: ${files.length} adegan + contact-sheet.png di ${dir}`);
  await browser.close(); process.exit(0);
}

const out = resolve(opt('out', 'video.mp4')); mkdirSync(dirname(out), { recursive: true });
const from = +opt('from', 0), to = Math.min(+opt('to', meta.total), meta.total);
const frames = Math.max(1, Math.round((to - from) * fps));
const silent = out.replace(/\.mp4$/, '') + '.silent.mp4';
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', crf, '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = 0; f < frames; f++) {
  await seek(from + f / fps);
  const buf = await shot({ type: 'jpeg', quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % (fps * 5) === 0) process.stdout.write(`\r  frame ${f}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)} dtk)`);
}
ff.stdin.end();
await new Promise((r, j) => ff.on('close', c => c === 0 ? r() : j(new Error('ffmpeg gagal: ' + c))));
await browser.close();
process.stdout.write(`\r  ${frames} frame dirender dalam ${((Date.now() - t0) / 1000).toFixed(0)} dtk\n`);

// audio: VO per adegan (field "audio" di project.json) + musik latar opsional
const projPath = opt('audio'); const music = opt('music');
const inputs = [], filters = [];
if (projPath && projPath !== true) {
  const proj = JSON.parse(readFileSync(projPath, 'utf8')); const base = dirname(resolve(projPath));
  let t = 0;
  for (const sc of proj.scenes) {
    if (sc.audio) {
      const a = isAbsolute(sc.audio) ? sc.audio : join(base, sc.audio);
      if (existsSync(a)) { const ms = Math.round((t + (sc.audio_offset_s ?? .15) - from) * 1000); if (ms >= 0) { inputs.push(a); filters.push(`[${inputs.length}:a]adelay=${ms}|${ms}[a${inputs.length}]`); } }
      else console.warn('  audio tidak ditemukan:', a);
    }
    t += +sc.duration_s;
  }
}
if (music && music !== true && existsSync(music)) { inputs.push(resolve(music)); filters.push(`[${inputs.length}:a]volume=0.18,aloop=loop=-1:size=2e9[a${inputs.length}]`); }
if (!inputs.length) {
  spawnSync('mv', [silent, out]);
  console.log('Video (tanpa audio):', out);
} else {
  const labels = inputs.map((_, i) => `[a${i + 1}]`).join('');
  const fc = filters.join(';') + `;${labels}amix=inputs=${inputs.length}:normalize=0:duration=longest,loudnorm=I=-14:TP=-1.5:LRA=11[aout]`;
  const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs.flatMap(i => ['-i', i]), '-filter_complex', fc,
    '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(to - from), out], { stdio: 'inherit' });
  if (r.status !== 0) { console.error('Mux audio gagal; video bisu tetap di', silent); process.exit(1); }
  spawnSync('rm', [silent]);
  console.log('Video + audio (loudness −14 LUFS):', out);
}
writeFileSync(out.replace(/\.mp4$/, '.render.json'), JSON.stringify({ source: html, fps, frames, from, to, size: `${meta.W}x${meta.H}`, rendered_at: new Date().toISOString() }, null, 2));
