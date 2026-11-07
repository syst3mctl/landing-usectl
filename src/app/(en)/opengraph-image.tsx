// Link-preview image for every share of usectl.com (og:image), English page. The card itself
// lives in _og/card.tsx; twitter-image.tsx renders the same one for X's twitter:image tag.
// The Georgian page has its own pair under (ka)/ka/.
import { renderShareCard, OG_SIZE } from "../_og/card";
import { en } from "@/lib/i18n/en";

export const alt = en.seo.imageAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("en");
}
