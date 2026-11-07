import { en, type Dict } from "./en";
import { ka } from "./ka";

export type { Dict } from "./en";

// EN / KA, decided 2026-11-06 (PROJECT.md). English keeps the bare `/` — it is the URL Google has
// indexed — and Georgian lives at `/ka` (ISO 639-1; `ge` is the COUNTRY code). Both are prerendered
// by the optional catch-all route `app/[[...lang]]`; the only proxy (src/proxy.ts) redirects `/` and never
// renders, so there is no dynamic rendering: the CSP and the CDN caching both depend on these pages staying static.
//
// There is deliberately NO redirect by `Accept-Language`. The one automatic step is by COUNTRY:
// src/proxy.ts sends visitors from Georgia (Cloudflare's `cf-ipcountry`) from `/` to `/ka`, once —
// after the visitor picks a language with the switcher, LANG_COOKIE remembers it and wins.

export const LANGS = ["en", "ka"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

/** The URL segment each language lives under ("" = the site root). */
export const LANG_SEGMENT: Record<Lang, string> = { en: "", ka: "ka" };

/** BCP 47 tags for <html lang> and the hreflang alternates. */
export const HTML_LANG: Record<Lang, string> = { en: "en", ka: "ka" };

/** Cookie the EN / KA switcher writes; while it exists src/proxy.ts never redirects by country. */
export const LANG_COOKIE = "lang";

/** What the switcher shows for each language. */
export const LANG_LABEL: Record<Lang, string> = { en: "EN", ka: "KA" };

const DICTS: Record<Lang, Dict> = { en, ka };

export const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

export const getDict = (lang: Lang): Dict => DICTS[lang];

/**
 * The path a language's page lives at, optionally with a hash: "/" · "/ka" · "/ka#pricing".
 * Section hashes are identical in both languages (SECTION_HASHES in lib/nav.ts), so switching
 * language with the current hash lands on the same section — the reload-restore and the pre-paint
 * hide script already key off the hash, so that needs no extra logic.
 */
export const langPath = (lang: Lang, hash = "") => `/${LANG_SEGMENT[lang]}${hash}`;

/** True for any path that IS a language home ("/" or "/ka") — used by the "logo goes home" handlers. */
export const isHomePath = (pathname: string) =>
  LANGS.some((l) => pathname === langPath(l) || pathname === `${langPath(l)}/`);

/**
 * The params `app/[[...lang]]` is prerendered for: `[]` is the site root (`/` = English) and
 * `["ka"]` is `/ka`. `dynamicParams = false` next to it makes anything else a 404.
 */
export const LANG_PARAMS = LANGS.map((lang) => ({
  lang: LANG_SEGMENT[lang] ? [LANG_SEGMENT[lang]] : [],
}));

/**
 * The language a request's catch-all segments mean: `undefined` / `[]` → the default, `["ka"]` →
 * Georgian, anything else → null (the page calls notFound()).
 */
export const langFromSegments = (segments: string[] | undefined): Lang | null => {
  if (!segments || segments.length === 0) return DEFAULT_LANG;
  if (segments.length > 1) return null;
  const found = LANGS.find((l) => LANG_SEGMENT[l] === segments[0]);
  return found && found !== DEFAULT_LANG ? found : null;
};

/** Splices values into a `{name}`-style placeholder string from the dictionary. */
export const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
