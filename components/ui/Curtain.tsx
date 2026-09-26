"use client";

import { m } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ease } from "@/lib/motion";
import { curtainStore } from "@/lib/store";

let pendingHref: string | null = null;

export function requestCurtain(href: string) {
  pendingHref = href;
  curtainStore.set("covering");
}

/** Full-screen accent wipe used for route changes (home ⇄ case studies). */
export function Curtain() {
  const state = curtainStore.use();
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    if (curtainStore.get() === "covering") {
      // Give the new page one frame to paint under the curtain.
      requestAnimationFrame(() => curtainStore.set("revealing"));
    }
  }, [pathname]);

  const covering = state === "covering";

  return (
    <m.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[95] grid place-items-center bg-accent text-accent-ink"
      initial={false}
      animate={{ scaleY: covering ? 1 : 0 }}
      style={{ originY: covering ? 1 : 0 }}
      transition={{ duration: 0.75, ease: ease.inOutQuart }}
      onAnimationComplete={() => {
        if (covering && pendingHref) {
          const href = pendingHref;
          pendingHref = null;
          if (href.split("#")[0] === window.location.pathname) curtainStore.set("revealing");
          router.push(href, { scroll: true });
        } else if (state === "revealing") {
          curtainStore.set("idle");
        }
      }}
    >
      <m.span
        className="font-display text-headline font-semibold"
        animate={{ opacity: covering ? 1 : 0, y: covering ? 0 : -20 }}
        transition={{ duration: 0.4, delay: covering ? 0.35 : 0, ease: ease.outExpo }}
      >
        tannaye.dev
      </m.span>
    </m.div>
  );
}
