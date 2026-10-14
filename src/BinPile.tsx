import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type * as MatterNS from "matter-js";
import { useLang, useT } from "./i18n";
import { binPileStrings } from "./i18n/strings/BinPile";
import { LogoMark } from "./Logo";
import { Pack } from "./Pack";
import { Apple, Banana, Bread } from "./Produce";
import { ITEMS, PACK_BOX, type Shape } from "./products";
import "./binpile.css";

/**
 * "Nothing good goes in the bin": a handful of groceries tumble into the footer
 * the first time it scrolls into view, between a checkout till on the left and
 * a red-lid landfill bin on the right. Drag and throw them (or tap them on a
 * phone). The bin spits good food straight back out, and anything with a
 * use-by gets a tip on how to use it up instead. The till rings up whatever is
 * put on its counter, warns about the use-by ones, and the shelf restocks.
 * Physics by matter-js, loaded only when the footer gets close.
 */

type Perish = { tag: string; warn: string; tips: string[] };
/** One grocery's words, by item key: the use-by date (short and long) is passed in, in the visitor's language. */
type PerishLines = (short: string, when: string) => Perish;
type Def = {
  key: string;
  name: string;
  price: number;
  was: number;
  /** Use-by (days from now) or, with no days, keep-frozen groceries: the till warns, the bin gives a tip. The words are in the strings file. */
  perish?: { days?: number };
  w: number;
  h: number;
  shape: "box" | "circle";
  round: number;
  node: ReactNode;
};
type Look = Pick<Def, "w" | "h" | "shape" | "round" | "node">;

/** Everything a line can depend on. Lines are resolved at render time, so a bubble on screen follows a language switch. */
type Copy = typeof binPileStrings.en;
type Kit = { s: Copy; locale: string };
type Line = (kit: Kit) => string;

const PACK_SCALE = 0.52;
const packLook = (shape: Shape, color: string, label: [string, string?]): Look => {
  const [, , bw, bh] = PACK_BOX[shape];
  return { w: bw * PACK_SCALE, h: bh * PACK_SCALE, shape: "box", round: 8, node: <Pack shape={shape} color={color} label={label} tight /> };
};
const stocked = (id: string) => {
  const item = ITEMS.find((candidate) => candidate.id === id);
  return {
    price: item?.price ?? 2,
    was: item?.was ?? item?.price ?? 2,
    ...packLook(item?.shape ?? "box", item?.color ?? "#d8b27a", item?.label ?? [id.toUpperCase()]),
  };
};

const day = (days: number) => new Date(Date.now() + days * 86_400_000);
const longDate = (days: number, locale: string) =>
  day(days).toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" }).replace(",", "");
const shortDate = (days: number, locale: string) => day(days).toLocaleDateString(locale, { day: "2-digit", month: "short" }).toUpperCase();
/** A grocery's use-by words, dated from today in the visitor's language. */
const perishOf = (def: Def, { s, locale }: Kit): Perish => {
  const days = def.perish?.days ?? 0;
  return (s.perish as Record<string, PerishLines>)[def.key](shortDate(days, locale), longDate(days, locale));
};

/** Ten groceries in drop order; phones get the first seven. Produce and milk prices are placeholders. */
const DEFS: Def[] = [
  { key: "cornflakes", name: "Corn flakes", ...stocked("cornflakes") },
  {
    key: "milk",
    name: "Fresh milk",
    price: 1.5,
    was: 3.2,
    perish: { days: 3 },
    ...packLook("carton", "#6bb8ff", ["FRESH", "MILK"]),
  },
  { key: "apple", name: "Wonky apple", price: 0.5, was: 1.2, w: 46, h: 46, shape: "circle", round: 0, node: <Apple /> },
  { key: "chickpeas", name: "Chickpeas", ...stocked("chickpeas") },
  {
    key: "yoghurt",
    name: "Greek yoghurt",
    perish: { days: 6 },
    ...stocked("yoghurt"),
  },
  { key: "banana", name: "Spotty banana", price: 0.3, was: 0.8, w: 90, h: 38, shape: "box", round: 14, node: <Banana /> },
  { key: "popcorn", name: "Popcorn", ...stocked("popcorn") },
  {
    key: "dumplings",
    name: "Dumplings",
    perish: {},
    ...stocked("dumplings"),
  },
  { key: "bread", name: "Day-old loaf", price: 1.5, was: 4.5, w: 86, h: 48, shape: "box", round: 16, node: <Bread /> },
  { key: "pb", name: "Peanut butter", ...stocked("pb") },
];
const BY_KEY = Object.fromEntries(DEFS.map((def) => [def.key, def]));

/** Indexes into the strings' lists (shuffled into decks below). The words are read at render time, in the current language. */
const LINE_IDS = binPileStrings.en.lines.map((_, i) => i);
const FED_UP_IDS = binPileStrings.en.fedUp.map((_, i) => i);
const BEEP_IDS = binPileStrings.en.beeps.map((_, i) => i);

/** The tone label that the CSS shows on a bubble. */
const tagOf = (tags: Copy["tags"], tone?: string) => (tone === "tip" ? tags.tip : tone === "ok" ? tags.beep : tone === "warn" ? tags.warn : undefined);

type Say = { text: Line; tone?: "item" | "mad" | "tip" };
type Ring = { lcd: [string, Line]; text: Line; tone: "ok" | "warn"; count: number };

const money = (value: number) => value.toFixed(2);

/** Melbourne's red-lid landfill bin, with a face, because it has opinions. */
function BinArt({ sticker }: { sticker: Copy["sticker"] }) {
  return (
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="bin-eyes">
          <ellipse cx="45" cy="66" rx="10.5" ry="11.5" />
          <ellipse cx="75" cy="66" rx="10.5" ry="11.5" />
        </clipPath>
      </defs>
      <g strokeLinejoin="round" strokeLinecap="round">
        {/* axle and wheels, tucked behind the body */}
        <rect x="16" y="137" width="88" height="7" rx="3.5" fill="#141414" />
        {[25, 95].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="148" r="10.5" fill="#1d2320" stroke="#141414" strokeWidth="2.4" />
            <circle cx={cx} cy="148" r="4" fill="#6b7a74" />
          </g>
        ))}

        {/* tapered body, lit from the left */}
        <path d="M14 44H106L99.5 136Q98.8 144 91 144H29Q21.2 144 20.5 136Z" fill="#2f3e38" />
        <path d="M17 46H31L34 141H29Q23 141 22.6 135Z" fill="#3e5049" />
        <path d="M95 46H103L97 135Q96.6 140 92 141H91Z" fill="#25312c" />
        <path d="M14 44H106L99.5 136Q98.8 144 91 144H29Q21.2 144 20.5 136Z" fill="none" stroke="#141414" strokeWidth="2.4" />

        {/* the lid: handle at the back, a domed top and a heavy front lip */}
        <g className="bin-lid">
          <rect x="24" y="9" width="72" height="10" rx="4.5" fill="#8f1a12" stroke="#141414" strokeWidth="2.4" />
          <path d="M10 42L13 25Q14.5 18 22 18H98Q105.5 18 107 25L110 42Z" fill="#d42a1e" stroke="#141414" strokeWidth="2.4" />
          <path d="M19 26Q20.5 22.5 25 22.5H64" fill="none" stroke="#f26a58" strokeWidth="3" opacity="0.85" />
          <rect x="6" y="36" width="108" height="10" rx="4" fill="#b5221a" stroke="#141414" strokeWidth="2.4" />
        </g>

        {/* face */}
        <g className="bin-face">
          <path className="bin-brow l" d="M35 52.5Q45 48.5 54 52" fill="none" stroke="#141414" strokeWidth="3.2" />
          <path className="bin-brow r" d="M66 52Q75 48.5 85 52.5" fill="none" stroke="#141414" strokeWidth="3.2" />
          <ellipse cx="45" cy="66" rx="10.5" ry="11.5" fill="#fffdf6" />
          <ellipse cx="75" cy="66" rx="10.5" ry="11.5" fill="#fffdf6" />
          <g clipPath="url(#bin-eyes)">
            <g className="bin-pupils">
              <circle cx="46" cy="67" r="5.2" fill="#141414" />
              <circle cx="76" cy="67" r="5.2" fill="#141414" />
              <circle cx="47.8" cy="65" r="1.7" fill="#fff" />
              <circle cx="77.8" cy="65" r="1.7" fill="#fff" />
            </g>
            <rect className="bin-blink" x="30" y="53" width="60" height="26" fill="#3a4b44" />
          </g>
          <ellipse cx="45" cy="66" rx="10.5" ry="11.5" fill="none" stroke="#141414" strokeWidth="2.4" />
          <ellipse cx="75" cy="66" rx="10.5" ry="11.5" fill="none" stroke="#141414" strokeWidth="2.4" />
          <path className="bin-mouth m-idle" d="M54 84Q60 87.5 66 84" fill="none" stroke="#141414" strokeWidth="2.6" />
          <ellipse className="bin-mouth m-o" cx="60" cy="86" rx="4.2" ry="5" fill="#141414" />
          <path className="bin-mouth m-frown" d="M52 89Q60 82 68 89" fill="none" stroke="#141414" strokeWidth="2.8" />
          <path className="bin-mouth m-grin" d="M51 83Q60 93 69 83Z" fill="#141414" stroke="#141414" strokeWidth="2" />
        </g>

        {/* the council sticker, slapped on a bit crooked */}
        <g transform="rotate(-3 60 112)">
          <rect x="31" y="98" width="58" height="28" rx="4" fill="#fffdf6" stroke="#141414" strokeWidth="2" />
          <text x="60" y="113" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="12" letterSpacing="0.6" fill="#141414">
            {sticker.top}
          </text>
          <text x="60" y="121.5" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="6.4" fill="#d42a1e">
            {sticker.bottom}
          </text>
        </g>
      </g>
    </svg>
  );
}

/** A checkout till: tower scanner, counter, customer display on a pole, and a receipt that gets longer with every rescue. */
function TillArt() {
  return (
    <svg className="till-art" viewBox="0 0 200 170" aria-hidden="true" focusable="false">
      <g stroke="#141414" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        {/* customer display */}
        <rect x="140" y="46" width="12" height="32" fill="#26322d" />
        <rect x="94" y="2" width="104" height="48" rx="8" fill="#1e2824" />
        <rect className="till-screen" x="101" y="8" width="90" height="36" rx="3" fill="#b8d98a" />

        {/* tower scanner, its red laser sweeping the glass */}
        <rect x="12" y="30" width="60" height="48" rx="7" fill="#1e2824" />
        <rect className="till-glass" x="19" y="37" width="46" height="34" rx="3" fill="#3a0f0c" />
        <path className="till-laser" d="M24 54H60" stroke="#ff4b3a" strokeWidth="2.2" />

        {/* cabinet */}
        <rect x="8" y="86" width="184" height="78" rx="4" fill="#efe6cf" />
        <rect x="9.2" y="138" width="181.6" height="24.8" fill="#ddd1b1" stroke="none" />
        <path d="M14 140H186" strokeWidth="1.6" opacity="0.5" />
        <rect x="8" y="92" width="184" height="7" fill="#e3261b" />
        <rect x="122" y="106" width="52" height="6" rx="2" fill="#141414" />
        <rect x="8" y="86" width="184" height="78" rx="4" fill="none" />

        {/* counter top */}
        <rect x="0" y="74" width="200" height="14" rx="4" fill="#2b3833" />
        <path d="M6 78H194" stroke="#4b5e55" strokeWidth="2.4" />
        <rect x="14" y="164" width="172" height="6" rx="2" fill="#141414" />
      </g>
    </svg>
  );
}

export function BinPile() {
  const s = useT(binPileStrings);
  const { locale } = useLang();
  const kit: Kit = { s, locale };
  const stage = useRef<HTMLDivElement>(null);
  const bin = useRef<HTMLDivElement>(null);
  const till = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState<(Say & { n: number }) | null>(null);
  const [ring, setRing] = useState<(Ring & { n: number }) | null>(null);

  useEffect(() => {
    const el = stage.current;
    const binEl = bin.current;
    const tillEl = till.current;
    if (!el || !binEl || !tillEl) return;
    let disposed = false;
    let teardown = () => {};

    // Only fetch the physics engine once the footer is close.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("matter-js").then((mod) => {
          if (disposed) return;
          teardown = start(mod.default ?? mod, el, binEl, tillEl, {
            say: (line) => setBubble((b) => ({ ...line, n: (b?.n ?? 0) + 1 })),
            ring: (next) => setRing((r) => ({ ...next, n: (r?.n ?? 0) + 1 })),
          });
        });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);

    // The till's laser and the bin's blink are SVG loops, which Chrome runs on the main thread: they only run near the screen.
    const sight = new IntersectionObserver(([entry]) => el.toggleAttribute("data-off", !entry.isIntersecting), { rootMargin: "120px 0px" });
    sight.observe(el);
    return () => {
      disposed = true;
      near.disconnect();
      sight.disconnect();
      teardown();
    };
  }, []);

  const lcd = ring ? [ring.lcd[0], ring.lcd[1](kit)] : [s.ready, s.saved(money(0))];

  return (
    <div className="pile" ref={stage}>
      <div className="pile-copy">
        <p className="eyebrow">{s.eyebrow}</p>
        <p className="pile-title">{s.title}</p>
      </div>
      <div className="pile-till" ref={till} data-tone={ring?.tone} style={{ "--n": Math.min(7, ring?.count ?? 0) } as CSSProperties} aria-hidden="true">
        <TillArt />
        <LogoMark className="till-logo" />
        <span className="till-lcd">
          <span key={`a${ring?.n ?? 0}`}>{lcd[0]}</span>
          <span key={`b${ring?.n ?? 0}`}>{lcd[1]}</span>
        </span>
        <span className="till-rcpt" />
        {ring && (
          <span className="pile-bubble till-bubble" key={ring.n} data-tone={ring.tone} data-tag={tagOf(s.tags, ring.tone)}>
            {ring.text(kit)}
          </span>
        )}
      </div>
      <div className="pile-bin" ref={bin} aria-hidden="true">
        <BinArt sticker={s.sticker} />
        {bubble && (
          <span className="pile-bubble" key={bubble.n} data-tone={bubble.tone} data-tag={tagOf(s.tags, bubble.tone)}>
            {bubble.text(kit)}
          </span>
        )}
      </div>
      {DEFS.map((def, index) => (
        <div
          key={def.key}
          className="pi"
          data-i={index}
          data-circle={def.shape === "circle" || undefined}
          style={{ width: def.w, height: def.h, "--i": index } as CSSProperties}
          aria-hidden="true"
        >
          {/* The sway, the pop-in and the shrink run on this div: on the <svg> itself they would stay on the main thread. */}
          <div className="pi-art">{def.node}</div>
        </div>
      ))}
    </div>
  );
}

function shuffled<T>(list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Picks the bin's next line: a tip for use-by food, the item's own comeback, then the generic deck, and a sulk when spammed. */
function lineMaker() {
  let deck: number[] = [];
  let fedUp: number[] = [];
  const heard = new Set<string>();
  const tipped: Record<string, number> = {};
  let streak = 0;
  let last = 0;
  return (key: string): Say => {
    const now = performance.now();
    streak = now - last < 4500 ? streak + 1 : 0;
    last = now;
    if (streak >= 3) {
      if (!fedUp.length) fedUp = shuffled(FED_UP_IDS);
      const i = fedUp.pop()!;
      return { text: (k) => k.s.fedUp[i], tone: "mad" };
    }
    const def = BY_KEY[key];
    if (def?.perish) {
      const n = tipped[key] ?? 0;
      tipped[key] = n + 1;
      return {
        text: (k) => {
          const { tips } = perishOf(def, k);
          return tips[n % tips.length];
        },
        tone: "tip",
      };
    }
    if (Object.hasOwn(binPileStrings.en.about, key) && !heard.has(key)) {
      heard.add(key);
      return { text: (k) => (k.s.about as Record<string, string>)[key], tone: "item" };
    }
    if (!deck.length) deck = shuffled(LINE_IDS);
    const i = deck.pop()!;
    return { text: (k) => k.s.lines[i] };
  };
}

type Hooks = { say: (line: Say) => void; ring: (ring: Ring) => void };

function start(Matter: typeof MatterNS, el: HTMLElement, binEl: HTMLElement, tillEl: HTMLElement, hooks: Hooks) {
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;
  const world = engine.world;
  const nodes = Array.from(el.querySelectorAll<HTMLElement>(".pi"));
  let W = el.clientWidth;
  let H = el.clientHeight;
  // Sizes are fixed at start and follow the footer width; phones get fewer, smaller groceries.
  const k = Math.min(1.3, Math.max(0.78, W / 1000));
  const limit = W < 640 ? 7 : nodes.length;

  // ---- static scenery: floor, side walls, the bin, the till (rebuilt on resize) ----
  const T = 400;
  let statics: MatterNS.Body[] = [];
  let mouth = { x0: 0, x1: 0, top: 0 };
  let counter = { x0: 0, x1: 0, top: 0, head: 0 };
  let eye = { x: 0, y: 0 };

  const layout = () => {
    W = el.clientWidth;
    H = el.clientHeight;
    const wall = (x: number, y: number, w: number, h: number) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.6 });

    const bw = binEl.offsetWidth;
    const bh = binEl.offsetHeight;
    const bx = binEl.offsetLeft;
    const by = H - bh;
    const sx = bw / 120;
    const sy = bh / 160;

    // The till is drawn on a 200×170 grid; its blocks are solid, so things rest on the counter.
    const tx = tillEl.offsetLeft;
    const ty = H - tillEl.offsetHeight;
    const ux = tillEl.offsetWidth / 200;
    const uy = tillEl.offsetHeight / 170;
    const block = (x: number, y: number, w: number, h: number) => wall(tx + (x + w / 2) * ux, ty + (y + h / 2) * uy, w * ux, h * uy);

    Composite.remove(world, statics);
    statics = [
      wall(W / 2, H + T / 2, W + T * 2, T),
      // A lid on the stage, so nothing gets thrown up over the section above.
      wall(W / 2, -T / 2, W + T * 2, T),
      wall(-T / 2, H - 2000, T, 4000),
      wall(W + T / 2, H - 2000, T, 4000),
      // The bin is solid, lid shut: nothing can wedge itself between thin walls.
      wall(bx + 60 * sx, by + 89 * sy, 88 * sx, 142 * sy),
      wall(bx + 60 * sx, by + 41 * sy, 108 * sx, 10 * sy),
      block(0, 74, 200, 96),
      block(12, 30, 60, 48),
      // Display and pole as one column, so there's no pocket under the screen to get stuck in.
      block(94, 2, 104, 76),
    ];
    Composite.add(world, statics);
    mouth = { x0: bx + 6 * sx, x1: bx + 114 * sx, top: by + 18 * sy };
    counter = { x0: tx, x1: tx + 200 * ux, top: ty + 74 * uy, head: ty };
    eye = { x: bx + 60 * sx, y: by + 66 * sy };
  };

  // ---- groceries -------------------------------------------------------------
  const items = nodes.slice(0, limit).map((node, i) => {
    const def = DEFS[i];
    const w = def.w * k;
    const h = def.h * k;
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;
    const opts = { restitution: 0.25, friction: 0.55, frictionAir: 0.012, density: 0.0016, chamfer: { radius: def.round * k } };
    const body =
      def.shape === "circle"
        ? Bodies.circle(0, 0, w / 2, { restitution: 0.35, friction: 0.4, frictionAir: 0.012, density: 0.0016 })
        : Bodies.rectangle(0, 0, w, h, opts);
    // touched: only something a person has handled gets rung up, not whatever happens to fall on the counter.
    return { def, node, body, w, h, added: false, touched: false, binnedAt: 0, tillAt: 0 };
  });
  type It = (typeof items)[number];

  const paint = () => {
    for (const it of items) {
      if (!it.added) continue;
      const { x, y } = it.body.position;
      it.node.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(y - it.h / 2).toFixed(1)}px, 0) rotate(${it.body.angle.toFixed(3)}rad)`;
    }
  };

  const timers: number[] = [];
  const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
  const replay = (node: HTMLElement, attr: string) => {
    node.removeAttribute(attr);
    void node.offsetWidth;
    node.setAttribute(attr, "");
  };

  // ---- the bin refuses (and pulls a face) ------------------------------------------
  const nextLine = lineMaker();
  let moodTimer = 0;
  const spit = (it: It) => {
    const line = nextLine(it.def.key);
    const soft = line.tone === "tip";
    it.touched = false;
    Sleeping.set(it.body, false);
    Body.setPosition(it.body, { x: it.body.position.x, y: Math.min(it.body.position.y, mouth.top - Math.max(it.w, it.h) / 2) });
    Body.setVelocity(it.body, soft ? { x: -(3.5 + Math.random() * 2), y: -(10 + Math.random() * 2) } : { x: -(5 + Math.random() * 4), y: -(13 + Math.random() * 3) });
    Body.setAngularVelocity(it.body, (Math.random() - 0.5) * (soft ? 0.2 : 0.5));
    replay(binEl, "data-spit");
    binEl.dataset.mood = line.tone ?? "no";
    window.clearTimeout(moodTimer);
    moodTimer = window.setTimeout(() => delete binEl.dataset.mood, 2600);
    hooks.say(line);
  };

  // ---- the till rings it up --------------------------------------------------------
  let count = 0;
  let saved = 0;
  let beeps: number[] = [];
  const restock = (it: It) => {
    drop(it, spawnX(it), it.h / 2 + 12 + Math.random() * H * 0.12);
    kick();
  };
  const ringUp = (it: It) => {
    const { def } = it;
    Composite.remove(world, it.body);
    it.added = false;
    it.touched = false;
    it.tillAt = 0;
    it.node.dataset.gone = "";
    later(() => {
      it.node.style.visibility = "hidden";
      delete it.node.dataset.gone;
    }, 420);
    later(() => restock(it), 4200);

    count += 1;
    saved += def.was - def.price;
    const total = saved;
    replay(tillEl, "data-beep");
    if (def.perish) {
      hooks.ring({ lcd: [def.name, (k) => perishOf(def, k).tag], text: (k) => perishOf(def, k).warn, tone: "warn", count });
    } else {
      if (!beeps.length) beeps = shuffled(BEEP_IDS);
      const i = beeps.pop()!;
      const price = money(def.price);
      const off = money(def.was - def.price);
      hooks.ring({ lcd: [def.name, (k) => k.s.saved(money(total))], text: (k) => k.s.beeps[i](price, off), tone: "ok", count });
    }
  };

  // ---- loop ---------------------------------------------------------------------
  let raf = 0;
  let visible = false;
  let dragging: { body: MatterNS.Body; c: MatterNS.Constraint } | null = null;
  const letGo = () => {
    if (!dragging) return;
    Composite.remove(world, dragging.c);
    dragging = null;
    delete el.dataset.dragging;
  };
  let pending = 0;
  let look = { x: 0, y: 0 };

  // Fixed 60 Hz steps whatever the display rate, so a 120 Hz screen doesn't run the pile at double speed.
  const STEP = 1000 / 60;
  let last = 0;
  let acc = 0;

  const frame = (now: number) => {
    raf = 0;
    acc += last ? Math.min(50, now - last) : STEP;
    last = now;
    let steps = 0;
    while (acc >= STEP && steps < 3) {
      Engine.update(engine, STEP);
      acc -= STEP;
      steps += 1;
    }
    if (steps === 3) acc = 0;
    let awake = pending > 0 || dragging !== null;
    for (const it of items) {
      if (!it.added) continue;
      const b = it.body;
      // Keep things from tunnelling through walls after a wild throw.
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      if (speed > 30) Body.setVelocity(b, { x: (b.velocity.x / speed) * 30, y: (b.velocity.y / speed) * 30 });
      const { x, y } = b.position;
      // While held, what counts is where the pointer is: the item itself gets stopped at the
      // bin's or the till's edge, and would only shake there against it.
      const hand = dragging !== null && dragging.body === b ? dragging.c.pointA : null;
      const held = hand !== null;
      const reach = Math.max(it.w, it.h) / 2;
      // Dropped over the bin or onto its lid, or pushed at it by hand: the bin refuses it, straight
      // out of your hand if need be. Things merely standing beside the bin, under the lip, don't count.
      const binned = hand
        ? (hand.x > mouth.x0 && hand.y > mouth.top - 24) || (x > mouth.x0 - 10 && x < mouth.x1 + 10 && y > mouth.top - reach - 16)
        : (x > mouth.x0 + 14 && x < mouth.x1 - 14 && y > mouth.top) ||
          (x > mouth.x0 - 10 && x < mouth.x1 + 10 && y > mouth.top - 170 && y < mouth.top + 12);
      if (binned && !it.binnedAt) it.binnedAt = now;
      if (!binned) it.binnedAt = 0;
      if (it.binnedAt && now - it.binnedAt > (held ? 150 : 320)) {
        if (held) letGo();
        it.binnedAt = 0;
        spit(it);
        awake = true;
        continue;
      }
      // Set down anywhere on the till (counter, scanner or display), or pushed at it by hand: scanned.
      const onTill = hand
        ? (hand.x < counter.x1 && hand.y > counter.head - 24) || (x > counter.x0 && x < counter.x1 && y > counter.head - reach - 16)
        : it.touched && x > counter.x0 && x < counter.x1 && y > counter.head - reach - 26 && y < counter.top;
      if (onTill && !it.tillAt) it.tillAt = now;
      if (!onTill) it.tillAt = 0;
      if (it.tillAt && now - it.tillAt > (held ? 200 : 300)) {
        // A scanner doesn't wait for you to let go.
        if (held) letGo();
        ringUp(it);
        continue;
      }
      if (!b.isSleeping || it.binnedAt || it.tillAt) awake = true;
    }
    // The bin keeps an eye on whatever is being dragged.
    let lx = 0;
    let ly = 0;
    if (dragging) {
      const dx = dragging.body.position.x - eye.x;
      const dy = dragging.body.position.y - eye.y;
      const d = Math.hypot(dx, dy) || 1;
      lx = (dx / d) * 3.6;
      ly = (dy / d) * 2.8;
    }
    if (Math.abs(lx - look.x) > 0.1 || Math.abs(ly - look.y) > 0.1) {
      look = { x: lx, y: ly };
      binEl.style.setProperty("--lx", `${lx.toFixed(2)}px`);
      binEl.style.setProperty("--ly", `${ly.toFixed(2)}px`);
    }
    paint();
    if (visible && awake) raf = requestAnimationFrame(frame);
    else last = 0;
  };
  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  };

  const drop = (it: It, x: number, y: number) => {
    Body.setPosition(it.body, { x, y });
    Body.setVelocity(it.body, { x: 0, y: 0 });
    Body.setAngle(it.body, (Math.random() - 0.5) * 1.6);
    Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.18);
    Composite.add(world, it.body);
    it.added = true;
    it.node.style.visibility = "visible";
    replay(it.node, "data-in");
  };

  // Groceries land between the till and the bin (on a phone, there's only room if they can land on the counter too).
  const spawnX = (it: It) => {
    const x0 = (W < 640 ? counter.x0 + 8 : counter.x1 + 24) + it.w / 2;
    const x1 = mouth.x0 - 24 - it.w / 2;
    return x0 + Math.random() * Math.max(0, x1 - x0);
  };

  layout();
  let spawned = false;
  const spawn = () => {
    spawned = true;
    if (reduce) {
      items.forEach((it, i) => drop(it, spawnX(it), H - 60 - (i % 4) * 70));
      for (let i = 0; i < 500; i += 1) Engine.update(engine, 1000 / 60);
      paint();
      return;
    }
    // Each one pops in just under the top of the stage and falls from there, never from outside the footer.
    items.forEach((it, i) => {
      pending += 1;
      later(() => {
        pending -= 1;
        drop(it, spawnX(it), it.h / 2 + 12 + Math.random() * H * 0.22);
        kick();
      }, 80 + i * 90);
    });
  };

  // Start the drop once most of the stage is on screen, so the whole fall is seen.
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (!spawned && entry.intersectionRatio >= 0.45) spawn();
      kick();
    },
    { threshold: [0, 0.45] },
  );
  io.observe(el);

  const ro = new ResizeObserver(() => {
    layout();
    for (const it of items) {
      if (!it.added) continue;
      const { x, y } = it.body.position;
      const cx = Math.min(W - it.w / 2, Math.max(it.w / 2, x));
      if (cx !== x || y > H) Body.setPosition(it.body, { x: cx, y: Math.min(y, H - it.h / 2) });
      Sleeping.set(it.body, false);
    }
    kick();
  });
  ro.observe(el);

  // ---- pointer: drag and throw with a mouse, tap to flick on touch ------------------
  const toWorld = (event: PointerEvent) => {
    const box = el.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };
  const listeners: Array<[HTMLElement, string, EventListener]> = [];
  const on = (node: HTMLElement, type: string, fn: (event: PointerEvent) => void) => {
    node.addEventListener(type, fn as EventListener);
    listeners.push([node, type, fn as EventListener]);
  };

  items.forEach((it) => {
    let lastType = "";
    on(it.node, "pointerdown", (event) => {
      // First touch ends the idle sway for the whole pile.
      el.dataset.touched = "";
      it.touched = true;
      lastType = event.pointerType;
      if (event.pointerType === "touch") return;
      event.preventDefault();
      try {
        it.node.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic or already-released pointers cannot be captured; dragging still works while over the item.
      }
      const p = toWorld(event);
      const c = Constraint.create({
        pointA: p,
        bodyB: it.body,
        pointB: { x: p.x - it.body.position.x, y: p.y - it.body.position.y },
        stiffness: 0.18,
        damping: 0.05,
        length: 0,
      });
      Composite.add(world, c);
      Sleeping.set(it.body, false);
      dragging = { body: it.body, c };
      el.dataset.dragging = "";
      kick();
    });
    on(it.node, "pointermove", (event) => {
      if (!dragging || dragging.body !== it.body) return;
      // Kept inside the stage, so nothing gets hauled into the floor or the walls.
      const p = toWorld(event);
      dragging.c.pointA = { x: Math.min(W - 4, Math.max(4, p.x)), y: Math.min(H - 4, Math.max(4, p.y)) };
      Sleeping.set(it.body, false);
      kick();
    });
    const release = () => {
      if (!dragging || dragging.body !== it.body) return;
      letGo();
      kick();
    };
    on(it.node, "pointerup", release);
    on(it.node, "pointercancel", release);
    // Safari's click is not a PointerEvent, so remember what pressed it.
    on(it.node, "click", () => {
      if (lastType !== "touch" || !it.added) return;
      Sleeping.set(it.body, false);
      Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 10, y: -(10 + Math.random() * 5) });
      Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.45);
      kick();
    });
  });

  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    window.clearTimeout(moodTimer);
    io.disconnect();
    ro.disconnect();
    listeners.forEach(([node, type, fn]) => node.removeEventListener(type, fn));
    Composite.clear(world, false);
    Engine.clear(engine);
  };
}
