import type { Item } from "./products";

export type Look = "split" | "shout" | "portrait" | "ribbon" | "ticket" | "panel" | "case" | "words";
/** s 1×1 · w 2×1 · t 1×2 · xl 2×2 grid cells */
export type Size = "s" | "w" | "t" | "xl";
/** Key of the flyer note in strings/FlyerDeal: why a "split" card is cheap, or the short word on a "words" card. */
export type Note = "overstock" | "packChange" | "spaghetti" | "oatMilk" | "udon" | "penne" | "binLiners" | "icedTea";

/**
 * Hand-placed look and size for the current range, with an optional third value: the note
 * for the card (see `Note`). Anything new falls back to `pickLook`.
 */
const LOOK: Record<string, [Look, Size, Note?]> = {
  sanpellegrino: ["split", "xl", "overstock"],
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
  oatmilk: ["words", "s", "oatMilk"],
  peas: ["ticket", "s"],
  paper: ["case", "w"],
  coldbrew: ["ribbon", "t"],
  oil: ["portrait", "w"],
  udon: ["words", "s", "udon"],
  milka: ["shout", "w"],
  oats: ["ticket", "s"],
  cheddar: ["panel", "s"],
  hashbrowns: ["ticket", "s"],
  laundry: ["split", "w", "packChange"],
  ginger: ["ticket", "s"],
  pb: ["portrait", "w"],
  penne: ["words", "s", "penne"],
  crisps: ["ribbon", "t"],
  honey: ["ticket", "s"],
  hummus: ["panel", "s"],
  icecream: ["shout", "w"],
  binliners: ["words", "s", "binLiners"],
  applejuice: ["ticket", "s"],
  chickpeas: ["case", "w"],
  ricenoodles: ["ticket", "s"],
  gummies: ["ribbon", "t"],
  icedtea: ["words", "s", "icedTea"],
  basmati: ["case", "w"],
};

export function pickLook(item: Item): [Look, Size, Note?] {
  if (LOOK[item.id]) return LOOK[item.id];
  if (item.tag === "Bulk") return ["case", "w"];
  if (item.tag === "Hot") return ["shout", "w"];
  return item.was ? ["panel", "s"] : ["ticket", "s"];
}
