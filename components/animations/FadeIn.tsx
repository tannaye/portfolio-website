"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease } from "@/lib/motion";

export function FadeIn({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "p" | "span";
}) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: duration.reveal, ease: ease.outExpo, delay }}
    >
      {children}
    </Comp>
  );
}
