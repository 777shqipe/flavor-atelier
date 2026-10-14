import { useEffect, useRef } from "react";

/** Cart-in-a-circle mark, as on the shop signs in the illustrations. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="24" fill="var(--logo-bg, currentColor)" />
      <g fill="none" stroke="var(--logo-fg, #fff)" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.5 14.5h4.3l3.2 14.6a1.7 1.7 0 0 0 1.7 1.3h12.2a1.7 1.7 0 0 0 1.7-1.3l2.4-10.4H17.2" />
      </g>
      <g className="logo-wheels">
        <circle cx="21.8" cy="35.4" r="2" fill="var(--logo-fg, #fff)" />
        <circle cx="32.6" cy="35.4" r="2" fill="var(--logo-fg, #fff)" />
      </g>
    </svg>
  );
}

const WORDS = [
  ["C", "HEAPER"],
  ["B", "UY"],
  ["M", "ILES"],
] as const;

/**
 * The wordmark printed on an electronic shelf label: light plastic housing, an
 * e-paper screen with a red promo block, a barcode and a status LED. The name
 * folds to its initials (CBM) once the header is stuck, and the panel does an
 * e-paper refresh on every page change and then every 5–10s on its own.
 */
export function Logo({ onClick, refreshKey }: { onClick?: () => void; refreshKey?: unknown }) {
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = label.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const flash = () => {
      delete el.dataset.flash;
      void el.offsetWidth;
      el.dataset.flash = "";
      timer = window.setTimeout(flash, 5000 + Math.random() * 5000);
    };
    timer = window.setTimeout(flash, 450);
    return () => {
      window.clearTimeout(timer);
      delete el.dataset.flash;
    };
  }, [refreshKey]);

  return (
    <button className="logo" type="button" onClick={onClick} aria-label="Cheaper Buy Miles, home">
      <span className="esl" ref={label} aria-hidden="true">
        <span className="esl-screen">
          <i className="esl-flag">
            <svg viewBox="0 0 24 24">
              <g className="esl-cart">
                <path d="M3 5h2.4l1.9 9.2a1 1 0 0 0 1 .8h7.6a1 1 0 0 0 1-.8L18.4 9H6.2" />
                <circle cx="9.4" cy="18.6" r="1.25" />
                <circle cx="15.6" cy="18.6" r="1.25" />
              </g>
              {/* Easter egg: each refresh redraws a heart for a moment before the cart comes back. */}
              <path className="esl-heart" d="M12 19.6s-7.9-4.7-7.9-10.7A4.3 4.3 0 0 1 12 6.2a4.3 4.3 0 0 1 7.9 2.7c0 6-7.9 10.7-7.9 10.7z" />
            </svg>
          </i>
          <span className="logo-word">
            {WORDS.map(([first, rest]) => (
              <span key={first}>
                {first}
                <span className="logo-rest">{rest}</span>
              </span>
            ))}
          </span>
          <i className="esl-code" />
        </span>
        <i className="esl-led" />
      </span>
    </button>
  );
}
