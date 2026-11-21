// Baştan sona oynanış: açılış → "Başla" (gerçek tıklama) → 7 bölüm → kartlar (gerçek "Devam") → bitiş.
// node test/oyna.mjs <fare|bos|dokun> [w h] [önek]
// fare: gerçek fare hareketleri; bos: hiç girdi yok; dokun: dokunmatik sürükleme (CDP).
import { sunucu, tarayici, bekle, cek, durum, info, ALT_YOL } from './yardimci.mjs';
const [mod = 'fare', w = '1440', h = '900', onek = '_oyna'] = process.argv.slice(2);
const s = await sunucu();
const { browser, page, kayit } = await tarayici({ genislik: +w, yukseklik: +h, dokunmatik: mod === 'dokun' });
const cdp = mod === 'dokun' ? await page.context().newCDPSession(page) : null;
await page.goto(`http://127.0.0.1:4317${ALT_YOL}?kalite=orta`);
await page.waitForFunction(() => window.__oyun);
await bekle(3500);
await cek(page, `${onek}-acilis`);
if (mod === 'dokun') await page.tap('#basla'); else await page.click('#basla');
await bekle(1200);
await page.evaluate(() => window.__oyun.durdur(true));
let t = 0, kartSay = 0, sonBolum = 0;
const rapor = {};
let dokunAktif = false;
const ADIM = 0.25;
while (t < 900) {
  const d = await durum(page);
  if (d.bolum !== sonBolum) { sonBolum = d.bolum; rapor[d.bolum] = { bas: t, maxCizim: 0, maxUcgen: 0 }; }
  if (d.durum === 'bitis') break;
  if (d.durum === 'kart') {
    if (kartSay === 0) await cek(page, `${onek}-kart`);
    kartSay++;
    rapor[d.bolum].bitti = t;
    if (mod === 'dokun') await page.tap('#kart-devam'); else await page.click('#kart-devam');
    await bekle(1300);
    continue;
  }
  // girdi
  const W = +w, H = +h;
  const x = W / 2 + Math.sin(t * 0.8) * W * 0.3, y = H / 2 + Math.sin(t * 1.25 + 1) * H * 0.28;
  if (mod === 'fare') await page.mouse.move(x, y);
  if (mod === 'dokun') {
    await cdp.send('Input.dispatchTouchEvent', { type: dokunAktif ? 'touchMove' : 'touchStart', touchPoints: [{ x, y }] });
    dokunAktif = true;
  }
  await page.evaluate((a) => window.__oyun.ilerle(a, 1 / 30, false), ADIM);
  t += ADIM;
  if (Math.round(t / ADIM) % 20 === 0) {
    await page.evaluate(() => window.__oyun.ciz());
    const i = await info(page);
    const r = rapor[d.bolum];
    if (r) { r.maxCizim = Math.max(r.maxCizim, i.cizim); r.maxUcgen = Math.max(r.maxUcgen, i.ucgen); }
  }
}
if (cdp && dokunAktif) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await page.evaluate(() => window.__oyun.ilerle(4, 1 / 30, true));
await bekle(300);
await cek(page, `${onek}-bitis`);
const d = await durum(page);
console.log('son durum:', JSON.stringify(d), 'oyun süresi (sn):', t.toFixed(0), 'kart:', kartSay);
for (const [b, r] of Object.entries(rapor)) console.log(`bölüm ${b}: ${((r.bitti ?? t) - r.bas).toFixed(0)} sn, en çok çizim ${r.maxCizim}, üçgen ${r.maxUcgen}`);
console.log('hatalar:', kayit.hatalar.length, kayit.hatalar.slice(0, 3), 'uyarı:', kayit.uyarilar.length, kayit.uyarilar.slice(0, 3), 'dış istek:', kayit.disIstek, 'toplam istek:', kayit.istekler);
await browser.close(); s.close();
