// 01 · Çekirdek — "Düşüş"
// Tanıtım: boşlukta dönen dev çekirdek (kıtmîr, nakîr, fetîl).
// Aksiyon: çekirdek gökten çöle düşer; imleç onu rüzgâr şeritlerinin arasından
// ışıyan toprağa yönlendirir. Çarpış: kum patlaması, krater, sarsıntı.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { Hurma } from '../dunya/hurma.js';
import { GURULTU } from '../dunya/glsl.js';
import { HizCizgileri, Patlama, Zerreler } from '../fx/parcacik.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { ndc } from '../cekirdek/girdi.js';
import { yumusak } from '../cekirdek/kamera.js';

const BASLANGIC = new THREE.Vector3(26, 250, 66);
const HEDEF = new THREE.Vector3(0, 0, 0);
const DUSUS_SURE = 30;

// ---------- çekirdek geometrisi ----------
function cekirdekGeo(sisir = 0) {
  const g = new THREE.SphereGeometry(1, 160, 100);
  g.rotateX(Math.PI / 2); // kutuplar z ekseninde
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  const nakir = new THREE.Vector3(0, 1, 0.08).normalize();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const th = Math.atan2(v.y, v.x);
    let d = th + Math.PI / 2; d = Math.atan2(Math.sin(d), Math.cos(d));
    const boy = ss(0.97, 0.72, Math.abs(v.z));
    const oluk = 0.42 * Math.exp(-Math.pow(d / 0.16, 2)) * boy;
    const cukur = 0.16 * Math.exp(-Math.pow(v.distanceTo(nakir) / 0.1, 2));
    const kirisik = 1 + 0.005 * Math.sin(v.z * 17.3 + th * 5.3) + 0.004 * Math.sin(v.z * 29.1 - th * 7.1 + 1.3) + 0.003 * Math.sin(th * 13.7 + v.z * 41.9 + 2.1);
    const uc = 1 - 0.18 * Math.pow(Math.abs(v.z), 5);
    const r = (1 - oluk - cukur) * kirisik * uc;
    p.setXYZ(i, v.x * 0.44 * r, v.y * 0.4 * r, v.z * 1.0 * (1 - 0.02 * oluk));
  }
  g.computeVertexNormals();
  if (sisir) {
    const n = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(i, p.getX(i) + n.getX(i) * sisir, p.getY(i) + n.getY(i) * sisir, p.getZ(i) + n.getZ(i) * sisir);
    }
  }
  return g;
}

const ISIK3 = /* glsl */ `
uniform vec3 uAYon,uARenk,uK1Yon,uK1Renk,uK2Yon,uK2Renk,uOrtam;
vec3 isik3(vec3 alb, vec3 N, vec3 V, float pr){
  float ndl=dot(N,uAYon);
  vec3 c=alb*(uOrtam*(0.6+0.4*N.y)+uARenk*clamp((ndl+0.3)/1.3,0.0,1.0));
  vec3 H=normalize(uAYon+V);
  c+=uARenk*pow(max(dot(N,H),0.0),pr)*0.35;
  float fr=pow(1.0-clamp(dot(N,V),0.0,1.0),2.5);
  c+=uK1Renk*fr*clamp(dot(N,uK1Yon)+0.4,0.0,1.0);
  c+=uK2Renk*fr*clamp(dot(N,uK2Yon)+0.4,0.0,1.0);
  return c;
}`;

class RuzgarSeridi {
  constructor(u0) {
    const g = new THREE.PlaneGeometry(1, 1, 96, 1);
    this.u = { ...u0, uFaz: { value: Math.random() * 10 }, uGenlik: { value: 6 + Math.random() * 6 }, uFrek: { value: 0.03 + Math.random() * 0.02 }, uBoy: { value: 150 }, uEn: { value: 7 }, uParlak: { value: 1 }, uVurus: { value: 0 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        uniform float uFaz,uGenlik,uFrek,uBoy,uEn,uZaman; varying vec2 vUv; varying float vKenar; varying float vYakin;
        void main(){
          vUv=uv;
          float x=(uv.x-0.5)*uBoy;
          float z=uGenlik*sin(x*uFrek+uFaz)+(uv.y-0.5)*uEn;
          float y=sin(x*0.05+uZaman*0.8+uFaz)*1.5+(uv.y-0.5)*1.2*sin(x*0.1+uZaman);
          vKenar=abs(uv.y-0.5)*2.0;
          vec4 mv=modelViewMatrix*vec4(x,y,z,1.0);
          vYakin=smoothstep(2.0,14.0,length(mv.xyz));
          gl_Position=projectionMatrix*mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uZaman,uParlak,uFaz,uVurus; varying vec2 vUv; varying float vKenar; varying float vYakin;
        void main(){
          float sr=vUv.y*7.0; float id=floor(sr); float f=fract(sr);
          float hat=1.0-smoothstep(0.04,0.22,abs(f-0.5));
          float tire=smoothstep(0.55,1.0,sin(vUv.x*(26.0+id*4.0)-uZaman*(4.0+id*0.7)+id*13.0+uFaz)*0.5+0.5);
          float akim=hat*tire;
          float kenar=(1.0-smoothstep(0.35,1.0,abs(vUv.y-0.5)*2.0));
          float uc=smoothstep(0.0,0.12,vUv.x)*(1.0-smoothstep(0.88,1.0,vUv.x));
          vec3 c=mix(vec3(0.5,0.78,1.0),vec3(1.0,0.8,0.5),vUv.y)*(0.035+akim*0.75+uVurus*1.2);
          gl_FragColor=vec4(c*kenar*uc*uParlak*vYakin,1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.frustumCulled = false;
    this.akisYonu = new THREE.Vector3();
  }
  // dünya noktasının şeride göre durumu: içeride mi
  icinde(p) {
    const yerel = this.mesh.worldToLocal(p.clone());
    if (Math.abs(yerel.y) > 3) return false;
    const L = this.u.uBoy.value;
    if (Math.abs(yerel.x) > L / 2 - 6) return false;
    const z = this.u.uGenlik.value * Math.sin(yerel.x * this.u.uFrek.value + this.u.uFaz.value);
    return Math.abs(yerel.z - z) < this.u.uEn.value / 2 + 0.8;
  }
}

class BulutKatmani {
  constructor(atmo, y, tohum) {
    const g = new THREE.PlaneGeometry(900, 900, 1, 1);
    g.rotateX(-Math.PI / 2);
    this.u = { ...atmo.u, uTohum: { value: tohum }, uAlfa: { value: 0.75 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `varying vec3 vD; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `
        ${GURULTU}
        uniform vec3 uIsikRenk,uSisRenk,uGokRenk; uniform float uTohum,uAlfa,uZaman; varying vec3 vD;
        void main(){
          vec2 p=vD.xz*0.012+uTohum;
          float n=fbm3(vec3(p,uTohum+uZaman*0.01));
          float d=smoothstep(0.05,0.55,n);
          float uz=length(vD-cameraPosition);
          float yakin=smoothstep(2.0,18.0,uz);
          float uzak=1.0-smoothstep(250.0,450.0,length(vD.xz-cameraPosition.xz));
          vec3 c=mix(uGokRenk*0.9,uIsikRenk*0.85+uSisRenk*0.4,smoothstep(0.1,0.8,n));
          gl_FragColor=vec4(c,d*uAlfa*yakin*uzak*0.8);
        }`,
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.position.y = y;
    this.mesh.frustumCulled = false;
  }
}

export class B1Cekirdek extends Bolum {
  kur() {
    this.gokKur({ ayar: 'alacakaranlik', ay: { yas: this.bilgi.ay, boyut: 2.6, az: 173, yuk: 15, egim: -0.45 } });
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 9] });
    this.zemin.u.uNem.value.set(HEDEF.x, HEDEF.z, 7, 1);
    this.zemin.u.uNemRenk.value.set('#ffc46a').multiplyScalar(2.2);
    this.sahne.add(this.zemin.grup);
    // uzakta birkaç ağaç
    const agac = [];
    for (let i = 0; i < 6; i++) {
      const x = -30 + i * 13 + Math.sin(i * 7) * 5, z = -70 - (i % 3) * 18;
      agac.push({ x, z, y: this.zemin.yukseklik(x, z) - 0.3, boy: 7 + (i % 3), yaw: i * 1.3, yaprak: 18, egilme: 0.05 });
    }
    this.uzakAgac = new Hurma(this.atmo, agac, { yaprakCift: 22 });
    this.sahne.add(this.uzakAgac.grup);

    // ---- çekirdek ----
    this.lu = {
      uAYon: { value: new THREE.Vector3(-0.75, 0.62, -0.1).normalize() }, uARenk: { value: new THREE.Color('#ffd2a0').multiplyScalar(1.15) },
      uK1Yon: { value: new THREE.Vector3(0.85, 0.25, -0.5).normalize() }, uK1Renk: { value: new THREE.Color('#8fb4ff').multiplyScalar(2.4) },
      uK2Yon: { value: new THREE.Vector3(-0.6, -0.4, -0.7).normalize() }, uK2Renk: { value: new THREE.Color('#ff9446').multiplyScalar(2.2) },
      uOrtam: { value: new THREE.Color('#0b0a12') },
      uVurgu: { value: new THREE.Vector3() }, uZaman: this.atmo.u.uZaman, uKor: { value: 0 },
    };
    this.tohumMat = new THREE.ShaderMaterial({
      uniforms: this.lu,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vP; varying vec3 vL; varying vec3 vD;
        void main(){ vL=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `
        ${GURULTU}
        ${ISIK3}
        uniform vec3 uVurgu; uniform float uKor;
        varying vec3 vN; varying vec3 vL; varying vec3 vD;
        void main(){
          vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          float th=atan(vL.y,vL.x);
          float cizgi=snoise(vec3(vL.z*2.2,th*2.5,0.0))*0.5+0.5;
          float ince=snoise(vec3(vL*26.0));
          vec3 alb=mix(vec3(0.36,0.24,0.14),vec3(0.55,0.4,0.26),cizgi)*(0.88+0.12*ince);
          float oluk=exp(-pow((th+1.5708)/0.25,2.0));
          alb*=1.0-0.45*oluk;
          vec3 c=isik3(alb,N,V,24.0);
          // nakîr: uyanan filiz ışıması
          float nk=exp(-pow(length(vL-vec3(0.0,0.36,0.08))/0.07,2.0));
          c+=vec3(1.0,0.72,0.35)*nk*(uVurgu.y*2.5+uKor*1.5);
          gl_FragColor=vec4(c,1.0);
        }`,
    });
    this.zarMat = new THREE.ShaderMaterial({
      uniforms: this.lu,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; varying vec3 vL;
        void main(){ vL=position; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `
        ${GURULTU}
        uniform vec3 uVurgu,uK1Renk,uK1Yon; varying vec3 vN; varying vec3 vD; varying vec3 vL;
        void main(){
          vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          float fr=pow(1.0-abs(dot(N,V)),2.2);
          float kir=snoise(vec3(vL*9.0))*0.5+0.5;
          vec3 irid=0.5+0.5*cos(6.2831*(fr*1.3+vec3(0.0,0.33,0.67)));
          vec3 c=mix(vec3(1.0,0.95,0.88),irid,0.3)*(fr*0.32+kir*0.025)*(0.45+uVurgu.x*1.8);
          c+=uK1Renk*fr*0.12*clamp(dot(N,uK1Yon)+0.5,0.0,1.0);
          gl_FragColor=vec4(c,1.0);
        }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.tohum = new THREE.Group();
    this.donen = new THREE.Group();
    this.tohum.add(this.donen);
    this.donen.add(new THREE.Mesh(cekirdekGeo(), this.tohumMat));
    this.zar = new THREE.Mesh(cekirdekGeo(0.018), this.zarMat);
    this.donen.add(this.zar);
    // fetîl: oluktaki ipçik
    const ip = [];
    for (let i = 0; i <= 40; i++) {
      const z = -0.7 + (i / 40) * 1.4;
      ip.push(new THREE.Vector3(Math.sin(z * 9) * 0.012, -0.4 * (1 - 0.42 * ss(0.97, 0.72, Math.abs(z))) + 0.03, z));
    }
    this.fetilMat = new THREE.ShaderMaterial({
      uniforms: this.lu,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${ISIK3} uniform vec3 uVurgu; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          vec3 c=isik3(vec3(0.85,0.72,0.52),N,V,30.0)+vec3(1.0,0.85,0.6)*uVurgu.z*1.8; gl_FragColor=vec4(c,1.0); }`,
    });
    this.donen.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ip), 80, 0.013, 6), this.fetilMat));
    this.tohum.position.copy(BASLANGIC);
    this.tohum.rotation.set(0.25, Math.PI / 2 + 0.45, 0.2);
    this.sahne.add(this.tohum);
    this.capalar = {
      kitmir: { yerel: new THREE.Vector3(0.43, 0.16, -0.42), dunya: new THREE.Vector3(), n: new THREE.Vector3(1, 0.3, 0), dx: 90, dy: -80, goruldu: 0 },
      nakir: { yerel: new THREE.Vector3(0, 0.37, 0.08), dunya: new THREE.Vector3(), n: new THREE.Vector3(0, 1, 0), dx: -110, dy: -90, goruldu: 0 },
      fetil: { yerel: new THREE.Vector3(0, -0.3, 0.4), dunya: new THREE.Vector3(), n: new THREE.Vector3(0, -1, 0), dx: 100, dy: 80, goruldu: 0 },
    };
    for (const [k, c] of Object.entries(this.capalar)) this.ui.etiket(k, { icerik: k, nokta: c.dunya, dx: c.dx, dy: c.dy });

    // ---- stüdyo fonu ----
    this.fonU = { uAlfa: { value: 1 }, uZaman: this.atmo.u.uZaman };
    this.fon = new THREE.Mesh(new THREE.SphereGeometry(60, 48, 24), new THREE.ShaderMaterial({
      uniforms: this.fonU,
      vertexShader: /* glsl */ `varying vec3 vY; void main(){ vY=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `${GURULTU} uniform float uAlfa,uZaman; varying vec3 vY;
        void main(){
          vec3 d=normalize(vY);
          float isil=pow(max(dot(d,normalize(vec3(-0.3,0.1,-1.0))),0.0),3.0);
          vec3 c=mix(vec3(0.004,0.005,0.01),vec3(0.035,0.022,0.02),isil);
          c+=vec3(0.012,0.018,0.04)*pow(max(d.y,0.0),2.0);
          c+=(snoise(d*3.0+uZaman*0.02)*0.5+0.5)*0.004;
          gl_FragColor=vec4(c,uAlfa);
        }`,
      side: THREE.BackSide, transparent: true, depthWrite: false,
    }));
    this.fon.position.copy(BASLANGIC);
    this.sahne.add(this.fon);
    this.zerre = new Zerreler(Math.round(400 * this.oyun.kalite.parcacik + 100), { boyut: new THREE.Vector3(14, 8, 14), nokta: 2.2, parlak: 0.9 });
    this.zerre.nesne.position.copy(BASLANGIC);
    this.sahne.add(this.zerre.nesne);

    // ---- düşüş öğeleri ----
    this.seritler = [];
    const rnd = (a, b) => a + Math.random() * (b - a);
    const sayi = 8;
    for (let i = 0; i < sayi; i++) {
      const f = (i + 0.7) / (sayi + 0.4);
      const y = karis(BASLANGIC.y - 40, 30, f);
      const s = new RuzgarSeridi(this.atmo.u);
      // beklenen yol üstüne yerleştir
      // hedefin üstündeki sütunu kesecek biçimde (aralarından geçilir)
      const yol = new THREE.Vector3().lerpVectors(BASLANGIC, HEDEF, ss(0, 0.45, 1 - y / BASLANGIC.y));
      s.mesh.position.set(yol.x + rnd(-5, 5), y, yol.z + rnd(-5, 5));
      s.mesh.rotation.y = rnd(0, Math.PI);
      s.u.uEn.value = rnd(8, 12);
      s.u.uGenlik.value = rnd(4, 10);
      s.akisYonu.set(Math.cos(s.mesh.rotation.y), 0, -Math.sin(s.mesh.rotation.y));
      this.seritler.push(s);
      this.sahne.add(s.mesh);
    }
    this.bulutlar = [new BulutKatmani(this.atmo, 205, 1.3), new BulutKatmani(this.atmo, 130, 4.1), new BulutKatmani(this.atmo, 70, 7.7)];
    for (const b of this.bulutlar) { b.mesh.visible = false; this.sahne.add(b.mesh); }
    this.cizgiler = new HizCizgileri(Math.round(260 * this.oyun.kalite.parcacik + 60), { ic: 2.2, dis: 16, boy: 60 });
    this.sahne.add(this.cizgiler.nesne);
    this.kum = new Patlama(Math.round(5000 * this.oyun.kalite.parcacik + 800), { renk: '#e9b87e', parlak: 1.2, boyut: 9, hizMin: 4, hizMax: 26, koni: 0.75, yercekim: -16, sure: 3.5 });
    this.kivilcim = new Patlama(220, { renk: '#ffd890', parlak: 3, boyut: 7, hizMin: 2, hizMax: 9, koni: 1.0, yercekim: -2, sure: 1.2 });
    this.sahne.add(this.kum.nesne, this.kivilcim.nesne);

    this.hiz = new THREE.Vector3();
    this.itki = new THREE.Vector3();
    this.dusT = 0;
    this.vurgu = new THREE.Vector3();
    this.imlecGoster = true;
    this._v = new THREE.Vector3(); this._n = new THREE.Vector2(); this._q = new THREE.Quaternion();

    // açılış uçuşu
    this.rig.fov = 28;
    this.rig.paralaks = 0.25;
    const S = BASLANGIC;
    this.studyoKamera = new THREE.Vector3(S.x + 0.5, S.y + 0.55, S.z + 5.6);
    this.studyoBak = new THREE.Vector3(S.x - 0.95, S.y + 0.05, S.z);
    this.rig.ucus([new THREE.Vector3(S.x + 4, S.y + 2.5, S.z + 14), new THREE.Vector3(S.x + 1.5, S.y + 1, S.z + 8), this.studyoKamera],
      [new THREE.Vector3(S.x, S.y, S.z), this.studyoBak], 3.2, { yumusat: yumusak.dis });
    this.evreye('tanitim');
    this.ui.baslik(1, this.bilgi.ad, this.bilgi.alt, SATIRLAR[1]);
    this.ses.hedef.ruzgar = 0.12;
  }

  evreBasladi(e) {
    if (e === 'tanitim') setTimeout(() => this.evre === 'tanitim' && this.ui.ipucu(IPUCLARI[1].t), 2600);
    if (e === 'gecis') {
      this.ui.baslikGizle();
      this.ui.ipucu(null);
      for (const k of Object.keys(this.capalar)) this.ui.etiketAc(k, false);
      for (const b of this.bulutlar) b.mesh.visible = true;
      this.ses.hava(1);
      const S = this.tohum.position;
      const kp = this._dususKamera(new THREE.Vector3());
      const bak = this._dususBakis(new THREE.Vector3());
      this.rig.ucus([this.rig.poz.clone(), new THREE.Vector3(S.x + 3, S.y + 3, S.z + 6), kp], [this.rig.bak.clone(), new THREE.Vector3(S.x, S.y - 1, S.z), bak], 2.6,
        { fovlar: [28, 52], yumusat: yumusak.icDis });
    }
    if (e === 'dusus') {
      this.ui.ipucu(IPUCLARI[1].a);
      this.ses.hedef.ruzgar = 0.3;
      this.rig.paralaks = 0.4;
    }
  }

  _dususKamera(h) { const S = this.tohum.position; return h.set(S.x, S.y + 7.5, S.z + 7.0); }
  _dususBakis(h) { const S = this.tohum.position; return h.set(S.x, S.y - 7, S.z - 5); }

  _capalariGuncelle() {
    this.tohum.updateMatrixWorld(true);
    const kd = this._v;
    for (const c of Object.values(this.capalar)) {
      c.dunya.copy(c.yerel).applyMatrix4(this.donen.matrixWorld);
      const n = c.n.clone().transformDirection(this.donen.matrixWorld);
      kd.copy(this.kamera.position).sub(c.dunya).normalize();
      c.gorunur = n.dot(kd) > -0.05;
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.zerre.guncelle(dt, this.t);
    if (this.zemin.sirt) this.zemin.sirt.visible = this.kamera.position.y < 60;
    this.kum.guncelle(dt); this.kivilcim.guncelle(dt);
    this.uzakAgac.u.uRuzgar.value.set(0.25, 0, 0.1);
    for (const s of this.seritler) s.u.uVurus.value *= Math.exp(-dt * 3);

    if (this.evre === 'tanitim' || this.evre === 'gecis') {
      // dönen ürün
      this.donen.rotation.z += dt * 0.45;
      this.tohum.rotation.y = Math.PI / 2 + 0.45 + g.etkin.x * 0.35;
      this.tohum.rotation.x = 0.25 - g.etkin.y * 0.25;
    }
    if (this.evre === 'tanitim') {
      this._capalariGuncelle();
      // imleç üç bölgeye yaklaşınca etiket açılır
      let enYakin = null, eu = 1e9;
      const W = innerWidth, H = innerHeight;
      let gorulmemis = null;
      for (const [k, c] of Object.entries(this.capalar)) {
        ndc(c.dunya, this.kamera, this._n);
        const dx = (this._n.x - g.etkin.x) * W / 2, dy = (this._n.y - g.etkin.y) * H / 2;
        const u = Math.hypot(dx, dy);
        if (c.gorunur && u < eu) { eu = u; enYakin = k; }
        if (c.goruldu < 0.6 && c.gorunur && !gorulmemis) gorulmemis = { k, x: this._n.x, y: this._n.y };
      }
      for (const [k, c] of Object.entries(this.capalar)) {
        const acik = (k === enYakin && eu < 120 && this.et > 1.2) || (c.acikKalan > 0);
        if (k === enYakin && eu < 120 && this.et > 1.2) {
          if (!c.goruldu) { this.ses.cinlama(Object.keys(this.capalar).indexOf(k) * 4); }
          c.goruldu += dt; c.acikKalan = 1.6;
        }
        c.acikKalan = Math.max(0, (c.acikKalan || 0) - dt);
        this.ui.etiketAc(k, acik && c.gorunur);
        const hedefV = acik ? 1 : 0;
        if (k === 'kitmir') this.vurgu.x = yaklas(this.vurgu.x, hedefV, 6, dt);
        if (k === 'nakir') this.vurgu.y = yaklas(this.vurgu.y, hedefV, 6, dt);
        if (k === 'fetil') this.vurgu.z = yaklas(this.vurgu.z, hedefV, 6, dt);
      }
      this.lu.uVurgu.value.copy(this.vurgu);
      // yardımcı: görülmemiş bölgeye gider
      g.otoHedef = gorulmemis ? this._n.set(gorulmemis.x, gorulmemis.y).clone() : new THREE.Vector2(0.25, -0.1);
      g.bekleme = 2.2;
      const hepsi = Object.values(this.capalar).every((c) => c.goruldu > 0.5);
      if (hepsi && !this._hepsiT) this._hepsiT = this.et;
      if ((this._hepsiT && this.et - this._hepsiT > 2.2) || this.et > 24) this.evreye('gecis');
    }

    if (this.evre === 'gecis') {
      this.fonU.uAlfa.value = 1 - ss(0.2, 2.2, this.et);
      this.zerre.u.uAlfa.value = 1 - ss(0, 1.5, this.et);
      this.lu.uVurgu.value.multiplyScalar(Math.exp(-dt * 3));
      this._isikKaristir(ss(0.3, 2.4, this.et) * 2.5);
      if (!this.rig.ucusu) { this.fon.visible = false; this.zerre.nesne.visible = false; this.evreye('dusus'); }
    }

    if (this.evre === 'dusus') this._dusus(dt);
    if (this.evre === 'carpma') this._carpma(dt);
  }

  // stüdyo ışıklarından gökyüzü ışıklarına
  _isikKaristir(x) {
    const d = this.atmo.d;
    this.lu.uAYon.value.lerp(d.isikYon, x * 0.2).normalize();
    this.lu.uARenk.value.lerp(d.isikRenk, x * 0.2);
    this.lu.uK1Renk.value.lerp(d.kenarRenk, x * 0.2);
    this.lu.uOrtam.value.lerp(d.gokRenk, x * 0.2);
  }

  _dusus(dt) {
    const g = this.girdi;
    this.dusT += dt;
    const u = sat(this.dusT / DUSUS_SURE);
    // irtifa: hızlanarak düşer
    const yUst = BASLANGIC.y;
    const egri = 0.25 * u + 0.75 * u * u * (0.6 + 0.4 * u);
    const hedefY = karis(yUst, 0, egri);
    const dikeyHiz = (this.tohum.position.y - hedefY) / Math.max(dt, 1e-4);
    this.tohum.position.y = hedefY;
    // yatay: imleç hız verir (ekran yukarı = -z)
    const k = 10;
    const istenen = this._v.set(g.etkin.x * k, 0, -g.etkin.y * k);
    this.hiz.x = yaklas(this.hiz.x, istenen.x, 3, dt);
    this.hiz.z = yaklas(this.hiz.z, istenen.z, 3, dt);
    this.itki.multiplyScalar(Math.exp(-dt * 1.8));
    this.tohum.position.x += (this.hiz.x + this.itki.x) * dt;
    this.tohum.position.z += (this.hiz.z + this.itki.z) * dt;
    // son bölümde mıknatıs: oyuncu kaybedemez
    const m = ss(0.62, 0.97, u);
    const P = this.tohum.position;
    P.x = karis(P.x, HEDEF.x, 1 - Math.exp(-dt * m * 3.5));
    P.z = karis(P.z, HEDEF.z, 1 - Math.exp(-dt * m * 3.5));
    // yardımcı imleç: hedefe yön
    const dx = HEDEF.x - P.x, dz = HEDEF.z - P.z;
    const L = Math.hypot(dx, dz);
    g.otoHedef = new THREE.Vector2(THREE.MathUtils.clamp(dx / 30, -0.8, 0.8), THREE.MathUtils.clamp(-dz / 30, -0.8, 0.8));
    // yardımcı şeritlerden kaçınsın: yakın şeridin altındaysa yana kay
    for (const s of this.seritler) {
      const fark = P.y - s.mesh.position.y;
      if (fark > 0 && fark < 14 && s.icinde(this._v.set(P.x, s.mesh.position.y, P.z))) {
        g.otoHedef.x += 0.5 * Math.sign(g.otoHedef.x || 1);
      }
    }
    void L;
    g.bekleme = 2.0;
    // şerit çarpışması: itme + sarsıntı + kıvılcım
    for (const s of this.seritler) {
      if (s.vurdu) continue;
      if (Math.abs(P.y - s.mesh.position.y) < 2.5 && s.icinde(P)) {
        s.vurdu = true;
        const yon = s.akisYonu.clone().multiplyScalar(Math.random() < 0.5 ? -1 : 1);
        this.itki.addScaledVector(yon, 22);
        s.u.uVurus.value = 1;
        this.rig.sars(0.45); this.rig.vur(6);
        this.kivilcim.patlat(P);
        this.ses.hava(0.9);
      }
    }
    // bulut geçişi: hafif beyazlama
    for (const b of this.bulutlar) {
      const d = Math.abs(this.kamera.position.y - b.mesh.position.y);
      if (d < 6) this.fx.uFlas.value = Math.max(this.fx.uFlas.value, (1 - d / 6) * 0.18);
    }
    // takla
    this.donen.rotation.z += dt * (1.2 + u * 4);
    this.tohum.rotation.x += dt * 0.7;
    this.lu.uKor.value = u;
    // kamera
    this._dususKamera(this.rig.poz);
    this._dususBakis(this.rig.bak);
    const hiz = Math.abs(dikeyHiz);
    this.rig.fov = yaklas(this.rig.fov, 52 + Math.min(16, hiz * 0.5), 3, dt);
    this.cizgiler.nesne.position.copy(P);
    this.cizgiler.guncelle(dt, hiz);
    this.fx.uHiz.value = Math.min(0.45, hiz / 60);
    this.ses.hedef.hiz = Math.min(1, hiz / 30);
    this.ui.ilerleme(u);
    // hedefe ulaştı
    const zeminY = this.zemin.yukseklik(P.x, P.z);
    if (P.y <= zeminY + 0.4 || u >= 1) {
      P.y = zeminY + 0.4;
      this.evreye('carpma');
    }
  }

  _carpma(dt) {
    const P = this.tohum.position;
    if (this.et === dt || !this._carpti) {
      this._carpti = true;
      this.carpmaNoktasi = P.clone();
      this.fx.uFlas.value = 0.75;
      this.rig.sars(1); this.rig.vur(-10);
      this.kum.patlat(new THREE.Vector3(P.x, this.zemin.yukseklik(P.x, P.z), P.z));
      this.ses.vurus(1); this.ses.hedef.hiz = 0; this.ses.hedef.ruzgar = 0.18;
      this.fx.uHiz.value = 0;
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.girdi.otoHedef = null;
      this.imlecGoster = false;
      this.zemin.u.uKrater.value.set(P.x, P.z, 4.5, 0);
      const C = this.carpmaNoktasi;
      const yer = this.zemin.yukseklik(C.x, C.z);
      // kameraya ağır çekim yere iniş
      this.rig.ucus([
        this.rig.poz.clone(),
        new THREE.Vector3(C.x + 6, yer + 9, C.z + 12),
        new THREE.Vector3(C.x + 3.5, yer + 2.4, C.z + 13),
      ], [new THREE.Vector3(C.x, yer, C.z), new THREE.Vector3(C.x - 0.5, yer + 3.2, C.z - 12)], 4.5, { fovlar: [60, 40], yumusat: yumusak.dis });
      this.cizgiler.nesne.visible = false;
    }
    const k = this.zemin.u.uKrater.value;
    // krater açılır, sonra kum üstünü örter
    k.w = 1.6 * ss(0, 0.25, this.et) * (1 - ss(1.4, 5.5, this.et));
    const yer = this.zemin.yukseklik(P.x, P.z);
    P.y = karis(yer + 0.4, yer - 0.9, ss(0.2, 4.5, this.et));
    this.donen.rotation.z += dt * 2 * (1 - ss(0, 2, this.et));
    this.lu.uKor.value = 1 - ss(0, 3, this.et) * 0.6;
    this.zemin.u.uNem.value.w = 1 - ss(0.5, 6, this.et) * 0.65;
    this.cizgiler.guncelle(dt, 0);
    if (!this.rig.ucusu) this.rig.poz.z -= dt * 0.25;
    if (this.et > 8.5) this.bitir();
  }

  atla() {
    if (this.evre === 'tanitim') { for (const c of Object.values(this.capalar)) c.goruldu = 1; this.evreye('gecis'); }
    else if (this.evre === 'dusus') this.dusT = DUSUS_SURE * 0.9;
  }
  testDurum() { return { irtifa: +this.tohum.position.y.toFixed(1), gorulen: Object.values(this.capalar).filter((c) => c.goruldu > 0.5).length }; }
}
