import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { headerStrings } from "./i18n/strings/Header";
import { topNoticeStrings } from "./i18n/strings/TopNotice";
import { useT } from "./i18n";
import { LangSwitch } from "./LangSwitch";
import { Logo } from "./Logo";
import "./header.css";

export type Page = "home" | "stores" | "about";

const LINKS: Page[] = ["home", "stores", "about"];


/** Label whose letters roll up one after another on hover. */
function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((char, i) => {
        const glyph = char === " " ? "\u00a0" : char;
        return (
          <span key={i} className="roll-ch" data-c={glyph} style={{ "--i": i } as CSSProperties}>
            {glyph}
          </span>
        );
      })}
    </span>
  );
}

function Arrow() {
  return (
    <svg className="cta-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
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
  // The CTA blinks its call before the contact sheet opens.
  const [calling, setCalling] = useState(false);
  const callTimer = useRef(0);
  const screen = useRef<HTMLDivElement>(null);
  const press = useRef<HTMLElement>(null);

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

  // E-paper refresh: the whole panel flickers black and white, fills with
  // blinking hearts and the motto, then redraws. Once on every page change,
  // then every 5–10s on its own.
  useEffect(() => {
    const el = screen.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const flash = () => {
      if (!document.hidden) {
        delete el.dataset.flash;
        void el.offsetWidth;
        el.dataset.flash = "";
      }
      timer = window.setTimeout(flash, 5000 + Math.random() * 5000);
    };
    timer = window.setTimeout(flash, 450);
    return () => {
      window.clearTimeout(timer);
      delete el.dataset.flash;
    };
  }, [page]);

  useEffect(() => () => window.clearTimeout(callTimer.current), []);

  // Pressure bloom: the dark smudge a finger leaves on a pressed LCD, following
  // the pointer. Moved with translate only, at most once a frame.
  const rect = useRef<DOMRect | null>(null);
  const frame = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const place = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!rect.current) rect.current = event.currentTarget.getBoundingClientRect();
    point.current = { x: event.clientX - rect.current.left, y: event.clientY - rect.current.top };
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = press.current;
      if (el) el.style.translate = `${point.current.x}px ${point.current.y}px`;
    });
  };
  const release = (event: ReactPointerEvent<HTMLDivElement>) => {
    delete event.currentTarget.dataset.press;
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const go = (next: Page) => {
    setOpen(false);
    setPeek(false);
    onNavigate(next);
  };
  const call = () => {
    if (calling) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpen(false);
      onContact();
      return;
    }
    setCalling(true);
    callTimer.current = window.setTimeout(() => {
      setOpen(false);
      onContact();
      setCalling(false);
    }, 380);
  };

  return (
    <header className="hd" data-stuck={stuck || undefined} data-open={open || undefined} data-peek={peek || undefined}>
      {/* One electronic shelf label: light plastic housing round a single e-paper screen. */}
      <div className="bar">
        <div
          className="scr"
          ref={screen}
          onPointerEnter={(event) => {
            rect.current = event.currentTarget.getBoundingClientRect();
            place(event);
          }}
          onPointerMove={place}
          onPointerDown={(event) => {
            rect.current = event.currentTarget.getBoundingClientRect();
            place(event);
            event.currentTarget.dataset.press = "";
          }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onTransitionEnd={(event) => {
            // The screen changes size as it folds and opens; measure again next time.
            if (event.target === event.currentTarget) rect.current = null;
          }}
        >
          <div className="bar-row">
            <Logo onClick={() => go("home")} />

            {/* Scrolled down, this folds away and the label is just the initials. */}
            <div className="bar-more">
              <div className="bar-more-in">
                <nav className="nav" aria-label={s.mainNav}>
                  {LINKS.map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={s.nav[id]}
                      aria-current={page === id ? "page" : undefined}
                      onClick={() => go(id)}
                    >
                      <Roll text={s.nav[id]} />
                    </button>
                  ))}
                </nav>

                {/* The red-ink promo box of the label. */}
                <button className="cta" type="button" data-calling={calling || undefined} onClick={call}>
                  <span className="sr-only">{s.contact}</span>
                  <span className="cta-word" aria-hidden="true">
                    {s.contact}
                  </span>
                  <Arrow />
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
                {LINKS.map((id, index) => (
                  <button
                    key={id}
                    type="button"
                    tabIndex={open ? 0 : -1}
                    aria-current={page === id ? "page" : undefined}
                    style={{ "--i": index } as CSSProperties}
                    onClick={() => go(id)}
                  >
                    <small>0{index + 1}</small>
                    <span className="drawer-link-word">{s.nav[id]}</span>
                    {page === id && <em>{s.here}</em>}
                  </button>
                ))}
              </nav>
              <button
                className="cta drawer-cta"
                type="button"
                tabIndex={open ? 0 : -1}
                data-calling={calling || undefined}
                style={{ "--i": LINKS.length } as CSSProperties}
                onClick={call}
              >
                <span className="sr-only">{s.contact}</span>
                <span className="cta-word" aria-hidden="true">
                  {s.contact}
                </span>
                <Arrow />
              </button>
              <LangSwitch variant="list" tabIndex={open ? 0 : -1} />
              <p className="drawer-foot" style={{ "--i": LINKS.length + 1 } as CSSProperties}>
                {s.foot}
              </p>
            </div>
          </div>

          {/* Effects over the print, clipped to the screen: paper tooth, the
              pressure bloom, the glass glare and the refresh frames with hearts. */}
          <span className="scr-fx" aria-hidden="true">
            <i className="scr-press" ref={press} />
            <i className="scr-glare" />
            <i className="scr-paper" />
            <i className="scr-ink" />
            <i className="scr-hearts">
              <span className="scr-motto">
                <i className="scr-beat" />
                more taste less waste
                <i className="scr-beat" />
              </span>
            </i>
          </span>
        </div>
        <i className="esl-led" aria-hidden="true" />
      </div>

      {!noticeDismissed && (
        <div className="hd-notice" role="region" aria-label={ns.badge}>
          <span className="hn-pill">
            <i aria-hidden="true" />
            <span>{ns.storeDates}</span>
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
