/**
 * All copy and data for the site lives here.
 * Edit this file to change text, links, projects or images. No component changes needed.
 *
 * Rule of thumb: only state things that are true. Anything left as `null`
 * (follower counts, video links, project URLs) is simply not rendered.
 */
import type { StaticImageData } from "next/image";

import photoDesk from "@/public/images/photo-1.jpg";
import photoFrame from "@/public/images/photo-2.jpg";
import photoGuitar from "@/public/images/photo-3.jpg";
import photoCouch from "@/public/images/photo-4.jpg";
import photoMic from "@/public/images/photo-5.jpg";
import photoTrio from "@/public/images/photo-6.jpg";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Photo = { src: StaticImageData; alt: string; source: string };

export type Role = {
  company: string;
  title: string;
  period: string;
  location?: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export type ProjectCategory = "AI" | "Fintech" | "Logistics" | "Products";

export type Project = {
  slug: string;
  name: string;
  category: ProjectCategory;
  year: string;
  role: string;
  summary: string;
  impact: string;
  stack: string[];
  image: Photo | null;
  /** Visual treatment when there is no image. */
  tone: "blue" | "lime" | "amber" | "magenta";
  link: { label: string; href: string } | null;
  caseStudy: { problem: string; approach: string[]; impact: string[] };
};

export type Platform = {
  name: "Instagram" | "TikTok" | "X" | "LinkedIn" | "GitHub";
  handle: string;
  href: string;
  /** Hard-code a real number like "12.4K", or leave null to hide it. */
  followers: string | null;
  blurb: string;
};

export type JourneyEntry = {
  /** Label on the wave, e.g. "2019". */
  year: string;
  title: string;
  /** The year, told as a short first-person story. */
  story: string;
  /** Things made that year, shown as tags under the story. */
  built?: string[];
  /**
   * Draft entries are placeholders: visible in `npm run dev` (dashed, labelled)
   * and hidden in production builds. Delete `draft: true` to publish one.
   */
  draft?: boolean;
};

export type Clip = { title: string; href: string; platform: "YouTube" | "Instagram" | "TikTok"; embedId?: string };

/* ------------------------------------------------------------------ */
/* Photography (credit: Assam Inc. via Pixieset)                       */
/* ------------------------------------------------------------------ */

const PIX = "https://assaminc7072.pixieset.com/fela/";

export const photos = {
  desk: {
    src: photoDesk,
    alt: "Victor seated at a desk with a laptop and tablet, hands clasped, looking into the camera",
    source: `${PIX}?pid=16181367484&id=5&h=MTc1MzM1NjEx`,
  },
  frame: {
    src: photoFrame,
    alt: "Victor smiling in round glasses, framed by his own hands in the foreground",
    source: `${PIX}?pid=16181377579&id=13&h=MTAxMTE0NjQ4Mg`,
  },
  guitar: {
    src: photoGuitar,
    alt: "Victor seated on a stool playing an acoustic guitar",
    source: `${PIX}?pid=16181369961&id=9&h=NDI1MzA2MDcwNw`,
  },
  couch: {
    src: photoCouch,
    alt: "Victor relaxing on a sofa with his phone, an acoustic guitar leaning beside him",
    source: `${PIX}?pid=16181376659&id=11&h=MjY2NjA1MjI5NA`,
  },
  mic: {
    src: photoMic,
    alt: "Victor holding a microphone and throwing a peace sign",
    source: `${PIX}?pid=16181372861&id=12&h=MzgyNjY0MDQyNQ`,
  },
  trio: {
    src: photoTrio,
    alt: "Three versions of Victor in one frame: playing guitar, working at a desk, and holding a microphone",
    source: `${PIX}?pid=16181363563&id=2&h=NDA3Mjk2NzM5NA`,
  },
} satisfies Record<string, Photo>;

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Victor Iwatannaye",
  firstName: "Victor",
  lastName: "Iwatannaye",
  handle: "tannaye.dev",
  creatorName: "Tannaye",
  url: "https://tannaye.dev",
  title: "Victor Iwatannaye — Software Engineer, AI Engineer & Creator",
  description:
    "Senior software engineer building production backend systems, fintech platforms and AI-powered products. Also Tannaye: technology content creator, based in Lagos.",
  email: "iwatannayevictor@gmail.com",
  location: "Lagos, Nigeria",
  timezone: "Africa/Lagos",
  timezoneLabel: "WAT",
  available: true,
  availabilityLabel: "Available for select opportunities",
  cv: "/victor-iwatannaye-cv.pdf",
  tagline: "Code. Strings. Stories.",
  roles: [
    "Software Engineer",
    "AI Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Content Creator",
  ],
};

export const socials: Record<
  "github" | "linkedin" | "x" | "instagram" | "tiktok" | "youtube",
  string
> = {
  github: "https://github.com/tannaye",
  linkedin: "https://www.linkedin.com/in/victor-iwatannaye/",
  x: "https://x.com/tannaye_dev",
  instagram: "https://www.instagram.com/tannaye.dev/",
  tiktok: "https://www.tiktok.com/@tannaye.dev",
};

export const nav = [
  { id: "work", label: "Work", image: photos.desk, header: true },
  { id: "about", label: "About", image: photos.trio, header: true },
  { id: "journey", label: "Journey", image: photos.couch, header: false },
  { id: "experience", label: "Experience", image: photos.frame, header: true },
  { id: "creator", label: "Creator", image: photos.mic, header: true },
  { id: "music", label: "Music", image: photos.guitar, header: false },
  { id: "contact", label: "Contact", image: photos.couch, header: true },
] as const;

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

export const hero = {
  eyebrow: "Senior Software Engineer · AI Engineer · Creator",
  lines: ["I build software", "people can trust."],
  body: "Over six years designing systems for banks, lenders and fintech products, and more recently building real products with LLMs. Off the clock, I catch cruise on social media and play the guitar.",
  primaryCta: { label: "View my work", href: "#work" },
  secondaryCta: { label: "Let's work together", href: "#contact" },
  portrait: photos.desk,
};

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

export const about = {
  label: "About",
  title: "One person, three frequencies.",
  lede: "I build software, but software isn't the only thing I make.",
  bio: "I studied computer science at the University of Lagos and have spent the years since building the parts of financial products nobody sees: the APIs, ledgers, queues and integrations that have to be right every single time. That same obsession with getting details right shows up everywhere else. In the videos I make as Tannaye. In the hours I lose to a guitar. It's all the same habit: take something complicated, and make it feel simple.",
  photo: photos.trio,
  personas: [
    {
      key: "engineer",
      title: "Engineer",
      tint: "var(--tint-eng)",
      target: "experience",
      body: "I build production software: backend systems, fintech platforms and AI-powered applications.",
      image: photos.desk,
    },
    {
      key: "creator",
      title: "Creator",
      tint: "var(--tint-content)",
      target: "creator",
      body: "As Tannaye, I make content about technology, software engineering, AI and everyday ideas.",
      image: photos.mic,
    },
    {
      key: "musician",
      title: "Musician",
      tint: "var(--tint-music)",
      target: "music",
      body: "I play guitar. Music is how I step away from the screen, and how I come back to it.",
      image: photos.guitar,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Journey                                                             */
/* ------------------------------------------------------------------ */

export const journey = {
  label: "Journey",
  title: ["My achievements", "over the years."],
  lede: "From a first QBasic program in 2015 to banking infrastructure and AI: the story so far.",
  entries: [
    {
      year: "2015",
      title: "First lines of code",
      story:
        "It started with QBasic. A few lines of code, and the moment a computer actually did what I told it to. I didn't know it yet, but I was hooked.",
    },
    {
      year: "2016",
      title: "Java, and my first apps",
      story:
        "The next year I picked up Java and went from exercises to building things. Just a couple of small apps, but they were mine, and they worked.",
      built: ["A couple of Java apps"],
    },
    {
      year: "2017",
      title: "Hello, web",
      story:
        "My world got wider. I had my first real introduction to web development and tried building a website for the teens' church. At the same time I was learning Visual Basic, building an ATM machine simulator and an SGPA calculator, and picking up C along the way.",
      built: ["Teens' church website", "ATM machine simulator", "SGPA calculator"],
    },
    {
      year: "2018",
      title: "Back to JavaScript",
      story:
        "Then came a setback: a heartbreaking result in the Java course I took at school. Instead of stepping away, I went back to JavaScript. That year I built a mobile app that replaced the phone's default call app, and a website for a bus ticketing system.",
      built: ["Call app replacement", "Bus ticketing website"],
    },
    {
      year: "2019",
      title: "Exploring, then choosing the web",
      story:
        "I spent 2019 testing other paths. I took cyber security courses and learnt a lot, right down to accessing the dark web. I tried networking and sat the HCNA exam. But the progress I wanted kept showing up in web development, so I went back to it, built a face recognition app, and joined Leni Labs as a full-stack developer.",
      built: ["Face recognition app"],
    },
    {
      year: "2020",
      title: "A year of range",
      story:
        "2020 was a year of range. I built company websites for a media company and for an oil company merger, an app where people could hire tutors, an e-commerce app for artworks, and an e-library. Five very different problems, one year.",
      built: ["Media company website", "Tutor-hiring app", "Artwork e-commerce app", "Oil company merger website", "E-library"],
    },
    {
      year: "2021",
      title: "Into fintech",
      story:
        "I moved into fintech. I joined Acumen Digital as a senior full-stack engineer, took on a contract with Kinly USA on a digital banking app, and built Awoof, an app for philanthropists to give, and Jeriod, a crypto exchange app.",
      built: ["Awoof", "Jeriod"],
    },
    {
      year: "2022",
      title: "Savings, lending and a new build",
      story:
        "This year was about money moving between people. I built StarryGold / AkoJoo, which helps people save and merchants manage those savings, and Captis, which makes micro-lending possible. And I started building something new: Tendar.",
      built: ["StarryGold / AkoJoo", "Captis", "Tendar (started)"],
    },
    {
      year: "2023",
      title: "Launching Tendar",
      story:
        "Tendar went live. V1 launched as lending infrastructure for lending technologies and apps, and I built the piece every lending decision depends on: its credit scoring system.",
      built: ["Tendar V1", "Credit scoring system"],
    },
    {
      year: "2024",
      title: "Buy now, pay later",
      story:
        "Next came buy now, pay later. I built a digital marketplace for BNPL, and the e-mandate process behind collecting repayments afterwards.",
      built: ["BNPL marketplace", "E-mandate repayment collection"],
    },
    {
      year: "2025",
      title: "Core banking for a new bank",
      story:
        "A bank got its MFB licence and needed the systems to actually run as one. I built its banking infrastructure, covering the core banking activities a bank lives on.",
      built: ["Core banking infrastructure"],
    },
    {
      year: "2026",
      title: "Building with AI, in public",
      story:
        "Now I'm building with AI, carefully. My AI-powered trading assistant lets the model work out what people mean, while a deterministic risk engine decides what actually happens. I've also built a couple of games, open-sourced a clean-architecture API foundation, and designed and built the site you're reading.",
      built: ["AI Trading Assistant", "A couple of games", "Open-source API foundation", "This website"],
    },
  ] satisfies JourneyEntry[],
};

/* ------------------------------------------------------------------ */
/* Engineering                                                         */
/* ------------------------------------------------------------------ */

export const stats = [
  { value: 6, suffix: "+", label: "Years building production software" },
  { value: 30, suffix: "%+", label: "Platform performance gained through architecture and database work" },
  { value: 50, suffix: "%", label: "Less project setup time with reusable backend templates" },
  { value: 4, suffix: "", label: "Industries shipped for: fintech, logistics, e-commerce, education" },
];

export const experience: Role[] = [
  {
    company: "Acumen Digital",
    title: "Senior Full-Stack Software Engineer",
    period: "Feb 2021 — Present",
    summary:
      "Leading backend development and architecture for fintech, digital banking and lending platforms, including banking solutions for Focus MFB.",
    highlights: [
      "Designed scalable microservice architectures and secure REST APIs for lending-as-a-service, credit scoring and transaction processing.",
      "Built reusable backend templates and engineering standards that cut project setup time by 50%.",
      "Moved slow work onto event-driven queues and integrated third-party payment and banking providers.",
      "Mentored engineers, ran code reviews and supported business-critical systems in production.",
    ],
    stack: ["Node.js", "TypeScript", "NestJS", "PostgreSQL", "MySQL", "RabbitMQ", "Kafka", "AWS", "Docker"],
  },
  {
    company: "Kinly USA",
    title: "Mobile Software Developer · Contract",
    period: "Sep 2021 — Feb 2022",
    summary: "Worked on a digital banking app used by customers across multiple platforms.",
    highlights: [
      "Worked with the backend teams on secure financial workflows and customer-facing features.",
      "Kept the app available and fast through proactive testing, monitoring and fast issue resolution.",
      "Improved user experience and stability through rapid iteration and production support.",
    ],
    stack: ["React Native", "TypeScript", "Redux", "REST APIs"],
  },
  {
    company: "Leni Labs",
    title: "Full-Stack Software Developer",
    period: "Aug 2019 — Jan 2021",
    summary: "Built web applications and backend systems for e-commerce, logistics and education platforms.",
    highlights: [
      "Designed REST APIs supporting business operations and customer-facing apps.",
      "Built admin dashboards and reporting tools that made operations more efficient and easier to see.",
      "Integrated mapping and geolocation services to support logistics workflows.",
    ],
    stack: ["Node.js", "Express", "React", "MongoDB", "MySQL", "Maps APIs"],
  },
];

export const projects: Project[] = [
  {
    slug: "ai-trading-assistant",
    name: "AI Trading Assistant",
    category: "AI",
    year: "2026",
    role: "Solo · Architecture & build",
    summary: "Control MetaTrader 5 accounts through WhatsApp or Telegram in plain language.",
    impact: "The LLM never places a trade. It only turns language into structured intent, and a deterministic risk engine decides.",
    stack: ["TypeScript", "OpenAI function calling", "zod", "BullMQ", "Redis", "MongoDB", "MQL5", "Docker"],
    image: null,
    tone: "lime",
    link: { label: "View on GitHub", href: "https://github.com/tannaye/ai-trading-assistant" },
    caseStudy: {
      problem:
        "Chat is the most natural interface for a trader, and the most dangerous. A language model that misreads \"close half\" as \"close all\" costs real money. The challenge was to get the convenience of natural language without handing the model any authority.",
      approach: [
        "Strict Clean Architecture: the domain knows nothing about Express, OpenAI, Telegram or Redis. Every adapter plugs into a port.",
        "The LLM interprets messages via function calling into a zod-validated TradingIntent, with retries and a safe fallback when output doesn't validate.",
        "A pure, synchronous Risk Engine (no I/O, no clock, no globals) checks 11 ordered rules, including session, symbol, lot size, risk %, daily loss, exposure and free margin, and short-circuits on the first violation.",
        "Approved trades go through BullMQ to an execution-command store that a custom MQL5 Expert Advisor polls, executes and reports back on.",
      ],
      impact: [
        "Language is flexible; execution is deterministic and fully unit-tested.",
        "Channels (WhatsApp, Telegram) and providers are swappable without touching any consumer.",
        "Security by default: JWT + EA API keys, AES-256-GCM secrets at rest, fail-open distributed rate limiting, verified webhooks.",
      ],
    },
  },
  {
    slug: "digital-banking-focus-mfb",
    name: "Digital Banking for Focus MFB",
    category: "Fintech",
    year: "2021 — Present",
    role: "Backend engineer · Acumen Digital",
    summary: "Secure APIs and backend services behind customer-facing and operational banking.",
    impact: "Customer onboarding, account management and transaction workflows for a microfinance bank.",
    stack: ["Node.js", "TypeScript", "PostgreSQL", "Microservices", "AWS", "Docker"],
    image: null,
    tone: "blue",
    link: null,
    caseStudy: {
      problem:
        "A bank's digital product has two audiences: customers who need things to be simple, and operations teams who need things to be correct. The backend has to serve both, securely, with no room for inconsistency.",
      approach: [
        "Built secure APIs and backend services for customer onboarding, account management and transaction workflows.",
        "Designed PostgreSQL and MySQL schemas for data integrity first, then tuned them for query performance.",
        "Integrated with third-party financial service providers, payment platforms and core banking systems.",
      ],
      impact: [
        "Supported both customer-facing and operational banking functions.",
        "Owned systems end to end, from architecture to production support.",
      ],
    },
  },
  {
    slug: "lending-as-a-service",
    name: "Lending-as-a-Service & Credit Scoring",
    category: "Fintech",
    year: "2021 — Present",
    role: "Backend lead · Acumen Digital",
    summary: "APIs for loan origination, credit scoring and financial transaction processing.",
    impact: "Event-driven workflows that keep loan processing resilient under load.",
    stack: ["NestJS", "TypeScript", "PostgreSQL", "RabbitMQ", "Kafka", "Redis"],
    image: null,
    tone: "amber",
    link: null,
    caseStudy: {
      problem:
        "Lending touches scoring, disbursement, repayments and third-party checks, and many of those calls are slow or unreliable. Running them all in the request path makes the whole platform fragile.",
      approach: [
        "Designed a microservice architecture with clear ownership boundaries for lending, scoring and transactions.",
        "Moved slow and failure-prone work onto asynchronous, event-driven workflows over message queues.",
        "Built secure REST APIs for partners consuming lending as a service.",
      ],
      impact: [
        "Better platform reliability, maintainability and performance.",
        "Part of the architecture and database work behind 30%+ platform performance gains.",
      ],
    },
  },
  {
    slug: "clean-api-foundation",
    name: "Clean API Foundation",
    category: "Products",
    year: "2026",
    role: "Author · Open source",
    summary: "A production-ready Express + TypeScript starting point built on Clean Architecture.",
    impact: "The idea behind the reusable templates that cut backend setup time by 50%, published openly.",
    stack: ["Express 5", "TypeScript", "MongoDB", "Redis", "JWT", "AES-256-GCM", "Docker"],
    image: null,
    tone: "magenta",
    link: { label: "View on GitHub", href: "https://github.com/tannaye/node-ts-boilerplate" },
    caseStudy: {
      problem:
        "Every new backend service used to start with the same week of setup: auth, errors, validation, logging, caching, encryption. Done differently each time, it drifted.",
      approach: [
        "Domain, use cases, adapters and infrastructure in strict layers, with dependencies pointing inward.",
        "Auth built in: JWT with encrypted payloads, token caching in Redis, password reset flows.",
        "Typed HTTP errors, a generic paginated repository, a lightweight DI container, Winston logging.",
      ],
      impact: [
        "New services start from a consistent, secure baseline.",
        "Engineers spend their first day on the product, not the plumbing.",
      ],
    },
  },
  {
    slug: "logistics-operations",
    name: "Logistics Operations Platform",
    category: "Logistics",
    year: "2019 — 2021",
    role: "Full-stack developer · Leni Labs",
    summary: "APIs, dashboards and geolocation for logistics and e-commerce operations.",
    impact: "Gave operations teams clear visibility through admin dashboards and reporting.",
    stack: ["Node.js", "Express", "React", "MongoDB", "Maps & geolocation APIs"],
    image: null,
    tone: "blue",
    link: null,
    caseStudy: {
      problem: "Operations teams were coordinating deliveries without a clear view of what was happening on the ground.",
      approach: [
        "Designed REST APIs supporting business operations and customer-facing applications.",
        "Integrated mapping and geolocation services into logistics workflows.",
        "Built admin dashboards and reporting tools for day-to-day operations.",
      ],
      impact: ["Improved operational efficiency and business visibility."],
    },
  },
];

export const ai = {
  label: "AI",
  title: ["AI, beyond", "the chatbot."],
  lede: "I don't just experiment with AI. I build useful software with it, and I treat the model as the least trustworthy part of the system.",
  principles: [
    {
      title: "Models interpret. Code decides.",
      body: "LLMs turn messy language into structured intent. Anything with consequences, like money, data or side effects, goes through deterministic, tested code.",
    },
    {
      title: "Structured outputs, always",
      body: "Tool calling into schemas validated with zod. If the output doesn't validate, it retries, then falls back safely. It never guesses.",
    },
    {
      title: "Augment what already works",
      body: "The best AI features live inside existing products and workflows: onboarding, support, operations. They don't need a new tab.",
    },
    {
      title: "Reliability is a feature",
      body: "Latency budgets, cost per call, rate limits and graceful degradation are designed in from day one, not bolted on later.",
    },
  ],
  pipeline: ["Message", "LLM · tool call", "zod · TradingIntent", "Risk Engine · 11 rules", "Queue", "Execution"],
  featured: "ai-trading-assistant",
};

export const stack = {
  label: "Stack",
  title: "Tools I reach for.",
  groups: [
    { name: "Languages", items: ["TypeScript", "JavaScript", "Go", "PHP"] },
    { name: "Backend", items: ["Node.js", "NestJS", "Express", "AdonisJS", "REST", "Microservices"] },
    { name: "Data", items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase"] },
    { name: "Messaging", items: ["RabbitMQ", "Kafka", "BullMQ"] },
    { name: "Infrastructure", items: ["AWS", "Docker", "Kubernetes", "DigitalOcean", "CI/CD"] },
    { name: "Frontend", items: ["React", "React Native", "Next.js", "Redux"] },
    { name: "AI", items: ["LLMs", "Tool calling", "AI agents", "Structured outputs", "RAG"] },
    { name: "Quality", items: ["Jest", "Mocha", "TDD"] },
  ],
};

export const leadership = {
  label: "Leadership",
  title: "Seniority is mostly the invisible work.",
  items: [
    { title: "Architecture", body: "Designed the microservice and event-driven foundations that fintech products run on." },
    { title: "Standards", body: "Created the templates and engineering standards teams build from, cutting setup time in half." },
    { title: "Mentorship", body: "Mentored engineers and ran code reviews focused on correctness and maintainability." },
    { title: "Technical decisions", body: "Led engineering teams through technical decisions, from database design to deployment." },
    { title: "Product partnership", body: "Worked closely with product, design and QA to ship business-critical features." },
    { title: "Production ownership", body: "Stayed on the hook after launch, troubleshooting critical issues and keeping platforms up." },
  ],
};

/* ------------------------------------------------------------------ */
/* Creator                                                             */
/* ------------------------------------------------------------------ */

export const creator = {
  label: "Creator",
  title: "Tannaye",
  lede: "Technology, ideas and the things I'm curious about. I explain software the way I wish it had been explained to me.",
  cards: [photos.mic, photos.frame, photos.couch],
  platforms: [
    { name: "Instagram", handle: "@tannaye.dev", href: socials.instagram, followers: null, blurb: "Short explainers and behind-the-scenes." },
    { name: "TikTok", handle: "@tannaye.dev", href: socials.tiktok, followers: null, blurb: "Quick takes on tech, AI and dev life." },
    { name: "X", handle: "@tannaye_dev", href: socials.x, followers: null, blurb: "Thoughts in progress." },
    { name: "LinkedIn", handle: "Victor Iwatannaye", href: socials.linkedin, followers: null, blurb: "The professional side." },
  ] satisfies Platform[],
  collab: "Brands and teams building for developers: let's make something worth watching.",
};

/* ------------------------------------------------------------------ */
/* Music                                                               */
/* ------------------------------------------------------------------ */

export const music = {
  label: "Music",
  title: ["Guitar has nothing to do with software.", "And somehow, it has everything to do with it."],
  body: "Six strings, a lot of patience, and the same loop I know from engineering: practise, listen, fix the part that's off, repeat. It's where I go to think without a screen.",
  photo: photos.guitar,
  wide: photos.couch,
  /** Add real performance links here; the grid renders only when this has items. */
  clips: [] as Clip[],
  /** Where clips live until `clips` is filled in. */
  clipsFallback: { label: "Clips live on Instagram", href: socials.instagram },
};

/* ------------------------------------------------------------------ */
/* Gallery & contact                                                   */
/* ------------------------------------------------------------------ */

export const gallery = {
  label: "Gallery",
  title: "Off the clock, on camera.",
  photos: [photos.frame, photos.guitar, photos.desk, photos.couch, photos.mic, photos.trio],
  credit: { name: "Assam Inc.", href: "https://assaminc7072.pixieset.com/fela/" },
};

export const contact = {
  eyebrow: "Contact",
  headline: ["Have something", "interesting to build?"],
  kicker: "Let's build something.",
  note: "Engineering roles, AI products, brand collaborations, or just a good conversation.",
  credit: "Designed & built by Victor",
};
