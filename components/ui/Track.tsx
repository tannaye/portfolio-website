"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/**
 * Records a click on whatever it wraps, without changing layout or navigation.
 * Usable from server components: pass the event name and plain data.
 */
export function Track({ event, data, children }: { event: string; data?: Record<string, string | number | boolean>; children: ReactNode }) {
  return (
    <span className="contents" onClickCapture={() => track(event, data)}>
      {children}
    </span>
  );
}
