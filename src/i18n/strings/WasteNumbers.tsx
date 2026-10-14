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
});
