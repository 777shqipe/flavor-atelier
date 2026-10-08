import { glyphSvg } from "./glyphs";
import type { Store } from "./stores";

/**
 * Drawings for the store maps, as SVG strings (Leaflet markers take HTML).
 * Same sticker language as the flyer packs: flat colour, ink outline, and a
 * white border drawn underneath so every icon reads on the dark map.
 */

const INK = "#141414";
const CREAM = "#fffaf0";
const DEEP = "#0c3b2e";
const SUN = "#f6b531";
const TOMATO = "#e3261b";
const LEAF = "#5fae5a";
const WOOD = "#c98a4b";

/** Draws `shapes` twice: a fat white outline first, then the inked version on top. */
const sticker = (shapes: string, extra = "") => `
  <g stroke-linejoin="round" stroke-linecap="round">
    <g fill="#fff" stroke="#fff" stroke-width="7">${shapes.replace(/(fill|stroke-width)="[^"]*"/g, "")}</g>
    <g stroke="${INK}" stroke-width="2.2">${shapes}</g>
    ${extra}
  </g>`;

/** Striped awning with a scalloped edge, one path per stripe. */
function awning(x0: number, y0: number, stripes: number, w: number, h: number, colour: string) {
  let out = "";
  for (let i = 0; i < stripes; i += 1) {
    out += `<path d="M${x0 + i * w} ${y0}h${w}v${h}a${w / 2} ${w / 2} 0 0 1 -${w} 0z" fill="${i % 2 ? CREAM : colour}" stroke="none"/>`;
  }
  let edge = `M${x0} ${y0}H${x0 + stripes * w}V${y0 + h}`;
  for (let i = 0; i < stripes; i += 1) edge += `a${w / 2} ${w / 2} 0 0 1 -${w} 0`;
  return { fill: out, edge: `${edge}Z` };
}

/* ---------- store pin: a little CBM shopfront ------------------------------ */
// Anchor (the store's location) is the tip of the pointer: x 32, y 71 of 64 x 76.
export function shopPinSvg(store: Store) {
  const aw = awning(8, 21, 6, 8, 6, store.color);
  const outline = `
    <path d="M25 57L32 71L39 57Z" fill="${store.color}"/>
    <rect x="11" y="24" width="42" height="34" rx="2" fill="${CREAM}"/>
    <rect x="9" y="9" width="46" height="13" rx="3" fill="${DEEP}"/>
    <circle cx="54" cy="10" r="10" fill="${store.color}"/>`;
  const parts = `
    <path d="M25 57L32 71L39 57Z" fill="${store.color}"/>
    <rect x="11" y="24" width="42" height="34" rx="2" fill="${CREAM}"/>
    <rect x="15" y="35" width="20" height="14" rx="1.5" fill="#cfe6dd"/>
    <rect x="38" y="35" width="11" height="23" fill="${DEEP}"/>
    <rect x="9" y="9" width="46" height="13" rx="3" fill="${DEEP}"/>`;
  return `
  <svg viewBox="0 0 64 76" aria-hidden="true" focusable="false">
    <g stroke-linejoin="round" stroke-linecap="round">
      <g fill="#fff" stroke="#fff" stroke-width="7">${outline.replace(/fill="[^"]*"/g, "")}<path d="${aw.edge}"/></g>
      <g stroke="${INK}" stroke-width="2.2">
        ${parts}
        <g class="pin-aw">${aw.fill}<path d="${aw.edge}" fill="none"/></g>
        <circle cx="54" cy="10" r="10" fill="${store.color}"/>
      </g>
      <rect x="16" y="44" width="18" height="4" fill="${WOOD}"/>
      <circle cx="19.5" cy="42.6" r="2.4" fill="${TOMATO}"/>
      <circle cx="25" cy="42.6" r="2.4" fill="${SUN}"/>
      <circle cx="30.5" cy="42.6" r="2.4" fill="${LEAF}"/>
      <circle cx="40.6" cy="47.5" r="1.1" fill="${SUN}"/>
      <text x="27" y="18.7" fill="${CREAM}" font-family="Anton, sans-serif" font-size="8.6" letter-spacing="0.9" text-anchor="middle">CBM</text>
      ${glyphSvg(store.glyph, `x="47" y="3" width="14" height="14" color="${INK}"`)}
    </g>
  </svg>`;
}

/* ---------- the travelling trolley ----------------------------------------- */
// Anchor: between the wheels, x 30, y 47 of 60 x 50.
export const CART_SVG = `
  <svg viewBox="0 0 60 50" aria-hidden="true" focusable="false">
    ${sticker(
      `<rect x="13" y="1" width="8" height="24" rx="4" fill="#e0a458" transform="rotate(-18 17 13)"/>
       <path d="M27 17C22 7 30 1 33 9C37 0 45 6 39 17Z" fill="${LEAF}"/>
       <circle cx="44" cy="11" r="5.6" fill="${TOMATO}"/>
       <path d="M9 14H52L47 34H14Z" fill="${CREAM}"/>
       <path d="M2 9H9L15 38H47" fill="none" stroke-width="3"/>
       <circle cx="19" cy="43" r="4.2" fill="${INK}"/>
       <circle cx="43" cy="43" r="4.2" fill="${INK}"/>
       <rect x="0" y="6.5" width="6" height="5" rx="2" fill="${SUN}"/>`,
      `<path d="M14 21H50M15.5 27.5H48.5M22 14L23 34M31 14V34M40 14L39 34" stroke="#9cad9b" stroke-width="1.4" fill="none"/>
       <circle cx="19" cy="43" r="1.4" fill="${CREAM}"/><circle cx="43" cy="43" r="1.4" fill="${CREAM}"/>
       <path d="M44 6.5q1.5-3 4-3" stroke="${INK}" stroke-width="1.6" fill="none"/>`,
    )}
  </svg>`;

/* ---------- landmarks ------------------------------------------------------- */
export type Landmark = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** drawn width in px; height follows the viewBox */
  w: number;
  box: [number, number];
  svg: string;
  /** dropped first on small maps */
  minor?: boolean;
};

const cbd = sticker(
  `<rect x="6" y="24" width="11" height="24" fill="#9cad9b"/>
   <rect x="17" y="6" width="12" height="42" fill="#2c6b55"/>
   <rect x="17" y="6" width="12" height="8" fill="${SUN}"/>
   <path d="M35.5 15V6" fill="none"/>
   <rect x="29" y="15" width="13" height="33" fill="#d8e9e1"/>
   <rect x="42" y="27" width="12" height="21" fill="#6fd3b0"/>
   <path d="M3 48H57" fill="none"/>`,
  `<path d="M20.5 19h5M20.5 25h5M20.5 31h5M20.5 37h5" stroke="${CREAM}" stroke-width="1.6"/>
   <path d="M32.5 21h6M32.5 27h6M32.5 33h6M32.5 39h6M45 32h5M45 38h5" stroke="#2c6b55" stroke-width="1.6"/>
   <circle class="lm-blink" cx="35.5" cy="5.5" r="1.8" fill="${TOMATO}"/>`,
);

const marketAw = awning(7, 11, 6, 7, 6, TOMATO);
const market = `
  <g stroke-linejoin="round" stroke-linecap="round">
    <g fill="#fff" stroke="#fff" stroke-width="7">
      <rect x="14" y="3" width="28" height="9" rx="2"/><path d="${marketAw.edge}"/>
      <rect x="9" y="18" width="3" height="24"/><rect x="44" y="18" width="3" height="24"/>
      <rect x="6" y="32" width="44" height="13" rx="1.5"/>
      <circle cx="14" cy="29" r="4.4"/><circle cx="22.5" cy="29" r="4.4"/><circle cx="31" cy="29" r="4.4"/><circle cx="39.5" cy="29" r="4.4"/>
    </g>
    <g stroke="${INK}" stroke-width="2.2">
      <rect x="9" y="18" width="3" height="24" fill="${WOOD}"/><rect x="44" y="18" width="3" height="24" fill="${WOOD}"/>
      <rect x="14" y="3" width="28" height="9" rx="2" fill="${DEEP}"/>
      ${marketAw.fill}<path d="${marketAw.edge}" fill="none"/>
      <g class="lm-bob">
        <circle cx="14" cy="29" r="4.4" fill="${TOMATO}"/><circle cx="22.5" cy="29" r="4.4" fill="${SUN}"/>
        <circle cx="31" cy="29" r="4.4" fill="${LEAF}"/><circle cx="39.5" cy="29" r="4.4" fill="#f08a24"/>
      </g>
      <rect x="6" y="32" width="44" height="13" rx="1.5" fill="${WOOD}"/>
      <path d="M6 38.5h44" fill="none" stroke-width="1.6"/>
    </g>
    <text x="28" y="10.3" fill="${CREAM}" font-family="Anton, sans-serif" font-size="6.4" letter-spacing="0.8" text-anchor="middle">MARKET</text>
  </g>`;

const zoo = sticker(
  `<path d="M48 18Q54 21 51 28" fill="none"/>
   <rect x="21" y="27" width="7" height="14" rx="2.5" fill="#b8c4bf"/>
   <rect x="38" y="27" width="7" height="14" rx="2.5" fill="#b8c4bf"/>
   <rect x="18" y="12" width="31" height="21" rx="10" fill="#b8c4bf"/>
   <path d="M8 22Q3 32 8 41L13.5 40Q10 33 13 25Z" fill="#b8c4bf"/>
   <circle cx="17" cy="19" r="10.5" fill="#b8c4bf"/>
   <path class="lm-ear" d="M17 11Q28 12 26.5 23Q21 29 15.5 25Z" fill="#9fb0aa"/>`,
  `<circle cx="12.5" cy="17" r="1.4" fill="${INK}"/><path d="M9.5 25.5Q12 28.5 15.5 27.2" stroke="${CREAM}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
);

const cup = sticker(
  `<path d="M11 12C2 12 3 26 13 24" fill="none"/>
   <path d="M33 12C42 12 41 26 31 24" fill="none"/>
   <path d="M10 8H34V16C34 25 28 30 22 30C16 30 10 25 10 16Z" fill="${SUN}"/>
   <rect x="8" y="6" width="28" height="4" rx="1.5" fill="#f9cf6a"/>
   <rect x="19.5" y="30" width="5" height="6" fill="${SUN}"/>
   <rect x="13" y="36" width="18" height="6" rx="1.5" fill="${DEEP}"/>
   <rect x="10" y="42" width="24" height="5" rx="1.5" fill="#2b3833"/>`,
  `<path d="M15 13V20" stroke="${CREAM}" stroke-width="2.4" stroke-linecap="round"/>
   <path class="lm-spark" d="M38 1.5l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="${CREAM}" stroke="none"/>`,
);

const cabins = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  const fill = [TOMATO, SUN, "#6bb8ff"][i % 3];
  return `<circle cx="${(26 + 18 * Math.cos(a)).toFixed(2)}" cy="${(22 + 18 * Math.sin(a)).toFixed(2)}" r="3" fill="${fill}" stroke-width="1.6"/>`;
}).join("");
const wheel = `
  <g stroke-linejoin="round" stroke-linecap="round">
    <g fill="#fff" stroke="#fff" stroke-width="7">
      <path d="M26 24L15 50M26 24L37 50M10 50H42" fill="none"/><circle cx="26" cy="22" r="21"/>
    </g>
    <g stroke="${INK}">
      <path d="M26 24L15 50M26 24L37 50" fill="none" stroke-width="3"/>
      <path d="M10 50H42" fill="none" stroke-width="2.2"/>
      <g class="lm-spin">
        <circle cx="26" cy="22" r="18" fill="#e3efe9" stroke-width="2.2"/>
        <circle cx="26" cy="22" r="11" fill="none" stroke-width="1.3"/>
        <path d="M26 4V40M8 22H44M13.3 9.3L38.7 34.7M38.7 9.3L13.3 34.7" fill="none" stroke-width="1.3"/>
        ${cabins}
      </g>
      <circle cx="26" cy="22" r="3" fill="${INK}" stroke="none"/>
    </g>
  </g>`;

const arches = [11, 19, 37, 45].map((x) => `<path d="M${x} 41v-5a2.5 2.5 0 0 1 5 0v5z" fill="#c9b07a" stroke="none"/>`).join("");
const exhibition = sticker(
  `<path d="M30 3V12" fill="none" stroke-width="1.6"/>
   <rect x="27.5" y="11" width="5" height="5" fill="#f1e6c8"/>
   <path d="M18 27C18 14 42 14 42 27Z" fill="#8fb3a3"/>
   <rect x="17" y="26" width="26" height="4" fill="#f1e6c8"/>
   <rect x="6" y="30" width="48" height="14" fill="#f1e6c8"/>
   <rect x="4" y="44" width="52" height="4" rx="1" fill="#d9cfb4"/>`,
  `${arches}<path d="M27 44v-7a3 3 0 0 1 6 0v7z" fill="${DEEP}" stroke="none"/>
   <path class="lm-flag" d="M30.8 3.5L38 6L30.8 8.5Z" fill="${TOMATO}" stroke="${INK}" stroke-width="1.4"/>`,
);

const trees = sticker(
  `<path d="M4 37H46" fill="none"/>
   <rect x="11" y="24" width="3" height="13" fill="#8a5a33"/>
   <rect x="24" y="20" width="3" height="17" fill="#8a5a33"/>
   <rect x="37" y="24" width="3" height="13" fill="#8a5a33"/>
   <circle class="lm-sway" cx="12.5" cy="20" r="9" fill="#74c26b"/>
   <circle class="lm-sway" cx="38.5" cy="20" r="9" fill="#74c26b"/>
   <circle class="lm-sway" cx="25.5" cy="15" r="11" fill="${LEAF}"/>`,
);

export const LANDMARKS: Landmark[] = [
  { id: "cbd", name: "CBD", lat: -37.8142, lon: 144.9632, w: 58, box: [60, 52], svg: cbd },
  { id: "qvm", name: "Queen Vic Market", lat: -37.8072, lon: 144.9566, w: 50, box: [56, 50], svg: market },
  { id: "zoo", name: "Melbourne Zoo", lat: -37.7836, lon: 144.9514, w: 50, box: [56, 46], svg: zoo },
  { id: "cup", name: "Flemington Racecourse", lat: -37.7885, lon: 144.9112, w: 38, box: [44, 50], svg: cup },
  { id: "star", name: "Melbourne Star", lat: -37.8116, lon: 144.9372, w: 46, box: [52, 54], svg: wheel, minor: true },
  { id: "reb", name: "Exhibition Building", lat: -37.8047, lon: 144.9717, w: 54, box: [60, 50], svg: exhibition, minor: true },
  { id: "park", name: "Royal Park", lat: -37.7925, lon: 144.9468, w: 44, box: [50, 40], svg: trees, minor: true },
];

export const landmarkHtml = (lm: Landmark, index: number) => `
  <div class="lm lm-${lm.id}"${lm.minor ? " data-minor" : ""} style="--w:${lm.w}px;--ar:${lm.box[0] / lm.box[1]};--i:${index}">
    <span class="lm-art"><svg viewBox="0 0 ${lm.box[0]} ${lm.box[1]}" aria-hidden="true" focusable="false">${lm.svg}</svg></span>
    <span class="lm-cap">${lm.name}</span>
  </div>`;

/* ---------- route geometry -------------------------------------------------- */
export type XY = { x: number; y: number };

/** Control point that bows the straight line a→b away from `centre`. */
export function bowControl(a: XY, b: XY, centre: XY, amount = 0.16): XY {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if ((mx - centre.x) * nx + (my - centre.y) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  return { x: mx + nx * len * amount, y: my + ny * len * amount };
}

/** Points along the bowed curve a→b. */
export function bow(a: XY, b: XY, centre: XY, amount = 0.16, steps = 32): XY[] {
  const c = bowControl(a, b, centre, amount);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y };
  });
}
