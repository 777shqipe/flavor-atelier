import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from "react";
import { glyphSvg } from "./glyphs";
import { STORES } from "./stores";
import { useOpenStatus } from "./useOpenStatus";
import "./contact.css";

/**
 * Contact panel on a wooden clipboard: pick what you need, write a line,
 * leave a name and email. Nothing else is required.
 */

export type Topic = "stock" | "shop" | "other";

type TopicMeta = {
  id: Topic;
  label: string;
  sub: string;
  desk: string;
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
    hint: "Overstock or short-dated food? We pay upfront and collect fast.",
    placeholder: "Example: 20 boxes of pasta, best before June, in Footscray…",
    suggestions: ["Short-dated food", "Too much stock", "Need fast pickup"],
  },
  {
    id: "shop",
    label: "Question about a store",
    sub: "Shoppers · Store team",
    desk: "Store team",
    hint: "Looking for a product, opening hours, or feedback on a visit?",
    placeholder: "Example: is the $2 rice still in Brunswick?…",
    suggestions: ["Is it still in stock?", "Opening hours", "Feedback on a visit"],
  },
  {
    id: "other",
    label: "Something else",
    sub: "General · Head office",
    desk: "Head office",
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

/** Bulldog clip, used by the suppliers page. */
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
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  const sentRef = useRef(false);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [docketNo] = useState(() => String(1995 + Math.floor(Math.random() * 7900)).padStart(4, "0"));
  const status = useOpenStatus();

  const current = TOPICS.find((item) => item.id === topic) ?? TOPICS[0];

  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);

  const resetSheet = useCallback(() => {
    setValues((v) => ({ ...EMPTY, name: v.name, email: v.email }));
    setErrors({});
    setSent(false);
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
        (el) => !el.hasAttribute("disabled"),
      );
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
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

  const pickTopic = (next: Topic) => {
    if (sent) resetSheet();
    // Clear only the topic-specific extras, keep name/email/message.
    setValues((v) => ({ ...v, volume: "", store: "" }));
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
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (i + step + TOPICS.length) % TOPICS.length;
    pickTopic(TOPICS[next].id);
    event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (sent) return;
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Tell us your name.";
    if (!emailOk(values.email.trim())) next.email = "Enter a valid email so we can reply.";
    if (values.message.trim().length < 3) next.message = "Write a few words so we know how to help.";
    setErrors(next);
    const invalid = next.name ? nameInput : next.email ? emailInput : next.message ? messageInput : null;
    if (invalid) {
      invalid.current?.focus();
      return;
    }
    setSent(true);
    window.setTimeout(() => thanks.current?.focus({ preventScroll: true }), 40);
  };

  const again = () => {
    resetSheet();
    window.requestAnimationFrame(() => nameInput.current?.focus({ preventScroll: true }));
  };

  const first = values.name.trim().split(/\s+/)[0];

  return (
    <div className="ct" data-open={open || undefined}>
      <div className="ct-scrim" onClick={onClose} />
      <aside className="ct-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby="ct-title" tabIndex={-1}>
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
                  <fieldset className="ct-group">
                    <legend>
                      <span className="ct-num" aria-hidden="true">1</span> What do you need?
                    </legend>
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
                            onClick={() => pickTopic(item.id)}
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
                    <p className="ct-hint" key={current.id}>{current.hint}</p>
                  </fieldset>

                  {topic === "stock" && (
                    <div className="ct-group">
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
                        {STORES.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} — {store.address.split(",")[0]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <div className="ct-group">
                    <p className="ct-q" id="ct-msg-q">
                      <span className="ct-num" aria-hidden="true">2</span> What should we know?
                    </p>
                    <div className="ct-suggest" aria-label="Ideas for your message">
                      {current.suggestions.map((text) => (
                        <button key={text} type="button" className="ct-chip" onClick={() => addSuggestion(text)}>
                          {text}
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
                        rows={4}
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

                  <div className="ct-group">
                    <p className="ct-q">
                      <span className="ct-num" aria-hidden="true">3</span> Where do we reply?
                    </p>
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
                      <label className="ct-field">
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

                  <button className="ct-send" type="submit">
                    Send message
                  </button>
                  <p className="ct-note">We only use this to reply to you.</p>
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
              {STORES.map((store) => (
                <li key={store.id}>
                  <a href={`tel:${store.phone.replace(/\s/g, "")}`} style={{ "--sc": store.color } as CSSProperties}>
                    <span className="ct-call-glyph" dangerouslySetInnerHTML={{ __html: glyphSvg(store.glyph) }} />
                    <span className="ct-call-copy">
                      <b>{store.name}</b>
                      <small>{store.phone}</small>
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
          {sent ? "Message noted. Thanks." : ""}
        </p>
      </aside>
    </div>
  );
}
