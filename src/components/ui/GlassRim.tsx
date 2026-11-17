import type { CSSProperties } from "react";

/**
 * Figma's Glass rim, as the boards draw it (measured on the /features tabs, 2026-11-17): a 1px
 * edge lit from the TOP-LEFT, so its strength follows the direction each piece of edge FACES —
 * 15 % on the upper-left curve, 10 % on the lower-right curve, 8–9 % along the top and left,
 * 5–6 % along the bottom and right, and NONE on the upper-right and lower-left curves (the rim
 * fades out there). Used on the /features tab bar and the /pricing number tiles.
 *
 * Drawn as a conic gradient around the element's centre, masked to a 1px ring. Where each edge
 * direction appears around the centre depends on the shape (a 3:1 pill and a square tile put
 * their curves at very different angles), so the stops are computed from the element's
 * proportions: width × height and corner radius, in any one unit.
 */
const RIM: [deg: number, alpha: number][] = [
  [0, 0.08], [45, 0], [90, 0.05], [135, 0.1], [180, 0.06], [225, 0], [270, 0.09], [315, 0.15], [360, 0.08],
];

function rimAt(normal: number) {
  const n = ((normal % 360) + 360) % 360;
  for (let k = 0; k < RIM.length - 1; k++) {
    const [d0, a0] = RIM[k];
    const [d1, a1] = RIM[k + 1];
    if (n >= d0 && n <= d1) return a0 + ((a1 - a0) * (n - d0)) / (d1 - d0);
  }
  return 0;
}

/** conic-gradient for a rounded rectangle `w` × `h` with corner radius `r` (same unit) */
export function rimGradient(w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  const ax = w / 2 - rr; // corner-circle centres at (±ax, ±ay), y up
  const ay = h / 2 - rr;
  const stops: { phi: number; a: number }[] = [];
  for (let t = 0; t <= 360; t += 7.5) {
    const rad = (t * Math.PI) / 180;
    const cx = t <= 180 ? ax : -ax; // right corners for normals 0–180, left ones for 180–360
    const cy = t <= 90 || t >= 270 ? ay : -ay; // top corners for normals 270–90
    const x = cx + rr * Math.sin(rad);
    const y = cy + rr * Math.cos(rad);
    const phi = ((((Math.atan2(x, y) * 180) / Math.PI) % 360) + 360) % 360;
    stops.push({ phi, a: rimAt(t) });
  }
  stops.sort((p, q) => p.phi - q.phi);
  const c = (a: number) => `rgba(255,255,255,${a.toFixed(3)})`;
  const top = c(rimAt(0)); // straight up is always the top edge (normal 0)
  return `conic-gradient(from 0deg at 50% 50%, ${top} 0deg, ${stops.map((p) => `${c(p.a)} ${p.phi.toFixed(1)}deg`).join(", ")}, ${top} 360deg)`;
}

/**
 * The rim as a layer: put it first inside a `relative` element that has NO border of its own;
 * it takes the element's corner radius. `w`, `h`, `r` are the element's design proportions.
 */
export function GlassRim({ w, h, r, style }: { w: number; h: number; r: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        borderRadius: "inherit",
        padding: "1px",
        background: rimGradient(w, h, r),
        WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        mask: "linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)",
        ...style,
      }}
    />
  );
}
