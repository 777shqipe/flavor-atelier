export type CatId =
  | "drinks"
  | "pantry"
  | "noodles"
  | "snacks"
  | "breakfast"
  | "fridge"
  | "frozen"
  | "household";

export type Shape = "bottle" | "can" | "cans" | "jar" | "box" | "bag" | "carton" | "tub" | "spray";

/** Tight box around each pack, white border included, for callers that need the real footprint. */
export const PACK_BOX: Record<Shape, [number, number, number, number]> = {
  bottle: [19, 3, 62, 136],
  can: [23, 9, 54, 124],
  cans: [3, 15, 94, 122],
  jar: [11, 7, 78, 130],
  box: [15, 5, 70, 132],
  bag: [9, 5, 82, 135],
  carton: [21, 7, 58, 132],
  tub: [9, 19, 82, 120],
  spray: [21, 21, 58, 118],
};

export type Item = {
  id: string;
  name: string;
  cat: CatId;
  price: number;
  /** Original price, shown struck through with a "-xx%" burst. */
  was?: number;
  unit: string;
  line: string;
  tag?: "New" | "Hot" | "Limited" | "Bulk";
  /** Illustrated pack, used when there is no photo. */
  shape?: Shape;
  color?: string;
  label?: [string, string?];
  /** Real photo cutout (transparent, with sticker outline). */
  img?: { src: string; w: number; h: number };
  /** Spans two columns in the flyer grid. */
  big?: boolean;
};

export const CATEGORIES: Array<{ id: CatId; label: string; color: string }> = [
  { id: "drinks", label: "Drinks", color: "#ff9a3d" },
  { id: "pantry", label: "Pantry", color: "#f25c54" },
  { id: "noodles", label: "Noodles", color: "#ffd447" },
  { id: "snacks", label: "Snacks", color: "#a98bf3" },
  { id: "breakfast", label: "Breakfast", color: "#6fd3b0" },
  { id: "fridge", label: "Fridge", color: "#6bb8ff" },
  { id: "frozen", label: "Frozen", color: "#9be7f2" },
  { id: "household", label: "Household", color: "#ff8fb8" },
];

/*
 * PLACEHOLDER RANGE. The three items with `img` are real stock; everything else
 * is sample data so the flyer can be judged with a full shelf. Names, prices and
 * "was" prices below are invented and must be replaced with the real lineup.
 */
export const ITEMS: Item[] = [
  {
    id: "sanpellegrino",
    name: "Blood orange fizz",
    cat: "drinks",
    price: 4,
    unit: "4 × 330ml",
    line: "Bubbles with Italian attitude.",
    tag: "Hot",
    big: true,
    shape: "cans",
    color: "#e8542f",
    label: ["BLOOD", "ORANGE"],
  },
  { id: "beans", name: "Baked beans", cat: "pantry", price: 4, was: 7, unit: "4 × 420g", line: "Four tins. Zero regrets.", tag: "Bulk", shape: "can", color: "#e8472b", label: ["BAKED", "BEANS"] },
  { id: "spaghetti", name: "Spaghetti No.5", cat: "noodles", price: 1, unit: "500g", line: "One dollar, endless twirls.", shape: "box", color: "#2f6fd1", label: ["SPAG", "HETTI"] },
  { id: "popcorn", name: "Salted caramel popcorn", cat: "snacks", price: 2, was: 4, unit: "120g", line: "Movie night, no cinema prices.", tag: "New", shape: "bag", color: "#f6b531", label: ["POP", "CORN"] },
  { id: "muesli", name: "Toasted muesli", cat: "breakfast", price: 5, was: 8.5, unit: "750g", line: "Crunch for people with plans.", shape: "box", color: "#8a5a2b", label: ["TOASTED", "MUESLI"] },
  { id: "yoghurt", name: "Greek yoghurt", cat: "fridge", price: 4, was: 6.5, unit: "1kg", line: "A kilo of creamy confidence.", shape: "tub", color: "#f4f1e8", label: ["GREEK", "YOGHURT"] },
  { id: "dumplings", name: "Pork dumplings", cat: "frozen", price: 6, was: 10, unit: "750g", line: "Instant dinner party.", tag: "Hot", shape: "bag", color: "#e6623a", label: ["PORK", "DUMPLING"] },
  { id: "dishwash", name: "Dishwashing liquid", cat: "household", price: 2, was: 4, unit: "1L", line: "Bubbles that do the work.", shape: "bottle", color: "#3cc0a0", label: ["DISH", "LIQUID"] },
  { id: "sparkling", name: "Sparkling mineral water", cat: "drinks", price: 6, was: 11, unit: "12 × 375ml", line: "Fizz without the sugar rush.", tag: "Bulk", shape: "cans", color: "#3aa7d8", label: ["SPARK", "LING"] },
  {
    id: "shin",
    name: "Spicy ramen 4-pack",
    cat: "noodles",
    price: 4,
    unit: "4 pack",
    line: "Tuesday, but make it spicy.",
    tag: "Hot",
    big: true,
    shape: "bag",
    color: "#c0290f",
    label: ["SPICY", "RAMEN"],
  },
  { id: "passata", name: "Tomato passata", cat: "pantry", price: 1.5, unit: "680g", line: "Sunday sauce in a hurry.", shape: "jar", color: "#cf2e2e", label: ["TOMATO", "PASSATA"] },
  { id: "almonds", name: "Dark choc almonds", cat: "snacks", price: 4, was: 8, unit: "200g", line: "Healthy-ish. Delicious-ish.", shape: "bag", color: "#4a2a1c", label: ["DARK", "ALMOND"] },
  { id: "cornflakes", name: "Corn flakes", cat: "breakfast", price: 3, was: 5, unit: "725g", line: "Classic. Reliable. Crunchy.", shape: "box", color: "#f3b62f", label: ["CORN", "FLAKES"] },
  { id: "oatmilk", name: "Oat milk", cat: "fridge", price: 2, unit: "1L", line: "Moo-free, drama-free.", tag: "New", shape: "carton", color: "#d9c7a0", label: ["OAT", "MILK"] },
  { id: "peas", name: "Garden peas", cat: "frozen", price: 2.5, unit: "1kg", line: "Freezer MVP.", shape: "bag", color: "#3f9b4b", label: ["GARDEN", "PEAS"] },
  { id: "paper", name: "Paper towel", cat: "household", price: 5, was: 9, unit: "6 pack", line: "For spills and big feelings.", tag: "Bulk", shape: "box", color: "#6aa7e8", label: ["PAPER", "TOWEL"] },
  { id: "coldbrew", name: "Cold-brew coffee", cat: "drinks", price: 3.5, was: 6, unit: "750ml", line: "Monday's emergency contact.", shape: "bottle", color: "#3b2418", label: ["COLD", "BREW"] },
  { id: "oil", name: "Extra virgin olive oil", cat: "pantry", price: 9, was: 16, unit: "750ml", line: "Liquid gold, minus the markup.", tag: "Hot", shape: "bottle", color: "#5f8a2c", label: ["OLIVE", "OIL"] },
  { id: "udon", name: "Udon noodles", cat: "noodles", price: 3, unit: "3 pack", line: "Slurp responsibly.", shape: "bag", color: "#efe6cf", label: ["UDON", "NOODLE"] },
  {
    id: "milka",
    name: "Choc-biscuit bar",
    cat: "snacks",
    price: 2,
    unit: "Limited",
    line: "Chocolate met a biscuit.",
    tag: "Limited",
    big: true,
    shape: "box",
    color: "#7a4ce0",
    label: ["CHOC", "BISCUIT"],
  },
  { id: "oats", name: "Instant oats", cat: "breakfast", price: 3, unit: "1kg", line: "Porridge for a rainy day.", shape: "bag", color: "#d8b27a", label: ["INSTANT", "OATS"] },
  { id: "cheddar", name: "Tasty cheddar", cat: "fridge", price: 5, was: 8, unit: "500g", line: "Sharp. Like our prices.", shape: "box", color: "#f09a1f", label: ["TASTY", "CHEDDAR"] },
  { id: "hashbrowns", name: "Hash browns", cat: "frozen", price: 4, was: 6.5, unit: "1kg", line: "Breakfast's crispy sidekick.", shape: "bag", color: "#e0a63c", label: ["HASH", "BROWNS"] },
  { id: "laundry", name: "Laundry liquid", cat: "household", price: 7, was: 14, unit: "2L", line: "Clean clothes, full wallet.", tag: "Hot", shape: "bottle", color: "#5b6cf0", label: ["LAUNDRY", "LIQUID"] },
  { id: "ginger", name: "Ginger beer", cat: "drinks", price: 5, was: 8, unit: "4 × 330ml", line: "Spicy, fizzy, a little bit rude.", shape: "cans", color: "#c98a1c", label: ["GINGER", "BEER"] },
  { id: "pb", name: "Crunchy peanut butter", cat: "pantry", price: 4, was: 6.5, unit: "780g", line: "Crunchy. Obviously.", shape: "jar", color: "#c8832f", label: ["PEANUT", "BUTTER"] },
  { id: "penne", name: "Penne rigate", cat: "noodles", price: 1, unit: "500g", line: "Great with sauce. Better with change.", shape: "box", color: "#e0432f", label: ["PENNE", "RIGATE"] },
  { id: "crisps", name: "Sour cream crisps", cat: "snacks", price: 2, was: 3.5, unit: "175g", line: "The bag will be empty. You'll know why.", shape: "bag", color: "#3d8f5a", label: ["SOUR", "CREAM"] },
  { id: "honey", name: "Squeezy honey", cat: "breakfast", price: 5.5, unit: "500g", line: "Sweet talk in a squeezy bottle.", tag: "New", shape: "bottle", color: "#f1a817", label: ["PURE", "HONEY"] },
  { id: "hummus", name: "Classic hummus", cat: "fridge", price: 2, was: 4, unit: "200g", line: "Chickpea, but make it dip.", shape: "tub", color: "#e9d29a", label: ["CLASSIC", "HUMMUS"] },
  { id: "icecream", name: "Vanilla ice cream", cat: "frozen", price: 3.5, was: 7, unit: "2L", line: "Two litres of good decisions.", tag: "Hot", shape: "tub", color: "#f7e9c5", label: ["VANILLA", "BEAN"] },
  { id: "binliners", name: "Bin liners", cat: "household", price: 3, unit: "50 pack", line: "Taking out the trash, stylishly.", shape: "box", color: "#3a3f45", label: ["BIN", "LINERS"] },
  { id: "applejuice", name: "Apple juice", cat: "drinks", price: 2, was: 3.8, unit: "2L", line: "One a day. Allegedly.", shape: "carton", color: "#8cbf3f", label: ["APPLE", "JUICE"] },
  { id: "chickpeas", name: "Chickpeas", cat: "pantry", price: 5, was: 8, unit: "6 × 400g", line: "Hummus starts here.", tag: "Bulk", shape: "can", color: "#d7a63f", label: ["CHICK", "PEAS"] },
  { id: "ricenoodles", name: "Rice noodles", cat: "noodles", price: 2, unit: "400g", line: "Pad Thai's best friend.", shape: "bag", color: "#e8f0f2", label: ["RICE", "NOODLE"] },
  { id: "gummies", name: "Gummy bears", cat: "snacks", price: 6, was: 11, unit: "1kg", line: "A whole kilo. Brave choice.", tag: "Bulk", shape: "bag", color: "#e8497c", label: ["GUMMY", "BEARS"] },
  { id: "icedtea", name: "Peach iced tea", cat: "drinks", price: 2.5, unit: "1.5L", line: "Summer, bottled and discounted.", shape: "bottle", color: "#f4a25a", label: ["PEACH", "ICED TEA"] },
  { id: "basmati", name: "Basmati rice", cat: "pantry", price: 9, was: 14, unit: "5kg", line: "5 kilos of “what's for dinner?”", tag: "Bulk", shape: "bag", color: "#c9a24d", label: ["BASMATI", "RICE"] },
];
