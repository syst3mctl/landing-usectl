import type { ReactNode } from "react";
import { buildMetadata, SiteShell, VIEWPORT } from "../_site/shell";

// Root layout for the GEORGIAN page (/ka). Its only difference from (en)/layout.tsx is the
// language it hands the shared shell — which is what sets <html lang>, the Georgian font stack
// (globals.css keys off html[lang="ka"]), the dictionary and the <head> copy.
export const metadata = buildMetadata("ka");
export const viewport = VIEWPORT;

export default function KaLayout({ children }: { children: ReactNode }) {
  return <SiteShell lang="ka">{children}</SiteShell>;
}
