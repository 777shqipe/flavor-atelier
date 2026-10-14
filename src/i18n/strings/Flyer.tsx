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
});
