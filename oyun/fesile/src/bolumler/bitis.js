// Bitiş: gece bahçesi. İmleç rüzgârdır. "Baştan oyna", "Defter".
import * as THREE from 'three';
import { Bolum, yaklas, rastgele } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Zerreler } from '../fx/parcacik.js';
import { YENI_HILAL_YASI } from '../icerik.js';

export class Bitis extends Bolum {
  kur() {
    this.gokKur({ ayar: 'gece', ay: { yas: YENI_HILAL_YASI + 1.2, boyut: 3, az: 195, yuk: 12, egim: 0.5, parlak: 2.4 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 16] });
    this.sahne.add(this.zemin.grup);
    const r = rastgele(77);
    const a = [];
    for (let i = 0; i < 26; i++) {
      const t = i * 2.39996, R = 3 + Math.sqrt(i) * 4.2;
      const x = Math.cos(t) * R, z = Math.sin(t) * R - 8;
      if (Math.abs(x) < 3.2 && z > -14) continue; // kameranın önünü kapatmasın
      a.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.1, boy: 5.5 + r() * 3.5, egilme: (r() - 0.5) * 0.12, yaw: r() * 6, yaprak: 20 });
    }
    this.bahce = new Hurma(this.atmo, a, { yaprakCift: 26 });
    this.bahce.u.uParlak.value = 0.8;
    this.sahne.add(this.bahce.grup);
    this.zerre = new Zerreler(Math.round(600 * this.oyun.kalite.parcacik + 100), { boyut: new THREE.Vector3(40, 10, 30), renk: '#ffe2a8', parlak: 0.9, nokta: 1.8 });
    this.zerre.nesne.position.set(0, 4, -6);
    this.sahne.add(this.zerre.nesne);
    this.rig.fov = 44;
    this.rig.paralaks = 1.0;
    this.rig.ucus([new THREE.Vector3(2, 9, 30), new THREE.Vector3(1, 4, 22), new THREE.Vector3(0, 3, 18)],
      [new THREE.Vector3(0, 5, -8), new THREE.Vector3(-1, 5.5, -10)], 6);
    this.duzlem = new THREE.Plane(new THREE.Vector3(0, 0, 1), 6);
    this.imlecGoster = true;
    this.ruzgarNok = new THREE.Vector3(0, -50, 0);
    this.onceki = new THREE.Vector3();
    this.guc = 0;
    this.ses.hedef.ruzgar = 0.25;
    const b = document.getElementById('bitis');
    b.classList.remove('gizli');
    if (this.ui.dokunmatik) b.querySelector('.bitis-yazi').textContent = 'Gece bahçesi. Parmağını gezdir; rüzgâr sensin.';
    const bastan = document.getElementById('bastan');
    bastan.onclick = () => { b.classList.add('gizli'); this.oyun.bolumeGit(1); };
    setTimeout(() => bastan.focus({ preventScroll: true }), 800);
    this.temizlikEkle(() => b.classList.add('gizli'));
    this._v = new THREE.Vector3();
  }
  guncelle(dt) {
    this.zerre.guncelle(dt, this.t);
    const g = this.girdi;
    const h = g.duzlem(this.kamera, this.duzlem, this._v);
    if (h) {
      const hiz = h.distanceTo(this.onceki) / Math.max(dt, 1e-3);
      this.onceki.copy(h);
      this.guc = yaklas(this.guc, Math.min(3, hiz * 0.25), 3, dt);
      this.ruzgarNok.lerp(h, 1 - Math.exp(-dt * 6));
    }
    this.bahce.u.uImlecRuzgar.value.set(this.ruzgarNok.x, this.ruzgarNok.y, this.ruzgarNok.z, this.guc);
    this.bahce.u.uRuzgar.value.set(0.15 + this.guc * 0.08, 0, 0.05);
    this.zerre.u.uAkis.value.x += dt * this.guc * 2;
    this.ses.hedef.ruzgar = 0.2 + this.guc * 0.15;
  }
}
