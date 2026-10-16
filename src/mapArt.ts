import type { Store } from "./stores";

/**
 * Drawings for the store maps, as SVG strings (Leaflet markers take HTML).
 * Same sticker language as the flyer packs: flat colour, ink outline, and a
 * white border drawn underneath so every icon reads on the map.
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

/* ---------- store pins: one CBM shopfront per neighbourhood ----------------- */
// Drawn light: thin deep-green line, no pointer, a cream halo underneath. Each
// store gets a front that belongs to its street; the CBM sign and the store's
// colour tie them together. The anchor (the store's location) is the middle of
// the doorstep: x 32, y 57 of 64 x 60.
const LINE = "#0b3a2d";
const GLASS = "#d7e8df";
const HALO = "#fffdf6";

const sign = (y: number, size = 6.6) =>
  `<text x="32" y="${y}" fill="${CREAM}" stroke="none" font-family="Anton, sans-serif" font-size="${size}" letter-spacing="1" text-anchor="middle">CBM</text>`;
const glare = (x: number, y: number) => `<path d="M${x} ${y}l5-5" stroke="${HALO}" stroke-width="1.3" fill="none"/>`;

type Front = { halo: string; art: string; top?: string };

/** Footscray, by the Maribyrnong: a sawtooth-roofed warehouse with a half-up
    roller door and a red lantern for the food shops round the market. */
const footscray = (c: string): Front => ({
  halo: `<path d="M8 24V14L20 8V14L32 8V14L44 8V14L56 8V24Z"/><rect x="10" y="22" width="44" height="35" rx="2"/>
    <circle cx="5.5" cy="35" r="4"/><path d="M2 59.5q3-2.4 6 0t6 0"/>`,
  art: `<rect x="10" y="22" width="44" height="35" rx="2" fill="${CREAM}"/>
    <path d="M8 24V14L20 8V14L32 8V14L44 8V14L56 8V24Z" fill="${c}"/>
    <path d="M20 8V14M32 8V14M44 8V14" stroke-width="2.4"/>
    <rect x="14" y="15.5" width="36" height="7.5" rx="1.5" fill="${DEEP}"/>
    <rect x="14" y="32" width="17" height="13" rx="1.5" fill="${GLASS}"/>
    <path d="M22.5 32V45" stroke-width="1.1"/>
    <rect x="35" y="30" width="15" height="27" rx="1" fill="${DEEP}"/>
    <path d="M35 30H50V42H35Z" fill="#c4d0cb"/>
    <path d="M35 33.5H50M35 37H50M35 40.5H50" stroke-width="1"/>
    <path d="M10 28H5.5V31" fill="none" stroke-width="1.3"/>
    <ellipse cx="5.5" cy="35" rx="3.2" ry="3.8" fill="${TOMATO}"/>
    <path d="M2.4 35H8.6M5.5 38.8V41.5" stroke-width="1"/>
    <path d="M2 59.5q3-2.4 6 0t6 0" fill="none" stroke="#6bb8ff" stroke-width="1.6"/>`,
  top: `${sign(21.6)}${glare(17, 41)}<circle cx="47.5" cy="49" r="1" fill="${SUN}" stroke="none"/>`,
});

/** Flemington, on Racecourse Rd: a stable with a lucky horseshoe in the gable,
    a split stable door and the white running rail of the track. */
const flemington = (c: string): Front => ({
  halo: `<path d="M7 24L32 6L57 24Z"/><rect x="10" y="22" width="44" height="35" rx="2"/>
    <path d="M2 49.5H10M2 54.5H10M54 49.5H62M54 54.5H62M3.5 48V57M60.5 48V57"/>`,
  art: `<rect x="10" y="22" width="44" height="35" rx="2" fill="${CREAM}"/>
    <path d="M7 24L32 6L57 24Z" fill="${c}"/>
    <path d="M27.8 12.6V16a4.2 4.2 0 0 0 8.4 0V12.6" fill="none" stroke="${SUN}" stroke-width="2.6"/>
    <rect x="15" y="26" width="34" height="7.5" rx="1.5" fill="${DEEP}"/>
    <rect x="14" y="38" width="8.5" height="8.5" rx="1" fill="${GLASS}"/>
    <rect x="41.5" y="38" width="8.5" height="8.5" rx="1" fill="${GLASS}"/>
    <path d="M18.25 38V46.5M14 42.25H22.5M45.75 38V46.5M41.5 42.25H50" stroke-width="1"/>
    <rect x="26" y="37" width="12" height="20" rx="1" fill="${DEEP}"/>
    <path d="M26 46.5H38" stroke="${CREAM}" stroke-width="1.2"/>
    <path d="M28 55L36 48.5" stroke="${CREAM}" stroke-width="1.2"/>
    <path d="M2 49.5H10M2 54.5H10M54 49.5H62M54 54.5H62" fill="none" stroke-width="1.4"/>
    <path d="M3.5 48V57M7.5 48V57M56.5 48V57M60.5 48V57" stroke-width="1.6"/>`,
  top: `${sign(31.6)}<circle cx="28" cy="13.6" r=".55" fill="${LINE}" stroke="none"/><circle cx="36" cy="13.6" r=".55" fill="${LINE}" stroke="none"/><circle cx="35.6" cy="47.2" r=".9" fill="${SUN}" stroke="none"/>`,
});

/** Fitzroy, Johnston St: a Victorian terrace shop with a pedimented parapet,
    a bullnose verandah trimmed in iron lace and a coffee cup in the window. */
const lace = Array.from({ length: 11 }, (_, i) => `M${10 + i * 4} 30a2 2 0 0 0 4 0`).join("");
const fitzroy = (c: string): Front => ({
  halo: `<path d="M10 14H26L32 7L38 14H54V22H10Z"/><rect x="10" y="20" width="44" height="37" rx="1.5"/>
    <path d="M6 30Q6 25.5 10.5 25.5H53.5Q58 25.5 58 30Z"/><path d="M9 30V57M55 30V57"/>`,
  art: `<rect x="10" y="20" width="44" height="37" rx="1.5" fill="${CREAM}"/>
    <path d="M10 14H26L32 7L38 14H54V22H10Z" fill="${DEEP}"/>
    <circle cx="12" cy="12.4" r="1.6" fill="${CREAM}"/><circle cx="52" cy="12.4" r="1.6" fill="${CREAM}"/>
    <path d="M6 30Q6 25.5 10.5 25.5H53.5Q58 25.5 58 30Z" fill="${c}"/>
    <path d="${lace}" fill="none" stroke-width="1"/>
    <path d="M9 30V57M55 30V57" stroke-width="1.8"/>
    <rect x="14" y="37" width="19" height="15" rx="1" fill="${GLASS}"/>
    <path d="M19.5 43.5H27V46.5A3.75 3.2 0 0 1 19.5 46.5Z" fill="${CREAM}" stroke-width="1.2"/>
    <path d="M27 44.5h1.2a1.4 1.4 0 0 1 0 2.8H26.6" fill="none" stroke-width="1.1"/>
    <path d="M37 57V40.5a5 5 0 0 1 10 0V57Z" fill="${DEEP}"/>`,
  top: `${sign(19.8, 6.2)}<path d="M22 41.5q-1-1.2 0-2.4t0-2.4M24.6 41.5q-1-1.2 0-2.4t0-2.4" stroke="${HALO}" stroke-width="1.1" fill="none"/><circle cx="44.6" cy="49" r="1" fill="${SUN}" stroke="none"/>`,
});

/** Brunswick, Sydney Road: a stepped art-deco front under the tram wire, a
    flat canopy, and the tram stop's pole and flag at the kerb. */
const brunswick = (c: string): Front => ({
  halo: `<path d="M12 22V13H20V10H26V7H38V10H44V13H52V22Z"/><rect x="10" y="20" width="44" height="37" rx="1.5"/>
    <rect x="7" y="27" width="50" height="4.5" rx="1"/><path d="M60 2V57"/><rect x="56" y="11" width="7.5" height="9" rx="1"/>`,
  art: `<path d="M0 4.5H64" fill="none" stroke-width="1"/>
    <rect x="10" y="20" width="44" height="37" rx="1.5" fill="${CREAM}"/>
    <path d="M12 22V13H20V10H26V7H38V10H44V13H52V22Z" fill="${DEEP}"/>
    <rect x="7" y="27" width="50" height="4.5" rx="1" fill="${c}"/>
    <rect x="14" y="35.5" width="11" height="15" rx="3" fill="${GLASS}"/>
    <rect x="39" y="35.5" width="11" height="15" rx="3" fill="${GLASS}"/>
    <rect x="27.5" y="35.5" width="9" height="21.5" rx="1" fill="${DEEP}"/>
    <path d="M60 2.5V57" stroke-width="1.8"/>
    <rect x="56" y="11" width="7.5" height="9" rx="1" fill="${SUN}"/>
    <path d="M56 15.5H63.5" stroke-width="1"/>
    <path d="M2 59.3H62" fill="none" stroke-width="1"/>`,
  top: `${sign(19.2, 6.2)}<path d="M29.5 9.6h5" stroke="${CREAM}" stroke-width="1"/>${glare(16.5, 44)}${glare(41.5, 44)}<circle cx="34.6" cy="47" r="1" fill="${SUN}" stroke="none"/>`,
});

const FRONTS: Record<string, (colour: string) => Front> = { footscray, flemington, fitzroy, brunswick };

export function shopPinSvg(store: Store) {
  const front = (FRONTS[store.id] ?? footscray)(store.color);
  return `
  <svg viewBox="0 0 64 60" aria-hidden="true" focusable="false">
    <g stroke-linejoin="round" stroke-linecap="round">
      <g fill="${HALO}" stroke="${HALO}" stroke-width="5">${front.halo}</g>
      <g stroke="${LINE}" stroke-width="1.6">${front.art}</g>
      ${front.top ?? ""}
    </g>
  </svg>`;
}

/* ---------- the travelling trolley ----------------------------------------- */
// Anchor: between the wheels, x 30, y 47 of 60 x 60 (the box starts at y -10 to
// leave room for a full load). Every item is in the drawing; the groups l1–l3
// are shown as the years go by, so the trolley fills up as the story moves on.
export const CART_SVG = `
  <svg viewBox="0 -10 60 60" aria-hidden="true" focusable="false">
    ${sticker(
      `<g class="l1"><rect x="13" y="1" width="8" height="24" rx="4" fill="#e0a458" transform="rotate(-18 17 13)"/></g>
       <g class="l3"><path d="M41 16V-1L43.5 -5.5H47.5L50 -1V16Z" fill="#6bb8ff"/><rect x="41" y="1.5" width="9" height="5" fill="${CREAM}"/></g>
       <g class="l2"><path d="M21 17C16 7 24 1 27 9C31 0 39 6 33 17Z" fill="${LEAF}"/></g>
       <g><rect x="30" y="4.5" width="11" height="4" rx="1.5" fill="${SUN}"/><rect x="31" y="8" width="9" height="9" rx="2.5" fill="#c2304b"/></g>
       <g class="l2"><circle cx="45" cy="11" r="5.6" fill="${TOMATO}"/></g>
       <g class="l3"><circle cx="22" cy="12" r="4.8" fill="#ff9a3d"/></g>
       <path d="M9 14H52L47 34H14Z" fill="${CREAM}"/>
       <path d="M2 9H9L15 38H47" fill="none" stroke-width="3"/>
       <circle cx="19" cy="43" r="4.2" fill="${INK}"/>
       <circle cx="43" cy="43" r="4.2" fill="${INK}"/>
       <rect x="0" y="6.5" width="6" height="5" rx="2" fill="${SUN}"/>`,
      `<path d="M14 21H50M15.5 27.5H48.5M22 14L23 34M31 14V34M40 14L39 34" stroke="#9cad9b" stroke-width="1.4" fill="none"/>
       <circle cx="19" cy="43" r="1.4" fill="${CREAM}"/><circle cx="43" cy="43" r="1.4" fill="${CREAM}"/>
       <g class="l2"><path d="M45 6.5q1.5-3 4-3" stroke="${INK}" stroke-width="1.6" fill="none"/></g>`,
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
   <circle cx="35.5" cy="5.5" r="1.8" fill="${TOMATO}"/>`,
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
      <circle cx="14" cy="29" r="4.4" fill="${TOMATO}"/><circle cx="22.5" cy="29" r="4.4" fill="${SUN}"/>
      <circle cx="31" cy="29" r="4.4" fill="${LEAF}"/><circle cx="39.5" cy="29" r="4.4" fill="#f08a24"/>
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
   <path d="M17 11Q28 12 26.5 23Q21 29 15.5 25Z" fill="#9fb0aa"/>`,
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
   <path d="M38 1.5l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="${CREAM}" stroke="none"/>`,
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
      <g>
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
   <path d="M30.8 3.5L38 6L30.8 8.5Z" fill="${TOMATO}" stroke="${INK}" stroke-width="1.4"/>`,
);

const trees = sticker(
  `<path d="M4 37H46" fill="none"/>
   <rect x="11" y="24" width="3" height="13" fill="#8a5a33"/>
   <rect x="24" y="20" width="3" height="17" fill="#8a5a33"/>
   <rect x="37" y="24" width="3" height="13" fill="#8a5a33"/>
   <circle cx="12.5" cy="20" r="9" fill="#74c26b"/>
   <circle cx="38.5" cy="20" r="9" fill="#74c26b"/>
   <circle cx="25.5" cy="15" r="11" fill="${LEAF}"/>`,
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

export const landmarkHtml = (lm: Landmark, caption = lm.name) => `
  <div class="lm lm-${lm.id}"${lm.minor ? " data-minor" : ""} style="--w:${lm.w}px;--ar:${lm.box[0] / lm.box[1]}">
    <span class="lm-art"><svg viewBox="0 0 ${lm.box[0]} ${lm.box[1]}" aria-hidden="true" focusable="false">${lm.svg}</svg></span>
    <span class="lm-cap">${caption}</span>
  </div>`;
