// Oyun zamanının gerçek zamana oranını ölçer (yazılım işleyicide kaba fps).
import { sunucu, tarayici, bekle, durum, ALT_YOL } from './yardimci.mjs';
const [sorgu = '?bolum=1', sure = '8000'] = process.argv.slice(2);
const s = await sunucu();
const { browser, page, kayit } = await tarayici();
await page.goto(`http://127.0.0.1:4317${ALT_YOL}${sorgu}`);
await page.waitForFunction(() => window.__oyun);
await bekle(3000);
const f = await page.evaluate((ms) => new Promise((r) => { let n = 0; const b = performance.now(); const a = () => { n++; if (performance.now() - b < ms) requestAnimationFrame(a); else r(n / (ms / 1000)); }; requestAnimationFrame(a); }), +sure);
console.log('fps', f.toFixed(1), JSON.stringify(await durum(page)), kayit.hatalar.slice(0, 2));
await browser.close(); s.close();
