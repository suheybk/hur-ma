// DOM arayüzü: başlık tipografisi, 3B'ye iliştirilmiş etiketler, ipucu, ray,
// kart, sakin satır, Defter, köşe düğmeleri, özel imleç.
import * as THREE from 'three';
import { METINLER, KARTLAR, BOLUMLER, SOZLUK, TURLER, ETIKETLER, DOKUNMATIK_IPUCU } from '../icerik.js';
import { evreAcisi } from '../dunya/gok.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const kac = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ay evresi simgesi (SVG yolu): ışıklı bölge = kenar yarım dairesi + terminatör elipsi
export function ayIkonu(yas, r = 8) {
  const th = evreAcisi(yas);
  const k = Math.cos(th);
  const buyuyen = th < Math.PI;
  const s = buyuyen ? 1 : 0; // kenar yayının dönüşü
  const rx = Math.abs(k) * r;
  // üstten alta kenar yayı (ışıklı tarafta), sonra terminatörle geri
  const kenarSweep = buyuyen ? 1 : 0;
  const termSweep = (k > 0) === buyuyen ? 0 : 1;
  const yol = `M ${r} 0 A ${r} ${r} 0 0 ${kenarSweep} ${r} ${2 * r} A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${r} 0 Z`;
  void s;
  return `<svg viewBox="-1 -1 ${2 * r + 2} ${2 * r + 2}" aria-hidden="true"><circle cx="${r}" cy="${r}" r="${r}" fill="rgba(244,234,214,0.12)" stroke="rgba(244,234,214,0.45)" stroke-width="0.6"/><path d="${yol}" fill="#f1dfae"/></svg>`;
}

const IKON = {
  sesAcik: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  sesKapali: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  defter: '<svg viewBox="0 0 24 24"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></svg>',
  tam: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
};

export class UI {
  constructor() {
    this.baslikEl = $('#baslik');
    this.etiketKap = $('#etiketler');
    this.svg = $('#etiket-cizgi');
    this.ipucuEl = $('#ipucu');
    this.ilerlemeEl = $('#ilerleme');
    this.imlecEl = $('#imlec');
    this.etiketler = new Map();
    this.dokunmatik = matchMedia('(pointer: coarse)').matches;
    this._v = new THREE.Vector3();
    $('#ses-dugme').innerHTML = IKON.sesAcik;
    $('#defter-dugme').innerHTML = IKON.defter;
    $('#tam-dugme').innerHTML = IKON.tam;
    if (!document.fullscreenEnabled) $('#tam-dugme').classList.add('gizli');
    $('#tam-dugme').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {});
    });
    this._defterKur();
  }

  // ---------- açılış ----------
  acilisGoster() {
    const h = $('#acilis-baslik');
    h.innerHTML = [...'Fesîle'].map((c, i) => `<span class="h" style="animation-delay:${0.25 + i * 0.09}s">${c}</span>`).join('');
    h.setAttribute('aria-label', 'Fesîle');
    $('#acilis').classList.remove('gizli');
  }
  acilisGizle() { $('#acilis').classList.add('gizli'); }

  // ---------- başlık ----------
  baslik(no, ad, alt, satir) {
    const b = this.baslikEl;
    b.classList.remove('goster', 'kucul');
    const harf = (s, gecikme, adim) => [...s].map((c, i) => c === ' '
      ? '<span class="h bosluk"> </span>'
      : `<span class="h" style="transition-delay:${(gecikme + i * adim).toFixed(2)}s">${kac(c)}</span>`).join('');
    const kelime = (s, gecikme, adim) => s.split(' ').map((w, i) => `<span class="k" style="transition-delay:${(gecikme + i * adim).toFixed(2)}s">${kac(w)}</span>`).join(' ');
    b.querySelector('.no').innerHTML = harf(String(no).padStart(2, '0') + ' —', 0, 0.06);
    b.querySelector('.ad').innerHTML = harf(ad, 0.15, 0.055);
    b.querySelector('.alt').innerHTML = kelime(alt, 0.75, 0.1);
    b.querySelector('.satir').innerHTML = satir ? kelime(satir, 1.5, 0.08) : '';
    b.setAttribute('aria-label', `${no}. bölüm: ${ad}, ${alt}. ${satir || ''}`);
    void b.offsetWidth;
    requestAnimationFrame(() => b.classList.add('goster'));
  }
  baslikGizle() { this.baslikEl.classList.add('kucul'); }

  // ---------- etiketler ----------
  // anahtar: ETIKETLER anahtarı ya da {b,s}; nokta: THREE.Vector3 (dünya); dx,dy: ekran ofseti
  etiket(id, { icerik, nokta, dx = 80, dy = -60, genis = false } = {}) {
    let e = this.etiketler.get(id);
    const ic = typeof icerik === 'string' ? ETIKETLER[icerik] : icerik;
    if (!e) {
      const div = el('div', 'etiket' + (ic.soz ? ' soz' : '') + (genis ? ' genis' : ''));
      div.innerHTML = `<b>${kac(ic.b)}</b><span>${kac(ic.s)}</span>`;
      this.etiketKap.appendChild(div);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      if (ic.soz) g.setAttribute('class', 'soz');
      g.innerHTML = '<line/><circle r="5"/><circle class="ic" r="1.6"/>';
      this.svg.appendChild(g);
      e = { div, g, nokta: nokta || new THREE.Vector3(), dx, dy, acik: false, a: 0 };
      this.etiketler.set(id, e);
    }
    if (nokta) e.nokta = nokta;
    e.dx = dx; e.dy = dy;
    return e;
  }
  etiketAc(id, acik = true) {
    const e = this.etiketler.get(id); if (!e) return;
    e.acik = acik; e.div.classList.toggle('acik', acik);
  }
  etiketlerTemizle() {
    for (const e of this.etiketler.values()) { e.div.remove(); e.g.remove(); }
    this.etiketler.clear();
  }
  etiketleriGuncelle(kamera, dt) {
    const W = innerWidth, H = innerHeight;
    const olcek = W < 700 ? 0.6 : 1;
    for (const e of this.etiketler.values()) {
      e.a += ((e.acik ? 1 : 0) - e.a) * (1 - Math.exp(-dt * 6));
      if (e.a < 0.01) { e.g.style.opacity = 0; continue; }
      this._v.copy(e.nokta).project(kamera);
      const arkada = this._v.z > 1;
      const x = (this._v.x * 0.5 + 0.5) * W, y = (-this._v.y * 0.5 + 0.5) * H;
      let dx = e.dx * olcek, dy = e.dy * olcek;
      // ekrandan taşmasın
      const lx = x + dx, ly = y + dy;
      const sag = dx < 0;
      e.div.classList.toggle('sag', sag);
      const gw = e.div.offsetWidth || 160;
      let tx = sag ? lx - gw - 6 : lx + 6;
      tx = Math.max(10, Math.min(W - gw - (W < 700 ? 10 : 76), tx));
      const ty = Math.max(10, Math.min(H - 60, ly - 14));
      e.div.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
      e.div.style.opacity = arkada ? 0 : '';
      const uz = Math.hypot(dx, dy) * e.a;
      const ang = Math.atan2(dy, dx);
      const [ln, c1, c2] = e.g.children;
      ln.setAttribute('x1', x); ln.setAttribute('y1', y);
      ln.setAttribute('x2', x + Math.cos(ang) * uz); ln.setAttribute('y2', y + Math.sin(ang) * uz);
      c1.setAttribute('cx', x); c1.setAttribute('cy', y); c2.setAttribute('cx', x); c2.setAttribute('cy', y);
      e.g.style.opacity = arkada ? 0 : e.a;
    }
  }

  // ---------- ipucu & ilerleme ----------
  ipucu(metin) {
    this._ipucuMetin = metin;
    if (this._kapi) return; // kapı açıkken satır "devam" uyarısını gösterir
    if (!metin) { this.ipucuEl.classList.remove('acik'); return; }
    this.ipucuEl.textContent = this.dokunmatik ? DOKUNMATIK_IPUCU(metin) : metin;
    this.ipucuEl.classList.add('acik');
  }
  // okuma kapısı: oyuncu tıklayana / kaydırana kadar bekle
  kapi(acik) {
    this._kapi = acik;
    document.body.classList.toggle('kapida', acik);
    const e = this.ipucuEl;
    if (acik) {
      e.textContent = this.dokunmatik ? 'Devam etmek için ekrana dokun' : 'Devam etmek için tıkla ya da aşağı kaydır';
      e.classList.add('acik', 'kapi');
    } else {
      e.classList.remove('kapi');
      this.ipucu(this._ipucuMetin);
    }
  }
  ilerleme(oran) {
    if (oran == null) { this.ilerlemeEl.classList.remove('acik'); return; }
    this.ilerlemeEl.classList.add('acik');
    this.ilerlemeEl.firstChild.style.width = `${Math.round(Math.min(1, oran) * 100)}%`;
  }

  // ---------- özel imleç ----------
  imlec(ndcX, ndcY, gorunur, yardim) {
    const x = (ndcX * 0.5 + 0.5) * innerWidth, y = (-ndcY * 0.5 + 0.5) * innerHeight;
    this.imlecEl.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    this.imlecEl.classList.toggle('acik', gorunur);
    this.imlecEl.classList.toggle('yardim', !!yardim);
  }

  // ---------- ray ----------
  rayKur(sec) {
    const ray = $('#ray');
    ray.innerHTML = '';
    for (const b of BOLUMLER) {
      const d = el('button', '', `${ayIkonu(b.ay)}<span class="ray-ad">${String(b.no).padStart(2, '0')} · ${kac(b.ad)}</span>`);
      d.setAttribute('aria-label', `${b.no}. bölüm: ${b.ad}`);
      d.dataset.no = b.no;
      d.addEventListener('click', () => { if (d.classList.contains('gecildi')) sec(b.no); });
      ray.appendChild(d);
    }
  }
  rayGuncelle(simdiki, enYuksek) {
    for (const d of document.querySelectorAll('#ray button')) {
      const n = +d.dataset.no;
      d.classList.toggle('simdi', n === simdiki);
      d.classList.toggle('gecildi', n <= enYuksek && n !== simdiki);
      d.tabIndex = n <= enYuksek && n !== simdiki ? 0 : -1;
      if (n === simdiki) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current');
    }
  }

  // ---------- kart ----------
  metinHTML(anahtar) {
    const m = METINLER[anahtar];
    if (!m) return '';
    const tur = m.tur === 'hadis' ? 'hadis' : 'âyet';
    return `<div class="kart-metin"><p>“${kac(m.metin)}”</p><cite>${kac(m.kaynak)} · ${tur}, meâlen</cite>${m.not ? `<div class="not">${kac(m.not)}</div>` : ''}</div>`;
  }
  kartGoster(no, devam) {
    const k = KARTLAR[no];
    const kart = $('#kart');
    kart.querySelector('.kart-ust').textContent = k.baslik;
    kart.querySelector('.kart-metinler').innerHTML = k.ogeler.map((a) => this.metinHTML(a)).join('');
    kart.querySelector('.kart-bag').textContent = k.bag;
    kart.classList.remove('gizli');
    document.body.classList.add('kart-acik');
    requestAnimationFrame(() => requestAnimationFrame(() => kart.classList.add('acik')));
    const d = $('#kart-devam');
    const f = () => { d.removeEventListener('click', f); this.kartGizle(); devam(); };
    d.addEventListener('click', f);
    setTimeout(() => d.focus({ preventScroll: true }), 300);
  }
  kartGizle() {
    const kart = $('#kart');
    kart.classList.remove('acik');
    document.body.classList.remove('kart-acik');
    setTimeout(() => kart.classList.add('gizli'), 50);
  }
  kartAcikMi() { return !$('#kart').classList.contains('gizli'); }

  // B7: sakin satır
  sakinSatir(anahtar) {
    const s = $('#sakin-satir');
    if (!anahtar) { s.classList.remove('acik'); return; }
    const m = METINLER[anahtar];
    s.innerHTML = `<p>“${kac(m.metin)}”</p><cite>${kac(m.kaynak)} · âyet, meâlen</cite>`;
    requestAnimationFrame(() => s.classList.add('acik'));
  }

  // ---------- Defter ----------
  _defterKur() {
    this.acilanKartlar = new Set();
    const d = $('#defter');
    const ac = () => { this._defterCiz(this.sekme || 'kartlar'); d.classList.remove('gizli'); $('#defter-kapat').focus(); this.onDefter?.(true); };
    const kapa = () => { d.classList.add('gizli'); this.onDefter?.(false); };
    $('#defter-dugme').addEventListener('click', ac);
    $('#bitis-defter').addEventListener('click', ac);
    $('#defter-kapat').addEventListener('click', kapa);
    d.addEventListener('click', (e) => { if (e.target === d) kapa(); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !d.classList.contains('gizli')) kapa(); });
    for (const b of d.querySelectorAll('.sekmeler button')) b.addEventListener('click', () => this._defterCiz(b.dataset.sekme));
  }
  _defterCiz(sekme) {
    this.sekme = sekme;
    for (const b of document.querySelectorAll('#defter .sekmeler button')) b.setAttribute('aria-selected', String(b.dataset.sekme === sekme));
    const g = $('#defter .defter-govde');
    let h = '';
    if (sekme === 'kartlar') {
      const liste = [...this.acilanKartlar].sort();
      if (!liste.length) h = '<p class="bos">Henüz açılan kart yok. Her bölümün sonunda bir kart açılır.</p>';
      for (const no of liste) {
        const k = KARTLAR[no];
        h += `<h3>${kac(k.baslik)}</h3>${k.ogeler.map((a) => this.metinHTML(a)).join('')}<p>${kac(k.bag)}</p>`;
      }
    } else if (sekme === 'sozluk') {
      for (const m of SOZLUK) {
        h += `<div class="madde"><b>${kac(m.k)}</b><p>${kac(m.t)}</p>`;
        if (m.dini) h += m.dini.map((a) => `<div class="dini">${this.metinHTML(a)}</div>`).join('');
        h += '</div>';
      }
    } else {
      h += '<p class="bos" style="font-style:normal">Medine bahçelerinde yetişen hurma türlerinden bazıları.</p>';
      for (const t of TURLER) {
        h += `<div class="madde"><b><span class="renk-nokta" style="background:${t.renk[0]}"></span><span class="renk-nokta" style="background:${t.renk[1]}"></span> ${kac(t.ad)}</b><p>${kac(t.t)}</p>`;
        if (t.hadis) h += `<div class="dini">${this.metinHTML(t.hadis)}</div>`;
        h += '</div>';
      }
    }
    g.innerHTML = h;
    g.scrollTop = 0;
  }

  sesIkonu(acik) {
    const b = $('#ses-dugme');
    b.innerHTML = acik ? IKON.sesAcik : IKON.sesKapali;
    b.setAttribute('aria-label', acik ? 'Sesi kapat' : 'Sesi aç');
  }
}
