import { stack } from "@/content/site";
import { Marquee } from "@/components/animations/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StackWall } from "./StackWall";

const all = stack.groups.flatMap((g) => g.items);
const half = Math.ceil(all.length / 2);

export function Stack() {
  return (
    <section id="stack" aria-label="Technology" className="relative py-28 md:py-40">
      <div aria-hidden="true" className="flex flex-col gap-3 md:gap-4">
        {[all.slice(0, half), all.slice(half)].map((row, r) => (
          <Marquee key={r} reverse={r === 1} duration={r === 1 ? 55 : 45}>
            {row.map((t) => (
              <span
                key={t}
                className="mx-2 flex items-center gap-4 rounded-full border border-line px-6 py-3 font-display text-[clamp(1.25rem,2.4vw,2rem)] font-medium tracking-tight whitespace-nowrap text-fg-muted transition-colors hover:text-fg md:mx-3"
              >
                <span className="size-1.5 rounded-full bg-accent" />
                {t}
              </span>
            ))}
          </Marquee>
        ))}
      </div>

      <div className="container-page mt-24 md:mt-36">
        <SectionHeading
          index="01.3"
          label={stack.label}
          title={[stack.title]}
          aside={<p className="text-pretty md:text-lg">No skill bars. These are the tools I've shipped production systems with, grouped by what they're for.</p>}
        />

        <StackWall />
      </div>
    </section>
  );
}
