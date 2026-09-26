import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Infinite CSS marquee. Content is duplicated once; the copy is hidden from assistive tech. */
export function Marquee({
  children,
  reverse,
  duration = 40,
  className,
}: {
  children: ReactNode;
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={cn("mask-fade-x flex overflow-hidden", className)}>
      <div
        className="marquee-track flex w-max shrink-0 animate-marquee"
        style={{ "--marquee-duration": `${duration}s`, animationDirection: reverse ? "reverse" : "normal" } as React.CSSProperties}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
