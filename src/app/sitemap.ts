import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { HTML_LANG, LANGS, LEGAL_DOCS, langPath, legalPath, pricingPath } from "@/lib/i18n";
import { readLegal } from "@/lib/legal";

// /sitemap.xml — the landing page, /pricing and the two legal pages, one entry per language, each carrying
// the hreflang alternates (Google reads them from the sitemap as well as from the <head>). A legal
// text that still has [[PLACEHOLDERS]] is a draft: noindex on the page, and not listed here.
const alternatesFor = (pathOf: (l: (typeof LANGS)[number]) => string) =>
  Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], `${SITE_URL}${pathOf(l)}`]));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const home = LANGS.map((lang) => ({
    url: `${SITE_URL}${langPath(lang)}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages: alternatesFor((l) => langPath(l)) },
  }));
  const pricing = LANGS.map((lang) => ({
    url: `${SITE_URL}${pricingPath(lang)}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: { languages: alternatesFor((l) => pricingPath(l)) },
  }));
  const legal = LEGAL_DOCS.flatMap((doc) =>
    LANGS.filter((lang) => !readLegal(doc, lang).draft).map((lang) => ({
      url: `${SITE_URL}${legalPath(lang, doc)}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.3,
      alternates: { languages: alternatesFor((l) => legalPath(l, doc)) },
    })),
  );
  return [...home, ...pricing, ...legal];
}
