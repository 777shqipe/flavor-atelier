/**
 * Liquid-glass helpers.
 *
 * For a rounded rectangle of a given size we bake two small images on a canvas:
 *  - `disp`: a displacement map. Inside a thin bezel along the edge every pixel
 *    is pushed along the edge normal (R = x, G = y, 128 = no shift), with a
 *    steep falloff towards the centre, so the rim bends what is behind it the
 *    way the edge of a thick glass slab does.
 *  - `spec`: a transparent PNG of the rim light. Two light sources (a strong
 *    one top-left, a weak one bottom-right) light the bezel according to the
 *    surface normal, plus a razor-thin line right on the edge.
 *
 * `backdrop-filter: url(#svg)` only exists in Chromium, so `disp` is only used
 * there; the `spec` rim works everywhere.
 */

export const canRefract =
  typeof navigator !== "undefined" &&
  /Chrome\//.test(navigator.userAgent) &&
  !/CriOS|FxiOS/.test(navigator.userAgent);

export type GlassMaps = { w: number; h: number; disp: string; spec: string };

/** +1 samples from outside the edge, -1 from inside. Inside never hits transparent pixels. */
const DIRECTION = -1;

const LIGHT_A = normalize(-0.5, -0.86);
const LIGHT_B = normalize(0.5, 0.86);

function normalize(x: number, y: number): [number, number] {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
}

export function buildGlassMaps(w: number, h: number, radius: number, bezel: number): GlassMaps {
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  };
  const dispCanvas = make();
  const specCanvas = make();
  const dispCtx = dispCanvas.getContext("2d");
  const specCtx = specCanvas.getContext("2d");
  if (!dispCtx || !specCtx) return { w, h, disp: "", spec: "" };

  const disp = dispCtx.createImageData(w, h);
  const spec = specCtx.createImageData(w, h);
  const hx = w / 2;
  const hy = h / 2;
  const r = Math.min(radius, hx, hy);

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const px = x + 0.5 - hx;
      const py = y + 0.5 - hy;
      const qx = Math.abs(px) - (hx - r);
      const qy = Math.abs(py) - (hy - r);
      const sd = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
      const depth = -sd;
      const i = (y * w + x) * 4;

      let dx = 0;
      let dy = 0;
      let alpha = 0;

      if (depth >= 0 && depth < bezel) {
        const sx = px < 0 ? -1 : 1;
        const sy = py < 0 ? -1 : 1;
        let nx = 0;
        let ny = 0;
        if (qx > 0 && qy > 0) {
          const len = Math.hypot(qx, qy) || 1;
          nx = (qx / len) * sx;
          ny = (qy / len) * sy;
        } else if (qx > qy) {
          nx = sx;
        } else {
          ny = sy;
        }

        const t = depth / bezel;
        const magnitude = Math.pow(1 - t, 2.2);
        dx = nx * magnitude * DIRECTION;
        dy = ny * magnitude * DIRECTION;

        const a = Math.max(0, nx * LIGHT_A[0] + ny * LIGHT_A[1]);
        const b = Math.max(0, nx * LIGHT_B[0] + ny * LIGHT_B[1]);
        const line = Math.exp(-(((depth - 1.1) / 1.25) ** 2));
        const glow = Math.exp(-((depth / (bezel * 0.5)) ** 2));
        const lit = Math.pow(a, 1.35) + 0.45 * Math.pow(b, 1.35);
        alpha = Math.min(1, line * lit * 1.05 + glow * (a * a + 0.3 * b * b) * 0.28);
      }

      disp.data[i] = Math.round(128 + dx * 127);
      disp.data[i + 1] = Math.round(128 + dy * 127);
      disp.data[i + 2] = 128;
      disp.data[i + 3] = 255;

      spec.data[i] = 255;
      spec.data[i + 1] = 255;
      spec.data[i + 2] = 255;
      spec.data[i + 3] = Math.round(alpha * 255);
    }
  }

  dispCtx.putImageData(disp, 0, 0);
  specCtx.putImageData(spec, 0, 0);
  return { w, h, disp: dispCanvas.toDataURL("image/png"), spec: specCanvas.toDataURL("image/png") };
}
