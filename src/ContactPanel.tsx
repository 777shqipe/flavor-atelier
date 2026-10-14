import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { glyphSvg } from "./glyphs";
import { STORES } from "./stores";
import { PROOF, STOPS } from "./supplierDeal";
import { useOpenStatus } from "./useOpenStatus";
import "./contact.css";

/**
 * Contact panel on a wooden clipboard, filled in one step at a time:
 * need → details → reply-to → review. On wide screens the empty space
 * beside it carries a compact "Why us" for suppliers.
 */

export type Topic = "stock" | "shop" | "other";

type TopicMeta = {
  id: Topic;
  label: string;
  sub: string;
  desk: string;
  ask: string;
  hint: string;
  placeholder: string;
  suggestions: string[];
};

const TOPICS: TopicMeta[] = [
  {
    id: "stock",
    label: "I have stock to sell",
    sub: "Suppliers · Buying team",
    desk: "Buying team",
    ask: "Tell us about the stock",
    hint: "Overstock or short-dated food? We pay upfront and collect fast.",
    placeholder: "Example: 20 boxes of pasta, best before June, in Footscray…",
    suggestions: ["Short-dated food", "Too much stock", "Need fast pickup"],
  },
  {
    id: "shop",
    label: "Question about a store",
    sub: "Shoppers · Store team",
    desk: "Store team",
    ask: "What’s your question?",
    hint: "Looking for a product, opening hours, or feedback on a visit?",
    placeholder: "Example: is the $2 rice still in Brunswick?…",
    suggestions: ["Is it still in stock?", "Opening hours", "Feedback on a visit"],
  },
  {
    id: "other",
    label: "Something else",
    sub: "General · Head office",
    desk: "Head office",
    ask: "What’s on your mind?",
    hint: "Partnerships, press, jobs, or just saying hello.",
    placeholder: "Example: I'd like to partner with you on…",
    suggestions: ["Partnership", "Press", "Jobs"],
  },
];

const VOLUMES = [
  { id: "small", label: "A few boxes" },
  { id: "medium", label: "Some pallets" },
  { id: "large", label: "A truckload" },
  { id: "unsure", label: "Not sure" },
];

const STEPS = ["Your need", "Details", "Reply to", "Review"];
const LAST = STEPS.length - 1;

type Fields = {
  name: string;
  email: string;
  phone: string;
  message: string;
  volume: string;
  store: string;
};

type Errors = Partial<Record<"name" | "email" | "message", string>>;

const EMPTY: Fields = { name: "", email: "", phone: "", message: "", volume: "", store: "" };

const emailOk = (value: string) => /^\S+@\S+\.\S+$/.test(value);

/** What blocks leaving a step; only details (message) and reply-to (name, email) have rules. */
function check(step: number, values: Fields): Errors {
  const errors: Errors = {};
  if (step === 1 && values.message.trim().length < 3) errors.message = "Write a few words so we know how to help.";
  if (step === 2) {
    if (!values.name.trim()) errors.name = "Tell us your name.";
    if (!emailOk(values.email.trim())) errors.email = "Enter a valid email so we can reply.";
  }
  return errors;
}

/** Bulldog clip that holds the contact sheet. */
function Clip({ className = "" }: { className?: string }) {
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

function TopicIcon({ id }: { id: Topic }) {
  if (id === "stock") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" />
        <path d="M3 8l9 5 9-5M12 13v8" />
      </svg>
    );
  }
  if (id === "shop") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 10h18v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10z" />
        <path d="M3 10l2.5-6h13L21 10M9 21v-6h6v6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z" />
    </svg>
  );
}

/** Supplier perks as price stickers and a receipt, in the space left of the panel. */
function WhyUs({ topic, onStock }: { topic: Topic; onStock: () => void }) {
  return (
    <section className="ct-why" aria-labelledby="ct-why-title">
      <span className="ct-why-ghost" aria-hidden="true">
        Why us
      </span>
      <div className="ct-why-inner">
        <p className="ct-why-eyebrow">Why suppliers pick us</p>
        <h2 id="ct-why-title" className="ct-why-title">
          Good food, <em>sold not binned.</em>
        </h2>
        <ul className="ct-why-proof">
          {PROOF.map(([big, small], index) => (
            <li key={small} style={{ "--i": index } as CSSProperties}>
              <strong>{big}</strong>
              <span>{small}</span>
            </li>
          ))}
        </ul>
        <ol className="ct-why-gains">
          {STOPS.map((stop, index) => (
            <li key={stop.tag} style={{ "--i": index } as CSSProperties}>
              <span className="ct-why-tag">{stop.tag}</span>
              <p>{stop.gain}</p>
            </li>
          ))}
        </ol>
        {topic !== "stock" && (
          <button className="ct-why-switch" type="button" onClick={onStock}>
            I have stock to sell <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </section>
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
  const panel = useRef<HTMLDivElement>(null);
  const stepHead = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  const sentRef = useRef(false);
  const advance = useRef(0);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [dir, setDir] = useState(1);
  const [seenTopic, setSeenTopic] = useState(topic);
  const [docketNo] = useState(() => String(1995 + Math.floor(Math.random() * 7900)).padStart(4, "0"));
  const status = useOpenStatus();

  const current = TOPICS.find((item) => item.id === topic) ?? TOPICS[0];

  // Opened from another button with a different topic: start again from step 1 so the change is visible.
  if (topic !== seenTopic) {
    setSeenTopic(topic);
    setStep(0);
  }

  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);

  useEffect(() => () => window.clearTimeout(advance.current), []);

  const resetSheet = useCallback(() => {
    setValues((v) => ({ ...EMPTY, name: v.name, email: v.email }));
    setErrors({});
    setSent(false);
    setStep(0);
    setReached(0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add("ct-lock");
    const focus = window.setTimeout(() => {
      (sentRef.current ? thanks.current : panel.current)?.focus({ preventScroll: true });
    }, 80);
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const nodes = [...panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), textarea, input, select")].filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focus);
      document.documentElement.classList.remove("ct-lock");
      window.removeEventListener("keydown", onKey);
      back?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open || !sent) return;
    const t = window.setTimeout(resetSheet, 480);
    return () => window.clearTimeout(t);
  }, [open, sent, resetSheet]);

  const set = (key: keyof Fields) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    setValues((v) => ({ ...v, [key]: value }));
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  /** Show a step, with any problems found, and focus the first one (or the step's heading). */
  const land = (to: number, found: Errors = {}) => {
    window.clearTimeout(advance.current);
    setErrors(found);
    setDir(to >= step ? 1 : -1);
    setStep(to);
    setReached((r) => Math.max(r, to));
    window.setTimeout(() => {
      const invalid = found.message ? messageInput : found.name ? nameInput : found.email ? emailInput : stepHead;
      invalid.current?.focus({ preventScroll: true });
    }, 60);
  };

  /** Move to a step; going forward checks every step from `from` and stops on the first problem. */
  const goTo = (target: number, from = step) => {
    for (let i = from; i < target; i += 1) {
      const found = check(i, values);
      if (Object.keys(found).length) return land(i, found);
    }
    land(target);
  };

  const pickTopic = (next: Topic) => {
    if (sent) resetSheet();
    // Clear only the topic-specific extras, keep name/email/message.
    setValues((v) => ({ ...v, volume: "", store: "" }));
    setSeenTopic(next);
    onTopic(next);
  };

  const addSuggestion = (text: string) => {
    setValues((v) => {
      if (!v.message.trim()) return { ...v, message: `${text} — ` };
      if (v.message.includes(text)) return v;
      return { ...v, message: `${v.message.trim()} ${text.toLowerCase()} ` };
    });
    if (errors.message) setErrors((e) => ({ ...e, message: undefined }));
    messageInput.current?.focus();
  };

  const onTopicKey = (event: KeyboardEvent) => {
    const i = TOPICS.findIndex((item) => item.id === topic);
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (i + delta + TOPICS.length) % TOPICS.length;
    pickTopic(TOPICS[next].id);
    event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };

  /** Clicking a ticket picks it and, after the stub has slid over, turns the page. */
  const chooseTopic = (next: Topic) => {
    pickTopic(next);
    window.clearTimeout(advance.current);
    advance.current = window.setTimeout(() => goTo(1), 320);
  };

  const sellStock = () => {
    pickTopic("stock");
    land(1);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (sent) return;
    if (step < LAST) {
      goTo(step + 1);
      return;
    }
    // Last guard: something may have been cleared after it was checked.
    for (let i = 0; i < LAST; i += 1) {
      const found = check(i, values);
      if (Object.keys(found).length) return land(i, found);
    }
    setSent(true);
    window.setTimeout(() => thanks.current?.focus({ preventScroll: true }), 40);
  };

  const again = () => {
    resetSheet();
    window.requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus({ preventScroll: true }));
  };

  const first = values.name.trim().split(/\s+/)[0];
  const volume = VOLUMES.find((item) => item.id === values.volume)?.label;
  const store = STORES.find((item) => item.id === values.store);
  const nextLabel = step < LAST ? `Next: ${STEPS[step + 1]}` : "Send message";

  return (
    <div className="ct" data-open={open || undefined}>
      <div className="ct-scrim" onClick={onClose} />
      <div className="ct-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby="ct-title" tabIndex={-1}>
        <WhyUs topic={topic} onStock={sellStock} />

        <aside className="ct-panel">
          <header className="ct-top">
            <div>
              <p className="ct-eyebrow">Contact us</p>
              <h2 id="ct-title">How can we help?</h2>
            </div>
            <button className="ct-close" type="button" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="ct-scroll">
            <div className="ct-board">
              <Clip className="ct-clip" />
              <div className="ct-sheet">
                <div className="ct-docket-bar">
                  <div className="ct-docket-id">
                    <b>DISPATCH DOCKET</b>
                    <small>Nº {docketNo}</small>
                  </div>
                  <div className="ct-docket-to">
                    <span>TO</span>
                    <strong key={current.id}>{current.desk}</strong>
                  </div>
                </div>

                {sent ? (
                  <>
                    <span className="ct-stamp" aria-hidden="true">
                      Received
                    </span>
                    <div className="ct-done">
                      <span className="ct-check" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                      </span>
                      <h3 ref={thanks} tabIndex={-1}>
                        Thanks{first ? `, ${first}` : ""}!
                      </h3>
                      <p>
                        Your note is with the {current.desk.toLowerCase()}. We’ll reply to <b>{values.email.trim()}</b>.
                      </p>
                      <div className="ct-done-actions">
                        <button className="ct-send" type="button" onClick={again}>
                          Send another message
                        </button>
                        <button className="ct-text" type="button" onClick={onClose}>
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <form className="ct-form" onSubmit={submit} noValidate>
                    <nav className="ct-steps" aria-label="Form steps" style={{ "--p": step / LAST } as CSSProperties}>
                      <p className="ct-steps-count">
                        Step <b>{String(step + 1).padStart(2, "0")}</b> / {String(STEPS.length).padStart(2, "0")}
                      </p>
                      <ol>
                        {STEPS.map((label, index) => (
                          <li key={label} data-state={index < step ? "done" : index === step ? "now" : "todo"}>
                            <button
                              type="button"
                              onClick={() => goTo(index)}
                              disabled={index > reached || index === step}
                              aria-current={index === step ? "step" : undefined}
                            >
                              <span className="ct-steps-dot" aria-hidden="true">
                                {index < step ? (
                                  <svg viewBox="0 0 24 24">
                                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                                  </svg>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              <span className="ct-steps-label">{label}</span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </nav>

                    <div className="ct-step" key={step} data-dir={dir}>
                      {step === 0 && (
                        <fieldset className="ct-group">
                          <legend>
                            <h3 ref={stepHead} tabIndex={-1}>
                              What do you need?
                            </h3>
                          </legend>
                          <p className="ct-hint">Pick one and we’ll route your note to the right desk.</p>
                          <div
                            className="ct-topics"
                            role="radiogroup"
                            aria-label="What do you need?"
                            onKeyDown={onTopicKey}
                            style={{ "--sel": TOPICS.findIndex((item) => item.id === topic) } as CSSProperties}
                          >
                            {TOPICS.map((item) => {
                              const checked = item.id === topic;
                              return (
                                <button
                                  key={item.id}
                                  className="ct-topic"
                                  type="button"
                                  role="radio"
                                  aria-checked={checked}
                                  tabIndex={checked ? 0 : -1}
                                  onClick={() => chooseTopic(item.id)}
                                >
                                  <span className="ct-topic-icon" aria-hidden="true">
                                    <TopicIcon id={item.id} />
                                  </span>
                                  <b>{item.label}</b>
                                  <small>{item.sub}</small>
                                </button>
                              );
                            })}
                          </div>
                          {topic === "stock" && (
                            <ul className="ct-proof-mini" aria-label="Why suppliers pick us">
                              {PROOF.map(([big, small]) => (
                                <li key={small}>
                                  <b>{big}</b> {small}
                                </li>
                              ))}
                            </ul>
                          )}
                        </fieldset>
                      )}

                      {step === 1 && (
                        <div className="ct-group">
                          <div className="ct-step-head">
                            <h3 ref={stepHead} tabIndex={-1}>
                              {current.ask}
                            </h3>
                            <p className="ct-hint">{current.hint}</p>
                          </div>

                          {topic === "stock" && (
                            <div className="ct-sub">
                              <p className="ct-q" id="ct-volume-q">
                                How much is it? <small>(optional)</small>
                              </p>
                              <div className="ct-pills" role="group" aria-labelledby="ct-volume-q">
                                {VOLUMES.map((item) => (
                                  <button
                                    key={item.id}
                                    type="button"
                                    className="ct-pill"
                                    aria-pressed={values.volume === item.id}
                                    onClick={() => setValues((v) => ({ ...v, volume: v.volume === item.id ? "" : item.id }))}
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {topic === "shop" && (
                            <label className="ct-field">
                              <span>
                                Which store? <small>(optional)</small>
                              </span>
                              <select name="store" value={values.store} onChange={set("store")}>
                                <option value="">Any store is fine</option>
                                {STORES.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name} — {item.address.split(",")[0]}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}

                          <div className="ct-sub">
                            <p className="ct-q" id="ct-msg-q">
                              Your message
                            </p>
                            <div className="ct-suggest" aria-label="Ideas for your message">
                              {current.suggestions.map((text) => (
                                <button key={text} type="button" className="ct-chip" onClick={() => addSuggestion(text)}>
                                  + {text}
                                </button>
                              ))}
                            </div>
                            <label className="ct-field">
                              <span className="sr-only">Your message</span>
                              <textarea
                                ref={messageInput}
                                name="message"
                                value={values.message}
                                onChange={set("message")}
                                placeholder={current.placeholder}
                                rows={5}
                                aria-invalid={!!errors.message}
                                aria-describedby={errors.message ? "ct-err-message" : undefined}
                              />
                              {errors.message && (
                                <em id="ct-err-message" className="ct-err">
                                  {errors.message}
                                </em>
                              )}
                            </label>
                          </div>
                        </div>
                      )}

                      {step === 2 && (
                        <div className="ct-group">
                          <div className="ct-step-head">
                            <h3 ref={stepHead} tabIndex={-1}>
                              Where do we reply?
                            </h3>
                            <p className="ct-hint">Just a name and an email. We only use them to answer you.</p>
                          </div>
                          <div className="ct-who">
                            <label className="ct-field">
                              <span>Your name</span>
                              <input
                                ref={nameInput}
                                type="text"
                                name="name"
                                value={values.name}
                                onChange={set("name")}
                                autoComplete="name"
                                placeholder="e.g. Alex"
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? "ct-err-name" : undefined}
                              />
                              {errors.name && (
                                <em id="ct-err-name" className="ct-err">
                                  {errors.name}
                                </em>
                              )}
                            </label>
                            <label className="ct-field">
                              <span>Email</span>
                              <input
                                ref={emailInput}
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={set("email")}
                                autoComplete="email"
                                inputMode="email"
                                placeholder="you@example.com"
                                aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? "ct-err-email" : undefined}
                              />
                              {errors.email && (
                                <em id="ct-err-email" className="ct-err">
                                  {errors.email}
                                </em>
                              )}
                            </label>
                            <label className="ct-field ct-field-wide">
                              <span>
                                Phone <small>(optional)</small>
                              </span>
                              <input
                                type="tel"
                                name="phone"
                                value={values.phone}
                                onChange={set("phone")}
                                autoComplete="tel"
                                inputMode="tel"
                                placeholder="Only if you prefer a call"
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {step === 3 && (
                        <div className="ct-group">
                          <div className="ct-step-head">
                            <h3 ref={stepHead} tabIndex={-1}>
                              All good?
                            </h3>
                            <p className="ct-hint">A last look before it goes to the {current.desk.toLowerCase()}.</p>
                          </div>
                          <dl className="ct-review">
                            <div>
                              <dt>Need</dt>
                              <dd>
                                {current.label}
                                {volume && <small>{volume}</small>}
                                {topic === "shop" && <small>{store ? store.name : "Any store"}</small>}
                              </dd>
                              <button type="button" className="ct-edit" onClick={() => goTo(0)} aria-label="Edit your need">
                                Edit
                              </button>
                            </div>
                            <div>
                              <dt>Message</dt>
                              <dd className="ct-review-msg">“{values.message.trim()}”</dd>
                              <button type="button" className="ct-edit" onClick={() => goTo(1)} aria-label="Edit your message">
                                Edit
                              </button>
                            </div>
                            <div>
                              <dt>Reply to</dt>
                              <dd>
                                {values.name.trim()}
                                <small>{values.email.trim()}</small>
                                {values.phone.trim() && <small>{values.phone.trim()}</small>}
                              </dd>
                              <button type="button" className="ct-edit" onClick={() => goTo(2)} aria-label="Edit your contact details">
                                Edit
                              </button>
                            </div>
                          </dl>
                        </div>
                      )}
                    </div>

                    <div className="ct-nav">
                      {step > 0 && (
                        <button className="ct-back" type="button" onClick={() => goTo(step - 1)}>
                          <span aria-hidden="true">←</span> Back
                        </button>
                      )}
                      <button className="ct-send" type="submit" data-last={step === LAST || undefined}>
                        {nextLabel} <span aria-hidden="true">{step === LAST ? "✓" : "→"}</span>
                      </button>
                    </div>
                    {step === LAST && <p className="ct-note">We only use this to reply to you.</p>}
                  </form>
                )}
              </div>
            </div>

            <footer className="ct-foot">
              <div className="ct-foot-head">
                <p>Prefer to talk? Call a store</p>
                <span className={`ct-foot-status${status.open ? " open" : ""}`}>
                  <i /> {status.short}
                </span>
              </div>
              <ul className="ct-store-calls">
                {STORES.map((item) => (
                  <li key={item.id}>
                    <a href={`tel:${item.phone.replace(/\s/g, "")}`} style={{ "--sc": item.color } as CSSProperties}>
                      <span className="ct-call-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(item.glyph) }} />
                      <span className="ct-call-copy">
                        <b>{item.name}</b>
                        <small>{item.phone}</small>
                      </span>
                      <span className="ct-call-ico" aria-hidden="true">
                        <svg viewBox="0 0 20 20">
                          <path d="M4.5 3.5h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3l1.2-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A13 13 0 0 1 3 5a1.5 1.5 0 0 1 1.5-1.5z" />
                        </svg>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </footer>
          </div>

          <p className="sr-only" role="status">
            {sent ? "Message noted. Thanks." : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
          </p>
        </aside>
      </div>
    </div>
  );
}
