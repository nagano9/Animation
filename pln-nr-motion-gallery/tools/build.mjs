// Build: menggabungkan src/ menjadi satu file HTML mandiri + katalog JSON untuk Explainer Studio.
// Pakai: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => readFileSync(join(root, p));
const dataJs = rd('src/styles-data.js').toString();
const uri = p => 'data:image/png;base64,' + rd(p).toString('base64');

let html = rd('src/gallery.html').toString()
  .replace('/*DATA*/', () => dataJs)
  .replace('/*TOKENS*/null', () => rd('tokens/motion.tokens.json').toString())
  .replace('assets/logo-pln-nr-color.png', uri('assets/logo-pln-nr-color.png'))
  .replace('assets/logo-pln-nr-white.png', uri('assets/logo-pln-nr-white.png'));

mkdirSync(join(root, 'dist'), { recursive: true });
// 1) fragmen untuk publikasi Artifact (skeleton ditambahkan saat publish)
writeFileSync(join(root, 'dist/pln-nr-motion-gallery.html'), html);
// 2) halaman mandiri untuk dibuka langsung di browser
writeFileSync(join(root, 'index.html'),
  '<!doctype html>\n<html lang="id">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' +
  html.replace('<header class="top">', '</head>\n<body>\n<header class="top">') +
  '\n</body>\n</html>\n');

// 3) katalog JSON (tanpa SVG) untuk dibaca Explainer Studio
const ctx = { globalThis: {} }; vm.createContext(ctx); vm.runInContext(dataJs, ctx);
const P = ctx.globalThis.PLNNR;
const tokens = JSON.parse(rd('tokens/motion.tokens.json').toString());
const famMode = tokens.family_mode.$value;
P.STYLES.forEach(s => { s.mode = s.mode || famMode[s.cat]; });
// lint: mode, transisi, easing, slot (gagal build bila melanggar)
const txModes = Object.fromEntries(Object.entries(tokens.motion.transition).filter(([k]) => !k.startsWith('$')).map(([, v]) => [v.$extensions['id.ptplnnr'].name, v.$extensions['id.ptplnnr'].modes]));
const lint = [];
P.STYLES.forEach(s => {
  if (!txModes[s.transition]) lint.push(`${s.id}: transisi '${s.transition}' tidak ada di token`);
  else if (!txModes[s.transition].includes(s.mode)) lint.push(`${s.id}: transisi '${s.transition}' tidak diizinkan untuk mode ${s.mode}`);
  if (s.ease === 'emphasis' && s.mode !== 'expressive' && s.transition !== 'Count-Up') lint.push(`${s.id}: easing emphasis hanya untuk mode expressive`);
  if (!famMode[s.cat]) lint.push(`${s.id}: rumpun '${s.cat}' tanpa mode`);
});
P.AZ.forEach(r => [...r[3], ...r[4]].forEach(i => { if (!P.STYLES.find(s => s.id === i)) lint.push(`A–Z ${r[0]}: gaya '${i}' tidak ada`); }));
P.RECIPES.forEach(r => r.segs.forEach(g => { if (!P.STYLES.find(s => s.id === g[0])) lint.push(`resep ${r.id}: gaya '${g[0]}' tidak ada`); }));
// kontras teks pratinjau: warna teks yang gagal 4,5:1 di semua latar terang dilarang di atas latar putih/paper
const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + .05) / (y + .05); };
// Pengecualian terdokumentasi: teks yang berada di atas bidang lain, bukan latar utama.
const CONTRAST_EXEMPT = { 'vertical-reels:#FFF100': 'teks kuning berada di dalam bingkai ponsel navy' };
P.STYLES.forEach(s => { const v = s.svg('L_'); const bg = (v.match(/<rect width="640" height="360" fill="(#[0-9A-Fa-f]{6})"/) || [])[1];
  if (!bg || lum(bg) < .5) return;
  [...v.matchAll(/<text[^>]*font-size="([\d.]+)"[^>]*fill="(#[0-9A-Fa-f]{6})"/g)].forEach(m => { if (CONTRAST_EXEMPT[`${s.id}:${m[2]}`]) return; const r = ratio(m[2], bg); if (r < 4.5 && !(+m[1] >= 24 && r >= 3)) lint.push(`${s.id}: teks ${m[2]} di atas ${bg} kontras ${r.toFixed(2)}:1`); }); });
if (lint.length) { console.error('LINT GAGAL:\n  ' + [...new Set(lint)].join('\n  ')); process.exit(1); }
const azName = Object.fromEntries(P.AZ.map(r => [r[0], r[1]]));
const catalog = {
  schema: 'plnnr.motion-catalog/1',
  brand: 'PT PLN Nusantara Renewables',
  generated: new Date().toISOString().slice(0, 10),
  easing: P.EASES,
  transitions: P.TRANSITIONS.map(({ cls, ...t }) => t),
  families: P.CATS,
  family_production: P.FAMILY_PROD,
  family_mode: famMode,
  tokens: tokens.motion,
  legibility: tokens.legibility,
  styles: P.STYLES.map(({ svg, ...s }) => ({ ...s, use_cases: s.letters.map(l => ({ letter: l, need: azName[l] })) })),
  a_to_z: P.AZ.map(([letter, need, audience, primary, alternative, duration, formats]) => ({ letter, need, audience, primary, alternative, duration, formats })),
  recipes: P.RECIPES.map(r => ({ id: r.id, name: r.name, letter: r.letter, aspect: r.aspect, goal: r.goal, total_s: r.total,
    segments: r.segs.map(([style, sec, role, note]) => ({ style, duration_s: sec, role, note })) })),
  qa: P.QA.map(([group, items]) => ({ group, items }))
};
writeFileSync(join(root, 'catalog/pln-nr-motion-styles.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log('OK —', P.STYLES.length, 'gaya,', (html.length / 1024).toFixed(0), 'KB');

// 4) aset skill Explainer Studio
const skill = join(root, '..', 'skills', 'pln-nr-explainer-studio');
const sa = join(skill, 'assets');
rmSync(join(sa, 'previews'), { recursive: true, force: true });
mkdirSync(join(sa, 'previews'), { recursive: true });
writeFileSync(join(sa, 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
copyFileSync(join(root, 'src', 'styles-data.js'), join(sa, 'styles-data.js'));
copyFileSync(join(root, 'tokens', 'motion.tokens.json'), join(sa, 'motion.tokens.json'));
P.STYLES.forEach(s => writeFileSync(join(sa, 'previews', s.id + '.svg'), s.svg('P0_')));
const src = rd('src/gallery.html').toString();
const a0 = src.indexOf('/* ===== shared animation vocabulary'), a1 = src.indexOf('.paused .art *');
writeFileSync(join(sa, 'anim.css'), src.slice(a0, a1).trim() + '\n');
for (const f of ['logo-pln-nr-color.png', 'logo-pln-nr-white.png']) copyFileSync(join(root, 'assets', f), join(sa, f));
// 5) paket .zip untuk diunggah sebagai skill
const zip = join(root, 'dist', 'pln-nr-explainer-studio.zip');
execFileSync('python3', ['-c', `import zipfile,os,sys
z=zipfile.ZipFile(sys.argv[1],'w',zipfile.ZIP_DEFLATED); b=sys.argv[2]
for d,_,fs in os.walk(b):
  for f in fs:
    if '__pycache__' in d or f.endswith('.pyc'): continue
    p=os.path.join(d,f); z.write(p, os.path.join('pln-nr-explainer-studio', os.path.relpath(p,b)))
z.close()`, zip, skill]);
console.log('Skill assets + zip OK');
