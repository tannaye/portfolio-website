"use client";

import { m, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { scrollToTarget } from "@/lib/scroll";
import { trackOnce } from "@/lib/analytics";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "about", label: "About" },
  { id: "journey", label: "Journey" },
  { id: "experience", label: "Experience" },
  { id: "work", label: "Work" },
  { id: "ai", label: "AI" },
  { id: "stack", label: "Stack" },
  { id: "leadership", label: "Leadership" },
  { id: "creator", label: "Creator" },
  { id: "music", label: "Music" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

/** Thin top progress bar + a dot per section on the right edge (desktop). */
export function SectionProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [active, setActive] = useState("top");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            setActive(e.target.id);
            trackOnce("section-view", { section: e.target.id });
          }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Keep the URL on the section you're reading, so a reload or a shared link lands
  // there instead of on whichever section was last clicked. replaceState, not
  // pushState: scrolling shouldn't fill the back button with entries.
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    // Wait until the page has landed on any incoming #hash (see SmoothScroll),
    // or the first "top" reading would wipe it before it's read.
    const id = window.setTimeout(() => setSyncing(true), 900);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!syncing) return;
    const url = active === "top" ? window.location.pathname + window.location.search : `#${active}`;
    const current = window.location.hash.slice(1) || "top";
    if (current !== active) window.history.replaceState(window.history.state, "", url);
  }, [active, syncing]);

  return (
    <>
      <m.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-accent"
        style={{ scaleX }}
      />
      <nav aria-label="Sections" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 min-[1680px]:block">
        <ul className="flex flex-col gap-3">
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => scrollToTarget(s.id === "top" ? 0 : s.id)}
                  aria-label={`Go to ${s.label}`}
                  aria-current={on ? "true" : undefined}
                  className="group flex items-center justify-end gap-3 py-0.5"
                >
                  <span
                    className={cn(
                      "label translate-x-2 text-fg-muted opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "block h-px transition-[width,background-color] duration-500 ease-[var(--ease-out-expo)]",
                      on ? "w-6 bg-fg" : "w-3 bg-fg/30 group-hover:bg-fg/70",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
