import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about";

/** Each link's price-gun label lands at its own slight angle, as if stuck on by hand. */
const LINKS: Array<[Page, string, number]> = [
  ["home", "Home", -3],
  ["stores", "Stores", 2.5],
  ["about", "About us", -2],
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
  // Each ticket taken feeds a fresh one out of the slot.
  const [ticket, setTicket] = useState(0);
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
      setTicket((n) => n + 1);
      onContact();
      return;
    }
    setTorn(true);
    tearTimer.current = window.setTimeout(() => {
      onContact();
      setTicket((n) => n + 1);
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
                {LINKS.map(([id, label, tilt]) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-current={page === id ? "page" : undefined}
                    style={{ "--tilt": `${tilt}deg` } as CSSProperties}
                    onClick={() => go(id)}
                  >
                    <span className="gun" aria-hidden="true">
                      <span className="gun-paper" />
                    </span>
                    <Roll text={label} />
                  </button>
                ))}
              </nav>

              {/* "Take a number": a deli-counter ticket dispenser whose display says it is
                  your turn; the ticket sticking out of the slot is the way in. */}
              <button className="cta" type="button" data-torn={torn || undefined} onClick={takeNumber}>
                <span className="sr-only">Contact us</span>
                <span className="cta-box" aria-hidden="true">
                  <small>Now serving</small>
                  <span className="cta-led">
                    <b>You</b>
                  </span>
                </span>
                <span className="cta-ticket" key={ticket} aria-hidden="true">
                  <span className="cta-paper">
                    <span className="cta-word">Contact us</span>
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
