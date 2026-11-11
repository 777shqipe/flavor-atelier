import { useEffect, useRef, useState, type CSSProperties } from "react";
import { wasteNumbersStrings } from "./i18n/strings/WasteNumbers";
import { useT } from "./i18n";
import { Odometer } from "./Odometer";
import { pauseWhenOffscreen } from "./offscreen";

/**
 * Why it matters, in four numbers. Eureka Tower fills with binned food as you
 * scroll past it, one grocery bag in five tips over, and the big national
 * figures roll up on odometers. Every number cites where it comes from.
 */

const SOURCES = {
  vic: { name: "Sustainability Victoria, 2025", href: "https://www.sustainability.vic.gov.au/love-food-hate-waste" },
  bags: { name: "Foodwise", href: "https://foodwise.com.au/foodwaste/food-waste-fast-facts" },
  fial: { name: "FIAL National Food Waste Feasibility Study, 2021", href: "https://www.fial.com.au/sharing-knowledge/food-waste" },
  edible: {
    name: "End Food Waste Australia, 2024",
    href: "https://www.foodanddrinkbusiness.com.au/news/food-waste-summit-australia-wasting-29m-meals-a-day",
  },
};

const Cite = ({ source }: { source: { name: string; href: string } }) => {
  const s = useT(wasteNumbersStrings);
  return (
    <a className="wn-cite" href={source.href} target="_blank" rel="noreferrer">
      {s.cite(source.name)}
    </a>
  );
};

/** Fires once when the element is a third of the way into view. */
function useSeen<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen] as const;
}

/** Eureka Tower, 297 m, with its gold crown and red stripe. Fill is 0..1. */
function Tower() {
  const s = useT(wasteNumbersStrings);
  const ref = useRef<HTMLDivElement>(null);

  // The tower fills as the card travels up the screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--fill", "1");
      return;
    }
    let frame = 0;
    let previous = "";
    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      // Empty when its top enters the bottom of the screen, full by the time it reaches the upper third.
      const p = (window.innerHeight * 0.92 - box.top) / (window.innerHeight * 0.62);
      const fill = Math.min(1, Math.max(0, p));
      const value = fill.toFixed(3);
      if (value !== previous) {
        previous = value;
        el.style.setProperty("--fill", value);
      }
      el.toggleAttribute("data-full", fill >= 0.995);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  const tower = "M38 396V74l8-26h28l8 26v322Z";
  return (
    <div className="tower" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 150 410">
        <defs>
          <clipPath id="tower-clip">
            <path d={tower} />
          </clipPath>
          <pattern id="tower-floors" width="44" height="9" patternUnits="userSpaceOnUse">
            <path d="M0 8.5H44" stroke="rgb(246 240 219 / 0.12)" strokeWidth="1" />
          </pattern>
          <pattern id="tower-food" width="22" height="22" patternUnits="userSpaceOnUse">
            <rect width="22" height="22" fill="#d9442b" />
            <circle cx="5" cy="6" r="3.2" fill="#f6b531" />
            <circle cx="16" cy="14" r="3.6" fill="#9f2416" />
            <circle cx="8" cy="18" r="2.2" fill="#5fae5a" />
            <rect x="13" y="2" width="6" height="3" rx="1.5" fill="#f3d9a4" />
          </pattern>
        </defs>
        {/* scale bar */}
        <g className="tower-scale">
          <path d="M118 396V48" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d={`M114 ${396 - i * 49.7}h8`} />
          ))}
          <text x="126" y="52">297 m</text>
        </g>
        <path d={tower} fill="#0d2a21" stroke="rgb(246 240 219 / 0.5)" strokeWidth="1.5" />
        <path d={tower} fill="url(#tower-floors)" />
        <g clipPath="url(#tower-clip)">
          <rect x="38" y="44" width="44" height="58" fill="#e7b04a" opacity="0.9" />
          <path d="M38 60H82M38 76H82M38 92H82" stroke="#b9822a" strokeWidth="1.2" />
          <rect x="72" y="102" width="5" height="200" fill="#e3261b" />
          <g className="tower-fill">
            <path className="tower-wave" d="M-36 0q9-6 18 0t18 0 18 0 18 0 18 0 18 0 18 0 18 0 18 0 18 0V420H-36z" fill="url(#tower-food)" />
          </g>
        </g>
        <path d="M60 48V20" stroke="rgb(246 240 219 / 0.6)" strokeWidth="1.5" />
        <path d="M6 396H144" stroke="rgb(246 240 219 / 0.4)" strokeWidth="1.5" />
      </svg>
      <span className="tower-full">{s.full}</span>
    </div>
  );
}

/** Five grocery bags; the last one keels over and spills. */
function Bags({ go }: { go: boolean }) {
  const bag = (x: number, i: number) => (
    <g key={i} className={`bag${i === 4 ? " tips" : ""}`} style={{ "--i": i } as CSSProperties}>
      <g transform={`translate(${x} 0)`}>
        <rect x="16" y="6" width="9" height="34" rx="4.5" fill="#e0a458" stroke="#141414" strokeWidth="2" transform="rotate(-14 20 20)" />
        <path d="M30 26C26 12 36 6 38 16C42 6 50 12 44 26Z" fill="#5fae5a" stroke="#141414" strokeWidth="2" strokeLinejoin="round" />
        <circle className="bag-apple" cx="46" cy="24" r="7" fill="#e3261b" stroke="#141414" strokeWidth="2" />
        <path d="M8 30H56L52 104H12Z" fill="#d8b37a" stroke="#141414" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M8 30L12 38H52L56 30" fill="#c79c5f" stroke="#141414" strokeWidth="2" strokeLinejoin="round" />
        <rect x="20" y="56" width="24" height="16" rx="3" fill="#fffaf0" stroke="#141414" strokeWidth="1.6" />
        <path d="M24 64h16" stroke="#005842" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  );
  return (
    <svg className="bags" data-go={go || undefined} viewBox="0 0 430 112" aria-hidden="true">
      <path d="M0 105H430" stroke="rgb(0 56 42 / 0.25)" strokeWidth="2" />
      {[0, 64, 128, 192, 262].map(bag)}
    </svg>
  );
}

export function WasteNumbers() {
  const s = useT(wasteNumbersStrings);
  const [grid, seen] = useSeen<HTMLDivElement>();
  useEffect(() => {
    const el = grid.current?.closest<HTMLElement>(".waste");
    if (el) return pauseWhenOffscreen(el);
  }, [grid]);
  // Before the card is seen, each figure shows zeros of the same width, then the digits roll up.
  const figure = (value: string) => (seen ? value : value.replace(/\d/g, "0"));

  return (
    <section className="waste" data-surface="green" aria-labelledby="waste-title">
      <header className="section-head split rv">
        <div>
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="waste-title">{s.title}</h2>
        </div>
        <p className="lead">{s.lead}</p>
      </header>

      <div className="waste-grid" ref={grid}>
        <article className="wn wn-tower rv">
          <Tower />
          <div className="wn-copy">
            <p className="wn-num">
              <Odometer value={figure(s.tower.num)} />
              <small>{s.tower.unit}</small>
            </p>
            <p className="wn-text">{s.tower.text}</p>
            <Cite source={SOURCES.vic} />
          </div>
        </article>

        <article className="wn wn-bags rv" style={{ "--rv": "90ms" } as CSSProperties}>
          <Bags go={seen} />
          <p className="wn-num">
            <span>1</span>
            <small>{s.bags.connector}</small>
            <span>5</span>
          </p>
          <p className="wn-text">{s.bags.text}</p>
          <Cite source={SOURCES.bags} />
        </article>

        <article className="wn wn-big rv" style={{ "--rv": "180ms" } as CSSProperties}>
          <p className="wn-num">
            <Odometer value={figure(s.big.num)} />
            <small>{s.big.unit}</small>
          </p>
          <p className="wn-text">{s.big.text}</p>
          <Cite source={SOURCES.fial} />
        </article>

        <article className="wn wn-edible rv" style={{ "--rv": "270ms" } as CSSProperties}>
          <p className="wn-num">
            <Odometer value={figure(s.edible.num)} />
            <small>%</small>
          </p>
          <p className="wn-text">{s.edible.text}</p>
          <div className="wn-meter" aria-hidden="true">
            <i style={{ scale: seen ? "1 1" : "0 1" }} />
          </div>
          <Cite source={SOURCES.edible} />
        </article>
      </div>
    </section>
  );
}
