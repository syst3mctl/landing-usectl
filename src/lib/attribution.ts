"use client";

// Where a visitor came from, carried across to manager.usectl.com.
//
// The signup itself happens on another host, so "which campaign produced this account" cannot be
// answered by this page alone. Two mechanisms do it, and they are deliberately different:
//
//   · `_fbp` / `_fbc` — set by the Pixel ITSELF as first-party cookies on `.usectl.com`
//     (`_fbc` from a `fbclid` in the URL). We never read, copy or forward them: the manager's own
//     Pixel picks them up because the cookies are already on the shared parent domain.
//   · `usectl_attr` — this file. The UTMs of the landing URL as JSON, on `.usectl.com`, 90 days,
//     for the manager to attach to the account it creates.
//
// NOTHING is appended to the manager links. A redirect that carries utm_* / fbclid / _fbp in the
// query string would leak the campaign into the referrer, into the manager's logs and into any
// link the visitor copies out of their address bar — and it is not needed when a cookie on the
// parent domain already crosses the hosts.
//
// Last non-empty touch wins: a second visit with new UTMs overwrites those parameters and keeps
// the ones it does not mention, so a campaign click followed by a direct return is still
// attributed. `ts` is the moment of the latest touch.

import { ATTR_COOKIE, readCookie, writeCookie } from "./consent";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
type UtmKey = (typeof UTM_KEYS)[number];

const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const MAX_LEN = 150; // per value — a cookie has ~4KB in total and these are campaign slugs

export type Attribution = Partial<Record<UtmKey, string>> & { ts?: string };

// Captured on mount whether or not consent exists yet, because by the time the banner is answered
// the URL may already have been rewritten (the scene replaces the hash on every page change, and
// a visitor can navigate away from the landing query string). Held here, written only on consent.
let pending: Attribution | null = null;

// control characters out (a raw one would break the JSON round-trip and the cookie
// header), then capped
const clean = (value: string) =>
  value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_LEN);

/** Reads the current URL's utm_* into memory. No UTMs ⇒ nothing is remembered. */
export function captureAttribution(search: string = window.location.search): void {
  const params = new URLSearchParams(search);
  const touch: Attribution = {};
  for (const key of UTM_KEYS) {
    const value = clean(params.get(key) ?? "");
    if (value) touch[key] = value;
  }
  if (Object.keys(touch).length === 0) return;
  touch.ts = new Date().toISOString();
  pending = touch;
}

/**
 * Writes what was captured, merged over whatever a previous visit left. Called when consent is
 * granted — which may be on load (cookie already there) or minutes later, when the banner is
 * answered. Safe to call repeatedly: with nothing pending it does nothing.
 */
export function persistAttribution(): void {
  if (!pending) return;
  const merged: Attribution = { ...readAttribution(), ...pending };
  try {
    // JSON in a cookie has to be percent-encoded ({ } " , are not all legal cookie-octets);
    // readCookie decodes, and so must manager.usectl.com.
    writeCookie(ATTR_COOKIE, encodeURIComponent(JSON.stringify(merged)), MAX_AGE);
  } catch {
    /* over the size limit or cookies disabled — attribution is not worth an exception */
  }
}

/** The stored attribution, or null. This is the shape manager.usectl.com reads. */
export function readAttribution(): Attribution | null {
  const raw = readCookie(ATTR_COOKIE);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Attribution) : null;
  } catch {
    return null; // somebody else's cookie, or a truncated value
  }
}
