import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { CATEGORIES } from "./products";
import { Stamp } from "./Stamp";
import { STORES } from "./stores";
import "./contact.css";

/**
 * Contact, as a side panel. A shop awning unrolls, then a clipboard slides up
 * holding a docket. Pick what it's about and the "To" line re-stamps itself.
 * Sending stamps the docket, tears it off the pad and leaves your yellow carbon
 * copy behind on the clip.
 */

export type Topic = "stock" | "shop" | "other";

const TOPICS: Array<{ id: Topic; label: string; desk: string; placeholder: string }> = [
  { id: "stock", label: "Surplus stock", desk: "Buying team", placeholder: "What is it, how much, and when does it need to move?" },
  { id: "shop", label: "Shopping", desk: "Store team", placeholder: "A product, a store, something you bought…" },
  { id: "other", label: "Something else", desk: "Head office", placeholder: "Press, partnerships or just a kind word" },
];

const DATE = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

const volumeLabel = (v: number) => (v < 34 ? "A few pallets" : v < 67 ? "Half a truck" : "A full truckload");

type Phase = "idle" | "stamp" | "tear" | "copy";
type Sent = { number: number; desk: string; name: string; email: string; re: string };

function TopicIcon({ id }: { id: Topic }) {
  const line = { stroke: "#141414", strokeWidth: 2, strokeLinejoin: "round", strokeLinecap: "round" } as const;
  if (id === "stock") {
    return (
      <svg viewBox="0 0 48 40" aria-hidden="true">
        <rect x="7" y="17" width="16" height="15" rx="1.5" fill="#d8b37a" {...line} />
        <rect x="25" y="17" width="16" height="15" rx="1.5" fill="#e0a458" {...line} />
        <rect x="15" y="3" width="17" height="14" rx="1.5" fill="#c79c5f" {...line} />
        <path d="M15 22h8M25 22h16M15 8h17" stroke="#141414" strokeWidth="1.4" opacity="0.5" />
        <rect x="4" y="32" width="40" height="4" rx="1" fill="#a87c45" {...line} />
        <path d="M7 36v2.5M24 36v2.5M41 36v2.5" {...line} />
      </svg>
    );
  }
  if (id === "shop") {
    return (
      <svg viewBox="0 0 48 40" aria-hidden="true">
        <path d="M12 18c0-13 24-13 24 0" fill="none" {...line} strokeWidth={2.6} />
        <circle cx="18" cy="15" r="6.5" fill="#e3261b" {...line} />
        <path d="M25 17c-2-8 5-11 8-6 3-5 9-2 6 6z" fill="#5fae5a" {...line} />
        <path d="M5 17h38l-4.5 19h-29z" fill="#f6f0db" {...line} />
        <path d="M14 22l1.5 10M24 22v10M34 22l-1.5 10" stroke="#141414" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 40" aria-hidden="true">
      <path d="M7 5h34a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H22l-9 7v-7H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" fill="#fffaf0" {...line} />
      <text x="24" y="23.5" textAnchor="middle" fill="#005842" fontFamily="Anton, sans-serif" fontSize="14" letterSpacing="0.5">
        HI!
      </text>
    </svg>
  );
}

/** Bulldog clip, sticker style. */
export function Clip({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 132 64" aria-hidden="true">
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M34 34C30 4 102 4 98 34" fill="none" stroke="#141414" strokeWidth="5" />
        <path d="M34 34C30 4 102 4 98 34" fill="none" stroke="#dfe5e1" strokeWidth="2" />
        <path d="M12 30h108l-7 26a5 5 0 0 1-5 4H24a5 5 0 0 1-5-4z" fill="#b9c3bd" stroke="#141414" strokeWidth="2.6" />
        <path d="M20 36h92" stroke="#fff" strokeWidth="3" opacity="0.7" />
        <path d="M24 52h84" stroke="#7d8a83" strokeWidth="2" opacity="0.6" />
        <circle cx="26" cy="44" r="3" fill="#7d8a83" stroke="#141414" strokeWidth="1.6" />
        <circle cx="106" cy="44" r="3" fill="#7d8a83" stroke="#141414" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

export function ContactPanel({
  open,
  topic,
  onTopic,
  onClose,
}: {
  open: boolean;
  topic: Topic;
  onTopic: (topic: Topic) => void;
  onClose: () => void;
}) {
  const panel = useRef<HTMLElement>(null);
  const copyHead = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState({ name: "", company: "", email: "", message: "" });
  const [cats, setCats] = useState<string[]>([]);
  const [store, setStore] = useState<string | null>(null);
  const [volume, setVolume] = useState(30);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [shake, setShake] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [number, setNumber] = useState(() => 4200 + Math.floor(Math.random() * 600));
  const [sent, setSent] = useState<Sent | null>(null);

  const current = TOPICS.find((item) => item.id === topic) ?? TOPICS[0];
  const first = values.name.trim().split(/\s+/)[0];

  // A fresh sheet on the pad: keep who you are, clear what you said.
  const fresh = useCallback(() => {
    setValues((v) => ({ ...v, message: "" }));
    setCats([]);
    setStore(null);
    setErrors({});
    setNumber((n) => n + 1);
    setPhase("idle");
  }, []);

  // Open: lock the page, focus the panel, Escape closes. Close: focus goes back.
  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    root.classList.add("ct-lock");
    const focus = window.setTimeout(() => panel.current?.focus({ preventScroll: true }), 80);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focus);
      root.classList.remove("ct-lock");
      window.removeEventListener("keydown", onKey);
      back?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  // Stamp, then tear, then the carbon copy.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (phase === "stamp") {
      const t = window.setTimeout(() => setPhase("tear"), reduce ? 400 : 780);
      return () => window.clearTimeout(t);
    }
    if (phase === "tear") {
      const t = window.setTimeout(() => setPhase("copy"), reduce ? 0 : 1000);
      return () => window.clearTimeout(t);
    }
    if (phase === "copy") copyHead.current?.focus({ preventScroll: true });
  }, [phase]);

  // Closed with a copy showing: next time it opens on a fresh sheet.
  useEffect(() => {
    if (open || phase !== "copy") return;
    const t = window.setTimeout(fresh, 700);
    return () => window.clearTimeout(t);
  }, [open, phase, fresh]);

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: event.target.value }));
    // the red line goes as soon as you start fixing it
    if ((key === "name" || key === "email") && errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const pickTopic = (next: Topic) => {
    if (phase === "stamp" || phase === "tear") return;
    if (phase === "copy") fresh();
    onTopic(next);
  };
  const onTopicKey = (event: KeyboardEvent) => {
    const i = TOPICS.findIndex((item) => item.id === topic);
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (i + step + TOPICS.length) % TOPICS.length;
    pickTopic(TOPICS[next].id);
    event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (phase !== "idle") return;
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Tell us who we’re talking to.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "That email doesn’t look right.";
    setErrors(next);
    if (Object.keys(next).length) {
      setShake((n) => n + 1);
      return;
    }
    const re =
      topic === "stock"
        ? [cats.length ? cats.map((id) => CATEGORIES.find((c) => c.id === id)?.label).join(", ") : "Mixed stock", volumeLabel(volume)].join(" · ")
        : topic === "shop"
          ? store
            ? `${STORES.find((s) => s.id === store)?.name} store`
            : "Any store"
          : values.company.trim() || "General";
    // TODO: POST the enquiry to a real endpoint. Nothing is sent from here yet.
    setSent({ number, desk: current.desk, name: values.name.trim(), email: values.email.trim(), re });
    setPhase("stamp");
  };

  const again = () => {
    fresh();
    window.requestAnimationFrame(() => nameInput.current?.focus({ preventScroll: true }));
  };

  const filled = Math.max(1, Math.round((volume / 100) * 12));
  const words = ["Drop", "us", "a"];

  return (
    <div className="ct" data-open={open || undefined}>
      <div className="ct-scrim" aria-hidden="true" onClick={onClose} />
      <aside className="ct-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="ct-title" tabIndex={-1}>
        <span className="ct-awning" aria-hidden="true" />

        <header className="ct-head">
          <p className="ct-eyebrow">Contact us</p>
          <button className="ct-close" type="button" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <h2 id="ct-title" className="ct-title">
            {words.map((word, i) => (
              <span key={word}>
                <span className="ct-word" style={{ "--i": i } as CSSProperties}>
                  <span>{word}</span>
                </span>{" "}
              </span>
            ))}
            <span className="ct-word" style={{ "--i": words.length } as CSSProperties}>
              <em>docket.</em>
            </span>
          </h2>
          <p className="ct-lead">Pick what it’s about and it lands on the right desk.</p>
        </header>

        <div className="ct-topics" role="radiogroup" aria-label="What’s it about?" onKeyDown={onTopicKey}>
          {TOPICS.map((item, i) => (
            <button
              key={item.id}
              className="ct-topic"
              type="button"
              role="radio"
              aria-checked={item.id === topic}
              tabIndex={item.id === topic ? 0 : -1}
              style={{ "--i": i } as CSSProperties}
              onClick={() => pickTopic(item.id)}
            >
              <TopicIcon id={item.id} />
              <b>{item.label}</b>
              <small>To {item.desk}</small>
            </button>
          ))}
        </div>

        <div className="ct-board">
          <Clip className="ct-clip" />
          <span className="ct-stub" aria-hidden="true">
            CBM · Docket book
          </span>
          <div className="ct-pad" data-phase={phase}>
            {/* the yellow carbon copy underneath; it only says something once a docket is sent */}
            <div className="ct-copy" inert={phase !== "copy"}>
              {sent && (
                <>
                  <p className="ct-copy-kicker">
                    Your copy <span>Nº {sent.number}</span>
                  </p>
                  <h3 ref={copyHead} tabIndex={-1}>
                    Thanks, {sent.name.split(/\s+/)[0]}.
                  </h3>
                  <dl>
                    <div>
                      <dt>To</dt>
                      <dd>{sent.desk}</dd>
                    </div>
                    <div>
                      <dt>From</dt>
                      <dd>{sent.name}</dd>
                    </div>
                    <div>
                      <dt>Re</dt>
                      <dd>{sent.re}</dd>
                    </div>
                    <div>
                      <dt>Reply to</dt>
                      <dd>{sent.email}</dd>
                    </div>
                  </dl>
                  <p className="ct-copy-note">It’s on the {sent.desk.toLowerCase()}’s desk now. Keep this copy, we’ll do the rest.</p>
                  <div className="ct-copy-actions">
                    <button className="ct-btn" type="button" onClick={again}>
                      New docket
                    </button>
                    <button className="ct-btn ghost" type="button" onClick={onClose}>
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>

            {phase !== "copy" && (
              <form
                key={number}
                className="ct-sheet"
                data-phase={phase}
                data-shake={shake ? (shake % 2 ? "a" : "b") : undefined}
                onSubmit={submit}
                noValidate
              >
                <div className="ct-dhead">
                  <b className="ct-dword">Docket</b>
                  <span className="ct-dno">Nº {number}</span>
                  <span className="ct-ddate">{DATE}</span>
                </div>
                <p className="ct-to">
                  <span>To</span>
                  <b key={topic}>{current.desk}</b>
                </p>

                <label className="ct-field" style={{ "--i": 0 } as CSSProperties}>
                  <span>From</span>
                  <span className="ct-line">
                    <input ref={nameInput} type="text" value={values.name} onChange={set("name")} placeholder="Your name" autoComplete="name" aria-invalid={!!errors.name} />
                  </span>
                  {errors.name && <em className="ct-err">{errors.name}</em>}
                </label>
                {topic !== "shop" && (
                  <label className="ct-field" style={{ "--i": 1 } as CSSProperties}>
                    <span>Company</span>
                    <span className="ct-line">
                      <input type="text" value={values.company} onChange={set("company")} placeholder="Optional" autoComplete="organization" />
                    </span>
                  </label>
                )}
                <label className="ct-field" style={{ "--i": 2 } as CSSProperties}>
                  <span>Email</span>
                  <span className="ct-line">
                    <input type="email" value={values.email} onChange={set("email")} placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} />
                  </span>
                  {errors.email && <em className="ct-err">{errors.email}</em>}
                </label>

                <div className="ct-extra" key={topic}>
                  {topic === "stock" && (
                    <>
                      <fieldset className="ct-set">
                        <legend>On the pallet</legend>
                        <div className="ct-chips">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              className="ct-chip"
                              aria-pressed={cats.includes(cat.id)}
                              style={{ "--c": cat.color } as CSSProperties}
                              onClick={() => setCats((list) => (list.includes(cat.id) ? list.filter((id) => id !== cat.id) : [...list, cat.id]))}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                      <div className="ct-vol">
                        <label htmlFor="ct-volume">
                          How much <b>{volumeLabel(volume)}</b>
                        </label>
                        <div className="ct-pallets" aria-hidden="true">
                          {Array.from({ length: 12 }, (_, i) => (
                            <i key={i} data-on={i < filled || undefined} style={{ "--k": i } as CSSProperties} />
                          ))}
                        </div>
                        <input id="ct-volume" type="range" min={0} max={100} value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-valuetext={volumeLabel(volume)} />
                      </div>
                    </>
                  )}
                  {topic === "shop" && (
                    <fieldset className="ct-set">
                      <legend>Which store</legend>
                      <div className="ct-chips">
                        {STORES.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            className="ct-chip"
                            aria-pressed={store === s.id}
                            style={{ "--c": s.color } as CSSProperties}
                            onClick={() => setStore((id) => (id === s.id ? null : s.id))}
                          >
                            <i aria-hidden="true" />
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  )}
                </div>

                <label className="ct-field ct-msg" style={{ "--i": 3 } as CSSProperties}>
                  <span>Note</span>
                  <textarea value={values.message} onChange={set("message")} placeholder={current.placeholder} rows={3} />
                </label>

                <div className="ct-send-row">
                  <p className="ct-sign">
                    Signed
                    <span>{first || " "}</span>
                  </p>
                  <button className="ct-send" type="submit">
                    Send docket
                    <i aria-hidden="true">
                      <svg viewBox="0 0 16 16">
                        <path d="M3 8h10M9 4l4 4-4 4" />
                      </svg>
                    </i>
                  </button>
                </div>

                <Stamp on={phase !== "idle"} text="Sent" sub={`Docket Nº ${number}`} className="ct-stamp" />
              </form>
            )}
          </div>
        </div>

        <footer className="ct-foot">
          <p>Rather talk? Call a store</p>
          <ul className="ct-phones">
            {STORES.map((s) => (
              <li key={s.id}>
                <a href={`tel:${s.phone.replace(/\s/g, "")}`} style={{ "--c": s.color } as CSSProperties}>
                  <span>{s.name}</span>
                  <small>{s.phone}</small>
                </a>
              </li>
            ))}
          </ul>
        </footer>

        <p className="sr-only" role="status">
          {phase === "copy" ? "Docket sent. Thanks." : ""}
        </p>
      </aside>
    </div>
  );
}
