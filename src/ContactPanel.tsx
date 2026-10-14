import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { STORES } from "./stores";
import { PROOF } from "./supplierDeal";
import { useOpenStatus } from "./useOpenStatus";
import "./contact.css";

/**
 * Contact sheet on a big clipboard that rises from the bottom of the screen,
 * filled in one step at a time: need → details → reply-to → review.
 * On wide screens the store phones sit top-right and the supplier perks
 * are stuck around it as stickers you can peel and move.
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

const INK = "#141414";
const CREAM = "#fff6e6";
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Postage-stamp outline: a rectangle with round perforation bites along every edge. */
function stampPath(x0: number, y0: number, x1: number, y1: number, r: number, across: number, down: number) {
  let d = `M${x0} ${y0}`;
  const edge = (ax: number, ay: number, bx: number, by: number, n: number) => {
    const len = Math.hypot(bx - ax, by - ay);
    const [ux, uy] = [(bx - ax) / len, (by - ay) / len];
    for (let i = 0; i < n; i += 1) {
      const t = (i + 0.5) / n;
      const [cx, cy] = [ax + (bx - ax) * t, ay + (by - ay) * t];
      d += `L${r1(cx - ux * r)} ${r1(cy - uy * r)}A${r} ${r} 0 0 0 ${r1(cx + ux * r)} ${r1(cy + uy * r)}`;
    }
    d += `L${bx} ${by}`;
  };
  edge(x0, y0, x1, y0, across);
  edge(x1, y0, x1, y1, down);
  edge(x1, y1, x0, y1, across);
  edge(x0, y1, x0, y0, down);
  return `${d}Z`;
}

/** Flower outline: round petals bulging out between points on a circle. */
function flowerPath(cx: number, cy: number, R: number, r: number, petals: number) {
  const at = (k: number) => {
    const a = (k / petals) * Math.PI * 2 - Math.PI / 2;
    return `${r1(cx + R * Math.cos(a))} ${r1(cy + R * Math.sin(a))}`;
  };
  let d = `M${at(0)}`;
  for (let k = 1; k <= petals; k += 1) d += `A${r} ${r} 0 1 1 ${at(k)}`;
  return `${d}Z`;
}

/**
 * The stepper's stickers, one die-cut shape per step: price tag, round sticker,
 * postage stamp, flower. `d` is the outline (it also draws the white border,
 * the back of the sticker and its mark on the liner); `art` is printed on top.
 */
type StepStickerArt = { d: string; turn?: number; fill: string; art: ReactNode };

const STEP_STICKERS: StepStickerArt[] = [
  {
    d: "M12 50L32 28H82Q86 28 86 32V68Q86 72 82 72H32Z",
    turn: -40,
    fill: "#e3261b",
    art: (
      <>
        <circle cx="30" cy="50" r="5.5" fill={CREAM} stroke={INK} strokeWidth="2.4" />
        <path
          d="M60 61C49 54 45 48 47.5 43.5C50 39 56 39.5 60 44.5C64 39.5 70 39 72.5 43.5C75 48 71 54 60 61Z"
          fill={CREAM}
          transform="rotate(40 60 50)"
        />
      </>
    ),
  },
  {
    d: "M10 50a40 40 0 1 0 80 0a40 40 0 1 0 -80 0Z",
    fill: "#a98bf3",
    art: (
      <g transform="rotate(-45 50 50)" stroke={INK} strokeWidth="2.2">
        <path d="M33 43H67V57H33Z" fill="#f6b531" />
        <path d="M33 50H67" strokeOpacity="0.3" />
        <path d="M67 43H72V57H67Z" fill="#d7dbe0" />
        <path d="M72 43H76Q79 43 79 46V54Q79 57 76 57H72Z" fill="#ff8fb1" />
        <path d="M33 43L21 50L33 57Z" fill="#f3d9a4" />
        <path d="M25.3 47.5L21 50L25.3 52.5Z" fill={INK} />
      </g>
    ),
  },
  {
    d: stampPath(18, 14, 82, 86, 3.4, 6, 7),
    fill: "#6bb8ff",
    art: (
      <>
        <rect x="26" y="22" width="48" height="56" rx="2" fill="none" stroke={CREAM} strokeWidth="2" />
        <rect x="32" y="38" width="36" height="25" rx="2.5" fill={CREAM} stroke={INK} strokeWidth="2.2" />
        <path d="M33 40L50 53L67 40" fill="none" stroke={INK} strokeWidth="2.2" />
        <circle cx="50" cy="53" r="3.6" fill="#e3261b" stroke={INK} strokeWidth="1.6" />
      </>
    ),
  },
  {
    d: flowerPath(50, 50, 26, 11, 8),
    fill: "#f6b531",
    art: (
      <>
        <circle cx="50" cy="50" r="15" fill={CREAM} stroke={INK} strokeWidth="2.4" />
        <path d="M38 50Q50 40 62 50Q50 60 38 50Z" fill="#fff" stroke={INK} strokeWidth="2.2" />
        <circle cx="50" cy="50" r="4.2" fill={INK} />
        <circle cx="51.6" cy="48.4" r="1.3" fill="#fff" />
      </>
    ),
  },
];
const LAST = STEPS.length - 1;

/**
 * One stop on the stepper. While the step is ahead or current it is a sticker;
 * once done it peels off from the bottom-right corner and flies away, leaving
 * its outline on the liner with a tick. The CSS drives it all from data-state.
 */
function StepSticker({ art, id }: { art: StepStickerArt; id: string }) {
  const turn = art.turn ? `rotate(${art.turn} 50 50)` : undefined;
  return (
    <span className="ct-sticker" aria-hidden="true">
      <svg className="ct-sticker-liner" viewBox="0 0 100 100">
        <path className="ct-sticker-ghost" d={art.d} transform={turn} />
        <path className="ct-sticker-cut" d={art.d} transform={turn} />
        <path className="ct-sticker-tick" d="M30 52l13 13 27-30" pathLength={1} />
      </svg>
      <span className="ct-sticker-art">
        <span className="ct-sticker-face">
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
                <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.62" stopColor={INK} stopOpacity="0" />
                <stop offset="1" stopColor={INK} stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id={`${id}-back`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.55" stopColor="#f1ede3" />
                <stop offset="1" stopColor="#d6cfbf" />
              </linearGradient>
            </defs>
            <g transform={turn} strokeLinejoin="round" strokeLinecap="round">
              <path d={art.d} fill="#fff" stroke="#fff" strokeWidth="14" />
              <path d={art.d} fill={art.fill} stroke={INK} strokeWidth="2.6" />
              <path d={art.d} fill={`url(#${id}-shade)`} />
              {art.art}
            </g>
          </svg>
        </span>
        <span className="ct-sticker-lift">
          <span className="ct-sticker-flap">
            <svg viewBox="0 0 100 100">
              <path d={art.d} transform={turn} fill={`url(#${id}-back)`} stroke={`url(#${id}-back)`} strokeWidth="14" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </span>
    </span>
  );
}

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

/** Bulldog clip that holds the contact sheet: brushed steel plate, wire lever, two rivets. */
function Clip({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 84" aria-hidden="true">
      <defs>
        <linearGradient id="ct-clip-steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f7f5" />
          <stop offset="0.45" stopColor="#c3ccc7" />
          <stop offset="0.55" stopColor="#a9b4ae" />
          <stop offset="1" stopColor="#d6ddd9" />
        </linearGradient>
        <radialGradient id="ct-clip-rivet" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#7f8c85" />
        </radialGradient>
      </defs>
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M58 40C52 2 148 2 142 40" fill="none" stroke="#1c2421" strokeWidth="7" />
        <path d="M58 40C52 2 148 2 142 40" fill="none" stroke="#e8edea" strokeWidth="2.6" />
        <path d="M14 34h172l-9 36a7 7 0 0 1-6.8 5.4H29.8A7 7 0 0 1 23 70z" fill="url(#ct-clip-steel)" stroke="#1c2421" strokeWidth="2.6" />
        <path d="M22 41h156" stroke="#fff" strokeWidth="3" opacity="0.75" />
        <path d="M27 66h146" stroke="#6f7c75" strokeWidth="2" opacity="0.45" />
        <circle cx="38" cy="54" r="5" fill="url(#ct-clip-rivet)" stroke="#1c2421" strokeWidth="1.8" />
        <circle cx="162" cy="54" r="5" fill="url(#ct-clip-rivet)" stroke="#1c2421" strokeWidth="1.8" />
      </g>
    </svg>
  );
}

/** Little illustrated stickers for the three desks: boxes on a pallet, a shopfront, a chat bubble. */
function TopicIcon({ id }: { id: Topic }) {
  if (id === "stock") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M5 38h38v4H5z" fill="#b98a52" />
        <path d="M8 42v3M24 42v3M40 42v3" />
        <path d="M7 24h17v14H7z" fill="#e7c48d" />
        <path d="M24 24h17v14H24z" fill="#d9ad6c" />
        <path d="M14.5 24v6M31.5 24v6" stroke="#9b6c33" />
        <path d="M14 9h20v15H14z" fill="#f6d9a0" />
        <path d="M24 9v6" stroke="#9b6c33" />
        <path d="M27 17.5l5-2.5 3.5 5.5-5 2.5z" fill="#e3261b" />
        <circle cx="30.4" cy="17.6" r="0.9" fill="#fffdf6" stroke="none" />
      </svg>
    );
  }
  if (id === "shop") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M9 20h30v22H9z" fill="#fffdf6" />
        <path d="M6 12h36l-1 7a3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-6 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0z" fill="#e3261b" />
        <path d="M13 12l-1 7.2M20 12l-.5 7.4M28 12l.5 7.4M35 12l1 7.2" stroke="#fffdf6" strokeWidth="3" />
        <path d="M6 12h36l-1 7a3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-6 0 3.5 3.5 0 0 1-7 0 3.5 3.5 0 0 1-7 0z" fill="none" />
        <path d="M8 6h32l2 6H6z" fill="#00593f" />
        <path d="M13 27h8v7h-8z" fill="#bfdde4" />
        <path d="M26 27h9v15h-9z" fill="#9cad9b" />
        <circle cx="32.5" cy="35" r="0.9" fill="#00382a" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M27 22h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-2v5l-6-5h-5a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" fill="#c9d6c8" />
      <path d="M8 8h23a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H18l-8 7v-7H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z" fill="#f6b531" />
      <circle cx="12.5" cy="18" r="2" fill="#00382a" stroke="none" />
      <circle cx="19.5" cy="18" r="2" fill="#00382a" stroke="none" />
      <circle cx="26.5" cy="18" r="2" fill="#00382a" stroke="none" />
      <path d="M41 6v6M38 9h6" stroke="#f6b531" strokeWidth="2.4" />
    </svg>
  );
}

const STICKERS = [
  { look: "sun", kicker: "No minimum", big: "0", line: "A few boxes or a full truckload.", under: "One pallet? We’ll still take it." },
  { look: "lilac", kicker: "Answers & pick-ups", big: "Same day", line: "Fast decisions, so stock never sits.", under: "A clear offer from our buying team, same day." },
  { look: "star", kicker: "Paid upfront", big: "100%", line: "No invoices to chase", under: "Paid before it leaves your dock." },
  { look: "tomato", kicker: "We collect", big: "Door to door", line: "Your surplus gets a second life.", under: "We bring the truck. Every pallet tracked." },
] as const;

/** One supplier perk as a foil sticker: the shine follows the pointer, a click peels it back to show a note. */
function Sticker({ item, index }: { item: (typeof STICKERS)[number]; index: number }) {
  const [peeled, setPeeled] = useState(false);

  const shine = (event: ReactPointerEvent<HTMLLIElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", ((event.clientX - box.left) / box.width).toFixed(3));
    event.currentTarget.style.setProperty("--my", ((event.clientY - box.top) / box.height).toFixed(3));
  };
  const rest = (event: ReactPointerEvent<HTMLLIElement>) => {
    event.currentTarget.style.removeProperty("--mx");
    event.currentTarget.style.removeProperty("--my");
  };

  return (
    <li
      data-look={item.look}
      data-peeled={peeled || undefined}
      style={{ "--i": index } as CSSProperties}
      onPointerMove={shine}
      onPointerLeave={rest}
    >
      <p className="ct-reveal" aria-hidden={!peeled}>
        <small>Psst</small>
        {item.under}
      </p>
      <button className="ct-peel" type="button" aria-pressed={peeled} onClick={() => setPeeled((p) => !p)}>
        <span className="ct-face">
          {item.look === "star" ? (
            <span className="ct-holo">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <path id="ct-arc-top" d="M26 54a24 24 0 0 1 48 0" fill="none" />
                <path id="ct-arc-bottom" d="M21.5 54a28.5 28.5 0 0 0 57 0" fill="none" />
                <text className="ct-holo-arc" textAnchor="middle">
                  <textPath href="#ct-arc-top" startOffset="50%">
                    ★ {item.kicker} ★
                  </textPath>
                </text>
                <text className="ct-holo-arc" textAnchor="middle">
                  <textPath href="#ct-arc-bottom" startOffset="50%">
                    {item.line}
                  </textPath>
                </text>
                <text className="ct-holo-big" x="50" y="62" textAnchor="middle">
                  {item.big}
                </text>
              </svg>
              <span className="sr-only">
                {item.kicker}: {item.big}. {item.line}.
              </span>
            </span>
          ) : (
            <>
              <small>{item.kicker}</small>
              <strong>{item.big}</strong>
              <span className="ct-face-line">{item.line}</span>
            </>
          )}
        </span>
        <span className="ct-flap-wrap" aria-hidden="true">
          <span className="ct-flap" />
        </span>
      </button>
    </li>
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
      <div
        className="ct-dialog"
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-title"
        tabIndex={-1}
        onClick={(event) => event.target === event.currentTarget && onClose()}
      >
        <span className="ct-ghost" aria-hidden="true">
          Why us
        </span>

        <header className="ct-head">
          <p className="ct-eyebrow">Contact us</p>
          <h2 id="ct-title">How can we help?</h2>
          <p className="ct-lede">One short note, straight to the right desk.</p>
          {topic !== "stock" && (
            <button className="ct-switch" type="button" onClick={sellStock}>
              Got stock to sell? <span aria-hidden="true">→</span>
            </button>
          )}
        </header>

        <button className="ct-close" type="button" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="ct-board">
          <span className="ct-under" aria-hidden="true" />
          <span className="ct-under" aria-hidden="true" />
          <Clip className="ct-clip" />
          <div className="ct-sheet">
            <div className="ct-sheet-body">
              {/* Wax crayon: rough edges, plus speckles where the paper grain shows through. */}
              <svg className="ct-defs" aria-hidden="true">
                <filter id="ct-crayon" x="-10%" y="-25%" width="120%" height="150%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="grain" />
                  <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="rough" />
                  <feColorMatrix in="grain" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.25" result="wax" />
                  <feComposite in="rough" in2="wax" operator="in" />
                </filter>
              </svg>
              <div className="ct-docket-bar">
                <div className="ct-docket-id">
                  <b>DISPATCH DOCKET</b>
                  <small>Nº {docketNo}</small>
                </div>
                <div className="ct-docket-to">
                  <span>TO</span>
                  <strong className="ct-crayon" key={current.id}>
                    <span className="sr-only">{current.desk}</span>
                    <svg className="ct-crayon-fill" viewBox="0 0 120 40" preserveAspectRatio="none" aria-hidden="true">
                      <path
                        d="M4 33L9 7L14 33L19 7L24 33L29 7L34 33L39 7L44 33L49 7L54 33L59 7L64 33L69 7L74 33L79 7L84 33L89 7L94 33L99 7L104 33L109 7L114 33"
                        pathLength={1}
                      />
                    </svg>
                    <span className="ct-crayon-word" aria-hidden="true">
                      {[...current.desk].map((ch, i) => (
                        <span key={i} className={ch === " " ? "ct-crayon-gap" : undefined} style={{ "--k": i } as CSSProperties}>
                          {ch}
                        </span>
                      ))}
                    </span>
                  </strong>
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
                    <ol>
                      {STEPS.map((label, index) => (
                        <li key={label} data-state={index < step ? "done" : index === step ? "now" : "todo"}>
                          <button
                            type="button"
                            onClick={() => goTo(index)}
                            disabled={index > reached || index === step}
                            aria-current={index === step ? "step" : undefined}
                          >
                            <StepSticker art={STEP_STICKERS[index]} id={`ct-st${index}`} />
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
                                <span className="ct-topic-text">
                                  <b>{item.label}</b>
                                  <small>{item.sub}</small>
                                </span>
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
        </div>

        <section className="ct-stores" aria-labelledby="ct-stores-title">
          <div className="ct-stores-head">
            <p id="ct-stores-title">Call a store</p>
            <span className={`ct-stores-status${status.open ? " open" : ""}`}>
              <i /> {status.short}
            </span>
          </div>
          <ul>
            {STORES.map((item) => (
              <li key={item.id}>
                <a href={`tel:${item.phone.replace(/\s/g, "")}`} style={{ "--sc": item.color } as CSSProperties}>
                  <i aria-hidden="true" />
                  <b>{item.name}</b>
                  <span>{item.phone}</span>
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M4.5 3.5h3l1.5 4-2 1.2a9 9 0 0 0 4.3 4.3l1.2-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A13 13 0 0 1 3 5a1.5 1.5 0 0 1 1.5-1.5z" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <ul className="ct-stickers" aria-label="Why suppliers pick us">
          {STICKERS.map((item, index) => (
            <Sticker key={item.big} item={item} index={index} />
          ))}
        </ul>
        <p className="ct-peel-hint" aria-hidden="true">
          Psst, peel a sticker
        </p>

        <p className="sr-only" role="status">
          {sent ? "Message noted. Thanks." : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
        </p>
      </div>
    </div>
  );
}
