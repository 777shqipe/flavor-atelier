import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { CartSvg } from "./CartSvg";
import { useRoadDrive } from "./useRoadDrive";
import "./about.css";
import "./scenery.css";

type Era = {
  year: string;
  short: string;
  title: string;
  text: string;
  chips: string[];
  src: string;
  w: number;
  h: number;
  tilt: number;
  bg: string;
  ink: string;
  accent: string;
  tone: "light" | "dark";
};

const NOW = String(new Date().getFullYear());

const ERAS: Era[] = [
  {
    year: "1995",
    short: "The first shop",
    title: "The first shop",
    text: "Our story begins with a small shop, a few shelves and one clear idea: perfectly good food should never be wasted.",
    chips: ["One small shop", "One clear idea"],
    src: "/media/about-1995.jpg",
    w: 346,
    h: 280,
    tilt: -4,
    bg: "#ebe3c4",
    ink: "#00382a",
    accent: "#e3261b",
    tone: "light",
  },
  {
    year: "2005",
    short: "A growing community",
    title: "A growing community",
    text: "More customers discover the joy of an unexpected bargain and the business begins growing into new neighbourhoods.",
    chips: ["New neighbourhoods", "More bargain-hunters"],
    src: "/media/about-basket.jpg",
    w: 312,
    h: 360,
    tilt: 3,
    bg: "#f3d98b",
    ink: "#00382a",
    accent: "#005842",
    tone: "light",
  },
  {
    year: "2015",
    short: "More stores, less waste",
    title: "More stores, less waste",
    text: "Our network expands across Melbourne, helping suppliers find a better destination for surplus stock.",
    chips: ["Across Melbourne", "Surplus finds a home"],
    src: "/media/about-aisle.jpg",
    w: 316,
    h: 360,
    tilt: -2,
    bg: "#c9d6c8",
    ink: "#00382a",
    accent: "#005842",
    tone: "light",
  },
  {
    year: NOW,
    short: "Today",
    title: "Still fighting food waste",
    text: "Four stores, millions of products rescued and the same purpose that started it all—one bargain at a time.",
    chips: ["Four stores", "Millions of products rescued"],
    src: "/media/about-shelf.jpg",
    w: 316,
    h: 360,
    tilt: 4,
    bg: "#005842",
    ink: "#f6f0db",
    accent: "#f6b531",
    tone: "dark",
  },
];

/** Mechanical odometer: every digit is a strip that rolls to its new value. */
function Odometer({ value }: { value: string }) {
  return (
    <div className="odo" role="img" aria-label={value}>
      {[...value].map((digit, column) => (
        <span className="odo-col" key={column} style={{ "--c": column } as CSSProperties}>
          <span className="odo-strip" style={{ translate: `0 ${-Number(digit) * 10}%` }}>
            {"0123456789".split("").map((n) => (
              <i key={n}>{n}</i>
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

function Timeline() {
  const root = useRef<HTMLElement>(null);
  const [state, setState] = useState({ index: 0, prev: 0, ox: 50, oy: 50, key: 0 });
  const road = useRef<HTMLDivElement>(null);
  const fx = useRef<HTMLCanvasElement>(null);
  const swipe = useRef<number | null>(null);
  const { index, prev } = state;
  const era = ERAS[index];
  const last = ERAS.length - 1;

  const goTo = (next: number, origin?: { x: number; y: number }) => {
    if (next === index) return;
    const box = root.current?.getBoundingClientRect();
    const ox = origin && box ? ((origin.x - box.left) / box.width) * 100 : 50;
    const oy = origin && box ? ((origin.y - box.top) / box.height) * 100 : 40;
    setState((s) => ({ index: next, prev: s.index, ox, oy, key: s.key + 1 }));
  };

  const fromEvent = (event: { clientX: number; clientY: number }) => ({ x: event.clientX, y: event.clientY });
  const step = (direction: number, origin?: { x: number; y: number }) =>
    goTo((index + direction + ERAS.length) % ERAS.length, origin);

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? last : Math.min(last, Math.max(0, index + (event.key === "ArrowRight" ? 1 : -1)));
    goTo(next);
    root.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  const onDown = (event: PointerEvent) => {
    swipe.current = event.clientX;
  };
  const onUp = (event: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = event.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1, fromEvent(event));
    else step(1, fromEvent(event));
  };

  const progress = index / last;
  useRoadDrive(road, fx, index, ERAS.length, [era.accent, era.ink, "#f6b531", era.bg === "#005842" ? "#f6f0db" : "#ffffff"]);
  const vars = {
    "--tl-bg": era.bg,
    "--tl-ink": era.ink,
    "--tl-accent": era.accent,
    "--p": progress,
  } as CSSProperties;

  return (
    <section className="timeline" ref={root} data-tone={era.tone} style={vars} aria-labelledby="timeline-title">
      <div className="tl-bg" aria-hidden="true">
        <div className="tl-layer" style={{ background: ERAS[prev].bg }} />
        <div
          className="tl-layer cur"
          key={state.key}
          style={{ background: era.bg, "--ox": `${state.ox}%`, "--oy": `${state.oy}%` } as CSSProperties}
        />
      </div>

      <div className="tl-inner">
        <header className="section-head tl-head">
          <p className="eyebrow">From one small shop</p>
          <h2 id="timeline-title">Our story through the years.</h2>
        </header>

        <div className="tl-road" ref={road} role="tablist" aria-label="Company history" onKeyDown={onKey}>
          <div className="scenery far" aria-hidden="true" />
          <div className="scenery near" aria-hidden="true" />
          <div className="road" aria-hidden="true">
            <span className="road-fill" />
          </div>
          <canvas className="road-fx" ref={fx} aria-hidden="true" />
          <div className="cart" data-n="1" aria-hidden="true">
            <div className="cart-shadow" />
            <div className="cart-rig">
              <div className="cart-lines">
                <i />
                <i />
                <i />
              </div>
              <div className="cart-hop">
                <CartSvg />
              </div>
            </div>
          </div>
          {ERAS.map((item, i) => (
            <button
              key={item.short}
              className="stop"
              type="button"
              role="tab"
              aria-selected={i === index}
              data-passed={i < index || undefined}
              tabIndex={i === index ? 0 : -1}
              style={{ "--s": i / last } as CSSProperties}
              onClick={(event) => goTo(i, fromEvent(event))}
            >
              <span className="stop-dot" />
              <span className="stop-year">{i === last ? "Today" : item.year}</span>
              <span className="stop-label">{item.short}</span>
            </button>
          ))}
        </div>

        <div className="tl-stage">
          <div className="tl-copy">
            <Odometer value={era.year} />
            <div className="tl-text" key={`text-${index}`} aria-live="polite">
              <h3>{era.title}</h3>
              <p>{era.text}</p>
              <ul className="tl-chips">
                {era.chips.map((chip) => (
                  <li key={chip}>{chip}</li>
                ))}
              </ul>
              <button className="tl-next" type="button" onClick={(event) => step(1, fromEvent(event))}>
                <span>{index === last ? "Back to the start" : "Next stop"}</span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d={index === last ? "M3 12a9 9 0 1 0 3-6.7M3 4v5h5" : "M4 12h15M13 6l6 6-6 6"} />
                </svg>
              </button>
            </div>
          </div>

          <div
            className="tl-deck"
            onPointerDown={onDown}
            onPointerUp={onUp}
            onPointerCancel={() => (swipe.current = null)}
            title="Click or swipe for the next stop"
          >
            {ERAS.map((item, i) => {
              const d = i - index;
              const past = d < 0;
              const style = {
                "--tx": past ? "-130%" : `${d * 7}%`,
                "--ty": past ? `${-6 + d * 2}%` : `${d * 4}%`,
                "--rot": `${past ? -18 + d * 6 : item.tilt + d * 3}deg`,
                "--sc": past ? 0.9 : 1 - d * 0.07,
                "--z": 10 - Math.abs(d),
                "--op": past ? 0 : 1 - d * 0.12,
              } as CSSProperties;
              return (
                <figure className="pol" key={item.short} style={style} aria-hidden={i !== index}>
                  <img
                    src={item.src}
                    width={item.w}
                    height={item.h}
                    style={{ aspectRatio: `${item.w} / ${item.h}` }}
                    alt={i === index ? `${item.title}, ${item.year}` : ""}
                    draggable={false}
                  />
                  <figcaption>
                    <b>{i === last ? "Today" : item.year}</b> {item.short}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <main>
      <section className="page-hero" data-surface="green" aria-labelledby="about-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">About us</p>
            <h1 id="about-title">Fighting food waste since 1995.</h1>
            <p className="lead">It started with a simple idea: perfectly good food should never go to waste.</p>
          </header>
          <img className="hero-illo" src="/media/illo-about.png" alt="" />
        </div>
      </section>

      <section className="story" data-surface="cream" aria-labelledby="story-title">
        <div className="story-lead rv">
          <span aria-hidden="true">30</span>
          <p>years of bargains, challenges and positive change.</p>
        </div>
        <div className="story-copy rv" style={{ "--rv": "120ms" } as CSSProperties}>
          <p className="eyebrow">Our story</p>
          <h2 id="story-title">
            Ridiculous prices.
            <br />A serious purpose.
          </h2>
          <p>
            Cheaper Buy Miles has been fighting food waste since 1995. We buy close-to-date, past best-before and
            surplus stock from suppliers all over Australia, then sell it for a fraction of the price.
          </p>
          <p>
            Same great brands, same great quality—just a lot cheaper. What began as a small shop selling jam has grown
            into four much-loved stores.
          </p>
        </div>
      </section>

      <Timeline />
    </main>
  );
}
