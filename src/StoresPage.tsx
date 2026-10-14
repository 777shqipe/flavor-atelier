import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { glyphSvg } from "./glyphs";
import { RingBadge } from "./RingBadge";
import { StoreMap } from "./StoreMap";
import { STORES, directionsLink, distanceKm, formatKm } from "./stores";
import { useOpenStatus } from "./useOpenStatus";
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
  const status = useOpenStatus();
  const frame = useRef<HTMLDivElement>(null);
  // Remember the previous photo so the new one can wipe in over it.
  const [pair, setPair] = useState({ cur: active, before: -1 });
  if (pair.cur !== active) setPair({ cur: active, before: pair.cur });

  const go = (direction: number) => onSelect((active + direction + STORES.length) % STORES.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (target?.closest(".leaflet-container")) return;
      event.preventDefault();
      onSelect((active + (event.key === "ArrowRight" ? 1 : -1) + STORES.length) % STORES.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, onSelect]);

  // The photo drifts slightly against the pointer, like looking through a window.
  const look = (event: PointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--px", (((event.clientX - box.left) / box.width - 0.5) * 2).toFixed(3));
    el.style.setProperty("--py", (((event.clientY - box.top) / box.height - 0.5) * 2).toFixed(3));
  };
  const rest = () => {
    frame.current?.style.setProperty("--px", "0");
    frame.current?.style.setProperty("--py", "0");
  };

  const store = STORES[active];
  const nearest = STORES.map((other) => ({ other, km: distanceKm(store.lat, store.lon, other.lat, other.lon) }))
    .filter(({ other }) => other !== store)
    .sort((a, b) => a.km - b.km)[0];

  // One parchment sheet: title and facts on the left, the live map printed straight
  // onto the paper on the right with the shop's photo print laid over it, and the
  // four picks underneath.
  return (
    <main>
      <section className="stores-hero" data-surface="paper" aria-labelledby="stores-title">
        <div className="parchment" aria-hidden="true" />
        <div className="sh">
          <header className="sh-head">
            <div className="sh-title">
              <h1 id="stores-title">Our stores</h1>
              <RingBadge className="sh-badge" text="OPEN 7 DAYS • FIGHT FOOD WASTE •" center="7" label="Open seven days a week" />
            </div>
          </header>

          <article className="sh-facts" style={{ "--c": store.color } as CSSProperties}>
            <h2 className="sh-name" key={store.id} aria-label={store.name} aria-live="polite">
              {[...store.name].map((letter, index) => (
                <span key={index} aria-hidden="true" style={{ "--i": index } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </h2>
            <p className="sh-line" key={`line-${store.id}`}>
              {store.line}
            </p>
            <ul className="sh-info" key={`info-${store.id}`}>
              <li>
                <Icon d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" circle />
                {store.address}
              </li>
              <li className="hours">
                <Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2" />
                <span>
                  {store.hours.split(" · ").map((part) => (
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
                Directions
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </a>
            </div>
            <p className="sh-near" key={`near-${store.id}`}>
              Next closest: <b>{nearest.other.name}</b> · {formatKm(nearest.km)} away
            </p>
          </article>

          <div className="sh-visual">
            <StoreMap active={active} onSelect={onSelect}>
              <div
                className="sh-window"
                ref={frame}
                data-closed={!status.open || undefined}
                style={{ "--c": store.color } as CSSProperties}
                onPointerMove={look}
                onPointerLeave={rest}
              >
                <span className="sh-awning" key={`aw-${store.id}`} aria-hidden="true" />
                <div className="sh-photo">
                  {STORES.map((item, index) => (
                    <img
                      key={item.id}
                      className={index === active ? "active" : index === pair.before ? "before" : undefined}
                      src={item.src}
                      alt={index === active ? `${item.name} storefront` : ""}
                      style={{ objectPosition: item.pos }}
                      draggable={false}
                    />
                  ))}
                  <span className="sh-blind" aria-hidden="true">
                    <i className="sh-pull" />
                  </span>
                </div>
                {/* the print's caption: who, where, open or not, and the way to the next one */}
                <div className="sh-caption">
                  <span className="sc-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(store.glyph) }} />
                  <span className="sc-text" key={`cap-${store.id}`}>
                    <b>{store.name}</b>
                    {/* street only: the suburb is already the name */}
                    <small>{store.address.split(",")[0]}</small>
                  </span>
                  <span className="sc-nav">
                    <button type="button" onClick={() => go(-1)} aria-label="Previous store">
                      {arrow("left")}
                    </button>
                    <button type="button" onClick={() => go(1)} aria-label="Next store">
                      {arrow("right")}
                    </button>
                  </span>
                  <p className={`status${status.open ? " open" : ""}`}>
                    <i /> {status.label}
                  </p>
                </div>
              </div>
            </StoreMap>
          </div>

          <div className="sh-picks" role="tablist" aria-label="Choose a store" style={{ "--i": active } as CSSProperties}>
            <span className="pick-lens" aria-hidden="true" />
            {STORES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                tabIndex={index === active ? 0 : -1}
                style={{ "--c": item.color, "--i": index } as CSSProperties}
                onClick={() => onSelect(index)}
              >
                <img src={item.src} alt="" style={{ objectPosition: item.pos }} />
                <span className="pick-text">
                  <small>0{index + 1}</small>
                  <b>{item.name}</b>
                </span>
                <span className="pick-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(item.glyph) }} />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
