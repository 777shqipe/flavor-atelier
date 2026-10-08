import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from "react";
import { ImpactArt, MinArt, PayArt, SecondArt, SpeedArt, TrackArt } from "./SupplierArt";
import { TruckScene } from "./TruckScene";
import { CATEGORIES } from "./products";
import { Stamp } from "./Stamp";
import "./suppliers.css";

const STEPS = [
  { title: "Tell us what you've got", text: "A few lines is plenty: what it is, how much, and when it needs to move." },
  { title: "We come back fast", text: "Our buying team gets back to you. Fast decisions, flexible volumes." },
  { title: "Seal it, collect it", text: "Deals can be sealed and stock collected the same day." },
  { title: "Paid upfront", text: "We pay upfront, no delays, and every pallet is tracked door to door." },
] as const;

const BENEFITS = [
  { id: "pay", kicker: "Cash", text: "We pay upfront, no delays.", art: <PayArt /> },
  { id: "speed", kicker: "Speed", text: "Deals can be sealed and stock collected the same day.", art: <SpeedArt /> },
  { id: "track", kicker: "Tracking", text: "Every pallet is tracked door to door.", art: <TrackArt /> },
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
    <section className="how" id="how" data-surface="paper" aria-labelledby="how-title">
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
            <div>
              <h3>{step.title}</h3>
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

const volumeLabel = (v: number) => (v < 34 ? "A few pallets" : v < 67 ? "Half a truck" : "A full truckload");

function QuoteForm() {
  const [values, setValues] = useState({ name: "", company: "", email: "", message: "" });
  const [cats, setCats] = useState<string[]>([]);
  const [volume, setVolume] = useState(30);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [sent, setSent] = useState<string | null>(null);

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Tell us who we’re talking to.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "That email doesn’t look right.";
    setErrors(next);
    if (Object.keys(next).length) return;
    // TODO: POST the enquiry to a real endpoint. Nothing is sent from here yet.
    setSent(values.name.trim().split(" ")[0]);
  };

  const filled = Math.max(1, Math.round((volume / 100) * 12));

  return (
    <section className="quote" id="contact" data-surface="green" aria-labelledby="quote-title">
      <div className="quote-copy rv">
        <p className="eyebrow light">Start a conversation</p>
        <h2 id="quote-title">Good food deserves a second chance.</h2>
        <p className="lead">Tell us what you have and our buying team will get back to you.</p>
        <ul className="quote-points">
          {["Fast decisions", "Flexible volumes", "Paid upfront"].map((point) => (
            <li key={point}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="quote-card rv" data-surface="cream" style={{ "--rv": "120ms" } as CSSProperties}>
        {sent ? (
          <div className="sent" role="status">
            <Stamp on text="Received" sub="Surplus rescue in progress" tone="green" className="sent-stamp" />
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="28" />
              <path d="M19 33l9 9 17-19" />
            </svg>
            <h3>Thanks, {sent}.</h3>
            <p>Your enquiry is noted. Our buying team will be in touch.</p>
            <button className="button outline" type="button" onClick={() => setSent(null)}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="row2">
              <label>
                Name
                <input type="text" value={values.name} onChange={set("name")} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} />
                {errors.name && <em>{errors.name}</em>}
              </label>
              <label>
                Company
                <input type="text" value={values.company} onChange={set("company")} placeholder="Company (optional)" autoComplete="organization" />
              </label>
            </div>
            <label>
              Email address
              <input type="email" value={values.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" aria-invalid={!!errors.email} />
              {errors.email && <em>{errors.email}</em>}
            </label>

            <fieldset>
              <legend>What are you moving?</legend>
              <div className="pick">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={cats.includes(cat.id)}
                    style={{ "--c": cat.color } as CSSProperties}
                    onClick={() => setCats((current) => (current.includes(cat.id) ? current.filter((id) => id !== cat.id) : [...current, cat.id]))}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="volume">
              <label htmlFor="volume">
                How much?
                <b>{volumeLabel(volume)}</b>
              </label>
              <div className="pallet-row" aria-hidden="true">
                {Array.from({ length: 12 }).map((_, i) => (
                  <i key={i} data-on={i < filled || undefined} style={{ "--k": i } as CSSProperties} />
                ))}
              </div>
              <input id="volume" type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-valuetext={volumeLabel(volume)} />
            </div>

            <label>
              Anything else?
              <textarea value={values.message} onChange={set("message")} placeholder="Tell us about your surplus stock" />
            </label>
            <button className="button dark send" type="submit">
              Send enquiry
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

export function SuppliersPage() {
  const toForm = () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main>
      <section className="page-hero" data-surface="green" aria-labelledby="suppliers-title">
        <div className="aurora" aria-hidden="true" />
        <div className="page-hero-inner">
          <header className="page-head">
            <p className="eyebrow light">For suppliers</p>
            <h1 id="suppliers-title">
              Surplus stock?
              <br />
              Let’s make it useful.
            </h1>
            <p className="lead">Fast decisions, flexible volumes and a better outcome for good food.</p>
            <div className="hero-actions">
              <button className="button cream" type="button" onClick={toForm}>
                Get a quote
              </button>
              <a className="text-link" href="#how" onClick={(event) => {
                event.preventDefault();
                document.getElementById("how")?.scrollIntoView({ behavior: "smooth" });
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

      <HowItWorks />
      <Bento />
      <QuoteForm />
    </main>
  );
}
