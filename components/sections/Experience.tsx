"use client";

import { m, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { experience, stats } from "@/content/site";
import { CountUp } from "@/components/animations/CountUp";
import { FadeIn } from "@/components/animations/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useIsDesktop, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import type { Role } from "@/content/site";

export function Experience() {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const desktop = useIsDesktop();
  const reduced = usePrefersReducedMotion();
  const pinned = desktop && !reduced;
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!pinned || !track.current) return;
    const el = track.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => -v * distance);
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  return (
    <section id="experience" aria-label="Engineering experience" className="relative pt-28 md:pt-40" style={{ "--tint": "var(--tint-eng)" } as React.CSSProperties}>
      <div className="container-page">
        <SectionHeading
          index="01"
          label="Engineering · Experience"
          title={["Serious software,", "built to be trusted."]}
          aside={
            <p className="text-pretty md:text-lg">
              Six years on backend systems where correctness, scalability and customer trust are the job: digital banking, lending,
              transactions and the integrations in between.
            </p>
          }
        />
      </div>

      <div ref={outer} className={cn("relative mt-16 md:mt-24", pinned && "h-[300vh]")}>
        <div className={cn(pinned && "sticky top-0 flex h-screen flex-col justify-center overflow-hidden")}>
          <m.ol
            ref={track}
            style={pinned ? { x } : undefined}
            className={cn(
              "flex flex-col gap-4 px-[clamp(1rem,4vw,3rem)]",
              pinned && "w-max flex-row gap-6 pr-[20vw]",
            )}
          >
            {experience.map((role, i) => (
              <RoleCard key={role.company} role={role} index={i} total={experience.length} pinned={pinned} />
            ))}
          </m.ol>

          {pinned && (
            <div className="container-page mt-10" aria-hidden="true">
              <div className="label flex items-center gap-4 text-fg-subtle">
                <span>2019</span>
                <div className="relative h-px flex-1 bg-line">
                  <m.div className="absolute inset-0 origin-left bg-[var(--tint-eng)]" style={{ scaleX: bar }} />
                </div>
                <span>Now</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-page py-24 md:py-32">
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-card-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08} className="flex flex-col justify-between gap-10 bg-bg p-6 md:p-8">
              <dt className="order-2 max-w-[16rem] text-sm leading-relaxed text-fg-muted">{s.label}</dt>
              <dd className="order-1 font-display text-display font-semibold tabular-nums">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}

function RoleCard({ role, index, total, pinned }: { role: Role; index: number; total: number; pinned: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li
      className={cn(
        "card flex flex-col gap-8 p-6 md:p-10",
        pinned && "min-h-[68vh] w-[min(52rem,62vw)] justify-between",
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <span className="label text-[var(--tint-eng)]">{role.period}</span>
        <span className="label text-fg-subtle">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div>
        <h3 className="font-display text-[clamp(2.5rem,5.5vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          {role.company}
        </h3>
        <p className="mt-3 text-lg text-fg-muted">{role.title}</p>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed md:text-xl">{role.summary}</p>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="label mt-6 flex items-center gap-3 text-fg transition-colors hover:text-[var(--tint-eng)]"
        >
          <span className="relative grid size-6 place-items-center rounded-full border border-line-strong">
            <span className="absolute h-px w-2.5 bg-current" />
            <span className={cn("absolute h-2.5 w-px bg-current transition-transform duration-500", open && "rotate-90 scale-y-0")} />
          </span>
          {open ? "Hide the story" : "Selected impact"}
        </button>

        <div
          id={panelId}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-700 ease-[var(--ease-out-expo)]",
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
          inert={!open}
        >
          <ul className="min-h-0 overflow-hidden">
            {role.highlights.map((h) => (
              <li key={h} className="mt-4 flex max-w-2xl gap-4 text-pretty leading-relaxed text-fg-muted first:mt-6">
                <span className="mt-[0.7em] h-px w-4 shrink-0 bg-[var(--tint-eng)]" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Technology">
        {role.stack.map((t) => (
          <li key={t} className="label rounded-full border border-line px-3 py-1.5 text-fg-muted">
            {t}
          </li>
        ))}
      </ul>
    </li>
  );
}
