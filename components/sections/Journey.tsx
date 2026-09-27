"use client";

import {
  AnimatePresence,
  m,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type CSSProperties, type ElementType, type RefObject } from "react";
import { journey, type JourneyEntry } from "@/content/site";
import { ArrowDown } from "@/components/ui/Icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { scrollToTarget, scrollToY } from "@/lib/scroll";

/** Where "skip" takes you: the section right after the journey. */
const NEXT_SECTION = { id: "experience", label: "Experience" };

// Drafts show up in development only, so the gaps are obvious while writing.
const ENTRIES: JourneyEntry[] = journey.entries.filter(
  (e: JourneyEntry) => !e.draft || process.env.NODE_ENV !== "production",
);

/* Chapters: an entry with `chapter` starts a new era that runs until the next one. */
const TINTS = ["#d4f34a", "#6aa8ff", "#eba44a", "#b69cff"];
const CHAPTER_OF = ENTRIES.reduce<number[]>((acc, e, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + (e.chapter ? 1 : 0));
  return acc;
}, []);
const CHAPTERS = ENTRIES.filter((e, i) => i === 0 || e.chapter);
const chapterLabel = (c: number) => CHAPTERS[c]?.chapter ?? journey.label;
const tint = (c: number) => TINTS[c % TINTS.length];
const pad2 = (n: number) => String(n).padStart(2, "0");

/* Wave geometry. The track is K screens wide so each year gets room, and it pans
   under the marker as you scroll. Nodes alternate troughs and peaks, starting low
   (as in the original sketch), with one extra point at the end for "Now". */
const K = Math.max(1, ENTRIES.length / 6);
const VB_W = 1000 * K;
const VB_H = 160;
const LOW = 132;
const HIGH = 28;
const PAD = 150;

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

/* ================================================================== */

export function Journey() {
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const pinned = desktop && !reduced;
  const ref = useRef<HTMLElement>(null);
  // The floating skip button shows only while the journey fills the middle of the screen.
  const inside = useInView(ref, { margin: "-45% 0px -45% 0px" });

  const skip = () => scrollToTarget(NEXT_SECTION.id);

  return (
    <section ref={ref} id="journey" aria-label="Journey" className="relative pt-28 md:pt-40">
      <div className="container-page">
        <SectionHeading
          label={`${journey.label} · ${ENTRIES[0].year} → now`}
          title={journey.title}
          aside={
            <>
              <p className="text-pretty md:text-lg">{journey.lede}</p>
              <button
                type="button"
                onClick={skip}
                className="group label mt-5 inline-flex items-center gap-2 text-fg transition-colors hover:text-accent-text"
              >
                Skip the journey
                <ArrowDown width={12} height={12} className="transition-transform duration-300 group-hover:translate-y-0.5" />
              </button>
            </>
          }
        />
      </div>

      {pinned ? <PinnedWave /> : <StackedTimeline />}

      <AnimatePresence>
        {inside && (
          <m.button
            type="button"
            onClick={skip}
            aria-label={`Skip the journey and go to ${NEXT_SECTION.label}`}
            className="group fixed bottom-6 left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full border border-line-strong bg-bg/80 pl-5 pr-2 text-sm font-medium text-fg shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl transition-colors hover:border-fg md:bottom-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: ease.outExpo }}
          >
            Skip to {NEXT_SECTION.label}
            <span className="grid size-8 place-items-center rounded-full bg-fg text-bg">
              <ArrowDown width={14} height={14} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </m.button>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ================================================================== */
/* Desktop: pinned, scroll-driven, chapter by chapter.                 */
/* ================================================================== */

function PinnedWave() {
  const outer = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const n = ENTRIES.length;
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.0005 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(n - 1, Math.max(0, Math.floor(v * n)));
    if (next === active) return;
    setDir(next > active ? 1 : -1);
    setActive(next);
  });

  // Camera: the K-wide track slides left so the marker drifts steadily across the screen.
  const panX = useTransform(progress, (v) => `${-v * ((K - 1) / K) * 100}%`);
  const bgYearY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  const jumpTo = (i: number) => {
    const el = outer.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    scrollToY(top + range * ((i + 0.05) / n));
  };

  const entry = ENTRIES[active];
  const chapter = CHAPTER_OF[active];

  return (
    <div ref={outer} className="relative" style={{ height: `calc(${n} * 55vh + 100vh)` }}>
      {/* Full story for assistive tech; the animated stage shows one year at a time. */}
      <ol className="sr-only">
        {ENTRIES.map((e) => (
          <li key={e.year}>
            <h3>
              {e.year}: {e.title}
            </h3>
            <p>{e.story}</p>
            {e.built && <p>Built: {e.built.join(", ")}</p>}
          </li>
        ))}
      </ol>

      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-20">
        {/* Era glow crossfades between chapters */}
        <AnimatePresence initial={false}>
          <m.div
            key={chapter}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(55% 60% at 75% 70%, color-mix(in oklab, ${tint(chapter)} 16%, transparent), transparent 70%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: ease.soft }}
          />
        </AnimatePresence>

        {/* Giant outlined year, rolling in the background */}
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[4vw] -right-[2vw] select-none font-display text-[26vw] leading-none font-bold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_var(--line-strong)]"
          style={{ y: bgYearY }}
        >
          <Odometer value={entry.year} stagger={0.06} />
        </m.div>

        <div className="container-page relative">
          {/* Chapter + counter */}
          <div className="flex items-end justify-between gap-6" aria-hidden="true">
            <div className="flex items-center gap-3">
              <m.span
                key={`dot-${chapter}`}
                className="block size-2 rounded-full"
                style={{ backgroundColor: tint(chapter) }}
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.8, 1] }}
                transition={{ duration: 0.7, ease: ease.outExpo }}
              />
              <span className="label flex gap-2 text-fg-muted">
                <span className="text-fg">Chapter {pad2(chapter + 1)}</span>
                <span className="relative inline-block overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <m.span
                      key={chapter}
                      className="inline-block"
                      initial={{ y: dir > 0 ? "110%" : "-110%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: dir > 0 ? "-110%" : "110%" }}
                      transition={{ duration: 0.6, ease: ease.outExpo }}
                    >
                      · {chapterLabel(chapter)}
                    </m.span>
                  </AnimatePresence>
                </span>
              </span>
            </div>
            <span className="label flex items-baseline gap-1 text-fg-subtle tabular-nums">
              <Odometer value={pad2(active + 1)} className="text-fg" />
              <span>/ {pad2(n)}</span>
            </span>
          </div>

          {/* Wave track (pans like a camera) */}
          <div className="mask-fade-x relative mt-4 overflow-hidden py-10">
            <m.div className="relative" style={{ width: `${K * 100}%`, aspectRatio: `${VB_W} / ${VB_H}`, x: panX }}>
              <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
                <path d={WAVE} fill="none" stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
                <m.path
                  d={WAVE}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  opacity={0.22}
                  style={{ pathLength: progress, filter: "blur(7px)" }}
                />
                <m.path
                  ref={pathRef}
                  d={WAVE}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  style={{ pathLength: progress }}
                />
              </svg>

              {ENTRIES.map((e, i) => (
                <WaveNode key={e.year} entry={e} index={i} reached={i <= active} current={i === active} onClick={() => jumpTo(i)} />
              ))}

              {/* "Now" end-point */}
              <span className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(POINTS[n])} aria-hidden="true">
                <span className="relative grid size-3 place-items-center">
                  <span className="absolute size-3 animate-pulse-dot rounded-full bg-accent" />
                  <span className="size-3 rounded-full border-2 border-accent" />
                </span>
                <span
                  className={cn(
                    "label absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-accent-text",
                    POINTS[n].y === HIGH ? "bottom-full mb-3" : "top-full mt-3",
                  )}
                >
                  Now
                </span>
              </span>

              <Comet progress={scrollYProgress} pathRef={pathRef} />
            </m.div>
          </div>

          {/* Active year */}
          <div className="relative mt-2 grid min-h-[16rem] gap-6 lg:grid-cols-12" aria-hidden="true">
            <div className="lg:col-span-4">
              <p className="font-display text-[clamp(3rem,6.5vw,6rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
                <Odometer value={entry.year} stagger={0.05} />
              </p>
              <WordReveal
                key={`t-${active}`}
                as="h3"
                text={entry.title}
                dir={dir}
                delay={0.1}
                stagger={0.04}
                className="mt-3 font-display text-title font-medium text-fg-muted"
              />
            </div>
            <div className="lg:col-span-8 lg:pt-6">
              <WordReveal
                key={`s-${active}`}
                text={entry.story}
                dir={dir}
                delay={0.15}
                className="max-w-3xl text-pretty font-display text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[1.45] font-medium tracking-[-0.01em]"
              />
              <BuiltTags key={`b-${active}`} items={entry.built} delay={0.35 + entry.story.split(" ").length * 0.008} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaveNode({
  entry,
  index,
  reached,
  current,
  onClick,
}: {
  entry: JourneyEntry;
  index: number;
  reached: boolean;
  current: boolean;
  onClick: () => void;
}) {
  const peak = POINTS[index].y === HIGH;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Jump to ${entry.year}: ${entry.title}`}
      aria-current={current ? "step" : undefined}
      className="group absolute -translate-x-1/2 -translate-y-1/2 p-4"
      style={pct(POINTS[index])}
    >
      <span className="relative grid size-4 place-items-center">
        {/* One ripple, the moment the line reaches this year */}
        <AnimatePresence>
          {reached && (
            <m.span
              key="ripple"
              className="absolute size-4 rounded-full border border-accent"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{ duration: 1.1, ease: ease.outExpo }}
            />
          )}
        </AnimatePresence>
        {current && <span className="absolute size-4 animate-pulse-dot rounded-full bg-accent/60" />}
        <span
          className={cn(
            "absolute size-4 rounded-full border-2 bg-bg transition-colors duration-500",
            reached ? "border-accent" : "border-line-strong",
          )}
        />
        <m.span
          className="absolute size-4 rounded-full bg-accent"
          initial={false}
          animate={{ scale: reached ? (current ? 1.35 : 1) : 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
        />
      </span>
      <span
        className={cn(
          "absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-lg font-semibold tracking-tight transition-[color,scale,opacity] duration-500 ease-[var(--ease-out-expo)]",
          peak ? "bottom-full mb-1 origin-bottom" : "top-full mt-1 origin-top",
          current ? "scale-125 text-fg" : reached ? "text-fg-muted" : "text-fg-subtle opacity-60 group-hover:opacity-100",
        )}
      >
        {entry.year}
      </span>
    </button>
  );
}

/** A glowing head with a short comet tail, riding the drawn line. */
function Comet({ progress, pathRef }: { progress: MotionValue<number>; pathRef: RefObject<SVGPathElement | null> }) {
  const head = useSpring(progress, { stiffness: 120, damping: 28 });
  const t1 = useSpring(progress, { stiffness: 70, damping: 24 });
  const t2 = useSpring(progress, { stiffness: 45, damping: 22 });
  const t3 = useSpring(progress, { stiffness: 30, damping: 20 });
  return (
    <>
      <CometDot v={t3} pathRef={pathRef} className="size-1.5 bg-accent" style={{ opacity: 0.25 }} />
      <CometDot v={t2} pathRef={pathRef} className="size-2 bg-accent" style={{ opacity: 0.4 }} />
      <CometDot v={t1} pathRef={pathRef} className="size-3 bg-accent" style={{ opacity: 0.6 }} />
      <CometDot
        v={head}
        pathRef={pathRef}
        className="size-5 bg-accent shadow-[0_0_0_6px_color-mix(in_oklab,var(--accent)_22%,transparent),0_0_28px_6px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
      />
    </>
  );
}

function CometDot({
  v,
  pathRef,
  className,
  style,
}: {
  v: MotionValue<number>;
  pathRef: RefObject<SVGPathElement | null>;
  className?: string;
  style?: CSSProperties;
}) {
  const point = (p: number) => {
    const path = pathRef.current;
    if (!path) return POINTS[0];
    return path.getPointAtLength(Math.min(1, Math.max(0, p)) * path.getTotalLength());
  };
  const left = useTransform(v, (p) => `${(point(p).x / VB_W) * 100}%`);
  const top = useTransform(v, (p) => `${(point(p).y / VB_H) * 100}%`);
  return (
    <m.span
      aria-hidden="true"
      className={cn("pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full", className)}
      style={{ left, top, ...style }}
    />
  );
}

/* ================================================================== */
/* Mobile & reduced motion: vertical timeline with chapters.           */
/* ================================================================== */

function StackedTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.8", "end 0.6"] });

  return (
    <div className="container-page mt-16">
      <ol ref={ref} className="relative flex flex-col gap-16 pl-8 md:pl-12">
        <span aria-hidden="true" className="absolute bottom-0 left-[5px] top-2 w-px bg-line-strong md:left-[7px]" />
        <m.span
          aria-hidden="true"
          className="absolute bottom-0 left-[5px] top-2 w-px origin-top bg-accent md:left-[7px]"
          style={{ scaleY: scrollYProgress }}
        />
        {ENTRIES.map((e, i) => (
          <StackedEntry key={e.year} entry={e} index={i} />
        ))}
      </ol>
    </div>
  );
}

function StackedEntry({ entry, index }: { entry: JourneyEntry; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const chapter = CHAPTER_OF[index];
  const startsChapter = index === 0 || !!entry.chapter;

  return (
    <li ref={ref} className="relative">
      {startsChapter && (
        <m.p
          className="label mb-8 flex items-center gap-3 text-fg-muted"
          initial={{ opacity: 0, x: -12 }}
          animate={inView ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.7, ease: ease.outExpo }}
        >
          <span className="h-px w-6" style={{ background: tint(chapter) }} />
          <span className="text-fg">Chapter {pad2(chapter + 1)}</span> · {chapterLabel(chapter)}
        </m.p>
      )}

      {/* Rail dot pops in with a ripple */}
      <span
        aria-hidden="true"
        className={cn("absolute -left-8 grid size-3 place-items-center md:-left-12 md:size-4", startsChapter ? "top-[3.6rem]" : "top-3")}
      >
        <m.span
          className="absolute inset-0 rounded-full border border-accent"
          initial={{ scale: 1, opacity: 0 }}
          animate={inView ? { scale: [1, 3.2], opacity: [0.8, 0] } : undefined}
          transition={{ duration: 1.1, ease: ease.outExpo, delay: 0.1 }}
        />
        <m.span
          className="absolute inset-0 rounded-full bg-accent"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.1 }}
        />
      </span>

      <p className="label text-fg-subtle" aria-hidden="true">
        {pad2(index + 1)} / {pad2(ENTRIES.length)}
      </p>
      <p className="mt-2 font-display text-[clamp(3rem,14vw,5.5rem)] leading-[0.9] font-semibold tracking-[-0.05em]">
        {inView ? <Odometer value={entry.year} stagger={0.06} /> : <span className="opacity-0">{entry.year}</span>}
      </p>
      <WordReveal
        as="h3"
        text={entry.title}
        play={inView}
        delay={0.15}
        stagger={0.04}
        className="mt-3 font-display text-title font-medium text-fg-muted"
      />
      <WordReveal
        text={entry.story}
        play={inView}
        delay={0.25}
        stagger={0.01}
        className="mt-5 text-pretty font-display text-[clamp(1.125rem,1.7vw,1.5rem)] leading-[1.45] font-medium tracking-[-0.01em]"
      />
      {inView && <BuiltTags items={entry.built} delay={0.5} />}
    </li>
  );
}

/* ================================================================== */
/* Shared motion pieces                                                */
/* ================================================================== */

/** Rolling digits, like an odometer. Non-digits render as-is. */
function Odometer({ value, className, stagger = 0.04 }: { value: string; className?: string; stagger?: number }) {
  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      <span className="sr-only">{value}</span>
      {value.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={i} aria-hidden="true" className="relative inline-block h-[1em] overflow-hidden leading-none">
            <m.span
              className="flex flex-col"
              initial={{ y: "0%" }}
              animate={{ y: `${-Number(ch) * 10}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * stagger }}
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="block h-[1em] leading-none">
                  {d}
                </span>
              ))}
            </m.span>
          </span>
        ) : (
          <span key={i} aria-hidden="true" className="leading-none">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/** Words slide up (or down, when scrolling back) through their own masks. */
function WordReveal({
  text,
  as: Tag = "p",
  dir = 1,
  delay = 0,
  stagger = 0.012,
  play = true,
  className,
}: {
  text: string;
  as?: ElementType;
  dir?: number;
  delay?: number;
  stagger?: number;
  play?: boolean;
  className?: string;
}) {
  const words = text.split(" ");
  const hidden = { y: dir > 0 ? "110%" : "-110%", opacity: 0 };
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
              <m.span
                className="inline-block"
                initial={hidden}
                animate={play ? { y: "0%", opacity: 1 } : hidden}
                transition={{ duration: 0.75, ease: ease.outExpo, delay: delay + i * stagger }}
              >
                {w}
              </m.span>
            </span>{" "}
          </span>
        ))}
      </span>
    </Tag>
  );
}

function BuiltTags({ items, delay = 0 }: { items?: string[]; delay?: number }) {
  if (!items?.length) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <m.span className="label mr-2 text-fg-subtle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay }}>
        Built
      </m.span>
      <ul className="contents">
        {items.map((b, i) => (
          <m.li
            key={b}
            className="label rounded-full border border-line px-3 py-1.5 text-fg-muted"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 22, delay: delay + 0.06 * (i + 1) }}
          >
            {b}
          </m.li>
        ))}
      </ul>
    </div>
  );
}
