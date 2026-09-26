"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { curtainStore } from "@/lib/store";
import { requestCurtain } from "./Curtain";

/** A next/link that plays the accent curtain wipe before navigating. */
export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (curtainStore.get() !== "idle") return e.preventDefault();
    e.preventDefault();
    requestCurtain(href);
  };
  return <Link href={href} onClick={handle} {...props} />;
}
