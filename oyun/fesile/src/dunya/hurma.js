// Kodla üretilen hurma ağacı (tek ağaç ya da hurmalık).
// Gövde ve yapraklar instancing ile çizilir; rüzgâr, büyüme, açılma ve kopma
// vertex shader'da hesaplanır. Kare başına JS yalnızca birkaç uniform yazar.
import * as THREE from 'three';
import { GURULTU, ISIK_UNIFORMLARI, AYDINLATMA } from './glsl.js';

const ALTIN = 2.39996323;

// ---------- ortak GLSL: ağaç tepesi ve büyüme ----------
const AGAC_GLSL = /* glsl */ `
uniform float uBuyuZaman, uBuyuSure;
float buyume(float dogum){ return dogum < -500.0 ? 1.0 : clamp((uBuyuZaman-dogum)/uBuyuSure,0.0,1.0); }
vec3 yawDon(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z); }
// iAgac: taban xyz + yaw ; iAgac2: boy, yarıçap, eğilme, doğum
vec3 agacTepe(vec4 a, vec4 a2, float g){
  float H=a2.x*g;
  return a.xyz + yawDon(vec3(a2.z*H, H, 0.0), a.w);
}`;

// ---------- yaprak (palmiye yaprağı) geometrisi ----------
function yaprakGeometrisi(ciftSayisi = 34) {
  const pos = [], at = [], yan = [], idx = [];
  const ekle = (x, y, z, t, s) => { pos.push(x, y, z); at.push(t); yan.push(s); return pos.length / 3 - 1; };
  // orta damar (şerit)
  const nR = 16;
  for (let i = 0; i <= nR; i++) {
    const t = i / nR, w = 0.011 * (1 - t * 0.75);
    ekle(-w, 0.004, 0, t, 0); ekle(w, 0.004, 0, t, 0);
    if (i < nR) { const b = i * 2; idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
  }
  // yaprakçıklar (V biçiminde)
  const alfa = 0.95, beta = 0.42;
  for (let j = 0; j < ciftSayisi; j++) {
    const t0 = 0.1 + 0.88 * (j / (ciftSayisi - 1));
    const L = 0.19 * Math.pow(Math.sin(Math.PI * (0.12 + 0.86 * t0)), 0.55) * (t0 < 0.16 ? 0.6 : 1);
    const gen = 0.006 + 0.004 * Math.sin(Math.PI * t0);
    for (const s of [-1, 1]) {
      const a = alfa + (s > 0 ? 0.04 : -0.03) + Math.sin(j * 12.9) * 0.08;
      const dx = s * Math.sin(a), dz = Math.cos(a), dy = Math.tan(beta) * Math.sin(a);
      const n = Math.hypot(dx, dy, dz);
      const d = [dx / n, dy / n, dz / n];
      const b1 = ekle(s * 0.008, 0, -gen * 0.6, t0, 0.02);
      const b2 = ekle(s * 0.008, 0, gen * 0.6, t0, 0.02);
      const m1 = ekle(d[0] * L * 0.45, d[1] * L * 0.45, d[2] * L * 0.45 - gen, t0, 0.45);
      const m2 = ekle(d[0] * L * 0.45, d[1] * L * 0.45, d[2] * L * 0.45 + gen, t0, 0.45);
      const u = ekle(d[0] * L, d[1] * L - 0.02 * L, d[2] * L, t0, 1);
      idx.push(b1, m1, b2, b2, m1, m2, m1, u, m2);
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(at, 1));
  g.setAttribute('aYan', new THREE.Float32BufferAttribute(yan, 1));
  g.setIndex(idx);
  return g;
}

// ---------- gövde geometrisi (birim boy) ----------
function govdeGeometrisi(nY = 90, nR = 20) {
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= nY; i++) {
    const t = i / nY;
    for (let j = 0; j <= nR; j++) {
      const a = (j / nR) * Math.PI * 2;
      pos.push(Math.cos(a), t, Math.sin(a));
      uv.push(j / nR, t);
      if (i < nY && j < nR) {
        const b = i * (nR + 1) + j;
        idx.push(b, b + nR + 1, b + 1, b + 1, b + nR + 1, b + nR + 2);
      }
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

export class Hurma {
  /**
   * agaclar: [{x,z,y?, boy, yaricap, egilme, yaw, dogum, yaprak, kuruSayisi, renk}]
   */
  constructor(atmo, agaclar, { yaprakCift = 40, govdeY = 90, govdeR = 20 } = {}) {
    this.atmo = atmo;
    this.grup = new THREE.Group();
    this.agaclar = agaclar.map((a, i) => ({
      x: 0, z: 0, y: 0, boy: 8, yaricap: 0.34, egilme: 0.05, yaw: i * 1.7, dogum: -1000, yaprak: 26, kuruSayisi: 0, ...a,
    }));
    this.u = {
      ...atmo.u,
      uBuyuZaman: { value: 0 }, uBuyuSure: { value: 1 },
      uRuzgar: { value: new THREE.Vector3(0.25, 0, 0.1) },
      uImlecRuzgar: { value: new THREE.Vector4(0, -999, 0, 0) },
      uRontgen: { value: 0 },
      uYesil: { value: new THREE.Color('#2f4a1c') },
      uYesil2: { value: new THREE.Color('#617a2c') },
      uKuru: { value: new THREE.Color('#a8824a') },
      uGovdeRenk: { value: new THREE.Color('#6a5038') },
      uParlak: { value: 1 },
    };
    this._govde();
    this._yapraklar(yaprakCift);
  }

  _govde() {
    const n = this.agaclar.length;
    const g = govdeGeometrisi();
    const a = new Float32Array(n * 4), a2 = new Float32Array(n * 4);
    this.agaclar.forEach((t, i) => {
      a.set([t.x, t.y, t.z, t.yaw], i * 4);
      a2.set([t.boy, t.yaricap, t.egilme, t.dogum], i * 4);
    });
    g.setAttribute('iAgac', new THREE.InstancedBufferAttribute(a, 4));
    g.setAttribute('iAgac2', new THREE.InstancedBufferAttribute(a2, 4));
    g.instanceCount = n;
    this.govdeIA = g.attributes.iAgac2;
    this.govdeMat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${AGAC_GLSL}
        uniform vec3 uRuzgar; uniform float uZaman;
        attribute vec4 iAgac; attribute vec4 iAgac2;
        varying vec3 vD; varying vec3 vN; varying vec2 vUv; varying float vH;
        void main(){
          float g=buyume(iAgac2.w);
          float H=iAgac2.x*g; float t=position.y;
          float r=iAgac2.y*(0.55+0.45*g)*(1.0+0.55*exp(-t*16.0)-0.12*t);
          vec3 p=vec3(position.x*r, t*H, position.z*r);
          p.x+=iAgac2.z*H*t*t;
          float sal=sin(uZaman*0.9+iAgac.x)*0.012*H*t*t*length(uRuzgar);
          p.x+=sal;
          vec3 n=normalize(vec3(position.x, -2.0*iAgac2.z*t*0.2, position.z));
          vN=yawDon(n,iAgac.w);
          vec3 w=(modelMatrix*vec4(iAgac.xyz+yawDon(p,iAgac.w),1.0)).xyz;
          vN=normalize(mat3(modelMatrix)*vN);
          vD=w; vUv=vec2(uv.x, t*H); vH=t;
          gl_Position=projectionMatrix*viewMatrix*vec4(w,1.0);
        }`,
      fragmentShader: /* glsl */ `
        ${ISIK_UNIFORMLARI}
        ${GURULTU}
        ${AYDINLATMA}
        uniform vec3 uGovdeRenk; uniform float uRontgen,uParlak;
        varying vec3 vD; varying vec3 vN; varying vec2 vUv; varying float vH;
        float desen(vec2 uv){
          vec2 P=vec2(uv.x*9.0, uv.y/0.22);
          float sira=floor(P.y); P.x+=sira*0.5;
          vec2 f=fract(P);
          float n=snoise(vec3(floor(P)*1.7,1.0))*0.5+0.5;
          // her yaprak dibi: üstte açık, alt kenarda gölgeli bir basamak
          float basamak=smoothstep(0.0,0.35,f.y)*(0.75+0.25*n);
          float yan=smoothstep(0.0,0.12,f.x)*(1.0-smoothstep(0.88,1.0,f.x));
          float h=basamak*mix(0.75,1.0,yan);
          float fw=max(fwidth(P.x),fwidth(P.y));
          return mix(h,0.62,smoothstep(0.1,0.35,fw));
        }
        void main(){
          vec3 N=normalize(vN);
          float h=desen(vUv);
          vec3 V=normalize(cameraPosition-vD);
          float lif=mix(snoise(vec3(vUv.x*40.0,vUv.y*6.0,0.0))*0.5+0.5,0.5,smoothstep(0.2,0.6,fwidth(vUv.x*40.0)));
          vec3 alb=uGovdeRenk*(0.55+0.55*h)*(0.88+0.24*lif);
          alb=mix(alb*0.72, alb, smoothstep(0.0,0.35,h));
          vec3 c=aydinlat(alb,N,V,0.35,0.0,0.3)*uParlak;
          c=sisle(c,vD);
          if(uRontgen>0.0){
            float f=pow(1.0-abs(dot(N,V)),2.0);
            vec3 rx=vec3(0.35,0.75,1.0)*(0.08+f*1.4)*(0.6+0.4*h);
            c=mix(c,rx,uRontgen);
            gl_FragColor=vec4(c, mix(1.0, 0.35+f*0.65, uRontgen));
          } else gl_FragColor=vec4(c,1.0);
        }`,
      transparent: false,
    });
    this.govde = new THREE.Mesh(g, this.govdeMat);
    this.govde.frustumCulled = false;
    this.grup.add(this.govde);
  }

  _yapraklar(cift) {
    const g = yaprakGeometrisi(cift);
    const liste = [];
    this.agaclar.forEach((t, ti) => {
      const n = t.yaprak;
      for (let k = 0; k < n; k++) {
        const u = k / Math.max(1, n - 1); // 0 = en genç (tepe), 1 = en yaşlı
        const az = k * ALTIN + t.yaw;
        const elev = THREE.MathUtils.lerp(1.15, -0.25, Math.pow(u, 0.85)) + Math.sin(k * 7.3) * 0.08;
        const droop = THREE.MathUtils.lerp(0.35, 1.1, u) + Math.sin(k * 3.1) * 0.1;
        const L = t.boy * (t.yaprakOlcek || 1) * (0.42 + 0.1 * Math.sin(k * 1.7)) * (u < 0.1 ? 0.75 : 1);
        const kuru = k >= n - t.kuruSayisi ? 1 : 0;
        liste.push({ agac: ti, az, elev, droop: droop + kuru * 0.5, L, kuru, acilma: 1, tohum: (k * 0.618) % 1, u });
      }
    });
    this.yaprakListe = liste;
    const N = liste.length;
    const aA = new Float32Array(N * 4), aA2 = new Float32Array(N * 4), aci = new Float32Array(N * 4), dur = new Float32Array(N * 4);
    liste.forEach((y, i) => {
      const t = this.agaclar[y.agac];
      aA.set([t.x, t.y, t.z, t.yaw], i * 4);
      aA2.set([t.boy, t.yaricap, t.egilme, t.dogum], i * 4);
      aci.set([y.az, y.elev, y.droop, y.L], i * 4);
      dur.set([y.kuru, -1, y.acilma, y.tohum], i * 4);
    });
    g.setAttribute('iAgac', new THREE.InstancedBufferAttribute(aA, 4));
    g.setAttribute('iAgac2', new THREE.InstancedBufferAttribute(aA2, 4));
    g.setAttribute('iAci', new THREE.InstancedBufferAttribute(aci, 4));
    const durA = new THREE.InstancedBufferAttribute(dur, 4);
    durA.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iDurum', durA);
    g.instanceCount = N;
    this.yaprakDurum = durA;
    this.yaprakMat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${AGAC_GLSL}
        uniform vec3 uRuzgar; uniform vec4 uImlecRuzgar; uniform float uZaman;
        attribute float aT; attribute float aYan;
        attribute vec4 iAgac; attribute vec4 iAgac2; attribute vec4 iAci; attribute vec4 iDurum;
        varying vec3 vD; varying vec3 vN; varying float vYan; varying float vT; varying float vKuru; varying float vTohum; varying float vGizle;
        void main(){
          float g=buyume(iAgac2.w);
          vec3 tepe=agacTepe(iAgac,iAgac2,g);
          float ac=iDurum.z*smoothstep(iDurum.w*0.5, iDurum.w*0.5+0.35, g);
          float elev=mix(1.5, iAci.y, ac);
          float droop=iAci.z*ac;
          float L=iAci.w*mix(0.25,1.0,ac)*(0.35+0.65*g);
          float t=aT;
          // rüzgâr: uca doğru artar
          float faz=iDurum.w*6.28+iAci.x;
          float salinim=0.65+0.35*sin(uZaman*1.9+faz+t*1.5)+0.15*sin(uZaman*4.3+faz*2.0);
          float a=elev-droop*t;
          float am=elev-droop*t*0.5;
          vec3 R=vec3(0.0, L*t*sin(am), L*t*cos(am));
          vec3 T=vec3(0.0, sin(a), cos(a));
          vec3 Nn=vec3(0.0, cos(a), -sin(a));
          vec3 B=vec3(1.0,0.0,0.0);
          vec3 yerel=position*L;
          yerel.x*=mix(0.12,1.0,ac);
          // yaprakçık titreşimi
          float tit=sin(uZaman*11.0+t*25.0+faz*3.0)*0.018*aYan*length(uRuzgar)*L;
          vec3 p=R + B*yerel.x + Nn*(yerel.y+tit) + T*yerel.z;
          vec3 nrm=normalize(Nn + B*0.0);
          // azimut
          float ca=cos(iAci.x), sa=sin(iAci.x);
          p=vec3(ca*p.x+sa*p.z, p.y, -sa*p.x+ca*p.z);
          nrm=vec3(ca*nrm.x+sa*nrm.z, nrm.y, -sa*nrm.x+ca*nrm.z);
          vec3 w=tepe+p*(0.35+0.65*g);
          // rüzgâr kayması
          vec3 rz=uRuzgar*salinim*t*t*L*0.35;
          // imleç rüzgârı
          vec3 dd=w-uImlecRuzgar.xyz; float du=length(dd);
          rz+=normalize(dd+1e-4)*uImlecRuzgar.w*exp(-du*du*0.04)*t*t*1.6;
          w+=rz; w.y-=length(rz)*0.25;
          // kopma: yaprak fırtınaya savrulur
          vGizle=0.0;
          if(iDurum.y>=0.0){
            float tau=max(uZaman-iDurum.y,0.0);
            vec3 rd=normalize(uRuzgar+vec3(0.0001));
            vec3 merkez=tepe+vec3(ca*0.0+sa*L*0.5,0.0,ca*L*0.5);
            float don=tau*(2.5+iDurum.w*3.0);
            vec3 q=w-merkez;
            float cd=cos(don), sd=sin(don);
            q=vec3(q.x, cd*q.y-sd*q.z, sd*q.y+cd*q.z);
            w=merkez+q+rd*(tau*tau*7.0+tau*4.0)+vec3(0.0,tau*3.0-tau*tau*0.4,0.0);
            vGizle=smoothstep(2.5,4.0,tau);
          }
          w=(modelMatrix*vec4(w,1.0)).xyz;
          vD=w; vN=normalize(mat3(modelMatrix)*nrm); vYan=aYan; vT=t; vKuru=iDurum.x; vTohum=iDurum.w;
          gl_Position=projectionMatrix*viewMatrix*vec4(w,1.0);
        }`,
      fragmentShader: /* glsl */ `
        ${ISIK_UNIFORMLARI}
        ${AYDINLATMA}
        uniform vec3 uYesil,uYesil2,uKuru; uniform float uParlak;
        varying vec3 vD; varying vec3 vN; varying float vYan; varying float vT; varying float vKuru; varying float vTohum; varying float vGizle;
        void main(){
          if(vGizle>0.98) discard;
          vec3 N=normalize(vN); if(!gl_FrontFacing) N=-N;
          vec3 V=normalize(cameraPosition-vD);
          vec3 yes=mix(uYesil,uYesil2,vYan*0.55+vT*0.25+vTohum*0.15);
          vec3 kur=uKuru*(0.8+0.3*vYan)*(0.9+0.2*vTohum);
          vec3 alb=mix(yes,kur,vKuru);
          alb*=0.85+0.15*vT;
          vec3 c=aydinlat(alb,N,V,0.45,0.0,0.35)*uParlak;
          // arkadan ışık: yaprak dokusundan geçen yeşil-altın ışık
          float ndl=dot(N,uIsikYon);
          float arka=pow(clamp(dot(V,-uIsikYon),0.0,1.0),2.5)*clamp(0.6-ndl*0.5,0.0,1.0);
          c+=uIsikRenk*alb*vec3(1.1,1.25,0.55)*arka*(0.45+0.6*vYan)*mix(1.0,0.5,vKuru);
          c=sisle(c,vD);
          gl_FragColor=vec4(c,1.0);
        }`,
      side: THREE.DoubleSide,
    });
    this.yaprak = new THREE.Mesh(g, this.yaprakMat);
    this.yaprak.frustumCulled = false;
    this.grup.add(this.yaprak);
  }

  // tam büyümüş ağacın tepe noktası (dünya)
  tepe(i = 0, hedef = new THREE.Vector3()) {
    const t = this.agaclar[i];
    const c = Math.cos(t.yaw), s = Math.sin(t.yaw);
    const dx = t.egilme * t.boy;
    return hedef.set(t.x + c * dx, t.y + t.boy, t.z - s * dx);
  }
  // bir yaprağın kabaca orta noktası (fare yakınlığı için)
  yaprakNoktasi(j, oran = 0.55, hedef = new THREE.Vector3()) {
    const y = this.yaprakListe[j];
    this.tepe(y.agac, hedef);
    const t = oran, am = y.elev - y.droop * t * 0.5;
    const yy = y.L * t * Math.sin(am), zz = y.L * t * Math.cos(am);
    return hedef.add(new THREE.Vector3(Math.sin(y.az) * zz, yy, Math.cos(y.az) * zz));
  }
  kopar(j, zaman) {
    this.yaprakDurum.array[j * 4 + 1] = zaman;
    this.yaprakDurum.needsUpdate = true;
    this.yaprakListe[j].koptu = true;
  }
  set rontgen(v) {
    const t = v > 0.001;
    if (this.govdeMat.transparent !== t) {
      this.govdeMat.transparent = t; this.govdeMat.depthWrite = !t; this.govdeMat.needsUpdate = true;
    }
    this.u.uRontgen.value = v;
  }
  guncelle(dt) { this.u.uBuyuZaman.value += 0; }
  yokEt() {
    this.govde.geometry.dispose(); this.govdeMat.dispose();
    this.yaprak.geometry.dispose(); this.yaprakMat.dispose();
  }
}
