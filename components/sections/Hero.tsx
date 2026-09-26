"use client";

import { AnimatePresence, m, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { hero, site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { ArrowDown } from "@/components/ui/Icons";
import { useSectionLink } from "@/components/Header";
import { useClock, useRichMotion } from "@/lib/hooks";
import { ease, spring } from "@/lib/motion";

export function Hero() {
  const rich = useRichMotion();
  const time = useClock(site.timezone);
  const sectionLink = useSectionLink();
  const ref = useRef<HTMLElement>(null);

  // Name lines drift gently against the cursor, at different depths.
  const mx = useMotionValue(0);
  const smx = useSpring(mx, spring.gentle);
  const line1X = useTransform(smx, (v) => v * -14);
  const line2X = useTransform(smx, (v) => v * 22);

  useEffect(() => {
    if (!rich) return;
    const onMove = (e: PointerEvent) => mx.set(e.clientX / window.innerWidth - 0.5);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rich, mx]);

  // Content lifts away slightly as you scroll past the hero.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // The intro runs in CSS (see .hero-* in globals.css), keyed off <html class="intro-done">.
  // It starts on first paint, not after hydration, which keeps LCP fast.
  const fade = (delay: number) => ({ className: "hero-fade", style: { "--d": `${delay}s` } as CSSProperties });

  return (
    <section ref={ref} id="top" aria-label="Introduction" className="relative flex min-h-[100svh] flex-col pb-8 pt-24 md:pt-28">
      <m.div className="container-page flex flex-1 flex-col" style={rich ? { y: contentY } : undefined}>
        {/* Meta row */}
        <div {...fade(0.5)} className="hero-fade label flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-fg-muted">
          <span className="hidden sm:inline">{hero.eyebrow}</span>
          <span className="flex items-center gap-5">
            <span className="tabular-nums">
              Lagos {time || "--:--:--"} {site.timezoneLabel}
            </span>
            {site.available && (
              <span className="flex items-center gap-2 text-fg">
                <span className="relative grid size-2 place-items-center">
                  <span className="absolute size-2 animate-pulse-dot rounded-full bg-accent" />
                  <span className="size-2 rounded-full bg-accent" />
                </span>
                {site.availabilityLabel}
              </span>
            )}
          </span>
        </div>

        <div className="relative mt-8 md:mt-10 lg:mt-12">
          <h1 className="font-display text-[clamp(3.5rem,17vw,13rem)] font-bold leading-[0.86] tracking-[-0.055em] lg:text-mega">
            <span className="sr-only">{site.name}</span>
            <span aria-hidden="true">
              <m.span className="block" style={rich ? { x: line1X } : undefined}>
                <HeroLine delay={0.15}>{site.firstName}</HeroLine>
              </m.span>
              <m.span className="block" style={rich ? { x: line2X } : undefined}>
                <HeroLine delay={0.23}>{site.lastName}</HeroLine>
              </m.span>
            </span>
          </h1>

          <Portrait />
        </div>

        {/* Lower band */}
        <div className="mt-10 grid flex-1 grid-cols-1 content-end gap-10 md:grid-cols-12 lg:mt-14">
          <div {...fade(0.75)} className="hero-fade md:col-span-5 lg:col-span-4">
            <span className="label text-fg-subtle">Currently</span>
            <RoleRotator />
          </div>

          <div className="md:col-span-7 lg:col-span-5">
            <p className="font-display text-headline font-semibold">
              {hero.lines.map((line, i) => (
                <HeroLine key={line} delay={0.55 + i * 0.09}>
                  {line}
                </HeroLine>
              ))}
            </p>
            <p {...fade(0.9)} className="hero-fade mt-5 max-w-xl text-pretty text-base leading-relaxed text-fg-muted md:text-lg">
              {hero.body}
            </p>
            <div {...fade(1)} className="hero-fade mt-8 flex flex-wrap gap-3">
              <Button {...sectionLink("work")}>
                {hero.primaryCta.label}
              </Button>
              <Button {...sectionLink("contact")} variant="ghost">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>

          <a
            {...fade(1.1)}
            {...sectionLink("about")}
            className="hero-fade label hidden items-center gap-3 self-end justify-self-end text-fg-muted transition-colors hover:text-fg md:col-span-12 md:flex lg:col-span-3"
          >
            <span className="relative block h-10 w-px overflow-hidden bg-fg/15">
              <m.span
                className="absolute inset-x-0 top-0 h-1/2 bg-fg"
                animate={{ y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, ease: ease.inOutQuart, repeat: Infinity }}
              />
            </span>
            Scroll to explore
            <ArrowDown width={14} height={14} />
          </a>
        </div>
      </m.div>
    </section>
  );
}

/** One masked line of the hero intro (CSS-animated, see .hero-line). */
function HeroLine({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
      <span className="hero-line block" style={{ "--d": `${delay}s` } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

function RoleRotator() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setI((n) => (n + 1) % site.roles.length), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="mt-2 font-display text-title font-medium">
      <span className="sr-only">{site.roles.join(", ")}</span>
      <span aria-hidden="true" className="relative block h-[1.2em] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={i}
            className="absolute inset-x-0 top-0 block"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.7, ease: ease.outExpo }}
          >
            {site.roles[i]}
          </m.span>
        </AnimatePresence>
      </span>
    </p>
  );
}

function Portrait() {
  const rich = useRichMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, spring.gentle);
  const ry = useSpring(0, spring.gentle);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  const onMove = (e: React.PointerEvent) => {
    if (!rich || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -10);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div className="mt-8 [perspective:1200px] lg:absolute lg:right-0 lg:top-[0.6vw] lg:mt-0 lg:w-[23vw] lg:max-w-[22rem]">
      <m.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        data-cursor="image"
        className="relative aspect-[4/5] overflow-hidden rounded-card-lg bg-bg-sunk sm:aspect-[16/10] lg:aspect-[4/5]"
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0">
        <m.div className="absolute inset-[-8%]" style={rich ? { y: imgY } : undefined}>
          <div className="hero-portrait-img absolute inset-0">
          <Image
            src={hero.portrait.src}
            alt={hero.portrait.alt}
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 1024px) 23vw, 100vw"
            className="object-cover object-[50%_30%]"
          />
          </div>
        </m.div>
        </div>
        <span className="label absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-white/90 backdrop-blur-md">
          Senior Software Engineer
        </span>
        {/* Reveal: a cover retracts upward (transform only; the image counts as painted for LCP) */}
        <span aria-hidden="true" className="hero-cover absolute inset-[-1px] origin-top bg-bg" />
      </m.div>
    </div>
  );
}
