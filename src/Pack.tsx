import type { ReactNode } from "react";
import type { Shape } from "./products";

/**
 * Generic illustrated packs for flyer items that have no photo yet. Flat colour,
 * a thick ink outline and a white sticker border so they sit next to the real
 * photo cutouts without pretending to be a specific brand.
 */

type Part =
  | { k: "rect"; x: number; y: number; w: number; h: number; r?: number; fill: string; outline?: boolean }
  | { k: "path"; d: string; fill: string; outline?: boolean };

type Built = { parts: Part[]; box: { x: number; y: number; w: number; h: number } };

function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const p = Math.abs(amount);
  const ch = (v: number) => Math.round((target - v) * p + v);
  const out = (ch((n >> 16) & 255) << 16) | (ch((n >> 8) & 255) << 8) | ch(n & 255);
  return `#${(0x1000000 | out).toString(16).slice(1)}`;
}

const SILVER = "#d7dbe0";
const SHINE = "rgb(255 255 255 / 0.3)";

const SHAPES: Record<Shape, (c: string, d: string) => Built> = {
  bottle: (c, d) => ({
    parts: [
      { k: "rect", x: 37, y: 8, w: 26, h: 13, r: 3, fill: d },
      { k: "rect", x: 41, y: 20, w: 18, h: 30, r: 2, fill: c },
      { k: "rect", x: 24, y: 42, w: 52, h: 92, r: 13, fill: c },
      { k: "rect", x: 30, y: 52, w: 6, h: 72, r: 3, fill: SHINE, outline: false },
    ],
    box: { x: 24, y: 66, w: 52, h: 44 },
  }),
  can: (c) => ({
    parts: [
      { k: "rect", x: 28, y: 14, w: 44, h: 114, r: 9, fill: c },
      { k: "rect", x: 28, y: 14, w: 44, h: 10, r: 5, fill: SILVER },
      { k: "rect", x: 28, y: 118, w: 44, h: 10, r: 5, fill: SILVER },
      { k: "rect", x: 34, y: 32, w: 5, h: 78, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 28, y: 48, w: 44, h: 50 },
  }),
  cans: (c, d) => ({
    parts: [
      { k: "rect", x: 8, y: 42, w: 34, h: 90, r: 7, fill: d },
      { k: "rect", x: 8, y: 42, w: 34, h: 8, r: 4, fill: SILVER },
      { k: "rect", x: 58, y: 42, w: 34, h: 90, r: 7, fill: d },
      { k: "rect", x: 58, y: 42, w: 34, h: 8, r: 4, fill: SILVER },
      { k: "rect", x: 32, y: 20, w: 36, h: 112, r: 8, fill: c },
      { k: "rect", x: 32, y: 20, w: 36, h: 10, r: 5, fill: SILVER },
      { k: "rect", x: 37, y: 38, w: 5, h: 84, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 32, y: 56, w: 36, h: 48 },
  }),
  jar: (c, d) => ({
    parts: [
      { k: "rect", x: 22, y: 12, w: 56, h: 20, r: 5, fill: d },
      { k: "rect", x: 16, y: 28, w: 68, h: 104, r: 17, fill: c },
      { k: "rect", x: 24, y: 46, w: 6, h: 70, r: 3, fill: SHINE, outline: false },
    ],
    box: { x: 16, y: 58, w: 68, h: 46 },
  }),
  box: (c, d) => ({
    parts: [
      { k: "rect", x: 20, y: 10, w: 60, h: 122, r: 4, fill: c },
      { k: "rect", x: 20, y: 10, w: 60, h: 16, r: 4, fill: d },
      { k: "rect", x: 26, y: 34, w: 5, h: 90, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 20, y: 46, w: 60, h: 52 },
  }),
  bag: (c, d) => ({
    parts: [
      { k: "path", d: "M18 16H82L86 124Q50 138 14 124Z", fill: c },
      { k: "rect", x: 18, y: 10, w: 64, h: 12, r: 3, fill: d },
      { k: "rect", x: 24, y: 30, w: 5, h: 84, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 22, y: 48, w: 56, h: 48 },
  }),
  carton: (c, d) => ({
    parts: [
      { k: "path", d: "M26 46L50 16L74 46Z", fill: d },
      { k: "rect", x: 26, y: 44, w: 48, h: 90, r: 3, fill: c },
      { k: "rect", x: 44, y: 12, w: 12, h: 8, r: 2, fill: "#fff" },
      { k: "rect", x: 32, y: 52, w: 5, h: 74, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 26, y: 70, w: 48, h: 46 },
  }),
  tub: (c, d) => ({
    parts: [
      { k: "path", d: "M20 36H80L72 126Q50 134 28 126Z", fill: c },
      { k: "rect", x: 14, y: 24, w: 72, h: 14, r: 6, fill: d },
      { k: "rect", x: 29, y: 46, w: 5, h: 72, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 25, y: 62, w: 50, h: 46 },
  }),
  spray: (c, d) => ({
    parts: [
      { k: "path", d: "M30 26H60Q70 26 70 36V42H58V36H30Z", fill: d },
      { k: "rect", x: 40, y: 40, w: 20, h: 16, r: 2, fill: d },
      { k: "path", d: "M56 44L68 52L64 57L52 49Z", fill: d },
      { k: "rect", x: 26, y: 54, w: 48, h: 80, r: 11, fill: c },
      { k: "rect", x: 32, y: 66, w: 5, h: 60, r: 2.5, fill: SHINE, outline: false },
    ],
    box: { x: 26, y: 78, w: 48, h: 42 },
  }),
};

function partEl(part: Part, key: number, extra: Record<string, string | number>): ReactNode {
  return part.k === "rect" ? (
    <rect key={key} x={part.x} y={part.y} width={part.w} height={part.h} rx={part.r} {...extra} />
  ) : (
    <path key={key} d={part.d} {...extra} />
  );
}

export function Pack({
  shape,
  color,
  label,
  halo = true,
}: {
  shape: Shape;
  color: string;
  label: [string, string?];
  /** White sticker border around the silhouette. */
  halo?: boolean;
}) {
  const { parts, box } = SHAPES[shape](color, shade(color, -0.28));
  const lines = label.filter((line): line is string => Boolean(line));
  const longest = Math.max(...lines.map((line) => line.length));
  const size = Math.min(12, (box.w - 8) / (longest * 0.5));
  const dark = shade(color, -0.55);

  return (
    <svg viewBox="0 0 100 140" aria-hidden="true" focusable="false">
      <g strokeLinejoin="round" strokeLinecap="round">
        {halo && (
          <g fill="#fff" stroke="#fff" strokeWidth="10">
            {parts.filter((p) => p.outline !== false).map((p, i) => partEl(p, i, {}))}
          </g>
        )}
        <g stroke="#00382a" strokeWidth="2">
          {parts.map((p, i) => partEl(p, i, { fill: p.fill, ...(p.outline === false ? { stroke: "none" } : {}) }))}
        </g>
        <rect x={box.x} y={box.y} width={box.w} height={box.h} fill="#fffaf0" stroke="#00382a" strokeWidth="2" />
        <rect x={box.x} y={box.y} width={box.w} height="7" fill={color === "#f4f1e8" ? "#c9c2ae" : dark} stroke="#00382a" strokeWidth="2" />
      </g>
      <g fontFamily="Anton, sans-serif" textAnchor="middle" fill="#00382a" letterSpacing="0.4">
        {lines.map((line, i) => (
          <text
            key={line}
            x={box.x + box.w / 2}
            y={box.y + 12 + size * 0.95 + i * size * 1.1 + (lines.length === 1 ? size * 0.5 : 0)}
            fontSize={size}
          >
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}
