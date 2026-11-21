// 05 · Meyve — "Hasat"  (dolunay gecesi)
// Tanıtım: salkımdan bir renk dalgası geçer: kimrî → halâl → rutab → temr.
// Aksiyon 1: imleç salkım dalına yaklaşınca dal "tutunur"; sağa sola sallayınca
// dal silkelenir, hurmalar yağar. Aksiyon 2: kap imleci izler, yedi hurma yakalanır.
// İkram: yedi hurma kaptan yükselir, ışığa dönüp ufka uçar; uzakta kandiller yanar.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas, rastgele } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Salkim } from '../dunya/salkim.js';
import { ISIK_UNIFORMLARI, AYDINLATMA, GURULTU } from '../dunya/glsl.js';
import { Patlama } from '../fx/parcacik.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { ndc } from '../cekirdek/girdi.js';
import { yumusak } from '../cekirdek/kamera.js';

const HEDEF_SAYI = 7;

export class B5Meyve extends Bolum {
  kur() {
    this.gokKur({ ayar: 'dolunay', ay: { yas: this.bilgi.ay, boyut: 4.2, az: 165, yuk: 16, parlak: 2.2 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 10] });
    this.sahne.add(this.zemin.grup);
    const y0 = this.zemin.yukseklik(0, 0);
    this.y0 = y0;
    const uzak = [];
    for (let i = 0; i < 10; i++) {
      const x = -60 + i * 13 + Math.sin(i * 4) * 5, z = -45 - (i % 3) * 14;
      uzak.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.2, boy: 7 + (i % 3) * 1.4, yaw: i, yaprak: 16, egilme: 0.05 });
    }
    this.hurma = new Hurma(this.atmo, [{ x: 0, z: 0, y: y0, boy: 7.2, egilme: 0.03, yaw: 0.5, yaprak: 26 }, ...uzak], { yaprakCift: 28 });
    this.sahne.add(this.hurma.grup);
    this.tepe = this.hurma.tepe(0);
    // salkımlar: biri ana (öne bakan)
    this.salkimlar = [];
    const acilar = [0.15, -0.9, 1.1, 2.4];
    acilar.forEach((a, i) => {
      const yon = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const s = new Salkim(this.atmo, { taban: this.tepe.clone().add(new THREE.Vector3(0, -0.5, 0)).addScaledVector(yon, 0.25), yon, sapBoy: 1.25, telSayisi: i === 0 ? 30 : 20, telBoy: 0.8, meyveTel: i === 0 ? 7 : 5, tohum: 50 + i, meyveBoy: 0.048 });
      s.mu.uZemin.value = y0;
      this.sahne.add(s.grup);
      this.salkimlar.push(s);
    });
    this.ana = this.salkimlar[0];
    this.anaMerkez = this.ana.sapEgri.getPoint(0.95).add(new THREE.Vector3(0, -0.35, 0));
    this.anaTutamak = this.ana.sapEgri.getPoint(0.6);
    this.pivot = this.ana.sapEgri.getPoint(0);
    // kap (zembil)
    const prof = [];
    for (let i = 0; i <= 12; i++) { const t = i / 12; prof.push(new THREE.Vector2(0.15 + 0.55 * Math.sin(t * 1.35), t * 0.42)); }
    const kg = new THREE.LatheGeometry(prof, 40);
    this.kap = new THREE.Mesh(kg, new THREE.ShaderMaterial({
      uniforms: { ...this.atmo.u },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; varying vec2 vUv; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${ISIK_UNIFORMLARI}${AYDINLATMA} varying vec3 vN; varying vec3 vD; varying vec2 vUv;
        void main(){ vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; vec3 V=normalize(cameraPosition-vD);
          float orgu=0.5+0.5*sin(vUv.x*160.0+step(0.5,fract(vUv.y*14.0))*3.14)*sin(vUv.y*88.0);
          vec3 alb=mix(vec3(0.42,0.3,0.16),vec3(0.7,0.54,0.3),orgu);
          vec3 c=aydinlat(alb,N,V,0.4,0.0,0.6); gl_FragColor=vec4(sisle(c,vD),1.0); }`,
      side: THREE.DoubleSide,
    }));
    this.kap.position.set(0, y0, 3.2);
    this.kap.visible = false;
    this.sahne.add(this.kap);
    // kaptaki ve ikram edilen hurmalar
    const hg = new THREE.SphereGeometry(1, 14, 10); hg.scale(0.065, 0.1, 0.065);
    this.hurmaMat = new THREE.ShaderMaterial({
      uniforms: { ...this.atmo.u, uIsik: { value: 0 } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${ISIK_UNIFORMLARI}${AYDINLATMA} uniform float uIsik; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          vec3 c=aydinlat(vec3(0.25,0.1,0.05),N,V,0.3,0.4,0.6)+uIsikRenk*pow(max(dot(N,normalize(uIsikYon+V)),0.0),40.0)*0.8;
          c=mix(c,vec3(3.0,2.2,1.2),uIsik); gl_FragColor=vec4(c,1.0); }`,
    });
    this.kaptakiler = [];
    for (let i = 0; i < HEDEF_SAYI; i++) {
      const m = new THREE.Mesh(hg, this.hurmaMat.clone());
      m.material.uniforms = { ...this.atmo.u, uIsik: { value: 0 } };
      m.visible = false;
      this.sahne.add(m);
      this.kaptakiler.push(m);
    }
    // uzakta kandiller
    const kg2 = new THREE.BufferGeometry();
    const kp = [];
    const r = rastgele(5);
    for (let i = 0; i < 40; i++) { const a = -0.9 + r() * 1.8; const R = 70 + r() * 60; kp.push(Math.sin(a) * R + 10, this.zemin.yukseklik(Math.sin(a) * R, -Math.cos(a) * R) + 0.8 + r() * 1.5, -Math.cos(a) * R); }
    kg2.setAttribute('position', new THREE.Float32BufferAttribute(kp, 3));
    this.kandilU = { uA: { value: 0 }, uZaman: this.atmo.u.uZaman };
    this.kandil = new THREE.Points(kg2, new THREE.ShaderMaterial({
      uniforms: this.kandilU,
      vertexShader: /* glsl */ `uniform float uA,uZaman; varying float vA; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv;
        float yan=smoothstep(float(gl_VertexID)*0.025,float(gl_VertexID)*0.025+0.1,uA); vA=yan*(0.8+0.2*sin(uZaman*5.0+float(gl_VertexID)));
        gl_PointSize=4.0+3.0*vA; }`,
      fragmentShader: /* glsl */ `varying float vA; void main(){ float d=length(gl_PointCoord-0.5); float a=(1.0-smoothstep(0.0,0.5,d))*vA; gl_FragColor=vec4(vec3(2.6,1.6,0.6)*a,1.0);} `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.kandil.frustumCulled = false;
    this.sahne.add(this.kandil);
    this.yakala = new Patlama(200, { renk: '#ffd890', parlak: 2, boyut: 5, hizMin: 1, hizMax: 4, koni: 0.7, yercekim: -3, sure: 1 });
    this.sahne.add(this.yakala.nesne);

    this.rig.fov = 30;
    this.rig.paralaks = 0.4;
    const A = this.anaMerkez;
    this.rig.ucus([A.clone().add(new THREE.Vector3(3, -2, 9)), A.clone().add(new THREE.Vector3(2.4, -0.5, 5.4)), A.clone().add(new THREE.Vector3(2.0, -0.45, 4.2))],
      [A.clone(), A.clone().add(new THREE.Vector3(-0.2, 0.05, 0))], 5, { yumusat: yumusak.dis });
    this.ui.baslik(5, this.bilgi.ad, this.bilgi.alt, SATIRLAR[5]);
    const k = ['kimri', 'halal', 'rutab', 'temr'];
    k.forEach((id, i) => this.ui.etiket(id, { icerik: id, nokta: A.clone().add(new THREE.Vector3(0.25, -0.15 + i * 0.05, 0.2)), dx: 150, dy: -190 + i * 84 }));
    this.imlecGoster = false;
    this.enerji = 0; this.dusen = 0; this.yakalanan = 0;
    this.sallanma = 0; this.sallanmaHiz = 0;
    this._v = new THREE.Vector3(); this._n = new THREE.Vector2();
    this.ses.hedef.ruzgar = 0.1;
    this.evreye('tanitim');
  }

  evreBasladi(e) {
    if (e === 'silkele') {
      this.ui.baslikGizle();
      for (const k of ['kimri', 'halal', 'rutab', 'temr']) this.ui.etiketAc(k, false);
      this.ui.ipucu(IPUCLARI[5].a);
      this.imlecGoster = true;
      const A = this.anaMerkez;
      this.rig.ucus([this.rig.poz.clone(), A.clone().add(new THREE.Vector3(1.5, -2.2, 7.5))], [this.rig.bak.clone(), A.clone().add(new THREE.Vector3(0, -1.2, 0))], 2.2, { fovlar: [30, 40] });
    }
    if (e === 'yakala') {
      this.ui.ipucu(IPUCLARI[5].a2);
      this.kap.visible = true;
      const y0 = this.y0;
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(0.5, y0 + 2.6, 10)], [this.rig.bak.clone(), new THREE.Vector3(0, y0 + 2.8, 1)], 2, { fovlar: [40, 46] });
      this.sonrakiDusus = 1.5;
    }
    if (e === 'ikram') {
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.imlecGoster = false; this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.ses.cinlama(-3);
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(-1, this.y0 + 1.6, 9)], [this.rig.bak.clone(), new THREE.Vector3(2, this.y0 + 3, -30)], 6, { fovlar: [46, 42], yumusat: yumusak.icDisSin });
      this.ikramYol = this.kaptakiler.map((m, i) => new THREE.CatmullRomCurve3([
        m.position.clone(), m.position.clone().add(new THREE.Vector3(0, 2, 0)),
        new THREE.Vector3(-12 + i * 5, this.y0 + 7, -30), new THREE.Vector3(-40 + i * 14, this.y0 + 3, -100)]));
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.yakala.guncelle(dt);
    this.hurma.u.uRuzgar.value.set(0.15, 0, 0.05);
    for (const s of this.salkimlar) s.mu.uEvre.value = this.evre === 'tanitim' ? karis(0, 3.0, ss(1, 9, this.et)) : 3.0;
    // dal sallanması (yay-sönüm)
    this.sallanmaHiz += (-this.sallanma * 30 - this.sallanmaHiz * 2.5) * dt;
    this.sallanma += this.sallanmaHiz * dt;
    const ag = this.ana.grup;
    ag.position.copy(this.pivot); ag.rotation.set(0, 0, 0);
    ag.rotateOnWorldAxis(new THREE.Vector3(0, 0, 1), this.sallanma * 0.18);
    ag.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), this.sallanma * 0.06);
    ag.position.sub(this._v.copy(this.pivot).applyQuaternion(ag.quaternion));
    ag.position.add(this.pivot).sub(this.pivot);
    ag.position.copy(this.pivot).sub(this._v.copy(this.pivot).applyQuaternion(ag.quaternion));

    if (this.evre === 'tanitim') {
      ['kimri', 'halal', 'rutab', 'temr'].forEach((k, i) => this.ui.etiketAc(k, this.et > 1.6 + i * 1.9));
      if (this.et > 11) this.evreye('silkele');
    }
    if (this.evre === 'silkele') this._silkele(dt);
    if (this.evre === 'yakala') this._yakala(dt);
    if (this.evre === 'ikram') this._ikram(dt);
  }

  _uygunMeyve() {
    const ms = this.ana.meyveler;
    const adaylar = [];
    ms.forEach((m, i) => { if (m.dustu === undefined) adaylar.push(i); });
    return adaylar.length ? adaylar[Math.floor(Math.random() * adaylar.length)] : -1;
  }

  _silkele(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    ndc(this.anaTutamak, this.kamera, this._n);
    const W = innerWidth, H = innerHeight;
    const d = Math.hypot((this._n.x - g.etkin.x) * W / 2, (this._n.y - g.etkin.y) * H / 2);
    const tut = d < 160;
    if (tut) {
      const vx = g.hiz.x;
      this.sallanmaHiz += vx * dt * 6;
      this.enerji += Math.abs(vx) * dt * 0.35;
    }
    // enerji eşikleri aşıldıkça hurmalar düşer
    while (this.enerji > 0.12 && this.dusen < 18) {
      this.enerji -= 0.12;
      const i = this._uygunMeyve();
      if (i < 0) break;
      this.ana.dusur(i, this.oyun.zaman, (Math.random() - 0.5) * 1.2, 0.5 + Math.random() * 0.8);
      this.dusen++;
      this.rig.sars(0.06);
    }
    g.otoHedef = new THREE.Vector2(this._n.x + Math.sin(this.t * 6) * 0.18, this._n.y);
    g.otoHiz = 2.2; g.bekleme = 2.0;
    this.ses.hedef.ruzgar = 0.1 + Math.min(0.5, Math.abs(this.sallanmaHiz) * 0.2);
    this.ui.ilerleme(this.dusen / 18);
    if (this.dusen >= 18 && this.et > 4) this.evreye('yakala');
    if (this.et > 45) this.enerji += 1;
  }

  _yakala(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    const zemin = this.y0;
    // kap imleci izler (yatay)
    const r = g.isin(this.kamera);
    const t = (zemin + 0.4 - r.origin.y) / (r.direction.y || -1e-3);
    let hx = r.origin.x + r.direction.x * Math.max(0, t);
    hx = THREE.MathUtils.clamp(hx, -4, 4);
    this.kap.position.x = yaklas(this.kap.position.x, hx, 9, dt);
    this.kap.position.z = 3.2;
    // yeni hurmalar düşer
    this.sonrakiDusus -= dt;
    if (this.sonrakiDusus <= 0 && this.yakalanan < HEDEF_SAYI) {
      this.sonrakiDusus = 1.3;
      const i = this._uygunMeyve();
      if (i >= 0) {
        const m = this.ana.meyveler[i];
        // kabın bulunduğu z'ye düşsün; x rastgele kaysın
        const T = Math.sqrt(Math.max(0.1, (m.p.y - zemin - 0.4) / 4.9));
        const hedefX = (Math.random() - 0.5) * 5;
        this.ana.dusur(i, this.oyun.zaman, (hedefX - m.p.x) / T, (3.2 - m.p.z) / T);
        m.yakalanabilir = true;
        this.sonDusen = i;
      }
    }
    // yakalama denetimi (JS ikizi)
    let yardimX = 0;
    this.ana.meyveler.forEach((m, i) => {
      if (!m.yakalanabilir || m.gizli) return;
      const p = this.ana.dusenKonum(i, this.oyun.zaman, zemin, this._v);
      // düşen meyvenin dünya konumu: salkım grubu dönmüş olabilir, yaklaşık olarak dönüşü yok sayıyoruz
      const T = Math.sqrt(Math.max(0.1, (m.p.y - zemin - 0.4) / 4.9));
      yardimX = m.p.x + m.v[0] * T;
      if (Math.abs(p.y - (zemin + 0.42)) < 0.25 && Math.abs(p.x - this.kap.position.x) < 0.65 && Math.abs(p.z - this.kap.position.z) < 0.8) {
        this.ana.gizle(i); m.yakalanabilir = false;
        const k = this.kaptakiler[this.yakalanan];
        k.visible = true;
        this.yakalanan++;
        this.yakala.patlat(this.kap.position.clone().add(new THREE.Vector3(0, 0.4, 0)));
        this.ses.cinlama(this.yakalanan * 2);
      } else if (p.y <= zemin + 0.07) { m.yakalanabilir = false; }
    });
    this.kaptakiler.forEach((k, i) => {
      if (!k.visible) return;
      const a = i * 2.4;
      k.position.set(this.kap.position.x + Math.cos(a) * 0.22 * (i ? 1 : 0), zemin + 0.32 + (i > 3 ? 0.08 : 0), this.kap.position.z + Math.sin(a) * 0.22 * (i ? 1 : 0));
      k.rotation.z = 1.3;
    });
    // yardımcı: düşen meyvenin iniş noktasına
    const n = this._v.set(yardimX, zemin + 0.4, 3.2).project(this.kamera);
    g.otoHedef = new THREE.Vector2(n.x, n.y); g.otoHiz = 2.5; g.bekleme = 2.0;
    this.ui.ilerleme(this.yakalanan / HEDEF_SAYI);
    if (this.yakalanan >= HEDEF_SAYI) this.evreye('ikram');
    if (this.et > 60 && this.yakalanan < HEDEF_SAYI) { this.kaptakiler[this.yakalanan].visible = true; this.yakalanan++; }
  }

  _ikram(dt) {
    const e = this.et;
    this.kaptakiler.forEach((k, i) => {
      const x = ss(0.8 + i * 0.35, 6 + i * 0.35, e);
      this.ikramYol[i].getPoint(x, k.position);
      k.material.uniforms.uIsik.value = ss(0.6 + i * 0.35, 2 + i * 0.35, e);
      k.scale.setScalar(1 + 1.5 * ss(1, 3, e));
      k.visible = x < 0.999;
    });
    this.kandilU.uA.value = ss(3.5, 8.5, e);
    if (e > 10) this.bitir();
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('silkele');
    else if (this.evre === 'silkele') this.enerji += 3;
  }
  testDurum() { return { dusen: this.dusen, yakalanan: this.yakalanan }; }
}
