import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { useT } from "./i18n";
import { timeMachineStrings } from "./i18n/strings/TimeMachine";
import { CART_SVG } from "./mapArt";
import "./timemachine.css";

/**
 * Our story as a time machine: a destination display, a rail with four stops
 * and the trolley that rides it. Pick a year and the display spins through
 * every year in between on a "now serving" LED sign, the stars streak past, and
 * the window cross-fades to that era, its highlights stuck on as stickers and
 * what was happening to food waste in Australia at the time alongside.
 * While nobody touches it, it travels on its own.
 */

const NOW = new Date().getFullYear();

type EraId = keyof typeof timeMachineStrings.en.eras;

type Era = {
  id: EraId;
  year: number;
  src: string;
  accent: string;
};

const ERAS: Era[] = [
  {
    id: "first",
    year: 1995,
    src: "/media/about-1995.jpg",
    accent: "#ff6a4d",
  },
  {
    id: "growing",
    year: 2005,
    src: "/media/about-basket.jpg",
    accent: "#f6b531",
  },
  {
    id: "more",
    year: 2015,
    src: "/media/about-aisle.jpg",
    accent: "#b6d36a",
  },
  {
    id: "today",
    year: NOW,
    src: "/media/about-shelf.jpg",
    accent: "#6fd3b0",
  },
];

/** Star streaks for the warp, from a fixed pattern so they never jump between renders. */
const STARS = Array.from({ length: 44 }, (_, i) => ({
  angle: (i * 137.5) % 360,
  reach: 18 + ((i * 53) % 34),
  size: 0.6 + ((i * 29) % 10) / 10,
  delay: (i * 71) % 900,
}));

/** Seven-segment LED, like a "now serving" sign: thin rounded strokes, and which of a–g each digit lights. */
const SEGMENTS = {
  a: "M16 8H48",
  b: "M56 16V48",
  c: "M56 64V96",
  d: "M16 104H48",
  e: "M8 64V96",
  f: "M8 16V48",
  g: "M16 56H48",
};
const LIT = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

function Led({ value }: { value: string }) {
  return (
    <span className="tm-led-digits" role="img" aria-label={value}>
      {[...value].map((char, column) => (
        <svg key={column} viewBox="0 0 64 112" aria-hidden="true">
          {Object.entries(SEGMENTS).map(([name, d]) => (
            <path key={name} d={d} data-on={LIT[Number(char)]?.includes(name) || undefined} />
          ))}
        </svg>
      ))}
    </span>
  );
}

const AUTO_MS = 7000;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TimeMachine() {
  const s = useT(timeMachineStrings);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(ERAS[0].year);
  const [warp, setWarp] = useState(0);
  const [heading, setHeading] = useState<"l" | "r">("r");
  const [auto, setAuto] = useState(true);
  const [seen, setSeen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const spin = useRef(0);
  const era = ERAS[index];
  const copy = s.eras[era.id];
  const last = ERAS.length - 1;

  const travel = (next: number) => {
    if (next === index) return;
    const from = shown;
    const to = ERAS[next].year;
    setHeading(next > index ? "r" : "l");
    setIndex(next);
    cancelAnimationFrame(spin.current);
    if (reduced()) {
      setShown(to);
      return;
    }
    setWarp((n) => n + 1);
    // Spin the display through every year on the way, fast in the middle, easing into the arrival.
    const ms = 1100;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / ms);
      const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setShown(Math.round(from + (to - from) * k));
      if (t < 1) spin.current = requestAnimationFrame(tick);
    };
    spin.current = requestAnimationFrame(tick);
  };
  const pick = (next: number) => {
    setAuto(false);
    travel(next);
  };

  useEffect(() => () => cancelAnimationFrame(spin.current), []);

  // Only travel on its own while the section is on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !seen || reduced()) return;
    const timer = window.setTimeout(() => travel(index === last ? 0 : index + 1), AUTO_MS);
    return () => window.clearTimeout(timer);
  });

  const onKey = (event: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = Math.min(last, Math.max(0, keys[event.key]));
    pick(next);
    rail.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section
      className="tm"
      ref={root}
      data-surface="deep"
      data-auto={(auto && seen) || undefined}
      aria-labelledby="tm-title"
      style={{ "--a": era.accent, "--p": index / last } as CSSProperties}
    >
      <div className="tm-warp" key={warp} data-go={warp > 0 || undefined} aria-hidden="true">
        {STARS.map((star, i) => (
          <i
            key={i}
            style={{ "--r": `${star.angle}deg`, "--d": `${star.reach}vmax`, "--s": star.size, "--w": `${star.delay}ms` } as CSSProperties}
          />
        ))}
      </div>

      <div className="tm-grid">
        <div className="tm-console">
          <header className="tm-head">
            <p className="eyebrow">{s.eyebrow}</p>
            <h2 id="tm-title">{s.heading}</h2>
          </header>

          <div className="tm-screen">
            <p className="tm-plate">{s.plate}</p>
            <div className="tm-display" data-go={shown !== era.year || undefined}>
              <Led value={String(shown)} />
            </div>
            <p className="tm-row">
              <span>
                {s.present} <b>{NOW}</b>
              </span>
              <span className="tm-led" aria-hidden="true" />
            </p>
          </div>

          <div className="tm-rail" ref={rail} role="tablist" aria-label={s.historyLabel} onKeyDown={onKey}>
            <span className="tm-track" aria-hidden="true">
              <i />
            </span>
            <span className="tm-cart" data-dir={heading} data-load={index} aria-hidden="true" dangerouslySetInnerHTML={{ __html: CART_SVG }} />
            {ERAS.map((item, i) => (
              <button
                key={item.year}
                type="button"
                role="tab"
                id={`tm-tab-${i}`}
                aria-selected={i === index}
                aria-controls="tm-panel"
                tabIndex={i === index ? 0 : -1}
                data-past={i < index || undefined}
                style={{ "--i": i, "--c": item.accent } as CSSProperties}
                onClick={() => pick(i)}
              >
                <i className="tm-stop" aria-hidden="true" />
                <b>{i === last ? s.today : item.year}</b>
                <small>{s.eras[item.id].short}</small>
              </button>
            ))}
          </div>

          <aside className="tm-meanwhile" key={`mw-${era.year}`}>
            <b>{s.meanwhileLabel}</b>
            <p>{copy.meanwhile}</p>
          </aside>

          <button className="tm-auto" type="button" aria-pressed={auto} onClick={() => setAuto((on) => !on)}>
            <span className="tm-auto-ring" key={`ring-${index}-${auto}`} aria-hidden="true" />
            {auto ? s.pause : s.travel}
          </button>
        </div>

        <article className="tm-window" id="tm-panel" role="tabpanel" aria-labelledby={`tm-tab-${index}`}>
          <figure className="tm-photo">
            {ERAS.map((item, i) => (
              <img
                key={item.year}
                src={item.src}
                alt={i === index ? s.photoAlt(s.eras[item.id].title, i === last ? s.todayLower : String(item.year)) : ""}
                aria-hidden={i !== index || undefined}
                data-on={i === index || undefined}
                draggable={false}
              />
            ))}
            <figcaption key={era.year}>
              <b className="tm-year">{index === last ? s.today : era.year}</b>
              <ul className="tm-stickers">
                {copy.chips.map((chip, i) => (
                  <li key={chip} style={{ "--k": i } as CSSProperties}>
                    {chip}
                  </li>
                ))}
              </ul>
              <div className="tm-copy" aria-live="polite">
                <h3>{copy.title}</h3>
                <p>{copy.text}</p>
              </div>
            </figcaption>
          </figure>
        </article>
      </div>
    </section>
  );
}
