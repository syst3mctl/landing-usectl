import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "@/components/layout/Header";
import { BackgroundLines } from "@/components/layout/BackgroundLines";
import { SessionReplay } from "@/components/SessionReplay";
import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  SIGNUP_URL,
  STATE_BY_HASH,
  STATE_STORAGE_KEY,
  X_URL,
} from "@/lib/nav";
import { getDict, HTML_LANG, LANGS, langPath, type Lang } from "@/lib/i18n";
import { SITE_NAME, SITE_URL, STARTING_PRICE_USD } from "@/lib/seo";
import "../globals.css";

// The <html>/<body> shell and the <head> metadata, shared by the two ROOT layouts —
// app/(en)/layout.tsx (serves `/`) and app/(ka)/layout.tsx (serves `/ka`).
//
// Why two root layouts instead of one dynamic route: only a root layout can render <html>, and
// `<html lang>` has to differ per language. `app/[lang]` would turn `/` into `/en` (the URL search
// engines have indexed) and needs a proxy redirect, i.e. dynamic rendering, which the CSP and CDN
// caching in next.config.ts deliberately avoid; `app/[[...lang]]` looked right but Next refuses it
// as soon as the segment has any child route — "Optional catch-all must be the last part of the
// URL" — and opengraph-image/twitter-image ARE child routes. Route groups keep both pages fully
// prerendered, keep `/` byte-identical to before, and give each language its own share card.
// Navigating between two root layouts is a full page load, which is exactly what the language
// switcher wants (the pre-paint restore script has to run).
//
// `_site` is a private folder (leading underscore), so nothing in here becomes a route.

// Only used by the mono panels/terminals, none of which is above the fold — no preload, so it
// doesn't compete with the hero's Space Grotesk on first load.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Space Grotesk and Geist Mono carry NO Georgian glyphs (both latin-subset), so /ka needs a
// Georgian face. globals.css APPENDS it to the stacks under html[lang="ka"] rather than replacing
// them: Latin runs (usectl, Kubernetes, vCPU, $15.10) keep rendering in Space Grotesk and only
// Georgian letters fall through to this one — a font stack resolves per glyph.
//
// preload: false because `/` never uses it (it would otherwise be fetched on the English page too).
//
// BPG Banner Caps (Besarion Gugushvili) — the team's pick, self-hosted from _site/fonts because it
// is not on Google Fonts. Files are the npm package's byte for byte; it has ONE weight, so
// globals.css also sets `font-synthesis: none` on /ka — the browser would otherwise fake bold for
// every font-medium/semibold heading and smear the letterforms.
// LICENCE: the font files are CC BY-NC-ND 4.0 (NonCommercial) — see NOTICE-BPGBannerCaps.md.
const bpgBanner = localFont({
  src: [
    { path: "./fonts/BPGBannerCaps.woff2", weight: "400", style: "normal" },
    { path: "./fonts/BPGBannerCaps.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-bpg-banner",
  display: "swap",
  preload: false,
});

// Analytics and search-ownership live in the ENVIRONMENT, never in the repo — the IDs are set in
// the host's env panel (and .env.local for a local check), so a redeploy can't wipe them the way a
// tag pasted into the built HTML or a hosting dashboard would. Unset ⇒ nothing is rendered at all,
// so a dev machine without the vars behaves exactly like today.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;

const OG_LOCALE: Record<Lang, string> = { en: "en_US", ka: "ka_GE" };

export const VIEWPORT: Viewport = {
  themeColor: "#1e1d1d",
  colorScheme: "dark",
};

/**
 * The <head> for one language. All copy comes from that language's dictionary (src/lib/i18n).
 * The share image is NOT listed here: the opengraph-image.tsx / twitter-image.tsx files beside
 * each page add og:image and twitter:image (with width/height/alt) themselves.
 */
export function buildMetadata(lang: Lang): Metadata {
  const { seo } = getDict(lang);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: `%s | ${SITE_NAME}`,
    },
    description: seo.description,
    applicationName: SITE_NAME,
    keywords: seo.keywords,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "technology",
    // The usectl asterisk. Declared explicitly (and served from public/) rather than relying on
    // app/icon.svg + app/favicon.ico: those are picked up from the ROOT segment, and with two root
    // layouts there is no root segment to put them in — one file can't live in both groups without
    // two routes resolving to the same URL.
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/favicon.ico",
    },
    alternates: {
      canonical: langPath(lang),
      // hreflang: each language points at the other, x-default at English
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], langPath(l)])),
        "x-default": langPath("en"),
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}${langPath(lang)}`,
      siteName: SITE_NAME,
      locale: OG_LOCALE[lang],
      title: seo.title,
      description: seo.shareDescription,
    },
    // Search Console ownership. The DNS-TXT method survives a redeploy on its own; this meta tag is
    // here so the HTML-tag method can't be lost again (it only renders when the env var is set).
    ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
    twitter: {
      card: "summary_large_image",
      site: "@usectlcloud",
      creator: "@usectlcloud",
      title: seo.title,
      description: seo.shareDescription,
    },
  };
}

// Structured data (schema.org) — tells Google / AI search what this is: the organisation,
// the site, and the product with its starting price. `<` is escaped per the Next.js JSON-LD guide.
const jsonLdFor = (lang: Lang) => {
  const { seo } = getDict(lang);
  const url = `${SITE_URL}${langPath(lang)}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo/logo.svg`,
        email: CONTACT_EMAIL,
        sameAs: [X_URL, INSTAGRAM_URL, FACEBOOK_URL],
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: SITE_NAME,
        description: seo.description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: HTML_LANG[lang],
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url,
        description: seo.description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          price: STARTING_PRICE_USD,
          priceCurrency: "USD",
          url: SIGNUP_URL,
        },
      },
    ],
  };
};

// Runs before first paint (inline, so it can't wait for hydration). If the desktop scene is about
// to reopen on a later page — a reload mid-journey, or a /#pricing deep link — it hides the stage
// (html[data-restoring], globals.css) so the server-rendered hero doesn't flash for the second it
// takes HeroSectionClient to hydrate and land there; that component fades the stage back in. Same
// guards as the scene itself (<1024 and reduced-motion get the stacked build, which never hides).
// The 4s timeout is a safety net only: the page can never stay hidden if JS fails.
const RESTORE_HIDE_SCRIPT = `(function(){try{
if(matchMedia("(max-width: 1023px)").matches||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var s=${JSON.stringify(STATE_BY_HASH)}[location.hash];
if(s===undefined)s=Number(sessionStorage.getItem(${JSON.stringify(STATE_STORAGE_KEY)}))||0;
if(s>0){var r=document.documentElement;r.setAttribute("data-restoring","");setTimeout(function(){r.removeAttribute("data-restoring")},4000);}
}catch(e){}})();`;

export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = getDict(lang);

  return (
    <html
      lang={HTML_LANG[lang]}
      // the pre-paint script below may add data-restoring before React hydrates
      suppressHydrationWarning
      className={`${geistMono.variable} ${spaceGrotesk.variable} ${bpgBanner.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESTORE_HIDE_SCRIPT }} />
      </head>
      <body className="relative min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(lang)).replace(/</g, "\\u003c") }}
        />
        <BackgroundLines />
        <Header t={t} lang={lang} />
        {children}
        <SessionReplay />
      </body>
      {/* gtag.js, loaded after hydration by @next/third-parties (Next 16's own integration), so it
          can't delay the hero's LCP. GA4's Enhanced Measurement handles pageviews by itself. */}
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
