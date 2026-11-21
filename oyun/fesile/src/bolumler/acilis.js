// Açılış (hero): alacakaranlık, yavaşça dönen kahraman hurma, ince yeni hilal.
import * as THREE from 'three';
import { Bolum } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { BOLUMLER } from '../icerik.js';

export class Acilis extends Bolum {
  kur() {
    this.gokKur({ ayar: 'alacakaranlik', ay: { yas: BOLUMLER[0].ay - 0.6, boyut: 2.5, az: 157, yuk: 15, egim: -0.45 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 7] });
    this.sahne.add(this.zemin.grup);
    const y = this.zemin.yukseklik(0, 0);
    this.hurma = new Hurma(this.atmo, [{ x: 0, z: 0, y, boy: 8.5, egilme: 0.06, yaw: 0.4, yaprak: 28 }]);
    this.sahne.add(this.hurma.grup);
    // uzakta birkaç ağaç
    const uzak = [];
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + i * 0.42, r = 46 + (i % 3) * 14;
      const x = Math.sin(a) * r - 10, z = -Math.cos(a) * r - 20;
      uzak.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.3, boy: 7 + (i % 3) * 1.5, yaw: i * 2.1, yaprak: 18, egilme: 0.04 + (i % 2) * 0.05 });
    }
    this.uzak = new Hurma(this.atmo, uzak, { yaprakCift: 22 });
    this.sahne.add(this.uzak.grup);
    this.rig.fov = 34;
    this.rig.paralaks = 1.2;
    this.aci = 0.3;
    this.y = y;
    this.rig.ucus(
      [new THREE.Vector3(-2, 3, 34), new THREE.Vector3(-6, 3.2, 24), new THREE.Vector3(-8, 3.4, 19)],
      [new THREE.Vector3(0, 9, 0), new THREE.Vector3(1.5, 6.2, 0)], 6,
    );
    this.imlecGoster = false;
  }
  guncelle(dt) {
    this.hurma.u.uRuzgar.value.set(0.25 + 0.1 * Math.sin(this.t * 0.4), 0, 0.12);
    this.uzak.u.uRuzgar.value.copy(this.hurma.u.uRuzgar.value);
    if (!this.rig.ucusu) {
      this.aci += dt * 0.035;
      const r = 20.5;
      this.rig.poz.set(Math.sin(-0.4 + this.aci) * r * -1, 3.4 + this.y, Math.cos(-0.4 + this.aci) * r);
      this.rig.bak.set(1.5, 6.2 + this.y, 0);
    }
  }
}
