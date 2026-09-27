"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { TUNING } from "@/lib/tuning";

/**
 * Six strings on a canvas. Each is a damped 1D wave: crossing a string with the
 * pointer (or tapping near it) plucks it where you crossed. Sound is synthesised
 * with Karplus–Strong, so there are no audio files, and it only plays once the
 * visitor turns sound on.
 */

export { TUNING };

const POINTS = 72;
const SUBSTEPS = 4;
const TENSION = 0.9;
const DAMPING = 0.997;

export type PluckOptions = {
  /** Play this pitch instead of the open string (e.g. a fretted note). */
  freq?: number;
  /** Don't report the pluck to `onPluck` (used when the game itself plays). */
  silent?: boolean;
};

export type GuitarHandle = { pluck: (string: number, at?: number, strength?: number, opts?: PluckOptions) => void };

export type GuitarStringsProps = {
  soundOn: boolean;
  color: string;
  onPluck?: (i: number) => void;
  /** "sweep": pluck by crossing strings (free play). "tap": click/tap the nearest string (games). */
  input?: "sweep" | "tap";
  /** Strings to glow, e.g. the next note in a game. */
  highlight?: number[];
  /** Pitch override for user plucks, e.g. the fretted note a tune needs. */
  getFreq?: (i: number) => number | undefined;
};

type Str = { y: Float32Array; v: Float32Array };

export const GuitarStrings = forwardRef<GuitarHandle, GuitarStringsProps>(
  function GuitarStrings({ soundOn, color, onPluck, input = "sweep", highlight = [], getFreq }, handle) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reduced = usePrefersReducedMotion();
    const strings = useRef<Str[]>(TUNING.map(() => ({ y: new Float32Array(POINTS), v: new Float32Array(POINTS) })));
    const audio = useRef<{ ctx: AudioContext; buffers: AudioBuffer[]; byFreq: Map<number, AudioBuffer> } | null>(null);
    const soundRef = useRef(soundOn);
    const kick = useRef<() => void>(() => {});
    // Latest props, read by long-lived event handlers.
    const onPluckRef = useRef(onPluck);
    const inputRef = useRef(input);
    const highlightRef = useRef(highlight);
    const getFreqRef = useRef(getFreq);
    soundRef.current = soundOn;
    onPluckRef.current = onPluck;
    inputRef.current = input;
    highlightRef.current = highlight;
    getFreqRef.current = getFreq;

    // Prepare audio on the first "sound on" (must follow a user gesture).
    useEffect(() => {
      if (!soundOn || audio.current) return;
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      audio.current = { ctx, buffers: TUNING.map((t) => karplusStrong(ctx, t.freq)), byFreq: new Map() };
    }, [soundOn]);

    const play = (i: number, pan: number, strength: number, freq?: number) => {
      const a = audio.current;
      if (!soundRef.current || !a) return;
      if (a.ctx.state === "suspended") a.ctx.resume();
      const src = a.ctx.createBufferSource();
      if (freq) {
        const key = Math.round(freq * 100);
        if (!a.byFreq.has(key)) a.byFreq.set(key, karplusStrong(a.ctx, freq));
        src.buffer = a.byFreq.get(key)!;
      } else src.buffer = a.buffers[i];
      const gain = a.ctx.createGain();
      gain.gain.value = 0.18 + 0.5 * Math.min(1, strength);
      const panner = a.ctx.createStereoPanner?.();
      src.connect(gain);
      if (panner) {
        panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
        gain.connect(panner).connect(a.ctx.destination);
      } else gain.connect(a.ctx.destination);
      src.start();
    };

    const pluck = (i: number, at = 0.5, strength = 0.7, opts: PluckOptions = {}) => {
      const s = strings.current[i];
      const center = Math.round(at * (POINTS - 1));
      const amp = (10 + strength * 16) * (i % 2 ? 1 : -1);
      for (let p = 1; p < POINTS - 1; p++) {
        const d = (p - center) / 6;
        s.v[p] += amp * Math.exp(-d * d) * 0.35;
      }
      play(i, at * 2 - 1, strength, opts.freq ?? getFreqRef.current?.(i));
      if (!opts.silent) onPluckRef.current?.(i);
      kick.current();
    };

    useImperativeHandle(handle, () => ({ pluck }));

    // Redraw when the glowing strings change, even if nothing is vibrating.
    const highlightKey = highlight.join(",");
    useEffect(() => kick.current(), [highlightKey]);

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx2d = canvas.getContext("2d")!;
      let w = 0;
      let h = 0;
      let raf = 0;
      let running = false;
      let visible = true;
      let last: { x: number; y: number; t: number } | null = null;

      const lineY = (i: number) => (h / (TUNING.length + 1)) * (i + 1);

      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const r = canvas.getBoundingClientRect();
        w = r.width;
        h = r.height;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
      };

      const step = () => {
        let energy = 0;
        for (const s of strings.current) {
          for (let k = 0; k < SUBSTEPS; k++) {
            for (let p = 1; p < POINTS - 1; p++) {
              s.v[p] += TENSION * (s.y[p - 1] + s.y[p + 1] - 2 * s.y[p]);
              s.v[p] *= DAMPING;
            }
            for (let p = 1; p < POINTS - 1; p++) s.y[p] += s.v[p] / SUBSTEPS;
          }
          for (let p = 0; p < POINTS; p++) energy += Math.abs(s.y[p]) + Math.abs(s.v[p]);
        }
        return energy;
      };

      const draw = () => {
        ctx2d.clearRect(0, 0, w, h);
        for (const i of highlightRef.current) {
          const base = lineY(i);
          ctx2d.save();
          ctx2d.strokeStyle = color;
          ctx2d.shadowColor = color;
          ctx2d.shadowBlur = 18;
          ctx2d.globalAlpha = 0.28;
          ctx2d.lineWidth = 12;
          ctx2d.beginPath();
          ctx2d.moveTo(0, base);
          ctx2d.lineTo(w, base);
          ctx2d.stroke();
          ctx2d.restore();
        }
        strings.current.forEach((s, i) => {
          const base = lineY(i);
          let e = 0;
          for (let p = 0; p < POINTS; p++) e += Math.abs(s.y[p]);
          const glow = Math.min(1, e / 120);
          ctx2d.beginPath();
          ctx2d.lineWidth = 2.6 - i * 0.32;
          ctx2d.strokeStyle = color;
          ctx2d.globalAlpha = 0.45 + glow * 0.55;
          const dx = w / (POINTS - 1);
          ctx2d.moveTo(0, base + s.y[0]);
          for (let p = 1; p < POINTS - 1; p++) {
            const xc = p * dx + dx / 2;
            const yc = base + (s.y[p] + s.y[p + 1]) / 2;
            ctx2d.quadraticCurveTo(p * dx, base + s.y[p], xc, yc);
          }
          ctx2d.lineTo(w, base);
          ctx2d.stroke();
        });
        ctx2d.globalAlpha = 1;
      };

      const loop = () => {
        const energy = reduced ? 0 : step();
        if (reduced) strings.current.forEach((s) => (s.y.fill(0), s.v.fill(0)));
        draw();
        if (energy > 0.05 && visible) raf = requestAnimationFrame(loop);
        else running = false;
      };
      kick.current = () => {
        if (!running) {
          running = true;
          raf = requestAnimationFrame(loop);
        }
      };

      // Pointer crossing detection
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const t = performance.now();
        if (last && inputRef.current === "sweep") {
          const speed = Math.hypot(x - last.x, y - last.y) / Math.max(1, t - last.t);
          for (let i = 0; i < TUNING.length; i++) {
            const ly = lineY(i);
            if ((last.y - ly) * (y - ly) < 0) {
              const cx = last.x + ((ly - last.y) / (y - last.y)) * (x - last.x);
              pluck(i, Math.max(0.02, Math.min(0.98, cx / w)), Math.min(1, speed / 2));
            }
          }
        }
        last = { x, y, t };
      };
      const onLeave = () => (last = null);
      const onDown = (e: PointerEvent) => {
        if (e.pointerType === "mouse" && inputRef.current === "sweep") return;
        const r = canvas.getBoundingClientRect();
        const y = e.clientY - r.top;
        let best = 0;
        for (let i = 1; i < TUNING.length; i++) if (Math.abs(lineY(i) - y) < Math.abs(lineY(best) - y)) best = i;
        pluck(best, (e.clientX - r.left) / w, 0.7);
      };

      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick.current();
      });
      io.observe(canvas);

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("pointerdown", onDown);
      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("pointerdown", onDown);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color, reduced]);

    useEffect(() => () => void audio.current?.ctx.close(), []);

    return (
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={
          input === "tap"
            ? "Six guitar strings. Click or tap a string, press keys 1 to 6, or use the string buttons."
            : "Six guitar strings. Move the cursor across them, or tap one, to pluck it."
        }
        className="block h-full w-full touch-pan-y"
      />
    );
  },
);

/** Karplus–Strong plucked string: filtered noise in a delay loop. */
function karplusStrong(ctx: AudioContext, freq: number, seconds = 2.4) {
  const sr = ctx.sampleRate;
  const length = Math.floor(sr * seconds);
  const buffer = ctx.createBuffer(1, length, sr);
  const out = buffer.getChannelData(0);
  const period = Math.round(sr / freq);
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
  // Soften the initial burst for a warmer, fingerpicked tone.
  for (let i = 1; i < period; i++) ring[i] = (ring[i] + ring[i - 1]) * 0.5;
  const decay = 0.996 - freq / 200000;
  let idx = 0;
  for (let n = 0; n < length; n++) {
    const next = (idx + 1) % period;
    const v = (ring[idx] + ring[next]) * 0.5 * decay;
    out[n] = ring[idx];
    ring[idx] = v;
    idx = next;
  }
  // Short fade-in to avoid a click
  for (let n = 0; n < 64; n++) out[n] *= n / 64;
  return buffer;
}
