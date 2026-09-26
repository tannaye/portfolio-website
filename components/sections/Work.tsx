import { projects, type Project } from "@/content/site";
import { FadeIn } from "@/components/animations/FadeIn";
import { ProjectCover } from "@/components/ProjectCover";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ArrowUpRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/** Editorial layout: one featured project, then an offset two-column rhythm. */
const LAYOUT = [
  { span: "md:col-span-12", aspect: "aspect-[4/3] md:aspect-[21/9]" },
  { span: "md:col-span-7", aspect: "aspect-[4/3]" },
  { span: "md:col-span-5 md:mt-32", aspect: "aspect-[4/5]" },
  { span: "md:col-span-5", aspect: "aspect-[4/5]" },
  { span: "md:col-span-7 md:mt-32", aspect: "aspect-[4/3]" },
];

export function Work() {
  return (
    <section id="work" aria-label="Selected work" className="relative py-28 md:py-40">
      <div className="container-page">
        <SectionHeading
          index="01.1"
          label="Selected work"
          title={["Selected", "work."]}
          aside={
            <p className="text-pretty md:text-lg">
              AI, fintech, logistics and the tools underneath them. Each one is a short case study: the problem, the approach, the impact.
            </p>
          }
        />

        <ul className="mt-16 grid grid-cols-1 gap-x-6 gap-y-16 md:mt-24 md:grid-cols-12 md:gap-y-24">
          {projects.map((p, i) => (
            <FadeIn as="li" key={p.slug} delay={(i % 2) * 0.1} className={LAYOUT[i % LAYOUT.length].span}>
              <ProjectCard project={p} index={i} aspect={LAYOUT[i % LAYOUT.length].aspect} featured={i === 0} />
            </FadeIn>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProjectCard({ project, index, aspect, featured }: { project: Project; index: number; aspect: string; featured: boolean }) {
  return (
    <TransitionLink href={`/work/${project.slug}`} data-cursor="view" className="group block" aria-label={`${project.name}: case study`}>
      <div className={cn("relative overflow-hidden rounded-card-lg border border-line", aspect)}>
        <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
          <ProjectCover project={project} />
        </div>
        <span className="label absolute left-5 top-5 rounded-full border border-line-strong bg-bg/60 px-3 py-1.5 text-fg backdrop-blur-md">
          {project.category}
        </span>
        <span className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-fg text-bg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45">
          <ArrowUpRight width={18} height={18} />
        </span>
      </div>

      <div className={cn("mt-6 grid gap-4", featured && "md:grid-cols-12")}>
        <div className={cn(featured && "md:col-span-6")}>
          <p className="label flex gap-3 text-fg-subtle">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{project.year}</span>
          </p>
          <h3 className="mt-3 font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.035em] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-2">
            {project.name}
          </h3>
        </div>
        <div className={cn("flex flex-col gap-3", featured && "md:col-span-6 md:pt-7")}>
          <p className="text-pretty text-fg-muted md:text-lg">{project.summary}</p>
          <p className="text-pretty text-sm leading-relaxed text-fg">
            <span className="text-fg-subtle">Impact: </span>
            {project.impact}
          </p>
          {/* Metadata eases in on hover (always visible on touch) */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
            <span className="label text-fg-muted">{project.role}</span>
            <span className="label text-fg-subtle">{project.stack.slice(0, 4).join(" · ")}</span>
          </div>
        </div>
      </div>
    </TransitionLink>
  );
}
