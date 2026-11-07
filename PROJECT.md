# usectl Landing — Project Log

Living project context. Read this first after `/clear` or in a new session — it has what `documentation.md` (the spec) doesn't: decisions already made, what's built, what's still open, and where the Figma data lives.

Repo: https://github.com/usectl/usectl — transferred to the `usectl` organisation on 2026-10-26
(the old `benqsj/usectl` URL still 301-redirects, but don't rely on it: the redirect dies the moment
anything re-creates that name). Active branch `master` (what the live site serves); `main` holds the
old full build.

## FULL RESET (2026-09-25)

Per explicit user instruction ("ყველაფერი გადაკეთდა — წაშალე ყველა section, დატოვე მხოლოდ header და background lines"), the entire page was stripped back to just the Header and the BackgroundLines. The design is being redone from scratch on this branch (`new-version`).

**Deleted** (all recoverable from git history / the `main` and `last-version` branches):
- Every section: Hero (incl. the three.js GLB server model), Infrastructure, Machine, PricingCalculator, Build — components, their animations (`src/animations/*`), and all their `src/lib/*` layout/steps/parts modules.
- `Footer.tsx`, `ScrollChurnGuard.tsx` (and both inline `<script>`s in `layout.tsx` that supported it — scroll-restore + hero intro), `GridCanvas.tsx`, `GridTrail.tsx`, `src/lib/gridEffect/` (the whole WebGL grid/marks/trail system), `src/app/lab/lines/`, `src/components/ui/*` (Button, BlurText, BlurChars), `src/hooks/useRasterizedSvg.ts`.
- Section asset dirs in `public/`: `herosection`, `infrastructur`, `footer`, `pricesection`, `serv-animation`, `server-animation`, `sources`, and the `demo-*.html` files. Kept: `background/`, `logo/`, `figma/`, `navigation-bar/` (new, user-supplied — future nav design reference, alongside `Group 1574.png` at repo root).
- `globals.css` rules for the deleted systems (`.scroll-restoring`, `[data-grid-canvas]`, `.hero-mask*`). The `--s` scale system itself is kept.

**What remains:**
- `src/app/layout.tsx` — fonts (Geist, Geist Mono, Space Grotesk), metadata skeleton (still `TODO:` copy), `<BackgroundLines /> + <Header /> + children`.
- `src/app/page.tsx` — an empty `<main className="flex flex-1 flex-col" />`.
- `src/components/layout/Header.tsx` — sticky, blur background, logo + centered nav, WITH its `ColumnLines` child (header-band grid lines drawn above the blur — removed in the first reset pass, restored same day on user report "header-ზეც ჰქონდა background line და მოშორდა").
- `src/components/layout/BackgroundLines.tsx` — the pre-reset committed CSS version, minus the deleted WebGL layers (`GridCanvas`/`GridTrail`/`cssLayer` tagging): grain SVG at `opacity-30` (the documented "white dots" fix), `ColumnLines` (numbered divs + hide-lists, NOT the old SVG-mask technique), one-row below-header band, then the full gradient grid, all `fixed inset-0`. The user had hand-placed the ancient mask-based 1px version before the reset; it was kept at first, but they then reported the white dots + washed-out lines that version reintroduced (grain at full opacity, 1px hairlines) — so the battle-tested committed version was restored instead (2026-09-25).
- `src/lib/grid.ts` — scale system (`s(px)` / `vw(px)`, `CANVAS_WIDTH_REF` 1920, `SCALE_FLOOR` 1280/1920, `INSET_VW`, `HEADER_HEIGHT_PX` 96) plus the grid geometry/hide-list constants ColumnLines needs (`COLUMN_PITCH` 82, `ROW_PITCH` 114, `LINE_THICKNESS_PX` 2, `LINE_ALPHA` 0.02, `NUM_COLUMNS` 22, `START_COLUMNS`/`MIDDLE_COLUMNS_*`/`HEADER_HIDE_*`). The numeric `gridMetrics()`/`columnCenterX()`-style helpers stayed deleted with the WebGL layer.
- `globals.css` — `--s` (registered `@property`, floor at 1280), theme tokens (`--background: #1e1d1d`, `--brand: #11a32a`), reduced-motion baseline.

**Deps note** (updated 2026-09-29): `three` / `@types/three` were removed in the cleanup below; `gsap` + `@gsap/react` are the animation stack.

Verified after the reset: `next build` clean, `eslint` clean, Playwright screenshot at 1920×1080 shows header + grid + grain rendering correctly, nothing else.

## Figma

- File key: `uv4OBAdNJBr7GbSovRhnkj` (file: "Usectil-Landing")
- Single fixed dark theme. Page background `#1e1d1d` (exact, user-given).
- Canvas reference size: 1920 wide. Content inset 99px at 1920 (`INSET_VW`), fluid via `--s`.
- Grid: column pitch 82px (Figma-confirmed), row pitch 114px, header height 96px.
- **Figma MCP is rate-limited** (View seat) — batch calls, don't re-fetch known nodes.
- Header logo node `26:186` (x=106 y=39, 150×24 — implemented at 130px-at-1920 offset, deliberate); nav `26:190` (Space Grotesk 16px, `rgba(255,255,255,0.8)`, 32px gaps); header has NO CTA / hamburger in Figma.

## Stack (installed)

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 · GSAP 3 + `@gsap/react` (currently unused) · three (currently unused).

## Conventions established

- Fluid scale: all design measurements via `s(px)` = `calc(var(--s) * px)` from `src/lib/grid.ts` — 1:1 at 1920, shrinks to a floor at 1280, grows above. Don't hardcode raw `vw` or fixed `max-w` containers.
- Server Components by default; `"use client"` only where GSAP/interactivity actually needs it.
- Verify CSS visually in a real browser (Playwright Chromium locally: `npx playwright screenshot --viewport-size=W,H <url> <out.png>`, or claude-in-chrome) — never trust "looks right in the HTML".
- Tailwind overlapping breakpoints (`md:` + `min-[Npx]:`) don't cascade by source order — make ranges exclusive (`md:max-[...]`).
- Any future `pin: true` ScrollTrigger inside this layout (`<main class="flex flex-1 flex-col">`) needs `pinSpacing: true` explicitly — flex parents silently disable auto pin-spacing.
- Update **this file** after any non-trivial change so a cleared session can resume without re-deriving context. The pre-reset log (every section's build history, bugs, and lessons) lives in git history of this file — `git log -p PROJECT.md` on `main` / commits before 2026-09-25.

## New hero, first draft from `public/section-hero/` (2026-09-25)

User supplied `public/section-hero/server.zip` (65 SVGs, extracted in place) and a design screenshot at a macOS `TemporaryItems` path that was **purged before it could be read** (second time this has happened — always copy such files to the scratchpad IMMEDIATELY on receipt). Figma MCP was also rate-limited again, so the composition could not be checked against anything. Built a best-guess draft instead, explicitly pending the real reference:

- Assets renamed (spaces/parens are URL-hostile): `cap.svg` (ex `Group 1670`, bright asterisk), `cap-2.svg` (1665 — unused), `body-1.svg` (1662, 371w — unused), `body-2.svg` (1666), `body-3.svg` (1669), `body-lit-1.svg` (1667 — unused), `body-lit-2.svg` (1668, the lit BASE layer), `part-mid-1/2.svg` (ex `Group 1 (8) 1/2`, 107×68 heatsink; -2 unused), `hatch.svg` (the green eyebrow hatch icon — restored from git `main:public/herosection/Subtract.svg`). `Group-1..45.svg` kept as-is: 45×29 flat chips (1-25), 46×30 (26-27), 17×22 cubes (28-41), 64×43 plates (42-45). `Line 91-95/99-103.svg` = page grid hairlines from the Figma export (unused — we draw our own grid).

**Rebuilt against the real reference the same day** — the user finally got the screenshot through (saved to Desktop as `new.png`, copied to scratchpad/design-ref.png; the earlier draft's guessed composition was completely wrong). Learned the hard way (3 failed attempts): a dragged-in macOS screenshot path under `.../T/TemporaryItems/NSIRD_screencaptureui_*/` is deleted within seconds AND that directory can't be listed from here (`Operation not permitted` — only exact-path reads work) — a background watcher polling it catches nothing. **The reliable flow: user takes the screenshot, does NOT touch the floating thumbnail, waits ~5s → file lands on Desktop → read it from there.**

- Layout (all design px at 1920 via `s()`, measured from the 1600-wide reference ×1.2, verified by rendering OUR page at 1600 and pixel-scanning both PNGs with the same canvas script until rows/extents matched ±2px): text column absolute at left 187 / top 216; eyebrow = hatch.svg (w 36) + 17px `font-light white/60`; H1 "Build your product. We'll handle the infrastructure." `s(64)`/LH 1.26/`font-medium`/`tracking-[-0.02em]`, wraps after "the"; paragraph `s(21.3)`/LH 1.3/`font-light white/65`/max-w 950, wraps after "usectl"; two OUTLINE pill buttons (NO filled button — "Start Building" `font-semibold`, "See how it works ↗" `font-normal`), h 48, border-white/25, gap 30, margin-top 34.
- Exploded server, REWORKED same day against a close-up reference (`Desktop/new-version/` screenshot → scratchpad/server-ref.png, 625×899, scale 1.33 = 496px cap / 373 native) after the user reported the SVGs "sitting badly": absolute at left 1360 / top 79, 4 layers in DOM order cap → body-2 → body-3 → body-lit-2 with wrapper tops **0/213/334/362** — derived by center-column pixel-scans of the reference (each layer's slab-vertex line) cross-checked against each SVG's own internal feature profile (body SVGs: vertex at internal y0, inset outline y9-10, face-bottom/slot lines y199-213, silver band [lit] / ghost y212-250). DOM order matters: lower layers paint later and occlude the ones above. **Key discovery that unlocked the layout**: the BASE sits only 28 design px below L3's top — its opaque top face deliberately covers L3's lower half (L3 shows only a ~28px strip + its left/right wings), and the pieces that VISUALLY read as "on L3's face" in the lower region are actually attached to the BASE's face (first attempt attached them to L3 and the base then painted over them — invisible). The base's position is pinned unambiguously by its bright silver band: band at panel 634-672 = internal 212-250 → base img top 422 panel → wrapper top 362. Pieces (all positions read off a coordinate-grid overlay on the reference, panel px = design px): L2 = 2 chips + 2 stacked long plates (G-42/43) + 4-cube cluster; L3 = 2 chips + part-mid-1 heatsink; base = 2 more chips + 3-cube cluster (the ex-"L3" pieces) + 4-chip left row + 5-chip right row. No free-floating pieces (the earlier `FLOATING` cluster was a misread — removed). Two green corner ticks (`bg-brand` divs, 35×2 and 13×2) at the grid intersection near the section's bottom-left (column 1 × row 8, local y 912/928).
- **The whole per-layer assembly was then RETIRED the same day**: the user supplied `public/section-hero/new-server.svg` (421×687) — the complete exploded server (all layers, chips, cubes, plates baked in) as one SVG — and asked for it to replace the assembled stack. `HeroSection.tsx` now renders just that one `<Image>` at left 1336 / top 43 (centered on where the old stack's center sat). All the `LAYERS`/`pieces`/`CHIP`/`CUBE`/`PLATE` code is gone (git history has it); the individual cap/body/Group-N SVGs remain in `public/section-hero/` unused — likely useful later if a scroll-driven per-layer animation is built (the measured layer tops 0/213/334/362 and the piece catalog live in this entry and git history).
- **Vertical ruler bar added left of the text (2026-09-25, same day)**: user asked for "the SVG in /section-bar/" — that folder doesn't exist (third occurrence of a described-but-not-uploaded asset); the matching asset is `public/navigation-bar/navigation-bar.png` (35×913, transparent — a vertical ruler with green ticks at its top, gray hairline ticks below), placed at left 99 (content column 1) / top 0, so its 913px length ends exactly at grid row 8 (y 912) where the green corner ticks sit — they read as the ruler's terminus. **Real bug found**: rendered through next/image's optimizer (`w=48&q=75`) the ruler was COMPLETELY invisible — the resample+recompress wipes out 1px low-opacity hairlines. Fixed with `unoptimized` on that `<Image>`. Applies generally: any asset whose content is hairline-thin/low-opacity ticks or grid lines must skip the image optimizer.
- **Comparison technique that worked** (for future pixel-matching): render our page at 1920, screenshot; scale the reference so cap widths match; place both in an HTML with offsets that align the cap vertex; then (a) scan both panels' stack-center column for bright-line runs with the SAME detector and diff the run positions, and (b) overlay mine inverted at 55% opacity over the reference (`filter: invert(1)` + contrast boost) — misplacements show as doubled ghosts instantly. Naked-eye side-by-side comparison of the two panels is UNRELIABLE here (the Figma-exported reference renders the same SVGs with visibly brighter outlines than a real browser on the page's own bg, which reads as position differences that don't exist).
- Verified: text rows/extents pixel-matched to the reference at the same 1600 render width (eyebrow/H1 line 1+2/paragraph both lines/button text all within 2px), server stack bounds matched (capTop 128=128, right edge 1441=1441, bottom 614 vs 620), final side-by-side eyeball check. `tsc`/`eslint`/`next build` clean.
- Still eyeballed, not measured: exact chip/cube/plate micro-positions on each layer's face (close but not pixel-derived), the L2↔L3 intermediate gap split. The reference's own background grid pitch differs slightly from ours — ours kept as-is deliberately.

## Google Analytics now lives in the repo, so a deploy can't lose it (2026-10-21)

User report: "google ანალიტიკა და მეტა მონაცემები დაიკარგა". Investigated before touching anything:

- **The metadata was never lost.** `curl https://usectl.com/` returns the full set — title, description,
  keywords, canonical, robots/googlebot, the whole OG + Twitter block, both 1200×630 images and the
  JSON-LD `@graph`. It all comes from `src/lib/seo.ts` + `layout.tsx` (commit `820bb98`), i.e. from
  the repo, which is exactly why it survives every deploy.
- **GA had never existed in the codebase.** `git grep` for `gtag|googletagmanager|@next/third-parties|
  GTM-|plausible|umami` across ALL six branches (`master`, `main`, `new-version`, `last-version`,
  `v1-version`, `responsive`) → nothing, and the live HTML carried no analytics beacon of any kind
  (no Cloudflare/Zaraz either; the site is served through Cloudflare, `x-powered-by: Next.js`).
  So nothing "stored" it: a tag pasted into a built page or a host dashboard is wiped by the next
  deploy. That was the answer to the user's actual question.
- **Fix** — GA4 through Next 16's own integration (`@next/third-parties@^16`, installed; read
  `node_modules/next/dist/docs/01-app/02-guides/third-party-libraries.md` first): `layout.tsx`
  renders `{GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}` as the last child of `<html>` (after
  `<body>`, per the guide — `next/script` afterInteractive, so gtag can't delay the hero's LCP).
  The ID comes from **`NEXT_PUBLIC_GA_ID`**, never from a literal, and must be set in the host's env
  for production AND preview. Pageviews need no code: GA4 Enhanced Measurement → "Page changes based
  on browser history events" covers client-side navigation.
- **Search Console**: `metadata.verification.google` is wired to `GOOGLE_SITE_VERIFICATION` (spread
  in only when set), so the HTML-tag verification can't be lost either. The live site had no
  verification meta at all — if ownership was ever proven that way, it needs re-adding (DNS-TXT
  verification would be unaffected). Both vars documented at the top of `.env.example`.
- Unset ⇒ **zero** output: a build with no vars emits 0 `googletagmanager` references and no
  verification meta, so dev machines and the current deploy behave exactly as before.
- Verified on `next start` + real Chromium (Playwright, installed into the scratchpad — the repo has
  no playwright dep): with `NEXT_PUBLIC_GA_ID=G-TEST123456` the page requests
  `googletagmanager.com/gtag/js?id=G-TEST123456` AND fires a real `page_view` to
  `google-analytics.com/g/collect` (`en=page_view`, correct `dt` title), `window.gtag` is a function,
  `dataLayer` has 4 entries, zero page errors; the `google-site-verification` meta renders. Rebuilt
  without the vars afterwards and re-checked the clean case. `tsc`/`eslint`/`next build` clean.
- **Still to do by hand (not code)**: create/locate the GA4 property → Data streams → copy
  `G-XXXXXXXXXX` into the host env and redeploy; then Search Console → add property → submit
  `https://usectl.com/sitemap.xml`. If GA is ever moved behind a cookie banner, the component is the
  single place to gate.

## SEO copy + link-preview card (2026-10-21)

The brand is written **UseCTL** in all copy (user's call: "UseCTL ესე უფრო ლამაზია"); the logo wordmark and the domain stay `usectl`.

- **`src/lib/seo.ts`** is the single source for every search/share string: `SITE_TITLE` (53 chars), `SITE_DESCRIPTION` (148 — Google cuts ~155), `SHARE_DESCRIPTION` (the shorter line link cards show), `SITE_KEYWORDS`, `SHARE_IMAGE_ALT`, `STARTING_PRICE_USD`. Change copy there, nowhere else.
- **`layout.tsx`** metadata rebuilt on it (the `TODO: Product description` is gone): title, description, keywords, canonical, robots/googleBot (`max-image-preview: large`), OG (`locale en_US`) and Twitter (`summary_large_image`, `@usectlcloud`), plus `viewport.themeColor` #1e1d1d. A JSON-LD `@graph` (Organization + WebSite + SoftwareApplication with a $15 USD offer → SIGNUP_URL) is rendered as a `<script type="application/ld+json">` with `<` escaped, per the Next 16 JSON-LD guide.
- **Link preview** = `src/app/opengraph-image.tsx` + `twitter-image.tsx`, both rendering `src/app/_og/card.tsx` (next/og → static 1200×630 PNG at build time; Next adds og:image/twitter:image with width/height/alt itself — don't also list images in `metadata`). The card is the hero in miniature: page grid, logo.svg, hatch eyebrow, H1, a one-line pitch, "From $15 / month" pill + usectl.com, new-server.svg on the right over a mint/green scene light. `_og` is a private folder (no route). Satori rules: every multi-child div needs `display:flex`, no CSS vars, plain `<img>` (eslint rule disabled in that file), fonts must be woff/ttf — hence `_og/SpaceGrotesk-{Light,Medium}.woff` from @fontsource (OFL).
- **`robots.ts`** (allow all, disallow `/api/`, points at the sitemap) and **`sitemap.ts`** (the one page).
- Verified on `next start`: every tag present in the HTML, `/opengraph-image` and `/twitter-image` serve 200 image/png 1200×630, `/robots.txt` + `/sitemap.xml` correct. `tsc`/`eslint`/`next build` clean (build run with the next/font/local swap — Google Fonts is unreachable from the cloud sandbox; not committed).
- **After deploy**: messaging apps cache previews — test with the Facebook Sharing Debugger / LinkedIn Post Inspector / opengraph.xyz, and re-scrape there if an old preview sticks. Submit `https://usectl.com/sitemap.xml` in Google Search Console.

## External destinations wired up: Documentation + Start Building (2026-10-13)

The two off-site URLs live in `src/lib/nav.ts` as `DOCS_URL` (`https://docs.usectl.com/#introduction`) and `SIGNUP_URL` (`https://manager.usectl.com/login`) so nothing can drift.

- **Documentation** is no longer the inert `#documentation` hash: `NavLink` gained `external?: boolean`, and the link renders with `target="_blank" rel="noopener noreferrer"` in the Header, the burger menu, and both footers' "Doc" row (the two footers keep their own local link arrays — they are now typed `readonly NavLink[]`; `as const` would make `link.external` a type error on the members that lack it). The desktop `onNavClick` capture handler needs no change: the href doesn't start with `#` and the origin differs, so it falls through to the browser.
- **Start Building** (hero state 1, state 9, HeroMobile, burger menu) points at `SIGNUP_URL` in the SAME tab — per the request's wording ("ახალ გვერდზე"), in contrast to Documentation's explicit "new blank tab".
- **Deliberately untouched**: the "Start now from $15 / month" pricing CTA (desktop state 8 + HeroMobile) still points at `#start`, and so does "See how it works" (`#how`) — neither was in the request.
- Verified in Chromium against the dev server: the Documentation click opens a second tab on the docs URL with the landing page left where it was; a Start Building click lands on the real manager login; the four hash nav items still jump exactly (11439 / 3859 / 10168 / 2088) with zero page errors. `tsc` / `eslint` / `next build` clean.

## The header now sits on the same canvas the scene is drawn at (2026-10-21)

User, on a big display: "section შუაში ზის მაგრამ header-ში ნავიგაცია გვერდზეა გასული". Cause: pass
64's `fitStage()` shrinks the s(980) stage about its **top centre** whenever the viewport below the
header is shorter than the design canvas — which also re-centres the scene horizontally — but the
header is NOT inside the stage, so it stayed on the full `--s`. Measured at 3440×1440: the hero text
column started at x 660 while the logo sat at 233, and the nav was a fixed 16px against 114px
headings.

- **New `--sh` in globals.css** = the scale the scene is REALLY drawn at:
  `max(0.53333px, min(var(--s), calc((100svh - 96px) / 980)))` — i.e. `--s × fit`, mirroring
  fitStage() (keep the two in step), plus `--s`'s own 1024/1920 floor so an absurdly short window
  can't narrow the row until the logo runs into the centred nav. Registered with `@property` for
  the same reason `--s` is (a JS read resolves to a length, not the raw `min(...)` string).
- **`.header-row` / `.header-logo` / `.header-nav` (globals.css, ≥1024)** replace the row's inline
  `paddingLeft: s(130)` / `paddingRight: INSET_VW` and the `lg:w-[150px]` / `text-base` utilities:
  the row is `width: min(100%, sh × 1920)` centred with `margin-inline: auto` and padded 130/99 in
  `--sh`, the logo is `max(150px, sh × 150)`, and ≥1280 the nav is `max(16px, sh × 16)` with a
  matching gap. The floors mean **nothing below 1920 with a normal height changes** (there `--sh ==
  --s`), while a big canvas scales the header up with everything else. These rules are unlayered on
  purpose — Tailwind utilities live in `@layer utilities`, so plain CSS outranks them; that's also
  why the competing utilities had to go from the JSX.
  - The 1024–1279 `.header-cols` mask moved to `--sh` too, so the hole it punches still lands on
    the logo when the row is scaled.
  - Still on `--s` deliberately: the background grid and the header's own ColumnLines — pass 64's
    documented trade-off (a short screen's grid doesn't follow the scaled stage).
- Verified at nine viewports: the logo lands exactly 57 design px left of the text column
  (`logo.left == h1.left − 57 × sh`, Δ ≤ 0.1px) at 3440×1440, 2560×1440, 2560×1080, 1920×1080,
  1920×800, 1600×900, 1440×900, 1280×620, 1024×768; the nav stays on the viewport centre; nav font
  22px at 3440 and unchanged 16/15px below 1920; no horizontal overflow anywhere; header crops at
  1024–1280 show no line crossing the logo or nav. The scene itself is untouched: synthetic wheel
  swipes still step 999 → 2088 → 3815 and back at both 1920 and 2560, a Pricing nav click still
  lands on 11439, zero page errors. `tsc`/`eslint`/`next build` clean.

## The footer Subscribe box actually sends (2026-10-21)

The email field was decorative (no form, no handler). Now: type an address → a send icon fades in
once it looks complete → the icon OR Enter posts it to our inbox.

- **`src/components/layout/SubscribeForm.tsx`** (client) replaces the inline input + checkbox in
  BOTH footers — one component, `variant="desktop" | "mobile"` only picks the scale variable
  (`--s` via `s()` or `--m`), so the two can't drift. The send button is `absolute` inside the
  field, hidden (`opacity-0`, `pointer-events-none`, `tabIndex -1`) until the address matches a
  loose `EMAIL_RE`, and the input's right padding grows with it so text never slides under it. It
  IS the form's submit button, so Enter and the click are the same path (the form `preventDefault`s
  — the old comment about "no form so Enter can't reload" is satisfied that way now). A spinner
  replaces the arrow while in flight; on success the field locks and a brand-green line appears;
  errors render in `#ff8e8e` and clear as soon as the user types again. The consent checkbox is
  the design's own shape as before, now controlled — and **required**: with it unticked the icon
  still appears but renders dim (`border-white/10`, `text-white/25`, `cursor-not-allowed`) and a
  click or Enter only produces "Please accept the terms and conditions first." — nothing leaves the
  browser. Ticking the box clears that hint and lights the icon. The button is deliberately NOT
  `disabled`/`aria-disabled`: a disabled control fires no click event, so the hint could never
  appear (and Playwright refuses to click it, which is how that was caught). The server refuses
  `consent !== true` with 400 `consent-required` as the backstop for anything posting directly.
  - Layout trap: putting the 232px width on the `<form>` wrapped the "I agree to the terms and
    conditions." label onto two lines — the width belongs on the input's wrapper, and the desktop
    label is `whiteSpace: nowrap`.
  - The phone field keeps `fontSize: 16` (anything smaller makes iOS Safari zoom on focus).
- **`src/app/api/subscribe/route.ts`** — validates, rate-limits, then forwards. Delivery is chosen
  from env so no key is in the repo: `WEB3FORMS_ACCESS_KEY` (simplest — web3forms.com mails the
  submission to whatever address the key was made for, no domain verification) or `RESEND_API_KEY`
  + `SUBSCRIBE_TO`/`SUBSCRIBE_FROM`. **With neither set the route still returns 200 and logs the
  address to the server console**, which is how the UI was tested. `.env.example` documents both
  (and `.gitignore` got a `!.env.example` exception — `.env*` had covered it).
- **"Don't send it 100 times"** — five layers, the real ones server-side: per-IP max 3 accepted
  submissions/hour (429 after), per-email dedupe for 24h (answers 200 `duplicate: true`, mails
  nothing), and a honeypot `company` field (filled ⇒ 200 `dropped: true`, nothing sent). Client
  side: the button is dead while a request is in flight, and a localStorage ledger
  (`usectl:subscribe:v1`) blocks a repeat of the same address for 24h **without touching the
  network** plus a 60s cooldown between sends, so reloading isn't a way around it. The server maps
  are per instance and reset on redeploy (per-lambda on serverless) — fine here; a shared store
  (KV/Redis) is the upgrade if it ever needs to be exact.
- Verified on `next start` at 1920×1080 and 390×844: icon hidden at "ben", visible at a full
  address, Enter sends, the success line appears, a reload + same address shows "already on the
  list" with **zero** network calls, and curl drove the server limits (4th send → 429, bad address
  → 400, honeypot → dropped, console shows the would-be mail). Zero page errors; `tsc`/`eslint`/
  `next build` clean.

## Footer: X links to the real account, store badges hidden until launch (2026-10-21)

- `src/lib/nav.ts` gained `X_URL` (`https://x.com/usectlcloud`) — the footer X icon in BOTH footers (`Footer.tsx`, `FooterMobile.tsx`) was a dead `href="#"`; it now opens the account in a NEW tab (`target="_blank" rel="noopener noreferrer"`, same treatment Documentation gets).
- `SHOW_STORE_BADGES = false` in the same file hides the App Store + Google Play badges in both footers until the apps are actually published (user: "დროებით გააქრო … სანამ publish გვექნება"). The markup stays in place behind the flag — flipping it back to `true` restores both badge rows, and that is the only place to change. Their hrefs were never wired to anything, deliberately.
- Verified on `next start` at 1920×1080 and 390×844: both footers render with zero badge elements, both X icons resolve to `https://x.com/usectlcloud`, the brand column/layout reads fine without the badge row. `tsc`/`eslint`/`next build` clean.

## Every CTA now lands on the manager, and the tab shows the brand mark (2026-10-19)

- **The two remaining dead hashes are gone**: "See how it works" (`#how` — desktop state 1 + state 9, HeroMobile, burger menu) and the pricing CTA "Start now from $15 / month" (`#start` — desktop state 8 + HeroMobile) both point at `SIGNUP_URL`, same tab, exactly like Start Building (user: "see how it works, start now from აქედანაც რო გადადიოდეს იქ"). `src/` now contains ZERO `#how`/`#start` references, and the production HTML has 10 `manager.usectl.com/login` hrefs. The desktop capture-phase `onNavClick` needs no change — the hrefs no longer start with `#`, so they fall through to the browser (same path Documentation already took).
- **Favicon**: the repo still shipped Create Next App's default `src/app/favicon.ico` (md5 c30c7d42…, untouched since the initial commit). Replaced by the usectl asterisk:
  - `src/app/icon.svg` — the four asterisk bar paths copied VERBATIM from `public/logo/logo.svg` (its paths 7-10, bbox x 28.34-48.03 / y 0-24.28) inside a 32×32 box via `translate(-24.89 3) scale(1.0708)`. The wordmark is deliberately NOT in the icon — at 16px it's unreadable.
  - `src/app/favicon.ico` — regenerated (16/32/48 PNG-in-ICO) by a throwaway Python script that rasterises the SAME mark as 4 round-capped segments (half-width 0.82 in logo units: the vertical bar, the two diagonals, the horizontal bar), 4×4 supersampled, `#11A32A` on transparent. No image library was needed; if it ever has to be redone, the segment endpoints are the midpoints of each path's two cap arcs.
  - Next emits both `<link rel="icon">` tags; `/favicon.ico` and `/icon.svg` both serve 200 with the right content types.
- **`metadataBase` typo fixed**: `siteUrl` was `https://usectlcom` (missing dot) — every canonical/OG URL was built on it. Now `https://usectl.com`. The `TODO: Product description` metadata copy is still open.

## Polish pass 64: short-screen fit, the ruler lands on its ticks, two copy nudges (2026-10-20)

Four asks in one round, all in the desktop pinned scene (`HeroSectionClient.tsx`).

**1. Hero eyebrow ↔ H1.** The H1 carried `marginTop: s(-10)` — the only negative one on the page — so "Managed Kubernetes & AI Agent Infrastructure" sat almost glued to it. Now `s(10)`, the value every other state's heading uses (measured gap at 1920: 10px).

**2. State-3 right panel up 25.** New `PANEL3_DY = -25` folded into the gradient line's top, the "USECTL MANAGED INFRASTRUCTURE" title and all three `PANEL_ITEMS` y's, so the block moves as one piece.

**2b. The panels' vertical rule (states 3 AND 4) is the team's accent gradient, 6px wide** (follow-up the same day): `PANEL_LINE_W = 6` + `PANEL_LINE_GRADIENT` (`#11A32A 0% → #8FC6FF 32.9% → #8FEDF7 66.7% → #11A32A 100%`) replace the old 3px `#11a32a → #3b82f6` ramp in both panels. The stop positions are copied from the state-6 deploy cards' accent bar (border-form.svg's own export), which already used exactly these four colours — so the page has ONE accent gradient, not two near-identical ones. `HeroMobile`'s shared `Panel` got the same gradient at `m(4)` (the phone's proportion of 6px). Measured in the browser: both rules render 6.00px wide with all four stops; the items were deliberately NOT shifted, so the gap between rule and text is 18 instead of 21.

**3. Short viewports no longer clip states 6 and 7** ("height როცა პატარა აქვს, არ ჩანს, დაბლა ჩაცდენილია"). The stage is the s(980) design canvas vertically centred inside `calc(100svh - 96px)`; when the viewport is shorter than that (a small window, 1920×800, a laptop with devtools open) the bottom simply fell outside the section's `overflow-hidden` — and states 6/7 are the ones whose artwork reaches y≈950. New `fitStage()` scales the WHOLE stage to fit instead, about its top centre:
```
const avail = Math.min(section.clientHeight, window.innerHeight - HEADER_HEIGHT_PX);
stage.style.transform = `scale(${avail / (980 * readScale())})`;   // only when < 1
```
Everything inside the stage is written in s()-units and GSAP's px offsets come from the same `--s`, so one uniform factor shrinks the composition without changing it; the pin, the wheel driver and the timeline are untouched. It runs on mount, on `resize`/`orientationchange` and inside ScrollTrigger's `refresh` handler (the reduced-motion branch now returns a cleanup so those listeners can't leak). Trade-off, accepted: on a short screen the scaled stage no longer lines up with the page's background grid (the grid keeps the width-driven `--s`) — the alternative, shrinking `--s` itself, would drag the grid and the header along and leave the whole page hugging the left edge on wide-but-short screens. Measured at 1920×800 / 1440×700 / 1280×620: scale 0.72 / 0.82 / 0.80, stage bottom == viewport bottom, states 6 and 7 fully on screen, zero page errors.

**4. The ruler now lands EXACTLY on a long tick at every state** ("ყოველი 5 პატარა ხაზის შემდეგ ერთი დიდი ხაზი მოდის, ეგ ერთი დიდი ხაზი შეივსოს, არც გადაცდეს არც დააკლდეს"). `navigation-bar.png` decoded row by row (35×913): the long ticks are the 26px-wide rows at y 91-92 / 182-183 / 273-274 / 364-365 / 456 / 547-548 / 638-639 / 729-730 / 820-821 — exactly five 15px-wide short ticks between each pair, i.e. one long tick every ~10% of the bar. The old single linear `clipPath` tween over `totalDuration()` parked wherever a state's snap time happened to fall, because the crossings are NOT equally long in timeline units. Replaced by a proxy tween (same position/duration) whose `onUpdate` maps the playhead through `rulerFraction()`: piecewise-linear between `SNAP_TIMES`, with `RULER_TICKS` (each long tick's BOTTOM edge, so the whole tick ends up green) as the per-state targets, plus a 2% snap at each crossing's ends because a settled flight can park ~1% of a crossing off its snap time. Verified by pixel-scanning a crop of the bar at all nine states: the lowest green row is the bottom row of long tick N at state N+1, every time.
  - **Open choice**: nine states = eight crossings, so the hero starts empty and state 9 finishes on the 8th long tick (80%) — the 9th tick and the bottom cap stay grey. If it should instead FINISH on the last long tick, shift `RULER_TICKS` by one (`[93, 184, …, 822]`) and the hero starts with one tick already green.
  - The proxy tween is added after the dead-zone index is built (the same reason the old one was added last), so `contentSpans` still sees only real content tweens.

Verified on `next start`: all eight crossings down and back up land on every state (1000 / 2089 / 3843 / 5402 / 7978 / 10168 / 11439 / 12801), the footer hop still works, a resize mid-journey re-fits without moving the state, a nav jump still lands exactly. `tsc` / `eslint` / `next build` clean.

## Polish pass 63: the state-6 ring followed you to the hero (2026-10-07)

User: "section-6 ზე server svg ზე არის პატარა წრე სადანაც ანიმაცია მოდის ჟანგბადივით, ეს წრე რჩება როცა usectl ლოგოს ვაჭერ და საიტი section-hero ზე მიდის". Reproduced at 1920×1080: after a logo jump from the footer a 16px green ring sat at (1083, 623) design px over the hero.

Cause: **rewinding a GSAP timeline re-applies its FROM values, and `node6`'s "from" is `autoAlpha: NODE6_DIM` — i.e. VISIBLE.** `jumpToState` parked `seq6` (`seq6.pause(0)` + `reset6()`) AFTER `tl.time(enter, true)`, so the seek correctly hid the ring and `seq6`'s rewind then put it straight back at 30%. The ring lives inside `pipe6Wrap`, which the main tl only fades from 9.0 on, so nothing downstream hid it again — it rode all the way to state 1.

Fix: `seq6.pause(0); reset6();` now run BEFORE the seek, so the main timeline's own `node6`/`pushLine6` tweens have the last word. (The state-7 resets stay after the seek — pass 62's reasoning is unchanged; `resetPower7`'s values ARE the off state, so they don't fight the seek.)

General rule: anything parked by hand in `jumpToState` must run before `tl.time()` unless its reset values are the state the destination page actually needs.

Verified (synthetic wheel suite + nav clicks): ring hidden on the hero after a logo jump and on all four nav targets, still ignites normally when scrolling into state 6 — including straight after a jump home (terminal typed, glow + bubbles, cards wired). `tsc`/`eslint` clean.

## Polish pass 62: two jump bugs — the state-7 power-down flash and the dead server (2026-10-02)

Both reported together ("footer-ში ვარ, ვაჭერ logo-ს… section-7 lines ანიმაცია ჩანს წამიერად, როგორ კარგავს სიმწვანეს… ხან კიდე საერთოდ იკარგება და არაფერს გამოიტანს, ილეწება"), both caused by cutting something short:

1. **The state-7 power-down played on top of the hero.** `jumpToState` seeked with events ON, so a jump from the footer crossed state 7's gate BACKWARDS and fired its `onReverseComplete` → `unwindPower7()`, a REAL-TIME timeline that un-greens the connector lines. The connector layer is only faded from state 8 on, so it ran in full view on state 1. The seek is now `tl.time(enter, true)` (suppressed) and the out-of-timeline sequences are put back by hand instead: `unwind7` killed, `seq7`/`seq6` reset, `resetPower7()`. Every nav target enters BELOW its gate, so the forward entrance tween re-fires whatever that page needs. Measured: 6 drawn green paths at +250ms before, 0 after.

2. **Killing the server load-in left the artwork invisible.** `playServerIntro` animates per-element `translate`/`opacity`, and those same elements ARE states 2-3's stack. Killing the timeline mid-flight (any jump does) froze them — jumping away during the intro left all 170 svg children at opacity 0, i.e. a blank page. New `killServerIntro()` kills AND `clearProps: "translate,opacity"`. Verified against the clean path: both now land on exactly 146 hidden / 76 translated on Features (before: 170 hidden).

Note for future debugging: the dev server's HMR had again accumulated duplicate handlers, which showed as "the hero text doesn't replay" (opacity already 1) and extra states per flick. Everything in this pass was confirmed on `next start` — on production the hero's blur-in reads 0.37 opacity mid-flight, exactly as intended.

## Polish pass 61: nav/logo land with the page's own entrance; the state-7 green speck (2026-10-01)

**1. A nav jump now PLAYS the page in.** Pass 60 seeked straight to the snap, so the target arrived with its artwork already finished ("the machine… svg უკვე ანიმირებულია, დასრულებული ანიმაციით შემოდის"). `jumpToState` now seeks to a new `ENTER_TIMES[i]` — the position where that page's OWN entrance begins, after the previous page's exits (0.05 / 1.28 / 2.6 / 4.8 / 6.45 / 9.05 / 11.75 / 13.2) — and tweens from there to the snap at the pace a scrolled crossing would give it (`CROSSING_SECONDS[i-1] × span / full`, so the Machine unfolds over ~2.8s). Verified frame by frame: the platforms arrive collapsed and open up.

**2. The logo brings the hero back the same way.** It is a plain `/` link, so the click handler now also catches "same path, no hash" and calls `jumpToState(0)`. State 1's load-in never lived on the timeline, so it was refactored into `playHeroText()` / `playServerIntro()` — called once on mount, replayed on the jump. Verified: the copy blur-rises word by word and the server re-assembles.

**3. The green speck that followed you around.** `resetPower7` hid the state-7 charge paths with `stroke-dasharray: L L` + `stroke-dashoffset: L`, which puts the on→off boundary exactly on the path's first point — and those strokes have ROUND caps, so Chrome painted that zero-length dash as a DOT. The squiggle's dot stayed visible on every other page (the connector layer is only faded out from state 8 on). New `lineHide7() = lineLen7() + 1` moves the boundary into the gap; used in `resetPower7` and in every `fromTo`/unwind "from" value so a reverse can't restore it either.

**4. `transitionFrom` after a jump is the page you LANDED on**, not the one you left — otherwise an up-push during the entrance read as "turn around" and went back (a flick after navigating out of the footer dived straight back into it). The lock is 350ms, just long enough to swallow the click's own momentum; a wheel push after that interrupts the entrance normally, since `tweenTo` retargets from the live playhead.

**Testing note worth keeping**: the dev server's HMR had accumulated duplicate wheel handlers by this point, and the gesture suite started reporting one extra state per flick. Against `next start` on a fresh port every case is exact — when the driver suddenly "counts double", test the PRODUCTION build before believing it.

## Polish pass 60: nav lands DIRECTLY on its page (2026-09-30)

Clicking a nav item used to run `goToState`, which tweens the timeline — so the whole journey between the two pages played at speed ("ყველა გვერდი კი არ ჩაიაროს, არამედ პირდაპირ ის გვერდი გამოიტანოს… ოღონდ მხოლოდ მაშინ, როცა ნავიგაციიდან დააჭერ"). A new `jumpToState` is used by the header navigation ONLY — every scroll gesture still glides through its crossing exactly as before.

- It **seeks** (`tl.time(SNAP_TIMES[i])`) instead of tweening, kills any in-flight scroll/timeline tween, sets the scroll directly, and fades the stage back in over 0.3s so the cut doesn't pop. Measured: a click lands in ~230ms.
- Events are deliberately NOT suppressed on the seek, so the gates that live on the timeline (state-6/7 terminal typing, the state-7 ignition) still fire for the page being landed on — verified: jumping straight to Agents arrives with the terminal fully typed (43/39/45 chars) and the board lit.
- It reuses the same state-7 housekeeping as a glide (arrive with the board OFF, resume a running unwind) so a jump over the gate can't leave it half-lit.
- `transitioning` is held for 200ms and released through the `flightId` token, so the wheel driver can't act on the jump's own scroll.

Verified: seven nav clicks in both directions all land exactly (11439 / 2089 / 10168 / 3859 …) with zero half-blurred words at every landing, navigating out of the footer works, and a wheel flick straight after a jump continues from the new page. The eight-case gesture suite is unchanged.

## Polish pass 59: header nav actually navigates, brand hover, blur deadline (2026-09-30)

**1. The nav works.** `src/lib/nav.ts` is now the single source for the links and, for each one, the PAGE it lands on — `state` is an index into both the desktop pinned scene's `SNAP_TIMES` and the mobile stacked sections, which run in the same order: The Machine → 3, Agents → 6, Features → 2, Pricing → 7. Documentation deliberately has no target yet.
- Desktop: `HeroSectionClient` maps the hash to a state and glides there. The listener is on `document` in the **CAPTURE** phase — next/link's own handler runs first otherwise and calls `preventDefault`, and a `defaultPrevented` guard silently skipped every nav click (the hash changed, the page didn't move — that cost one debugging round). The hash is written with `replaceState` so the back button isn't filled with in-page steps, and a deep link (`/#pricing`) opens straight on that page by feeding the restore block.
- Mobile: the four matching `<section>`s got those ids + `scroll-mt-[calc(var(--header-h)+16px)]`, so the burger menu's links are plain native hash scrolls that clear the sticky header. Verified: the pricing section lands at y=80 under the 64px header.

**2. Header hover is the brand green** with a rule that sweeps in from the left under the label (`group` + `origin-left scale-x-0 → 100`, 300ms) instead of the old plain white.

**3. Long paragraphs no longer freeze half-blurred.** A column's blur stagger could run PAST its state's snap time, and since the playhead parks exactly there, the tail words stayed at `blur(12px)` forever — state 3's window is only ~0.5 units wide for a ~30-word paragraph ("section-3-ში ტექსტი ბოლომდე სუფთად არ გამოდის"). `blurTextIn`/`blurField` now take an `endBy` deadline (each call site passes its snap time minus a hair) and compress the stagger — and, if that still doesn't fit, the per-word duration — so the last word always lands first. Verified by sweeping all eight states and asserting every VISIBLE `[data-blur-word]` is at opacity 1 / blur ≤ 0.3px (`checkVisibility` is essential: hidden states' words sit in the viewport box too and made the first run report false positives everywhere).

Note: the deadline changed the timeline's total slightly again — the snaps are now 1000/2089/3859/5399/7982/10168/11439/12801.

## Polish pass 58: pricing +/− hover colour + press ripple; pointer cursor on every button (2026-09-29)

- **Cursor**: Tailwind v4's preflight leaves `<button>` with the arrow cursor. `globals.css` now has an `@layer base` rule:
  - `pointer` on enabled buttons, `[role=button]`, `summary`, and checkbox labels;
  - `not-allowed` on disabled buttons.
- **Pricing +/− hover** (`STEP_BTN_CLASS`): the border goes #35c957 and the glyph #7cf09a, with a faint green wash (rgba(17,163,42,0.1)) and a soft 12px green glow. This is the scene light's green family. Disabled buttons keep their dimmed look.
- **Press feedback, only on the +/− buttons**:
  - `pressRipple` (onPointerDown) is an MUI-style ripple. It appends a `.press-ripple` circle under the pointer, sized to cover the button from that point.
  - The circle grows and fades over 650ms (keyframes in globals.css), is clipped by the button's `overflow-hidden`, and removes itself on `animationend`.
  - On top of that there is a small `active:scale-[0.92]` press-in.

## Polish pass 57: hero + state-9 button pair tighter, arrow from button-arrow.svg (2026-09-29)

- The gap between "Start Building" and "See how it works" went from 30 to 14 in the hero, and from 22 to 14 in state 9.
- The `&#8599;` glyph is replaced in both places by `ButtonArrow`, which inlines `public/button/button-arrow/button-arrow.svg` (24×24).
  - Its stroke is `currentColor` @0.7, so the arrow turns green with the label on hover.
  - The file has 4px of inner padding, so the button's gap is 4 (was 8) and its right padding 26 (was 32).

## Polish pass 56: scene lights from the team's own SVG shapes (2026-09-29)

The team supplied the shape each light should have: `public/pricing/pricing-background-light.svg` (950×901), and `public/footer/background-light-for.svg` (868×739), which is byte-identical to `public/last-section/text-background-light-form.svg`. Each file is two blurred blobs: #B6F1C0 → #11A32A @16% and #11A32A → #8FC6FF @18%, with stdDeviation 100.

- These replace the three hand-fitted mint radial-gradient ellipses: the state-8 pricing light (`data-pricing-glow` wrapper, still faded in by the main tl at 11.75), the state-9 light, and the footer light.
- **New `src/components/layout/SceneLight.tsx`** draws them INLINE with the files' path, gradient and filter data verbatim, plus overflow visible and `useId`-unique ids.
  - Why not `<img>`: the exported frames are smaller than the lights (the right blob runs to x≈1030 in an 868-wide file).
  - As an image the file's viewport clipped them, which left a hard horizontal edge at the bottom of the state-9 light (seen in the first try).
- **Placement**: all three are flush with the page's right edge, with the blob pair's centre on the old light's centre.
  - Pricing: left 970, top 50.
  - State 9: drawn at `LIGHT9_K` 0.6 of its size (blur included), because the team said it was too big behind "What will you build next?". Its centre stays on (1660, 410).
  - Footer: left 1052, top 60.
- The SVG files themselves are not imported; SceneLight carries their data. If the team re-exports a shape, update `LIGHTS` in SceneLight.tsx.

## Hero server load-in (2026-09-29)

User: on first visit / refresh the hero copy blurs in nicely but the server svg just appears. Now it assembles itself: the base rises 46px into place (power3.out, 1s), then the lower slab, upper slab and cap drop onto it (from −70/−95/−120 svg px, `back.out(1.15)`, 0.95s, 0.17s apart), starting 0.3s after mount — riding in just behind the heading.
- Layers = `float2Layers` (cap / upper / lower / base, the state-2 float's classification, loose chips included). Animated through per-element CSS `translate` + `opacity` — the float's channel, so it can't fight the timeline's transforms — and `clearProps`-ed at the end.
- The server host (`serverSvgRef`) is markup-hidden (`opacity: 0`) so the finished server never flashes before hydration; the effect reveals it (also in the reduced-motion branch). The intro only plays when the page opens on state 1 (`saved === 0`); a reload that restores a later state just reveals it.
- A wheel push during the intro lands it at once (`serverIntro.progress(1)` at the top of `goToState`). Verified: load-in frames, then 1→2→3→4 and back to 1 all correct, no errors.

## State 7 no longer arrives already lit (2026-09-29)

User: sometimes on reaching state 7 the board was already glowing, then went dark, then ignited ("ჯერ ნათება მხვდება, მერე ქრება და მერე ისევ ჩნდება"). The board fades in during the 6→7 crossing, before `gate7` (10.9, now `GATE7_AT`) starts the ignition, so it showed whatever an earlier visit left: a frozen mid-ignition frame (the unwind paused `seq7` but left flash/ring boost lit) or an unwind still running from a quick up-and-back; the gate then reset it dark and re-ignited.
- `unwindPower7` zeroes the transient light at once (flash, ring boost, outline burst, spin rate).
- `goToState`, when a flight crosses the gate from above: with no unwind running it resets the board OFF before it fades in; with an unwind still running (the board never left the screen) it calls `resume7()` — the unwind runs **backwards** and `seq7` carries on from where it was paused, so there is no dark frame and no second ignition. The gate skips its restart when `seq7` is already under way.
- Measured (Playwright, synthetic trackpad swipes, lit = green outline or flash > 0 while the board is visible): plain arrival off → ignite; bounce mid-ignition and after ignition stay lit throughout; full leave then return: off → ignite; every case ends in the finished "on" state (charges drawn, outline green, terminal fully typed).

## Cleanup + performance pass (2026-09-29)

User: remove everything unused (the old build used other things) without breaking anything, and lift the Lighthouse performance score (75).

**Removed** (all in git history):
- `public/`: every file nothing loads at runtime — the Figma screenshots (4MB), `server.zip`, the old per-layer hero parts (`section-hero/Group-*`, `Line *`, `cap*`, `body*`, `part-mid*`), `closed.svg` (the unfold mounts opened.svg collapsed), `server-section.jpeg`, `section-2/`, `section-4/`, and the team exports whose shapes are already inlined in code (`border-form.svg`, `button/button-arrow`, `line*.svg`, `this-line.svg`, `line-pod-connect.svg`, the section-7 connector/board exports, `pricing/`, `footer/background-light-for.svg`, `last-section/`). `public/` went 5MB → 304KB; 13 files remain, each loaded by the page. Comments that name those files still describe where the inlined shapes came from.
- Root: `Group 1574.png` and the old-build docs (`ANIMATION-FIX-PLAN.md`, `background-line-animations.md`, `grid-trail.md`, `hero-intro-animation.md`, `responsive-scaling.md`, `docs/old-scroll-animation.md`). Kept: `documentation.md` (spec), `RESPONSIVE-PLAN.md`, this file.
- Empty `src/{animations,hooks,scenes,types,components/animations}` + `src/lib/.gitkeep`; `three` + `@types/three` (package.json + lock); `Claude outputs/` untracked from git (it was committed before being gitignored — files stay on disk).
- Code: Footer's disabled reveal (it is a plain server component now, no gsap), unused exports (knip: grid.ts internals, BackgroundLines' re-exports, `SCENE_LIGHT_SIZE`).

**Performance** (local Lighthouse, production build, median of 3; mobile = Moto G emulation): mobile **~57 → ~92** (LCP 5.7s → ~2.9s, TBT ~780 → ~150ms, HTML 806KB → 487KB), desktop ~90 → ~96 (noisy, TBT 110-300ms).
- **Phone hero load-in is pure CSS** (`.m-hero` keyframes in globals.css) instead of a gsap timeline behind `visibility:hidden` — the hero copy was only painted after hydration (LCP 5.7s). Keyframes start at opacity **0.01**: Chrome ignores opacity-0 paints as LCP candidates, and the first attempt made a 10px lazy icon the LCP.
- **Phone sections build lazily** (IntersectionObserver, 150% bottom margin → `ctx.add(build)`): building all nine timelines/ScrollTriggers at load was ~550ms of TBT.
- **No inline svg props into HeroMobile**: every artwork was in the page twice (markup + RSC payload). Hero server and state-6 board are `<Image unoptimized>`; pods and agent svgs are fetched when their section nears, with ids prefixed (`m5-`/`m7-`) — the desktop scene's hidden inline copies have the same ids and `url(#id)` resolved to those, which had blanked the pods' green base gradient on phones (a pre-existing bug). The agent-svg processing moved to `src/lib/agentSvg.ts` (`processAgentSvg`), shared with HeroSection.
- **Fonts**: Geist Sans dropped — only the store badges and the +/− glyphs used it; `--font-sans` is Space Grotesk. Geist Mono is `preload: false` (nothing mono above the fold).
- Measured, not the bottleneck: the hidden desktop tree on phones (~0 TBT difference when removed).
- **Next steps if more is needed**: the desktop scene still passes 5 inline svgs as props (markup + RSC payload ≈ 300KB of the remaining HTML) and builds its whole timeline at load (TBT 110-300ms on desktop).
- **Testing note**: `next build` can't reach Google Fonts from the cloud sandbox; perf builds there swap `layout.tsx` to `next/font/local` with @fontsource files (measurement-only, never committed).

## Round 3: iPad Pro header, menu arrow + no sideways scroll, one-row phone buttons (2026-09-29)

- **iPad mini (768×1024) with the desktop scene — tested, NOT adopted.** With the floor dropped to 768/1920 (--s 0.4) the scene fits, but body copy renders at ~8.5px and the 980-tall stage fills only ~390px of the 1024px portrait screen. Reported to the user with screenshots; < 1024 stays on the stacked version.
- **Header nav at 1024–1279** wrapped "The Machine" onto two lines with the real Space Grotesk (the test browser had been measuring a fallback font — fonts are now injected from @fontsource in Playwright tests). The nav is `whitespace-nowrap` and uses `text-[15px]` / `gap-6` below 1280 (measured 470px wide, single line at 1024/1032/1180/1279); the `.header-cols` mask's ±247px half-width matches it.
- **Burger menu**: rows and "See how it works" use the hero button's arrow (button-arrow.svg path, `MenuArrow`) instead of the ↗ glyph; footer pills are one compact row (h-11, 14px, nowrap). **Sideways scroll fixed**: the panel is `overflow-y-auto`, which forces x to auto too, and the mint light hangs 30% off its right edge, so the panel scrolled horizontally (scrollWidth 507 on a 390 phone). The light now sits in its own `absolute inset-0 overflow-hidden` layer, the panel is also `overflow-x-hidden overscroll-contain`; scrollWidth = viewport at 360/390/430/768/820.
- **HeroMobile pills**: `flex-nowrap`, h m(38), 12.5px, padding 16/12, arrow m(18) — both stay on one row down to 360px (measured).

## Phone/tablet polish round 2 (2026-09-29)

User feedback on the < 1024 version and the 1024-1279 header:
- **Header lines vs logo/nav, 1024–1279**: the ≥1280 hide-lists don't match there (logo/nav are fixed px while the grid scales), so `.header-cols` (the header ColumnLines) gets a geometric CSS mask in that range only (globals.css): clear from `s(31)-14px` to `s(31)+164px` (logo) and `50% ± 247px` (the measured 458px nav). Verified 1024/1180/1280.
- **Grid < 1024 rebuilt**: `--grid-inset/--grid-pitch/--grid-row/--grid-edge/--header-h` CSS vars (globals.css) drive BackgroundLines' column + row layers and default to the exact old desktop values (INSET_VW / COLUMN_PITCH / ROW_PITCH / 96px — desktop unchanged, page height 14681 same). Below 1024: inset 20px, 6 columns (inset 32 + 10 columns from 640), square cells, last line drawn ON the right inset (the old desktop-pitch grid left a random-width last gap — "ბოლო ხაზი ძალიან ახლოს"), and verticals start at the 64px header (they started at 96 → a line-less band under the header).
- **Header < 1024**: its ColumnLines is hidden; `.header-cols-m` draws the same phone grid, masked clear of the 120px logo and the 40px burger; header padding = `--grid-inset` so the logo sits on the first line and the burger's right edge on the last.
- **Burger**: three green bars (gradient #11a32a→#35c957, middle #1ed148 shorter) in a rounded-md green-tinted box; open → X (outer bars cross, middle shrinks away); focus-visible ring in brand.
- **HeroMobile**: heading 34→28, paragraph 15.5→14, eyebrow 13→12; art smaller (server 200, stacks 210, machine 300, pods 190, board 250, agent 290); section padding 56. Buttons = the desktop pills (`border-white/25`, brand on hover AND active) with the team's button-arrow.svg path inlined (ButtonArrow) instead of the ↗ glyph. Pricing: desktop switch (role=switch), desktop `STEP_BTN_CLASS` + `pressRipple` on +/−, desktop CTA box (corner brackets, brand label).
- **State 4 unfold = the desktop one**: `components/mobile/machineUnfold.ts` is a copy of the desktop "Machine's real unfold" (one inline opened.svg mounted collapsed ≡ closed.svg, platforms rise, covered chips fade, legs slide out) exposed as `mountMachine(host) → apply(p)`; HeroMobile tweens p 0→1 over 2.2s. No more closed/opened image crossfade. If the desktop unfold changes, mirror it there.

## Tablets: nothing clipped any more + burger menu (2026-09-29)

User: on tablets the right side was cut off / ran off-screen, and there was no burger menu.
- **1024–1279 (landscape tablets, small laptops)**: the `--s` floor dropped from 1280/1920 (0.66667) to **1024/1920 (0.53333)** (`globals.css`, `SCALE_FLOOR_WIDTH` in grid.ts). Below 1280 the desktop scene used to stay 1280 wide and lose its right edge; now it scales to fit — verified at 1024×768 and 1180×820, states 1–8 fully on screen, scrollWidth = viewport. The wheel suite passes unchanged at 1024 and 1920.
- **< 1024 (phones + portrait tablets)** get the stacked `components/mobile` version (breakpoint moved from `md` 768 to `lg` 1024 everywhere: HeroSection/page wrappers, FooterMobile, both matchMedia checks, HeroSectionClient's early return). On tablets `--m` caps at 1.3px and each section centres at `m(600)`; FooterMobile's padding centres the same column.
- **Burger menu** — `components/layout/MobileMenu.tsx`, `lg:hidden`, rendered in the header (header is `h-16` / `px-5` below lg, nav `lg:block`). Round 40px button, two bars (short one offset) → X. The panel is PORTALED to `<body>` (the header's backdrop-filter would otherwise be the containing block for `position: fixed`, and its overflow clip would cut it), sits under the 64px header: dark glass (`rgba(27,26,26,.94)` + blur 18), mono "NAVIGATION", links as `0N/` (brand mono) + Space Grotesk 30/38px + ↗, gradient hairlines green → blue → faint, the two pill buttons, email + © SYSTEMCTL, mint scene light low right. GSAP: panel fade, rows blur-rise stagger, hairlines draw left→right; closes on link click / Escape / resize to ≥1024; locks page scroll while open.
- Seen while testing, NOT touched: state 8's gradient headline "Know your hosting bill before you launch." renders invisible in headless Chromium at every width (the `bg-clip-text` span is `inline-block`; see pass 41's note on why inline-block kills background-clip). Check in a real browser.

## Phone version, model B — first preview (2026-09-29)

Per RESPONSIVE-PLAN.md question 2 the user picked **B for phones** ("მანახე, თუ არ მომეწონება A-ზე გადავაკეთებთ"). Below 768px:
- `HeroSection.tsx` renders the pinned `HeroSectionClient` inside `max-md:hidden` and the new `components/mobile/HeroMobile.tsx` inside `md:hidden`. `HeroSectionClient`'s effect returns right after collapsing the SSR spacer when `(max-width: 767px)` matches — no pin, no wheel driver, no sessionStorage restore on phones. Desktop is untouched (wheel suite re-run, 1920 screenshot identical).
- `HeroMobile`: the 9 states as normal stacked sections, native scroll. Units `m(px)` = `calc(var(--m) * px)`, `--m: min(100vw/390, 1.1px)` on the root. Each section's entrance is a paused timeline on a ScrollTrigger (`top 70%`, `play none none reverse`): blur-rise copy, then per state — hero server rise + CSS float; state-2 stat card + three layer labels with dash-drawn connectors; state-3 cap/base pull apart + dashed guides + base greening; state-4 closed.svg → opened.svg crossfade; state-5 inline pods svg, slabs rise bottom-first (same 112/58/0 split as desktop) then float while on screen, API pod 0→80%; state-6 typed terminal → bubbles (CSS `.m-bubble`) → board + BUILD badge → POD 0→100% → link → LIVE card; state-7 inline agent svg, outline snaps green, glow, badge, typed agent terminal; state-8 live calculator (same prices); state-9 CTA + glow. Crossing 768 reloads the page.
- `components/mobile/FooterMobile.tsx`: flow-layout footer (same content), `md:hidden`; the desktop Footer is wrapped in `max-md:hidden` in `page.tsx`.
- Header: `overflow-x-clip` (its ColumnLines ran to x≈1216 at the 1280 floor and widened the phone layout viewport to 1216 — the real cause of the horizontal scroll) and `h-16 md:h-24`.
- Verified at iPhone 13 (390×844): no horizontal overflow (scrollWidth 390), every section animates in and rewinds on scroll-back, zero console errors, `tsc`/`eslint` clean. Tablet (768–1279) still renders the desktop scene — next stage.

## Polish pass 55: footer → state 9 no longer "sticks" on the way up (2026-09-29)

User: going up from the footer took too long and felt stuck ("ჭედავს"). Measured with synthetic trackpad swipes (Playwright, 1920×1080): the return glide used the shared 1.7s `power2.out`, so it was within 10px of the pin end at ~1.3s but input stayed locked until ~1.7s, AND the footer branch of `onWheel` swallowed every same-direction push for the whole flight — a second up swipe at 700ms or 1100ms did nothing at all. Fixes (wheel driver only):
- `goToState`: the footer → state-9 hop uses `FOOTER_RETURN_SECONDS` 0.95 (now within 10px at ~0.74s).
- The footer branch only owns events while ON / flying TO the footer (`stateIndex > LAST || (!transitioning && sc > pinST.end + 5)`); the return glide is an ordinary flight handled by the in-pin branch, so a second up push redirects on to state 8 immediately (measured: 2nd swipe at 700ms → state 8 at 747ms).
- Both footer-branch `goToState` calls now set `flickFresh = false; gestureFiredFlight = true`, otherwise the firing gesture's own ramp counted as a fresh flick after the fall-through and double-stepped (state-9 → footer → turnaround landed on 8 instead of 9).
- Follow-up same day: the way DOWN (state 9 → footer) was the same 1.7s crawl ("ძალიან ნელა ჩამოდის"); `FOOTER_RETURN_SECONDS` became `FOOTER_HOP_SECONDS` and applies to both hops (`footerHop = (stateIndex > LAST) !== (i > LAST)`). Measured: 9 → footer within 10px at ~0.73s (was ~1.3s), footer → 9 ~0.75s; state 8 → 9 unchanged.
- Second follow-up: a quick second DOWN push during 8 → 9 was dropped (the mid-flight redirect capped `next` at `LAST`), so the footer could only be reached after the whole 8 → 9 animation. The cap is now `FOOTER_INDEX` (measured: 2nd push at 600ms → footer, settled at ~1.1s). The footer's scroll-in fade-up is switched off per the user (`FOOTER_REVEAL_OFF` in Footer.tsx).
- Regression sweep, zero page errors: a long momentum tail from the footer stops at state 9; up-then-down@400ms returns to the footer; state 9 → footer with jitter tail stays monotonic; in-pin double push unchanged.

## Polish pass 54: state-6 bubbles start sooner and reach the terminal; deploy cards in border-form.svg (2026-09-29)

Team request: "ბუშტუკები უფრო მალე დააწყებინე ... თითქმის რო შეეხოს ზედა ნაწერს", plus the POD and LIVE cards inside `public/border-form.svg`, linked by `public/section-6/line-pod-connect.svg`.
- **Bubbles**:
  - The pipe/ring/flow on `seq6` now start as soon as terminal row 0 ("git push origin main") is typed, about 0.9s earlier than before. The other two rows keep typing while the bubbles rise.
  - The flow ramps in over 0.4s instead of 0.6s.
  - `PIPE6.top` moved from 468 to 459, about 2px under the terminal's bottom edge at ≈456.6.
  - The fade-out in `tick6` now covers only the lane's last ~5px (it was the last 20%), so the bubbles visibly reach the terminal.
- **Card frames**:
  - The cards are now 272 wide, and POD is a fixed 120 tall (LIVE 90).
  - They lost their CSS border and their own gradient bar.
  - `DeployFrame6` draws border-form's two hand-drawn strokes stretched to the card (preserveAspectRatio none plus non-scaling stroke; there is no dash-draw on them) and its accent bar as a plain span at 13.5/17.5, 6×15, with the asset's 4-stop gradient.
  - The title text starts at x 29.5, and the sub-rows stay at 34.
- **Board → POD connector** (first applied to POD → LIVE by mistake; corrected the same day: "server დან რო line გამოდის და უერთდება POD // api ის ეგ line უნდა შეგეცვალა"):
  - The old `deployElbow` is gone. `podConnect(sx, sy, ex, ey)` rebuilds line-pod-connect.svg's path (horizontal start, r≈11.5 turn up, vertical, r≈18 turn, horizontal end) with its two corners exactly as exported and only the straight runs stretched, because the asset (48×44) is smaller than the 66×89 gap from the board corner (1338, 656) to the card (1404, 567).
  - It uses the asset's stroke (white @0.1, 1px, via `hairline`) and keeps our arrowhead.
- **POD → LIVE** stays the straight centred hairline, now from POD's frame bottom (651.1) to LIVE's frame top (704.8). LIVE's top stays at 704.

## Polish pass 53: the state-7 power-up unwinds with animation on the way back up (2026-09-29)

Team: going 7 → 6 the green lines / grown chips vanished in one frame ("უცბად ქრება"). `gate7`'s `onReverseComplete` now calls `unwindPower7()` instead of the instant reset: `seq7` is paused where it is, and a short `unwind7` timeline (`POWER7_UNWIND` 0.9s real time — the 7→6 crossing is ~2.7s and the boards are gone ~60% in, so it has to finish inside that) shrinks every chip from its CURRENT height (read from its top face's translate) back to flat while the green top fades to its grey (CSS `fill` tween so GSAP can blend rgb → hex; `resetPower7` clears `style.fill`), retracts the squiggle and then both emerald charges toward the main board, fades the arrowheads back to white and kills the leftover processor glow; only then does the silent `reset7()` + `resetPower7()` + `seq7.pause(0)` run. Coming back down mid-unwind kills it and restarts the full sequence cleanly (`resetPower7()` first).

## Polish pass 52: FINAL state-7 pick — the demo as-is (colours on, ignition A, emerald), no replay on reload (2026-09-29)

The team settled on the ignition demo exactly as it stands with "ფერადი" + "A · ტრიალი + ციმციმი" + emerald — so pass 51's removal is undone and pass 49's sequence is back (block restored from that commit), with these on top:
- `POWER7_IGNITE` 0.15 (earlier, per pass 50); the ring is coloured and spinning from the start (pass 50's OFF/still state stays dropped); the agent outline still ships white and snaps green at the flash; chip tops tint to `#1C7A36` (tops only, as in the demo).
- pass 50's `data-orig-d/fill` caching kept (the StrictMode/HMR double-run fix).
- The right↔bottom squiggle charges together with the chips' growth (`POWER7_ON + POWER7_LINE_D + 0.15`, 0.7s).
- **Reload never shows the ignition**: the reload-restore sets `restoring7` around its `tl.time()` jump, and `gate7`'s onComplete then does `seq7.progress(1, false)` (straight to the finished "on" state: outline green, lines/arrows emerald, chips grown) instead of `restart()`. Verified: arriving from state 6 plays flash → charge → growth; reloading at state 7 shows the finished state from the first frame after hydration, no flash.

## Polish pass 51: ignition dropped, emerald charge + growth kept, softer chip tops (2026-09-29)

Team: "ამდენი ანიმაცია ზედმეტია … როგორც იყო ისე ქენი". **Passes 49/50's ignition is fully removed** — no spin-up, no flash, no OFF/still state, no white→green outline (`HeroSection.tsx` ships the agent svg plain again, the `data-agent7-*` CSS is gone from globals.css; the ring spins from the start as in pass 46). **Kept**: the emerald `#22C55E` connector charge (now from seq7 0.2, `POWER7_ON`), the emerald arrowheads, the chip growth, the squiggle, and pass 50's `data-orig-d/fill` caching fix. **Chip tops** no longer go to the saturated `#1C7A36`; they take a soft emerald tint — `POWER7_TOP_TINT` (0.35) of the way from their grey to the line colour (≈ rgb(42,86,66)); sides stay grey. Tune that one constant if the team wants it stronger/weaker. Same day: the right↔bottom squiggle (connect-both.svg) now charges TOGETHER with the chips' growth (starts at the first board's grow time, `POWER7_ON + POWER7_LINE_D + 0.15`, 0.7s) instead of after it.

## Polish pass 50: the board is OFF until ignition, earlier ignition, chip tops actually green (2026-09-29)

- **No colour and no spin before the ignition** (team: "ჩართვამდე არაფერს ფერი არ ჰქონდეს, არც წრე ტრიალებდეს"). `HeroSection.tsx` now ships the agent svg with `data-agent7-off data-agent7-still` on its root and tags every coloured element `data-agent7-color` (both ring groups + every path filled `#11A32A`/`#18241B` — asterisk, dots, processor diamond). `globals.css`: off ⇒ `filter: grayscale(1) brightness(1.5)` (0.3s transition), still ⇒ both ring spins `animation-play-state: paused`. Being in the SSR markup, a reload never flashes the "on" colours before the effect runs (the reported refresh glitch). seq7: `still7(false)` at the ignition start (the ring starts turning and spins up), `off7(false)` together with the outline snap at +0.33 (colours come back through the transition); `resetPower7()` restores both.
- **Ignition earlier**: `POWER7_IGNITE` 0.45 → 0.15 (the terminal starts typing at 0.05).
- **Bug fixed — chip tops never turned green** (team screenshot). The effect can run more than once on the same DOM (React StrictMode / HMR), and `chips7` re-read each top face's fill AFTER an earlier run had tinted it to `rgb(…)`; `mix7` parses hex only ⇒ `rgb(NaN,NaN,54)` ⇒ an invalid fill. The same trap would have captured already-grown side paths. `chips7` now caches the ORIGINAL `d`/`fill` on the element (`data-orig-d` / `data-orig-fill`) the first time it sees it. Verified in the browser: tops end at rgb(28,122,54).

## Polish pass 49: state-7 IGNITION (variant A) + emerald charge + tops-only chips (2026-09-29)

Team pick from `Claude outputs/section7-ignition-demo.html`: variant **A "ტრიალი + ციმციმი"**, line colour **emerald #22C55E**. The power-up block on seq7 was rebuilt:
- **Ignition at seq7 0.45** (`POWER7_IGNITE`): the ring's CSS spin animations get their `playbackRate` driven 1 → 14 (0.35s, power3.in) → 1 (1.2s, power3.out) via `getAnimations()`; a cyan-white radial flash (`#agent7-flash`, blurred ellipse at the processor) and a blurred `#9FF7FF` ring boost pop and fade; the asterisk paths glow (drop-shadow + lighter fill) and the processor top (`#18241B` path) warms to green; **the agent board's outline ships WHITE** (`HeroSection.tsx` regex tags the only `#1C1C1F`-fill / `#11A32A`@0.6 path with `data-agent-outline` and whitens it) and snaps to green at +0.33 with a short drop-shadow burst. The fx nodes/defs are created at mount inside the inline svg (ids `agent7-*`).
- **Charge** leaves at `POWER7_ON` (= ignite + 0.6), 1.0s per line, 0.12 stagger; green + glow copies are now `#22C55E` (markup) and the arrowheads tween to rgba(34,197,94,0.9).
- **Chips**: grow as before (14 × 0.55-1.0, back.out), and **only the top faces** turn green (`#1C7A36`) — sides stay grey (team: fully-green boxes were too much).
- `resetPower7()` restores everything (rate 1, glows off, outline white, chips flat, tops/arrows/lines back) and runs on mount + on `gate7`'s reverse.
- **Pending**: a "no colour before ignition" variant (ring arcs, dashed ring, processor, green dots all grey until the flash) is in the same demo file (toggle "ჩართვამდე: უფერო / ფერადი") awaiting the team's call.

## Polish pass 48: state-7 power-up, full-length green arrows, this-line.svg badge line (2026-09-29)

From the approved demo (`Claude outputs/section7-powerup-demo.html`, team's pick: outlines **not** recoloured, grow 14, speed 1×). It rides **seq7** (the terminal's real-seconds timeline, started by `gate7` at 10.9, rewound + `resetPower7()` on reverse):
- **Green charge down the connectors** — each connector path now has two extra copies, `[data-connector-glow]` (4-wide, 35% brand, blurred by `#connector7-glow`) and `[data-connector-green]` (1.6-wide `#1ED148`), dash-drawn from the main board at seq7 0.2 / 0.35, 1.1s power2.inOut; the arrowheads' fill tweens to green as each charge lands; the right↔bottom squiggle charges last (0.6s).
- **The two small boards' chips grow in height** as their charge lands (+0.2s): both boards are now INLINE (`rightBoardSvg` / `bottomBoardSvg` props, `data-board7="right|bottom"`). Every chip is a [left, right, top] path triple from child 19; a side face is `M a b L c d V e L f g V h Z`, so `setChip7` lifts e/g and translates the top face — a true isometric extrusion. Heights `POWER7_GROW` (14) × 0.55-1.0 per chip, staggered 0.06s, back.out(1.5), top faces tint toward rgb(24,64,34). Board outlines deliberately untouched.
- **Bug fixed — the right connector's charge stopped short of its arrow** (the "uncoloured gap"): that path is the one with a non-uniform `scale`, and with `vector-effect: non-scaling-stroke` its dash lengths are measured in SCREEN units while `getTotalLength()` is in user units, so every dash-draw on it (gray and green) ended ~15% early. The vector-effect is gone; `connectorStroke()` divides its stroke width by the mean scale instead so it still reads 1.5 wide.
- **Badge → board line is now the team's `public/section-6/this-line.svg`** (70×83, white @0.1, radius-18 corners): same shape, reversed so it still draws from the badge down, bottom vertical run +11.5 so it spans the measured gap (badge bottom 388.8 → board vertex 482, pre-`S7_DY`).
- Verified: 6→7 push → charge reaches both arrowheads, chips grown + tinted, squiggle green; 7→6 back resets everything (state-6 board chips flat again); zero console errors; tsc/eslint clean.

## Polish pass 47: state-6 glow matches state 7, POD→LIVE line centred (2026-09-29)

- The state-6 board glow (`data-board-glow`) now uses state 7's final glow: `#E1F1FF @12% → #11A32A @5% → #FFE0B8 @0%`, 70% of the board wide, 60 tall, `bottom` −50.
- The straight POD//API → LIVE hairline moved from the cards' left accent bar (`DEPLOY6_X + 21`) to their horizontal centre (`DEPLOY6_X + 134`, cards are 268 wide).

## Polish pass 46: state-7 ring = gradient + Cyan, board glow recoloured (2026-09-29)

- **Ring picked from the demo: "gradient" + Cyan.** The comet is gone; `ring7Markup()` now draws the whole inner circle as a seamless conic gradient — `RING7_SEGMENTS` (48) arcs whose colour runs `RING7_TAIL` #11A32A → `RING7_HEAD` #38E1FF → back (cosine ramp, so no seam) — and the circle simply turns (`.ring7-spin`, 6s). Dashed outer ring unchanged (backwards, 26s).
- **The glow under the state-7 main board** moved 30 lower (`bottom` −26 → −56) and took the team's gradient: `#E1F1FF @50% → #11A32A @18% → #FFE0B8 @0%` (radial, centre → edge, same blur). Round 2 the same day ("მოაკელი… ოდნავ დაბლა… width ძაან დიდზე"): peak alphas 0.5/0.18 → 0.3/0.11, `bottom` −56 → −76, width 110% → 70% of the board. Round 3 ("ბევრად უფრო მკრთალი… height-იც პატარა"): alphas 0.12/0.05, height 120 → 60, `bottom` −46 (same centre height as round 2).

## Polish pass 45: machine + panel right, hover without fill, fullserver.svg on state 7 (2026-09-29)

- **State 4 (section-4)**: the Machine moved +40 (`MACHINE.left` 600 → 640 — the dome was running into the paragraph) and its right panel the same +40 (`PANEL4_X` 1362 for the gradient line, items at `PANEL4_X + 24`), so the gap between them is unchanged.
- **Pill-button hover is border + text only** — `hover:bg-white/5` removed from the four pills (states 1 and 9); they keep `hover:border-brand hover:text-brand`. The state-8 "Start now from $15 / month" CTA is back to its original hover (`hover:bg-white/5`, no green border) — the team wants a dedicated animation for it later.
- **State 7's main board is now `public/section-7/fullserver.svg`** (521×329: the full tray with the agent board, chips and processor inside; `last-main-server.svg` is unused on disk now). It renders in the same `AGENT7` box at its native width, and its outline lands where the old board's did — badge line and connectors still meet it without any re-aiming. The ring swap moved with it (`RING7` centre 259.81,137.2 — the old board's 136.31,78.7 + the inner board's offset 123.5,58.5 inside the tray) and the ring animation was redone: a dim static base ring + a **comet** on the inner ring (28 short arcs ramping `RING7_TAIL` → `RING7_HEAD` in colour/opacity/width over 42% of the circle, plus a blurred head dot) spinning at 6s, and the dashed outer ring turning backwards at 26s. Colours are **pending the team's pick** from `Claude outputs/section7-ring-demo.html` (Mint / Blue / Cyan / White / Lime heads, all with the brand-green tail) — change `RING7_HEAD` in `HeroSection.tsx`.

## Polish pass 44: team feedback round — pipe walls gone, spinning ring, grid to the header, CTA nudge (2026-09-29)

Feedback from beqa + Niki, clarified with the user before building:
- **State 6 (section-6): the push pipe lost its walls.** The two green wall divs and the 6% green fill are deleted; the bubbles still rise ring → terminal in the same lane. The particle canvas got a 6px side margin each way (`PIPE6_GLOW_PAD`, spawn x offset by it) — the walls used to hide the spot where each bubble's `shadowBlur` glow was cropped at the canvas edge.
- **State 7 (section-7): the ring around the processor spins, green → menthol.** `last-main-server.svg` is now INLINE too (`agentSvg` prop, read in `HeroSection.tsx` like `serverSvg`). The export's ring is two flattened ellipse PATHS (dashed outer 69.8×40.3, solid inner 59.25×34.2, centre 136.31,78.7 — ratio = tan 30°), which can't rotate as a ring, so `HeroSection.tsx` regex-swaps them for two real `<circle>`s inside `translate(136.31 78.7) scale(1 0.5774)` — a true isometric frame, so `rotate()` inside it is an isometric spin. Same document position ⇒ the processor chip still covers the ring's back half. Inner ring stroke = `#ring7-grad` (#11A32A → #7DF5D2 → #11A32A@0.3) and turns with it (9s); the dashed ring turns the other way (26s, dasharray rescaled 4.3/5.37 → 5.4/6.75 for the circle's longer circumference). CSS keyframes in globals.css (`.ring7-spin*`), so reduced-motion stops it. If a re-export changes those two paths the regex misses and the file's static ring is shown.
- **Background grid: every vertical column now runs up to the header.** The one-row band under the header where the nav columns (8/9–14/15) stayed hidden is removed from `BackgroundLines.tsx`; the full gradient grid starts at `HEADER_HEIGHT_PX`. Inside the header the nav gap is unchanged.
- **State 9 buttons**: top 618 → 606, gap 30 → 22.
- **Section-2 / section-5 server float — built from the approved demo** (`Claude outputs/server-float-demo.html`, amp 5px / period 4.2s / lag 0.7 rad, `FLOAT_*` consts). Each layer rides its own phase-shifted sine (`floatOffset`), applied as per-element CSS **`translate`** (not `transform`) so it composes with GSAP's own transforms on the same elements (the 2→3 drift / fades). A `gsap.ticker` (`tickFloat`, removed in cleanup) runs one `makeFloat` controller per state: `amp` eases to 1 only while `stateIndex` is that state and nothing is `transitioning`, back to 0 the moment a transition starts, and at 0 the rest pose (no translate, original path, original dasharray) is restored exactly. The callout / pod elbows are rebuilt every frame from their layer's offset (`CALLOUT_LINES_PTS`, `podElbow(ex, ey, sy)`) so the start stays glued to the slab while label + arrowhead never move; each rebuilt path's `strokeDasharray` is re-measured so the dash-draw can't clip its tail. Layers: new-server.svg 77-100 cap (gain 1.15) / 53-76 upper slab / 28-52 lower slab / 0-27 base, loose chips (101+) by bbox y ≥500 base, ≥370 lower, else upper; server2.svg (now INLINE too — `podsSvg` prop) 112+ top / 58-111 middle / 0-57 bottom, offsets scaled by 689/560 into its svg units. Verified: two frames 1.6s apart at each state differ with lines still attached, a wheel push 2→3 leaves zero float translates behind.
- **All pill buttons hover green** (states 1 and 9: `hover:border-brand hover:text-brand`, keeping the faint `bg-white/5`); state 8's CTA box border also turns `brand` on hover (its text already was).
- **Bug fixed: the hero buttons were never hoverable/clickable.** State 8's `pricing8Ref` wrapper is a full-stage `absolute inset-0` that is always *visible* (only its children are hidden) and had no `pointer-events-none`, so it sat over state 1 and swallowed every pointer event (confirmed with `elementFromPoint`). Now `pointer-events-none` on the wrapper + `[&>[data-pricing-reveal]]:pointer-events-auto` on its children; verified the hero buttons hit-test to themselves and the state-8 calculator still clicks ($15.10 → $25.10).

## Polish pass 43: no reload flash, reload keeps the page, state-7 lines share a start (2026-09-29)

**1. The reload flash.** Every connector SVG is fully drawn in the SSR markup — the dash offsets that hide it only exist once the effect has run — so each reload painted all of state 2/5/6/7's lines at once for a frame ("refresh რომ ხდება, წამიერად თითქმის ყველა line ერთ ადგილას ჩნდება"). The four line layers now carry `data-line-layer` + inline `opacity: 0`, and the effect flips them to 1 immediately after the dash prep. The hero column had the same problem in reverse — SSR showed it finished, then the blur-in faded it back out and replayed it ("ჩნდება, ქრება და მერე იწყებს თავიდან") — so it is markup-hidden too, revealed by the blur-in (and by an explicit `gsap.set` in the reduced-motion branch, which returns before that code).

**2. A reload reopens on the same page.** Reading `window.scrollY` on mount is a race the browser wins about half the time — the first attempt did exactly that and snapped back to state 1. Instead `goToState` writes the index to `sessionStorage["usectl:state"]`, `history.scrollRestoration` is set to `"manual"`, and a mount-time restore replays it. Two details that matter: the pin's spacer only exists after ScrollTrigger's first refresh, so the restore RETRIES (up to 30 frames) until `scrollHeight` can actually hold the target — without that the scrollTo was clamped short and the quantiser animated back to state 1 — and `transitioning` is held across the jump so the quantiser stays out of it. Verified: reload at state 6 comes back at state 6 with its full artwork, and the next flick steps to state 7.

**3. State-7's two connectors now start together** (user: "მარჯვენა line-იც თითქმის იქიდან უნდა იწყებოდეს, საიდანაც მარცხენა"). The exported shape can't be stretched by translating it, so `CONNECTOR7_LINES` gained an optional `scale` and the right line's transform maps its endpoints instead: local (0.33,43.48) → (1172,726) and local (119.83,5.98) → the UNCHANGED (1309.5,681.5) ⇒ `translate(1171.62, 674.4) scale(1.1506, 1.1867)` with `vector-effect="non-scaling-stroke"`. Measured in the browser: the two starts are **4.5px apart** (1172,775 vs 1168,777 in screen coords) and the right line's end is where it always was, so its arrowhead still meets the board.

**Playwright note**: a hydration-mismatch error naming `caret-color: transparent` on the footer's inputs is the SCREENSHOT tool, not the app — `page.screenshot()` defaults to `caret: "hide"` and injects that style before hydration finishes. A reload test with no screenshots logs zero errors.

## Polish pass 42: state-2 callouts rebuilt from the user's line2.svg (2026-09-29)

The state-2 callouts were raw `<polyline>`s with hard corners ("border-radius უნდა ჰქონდეს, ეხლა მართკუთხა ფორმებით იჭრება"). First fix rounded the existing diagonal bends; the user then supplied the real asset, **`public/section-2/line2.svg`** (196×53, byte-identical to the `line.svg` next to it), which turns out to be a different shape entirely: **horizontal → 8px rounded corner UP → VERTICAL → 8px rounded corner → horizontal**, stroked `white` at `0.17`, 1px — no diagonal at all.

`calloutElbow(x0, y0, x1, y1)` now reproduces that path exactly: the same corner cubics (handles at 0.5523·r = 4.418, Figma's circle constant) and the vertical run at the same **62.1%** of the span as the file (121.794 / 196). Only the endpoints stay ours — each line still starts on its layer's pixel-measured side edge (pass 30) and ends at the label's arrowhead. The arrowheads were matched to `public/section-2/arrow.svg` too (7.5×8.66, `white` @0.15) so the line and its head belong to the same family. Dash-draw still works (the query is `[data-callout-line]`).

## Polish pass 41: blur-stagger text restored, smaller state-6 board, footer is a page (2026-09-29)

**1. Every left column enters word by word again** (user: "ისე როგორც წინა ვერსიაში გვქონდა, სათითაოდ და ბლურით"). The pre-reset `BlurText` + `stepSwap` pair is back in spirit, with the same values (blur 12px → 0, y 8, `power3.out`, per-field stagger 0.03/0.06/0.012 and delay 0.1/0.15/0.3 — converted to timeline units as stagger 0.022/0.045/0.01, offset 0/0.05/0.14). Differences from the old implementation, all deliberate:
- **Words are split at RUNTIME**, not in JSX (`splitWords` walks the text nodes once while the timeline is being built). The markup stays readable, SSR-identical, and React never re-renders those nodes — the same assumption the state-6/7 terminal typing already relies on.
- Each text node's words go inside ONE wrapper span, so a flex row (the eyebrow) keeps its flex-item count and its `gap` doesn't appear between words.
- **`bg-clip-text` headings keep their words `display: inline`** and don't get a `y` — an inline-BLOCK child starts its own box and the parent's background-clip paints nothing, which made state 8's gradient headline vanish entirely on the first attempt. Inline boxes can't be transformed, so those words fade and un-blur in place.
- Button rows / bordered CTA boxes move as one piece (`data-blur-block`, or simply containing an `a`/`button`) — animating their label while the border sat there already drawn looked wrong.
- State 1's column can't ride the pinned timeline (it is visible at t=0), so it plays the same stagger once on mount, in real seconds.

**2. State-6 board 580 → 500**, scaled about its own centre (left 794 → 834, top 485 → 510) so the push pipe still lands on the ring: `NODE6.y` 616 → 623 (PIPE6_* derive from it), elbow 1 starts (1338, 656), cards 20px left (`DEPLOY6_X` 1429 → 1409).

**3. State-5's right-hand cards enter slower**: lines dur 0.18 → 0.22 at 5.05+i·0.18, arrows 5.24+i·0.18, cards dur 0.18 → **0.26** at 5.26+i·0.18, bar/counter 5.62 dur 0.28 — the whole run still lands before the 5.95 snap.

**4. The footer is a real fullpage page again (`FOOTER_INDEX = LAST + 1`)**, and this is the fix for "ზემოთ ავდივარ, მერე უცბად ქვემოთ ვაკეთებ, აღარ ჩადის":
- Down at state 9 → ONE glide to `scrollTo: "max"` (the timeline stays parked at its end via `tweenTo(SNAP_TIMES[min(i, LAST)])`). The old native descent moved ~320px per flick — three or four flicks to see the footer.
- Up anywhere in the footer zone → one glide back to state 9.
- **A push against a running footer glide turns it around immediately.** Previously every event was swallowed for the whole glide, so a quick "down" right after going up did nothing — that was the actual bug.
- The pin's quantiser got two guards: parked on the footer page (progress 1) it returns instead of dragging back to state 9, and a scrollbar drag that lands past the pin end now ADOPTS the footer page instead of yanking back.
- Verified: down → 13601 in one glide, up → 12801, immediate down → 13601, down during the up-glide → 13601, two fast ups from the footer → state 7, manual scroll into the footer stays put and a wheel-up from there glides to state 9.

Note: the blur tweens lengthened the timeline (total 14.05 → 14.14), so every state's scroll position shifted ~1% — the snaps are now 985/2058/3803/5323/7872/10019/11271/12801. Re-derive, don't reuse old constants (the trap is documented in pass 13).

## Polish pass 40: state-7 terminal types itself, design toggle, slower 4/5 (2026-09-29)

- **State 7's terminal now types in**, the same mechanism as state 6's (user: "ტექსტი ტერმინალში უნდა დაიწეროს, ისე როგორც ზევით ვქენით"): `[data-type7]` spans start EMPTY in the markup, `[data-row7]`/`[data-cur7]`/`[data-dot7]` carry the row, caret and status dot, and a paused `seq7` timeline types them in REAL seconds (rows at 0.05/1.05/1.7, per-char 0.026/0.012/0.012) — the crossing's timeline units are compressed, so typing can't live on the main tl. A `gate7` tween at 10.9 does `seq7.restart()` on the way in and `pause(0) + reset7()` on `onReverseComplete`. Verified: leaves empty, retypes from scratch on return ("usectl ag" mid-flight), settles complete; the last row keeps the blinking `.t6-blink` block.
- **Pricing toggle to the design's exact box**: track 49×27 r4 (was a 44×24 pill), knob 22×23 `#11A32A` r4 inset 2px, travel 49−2−22−2 = **23**. Measured in the browser: track 49×27, knob at (2,2), offset 25 when annual — symmetric.
- **Crossings 2 and 3 slower** (2.8 → **3.3**, 2.4 → **2.8**) per "section-4-ის svg-ის ანიმაციები ცოტა შეანელე, section-5-იც" — the Machine's unfold occupies ~55% of its crossing, so this is what actually calms the SVG.
- Re-verified: full descent/ascent land on every state, all six gesture cases exact, zero console errors, tsc/eslint/build clean.

## Polish pass 39: state-4 overlap + another slow-down (2026-09-29)

- **The state-4 right panel no longer waits out the unfold.** It sat at 3.75 — 65% into the 3.1→4.1 unfold — so most of the crossing was the machine opening and nothing else ("სანამ ეგ არ იშლება არაფერი არ ხდება, არც მარჯვნივ ტექსტები არ გამოდის"). Now the panel line starts at **3.35** (a beat after the unfold begins) and the three items at **3.45 + i·0.09**, fully in by 3.83 while the machine keeps opening to 4.1. Verified by seeking the timeline: at t=3.5 the platforms are still separating and the panel's gradient line + title are appearing; at t=3.8 all three items are in and the legs are still coming down.
- **Crossings up another ~15%**, and crossing 4 (5→6) got more: it carries **2.68 timeline units** of content versus ~1.5 for its neighbours, so at the shared pace it read as a jump ("section-5-დან section-6-მდე უცბად გადადის"). Final values: **2.2 / 2.1 / 2.8 / 2.4 / 3.2 / 2.7 / 2.0 / 2.0**, default 1.7 — roughly 85-100% of the pre-pass-38 timing, but with the dead zones skipped, so still visibly quicker than the original.
- **Playwright gotcha worth remembering**: `page.evaluate(() => window.__tl.time(t))` HANGS the script — `.time()` returns the timeline for chaining and Playwright then tries to serialise a GSAP object graph. Always wrap seeks in a block that returns nothing: `evaluate(() => { tl.time(t); })`.
- Re-verified: full descent 1→8 and ascent 8→0 land on every state exactly, single/double/triple flicks and mid-flight turnaround all exact, zero console errors, tsc/eslint/build clean.

## Polish pass 38: scroll feel — dead zones, faster crossings, chained pushes (2026-09-29)

User: "უფრო მალე ქნა მაგრამ ლამაზად იყოს; თითქოს delay-ით ადის ზემოთ; მეორე scroll-ზე რაც შეიძლება სწრაფად უნდა დაამთავროს და შემდეგ სექციაზე ავიდეს, როგორც ქვემოთ ვაკეთებთ". Four changes, in order of how much each one mattered:

1. **Dead-zone skip (the actual "delay")**. Every state parks in a HOLD, so there is empty timeline between a snap time and the next segment's first tween — measured, in units: down 0.05/0.10/0.04/**0.20**/0.15/**0.20**/**0.25**/**0.30**, up mostly ≤0.05 but 0.15 and 0.35 at states 6/8. Traversed at crossing speed that is up to ~20% of a transition spent rendering NOTHING. `goToState` now builds a `contentSpans` index from `tl.getChildren()` (holds are the children whose vars have no animated property) and **seeks** across the empty stretch before tweening. Traced at state 3: the playhead is at 4.481 within one sample of the push (dead zone 4.25→4.45), and 5.886 going back up from 5.95. Motion starts on the first frame, both directions.
2. **Crossings ~25% shorter**: CROSSING_SECONDS 2.6/2.4/3.2/2.8/3.2/3.0/2.2/2.2 → 1.6/1.5/2.0/1.75/2.0/1.9/1.4/1.4 → (after "ოდნავ შეანელე", ×1.22) **1.95/1.8/2.4/2.1/2.4/2.3/1.7/1.7**, default 1.8 → 1.45. Relative weighting kept, ease still power1.out.
3. **Chained pushes accelerate**: a new `hurry` argument on `goToState`; every mid-flight redirect or turnaround does `chain++` and the next leg runs at `max(0.4, 0.62^chain)` of its duration (reset after a 400ms idle). Three fast flicks now cover three states in **3.4s** (was 4.4s), each leg visibly quicker than the last.
4. **Symmetric push detection**: up-swipes are physically gentler, so the old `gap > 250 || spike` rule fired readily downward and felt late upward. Now `gap > 300 || (gap > 150 && absD ≥ 4) || (flip && absD ≥ 5) || spike`, and the mid-flight redirect bar dropped from (accum ≥ 12, 550ms, 1.3×+4) to (accum ≥ 8, 260ms, 1.18×+3).

**Two real bugs found while testing this, both worth remembering:**
- **Stale unlock timer.** `transitioning` was cleared by a `setTimeout` scheduled in the scroll tween's `onComplete`. With short legs, a leg that finished ~20ms before the next redirect started would clear the NEW flight's lock 60ms later, and the next momentum event fell through to the "fresh push" branch — an extra, unasked-for state (and a twitch at the range edges). Fixed with a `flightId` token: the timer only unlocks if it still owns the current flight.
- **A tail hiccup read as a new flick.** `freshFlick` only required `flickAccum ≥ 8` after a >150ms gap; a stall in the event stream late in a momentum tail satisfied that and stole an extra state (a 7→5 double-step going up). Fixed by requiring `absD ≥ 4 && absD >= prevAbs` — **a real finger push ramps up, a momentum tail only decays**. That single predicate is the reliable discriminator; every previous heuristic here (quiet gap, spike, accumulated distance) has false-fired on one side or the other.

Verified with synthetic trackpad gestures (ramp + decaying tail): single flick = exactly 1 state both ways; 2 and 3 chained flicks = exactly 2 and 3; slow continuous scroll = 1 state per gesture, symmetric; mid-flight turnaround returns to the origin; full descent 1→8 and full ascent 8→0 hit every state exactly (1003/2096/3873/5422/8018/10205/11480/12801); footer down/up intact; zero console errors; tsc/eslint/build clean.

## Polish pass 37: the panel needed its GLASS back (2026-09-29)

Pass 36 removed the calculator panel's fill entirely (a flat `rgba(255,255,255,0.015)`), and the surface stopped reading — "pricing საერთოდ აღარ მიჩანს". Scanning the **R channel** (the neutral/white component, which the mint light barely touches) across the design's panel showed the veil is a GRADIENT, not flat: at design y300 it runs +7 over the page at the panel's left edge → +2 at the right, and is down to +3 by y760.

- Panel fill is now `linear-gradient(115deg, rgba(255,255,255,0.032) 0%, rgba(255,255,255,0.013) 50%, rgba(255,255,255,0.005) 100%)` — no green in it at all. **115deg matters**: the first attempt at 160deg is almost purely vertical, so it painted a flat band across every row and matched nothing; the design's veil fades mostly left→right.
- The light behind it re-fitted once more: left 1155 / top 295 / 705×500 (centre 1507,545). G−R now tracks the ref within ~2-3 across four full-width sweeps (y300/620/700/760), and the R profile matches within ~2.
- The glow is no longer part of `pricingItems` — it carries `data-pricing-glow` and gets its own tween at 11.75 (dur 0.5). Two reasons: it is background, not content, and adding a 5th `[data-pricing-reveal]` had pushed the last item's stagger to 12.65, past state 8's 12.6 snap.
- Verified: every pricing element reads opacity 1 / visible at state 8, both on the way down and coming back from state 9, hidden at 7/9/1; zero console errors; tsc/eslint/build clean.

## Polish pass 36: the lights are SCENE lights, behind everything (2026-09-29)

Follow-up to pass 35 with four more references (`Desktop/new-version/background-light*.png`). Pass 35 put the calculator's glow INSIDE the panel (a panel background), so it was clipped at the border; in the design the light is a **page-level blob that the panel merely sits on** — it spills ~90px past the panel's left/right edges, and the panel itself is just glass. Three such lights now exist, all the same mint `rgba(90,255,200)`, all fitted by the same measure-and-iterate method (sample the ref's G−R at design coords → render → sample ours → adjust; **G−R is the metric**, absolute RGB is polluted by text/watermark):

| light | centre (design) | radii | peak α |
|---|---|---|---|
| state 8, behind the calculator (first child of `pricing8Ref`, `data-pricing-reveal`) | 1475, 545 | 375×235 | 0.14 |
| state 9, behind "Keep building" | 1660, 410 | 235×175 | 0.13 |
| footer | 1650, 610 | 420×340 | 0.125 |

- The calculator panel's own fill is now just `rgba(255,255,255,0.015)` (the design's panel is a flat +3 on every channel over the page — a white veil, no tint) plus its `rgba(255,255,255,0.09)` border.
- State 9's old `#11a32a` right-edge wash and the footer's two-blob fit from pass 35 are both replaced by the single fitted blobs above.
- Conversion used everywhere: **G−R = α · 165** for this mint over the page base (α·(226−61)); the ref's peaks are G−R 18 (state 8), 16 (state 9), 20 (footer).
- Verified: 16/18 sample points within 3 for state 8, 12/15 within 3 for state 9, 15/16 within 4 for the footer (the design's blobs are irregular Figma shapes, so a clean ellipse can't hit every point); screenshots of all three eyeballed against the refs. tsc/eslint/build clean.

## Polish pass 35: the "light" is a GLOW, not a lighter fill (2026-09-29)

User correction on pass 34, with two real references finally delivered (`Desktop/new-version/footer-light.png` 1490×1270, `price-calculator.png` 1300×1346 — the drop-into-that-folder route works, TemporaryItems never does): **neither surface has a tinted/lighter background**. Both are dark and transparent; the colour comes from a soft mint GLOW sitting behind them.

- Method that settled it (reusable): sample the reference PNG's pixels (load it as a base64 data URL in a Playwright page — `file://` images fail to decode with `EncodingError` — draw to canvas, average a 7×7 patch per point to beat the grain), then render our page, sample the SAME panel-relative fractions, and iterate on the gradient until the numbers match. Compare the **green excess (G−R)**, not absolute values: the watermark/logo contributes equal RGB and its coverage differs between ref and ours.
- Calculator panel: fill reverted to transparent, border back to `rgba(255,255,255,0.09)`; the colour is now three stacked radial gradients (`85% 48% at 42% 60%` mint α.145 core, a weak `45% 40% at 15% 30%` up-left pool, and a cool `rgba(150,235,255,.05)` pool low-centre behind the total box). Measured against the ref at 8 panel-relative points — all within ~3 levels (ref core rgb(41,60,53) ≙ mine rgb(38,58,51); the panel top stays at page-bg rgb(29,28,28) exactly like the ref).
- **The mint colour is `rgba(90,255,200)`**, derived by solving the compositing equation from the ref's core sample (+11/+31/+24 over rgb(28,29,28) ⇒ α≈0.14). The old `#11a32a` puff was too yellow-green and far too small.
- Footer: background back to **#1b1a1a** (the ref's base samples rgb(26,26,26) — pass 34's #242322 was the mistake), and the wash replaced by two blurred mint pools (main 1120×760 at left 1150/top 230 α.115; secondary 560×460 at 1230/200 α.05). G−R excess now matches the ref within 1-4 at every sampled point.
- Verified: state-8 render and a footer crop of the exact reference region eyeballed side by side; tsc/eslint/build clean.

## Polish pass 34: user's line.svg, lighter surfaces, real checkbox (2026-09-29)

- **POD→LIVE connector replaced by the user's own export**: `public/section-6/line.svg` is a 1×49 VERTICAL hairline (`stroke white @0.1`, no arrowhead) — so the hook-around elbow is gone and DEPLOY6_LINES[1] is now a straight drop `M 1450 656 V 704` at `DEPLOY6_LINE_X = DEPLOY6_X + 21` (the cards' left accent-bar centre). The 47.7px gap between the POD card's bottom (656.3, measured) and the LIVE card's top (704) matches the asset's 49px length, which is what confirmed the reading. DEPLOY6_LINES gained `arrow?`/`hairline?` flags (only line 1 still gets a triangle); the bar-fills-then-line-draws order from pass 33 is unchanged.
- **Footer background #1b1a1a → #242322** and **the state-8 calculator panel's fill ~2× brighter** (border 0.08 → 0.12) — user asked for both ("background უფრო გაუნათე", answered via a clarifying question since the reference screenshots were purged again). The footer now reads slightly LIGHTER than the page's #1e1d1d instead of darker.
- **Calculator panel down 5** (top 213 → 218, per "კალკულატორის card პანელი ჩაწიე დაბლა").
- **Footer checkbox rebuilt**: the native `accent-brand` input renders as a heavy solid white block in dark Chrome — replaced with `appearance-none` + a thin `border-white/25`, `border-radius s(4)`, `checked:bg-brand` and a dark check SVG revealed via `peer-checked`. Verified both states.
- **TemporaryItems died a 7th time** (both screenshots this round). The flow that works is unchanged: take the screenshot, DON'T touch the thumbnail, wait ~5s, it lands on the Desktop — or drop it in `Desktop/new-version/`.
- Playwright note: a programmatic `scrollTo` into the footer gets quantized back by the pin driver (landed at state 3). To inspect the footer, run the page with `page.emulateMedia({ reducedMotion: "reduce" })` — no pin, max scroll is 801.

## Polish pass 33: state-6 cause→effect pipeline + states 5-8 nudges (2026-09-29)

- **State 6 now reads as cause → effect** (user: "როცა pod შეივსება, მერე უნდა შეუერთდეს ხაზი LIVE-ს"): the POD//API card's 64% bar became animated (`data-deploy-bar` scaleX 0→1 + `data-deploy-percent` counting 0→64, both at 8.18 dur 0.3, `DEPLOY6_PROGRESS` const), and the deploy timings are no longer index-strided — explicit `DEPLOY_LINE_T [7.75, 8.5]` / `DEPLOY_ARROW_T [7.95, 8.68]` / `DEPLOY_ITEM_T [7.97, 8.64]` so line 2 only starts drawing AFTER the bar lands. Everything still has to finish before state 6's snap at **8.8**, so the whole run was pulled ~0.2 earlier (terminal 6.85, push line 7.15, node 7.4, badge 7.52). Measured frame-by-frame: line1 → POD card → bar 32/62/64% → line2 → LIVE card, settled exact, resets on reverse.
- **State 6 geometry up 45px** (board + both cards; the terminal stays, so the push line just shortens): `BOARD6.top` 530→485, `NODE6.y` 661→616, `PUSH_LINE6.height` 200→155, elbow 1 start (1378,700)→(1378,655), `DEPLOY6_CARD_TOPS` = {pod 535, live 704}, DEPLOY6_LINES ey 612/780 → 567/735 and the LIVE elbow's inline y's −45. `BOARD6_TO7.dy` is derived from `BOARD6.top`, so state 7's right board didn't move.
- **State 7 lifted as a whole** (everything except the left text): new `S7_DY = -50` folded into AGENT7/BOTTOM7/BADGE7/TERMINAL7/BOARD6_TO7, and the connectors `<svg>` now wraps ALL its paths (lines, arrows, badge elbow) in one `<g transform="translate(0, S7_DY)">` so the hand-traced path strings stay verbatim. Fixes the bottom-left board running past the stage's 980px bottom.
- State 5 pod cards moved left again (`POD_LABEL_X` 1450 → 1410); state 8's calculator panel up 40 (top 253 → 213).
- Verified at 1920×1080: settled states 5/6/7/8, the state-6 mid-fill frame (bar 39%, LIVE line NOT yet drawn), full reverse to state 1, zero console errors; tsc/eslint/build clean.

## Polish pass 32: state-5 deploy bar animates + layout nudge (2026-09-28)

Three user asks on state 5 (pods): (1) the API pod's progress bar must FILL, not arrive already full — the inner fill div (`data-pod-bar`, width stays `POD_PROGRESS`%=80% so the settled/no-JS state is correct) is `gsap.set` to `scaleX 0 / transformOrigin left` at mount and tweened to 1 at **5.62 dur 0.3** (must end before state 5's snap at **5.95** — same trap as pass 9); the percentage is now a separate `[data-pod-percent]` span (PODS gained an explicit type + `percent?: number`, status string lost its baked-in "(80%)") counted 0→80 by a proxy tween's `onUpdate` in the same window, so bar and number stay in sync (measured: 14/54/72/78/80% across the fill, exact 80 settled, resets to 0 on reverse). (2) `SERVER5.left` 650 → 690, (3) `POD_LABEL_X` 1490 → 1450. Because the elbows' start x was hardcoded as `ex-340`, it's now `POD_LINE_START_X = SERVER5.left + 488` (488 = the pixel-measured slab-corner offset from the wrapper) so the lines keep touching the slab corners whenever the art moves. Verified at 1920×1080: settled state, mid-fill frame, reverse to state 4 and to state 1, zero console errors; tsc/eslint/build clean.

## Polish pass 31: state-2 arrowheads (2026-09-28)

Arrowheads added at the callout lines' label ends (same triangle style as pods/deploy, `data-callout-arrow`, popping at 0.92+i·0.055 right as each line finishes drawing — last ends 1.09, safely inside the 1.1 snap), labels shifted +6 to x = line-end + 16 so the arrows don't sit on the text.

## Polish pass 31: state 6 — typed terminal, the push PIPE with rising info, the ring ignites in place (2026-09-29)

From the user-approved demo (variant B). (1) The single push line became a **pipe** (`PIPE6`): two 1.5px green walls 5px either side of x1083, a faint green body, starting at y468 (~7px under the terminal — it looked glued to it) and ending EXACTLY on the ring's outline (`PIPE6_BOTTOM` = ring-circle intersection ≈609.2; the old line ran into the ring's center). A `<canvas>` inside (fixed 4× design-px resolution, CSS-stretched with --s) draws green dots + small "packet" bars rising ring → terminal with wobble/fade, plus occasional 3-packet trains; driven by `gsap.ticker` (`tick6`, idle-cheap, removed in cleanup). (2) **Terminal types**: each row's text lives in `[data-type6]` spans (text in `data-type6`, row in `data-type-row6`), blanked at mount; row cursors `[data-cur6]`, row-3's block gets `.t6-blink` (globals.css) when done; row 2's dot pops in. (3) **Ring no longer scales/moves** ("არ შემოვიდეს გვერდიდან… მანდვე აენთოს"): opacity flicker + box-shadow bloom only. **Architecture**: typing needs real seconds, so terminal→pipe→ring→flow runs on its own paused `seq6` timeline (~2.3s), started by a gate tween at main-tl 6.9 (`onComplete` → `seq6.restart()`, `onReverseComplete` → `seq6.pause(0)` + reset). The main tl fades only the new `pipe6WrapRef` wrapper at 9.0 and zeroes `flowGate6` there (reversible). `tl.totalDuration()` unchanged. Known trade-off: the BUILD badge/deploy cards (main tl 7.52+) appear while the terminal is still typing. **Follow-up same night**: the ring was still read as a second circle "arriving" (it was invisible until the pipe reached it). Now it SITS on the board from the start — main tl fades it to `NODE6_DIM` (0.3, no glow) at 6.6 with the board — and seq6 only ignites it in place (its first fromTo uses `immediateRender:false` so it can't show the ring at mount). Verified: typing → pipe → ignite → flow, 6→7→6 resumes flow, 5→6 re-entry retypes, zero errors, tsc/eslint clean.

## Polish pass 30: side-attached state-2 lines + unified Machine unfold (2026-09-28)

(1) CALLOUT_LINES starts: 1163 was ~6px ON the face, a first fix at 1195 left a visible GAP ("დაშორებულია, მიდებული უნდა იყოს") — final values are the pixel-measured per-row art edges +1: 1170/1168/1170 (canvas scan of new-server.svg rows 260/390/524), so the lines TOUCH each layer's side. (2) The Machine's unfold windows unified per user request ("ყველა ერთად გაიშალოს"): both movers share [0.05,0.95], both pillar faders [0.2,0.7], both covered-chip faders [0.45,0.85] — the whole machine opens as ONE coherent motion instead of the bottom-up stagger. Verified mid-unfold frame shows all three assemblies rising together; build clean.

## Polish pass 30: Machine unfold — platforms first, THEN the legs come down (2026-09-28)

User-approved demo ("ჯერ გაიშალოს და მერე პატარა ფეხები ჩამოვიდეს"; visuals must stay identical, animation only). The pillars no longer fade in riding with the platforms: each pillar (4 consecutive paths: 61/65/69/73 WORKERS, 97/101/105/109 APPS) is wrapped as outer `<g clip-path>` (rect = pillar bbox + stroke margin) + inner `<g>` that slides from `-(h+10)` to 0 — landing gear extending out of the platform underside. Proxy windows (same 1.0-unit `unfoldProxy` at 3.1, nothing else re-timed): movers 0.03-0.55, covered chips fade 0.35-0.55, legs 0.6+ (pairs staggered L→R, 0.25 each, last lands 0.96), a 1.5-unit sin "touch-down" settle on both platforms at 0.8-0.97. Once a leg lands its clip-path is REMOVED — a clipped group anti-aliases ~22 edge pixels by 1-2 levels, so without that the settled frame wasn't byte-identical to opened.svg. Verified in the real app (wheel-driven 2→3): legless open frame, legs landing, identical settled state, reverse to state 3 intact, zero errors; tsc/eslint clean.

## Polish pass 29: hero server lowered (2026-09-28)

SERVER_STATE1.top 85 → 125 per user request — the state-2 glide auto-compensates (SERVER_DY derives from the constant), verified states 1 and 2 both render correctly.

## Polish pass 28: gesture-identity redirect — the final wheel-driver architecture (2026-09-28)

Pass 27 failed on REAL trackpads (user report: second scroll near a transition's end did nothing): real macOS momentum streams events for 1-3s with never a >180ms pause, so the "fresh flick after a pause" rule couldn't see the second push, while heuristics on gaps/spikes false-fired on Playwright's stretched synthetic timing. Final model, two orthogonal primitives: (1) **gesture identity** — an unbroken event stream is ONE gesture (`gestureFiredFlight` marks the gesture that started the current flight; a >180ms pause ends the gesture); (2) **decaying speed peak** — `recentMax` decays with a 300ms half-life; momentum can only decay below it, a fresh finger push spikes above it. Mid-flight same-direction redirect fires when EITHER a NEW gesture accumulates ≥12px and exceeds the pre-pause delta level (hiccup-resumed tails can't), OR the SAME gesture re-accelerates past `decayedMax*1.3+4` at ≥550ms into the flight (the firing swipe's own ramp is inside 550ms; covers push-into-live-momentum where no pause ever appears). Verified across BOTH suites (7 scenarios): single long-tail swipe = exactly 1 state; second push inside live momentum = exactly 2; doubles up/down = 2; gentle-up instant; zero errors. Also user observation answered: the scrollbar moving during transitions is BY DESIGN (the scroll tween keeps pin/footer geometry truthful; the pinned stage doesn't visually scroll with it).

## Polish pass 27: mid-flight redirect replaces the queue (2026-09-28)

Real-user testing feedback ("გვერდის შეცვლა სწრაფად უნდოდა, არ ელოდებოდა ანიმაციებს"): pass 26's queue still made a second flick WAIT for the current transition to finish. Now a distinct same-direction flick mid-flight calls `goToState(stateIndex + dir)` IMMEDIATELY — `tweenTo` retargets from the current playhead so it reads as one continuous accelerating motion, never a pause-and-restart (verified by motion sampling: 1569→1759→1914→2017→2078→2096, no plateau at state 2's 1002). `pendingDir` and the onComplete chain are deleted; the flick-qualification rule (fresh after >180ms pause + ≥12px accumulated, freshness consumed on fire) is unchanged and still prevents a single swipe's ramp from self-advancing. Verified: 2 fast flicks = exactly 2 states, 3 = 3 (landed state 6 from state 3), single swipe = 1, double-up = 2 back; zero errors.

## Polish pass 26: queued double-scroll + gentler reversal threshold (2026-09-28)

Two flow upgrades: (1) **queued continuation** — a same-direction second flick landing MID-transition arms `pendingDir`, and the scrollTo tween's onComplete chains `goToState(next)` immediately (no cooldown between the two), so two fast scrolls from state 1 glide seamlessly to state 3, both directions. The arming condition took three tries: any-newPush chained off a single swipe's own ramp (3→8→25 trips the spike rule); `gap>180 && absD>=4` missed real flicks (their first delta is often 2-3px). The working rule: **flick accumulation** — a run beginning after a >180ms pause (`flickFresh`) that accumulates ≥12px arms the queue once; FIRING a transition consumes the flick's freshness, so a single swipe's tail can never self-queue. (2) The reversal (flip) threshold dropped 8→5 and the unlock cooldown 120→60ms — gentle up-swipes right after a down (the reported "ხან delay-ით, ხან 2-ჯერ") now fire on their first meaningful event. **Debug war-story**: one test run showed 3-4 transitions per double-swipe — that was DEV-SERVER HMR leaving a stale wheel handler attached alongside the new one, not a logic bug; a fresh page load reproduced sanely. Verified: double-down 0→2095 (state 3), single swipe exactly one step, double-up two back, gentle-up instant; zero errors.

## Polish pass 25: state-6 LIVE card feeds from the POD card (2026-09-28)

User request (their reference screenshot was a TemporaryItems path purged before reading — the verbal description sufficed): the `[ ✓ LIVE // v2.1.0 ]` card's elbow must originate at the `[ POD // API ]` CARD above it, not at the board. DEPLOY6_LINES entries now carry explicit `d` strings (the first still via deployElbow); the LIVE line exits the POD card's left edge at y660, drops outside it at x1402, and hooks right into the LIVE title at y780 — the existing arrowhead position/orientation unchanged. Sequencing already reads correctly: POD card appears (8.17) → this line dash-draws from it (8.25) → LIVE card fades in (8.47). Build clean, zero errors.

## Polish pass 24: the right line finally matches the design (2026-09-28)

The user's 7:44PM Desktop capture settled the right-line question for good: **right-bottom-line.svg is used UNFLIPPED** (pass 23's horizontal mirror was wrong too) and its true anchoring is: it starts on the main board's lower-right edge RIGHT NEXT to line B's start ("ორივე თითქმის ერთი და იგივე ადგილიდან იწყება" — starts ~22px apart), dips into its bowl, rises diagonally up-right, and its baked-in end-hook turns down where our arrow continues into the right board's top-left edge near the corner. Placed at translate(1189.7, 675.5) → start (1190,719) beside B's (1168,728), end (1309.5, 681.5) ~11px above the board edge with the arrow bridging. Board positions untouched (user: "ყველაფრის პოზიცია მომწონს"). Saga summary for the future: this connector went corner-stub → long hand arc → user svg flipped → user svg unflipped-next-to-B; the lesson is that a line svg export encodes SHAPE only — its anchoring/orientation needs a full-composition capture, so ask for that FIRST next time.

## Polish pass 23: all three user SVG lines in use; squiggle centered (2026-09-28)

Two refinements on top of pass 22: (1) the lower boards nudged apart ~9px each along the squiggle's own axis — right board (1239,641)→(1245,634), bottom board (1062,772)→(1056,779) — so connect-both sits CENTERED with ~10-13px of air on both sides while both arrow tips remain on the edges. (2) **`right-bottom-line.svg` finally decoded**: the export is HORIZONTALLY MIRRORED vs the design — flipped (`transform="translate(121,0) scale(-1,1)"` on the inner path; CONNECTOR7_LINES entries gained a `flip?: boolean`) it descends right with the end-curl up, exactly the check-lines shape; placed at translate(1240,634.6) with its left end on the main board's lower-right edge and our arrow diving off the curl into the right board's rim. All three of the user's exported line SVGs are now in use verbatim. Note: the flipped path dash-draws from the board toward main (reversed drawing direction) — visually subtle, flag if the user notices.

## Polish pass 22: boards snapped onto the arrow tips (2026-09-28, FINAL for state 7)

User's definitive rule: keep the connectors where they are; the boards must sit EXACTLY where the arrows end, and the connect-both squiggle must touch both lower boards. Solved as a small geometry system (edge equations, slopes 1/1.72 for top-left edges and 0.732/0.5385 for the lower edges): right board (1239,641) satisfies BOTH constraints simultaneously — arrow A's tip (1287,709) on its top-left edge and the squiggle's upper end (1330,805) on its bottom-left edge; bottom board (1062,772) likewise — arrow B's tip (1183,798) on its top-left edge and the squiggle's lower end (1317,821) on its top-right edge. Verified zoomed: all three contact points touch.

**Incident note**: pass 21's board/badge edits silently never persisted (the file still had pass-20 values while the connector edits DID land — cause unclear, possibly a clobbered write among the three sequential python edits), so pass 21's screenshots were showing mixed state and the user's "მაინც არასწორია" was accurate. Lesson: after python-scripted multi-part edits, grep the file for the NEW values before rendering.

## Polish pass 21: state-7 FINAL layout from this.png (2026-09-28)

The user dropped `Desktop/new-version/this.png` — the definitive full-composition capture — after reporting the pass-20 "tight packing" put the boards in wrong places. Scale check: ref×1.158 matches my board sizes exactly (main 450ref→521, right 300ref→347≈348 native ✓). Final positions: right board (1260, 641), bottom board (1061, 786) — essentially BACK to the original s7-full layout; pass-20's compression was an overcorrection from misreading the connector svg scales. Line usage: `left-bottom-line.svg` (main→bottom S) and `connect-both.svg` (right↔bottom squiggle at translate(1316,805)) fit 1:1 and stay verbatim; **`right-bottom-line.svg` is UNUSED** — its geometry rises left-to-right while this.png's main→right link descends (likely an export from a different iteration), so that link is a hand path: main's lower-right edge (1229,652) curving down-right, arrow at (1287,709) into the right board's top-left edge. Badge moved to left 979 so its (now gently-S-curved) line drops straight onto the main board's top vertex (1007,488), per this.png. Verified via inverted-overlay of this.png on my render (alignment ±20) + zoomed connector check; build clean, zero errors.

## Polish pass 20: state-7 uses the USER'S connector SVGs; boards pulled tight (2026-09-28)

The user exported the three connector lines from Figma (dropped at the repo ROOT — moved to `public/section-7/`): `right-bottom-line.svg` (121×55, main→right), `left-bottom-line.svg` (19×64, main→bottom), `connect-both.svg` (15×17, right↔bottom squiggle). Their path data is INLINED into the connectors svg inside `<g translate>` wrappers (so dash-draw still works; the files have no arrowheads — our triangles remain, oriented along each path's end tangent). **The tiny file sizes fixed the layout**: a 19×64 bridge means the bottom board's top edge sits only ~63px below the main board's edge — the lower boards moved MUCH closer ("ბევრად ახლოს"): right board target (1292,544)→(1190,495), bottom board (1085,765)→(1067,669) at native w348. Useful trick: the bottom board was first placed at (1119,639) and then shifted ALONG ITS OWN top-left edge direction (−52,+30 ≈ −1.72:1) — that keeps the line-2 contact point valid (same infinite edge line) while opening a ref-like gap to the right board; the squiggle sits in that gap at translate(1295,678). Verified zoomed: matches check-lines.png / the 6.56PM screens, build clean, zero errors.

## Polish pass 19: state-7 arrows re-traced from the user's zoomed capture (2026-09-28)

The user zoomed into the design and captured JUST the connector region (`Desktop/new-version/check-lines.png` — dropping files in that folder is now their reliable delivery method; TemporaryItems paths died a SIXTH time this session). Corrected topology vs pass 18: **both arrowed lines leave the MAIN board's right-upper EDGE** (t≈0.55 and t≈0.8 along (1007,488)→(1267,623)), not its corner. Line 1 arcs far right (dip, rise, drop) and its arrow enters the right board's top-left edge FROM ABOVE at ≈(1350,595); line 2 makes an S (right-down, left, down) with its arrow pointing straight DOWN just above the bottom board's top-left edge at ≈(1150,800); line 3 (right↔bottom) unchanged. The user offered to export the arrows as an SVG if hand-tracing fails — if these still aren't exact, take that offer (drop into public/section-7/ and overlay it instead of the inline paths).

## Polish pass 18: state-7 connectors rebuilt from the evening reference screens (2026-09-28)

User dropped two NEW close-up screens into `Desktop/new-version/section-7/` (6.56PM ones; copied to scratchpad s7-new-a/b) specifically about line/arrow directions. Rebuilt to match: (1) the **badge line is an ELBOW**, not a straight vertical — from the badge's lower-left (x1075) down, quarter-left, across, quarter-down, ENDING at the main board's top-vertex notch (1007,488), no arrowhead; now an svg path (`BADGE7_LINE_D`, dash-drawn — badgeLine7Ref became an SVGPathElement, added to the dash-prep list, its scaleY tween replaced with strokeDashoffset). (2) the **right board moved up to corner-to-corner** with the main board (BOARD6_TO7 target 1278/626 → 1292/544) — the screens show its left corner just below the main board's right corner. (3) three connectors, all anchored on canvas-measured board extremes: main right corner (1267,623) → right board's left corner (1292,640) with an arrowhead INTO the corner; main bottom-edge midpoint (1141,709) → S-curve → bottom board top edge (1190,~788) with an arrowhead pointing DOWN; right-board bottom vertex (1448,762) → bottom-board right corner (1418,850), thin, NO arrowhead. CONNECTOR7_LINES became `{d, arrow?}` with explicit arrow path strings. Verified: state-7 screenshot matches the refs, reverse to state 6 fully intact, zero errors, build clean.

## Polish pass 17: couldn't climb out of state 9 after a footer visit (2026-09-28, same day)

The footer return is `goToState(9→9)` — a SAME-STATE glide (transitionFrom === stateIndex). The mid-flight turnaround treated an up push during it as "against the flight" and sent it to `transitionFrom`… which is 9 again, restarting the glide+lock; impatient up-pushes therefore looped at state 9 forever ("footer-დან ავდივარ და მაღლა ვეღარ მივდივარ"). Fix: when the flight is same-state, an opposing push steps PAST it — `Math.min(LAST, Math.max(0, stateIndex + dir))` instead of transitionFrom. Verified: footer → up-glide → impatient second up lands at state 8 and onward to 7; the patient path unchanged; zero errors. General rule for this driver: any goToState(X→X) glide must treat "turnaround" as "continue in the push's direction", not "go back".

## Polish pass 16: the up-down "yanking" near the footer diagnosed and fixed (2026-09-28, same day)

User: "ხანდახან სუფთად ჩადის, ხანდახან თამაშობს მაღლა-დაბლა". Root cause found: **trackpad gestures shed 1-3px REVERSED jitter deltas as they die**, and the direction-flip shortcut in push detection treated those as deliberate reversals — three separate yank paths: (1) in the footer zone a tiny -2 tail delta triggered the return-glide mid-descent; (2) parked at state 9 (in-pin), the same jitter started a full transition back to state 8; (3) native deltas landing on top of the return-glide tripped ScrollToPlugin's autoKill and killed the glide mid-way. Fixes: the footer's up-glide now requires a STRONG deliberate push (absD ≥ 12, no flip shortcut at all); the shared push detector's flip shortcut requires absD ≥ 8; and while a transition runs, footer-zone events are fully swallowed (preventDefault) so autoKill can't fire. Verified with jitter-tailed synthetic swipes (…12,6,-2,3,-1,2): descent stays monotonic, state-8 down-push with jitter lands cleanly on 9, deliberate up from the footer and mid-flight turnarounds still respond instantly, zero errors.

## Polish pass 15: native footer descent + mid-flight turnaround (2026-09-28, same day)

Two flow fixes: (1) **the footer "page" was removed** — a down push at state 9 now returns WITHOUT preventDefault, releasing to plain native scroll ("fullpage გათიშე, პირდაპირ ჩავიდე"); the footer zone is a HYBRID: down = fully native, but an UP push still glides straight back to state 9 (pure-native up meant crawling the whole 800px footer before the driver resumed — one short swipe only covered ~250px and stalled). **Boundary gotcha**: state 9 parks EXACTLY on `pinST.end`, so the footer-zone check needs `sc > pinST.end + 5` slack — without it state 9's own up-pushes classified as "footer" and looped back to state 9 forever. (2) **Mid-flight turnaround**: `transitionFrom` is tracked in goToState, and during a transition a deliberate push AGAINST the flight direction calls `goToState(transitionFrom)` immediately (overwrite:true kills both running tweens) — previously an up-then-down sequence had to wait out the entire 2-3s transition before responding ("დიდხანს უნდება"). Verified: mid-flight up-push returns to the origin state; up-then-down lands back exactly; state9→footer is native (momentum carries); footer→state9 glide responds within one swipe; state9↔state8 stepping still exact; zero errors.

## Polish pass 14: state-5 stack enlarged/recentered, pod lines PIXEL-aimed (2026-09-28, same day — two rounds)

SERVER5 480/820/170 → **560/650/37** (bigger, content vertically centered on the s(980) canvas, stack center slightly LEFT of page center). The pod lines took TWO rounds: formula-derived corner estimates (content-top + 81) still missed slab 2 by 52px and the base by 81px (user re-reported with a screenshot that was purged — FIFTH TemporaryItems loss). The fix that stuck: **pixel-measure the corners from the svg itself** — canvas alpha-scan of server2.svg (drawImage + getImageData per y-band, rightmost alpha>20 pixel; must run on the app page, not the svg URL — an SVG document's `createElement('canvas')` makes an svg-namespace element with no getContext) gave native corners (600,275)/(601,512)/(601,715) → stage (1138, 261/453/618). podElbow start x = ex−340 = 1138; POD y = corner−55 = **206/398/563**. Verified zoomed: all three elbows touch the corner points exactly. Lesson: for "line must touch the art" tasks, measure the ART's pixels, not the wrapper geometry — svg canvases have generous empty margins and irregular internal pitches.

## Polish pass 13: ALL transitions tuned (2026-09-28, same day)

Per user ("შემდეგ ნაბიჯებზეც ეგრე გააგრძელე") the per-crossing override became a full `CROSSING_SECONDS` map in `goToState`, keyed by the lower index of an adjacent crossing, all with power1.out: 0→2.6 (hero glide), 1→2.4 (dissolve+docking), 2→3.2 (Machine), 3→2.8 (pods), 4→3.2 (deploy pipeline), 5→3.0 (AI morph), 6→2.2 (pricing), 7→2.2 (CTA); non-adjacent jumps and the footer hop keep the 1.8/power2.out default. Internal stretches alongside: server5 .35→.5@4.8, fifthText→.45@4.9; board6 .35→.55@6.45, sixthText→.45@6.55, terminal6→.45; board6 morph .5→.7, seventhText→.45, agent7→.5, bottom7→.45@9.45; pricing items dur→.4; final9→.35→.5.

**Trap worth remembering**: the internal stretches shifted the APPENDED holds (unpositioned `tl.to({})` holds attach to the then-current end), growing `totalDuration` 13.9→~14.05 — so the absolute scroll positions of every state moved ~1% and a test asserting the OLD pixel values "failed" while behavior was actually pixel-perfect (scroll targets and tweenTo times both derive from the same SNAP_TIMES/total, so they stay consistent BY CONSTRUCTION). When re-timing anything, re-derive expected scroll values as `SNAP_TIMES[i]/tl.totalDuration()*PIN` instead of reusing logged constants. Verified: all 8 crossings land exactly (1003/2096/3873/5422/8018/10205/11480/12801 with total 14.05), staged mid-frames for pods/deploy, full reverse to 0, zero errors, build clean.

## Polish pass 12: the Machine transition slowed (2026-09-28, same day)

State 3→4 suffered the same compression as the hero glide, but worse — it's the timeline's LONGEST segment (1.95 units: exit + machine arrival + the whole unfold + panel), traversed in the default 1.8s power2.out, so the machine "popped open" in ~0.7s and the left text materialized in ~0.13s (user: "სწრაფი ანიმაციით იშლება… უშნოდ ჩანს"). The per-crossing override in `goToState` became a small config: adjacent crossing at lo===0 → 2.6s/power1.out (hero glide), lo===2 → 3.2s/power1.out (machine), else default 1.8/power2.out. Plus internal stretches: machine arrival dur .35→.5 at 2.6, fourthText dur .3→.45 at 2.75. Result (frame-sampled): text eases in over ~0.4s, closed machine settles calmly, the unfold plays across ~1.5-2s of visible motion. Same lesson as pass 8: fixing "too fast" means checking BOTH the tween's timeline span and where the master ease puts it in real time.

## Polish pass 11: cap's under-walls kept + state-3 pose raised (2026-09-28, same day)

Two fixes from user report (their reference screenshots were TemporaryItems paths purged before reading — FOURTH occurrence; description sufficed): (1) **cap classification widened to 77-100** — children 77-82 are the cap's lower side walls; classified as "mid" they faded on 2→3 and the cap lost its under-lines ("ზედა server-ის ნაწილს ქვემოთ ხაზებიც აქვს… იკარგება"), verified by side-by-side render (scratchpad cap-compare.png: 83+ = flat plate, 77+ = full 3D cap). (2) **stacked pose raised 55px** ("ძაან დაბლა იყო") — `CAP_PIECE.dy` 107→52, `BOTTOM_PIECE.dy` 31→-24 (the base now rises slightly to meet the cap — reads as convergence), STACK_GUIDES ys −55; the right panel raised 30 (panelLine 395→365, title 408→378, PANEL_ITEMS y −30). All downstream formulas (overlay park position, 3→4 exits) key off the dy constants, so they followed automatically. Verified: state-3 screenshot with full-walled cap and higher stack, reverse to state 2 intact, build clean.

## Polish pass 10: state 2→3 rebuilt — the server svg goes INLINE, mids just fade (2026-09-28, same day)

The user rejected the overlay-swap mechanics entirely ("server-ის svg-ების ურთიერთობა არ მომწონს… [შუები] უბრალოდ გააქრე და ავტომატურად დარჩება ბოლო ნაწილი"). New architecture: `new-server.svg` ships INLINE — `HeroSection.tsx` (server component) reads it at build time (`readFileSync`, `width="421" height="687"` → `width="100%"`) and passes the string to the client, which renders it via `dangerouslySetInnerHTML` where the `<Image>` used to be (bonus: hero art is in the SSR HTML, no fetch pop-in). The svg's 170 children are classified at mount into cap/base/mid element lists — **rule verified by offline tinting** (three iterations; scratchpad tinted-server*.png): children 83-100 = cap plate + asterisk; 0-27 = base body + its top plate (0-13 walls, 14-27 plate — the plate misclassifies as a "slab" if you only look at index blocks); 28-82 = the two middle slabs + their face pieces; 101+ = loose chips split by `getBBox().y >= 500` (base face) else mid. NO group-wrapping needed — opacity/transform are applied per-element, so paint order can't break.

Transition now: mids fade (`autoAlpha 0`, 1.28+.35) → cap/base elements DRIFT to the stacked pose (translate in svg user units = design px ÷ SERVER_SCALE, `CAP_DRIFT_UNITS`/`BASE_DRIFT_UNITS` — no k() needed, the viewBox scaling carries --s fluidity) → at rest (2.02+) the greening overlay: `bottom-server-piece.svg` (still born grayscale ≙ visually identical to the docked silver base) fades in OVER the base elements while colorizing + glow blooms, then `tl.set(baseEls, {opacity: 0})` at 2.24 under the opaque cover. `top-server-piece.svg` is now completely unused; capPieceRef/serverImgRef deleted; the 3→4 exit animates capEls (svg elements) instead. Verified: state 1/2 pixel-identical, mids-fade frame shows a clean cap+silver-base pair, reverse fully restores state 1, zero console errors, `tsc`/`eslint`/build clean.

## Polish pass 9: state-2 wiring waits, prettier dissolve, animated base greening (2026-09-28, same day)

Three user requests, all in the state 1→2→3 stretch: (1) **state-2 callout wiring now waits for the server to fully park** — server tween 0.05→0.75 (duration 0.7, glide ≈1.1s real), box at 0.76, lines 0.78+i·0.08 (dur .14), labels 0.82+i·0.07 (dur .12, last ends 1.08 — MUST stay under the 1.1 snap or the settled state parks half-faded). (2) **middle-layers dissolve softened**: serverImg now fades WITH `filter: blur(8px)` (1.36, dur .28) — the pieces sit opaque over cap/base so the blur only shows on the vanishing middle; the drift moved 1.6→1.68 so it starts only after the ghost is fully gone. (3) **the base "powers on"**: `bottom-server-piece.svg`'s green is baked into the asset, so the img is born `grayscale(1)` (gsap.set upfront — which ALSO makes the state-2 pixel-aligned fade-in match the old server's neutral base better than before) and animates to `grayscale(0)` at 1.95 (dur .35) while its ground-glow div (`data-bottom-glow`, inline opacity 0 now) blooms at 1.98 — reads as the base charging up green as it docks; guides moved 2.02→2.08. Verified frame-by-frame: mid-glide has ZERO wiring visible, dissolve frame shows a colorless silver base mid-drift, settled state 3 fully green with glow; `tsc`/`eslint`/build clean, zero console errors.

## Polish pass 8: the hero-server center glide slowed (2026-09-28, same day)

"server ძალიან სწრაფად მოდის ცენტრში" — root cause is a compounding effect worth remembering: the server-move tween sits in the state-1→2 segment's FIRST half, exactly where the master power2.out traversal is fastest, so 0.5 timeline units played in ~0.4s real time. Two-part fix: (1) `goToState` now picks PER-TRANSITION traversal params — the 0↔1 crossing uses `duration 2.6 / power1.out` (gentler front-loading), everything else keeps `1.8 / power2.out`; (2) the server tween itself stretched 0.5 → 0.85 units (0.05→0.90 of the segment). Measured glide: ~1.5s with soft start and landing; reverse restores x=1362 exactly. Alignment note: the state-2 callout lines start drawing at 0.6 while the server is still traveling, but the server's own power2.inOut tail has it ~99% arrived before they finish — no visible mismatch. Pattern for future "state X's element moves too fast" reports: consider WHERE in the segment the tween sits relative to the master ease's speed curve, not just its duration.

## Polish pass 7: the footer is a fullpage page too (2026-09-28, same day)

Two complaints, one root cause — the state9↔footer boundary was NATIVE: going down it released to jerky momentum ("ჭედავს"), and going up the user had to natively crawl the whole footer zone before the wheel driver re-captured (the "delay" going up). Now the footer is page `FOOTER_INDEX = LAST + 1`: a down push at state 9 tweens `scrollTo: "max"` (same 1.8s power2.out glide; the timeline just stays parked at its end via `tweenTo(SNAP_TIMES[Math.min(i, LAST)])`), and an up push anywhere in the footer zone immediately tweens back to state 9. The wheel handler now captures everything from `pinST.start` DOWN (no upper-only band); the `transitioning` unlock moved from the timeline tween to the scrollTo tween (the only one guaranteed to run for the footer page). Pin `onUpdate` guard: when `stateIndex > LAST` and progress ≈1 that's just the footer parking (don't quantize back); if progress dropped below that, the user scrollbar-dragged back inside — re-adopt `stateIndex = LAST` and quantize normally. Verified: state9→footer glides to max (13601) with zero native jank, footer→state9 responds within the first swipe frames (12818 sampled at 400ms), next up lands state 8, zero errors.

## Polish pass 6: instant-attack easing + old scrub version archived (2026-09-28, same day)

Transition ease `power2.inOut` → `power2.out` (both the tweenTo and the parallel scrollTo): inOut's gentle first ~300ms read as "the animation hasn't started yet" even though it had — out shows motion on the first frame and still lands softly over the same 1.8s (measured: ~88% of the distance covered right after the swipe ramp, the rest gliding in over ~1.5s). Per user request the OLD scrub-driven behavior ("scroll-ზე რო მომყვებოდა ანიმაციები") is preserved in **`docs/old-scroll-animation.md`** — exact code for both retired variants (pure scrub, and scrub+snap) plus step-by-step restore instructions; today's fullpage work is NOT in git history, so that file is the only recovery path.

## Polish pass 5: push detection — transitions start ON the gesture (2026-09-28, same day — round 4)

User: "scroll-ზე ეგრევე დაიწყოს, ეხლა თითქოს delay-ით ხდება". Root cause: the quiet-gap-only rule — trackpad swipes START with tiny |deltaY| 1-3 pre-roll events that reset the freshness timer, so the whole swipe classified as momentum and only fired after the tail died. Replaced with **push detection**: a new push = 250ms quiet gap OR direction flip OR a magnitude SPIKE (`absD > prevAbs * 1.4 + 2` — momentum tails only decay; a fresh finger-push jumps), evaluated on every event, so the very first meaningful event of a swipe triggers `goToState` mid-gesture. `lastDelta` tracked per event; tracking resets when outside the pin. Post-transition cooldown 250→120ms. Verified with realistic synthetic swipes (ramp 2,3,6,18,40,60…decay): transition already moving during the swipe (scroll at 575 right after ramp), back-to-back swipes step instantly one state each (1013→2118→3914→5479), direction-flip mid-tail steps back exactly one, zero errors. Caveat: a mouse user spinning the wheel continuously at constant delta won't chain states without a ≥250ms pause (constant deltas never spike) — acceptable, revisit if reported.

## Polish pass 4: timeline fully DECOUPLED from scroll (2026-09-28, same day — round 3)

Round-2's wheel driver still tweened the SCROLL and let scrub drive the timeline — the user could feel it ("მაინც scroll-ზე მომყვება ანიმაციები") and wanted slower transitions. Final architecture: **the master timeline is `paused: true` with NO scrollTrigger**; a standalone `ScrollTrigger.create` only PINS the section. `goToState(i)` plays `tl.tweenTo(SNAP_TIMES[i], { duration: 1.8, ease: "power2.inOut" })` — time-based, slow, identical forwards/backwards — and tweens `window` scroll alongside purely to keep the pin/footer-handoff geometry truthful (the pinned stage doesn't visually move with it). The wheel handler steps `stateIndex ± 1` (same gesture gating as before); the pin's `onUpdate` quantizes scroll the wheel can't capture (scrollbar drag/keyboard/touch) into the same animated transitions, guarded by the `transitioning` flag. Two things the old scrub used to provide were re-added manually: (1) resize — a ScrollTrigger "refresh" listener does `tl.invalidate() + tl.seek(tl.time())` so scale-dependent function values re-evaluate; (2) nothing follows the wheel anymore, by construction. Transition speed lives in one const, `TRANSITION_SECONDS = 1.8`. Verified with real wheel events: scroll animates on its own during a gesture (99→700→1014 samples), all 9 states step in exact order, a 12-event momentum burst moves exactly one state, mid-transition screenshot shows the state-2→3 morph playing untouched, zero errors.

## Polish pass 3: TRUE fullpage wheel driver (2026-09-28, same day — two iterations)

**Iteration 1 (scrub:1 + ScrollTrigger snap-to-labels) was REJECTED by the user**: trackpad momentum sometimes snapped BACKWARD right after a down-scroll ("ქვემოთ ვაკეთებ scroll-ს და ზევით აბრუნებს"). Replaced with a real fullpage.js-style driver:

`scrub: true` (hard again) + a `wheel` listener (`passive: false`, cleaned up via useGSAP's returned function). While the scroll position is inside the pin, every wheel event is `preventDefault`ed and a DELIBERATE gesture (first event after a 250ms quiet gap; momentum tails arrive faster and are swallowed; |deltaY|<4 ignored) tweens `window` scroll (ScrollToPlugin, 1.05s power2.inOut) to EXACTLY one `SNAP_TIMES` state forward/back from the nearest current one — so transitions always play start-to-finish both directions. A lock + 200ms cooldown guards during flight. At the edges the handler returns WITHOUT preventDefault → native scroll releases into the footer from state 9 and re-captures on the way back up. Scrollbar/keyboard/touch fall back to plain scrub. `SNAP_TIMES = [0, 1.1, 2.3, 4.25, 5.95, 8.8, 11.2, 12.6, totalDuration]` — re-derive if states are re-timed.

**Gotcha**: the in-pin check must be a scroll-POSITION comparison (`scrollY` vs `st.start/st.end`), NOT `st.isActive` — isActive stays false at load until the first scroll event, which let the very first gesture fall through to native scrolling. Verified with real `page.mouse.wheel`: 8 paced gestures land 1014→2119→3915→5480→8105→10315→11604→12801 (every state, exact order); a 12-event momentum burst up moves exactly ONE state back; release into footer works; zero errors.

## Polish pass 2: footer entrance, all-gray ruler start, corner ticks removed (2026-09-28, same day)

Three user requests: (1) **Footer entrance animation restored** — "footer-ის ანიმაცია დააბრუნე, მომეწონა როგორც შემოდიოდა" refers to the staggered fade-up the standalone pricing section briefly had (no branch ever had an animated footer — checked main/last-version/v1-version); Footer.tsx is now "use client" with a `gsap.from("[data-footer-reveal]")` stagger (columns + copyright) at `start: "top 80%"`, reduced-motion-safe. (2) **Ruler starts with ZERO green**: the base PNG gets `filter: grayscale(1)` (its native green top ticks read as "already started") — every green pixel now comes only from the scroll-progress mask fill. (3) The two green corner-tick divs at 912/928 (a state-1 design detail) deleted per "navbar-ს ქვემოთ 2 ხაზი აქვს, გაუქრე".

## Polish pass 1: viewport centering + ruler progress fill (2026-09-28, same day)

Two user-reported fixes ("კონტენტი ცენტრში იყოს ნებისმიერ ეკრანზე" + "navbar უნდა ივსებოდეს მწვანედ scroll-ზე"):

1. **Vertical centering on any display**: the section is now `height: calc(100svh - 96px)` (fills the viewport below the header) and ALL content moved into an inner "stage" div — `top: max(0px, calc((100% - s(980)) / 2))`, height s(980) — so the design canvas centers itself; every state coordinate is untouched (they're stage-relative). The SSR scroll-reserve spacer became a SIBLING of the section (inside a fragment) — with a fixed CSS height on the section an inner spacer could no longer expand the pre-hydration document. Verified numerically at 1920×1080 / 1920×1200 / 1440×900 / 2560×1440: gapTop == gapBottom at all four.

2. **Ruler fills green with scroll**: a copy of the ruler stacked over the original, revealed by a `clip-path: inset(bottom)` tween of duration `tl.totalDuration()` placed at 0 (added LAST so the total already includes every state) — the fill tracks the entire pinned journey 1:1 and reverses with scrub. **A filter-tinted copy of the PNG was invisible** (the ticks' alpha is too low for sepia/hue-rotate to read); the working approach is solid `#1ed148` divs MASKED by the PNG itself (`mask-image: url(...)`, stacked ×2 to punch the alpha up) — revealed ticks turn pure green. Verified: clip tracks scroll exactly (25%/50%/98% at the matching scroll fractions).

**Playwright gotcha caught here**: `browser.newPage({ viewportSize: ... })` is silently IGNORED (the option is `viewport`, or use `page.setViewportSize`) — every earlier screenshot in this log actually rendered at the 1280×720 default, which happened to look identical because of the --s scale floor. Use `setViewportSize` going forward.

## Footer (2026-09-28, same day)

Built against `Desktop/new-version/footer/` (one 1708-wide screenshot, ×1.124). `src/components/layout/Footer.tsx` (server component), rendered in `page.tsx` after the hero — it REPLACED the temporary 60vh spacer for good (its s(800) height supplies the pin's trailing scroll room; scrollHeight 14083 > pin end ✓). Opaque `#1b1a1a` background is what ends the fixed BackgroundLines grid at the footer's top edge, exactly like the design; faint top hairline.

Contents: brand column at 187 (logo.svg at 172w, Tbilisi address, App Store + Google Play badges drawn INLINE — no official badge assets exist in the repo; Apple glyph path + a gradient play triangle); Navigation column at 707 (same anchors as the Header, "Doc" → #documentation); Contact at 1058 (mailto/tel links + `x-twitter.svg` **restored from git** `main:public/footer/x-twitter.svg`); Subscribe at 1439 (email input + accent-brand checkbox, static — no submit handler yet, deliberately NOT wrapped in a `<form>` so Enter can't reload the page); giant logo.svg watermark at 1560w / opacity .05 / `grayscale(1) brightness(2.5)`; green radial wash right side; centered "© 2026 SYSTEMCTL" (the design really says SYSTEMCTL, not usectl — kept verbatim, flag to the user if it's a mistake). User plans a detailed polish pass over everything next.

## States 8 (pricing) + 9 (closing CTA) — both INSIDE the pin (2026-09-28, same day)

Pricing (Desktop/new-version/section-8/) was FIRST built as a standalone scrolled `PricingSection` after the hero — then folded into the pin on immediate user feedback ("ახალ გვერდზე არ უნდა ჩადიოდე, იმავე კონტენტში უნდა ჩნდებოდეს… ეგ [ახალი] bar დატოვე ძველი"): the component was deleted, the 60vh spacer in `page.tsx` restored (still needed — "last section" trap), and the duplicate ruler PNG dropped (the hero's own ruler serves every state). Takeaway: **new "section-N" designs go into the pinned scene as states, not as new page sections**, unless the user says otherwise.

State 8 layout (design px ×1.138 from the 1687-wide ref): gradient headline 187/150 fontSize 72 — per-LINE `bg-clip-text` spans (green→steel-blue, reversed on line 2); para 187/380 w830; CTA box 187/533 (345×60, border + four brighter corner-bracket spans, "Start now from $15 / month", "Not a surprise." beneath); calculator panel 1250/253 (492×567, faint green gradient, translucent so the fixed grid shows through). **The calculator is LIVE inside the pinned scene** — React `useState` in HeroSectionClient co-existing with GSAP (safe because GSAP only animates the `[data-pricing-reveal]` wrappers, whose style props never change across re-renders; the pricing container deliberately has NO pointer-events-none, and pre-state visibility:hidden keeps it inert). Steppers clamp 1..max with real unit prices from the row copy (vCPU $10/mo max 16, Memory $5/GB max 64, Storage $0.10/GB max 1TB — the mock's flat "$5/mo" rows contradict its own copy, so rows show true subtotals; default $15.10 vs mock "$15"); Annual = ×12 + label swap. "free.You" typo corrected.

State 9 (Desktop/new-version/section-9/, ×1.18 from the 1627-wide ref): "What will you build next?" (52, white/50) at 187/300; the big line at 187/390 fontSize 60 with EXPLICIT `<br/>` after "Keep building" (green #27a138) — natural wrapping at 64px broke it into 3 lines over the buttons; "what matters" steel blue #6b8fa8; the two state-1 pill buttons at 618; soft green radial hugging the right edge. Single-container entrance (fade+rise).

Timeline: 7→8 at 11.45 (agent boards sink, board6 fades out — it was still visible as state 7's right board), pricing items stagger in 11.85+, hold; 8→9 at 12.9 (container fade), final9 in at 13.2, hold to ≈13.9 total. PIN_SCROLL_DISTANCE 10400 → 12800. Verified: calculator clicked WHILE pinned (3 vCPU + 2 GB + Annual = $481.20 ✓), state-9 two-line layout matches ref, full reverse to a restored state 1, zero console/page errors, `tsc`/`eslint`/`next build` clean.

## Seventh state: AI Infrastructure + state-5 art swap (2026-09-28, same day)

**State 5 reworked**: `public/section-5/server2.svg` (689×1007 — the complete 3-slab pods stack in ONE svg, chips + bottom-slab glow baked in) replaced the old three-instance `section-4/server.svg` hack and its CSS glow. Same wrapper (820/170/w480), image nudged 20px down inside it so the new art's slab centers land where the old ones sat (`SERVER5.imgDy`; SLAB_TOPS deleted). `section-4/server.svg` and `section-5/server-bottom.svg` (576×364 — right-bottom.svg's board at 1.655×, dropped alongside but never referenced) are now unused on disk.

**Main board replaced with the real export (same day)**: `public/section-7/last-main-server.svg` (273×170) — the COMPLETE agent board (platform + logo asterisk + green ring + solid/dashed circles + chips baked in) — now renders at w 521 where the empty tray + hand-drawn overlay used to be; the inline overlay svg, `agentMark7Ref`, and its pop tween are deleted. Getting it took three tries: `main-server2.svg` and `main-server3.svg` are byte-identical md5 copies of the empty `main-server.svg` (Figma kept exporting only the tray layer without its icon sublayers — check md5 before trusting a re-export). The three main-server*.svg files are now unused on disk.

**State 7 built** against `Desktop/new-version/section-7/` (2 close-ups + `section-7.png`; the blue 347×218.87 rect in the full ref is Figma's own selection UI — ignore it; it incidentally confirms the right board renders at native 348px). `public/section-7/`'s three SVGs are byte-identical renames of section-6's (main-server = Group 1728 empty tray, bottom-left/right-server = left/right-bottom) — so the state-6 board is not swapped: it shrinks/glides (x+484, y+96, scale 348/580, origin 0,0 — safe because the origin change happens at scale 1) into place as the composition's RIGHT board while its glow fades. Main board = `main-server.svg` at native 521 (left 763/top 480) wearing an inline "agent" overlay svg: the usectl asterisk (the 4 bar paths lifted from `logo.svg`, scaled 2.3× at face center 260,112), an isometric rounded-square ring (`rect rx=40` inside `scale(1,0.5) rotate(45)` — rx 18 read too sharp vs the ref), and a dashed arc. `bottom-left-server.svg` at 330 (1085/765). Two short curved connectors with arrowheads dash-draw between board edges; POD // AI AGENT badge (gradient border, 1005/320) + scaleY-drawn green line down to the ring; second terminal (1455/359/w360, font 11 — the 45-char Status line wraps at 11.5) with the agent-attach copy. Text: "AI Infrastructure / Give your agent a place to work." The reference's extra face-chips on the main board and the coin-stack on the bottom board exist in no supplied asset — omitted like section-6's fins. **Section minHeight 940 → 980** (bottom board reaches y≈974; viewport offers 984 below the header at 1080p — nothing else keyed off 940). PIN_SCROLL_DISTANCE 8200 → 10400 (state 7 spans ≈9.0–10.75+hold ≈ 11.35 total units).

Verified: settled screenshots of states 5/6/7, mid-morph frame, full reverse to a restored state 1, zero console/page errors, `tsc`/`eslint`/`next build` clean.

## Sixth state: Continuous Deployment (2026-09-28)

Built against `Desktop/new-version/section-6/` (4 screenshots + `section-6.png` full-page ref — copied to scratchpad; NOTE: macOS screenshot filenames contain a narrow no-break space U+202F before "PM", so exact-path `cp` with a normal space fails silently — use a glob). Assets in `public/section-6/`: `right-bottom.svg` (348×220) is THE board — its chip layout matches the reference exactly; `Group 1728.svg` (521×329) is the same tray EMPTY at 1.5× scale; `left-bottom.svg` is an unused chip-variant. The reference board's heatsink fins exist in no supplied asset (the old `part-mid-1.svg` has only 3 slats slanting the wrong way) — deliberately omitted, pending an asset if the user wants them. `public/section-6/section-7/` is an empty placeholder dir.

Flow (state 5 → 6 in the same pin): pods stack + callouts clear, the flat board (`right-bottom.svg` at 580 design px, left 794 / top 530) rises in with a green ground glow, then the deploy pipeline assembles top-down: terminal window (left 966 / top 311 / w 268 — "usectl // repository-pipeline", mono 11.5px rows; **12.5px made the `commit-a7f3d` row wrap**, hence the size) → a green push line (x 1083) scaleY-draws from the terminal bottom (y 461) down to a ring node on the board face (y 661) → gradient-bordered `BUILD: IN-PROGRESS` badge (1227/494, same two-layer border trick) → two status cards at x 1429 (`[ POD // API ]` DEPLOYING 64% — design's "APPI" typo corrected again — and `[ ✓ LIVE // v2.1.0 ]` HTTPS Active with an inline SVG lock) wired with `deployElbow` rounded elbows (podElbow's shape, free start point) that dash-draw. Text column: "Continuous Deployment / Push your code. We'll put it live." at the usual 187/216. PIN_SCROLL_DISTANCE 5600 → 8200 (state 6 spans timeline ≈6.1–8.65, same ~920 px/unit pacing).

Verified: forward sweep to settled state 6, mid-state screenshot, full reverse to a restored state 1, zero console/page errors, `tsc`/`eslint`/`next build` clean.

## Fifth state: the Pods view (2026-09-25, same day)

Built against `Desktop/new-version/section-4.png` with assets in `public/section-4/` (`server.svg` 688×1007, `arrow-line.svg`, `arrow.svg`). Flow: state 4's Machine dome sinks away, a three-slab "pods" stack rises in, then three pod-status callouts wire themselves to the slabs with dash-drawn rounded elbow arrows (drawn INLINE as paths matching arrow-line.svg's shape so they can strokeDashoffset-draw; the tiny triangle arrowheads pop in at each line's end), staggered top→bottom, alongside the "Run each part independently." copy. PIN_SCROLL_DISTANCE 4000 → 5600.

- **`server.svg` is ONE slab, not three** (discovered by standalone render — 48 paths, single slab with pillar stubs, no green anywhere): the design's stack is the SAME slab rendered 3×. Instance tops `SLAB_TOPS = [-276, -32, 212]` put the slab content (which sits ~367px into each 702px-tall render) at section-y 261/505/749. **Off-by-wrapper bug caught on first render**: the first offsets forgot the wrapper's own section-y 170, landing everything 170 too low — the third slab fell into the section's `overflow-hidden` and silently vanished (only 2 slabs visible). The bottom slab's green glow is a CSS radial (the SVG has no green of its own).
- Pod cards (mono font, matching the state-3/4 panels): `[ POD // FRONTEND ]` RUNNING v1.4.2 / `[ POD // API ]` DEPLOYING v2.1.0 (80%) with an 80%-filled progress bar + OUTLINE status dot (filled dots for RUNNING) / `[ POD // WORKERS ]` RUNNING v1.4.2, at x 1490, tops 330/558/762. Design's "APPI" typo corrected to "API". Elbows end in arrowheads at the card titles and start at the slabs' right corners (start x extended to ex−235 after the first pass floated ~70px short of the slab edge).
- Verified: settled state matches the reference (three slabs + glow + wired cards), full reverse to a restored state 1, zero console/page errors, `tsc`/`eslint`/build clean.

## Fourth state: the Machine unfolds (2026-09-25, same day)

Built against `Desktop/new-version/4-section.png` with new assets in `public/machine-section/` — `closed.svg` + `opened.svg` (note: file is `opened.svg`, NOT `open.svg` as the request phrased it), both sharing one 834×694 viewBox, so the closed→opened "unfold" is a pixel-aligned crossfade. Flow per explicit instruction: on scroll past state 3, the two-piece stack clears (pieces fade while drifting apart a little), the CLOSED Machine arrives (rise + scale 0.92→1 + fade), then it unfolds into the OPEN one (crossfade at 3.05-3.4), alongside state-4 copy ("Isolated Spaces / Give every project its own space.") and a third mono panel (01/ MACHINE BOUNDARY, 02/ DEDICATED RESOURCES, 03/ ENVIRONMENT CONFIG — design's "INFRASTRCTURE" typo corrected again). Machine rendered at 720 design px wide, center 960 / top 300. PIN_SCROLL_DISTANCE 2200 → 3400.

**Timing subtlety worth remembering**: unpositioned `tl.to({}, {duration})` "hold" tweens APPEND to the timeline's end, so the total duration is longer than the last absolute position label — px-per-timeline-unit is `PIN/(actual total duration)`, not `PIN/last-label`. This made the state-4 panel line start slightly before the machine's unfold on the first pass (caught via a scroll-position screenshot showing a partially-scaled gradient line; located with a computed-style sweep for visible `linear-gradient` elements — `elementsFromPoint` hit-testing is USELESS here, it skips `pointer-events:none` elements). Fixed by moving the panel entrance to 3.1/3.15+ so it rides with the unfold. Verified: sweep through all four states + reverse to a fully restored state 1, zero console/page errors, `tsc`/`eslint`/build clean.

**Unfold slowed way down on immediate feedback** ("ეგრევე გაშლილ მდგომარეობაში ჩნდება"): crossfade stretched to 1.0 timeline unit, PIN_SCROLL_DISTANCE 3400 → 4000, panel entrance moved to 3.75+. **Then rebuilt as a REAL per-platform unfold on the next round of feedback** (a slow crossfade still read as "appears already open" — the user wanted the details to physically rise): `opened.svg` is now injected INLINE (fetch + innerHTML into the machineOpen div, which replaced the `<Image>`) and its 143 top-level paths are wrapped into three `<g>` assemblies by index — DATABASE+pillars+RDS/PG chips = 25-60, WORKERS+pillars+JOB/QUE = 61-96, APPLICATION SERVICES+pillars+API/WEB = 97-132; dome/base/corner-dots (0-24, 133-142) stay static. The index ranges are CONTIGUOUS, so wrapping preserves paint order exactly; grouping verified offline by tinting each range and eyeballing the render (scratchpad/tinted-groups.png — red/orange/cyan cleanly isolate the three assemblies). Each assembly starts sunken (dy +50/+120/+190) at opacity 0 and rises into place bottom-up in staggered windows ([0,0.5]/[0.22,0.75]/[0.45,1]) driven by a scrubbed proxy tween (`unfoldProxy.p` 3.1→4.1) whose `onUpdate` is a pure function of progress — freezes mid-rise, reverses exactly, and a refresh landing mid-unfold self-syncs (the fetch callback calls apply() with whatever p already is). The closed image crossfades out over just the first 0.25 while the dome/base pixels (identical in both files) hold the frame. Opacity/transform are set on the `<g>` wrappers, NOT the member paths — several paths carry their own `opacity` attributes (LEDs at 0.28 etc.) that an inline style would override.

**Final form, after one more round** ("closed უნდა მიიღოს open-ის ფორმა" — even fading assemblies read as a swap): `closed.svg` is now COMPLETELY unused at runtime — one inline `opened.svg` plays both states. Key measurement that made it exact: the two files share one coordinate system — the DATABASE assembly (incl. its short pillars) is at IDENTICAL coordinates in both, WORKERS is collapsed by exactly (+38.5, +81.2) along the isometric axis in the closed file, APPLICATION SERVICES by (+78, +163.2) (established by matching same-sized label/slab paths across both files' bbox dumps), and the tall pillars + covered RDS/PG + JOB/QUE chips simply don't exist in closed. So the machine MOUNTS with those exact collapse offsets applied (pixel-equivalent to closed.svg), the entrance animates that collapsed form in, and the unfold drives the SAME elements back to their natural positions — movers: gW/gA translate → 0 in windows [0.05,0.55]/[0.3,0.9]; faders: workers-pillars [0.15,0.5], apps-pillars [0.42,0.85], RDS/PG chips [0.35,0.6] (revealed as WORKERS lifts off), JOB/QUE [0.6,0.85] (as APPS lifts). Sub-`<g>`s (pillars/chips) nest inside the moving assembly `<g>`s so fades ride the translation; all wrapped ranges contiguous → paint order intact. Verified: 2950 = collapsed ≡ closed.svg (API/WEB chips on top, no pillars), 3200 = assemblies lifting off with DATABASE label revealing underneath, 3450 = mid-rise with pillars forming, 3950 = settled open + panel; reverse-scrub identical; hero fully restored at 0; zero console/page errors; `tsc`/`eslint`/build clean.

## Third state added to the hero pin: the server condenses into a two-piece stack (2026-09-25, same day)

Built against `Desktop/new-version/3-section.png` (→ scratchpad/third-section.png) with new user assets in `public/stack-section/` (`top-server-piece.svg` 420×284, `bottom-server-piece.svg` 417×285 — the consolidated glowing base with all the chips baked in). Explicit requirement: NOT a swap — the old server must transform with animation.

**The morph trick that makes it read as one object**: both piece SVGs share `new-server.svg`'s internal coordinate system exactly — top piece = the server's rows 0-284, bottom piece = rows 402-687 (verified by center-column pixel profiles: identical run positions). So the pieces fade in PIXEL-ALIGNED over the old server's own cap and base (an invisible change), then the old image fades out — which visually reads as the middle layers dissolving into the base — and only then do the two pieces drift apart to the stacked pose (cap +107, bottom +31 design px) with dashed guide lines (3 vertical `stroke-dasharray` SVG lines) fading in between them. State-3 content: "Your Stacks, / in one place." copy on the left; on the right a `font-mono` (Geist Mono — first use) panel: gradient green→blue vertical line + "USECTL MANAGED INFRASTRUCTURE" + numbered items 01/ Application Services, 02/ Application Storage, 03/ Background Jobs (each title white with green number, desc white/45; design's "INFRASTRCTURE" typo corrected). PIN_SCROLL_DISTANCE 1000 → 2200 (same px-per-timeline-unit). **Bug caught on first screenshot pass**: the panel's gradient line was tweened only in `scaleY` while its SSR-hidden `opacity:0/visibility:hidden` was never released — invisible; fixed by adding `autoAlpha` to the same fromTo. Verified: scroll sweep through all three states + reverse back to a fully restored state 1, zero console/page errors, `tsc`/`eslint`/build clean.

## Hero became a pinned two-state scene (2026-09-25, same day)

Built against a second user screenshot (`Desktop/new-version/second-section.png` → scratchpad/second-section.png): scrolling does NOT move the page — the hero pins and scroll drives a scrubbed swap: state 1's text (eyebrow/H1/paragraph/buttons) lifts out, `new-server.svg` glides from the right column to the page center while scaling back to its native 421px width, and state 2 comes in — "Infrastructure Freedom / You came here to build." copy on the left (the old infrastructureSteps step-1 text; heading wraps "You came here to" / "build."), a green ambient glow pooling under the server, and right-side callouts: a gradient-bordered box ("0 Hours spent on DevOps configuration. / 100% Focus on Product Logic", green→blue border via the two-layer `background: linear-gradient(...) padding-box, linear-gradient(...) border-box` trick) plus three labels (Auto-scaling K8s Cluster / Isolated Micro-VM Kernel / Encrypted Postgres Storage) wired to the server's layers with SVG elbow polylines that "draw" in via strokeDashoffset. Reverse scroll restores state 1 exactly (pure scrub).

- Structure: `HeroSection.tsx` is a thin server wrapper again → `HeroSectionClient.tsx` ("use client", gsap + @gsap/react — first GSAP use since the reset; the deps were kept for exactly this). All geometry in design px: server state1 (left 1362/top 85/w 370) → state2 (center 960/top 126/scale 421÷370), via function-based x/y transforms scaled by `readScale()` (re-added to `grid.ts`) with `invalidateOnRefresh: true`. Server + glow share one wrapper so one transform moves both.
- Pin: `start: () => "top 96px"` (the section always sits exactly under the 96px header, so the pin is active from the first scrolled pixel — nothing scrolls before the swap), `end: "+=1000"` (`PIN_SCROLL_DISTANCE`), `scrub: true`, **`pinSpacing: true` explicitly** (`<main>` is display:flex — the documented silent-no-op trap), SSR-reserve spacer as the section's last child (server-rendered at 1000px, collapsed first thing in the effect) so pre-hydration page height matches.
- **"Last section" trap hit AGAIN and fixed**: with the hero as the only content, max scroll (957) < pin end (1000) — the pin could never complete (verified: `position: fixed` stuck at the document bottom). Fixed with a temporary trailing `<div className="h-[60vh]" />` in `page.tsx`; replace it with the next real section.
- Reduced motion: no ScrollTrigger/pin at all, spacer collapsed, hero (state 1) shown statically — state 2 is unreachable there for now, flagged as acceptable until a real second section exists.
- Verified via a scripted scroll sweep (forward to release, screenshot at the settled state-2, reverse to 0, screenshot state-1 restored), zero console/page errors, reduced-motion run (`position: relative`, scrollH shrunk by the collapsed spacer). `tsc`/`eslint`/`next build` clean.

## Audit pass: security + accessibility (2026-11-05)

A review of the whole project ("გადახედე პროექტს თუ აქვს პრობლემები და ბაგები?") rather than a
feature round. Baseline before touching anything: `tsc` / `eslint` / `next build` clean, and a
Playwright sweep (1920 / 2560 / 1440 / 1280×620 / 1024 / 390) found **zero** console errors, exact
gesture stepping both ways, working nav / deep link / calculator / subscribe flow and no horizontal
overflow anywhere. What follows is what the sweep did NOT cover, and the five fixes it produced.

**1. `next` 16.3.5 → 16.4.5 — a CRITICAL advisory in the part of Next this page actually uses.**
`npm audit` reported RCE in **`next/og`'s ImageResponse** — i.e. `src/app/opengraph-image.tsx` and
`twitter-image.tsx`, which render the link-preview card at build time. Fixed in 16.4.5 (not a major
bump). `npm audit fix` cleared the remaining HIGHs (`sharp`/librsvg, `zod`, `source-map-js`).
`eslint-config-next` and `@next/third-parties` moved to 16.4.5 with it; the exact-pin convention
(`next`, `react`, `react-dom`, `eslint-config-next` without `^`) was restored after npm rewrote it.
8 MODERATE advisories remain, all inside the `@typescript-eslint` / `minimatch` chain that
`eslint-config-next` pulls in — dev-only, and npm's only "fix" is a DOWNGRADE to
`eslint-config-next@15`, so they stay. The OG card was re-rendered and eyeballed afterwards (200,
`image/png`, 1200×630, correct artwork) — that is the regression check that matters for this CVE.

**2. `prefers-reduced-motion` left the desktop page empty.** The ≥1024 build is one pinned scene
whose nine states only exist while the timeline plays, so `HeroSectionClient` honouring the
preference by building nothing meant the visitor got the hero, the footer, and **1881px of nothing
in between** — 4 of 24 headings visible, no features / machine / pods / deployment / agents /
pricing / CTA at all. macOS and Windows both expose that setting prominently, so this was a real
audience, not a theoretical one.
- The fix reuses the build that is already correct for this: the **stacked < 1024 version**, which
  is normal flow, native scroll and (under the same media query) animation-free. `globals.css` has
  a `@media (prefers-reduced-motion: reduce) and (min-width: 1024px)` block that hides
  `[data-hero-pinned]` / `[data-footer-pinned]` and shows `[data-hero-stacked]` /
  `[data-footer-stacked]` — four new data attributes on wrappers that already existed. The rules
  are **unlayered on purpose**: Tailwind's `max-lg:hidden` / `lg:hidden` sit in `@layer utilities`,
  which plain CSS outranks (same reason the header row's rules are unlayered — pass of 2026-10-21).
- `HeroSectionClient` now returns at the top for reduce-motion exactly as it does for < 1024 (the
  old "static state 1" branch is gone — there is nothing left to keep in sync), and `HeroMobile`
  builds its timelines whenever EITHER condition holds. Its reload-on-breakpoint-crossing listener
  watches `prefers-reduced-motion` too, so toggling the OS setting mid-session can't leave a page
  whose markup says one build and whose JS built the other.
- Measured after: desktop reduce-motion is **9340px with all 9 state headings + the footer's 3**,
  nav still jumps correctly (`#pricing` lands 112px under the 96px header), 0 errors. The normal
  desktop build is byte-for-byte the same journey as before (14681px, snaps unchanged).

**3. The subscribe rate limit could be stepped over with one header.** `clientIp()` read
`x-forwarded-for[0]`, which is the part of that header the CLIENT writes — a proxy APPENDS. Proven
before the fix: 429, then the same request with `X-Forwarded-For: 9.9.9.9` → 200.
- `clientIp()` now prefers **`cf-connecting-ip`** (Cloudflare fronts the site and overwrites it on
  every request), then `x-real-ip`, and only then XFF read from the RIGHT (the last entry is the
  one the nearest hop appended). Verified: a forged XFF can no longer override a real CF header.
- That alone is not enough, because behind a proxy that sets nothing the last XFF entry is still
  whatever the caller wrote. So the limit no longer rests on identity at all: a **global ceiling**
  (`MAX_GLOBAL` 60 accepted submissions/hour) sits beside the per-IP one. Measured: 70 posts from
  70 invented IPs now yield **60 accepted / 10 blocked** instead of 70 accepted. The trade-off is
  deliberate — during a flood an honest visitor is turned away too, which for a subscribe box is
  the right direction to fail. Raise `MAX_GLOBAL`, or move the counters to a shared store (KV /
  Redis), if real demand ever approaches it.
- `prune()`'s overflow guard was a `.clear()`, which handed every visitor a fresh allowance at once
  — filling the map was itself a way to reset a limit. It now evicts the OLDEST entries down to
  `MAX_ENTRIES` (`trim()`).

**4. No security headers existed at all.** `next.config.ts` was the empty scaffold and the live
site answered with nothing but `x-powered-by: Next.js`. It now sets `poweredByHeader: false` and a
`headers()` block: CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`
and HSTS.
- **CSP is the no-nonce variant** from Next's own guide (`node_modules/next/dist/docs/01-app/
  02-guides/content-security-policy.md`). Nonces would force dynamic rendering — no static
  generation, no CDN caching — and this page is prerendered and served by Cloudflare with
  `s-maxage=31536000`. `'unsafe-inline'` is therefore unavoidable (Next's bootstrap, the JSON-LD
  block, and every inline transform GSAP writes); what the policy still enforces is where scripts
  may be LOADED from, no framing, no form hijacking, no `<base>` rewrite, no plugins.
- Allow-list: `googletagmanager` for gtag.js, `google-analytics` + `*.analytics.google.com` for the
  beacons, `blob:`/`data:` images, self-hosted fonts, `'unsafe-eval'` in dev only.
- **HSTS is deliberately without `includeSubDomains`/`preload`** — both are effectively one-way and
  would bind docs. and manager.usectl.com too. Both serve HTTPS today, so widening it later is
  safe, but it should be a decision rather than a side effect.
- Verified in a real browser with `NEXT_PUBLIC_GA_ID` set: **0 `securitypolicyviolation` events**,
  gtag.js loaded, a real `page_view` sent to `/g/collect`, the subscribe POST accepted, four states
  driven by wheel, 0 errors.

**5. `End` and `Home` could not reach the footer or the hero.** Scroll the wheel handler can't see
is quantised by the pin's `onUpdate`, which only ever moves ONE state — so `End` went
0 → 1000 → 2089 → 3885 and `Home` crawled back a state at a time. A keyboard-only visitor could
never reach the footer. A `keydown` handler now drives `End` → `FOOTER_INDEX`, `Home` → state 1,
and `PageDown`/`PageUp`/`ArrowDown`/`ArrowUp` → one page, all through the same `goToState` the
wheel uses, so a key press animates like a flick. It ignores events while a transition is running
(key auto-repeat would otherwise queue a storm) and whenever focus is in an input / textarea /
contenteditable. `Space` is left alone — it belongs to whatever is focused.
  - Known, unchanged, and not ours: pressing `Home` while focus is in an EMPTY text input scrolls
    the document (Chrome's own behaviour — the key isn't consumed by the caret), and the quantiser
    then lands on the nearest state. With text in the field the caret takes it, so this only shows
    on an empty box.

**Looked at and deliberately NOT changed:**
- **Canonical / og:url / sitemap are already consistent** (`https://usectl.com` everywhere; the
  root path normalises to `/`). An earlier reading of this as a trailing-slash mismatch was wrong.
- **Two `<h1>`s and every `<h2>` twice**, because the pinned and stacked builds are BOTH in the
  DOM with one `display:none` (that is also why the document is ~500KB). Multiple H1s are valid
  HTML and this is one URL, so it is not duplicate content in the SEO sense; the real cost is
  payload, and the fix would be rendering only one tree — which needs either client-only rendering
  (hurts LCP and SEO) or a user-agent branch (kills the static cache). Left as a documented
  trade-off; the existing "next steps if more perf is needed" note above is the place to start.
- **Content questions for the team, not bugs**: the footer still reads `© 2026 SYSTEMCTL` (verbatim
  from the design — flagged before, still unanswered) and `+995 511 11 11 11` looks like a
  placeholder.

**6. A nav click's hash outlived its visit, so refresh teleported you back to it.** Reported
alongside the above ("მენიუში თუ დავაჭერდი კონკრეტულად გვერდს, მაგ დროს დავარეგრეშებდი…"). Two
behaviours that are each correct on their own: `onNavClick` writes the target's hash with
`replaceState` (so the back button isn't filled with in-page steps), and the reload-restore lets a
hash WIN over the saved session state (so a pasted `/#pricing` opens on Pricing). Together the hash
described a page the visitor had long since scrolled away from — measured: nav to Pricing, scroll
back up to state 4 (y 5408), refresh, and the page jumped to 11439.
- `sessionStorage.setItem(STATE_KEY, …)` was duplicated in `goToState` and `jumpToState`; both now
  call one `rememberState(i)`, which additionally drops the hash (`replaceState` to
  `pathname + search`) as soon as `NAV_STATE_BY_HASH[hash] !== i`. It only ever runs after the
  visitor has moved, so deep links are untouched.
- Verified: scrolling off a nav target clears the hash and a refresh resumes at **5402 → 5402**;
  a pasted `/#pricing` still opens on Pricing; refreshing immediately after a nav click still
  returns to that page; a second nav click updates the hash and lands correctly.

**Not reproduced: "the restored page's text is written on top of the texts above it."** Reported in
the same message and seen by the user on the LIVE site (so HMR, this project's usual suspect for
duplicated-animation symptoms, is ruled out). Tried and failed to trigger it in ~20 scenarios:
production build, the dev server, and usectl.com itself; 1920 / 2560 / 1920×800; discrete flicks,
slow continuous scroll, and a synthesised real-trackpad momentum tail; chained flicks, mid-flight
turnarounds and impatient no-pause bursts; reloads at 0 / 120 / 300 / 400 / 700 / 1200 / 2500ms
after the click; all four nav targets. A detector that lists every showing text-bearing block in
the stage (not just headings) reported exactly one state's column at every step, every time.
- The strongest remaining suspect, for whoever picks this up: **the reload-restore seeks with
  events ENABLED** — `tl.time(SNAP_TIMES[i])` at the end of the restore block, whereas
  `jumpToState` learned in pass 62 to use `tl.time(enter, true)` for exactly this reason. Crossing
  the gates forward during that seek can start the out-of-timeline, real-seconds sequences
  (seq6/seq7 typing, the pipe, the power-up), and the main timeline does not own what they leave
  behind. `restoring7` already patches one symptom of this. If the report recurs, the fix is to
  give the restore the same discipline `jumpToState` has (suppress the seek, reset the sequences
  by hand BEFORE it — pass 63's rule).
- Asked the user for a screenshot of the overlap; which two states overlap would point straight at
  the owning tween.

**Regression suite** (`next start`, production build) — all green: the wheel journey down AND up
hitting every snap (1000 / 2089 / 3859 / 5402 / 7990 / 10168 / 11439 / 12801 / 13601), four nav
targets, the logo, the `/#pricing` deep link, the calculator inside the pin ($15.10 → $30.20),
the five keyboard cases, reduce-motion at 1920 and 390, the phone sweep + burger menu, 2560 /
1280×620 / 1024 / 1440, and the subscribe form end to end — with zero console errors anywhere.
`tsc` / `eslint` / `next build` clean.
  - Harness note: a single synthetic "flick" occasionally reads as a chained gesture and skips two
    states (seen once in ~6 runs of the same script, never reproducible). Re-run before believing a
    gesture failure — the same lesson as the HMR double-handler trap documented above.

## Rebased onto the team's session-replay commit; the CSP had to learn about it (2026-11-05)

The repo moved AGAIN: `origin` is now **https://github.com/syst3mctl/landing-usectl.git** (the
`usectl/usectl` remote is kept as `old-origin`; `benqsj/usectl` before that). A push of the audit
work was rejected because `origin/master` had one commit nobody here had: **`6ff6025` "tracking
for relay"** by j3dyy — `src/components/SessionReplay.tsx`, self-hosted OpenReplay posting to
`https://analytics.usectl.com/ingest`, plus `@openreplay/tracker` and a `<SessionReplay />` in
`layout.tsx`.

The audit commit was rebased on top of it (it was unpublished, so history stays linear).
`layout.tsx` auto-merged — GA goes after `</body>`, SessionReplay inside it, no overlap. Only the
package files conflicted:
- `package.json` — both dependency sets kept (`@next/third-parties` AND `@openreplay/tracker`).
- `package-lock.json` — NOT hand-merged: `git checkout origin/master -- package-lock.json` then
  `npm install`. **Watch this step**: taking their lock silently reverted the audit's `npm audit
  fix`, putting `zod` back to 4.6.5 and `source-map-js` to 1.2.1 (both HIGH). Re-running `npm
  audit fix` restored 4.6.7 / 1.2.2. After any lock-level merge, re-check `npm audit` before
  trusting it — the counts are the only way to see it.

**The CSP would have killed their feature, silently.** Two directives were missing for OpenReplay,
and `SessionReplay.tsx` wraps its own start-up in `.catch(() => {})`, so there would have been
nothing in the console to explain the missing recordings:
- `connect-src` += `https://analytics.usectl.com` — the ingest endpoint;
- `worker-src 'self' blob:` — the tracker runs its uploader in
  `new Worker(URL.createObjectURL(new Blob([...])))` (verified by grepping the installed package).
  Without it `default-src 'self'` blocks the worker.
Both are in a separate commit from the audit work, since they are a response to their commit.
Verified in a real browser against the merged production build: an OpenReplay-shaped blob worker
starts and round-trips a message, a POST to `analytics.usectl.com/ingest` is not refused by CSP,
gtag still loads and fires, the subscribe POST is accepted — **0 `securitypolicyviolation`
events**. General rule for later: a new third-party script in this repo almost always needs a CSP
line, and the failure mode is silence.

Re-ran the full suite on the merged tree — all green (same list as the audit pass below).
`tsc` / `eslint` / `next build` clean.

## The state-7 power-down stopped riding the scroll; SYSTEMCTL links out (2026-11-05)

**1. "© 2026 SYSTEMCTL" is now a link to https://systemctl.sh** (`SYSTEMCTL_URL` in `src/lib/nav.ts`,
so the three places that render the credit — `Footer.tsx`, `FooterMobile.tsx` and the burger menu's
`MobileMenu.tsx` — can't drift). New tab with `rel="noopener noreferrer"`, the same treatment
Documentation and the X icon get. Verified in all three, including a real click that opens
`https://systemctl.sh/`.

**2. The state-7 green power-down followed you up the page.** Reported as: refresh, then scroll up
quickly, and the connector animation comes along with the scroll. Reproduced with a per-frame
recorder over `[data-connector-green]` (dash-offset × opacity, plus the layer's own opacity):
after a reload at state 8, pushing up left the charge **visible for 650ms while the page travelled
from y 9497 past state 6 down to 6985**. Two independent causes, both fixed:

- **The connector layer belonged to the page, not to state 7.** Only the 7→8 exit (11.45) ever hid
  it; at states 1-6 the `<svg>` was fully visible and the lines were "invisible" purely because of
  their stroke-dashoffset. That is fine while the MAIN timeline owns them — but the charge and its
  power-down are driven by `seq7` / `unwindPower7`, which run in REAL SECONDS, independent of the
  scroll. So anything they did after you left state 7 played in full view. Pass 62 fixed exactly
  this leak for `jumpToState`; this was the scroll path. Now
  `tl.fromTo(connectors7, {autoAlpha: 0} → 1, 9.55)` folds the layer into state 7's own entrance,
  mirroring the 11.45 exit. Measured: the layer is `opacity 0` at every state below 7.
- **The retract itself left a half-drawn stub.** Shrinking the green back along the path is a
  ~0.7s real-time animation and the scroll does not wait for it, so a fast push left a bright
  half-length green squiggle hanging between the boards and moving with the page (screenshotted).
  The lines now **fade out** (`POWER7_LINE_FADE` 0.22s, green + glow + the arrowheads' fill)
  instead of retracting: a fade cannot leave a partial shape behind no matter how fast the scroll
  is. `resetPower7` clears the inline opacity again, so the next arrival charges from empty.
  The chips keep their animated shrink — pass 53's "don't just vanish in one frame" still holds,
  it simply isn't a travelling artefact any more.
- Result: 650ms → **67ms** in the worst of four scenarios, and what is left is a fading line while
  the boards are still fully on screen (i.e. the board powering down), not a stub following the
  page. Three of the four scenarios are completely clean.
- Re-verified the whole state-7 family afterwards, since passes 49-53 and 62-63 all live here:
  scrolling down into state 7 still plays the full ignition (3/3 lines charged, arrows green,
  terminal typed 43/39/45); a reload at state 7 lands on the finished state; a 7→6→7 bounce comes
  back fully lit; a logo jump from the footer shows nothing of state 7 on the hero; states 1-6
  never show the layer. Zero console errors throughout.

Full suite re-run on the production build — all green. `tsc` / `eslint` / `next build` clean.

## Start Now, Scroll Down, the footer's socials, and the phone rebuilt to its boards (2026-11-05)

Six asks in one round, written up by the user in `TASKS-start-now.md` (read it for the original
wording and the Figma numbers). Done in four steps, each verified in a real Chromium against the
PRODUCTION build before moving on.

**New shared file `src/components/ui/icons.tsx`** — `ButtonArrow` (the team's button-arrow.svg)
and `ScrollDownArrow` (the boards' 14×14 down arrow), both taking their size from the caller
because every surface writes lengths in its own unit (`s()`, `m()`, plain px in the header). The
three hand-copied arrows (HeroSectionClient ×2, HeroMobile, MobileMenu's `MenuArrow`) are gone.

**1. "Start Now" in the header** (`Header.tsx` + `.header-cta` in globals.css). Measured at 1920:
x 1607 / y 26 / 132×44, 14px Medium, radius 40, → `SIGNUP_URL` in the SAME tab, hover → brand.
Geometry is in **--sh**, not `--s` — the same canvas the logo and nav were moved onto (2026-10-21),
with the design values as a FLOOR, so it grows with a big display and never shrinks below 132×44.
Its right margin is exactly one grid column (82), which lands the pill's right edge on column 21
(1739) where Figma has it; the row's own 99 padding supplies the rest.
- **The band's grid lines run THROUGH it** — unlike the logo and the nav, which are masked clear.
  They were masked away at first; the user asked for them back ("მაგის უკან უნდა იყოს ხაზები"),
  so the ≥1280 `.header-cols` mask that was added for this is gone again and the 1024-1279 one is
  back to its logo+nav windows. Measured: 2 lines cross the pill at 1920, 3 at 1440/1280, 4 at
  1024.
- Verified at 3440 / 2560 / 1920×800 / 1600 / 1440 / 1280 / 1024: never overlaps the nav, no
  horizontal overflow, font 19.2px at 3440 and a flat 14px below 1920.
- Phones don't get it in the bar (the phone header is logo + burger); it lives in the menu.

**2. "Scroll Down" — DESKTOP ONLY.** One **persistent pill**, not one per state: the nine states
are layers on the SAME canvas, so nine copies would fade into each other in the same spot. It is
**centred** (`left: 50%` + `-translate-x-1/2`) — the user's call after seeing it at left 187 — and
a `syncScrollDown()` hides it (opacity + visibility + `tabIndex -1`) whenever `stateIndex >= LAST`,
called from every place `stateIndex` moves: `goToState`, `jumpToState`, the pin's quantiser and
the reload-restore. Measured: 1000 → 2089 → 3859 … → 12801, then hidden; screenshots of all nine
states show it clear of every state's artwork (closest: state 7's bottom-left board at x 1056).
- The PHONE got the same pill at first and the user removed it ("mobile ვერსიაზე scroll down
  წაშალე") — the stacked build scrolls natively, so it was redundant there. Nothing of it is left
  in `HeroMobile`; `ScrollDownArrow` now has one caller.
- **Two follow-ups the same day (TASKS item 12), both from "the pill blinks when I click it":**
  1. **It is no longer inside `stageRef`.** `jumpToState` fades the WHOLE stage from opacity 0 to
     hide its seek — and the pill was part of the stage, so it vanished and faded back in on every
     click, reading as "a new Scroll Down arrives". It is now a sibling of the stage inside the
     pinned `<section>`, anchored to the SECTION's bottom (`bottom: s(38)`, which reproduces its
     old place at 1920×1080) rather than to the design canvas — so a short window, where
     `fitStage()` shrinks the stage, still shows it in the same spot. Verified in viewport at
     2560×1440, 1280×620 and 1024×768.
  2. **The click runs `goToState`, not `jumpToState`.** One state down is exactly what a wheel
     flick or ArrowDown does, so it gets the real animated crossing with the tuned
     `CROSSING_SECONDS` — no seek, no stage fade. (Nav items keep `jumpToState`: they skip several
     states and the fade is right for that.) A second click mid-flight behaves like a second
     flick — `goToState` retargets from the live playhead and `stateIndex` is already the
     destination, so it steps one further. Measured through a whole crossing at 60ms intervals:
     the pill's computed opacity is **1.00 in every sample**, the stage's too, and the scroll
     ramps 0 → 1000 smoothly instead of jumping.
  3. **Press ripple.** `pressRipple()` was duplicated in `HeroSectionClient` and `HeroMobile`; it
     now lives in **`src/lib/pressRipple.ts`** and all three callers use it (both pricing steppers
     and the pill). `.press-ripple` gained a `--ripple` custom property so a quiet button can tune
     the colour down — the pill passes `RIPPLE_SOFT` (rgba(17,163,42,0.25) → transparent) while the
     steppers keep the bright default. The pill is `relative overflow-hidden isolate` so the circle
     is clipped to its rounded shape, and the helper returns early under `prefers-reduced-motion`.

**3. Footer.** `SHOW_PHONE = false` + `PHONE_NUMBER` / `PHONE_HREF` in `src/lib/nav.ts` hide the
placeholder number in BOTH footers the way `SHOW_STORE_BADGES` hides the badges. The social row is
now one `SOCIAL_LINKS` array (X → Instagram → Facebook, with per-icon sizes 20/18/20 — the three
files frame their glyph differently, so equal boxes read as three different sizes), rendered by
both footers, all `target="_blank" rel="noopener noreferrer"` with an `aria-label`. `INSTAGRAM_URL`
/ `FACEBOOK_URL` also went into the JSON-LD `sameAs`.

**4. The subscribe send icon** is `public/footer/arrow-input.svg` (already brand green), and the
ONLY thing that changes is its opacity: **0 empty → 0.4 while typing → 1 on a complete address**,
180ms. No box, no border any more. The consent gate is unchanged and deliberately separate from
the icon: an unticked box still takes the click and answers with "Please accept the terms and
conditions first." Verified end to end on both footers, including a real POST.

**5. Phone: the logo goes back to the top** (reported from an iPhone: tap the logo on Pricing,
nothing happens). The `href="/"` interception lived only in `HeroSectionClient`'s `onNavClick`, and
that scene is never built below 1024 / under reduce-motion — so the click was a same-route Next
`<Link>` with nothing to navigate to. `HeroMobile` now installs its own capture-phase handler for
any same-page "/" link: it fires `CLOSE_MENU_EVENT` (exported by `MobileMenu`, which listens — the
open menu locks page scroll, so it has to close first), drops the hash, and scrolls to the top on
the NEXT frame. Verified from the header, the footer and from inside the open menu.

**6. The burger and the menu are Vercel's layout** (design boards `design/mobile/M1`, `M2`). The
icon is `public/mobile/burger.svg` drawn inline — no bordered box, no tinted background, no glow —
cross-fading to a plain ✕ in the same stroke, inside a 44px tap target whose -10px margin puts the
ICON's right edge on the 20px grid inset. The panel lost its `NAVIGATION` eyebrow, the `0N/`
numbers, the per-row ↗ arrows and the gradient divider lines (`data-menu-line` and its animation
are gone); the five links are plain left-aligned 24px rows at white 72%, and the only button is
**Start Now**, full width in our pill style. Kept: the glass panel, the green glow low right, the
footer row, the rows' blur-rise stagger and the scroll lock.

**7. The nine phone sections rebuilt to `design/mobile/S01…S10`** — a visual pass only, every GSAP
entrance kept. Type is now the boards': headings **34 / 500 / -0.02em / 1.1**, body **15 / 300 /
white 65%**, eyebrow 12 with hatch.svg, sections padded 48 (hero 44). What changed structurally:
- **S02** is the approved original: two figures ("0 h", "100%") between hairlines, then three mono
  bullets with brand dots — the desktop gradient-bordered stat card doesn't survive the narrow
  column. The old dash-drawn connector line per bullet is gone (the animation guards on it).
- **S03 / S04** replace the numbered `Panel` (accent rule + `01/ 02/ 03/`) with `Rows`: title +
  description between full-width hairlines, 16px padding, no card, no numbers. S04 keeps the mono
  face and gains the radial glow behind the machine. `panelIn` → `rowsIn`.
- **S05** the deploying pod gets the accent border; art 180 wide.
- **S06** the two deploy cards are SIDE BY SIDE (a 2-col grid) instead of stacked with a connector
  between them — stacked, that section ran past two screens. `counter()` now accepts a null number
  element, since the board shows a bar only.
- **S07** badge → drop line → board, the desktop composition's reading order (it used to be board
  → badge).
- **S08** gains the "Pricing" eyebrow the board draws; **S09** is 22 / 30px with the bigger glow.
- **S10 (FooterMobile)**: 16/500 headings, 14/300 links, 13px address, and the bottom row is now
  "© 2026 SYSTEMCTL" left / "usectl.com" right.

**8. The hero server was sliced off at the bottom while it loaded in** (TASKS item 11; the user's
screenshot was taken mid-intro). **An inline `<svg>` defaults to `overflow: hidden`, and its
viewBox IS the artwork** (`0 0 421 687`) — so `playServerIntro()`'s starting pose, which pushes the
base to `translate(0, 46px)` and the cap/slabs to −70…−120px, had those layers cut at the svg's
edge until they animated back inside. One class fixes it: `[&>svg]:overflow-visible` on the host
div. Proven by an A/B at the same frame (the base's start pose applied by hand, then the svg's
overflow toggled): `hidden` renders the base chopped flat exactly as reported, `visible` renders it
whole.
- The same rule went on **every** inline svg here whose CHILDREN get translated — the pods stack
  (desktop float AND the phone's rise-in), the machine, the state-7 agent board and the two small
  boards, plus the phone's `data-m-pods` / `data-m-machine` / `data-m-agent` hosts. The machine's
  own leg clip-paths are INNER groups and keep clipping normally (they are what makes the legs
  slide out of the platform underside).
- Verified frame by frame through the first 1.2s at 1920×1080 and at 1280×620 (where `fitStage`
  scales the stage): the base is whole in every frame. States 2-8 re-screenshotted afterwards —
  identical to before, nothing that used to be clipped now leaks.

**9. Phone: the hero server now fits the FIRST screen, and the pods art is not a thumbnail**
(TASKS item 13).
- **S01.** At a fixed `width: m(270)` the 421×687 artwork is ~440 tall, so after the header, the
  eyebrow, a 3-line heading, a 5-line paragraph and the buttons, the green-lit base fell below the
  fold. Nothing clipped it — it simply did not fit. The art is sized by the space that is left
  instead: the hero section is `min-height: calc(100svh - var(--header-h))` and a flex column, and
  the server block is the flex child that takes the remainder.
  - Inside it, the sizing is HEIGHT-driven: an `absolute inset-0` layer (that is also
    `[data-m-server]`, so the CSS load-in and float still drive it) holds a box with
    `height: 100%` + `aspect-ratio: 421/687`, so the width simply follows. **`h-full` on a plain
    child of the flex item does NOT work** — a percentage height needs a parent with a definite
    height, and the box fell back to the column's full width (350px) and 571px tall, overflowing
    exactly as before. Pinning it to an `inset-0` layer is what makes the percentage resolve.
  - The band is `max-height: m(441)` (= the old 270-wide look, so a tall phone is unchanged) and
    `min-height: min(m(310), max(m(220), 32svh))`. The spec's floor was a flat 190px wide (310
    tall), but on a 375×667 iPhone SE the copy alone leaves ~228px under the header, so a hard
    floor would have defeated the whole point; the `32svh` term only bites on short screens, and
    the `m(220)` term stops it collapsing on a LANDSCAPE phone — there the section grows past the
    viewport and the page scrolls, which is what the spec asks for.
  - Measured, settled AND mid-load-in (the float's 6px is inside the bottom gap):
    390×844 → 239×390 (bottom 827/844), 375×667 → 140×228 (651/667), 360×780 → 218×356 (764/780),
    430×932 → 268×438 (914/932) — all fully on the first screen. 740×360 landscape: the server
    stays 175 wide and the section grows to 715, i.e. it scrolls. Desktop reduce-motion (which
    renders this same build) at 1920×1080: 340×555, bottom 1065/1080.
- **S05.** The pods stack went `m(180)` → **`m(280)`** (~72% of a 390 screen) — at 180 it read as a
  thumbnail in the middle of the section. The Stacks pieces went `m(220)` → **`m(260)`** for the
  same reason; Machine (330), Deploy board (250) and Agent (300) were already in the 250-330 band
  and are untouched.

**Verified** (production build, real Chromium): nav all four targets (11439 / 3859 / 10168 / 2089)
with the right hash, the logo, the `/#pricing` deep link (11439), the calculator inside the pin,
End / Home / PageUp / PageDown, reduce-motion at 1920 (pinned hidden, stacked shown, 9 headings,
`#pricing` lands 112px under the header) and at 390, the nine-section phone sweep (every entrance
completes, no element left faded), the burger menu at 390 and 820, the subscribe flow on both
footers, and no horizontal overflow at 3440 / 2560 / 1920 / 1600 / 1440 / 1280 / 1024 / 820 / 430 /
390 / 360. **Zero console errors and zero CSP violations anywhere.** `tsc` / `eslint` /
`next build` clean.
- Harness note, re-confirmed: the synthetic wheel "flick" skips a state every few runs. It does the
  same on an UNMODIFIED HEAD build (checked by temporarily restoring `HeroSectionClient.tsx` from
  git and re-running the identical script: HEAD skipped state 9 in 2 of 3 runs, 5 in one of them) —
  so a gesture "failure" from that script is the harness, not the page. The deterministic checks
  (the Scroll Down pill, nav clicks, the keyboard) hit every snap exactly.

## Reload / refresh robustness + header Start Now sized like the scene's pills (2026-11-06)

Three user reports, all reproduced in real Chromium (dev + prod build) before fixing:

- **Texts written over each other / pages coming back empty after a refresh** (e.g. The Machine →
  refresh → Features showed both columns + the Machine dome). Cause: `onRefresh` ran
  `tl.invalidate()` while the timeline was parked mid-way; invalidate drops every tween's recorded
  START values and each re-records them from what is on screen at its next render — so every
  `.to()`/`.set()` behind the playhead took the CURRENT page as its "start" and never hid it again
  going back. ScrollTrigger refreshes on resize, the late `load` event after a reload, font swaps —
  hence "sometimes". Fix: `tl.time(0, true); tl.invalidate(); tl.time(t, true)` (rewind first so the
  re-record happens against the real initial page; both seeks suppress events so no 6/7 gate
  re-fires). Verified: resize on every page then a full down/up walk is pixel-identical to a clean
  run (only the float / cursor differ). **Rule: never invalidate this timeline away from 0.**
  - The user had proposed putting the section in the URL so a refresh "knows what to load" — that
    already existed (`#the-machine` etc. + `sessionStorage` `usectl:state`); the page was always
    restored correctly, it was the timeline state that was corrupted.
- **Refresh on Pricing, scroll at once → landed on section 2 (down) / stayed on the hero (up).**
  Cause: the restore waits (≤30 rAF) for the pin spacer before landing, and during that window
  `stateIndex` was still 0, so the wheel driver stepped from the hero. Fix (HeroSectionClient):
  `restoringPage` window — `stateIndex` is set to the saved page immediately; wheel/arrow input in
  the window is swallowed but its direction remembered (`pendingDirRef`, a REF because dev
  StrictMode builds the scene twice and the first build can catch the push) and played from the
  restored page once it has landed (gesture bookkeeping kept so the swipe's tail isn't a 2nd push).
  A header/logo jump in the window aborts the restore (`restoreAborted`).
- **The hero flashed for ~1s before the restored page.** `layout.tsx` now has a tiny inline
  pre-paint script (`RESTORE_HIDE_SCRIPT`; CSP already allows inline) that sets
  `html[data-restoring]` when a desktop reload/deep link will restore a page > 0 (same <1024 /
  reduced-motion guards as the scene); `globals.css` hides `[data-hero-stage]` under it;
  `revealStage()` fades the stage in once the restore lands (or at once when there's nothing to
  restore). 4s self-removal as a safety net. `<html suppressHydrationWarning>` for the attribute.
  The storage key is shared as `STATE_STORAGE_KEY` in `src/lib/nav.ts`.
- **Header "Start Now"**: same HEIGHT as the scene's pills (s(48)), width kept at the Figma 132
  (user: "width ისევ ისე, height დაამთხვიე"). `.header-cta` (globals.css) is on `--sh` with NO
  height floor, so on smaller screens it shrinks together with the scene's buttons (user asked for
  that); width/text shrink too but floor at 104px / 12px so the label fits. Measured: header vs
  section height equal at 2560/1920/1680/1440/1366/1280/1024 (64/48/42/36/32.9/30.6/25.6).

## The address bar names the page you are on (2026-11-06)

User: when the section changes by scroll, the URL should say where we are. `SECTION_HASHES`
(`src/lib/nav.ts`) is the one list, index = page: `""` hero (clean URL), `#build`, `#features`,
`#the-machine`, `#pods`, `#deploy`, `#agents`, `#pricing`, `#start` (closing CTA), `#contact`
(footer). The four nav hashes are unchanged; `STATE_BY_HASH` is its inverse (deep link, refresh,
hand-typed hash, the pre-paint hide script).

- Desktop: `rememberState()` now WRITES the page's hash on every page change (it used to only drop
  a stale nav hash) — `replaceState`, so no Back-button entries and no `hashchange` re-jump. The
  pin's onUpdate footer/state-9 adoption calls it too. Restore/deep link accept the footer
  (`FOOTER_INDEX`); `goToHash` glides to the footer for `#contact` (jumpToState clamps to LAST).
- Mobile (`HeroMobile`): ids added to the four unnamed sections (+ `scroll-mt`), `id="contact"` on
  `FooterMobile`; a rAF-throttled scroll listener sets the hash of the section whose top has passed
  40% of the viewport. Nothing runs at mount, so a deep link's own anchor jump is respected.
- Verified (Chromium): desktop down/up through all 10 pages gives the right hash each step and
  `history.length` doesn't grow; opening each hash fresh lands there, a step up + refresh keeps
  the new page; header nav still works. Mobile 390×844: scroll down yields the 10 hashes in order,
  top clears it, `/#pods` `/#pricing` `/#contact` open on their sections.
- **Open:** GA4 "page changes based on browser history events" listens to `replaceState`; whether
  a hash-only change produces a `page_view` couldn't be tested here (googletagmanager is blocked
  from the sandbox). Once GA is live, check DebugView while scrolling: if every section becomes a
  page_view, either untick that option or keep it deliberately as a "how far do people get" metric.

## Georgian is live at /ka — dictionary, routes, font, switcher (2026-11-07, branch `multi-languages`)

Steps 1-3 of the multi-language plan, built in one pass on the CURRENT architecture (the agreed
order: Georgian first, the per-section split afterwards). `/` is unchanged; `/ka` is the same page
in Georgian. Both are **prerendered** — `next build` reports `○ /` and `○ /ka`, plus a share card
each. Verified end to end in real Chromium against the production build; `tsc` / `eslint` /
`next build` clean and `npm run dev` starts cleanly.

**1. Every visible string now lives in `src/lib/i18n/`.**
- `en.ts` is the source of truth AND the contract: `export type Dict = typeof en`, so a missing or
  extra key in `ka.ts` is a TypeScript error, not a runtime blank.
- `ka.ts` is a DRAFT from the team's `usectl-georgian-translation.md` with the editorial fixes
  agreed on 2026-11-06 (one word for deploy — "გაშვება"; "ობიექტების საცავი", not the file's wrong
  "ობიექტური"; "ფასი", not "გადასახადი" = tax; shorter eyebrows/headings so the fixed-width columns
  hold). **The user supplies the approved copy later**, which is why the whole file is meant to be
  replaced wholesale and nothing else in the repo contains Georgian.
- `index.ts` — `LANGS` / `Lang`, `LANG_SEGMENT` (`en: ""`, `ka: "ka"`), `HTML_LANG`, `getDict`,
  `langPath(lang, hash?)` and `fill()` for `{name}` placeholders. The dict crosses the
  server→client boundary as a prop, so it must stay plain JSON — no functions in it.
- Headings the design breaks over two lines are ARRAYS (one entry per line), rendered by a small
  `Lines` component as `text<br/>text`. That is byte-identical to what was there, which matters
  because `splitWords()` walks those text nodes — and it lets a translation break where its own
  text wants to.
- Geometry was separated from copy in the module constants: `CALLOUT_LABELS`, `PANEL_ITEMS`,
  `PANEL4_ITEMS`, `PODS` and `PRICING_ROWS` keep their numbers and lose their text, which now comes
  from the dictionary index-matched (`t.s2.callouts[i]`, `t.s5.podDescs[i]`, …).
- `nav.ts` holds `NAV_ITEMS` (key + href + state) and builds labels per language through
  `navLinks(t)` / `footerNavLinks(t)` — the header, the burger menu and BOTH footer columns now
  come from one list instead of three hand-copied arrays.

**What deliberately STAYS ENGLISH in every language** (user's call, and the code comments say so at
each site): the terminal windows (title bar + typed rows — `git push origin main`,
`Code push detected: commit-a7f3d`, `usectl agent attach …`), the pod/deploy card titles and
statuses (`[ POD // API ]`, `RUNNING v1.4.2`, `DEPLOYING ... v2.1.0`, `BUILD: IN-PROGRESS`,
`[ ✓ LIVE // v2.1.0 ]`, `HTTPS Active`, `POD // AI AGENT`), and the uppercase mono spec labels
(`USECTL MANAGED INFRASTRUCTURE`, `MACHINE BOUNDARY`, `DEDICATED RESOURCES`, `ENVIRONMENT CONFIG`).
Three reasons: it is a real CLI/dashboard mock, there is no good Georgian monospace face, and those
are exactly the fixed-width windows that would wrap. Their state-4 DESCRIPTIONS are translated, so
each row reads "01/ MACHINE BOUNDARY" + Georgian — flip-able in one line if the team disagrees.

**2. Routing — two ROOT layouts, no dynamic segment.** This took three attempts, worth recording:
- Next's own i18n guide (`node_modules/next/dist/docs/01-app/02-guides/internationalization.md`)
  proposes `app/[lang]` + a proxy redirect. Rejected: it turns `/` into `/en` (the indexed URL) and
  reintroduces dynamic rendering, which the CSP and the CDN caching in next.config.ts avoid on
  purpose.
- `app/[[...lang]]` (optional catch-all, `generateStaticParams` → `[]` and `["ka"]`) built fine
  until the share-card files were added, then **`Optional catch-all must be the last part of the
  URL in route "/[[...lang]]/opengraph-image"`** — an optional catch-all may not have ANY child
  route, and `opengraph-image` / `twitter-image` are child routes. (`next dev` fails the same way
  with a Turbopack panic.)
- Final shape: **route groups with one root layout each** — `app/(en)/{layout,page,opengraph-image,
  twitter-image}.tsx` → `/`, and `app/(ka)/layout.tsx` + `app/(ka)/ka/{page,opengraph-image,
  twitter-image}.tsx` → `/ka`. Only a root layout can render `<html>`, and `<html lang>` has to
  differ. The shared parts live in the private folder `app/_site/`: `shell.tsx` (the `<html>/<body>`
  tree, the fonts, `buildMetadata(lang)`, the JSON-LD and the pre-paint restore script) and
  `landing.tsx` (the page body). Each layout/page file is 5-10 lines, so the two languages can't
  drift.
- **Icons had to move.** With no `app/layout.tsx` there is no root segment for `app/icon.svg` /
  `app/favicon.ico`, and the same file can't sit in both groups (two routes, one URL). They are now
  `public/icon.svg` + `public/favicon.ico`, declared explicitly in `metadata.icons`. Verified in the
  HTML of both pages.
- Navigating between two root layouts is a FULL page load — which is what the language switch
  wants anyway (the pre-paint restore script has to run).

**3. Georgian font.** `Noto_Sans_Georgian` (next/font/google, `preload: false` — `/` never uses it).
It is **appended** to the stacks under `html[lang="ka"]`, not substituted:
`--font-heading: var(--font-space-grotesk), var(--font-noto-georgian), sans-serif`. A font stack
resolves per GLYPH, so Latin runs (usectl, Kubernetes, vCPU, $15.10) still render in Space Grotesk
and only Georgian letters come from Noto — numbers and prices look identical in both languages.
- **Trap that cost a build**: the fonts were in `@theme inline`, and `inline` bakes the value
  straight into every utility (`.font-heading { font-family: var(--font-space-grotesk) }`), so
  overriding `--font-heading` did nothing — `/ka` silently rendered Georgian in the metric-adjusted
  Arial fallback. The font vars are now a separate NON-inline `@theme`; the colours stay inline.
  Measured after: `font-family` on `/ka` is the three-name stack and `document.fonts` has Noto
  loaded, while `/` is unchanged.

**4. Switcher** — `components/layout/LangSwitcher.tsx` ("EN / KA"), in the header next to Start Now
(`.header-lang`, on `--sh` like the rest of the row) and as a row in the burger menu. It navigates
with a real page load and **carries the current hash over**, which works for free because
`SECTION_HASHES` is identical in both languages: measured, `/#pricing` → `/ka#pricing` lands on
y 11439 → 11439 with the stage faded in, and back again.

**5. SEO** — `seo.ts` now holds only what never translates (`SITE_NAME`, `SITE_URL`,
`STARTING_PRICE_USD`); title/description/share-description/keywords/image-alt moved into each
dictionary's `seo` block. `buildMetadata(lang)` emits per-language title + description, canonical
(`/` · `/ka`), hreflang alternates (`en`, `ka`, `x-default` → `/`), `og:locale` en_US/ka_GE, and the
JSON-LD `inLanguage`. `sitemap.ts` lists both URLs with their `xhtml:link` alternates.

**6. The share card is bilingual.** satori needs real font FILES, so `_og/NotoSansGeorgian-{Regular,
Medium}.woff` (OFL, copied out of @fontsource, which was then uninstalled — the Space Grotesk woffs
live there the same way) sit next to the Space Grotesk pair. The Georgian card registers both
families and sets `fontFamily: "Space Grotesk, Noto Sans Georgian"`, so satori falls back per glyph
exactly like the browser. Its heading is 44 (vs 57) and the pitch 20 (vs 23): the Georgian heading
runs to three lines, and at 50 the price pill ended 2px from the card's bottom edge.

**7. Per-language geometry lives in ONE table**, `src/lib/i18n/typeScale.ts`, instead of
`lang === "ka" ? …` scattered through nine states. Only one entry was actually needed so far:
state 9's closing line is `whitespace-nowrap` with a hand-placed `<br/>`, so it cannot reflow —
measured at 1920 the Georgian line was 1773px wide (139px past the content inset) and ran off the
screen. `s9Heading` 60 → 52 for `ka`. Add an entry only when a measurement shows the English value
breaking.

**Verified** (production build, real Chromium, zero console errors anywhere):
- `/` and `/ka` both 200 and static, `/nope` 404; the English page renders exactly as before.
- All ten pages of the desktop scene walked on BOTH languages — every snap lands
  (1000 / 2089 / 3859 / 5402 / 7990 / 10168 / 11439 / 12801 / 13601), every section's hash is
  written, and a box-geometry probe reports **nothing outside the frame** in either language.
- Phone 390×844 on `/ka`: all ten sections, `scrollWidth == 390` everywhere, every entrance
  completes, burger menu in Georgian with the EN/KA row.
- Both share cards render (`200 image/png 1200×630`) and were eyeballed.
- `<html lang>`, title, canonical, hreflang, og:locale, the icon links and the sitemap all checked
  in the served HTML.

**Known, and intentionally left for the next round:** the Georgian HERO heading wraps to 3 lines
where English takes 2 (it fits; buttons sit ~100px lower), and the state-2/5 headings take 3 lines
in the narrow column. The mono panels and the phone's mono bullets render Georgian through Noto
with the mono letter-spacing — readable, slightly loose. These are copy/layout judgement calls for
the per-section pass, not bugs.

**One deliberate English change**: the state-2 paragraph on DESKTOP was missing its final period
(the phone build had it). Both now come from one dictionary entry, with the period.

### Follow-ups the same day: the Georgian header pill, and the tab icon is the real mark

- **`html[lang="ka"] .header-cta { font-size: max(10px, sh × 12) }`** (globals.css). "დაიწყე
  ახლავე" measured 113px of text + 16 arrow + 4 gap = 133 inside the design's 132-wide pill, i.e.
  it touched both borders. At 12 the content is 115 with ~9px of air each side (English: 87 in 132,
  22px each side). The pill keeps its Figma box — only the label shrank, which is what the user
  asked for; widening it is the other lever if 12 ever reads too small.
- **`public/icon.svg` is now the wave + the asterisk** — the logo WITHOUT the wordmark (user:
  "ისე როგორც logo გვაქვს: ~* … usectl არ ჩასვა"). It used to be the asterisk alone. All five
  paths are copied VERBATIM out of `public/logo/logo.svg` (its path 10, the 2px-stroked wave, plus
  paths 6-9, the asterisk bars) under ONE transform, so the mark can't drift from the logo. The
  placement maths: the pair's combined VISUAL bbox is x 0 → 48.026 (the wave's stroke adds 1 on
  each side of its 1 → 20.738 geometry — `getBBox()` ignores stroke) and y 0 → 24.278, hence
  `translate(0.5 8.164) scale(31/48.026)` inside the 32 box.
- **`public/favicon.ico` regenerated from that same SVG** (16/32/48 PNG-in-ICO). The pipeline, if
  it ever has to be redone: Playwright renders `icon.svg` at each size with `omitBackground: true`,
  then a 12-line Python script writes the ICONDIR + directory entries + the PNG blobs. No image
  library needed.
  - Known and accepted: the mark is 2:1 and thin, so the **16px** raster is mushy. 32 and 48 read
    perfectly, Chrome/Firefox prefer `/icon.svg` anyway, and HiDPI tabs draw the 32px entry.
- **The contact address is `info@usectl.com`** (was `hello@`, changed on the user's call
  2026-11-07). It is now `CONTACT_EMAIL` / `CONTACT_HREF` in `src/lib/nav.ts` — the five places
  that used to hardcode it (both footers, the burger menu's footer row, the JSON-LD `email`, and
  `/api/subscribe`'s fallback destination when `SUBSCRIBE_TO` is unset) all read it from there, so
  it can't drift again. `.env.example` updated too. Verified in the served HTML of both languages:
  `info@usectl.com` is the only address on the page.

## Georgian face swapped to BPG Banner Caps; the hero is one "Book a demo" (2026-11-07, `multi-languages`)

Three asks in one round. `/` is untouched apart from the hero's button.

**1. `/ka` is set in BPG Banner Caps instead of Noto Sans Georgian.** Self-hosted (it is not on
Google Fonts) via `next/font/local` in `src/app/_site/shell.tsx` → `--font-bpg-banner`;
`globals.css`'s `html[lang="ka"]` block appends it to the three stacks exactly where Noto used to
sit, so the per-glyph split is unchanged (Latin runs — usectl, Kubernetes, vCPU, $15.10 — still
render in Space Grotesk / Geist Mono). Noto is gone from the repo entirely.
- Files: `src/app/_site/fonts/BPGBannerCaps.{woff2,woff}` + a copy of the `.woff` in `src/app/_og/`
  for the share card. They are npm `bpg-banner-caps@1.0.0`'s `bpg-banner-caps-webfont.{woff2,woff}`
  **byte for byte** — deliberately not subset or re-converted, see the licence note below.
- **`font-synthesis: none` on `html[lang="ka"]`** — the face ships ONE weight (400) and the scene is
  full of `font-medium` / `font-semibold` headings; without it the browser fakes a bold by smearing
  the outlines, which reads as a second, blurrier typeface next to the body copy. Latin is
  unaffected (Space Grotesk has real weights; synthesis only fires where a real face is missing).
- **Share card** (`_og/card.tsx`): satori needs font FILES, so the Georgian card registers the SAME
  unmodified `.woff` as both weight 500 and 300 — the light rows would otherwise find no 300 face
  and satori would drop the text. Rendered and eyeballed: 200 `image/png` 1200×630, no tofu.
- **`typeScale.ts` needed no new numbers.** BPG Banner Caps measures within ~1.5% of Noto at the
  same size here (the state-9 Georgian line is 1559px wide at the existing `s9Heading: 52`, vs 1537
  with Noto — still 75px inside the 99px content inset).
- **LICENCE — must be settled before production.** The npm wrapper is MIT but **the font files are
  CC BY-NC-ND 4.0**: *NonCommercial* (usectl.com is a commercial product site, so this is not
  covered as-is — a licence from Besarion Gugushvili, or a different face, is needed),
  *NoDerivatives* (don't subset/convert — hence the byte-identical files), *Attribution*. Written up
  in `src/app/_site/fonts/NOTICE-BPGBannerCaps.md` and flagged to the user.

**2. The hero has ONE button: "Book a demo" / "დაჯავშნე დემო".** "Start Building" + "See how it
works" are gone from state 1 (`HeroSectionClient.tsx`) and from the phone hero (`HeroMobile.tsx`,
new `BookDemoButton` — `Buttons` is shared with S09, so the hero needed its own component). State 9
and the burger menu keep the original pair, and `hero.startBuilding` / `hero.seeHow` stay in both
dictionaries for them. New key `hero.bookDemo`.
- It is a `<button type="button">`; it had **no handler** until the popup below was built
  (2026-11-07, same day). It still
  rides the hero's blur-in as one block because `splitWords()`'s `whole` test is
  `field.querySelector("a,button")`, i.e. a `<button>` behaves exactly like the old `<Link>`s
  (measured: the row goes 0 → 1.00 opacity, and a nav-to-Pricing + logo click brings it back at
  opacity 1).

**3. The Georgian header pill is bigger: 174 wide / 15px** (`html[lang="ka"] .header-cta`), on
`--sh` like everything else in the row, floors `max(150px, …)` / `max(13px, …)`. Measured at 1920
with the new font: label 120.5 + arrow 17.3 (1.15em) + gap 4 = 141.8, so 174 leaves **16.1px of air
each side** — the same optical padding "Start Now" has in its 132.
- **It is gated `@media (min-width: 1280px) and (min-height: 760px)`, and that is a measured limit,
  not a guess.** Wherever the floors hold, the pill is ~46px wider than the English one, and the
  slack between the CENTRED nav and this right-hand group runs out: 352 at 2560×1440, 261 at 1920,
  155 at 1600×900, 102 at 1440×900, 52 at 1366×768, 37 at 1280×800, 46 at 760 tall — but **−2** at
  700 tall and only 8-48 at 1024-1100, because a narrow or SHORT window shrinks `--sh` (the row's
  paddings) while the px floors hold the pill's size. Below either limit the Georgian label keeps
  the old tight 12px box in the ≥1024 block.
- Pre-existing and NOT touched: at 1280×620 the lang switcher already overlaps the nav by 10px in
  English (20 in Georgian, whose nav labels are wider) — same cause, the short-window `--sh`.

**Verified** on `next start` (production build), real Chromium, **zero console/page/HTTP errors
anywhere**: both languages walked through all 10 desktop pages with PageDown at 1920×1080, 1440×900
and 2560×1440 — every snap lands, every section's hash is written, and a visibility-aware box probe
reports nothing off-screen or past the content inset in either language; the header measured at 12
viewport sizes from 3440×1440 down to 1024×768 incl. the short ones (1920×800/760, 1280×620/699/
759/760); phone 390×844 in both languages (one hero button, `scrollWidth == 390` at every scroll
position, the server still ends at 831/844 i.e. on the first screen); both share cards. `tsc` /
`eslint` / `next build` clean, `/` and `/ka` still prerendered.

## "Book a demo" opens the booking popup (2026-11-07, `multi-languages`)

The hero's single CTA now does something: it opens the team's Google Calendar appointment schedule
in a modal over the page. Nothing else changed — the header's Start Now, state 9's pair and the
burger menu still point at `SIGNUP_URL`.

- **The two URLs are in `src/lib/nav.ts`**: `BOOKING_EMBED_URL` (the `…/schedules/…?gv=true` form —
  the only one Google allows to be framed, and the one the CSP allows) and `BOOKING_URL` (the short
  `calendar.app.google/…` link, for the "open in a new tab" row).
- **`src/components/ui/BookDemoModal.tsx`** — the popup. Mounted **once**, in
  `app/_site/landing.tsx`, NOT inside either hero: the button exists in both builds (pinned desktop
  + stacked phone/reduce-motion, one of them `display:none`) and two modals in one DOM is how two of
  everything happens. The buttons only ask for it, through a window event in **`src/lib/bookDemo.ts`**
  (`openBookDemo()` / `OPEN_BOOK_DEMO_EVENT`).
  - Blurred dark overlay; the window is the page's own style (`#1b1a1a`, white/10 border, radius,
    `min(900px, 92vw) × min(780px, 88vh)` at ≥1024) with a title row + ✕ and a footer row linking
    to `BOOKING_URL` in a new tab. **Below 1024 it is full screen** (no radius, no border).
  - Closes on ✕, on Escape, and on a click on the overlay itself (`e.target === e.currentTarget`,
    so a drag that ends outside doesn't count). Focus moves to ✕ on open and back to the button
    that opened it on close; Tab is trapped inside the panel.
  - **The iframe only exists while the popup is open** — closing unmounts the whole modal, so a
    visit that never clicks the button loads nothing of Google's. Until its `load` fires, a
    "Loading the calendar…" line covers it.
  - New dictionary keys `bookDemo.{close,loading,newTab}` in both languages; the window's title is
    the existing `hero.bookDemo`.
- **The scene can't move behind it.** `isBookDemoOpen()` (the module flag in `lib/bookDemo.ts`, not
  React state — the driver runs inside a GSAP context) makes `HeroSectionClient`'s wheel AND keydown
  handlers return immediately, and the modal holds `<html>` at `overflow: hidden` on top of that, so
  nothing scrolls natively either. Measured from Pricing (y 11439): four wheel pushes plus
  ArrowDown / PageDown / End leave scrollY and the hash **unchanged**, and the first push after
  closing steps normally to state 8 (12801).
- **`next.config.ts`: `frame-src 'none'` → `frame-src https://calendar.google.com`.** Without it
  the iframe is blocked and the popup is an empty window — that line and `BOOKING_EMBED_URL`
  belong together.
- **GA**: `window.gtag?.("event", "book_demo_open")` on open, optional-call because with
  `NEXT_PUBLIC_GA_ID` unset there is no `gtag` at all.
- **Two traps worth keeping:**
  - The entrance is a **CSS animation** (`.modal-in` / `.modal-panel-in` in globals.css), not the
    usual "mount at opacity 0, flip a state one frame later". That flip needs `requestAnimationFrame`
    — and rAF is frozen while the window isn't visible, which is exactly the state a browser being
    driven by a tool is in: the first test run showed the popup open at **opacity 0**. (Same reason
    a hidden tab reports `frames: 0` and a `await new Promise(r => requestAnimationFrame(r))` loop
    hangs the evaluate — worth remembering when a measurement script freezes.)
  - Every `focus()` here passes **`preventScroll: true`**: focusing scrolls its element into view,
    and behind an open popup that is a page the visitor never asked for (an 85px drift, measured).
  - Testing note: Playwright's `locator.click()` scrolls the target into view first, so clicking the
    hero button from a deep state moves the page by itself — the mid-scene checks dispatch
    `usectl:book-demo` instead. A synthetic `new WheelEvent(...)` does NOT drive this scene at all
    (it changes the state but the scroll tween doesn't run); use `page.mouse.wheel`.
- **Verified** on `next start` (production build) in headless Chromium at 1920×1080, 1280×800 and
  390×844, on `/` and `/ka`, plus a real Chrome window at 1920: opens from both builds, the calendar
  really renders, overlay at opacity 1, `<html>` locked, ✕ focused (translated label), full screen
  at 390, all three ways of closing work, scroll position and focus restored, the scene frozen
  while open and stepping normally after, reduce-motion at 1920 (the stacked build) included.
  **Zero CSP violations and zero page errors** (the one console line is Google's own
  `requestStorageAccess` inside the iframe). No test booking was made. `tsc` / `eslint` /
  `next build` clean, `/` and `/ka` still prerendered.

## The Subscribe form posts to Web3Forms FROM THE BROWSER (2026-11-07, `multi-languages`)

The footer's Subscribe box used to POST to our own `/api/subscribe`, which then called Web3Forms
server-side. That could never have worked in production: **Web3Forms' free plan refuses server-side
submissions** ("Server side usage requires paid plan + server IP whitelisting"). The form now talks
to `https://api.web3forms.com/submit` directly from the page.

- **`WEB3FORMS_KEY` lives in `src/lib/nav.ts`**, not in env. The key is PUBLIC by design — it is an
  alias for a destination address (info@usectl.com), not a credential: it ends up in the shipped JS
  either way, it grants no access to the account or to past submissions, and all it can do is send
  mail to that one inbox.
- **`SubscribeForm.tsx`** posts `access_key / email / subject / from_name / message / botcheck` as
  JSON with `Accept: application/json`. The message carries the address, whether the terms box was
  ticked, the source, and **the page's language** (`(en)` / `(ka)`) — hence the new `lang` prop,
  passed by both footers (they already had it).
  - **A success is ONLY `res.ok && json.success === true`.** Everything else — a network failure, a
    4xx/5xx, or a 200 carrying `success: false` (wrong key, the plan's monthly cap, their spam
    filter) — sets the error status and logs Web3Forms' own `message` with `console.error`. The
    visitor is never told it was sent when it wasn't, which is the one thing a form like this must
    not get wrong.
  - The honeypot was renamed `company` → **`botcheck`**, Web3Forms' own field name, so their side
    drops a filled one too. If it is filled, submit() returns the success line WITHOUT any fetch.
  - Everything that was already there is unchanged: `EMAIL_RE`, the required consent box (with its
    deliberately-not-`disabled` button, pass of 2026-10-21), the dead button while in flight, the
    localStorage ledger (same address blocked for 24h, 60s cooldown between sends) and the locked
    field after a success. **No UI, design or copy changed** — `t.rateLimited` / `t.invalid` are
    simply no longer reachable (they stay in both dictionaries for a future server-side route).
- **`next.config.ts`: `connect-src` += `https://api.web3forms.com`.** Without it the fetch is
  blocked and the form can only ever fail — same rule as the OpenReplay line above: a new
  third-party endpoint here always needs a CSP line, and the failure mode is silence.
- **`src/app/api/subscribe/route.ts` is NOT deleted** — it carries a "not in use" header now. It is
  the whole server-side path (per-IP + global rate limits, per-email dedupe, honeypot, the
  IP-spoofing notes) ready for the day delivery moves to **Resend**, which MUST be server-side so
  the API key never reaches the browser. `.env.example` says the same: nothing in it is needed for
  the form to work today.

**Verified** in a real Chromium against `npm run dev`, on `/` and `/ka`:
- **One real submission** (`test+subscribe@usectl.com`, from the English desktop footer): POST to
  `api.web3forms.com/submit` → **HTTP 200, `success: true`** — the UI only shows the thanks line on
  that exact condition — field locked, brand-green "Thanks — we'll be in touch.", **zero** calls to
  `/api/subscribe`, **zero CSP violations**. (The response body was not captured in that run; the
  200 + the success-only code path is what proves it. A deliberately invalid key, which mails
  nothing, returned the rejection shape `400 {success: false, message: "Invalid form_id/access_key
  format…"}` — i.e. exactly what the error branch catches.)
- Ledger: the same address on `/ka` afterwards → "უკვე ჩამოწერილი ხარ…" with **0 network calls**.
- Consent gate on `/ka`: send with the box unticked → "ჯერ დაეთანხმე წესებსა და პირობებს.",
  0 network calls.
- Error path (stubbed `success:false`): red "Couldn't send it. Please try again.", field NOT
  locked, ledger NOT written, and `console.error` carrying Web3Forms' message.
- Honeypot (`botcheck` filled): success line, **0 fetches**, ledger not written.
- Mobile variant (`variant="mobile"`): builds exactly the right request, with `(ka)` in the
  message. Zero console errors anywhere besides the intentional one.
- **Harness limitation, worth knowing**: the Chrome window would not resize (fullscreen — three
  attempts, `innerWidth` stayed 1471 whatever was asked for), so the phone check was done by
  forcing the stacked footer (`[data-footer-stacked]`) rather than at a 390 viewport, and the
  "desktop" runs were at 1471 CSS px, not 1920. Nothing here is width-dependent, but a real 390
  pass is still worth doing when the window can be resized. Also re-confirmed: with the tab in the
  background `document.hidden` is true and CSS transitions freeze at `currentTime 0`, so the send
  icon reads `opacity: 0` in a measurement even when the state is correct — check
  `pointer-events` instead.

`tsc` / `eslint` / `next build` clean; `/` and `/ka` still prerendered.

## Georgian copy round: no dashes, new headings, hero paragraph width (2026-11-07, `multi-languages`)

- **No dashes in Georgian copy** (user, with screenshots: the "—" in running text read as stray
  hyphens). Every em dash in `ka.ts` became a comma/period/colon; the hero line is now "…მიგიყვანს
  მართული ინფრასტრუქტურითა…". KEPT by the user's call: "ცალ-ცალკე" (grammatical), the hyphen
  between a Latin word/number and a Georgian suffix (`usectl-ში`, `API-ების`, `$15-დან`,
  `HTTPS-ით`), and `Micro-VM`. English copy untouched.
- State 9's tail now carries its own leading separator (`en: " - we'll…"`, `ka: ", ინფრა…"`) —
  the `{" "}` before `{t.s9.tail}` was removed in both scenes so Georgian can end the blue span
  with a comma instead of " ,".
- New copy: s4 heading "თითოეული პროექტი / საკუთარი სივრცით." (h2 is `nowrap` — line 1 measures
  599 of the 600 column), s6 heading "ატვირთე კოდი. / გაშვებას ჩვენ ვუზრუნველყოფთ." (wraps inside
  the 520 column into 3 lines, same count as before), s2 body "…თავიდან არ ამოგდის."
- Hero paragraph on /ka may not run past the end of the heading's "ინფრასტრუქტურაზე ჩვენ" line:
  `TYPE_SCALE.heroBodyMax` (en 950, ka 815; that line ends at 817 at 1920) → 4 lines, widest ~731.
  Measured in Chromium with the shipped fonts; NOT yet eyeballed on the running site (next dev
  can't start in the Linux sandbox — no arm64 SWC binary).
- Nav "Machine" → **"სივრცეები"** on /ka (user's pick; header, burger menu, footers all read
  `t.nav.machine`). 88px vs 66 at 16px → the centred nav grows ~11px per side, inside every slack
  measured for the header row and inside the 1024–1279 mask's ±247 hole.

## Meta Pixel + the first consent layer this site has ever had (2026-11-07, branch `fb-trefik`)

Built from `META-PIXEL-PLAN.md` (in the repo), step by step. NOT deployed, NOT merged into
`master`, and nothing was touched in Meta Events Manager. The task: SignupClick + PageView on the
landing page, with attribution that survives the hop to manager.usectl.com — where
`CompleteRegistration` belongs and where this repo must never emit it.

**The dataset is `2506256846565789`**, from `NEXT_PUBLIC_META_PIXEL_ID` (public, but in env so the
landing page and the manager can be pointed at one dataset per environment; `NEXT_PUBLIC_*` is
inlined at BUILD time, so it must be set in the host env before the build — unset ⇒ no Pixel at
all). `.env.local` holds it locally; `.env.example` documents it.

### Consent first — `src/lib/consent.ts` + `CookieBanner`

The page had no banner and no privacy policy, while loading GA4 and OpenReplay on every visit.
Now ONE `usectl_consent` cookie (`v1:granted` / `v1:denied`, 180 days, `Domain=.usectl.com` in
production so manager.usectl.com reads the same answer, host-only on localhost/previews) gates all
three: Meta Pixel, GA4, OpenReplay. Before an answer, **nothing optional loads**.

- The value is stored **verbatim, not percent-encoded** — the manager has to compare it, and
  `v1%3Agranted` is an easy way for the other side to get that wrong. `usectl_attr`'s JSON encodes
  itself (`{`, `}`, `"` are not legal cookie-octets).
- `useConsent()` is `useSyncExternalStore` with a `null` server snapshot (= undecided = load
  nothing), so a prerendered page cannot mismatch on hydration. Note for later: this repo's eslint
  rejects the state+effect version (`react-hooks/set-state-in-effect`), which is what pushed both
  this hook and the banner's open/closed state onto derived values.
- `CookieBanner` renders nothing on the server and nothing until it knows the answer — it can't be
  an LCP candidate or move the hero. Accept and Reject are the SAME pill, size and weight.
  `PRIVACY_URL` is the one place to add a privacy policy link when that page exists.
- "Cookie settings" in BOTH footers reopens it (withdrawal). It is a `<button>` on purpose: the
  desktop scene's capture-phase handler treats any anchor with a hash href as in-page navigation.
- GA4 moved behind `<Analytics>` (gtag.js requested only after consent; a withdrawal sets
  `ga-disable-<ID>`, since gtag cannot be unloaded). `SessionReplay` waits for consent and calls
  `tracker.stop()` when the effect is torn down by a withdrawal.
- EN + KA copy in the dictionaries (`cookies.*`), no dashes in the Georgian.

### The Pixel — `src/lib/metaPixel.ts` + `src/components/MetaPixel.tsx`

Meta's base snippet is deliberately not used: it fires init + PageView before any consent, its
`<noscript>` image cannot be gated at all, and it hardcodes the id. Only the `fbq` stub is kept
(rewritten), so calls made before fbevents.js lands are queued. Module-level flags make init
idempotent — a second `init` doubles every event.

**Two findings that only a real browser produced, both worth remembering:**

1. **`fbq.disablePushState = true` is mandatory on this page.** fbevents.js patches
   `history.pushState`/`replaceState` and re-fires `PageView` on each one (`setupSPANavigation`,
   visible in the shipped source). This page rewrites the hash on every one of its nine sections
   (`SECTION_HASHES`), so a visitor who merely scrolled down sent **nine** PageViews — measured as
   `dl=…/#build`, `dl=…/#features`, … `fbq('set','autoConfig',false,<id>)` does NOT cover it
   (that is set as well, so Meta also stops auto-collecting button clicks and page metadata).
2. **Meta's BotBlocking plugin drops every event in an automated browser.** fbevents.js loads,
   `fbq` counts the event, and nothing is ever sent — no request, no console message. Pinned down
   by serving Meta's own unmodified snippet with a FAKE pixel id from the same page: the fake id's
   PageView went out, the real one's did not. The whole verification therefore runs **headed**,
   with `--disable-blink-features=AutomationControlled` and `navigator.webdriver` masked. Anyone
   re-running these tests headless will see zero events and think the code is broken.

Events: one `PageView` per real pathname change, sent on idle after hydration (so it cannot touch
LCP), and `SignupClick` (custom) from ONE delegated capture-phase `click` + `auxclick` listener.
It never calls preventDefault, never rewrites an href and never delays a navigation, so it
coexists with SessionReplay's `?lsid=` rewrite and the scene's hash navigation. `CompleteRegistration`
and `Lead` are never emitted here — `grep` the repo, they appear only in comments.

The eight links that point at `SIGNUP_URL` carry `data-cta`, typed by `CtaPlacement` in
`src/lib/nav.ts` so a typo is a compile error instead of a mislabelled event in Events Manager:
`header`, `mobile-menu`, `pricing(-mobile)`, `closing-start(-mobile)`, `closing-see-how(-mobile)`.
The phone's copies need their own names because BOTH builds are in the DOM at once. The plan's
`hero-*` names were corrected to `closing-*`: that pair now lives in state 9, since the hero's
single button is "Book a demo" — not a signup, so it gets no Meta event.

### Attribution — `src/lib/attribution.ts`

After consent, the landing URL's `utm_*` go into `usectl_attr` (JSON, `.usectl.com`, 90 days, last
non-empty touch wins, plus the `ts` of that touch) for the manager to attach to the account it
creates. Captured on mount but written only on consent: by the time the banner is answered the
address bar has usually been rewritten by the scene. **Nothing is appended to the manager links** —
a query string carrying `utm_*`/`fbclid`/`_fbp` would leak the campaign into referrers, the
manager's logs and any URL a visitor copies, and the cookie already crosses both hosts. `_fbp` /
`_fbc` are the Pixel's own cookies on `.usectl.com`; we never read or copy them.

### CSP (`next.config.ts`) — the plan's list was incomplete

`script-src` += connect.facebook.net, `img-src`/`connect-src` += www.facebook.com, as planned. Two
more came out of measuring: **`form-action` and `frame-src` for www.facebook.com** (fbevents falls
back to POSTing a form inside a hidden iframe; without them that event is silently lost) and
**connect.facebook.net in `img-src`** (it reports its own failures by loading an image from
`/log/error`, which otherwise fills the console on every event).

**Deliberately NOT allowed:** this dataset has **Open Bridge (CAPI Gateway)** enabled and tells the
browser to POST every event to `https://1c-e0e78bd7d7fd408d87142c500d5b8890.ecs.us-west-1.on.aws/events`
(fallback `https://vwdb33u4tj1q.cloud.run/events`). Until that gateway is confirmed to be usectl's
own, an unidentified third party does not get visitor event data. Nothing is lost in the meantime:
the beacon to `facebook.com/tr` carries every event (verified). Decision pending from the owner —
either add the hosts or switch Open Bridge off in Events Manager.

### Verified (production build on `next start`, real Chromium, headed)

42 checks, all green: nothing optional before a choice; Reject stays silent across a reload; after
Accept exactly ONE `facebook.com/tr ev=PageView` per page load with our id, **zero** while
scrolling through the nine sections, one more on EN → KA; one `ev=SignupClick` per CTA with the
right placement for all eight (desktop 1920 and phone 390); never CompleteRegistration/Lead; the
links still go to manager.usectl.com/login; `usectl_consent` / `usectl_attr` / `_fbp` / `_fbc` all
correct (`_fbc` derived from a test `fbclid`); the footer link reopens the banner and a withdrawal
deletes `usectl_attr` + `_fbp` and sends nothing further. A separate run with
`NEXT_PUBLIC_GA_ID=G-TEST123456` proves the GA gate: no googletagmanager before a choice or after
Reject, gtag.js + a real `page_view` after Accept, `ga-disable-*` on withdrawal. Zero console
errors and zero CSP violations throughout. `tsc` / `eslint` / `next build` clean, `/` and `/ka`
still prerendered.

**No test event reached Meta**: every request to www.facebook.com was fulfilled locally with a 1×1
gif, so the URL could be asserted without writing to the team's dataset.

Lighthouse on `/`, median of 3, baseline = the pre-work commit built in a git worktree: mobile
85 → 100 (LCP 1225 → 1214ms, TBT 583 → 61ms), desktop 90 → 89 (LCP 1052 → 1168ms), transfer
+9-10KB. The machine is noisy (the baseline's three mobile runs scored 66/85/100), so read this as
"no regression", not as an improvement.

### Still open

- **Meta Events Manager → Test Events was NOT verified** — it needs a Test Event Code from the
  owner, which was not provided, and the plan forbade touching Events Manager. Manual steps:
  Events Manager → the dataset → Test Events → copy the code, open
  `https://usectl.com/?fbclid=TEST` in a normal browser window, accept cookies, and watch PageView
  appear; then click a "Start Now" and watch SignupClick. (To send the code with the events the
  Pixel has to be initialised as `fbq('init', ID, {}, {test_event_code: '...'})`; it is not wired
  up — ask before adding it, it must never ship to production.)
- The Open Bridge decision above.
- No privacy policy page exists, so the banner links to none (`PRIVACY_URL` in CookieBanner).
- `META-PIXEL-HANDOFF.md` is the other half of this work: it tells the manager team which dataset,
  which cookies to read, which events are theirs, and the two traps above.

## Open items / TODO

- **NEXT BIG STEP — split the desktop scene into per-section components (user's idea, agreed
  2026-11-06). DISCUSS AND PLAN FIRST, no code until the user says so** ("ჯერ ვილაპარაკოთ"). When
  the user brings it up, start by drafting the plan together. What was agreed so far:
  - Why: one 14-unit GSAP timeline for all 9 pages is the root of most bugs (invalidate/seek
    corruption, `restoring7`, the state-6 ring leaking to the hero, dead zones, `ENTER_TIMES`).
    Each section should own `enter(direction)` / `leave(direction)`; a small controller holds the
    current index and drives them; refresh = mount the saved section and play its entrance.
  - Keep: the wheel/keyboard push driver (gesture detection, momentum, mid-flight turnaround,
    chained pushes) — it is architecture-independent and well tuned; it just targets sections.
  - Hard part: shared elements that MORPH across sections (hero server → Stacks two-piece →
    Machine unfold; state-6 board → AI composition) need an explicit handoff (FLIP-style), or they
    degrade to crossfades.
  - Approach: incremental, never a big-bang rewrite. Pilot = Pricing + closing CTA (no shared
    elements) on the new controller while the rest stays on the old timeline; user evaluates; then
    migrate section by section, morph pairs last. Commit a stable point before starting.
  - Mobile (`HeroMobile`) is separate and not part of this.

- **MULTI-LANGUAGE (EN / KA) — branch `multi-languages`. Steps 1-3 ARE BUILT (2026-11-07, see the
  entry above). What is still open: (a) the approved Georgian copy from the user — drop it into
  `src/lib/i18n/ka.ts`, nothing else holds Georgian; (b) the per-section Georgian layout pass
  (step 4), whose numbers belong in `src/lib/i18n/typeScale.ts`; (c) the team's call on whether the
  uppercase mono spec labels and the mono bullets should be Georgian too; (d) **a commercial
  licence for BPG Banner Caps, or a different Georgian face** — the files shipped on 2026-11-07 are
  CC BY-NC-ND 4.0 (NonCommercial), see the entry above and
  `src/app/_site/fonts/NOTICE-BPGBannerCaps.md`.** The plan as originally
  agreed, for context: Source text: `usectl-georgian-translation.md`
  (repo root, untracked — the team's translation of every visible string; review notes below).
  Proposed steps:
  1. Move every visible string out of the components into two dictionaries (`en`, `ka`); components
     read from them. Do this FIRST — it also makes the per-section split above easier.
  2. Routes: `/` stays English, `/ka` Georgian — both statically generated (no proxy/middleware:
     next.config.ts deliberately avoids nonces/dynamic rendering), `hreflang` alternates, per-language
     metadata + OG card. Section hashes (`SECTION_HASHES`) are the same in both languages.
  3. Georgian font: Space Grotesk and Geist Mono have NO Georgian glyphs (`subsets: ["latin"]`) —
     pick a Georgian face that pairs with Space Grotesk (candidates: Noto Sans Georgian, FiraGO),
     loaded on `/ka` only. Footer uses CSS `uppercase` → Georgian renders as Mtavruli; decide.
  4. Per-section layout pass in Georgian (≈30–50% longer text, wider glyphs; the scene's headline
     wraps and the fixed-width cards/callouts were tuned for English), desktop + mobile.
  5. Switcher: EN / KA in the header, in the burger menu on phones; switching keeps the current
     section (`/ka#pricing`).
  - **DECIDED with the user 2026-11-06** (the plan discussion; no code written yet):
    - **Order = Georgian FIRST, on today's architecture** (my recommendation, user: "რომელიც
      სწორია"): steps 1→2→3, then step 4's layout pass on the CURRENT components, ship `/ka`, and
      do the per-section split afterwards with both languages already known. Rationale: the split
      is a big refactor and would block the Georgian launch for weeks; step 1 (the dictionary) is
      needed either way and makes the split easier.
    - **Path = `/ka`** (ISO 639-1 for Georgian; `/ge` is the COUNTRY code). No auto-redirect by
      `Accept-Language` — the visitor chooses.
    - **Routing = optional catch-all `app/[[...lang]]/page.tsx`** + `generateStaticParams()`
      returning `[{lang: []}, {lang: ["ka"]}]` → `/` (unchanged, still the indexed English URL)
      and `/ka`, BOTH prerendered, one root layout, `<html lang>` / metadata / JSON-LD derived
      from the param, `notFound()` on anything else. Next 16's own i18n guide
      (`node_modules/next/dist/docs/01-app/02-guides/internationalization.md`) proposes
      `app/[lang]` + a **proxy redirect** — deliberately NOT used: it would turn `/` into `/en`
      (losing the indexed URL) and bring back dynamic rendering, which the CSP/caching design
      avoids on purpose. Fallback if the catch-all misbehaves: two root layouts via route groups
      (`app/(en)/page.tsx` + `app/(ka)/ka/page.tsx`).
    - **Font = Noto Sans Georgian** (Google Fonts, variable), loaded on `/ka` only.
    - **Mono / terminal / status copy STAYS ENGLISH** (user's call): `git push origin main`,
      `usectl // repository-pipeline`, `Code push detected: commit-a7f3d`, `BUILD: IN-PROGRESS`,
      `POD // API`, `RUNNING` / `DEPLOYING` / `LIVE`, `HTTPS Active`, `Status: Synchronized with
      env-prod-01`. Three reasons: it is a real CLI/dashboard mock, there is no good Georgian
      monospace face, and those are exactly the fixed-width windows that would wrap. The
      `uppercase` mono panel labels (`USECTL MANAGED INFRASTRUCTURE`, `01/ MACHINE BOUNDARY`)
      belong to the same family — CSS `uppercase` would render Georgian as Mtavruli.
    - **Copy source = `usectl-georgian-translation.md` for now**, with my review fixes applied as
      a DRAFT; the user supplies the approved final copy later ("მე მოგცემ მაგას მერე") — so the
      `ka` dictionary must stay a single file that can be replaced wholesale.
  - Two things the discussion surfaced that the original steps missed:
    - **`src/app/_og/card.tsx` is satori** — it needs an explicit font FILE, so the `/ka` link
      preview needs a Noto Sans Georgian `.woff` in `_og/` or it renders tofu boxes.
    - **Per-language geometry, not per-language `if`s**: every text column is fixed-width
      (`width: s(520)`, `maxWidth: s(460)`, `fontSize: s(56)`…) and state 9 has a hand-placed
      `<br/>` tuned to the English line break. Plan: ONE table of per-language type-scale
      overrides (2-4 numbers per state, `{en, ka}`), so the Georgian pass lives in one file
      instead of being scattered through the nine states.
  - The switcher needs no new state logic: `SECTION_HASHES` is identical in both languages and the
    reload-restore + pre-paint hide script already key off the hash, so `/ka#pricing` lands on
    Pricing by itself.
  - Open: who approves the final Georgian copy (the user will hand it over).
  - Review notes on the translation file (given to the user 2026-11-06): too formal for a landing
    page ("უზრუნველყოფს" repeated); pick ONE word for deploy ("გაშვება" > "განთავსება" on a landing);
    fixes — "დაიწყე შექმნა" → "დაიწყე ახლავე"; "ობიექტური საცავი" is WRONG ("objective") →
    "ობიექტების საცავი"/Object Storage; "ყოველთვიური გადასახადი" ("tax") → "თვიური ჯამი";
    Monthly/Annual → "თვიური / წლიური"; shorter eyebrows/headlines; keep the mock terminal / pod
    status strings (RUNNING, DEPLOYING, LIVE…) in English. Its phone-number note is outdated.

- New design build-out from scratch (user is supplying new references: `public/navigation-bar/navigation-bar.png`, `Group 1574.png`).
- `design/mobile/*.html` are the phone layout's source of truth (390-wide boards, inline styles).
  Reference material the build never imports, and **gitignored on the user's call** (2026-11-05) —
  so they live only on their machine. Ask for them again if a fresh clone needs the layout.
- **Meta Pixel / consent (branch `fb-trefik`, 2026-11-07)**: needs `NEXT_PUBLIC_META_PIXEL_ID`
  in the host env BEFORE the build; the Open Bridge CSP decision; a Test Event Code if the owner
  wants Test Events verified; a privacy policy page for the banner's link; and the manager side
  (`META-PIXEL-HANDOFF.md`). Not deployed, not merged.
- **GA4 is in the repo and committed** (`layout.tsx` + `@next/third-parties`), but it only emits
  anything when **`NEXT_PUBLIC_GA_ID`** is set in the host's environment (production AND preview) —
  until then the live site carries no analytics. Since 2026-11-07 it also waits for the cookie
  banner, so a visitor who declines produces no GA traffic even with the id set. Same for `GOOGLE_SITE_VERIFICATION`, and the
  sitemap (`https://usectl.com/sitemap.xml`) still has to be submitted in Search Console.
- Content still unanswered by the team: the footer credit really says **SYSTEMCTL** (verbatim from
  the design), and `+995 511 11 11 11` is a placeholder — now hidden behind `SHOW_PHONE`, flip it
  back to `true` once there is a real line.

- **Subscribe form / Web3Forms** (see the entry above):
  - **Check that the test mail actually arrived** at info@usectl.com — `test+subscribe@usectl.com`,
    subject "usectl landing — new subscriber: …". Web3Forms answered 200 `success: true`, but only
    the inbox proves delivery.
  - **The free plan caps submissions per month (250)**; past the cap Web3Forms answers
    `success: false` and the visitor sees "Couldn't send it." Worth watching once the site has
    traffic, and worth a paid plan or the Resend route before it bites.
  - **The browser-side path has no rate limit of its own** beyond the localStorage ledger, which a
    determined caller simply skips — anyone can POST to Web3Forms with that public key regardless.
    Their spam filtering is the only server-side protection now. If that turns out not to be
    enough, the answer is the route that already exists: switch delivery to Resend via
    `/api/subscribe` (set `RESEND_API_KEY` + `SUBSCRIBE_TO`, point the form's fetch back at it),
    which restores the per-IP / global / per-email limits documented in that file.
  - A real **390-wide phone pass** of the form is still outstanding (the test window could not be
    resized — see the entry above).

## Visitors from Georgia land on /ka (2026-11-07, `src/proxy.ts`)

- `src/proxy.ts` (Next 16's renamed middleware, `matcher: "/"`) reads Cloudflare's `cf-ipcountry`
  header — Cloudflare fronts usectl.com and adds it to every request, no dashboard setting needed
  (checked: `/cdn-cgi/trace` reports `loc=GE`; `/` is `cf-cache-status: DYNAMIC`, so every request
  reaches the pod). `GE` on a bare `/` page load → **307 to `/ka`** (query string kept, the browser
  keeps the #hash), `Cache-Control: private, no-store` on the redirect.
- Never redirects: a visitor with the `lang` cookie (`LANG_COOKIE`; the EN / KA switcher now writes
  it for a year on click, so a Georgian who picks English stays on English), any path but `/`,
  fetch/RSC requests (`sec-fetch-dest` other than `document`), crawlers (UA regex), or a request
  without the header (local dev).
- `next build` still reports `○ /` and `○ /ka` (static) plus `ƒ Proxy`. Verified against
  `next start` with forged headers: GE → 307 /ka, GE+cookie → 200, US → 200, no header → 200,
  GE fetch → 200, GE Googlebot → 200, GE /ka and /robots.txt → 200.
- After deploy, check from Georgia in a fresh/incognito window: `usectl.com` → `/ka`. If it does
  NOT redirect, the platform's ingress isn't passing `cf-ipcountry` to the pod.
