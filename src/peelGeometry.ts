/**
 * Geometry for a sticker being peeled off from one corner.
 *
 * The fold is a straight line perpendicular to the peel direction. Everything
 * on the corner's side of it is lifted: it is clipped away from the front and
 * drawn again as the "flap", mirrored across the fold so it lies back over the
 * sticker, the way a real label curls over itself.
 */

export type Corner = "tl" | "tr" | "bl" | "br";

type Pt = [number, number];

export type PeelFrame = {
  /** clip-path for the part still stuck down */
  front: string;
  /** clip-path for the lifted part, in the element's own (unmirrored) space */
  flap: string;
  /** transform that mirrors the lifted part across the fold (origin 0 0) */
  mirror: string;
  /** linear-gradient for the back of the paper: crease shadow, then a highlight */
  shade: string;
  /** how far the fold has travelled, in px */
  depth: number;
};

const NONE = "polygon(0 0, 0 0, 0 0)";

function corner(w: number, h: number, c: Corner): Pt {
  return [c[1] === "r" ? w : 0, c[0] === "b" ? h : 0];
}

/** Sutherland–Hodgman against one half-plane: keeps points where n·p >= k (or <= k). */
function clip(poly: Pt[], n: Pt, k: number, keepAbove: boolean): Pt[] {
  const out: Pt[] = [];
  const side = (p: Pt) => (n[0] * p[0] + n[1] * p[1] - k) * (keepAbove ? 1 : -1);
  for (let i = 0; i < poly.length; i += 1) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const sa = side(a);
    const sb = side(b);
    if (sa >= 0) out.push(a);
    if (sa >= 0 !== sb >= 0) {
      const t = sa / (sa - sb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

const poly = (pts: Pt[]) =>
  pts.length < 3 ? NONE : `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

/**
 * @param w,h     element size (untransformed)
 * @param from    the corner that lifts first
 * @param p       0 = flat, 1 = the fold has reached the opposite corner
 * @param bleed   extra room around the box for shapes that overhang it
 */
export function peelFrame(w: number, h: number, from: Corner, p: number, bleed = 0): PeelFrame {
  const c = corner(w, h, from);
  // Peel along a 45° diagonal whatever the aspect ratio: it reads as a real corner lift.
  const n: Pt = [(from[1] === "r" ? -1 : 1) * Math.SQRT1_2, (from[0] === "b" ? -1 : 1) * Math.SQRT1_2];
  const box: Pt[] = [
    [-bleed, -bleed],
    [w + bleed, -bleed],
    [w + bleed, h + bleed],
    [-bleed, h + bleed],
  ];
  const nc = n[0] * c[0] + n[1] * c[1];
  // Distance from the lifting corner to the opposite one along n, bleed included.
  const span = (w + h) * Math.SQRT1_2 + bleed * 2 * Math.SQRT2;
  const start = nc - bleed * Math.SQRT2;
  const depth = Math.max(0, p) * span;
  const k = start + depth;

  const front = clip(box, n, k, true);
  const flap = clip(box, n, k, false);

  // Reflection across n·x = k:  x' = x - 2n(n·x - k)
  const a = 1 - 2 * n[0] * n[0];
  const b = -2 * n[0] * n[1];
  const d = 1 - 2 * n[1] * n[1];
  const mirror = `matrix(${a.toFixed(5)}, ${b.toFixed(5)}, ${b.toFixed(5)}, ${d.toFixed(5)}, ${(2 * k * n[0]).toFixed(2)}, ${(2 * k * n[1]).toFixed(2)})`;

  // Gradient across the back of the paper, running from the corner to the crease.
  // It is laid out on the bleed box, which is where the back of the sticker is drawn.
  const angle = (Math.atan2(n[0], -n[1]) * 180) / Math.PI;
  const rad = (angle * Math.PI) / 180;
  const len = Math.abs((w + bleed * 2) * Math.sin(rad)) + Math.abs((h + bleed * 2) * Math.cos(rad));
  const centre = n[0] * (w / 2) + n[1] * (h / 2);
  const at = (u: number) => ((u - centre + len / 2) / len) * 100;
  const tCrease = at(k);
  const tCorner = at(start);
  const mid = tCorner + (tCrease - tCorner) * 0.62;
  const shade = `linear-gradient(${angle.toFixed(1)}deg, var(--peel-back-a) ${tCorner.toFixed(1)}%, var(--peel-back-b) ${mid.toFixed(1)}%, var(--peel-back-c) ${(tCrease - 0.5).toFixed(1)}%)`;

  return { front: poly(front), flap: poly(flap), mirror, shade, depth };
}
