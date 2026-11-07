"use client";

import type { CSSProperties } from "react";
import { openConsentSettings } from "@/lib/consent";

// "Cookie settings" in both footers — how a visitor takes a choice back (or makes one after
// dismissing nothing, since the banner only disappears once answered).
//
// Deliberately a <button>, not an <a href="#...">: the desktop scene installs a capture-phase
// click handler on `document` that treats any anchor with a hash href as in-page navigation
// (HeroSectionClient's onNavClick), so an anchor here would move the scene instead.

export function CookieSettingsButton({
  label,
  className = "",
  style,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <button type="button" onClick={openConsentSettings} className={className} style={style}>
      {label}
    </button>
  );
}
