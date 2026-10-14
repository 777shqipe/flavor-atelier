import { useState, type CSSProperties } from "react";
import { Odometer } from "./Odometer";
import { Pack } from "./Pack";
import { Stamp } from "./Stamp";
import "./datecheck.css";

/**
 * "Best before isn't a bin day": drag the calendar forward and watch two packs
 * age. The best-before one stays on sale and collects markdown stickers; the
 * use-by one comes off the shelf the day after its date.
 */

const DAY = 86_400_000;
const PRINTED = new Date();
const fmt = (date: Date) =>
  date.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }).toUpperCase();

/** Placeholder markdown steps for the demo pack. */
const MARKDOWNS = [
  { at: 7, price: 4, rot: -10 },
  { at: 30, price: 3, rot: 7 },
  { at: 60, price: 2, rot: -4 },
];
const RRP = 5.5;

const TICKS = [
  [0, "The date"],
  [30, "+1 month"],
  [60, "+2 months"],
  [90, "+3 months"],
] as const;

function verdict(days: number) {
  if (days === 0) return "On the date. Full price at the big chains.";
  if (days < 7) return "Pulled from most shelves. Not from ours.";
  if (days < 30) return "Still crunchy. Still perfectly good.";
  if (days < 60) return "Maybe a touch less crunchy. Still safe.";
  return "Quality may soften. Safety doesn’t change.";
}

export function DateCheck() {
  const [days, setDays] = useState(0);
  const price = MARKDOWNS.reduce((current, step) => (days >= step.at ? step.price : current), RRP);
  const today = new Date(PRINTED.getTime() + days * DAY);

  return (
    <section className="dates" data-surface="cream" aria-labelledby="dates-title">
      <header className="section-head split rv">
        <div>
          <span className="chapter" aria-hidden="true">04</span>
          <p className="eyebrow">Read the label</p>
          <h2 id="dates-title">Best before isn’t a bin day.</h2>
        </div>
        <p className="lead">
          <b>Best before</b> is about quality: after the date, food is still safe and can be sold as long as it’s in
          good condition. <b>Use by</b> is about safety: we never sell anything past it. Drag the calendar and see.
        </p>
      </header>

      <div className="dc-grid rv" style={{ "--rv": "120ms" } as CSSProperties}>
        <article className="dc-card" data-kind="bb">
          <div className="dc-top">
            <span className="dc-kind">Best before</span>
            <span className="dc-ok">On sale</span>
          </div>
          <div className="dc-art">
            <div className="dc-pack" style={{ "--age": Math.min(1, days / 90) } as CSSProperties}>
              <Pack shape="box" color="#f3b62f" label={["CORN", "FLAKES"]} />
              <span className="dc-date">BB {fmt(PRINTED)}</span>
            </div>
            {MARKDOWNS.map((step) => (
              <span
                key={step.at}
                className="dc-mark"
                data-on={days >= step.at || undefined}
                style={{ "--rot": `${step.rot}deg` } as CSSProperties}
                aria-hidden="true"
              >
                <small>Reduced</small>${step.price}
              </span>
            ))}
            <Stamp on={days > 0} text="Still good" sub="Best before ≠ bad after" tone="green" className="dc-stamp" />
          </div>
          <div className="dc-price">
            <span>Price</span>
            <Odometer value={`$${price.toFixed(2)}`} />
            {price < RRP && <s>${RRP.toFixed(2)}</s>}
          </div>
          <p className="dc-verdict" aria-live="polite">
            {verdict(days)}
          </p>
        </article>

        <article className="dc-card" data-kind="ub" data-gone={days > 0 || undefined}>
          <div className="dc-top">
            <span className="dc-kind">Use by</span>
            <span className="dc-ok">{days > 0 ? "Off the shelf" : "On sale"}</span>
          </div>
          <div className="dc-art">
            <div className="dc-pack">
              <Pack shape="carton" color="#6bb8ff" label={["FRESH", "MILK"]} />
              <span className="dc-date">USE BY {fmt(PRINTED)}</span>
            </div>
            <Stamp on={days > 0} text="Not for sale" sub="Use by means use by" className="dc-stamp" />
          </div>
          <div className="dc-price">
            <span>Price</span>
            <strong>{days > 0 ? "—" : "$2.00"}</strong>
          </div>
          <p className="dc-verdict" aria-live="polite">
            {days > 0 ? "Past use by. We don’t sell it, ever." : "Good until the end of today."}
          </p>
        </article>
      </div>

      <div className="dc-dial rv" style={{ "--rv": "200ms", "--p": days / 90 } as CSSProperties}>
        <label htmlFor="dc-days">
          <span>Today is {fmt(today)}</span>
          <strong>
            <Odometer value={`+${String(days).padStart(2, "0")}`} /> days
          </strong>
        </label>
        <input
          id="dc-days"
          type="range"
          min={0}
          max={90}
          step={1}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          aria-valuetext={`${days} days past the printed date`}
        />
        <ol className="dc-ticks" aria-hidden="true">
          {TICKS.map(([at, text]) => (
            <li key={at} style={{ "--at": at / 90 } as CSSProperties}>
              {text}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
