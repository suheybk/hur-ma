// 03 · Kalp — "Fırtına"
// Tanıtım: hızlandırılmış büyüme; gövde halka halka yükselir, yapraklar tepeden açılır.
// Aksiyon: kum fırtınası. İmleç kuru yaprakların üzerinden hızla geçince yapraklar
// kopup fırtınaya savrulur. Tepedeki yeşil öz (cummâr) ışır; imleç oraya gelince
// yumuşak bir kalkan dalgası onu geri iter; kısa röntgen görünümü. Fırtına diner.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Zerreler, Patlama } from '../fx/parcacik.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { ndc } from '../cekirdek/girdi.js';
import { yumusak } from '../cekirdek/kamera.js';

const KURU_SAYI = 9;

export class B3Kalp extends Bolum {
  kur() {
    this.gokKur({ ayar: 'sabah', ay: { yas: this.bilgi.ay, boyut: 2.4, az: 120, yuk: 35, parlak: 0.6 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 8] });
    this.sahne.add(this.zemin.grup);
    const y0 = this.zemin.yukseklik(0, 0);
    this.hurma = new Hurma(this.atmo, [{ x: 0, z: 0, y: y0, boy: 8.5, egilme: 0.04, yaw: 1.1, yaprak: 30, kuruSayisi: KURU_SAYI, dogum: 0 }]);
    this.hurma.u.uBuyuSure.value = 7.5;
    this.hurma.u.uKuru.value.set('#9a7240');
    this.sahne.add(this.hurma.grup);
    this.tepe = this.hurma.tepe(0);
    this.y0 = y0;
    // kalp (cummâr)
    this.kalpU = { uGuc: { value: 0 }, uZaman: this.atmo.u.uZaman };
    this.kalp = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 16), new THREE.ShaderMaterial({
      uniforms: this.kalpU,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `uniform float uGuc,uZaman; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 V=normalize(cameraPosition-vD); float f=pow(1.0-abs(dot(normalize(vN),V)),2.0);
          float n=0.85+0.15*sin(uZaman*3.0); vec3 c=vec3(0.55,1.0,0.45)*(0.6+f*1.5)*uGuc*n*2.2; gl_FragColor=vec4(c,1.0);} `,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    }));
    this.kalp.position.copy(this.tepe).add(new THREE.Vector3(0, -0.15, 0));
    this.kalp.renderOrder = 5;
    this.sahne.add(this.kalp);
    // kalkan halkası
    this.halkaU = { uT: { value: -1 } };
    this.halka = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({
      uniforms: this.halkaU,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `uniform float uT; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 V=normalize(cameraPosition-vD); float f=pow(1.0-abs(dot(normalize(vN),V)),3.0);
          float a=(1.0-smoothstep(0.0,1.2,uT))*step(0.0,uT); gl_FragColor=vec4(vec3(0.6,1.0,0.7)*f*a*1.6,1.0);} `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.halka.position.copy(this.kalp.position);
    this.halka.visible = false;
    this.sahne.add(this.halka);
    // fırtına tozu
    this.toz = new Zerreler(Math.round(3500 * this.oyun.kalite.parcacik + 500), { boyut: new THREE.Vector3(60, 22, 40), renk: '#e0b47a', parlak: 0.55, nokta: 3.2, hiz: 1.2 });
    this.toz.nesne.position.set(0, 8, 4);
    this.toz.u.uAlfa.value = 0;
    this.sahne.add(this.toz.nesne);
    this.toz2 = new Zerreler(Math.round(900 * this.oyun.kalite.parcacik + 200), { boyut: new THREE.Vector3(30, 14, 16), renk: '#fff0d0', parlak: 0.9, nokta: 1.4, hiz: 2 });
    this.toz2.nesne.position.set(0, 6, 10);
    this.toz2.u.uAlfa.value = 0;
    this.sahne.add(this.toz2.nesne);
    this.kopma = new Patlama(300, { renk: '#d8a060', parlak: 1.3, boyut: 5, hizMin: 2, hizMax: 8, koni: 1, yercekim: -1, sure: 1.5 });
    this.sahne.add(this.kopma.nesne);

    this.kurular = this.hurma.yaprakListe.map((y, j) => ({ j, y })).filter((o) => o.y.kuru > 0.5);
    this.rig.fov = 36;
    this.rig.paralaks = 0.7;
    this.rig.ucus([new THREE.Vector3(8, y0 + 2, 26), new THREE.Vector3(5, y0 + 4, 20), new THREE.Vector3(3.5, y0 + 4.8, 17)],
      [new THREE.Vector3(0, y0 + 3, 0), new THREE.Vector3(-1.5, y0 + 5.2, 0)], 7, { yumusat: yumusak.dis });
    this.ui.baslik(3, this.bilgi.ad, this.bilgi.alt, SATIRLAR[3]);
    const T = this.tepe;
    this.ui.etiket('kurnaf', { icerik: 'kurnaf', nokta: new THREE.Vector3(T.x * 0.4, y0 + 3.2, 0.3), dx: 120, dy: 40 });
    this.ui.etiket('lif', { icerik: 'lif', nokta: new THREE.Vector3(T.x * 0.85, T.y - 1.2, 0.3), dx: 150, dy: -20 });
    this.ui.etiket('cummar', { icerik: 'cummar', nokta: this.kalp.position, dx: 130, dy: -120 });
    this.ui.etiket('kalp', { icerik: 'kalp', nokta: this.kalp.position, dx: -150, dy: -110 });
    this.imlecGoster = false;
    this.ses.hedef.ruzgar = 0.2;
    this._n = new THREE.Vector2(); this._v = new THREE.Vector3();
    this.evreye('tanitim');
  }

  evreBasladi(e) {
    if (e === 'firtina') {
      this.ui.baslikGizle();
      for (const k of ['kurnaf', 'lif', 'cummar']) this.ui.etiketAc(k, false);
      this.ui.ipucu(IPUCLARI[3].a);
      this.imlecGoster = true;
      this.atmo.gecis('firtina', 3);
      this.gok.mat.uniforms.uToz.value = 1;
      this.ses.hedef.ruzgar = 0.9;
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(1.5, this.y0 + 6, 14)], [this.rig.bak.clone(), new THREE.Vector3(0, this.tepe.y - 1.6, 0)], 2.5);
    }
    if (e === 'dinme') {
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.imlecGoster = false; this.girdi.otoHedef = null;
      this.atmo.gecis('sabah', 5);
      this.ses.hedef.ruzgar = 0.15;
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(-3, this.y0 + 3, 20)], [this.rig.bak.clone(), new THREE.Vector3(0, this.y0 + 5, 0)], 6, { yumusat: yumusak.icDisSin });
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.toz.guncelle(dt, this.t); this.toz2.guncelle(dt, this.t);
    this.kopma.guncelle(dt);
    const u = this.hurma.u;
    if (this.evre === 'tanitim') {
      u.uBuyuZaman.value = Math.min(7.5, this.et * 1.05);
      this.kalpU.uGuc.value = ss(5, 7.5, this.et) * 0.6;
      if (this.et > 7.5) this.ui.etiketAc('kurnaf');
      if (this.et > 8.3) this.ui.etiketAc('lif');
      if (this.et > 9.1) this.ui.etiketAc('cummar');
      u.uRuzgar.value.set(0.2, 0, 0.05);
      if (this.et > 13) this.evreye('firtina');
    }
    if (this.evre === 'firtina') this._firtina(dt);
    if (this.evre === 'dinme') {
      this.toz.u.uAlfa.value = yaklas(this.toz.u.uAlfa.value, 0, 1, dt);
      this.toz2.u.uAlfa.value = yaklas(this.toz2.u.uAlfa.value, 0, 1, dt);
      this.gok.mat.uniforms.uToz.value = yaklas(this.gok.mat.uniforms.uToz.value, 0, 0.8, dt);
      u.uRuzgar.value.lerp(this._v.set(0.2, 0, 0.05), 1 - Math.exp(-dt));
      this.kalpU.uGuc.value = yaklas(this.kalpU.uGuc.value, 0.35, 1, dt);
      this.hurma.rontgen = yaklas(u.uRontgen.value, 0, 3, dt);
      if (this.et > 7) this.bitir();
    }
    // fırtına akışı
    this.toz.u.uAkis.value.x += dt * 30 * this.toz.u.uAlfa.value;
    this.toz2.u.uAkis.value.x += dt * 45 * this.toz2.u.uAlfa.value;
    this.halkaU.uT.value = this.halkaU.uT.value >= 0 ? this.halkaU.uT.value + dt : -1;
    if (this.halkaU.uT.value > 1.3) { this.halkaU.uT.value = -1; this.halka.visible = false; }
    this.halka.scale.setScalar(0.4 + Math.max(0, this.halkaU.uT.value) * 3.2);
  }

  _firtina(dt) {
    const g = this.girdi;
    const u = this.hurma.u;
    this.toz.u.uAlfa.value = yaklas(this.toz.u.uAlfa.value, 1, 1, dt);
    this.toz2.u.uAlfa.value = yaklas(this.toz2.u.uAlfa.value, 1, 1, dt);
    const ruz = 1.2 + 0.5 * Math.sin(this.t * 0.7) + 0.3 * Math.sin(this.t * 2.3);
    u.uRuzgar.value.set(ruz, 0, 0.25);
    this.kalpU.uGuc.value = yaklas(this.kalpU.uGuc.value, 1, 2, dt);
    const W = innerWidth, H = innerHeight;
    // kuru yapraklar: hızlı süpürmeyle kopar
    let kalan = 0, hedef = null;
    for (const k of this.kurular) {
      if (this.hurma.yaprakListe[k.j].koptu) continue;
      kalan++;
      const p = this.hurma.yaprakNoktasi(k.j, 0.55, this._v);
      ndc(p, this.kamera, this._n);
      const d = Math.hypot((this._n.x - g.etkin.x) * W / 2, (this._n.y - g.etkin.y) * H / 2);
      if (!hedef) hedef = this._n.clone();
      if (d < 95 && g.hizBuyukluk > 1.1 && this.et - (this._sonKop || -9) > 1.4 && this.et > 2.5) {
        this._sonKop = this.et;
        this.hurma.kopar(k.j, this.oyun.zaman);
        this.kopma.patlat(p.clone());
        this.ses.hava(0.7); this.rig.sars(0.15);
      }
    }
    // fırtınanın kendisi de zamanla birini koparır (oyuncu hiçbir şey yapmasa da biter)
    if (this.et - (this._sonOto || 0) > 6 && kalan > 0) {
      this._sonOto = this.et;
      const k = this.kurular.find((x) => !this.hurma.yaprakListe[x.j].koptu);
      this.hurma.kopar(k.j, this.oyun.zaman);
    }
    // kalp: imleç yaklaşınca kalkan dalgası ve röntgen
    ndc(this.kalp.position, this.kamera, this._n);
    const dk = Math.hypot((this._n.x - g.etkin.x) * W / 2, (this._n.y - g.etkin.y) * H / 2);
    if (dk < 85 && (this.halkaU.uT.value < 0)) {
      this.halkaU.uT.value = 0; this.halka.visible = true;
      this.ui.etiketAc('kalp'); this._kalpT = this.et; this._kalpGoruldu = true;
      this.ses.cinlama(-7);
      // imleci geri iten dalga: yardımcı imleci dışarı savur
      g.oto.set(this._n.x + Math.sign(g.etkin.x - this._n.x || 1) * 0.35, this._n.y - 0.25);
    }
    const rx = this._kalpT !== undefined && this.et - this._kalpT < 3 ? 1 : 0;
    this.hurma.rontgen = yaklas(u.uRontgen.value, rx * 0.85, 4, dt);
    if (this._kalpT !== undefined && this.et - this._kalpT > 10) this.ui.etiketAc('kalp', false);
    // yardımcı: önce kalbi bir kez göster, sonra kuru yaprakları süpür
    if (!this._kalpGoruldu) g.otoHedef = this._n.clone();
    else if (hedef) g.otoHedef = new THREE.Vector2(hedef.x + Math.sin(this.t * 7) * 0.22, hedef.y + Math.cos(this.t * 5) * 0.05);
    g.otoHiz = this._kalpGoruldu ? 2.2 : 0.8;
    g.bekleme = 2.2;
    this.rig.sars(dt * 0.15 * ruz);
    this.ui.ilerleme(1 - kalan / KURU_SAYI);
    if (kalan === 0 && this.et > 16) this.evreye('dinme');
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('firtina');
    else if (this.evre === 'firtina') for (const k of this.kurular) this.hurma.kopar(k.j, this.oyun.zaman);
  }
  testDurum() { return { kalan: this.kurular.filter((k) => !this.hurma.yaprakListe[k.j].koptu).length }; }
}
