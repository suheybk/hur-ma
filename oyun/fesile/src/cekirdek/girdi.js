// Tek girdi: imleç konumu (dokunmatikte sürükleme).
// "Etkin imleç": oyuncu hareketsiz kalınca bölümün verdiği hedefe doğru
// yavaşça kayar (yardımcı mıknatıs); böylece her sahne kendi kendine tamamlanır.
import * as THREE from 'three';

export class Girdi {
  constructor(eleman) {
    this.gercek = new THREE.Vector2(0, 0);   // NDC (-1..1, y yukarı)
    this.etkin = new THREE.Vector2(0, 0);
    this.oto = new THREE.Vector2(0, 0);      // yardımcının imleci
    this.otoHedef = null;                    // bölüm verir (NDC) ya da null
    this.otoHiz = 1.1;                       // NDC/sn
    this.w = 0;                              // 0 = oyuncu, 1 = yardımcı
    this.bekleme = 2.6;                      // sn hareketsizlikten sonra yardım
    this.minYardim = 0;                      // bölüm uzadıkça oyuncu hareket etse de artan yardım
    this.enAzBekleme = 20;                   // oyuncu kontrolde kalsın: yardım ancak 20 sn tam hareketsizlikte
    this.sonHareket = 0;
    this.zaman = 0;
    this.hiz = new THREE.Vector2();          // etkin imleç hızı (NDC/sn)
    this.hizBuyukluk = 0;
    this._onceki = new THREE.Vector2();
    this.dokunmatik = false;
    this.basili = false;
    this.programli = false;
    this._ray = new THREE.Raycaster();
    const tasi = (x, y) => {
      this.gercek.set((x / innerWidth) * 2 - 1, -(y / innerHeight) * 2 + 1);
      this.sonHareket = this.zaman;
    };
    eleman.addEventListener('pointermove', (e) => {
      if (this.programli) return;
      if (e.pointerType === 'touch') { this.dokunmatik = true; }
      tasi(e.clientX, e.clientY);
    }, { passive: true });
    eleman.addEventListener('pointerdown', (e) => {
      if (this.programli) return;
      if (e.pointerType === 'touch') this.dokunmatik = true;
      this.basili = true; tasi(e.clientX, e.clientY);
    }, { passive: true });
    addEventListener('pointerup', () => { this.basili = false; }, { passive: true });
    this.tasi = tasi;
  }
  get bosta() { return this.zaman - this.sonHareket; }
  guncelle(dt) {
    this.zaman += dt;
    // Oyuncu hareket ederken yardım hiç karışmaz (minYardim yok sayılır);
    // yalnızca uzun süre hiç dokunulmazsa sahne takılmasın diye devreye girer.
    const tam = this.otoHedef && this.bosta > Math.max(this.bekleme, this.enAzBekleme);
    const yardim = tam;
    const hedefW = tam ? 1 : 0;
    if (yardim) {
      if (this.w === 0) this.oto.copy(this.etkin);
      const d = this._onceki.copy(this.otoHedef).sub(this.oto);
      const L = d.length(), adim = this.otoHiz * dt;
      if (L > adim) d.multiplyScalar(adim / L);
      // yumuşak yaklaşım
      this.oto.addScaledVector(d, Math.min(1, 0.35 + L * 2));
      this.w = this.w < hedefW ? Math.min(hedefW, this.w + dt * 1.5) : Math.max(hedefW, this.w - dt * 5);
    } else {
      this.w = Math.max(0, this.w - dt * 5);
      if (this.w > 0) this.oto.lerp(this.gercek, 1 - Math.exp(-dt * 8));
    }
    const yeni = this._onceki.copy(this.gercek).lerp(this.oto, this.w);
    if (dt > 0) {
      this.hiz.set((yeni.x - this.etkin.x) / dt, (yeni.y - this.etkin.y) / dt);
      this.hizBuyukluk += (this.hiz.length() - this.hizBuyukluk) * (1 - Math.exp(-dt * 12));
    }
    this.etkin.copy(yeni);
  }
  // etkin imlecin dünya ışını
  isin(kamera) {
    this._ray.setFromCamera(this.etkin, kamera);
    return this._ray.ray;
  }
  // y = sabit düzlemle kesişim
  duzlem(kamera, duzlem, hedef = new THREE.Vector3()) {
    const r = this.isin(kamera);
    return r.intersectPlane(duzlem, hedef);
  }
}

// bir dünya noktasını NDC'ye çevir
const _v = new THREE.Vector3();
export function ndc(nokta, kamera, hedef = new THREE.Vector2()) {
  _v.copy(nokta).project(kamera);
  return hedef.set(_v.x, _v.y);
}
