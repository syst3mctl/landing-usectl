import type { ReactNode } from "react";
import { buildMetadata, SiteShell, VIEWPORT } from "../_site/shell";

// Root layout for the ENGLISH page, which keeps the bare `/` — the URL search engines indexed.
// Everything lives in _site/shell.tsx, shared with (ka)/layout.tsx so the two can't drift.
export const metadata = buildMetadata("en");
export const viewport = VIEWPORT;

export default function EnLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="en">{children}</SiteShell>;
}
