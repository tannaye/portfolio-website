"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";
import { useRichMotion } from "@/lib/hooks";

/** Moves children on the Y axis relative to scroll. `speed` is px of travel each way. */
export function Parallax({ children, speed = 60, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rich = useRichMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);

  return (
    <div ref={ref} className={className}>
      <m.div className="h-full" style={rich ? { y } : undefined}>
        {children}
      </m.div>
    </div>
  );
}
