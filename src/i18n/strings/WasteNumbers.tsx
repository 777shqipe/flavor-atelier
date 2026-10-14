import { defineStrings } from "..";

/**
 * The figures are copy, not data: each language writes its own (vi uses dots for thousands
 * and a decimal comma, zh counts in 万 and 亿). The odometer digits are read from these.
 */
export const wasteNumbersStrings = defineStrings({
  en: {
    eyebrow: "Why it matters",
    title: "Good food, binned by the tonne.",
    lead: "Most of what Australia throws away was fine to eat. That is the gap we work in: surplus, overstock and short dates, bought before they become a statistic.",
    full: "Full.",
    tower: {
      num: "250,000",
      unit: "tonnes",
      text: (
        <>
          Good food thrown out by Victorian households every year. <b>Enough to fill Eureka Tower.</b>
        </>
      ),
    },
    bags: { connector: "in", text: "bags of groceries end up in the bin, roughly." },
    big: {
      num: "7.6",
      unit: "million tonnes",
      text: (
        <>
          of food wasted across Australia every year, farm to fork. Worth about <b>$36.6 billion</b>.
        </>
      ),
    },
    edible: { num: "70", text: "of it was still good to eat." },
    cite: (name: string) => `Source: ${name}`,
  },
  vi: {
    eyebrow: "Vì sao quan trọng",
    title: "Đồ ăn ngon, đổ đi cả tấn.",
    lead: "Phần lớn những gì nước Úc vứt đi vốn vẫn còn ăn ngon. Đó chính là khoảng trống của chúng tôi: hàng dư, hàng tồn, hàng gần hết hạn, được mua trước khi thành một con số thống kê.",
    full: "Đầy rồi.",
    tower: {
      num: "250.000",
      unit: "tấn",
      text: (
        <>
          Đồ ăn ngon bị các hộ gia đình Victoria vứt bỏ mỗi năm. <b>Đủ để lấp đầy Eureka Tower.</b>
        </>
      ),
    },
    bags: { connector: "trong", text: "túi hàng tạp hóa bị vứt vào thùng rác, khoảng chừng." },
    big: {
      num: "7,6",
      unit: "triệu tấn",
      text: (
        <>
          thực phẩm bị lãng phí khắp nước Úc mỗi năm, từ nông trại đến bàn ăn. Trị giá khoảng <b>$36.6 tỷ</b>.
        </>
      ),
    },
    edible: { num: "70", text: "trong số đó vẫn còn ăn được." },
    cite: (name: string) => `Nguồn: ${name}`,
  },
  zh: {
    eyebrow: "为什么重要",
    title: "好端端的食物，成吨地被扔掉。",
    lead: "澳大利亚被扔掉的东西，大多本来都能吃。这正是我们的用武之地：富余货、积压货和临期货，在变成一个统计数字之前，就被我们买下。",
    full: "满了。",
    tower: {
      num: "25",
      unit: "万吨",
      text: (
        <>
          维多利亚州家庭每年扔掉的好食物，<b>足够填满 Eureka Tower。</b>
        </>
      ),
    },
    bags: { connector: "/", text: "袋杂货，大约最后进了垃圾桶。" },
    big: {
      num: "760",
      unit: "万吨",
      text: (
        <>
          的食物在澳大利亚每年被浪费，从农场到餐桌，价值约 <b>$366 亿</b>。
        </>
      ),
    },
    edible: { num: "70", text: "其中仍然可以吃。" },
    cite: (name: string) => `来源：${name}`,
  },
  it: {
    eyebrow: "Perché conta",
    title: "Cibo buono, buttato a tonnellate.",
    lead: "La maggior parte del cibo che l’Australia butta via era ancora buono da mangiare. È la nicchia in cui lavoriamo: eccedenze, invenduti e prodotti a scadenza ravvicinata, comprati prima di diventare una statistica.",
    full: "Pieno.",
    tower: {
      num: "250.000",
      unit: "tonnellate",
      text: (
        <>
          Cibo buono buttato via dalle famiglie del Victoria ogni anno. <b>Abbastanza per riempire l’Eureka Tower.</b>
        </>
      ),
    },
    bags: { connector: "su", text: "borse della spesa finiscono nel cestino, più o meno." },
    big: {
      num: "7,6",
      unit: "milioni di tonnellate",
      text: (
        <>
          di spreco alimentare in tutta l’Australia ogni anno, dai campi alla tavola. Vale circa <b>$36.6 miliardi</b>.
        </>
      ),
    },
    edible: { num: "70", text: "di questo era ancora buono da mangiare." },
    cite: (name: string) => `Fonte: ${name}`,
  },
  ja: {
    eyebrow: "なぜ大切？",
    title: "食べられる食品が、トン単位で捨てられています。",
    lead: "オーストラリアで捨てられる食品の大半は、もともと食べられるものです。私たちは、その隙間で働いています。余剰品や過剰在庫、期限の近い商品を、統計の数字になる前に仕入れています。",
    full: "満杯。",
    tower: {
      num: "25",
      unit: "万トン",
      text: (
        <>
          まだ食べられる食品が、ビクトリア州の家庭で毎年捨てられています。<b>ユーレカ・タワーがいっぱいになる量です。</b>
        </>
      ),
    },
    bags: { connector: "/", text: "買い物袋分の食品が、だいたいゴミ箱に入っています。" },
    big: {
      num: "760",
      unit: "万トン",
      text: (
        <>
          の食品ロスが、オーストラリアで毎年出ています。農場から食卓まで、価値は約<b>$366億</b>です。
        </>
      ),
    },
    edible: { num: "70", text: "は、まだ食べられる状態でした。" },
    cite: (name: string) => `出典：${name}`,
  },
});
