import { useEffect, useRef, useState } from "react";
import type { Page } from "./Header";
import { useLang, useT } from "./i18n";
import { topNoticeStrings } from "./i18n/strings/TopNotice";
import { useInstagramFeed, type InstagramFeedData } from "./useInstagramFeed";
import "./topnotice.css";

const FALLBACK_FEED: InstagramFeedData = {
  lastChecked: "2026-10-16T12:00:00Z",
  handle: "cheaperbuymiles",
  profileUrl: "https://www.instagram.com/cheaperbuymiles/",
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
  foodPosts: [],
  peoplePosts: [],
  qa: [],
};

export function TopNoticeBanner({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const s = useT(topNoticeStrings);
  const { lang } = useLang();
  const { feed } = useInstagramFeed(FALLBACK_FEED);
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);

  const notice = feed.storeNotice;

  useEffect(() => {
    if (dismissed || !notice) {
      document.documentElement.style.removeProperty("--notice-banner-h");
      document.documentElement.removeAttribute("data-has-notice");
      return;
    }

    const updateHeight = () => {
      if (bannerRef.current) {
        const h = Math.round(bannerRef.current.offsetHeight);
        document.documentElement.style.setProperty("--notice-banner-h", `${h}px`);
        document.documentElement.setAttribute("data-has-notice", "true");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      document.documentElement.style.removeProperty("--notice-banner-h");
      document.documentElement.removeAttribute("data-has-notice");
    };
  }, [dismissed, notice]);

  if (!notice || dismissed) return null;

  return (
    <aside ref={bannerRef} className="top-notice-bar" role="alert" aria-label={s.badge}>
      <div className="top-notice-inner">
        <div className="top-notice-left">
          <span className="top-notice-pill">📢 {s.badge}</span>
          <div className="top-notice-text-wrap">
            <strong className="top-notice-title">{notice.title[lang]}</strong>
            <span className="top-notice-bullet">·</span>
            <span className="top-notice-dates">📅 {notice.dates[lang]}</span>
            <span className="top-notice-bullet">·</span>
            <span className="top-notice-reopen">✨ {notice.reopen[lang]}</span>
            <span className="top-notice-reminder">({s.openReminder})</span>
          </div>
        </div>

        <div className="top-notice-actions">
          <button
            type="button"
            className="top-notice-find-btn"
            onClick={() => onNavigate("stores")}
          >
            <span className="top-notice-pin" aria-hidden="true">📍</span>
            <span>{s.findStores}</span>
            <span className="top-notice-arrow" aria-hidden="true">↗</span>
          </button>

          {notice.href && (
            <a
              href={notice.href}
              target="_blank"
              rel="noopener noreferrer"
              className="top-notice-post-link"
              title={s.seeOriginalPost}
              aria-label={s.seeOriginalPost}
            >
              <img
                src={notice.img}
                alt=""
                className="top-notice-thumb"
                width={28}
                height={28}
                loading="lazy"
              />
              <span className="top-notice-ig-tag">Post ↗</span>
            </a>
          )}

          <button
            type="button"
            className="top-notice-close-btn"
            onClick={() => setDismissed(true)}
            title={s.dismiss}
            aria-label={s.dismiss}
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
