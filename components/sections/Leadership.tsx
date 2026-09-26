import { leadership } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Leadership() {
  return (
    <section id="leadership" aria-label="Leadership" className="relative pb-28 md:pb-40">
      <div className="container-page">
        <SectionHeading index="01.4" label={leadership.label} title={["Seniority is mostly", "the invisible work."]} />
        <ol className="mt-16 grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:mt-24 lg:grid-cols-3">
          {leadership.items.map((item, i) => (
            <FadeIn as="li" key={item.title} delay={(i % 3) * 0.08} className="border-t border-line pb-12 pt-6">
              <span className="label text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 font-display text-title font-semibold">{item.title}</h3>
              <p className="mt-3 max-w-sm text-pretty leading-relaxed text-fg-muted">{item.body}</p>
            </FadeIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
