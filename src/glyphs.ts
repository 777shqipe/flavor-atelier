import type { Glyph } from "./stores";

/* One drawing per store, so every pin reads at a glance. */
const GLYPH: Record<Glyph, string> = {
  bridge: '<path d="M2 18.5h20M6.5 19V5.5M17.5 19V5.5M2.5 15.5c2.5 0 4-4.5 4-9M21.5 15.5c-2.5 0-4-4.5-4-9M6.5 7.5c3 6.5 8 6.5 11 0M9.5 10.4v8M12 11.4v7M14.5 10.4v8"/>',
  horseshoe: '<path d="M6.5 3v9.5a5.5 5.5 0 0 0 11 0V3"/><path d="M6.5 7.5h2M15.5 7.5h2M7 12h2M15 12h2"/>',
  cup: '<path d="M5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h1.5a2.3 2.3 0 0 1 0 4.6H16M8.5 3v3M12 3v3"/>',
  tram: '<rect x="5" y="5" width="14" height="12.5" rx="3"/><path d="M5 11h14M9 2.5l3 2.5 3-2.5M8 21l1.5-3.5M16 21l-1.5-3.5"/><circle cx="9" cy="14.2" r=".6"/><circle cx="15" cy="14.2" r=".6"/>',
};

export const glyphSvg = (glyph: Glyph) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[glyph]}</svg>`;

