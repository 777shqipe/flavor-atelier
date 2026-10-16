import { useEffect, useRef, useState, type CSSProperties } from "react";
import { headerStrings } from "./i18n/strings/Header";
import { topNoticeStrings } from "./i18n/strings/TopNotice";
import { useT } from "./i18n";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about";

/** Each link's price-gun label lands at its own slight angle, as if stuck on by hand. */
const LINKS: Array<[Page, number]> = [
  ["home", -2],
  ["stores", 1.5],
  ["about", -1.5],
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
 * A deli "take a number" ticket on its side, pointed at the far end with thin
 * yellow edge stripes. Longer than what shows: the rest waits inside the
 * dispenser and slides out on hover.
 */
function TicketArt() {
  return (
    <svg viewBox="0 0 240 44" focusable="false">
      <path d="M0 .5h208c14 6 24.5 15.5 27.6 19.9a2.8 2.8 0 0 1 0 3.2C232.5 28 222 37.5 208 43.5H0z" fill="#fffdf7" />
      <path d="M0 3.5h205v2H0zM0 38.5h205v2H0z" fill="#f5c400" />
    </svg>
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
  const s = useT(headerStrings);
  const ns = useT(topNoticeStrings);
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
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
      setOpen(false);
      onContact();
      return;
    }
    setTorn(true);
    tearTimer.current = window.setTimeout(() => {
      setOpen(false);
      onContact();
      setTicket((n) => n + 1);
      setTorn(false);
    }, 380);
  };

  return (
    <header className="hd" data-stuck={stuck || undefined} data-open={open || undefined} data-peek={peek || undefined}>
      <div className="bar">
        <div className="bar-row">
          <Logo onClick={() => go("home")} refreshKey={page} />

          {/* Scrolled down, this folds away and the bar is just the logo and the name. */}
          <div className="bar-more">
            <div className="bar-more-in">
              <nav className="nav" aria-label={s.mainNav}>
                {LINKS.map(([id, tilt]) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={s.nav[id]}
                    aria-current={page === id ? "page" : undefined}
                    style={{ "--tilt": `${tilt}deg` } as CSSProperties}
                    onClick={() => go(id)}
                  >
                    <span className="gun" aria-hidden="true">
                      <span className="gun-paper" />
                    </span>
                    <Roll text={s.nav[id]} />
                  </button>
                ))}
              </nav>

              {/* "Take a number": a deli-counter ticket dispenser whose display says it is
                  your turn; the ticket sticking out of the slot is the way in. */}
              <button className="cta" type="button" data-torn={torn || undefined} onClick={takeNumber}>
                <span className="sr-only">{s.contact}</span>
                <span className="cta-box" aria-hidden="true">
                  <small>{s.nowServing}</small>
                  <span className="cta-led">
                    <b>{s.you}</b>
                  </span>
                </span>
                {/* Stub and ticket are the same drawing cut along a ragged tear line at
                    the slot: hover pulls more ticket out, click rips it off. */}
                <span className="cta-ticket" key={ticket} aria-hidden="true">
                  <span className="cta-stub">
                    <span className="cta-slide">
                      <TicketArt />
                    </span>
                  </span>
                  <span className="cta-tear">
                    <span className="cta-slide">
                      <TicketArt />
                      <span className="cta-copy">
                        <span className="cta-word">{s.contact}</span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </div>
          <LangSwitch variant="menu" />

          <button
            className="peek-btn"
            type="button"
            aria-label={peek ? s.hideNav : s.showNav}
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
            <span className="menu-word">{open ? s.close : s.menu}</span>
            <span className="burger" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>

        <div className="drawer" id="mobile-menu" aria-hidden={!open}>
          <div className="drawer-in">
            <nav aria-label={s.mobileNav}>
              {LINKS.map(([id, tilt], index) => (
                <button
                  key={id}
                  type="button"
                  tabIndex={open ? 0 : -1}
                  aria-current={page === id ? "page" : undefined}
                  style={{ "--i": index, "--tilt": `${tilt}deg` } as CSSProperties}
                  onClick={() => go(id)}
                >
                  <small>0{index + 1}</small>
                  <span className="drawer-link-word">
                    <span className="drawer-gun" aria-hidden="true">
                      <span className="gun-paper" />
                    </span>
                    {s.nav[id]}
                  </span>
                  {page === id && <em>{s.here}</em>}
                </button>
              ))}
            </nav>
            <button
              className="cta drawer-ticket"
              type="button"
              tabIndex={open ? 0 : -1}
              data-torn={torn || undefined}
              style={{ "--i": LINKS.length } as CSSProperties}
              onClick={takeNumber}
            >
              <span className="sr-only">{s.contact}</span>
              <span className="cta-box" aria-hidden="true">
                <small>{s.nowServing}</small>
                <span className="cta-led">
                  <b>{s.you}</b>
                </span>
              </span>
              <span className="cta-ticket" key={`m-${ticket}`} aria-hidden="true">
                <span className="cta-stub">
                  <span className="cta-slide">
                    <TicketArt />
                  </span>
                </span>
                <span className="cta-tear">
                  <span className="cta-slide">
                    <TicketArt />
                    <span className="cta-copy">
                      <span className="cta-word">{s.contact}</span>
                    </span>
                  </span>
                </span>
              </span>
            </button>
            <LangSwitch variant="list" tabIndex={open ? 0 : -1} />
            <p className="drawer-foot" style={{ "--i": LINKS.length + 1 } as CSSProperties}>
              {s.foot}
            </p>
          </div>
        </div>
      </div>

      {!noticeDismissed && (
        <div className="hd-notice" role="region" aria-label={ns.badge}>
          <span className="hn-pill">
            <i aria-hidden="true" />
            {ns.storeDates}
          </span>
          <span className="hn-text">{ns.message}</span>
          <button
            type="button"
            className="hn-cta"
            onClick={() => {
              if (page === "stores") {
                document.querySelector(".finder-map")?.scrollIntoView({ behavior: "smooth", block: "center" });
              } else {
                go("stores");
              }
            }}
          >
            <svg className="hn-pin" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <span>{ns.findStores}</span>
            <svg className="hn-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            className="hn-close"
            aria-label={ns.dismiss}
            onClick={() => setNoticeDismissed(true)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="scrim" aria-hidden="true" onClick={() => setOpen(false)} />
    </header>
  );
}
