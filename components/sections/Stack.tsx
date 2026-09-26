import { stack } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { Marquee } from "@/components/animations/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";

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

        <dl className="group/wall mt-16 border-t border-line md:mt-24">
          {stack.groups.map((g, i) => (
            <FadeIn key={g.name} delay={i * 0.04} className="grid grid-cols-1 gap-3 border-b border-line py-6 md:grid-cols-12 md:gap-6 md:py-8">
              <dt className="label pt-2 text-fg-subtle md:col-span-3">
                <span className="mr-3 text-fg-muted">{String(i + 1).padStart(2, "0")}</span>
                {g.name}
              </dt>
              <dd className="md:col-span-9">
                <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-display text-[clamp(1.5rem,3.2vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.04em]">
                  {g.items.map((t, j) => (
                    <li
                      key={t}
                      className="transition-opacity duration-300 group-hover/wall:opacity-25 hover:!opacity-100"
                    >
                      {t}
                      {j < g.items.length - 1 && <span className="ml-2 font-light text-fg-subtle">/</span>}
                    </li>
                  ))}
                </ul>
              </dd>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}
