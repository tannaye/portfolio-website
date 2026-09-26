"use client";

import { m, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { about } from "@/content/site";
import { RevealLines } from "@/components/animations/RevealLines";
import { WordScrub } from "@/components/animations/WordScrub";
import { useSectionLink } from "@/components/Header";
import { ArrowDown } from "@/components/ui/Icons";
import { useIsDesktop, useRichMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/** Flood colours are fixed (not theme tokens) so dark text on them always passes contrast. */
const FLOOD: Record<string, string> = { engineer: "#6aa8ff", creator: "#ff6fab", musician: "#eba44a" };

export function About() {
  const imgRef = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.2, 1]);

  return (
    <section id="about" aria-label="About" className="relative py-28 md:py-40">
      <div className="container-page">
        <p className="label flex items-center gap-3 text-fg-muted">
          <span className="text-fg">{about.label}</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
          <span>Three sides, one person</span>
        </p>
        <RevealLines
          as="p"
          lines={[about.lede]}
          className="mt-8 max-w-5xl font-serif text-[clamp(2rem,5vw,4.75rem)] leading-[1.02] italic tracking-[-0.02em] text-balance"
        />
      </div>

      <div className="container-page mt-14 md:mt-20">
        <m.div
          ref={imgRef}
          className="relative aspect-[4/5] overflow-hidden rounded-card-lg bg-[#efefef] sm:aspect-[16/10] lg:aspect-[21/10]"
          style={rich ? { scale } : undefined}
          data-cursor="image"
        >
          <m.div className="absolute inset-0" style={rich ? { scale: imgScale } : undefined}>
            <Image
              src={about.photo.src}
              alt={about.photo.alt}
              fill
              placeholder="blur"
              sizes="(min-width: 1536px) 1440px, 100vw"
              className="object-cover object-[50%_58%]"
            />
          </m.div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-between p-6 text-[#111] sm:flex md:p-8">
            {["The musician", "The engineer", "The creator"].map((t) => (
              <span key={t} className="label rounded-full bg-white/70 px-3 py-1.5 backdrop-blur-md">
                {t}
              </span>
            ))}
          </div>
        </m.div>
      </div>

      <div className="container-page mt-20 grid gap-12 md:mt-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <RevealLines
            as="h2"
            lines={["One person,", "three frequencies."]}
            className="font-display text-headline font-semibold"
          />
        </div>
        <WordScrub
          text={about.bio}
          className="font-display text-lede font-medium text-pretty lg:col-span-8"
        />
      </div>

      <div className="container-page mt-20 md:mt-28">
        <PersonaCards />
      </div>
    </section>
  );
}

function PersonaCards() {
  const [active, setActive] = useState<number | null>(null);
  const desktop = useIsDesktop();
  const sectionLink = useSectionLink();

  return (
    <ul className="flex flex-col gap-3 lg:h-[34rem] lg:flex-row" onPointerLeave={() => setActive(null)}>
      {about.personas.map((p, i) => {
        const on = desktop ? active === i : true;
        const flood = FLOOD[p.key];
        return (
          <m.li
            key={p.key}
            className="relative min-w-0 lg:flex-1"
            animate={desktop ? { flexGrow: active === null ? 1 : active === i ? 2.4 : 0.8 } : undefined}
            transition={{ duration: 0.8, ease: ease.outExpo }}
          >
            <a
              {...sectionLink(p.target)}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              data-cursor="view"
              data-cursor-label="Explore"
              className="group relative flex h-full min-h-[22rem] flex-col justify-between overflow-hidden rounded-card-lg border border-line bg-bg-elev p-6 md:p-8"
            >
              {/* Tint flood */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 origin-bottom transition-transform duration-700 ease-[var(--ease-out-expo)]",
                  desktop && active === i ? "scale-y-100" : "scale-y-0",
                )}
                style={{ background: flood }}
              />
              {/* Photo */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute origin-top-right overflow-hidden rounded-card transition-[opacity,transform,filter] duration-700 ease-[var(--ease-out-expo)]",
                  "bottom-6 right-6 top-6 w-[42%] md:bottom-8 md:right-8 md:top-8",
                  on
                    ? "scale-100 opacity-100"
                    : active === null
                      ? "scale-[0.42] opacity-70 grayscale"
                      : "scale-[0.42] opacity-0",
                )}
              >
                <Image src={p.image.src} alt="" fill placeholder="blur" sizes="(min-width:1024px) 20vw, 45vw" className="object-cover" />
              </span>

              <span
                className={cn(
                  "relative flex items-center justify-between transition-colors duration-500",
                  desktop && active === i ? "text-[#0a0a0a]" : "text-fg-muted",
                )}
              >
                <span className="label">0{i + 1}</span>
              </span>
              <span
                className={cn(
                  "relative max-w-[50%] transition-colors duration-500 lg:max-w-[20rem]",
                  desktop && active === i ? "text-[#0a0a0a]" : "text-fg",
                  desktop && active !== null && active !== i && "lg:max-w-full",
                )}
              >
                <span className="block font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-none font-semibold tracking-[-0.04em]">
                  {p.title}
                </span>
                <span
                  className={cn(
                    "mt-4 block text-pretty text-sm leading-relaxed transition-opacity duration-500 md:text-base",
                    desktop && active !== null && active !== i ? "opacity-0" : "opacity-80",
                  )}
                >
                  {p.body}
                </span>
                <span className="label mt-6 flex items-center gap-2">
                  Explore <ArrowDown width={12} height={12} className="transition-transform duration-300 group-hover:translate-y-1" />
                </span>
              </span>
            </a>
          </m.li>
        );
      })}
    </ul>
  );
}

