"use client";

import { animate, m } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";
import { introStore } from "@/lib/store";

const NAME = "VICTOR";

/**
 * First-visit intro (< 2s): a 0–100 counter, the name letter by letter, then the
 * screen splits open. Skipped on repeat visits in the same session and with
 * reduced motion. The inline script in <head> adds `intro-skip` before paint,
 * so a skipped preloader never flashes.
 */
export function Preloader() {
  const [phase, setPhase] = useState<"count" | "name" | "split" | "done">("count");
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains("intro-skip")) {
      html.classList.add("intro-done");
      introStore.set(true);
      setPhase("done");
      return;
    }
    html.style.overflow = "hidden";
    const timers: number[] = [];
    const counter = animate(0, 100, {
      duration: 1,
      ease: ease.inOutQuart,
      onUpdate: (v) => {
        if (countRef.current) countRef.current.textContent = String(Math.round(v)).padStart(3, "0");
      },
    });
    timers.push(window.setTimeout(() => setPhase("name"), 650));
    timers.push(
      window.setTimeout(() => {
        setPhase("split");
        introStore.set(true);
        html.classList.add("intro-done");
        html.style.overflow = "";
        try {
          sessionStorage.setItem("intro-seen", "1");
        } catch {}
      }, 1350),
    );
    timers.push(window.setTimeout(() => setPhase("done"), 2200));
    return () => {
      counter.stop();
      timers.forEach(clearTimeout);
      html.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;
  const split = phase === "split";

  return (
    <div className="preloader pointer-events-none fixed inset-0 z-[110]" aria-hidden="true">
      {(["top", "bottom"] as const).map((half) => (
        <m.div
          key={half}
          className={`absolute inset-x-0 h-1/2 bg-bg ${half === "top" ? "top-0" : "bottom-0"}`}
          animate={{ y: split ? (half === "top" ? "-100%" : "100%") : "0%" }}
          transition={{ duration: 0.85, ease: ease.inOutQuart }}
        />
      ))}

      <m.div
        className="absolute inset-0 grid place-items-center"
        animate={{ opacity: split ? 0 : 1, scale: split ? 1.04 : 1 }}
        transition={{ duration: 0.45, ease: ease.outExpo }}
      >
        <div className="flex overflow-hidden font-display text-[clamp(3.5rem,14vw,12rem)] leading-[0.9] font-bold tracking-[-0.05em] text-fg">
          {NAME.split("").map((ch, i) => (
            <m.span
              key={i}
              className="inline-block"
              initial={{ y: "105%" }}
              animate={{ y: phase === "count" ? "105%" : "0%" }}
              transition={{ duration: 0.6, ease: ease.outExpo, delay: i * 0.045 }}
            >
              {ch}
            </m.span>
          ))}
        </div>
      </m.div>

      <m.div
        className="label container-page absolute inset-x-0 bottom-8 flex items-end justify-between text-fg-muted"
        animate={{ opacity: split ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <span>tannaye.dev</span>
        <span className="font-mono text-[clamp(4.5rem,18vw,15rem)] leading-[0.8] font-medium tracking-[-0.06em] text-fg tabular-nums">
          <span ref={countRef}>000</span>
        </span>
      </m.div>
    </div>
  );
}
