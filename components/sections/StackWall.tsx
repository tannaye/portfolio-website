"use client";

import { useEffect, useRef, useState } from "react";
import { stack } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { useFinePointer } from "@/lib/hooks";
import { cn } from "@/lib/cn";

/**
 * The grouped tech list. With a mouse, the group under the cursor is lit and the
 * rest dim; leave the list and every group shows normally. Touch screens have no
 * hover, so there the group crossing the middle of the screen is lit instead.
 */
export function StackWall() {
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const mouse = useFinePointer();

  useEffect(() => {
    setActive(-1);
    if (mouse) return; // the cursor drives the highlight
    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.row);
          if (e.isIntersecting) visible.add(i);
          else visible.delete(i);
        }
        setActive(visible.size ? Math.min(...visible) : -1);
      },
      // A thin band across the middle of the viewport acts as the reading line.
      { rootMargin: "-45% 0px -45% 0px" },
    );
    rows.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [mouse]);

  return (
    <dl className="mt-16 border-t border-line md:mt-24" onPointerLeave={mouse ? () => setActive(-1) : undefined}>
      {stack.groups.map((g, i) => {
        const state = active === -1 ? "idle" : active === i ? "on" : "off";
        return (
          <div
            key={g.name}
            ref={(el) => {
              rows.current[i] = el;
            }}
            data-row={i}
            onPointerEnter={mouse ? () => setActive(i) : undefined}
          >
            <FadeIn delay={i * 0.04} className="grid grid-cols-1 gap-3 border-b border-line py-6 md:grid-cols-12 md:gap-6 md:py-8">
              <dt
                className={cn(
                  "label pt-2 transition-colors duration-500 md:col-span-3",
                  state === "on" ? "text-accent-text" : "text-fg-subtle",
                )}
              >
                <span className={cn("mr-3 transition-colors duration-500", state === "on" ? "text-accent-text" : "text-fg-muted")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {g.name}
              </dt>
              <dd className="md:col-span-9">
                <ul
                  className={cn(
                    "flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.04em] transition-opacity duration-500 ease-[var(--ease-soft)]",
                    state === "off" ? "opacity-25" : "opacity-100",
                  )}
                >
                  {g.items.map((t, j) => (
                    <li key={t} className="transition-colors duration-300 hover:text-accent-text">
                      {t}
                      {j < g.items.length - 1 && <span className="ml-2 font-light text-fg-subtle">/</span>}
                    </li>
                  ))}
                </ul>
              </dd>
            </FadeIn>
          </div>
        );
      })}
    </dl>
  );
}
