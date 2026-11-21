// GPU'da hareket eden parçacık sistemleri: hız çizgileri, patlama, toz.
// Hepsi zaman uniform'u ile vertex shader'da canlanır; JS her karede yalnızca
// birkaç uniform yazar.
import * as THREE from 'three';
import { GURULTU } from '../dunya/glsl.js';

// Hız çizgileri: bir eksen boyunca akan ince çizgiler (düşüş, dalış).
export class HizCizgileri {
  constructor(sayi = 420, { ic = 1.6, dis = 16, boy = 70, renk = '#fff1d8' } = {}) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(sayi * 2 * 3), r = new Float32Array(sayi * 2 * 4);
    for (let i = 0; i < sayi; i++) {
      const a = Math.random() * Math.PI * 2, rad = ic + Math.pow(Math.random(), 0.7) * (dis - ic);
      const faz = Math.random(), k = 0.6 + Math.random() * 0.8;
      for (let j = 0; j < 2; j++) {
        p.set([Math.cos(a) * rad, j, Math.sin(a) * rad], (i * 2 + j) * 3);
        r.set([faz, k, rad, Math.random()], (i * 2 + j) * 4);
      }
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aR', new THREE.BufferAttribute(r, 4));
    this.u = { uZaman: { value: 0 }, uHiz: { value: 0 }, uBoy: { value: boy }, uRenk: { value: new THREE.Color(renk) }, uYol: { value: 0 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        attribute vec4 aR; uniform float uHiz,uBoy,uYol; varying float vA;
        void main(){
          float y=fract(aR.x+uYol*aR.y/uBoy)*uBoy-uBoy*0.5;
          float uz=uHiz*0.35*aR.y*(0.5+aR.w);
          vec3 p=vec3(position.x, y+position.y*uz, position.z);
          vA=(1.0-abs(y)/(uBoy*0.5))*smoothstep(0.0,0.3,uHiz)*(0.35+0.65*aR.w);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }`,
      fragmentShader: /* glsl */ `uniform vec3 uRenk; varying float vA; void main(){ gl_FragColor=vec4(uRenk*vA*0.7,1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.nesne = new THREE.LineSegments(g, this.mat);
    this.nesne.frustumCulled = false;
  }
  // hiz: birim/sn; yol birikir
  guncelle(dt, hiz) {
    if (HizCizgileri.azalt) hiz = 0; // prefers-reduced-motion
    this.u.uHiz.value = hiz; this.u.uYol.value += hiz * dt;
  }
}

// Patlama: tek seferlik, balistik parçacıklar (kum, kıvılcım, su).
export class Patlama {
  constructor(sayi = 3000, { renk = '#e6b07a', parlak = 1.4, boyut = 6, yercekim = -14, sure = 3, hizMin = 4, hizMax = 18, koni = 0.9, yukari = new THREE.Vector3(0, 1, 0), toplama = THREE.AdditiveBlending, karanlik = false } = {}) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(sayi * 3), v = new Float32Array(sayi * 4);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), yukari.clone().normalize());
    const t = new THREE.Vector3();
    for (let i = 0; i < sayi; i++) {
      const a = Math.random() * Math.PI * 2;
      const c = 1 - Math.random() * koni;
      const s = Math.sqrt(1 - c * c);
      const h = hizMin + Math.pow(Math.random(), 1.6) * (hizMax - hizMin);
      t.set(Math.cos(a) * s, c, Math.sin(a) * s).applyQuaternion(q).multiplyScalar(h);
      p.set([(Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4], i * 3);
      v.set([t.x, t.y, t.z, Math.random()], i * 4);
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aV', new THREE.BufferAttribute(v, 4));
    this.u = {
      uT: { value: -1 }, uRenk: { value: new THREE.Color(renk) }, uParlak: { value: parlak }, uBoyut: { value: boyut },
      uG: { value: yercekim }, uSure: { value: sure }, uOlcek: { value: 1 },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        attribute vec4 aV; uniform float uT,uG,uSure,uBoyut,uOlcek; varying float vA; varying float vR;
        void main(){
          float t=max(uT,0.0)*(0.6+aV.w*0.6);
          float sur=1.0/(1.0+t*1.2);
          vec3 p=position+aV.xyz*t*sur+vec3(0.0,0.5*uG*t*t,0.0);
          vA=step(0.0,uT)*(1.0-smoothstep(uSure*0.4,uSure,t));
          vR=aV.w;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=uBoyut*uOlcek*(0.4+aV.w)*(300.0/max(-mv.z,1.0))*0.1;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uRenk; uniform float uParlak; varying float vA; varying float vR;
        void main(){ vec2 q=gl_PointCoord-0.5; float a=(1.0-smoothstep(0.1,0.5,length(q)))*vA; if(a<0.01) discard;
          gl_FragColor=vec4(uRenk*uParlak*(0.6+vR*0.8)*a, ${karanlik ? 'a' : '1.0'}); }`,
      transparent: true, depthWrite: false, blending: toplama,
    });
    this.nesne = new THREE.Points(g, this.mat);
    this.nesne.frustumCulled = false;
    this.nesne.visible = false;
  }
  patlat(nokta) { this.nesne.position.copy(nokta); this.u.uT.value = 0; this.nesne.visible = true; }
  guncelle(dt) {
    if (this.u.uT.value >= 0) {
      this.u.uT.value += dt;
      if (this.u.uT.value > this.u.uSure.value * 1.8) { this.u.uT.value = -1; this.nesne.visible = false; }
    }
  }
}

// Toz/zerre: bir kutuda süzülen, curl gürültüsüyle salınan noktalar.
export class Zerreler {
  constructor(sayi = 500, { boyut = new THREE.Vector3(20, 12, 20), renk = '#ffe2b0', parlak = 1.2, nokta = 3, hiz = 0.2 } = {}) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(sayi * 3), r = new Float32Array(sayi);
    for (let i = 0; i < sayi; i++) {
      p.set([(Math.random() - 0.5) * boyut.x, (Math.random() - 0.5) * boyut.y, (Math.random() - 0.5) * boyut.z], i * 3);
      r[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aR', new THREE.BufferAttribute(r, 1));
    this.u = { uZaman: { value: 0 }, uRenk: { value: new THREE.Color(renk) }, uParlak: { value: parlak }, uNokta: { value: nokta }, uHiz: { value: hiz }, uKutu: { value: boyut }, uAkis: { value: new THREE.Vector3() }, uAlfa: { value: 1 } };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${GURULTU}
        attribute float aR; uniform float uZaman,uNokta,uHiz; uniform vec3 uKutu,uAkis; varying float vA;
        void main(){
          vec3 p=position+uAkis*(0.5+aR);
          p+=curl3(p*0.08+vec3(0.0,uZaman*uHiz*0.3,aR*3.0))*0.8;
          p=mod(p+uKutu*0.5,uKutu)-uKutu*0.5;
          vec4 mv=modelViewMatrix*vec4(p,1.0);
          float yan=0.6+0.4*sin(uZaman*(1.0+aR*2.0)+aR*30.0);
          vA=yan*smoothstep(0.0,0.15,1.0-max(max(abs(p.x)/uKutu.x,abs(p.y)/uKutu.y),abs(p.z)/uKutu.z)*2.0+0.15);
          gl_Position=projectionMatrix*mv;
          gl_PointSize=uNokta*(0.5+aR)*(30.0/max(-mv.z,0.5));
        }`,
      fragmentShader: /* glsl */ `uniform vec3 uRenk; uniform float uParlak,uAlfa; varying float vA;
        void main(){ float a=(1.0-smoothstep(0.0,0.5,length(gl_PointCoord-0.5)))*vA*uAlfa; gl_FragColor=vec4(uRenk*uParlak*a,1.0); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.nesne = new THREE.Points(g, this.mat);
    this.nesne.frustumCulled = false;
  }
  guncelle(dt, zaman) { this.u.uZaman.value = zaman; }
}
