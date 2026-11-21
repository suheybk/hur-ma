// Kamera düzeneği: hedef konum/bakış, imleç paralaksı, sarsıntı, FOV vuruşu,
// spline uçuşları. Kamera hiçbir zaman tam durmaz (nefes).
import * as THREE from 'three';

export const yumusak = {
  icDis: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  dis: (t) => 1 - Math.pow(1 - t, 3),
  ic: (t) => t * t * t,
  disUs: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  icDisSin: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};

export class KameraRig {
  constructor(kamera) {
    this.k = kamera;
    this.poz = new THREE.Vector3(0, 2, 10);
    this.bak = new THREE.Vector3(0, 2, 0);
    this.fov = 40;
    this.paralaks = 0.6;     // dünya birimi
    this.paralaksAci = 0.0; // bakışı da hafif kaydır
    this.nefes = 1;
    this.travma = 0;
    this.fovVurus = 0;
    this.yuvarla = 0;        // roll (radyan)
    this.ucusu = null;
    this.hareketAzalt = false;
    this._p = new THREE.Vector2();
    this._sP = new THREE.Vector3(); this._sB = new THREE.Vector3();
    this._sag = new THREE.Vector3(); this._ust = new THREE.Vector3();
    this.zaman = 0;
  }
  sars(m) { if (!this.hareketAzalt) this.travma = Math.min(1, this.travma + m); }
  vur(f) { if (!this.hareketAzalt) this.fovVurus += f; }
  // noktalar: [Vector3], bakislar: [Vector3]; sure saniye
  ucus(noktalar, bakislar, sure, { yumusat = yumusak.icDis, fovlar = null, bitince = null } = {}) {
    this.ucusu = {
      yol: new THREE.CatmullRomCurve3(noktalar, false, 'centripetal'),
      bak: bakislar.length > 1 ? new THREE.CatmullRomCurve3(bakislar, false, 'centripetal') : null,
      bak0: bakislar[0], sure, t: 0, yumusat, fovlar, bitince,
    };
    this.ucusu.yol.getPoint(0, this.poz);
    if (this.ucusu.bak) this.ucusu.bak.getPoint(0, this.bak); else this.bak.copy(bakislar[0]);
  }
  ucusIlerleme() { return this.ucusu ? this.ucusu.t / this.ucusu.sure : 1; }
  guncelle(dt, imlec, oran) {
    this.zaman += dt;
    const u = this.ucusu;
    if (u) {
      u.t = Math.min(u.sure, u.t + dt);
      const x = Math.min(1, Math.max(0, u.yumusat(Math.max(0, u.t) / u.sure)));
      u.yol.getPoint(x, this.poz);
      if (u.bak) u.bak.getPoint(x, this.bak);
      if (u.fovlar) this.fov = THREE.MathUtils.lerp(u.fovlar[0], u.fovlar[1], x);
      if (u.t >= u.sure) { this.ucusu = null; u.bitince && u.bitince(); }
    }
    // paralaks: yumuşatılmış imleç
    const yum = 1 - Math.exp(-dt * 3.5);
    this._p.x += (imlec.x - this._p.x) * yum;
    this._p.y += (imlec.y - this._p.y) * yum;
    const ileri = this._sB.copy(this.bak).sub(this.poz).normalize();
    this._sag.crossVectors(ileri, THREE.Object3D.DEFAULT_UP).normalize();
    this._ust.crossVectors(this._sag, ileri).normalize();
    const nf = this.nefes * (this.hareketAzalt ? 0.3 : 1);
    const t = this.zaman;
    const p = this._sP.copy(this.poz)
      .addScaledVector(this._sag, this._p.x * this.paralaks + Math.sin(t * 0.37) * 0.06 * nf)
      .addScaledVector(this._ust, this._p.y * this.paralaks * 0.6 + Math.sin(t * 0.51 + 1) * 0.04 * nf);
    this.k.position.copy(p);
    const b = this._sB.copy(this.bak)
      .addScaledVector(this._sag, this._p.x * this.paralaksAci)
      .addScaledVector(this._ust, this._p.y * this.paralaksAci * 0.6);
    this.k.up.set(0, 1, 0);
    this.k.lookAt(b);
    // sarsıntı (travma²)
    this.travma = Math.max(0, this.travma - dt * 1.4);
    const s = this.travma * this.travma;
    if (s > 0) {
      const n = (a, f) => Math.sin(t * f + a) * 0.6 + Math.sin(t * f * 2.3 + a * 3) * 0.4;
      this.k.rotateX(n(1, 37) * 0.05 * s);
      this.k.rotateY(n(2, 41) * 0.05 * s);
      this.k.rotateZ(n(3, 29) * 0.07 * s);
    }
    if (this.yuvarla) this.k.rotateZ(this.yuvarla);
    // FOV: dikey ekranda yatay açıyı koru (kısmen)
    this.fovVurus *= Math.exp(-dt * 3);
    let f = this.fov + this.fovVurus;
    const hedefOran = 1.6;
    if (oran < hedefOran) {
      const yatay = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(f) / 2) * hedefOran);
      const gerek = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(yatay / 2) / oran));
      f = THREE.MathUtils.lerp(f, gerek, 0.62);
    }
    if (Math.abs(this.k.fov - f) > 0.01 || this.k.aspect !== oran) {
      this.k.fov = Math.min(f, 110); this.k.aspect = oran; this.k.updateProjectionMatrix();
    }
  }
}
