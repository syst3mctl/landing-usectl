"use client";

// Cookie consent: the single gate in front of EVERYTHING optional on this page.
//
// Nothing that is not needed to render the site loads before the visitor chooses — the Meta Pixel
// (components/MetaPixel.tsx), GA4 (components/Analytics.tsx) and the OpenReplay session replay
// (components/SessionReplay.tsx) all ask this module first and subscribe to it for later changes.
// That is why the choice is ONE accept-all / reject-all switch for now: three trackers with the
// same purpose (understanding and measuring the landing page) and no CMP to manage categories.
//
// The cookie is written on `.usectl.com` in production, so manager.usectl.com reads the SAME
// decision — the signup flow continues on that host, and the Pixel must not fire there either if
// the answer here was "no". See META-PIXEL-HANDOFF.md.
//
// The value is versioned (`v1:granted`): bumping CONSENT_VERSION makes every stored answer
// undecided again, which is how the banner gets re-asked when what we load changes.
//
// This file touches `document`, so it carries "use client" — never import it from a server
// component (shell.tsx renders the client components, not this).

export const CONSENT_COOKIE = "usectl_consent";
export const CONSENT_VERSION = "v1";

/** The UTM / landing cookie (src/lib/attribution.ts) — named here so a withdrawal can delete it. */
export const ATTR_COOKIE = "usectl_attr";

/** Cookies the Meta Pixel itself sets; removed on withdrawal, never read or copied by us. */
const PIXEL_COOKIES = ["_fbp", "_fbc"] as const;

const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // 180 days, then we ask again

/** `granted` / `denied`, or `null` while the visitor has not answered (⇒ load nothing). */
export type Consent = "granted" | "denied" | null;

/** Fired on `window` whenever the answer changes. `detail` is the new Consent. */
export const CONSENT_EVENT = "usectl:consent";
/** Fired on `window` by the footer's "Cookie settings" link; the banner listens and reopens. */
export const CONSENT_SETTINGS_EVENT = "usectl:consent-settings";

/**
 * The Domain attribute our cookies get, or null for a host-only cookie.
 *
 * `.usectl.com` on the real site (so manager.usectl.com and docs.usectl.com can read it) and
 * host-only everywhere else: a Domain attribute is REJECTED by the browser when it isn't the
 * current host's own domain, which would silently drop every cookie on localhost and on preview
 * deployments.
 */
export function cookieDomain(hostname: string): string | null {
  return hostname === "usectl.com" || hostname.endsWith(".usectl.com") ? ".usectl.com" : null;
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

/**
 * Writes one of OUR cookies. The value is stored VERBATIM — `usectl_consent` is meant to be read
 * by manager.usectl.com, and a percent-encoded `v1%3Agranted` is an easy way for the other side to
 * get a string comparison wrong (`:` is a legal cookie-octet, so there is nothing to escape).
 * Anything that does need escaping encodes itself before calling — see attribution.ts.
 */
export function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomain(window.location.hostname);
  // Secure only on https: on a plain `next start` over http the attribute would make the browser
  // drop the cookie outright, and then nothing here could be tested locally.
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie =
    `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax` +
    (domain ? `; domain=${domain}` : "") +
    secure;
}

/** Expires a cookie both host-only and on `.usectl.com` — we don't know which one set it. */
export function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomain(window.location.hostname);
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
  if (domain) document.cookie = `${name}=; path=/; max-age=0; samesite=lax; domain=${domain}`;
}

/** What the visitor chose, or null if they have not been asked / the stored answer is older. */
export function getConsent(): Consent {
  const raw = readCookie(CONSENT_COOKIE);
  if (raw === `${CONSENT_VERSION}:granted`) return "granted";
  if (raw === `${CONSENT_VERSION}:denied`) return "denied";
  return null; // unset, or written by an older version ⇒ ask again
}

/**
 * Records the choice and tells everyone who is listening. On a refusal (including a withdrawal
 * through the footer link) our own attribution cookie and the Pixel's `_fbp`/`_fbc` are deleted
 * right here, so "reject" leaves nothing behind that a later visit could still be joined to.
 */
export function setConsent(granted: boolean): void {
  writeCookie(CONSENT_COOKIE, `${CONSENT_VERSION}:${granted ? "granted" : "denied"}`, CONSENT_MAX_AGE);
  if (!granted) {
    deleteCookie(ATTR_COOKIE);
    for (const name of PIXEL_COOKIES) deleteCookie(name);
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: granted ? "granted" : "denied" }));
}

/** Subscribe to changes; returns the unsubscribe function. */
export function onConsentChange(cb: (consent: Consent) => void): () => void {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail ?? getConsent());
  window.addEventListener(CONSENT_EVENT, handler);
  return () => window.removeEventListener(CONSENT_EVENT, handler);
}

/** Reopens the banner so the choice can be changed (the footers' "Cookie settings" link). */
export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
}
