// Hurma salkımı: ana sap + telcikler (şemârîh) + meyveler (ya da dişi çiçekler).
// Meyve rengi (kimrî → halâl → rutab → temr) ve düşüş shader'da hesaplanır.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { ISIK_UNIFORMLARI, AYDINLATMA } from './glsl.js';
import { rastgele } from '../bolumler/temel.js';

const ASAGI = new THREE.Vector3(0, -1, 0);

export class Salkim {
  constructor(atmo, { taban, yon, sapBoy = 1.1, telSayisi = 26, telBoy = 0.85, meyveTel = 7, meyve = true, tohum = 1, telRenk = '#d8b25a', meyveBoy = 0.055 } = {}) {
    const r = rastgele(tohum * 977 + 13);
    this.grup = new THREE.Group();
    const y = yon.clone().setY(0).normalize();
    // ana sap: dışarı ve aşağı kıvrılan yay
    const sap = new THREE.CatmullRomCurve3([
      taban.clone(),
      taban.clone().addScaledVector(y, sapBoy * 0.45).add(new THREE.Vector3(0, 0.05, 0)),
      taban.clone().addScaledVector(y, sapBoy * 0.85).add(new THREE.Vector3(0, -sapBoy * 0.35, 0)),
      taban.clone().addScaledVector(y, sapBoy * 1.0).add(new THREE.Vector3(0, -sapBoy * 0.75, 0)),
    ]);
    this.sapEgri = sap;
    const geos = [new THREE.TubeGeometry(sap, 16, 0.035, 5)];
    this.uc = sap.getPoint(1);
    this.meyveler = [];
    const yan = new THREE.Vector3().crossVectors(y, ASAGI).normalize();
    for (let i = 0; i < telSayisi; i++) {
      const o = sap.getPoint(0.72 + 0.28 * (i / telSayisi));
      const a = r() * Math.PI * 2;
      const d = new THREE.Vector3().addScaledVector(y, 0.35 + r() * 0.3).addScaledVector(yan, Math.cos(a) * 0.5).add(new THREE.Vector3(0, Math.sin(a) * 0.2, 0)).normalize();
      const L = telBoy * (0.7 + r() * 0.5);
      const pts = [];
      for (let k = 0; k <= 6; k++) {
        const t = k / 6;
        pts.push(o.clone().addScaledVector(d, t * L * 0.6).addScaledVector(ASAGI, t * t * L * 0.95));
      }
      const tel = new THREE.CatmullRomCurve3(pts);
      geos.push(new THREE.TubeGeometry(tel, 6, 0.009, 3));
      for (let m = 0; m < meyveTel; m++) {
        const t = 0.25 + 0.75 * (m / meyveTel) + r() * 0.04;
        const p = tel.getPoint(Math.min(1, t));
        const yanD = new THREE.Vector3(r() - 0.5, -0.4, r() - 0.5).normalize();
        this.meyveler.push({ p: p.addScaledVector(yanD, meyveBoy * 0.7), faz: (i / telSayisi) * 0.6 + r() * 0.25, yon: yanD });
      }
    }
    const telGeo = mergeGeometries(geos.map((g) => { g.deleteAttribute('uv'); return g; }));
    this.u = {
      ...atmo.u, uRenk: { value: new THREE.Color(telRenk) }, uIsima: { value: 0 }, uIsimaRenk: { value: new THREE.Color('#ffc65a') },
    };
    this.telMat = new THREE.ShaderMaterial({
      uniforms: this.u,
      vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vD; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.0); vD=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
      fragmentShader: /* glsl */ `${ISIK_UNIFORMLARI}${AYDINLATMA} uniform vec3 uRenk,uIsimaRenk; uniform float uIsima; varying vec3 vN; varying vec3 vD;
        void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          vec3 c=aydinlat(uRenk,N,V,0.4,0.8,0.6)+uIsimaRenk*uIsima*2.2; gl_FragColor=vec4(sisle(c,vD),1.0); }`,
    });
    this.tel = new THREE.Mesh(telGeo, this.telMat);
    this.grup.add(this.tel);

    // meyveler / çiçekler
    const n = this.meyveler.length;
    const kure = new THREE.SphereGeometry(1, 10, 8);
    const g = new THREE.InstancedBufferGeometry().copy(kure);
    const p = new Float32Array(n * 3), f = new Float32Array(n), dus = new Float32Array(n * 4), yonA = new Float32Array(n * 3);
    this.meyveler.forEach((m, i) => { p.set(m.p.toArray(), i * 3); f[i] = m.faz; dus.set([-1, 0, 0, 0], i * 4); yonA.set(m.yon.toArray(), i * 3); });
    g.setAttribute('iP', new THREE.InstancedBufferAttribute(p, 3));
    g.setAttribute('iFaz', new THREE.InstancedBufferAttribute(f, 1));
    g.setAttribute('iYon', new THREE.InstancedBufferAttribute(yonA, 3));
    const dusA = new THREE.InstancedBufferAttribute(dus, 4); dusA.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iDus', dusA); // x: düşüş başlangıç zamanı (-1 yok), y: gizli, zw: yatay hız
    g.instanceCount = n;
    this.dusA = dusA;
    this.mu = {
      ...atmo.u, uEvre: { value: meyve ? 0 : -1 }, uBoy: { value: meyveBoy }, uZemin: { value: 0 }, uIsima: this.u.uIsima, uIsimaRenk: this.u.uIsimaRenk,
      uCicek: { value: meyve ? 0 : 1 },
    };
    this.meyveMat = new THREE.ShaderMaterial({
      uniforms: this.mu,
      vertexShader: /* glsl */ `
        attribute vec3 iP; attribute float iFaz; attribute vec4 iDus; attribute vec3 iYon;
        uniform float uBoy,uZaman,uZemin,uCicek;
        varying vec3 vN; varying vec3 vD; varying float vFaz; varying float vGizle;
        void main(){
          vec3 olc=vec3(0.78,1.25,0.78)*uBoy*mix(1.0,0.55,uCicek);
          vec3 q=position*olc;
          // aşağı sarkan uzun eksen
          vec3 Y=normalize(-iYon+vec3(0.0,-1.2,0.0)); vec3 X=normalize(cross(Y,vec3(0.3,0.1,0.9))); vec3 Z=cross(X,Y);
          vec3 p=iP+X*q.x-Y*q.y+Z*q.z;
          vec3 n=normalize(X*normal.x-Y*normal.y+Z*normal.z);
          vGizle=iDus.y;
          if(iDus.x>=0.0){
            float t=max(uZaman-iDus.x,0.0);
            vec3 d=vec3(iDus.z*t,-4.9*t*t,iDus.w*t);
            vec3 hedef=iP+d;
            if(hedef.y<uZemin+uBoy){ hedef.y=uZemin+uBoy; }
            float don=t*7.0+iFaz*20.0; float c=cos(don), s=sin(don);
            vec3 r=p-iP; r=vec3(c*r.x-s*r.y, s*r.x+c*r.y, r.z);
            p=hedef+r;
          }
          vN=normalize(mat3(modelMatrix)*n); vFaz=iFaz;
          vec4 w=modelMatrix*vec4(p,1.0); vD=w.xyz;
          gl_Position=projectionMatrix*viewMatrix*w;
        }`,
      fragmentShader: /* glsl */ `
        ${ISIK_UNIFORMLARI}${AYDINLATMA}
        uniform float uEvre,uCicek,uIsima; uniform vec3 uIsimaRenk;
        varying vec3 vN; varying vec3 vD; varying float vFaz; varying float vGizle;
        vec3 evreRenk(float e){
          vec3 k=vec3(0.36,0.5,0.12), h=vec3(0.9,0.6,0.1), r=vec3(0.62,0.3,0.08), t=vec3(0.2,0.08,0.04);
          vec3 c=mix(k,h,smoothstep(0.6,1.4,e));
          c=mix(c,r,smoothstep(1.6,2.4,e));
          c=mix(c,t,smoothstep(2.6,3.4,e));
          return c;
        }
        void main(){
          if(vGizle>0.5) discard;
          vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vD);
          float e=uEvre-vFaz*0.9;
          vec3 alb=uCicek>0.5 ? vec3(0.93,0.84,0.55) : evreRenk(e);
          float parlak=mix(0.25,0.9,smoothstep(1.4,2.4,e))*(1.0-smoothstep(2.8,3.6,e));
          vec3 c=aydinlat(alb,N,V,0.5,0.6,0.08)*1.15;
          vec3 H=normalize(uIsikYon+V);
          c+=uIsikRenk*pow(max(dot(N,H),0.0),40.0)*parlak;
          c+=uIsimaRenk*uIsima*1.6;
          c+=alb*0.35;
          gl_FragColor=vec4(sisle(c,vD),1.0);
        }`,
    });
    this.meyve = new THREE.Mesh(g, this.meyveMat);
    this.meyve.frustumCulled = false;
    this.grup.add(this.meyve);
  }
  // meyve i: t zamanında düşmeye başla, yatay hız (vx, vz)
  dusur(i, t, vx = 0, vz = 0) { this.dusA.array.set([t, 0, vx, vz], i * 4); this.dusA.needsUpdate = true; this.meyveler[i].dustu = t; this.meyveler[i].v = [vx, vz]; }
  gizle(i) { this.dusA.array[i * 4 + 1] = 1; this.dusA.needsUpdate = true; this.meyveler[i].gizli = true; }
  // JS ikizi: düşen meyvenin konumu
  dusenKonum(i, zaman, zemin, hedef = new THREE.Vector3()) {
    const m = this.meyveler[i];
    const t = Math.max(0, zaman - m.dustu);
    hedef.set(m.p.x + m.v[0] * t, Math.max(zemin + this.mu.uBoy.value, m.p.y - 4.9 * t * t), m.p.z + m.v[1] * t);
    return hedef;
  }
}
