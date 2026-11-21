// 06 · Fesîle — "Su"  (sabah)
// Tanıtım: ağacın dibinde yavrular; röntgen: yavrunun kendi kökleri.
// Aksiyon 1 (yavaş): ışıyan ayırma çizgisini sakince izle; saparsan kesim bekler.
// Aksiyon 2 (hızlı): yavru çukura dikilir; arktan su salınır; su başı imlece akar,
// oyuncu suyu fidana ulaştırır. Fidan yeşerir; kamera geri çekilir ve
// hızlandırılmış çekimde yavrulardan koca bir hurmalık büyür.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas, rastgele } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Patlama } from '../fx/parcacik.js';
import { GURULTU } from '../dunya/glsl.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { yumusak } from '../cekirdek/kamera.js';

const CUKUR = new THREE.Vector3(4.5, 0, 4.5);
const ARK = new THREE.Vector3(-9, 0, 9);

export class B6Fesile extends Bolum {
  kur() {
    this.gokKur({ ayar: 'sabah', ay: { yas: this.bilgi.ay, boyut: 2.4, az: 260, yuk: 28, parlak: 0.7 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 14] });
    this.sahne.add(this.zemin.grup);
    const yy = (x, z) => this.zemin.yukseklik(x, z);
    this.y0 = yy(0, 0);
    CUKUR.y = yy(CUKUR.x, CUKUR.z); ARK.y = yy(ARK.x, ARK.z);
    this.ana = new Hurma(this.atmo, [{ x: 0, z: 0, y: this.y0, boy: 8, egilme: 0.04, yaw: 0.2, yaprak: 28 }]);
    this.sahne.add(this.ana.grup);
    // yavrular (birini ayıracağız)
    this.yavruPoz = new THREE.Vector3(1.3, this.y0, 1.0);
    this.yavrular = new Hurma(this.atmo, [
      { x: this.yavruPoz.x, z: this.yavruPoz.z, y: this.y0, boy: 0.45, yaricap: 0.12, egilme: 0.1, yaw: 0.9, yaprak: 9, yaprakOlcek: 4.5 },
      { x: -1.1, z: 0.9, y: this.y0, boy: 0.35, yaricap: 0.1, egilme: -0.1, yaw: 2.1, yaprak: 8, yaprakOlcek: 4.5 },
      { x: -0.3, z: -1.3, y: this.y0, boy: 0.3, yaricap: 0.1, egilme: 0.05, yaw: 4.0, yaprak: 7, yaprakOlcek: 4.5 },
    ], { yaprakCift: 26 });
    this.yavrular.govde.visible = false;
    this.sahne.add(this.yavrular.grup);
    // ayrılan yavru: ayrı bir nesne (taşınacak)
    this.fidan = new Hurma(this.atmo, [{ x: 0, z: 0, y: 0, boy: 0.45, yaricap: 0.12, egilme: 0.1, yaw: 0.9, yaprak: 9, yaprakOlcek: 4.5 }], { yaprakCift: 26 });
    this.fidan.govde.visible = false;
    this.fidan.grup.visible = false;
    this.sahne.add(this.fidan.grup);

    // röntgen kökleri (zeminin altında, her zaman görünür)
    const r = rastgele(8);
    const kokGeo = [];
    const kokMat = new THREE.ShaderMaterial({
      uniforms: { uA: { value: 0 } },
      vertexShader: /* glsl */ `varying float vY; void main(){ vY=position.y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `uniform float uA; void main(){ gl_FragColor=vec4(vec3(0.3,0.7,1.0)*uA*0.28,1.0);} `,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    this.kokMat = kokMat;
    this.kokler = new THREE.Group();
    for (let i = 0; i < 9; i++) {
      const o = this.yavruPoz.clone().add(new THREE.Vector3(0, -0.15, 0));
      const pts = [o];
      let p = o.clone(); const d = new THREE.Vector3(r() - 0.5, -0.8, r() - 0.5).normalize();
      for (let k = 0; k < 5; k++) { p = p.clone().addScaledVector(d, 0.35).add(new THREE.Vector3((r() - 0.5) * 0.2, -0.05, (r() - 0.5) * 0.2)); pts.push(p); }
      this.kokler.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.018, 4), kokMat));
    }
    // anneye bağlantı
    this.kokler.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([this.yavruPoz.clone().add(new THREE.Vector3(0, -0.2, 0)), new THREE.Vector3(0.6, this.y0 - 0.5, 0.4), new THREE.Vector3(0, this.y0 - 0.4, 0)]), 16, 0.05, 6), kokMat));
    this.kokler.renderOrder = 4;
    this.sahne.add(this.kokler);

    // ayırma çizgisi: anne ile yavru arasında yerde bir yay
    const a = new THREE.Vector3(0.55, this.y0 + 0.03, 1.25), b = new THREE.Vector3(1.75, this.y0 + 0.03, 0.35);
    this.kesim = new THREE.CatmullRomCurve3([a, new THREE.Vector3(1.0, this.y0 + 0.03, 0.55), new THREE.Vector3(1.45, this.y0 + 0.03, 0.2).lerp(b, 0.3), b]);
    this.kesimU = { uP: { value: 0 }, uZaman: this.atmo.u.uZaman, uA: { value: 0 } };
    this.kesimCizgi = new THREE.Mesh(new THREE.TubeGeometry(this.kesim, 60, 0.025, 6), new THREE.ShaderMaterial({
      uniforms: this.kesimU,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `uniform float uP,uZaman,uA; varying vec2 vUv;
        void main(){ float kesik=step(vUv.x,uP); float nab=0.6+0.4*sin(uZaman*4.0-vUv.x*20.0);
          vec3 c=mix(vec3(1.0,0.8,0.4)*nab*1.4, vec3(2.4,2.0,1.4), kesik); gl_FragColor=vec4(c*uA,1.0);} `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.sahne.add(this.kesimCizgi);
    this.kivilcim = new Patlama(80, { renk: '#ffe0a0', parlak: 2.2, boyut: 4, hizMin: 0.5, hizMax: 2, koni: 0.8, yercekim: -3, sure: 0.6 });
    this.sahne.add(this.kivilcim.nesne);

    // çukur ve ark
    this.cukur = new THREE.Mesh(new THREE.CircleGeometry(0.6, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color('#3a2414') }));
    this.cukur.rotation.x = -Math.PI / 2; this.cukur.position.copy(CUKUR).add(new THREE.Vector3(0, 0.03, 0));
    this.sahne.add(this.cukur);
    const arkGeo = new THREE.BoxGeometry(6, 0.25, 0.7);
    this.ark = new THREE.Mesh(arkGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color('#5a3c24') }));
    this.ark.position.copy(ARK).add(new THREE.Vector3(-2.5, 0.05, 0)); this.ark.rotation.y = 0.3;
    this.sahne.add(this.ark);
    // su: baş + iz
    this.suMat = new THREE.ShaderMaterial({
      uniforms: { uZaman: this.atmo.u.uZaman },
      vertexShader: /* glsl */ `varying vec2 vUv; varying vec3 vN; varying vec3 vD; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${GURULTU} uniform float uZaman; varying vec2 vUv; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 V=normalize(cameraPosition-vD); float f=pow(1.0-abs(dot(normalize(vN),V)),2.0);
          float n=snoise(vec3(vD.xz*3.0,uZaman*2.0))*0.5+0.5;
          vec3 c=mix(vec3(0.15,0.35,0.5),vec3(0.75,0.92,1.0),f*0.7+n*0.25)+vec3(1.0)*pow(n,8.0)*0.8; gl_FragColor=vec4(c,1.0); }`,
    });
    this.suBas = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), this.suMat);
    this.suBas.scale.y = 0.45;
    this.suBas.visible = false;
    this.sahne.add(this.suBas);
    this.suIz = new THREE.Mesh(new THREE.BufferGeometry(), this.suMat);
    this.suIz.frustumCulled = false;
    this.sahne.add(this.suIz);
    this.su = new Patlama(500, { renk: '#bfe6ff', parlak: 1.6, boyut: 5, hizMin: 1, hizMax: 4, koni: 0.6, yercekim: -8, sure: 1.2 });
    this.sahne.add(this.su.nesne);

    // hurmalık (son)
    const agaclar = [];
    for (let i = 0; i < 34; i++) {
      const a2 = i * 2.39996, R = 7 + Math.sqrt(i) * 5.2;
      const x = Math.cos(a2) * R + 3, z = Math.sin(a2) * R - 4;
      agaclar.push({ x, z, y: yy(x, z) - 0.1, boy: 6 + r() * 3, egilme: (r() - 0.5) * 0.1, yaw: r() * 6, yaprak: 18, dogum: 0.4 + r() * 2.5 });
    }
    this.hurmalik = new Hurma(this.atmo, agaclar, { yaprakCift: 22 });
    this.hurmalik.u.uBuyuSure.value = 4;
    this.hurmalik.u.uBuyuZaman.value = 0;
    this.hurmalik.grup.visible = false;
    this.sahne.add(this.hurmalik.grup);

    this.rig.fov = 34;
    this.rig.paralaks = 0.4;
    const Y = this.yavruPoz;
    this.rig.ucus([new THREE.Vector3(6, this.y0 + 3, 12), new THREE.Vector3(4, this.y0 + 2, 7), new THREE.Vector3(3.4, this.y0 + 1.6, 5.2)],
      [new THREE.Vector3(0, this.y0 + 1.5, 0), Y.clone().add(new THREE.Vector3(-0.9, 0.5, 0))], 5, { yumusat: yumusak.dis });
    this.ui.baslik(6, this.bilgi.ad, this.bilgi.alt, SATIRLAR[6]);
    this.ui.etiket('fesile', { icerik: 'fesile', nokta: Y.clone().add(new THREE.Vector3(0.2, 0.6, 0)), dx: 120, dy: -130 });
    this.ui.etiket('yavruKok', { icerik: 'yavruKok', nokta: Y.clone().add(new THREE.Vector3(0, -0.8, 0)), dx: 130, dy: 60 });
    this.duzlem = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.y0);
    this.imlecGoster = false;
    this.kesP = 0;
    this._v = new THREE.Vector3();
    this.ses.hedef.ruzgar = 0.12;
    this.evreye('tanitim');
  }

  evreBasladi(e) {
    if (e === 'kesim') {
      this.ui.baslikGizle();
      this.ui.etiketAc('fesile', false); this.ui.etiketAc('yavruKok', false);
      this.ui.ipucu(IPUCLARI[6].a);
      this.imlecGoster = true;
      const m = this.kesim.getPoint(0.5);
      this.rig.ucus([this.rig.poz.clone(), m.clone().add(new THREE.Vector3(0.8, 3.2, 2.6))], [this.rig.bak.clone(), m.clone()], 2, { fovlar: [34, 40] });
    }
    if (e === 'dikim') {
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.imlecGoster = false; this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.ses.cinlama(0);
      // yavruyu ayrı nesneye taşı
      this.yavrular.agaclar[0].boy = 0; // gizlemek için yaprakları kopar
      for (let j = 0; j < 9; j++) this.yavrular.kopar(j, -1e6);
      this.fidan.grup.visible = true;
      this.fidan.grup.position.copy(this.yavruPoz);
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(-1, this.y0 + 6, 13)], [this.rig.bak.clone(), new THREE.Vector3(0, this.y0, 4)], 3, { fovlar: [40, 46] });
    }
    if (e === 'sulama') {
      this.ui.ipucu(IPUCLARI[6].a2);
      this.imlecGoster = true;
      this.suBas.visible = true;
      this.suBas.position.copy(ARK).add(new THREE.Vector3(0, 0.1, 0));
      this.suYol = [this.suBas.position.clone()];
      this.su.patlat(this.suBas.position.clone());
      this.ses.hedef.su = 0.5;
      this.ui.etiket('ark', { icerik: 'ark', nokta: ARK.clone().add(new THREE.Vector3(0, 0.3, 0)), dx: -60, dy: -120 });
      this.ui.etiketAc('ark');
    }
    if (e === 'hurmalik') {
      this.ui.ipucu(null); this.ui.ilerleme(null); this.ui.etiketAc('ark', false);
      this.imlecGoster = false; this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.ses.hedef.su = 0.15;
      this.ses.cinlama(5);
      this.hurmalik.grup.visible = true;
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(-6, this.y0 + 10, 26), new THREE.Vector3(-14, this.y0 + 16, 40)],
        [this.rig.bak.clone(), new THREE.Vector3(2, this.y0 + 3, 0)], 8, { fovlar: [46, 50], yumusat: yumusak.icDisSin });
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.kivilcim.guncelle(dt); this.su.guncelle(dt);
    for (const h of [this.ana, this.yavrular, this.fidan, this.hurmalik]) h.u.uRuzgar.value.set(0.2, 0, 0.08);

    if (this.evre === 'tanitim') {
      if (this.et > 2) this.ui.etiketAc('fesile');
      const rx = ss(4, 6, this.et);
      this.kokMat.uniforms.uA.value = rx * 0.8;
      this.ana.rontgen = rx * 0.45;
      if (this.et > 5) this.ui.etiketAc('yavruKok');
      if (this.et > 11) { this.kokMat.uniforms.uA.value = 0; this.ana.rontgen = 0; this.evreye('kesim'); }
    }
    if (this.evre === 'kesim') this._kesim(dt);
    if (this.evre === 'dikim') {
      const x = ss(0.3, 2.6, this.et);
      const P = this.fidan.grup.position;
      P.lerpVectors(this.yavruPoz, CUKUR, x);
      P.y = karis(this.yavruPoz.y, CUKUR.y, x) + Math.sin(Math.PI * x) * 1.4;
      if (this.et > 3.2) this.evreye('sulama');
    }
    if (this.evre === 'sulama') this._sulama(dt);
    if (this.evre === 'hurmalik') {
      this.hurmalik.u.uBuyuZaman.value = Math.max(0, this.et - 1) * 0.8;
      this.fidan.grup.scale.setScalar(karis(1, 6, ss(1, 7, this.et)));
      if (this.et > 10) this.bitir();
    }
  }

  _kesim(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    this.kesimU.uA.value = yaklas(this.kesimU.uA.value, 1, 3, dt);
    const h = g.duzlem(this.kamera, this.duzlem, this._v);
    const kesNok = this.kesim.getPoint(Math.min(1, this.kesP));
    // imleç kesim noktasına yakınsa ve sakinse ilerler; saparsa bekler
    if (h) {
      const d = Math.hypot(h.x - kesNok.x, h.z - kesNok.z);
      const sakin = g.hizBuyukluk < 1.6;
      if (d < 0.45 && sakin) {
        this.kesP = Math.min(1, this.kesP + dt * 0.11);
        if (Math.random() < dt * 12) this.kivilcim.patlat(kesNok);
        this.ses.hedef.ruzgar = 0.18;
      }
    }
    this.kesimU.uP.value = this.kesP;
    // yardımcı: kesim noktasının biraz ilerisi
    const ileri = this.kesim.getPoint(Math.min(1, this.kesP + 0.03)).project(this.kamera);
    g.otoHedef = new THREE.Vector2(ileri.x, ileri.y); g.otoHiz = 0.35; g.bekleme = 2.5;
    this.ui.ilerleme(this.kesP);
    if (this.kesP >= 1) { this.kesimU.uA.value = 0.4; this.evreye('dikim'); }
    if (this.et > 60) this.kesP += dt * 0.2;
  }

  _sulama(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    const h = g.duzlem(this.kamera, this.duzlem, this._v);
    const B = this.suBas.position;
    if (h) {
      const d = this._v.copy(h).sub(B); d.y = 0;
      const L = d.length();
      if (L > 0.05) B.addScaledVector(d.normalize(), Math.min(L, 4.2 * dt));
    }
    B.y = this.zemin.yukseklik(B.x, B.z) + 0.08;
    const son = this.suYol[this.suYol.length - 1];
    if (son.distanceTo(B) > 0.3) {
      this.suYol.push(B.clone());
      if (this.suYol.length > 1) {
        const yol = this.suYol.map((p) => p.clone().setY(this.zemin.yukseklik(p.x, p.z) + 0.03));
        const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(yol), yol.length * 3, 0.16, 6);
        tg.scale(1, 1, 1);
        this.suIz.geometry.dispose(); this.suIz.geometry = tg;
        this.suIz.scale.set(1, 1, 1);
      }
    }
    const n = CUKUR.clone().project(this.kamera);
    g.otoHedef = new THREE.Vector2(n.x, n.y); g.otoHiz = 0.8; g.bekleme = 2.2;
    this.ses.hedef.su = 0.55;
    const kalan = B.distanceTo(CUKUR);
    this.ui.ilerleme(1 - Math.min(1, kalan / ARK.distanceTo(CUKUR)));
    if (kalan < 0.8) { this.su.patlat(CUKUR.clone()); this.evreye('hurmalik'); }
    if (this.et > 60) B.lerp(CUKUR, 0.05);
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('kesim');
    else if (this.evre === 'kesim') this.kesP = 1;
    else if (this.evre === 'sulama') this.suBas.position.copy(CUKUR);
  }
  testDurum() { return { kesim: +this.kesP.toFixed(2) }; }
}
