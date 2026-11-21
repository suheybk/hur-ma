// Günün saati: paylaşılan ışık/sis/gök uniform'ları ve hazır ayarlar.
import * as THREE from 'three';

const c = (h) => new THREE.Color(h);
const yon = (az, yuk) => {
  // az: derece (0 = +z, 90 = +x), yuk: ufuktan yükseklik (derece)
  const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(yuk);
  return new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).normalize();
};

export const AYARLAR = {
  alacakaranlik: {
    tepe: c('#070b22'), orta: c('#2a2550'), ufuk: c('#e07a45'), yer: c('#1a1216'),
    gunesYon: yon(172, -4), gunesRenk: c('#ff8a4a'), gunesDisk: 0,
    isikYon: yon(160, 14), isikRenk: c('#ff9a5c').multiplyScalar(1.5),
    kenarYon: yon(-40, 25), kenarRenk: c('#8aa0ff').multiplyScalar(0.7),
    gokRenk: c('#2c3060'), yerRenk: c('#3a2418'),
    sisRenk: c('#3e2a3e'), sisGunes: c('#ff7a3a').multiplyScalar(0.8), sisYog: 0.006,
    yildiz: 0.55, pozlama: 1.0,
  },
  yeralti: {
    tepe: c('#120a06'), orta: c('#120a06'), ufuk: c('#1c120b'), yer: c('#0a0604'),
    gunesYon: yon(0, -90), gunesRenk: c('#000000'), gunesDisk: 0,
    isikYon: yon(30, 70), isikRenk: c('#ffb070').multiplyScalar(0.55),
    kenarYon: yon(-120, -20), kenarRenk: c('#ff9a50').multiplyScalar(0.7),
    gokRenk: c('#3a2418'), yerRenk: c('#120a06'),
    sisRenk: c('#0d0805'), sisGunes: c('#000000'), sisYog: 0.06,
    yildiz: 0, pozlama: 1.15,
  },
  firtina: {
    tepe: c('#8a6a48'), orta: c('#c19463'), ufuk: c('#e0b27a'), yer: c('#8a6440'),
    gunesYon: yon(20, 70), gunesRenk: c('#fff2d0'), gunesDisk: 0,
    isikYon: yon(30, 62), isikRenk: c('#ffe7c0').multiplyScalar(1.6),
    kenarYon: yon(-150, 20), kenarRenk: c('#ffd29a').multiplyScalar(0.6),
    gokRenk: c('#c69a68'), yerRenk: c('#7a5634'),
    sisRenk: c('#b08050'), sisGunes: c('#ffe0a8').multiplyScalar(0.3), sisYog: 0.03,
    yildiz: 0, pozlama: 0.8,
  },
  altin: {
    tepe: c('#1d3a66'), orta: c('#6a6a8a'), ufuk: c('#ffad5e'), yer: c('#5a3a24'),
    gunesYon: yon(203, 4), gunesRenk: c('#ffb060'), gunesDisk: 1,
    isikYon: yon(210, 10), isikRenk: c('#ffbe72').multiplyScalar(1.6),
    kenarYon: yon(205, 10), kenarRenk: c('#ffc27a').multiplyScalar(1.0),
    gokRenk: c('#3c4a78'), yerRenk: c('#4a2c18'),
    sisRenk: c('#a0684a'), sisGunes: c('#ffa050').multiplyScalar(0.9), sisYog: 0.0045,
    yildiz: 0, pozlama: 0.82,
  },
  dolunay: {
    tepe: c('#03081a'), orta: c('#0b1634'), ufuk: c('#25345a'), yer: c('#07090f'),
    gunesYon: yon(90, -30), gunesRenk: c('#000000'), gunesDisk: 0,
    isikYon: yon(100, 28), isikRenk: c('#a9bcff').multiplyScalar(0.85),
    kenarYon: yon(100, 30), kenarRenk: c('#b8c8ff').multiplyScalar(1.0),
    gokRenk: c('#1a2850'), yerRenk: c('#120f14'),
    sisRenk: c('#0e1830'), sisGunes: c('#3a4a7a').multiplyScalar(0.5), sisYog: 0.008,
    yildiz: 0.7, pozlama: 1.1,
  },
  sabah: {
    tepe: c('#3f78b8'), orta: c('#8fb2d4'), ufuk: c('#f4dcb0'), yer: c('#8a6a48'),
    gunesYon: yon(80, 18), gunesRenk: c('#fff0c8'), gunesDisk: 0.6,
    isikYon: yon(80, 24), isikRenk: c('#fff0d2').multiplyScalar(1.9),
    kenarYon: yon(80, 20), kenarRenk: c('#ffe6b0').multiplyScalar(0.9),
    gokRenk: c('#5f7ea8'), yerRenk: c('#6a4a30'),
    sisRenk: c('#c8b49a'), sisGunes: c('#fff0c8').multiplyScalar(0.4), sisYog: 0.0045,
    yildiz: 0, pozlama: 0.78,
  },
  gece: {
    tepe: c('#010309'), orta: c('#040816'), ufuk: c('#0c1430'), yer: c('#020306'),
    gunesYon: yon(100, -40), gunesRenk: c('#000000'), gunesDisk: 0,
    isikYon: yon(110, 30), isikRenk: c('#5866a0').multiplyScalar(0.55),
    kenarYon: yon(100, 20), kenarRenk: c('#7f90d0').multiplyScalar(0.8),
    gokRenk: c('#0d1430'), yerRenk: c('#050508'),
    sisRenk: c('#060a18'), sisGunes: c('#101830'), sisYog: 0.007,
    yildiz: 1.0, pozlama: 1.1,
  },
  safak: { // B7 sonu: yeni hilal akşamı (batıda alaca)
    tepe: c('#040820'), orta: c('#18214a'), ufuk: c('#b0583a'), yer: c('#0b0808'),
    gunesYon: yon(192, -7), gunesRenk: c('#ff7040'), gunesDisk: 0,
    isikYon: yon(190, 9), isikRenk: c('#ff8a5a').multiplyScalar(0.7),
    kenarYon: yon(192, 12), kenarRenk: c('#ff9a70').multiplyScalar(0.9),
    gokRenk: c('#1c2350'), yerRenk: c('#1a1010'),
    sisRenk: c('#2a1c30'), sisGunes: c('#ff6a30').multiplyScalar(0.7), sisYog: 0.006,
    yildiz: 0.8, pozlama: 1.0,
  },
};

const RENKLER = ['tepe', 'orta', 'ufuk', 'yer', 'gunesRenk', 'isikRenk', 'kenarRenk', 'gokRenk', 'yerRenk', 'sisRenk', 'sisGunes'];
const YONLER = ['gunesYon', 'isikYon', 'kenarYon'];
const SAYILAR = ['gunesDisk', 'sisYog', 'yildiz', 'pozlama'];

export class Atmosfer {
  constructor() {
    this.d = {};
    for (const k of RENKLER) this.d[k] = new THREE.Color();
    for (const k of YONLER) this.d[k] = new THREE.Vector3(0, 1, 0);
    for (const k of SAYILAR) this.d[k] = 0;
    // malzemelerin doğrudan bağlandığı uniform nesneleri
    this.u = {
      uIsikYon: { value: this.d.isikYon }, uIsikRenk: { value: this.d.isikRenk },
      uKenarYon: { value: this.d.kenarYon }, uKenarRenk: { value: this.d.kenarRenk },
      uGokRenk: { value: this.d.gokRenk }, uYerRenk: { value: this.d.yerRenk },
      uSisRenk: { value: this.d.sisRenk }, uSisGunes: { value: this.d.sisGunes },
      uSisYog: { value: 0 }, uZaman: { value: 0 },
    };
    this.kaynak = null; this.hedef = null; this.gT = 1; this.gSure = 1;
    this.ayarla('alacakaranlik');
  }
  ayarla(ad) {
    const a = AYARLAR[ad];
    this._uygula(a, a, 1);
    this.kaynak = this.hedef = a; this.gT = this.gSure = 1;
  }
  // önceki ayardan yeni ayara 'sure' saniyede geçiş
  gecis(ad, sure = 3) {
    const simdi = this.anlik();
    this.kaynak = simdi; this.hedef = AYARLAR[ad]; this.gT = 0; this.gSure = sure;
  }
  anlik() {
    const o = {};
    for (const k of RENKLER) o[k] = this.d[k].clone();
    for (const k of YONLER) o[k] = this.d[k].clone();
    for (const k of SAYILAR) o[k] = this.d[k];
    return o;
  }
  _uygula(a, b, t) {
    for (const k of RENKLER) this.d[k].copy(a[k]).lerp(b[k], t);
    for (const k of YONLER) this.d[k].copy(a[k]).lerp(b[k], t).normalize();
    for (const k of SAYILAR) this.d[k] = a[k] + (b[k] - a[k]) * t;
    this.u.uSisYog.value = this.d.sisYog;
  }
  guncelle(dt, zaman) {
    this.u.uZaman.value = zaman;
    if (this.gT < this.gSure) {
      this.gT = Math.min(this.gSure, this.gT + dt);
      const x = this.gT / this.gSure;
      this._uygula(this.kaynak, this.hedef, x * x * (3 - 2 * x));
    }
  }
}
