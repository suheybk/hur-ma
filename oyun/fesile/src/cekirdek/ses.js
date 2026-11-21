// WebAudio ile üretilen sesler: rüzgâr, hız uğultusu, su, çarpma, hafif çıngırak.
// Müzik yok. "Başla"dan önce hiçbir ses başlamaz.
export class Ses {
  constructor() {
    this.acik = true;
    this.ctx = null;
    this.hedef = { ruzgar: 0.25, hiz: 0, su: 0 };
    try { this.acik = localStorage.getItem('fesile-ses') !== '0'; } catch { /* yok */ }
  }
  baslat() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const c = (this.ctx = new AC());
    this.ana = c.createGain(); this.ana.gain.value = this.acik ? 0.9 : 0;
    const komp = c.createDynamicsCompressor();
    this.ana.connect(komp); komp.connect(c.destination);
    // gürültü tamponu
    const n = c.sampleRate * 2;
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    let b = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b = 0.97 * b + 0.03 * w; d[i] = w * 0.5 + b * 2.5; }
    this.gurultu = buf;
    const kaynak = (filtre, f, q) => {
      const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
      s.playbackRate.value = 0.7 + Math.random() * 0.6;
      const fl = c.createBiquadFilter(); fl.type = filtre; fl.frequency.value = f; fl.Q.value = q;
      const g = c.createGain(); g.gain.value = 0;
      s.connect(fl); fl.connect(g); g.connect(this.ana); s.start();
      return { fl, g };
    };
    this.ruzgar = kaynak('bandpass', 420, 0.7);
    this.hizK = kaynak('lowpass', 700, 0.5);
    this.suK = kaynak('bandpass', 1400, 2.5);
    this._t = 0;
  }
  ac(acik) {
    this.acik = acik;
    try { localStorage.setItem('fesile-ses', acik ? '1' : '0'); } catch { /* yok */ }
    if (this.ana) this.ana.gain.setTargetAtTime(acik ? 0.9 : 0, this.ctx.currentTime, 0.2);
  }
  guncelle(dt) {
    if (!this.ctx) return;
    this._t += dt;
    const t = this.ctx.currentTime;
    const h = this.hedef;
    const lfo = 0.6 + 0.4 * Math.sin(this._t * 0.31) * Math.sin(this._t * 0.17 + 1);
    this.ruzgar.g.gain.setTargetAtTime(h.ruzgar * 0.35 * lfo, t, 0.3);
    this.ruzgar.fl.frequency.setTargetAtTime(300 + 500 * lfo + h.ruzgar * 400, t, 0.4);
    this.hizK.g.gain.setTargetAtTime(Math.min(1, h.hiz) * 0.5, t, 0.15);
    this.hizK.fl.frequency.setTargetAtTime(400 + h.hiz * 2200, t, 0.15);
    const kab = 0.5 + 0.5 * Math.sin(this._t * 23) * Math.sin(this._t * 7.3);
    this.suK.g.gain.setTargetAtTime(h.su * 0.22 * (0.6 + 0.4 * kab), t, 0.05);
  }
  // kısa olaylar
  vurus(guc = 1) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.gurultu;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(200, t + 0.8);
    const g = c.createGain(); g.gain.setValueAtTime(0.9 * guc, t); g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    s.connect(f); f.connect(g); g.connect(this.ana); s.start(t); s.stop(t + 1.5);
    const o = c.createOscillator(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    const og = c.createGain(); og.gain.setValueAtTime(0.8 * guc, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(og); og.connect(this.ana); o.start(t); o.stop(t + 0.8);
  }
  kivilcim() {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.gurultu; s.playbackRate.value = 2;
    const f = c.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3000;
    const g = c.createGain(); g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    s.connect(f); f.connect(g); g.connect(this.ana); s.start(t); s.stop(t + 0.2);
  }
  cinlama(perde = 0) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const taban = 523.25 * Math.pow(2, perde / 12);
    [1, 2.01, 3.02, 4.2].forEach((k, i) => {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = taban * k;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12 / (i + 1), t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 2.4 / (1 + i * 0.6));
      o.connect(g); g.connect(this.ana); o.start(t); o.stop(t + 2.6);
    });
  }
  hava(guc = 1) { // yumuşak hava/whoosh
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const s = c.createBufferSource(); s.buffer = this.gurultu;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(1800, t + 0.5); f.frequency.exponentialRampToValueAtTime(400, t + 1.1);
    const g = c.createGain(); g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.35 * guc, t + 0.35); g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    s.connect(f); f.connect(g); g.connect(this.ana); s.start(t); s.stop(t + 1.3);
  }
}
