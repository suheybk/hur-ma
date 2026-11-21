// Urcûn (boş salkım sapı) ⇄ hilal. Tek bir tüp ağı; her köşe noktası ortak yay
// fonksiyonundan (yay.js) vertex shader'da hesaplanır. Dönüşüm yalnızca
// uniform'ların sürekli değişimidir: sıçrama olamaz.
import * as THREE from 'three';
import { YAY_GLSL } from './yay.js';
import { GURULTU } from './glsl.js';

export const SAP = { kalin: 0.115, egri: 0.3, kivrim: 0.0 };
export const KURU = { kalin: 0.06, egri: 0.46, kivrim: 1.0 };

function tupGeo(nS = 200, nA = 22) {
  const s = [], a = [], idx = [];
  for (let i = 0; i <= nS; i++) {
    // uçlarda sık örnekleme (incelen boynuzlar için)
    const u = i / nS;
    const x = -Math.cos(u * Math.PI);
    for (let j = 0; j <= nA; j++) {
      s.push(x); a.push((j / nA) * Math.PI * 2);
      if (i < nS && j < nA) {
        const b = i * (nA + 1) + j;
        idx.push(b, b + 1, b + nA + 1, b + 1, b + nA + 2, b + nA + 1);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('aS', new THREE.Float32BufferAttribute(s, 1));
  g.setAttribute('aA', new THREE.Float32BufferAttribute(a, 1));
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(s.length * 3), 3));
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
  return g;
}

const YAY_VERTEX = /* glsl */ `
${YAY_GLSL}
attribute float aS; attribute float aA;
varying vec3 vN; varying vec3 vD; varying float vS; varying float vA; varying vec2 vYerel;
void yayNokta(out vec3 p, out vec3 n){
  float s=aS;
  vec2 c=yayMerkez(s);
  float e=0.0035;
  vec2 t=yayMerkez(min(s+e,1.0))-yayMerkez(max(s-e,-1.0));
  t=normalize(t+vec2(0.0,1e-6));
  vec2 n2=vec2(-t.y,t.x);
  float w=yayKalinlik(s);
  float d=mix(1.0,uDerin,uM);
  p=vec3(c+n2*cos(aA)*w, sin(aA)*w*d);
  n=normalize(vec3(n2*cos(aA)*d, sin(aA)));
  vYerel=c+n2*cos(aA)*w;
}`;

export class Urcun {
  constructor(atmo, { R = 0.75, k = 0.836, iz = false } = {}) {
    this.grup = new THREE.Group();
    this.u = {
      uR: { value: R }, uK: { value: k }, uM: { value: 0 },
      uKalin: { value: SAP.kalin }, uEgri: { value: SAP.egri }, uKivrim: { value: SAP.kivrim }, uDerin: { value: 0.22 },
      uKuru: { value: 0 }, uParlak: { value: 0 }, uGorunur: { value: 1 }, uDoku: { value: 1 },
      uAYon: { value: new THREE.Vector3(0.6, 0.5, 0.6).normalize() }, uARenk: { value: new THREE.Color('#ffcf90').multiplyScalar(1.05) },
      uKYon: { value: new THREE.Vector3(-0.7, 0.2, -0.6).normalize() }, uKRenk: { value: new THREE.Color('#8fb0ff').multiplyScalar(1.2) },
      uOrtam: { value: new THREE.Color('#141826') },
      uZaman: atmo.u.uZaman,
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${YAY_VERTEX}
        void main(){
          vec3 p,n; yayNokta(p,n);
          vS=aS; vA=aA;
          vN=normalize(mat3(modelMatrix)*n);
          vec4 w=modelMatrix*vec4(p,1.0); vD=w.xyz;
          gl_Position=projectionMatrix*viewMatrix*w;
        }`,
      fragmentShader: /* glsl */ `
        ${GURULTU}
        uniform float uM,uKuru,uParlak,uGorunur,uDoku,uR,uK;
        uniform vec3 uAYon,uARenk,uKYon,uKRenk,uOrtam;
        varying vec3 vN; varying vec3 vD; varying float vS; varying float vA; varying vec2 vYerel;
        void main(){
          vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          // sap dokusu: boyuna lifler
          float lif=snoise(vec3(vS*38.0, vA*2.2, 0.0))*0.5+0.5;
          float ince=snoise(vec3(vS*140.0, vA*6.0, 3.0))*0.5+0.5;
          float leke=snoise(vec3(vS*5.0, vA*0.8, 7.0))*0.5+0.5;
          vec3 taze=mix(vec3(0.62,0.38,0.08),vec3(0.95,0.7,0.24),lif*0.7+ince*0.3);
          vec3 kuru=mix(vec3(0.42,0.33,0.2),vec3(0.78,0.68,0.5),lif*0.6+ince*0.4)*(0.8+0.3*leke);
          vec3 alb=mix(taze,kuru,uKuru);
          alb=mix(vec3(dot(alb,vec3(0.33))*0.9+0.08),alb,uDoku);
          float ndl=dot(N,uAYon);
          vec3 c=alb*(uOrtam+uARenk*clamp((ndl+0.25)/1.25,0.0,1.0));
          vec3 H=normalize(uAYon+V);
          c+=uARenk*pow(max(dot(N,H),0.0),mix(30.0,8.0,uKuru))*mix(0.35,0.08,uKuru);
          float fr=pow(1.0-clamp(dot(N,V),0.0,1.0),2.5);
          c+=uKRenk*fr*clamp(dot(N,uKYon)+0.5,0.0,1.0)*0.9;
          // hilal: kendi ışığı. dış kenar biraz daha parlak.
          float h=sqrt(max(1.0-vS*vS,0.0));
          float dis=clamp(-vYerel.x/(uR*max(h,0.02)),0.0,1.0);
          vec3 ay=vec3(1.0,0.93,0.78)*uParlak*(0.82+0.18*dis)*(0.9+0.1*leke*uDoku);
          float m=smoothstep(0.15,0.85,uM);
          vec3 son=mix(c,ay,m)+vec3(1.0,0.85,0.6)*uParlak*0.25*(1.0-m);
          gl_FragColor=vec4(son*uGorunur, uGorunur);
        }`,
      transparent: true,
    });
    this.tup = new THREE.Mesh(tupGeo(), this.mat);
    this.tup.frustumCulled = false;
    this.grup.add(this.tup);

    // kırık dalcık kalıntıları (sap kurudukça kırılır, hilalde yoktur)
    const n = 11;
    const silindir = new THREE.CylinderGeometry(0.5, 1, 1, 5, 1, false);
    silindir.translate(0, 0.5, 0);
    const g = new THREE.InstancedBufferGeometry().copy(silindir);
    const iS = new Float32Array(n), iY = new Float32Array(n), iB = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      iS[i] = 0.3 + 0.62 * (i / (n - 1)) + Math.sin(i * 7.1) * 0.02;
      iY[i] = i * 2.39996 + 0.3;
      iB[i] = 0.07 + 0.08 * Math.abs(Math.sin(i * 3.7));
    }
    g.setAttribute('iS', new THREE.InstancedBufferAttribute(iS, 1));
    g.setAttribute('iY', new THREE.InstancedBufferAttribute(iY, 1));
    g.setAttribute('iB', new THREE.InstancedBufferAttribute(iB, 1));
    g.instanceCount = n;
    this.dalMat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `
        ${YAY_GLSL}
        attribute float iS; attribute float iY; attribute float iB;
        varying vec3 vN; varying vec3 vD;
        uniform float uKuru;
        void main(){
          vec2 c=yayMerkez(iS);
          vec2 t=normalize(yayMerkez(min(iS+0.004,1.0))-yayMerkez(iS-0.004));
          vec2 n2=vec2(-t.y,t.x);
          float w=yayKalinlik(iS);
          vec3 T=vec3(t,0.0), A=vec3(n2,0.0), B=vec3(0.0,0.0,1.0);
          vec3 yon=normalize(cos(iY)*A+sin(iY)*B+T*0.9);
          vec3 yan1=normalize(cross(yon,T+vec3(0.0001))); vec3 yan2=cross(yon,yan1);
          float boy=uR*iB*(1.0-uKuru*0.75)*(1.0-smoothstep(0.0,0.35,uM));
          float r=w*0.42*(1.0-smoothstep(0.0,0.35,uM));
          vec3 taban=vec3(c,0.0)+(cos(iY)*A+sin(iY)*B)*w*0.6;
          vec3 p=taban+yon*position.y*boy+(yan1*position.x+yan2*position.z)*r;
          vN=normalize(mat3(modelMatrix)*(yan1*normal.x+yon*normal.y+yan2*normal.z)+vec3(1e-5));
          vec4 wp=modelMatrix*vec4(p,1.0); vD=wp.xyz;
          gl_Position=projectionMatrix*viewMatrix*wp;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uKuru,uGorunur; uniform vec3 uAYon,uARenk,uKYon,uKRenk,uOrtam;
        varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN+vec3(1e-5)); vec3 V=normalize(cameraPosition-vD);
          vec3 alb=mix(vec3(0.85,0.6,0.2),vec3(0.62,0.52,0.36),uKuru);
          vec3 c=alb*(uOrtam+uARenk*clamp((dot(N,uAYon)+0.3)/1.3,0.0,1.0));
          c+=uKRenk*pow(1.0-abs(dot(N,V)),2.5)*0.6;
          gl_FragColor=vec4(c*uGorunur,uGorunur); }`,
      transparent: true,
    });
    this.dallar = new THREE.Mesh(g, this.dalMat);
    this.dallar.frustumCulled = false;
    this.grup.add(this.dallar);

    // hale: hilal parladıkça diskin etrafında hafif ışık
    this.haleU = { uGuc: { value: 0 }, uR: this.u.uR, uK: this.u.uK };
    this.hale = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      uniforms: this.haleU,
      vertexShader: /* glsl */ `varying vec2 vP; uniform float uR; void main(){ vP=position.xy*6.0; gl_Position=projectionMatrix*modelViewMatrix*vec4(position.xy*6.0*uR,0.0,1.0);} `,
      fragmentShader: /* glsl */ `uniform float uGuc; varying vec2 vP;
        void main(){ float r=length(vP); float a=exp(-max(r-0.9,0.0)*1.6)*uGuc*(1.0-smoothstep(1.0,3.0,r));
          gl_FragColor=vec4(vec3(1.0,0.9,0.75)*a,1.0);} `,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    this.hale.renderOrder = -1;
    this.grup.add(this.hale);
    if (iz) { this.dallar.visible = false; this.hale.visible = false; }
  }
  ayarla(p) {
    for (const [k, v] of Object.entries(p)) {
      const ad = 'u' + k[0].toUpperCase() + k.slice(1);
      if (this.u[ad]) this.u[ad].value = v;
    }
  }
  yokEt() { this.tup.geometry.dispose(); this.mat.dispose(); this.dallar.geometry.dispose(); this.dalMat.dispose(); this.hale.geometry.dispose(); this.hale.material.dispose(); }
}
