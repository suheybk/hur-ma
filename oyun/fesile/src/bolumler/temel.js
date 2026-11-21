// Bölümlerin ortak iskeleti.
import * as THREE from 'three';
import { Gok, Yildizlar, Ay } from '../dunya/gok.js';

export class Bolum {
  constructor(oyun, bilgi = {}) {
    this.oyun = oyun;
    this.bilgi = bilgi;
    this.sahne = new THREE.Scene();
    this.t = 0;          // bölüm zamanı
    this.evre = '';
    this.et = 0;         // evre zamanı
    this.bitti = false;
    this._temizlik = [];
  }
  get rig() { return this.oyun.rig; }
  get kamera() { return this.oyun.kamera; }
  get girdi() { return this.oyun.girdi; }
  get ui() { return this.oyun.ui; }
  get atmo() { return this.oyun.atmo; }
  get fx() { return this.oyun.post.u; }
  get ses() { return this.oyun.ses; }

  // Okuma kapısı: bu evrelerde yazı okunur. Süre dolunca evre kendiliğinden geçmez;
  // oyuncu tıklayınca / aşağı kaydırınca geçer (bkz. Oyun.kapiAc).
  get okumaEvreleri() { return ['tanitim']; }

  evreye(e) {
    if (this.okumaEvreleri.includes(this.evre) && !this._kapiGecti) {
      this._kapiHedef = e;
      if (!this._kapiAcik) {
        this._kapiAcik = true;
        this.oyun.kapiAc(() => {
          this._kapiAcik = false;
          this._kapiGecti = true;
          this.evreye(this._kapiHedef);
        });
      }
      return;
    }
    this._kapiGecti = false;
    this.evre = e; this.et = 0; this.evreBasladi?.(e);
  }

  // gök + yıldız + ay
  gokKur({ ayar, ay = null, yildiz = true } = {}) {
    this.atmo.ayarla(ayar);
    this.gok = new Gok(this.atmo);
    this.sahne.add(this.gok.grup);
    if (yildiz) {
      this.yildizlar = new Yildizlar(this.atmo, Math.round(2600 * this.oyun.kalite.parcacik + 600));
      this.sahne.add(this.yildizlar.nokta);
    }
    if (ay) {
      this.ay = new Ay(ay);
      this.sahne.add(this.ay.mesh);
    }
  }
  gokGuncelle() {
    this.gok?.guncelle(this.kamera);
    this.yildizlar?.guncelle(this.kamera);
    this.ay?.guncelle(this.kamera);
  }
  temizlikEkle(f) { this._temizlik.push(f); }

  _guncelle(dt) {
    this.t += dt; this.et += dt;
    this.guncelle(dt);
    this.gokGuncelle();
  }
  // tamamlandı: oyun durulmayı ve kartı yönetir
  bitir() {
    if (this.bitti) return;
    this.bitti = true;
    this.oyun.bolumBitti(this);
  }
  // test kancası: bulunulan evreyi atla
  atla() {}

  yokEt() {
    for (const f of this._temizlik) f();
    this.sahne.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    this.ui.etiketlerTemizle();
    this.ui.ipucu(null);
    this.ui.ilerleme(null);
  }
}

// küçük yardımcılar
export const sat = (x) => Math.min(1, Math.max(0, x));
export const ss = (a, b, x) => { const t = sat((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const karis = (a, b, t) => a + (b - a) * t;
export const yaklas = (a, b, hiz, dt) => a + (b - a) * (1 - Math.exp(-hiz * dt));
export function rastgele(tohum = 1) {
  let s = tohum >>> 0 || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}
