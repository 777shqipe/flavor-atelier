import { useEffect, useRef, useState, type CSSProperties } from "react";
import { receiptStrings } from "./i18n/strings/Receipt";
import { useLang, useT } from "./i18n";
import { LogoMark } from "./Logo";
import { Odometer } from "./Odometer";
import { ITEMS } from "./products";
import { Stamp } from "./Stamp";
import { pauseWhenOffscreen } from "./offscreen";
import "./receipt.css";

/**
 * "Every receipt is a rescue": a till receipt that prints by itself once it
 * is in view, one line per item, each with the reason it would have been
 * binned elsewhere. The savings and the kilos kept out of landfill roll up as
 * lines print, then the receipt is torn off and stamped.
 */

/** Why each item would have been thrown out somewhere else is in the strings. Weights in kg. */
const BASKET = [
  { id: "popcorn", kg: 0.12 },
  { id: "muesli", kg: 0.75 },
  { id: "almonds", kg: 0.2 },
  { id: "dumplings", kg: 0.75 },
  { id: "cheddar", kg: 0.5 },
  { id: "oil", kg: 0.69 },
] as const;

const LINES = BASKET.flatMap((entry) => {
  const item = ITEMS.find((candidate) => candidate.id === entry.id);
  return item ? [{ ...entry, name: item.name, price: item.price, was: item.was ?? item.price }] : [];
});

const PAID = LINES.reduce((sum, line) => sum + line.price, 0);
const RRP = LINES.reduce((sum, line) => sum + line.was, 0);
const KG = LINES.reduce((sum, line) => sum + line.kg, 0);

const money = (value: number) => value.toFixed(2);
const clamp = (value: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, value));

/** Thin and thick bars from a fixed pattern, so the barcode never changes between renders. */
const BARS = "3112213121411312221321121131222113".split("").map(Number);

export function Receipt() {
  const s = useT(receiptStrings);
  const { locale } = useLang();
  // Till receipts keep the Australian dd/mm/yy date in every language.
  const [stampDate] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getFullYear()).slice(2)}`;
  });
  // Kilos follow the language's decimal mark; money stays "$12.50" everywhere.
  const kgText = (value: number) => value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const root = useRef<HTMLElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const roll = useRef<HTMLSpanElement>(null);
  const [printed, setPrinted] = useState(0);
  const [phase, setPhase] = useState<"idle" | "printing" | "done">("idle");
  // Each new line pops a "saved" tag out of the printer; n keys the animation.
  const [pop, setPop] = useState<{ n: number; text: string } | null>(null);

  useEffect(() => {
    const el = root.current;
    const pp = paper.current;
    const spool = roll.current;
    if (!el || !pp || !spool) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let height = 0;
    let rowEnds: number[] = [];
    let count = -1;
    let state = "";
    let clock = 0;
    let elapsed = 0;
    let previous = 0;
    let progress = reduce ? 1 : 0;
    let visible = false;
    let lastFed = -1;

    const measure = () => {
      height = pp.offsetHeight;
      rowEnds = Array.from(pp.querySelectorAll<HTMLElement>(".r-item")).map((row) => row.offsetTop + row.offsetHeight);
    };

    const show = (progress: number) => {
      const t = clamp(progress / 0.8);
      // Feed in small steps, like a thermal printer's stepper motor.
      const fed = Math.round((t * height) / 6) * 6;
      if (fed !== lastFed) {
        lastFed = fed;
        pp.style.translate = `0 ${Math.max(0, height - fed)}px`;
        // The roll in the window turns as paper leaves it, and gets a little thinner.
        spool.style.setProperty("--turn", `${(fed * 1.4).toFixed(0)}deg`);
        spool.style.setProperty("--left", (1 - t * 0.22).toFixed(3));
      }
      let n = 0;
      for (const end of rowEnds) if (end <= fed) n += 1;
      if (n !== count) {
        if (n > count && count >= 0 && n > 0) {
          const line = LINES[n - 1];
          setPop({ n, text: `$${money(line.was - line.price)}` });
        }
        count = n;
        setPrinted(n);
      }
      const next = progress >= 0.86 ? "done" : t > 0 ? "printing" : "idle";
      if (next !== state) {
        state = next;
        setPhase(next as typeof phase);
      }
    };

    const run = (now: number) => {
      if (previous) elapsed += Math.min(64, now - previous);
      previous = now;
      progress = clamp(elapsed / 5200);
      show(progress);
      clock = progress < 1 ? requestAnimationFrame(run) : 0;
    };
    const resume = () => {
      const active = visible && !document.hidden;
      el.toggleAttribute("data-print-paused", !active);
      if (!active) {
        cancelAnimationFrame(clock);
        clock = 0;
        previous = 0;
      } else if (!reduce && progress < 1 && !clock) {
        clock = requestAnimationFrame(run);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        resume();
      },
      { threshold: 0.35 },
    );

    measure();
    show(progress);
    io.observe(el);
    const stopLoops = pauseWhenOffscreen(el);
    document.addEventListener("visibilitychange", resume);
    // Re-measure on resize; the clock repaints on its own while it runs.
    const ro = new ResizeObserver(() => {
      measure();
      lastFed = -1;
      show(progress);
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(clock);
      io.disconnect();
      ro.disconnect();
      stopLoops();
      document.removeEventListener("visibilitychange", resume);
      el.removeAttribute("data-print-paused");
    };
  }, []);

  const shown = LINES.slice(0, printed);
  const saved = shown.reduce((sum, line) => sum + line.was - line.price, 0);
  const kept = shown.reduce((sum, line) => sum + line.kg, 0);
  // Two-line customer display: what was just rung up, then the running saving.
  const latest = shown[shown.length - 1];
  const lcd: [string, string] =
    phase === "done"
      ? [s.lcd.done, s.lcd.saved(money(RRP - PAID))]
      : phase === "printing"
        ? latest
          ? [latest.name, s.lcd.line(money(latest.price), money(latest.was))]
          : [s.lcd.printing, s.lcd.wait]
        : [s.lcd.ready, s.lcd.scan];
  const pressed = printed % 9;

  return (
    <section className="rcpt" ref={root} data-surface="green" data-phase={phase} aria-labelledby="rcpt-title">
      <div className="rcpt-pin">
        <div className="rcpt-copy">
          <p className="eyebrow">{s.eyebrow}</p>
          <h2 id="rcpt-title">
            {s.title.top}
            <br />
            {s.title.mid}
            <span className="rcpt-hl">
              {s.title.mark}
              {/* circled in pen, the way a cashier marks your savings */}
              <svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true">
                <path
                  pathLength="1"
                  d="M262 22C214 4 98 2 42 24 4 40 2 84 46 100c58 20 170 18 222-4 34-15 30-52-6-70-30-15-96-20-150-14"
                />
              </svg>
            </span>
          </h2>
          <p className="lead">{s.lead}</p>
          <dl className="rcpt-meters">
            <div>
              <dt>{s.meterSaved}</dt>
              <dd>
                <Odometer value={`$${money(saved).padStart(5, "0")}`} />
              </dd>
            </div>
            <div>
              <dt>{s.meterKept}</dt>
              <dd>
                <Odometer value={kgText(kept)} />
                <small>kg</small>
              </dd>
            </div>
          </dl>
          <p className="rcpt-note">{s.note}</p>
        </div>

        <div className="rcpt-stage">
          <div className="rcpt-fit">
            <div className="rcpt-window">
              <div className="rcpt-tear">
                <div className="paper" ref={paper}>
                  <header className="r-head">
                    <LogoMark className="r-logo" />
                    <strong>Cheaper Buy Miles</strong>
                    <span>{s.shop}</span>
                  </header>
                  <p className="r-row r-meta">
                    <span>{s.taxInvoice}</span>
                    <span>{stampDate} 10:24</span>
                  </p>
                  <p className="r-row r-meta">
                    <span>{s.till}</span>
                    <span>#001995</span>
                  </p>
                  <hr />
                  {LINES.map((line, i) => (
                    <div className={i < printed ? "r-item on" : "r-item"} key={line.id} style={{ "--i": i } as CSSProperties}>
                      <p className="r-row">
                        <span>{line.name}</span>
                        <span>{money(line.price)}</span>
                      </p>
                      <p className="r-row r-why">
                        <span>↳ {s.why[line.id]}</span>
                        <s>{money(line.was)}</s>
                      </p>
                    </div>
                  ))}
                  <hr />
                  <p className="r-row">
                    <span>{s.items(LINES.length)}</span>
                    <s>{money(RRP)}</s>
                  </p>
                  <p className="r-row">
                    <span>{s.paid}</span>
                    <span>{money(PAID)}</span>
                  </p>
                  <p className="r-row r-total">
                    <span>{s.youSaved}</span>
                    <span>${money(RRP - PAID)}</span>
                  </p>
                  <p className="r-row">
                    <span>{s.landfill}</span>
                    <span>{kgText(KG)} kg</span>
                  </p>
                  <p className="r-bar" aria-hidden="true">
                    {"█".repeat(18)}
                  </p>
                  <hr />
                  <div className="r-code" aria-hidden="true">
                    {BARS.map((w, i) => (
                      <i key={i} style={{ "--w": w, opacity: i % 2 ? 0 : 1 } as CSSProperties} />
                    ))}
                  </div>
                  <p className="r-digits" aria-hidden="true">9 312345 019950</p>
                  <p className="r-thanks">{s.thanks}</p>
                  <p className="r-small">{s.bestBefore}</p>
                  <p className="r-small">{s.customerCopy}</p>
                  <Stamp on={phase === "done"} text={s.stamp.text} sub={s.stamp.sub(kgText(KG))} className="r-stamp" />
                </div>
              </div>
            </div>
            <div className="register" aria-hidden="true">
              {/* top deck: the slot, a warm glow while the head prints, the serrated tear bar */}
              <div className="reg-top">
                <span className="reg-mouth" />
              </div>
              <span className="reg-heat" />
              <span className="reg-cutter">
                <i className="reg-blade" />
              </span>
              <div className="reg-face">
                <span className="reg-roll" ref={roll}>
                  <i />
                </span>
                <span className="reg-lcd">
                  <span key={`a-${lcd[0]}`}>{lcd[0]}</span>
                  <span key={`b-${lcd[1]}`}>{lcd[1]}</span>
                </span>
                <span className="reg-pad">
                  {Array.from({ length: 9 }, (_, i) => (
                    <i key={i === pressed && printed ? `p${printed}` : i} data-on={(i === pressed && printed > 0) || undefined} />
                  ))}
                </span>
              </div>
              <div className="reg-foot">
                <LogoMark className="reg-logo" />
                <span>{s.foot}</span>
                <i className="reg-led" />
              </div>
            </div>
            {pop && phase !== "idle" && (
              <span className="r-pop" key={pop.n} aria-hidden="true">
                <small>{s.popSaved}</small>
                {pop.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
