import { defineStrings } from "..";

export const storesPageStrings = defineStrings({
  en: {
    title: "Our stores",
    /** Printed around the ring badge: the seven days and the mission. */
    ring: "OPEN 7 DAYS • FIGHT FOOD WASTE •",
    ringLabel: "Open seven days a week",
    /** The word hung on the shop door: shorter than the status line in storeStrings. */
    sign: { open: "Open", closed: "Closed" },
    directions: "Directions",
    nextClosest: (name: string, km: string) => (
      <>
        Next closest: <b>{name}</b> · {km} away
      </>
    ),
    storefront: (name: string) => `${name} storefront`,
    previous: "Previous store",
    next: "Next store",
    choose: "Choose a store",
  },
  vi: {
    title: "Các cửa hàng",
    ring: "MỞ 7 NGÀY • CHỐNG LÃNG PHÍ •",
    ringLabel: "Mở cửa 7 ngày mỗi tuần",
    sign: { open: "Mở cửa", closed: "Đóng cửa" },
    directions: "Chỉ đường",
    nextClosest: (name, km) => (
      <>
        Gần nhất khác: <b>{name}</b> · cách {km}
      </>
    ),
    storefront: (name) => `Mặt tiền cửa hàng ${name}`,
    previous: "Cửa hàng trước",
    next: "Cửa hàng tiếp theo",
    choose: "Chọn cửa hàng",
  },
  zh: {
    title: "我们的门店",
    ring: "每周营业 7 天 • 拒绝食物浪费 •",
    ringLabel: "每周营业 7 天",
    sign: { open: "营业中", closed: "已打烊" },
    directions: "路线",
    nextClosest: (name, km) => (
      <>
        最近的另一家：<b>{name}</b> · 相距 {km}
      </>
    ),
    storefront: (name) => `${name} 门店外观`,
    previous: "上一家门店",
    next: "下一家门店",
    choose: "选择门店",
  },
  it: {
    title: "I nostri negozi",
    ring: "APERTI 7 GIORNI • BASTA SPRECHI •",
    ringLabel: "Aperti sette giorni su sette",
    sign: { open: "Aperto", closed: "Chiuso" },
    directions: "Indicazioni",
    nextClosest: (name, km) => (
      <>
        Il più vicino: <b>{name}</b> · a {km}
      </>
    ),
    storefront: (name) => `Facciata del negozio ${name}`,
    previous: "Negozio precedente",
    next: "Negozio successivo",
    choose: "Scegli un negozio",
  },
  ja: {
    title: "私たちの店舗",
    ring: "毎週7日営業 • 食品ロスと戦う •",
    ringLabel: "毎週7日営業",
    sign: { open: "営業中", closed: "閉店中" },
    directions: "ルート",
    nextClosest: (name, km) => (
      <>
        次に近い店舗：<b>{name}</b> · {km}先
      </>
    ),
    storefront: (name) => `${name}店の外観`,
    previous: "前の店舗",
    next: "次の店舗",
    choose: "店舗を選ぶ",
  },
});
