import { useState, type CSSProperties } from "react";
import { useLang, useT } from "./i18n";
import { instaShelfStrings } from "./i18n/strings/InstaShelf";
import { CutLine } from "./Flyer";
import { LogoMark } from "./Logo";
import { RingBadge } from "./RingBadge";
import { useInstagramFeed, type InstagramFeedData, type QaItemData } from "./useInstagramFeed";
import "./insta.css";

/** Each print sits on the shelf a touch crooked; the pattern repeats so it never looks random-generated. */
const TILTS = [-1.1, 0.8, -0.6, 1.05, -0.85, 0.7];
const slotStyle = (i: number, scale = 1) => ({ "--i": i, "--tilt": `${(TILTS[i % TILTS.length] * scale).toFixed(2)}deg` }) as CSSProperties;

const PROFILE = "https://www.instagram.com/cheaperbuymiles/";
const HANDLE = "cheaperbuymiles";

/** Built-in fallback feed data so the shelf renders immediately even offline */
const FALLBACK_FEED: InstagramFeedData = {
  lastChecked: "2026-10-16T12:00:00Z",
  handle: HANDLE,
  profileUrl: PROFILE,
  storeNotice: {
    id: "fitzroy-update",
    storeId: "fitzroy",
    href: "https://www.instagram.com/p/DefpGShTr0g/",
    img: "/media/ig/fitzroy-update.jpg",
    date: "2026-10-14",
    tag: "Store Update",
    title: {
      en: "Fitzroy Store Temporary Update",
      it: "Chiusura Temporanea Store Fitzroy",
      vi: "Cập nhật tạm thời cửa hàng Fitzroy",
      zh: "Fitzroy 门店临时通知",
      ja: "Fitzroy店 臨時休業のおしらせ",
    },
    dates: {
      en: "Tuesday 20 & Wednesday 21 October",
      it: "Martedì 20 e Mercoledì 21 Ottobre",
      vi: "Thứ Ba 20 & Thứ Tư 21 Tháng 10",
      zh: "10月20日（周二）与21日（周三）",
      ja: "10月20日(火)・21日(水)",
    },
    reopen: {
      en: "Reopening Thursday 22 October",
      it: "Riapertura regolare Giovedì 22 Ottobre",
      vi: "Mở cửa lại Thứ Năm 22 Tháng 10",
      zh: "10月22日（周四）恢复营业",
      ja: "10月22日(木)より通常営業",
    },
    caption: {
      en: "Our Fitzroy store will be closing on Tuesday 20th and Wednesday 21st for a store update! Be sure to pop in before to stock up. Back open as usual on Thursday! Our Brunswick, Flemington and Footscray stores remain open as usual.",
      it: "Lo store di Fitzroy chiude martedì 20 e mercoledì 21 ottobre per rinnovo e allestimento nuovi arrivi! Fai scorta prima della chiusura. Riapriremo giovedì 22 come sempre! Brunswick, Flemington e Footscray sono regolarmente aperti.",
      vi: "Cửa hàng Fitzroy sẽ đóng cửa vào Thứ Ba ngày 20 và Thứ Tư ngày 21 để nâng cấp cửa hàng! Hãy ghé trước đó để mua sắm dự trữ. Chúng tôi sẽ mở cửa lại bình thường vào Thứ Năm! Các cửa hàng Brunswick, Flemington và Footscray vẫn mở cửa bình thường.",
      zh: "我们的 Fitzroy 门店将于10月20日（周二）和21日（周三）因店内升级改造暂停营业两天！请大家提前采购。周四将按正常时间恢复营业！Brunswick、Flemington 和 Footscray 门店均正常营业。",
      ja: "Fitzroy店は店舗改装のため、10月20日(火)・21日(水)の2日間臨時休業いたします。ぜひ事前にお買い求めください。木曜日より通常営業を再開いたします！なお、Brunswick店、Flemington店、Footscray店は通常通り営業しております。",
    },
  },
  foodPosts: [
    {
      id: "lasagne",
      type: "hero",
      href: "https://www.instagram.com/p/DeLjrMMmlVI",
      img: "/media/ig/lasagne.jpg",
      date: "2026-10-07",
      size: "2kg",
      price: "$8",
      aisle: { en: "Frozen", it: "Surgelati", vi: "Đông lạnh", zh: "冷冻食品", ja: "冷凍食品" },
      where: { en: "Selected stores", it: "Alcuni negozi", vi: "Một số cửa hàng", zh: "部分门店", ja: "一部店舗" },
      name: { en: "Pork & beef lasagne", it: "Lasagne maiale e manzo", vi: "Lasagne thịt heo & bò", zh: "猪肉牛肉千层面", ja: "ポーク＆ビーフラザニア" },
      quip: { en: "Feeds six. Or just you, by Wednesday.", it: "Basta per sei. O solo per te, entro mercoledì.", vi: "Đủ cho sáu người. Hoặc một mình bạn đến thứ Tư.", zh: "够吃六个人。或者你自己吃到周三。", ja: "6人前。水曜までならあなた1人でも。" },
    },
    {
      id: "icecream",
      type: "hero",
      href: "https://www.instagram.com/p/DeQtNqlGlu6",
      img: "/media/ig/icecream.jpg",
      date: "2026-10-09",
      size: "5L",
      price: "$12",
      aisle: { en: "Frozen", it: "Surgelati", vi: "Đông lạnh", zh: "冷冻食品", ja: "冷凍食品" },
      where: { en: "Four stores", it: "Quattro negozi", vi: "Cả 4 cửa hàng", zh: "四家门店均有", ja: "全4店舗" },
      name: { en: "Speculoos ice cream", it: "Gelato Speculoos", vi: "Kem bánh quy Speculoos", zh: "焦糖饼干冰淇淋", ja: "スペキュロスアイス" },
      quip: { en: "It’s not a tub. It’s a commitment.", it: "Non è una vaschetta. È un impegno.", vi: "Không chỉ là hộp kem. Đó là lời cam kết.", zh: "这不是一桶，这是一份承诺。", ja: "ただの容器じゃない。覚悟のサイズ。" },
    },
    {
      id: "tempeh",
      type: "ticket",
      href: "https://www.instagram.com/p/DeJAYIEGtn8",
      img: "/media/ig/tempeh.jpg",
      date: "2026-10-06",
      size: "200g",
      price: "3 for $5",
      tag: { en: "New in", it: "Novità", vi: "Hàng mới", zh: "新上架", ja: "新入荷" },
      name: { en: "Murni tempeh", it: "Murni tempeh", vi: "Tempeh Murni", zh: "Murni 印尼丹贝", ja: "Murni テンペ" },
      quip: { en: "Tofu’s cooler cousin. Three for a fiver.", it: "Il cugino più figo del tofu. Tre per $5.", vi: "Anh em chất chơi của đậu hũ. Ba gói 5 đô.", zh: "豆腐的潮范儿表亲。5块钱拿三包。", ja: "豆腐のいとこ。5ドルで3個。" },
    },
    {
      id: "mikeike",
      type: "ticket",
      href: "https://www.instagram.com/p/DeQsJFAGspS",
      img: "/media/ig/mikeike.jpg",
      date: "2026-10-09",
      size: "120g",
      price: "$2",
      tag: { en: "Sour", it: "Aspro", vi: "Chua", zh: "超酸", ja: "サワー" },
      name: { en: "Mike and Ike", it: "Mike and Ike", vi: "Kẹo dẻo Mike & Ike", zh: "Mike and Ike 软糖", ja: "マイク＆アイク" },
      quip: { en: "Sour enough to make your face do the thing.", it: "Così acide da farti storcere la faccia.", vi: "Chua đến mức mặt bạn phải nhăn lại.", zh: "酸到让你当场挤眉弄眼。", ja: "思わず変な顔になるすっぱさ。" },
    },
    {
      id: "almond",
      type: "ticket",
      href: "https://www.instagram.com/p/DeLrKMPmnE8",
      img: "/media/ig/almond.jpg",
      date: "2026-10-07",
      size: "1L",
      price: "$2",
      tag: { en: "Barista", it: "Barista", vi: "Barista", zh: "咖啡师版", ja: "バリスタ" },
      name: { en: "Almond milk", it: "Latte di mandorla", vi: "Sữa hạnh nhân Barista", zh: "杏仁奶", ja: "アーモンドミルク" },
      quip: { en: "Froths like it owns a man bun.", it: "Monta come un barista hipster.", vi: "Đánh bọt đỉnh như thợ pha chế sành điệu.", zh: "奶泡打得像扎了小辫的咖啡师一样专业。", ja: "ヒップスター顔負けのきめ細かな泡立ち。" },
    },
    {
      id: "water",
      type: "ticket",
      href: "https://www.instagram.com/p/DeNzpaOGk3Z",
      img: "/media/ig/water.jpg",
      date: "2026-10-08",
      size: "1L",
      price: "$1",
      tag: { en: "Chill", it: "Fresca", vi: "Mát lạnh", zh: "清爽", ja: "チル" },
      name: { en: "Spring water", it: "Acqua di sorgente", vi: "Nước khoáng thiên nhiên", zh: "天然泉水", ja: "スプリングウォーター" },
      quip: { en: "A buck. Melbourne’s four seasons not included.", it: "Solo $1. Le quattro stagioni di Melbourne escluse.", vi: "Chỉ một đô. Không kèm bốn mùa Melbourne.", zh: "一块钱。墨尔本一日四季除外。", ja: "たったの1ドル。メルボルンの気まぐれ天気は別料金。" },
    },
  ],
  peoplePosts: [
    {
      id: "staff-picks",
      href: "https://www.instagram.com/reel/DYycd9_vrQ5/",
      img: "/media/ig/staff-picks-reel.jpg",
      date: "2026-10-12",
      duration: "0:38",
      author: "Brunswick & Footscray Crew",
      tag: "Staff Picks",
      title: {
        en: "This week's staff picks! 🏃🛒",
        it: "I preferiti dello staff di questa settimana! 🏃🛒",
        vi: "Lựa chọn của nhân viên tuần này! 🏃🛒",
        zh: "本周员工心头好推荐！🏃🛒",
        ja: "今週のスタッフいちおしアイテム！🏃🛒",
      },
      highlight: {
        en: "Remedy Blood Orange ($3) & Barilla Pomodoro ($2)",
        it: "Remedy Blood Orange ($3) & Barilla Pomodoro ($2)",
        vi: "Remedy Blood Orange ($3) & sốt Barilla ($2)",
        zh: "Remedy 血橙气泡饮 ($3) 与 Barilla 意面酱 ($2)",
        ja: "Remedy ブラッドオレンジ($3) ＆ バリラソース($2)",
      },
      quip: {
        en: "“Take them before we buy them all ourselves.”",
        it: "“Prendeteli prima che ce li compriamo tutti noi.”",
        vi: "“Mua lẹ kẻo nhân viên tự vét sạch đấy.”",
        zh: "“赶紧来抢，不然全被我们员工内购了。”",
        ja: "“私たちスタッフが買い占める前にゲットしてね。”",
      },
      video: true,
    },
    {
      id: "pallet-unboxing",
      href: "https://www.instagram.com/cheaperbuymiles/reels/",
      img: "/media/about-basket.jpg",
      date: "2026-10-10",
      duration: "0:45",
      author: "Flemington Store Team",
      tag: "Store Life",
      title: {
        en: "Mystery Pallet Drop Unboxing 📦",
        it: "Unboxing del Pallet Misterioso 📦",
        vi: "Khui kiện hàng bí ẩn mỗi ngày 📦",
        zh: "神秘货盘现场开箱 📦",
        ja: "ミステリーパレット開封！📦",
      },
      highlight: {
        en: "Imported European snacks & Japanese iced teas",
        it: "Snack europei importati & tè freddi giapponesi",
        vi: "Bánh kẹo nhập khẩu châu Âu & trà Nhật",
        zh: "进口欧洲零食与日本冷泡茶",
        ja: "ヨーロッパ直輸入スナック＆日本のお茶",
      },
      quip: {
        en: "“The delivery truck just pulled in and Christmas came early.”",
        it: "“È appena arrivato il camion delle consegne: sembra Natale in anticipo.”",
        vi: "“Xe tải vừa tới, cảm giác như Giáng sinh đến sớm.”",
        zh: "“货车刚停好，我们已经像提前过圣诞节一样开心。”",
        ja: "“トラックが到着！一足早いクリスマスの気分。”",
      },
      video: true,
    },
    {
      id: "taste-test",
      href: "https://www.instagram.com/cheaperbuymiles/reels/",
      img: "/media/about-shelf.jpg",
      date: "2026-10-05",
      duration: "0:52",
      author: "Fitzroy Team",
      tag: "Team Fun",
      title: {
        en: "The Past-Date Taste Test 🍪",
        it: "Test d'assaggio: Data di scadenza vs Realtà 🍪",
        vi: "Thử thách nếm đồ cận date 🍪",
        zh: "赏味期盲测大挑战 🍪",
        ja: "賞味期限テイスティング検証 🍪",
      },
      highlight: {
        en: "Speculoos biscuits 2 weeks past date — super crunchy!",
        it: "Biscotti Speculoos passati di 2 settimane — croccantissimi!",
        vi: "Bánh quy Speculoos qua 2 tuần — vẫn giòn rụm!",
        zh: "过赏味期2周的焦糖饼干——依然香脆绝顶！",
        ja: "賞味期限を2週間過ぎたビスケット — サクサク感そのまま！",
      },
      quip: {
        en: "“Spoiler: Best Before is quality, not safety. Still delicious!”",
        it: "“Spoiler: Best Before riguarda la qualità, non la sicurezza. Buonissimo!”",
        vi: "“Bật mí: Best Before chỉ là độ tươi ngon, ăn vẫn cực ngon!”",
        zh: "“剧透一下：最佳赏味期关乎风味而非变质。真的超好吃！”",
        ja: "“ネタバレ：賞味期限はおいしさの目安。普通に絶品です！”",
      },
      video: true,
    },
  ],
  qa: [
    {
      id: "why-cheap",
      asker: "@bargain_hunter_melb",
      badge: { en: "Top Question", it: "Più Richiesta", vi: "Câu hỏi hot", zh: "高频提问", ja: "人気質問" },
      tag: { en: "Surplus Secret", it: "Il Segreto", vi: "Bí quyết giá rẻ", zh: "低价揭秘", ja: "安さの秘密" },
      question: {
        en: "How can you sell everything so cheap? What's the catch?",
        it: "Come fate a vendere tutto a prezzi così bassi? Dov'è il trucco?",
        vi: "Sao quán bán rẻ dữ vậy? Có bẫy gì không?",
        zh: "你们怎么能卖得这么便宜？有什么猫腻吗？",
        ja: "なんでこんなに安く売れるの？何か裏があるの？",
      },
      answer: {
        en: "Zero catch! We buy surplus production, discontinued packaging, and excess stock directly from food makers to prevent landfill waste. Real brands, up to 75% off!",
        it: "Nessun trucco! Compriamo eccedenze di produzione, cambi packaging e surplus direttamente dai produttori alimentari per evitare che finiscano in discarica. Grandi marche fino al 75% in meno!",
        vi: "Không có bẫy nào cả! Chúng tôi mua hàng dư thừa, hàng đổi bao bì từ nhà sản xuất để chống lãng phí. Hàng hiệu giảm tới 75%!",
        zh: "绝无套路！我们直接向厂家收购多余库存、改版包装和多产批次，拯救即将被填埋的好食品。正品大牌，低至两五折！",
        ja: "裏なんてありません！食品ロスを防ぐため、メーカーの余剰品やパッケージ変更品を直接買い取っています。本物のブランド品が最大75%オフ！",
      },
    },
    {
      id: "best-before",
      asker: "@eco_shopper_vic",
      badge: { en: "Safety & Quality", it: "Sicurezza & Qualità", vi: "Chất lượng & An toàn", zh: "食品安全科普", ja: "安全と品質" },
      tag: { en: "Food Rules", it: "Date di Scadenza", vi: "Quy tắc hạn dùng", zh: "赏味期规则", ja: "期限のルール" },
      question: {
        en: "Is food past its 'Best Before' date safe to eat?",
        it: "Il cibo oltre la data 'Best Before' (Da consumarsi preferibilmente) è sicuro?",
        vi: "Thực phẩm quá hạn 'Best Before' có an toàn không?",
        zh: "过了“最佳赏味期（Best Before）”的食品还能安全食用吗？",
        ja: "「賞味期限（Best Before）」を過ぎた食品は食べても安全？",
      },
      answer: {
        en: "Yes! In Australia, 'Use By' is about safety, while 'Best Before' is only peak manufacturer quality. Sealed dry goods, canned food, snacks, and chocolate stay delicious and completely safe. #PastDateStillGreat",
        it: "Assolutamente sì! In Australia e nel mondo, 'Use By' riguarda la sicurezza sanitaria, mentre 'Best Before' è solo la stima del produttore per la massima fragranza. Pasta, salse, scatolame e cioccolato rimangono perfetti e sicuri. #PastDateStillGreat",
        vi: "Chắc chắn an toàn! 'Use By' mới là hạn sử dụng an toàn, còn 'Best Before' chỉ là độ tươi ngon nhất. Đồ khô, đồ hộp, sô-cô-la vẫn thơm ngon tuyệt hảo. #PastDateStillGreat",
        zh: "完全安全！‘Use By’是安全保质期，而‘Best Before’只是厂家建议的最佳口感期。密封干粮、罐头、零食和巧克力在期后依然安全美味！#PastDateStillGreat",
        ja: "はい！消費期限（Use By）は安全性ですが、賞味期限（Best Before）は美味しさの目安。缶詰やスナック、チョコなどは期限後も安全で美味しくいただけます。#PastDateStillGreat",
      },
    },
    {
      id: "fitzroy-closed",
      asker: "@fitzroy_neighbour",
      badge: { en: "Store Notice", it: "Avviso Negozio", vi: "Thông báo cửa hàng", zh: "门店通知", ja: "店舗案内" },
      tag: { en: "Fitzroy Update", it: "Aggiornamento Fitzroy", vi: "Cập nhật Fitzroy", zh: "Fitzroy 动态", ja: "Fitzroy店" },
      question: {
        en: "Why is the Fitzroy store closed on Tuesday 20 & Wednesday 21 Oct?",
        it: "Perché lo store di Fitzroy è chiuso martedì 20 e mercoledì 21 ottobre?",
        vi: "Tại sao cửa hàng Fitzroy đóng cửa ngày 20 và 21 tháng 10?",
        zh: "为什么 Fitzroy 门店要在10月20日和21日关门两天？",
        ja: "どうしてFitzroy店は10月20日と21日に休業するの？",
      },
      answer: {
        en: "We're doing a quick store update, polish, and massive restock! Brunswick, Flemington, and Footscray are open as normal, and Fitzroy reopens fully on Thursday 22 October.",
        it: "Stiamo facendo un rapido rinnovamento degli spazi e un grande rifornimento di nuovi pallet! Brunswick, Flemington e Footscray sono regolarmente aperti, e Fitzroy riapre al 100% giovedì 22 ottobre.",
        vi: "Chúng tôi đang nâng cấp không gian và nhập thêm hàng loạt kiện hàng mới! Brunswick, Flemington và Footscray vẫn mở bình thường, và Fitzroy sẽ mở lại vào Thứ Năm 22/10.",
        zh: "我们正在对店内进行升级改造并大量补进新货品！Brunswick、Flemington 和 Footscray 门店均正常营业，Fitzroy 将于10月22日（周四）全面恢复营业。",
        ja: "店舗のリニューアルと大量新入荷の陳列を行っています！Brunswick、Flemington、Footscrayは通常通り営業しており、Fitzroy店は10月22日(木)に再開します。",
      },
    },
    {
      id: "store-stock",
      asker: "@snack_scout_3000",
      badge: { en: "Shopping Tips", it: "Consiglio Spesa", vi: "Mẹo mua sắm", zh: "逛店小贴士", ja: "お買い物のコツ" },
      tag: { en: "Treasure Hunt", it: "Caccia al Tesoro", vi: "Săn kho báu", zh: "寻宝之旅", ja: "宝探し" },
      question: {
        en: "Do all 4 stores have the exact same products?",
        it: "Tutti e 4 i negozi hanno gli stessi identici prodotti?",
        vi: "Cả 4 cửa hàng có bán sản phẩm giống hệt nhau không?",
        zh: "四家门店卖的东西都一模一样吗？",
        ja: "4店舗ともまったく同じ商品が置いてあるの？",
      },
      answer: {
        en: "Every store is its own treasure hunt! Major staple deals go to all stores, but quirky pallet drops (imported treats, specialty drinks) land randomly across Brunswick, Fitzroy, Flemington, and Footscray.",
        it: "Ogni negozio è una caccia al tesoro a sé stante! Le grandi offerte base vanno in tutti i negozi, ma i carichi speciali di pallet (snack importati, bevande esotiche) arrivano a sorpresa nei diversi negozi.",
        vi: "Mỗi cửa hàng là một cuộc săn kho báu riêng! Những món hời lớn có ở tất cả chi nhánh, nhưng các lô hàng đặc biệt độc lạ sẽ cập bến ngẫu nhiên giữa các cửa hàng.",
        zh: "每家店都是独特的寻宝现场！主力民生特价品四店共享，但特色零食和稀奇进口饮料会随机分发到各门店。每一家都值得逛逛！",
        ja: "どのお店も独自の宝探し！定番の目玉商品は全店に入りますが、ユニークな直輸入スナックや限定ドリンクは店舗ごとにランダムに並びます。",
      },
    },
  ],
};

function StoryLink() {
  return (
    <a className="ig-story" href={PROFILE} target="_blank" rel="noopener noreferrer">
      <span className="ig-story-ring" aria-hidden="true">
        <span className="ig-story-face">
          <LogoMark />
        </span>
      </span>
      <span className="ig-story-name">{HANDLE}</span>
    </a>
  );
}

function CommentLink({ href }: { href: string }) {
  const s = useT(instaShelfStrings);
  return (
    <a className="ig-comment" href={href} target="_blank" rel="noopener noreferrer">
      <span>{s.comment}</span>
    </a>
  );
}

function Price({ value }: { value: string }) {
  const match = /^\$(\d+)$/.exec(value);
  if (!match) return <span className="ig-price ig-price-long">{value}</span>;
  return (
    <span className="ig-price">
      <sup>$</sup>
      {match[1]}
    </span>
  );
}

export function InstaShelf() {
  const s = useT(instaShelfStrings);
  const { lang, locale } = useLang();
  const shortDay = (date: Date) => date.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const postDay = (iso: string) => shortDay(new Date(`${iso}T12:00`));

  const { feed } = useInstagramFeed(FALLBACK_FEED);
  const [activeQaIndex, setActiveQaIndex] = useState(0);

  // Issue number is the week of the year, dated from this week's Monday. Same count the flyer uses.
  const [today] = useState(() => new Date());
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7));
  const issue = Math.ceil(((+monday - +new Date(monday.getFullYear(), 0, 1)) / 86400000 + 1) / 7);

  const heroPosts = feed.foodPosts.filter((p) => p.type === "hero");
  const ticketPosts = feed.foodPosts.filter((p) => p.type === "ticket");
  const activeQa: QaItemData = feed.qa[activeQaIndex] || feed.qa[0];

  return (
    <section className="ig-shelf" id="instagram" data-surface="cream" aria-labelledby="ig-title">
      <CutLine />
      <header className="ig-head rv">
        <p className="ig-mast" aria-hidden="true">
          <span>{s.issue(issue)}</span>
          <span>{s.week(shortDay(monday))}</span>
          <span>@cheaperbuymiles</span>
        </p>
        <div className="ig-headline">
          <h2 id="ig-title" className="ig-title">
            {s.title}
          </h2>
          <RingBadge className="ig-ring" text={s.ringText} center="@" label={s.ringLabel} />
        </div>
        <div className="ig-dek-row">
          <p className="ig-dek">
            {s.dek}
          </p>
          <a className="button outline" href={PROFILE} target="_blank" rel="noopener noreferrer">
            {s.follow}
          </a>
        </div>
      </header>

      {/* TWO-WING SPLIT LAYOUT: Food bargains on the left, People & Employee video reels on the right */}
      <div className="ig-wings-layout">
        {/* LEFT WING: Food Bargains & Grocery Drops ("i cibi come ora") */}
        <section className="ig-wing ig-food-wing" aria-label={s.foodWingTitle}>
          <div className="ig-wing-head rv">
            <span className="ig-wing-icon" aria-hidden="true">🛒</span>
            <div className="ig-wing-titles">
              <h3 className="ig-wing-title">{s.foodWingTitle}</h3>
              <p className="ig-wing-sub">{s.foodWingSub}</p>
            </div>
          </div>

          {/* Hero food deals */}
          <div className="ig-feature">
            {heroPosts.map((post, i) => (
              <div key={post.id} className="ig-slot rv" style={slotStyle(i, 0.45)}>
                <article className="ig-card ig-hero">
                  <StoryLink />
                  <a className="ig-post" href={post.href} target="_blank" rel="noopener noreferrer">
                    <figure>
                      <img src={post.img} alt={post.name[lang]} width={1080} height={1440} loading="lazy" decoding="async" />
                      <span className="ig-sticker" aria-hidden="true">{post.size}</span>
                      <p className="ig-quip">{post.quip[lang]}</p>
                    </figure>
                    <div className="ig-body">
                      <p className="ig-kicker">
                        <span>{postDay(post.date)}</span>
                        <span>{post.aisle ? post.aisle[lang] : ""}</span>
                      </p>
                      <h3>{post.name[lang]}</h3>
                      <dl className="ig-cells">
                        <div>
                          <dt>{s.sizeLabel}</dt>
                          <dd>{post.size}</dd>
                        </div>
                        <div>
                          <dt>{s.whereLabel}</dt>
                          <dd>{post.where ? post.where[lang] : ""}</dd>
                        </div>
                        <div>
                          <dt>{s.fromLabel}</dt>
                          <dd>Instagram</dd>
                        </div>
                      </dl>
                      <div className="ig-bar">
                        <span>{s.seePost}</span>
                        <Price value={post.price} />
                      </div>
                    </div>
                  </a>
                  <CommentLink href={post.href} />
                </article>
              </div>
            ))}
          </div>

          {/* Shelf-edge food tickets */}
          <ul className="ig-grid ig-food-grid">
            {ticketPosts.map((post, i) => (
              <li key={post.id} className="ig-slot rv" style={slotStyle(i + 2)}>
                <article className="ig-card ig-ticket">
                  <StoryLink />
                  <a className="ig-post" href={post.href} target="_blank" rel="noopener noreferrer">
                    <figure>
                      <img src={post.img} alt={post.name[lang]} width={1080} height={1440} loading="lazy" decoding="async" />
                      {post.tag && <span className="ig-sticker" aria-hidden="true">{post.tag[lang]}</span>}
                      <p className="ig-quip">{post.quip[lang]}</p>
                    </figure>
                    <div className="ig-label">
                      <Price value={post.price} />
                      <span className="ig-label-meta">
                        <b>{post.name[lang]}</b>
                        {`${postDay(post.date)} · ${post.size}`}
                      </span>
                      <span className="ig-code" aria-hidden="true" />
                    </div>
                    <span className="sr-only">{s.opens}</span>
                  </a>
                  <CommentLink href={post.href} />
                </article>
              </li>
            ))}
          </ul>
        </section>

        {/* RIGHT WING: People & Employee Videos ("le persone con i video dei dipendenti") */}
        <section className="ig-wing ig-people-wing" aria-label={s.peopleWingTitle}>
          <div className="ig-wing-head rv">
            <span className="ig-wing-icon" aria-hidden="true">👥</span>
            <div className="ig-wing-titles">
              <h3 className="ig-wing-title">{s.peopleWingTitle}</h3>
              <p className="ig-wing-sub">{s.peopleWingSub}</p>
            </div>
          </div>

          <div className="ig-reels-grid">
            {feed.peoplePosts.map((post, i) => (
              <article key={post.id} className="ig-card ig-reel-card rv" style={slotStyle(i + 1, 0.4)}>
                <div className="ig-reel-top">
                  <StoryLink />
                  <span className="ig-reel-author">{post.author}</span>
                </div>
                <a className="ig-post ig-reel-post" href={post.href} target="_blank" rel="noopener noreferrer">
                  <figure className="ig-reel-media">
                    <img src={post.img} alt={post.title[lang]} width={1080} height={1920} loading="lazy" decoding="async" />
                    {/* Play button overlay & soundwave badge */}
                    <div className="ig-reel-play-overlay" aria-hidden="true">
                      <span className="ig-play-disc">▶</span>
                      <div className="ig-soundwave">
                        <span /><span /><span /><span />
                      </div>
                    </div>
                    <div className="ig-reel-badges">
                      <span className="ig-reel-format-badge">🎬 {s.videoReel}</span>
                      <span className="ig-reel-duration-badge">{post.duration}</span>
                    </div>
                    <p className="ig-quip ig-reel-quip">{post.quip[lang]}</p>
                  </figure>
                  <div className="ig-reel-body">
                    <div className="ig-reel-meta-line">
                      <span className="ig-reel-tag">{post.tag}</span>
                      <span className="ig-reel-date">{postDay(post.date)}</span>
                    </div>
                    <h4 className="ig-reel-title">{post.title[lang]}</h4>
                    <p className="ig-reel-highlight">{post.highlight[lang]}</p>
                    <div className="ig-bar ig-reel-bar">
                      <span className="ig-reel-watch">{s.watchReel}</span>
                      <span className="ig-reel-arrow" aria-hidden="true">↗</span>
                    </div>
                  </div>
                </a>
                <CommentLink href={post.href} />
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* COMMUNITY Q&A SECTION (Styled as an Instagram Story Q&A Sticker) */}
      <section className="ig-qa-shelf rv" aria-labelledby="ig-qa-title">
        <div className="ig-qa-card">
          <div className="ig-qa-header">
            <div className="ig-qa-brand">
              <span className="ig-qa-story-ring" aria-hidden="true">
                <LogoMark />
              </span>
              <div>
                <span className="ig-qa-handle">@{HANDLE}</span>
                <span className="ig-qa-tagline">Instagram Story Q&A Box</span>
              </div>
            </div>
            <span className="ig-qa-chip">💬 FAQ & Questions</span>
          </div>

          <div className="ig-qa-titles">
            <h3 id="ig-qa-title" className="ig-qa-title">{s.qaTitle}</h3>
            <p className="ig-qa-dek">{s.qaDek}</p>
          </div>

          {/* Interactive Question Selector Pills */}
          <div className="ig-qa-tabs" role="tablist" aria-label="Instagram Q&A Questions">
            {feed.qa.map((qaItem, idx) => (
              <button
                key={qaItem.id}
                type="button"
                role="tab"
                aria-selected={idx === activeQaIndex}
                className={`ig-qa-tab ${idx === activeQaIndex ? "active" : ""}`}
                onClick={() => setActiveQaIndex(idx)}
              >
                <span className="ig-qa-tab-tag">{qaItem.tag[lang]}</span>
                <span className="ig-qa-tab-label">{qaItem.question[lang]}</span>
              </button>
            ))}
          </div>

          {/* Active Question & Team Answer Bubble */}
          <div className="ig-qa-stage">
            <div className="ig-qa-bubble-box">
              {/* Question bubble */}
              <div className="ig-qa-question-bubble">
                <span className="ig-qa-asker-badge">
                  <span>{activeQa.asker}</span>
                  <small>· {activeQa.badge[lang]}</small>
                </span>
                <p className="ig-qa-question-text">“{activeQa.question[lang]}”</p>
              </div>

              {/* Team Answer bubble */}
              <div className="ig-qa-answer-bubble">
                <div className="ig-qa-avatar" aria-hidden="true">
                  <span>🛒</span>
                </div>
                <div className="ig-qa-answer-text-wrap">
                  <span className="ig-qa-answer-author">{s.qaTeamAnswer}</span>
                  <p className="ig-qa-answer-text">{activeQa.answer[lang]}</p>
                </div>
              </div>
            </div>

            {/* Q&A Footer with CTA */}
            <div className="ig-qa-footer">
              <span className="ig-qa-ask-prompt">{s.qaAskYours}</span>
              <a
                href={PROFILE}
                target="_blank"
                rel="noopener noreferrer"
                className="button outline small ig-qa-cta"
              >
                {s.qaAskButton}
              </a>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
