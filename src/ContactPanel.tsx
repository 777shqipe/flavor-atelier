import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { CATEGORIES } from "./products";
import { STORES } from "./stores";
import "./contact.css";

/**
 * Contact, as a side panel. A short enquiry form: who you are, what it is
 * about, and a message. Sending only confirms on this page.
 * TODO: POST the enquiry. Nothing leaves the browser yet.
 */

export type Topic = "stock" | "shop" | "other";

const TOPICS: Array<{ id: Topic; label: string; desk: string; hint: string; placeholder: string }> = [
  {
    id: "stock",
    label: "Selling stock",
    desk: "Buying team",
    hint: "Surplus food and wholesale lots go to the buying team.",
    placeholder: "What you have, roughly how much, and when it needs to move.",
  },
  {
    id: "shop",
    label: "A store",
    desk: "Store team",
    hint: "A product, a visit, or something you bought goes to the store team.",
    placeholder: "The product, the store, or what happened.",
  },
  {
    id: "other",
    label: "Something else",
    desk: "Head office",
    hint: "Press, partnerships, and general notes go to head office.",
    placeholder: "How can we help?",
  },
];

const VOLUMES = [
  { id: "", label: "Not sure yet" },
  { id: "few", label: "A few pallets" },
  { id: "half", label: "Half a truck" },
  { id: "full", label: "A full truckload" },
];

type Fields = {
  name: string;
  email: string;
  phone: string;
  message: string;
  category: string;
  volume: string;
  store: string;
};

type Errors = Partial<Record<"name" | "email" | "phone" | "message", string>>;

const EMPTY: Fields = { name: "", email: "", phone: "", message: "", category: "", volume: "", store: "" };

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
  const film = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [seen, setSeen] = useState(open);
  if (open && !seen) setSeen(true);
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLTextAreaElement>(null);
  const thanks = useRef<HTMLHeadingElement>(null);
  const sentRef = useRef(false);
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const current = TOPICS.find((item) => item.id === topic) ?? TOPICS[0];

  useEffect(() => {
    sentRef.current = sent;
  }, [sent]);

  const resetSheet = useCallback(() => {
    setValues((v) => ({ ...EMPTY, name: v.name, email: v.email, phone: v.phone }));
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
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // The story starts from the top every time the card opens.
  useEffect(() => {
    const video = film.current;
    if (!video) return;
    if (!open || reduceMotion) {
      video.pause();
      return;
    }
    const start = () => {
      video.currentTime = 0;
      void video.play().catch(() => {});
    };
    if (video.readyState >= 1) start();
    else {
      video.addEventListener("loadedmetadata", start, { once: true });
      video.load();
    }
    return () => video.removeEventListener("loadedmetadata", start);
  }, [open, reduceMotion]);

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
    if (sent) return;
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!emailOk(values.email.trim())) next.email = "Enter a valid email address.";
    const digits = values.phone.replace(/\D/g, "");
    if (values.phone.trim() && digits.length < 8) next.phone = "Enter a full phone number, or leave it blank.";
    if (!values.message.trim()) next.message = "Write a short message.";
    setErrors(next);
    const invalid = next.name ? nameInput : next.email ? emailInput : next.phone ? phoneInput : next.message ? messageInput : null;
    if (invalid) {
      invalid.current?.focus();
      return;
    }
    setSent(true);
    window.setTimeout(() => thanks.current?.focus({ preventScroll: true }), 30);
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
        <div className="ct-film" aria-hidden="true">
          {seen &&
            (reduceMotion ? (
              <img src="/media/contact-story.jpg?v=2" alt="" />
            ) : (
              <video ref={film} src="/media/contact-story.mp4?v=2" poster="/media/contact-story.jpg?v=2" muted playsInline loop preload="none" />
            ))}
        </div>
        <div className="ct-scroll">
        <header className="ct-band">
          <div className="ct-band-copy">
            <p className="ct-eyebrow">Get in touch</p>
            <h2 id="ct-title">Contact us</h2>
          </div>
          <button className="ct-close" type="button" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        {sent ? (
          <div className="ct-done">
            <h3 ref={thanks} tabIndex={-1}>
              Thanks{first ? `, ${first}` : ""}.
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
        ) : (
          <form className="ct-form" onSubmit={submit} noValidate>
            <p className="ct-lead">A name, an email, and a short message is enough.</p>

            <fieldset className="ct-about">
              <legend>I’m writing about</legend>
              <div className="ct-topics" role="radiogroup" aria-label="What is this about?" onKeyDown={onTopicKey}>
                {TOPICS.map((item) => (
                  <button
                    key={item.id}
                    className="ct-topic"
                    type="button"
                    role="radio"
                    aria-checked={item.id === topic}
                    tabIndex={item.id === topic ? 0 : -1}
                    onClick={() => pickTopic(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="ct-hint">{current.hint}</p>
            </fieldset>

            <label className="ct-field">
              <span>Name</span>
              <input
                ref={nameInput}
                type="text"
                name="name"
                value={values.name}
                onChange={set("name")}
                autoComplete="name"
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
                Phone <small>optional</small>
              </span>
              <input
                ref={phoneInput}
                type="tel"
                name="phone"
                value={values.phone}
                onChange={set("phone")}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "ct-err-phone" : undefined}
              />
              {errors.phone && (
                <em id="ct-err-phone" className="ct-err">
                  {errors.phone}
                </em>
              )}
            </label>

            {topic === "stock" && (
              <fieldset className="ct-extra">
                <legend>About the stock</legend>
                <label className="ct-field">
                  <span>
                    Category <small>optional</small>
                  </span>
                  <select name="category" value={values.category} onChange={set("category")}>
                    <option value="">Mixed or not sure</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="ct-field">
                  <span>
                    How much <small>optional</small>
                  </span>
                  <select name="volume" value={values.volume} onChange={set("volume")}>
                    {VOLUMES.map((item) => (
                      <option key={item.id || "unsure"} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            )}

            {topic === "shop" && (
              <label className="ct-field">
                <span>
                  Which store <small>optional</small>
                </span>
                <select name="store" value={values.store} onChange={set("store")}>
                  <option value="">Any store</option>
                  {STORES.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="ct-field">
              <span>Message</span>
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

            <button className="ct-send" type="submit">
              Send message
            </button>
            <p className="ct-note">We only use this to reply to you.</p>
          </form>
        )}

        <footer className="ct-foot">
          <p>Or call a store</p>
          <ul>
            {STORES.map((store) => (
              <li key={store.id}>
                <a href={`tel:${store.phone.replace(/\s/g, "")}`}>
                  <span>{store.name}</span>
                  <span>{store.phone}</span>
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
