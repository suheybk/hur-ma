// Kum tepeleri (vertex shader'da), uzak bazalt sırtları (harre).
import * as THREE from 'three';
import { GURULTU, ISIK_UNIFORMLARI, AYDINLATMA } from './glsl.js';

const KUM_GLSL = /* glsl */ `
uniform vec3 uDuz; // x,z merkez, yarıçap
float kumYuk(vec2 p){
  float r=length(p-uDuz.xy);
  float duz=smoothstep(uDuz.z,uDuz.z*3.5,r);
  vec2 q=vec2(p.x*0.8+p.y*0.6,-p.x*0.6+p.y*0.8);
  float w=q.y*0.045+sin(q.x*0.03)*1.2+sin(q.x*0.071+1.3)*0.5;
  float s=fract(w/6.2831853);
  float tepe=smoothstep(0.0,0.72,s)*(1.0-smoothstep(0.72,1.0,s));
  float w2=p.x*0.021+sin(p.y*0.05)*0.8;
  float s2=fract(w2);
  float t2=smoothstep(0.0,0.6,s2)*(1.0-smoothstep(0.6,1.0,s2));
  float uzak=smoothstep(60.0,160.0,r);
  return (tepe*tepe*4.5+t2*2.2+sin(p.x*0.013)*sin(p.y*0.017)*2.0+1.0)*duz*(1.0+uzak*0.6)
         +0.25*sin(p.x*0.11+p.y*0.07)*duz;
}`;

const fr = (x) => x - Math.floor(x);
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function kumYukJS(x, z, duz = [0, 0, 6]) {
  const r = Math.hypot(x - duz[0], z - duz[1]);
  const d = ss(duz[2], duz[2] * 3.5, r);
  const qx = x * 0.8 + z * 0.6, qy = -x * 0.6 + z * 0.8;
  const w = qy * 0.045 + Math.sin(qx * 0.03) * 1.2 + Math.sin(qx * 0.071 + 1.3) * 0.5;
  const s = fr(w / 6.2831853);
  const tepe = ss(0, 0.72, s) * (1 - ss(0.72, 1, s));
  const w2 = x * 0.021 + Math.sin(z * 0.05) * 0.8;
  const s2 = fr(w2);
  const t2 = ss(0, 0.6, s2) * (1 - ss(0.6, 1, s2));
  const uzak = ss(60, 160, r);
  return (tepe * tepe * 4.5 + t2 * 2.2 + Math.sin(x * 0.013) * Math.sin(z * 0.017) * 2.0 + 1.0) * d * (1 + uzak * 0.6)
    + 0.25 * Math.sin(x * 0.11 + z * 0.07) * d;
}

export class Zemin {
  constructor(atmo, { boyut = 700, bolme = 240, duz = [0, 0, 6], renk = '#d39a5a', sirt = true, cozgu = 1.9, merkez = [0, 0] } = {}) {
    this.grup = new THREE.Group();
    this.duz = duz;
    const g = new THREE.PlaneGeometry(boyut, boyut, bolme, bolme);
    g.rotateX(-Math.PI / 2);
    // merkezde sık, kenarda seyrek ızgara (krater ve ağaç dibi ayrıntısı için)
    if (cozgu !== 1) {
      const pa = g.attributes.position, H = boyut / 2;
      for (let i = 0; i < pa.count; i++) {
        const x = pa.getX(i) / H, z = pa.getZ(i) / H;
        pa.setX(i, Math.sign(x) * Math.pow(Math.abs(x), cozgu) * H + merkez[0]);
        pa.setZ(i, Math.sign(z) * Math.pow(Math.abs(z), cozgu) * H + merkez[1]);
      }
    }
    this.u = {
      ...atmo.u,
      uDuz: { value: new THREE.Vector3(...duz) },
      uRenk: { value: new THREE.Color(renk) },
      uNem: { value: new THREE.Vector4(0, 0, 0, 0) },      // x,z,yarıçap,güç
      uNemRenk: { value: new THREE.Color('#ffcf7a') },
      uKrater: { value: new THREE.Vector4(0, 0, 1, 0) },   // x,z,yarıçap,derinlik
      uIslak: { value: new THREE.Vector4(0, 0, 0, 0) },
      uParilti: { value: 1 },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${KUM_GLSL}
        uniform vec4 uKrater;
        varying vec3 vDunya; varying vec3 vN; varying float vYuk;
        float yuk(vec2 p){
          float h=kumYuk(p);
          float d=length(p-uKrater.xy)/uKrater.z;
          h-=uKrater.w*(1.0-smoothstep(0.0,1.0,d))*(1.0-d*d*0.6);
          h+=uKrater.w*0.35*exp(-pow((d-1.05)*3.0,2.0));
          return h;
        }
        void main(){
          vec4 wp=modelMatrix*vec4(position,1.0);
          float e=0.6;
          float h=yuk(wp.xz);
          float hx=yuk(wp.xz+vec2(e,0.0)), hz=yuk(wp.xz+vec2(0.0,e));
          vN=normalize(vec3(h-hx,e,h-hz));
          wp.y+=h; vYuk=h;
          vDunya=wp.xyz;
          gl_Position=projectionMatrix*viewMatrix*wp;
        }`,
      fragmentShader: /* glsl */ `
        ${ISIK_UNIFORMLARI}
        ${GURULTU}
        ${AYDINLATMA}
        uniform vec3 uRenk,uNemRenk; uniform vec4 uNem,uIslak; uniform float uParilti;
        varying vec3 vDunya; varying vec3 vN; varying float vYuk;
        void main(){
          vec3 N=normalize(vN);
          vec2 p=vDunya.xz;
          // rüzgâr dalgacıkları (normal bozma)
          float dal=sin(dot(p,vec2(0.6,0.8))*7.0+snoise(vec3(p*0.25,0.0))*3.0);
          float yakin=1.0-smoothstep(10.0,60.0,length(vDunya-cameraPosition));
          N=normalize(N+vec3(0.6,0.0,0.8)*dal*0.09*yakin);
          vec3 V=normalize(cameraPosition-vDunya);
          float n=snoise(vec3(p*0.08,0.3))*0.5+0.5;
          vec3 alb=uRenk*(0.82+0.3*n)*(0.85+0.04*vYuk);
          // nem
          float dn=length(p-uNem.xy);
          float nem=uNem.w*(1.0-smoothstep(uNem.z*0.4,uNem.z,dn));
          alb=mix(alb,alb*0.45,nem);
          float isl=uIslak.w*(1.0-smoothstep(uIslak.z*0.5,uIslak.z,length(p-uIslak.xy)));
          alb=mix(alb,alb*0.5,isl);
          vec3 c=aydinlat(alb,N,V,0.25,0.0,0.35);
          // ışıltı: kum tanelerinde minik yansımalar
          vec2 hc=floor(p*9.0);
          float h=hash12(hc);
          vec3 H=normalize(uIsikYon+V);
          float sp=pow(max(dot(N,H),0.0),40.0);
          c+=uIsikRenk*step(0.996,h)*sp*0.9*uParilti*yakin;
          // nemli toprağın ışıması
          float halka=exp(-pow((dn-uNem.z*0.55)/(uNem.z*0.12),2.0));
          float nabiz=0.75+0.25*sin(uZaman*2.4);
          c+=uNemRenk*(nem*0.35+halka*0.6)*uNem.w*nabiz;
          c=sisle(c,vDunya);
          gl_FragColor=vec4(c,1.0);
        }`,
    });
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.frustumCulled = false;
    this.grup.add(this.mesh);

    if (sirt) {
      // uzak harre sırtları: halka şeklinde koyu, pürüzlü siluet
      const n = 360, ic = 230, dis = 250;
      const pos = [], idx = [];
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const h = 10 + 9 * Math.abs(Math.sin(a * 3.1)) + 6 * Math.sin(a * 7.7 + 1) + 3 * Math.sin(a * 23.0) + 1.5 * Math.sin(a * 61.0);
        const c = Math.cos(a), s = Math.sin(a);
        pos.push(c * ic, -2, s * ic, c * (ic + 8), Math.max(2, h), s * (ic + 8), c * dis, -2, s * dis);
        if (i < n) {
          const b = i * 3;
          idx.push(b, b + 3, b + 1, b + 1, b + 3, b + 4, b + 1, b + 4, b + 2, b + 2, b + 4, b + 5);
        }
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      sg.setIndex(idx);
      sg.computeVertexNormals();
      this.sirtMat = new THREE.ShaderMaterial({
        uniforms: { ...atmo.u },
        vertexShader: /* glsl */ `varying vec3 vD; varying vec3 vN; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
        fragmentShader: /* glsl */ `${ISIK_UNIFORMLARI}${AYDINLATMA} varying vec3 vD; varying vec3 vN;
          void main(){ vec3 V=normalize(cameraPosition-vD); vec3 c=aydinlat(vec3(0.05,0.045,0.05),normalize(vN),V,0.2,0.0,0.4);
          vec3 d=vD-cameraPosition; float uz=length(d);
          float f=clamp(1.0-exp(-uz*uSisYog*0.55),0.0,0.92);
          gl_FragColor=vec4(mix(c,uSisRenk+uSisGunes*pow(max(dot(d/uz,uIsikYon),0.0),6.0),f),1.0); }`,
        side: THREE.DoubleSide,
      });
      this.sirt = new THREE.Mesh(sg, this.sirtMat);
      this.sirt.frustumCulled = false;
      this.grup.add(this.sirt);
    }
  }
  yukseklik(x, z) { return kumYukJS(x, z, this.duz); }
  yokEt() {
    this.mesh.geometry.dispose(); this.mat.dispose();
    if (this.sirt) { this.sirt.geometry.dispose(); this.sirtMat.dispose(); }
  }
}
