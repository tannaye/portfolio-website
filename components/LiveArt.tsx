"use client";

import type { CSSProperties } from "react";
import type { LiveArtKind } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { KtvLive } from "@/components/art/KtvLive";
import { TradingLive } from "@/components/art/TradingLive";
import { ArtgidiLive } from "@/components/art/ArtgidiLive";
import { cn } from "@/lib/cn";

/**
 * One bespoke, animated illustration per live product, drawn from what the
 * product actually does. Pure SVG/CSS (transform + opacity animations), no images.
 * Figures inside are illustrative UI, not metrics.
 */

/** Brand palettes, taken from each product's own site (CSS variables, theme colour, logo). */
export const LIVE_TONES: Record<LiveArtKind, { ink: string; ink2: string; bg: string; onInk: string }> = {
  trading: { ink: "#d4f34a", ink2: "#ff5a5f", bg: "#0a0d08", onInk: "#0a0d08" },
  tendar: { ink: "#7a62eb", ink2: "#b8a9ff", bg: "#170d3a", onInk: "#ffffff" },
  oneport: { ink: "#bffb4f", ink2: "#ffcc1a", bg: "#022a15", onInk: "#022a15" },
  focus: { ink: "#ae00d5", ink2: "#67057c", bg: "#1a0620", onInk: "#ffffff" },
  jeroid: { ink: "#0094eb", ink2: "#54c9f4", bg: "#061433", onInk: "#ffffff" },
  artgidi: { ink: "#dc3545", ink2: "#fc5b62", bg: "#0e0b0b", onInk: "#ffffff" },
  ktv: { ink: "#3cc9fe", ink2: "#d7162f", bg: "#06121b", onInk: "#06121b" },
};

export function LiveArt({ art }: { art: LiveArtKind }) {
  const tone = LIVE_TONES[art];
  const Scene = { trading: TradingLive, tendar: Tendar, oneport: OnePort, focus: Focus, jeroid: Jeroid, artgidi: ArtgidiLive, ktv: KtvLive }[art];
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden"
      style={
        {
          "--ink": tone.ink,
          "--ink2": tone.ink2,
          "--bgc": tone.bg,
          "--on-ink": tone.onInk,
          background: `radial-gradient(120% 90% at 80% 0%, color-mix(in oklab, ${tone.ink} 26%, transparent), transparent 60%), ${tone.bg}`,
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgb(255 255 255 / 0.09) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />
      <Scene />
    </div>
  );
}

const mono = "font-mono text-[10px] uppercase tracking-[0.12em]";
const chip = "rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 backdrop-blur-sm";

/* ------------------------------------------------------------------ */
/* Tendar: a loan application flowing through the lending stack.       */
/* ------------------------------------------------------------------ */

function Tendar() {
  const stages = ["KYC", "Score", "Decision", "Disburse"];
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div className="absolute inset-0 grid place-items-center p-[6%] text-white">
      <div className="flex w-full max-w-[44rem] flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className={cn(mono, chip, "text-white/70")}>Application #2041 · ₦250,000</span>
          <span className={cn(mono, "text-[var(--ink2)]")}>● Live</span>
        </div>

        {/* Pipeline with a travelling pulse */}
        <div className="relative">
          <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-white/15" />
          <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 overflow-hidden">
            <div className="h-px w-1/3 animate-[la-sweep_2.8s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-r from-transparent via-[var(--ink)] to-transparent" />
          </div>
          <ol className="relative grid grid-cols-4 gap-2">
            {stages.map((s, i) => (
              <li key={s} className="flex flex-col items-center gap-2">
                <span
                  className="grid size-10 place-items-center rounded-full border border-[var(--ink)]/50 bg-[var(--bgc)] text-[var(--ink)] shadow-[0_0_24px_-4px_var(--ink)] animate-[la-blink_2.8s_ease-in-out_infinite]"
                  style={{ animationDelay: `${i * 0.7}s` }}
                >
                  {i === 0 ? "✓" : i === 1 ? "742" : i === 2 ? "✓" : "₦"}
                </span>
                <span className={cn(mono, "text-white/60")}>{s}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-6">
          <svg viewBox="0 0 120 120" className="size-24 shrink-0 -rotate-90 md:size-28">
            <circle cx="60" cy="60" r={R} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="8" />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ "--c": C, "--to": C * (1 - 0.82) } as CSSProperties}
              className="animate-[la-gauge_4.2s_cubic-bezier(0.16,1,0.3,1)_infinite]"
            />
          </svg>
          <div>
            <p className={cn(mono, "text-white/50")}>Credit score</p>
            <p className="font-display text-4xl font-semibold tracking-tight md:text-5xl">742</p>
            <p className={cn(mono, "mt-2 inline-block rounded-full bg-[var(--ink)] px-2.5 py-1 text-[var(--on-ink)]")}>Approved · BNPL eligible</p>
          </div>
          {/* BNPL: pay small small */}
          <div className="ml-auto hidden w-44 rounded-2xl border border-white/10 bg-black/20 p-4 sm:block">
            <p className={cn(mono, "text-white/50")}>Repayments · e-mandate</p>
            <div className="mt-3 flex h-16 items-end gap-2">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="relative flex-1 overflow-hidden rounded-md bg-white/10" style={{ height: "100%" }}>
                  <span
                    className="absolute inset-x-0 bottom-0 h-full origin-bottom animate-[la-fill-y_5s_cubic-bezier(0.65,0,0.35,1)_infinite] rounded-md bg-[var(--ink)]"
                    style={{ animationDelay: `${k * 0.45}s` }}
                  />
                </span>
              ))}
            </div>
            <div className={cn(mono, "mt-2 flex justify-between text-white/45")}>
              <span>Wk 1</span>
              <span>Wk 4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OnePort365: shipping lanes converging on African ports.             */
/* ------------------------------------------------------------------ */

const LANES = [
  { id: "l1", d: "M60 60 C 180 40, 260 150, 330 200", from: "Shanghai" },
  { id: "l2", d: "M150 20 C 220 50, 260 120, 330 200", from: "Rotterdam" },
  { id: "l3", d: "M50 150 C 140 110, 230 150, 330 200", from: "Houston" },
  { id: "l4", d: "M150 20 C 260 40, 380 90, 420 170", from: "" },
];

function OnePort() {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="absolute inset-0 text-white">
      <svg viewBox="0 0 500 280" className="absolute inset-x-0 bottom-0 top-12 h-[calc(100%-3rem)] w-full" preserveAspectRatio="xMidYMin meet">
        {LANES.map((l) => (
          <g key={l.id}>
            <path id={l.id} d={l.d} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1.2" />
            <path
              d={l.d}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.6"
              strokeDasharray="4 10"
              className="animate-[la-dash_2.4s_linear_infinite]"
            />
          </g>
        ))}
        {[
          [60, 60, "SHANGHAI"],
          [150, 20, "ROTTERDAM"],
          [50, 150, "HOUSTON"],
        ].map(([x, y, t]) => (
          <g key={t as string}>
            <circle cx={x as number} cy={y as number} r="3" fill="white" opacity="0.7" />
            <text x={(x as number) + 7} y={(y as number) - 6} className="fill-white/50 font-mono text-[8px] tracking-[0.12em]">
              {t}
            </text>
          </g>
        ))}
        {[
          [330, 200, "LAGOS"],
          [300, 222, "TEMA"],
          [420, 170, "MOMBASA"],
        ].map(([x, y, t]) => (
          <g key={t as string}>
            <circle cx={x as number} cy={y as number} r="5" fill="var(--ink)" opacity="0.35" className="origin-center animate-[la-ping_2.4s_ease-out_infinite]" style={{ transformBox: "fill-box" }} />
            <circle cx={x as number} cy={y as number} r="4" fill="var(--ink)" />
            <text
              x={(x as number) + (t === "MOMBASA" ? -9 : 9)}
              y={(y as number) + 14}
              textAnchor={t === "MOMBASA" ? "end" : "start"}
              className="fill-white font-mono text-[9px] tracking-[0.12em]"
            >
              {t}
            </text>
          </g>
        ))}
        {!reduced && (
          <>
            <g>
              <path d="M-7 -3 L6 -3 L9 0 L6 3 L-7 3 Z" fill="var(--ink2)" />
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.65 0 0.35 1">
                <mpath href="#l1" />
              </animateMotion>
            </g>
            <g>
              <path d="M0 -6 L2 -1 L8 1 L8 3 L2 2 L1 6 L3 8 L3 9 L0 8 L-3 9 L-3 8 L-1 6 L-2 2 L-8 3 L-8 1 L-2 -1 Z" fill="var(--ink)" transform="rotate(90)" />
              <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto">
                <mpath href="#l4" />
              </animateMotion>
            </g>
          </>
        )}
      </svg>

      {/* Tracking card */}
      <div className="absolute bottom-[8%] left-[6%] w-[min(17rem,60%)] rounded-2xl border border-white/10 bg-[var(--bgc)]/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className={cn(mono, "text-[var(--ink)]")}>Onetrack365</span>
          <span className={cn(mono, "text-white/50")}>In transit</span>
        </div>
        <p className="mt-2 font-display text-base font-semibold tracking-tight md:text-lg">40ft · Apapa → Warehouse</p>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full origin-left animate-[la-fill_5s_cubic-bezier(0.65,0,0.35,1)_infinite] rounded-full bg-[var(--ink)]" />
        </div>
        <div className={cn(mono, "mt-2 flex justify-between text-white/45")}>
          <span>Port</span>
          <span className="hidden sm:inline">GPS · haulage</span>
          <span>Delivered</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Focus MFB: a bank in your pocket.                                   */
/* ------------------------------------------------------------------ */

function Focus() {
  const toasts = [
    { t: "Account opened", s: "Instant · verified", icon: "✓" },
    { t: "Quick credit approved", s: "Funds on the way", icon: "₦" },
    { t: "Transfer sent", s: "E-banking", icon: "↗" },
  ];
  return (
    <div className="absolute inset-0 grid place-items-center p-[6%] text-white [perspective:900px]">
      <div className="relative w-full max-w-[22rem]">
        {/* Card */}
        <div className="relative aspect-[1.586] w-full rounded-[1.1rem] p-5 shadow-[0_40px_60px_-30px_rgb(0_0_0/0.8)] transition-transform duration-700 ease-[var(--ease-out-expo)] [transform:rotateX(14deg)_rotateY(-16deg)_rotateZ(3deg)] group-hover:[transform:rotateX(0deg)_rotateY(0deg)_rotateZ(0deg)]"
          style={{ background: "linear-gradient(135deg, #c21ee6, #67057c 55%, #280031)" }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-[1.1rem]">
            <div className="absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 animate-[la-sheen_4.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          </div>
          <div className="relative flex h-full flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <span className="font-display text-lg font-bold tracking-tight">Focus MFB</span>
              <span className="h-7 w-9 rounded-md bg-gradient-to-br from-[#fff3c9] to-[#c9973f]" />
            </div>
            <div>
              <p className="font-mono text-sm tracking-[0.2em]">•••• •••• •••• 2041</p>
              <p className={cn(mono, "mt-1 text-white/70")}>Personal · Business</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <ul className="relative -mt-3 ml-auto h-14 w-[80%] md:-mr-8">
          {toasts.map((x, i) => (
            <li
              key={x.t}
              className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--bgc)]/90 p-2.5 opacity-0 backdrop-blur-md animate-[la-toast_7.5s_cubic-bezier(0.16,1,0.3,1)_infinite]"
              style={{ animationDelay: `${i * 2.5}s` }}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-sm text-[var(--on-ink)]">{x.icon}</span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{x.t}</span>
                <span className={cn(mono, "block text-white/45")}>{x.s}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Jeroid: crypto, gift cards and bills orbiting one app.              */
/* ------------------------------------------------------------------ */

function Jeroid() {
  const coins = [
    { g: "₿", c: "#f7931a" },
    { g: "Ξ", c: "#8c8cff" },
    { g: "₮", c: "#26a17b" },
  ];
  return (
    <div className="absolute inset-0 text-white">
      {/* Gift cards fanned behind */}
      <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2">
        {[
          { r: -16, x: -34, bg: "linear-gradient(135deg,#6c5ce7,#0b2368)" },
          { r: 0, x: 0, bg: "linear-gradient(135deg,#54c9f4,#0a6a93)" },
          { r: 16, x: 34, bg: "linear-gradient(135deg,#0094eb,#0b2368)" },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-20 w-32 rounded-xl border border-white/15 shadow-xl transition-transform duration-700 ease-[var(--ease-out-expo)] md:h-24 md:w-40"
            style={{ background: c.bg, transform: `translate(calc(-50% + ${c.x}px), -50%) rotate(${c.r}deg)` }}
          >
            <span className={cn(mono, "absolute bottom-2 left-3 text-white/80")}>Gift card</span>
          </div>
        ))}
      </div>

      {/* Orbit */}
      <div className="absolute left-1/2 top-[44%] size-[min(78%,19rem)] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute inset-0 rounded-full border border-dashed border-white/15" />
        <div className="absolute inset-0 animate-[la-spin_14s_linear_infinite] group-hover:[animation-duration:6s]">
          {coins.map((c, i) => {
            const a = (i / coins.length) * Math.PI * 2;
            return (
              <span
                key={c.g}
                className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
              >
                <span
                  className="grid size-11 animate-[la-spin_14s_linear_infinite_reverse] place-items-center rounded-full font-display text-xl font-bold shadow-[0_0_30px_-6px_currentColor] group-hover:[animation-duration:6s]"
                  style={{ background: c.c, color: "#fff" }}
                >
                  {c.g}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Ticker */}
      <div className="absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 bg-black/25 py-2.5">
        <div className="flex w-max animate-[marquee_18s_linear_infinite]">
          {[0, 1].map((k) => (
            <div key={k} className={cn(mono, "flex shrink-0 gap-8 pr-8 text-white/60")}>
              {["BTC", "ETH", "USDT", "Gift cards", "Airtime", "Data", "Bills", "OTC desk"].map((t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="size-1 rounded-full bg-[var(--ink)]" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
