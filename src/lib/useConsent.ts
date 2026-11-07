"use client";

import { useSyncExternalStore } from "react";
import { getConsent, onConsentChange, type Consent } from "./consent";

/**
 * The visitor's cookie choice, re-rendering whenever it changes.
 *
 * The cookie is an external store, so this is `useSyncExternalStore` rather than a state+effect
 * pair (which is also what react-hooks/set-state-in-effect asks for). Its server snapshot is
 * `null` = undecided = load nothing: the pages are prerendered, so a server render that peeked at
 * a cookie could never match the browser. React swaps in the real client value right after
 * hydration, and everything gated by this renders nothing while null — so the first client render
 * is identical to the server's either way.
 */
export function useConsent(): Consent {
  return useSyncExternalStore(onConsentChange, getConsent, serverSnapshot);
}

const serverSnapshot = (): Consent => null;
