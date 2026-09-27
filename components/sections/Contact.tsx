"use client";

import { AnimatePresence, m, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { contact, site, socials } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { Button } from "@/components/ui/Button";
import { ArrowUp, Check, Copy, Download, brandIcon } from "@/components/ui/Icons";
import { Magnetic } from "@/components/ui/Magnetic";
import { useClock, useRichMotion } from "@/lib/hooks";
import { ease } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll";

const SOCIAL = [
  { name: "LinkedIn", href: socials.linkedin },
  { name: "GitHub", href: socials.github },
  { name: "X", href: socials.x },
  { name: "Instagram", href: socials.instagram },
  { name: "TikTok", href: socials.tiktok },
  { name: "YouTube", href: socials.youtube },
] as const;

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const rich = useRichMotion();
  const time = useClock(site.timezone);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.15"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.78, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

  return (
    <footer ref={ref} id="contact" aria-label="Contact" className="relative overflow-hidden border-t border-line pb-8 pt-28 md:pt-40">
      <div className="container-page">
        <p className="label flex items-center gap-3 text-fg-muted">
          <span className="text-fg">{contact.eyebrow}</span>
          <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
          <span>{contact.note}</span>
        </p>

        <m.h2
          className="mt-10 origin-left font-display text-[clamp(3rem,10vw,11rem)] leading-[0.88] font-bold tracking-[-0.055em] text-balance"
          style={rich ? { scale, y } : undefined}
        >
          {contact.headline[0]} <span className="font-serif font-normal italic tracking-[-0.03em] text-accent-text">{contact.headline[1]}</span>
        </m.h2>

        <FadeIn className="mt-14 md:mt-20">
          <p className="font-display text-title font-medium text-fg-muted">{contact.kicker}</p>
          <EmailLink />
        </FadeIn>

        <FadeIn delay={0.1} className="mt-12 flex flex-wrap items-center gap-3">
          <Button href={site.cv} download icon={<Download width={18} height={18} />}>
            Download CV
          </Button>
          <Button href={socials.linkedin} variant="ghost">
            LinkedIn
          </Button>
          <Button href={socials.github} variant="ghost">
            GitHub
          </Button>
        </FadeIn>

        <div className="mt-28 flex flex-col gap-10 border-t border-line pt-8 md:mt-40 md:flex-row md:items-center md:justify-between">
          <ul className="flex gap-2">
            {SOCIAL.map((s) => {
              const Icon = brandIcon[s.name];
              return (
                <li key={s.name}>
                  <Magnetic strength={0.45}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="grid size-12 place-items-center rounded-full border border-line text-fg transition-colors duration-300 hover:border-fg hover:bg-fg hover:text-bg"
                    >
                      <Icon />
                    </a>
                  </Magnetic>
                </li>
              );
            })}
          </ul>

          <div className="label flex flex-wrap items-center gap-x-8 gap-y-3 text-fg-subtle">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <span className="tabular-nums">
              Lagos {time || "--:--"} {site.timezoneLabel}
            </span>
            <span>{contact.credit}</span>
          </div>

          <Magnetic strength={0.4}>
            <button
              type="button"
              onClick={() => scrollToTarget(0)}
              className="group label flex items-center gap-3 text-fg"
            >
              Back to top
              <span className="grid size-12 place-items-center rounded-full bg-fg text-bg">
                <ArrowUp width={18} height={18} className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1" />
              </span>
            </button>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}

function EmailLink() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = site.email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <Magnetic strength={0.12} reach={1.1}>
        <a
          href={`mailto:${site.email}`}
          className="group relative inline-block font-display text-[clamp(1.6rem,5.2vw,5rem)] leading-[1.05] font-semibold tracking-[-0.04em] break-all"
        >
          {site.email}
          <span className="absolute -bottom-1 left-0 h-[0.06em] w-full origin-right scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:origin-left group-hover:scale-x-100" />
        </a>
      </Magnetic>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="relative flex h-12 items-center gap-2 overflow-hidden rounded-full border border-line-strong px-5 text-sm transition-colors hover:bg-fg hover:text-bg"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={copied ? "done" : "copy"}
            className="flex items-center gap-2"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25, ease: ease.outExpo }}
          >
            {copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
            {copied ? "Copied!" : "Copy"}
          </m.span>
        </AnimatePresence>
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email address copied to clipboard" : ""}
      </span>
    </div>
  );
}
