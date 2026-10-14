import { useEffect, useRef, type CSSProperties } from "react";
import { PROOF, STOPS } from "./supplierDeal";
import { TruckScene } from "./TruckScene";
import "./suppliers.css";

/** When the truck reaches each stop; must match the @keyframes route-drive stops. */
const ARRIVALS = [0, 1.2, 2.4, 3.68];

const BUYS = ["Close-to-date", "Past best-before", "Surplus stock", "A few pallets", "A full truckload"];

function Truck() {
  return (
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
  );
}

/**
 * How it works and why us in one: a truck drives a route through four stops.
 * Each stop lights up as it arrives and shows the step plus what it gives the supplier.
 */
function Deal({ onContact }: { onContact: () => void }) {
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
          <p className="eyebrow">Working with us</p>
          <h2 id="deal-title">
            A deal that works <em>for everyone.</em>
          </h2>
        </div>
        <p className="lead">Four steps from “we have too much” to “it’s gone, thank you”, and what each one does for you.</p>
      </header>

      <div className="route rv" ref={route}>
        <div className="route-track" aria-hidden="true">
          <i className="route-fill" />
          <span className="route-truck">
            <Truck />
          </span>
        </div>
        <ol className="route-stops">
          {STOPS.map((stop, index) => (
            <li key={stop.title} className="stop" style={{ "--t": `${ARRIVALS[index] + 0.3}s` } as CSSProperties}>
              <span className="stop-pin">0{index + 1}</span>
              <div className="stop-card">
                <span className="stop-tag">{stop.tag}</span>
                <h3>{stop.title}</h3>
                <p>{stop.text}</p>
                <p className="stop-gain">
                  <b>For you</b>
                  {stop.gain}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="deal-proof rv">
        <ul>
          {PROOF.map(([big, small]) => (
            <li key={small}>
              <strong>{big}</strong>
              <span>{small}</span>
            </li>
          ))}
        </ul>
        <button className="button cream" type="button" onClick={onContact}>
          Get a quote
        </button>
      </div>
    </section>
  );
}

/** The supplier half of About: the pitch, what we buy, then the deal route. */
export function Suppliers({ onContact }: { onContact: () => void }) {
  return (
    <>
      <section className="page-hero sp-hero" id="suppliers" data-surface="green" aria-labelledby="suppliers-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">For suppliers</p>
            <h2 id="suppliers-title">
              Surplus stock?
              <br />
              Let’s make it useful.
            </h2>
            <p className="lead">Fast decisions, flexible volumes and a better outcome for good food.</p>
            <div className="hero-actions">
              <button className="button cream" type="button" onClick={onContact}>
                Get a quote
              </button>
              <a className="text-link" href="#supply" onClick={(event) => {
                event.preventDefault();
                document.getElementById("supply")?.scrollIntoView({ behavior: "smooth" });
              }}>
                How it works <span>↓</span>
              </a>
            </div>
          </header>
          <TruckScene />
        </div>
      </section>

      <div className="marquee" data-surface="cream" aria-label="What we buy">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div key={copy}>
              {BUYS.map((item) => (
                <span key={item}>
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
