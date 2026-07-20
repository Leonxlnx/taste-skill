// Synthesizes a short, dry mechanical detent for gesture feedback (e.g. the
// WheelPicker row-cross click) entirely at runtime. Several inharmonic modes
// make it read as a tiny physical impact instead of an oscillator beep, while
// the high-passed transient gives it definition through phone speakers.

const DURATION = 0.016; // seconds, short enough to stay distinct during a fling
const MASTER_GAIN = 0.055;

const MODES = [
  { frequency: 980, decay: 0.0038, gain: 0.5, phase: 0 },
  { frequency: 1820, decay: 0.0024, gain: 0.3, phase: 0.65 },
  { frequency: 3160, decay: 0.00115, gain: 0.12, phase: 1.3 },
] as const;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor })
      .webkitAudioContext
  );
}

// One shared context/buffer/gain for the whole page, ref-counted across every
// `createTickPlayer()` caller. Components like WheelPicker commonly compose
// several side by side (a date made of month/day/year drums) — giving each
// its own AudioContext would waste resources and risk hitting a browser's cap
// on concurrent contexts. The context only closes once every consumer that
// created a player has called `dispose()`.
let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let clickBuffer: AudioBuffer | null = null;
let consumers = 0;

function buildClickBuffer(context: AudioContext): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.ceil(DURATION * sampleRate);
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);

  let peak = 0;
  let previousNoise = 0;
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const attack = Math.min(1, t / 0.00012);
    const fadeOut = Math.min(1, (DURATION - t) / 0.001);
    let resonance = 0;
    for (const mode of MODES) {
      resonance +=
        Math.sin(2 * Math.PI * mode.frequency * t + mode.phase) *
        Math.exp(-t / mode.decay) *
        mode.gain;
    }

    // Differencing consecutive noise samples removes the low, papery part of
    // white noise and leaves only a tiny impact at the front of the sound.
    const noise = Math.random() * 2 - 1;
    const transient =
      (noise - previousNoise) * Math.exp(-t / 0.00038) * 0.035;
    previousNoise = noise;

    data[i] = (resonance + transient) * attack * fadeOut;
    peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak > 0) {
    const norm = 0.9 / peak;
    for (let i = 0; i < length; i++) data[i] *= norm;
  }

  return buffer;
}

function ensureContext() {
  if (ctx) return;
  const Ctor = getAudioContextCtor();
  if (!Ctor) return;
  ctx = new Ctor();
  masterGain = ctx.createGain();
  masterGain.gain.value = MASTER_GAIN;
  masterGain.connect(ctx.destination);
  clickBuffer = buildClickBuffer(ctx);
}

function prepareContext() {
  ensureContext();
  if (ctx?.state === "suspended") {
    // Browsers may reject this when it is not called from a trusted gesture.
    // Pointer, touch, wheel and keyboard entry points call `prepare()` first;
    // this repeat attempt keeps direct `play()` calls safe as well.
    void ctx.resume().catch(() => undefined);
  }
}

interface TickPlayer {
  prepare: () => void;
  play: () => void;
  dispose: () => void;
}

/**
 * Lazily-initialized tick player. No `AudioContext` is created until the first
 * `prepare()` or `play()` call anywhere on the page. Every player shares the
 * same context/buffer, ref-counted so `dispose()` only tears it down once the
 * last consumer is gone. Safe during SSR or in browsers without Web Audio:
 * `prepare()` and `play()` become silent no-ops.
 */
export function createTickPlayer(): TickPlayer {
  consumers++;
  let disposed = false;
  let activeSource: AudioBufferSourceNode | null = null;

  return {
    prepare() {
      if (disposed) return;
      prepareContext();
    },
    play() {
      if (disposed) return;
      prepareContext();
      if (!ctx || !masterGain || !clickBuffer) return;
      // A fast fling can cross rows more quickly than the tail of a tick.
      // Cutting that tail keeps the feedback dry instead of stacking into a
      // louder metallic ring.
      activeSource?.stop();
      const source = ctx.createBufferSource();
      source.buffer = clickBuffer;
      source.connect(masterGain);
      source.onended = () => {
        source.disconnect();
        if (activeSource === source) activeSource = null;
      };
      activeSource = source;
      source.start();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      activeSource?.stop();
      activeSource = null;
      consumers = Math.max(0, consumers - 1);
      if (consumers === 0 && ctx) {
        ctx.close();
        ctx = null;
        masterGain = null;
        clickBuffer = null;
      }
    },
  };
}
