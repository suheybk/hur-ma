// Simülasyonu sabit adımlarla ilerletip belirli anlarda görüntü alır (yazılım işleyicide hızlı).
// node test/adim.mjs <sorgu> <önek> <t1:ad1,t2:ad2,...> [fare: bos|gez|yukari|...] [w h] [dokun]
// t: bölüm başından itibaren oyun saniyesi. 'kart' adı gelirse Devam'a basılır.
import { sunucu, tarayici, bekle, cek, durum, info, ALT_YOL } from './yardimci.mjs';
const [sorgu, onek, anlarS, fare = 'bos', w = '1440', h = '900', dokun = ''] = process.argv.slice(2);
const anlar = anlarS.split(',').map((a) => { const [t, ad] = a.split(':'); return { t: +t, ad }; });
const s = await sunucu();
const { browser, page, kayit } = await tarayici({ genislik: +w, yukseklik: +h, dokunmatik: !!dokun });
await page.goto(`http://127.0.0.1:4317${ALT_YOL}${sorgu}`);
await page.waitForFunction(() => window.__oyun && window.__oyun.durum.bolum >= 0);
await bekle(1500);
await page.evaluate(() => window.__oyun.durdur(true));
const IMLEC = {
  bos: null,
  gez: (t) => [Math.sin(t * 0.7) * 0.6, Math.sin(t * 1.1 + 1) * 0.5],
  yukari: (t) => [Math.sin(t * 0.5) * 0.15 - 0.1, 0.85],
  salla: (t) => [Math.sin(t * 9) * 0.5, 0.1],
};
const f = IMLEC[fare] || null;
let t = 0;
const ADIM = 0.2;
for (const a of anlar) {
  while (t < a.t - 1e-6) {
    if (f) { const [x, y] = f(t); await page.evaluate(([x, y]) => window.__oyun.imlec(x, y), [x, y]); }
    await page.evaluate((d) => window.__oyun.ilerle(d, 1 / 30, false), Math.min(ADIM, a.t - t));
    t += Math.min(ADIM, a.t - t);
  }
  await page.evaluate(() => window.__oyun.ciz());
  await bekle(60);
  const d = await durum(page);
  if (a.ad === 'devam') { await page.evaluate(() => window.__oyun.devam()); await bekle(1500); t = 0; console.log('devam', JSON.stringify(d)); continue; }
  const yol = await cek(page, `${onek}-${a.ad}`);
  console.log(`${t.toFixed(1)}s`, yol.split('/').pop(), JSON.stringify(d), JSON.stringify(await info(page)));
  if (kayit.hatalar.length && !kayit._y) { kayit._y = 1; console.log('HATA:', kayit.hatalar[0].slice(0, 1200)); }
}
console.log('hatalar:', kayit.hatalar.length, 'dış istek:', kayit.disIstek.length);
await browser.close(); s.close();
