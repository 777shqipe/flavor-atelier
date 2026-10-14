import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Page } from "./Header";
import { ChocBar, GoodsDefs, Gelato, Jam, OatMilk, OliveOil, Ramen, Soda } from "./HeroGoods";
import { Peel } from "./Peel";
import { RingBadge } from "./RingBadge";
import "./hero.css";

const LINES = [
  <>Good food.</>,
  <>
    Better{" "}
    <span className="squiggle">
      prices.
      <svg viewBox="0 0 220 18" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M3 11C22 2 32 2 50 10S82 18 100 9 134 2 152 10 200 17 217 7" />
      </svg>
    </span>
  </>,
  <>
    Less <span className="marker">waste.</span>
  </>,
];

/** Seven stickers stacked back to front; the class sets position, size and tilt. */
const STICKERS = [
  { cls: "k-oil", Art: OliveOil, label: "Extra virgin olive oil" },
  { cls: "k-ramen", Art: Ramen, label: "Spicy ramen" },
  { cls: "k-milk", Art: OatMilk, label: "Barista oat milk" },
  { cls: "k-soda", Art: Soda, label: "Blood orange sparkling soda" },
  { cls: "k-gelato", Art: Gelato, label: "Strawberry gelato" },
  { cls: "k-jam", Art: Jam, label: "Strawberry jam" },
  { cls: "k-choc", Art: ChocBar, label: "Choc biscuit bar" },
] as const;

/** Markdown stickers, each stuck over the shelf price it beat. Peel one to see. */
const BURSTS = [
  { cls: "b1", price: "$4", note: "4 pack", from: "br", rrp: "Ouch." },
  { cls: "b2", price: "$2", note: "Limited", from: "bl", rrp: "Nope." },
] as const;

const STATS = [
  ["Since 1995", "Fighting food waste"],
  ["4 stores", "Across inner Melbourne"],
  ["Millions", "Of kilograms rescued"],
] as const;

export function Hero({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Pointer parallax for the sticker layers, eased in a rAF loop that sleeps when idle.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--mx", cx.toFixed(4));
      el.style.setProperty("--my", cy.toFixed(4));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const move = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
      ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toFinds = () => document.getElementById("finds")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero" ref={root} data-surface="green" data-ready={ready || undefined} aria-labelledby="hero-title">
      <div className="aurora" aria-hidden="true" />
      <span className="spark s1" aria-hidden="true">✦</span>
      <span className="spark s2" aria-hidden="true">✦</span>
      <span className="spark s3" aria-hidden="true">✦</span>
      <p className="hero-ghost">
        <span>Melbourne’s favourite</span> <span>discount grocer</span>
      </p>

      <div className="hero-grid">
        <div className="hero-copy">

          <h1 id="hero-title">
            {LINES.map((line, index) => (
              <span className="hero-line" key={index}>
                <span style={{ "--l": index } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>

          <p className="lead">
            <strong>Big-name groceries, rescued from waste</strong> and brought to your basket for a fraction of the usual price.
          </p>

          <div className="hero-ctas">
            <button className="button" type="button" onClick={() => onNavigate("stores")}>
              Find a store
            </button>
            <button className="button ghost" type="button" onClick={toFinds}>
              See this week’s finds
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 4v15M6 13l6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hero-stage">
          <GoodsDefs />
          <div className="disc" aria-hidden="true">
            <i className="disc-rays" />
            <i className="disc-ring" />
          </div>
          <svg className="ring-art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="49" />
            <circle className="orbit-dot" cx="50" cy="1" r="1.1" />
          </svg>

          {STICKERS.map(({ cls, Art, label }, index) => (
            <button
              key={cls}
              className={`stk ${cls}`}
              type="button"
              aria-label={`${label}. See this week’s finds`}
              style={{ "--e": `${index * 90 + 300}ms` } as CSSProperties}
              onClick={toFinds}
            >
              <span className="stk-in">
                <Art />
              </span>
            </button>
          ))}

          {BURSTS.map((b) => (
            <div key={b.cls} className={`hb ${b.cls}`} aria-hidden="true">
              <Peel
                className="hb-peel"
                from={b.from}
                bleed={0.06}
                back={{ clipPath: "var(--burst)" }}
                under={
                  <span className="hb-under">
                    <small>RRP</small>
                    <s>{b.rrp}</s>
                  </span>
                }
              >
                <i className="hb-rim" />
                <i className="hb-fill" />
                <strong>{b.price}</strong>
                <small>{b.note}</small>
              </Peel>
            </div>
          ))}
          <RingBadge className="hero-ring" text="SINCE 1995 • FIGHTING FOOD WASTE •" center="95" label="Since 1995, fighting food waste" />
        </div>
      </div>

      <ul className="hero-stats">
        {STATS.map(([big, small], index) => (
          <li key={big} style={{ "--n": index } as CSSProperties}>
            <strong>{big}</strong>
            <span>{small}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
