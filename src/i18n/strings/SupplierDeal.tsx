import { defineStrings } from "..";

/** The deal's four steps (looked up by id from supplierDeal.ts) and its proof points. */
export const supplierDealStrings = defineStrings({
  en: {
    stops: {
      tell: {
        tag: "2 min",
        title: "Tell us what you've got",
        text: "A few lines is plenty: what it is, how much, and when it needs to move.",
        gain: "No minimum order. A few pallets or a full truckload.",
      },
      reply: {
        tag: "Same day",
        title: "We come back fast",
        text: "Our buying team gets back to you with a clear offer.",
        gain: "Fast decisions and flexible volumes, so stock never sits.",
      },
      collect: {
        tag: "Anywhere in Australia",
        title: "Seal it, collect it",
        text: "Deals are sealed and we pick up from anywhere in Australia, often the same day.",
        gain: "Your surplus gets a second life instead of a skip bin.",
      },
      paid: {
        tag: "100% upfront",
        title: "Paid upfront",
        text: "No invoices chasing, no delays. Every pallet tracked door to door.",
        gain: "Every sale means less good food thrown away.",
      },
    },
    proof: [
      ["0", "Minimum order"],
      ["Same day", "Answers and pick-ups"],
      ["100%", "Paid upfront"],
    ],
  },
  vi: {
    stops: {
      tell: {
        tag: "2 phút",
        title: "Cho chúng tôi biết bạn có gì",
        text: "Vài dòng là đủ: hàng gì, bao nhiêu, và khi nào cần chuyển đi.",
        gain: "Không cần đặt hàng tối thiểu. Vài pallet hay cả xe tải đều được.",
      },
      reply: {
        tag: "Cùng ngày",
        title: "Trả lời rất nhanh",
        text: "Đội thu mua của chúng tôi sẽ gửi lại cho bạn một đề nghị rõ ràng.",
        gain: "Quyết định nhanh và số lượng linh hoạt, để hàng không bị ứ đọng.",
      },
      collect: {
        tag: "Khắp nước Úc",
        title: "Chốt, chúng tôi đến lấy",
        text: "Sau khi chốt, chúng tôi lấy hàng ở bất cứ đâu trên khắp nước Úc, thường ngay trong ngày.",
        gain: "Hàng dư của bạn được dùng tiếp, thay vì bị đổ bỏ.",
      },
      paid: {
        tag: "Trả trước 100%",
        title: "Trả trước",
        text: "Không phải đòi hóa đơn, cũng không chậm trễ. Mỗi pallet được theo dõi từ lúc rời kho đến khi tới nơi.",
        gain: "Mỗi lần bán hàng là bớt thực phẩm còn ngon bị bỏ đi.",
      },
    },
    proof: [
      ["0", "Đơn tối thiểu"],
      ["Cùng ngày", "Phản hồi và lấy hàng"],
      ["100%", "Trả trước"],
    ],
  },
  zh: {
    stops: {
      tell: {
        tag: "2 分钟",
        title: "告诉我们你有什么货",
        text: "写几行就够了：什么货、多少，以及什么时候需要出货。",
        gain: "没有最低起订量，几托盘或整车都行。",
      },
      reply: {
        tag: "当天",
        title: "我们很快给你回音",
        text: "我们的采购团队会给你一份清晰的报价。",
        gain: "决定快、数量灵活，货不会积压。",
      },
      collect: {
        tag: "澳洲各地",
        title: "敲定，我们来取货",
        text: "交易敲定后，我们可以到澳洲任何地方取货，通常当天就能取。",
        gain: "你的余货还能再利用，而不是被扔进大垃圾箱。",
      },
      paid: {
        tag: "100% 预付",
        title: "预先付款",
        text: "不用追发票，也不拖延。每一托盘都从出库到送达全程跟踪。",
        gain: "每成交一单，就少一份好食物被丢掉。",
      },
    },
    proof: [
      ["0", "最低起订量"],
      ["当天", "回复与取货"],
      ["100%", "预先付款"],
    ],
  },
  it: {
    stops: {
      tell: {
        tag: "2 min",
        title: "Dicci cosa hai",
        text: "Bastano poche righe: cos’è, quanto ce n’è e quando deve uscire.",
        gain: "Nessun ordine minimo. Qualche pallet o un intero camion.",
      },
      reply: {
        tag: "Stesso giorno",
        title: "Ti rispondiamo subito",
        text: "Il nostro team acquisti ti ricontatta con un’offerta chiara.",
        gain: "Decisioni rapide e quantità flessibili, così la merce non resta mai ferma.",
      },
      collect: {
        tag: "Tutta l’Australia",
        title: "Chiuso, ritiriamo noi.",
        text: "Ritiriamo ovunque in Australia, spesso in giornata.",
        gain: "La tua eccedenza ha una seconda vita, invece del cassonetto.",
      },
      paid: {
        tag: "100% in anticipo",
        title: "Pagati subito",
        text: "Niente solleciti di fattura, niente ritardi. Ogni pallet è tracciato dal ritiro alla consegna.",
        gain: "Ogni affare vuol dire meno spreco alimentare.",
      },
    },
    proof: [
      ["0", "Ordine minimo"],
      ["Stesso giorno", "Risposte e ritiri"],
      ["100%", "Pagamento anticipato"],
    ],
  },
  ja: {
    stops: {
      tell: {
        tag: "2分",
        title: "在庫を教えてください",
        text: "数行で十分です。商品、数量、動かしたい時期を書いてください。",
        gain: "最低発注数はなし。数パレットでも、トラック1台分でも。",
      },
      reply: {
        tag: "当日",
        title: "すぐにご返信します",
        text: "買い取りチームから、明確な条件でご連絡します。",
        gain: "判断が早く数量も柔軟なので、在庫が滞りません。",
      },
      collect: {
        tag: "オーストラリア全土",
        title: "成約後にお引き取り",
        text: "成約したら、どこからでも引き取ります。多くは当日中です。",
        gain: "余った商品が捨てられずに、もう一度役立ちます。",
      },
      paid: {
        tag: "100%前払い",
        title: "先にお支払い",
        text: "請求書の催促も、支払いの遅れもありません。パレットは引き取りから納品まで追跡します。",
        gain: "取引のたびに、食品ロスが減ります。",
      },
    },
    proof: [
      ["0", "最低発注数"],
      ["当日", "返信と引き取り"],
      ["100%", "前払い"],
    ],
  },
});
