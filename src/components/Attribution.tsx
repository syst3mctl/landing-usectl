"use client";

// Captures the landing URL's utm_* and, once consent is granted, stores them in the `usectl_attr`
// cookie on `.usectl.com` so manager.usectl.com can attach them to the account a visitor creates.
// See src/lib/attribution.ts for why nothing is appended to the manager links instead.
//
// Renders nothing. Separate from MetaPixel on purpose: this is for our own signup attribution and
// has to work even if the Pixel is never configured.

import { useEffect } from "react";
import { captureAttribution, persistAttribution } from "@/lib/attribution";
import { useConsent } from "@/lib/useConsent";

export function Attribution() {
  const consent = useConsent();

  // Read the URL as early as possible — before the banner is answered, and before the scene
  // starts rewriting the address bar. Nothing is written yet.
  useEffect(() => {
    captureAttribution();
  }, []);

  // ...and write it when (or as soon as) the visitor says yes. Effects run in order, so a visit
  // that already carries consent captures and persists in the same commit.
  useEffect(() => {
    if (consent === "granted") persistAttribution();
  }, [consent]);

  return null;
}
