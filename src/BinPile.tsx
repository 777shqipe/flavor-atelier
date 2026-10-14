import { useEffect, useRef, useState, type ReactNode } from "react";
import type * as MatterNS from "matter-js";
import { Pack } from "./Pack";
import { Apple, Banana, Bread, Carrot, Lemon } from "./Produce";
import { ITEMS, PACK_BOX } from "./products";
import "./binpile.css";

/**
 * "Nothing good goes in the bin": groceries tumble into the footer the first
 * time it scrolls into view. Drag and throw them (or tap them on a phone). Get
 * one into the red-lid landfill bin and the bin spits it straight back out.
 * Physics by matter-js, loaded only when the footer gets close.
 */

type Def = { key: string; w: number; h: number; shape: "box" | "circle"; round: number; node: ReactNode };

const PACKS = ["beans", "popcorn", "muesli", "yoghurt", "dishwash", "oatmilk", "pb", "sparkling", "dumplings", "cornflakes", "coldbrew", "icecream", "applejuice", "chickpeas", "gummies", "sanpellegrino", "shin", "milka"];
const PACK_SCALE = 0.62;

function buildDefs(): Def[] {
  const packs: Def[] = PACKS.flatMap((id) => {
    const item = ITEMS.find((candidate) => candidate.id === id);
    if (!item?.shape || !item.color || !item.label) return [];
    const [, , bw, bh] = PACK_BOX[item.shape];
    return [
      {
        key: id,
        w: bw * PACK_SCALE,
        h: bh * PACK_SCALE,
        shape: "box" as const,
        round: 8,
        node: <Pack shape={item.shape} color={item.color} label={item.label} tight />,
      },
    ];
  });
  const fresh: Def[] = [
    { key: "apple", w: 62, h: 62, shape: "circle", round: 0, node: <Apple /> },
    { key: "banana", w: 120, h: 50, shape: "box", round: 18, node: <Banana /> },
    { key: "bread", w: 114, h: 64, shape: "box", round: 22, node: <Bread /> },
    { key: "carrot", w: 126, h: 43, shape: "box", round: 16, node: <Carrot /> },
    { key: "lemon", w: 70, h: 48, shape: "box", round: 22, node: <Lemon /> },
  ];
  // Interleave so packs and produce land mixed together.
  const all = [...packs, ...fresh];
  return all.map((_, i) => all[(i * 7) % all.length]);
}

const DEFS = buildDefs();

/** What the bin says when it spits something back. Shuffled, no repeats until the deck runs out. */
const LINES = [
  "Oi! That’s still good.",
  "Not in my bin.",
  "Best before isn’t use by.",
  "Someone will eat that.",
  "Rescued. Again.",
  "Nice try.",
  "I’m a bin, not a fridge.",
  "Ugly isn’t off.",
  "That’s dinner, mate.",
  "Return to sender.",
  "Back on the shelf with you.",
  "Dented? Still delicious.",
  "Have you tried eating it?",
  "Denied.",
  "Not today, landfill.",
  "Plenty of life left in that.",
  "I only take actual rubbish.",
  "Pop it in a lunchbox.",
  "Bin rejected. Fridge accepted.",
  "Smell it. Taste it. Eat it.",
  "That’s someone’s lunch.",
  "Wrong bin. There is no right bin.",
];

/** First time a particular grocery lands in the bin, it gets its own comeback. */
const ABOUT: Record<string, string> = {
  banana: "Brown spots? That’s banana bread.",
  bread: "Stale? That’s French toast.",
  apple: "A bruise isn’t a bin ticket.",
  carrot: "Bendy carrots taste the same.",
  lemon: "Squeeze it, don’t bin it.",
  popcorn: "New bag. Same corn.",
  muesli: "Overstock isn’t off.",
  cornflakes: "Best before. Not bad after.",
  yoghurt: "Check the date, then grab a spoon.",
  icecream: "Ice cream?! In the bin?!",
  dumplings: "Dented box. Dumplings fine.",
  chickpeas: "Tins keep for years, mate.",
  beans: "Tins keep for years, mate.",
  gummies: "Gummies barely know what ‘off’ is.",
  sparkling: "Still fizzy. Still fine.",
  sanpellegrino: "Still fizzy. Still fine.",
  shin: "Noodles keep for ages.",
  milka: "Chocolate?! Are you mad?",
  dishwash: "Not even food. Still no.",
  oatmilk: "Unopened? It’s got months.",
  pb: "Peanut butter never gives up.",
  coldbrew: "Still caffeinated. Still good.",
  applejuice: "Sealed juice keeps for months.",
};

/** Keep chucking things in quickly and the bin loses patience. */
const FED_UP = ["Seriously?", "Again?!", "Mate. Stop.", "I can do this all day.", "Lid’s staying shut.", "Persistent, aren’t you?"];

type Say = { text: string; tone?: "item" | "mad" };

function BinArt() {
  return (
    <svg viewBox="0 0 120 160" aria-hidden="true" focusable="false">
      <g strokeLinejoin="round" strokeLinecap="round">
        <g className="bin-lid">
          <rect x="9" y="-6" width="102" height="42" rx="7" fill="#d42a1e" stroke="#141414" strokeWidth="2.4" />
          <rect x="17" y="2" width="86" height="26" rx="4" fill="#a81d14" />
        </g>
        <path d="M14 40H106L98 146H22Z" fill="#2b3833" stroke="#141414" strokeWidth="2.4" />
        <path d="M34 54L38 132M60 54V132M86 54L82 132" stroke="#3e4e48" strokeWidth="4" />
        <rect x="8" y="33" width="104" height="12" rx="4" fill="#202b27" stroke="#141414" strokeWidth="2.4" />
        <rect x="31" y="70" width="58" height="34" rx="5" fill="#fffdf6" stroke="#141414" strokeWidth="2" />
        <text x="60" y="86" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="12" letterSpacing="0.6" fill="#141414">
          LANDFILL
        </text>
        <text x="60" y="98" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="700" fontSize="7" fill="#d42a1e">
          NO GOOD FOOD
        </text>
        <circle cx="30" cy="148" r="10" fill="#141414" />
        <circle cx="90" cy="148" r="10" fill="#141414" />
        <circle cx="30" cy="148" r="3.5" fill="#6b7a74" />
        <circle cx="90" cy="148" r="3.5" fill="#6b7a74" />
      </g>
    </svg>
  );
}

export function BinPile() {
  const stage = useRef<HTMLDivElement>(null);
  const bin = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState<(Say & { n: number }) | null>(null);

  useEffect(() => {
    const el = stage.current;
    const binEl = bin.current;
    if (!el || !binEl) return;
    let disposed = false;
    let teardown = () => {};

    // Only fetch the physics engine once the footer is close.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        import("matter-js").then((mod) => {
          if (disposed) return;
          teardown = start(mod.default ?? mod, el, binEl, (say) => setBubble((b) => ({ ...say, n: (b?.n ?? 0) + 1 })));
        });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);
    return () => {
      disposed = true;
      near.disconnect();
      teardown();
    };
  }, []);

  return (
    <div className="pile" ref={stage}>
      <div className="pile-copy">
        <p className="eyebrow">Drag them. Throw them. Try the bin.</p>
        <p className="pile-title">
          Nothing good goes
          <br />
          in the bin.
        </p>
      </div>
      <div className="pile-bin" ref={bin} aria-hidden="true">
        <BinArt />
        {bubble && (
          <span className="pile-bubble" key={bubble.n} data-tone={bubble.tone}>
            {bubble.text}
          </span>
        )}
      </div>
      {DEFS.map((def, index) => (
        <div
          key={def.key}
          className="pi"
          data-i={index}
          data-circle={def.shape === "circle" || undefined}
          style={{ width: def.w, height: def.h }}
          aria-hidden="true"
        >
          {def.node}
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

/** Picks the bin's next line: the item's own comeback first, the generic deck after, and a sulk when spammed. */
function lineMaker() {
  let deck: string[] = [];
  let fedUp: string[] = [];
  const heard = new Set<string>();
  let streak = 0;
  let last = 0;
  return (key: string): Say => {
    const now = performance.now();
    streak = now - last < 4500 ? streak + 1 : 0;
    last = now;
    if (streak >= 3) {
      if (!fedUp.length) fedUp = shuffled(FED_UP);
      return { text: fedUp.pop()!, tone: "mad" };
    }
    if (ABOUT[key] && !heard.has(key)) {
      heard.add(key);
      return { text: ABOUT[key], tone: "item" };
    }
    if (!deck.length) deck = shuffled(LINES);
    return { text: deck.pop()! };
  };
}

function start(Matter: typeof MatterNS, el: HTMLElement, binEl: HTMLElement, say: (line: Say) => void) {
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;
  const world = engine.world;
  const nodes = Array.from(el.querySelectorAll<HTMLElement>(".pi"));
  let W = el.clientWidth;
  let H = el.clientHeight;
  // Sizes are fixed at start and follow the footer width; phones get fewer, smaller groceries.
  const k = Math.min(1.22, Math.max(0.7, W / 1100));
  const limit = W < 640 ? 13 : W < 1000 ? 18 : nodes.length;

  // ---- static scenery: floor, side walls, the bin (rebuilt on resize) -------
  const T = 400;
  let statics: MatterNS.Body[] = [];
  let inside = { x0: 0, x1: 0, y0: 0, y1: 0 };

  const layout = () => {
    W = el.clientWidth;
    H = el.clientHeight;
    const bw = binEl.offsetWidth;
    const bh = binEl.offsetHeight;
    const bx = binEl.offsetLeft;
    const by = H - bh;
    const sx = bw / 120;
    const sy = bh / 160;
    const wallH = (146 - 40) * sy;
    const wall = (x: number, y: number, w: number, h: number) => Bodies.rectangle(x, y, w, h, { isStatic: true, friction: 0.6 });
    Composite.remove(world, statics);
    statics = [
      wall(W / 2, H + T / 2, W + T * 2, T),
      wall(-T / 2, H - 2000, T, 4000),
      wall(W + T / 2, H - 2000, T, 4000),
      wall(bx + 18 * sx, by + 40 * sy + wallH / 2, 8, wallH),
      wall(bx + 102 * sx, by + 40 * sy + wallH / 2, 8, wallH),
      wall(bx + 60 * sx, by + 142 * sy, 84 * sx, 8),
    ];
    Composite.add(world, statics);
    inside = { x0: bx + 22 * sx, x1: bx + 98 * sx, y0: by + 44 * sy, y1: by + 146 * sy };
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
    return { key: def.key, node, body, w, h, added: false, binnedAt: 0 };
  });

  const paint = () => {
    for (const it of items) {
      if (!it.added) continue;
      const { x, y } = it.body.position;
      it.node.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(y - it.h / 2).toFixed(1)}px, 0) rotate(${it.body.angle.toFixed(3)}rad)`;
    }
  };

  // ---- the bin refuses ----------------------------------------------------------
  const nextLine = lineMaker();
  const spit = (it: (typeof items)[number]) => {
    Sleeping.set(it.body, false);
    Body.setPosition(it.body, { x: it.body.position.x, y: Math.min(it.body.position.y, inside.y0 + 10) });
    Body.setVelocity(it.body, { x: -(5 + Math.random() * 4), y: -(13 + Math.random() * 3) });
    Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.5);
    binEl.removeAttribute("data-spit");
    void binEl.offsetWidth;
    binEl.setAttribute("data-spit", "");
    say(nextLine(it.key));
  };

  // ---- loop ---------------------------------------------------------------------
  let raf = 0;
  let visible = false;
  let dragging: { body: MatterNS.Body; c: MatterNS.Constraint } | null = null;
  let pending = 0;

  const frame = () => {
    raf = 0;
    Engine.update(engine, 1000 / 60);
    const now = performance.now();
    let awake = pending > 0 || dragging !== null;
    for (const it of items) {
      if (!it.added) continue;
      const b = it.body;
      // Keep things from tunnelling through walls after a wild throw.
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      if (speed > 38) Body.setVelocity(b, { x: (b.velocity.x / speed) * 38, y: (b.velocity.y / speed) * 38 });
      const { x, y } = b.position;
      // Inside the bin, or resting across its mouth: either way the bin refuses it.
      const binned = x > inside.x0 - 14 && x < inside.x1 + 14 && y > inside.y0 - 170 && y < inside.y1;
      if (binned && !it.binnedAt) it.binnedAt = now;
      if (!binned) it.binnedAt = 0;
      if (it.binnedAt && now - it.binnedAt > 320 && !(dragging && dragging.body === b)) {
        it.binnedAt = 0;
        spit(it);
      }
      if (!b.isSleeping || it.binnedAt) awake = true;
    }
    paint();
    if (visible && awake) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  };

  const drop = (it: (typeof items)[number], x: number, y: number) => {
    Body.setPosition(it.body, { x, y });
    Body.setAngle(it.body, (Math.random() - 0.5) * 1.6);
    Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.18);
    Composite.add(world, it.body);
    it.added = true;
    it.node.style.visibility = "visible";
  };

  layout();
  let spawned = false;
  const timers: number[] = [];
  const spawn = () => {
    spawned = true;
    const span = Math.max(80, inside.x0 - 60);
    if (reduce) {
      items.forEach((it, i) => drop(it, 40 + ((i * 97) % span), H - 60 - (i % 4) * 70));
      for (let i = 0; i < 500; i += 1) Engine.update(engine, 1000 / 60);
      paint();
      return;
    }
    items.forEach((it, i) => {
      pending += 1;
      timers.push(
        window.setTimeout(() => {
          pending -= 1;
          drop(it, 40 + Math.random() * span, -it.h - Math.random() * 160);
          kick();
        }, 120 + i * 95),
      );
    });
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !spawned) spawn();
      kick();
    },
    { threshold: 0.2 },
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
      dragging.c.pointA = toWorld(event);
      Sleeping.set(it.body, false);
      kick();
    });
    const release = () => {
      if (!dragging || dragging.body !== it.body) return;
      Composite.remove(world, dragging.c);
      dragging = null;
      delete el.dataset.dragging;
      kick();
    };
    on(it.node, "pointerup", release);
    on(it.node, "pointercancel", release);
    // Safari's click is not a PointerEvent, so remember what pressed it.
    on(it.node, "click", () => {
      if (lastType !== "touch") return;
      Sleeping.set(it.body, false);
      Body.setVelocity(it.body, { x: (Math.random() - 0.5) * 10, y: -(10 + Math.random() * 5) });
      Body.setAngularVelocity(it.body, (Math.random() - 0.5) * 0.45);
      kick();
    });
  });

  return () => {
    cancelAnimationFrame(raf);
    timers.forEach((t) => window.clearTimeout(t));
    io.disconnect();
    ro.disconnect();
    listeners.forEach(([node, type, fn]) => node.removeEventListener(type, fn));
    Composite.clear(world, false);
    Engine.clear(engine);
  };
}
