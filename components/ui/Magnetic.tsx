"use client";

import { m, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { useRichMotion } from "@/lib/hooks";
import { spring } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Pulls its child toward the cursor when the cursor is nearby, then springs back.
 * The outer span never moves, so the measurement is stable.
 */
export function Magnetic({
  children,
  strength = 0.35,
  reach = 1.6,
  className,
}: {
  children: ReactNode;
  strength?: number;
  /** Activation radius as a multiple of the element's half-size. */
  reach?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const rich = useRichMotion();
  const x = useSpring(0, spring.magnetic);
  const y = useSpring(0, spring.magnetic);

  useEffect(() => {
    if (!rich) return;
    const el = ref.current!;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const limit = (Math.max(r.width, r.height) / 2) * reach + 16;
      if (Math.hypot(dx, dy) < limit) {
        x.set(dx * strength);
        y.set(dy * strength);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rich, reach, strength, x, y]);

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      <m.span className="block" style={{ x, y }}>
        {children}
      </m.span>
    </span>
  );
}
