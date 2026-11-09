// Build: menggabungkan src/ menjadi satu file HTML mandiri + katalog JSON untuk Explainer Studio.
// Pakai: node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = p => readFileSync(join(root, p));
const dataJs = rd('src/styles-data.js').toString();
const uri = p => 'data:image/png;base64,' + rd(p).toString('base64');

let html = rd('src/gallery.html').toString()
  .replace('/*DATA*/', () => dataJs)
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
const azName = Object.fromEntries(P.AZ.map(r => [r[0], r[1]]));
const catalog = {
  schema: 'plnnr.motion-catalog/1',
  brand: 'PT PLN Nusantara Renewables',
  generated: new Date().toISOString().slice(0, 10),
  easing: P.EASES,
  transitions: P.TRANSITIONS.map(({ cls, ...t }) => t),
  families: P.CATS,
  styles: P.STYLES.map(({ svg, ...s }) => ({ ...s, use_cases: s.letters.map(l => ({ letter: l, need: azName[l] })) })),
  a_to_z: P.AZ.map(([letter, need, audience, primary, alternative, duration, formats]) => ({ letter, need, audience, primary, alternative, duration, formats }))
};
writeFileSync(join(root, 'catalog/pln-nr-motion-styles.json'), JSON.stringify(catalog, null, 2) + '\n');
console.log('OK —', P.STYLES.length, 'gaya,', (html.length / 1024).toFixed(0), 'KB');
