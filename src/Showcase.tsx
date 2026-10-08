import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import type { Page } from "./Header";
import "./showcase.css";

type Scene = "crav" | "bucks" | "cookie";

type Product = {
  id: string;
  scene: Scene;
  tone: "dark" | "light";
  brand: string;
  name: string;
  price: string;
  unit: string;
  src: string;
  w: number;
  h: number;
  alt: string;
};

const PRODUCTS: Product[] = [
  {
    id: "sanpellegrino",
    scene: "crav",
    tone: "light",
    brand: "Sanpellegrino",
    name: "Aranciata Rossa",
    price: "$4",
    unit: "4 × 330ml",
    src: "/media/sanpellegrino-cut.webp",
    w: 723,
    h: 827,
    alt: "Four-pack of Sanpellegrino Aranciata Rossa",
  },
  {
    id: "shin",
    scene: "bucks",
    tone: "dark",
    brand: "Nongshim",
    name: "Shin Ramyun Black",
    price: "$4",
    unit: "4 pack",
    src: "/media/shin-cut.webp",
    w: 840,
    h: 899,
    alt: "Pack of Shin Ramyun Black instant noodles",
  },
  {
    id: "milka",
    scene: "cookie",
    tone: "light",
    brand: "Milka × Lotus",
    name: "Milka Biscoff",
    price: "$2",
    unit: "Limited",
    src: "/media/milka-cut.webp",
    w: 822,
    h: 345,
    alt: "Milka Biscoff chocolate bar",
  },
];

const TOTAL = String(PRODUCTS.length).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

type From = "up" | "down" | "pop" | "left" | "right" | "drop";

/**
 * One animated layer. Three nested elements keep the three kinds of motion
 * from fighting over the same property: pointer parallax on the outside,
 * the entrance in the middle, the idle float on the inside.
 */
function Layer({
  className = "",
  depth = 0,
  delay = 0,
  from = "up",
  float,
  phase = 0,
  children,
}: {
  className?: string;
  depth?: number;
  delay?: number;
  from?: From;
  float?: number;
  phase?: number;
  children: ReactNode;
}) {
  return (
    <div className={`ly ${className}`} style={{ "--depth": depth } as CSSProperties}>
      <div className="ly-ent" data-from={from} style={{ "--delay": `${delay}ms` } as CSSProperties}>
        <div
          className={float ? "ly-float" : undefined}
          style={float ? ({ "--float": `${float}s`, "--phase": `${phase}s` } as CSSProperties) : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Slabs stacked like the ribbons in the cookie reference. */
function Ribbon({ tone, lines, className = "" }: { tone: string; lines: string[]; className?: string }) {
  return (
    <div className={`ribbon ${className}`} data-tone={tone}>
      {lines.map((line, index) => (
        <span key={line} style={{ "--k": index } as CSSProperties}>
          {line}
        </span>
      ))}
    </div>
  );
}

function Counter({ index }: { index: number }) {
  return (
    <span className="counter">
      {String(index + 1).padStart(2, "0")}
      <i>/</i>
      {TOTAL}
    </span>
  );
}

function Eyes() {
  return (
    <div className="eyes" aria-hidden="true">
      <span className="eye">
        <i />
      </span>
      <span className="eye">
        <i />
      </span>
    </div>
  );
}

function Chili({ className = "" }: { className?: string }) {
  return (
    <svg className={`chili ${className}`} viewBox="0 0 120 120" aria-hidden="true">
      <path
        d="M22 38C16 26 26 12 42 14c8 1 12 7 20 17 12 15 30 30 50 39 6 3 5 11-2 12-26 3-54-4-70-26-8-9-14-12-18-18z"
        fill="#E02E1B"
      />
      <path d="M30 22c9-6 19-1 24 6-9-3-17-1-24 6-4-3-3-9 0-12z" fill="#FF7155" opacity=".75" />
      <path d="M26 20c-4-6-2-14 4-18 3 3 4 8 2 12 5-1 9 1 12 4-6 0-12 1-18 2z" fill="#2F9E44" />
      <g transform="rotate(30 56 52)">
        <rect x="31" y="42" width="20" height="14" rx="5" fill="#121212" />
        <rect x="55" y="42" width="20" height="14" rx="5" fill="#121212" />
        <path d="M51 47h4" stroke="#121212" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 46l5-2M60 46l5-2" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".85" />
        <path d="M44 66c4 8 14 8 18 0z" fill="#FF5C8A" stroke="#121212" strokeWidth="2.4" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 6c2 8 10 10 10 20a10 10 0 0 1-20 0c0-5 3-7 4-11 2 2 3 3 4 5 1-5 1-9 2-14z" />
    </svg>
  );
}
function Medal() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 6l5.5 12 12.5 1.5-9.2 8.5 2.7 13L24 34.5 12.5 41l2.7-13L6 19.5 18.5 18z" />
    </svg>
  );
}
function Pack() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="7" y="7" width="15" height="15" rx="3.5" />
      <rect x="26" y="7" width="15" height="15" rx="3.5" />
      <rect x="7" y="26" width="15" height="15" rx="3.5" />
      <rect x="26" y="26" width="15" height="15" rx="3.5" />
    </svg>
  );
}
function Pot() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M10 21h28v11a8 8 0 0 1-8 8H18a8 8 0 0 1-8-8zM6 21h36M17 15c0-3 3-3 3-7M27 15c0-3 3-3 3-7" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

function Crav({ p, index }: { p: Product; index: number }) {
  return (
    <>
      <div className="a-card" />
      <div className="a-flag left" />
      <div className="a-flag right" />
      <i className="a-dash d1" />
      <i className="a-dash d2" />
      <i className="a-dash d3" />

      <Layer className="a-logo-ly" from="left" delay={120}>
        <span className="outlined a-logo">
          CBM
        </span>
      </Layer>
      <Layer className="a-pills-ly" from="right" delay={160}>
        <div className="a-pills">
          <span className="pill red">{p.brand}</span>
          <span className="pill ghost">
            <Counter index={index} />
          </span>
        </div>
      </Layer>

      <Layer className="a-word-ly" depth={-0.8} delay={0} from="up">
        <span className="outlined a-word" aria-hidden="true">
          ARANCIATA
        </span>
      </Layer>

      <Layer className="a-prod-ly" depth={1.4} delay={260} from="drop" float={6.5}>
        <div className="a-prod" style={{ aspectRatio: `${p.w} / ${p.h}` }}>
          <img src={p.src} alt={p.alt} width={p.w} height={p.h} draggable={false} />
          <Eyes />
        </div>
      </Layer>

      <Layer className="a-rossa-ly" depth={2.2} delay={480} from="pop">
        <span className="outlined a-rossa" aria-hidden="true">
          ROSSA
        </span>
      </Layer>

      <Layer className="a-st1-ly" depth={3} delay={620} from="pop" float={4.2}>
        <span className="outlined a-sticker s1">
          <b>BLOOD</b>
          <b>ORANGE</b>
        </span>
      </Layer>
      <Layer className="a-st2-ly" depth={3.4} delay={720} from="pop" float={4.8} phase={-1.4}>
        <span className="outlined a-sticker s2">
          <b>FIZZ</b>
          <b>ALERT</b>
        </span>
      </Layer>

      <Layer className="a-burst-ly" depth={2.6} delay={820} from="pop" float={5} phase={-2}>
        <div className="burst">
          <strong>{p.price}</strong>
          <span>{p.unit}</span>
        </div>
      </Layer>

      <Layer className="a-cap-ly left" delay={560} from="up">
        <p className="cap">
          Four cans of Italian sunshine for four bucks. That’s a dollar a can — do the maths.
        </p>
      </Layer>
      <Layer className="a-cap-ly right" delay={640} from="up">
        <p className="cap">Made with Italian oranges and bottled with zero apologies since 1932.</p>
      </Layer>
    </>
  );
}

function Bucks({ p, index, onNavigate }: { p: Product; index: number; onNavigate: (page: Page) => void }) {
  return (
    <>
      <div className="b-left">
        <i className="b-kanji" aria-hidden="true" />
        <Layer className="b-mark-ly" from="left" delay={100}>
          <span className="b-mark">CBM</span>
        </Layer>
        <Layer className="b-prod-ly" depth={1.6} delay={200} from="drop" float={7}>
          <img
            className="b-prod"
            src={p.src}
            alt={p.alt}
            width={p.w}
            height={p.h}
            style={{ aspectRatio: `${p.w} / ${p.h}` }}
            draggable={false}
          />
        </Layer>
        <Layer className="b-chili-ly c1" depth={3.4} delay={560} from="pop" float={5} phase={-1}>
          <Chili />
        </Layer>
        <Layer className="b-chili-ly c2" depth={2.6} delay={680} from="pop" float={6} phase={-3}>
          <Chili />
        </Layer>
        <Layer className="b-chili-ly c3" depth={4} delay={800} from="pop" float={4.4} phase={-2}>
          <Chili />
        </Layer>
        <Layer className="b-chip-ly" delay={700} from="up">
          <span className="b-chip">Gourmet spicy</span>
        </Layer>
      </div>

      <div className="b-right">
        <Layer className="b-top-ly" delay={100} from="down">
          <div className="b-top">
            <span>{p.brand}</span>
            <span className="pill ghost">
              <Counter index={index} />
            </span>
          </div>
        </Layer>

        <Layer className="b-title-ly" depth={-0.6} delay={150} from="up">
          <p className="b-title" aria-hidden="true">
            <span>SHIN</span>
            <span>RAMYUN</span>
            <span>BLACK</span>
          </p>
        </Layer>
        <Layer className="b-mascot-ly" depth={2.4} delay={520} from="pop" float={5.2}>
          <Chili className="b-mascot" />
        </Layer>
        <Layer className="b-sub-ly" delay={420} from="up">
          <p className="b-sub">Meet the noodles that make Tuesday less sad.</p>
        </Layer>

        <Layer className="b-cards-ly" delay={500} from="up">
          <div className="b-cards">
            <section className="b-card">
              <h4>Taste profile</h4>
              <ul>
                <li>Rich, savoury broth leads</li>
                <li>Chilli heat creeps up slowly</li>
                <li>Springy noodles, serious comfort</li>
                <li>Gourmet spicy, not scary</li>
              </ul>
            </section>
            <section className="b-card">
              <h4>Pairs with</h4>
              <p>
                Soft-boiled egg, spring onion, kimchi, a slice of cheese (trust us), leftover roast chicken, crispy
                shallots and a very long weekend.
              </p>
            </section>
          </div>
        </Layer>

        <Layer className="b-bottom-ly" delay={640} from="up">
          <div className="b-bottom">
            <ul className="b-icons">
              <li>
                <Flame />
                <span>Gourmet spicy</span>
              </li>
              <li>
                <Medal />
                <span>Premium</span>
              </li>
              <li>
                <Pack />
                <span>4 pack</span>
              </li>
              <li>
                <Pot />
                <span>One pot</span>
              </li>
            </ul>
            <button className="b-cta" type="button" onClick={() => onNavigate("stores")}>
              <span>Find it in store</span>
              <strong>
                {p.price}
                <small>a dollar a bowl</small>
              </strong>
            </button>
          </div>
        </Layer>
      </div>
    </>
  );
}

function Cookie({ p, index, onNavigate }: { p: Product; index: number; onNavigate: (page: Page) => void }) {
  return (
    <>
      <div className="c-floor" />

      <Layer className="c-top-ly" delay={80} from="down">
        <div className="c-top">
          <span>{p.brand} Biscoff</span>
          <strong>#ChocolateMeetsBiscuit</strong>
          <span className="pill ghost">
            <Counter index={index} />
          </span>
        </div>
      </Layer>

      <Layer className="c-disc-ly" depth={0.6} delay={0} from="pop">
        <div className="c-disc" />
      </Layer>
      <Layer className="c-milka-ly" depth={-1} delay={160} from="left">
        <span className="c-type" aria-hidden="true">
          MILKA
        </span>
      </Layer>
      <Layer className="c-biscoff-ly" depth={-1} delay={220} from="right">
        <span className="c-type" aria-hidden="true">
          BISCOFF
        </span>
      </Layer>

      <Layer className="c-bar-ly" depth={1.6} delay={340} from="drop" float={6.2}>
        <img
          className="c-bar"
          src={p.src}
          alt={p.alt}
          width={p.w}
          height={p.h}
          style={{ aspectRatio: `${p.w} / ${p.h}` }}
          draggable={false}
        />
      </Layer>

      <Layer className="c-crumb-ly k1" depth={3} delay={700} from="pop" float={3.6}>
        <i className="crumb" />
      </Layer>
      <Layer className="c-crumb-ly k2" depth={4} delay={760} from="pop" float={4.4} phase={-1}>
        <i className="crumb" />
      </Layer>
      <Layer className="c-crumb-ly k3" depth={2} delay={820} from="pop" float={3.2} phase={-2}>
        <i className="crumb" />
      </Layer>
      <Layer className="c-crumb-ly k4" depth={3.5} delay={880} from="pop" float={5} phase={-0.5}>
        <i className="crumb" />
      </Layer>
      <Layer className="c-crumb-ly k5" depth={2.5} delay={940} from="pop" float={4} phase={-3}>
        <i className="crumb" />
      </Layer>

      <Layer className="c-rb1-ly" depth={3.2} delay={560} from="pop" float={5} phase={-1}>
        <Ribbon tone="blue" lines={["BISCUIT", "INSIDE"]} />
      </Layer>
      <Layer className="c-rb2-ly" depth={3.8} delay={640} from="pop" float={5.6} phase={-2.5}>
        <Ribbon tone="pink" lines={["LIMITED", "RUN"]} />
      </Layer>
      <Layer className="c-rb3-ly" depth={3.4} delay={720} from="pop" float={4.6} phase={-0.4}>
        <Ribbon tone="orange" className="price" lines={["ONLY", p.price]} />
      </Layer>
      <Layer className="c-rb4-ly" depth={4.2} delay={800} from="pop" float={5.2} phase={-3.2}>
        <Ribbon tone="teal" lines={["SHARING", "OPTIONAL"]} />
      </Layer>

      <Layer className="c-foot-ly left" delay={500} from="up">
        <p className="c-def">
          <b>/bis·koff/</b> (noun)
          <br />a biscuit with chocolate ambitions.
        </p>
      </Layer>
      <Layer className="c-foot-ly mid" delay={560} from="up">
        <p className="c-blurb">Chocolate met a biscuit. It was serious. Grab one before they’re gone.</p>
      </Layer>
      <Layer className="c-foot-ly right" delay={620} from="up">
        <button className="c-link" type="button" onClick={() => onNavigate("stores")}>
          Find a store <span aria-hidden="true">↓</span>
        </button>
      </Layer>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Stack: reveal, pointer parallax and the "cards pile up" effect       */
/* ------------------------------------------------------------------ */

function useStack(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const items = Array.from(node.querySelectorAll<HTMLElement>(".stack-item"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    // Entrance: each poster plays once, the first time it is mostly on screen.
    if (reduced) {
      items.forEach((item) => item.setAttribute("data-in", ""));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.setAttribute("data-in", "");
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.3 },
      );
      items.forEach((item) => io.observe(item));
      cleanups.push(() => io.disconnect());
    }

    // Earlier posters sink back as the next one slides over them.
    let frame = 0;
    const update = () => {
      frame = 0;
      items.forEach((item, i) => {
        const next = items[i + 1];
        let cover = 0;
        if (next && getComputedStyle(item).position === "sticky") {
          const a = item.getBoundingClientRect();
          const b = next.getBoundingClientRect();
          cover = Math.min(1, Math.max(0, 1 - (b.top - a.top - 14) / a.height));
        }
        item.style.setProperty("--cover", cover.toFixed(3));
      });
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    cleanups.push(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    });

    // Pointer parallax, smoothed in a rAF loop that only runs while it has work to do.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine && !reduced) {
      items.forEach((item) => {
        const poster = item.querySelector<HTMLElement>(".poster");
        if (!poster) return;
        let tx = 0;
        let ty = 0;
        let cx = 0;
        let cy = 0;
        let raf = 0;
        const tick = () => {
          cx += (tx - cx) * 0.08;
          cy += (ty - cy) * 0.08;
          poster.style.setProperty("--mx", cx.toFixed(4));
          poster.style.setProperty("--my", cy.toFixed(4));
          raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(tick) : 0;
        };
        const kick = () => {
          if (!raf) raf = requestAnimationFrame(tick);
        };
        const move = (event: PointerEvent) => {
          const r = poster.getBoundingClientRect();
          tx = ((event.clientX - r.left) / r.width - 0.5) * 2;
          ty = ((event.clientY - r.top) / r.height - 0.5) * 2;
          kick();
        };
        const leave = () => {
          tx = 0;
          ty = 0;
          kick();
        };
        poster.addEventListener("pointermove", move);
        poster.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          cancelAnimationFrame(raf);
          poster.removeEventListener("pointermove", move);
          poster.removeEventListener("pointerleave", leave);
        });
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [root]);
}

export function Showcase({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const root = useRef<HTMLDivElement>(null);
  useStack(root);

  return (
    <div className="stack" ref={root}>
      {PRODUCTS.map((p, index) => (
        <div
          className="stack-item"
          key={p.id}
          data-tone={p.tone}
          style={{ "--n": index } as CSSProperties}
        >
          <article className="poster" data-scene={p.scene} aria-labelledby={`poster-${p.id}`}>
            <h3 className="sr-only" id={`poster-${p.id}`}>
              {p.brand} {p.name}, {p.price} — {p.unit}
            </h3>
            {p.scene === "crav" && <Crav p={p} index={index} />}
            {p.scene === "bucks" && <Bucks p={p} index={index} onNavigate={onNavigate} />}
            {p.scene === "cookie" && <Cookie p={p} index={index} onNavigate={onNavigate} />}
            <div className="poster-dim" />
          </article>
        </div>
      ))}
    </div>
  );
}
