import { defineStrings } from "..";

/** The weekly flyer page, and the cut line above it (the home page shows that line too). */
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
    cut: "Cut along the line. Keep the savings.",
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
    ring: "CHỪNG NÀO CÒN HÀNG • HÀNG MỚI MỖI TUẦN •",
    ringLabel: "Chừng nào còn hàng",
    dek: "Hàng tồn, đổi bao bì và cận date từ những thương hiệu bạn quen. Hàng về là chúng tôi hạ giá sâu, hết là hết.",
    searchPlaceholder: "Tìm khắp các kệ",
    searchLabel: "Tìm trong tờ rơi",
    onSpecial: "Đang khuyến mãi",
    sortLabel: "Sắp xếp",
    sorts: { featured: "Nổi bật", price: "Giá ↑", saving: "Giảm nhiều nhất" },
    allAisles: "Tất cả",
    filterLabel: "Lọc theo gian hàng",
    finds: () => "món hời",
    inAisle: (name) => ` trong ${name}`,
    clearAll: "Xóa hết",
    preview: "Xem trước · tên và giá chỉ là mẫu",
    emptyTitle: "Kệ này hết sạch rồi.",
    emptyBody: "Hàng đi nhanh lắm. Thử gian khác hoặc xóa bộ lọc nhé.",
    showAll: "Xem tất cả",
    cut: "Cắt theo đường này. Giữ lại khoản tiết kiệm.",
  },
  zh: {
    issue: (n) => `第 ${n} 期`,
    week: (date) => `本周 ${date}`,
    stores: "四家门店 · 墨尔本",
    title: (
      <>
        每周<em>特价单。</em>
      </>
    ),
    ring: "售完为止 • 每周新品 •",
    ringLabel: "售完为止",
    dek: "积压货、换包装的商品和临期品，都来自你熟悉的品牌。货到，我们压低价格，卖完即止。",
    searchPlaceholder: "搜一搜货架",
    searchLabel: "搜索特价单",
    onSpecial: "特价中",
    sortLabel: "排序",
    sorts: { featured: "精选", price: "价格 ↑", saving: "省最多" },
    allAisles: "全部货架",
    filterLabel: "按货架筛选",
    finds: () => "件好货",
    inAisle: (name) => `（${name}）`,
    clearAll: "全部清除",
    preview: "预览版 · 名称和价格仅为示例",
    emptyTitle: "这个货架空了。",
    emptyBody: "货走得很快。换个货架看看，或清除筛选。",
    showAll: "查看全部",
    cut: "沿虚线剪开，留住省下的钱。",
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
    dek: "Eccedenze, confezioni cambiate e prodotti a breve scadenza di marchi che conosci. Arriva, lo prezziamo basso: finito è finito.",
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
    cut: "Taglia lungo la linea. Tieni il risparmio.",
  },
  ja: {
    issue: (n) => `第${n}号`,
    week: (date) => `${date}の週`,
    stores: "4店舗・メルボルン",
    title: (
      <>
        毎週の<em>チラシ。</em>
      </>
    ),
    ring: "在庫限り • 毎週掘り出し物 •",
    ringLabel: "在庫限り",
    dek: "おなじみブランドの過剰在庫、パッケージ変更品、賞味期限が近い商品が入荷します。価格はぐっと下げて、なくなり次第終了です。",
    searchPlaceholder: "棚から探す",
    searchLabel: "チラシを検索",
    onSpecial: "特売中",
    sortLabel: "並べ替え",
    sorts: { featured: "おすすめ", price: "価格 ↑", saving: "一番お得" },
    allAisles: "すべての棚",
    filterLabel: "棚で絞り込む",
    finds: () => "点の掘り出し物",
    inAisle: (name) => `（${name}）`,
    clearAll: "すべてクリア",
    preview: "プレビュー版・商品名と価格はダミーです",
    emptyTitle: "この棚は空っぽです。",
    emptyBody: "入れ替わりが早いんです。ほかの棚を見るか、絞り込みを外してみてください。",
    showAll: "すべて表示",
    cut: "点線に沿って切り取ってください。お得も忘れずに。",
  },
});
