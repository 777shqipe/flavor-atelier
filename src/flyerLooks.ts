import type { Item } from "./products";

export type Look = "split" | "shout" | "portrait" | "ribbon" | "ticket" | "panel" | "case" | "words";
/** s 1×1 · w 2×1 · t 1×2 · xl 2×2 grid cells */
export type Size = "s" | "w" | "t" | "xl";

/**
 * Hand-placed look and size for the current range, with an optional third value:
 * the short word for "words" cards, or the reason it is cheap for "split" cards.
 * Anything new falls back to `pickLook`.
 */
const LOOK: Record<string, [Look, Size, string?]> = {
  sanpellegrino: ["split", "xl", "Overstock"],
  beans: ["case", "w"],
  spaghetti: ["words", "s", "spaghetti"],
  popcorn: ["ribbon", "t"],
  muesli: ["ticket", "s"],
  yoghurt: ["panel", "s"],
  dumplings: ["shout", "w"],
  dishwash: ["ticket", "s"],
  sparkling: ["case", "w"],
  shin: ["shout", "xl"],
  passata: ["portrait", "w"],
  almonds: ["ticket", "s"],
  cornflakes: ["panel", "t"],
  oatmilk: ["words", "s", "oat milk"],
  peas: ["ticket", "s"],
  paper: ["case", "w"],
  coldbrew: ["ribbon", "t"],
  oil: ["portrait", "w"],
  udon: ["words", "s", "udon"],
  milka: ["shout", "w"],
  oats: ["ticket", "s"],
  cheddar: ["panel", "s"],
  hashbrowns: ["ticket", "s"],
  laundry: ["split", "w", "Pack change"],
  ginger: ["ticket", "s"],
  pb: ["portrait", "w"],
  penne: ["words", "s", "penne"],
  crisps: ["ribbon", "t"],
  honey: ["ticket", "s"],
  hummus: ["panel", "s"],
  icecream: ["shout", "w"],
  binliners: ["words", "s", "bin liners"],
  applejuice: ["ticket", "s"],
  chickpeas: ["case", "w"],
  ricenoodles: ["ticket", "s"],
  gummies: ["ribbon", "t"],
  icedtea: ["words", "s", "iced tea"],
  basmati: ["case", "w"],
};

export function pickLook(item: Item): [Look, Size, string?] {
  if (LOOK[item.id]) return LOOK[item.id];
  if (item.tag === "Bulk") return ["case", "w"];
  if (item.tag === "Hot") return ["shout", "w"];
  return item.was ? ["panel", "s"] : ["ticket", "s"];
}
