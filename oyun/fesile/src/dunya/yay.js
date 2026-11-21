// ORTAK YAY FONKSİYONU — urcûn (salkım sapı) ile hilal aynı eğriden üretilir.
//
// s ∈ [-1, 1] eğri boyunca parametre. Uçlar her zaman (0, ±R) noktasındadır.
//  - Hilal (m = 1): ay diskinde aydınlık bölge = kenar yarım dairesi ile
//    terminatör elipsi arası. k = cos(evre açısı). h = sqrt(1 - s²):
//      merkez x = -R·h·(1 + k)/2      yarı kalınlık = R·h·(1 - k)/2
//    (küçülen ay: aydınlık taraf solda, -x).
//  - Sap (m = 0): parabolik yay, dipte kalın uca doğru incelen profil,
//    ucunda içe kıvrım.
// Ara durumlar yalnızca parametrelerin doğrusal karışımıdır; böylece sap ile
// hilal arasında hiçbir sıçrama olmaz. JS ve GLSL sürümleri birebir aynıdır.

export const YAY_GLSL = /* glsl */ `
uniform float uR, uK, uM, uKalin, uEgri, uKivrim, uDerin;
vec2 yayMerkez(float s){
  float h=sqrt(max(1.0-s*s,0.0));
  // sap
  float ucK=smoothstep(0.45,1.0,s); ucK*=ucK;
  vec2 sap=vec2(-uR*uEgri*(1.0-s*s) + uKivrim*uR*0.42*ucK*(1.0-0.5*s*s), uR*s - uKivrim*uR*0.12*ucK);
  // hilal
  vec2 hil=vec2(-uR*h*(1.0+uK)*0.5, uR*s);
  return mix(sap,hil,uM);
}
float yayKalinlik(float s){
  float h=sqrt(max(1.0-s*s,0.0));
  float dip=mix(1.0,0.28,(s+1.0)*0.5);
  float kapak=sqrt(smoothstep(-1.0,-0.965,s))*sqrt((1.0-smoothstep(0.975,1.0,s)));
  float sap=uR*uKalin*dip*kapak;
  float hil=uR*h*(1.0-uK)*0.5;
  return mix(sap,hil,uM);
}`;

// JS ikizi (yerleşim ve test için)
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export function yayMerkez(s, p) {
  const h = Math.sqrt(Math.max(1 - s * s, 0));
  let ucK = ss(0.45, 1, s); ucK *= ucK;
  const sx = -p.R * p.egri * (1 - s * s) + p.kivrim * p.R * 0.42 * ucK * (1 - 0.5 * s * s);
  const sy = p.R * s - p.kivrim * p.R * 0.12 * ucK;
  const hx = -p.R * h * (1 + p.k) * 0.5, hy = p.R * s;
  return [sx + (hx - sx) * p.m, sy + (hy - sy) * p.m];
}
export function yayKalinlik(s, p) {
  const h = Math.sqrt(Math.max(1 - s * s, 0));
  const dip = 1 + (0.28 - 1) * (s + 1) * 0.5;
  const kapak = Math.sqrt(ss(-1, -0.965, s)) * Math.sqrt(ss(1, 0.975, s));
  const sap = p.R * p.kalin * dip * kapak;
  const hil = p.R * h * (1 - p.k) * 0.5;
  return sap + (hil - sap) * p.m;
}
