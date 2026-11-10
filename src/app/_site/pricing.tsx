import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { FooterMobile } from "@/components/mobile/FooterMobile";
import { PricingPageClient } from "@/components/pricing/PricingPageClient";
import { BookDemoModal } from "@/components/ui/BookDemoModal";
import { getDict, HTML_LANG, LANGS, langPath, pricingPath, type Lang } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { HomeHashLinks } from "./HomeHashLinks";

// /pricing and /ka/pricing — one component for both. Pricing was state 8 of the pinned scene
// until 2026-11-10; it is its own page now (the scene goes Agents → closing CTA). The header nav's
// "Pricing" item links here (lib/nav.ts), and an old /#pricing link is redirected here by the
// shell's pre-paint script.

export function pricingMetadata(lang: Lang): Metadata {
  const { pricingPage } = getDict(lang);
  const url = `${SITE_URL}${pricingPath(lang)}`;
  return {
    title: pricingPage.title,
    description: pricingPage.description,
    alternates: {
      canonical: pricingPath(lang),
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], pricingPath(l)])),
        "x-default": pricingPath("en"),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${pricingPage.title} | ${SITE_NAME}`,
      description: pricingPage.description,
    },
    twitter: { title: `${pricingPage.title} | ${SITE_NAME}`, description: pricingPage.description },
  };
}

export function PricingPage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <main className="relative flex flex-1 flex-col">
      {/* header/footer links to the scene's sections are bare hashes — on this page they become a
          full load of the home page with that hash (same as on the legal pages) */}
      <HomeHashLinks home={langPath(lang)} />
      <noscript>
        <style>{"[data-pr-reveal]{visibility:visible!important}"}</style>
      </noscript>
      <PricingPageClient t={t} />
      <div data-footer-pinned className="max-lg:hidden">
        <Footer t={t} lang={lang} />
      </div>
      <FooterMobile t={t} lang={lang} />
      {/* "Talk to sales" opens the same Book a demo popup the hero uses */}
      <BookDemoModal t={t} />
    </main>
  );
}
