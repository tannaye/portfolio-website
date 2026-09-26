"use client";

import { useEffect, useRef, useState } from "react";
import { useRichMotion } from "@/lib/hooks";

/**
 * Two-layer cursor. The dot tracks the pointer exactly; the ring trails with a
 * frame-rate independent lerp. State comes from the nearest `data-cursor` attribute:
 *
 *   data-cursor="link | view | play | pick | image | external | text | hide"
 *   data-cursor-label="Play"   (optional text inside the ring)
 *
 * Links and buttons get "link" automatically, off-site links get "external",
 * paragraphs and inputs get "text". Disabled on touch and with reduced motion.
 */

type CursorState = "default" | "link" | "view" | "play" | "pick" | "image" | "external" | "text" | "hide";

const LERP = 0.15;
const INTERACTIVE = "[data-cursor], a, button, [role='button'], summary, label, input, textarea, select";

function resolve(target: EventTarget | null): { state: CursorState; label: string } {
  if (!(target instanceof Element)) return { state: "default", label: "" };
  const el = target.closest(INTERACTIVE);
  if (!el) return { state: target.closest("p, blockquote") ? "text" : "default", label: "" };

  const explicit = el.getAttribute("data-cursor") as CursorState | null;
  const label = el.getAttribute("data-cursor-label") ?? "";
  if (explicit) return { state: explicit, label };

  if (el instanceof HTMLAnchorElement) {
    const external = el.target === "_blank" || (el.host !== "" && el.host !== window.location.host);
    return { state: external ? "external" : "link", label };
  }
  if (el.matches("input, textarea")) return { state: "text", label };
  return { state: "link", label };
}

export function Cursor() {
  const enabled = useRichMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const html = document.documentElement;
    const root = rootRef.current!;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    html.classList.add("has-cursor");

    let mx = -100;
    let my = -100;
    let rx = mx;
    let ry = my;
    let seen = false;
    let last = performance.now();
    let raf = 0;

    const show = (v: boolean) => (root.dataset.visible = v ? "true" : "false");

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      if (!seen) {
        seen = true;
        rx = mx;
        ry = my;
      }
      show(true);
    };

    const onOver = (e: PointerEvent) => {
      const next = resolve(e.target);
      setState(next.state);
      setLabel(next.label);
    };

    const onDown = () => (root.dataset.pressed = "true");
    const onUp = () => (root.dataset.pressed = "false");
    const onLeave = () => show(false);
    const onEnter = () => seen && show(true);

    const loop = (now: number) => {
      const dt = Math.min(64, now - last) / (1000 / 60);
      last = now;
      const k = 1 - Math.pow(1 - LERP, dt);
      rx += (mx - rx) * k;
      ry += (my - ry) * k;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    html.addEventListener("pointerleave", onLeave);
    html.addEventListener("pointerenter", onEnter);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
      html.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("blur", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="cursor" data-state={state} data-visible="false" aria-hidden="true">
      <div ref={ringRef} className="cursor-pos">
        <div className="cursor-ring">
          <svg className="cursor-pick" viewBox="0 0 100 110">
            <path d="M50 2C22 2 3 12 3 32c0 26 30 60 47 76C67 92 97 58 97 32 97 12 78 2 50 2Z" />
          </svg>
          <svg className="cursor-icon cursor-play" viewBox="0 0 24 24">
            <path d="M8 5.5v13l11-6.5-11-6.5Z" />
          </svg>
          <svg className="cursor-icon cursor-arrow" viewBox="0 0 24 24" fill="none" strokeWidth="2">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
          <span className="cursor-label">{label || (state === "view" ? "View" : state === "pick" ? "Play" : "")}</span>
        </div>
      </div>
      <div ref={dotRef} className="cursor-pos">
        <div className="cursor-dot" />
      </div>
    </div>
  );
}
