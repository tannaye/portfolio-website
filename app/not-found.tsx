import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="container-page flex min-h-[100svh] flex-col justify-center gap-8 py-32">
      <p className="label text-fg-subtle">404</p>
      <h1 className="font-display text-display font-semibold">
        Wrong note.
        <br />
        <span className="font-serif font-normal italic text-accent-text">This page doesn&apos;t exist.</span>
      </h1>
      <div>
        <Button href="/">Back home</Button>
      </div>
    </main>
  );
}
