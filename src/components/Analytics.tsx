"use client";

import { useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "@/lib/useConsent";

// GA4, behind the cookie banner.
//
// shell.tsx used to render <GoogleAnalytics> directly, which loaded gtag.js on every visit. This
// wrapper renders it only once consent is granted, so a visitor who has not answered (or said no)
// causes ZERO requests to googletagmanager — which is the whole point of the banner, and simpler
// than loading the tag with Consent Mode denied.
//
// Withdrawal: gtag.js cannot be unloaded, so the documented opt-out flag is set instead
// (`window['ga-disable-<ID>'] = true` stops gtag from sending anything further) and the component
// unmounts. A visitor who never granted consent never reaches that state at all.

export function Analytics({ gaId }: { gaId: string }) {
  const consent = useConsent();
  const granted = consent === "granted";

  useEffect(() => {
    // the flag is read by gtag.js on every send, so setting it later still works
    (window as unknown as Record<string, boolean>)[`ga-disable-${gaId}`] = !granted;
  }, [gaId, granted]);

  return granted ? <GoogleAnalytics gaId={gaId} /> : null;
}
