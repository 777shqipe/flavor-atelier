import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { CART_SVG } from "./mapArt";
import { Odometer } from "./Odometer";
import "./timemachine.css";

/**
 * Our story as a time machine: a destination display, a rail with four stops
 * and the trolley that rides it. Pick a year and the display spins through
 * every year in between, the stars streak into a warp, and the window lands on
 * that era with what was happening to food waste in Australia at the time.
 * While nobody touches it, it travels on its own.
 */

const NOW = new Date().getFullYear();

type Era = {
  year: number;
  short: string;
  title: string;
  text: string;
  chips: string[];
  src: string;
  accent: string;
  meanwhile: string;
};

const ERAS: Era[] = [
  {
    year: 1995,
    short: "The first shop",
    title: "The first shop",
    text: "A small shop, a few shelves and a lot of jam. One clear idea from day one: perfectly good food should never be wasted.",
    chips: ["One small shop", "One clear idea"],
    src: "/media/about-1995.jpg",
    accent: "#ff6a4d",
    meanwhile: "Australia’s first food bank had opened in Sydney only three years earlier. Rescuing surplus food was still a fringe idea.",
  },
  {
    year: 2005,
    short: "A growing community",
    title: "A growing community",
    text: "More people discover the thrill of an unexpected bargain, and the business grows into new neighbourhoods.",
    chips: ["New neighbourhoods", "More bargain hunters"],
    src: "/media/about-basket.jpg",
    accent: "#f6b531",
    meanwhile: "OzHarvest (2004) and SecondBite (2005) start collecting surplus food for people who need it.",
  },
  {
    year: 2015,
    short: "More stores, less waste",
    title: "More stores, less waste",
    text: "The network spreads across Melbourne, giving suppliers a better place for surplus stock than the skip.",
    chips: ["Across Melbourne", "Surplus finds a home"],
    src: "/media/about-aisle.jpg",
    accent: "#b6d36a",
    meanwhile: "Supermarkets start selling “ugly” fruit and veg (2014), and Australia commits to halving food waste by 2030 (2017).",
  },
  {
    year: NOW,
    short: "Today",
    title: "Still fighting food waste",
    text: "Four stores, millions of products rescued, and the same purpose that started it all: one bargain at a time.",
    chips: ["Four stores", "Millions of products rescued"],
    src: "/media/about-shelf.jpg",
    accent: "#6fd3b0",
    meanwhile: "Australia still wastes around 7.6 million tonnes of food a year. Plenty left to rescue.",
  },
];

/** Star streaks for the warp, from a fixed pattern so they never jump between renders. */
const STARS = Array.from({ length: 44 }, (_, i) => ({
  angle: (i * 137.5) % 360,
  reach: 18 + ((i * 53) % 34),
  size: 0.6 + ((i * 29) % 10) / 10,
  delay: (i * 71) % 900,
}));

const AUTO_MS = 7000;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TimeMachine() {
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
            <p className="eyebrow">Thirty years, four stops</p>
            <h2 id="tm-title">
              Our story, <em>at full speed.</em>
            </h2>
          </header>

          <div className="tm-screen">
            <p className="tm-row">
              <span>Destination time</span>
              <span className="tm-led" aria-hidden="true" />
            </p>
            <div className="tm-display" data-go={shown !== era.year || undefined}>
              <span className="tm-ghost" aria-hidden="true">
                <Odometer value="8888" />
              </span>
              <Odometer value={String(shown)} />
            </div>
            <p className="tm-row tm-present">
              <span>Present time</span>
              <b>{NOW}</b>
            </p>
          </div>

          <div className="tm-rail" ref={rail} role="tablist" aria-label="Our history" onKeyDown={onKey}>
            <span className="tm-track" aria-hidden="true">
              <i />
            </span>
            <span className="tm-cart" data-dir={heading} aria-hidden="true" dangerouslySetInnerHTML={{ __html: CART_SVG }} />
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
                <b>{i === last ? "Today" : item.year}</b>
                <small>{item.short}</small>
              </button>
            ))}
          </div>

          <aside className="tm-meanwhile" key={`mw-${era.year}`}>
            <b>Meanwhile in Australia</b>
            <p>{era.meanwhile}</p>
          </aside>

          <button className="tm-auto" type="button" aria-pressed={auto} onClick={() => setAuto((on) => !on)}>
            <span className="tm-auto-ring" key={`ring-${index}-${auto}`} aria-hidden="true" />
            {auto ? "Pause the trip" : "Travel on its own"}
          </button>
        </div>

        <article className="tm-window" id="tm-panel" role="tabpanel" aria-labelledby={`tm-tab-${index}`} key={era.year}>
          <figure className="tm-photo">
            <img src={era.src} alt={`${era.title}, ${index === last ? "today" : era.year}`} draggable={false} />
            <figcaption>
              <b>{index === last ? "Today" : era.year}</b>
              <span>Stop 0{index + 1} / 0{ERAS.length}</span>
            </figcaption>
          </figure>
          <div className="tm-copy" aria-live="polite">
            <h3>{era.title}</h3>
            <p>{era.text}</p>
            <ul className="tm-chips">
              {era.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
