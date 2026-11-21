// 02 · Kök — "Dalış"
// Tanıtım: toprağın kesiti; çekirdek çatlar, kök ucu aşağı iner.
// Aksiyon: kamera ışıyan kök ucuyla katmanların içinden aşağı dalar; imleç ucu
// yönlendirir: taşlardan sıyrıl (kıvılcım + yavaşlama), üç su damarına ulaş.
// Final: kamera kök boyunca yukarı fırlar; yüzeyde ilk yaprak kumu deler.
import * as THREE from 'three';
import { Bolum, sat, ss, karis, yaklas, rastgele } from './temel.js';
import { Zemin } from '../dunya/zemin.js';
import { GURULTU } from '../dunya/glsl.js';
import { HizCizgileri, Patlama, Zerreler } from '../fx/parcacik.js';
import { SATIRLAR, IPUCLARI } from '../icerik.js';
import { yumusak } from '../cekirdek/kamera.js';

const DIP = -112;
const SU = [new THREE.Vector3(5, -34, -3), new THREE.Vector3(-6, -68, 4), new THREE.Vector3(3, -100, 5)];

const TOPRAK_GLSL = /* glsl */ `
uniform vec3 uUc; uniform float uUcGuc; uniform vec3 uSuIsik[3]; uniform float uSuGuc[3];
vec3 toprakIsik(vec3 p, vec3 N){
  vec3 d=uUc-p; float r=length(d);
  vec3 c=vec3(1.0,0.62,0.3)*uUcGuc*(0.35+0.65*max(dot(N,d/r),0.0))/(1.0+r*r*0.04);
  for(int i=0;i<3;i++){ vec3 e=uSuIsik[i]-p; float q=length(e); c+=vec3(0.3,0.6,1.0)*uSuGuc[i]*(0.4+0.6*max(dot(N,e/q),0.0))/(1.0+q*q*0.03); }
  return c+vec3(0.05,0.035,0.025);
}`;

export class B2Kok extends Bolum {
  kur() {
    this.gokKur({ ayar: 'yeralti', ay: { yas: this.bilgi.ay, boyut: 2.6, az: 160, yuk: 30 } });
    this.ay.mesh.visible = false;
    this.zemin = new Zemin(this.atmo, { duz: [0, 0, 8] });
    this.zemin.grup.visible = false;
    this.sahne.add(this.zemin.grup);
    const r = rastgele(21);
    this.tu = {
      uUc: { value: new THREE.Vector3(0, -2, 0) }, uUcGuc: { value: 1 },
      uSuIsik: { value: SU.map((v) => v.clone()) }, uSuGuc: { value: [0.25, 0.25, 0.25] }, uZaman: this.atmo.u.uZaman,
    };
    // katmanlar: içten görülen silindir
    this.katman = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 140, 64, 40, true), new THREE.ShaderMaterial({
      uniforms: this.tu,
      vertexShader: /* glsl */ `${GURULTU} varying vec3 vD; varying vec3 vN;
        void main(){ vec3 p=position; float n=snoise(p*0.08)*3.0+snoise(p*0.25)*0.8; p.xz*=1.0+n*0.06; vec4 w=modelMatrix*vec4(p,1.0); vD=w.xyz; vN=-normalize(vec3(position.x,0.0,position.z)); gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${GURULTU} ${TOPRAK_GLSL} varying vec3 vD; varying vec3 vN;
        void main(){
          float y=vD.y+snoise(vD*0.06)*4.0;
          float b=fract(y*0.07);
          vec3 a1=vec3(0.36,0.22,0.12), a2=vec3(0.5,0.32,0.16), a3=vec3(0.24,0.16,0.12), a4=vec3(0.55,0.25,0.12);
          vec3 alb=mix(mix(a1,a2,smoothstep(0.2,0.3,b)),mix(a3,a4,smoothstep(0.7,0.8,b)),smoothstep(0.45,0.55,b));
          alb*=0.75+0.35*(snoise(vD*0.9)*0.5+0.5);
          vec3 c=alb*toprakIsik(vD,normalize(vN));
          float uz=length(vD-cameraPosition);
          c=mix(c,vec3(0.02,0.012,0.008),1.0-exp(-uz*0.035));
          gl_FragColor=vec4(c,1.0);
        }`,
      side: THREE.BackSide,
    }));
    this.katman.position.y = -68;
    this.sahne.add(this.katman);

    // taşlar
    const n = 150;
    const taslar = [];
    const tg = new THREE.IcosahedronGeometry(1, 2);
    const pa = tg.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pa, i);
      const k = 1 + 0.22 * Math.sin(v.x * 4.1 + v.y * 2.3) * Math.cos(v.z * 3.7) + 0.1 * Math.sin(v.y * 9);
      pa.setXYZ(i, v.x * k, v.y * k * 0.75, v.z * k);
    }
    tg.computeVertexNormals();
    this.tasMat = new THREE.ShaderMaterial({
      uniforms: this.tu,
      vertexShader: /* glsl */ `varying vec3 vD; varying vec3 vN; void main(){ vec4 w=modelMatrix*instanceMatrix*vec4(position,1.0); vD=w.xyz; vN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${GURULTU} ${TOPRAK_GLSL} varying vec3 vD; varying vec3 vN;
        void main(){ vec3 N=normalize(vN); vec3 alb=vec3(0.18,0.16,0.16)*(0.7+0.5*(snoise(vD*2.0)*0.5+0.5));
          vec3 c=alb*toprakIsik(vD,N)*1.4; vec3 V=normalize(cameraPosition-vD);
          c+=vec3(1.0,0.6,0.3)*uUcGuc*pow(1.0-max(dot(N,V),0.0),3.0)*0.15/(1.0+pow(length(uUc-vD),2.0)*0.05);
          float uz=length(vD-cameraPosition); c=mix(c,vec3(0.02,0.012,0.008),1.0-exp(-uz*0.035)); gl_FragColor=vec4(c,1.0); }`,
    });
    this.taslar = new THREE.InstancedMesh(tg, this.tasMat, n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const y = -8 - r() * 100;
      // sapma yolundan biraz uzak ama dalışta karşılaşılacak kadar yakın
      const a = r() * Math.PI * 2, rad = 1.5 + Math.pow(r(), 0.7) * 13;
      const p = new THREE.Vector3(Math.cos(a) * rad, y, Math.sin(a) * rad);
      const sc = 0.6 + r() * 1.8;
      q.setFromEuler(new THREE.Euler(r() * 3, r() * 3, r() * 3));
      s.set(sc, sc, sc);
      m.compose(p, q, s);
      this.taslar.setMatrixAt(i, m);
      taslar.push({ p, r: sc * 0.95 });
    }
    this.tasListe = taslar;
    this.sahne.add(this.taslar);

    // su damarları
    this.sular = SU.map((p, i) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({
        uniforms: { uGuc: { value: 0.35 }, uZaman: this.atmo.u.uZaman },
        vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
        fragmentShader: /* glsl */ `${GURULTU} uniform float uGuc,uZaman; varying vec3 vN; varying vec3 vD;
          void main(){ vec3 V=normalize(cameraPosition-vD); float f=pow(1.0-abs(dot(normalize(vN),V)),1.5);
            float n=snoise(vD*0.6+vec3(0.0,0.0,uZaman*0.6))*0.5+0.5;
            vec3 c=vec3(0.25,0.6,1.0)*(0.08+f*1.2+n*0.3)*uGuc*smoothstep(2.0,9.0,length(vD-cameraPosition)); gl_FragColor=vec4(c,1.0); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      mesh.position.copy(p);
      mesh.scale.set(4.5, 1.1, 3.2);
      mesh.rotation.y = i * 1.3;
      this.sahne.add(mesh);
      return { mesh, p, alindi: false };
    });
    this.suPatlama = new Patlama(1500, { renk: '#7cc4ff', parlak: 2.2, boyut: 8, hizMin: 3, hizMax: 14, koni: 1, yercekim: -2, sure: 2.2 });
    this.kivilcim = new Patlama(260, { renk: '#ffc070', parlak: 3, boyut: 6, hizMin: 2, hizMax: 9, koni: 1, yercekim: -3, sure: 0.9 });
    this.sahne.add(this.suPatlama.nesne, this.kivilcim.nesne);

    // çekirdek (kesitte) + kök ucu
    const cek = new THREE.SphereGeometry(1, 32, 20);
    cek.scale(0.32, 0.28, 0.7);
    this.cekirdek = new THREE.Mesh(cek, new THREE.ShaderMaterial({
      uniforms: { uAc: { value: 0 } },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vL; void main(){ vL=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `uniform float uAc; varying vec3 vN; varying vec3 vL;
        void main(){ float l=max(dot(normalize(vN),normalize(vec3(0.3,0.8,0.6))),0.0);
          vec3 c=vec3(0.45,0.3,0.18)*(0.25+0.9*l); float yar=exp(-pow(vL.x/0.02,2.0))*step(vL.y,0.0)*uAc;
          c+=vec3(1.0,0.75,0.4)*yar*3.0; gl_FragColor=vec4(c,1.0);} `,
    }));
    this.cekirdek.position.set(0, -1.6, 0);
    this.cekirdek.rotation.y = 0.5;
    this.sahne.add(this.cekirdek);
    this.uc = new THREE.Vector3(0, -1.9, 0);
    this.ucIsik = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.2, 1.2) }));
    this.sahne.add(this.ucIsik);
    this.kokMat = new THREE.ShaderMaterial({
      uniforms: this.tu,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${TOPRAK_GLSL} varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          vec3 c=vec3(0.85,0.72,0.52)*toprakIsik(vD,N)*1.3+vec3(1.0,0.7,0.4)*pow(1.0-max(dot(N,V),0.0),2.0)*0.25;
          float uz=length(vD-cameraPosition); c=mix(c,vec3(0.02,0.012,0.008),1.0-exp(-uz*0.03)); gl_FragColor=vec4(c,1.0); }`,
    });
    this.iz = [this.uc.clone()];
    this.kok = new THREE.Mesh(new THREE.BufferGeometry(), this.kokMat);
    this.kok.frustumCulled = false;
    this.sahne.add(this.kok);
    this.dallar = new THREE.Group();
    this.sahne.add(this.dallar);
    this.cizgiler = new HizCizgileri(Math.round(240 * this.oyun.kalite.parcacik + 60), { ic: 1.5, dis: 12, boy: 40, renk: '#d8a070' });
    this.sahne.add(this.cizgiler.nesne);
    this.zerre = new Zerreler(Math.round(700 * this.oyun.kalite.parcacik + 100), { boyut: new THREE.Vector3(18, 26, 18), renk: '#c08a5a', parlak: 0.5, nokta: 2 });
    this.sahne.add(this.zerre.nesne);

    // yaprak (yüzeyde)
    const yg = new THREE.ConeGeometry(0.09, 1.4, 6, 1);
    yg.translate(0, 0.7, 0);
    this.yaprak = new THREE.Mesh(yg, new THREE.ShaderMaterial({
      uniforms: { ...this.atmo.u },
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `uniform vec3 uIsikYon,uIsikRenk,uGokRenk; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          vec3 c=vec3(0.3,0.55,0.15)*(uGokRenk*0.8+uIsikRenk*max(dot(N,uIsikYon),0.0))+uIsikRenk*vec3(0.6,0.9,0.3)*pow(max(dot(V,-uIsikYon),0.0),3.0)*0.6+vec3(0.4,0.6,0.2)*pow(1.0-max(dot(N,V),0.0),3.0)*0.6;
          gl_FragColor=vec4(c,1.0);} `,
    }));
    this.yaprak.visible = false;
    this.sahne.add(this.yaprak);
    this.kumPat = new Patlama(1200, { renk: '#e2a86a', parlak: 1.1, boyut: 6, hizMin: 1, hizMax: 5, koni: 0.6, yercekim: -6, sure: 2 });
    this.sahne.add(this.kumPat.nesne);

    this.hiz = new THREE.Vector3();
    this.inis = 0;
    this.suSayi = 0;
    this.yavas = 0;
    this._v = new THREE.Vector3();
    this.rig.fov = 34;
    this.rig.paralaks = 0.4;
    this.rig.ucus([new THREE.Vector3(5, 2, 10), new THREE.Vector3(3, -1, 7.5), new THREE.Vector3(2.2, -2.2, 6)],
      [new THREE.Vector3(0, -1.5, 0), new THREE.Vector3(-1.3, -2.4, 0)], 4, { yumusat: yumusak.dis });
    this.ui.baslik(2, this.bilgi.ad, this.bilgi.alt, SATIRLAR[2]);
    this.ui.etiket('kok', { icerik: 'kokBilgi', nokta: this.uc, dx: 110, dy: 70, genis: true });
    this.imlecGoster = false;
    this.ses.hedef.ruzgar = 0.04;
    this.evreye('tanitim');
  }

  _kokGuncelle() {
    if (this.iz.length < 2) return;
    const egri = new THREE.CatmullRomCurve3(this.iz);
    const g = new THREE.TubeGeometry(egri, Math.min(180, this.iz.length * 2), 0.09, 6);
    this.kok.geometry.dispose();
    this.kok.geometry = g;
  }

  _dalEkle(o) {
    const r = rastgele(this.suSayi * 7 + 3);
    for (let k = 0; k < 6; k++) {
      const pts = [o.clone()];
      const d = new THREE.Vector3(r() - 0.5, -0.4 - r() * 0.5, r() - 0.5).normalize();
      let p = o.clone();
      for (let i = 0; i < 8; i++) { p = p.clone().addScaledVector(d, 1.2 + r()).add(new THREE.Vector3((r() - 0.5) * 0.8, -0.3, (r() - 0.5) * 0.8)); pts.push(p); }
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 5), this.kokMat);
      m.scale.setScalar(1);
      m.userData.dogum = this.t;
      m.userData.o = o.clone();
      this.dallar.add(m);
    }
  }

  evreBasladi(e) {
    if (e === 'dalis') {
      this.ui.baslikGizle();
      this.ui.etiketAc('kok', false);
      this.ui.ipucu(IPUCLARI[2].a);
      this.imlecGoster = true;
      this.ses.hedef.ruzgar = 0.1;
    }
    if (e === 'yukselis') {
      this.ui.ipucu(null); this.ui.ilerleme(null);
      this.imlecGoster = false;
      this.girdi.otoHedef = null; this.girdi.minYardim = 0;
      this.ui.etiketAc('soz', false);
      const yol = [...this.iz].reverse().filter((_, i) => i % 6 === 0).map((p) => p.clone().add(new THREE.Vector3(1.5, 0, 3)));
      yol.push(new THREE.Vector3(1.5, 1.5, 6), new THREE.Vector3(2.4, 1.6, 6.2));
      this.rig.ucus(yol, [this.uc.clone(), new THREE.Vector3(0, -20, 0), new THREE.Vector3(0, 0.6, 0)], 3.2, { yumusat: yumusak.icDis, fovlar: [60, 38] });
      this.ses.hava(1.2);
      this.rig.vur(10);
    }
  }

  guncelle(dt) {
    const g = this.girdi;
    this.zerre.guncelle(dt, this.t);
    this.suPatlama.guncelle(dt); this.kivilcim.guncelle(dt); this.kumPat.guncelle(dt);
    this.ucIsik.position.copy(this.uc);
    this.tu.uUc.value.copy(this.uc);
    // dallar büyür
    for (const d of this.dallar.children) {
      const x = ss(0, 1.6, this.t - d.userData.dogum);
      d.scale.setScalar(Math.max(0.001, x));
      d.position.copy(d.userData.o).multiplyScalar(1 - x);
    }
    for (let i = 0; i < 3; i++) {
      const su = this.sular[i];
      this.tu.uSuGuc.value[i] = yaklas(this.tu.uSuGuc.value[i], su.alindi ? 1.4 : 0.3 + 0.08 * Math.sin(this.t * 2 + i), 3, dt);
      su.mesh.material.uniforms.uGuc.value = this.tu.uSuGuc.value[i];
    }

    if (this.evre === 'tanitim') {
      this.cekirdek.material.uniforms.uAc.value = ss(1.5, 3.5, this.et);
      // kök ucu çatlaktan aşağı
      this.uc.y = karis(-1.9, -4.2, ss(3, 8, this.et));
      if (this.et > 3) { this.iz.push(this.uc.clone()); if (this.iz.length > 3) this.iz.splice(1, 1); this._kokGuncelle(); }
      if (this.et > 4.5) this.ui.etiketAc('kok');
      this.rig.bak.lerp(this._v.set(-1.3, this.uc.y * 0.6 - 1, 0), 1 - Math.exp(-dt));
      if (this.et > 9) {
        this.iz = [new THREE.Vector3(0, -1.9, 0), this.uc.clone()];
        this.evreye('dalis');
      }
    }

    if (this.evre === 'dalis') this._dalis(dt);
    if (this.evre === 'yukselis') this._yukselis(dt);
  }

  _dalis(dt) {
    const g = this.girdi;
    g.minYardim = ss(22, 42, this.et) * 0.8;
    const U = this.uc;
    this.yavas = Math.max(0, this.yavas - dt);
    const ilerleme = ss(0, 1, sat(-U.y / -DIP));
    const asagi = karis(2.4, 4.8, ilerleme) * (this.yavas > 0 ? 0.35 : 1) * (this.suSayi === 3 ? 0 : 1);
    // imleç: yatay hız (ekran sağı = +x, ekran yukarı = -z)
    const k = 7;
    this.hiz.x = yaklas(this.hiz.x, g.etkin.x * k, 3, dt);
    this.hiz.z = yaklas(this.hiz.z, -g.etkin.y * k, 3, dt);
    U.x += this.hiz.x * dt; U.z += this.hiz.z * dt;
    U.y -= asagi * dt;
    U.x = THREE.MathUtils.clamp(U.x, -16, 16); U.z = THREE.MathUtils.clamp(U.z, -16, 16);
    // taş çarpışması: kıvılcım, itilme, yavaşlama
    for (const t of this.tasListe) {
      const d = this._v.copy(U).sub(t.p);
      const L = d.length();
      if (L < t.r + 0.15) {
        U.addScaledVector(d.normalize(), t.r + 0.16 - L);
        if (!t.vurdu || this.t - t.vurdu > 1) {
          t.vurdu = this.t;
          this.kivilcim.patlat(U);
          this.ses.kivilcim();
          this.rig.sars(0.25);
          this.yavas = 0.7;
        }
      }
    }
    // su damarları: sırayla
    const hedefSu = this.sular.find((s) => !s.alindi);
    if (hedefSu) {
      const d = this._v.copy(U).sub(hedefSu.p);
      // damar katmanını geçtiyse ve çok uzaksa, ucu yavaşça ona çek (kaybetmek yok)
      if (U.y < hedefSu.p.y + 2) { U.x = karis(U.x, hedefSu.p.x, 1 - Math.exp(-dt * 1.5)); U.z = karis(U.z, hedefSu.p.z, 1 - Math.exp(-dt * 1.5)); U.y = Math.max(U.y, hedefSu.p.y - 1); }
      if (d.x * d.x / 16 + d.y * d.y / 2 + d.z * d.z / 9 < 1) {
        hedefSu.alindi = true;
        this.suSayi++;
        this.suPatlama.patlat(hedefSu.p);
        this.fx.uFlas.value = 0.25;
        this.rig.sars(0.4); this.rig.vur(-5);
        this.ses.cinlama(this.suSayi * 3); this.ses.hedef.su = 0.6;
        this._dalEkle(U.clone());
        if (this.suSayi === 1) {
          this.ui.etiket('soz', { icerik: 'ayakSuda', nokta: hedefSu.p.clone(), dx: -120, dy: -100 });
          this.ui.etiketAc('soz');
          this._sozT = this.t;
        }
        if (this.suSayi === 3) this.evreye('yukselis');
      }
      // yardımcı: damarın üstüne yönel
      g.otoHedef = new THREE.Vector2(THREE.MathUtils.clamp((hedefSu.p.x - U.x) / 6, -0.9, 0.9), THREE.MathUtils.clamp(-(hedefSu.p.z - U.z) / 6, -0.9, 0.9));
      g.bekleme = 2.0;
    }
    if (this._sozT && this.t - this._sozT > 14) this.ui.etiketAc('soz', false);
    this.ses.hedef.su = yaklas(this.ses.hedef.su, 0, 0.8, dt);
    // iz
    const son = this.iz[this.iz.length - 1];
    if (son.distanceTo(U) > 0.5) { this.iz.push(U.clone()); this._kokGuncelle(); }
    // kamera: yukarıdan arkadan, tünele bakar
    this.rig.poz.set(U.x * 0.85, U.y + 7.5, U.z + 5.5);
    this.rig.bak.set(U.x, U.y - 5, U.z - 1);
    this.rig.fov = yaklas(this.rig.fov, 48 + asagi * 2.2, 2, dt);
    this.cizgiler.nesne.position.copy(U);
    this.cizgiler.guncelle(dt, asagi * 3);
    this.zerre.nesne.position.copy(U);
    this.zerre.u.uAkis.value.set(0, -U.y, 0);
    this.fx.uHiz.value = Math.min(0.35, asagi / 18);
    this.ses.hedef.hiz = asagi / 8;
    this.ui.ilerleme(this.suSayi / 3);
    if (this.et > 80) for (const s of this.sular) if (!s.alindi) { s.alindi = true; this.suSayi++; if (this.suSayi === 3) this.evreye('yukselis'); }
  }

  _yukselis(dt) {
    this.fx.uHiz.value = this.rig.ucusu ? 0.5 * (1 - this.rig.ucusIlerleme()) : 0;
    this.ses.hedef.hiz = this.rig.ucusu ? 0.8 : 0;
    // yüzeye çıkınca dünya değişir
    const ustte = this.kamera.position.y > 0;
    if (ustte && !this._yuzey) {
      this._yuzey = true;
      this.atmo.ayarla('alacakaranlik');
      this.zemin.grup.visible = true;
      this.ay.mesh.visible = true;
      this.katman.visible = false; this.taslar.visible = false;
      for (const s of this.sular) s.mesh.visible = false;
      this.cizgiler.nesne.visible = false; this.zerre.nesne.visible = false;
      this.yaprak.visible = true;
      this.yaprak.position.set(0, this.zemin.yukseklik(0, 0) - 1.3, 0);
      this.kumPat.patlat(new THREE.Vector3(0, this.zemin.yukseklik(0, 0), 0));
      this.yaprakT = this.et;
      this.fx.uFlas.value = 0.3;
    }
    if (this._yuzey) {
      const x = ss(0, 2.5, this.et - this.yaprakT);
      this.yaprak.position.y = this.zemin.yukseklik(0, 0) - 1.3 + x * 1.25;
      this.yaprak.rotation.z = Math.sin(this.t * 1.3) * 0.04;
      if (this.et - this.yaprakT > 6) this.bitir();
    }
  }

  atla() {
    if (this.evre === 'tanitim') this.evreye('dalis');
    else if (this.evre === 'dalis') { const s = this.sular.find((x) => !x.alindi); if (s) this.uc.copy(s.p); }
  }
  testDurum() { return { derinlik: +this.uc.y.toFixed(1), su: this.suSayi }; }
}
