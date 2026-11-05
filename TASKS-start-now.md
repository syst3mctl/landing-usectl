# Tasks: header Start Now button, Scroll Down, footer socials, subscribe send icon

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
- Phone (< 1024px): NOT in the header bar — the phone header is logo + burger only. On phone
  Start Now lives inside the burger menu (see section 9).

## 2. (removed) No Start Now in the sections

- User decision 2026-11-05: Start Now goes ONLY in the header (desktop) and the burger menu
  (phone). Do NOT add it to the section text columns. The existing hero buttons
  (`Start Building` / `See how it works`) stay as they are.

## 3. "Scroll Down ↓" button in every section

- Pill button `Scroll Down ↓` (screenshot 3), same size/font as the header Start Now but quieter
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
- The SVG is already brand green (`fill="#11A32A"`) — use it as-is and drive only its
  `opacity` (0 → 0.4 → 1). No second asset.
- Both desktop and phone footers.

---

## Done when

- `tsc`, `eslint`, `next build` clean; zero console errors / zero CSP violations
  (`next.config.ts` — instagram/facebook are plain links, no CSP change should be needed).
- Full regression from PROJECT.md is green (wheel journey down + up, nav targets, logo,
  `/#pricing`, calculator, keyboard, reduce-motion, phone sweep + burger, subscribe end to end).
- Plus: the header Start Now (and the burger-menu one) opens manager.usectl.com/login; every Scroll Down lands on the next
  state; none visible in the wrong state; phone number gone; three social icons with correct links.
- Log the work in PROJECT.md and update its stale "Open items / TODO".

---

# Mobile fixes (user, 2026-11-05, from an iPhone)

Reference screenshots: the current usectl burger menu and vercel.com's mobile menu. Target =
Vercel's menu layout, with usectl's colours and its green glow kept. New asset (untracked,
commit it): `public/mobile/burger.svg` (3 lines, `#11A32A` at stroke-opacity 0.8).

## 7. BUG — phone: header logo doesn't return to the top

- Repro (iPhone Safari, usectl.com): scroll down to Pricing → tap the header logo → nothing
  happens.
- Cause (likely): the `href="/"` interception lives in `HeroSectionClient.tsx` `onNavClick`
  (`jumpToState(0)`), and that scene is skipped below 1024px / reduce-motion (line ~629). On
  phone the click is a same-route Next `<Link>` → no navigation, no scroll.
- Fix: on < 1024px (and reduce-motion), a click on any same-page "/" link (header logo, footer
  logo, burger-menu logo) → `window.scrollTo({ top: 0, behavior: "smooth" })` (instant under
  reduce-motion), clear the hash with `history.replaceState`, close the burger menu if open.
- Test on a real-size phone viewport (390×844) from every section, including from inside the
  open menu.

## 8. Burger icon in the header

- Replace the current 3-span green-box button with `public/mobile/burger.svg`
  (brand green at 80% opacity). No bordered box, no tinted background, no glow — just the icon,
  as Vercel does. Keep the 40×40 tap target.
- Open state: a plain ✕ in the same colour/opacity, same stroke width (2, round caps). A short
  cross-fade/rotate between the two is fine; keep `aria-label`/`aria-expanded`.

## 9. Burger menu = Vercel's layout

- Remove the `NAVIGATION` eyebrow label.
- Remove the `01/ 02/ 03/ 04/ 05/` numbers.
- Remove the per-row ↗ arrows.
- Remove the gradient divider lines under each item (`data-menu-line`) — and their animation.
- Items: The Machine, Agents, Features, Pricing, Documentation — left-aligned, Space Grotesk,
  ~24px, white/70, hover/active → white; ~12px vertical rhythm between rows (Vercel spacing).
  Documentation still opens docs in a new tab.
- Buttons: ONLY one — **Start Now** (`SIGNUP_URL`). Remove `Start Building` and `See how it
  works` from the menu. Full width, ~32px under the list, in OUR pill style (user rejected the
  Vercel white fill): height 44, border-radius 40px, 1px border `white/40`, transparent fill,
  Space Grotesk 500 14px, text `#e6e6e6`, + the ↗ `ButtonArrow`; hover/press → `border-brand
  text-brand` like every other pill on the site.
- Keep the green radial glow at the bottom-right of the panel (user: "ლამაზია") and the blurred
  dark panel background.
- Keep the small footer row (`hello@usectl.com` · `© 2026 SYSTEMCTL`) at the bottom.
- Keep the existing open/close animation for rows (`data-menu-row`) and body-scroll lock.

Design for sections 8–9: `design/mobile/M1-Header-closed.html` and `design/mobile/M2-Menu-open.html`.

## 10. Phone section designs (approved 2026-11-05)

**The design files are in the repo: `design/mobile/*.html`** — one 390px-wide board per
section, plain HTML with inline styles, so every size/colour/spacing is readable straight from
the markup (images already point at the real `/public` paths). These are the source of truth
for the phone layout; open them in a browser at 390px to compare. They are reference only —
not part of the app: don't import them, and add `design/` to `.gitignore` unless the user
wants them committed.
- `M1-Header-closed.html`, `M2-Menu-open.html` — header + burger menu (sections 8–9)
- `S01-Hero.html` … `S09-CTA.html` — the nine stacked sections in `HeroMobile.tsx`
- `S10-Footer.html` — `FooterMobile.tsx` (phone hidden, X/Instagram/Facebook, send icon)
- `S08-Pricing.html` / `S10-Footer.html` have small demo scripts (calculator, icon opacity)
  — the logic already exists in the app; take only the look.
Keep every existing GSAP entrance animation in `HeroMobile.tsx`; this is a visual pass.
Approved: all section boards as drawn, with S02 = the ORIGINAL "02 You came here to build"
(stats row "0 h" / "100%" between two hairlines + the three mono feature bullets — NOT
version B), Footer = the original "10 Footer" (NOT version B), the closed header and the open
menu.
S03 Stacks AND S04 The Machine: the three items in each (Application Services / Storage /
Background Jobs; Machine Boundary / Dedicated Resources / Environment Config)
are NOT a card — no border box, no background, no radius, and NO `01/ 02/ 03/` numbers on
phone. Just title + description rows separated by full-width hairlines
(`border-top/bottom 1px white/9%`), 16px vertical padding, no side padding.
Every section except the last (closing CTA) gets the Scroll Down pill. Type: headings 34px /
500 / -0.02em, body 15px / 300 / white 65%, eyebrow 12px with hatch.svg.

## 11. BUG — desktop hero: the server is cut off at the bottom while it loads in

- Repro: open `localhost:3000` (or usectl.com) fresh, on the hero. While the heading is still
  blurring in, the exploded server on the right (`public/section-hero/new-server.svg`, inlined
  into `serverSvgRef` in `HeroSectionClient.tsx`) has its bottom slab sliced off flat; it only
  looks whole once the load-in finishes. User screenshot taken mid-intro.
- Cause (verified in the code): `playServerIntro()` (~line 2622) animates the layers with CSS
  `translate` — the base starts at `translate: 0px 46px` (pushed BELOW the artwork) and the
  cap/upper/lower start at -70…-120px (pushed ABOVE). These are children of an inline `<svg>`
  whose viewBox is exactly the artwork (`0 0 421 687`), and an inline svg defaults to
  `overflow: hidden` — so anything translated outside the viewBox is clipped at the svg's
  edge. The base's lower 46px are cut until it rises into place.
- Fix: let the svg paint outside its box — add `[&>svg]:overflow-visible` to the
  `serverSvgRef` div's className (next to `[&>svg]:block …`), or set
  `svg.style.overflow = "visible"` where the effect grabs the inline svg. Check nothing else
  relied on that clip (the state-2 float and the 2→3 greening reuse the same layers — they
  should only look better).
- Check the same thing on every other inline svg that gets per-layer translates
  (`machine-section/opened.svg` in state 4 — it has its own clip-paths for the legs, keep
  those; `section-5/server2.svg` pods float on desktop AND phone in `HeroMobile.tsx`; the
  state-7 agent svg). Any that clip during their entrance get the same `overflow: visible`.
- Verify: reload on the hero at 1920×1080 and at a short window (1280×620, where `fitStage`
  scales the stage) — record a few frames of the first second: the base must be whole in every
  frame as it rises.

## 12. Scroll Down: no blink on click + a press ripple (MUI-style)

User report (desktop, 2026-11-05): clicking `Scroll Down` makes the pill itself blink — while
the section changes it looks like a NEW Scroll Down fades in / the pill re-enters. It should
stay rock-steady in place while the page changes under it, and the click itself should give
tactile feedback like MUI's ripple.

### 12a. The blink — cause (verified in the code) and fix

- The pill is already one persistent element (good), but it is rendered INSIDE `stageRef`.
- `onScrollDownClick` → `jumpToState(stateIndex + 1)`, and `jumpToState` (~line 2076–2085)
  does `window.scrollTo(…)` and then
  `gsap.fromTo(stageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })` — it fades
  the WHOLE stage from 0 to hide the cut. The pill is part of the stage, so it vanishes and
  fades back in on every click. That is the blink.
- Fix, both parts:
  1. **Scroll Down should not use the jump path at all.** Going to the very next state is
     exactly what one wheel flick / ArrowDown does: call `goToState(stateIndex + 1)` (~line
     1950) — the real animated crossing with the tuned `CROSSING_SECONDS`, no seek, no stage
     fade. Respect the existing `transitioning` / flight guards so double-clicks during a
     crossing behave like a double flick (queue or ignore — same as the wheel). On the
     footer hop/last state it is already hidden. (Nav items keep `jumpToState` — they skip
     many states, the fade is right for them.)
  2. **Keep the pill out of any stage fade anyway**: move the `<button ref={scrollDownRef}>`
     out of `stageRef` to be a sibling inside the pinned `<section>`, positioned to match
     (`bottom` of the stage area; it must follow `fitStage()`'s scale/offset on short
     windows — either apply the same `fit` factor to it, or anchor it to the section bottom
     with an `s()` offset and check it at 1920×1080, 1280×620 and 2560). Its only visibility
     changes are the existing `syncScrollDown()` hide on the last state / footer.
- Phone (`HeroMobile.tsx`): same rule — the pill must not re-animate with the section's
  `data-m-copy` entrance when it scrolls to the next section. Check it.

### 12b. Press ripple (MUI-style)

- On `pointerdown`, a circle grows from the exact press point to cover the pill and fades
  out (MUI `TouchRipple` feel), clipped to the pill's rounded shape.
- The project ALREADY has this: `pressRipple()` + `.press-ripple` keyframes in
  `globals.css` (used by the pricing +/− buttons). It is duplicated in `HeroSectionClient.tsx`
  (~line 358) and `HeroMobile.tsx` (~line 51) — move it to one shared helper (e.g.
  `src/lib/pressRipple.ts`) and use it from all three places.
- On the pill: add `relative overflow-hidden` (the ripple must be clipped by the
  `rounded-full` border — `overflow-hidden` + `isolate` so Safari clips it to the radius),
  `onPointerDown={pressRipple}`. Colour: a softer, neutral-green ripple than the pricing
  one fits the quiet pill — e.g. `rgba(17,163,42,0.25)` → transparent; make the colour a CSS
  variable on `.press-ripple` so each button can tune it. ~550–650ms, ease-out.
- Must not block the click, must not shift layout, must work with mouse, touch and pen;
  keyboard activation (Enter/Space) may skip the ripple or play it from the centre.
- Respect `prefers-reduced-motion`: no ripple (or a plain quick opacity flash).

### Done when (12)

- Click Scroll Down on every state at 1920×1080: the pill never disappears or fades; the page
  crosses to the next state with the normal crossing animation; a ripple grows from the
  click point and is clipped to the pill.
- Same on phone (390×844) for every section.
- Nav items / logo still jump as before.

## 13. Phone: hero server doesn't fit the first screen + pods server too small (user, 2026-11-05)

User screenshots at a ~390px phone viewport.

### 13a. S01 Hero — the whole server must be visible on the FIRST screen

- Now (`HeroMobile.tsx` ~line 500): the server wrapper is `width: m(270)`, `marginTop: m(34)`
  under the buttons. `new-server.svg` is 421×687, so at 270px wide it is ~440px TALL. After
  the header + eyebrow + 3-line heading + 4-line paragraph + buttons, only ~300–370px of the
  first screen is left → the bottom slab (the green-lit base) falls below the fold. Nothing
  clips it in code — it simply doesn't fit. The user wants the full server (cap → base, with
  the glow under it) visible on first load without scrolling.
- Fix: size the server to the space that is left, not to a fixed width:
  - make the hero section fill the first screen: `min-height: calc(100svh - var(--header-h))`,
    `display: flex; flex-direction: column`, and let the server block take the remaining
    space (`flex: 1 1 auto; min-height: 0`), centred, with ~`m(20)` top gap and ~`m(16)`
    bottom gap;
  - inside it, the image is height-driven: `height: 100%; width: auto; max-width: m(270)`
    (keep the aspect ratio 421/687) — on a tall phone it grows up to today's 270px, on a short
    one it shrinks so the base is still on screen;
  - floor it: never smaller than ~`m(190)` wide; on very short screens (landscape) allow the
    section to scroll rather than shrink further.
  - Keep the CSS load-in (`.m-hero [data-m-server]` → `m-rise-server` + `m-float` in
    `globals.css`) and the glow; check the 4.2s float doesn't push the base below the fold
    (reserve its amplitude in the bottom gap).
- Update `design/mobile/S01-Hero.html` is NOT needed — this rule wins over the board's 270px.
- Verify: fresh load at 390×844, 375×667 (iPhone SE), 360×780, 430×932 — the base and glow
  are visible in the first viewport in every one, mid-animation included.

### 13b. S05 Pods — the server art is too small

- `HeroMobile.tsx` ~line 630: `data-m-pods` is `width: m(180)` → the three slabs look like a
  thumbnail in the middle of the screen with lots of empty space (the design board showed
  180 too — that was too small; this spec wins).
- Make it ~`m(280)` wide (≈72% of a 390 screen), centred, `marginTop: m(26)`, ~`m(24)` before
  the POD cards. Keep `aspectRatio: "689 / 1007"`, the fetched inline svg and the slab float
  (`PODS_SLAB_STARTS`) — only the size changes. Give the inline svg `overflow: visible` so
  the slabs' rise/float is never clipped (same cause as section 11).
- While there, check the other phone visuals read as the section's main image, not a
  thumbnail (~250–300px): Stacks (`m(210)` + pieces), Machine, Deploy board (`m(250)`),
  Agent. Bump any that look small in the same way.

### Done when (13)

- 390×844, 375×667, 360×780, 430×932: hero server fully visible on the first screen (cap →
  base + glow), during and after the load-in; pods art clearly the section's main visual; no
  phone art cropped during or after its entrance animation.
