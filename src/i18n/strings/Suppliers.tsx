import { defineStrings } from "..";

/** The supplier pitch, what we buy, and the "Working with us" heading; the deal steps live in SupplierDeal. */
export const suppliersStrings = defineStrings({
  en: {
    eyebrow: "For suppliers",
    heroTitle: "Surplus stock?",
    heroTitleLine2: "Let’s make it useful.",
    heroLead: "Fast decisions, flexible volumes and a better outcome for good food.",
    quote: "Get a quote",
    howItWorks: "How it works",
    buysLabel: "What we buy",
    buys: ["Close-to-date", "Past best-before", "Surplus stock", "A few pallets", "A full truckload"],
    dealEyebrow: "Working with us",
    dealTitle: (
      <>
        A deal that works <em>for everyone.</em>
      </>
    ),
    dealLead: "Four steps from “we have too much” to “it’s gone, thank you”, and what each one does for you.",
    forYou: "For you",
  },
  vi: {
    eyebrow: "Cho nhà cung cấp",
    heroTitle: "Hàng tồn dư?",
    heroTitleLine2: "Để chúng tôi tận dụng.",
    heroLead: "Quyết định nhanh, số lượng linh hoạt và kết quả tốt hơn cho thực phẩm còn ngon.",
    quote: "Nhận báo giá",
    howItWorks: "Cách hoạt động",
    buysLabel: "Hàng chúng tôi thu mua",
    buys: ["Hàng gần hạn", "Đã qua “tốt nhất trước ngày”", "Hàng tồn dư", "Vài pallet", "Nguyên xe tải"],
    dealEyebrow: "Cùng hợp tác",
    dealTitle: (
      <>
        Một thương vụ <em>ai cũng có lợi.</em>
      </>
    ),
    dealLead: "Bốn bước từ “còn dư nhiều quá” đến “hết sạch rồi, cảm ơn”, và mỗi bước mang lại gì cho bạn.",
    forYou: "Cho bạn",
  },
  zh: {
    eyebrow: "面向供应商",
    heroTitle: "有多余库存？",
    heroTitleLine2: "我们来让它派上用场。",
    heroLead: "决定快，数量灵活，让好食物有更好的去处。",
    quote: "获取报价",
    howItWorks: "合作流程",
    buysLabel: "我们收购的商品",
    buys: ["临近保质期", "已过最佳食用期", "多余库存", "几托盘", "整车货"],
    dealEyebrow: "与我们合作",
    dealTitle: (
      <>
        一笔<em>对大家都好</em>的生意。
      </>
    ),
    dealLead: "四步，从“货太多了”到“卖光了，谢谢”，每一步对你有什么好处。",
    forYou: "对你",
  },
});
