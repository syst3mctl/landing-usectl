// The header / burger-menu links, shared by Header, MobileMenu, HeroSectionClient and HeroMobile
// so they can't drift apart.
//
// `state` is the index of the page the link lands on. The desktop pinned scene's pages
// (HeroSectionClient's SNAP_TIMES) and the mobile stacked sections run in the SAME order, so one
// number drives both: desktop glides the timeline to that state, mobile scrolls to the section
// carrying that id. `external` links leave the site instead (no state, opened in a new tab).
export type NavLink = { label: string; href: string; state?: number; external?: boolean };

// The off-site destinations, kept here so every button/link that points at them agrees.
export const DOCS_URL = "https://docs.usectl.com/#introduction";
export const SIGNUP_URL = "https://manager.usectl.com/login";
export const X_URL = "https://x.com/usectlcloud";
export const INSTAGRAM_URL = "https://www.instagram.com/usectl.dev/";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61596061747860";
// the company behind usectl — the "© 2026 SYSTEMCTL" credit in both footers and the burger menu
export const SYSTEMCTL_URL = "https://systemctl.sh";

// The App Store / Google Play badges are hidden until the apps are actually published — the markup
// stays in both footers behind this flag, so publishing is a one-line change back to `true`.
export const SHOW_STORE_BADGES = false;

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

export const NAV_LINKS: readonly NavLink[] = [
  { label: "The Machine", href: "#the-machine", state: 3 }, // "Give every project its own space"
  { label: "Agents", href: "#agents", state: 6 }, // "Give your agent a place to work"
  { label: "Features", href: "#features", state: 2 }, // "Your Stacks, in one place"
  { label: "Pricing", href: "#pricing", state: 7 }, // the calculator
  { label: "Documentation", href: DOCS_URL, external: true },
];

export const NAV_STATE_BY_HASH: Readonly<Record<string, number>> = Object.fromEntries(
  NAV_LINKS.flatMap((link) => (link.state === undefined ? [] : [[link.href, link.state] as const])),
);

// the mobile section that each state index owns an id for (inverse of the map above)
export const NAV_ID_BY_STATE: Readonly<Record<number, string>> = Object.fromEntries(
  NAV_LINKS.flatMap((link) =>
    link.state === undefined ? [] : [[link.state, link.href.slice(1)] as const],
  ),
);
