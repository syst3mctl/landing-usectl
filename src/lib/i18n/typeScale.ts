import type { Lang } from "./index";

// Per-language type scale.
//
// The scene is a fixed 1920×980 design canvas: every text column has a hard width and several
// headlines are `whitespace-nowrap` with a hand-placed line break. Georgian runs ~30-50% longer
// than English and its glyphs are wider, so a few of the design's sizes need a step down on /ka.
//
// Everything lives HERE, in one table, instead of `lang === "ka" ? … : …` scattered through nine
// states — the Georgian layout pass is then a handful of numbers in one file. Add an entry only
// when a measurement actually shows the English value breaking; `en` is always the design value.
export type TypeScale = {
  /** state 9's closing line — nowrap + a hand-placed <br/>, so it cannot reflow on its own */
  s9Heading: number;
  /** hero paragraph max-width (design px). On /ka it may not run past the end of the heading's
   *  "ინფრასტრუქტურაზე ჩვენ" line (user, 2026-11-07); measured at 1920 with BPG Banner Caps that
   *  line ends at 817 from the column's left edge */
  heroBodyMax: number;
};

export const TYPE_SCALE: Record<Lang, TypeScale> = {
  en: { s9Heading: 60, heroBodyMax: 950 },
  // measured at 1920: the Georgian line is 1773px wide at 60, i.e. 139px past the content inset;
  // 52 lands it at ~1537 with the same two-line shape
  ka: { s9Heading: 52, heroBodyMax: 815 },
};
