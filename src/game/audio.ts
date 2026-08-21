let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC({ latencyHint: "interactive" });
    master = ctx.createGain();
    sfx = ctx.createGain();
    sfx.gain.value = 0.22;
    master.gain.value = 0.85;
    sfx.connect(master);
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.8) {
  if (!ctx || !sfx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(sfx);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function sfxJump() {
  beep(420, 0.09, "square", 0.5);
  beep(680, 0.07, "triangle", 0.35);
}

export function sfxLand() {
  beep(90, 0.08, "sine", 0.7);
}

export function sfxCrash() {
  beep(140, 0.28, "sawtooth", 0.9);
  beep(70, 0.35, "square", 0.5);
}

export function sfxStart() {
  beep(520, 0.08, "triangle", 0.4);
  beep(780, 0.12, "triangle", 0.3);
}
