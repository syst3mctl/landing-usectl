// Link-preview image for /ka (og:image) — the same card, drawn in Georgian with BPG Banner Caps
// (satori needs real font files; see _og/card.tsx).
import { renderShareCard, OG_SIZE } from "../../_og/card";
import { ka } from "@/lib/i18n/ka";

export const alt = ka.seo.imageAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("ka");
}
