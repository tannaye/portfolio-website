import type { Project } from "@/content/site";
import { LiveArt } from "@/components/LiveArt";
import { cn } from "@/lib/cn";

/**
 * Project cover. Every project gets a bespoke animated scene (components/LiveArt.tsx),
 * chosen by `art` in content/site.ts. Projects without one fall back to a tinted panel.
 */

const TONE: Record<Project["tone"], string> = {
  lime: "var(--accent)",
  blue: "var(--tint-eng)",
  amber: "var(--tint-music)",
  magenta: "var(--tint-content)",
};

export function ProjectCover({ project, className }: { project: Project; className?: string }) {
  if (project.art) {
    return (
      <div className={cn("absolute inset-0", className)}>
        <LiveArt art={project.art} />
      </div>
    );
  }
  const tone = TONE[project.tone];
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 grid place-items-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 85% 10%, color-mix(in oklab, ${tone} 22%, transparent), transparent 60%), var(--bg-elev)`,
      }}
    >
      <span className="font-display text-headline font-semibold tracking-tight text-fg-subtle">{project.name}</span>
    </div>
  );
}
