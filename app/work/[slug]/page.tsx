import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, site } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { RevealLines } from "@/components/animations/RevealLines";
import { ProjectCover } from "@/components/ProjectCover";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Track } from "@/components/ui/Track";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.name,
    description: `${project.summary} ${project.impact}`,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.name} · ${site.name}`, description: project.summary, url: `${site.url}/work/${project.slug}` },
  };
}

export default async function CaseStudy({ params }: Props) {
  const { slug } = await params;
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];

  const meta = [
    { k: "Category", v: project.category },
    { k: "Year", v: project.year },
    { k: "Role", v: project.role },
  ].filter((m) => m.v);

  return (
    <>
      <main id="main" className="pb-28 pt-28 md:pt-36">
        <article>
          <header className="container-page">
            <TransitionLink href="/#work" className="group label inline-flex items-center gap-3 text-fg-muted transition-colors hover:text-fg">
              <ArrowLeft width={14} height={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
              All work
            </TransitionLink>
            <RevealLines
              as="h1"
              lines={[project.name]}
              className="mt-10 max-w-6xl font-display text-display font-semibold text-balance"
            />
            <FadeIn delay={0.2}>
              <p className="mt-8 max-w-3xl font-display text-lede font-medium text-pretty text-fg-muted">{project.summary}</p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <dl className="mt-12 grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-3">
                {meta.map((m) => (
                  <div key={m.k}>
                    <dt className="label text-fg-subtle">{m.k}</dt>
                    <dd className="mt-2">{m.v}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          </header>

          <FadeIn delay={0.35} className="container-page mt-12 md:mt-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-card-lg border border-line md:aspect-[21/9]">
              <ProjectCover project={project} />
            </div>
          </FadeIn>

          <div className="container-page mt-20 grid gap-16 md:mt-32 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <p className="label text-fg-subtle">Impact in one line</p>
                <p className="mt-4 font-serif text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15] italic text-balance">{project.impact}</p>
                {project.stack.length > 0 && (
                  <>
                    <p className="label mt-10 text-fg-subtle">Technology</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((t) => (
                        <li key={t} className="label rounded-full border border-line px-3 py-1.5 text-fg-muted">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {project.link && (
                  <div className="mt-10">
                    <Track event="live-site-click" data={{ project: project.slug, from: "case-study" }}>
                      <Button href={project.link.href}>{project.link.label}</Button>
                    </Track>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex flex-col gap-20 lg:col-span-7 lg:col-start-6">
              <Block n="01" title="The problem">
                <p className="text-pretty text-lg leading-relaxed md:text-xl">{project.caseStudy.problem}</p>
              </Block>
              <Block n="02" title="The approach">
                <List items={project.caseStudy.approach} />
              </Block>
              <Block n="03" title="The impact">
                <List items={project.caseStudy.impact} />
              </Block>
            </div>
          </div>
        </article>
      </main>

      <nav aria-label="Next project" className="container-page">
        <Track event="case-study-open" data={{ project: next.slug, from: "next" }}>
        <TransitionLink href={`/work/${next.slug}`} data-cursor="view" data-cursor-label="Next" className="group block border-t border-line pt-10">
          <span className="label flex items-center gap-3 text-fg-subtle">
            Next case study <ArrowRight width={14} height={14} />
          </span>
          <span className="mt-6 block font-display text-display font-semibold transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-4">
            {next.name}
          </span>
        </TransitionLink>
        </Track>
      </nav>
      <div className="h-28" />
    </>
  );
}

function Block({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <FadeIn as="section">
      <h2 className="flex items-baseline gap-4 font-display text-headline font-semibold">
        <span className="label text-accent-text">{n}</span>
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </FadeIn>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col divide-y divide-line border-y border-line">
      {items.map((t) => (
        <li key={t} className="flex gap-5 py-5 text-pretty text-lg leading-relaxed text-fg-muted">
          <span className="mt-[0.8em] h-px w-5 shrink-0 bg-accent" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}
