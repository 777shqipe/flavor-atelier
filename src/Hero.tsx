import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Page } from "./Header";
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

const STICKERS = [
  { id: "orange", cls: "k1", src: "/media/sanpellegrino-cut.webp", w: 723, h: 827, label: "Sanpellegrino Aranciata Rossa, $4" },
  { id: "ramen", cls: "k2", src: "/media/shin-cut.webp", w: 840, h: 899, label: "Shin Ramyun Black, $4" },
  { id: "choc", cls: "k3", src: "/media/milka-cut.webp", w: 822, h: 345, label: "Milka Biscoff, $2" },
] as const;

/** Markdown stickers, each stuck over the shelf price it beat. Peel one to see. */
const BURSTS = [
  { cls: "b1", price: "$4", note: "4 × 330ml", from: "br", rrp: "Ouch." },
  { cls: "b2", price: "$4", note: "4 pack", from: "bl", rrp: "Yikes." },
  { cls: "b3", price: "$2", note: "Limited", from: "tl", rrp: "Nope." },
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

  const toFinds = () => document.getElementById("in-store")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero" ref={root} data-surface="green" data-ready={ready || undefined} aria-labelledby="hero-title">
      <div className="aurora" aria-hidden="true" />
      <span className="spark s1" aria-hidden="true">✦</span>
      <span className="spark s2" aria-hidden="true">✦</span>
      <span className="spark s3" aria-hidden="true">✦</span>

      <div className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Melbourne’s favourite discount grocer</p>

          <h1 id="hero-title">
            {LINES.map((line, index) => (
              <span className="hero-line" key={index}>
                <span style={{ "--l": index } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>

          <p className="lead">Big-name groceries rescued from waste and brought to your basket for a fraction of the usual price.</p>

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
          <div className="disc" aria-hidden="true" />
          <svg className="ring-art" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="49" />
          </svg>

          {STICKERS.map((item, index) => (
            <button
              key={item.id}
              className={`stk ${item.cls}`}
              type="button"
              aria-label={`${item.label}. See this week’s finds`}
              style={{ "--e": `${index * 130 + 300}ms` } as CSSProperties}
              onClick={toFinds}
            >
              <span className="stk-in">
                <img src={item.src} width={item.w} height={item.h} alt="" draggable={false} />
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
          <span className="tag t1 outlined" aria-hidden="true">
            New<br />every week
          </span>
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
