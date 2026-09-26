import { About } from "@/components/sections/About";
import { AI } from "@/components/sections/AI";
import { Contact } from "@/components/sections/Contact";
import { Creator } from "@/components/sections/Creator";
import { Experience } from "@/components/sections/Experience";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { Journey } from "@/components/sections/Journey";
import { Leadership } from "@/components/sections/Leadership";
import { Music } from "@/components/sections/Music";
import { Stack } from "@/components/sections/Stack";
import { Work } from "@/components/sections/Work";
import { SectionProgress } from "@/components/SectionProgress";

/**
 * The story, in order: a senior engineer → how he got here → who builds serious products → with AI →
 * and leads → who also creates → and plays guitar → a curious human.
 */
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <About />
        <Journey />
        <Experience />
        <Work />
        <AI />
        <Stack />
        <Leadership />
        <Creator />
        <Music />
        <Gallery />
      </main>
      <Contact />
      <SectionProgress />
    </>
  );
}
