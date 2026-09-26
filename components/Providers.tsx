"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// Not needed for first paint: load after hydration to keep the initial bundle small.
const Cursor = dynamic(() => import("./ui/Cursor").then((m) => m.Cursor), { ssr: false });
const MenuOverlay = dynamic(() => import("./MenuOverlay").then((m) => m.MenuOverlay), { ssr: false });

/**
 * LazyMotion + `m` components ship only the DOM animation features.
 * reducedMotion="user": transform animations are skipped for users who ask, opacity fades remain.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        {children}
        <MenuOverlay />
        <Cursor />
      </MotionConfig>
    </LazyMotion>
  );
}
