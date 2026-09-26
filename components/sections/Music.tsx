"use client";

import { m, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import { music } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { Parallax } from "@/components/animations/Parallax";
import { RevealLines } from "@/components/animations/RevealLines";
import dynamic from "next/dynamic";
import type { GuitarHandle } from "@/components/GuitarStrings";
import { TUNING } from "@/lib/tuning";
import { ArrowUpRight, Play, Volume, VolumeOff } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const STRING_COLOR = "#eba44a";

// Canvas + audio code is only needed once the section is near; keep it out of the first bundle.
const GuitarStrings = dynamic(() => import("@/components/GuitarStrings").then((m) => m.GuitarStrings), { ssr: false });

export function Music() {
  const ref = useRef<HTMLElement>(null);
  const guitar = useRef<GuitarHandle>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [lastString, setLastString] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] });
  const glow = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      {/* The page warms into the music section */}
      <div aria-hidden="true" className="h-48 bg-gradient-to-b from-bg to-[var(--music-bg)] md:h-72" />
      <section
        ref={ref}
        id="music"
        aria-label="Music"
        data-theme="dark"
        className="relative overflow-hidden bg-[var(--music-bg)] text-fg"
      >
        <m.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: glow,
            maskImage: "linear-gradient(to bottom, transparent, black 30%)",
            background: "radial-gradient(70% 45% at 70% 30%, rgb(235 164 74 / 0.22), transparent 70%), radial-gradient(50% 40% at 10% 70%, rgb(160 70 20 / 0.25), transparent 70%)",
          }}
        />

        <div className="container-page relative">
          <p className="label flex items-center gap-3 text-fg-muted">
            <span className="text-fg">03</span>
            <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
            <span>{music.label}</span>
          </p>
          <h2 className="mt-8 max-w-6xl">
            <RevealLines
              as="span"
              lines={[music.title[0]]}
              className="block font-display text-headline font-semibold text-balance"
            />
            <RevealLines
              as="span"
              lines={[music.title[1]]}
              delay={0.15}
              className="mt-2 block font-serif text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.05] italic text-[#eba44a] text-balance"
            />
          </h2>
        </div>

        {/* Player */}
        <div className="container-page relative mt-16 md:mt-24">
          <FadeIn className="overflow-hidden rounded-card-lg border border-white/10 bg-black/25 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 md:px-6">
              <div className="flex items-center gap-4">
                <span className="grid size-9 place-items-center rounded-full bg-[#eba44a] text-[#1c1108]">
                  <Play width={14} height={14} />
                </span>
                <div>
                  <p className="text-sm font-medium">Six strings, standard tuning</p>
                  <p className="label text-fg-subtle">
                    <span className="hidden md:inline">Move your cursor across the strings</span>
                    <span className="md:hidden">Tap a string</span>
                    {lastString !== null && (
                      <span className="text-[#eba44a]">
                        {" "}
                        · {TUNING[lastString].name}
                        {TUNING[lastString].octave}
                      </span>
                    )}
                  </p>
                </div>
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

            <div data-cursor="pick" className="relative h-72 md:h-96">
              <GuitarStrings ref={guitar} soundOn={soundOn} color={STRING_COLOR} onPluck={setLastString} />
              {/* fret markers */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-6 left-[8%] w-px bg-white/10" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-6 right-[8%] w-px bg-white/10" />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3 md:px-6">
              <span className="label text-fg-subtle">Pluck</span>
              <ul className="flex gap-1.5">
                {TUNING.map((t, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => guitar.current?.pluck(i, 0.5, 0.8)}
                      aria-label={`Pluck the ${t.name}${t.octave} string`}
                      data-cursor="pick"
                      className={cn(
                        "label grid size-10 place-items-center rounded-full border transition-colors",
                        lastString === i ? "border-[#eba44a] text-[#eba44a]" : "border-white/15 text-fg-muted hover:text-fg",
                      )}
                    >
                      {t.name}
                      <sub className="text-[0.55rem]">{t.octave}</sub>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>

        {/* Copy + portrait */}
        <div className="container-page relative mt-20 grid gap-10 md:mt-32 md:grid-cols-12 md:items-end">
          <Parallax speed={40} className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card-lg bg-[#efefef]" data-cursor="image">
              <Image
                src={music.photo.src}
                alt={music.photo.alt}
                fill
                placeholder="blur"
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Parallax>
          <div className="md:col-span-6 md:col-start-7">
            <FadeIn>
              <p className="font-display text-lede font-medium text-pretty">{music.body}</p>
            </FadeIn>
            <FadeIn delay={0.1} className="mt-10">
              {music.clips.length > 0 ? (
                <ul className="grid grid-cols-2 gap-3">
                  {music.clips.map((c) => (
                    <li key={c.href}>
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor="play"
                        className="group flex aspect-video flex-col justify-between rounded-card border border-white/10 bg-black/30 p-4"
                      >
                        <span className="label text-fg-subtle">{c.platform}</span>
                        <span className="flex items-center justify-between font-medium">
                          {c.title}
                          <Play width={16} height={16} />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <a
                  href={music.clipsFallback.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="play"
                  className="group flex items-center justify-between gap-6 rounded-card border border-white/10 bg-black/25 p-5 transition-colors hover:border-[#eba44a]"
                >
                  <span className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-full bg-white/10 transition-colors group-hover:bg-[#eba44a] group-hover:text-[#1c1108]">
                      <Play width={16} height={16} />
                    </span>
                    <span>
                      <span className="block font-medium">{music.clipsFallback.label}</span>
                      <span className="label text-fg-subtle">Performance clips</span>
                    </span>
                  </span>
                  <ArrowUpRight className="text-fg-subtle transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              )}
            </FadeIn>
          </div>
        </div>

        {/* Full-bleed */}
        <div className="relative mt-20 md:mt-32">
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[21/9]" data-cursor="image">
            <Parallax speed={70} className="absolute inset-[-10%_0]">
              <Image src={music.wide.src} alt={music.wide.alt} fill placeholder="blur" sizes="100vw" className="object-cover object-[50%_45%]" />
            </Parallax>
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--music-bg),transparent_30%,transparent_60%,var(--music-bg))]" />
          </div>
        </div>
      </section>
      <div aria-hidden="true" className="h-48 bg-gradient-to-b from-[var(--music-bg)] to-bg md:h-72" />
    </>
  );
}
