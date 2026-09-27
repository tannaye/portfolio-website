"use client";

import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, site, socials } from "@/content/site";
import { useClock } from "@/lib/hooks";
import { ease } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll";
import { menuStore } from "@/lib/store";
import { brandIcon } from "./ui/Icons";

const socialList = [
  { name: "Instagram", href: socials.instagram },
  { name: "TikTok", href: socials.tiktok },
  { name: "YouTube", href: socials.youtube },
  { name: "X", href: socials.x },
  { name: "LinkedIn", href: socials.linkedin },
  { name: "GitHub", href: socials.github },
] as const;

export function MenuOverlay() {
  const open = menuStore.use();
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const time = useClock(site.timezone);
  const isHome = usePathname() === "/";
  const router = useRouter();

  // Escape to close, focus in on open, focus back to the toggle on close, simple focus trap.
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const t = window.setTimeout(() => panel?.querySelector<HTMLElement>("a, button")?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menuStore.set(false);
      if (e.key !== "Tab" || !panel) return;
      const header = document.querySelector("header");
      const nodes = [
        ...(header?.querySelectorAll<HTMLElement>("button[aria-controls='site-menu']") ?? []),
        ...panel.querySelectorAll<HTMLElement>("a, button"),
      ];
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      trigger?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const go = (id: string) => {
    menuStore.set(false);
    if (!isHome) return router.push(`/#${id}`);
    // Wait for the overlay to lift and scrolling to resume.
    window.setTimeout(() => scrollToTarget(id), 420);
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-lenis-prevent
          className="fixed inset-0 z-[45] overflow-y-auto bg-bg"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)", transition: { duration: 0.6, ease: ease.inOutQuart, delay: 0.1 } }}
          transition={{ duration: 0.8, ease: ease.inOutQuart }}
        >
          <div className="container-page grid min-h-full grid-cols-1 gap-12 pb-10 pt-28 lg:grid-cols-[1.4fr_1fr] lg:pt-32">
            <nav aria-label="Menu">
              <ol className="flex flex-col">
                {nav.map((item, i) => (
                  <li key={item.id} className="overflow-hidden border-b border-line">
                    <m.a
                      href={isHome ? `#${item.id}` : `/#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.id);
                      }}
                      onPointerEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className="group flex items-baseline gap-6 py-3 font-display text-[clamp(2.5rem,7vw,6.5rem)] leading-[1] font-semibold tracking-[-0.045em] md:py-4"
                      initial={{ y: "100%" }}
                      animate={{ y: "0%" }}
                      exit={{ y: "100%", transition: { duration: 0.35, ease: ease.inOutQuart } }}
                      transition={{ duration: 0.8, ease: ease.outExpo, delay: 0.25 + i * 0.05 }}
                    >
                      <span className="label w-8 shrink-0 text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                      <span className="transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-4 group-hover:text-accent-text group-focus-visible:translate-x-4">
                        {item.label}
                      </span>
                    </m.a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="hidden flex-col justify-between gap-8 lg:flex">
              <div className="relative aspect-[4/5] w-full max-w-md self-end overflow-hidden rounded-card-lg bg-bg-sunk">
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: ease.outExpo }}
                  >
                    <Image
                      src={nav[active].image.src}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 28rem, 0px"
                      placeholder="blur"
                      className="object-cover"
                    />
                  </m.div>
                </AnimatePresence>
              </div>
            </div>

            <m.div
              className="flex flex-wrap items-end justify-between gap-6 lg:col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.6 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col gap-2">
                <a href={`mailto:${site.email}`} className="link-underline text-lg">
                  {site.email}
                </a>
                <span className="label text-fg-subtle">
                  Lagos · {time || "--:--:--"} {site.timezoneLabel}
                </span>
              </div>
              <ul className="flex gap-2">
                {socialList.map((s) => {
                  const Icon = brandIcon[s.name];
                  return (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="grid size-12 place-items-center rounded-full border border-line text-fg transition-colors hover:bg-fg hover:text-bg"
                      >
                        <Icon />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </m.div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
