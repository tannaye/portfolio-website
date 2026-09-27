"use client";

import { AnimatePresence, m, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * Artgidi cover: one synchronised marketplace. A single clock follows one artwork
 * through its life on Artgidi: commissioned → listed → curator's pick → auction → sold.
 * Titles and category counts are from artgidi.com; bids and timers are illustrative.
 */

const RED = "#dc3545";
const mono = "font-mono text-[10px] uppercase tracking-[0.12em]";

/* ------------------------------------------------------------------ */
/* Artwork                                                             */
/* ------------------------------------------------------------------ */

/** Generative "artworks": African-inspired geometry, no images. */
const PIECES = [
  "repeating-linear-gradient(90deg,#f4c542 0 12%,#1a1a1a 12% 18%,#c0392b 18% 34%,#1f7a4d 34% 44%,#f4c542 44% 50%)",
  "radial-gradient(circle at 32% 38%,#ef7a45 0 20%,transparent 21%),radial-gradient(circle at 68% 62%,#f4e3c1 0 24%,transparent 25%),#3b1d12",
  "conic-gradient(from 45deg,#1f3b73,#ef7a45,#f4c542,#1f3b73)",
  "repeating-linear-gradient(45deg,#f4e3c1 0 10px,#8b3a1a 10px 20px)",
  "linear-gradient(#0000 45%,#f4c542 45% 55%,#0000 55%),linear-gradient(90deg,#1a1a1a 0 50%,#c0392b 50%)",
];

/** Real titles from Artgidi's "Curator's Pick". */
const PICKS = [
  { t: "Deeper Things of Life", c: "Painting" },
  { t: "Brighter Future", c: "Painting" },
  { t: "Mama", c: "Painting" },
  { t: "Resilience", c: "Mixed media" },
  { t: "Market woman", c: "Painting" },
];

/* A portrait in a gele (headwrap) with gold earrings, against a sun. */
const HEAD = "M200 92 C 170 92, 152 118, 152 150 C 152 185, 174 212, 200 212 C 226 212, 248 185, 248 150 C 248 118, 230 92, 200 92 Z";
const GELE = "M142 120 C 136 70, 178 40, 205 42 C 247 44, 270 78, 262 120 C 240 100, 162 100, 142 120 Z";
const SHOULDERS = "M104 300 C 116 250, 160 232, 200 232 C 240 232, 284 250, 296 300 Z";
const NECK = "M182 204 L 182 236 L 218 236 L 218 204 Z";
const EAR_L = "M144 170 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0";
const EAR_R = "M242 170 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0";

const STROKES = [
  HEAD,
  GELE,
  "M236 58 C 266 36, 292 52, 276 82",
  "M173 150 C 179 155, 187 155, 192 150 M 208 150 C 213 155, 221 155, 227 150",
  "M200 158 L 195 177 L 205 177",
  "M187 190 C 195 196, 205 196, 213 190",
  NECK,
  SHOULDERS,
  EAR_L,
  EAR_R,
];

const FILLS: { d: string; fill: string; stroke?: string }[] = [
  { d: "M95 150 a 105 105 0 1 1 210 0 a 105 105 0 1 1 -210 0", fill: "#f4c542" },
  { d: SHOULDERS, fill: "#1f7a4d" },
  { d: NECK, fill: "#5a2e1b" },
  { d: HEAD, fill: "#6b3a22" },
  { d: GELE, fill: "#c0392b" },
  { d: "M150 104 C 190 88, 228 88, 258 104", fill: "none", stroke: "#f4c542" },
  { d: "M236 58 C 266 36, 292 52, 276 82 C 268 70, 252 64, 236 58 Z", fill: "#a93226" },
  { d: EAR_L, fill: "#f4c542" },
  { d: EAR_R, fill: "#f4c542" },
];

/** `sketch`: the lines draw themselves (restarting whenever `runKey` changes). */
function Portrait({ sketch = false, filled = true, runKey = 0 }: { sketch?: boolean; filled?: boolean; runKey?: number }) {
  return (
    <svg viewBox="0 0 400 300" className="size-full">
      <m.g initial={false} animate={{ opacity: filled ? 1 : 0 }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>
        {FILLS.map((f, i) => (
          <path key={i} d={f.d} fill={f.fill} stroke={f.stroke} strokeWidth={f.stroke ? 5 : undefined} strokeLinecap="round" />
        ))}
      </m.g>
      {STROKES.map((d, i) => (
        <m.path
          key={`${runKey}-${i}`}
          d={d}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: sketch ? 0 : 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, delay: i * 0.12, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}
    </svg>
  );
}

function Frame({ children, className, style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn("rounded-[3px] border-[6px] border-[#1c1717] bg-[#f4ecde] p-1.5 shadow-[0_24px_40px_-18px_rgb(0_0_0/0.9)]", className)}
      style={style}
    >
      {children}
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-[#140f0f]/80 backdrop-blur-sm", className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* The clock                                                           */
/* ------------------------------------------------------------------ */

// 0–1 sketch · 2 colour · 3 listed · 4 curator's pick · 5–7 auction · 8–9 sold
const STEPS = 10;
const TICK = 1400;
const STAGES = ["Commissioned", "Listed", "Curator's pick", "Auction", "Sold"];
const stageOf = (s: number) => (s < 3 ? 0 : s === 3 ? 1 : s === 4 ? 2 : s < 8 ? 3 : 4);

function useClock(ref: React.RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setTick((t) => t + 1), TICK);
    return () => window.clearInterval(id);
  }, [reduced, inView]);
  if (reduced) return { run: 0, step: 8 };
  return { run: Math.floor(tick / STEPS), step: tick % STEPS };
}

/* ------------------------------------------------------------------ */

export function ArtgidiLive() {
  const ref = useRef<HTMLDivElement>(null);
  const { run, step } = useClock(ref);
  const stage = stageOf(step);
  const listed = step >= 3;
  const bid = 350_000 + Math.max(0, Math.min(step, 7) - 5) * 50_000;
  const sold = step >= 8;

  return (
    <div ref={ref} className="@container absolute inset-0 text-white">
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5 p-4 pt-16 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.8fr)] @2xl:grid-rows-[auto_minmax(0,1fr)_auto] @2xl:gap-3 @2xl:p-[3%] @2xl:pt-[4.75rem]">
        {/* Journey */}
        <Panel className="px-4 py-3 @2xl:col-span-2 @2xl:col-start-2 @2xl:row-start-1">
          <Journey stage={stage} runKey={run} />
        </Panel>

        {/* Commission */}
        <Panel className="flex min-h-0 flex-col gap-3 p-3.5 @2xl:col-start-1 @2xl:row-span-3 @2xl:row-start-1">
          <div className="flex items-center justify-between">
            <span className={cn(mono, "text-[var(--ink2)]")}>Commission an artist</span>
            <span className={cn(mono, "text-white/40")}>{step < 2 ? "Sketching…" : step < 3 ? "Painting…" : "Finished"}</span>
          </div>
          {/* Size the frame from the space available in both directions (container units). */}
          <div className="grid min-h-0 flex-1 place-items-center" style={{ containerType: "size" }}>
            <Frame className="aspect-[4/3]" style={{ width: "min(100cqw, 133.33cqh, 26rem)" }}>
              <Portrait sketch filled={step >= 2} runKey={run} />
            </Frame>
          </div>
          <ol className="hidden gap-2 @2xl:flex">
            {["Imagine", "Commission", "Collect"].map((s, i) => {
              const on = i === (step < 2 ? 0 : step < 3 ? 1 : 2);
              return (
                <li key={s} className={cn(mono, "flex flex-1 items-center gap-2 transition-colors duration-500", on ? "text-white" : "text-white/35")}>
                  <span className={cn("grid size-5 place-items-center rounded-full border", on ? "border-[var(--ink)] text-[var(--ink)]" : "border-current")}>{i + 1}</span>
                  {s}
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* Auction */}
        <Panel className="relative hidden min-h-0 overflow-hidden @2xl:col-start-2 @2xl:row-start-2 @2xl:flex">
          <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_30%_50%,rgb(255_240_220/0.12),transparent)]" />
          <div className="relative flex w-full items-center gap-5 p-4">
            <div className="relative h-full max-h-[13rem] shrink-0" style={{ aspectRatio: "4 / 3" }}>
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={step >= 5 ? "lot" : "next"}
                  className="size-full"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.5 }}
                >
                  {step >= 5 ? (
                    <Frame className="size-full">
                      <Portrait />
                    </Frame>
                  ) : (
                    <div className="grid size-full place-items-center rounded-lg border border-dashed border-white/15">
                      <span className={cn(mono, "text-white/35")}>Next lot</span>
                    </div>
                  )}
                </m.div>
              </AnimatePresence>
            </div>
            <div className="min-w-0 flex-1">
              <p className={cn(mono, "flex items-center gap-2", step >= 5 && !sold ? "text-[var(--ink2)]" : "text-white/45")}>
                <span className={cn("size-1.5 rounded-full", step >= 5 && !sold ? "animate-pulse-dot bg-[var(--ink)]" : "bg-white/30")} />
                {sold ? "Auction closed" : step >= 5 ? "Live auction · Lot 024" : "Opens after listing"}
              </p>
              <p className={cn(mono, "mt-3 text-white/45")}>{sold ? "Sold for" : "Current bid"}</p>
              <div className="relative h-[1.1em] overflow-hidden font-display text-[clamp(1.5rem,2.6vw,2.4rem)] leading-none font-semibold tracking-tight">
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.span
                    key={step >= 5 ? bid : "—"}
                    className="absolute inset-0 whitespace-nowrap"
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {step >= 5 ? `₦${bid.toLocaleString("en-NG")}` : "—"}
                  </m.span>
                </AnimatePresence>
              </div>
              <p className={cn(mono, "mt-3 tabular-nums text-white/55")}>
                {step >= 5 && !sold ? `Paddle ${["12", "07", "31"][step - 5]} · ends in 00:${String(30 - (step - 5) * 10).padStart(2, "0")}` : " "}
              </p>
            </div>
          </div>
          <AnimatePresence>
            {sold && (
              <m.span
                key={`sold-${run}`}
                className="absolute right-5 top-4 rounded-lg border-2 border-[var(--ink)] px-3 py-1.5 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink)]"
                initial={{ scale: 1.8, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: -10, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 18 }}
              >
                Sold
              </m.span>
            )}
          </AnimatePresence>
        </Panel>

        {/* Curator's pick */}
        <Panel className="hidden min-h-0 flex-col p-3.5 @2xl:col-start-3 @2xl:row-start-2 @2xl:flex">
          <span className={cn(mono, "text-white/60")}>Curator's pick</span>
          <div className="relative mt-3 min-h-0 flex-1">
            <Stack listed={listed} run={run} />
          </div>
        </Panel>

        {/* Catalogue */}
        <Panel className="flex items-center gap-4 overflow-hidden px-4 py-3 @2xl:col-span-2 @2xl:col-start-2 @2xl:row-start-3">
          <div className="shrink-0">
            <p className={cn(mono, "text-white/45")}>On Artgidi</p>
            <p className="font-display text-xl font-semibold tabular-nums tracking-tight">
              <Rolling value={listed ? "1,331" : "1,330"} /> <span className="text-sm text-white/45">artworks</span>
            </p>
          </div>
          <div className="mask-fade-x flex min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[marquee_22s_linear_infinite]">
              {[0, 1].map((k) => (
                <div key={k} className={cn(mono, "flex shrink-0 gap-6 pr-6 text-white/55")}>
                  {[
                    [listed ? "918" : "917", "Paintings"],
                    ["69", "Sculptures"],
                    ["61", "Photos"],
                    ["36", "Digital art"],
                    ["28", "Collage"],
                    ["23", "Printwork"],
                    ["22", "Ceramics"],
                  ].map(([n, t]) => (
                    <span key={t} className="flex items-center gap-2 whitespace-nowrap">
                      <span className="size-1 rounded-full bg-[var(--ink)]" />
                      <span className="text-white">{n}</span> {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Journey({ stage, runKey }: { stage: number; runKey: number }) {
  const pct = (i: number) => (i / (STAGES.length - 1)) * 100;
  return (
    <div className="relative">
      <div className="absolute inset-x-3 top-3 h-px bg-white/12" />
      <div className="absolute inset-x-3 top-3 h-px">
        <m.div
          key={`trail-${runKey}`}
          className="h-px origin-left bg-[var(--ink)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct(stage) / 100 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
        <m.span
          key={`dot-${runKey}`}
          className="absolute top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ink)] shadow-[0_0_16px_3px_var(--ink)]"
          initial={{ left: "0%" }}
          animate={{ left: `${pct(stage)}%` }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
      <ol className="relative flex justify-between">
        {STAGES.map((s, i) => {
          const edge = i === 0 ? "items-start" : i === STAGES.length - 1 ? "items-end" : "items-center";
          return (
            <li key={s} className={cn("flex w-6 flex-col gap-1.5", edge)}>
              <span
                className={cn("size-6 rounded-full border-2 bg-[#140f0f] transition-colors duration-500", i <= stage ? "border-[var(--ink)]" : "border-white/20")}
              />
              <span
                className={cn(
                  mono,
                  "whitespace-nowrap text-[9px] transition-opacity duration-500",
                  i <= stage ? "text-white/85" : "text-white/35",
                  i !== stage && "opacity-0 @2xl:opacity-100",
                )}
              >
                {s}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Curated stack; once the new piece is listed it lands on top. */
function Stack({ listed, run }: { listed: boolean; run: number }) {
  const base = PICKS.map((p, i) => ({ ...p, id: `p${i}`, piece: PIECES[i % PIECES.length] })).slice(run % 3, (run % 3) + 3);
  const cards = listed ? [{ id: `new-${run}`, t: "New commission", c: "Portrait · just listed", piece: "" }, ...base.slice(0, 2)] : base;
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-full max-h-[12rem] w-full max-w-[10rem]">
        <AnimatePresence initial={false}>
          {cards
            .slice()
            .reverse()
            .map((c, depth, arr) => {
              const pos = arr.length - 1 - depth;
              return (
                <m.div
                  key={c.id}
                  className="absolute inset-0 rounded-xl border border-white/10 bg-[#1c1717] p-2 shadow-[0_20px_30px_-16px_rgb(0_0_0/0.9)]"
                  style={{ zIndex: 10 - pos }}
                  initial={{ y: -60, opacity: 0, rotate: -8 }}
                  animate={{ x: pos * 12, y: pos * -10, rotate: pos * 4, scale: 1 - pos * 0.06, opacity: 1 }}
                  exit={{ x: 80, opacity: 0, rotate: 12 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                >
                  <div className="h-[72%] w-full overflow-hidden rounded-md bg-[#f4ecde]" style={c.piece ? { background: c.piece } : undefined}>
                    {!c.piece && <Portrait />}
                  </div>
                  <p className="mt-2 truncate text-[11px] font-semibold">{c.t}</p>
                  <p className={cn(mono, "truncate text-[9px] text-white/45")}>{c.c}</p>
                </m.div>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Rolling({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1.1em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={value}
          className="inline-block"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
