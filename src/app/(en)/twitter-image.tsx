// X / Twitter card image (twitter:image), English page. The card itself lives in _og/card.tsx;
// opengraph-image.tsx renders the same one.
import { renderShareCard, OG_SIZE } from "../_og/card";
import { en } from "@/lib/i18n/en";

export const alt = en.seo.imageAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("en");
}
