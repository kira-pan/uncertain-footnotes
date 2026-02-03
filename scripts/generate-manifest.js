/**
 * Generates manifest.json from actual filesystem filenames.
 * Use this so URLs match the real files (e.g. narrow no-break space before "AM").
 * Run from project root: node scripts/generate-manifest.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'public', 'images', 'word_cutouts');
const SKIP = ['other(ignore)', 'manifest.json'];

const manifest = {};
const entries = fs.readdirSync(ROOT, { withFileTypes: true });

for (const ent of entries) {
  if (!ent.isDirectory() || SKIP.includes(ent.name)) continue;
  const dirPath = path.join(ROOT, ent.name);
  const files = fs.readdirSync(dirPath)
    .filter(f => /\.(png|jpg|jpeg|gif|webp)$/i.test(f));
  if (files.length) manifest[ent.name] = files;
}

const outPath = path.join(ROOT, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Wrote', outPath, 'with', Object.keys(manifest).length, 'folders');
