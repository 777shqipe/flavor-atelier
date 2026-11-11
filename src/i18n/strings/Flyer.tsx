import { defineStrings } from "..";

/** The optional weekly flyer page. */
export const flyerStrings = defineStrings({
  en: {
    issue: (n: number) => `No. ${n}`,
    week: (date: string) => `Week of ${date}`,
    stores: "Four stores · Melbourne",
    title: (
      <>
        The weekly <em>flyer.</em>
      </>
    ),
    /** Text round the badge; the ring is stretched to a fixed length, so keep it close to this. */
    ring: "WHILE STOCK LASTS • NEW FINDS WEEKLY •",
    ringLabel: "While stock lasts",
    dek: "Overstock, pack changes and short dates from brands you know. It lands, we price it low, and once it’s gone, it’s gone.",
    searchPlaceholder: "Search the aisles",
    searchLabel: "Search the flyer",
    onSpecial: "On special",
    sortLabel: "Sort",
    sorts: { featured: "Featured", price: "Price ↑", saving: "Best saving" },
    allAisles: "All aisles",
    filterLabel: "Filter by aisle",
    /** `n` is the number of items showing. */
    finds: (n: number): string => (n === 1 ? "find" : "finds"),
    /** Appended to the count when an aisle is picked. */
    inAisle: (name: string) => ` in ${name}`,
    clearAll: "Clear all",
    preview: "Preview range · names and prices are placeholders",
    emptyTitle: "Nothing on this shelf.",
    emptyBody: "Stock moves fast. Try another aisle or clear the filters.",
    showAll: "Show everything",
  },
  vi: {
    issue: (n) => `Số ${n}`,
    week: (date) => `Tuần từ ${date}`,
    stores: "Bốn cửa hàng · Melbourne",
    title: (
      <>
        Tờ rơi <em>hằng tuần.</em>
      </>
    ),
    ring: "ĐẾN KHI HẾT HÀNG • HÀNG MỚI MỖI TUẦN •",
    ringLabel: "Đến khi hết hàng",
    dek: "Hàng tồn, hàng đổi bao bì và hàng gần hạn từ những thương hiệu bạn quen. Hàng về là chúng tôi hạ giá sâu, hết là hết.",
    searchPlaceholder: "Tìm khắp các kệ",
    searchLabel: "Tìm trong tờ rơi",
    onSpecial: "Đang khuyến mãi",
    sortLabel: "Sắp xếp",
    sorts: { featured: "Nổi bật", price: "Giá ↑", saving: "Giảm nhiều nhất" },
    allAisles: "Tất cả",
    filterLabel: "Lọc theo quầy hàng",
    finds: () => "món hời",
    inAisle: (name) => ` ở quầy ${name}`,
    clearAll: "Xóa hết",
    preview: "Xem trước · tên và giá chỉ là mẫu",
    emptyTitle: "Kệ này hết sạch rồi.",
    emptyBody: "Hàng bán nhanh lắm. Thử quầy khác hoặc xóa bộ lọc nhé.",
    showAll: "Xem tất cả",
  },
  zh: {
    issue: (n) => `第 ${n} 期`,
    week: (date) => `${date}起`,
    stores: "四家门店 · 墨尔本",
    title: (
      <>
        每周<em>特价单。</em>
      </>
    ),
    ring: "售完为止 • 每周新品 •",
    ringLabel: "售完为止",
    dek: "你熟悉的品牌，积压的、换包装的、临期的货，一到店就标上低价，卖完即止。",
    searchPlaceholder: "搜一搜货架",
    searchLabel: "搜索特价单",
    onSpecial: "只看特价",
    sortLabel: "排序",
    sorts: { featured: "精选", price: "价格 ↑", saving: "省得最多" },
    allAisles: "全部货架",
    filterLabel: "按货架筛选",
    finds: () => "件好货",
    inAisle: (name) => `（${name}）`,
    clearAll: "全部清除",
    preview: "预览版 · 名称和价格仅为示例",
    emptyTitle: "这个货架空了。",
    emptyBody: "货卖得很快。换个货架看看，或者清除筛选。",
    showAll: "查看全部",
  },
  it: {
    issue: (n) => `N° ${n}`,
    week: (date) => `Settimana del ${date}`,
    stores: "Quattro negozi · Melbourne",
    title: (
      <>
        Il <em>volantino</em> settimanale.
      </>
    ),
    ring: "FINCHÉ DURA • NOVITÀ OGNI SETTIMANA •",
    ringLabel: "Finché dura",
    dek: "Eccedenze, confezioni cambiate e prodotti a breve scadenza di marchi che conosci. Arriva, lo prezziamo basso: quando è finito, è finito.",
    searchPlaceholder: "Cerca tra le corsie",
    searchLabel: "Cerca nel volantino",
    onSpecial: "In offerta",
    sortLabel: "Ordina",
    sorts: { featured: "In evidenza", price: "Prezzo ↑", saving: "Più risparmio" },
    allAisles: "Tutte le corsie",
    filterLabel: "Filtra per corsia",
    finds: (n) => (n === 1 ? "occasione" : "occasioni"),
    inAisle: (name) => ` nella corsia ${name}`,
    clearAll: "Azzera tutto",
    preview: "Anteprima della gamma · nomi e prezzi sono segnaposto",
    emptyTitle: "Niente su questo scaffale.",
    emptyBody: "La merce va via in fretta. Prova un’altra corsia o azzera i filtri.",
    showAll: "Mostra tutto",
  },
  ja: {
    issue: (n) => `第${n}号`,
    week: (date) => `${date}の週`,
    stores: "4店舗・メルボルン",
    title: (
      <>
        今週の<em>チラシ。</em>
      </>
    ),
    ring: "在庫限り • 毎週掘り出し物 •",
    ringLabel: "在庫限り",
    dek: "おなじみブランドの余剰在庫、パッケージ変更品、賞味期限が近い商品が入荷します。価格はぐっと下げて、なくなり次第終了です。",
    searchPlaceholder: "商品を探す",
    searchLabel: "チラシを検索",
    onSpecial: "特売中",
    sortLabel: "並べ替え",
    sorts: { featured: "おすすめ", price: "価格 ↑", saving: "一番お得" },
    allAisles: "すべて",
    filterLabel: "売り場で絞り込む",
    finds: () => "点の掘り出し物",
    inAisle: (name) => `（${name}）`,
    clearAll: "すべてクリア",
    preview: "プレビュー版・商品名と価格はダミーです",
    emptyTitle: "この棚は空っぽです。",
    emptyBody: "入れ替わりが早いんです。ほかの売り場を見るか、絞り込みを外してみてください。",
    showAll: "すべて表示",
  },
});
