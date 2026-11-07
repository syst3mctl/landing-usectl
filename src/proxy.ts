import { NextResponse, type NextRequest } from "next/server";
import { LANG_COOKIE, langPath } from "@/lib/i18n";

// Visitors from Georgia land on the Georgian page.
//
// Cloudflare fronts usectl.com and stamps every request with `cf-ipcountry` (ISO 3166 code, "GE"
// for Georgia) — no Cloudflare setting is needed for it. This only ever touches the bare `/`:
//   · a visitor who already picked a language (the LANG_COOKIE the EN / KA switcher writes) is
//     never redirected again — a Georgian who chooses English stays on English;
//   · `/ka` and every other path, links someone shared included, are left alone;
//   · only real page loads are redirected (no RSC/prefetch fetches, no crawlers — Google crawls
//     from the US and the hreflang alternates already tell it about `/ka`);
//   · no header (local dev, or the request didn't come through Cloudflare) → nothing happens.
// The pages themselves stay prerendered: proxy runs before routing, it doesn't make them dynamic.

const GEORGIA = "GE";
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse/i;

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return NextResponse.next();
  if (request.cookies.has(LANG_COOKIE)) return NextResponse.next();
  if (request.headers.get("cf-ipcountry")?.toUpperCase() !== GEORGIA) return NextResponse.next();
  // browsers send `document` for a page load and `empty` for fetch()/RSC prefetches; header-less
  // clients (old browsers, curl) count as a page load
  const dest = request.headers.get("sec-fetch-dest");
  if (dest && dest !== "document") return NextResponse.next();
  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return NextResponse.next();

  const url = request.nextUrl.clone(); // keeps the query string (utm_* etc.); the browser keeps the #hash
  url.pathname = langPath("ka");
  const res = NextResponse.redirect(url, 307); // temporary: the answer depends on who is asking
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: "/",
};
