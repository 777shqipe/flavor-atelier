import { defineStrings } from "..";

/** Text shared by everything that shows a store: tagline, opening hours and the open/closed status. */
export const storeStrings = defineStrings({
  en: {
    hours: "Mon–Sat 9:00am–7:00pm · Sun 10:00am–6:00pm",
    lines: {
      footscray: "Our westside stop. Big brands, small prices.",
      flemington: "Racecourse Rd. A sure bet for bargains.",
      fitzroy: "Johnston St. Grab a coffee, then a bargain.",
      brunswick: "Sydney Road. Hop off the tram, fill the basket.",
    } as Record<string, string>,
    status: {
      openShort: "Open now",
      closedShort: "Closed",
      /** `hour` is 0–23 */
      openNow: (closes: number) => `Open now · closes ${clock(closes)}`,
      closedToday: (opens: number) => `Closed · opens ${clock(opens)} today`,
      closedNext: (opens: number, sunday: boolean) => `Closed · opens ${clock(opens)} ${sunday ? "Sunday" : "tomorrow"}`,
    },
  },
  vi: {
    hours: "T2–T7 9:00–19:00 · CN 10:00–18:00",
    lines: {
      footscray: "Điểm ghé phía Tây. Hàng hiệu, giá mềm.",
      flemington: "Racecourse Rd. Cược vào món hời là chắc thắng.",
      fitzroy: "Johnston St. Làm ly cà phê rồi săn món hời.",
      brunswick: "Sydney Road. Xuống tàu điện, chất đầy giỏ.",
    },
    status: {
      openShort: "Đang mở cửa",
      closedShort: "Đã đóng cửa",
      openNow: (closes) => `Đang mở cửa · đóng cửa lúc ${closes}:00`,
      closedToday: (opens) => `Đã đóng cửa · hôm nay mở cửa lúc ${opens}:00`,
      closedNext: (opens, sunday) => `Đã đóng cửa · ${sunday ? "Chủ nhật" : "ngày mai"} mở cửa lúc ${opens}:00`,
    },
  },
  zh: {
    hours: "周一至周六 9:00–19:00 · 周日 10:00–18:00",
    lines: {
      footscray: "我们的西区门店。大牌好货，白菜价。",
      flemington: "Racecourse Rd。想捡漏？押这家准赢。",
      fitzroy: "Johnston St。先喝杯咖啡，再去捡个漏。",
      brunswick: "Sydney Road。下了电车，直接装满篮子。",
    },
    status: {
      openShort: "营业中",
      closedShort: "已打烊",
      openNow: (closes) => `营业中 · ${closes}:00 打烊`,
      closedToday: (opens) => `已打烊 · 今天 ${opens}:00 开门`,
      closedNext: (opens, sunday) => `已打烊 · ${sunday ? "周日" : "明天"} ${opens}:00 开门`,
    },
  },
  it: {
    hours: "Lun–Sab 9:00–19:00 · Dom 10:00–18:00",
    lines: {
      footscray: "La nostra tappa a ovest. Grandi marche, piccoli prezzi.",
      flemington: "Racecourse Rd. Per gli affari è una scommessa vinta.",
      fitzroy: "Johnston St. Prendi un caffè, poi un affare.",
      brunswick: "Sydney Road. Scendi dal tram, riempi il cestino.",
    },
    status: {
      openShort: "Aperto ora",
      closedShort: "Chiuso",
      openNow: (closes) => `Aperto ora · chiude alle ${closes}:00`,
      closedToday: (opens) => `Chiuso · apre oggi alle ${opens}:00`,
      closedNext: (opens, sunday) => `Chiuso · apre ${sunday ? "domenica" : "domani"} alle ${opens}:00`,
    },
  },
  ja: {
    hours: "月〜土 9:00〜19:00 · 日 10:00〜18:00",
    lines: {
      footscray: "西側エリアのお店。人気ブランドを、うれしい価格で。",
      flemington: "Racecourse Rd。掘り出し物なら、ここが当たり。",
      fitzroy: "Johnston St。コーヒーを一杯、それから掘り出し物を。",
      brunswick: "Sydney Road。トラムを降りて、かごをいっぱいに。",
    },
    status: {
      openShort: "営業中",
      closedShort: "営業時間外",
      openNow: (closes) => `営業中 · ${closes}:00閉店`,
      closedToday: (opens) => `営業時間外 · 本日${opens}:00開店`,
      closedNext: (opens, sunday) => `営業時間外 · ${sunday ? "日曜" : "明日"}${opens}:00開店`,
    },
  },
});

/** English 12-hour clock: 7pm, 10am. */
function clock(hour: number) {
  return `${hour > 12 ? hour - 12 : hour}${hour >= 12 ? "pm" : "am"}`;
}
