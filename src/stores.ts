import type { Lang } from "./i18n";
import { pick } from "./i18n";
import { storeStrings } from "./i18n/strings/Stores";

export type Glyph = "bridge" | "horseshoe" | "cup" | "tram";

export type StoreNotice = {
  type: "temporary_closure";
  badge: Record<Lang, string>;
  title: Record<Lang, string>;
  dates: Record<Lang, string>;
  reopen: Record<Lang, string>;
  desc: Record<Lang, string>;
  postUrl: string;
};

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
  notice?: StoreNotice;
};

const HOURS = "Mon–Sat 9:00am–7:00pm · Sun 10:00am–6:00pm";

export const STORES: Store[] = [
  {
    id: "footscray",
    name: "Footscray",
    address: "20 Paisley St, Footscray VIC 3011",
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
    address: "325–327 Racecourse Rd, Flemington VIC 3031",
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
    address: "125 Johnston St, Fitzroy VIC 3065",
    phone: "03 9969 7919",
    hours: HOURS,
    src: "/media/fitzroy.jpg",
    pos: "50% 44%",
    lat: -37.798272,
    lon: 144.9791079,
    color: "#6bb8ff",
    glyph: "cup",
    line: "Johnston St. Grab a coffee, then a bargain.",
    notice: {
      type: "temporary_closure",
      badge: {
        en: "Closed Tue 20 & Wed 21 Oct",
        it: "Chiuso 20–21 Ottobre",
        vi: "Đóng cửa 20–21/10",
        zh: "10月20-21日休业",
        ja: "10月20日〜21日休業",
      },
      title: {
        en: "Temporary Store Update",
        it: "Chiusura Temporanea per Rinnovo",
        vi: "Tạm thời đóng cửa nâng cấp",
        zh: "门店升级改造暂停营业",
        ja: "店舗改装による臨時休業",
      },
      dates: {
        en: "Tuesday 20 & Wednesday 21 October 2026",
        it: "Martedì 20 e Mercoledì 21 Ottobre 2026",
        vi: "Thứ Ba 20 & Thứ Tư 21 Tháng 10 2026",
        zh: "2026年10月20日（周二）与21日（周三）",
        ja: "2026年10月20日(火)・21日(水)",
      },
      reopen: {
        en: "Reopening Thursday 22 October",
        it: "Riapertura regolare Giovedì 22 Ottobre",
        vi: "Mở cửa bình thường lại vào Thứ Năm 22/10",
        zh: "10月22日（周四）正常营业",
        ja: "10月22日(木)より通常営業再開",
      },
      desc: {
        en: "Our Fitzroy store is closing on Tuesday 20th and Wednesday 21st for a store update! Be sure to pop in before to stock up. Back open as usual on Thursday! Brunswick, Flemington and Footscray stores remain open as usual.",
        it: "Lo store di Fitzroy chiude martedì 20 e mercoledì 21 ottobre per un rinnovo del negozio! Fai un salto prima per fare scorta. Riapriremo come al solito giovedì 22! Gli store di Brunswick, Flemington e Footscray rimangono regolarmente aperti.",
        vi: "Cửa hàng Fitzroy sẽ đóng cửa vào Thứ Ba ngày 20 và Thứ Tư ngày 21 để nâng cấp cửa hàng! Mở cửa lại bình thường vào Thứ Năm! Brunswick, Flemington và Footscray vẫn mở cửa bình thường.",
        zh: "我们的 Fitzroy 门店将于10月20日（周二）和21日（周三）因店内升级改造暂停营业两天！周四将按正常时间恢复营业！Brunswick、Flemington 和 Footscray 门店均正常营业。",
        ja: "Fitzroy店は店舗改装のため、10月20日(火)・21日(水)の2日間臨時休業いたします。木曜日より通常営業を再開いたします！なお、Brunswick店、Flemington店、Footscray店は通常通り営業しております。",
      },
      postUrl: "https://www.instagram.com/p/DefpGShTr0g/",
    },
  },
  {
    id: "brunswick",
    name: "Brunswick",
    address: "109 Sydney Road, Brunswick VIC 3056",
    phone: "03 8529 9376",
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

export const formatKm = (km: number, locale = "en-AU") => {
  const digits = km < 10 ? 1 : 0;
  return `${km.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })} km`;
};

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

export type OpenStatus = { open: boolean; label: string; short: string };

// Building an Intl.DateTimeFormat with a time zone is slow (it loads the zone data), so it is built once.
let melbourneClock: Intl.DateTimeFormat | undefined;

export function openStatus(now = new Date(), lang: Lang = "en"): OpenStatus {
  melbourneClock ??= new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const parts = melbourneClock.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const day = Math.max(0, DAY.indexOf(get("weekday")));
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  const [opens, closes] = OPEN[day];
  const { status } = pick(storeStrings, lang);

  if (minutes >= opens * 60 && minutes < closes * 60) {
    return { open: true, label: status.openNow(closes), short: status.openShort };
  }
  if (minutes < opens * 60) {
    return { open: false, label: status.closedToday(opens), short: status.closedShort };
  }
  const next = (day + 1) % 7;
  return { open: false, label: status.closedNext(OPEN[next][0], DAY[next] === "Sun"), short: status.closedShort };
}
