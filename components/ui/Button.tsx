import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ArrowUpRight } from "./Icons";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-fg hover:text-bg",
  ghost: "border border-line-strong text-fg hover:bg-fg hover:text-bg hover:border-fg",
};

/**
 * Pill button with a sliding arrow. Magnetic by default.
 * Renders an <a> (internal via next/link, external/new-tab via plain anchor).
 */
export function Button({
  href,
  children,
  variant = "primary",
  icon = <ArrowUpRight width={18} height={18} />,
  magnetic = true,
  external,
  className,
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  magnetic?: boolean;
  external?: boolean;
} & Omit<ComponentProps<"a">, "href">) {
  const cls = cn(
    "group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full pl-6 pr-2 text-[0.95rem] font-medium tracking-tight",
    "transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-soft)] active:scale-[0.97]",
    styles[variant],
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <span
        className={cn(
          "relative grid size-10 place-items-center overflow-hidden rounded-full",
          variant === "primary" ? "bg-accent-ink/10" : "bg-fg/5",
        )}
      >
        <span className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-6 group-hover:-translate-y-6">
          {icon}
        </span>
        <span className="absolute -translate-x-6 translate-y-6 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-0 group-hover:translate-y-0">
          {icon}
        </span>
      </span>
    </>
  );

  const anchor =
    external || href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf") ? (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );

  return magnetic ? <Magnetic strength={0.25}>{anchor}</Magnetic> : anchor;
}
