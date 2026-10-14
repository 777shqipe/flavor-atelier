import { defineStrings } from "..";

/** The hand-drawn underline under an emphasised word; hero.css styles the wrapper. */
const squiggle = (word: string) => (
  <span className="squiggle">
    {word}
    <svg viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" d="M3 11C22 2 32 2 50 10S82 18 100 9 134 2 152 10 200 17 217 7" />
    </svg>
  </span>
);

/** The highlighter stroke behind an emphasised word. */
const marker = (word: string) => <span className="marker">{word}</span>;

export const heroStrings = defineStrings({
  en: {
    /** Each headline line ends on its decorated word, in every language. */
    lines: [<>Good food.</>, <>Better {squiggle("prices.")}</>, <>Less {marker("waste.")}</>],
    lead: (
      <>
        <strong>Big-name groceries, rescued from waste</strong> and brought to your basket for a fraction of the usual price.
      </>
    ),
    findStore: "Find a store",
    seeFinds: "See this week’s finds",
    ghost: ["Melbourne’s favourite", "discount grocer"],
    stickers: [
      "Extra virgin olive oil",
      "Spicy ramen",
      "Barista oat milk",
      "Blood orange sparkling soda",
      "Strawberry gelato",
      "Strawberry jam",
      "Choc biscuit bar",
    ],
    stickerLink: (label: string) => `${label}. See this week’s finds`,
    bursts: [
      { note: "4 pack", rrp: "Ouch." },
      { note: "Limited", rrp: "Nope." },
    ],
    rrp: "RRP",
    stats: [
      ["Since 1995", "Fighting food waste"],
      ["4 stores", "Across inner Melbourne"],
      ["Millions", "Of kilograms rescued"],
    ],
    ringText: "SINCE 1995 • FIGHTING FOOD WASTE •",
    ringLabel: "Since 1995, fighting food waste",
  },
  vi: {
    lines: [<>Đồ ăn ngon.</>, <>Giá {squiggle("hời.")}</>, <>Bớt {marker("lãng phí.")}</>],
    lead: (
      <>
        <strong>Thực phẩm hàng hiệu, được cứu khỏi lãng phí</strong> và về giỏ của bạn với giá chỉ bằng một phần giá bình thường.
      </>
    ),
    findStore: "Tìm cửa hàng",
    seeFinds: "Xem món hời tuần này",
    ghost: ["Melbourne yêu thích", "siêu thị giảm giá"],
    stickers: [
      "Dầu ô liu nguyên chất",
      "Mì ramen cay",
      "Sữa yến mạch cho barista",
      "Soda cam máu có ga",
      "Kem gelato dâu tây",
      "Mứt dâu tây",
      "Thanh bánh quy sô-cô-la",
    ],
    stickerLink: (label: string) => `${label}. Xem món hời tuần này`,
    bursts: [
      { note: "Lốc 4", rrp: "Ối!" },
      { note: "Giới hạn", rrp: "Thôi!" },
    ],
    rrp: "GIÁ GỐC",
    stats: [
      ["Từ 1995", "Chống lãng phí thực phẩm"],
      ["4 cửa hàng", "Khắp nội thành Melbourne"],
      ["Hàng triệu", "kg thực phẩm được giải cứu"],
    ],
    ringText: "TỪ 1995 • CHỐNG LÃNG PHÍ THỰC PHẨM •",
    ringLabel: "Từ 1995, chống lãng phí thực phẩm",
  },
  zh: {
    lines: [<>好食材。</>, <>更{squiggle("实惠。")}</>, <>少{marker("浪费。")}</>],
    lead: (
      <>
        <strong>大牌食品从浪费中被拯救出来</strong>，以平时几分之一的价格送进你的购物篮。
      </>
    ),
    findStore: "找门店",
    seeFinds: "看看本周好物",
    ghost: ["墨尔本最爱", "折扣超市"],
    stickers: ["特级初榨橄榄油", "辣味拉面", "咖啡师燕麦奶", "血橙气泡苏打水", "草莓意式冰淇淋", "草莓果酱", "巧克力饼干条"],
    stickerLink: (label: string) => `${label}。看看本周好物`,
    bursts: [
      { note: "4 件装", rrp: "哎哟" },
      { note: "限量", rrp: "不买" },
    ],
    rrp: "原价",
    stats: [
      ["1995 年起", "对抗食物浪费"],
      ["4 家门店", "遍布墨尔本内城"],
      ["数百万", "公斤食物已被拯救"],
    ],
    ringText: "1995 年起 • 对抗食物浪费 •",
    ringLabel: "1995 年起，对抗食物浪费",
  },
});
