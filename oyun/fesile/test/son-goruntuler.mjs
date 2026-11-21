// Son ekran görüntüleri: her bölümün tanıtım planı ve aksiyonu, kart, B7 dönüşüm kareleri,
// bitiş, açılış ve dikey telefon. Önce: npm run build.  node test/son-goruntuler.mjs [bolum...]
import { sunucu, tarayici, bekle, cek, durum, info, ALT_YOL } from './yardimci.mjs';

const PLAN = {
  0: [['', 6, '00-acilis']],
  1: [['tanitim', 7, '01-cekirdek-urun'], ['dusus', 14, '01-cekirdek-aksiyon'], ['carpma', 7.5, '01-cekirdek-sukun'], ['KART', 0, 'kart']],
  2: [['tanitim', 6.5, '02-kok-urun'], ['dalis', 7, '02-kok-aksiyon'], ['yukselis', 5, '02-kok-yaprak']],
  3: [['tanitim', 11, '03-kalp-urun'], ['firtina', 6, '03-kalp-aksiyon']],
  4: [['tanitim', 7, '04-cift-urun'], ['aksiyon', 7, '04-cift-aksiyon']],
  5: [['tanitim', 9.5, '05-meyve-urun'], ['silkele', 5, '05-meyve-aksiyon'], ['yakala', 6, '05-meyve-yakala'], ['ikram', 4.5, '05-meyve-ikram']],
  6: [['tanitim', 8.5, '06-fesile-urun'], ['kesim', 5, '06-fesile-aksiyon'], ['sulama', 3, '06-fesile-su'], ['hurmalik', 8, '06-fesile-hurmalik']],
  7: [['tanitim', 6, '07-urcun-urun'], ['kuruma', 6, '07-urcun-kuruma'], ['kaldir', 4.5, '07-urcun-aksiyon'],
    ['oturma', 0.5, '07-morf-1'], ['oturma', 1.5, '07-morf-2'], ['oturma', 2.5, '07-morf-3'], ['oturma', 3.3, '07-morf-4'], ['oturma', 4.1, '07-morf-5'],
    ['oturma', 4.9, '07-morf-6'], ['oturma', 5.7, '07-morf-7'], ['oturma', 6.6, '07-morf-8'], ['oturma', 8.2, '07-morf-9'],
    ['sessizlik', 9, '07-urcun-ayet'], ['donus', 14, '07-urcun-yeni-hilal']],
  8: [['', 8, '08-bitis']],
};
const secili = process.argv.slice(2).map(Number);
const s = await sunucu();
for (const [b, liste] of Object.entries(PLAN)) {
  if (secili.length && !secili.includes(+b)) continue;
  const { browser, page, kayit } = await tarayici();
  await page.goto(`http://127.0.0.1:4317${ALT_YOL}?kalite=yuksek${+b ? `&bolum=${b}` : ''}`);
  await page.waitForFunction(() => window.__oyun);
  await bekle(1500);
  await page.evaluate(() => window.__oyun.durdur(true));
  let t = 0;
  for (const [evre, et, ad] of liste) {
    while (t < 200) {
      const d = await durum(page);
      if (evre === 'KART' ? d.durum === 'kart' : (evre === '' || d.evre === evre) && d.et >= et) break;
      await page.evaluate(() => window.__oyun.ilerle(0.1, 1 / 30, false));
      t += 0.1;
    }
    await page.evaluate(() => window.__oyun.ciz());
    if (evre === 'KART' || b === '0') await bekle(2600); else await bekle(80);
    await page.evaluate(() => window.__oyun.ciz());
    await cek(page, ad);
    console.log(ad, JSON.stringify(await durum(page)), JSON.stringify(await info(page)));
  }
  if (kayit.hatalar.length) console.log('HATA', b, kayit.hatalar.slice(0, 2));
  await browser.close();
}
// dikey telefon
if (!secili.length || secili.includes(9)) {
  const { browser, page } = await tarayici({ genislik: 390, yukseklik: 844, dokunmatik: true });
  await page.goto(`http://127.0.0.1:4317${ALT_YOL}?kalite=orta&bolum=4`);
  await page.waitForFunction(() => window.__oyun);
  await bekle(1500);
  await page.evaluate(() => window.__oyun.ilerle(7, 1 / 30, true));
  await cek(page, '09-telefon-dikey');
  await page.evaluate(() => window.__oyun.ilerle(11, 1 / 30, true));
  await cek(page, '09-telefon-dikey-aksiyon');
  await browser.close();
}
s.close();
