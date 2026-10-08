export type Glyph = "bridge" | "horseshoe" | "cup" | "tram";

export type Store = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  src: string;
  /** object-position for the storefront photo */
  pos: string;
  lat: number;
  lon: number;
  /** pin colour, picked from the campaign accents */
  color: string;
  glyph: Glyph;
  line: string;
};

const HOURS = "Mon–Sat 9:00am–7:00pm · Sun 10:00am–6:00pm";

export const STORES: Store[] = [
  {
    id: "footscray",
    name: "Footscray",
    address: "20 Paisley St, Footscray, 3011",
    phone: "03 8351 5336",
    hours: HOURS,
    src: "/media/footscray.jpg",
    pos: "50% 42%",
    lat: -37.8006666,
    lon: 144.898608,
    color: "#f6b531",
    glyph: "bridge",
    line: "Our westside stop. Big brands, small prices.",
  },
  {
    id: "flemington",
    name: "Flemington",
    address: "325–327 Racecourse Rd, Flemington",
    phone: "03 9994 2417",
    hours: HOURS,
    src: "/media/flemington.jpg",
    pos: "50% 38%",
    lat: -37.7883893,
    lon: 144.9301642,
    color: "#e3261b",
    glyph: "horseshoe",
    line: "Racecourse Rd. A sure bet for bargains.",
  },
  {
    id: "fitzroy",
    name: "Fitzroy",
    address: "125 Johnston St, Fitzroy",
    phone: "03 9969 7919",
    hours: HOURS,
    src: "/media/fitzroy.jpg",
    pos: "50% 44%",
    lat: -37.798272,
    lon: 144.9791079,
    color: "#6bb8ff",
    glyph: "cup",
    line: "Johnston St. Grab a coffee, then a bargain.",
  },
  {
    id: "brunswick",
    name: "Brunswick",
    address: "109 Sydney Road, Brunswick",
    phone: "03 9969 7919",
    hours: HOURS,
    src: "/media/brunswick.jpg",
    pos: "50% 38%",
    lat: -37.7749261,
    lon: 144.9606389,
    color: "#6fd3b0",
    glyph: "tram",
    line: "Sydney Road. Hop off the tram, fill the basket.",
  },
];

/** Order used for the dashed route and the cart's journey: a loop, not the list order. */
export const ROUTE = [0, 1, 3, 2, 0];

export const mapsLink = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Melbourne`)}`;

export const directionsLink = (store: Store) =>
  `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lon}`;

/** Great-circle distance in km. */
export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number) => (km < 10 ? km.toFixed(1) : Math.round(km).toString()) + " km";

/* ---------- opening hours -------------------------------------------- */
// Mon–Sat 9–7, Sun 10–6, Melbourne time. Public holidays are not modelled.
const OPEN: Array<[number, number]> = [
  [10, 18], // Sun
  [9, 19],
  [9, 19],
  [9, 19],
  [9, 19],
  [9, 19],
  [9, 19], // Sat
];
const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const clock = (hour: number) => `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "pm" : "am"}`;

export type OpenStatus = { open: boolean; label: string; short: string };

export function openStatus(now = new Date()): OpenStatus {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = Math.max(0, DAY.indexOf(get("weekday")));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const [opens, closes] = OPEN[day];

  if (minutes >= opens * 60 && minutes < closes * 60) {
    return { open: true, label: `Open now · closes ${clock(closes)}`, short: "Open now" };
  }
  if (minutes < opens * 60) {
    return { open: false, label: `Closed · opens ${clock(opens)} today`, short: "Closed" };
  }
  const next = (day + 1) % 7;
  return { open: false, label: `Closed · opens ${clock(OPEN[next][0])} ${DAY[next] === "Sun" ? "Sunday" : "tomorrow"}`, short: "Closed" };
}
