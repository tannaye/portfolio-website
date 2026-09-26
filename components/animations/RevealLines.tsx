"use client";

import { m, useInView } from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { duration, ease } from "@/lib/motion";

/**
 * Masked line-by-line reveal. Each line slides up from behind an overflow mask.
 * `play` lets a parent control timing (e.g. the hero waits for the preloader);
 * leave it undefined to reveal on scroll into view.
 */
export function RevealLines({
  lines,
  as: Tag = "div",
  className,
  lineClassName,
  delay = 0,
  step = 0.09,
  play,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  lineClassName?: string;
  delay?: number;
  step?: number;
  play?: boolean;
}) {
  // Observe the unclipped wrapper: each line starts hidden behind its own mask,
  // so observing the lines themselves would never report them as visible.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const active = play ?? inView;
  const hidden = { y: "110%", opacity: 0 };
  const shown = (i: number) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: duration.slow, ease: ease.outExpo, delay: delay + i * step },
  });

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
          <m.span
            className={cn("block will-change-transform", lineClassName)}
            initial={hidden}
            animate={active ? shown(i) : hidden}
          >
            {line}
          </m.span>
        </span>
      ))}
    </Tag>
  );
}
