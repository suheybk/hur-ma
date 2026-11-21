// Fesîle — giriş noktası: işleyici, döngü, bölüm akışı, test kancaları.
import './stil.css';
import * as THREE from 'three';
import { Atmosfer } from './dunya/atmosfer.js';
import { KameraRig } from './cekirdek/kamera.js';
import { Girdi } from './cekirdek/girdi.js';
import { UI } from './cekirdek/ui.js';
import { Ses } from './cekirdek/ses.js';
import { Post } from './fx/post.js';
import { HizCizgileri } from './fx/parcacik.js';
import { BOLUMLER } from './icerik.js';
import { Acilis } from './bolumler/acilis.js';
import { B1Cekirdek } from './bolumler/b1-cekirdek.js';
import { B2Kok } from './bolumler/b2-kok.js';
import { B3Kalp } from './bolumler/b3-kalp.js';
import { B4Cift } from './bolumler/b4-cift.js';
import { B5Meyve } from './bolumler/b5-meyve.js';
import { B6Fesile } from './bolumler/b6-fesile.js';
import { B7Urcun } from './bolumler/b7-urcun.js';
import { Bitis } from './bolumler/bitis.js';

const SINIFLAR = { 0: Acilis, 1: B1Cekirdek, 2: B2Kok, 3: B3Kalp, 4: B4Cift, 5: B5Meyve, 6: B6Fesile, 7: B7Urcun, 8: Bitis };

const KALITELER = {
  dusuk: { ad: 'dusuk', pr: 1, msaa: 0, bloomOlcek: 0.3, parcacik: 0.35 },
  orta: { ad: 'orta', pr: 1.5, msaa: 0, bloomOlcek: 0.45, parcacik: 0.65 },
  yuksek: { ad: 'yuksek', pr: 2, msaa: 4, bloomOlcek: 0.5, parcacik: 1 },
};
const SIRA = ['dusuk', 'orta', 'yuksek'];

const param = new URLSearchParams(location.search);

function webglVar() {
  try { const c = document.createElement('canvas'); return !!c.getContext('webgl2'); } catch { return false; }
}

class Oyun {
  constructor() {
    this.canvas = document.getElementById('sahne');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, powerPreference: 'high-performance', alpha: false, stencil: false });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.info.autoReset = false;

    const istenen = param.get('kalite');
    this.kaliteSabit = !!KALITELER[istenen];
    const varsayilan = matchMedia('(pointer: coarse)').matches ? 'orta' : 'yuksek';
    this.kalite = { ...KALITELER[this.kaliteSabit ? istenen : varsayilan] };
    this.hiz = Math.max(0.1, Math.min(20, parseFloat(param.get('hiz')) || 1));
    this.hareketAzalt = matchMedia('(prefers-reduced-motion: reduce)').matches || param.get('hareket') === 'az';
    HizCizgileri.azalt = this.hareketAzalt;

    this.atmo = new Atmosfer();
    this.kamera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 1200);
    this.rig = new KameraRig(this.kamera);
    this.rig.hareketAzalt = this.hareketAzalt;
    this.girdi = new Girdi(window);
    this.ui = new UI();
    this.ses = new Ses();
    this.ui.sesIkonu(this.ses.acik);
    document.getElementById('ses-dugme').addEventListener('click', () => {
      this.ses.baslat(); this.ses.ac(!this.ses.acik); this.ui.sesIkonu(this.ses.acik);
    });
    this.ui.onDefter = (acik) => { this.defterAcik = acik; };

    this.post = new Post(this.renderer, new THREE.Scene(), this.kamera, this.kalite);
    this.boyutla();
    addEventListener('resize', () => this.boyutla());

    this.durum = 'acilis';
    this.bolum = null;
    this.zamanOlcek = 1; this.zamanHedef = 1;
    this.zaman = 0;
    this.karartHedef = 0;
    this._kayitOku();

    this._kareler = []; this._kaliteBekle = 4;
    this._dongu = this._dongu.bind(this);
    this._son = performance.now();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(this._raf); this._raf = 0; this.ses.ctx?.suspend(); }
      else if (!this._raf) { this._son = performance.now(); this._raf = requestAnimationFrame(this._dongu); if (this.durum !== 'acilis') this.ses.ctx?.resume(); }
    });
    this._kapiKur();
    this._testKancalari();
  }

  // ---------- okuma kapısı ----------
  // Bölüm, yazı gösterdiği bir evreyi bitirmek istediğinde kapı açılır; oyun o
  // sahnede bekler. Tıklama, tekerlekle aşağı kaydırma, dokunma ya da
  // Boşluk / Enter / ↓ / PageDown ile geçilir.
  kapiAc(gec) {
    this._kapiGec = gec;
    this._kapiT = performance.now();
    this._tekerTop = 0;
    this.ui.kapi(true);
  }
  kapiKapat() {
    this._kapiGec = null;
    this.ui.kapi(false);
  }
  kapiGec() {
    const gec = this._kapiGec;
    if (!gec) return false;
    // açılır açılmaz yanlışlıkla geçilmesin; arka arkaya iki kapı tek hareketle atlanmasın
    if (performance.now() - this._kapiT < 450) return false;
    this.kapiKapat();
    this.ses.hava(0.5);
    gec();
    return true;
  }
  _kapiKur() {
    const arayuzde = (t) => t instanceof Element && !!t.closest('button, a, #kart, #defter, #kose, #ray, #acilis, #bitis');
    addEventListener('click', (e) => {
      if (this.durum !== 'bolum' || arayuzde(e.target)) return;
      this.kapiGec();
    });
    // Oyun içindeyken tekerlek sayfayı kaydırmaz; aşağı kaydırma kapıyı geçer.
    addEventListener('wheel', (e) => {
      if (!document.body.classList.contains('oyunda') || this.durum === 'bitis') return;
      if (e.target instanceof Element && e.target.closest('#kart, #defter')) return;
      e.preventDefault();
      if (!this._kapiGec || this.durum !== 'bolum') return;
      const dy = e.deltaMode === 1 ? e.deltaY * 30 : e.deltaY;
      if (dy <= 0) { this._tekerTop = 0; return; }
      this._tekerTop += dy;
      if (this._tekerTop > 40) { this._tekerTop = 0; this.kapiGec(); }
    }, { passive: false });
    addEventListener('keydown', (e) => {
      if (this.durum !== 'bolum' || !this._kapiGec || this.defterAcik) return;
      if (e.target instanceof Element && e.target.closest('#kart, #defter, #kose, #ray, input, textarea')) return;
      if ([' ', 'Enter', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); this.kapiGec(); }
    });
  }

  boyutla() {
    const w = innerWidth, h = innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, this.kalite.pr);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.post.boyut(w, h, pr);
    this.oran = w / h;
  }

  basla() {
    const n = parseInt(param.get('bolum'), 10);
    this.ui.rayKur((no) => this.bolumeGit(no));
    if (n >= 1 && n <= 8) {
      this._uiOyun();
      this.bolumKur(n);
    } else {
      this.bolumKur(0);
      this.ui.acilisGoster();
      document.getElementById('basla').addEventListener('click', () => {
        this.ses.baslat();
        this.ui.acilisGizle();
        this._uiOyun();
        this.bolumeGit(1);
      }, { once: true });
    }
    this._raf = requestAnimationFrame(this._dongu);
    const yuklemeBitir = () => document.getElementById('yukleme').classList.add('bitti');
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(() => setTimeout(yuklemeBitir, 350));
  }
  _uiOyun() {
    document.getElementById('kose').classList.remove('gizli');
    document.body.classList.add('oyunda');
  }

  bolumKur(no) {
    this.kapiKapat();
    if (this.bolum) { this.bolum.yokEt(); this.bolum = null; }
    this.rig.ucusu = null; this.rig.travma = 0; this.rig.fovVurus = 0; this.rig.yuvarla = 0; this.rig.paralaks = 0.6; this.rig.paralaksAci = 0;
    this.girdi.otoHedef = null; this.girdi.minYardim = 0;
    this.post.u.uHiz.value = 0; this.post.u.uFlas.value = 0;
    this.renderer.toneMappingExposure = 1;
    const S = SINIFLAR[no];
    const bilgi = BOLUMLER[no - 1] || { no };
    this.bolum = new S(this, bilgi);
    this.bolum.no = no;
    this.bolum.kur();
    this.post.sahne = this.bolum.sahne;
    this.durum = no === 0 ? 'acilis' : no === 8 ? 'bitis' : 'bolum';
    if (no >= 1 && no <= 7) {
      this.kayit.bolum = no;
      this.kayit.enYuksek = Math.max(this.kayit.enYuksek, no);
      this._kayitYaz();
      this.ui.rayGuncelle(no, this.kayit.enYuksek);
      document.getElementById('ray').classList.remove('gizli');
    } else if (no === 8) {
      this.ui.rayGuncelle(0, this.kayit.enYuksek);
    }
    // ilk karede gecikmesin diye shader'ları önceden derle
    try { this.renderer.compile(this.bolum.sahne, this.kamera); } catch { /* yok */ }
  }

  // karartarak geçiş
  bolumeGit(no) {
    if (this._gecisSurer) return;
    this._gecisSurer = true;
    this.ui.kartGizle();
    this.ui.sakinSatir(null);
    this.ui.baslikGizle();
    document.getElementById('bitis').classList.add('gizli');
    this.ses.hava(0.8);
    const u = this.post.u;
    const bas = performance.now();
    const k0 = u.uKarart.value;
    const adim = () => {
      const x = Math.min(1, (performance.now() - bas) / 700);
      u.uKarart.value = k0 + (1 - k0) * x * x;
      if (!this.hareketAzalt) u.uHiz.value = x * 0.8;
      if (x < 1) { requestAnimationFrame(adim); return; }
      this.zamanOlcek = this.zamanHedef = 1;
      this.bolumKur(no);
      this.karartHedef = 0;
      this._gecisSurer = false;
    };
    requestAnimationFrame(adim);
  }

  // bölüm tamamlandı → durulma → kart
  bolumBitti(b) {
    if (b.no < 1 || b.no > 7) return;
    this.durum = 'durulma';
    this.zamanHedef = 0.22;
    this.ui.ipucu(null); this.ui.ilerleme(null);
    setTimeout(() => {
      this.durum = 'kart';
      this.kayit.kartlar = [...new Set([...this.kayit.kartlar, b.no])];
      this.ui.acilanKartlar.add(b.no);
      this._kayitYaz();
      this.ses.cinlama(-5);
      this.ui.kartGoster(b.no, () => {
        this.bolumeGit(b.no < 7 ? b.no + 1 : 8);
      });
    }, b.no === 7 ? 600 : 1500);
  }

  _kayitOku() {
    this.kayit = { bolum: 0, enYuksek: 0, kartlar: [] };
    try {
      const k = JSON.parse(localStorage.getItem('fesile-kayit') || 'null');
      if (k && typeof k === 'object') Object.assign(this.kayit, k);
    } catch { /* yok */ }
    for (const n of this.kayit.kartlar) this.ui.acilanKartlar.add(n);
  }
  _kayitYaz() {
    try { localStorage.setItem('fesile-kayit', JSON.stringify(this.kayit)); } catch { /* yok */ }
  }

  _kaliteDenetle(gercekDt) {
    if (this.kaliteSabit || this.durum !== 'bolum') return;
    this._kareler.push(gercekDt);
    if (this._kareler.length < 120) return;
    const ort = this._kareler.reduce((a, b) => a + b, 0) / this._kareler.length;
    this._kareler.length = 0;
    if (this._kaliteBekle-- > 0) return;
    const i = SIRA.indexOf(this.kalite.ad);
    if (ort > 0.028 && i > 0) {
      Object.assign(this.kalite, KALITELER[SIRA[i - 1]]);
      this.post.bloom.resolution.set(innerWidth * this.kalite.bloomOlcek, innerHeight * this.kalite.bloomOlcek);
      this.boyutla();
      this.bolum?.kaliteDegisti?.(this.kalite);
      this._kaliteBekle = 2;
    }
  }

  _dongu(simdi) {
    this._raf = requestAnimationFrame(this._dongu);
    const gercekDt = Math.max(0, Math.min(0.1, (simdi - this._son) / 1000));
    this._son = simdi;
    if (this._testDurdur) return;
    this._kaliteDenetle(gercekDt);
    const dt = Math.min(gercekDt, 1 / 20) * this.hiz * (this.defterAcik ? 0.15 : 1);
    this._adim(dt);
    this._ciz(dt);
  }

  // mantık adımı (çizimsiz)
  _adim(dt) {
    this.zamanOlcek += (this.zamanHedef - this.zamanOlcek) * (1 - Math.exp(-dt * 1.5));
    const sdt = dt * this.zamanOlcek;
    this.zaman += sdt;
    this.girdi.guncelle(dt);
    this.atmo.guncelle(sdt, this.zaman);
    if (this.bolum) this.bolum._guncelle(sdt);
    this.rig.guncelle(sdt, this.girdi.etkin, this.oran);
    this.renderer.toneMappingExposure += (this.atmo.d.pozlama * (this.bolum?.pozlama ?? 1) - this.renderer.toneMappingExposure) * (1 - Math.exp(-dt * 2));
    const u = this.post.u;
    if (!this._gecisSurer) u.uKarart.value += (this.karartHedef - u.uKarart.value) * (1 - Math.exp(-dt * 1.6));
    u.uFlas.value *= Math.exp(-dt * 3.5);
    if (this.hareketAzalt) u.uHiz.value = 0;
    this.ses.guncelle(dt);
  }

  _ciz(dt) {
    this.ui.etiketleriGuncelle(this.kamera, dt);
    const b = this.bolum;
    const imlecGoster = !!(b && b.imlecGoster && this.durum === 'bolum');
    this.ui.imlec(this.girdi.etkin.x, this.girdi.etkin.y, imlecGoster, this.girdi.w > 0.5);
    this.renderer.info.reset();
    this.post.ciz(this.zaman);
  }

  _testKancalari() {
    const oyun = this;
    window.__oyun = {
      oyun,
      get durum() {
        const b = oyun.bolum;
        return { durum: oyun.durum, kapi: !!oyun._kapiGec, bolum: b?.no, evre: b?.evre, et: b ? +b.et.toFixed(2) : 0, t: b ? +b.t.toFixed(2) : 0, kalite: oyun.kalite.ad, yardim: +oyun.girdi.w.toFixed(2), ...(b?.testDurum?.() || {}) };
      },
      info() {
        const r = oyun.renderer.info;
        return { cizim: r.render.calls, ucgen: r.render.triangles, nokta: r.render.points, cizgi: r.render.lines, geometri: r.memory.geometries, doku: r.memory.textures, program: r.programs?.length };
      },
      git(no) { oyun.ui.acilisGizle(); oyun._uiOyun(); oyun.bolumeGit(no); },
      imlec(x, y) { oyun.girdi.gercek.set(x, y); oyun.girdi.sonHareket = oyun.girdi.zaman; },
      programli(v) { oyun.girdi.programli = v; },
      devam() { document.getElementById('kart-devam').click(); },
      atla() { if (oyun._kapiGec) { oyun._kapiT = 0; oyun.kapiGec(); } else oyun.bolum?.atla(); },
      kapiGec() { oyun._kapiT = 0; return oyun.kapiGec(); },
      set hiz(v) { oyun.hiz = v; },
      // test: döngüyü durdurup simülasyonu sabit adımlarla ilerlet, sonra tek kare çiz
      durdur(v = true) { oyun._testDurdur = v; },
      ilerle(saniye, adim = 1 / 30, ciz = true) {
        oyun._testDurdur = true;
        const n = Math.round(saniye / adim);
        for (let i = 0; i < n; i++) oyun._adim(adim);
        if (ciz) oyun._ciz(adim);
        return window.__oyun.durum;
      },
      ciz() { oyun._ciz(1 / 60); },
      get hiz() { return oyun.hiz; },
    };
  }
}

if (!webglVar()) {
  document.getElementById('yukleme').classList.add('gizli');
  document.getElementById('yedek').classList.remove('gizli');
} else {
  try {
    const oyun = new Oyun();
    oyun.basla();
  } catch (e) {
    console.error(e);
    document.getElementById('yukleme').classList.add('gizli');
    document.getElementById('yedek').classList.remove('gizli');
  }
}
