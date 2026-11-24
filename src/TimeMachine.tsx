import focacciaPhoto from "../focaccia-primo-prodotto.jpg";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useT } from "./i18n";
import { timeMachineStrings } from "./i18n/strings/TimeMachine";
import "./timemachine.css";

const ERAS = [
  { id: "first", year: 1995, src: focacciaPhoto },
  { id: "growing", year: 2005, src: "/media/about-basket.jpg" },
  { id: "more", year: 2015, src: "/media/about-aisle.jpg" },
  { id: "today", year: new Date().getFullYear(), src: "/media/about-shelf.jpg" },
] as const;

/** Horizontal history gallery: large central year, photos beside it, timeline underneath. */
export function TimeMachine() {
  const s = useT(timeMachineStrings);
  const [active, setActive] = useState(0);
  const [displayYear, setDisplayYear] = useState<number>(ERAS[0].year);
  const currentYear = useRef<number>(ERAS[0].year);
  useEffect(() => {
    const target = ERAS[active].year;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentYear.current = target;
      const frame = requestAnimationFrame(() => setDisplayYear(target));
      return () => cancelAnimationFrame(frame);
    }
    const from = currentYear.current;
    if (from === target) return;
    let frame = 0;
    let start: number | null = null;
    const duration = Math.min(1600, Math.max(850, Math.abs(target - from) * 55));
    const tick = (time: number) => {
      start ??= time;
      const t = Math.min(1, (time - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const year = Math.round(from + (target - from) * eased);
      if (year !== currentYear.current) {
        currentYear.current = year;
        setDisplayYear(year);
      }
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const touch = useRef<{ x: number; y: number } | null>(null);
  const select = (i: number) => setActive(Math.max(0, Math.min(ERAS.length - 1, i)));
  const era = ERAS[active];
  const copy = s.eras[era.id];
  const prev = ERAS[Math.max(0, active - 1)];
  const next = ERAS[Math.min(ERAS.length - 1, active + 1)];

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); select(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); select(active - 1); }
  };
  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") return;
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x;
    const dy = e.clientY - touch.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) select(active + (dx < 0 ? 1 : -1));
    touch.current = null;
  };

  return (
    <section className="tm" id="timeline" data-surface="cream" aria-labelledby="tm-title" onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { touch.current = null; }}>
      <header className="tm-heading">
        <p className="eyebrow">{s.eyebrow}</p>
        <h2 id="tm-title">{s.historyLabel}</h2>
      </header>

      <div className="tm-stage" aria-live="polite" aria-atomic="true">
        <figure className="tm-side tm-side-left">
          <img key={prev.id} src={prev.src} alt="" loading="lazy" decoding="async" />
        </figure>
        <div className="tm-center">
          <span className="tm-year">
            <span className="sr-only">{era.year}</span>
            {String(displayYear).split("").map((digit, i) => (
              <span className="tm-digit" key={i} aria-hidden="true">
                <span className="tm-digit-value" key={`${i}-${digit}`}>{digit}</span>
              </span>
            ))}
          </span>
          <div className="tm-story" key={era.id}>
            <h3>{copy.title}</h3>
            <p>{copy.text}</p>
          </div>
        </div>
        <figure className="tm-side tm-side-right">
          <img key={next.id} src={next.src} alt="" loading="lazy" decoding="async" />
        </figure>
      </div>

      <nav className="tm-navigation" aria-label={s.historyLabel}>
        <button className="tm-arrow" type="button" onClick={() => select(active - 1)} disabled={active === 0} aria-label="Previous year">‹</button>
        <div className="tm-line" role="group" aria-label={s.historyLabel}>
          {ERAS.map((item, i) => (
            <button key={item.id} type="button" className="tm-point" data-active={i === active || undefined} aria-label={String(item.year)} aria-current={i === active ? "step" : undefined} onClick={() => select(i)}>
              <span className="tm-dot" />
              <span className="tm-point-year">{item.year}</span>
            </button>
          ))}
        </div>
        <button className="tm-arrow" type="button" onClick={() => select(active + 1)} disabled={active === ERAS.length - 1} aria-label="Next year">›</button>
      </nav>
    </section>
  );
}
