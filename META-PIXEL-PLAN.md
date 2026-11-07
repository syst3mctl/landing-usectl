# Meta Pixel on usectl.com: implementation plan

Approved by the project owner on 2026-11-07. Execute step by step on the CURRENT branch
(`fb-trefik`). Do NOT deploy, do NOT merge into `master`, do NOT change anything in Meta
Events Manager / ad accounts. Talk to the user in Georgian.

Original task spec: SignupClick + PageView + attribution continuity to manager.usectl.com.
Registration / CompleteRegistration belongs to manager.usectl.com, never emit it here.

## Facts from the audit (verify, the branch may differ slightly)

- Next.js 16.4.5, App Router, two root layouts: `src/app/(en)` (`/`) and `src/app/(ka)/ka`
  (`/ka`). Shared shell: `src/app/_site/shell.tsx`. READ `AGENTS.md`: this Next version has
  breaking changes, check `node_modules/next/dist/docs/` before using any Next API.
- Existing analytics: GA4 via `@next/third-parties` `<GoogleAnalytics>` in `shell.tsx`
  (`NEXT_PUBLIC_GA_ID`), OpenReplay in `src/components/SessionReplay.tsx` (adds `?lsid=` to
  manager links in a capture-phase click handler; keep that working).
  `BookDemoModal.tsx` calls `window.gtag?.("event","book_demo_open")`.
- NO consent banner / CMP exists. NO privacy policy page exists.
- No Meta Pixel / GTM installed anywhere.
- All registration CTAs use `SIGNUP_URL = "https://manager.usectl.com/login"` from
  `src/lib/nav.ts` (8 links):
  Header "Start now" (`Header.tsx`), MobileMenu "Start now" (`MobileMenu.tsx`),
  desktop hero "Start Building" + "See how it works" and pricing CTA (`HeroSectionClient.tsx`),
  mobile hero "Start Building" + "See how it works" and pricing CTA (`HeroMobile.tsx`).
  All 8 count as SignupClick. "Book a demo" is NOT a signup and gets no Meta event.
- UTMs / fbclid are NOT carried to manager today (static hrefs, Referrer-Policy
  `strict-origin-when-cross-origin`).
- CSP in `next.config.ts` would block Meta (no facebook domains).

## Pixel

- Pixel / Dataset ID: `2506256846565789` (public, not a secret). It must be the SAME ID on
  manager.usectl.com.
- Do NOT paste Meta's base snippet as is: it fires init + PageView before consent, its
  `<noscript>` image fires without consent (drop it entirely), and it hardcodes the ID.

## Steps

### 1. Env
- `.env.example`: add `NEXT_PUBLIC_META_PIXEL_ID=` with an explanatory comment in the same style
  as the GA block (NEXT_PUBLIC_ is required, it is inlined at BUILD time, so it must be set in
  the host env (manager platform, pod `landing-usectl`) before the build; unset = no Pixel).
- `.env.local` (git-ignored, check `.gitignore`): `NEXT_PUBLIC_META_PIXEL_ID=2506256846565789`.
- Note: the task text says `PUBLIC_META_PIXEL_ID`; in Next.js only `NEXT_PUBLIC_` reaches the
  browser, so use `NEXT_PUBLIC_META_PIXEL_ID`.

### 2. Consent (`src/lib/consent.ts` + `src/components/layout/CookieBanner.tsx`)
- One cookie `usectl_consent`, `Domain=.usectl.com` in production (host-only on localhost /
  previews), `Path=/`, `max-age` 180 days, `SameSite=Lax`, `Secure`. Value e.g.
  `v1:granted` / `v1:denied` (versioned so the banner can be re-asked later).
- Single choice for now (accept all / reject all). It gates: Meta Pixel, GA4, OpenReplay.
  Default before a choice = nothing optional loads.
- Small API: `getConsent()`, `setConsent()`, `onConsentChange(cb)` (custom window event),
  `openConsentSettings()`.
- Banner: client component, rendered from `shell.tsx`, EN + KA copy added to
  `src/lib/i18n/en.ts` / `ka.ts` (same Dict shape). Accept and Reject equally prominent.
  Leave a slot / TODO for a privacy policy link (no page exists yet, do not invent one).
  Must not cause hydration mismatch: render nothing on the server, decide after mount.
  Must not hurt LCP / the hero scene; small, fixed at the bottom, matches the site's style
  (dark, outline pills, `font-heading`).
- Georgian copy rules: no dashes (—) in Georgian running text; hyphen only where grammatical
  or between a Latin word/number and a Georgian suffix (usectl-ში).
- Footer (both `Footer.tsx` and `FooterMobile.tsx`): add a "Cookie settings" /
  "Cookie პარამეტრები" link that reopens the banner (withdrawal).
- Gate GA: render `<GoogleAnalytics>` only after consent (a small client wrapper), or load it
  and use Consent Mode default denied; pick the simpler one that loads NOTHING before consent.
- Gate OpenReplay: `SessionReplay` starts only after consent; on withdrawal call
  `tracker.stop()` if active.

### 3. Pixel loader (`src/components/MetaPixel.tsx`, client)
- Renders nothing if `NEXT_PUBLIC_META_PIXEL_ID` is unset or consent is not granted.
- After consent: install the `fbq` stub + load `https://connect.facebook.net/en_US/fbevents.js`
  once (guard on `window.fbq` and a module-level flag so React StrictMode double effects and
  re-renders never init twice), `fbq('init', ID)`, then ONE `PageView`. Load it after
  hydration / idle so the hero isn't affected (like SessionReplay does).
- Client-side navigation: the only in-app route change is EN <-> KA via LangSwitcher; fire one
  PageView per real pathname change (usePathname), never on hash / scroll-state changes, never
  twice for the initial load.
- If consent is granted later in the same visit, init then + one PageView for the current page.
- On withdrawal: `fbq('consent','revoke')`, stop sending anything further.
- Also export a tiny `trackMeta(event, params)` helper that no-ops when fbq is absent and
  swallows errors.

### 4. SignupClick
- One delegated listener (in MetaPixel or a sibling client component), on `click` and
  `auxclick` (middle-click opens a tab too), matching anchors whose resolved URL host is
  `manager.usectl.com` and path is `SIGNUP_URL`'s path. Compare against `SIGNUP_URL` from
  `src/lib/nav.ts`, do not hardcode.
- `fbq('trackCustom', 'SignupClick', { placement })` where placement comes from a
  `data-cta="header|mobile-menu|hero-start|hero-see-how|pricing"` attribute added to each of
  the 8 links (plus `-mobile` suffix where relevant). No other params, no PII.
- Never `preventDefault`, never delay navigation, wrap in try/catch. Once per interaction
  (a single listener, no per-link handlers that could double-fire). Must coexist with
  SessionReplay's capture-phase `lsid` rewrite.
- Never emit `CompleteRegistration` or `Lead` anywhere in this repo.

### 5. Attribution
- `_fbp` / `_fbc`: set by the Pixel itself as first-party cookies on the root domain
  (`.usectl.com`), `_fbc` derived from `fbclid`. Verify in DevTools that their domain is
  `.usectl.com` so manager.usectl.com can read them. Do not copy them anywhere.
- UTMs: after consent, if the landing URL has any of `utm_source utm_medium utm_campaign
  utm_content utm_term`, write them (last non-empty touch, plus a landing timestamp) as JSON in
  cookie `usectl_attr`, `Domain=.usectl.com`, 90 days, `SameSite=Lax`, `Secure`. If the visit
  arrives before consent, keep the values in memory and write them when consent is granted
  during the same page life.
- Do NOT append UTMs, fbclid, _fbp or _fbc to the manager links. (`src/proxy.ts`, if present on
  this branch, already keeps the query string on the geo redirect: leave it so.)
- On withdrawal: delete `usectl_attr` (and `_fbp`/`_fbc` on `.usectl.com`).

### 6. CSP (`next.config.ts`)
- `script-src` += `https://connect.facebook.net`
- `img-src` += `https://www.facebook.com`
- `connect-src` += `https://www.facebook.com https://connect.facebook.net`
- Update the explanatory comment above the CSP like the existing entries.

### 7. Verify
- `npx tsc --noEmit`, `npm run lint`, `npm run build`: clean.
- Run the production build locally (`next start`) and with Playwright (or the browser) check:
  1. page loads, zero console errors, no hydration warnings;
  2. before any choice: no request to facebook.com / connect.facebook.net / google-analytics /
     analytics.usectl.com;
  3. Reject: still zero optional requests after reload;
  4. Accept: fbevents.js loads, exactly ONE `facebook.com/tr?...ev=PageView` per page load;
  5. EN -> KA switch: exactly one more PageView; hash/scroll states: none;
  6. click each of the 8 CTAs (desktop + mobile viewport): one `ev=SignupClick` each with the
     right placement, and no `CompleteRegistration` ever;
  7. navigation to manager.usectl.com/login still works (lsid still appended when OpenReplay
     runs);
  8. `usectl_consent`, `usectl_attr`, `_fbp`, `_fbc` cookies (domain is host-only on localhost,
     `.usectl.com` logic covered by reading the code / a unit check of the domain helper);
  9. withdraw via footer link: no further events, cookies removed;
  10. compare Lighthouse performance before/after on `/`.
- Meta Events Manager > Test Events: needs a Test Event Code from the owner; if not provided,
  write the manual steps for the user instead of skipping silently.

### 8. Docs + handoff
- `PROJECT.md`: new dated section (what, where, why, verification results), matching the
  file's style.
- `META-PIXEL-HANDOFF.md` for the manager.usectl.com team: same Pixel ID `2506256846565789`;
  read `usectl_consent` (no Pixel without `v1:granted`) and `usectl_attr` (attach UTMs to the
  new account); `_fbp`/`_fbc` are already on `.usectl.com`; emit `CompleteRegistration` only
  there, after a real signup; if they also use the Conversions API, dedupe with the same
  `event_id`, and keep the CAPI token server-side; add the facebook domains to their CSP.
- Commit on `fb-trefik` in logical steps. No push unless the user asks. No deploy, no merge.

### 9. Final report to the user (in Georgian)
Modified files, env vars, pixel init details, event definitions, attribution handling, consent
behavior, test results, remaining limitations (privacy policy missing, Test Events not verified
if no code, manager side pending), coordination needed with manager.usectl.com.
