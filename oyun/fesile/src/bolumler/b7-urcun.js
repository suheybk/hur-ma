// 07 · Urcûn — "Dönüş"
// Tanıtım: hasattan kalan boş salkım sapı (urcûn), altın sarısı, yay gibi. Satır yok.
// Aksiyon: sap kurur, incelir, ucu kıvrılır. Oyuncu onu göğe kaldırır; soluk izin
// yerine oturunca aynı yay fonksiyonuyla incelmiş son hilale dönüşür.
// Sonra Yâsîn 36:39 sakin bir satır olarak belirir; hilal kaybolur; ufukta yeni
// ayın ince hilali doğar, yerde yavru fidanın yeni yaprağı açılır.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Urcun, SAP, KURU } from '../dunya/urcun.js';
import { Ay, evreAcisi } from '../dunya/gok.js';
import { Zerreler } from '../fx/parcacik.js';
import { IPUCLARI, B7_SAKIN_SATIR, YENI_HILAL_YASI } from '../icerik.js';
import { yumusak } from '../cekirdek/kamera.js';

const R_SAP = 0.8;
const R_HILAL = 1.35;
const DUZLEM_Z = 4.5;
const YER_KAMERA = new THREE.Vector3(0.6, 2.2, 21);

export class B7Urcun extends Bolum {
  kur() {
    this.gokKur({ ayar: 'gece' });
    this.yildizlar.u.uOlcek.value = 1.15;
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 8] });
    this.sahne.add(this.zemin.grup);
    const y0 = this.zemin.yukseklik(0, 0);
    this.agac = new Hurma(this.atmo, [{ x: 0, z: 0, y: y0, boy: 9, egilme: 0.05, yaw: 0.9, yaprak: 26 }]);
    this.agac.u.uParlak.value = 0.35;
    this.sahne.add(this.agac.grup);
    this.tepe = this.agac.tepe(0);
    // ufukta birkaç ağaç
    const uzak = [];
    for (let i = 0; i < 8; i++) {
      const x = -60 + i * 17 + Math.sin(i * 3) * 6, z = -55 - (i % 3) * 15;
      uzak.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.2, boy: 7 + (i % 3) * 1.4, yaw: i, yaprak: 16, egilme: 0.05 });
    }
    this.uzak = new Hurma(this.atmo, uzak, { yaprakCift: 20 });
    this.sahne.add(this.uzak.grup);

    // yavru fidan (son sahnede yeni yaprak)
    const fx = -3.1, fz = 15.2;
    this.fidan = new Hurma(this.atmo, [{ x: fx, z: fz, y: this.zemin.yukseklik(fx, fz) - 0.05, boy: 0.3, yaricap: 0.07, egilme: 0, yaw: 0.3, yaprak: 8, yaprakOlcek: 6 }], { yaprakCift: 18, govdeY: 10, govdeR: 8 });
    this.fidan.u.uYesil.value.set('#3b6a26'); this.fidan.u.uYesil2.value.set('#7aa840');
    this._yeniYaprak(0);
    this.fidan.govde.visible = false;
    this.sahne.add(this.fidan.grup);

    // ---- urcûn ve hilalin izi ----
    // Hilal: küçülen ay (yaş ~26.8) → k = cos(evre açısı)
    this.k = Math.cos(evreAcisi(this.bilgi.ay));
    this.sap = new Urcun(this.atmo, { R: R_SAP, k: this.k });
    this.sap.ayarla({ ...SAP, m: 0 });
    this.sahne.add(this.sap.grup);
    this.iz = new Urcun(this.atmo, { R: R_HILAL, k: this.k, iz: true });
    this.iz.ayarla({ m: 1, parlak: 0.55, gorunur: 0 });
    this.iz.mat.blending = THREE.AdditiveBlending; this.iz.mat.depthWrite = false;
    this.sahne.add(this.iz.grup);

    this.sapBas = this.tepe.clone().add(new THREE.Vector3(2.2, -2.2, 5.2));
    this.sap.grup.position.copy(this.sapBas);
    this.sap.grup.rotation.set(0.15, 0.2, 2.5);
    this.SLOT = new THREE.Vector3(-5.2, 17.5, DUZLEM_Z);
    this.iz.grup.position.copy(this.SLOT);
    this.slotQ = new THREE.Quaternion();
    {
      const m = new THREE.Matrix4().lookAt(YER_KAMERA, this.SLOT, new THREE.Vector3(0, 1, 0));
      this.slotQ.setFromRotationMatrix(m);
      // kameraya bakan düzlem; ışıklı kenar alt-sola eğik (şafak öncesi doğuda)
      // yerel -x (ışıklı kenar) ekranda sola düşer; hafifçe alt-sola eğilir
      this.slotQ.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.42));
    }
    this.iz.grup.quaternion.copy(this.slotQ);
    this.hiz = new THREE.Vector3();
    this.kuruToz = new Zerreler(160, { boyut: new THREE.Vector3(2.5, 3, 2.5), renk: '#e8c98a', parlak: 0.8, nokta: 1.2, hiz: 0.6 });
    this.kuruToz.u.uAlfa.value = 0;
    this.sahne.add(this.kuruToz.nesne);

    // yeni hilal (ufukta, akşam)
    this.yeniAy = new Ay({ yas: YENI_HILAL_YASI, boyut: 3.0, az: 194, yuk: 9, egim: 0.55, parlak: 2.4 });
    this.yeniAy.u.uGorunur.value = 0;
    this.sahne.add(this.yeniAy.mesh);

    // ürün çekimi
    const P = this.sapBas;
    this.rig.fov = 30;
    this.rig.paralaks = 0.2;
    this.rig.ucus([P.clone().add(new THREE.Vector3(3, -0.5, 9)), P.clone().add(new THREE.Vector3(1.9, -1.1, 5.6)), P.clone().add(new THREE.Vector3(1.4, -1.5, 3.8))],
      [P.clone().add(new THREE.Vector3(-1, 0.5, -2)), P.clone().add(new THREE.Vector3(-0.7, 0.35, 0))], 5, { yumusat: yumusak.dis });
    this.imlecGoster = false;
    this.pozlama = 1;
    this.ses.hedef.ruzgar = 0.08;
    this.evreye('tanitim');
    this.ui.baslik(7, this.bilgi.ad, this.bilgi.alt, '');
    this._v = new THREE.Vector3(); this._q = new THREE.Quaternion();
    this.duzlem = new THREE.Plane(new THREE.Vector3(0, 0, 1), -DUZLEM_Z);
    this.ilerlemeT = 0;
  }

  _yeniYaprak(a) {
    const d = this.fidan.yaprakDurum;
    d.array[0 * 4 + 2] = a; // en genç yaprak
    d.needsUpdate = true;
  }

  get okumaEvreleri() { return ['tanitim', 'sessizlik']; }

  evreBasladi(e) {
    if (e === 'kuruma') { this.ui.baslikGizle(); }
    if (e === 'kaldir') {
      this.ui.ipucu(IPUCLARI[7].a);
      this.imlecGoster = true;
      this.ses.hedef.ruzgar = 0.2;
      this.sapHedef = this.sap.grup.position.clone();
      this.rig.ucus([this.rig.poz.clone(), this.sapBas.clone().add(new THREE.Vector3(3, -1, 10)), YER_KAMERA.clone()],
        [this.rig.bak.clone(), this.sapBas.clone(), this.sapBas.clone().add(new THREE.Vector3(-1, 2, 0))], 3.5, { fovlar: [30, 48] });
      this.rig.paralaks = 0.35;
    }
    if (e === 'oturma') {
      this.ui.ipucu(null);
      this.imlecGoster = false;
      this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.otPoz = this.sap.grup.position.clone();
      this.otQ = this.sap.grup.quaternion.clone();
      this.otOlcek = this.sap.grup.scale.x;
      this.ses.cinlama(-12);
      this.ses.hedef.ruzgar = 0.05;
    }
    if (e === 'sessizlik') {
      this.ui.sakinSatir(B7_SAKIN_SATIR);
    }
    if (e === 'donus') {
      this.ui.sakinSatir(null);
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    const P = this.sap.grup.position;
    this.agac.u.uRuzgar.value.set(0.12, 0, 0.05);
    this.uzak.u.uRuzgar.value.set(0.12, 0, 0.05);
    this.fidan.u.uRuzgar.value.set(0.08, 0, 0.03);
    this.kuruToz.guncelle(dt, this.t);
    this.yeniAy.guncelle(this.kamera);
    this.kuruToz.nesne.position.copy(P);
    const yu = this.yildizlar.u;
    yu.uImlec.value.copy(g.etkin);

    if (this.evre === 'tanitim') {
      this.sap.grup.rotation.y = 0.2 + Math.sin(this.t * 0.35) * 0.5 + g.etkin.x * 0.3;
      this.sap.grup.rotation.x = 0.15 + g.etkin.y * 0.15;
      if (this.et > 8) this.evreye('kuruma');
    }

    if (this.evre === 'kuruma') {
      const x = ss(0.3, 6.5, this.et);
      this.sap.ayarla({
        kuru: x, kalin: karis(SAP.kalin, KURU.kalin, x), egri: karis(SAP.egri, KURU.egri, x), kivrim: karis(SAP.kivrim, KURU.kivrim, ss(0.2, 1, x)),
      });
      this.kuruToz.u.uAlfa.value = Math.sin(Math.PI * sat(this.et / 7)) * 0.9;
      this.sap.grup.rotation.y = yaklas(this.sap.grup.rotation.y, 0.2, 1, dt);
      // ışık soğur
      this.sap.u.uARenk.value.lerp(new THREE.Color('#e8d2a8').multiplyScalar(0.95), dt * 0.25);
      if (this.et > 7.5) this.evreye('kaldir');
    }

    if (this.evre === 'kaldir') this._kaldir(dt);
    if (this.evre === 'oturma') this._oturma(dt);

    if (this.evre === 'sessizlik') {
      yu.uTepki.value = yaklas(yu.uTepki.value, 0, 1.2, dt);
      this.sap.haleU.uGuc.value = 0.07 + 0.01 * Math.sin(this.t * 0.6);
      if (this.et > 13) this.evreye('donus');
    }

    if (this.evre === 'donus') this._donus(dt);
  }

  _kaldir(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    const P = this.sap.grup.position;
    // imleç ışınının düzlemle kesişimi
    const aktif = g.bosta < 0.4 || g.w > 0.3;
    if (aktif && !this.rig.ucusu) {
      const h = g.duzlem(this.kamera, this.duzlem, this._v);
      if (h) { this.sapHedef.copy(h); this.sapHedef.y = Math.max(this.sapHedef.y, 2.5); }
    }
    const hedef = this._v.copy(this.sapHedef);
    // atalet: yay-sönüm
    const k = 9, c = 4.2;
    this.hiz.addScaledVector(this._v.copy(hedef).sub(P), k * dt);
    this.hiz.multiplyScalar(Math.exp(-c * dt));
    if (this.hiz.length() > 3.2) this.hiz.setLength(3.2);
    P.addScaledVector(this.hiz, dt);
    // yükseldikçe kameraya dönük, hilal duruşuna yaklaşır
    const yuk = ss(this.sapBas.y, this.SLOT.y, P.y);
    this._q.copy(this.slotQ);
    this.sap.grup.quaternion.slerp(this._q, 1 - Math.exp(-dt * (0.5 + yuk * 2.5)));
    // hafif sallantı (atalete göre)
    this.sap.grup.rotateZ(-this.hiz.x * 0.004);
    const olcek = karis(1, R_HILAL / R_SAP, ss(0.35, 1, yuk) * 0.6);
    this.sap.grup.scale.setScalar(olcek);
    // kamera: sapla birlikte göğe bakar; ağaç aşağıda siluet
    if (!this.rig.ucusu) {
      this.rig.poz.lerp(YER_KAMERA, 1 - Math.exp(-dt * 2));
      const bak = this._v.copy(P).lerp(this.SLOT, 0.35);
      bak.y = Math.max(bak.y, 7);
      this.rig.bak.lerp(bak, 1 - Math.exp(-dt * 1.6));
    }
    // iz görünür, yaklaştıkça parlar
    const uz = P.distanceTo(this.SLOT);
    this.iz.u.uGorunur.value = yaklas(this.iz.u.uGorunur.value, 0.35 + 0.65 * ss(14, 3, uz), 2, dt);
    this.iz.u.uParlak.value = 0.35 + 0.25 * Math.sin(this.t * 1.6) * 0.5;
    // yıldızlar imlece tepki verir
    this.yildizlar.u.uTepki.value = yaklas(this.yildizlar.u.uTepki.value, 1, 1, dt);
    // yardımcı imleç: izin ekrandaki yeri
    const n = this.SLOT.clone().project(this.kamera);
    g.otoHedef = new THREE.Vector2(THREE.MathUtils.clamp(n.x, -0.95, 0.95), THREE.MathUtils.clamp(n.y + 0.15, -0.95, 0.95));
    g.otoHiz = 0.45;
    g.bekleme = 2.2;
    this.ui.ilerleme(ss(this.sapBas.y, this.SLOT.y - 1, P.y));
    this.ses.hedef.hiz = Math.min(0.4, this.hiz.length() * 0.05);
    if (uz < 3.2 && !this.rig.ucusu) this.evreye('oturma');
    if (this.et > 70) this.evreye('oturma'); // güvenlik: asla takılmaz
  }

  _oturma(dt) {
    const e = this.et;
    const x = yumusak.icDis(sat(e / 3.2));
    this.sap.grup.position.lerpVectors(this.otPoz, this.SLOT, x);
    this.sap.grup.quaternion.slerpQuaternions(this.otQ, this.slotQ, x);
    this.sap.grup.scale.setScalar(karis(this.otOlcek, R_HILAL / R_SAP, x));
    // dönüşüm: tek parametre m, aynı yay fonksiyonu
    const m = ss(0.8, 6.5, e);
    this.sap.ayarla({ m, parlak: 1.9 * ss(0.6, 6.0, e), doku: 1 - ss(1.5, 5.5, e) });
    this.sap.u.uK.value = this.k;
    this.sap.u.uR.value = R_SAP; // ölçek grup ölçeğinden gelir
    this.sap.haleU.uGuc.value = 0.07 * ss(3, 7, e);
    this.iz.u.uGorunur.value = yaklas(this.iz.u.uGorunur.value, 0, 1.5, dt);
    this.ses.hedef.hiz = 0;
    // yıldızlar tepki vermeye devam
    this.yildizlar.u.uTepki.value = 1 - ss(5, 8, e);
    // kamera yavaşça hilale yerleşir
    this.rig.bak.lerp(this._v.copy(this.SLOT).add(new THREE.Vector3(1.5, -3, 0)), 1 - Math.exp(-dt * 0.8));
    this.ui.ilerleme(null);
    if (e > 8.5) this.evreye('sessizlik');
  }

  _donus(dt) {
    const e = this.et;
    // hilal kaybolur
    this.sap.u.uGorunur.value = 1 - ss(1, 5, e);
    this.sap.haleU.uGuc.value = 0.07 * (1 - ss(1, 4.5, e));
    if (e > 5 && !this._safak) {
      this._safak = true;
      this.atmo.gecis('safak', 7);
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(0.2, 2.6, 20.5), new THREE.Vector3(-0.6, 2.3, 19.5)],
        [this.rig.bak.clone(), new THREE.Vector3(-4, 6, 0), new THREE.Vector3(-5.6, 3.6, 0)], 7, { fovlar: [48, 42], yumusat: yumusak.icDisSin });
    }
    // yeni hilal doğar; yerde yeni yaprak açılır
    this.yeniAy.u.uGorunur.value = ss(8, 12, e);
    this._yeniYaprak(ss(9.5, 14, e));
    if (e > 16) this.bitir();
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('kuruma');
    else if (this.evre === 'kaldir') { this.sap.grup.position.copy(this.SLOT).add(new THREE.Vector3(1, -1, 0)); }
  }
  testDurum() {
    return { m: +this.sap.u.uM.value.toFixed(3), sapY: +this.sap.grup.position.y.toFixed(2), uzaklik: +this.sap.grup.position.distanceTo(this.SLOT).toFixed(2) };
  }
}
