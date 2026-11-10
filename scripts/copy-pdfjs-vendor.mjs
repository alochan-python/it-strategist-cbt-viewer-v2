// copy-pdfjs-vendor.mjs
// node_modules/pdfjs-dist から、アプリが実行時に必要とするファイルだけを
// vendor/pdfjs へコピーする（CDNを使わず、プロジェクト内へ同梱するため）。
// 実行: npm install してから node scripts/copy-pdfjs-vendor.mjs
import { cpSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'node_modules', 'pdfjs-dist');
const dest = join(root, 'vendor', 'pdfjs');

mkdirSync(dest, { recursive: true });
mkdirSync(join(dest, 'images'), { recursive: true });

copyFileSync(join(src, 'build', 'pdf.min.mjs'), join(dest, 'pdf.min.mjs'));
copyFileSync(join(src, 'build', 'pdf.worker.min.mjs'), join(dest, 'pdf.worker.min.mjs'));
copyFileSync(join(src, 'web', 'pdf_viewer.mjs'), join(dest, 'pdf_viewer.mjs'));
copyFileSync(join(src, 'web', 'pdf_viewer.css'), join(dest, 'pdf_viewer.css'));
copyFileSync(join(src, 'LICENSE'), join(dest, 'LICENSE'));

for (const name of readdirSync(join(src, 'web', 'images'))) {
  if (name.endsWith('.svg') || name.endsWith('.gif')) {
    copyFileSync(join(src, 'web', 'images', name), join(dest, 'images', name));
  }
}

cpSync(join(src, 'cmaps'), join(dest, 'cmaps'), { recursive: true });
cpSync(join(src, 'standard_fonts'), join(dest, 'standard_fonts'), { recursive: true });
// JBIG2/JPEG2000デコード用WASM。これが無いと一部PDFの走査画像ページが白紙になる。
cpSync(join(src, 'wasm'), join(dest, 'wasm'), { recursive: true });

console.log('pdfjs-dist の必要ファイルを vendor/pdfjs へコピーしました。');
