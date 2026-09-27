"use client";

import { AnimatePresence, m, useInView } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useReducer, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { GuitarHandle } from "@/components/GuitarStrings";
import { Play, Volume, VolumeOff } from "@/components/ui/Icons";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { TUNING } from "@/lib/tuning";
import { cn } from "@/lib/cn";

// Canvas + audio code is only needed once the section is near; keep it out of the first bundle.
const GuitarStrings = dynamic(() => import("@/components/GuitarStrings").then((m) => m.GuitarStrings), { ssr: false });

const AMBER = "#eba44a";
const GREEN = "#7ee0a1";
const RED = "#ff6b6b";

type Mode = "free" | "echo" | "rush" | "tune";
type Game = Exclude<Mode, "free">;

const MODES: { id: Mode; label: string; short: string }[] = [
  { id: "free", label: "Free play", short: "Free" },
  { id: "echo", label: "Echo", short: "Echo" },
  { id: "rush", label: "Note rush", short: "Rush" },
  { id: "tune", label: "Play a tune", short: "Tune" },
];

/** Vertical position of a string inside the canvas box (matches GuitarStrings' layout). */
const laneTop = (i: number) => `${((i + 1) / (TUNING.length + 1)) * 100}%`;
const noteName = (i: number) => `${TUNING[i].name}${TUNING[i].octave}`;

/** Tiny game store: mutable ref for logic (safe across fast plucks) + a render tick. */
function useGame<T extends object>(initial: T) {
  const g = useRef(initial);
  const [, render] = useReducer((x: number) => x + 1, 0);
  const set = (patch: Partial<T>) => {
    Object.assign(g.current, patch);
    render();
  };
  return [g.current, set, g] as const;
}

/* ================================================================== */
/* Echo: repeat the sequence, one note longer each round               */
/* ================================================================== */

function useEcho(guitar: RefObject<GuitarHandle | null>, record: (n: number) => void) {
  const [g, set] = useGame({ phase: "idle" as "idle" | "demo" | "input" | "won" | "fail", seq: [] as number[], pos: 0, lit: null as number | null });
  const timers = useRef<number[]>([]);
  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clear, []);
  const rand = () => Math.floor(Math.random() * TUNING.length);

  const demo = (seq: number[]) => {
    clear();
    set({ phase: "demo", seq, pos: 0, lit: null });
    const gap = Math.max(330, 660 - seq.length * 28);
    seq.forEach((s, k) => {
      timers.current.push(
        window.setTimeout(() => {
          set({ lit: s });
          guitar.current?.pluck(s, 0.5, 0.75, { silent: true });
        }, 600 + k * gap),
        window.setTimeout(() => set({ lit: null }), 600 + k * gap + gap * 0.6),
      );
    });
    timers.current.push(window.setTimeout(() => set({ phase: "input" }), 600 + seq.length * gap));
  };

  return {
    start: () => demo([rand()]),
    stop: () => {
      clear();
      set({ phase: "idle", seq: [], pos: 0, lit: null });
    },
    onPluck: (i: number) => {
      if (g.phase !== "input") return;
      if (i !== g.seq[g.pos]) {
        record(g.seq.length - 1);
        set({ phase: "fail", lit: g.seq[g.pos] });
        return;
      }
      const pos = g.pos + 1;
      if (pos < g.seq.length) return set({ pos });
      record(g.seq.length);
      set({ phase: "won", pos });
      timers.current.push(window.setTimeout(() => demo([...g.seq, rand()]), 800));
    },
    highlight: g.lit === null ? [] : [g.lit],
    state: g,
  };
}

/* ================================================================== */
/* Note rush: pluck notes as they reach the line                       */
/* ================================================================== */

const TRAVEL = 2400; // ms from entering to reaching the line
const WINDOW = 190; // ms either side that still counts
const PERFECT = 80;
const NOTES = 24;
const HIT_LINE = 14; // % from the left

type RushNote = { id: number; s: number; at: number; hit: number; state: "live" | "perfect" | "good" | "miss" };
type Pop = { id: number; s: number; text: string; color: string };

function useRush(active: boolean, record: (n: number) => void) {
  const [g, set, ref] = useGame({
    phase: "idle" as "idle" | "play" | "done",
    notes: [] as RushNote[],
    t0: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    miss: 0,
    pops: [] as Pop[],
  });
  const popId = useRef(0);

  const pop = (s: number, text: string, color: string) => {
    const id = ++popId.current;
    set({ pops: [...ref.current.pops, { id, s, text, color }] });
    window.setTimeout(() => set({ pops: ref.current.pops.filter((p) => p.id !== id) }), 650);
  };

  const start = () => {
    const t0 = performance.now();
    const gaps = [520, 640, 780, 960];
    let t = 700;
    const notes: RushNote[] = Array.from({ length: NOTES }, (_, id) => {
      t += gaps[Math.floor(Math.random() * gaps.length)];
      return { id, s: Math.floor(Math.random() * TUNING.length), at: t, hit: t0 + t + TRAVEL, state: "live" };
    });
    set({ phase: "play", notes, t0, score: 0, combo: 0, maxCombo: 0, perfect: 0, good: 0, miss: 0, pops: [] });
  };

  // Time hits against the notes' real animation start (read from the browser once the
  // animations are running), so judging matches exactly what the player sees.
  useEffect(() => {
    if (g.phase !== "play") return;
    const t0 = g.t0;
    let raf = requestAnimationFrame(function sync() {
      const anim = document.querySelector(`[data-rush="${t0}"]`)?.getAnimations()[0];
      const start = anim?.startTime;
      if (typeof start !== "number") {
        raf = requestAnimationFrame(sync);
        return;
      }
      for (const n of ref.current.notes) n.hit = start + n.at + TRAVEL;
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.phase, g.t0]);

  // Judge misses; finish the round when every note is judged.
  useEffect(() => {
    if (g.phase !== "play") return;
    const id = window.setInterval(() => {
      const now = performance.now();
      const c = ref.current;
      let changed = false;
      for (const n of c.notes) {
        if (n.state === "live" && now > n.hit + WINDOW) {
          n.state = "miss";
          c.miss++;
          c.combo = 0;
          changed = true;
          pop(n.s, "Miss", RED);
        }
      }
      if (c.notes.every((n) => n.state !== "live")) {
        record(c.score);
        set({ phase: "done" });
      } else if (changed) set({});
    }, 60);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [g.phase]);

  // Leaving the section ends the round.
  useEffect(() => {
    if (!active && ref.current.phase === "play") set({ phase: "idle", notes: [], pops: [] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return {
    start,
    stop: () => set({ phase: "idle", notes: [], pops: [] }),
    onPluck: (i: number) => {
      if (g.phase !== "play") return;
      const now = performance.now();
      let best: RushNote | null = null;
      for (const n of g.notes) {
        if (n.state !== "live" || n.s !== i) continue;
        const d = Math.abs(now - n.hit);
        if (d <= WINDOW && (!best || d < Math.abs(now - best.hit))) best = n;
      }
      if (!best) return;
      const perfect = Math.abs(now - best.hit) <= PERFECT;
      best.state = perfect ? "perfect" : "good";
      const combo = g.combo + 1;
      const mult = 1 + Math.min(4, Math.floor(combo / 5));
      set({
        combo,
        maxCombo: Math.max(g.maxCombo, combo),
        score: g.score + (perfect ? 100 : 50) * mult,
        perfect: g.perfect + (perfect ? 1 : 0),
        good: g.good + (perfect ? 0 : 1),
      });
      pop(i, perfect ? "Perfect" : "Good", perfect ? GREEN : AMBER);
    },
    state: g,
  };
}

/* ================================================================== */
/* Play a tune: guided tab for Ode to Joy (Beethoven, public domain)   */
/* ================================================================== */

// String 5 = high E4, string 4 = B3. Fret numbers as a guitarist would play them.
const PITCH: Record<string, { s: number; f: number }> = {
  C: { s: 4, f: 1 },
  D: { s: 4, f: 3 },
  E: { s: 5, f: 0 },
  F: { s: 5, f: 1 },
  G: { s: 5, f: 3 },
};
const TUNE = "EEFGGFEDCCDEEDD" + "EEFGGFEDCCDEDCC";
const TUNE_NOTES = TUNE.split("").map((n) => ({ n, ...PITCH[n] }));
const freqOf = (s: number, f: number) => TUNING[s].freq * 2 ** (f / 12);

function useTune(record: (seconds: number) => void) {
  const [g, set] = useGame({ phase: "idle" as "idle" | "play" | "done", idx: 0, mistakes: 0, t0: 0, time: 0, shake: 0 });
  const target = g.phase === "play" ? TUNE_NOTES[g.idx] : null;
  return {
    start: () => set({ phase: "play", idx: 0, mistakes: 0, t0: performance.now(), time: 0 }),
    stop: () => set({ phase: "idle", idx: 0 }),
    onPluck: (i: number) => {
      if (g.phase !== "play") return;
      if (i !== TUNE_NOTES[g.idx].s) return set({ mistakes: g.mistakes + 1, shake: g.shake + 1 });
      const idx = g.idx + 1;
      if (idx < TUNE_NOTES.length) return set({ idx });
      const time = Math.round((performance.now() - g.t0) / 100) / 10;
      record(time);
      set({ phase: "done", idx, time });
    },
    getFreq: (i: number) => (target && i === target.s ? freqOf(target.s, target.f) : undefined),
    highlight: target ? [target.s] : [],
    target,
    state: g,
  };
}

/* ================================================================== */
/* Player                                                              */
/* ================================================================== */

type Best = Partial<Record<Game, number>>;

export function GuitarPlayer() {
  const guitar = useRef<GuitarHandle>(null);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.3 });
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<Mode>("free");
  const [soundOn, setSoundOn] = useState(false);
  const [last, setLast] = useState<number | null>(null);
  const [best, setBest] = useState<Best>({});

  useEffect(() => {
    try {
      setBest(JSON.parse(localStorage.getItem("guitar-best") || "{}"));
    } catch {}
  }, []);

  /** Keep the better score (higher, or lower time for the tune). */
  const record = (game: Game) => (value: number) =>
    setBest((b) => {
      const prev = b[game];
      const better = prev === undefined || (game === "tune" ? value < prev : value > prev);
      if (!better || value <= 0) return b;
      const next = { ...b, [game]: value };
      try {
        localStorage.setItem("guitar-best", JSON.stringify(next));
      } catch {}
      return next;
    });

  const echo = useEcho(guitar, record("echo"));
  const rush = useRush(inView && mode === "rush", record("rush"));
  const tune = useTune(record("tune"));
  const games = { echo, rush, tune };

  const switchTo = (next: Mode) => {
    echo.stop();
    rush.stop();
    tune.stop();
    setMode(next);
  };
  const start = (game: Game) => {
    setSoundOn(true); // a game without sound is no fun; the toggle still mutes it
    games[game].start();
  };

  const onPluck = (i: number) => {
    setLast(i);
    if (mode !== "free") games[mode].onPluck(i);
  };

  // Keys 1–6 pluck the strings, left to right as on the buttons.
  useEffect(() => {
    if (!inView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest?.("input, textarea, [contenteditable]")) return;
      const k = Number(e.key);
      if (k >= 1 && k <= 6) {
        e.preventDefault();
        guitar.current?.pluck(k - 1, 0.5, 0.8);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inView]);

  const highlight = mode === "echo" ? echo.highlight : mode === "tune" ? tune.highlight : [];

  return (
    <div ref={box} className="overflow-hidden rounded-card-lg border border-white/10 bg-black/25 backdrop-blur-sm">
      {/* Header: title, modes, sound */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
        <div className="flex items-center gap-4">
          <span className="grid size-9 place-items-center rounded-full bg-[#eba44a] text-[#1c1108]">
            <Play width={14} height={14} />
          </span>
          <div>
            <p className="text-sm font-medium">Six strings, standard tuning</p>
            <p className="label text-fg-subtle">
              {mode === "free" ? "Free play" : "Game mode"}
              <span className="hidden md:inline"> · keys 1–6</span>
              {last !== null && <span className="text-[#eba44a]"> · {noteName(last)}</span>}
            </p>
          </div>
        </div>

        <div role="tablist" aria-label="Guitar mode" className="order-last flex w-full justify-between gap-0.5 overflow-x-auto rounded-full border border-white/10 p-1 sm:justify-start sm:gap-1 lg:order-none lg:w-auto">
          {MODES.map((md) => {
            const disabled = md.id === "rush" && reduced;
            return (
              <button
                key={md.id}
                type="button"
                role="tab"
                aria-selected={mode === md.id}
                disabled={disabled}
                title={disabled ? "Note rush needs motion; it's off because reduced motion is on" : undefined}
                onClick={() => switchTo(md.id)}
                className={cn(
                  "label relative h-9 shrink-0 rounded-full px-2.5 transition-colors disabled:opacity-35 sm:px-3.5",
                  mode === md.id ? "text-[#1c1108]" : "text-fg-muted hover:text-fg",
                )}
              >
                {mode === md.id && (
                  <m.span layoutId="guitar-mode" className="absolute inset-0 rounded-full bg-[#eba44a]" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className="relative sm:hidden">{md.short}</span>
                <span className="relative hidden sm:inline">{md.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSoundOn((s) => !s)}
          aria-pressed={soundOn}
          className={cn(
            "label flex h-10 items-center gap-2 rounded-full border px-4 transition-colors",
            soundOn ? "border-[#eba44a] bg-[#eba44a] text-[#1c1108]" : "border-white/20 text-fg hover:border-white/50",
          )}
        >
          {soundOn ? <Volume width={16} height={16} /> : <VolumeOff width={16} height={16} />}
          Sound {soundOn ? "on" : "off"}
        </button>
      </div>

      {/* HUD */}
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-white/10 px-5 py-3 md:px-6" aria-live="polite">
        {mode === "free" && <FreeHud />}
        {mode === "echo" && <EchoHud echo={echo} best={best.echo} onStart={() => start("echo")} />}
        {mode === "rush" && <RushHud rush={rush} best={best.rush} onStart={() => start("rush")} />}
        {mode === "tune" && <TuneHud tune={tune} best={best.tune} onStart={() => start("tune")} />}
      </div>

      {/* Strings */}
      <div data-cursor="pick" className="relative h-72 md:h-96">
        <GuitarStrings
          ref={guitar}
          soundOn={soundOn}
          color={AMBER}
          onPluck={onPluck}
          input={mode === "free" ? "sweep" : "tap"}
          highlight={highlight}
          getFreq={mode === "tune" ? tune.getFreq : undefined}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-6 left-[8%] w-px bg-white/10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-6 right-[8%] w-px bg-white/10" />
        {mode === "rush" && <RushLanes rush={rush} />}
        {mode === "tune" && tune.target && (
          <span
            aria-hidden="true"
            className="label pointer-events-none absolute left-4 -translate-y-1/2 rounded-full bg-[#eba44a] px-2.5 py-1 text-[#1c1108]"
            style={{ top: laneTop(tune.target.s) }}
          >
            {tune.target.f === 0 ? "Open" : `Fret ${tune.target.f}`}
          </span>
        )}
        {mode === "echo" && echo.state.phase === "fail" && echo.state.lit !== null && (
          <span
            aria-hidden="true"
            className="label pointer-events-none absolute left-4 -translate-y-1/2 rounded-full bg-[#ff6b6b] px-2.5 py-1 text-[#1c1108]"
            style={{ top: laneTop(echo.state.lit) }}
          >
            It was this one
          </span>
        )}
      </div>

      {/* String buttons */}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3 md:px-6">
        <span className="label text-fg-subtle">Pluck</span>
        <ul className="flex gap-1.5">
          {TUNING.map((t, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => guitar.current?.pluck(i, 0.5, 0.8)}
                aria-label={`Pluck the ${noteName(i)} string (key ${i + 1})`}
                data-cursor="pick"
                className={cn(
                  "label relative grid size-10 place-items-center rounded-full border transition-colors",
                  highlight.includes(i)
                    ? "border-[#eba44a] bg-[#eba44a]/15 text-[#eba44a]"
                    : last === i
                      ? "border-[#eba44a] text-[#eba44a]"
                      : "border-white/15 text-fg-muted hover:text-fg",
                )}
              >
                {t.name}
                <sub className="text-[0.55rem]">{t.octave}</sub>
                <span className="absolute -right-1 -top-1 hidden size-4 place-items-center rounded-full bg-white/10 text-[0.55rem] text-fg-subtle md:grid">
                  {i + 1}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* HUDs                                                                */
/* ------------------------------------------------------------------ */

function StartButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="label flex h-9 items-center gap-2 rounded-full bg-[#eba44a] px-4 text-[#1c1108] transition-transform active:scale-95"
    >
      <Play width={12} height={12} /> {children}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="label text-fg-subtle">{label}</span>
      <span className={cn("font-display text-lg font-semibold tabular-nums tracking-tight", accent && "text-[#eba44a]")}>{value}</span>
    </span>
  );
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-fg-muted">{children}</p>;
}

function FreeHud() {
  return (
    <Hint>
      <span className="hidden md:inline">Move your cursor across the strings, or press 1–6.</span>
      <span className="md:hidden">Tap a string, or swipe across them.</span> Pick a game above for a challenge.
    </Hint>
  );
}

function EchoHud({ echo, best, onStart }: { echo: ReturnType<typeof useEcho>; best?: number; onStart: () => void }) {
  const { phase, seq, pos } = echo.state;
  const round = seq.length;
  return (
    <>
      <m.div key={phase === "fail" ? `fail-${round}` : "ok"} animate={phase === "fail" ? { x: [0, -8, 8, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
        {phase === "idle" && <Hint>Listen to the sequence, then play it back. It grows by one note every round.</Hint>}
        {phase === "demo" && <Hint>Listen…</Hint>}
        {phase === "input" && (
          <Hint>
            Your turn · <span className="text-fg">{pos}</span> / {round}
          </Hint>
        )}
        {phase === "won" && <Hint><span className="text-[#7ee0a1]">Round {round} cleared ✓</span></Hint>}
        {phase === "fail" && (
          <Hint>
            <span className="text-[#ff6b6b]">Wrong string.</span> You made it through {round - 1} {round - 1 === 1 ? "round" : "rounds"}.
          </Hint>
        )}
      </m.div>
      <div className="flex items-center gap-5">
        <Stat label="Round" value={round || "–"} accent />
        <Stat label="Best" value={best ?? "–"} />
        {(phase === "idle" || phase === "fail") && <StartButton onClick={onStart}>{phase === "fail" ? "Try again" : "Start"}</StartButton>}
      </div>
    </>
  );
}

function RushHud({ rush, best, onStart }: { rush: ReturnType<typeof useRush>; best?: number; onStart: () => void }) {
  const s = rush.state;
  const mult = 1 + Math.min(4, Math.floor(s.combo / 5));
  const judged = s.perfect + s.good + s.miss;
  return (
    <>
      {s.phase === "idle" && <Hint>Pluck each string as its note reaches the line. Combos multiply your score.</Hint>}
      {s.phase === "play" && (
        <Hint>
          {judged} / {NOTES} notes <span className="text-fg-subtle">· click the string, tap it, or press 1–6</span>
        </Hint>
      )}
      {s.phase === "done" && (
        <Hint>
          <span className="text-fg">{s.perfect} perfect</span> · {s.good} good · {s.miss} missed · best combo {s.maxCombo}
          {best === s.score && s.score > 0 && <span className="text-[#7ee0a1]"> · New best!</span>}
        </Hint>
      )}
      <div className="flex items-center gap-5">
        <Stat label="Score" value={s.score.toLocaleString("en-GB")} accent />
        {s.phase === "play" && <Stat label="Combo" value={`${s.combo}${mult > 1 ? ` ×${mult}` : ""}`} />}
        <Stat label="Best" value={best !== undefined ? best.toLocaleString("en-GB") : "–"} />
        {s.phase !== "play" && <StartButton onClick={onStart}>{s.phase === "done" ? "Play again" : "Start"}</StartButton>}
      </div>
    </>
  );
}

const COL = 30; // px per tab column

function TuneHud({ tune, best, onStart }: { tune: ReturnType<typeof useTune>; best?: number; onStart: () => void }) {
  const s = tune.state;
  if (s.phase !== "play")
    return (
      <>
        {s.phase === "idle" ? (
          <Hint>
            <span className="text-fg">Ode to Joy</span> · Beethoven. Pluck the glowing string; the fret is shown for you.
          </Hint>
        ) : (
          <Hint>
            <span className="text-[#7ee0a1]">You played Ode to Joy.</span> {s.time}s, {s.mistakes} {s.mistakes === 1 ? "wrong note" : "wrong notes"}
            {best === s.time && <span className="text-[#7ee0a1]"> · New best!</span>}
          </Hint>
        )}
        <div className="flex items-center gap-5">
          <Stat label="Best" value={best !== undefined ? `${best}s` : "–"} />
          <StartButton onClick={onStart}>{s.phase === "done" ? "Play again" : "Start"}</StartButton>
        </div>
      </>
    );

  // Mini tab: high E on top, the current note fixed near the left edge.
  const shown = [5, 4];
  return (
    <>
      <m.div
        key={s.shake}
        animate={s.shake ? { x: [0, -6, 6, -3, 3, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="flex h-11 w-full max-w-xl gap-2"
        aria-label={`Note ${s.idx + 1} of ${TUNE_NOTES.length}: ${noteName(tune.target!.s)} string, ${tune.target!.f === 0 ? "open" : `fret ${tune.target!.f}`}`}
      >
        <div className="flex w-3 shrink-0 flex-col justify-around">
          {shown.map((str) => (
            <span key={str} className="label leading-none text-fg-subtle">
              {str === 5 ? "e" : "B"}
            </span>
          ))}
        </div>
        <div className="mask-fade-x relative flex-1 overflow-hidden">
          {shown.map((str, r) => (
            <span key={str} className="absolute inset-x-0 h-px bg-white/15" style={{ top: `${r * 50 + 25}%` }} />
          ))}
          <m.div className="absolute inset-y-0 left-0" animate={{ x: -(s.idx - 1) * COL }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
            {TUNE_NOTES.map((n, k) => (
              <span
                key={k}
                className={cn(
                  "absolute grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-mono text-[11px] transition-colors",
                  k === s.idx ? "bg-[#eba44a] text-[#1c1108]" : k < s.idx ? "bg-[#1c1108] text-fg-subtle" : "bg-[#1c1108] text-fg",
                )}
                style={{ left: k * COL + COL, top: `${shown.indexOf(n.s) * 50 + 25}%` }}
              >
                {n.f}
              </span>
            ))}
          </m.div>
        </div>
      </m.div>
      <div className="flex items-center gap-5">
        <Stat label="Note" value={`${s.idx + 1}/${TUNE_NOTES.length}`} accent />
        <Stat label="Wrong" value={s.mistakes} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Note rush lanes (CSS-animated, judged by time)                      */
/* ------------------------------------------------------------------ */

function RushLanes({ rush }: { rush: ReturnType<typeof useRush> }) {
  const s = rush.state;
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Hit line + targets */}
      <div className="absolute inset-y-4 w-px bg-[#eba44a]/60" style={{ left: `${HIT_LINE}%` }} />
      {TUNING.map((_, i) => (
        <span
          key={i}
          className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#eba44a]/50"
          style={{ left: `${HIT_LINE}%`, top: laneTop(i) }}
        />
      ))}

      {s.phase === "play" &&
        s.notes.map((n) => (
          <div
            key={`${s.t0}-${n.id}`}
            data-rush={s.t0}
            className="absolute inset-x-0 h-0"
            style={
              {
                top: laneTop(n.s),
                animation: `la-rush ${TRAVEL * 1.2}ms linear ${n.at}ms both`,
              } as CSSProperties
            }
          >
            <span
              className={cn(
                "absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[opacity,transform] duration-300",
                n.state === "live" && "bg-[#eba44a] shadow-[0_0_18px_4px_rgb(235_164_74/0.55)]",
                (n.state === "perfect" || n.state === "good") && "scale-[2.2] bg-[#7ee0a1] opacity-0",
                n.state === "miss" && "bg-[#ff6b6b] opacity-0",
              )}
              style={{ left: `${HIT_LINE}%` }}
            />
          </div>
        ))}

      <AnimatePresence>
        {s.pops.map((p) => (
          <m.span
            key={p.id}
            className="label absolute -translate-y-1/2"
            style={{ left: `calc(${HIT_LINE}% + 22px)`, top: laneTop(p.s), color: p.color }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
          >
            {p.text}
          </m.span>
        ))}
      </AnimatePresence>

      {s.phase !== "play" && (
        <span className="label absolute right-6 top-1/2 -translate-y-1/2 text-white/30">← notes arrive from here</span>
      )}
    </div>
  );
}
