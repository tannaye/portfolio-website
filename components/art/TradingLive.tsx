"use client";

import { AnimatePresence, m, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * AI Trading Assistant cover: one synchronised console. A single clock drives the
 * chat, pipeline, Risk Engine, chart and logs, so every panel tells the same run.
 * The flow is the real one from the repo (LLM → zod TradingIntent → 11 ordered,
 * deterministic rules → BullMQ → MT5 Expert Advisor); prices and times are illustrative.
 */

const INK = "#d4f34a";
const RED = "#ff5a5f";
const mono = "font-mono text-[10px] uppercase tracking-[0.12em]";

const RULES = [
  "account.tradeable",
  "market.open",
  "session.allowed",
  "symbol.allowed",
  "lot.size",
  "risk.percent",
  "loss.daily",
  "trades.max_open",
  "trade.duplicate",
  "exposure.total",
  "margin.free",
];

const NODES = ["Message", "LLM", "zod", "Risk", "Queue", "MT5"];

type Log = { t: string; src: string; msg: string; tone?: "ok" | "bad" };
type Run = {
  ok: boolean;
  channel: string;
  user: string;
  intent: string;
  risk: string;
  /** Index of the rule that stops the trade, or -1. */
  failAt: number;
  reply: string;
  logs: Log[];
};

const RUNS: Run[] = [
  {
    ok: true,
    channel: "Telegram",
    user: "Buy 0.2 EURUSD, stop 20 pips",
    intent: '{ action: "BUY", symbol: "EURUSD", lots: 0.2, slPips: 20 }',
    risk: "Risk Engine · 11/11 passed",
    failAt: -1,
    reply: "Filled 0.20 EURUSD @ 1.08420 ✓",
    logs: [
      { t: "12:04:31", src: "inbound", msg: 'telegram "buy 0.2 eurusd sl 20"' },
      { t: "12:04:31", src: "llm", msg: "tool_call parse_trading_intent" },
      { t: "12:04:32", src: "zod", msg: "TradingIntent ✓ BUY EURUSD 0.2", tone: "ok" },
      { t: "12:04:32", src: "risk", msg: "11/11 passed · 0.4ms", tone: "ok" },
      { t: "12:04:34", src: "mt5", msg: "filled 0.20 EURUSD @ 1.08420", tone: "ok" },
    ],
  },
  {
    ok: false,
    channel: "WhatsApp",
    user: "Double my gold position",
    intent: '{ action: "BUY", symbol: "XAUUSD", lots: 2.0 }',
    risk: "Rule 07 · daily loss limit reached",
    failAt: 6,
    reply: "Daily loss limit hit. Nothing was executed.",
    logs: [
      { t: "12:05:10", src: "inbound", msg: 'whatsapp "double my gold position"' },
      { t: "12:05:10", src: "llm", msg: "tool_call parse_trading_intent" },
      { t: "12:05:11", src: "zod", msg: "TradingIntent ✓ BUY XAUUSD 2.0", tone: "ok" },
      { t: "12:05:11", src: "risk", msg: "✗ rule 07 loss.daily · limit reached", tone: "bad" },
      { t: "12:05:11", src: "reply", msg: "nothing executed · user notified" },
    ],
  },
];

const STEPS = 7; // per run: user, typing, intent, risk, result, hold, hold
const TICK = 1250;

const SRC_COLOR: Record<string, string> = {
  inbound: "#8ab4ff",
  llm: "#b69cff",
  zod: "#7dd3c0",
  risk: INK,
  mt5: INK,
  reply: "#8ab4ff",
};

/** One clock for the whole console. Runs only while visible; reduced motion shows the finished approved run. */
function useClock(ref: React.RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const inView = useInView(ref, { amount: 0.3 });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (STEPS * RUNS.length)), TICK);
    return () => window.clearInterval(id);
  }, [reduced, inView]);
  if (reduced) return { run: 0, step: 4 };
  return { run: Math.floor(tick / STEPS), step: tick % STEPS };
}

export function TradingLive() {
  const ref = useRef<HTMLDivElement>(null);
  const { run: r, step } = useClock(ref);
  const run = RUNS[r];
  const riskDone = step >= 3;
  const resolved = step >= 4;
  const node = step <= 3 ? step : run.ok ? 5 : 3;

  return (
    <div ref={ref} className="@container absolute inset-0 text-white" style={{ "--red": RED } as React.CSSProperties}>
      {/* Wide: full console. Narrow: chat + pipeline + logs. */}
      <div className="grid h-full grid-rows-[minmax(0,1fr)_auto_auto] gap-2.5 p-4 pt-16 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)_minmax(0,0.85fr)] @2xl:grid-rows-[auto_minmax(0,1fr)_auto] @2xl:gap-3 @2xl:p-[3%] @2xl:pt-[4.75rem]">
        {/* Chat */}
        <Panel className="flex min-h-0 flex-col @2xl:row-span-3">
          <div className="flex items-center gap-3 border-b border-white/10 px-3.5 py-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-[var(--ink)] font-display text-xs font-bold text-[#0a0d08]">AI</span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Trading Assistant</p>
              <p className={cn(mono, "text-white/45")}>
                {run.channel} · {step === 1 ? "typing…" : "online"}
              </p>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
            <AnimatePresence initial={false} mode="popLayout">
              <Msg key={`${r}-u`} side="right">
                <p className="rounded-2xl rounded-br-md bg-[var(--ink)] px-3 py-2 text-[12px] font-medium text-[#0a0d08]">{run.user}</p>
              </Msg>
              {step === 1 && (
                <Msg key={`${r}-typing`} side="left">
                  <span className="flex gap-1 rounded-2xl bg-white/[0.07] px-3 py-2.5">
                    {[0, 1, 2].map((d) => (
                      <span
                        key={d}
                        className="size-1.5 animate-[la-typing_1s_ease-in-out_infinite] rounded-full bg-white/60"
                        style={{ animationDelay: `${d * 0.15}s` }}
                      />
                    ))}
                  </span>
                </Msg>
              )}
              {step >= 2 && (
                <Msg key={`${r}-intent`} side="left">
                  <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-3 py-2">
                    <p className={cn(mono, "text-white/45")}>TradingIntent · zod ✓</p>
                    <p className="mt-1 font-mono text-[10.5px] leading-snug text-white/80">{run.intent}</p>
                  </div>
                </Msg>
              )}
              {riskDone && (
                <Msg key={`${r}-risk`} side="left">
                  <p
                    className={cn(
                      mono,
                      "rounded-full px-3 py-1.5",
                      run.ok ? "bg-[var(--ink)]/15 text-[var(--ink)]" : "bg-[var(--red)]/15 text-[var(--red)]",
                    )}
                  >
                    {run.ok ? "✓" : "✗"} {run.risk}
                  </p>
                </Msg>
              )}
              {resolved && (
                <Msg key={`${r}-reply`} side="left">
                  <p className="rounded-2xl rounded-bl-md bg-white/[0.07] px-3 py-2 text-[12px]">{run.reply}</p>
                </Msg>
              )}
            </AnimatePresence>
          </div>
        </Panel>

        {/* Pipeline */}
        <Panel className="px-4 py-3 @2xl:col-start-2 @2xl:row-start-1">
          <Pipeline node={node} ok={run.ok} riskDone={riskDone} runKey={r} />
        </Panel>

        {/* Chart (wide only) */}
        <Panel className="relative hidden min-h-0 overflow-hidden @2xl:col-start-2 @2xl:row-start-2 @2xl:block">
          <Chart showTrade={run.ok && resolved} blocked={!run.ok && riskDone} />
        </Panel>

        {/* Risk Engine (wide only) */}
        <Panel className="hidden min-h-0 flex-col px-3.5 py-3 @2xl:col-start-3 @2xl:row-span-2 @2xl:row-start-1 @2xl:flex">
          <div className="flex items-center justify-between">
            <span className={cn(mono, "text-white")}>RiskEngine</span>
            <span className={cn(mono, "text-white/40")}>pure · sync</span>
          </div>
          <ol className="mt-3 flex flex-1 flex-col justify-between gap-1">
            {RULES.map((rule, i) => {
              const state = !riskDone ? "idle" : run.failAt === -1 || i < run.failAt ? "pass" : i === run.failAt ? "fail" : "skip";
              return (
                <li key={rule} className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="w-4 text-white/30">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("flex-1 truncate", state === "fail" ? "text-[var(--red)]" : state === "skip" ? "text-white/25" : "text-white/70")}>
                    {rule}
                  </span>
                  <m.span
                    key={`${r}-${riskDone}`}
                    className="w-3 text-center"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: state === "idle" || state === "skip" ? 0.25 : 1, scale: 1 }}
                    transition={{ delay: riskDone ? i * 0.07 : 0, type: "spring", stiffness: 500, damping: 22 }}
                    style={{ color: state === "fail" ? RED : state === "pass" ? INK : "white" }}
                  >
                    {state === "pass" ? "✓" : state === "fail" ? "✗" : "·"}
                  </m.span>
                </li>
              );
            })}
          </ol>
        </Panel>

        {/* Logs */}
        <Panel className="hidden overflow-hidden px-4 py-2.5 @md:block @2xl:col-span-2 @2xl:col-start-2 @2xl:row-start-3">
          <div className="flex h-[4.6rem] flex-col justify-end gap-0.5 overflow-hidden font-mono text-[10.5px] leading-relaxed @2xl:h-[5.4rem]">
            <AnimatePresence initial={false} mode="popLayout">
              {run.logs.slice(0, Math.min(run.logs.length, step + 1)).map((l) => (
                <m.p
                  key={`${r}-${l.src}`}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-3 whitespace-nowrap"
                >
                  <span className="text-white/30">{l.t}</span>
                  <span className="w-12 shrink-0" style={{ color: SRC_COLOR[l.src] }}>
                    {l.src}
                  </span>
                  <span className={cn("truncate", l.tone === "bad" ? "text-[var(--red)]" : l.tone === "ok" ? "text-white" : "text-white/65")}>
                    {l.msg}
                  </span>
                </m.p>
              ))}
            </AnimatePresence>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-[#0c110b]/80 backdrop-blur-sm", className)}>{children}</div>;
}

function Msg({ children, side }: { children: ReactNode; side: "left" | "right" }) {
  return (
    <m.div
      layout
      className={cn("max-w-[90%]", side === "right" ? "self-end" : "self-start")}
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}

function Pipeline({ node, ok, riskDone, runKey }: { node: number; ok: boolean; riskDone: boolean; runKey: number }) {
  const pct = (i: number) => (i / (NODES.length - 1)) * 100;
  const bad = !ok && riskDone;
  const color = bad ? RED : INK;
  return (
    <div className="relative">
      <div className="absolute inset-x-3 top-3 h-px bg-white/12" />
      <div className="absolute inset-x-3 top-3 h-px">
        <m.div
          key={`trail-${runKey}`}
          className="h-px origin-left"
          style={{ background: color }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct(node) / 100 }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
        <m.span
          key={`packet-${runKey}`}
          className="absolute top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: color, boxShadow: `0 0 16px 3px ${color}` }}
          initial={{ left: "0%" }}
          animate={{ left: `${pct(node)}%` }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
      <ol className="relative flex justify-between">
        {NODES.map((n, i) => {
          const reached = i <= node;
          const isRisk = n === "Risk";
          return (
            <li key={n} className={cn("flex w-6 flex-col gap-1.5", i === 0 ? "items-start" : i === NODES.length - 1 ? "items-end" : "items-center")}>
              <span
                className={cn(
                  "size-6 rounded-full border-2 bg-[#0c110b] transition-colors duration-500",
                  reached ? (bad && i === 3 ? "border-[var(--red)]" : "border-[var(--ink)]") : "border-white/20",
                  isRisk && "ring-4 ring-[var(--ink)]/10",
                )}
              />
              <span className={cn(mono, "whitespace-nowrap text-[9px]", reached ? "text-white/80" : "text-white/35")}>{n}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Deterministic walk so server and client render the same candles.
const CANDLES = (() => {
  let p = 46;
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: 48 }, (_, i) => {
    const o = p;
    const c = o + Math.sin(i / 6) * 3.2 + (rnd() - 0.5) * 14;
    const h = Math.max(o, c) + rnd() * 6;
    const l = Math.min(o, c) - rnd() * 6;
    p = Math.max(12, Math.min(88, c));
    return { o, c, h, l };
  });
})();

function Chart({ showTrade, blocked }: { showTrade: boolean; blocked: boolean }) {
  const W = 12;
  const span = CANDLES.length * W;
  const y = (v: number) => 100 - v;
  const candles = (dx: number) =>
    CANDLES.map((k, i) => {
      const up = k.c >= k.o;
      const x = dx + i * W + W / 2;
      return (
        <g key={`${dx}-${i}`}>
          <line x1={x} x2={x} y1={y(k.h)} y2={y(k.l)} stroke={up ? INK : RED} strokeWidth="0.8" opacity="0.75" />
          <rect x={x - 3.5} width="7" y={y(Math.max(k.o, k.c))} height={Math.max(0.8, Math.abs(k.c - k.o))} fill={up ? INK : RED} rx="0.6" />
        </g>
      );
    });

  return (
    <>
      <svg viewBox={`0 0 ${span} 100`} preserveAspectRatio="none" className="absolute inset-x-0 bottom-[10%] top-[14%] h-[76%] w-[200%] animate-[la-wave_30s_linear_infinite] opacity-80">
        {candles(0)}
        {candles(span)}
      </svg>
      <span className={cn(mono, "absolute left-3 top-2.5 flex items-center gap-2 text-white/55")}>
        <span className="size-1.5 animate-pulse-dot rounded-full bg-[var(--ink)]" /> EURUSD · M5
      </span>

      <AnimatePresence>
        {showTrade &&
          [
            { top: "30%", label: "TP +40", color: INK, dash: true },
            { top: "50%", label: "Entry · BUY 0.2", color: "#ffffff", dash: false },
            { top: "66%", label: "SL −20", color: RED, dash: true },
          ].map((l, i) => (
            <m.div
              key={l.label}
              className="absolute inset-x-0"
              style={{ top: l.top }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="h-px w-full origin-left"
                style={{ background: l.dash ? `repeating-linear-gradient(90deg, ${l.color} 0 6px, transparent 6px 12px)` : l.color, opacity: 0.8 }}
              />
              <span
                className={cn(mono, "absolute -top-5 right-3 rounded-full px-2 py-0.5")}
                style={{ color: l.color, background: `color-mix(in oklab, ${l.color} 16%, #0c110b)` }}
              >
                {l.label}
              </span>
            </m.div>
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {blocked && (
          <m.div
            key="blocked"
            className="absolute inset-0 grid place-items-center bg-[#0c110b]/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <m.span
              className="rounded-lg border-2 border-[var(--red)] px-4 py-2 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]"
              initial={{ scale: 1.6, rotate: -8, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
            >
              Blocked · no trade
            </m.span>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
