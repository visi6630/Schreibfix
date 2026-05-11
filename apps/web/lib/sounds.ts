// Sound effects using Web Audio API — no external files needed.

let _ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    try {
      _ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return _ctx;
}

function tone(
  ctx: AudioContext,
  freq: number,
  start: number,
  duration: number,
  gain = 0.3,
  type: OscillatorType = "sine",
): void {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.connect(g);
  g.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

/** Bright ascending chime — played on a correct answer. */
export function playCorrect(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 523.25, t, 0.15);        // C5
  tone(ctx, 659.25, t + 0.1, 0.15);  // E5
  tone(ctx, 783.99, t + 0.2, 0.25);  // G5
}

/** Short low buzz — played on a wrong answer. */
export function playWrong(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 220, t, 0.08, 0.25, "sawtooth");
  tone(ctx, 180, t + 0.1, 0.12, 0.2, "sawtooth");
}

/** Short 4-note fanfare — played when a full lesson or round is complete. */
export function playComplete(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 523.25, t, 0.1);         // C5
  tone(ctx, 659.25, t + 0.1, 0.1);   // E5
  tone(ctx, 783.99, t + 0.2, 0.1);   // G5
  tone(ctx, 1046.5, t + 0.3, 0.45);  // C6 — held
}

/** Subtle soft click — played on button presses. */
export function playClick(): void {
  const ctx = getCtx();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 800, t, 0.04, 0.1);
}
