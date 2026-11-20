/* Tiny WebAudio sfx — window.Sfx (volume + mute in Esc menu) */
window.Sfx = (() => {
  let ctx = null;
  let volume = 0.8, muted = false;
  try {
    const raw = localStorage.getItem("emberhold_sound");
    if (raw) { const s = JSON.parse(raw); if (typeof s.volume === "number") volume = Math.min(1, Math.max(0, s.volume)); muted = !!s.muted; }
  } catch (e) { }
  function persist() { try { localStorage.setItem("emberhold_sound", JSON.stringify({ volume, muted })); } catch (e) { } }
  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e) { } return null; }
    return ctx;
  }
  function tone(freq, dur = 0.08, type = "square", vol = 0.06, slide = 0) {
    if (muted || volume <= 0) return;
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), c.currentTime + dur);
    g.gain.setValueAtTime(vol * volume, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + dur + 0.02);
  }
  return {
    swing() { tone(300, 0.07, "square", 0.04, -120); },
    hit() { tone(140, 0.1, "sawtooth", 0.07, -60); },
    fire() { tone(600, 0.16, "sawtooth", 0.05, -400); },
    heal() { tone(520, 0.18, "sine", 0.07, 300); },
    coin() { tone(900, 0.08, "square", 0.05, 400); setTimeout(() => tone(1350, 0.1, "square", 0.05), 70); },
    level() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.14, "square", 0.06), i * 90)); },
    talk() { tone(440, 0.06, "sine", 0.04, 80); },
    chest() { tone(660, 0.12, "triangle", 0.07, 220); },
    death() { tone(220, 0.25, "sawtooth", 0.06, -160); },
    clang() { tone(1567, 0.12, "triangle", 0.07); setTimeout(() => tone(2093, 0.16, "triangle", 0.06), 45); },
    stairs() { [330, 415, 494].forEach((f, i) => setTimeout(() => tone(f, 0.12, "triangle", 0.06), i * 80)); },
    test() { [523, 659, 784].forEach((f, i) => setTimeout(() => tone(f, 0.12, "square", 0.07), i * 80)); },
    getVolume() { return volume; },
    isMuted() { return muted; },
    setVolume(v) { volume = Math.min(1, Math.max(0, Number(v) || 0)); if (volume > 0) muted = false; persist(); },
    setMuted(m) { muted = !!m; persist(); },
  };
})();
