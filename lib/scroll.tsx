"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { usePrefersReducedMotion } from "./hooks";
import { menuStore } from "./store";

let lenis: Lenis | null = null;

export const getLenis = () => lenis;

/**
 * Scroll to a section id (or 0 for top). Uses Lenis when smooth scroll is on,
 * native otherwise, then moves focus so keyboard and screen reader users land there too.
 */
export function scrollToTarget(target: string | 0) {
  const el = target === 0 ? null : document.getElementById(target);
  const focus = () => {
    const node = el ?? document.getElementById("main");
    if (!node) return;
    if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");
    node.focus({ preventScroll: true });
  };

  if (lenis) {
    lenis.scrollTo(el ?? 0, { duration: 1.6, onComplete: focus });
  } else {
    if (el) el.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0 });
    focus();
  }
}

/** Scroll to an absolute Y position (used to jump within pinned, scroll-driven sections). */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y });
}

export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true });
    lenis = l;
    const unsub = menuStore.subscribe(() => (menuStore.get() ? l.stop() : l.start()));
    return () => {
      unsub();
      l.destroy();
      lenis = null;
    };
  }, [reduced]);

  // New route: land on the #hash if there is one, else the top. Lenis caches the page
  // height, so resize first; repeat once layout settles (the pinned timeline grows the page).
  useEffect(() => {
    const land = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const el = hash ? document.getElementById(hash) : null;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(el ?? 0, { immediate: true, force: true });
      } else if (el) el.scrollIntoView({ block: "start" });
      return !!el;
    };
    const timers = [window.setTimeout(() => land() && timers.push(window.setTimeout(land, 350)), 60)];
    return () => timers.forEach(clearTimeout);
  }, [pathname]);

  return null;
}
