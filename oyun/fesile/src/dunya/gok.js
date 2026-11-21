// Gök kubbesi, yıldızlar ve doğru evreli ay.
import * as THREE from 'three';
import { GURULTU } from './glsl.js';

export class Gok {
  constructor(atmo) {
    this.grup = new THREE.Group();
    this.grup.renderOrder = -10;
    const d = atmo.d;
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uTepe: { value: d.tepe }, uOrta: { value: d.orta }, uUfuk: { value: d.ufuk }, uYer: { value: d.yer },
        uGunesYon: { value: d.gunesYon }, uGunesRenk: { value: d.gunesRenk },
        uGunesDisk: { value: 0 }, uToz: { value: 0 }, uZaman: atmo.u.uZaman,
      },
      vertexShader: /* glsl */ `
        varying vec3 vYon;
        void main(){ vYon=position; vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position=p.xyww; }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uTepe,uOrta,uUfuk,uYer,uGunesYon,uGunesRenk; uniform float uGunesDisk,uToz,uZaman;
        varying vec3 vYon;
        ${GURULTU}
        void main(){
          vec3 d=normalize(vYon); float y=d.y;
          vec3 c=mix(uUfuk,uOrta,smoothstep(0.0,0.22,y));
          c=mix(c,uTepe,smoothstep(0.18,0.85,y));
          vec3 alt=mix(uUfuk*0.55,uYer,smoothstep(0.0,0.12,-y));
          c=mix(alt,c,smoothstep(-0.02,0.01,y));
          float g=max(dot(d,uGunesYon),0.0);
          vec3 dh=normalize(vec3(d.x,0.0,d.z)+1e-5); vec3 sh=normalize(vec3(uGunesYon.x,0.0,uGunesYon.z)+1e-5);
          float az=max(dot(dh,sh),0.0);
          float yukGunes=clamp(uGunesYon.y*4.0+0.6,0.0,1.0);
          c+=uGunesRenk*pow(az,4.0)*exp(-abs(y)*7.0)*0.55*yukGunes;
          c+=uGunesRenk*(pow(g,10.0)*0.35+pow(g,90.0)*0.6)*step(0.0,uGunesYon.y+0.05);
          c+=uGunesRenk*14.0*smoothstep(0.99955,0.99975,g)*uGunesDisk;
          if(uToz>0.0){
            float n=fbm3(vec3(d.x*3.0+uZaman*0.25,d.y*6.0,d.z*3.0-uZaman*0.1));
            c=mix(c,c*0.75+vec3(0.08,0.05,0.02),uToz*smoothstep(-0.4,0.6,n));
          }
          c+=(hash12(gl_FragCoord.xy+fract(uZaman))-0.5)/255.0;
          gl_FragColor=vec4(c,1.0);
        }`,
      side: THREE.BackSide, depthWrite: false, depthTest: false,
    });
    const kure = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), this.mat);
    kure.renderOrder = -10;
    kure.frustumCulled = false;
    this.grup.add(kure);
    this.atmo = atmo;
  }
  guncelle(kamera) {
    this.grup.position.copy(kamera.position);
    this.mat.uniforms.uGunesDisk.value = this.atmo.d.gunesDisk;
  }
  yokEt() { this.mat.dispose(); this.grup.children[0].geometry.dispose(); }
}

export class Yildizlar {
  constructor(atmo, sayi = 2600, seed = 7) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(sayi * 3), b = new Float32Array(sayi), f = new Float32Array(sayi);
    let s = seed;
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < sayi; i++) {
      const u = r(), v = r();
      const th = u * Math.PI * 2, y = Math.pow(v, 0.8) * 1.04 - 0.04;
      const rr = Math.sqrt(1 - y * y);
      p[i * 3] = Math.cos(th) * rr * 400; p[i * 3 + 1] = y * 400; p[i * 3 + 2] = Math.sin(th) * rr * 400;
      b[i] = Math.pow(r(), 7.0) * 1.7 + 0.25; f[i] = r() * 6.28;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aParlak', new THREE.BufferAttribute(b, 1));
    g.setAttribute('aFaz', new THREE.BufferAttribute(f, 1));
    this.u = {
      uYildiz: { value: 1 }, uZaman: atmo.u.uZaman, uImlec: { value: new THREE.Vector2(9, 9) },
      uTepki: { value: 0 }, uOlcek: { value: 1 },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        attribute float aParlak; attribute float aFaz;
        uniform float uZaman,uYildiz,uTepki,uOlcek; uniform vec2 uImlec;
        varying float vP;
        void main(){
          vec4 cp=projectionMatrix*modelViewMatrix*vec4(position,1.0);
          vec2 n=cp.xy/cp.w; vec2 dd=n-uImlec; float uz=length(dd*vec2(1.6,1.0));
          float yak=uTepki*exp(-uz*uz*14.0);
          cp.xy+=normalize(dd+1e-5)*yak*0.01*cp.w;
          float tw=0.65+0.35*sin(uZaman*(1.3+aFaz*0.4)+aFaz*7.0);
          vP=aParlak*tw*uYildiz*(1.0+yak*3.0)*smoothstep(-0.02,0.12,position.y/400.0);
          gl_Position=cp;
          gl_PointSize=(1.4+aParlak*0.9+yak*3.0)*uOlcek;
        }`,
      fragmentShader: /* glsl */ `
        varying float vP;
        void main(){ vec2 q=gl_PointCoord-0.5; float a=(1.0-smoothstep(0.0,0.5,length(q)));
          gl_FragColor=vec4(vec3(0.85,0.9,1.0)*vP*a*1.3, 1.0); }`,
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    });
    this.nokta = new THREE.Points(g, this.mat);
    this.nokta.frustumCulled = false;
    this.nokta.renderOrder = -9;
    this.atmo = atmo;
    this.carpan = 1;
  }
  guncelle(kamera) {
    this.nokta.position.copy(kamera.position);
    this.u.uYildiz.value = this.atmo.d.yildiz * this.carpan;
    this.nokta.visible = this.u.uYildiz.value > 0.01;
  }
  yokEt() { this.nokta.geometry.dispose(); this.mat.dispose(); }
}

// Ay yaşı (gün) → evre açısı. 0 = yeni ay, 14.77 = dolunay, 29.53 = yeni ay
export const AY_AYI = 29.53;
export const evreAcisi = (yas) => (2 * Math.PI * (((yas % AY_AYI) + AY_AYI) % AY_AYI)) / AY_AYI;

export const AY_GLSL = /* glsl */ `
// q: diskte nokta (yarıçap 1). th: evre açısı. Işıklı kısmın 0..1 değeri.
float ayIsik(vec2 q, float th){
  float r2=dot(q,q); if(r2>1.0) return 0.0;
  vec3 n=vec3(q,sqrt(1.0-r2));
  vec3 L=vec3(sin(th),0.0,-cos(th));
  return smoothstep(-0.025,0.05,dot(n,L));
}`;

export class Ay {
  constructor({ yas = 3, boyut = 14, az = -100, yuk = 12, parlak = 2.6, egim = 0 } = {}) {
    this.u = {
      uTh: { value: evreAcisi(yas) }, uParlak: { value: parlak }, uGorunur: { value: 1 },
      uEgim: { value: egim }, uHale: { value: 1 },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: /* glsl */ `
        uniform float uTh,uParlak,uGorunur,uEgim,uHale; varying vec2 vUv;
        ${GURULTU}
        ${AY_GLSL}
        void main(){
          vec2 q=(vUv-0.5)*4.0; float ce=cos(uEgim), se=sin(uEgim); q=vec2(ce*q.x-se*q.y, se*q.x+ce*q.y);
          float r=length(q);
          float isik=ayIsik(q,uTh);
          float aydinlik=(1.0-cos(uTh))*0.5;
          float leke=0.82+0.18*smoothstep(-0.2,0.5,fbm3(vec3(q*2.2,1.7)));
          float kenar=sqrt(max(1.0-r*r,0.0));
          vec3 renk=vec3(1.0,0.93,0.78)*uParlak*leke*(0.75+0.25*kenar);
          vec3 c=renk*isik+vec3(0.012,0.016,0.026)*(1.0-isik);
          float disk=(1.0-smoothstep(0.985,1.0,r));
          float hale=exp(-(r-1.0)*2.2)*0.16*(0.25+aydinlik)*uHale*step(1.0,r);
          vec3 col=mix(vec3(1.0,0.9,0.75)*hale*uParlak, c, disk);
          float a=max(disk*mix(0.1,1.0,isik), hale*1.2);
          gl_FragColor=vec4(col, a*uGorunur);
        }`,
      transparent: true, depthWrite: false, depthTest: false,
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
    this.mesh.renderOrder = -8;
    this.mesh.frustumCulled = false;
    this.boyut = boyut; this.az = az; this.yuk = yuk;
    this.yon = new THREE.Vector3();
    this.konumla(az, yuk);
  }
  set yas(v) { this.u.uTh.value = evreAcisi(v); }
  konumla(az, yuk) {
    this.az = az; this.yuk = yuk;
    const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(yuk);
    this.yon.set(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
  }
  guncelle(kamera) {
    const uz = 350;
    this.mesh.position.copy(kamera.position).addScaledVector(this.yon, uz);
    this.mesh.quaternion.copy(kamera.quaternion);
    const s = 2 * uz * Math.tan(THREE.MathUtils.degToRad(this.boyut / 2)) * 2; // disk = çeyrek dörtgen
    this.mesh.scale.set(s, s, 1);
  }
  yokEt() { this.mat.dispose(); this.mesh.geometry.dispose(); }
}
