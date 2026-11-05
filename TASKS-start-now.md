# Tasks: Start Now buttons, Scroll Down, footer socials, subscribe send icon

Spec from the user, 2026-11-05. Read `PROJECT.md` first (the timeline traps live there).
Design references are the screenshots the user shared; the numbers below are from Figma.
Every change must work on desktop (pinned scene, `HeroSectionClient.tsx`) AND on phone
(`HeroMobile.tsx`, `FooterMobile.tsx`, `MobileMenu.tsx`).

New assets (currently untracked — commit them with this work):
`public/footer/arrow-input.svg`, `public/footer/instagram.svg`, `public/footer/fb.svg`.

---

## 1. "Start Now" button in the Header

- Right side of the header, opposite the logo (Figma: left 1606px, top 27px on the 1920 frame).
- Label `Start Now` + the ↗ arrow (reuse the existing `ButtonArrow`).
- Links to `SIGNUP_URL` (`https://manager.usectl.com/login`, `src/lib/nav.ts`) — same tab, like
  the other Start buttons.
- Box: width 132, height 44, border-radius 40px, border 1px, padding 15px 22px, opacity 1.
- Text: Space Grotesk, weight 500 (Medium), 14px, line-height 100%, letter-spacing 0.
- Scale with the existing `s()` / `--s` system like everything else on desktop, not raw px.
- Hover/animation: identical to the hero's `Start Building` button
  (`border-white/25 … transition-colors hover:border-brand hover:text-brand`).
- Phone: the burger menu already has a Start Building link — leave it; only add to the header
  bar if it fits next to the burger (check at 390px).

## 2. "Start Now" in every section

- Under the paragraph of EVERY state's text column (screenshots: "You came here to build",
  "Your Stacks, in one place", "Give every project its own space", "Run each part
  independently", "Push your code", "Give your agent a place to work", and the closing
  "What will you build next?" next to "See how it works").
- Same size, font and hover as the header button (section 1) — one shared component, not
  copies.
- Links to `SIGNUP_URL`.
- The buttons belong to their state's text column, so they must fade in/out WITH that column
  in the timeline — no button may stay visible from a previous state (watch the known
  "two states overlap" bug in PROJECT.md).
- Phone: add the same button to each stacked section in `HeroMobile.tsx`.

## 3. "Scroll Down ↓" button in every section

- Pill button `Scroll Down ↓` (screenshot 3), same font/size family as Start Now but quieter
  (dimmer border/text, as in the screenshot).
- Click = go to the NEXT state. Desktop: `jumpToState(current + 1)` — the same path the nav uses
  (it already suppresses the seek correctly; do NOT scroll the page manually).
- Hidden on the last state (nothing below it). Keyboard focusable, `aria-label="Scroll to next
  section"`.
- Phone: scroll to the next stacked section (`scrollIntoView({behavior:"smooth"})`).
- Respect reduce-motion (instant jump).

## 4. Footer logo → hero

- Decision: land directly on the hero (state 0) — do NOT scroll back through all states.
- NOTE: `HeroSectionClient.tsx` `onNavClick` already does `jumpToState(0)` for any same-page
  link to "/" (header AND footer logo). Verify it actually works from the footer on desktop
  and on phone; only fix if it doesn't. Phone: should go to the top hero section.

## 5. Footer contacts: hide the phone number, add Instagram + Facebook

- Hide `+995 511 11 11 11` (`tel:` link) in BOTH `Footer.tsx` and `FooterMobile.tsx`.
  Keep the markup behind a flag in `src/lib/nav.ts` (e.g. `SHOW_PHONE = false`), the same way
  `SHOW_STORE_BADGES` works, so it can come back with one line.
- Social row (screenshot): X, Instagram, Facebook — in that order, same size/spacing/opacity
  as the existing X icon.
  - Instagram: `/footer/instagram.svg` → `https://www.instagram.com/usectl.dev/`
  - Facebook: `/footer/fb.svg` → `https://www.facebook.com/profile.php?id=61596061747860`
  - Add `INSTAGRAM_URL` and `FACEBOOK_URL` to `src/lib/nav.ts` next to `X_URL`.
  - `target="_blank" rel="noopener noreferrer"`, `aria-label` on each, same hover as X.
- Optional: add them to `sameAs` in the JSON-LD in `layout.tsx` (SEO) if X is there.

## 6. Subscribe form: send icon that shows progress

- Icon: `/footer/arrow-input.svg`, inside the email field on the right.
- Hidden while the field is empty.
- As soon as the user starts typing → icon appears in the usectl brand color at 40% opacity
  (e.g. while typing `ngogit`).
- When the value is a complete, valid email (e.g. `ngogit@gmail.com`) → 100% opacity.
  Use the same validity rule the form already uses for submit.
- Smooth opacity transition (~150–200ms).
- Clicking the icon submits the form (it is the submit button: `type="submit"`,
  `aria-label="Subscribe"`). Keep the existing consent-checkbox behaviour in `SubscribeForm.tsx`.
- The SVG is white/fixed-color — recolor via CSS `mask-image` + `background: var(--brand)` (or
  inline the path with `currentColor`), not a second asset.
- Both desktop and phone footers.

---

## Done when

- `tsc`, `eslint`, `next build` clean; zero console errors / zero CSP violations
  (`next.config.ts` — instagram/facebook are plain links, no CSP change should be needed).
- Full regression from PROJECT.md is green (wheel journey down + up, nav targets, logo,
  `/#pricing`, calculator, keyboard, reduce-motion, phone sweep + burger, subscribe end to end).
- Plus: every Start Now opens manager.usectl.com/login; every Scroll Down lands on the next
  state; none visible in the wrong state; phone number gone; three social icons with correct links.
- Log the work in PROJECT.md and update its stale "Open items / TODO".
