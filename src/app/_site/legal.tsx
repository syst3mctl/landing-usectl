import type { Metadata } from "next";
import { marked } from "marked";
import { getDict, HTML_LANG, LANGS, langPath, legalPath, type Lang, type LegalDoc } from "@/lib/i18n";
import { readLegal } from "@/lib/legal";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { SYSTEMCTL_URL } from "@/lib/nav";
import { CookieSettingsButton } from "@/components/layout/CookieSettingsButton";
import { HomeHashLinks } from "./HomeHashLinks";

// /privacy, /terms, /ka/privacy, /ka/terms — one component for all four. The text is markdown from
// content/legal/ (src/lib/legal.ts), turned into HTML at build time; it is our own repo's content,
// which is why rendering it as HTML is fine. Typography: `.legal` in globals.css.
//
// While a text still has [[PLACEHOLDERS]] the page is noindex and left out of the sitemap, and the
// placeholders are highlighted so nobody can miss them.

const description = (lang: Lang, doc: LegalDoc) =>
  doc === "privacy" ? getDict(lang).legal.privacyDescription : getDict(lang).legal.termsDescription;

export function legalMetadata(lang: Lang, doc: LegalDoc): Metadata {
  const { title, draft } = readLegal(doc, lang);
  const url = `${SITE_URL}${legalPath(lang, doc)}`;
  return {
    title,
    description: description(lang, doc),
    alternates: {
      canonical: legalPath(lang, doc),
      languages: {
        ...Object.fromEntries(LANGS.map((l) => [HTML_LANG[l], legalPath(l, doc)])),
        "x-default": legalPath("en", doc),
      },
    },
    openGraph: { type: "website", url, siteName: SITE_NAME, title, description: description(lang, doc) },
    twitter: { card: "summary", title, description: description(lang, doc) },
    ...(draft ? { robots: { index: false, follow: true } } : {}),
  };
}

export function LegalPage({ lang, doc }: { lang: Lang; doc: LegalDoc }) {
  const t = getDict(lang);
  const { markdown } = readLegal(doc, lang);
  const html = (marked.parse(markdown, { async: false, gfm: true }) as string)
    // tables scroll sideways on a phone instead of squashing the cookie table into one-word columns
    .replace(/<table>/g, '<div class="legal-table"><table>')
    .replace(/<\/table>/g, "</table></div>")
    .replace(/\[\[([^\]]+)\]\]/g, '<mark class="legal-todo">[[$1]]</mark>');
  const other: LegalDoc = doc === "privacy" ? "terms" : "privacy";

  return (
    <main className="relative flex flex-1 flex-col">
      <HomeHashLinks home={langPath(lang)} />
      <article
        className="legal relative mx-auto w-full max-w-[860px] bg-background/90 px-6 py-14 sm:px-10 lg:py-20"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <footer className="relative mx-auto flex w-full max-w-[860px] flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 bg-background/90 px-6 py-8 font-heading text-[13px] text-white/45 sm:px-10">
        <span>
          &copy; 2026{" "}
          <a href={SYSTEMCTL_URL} target="_blank" rel="noopener noreferrer" className="text-brand transition-opacity hover:opacity-70">
            SYSTEMCTL
          </a>
        </span>
        <a href={legalPath(lang, other)} className="transition-colors hover:text-white">
          {t.legal[other]}
        </a>
        <CookieSettingsButton label={t.cookies.settings} className="transition-colors hover:text-white" />
        <a href={langPath(lang)} className="transition-colors hover:text-white sm:ml-auto">
          {t.legal.backHome}
        </a>
      </footer>
    </main>
  );
}
