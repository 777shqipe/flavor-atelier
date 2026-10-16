import { useEffect, useRef, type ReactNode } from "react";
import { useT } from "./i18n";
import { logoStrings } from "./i18n/strings/Logo";

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

const WORDS: Array<[string, ReactNode]> = [
  [
    "C",
    <>
      HE
      {/* Every so often this A turns into a blinking pixel heart for a moment. */}
      <span className="logo-a">
        A<i className="logo-a-heart" />
      </span>
      PER
    </>,
  ],
  ["B", "UY"],
  ["M", "ILES"],
];

/**
 * The wordmark, printed on the header's e-paper screen with a barcode under it.
 * The name folds to its initials (CBM) once the header is stuck. The screen
 * itself (housing, refresh flicker) belongs to the header.
 */
export function Logo({ onClick }: { onClick?: () => void }) {
  const s = useT(logoStrings);
  const word = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = word.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let off = 0;
    const love = () => {
      if (!document.hidden) {
        el.dataset.love = "";
        off = window.setTimeout(() => delete el.dataset.love, 1300);
      }
      timer = window.setTimeout(love, 8000 + Math.random() * 12000);
    };
    timer = window.setTimeout(love, 3000 + Math.random() * 7000);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(off);
      delete el.dataset.love;
    };
  }, []);

  return (
    <button className="logo" type="button" onClick={onClick} aria-label={s.home}>
      <span className="logo-word" ref={word} aria-hidden="true">
        {WORDS.map(([first, rest]) => (
          <span key={first}>
            {first}
            <span className="logo-rest">{rest}</span>
          </span>
        ))}
      </span>
      <i className="logo-code" aria-hidden="true" />
    </button>
  );
}
