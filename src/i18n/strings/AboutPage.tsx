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
    lead: "Mọi chuyện bắt đầu từ một ý tưởng đơn giản: đồ ăn còn ngon thì đừng bao giờ để phí.",
    storyOne:
      "Chúng tôi mua hàng gần hạn, hàng đã qua ngày “dùng tốt nhất trước” và hàng dư từ các nhà cung cấp khắp nước Úc, rồi bán lại với giá chỉ bằng một phần nhỏ giá gốc. Vẫn những thương hiệu quen thuộc, chất lượng vẫn tốt như thường, chỉ là rẻ hơn nhiều.",
    storyTwo: (
      <>
        Khởi đầu là một tiệm mứt nhỏ, giờ chúng tôi đã có bốn cửa hàng được nhiều người yêu mến. Giá rẻ đến khó tin,
        còn mục đích thì rất <em>nghiêm túc</em>.
      </>
    ),
    why: (
      <>
        <b>Vì sao điều này quan trọng:</b> thực phẩm bị lãng phí chiếm khoảng 6% lượng khí thải nhà kính toàn cầu, xấp xỉ gấp
        ba lần lượng khí thải của cả ngành hàng không.{" "}
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          Nguồn: Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["Giảm đến 70%", "Thực phẩm hàng hiệu"],
      ["Không ra bãi rác", "Đồ ngon đều có người ăn"],
      ["4 cửa hàng nội thành", "Hàng mới mỗi ngày"],
    ],
    sealUnder: (
      <>
        Vẫn
        <br />
        còn đây.
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
      "我们从澳洲各地的供应商手里收购临期、已过最佳食用期的货和多余库存，再以原价几分之一的价格卖出。同样的大牌，同样的好品质，就是便宜多了。",
    storyTwo: (
      <>
        从一家卖果酱的小店起步，如今已经发展成四家深受喜爱的门店。价格低得离谱，干的却是<em>正经</em>事。
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
      ["最高省 70%", "大牌食品"],
      ["零填埋", "好食物都有人吃"],
      ["墨尔本市区 4 家门店", "每天上新"],
    ],
    sealUnder: (
      <>
        一直
        <br />
        都在。
      </>
    ),
    sealEst: "始于",
    sealPlace: "墨尔本",
  },
  it: {
    eyebrow: "Chi siamo",
    title: (
      <>
        Contro lo{" "}
        {mark("spreco alimentare")}{" "}
        <em className="ah-italic">dal 1995.</em>
      </>
    ),
    lead: "Tutto è nato da un’idea semplice: il cibo perfettamente buono non dovrebbe mai andare sprecato.",
    storyOne:
      "Compriamo da fornitori di tutta l’Australia merce in scadenza, con il “preferibilmente entro” già passato o semplicemente in eccesso, e la rivendiamo a una frazione del prezzo. Stesse grandi marche, stessa qualità, solo molto più convenienti.",
    storyTwo: (
      <>
        Da un piccolo negozio di marmellate siamo diventati quattro negozi amatissimi. Prezzi pazzeschi, una missione <em>seria</em>.
      </>
    ),
    why: (
      <>
        <b>Perché conta:</b> il cibo sprecato rappresenta circa il 6% delle emissioni globali di gas serra, circa tre volte
        quelle dell’intera aviazione.{" "}
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          Fonte: Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["Fino a -70%", "Prodotti di grandi marche"],
      ["Zero discarica", "Tutto finisce in tavola"],
      ["4 negozi in centro", "Novità ogni giorno"],
    ],
    sealUnder: (
      <>
        Ancora
        <br />
        qui.
      </>
    ),
    sealEst: "Dal",
    sealPlace: "Melbourne",
  },
  ja: {
    eyebrow: "私たちについて",
    title: (
      <>
        {mark("食品ロス")}と戦いつづけて、<em className="ah-italic">1995年から。</em>
      </>
    ),
    lead: "始まりは、シンプルな思いでした。まだおいしく食べられるものを、ムダにしてはいけない。",
    storyOne:
      "オーストラリア各地のサプライヤーから、賞味期限が近いもの・過ぎたものや余剰在庫を仕入れ、通常の何分の一かの価格で販売しています。おなじみのブランドも品質もそのままで、お値段だけぐっとお手ごろに。",
    storyTwo: (
      <>
        ジャムを売る小さなお店から始まり、今では地元で愛される4店舗にまで成長しました。びっくり価格に、<em>本気</em>の想い。
      </>
    ),
    why: (
      <>
        <b>なぜ大切なのか：</b>食品ロスは世界の温室効果ガス排出量の約6%を占めていて、これは航空業界全体のおよそ3倍にあたります。{" "}
        <a href="https://ourworldindata.org/food-waste-emissions" target="_blank" rel="noreferrer">
          出典：Our World in Data
        </a>
      </>
    ),
    pillars: [
      ["最大70%オフ", "人気ブランドの食品"],
      ["埋め立てゼロ", "おいしいものは、ちゃんと食卓へ"],
      ["メルボルン市内に4店舗", "毎日、続々入荷"],
    ],
    sealUnder: (
      <>
        今も
        <br />
        健在。
      </>
    ),
    sealEst: "創業",
    sealPlace: "メルボルン",
  },
});
