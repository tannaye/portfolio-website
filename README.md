# tannaye.dev

Personal site of **Victor Iwatannaye**: senior software engineer, AI builder, creator (as _Tannaye_).

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Motion (`motion/react`) and Lenis.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes are statically prerendered)
npm start          # serve the production build
npm run typecheck
```

Node 20+ is required.

## Editing content

**All copy, links and data live in [`content/site.ts`](content/site.ts).** You never need to touch a component to change text.

| To change…                                         | Edit                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Name, email, availability, tagline, rotating roles | `site`                                                                                               |
| Social links                                       | `socials`                                                                                            |
| Hero headline & intro                              | `hero`                                                                                               |
| Bio, persona cards                                 | `about`                                                                                              |
| Year-by-year story (Journey wave)                  | `journey.entries`. Entries with `draft: true` show only in `npm run dev`; delete the flag to publish |
| Jobs (timeline)                                    | `experience`                                                                                         |
| Headline numbers (count-up)                        | `stats`                                                                                              |
| Projects + case-study pages                        | `projects` (each one becomes `/work/<slug>`)                                                         |
| AI principles & pipeline                           | `ai`                                                                                                 |
| Tech wall & marquee                                | `stack`                                                                                              |
| Leadership points                                  | `leadership`                                                                                         |
| Creator platforms, follower counts                 | `creator.platforms[].followers` (leave `null` to hide)                                               |
| Guitar videos                                      | `music.clips` (grid appears once there is at least one)                                              |
| Gallery order                                      | `gallery.photos`                                                                                     |

**Photos** are in `public/images/photo-1.jpg` to `photo-6.jpg`, by Assam Inc. (Pixieset source URLs are kept in `photos` for reference). Replace a file with the same name, or import a new one at the top of `content/site.ts`. Blur placeholders and AVIF/WebP are generated automatically.

**CV:** replace `public/victor-iwatannaye-cv.pdf` (the current file is exported from the Google Doc).

**Accent colour:** one variable, `--accent` in `app/globals.css`.

### Things still to fill in

- `creator.platforms[].followers`: real follower counts (hidden until set, never faked).
- `music.clips`: links to performance videos. Until then, a card links to Instagram.
- Project `link`s for the Acumen / Leni Labs work, if any are public.
- The CV's email hyperlink points to `victoriwatannaye@gmail.com`, while its visible text says `iwatannayevictor@gmail.com`. The site uses the visible one; double-check which is correct.

## Analytics

Usage is tracked with [Umami Cloud](https://cloud.umami.is): cookieless, so no consent banner. The website id and allowed domains live in `analytics` in `content/site.ts`. Only `tannaye.dev` and `www.tannaye.dev` report, so local and preview builds stay out of the stats (add a domain there to track a preview URL).

Custom events (Umami → Events), sent through `track()` in `lib/analytics.ts`:

| Event | Data | Fires when |
| --- | --- | --- |
| `section-view` | `section` | A section is reached (once per visit) |
| `journey-skip` / `journey-complete` | `from` / `layout` | The Journey is skipped, or scrolled to its last year |
| `case-study-open` | `project`, `from` | A case study is opened |
| `live-site-click` | `project`, `from` | A live product link is clicked |
| `cv-download`, `email-click`, `email-copy`, `collab-click` | | Contact intent |
| `social-click` | `platform`, `from` | Any social link (contact, footer, menu, creator, phones) |
| `cta-click`, `persona-click`, `menu-open`, `theme-toggle` | | Navigation and UI |
| `gallery-open`, `clip-click` | `photo` / `clip` | Media |
| `guitar-mode`, `guitar-sound`, `game-start`, `game-finish` | `mode`, `game`, results | The guitar games |

Use `track()` rather than Umami's `data-umami-event` attributes: on same-tab links those make Umami cancel the click and hard-reload the page.

## Deploying to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel: **Add New… → Project → Import** the repo. No settings are needed; the framework is auto-detected.
3. Add the domain `tannaye.dev` under **Settings → Domains**.

If the domain changes, update `site.url` in `content/site.ts` (used for canonical URLs, Open Graph, sitemap and JSON-LD).

---

## Design system

**Direction:** a software engineer's portfolio designed like a premium creative studio site. Restraint first: typography does the hierarchy, and motion only appears where it explains something.

| Token                        | Value                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Background / ink             | `#0A0A0A` / `#F5F5F0` (dark default). Light: `#F4F2EC` / `#111110`                                |
| Accent (single)              | `#D4F34A`, used for status, selection, the curtain and key CTAs                                   |
| Persona tints (section-only) | Engineering `#6AA8FF` · Music `#E8A13D` · Creator `#FF5FA2`                                       |
| Lines                        | fg at 9% / 18% opacity                                                                            |
| Display                      | Inter Tight 600–700, tracking −0.035 to −0.055em                                                  |
| Body                         | Inter                                                                                             |
| Labels                       | JetBrains Mono, 11px, uppercase, +0.08em                                                          |
| Editorial accent             | Instrument Serif italic                                                                           |
| Type scale                   | `text-mega` (hero, ~12.5vw), `display`, `headline`, `title`, `lede`, `label`, all fluid `clamp()` |
| Radius                       | cards 20px, large cards 24px, pills full                                                          |
| Spacing                      | Tailwind 4px base, used on an 8px rhythm. Sections `py-28 → md:py-40`                             |
| Container                    | 1536px max, gutters `clamp(1rem, 4vw, 3rem)`                                                      |
| Easing                       | `outExpo (0.16,1,0.3,1)` reveals · `inOutQuart (0.65,0,0.35,1)` movement across the screen        |
| Durations                    | 0.2–0.3s hover · 0.6–1.2s reveals                                                                 |

### Motion language

- **Masked line reveals** for headings, **fade-up** for everything else, staggered in grids.
- **Scroll-linked** only where it tells the story: bio words brighten, the experience timeline pins and scrolls sideways, phones fan out, the music section warms up, the footer headline grows.
- Only `transform` and `opacity` animate (plus `clip-path` on the menu overlay).
- The hero intro is pure CSS keyed off `<html class="intro-done">`, so it starts on first paint.

### Cursor (`components/ui/Cursor.tsx`)

The dot follows the pointer exactly; the ring trails it with a frame-rate-independent lerp (0.15). It uses `mix-blend-mode: difference`. State comes from the nearest `data-cursor`:

| Attribute                           | Shape                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| _(default)_                         | dot + ring                                               |
| `link` (auto on `a`/`button`)       | filled circle, no dot                                    |
| `external` (auto on off-site links) | filled circle + ↗                                        |
| `view`                              | large circle, "View" (override with `data-cursor-label`) |
| `play`                              | circle + play icon                                       |
| `pick`                              | guitar pick, "Play"                                      |
| `image`                             | large outline circle                                     |
| `text` (auto on paragraphs/inputs)  | thin caret                                               |
| `hide`                              | hidden                                                   |

It is disabled on touch (`pointer: coarse`) and with `prefers-reduced-motion`, and the native cursor comes back. It is always `pointer-events: none`.

### Page architecture

Preloader → Hero → About (three frequencies) → Journey (2015 → now wave) → **01** Experience (pinned timeline + stats) → 01.1 Work → 01.2 AI → 01.3 Stack → 01.4 Leadership → **02** Tannaye (creator) → **03** Music (interactive strings) → Gallery → Contact/footer. Case studies live at `/work/[slug]` and are reached through an accent curtain wipe.

### Photo casting

| Photo                         | Where                            | Why                                                 |
| ----------------------------- | -------------------------------- | --------------------------------------------------- |
| 6: three Victors in one frame | About                            | It _is_ the concept: engineer, musician and creator |
| 1: at the desk                | Hero, Engineering persona, menu  | Most "senior engineer"                              |
| 5: microphone                 | Creator phone + persona          | Creator energy                                      |
| 2: framing hands              | Creator phone, gallery           | Playful, camera-aware                               |
| 3: guitar                     | Music portrait, Musician persona | Direct                                              |
| 4: sofa + guitar (landscape)  | Music full-bleed, menu           | The only landscape shot: ideal full-bleed           |

Project covers (`components/ProjectCover.tsx`) are drawn from each project's real architecture (the risk-engine rule list, a ledger, a score gauge, clean-architecture layers, a route). There are no stock images and no invented screenshots. The numbers shown inside the covers are illustrative UI, not claims.

## Accessibility & performance

- Reduced motion: no preloader, smooth scroll, parallax, pinning or cursor. Fades are kept.
- Skip link, semantic landmarks, visible focus rings, keyboard-operable menu (focus trap, Esc), lightbox (←/→/Esc) and string buttons (the canvas has button equivalents).
- The header reappears when anything in it receives focus.
- Sound is off by default and synthesised on demand (Karplus–Strong); there are no audio files and nothing autoplays.
- Below-the-fold images are lazy; the cursor, menu and guitar canvas are code-split.
- SEO: metadata, Open Graph / Twitter images (generated), JSON-LD `Person`, `sitemap.xml`, `robots.txt`.

Latest local Lighthouse (production build): **desktop** 98 / 96 / 100 / 100, **mobile** ~84 / 96 / 100 / 100 (Performance / Accessibility / Best Practices / SEO). On mobile the remaining gap is simulated main-thread time for the JS bundle. The accessibility deduction is the scroll-scrubbed bio: words sit at reduced opacity until you scroll to them, as the design intends.

## Project structure

```
app/                  routes, metadata, OG image, sitemap, robots
  work/[slug]/        case-study pages (static)
components/
  sections/           one file per page section
  animations/         RevealLines, FadeIn, WordScrub, CountUp, Parallax, Marquee
  ui/                 Cursor, Magnetic, Button, Icons, Curtain, ThemeToggle, …
content/site.ts       ALL copy and data
lib/                  motion tokens, hooks, smooth scroll, tiny stores
public/               photos, CV
```
