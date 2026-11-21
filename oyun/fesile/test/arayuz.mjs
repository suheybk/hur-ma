// Defter, klavye (Esc), sözlük ve WebGL yedeği denetimi.
import { createRequire } from 'node:module';
import { sunucu, tarayici, bekle, ALT_YOL, KOK } from './yardimci.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const s = await sunucu(4318);
const { browser, page, kayit } = await tarayici({ genislik: 1440, yukseklik: 900 });
await page.goto(`http://127.0.0.1:4318${ALT_YOL}?bolum=2&kalite=dusuk`);
await page.waitForFunction(() => window.__oyun); await bekle(1500);
await page.click('#defter-dugme'); await bekle(400);
await page.click('[data-sekme="sozluk"]'); await bekle(300);
await page.screenshot({ path: `${KOK}/ekran-goruntuleri/10-defter-sozluk.png` });
await page.click('[data-sekme="turler"]'); await bekle(300);
await page.screenshot({ path: `${KOK}/ekran-goruntuleri/10-defter-turler.png` });
const acik = await page.evaluate(() => !document.getElementById('defter').classList.contains('gizli'));
await page.keyboard.press('Escape'); await bekle(200);
const kapali = await page.evaluate(() => document.getElementById('defter').classList.contains('gizli'));
console.log('defter açıldı:', acik, 'Esc ile kapandı:', kapali, 'hatalar:', kayit.hatalar);
await browser.close();
// WebGL yok
const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
const p2 = await b2.newPage({ viewport: { width: 1000, height: 700 } });
await p2.goto(`http://127.0.0.1:4318${ALT_YOL}`); await bekle(1500);
console.log('yedek görünür:', await p2.evaluate(() => !document.getElementById('yedek').classList.contains('gizli')));
await p2.screenshot({ path: `${KOK}/ekran-goruntuleri/11-webgl-yedek.png` });
await b2.close(); s.close();
