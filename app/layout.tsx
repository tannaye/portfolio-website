import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { site, socials } from "@/content/site";
import { Header } from "@/components/Header";
import { Preloader } from "@/components/Preloader";
import { Providers } from "@/components/Providers";
import { Curtain } from "@/components/ui/Curtain";
import { SmoothScroll } from "@/lib/scroll";
import "./globals.css";

const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap", weight: ["400", "500"] });
const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
  preload: false, // editorial accents only, never above the fold
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.handle,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Victor Iwatannaye",
    "Tannaye",
    "Senior Software Engineer",
    "AI Engineer",
    "Backend Engineer",
    "Fintech",
    "Node.js",
    "TypeScript",
    "Lagos",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: site.handle,
    title: site.title,
    description: site.description,
    firstName: site.firstName,
    lastName: site.lastName,
    locale: "en_GB",
  },
  twitter: { card: "summary_large_image", creator: "@tannaye_dev", title: site.title, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: light)", color: "#f4f2ec" },
  ],
  colorScheme: "dark light",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.creatorName,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: "Senior Software Engineer",
  worksFor: { "@type": "Organization", name: "Acumen Digital" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "University of Lagos" },
  address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
  knowsAbout: ["Backend engineering", "Fintech", "Digital banking", "AI engineering", "LLM applications", "Microservices", "Node.js", "TypeScript", "Go"],
  sameAs: Object.values(socials),
};

/** Runs before paint: theme without a flash, and skip the intro when already seen. */
const bootScript = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('theme');d.dataset.theme=t==='light'?'light':'dark';if(matchMedia('(prefers-reduced-motion: reduce)').matches||sessionStorage.getItem('intro-seen'))d.classList.add('intro-skip','intro-done')}catch(e){d.dataset.theme='dark'}})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${interTight.variable} ${inter.variable} ${mono.variable} ${serif.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.preloader{display:none}.hero-line,.hero-fade,.hero-portrait-img{transform:none!important;opacity:1!important}.hero-cover{display:none}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>
        <Providers>
          <a
            href="#main"
            className="fixed left-4 top-4 z-[120] -translate-y-24 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink focus:translate-y-0"
          >
            Skip to content
          </a>
          <SmoothScroll />
          <Preloader />
          <Header />
          {children}
          <Curtain />
          <div className="grain" aria-hidden="true" />
        </Providers>
      </body>
    </html>
  );
}
