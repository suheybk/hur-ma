// Test yardımcıları: dist/ klasörünü alt yoldan sunan küçük sunucu + Playwright tarayıcısı.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const KOK = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
export const ALT_YOL = '/site/oyunlar/fesile/';
const TURLER = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' };

export function sunucu(port = 4317, klasor = path.join(KOK, 'dist')) {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith(ALT_YOL)) { res.writeHead(404); res.end('alt yol dışında'); return; }
    p = p.slice(ALT_YOL.length) || 'index.html';
    const dosya = path.join(klasor, p);
    if (!dosya.startsWith(klasor) || !fs.existsSync(dosya) || fs.statSync(dosya).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TURLER[path.extname(dosya)] || 'application/octet-stream' });
    fs.createReadStream(dosya).pipe(res);
  });
  return new Promise((r) => s.listen(port, '127.0.0.1', () => r(s)));
}

export async function tarayici({ genislik = 1440, yukseklik = 900, dokunmatik = false } = {}) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({
    viewport: { width: genislik, height: yukseklik }, deviceScaleFactor: 1,
    hasTouch: dokunmatik, isMobile: dokunmatik,
  });
  const page = await ctx.newPage();
  const kayit = { hatalar: [], uyarilar: [], disIstek: [], istekler: 0 };
  page.on('console', (m) => {
    if (m.type() === 'error') kayit.hatalar.push(m.text());
    else if (m.type() === 'warning') kayit.uyarilar.push(m.text());
  });
  page.on('pageerror', (e) => kayit.hatalar.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 7).join(' / ')));
  page.on('request', (r) => {
    kayit.istekler++;
    const u = new URL(r.url());
    if (!['127.0.0.1', 'localhost'].includes(u.hostname) && u.protocol !== 'data:' && u.protocol !== 'blob:') kayit.disIstek.push(r.url());
  });
  return { browser, ctx, page, kayit };
}

export const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
export async function durum(page) { return page.evaluate(() => window.__oyun && window.__oyun.durum); }
export async function info(page) { return page.evaluate(() => window.__oyun.info()); }
// evre/koşul gelene dek bekle
export async function bekleKosul(page, f, zamanAsimi = 120000, aralik = 250) {
  const bas = Date.now();
  while (Date.now() - bas < zamanAsimi) {
    const d = await durum(page);
    if (d && f(d)) return d;
    await bekle(aralik);
  }
  throw new Error('zaman aşımı: ' + JSON.stringify(await durum(page)));
}
export async function cek(page, ad) {
  const yol = path.join(KOK, 'ekran-goruntuleri', ad + '.png');
  await page.screenshot({ path: yol });
  return yol;
}
