import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { LogoMark } from "./Logo";
import { Odometer } from "./Odometer";
import { CerealBox, MilkCarton } from "./FilmPacks";
import { ITEMS } from "./products";
import { Stamp } from "./Stamp";
import { useLang, useT, type Lang } from "./i18n";
import { whyFilmStrings } from "./i18n/strings/WhyFilm";
import "./receipt.css";
import "./whyfilm.css";

/**
 * "Why it costs less" as one self-playing film, looping on its own: the
 * numbers (bags, Eureka Tower, a skyline of thirty towers, 70% still good),
 * then the label (corn flakes and milk share a date; the milk past its use-by
 * comes off the shelf, the flakes past best-before just get cheaper), then the receipt (that same box is scanned and prints as the
 * first line of a rescued basket). The tape rewinds and it starts again.
 *
 * One idea per frame: a chapter title, one number, one short line, and one
 * thing moving on the stage. One clock drives everything: React only flips
 * the current beat, CSS transitions do the moving, and the scrubber is
 * painted straight from the clock.
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

/** The highlight mark each chapter gets; the chapter copy itself lives in the strings file. */
const CHAPTERS = [{ mark: "line" }, { mark: "line" }, { mark: "ring" }] as const;

/** The corn flakes from the shelf scene ring up first, at their last markdown. */
const RRP_FLAKES = 5.5;
const MARKDOWNS = [
  { days: 7, price: 4 },
  { days: 30, price: 3 },
  { days: 60, price: 2 },
];
const BASKET: Array<{ id: string; kg: number; price?: number; was?: number }> = [
  { id: "cornflakes", kg: 0.73, price: 2, was: RRP_FLAKES },
  { id: "dumplings", kg: 0.75 },
  { id: "cheddar", kg: 0.5 },
  { id: "oil", kg: 0.69 },
];
const LINES = BASKET.flatMap((entry) => {
  const item = ITEMS.find((candidate) => candidate.id === entry.id);
  if (!item) return [];
  const price = entry.price ?? item.price;
  const was = entry.was ?? item.was ?? item.price;
  return [{ id: entry.id, kg: entry.kg, name: item.name, price, was }];
});
const SAVED = LINES.reduce((sum, line) => sum + line.was - line.price, 0);
const KG = LINES.reduce((sum, line) => sum + line.kg, 0);

const money = (value: number) => value.toFixed(2);
const PRINTED = new Date();
/** Printed on the pack, so it keeps the pack's Australian format in every language (product art). */
const BB_DATE = PRINTED.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }).toUpperCase();

type Fine = { text: string; href?: string };
type Copy = { num: string; unit: string; line: string; fine?: Fine };

type Source = (typeof SOURCES)[keyof typeof SOURCES];
type WhyText = typeof whyFilmStrings.en;

/** Every beat of the film: which chapter it belongs to, how long it holds, where its fine print points, and which item it is. */
const BEATS: Array<{ id: string; ch: 0 | 1 | 2; ms: number; fine: Source | "safety" | "sample" | null; item?: number }> = [
  { id: "bags", ch: 0, ms: 3600, fine: SOURCES.bags },
  { id: "tower", ch: 0, ms: 3800, fine: SOURCES.vic },
  { id: "sky", ch: 0, ms: 3600, fine: SOURCES.fial },
  { id: "good", ch: 0, ms: 3400, fine: SOURCES.edible },
  { id: "d0", ch: 1, ms: 3000, fine: "safety" },
  { id: "d7", ch: 1, ms: 3000, fine: "safety" },
  { id: "d30", ch: 1, ms: 2400, fine: "safety" },
  { id: "d60", ch: 1, ms: 2800, fine: "safety" },
  { id: "scan", ch: 2, ms: 1800, fine: "sample" },
  ...LINES.map((_, i) => ({ id: `l${i + 1}`, ch: 2 as const, ms: 1100, fine: "sample" as const, item: i })),
  { id: "done", ch: 2, ms: 4000, fine: "sample" },
  { id: "rewind", ch: 2, ms: 1300, fine: null },
];
type Beat = (typeof BEATS)[number];

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

/** The copy under the numbers for one beat, in the language on screen. */
function copyOf(s: WhyText, beat: Beat, locale: string): Copy {
  const fine: Fine | undefined =
    beat.fine === null
      ? undefined
      : typeof beat.fine === "object"
        ? { text: s.source(beat.fine.name), href: beat.fine.href }
        : { text: s[beat.fine] };
  if (beat.item !== undefined) {
    const total = LINES.slice(0, beat.item + 1).reduce((sum, line) => sum + line.was - line.price, 0);
    return { num: `$${money(total).padStart(5, "0")}`, unit: s.saved, line: s.item(LINES[beat.item].name), fine };
  }
  if (beat.id === "done") {
    const kg = KG.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return { num: `$${money(SAVED)}`, unit: s.saved, line: s.done(kg), fine };
  }
  return { ...s.beats[beat.id as keyof WhyText["beats"]], fine };
}

/**
 * The pieces a line rises in, one after another. Latin and Vietnamese split on spaces; Chinese and Japanese
 * have none, so they split into words, or rise as one piece where Intl.Segmenter is missing.
 */
const UNSPACED: Lang[] = ["zh", "ja"];

function riseParts(text: string, lang: Lang, locale: string): string[] {
  if (!UNSPACED.includes(lang)) return text.split(" ");
  if (typeof Intl.Segmenter !== "function") return [text];
  return Array.from(new Intl.Segmenter(locale, { granularity: "word" }).segment(text), (part) => part.segment);
}

/* ---------- the numbers: one SVG world ----------------------------------- */

const TOWER = "M38 396V74l8-26h28l8 26v322Z";
const GOOD_TOP = 396 - 0.7 * 348;
/** A skyline of thirty Eureka Towers: fifteen in front, fifteen further back. The big one lands in front, slot 7. */
const SKYLINE = [
  ...Array.from({ length: 15 }, (_, i) => ({ cx: 25.33 + 50.67 * i, base: 480, s: 0.52, back: false, i })),
  ...Array.from({ length: 15 }, (_, i) => ({ cx: 44 + 48 * i, base: 420, s: 0.4, back: true, i })),
];
const BIG_SLOT = 7;
const at = (cx: number, base: number, s: number) => `translate(${cx - 60 * s}px, ${base - 396 * s}px) scale(${s})`;

function TowerBody({ fill }: { fill?: boolean }) {
  return (
    <>
      <path d={TOWER} fill="#0d2a21" stroke="rgb(246 240 219 / 0.5)" strokeWidth="1.6" />
      <g clipPath="url(#fw-clip)">
        <rect x="38" y="44" width="44" height="58" fill="#e7b04a" opacity="0.9" />
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
        <rect className="fw-good" x="30" y={GOOD_TOP} width="60" height={396 - GOOD_TOP + 4} fill="url(#fw-fresh)" />
      </g>
      <path d="M60 48V20" stroke="rgb(246 240 219 / 0.5)" strokeWidth="1.5" />
    </>
  );
}

function Bags() {
  return (
    <g className="fw-bags" transform="translate(131 338) scale(1.35)">
      {[0, 76, 152, 228, 304].map((x, i) => (
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
    </g>
  );
}

function World({ on, step }: { on: boolean; step: number }) {
  const flag = (id: string) => (step >= IDX[id] ? true : undefined);
  return (
    <svg
      className="fw"
      viewBox="0 0 760 520"
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
        <pattern id="fw-food" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#d9442b" />
          <circle cx="5" cy="6" r="3.2" fill="#f6b531" />
          <circle cx="16" cy="14" r="3.6" fill="#9f2416" />
          <circle cx="8" cy="18" r="2.2" fill="#5fae5a" />
        </pattern>
        <pattern id="fw-fresh" width="22" height="22" patternUnits="userSpaceOnUse">
          <rect width="22" height="22" fill="#6fd3b0" />
          <circle cx="5" cy="6" r="3.2" fill="#f6b531" />
          <circle cx="16" cy="14" r="3.6" fill="#2f9a6b" />
          <circle cx="8" cy="18" r="2.2" fill="#fffaf0" />
        </pattern>
      </defs>

      <path className="fw-ground" d="M0 480.5H760" />
      <Bags />

      {/* the skyline: everyone but the big tower, rising out from the middle */}
      {SKYLINE.filter((slot) => slot.back || slot.i !== BIG_SLOT).map((slot) => (
        <g
          key={`${slot.back ? "b" : "f"}${slot.i}`}
          className={`fw-mini${slot.back ? " back" : ""}`}
          style={{ transform: at(slot.cx, slot.base, slot.s), "--d": Math.abs(slot.i - BIG_SLOT) } as CSSProperties}
        >
          <g className="fw-rise">
            <TowerBody />
          </g>
        </g>
      ))}

      {/* Eureka Tower itself: rises, fills, then shrinks into the skyline */}
      <g className="fw-tower" style={{ "--to": at(380, 480, 0.52) } as CSSProperties}>
        <g className="fw-rise">
          <TowerBody fill />
        </g>
      </g>

      <text className="fw-x" x="380" y="214" textAnchor="middle">
        ×30
      </text>
    </svg>
  );
}

/* ---------- the film ------------------------------------------------------- */

export function WhyFilm() {
  const s = useT(whyFilmStrings);
  const { lang, locale } = useLang();
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  // -1 is the standby frame before the film first comes into view.
  const [beat, setBeat] = useState(() => (reduce ? LAST[0] : -1));
  const [playing, setPlaying] = useState(!reduce);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [hold, setHold] = useState(false);
  const [feed, setFeed] = useState<number[]>([]);

  const root = useRef<HTMLElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const segs = useRef<Array<HTMLButtonElement | null>>([]);
  const clock = useRef(reduce ? START[LAST[0]] : 0);
  const shown = useRef(beat);

  const running = playing && inView && !hidden && !hold;

  /** The three progress lines fill straight from the clock, no re-render; the rewind drains them all. */
  const paint = useCallback(() => {
    const t = clock.current;
    const b = beatAt(t);
    const back = 1 - (t - START[REWIND]) / BEATS[REWIND].ms;
    segs.current.forEach((seg, i) => {
      const f = b === REWIND ? back : (t - CH_START[i]) / (CH_END[i] - CH_START[i]);
      seg?.style.setProperty("--f", Math.min(1, Math.max(0, f)).toFixed(4));
    });
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

  // The card opens out to fill the screen as it scrolls in and folds back as it leaves;
  // while it fills the screen, the header steps aside.
  useEffect(() => {
    const el = root.current;
    const scr = screen.current;
    if (!el || !scr) return;
    const doc = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const { top, bottom } = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const reach = vh * 0.7;
      const p = Math.max(0, Math.min(1, 1 - top / reach, bottom / reach));
      scr.style.setProperty("--p", p.toFixed(4));
      doc.toggleAttribute("data-immersive", top < vh * 0.08 && bottom > vh * 0.6);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      doc.removeAttribute("data-immersive");
    };
  }, []);

  // The stage is drawn on a fixed 760×520 canvas and scaled to whatever room it gets.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    // On a phone the canvas may lose a little of its far edges, so the packs and the till come out bigger.
    const fit = () => {
      const w = el.clientWidth < 600 ? 680 : 760;
      el.style.setProperty("--k", Math.min(el.clientWidth / w, el.clientHeight / 520).toFixed(4));
    };
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
  const copyNow = copyOf(s, current, locale);
  const copy = standby ? { ...copyNow, num: copyNow.num.replace(/\d/g, "0") } : copyNow;
  const head = { ...CHAPTERS[ch], ...s.chapters[ch] };

  // The label scene: one box, one price sticker that gets slapped again at every markdown.
  const days = reached("d60") ? 60 : reached("d30") ? 30 : reached("d7") ? 7 : 0;
  const price = MARKDOWNS.reduce((now, mark) => (days >= mark.days ? mark.price : now), RRP_FLAKES);
  // Once the milk is gone, the box slides over to the middle of the shelf.
  const box =
    rewind || step < IDX.d0 ? "off" : step < IDX.d30 ? "shelf" : step <= IDX.d60 ? "solo" : step === IDX.scan ? "scan" : "slot";
  // The milk shares the date, but it is a use-by: pulled a day after, then gone from the shelf.
  const milk = rewind || step < IDX.d0 ? "off" : step < IDX.d7 ? "shelf" : step < IDX.d30 ? "pulled" : "gone";

  // The receipt scene.
  const printed = reached("done") ? LINES.length : LINES.findLastIndex((_, i) => reached(`l${i + 1}`)) + 1;
  const feedTo = reached("done") ? feed.length - 1 : reached("scan") ? printed : -1;
  const full = feed[feed.length - 1] ?? 600;
  const shift = feedTo < 0 ? full + 12 : full - (feed[feedTo] ?? 0);
  const phase = reached("done") ? "done" : reached("scan") ? "printing" : "idle";
  const latest = printed ? LINES[printed - 1] : null;
  const lcd = rewind
    ? s.lcd.rewinding
    : phase === "done"
      ? s.lcd.thanks(`$${money(SAVED)}`)
      : latest
        ? { top: latest.name, bottom: s.lcd.priced(money(latest.price), money(latest.was)) }
        : phase === "printing"
          ? s.lcd.scanning
          : s.lcd.ready;

  const state = rewind ? "rewind" : running ? "rec" : "paused";
  const words = riseParts(head.lead, lang, locale);
  const spaced = !UNSPACED.includes(lang);

  return (
    <section className="film" id="why" ref={root} data-surface="cream" aria-labelledby="why-title">
      <div
        className="film-screen"
        ref={screen}
        data-surface="deep"
        data-beat={standby ? "standby" : current.id}
        data-ch={ch}
        data-state={state}
      >
        <h2 id="why-title" className="film-title">
          {s.title}
        </h2>

        <div
          className="film-copy"
          onFocus={() => setHold(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHold(false);
          }}
        >
          <h3 className="fc-head" key={`h${ch}`}>
            {words.map((word, i) => (
              <span className="fc-w" key={i} style={{ "--w": i } as CSSProperties}>
                {word}
                {spaced ? " " : null}
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
          <p className="fc-line" key={`t${current.id}`}>
            {copy.line}
          </p>
          {copy.fine?.href ? (
            <a
              className="fc-fine"
              href={copy.fine.href}
              target="_blank"
              rel="noreferrer"
              onPointerEnter={() => setHold(true)}
              onPointerLeave={() => setHold(false)}
            >
              {copy.fine.text}
            </a>
          ) : (
            <p className="fc-fine">{copy.fine?.text ?? " "}</p>
          )}
        </div>

        <div className="film-stage" ref={stage} aria-hidden="true">
          <div className="fs-canvas">
            <World on={ch === 0 && !rewind} step={standby ? -1 : step} />

            {/* the label: a shelf, the milk at the back of it, the box in front */}
            <span className="fsh" data-on={ch === 1 || undefined} />
            <div className="fmilk" data-at={milk}>
              <MilkCarton />
              <span className="pk-date">USE BY {BB_DATE}</span>
              {milk === "pulled" && <span className="fmilk-tag">{s.notForSale}</span>}
            </div>

            {/* the box of corn flakes, the one actor who crosses from the shelf to the till */}
            <div className="fbox" data-at={box}>
              <CerealBox />
              <span className="pk-date">BB {BB_DATE}</span>
              {price < RRP_FLAKES && (
                <span className="fbox-mark" key={price} data-last={price === 2 || undefined}>
                  ${price}
                </span>
              )}
              <span className="fbox-laser" />
            </div>

            {/* the receipt: the till prints the basket, line by line */}
            <div className="fst rcpt" data-on={ch === 2 || undefined} data-phase={phase}>
              <div className="rcpt-window">
                <div className="rcpt-tear">
                  <div className="paper" ref={paper} style={{ translate: `0 ${Math.max(0, shift)}px` }}>
                    <header className="r-head">
                      <LogoMark className="r-logo" />
                      <strong>Cheaper Buy Miles</strong>
                    </header>
                    <hr />
                    {LINES.map((line, i) => (
                      <p className={i < printed ? "r-item r-row on" : "r-item r-row"} key={line.id}>
                        <span>{line.name}</span>
                        <span>{money(line.price)}</span>
                      </p>
                    ))}
                    <hr />
                    <p className="r-row r-total">
                      <span>{s.youSaved}</span>
                      <span>${money(SAVED)}</span>
                    </p>
                    <Stamp on={reached("done")} text={s.stamp} className="r-stamp" />
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
                    <span key={`a-${lcd.top}`}>{lcd.top}</span>
                    <span key={`b-${lcd.bottom}`}>{lcd.bottom}</span>
                  </span>
                  <span className="reg-pad">
                    {Array.from({ length: 9 }, (_, i) => (
                      <i key={i === printed % 9 && printed ? `p${printed}` : i} data-on={(i === printed % 9 && printed > 0) || undefined} />
                    ))}
                  </span>
                </div>
                <div className="reg-foot">
                  <LogoMark className="reg-logo" />
                  <span>{s.till}</span>
                  <i className="reg-led" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="film-ctrl">
          <button
            className="film-play"
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? s.pause : s.play}
            aria-pressed={!playing}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
            </svg>
          </button>
          <div className="film-prog" role="group" aria-label={s.chapterNav}>
            {s.chapters.map((chapter, i) => (
              <button
                key={chapter.label}
                ref={(el) => {
                  segs.current[i] = el;
                }}
                type="button"
                aria-label={s.chapterLabel(i + 1, chapter.label)}
                aria-current={!rewind && i === ch ? "step" : undefined}
                onClick={() => seek(i)}
              />
            ))}
          </div>
        </div>

        <span className="film-vhs" data-on={rewind || undefined} aria-hidden="true" />
      </div>
    </section>
  );
}
