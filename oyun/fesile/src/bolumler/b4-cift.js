// 04 · Çift — "Rüzgâr"
// Tanıtım: altın saat, iki ağaç; dişi ağacın kınları (tal‘) yarılır.
// Aksiyon: imleç rüzgârdır. Erkek ağaçtan on binlerce çiçek tozu (GPU'da,
// GPUComputationRenderer + curl gürültüsü) salınır; oyuncu bulutu dişi ağacın
// yedi salkımına taşır. Yeterince toz alan salkım ışıkla tutuşur.
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { Bolum, sat, ss, karis, yaklas, rastgele } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { Salkim } from '../dunya/salkim.js';
import { GURULTU, ISIK_UNIFORMLARI, AYDINLATMA } from '../dunya/glsl.js';
import { Patlama, Zerreler } from '../fx/parcacik.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { yumusak } from '../cekirdek/kamera.js';

const ERKEK = new THREE.Vector3(-6.5, 0, -1);
const DISI = new THREE.Vector3(5.5, 0, 0);

const HIZ_FS = /* glsl */ `
uniform float uDt, uZaman, uCekim, uYayil;
uniform vec3 uBulut;
${GURULTU}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 p=texture2D(tKonum,uv); vec4 v=texture2D(tHiz,uv);
  vec3 r=vec3(hash12(uv*91.7),hash12(uv*37.3+3.1),hash12(uv*13.9+7.7))-0.5;
  vec3 hedef=uBulut+r*uYayil;
  vec3 akis=curl3(p.xyz*0.32+vec3(0.0,uZaman*0.12,uZaman*0.05));
  vec3 a=akis*2.2+(hedef-p.xyz)*uCekim+vec3(0.0,-0.15,0.0);
  v.xyz+=a*uDt;
  v.xyz*=exp(-uDt*1.1);
  if(p.w<=0.0) v.xyz=r*0.8+vec3(0.0,0.4,0.0);
  gl_FragColor=v;
}`;
const KONUM_FS = /* glsl */ `
uniform float uDt, uZaman, uSalim;
uniform vec3 uKaynak[4];
float h1(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution.xy;
  vec4 p=texture2D(tKonum,uv); vec4 v=texture2D(tHiz,uv);
  p.xyz+=v.xyz*uDt;
  p.w-=uDt;
  if(p.w<=0.0){
    float s=h1(uv*57.3+floor(uZaman*3.0)*0.37);
    if(s<uSalim){
      float k=floor(h1(uv*11.1+uZaman)*3.999);
      vec3 o=k<1.0?uKaynak[0]:(k<2.0?uKaynak[1]:(k<3.0?uKaynak[2]:uKaynak[3]));
      vec3 r=vec3(h1(uv*3.3+uZaman),h1(uv*5.7-uZaman),h1(uv*7.1+uZaman*1.3))-0.5;
      p.xyz=o+r*0.9;
      p.w=5.0+h1(uv*9.9)*6.0;
    } else { p.xyz=vec3(0.0,-50.0,0.0); p.w=-0.01; }
  }
  gl_FragColor=p;
}`;

class TozSistemi {
  constructor(renderer, atmo, olcek) {
    const W = olcek >= 1 ? 256 : olcek >= 0.6 ? 160 : 96, H = olcek >= 1 ? 128 : olcek >= 0.6 ? 128 : 96;
    this.sayi = W * H;
    this.gpu = new GPUComputationRenderer(W, H, renderer);
    if (!renderer.extensions.has('EXT_color_buffer_float')) this.gpu.setDataType(THREE.HalfFloatType);
    const k0 = this.gpu.createTexture(), v0 = this.gpu.createTexture();
    const a = k0.image.data;
    for (let i = 0; i < a.length; i += 4) { a[i] = 0; a[i + 1] = -50; a[i + 2] = 0; a[i + 3] = -Math.random() * 3; }
    this.kV = this.gpu.addVariable('tKonum', KONUM_FS, k0);
    this.hV = this.gpu.addVariable('tHiz', HIZ_FS, v0);
    this.gpu.setVariableDependencies(this.kV, [this.kV, this.hV]);
    this.gpu.setVariableDependencies(this.hV, [this.kV, this.hV]);
    this.ku = this.kV.material.uniforms; this.hu = this.hV.material.uniforms;
    Object.assign(this.ku, { uDt: { value: 0 }, uZaman: { value: 0 }, uSalim: { value: 0 }, uKaynak: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] } });
    Object.assign(this.hu, { uDt: { value: 0 }, uZaman: { value: 0 }, uCekim: { value: 1.2 }, uYayil: { value: 2.2 }, uBulut: { value: new THREE.Vector3() } });
    const hata = this.gpu.init();
    if (hata) console.error(hata);
    // görselleştirme
    const g = new THREE.BufferGeometry();
    const uvs = new Float32Array(this.sayi * 2), rr = new Float32Array(this.sayi);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; uvs[i * 2] = (x + 0.5) / W; uvs[i * 2 + 1] = (y + 0.5) / H; rr[i] = Math.random(); }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.sayi * 3), 3));
    g.setAttribute('aRef', new THREE.BufferAttribute(uvs, 2));
    g.setAttribute('aR', new THREE.BufferAttribute(rr, 1));
    this.u = { tKonum: { value: null }, uBoyut: { value: 2.2 }, uParlak: { value: 1.7 }, uPR: { value: renderer.getPixelRatio() } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        uniform sampler2D tKonum; uniform float uBoyut,uPR; attribute vec2 aRef; attribute float aR; varying float vA; varying float vR;
        void main(){
          vec4 p=texture2D(tKonum,aRef);
          vA=smoothstep(0.0,1.2,p.w)*step(-20.0,p.y);
          vR=aR;
          vec4 mv=modelViewMatrix*vec4(p.xyz,1.0);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=clamp(uBoyut*uPR*(0.5+aR)*(14.0/max(-mv.z,0.5)),1.0,24.0);
        }`,
      fragmentShader: /* glsl */ `uniform float uParlak; varying float vA; varying float vR;
        void main(){ float d=length(gl_PointCoord-0.5); float a=(1.0-smoothstep(0.1,0.5,d))*vA; if(a<0.01) discard;
          vec3 c=mix(vec3(1.0,0.78,0.35),vec3(1.0,0.93,0.7),vR)*uParlak; gl_FragColor=vec4(c*a,1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.nokta = new THREE.Points(g, this.mat);
    this.nokta.frustumCulled = false;
  }
  guncelle(dt, zaman) {
    const d = Math.min(dt, 1 / 30);
    this.ku.uDt.value = d; this.hu.uDt.value = d;
    this.ku.uZaman.value = zaman; this.hu.uZaman.value = zaman;
    this.gpu.compute();
    this.u.tKonum.value = this.gpu.getCurrentRenderTarget(this.kV).texture;
  }
  yokEt() { this.gpu.dispose(); }
}

export class B4Cift extends Bolum {
  kur() {
    this.gokKur({ ayar: 'altin', ay: { yas: this.bilgi.ay, boyut: 2.6, az: 150, yuk: 24, egim: 0.3, parlak: 1.6 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 14] });
    this.sahne.add(this.zemin.grup);
    ERKEK.y = this.zemin.yukseklik(ERKEK.x, ERKEK.z);
    DISI.y = this.zemin.yukseklik(DISI.x, DISI.z);
    const uzak = [];
    for (let i = 0; i < 9; i++) {
      const x = -70 + i * 18 + Math.sin(i * 5) * 6, z = -50 - (i % 3) * 16;
      uzak.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.2, boy: 7 + (i % 3) * 1.5, yaw: i * 0.7, yaprak: 16, egilme: 0.05 });
    }
    this.agaclar = new Hurma(this.atmo, [
      { x: ERKEK.x, z: ERKEK.z, y: ERKEK.y, boy: 9.5, egilme: -0.05, yaw: 0.3, yaprak: 26 },
      { x: DISI.x, z: DISI.z, y: DISI.y, boy: 8.8, egilme: 0.06, yaw: 2.2, yaprak: 26 },
      ...uzak,
    ], { yaprakCift: 30 });
    this.sahne.add(this.agaclar.grup);
    this.erkekTepe = this.agaclar.tepe(0);
    this.disiTepe = this.agaclar.tepe(1);

    // erkek çiçek salkımları (toz kaynakları)
    this.kaynaklar = [];
    const r = rastgele(44);
    const erkekSalkim = [];
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + i * 0.6;
      const yon = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const s = new Salkim(this.atmo, { taban: this.erkekTepe.clone().add(new THREE.Vector3(0, -0.5, 0)).addScaledVector(yon, 0.25), yon, sapBoy: 0.9, telSayisi: 22, telBoy: 0.45, meyveTel: 6, meyve: false, tohum: 10 + i, telRenk: '#e9d9a8', meyveBoy: 0.05 });
      s.u.uIsima.value = 0.12;
      this.sahne.add(s.grup);
      erkekSalkim.push(s);
      this.kaynaklar.push(s.uc.clone().add(new THREE.Vector3(0, -0.2, 0)));
    }
    this.erkekSalkim = erkekSalkim;
    // dişi salkımlar (7) ve kınları
    this.salkimlar = [];
    for (let i = 0; i < 7; i++) {
      const a = -1.45 + i * 0.48 + (r() - 0.5) * 0.08;
      const yon = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
      const taban = this.disiTepe.clone().add(new THREE.Vector3(0, -0.55 - (i % 2) * 0.25, 0)).addScaledVector(yon, 0.25);
      const s = new Salkim(this.atmo, { taban, yon, sapBoy: 1.35 + r() * 0.35, telSayisi: 20, telBoy: 0.55, meyveTel: 5, meyve: false, tohum: 30 + i, telRenk: '#d9c27a', meyveBoy: 0.045 });
      s.dolum = 0; s.tutustu = false;
      s.merkez = s.sapEgri.getPoint(0.85).add(new THREE.Vector3(0, -0.3, 0));
      this.sahne.add(s.grup);
      // kın (tal‘): iki yarım tekne, açılır
      const kin = this._kin(taban, yon);
      s.kin = kin;
      this.salkimlar.push(s);
    }

    // toz (GPU)
    this.toz = new TozSistemi(this.oyun.renderer, this.atmo, this.oyun.kalite.parcacik);
    this.toz.ku.uKaynak.value.forEach((v, i) => v.copy(this.kaynaklar[i]));
    this.sahne.add(this.toz.nokta);
    this.temizlikEkle(() => this.toz.yokEt());
    this.bulut = this.kaynaklar[1].clone().add(new THREE.Vector3(1, 0.5, 0.5));
    this.bulutHiz = new THREE.Vector3();
    this.bulutHedef = this.bulut.clone();
    this.gecmis = [];
    this.isilti = new Patlama(600, { renk: '#ffd27a', parlak: 2.6, boyut: 6, hizMin: 1, hizMax: 5, koni: 1, yercekim: -1.5, sure: 2 });
    this.sahne.add(this.isilti.nesne);
    this.zerre = new Zerreler(Math.round(500 * this.oyun.kalite.parcacik), { boyut: new THREE.Vector3(40, 14, 24), renk: '#ffd9a0', parlak: 0.5, nokta: 1.4 });
    this.zerre.nesne.position.set(0, 7, 2);
    this.sahne.add(this.zerre.nesne);

    // kamera
    this.rig.fov = 37;
    this.rig.paralaks = 0.8;
    const orta = new THREE.Vector3(-0.5, 7, 0);
    this.rig.ucus([new THREE.Vector3(-14, 2.5, 26), new THREE.Vector3(-4, 4, 24), new THREE.Vector3(0.6, 5.0, 23.5)],
      [orta.clone().add(new THREE.Vector3(-4, 1, 0)), orta.clone()], 6, { yumusat: yumusak.dis });
    this.duzlem = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.8);
    this.imlecGoster = false;
    this.ui.baslik(4, this.bilgi.ad, this.bilgi.alt, SATIRLAR[4]);
    this.ui.etiket('fahl', { icerik: 'fahl', nokta: this.erkekTepe.clone().add(new THREE.Vector3(0.5, -1.2, 1)), dx: -40, dy: -140 });
    this.ui.etiket('disi', { icerik: 'disi', nokta: this.disiTepe.clone().add(new THREE.Vector3(0.4, -1.8, 1)), dx: 60, dy: -150 });
    this.ui.etiket('tal', { icerik: 'tal', nokta: this.salkimlar[3].merkez, dx: 120, dy: 90 });
    this.ui.etiket('telkih', { icerik: 'telkih', nokta: new THREE.Vector3(-0.5, 8.5, 0), dx: -30, dy: -110 });
    this.ui.etiket('ciftci', { icerik: 'ciftci', nokta: this.erkekTepe.clone().add(new THREE.Vector3(0, -3, 0.5)), dx: -60, dy: 160, genis: true });
    this.ses.hedef.ruzgar = 0.2;
    this._v = new THREE.Vector3();
    this.evreye('tanitim');
  }

  _kin(taban, yon) {
    const g = new THREE.SphereGeometry(1, 16, 10, 0, Math.PI, 0, Math.PI);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...this.atmo.u },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${ISIK_UNIFORMLARI}${AYDINLATMA} varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N; vec3 V=normalize(cameraPosition-vD);
          vec3 c=aydinlat(gl_FrontFacing?vec3(0.5,0.42,0.22):vec3(0.85,0.75,0.5),N,V,0.4,0.6,0.5); gl_FragColor=vec4(sisle(c,vD),1.0); }`,
      side: THREE.DoubleSide,
    });
    const kin = new THREE.Group();
    kin.position.copy(taban).addScaledVector(yon, 0.55).add(new THREE.Vector3(0, -0.25, 0));
    kin.lookAt(kin.position.clone().addScaledVector(yon, 1).add(new THREE.Vector3(0, -0.6, 0)));
    const yarilar = [];
    for (const s of [1, -1]) {
      const pv = new THREE.Group();
      const m = new THREE.Mesh(g, mat);
      m.scale.set(0.13, 0.11, 0.6);
      m.rotation.z = s > 0 ? 0 : Math.PI;
      pv.add(m);
      kin.add(pv);
      yarilar.push(pv);
    }
    kin.yarilar = yarilar;
    this.sahne.add(kin);
    return kin;
  }

  evreBasladi(e) {
    if (e === 'aksiyon') {
      this.ui.baslikGizle();
      for (const k of ['fahl', 'disi', 'tal', 'telkih']) this.ui.etiketAc(k, false);
      this.ui.ipucu(IPUCLARI[4].a);
      this.imlecGoster = true;
      this.ses.hedef.ruzgar = 0.4;
    }
    if (e === 'sukun') {
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.imlecGoster = false;
      this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.ui.etiketAc('ciftci', false);
      this.ses.hedef.ruzgar = 0.12;
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(-2, 4, 24), new THREE.Vector3(-1, 3.2, 27)],
        [this.rig.bak.clone(), new THREE.Vector3(0, 6.5, 0)], 6, { fovlar: [this.rig.fov, 38], yumusat: yumusak.icDisSin });
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.zerre.guncelle(dt, this.t);
    this.isilti.guncelle(dt);
    const ruz = this.agaclar.u.uRuzgar.value;
    ruz.set(0.3, 0, 0.1);
    // kınların açılması (tanıtım)
    const ac = ss(1.5, 5, this.t);
    for (const s of this.salkimlar) {
      s.kin.yarilar[0].rotation.z = ac * 0.9; s.kin.yarilar[1].rotation.z = -ac * 0.9;
      s.grup.scale.setScalar(1);
      s.u.uIsima.value = yaklas(s.u.uIsima.value, s.tutustu ? 0.55 + 0.1 * Math.sin(this.t * 3 + s.merkez.x) : s.dolum * 0.25, 3, dt);
    }

    if (this.evre === 'tanitim') {
      if (this.et > 2.5) this.ui.etiketAc('fahl');
      if (this.et > 3.3) this.ui.etiketAc('disi');
      if (this.et > 4.4) this.ui.etiketAc('tal');
      if (this.et > 5.4) this.ui.etiketAc('telkih');
      this.toz.ku.uSalim.value = ss(3, 7, this.et) * 0.25;
      this.bulutHedef.copy(this.kaynaklar[1]).add(new THREE.Vector3(1.5 + Math.sin(this.t) * 0.5, 0.3, 0.8));
      if (this.et > 9) this.evreye('aksiyon');
    }

    if (this.evre === 'aksiyon') this._aksiyon(dt);
    if (this.evre === 'sukun') {
      this.toz.ku.uSalim.value = yaklas(this.toz.ku.uSalim.value, 0.05, 1, dt);
      this.toz.hu.uYayil.value = yaklas(this.toz.hu.uYayil.value, 9, 0.5, dt);
      this.toz.hu.uCekim.value = yaklas(this.toz.hu.uCekim.value, 0.05, 1, dt);
      ruz.set(0.15, 0, 0.05);
      if (this.et > 7) this.bitir();
    }

    // bulut: yay-sönüm ile hedefe
    this.bulutHiz.addScaledVector(this._v.copy(this.bulutHedef).sub(this.bulut), 10 * dt);
    this.bulutHiz.multiplyScalar(Math.exp(-4 * dt));
    this.bulut.addScaledVector(this.bulutHiz, dt);
    this.toz.hu.uBulut.value.copy(this.bulut);
    this.toz.guncelle(dt, this.t);
    // imleç rüzgârı yaprakları da iter
    this.agaclar.u.uImlecRuzgar.value.set(this.bulut.x, this.bulut.y, this.bulut.z, this.evre === 'aksiyon' ? Math.min(2.5, this.bulutHiz.length() * 0.4) : 0);
    // gecikmeli bulut merkezi (tozun gerçekten vardığı yer)
    this.gecmis.push(this.bulut.clone());
    if (this.gecmis.length > 20) this.gecmis.shift();
  }

  _aksiyon(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    this.toz.ku.uSalim.value = yaklas(this.toz.ku.uSalim.value, 1, 1.5, dt);
    const h = g.duzlem(this.kamera, this.duzlem, this._v);
    if (h) this.bulutHedef.copy(h);
    this.bulutHedef.y = THREE.MathUtils.clamp(this.bulutHedef.y, 3, 13);
    this.bulutHedef.x = THREE.MathUtils.clamp(this.bulutHedef.x, -12, 12);
    // kamera: bulutu hafifçe izler
    if (!this.rig.ucusu) {
      this.rig.bak.lerp(this._v.set(this.bulut.x * 0.35 - 0.3, 7 + (this.bulut.y - 7) * 0.25, 0), 1 - Math.exp(-dt * 1.2));
      this.rig.fov = yaklas(this.rig.fov, 38 - Math.min(4, this.bulutHiz.length() * 0.3), 2, dt);
    }
    const gec = this.gecmis[0] || this.bulut;
    let dolu = 0, sonraki = null, enYakin = 1e9;
    for (const s of this.salkimlar) {
      const d = Math.hypot(gec.x - s.merkez.x, gec.y - s.merkez.y, (gec.z - s.merkez.z) * 0.3);
      if (!s.tutustu) {
        s.dolum = Math.min(1, s.dolum + dt * 0.32 * ss(1.9, 0.5, d));
        if (s.dolum >= 1) {
          s.tutustu = true;
          this.isilti.patlat(s.merkez);
          this.ses.cinlama(this.salkimlar.filter((x) => x.tutustu).length * 2);
          this.rig.vur(-1.5);
          this.fx.uFlas.value = Math.max(this.fx.uFlas.value, 0.08);
        }
        const db = this.bulut.distanceTo(s.merkez);
        if (db < enYakin) { enYakin = db; sonraki = s; }
      } else dolu++;
    }
    // bilgi etiketi aksiyonun ortasında
    if (dolu >= 2 && !this._ciftciAcildi) { this._ciftciAcildi = this.et; this.ui.etiketAc('ciftci'); }
    if (this._ciftciAcildi && this.et - this._ciftciAcildi > 14) this.ui.etiketAc('ciftci', false);
    this.ui.ilerleme(dolu / 7);
    // yardımcı: bir sonraki salkımın ekrandaki yeri
    if (sonraki) {
      const n = sonraki.merkez.clone().project(this.kamera);
      g.otoHedef = new THREE.Vector2(THREE.MathUtils.clamp(n.x, -0.95, 0.95), THREE.MathUtils.clamp(n.y, -0.95, 0.95));
      g.otoHiz = 0.6; g.bekleme = 2.5;
    }
    this.ses.hedef.ruzgar = 0.25 + Math.min(0.5, this.bulutHiz.length() * 0.06);
    if (dolu === 7) this.evreye('sukun');
    if (this.et > 90) { for (const s of this.salkimlar) s.dolum = 1; }
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('aksiyon');
    else if (this.evre === 'aksiyon') for (const s of this.salkimlar) s.dolum = 0.99;
  }
  testDurum() { return { tutusan: this.salkimlar.filter((s) => s.tutustu).length, toz: this.toz.sayi }; }
}
