import { useEffect, useRef, type CSSProperties } from "react";
import { useT } from "./i18n";
import { suppliersStrings } from "./i18n/strings/Suppliers";
import { supplierDealStrings } from "./i18n/strings/SupplierDeal";
import { STOPS } from "./supplierDeal";
import { TruckScene } from "./TruckScene";
import "./suppliers.css";

/** When the truck reaches each stop; must match the @keyframes route-drive stops. */
const ARRIVALS = [0, 1.2, 2.4, 3.68];

function Truck() {
  // The bob is on the span, not the svg: Chrome runs it on the GPU there but keeps an <svg> on the main thread.
  return (
    <span className="route-bob">
      <svg viewBox="0 0 64 36" aria-hidden="true" focusable="false">
        <g stroke="#1c1a17" strokeWidth="2" strokeLinejoin="round">
          <rect x="2" y="5" width="36" height="21" rx="3" fill="#005842" />
          <path d="M38 11h12l8 8v7H38z" fill="#f6b531" />
          <path d="M41 14h8l5 5h-13z" fill="#cfe7f3" strokeWidth="1.6" />
          <circle className="wheel" cx="14" cy="28" r="5" fill="#2a2a2a" />
          <circle className="wheel" cx="48" cy="28" r="5" fill="#2a2a2a" />
        </g>
        <path d="M8 12h22M8 17h14" stroke="#f6f0db" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <circle cx="14" cy="28" r="1.6" fill="#d7dbe0" />
        <circle cx="48" cy="28" r="1.6" fill="#d7dbe0" />
      </svg>
    </span>
  );
}

/**
 * How it works and why us in one: a truck drives a route through four stops.
 * Each stop lights up as it arrives and shows the step plus what it gives the supplier.
 */
function Deal({ onContact }: { onContact: () => void }) {
  const s = useT(suppliersStrings);
  const deal = useT(supplierDealStrings);
  const route = useRef<HTMLDivElement>(null);

  // Stacked layout: the vertical route stops at the last pin, so it needs the last stop's height below that pin.
  useEffect(() => {
    const el = route.current;
    const last = el?.querySelector<HTMLElement>(".stop:last-child");
    if (!el || !last) return;
    const ro = new ResizeObserver(() => el.style.setProperty("--last", `${last.offsetHeight - 27}px`));
    ro.observe(last);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="deal" id="supply" data-surface="paper" aria-labelledby="deal-title">
      <header className="section-head split rv">
        <div>
          <p className="eyebrow">{s.dealEyebrow}</p>
          <h2 id="deal-title">{s.dealTitle}</h2>
        </div>
        <p className="lead">{s.dealLead}</p>
      </header>

      <div className="route rv" ref={route}>
        <div className="route-track" aria-hidden="true">
          <i className="route-fill" />
          <span className="route-truck">
            <Truck />
          </span>
        </div>
        <ol className="route-stops">
          {STOPS.map((id, index) => {
            const stop = deal.stops[id];
            return (
              <li key={id} className="stop" style={{ "--t": `${ARRIVALS[index] + 0.3}s` } as CSSProperties}>
                <span className="stop-pin">0{index + 1}</span>
                <div className="stop-card">
                  <span className="stop-tag">{stop.tag}</span>
                  <h3>{stop.title}</h3>
                  <p>{stop.text}</p>
                  <p className="stop-gain">
                    <b>{s.forYou}</b>
                    {stop.gain}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="deal-proof rv">
        <ul>
          {deal.proof.map(([big, small]) => (
            <li key={small}>
              <strong>{big}</strong>
              <span>{small}</span>
            </li>
          ))}
        </ul>
        <button className="button cream" type="button" onClick={onContact}>
          {s.quote}
        </button>
      </div>
    </section>
  );
}

/** The supplier half of About: the pitch, what we buy, then the deal route. */
export function Suppliers({ onContact }: { onContact: () => void }) {
  const s = useT(suppliersStrings);
  return (
    <>
      <section className="page-hero sp-hero" id="suppliers" data-surface="green" aria-labelledby="suppliers-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">{s.eyebrow}</p>
            <h2 id="suppliers-title">
              {s.heroTitle}
              <br />
              {s.heroTitleLine2}
            </h2>
            <p className="lead">{s.heroLead}</p>
            <div className="hero-actions">
              <button className="button cream" type="button" onClick={onContact}>
                {s.quote}
              </button>
              <a className="text-link" href="#supply" onClick={(event) => {
                event.preventDefault();
                document.getElementById("supply")?.scrollIntoView({ behavior: "smooth" });
              }}>
                {s.howItWorks} <span>↓</span>
              </a>
            </div>
          </header>
          <TruckScene />
        </div>
      </section>

      <div className="marquee" data-surface="cream" aria-label={s.buysLabel}>
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div key={copy}>
              {s.buys.map((item, index) => (
                <span key={index}>
                  {item}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Deal onContact={onContact} />
    </>
  );
}
