import { defineStrings } from "..";

/** Copy on the three product posters (Showcase). Product names and pack labels stay English. */
export const showcaseStrings = defineStrings({
  en: {
    /** Brand line, pack size and alt text, by product. */
    products: {
      fizz: { brand: "Blood orange", unit: "4 × 330ml", alt: "Four cans of blood orange fizz" },
      ramen: { brand: "Instant noodles", unit: "4 pack", alt: "Bag of spicy instant ramen" },
      choc: { brand: "Choc-biscuit", unit: "Limited", alt: "Chocolate biscuit bar" },
    },
    /** Screen-reader heading: brand, product name, price, pack size. */
    heading: (brand: string, name: string, price: string, unit: string) => `${brand} ${name}, ${price} — ${unit}`,
    /** Struck-through RRP. */
    was: (price: string) => `was ${price}`,
    /** Savings tag. */
    save: (amount: string) => `save ${amount}`,
    crav: {
      sticker: ["FIZZ", "ALERT"],
      caption: "Four cans of Italian sunshine for four bucks. That’s a dollar a can — do the maths.",
      origin: "Made with Italian oranges and bottled with zero apologies since 1932.",
    },
    bucks: {
      chip: "Gourmet spicy",
      sub: "Meet the noodles that make Tuesday less sad.",
      tasteTitle: "Taste profile",
      taste: ["Rich, savoury broth leads", "Chilli heat creeps up slowly", "Springy noodles, serious comfort", "Gourmet spicy, not scary"],
      pairsTitle: "Pairs with",
      pairs: "Soft-boiled egg, spring onion, kimchi, a slice of cheese (trust us), leftover roast chicken, crispy shallots and a very long weekend.",
      flame: "Gourmet spicy",
      medal: "Premium",
      pack: "4 pack",
      pot: "One pot",
      find: "Find it in store",
      bowl: "a dollar a bowl",
    },
    cookie: {
      hashtag: "#ChocMeetsBiscuit",
      inside: ["BISCUIT", "INSIDE"],
      limited: ["LIMITED", "RUN"],
      only: "ONLY",
      sharing: ["SHARING", "OPTIONAL"],
      def: (
        <>
          <b>/bis·koff/</b> (noun)<br />a biscuit with chocolate ambitions.
        </>
      ),
      blurb: "Chocolate met a biscuit. It was serious. Grab one before they’re gone.",
      find: "Find a store",
    },
  },
  vi: {
    products: {
      fizz: { brand: "Blood orange", unit: "4 × 330ml", alt: "Bốn lon Blood orange fizz" },
      ramen: { brand: "Mì ăn liền", unit: "4 gói", alt: "Gói mì ăn liền vị cay" },
      choc: { brand: "Choc-biscuit", unit: "Có hạn", alt: "Thanh bánh quy sô-cô-la" },
    },
    heading: (brand, name, price, unit) => `${brand} ${name}, ${price} — ${unit}`,
    was: (price) => `giá cũ ${price}`,
    save: (amount) => `tiết kiệm ${amount}`,
    crav: {
      sticker: ["SỦI", "BÙNG!"],
      caption: "Bốn lon nắng Ý chỉ $4, tức mỗi lon $1. Tự tính thử đi!",
      origin: "Làm từ cam Ý, đóng chai từ năm 1932, không một lời xin lỗi.",
    },
    bucks: {
      chip: "Cay sang chảnh",
      sub: "Gặp món mì giúp thứ Ba bớt buồn hơn.",
      tasteTitle: "Hồ sơ hương vị",
      taste: ["Nước dùng đậm đà dẫn đầu", "Vị cay len lên từ từ", "Sợi mì dai, ấm lòng thật sự", "Cay sang chảnh, không hề đáng sợ"],
      pairsTitle: "Ăn kèm với",
      pairs: "Trứng lòng đào, hành lá, kim chi, một lát phô mai (tin chúng tôi đi), gà quay thừa, hành phi giòn và một kỳ nghỉ cuối tuần thật dài.",
      flame: "Cay sang chảnh",
      medal: "Cao cấp",
      pack: "4 gói",
      pot: "Một nồi",
      find: "Tìm mua ở cửa hàng",
      bowl: "$1 một tô",
    },
    cookie: {
      hashtag: "#SôcôlaGặpBánhQuy",
      inside: ["BÁNH QUY", "BÊN TRONG"],
      limited: ["SỐ LƯỢNG", "CÓ HẠN"],
      only: "CHỈ",
      sharing: ["CHIA SẺ", "TÙY Ý"],
      def: (
        <>
          <b>/bích·quy/</b> (danh từ)<br />bánh quy mang tham vọng sô-cô-la.
        </>
      ),
      blurb: "Sô-cô-la gặp bánh quy, nghiêm túc lắm. Lấy một cái kẻo hết nhé!",
      find: "Tìm cửa hàng",
    },
  },
  zh: {
    products: {
      fizz: { brand: "Blood orange", unit: "4 × 330ml", alt: "四罐 Blood orange fizz" },
      ramen: { brand: "方便面", unit: "4 包装", alt: "一袋辣味方便面" },
      choc: { brand: "Choc-biscuit", unit: "限量", alt: "巧克力饼干棒" },
    },
    heading: (brand, name, price, unit) => `${brand} ${name}，${price} — ${unit}`,
    was: (price) => `原价 ${price}`,
    save: (amount) => `省 ${amount}`,
    crav: {
      sticker: ["气泡", "警报"],
      caption: "四罐意式阳光只要 $4。每罐才 $1，你算算！",
      origin: "用意大利橙酿造，1932 年装瓶至今，从不道歉。",
    },
    bucks: {
      chip: "精致香辣",
      sub: "让周二没那么丧的那碗面。",
      tasteTitle: "风味档案",
      taste: ["浓郁鲜香的汤底打头阵", "辣味慢慢上头", "面条劲道，治愈感满满", "精致香辣，不吓人"],
      pairsTitle: "搭配",
      pairs: "溏心蛋、葱花、泡菜、一片芝士（相信我们）、剩烤鸡、香脆葱酥，还有一个超长的周末。",
      flame: "精致香辣",
      medal: "高端",
      pack: "4 包装",
      pot: "一锅搞定",
      find: "到门店找",
      bowl: "每碗 $1",
    },
    cookie: {
      hashtag: "#巧克力遇见饼干",
      inside: ["饼干", "夹心"],
      limited: ["限量", "发售"],
      only: "仅售",
      sharing: ["分享", "随意"],
      def: (
        <>
          <b>/bǐng·gān/</b>（名词）<br />一块心怀巧克力梦想的饼干。
        </>
      ),
      blurb: "巧克力遇上饼干，认真了。快抢一块，卖完即止！",
      find: "找门店",
    },
  },
});
