// Görüntü zinciri: sahne → bloom → ton eşleme/sRGB → son geçiş
// (radyal bulanıklık, renk sapması, vinyet, gren, karartma, flaş).
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

const SonShader = {
  name: 'SonShader',
  uniforms: {
    tDiffuse: { value: null },
    uZaman: { value: 0 }, uHiz: { value: 0 }, uVinyet: { value: 0.55 }, uGren: { value: 0.05 },
    uKarart: { value: 0 }, uFlas: { value: 0 }, uSapma: { value: 0.0015 }, uOran: { value: 1.6 },
    uMerkez: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float uZaman,uHiz,uVinyet,uGren,uKarart,uFlas,uSapma,uOran; uniform vec2 uMerkez;
    varying vec2 vUv;
    float h(vec2 p){ vec3 p3=fract(vec3(p.xyx)*0.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
    void main(){
      vec2 d=vUv-uMerkez;
      vec3 c;
      if(uHiz>0.002){
        c=vec3(0.0); float tw=0.0;
        for(int i=0;i<10;i++){
          float k=float(i)/9.0; float s=1.0-uHiz*0.09*k; float w=1.0-k*0.5;
          vec2 q=uMerkez+d*s;
          c.r+=texture2D(tDiffuse,uMerkez+d*(s+uSapma*6.0*uHiz)).r*w;
          c.g+=texture2D(tDiffuse,q).g*w;
          c.b+=texture2D(tDiffuse,uMerkez+d*(s-uSapma*6.0*uHiz)).b*w;
          tw+=w;
        }
        c/=tw;
      } else {
        float s=uSapma*length(d)*2.0;
        c.r=texture2D(tDiffuse,vUv+d*s).r;
        c.g=texture2D(tDiffuse,vUv).g;
        c.b=texture2D(tDiffuse,vUv-d*s).b;
      }
      vec2 vd=(vUv-0.5)*vec2(uOran,1.0)/max(uOran,1.0)*1.4;
      float v=smoothstep(0.35,1.05,length(vd));
      c*=1.0-uVinyet*v;
      float l=dot(c,vec3(0.299,0.587,0.114));
      float gr=h(vUv*vec2(1731.0,977.0)+fract(uZaman*7.13)*311.0)-0.5;
      c+=gr*uGren*(0.35+0.65*(1.0-l));
      c=mix(c,vec3(1.0,0.96,0.88),uFlas);
      c=mix(c,vec3(0.0),uKarart);
      gl_FragColor=vec4(c,1.0);
    }`,
};

export class Post {
  constructor(renderer, sahne, kamera, kalite) {
    this.renderer = renderer;
    const w = innerWidth, h = innerHeight;
    const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: kalite.msaa });
    this.composer = new EffectComposer(renderer, rt);
    this.renderPass = new RenderPass(sahne, kamera);
    this.composer.addPass(this.renderPass);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(w * kalite.bloomOlcek, h * kalite.bloomOlcek), 0.7, 0.55, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.son = new ShaderPass(SonShader);
    this.composer.addPass(this.son);
    this.u = this.son.uniforms;
    this.kalite = kalite;
  }
  set sahne(s) { this.renderPass.scene = s; }
  set kamera(k) { this.renderPass.camera = k; }
  boyut(w, h, pr) {
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    this.bloom.setSize(w * pr * this.kalite.bloomOlcek, h * pr * this.kalite.bloomOlcek);
    this.u.uOran.value = w / h;
  }
  ciz(zaman) {
    this.u.uZaman.value = zaman;
    this.composer.render();
  }
}
