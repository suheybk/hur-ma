// Hızlı görsel kontrol: node test/hizli.mjs "<sorgu>" <bekleme_ms> <ad> [genişlik yükseklik]
import { sunucu, tarayici, bekle, cek, durum, info, ALT_YOL } from './yardimci.mjs';
const [sorgu = '', ms = '6000', ad = 'deneme', w = '1440', h = '900'] = process.argv.slice(2);
const s = await sunucu();
const { browser, page, kayit } = await tarayici({ genislik: +w, yukseklik: +h });
await page.goto(`http://127.0.0.1:4317${ALT_YOL}${sorgu}`);
await bekle(+ms);
console.log(await durum(page), await info(page));
console.log(await cek(page, ad));
console.log('hatalar:', kayit.hatalar.slice(0, 10), 'dış istek:', kayit.disIstek);
await browser.close(); s.close();
