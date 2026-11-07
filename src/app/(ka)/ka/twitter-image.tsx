// X / Twitter card image (twitter:image) for /ka — the Georgian card.
import { renderShareCard, OG_SIZE } from "../../_og/card";
import { ka } from "@/lib/i18n/ka";

export const alt = ka.seo.imageAlt;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderShareCard("ka");
}
