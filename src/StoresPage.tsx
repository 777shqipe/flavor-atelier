import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Glass } from "./Glass";
import { glyphSvg } from "./glyphs";
import { RingBadge } from "./RingBadge";
import { StoreMap } from "./StoreMap";
import { ROUTE, STORES, directionsLink } from "./stores";
import { useOpenStatus } from "./useOpenStatus";
import "./stores.css";

const arrow = (direction: "left" | "right") => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={direction === "left" ? "M20 12H5M11 6l-6 6 6 6" : "M4 12h15M13 6l6 6-6 6"} />
  </svg>
);

/** The four shops as dots on a tiny schematic of the loop; the selected one pulses. */
function MiniMap({ active }: { active: number }) {
  const W = 168;
  const H = 118;
  const pad = 22;
  const lats = STORES.map((store) => store.lat);
  const lons = STORES.map((store) => store.lon);
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
  const points = STORES.map((store) => ({
    x: pad + ((store.lon - minLon) / (maxLon - minLon)) * (W - pad * 2),
    y: pad + ((maxLat - store.lat) / (maxLat - minLat)) * (H - pad * 2),
  }));
  const route = ROUTE.map((index) => `${points[index].x},${points[index].y}`).join(" ");

  return (
    <svg className="mini-map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${STORES[active].name} on the map of our four stores`}>
      <polyline points={route} className="mini-route" />
      {points.map((point, index) => (
        <g key={STORES[index].id} className={index === active ? "on" : undefined} style={{ "--c": STORES[index].color } as CSSProperties}>
          {index === active && <circle className="mini-ping" cx={point.x} cy={point.y} r="7" />}
          <circle className="mini-dot" cx={point.x} cy={point.y} r={index === active ? 7 : 4.5} />
        </g>
      ))}
    </svg>
  );
}

const Icon = ({ d, circle }: { d: string; circle?: boolean }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
    {circle && <circle cx="12" cy="9.5" r="2.5" />}
  </svg>
);

export function StoresPage({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const status = useOpenStatus();
  const [copiedAt, setCopiedAt] = useState<number | null>(null);
  const copied = copiedAt === active;
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

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(STORES[active].address);
      setCopiedAt(active);
      window.setTimeout(() => setCopiedAt(null), 1800);
    } catch {
      /* clipboard can be blocked; the address is still on screen */
    }
  };

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

  return (
    <main>
      <section className="stores-hero" data-surface="green" aria-labelledby="stores-title">
        <div className="aurora" aria-hidden="true" />
        <div className="sh">
          <header className="sh-head">
            <p className="eyebrow">Around Melbourne</p>
            <h1 id="stores-title">Our stores</h1>
          </header>

          <article className="sh-facts" style={{ "--c": store.color } as CSSProperties}>
            <p className="sh-count" aria-hidden="true">
              <b>0{active + 1}</b>
              <span className="sh-bars">
                {STORES.map((item, index) => (
                  <i key={item.id} data-on={index <= active || undefined} />
                ))}
              </span>
              <em>04</em>
            </p>
            <h2 className="sh-name" key={store.id} aria-label={store.name} aria-live="polite">
              {[...store.name].map((letter, index) => (
                <span key={index} aria-hidden="true" style={{ "--i": index } as CSSProperties}>
                  {letter}
                </span>
              ))}
            </h2>
            <p className={`status${status.open ? " open" : ""}`}>
              <i /> {status.label}
            </p>
            <p className="sh-line" key={`line-${store.id}`}>
              {store.line}
            </p>
            <ul className="sh-info" key={`info-${store.id}`}>
              <li>
                <Icon d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" circle />
                {store.address}
              </li>
              <li>
                <Icon d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7.5V12l3 2" />
                {store.hours}
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
              <button type="button" onClick={copy}>
                {copied ? "Copied ✓" : "Copy address"}
              </button>
            </div>
          </article>

          <div className="sh-visual" ref={frame} onPointerMove={look} onPointerLeave={rest}>
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
              <Glass className="sh-chip" style={{ "--glass-tint": "rgb(0 40 30 / 0.42)" } as CSSProperties}>
                <span className="chip-inner">
                  <span className="sc-glyph" style={{ "--c": store.color } as CSSProperties} dangerouslySetInnerHTML={{ __html: glyphSvg(store.glyph) }} />
                  Store 0{active + 1} · {store.name}
                </span>
              </Glass>
              <button className="round-btn sh-arrow prev" type="button" onClick={() => go(-1)} aria-label="Previous store">
                {arrow("left")}
              </button>
              <button className="round-btn sh-arrow next" type="button" onClick={() => go(1)} aria-label="Next store">
                {arrow("right")}
              </button>
              <Glass className="sh-mini" radius={22} style={{ "--glass-tint": "rgb(0 40 30 / 0.42)" } as CSSProperties}>
                <div className="mini-inner">
                  <MiniMap active={active} />
                </div>
              </Glass>
            </div>
            <RingBadge className="sh-badge" text="OPEN 7 DAYS • FIGHT FOOD WASTE •" center="7" label="Open seven days a week" />
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
                style={{ "--c": item.color } as CSSProperties}
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

      <section className="stores-find" data-surface="cream" aria-labelledby="find-title">
        <header className="section-head centered rv">
          <p className="eyebrow">Find us</p>
          <h2 id="find-title">Four shops, one loop.</h2>
          <p className="lead">Pick a pin and the cart drives over. Or let us find the one closest to you.</p>
        </header>
        <div className="rv" style={{ "--rv": "100ms" } as CSSProperties}>
          <StoreMap active={active} onSelect={onSelect} variant="full" />
        </div>
      </section>
    </main>
  );
}
