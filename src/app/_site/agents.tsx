import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { FooterMobile } from "@/components/mobile/FooterMobile";
import { AgentsPageClient } from "@/components/agents/AgentsPageClient";
import { BookDemoModal } from "@/components/ui/BookDemoModal";
import { getDict, HTML_LANG, LANGS, agentsPath, langPath, type Lang } from "@/lib/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { HomeHashLinks } from "./HomeHashLinks";

// /agents and /ka/agents — one component for both, built the same way /features is. The header
// nav's "Agents" item links here since 2026-11-16 (lib/nav.ts); the scene's own "#agents" section
// (state 6) keeps its hash and is a different URL.

export function agentsMetadata(lang: Lang): Metadata {
  const { agentsPage } = getDict(lang);
  const url = `${SITE_URL}${agentsPath(lang)}`;
  return {
    title: agentsPage.title,
    description: agentsPage.description,
    alternates: {
      canonical: agentsPath(lang),
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], agentsPath(l)])),
        "x-default": agentsPath("en"),
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: `${agentsPage.title} | ${SITE_NAME}`,
      description: agentsPage.description,
    },
    twitter: { title: `${agentsPage.title} | ${SITE_NAME}`, description: agentsPage.description },
  };
}

export function AgentsPage({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <main className="relative flex flex-1 flex-col">
      {/* header/footer links to the scene's sections are bare hashes — on this page they become a
          navigation to the home page with that section (same as on /pricing) */}
      <HomeHashLinks home={langPath(lang)} />
      <noscript>
        <style>{"[data-fe-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <AgentsPageClient t={t} />
      <div data-footer-pinned className="max-lg:hidden">
        <Footer t={t} lang={lang} />
      </div>
      <FooterMobile t={t} lang={lang} />
      {/* mounted like on every page, so a Book a demo link anywhere keeps working */}
      <BookDemoModal t={t} />
    </main>
  );
}
