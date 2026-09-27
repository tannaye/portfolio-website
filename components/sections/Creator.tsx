"use client";

import { m, useScroll, useTransform, type MotionValue } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { creator, site, socials, type Photo } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { RevealLines } from "@/components/animations/RevealLines";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, brandIcon, Play } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { useIsDesktop } from "@/lib/hooks";

const PHONES = [
  { platform: "Instagram", href: socials.instagram, handle: "@tannaye.dev" },
  { platform: "TikTok", href: socials.tiktok, handle: "@tannaye.dev" },
  { platform: "X (Twitter)", href: socials.x, handle: "@tannaye_dev" },
] as const;

export function Creator() {
  const stage = useRef<HTMLDivElement>(null);
  const desktop = useIsDesktop();
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "center 0.55"] });

  return (
    <section
      id="creator"
      aria-label="Tannaye, content creator"
      className="relative overflow-hidden py-28 md:py-40"
      style={{ "--tint": "var(--tint-content)" } as React.CSSProperties}
    >
      {/* Soft magenta wash, the only place it appears */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] opacity-60"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--tint-content) 22%, transparent), transparent 70%)" }}
      />

      <div className="container-page relative">
        <p className="label flex items-center gap-3 text-fg-muted">
          <span className="text-fg">02</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
          <span>{creator.label}</span>
          <span className="text-[var(--tint-content)]">@{site.handle}</span>
        </p>
        <h2 className="sr-only">{creator.title}: content creator</h2>
        <RevealLines
          as="p"
          lines={[creator.title]}
          className="mt-6 font-display text-[clamp(4rem,21vw,21rem)] leading-[0.8] font-bold tracking-[-0.06em] uppercase"
          lineClassName="bg-gradient-to-b from-fg to-[color-mix(in_oklab,var(--fg)_40%,var(--tint-content))] bg-clip-text text-transparent"
        />
        <div className="mt-8 grid gap-8 md:grid-cols-12">
          <FadeIn className="md:col-span-6 md:col-start-7">
            <p className="font-serif text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.15] italic text-balance">{creator.lede}</p>
          </FadeIn>
        </div>
      </div>

      {/* Phones fan out on scroll */}
      <div ref={stage} className="relative mt-16 flex h-[34rem] items-center justify-center md:mt-24 md:h-[44rem]">
        {creator.cards.map((photo, i) => (
          <PhoneCard key={i} i={i} photo={photo} progress={scrollYProgress} desktop={desktop} {...PHONES[i]} />
        ))}
      </div>

      <div className="container-page relative mt-20 md:mt-28">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {creator.platforms.map((p, i) => {
            const Icon = brandIcon[p.name];
            return (
              <FadeIn as="li" key={p.name} delay={i * 0.06}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group card flex h-full min-h-56 flex-col justify-between p-6 transition-[border-color,background-color] duration-500 hover:border-[var(--tint-content)]"
                >
                  <div className="flex items-start justify-between">
                    <Magnetic strength={0.4}>
                      <span className="grid size-12 place-items-center rounded-full border border-line-strong text-fg transition-colors duration-300 group-hover:border-transparent group-hover:bg-[var(--tint-content)] group-hover:text-[#0a0a0a]">
                        <Icon width={20} height={20} />
                      </span>
                    </Magnetic>
                    <ArrowUpRight className="text-fg-subtle transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-fg" />
                  </div>
                  <div>
                    {p.followers && (
                      <p className="font-display text-headline font-semibold">
                        {p.followers}
                        <span className="label ml-2 align-middle text-fg-subtle">followers</span>
                      </p>
                    )}
                    <p className="font-display text-title font-semibold">{p.name}</p>
                    <p className="label mt-1 text-[var(--tint-content)]">{p.handle}</p>
                    <p className="mt-3 text-sm text-fg-muted">{p.blurb}</p>
                  </div>
                </a>
              </FadeIn>
            );
          })}
        </ul>

        <FadeIn className="mt-16 flex flex-col items-start justify-between gap-8 border-t border-line pt-10 md:flex-row md:items-center">
          <p className="max-w-2xl font-display text-title font-medium text-balance">
            <span className="text-fg-subtle">Work with me. </span>
            {creator.collab}
          </p>
          <Button href={`mailto:${site.email}?subject=Collaboration%20with%20Tannaye`} variant="ghost">
            Start a collaboration
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}

function PhoneCard({
  i,
  photo,
  progress,
  desktop,
  platform,
  href,
  handle,
}: {
  i: number;
  photo: Photo;
  progress: MotionValue<number>;
  desktop: boolean;
  platform: string;
  href: string;
  handle: string;
}) {
  const side = i - 1; // -1, 0, 1
  const spread = desktop ? 118 : 52;
  const x = useTransform(progress, [0, 1], ["0%", `${side * spread}%`]);
  const rotate = useTransform(progress, [0, 1], [side * 4 + (i === 1 ? 0 : 0), side * (desktop ? 9 : 7)]);
  const y = useTransform(progress, [0, 1], [side === 0 ? 0 : 24, side === 0 ? -16 : 28]);

  return (
    <m.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="play"
      className="group absolute w-[min(52vw,16rem)] md:w-[17.5rem]"
      style={{ x, rotate, y, zIndex: side === 0 ? 3 : 2 }}
    >
      <div className="relative aspect-[9/19] overflow-hidden rounded-[2.5rem] border-[6px] border-[#1b1b1b] bg-[#111] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]">
        <span className="sr-only">Watch on {platform}: </span>
        <Image
          src={photo.src}
          alt=""
          fill
          placeholder="blur"
          sizes="(min-width: 768px) 18rem, 52vw"
          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-105"
        />
        <div className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 text-white">
          <span>
            <span className="block text-sm font-semibold">{handle}</span>
            <span className="label text-white/70">{platform}</span>
          </span>
          <span className="grid size-10 place-items-center rounded-full bg-white/20 backdrop-blur-md transition-colors group-hover:bg-[#ff6fab] group-hover:text-black">
            <Play width={16} height={16} />
          </span>
        </div>
      </div>
    </m.a>
  );
}
