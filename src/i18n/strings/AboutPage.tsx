import { defineStrings } from "..";

/** The "food waste" highlight, with its hand-drawn underline. */
function mark(text: string) {
  return (
    <span className="ah-mark">
      {text}
      <svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M4 13C70 5 160 4 296 9" />
      </svg>
    </span>
  );
}

/** About page: our story and the seal sticker. */
export const aboutPageStrings = defineStrings({
  en: {
    eyebrow: "About us",
    title: (
      <>
        Fighting{" "}
        {mark("food waste")}{" "}
        <em className="ah-italic">since 1995.</em>
      </>
    ),
    lead: "It started with a simple idea: perfectly good food should never go to waste.",
    storyOne:
      "We buy close-to-date, past best-before and surplus stock from suppliers all over Australia, then sell it for a fraction of the price. Same great brands, same great quality, just a lot cheaper.",
    storyTwo: (
      <>
        What began as a small shop selling jam has grown into four much-loved stores. Ridiculous prices, a{" "}
        <em>serious</em> purpose.
      </>
    ),
    why: (
      <>
        <b>Why it matters:</b> wasted food makes up about 6% of the world’s greenhouse gas emissions, roughly three
        times all of aviation.{" "}
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          Source: Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["Up to 70% off", "Big-brand groceries"],
      ["Zero landfill", "Good food gets eaten"],
      ["4 inner-Melb shops", "New stock daily"],
    ],
    sealUnder: (
      <>
        Still
        <br />
        here.
      </>
    ),
    sealEst: "Est.",
    sealPlace: "Melbourne",
  },
  vi: {
    eyebrow: "Về chúng tôi",
    title: (
      <>
        Chống{" "}
        {mark("lãng phí thực phẩm")}{" "}
        <em className="ah-italic">từ năm 1995.</em>
      </>
    ),
    lead: "Tất cả bắt đầu từ một ý tưởng đơn giản: thực phẩm còn ngon thì không bao giờ nên bị lãng phí.",
    storyOne:
      "Chúng tôi mua hàng gần hạn, hàng đã qua “tốt nhất trước ngày” và hàng tồn dư từ các nhà cung cấp khắp nước Úc, rồi bán lại với giá chỉ bằng một phần nhỏ. Vẫn là những thương hiệu quen thuộc, vẫn chất lượng ấy, chỉ rẻ hơn nhiều.",
    storyTwo: (
      <>
        Từ một cửa hàng nhỏ bán mứt, chúng tôi đã lớn thành bốn cửa hàng được nhiều người yêu mến. Giá rẻ đến khó tin,
        còn sứ mệnh thì rất <em>nghiêm túc</em>.
      </>
    ),
    why: (
      <>
        <b>Vì sao điều này quan trọng:</b> thực phẩm bị lãng phí chiếm khoảng 6% lượng khí thải nhà kính toàn cầu, gấp
        khoảng ba lần toàn bộ ngành hàng không.{" "}
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          Nguồn: Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["Giảm đến 70%", "Thực phẩm hàng hiệu"],
      ["Không ra bãi rác", "Đồ ngon được ăn hết"],
      ["4 cửa hàng nội thành", "Hàng mới mỗi ngày"],
    ],
    sealUnder: (
      <>
        Vẫn
        <br />
        ở đây.
      </>
    ),
    sealEst: "Từ",
    sealPlace: "Melbourne",
  },
  zh: {
    eyebrow: "关于我们",
    title: (
      <>
        对抗{mark("食物浪费")}，<em className="ah-italic">自&nbsp;1995&nbsp;年至今。</em>
      </>
    ),
    lead: "一切始于一个简单的想法：好好的食物，绝不该被浪费。",
    storyOne:
      "我们从澳洲各地的供应商那里收购临近保质期、已过最佳食用期的货，以及多余的存货，再以原价几分之一的价格卖出。同样的大牌，同样的好品质，只是便宜多了。",
    storyTwo: (
      <>
        从一家卖果酱的小店起步，如今已经发展成四家深受喜爱的门店。价格便宜到离谱，使命却很<em>认真</em>。
      </>
    ),
    why: (
      <>
        <b>为什么重要：</b>被浪费的食物约占全球温室气体排放的 6%，大约是整个航空业的三倍。
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          来源：Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["最高立减 70%", "大牌食品"],
      ["不进垃圾场", "好东西都被吃光"],
      ["墨尔本市区 4 家门店", "每天上新"],
    ],
    sealUnder: (
      <>
        还在
        <br />
        这儿。
      </>
    ),
    sealEst: "始于",
    sealPlace: "墨尔本",
  },
});
