import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { glyphSvg } from "./glyphs";
import { bow, bowControl, type XY } from "./mapArt";
import { Mix } from "./Mix";
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

/* ---------- mini map: the loop as a schematic, with a trolley that rides it ---------- */
const MW = 184;
const MH = 126;
const MINI = (() => {
  const pad = 24;
  const cbd = { lat: -37.8136, lon: 144.9631 };
  const lats = [...STORES.map((store) => store.lat), cbd.lat];
  const lons = [...STORES.map((store) => store.lon), cbd.lon];
  const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
  const [minLon, maxLon] = [Math.min(...lons), Math.max(...lons)];
  const at = (lat: number, lon: number) => ({
    x: pad + ((lon - minLon) / (maxLon - minLon)) * (MW - pad * 2),
    y: pad + 4 + ((maxLat - lat) / (maxLat - minLat)) * (MH - pad * 2 - 8),
  });
  const points = STORES.map((store) => at(store.lat, store.lon));
  const centre = { x: points.reduce((s, p) => s + p.x, 0) / 4, y: points.reduce((s, p) => s + p.y, 0) / 4 };
  const loop = ROUTE.slice(0, -1);
  let d = `M${points[loop[0]].x.toFixed(1)} ${points[loop[0]].y.toFixed(1)}`;
  const samples: XY[] = [];
  const startAt: number[] = [];
  loop.forEach((from, k) => {
    const to = loop[(k + 1) % loop.length];
    const c = bowControl(points[from], points[to], centre, 0.17);
    d += `Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${points[to].x.toFixed(1)} ${points[to].y.toFixed(1)}`;
    startAt[from] = k ? samples.length - 1 : 0;
    samples.push(...bow(points[from], points[to], centre, 0.17, 24).slice(k ? 1 : 0));
  });
  // samples[0] is repeated as the last point, so the loop closes.
  const cum = [0];
  for (let i = 1; i < samples.length; i += 1) {
    cum.push(cum[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y));
  }
  const total = cum[cum.length - 1];
  const point = (dist: number) => {
    const s = ((dist % total) + total) % total;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < s) i += 1;
    const k = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
    return { x: samples[i - 1].x + (samples[i].x - samples[i - 1].x) * k, y: samples[i - 1].y + (samples[i].y - samples[i - 1].y) * k };
  };
  return { d: `${d}Z`, points, cbd: at(cbd.lat, cbd.lon), stop: STORES.map((_, i) => cum[startAt[i]]), total, point };
})();

function MiniMap({ active }: { active: number }) {
  const cart = useRef<SVGGElement>(null);
  const pos = useRef(MINI.stop[active]);

  // The trolley takes the shorter way round the loop to the new store.
  useEffect(() => {
    const el = cart.current;
    if (!el) return;
    const from = pos.current;
    let delta = (MINI.stop[active] - (from % MINI.total) + MINI.total) % MINI.total;
    if (delta > MINI.total / 2) delta -= MINI.total;
    const put = (dist: number) => {
      const p = MINI.point(dist);
      el.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    };
    if (!delta || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pos.current = from + delta;
      put(pos.current);
      return;
    }
    const t0 = performance.now();
    const ms = 500 + Math.abs(delta) * 6;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      pos.current = from + delta * k;
      put(pos.current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <svg className="mini-map" viewBox={`0 0 ${MW} ${MH}`} role="img" aria-label={`${STORES[active].name} on the map of our four stores`}>
      <defs>
        <pattern id="mini-grid" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="rgb(246 240 219 / 0.12)" />
        </pattern>
      </defs>
      <rect width={MW} height={MH} fill="url(#mini-grid)" />
      <path className="mini-route-glow" d={MINI.d} />
      <path className="mini-route" d={MINI.d} />
      <g className="mini-cbd" transform={`translate(${MINI.cbd.x} ${MINI.cbd.y})`}>
        <path d="M-7 4V-3h4v-6h4v3h3V4z" />
        <text y="13">CBD</text>
      </g>
      {MINI.points.map((point, index) => (
        <g
          key={STORES[index].id}
          className={`mini-stop${index === active ? " on" : ""}`}
          transform={`translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`}
          style={{ "--c": STORES[index].color } as CSSProperties}
        >
          {index === active && <circle className="mini-ping" r="9" />}
          <circle className="mini-dot" r={index === active ? 9.5 : 7} />
          <g
            className="mini-glyph"
            dangerouslySetInnerHTML={{
              __html: glyphSvg(STORES[index].glyph, `x="${index === active ? -6.5 : -4.8}" y="${index === active ? -6.5 : -4.8}" width="${index === active ? 13 : 9.6}" height="${index === active ? 13 : 9.6}"`),
            }}
          />
        </g>
      ))}
      <g ref={cart} className="mini-cart">
        <g transform="translate(-7 -17)">
          <rect x="-1" y="-1" width="16" height="12" rx="6" />
          <path d="M2.5 3h1.4l1.3 4.6h5.4l1-3.6H4.6" />
        </g>
      </g>
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
      if (target?.closest(".leaflet-container, .mix-bar")) return;
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

  const shop = () => (
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
            <span className="sh-chip" key={`chip-${store.id}`}>
              <span className="sc-glyph" style={{ "--c": store.color } as CSSProperties} dangerouslySetInnerHTML={{ __html: glyphSvg(store.glyph) }} />
              Store 0{active + 1} · {store.name}
            </span>
            <button className="round-btn sh-arrow prev" type="button" onClick={() => go(-1)} aria-label="Previous store">
              {arrow("left")}
            </button>
            <button className="round-btn sh-arrow next" type="button" onClick={() => go(1)} aria-label="Next store">
              {arrow("right")}
            </button>
            <div className="sh-mini">
              <MiniMap active={active} />
            </div>
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
  );

  const map = () => (
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
  );

  // One screen: the shop up close, or all four on the map. Both follow the same pick.
  return (
    <main>
      <Mix
        id="stores"
        label="Our stores"
        tabs={[
          { id: "shop", label: "Storefront", render: shop },
          { id: "map", label: "Map & nearest", render: map },
        ]}
      />
    </main>
  );
}
