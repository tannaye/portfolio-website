"use client";

import { m, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { scrollToTarget } from "@/lib/scroll";
import { menuStore } from "@/lib/store";
import { ThemeToggle } from "./ui/ThemeToggle";

/** In-page anchor that smooth-scrolls on the home page and routes home from elsewhere. */
export function useSectionLink() {
  const isHome = usePathname() === "/";
  return (id: string) => ({
    href: isHome ? `#${id}` : `/#${id}`,
    onClick: (e: MouseEvent) => {
      if (!isHome || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      scrollToTarget(id);
      history.replaceState(null, "", `#${id}`);
    },
  });
}

export function Header() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const menuOpen = menuStore.use();
  const sectionLink = useSectionLink();
  const isHome = usePathname() === "/";

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCompact(y > 80);
    setHidden(y > 240 && y > prev + 2 ? true : y < prev - 2 ? false : hidden);
  });

  return (
    <m.header
      className="fixed inset-x-0 top-0 z-50"
      onFocusCapture={() => setHidden(false)}
      initial={false}
      animate={{ y: hidden && !menuOpen ? "-120%" : "0%" }}
      transition={{ duration: 0.6, ease: ease.outExpo }}
    >
      <div className="container-page flex items-center justify-between pt-4 md:pt-6">
        <Link
          href="/"
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              scrollToTarget(0);
            }
          }}
          className="relative z-[70] font-display text-lg font-semibold tracking-tight"
          aria-label={`${site.handle}: back to top`}
        >
          tannaye<span className="text-accent-text">.</span>dev
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "relative z-[70] flex items-center gap-1 rounded-full border p-1.5 transition-[background-color,border-color,backdrop-filter,padding] duration-500",
            compact && !menuOpen
              ? "border-line bg-bg/70 backdrop-blur-xl backdrop-saturate-150"
              : "border-transparent bg-transparent",
          )}
        >
          <ul className="hidden items-center lg:flex">
            {nav
              .filter((n) => n.header)
              .map((item) => (
                <li key={item.id}>
                  <a
                    {...sectionLink(item.id)}
                    className={cn(
                      "block rounded-full px-4 text-sm text-fg-muted transition-[color,background-color,height] duration-300 hover:bg-fg/5 hover:text-fg",
                      compact ? "h-9 leading-9" : "h-10 leading-10",
                      menuOpen && "pointer-events-none opacity-0",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
          </ul>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => menuStore.set((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="group flex h-10 items-center gap-3 rounded-full bg-fg px-4 text-sm font-medium text-bg transition-transform active:scale-95"
          >
            <span className="relative block h-5 overflow-hidden">
              <span
                className={cn(
                  "block transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  menuOpen && "-translate-y-5",
                )}
              >
                <span className="block h-5 leading-5">Menu</span>
                <span className="block h-5 leading-5">Close</span>
              </span>
            </span>
            <span aria-hidden="true" className="relative block h-2.5 w-4">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-4 bg-bg transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  menuOpen && "translate-y-[5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-4 bg-bg transition-transform duration-500 ease-[var(--ease-out-expo)]",
                  menuOpen && "-translate-y-[4px] -rotate-45",
                )}
              />
            </span>
          </button>
        </nav>
      </div>
    </m.header>
  );
}
