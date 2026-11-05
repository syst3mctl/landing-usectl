import type { PointerEvent as ReactPointerEvent } from "react";

// The MUI-style "you pressed it" trace, shared by every button that wants one (the pricing +/− on
// both builds and the hero's Scroll Down pill). It used to be copy-pasted in HeroSectionClient and
// HeroMobile.
//
// A circle is spawned under the pointer, sized to reach the button's farthest corner from that
// point, and it grows and fades over ~650ms (`.press-ripple` in globals.css). The host button must
// be `relative overflow-hidden` so the circle is clipped to its shape — on a rounded pill Safari
// also wants `isolate`. `tint` overrides the ripple colour through a CSS variable, so a quiet
// button can have a quieter ripple than the pricing steppers' bright green.
export function pressRipple(e: ReactPointerEvent<HTMLButtonElement>, tint?: string) {
  const btn = e.currentTarget;
  if (btn.disabled) return;
  // reduced motion: no ripple at all (the global CSS would collapse it to ~0ms anyway, but then
  // an element is appended and removed for nothing)
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const r = btn.getBoundingClientRect();
  const size =
    2 * Math.hypot(Math.max(e.clientX - r.left, r.right - e.clientX), Math.max(e.clientY - r.top, r.bottom - e.clientY));
  const dot = document.createElement("span");
  dot.className = "press-ripple";
  dot.style.left = `${e.clientX - r.left}px`;
  dot.style.top = `${e.clientY - r.top}px`;
  dot.style.width = dot.style.height = `${size}px`;
  if (tint) dot.style.setProperty("--ripple", tint);
  dot.addEventListener("animationend", () => dot.remove(), { once: true });
  btn.appendChild(dot);
}

// the quiet pill's tint — the same green family, much softer than the steppers' default
export const RIPPLE_SOFT =
  "radial-gradient(circle, rgba(17,163,42,0.25) 0%, rgba(17,163,42,0.14) 55%, rgba(17,163,42,0) 100%)";
