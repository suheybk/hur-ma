// §9 listesini TASARIM.md'den ayrıştırır ve src/icerik.js ile harf harf karşılaştırır.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
const kok = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const md = fs.readFileSync(path.join(kok, 'TASARIM.md'), 'utf8');
const bas = md.indexOf('### İçerik listesi');
const son = md.indexOf('Kartlarda kullanılmayan');
const blok = md.slice(bas, son);
// madde madde birleştir
const maddeler = [];
for (const satir of blok.split('\n')) {
  if (satir.startsWith('- ')) maddeler.push(satir.slice(2));
  else if (satir.startsWith('  ') && maddeler.length) maddeler[maddeler.length - 1] += ' ' + satir.trim();
}
const spec = [];
for (const m of maddeler) {
  let r = m.match(/^\*\*(.+?)\*\*(?: \(.+?\))? — "(.+?)"/);
  if (r) { spec.push({ kaynak: r[1], metin: r[2] }); continue; }
  r = m.match(/^"(.+?)"\s*\((.+?)\)/);
  if (r) { spec.push({ kaynak: r[2], metin: r[1] }); continue; }
  console.log('AYRIŞTIRILAMADI:', m);
}
const dosya = process.argv[2] || path.join(kok, 'src/icerik.js');
const { METINLER } = await import(url.pathToFileURL(dosya).href);
let hata = 0;
const kullanilan = new Set();
for (const [anahtar, k] of Object.entries(METINLER)) {
  const s = spec.find((x) => x.metin === k.metin);
  if (!s) { console.log('LİSTEDE YOK / FARKLI:', anahtar, JSON.stringify(k.metin)); hata++; continue; }
  if (s.kaynak !== k.kaynak) { console.log('KAYNAK FARKLI:', anahtar, k.kaynak, '≠', s.kaynak); hata++; }
  if (k.dogrulandi !== false) { console.log('dogrulandi false değil:', anahtar); hata++; }
  kullanilan.add(s.metin);
}
for (const s of spec) if (!kullanilan.has(s.metin)) console.log('(bilgi) dosyada olmayan liste öğesi:', s.kaynak);
console.log(`${spec.length} liste öğesi, ${Object.keys(METINLER).length} kayıt, ${hata} hata`);
process.exit(hata ? 1 : 0);
