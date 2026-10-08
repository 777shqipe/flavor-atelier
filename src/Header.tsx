import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about" | "suppliers";

const LINKS: Array<[Page, string]> = [
  ["home", "Home"],
  ["stores", "Stores"],
  ["about", "About us"],
  ["suppliers", "Suppliers"],
];

/** Label whose letters roll up one after another on hover. */
function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((char, i) => {
        const glyph = char === " " ? " " : char;
        return (
          <span key={i} className="roll-ch" data-c={glyph} style={{ "--i": i } as CSSProperties}>
            {glyph}
          </span>
        );
      })}
    </span>
  );
}

/**
 * The active-page marker is a yellow price tag. It springs to whichever link
 * is hovered or current, and swings on its punched hole while it travels.
 */
function useTag() {
  const tag = useRef<HTMLSpanElement>(null);
  const api = useRef<((el: HTMLElement | null) => void) | null>(null);

  useEffect(() => {
    const t = tag.current;
    if (!t) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = 0;
    let w = 0;
    let vx = 0;
    let vw = 0;
    let a = 0;
    let va = 0;
    let tx = 0;
    let tw = 0;
    let raf = 0;
    let last = 0;
    let placed = false;

    const paint = () => {
      t.style.translate = `${x.toFixed(2)}px 0`;
      t.style.width = `${w.toFixed(2)}px`;
      t.style.rotate = `${a.toFixed(2)}deg`;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
      last = now;
      vx += (420 * (tx - x) - 30 * vx) * dt;
      vw += (420 * (tw - w) - 30 * vw) * dt;
      x += vx * dt;
      w += vw * dt;
      // Swing: lean with the speed of travel, then wobble back to level.
      const lean = Math.max(-11, Math.min(11, vx * 0.016));
      va += (300 * (lean - a) - 13 * va) * dt;
      a += va * dt;
      paint();
      const busy = Math.abs(tx - x) + Math.abs(tw - w) + Math.abs(vx) / 40 + Math.abs(a) + Math.abs(va) / 20 > 0.05;
      raf = busy ? requestAnimationFrame(tick) : 0;
      if (!busy) {
        x = tx;
        w = tw;
        a = 0;
        paint();
      }
    };

    api.current = (el) => {
      if (!el) return;
      tx = el.offsetLeft;
      tw = el.offsetWidth;
      if (!placed || reduce) {
        placed = true;
        x = tx;
        w = tw;
        paint();
        t.dataset.ready = "";
        return;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    return () => {
      cancelAnimationFrame(raf);
      api.current = null;
    };
  }, []);

  return { tag, to: useCallback((el: HTMLElement | null) => api.current?.(el), []) };
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
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  // Touch screens wide enough for the full nav cannot hover the compact bar open, so they tap to peek.
  const [peek, setPeek] = useState(false);
  const [hot, setHot] = useState<Page | null>(null);
  const nav = useRef<HTMLElement>(null);
  const { tag, to } = useTag();

  const placeTag = useCallback(() => {
    to(nav.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  }, [to]);
  const restTag = () => {
    setHot(null);
    placeTag();
  };

  useLayoutEffect(() => {
    placeTag();
  }, [page, placeTag]);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    const ro = new ResizeObserver(placeTag);
    ro.observe(el);
    document.fonts?.ready.then(placeTag);
    return () => ro.disconnect();
  }, [placeTag]);

  useEffect(() => {
    let frame = 0;
    const sample = () => {
      frame = 0;
      const down = window.scrollY > 80;
      setStuck(down);
      if (!down) setPeek(false);
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(sample);
    };
    window.addEventListener("scroll", request, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", request);
    };
  }, []);

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
    setPeek(false);
    onNavigate(next);
  };
  const point = (id: Page, el: HTMLElement) => {
    setHot(id);
    to(el);
  };

  return (
    <header className="hd" data-stuck={stuck || undefined} data-open={open || undefined} data-peek={peek || undefined}>
      <div className="bar">
        <div className="bar-row">
          <Logo onClick={() => go("home")} />

          {/* Scrolled down, this folds away and the bar is just the logo and the name. */}
          <div className="bar-more">
            <div className="bar-more-in">
              <nav className="nav" ref={nav} aria-label="Main navigation" onPointerLeave={restTag}>
                <span className="price-tag" ref={tag} aria-hidden="true">
                  <i className="price-tag-hole" />
                  <svg className="price-tag-string" viewBox="0 0 30 30">
                    <path d="M27 24C20 22 14 14 12 8S5 1 1 3" />
                  </svg>
                </span>
                {LINKS.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-current={page === id ? "page" : undefined}
                    data-lit={(hot ?? page) === id || undefined}
                    onClick={() => go(id)}
                    onPointerEnter={(event) => point(id, event.currentTarget)}
                    onFocus={(event) => point(id, event.currentTarget)}
                    onBlur={restTag}
                  >
                    <Roll text={label} />
                  </button>
                ))}
              </nav>

              <button className="cta" type="button" onClick={onContact}>
                <Roll text="Contact us" />
                <span className="sr-only">Contact us</span>
                <span className="cta-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <button
            className="peek-btn"
            type="button"
            aria-label={peek ? "Hide navigation" : "Show navigation"}
            aria-expanded={peek}
            onClick={() => setPeek((value) => !value)}
          >
            <i />
            <i />
          </button>

          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-word">{open ? "Close" : "Menu"}</span>
            <span className="burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>

        <div className="drawer" id="mobile-menu" aria-hidden={!open}>
          <div className="drawer-in">
            <nav aria-label="Mobile navigation">
              {LINKS.map(([id, label], index) => (
                <button
                  key={id}
                  type="button"
                  tabIndex={open ? 0 : -1}
                  aria-current={page === id ? "page" : undefined}
                  style={{ "--i": index } as CSSProperties}
                  onClick={() => go(id)}
                >
                  <small>0{index + 1}</small>
                  <span>{label}</span>
                  {page === id && <em>You’re here</em>}
                </button>
              ))}
            </nav>
            <button
              className="drawer-cta"
              type="button"
              tabIndex={open ? 0 : -1}
              style={{ "--i": LINKS.length } as CSSProperties}
              onClick={() => {
                setOpen(false);
                onContact();
              }}
            >
              Contact us
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
            <p className="drawer-foot" style={{ "--i": LINKS.length + 1 } as CSSProperties}>
              Four stores across inner Melbourne
            </p>
          </div>
        </div>
      </div>
      <div className="scrim" aria-hidden="true" onClick={() => setOpen(false)} />
    </header>
  );
}
