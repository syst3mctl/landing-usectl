// The header / burger-menu links, shared by Header, MobileMenu, HeroSectionClient and HeroMobile
// so they can't drift apart.
//
// `state` is the index of the page the link lands on. The desktop pinned scene's pages
// (HeroSectionClient's SNAP_TIMES) and the mobile stacked sections run in the SAME order, so one
// number drives both: desktop glides the timeline to that state, mobile scrolls to the section
// carrying that id. `external` links leave the site instead (no state, opened in a new tab).
import type { Dict } from "@/lib/i18n/en";
import { pricingPath, type Lang } from "@/lib/i18n";

export type NavLink = { label: string; href: string; state?: number; external?: boolean };

// The off-site destinations, kept here so every button/link that points at them agrees.
export const DOCS_URL = "https://docs.usectl.com/#introduction";
export const SIGNUP_URL = "https://manager.usectl.com/login";
export const X_URL = "https://x.com/usectlcloud";

// Every link that sends someone to SIGNUP_URL carries one of these as `data-cta`, and that string
// is the only parameter of the Meta `SignupClick` event (components/MetaPixel.tsx) — no PII, ever.
// The union is what makes it typo-proof: a wrong value is a TypeScript error, not a silently
// mislabelled event in Events Manager.
//
// Both builds of the page live in the DOM at the same time (the pinned desktop scene and the
// stacked phone one, one of them display:none), so the phone's copies need their own names —
// otherwise a report could not tell a phone click from a desktop one. `closing-*` is state 9's
// pair ("Start Building" / "See how it works"): they used to be the hero's, but the hero now has
// a single "Book a demo" button, which is NOT a signup and gets no Meta event.
export type CtaPlacement =
  | "header"
  | "mobile-menu"
  | "pricing"
  | "pricing-mobile"
  // the /pricing page (2026-11-10 design): hero "Start Free", the Machine card's trial button,
  // the closing card's "Start Free", and the calculator drawer's CTA
  | "pricing-hero"
  | "pricing-machine"
  | "pricing-final"
  | "pricing-calculator"
  | "closing-start"
  | "closing-start-mobile"
  | "closing-see-how"
  | "closing-see-how-mobile";

/** Spread onto a link that points at SIGNUP_URL: `{...ctaAttr("header")}`. */
export const ctaAttr = (placement: CtaPlacement) => ({ "data-cta": placement });
// The "Book a demo" booking page (Google Calendar appointment schedule). Two forms of the SAME
// schedule: the `?gv=true` one is the only one that may be framed (it is what Google's own embed
// snippet uses, and it is the host the CSP's frame-src allows — see next.config.ts), the short
// calendar.app.google link is for opening it in a real tab.
export const BOOKING_EMBED_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2fTKLczlgS8sWqwsR3TIw11IyRBcOEjP3RSStvzzRJ0X2dVkzxyy9eNIJY9ytmVvrCRZUqVCbe?gv=true";
export const BOOKING_URL = "https://calendar.app.google/DfuCX39z6aacyU7Z8";
export const INSTAGRAM_URL = "https://www.instagram.com/usectl.dev/";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61596061747860";
// the company behind usectl — the "© 2026 SYSTEMCTL" credit in both footers and the burger menu
export const SYSTEMCTL_URL = "https://systemctl.sh";

// The App Store / Google Play badges are hidden until the apps are actually published — the markup
// stays in both footers behind this flag, so publishing is a one-line change back to `true`.
export const SHOW_STORE_BADGES = false;

// The public contact address — both footers, the burger menu, the JSON-LD and the subscribe
// route's fallback destination all read it from here, so it can only ever be changed in one place
// (it was hello@ until 2026-11-07).
export const CONTACT_EMAIL = "info@usectl.com";
export const CONTACT_HREF = `mailto:${CONTACT_EMAIL}`;

// The footer's Subscribe box posts STRAIGHT to Web3Forms from the browser (2026-11-07) — their
// free plan does not allow server-side submissions ("Server side usage requires paid plan + server
// IP whitelisting"), so the previous route through /api/subscribe could never have delivered.
//
// This key is PUBLIC by design: it is an alias for a destination address, not a secret. Anyone can
// read it out of the shipped JS either way, and all it can do is send an email to info@usectl.com
// — it grants no access to the account or to past submissions. Abuse protection is Web3Forms' own
// (spam filtering + the `botcheck` honeypot) plus the client-side guards in SubscribeForm.tsx.
export const WEB3FORMS_KEY = "63bff0c5-1cc9-4183-911d-5e385db7d0c9";

// Same idea for the footer's phone number: hidden on request (2026-11-05) while the line is a
// placeholder, with the markup kept in both footers so a real number is one line away.
export const SHOW_PHONE = false;
export const PHONE_NUMBER = "+995 511 11 11 11";
export const PHONE_HREF = "tel:+995511111111";

// The social row, in the order the design draws it (X, Instagram, Facebook). The icons are the
// team's own exports in public/footer/, all stroked white @0.6, so they share one opacity/hover.
export const SOCIAL_LINKS = [
  // the per-icon sizes are the design board's (S10-Footer): the three files frame their glyph
  // differently, so equal boxes would read as three different sizes
  { label: "usectl on X", href: X_URL, icon: "/footer/x-twitter.svg", size: 20 },
  { label: "usectl on Instagram", href: INSTAGRAM_URL, icon: "/footer/instagram.svg", size: 18 },
  { label: "usectl on Facebook", href: FACEBOOK_URL, icon: "/footer/fb.svg", size: 20 },
] as const;

// The nav, without its labels: the label comes from the active language's dictionary (`key` is the
// entry in `Dict["nav"]`), so the header, the burger menu and BOTH footer columns can't drift from
// each other or from the translation.
// `page` = a separate route in the active language (Pricing has been its own page since
// 2026-11-10 — /pricing, /ka/pricing — instead of a state of the scene).
type NavItem = { key: keyof Dict["nav"]; href: string; state?: number; external?: boolean; page?: true };

const NAV_ITEMS: readonly NavItem[] = [
  { key: "machine", href: "#the-machine", state: 3 }, // "Give every project its own space"
  { key: "agents", href: "#agents", state: 6 }, // "Give your agent a place to work"
  { key: "features", href: "#features", state: 2 }, // "Your Stacks, in one place"
  { key: "pricing", href: "/pricing", page: true }, // its own page now — see pricingPath()
  { key: "documentation", href: DOCS_URL, external: true },
];

const hrefFor = (item: NavItem, lang: Lang) => (item.page ? pricingPath(lang) : item.href);

/** The header / burger-menu nav in one language. */
export const navLinks = (t: Dict, lang: Lang): readonly NavLink[] =>
  NAV_ITEMS.map((item) => ({ label: t.nav[item.key], href: hrefFor(item, lang), state: item.state, external: item.external }));

/** The same destinations in the footer column, where Documentation is shortened to "Doc". */
export const footerNavLinks = (t: Dict, lang: Lang): readonly NavLink[] =>
  NAV_ITEMS.map((item) => ({
    label: item.key === "documentation" ? t.nav.doc : t.nav[item.key],
    href: hrefFor(item, lang),
    state: item.state,
    external: item.external,
  }));

// Every page of the scene, in order (desktop SNAP_TIMES index = mobile stacked section index), and
// the hash the address bar shows while you are on it — written on EVERY page change (scroll, keys,
// nav), so a refresh or a shared link reopens exactly there (user 2026-11-06). The hero keeps a
// clean URL; index 9 is the footer page. The four header targets keep their nav hashes — these
// must match NAV_LINKS' `state`s above. Written with replaceState, so Back never steps through them.
export const SECTION_HASHES = [
  "", // 0 hero
  "#build", // 1 "You came here to build."
  "#features", // 2 "Your Stacks, in one place."
  "#the-machine", // 3 "Give every project its own space."
  "#pods", // 4 "Run each part independently."
  "#deploy", // 5 "Push your code."
  "#agents", // 6 "Give your agent a place to work"
  "#start", // 7 closing CTA "Give your next product a place"
  "#contact", // 8 the footer
] as const;
// (#pricing was page 7 until 2026-11-10; Pricing is its own route now, and an old /#pricing link
// is sent there by the shell's pre-paint script — app/_site/shell.tsx)
export const LEGACY_PRICING_HASH = "#pricing";

// hash → page, for every page that has one (deep links, refresh, a hand-typed hash)
export const STATE_BY_HASH: Readonly<Record<string, number>> = Object.fromEntries(
  SECTION_HASHES.flatMap((hash, i) => (hash ? [[hash, i] as const] : [])),
);

// The desktop scene saves the page it is on here (sessionStorage) so a reload reopens on it.
// layout.tsx's pre-paint script reads the same key to hide the stage until that restore lands.
// v2 since Pricing left the scene (2026-11-10): the page indexes after Agents shifted by one, so a
// session saved under the old key must not be restored onto the wrong page.
export const STATE_STORAGE_KEY = "usectl:state:v2";

export const NAV_STATE_BY_HASH: Readonly<Record<string, number>> = Object.fromEntries(
  NAV_ITEMS.flatMap((link) => (link.state === undefined ? [] : [[link.href, link.state] as const])),
);

// the mobile section that each state index owns an id for (inverse of the map above)
export const NAV_ID_BY_STATE: Readonly<Record<number, string>> = Object.fromEntries(
  NAV_ITEMS.flatMap((link) =>
    link.state === undefined ? [] : [[link.state, link.href.slice(1)] as const],
  ),
);
