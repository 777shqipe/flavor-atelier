import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { LogoMark } from "./Logo";
import { Odometer } from "./Odometer";
import { Pack } from "./Pack";
import { ITEMS } from "./products";
import { Stamp } from "./Stamp";
import "./receipt.css";
import "./whyfilm.css";

/**
 * "Why it costs less" as one self-playing film, looping on its own: the
 * numbers (bags, Eureka Tower, a skyline of thirty towers, 70% still good),
 * then the label (a box of corn flakes ages past its best-before and gets
 * marked down while the milk past its use-by comes off sale), then the
 * receipt (that same box is scanned and prints as the first line of a
 * rescued basket). The tape rewinds and it starts again.
 *
 * One clock drives everything: React only flips the current beat, CSS
 * transitions do the moving, and the scrubber and timecode are painted
 * straight from the clock.
 */

const SOURCES = {
  vic: { name: "Sustainability Victoria, 2025", href: "https://www.sustainability.vic.gov.au/love-food-hate-waste" },
  bags: { name: "Foodwise", href: "https://foodwise.com.au/foodwaste/food-waste-fast-facts" },
  fial: { name: "FIAL National Food Waste Feasibility Study, 2021", href: "https://www.fial.com.au/sharing-knowledge/food-waste" },
  edible: {
    name: "End Food Waste Australia, 2024",
    href: "https://www.foodanddrinkbusiness.com.au/news/food-waste-summit-australia-wasting-29m-meals-a-day",
  },
};

const CHAPTERS = [
  { label: "The numbers", eyebrow: "Why it matters", lead: "Good food, binned by the", hl: "tonne.", mark: "line" },
  { label: "The label", eyebrow: "Read the date", lead: "Best before isn’t a", hl: "bin day.", mark: "line" },
  { label: "The receipt", eyebrow: "The bin vs. your basket", lead: "Every receipt is a", hl: "rescue.", mark: "ring" },
] as const;

/** The corn flakes from the shelf scene ring up first, at their last markdown. */
const RRP_FLAKES = 5.5;
const MARKDOWNS = [
  { days: 7, price: 4, rot: -10, top: "6%" },
  { days: 30, price: 3, rot: 7, top: "19%" },
  { days: 60, price: 2, rot: -4, top: "32%" },
];
const BASKET: Array<{ id: string; why: string; kg: number; price?: number; was?: number }> = [
  { id: "cornflakes", why: "Past best before. Still crunchy.", kg: 0.73, price: 2, was: RRP_FLAKES },
  { id: "dumplings", why: "Dented box. Dumplings fine.", kg: 0.75 },
  { id: "cheddar", why: "Wonky cut. Still sharp.", kg: 0.5 },
  { id: "oil", why: "Old label. Same olives.", kg: 0.69 },
];
const LINES = BASKET.flatMap((entry) => {
  const item = ITEMS.find((candidate) => candidate.id === entry.id);
  if (!item) return [];
  const price = entry.price ?? item.price;
  const was = entry.was ?? item.was ?? item.price;
  return [{ id: entry.id, why: entry.why, kg: entry.kg, name: item.name, price, was }];
});
const SAVED = LINES.reduce((sum, line) => sum + line.was - line.price, 0);
const KG = LINES.reduce((sum, line) => sum + line.kg, 0);

const money = (value: number) => value.toFixed(2);
const DAY = 86_400_000;
const PRINTED = new Date();
const dayOf = (days: number) => new Date(PRINTED.getTime() + days * DAY);
const fmt = (date: Date) => date.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }).toUpperCase();
const STAMP_DATE = `${String(PRINTED.getDate()).padStart(2, "0")}/${String(PRINTED.getMonth() + 1).padStart(2, "0")}/${String(PRINTED.getFullYear()).slice(2)}`;

type Copy = { num: string; unit: string; text: string; sub?: string; src?: { name: string; href: string }; note?: string };

/** Every beat of the film: which chapter it belongs to, how long it holds, and what the copy says meanwhile. */
const BEATS: Array<{ id: string; ch: 0 | 1 | 2; ms: number; copy: Copy }> = [
  { id: "bags", ch: 0, ms: 3600, copy: { num: "1/5", unit: "bags of groceries", text: "One bag of groceries in five ends up in the bin, roughly.", src: SOURCES.bags } },
  { id: "tower", ch: 0, ms: 3700, copy: { num: "250,000", unit: "tonnes a year", text: "Good food thrown out by Victorian households every year. Enough to fill Eureka Tower.", src: SOURCES.vic } },
  { id: "sky", ch: 0, ms: 3700, copy: { num: "7.6", unit: "million tonnes", text: "Wasted across Australia every year, farm to fork. About $36.6 billion, or some 30 Eureka Towers.", src: SOURCES.fial } },
  { id: "good", ch: 0, ms: 3600, copy: { num: "70", unit: "% still good", text: "Of all that food, seven tonnes in ten were still good to eat. That is the gap we work in.", src: SOURCES.edible } },
  { id: "d0", ch: 1, ms: 3200, copy: { num: "+00", unit: "days past the date", text: "Corn flakes, best before today. Milk, use by today. Same date, different rules.", note: "Best before is about quality. Use by is about safety." } },
  { id: "d7", ch: 1, ms: 2800, copy: { num: "+07", unit: "days past the date", text: "The milk is past its use-by: off our shelf, always. The corn flakes are still good, now $4.", note: "Best before is about quality. Use by is about safety." } },
  { id: "d30", ch: 1, ms: 2600, copy: { num: "+30", unit: "days past the date", text: "A month on. Still crunchy, still perfectly safe. Now $3.", note: "Best before is about quality. Use by is about safety." } },
  { id: "d60", ch: 1, ms: 3000, copy: { num: "+60", unit: "days past the date", text: "Quality may soften. Safety doesn’t change. So it stays on sale, for $2.", note: "Demo prices are placeholders." } },
  { id: "scan", ch: 2, ms: 1900, copy: { num: "$00.00", unit: "saved on one basket", text: "Beep. The corn flakes from the shelf, $2 instead of $5.50.", sub: "0.0 kg kept out of the bin", note: "A sample basket. Prices and weights are placeholders." } },
  ...LINES.map((line, i) => {
    const upTo = LINES.slice(0, i + 1);
    const saved = upTo.reduce((sum, l) => sum + l.was - l.price, 0);
    const kg = upTo.reduce((sum, l) => sum + l.kg, 0);
    return {
      id: `l${i + 1}`,
      ch: 2 as const,
      ms: 1250,
      copy: {
        num: `$${money(saved).padStart(5, "0")}`,
        unit: "saved on one basket",
        text: `${line.name}. ${line.why}`,
        sub: `${kg.toFixed(1)} kg kept out of the bin`,
        note: "A sample basket. Prices and weights are placeholders.",
      },
    };
  }),
  {
    id: "done",
    ch: 2,
    ms: 4200,
    copy: {
      num: `$${money(SAVED)}`,
      unit: "saved on one basket",
      text: "Good food kept out of the bin, and money kept in your pocket. One less bag tipped over.",
      sub: `${KG.toFixed(1)} kg kept out of the bin`,
      note: "A sample basket. Prices and weights are placeholders.",
    },
  },
  { id: "rewind", ch: 2, ms: 1300, copy: { num: "$00.00", unit: "saved on one basket", text: "Rewinding…", sub: "0.0 kg kept out of the bin" } },
];

const IDX = Object.fromEntries(BEATS.map((beat, i) => [beat.id, i])) as Record<string, number>;
const START = BEATS.map((_, i) => BEATS.slice(0, i).reduce((sum, beat) => sum + beat.ms, 0));
const TOTAL = START[BEATS.length - 1] + BEATS[BEATS.length - 1].ms;
const REWIND = IDX.rewind;
const FIRST = [0, 1, 2].map((ch) => BEATS.findIndex((beat) => beat.ch === ch));
/** The beat each chapter is fully told by (what reduced motion jumps to). */
const LAST = [IDX.good, IDX.d60, IDX.done];
const CH_START = FIRST.map((i) => START[i]);
const CH_END = [CH_START[1], CH_START[2], START[REWIND]];

const beatAt = (t: number) => {
  let i = 0;
  while (i < BEATS.length - 1 && t >= START[i + 1]) i += 1;
  return i;
};
const two = (n: number) => String(Math.floor(n)).padStart(2, "0");
/** mm:ss:ff at 24 frames a second. */
const timecode = (ms: number) => `${two(ms / 60000)}:${two((ms / 1000) % 60)}:${two(((ms % 1000) / 1000) * 24)}`;

/* ---------- the numbers: one SVG world ----------------------------------- */

const TOWER = "M38 396V74l8-26h28l8 26v322Z";
const GOOD_TOP = 396 - 0.7 * 348;
/** A skyline of thirty Eureka Towers: fifteen in front, fifteen further back. The big one lands in front, slot 7. */
const SKYLINE = [
  ...Array.from({ length: 15 }, (_, i) => ({ cx: 20 + 40 * i, base: 460, s: 0.46, back: false, i })),
  ...Array.from({ length: 15 }, (_, i) => ({ cx: 34 + 38 * i, base: 404, s: 0.36, back: true, i })),
];
const BIG_SLOT = 7;
const at = (cx: number, base: number, s: number) => `translate(${cx - 60 * s}px, ${base - 396 * s}px) scale(${s})`;

function TowerBody({ fill, good }: { fill?: boolean; good?: boolean }) {
  return (
    <>
      <path d={TOWER} fill="#0d2a21" stroke="rgb(246 240 219 / 0.55)" strokeWidth="1.6" />
      <path d={TOWER} fill="url(#fw-floors)" />
      <g clipPath="url(#fw-clip)">
        <rect x="38" y="44" width="44" height="58" fill="#e7b04a" opacity="0.9" />
        <path d="M38 60H82M38 76H82M38 92H82" stroke="#b9822a" strokeWidth="1.2" />
        <rect x="72" y="102" width="5" height="200" fill="#e3261b" />
        {fill ? (
          <g className="fw-fill">
            <path
              className="fw-wave"
              transform="translate(0 396)"
              d="M-36 0q9-6 18 0t18 0 18 0 18 0 18 0 18 0 18 0 18 0 18 0 18 0V420H-36z"
              fill="url(#fw-food)"
            />
          </g>
        ) : (
          <rect x="30" y="40" width="60" height="360" fill="url(#fw-food)" />
        )}
        {good && <rect className="fw-good" x="30" y={GOOD_TOP} width="60" height={396 - GOOD_TOP + 4} fill="url(#fw-fresh)" />}
      </g>
      <path d="M60 48V20" stroke="rgb(246 240 219 / 0.6)" strokeWidth="1.5" />
    </>
  );
}

function Bags() {
  return (
    <g className="fw-bags" transform="translate(72 313) scale(1.4)">
      {[0, 64, 128, 192, 262].map((x, i) => (
        <g key={i} className={`fw-bag${i === 4 ? " tips" : ""}`} style={{ "--i": i } as CSSProperties}>
          <g transform={`translate(${x} 0)`}>
            <rect x="16" y="6" width="9" height="34" rx="4.5" fill="#e0a458" stroke="#141414" strokeWidth="2" transform="rotate(-14 20 20)" />
            <path d="M30 26C26 12 36 6 38 16C42 6 50 12 44 26Z" fill="#5fae5a" stroke="#141414" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="46" cy="24" r="7" fill="#e3261b" stroke="#141414" strokeWidth="2" />
            <path d="M8 30H56L52 104H12Z" fill="#d8b37a" stroke="#141414" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M8 30L12 38H52L56 30" fill="#c79c5f" stroke="#141414" strokeWidth="2" strokeLinejoin="round" />
            <rect x="20" y="56" width="24" height="16" rx="3" fill="#fffaf0" stroke="#141414" strokeWidth="1.6" />
            <path d="M24 64h16" stroke="#005842" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>
      ))}
      <g className="fw-bin-tag" transform="translate(296 -34)">
        <rect x="-34" y="-15" width="68" height="24" rx="5" fill="#e3261b" />
        <text x="0" y="2" textAnchor="middle">BINNED</text>
      </g>
    </g>
  );
}

function World({ on, step }: { on: boolean; step: number }) {
  const flag = (id: string) => (step >= IDX[id] ? true : undefined);
  return (
    <>
    <svg
      className="fw"
      viewBox="0 0 600 500"
      data-on={on || undefined}
      data-tip={flag("bags")}
      data-tower={flag("tower")}
      data-sky={flag("sky")}
      data-good={flag("good")}
    >
      <defs>
        <clipPath id="fw-clip">
          <path d={TOWER} />
        </clipPath>
        <pattern id="fw-floors" width="44" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 8.5H44" stroke="rgb(246 240 219 / 0.12)" strokeWidth="1" />
        </pattern>
        <pattern id="fw-food" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#d9442b" />
          <circle cx="5" cy="6" r="3.2" fill="#f6b531" />
          <circle cx="16" cy="14" r="3.6" fill="#9f2416" />
          <circle cx="8" cy="18" r="2.2" fill="#5fae5a" />
          <rect x="13" y="2" width="6" height="3" rx="1.5" fill="#f3d9a4" />
        </pattern>
        <pattern id="fw-fresh" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#6fd3b0" />
          <circle cx="5" cy="6" r="3.2" fill="#f6b531" />
          <circle cx="16" cy="14" r="3.6" fill="#2f9a6b" />
          <circle cx="8" cy="18" r="2.2" fill="#fffaf0" />
          <rect x="13" y="2" width="6" height="3" rx="1.5" fill="#fffaf0" />
        </pattern>
      </defs>

      <path className="fw-ground" d="M0 460.5H600" />
      <Bags />

      {/* the skyline: everyone but the big tower, rising out from the middle */}
      {SKYLINE.filter((slot) => slot.back || slot.i !== BIG_SLOT).map((slot) => (
        <g
          key={`${slot.back ? "b" : "f"}${slot.i}`}
          className={`fw-mini${slot.back ? " back" : ""}`}
          style={{ transform: at(slot.cx, slot.base, slot.s), "--d": Math.abs(slot.i - BIG_SLOT) } as CSSProperties}
        >
          <g className="fw-rise">
            <TowerBody good />
          </g>
        </g>
      ))}

      {/* Eureka Tower itself: rises, fills, then shrinks into the skyline */}
      <g className="fw-tower" style={{ "--to": at(300, 460, 0.46) } as CSSProperties}>
        <g className="fw-rise">
          <TowerBody fill good />
          <g className="fw-scale">
            <path d="M118 396V48" />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d={`M114 ${396 - i * 49.7}h8`} />
            ))}
            <text x="126" y="52">297 m</text>
          </g>
          <g className="fw-full" transform="translate(-6 128) rotate(-12)">
            <rect x="-4" y="-26" width="74" height="34" rx="6" />
            <text x="33" y="0" textAnchor="middle">FULL.</text>
          </g>
        </g>
      </g>

      <g className="fw-times">
        <text className="fw-x" x="300" y="150" textAnchor="middle">×30</text>
        <text className="fw-xsub" x="300" y="182" textAnchor="middle">Eureka Towers of food, every year</text>
      </g>
    </svg>
    <p className="fw-key" data-on={(on && flag("good")) || undefined}>
      <span>
        <i data-kind="good" />
        Still good to eat · 70%
      </span>
      <span>
        <i />
        The rest · 30%
      </span>
    </p>
    </>
  );
}

/* ---------- the film ------------------------------------------------------- */

export function WhyFilm() {
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  // -1 is the standby frame before the film first comes into view.
  const [beat, setBeat] = useState(() => (reduce ? LAST[0] : -1));
  const [playing, setPlaying] = useState(!reduce);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [hold, setHold] = useState(false);
  const [feed, setFeed] = useState<number[]>([]);

  const screen = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  const tc = useRef<HTMLSpanElement>(null);
  const clock = useRef(reduce ? START[LAST[0]] : 0);
  const shown = useRef(beat);

  const running = playing && inView && !hidden && !hold;

  /** Scrubber fill and timecode come straight from the clock, no re-render. */
  const paint = useCallback(() => {
    const t = clock.current;
    const b = beatAt(t);
    if (b === REWIND) {
      const back = START[REWIND] * (1 - (t - START[REWIND]) / BEATS[REWIND].ms);
      lens.current?.style.setProperty("--p", "0");
      if (tc.current) tc.current.textContent = timecode(Math.max(0, back));
      return;
    }
    const ch = BEATS[b].ch;
    const p = (t - CH_START[ch]) / (CH_END[ch] - CH_START[ch]);
    lens.current?.style.setProperty("--p", Math.min(1, p).toFixed(4));
    if (tc.current) tc.current.textContent = timecode(t);
  }, []);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      clock.current = (clock.current + Math.min(64, now - last)) % TOTAL;
      last = now;
      const b = beatAt(clock.current);
      if (b !== shown.current) {
        shown.current = b;
        setBeat(b);
      }
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, paint]);

  useEffect(() => {
    paint();
    const el = screen.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paint]);

  // The stage is drawn on a fixed 600×500 canvas and scaled to whatever room it gets.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => el.style.setProperty("--k", Math.min(el.clientWidth / 600, el.clientHeight / 500).toFixed(4));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Where the receipt has to be fed to for each printed line (fonts can change it).
  useLayoutEffect(() => {
    const el = paper.current;
    if (!el) return;
    const measure = () => {
      const rows = Array.from(el.querySelectorAll<HTMLElement>(".r-item"));
      if (!rows.length) return;
      setFeed([rows[0].offsetTop - 4, ...rows.map((row) => row.offsetTop + row.offsetHeight), el.offsetHeight]);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const seek = (ch: number) => {
    const b = reduce ? LAST[ch] : FIRST[ch];
    clock.current = START[b];
    shown.current = b;
    setBeat(b);
    if (!reduce) setPlaying(true);
    paint();
  };

  const standby = beat < 0;
  const current = BEATS[Math.max(0, beat)];
  const rewind = beat === REWIND;
  const ch = current.ch;
  // Scene states hold their last frame while the next chapter fades in, and reset during the rewind.
  const step = rewind ? -1 : beat;
  const reached = (id: string) => step >= IDX[id];
  const copy = standby ? { ...current.copy, num: current.copy.num.replace(/\d/g, "0") } : current.copy;
  const head = CHAPTERS[ch];

  // The label scene.
  const days = reached("d60") ? 60 : reached("d30") ? 30 : reached("d7") ? 7 : 0;
  const price = MARKDOWNS.reduce((now, mark) => (days >= mark.days ? mark.price : now), RRP_FLAKES);
  const box = rewind || step < IDX.d0 ? "off" : step <= IDX.d60 ? "shelf" : step === IDX.scan ? "scan" : "slot";

  // The receipt scene.
  const printed = reached("done") ? LINES.length : LINES.findLastIndex((_, i) => reached(`l${i + 1}`)) + 1;
  const feedTo = reached("done") ? feed.length - 1 : reached("scan") ? printed : -1;
  const full = feed[feed.length - 1] ?? 600;
  const shift = feedTo < 0 ? full + 12 : full - (feed[feedTo] ?? 0);
  const phase = reached("done") ? "done" : reached("scan") ? "printing" : "idle";
  const latest = printed ? LINES[printed - 1] : null;
  const lcd: [string, string] = rewind
    ? ["REWINDING", "PLEASE WAIT"]
    : phase === "done"
      ? ["THANK YOU", `SAVED $${money(SAVED)}`]
      : latest
        ? [latest.name, `${money(latest.price)}  WAS ${money(latest.was)}`]
        : phase === "printing"
          ? ["SCANNING", "CORN FLAKES"]
          : ["READY", "SCAN A BASKET"];

  const state = rewind ? "rewind" : running ? "rec" : "paused";
  const lensCh = rewind ? 0 : ch;
  const words = head.lead.split(" ");

  return (
    <section className="film" id="why" data-surface="cream" aria-labelledby="why-title">
      <div
        className="film-screen"
        ref={screen}
        data-surface="deep"
        data-beat={standby ? "standby" : current.id}
        data-ch={ch}
        data-state={state}
      >
        <span className="film-frame" aria-hidden="true" />

        <header className="film-hud">
          <span className="film-rec">{state === "rewind" ? "◀◀ Rewind" : state === "rec" ? "Rec" : "Paused"}</span>
          <h2 id="why-title" className="film-title">
            Why it costs less
          </h2>
          <span className="film-tc" aria-hidden="true">
            <span ref={tc}>00:00:00</span>
            <small> / {timecode(START[REWIND])}</small>
          </span>
        </header>

        <div
          className="film-copy"
          onFocus={() => setHold(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHold(false);
          }}
        >
          <p className="fc-eyebrow" key={`e${ch}`}>
            <b>0{ch + 1}</b> {head.label} <span>· {head.eyebrow}</span>
          </p>
          <h3 className="fc-head" key={`h${ch}`}>
            {words.map((word, i) => (
              <span className="fc-w" key={i} style={{ "--w": i } as CSSProperties}>
                {word}{" "}
              </span>
            ))}
            <span
              className="fc-w fc-hl"
              data-mark={head.mark}
              data-on={(head.mark === "ring" ? reached("done") : true) || undefined}
              style={{ "--w": words.length } as CSSProperties}
            >
              {head.hl}
              <svg viewBox={head.mark === "ring" ? "0 0 300 120" : "0 0 200 20"} preserveAspectRatio="none" aria-hidden="true">
                <path
                  pathLength="1"
                  d={
                    head.mark === "ring"
                      ? "M262 22C214 4 98 2 42 24 4 40 2 84 46 100c58 20 170 18 222-4 34-15 30-52-6-70-30-15-96-20-150-14"
                      : "M3 13C48 6 120 3 197 9"
                  }
                />
              </svg>
            </span>
          </h3>
          <div className="fc-num">
            <Odometer value={copy.num} />
            <small>{copy.unit}</small>
          </div>
          {/* always there, so the copy doesn't jump when the receipt adds its kilos line */}
          <p className="fc-sub" aria-hidden="true">
            {copy.sub ?? "\u00a0"}
          </p>
          <p className="fc-text" key={`t${current.id}`}>
            {copy.text}
          </p>
          {copy.src ? (
            <a
              className="fc-cite"
              href={copy.src.href}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={() => setHold(true)}
              onPointerLeave={() => setHold(false)}
            >
              Source: {copy.src.name}
            </a>
          ) : (
            copy.note && <p className="fc-cite">{copy.note}</p>
          )}
        </div>

        <div className="film-stage" ref={stage} aria-hidden="true">
          <div className="fs-canvas">
            <World on={ch === 0 && !rewind} step={standby ? -1 : step} />

            {/* the label: a shelf, a calendar, two packs with the same date */}
            <div className="fsh" data-on={(ch === 1) || undefined} data-gone={reached("d7") || undefined}>
              <div className="fsh-cal">
                <span className="fsh-cal-rings" />
                <span className="fsh-cal-month">{fmt(dayOf(days)).split(" ")[1]}</span>
                <span className="fsh-cal-page" key={days}>
                  <b>{fmt(dayOf(days)).split(" ")[0]}</b>
                  <small>{days ? `+${days} days` : "Today"}</small>
                </span>
              </div>
              <span className="fsh-tag" data-kind="bb">
                Best before <i>=</i> quality
              </span>
              <span className="fsh-tag" data-kind="ub">
                Use by <i>=</i> safety
              </span>
              <div className="fsh-milk">
                <Pack shape="carton" color="#6bb8ff" label={["FRESH", "MILK"]} />
                <span className="fsh-date">USE BY {fmt(PRINTED)}</span>
                <Stamp on={reached("d7")} text="Not for sale" sub="Use by means use by" className="fsh-stamp" />
              </div>
              <span className="fsh-plank" />
              <span className="fsh-ticket" data-kind="bb" data-cut={price < RRP_FLAKES || undefined}>
                <small>Corn flakes 725g</small>
                <Odometer value={`$${money(price)}`} />
                <s>{price < RRP_FLAKES ? `$${money(RRP_FLAKES)}` : ""}</s>
              </span>
              <span className="fsh-ticket" data-kind="ub">
                <small>Fresh milk 1L</small>
                <b>{reached("d7") ? "Removed" : "$2.00"}</b>
              </span>
            </div>

            {/* the box of corn flakes, the one actor who crosses from the shelf to the till */}
            <div className="fbox" data-at={box}>
              <Pack shape="box" color="#f3b62f" label={["CORN", "FLAKES"]} />
              <span className="fbox-date">BB {fmt(PRINTED)}</span>
              {MARKDOWNS.map((mark) => (
                <span
                  key={mark.days}
                  className="fbox-mark"
                  data-on={days >= mark.days || undefined}
                  data-last={mark.price === 2 || undefined}
                  style={{ "--rot": `${mark.rot}deg`, top: mark.top } as CSSProperties}
                >
                  <small>Reduced</small>${mark.price}
                </span>
              ))}
              <Stamp on={reached("d30")} text="Still good" sub="Best before ≠ bad after" tone="green" className="fbox-stamp" />
              <span className="fbox-laser" />
              <span className="fbox-beep">Beep</span>
            </div>

            {/* the receipt: the till prints the basket, line by line */}
            <div className="fst rcpt" data-on={ch === 2 || undefined} data-phase={phase}>
              <div className="rcpt-window">
                <div className="rcpt-tear">
                  <div className="paper" ref={paper} style={{ translate: `0 ${Math.max(0, shift)}px` }}>
                    <header className="r-head">
                      <LogoMark className="r-logo" />
                      <strong>Cheaper Buy Miles</strong>
                      <span>Tax invoice · {STAMP_DATE}</span>
                    </header>
                    <hr />
                    {LINES.map((line, i) => (
                      <div className={i < printed ? "r-item on" : "r-item"} key={line.id}>
                        <p className="r-row">
                          <span>{line.name}</span>
                          <span>{money(line.price)}</span>
                        </p>
                        <p className="r-row r-why">
                          <span>↳ {line.why}</span>
                          <s>{money(line.was)}</s>
                        </p>
                      </div>
                    ))}
                    <hr />
                    <p className="r-row r-total">
                      <span>You saved</span>
                      <span>${money(SAVED)}</span>
                    </p>
                    <p className="r-row">
                      <span>Kept out of landfill</span>
                      <span>{KG.toFixed(1)} kg</span>
                    </p>
                    <p className="r-thanks">Thanks for rescuing.</p>
                    <Stamp on={reached("done")} text="Rescued" sub={`${KG.toFixed(1)} kg · not wasted`} className="r-stamp" />
                  </div>
                </div>
              </div>
              <div className="register">
                <div className="reg-top">
                  <span className="reg-mouth" />
                </div>
                <span className="reg-heat" />
                <span className="reg-cutter">
                  <i className="reg-blade" />
                </span>
                <div className="reg-face">
                  <span className="reg-roll" style={{ "--turn": `${printed * 160}deg`, "--left": 1 - printed * 0.04 } as CSSProperties}>
                    <i />
                  </span>
                  <span className="reg-lcd">
                    <span key={`a-${lcd[0]}`}>{lcd[0]}</span>
                    <span key={`b-${lcd[1]}`}>{lcd[1]}</span>
                  </span>
                  <span className="reg-pad">
                    {Array.from({ length: 9 }, (_, i) => (
                      <i key={i === printed % 9 && printed ? `p${printed}` : i} data-on={(i === printed % 9 && printed > 0) || undefined} />
                    ))}
                  </span>
                </div>
                <div className="reg-foot">
                  <LogoMark className="reg-logo" />
                  <span>CBM · till 02 · thermal</span>
                  <i className="reg-led" />
                </div>
              </div>
              {latest && phase === "printing" && (
                <span className="r-pop" key={latest.id}>
                  <small>Saved</small>${money(latest.was - latest.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="film-ctrl">
          <button
            className="film-play"
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the film" : "Play the film"}
            aria-pressed={!playing}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
            </svg>
          </button>
          <nav className="film-bar" aria-label="Chapters" style={{ "--i": lensCh } as CSSProperties}>
            <span className="film-lens" ref={lens} aria-hidden="true" />
            {CHAPTERS.map((chapter, i) => (
              <button key={chapter.label} type="button" aria-current={i === lensCh ? "step" : undefined} onClick={() => seek(i)}>
                <small>0{i + 1}</small>
                {chapter.label}
              </button>
            ))}
          </nav>
        </div>

        {!standby && !reduce && !rewind && (
          <div className="film-card" key={`c${ch}`} aria-hidden="true">
            <span>0{ch + 1}</span>
            <b>{CHAPTERS[ch].label}</b>
            <small>Chapter 0{ch + 1} / 03</small>
          </div>
        )}
        <span className="film-vhs" data-on={rewind || undefined} aria-hidden="true" />
      </div>
    </section>
  );
}
