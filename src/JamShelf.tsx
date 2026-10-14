import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Odometer } from "./Odometer";

/**
 * Our story, preserved: thirty years as four jars on a pantry shelf. The first
 * shop sold jam, so each era is a batch. Tap a jar and it comes off the shelf,
 * the cloth lid pops, and its label unrolls into the story below, with what was
 * happening to food waste in Australia at the same time.
 */

const NOW = String(new Date().getFullYear());

type Era = {
  year: string;
  short: string;
  title: string;
  text: string;
  chips: string[];
  src: string;
  /** what is in the jar, and its colours */
  jam: string;
  /** short name for the jar label */
  tag: string;
  fill: string;
  dark: string;
  cloth: string;
  meanwhile: string;
};

const ERAS: Era[] = [
  {
    year: "1995",
    short: "The first shop",
    title: "The first shop",
    text: "A small shop, a few shelves and a lot of jam. One clear idea from day one: perfectly good food should never be wasted.",
    chips: ["One small shop", "One clear idea"],
    src: "/media/about-1995.jpg",
    jam: "Tomato jam",
    tag: "Tomato jam",
    fill: "#d9442b",
    dark: "#9f2416",
    cloth: "#e3261b",
    meanwhile: "Australia’s first food bank had opened in Sydney only three years earlier. Rescuing surplus food was still a fringe idea.",
  },
  {
    year: "2005",
    short: "A growing community",
    title: "A growing community",
    text: "More people discover the thrill of an unexpected bargain, and the business grows into new neighbourhoods.",
    chips: ["New neighbourhoods", "More bargain hunters"],
    src: "/media/about-basket.jpg",
    jam: "Apricot",
    tag: "Apricot",
    fill: "#f2a43a",
    dark: "#c7741a",
    cloth: "#f6b531",
    meanwhile: "OzHarvest (2004) and SecondBite (2005) start collecting surplus food for people who need it.",
  },
  {
    year: "2015",
    short: "More stores, less waste",
    title: "More stores, less waste",
    text: "The network spreads across Melbourne, giving suppliers a better place for surplus stock than the skip.",
    chips: ["Across Melbourne", "Surplus finds a home"],
    src: "/media/about-aisle.jpg",
    jam: "Bread & butter pickles",
    tag: "Pickles",
    fill: "#a3b95a",
    dark: "#6c8a2c",
    cloth: "#3f9b4b",
    meanwhile: "Supermarkets start selling “ugly” fruit and veg (2014), and Australia commits to halving food waste by 2030 (2017).",
  },
  {
    year: NOW,
    short: "Today",
    title: "Still fighting food waste",
    text: "Four stores, millions of products rescued, and the same purpose that started it all: one bargain at a time.",
    chips: ["Four stores", "Millions of products rescued"],
    src: "/media/about-shelf.jpg",
    jam: "Green tomato relish",
    tag: "Relish",
    fill: "#4f8a3c",
    dark: "#2d5c22",
    cloth: "#005842",
    meanwhile: "Australia still wastes around 7.6 million tonnes of food a year. Plenty left to rescue.",
  },
];

const BODY = "M32 46h56v5c13 5 16 14 16 26v61c0 14-9 22-22 22H38c-13 0-22-8-22-22V77c0-12 3-21 16-26z";
const CLOTH =
  "M20 42c-3-12 11-25 40-25s43 13 40 25c-5 5-9 1-13 6-4-4-8-2-12 1-4-3-9-3-13 0-4-3-9-3-13 0-4-3-8-5-12-1-4-5-8-1-17-6z";

function Jar({ era, index }: { era: Era; index: number }) {
  const clip = `jar-clip-${index}`;
  const cloth = `jar-cloth-${index}`;
  return (
    <svg viewBox="0 0 120 172" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clip}>
          <path d={BODY} />
        </clipPath>
        <pattern id={cloth} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
          <rect width="10" height="10" fill="#fffaf0" />
          <rect width="5" height="10" fill={era.cloth} opacity="0.5" />
          <rect width="10" height="5" fill={era.cloth} opacity="0.5" />
        </pattern>
      </defs>
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d={BODY} fill="#fff" stroke="#fff" strokeWidth="9" />
        <path d={BODY} fill="rgb(232 240 236 / 0.85)" />
        <g clipPath={`url(#${clip})`}>
          <g className="jar-fill">
            <path className="jar-wave" d="M-30 72q7.5-5 15 0t15 0 15 0 15 0 15 0 15 0 15 0 15 0 15 0 15 0 15 0V172H-30z" fill={era.fill} />
            <g fill={era.dark} opacity="0.55">
              <circle cx="38" cy="96" r="4" />
              <circle cx="74" cy="88" r="3" />
              <circle cx="58" cy="120" r="5" />
              <circle cx="86" cy="130" r="3.5" />
              <circle cx="30" cy="140" r="3" />
              <circle cx="70" cy="150" r="4" />
            </g>
            <circle className="jar-bubble" cx="44" cy="150" r="2.4" fill="#fff" opacity="0.5" />
            <circle className="jar-bubble" cx="68" cy="150" r="1.8" fill="#fff" opacity="0.5" />
            <circle className="jar-bubble" cx="84" cy="150" r="2.8" fill="#fff" opacity="0.5" />
          </g>
        </g>
        <path d={BODY} fill="none" stroke="#141414" strokeWidth="2.4" />
        <path d="M26 84v48" stroke="#fff" strokeWidth="5" opacity="0.65" />
        <rect x="27" y="39" width="66" height="11" rx="4" fill="#d9e2dd" stroke="#141414" strokeWidth="2.4" />
        <g className="jar-label">
          <rect x="29" y="93" width="62" height="46" rx="4" fill="#fffaf0" stroke="#141414" strokeWidth="2" />
          <text x="60" y="104.5" textAnchor="middle" fill="#141414" fontFamily="Space Mono, monospace" fontSize="6.2" letterSpacing="1">
            BATCH 0{index + 1}
          </text>
          <text x="60" y="124" textAnchor="middle" fill="#00382a" fontFamily="Libre Caslon Display, serif" fontSize={era.year === NOW ? 17 : 20}>
            {era.year === NOW ? "Today" : era.year}
          </text>
          <text x="60" y="133.5" textAnchor="middle" fill={era.dark} fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="5.4" letterSpacing="0.6">
            {era.tag.toUpperCase()}
          </text>
        </g>
      </g>
      <g className="jar-lid" strokeLinejoin="round" strokeLinecap="round">
        <path d={CLOTH} fill="#fff" stroke="#fff" strokeWidth="8" />
        <path d={CLOTH} fill={`url(#${cloth})`} stroke="#141414" strokeWidth="2.4" />
        <path d="M24 40q36 9 72 0" fill="none" stroke="#141414" strokeWidth="2.2" />
        <path d="M60 43q-9 5-5 13M60 43q9 5 5 13" fill="none" stroke="#141414" strokeWidth="2" />
      </g>
    </svg>
  );
}

export function JamShelf() {
  const [index, setIndex] = useState(0);
  const shelf = useRef<HTMLDivElement>(null);
  const era = ERAS[index];
  const last = ERAS.length - 1;

  const onKey = (event: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = Math.min(last, Math.max(0, keys[event.key]));
    setIndex(next);
    shelf.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  return (
    <section
      className="jams"
      data-surface="cream"
      aria-labelledby="jams-title"
      style={{ "--jam": era.fill, "--jam-dark": era.dark } as CSSProperties}
    >
      <header className="section-head split jams-head rv">
        <div>
          <p className="eyebrow">Thirty years, four batches</p>
          <h2 id="jams-title">Our story, preserved.</h2>
        </div>
        <p className="lead">
          The first shop sold jam, so we keep our history in jars. Tap one to open it.
        </p>
      </header>

      <div className="shelf rv" ref={shelf} role="tablist" aria-label="Company history" onKeyDown={onKey}>
        {ERAS.map((item, i) => (
          <button
            key={item.year}
            className="jar"
            type="button"
            role="tab"
            id={`jar-tab-${i}`}
            aria-selected={i === index}
            aria-controls="jar-panel"
            tabIndex={i === index ? 0 : -1}
            style={{ "--i": i } as CSSProperties}
            onClick={() => setIndex(i)}
          >
            <span className="jar-art">
              <Jar era={item} index={i} />
            </span>
            <span className="jar-ticket">
              <b>{i === last ? "Today" : item.year}</b>
              <small>{item.short}</small>
            </span>
          </button>
        ))}
        <span className="shelf-plank" aria-hidden="true" />
      </div>

      <div className="jar-panel" id="jar-panel" role="tabpanel" aria-labelledby={`jar-tab-${index}`}>
        {/* jam dripping over the top edge of the label */}
        <svg className="jp-drip" key={`drip-${index}`} viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0H1000V14C980 14 976 34 966 34S952 14 930 14 880 46 866 46 852 14 820 14 760 22 748 22 736 14 700 14 650 52 636 52 622 14 590 14 520 26 508 26 496 14 460 14 420 40 406 40 392 14 360 14 300 20 288 20 276 14 240 14 190 44 176 44 162 14 130 14 80 28 68 28 56 14 0 14Z" />
        </svg>
        <figure className="jp-photo" key={`photo-${index}`}>
          <span className="jp-photo-in"><img src={era.src} alt={`${era.title}, ${era.year}`} draggable={false} /></span>
          <figcaption>
            <b>{index === last ? "Today" : era.year}</b> {era.short}
          </figcaption>
        </figure>
        <div className="jp-body">
          <p className="jp-batch">
            Batch 0{index + 1} · {era.jam}
          </p>
          <Odometer value={era.year} className="jp-year" />
          <div className="jp-text" key={`text-${index}`} aria-live="polite">
            <h3>{era.title}</h3>
            <p>{era.text}</p>
            <ul className="jp-chips">
              {era.chips.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>
            <aside className="jp-meanwhile">
              <b>Meanwhile in Australia</b>
              <p>{era.meanwhile}</p>
            </aside>
          </div>
          <div className="jp-nav">
            <button type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} aria-label="Previous batch">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <span>
              0{index + 1} / 0{ERAS.length}
            </span>
            <button type="button" onClick={() => setIndex(index === last ? 0 : index + 1)} aria-label={index === last ? "Back to the first batch" : "Next batch"}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={index === last ? "M3 12a9 9 0 1 0 3-6.7M3 4v5h5" : "M4 12h15M13 6l6 6-6 6"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
