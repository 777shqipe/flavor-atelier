import { useState, type CSSProperties } from "react";
import { useLang, useT } from "./i18n";
import { dateCheckStrings } from "./i18n/strings/DateCheck";
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
const fmt = (date: Date, locale: string) => date.toLocaleDateString(locale, { day: "2-digit", month: "short" }).toUpperCase();

/** Placeholder markdown steps for the demo pack. */
const MARKDOWNS = [
  { at: 7, price: 4, rot: -10 },
  { at: 30, price: 3, rot: 7 },
  { at: 60, price: 2, rot: -4 },
];
const RRP = 5.5;

/** Where each tick sits on the dial, in days. The words are in the strings file. */
const TICK_AT = [0, 30, 60, 90];

type Verdict = keyof typeof dateCheckStrings.en.verdict;

function verdictKey(days: number): Verdict {
  if (days === 0) return "atDate";
  if (days < 7) return "pulled";
  if (days < 30) return "crunchy";
  if (days < 60) return "softer";
  return "softened";
}

export function DateCheck() {
  const s = useT(dateCheckStrings);
  const { locale } = useLang();
  // The packs are printed when the page loads.
  const [printed] = useState(() => new Date());
  const [days, setDays] = useState(0);
  const price = MARKDOWNS.reduce((current, step) => (days >= step.at ? step.price : current), RRP);
  const today = new Date(printed.getTime() + days * DAY);

  return (
    <section className="dates" data-surface="cream" aria-labelledby="dates-title">
      <header className="section-head split rv">
        <div>
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="dates-title">{s.title}</h2>
        </div>
        <p className="lead">{s.lead}</p>
      </header>

      <div className="dc-grid rv" style={{ "--rv": "120ms" } as CSSProperties}>
        <article className="dc-card" data-kind="bb">
          <div className="dc-top">
            <span className="dc-kind">{s.bestBefore}</span>
            <span className="dc-ok">{s.onSale}</span>
          </div>
          <div className="dc-art">
            <div className="dc-pack" style={{ "--age": Math.min(1, days / 90) } as CSSProperties}>
              <Pack shape="box" color="#f3b62f" label={["CORN", "FLAKES"]} />
              <span className="dc-date">{s.bbDate(fmt(printed, locale))}</span>
            </div>
            {MARKDOWNS.map((step) => (
              <span
                key={step.at}
                className="dc-mark"
                data-on={days >= step.at || undefined}
                style={{ "--rot": `${step.rot}deg` } as CSSProperties}
                aria-hidden="true"
              >
                <small>{s.reduced}</small>${step.price}
              </span>
            ))}
            <Stamp on={days > 0} text={s.stillGood} sub={s.bbNote} tone="green" className="dc-stamp" />
          </div>
          <div className="dc-price">
            <span>{s.price}</span>
            <Odometer value={`$${price.toFixed(2)}`} />
            {price < RRP && <s>${RRP.toFixed(2)}</s>}
          </div>
          <p className="dc-verdict" aria-live="polite">
            {s.verdict[verdictKey(days)]}
          </p>
        </article>

        <article className="dc-card" data-kind="ub" data-gone={days > 0 || undefined}>
          <div className="dc-top">
            <span className="dc-kind">{s.useBy}</span>
            <span className="dc-ok">{days > 0 ? s.offShelf : s.onSale}</span>
          </div>
          <div className="dc-art">
            <div className="dc-pack">
              <Pack shape="carton" color="#6bb8ff" label={["FRESH", "MILK"]} />
              <span className="dc-date">{s.ubDate(fmt(printed, locale))}</span>
            </div>
            <Stamp on={days > 0} text={s.notForSale} sub={s.ubNote} className="dc-stamp" />
          </div>
          <div className="dc-price">
            <span>{s.price}</span>
            <strong>{days > 0 ? "—" : "$2.00"}</strong>
          </div>
          <p className="dc-verdict" aria-live="polite">
            {days > 0 ? s.pastUseBy : s.goodToday}
          </p>
        </article>
      </div>

      <div className="dc-dial rv" style={{ "--rv": "200ms", "--p": days / 90 } as CSSProperties}>
        <label htmlFor="dc-days">
          <span>{s.today(fmt(today, locale))}</span>
          <strong>
            <Odometer value={`+${String(days).padStart(2, "0")}`} /> {s.days}
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
          aria-valuetext={s.valueText(days)}
        />
        <ol className="dc-ticks" aria-hidden="true">
          {TICK_AT.map((at, i) => (
            <li key={at} style={{ "--at": at / 90 } as CSSProperties}>
              {s.ticks[i]}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
