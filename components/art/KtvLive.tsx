"use client";

import { AnimatePresence, m, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * KTV Vaos cover: one synchronised operations console following a single
 * closed-loop tank cleaning job: inspect → calibrate → desludge → recover oil →
 * clean → certified. Services and the 37+ years claim are from ktvvaos.com;
 * readings are illustrative.
 */

const CYAN = "#3cc9fe";
const OIL = "#c8791f";
const mono = "font-mono text-[10px] uppercase tracking-[0.12em]";

// 0–1 inspect · 2 calibrate · 3–4 desludge · 5–6 recover · 7–8 clean · 9 certified
const STEPS = 10;
const TICK = 1300;
const STAGES = ["Inspect", "Calibrate", "Desludge", "Recover", "Clean", "Certified"];
const STAGE_OF = [0, 0, 1, 2, 2, 3, 3, 4, 4, 5];

// Per-step readings (illustrative)
const LEVEL = [96, 96, 96, 112, 126, 150, 182, 204, 212, 214]; // liquid surface (svg y)
const SLUDGE = [34, 34, 34, 22, 11, 6, 4, 2, 0, 0]; // sludge depth (svg units)
const SLUDGE_M3 = [48, 48, 48, 31, 15, 8, 5, 2, 0, 0];
const OIL_M3 = [0, 0, 0, 0, 0, 12, 26, 30, 31, 31];
const LEL = [0, 0, 0, 2, 3, 2, 2, 1, 0, 0];

const SERVICES = [
  "Automated tank cleaning",
  "Sludge profiling & mapping",
  "Laser tank calibration",
  "Gas monitoring",
  "Nitrogen generation",
  "Cold tap",
  "Pipeline pigging",
  "Anti-corrosion",
  "Heat exchanger descaling",
  "Pipeline & tank construction",
  "Cathodic protection",
];
const NDT = ["Ultrasonic", "Magnetic particle", "Dye penetrant", "Radiography", "Eddy current"];

function useClock(ref: React.RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setTick((t) => t + 1), TICK);
    return () => window.clearInterval(id);
  }, [reduced, inView]);
  if (reduced) return { run: 0, step: 9 };
  return { run: Math.floor(tick / STEPS), step: tick % STEPS };
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-[#081722]/80 backdrop-blur-sm", className)}>{children}</div>;
}

export function KtvLive() {
  const ref = useRef<HTMLDivElement>(null);
  const { run, step } = useClock(ref);
  const stage = STAGE_OF[step];

  return (
    <div ref={ref} className="@container absolute inset-0 text-white">
      <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2.5 p-4 pt-16 @2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] @2xl:grid-rows-[auto_minmax(0,1fr)_auto] @2xl:gap-3 @2xl:p-[3%] @2xl:pt-[4.75rem]">
        {/* Job journey */}
        <Panel className="px-4 py-3 @2xl:col-span-3">
          <Journey stage={stage} runKey={run} />
        </Panel>

        {/* Tank */}
        <Panel className="relative min-h-0 overflow-hidden @2xl:row-start-2">
          <Tank step={step} run={run} />
        </Panel>

        {/* Readings */}
        <Panel className="hidden min-h-0 flex-col gap-3 p-3.5 @2xl:col-start-2 @2xl:row-start-2 @2xl:flex">
          <div className="flex items-center justify-between">
            <span className={cn(mono, "text-white")}>Gas monitor</span>
            <span className={cn(mono, "flex items-center gap-1.5 text-[var(--ink)]")}>
              <span className="size-1.5 animate-pulse-dot rounded-full bg-[var(--ink)]" /> Safe
            </span>
          </div>
          <dl className="grid grid-cols-3 gap-2">
            {[
              ["LEL", `${LEL[step]}%`],
              ["O₂", "20.9%"],
              ["H₂S", "0 ppm"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white/[0.04] p-2">
                <dt className={cn(mono, "text-white/45")}>{k}</dt>
                <dd className="mt-0.5 font-display text-base font-semibold tabular-nums tracking-tight">
                  <Rolling value={v} />
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex flex-col gap-3">
            <Meter label="Sludge in tank" value={`${SLUDGE_M3[step]} m³`} pct={SLUDGE_M3[step] / 48} color={OIL} />
            <Meter label="Oil recovered" value={`${OIL_M3[step]} m³`} pct={OIL_M3[step] / 31} color={CYAN} />
          </div>
        </Panel>

        {/* NDT */}
        <Panel className="hidden min-h-0 flex-col gap-2.5 p-3.5 @2xl:col-start-3 @2xl:row-start-2 @2xl:flex">
          <div className="flex items-center justify-between">
            <span className={cn(mono, "text-white")}>Inspection · NDT</span>
            <span className={cn(mono, stage >= 1 ? "text-[var(--ink)]" : "text-white/45")}>{stage >= 1 ? "Pass ✓" : "Scanning"}</span>
          </div>
          <AScan active={stage === 0} />
          <p className="font-display text-lg font-semibold tabular-nums tracking-tight">
            12.4 mm <span className={cn(mono, "text-white/45")}>wall thickness</span>
          </p>
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {NDT.map((n, i) => (
              <li
                key={n}
                className={cn(
                  mono,
                  "rounded-full border px-2 py-1 text-[9px] transition-colors duration-500",
                  i === step % NDT.length ? "border-[var(--ink)] text-[var(--ink)]" : "border-white/12 text-white/45",
                )}
              >
                {n}
              </li>
            ))}
          </ul>
        </Panel>

        {/* Services */}
        <Panel className="flex items-center gap-4 overflow-hidden px-4 py-3 @2xl:col-span-3">
          <div className="shrink-0">
            <p className="font-display text-xl font-semibold tracking-tight">37+ yrs</p>
            <p className={cn(mono, "text-white/45")}>Tanks · ships · rigs</p>
          </div>
          <div className="mask-fade-x flex min-w-0 flex-1 overflow-hidden">
            <div className="flex w-max animate-[marquee_28s_linear_infinite]">
              {[0, 1].map((k) => (
                <div key={k} className={cn(mono, "flex shrink-0 gap-6 pr-6 text-white/60")}>
                  {SERVICES.map((s) => (
                    <span key={s} className="flex items-center gap-2 whitespace-nowrap">
                      <span className="size-1 rounded-full bg-[var(--ink2)]" />
                      {s}
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

/* ------------------------------------------------------------------ */

function Tank({ step, run }: { step: number; run: number }) {
  const stage = STAGE_OF[step];
  const level = LEVEL[step];
  const sludge = SLUDGE[step];
  const recovering = stage === 3;
  const cleaning = stage === 4;
  const recovered = OIL_M3[step] / 31;
  const wave = "M0 0 Q 27.5 -7 55 0 T 110 0 T 165 0 T 220 0 T 275 0 T 330 0 T 385 0 T 440 0 V 260 H 0 Z";

  return (
    <>
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id={`ktv-tank-${run}`}>
            <rect x="42" y="42" width="216" height="206" rx="16" />
          </clipPath>
        </defs>

        {/* Liquid + sludge, clipped to the tank */}
        <g clipPath={`url(#ktv-tank-${run})`}>
          <m.g initial={false} animate={{ y: level }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>
            <g className="animate-[la-wave_5s_linear_infinite]" style={{ transformBox: "fill-box" }}>
              <path d={wave} fill={OIL} opacity="0.45" />
            </g>
            <g className="animate-[la-wave_7s_linear_infinite_reverse]" style={{ transformBox: "fill-box" }}>
              <path d={wave} transform="translate(0 6)" fill={OIL} opacity="0.55" />
            </g>
          </m.g>
          <m.rect x="42" width="216" fill="#3a2412" initial={false} animate={{ y: 248 - sludge, height: sludge }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }} />
          {sludge > 4 &&
            Array.from({ length: 12 }).map((_, i) => (
              <circle
                key={i}
                cx={52 + i * 17}
                cy={244}
                r="2"
                fill="#7a4a22"
                className="animate-[la-rise_3s_ease-in_infinite]"
                style={{ animationDelay: `${(i % 4) * 0.5}s`, transformBox: "fill-box" }}
              />
            ))}

          {/* Laser calibration sweep */}
          {stage === 1 && (
            <m.line
              key={`laser-${run}`}
              x1="42"
              x2="258"
              stroke={CYAN}
              strokeWidth="1.5"
              style={{ filter: `drop-shadow(0 0 4px ${CYAN})` }}
              initial={{ y1: 50, y2: 50 }}
              animate={{ y1: [50, 240, 50], y2: [50, 240, 50] }}
              transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1] }}
            />
          )}

          {/* Cleaning jets */}
          {cleaning &&
            [-60, -30, 0, 30, 60].map((a) => (
              <line
                key={a}
                x1="150"
                y1="58"
                x2={150 + Math.sin((a * Math.PI) / 180) * 170}
                y2={58 + Math.cos((a * Math.PI) / 180) * 170}
                stroke={CYAN}
                strokeWidth="1.5"
                strokeDasharray="3 7"
                opacity="0.8"
                className="animate-[la-dash_0.6s_linear_infinite]"
              />
            ))}
        </g>

        {/* Tank shell + level ticks */}
        <rect x="42" y="42" width="216" height="206" rx="16" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="258" x2="266" y1={62 + i * 44} y2={62 + i * 44} stroke="rgb(255 255 255 / 0.3)" />
        ))}
        <rect x="136" y="30" width="28" height="14" rx="3" fill="#081722" stroke="rgb(255 255 255 / 0.35)" />
        {cleaning && <circle cx="150" cy="58" r="5" fill={CYAN} />}

        {/* Ultrasonic probe crawling the wall */}
        {stage === 0 && (
          <m.g key={`probe-${run}`} initial={{ y: 60 }} animate={{ y: [60, 220, 60] }} transition={{ duration: 2.6, ease: "easeInOut" }}>
            <rect x="30" y="-8" width="14" height="16" rx="3" fill={CYAN} />
            {[10, 18, 26].map((r, i) => (
              <path
                key={r}
                d={`M${44 + r} -${r * 0.8} A ${r} ${r} 0 0 1 ${44 + r} ${r * 0.8}`}
                fill="none"
                stroke={CYAN}
                strokeWidth="1.2"
                className="animate-[la-ping_1.2s_ease-out_infinite]"
                style={{ animationDelay: `${i * 0.2}s`, transformBox: "fill-box", transformOrigin: "left center" }}
              />
            ))}
          </m.g>
        )}

        {/* Closed-loop pipe to the recovery unit */}
        <path d="M258 232 H 292 V 204 H 318" fill="none" stroke="rgb(255 255 255 / 0.25)" strokeWidth="6" strokeLinecap="round" />
        <path
          d="M258 232 H 292 V 204 H 318"
          fill="none"
          stroke={OIL}
          strokeWidth="3"
          strokeDasharray="5 7"
          strokeLinecap="round"
          opacity={recovering ? 1 : 0}
          className="animate-[la-dash_0.8s_linear_infinite] transition-opacity duration-500"
        />
        <rect x="318" y="118" width="56" height="130" rx="10" fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="2" />
        <m.rect
          x="320"
          width="52"
          rx="8"
          fill={OIL}
          opacity="0.7"
          initial={false}
          animate={{ y: 246 - recovered * 124, height: recovered * 124 }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        />
        <text x="346" y="110" textAnchor="middle" className="fill-white/60 font-mono text-[9px] tracking-[0.1em]">
          RECOVERY
        </text>
        <text x="150" y="272" textAnchor="middle" className="fill-white/45 font-mono text-[9px] tracking-[0.1em]">
          STORAGE TANK · CLOSED LOOP
        </text>
      </svg>

      <span className={cn(mono, "absolute left-3.5 top-3 text-white/70")}>
        {["Ultrasonic inspection", "Laser calibration", "Desludging", "Recovering oil", "Chemical cleaning", "Certified clean"][stage]}
      </span>

      <AnimatePresence>
        {step === 9 && (
          <m.span
            key={`cert-${run}`}
            className="absolute left-[18%] top-[38%] rounded-lg border-2 border-[var(--ink)] bg-[#081722]/70 px-3 py-1.5 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink)]"
            initial={{ scale: 1.8, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: -8, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
          >
            Certified clean
          </m.span>
        )}
      </AnimatePresence>
    </>
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
              <span className={cn("size-6 rounded-full border-2 bg-[#081722] transition-colors duration-500", i <= stage ? "border-[var(--ink)]" : "border-white/20")} />
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

function Meter({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={cn(mono, "text-white/50")}>{label}</span>
        <span className="font-display text-base font-semibold tabular-nums tracking-tight">
          <Rolling value={value} />
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <m.div
          className="h-full origin-left rounded-full"
          style={{ background: color }}
          initial={false}
          animate={{ scaleX: Math.max(0.02, pct) }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
    </div>
  );
}

/** Ultrasonic A-scan: echo peaks with a moving gate. */
function AScan({ active }: { active: boolean }) {
  const d =
    "M0 40 L20 40 L24 6 L28 40 L70 40 L74 22 L78 40 L120 40 L124 28 L128 40 L170 40 L174 33 L178 40 L220 40";
  return (
    <div className="relative h-16 overflow-hidden rounded-lg bg-black/30">
      <svg viewBox="0 0 220 48" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {[12, 24, 36].map((y) => (
          <line key={y} x1="0" x2="220" y1={y} y2={y} stroke="rgb(255 255 255 / 0.06)" />
        ))}
        <path d={d} fill="none" stroke={CYAN} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div
        className={cn("absolute inset-y-0 w-8 bg-[var(--ink)]/15 border-x border-[var(--ink)]/50", active ? "animate-[la-gate_2.6s_ease-in-out_infinite]" : "left-[28%]")}
      />
    </div>
  );
}

function Rolling({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={value}
          className="inline-block"
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  );
}

