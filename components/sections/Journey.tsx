"use client";

import { m, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { journey, type JourneyEntry } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { scrollToY } from "@/lib/scroll";

// Drafts show up in development only, so the gaps are obvious while writing.
const ENTRIES: JourneyEntry[] = journey.entries.filter((e: JourneyEntry) => !e.draft || process.env.NODE_ENV !== "production");

/* Wave geometry, in a 1000×200 viewBox. Nodes sit on alternating troughs and peaks,
   starting low (as in the sketch), with one extra point at the end for "Now". */
const VB_W = 1000;
const VB_H = 200;
const LOW = 165;
const HIGH = 35;
const PAD = 40;

const POINTS = Array.from({ length: ENTRIES.length + 1 }, (_, i) => ({
  x: PAD + (i * (VB_W - PAD * 2)) / ENTRIES.length,
  y: i % 2 === 0 ? LOW : HIGH,
}));

const WAVE = POINTS.reduce((d, b, i) => {
  if (i === 0) return `M${b.x},${b.y}`;
  const a = POINTS[i - 1];
  const dx = (b.x - a.x) / 2;
  return `${d} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
}, "");

const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / VB_W) * 100}%`, top: `${(p.y / VB_H) * 100}%` });

export function Journey() {
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const pinned = desktop && !reduced;

  return (
    <section id="journey" aria-label="Journey" className="relative pt-28 md:pt-40">
      <div className="container-page">
        <SectionHeading
          label={`${journey.label} · ${ENTRIES[0].year} → now`}
          title={journey.title}
          aside={<p className="text-pretty md:text-lg">{journey.lede}</p>}
        />
      </div>
      {pinned ? <PinnedWave /> : <StackedTimeline />}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: the wave draws itself as you scroll; the active year's     */
/* story sits underneath. Click a year to jump to it.                  */
/* ------------------------------------------------------------------ */

function PinnedWave() {
  const outer = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const n = ENTRIES.length;
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });

  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));

  // Travelling marker follows the drawn tip of the path.
  const point = (v: number) => {
    const path = pathRef.current;
    if (!path) return POINTS[0];
    return path.getPointAtLength(Math.min(1, Math.max(0, v)) * path.getTotalLength());
  };
  const markerLeft = useTransform(progress, (v) => `${(point(v).x / VB_W) * 100}%`);
  const markerTop = useTransform(progress, (v) => `${(point(v).y / VB_H) * 100}%`);

  const jumpTo = (i: number) => {
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    scrollToY(top + range * ((i + 0.05) / n));
  };

  return (
    <div ref={outer} className="relative" style={{ height: `calc(${n} * 50vh + 100vh)` }}>
      {/* Full story for assistive tech; the visual panel below only shows one year at a time. */}
      <ol className="sr-only">
        {ENTRIES.map((e) => (
          <li key={e.year}>
            <EntryBody entry={e} />
          </li>
        ))}
      </ol>

      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-20">
        <div className="container-page">
          {/* Wave */}
          <div className="relative aspect-[5/1] w-full">
            <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
              <path d={WAVE} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />
              <m.path
                ref={pathRef}
                d={WAVE}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ pathLength: progress }}
              />
            </svg>

            {ENTRIES.map((e, i) => {
              const peak = POINTS[i].y === HIGH;
              const reached = i <= active;
              return (
                <button
                  key={e.year}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Jump to ${e.year}: ${e.title}`}
                  aria-current={i === active ? "step" : undefined}
                  className="group absolute -translate-x-1/2 -translate-y-1/2 p-3"
                  style={pct(POINTS[i])}
                >
                  <span
                    className={cn(
                      "block size-3.5 rounded-full border-2 transition-[background-color,border-color,transform] duration-500",
                      reached ? "border-accent bg-accent" : "border-line-strong bg-bg",
                      i === active ? "scale-150" : "group-hover:scale-125",
                      e.draft && "border-dashed",
                    )}
                  />
                  <span
                    className={cn(
                      "label absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-colors duration-500",
                      peak ? "bottom-full mb-1" : "top-full mt-1",
                      i === active ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
                    )}
                  >
                    {e.year}
                  </span>
                </button>
              );
            })}

            {/* "Now" end-point */}
            <span className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(POINTS[n])} aria-hidden="true">
              <span className="relative grid size-3 place-items-center">
                <span className="absolute size-3 animate-pulse-dot rounded-full bg-accent" />
                <span className="size-3 rounded-full border-2 border-accent" />
              </span>
              <span className={cn("label absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-accent-text", POINTS[n].y === HIGH ? "bottom-full mb-3" : "top-full mt-3")}>
                Now
              </span>
            </span>

            {/* Travelling marker */}
            <m.span
              aria-hidden="true"
              className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_color-mix(in_oklab,var(--accent)_25%,transparent)]"
              style={{ left: markerLeft, top: markerTop }}
            />
          </div>

          {/* Active year */}
          <div className="relative mt-14 min-h-[17rem]" aria-hidden="true">
            {/* Enter-only, keyed by year: always renders the current year, however fast you scroll. */}
            <m.div
              key={active}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: ease.outExpo }}
            >
              <EntryBody entry={ENTRIES[active]} index={active} total={n} />
            </m.div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile & reduced motion: a vertical timeline, everything visible.   */
/* ------------------------------------------------------------------ */

function StackedTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });

  return (
    <div className="container-page mt-16">
      <ol ref={ref} className="relative flex flex-col gap-14 pl-8 md:pl-12">
        <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-line-strong md:left-[7px]" />
        <m.span
          aria-hidden="true"
          className="absolute bottom-0 left-[5px] top-2 w-px origin-top bg-accent md:left-[7px]"
          style={{ scaleY: scrollYProgress }}
        />
        {ENTRIES.map((e, i) => (
          <FadeIn as="li" key={e.year} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-8 top-3 size-3 rounded-full border-2 border-accent bg-bg md:-left-12 md:size-4",
                e.draft && "border-dashed border-line-strong",
              )}
            />
            <EntryBody entry={e} index={i} total={ENTRIES.length} />
          </FadeIn>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EntryBody({ entry, index, total }: { entry: JourneyEntry; index?: number; total?: number }) {
  return (
    <div
      className={cn(
        "grid gap-6 lg:grid-cols-12 lg:gap-6",
        entry.draft && "rounded-card-lg border border-dashed border-line-strong p-6",
      )}
    >
      <div className="lg:col-span-4">
        {index !== undefined && total !== undefined && (
          <p className="label text-fg-subtle">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            {entry.draft && <span className="text-accent-text"> · Draft, visible in development only</span>}
          </p>
        )}
        <p className="mt-3 font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.9] font-semibold tracking-[-0.05em]">{entry.year}</p>
        <h3 className="mt-3 font-display text-title font-medium text-fg-muted">{entry.title}</h3>
      </div>
      <div className="lg:col-span-8 lg:pt-7">
        <p className="max-w-3xl text-pretty font-display text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[1.45] font-medium tracking-[-0.01em]">
          {entry.story}
        </p>
        {entry.built && entry.built.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="label mr-2 text-fg-subtle">Built</span>
            <ul className="contents">
              {entry.built.map((b) => (
                <li key={b} className="label rounded-full border border-line px-3 py-1.5 text-fg-muted">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
