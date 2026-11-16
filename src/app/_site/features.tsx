import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { FooterMobile } from "@/components/mobile/FooterMobile";
import { FeaturesPageClient } from "@/components/features/FeaturesPageClient";
import { BookDemoModal } from "@/components/ui/BookDemoModal";
import { getDict, HTML_LANG, LANGS, featuresPath, langPath, type Lang } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { HomeHashLinks } from "./HomeHashLinks";

// /features and /ka/features — one component for both, built the same way /pricing is. The header
// nav's "Features" item links here (lib/nav.ts); the scene's own "#features" section (state 2)
// keeps its hash and is a different URL.

export function featuresMetadata(lang: Lang): Metadata {
  const { featuresPage } = getDict(lang);
  const url = `${SITE_URL}${featuresPath(lang)}`;
  return {
    title: featuresPage.title,
    description: featuresPage.description,
    alternates: {
      canonical: featuresPath(lang),
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], featuresPath(l)])),
        "x-default": featuresPath("en"),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${featuresPage.title} | ${SITE_NAME}`,
      description: featuresPage.description,
    },
    twitter: { title: `${featuresPage.title} | ${SITE_NAME}`, description: featuresPage.description },
  };
}

export function FeaturesPage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <main className="relative flex flex-1 flex-col">
      {/* header/footer links to the scene's sections are bare hashes — on this page they become a
          navigation to the home page with that section (same as on /pricing) */}
      <HomeHashLinks home={langPath(lang)} />
      <noscript>
        <style>{"[data-fe-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <FeaturesPageClient t={t} />
      <div data-footer-pinned className="max-lg:hidden">
        <Footer t={t} lang={lang} />
      </div>
      <FooterMobile t={t} lang={lang} />
      {/* "Talk to sales" opens the same Book a demo popup the hero uses */}
      <BookDemoModal t={t} />
    </main>
  );
}
