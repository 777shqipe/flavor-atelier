import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AppleCut } from "./AppleCut";
import type { Page } from "./Header";
import { ChocBar, GoodsDefs, Gelato, Jam, OatMilk, OliveOil, Ramen, Soda } from "./HeroGoods";
import { Peel } from "./Peel";
import { useT } from "./i18n";
import { heroStrings } from "./i18n/strings/Hero";
import "./hero.css";

/** Seven stickers stacked back to front; the class sets position, size and tilt. */
const STICKERS = [
  { cls: "k-oil", Art: OliveOil },
  { cls: "k-ramen", Art: Ramen },
  { cls: "k-milk", Art: OatMilk },
  { cls: "k-soda", Art: Soda },
  { cls: "k-gelato", Art: Gelato },
  { cls: "k-jam", Art: Jam },
  { cls: "k-choc", Art: ChocBar },
] as const;

/** Markdown stickers, each stuck over the shelf price it beat. Peel one to see. */
const BURSTS = [
  { cls: "b1", price: "$4", from: "br" },
  { cls: "b2", price: "$2", from: "bl" },
] as const;

export function Hero({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const s = useT(heroStrings);
  const root = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toFinds = () => document.getElementById("finds")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero" ref={root} data-surface="green" data-ready={ready || undefined} aria-labelledby="hero-title">
      <div className="aurora" aria-hidden="true" />
      <span className="spark s1" aria-hidden="true">✦</span>
      <span className="spark s2" aria-hidden="true">✦</span>
      <span className="spark s3" aria-hidden="true">✦</span>
      <p className="hero-ghost">
        <span>{s.ghost[0]}</span> <span>{s.ghost[1]}</span>
      </p>

      <div className="hero-grid">
        <div className="hero-copy">

          <h1 id="hero-title">
            {s.lines.map((line, index) => (
              <span className="hero-line" key={index}>
                <span style={{ "--l": index } as CSSProperties}>{line}</span>
              </span>
            ))}
          </h1>

          <p className="lead">{s.lead}</p>

          <div className="hero-ctas">
            <button className="button" type="button" onClick={() => onNavigate("stores")}>
              {s.findStore}
            </button>
            <button className="button ghost" type="button" onClick={toFinds}>
              {s.seeFinds}
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
          {/* The span turns, not the svg: Chrome runs a turning span on the GPU but keeps an <svg> on the main thread. */}
          <span className="ring-art" aria-hidden="true">
            <svg viewBox="0 0 100 100" focusable="false">
              <circle cx="50" cy="50" r="49" />
              <circle className="orbit-dot" cx="50" cy="1" r="1.1" />
            </svg>
          </span>

          {STICKERS.map(({ cls, Art }, index) => (
            <button
              key={cls}
              className={`stk ${cls}`}
              type="button"
              aria-label={s.stickerLink(s.stickers[index])}
              style={{ "--e": `${index * 90 + 300}ms` } as CSSProperties}
              onClick={toFinds}
            >
              {/* The float is on a span, not on the <svg>: Chrome runs it on the GPU there but keeps an <svg> on the main thread. */}
              <span className="stk-bob">
                <span className="stk-in">
                  <Art />
                </span>
              </span>
            </button>
          ))}

          {BURSTS.map((b, index) => (
            <div key={b.cls} className={`hb ${b.cls}`} aria-hidden="true">
              <Peel
                className="hb-peel"
                from={b.from}
                bleed={0.06}
                back={{ clipPath: "var(--burst)" }}
                under={
                  <span className="hb-under">
                    <small>{s.rrp}</small>
                    <s>{s.bursts[index].rrp}</s>
                  </span>
                }
              >
                <i className="hb-rim" />
                <i className="hb-fill" />
                <strong>{b.price}</strong>
                <small>{s.bursts[index].note}</small>
              </Peel>
            </div>
          ))}
          <AppleCut className="hero-apple" copy={s.apple} />
        </div>
      </div>

      <ul className="hero-stats">
        {s.stats.map(([big, small], index) => (
          <li key={big} style={{ "--n": index } as CSSProperties}>
            <strong>{big}</strong>
            <span>{small}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
