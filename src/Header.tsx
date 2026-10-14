import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about";

const LINKS: Array<[Page, string]> = [
  ["home", "Home"],
  ["stores", "Stores"],
  ["about", "About us"],
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
 * One grocery item behind each link. Off, it is only a soft blurred shadow;
 * the current page's item switches on in full colour with a glow.
 */
const FOOD: Record<Page, { glow: string; art: ReactNode }> = {
  home: {
    glow: "#ff5a3c",
    art: (
      <>
        <path d="M24 15.5c-3.2-2.4-9.6-2.8-12.6 1.6-3.4 5-2.4 12.4 1 17.6 3 4.6 7 7 11.6 4.8 4.6 2.2 8.6-.2 11.6-4.8 3.4-5.2 4.4-12.6 1-17.6-3-4.4-9.4-4-12.6-1.6z" fill="#e3261b" />
        <path d="M15.6 21.4c.8-2.2 2.6-3.4 4.6-3.6" stroke="#ffb3a6" strokeWidth="2.2" />
        <path d="M24 15.5c-.2-3.4.8-6.4 2.8-8.6" />
        <path d="M25.6 11.6c1.8-4 6.4-5.6 10.4-4.6-1 3.8-5.8 6.4-10.4 4.6z" fill="#6fd3b0" />
      </>
    ),
  },
  stores: {
    glow: "#ff9a3d",
    art: (
      <>
        <path d="M33.4 9.4c-1.2-3.2.2-5.6 2.2-6.4 1.2 2.4.4 5-2.2 6.4zM34.6 11c2.6-2.6 6-2.8 8.4-1.6-1.8 2.4-5 3.4-8.4 1.6zM34 10.2c3.4-1 6.8.6 7.8 2.8" fill="#6fd3b0" />
        <path d="M30.4 11.6c3.4.6 6 3.4 6.2 6.6.1 1.4-.4 2.6-1.2 3.6L13.2 42.6c-1.4 1.2-3.4-.4-2.6-2L24.4 15.4c1.4-2.6 3.6-4.2 6-3.8z" fill="#ff9a3d" />
        <path d="M24.6 19.4l3.4 1.8M20.6 27l3 1.6M17.2 34l2.6 1.4M30 23.4l1.8 1.2" stroke="#c2601a" />
      </>
    ),
  },
  about: {
    glow: "#f6b531",
    art: (
      <>
        <path d="M38.6 9.6l1.6-3.4 2.4 1.2-1.4 3.2c1.6 7.6-.4 15.6-6.4 21.2-6.4 6-16.2 8.4-24.6 5.4-1.8-.6-2-3-.4-3.8 8.2 1.2 16.8-1.2 22.4-7 4.2-4.4 6.4-10.4 6.4-16.8z" fill="#f6b531" />
        <path d="M13.6 34.6c7.6.4 14.8-2.6 19.6-8.2 2.6-3 4.2-6.6 4.8-10.4" stroke="#c98a12" />
        <path d="M40.2 6.2l2.4 1.2" stroke="#00382a" strokeWidth="2.6" />
      </>
    ),
  },
};

function Food({ page }: { page: Page }) {
  return (
    <svg className="food" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      {FOOD[page].art}
    </svg>
  );
}

/** Two-digit queue number, as on a deli-counter ticket. */
const pad = (n: number) => String(n % 100).padStart(2, "0");

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
  // Deli queue: the display shows `serving`, the ticket in the slot is the next number.
  const [serving, setServing] = useState(() => 10 + Math.floor(Math.random() * 80));
  const [torn, setTorn] = useState(false);
  const tearTimer = useRef(0);

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

  useEffect(() => () => window.clearTimeout(tearTimer.current), []);

  const go = (next: Page) => {
    setOpen(false);
    setPeek(false);
    onNavigate(next);
  };
  // Tear the ticket off, then open the sheet; a fresh ticket feeds out behind it.
  const takeNumber = () => {
    if (torn) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setServing((n) => n + 1);
      onContact();
      return;
    }
    setTorn(true);
    tearTimer.current = window.setTimeout(() => {
      onContact();
      setServing((n) => n + 1);
      setTorn(false);
    }, 320);
  };

  return (
    <header className="hd" data-stuck={stuck || undefined} data-open={open || undefined} data-peek={peek || undefined}>
      <div className="bar">
        <div className="bar-row">
          <Logo onClick={() => go("home")} refreshKey={page} />

          {/* Scrolled down, this folds away and the bar is just the logo and the name. */}
          <div className="bar-more">
            <div className="bar-more-in">
              <nav className="nav" aria-label="Main navigation">
                {LINKS.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-current={page === id ? "page" : undefined}
                    style={{ "--glow": FOOD[id].glow } as CSSProperties}
                    onClick={() => go(id)}
                  >
                    <Food page={id} />
                    <Roll text={label} />
                  </button>
                ))}
              </nav>

              {/* "Take a number": a deli-counter ticket dispenser. Its display shows who is
                  being served, the ticket sticking out of the slot is yours. */}
              <button className="cta" type="button" data-torn={torn || undefined} onClick={takeNumber}>
                <span className="sr-only">Contact us</span>
                <span className="cta-box" aria-hidden="true">
                  <small>Now serving</small>
                  <span className="cta-led">
                    <span className="cta-led-roll">
                      <b>{pad(serving)}</b>
                      <b>{pad(serving + 1)}</b>
                    </span>
                  </span>
                </span>
                <span className="cta-ticket" key={serving} aria-hidden="true">
                  <span className="cta-paper">
                    <span className="cta-word">Contact us</span>
                    <span className="cta-no">
                      <small>Nº</small>
                      {pad(serving + 1)}
                    </span>
                  </span>
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
