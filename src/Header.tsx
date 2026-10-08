import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Glass } from "./Glass";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about" | "suppliers";

const LINKS: Array<[Page, string]> = [
  ["home", "Home"],
  ["stores", "Stores"],
  ["about", "About us"],
  ["suppliers", "Suppliers"],
];

type Tone = "dark" | "light";
const SURFACE_TONE: Record<string, Tone> = { green: "dark", deep: "dark", cream: "light", paper: "light" };

/** What is under one point: the nearest section that declares a tone or a surface. */
function toneAt(x: number, y: number): Tone | null {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest(".hd")) continue;
    const host = el.closest<HTMLElement>("[data-tone], [data-surface]");
    if (!host) continue;
    const tone = host.dataset.tone ?? SURFACE_TONE[host.dataset.surface ?? ""];
    if (tone === "dark" || tone === "light") return tone;
  }
  return null;
}

/** The capsule spans ~60px, so several points vote on whether it sits over light or dark. */
function toneUnderHeader(current: Tone): Tone {
  const cx = window.innerWidth / 2;
  const points: Array<[number, number]> = [[cx, 22], [cx, 44], [cx, 66], [cx - 170, 44], [cx + 170, 44]];
  let light = 0;
  let dark = 0;
  for (const [x, y] of points) {
    const tone = toneAt(x, y);
    if (tone === "light") light += 1;
    else if (tone === "dark") dark += 1;
  }
  if (light === dark) return current;
  return light > dark ? "light" : "dark";
}

export function Header({
  page,
  onNavigate,
  onContact,
}: {
  page: Page;
  onNavigate: (page: Page) => void;
  onContact: () => void;
}) {
  const [tone, setTone] = useState<Tone>("dark");
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [lens, setLens] = useState<{ x: number; w: number } | null>(null);
  const [lensReady, setLensReady] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lensRef = useRef<HTMLSpanElement>(null);
  const lastX = useRef<number | null>(null);

  const moveLens = (el: HTMLElement | null) => {
    if (el) setLens({ x: el.offsetLeft, w: el.offsetWidth });
  };
  const restLens = useCallback(() => {
    moveLens(navRef.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  }, []);

  useLayoutEffect(() => {
    restLens();
  }, [page, restLens]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(restLens);
    observer.observe(nav);
    document.fonts?.ready.then(restLens);
    const frame = requestAnimationFrame(() => setLensReady(true));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [restLens]);

  // The lens stretches while it travels, like a drop of liquid being pulled.
  useEffect(() => {
    const el = lensRef.current;
    if (!el || !lens || !lensReady) return;
    if (lastX.current !== null && lastX.current !== lens.x && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.animate(
        [{ scale: "1 1" }, { scale: "1.16 0.88", offset: 0.35 }, { scale: "1 1" }],
        { duration: 600, easing: "cubic-bezier(0.3, 0.7, 0.3, 1)" },
      );
    }
    lastX.current = lens.x;
  }, [lens, lensReady]);

  useEffect(() => {
    let frame = 0;
    const sample = () => {
      frame = 0;
      setStuck(window.scrollY > 24);
      setTone((current) => toneUnderHeader(current));
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(sample);
    };
    const settle = window.setTimeout(sample, 80);
    sample();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.clearTimeout(settle);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
    };
  }, [page]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (next: Page) => {
    setOpen(false);
    onNavigate(next);
  };

  return (
    <header className="hd" data-tone={tone} data-stuck={stuck || undefined} data-open={open || undefined}>
      <Logo onClick={() => go("home")} />

      <Glass className="nav-pill">
        <nav ref={navRef} aria-label="Main navigation" onPointerLeave={restLens}>
          <span
            ref={lensRef}
            className={`lens${lensReady && lens ? " ready" : ""}`}
            style={lens ? { translate: `${lens.x}px 0`, width: lens.w } : undefined}
            aria-hidden="true"
          />
          {LINKS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-current={page === id ? "page" : undefined}
              onClick={() => go(id)}
              onPointerEnter={(event) => moveLens(event.currentTarget)}
              onFocus={(event) => moveLens(event.currentTarget)}
              onBlur={restLens}
            >
              {label}
            </button>
          ))}
        </nav>
      </Glass>

      <button className="cta" type="button" onClick={onContact}>
        <span>Contact us</span>
        <span className="cta-arrow" aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <Glass className="menu-btn" radius={26}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </Glass>

      <Glass className="sheet" radius={30}>
        <div id="mobile-menu" role="menu" aria-hidden={!open}>
          {LINKS.map(([id, label], index) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              tabIndex={open ? 0 : -1}
              aria-current={page === id ? "page" : undefined}
              style={{ "--i": index } as CSSProperties}
              onClick={() => go(id)}
            >
              {label}
            </button>
          ))}
          <button
            className="sheet-cta"
            type="button"
            role="menuitem"
            tabIndex={open ? 0 : -1}
            style={{ "--i": LINKS.length } as CSSProperties}
            onClick={() => {
              setOpen(false);
              onContact();
            }}
          >
            Contact us
          </button>
        </div>
      </Glass>
    </header>
  );
}
