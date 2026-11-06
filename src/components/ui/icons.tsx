// The two button glyphs the whole site shares. Both used to be copy-pasted per component
// (HeroSectionClient, HeroMobile, MobileMenu each had their own `ButtonArrow` / `MenuArrow`), which
// is exactly how three slightly different arrows end up on one page — they live here now and take
// their size from the caller, because each surface writes lengths in its own unit (`s()` on the
// 1920 canvas, `m()` on the phone one, plain px in the header).

// The team's public/button/button-arrow/button-arrow.svg (24×24, stroke white @0.7), drawn with
// currentColor so it warms to brand green together with its label on hover.
export function ButtonArrow({ size, opacity = 0.7 }: { size: string | number; opacity?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      // .btn-arrow (globals.css): turns ↗ into → when its button is hovered / keyboard-focused
      className="btn-arrow"
      style={{ width: size, height: size, flexShrink: 0 }}
    >
      <path
        d="M8 16L16 8M16 14L16 8L10 8"
        stroke="currentColor"
        strokeOpacity={opacity}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// The "Scroll Down" pill's arrow (design/mobile boards: a 14×14 down arrow, 1.5 round stroke).
export function ScrollDownArrow({ size }: { size: string | number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 14" fill="none" style={{ width: size, height: size, flexShrink: 0 }}>
      <path
        d="M7 2.5V11.5M3 7.5L7 11.5L11 7.5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
