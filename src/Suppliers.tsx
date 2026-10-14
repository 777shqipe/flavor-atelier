import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Mix } from "./Mix";
import { ImpactArt, MinArt, SecondArt } from "./SupplierArt";
import { TruckScene } from "./TruckScene";
import "./suppliers.css";

const STEPS = [
  {
    title: "Tell us what you've got",
    tag: "2 min",
    text: "A few lines is plenty: what it is, how much, and when it needs to move.",
  },
  {
    title: "We come back fast",
    tag: "Same day",
    text: "Our buying team gets back to you. Fast decisions, flexible volumes.",
  },
  {
    title: "Seal it, collect it",
    tag: "Door to door",
    text: "Deals can be sealed and stock collected the same day.",
  },
  {
    title: "Paid upfront",
    tag: "100% upfront",
    text: "We pay upfront, no delays, and every pallet is tracked door to door.",
  },
] as const;

/** Payment, speed and tracking are already in the steps, so the bento keeps what they don't say. */
const BENEFITS = [
  { id: "second", kicker: "Second life", text: "Your surplus gets a second life instead of a skip bin.", art: <SecondArt /> },
  { id: "min", kicker: "Any size", text: "No minimum order size, from a few pallets to a full truckload.", art: <MinArt /> },
  { id: "waste", kicker: "Impact", text: "Every sale means less good food thrown away.", art: <ImpactArt /> },
];

const BUYS = ["Close-to-date", "Past best-before", "Surplus stock", "A few pallets", "A full truckload"];

/** Fills the line between the steps as the list scrolls through the viewport. */
function HowItWorks() {
  const list = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = list.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      const reach = window.innerHeight * 0.62 - box.top;
      setProgress(Math.min(1, Math.max(0, reach / box.height)));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, []);

  return (
    <section className="how" data-surface="paper" aria-labelledby="how-title">
      <header className="section-head how-head rv">
        <p className="eyebrow">Simple from start to finish</p>
        <h2 id="how-title">A deal that works for everyone.</h2>
        <p className="lead">Four steps from “we have too much” to “it’s gone, thank you”.</p>
      </header>
      <ol className="steps" ref={list} style={{ "--prog": progress } as CSSProperties}>
        <span className="steps-line" aria-hidden="true">
          <i />
        </span>
        {STEPS.map((step, index) => (
          <li key={step.title} className="step" data-on={progress >= index / (STEPS.length - 0.6) || undefined}>
            <span className="step-num">0{index + 1}</span>
            <div className="step-card">
              <div className="step-top">
                <h3>{step.title}</h3>
                <span className="step-tag">{step.tag}</span>
              </div>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Tile({ item, index }: { item: (typeof BENEFITS)[number]; index: number }) {
  const ref = useRef<HTMLElement>(null);
  // Tilts towards the pointer and drags a soft glare across the surface.
  const move = (event: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse") return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    el.style.setProperty("--tx", ((x - 0.5) * 2).toFixed(3));
    el.style.setProperty("--ty", ((y - 0.5) * 2).toFixed(3));
    el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--glare", "1");
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    ["--tx", "--ty"].forEach((name) => el.style.setProperty(name, "0"));
    el.style.setProperty("--glare", "0");
  };

  return (
    <article
      ref={ref}
      className={`tile t-${item.id} rv`}
      style={{ "--rv": `${index * 70}ms` } as CSSProperties}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      <p className="tile-kicker">
        <span>0{index + 1}</span> {item.kicker}
      </p>
      <div className="tile-art" aria-hidden="true">
        {item.art}
      </div>
      <h3>{item.text}</h3>
    </article>
  );
}

function Bento() {
  return (
    <section className="bento-wrap" data-surface="deep" aria-labelledby="bento-title">
      <header className="section-head rv">
        <p className="eyebrow">Why suppliers choose us</p>
        <h2 id="bento-title">Good for your stock. Good for the planet.</h2>
      </header>
      <div className="bento">
        {BENEFITS.map((item, index) => (
          <Tile key={item.id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

/** The supplier half of About: the pitch, what we buy, then how it works or why us. */
export function Suppliers({ onContact }: { onContact: () => void }) {
  return (
    <>
      <section className="page-hero sp-hero" id="suppliers" data-surface="green" aria-labelledby="suppliers-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">For suppliers</p>
            <h2 id="suppliers-title">
              Surplus stock?
              <br />
              Let’s make it useful.
            </h2>
            <p className="lead">Fast decisions, flexible volumes and a better outcome for good food.</p>
            <div className="hero-actions">
              <button className="button cream" type="button" onClick={onContact}>
                Get a quote
              </button>
              <a className="text-link" href="#supply" onClick={(event) => {
                event.preventDefault();
                document.getElementById("supply")?.scrollIntoView({ behavior: "smooth" });
              }}>
                How it works <span>↓</span>
              </a>
            </div>
          </header>
          <TruckScene />
        </div>
      </section>

      <div className="marquee" data-surface="cream" aria-label="What we buy">
        <div className="marquee-track" aria-hidden="true">
          {[0, 1].map((copy) => (
            <div key={copy}>
              {BUYS.map((item) => (
                <span key={item}>
                  {item}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Mix
        id="supply"
        label="Working with us"
        tabs={[
          { id: "how", label: "How it works", render: () => <HowItWorks /> },
          { id: "why", label: "Why us", render: () => <Bento /> },
        ]}
      />
    </>
  );
}
