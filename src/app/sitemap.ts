import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { HTML_LANG, LANGS, langPath } from "@/lib/i18n";

// /sitemap.xml — one entry per language of the single landing page, each carrying the hreflang
// alternates (Google reads them from the sitemap as well as from the <head>).
const alternates = Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], `${SITE_URL}${langPath(l)}`]));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return LANGS.map((lang) => ({
    url: `${SITE_URL}${langPath(lang)}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: { languages: alternates },
  }));
}
