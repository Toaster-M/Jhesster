/**
 * Procedural chess sound effects via the Web Audio API.
 * No audio files required — all sounds are synthesised from simple oscillators.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Short helper: schedule a gain envelope (attack → sustain → release). */
function envelope(
  gain: GainNode,
  now: number,
  peak: number,
  attackSec: number,
  sustainSec: number,
  releaseSec: number,
) {
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peak, now + attackSec);
  gain.gain.setValueAtTime(peak, now + attackSec + sustainSec);
  gain.gain.linearRampToValueAtTime(0, now + attackSec + sustainSec + releaseSec);
}

// ── Individual sound generators ───────────────────────────────────────────────

/** Regular piece move — a short, woody thud. */
function playMove(ac: AudioContext) {
  const now = ac.currentTime;

  // Low-frequency bump (body)
  const osc1 = ac.createOscillator();
  const g1   = ac.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(220, now);
  osc1.frequency.exponentialRampToValueAtTime(110, now + 0.06);
  envelope(g1, now, 0.35, 0.002, 0.02, 0.06);
  osc1.connect(g1);
  g1.connect(ac.destination);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Click transient
  const osc2 = ac.createOscillator();
  const g2   = ac.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(800, now);
  osc2.frequency.exponentialRampToValueAtTime(300, now + 0.015);
  envelope(g2, now, 0.08, 0.001, 0.005, 0.015);
  osc2.connect(g2);
  g2.connect(ac.destination);
  osc2.start(now);
  osc2.stop(now + 0.03);
}

/** Capture — heavier impact + brief metallic ring. */
function playCapture(ac: AudioContext) {
  const now = ac.currentTime;

  const osc1 = ac.createOscillator();
  const g1   = ac.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(180, now);
  osc1.frequency.exponentialRampToValueAtTime(80, now + 0.1);
  envelope(g1, now, 0.55, 0.002, 0.03, 0.1);
  osc1.connect(g1);
  g1.connect(ac.destination);
  osc1.start(now);
  osc1.stop(now + 0.2);

  // Metallic ring
  const osc2 = ac.createOscillator();
  const g2   = ac.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1400, now + 0.005);
  osc2.frequency.exponentialRampToValueAtTime(900, now + 0.15);
  envelope(g2, now + 0.005, 0.12, 0.002, 0.04, 0.1);
  osc2.connect(g2);
  g2.connect(ac.destination);
  osc2.start(now + 0.005);
  osc2.stop(now + 0.2);
}

/** Check — higher-pitched alert ping. */
function playCheck(ac: AudioContext) {
  const now = ac.currentTime;

  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(1100, now + 0.04);
  osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
  envelope(g, now, 0.25, 0.004, 0.05, 0.14);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

/** Castle — two quick knocks. */
function playCastle(ac: AudioContext) {
  [0, 0.13].forEach((offset) => {
    const now = ac.currentTime + offset;
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(130, now + 0.07);
    envelope(g, now, 0.3, 0.002, 0.02, 0.07);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  });
}

/** Game over — descending three-note chime. */
function playGameOver(ac: AudioContext) {
  const freqs  = [660, 523, 392];
  const delays = [0,   0.22, 0.44];
  freqs.forEach((freq, i) => {
    const now = ac.currentTime + delays[i];
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    envelope(g, now, 0.2, 0.01, 0.12, 0.1);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  });
}

/** Promotion — ascending fanfare. */
function playPromotion(ac: AudioContext) {
  const freqs  = [523, 659, 784, 1047];
  const delays = [0,   0.1, 0.2, 0.3];
  freqs.forEach((freq, i) => {
    const now = ac.currentTime + delays[i];
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    envelope(g, now, 0.2, 0.01, 0.08, 0.08);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export type SoundEvent = 'move' | 'capture' | 'check' | 'castle' | 'gameOver' | 'promotion';

export function playSound(event: SoundEvent, enabled: boolean): void {
  if (!enabled) return;
  try {
    const ac = getCtx();
    // Resume context if it was suspended (browser autoplay policy)
    if (ac.state === 'suspended') {
      ac.resume().then(() => dispatchSound(ac, event));
    } else {
      dispatchSound(ac, event);
    }
  } catch {
    // Audio not supported or blocked — silently ignore
  }
}

function dispatchSound(ac: AudioContext, event: SoundEvent): void {
  switch (event) {
    case 'move':      playMove(ac);      break;
    case 'capture':   playCapture(ac);   break;
    case 'check':     playCheck(ac);     break;
    case 'castle':    playCastle(ac);    break;
    case 'gameOver':  playGameOver(ac);  break;
    case 'promotion': playPromotion(ac); break;
  }
}
