import { ai, projects } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ArrowRight } from "@/components/ui/Icons";

export function AI() {
  const featured = projects.find((p) => p.slug === ai.featured);

  return (
    <section id="ai" aria-label="AI engineering" className="relative overflow-hidden border-y border-line bg-bg-sunk py-28 md:py-40">
      <div className="container-page">
        <SectionHeading index="01.2" label={ai.label} title={ai.title} aside={<p className="text-pretty md:text-lg">{ai.lede}</p>} />

        {/* Pipeline: the one idea, drawn */}
        <FadeIn className="mt-16 md:mt-24">
          <figure>
            <ol className="flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0" aria-label="How a message becomes a trade">
              {ai.pipeline.map((step, i) => {
                const decisive = step.startsWith("Risk");
                const model = step.startsWith("LLM");
                return (
                  <li key={step} className="flex items-center md:flex-1">
                    <div
                      className={[
                        "relative flex w-full flex-col justify-between gap-6 rounded-card border p-4 md:min-h-40 md:p-5",
                        decisive ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg-elev",
                      ].join(" ")}
                    >
                      <span className={`label ${decisive ? "text-accent-ink/70" : "text-fg-subtle"}`}>
                        {String(i + 1).padStart(2, "0")}
                        {model && " · probabilistic"}
                        {decisive && " · deterministic"}
                      </span>
                      <span className="font-display text-lg leading-tight font-semibold tracking-tight md:text-xl">{step}</span>
                    </div>
                    {i < ai.pipeline.length - 1 && (
                      <span aria-hidden="true" className="relative mx-2 hidden h-px w-6 shrink-0 overflow-hidden bg-line-strong md:block">
                        <span className="absolute inset-y-0 left-0 w-1/2 animate-[flow_1.6s_var(--ease-in-out-quart)_infinite] bg-fg" style={{ animationDelay: `${i * 0.18}s` }} />
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
            <figcaption className="label mt-5 text-fg-subtle">
              From the AI Trading Assistant: the model proposes, the Risk Engine disposes.
            </figcaption>
          </figure>
        </FadeIn>

        <ul className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-card-lg border border-line bg-line md:grid-cols-2">
          {ai.principles.map((p, i) => (
            <FadeIn as="li" key={p.title} delay={(i % 2) * 0.08} className="bg-bg-sunk p-6 md:p-10">
              <span className="label text-accent-text">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-display text-title font-semibold">{p.title}</h3>
              <p className="mt-3 max-w-lg text-pretty leading-relaxed text-fg-muted">{p.body}</p>
            </FadeIn>
          ))}
        </ul>

        {featured && (
          <FadeIn className="mt-10 flex justify-end">
            <TransitionLink
              href={`/work/${featured.slug}`}
              data-cursor="view"
              className="group label flex items-center gap-3 text-fg transition-colors hover:text-accent-text"
            >
              Read the AI Trading Assistant case study
              <ArrowRight width={16} height={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </TransitionLink>
          </FadeIn>
        )}
      </div>
    </section>
  );
}
