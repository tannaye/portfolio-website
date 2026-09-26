import type { ReactNode } from "react";
import { RevealLines } from "@/components/animations/RevealLines";
import { cn } from "@/lib/cn";

/** Mono index label + big masked headline. Used at the top of every section. */
export function SectionHeading({
  index,
  label,
  title,
  aside,
  className,
  titleClassName,
  id,
}: {
  index?: string;
  label: string;
  title: ReactNode[];
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
  id?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:gap-8", className)}>
      <p className="label flex items-center gap-3 text-fg-muted">
        {index && <span className="text-fg">{index}</span>}
        {index && <span className="h-px w-8 bg-line-strong" aria-hidden="true" />}
        <span>{label}</span>
      </p>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <RevealLines
          as="h2"
          lines={title}
          className={cn("font-display text-display font-semibold text-balance", titleClassName)}
          {...(id ? { id } : {})}
        />
        {aside && <div className="max-w-md text-fg-muted lg:pb-3">{aside}</div>}
      </div>
    </div>
  );
}
