import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { RingBadge } from "./RingBadge";
import { StoreMap } from "./StoreMap";
import { STORES, currentStoreNotice, directionsLink, distanceKm, formatKm } from "./stores";
import { useOpenStatus } from "./useOpenStatus";
import { useLang, useT } from "./i18n";
import { storeStrings } from "./i18n/strings/Stores";
import { storesPageStrings } from "./i18n/strings/StoresPage";
import "./stores.css";

const arrow = (direction: "left" | "right") => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={direction === "left" ? "M20 12H5M11 6l-6 6 6 6" : "M4 12h15M13 6l6 6-6 6"} />
  </svg>
);

const Icon = ({ d, circle }: { d: string; circle?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
    {circle && <circle cx="12" cy="9.5" r="2.5" />}
  </svg>
);

export function StoresPage({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const s = useT(storesPageStrings);
  const { lang, locale } = useLang();
  const shared = useT(storeStrings);
  const status = useOpenStatus();
  // Remember the previous photo so the new one can wipe in over it.
  const [pair, setPair] = useState({ cur: active, before: -1 });
  const [peek, setPeek] = useState(false);
  const swipeStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const page = useRef<HTMLElement>(null);
  if (pair.cur !== active) setPair({ cur: active, before: pair.cur });

  const go = (direction: number) => onSelect((active + direction + STORES.length) % STORES.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.defaultPrevented || page.current?.closest("[inert]")) return;
      if (target?.closest("input, textarea, select, [role='dialog'], .leaflet-container") || target?.isContentEditable) return;
      const picks = target?.closest(".sh-picks");
      if (!picks && target?.closest("a, button, [role='menu']")) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && !(picks && (event.key === "Home" || event.key === "End"))) return;
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? STORES.length - 1 : (active + (event.key === "ArrowRight" ? 1 : -1) + STORES.length) % STORES.length;
      onSelect(next);
      picks?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onSelect]);


  const onPhotoDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    swipeStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPhotoUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    if (!start || start.pointerId !== event.pointerId) return;
    swipeStart.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      go(dx < 0 ? 1 : -1);
    } else if (!status.open && Math.hypot(dx, dy) < 12) {
      setPeek((p) => !p);
    }
  };
  const cancelSwipe = (event: PointerEvent<HTMLDivElement>) => {
    if (swipeStart.current?.pointerId === event.pointerId) swipeStart.current = null;
  };

  const store = STORES[active];
  const notice = currentStoreNotice(store);
  const nearest = STORES.map((other) => ({ other, km: distanceKm(store.lat, store.lon, other.lat, other.lon) }))
    .filter(({ other }) => other !== store)
    .sort((a, b) => a.km - b.km)[0];

  // One parchment sheet: title and facts on the left, the live map printed straight
  // onto the paper on the right with the shop's photo print laid over it, and the
  // four picks underneath.
  return (
    <main>
      <section className="stores-hero" ref={page} data-surface="paper" aria-labelledby="stores-title">
        <div className="parchment" aria-hidden="true" />
        <div className="sh">
          <header className="sh-head">
            <div className="sh-title">
              <h1 id="stores-title">{s.title}</h1>
              <RingBadge className="sh-badge" text={s.ring} center="7" label={s.ringLabel} />
            </div>
          </header>

          <article className="sh-facts" id="store-details" role="tabpanel" aria-labelledby={`store-tab-${store.id}`} tabIndex={0} style={{ "--c": store.color } as CSSProperties}>
            <h2 className="sh-name" key={store.id} aria-label={store.name} aria-live="polite">
              {[...store.name].map((letter, index) => (
                <span key={index} aria-hidden="true" style={{ "--i": index } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </h2>
            <p className="sh-line" key={`line-${store.id}`}>
              {shared.lines[store.id]}
            </p>
            {notice && (
              <div className="sh-notice" role="alert" key={`notice-${store.id}`}>
                <div className="sh-notice-head">
                  <span className="sh-notice-badge">
                    <i aria-hidden="true" />
                    {notice.badge[lang]}
                  </span>
                  <span className="sh-notice-dates">{notice.dates[lang]}</span>
                </div>
                <strong className="sh-notice-title">{notice.title[lang]}</strong>
                <p className="sh-notice-body">{notice.desc[lang]}</p>
                <div className="sh-notice-foot">
                  <span className="sh-notice-reopen">{notice.reopen[lang]}</span>
                  {notice.postUrl && (
                    <a href={notice.postUrl} target="_blank" rel="noopener noreferrer" className="sh-notice-link">
                      {lang === "it" ? "Post Instagram ↗" : "Instagram post ↗"}
                    </a>
                  )}
                </div>
              </div>
            )}
            <ul className="sh-info" key={`info-${store.id}`}>
              <li>
                <Icon d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" circle />
                {store.address}
              </li>
              <li className="hours">
                <Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2" />
                <span>
                  {shared.hours.split(" · ").map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </span>
              </li>
              <li>
                <Icon d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
                <a href={`tel:${store.phone.replaceAll(" ", "")}`}>{store.phone}</a>
              </li>
            </ul>
            <div className="sh-actions">
              <a className="go" href={directionsLink(store)} target="_blank" rel="noreferrer">
                {s.directions}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
            <p className="sh-near" key={`near-${store.id}`}>
              {s.nextClosest(nearest.other.name, formatKm(nearest.km, locale))}
            </p>
          </article>

          <div className="sh-visual">
            <StoreMap active={active} onSelect={onSelect}>
              <div
                className="sh-window"
                data-closed={!status.open || undefined}
                data-peek={peek || undefined}
                style={{ "--c": store.color } as CSSProperties}
              >
                <div className="sh-photo" onPointerDown={onPhotoDown} onPointerUp={onPhotoUp} onPointerCancel={cancelSwipe} onLostPointerCapture={cancelSwipe}>
                  {STORES.map((item, index) => (
                    <img
                      key={item.id}
                      className={index === active ? "active" : index === pair.before ? "before" : undefined}
                      src={item.src}
                      alt={index === active ? s.storefront(item.name) : ""}
                      style={{ objectPosition: item.pos }}
                      draggable={false}
                      decoding="async"
                    />
                  ))}
                  <span className="sh-blind" aria-hidden="true">
                    <i className="sh-pull" />
                  </span>
                  <span className="sh-awning" key={`aw-${store.id}`} aria-hidden="true" />
                  {/* open or closed, as the card a shop hangs on its door */}
                  <p className={`sh-sign${status.open ? " open" : ""}`} title={status.label}>
                    <b>{status.open ? s.sign.open : s.sign.closed}</b>
                    <small>{status.label.split(" · ")[1]}</small>
                  </p>
                </div>
                {/* the print's caption: who, where, and the way to the next one */}
                <div className="sh-caption">
                  <span className="sc-text" key={`cap-${store.id}`}>
                    <b>{store.name}</b>
                    {/* street only: the suburb is already the name */}
                    <small>{store.address.split(",")[0]}</small>
                  </span>
                  <span className="sc-nav">
                    <button type="button" onClick={() => go(-1)} aria-label={s.previous}>
                      {arrow("left")}
                    </button>
                    <button type="button" onClick={() => go(1)} aria-label={s.next}>
                      {arrow("right")}
                    </button>
                  </span>
                </div>
              </div>
            </StoreMap>
          </div>

          <div
            className="sh-picks"
            role="tablist"
            aria-label={s.choose}
            style={{ "--i": active, "--col": active % 2, "--row": Math.floor(active / 2) } as CSSProperties}
          >
            <span className="pick-lens" aria-hidden="true" />
            {STORES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`store-tab-${item.id}`}
                aria-controls="store-details"
                aria-selected={index === active}
                tabIndex={index === active ? 0 : -1}
                style={{ "--c": item.color, "--i": index } as CSSProperties}
                onClick={() => onSelect(index)}
              >
                <img src={item.src} alt="" loading="lazy" decoding="async" width={84} height={62} style={{ objectPosition: item.pos }} />
                <span className="pick-text">
                  <small>0{index + 1}</small>
                  <b>{item.name}</b>
                  {currentStoreNotice(item) && <span className="pick-notice-dot" title={currentStoreNotice(item)?.badge[lang]} aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
