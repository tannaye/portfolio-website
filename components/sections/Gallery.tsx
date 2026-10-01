"use client";

import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gallery } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { Parallax } from "@/components/animations/Parallax";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLeft, ArrowRight, Close } from "@/components/ui/Icons";
import { ease } from "@/lib/motion";
import { getLenis } from "@/lib/scroll";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";

/** Column assignment + per-column parallax speed for the asymmetric masonry. */
const COLUMNS = [
  { items: [0, 3], speed: 30, offset: "" },
  { items: [1, 4], speed: -40, offset: "md:mt-40" },
  { items: [2, 5], speed: 60, offset: "md:mt-16" },
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const photos = gallery.photos;

  return (
    <section id="gallery" aria-label="Gallery" className="relative py-28 md:py-40">
      <div className="container-page">
        <SectionHeading
          label={gallery.label}
          title={[gallery.title]}
          aside={
            <p className="label">
              Photography by{" "}
              <a href={gallery.credit.href} target="_blank" rel="noopener noreferrer" className="link-underline text-fg">
                {gallery.credit.name}
              </a>
            </p>
          }
        />

        <div className="mt-16 grid grid-cols-2 gap-3 md:mt-24 md:grid-cols-3 md:gap-6">
          {COLUMNS.map((col, c) => (
            <Parallax key={c} speed={col.speed} className={cn("flex flex-col", col.offset, c === 2 && "col-span-2 md:col-span-1")}>
              <div className={cn("flex flex-col gap-3 md:gap-6", c === 2 && "grid grid-cols-2 md:flex")}>
                {col.items.map((idx, k) => {
                  const p = photos[idx];
                  return (
                    <FadeIn key={idx} delay={c * 0.08 + k * 0.1}>
                      <button
                        type="button"
                        onClick={() => {
                          track("gallery-open", { photo: idx + 1 });
                          setOpen(idx);
                        }}
                        data-cursor="view"
                        data-cursor-label="Open"
                        aria-label={`Open photo ${idx + 1} of ${photos.length}: ${p.alt}`}
                        className={cn(
                          "group relative block w-full overflow-hidden rounded-card-lg bg-bg-sunk",
                          p.src.width > p.src.height ? "aspect-[5/4]" : "aspect-[4/5]",
                        )}
                      >
                        <Image
                          src={p.src}
                          alt={p.alt}
                          fill
                          placeholder="blur"
                          sizes="(min-width: 768px) 32vw, 50vw"
                          className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                        />
                        <span className="label absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-white/90 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </button>
                    </FadeIn>
                  );
                })}
              </div>
            </Parallax>
          ))}
        </div>
      </div>

      <Lightbox index={open} onClose={() => setOpen(null)} onChange={setOpen} />
    </section>
  );
}

function Lightbox({ index, onClose, onChange }: { index: number | null; onClose: () => void; onChange: (i: number) => void }) {
  const photos = gallery.photos;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(1);
  const isOpen = index !== null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      onChange((index + d + photos.length) % photos.length);
    },
    [index, onChange, photos.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    const trigger = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      trigger?.focus?.({ preventScroll: true });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Tab") {
        const nodes = [...document.querySelectorAll<HTMLElement>("#lightbox button")];
        const i = nodes.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) (e.preventDefault(), nodes[nodes.length - 1].focus());
        else if (!e.shiftKey && i === nodes.length - 1) (e.preventDefault(), nodes[0].focus());
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, go, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          id="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[80] flex flex-col bg-black/95 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: ease.soft }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="flex items-center justify-between px-4 py-4 md:px-8">
            <span className="label text-white/70 tabular-nums" aria-live="polite">
              {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close photo viewer"
              className="grid size-12 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-black"
            >
              <Close />
            </button>
          </div>

          <div className="relative flex-1" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <m.div
                key={index}
                custom={dir}
                className="pointer-events-none absolute inset-4 md:inset-x-24 md:inset-y-2"
                initial={{ opacity: 0, x: dir * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -60 }}
                transition={{ duration: 0.6, ease: ease.outExpo }}
              >
                <Image
                  src={photos[index].src}
                  alt={photos[index].alt}
                  fill
                  sizes="100vw"
                  quality={85}
                  placeholder="blur"
                  className="object-contain"
                />
              </m.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
            <p className="max-w-xl text-sm text-white/70">{photos[index].alt}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="grid size-12 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-black"
              >
                <ArrowLeft />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="grid size-12 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-black"
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
